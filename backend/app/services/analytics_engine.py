import math
from typing import List, Dict, Any, Optional, Tuple
import numpy as np


def calculate_mae(forecasts: List[float], actuals: List[float]) -> Optional[float]:
    """Calculate Mean Absolute Error (MAE) in MW.
    
    Formula: (1 / N) * sum(|F_i - A_i|)
    Returns None if sample size is zero.
    """
    if not forecasts or not actuals or len(forecasts) != len(actuals) or len(forecasts) == 0:
        return None
    errors = [abs(f - a) for f, a in zip(forecasts, actuals)]
    return float(np.mean(errors))


def calculate_rmse(forecasts: List[float], actuals: List[float]) -> Optional[float]:
    """Calculate Root Mean Squared Error (RMSE) in MW.
    
    Formula: sqrt((1 / N) * sum((F_i - A_i)^2))
    Returns None if sample size is zero.
    """
    if not forecasts or not actuals or len(forecasts) != len(actuals) or len(forecasts) == 0:
        return None
    sq_errors = [(f - a) ** 2 for f, a in zip(forecasts, actuals)]
    return float(math.sqrt(np.mean(sq_errors)))


def calculate_bias(forecasts: List[float], actuals: List[float]) -> Optional[float]:
    """Calculate Mean Bias Error in MW.
    
    Convention: error = forecast - actual.
    Positive bias indicates over-forecasting (forecast > actual).
    Negative bias indicates under-forecasting (forecast < actual).
    Returns None if sample size is zero.
    """
    if not forecasts or not actuals or len(forecasts) != len(actuals) or len(forecasts) == 0:
        return None
    diffs = [f - a for f, a in zip(forecasts, actuals)]
    return float(np.mean(diffs))


def calculate_wape(forecasts: List[float], actuals: List[float]) -> Optional[float]:
    """Calculate Weighted Absolute Percentage Error (WAPE) as a percentage.
    
    Formula: (sum(|F_i - A_i|) / sum(A_i)) * 100
    
    Zero-denominator policy:
    If sum(actuals) == 0:
      - If sum(|F_i - A_i|) == 0: returns 0.0 (perfect zero actual and zero forecast).
      - Else: returns None (undefined, prevents division by zero).
    """
    if not forecasts or not actuals or len(forecasts) != len(actuals) or len(forecasts) == 0:
        return None
    
    sum_abs_err = sum(abs(f - a) for f, a in zip(forecasts, actuals))
    sum_actual = sum(actuals)
    
    if sum_actual <= 0.0:
        if sum_abs_err == 0.0:
            return 0.0
        return None
    
    return float((sum_abs_err / sum_actual) * 100.0)


def calculate_correlation(forecasts: List[float], actuals: List[float]) -> Optional[float]:
    """Calculate Pearson correlation coefficient R^2."""
    if not forecasts or not actuals or len(forecasts) != len(actuals) or len(forecasts) < 2:
        return None
    f_arr = np.array(forecasts, dtype=float)
    a_arr = np.array(actuals, dtype=float)
    
    std_f = np.std(f_arr)
    std_a = np.std(a_arr)
    if std_f == 0.0 or std_a == 0.0:
        return None
    
    corr_matrix = np.corrcoef(f_arr, a_arr)
    r = corr_matrix[0, 1]
    if math.isnan(r):
        return None
    return float(max(0.0, r ** 2))


def calculate_empirical_quantiles(errors: List[float]) -> Dict[str, float]:
    """Compute empirical quantiles (P10, P25, P50/median, P75, P90) of forecast errors.
    
    Note: These are empirical sample quantiles of historical Jan 2026 errors,
    not calibrated parametric probabilistic forecasts.
    """
    if not errors:
        return {"p10": 0.0, "p25": 0.0, "p50": 0.0, "p75": 0.0, "p90": 0.0}
    
    arr = np.array(errors, dtype=float)
    return {
        "p10": float(np.percentile(arr, 10)),
        "p25": float(np.percentile(arr, 25)),
        "p50": float(np.percentile(arr, 50)),
        "p75": float(np.percentile(arr, 75)),
        "p90": float(np.percentile(arr, 90)),
    }


def calculate_distribution_bins(errors: List[float], num_bins: int = 15) -> List[Dict[str, Any]]:
    """Compute histogram bins for forecast errors."""
    if not errors:
        return []
    
    arr = np.array(errors, dtype=float)
    min_val = float(np.min(arr))
    max_val = float(np.max(arr))
    
    if min_val == max_val:
        return [{
            "binStart": round(min_val - 1.0, 1),
            "binEnd": round(max_val + 1.0, 1),
            "count": len(errors),
            "frequencyPercent": 100.0
        }]
    
    counts, bin_edges = np.histogram(arr, bins=num_bins)
    total = len(errors)
    
    result = []
    for i in range(len(counts)):
        result.append({
            "binStart": round(float(bin_edges[i]), 1),
            "binEnd": round(float(bin_edges[i+1]), 1),
            "count": int(counts[i]),
            "frequencyPercent": round((counts[i] / total) * 100.0, 2)
        })
    return result


