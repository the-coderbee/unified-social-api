import urllib.parse
from typing import Any, Dict, Optional
import httpx

from src.core.config import settings
from src.social_accounts.platforms.base import SocialPlatform


class DiscordPlatform(SocialPlatform):
    platform_name = "discord"
    AUTH_URL = "https://discord.com/oauth2/authorize"
    TOKEN_URL = "https://discord.com/api/oauth2/token"
    
    def __init__(self):
        self.client_id = settings.DISCORD_CLIENT_ID
        self.client_secret = settings.DISCORD_CLIENT_SECRET
        self.redirect_uri = settings.DISCORD_REDIRECT_URI
    
    async def get_login_url(self, state):
        base_url = "https://discord.com/api/oauth2/authorize"
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "identify",
            "state": state,
        }
        return f"{base_url}?{urllib.parse.urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str, state: Optional[str]) -> Dict[str, Any]:
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(self.TOKEN_URL, data=data, headers=headers)
            token_response.raise_for_status()
            token_data = token_response.json()
            
            user_url = "https://discord.com/api/users/@me"
            auth_headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            user_response = await client.get(user_url, headers=auth_headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            return {
                "access_token": token_data["access_token"],
                "refresh_token": token_data["refresh_token"],
                "expires_in": token_data.get("expires_in", 604800),
                "provider_account_id": user_data["id"]
            }
    async def refresh_access_token(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            response = await client.post(self.TOKEN_URL, data=data, headers=headers)
            
            if response.status_code != 200:
                raise Exception(f"Failed to refresh access token: {response.text}")
            
            return response.json()
    
    async def publish_post(self, access_token: str, content: str):
        raise NotImplementedError("Discord publishing requires webhook authorization")

    async def fetch_user_profile(self, access_token: str) -> dict:
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://discord.com/api/v10/users/@me",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch user profile: {response.text}")
            
            data = response.json()
            
            avatar_hash = data.get("avatar")
            user_id = data.get("id")
            avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png" if avatar_hash else None
            
            return {
                "username": data.get("username"),
                "global_name": data.get("global_name"),
                "avatar_url": avatar_url,
                "metadata": data
            }
