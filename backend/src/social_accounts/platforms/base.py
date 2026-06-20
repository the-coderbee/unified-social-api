from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class SocialPlatform(ABC):
    """
    The master contract for all social media integrations.
    Any new platform added to the API **must** implement these exact methods.
    """

    platform: str
    AUTH_URL: str
    TOKEN_URL: str
    USER_PROFILE_URL: str
    POST_URL: str

    @abstractmethod
    async def get_login_url(self, state: str) -> str:
        """
        Generate the OAuth2 authorization URL for the platform.
        The state parameter is required to prevent CSRF attacks during redirect.

        Returns:
            The login url for the platform as a string.
        """
        ...

    @abstractmethod
    async def exchange_code_for_token(
        self, code: str, state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exchange the OAuth2 authorization code for an access token.

        Returns:
            Dictionary containing:
                - access_token (str): The Bearer token obtained by code exchange.
                - refresh_token (Optional[str]): The refresh token obtained by code exchange.
                - expires_in (Optional[int]): The expiration time of access token in seconds.
        """
        ...

    @abstractmethod
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Use the refresh token to obtain a new access token when the old ones are revoked.

        Returns:
            Dictionary containing:
                - access_token (str): The Bearer token obtained by code exchange.
                - refresh_token (Optional[str]): The refresh token obtained by code exchange.
                - expires_in (Optional[int]): The expiration time of access token in seconds.
        """
        ...

    @abstractmethod
    async def fetch_user_profile(self, access_token: str) -> Dict[str, Any]:
        """
        Fetch the user's profile data using the fresh access token.

        Returns:
            Dictionary containing:
                - provider_account_id (str): The account ID associated with the platform.
                - username (Optional[str]): The username associated with the platform.
                - global_name (Optional[str]): The display/global name associated with the platform.
                - avatar_url (Optional[str]): The user's profile picture url.
                - metadata (Optional[dict]): The raw JSON response for the JSONB escape hatch.
        """
        ...

    @abstractmethod
    async def publish_post(
        self,
        access_token: str,
        provider_account_id: str,
        content: str,
        webhook_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Publish a post to the platform using the provided access token.
        returns the platform-specific API response (like live URL or Post ID).

        Args:
            access_token (str): The access token for the platform.
            provider_account_id (str): The account ID associated with the platform.
            content (str): The content to be published.

        Returns:
            Dictionary containing:
                - post_id (str): The ID of the published post.
        """
        ...
