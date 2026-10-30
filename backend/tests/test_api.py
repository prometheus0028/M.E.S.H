"""Unit tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from backend.main import app

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


def test_predict_endpoint_model_unloaded(monkeypatch):
    """Verify /predict returns 503 when model artifact is not loaded (enforces no fake predictions)."""
    from app.services.inference_service import inference_service
    monkeypatch.setattr(inference_service.loader, "is_loaded", False)
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


def test_compare_missing_modality_unloaded(monkeypatch):
    """Verify /compare/missing-modality returns 503 when model artifact is not loaded."""
    from app.services.inference_service import inference_service
    monkeypatch.setattr(inference_service.loader, "is_loaded", False)
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


def test_predict_endpoint_model_loaded():
    """Verify /predict returns 200 and valid inference predictions when model is loaded."""
    from app.services.inference_service import inference_service
    inference_service.startup()
    assert inference_service.loader.is_loaded

    # CMAPSS payload
    payload = {
        "dataset_id": "cmapss_fd001",
        "run_id": "test_unit_001",
        "window": {
            "temperatures": [[500.0, 600.0, 700.0, 800.0]] * 20,
            "pressures": [[14.0, 21.0, 100.0, 1.0, 47.0]] * 20,
            "speeds": [[2388.0, 9050.0, 1.3, 47.0, 8400.0, 100.0]] * 20,
            "gas_flow": [[521.0, 8.4, 0.03, 392.0, 38.8, 23.3]] * 20,
            "operational_settings": [[0.0, 0.0, 100.0]] * 20,
        },
        "modality_mask": {
            "temperatures": 1,
            "pressures": 1,
            "speeds": 1,
            "gas_flow": 1,
            "operational_settings": 1,
        },
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert data["prediction"]["rul"] is not None
    assert "uncertainty" in data
    assert data["latency_ms"] > 0


def test_compare_missing_modality_loaded():
    """Verify /compare/missing-modality returns 200 and delta comparison when model is loaded."""
    from app.services.inference_service import inference_service
    inference_service.startup()
    assert inference_service.loader.is_loaded

    payload = {
        "dataset_id": "cmapss_fd001",
        "run_id": "test_unit_001",
        "window": {
            "temperatures": [[500.0, 600.0, 700.0, 800.0]] * 20,
            "pressures": [[14.0, 21.0, 100.0, 1.0, 47.0]] * 20,
            "speeds": [[2388.0, 9050.0, 1.3, 47.0, 8400.0, 100.0]] * 20,
            "gas_flow": [[521.0, 8.4, 0.03, 392.0, 38.8, 23.3]] * 20,
            "operational_settings": [[0.0, 0.0, 100.0]] * 20,
        },
        "baseline_mask": {
            "temperatures": 1,
            "pressures": 1,
            "speeds": 1,
            "gas_flow": 1,
            "operational_settings": 1,
        },
        "dropped_modality": "temperatures",
    }
    response = client.post("/compare/missing-modality", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dropped_modality"] == "temperatures"
    assert "baseline" in data
    assert "dropped" in data
    assert "delta" in data


def test_data_routes():
    """Verify /data/splits and /data/window return real processed dataset telemetry."""
    # 1. Test splits
    resp = client.get("/data/splits")
    assert resp.status_code == 200
    splits = resp.json()
    assert len(splits) > 0
    cmapss_split = next((s for s in splits if s["dataset_id"] == "cmapss_fd001"), None)
    assert cmapss_split is not None
    assert len(cmapss_split["runs"]) > 0

    first_run = cmapss_split["runs"][0]
    # 2. Test window
    win_resp = client.get(f"/data/window/cmapss_fd001/{first_run}/0")
    assert win_resp.status_code == 200
    win_data = win_resp.json()
    assert win_data["run_id"] == first_run
    assert "temperatures" in win_data["data"]

