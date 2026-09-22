"""Unit tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify /health returns service status and model readiness."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["service"] == "mesh-inference-backend"
    assert "model_loaded" in data
    assert "preprocessor_loaded" in data


def test_model_info_endpoint():
    """Verify /model returns model metadata schema."""
    response = client.get("/model")
    assert response.status_code == 200
    data = response.json()
    assert "architecture" in data
    assert "supported_modalities" in data
    assert "supported_targets" in data
    assert "is_loaded" in data


def test_predict_endpoint_model_unloaded():
    """Verify /predict returns 503 when model artifact is not loaded (enforces no fake predictions)."""
    payload = {
        "dataset_id": "femto_bearing_1_1",
        "run_id": "Bearing1_1_Run01",
        "window": {
            "vibration_x": [0.1] * 20,
            "vibration_y": [-0.1] * 20,
            "temperature": [25.0] * 20,
        },
        "modality_mask": {
            "vibration_x": 1,
            "vibration_y": 1,
            "temperature": 1,
        },
    }
    response = client.post("/predict", json=payload)
    # When model is not loaded, expect 503 Service Unavailable
    assert response.status_code == 503
    data = response.json()
    assert "detail" in data


def test_predict_schema_validation_error():
    """Verify /predict returns 422 Unprocessable Entity when payload is malformed."""
    malformed_payload = {
        "dataset_id": "femto_bearing_1_1",
        # Missing required 'window' and 'modality_mask'
    }
    response = client.post("/predict", json=malformed_payload)
    assert response.status_code == 422


def test_compare_missing_modality_unloaded():
    """Verify /compare/missing-modality returns 503 when model artifact is not loaded."""
    payload = {
        "dataset_id": "femto_bearing_1_1",
        "run_id": "Bearing1_1_Run01",
        "window": {
            "vibration_x": [0.1] * 20,
            "vibration_y": [-0.1] * 20,
            "temperature": [25.0] * 20,
        },
        "baseline_mask": {
            "vibration_x": 1,
            "vibration_y": 1,
            "temperature": 1,
        },
        "dropped_modality": "vibration_y",
    }
    response = client.post("/compare/missing-modality", json=payload)
    assert response.status_code == 503
