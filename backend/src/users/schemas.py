from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.social_accounts.schemas import SocialAccountResponse
from src.users.models import AuthValues

class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    auth_provider: AuthValues = AuthValues.LOCAL
    

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    social_accounts: List[SocialAccountResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
