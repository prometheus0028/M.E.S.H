"""Configuration module for MESH Backend."""

import os
from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Application settings loaded from environment or defaults."""

    app_name: str = "MESH Inference Service"
    version: str = "0.1.0"
    host: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    
    model_checkpoint_path: str = Field(
        default_factory=lambda: os.getenv("MODEL_CHECKPOINT_PATH", "./ml/checkpoints/latest.pt")
    )
    preprocessor_path: str = Field(
        default_factory=lambda: os.getenv("PREPROCESSOR_PATH", "./ml/checkpoints/scaler.pkl")
    )
    dataset_processed_dir: str = Field(
        default_factory=lambda: os.getenv("DATASET_PROCESSED_DIR", "./data/processed")
    )
    inference_timeout_ms: int = Field(
        default_factory=lambda: int(os.getenv("INFERENCE_TIMEOUT_MS", "500"))
    )
    log_level: str = Field(
        default_factory=lambda: os.getenv("LOG_LEVEL", "INFO")
    )


settings = Settings()
