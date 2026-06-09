from typing import Any, Dict

from src.auth.oauth2.base import AuthProvider
from src.core.config import settings
from src.core.redis import redis_client
import secrets
import hashlib
import base64
from fastapi import HTTPException
import urllib.parse
import httpx


class GithubAuthProvider(AuthProvider):
    
    def __init__(self):
        self.client_id = settings.GITHUB_CLIENT_ID
        self.client_secret = settings.GITHUB_CLIENT_SECRET
        self.redirect_uri = settings.GITHUB_REDIRECT_URI
        self.authorization_endpoint = "https://github.com/login/oauth/authorize"
        self.token_endpoint = "https://github.com/login/oauth/access_token"
        self.user_info_endpoint = "https://api.github.com/user"
    
    def  _generate_pkce(self):
        code_verifier = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        code_challenge = base64.urlsafe_b64encode(hashed).decode("utf-8").rstrip("=")
        return code_verifier, code_challenge
    
    async def get_authorization_url(self, state: str):
        code_verifier, code_challenge = self._generate_pkce()
        await redis_client.setex(f"github:oauth:pkce:{state}", 300, code_verifier)
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user:email read:user",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256"
        }
        
        return f"{self.authorization_endpoint}?{urllib.parse.urlencode(params)}"

    async def exchange_code_for_token(self, code: str, state: str):
        code_verifier = await redis_client.get(f"github:oauth:pkce:{state}")
        if not code_verifier:
            raise ValueError("Invalid or expired OAuth state")
        
        await redis_client.delete(f"github:oauth:pkce:{state}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_endpoint,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                
                data = {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "code": code,
                    "code_verifier": code_verifier
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Github OAuth failed: {response.text}")
            
            data = response.json()
            
            return {
                "access_token": data.get("access_token")
            }
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.get(self.user_info_endpoint, headers=headers)
            response.raise_for_status()
            data = response.json()
            user_email = data.get("email")
            if not user_email:
                email_data = await client.get("https://api.github.com/user/emails", headers=headers)
                email_response = email_data.json()
                primary_email = next(
                    (email for email in email_response if email["primary"] == True and email["verified"] == True),
                    None
                )
                
                if primary_email is None:
                    raise ValueError("No valid email found")
                
                user_email = primary_email.get("email")
            return {
                "email": user_email,
                "avatar_url": data.get("avatar_url")
            }