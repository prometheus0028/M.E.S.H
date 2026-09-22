"""Health check schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""
    
    status: str = Field(..., description="Service status: healthy, degraded, or unhealthy")
    service: str = Field(default="mesh-inference-backend", description="Service identifier")
    version: str = Field(default="0.1.0", description="Service software version")
    model_loaded: bool = Field(default=False, description="Whether PyTorch model checkpoint is loaded")
    model_version: Optional[str] = Field(default=None, description="Loaded model version identifier")
    preprocessor_loaded: bool = Field(default=False, description="Whether scaler/preprocessor artifact is loaded")
    preprocessor_version: Optional[str] = Field(default=None, description="Loaded preprocessor version identifier")
    checkpoint_path: str = Field(..., description="Configured model checkpoint path")
    preprocessor_path: str = Field(..., description="Configured preprocessor artifact path")
