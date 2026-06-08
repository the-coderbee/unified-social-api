from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SocialLinkRequest(BaseModel):
    code: str
    state: str


class SocialAccountResponse(BaseModel):
    platform: str
    username: Optional[str]
    global_name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)