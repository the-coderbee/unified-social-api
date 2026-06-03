from typing import Optional
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.social_accounts.models import SocialAccount


async def link_social_account(
    db: AsyncSession,
    user_id: uuid.UUID,
    platform_name: str,
    provider_account_id: str,
    access_token: str,
    refresh_token: Optional[str] = None,
    expires_in: int = 0,
    username: Optional[str] = None,
    global_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    profile_metadata: Optional[dict] = None
) -> SocialAccount:
    
    expires_at = None
    if expires_in:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    query = select(SocialAccount).where(
        SocialAccount.platform == platform_name,
        SocialAccount.provider_account_id == provider_account_id
    )
    
    result = await db.execute(query)
    account = result.scalar_one_or_none()
    
    safe_metadata = profile_metadata if profile_metadata is not None else {}

    if account:
        account.access_token = access_token
        account.refresh_token = refresh_token
        account.expires_at = expires_at
        account.username = username
        account.global_name = global_name
        account.avatar_url = avatar_url
        account.profile_metadata = safe_metadata
    else:
        account = SocialAccount(
            user_id=user_id,
            platform=platform_name,
            provider_account_id=provider_account_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            username=username,
            global_name=global_name,
            avatar_url=avatar_url,
            profile_metadata=safe_metadata
        )
        db.add(account)
    
    await db.flush()
    
    return account

async def update_social_account_tokens(
    db: AsyncSession,
    account_id: uuid.UUID,
    new_access_token: str,
    new_refresh_token: Optional[str],
    expires_in: int
) -> SocialAccount:
    query = select(SocialAccount).where(SocialAccount.id == account_id)
    result = await db.execute(query)
    account = result.scalar_one_or_none()
    
    if not account:
        raise ValueError("Social account not found")
    
    account.access_token = new_access_token
    if new_refresh_token:
        account.refresh_token = new_refresh_token
        
    account.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    
    await db.commit()
    await db.refresh(account)
    
    return account