def calculate_settlement_period_profile(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Calculate accuracy breakdown across the 48 half-hour settlement periods."""
    by_period: Dict[int, List[Tuple[float, float]]] = {p: [] for p in range(1, 49)}
    
    for r in records:
        f = r.get("forecastGeneration")
        a = r.get("actualGeneration")
        p = r.get("settlementPeriod")
        if f is not None and a is not None and p in by_period:
            by_period[p].append((float(f), float(a)))
    
    profile = []
    for p in range(1, 49):
        pairs = by_period[p]
        if pairs:
            forecasts = [pair[0] for pair in pairs]
            actuals = [pair[1] for pair in pairs]
            profile.append({
                "settlementPeriod": p,
                "avgActualMW": round(float(np.mean(actuals)), 1),
                "avgForecastMW": round(float(np.mean(forecasts)), 1),
                "maeMW": round(calculate_mae(forecasts, actuals) or 0.0, 1),
                "meanBiasMW": round(calculate_bias(forecasts, actuals) or 0.0, 1),
                "count": len(pairs)
            })
        else:
            profile.append({
                "settlementPeriod": p,
                "avgActualMW": 0.0,
                "avgForecastMW": 0.0,
                "maeMW": 0.0,
                "meanBiasMW": 0.0,
                "count": 0
            })
    return profile


def calculate_daily_trends(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Calculate daily accuracy trends across January 2026."""
    from collections import defaultdict
    by_date = defaultdict(list)
    
    for r in records:
        f = r.get("forecastGeneration")
        a = r.get("actualGeneration")
        d = r.get("settlementDate")
        if f is not None and a is not None and d:
            by_date[d].append((float(f), float(a)))
    
    trends = []
    for d in sorted(by_date.keys()):
        pairs = by_date[d]
        forecasts = [p[0] for p in pairs]
        actuals = [p[1] for p in pairs]
        
        # In a 30-min settlement period, 1 MW for 0.5 hours = 0.5 MWh
        actual_mwh = sum(actuals) * 0.5
        forecast_mwh = sum(forecasts) * 0.5
        mae = calculate_mae(forecasts, actuals) or 0.0
        rmse = calculate_rmse(forecasts, actuals) or 0.0
        bias = calculate_bias(forecasts, actuals) or 0.0
        wape = calculate_wape(forecasts, actuals)
        coverage = (len(pairs) / 48.0) * 100.0  # 48 periods per standard day
        
        trends.append({
            "settlementDate": d,
            "actualMWh": round(actual_mwh, 1),
            "forecastMWh": round(forecast_mwh, 1),
            "maeMW": round(mae, 1),
            "rmseMW": round(rmse, 1),
            "meanBiasMW": round(bias, 1),
            "wapePercent": round(wape, 2) if wape is not None else None,
            "coveragePercent": round(min(100.0, coverage), 1),
            "sampleCount": len(pairs)
        })
    return trends


def calculate_largest_misses(records: List[Dict[str, Any]], top_k: int = 5) -> Dict[str, List[Dict[str, Any]]]:
    """Identify largest positive and negative forecast errors."""
    valid_records = []
    for r in records:
        f = r.get("forecastGeneration")
        a = r.get("actualGeneration")
        if f is not None and a is not None:
            err = float(f) - float(a)
            valid_records.append({
                "settlementDate": r.get("settlementDate", ""),
                "settlementPeriod": r.get("settlementPeriod", 0),
                "startTime": r.get("startTime", ""),
                "forecastMW": round(float(f), 1),
                "actualMW": round(float(a), 1),
                "errorMW": round(err, 1),
                "publishTime": r.get("publishTime")
            })
    
    # Top over-forecasts: error > 0 descending
    over = sorted([r for r in valid_records if r["errorMW"] > 0], key=lambda x: x["errorMW"], reverse=True)[:top_k]
    # Top under-forecasts: error < 0 ascending (most negative first)
    under = sorted([r for r in valid_records if r["errorMW"] < 0], key=lambda x: x["errorMW"])[:top_k]
    
    return {
        "topOverforecasts": over,
        "topUnderforecasts": under
    }


def compute_procurement_interval(
    settlement_period: int,
    start_time: str,
    demand_mw: float,
    non_wind_mw: float,
    reserve_margin_mw: float,
    forecast_wind_mw: Optional[float],
    actual_wind_mw: Optional[float]
) -> Dict[str, Any]:
    """Compute residual requirements under explicit user scenario inputs."""
    # Net Residual = max(0, Assumed Demand + Reserve Margin - Assumed Non-Wind - Wind Generation)
    eff_forecast_wind = forecast_wind_mw if forecast_wind_mw is not None else 0.0
    net_residual_forecast = max(0.0, demand_mw + reserve_margin_mw - non_wind_mw - eff_forecast_wind)
    
    net_residual_actual = None
    residual_delta = None
    if actual_wind_mw is not None:
        net_residual_actual = max(0.0, demand_mw + reserve_margin_mw - non_wind_mw - actual_wind_mw)
        # Delta: procurement delta based on forecast error
        residual_delta = net_residual_forecast - net_residual_actual
    
    return {
        "settlementPeriod": settlement_period,
        "startTime": start_time,
        "assumedDemandMW": round(demand_mw, 1),
        "assumedNonWindMW": round(non_wind_mw, 1),
        "reserveMarginMW": round(reserve_margin_mw, 1),
        "forecastWindMW": round(forecast_wind_mw, 1) if forecast_wind_mw is not None else None,
        "actualWindMW": round(actual_wind_mw, 1) if actual_wind_mw is not None else None,
        "netResidualForecastMW": round(net_residual_forecast, 1),
        "netResidualActualMW": round(net_residual_actual, 1) if net_residual_actual is not None else None,
        "residualDeltaMW": round(residual_delta, 1) if residual_delta is not None else None
    }
