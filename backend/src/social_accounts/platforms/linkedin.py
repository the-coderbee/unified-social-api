import urllib.parse
from typing import Any, Dict, Optional

import httpx

from src.core.config import settings
from src.social_accounts.platforms.base import SocialPlatform


class LinkedInPlatform(SocialPlatform):
    """
    LinkedIn platform implementation for the unified social API.
    """

    platform_name = "linkedin"
    AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
    TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    USER_PROFILE_URL = "https://api.linkedin.com/v2/userinfo"
    POST_URL = "https://api.linkedin.com/v2/ugcPosts"

    def __init__(self):
        self.client_id = settings.LINKEDIN_CLIENT_ID
        self.client_secret = settings.LINKEDIN_CLIENT_SECRET
        self.redirect_uri = settings.LINKEDIN_REDIRECT_URI

    async def get_login_url(self, state: str) -> str:
        """
        Returns the LinkedIn login URL for the given state.

        Args:
            state (str): The state parameter for the OAuth flow.

        Returns:
            str: The LinkedIn login URL.
        """

        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "scope": "w_member_social email profile openid",
        }
        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code_for_token(
        self, code: str, state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exchanges the authorization code for an access token.

        Args:
            code (str): The authorization code.
            state (str): The state parameter for the OAuth flow.

        Returns:
            dict: The token response from LinkedIn.
        """

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data=data,
            )

            if response.status_code != 200:
                raise Exception(f"Failed to exchange code for token: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
                "refresh_token_expires_in": data.get("refresh_token_expires_in"),
            }

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refreshes the access token using the refresh token.

        Args:
            access_token (str): The access token to refresh.

        Returns:
            dict: The refreshed token response from LinkedIn.
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )

            if response.status_code != 200:
                raise Exception(f"Failed to refresh access token: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
                "refresh_token_expires_in": data.get("refresh_token_expires_in"),
            }

    async def fetch_user_profile(self, access_token: str) -> Dict[str, Any]:
        """
        Fetches the user's profile from LinkedIn.

        Args:
            access_token (str): The access token to use for fetching the profile.

        Returns:
            dict: The user's profile data from LinkedIn.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USER_PROFILE_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                },
            )

            if response.status_code != 200:
                raise Exception(f"Failed to fetch user profile: {response.text}")

            data = response.json()

            return {
                "provider_account_id": data.get("sub"),
                "username": None,
                "global_name": data.get("name"),
                "avatar_url": data.get("picture"),
                "metadata": data,
            }

    async def publish_post(
        self,
        access_token: str,
        provider_account_id: str,
        content: str,
        webhook_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Publishes a post to LinkedIn via the UGC Posts API.

        Args:
            access_token: The access token to use for publishing the post.
            provider_account_id: The provider account ID to use for publishing the post.
            content: The content of the post to publish.

        Returns:
            Dictionary containing:
                post_url: The constructed URL of the published post.

        Raises:
            Exception: If the post could not be published.
        """

        author_urn = f"urn:li:person:{provider_account_id}"
        payload = {
            "author": author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content,
                    },
                    "shareMediaCategory": "NONE",
                },
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.POST_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                },
                json=payload,
            )

            if response.status_code != 201:
                raise Exception(f"Failed to publish post: {response.text}")

            post_id = response.headers.get("x-restli-id", "")

            # LinkedIn returns the post ID in the response header, not body
            if not post_id:
                raise Exception("Failed to get post ID from response")

            return {
                "post_url": f"https://www.linkedin.com/feed/update/{post_id}",
            }
