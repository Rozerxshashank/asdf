from datetime import datetime, timezone, timedelta
import pytest
from app.services.data_service import DataService


@pytest.fixture
def isolated_data_service():
    """Create an isolated DataService instance with known mock vintages."""
    ds = DataService.__new__(DataService)
    ds._actuals_cache = []
    ds._forecasts_cache = []
    ds._actuals_by_start = {}
    from collections import defaultdict
    ds._forecasts_by_start = defaultdict(list)
    ds.last_cache_refresh = "2026-01-01T00:00:00Z"
    ds.is_loaded = True

    # Setup target interval: 2026-01-15T12:00:00Z
    # Add three vintages:
    # 1. 2026-01-14T06:00:00Z -> 10000 MW
    # 2. 2026-01-14T10:30:00Z -> 11500 MW (Latest before 11:00 cutoff)
    # 3. 2026-01-14T11:30:00Z -> 14000 MW (Published AFTER 11:00 cutoff - LOOKAHEAD)
    target_start = "2026-01-15T12:00:00Z"
    ds._forecasts_by_start[target_start] = [
        {"publishTime": "2026-01-14T06:00:00Z", "startTime": target_start, "generation": 10000},
        {"publishTime": "2026-01-14T10:30:00Z", "startTime": target_start, "generation": 11500},
        {"publishTime": "2026-01-14T11:30:00Z", "startTime": target_start, "generation": 14000},
    ]

    # Setup actual outturn
    ds._actuals_by_start[target_start] = {
        "startTime": target_start,
        "generation": 12000,
        "settlementPeriod": 25,
        "settlementDate": "2026-01-15"
    }
    return ds


def test_anti_lookahead_bias(isolated_data_service):
    """Cutoff at 11:00 UTC on D-1 must strictly exclude the 11:30 UTC vintage."""
    cutoff = datetime(2026, 1, 14, 11, 0, 0, tzinfo=timezone.utc)
    target_start = "2026-01-15T12:00:00Z"

    gen, pub_iso, is_avail = isolated_data_service.get_forecast_for_interval(target_start, cutoff)

    assert is_avail is True
    # Must select 11500 MW (10:30 UTC), NEVER 14000 MW (11:30 UTC)
    assert gen == 11500
    assert pub_iso == "2026-01-14T10:30:00Z"


def test_intraday_cutoff_unlocks_later_vintage(isolated_data_service):
    """Cutoff at 12:00 UTC on D-1 includes the 11:30 UTC vintage."""
    cutoff = datetime(2026, 1, 14, 12, 0, 0, tzinfo=timezone.utc)
    target_start = "2026-01-15T12:00:00Z"

    gen, pub_iso, is_avail = isolated_data_service.get_forecast_for_interval(target_start, cutoff)

    assert is_avail is True
    assert gen == 14000
    assert pub_iso == "2026-01-14T11:30:00Z"


def test_no_forecast_available_prior_to_early_cutoff(isolated_data_service):
    """Cutoff before any publication must flag forecast as unavailable."""
    cutoff = datetime(2026, 1, 14, 0, 0, 0, tzinfo=timezone.utc)
    target_start = "2026-01-15T12:00:00Z"

    gen, pub_iso, is_avail = isolated_data_service.get_forecast_for_interval(target_start, cutoff)

    assert is_avail is False
    assert gen is None
    assert pub_iso is None


def test_distinct_delivery_and_publication_timestamps(isolated_data_service):
    """Ensure delivery timestamp and publication timestamp are strictly distinct."""
    cutoff = datetime(2026, 1, 14, 11, 0, 0, tzinfo=timezone.utc)
    target_start = "2026-01-15T12:00:00Z"

    gen, pub_iso, is_avail = isolated_data_service.get_forecast_for_interval(target_start, cutoff)
    assert target_start != pub_iso
    assert target_start == "2026-01-15T12:00:00Z"
    assert pub_iso == "2026-01-14T10:30:00Z"


def test_timezone_aware_comparison():
    """Ensure timezone-aware datetime parsing works across ISO variants."""
    from app.services.data_service import DataService
    
    dt_z = DataService._parse_iso_to_utc("2026-01-15T11:00:00Z")
    dt_offset = DataService._parse_iso_to_utc("2026-01-15T11:00:00+00:00")
    
    assert dt_z is not None
    assert dt_offset is not None
    assert dt_z == dt_offset
    assert dt_z.tzinfo == timezone.utc
