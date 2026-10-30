"""Model and preprocessor artifact loader."""

import os
import logging
from typing import Any, Dict, List, Optional
from ml.inference.interface import MESHInferenceEngine
from app.config.settings import settings

logger = logging.getLogger(__name__)


class ModelArtifactLoader:
    """Manages loading and validation of trained PyTorch model checkpoints and scalers."""

    def __init__(self, checkpoint_path: str, preprocessor_path: str):
        self.checkpoint_path = checkpoint_path
        self.preprocessor_path = preprocessor_path
        self.model: Optional[MESHInferenceEngine] = None
        self.models: Dict[str, MESHInferenceEngine] = {}
        self.preprocessor: Optional[Any] = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.model_version: Optional[str] = None
        self.dataset_version: Optional[str] = None
        self.supported_modalities: List[str] = []
        self.supported_targets: List[str] = []

    def load_artifacts(self) -> bool:
        """Attempt to load model checkpoint and preprocessor from disk."""
        # 1. Primary checkpoint
        if os.path.exists(self.checkpoint_path):
            try:
                self.model = MESHInferenceEngine(self.checkpoint_path)
                self.model_version = getattr(self.model, "model_version", "v1.0.0")
                self.dataset_version = getattr(self.model, "train_config", {}).get("dataset_id", "unknown")
                self.supported_modalities = getattr(
                    self.model,
                    "native_modalities",
                    ["temperatures", "pressures", "speeds", "gas_flow", "operational_settings"]
                )
                self.supported_targets = ["rul", "fault_class", "anomaly"]
                self.is_loaded = True

                model_type = getattr(self.model, "model_type", "MESHModel")
                if model_type == "AI4IModel":
                    self.models["ai4i"] = self.model
                    self.models["ai4i2020"] = self.model
                else:
                    self.models["cmapss"] = self.model
                    self.models["cmapss_fd001"] = self.model
                logger.info(f"Primary model checkpoint successfully loaded from {self.checkpoint_path}")
            except Exception as e:
                logger.error(f"Failed to load PyTorch model checkpoint from {self.checkpoint_path}: {e}")
                self.is_loaded = False
        else:
            logger.warning(
                f"Primary model checkpoint not found at: {self.checkpoint_path}. "
                "Checking fallback checkpoints..."
            )

        # 2. Discover and load dataset-specific models (CMAPSS & AI4I)
        known_checkpoints = {
            "cmapss": ["ml/checkpoints/cmapss/cmapss_v1_trained.pt", "ml/checkpoints/cmapss/model_best.pt", "ml/checkpoints/latest.pt", "checkpoints/cmapss/cmapss_v1_trained.pt"],
            "ai4i": ["ml/checkpoints/ai4i/ai4i_v1_trained.pt", "ml/checkpoints/ai4i/model_best.pt", "checkpoints/ai4i/ai4i_v1_trained.pt"],
        }

        # Resolve paths relative to settings or CWD
        repo_root = getattr(settings, "repo_root", None)

        for key, rel_list in known_checkpoints.items():
            if key not in self.models:
                for rel in rel_list:
                    candidates = [rel]
                    if repo_root:
                        candidates.append(os.path.join(repo_root, rel))
                    for cand in candidates:
                        if os.path.exists(cand):
                            try:
                                eng = MESHInferenceEngine(cand)
                                self.models[key] = eng
                                if key == "cmapss":
                                    self.models["cmapss_fd001"] = eng
                                elif key == "ai4i":
                                    self.models["ai4i2020"] = eng
                                logger.info(f"Successfully loaded {key} model from {cand}")
                                break
                            except Exception as e:
                                logger.warning(f"Could not load candidate checkpoint {cand}: {e}")
                    if key in self.models:
                        break

        # If primary model failed to load but secondary models loaded, set default model
        if self.model is None and self.models:
            self.model = next(iter(self.models.values()))
            self.model_version = getattr(self.model, "model_version", "v1.0.0")
            self.supported_modalities = getattr(self.model, "native_modalities", [])
            self.supported_targets = ["rul", "fault_class", "anomaly"]
            self.is_loaded = True

        # 3. Check preprocessor artifact
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

    def get_model(self, dataset_id: Optional[str] = None) -> Optional[MESHInferenceEngine]:
        """Return dataset-specific model if available, else default model."""
        if dataset_id:
            ds_lower = dataset_id.lower()
            for key, m in self.models.items():
                if key in ds_lower:
                    return m
        return self.model

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
            "available_models": list(self.models.keys()),
        }

