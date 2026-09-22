"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config.settings import settings
from backend.app.utils.logging import setup_logging
from backend.app.services.inference_service import inference_service
from backend.app.api.endpoints import router as api_router


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

from backend.app.api.routes.data import router as data_router
app.include_router(data_router, prefix="/data", tags=["data"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )
