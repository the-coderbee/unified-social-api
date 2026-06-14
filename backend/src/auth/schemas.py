"""
Pydantic schemas for request validation and response serialization.

Defines the data shapes for user creation, both local and third party auth providers.
And defines the token responses for the API.
"""

from typing import Optional

from pydantic import BaseModel, Field

from src.users.schemas import UserBase


class UserCreate(UserBase):
    """
    Schema for creating a new user.

    Included password for local authentication method.
    """

    password: str = Field(min_length=8, max_length=128)


class GoogleUserCreate(UserBase):
    """
    Schema for creating a new user using Google's OAuth.

    Excludes password because it is not required for this authentication method.
    """

    password: Optional[str]
    pass


class GithubUserCreate(UserBase):
    """
    Schema for creating a new user using GitHub's OAuth.

    Excludes password because it is not required for this authentication method.
    """

    password: Optional[str]
    pass


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str


class TokenResponse(BaseModel):
    """Response schema for token."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
