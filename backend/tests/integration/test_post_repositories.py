import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.models import PostStatus, PostResultStatus
from src.posts.schemas import PostPlatformResultCreate
from src.posts.repository import get_post_by_id, get_posts, update_post_status, create_post_platform_result

async def test_create_post(test_user, test_post):
    post = await test_post()
    
    assert post.content == "Test post content"
    assert post.user_id == test_user.id
    assert post.status == PostStatus.PENDING
    assert post.options is None

async def test_get_post_by_id(db_session: AsyncSession, test_user, test_post):
    post = await test_post()
    
    post_res = await get_post_by_id(db_session, test_user.id, post.id)
    
    assert post_res is not None
    assert post.id == post_res.id

async def test_get_post_by_id_not_found(db_session: AsyncSession, test_user):
    post_res = await get_post_by_id(db_session, test_user.id, uuid.uuid4())

    assert post_res is None
    
async def test_get_posts_by_status(db_session: AsyncSession, test_user, test_post):
    post = await test_post()
    
    posts_res = await get_posts(db_session, test_user.id, PostStatus.PENDING)
    
    assert posts_res[0].id == post.id
    assert posts_res[0].status == post.status

async def test_update_post_status(db_session: AsyncSession, test_user, test_post):
    post = await test_post()
    
    updated = await update_post_status(db_session, test_user.id, post.id, status=PostStatus.SUCCESS)
    
    assert updated.status == PostStatus.SUCCESS

async def test_create_post_platform_result(db_session: AsyncSession, test_user, test_social_account, test_post):
    account = await test_social_account()
    post = await test_post()
    
    post_platform_result_data = PostPlatformResultCreate(
        platform_name="x",
        status=PostResultStatus.SUCCESS,
        post_url="https://post.com",
    )
    
    post_platform_result = await create_post_platform_result(
        db_session,
        post.id,
        account.id,
        post_platform_result_data
    )

    assert post_platform_result.post_id == post.id
    assert post_platform_result.social_account_id == account.id
    assert post_platform_result.status == PostResultStatus.SUCCESS
