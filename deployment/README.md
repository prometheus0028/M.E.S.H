# MESH Deployment & Operations

This directory contains containerization and deployment configurations for the MESH system (FastAPI Inference Backend and Streamlit Engineering Console).

## 1. Local Development Execution

### Backend (FastAPI)
```bash
# From repository root
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (Streamlit)
```bash
# From repository root
pip install -r frontend/requirements.txt
streamlit run frontend/app.py --server.port 8501
```

## 2. Docker Execution

Run both services via Docker Compose:
```bash
docker compose -f deployment/docker/docker-compose.yml up --build
```

- **Backend API**: Accessible at `http://localhost:8000` (Swagger docs at `/docs`)
- **Frontend Console**: Accessible at `http://localhost:8501`

## 3. Health Checks

The backend provides a standardized health check endpoint at `GET /health` which validates:
- Process uptime and responsiveness
- Model checkpoint presence and loading status
- Preprocessor/scaler artifact readiness

To run the standalone health check probe:
```bash
python deployment/healthchecks/healthcheck.py http://localhost:8000/health
```
