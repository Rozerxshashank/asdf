# WindLens — UK Day-Ahead Wind Generation Decision Platform

A specialized analytics application designed for a UK electricity utility trading desk to evaluate wind generation forecasts, quantify forecast error, and support day-ahead wholesale electricity procurement decisions using official Elexon BMRS data for January 2026.

---

## 1. Deployment Status & Instructions

> [!NOTE]
> **Deployment Status Verification:** No external public cloud deployment is currently pre-activated (to prevent dead placeholder links or orphaned cloud hosting charges). Complete, validated configuration blueprints are included in the repository for **Render** (`render.yaml`), **Vercel** (`frontend/vercel.json`), and **Docker Compose** (`docker-compose.yml`).

### Option A: Deploy to Render (Unified Backend + Frontend Blueprint)
1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New > Blueprint**.
3. Connect your GitHub repository (`Rozerxshashank/asdf`).
4. Render automatically parses `render.yaml` to spin up:
   * **`windlens-backend`**: Python FastAPI ASGI web service (`uvicorn app.main:app`).
   * **`windlens-frontend`**: React Vite static site with SPA rewrite rules.
5. Once built, Render will assign live URLs (e.g., `https://windlens-frontend.onrender.com` and `https://windlens-backend.onrender.com`).

### Option B: Deploy Frontend to Vercel + Backend to Render
1. Deploy the backend on Render as a Python Web Service pointing to root directory `backend`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Note the backend URL.
2. Deploy the frontend on [Vercel](https://vercel.com):
   * Root Directory: `frontend`
   * Framework Preset: `Vite`
   * Build Command: `npm run build`
   * Output Directory: `dist`
   * Environment Variable: `VITE_API_URL=<your-render-backend-url>`
3. Vercel utilizes `frontend/vercel.json` for client-side single-page routing.

---

## 2. Verified Numerical Metrics (January 2026 Full Month Reconciliation)

All metrics below were independently recalculated directly from the packaged raw source records (`january_2026_actuals.json` and `january_2026_forecasts.json`) across all 1,488 settlement intervals of January 2026 under the documented anti-lookahead forecast selection and alignment rules:

| Procurement Decision Gate | Matched / Expected SP | Coverage | Total Actual Energy | Total Forecast Energy | MAE (MW) | RMSE (MW) | Mean Bias Error (MW) | WAPE (%) | Predictive $R^2$ | Squared Pearson $r^2$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`DA_AUCTION_1100` (11:00 UTC D-1)** | 1,488 / 1,488 | 100.0% | 8,616,068.5 MWh | 9,985,249.0 MWh | **2,126.12 MW** | **2,620.80 MW** | **+1,840.30 MW** | **18.36%** | **0.6021** | **0.8602** |
| **`DA_AUCTION_1200` (12:00 UTC D-1)** | 1,488 / 1,488 | 100.0% | 8,616,068.5 MWh | 9,959,906.0 MWh | **2,020.64 MW** | **2,481.38 MW** | **+1,806.23 MW** | **17.45%** | **0.6433** | **0.8929** |
| **`INTRADAY_2000` (20:00 UTC D-1)** | 1,488 / 1,488 | 100.0% | 8,616,068.5 MWh | 9,952,082.0 MWh | **1,981.57 MW** | **2,448.48 MW** | **+1,795.72 MW** | **17.11%** | **0.6527** | **0.9034** |

### Statistical Discrepancy Analysis: Predictive $R^2$ vs Squared Pearson $r^2$
* **Squared Pearson Correlation ($r^2 = 0.8602$):** Measures the linear co-movement and directional shape alignment between forecast and actual generation. Because Pearson correlation de-means both series, it completely ignores constant additive scale shifts.
* **Standard Predictive Coefficient of Determination ($R^2 = 0.6021$):** Formulated as $1 - \frac{\sum (A_i - F_i)^2}{\sum (A_i - \bar{A})^2}$, measuring predictive skill relative to the naive benchmark of predicting mean actual generation.
* **Trading Desk Implication:** National Grid ESO's Day-Ahead wind forecast exhibits strong directional correlation ($r^2 > 0.86$), but suffers from a persistent positive mean bias (**+1,840.3 MW** over-forecasting), which penalizes true predictive skill down to $R^2 = 0.6021$. Buying unadjusted Day-Ahead forecast volumes will systematically leave the utility short in the Balancing Mechanism by an average of 1,840 MW per settlement period.

---

## 3. Data & Alignment Conventions

### Hourly-to-Half-Hourly Step Block Alignment
* **Cadence Asymmetry:** National Grid ESO publishes wind generation forecasts in the Elexon `WINDFOR` stream at **hourly cadence** (target `startTime` minutes are always `:00`). Conversely, GB wholesale market settlement operates on **30-minute settlement periods** (`FUELHH`).
* **GB Market Convention:** For any clock hour $H$, settlement periods $2H-1$ (HH:00 to HH:30) and $2H$ (HH:30 to HH+1:00) represent instantaneous average power in MW delivered over that hour. Under GB market conventions, the prevailing hourly forecast MW applies as a constant step block across both half-hour intervals without fabricating intermediate synthetic vintages.
* **100% Coverage Note:** 1,488 matched settlement periods reflects complete hourly step block alignment, not sub-hourly weather model resolution.

### Anti-Lookahead Cutoff Enforcement
* Forecasts are strictly filtered such that `publishTime <= cutoff_dt`.
* Custom cutoff timestamps require explicit timezone information (e.g. `2026-01-14T11:00:00Z`). Naive timestamps without timezone offsets are rejected with HTTP 400 (no silent fallback).
* The Forecast Evolution view explicitly distinguishes pre-cutoff decision forecasts (available at auction gate) from retrospective model revisions published after the auction.

---

## 4. Details of Files and Directories Present

```
sweChallenge/
├── README.md                      # Project documentation and start instructions
├── docker-compose.yml             # Single-command Docker Compose orchestration
├── render.yaml                    # Render cloud deployment blueprint
├── .gitignore                     # Git ignore rules for Python, Node, and build artifacts
│
├── backend/                       # Python FastAPI backend service
│   ├── Dockerfile                 # Production Dockerfile (Python 3.11-slim)
│   ├── requirements.txt           # Python package dependencies
│   │
│   ├── app/                       # Application source code
│   │   ├── main.py                # FastAPI entry point, CORS middleware, lifespan
│   │   ├── config.py              # Pydantic Settings and environment variable management
│   │   │
│   │   ├── models/                # Data and schema definitions
│   │   │   └── schemas.py         # Pydantic request and response models
│   │   │
│   │   ├── services/              # Core business and domain logic
│   │   │   ├── analytics_engine.py# Pure statistical functions (MAE, RMSE, MBE, WAPE, R2)
│   │   │   ├── data_service.py    # Ingestion, anti-lookahead selection rule, and caching
│   │   │   └── elexon_client.py   # Asynchronous HTTPX client for Elexon BMRS API
│   │   │
│   │   ├── routers/               # API route endpoints
│   │   │   ├── health.py          # GET /api/health (service & cache health check)
│   │   │   ├── metadata.py        # GET /api/metadata (dataset info and market rules)
│   │   │   ├── forecast.py        # GET /api/forecast (Day-ahead forecast vs actual outturn)
│   │   │   ├── accuracy.py        # GET /api/accuracy (Quantified error hub & profiles)
│   │   │   ├── evolution.py       # GET /api/forecast-evolution (Lead-time vintage evolution)
│   │   │   └── procurement.py     # POST /api/procurement/scenario (Residual balance simulator)
│   │   │
│   │   └── data/                  # Packaged, verified January 2026 source datasets
│   │       ├── january_2026_actuals.json   # 1,488 verified actual outturn intervals (FUELHH)
│   │       └── january_2026_forecasts.json # 19,856 verified forecast vintages (WINDFOR)
│   │
│   └── tests/                     # Backend automated test suite (38 tests)
│       ├── conftest.py            # Pytest fixtures and FastAPI TestClient
│       ├── test_analytics_engine.py   # Tests for MAE, RMSE, MBE, WAPE, Predictive R2 vs r2
│       ├── test_forecast_selection.py # Tests for anti-lookahead, hourly alignment, cutoff errors
│       ├── test_api_endpoints.py      # Route validation, 400 error responses, response models
│       └── test_data_service.py       # Cache loading and interval alignment tests
│
└── frontend/                      # React TypeScript frontend application (Vite)
    ├── Dockerfile                 # Multi-stage Dockerfile (Node build + Nginx Alpine)
    ├── nginx.conf                 # Nginx reverse proxy configuration & SPA routing
    ├── package.json               # Node dependencies (React 19, Tailwind v4, Recharts)
    ├── vite.config.ts             # Vite configuration with API proxy and Tailwind plugin
    ├── vitest.config.ts           # Vitest unit test configuration with jsdom
    ├── vercel.json                # Vercel SPA rewrite configuration
    ├── index.html                 # HTML shell with Inter typography
    │
    └── src/                       # Frontend source code
        ├── main.tsx               # React root render
        ├── App.tsx                # Main container managing tab views and unified control bar
        ├── index.css              # Tailwind v4 dark theme styles
        │
        ├── types/                 # TypeScript definitions matching backend Pydantic models
        │   └── api.ts             # Strongly typed API contracts
        │
        ├── services/              # API communication
        │   └── api.ts             # Typed fetch client with error handling
        │
        ├── components/            # UI components by domain area
        │   ├── layout/            # Compact Navbar, Footer, StatusBanner
        │   ├── decision-desk/     # DateSelector, CutoffSelector, KPISummaryCards, Chart, Table
        │   ├── accuracy/          # MetricCards, SettlementProfileChart, DailyTrendChart, Misses
        │   ├── uncertainty/       # ForecastEvolutionChart, ErrorDistributionChart, Caveat
        │   ├── simulator/         # ScenarioControls, ResidualChart, DisclaimerBox
        │   └── tech-guide/        # ArchitectureReview (technical review whitepaper)
        │
        └── tests/                 # Frontend component tests (4 tests)
            ├── setup.ts           # Vitest DOM matchers and ResizeObserver mock
            └── components.test.tsx# Tests for DateSelector, CutoffSelector, and KPI cards
```

---

## 5. How to Start the Application

### Prerequisites
* **Python**: 3.11+
* **Node.js**: v20+ (`npm` v10+)
* **Docker** & **Docker Compose** *(optional, for containerized execution)*

---

### Method A: Running Locally

#### Step 1: Start the Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **Backend API:** `http://localhost:8000`
* **Health Check:** `http://localhost:8000/api/health`
* **Interactive OpenAPI Docs:** `http://localhost:8000/docs`

#### Step 2: Start the Frontend (React + Vite)
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
* **Frontend Application:** `http://localhost:5173`
* Vite automatically proxies `/api` calls to `http://localhost:8000`.

---

### Method B: Running via Docker Compose (Recommended)

To start both the backend and frontend in isolated containers with a single command:
```bash
docker compose up --build
```
* **Frontend Web App:** `http://localhost:3000`
* **Backend API:** `http://localhost:8000`

To stop the containers:
```bash
docker compose down
```

---

### Method C: Running the Automated Tests

#### Backend Pytest Suite (38 tests)
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/ -v
```
*Verifies mathematical formulations (MAE, RMSE, MBE, WAPE zero-denominator policy, predictive $R^2$ vs Pearson $r^2$), anti-lookahead vintage selection, hourly block matching, timezone-aware cutoff parsing, and API error handling.*

#### Frontend Vitest Suite (4 tests)
```bash
cd frontend
npm test
```
*Verifies component rendering, user interactions, stepper guards, and numerical formatting.*

#### Frontend Production Build
```bash
cd frontend
npm run build
```
*Verifies TypeScript compilation and production asset bundling.*

---

## 6. Disclosure of AI Tools Used

In compliance with the assignment instructions:
* **AI Tool Utilized:** Google DeepMind Advanced Agentic AI Assistant (Antigravity).
* **Usage Scope:**
  * Inspecting and verifying Elexon BMRS API endpoints (`FUELHH` and `WINDFOR`) for parameters, rate limits, and hourly-to-half-hourly cadence alignment.
  * Scaffolding the React 19 + TypeScript + Tailwind CSS v4 frontend and FastAPI backend structure.
  * Formulating test suites covering mathematical edge cases (WAPE zero-denominator policy, predictive $R^2$ vs squared Pearson correlation, anti-lookahead vintage selection, timezone comparisons).
  * Creating Docker configurations and deployment manifests.
* All code, mathematical calculations, and API interactions were independently validated through automated unit tests and browser execution.
