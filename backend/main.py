import json
import os
from pathlib import Path
from datetime import timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 匯入認證相關函式
from auth import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token,
    require_role,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="NYCU EE Lab API", version="1.0.0")

# CORS 設定 - 開發環境允許所有來源，生產環境應限制為實際網域
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 資料模型 ===
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# === 使用者資料庫（示範用，實際應使用真實資料庫）===
# 注意：這只是示範，生產環境請使用資料庫儲存使用者資料
# 儲存明文密碼，僅用於開發環境示範，生產環境請使用已雜湊的密碼
USERS_DB = {
    "admin": {
        "username": "admin",
        "password": "admin123",  # 預設密碼，請務必修改
        "role": "admin",
        "email": "admin@nycu.edu.tw"
    },
    # 可以加入更多使用者
}

def authenticate_user(username: str, password: str):
    """驗證使用者帳號密碼"""
    user = USERS_DB.get(username)
    if not user:
        return False
    # 簡單的明文密碼比對（僅用於開發環境示範）
    # 生產環境應使用 verify_password(password, user["hashed_password"])
    if password != user["password"]:
        return False
    return user

def get_latest_professor_data():
    """
    從 backend/data/NewData.json 載入教授資料
    所有資料都從後端 API 提供，前端不直接讀取檔案
    """

    data_file_path = Path(__file__).parent / "data" / "NewData.json"

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
async def login(request: LoginRequest):
    """
    使用者登入 endpoint

    Args:
        request: 包含 username 和 password 的登入請求

    Returns:
        LoginResponse: 包含 access_token 和過期時間

    Raises:
        HTTPException: 如果帳號或密碼錯誤
    """
    user = authenticate_user(request.username, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 建立 access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # 轉換為秒數
    }

@app.get("/api/auth/me")
async def get_current_user(token_data: dict = Depends(verify_token)):
    """
    獲取當前登入使用者資訊

    Args:
        token_data: 從 token 解析出的使用者資料

    Returns:
        使用者資訊（不包含密碼）
    """
    username = token_data.get("sub")
    user = USERS_DB.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 回傳使用者資訊，但不包含密碼
    return {
        "username": user["username"],
        "role": user["role"],
        "email": user.get("email", "")
    }

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