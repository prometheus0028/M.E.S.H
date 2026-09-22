"""Integration tests verifying frontend client and backend API contract parity."""

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.schemas.inference import InferenceRequest, MissingModalityComparisonRequest


def test_client_request_conforms_to_backend_schema():
    """Verify frontend request objects validate against backend Pydantic models."""
    sample_window = {
        "vibration_x": [0.01 * i for i in range(20)],
        "vibration_y": [-0.01 * i for i in range(20)],
    }
    sample_mask = {
        "vibration_x": 1,
        "vibration_y": 1,
    }
    
    # 1. Test InferenceRequest
    req = InferenceRequest(
        dataset_id="femto_bearing",
        run_id="Bearing1_1",
        window=sample_window,
        modality_mask=sample_mask,
    )
    assert req.dataset_id == "femto_bearing"
    assert len(req.window["vibration_x"]) == 20

    # 2. Test MissingModalityComparisonRequest
    comp_req = MissingModalityComparisonRequest(
        dataset_id="femto_bearing",
        run_id="Bearing1_1",
        window=sample_window,
        baseline_mask=sample_mask,
        dropped_modality="vibration_y",
    )
    assert comp_req.dropped_modality == "vibration_y"


def test_api_status_contract():
    """Verify backend health check contract matches frontend client expectation."""
    client = TestClient(app)
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "model_loaded" in data
