from src.auth.oauth2.base import AuthProvider
from src.core.config import settings
from urllib.parse import urlencode
import httpx
from typing import Dict, Any
import jwt


class GoogleAuthProvider(AuthProvider):
    
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.authorization_endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_endpoint = "https://oauth2.googleapis.com/token"
        self.user_info_endpoint = "https://www.googleapis.com/oauth2/v3/userinfo"
        
    async def get_authorization_url(self, state: str) -> str:
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
        }
        return f"{self.authorization_endpoint}?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        data = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "grant_type": "authorization_code",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.token_endpoint, data=data)
            response.raise_for_status()
            data = response.json()
            id_token_payload = jwt.decode(data.get("id_token"), options={"verify_signature": False})
            
            return {
                "email": id_token_payload.get("email"),
                "name": id_token_payload.get("name"),
                "picture": id_token_payload.get("picture"),
            }

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.get(self.user_info_endpoint, headers=headers)
            response.raise_for_status()
            return response.json()