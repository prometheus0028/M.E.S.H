import time
import requests
import random
import torch
from ml.data.mock_canonical_batch import generate_mock_canonical_batch

API_URL = "http://localhost:8002/predict"

def get_native_modalities():
    """Retrieve expected native modalities from the backend's /model endpoint."""
    try:
        response = requests.get("http://localhost:8002/model")
        if response.status_code == 200:
            return response.json().get("supported_modalities", ["temperatures", "pressures", "speeds", "gas_flow", "operational_settings"])
    except:
        pass
    return ["temperatures", "pressures", "speeds", "gas_flow", "operational_settings"]

def simulate():
    print("M.E.S.H. Data Simulator started.")
    print("Waiting for backend to be available...")
    
    while True:
        try:
            requests.get("http://localhost:8002/health")
            break
        except requests.ConnectionError:
            time.sleep(2)

    native_modalities = get_native_modalities()
    print(f"Backend detected. Target modalities: {native_modalities}")
    
    # We will simulate data for a specific asset over time.
    run_id = "engine_unit_42"
    
    try:
        while True:
            # Generate a realistic mock batch using ML team's mock generator
            batch = generate_mock_canonical_batch(batch_size=1, window_size=20, native_modalities=native_modalities)
            
            # Format to InferenceRequest schema
            window = {}
            for mod in native_modalities:
                # Squeeze out batch dim and convert to list of lists (timesteps, channels)
                window[mod] = batch.modality_values[mod].squeeze(0).cpu().numpy().tolist()
            
            # Create a modality mask. 90% chance everything works, 10% chance one sensor drops out.
            modality_mask = {mod: 1 for mod in native_modalities}
            if random.random() < 0.10:
                dropped = random.choice(native_modalities)
                modality_mask[dropped] = 0
                print(f"[!] Simulating failure for sensor: {dropped}")
                
            payload = {
                "dataset_id": "cmapss",
                "dataset_version": "v1",
                "run_id": run_id,
                "window": window,
                "modality_mask": modality_mask
            }
            
            print(f"Sending stream payload for {run_id}...")
            response = requests.post(API_URL, json=payload)
            
            if response.status_code == 200:
                res_data = response.json()
                rul = res_data["prediction"]["rul"]
                interval = res_data["uncertainty"]["rul_interval"]
                print(f"  -> Success: Predicted RUL = {rul} cycles. Interval = {interval}")
            else:
                print(f"  -> Error: {response.status_code} - {response.text}")
                
            # Wait 2 seconds before next tick (simulating a slow IoT update for demo purposes)
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nSimulator stopped.")

if __name__ == "__main__":
    simulate()
