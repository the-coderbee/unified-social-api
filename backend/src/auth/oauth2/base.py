"""
Auth Provider Abstract Base Class

Defines the interface that all authentication providers (Google, Github, etc.) must 
implement to integrate with auth system.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class AuthProvider(ABC):
    """Abstract base class for OAuth2 authentication providers."""
    
    @abstractmethod
    async def get_authorization_url(self, state: str) -> str:
        """
        Generate the URL to redirect the user for authentication.
        
        Args:
            state: The state parameter used for csrf attack prevention.
        
        Returns:
            Returns Authorization url in string format.
        """
        pass

    @abstractmethod
    async def exchange_code_for_token(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        """
        Exchange the authorization code for an access token.
        
        Args:
            code: The authorization code from the OAuth redirect.
            state: The state parameter used for csrf attack prevention.
        
        Returns:
            Dictionary containing:
                access_token (str): Bearer token obtained from code exchange.
                refresh_token (Optional[str]): Token to be used for refreshing access token after expiry.
                token_type (str): Type of token provided.
        """
        pass

    @abstractmethod
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Fetch user information from user info endpoint.
        
        Args:
            access_token: Bearer toke obtained from exchange_code_for_token.
        
        Returns: 
            Dictionary containing:
                email (str): The user's email address.
                name (str): The user's display name.
                avatar_url (Optional[str]): The user's profile picture url.
        """
        pass
