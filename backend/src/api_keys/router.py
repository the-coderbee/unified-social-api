"""
API Key router handling key creation, listing and revocation.

Endpoints:
    POST /new              — Create a new API key.
    GET  /all              — List all API keys for the current user.
    PATCH /{id}/revoke     — Revoke an API key by ID.
"""

import uuid
from typing import List, Sequence

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import RateLimiter, get_current_user
from src.api_keys.models import APIKey
from src.api_keys.repository import (
    create_api_key,
    fetch_api_key_by_id,
    get_api_keys_by_user,
    revoke_api_key_by_id,
)
from src.api_keys.schemas import APIKeyCreate, APIKeyCreateResponse, APIKeyResponse
from src.core.database import get_db
from src.core.redis import redis_client
from src.core.security import generate_api_key_and_hash
from src.users.models import User

router = APIRouter(
    tags=["API"],
    dependencies=[Depends(RateLimiter(max_requests=300, window_seconds=60))],
)


@router.post("/new", response_model=APIKeyCreateResponse)
async def create_new_api_key(
    api_data: APIKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIKeyCreateResponse:
    """
    Create a new API Key for the user.

    Args:
        api_data: The input data form api key obtained through request.
        db: Active database session for persisting api key creation.
        current_user: The dependency to get the current user before handling the request.

    Returns:
        API key response data.

    Raises:
        HTTPException 500: If an internal server error occurs.
    """

    try:
        api_key, api_key_prefix, hashed_api_key = generate_api_key_and_hash()
        new_api = await create_api_key(
            db=db,
            api_key_in=api_data,
            hashed_key=hashed_api_key,
            key_prefix=api_key_prefix,
            user_id=current_user.id,
        )

        await db.commit()
        await db.refresh(new_api)

        response = APIKeyCreateResponse(
            id=new_api.id,
            name=new_api.name,
            scopes=new_api.scopes,
            api_key=api_key,
            created_at=new_api.created_at,
        )

        return response
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal server error occured: {str(e)}",
        )


@router.get("/all", response_model=List[APIKeyResponse])
async def fetch_all_keys(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Sequence[APIKey]:
    """
    Fetch all API keys for the current user.

    Returns:
        A list of API keys.
    """
    return await get_api_keys_by_user(db=db, user_id=current_user.id)


@router.patch("/{api_key_id}/revoke", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    api_key_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Revoke access of an API key by ID.

    Args:
        api_key_id: The id of the API key.
        db: Active database session for persisting API key status update.
        current_user: The dependency to get the current user before handling the request.

    Raises:
        HTTPException 404: If the requested API key is not found.
        HTTPException 403: If the requested API key does not belong to the current user.
        HTTPException 400: If revoking the API key fails.
        HTTPException 500: If an internal server error occurs.
    """

    try:
        api_key = await fetch_api_key_by_id(api_key_id=api_key_id, db=db)
        if api_key is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found."
            )

        if not api_key.user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The API does not belong to you.",
            )

        result = await revoke_api_key_by_id(api_key_id=api_key_id, db=db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Revoking API Key failed.",
            )

        await redis_client.delete(f"api_key_cache:{api_key.hashed_key}")
        await db.commit()

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal server error occured: {str(e)}",
        )
