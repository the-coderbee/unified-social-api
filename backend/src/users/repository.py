from typing import Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.models import User
from src.auth.schemas import UserCreate
from src.core.security import get_password_hash


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID | str) -> Optional[User]:
    query = select(User).where(User.id == user_id).options(selectinload(User.social_accounts))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    await db.flush()
    return db_user
