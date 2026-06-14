"""
FastAPI dependency for authentication and rate limiting.

Provides get_current_user dependency for JWT validation and RateLimiter
class for sliding window rate limiting using redis sorted sets.
"""

import time
import uuid
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.api_keys.repository import get_api_key_by_hash
from src.core.config import settings
from src.core.database import get_db
from src.core.redis import redis_client
from src.core.security import hash_api_key
from src.users.models import User
from src.users.repository import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def _get_current_user_from_api_key(
    api_key: str, db: AsyncSession
) -> Optional[User]:
    """
    Get current user using api key.

    Args:
        api_key: The api key obtained from the request header.
        db: The current active database session.

    Returns:
        A user if the api key is valid, None otherwise.
    """

    api_hash = hash_api_key(api_key)
    cached_user_id = await redis_client.get(f"api_key_cache:{api_hash}")
    if cached_user_id:
        return await get_user_by_id(db=db, user_id=uuid.UUID(str(cached_user_id)))

    api_key_obj = await get_api_key_by_hash(db=db, hashed_key=api_hash)
    if not api_key_obj:
        return None

    user_id = api_key_obj.user_id
    await redis_client.setex(f"api_key_cache:{api_hash}", 900, str(user_id))
    return await get_user_by_id(db=db, user_id=user_id)


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    A dependency method used to fetch user before authentication protected routes are allowed to access.

    Args:
        request: The request object.
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
        api_key = request.headers.get("X-API-Key")
        if api_key:
            user = await _get_current_user_from_api_key(api_key=api_key, db=db)
            if user:
                return user
            raise credentials_exception
        if token:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )

            user_id_payload: Optional[str] = payload.get("sub")
            if user_id_payload:
                user = await get_user_by_id(db, uuid.UUID(user_id_payload))
                if user:
                    return user
            raise credentials_exception
        else:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise credentials_exception
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occured.",
        )


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

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request):
        host = request.client.host if request.client else "unknown"
        user_id = None
        try:
            payload = jwt.decode(
                request.headers.get("Authorization", "").replace("Bearer ", ""),
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
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
                detail="Too many requests, please try again later.",
            )
