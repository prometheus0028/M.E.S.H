"""Configuration module for MESH Backend."""

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Locate workspace/repo root
repo_root = Path(__file__).resolve().parents[3]
env_path = repo_root / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


def _resolve_path(env_var: str, default_rel: str) -> str:
    val = os.getenv(env_var, default_rel)
    path = Path(val)
    if not path.is_absolute():
        candidate = repo_root / path
        if candidate.exists():
            return str(candidate)
    return str(path)


class Settings(BaseModel):
    """Application settings loaded from environment or defaults."""

    app_name: str = "MESH Inference Service"
    version: str = "0.1.0"
    host: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = Field(default_factory=lambda: int(os.getenv("PORT", "8002")))
    
    model_checkpoint_path: str = Field(
        default_factory=lambda: _resolve_path("MODEL_CHECKPOINT_PATH", "./ml/checkpoints/latest.pt")
    )
    preprocessor_path: str = Field(
        default_factory=lambda: _resolve_path("PREPROCESSOR_PATH", "./ml/checkpoints/scaler.pkl")
    )
    dataset_processed_dir: str = Field(
        default_factory=lambda: _resolve_path("DATASET_PROCESSED_DIR", "./data/processed")
    )
    inference_timeout_ms: int = Field(
        default_factory=lambda: int(os.getenv("INFERENCE_TIMEOUT_MS", "500"))
    )
    log_level: str = Field(
        default_factory=lambda: os.getenv("LOG_LEVEL", "INFO")
    )


settings = Settings()

