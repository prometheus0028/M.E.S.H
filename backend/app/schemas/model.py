"""Model metadata schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class ModelInfoResponse(BaseModel):
    """Model metadata and capabilities response schema."""
    
    model_version: Optional[str] = Field(default=None, description="Trained model version identifier")
    dataset_version: Optional[str] = Field(default=None, description="Dataset version model was trained on")
    architecture: Optional[str] = Field(
        default="1D-CNN + BiLSTM + Mask-aware Cross-Attention + Transformer",
        description="Architecture description"
    )
    supported_modalities: List[str] = Field(
        default_factory=list,
        description="List of sensor modality names supported by the model"
    )
    supported_targets: List[str] = Field(
        default_factory=list,
        description="List of target task heads supported (e.g., 'rul', 'fault_class', 'anomaly_score')"
    )
    is_loaded: bool = Field(default=False, description="Whether model weights are loaded and ready")
    checkpoint_path: str = Field(..., description="Checkpoint file location")
