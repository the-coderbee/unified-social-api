"""
X Social Platform class.

Implements the necessary methods from SocialPlatform base class for linking account.
Uses PKCE(Proof Key for Code Exchange) stored in Redis for preventing man-in-the-middle attacks.
Supports tweet publishing.
"""

import base64
import hashlib
import secrets
import urllib.parse
from typing import Any, Dict, Optional

import httpx

from src.core.config import settings
from src.core.redis import redis_client
from src.social_accounts.platforms.base import SocialPlatform


class XPlatform(SocialPlatform):
    """
    X (formerly Twitter) social platform integration.

    Requires X_CLIENT_ID, X_CLIENT_SECRET, and X_REDIRECT_URI
    to be set in environment variables.
    """

    platform_name = "x"
    AUTH_URL = "https://x.com/i/oauth2/authorize"
    TOKEN_URL = "https://api.x.com/2/oauth2/token"
    USER_PROFILE_URL = "https://api.x.com/2/users/me"
    POST_URL = "https://api.x.com/2/tweets"

    def __init__(self):
        self.client_id = settings.X_CLIENT_ID
        self.client_secret = settings.X_CLIENT_SECRET
        self.redirect_uri = settings.X_REDIRECT_URI

    def _generate_pkce(self):
        """Generate a PKCE for code exchange."""
        code_verifier = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        code_challenge = base64.urlsafe_b64encode(hashed).decode("utf-8").rstrip("=")
        return code_verifier, code_challenge

    async def get_login_url(self, state: str):
        """
        Generates the authentication url with encoded params reqired by x.

        Args:
            state: The url safe token used for preventing csrf attacks.

        Returns:
            The authorization url as a string.
        """

        code_verifier, code_challenge = self._generate_pkce()
        await redis_client.setex(f"x:pkce:{state}", 300, code_verifier)

        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "tweet.read tweet.write users.read follows.read",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }

        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code_for_token(self, code: str, state: Optional[str] = None):
        """
        Exchange code for tokens from the platform.

        Args:
            code: The authorization code obtained from the platform.
            state: The url safe token used for preventing csrf attacks.

        Returns:
            Dictionary containing:
                access_token: The bearer token obtained through code exchange.
                refresh_token: The refresh token obtained through code exchange.
                expire_in: The expiration time of access token in seconds.
        """

        code_verifier = await redis_client.get(f"x:pkce:{state}")
        if not code_verifier:
            raise ValueError("Invalid or expired OAuth state")

        await redis_client.delete(f"x:pkce:{state}")

        auth_string = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_string.encode()).decode()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {b64_auth}",
                },
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                    "code_verifier": code_verifier,
                },
            )

            if response.status_code != 200:
                raise Exception(f"X OAuth exchange failed: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }

    async def refresh_access_token(self, refresh_token: str):
        """
        Generate new access and refresh tokens using the existing refresh token and
        revokes the old ones.
        Called automatically on access token expiry.

        Args:
            refresh_token: The existing refresh token for the platform.

        Returns:
            Dictionary containing:
                access_token: The bearer token obtained through code exchange.
                refresh_token: The refresh token obtained through code exchange.
                expire_in: The expiration time of access token in seconds.
        """

        auth_string = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_string.encode()).decode()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {b64_auth}",
                },
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": self.client_id,
                },
            )

            if response.status_code != 200:
                raise Exception(f"X token refresh failed: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }

    async def fetch_user_profile(self, access_token: str):
        """
        Fetch user profile using the obtained access token.

        Args:
            access_token: The bearer token obtained from code exchange.

        Returns:
            Dictionary containing:
                provider_account_id: The user ID of the associated account.
                username: The username associated to the platform.
                global_name: The global/display name associated to the platform.
                avatar_url: The user's profile picture url.
                metadata: The raw JSON response for the JSONB escape hatch.
        """

        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.x.com/2/users/me?user.fields=profile_image_url",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise Exception(f"Failed to fetch user profile: {response.text}")

            data = response.json()["data"]
            return {
                "provider_account_id": data.get("id"),
                "username": data.get("username"),
                "global_name": data.get("global_name"),
                "avatar_url": data.get("profile_image_url"),
                "metadata": data,
            }

    async def publish_post(
        self, access_token: str, provider_account_id: str, content: str
    ) -> Dict[str, Any]:
        """
        Publish a new post to the platform.

        Args:
            access_token: The bearer token obtained from code exchange.
            provider_account_id: The ID of the provider account to publish from.
            content: The post content to publish to the platform.

        Returns:
            Dictionary containing:
                post_url: The url of the post.

        Raises:
            Exception: If publishing the post fails.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.POST_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json={"text": content},
            )

            if response.status_code != 201:
                raise Exception(f"Failed to publish post: {response.text}")

            data = response.json()
            return {
                "post_url": f"https://x.com/i/web/status/{data.get('data', {}).get('id')}"
            }
