import base64
import hashlib
import secrets

from typing import Optional
import urllib.parse

import httpx

from src.social_accounts.platforms.base import SocialPlatform
from src.core.config import settings
from src.core.redis import redis_client


class XPlatform(SocialPlatform):
    platform_name = "x"
    AUTH_URL = "https://x.com/i/oauth2/authorize"
    TOKEN_URL = "https://api.x.com/2/oauth2/token"
    
    def __init__(self):
        self.client_id = settings.X_CLIENT_ID
        self.client_secret = settings.X_CLIENT_SECRET
        self.redirect_uri = settings.X_REDIRECT_URI
    
    def _generate_pkce(self):
        code_verifier = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        code_challenge = base64.urlsafe_b64encode(hashed).decode("utf-8").rstrip("=")
        return code_verifier, code_challenge
    
    async def get_login_url(self, state: str):
        code_verifier, code_challenge = self._generate_pkce()
        await redis_client.setex(f"x:pkce:{state}", 300, code_verifier)
        
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "tweet.read tweet.write users.read follows.read",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256"
        }
        
        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code_for_token(self, code: str, state: str):
        code_verifier = await redis_client.get(f"x:pkce:{state}")
        if not code_verifier:
            raise ValueError("Invalid or expired OAuth state")
        
        await redis_client.delete(f"x:pkce:{state}")
        
        auth_string = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_string.encode()).decode()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers = {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {b64_auth}"
                },
                
                data = {
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                    "code_verifier": code_verifier
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"X OAuth exchange failed: {response.text}")
            
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }
    
    async def fetch_user_profile(self, access_token: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.x.com/2/users/me?user.fields=profile_image_url",
                headers={
                    "Authorization": f"Bearer {access_token}"
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch user profile: {response.text}")
            
            data = response.json()["data"]
            return {
                "username": data.get("username"),
                "global_name": data.get("global_name"),
                "avatar_url": data.get("profile_image_url"),
                "metadata": data,
                "provider_account_id": data.get("id")
            }
        
    async def publish_post(self, access_token: str, content: str):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.x.com/2/tweets",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                json={
                    "text": content
                }
            )
            
            if response.status_code != 201:
                raise Exception(f"Failed to publish post: {response.text}")
            
            data = response.json()
            return {
                "post_url": f"https://x.com/i/web/status/{data.get('data', {}).get('id')}"
            }