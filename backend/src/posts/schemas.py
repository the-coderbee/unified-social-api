"""
Pydantic schemas for request validation and response serialization.

Defines the data shapes for post creation, platform result creation
and  API responses related to post management.
"""

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from src.posts.models import PostResultStatus, PostStatus


class PostBase(BaseModel):
    """Base schema for post model."""

    content: str


class PostCreate(PostBase):
    """
    Schema for creating a new post.

    Excludes user ID, status and platform results because user ID it
    will be passed internally and status and platform results will be
    obtained from post platform results.
    """

    platforms: List[str]
    options: Optional[dict] = None


class PostPlatformResultCreate(BaseModel):
    """Schema for creating a new post platfrom result record."""

    platform_name: str
    status: PostResultStatus
    post_url: Optional[str] = None
    error_message: Optional[str] = None


class PostPlatformResultResponse(BaseModel):
    """Response schema for post platform results."""

    platform_name: str
    status: PostResultStatus
    post_url: Optional[str] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PostResponse(PostBase):
    """Response schema for post."""

    id: uuid.UUID
    status: PostStatus
    created_at: datetime
    results: List[PostPlatformResultResponse]
    not_connected_platforms: List[str]

    model_config = ConfigDict(from_attributes=True)


class PostDetailResponse(BaseModel):
    """Response schema for listing/retrieving historical posts."""

    id: uuid.UUID
    content: str
    status: PostStatus
    created_at: datetime
    results: List[PostPlatformResultResponse] = Field(
        validation_alias="platform_results"
    )
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
