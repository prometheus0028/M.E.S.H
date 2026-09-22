import math
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
from pydantic import BaseModel

router = APIRouter()

class DatasetSplitResponse(BaseModel):
    dataset_id: str
    runs: List[str]

class WindowDataResponse(BaseModel):
    run_id: str
    window_index: int
    data: Dict[str, Any]

@router.get("/splits", response_model=List[DatasetSplitResponse])
def get_dataset_splits():
    """
    Returns available dataset splits. 
    Using placeholder data to simulate Naman's CMAPSS and AI4I processed splits.
    """
    return [
        DatasetSplitResponse(
            dataset_id="cmapss_fd001",
            runs=["unit_001", "unit_002", "unit_003"]
        ),
        DatasetSplitResponse(
            dataset_id="ai4i2020",
            runs=["machine_10", "machine_12", "machine_15"]
        )
    ]

@router.get("/window/{dataset_id}/{run_id}/{window_index}", response_model=WindowDataResponse)
def get_window_data(dataset_id: str, run_id: str, window_index: int):
    """
    Returns a specific window of data for a run.
    Uses placeholder sinusoidal data since real tensor files are missing.
    """
    if dataset_id not in ["cmapss_fd001", "ai4i2020"]:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    window_size = 50
    base_offset = window_index * 10
    
    # Generate some plausible looking dummy sensor data
    temperature = [
        round(120.0 + 10.0 * math.sin((i + base_offset) * 0.1), 2)
        for i in range(window_size)
    ]
    vibration = [
        [
            round(5.0 + 2.0 * math.cos((i + base_offset) * 0.5) + (i*0.01), 2),
            round(3.0 + 1.0 * math.sin((i + base_offset) * 0.5), 2),
            round(1.0 + 0.5 * math.cos((i + base_offset) * 0.2), 2)
        ]
        for i in range(window_size)
    ]
    pressure = [
        round(30.0 + 1.5 * math.sin((i + base_offset) * 0.05), 2)
        for i in range(window_size)
    ]

    return WindowDataResponse(
        run_id=run_id,
        window_index=window_index,
        data={
            "temperature": temperature,
            "vibration": vibration,
            "pressure": pressure
        }
    )
