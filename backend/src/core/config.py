"""
Application configuration using Pydantic Settings.

Loads environment variables from .env file and provides typed
access to all configuration values including JWT settings,
database URLs, Redis URL, and OAuth2 credentials for Google, Github, Discord, and X.
"""

from typing import List

from pydantic import PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All required fields must be set in the .env file.
    Optional fields have sensible defaults.
    """

    PROJECT_NAME: str = "Unified Social API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    CORS_ORIGINS: str = "*"

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list of allowed origins."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 20
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: PostgresDsn

    # test database url
    TEST_DATABASE_URL: PostgresDsn

    REDIS_URL: RedisDsn

    # oauth2 google
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # oauth2 github
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_REDIRECT_URI: str

    # discord
    DISCORD_CLIENT_ID: str
    DISCORD_CLIENT_SECRET: str
    DISCORD_REDIRECT_URI: str

    # twitter
    X_CLIENT_ID: str
    X_CLIENT_SECRET: str
    X_REDIRECT_URI: str

    # linkedin
    LINKEDIN_CLIENT_ID: str
    LINKEDIN_CLIENT_SECRET: str
    LINKEDIN_REDIRECT_URI: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()  # type: ignore
