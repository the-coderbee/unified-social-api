"""
SQLAlchemy ORM models for social accounts.

Defines Social Account model for managing account authentication and linking.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from src.common.models import Base, TimestampMixin


class SocialAccount(Base, TimestampMixin):
    """
    Represents a Social Account platform in the system.
    
    Stores the platform specific ID, profile details, and the tokens.
    """
    
    __tablename__ = "social_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    
    provider_account_id: Mapped[str] = mapped_column(String(255), nullable=False)
    
    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    global_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    profile_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    access_token: Mapped[str] = mapped_column(String(500), nullable=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="social_accounts") # type: ignore

    __table_args__ = (
        UniqueConstraint("platform", "provider_account_id", name="uix_platform_account"),
    )
    