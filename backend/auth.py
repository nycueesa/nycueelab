from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# 配置
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-use-at-least-32-characters")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 密碼加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# 驗證密碼
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證明文密碼與雜湊密碼是否相符"""
    return pwd_context.verify(plain_password, hashed_password)

# 雜湊密碼
def get_password_hash(password: str) -> str:
    """將明文密碼雜湊化"""
    return pwd_context.hash(password)

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
