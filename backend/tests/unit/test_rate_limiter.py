from unittest.mock import patch, MagicMock, AsyncMock
import pytest
from fastapi import HTTPException

from src.api.dependencies import RateLimiter

@pytest.fixture
def mock_request():
    request = MagicMock()
    request.client.host = "127.0.0.1"
    request.headers.get.return_value = ""
    return request

@pytest.fixture
def mock_redis_client():
    redis_client = MagicMock()
    redis_client.zcard = AsyncMock(return_value=0)
    redis_client.zadd = AsyncMock()
    redis_client.expire = AsyncMock()
    return redis_client

@patch("src.api.dependencies.redis_client")
async def test_rate_limiter_allows_request(mock_redis, mock_request):
    mock_redis.zcard = AsyncMock(return_value=1)
    rate_limiter = RateLimiter(max_requests=10, window_seconds=60)
    await rate_limiter(mock_request)

@patch("src.api.dependencies.redis_client")
async def test_rate_limiter_blocks_request(mock_redis, mock_request):
    mock_redis.zremrangebyscore = AsyncMock()
    mock_redis.zcard = AsyncMock(return_value=100)
    rate_limiter = RateLimiter(max_requests=10, window_seconds=60)
    with pytest.raises(HTTPException) as exc_info:
        await rate_limiter(mock_request)
    assert exc_info.value.status_code == 429