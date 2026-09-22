"""Inference request and response schemas adhering to the MESH contract."""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class ModalityData(BaseModel):
    """Container for sensor readings over a temporal window."""
    # Values can be 1D time series (list of floats) or 2D (timesteps x channels)
    values: List[Union[float, List[float]]] = Field(
        ...,
        description="Temporal readings for this sensor modality over the window (e.g. 20 timesteps)"
    )


class InferenceRequest(BaseModel):
    """Inference request payload."""
    
    dataset_id: str = Field(..., description="Source dataset identifier (e.g., 'femto_bearing', 'ai4i')")
    dataset_version: Optional[str] = Field(default=None, description="Dataset release/split version")
    run_id: Optional[str] = Field(default=None, description="Run or asset identifier")
    window_index: Optional[int] = Field(default=None, description="Window sequence index")
    
    # Map of modality name to sensor readings
    window: Dict[str, Any] = Field(
        ...,
        description="Dict mapping modality name to temporal measurements over the window"
    )
    
    # Modality availability mask (1 = available, 0 = missing/dropped)
    modality_mask: Dict[str, int] = Field(
        ...,
        description="Binary mask per modality (1 = available, 0 = unavailable)"
    )


class PredictionOutputs(BaseModel):
    """Task head predictions produced by the model."""
    
    rul: Optional[float] = Field(default=None, description="Remaining Useful Life estimate (time units or cycles)")
    fault_class: Optional[Union[str, int]] = Field(default=None, description="Predicted fault mode/class label")
    fault_probabilities: Optional[Dict[str, float]] = Field(default=None, description="Class probability distribution")
    anomaly_score: Optional[float] = Field(default=None, description="Anomaly score from task head")


class UncertaintyOutputs(BaseModel):
    """Quantified uncertainty and calibration outputs."""
    
    rul_interval: Optional[List[float]] = Field(
        default=None,
        description="Prediction interval for RUL [lower_bound, upper_bound]"
    )
    confidence_level: Optional[float] = Field(default=0.90, description="Confidence level for prediction interval")
    entropy: Optional[float] = Field(default=None, description="Classification predictive entropy")
    calibration_score: Optional[float] = Field(default=None, description="Post-hoc calibration metric (e.g., ECE)")


class AttentionEvidence(BaseModel):
    """Model attention weights for explainability."""
    
    modality_weights: Dict[str, float] = Field(
        default_factory=dict,
        description="Cross-attention weights assigned across available modalities (summing to 1.0)"
    )
    temporal_weights: Optional[List[float]] = Field(
        default=None,
        description="Temporal attention weights across window timesteps"
    )


class InferenceResponse(BaseModel):
    """Structured inference response conforming to the MESH contract."""
    
    model_version: Optional[str] = Field(default=None, description="Model checkpoint version used")
    dataset_version: Optional[str] = Field(default=None, description="Dataset version reference")
    prediction: PredictionOutputs = Field(default_factory=PredictionOutputs, description="Model predictions")
    uncertainty: UncertaintyOutputs = Field(default_factory=UncertaintyOutputs, description="Uncertainty quantification")
    modality_status: Dict[str, str] = Field(
        default_factory=dict,
        description="Operational status per modality: 'available', 'unavailable', or 'dropped'"
    )
    attention: AttentionEvidence = Field(default_factory=AttentionEvidence, description="Cross-attention weights")
    explanations: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Additional feature attribution or SHAP values if calculated"
    )
    latency_ms: float = Field(..., description="Inference latency in milliseconds")


class MissingModalityComparisonRequest(BaseModel):
    """Request to compare inference between baseline and dropped modality."""
    
    dataset_id: str = Field(..., description="Source dataset identifier")
    dataset_version: Optional[str] = Field(default=None, description="Dataset version reference")
    run_id: Optional[str] = Field(default=None, description="Run or asset identifier")
    window: Dict[str, Union[List[float], List[List[float]]]] = Field(
        ...,
        description="Sensor measurements over the window"
    )
    baseline_mask: Dict[str, int] = Field(
        ...,
        description="Original modality mask (e.g. all available modalities set to 1)"
    )
    dropped_modality: str = Field(
        ...,
        description="Modality to mask out (set to 0) for the experiment"
    )


class ComparisonDelta(BaseModel):
    """Measured impact of dropping the modality."""
    
    rul_delta: Optional[float] = Field(
        default=None,
        description="Change in RUL prediction (dropped - baseline)"
    )
    fault_class_changed: Optional[bool] = Field(
        default=None,
        description="Whether fault classification changed under dropped modality"
    )
    uncertainty_widened: Optional[bool] = Field(
        default=None,
        description="Whether prediction interval widened when modality was dropped"
    )
    rul_interval_width_delta: Optional[float] = Field(
        default=None,
        description="Change in prediction interval width"
    )


class MissingModalityComparisonResponse(BaseModel):
    """Response comparing baseline prediction vs dropped modality prediction."""
    
    dropped_modality: str = Field(..., description="Modality that was dropped in experiment")
    baseline: InferenceResponse = Field(..., description="Inference result with full baseline mask")
    dropped: InferenceResponse = Field(..., description="Inference result with dropped modality mask")
    delta: ComparisonDelta = Field(default_factory=ComparisonDelta, description="Quantified performance delta")
