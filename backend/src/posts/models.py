import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from src.common.models import Base, TimestampMixin


class Post(Base, TimestampMixin):
    __tablename__ = "posts"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    
    user: Mapped["User"] = relationship(back_populates="posts") # type: ignore
