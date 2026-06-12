"""
Pydantic schemas for request validation and response serialization.

Defines the data shapes for API Key creation, management
and API responses related to api key management.
"""
from datetime import datetime
import uuid

from pydantic import BaseModel, ConfigDict
from typing import List


class APIKeyBase(BaseModel):
    """Base schema for API Key."""
    name: str
    scopes: List[str]


class APIKeyCreate(APIKeyBase):
    """Schema for create API Key."""
    pass


class APIKeyCreateResponse(APIKeyBase):
    """
    Response schema for create API Key.
    
    The api_key will be shown only once.
    """
    id: uuid.UUID
    api_key: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class APIKeyResponse(APIKeyBase):
    """Response schema for API Key."""
    id: uuid.UUID
    key_prefix: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
