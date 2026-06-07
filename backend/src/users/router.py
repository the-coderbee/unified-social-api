from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import RateLimiter, get_current_user
from src.core.database import get_db
from src.core.security import revoke_refresh_token, verify_password, create_access_token, create_refresh_token, get_user_from_refresh_token
from src.users.models import User
from src.users.schemas import UserCreate, UserResponse, RefreshTokenRequest
from src.users.repository import get_user_by_email, create_user


router = APIRouter(tags=['Users'], dependencies=[Depends(RateLimiter(max_requests=30, window_seconds=60))])


@router.post("/register", dependencies=[Depends(RateLimiter(max_requests=5, window_seconds=60))], response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    try:
        new_user = await create_user(db, user_in)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while registering the user"
        )

@router.post("/login", dependencies=[Depends(RateLimiter(max_requests=5, window_seconds=60))])
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Authenticates a user and returns a JSON Web Token."""
    user = await get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = await create_refresh_token(user_id=str(user.id))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", dependencies=[Depends(RateLimiter(max_requests=5, window_seconds=60))])
async def refresh_token(token_request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    user_id = await get_user_from_refresh_token(token_request.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    try:
        access_token = create_access_token(subject=user_id)
        new_refresh_token = await create_refresh_token(user_id=user_id)
        await revoke_refresh_token(token_request.refresh_token)
        return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while refreshing the token"
        )

@router.post("/logout", dependencies=[Depends(RateLimiter(max_requests=5, window_seconds=60))])
async def logout(token_request: RefreshTokenRequest):
    """Logs out the user by revoking the refresh token."""
    try:
        await revoke_refresh_token(token_request.refresh_token)
        return {"detail": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while logging out"
        )

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
