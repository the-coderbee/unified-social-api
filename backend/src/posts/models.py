"""
SQLAlchemy ORM models for post publishing.

Defines the Post and PostPlatformResult models, PostStatus and PostResultStatus enums for 
managing the post results.
"""

import enum
import uuid
from typing import List, Optional

from sqlalchemy import String, Text, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from src.common.models import Base, TimestampMixin


class PostStatus(enum.Enum):
    """Post Status enums"""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    FAILED = "FAILED"


class PostResultStatus(enum.Enum):
    """Post result status enums"""
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    

class Post(Base, TimestampMixin):
    """
    Represents a published post in the system.
    
    Supports options in json format for specific platforms.
    Stores individual platform's results to make retry possible for specific platforms.
    """
    
    __tablename__ = "posts"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    status: Mapped[PostStatus] = mapped_column(SAEnum(PostStatus), default=PostStatus.PENDING)

    platform_results: Mapped[List["PostPlatformResult"]] = relationship(back_populates="post")

    user: Mapped["User"] = relationship(back_populates="posts") #type: ignore


class PostPlatformResult(Base, TimestampMixin):
    """
    Represents publishing results for individual platforms.
    
    Contains post url for successful publish and error message otherwise.
    """
    
    __tablename__ = "post_platform_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id"))
    social_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("social_accounts.id"))
    platform_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[PostResultStatus] = mapped_column(SAEnum(PostResultStatus), nullable=False)
    post_url: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    post: Mapped["Post"] = relationship(back_populates="platform_results")
