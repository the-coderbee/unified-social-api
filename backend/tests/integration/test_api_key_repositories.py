import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.api_keys.repository import (
    get_api_keys_by_user, 
    get_api_key_by_hash, 
    fetch_api_key_by_id, 
    revoke_api_key_by_id
)

async def test_create_api_key(test_api_key):
    assert test_api_key is not None

async def test_get_api_keys_by_user(db_session: AsyncSession, test_user, test_api_key):
    api_keys = await get_api_keys_by_user(db_session, test_user.id)
    
    assert api_keys is not None
    assert api_keys[0].id == test_api_key.id

async def test_get_api_key_by_hash(db_session: AsyncSession, test_api_key):    
    api_key_obj = await get_api_key_by_hash(db_session, test_api_key.hashed_key)
    
    assert api_key_obj.id == test_api_key.id

async def test_fetch_api_key_by_id(db_session: AsyncSession, test_api_key):    
    api_key_obj = await fetch_api_key_by_id(db_session, test_api_key.id)
    
    assert api_key_obj.id == test_api_key.id

async def test_revoke_api_key_by_id(db_session: AsyncSession, test_api_key):    
    result = await revoke_api_key_by_id(db_session, test_api_key.id)
    
    assert result == True
    assert test_api_key.is_active == False

async def test_revoke_api_key_by_id_not_found(db_session: AsyncSession):
    result = await revoke_api_key_by_id(db_session, uuid.uuid4())
    
    assert result == False
