"""
Database queries and operations for post management.

Contains async repository functions for creating, fetching,
and updating post records in the database.
"""

import uuid
from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.posts.models import Post, PostPlatformResult, PostStatus
from src.posts.schemas import PostCreate, PostPlatformResultCreate


async def create_post(
    db: AsyncSession, user_id: uuid.UUID, post_data: PostCreate
) -> Post:
    new_post = Post(user_id=user_id, **post_data.model_dump(exclude={"platforms"}))
    db.add(new_post)
    await db.flush()

    return new_post


async def create_post_platform_result(
    db: AsyncSession,
    post_id: uuid.UUID,
    social_account_id: uuid.UUID,
    post_platform_result_data: PostPlatformResultCreate,
) -> PostPlatformResult:
    """
    Create new platform result record.

    Args:
        db: Active db session
        post_id: The post ID of which the platform result belongs to.
        social_account_id: The ID associated of the platform associated with the result.
        post_platform_result_data: The platform's result data.

    Returns:
        The platform result response.
    """

    new_post_platform_result = PostPlatformResult(
        post_id=post_id,
        social_account_id=social_account_id,
        **post_platform_result_data.model_dump(),
    )
    db.add(new_post_platform_result)
    await db.flush()

    return new_post_platform_result


async def get_post_by_id(
    db: AsyncSession, user_id: uuid.UUID, post_id: uuid.UUID
) -> Optional[Post]:
    """Fetch post for a user by post ID."""
    query = (
        select(Post)
        .where(Post.id == post_id, Post.user_id == user_id)
        .options(selectinload(Post.platform_results))
    )
    result = await db.execute(query)
    post = result.scalar_one_or_none()

    return post


async def get_posts(
    db: AsyncSession,
    user_id: uuid.UUID,
    status: Optional[PostStatus] = None,
    platform: Optional[str] = None,
    created_before: Optional[datetime] = None,
    created_after: Optional[datetime] = None,
) -> Sequence[Post]:
    """
    Fetch all posts for a user.

    Posts can be filtered by status.

    Args:
        db: Active database session.
        user_id: The user requesting the posts.
        status: Optional status parameter for filtering posts.

    Returns:
        List of Post objects.
    """

    query = select(Post).where(Post.user_id == user_id)
    if status:
        query = query.where(Post.status == status)

    if platform:
        query = (
            query.join(PostPlatformResult)
            .where(PostPlatformResult.platform_name == platform)
            .distinct()
        )

    if created_before:
        query = query.where(Post.created_at <= created_before)

    if created_after:
        query = query.where(Post.created_at >= created_after)

    result = await db.execute(query)
    posts = result.scalars().all()

    return posts


async def update_post_status(
    db: AsyncSession, user_id: uuid.UUID, post_id: uuid.UUID, status: PostStatus
) -> Optional[Post]:
    """Update post status of a post queried by ID."""
    query = select(Post).where(Post.id == post_id, Post.user_id == user_id)
    result = await db.execute(query)
    post = result.scalar_one_or_none()
    if post:
        post.status = status
        db.add(post)
        await db.flush()

    return post
