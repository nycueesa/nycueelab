from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
import hmac
import secrets
from pathlib import Path
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# 配置
def load_secret_key():
    configured = os.getenv("SECRET_KEY")
    if configured:
        if len(configured) < 32:
            raise RuntimeError("SECRET_KEY must contain at least 32 characters")
        return configured
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError("SECRET_KEY is required in production")
    # Persist a random development secret so local sessions survive server restarts.
    path = Path(__file__).parent / "storage" / ".jwt-secret"
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        return path.read_text().strip()
    with os.fdopen(descriptor, "w") as handle:
        secret = secrets.token_urlsafe(48)
        handle.write(secret)
    return secret


SECRET_KEY = load_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 密碼加密
PASSWORD_ITERATIONS = 600_000
security = HTTPBearer(auto_error=False)

# 驗證密碼
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證明文密碼與雜湊密碼是否相符"""
    try:
        algorithm, iterations, salt, expected = hashed_password.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), bytes.fromhex(salt), int(iterations))
        return hmac.compare_digest(actual.hex(), expected)
    except (ValueError, TypeError):
        return False

# 雜湊密碼
def get_password_hash(password: str) -> str:
    """將明文密碼雜湊化"""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"

# 建立 access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    建立 JWT access token

    Args:
        data: 要編碼到 token 中的資料（通常包含 username 和 role）
        expires_delta: token 過期時間

    Returns:
        編碼後的 JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 驗證 token
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    驗證 JWT token 的有效性

    Args:
        credentials: HTTP Authorization header 中的 Bearer token

    Returns:
        解碼後的 token payload

    Raises:
        HTTPException: 如果 token 無效或過期
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="請先登入", headers={"WWW-Authenticate": "Bearer"})
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# 角色權限檢查
def require_role(required_role: str):
    """
    裝飾器：檢查使用者是否有特定角色權限

    Args:
        required_role: 需要的角色（例如 "admin"）

    Returns:
        權限檢查函式
    """
    def role_checker(token_data: dict = Depends(verify_token)):
        user_role = token_data.get("role")
        if user_role != required_role and required_role != "any":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return token_data
    return role_checker
