"""
FastAPI dependency for authentication and rate limiting.

Provides get_current_user dependency for JWT validation and RateLimiter 
class for sliding window rate limiting using redis sorted sets.
"""

import time
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import get_db
from src.core.redis import redis_client
from src.users.models import User
from src.users.repository import get_user_by_id


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """
    A dependency method used to fetch user before authentication protected routes are allowed to access.
    
    Args:
        token: The access token from the request header for user verification.
        db: The get db dependency injection which provided db sessions for each endpoint.
    
    Returns:
        Returns the valid user object.
    
    Raises:
        HTTPException 401: If token is missing, expired, or invalid.
        HTTPException 401: If user no longer exists in the database.
    """
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
        
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = await get_user_by_id(db, user_id)
    
    if user is None:
        raise credentials_exception
    
    return user


class RateLimiter:
    """
    Sliding window rate limiter using Redis sorted sets.
    
    Tracks requests per authenticated user (by User ID) or anonymous user (by IP addresses) within rolling time window.
    
    Args:
        max_requests: Maximum number of requests allowed within the time window.
        window_seconds: Duration of the sliding window in seconds.
    
    Raises:
        HTTPException 429: When request count exceeds the max_requests.
    """
    
    def __init__(self, max_requests: int, window_seconds:int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
    
    async def __call__(self, request: Request):
        host = request.client.host
        user_id = None
        try:
            payload = jwt.decode(
                request.headers.get("Authorization", "").replace("Bearer ", ""),
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            user_id: Optional[str] = payload.get("sub")
        except jwt.InvalidTokenError:
            pass
        
        if user_id:
            key = f"rate_limit:user:{user_id}"
        else:
            key = f"rate_limit:{host}"
        
        current_time = time.time()
        window_start = current_time - self.window_seconds
        
        await redis_client.zadd(key, {str(current_time): current_time})
        await redis_client.zremrangebyscore(key, 0, window_start)
        request_count = await redis_client.zcard(key)
        await redis_client.expire(key, self.window_seconds)
        
        if request_count > self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests, please try again later."
            )
