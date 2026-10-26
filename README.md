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
| **`INTRADAY_0000` (00:00 UTC Day D)** | 1,488 / 1,488 | 100.0% | 8,616,068.5 MWh | 9,891,075.0 MWh | **1,940.82 MW** | **2,410.57 MW** | **+1,713.72 MW** | **16.76%** | **0.6634** | **0.8967** |

### Statistical Discrepancy Analysis: Predictive $R^2$ vs Squared Pearson $r^2$
* **Squared Pearson Correlation ($r^2 = 0.8602$):** Measures the linear co-movement and directional shape alignment between forecast and actual generation. Because Pearson correlation de-means both series, it completely ignores constant additive scale shifts.
* **Standard Predictive Coefficient of Determination ($R^2 = 0.6021$):** Formulated as $1 - \frac{\sum (A_i - F_i)^2}{\sum (A_i - \bar{A})^2}$, measuring predictive skill relative to the naive benchmark of predicting mean actual generation.
* **Trading Desk Implication:** National Grid ESO's Day-Ahead wind forecast exhibits strong directional correlation ($r^2 > 0.86$), but suffers from a persistent positive mean bias (**+1,840.3 MW** over-forecasting), which penalizes true predictive skill down to $R^2 = 0.6021$. Buying unadjusted Day-Ahead forecast volumes will systematically leave the utility short in the Balancing Mechanism by an average of 1,840 MW per settlement period.

---

## 3. Data & Alignment Conventions

### Hourly-to-Half-Hourly Step Block Alignment Audit
* **Authoritative Schema Inspection:** Detailed audit of the packaged 19,856 Elexon `WINDFOR` records and 1,488 `FUELHH` actuals confirms:
  * All `WINDFOR` forecast target `startTime` records possess minute `:00` (e.g. `2026-01-15T12:00:00Z`). Elexon publishes zero `:30` forecasts in `WINDFOR`, and `settlementPeriod` is omitted from the forecast schema.
  * `FUELHH` actual generation is reported for both `:00` and `:30` target start times with explicit `settlementPeriod` (1 to 48) and `settlementDate`.
* **GB Settlement Semantics (BSC Section Q & T):** Under GB Balancing and Settlement Code rules, generation in MW denotes an instantaneous average rate of energy delivery (MW = MWh/h). An hourly ESO forecast for clock hour $H$ legitimately defines the constant expected power delivery rate across both constituent half-hour settlement periods:
  $$\text{Forecast}(\text{Period } 2H-1) = \text{Forecast}(\text{Period } 2H) = \text{Forecast Hourly Average}(H\text{:00})$$
* **Non-Fabrication Policy:** The system enforces this step-block mapping without synthesizing fake intermediate 30-minute weather runs. The 100% coverage (1,488 / 1,488 periods) represents complete step-block coverage across all January 2026 delivery hours.

### Anti-Lookahead Cutoff Enforcement & Forward vs Retrospective Records
* **Empirical Vintage Breakdown:** Of the 19,856 WINDFOR records, 15,775 are forward forecasts (`publishTime <= startTime`), while 4,081 are retrospective reruns published after target delivery (`publishTime > startTime`).
* **Strict Filter:** To prevent look-ahead bias, the selection engine strictly enforces `publishTime <= cutoff_dt`. Without this filter, retrospective post-event runs would contaminate Day-Ahead decisions.
* **Monthly Cutoff Aggregation Policy:**
  * For single-day operational views (`/api/forecast` and `/api/forecast-evolution`), custom timezone-aware ISO timestamps are supported (e.g., `2026-01-14T11:00:00Z`). Naive timestamps without explicit timezone offsets are rejected with HTTP 400.
  * For monthly accuracy evaluation (`/api/accuracy`), cutoffs must be date-relative presets (`DA_AUCTION_1100`, `DA_AUCTION_1200`, `INTRADAY_2000`, `INTRADAY_0000`). Custom absolute ISO timestamps are explicitly rejected with HTTP 400, because applying a single fixed timestamp across all 31 days in January 2026 introduces massive look-ahead bias for earlier days (e.g. up to 13 days of future data) and stale forecasts for later days.
* **Forecast Evolution Visualization:** Pre-cutoff decision forecasts (available at the auction gate) are visually rendered as solid lines, strictly differentiated from subsequent retrospective model revisions (dashed lines).

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
│   └── tests/                     # Backend automated test suite (41 tests)
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
        └── tests/                 # Frontend component tests (5 tests)
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

#### Backend Pytest Suite (41 tests)
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/ -v
```
*Verifies mathematical formulations (MAE, RMSE, MBE, WAPE zero-denominator policy, predictive $R^2$ vs Pearson $r^2$), anti-lookahead vintage selection, hourly block matching, timezone-aware cutoff parsing, monthly date-relative rule validation, and API error handling.*

#### Frontend Vitest Suite (5 tests)
```bash
cd frontend
npm test
```
*Verifies component rendering, user interactions, stepper guards, dual $R^2$ displays, and numerical formatting.*

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
