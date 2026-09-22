# M.E.S.H

**M.E.S.H** (Machine health **E**xpert **S**ystems **H**ub) is a modern web‑based dashboard for real‑time monitoring, predictive maintenance, and safety analytics of industrial machinery. It combines a FastAPI backend with PyTorch models and a React/Vite frontend to deliver live sensor visualisations, anomaly detection, and maintenance recommendations.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview
The dashboard ingests telemetry streams from multiple machines, runs AI models for Remaining Useful Life (RUL) prediction and fault detection, and visualises the results with interactive charts. It also provides compliance logging and a safety score.

## Features
- Real‑time sensor telemetry visualisation (line charts, area charts)
- AI‑driven RUL prediction (CMAPSS dataset) and fault detection (AI4I dataset)
- Dynamic maintenance scheduling and priority ranking
- Safety score and compliance alerts
- Export of reports and CSV data

## Tech Stack
- **Frontend**: React with Vite, TypeScript, Tailwind CSS (custom design system), Recharts for charts
- **Backend**: FastAPI (Python) with PyTorch models
- **Data**: In‑memory data sources for demo; can be extended to BigQuery or Cloud Storage
- **Deployment**: Docker (optional), local dev server via `npm run dev`

## Setup & Installation
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd M.E.S.H
   ```
2. **Install Node.js dependencies**
   ```bash
   npm install
   ```
3. **Install Python dependencies** (preferably in a virtual environment)
   ```bash
   python -m venv venv
   source venv/bin/activate   # on Windows: venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
4. **Start the FastAPI backend**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
5. **Run the frontend** (from the repository root)
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Running the Application
- Ensure the backend is running on `http://localhost:8000`.
- Open the frontend URL in a browser.
- Use the dashboard to select a machine and view live telemetry, AI predictions, and safety alerts.

## Project Structure
```
M.E.S.H/
├─ backend/          # FastAPI server and AI model code
├─ frontend/         # React + Vite UI
│   └─ src/components/   # TSX UI components
├─ docs/             # Project documentation (including this report)
├─ README.md         # <-- you are reading it!
├─ .gitignore
└─ package.json
```

## Contributing
Contributions are welcome! Please fork the repo, create a feature branch, and submit a pull request. Follow the existing code style and run the linter before committing.

## License
This project is licensed under the MIT License.
