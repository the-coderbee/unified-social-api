from fastapi import APIRouter, Depends

from src.api.dependencies import RateLimiter, get_current_user
from src.users.models import User
from src.users.schemas import UserResponse


router = APIRouter(tags=['Users'], dependencies=[Depends(RateLimiter(max_requests=30, window_seconds=60))])

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
