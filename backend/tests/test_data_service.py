from datetime import datetime, timezone
from app.services.data_service import data_service


def test_data_service_loaded():
    assert data_service.is_loaded is True
    assert data_service.get_actuals_count() == 1488
    assert data_service.get_forecasts_count() > 10000


def test_settlement_period_count_per_day():
    """Ensure every day in January 2026 resolves exactly 48 settlement periods."""
    cutoff_dt, _ = data_service.resolve_decision_cutoff("2026-01-01", "DA_AUCTION_1100")
    day_intervals = data_service.get_day_intervals("2026-01-01", cutoff_dt)
    assert len(day_intervals) == 48
    assert day_intervals[0]["settlementPeriod"] == 1
    assert day_intervals[47]["settlementPeriod"] == 48


def test_all_matched_records_volume():
    """Verify matched records across all 31 days."""
    records = data_service.get_all_matched_records("DA_AUCTION_1100")
    assert len(records) == 31 * 48  # 1488 intervals


def test_cache_fallback_behavior(tmp_path):
    """Verify that DataService handles missing cache files gracefully without crashing."""
    from app.services.data_service import DataService
    
    empty_ds = DataService.__new__(DataService)
    empty_ds.data_dir = tmp_path
    empty_ds.actuals_file = tmp_path / "nonexistent_act.json"
    empty_ds.forecasts_file = tmp_path / "nonexistent_fc.json"
    empty_ds._actuals_cache = []
    empty_ds._forecasts_cache = []
    empty_ds._actuals_by_start = {}
    from collections import defaultdict
    empty_ds._forecasts_by_start = defaultdict(list)
    empty_ds.last_cache_refresh = None
    empty_ds.is_loaded = False
    
    loaded = empty_ds.load_cache()
    assert loaded is False
    assert empty_ds.is_loaded is False
    assert empty_ds.get_actuals_count() == 0
