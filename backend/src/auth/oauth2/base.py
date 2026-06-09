from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AuthProvider(ABC):
    """Abstract base class for OAuth2 authentication providers."""
    
    @abstractmethod
    async def get_authorization_url(self, state: str) -> str:
        """Return the URL to redirect the user for authentication."""
        pass

    @abstractmethod
    async def exchange_code_for_token(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        """Exchange the authorization code for an access token."""
        pass

    @abstractmethod
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Fetch user information using the access token.
        Return: A dictionary containing user information such as email, name, and profile picture URL.
        """
        pass
