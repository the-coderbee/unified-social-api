import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class PostBase(BaseModel):
    content: str = Field(..., max_length=5000)
    is_published: bool = True


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    content: str | None = Field(default=None, max_length=5000)
    is_published: bool | None = None


class PostResponse(PostBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
