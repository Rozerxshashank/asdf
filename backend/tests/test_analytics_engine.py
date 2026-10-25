import pytest
import math
from app.services import analytics_engine


def test_mae_calculation(sample_pairs):
    forecasts, actuals = sample_pairs
    mae = analytics_engine.calculate_mae(forecasts, actuals)
    assert mae is not None
    assert round(mae, 2) == 1600.0


def test_rmse_calculation(sample_pairs):
    forecasts, actuals = sample_pairs
    rmse = analytics_engine.calculate_rmse(forecasts, actuals)
    assert rmse is not None
    assert round(rmse, 2) == round(math.sqrt(3600000.0), 2)  # ~1897.37


def test_bias_positive_overforecasting(sample_pairs):
    forecasts, actuals = sample_pairs
    bias = analytics_engine.calculate_bias(forecasts, actuals)
    assert bias is not None
    assert round(bias, 2) == 800.0
    # Positive bias explicitly defined as over-forecasting (forecast > actual)
    assert bias > 0


def test_bias_negative_underforecasting():
    forecasts = [5000.0, 6000.0]
    actuals = [7000.0, 8000.0]
    bias = analytics_engine.calculate_bias(forecasts, actuals)
    assert bias is not None
    assert round(bias, 2) == -2000.0
    assert bias < 0


def test_wape_calculation(sample_pairs):
    forecasts, actuals = sample_pairs
    wape = analytics_engine.calculate_wape(forecasts, actuals)
    assert wape is not None
    # 8000 / 64000 * 100 = 12.5%
    assert round(wape, 2) == 12.5


def test_wape_zero_denominator_policy():
    """Verify explicit zero-denominator policy when sum(actuals) is zero."""
    # Case 1: Zero actuals, non-zero forecast error -> Undefined (None)
    forecasts = [500.0, 200.0]
    actuals = [0.0, 0.0]
    wape = analytics_engine.calculate_wape(forecasts, actuals)
    assert wape is None, "WAPE must return None when sum(actuals)==0 and error > 0 to prevent division by zero"

    # Case 2: Zero actuals, zero forecasts (perfect 0 outturn) -> 0.0
    forecasts_zero = [0.0, 0.0]
    actuals_zero = [0.0, 0.0]
    wape_zero = analytics_engine.calculate_wape(forecasts_zero, actuals_zero)
    assert wape_zero == 0.0


def test_empty_lists_return_none():
    assert analytics_engine.calculate_mae([], []) is None
    assert analytics_engine.calculate_rmse([], []) is None
    assert analytics_engine.calculate_bias([], []) is None
    assert analytics_engine.calculate_wape([], []) is None
    assert analytics_engine.calculate_correlation([], []) is None


def test_mismatched_lengths_return_none():
    assert analytics_engine.calculate_mae([100.0], [100.0, 200.0]) is None
    assert analytics_engine.calculate_rmse([100.0], [100.0, 200.0]) is None
    assert analytics_engine.calculate_bias([100.0], [100.0, 200.0]) is None
    assert analytics_engine.calculate_wape([100.0], [100.0, 200.0]) is None


def test_empirical_quantiles():
    # Symmetric errors from -500 to +500
    errors = [-500.0, -250.0, 0.0, 250.0, 500.0]
    q = analytics_engine.calculate_empirical_quantiles(errors)
    assert q["p50"] == 0.0
    assert q["p10"] < q["p50"]
    assert q["p90"] > q["p50"]


def test_distribution_bins():
    errors = [-1000.0, -500.0, 0.0, 500.0, 1000.0]
    bins = analytics_engine.calculate_distribution_bins(errors, num_bins=4)
    assert len(bins) == 4
    total_count = sum(b["count"] for b in bins)
    assert total_count == len(errors)
    total_pct = sum(b["frequencyPercent"] for b in bins)
    assert abs(total_pct - 100.0) < 1.0


def test_procurement_interval_calculation():
    calc = analytics_engine.compute_procurement_interval(
        settlement_period=1,
        start_time="2026-01-15T00:00:00Z",
        demand_mw=30000.0,
        non_wind_mw=10000.0,
        reserve_margin_mw=2000.0,
        forecast_wind_mw=8000.0,
        actual_wind_mw=6000.0
    )
    # Residual forecast: 30000 + 2000 - 10000 - 8000 = 14000.0 MW
    assert calc["netResidualForecastMW"] == 14000.0
    # Residual actual: 30000 + 2000 - 10000 - 6000 = 16000.0 MW
    assert calc["netResidualActualMW"] == 16000.0
    # Residual delta: 14000 - 16000 = -2000.0 MW (deficit under-procured)
    assert calc["residualDeltaMW"] == -2000.0


def test_squared_pearson_vs_predictive_r2():
    """Verify distinction between squared Pearson correlation (r^2) and predictive R^2."""
    actuals = [1000.0, 2000.0, 3000.0, 4000.0]
    
    # Case A: Perfect forecast (F == A)
    perfect_fc = [1000.0, 2000.0, 3000.0, 4000.0]
    assert analytics_engine.calculate_squared_pearson(perfect_fc, actuals) == 1.0
    assert analytics_engine.calculate_predictive_r2(perfect_fc, actuals) == 1.0

    # Case B: Biased forecast with perfect shape (F = A + 2000)
    # Pearson r^2 is 1.0 (perfect correlation / shape match)
    # But predictive R^2 is heavily penalized by systematic bias!
    biased_fc = [3000.0, 4000.0, 5000.0, 6000.0]
    sq_pearson = analytics_engine.calculate_squared_pearson(biased_fc, actuals)
    pred_r2 = analytics_engine.calculate_predictive_r2(biased_fc, actuals)
    
    assert round(sq_pearson, 4) == 1.0
    assert pred_r2 < 0.0, "Predictive R^2 must penalize large systematic bias and can be negative"

    # Case C: Forecast equal to mean of actuals (naive climatology benchmark)
    # By definition, SS_res == SS_tot, so predictive R^2 == 0.0
    mean_a = sum(actuals) / len(actuals)
    climatology_fc = [mean_a] * len(actuals)
    # Zero variance in forecast -> Pearson is None
    assert analytics_engine.calculate_squared_pearson(climatology_fc, actuals) is None
    # Predictive R^2 is exactly 0.0
    assert analytics_engine.calculate_predictive_r2(climatology_fc, actuals) == 0.0


def test_predictive_r2_edge_cases():
    """Verify edge cases for predictive R^2 calculation."""
    # Fewer than 2 samples
    assert analytics_engine.calculate_predictive_r2([100.0], [100.0]) is None
    
    # Constant actual series with perfect forecast
    assert analytics_engine.calculate_predictive_r2([500.0, 500.0], [500.0, 500.0]) == 1.0
    
    # Constant actual series with imperfect forecast
    assert analytics_engine.calculate_predictive_r2([600.0, 600.0], [500.0, 500.0]) is None
