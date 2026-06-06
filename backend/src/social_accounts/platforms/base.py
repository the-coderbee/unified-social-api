from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class SocialPlatform(ABC):
    """
    The master contract for all social media integrations.
    Any new platform added to the API **must** implement these exact methods.
    """
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """The internal identifier for the platform (e.g., 'facebook', 'twitter')"""
        ...
        
    @property
    @abstractmethod
    def AUTH_URL(self) -> str:
        """The base URL for OAuth authorization."""
        ...
    
    @property
    @abstractmethod
    def TOKEN_URL(self) -> str:
        """The URL to exchange the authorization code for an access token."""
        ...
    
    
    @abstractmethod
    async def get_login_url(self, state: str) -> str:
        """Generate the OAuth2 authorization URL for the platform.
        The state parameter is required to prevent CSRF attacks during redirect.
        """
        ...
    
    @abstractmethod
    async def exchange_code_for_token(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        """
        Exchange the OAuth2 authorization code for an access token.
        Must return a dictionary containing at least:
        - access_token (str)
        - refresh_token (str | None)
        - expires_in (int)
        """
        ...
    
    @abstractmethod
    async def fetch_user_profile(self, access_token: str) -> Dict[str, Any]:
        """
        Fetch the user's profile data using the fresh access token.
        Must return a dictionary containing:
        - username (str | None)
        - global_name (str | None)
        - avatar_url (str | None)
        - metadata (dict) -> The raw JSON response for the JSONB escape hatch
        - provider_account_id (str | None)
        """
        ...
    
    @abstractmethod
    async def publish_post(self, access_token: str, content: str) -> Dict[str, Any]:
        """
        Publish a post to the platform using the provided access token.
        returns the platform-specific API response (like live URL or Post ID).
        """
        ...
