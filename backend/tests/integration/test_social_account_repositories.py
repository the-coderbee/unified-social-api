import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.social_accounts.repository import get_social_accounts, update_social_account_tokens, unlink_social_account

async def test_link_social_account(test_user, test_social_account):
    account = await test_social_account()
    
    assert account.user_id == test_user.id
    assert account.platform == "x"
    assert account.provider_account_id == "fake_id_123"
    assert account.access_token == "fake_access_token"
    assert account.refresh_token == "fake_refresh_token"
    assert account.username == "testuser"
    assert account.global_name == "Test User"
    assert account.avatar_url == "https://example.com/avatar.png"
    assert account.profile_metadata == {}

async def test_link_social_account_updates_existing(test_user, test_social_account):
    await test_social_account()
    account = await test_social_account(access_token="new_fake_access_token", refresh_token="new_fake_refresh_token")
    
    assert account.user_id == test_user.id
    assert account.access_token == "new_fake_access_token"

async def test_update_social_account_tokens(db_session: AsyncSession, test_social_account):
    account = await test_social_account()
    updated = await update_social_account_tokens(
        db_session, 
        account.id, 
        new_access_token="newest_fake_access_token", 
        new_refresh_token="newest_fake_refresh_token",
        expires_in=3200
    )
    
    assert updated.id == account.id
    assert account.access_token == "newest_fake_access_token"
    assert account.refresh_token == "newest_fake_refresh_token"

async def test_update_social_account_tokens_not_found(db_session: AsyncSession):
    with pytest.raises(ValueError):
        await update_social_account_tokens(
            db_session,
            account_id=uuid.uuid4(),
            new_access_token="token",
            new_refresh_token="refresh",
            expires_in=3200
        )

async def test_get_social_accounts(db_session: AsyncSession, test_user, test_social_account):
    await test_social_account()
    accounts = await get_social_accounts(db_session, test_user.id)
    
    assert len(accounts) == 1
    assert accounts[0].platform == "x"

async def test_unlink_social_account(db_session: AsyncSession, test_social_account):
    account = await test_social_account()
    result = await unlink_social_account(db_session, account.platform, account.user_id)
    
    assert result == True

async def test_unlink_nonexistent_account(db_session: AsyncSession):
    result = await unlink_social_account(db_session, platform_name="x", user_id=uuid.uuid4())
    
    assert result == False