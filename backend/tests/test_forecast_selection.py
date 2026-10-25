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


def test_invalid_cutoff_raises_value_error():
    """Verify that an invalid custom cutoff string raises ValueError with no silent fallback."""
    from app.services.data_service import DataService
    
    with pytest.raises(ValueError, match="Invalid custom cutoff timestamp"):
        DataService.resolve_decision_cutoff("2026-01-15", "invalid-timestamp-string")
    
    with pytest.raises(ValueError, match="Cutoff rule cannot be empty"):
        DataService.resolve_decision_cutoff("2026-01-15", "")


def test_naive_cutoff_rejected():
    """Verify that a naive timestamp without timezone offset is rejected."""
    from app.services.data_service import DataService
    
    with pytest.raises(ValueError, match="must include explicit timezone information"):
        DataService.resolve_decision_cutoff("2026-01-15", "2026-01-14T11:00:00")


def test_hourly_to_half_hourly_alignment_representative_records():
    """Verify real WINDFOR hourly records align legitimately to both half-hourly settlement periods.
    
    GB Market Convention:
    - WINDFOR is published at hourly cadence (HH:00:00Z).
    - Settlement periods 1 (00:00-00:30) and 2 (00:30-01:00) both represent instantaneous/average
      power in MW delivered over the 00:00-01:00 clock hour.
    - An hourly average MW legitimately applies across both 30-min settlement intervals,
      yielding 0.5 * MW energy (MWh) per period without manufacturing intermediate fake vintages.
    """
    from app.services.data_service import data_service
    
    # 2026-01-15 Delivery Date under Day-Ahead Gate (11:00 UTC D-1)
    cutoff_dt, _ = data_service.resolve_decision_cutoff("2026-01-15", "DA_AUCTION_1100")
    
    intervals = data_service.get_day_intervals("2026-01-15", cutoff_dt)
    assert len(intervals) == 48
    
    # Period 1: 00:00 to 00:30
    p1 = intervals[0]
    assert p1["settlementPeriod"] == 1
    assert p1["startTime"] == "2026-01-15T00:00:00Z"
    
    # Period 2: 00:30 to 01:00
    p2 = intervals[1]
    assert p2["settlementPeriod"] == 2
    assert p2["startTime"] == "2026-01-15T00:30:00Z"
    
    # Both must match the hourly WINDFOR forecast for 00:00:00Z
    assert p1["forecastGeneration"] is not None
    assert p2["forecastGeneration"] is not None
    assert p1["forecastGeneration"] == p2["forecastGeneration"]
    assert p1["publishTime"] == p2["publishTime"]
    
    # Verify publication time is strictly <= cutoff (2026-01-14T11:00:00Z)
    pub_dt = datetime.fromisoformat(p1["publishTime"].replace("Z", "+00:00"))
    assert pub_dt <= cutoff_dt


def test_forecast_evolution_pre_and_post_cutoff_classification():
    """Verify that forecast evolution classifies pre-cutoff vs retrospective revisions."""
    from app.services.data_service import data_service
    
    cutoff_dt, _ = data_service.resolve_decision_cutoff("2026-01-15", "DA_AUCTION_1100")
    evolution = data_service.get_forecast_evolution_for_date("2026-01-15", settlement_periods=[16], cutoff_dt=cutoff_dt)
    
    assert len(evolution) == 1
    p16 = evolution[0]
    assert p16["settlementPeriod"] == 16
    assert p16["decisionForecastMW"] is not None
    assert p16["decisionPublishTime"] is not None
    
    # Verify that decisionPublishTime is <= cutoff_dt
    dec_pub_dt = datetime.fromisoformat(p16["decisionPublishTime"].replace("Z", "+00:00"))
    assert dec_pub_dt <= cutoff_dt
    
    # Check that post-cutoff revisions exist and are marked as POST_CUTOFF_REVISION
    has_pre = False
    has_post = False
    for v in p16["vintages"]:
        v_pub_dt = datetime.fromisoformat(v["publishTime"].replace("Z", "+00:00"))
        if v_pub_dt <= cutoff_dt:
            assert v["isAvailableAtCutoff"] is True
            assert v["vintageCategory"] == "PRE_CUTOFF_DECISION"
            has_pre = True
        else:
            assert v["isAvailableAtCutoff"] is False
            assert v["vintageCategory"] == "POST_CUTOFF_REVISION"
            has_post = True
            
    assert has_pre, "Must have pre-cutoff decision vintages"
    assert has_post, "Must have post-cutoff revisions for period 16"

