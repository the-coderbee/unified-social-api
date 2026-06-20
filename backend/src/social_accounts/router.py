"""
Social accounts router handling account registration, authentication, linking,
unlinking and management.

Endpoints:
    GET /login/{platform_name}     — Get the login url of the social account.
    POST /{plaform_name}/link    — Connect the social account to the user.
    DELETE /{plaform_name}/unlink    — Disconnect the social account from the user.
    GET /accounts    — Fetch all connected social accounts of the user.
"""

import secrets
from typing import Dict, List, Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import RateLimiter, get_current_user
from src.core.database import get_db
from src.core.redis import redis_client
from src.social_accounts.models import SocialAccount
from src.social_accounts.repository import (
    get_social_accounts,
    link_social_account,
    unlink_social_account,
)
from src.social_accounts.schemas import SocialAccountResponse, SocialLinkRequest
from src.social_accounts.services import get_platform_instance
from src.users.models import User

router = APIRouter(
    tags=["Social Accounts"],
    dependencies=[Depends(RateLimiter(max_requests=300, window_seconds=60))],
)


@router.get("/login/{platform_name}")
async def get_login_url(
    platform_name: str, platform_instance: Optional[str] = None
) -> Dict[str, str]:
    """
    Get the login url for the social account with a secure state.

    Args:
        platform_name: The name of the platform to log into.

    Returns:
        Dictionary containing:
            auth_url: The authorization_url.
            state: The urlsafe token for preventing csrf attacks.

    Raises:
        HTTPException 404: If the provided platform name is not supported.
        HTTPException 500: If there is an internal server error.
    """
    try:
        platform = get_platform_instance(platform_name, platform_instance)
        state = secrets.token_urlsafe(16)

        await redis_client.setex(f"social:oauth:state:{state}", 300, "valid")

        auth_url = await platform.get_login_url(state)
        return {"auth_url": auth_url, "state": state}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occured.",
        )


@router.post("/{platform_name}/link", response_model=SocialAccountResponse)
async def link_account(
    platform_name: str,
    payload: SocialLinkRequest,
    platform_instance: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SocialAccount:
    """
    Link the social account to the users local account.

    Args:
        platform_name: The name of the platform to link to.
        payload: The pydantic object containing the authorization code and state.
        current_user: The dependency function used for getting the current user before handling the request.
        db: The active database session for persisting account linking.

    Returns:
        The newly created social account.

    Raises:
        HTTPException 401: If the access token is missing from payload.
        HTTPException 404: If no account ID is found for the requested platform.
        HTTPException 500: If there is an internal server error.
    """
    try:
        platform = get_platform_instance(platform_name, platform_instance)
        stored_state = await redis_client.get(f"social:oauth:state:{payload.state}")
        if not stored_state:
            raise HTTPException(status_code=400, detail="Invalid or expired state:")

        await redis_client.delete(f"social:oauth:state:{payload.state}")
        token_response = await platform.exchange_code_for_token(
            payload.code, payload.state
        )
        access_token, refresh_token = (
            token_response.get("access_token"),
            token_response.get("refresh_token"),
        )
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing access token.",
            )

        user_profile_response = await platform.fetch_user_profile(access_token)
        provider_account_id = user_profile_response.get("provider_account_id")
        if not provider_account_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No account ID found for the platform {platform_name}",
            )

        new_social_account = await link_social_account(
            db=db,
            user_id=current_user.id,
            platform_name=platform_name,
            platform_instance=platform_instance,
            provider_account_id=provider_account_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=token_response.get("expires_in", 0),
            username=user_profile_response.get("username"),
            global_name=user_profile_response.get("global_name"),
            avatar_url=user_profile_response.get("avatar_url"),
            profile_metadata=user_profile_response.get("metadata"),
        )

        await db.commit()
        await db.refresh(new_social_account)
        return new_social_account
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal server error occured: {str(e)}",
        )


@router.delete("/{platform_name}/unlink", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_account(
    platform_name: str,
    platform_instance: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Unlink the social account provided.

    Args:
        platform_name: The platform to unlink.
        platform_instance: The instance of the social platform(required for mastodon).
        current_user: The dependency function used for getting the current user before handling the request.
        db: The active database session for persisting account unlinking.

    Raises:
        HTTPException 404: If the account is not found.
        HTTPException 400: If platform instance is not provided.
        HTTPException 500: If an internal server error occured.
    """

    result = await unlink_social_account(
        db, current_user.id, platform_name, platform_instance
    )
    if result == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account not found: {platform_name}",
        )

    if result == "ambiguous":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Multiple instances found for this platform. Please provide the instance detail.",
        )

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occured.",
        )


@router.get("/accounts", response_model=List[SocialAccountResponse])
async def list_linked_accounts(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> Sequence[SocialAccount]:
    """Fetches all linked accounts for the user."""
    try:
        return await get_social_accounts(db, current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch accounts: {str(e)}",
        )
