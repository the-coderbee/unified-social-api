from typing import List
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    is_active: bool | None = None


class SocialAccountResponse(BaseModel):
    platform: str
    provider_account_id: str
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    social_accounts: List[SocialAccountResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class RefreshTokenRequest(BaseModel):
    refresh_token: str
    