"""Model and preprocessor artifact loader."""

import os
import logging
from typing import Any, Dict, List, Optional
from ml.inference.interface import MESHInferenceEngine

logger = logging.getLogger(__name__)


class ModelArtifactLoader:
    """Manages loading and validation of trained PyTorch model checkpoints and scalers."""

    def __init__(self, checkpoint_path: str, preprocessor_path: str):
        self.checkpoint_path = checkpoint_path
        self.preprocessor_path = preprocessor_path
        self.model: Optional[MESHInferenceEngine] = None
        self.preprocessor: Optional[Any] = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.model_version: Optional[str] = None
        self.dataset_version: Optional[str] = None
        self.supported_modalities: List[str] = []
        self.supported_targets: List[str] = []

    def load_artifacts(self) -> bool:
        """Attempt to load model checkpoint and preprocessor from disk."""
        # 1. Check if model checkpoint exists
        if not os.path.exists(self.checkpoint_path):
            logger.warning(
                f"Model checkpoint not found at: {self.checkpoint_path}. "
                "Backend running in artifact-pending mode."
            )
            self.is_loaded = False
            return False

        try:
            self.model = MESHInferenceEngine(self.checkpoint_path)
            self.model_version = getattr(self.model, "model_version", "v1.0.0")
            self.dataset_version = getattr(self.model, "train_config", {}).get("dataset_id", "unknown")
            self.supported_modalities = getattr(self.model, "native_modalities", ["temperature", "vibration", "pressure"])
            self.supported_targets = ["rul", "fault_class", "anomaly"]
            
            self.is_loaded = True
            logger.info(f"Model checkpoint successfully loaded from {self.checkpoint_path}")
        except Exception as e:
            logger.error(f"Failed to load PyTorch model checkpoint from {self.checkpoint_path}: {e}")
            self.is_loaded = False
            return False

        # 2. Check preprocessor artifact
        if os.path.exists(self.preprocessor_path):
            try:
                import pickle
                with open(self.preprocessor_path, "rb") as f:
                    self.preprocessor = pickle.load(f)
                logger.info(f"Preprocessor artifact successfully loaded from {self.preprocessor_path}")
            except Exception as e:
                logger.warning(f"Failed to load preprocessor artifact: {e}")
                self.preprocessor = None
        else:
            logger.info(f"No preprocessor artifact found at: {self.preprocessor_path}")

        return self.is_loaded

    def get_info(self) -> Dict[str, Any]:
        """Return loaded artifact metadata."""
        return {
            "is_loaded": self.is_loaded,
            "model_version": self.model_version,
            "dataset_version": self.dataset_version,
            "checkpoint_path": self.checkpoint_path,
            "preprocessor_path": self.preprocessor_path,
            "preprocessor_loaded": self.preprocessor is not None,
            "supported_modalities": self.supported_modalities,
            "supported_targets": self.supported_targets,
        }
