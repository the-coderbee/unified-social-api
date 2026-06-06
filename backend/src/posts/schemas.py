from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from src.posts.models import PostStatus, PostResultStatus


class PostBase(BaseModel):
    content: str


class PostCreate(PostBase):
    platforms: List[str]
    options: Optional[dict] = None


class PostPlatformResultCreate(BaseModel):
    platform_name: str
    status: PostResultStatus
    post_url: Optional[str] = None
    error_message: Optional[str] = None


class PostPlatformResultResponse(BaseModel):
    platform_name: str
    status: PostResultStatus
    post_url: Optional[str] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PostResponse(PostBase):
    id: uuid.UUID
    status: PostStatus
    created_at: datetime
    results: List[PostPlatformResultResponse]
    not_connected_platforms: List[str]
    
    model_config = ConfigDict(from_attributes=True)
