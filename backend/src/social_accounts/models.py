"""
SQLAlchemy ORM models for social accounts.

Defines Social Account model for managing account authentication and linking.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.expression import null

from src.common.models import Base, TimestampMixin

if TYPE_CHECKING:
    from src.users.models import User


class SocialAccount(Base, TimestampMixin):
    """
    Represents a Social Account platform in the system.

    Stores the platform specific ID, profile details, and the tokens.
    """

    __tablename__ = "social_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    platform_instance: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    provider_account_id: Mapped[str] = mapped_column(String(255), nullable=False)

    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    global_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    webhook_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    profile_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    access_token: Mapped[str] = mapped_column(String(500), nullable=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="social_accounts")  # type: ignore

    __table_args__ = (
        UniqueConstraint(
            "platform",
            "platform_instance",
            "provider_account_id",
            name="uix_platform_instance_account",
        ),
    )
