from datetime import timedelta
import time
import pytest
from src.core.security import create_access_token
from src.core.config import settings
import jwt


def test_create_access_token():
    user = "testuser"
    token = create_access_token(user)
    assert token is not None
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    user_id = payload.get("sub")
    expires = payload.get("exp")
    assert user_id == "testuser"
    assert expires is not None

def test_create_access_token_expiration():
    user = "testuser"
    token = create_access_token(user, expires_delta=timedelta(seconds=1))
    time.sleep(2) # wait for token to expire
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def test_create_access_token_with_wrong_algorithm():
    user = "testuser"
    token = create_access_token(user)
    with pytest.raises(jwt.InvalidAlgorithmError):
        jwt.decode(token, settings.SECRET_KEY, algorithms=["HS384"])
