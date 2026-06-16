"""
Mastodon platform for social accounts.
"""

import base64
import hashlib
import secrets
import urllib.parse
from typing import Any, Dict, Optional, Tuple

import httpx

from src.core.redis import redis_client
from src.social_accounts.platforms.base import SocialPlatform


class MastodonPlatform(SocialPlatform):
    """
    Represents the Mastodon platform for social accounts.
    """

    platform_name = "mastodon"

    def __init__(
        self,
        instance_domain: str,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
    ):
        self.instance_domain = instance_domain
        self.AUTH_URL = f"https://{instance_domain}/oauth/authorize"
        self.TOKEN_URL = f"https://{instance_domain}/oauth/token"
        self.USER_PROFILE_URL = (
            f"https://{instance_domain}/api/v1/accounts/verify_credentials"
        )
        self.POST_URL = f"https://{instance_domain}/api/v1/statuses"
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    def _generate_pkce(self) -> Tuple[str, str]:
        """
        Generates a PKCE code verifier and challenge for the Mastodon platform.

        Returns:
            Tuple[str, str]: The code verifier and code challenge.
        """
        code_verifier = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        code_challenge = base64.urlsafe_b64encode(hashed).decode().rstrip("=")
        return code_verifier, code_challenge

    async def get_login_url(self, state: str) -> str:
        """
        Returns the login URL for the Mastodon platform.

        Args:
            state (str): The state parameter for the login URL.

        Returns:
            str: The login URL for the Mastodon platform.
        """

        code_verifier, code_challenge = self._generate_pkce()

        await redis_client.setex(f"mastodon:pkce:{state}", 300, code_verifier)

        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "read write read:accounts write:statuses",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "force_login": "true",
        }

        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code_for_token(
        self, code: str, state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exchanges the authorization code for an access token.

        Args:
            code (str): The authorization code.
            state (str): The state parameter for the login URL.

        Returns:
            Dict[str, Any]: The access token and refresh token.
        """

        code_verifier = await redis_client.get(f"mastodon:pkce:{state}")
        if not code_verifier:
            raise ValueError("Invalid or expired OAuth state")

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "code_verifier": code_verifier,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data=data,
            )

            if response.status_code != 200:
                raise ValueError(f"Failed to exchange code for token: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refreshes the access token using the refresh token.

        Returns:
            A dictionary containing the refreshed access token and refresh token.
        """

        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data=data,
            )

            if response.status_code != 200:
                raise ValueError(f"Failed to refresh token: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }

    async def fetch_user_profile(self, access_token: str) -> Dict[str, Any]:
        """
        Fetches the user info from the Mastodon API.

        Args:
            access_token (str): The access token for the user.

        Returns:
            Dict[str, Any]: The user info from the Mastodon API.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USER_PROFILE_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise ValueError(f"Failed to get user info: {response.text}")

            data = response.json()

            return {
                "provider_account_id": str(data.get("id")),
                "username": data.get("username"),
                "global_name": data.get("display_name"),
                "avatar_url": data.get("avatar"),
                "metadata": data,
            }

    async def publish_post(
        self, access_token: str, provider_account_id: str, content: str
    ) -> Dict[str, Any]:
        """
        Publishes a post to the Mastodon instance.

        Args:
            access_token (str): The access token for the user.
            provider_account_id (str): The provider account ID.
            content (str): The content of the post.

        Returns:
            Dict[str, Any]: The response from the Mastodon API.
        """

        data = {
            "status": content,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.POST_URL,
                headers={"Authorization": f"Bearer {access_token}"},
                json=data,
            )

            if response.status_code != 200:
                raise ValueError(f"Failed to publish post: {response.text}")

            data = response.json()

            return {
                "post_url": data.get("url"),
            }
