from fastapi import APIRouter, Query, HTTPException
from app.models.schemas import (
    AccuracyHubResponse,
    OverallMetrics,
    SettlementPeriodStat,
    DailyAccuracyStat,
    MissRecord
)
from app.services.data_service import data_service
from app.services import analytics_engine

router = APIRouter(prefix="/api", tags=["Quantified Accuracy Hub"])


VALID_MONTHLY_RULES = {
    "DA_AUCTION_1100",
    "DA_AUCTION_1200",
    "INTRADAY_2000",
    "INTRADAY_0000"
}


@router.get("/accuracy", response_model=AccuracyHubResponse)
async def get_accuracy_hub(
    cutoff_rule: str = Query(
        "DA_AUCTION_1100",
        description="Date-relative cutoff preset: DA_AUCTION_1100, DA_AUCTION_1200, INTRADAY_2000, INTRADAY_0000"
    )
):
    """Calculate comprehensive forecast accuracy metrics across the full January 2026 dataset."""

    rule_clean = (cutoff_rule or "").strip()
    if rule_clean not in VALID_MONTHLY_RULES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid cutoff_rule '{cutoff_rule}' for monthly accuracy aggregation. "
                f"Custom absolute timestamps (e.g., fixed ISO dates) cannot be applied across multiple delivery dates "
                f"because applying a single timestamp to all 31 days in January 2026 introduces severe look-ahead bias "
                f"for earlier days and stale forecasts for later days. "
                f"Monthly aggregation requires a valid date-relative cutoff preset: {', '.join(sorted(VALID_MONTHLY_RULES))}."
            )
        )

    try:
        _, cutoff_desc = data_service.resolve_decision_cutoff("2026-01-15", rule_clean)
        all_records = data_service.get_all_matched_records(cutoff_rule=rule_clean)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid cutoff parameter: {str(e)}")

    total_expected = 31 * 48  # 1488 intervals in January

    forecasts = []
    actuals = []
    errors = []
    for r in all_records:
        f = r.get("forecastGeneration")
        a = r.get("actualGeneration")
        if f is not None and a is not None:
            forecasts.append(f)
            actuals.append(a)
            errors.append(f - a)

    matched_count = len(forecasts)
    missing_count = total_expected - matched_count
    coverage_pct = round((matched_count / total_expected) * 100.0, 1) if total_expected > 0 else 0.0

    mae = analytics_engine.calculate_mae(forecasts, actuals) or 0.0
    rmse = analytics_engine.calculate_rmse(forecasts, actuals) or 0.0
    bias = analytics_engine.calculate_bias(forecasts, actuals) or 0.0
    wape = analytics_engine.calculate_wape(forecasts, actuals)
    sq_pearson = analytics_engine.calculate_squared_pearson(forecasts, actuals)
    pred_r2 = analytics_engine.calculate_predictive_r2(forecasts, actuals)
    quantiles = analytics_engine.calculate_empirical_quantiles(errors)

    overall = OverallMetrics(
        sampleSize=total_expected,
        matchedRecords=matched_count,
        missingRecords=missing_count,
        coveragePercent=coverage_pct,
        maeMW=round(mae, 1),
        rmseMW=round(rmse, 1),
        meanBiasMW=round(bias, 1),
        wapePercent=round(wape, 2) if wape is not None else None,
        squaredPearsonR2=round(sq_pearson, 3) if sq_pearson is not None else None,
        predictiveR2=round(pred_r2, 3) if pred_r2 is not None else None,
        correlationR2=round(sq_pearson, 3) if sq_pearson is not None else None,
        p10ErrorMW=round(quantiles["p10"], 1),
        p50ErrorMW=round(quantiles["p50"], 1),
        p90ErrorMW=round(quantiles["p90"], 1)
    )

    # Settlement period profile (1 to 48)
    profile_raw = analytics_engine.calculate_settlement_period_profile(all_records)
    profile = [SettlementPeriodStat(**p) for p in profile_raw]

    # Daily trends (Jan 1 to Jan 31)
    trends_raw = analytics_engine.calculate_daily_trends(all_records)
    trends = [DailyAccuracyStat(**t) for t in trends_raw]

    # Largest misses
    misses_raw = analytics_engine.calculate_largest_misses(all_records, top_k=5)
    largest_misses = {
        "topOverforecasts": [MissRecord(**m) for m in misses_raw["topOverforecasts"]],
        "topUnderforecasts": [MissRecord(**m) for m in misses_raw["topUnderforecasts"]]
    }

    # Error distribution
    dist_bins = analytics_engine.calculate_distribution_bins(errors, num_bins=16)

    notice = (
        "Accuracy metrics are computed with error = forecast - actual. Positive bias denotes systematic "
        "over-forecasting (downside procurement risk; short in Balancing Mechanism). WAPE is reported as "
        "the volume-weighted percentage metric (MAPE is omitted due to zero/near-zero actuals causing division anomalies). "
        "P10, P50, and P90 represent empirical error quantiles for January 2026 under the specified cutoff rule "
        "and should not be interpreted as calibrated parametric probabilistic forecasts or financial Value-at-Risk."
    )

    _, cutoff_desc = data_service.resolve_decision_cutoff("2026-01-15", cutoff_rule)

    return AccuracyHubResponse(
        evaluationWindow={"start": "2026-01-01", "end": "2026-01-31"},
        cutoffRule=cutoff_rule,
        cutoffDescription=cutoff_desc,
        overallMetrics=overall,
        settlementPeriodProfile=profile,
        dailyTrends=trends,
        largestMisses=largest_misses,
        errorDistribution={
            "bins": dist_bins,
            "quantiles": quantiles,
            "sampleCount": len(errors)
        },
        analyticalNotice=notice
    )
