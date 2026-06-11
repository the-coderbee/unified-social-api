"""
Service logics for social platforms.

Handles parsing platform instance from string, and method 
for obtaining valid access token from the desired platforms.
"""

from typing import Dict
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.social_accounts.platforms.base import SocialPlatform
from src.social_accounts.platforms.x import XPlatform
from src.social_accounts.models import SocialAccount
from src.social_accounts.platforms.discord import DiscordPlatform
from src.social_accounts.repository import update_social_account_tokens

# Dictionary containing all the platform instances for faster access.
PLATFORMS: Dict[str, SocialPlatform] = {
    "discord": DiscordPlatform(),
    "x": XPlatform(),
}

def get_platform_instance(platform_name: str) -> SocialPlatform:
    """
    Fetch a platform instance using a platform name.
    
    Args:
        platform_name: The string representing the platform name.
    
    Returns:
        A SocialPlatform instance of the requested platform.
        
    Raises:
        HTTPException 404: If the requested platform is unsupported.
    """
    
    platform = PLATFORMS.get(platform_name)
    if not platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unsupported platform: {platform_name}")
    return platform

async def get_valid_access_token(db: AsyncSession, account: SocialAccount) -> str:
    """
    Get a valid access token from the social platform. If token is expired it uses 
    refresh tokens to generate new access tokens.
    
    Args:
        db: Active database session for persisting refreshed tokens.
        account: The social account whose token needs validation.
    
    Returns:
        The string access token.
    """
    
    buffer_time = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    if not account.expires_at or account.expires_at > buffer_time:
        return account.access_token
    
    if not account.refresh_token:
        raise Exception(f"Token for {account.platform} is expired and no refresh token available")

    platform = get_platform_instance(account.platform)
    token_data = await platform.refresh_access_token(account.refresh_token)
    
    updated_account = await update_social_account_tokens(
        db=db,
        account_id=account.id,
        new_access_token=token_data["access_token"],
        new_refresh_token=token_data.get("refresh_token"),
        expires_in=token_data.get("expires_in", 0)
    )
    
    return updated_account.access_token
