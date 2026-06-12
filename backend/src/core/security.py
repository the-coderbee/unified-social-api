"""
Core security utilities for authentication.

Handles password hashing with Argon2, JWT access token generation, 
and refresh token management via Redis for multi-session support.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

import jwt
import secrets
import hashlib
from passlib.context import CryptContext

from src.core.config import settings
from src.core.redis import redis_client


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password with hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a plain text password using Argon2."""
    return pwd_context.hash(password)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create access token using jwt encode.
    
    Args:
        subject: The user ID to encode as the token subject (sub claim).
        expires_delta: Custom expiry duration. Defaults to ACCESS_TOKEN_EXPIRE_MINUTES.
    
    Returns:
        A string of encoded jwt.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

async def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a refresh token in redis.
    Uses secrets to create a 32-bytes url safe token.
    The method allows handling multiple sessions per user by using the token as the key instead of the user_id.
    
    Args:
        user_id: The user's id to be used as identifier for the refresh token.
        expires_delta: The timedelata representing the expiration time of the token.
    
    Returns:
        The generated refresh token string.
    """
    
    if not expires_delta:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    token = secrets.token_urlsafe(32)
    key = f"refresh_token:{token}"
    await redis_client.setex(key, int(expires_delta.total_seconds()), user_id)
    return token

async def get_user_from_refresh_token(token: str) -> Optional[str]:
    """
    Fetch the user ID associated with a refresh token from Redis.
    
    Returns:
        The user ID string if token exists, None if expired or invalid.
    """
    return await redis_client.get(f"refresh_token:{token}")

async def revoke_refresh_token(token: str):
    """Revoke a refresh token."""
    await redis_client.delete(f"refresh_token:{token}")
    

def hash_api_key(api_key: str) -> str:
    """Hash API Key."""
    return hashlib.sha256(api_key.encode()).digest().hex()

def generate_api_key_and_hash() -> Tuple[str, str, str]:
    """Generates an API Key and returns the key, prefix and its hash."""
    token = secrets.token_urlsafe(32)
    
    api_key = f"usa_{token}"
    api_key_prefix = api_key[:12]
    hashed_key = hash_api_key(api_key)
    
    return api_key, api_key_prefix, hashed_key
