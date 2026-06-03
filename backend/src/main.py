import src.core.base
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from src.core.database import engine
from src.core.redis import redis_client
from src.api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"status": "The API is alive and running."}

