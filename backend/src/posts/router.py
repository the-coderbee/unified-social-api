"""
Posts router handling post registration, retry, and post status updation.

Endpoints:
    POST /     — Register and publish a new post in the system.
    GET /     — Fetch all posts for the current user.
    POST /{post_id}/retry     — Retry the failed post by post ID.
    GET /{post_id}     — Fetch post by post ID for the current user.
"""

import asyncio
import uuid
from datetime import datetime
from typing import List, Optional, Sequence, Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import RateLimiter, get_current_user
from src.core.database import get_db
from src.posts.models import Post, PostPlatformResult, PostResultStatus, PostStatus
from src.posts.repository import create_post as create_post_db
from src.posts.repository import create_post_platform_result, get_post_by_id
from src.posts.repository import get_posts as get_posts_db
from src.posts.schemas import (
    PostCreate,
    PostPlatformResultCreate,
    PostPlatformResultResponse,
    PostResponse,
)
from src.social_accounts.repository import get_social_accounts
from src.social_accounts.services import get_platform_instance, get_valid_access_token
from src.users.models import User

router = APIRouter(
    tags=["Posts"],
    dependencies=[Depends(RateLimiter(max_requests=30, window_seconds=60))],
)


async def _process_post(
    post: Post, platforms: List[str], accounts_map: dict, db: AsyncSession
) -> Tuple[Post, List[PostPlatformResult]]:
    """
    Private function for processing and publishing posts.

    Uses asyncio gather for execution simultaneous publishing tasks to multiple platforms
    and gather results for each of them.

    Args:
        post: The Post object to be publshed.
        platforms: The list of platforms to publish on.
        accounts_map: The map object of social accounts linked to the user.
        db: Active session for persisting the new post.

    Returns:
        Post object and PostPlatformResults (list of publish results) as a tuple.

    Raises:
        HTTPException 500: If internal server error occurs.
    """

    try:
        tasks = []
        for platform in platforms:
            account = accounts_map.get(platform)
            if account:
                token = await get_valid_access_token(db, account)
                tasks.append(
                    (
                        platform,
                        get_platform_instance(platform).publish_post(
                            token, post.content
                        ),
                    )
                )

        results = await asyncio.gather(
            *[task[1] for task in tasks], return_exceptions=True
        )

        partial_success = False
        failed = False
        post_platform_results: List[PostPlatformResult] = []
        for (platform, _), result in zip(tasks, results):
            post_platform_result_data = PostPlatformResultCreate(
                platform_name=platform, status=PostResultStatus.FAILED
            )
            if isinstance(result, BaseException):
                post_platform_result_data.error_message = str(result)
                if not failed:
                    failed = True
            else:
                post_platform_result_data.status = PostResultStatus.SUCCESS
                post_platform_result_data.post_url = result.get("post_url")
                if not partial_success:
                    partial_success = True

            post_platform_result = await create_post_platform_result(
                db, post.id, accounts_map[platform].id, post_platform_result_data
            )
            post_platform_results.append(post_platform_result)

        if failed:
            post.status = (
                PostStatus.PARTIAL_SUCCESS if partial_success else PostStatus.FAILED
            )
        else:
            post.status = PostStatus.SUCCESS

        await db.commit()
        await db.refresh(post)

        return post, post_platform_results
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    """
    Create a new post and publish it to the linked platforms.

    Args:
        post_data: The post data obtained from the request body.
        db: Active session for persisting the new post.
        current_user: Dependency for fetching current user before handling the request.

    Returns:
        Dictionary containing:
            id (UUID): The post ID.
            content (str): The content of the post.
            status (PostStatus): The status of the post.
            created_at (timestamp): The timestamp of the post creation.
            results (List[PostPlatformResults]): The list of post platform results.
            not_connected_platforms: The list of platforms that were provided in the argument
            but were found not connected.
    """

    social_accounts = await get_social_accounts(db, current_user.id)
    accounts_map = {account.platform: account for account in social_accounts}
    not_connected_platforms = [
        platform for platform in post_data.platforms if platform not in accounts_map
    ]
    post = await create_post_db(db, current_user.id, post_data)

    post, post_platform_results = await _process_post(
        post, post_data.platforms, accounts_map, db
    )

    post_response = PostResponse(
        id=post.id,
        content=post.content,
        status=post.status,
        created_at=post.created_at,
        results=[
            PostPlatformResultResponse.model_validate(r) for r in post_platform_results
        ],
        not_connected_platforms=not_connected_platforms,
    )
    return post_response


@router.post("/{post_id}/retry", response_model=PostResponse)
async def retry_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    """
    Retry to publish a failed post again without resubmitting the content.

    Args:
        post_id: The ID of the post to be re-published.
        db: Active database session for persisting post updation.
        current_user: The dependency funtion to get the current user before handling the request.

    Returns:
        Dictionary containing:
            id (UUID): The post ID.
            content (str): The content of the post.
            status (PostStatus): The status of the post.
            created_at (timestamp): The timestamp of the post creation.
            results (List[PostPlatformResults]): The list of post platform results.
            not_connected_platforms: The list of platforms that were provided in the argument
            but were found not connected.

    Raises:
        HTTPException 400: If post was already successfuly published.
        HTTPException 404: If the post associated with the provided ID does not exist.
    """

    post = await get_post_by_id(db, current_user.id, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    if post.status == PostStatus.SUCCESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Post already successful"
        )
    social_accounts = await get_social_accounts(db, current_user.id)
    accounts_map = {account.platform: account for account in social_accounts}
    platforms_to_retry = [
        result.platform_name
        for result in post.platform_results
        if result.status == PostResultStatus.FAILED
    ]
    post, post_platform_results = await _process_post(
        post, platforms_to_retry, accounts_map, db
    )
    post_response = PostResponse(
        id=post.id,
        content=post.content,
        status=post.status,
        created_at=post.created_at,
        results=[
            PostPlatformResultResponse.model_validate(r) for r in post_platform_results
        ],
        not_connected_platforms=[],
    )
    return post_response


@router.get("/", response_model=list[PostResponse])
async def get_posts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[PostStatus] = None,
    platform: Optional[str] = None,
    created_after: Optional[datetime] = None,
    created_before: Optional[datetime] = None,
) -> Sequence[Post]:
    """
    Fetch and return a list of post objects can also be filtered by status.

    Args:
        db: The active db session for fetching the posts.
        current_user: The dependency function to get the current user before handling the request.
        status: The PostStatus value to use for filtering the posts query.
        platform: The platform to query the posts for.
        created_before: The starting timestamp to use for querying posts.
        created_after: The end timestamp to use for querying posts.

    Returns:
        A list of post objects.
    """

    return await get_posts_db(
        db, current_user.id, status, platform, created_before, created_after
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Post:
    """Fetch post for a user by post ID."""
    post = await get_post_by_id(db, current_user.id, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    return post
