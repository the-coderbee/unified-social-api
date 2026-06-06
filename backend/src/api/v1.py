from fastapi import APIRouter

from src.social_accounts.router import router as social_router
from src.users.router import router as users_router
from src.posts.router import router as posts_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(social_router, prefix="/social")
api_router.include_router(users_router, prefix="/users")
api_router.include_router(posts_router, prefix="/posts")