"""Inference service wrapper for FastAPI dependency injection."""

from backend.app.config.settings import settings
from backend.app.inference.model_loader import ModelArtifactLoader
from backend.app.inference.engine import InferenceEngine


class InferenceService:
    """Service singleton managing model loading and execution lifecycle."""

    def __init__(self):
        self.loader = ModelArtifactLoader(
            checkpoint_path=settings.model_checkpoint_path,
            preprocessor_path=settings.preprocessor_path,
        )
        self.engine = InferenceEngine(loader=self.loader)

    def startup(self):
        """Called during application startup to load artifacts."""
        self.loader.load_artifacts()


# Global service instance
inference_service = InferenceService()
