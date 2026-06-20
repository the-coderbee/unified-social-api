"""
Discord Social Platform class.

Implements OAuth2 with the webhook.incoming scope, which returns a
per-channel webhook URL directly in the token exchange response.
Publishing uses this webhook URL — no bot or bearer token required.
"""

import urllib.parse
from typing import Any, Dict, Optional

import httpx

from src.core.config import settings
from src.social_accounts.platforms.base import SocialPlatform


class DiscordPlatform(SocialPlatform):
    """
    Discord social platform integration.

    Requires DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, and DISCORD_REDIRECT_URI
    to be set in environment variables.
    """

    platform_name = "discord"
    AUTH_URL = "https://discord.com/oauth2/authorize"
    TOKEN_URL = "https://discord.com/api/oauth2/token"
    USER_PROFILE_URL = "https://discord.com/api/users/@me"
    POST_URL = "https://discord.com/api/channels/"

    def __init__(self):
        self.client_id = settings.DISCORD_CLIENT_ID
        self.client_secret = settings.DISCORD_CLIENT_SECRET
        self.redirect_uri = settings.DISCORD_REDIRECT_URI

    async def get_login_url(self, state: str):
        """
        Generates the authentication url with encoded params reqired by discord.

        Args:
            state: The url safe token used for preventing csrf attacks.

        Returns:
            The authorization url as a string.
        """

        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "identify email webhook.incoming",
            "state": state,
        }

        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code_for_token(
        self, code: str, state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exchange code for tokens from the platform.

        Args:
            code: The authorization code obtained from the platform.
            state: The url safe token used for preventing csrf attacks but discord does not use it.

        Returns:
            Dictionary containing:
                access_token: The bearer token obtained through code exchange.
                refresh_token: The refresh token obtained through code exchange.
                expire_in: The expiration time of access token in seconds.
        """

        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                self.TOKEN_URL,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
            )
            token_response.raise_for_status()
            token_data = token_response.json()

            webhook = token_data.get("webhook")
            webhook_url = webhook.get("url") if webhook else None
            return {
                "access_token": token_data.get("access_token"),
                "refresh_token": token_data.get("refresh_token"),
                "expires_in": token_data.get("expires_in", 604800),
                "webhook_url": webhook_url,
            }

    async def refresh_access_token(self, refresh_token: str) -> dict:
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

        async with httpx.AsyncClient() as client:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            }
            headers = {"Content-Type": "application/x-www-form-urlencoded"}

            response = await client.post(self.TOKEN_URL, data=data, headers=headers)

            if response.status_code != 200:
                raise Exception(f"Failed to refresh access token: {response.text}")

            data = response.json()

            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }

    async def fetch_user_profile(self, access_token: str) -> dict:
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
                "https://discord.com/api/v10/users/@me",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise Exception(f"Failed to fetch user profile: {response.text}")

            data = response.json()

            avatar_hash = data.get("avatar")
            user_id = data.get("id")
            avatar_url = (
                f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png"
                if avatar_hash
                else None
            )

            return {
                "provider_account_id": data.get("id"),
                "username": data.get("username"),
                "global_name": data.get("global_name"),
                "avatar_url": avatar_url,
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
        Publish a new post to the platform.

        Args:
            access_token: The bearer token obtained from code exchange.
            provider_account_id: The ID of the provider account to publish from.
            content: The post content to publish to the platform.
            webhook_url: The webhook url needed for posting.

        Returns:
            Dictionary containing:
                post_url: The url of the post.

        Raises:
            Exception: If webhook is not configured or publishing the post fails.
        """
        if not webhook_url:
            raise Exception("No Discord webhook configured for this account.")

        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json={"content": content})
            if response.status_code not in (200, 204):
                raise Exception(f"Failed to publish Discord message: {response.text}")

            return {"post_url": webhook_url}
