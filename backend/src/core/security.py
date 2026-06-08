from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext
import secrets

from src.core.config import settings
from src.core.redis import redis_client


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

async def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    if not expires_delta:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    token = secrets.token_urlsafe(32)
    key = f"refresh_token:{token}"
    await redis_client.setex(key, int(expires_delta.total_seconds()), user_id)
    return token

async def get_user_from_refresh_token(token: str) -> Optional[str]:
    return await redis_client.get(f"refresh_token:{token}")

async def revoke_refresh_token(token: str):
    await redis_client.delete(f"refresh_token:{token}")