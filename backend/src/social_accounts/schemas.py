"""
Pydantic schemas for request validation and response serialization.

Defines the data shapes for social account, login url request and
platform API responses.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SocialLinkRequest(BaseModel):
    """Schema for login url partial payload."""

    code: str
    state: str


class SocialAccountResponse(BaseModel):
    """Response schema for Social Account."""

    platform: str
    provider_account_id: str
    username: Optional[str]
    global_name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
