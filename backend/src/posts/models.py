import enum
from typing import List, Optional
import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from src.common.models import Base, TimestampMixin


class PostStatus(enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    FAILED = "FAILED"


class PostResultStatus(enum.Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    

class Post(Base, TimestampMixin):
    __tablename__ = "posts"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    status: Mapped[PostStatus] = mapped_column(SAEnum(PostStatus), default=PostStatus.PENDING)

    platform_results: Mapped[List["PostPlatformResult"]] = relationship(back_populates="post")

    user: Mapped["User"] = relationship(back_populates="posts") #type: ignore


class PostPlatformResult(Base, TimestampMixin):
    __tablename__ = "post_platform_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id"))
    social_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("social_accounts.id"))
    platform_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[PostResultStatus] = mapped_column(SAEnum(PostResultStatus), nullable=False)
    post_url: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    post: Mapped["Post"] = relationship(back_populates="platform_results")
