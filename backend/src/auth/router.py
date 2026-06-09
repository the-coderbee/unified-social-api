import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.models import AuthValues
from src.core.database import get_db
from src.core.redis import redis_client
from src.core.security import revoke_refresh_token, verify_password, create_access_token, create_refresh_token, get_user_from_refresh_token
from src.api.dependencies import RateLimiter
from src.users.schemas import UserResponse
from src.auth.schemas import GoogleUserCreate, GithubUserCreate, UserCreate, RefreshTokenRequest
from src.users.repository import get_user_by_email, create_user
from src.auth.oauth2.google import GoogleAuthProvider
from src.auth.oauth2.github import GithubAuthProvider 


router = APIRouter(tags=['Authentication'], dependencies=[Depends(RateLimiter(max_requests=5, window_seconds=60))])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
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

@router.post("/login")
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


@router.post("/refresh")
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

@router.post("/logout")
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

@router.get("/google/login")
async def google_oauth_login():
    """Initialize Google OAuth2 flow."""
    google_provider = GoogleAuthProvider()
    state = secrets.token_urlsafe(32)
    await redis_client.setex(f"google_oauth_state:{state}", 300, "valid")
    
    authorization_url = await google_provider.get_authorization_url(state)
    return {"authorization_url": authorization_url, "state": state}
    

@router.get("/google/callback")
async def google_oauth_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth2 callback."""
    stored_state = await redis_client.get(f"google_oauth_state:{state}")
    
    if not stored_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state parameter"
        )
    
    await redis_client.delete(f"google_oauth_state:{state}")
    
    google_provider = GoogleAuthProvider()
    user_info = await google_provider.exchange_code_for_token(code)
    email = user_info.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve email from Google"
        )
    
    user = await get_user_by_email(db, email)
    
    if user and user.auth_provider != AuthValues.GOOGLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered with a different authentication provider."
        )
    try:
        if not user:
            user_in = GoogleUserCreate(email=email, auth_provider=AuthValues.GOOGLE)
            user = await create_user(db, user_in)
            await db.commit()
        
        await db.refresh(user)
        access_token = create_access_token(subject=user.id)
        refresh_token = await create_refresh_token(user_id=str(user.id))
        
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during Google OAuth2 authentication"
        )

@router.get("/github/login")
async def github_oauth_login():
    github_provider = GithubAuthProvider()
    state = secrets.token_urlsafe(32)
    
    authorization_url = await github_provider.get_authorization_url(state)
    
    return {"authorization_url": authorization_url, "state": state}


@router.get("/github/callback")
async def github_oauth_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    github_provider = GithubAuthProvider()
    
    token_exchange_response = await github_provider.exchange_code_for_token(code, state)
    github_access_token = token_exchange_response.get("access_token")
    user_info = await github_provider.get_user_info(github_access_token)
    email = user_info.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve email from github."
        )
    
    user = await get_user_by_email(db, email)
    
    if user and user.auth_provider != AuthValues.GITHUB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered with a different authentication provider."
        )
    
    try:
        if not user:
            user_in = GithubUserCreate(email=email, auth_provider=AuthValues.GITHUB)
            user = await create_user(db, user_in)
            await db.commit()
        
        await db.refresh(user)
        access_token = create_access_token(subject=user.id)
        refresh_token = await create_refresh_token(user_id=str(user.id))
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during Github OAuth2 authentication"
        )
            