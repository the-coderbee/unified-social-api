"""
Database queries and operations for social account management.

Contains async repository functions for creating, fetching,
and updating social account records in the database.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.social_accounts.models import SocialAccount


async def link_social_account(
    db: AsyncSession,
    user_id: uuid.UUID,
    platform_name: str,
    provider_account_id: str,
    access_token: str,
    platform_instance: Optional[str] = None,
    refresh_token: Optional[str] = None,
    expires_in: int = 0,
    username: Optional[str] = None,
    global_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    webhook_url: Optional[str] = None,
    profile_metadata: Optional[dict] = None,
) -> SocialAccount:
    """
    Link the provided social account.

    Creates a new social account record in the system.

    Args:
        db: The current active database session.
        user_id: The ID of the user making the request.
        platform_name: The name of the social platform.
        provider_account_id: The account ID of user obtained from the social platform.
        access_token: The Bearer token obtained from the social platform through code exchange.
        platform_instance: The instance of the social platform (e.g., "facebook", "twitter").
        refresh_token: The refresh token obtained from the social platform through code exchange.
        expires_in: The expiration time of the access token in seconds.
        username: The user's username on the social platform.
        global_name: The user's display name on the social platform.
        avatar_url: The user's profile picture url on the social platform.
        webhook_url: Webhook url for posting to discord. Applicable only for discord platform.
        profile_metadata: Other optional metadata about the user profile.

    Returns:
        A SocialAccount object.
    """

    expires_at = None
    if expires_in:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    query = select(SocialAccount).where(
        SocialAccount.platform == platform_name,
        SocialAccount.platform_instance == platform_instance,
        SocialAccount.provider_account_id == provider_account_id,
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
        account.webhook_url = webhook_url
        account.profile_metadata = safe_metadata
        account.is_active = True
    else:
        account = SocialAccount(
            user_id=user_id,
            platform=platform_name,
            platform_instance=platform_instance,
            provider_account_id=provider_account_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            username=username,
            global_name=global_name,
            avatar_url=avatar_url,
            webhook_url=webhook_url,
            profile_metadata=safe_metadata,
        )
        db.add(account)

    await db.flush()

    return account


async def update_social_account_tokens(
    db: AsyncSession,
    account_id: uuid.UUID,
    new_access_token: str,
    new_refresh_token: Optional[str],
    expires_in: int,
) -> SocialAccount:
    """
    Update tokens for a social account.

    Args:
        db: The current active database session.
        account_id: The account ID for which the tokens are to be updated.
        new_access_token: The newly obtained access token.
        new_refresh_token: The newly obtained refresh token.
        expires_in: The expiration time of the access token in seconds.

    Returns:
        The updated SocialAccount object.
    """

    query = select(SocialAccount).where(SocialAccount.id == account_id)
    result = await db.execute(query)
    account = result.scalar_one_or_none()

    if not account:
        raise ValueError("Social account not found")

    expires_at = None

    if expires_in:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    account.expires_at = expires_at

    account.access_token = new_access_token

    if new_refresh_token:
        account.refresh_token = new_refresh_token

    await db.flush()
    await db.refresh(account)

    return account


async def get_social_accounts(
    db: AsyncSession, user_id: uuid.UUID
) -> Sequence[SocialAccount]:
    """Fetch all the social accounts of the user."""
    query = select(SocialAccount).where(
        SocialAccount.user_id == user_id, SocialAccount.is_active
    )
    result = await db.execute(query)
    return result.scalars().all()


async def unlink_social_account(
    db: AsyncSession,
    user_id: uuid.UUID,
    platform_name: str,
    platform_instance: Optional[str] = None,
) -> str:
    """
    Unlink a linked social account from the system.

    Args:
        db: The current active database session.
        user_id: The ID of the user requesting to unlink.
        platform_name: The name of the platform to unlink.
        platform_instance: The specific instance of the platform to unlink.

    Returns:
        One of "unlinked", "not_found", "ambiguous"
    """

    query = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.platform == platform_name,
        SocialAccount.is_active,
    )
    result = await db.execute(query)
    accounts = result.scalars().all()

    if not accounts:
        return "not_found"

    if len(accounts) == 1:
        accounts[0].is_active = False
        await db.flush()
        return "unlinked"

    if not platform_instance:
        return "ambiguous"

    matching = [a for a in accounts if a.platform_instance == platform_instance]
    if not matching:
        return "not_found"

    matching[0].is_active = False
    await db.flush()
    return "unlinked"
