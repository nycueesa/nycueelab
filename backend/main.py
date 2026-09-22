import json
import os
import stat
import tempfile
from pathlib import Path
from datetime import timedelta
from contextlib import asynccontextmanager
from threading import Lock
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from database import init_database, find_user

PROFESSOR_DATA_PATH = Path(os.getenv("PROFESSOR_DATA_PATH", str(Path(__file__).parent / "NewData.json")))
professor_data_lock = Lock()

# 匯入認證相關函式
from auth import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token,
    require_role,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

@asynccontextmanager
async def lifespan(app):
    init_database()
    yield


app = FastAPI(title="NYCU EE Lab API", version="1.0.0", lifespan=lifespan)

# Same-origin Vite/Nginx proxy is the default. Explicit origins support direct API access.
origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5577").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 教授照片靜態檔案路由
app.mount("/api/photo", StaticFiles(directory=Path(__file__).parent / "photo"), name="photo")

# === 資料模型 ===
class LoginRequest(BaseModel):
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=1, max_length=1024)

class UserResponse(BaseModel):
    email: str
    username: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class ProfessorStateUpdate(BaseModel):
    state: str = Field(min_length=1, max_length=40)

# Unknown accounts also perform a password hash comparison.
DUMMY_PASSWORD_HASH = get_password_hash("unused-account-timing-placeholder")


def authenticate_user(email: str, password: str):
    user = find_user(email)
    matches = verify_password(password, user["password_hash"] if user else DUMMY_PASSWORD_HASH)
    return user if user and matches else None


def public_user(user):
    return {"email": user["email"], "username": user["email"], "role": user["role"]}


def get_latest_professor_data():
    """
    從 backend/data/NewData.json 載入教授資料
    所有資料都從後端 API 提供，前端不直接讀取檔案
    """

    data_file_path = PROFESSOR_DATA_PATH

    if not data_file_path.is_file():
        raise HTTPException(
            status_code=500,
            detail="未在 backend/data/ 中找到 NewData.json，請檢查是否存在此文件"
        )

    try:
        with open(data_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Error decoding professor data file."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {e}"
        )
    
# === 認證相關 API ===

@app.post("/api/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """
    使用者登入 endpoint

    Args:
        request: 包含 email 和 password 的登入請求

    Returns:
        LoginResponse: 包含 access_token 和過期時間

    Raises:
        HTTPException: 如果帳號或密碼錯誤
    """
    user = authenticate_user(str(request.email), request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="電子郵件或密碼不正確",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 建立 access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": public_user(user)
    }

@app.get("/api/auth/me")
def get_current_user(token_data: dict = Depends(verify_token)):
    """
    獲取當前登入使用者資訊

    Args:
        token_data: 從 token 解析出的使用者資料

    Returns:
        使用者資訊（不包含密碼）
    """
    username = token_data.get("sub")
    user = find_user(username)
    if not user:
        raise HTTPException(status_code=401, detail="登入已失效，請重新登入")

    return public_user(user)


@app.get("/api/manage/professors")
def read_managed_professors(user: dict = Depends(get_current_user)):
    """只讓已登入使用者讀取狀態管理頁所需的完整資料。"""
    return get_latest_professor_data()


@app.patch("/api/manage/professors/{professor_id}/state")
def update_professor_state(
    professor_id: int,
    update: ProfessorStateUpdate,
    user: dict = Depends(get_current_user),
):
    """更新單一教授狀態，並將結果安全寫回 NewData.json。"""
    with professor_data_lock:
        data = get_latest_professor_data()
        allowed_states = data.get("topics", {}).get("states", [])
        if update.state not in allowed_states:
            raise HTTPException(status_code=422, detail="無效的教授狀態")

        professor = next(
            (item for item in data.get("professors", []) if item.get("id") == professor_id),
            None,
        )
        if professor is None:
            raise HTTPException(status_code=404, detail="找不到教授")
        professor["state"] = update.state

        temporary_path = None
        try:
            original_stat = PROFESSOR_DATA_PATH.stat()
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=PROFESSOR_DATA_PATH.parent,
                prefix=".NewData-", suffix=".json", delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                json.dump(data, temporary_file, ensure_ascii=False, indent=2)
                temporary_file.write("\n")
                temporary_file.flush()
                os.fchmod(temporary_file.fileno(), stat.S_IMODE(original_stat.st_mode))
                if (original_stat.st_uid, original_stat.st_gid) != (os.geteuid(), os.getegid()):
                    os.fchown(temporary_file.fileno(), original_stat.st_uid, original_stat.st_gid)
                os.fsync(temporary_file.fileno())
            os.replace(temporary_path, PROFESSOR_DATA_PATH)
        except OSError:
            raise HTTPException(status_code=500, detail="儲存狀態失敗，請稍後重試")
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    return {"id": professor_id, "state": update.state}

# === 公開 API（不需認證）===

@app.get("/api/data")
def read_data():
    """
    獲取完整的資料檔案內容（公開 API，不需認證）

    如果需要保護此 API，請加上: token_data: dict = Depends(verify_token)
    """
    return get_latest_professor_data()

@app.get("/api/professors")
def read_all_professors():
    """
    獲取所有教授資訊（公開 API，不需認證）

    如果需要保護此 API，請加上: token_data: dict = Depends(verify_token)
    """
    return get_latest_professor_data()

@app.get("/api/professors/id={id}")
def read_professors_byID(id: int):
    """
    獲取對應 id 的教授資訊（公開 API，不需認證）

    Args:
        id: 教授 ID

    Returns:
        教授詳細資訊

    Raises:
        HTTPException: 如果找不到對應的教授
    """
    data = get_latest_professor_data()
    target_professor = None
    for person in data['professors']:
        if person['id'] == id:
            target_professor = person
            break

    if target_professor is None:
        raise HTTPException(status_code=404, detail=f"找不到 ID 為 {id} 的教授")

    return target_professor

# === 受保護的 API 範例（需要認證）===
# 以下是示範如何保護 API 的範例，可根據需求啟用

# @app.put("/api/professors/id={id}")
# async def update_professor(
#     id: int,
#     updated_data: dict,
#     token_data: dict = Depends(require_role("admin"))
# ):
#     """更新教授資訊（僅限管理員）"""
#     # 實作更新邏輯
#     pass

# @app.delete("/api/professors/id={id}")
# async def delete_professor(
#     id: int,
#     token_data: dict = Depends(require_role("admin"))
# ):
#     """刪除教授資訊（僅限管理員）"""
#     # 實作刪除邏輯
#     pass

# === 系統狀態 API ===

@app.get("/")
def read_root():
    """API 根目錄，回傳系統狀態"""
    return {
        "status": "API is running",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
def health_check():
    """健康檢查 endpoint（用於監控系統）"""
    return {
        "status": "healthy",
        "timestamp": "2025-01-01T00:00:00Z"
    }
