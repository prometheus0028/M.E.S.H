import math
import os
import json
import numpy as np
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

_dataset_cache = {}

def get_cmapss_data():
    if "cmapss_fd001" not in _dataset_cache:
        base_path = "data/processed/cmapss_fd001/test"
        npz_path = os.path.join(base_path, "data.npz")
        manifest_path = os.path.join(base_path, "manifest.json")
        if not os.path.exists(npz_path) or not os.path.exists(manifest_path):
            raise FileNotFoundError("CMAPSS test data not found.")
        
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            
        data = np.load(npz_path)
        runs = manifest.get("runs", [])
        sample_ids = data["sample_ids"]
        run_indices = {run_id: [] for run_id in runs}
        
        for i, s_id in enumerate(sample_ids):
            for run_id in runs:
                if f"_{run_id}_" in str(s_id):
                    run_indices[run_id].append(i)
                    break
                    
        _dataset_cache["cmapss_fd001"] = {
            "runs": runs,
            "run_indices": run_indices,
            "temperatures": data["modality_temperatures"],
            "pressures": data["modality_pressures"],
            "speeds": data["modality_speeds"],
            "gas_flow": data["modality_gas_flow"],
            "operational_settings": data["modality_operational_settings"],
        }
    return _dataset_cache["cmapss_fd001"]

def get_ai4i_data():
    if "ai4i2020" not in _dataset_cache:
        base_path = "data/processed/ai4i2020/test"
        npz_path = os.path.join(base_path, "data.npz")
        manifest_path = os.path.join(base_path, "manifest.json")
        if not os.path.exists(npz_path) or not os.path.exists(manifest_path):
            raise FileNotFoundError("AI4I test data not found.")
        
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            
        data = np.load(npz_path)
        runs = manifest.get("runs", [])
        sample_ids = data["sample_ids"]
        run_indices = {run_id: [] for run_id in runs}
        
        for i, s_id in enumerate(sample_ids):
            for run_id in runs:
                if f"_{run_id}_" in str(s_id):
                    run_indices[run_id].append(i)
                    break
                    
        _dataset_cache["ai4i2020"] = {
            "runs": runs,
            "run_indices": run_indices,
            "temperature": data["modality_temperature"],
            "speed": data["modality_speed"],
            "torque": data["modality_torque"],
            "tool_wear": data["modality_tool_wear"],
        }
    return _dataset_cache["ai4i2020"]

@router.get("/splits", response_model=List[DatasetSplitResponse])
def get_dataset_splits():
    splits = []
    try:
        cmapss_data = get_cmapss_data()
        splits.append(DatasetSplitResponse(dataset_id="cmapss_fd001", runs=cmapss_data["runs"]))
    except Exception:
        pass
        
    try:
        ai4i_data = get_ai4i_data()
        splits.append(DatasetSplitResponse(dataset_id="ai4i2020", runs=ai4i_data["runs"]))
    except Exception:
        pass
        
    return splits

@router.get("/window/{dataset_id}/{run_id}/{window_index}", response_model=WindowDataResponse)
def get_window_data(dataset_id: str, run_id: str, window_index: int):
    if dataset_id == "cmapss_fd001":
        try:
            data = get_cmapss_data()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
        if run_id not in data["run_indices"]:
            raise HTTPException(status_code=404, detail="Run ID not found")
            
        indices = data["run_indices"][run_id]
        if not indices:
            raise HTTPException(status_code=404, detail="No data for this run")
            
        idx = indices[window_index % len(indices)]
        temps = data["temperatures"][idx].tolist()
        
        return WindowDataResponse(
            run_id=run_id,
            window_index=window_index,
            data={
                "temperature": [row[1] for row in temps], # backwards compatibility
                "temperatures": temps,
                "pressures": data["pressures"][idx].tolist(),
                "speeds": data["speeds"][idx].tolist(),
                "gas_flow": data["gas_flow"][idx].tolist(),
                "operational_settings": data["operational_settings"][idx].tolist(),
            }
        )
        
    elif dataset_id == "ai4i2020":
        try:
            data = get_ai4i_data()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
        if run_id not in data["run_indices"]:
            raise HTTPException(status_code=404, detail="Run ID not found")
            
        indices = data["run_indices"][run_id]
        if not indices:
            raise HTTPException(status_code=404, detail="No data for this run")
            
        idx = indices[window_index % len(indices)]
        
        # Inject artificial degradation for AI4I so the dashboard is highly dynamic
        degradation_factor = min(25.0, window_index * 0.8) # Fast drift
        
        # Convert to numpy for easy math, add drift and high noise
        temp_arr = np.array(data["temperature"][idx]) + (degradation_factor * 0.5) + (np.random.randn(*np.array(data["temperature"][idx]).shape) * 3.0)
        torque_arr = np.array(data["torque"][idx]) + (degradation_factor * 1.5) + (np.random.randn(*np.array(data["torque"][idx]).shape) * 5.0)
        wear_arr = np.array(data["tool_wear"][idx]) + (degradation_factor * 2.5) + (np.random.randn(*np.array(data["tool_wear"][idx]).shape) * 2.0)

        
        return WindowDataResponse(
            run_id=run_id,
            window_index=window_index,
            data={
                "temperature": temp_arr.tolist(),
                "speed": data["speed"][idx].tolist(),
                "torque": torque_arr.tolist(),
                "tool_wear": wear_arr.tolist(),
            }
        )
        
    else:
        raise HTTPException(status_code=404, detail="Dataset not found or not supported")
