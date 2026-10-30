"""Main FastAPI application entry point."""

import sys
from pathlib import Path

# Ensure backend directory and repository root are on sys.path
backend_dir = Path(__file__).resolve().parent
repo_root = backend_dir.parent

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.utils.logging import setup_logging
from app.services.inference_service import inference_service
from app.api.endpoints import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown."""
    setup_logging()
    # Attempt to load model artifacts on startup
    inference_service.startup()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Multisensor Engine for System Health — Predictive Maintenance Inference Service",
    lifespan=lifespan,
)

# CORS middleware for Streamlit/dashboard communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

from app.api.routes.data import router as data_router

app.include_router(data_router, prefix="/data", tags=["data"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
    )
