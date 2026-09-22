"""API router implementing MESH inference and health endpoints."""

import logging
from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.health import HealthResponse
from backend.app.schemas.model import ModelInfoResponse
from backend.app.schemas.inference import (
    InferenceRequest,
    InferenceResponse,
    MissingModalityComparisonRequest,
    MissingModalityComparisonResponse,
)
from backend.app.services.inference_service import inference_service
from backend.app.inference.engine import ModelNotReadyException

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System Health and Artifact Readiness",
    description="Returns process health and whether model/scaler checkpoints are loaded.",
)
def get_health() -> HealthResponse:
    info = inference_service.loader.get_info()
    model_loaded = info["is_loaded"]
    preprocessor_loaded = info["preprocessor_loaded"]
    
    # Status is degraded if artifacts are missing (development/pending state)
    status_str = "healthy" if (model_loaded and preprocessor_loaded) else "degraded"
    
    return HealthResponse(
        status=status_str,
        service="mesh-inference-backend",
        version="0.1.0",
        model_loaded=model_loaded,
        model_version=info.get("model_version"),
        preprocessor_loaded=preprocessor_loaded,
        preprocessor_version=info.get("preprocessor_version"),
        checkpoint_path=info["checkpoint_path"],
        preprocessor_path=info["preprocessor_path"],
    )


@router.get(
    "/model",
    response_model=ModelInfoResponse,
    summary="Model Architecture and Metadata",
    description="Returns trained model version, supported sensor modalities, and task targets.",
)
def get_model_info() -> ModelInfoResponse:
    info = inference_service.loader.get_info()
    return ModelInfoResponse(
        model_version=info.get("model_version"),
        dataset_version=info.get("dataset_version"),
        architecture="1D-CNN + BiLSTM + Mask-aware Cross-Attention + Transformer",
        supported_modalities=info.get("supported_modalities", []),
        supported_targets=info.get("supported_targets", []),
        is_loaded=info["is_loaded"],
        checkpoint_path=info["checkpoint_path"],
    )


@router.post(
    "/predict",
    response_model=InferenceResponse,
    summary="Run Multimodal Inference",
    description="Executes model forward pass on a canonical sensor window with modality mask.",
)
def predict(request: InferenceRequest) -> InferenceResponse:
    try:
        return inference_service.engine.predict(request)
    except ModelNotReadyException as e:
        logger.warning(f"Prediction rejected: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}",
        )


@router.post(
    "/compare/missing-modality",
    response_model=MissingModalityComparisonResponse,
    summary="Missing-Modality A/B Experiment",
    description="Compares predictions between full baseline mask and dropped modality mask.",
)
def compare_missing_modality(
    request: MissingModalityComparisonRequest,
) -> MissingModalityComparisonResponse:
    try:
        return inference_service.engine.compare_missing_modality(request)
    except ModelNotReadyException as e:
        logger.warning(f"Comparison rejected: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Missing-modality comparison error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(e)}",
        )
