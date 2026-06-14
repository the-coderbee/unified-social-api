import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.users.repository import get_user_by_email, get_user_by_id
from src.core.security import verify_password

test_email = "testuser@gmail.com"
raw_psw = "verysecretpassword"

async def test_create_user(test_user):
    assert test_user.email == test_email
    assert verify_password(raw_psw, test_user.hashed_password) == True
    assert test_user.is_active == True
    assert test_user.is_superuser == False

async def test_get_user_by_email(db_session: AsyncSession, test_user):
    user_obj = await get_user_by_email(db_session, test_email)
    assert user_obj == test_user
    
    invalid_user_obj = await get_user_by_email(db_session, "abcd@gmail.com")
    assert invalid_user_obj == None

async def test_get_user_by_id(db_session: AsyncSession, test_user):
    user = await get_user_by_id(db_session, str(test_user.id))
    
    assert user is not None
    assert user.id == test_user.id
    assert user.email == test_user.email

async def test_get_user_by_id_not_found(db_session: AsyncSession):
    user = await get_user_by_id(db_session, str(uuid.uuid4()))
    assert user is None

async def test_get_user_by_id_loads_social_accounts(db_session: AsyncSession, test_user, test_social_account):
    await test_social_account()
    user = await get_user_by_id(db_session, str(test_user.id))
    
    assert user is not None
    assert len(user.social_accounts) == 1
    assert user.social_accounts[0].platform == "x"
