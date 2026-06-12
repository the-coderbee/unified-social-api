"""
SQLAlchemy ORM models for API keys.

Defines the APIKey model for managing api keys for users.
"""

import uuid

from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID

from src.common.models import Base, TimestampMixin


class APIKey(Base, TimestampMixin):
    """
    Represents an API Key registered in the system.
    
    Included API Key status active or revoked, scopes of 
    permissions for the key.
    """
    
    __tablename__ = "api_keys"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    # hashed key
    hashed_key: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    key_prefix: Mapped[str] = mapped_column(String(12), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    scopes: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    user: Mapped["User"] = relationship(back_populates="api_keys") # type: ignore
