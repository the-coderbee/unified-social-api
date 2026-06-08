from typing import List
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.social_accounts.schemas import SocialAccountResponse


class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    is_active: bool | None = None


class UserResponse(UserBase):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    social_accounts: List[SocialAccountResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
