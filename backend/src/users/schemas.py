"""
Pydantic schemas for request validation and response serialization.

Defines the data shapes for user creation, authentication,
and API responses related to user management.
"""

import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.social_accounts.schemas import SocialAccountResponse
from src.users.models import AuthValues


class UserBase(BaseModel):
    """Base schema for user."""
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    auth_provider: AuthValues = AuthValues.LOCAL
    

class UserUpdate(BaseModel):
    """Schema for user update"""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Response schema for user."""
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    social_accounts: List[SocialAccountResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
