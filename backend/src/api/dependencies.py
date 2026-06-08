import time
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
import jwt

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import get_db
from src.users.models import User
from src.users.repository import get_user_by_id
from src.core.redis import redis_client


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
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
            