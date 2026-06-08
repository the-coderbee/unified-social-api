import secrets
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.social_accounts.schemas import SocialAccountResponse, SocialLinkRequest
from src.users.models import User
from src.api.dependencies import get_current_user
from src.social_accounts.repository import link_social_account, get_social_accounts, unlink_social_account
from backend.src.social_accounts.services import get_platform_instance

router = APIRouter(tags=["Social Accounts"])

@router.get("/login/{platform_name}")
async def get_login_url(platform_name: str):
    platform = get_platform_instance(platform_name)
    if not platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platform is not supported")
    
    secure_state = secrets.token_urlsafe(16)
    
    auth_url = await platform.get_login_url(secure_state)
    return {"auth_url": auth_url}

@router.get("/{platform_name}/callback")
async def callback(platform_name: str, code: str, state: str, db: AsyncSession = Depends(get_db)):
    platform = get_platform_instance(platform_name)
    
    try:
        token_data = await platform.exchange_code_for_token(code)
        
        user_result = await db.execute(select(User).limit(1))
        current_user = user_result.scalar_one_or_none()
        
        if not current_user:
            current_user = User(email="dev@unifiedapi.com", hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96y3rNrwDTU789C0p74K5048cG")  # Replace with actual hashed password
            db.add(current_user)
            await db.flush()
        
        saved_account = await link_social_account(
            db=db,
            user_id=current_user.id,
            platform_name=platform.platform_name,
            provider_account_id=token_data["provider_account_id"],
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            expires_in=token_data.get("expires_in", 0)
        )
        
        await db.commit()
        
        return {
            "status": "success",
            "message": f"Successfully authenticated with {platform_name.capitalize()}!",
            "internal_account_id": saved_account.id
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"OAuth exchange failed: {str(e)}")

@router.post("/{platform_name}/link")
async def link_account(
    platform_name: str,
    payload: SocialLinkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    platform = get_platform_instance(platform_name)
    
    try:
        token_data = await platform.exchange_code_for_token(payload.code, payload.state)
        
        profile_data = await platform.fetch_user_profile(token_data["access_token"])

        saved_account = await link_social_account(
            db=db,
            user_id=current_user.id,
            platform_name=platform.platform_name,
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            expires_in=token_data.get("expires_in", 0),
            provider_account_id=profile_data.get("provider_account_id"),
            username=profile_data.get("username"),
            global_name=profile_data.get("global_name"),
            avatar_url=profile_data.get("avatar_url")
        )
        
        await db.commit()
        
        return {
            "status": "success",
            "message": f"Successfully linked {platform_name.capitalize()} to {current_user.email}!",
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth exchange failed: {str(e)}"
        )


@router.get("/accounts", response_model=List[SocialAccountResponse])
async def list_linked_accounts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_social_accounts(db, current_user.id)


@router.delete("/{platform_name}/unlink", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_account(platform_name: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await unlink_social_account(db, platform_name, current_user.id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Account not found: {platform_name}")
    
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to unlink account: {str(e)}")
