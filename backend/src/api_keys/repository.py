"""
Database queries and operations for API Key management.

Contains async repository functions for creating, fetching,
and revoking api key in the database.
"""

import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api_keys.models import APIKey
from src.api_keys.schemas import APIKeyCreate


async def create_api_key(
    db: AsyncSession,
    api_key_in: APIKeyCreate,
    hashed_key: str,
    key_prefix: str,
    user_id: uuid.UUID,
) -> APIKey:
    """
    Create new API Key.

    Args:
        db: The currently active database session.
        api_key_in: The api key input data.
        hashed_key: The api key hash to store in the database.
        key_prefix: The prefix of the API Key.
        user_id: The ID of the user creating the API.

    Returns:
        The newly created APIKey object.
    """

    new_api_key = APIKey(
        user_id=user_id,
        hashed_key=hashed_key,
        key_prefix=key_prefix,
        **api_key_in.model_dump(),
    )

    db.add(new_api_key)
    await db.flush()
    return new_api_key


async def get_api_keys_by_user(
    db: AsyncSession, user_id: uuid.UUID
) -> Sequence[APIKey]:
    """Fetch all API Keys for a user."""
    query = select(APIKey).where(APIKey.user_id == user_id)

    result = await db.execute(query)
    return result.scalars().all()


async def get_api_key_by_hash(db: AsyncSession, hashed_key: str) -> Optional[APIKey]:
    """Fetch the api key from a hashed api key."""
    query = select(APIKey).where(APIKey.hashed_key == hashed_key, APIKey.is_active)

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def fetch_api_key_by_id(
    db: AsyncSession, api_key_id: uuid.UUID
) -> Optional[APIKey]:
    """Fetch API Key by ID."""
    query = select(APIKey).where(APIKey.id == api_key_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def revoke_api_key_by_id(db: AsyncSession, api_key_id: uuid.UUID) -> bool:
    """Revoke an API Key by ID"""
    key = await fetch_api_key_by_id(db=db, api_key_id=api_key_id)

    if not key:
        return False

    key.is_active = False

    await db.flush()
    return True
