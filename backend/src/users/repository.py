"""
Database queries and operations for user management.

Contains async repository functions for creating, fetching,
and updating user records in the database.
"""

import uuid
from typing import Optional, Union

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.models import User, AuthValues
from src.core.security import get_password_hash
from src.auth.schemas import UserCreate, GoogleUserCreate, GithubUserCreate


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Fetch a user by their email address.

    Args:
        db: Active database session.
        email: The email address to search for.

    Returns:
        The User object if found, None otherwise.
    """
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """
    Fetch a user by their user ID.

    Args:
        db: Active database session.
        user_id: The user ID to search for.

    Returns:
        The User object if found, None otherwise.
    """
    query = select(User).where(User.id == user_id).options(selectinload(User.social_accounts))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user_in: Union[UserCreate, GoogleUserCreate, GithubUserCreate]) -> User:
    """
    Create a new user by their email address in the system.

    Args:
        db: Active database session.
        user_in: The user data for creating the user.

    Returns:
        The User object.
    """
    hashed_password = None
    if user_in.auth_provider == AuthValues.LOCAL:
        hashed_password = get_password_hash(user_in.password)
        
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        auth_provider=user_in.auth_provider
    )
    
    db.add(db_user)
    await db.flush()
    return db_user
