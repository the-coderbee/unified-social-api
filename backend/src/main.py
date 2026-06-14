"""
Application entry point for the Unified Social API.

Initializes the FastAPI application with CORS middleware, database and Redis
connection verification on startup, graceful shutdown handling, and API router registration.
"""

from contextlib import asynccontextmanager
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

import src.core.base
from src.api.v1 import api_router
from src.core.config import settings
from src.core.database import engine
from src.core.redis import redis_client


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Manages application lifespan events.

    On startup: verifies PostgreSQL and Redis connections are healthy.
    On shutdown: gracefully closes all database and Redis connections.

    Raises:
        Exception: If database or Redis connection fails on startup.
    """
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            print("PostgreSQL connection successful")
        await redis_client.ping()
        print("Redis connection successful")
    except Exception as e:
        print(f"Error: {e}")
        raise e

    yield

    print("Initiating graceful shutdown...")
    await engine.dispose()
    await redis_client.aclose()
    print("All connections closed.")


app = FastAPI(title="Unified Social API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(api_router)


@app.get("/")
def read_root() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "The API is alive and running."}
