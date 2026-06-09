import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from src.common.models import Base, TimestampMixin


class AuthValues(enum.Enum):
    GOOGLE = "google"
    GITHUB = "github"
    LOCAL = "local"


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    
    hashed_password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    auth_provider: Mapped[AuthValues] = mapped_column(SAEnum(AuthValues), nullable=False, default=AuthValues.LOCAL)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    
    posts: Mapped[List["Post"]] = relationship(back_populates="user", cascade="all, delete-orphan") # type: ignore
    social_accounts: Mapped[List["SocialAccount"]] = relationship(back_populates="user", cascade="all, delete-orphan") # type: ignore
