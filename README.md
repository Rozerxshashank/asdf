# WindLens — UK Day-Ahead Wind Generation Decision Platform

A web application designed for a UK electricity utility trading desk to evaluate wind generation forecasts, quantify forecast error, and support day-ahead wholesale electricity procurement decisions using official Elexon BMRS data for January 2026.

---

## 1. Live Application Link

* **Deployed Web Application:** [https://windlens-procurement.vercel.app](https://windlens-procurement.vercel.app) *(Replace with your deployed Vercel / Heroku URL)*
* **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs) (or your deployed backend `/docs` URL)

---

## 2. Details of Files and Directories Present

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
│   │   │   ├── analytics_engine.py# Pure statistical functions (MAE, RMSE, MBE, WAPE, quantiles)
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
│   └── tests/                     # Backend automated test suite
│       ├── conftest.py            # Pytest fixtures and FastAPI TestClient
│       ├── test_analytics_engine.py   # Tests for MAE, RMSE, MBE, WAPE, zero-denominator
│       ├── test_forecast_selection.py # Tests for anti-lookahead bias & vintage selection
│       ├── test_api_endpoints.py      # Route validation and error response tests
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
        ├── App.tsx                # Main container managing tab views and reactive state
        ├── index.css              # Tailwind v4 dark theme styles
        │
        ├── types/                 # TypeScript definitions
        │   └── api.ts             # Typed interfaces matching backend Pydantic models
        │
        ├── services/              # API communication
        │   └── api.ts             # Typed fetch client with error handling
        │
        ├── components/            # UI components by domain area
        │   ├── layout/            # Navbar, Footer, StatusBanner
        │   ├── decision-desk/     # DateSelector, CutoffSelector, KPISummaryCards, Charts, Table
        │   ├── accuracy/          # MetricCards, SettlementProfileChart, DailyTrendChart, Misses
        │   ├── uncertainty/       # ForecastEvolutionChart, ErrorDistributionChart, MethodologyCaveat
        │   ├── simulator/         # ScenarioControls, ResidualChart, DisclaimerBox
        │   └── tech-guide/        # ArchitectureReview (technical review walkthrough)
        │
        └── tests/                 # Frontend component tests
            ├── setup.ts           # Vitest DOM matchers and ResizeObserver mock
            └── components.test.tsx# Tests for DateSelector, CutoffSelector, and KPI cards
```

---

## 3. How to Start the Application

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

#### Backend Pytest Suite (28 tests)
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/ -v
```

#### Frontend Vitest Suite (4 tests)
```bash
cd frontend
npm test
```

---

## 4. Disclosure of AI Tools Used

In compliance with the assignment instructions:
* **AI Tool Utilized:** Google DeepMind Advanced Agentic AI Assistant (Antigravity).
* **Usage Scope:**
  * Inspecting and testing Elexon BMRS API endpoints (`FUELHH` and `WINDFOR/stream`) for parameters, rate limits, and hourly-to-half-hourly cadence alignment.
  * Scaffolding the React 19 + TypeScript + Tailwind CSS v4 frontend and FastAPI backend structure.
  * Formulating test suites covering mathematical edge cases (WAPE zero-denominator policy, anti-lookahead vintage selection, timezone comparisons).
  * Creating Docker configurations and deployment manifests.
* All code, mathematical calculations, and API interactions were independently validated through automated unit tests and browser execution.
