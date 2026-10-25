import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.services.data_service import DataService


@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_pairs():
    """Deterministic forecast and actual pairs for testing metrics."""
    forecasts = [12000.0, 15000.0, 14000.0, 11000.0, 16000.0]
    actuals = [10000.0, 14000.0, 16000.0, 11000.0, 13000.0]
    # Errors (forecast - actual): [+2000, +1000, -2000, 0, +3000]
    # Abs errors: [2000, 1000, 2000, 0, 3000] -> Sum = 8000, Mean = 1600.0
    # Sq errors: [4M, 1M, 4M, 0, 9M] -> Sum = 18M, Mean = 3.6M -> RMSE = sqrt(3.6M) = ~1897.37
    # Mean bias: (2000 + 1000 - 2000 + 0 + 3000) / 5 = +800.0 (over-forecasting)
    # Sum actuals: 10000 + 14000 + 16000 + 11000 + 13000 = 64000
    # WAPE: (8000 / 64000) * 100 = 12.5%
    return forecasts, actuals
