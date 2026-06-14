import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

from src.core.config import settings
from src.core.base import Base
from src.auth.schemas import UserCreate
from src.users.repository import create_user
from src.social_accounts.repository import link_social_account
from src.main import app
from src.core.database import get_db

TEST_DATABASE_URL = str(settings.TEST_DATABASE_URL)
assert "test" in TEST_DATABASE_URL, "TEST_DATABASE_URL must contain 'test' to prevent accidental dev database wipe"

@pytest_asyncio.fixture(scope="session")
async def setup_database():
    engine_test = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine_test.dispose()

@pytest_asyncio.fixture
async def db_session(setup_database):
    engine_test = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async_session_maker = async_sessionmaker(engine_test, expire_on_commit=False)

    async with async_session_maker() as session:
        yield session
    
    async with engine_test.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
    
    await engine_test.dispose()

@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
    
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    user_data = UserCreate(email="testuser@gmail.com", password="verysecretpassword")
    user = await create_user(db_session, user_data)
    return user

@pytest_asyncio.fixture
async def test_social_account(db_session: AsyncSession, test_user):
    async def _create(access_token = "fake_access_token", refresh_token= "fake_refresh_token"):
        return await link_social_account(
            db_session,
            test_user.id,
            platform_name="x",
            provider_account_id="fake_id_123",
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=7200,
            username="testuser",
            global_name="Test User",
            avatar_url="https://example.com/avatar.png"
        )
    return _create

@pytest_asyncio.fixture
async def test_post(db_session: AsyncSession, test_user):
    async def _create(content="Test post content", platforms=["x"]):
        from src.posts.schemas import PostCreate
        from src.posts.repository import create_post
        post_data = PostCreate(content=content, platforms=platforms)
        return await create_post(db=db_session, user_id=test_user.id, post_data=post_data)
    
    return _create

@pytest_asyncio.fixture
async def test_api_key(db_session: AsyncSession, test_user):
    from src.api_keys.repository import create_api_key
    from src.api_keys.schemas import APIKeyCreate
    from src.core.security import hash_api_key, generate_api_key_and_hash
    
    raw_key, api_key_prefix, hashed_key = generate_api_key_and_hash()
    api_key_data = APIKeyCreate(name="Test API Key", scopes=["read:posts", "write:posts"])
    
    api_key_obj = await create_api_key(db_session, api_key_data, hashed_key, api_key_prefix, test_user.id)

    return api_key_obj

@pytest_asyncio.fixture(autouse=True)
async def clear_rate_limits():
    from src.core.redis import redis_client
    async for key in redis_client.scan_iter("rate_limit:*"):
        await redis_client.delete(key)
    yield
