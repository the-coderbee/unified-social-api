import asyncio
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.schemas import PostCreate, PostResponse, PostPlatformResultCreate
from src.posts.models import Post, PostResultStatus, PostStatus
from src.posts.repository import create_post as create_post_db, create_post_platform_result, get_posts as get_posts_db, get_post_by_id
from src.api.dependencies import get_current_user
from src.core.database import get_db
from src.users.models import User
from src.social_accounts.repository import get_social_accounts
from src.social_accounts.router import PLATFORMS


router = APIRouter(tags=["Posts"])

async def _process_post(post: Post, platforms: List[str], accounts_map: dict, db: AsyncSession):
    try:
        tasks = []
        for platform in platforms:
            account = accounts_map.get(platform)
            if account:
                tasks.append((platform, PLATFORMS.get(platform).publish_post(account.access_token, post.content)))

        results = await asyncio.gather(*[task[1] for task in tasks], return_exceptions=True)
        
        partial_success = False
        failed = False
        post_platform_results = []
        for (platform, _), result in zip(tasks, results):
            post_platform_result_data = PostPlatformResultCreate(platform_name=platform, status=PostResultStatus.FAILED)
            if isinstance(result, Exception):
                post_platform_result_data.error_message = str(result)
                if not failed:
                    failed = True
            else:
                post_platform_result_data.status = PostResultStatus.SUCCESS
                post_platform_result_data.post_url = result.get("post_url")
                if not partial_success:
                    partial_success = True
            
            post_platform_result = await create_post_platform_result(db, post.id, accounts_map.get(platform).id, post_platform_result_data)
            post_platform_results.append(post_platform_result)
        
        if failed:
            post.status = PostStatus.PARTIAL_SUCCESS if partial_success else PostStatus.FAILED
        else:
            post.status = PostStatus.SUCCESS
        
        await db.commit()
        await db.refresh(post)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    return post, post_platform_results


@router.post("/", response_model=PostResponse)
async def create_post(post_data: PostCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    social_accounts = await get_social_accounts(db, current_user.id)
    accounts_map = {account.platform: account for account in social_accounts}
    not_connected_platforms = [platform for platform in post_data.platforms if platform not in accounts_map]
    post = await create_post_db(db, current_user.id, post_data)
    
    post, post_platform_results = await _process_post(post, post_data.platforms, accounts_map, db)
    
    return {
        "id": post.id,
        "content": post.content,
        "status": post.status,
        "created_at": post.created_at,
        "results": post_platform_results,
        "not_connected_platforms": not_connected_platforms
    }

@router.post("/{post_id}/retry", response_model=PostResponse)
async def retry_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = await get_post_by_id(db, current_user.id, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.status == PostStatus.SUCCESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Post already successful")
    social_accounts = await get_social_accounts(db, current_user.id)
    accounts_map = {account.platform: account for account in social_accounts}
    platforms_to_retry = [result.platform_name for result in post.platform_results if result.status == PostResultStatus.FAILED]
    post, post_platform_results = await _process_post(post, platforms_to_retry, accounts_map, db)
    return {
        "id": post.id,
        "content": post.content,
        "status": post.status,
        "created_at": post.created_at,
        "results": post_platform_results,
        "not_connected_platforms": []
    }

router.get("/", response_model=list[PostResponse])
async def get_posts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user), status: PostStatus = None):
    return await get_posts_db(db, current_user.id, status)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = await get_post_by_id(db, current_user.id, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post

