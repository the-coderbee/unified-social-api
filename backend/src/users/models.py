"""
SQLAlchemy ORM models for user authentication and authorization.

Defines the User model and AuthValues enum for managing user accounts
across local and OAuth authentication providers.
"""

import enum
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.common.models import Base, TimestampMixin

if TYPE_CHECKING:
    from src.api_keys.models import APIKey
    from src.posts.models import Post
    from src.social_accounts.models import SocialAccount


class AuthValues(enum.Enum):
    """Authentication provider used to register the user account."""

    GOOGLE = "google"
    GITHUB = "github"
    LOCAL = "local"


class User(Base, TimestampMixin):
    """
    Represents a registered user in the system.

    Supports both local email/password authentication and OAuth providers
    (Google, GitHub). Password is nullable for OAuth-only users.
    """

    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    hashed_password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    auth_provider: Mapped[AuthValues] = mapped_column(
        SAEnum(AuthValues), nullable=False, default=AuthValues.LOCAL
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    posts: Mapped[List["Post"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )  # type: ignore
    social_accounts: Mapped[List["SocialAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )  # type: ignore
    api_keys: Mapped[List["APIKey"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )  # type: ignore
