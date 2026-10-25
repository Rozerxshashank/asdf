from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import numpy as np

from app.models.schemas import ForecastDeskResponse, DecisionDeskSummary, SettlementPoint
from app.services.data_service import data_service
from app.services import analytics_engine

router = APIRouter(prefix="/api", tags=["Day-Ahead Decision Desk"])


@router.get("/forecast", response_model=ForecastDeskResponse)
async def get_forecast_desk(
    delivery_date: str = Query(
        "2026-01-15",
        pattern=r"^2026-01-(0[1-9]|[12][0-9]|3[01])$",
        description="Target delivery date in January 2026 (YYYY-MM-DD)"
    ),
    cutoff_rule: str = Query(
        "DA_AUCTION_1100",
        description="Cutoff rule preset (DA_AUCTION_1100, DA_AUCTION_1200, INTRADAY_2000, INTRADAY_0000) or custom ISO timestamp"
    )
):
    """Retrieve Day-Ahead wind forecast available at decision cutoff vs actual outturn for a delivery date."""
    try:
        cutoff_dt, cutoff_desc = data_service.resolve_decision_cutoff(delivery_date, cutoff_rule)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid cutoff parameter: {str(e)}")

    intervals_raw = data_service.get_day_intervals(delivery_date, cutoff_dt)
    
    # Calculate summary metrics
    forecasts = [i["forecastGeneration"] for i in intervals_raw if i["forecastGeneration"] is not None and i["actualGeneration"] is not None]
    actuals = [i["actualGeneration"] for i in intervals_raw if i["forecastGeneration"] is not None and i["actualGeneration"] is not None]
    
    matched_count = len(forecasts)
    total_expected = 48
    coverage_pct = round((matched_count / total_expected) * 100.0, 1)

    total_fc_mwh = round(sum(forecasts) * 0.5, 1) if forecasts else None
    total_act_mwh = round(sum(actuals) * 0.5, 1) if actuals else None
    avg_fc_mw = round(float(np.mean(forecasts)), 1) if forecasts else None
    avg_act_mw = round(float(np.mean(actuals)), 1) if actuals else None

    mae = analytics_engine.calculate_mae(forecasts, actuals)
    rmse = analytics_engine.calculate_rmse(forecasts, actuals)
    bias = analytics_engine.calculate_bias(forecasts, actuals)
    wape = analytics_engine.calculate_wape(forecasts, actuals)

    summary = DecisionDeskSummary(
        totalForecastMWh=total_fc_mwh,
        totalActualMWh=total_act_mwh,
        avgForecastMW=avg_fc_mw,
        avgActualMW=avg_act_mw,
        maeMW=round(mae, 1) if mae is not None else None,
        rmseMW=round(rmse, 1) if rmse is not None else None,
        meanBiasMW=round(bias, 1) if bias is not None else None,
        wapePercent=round(wape, 2) if wape is not None else None,
        matchedRecords=matched_count,
        totalExpectedRecords=total_expected,
        coveragePercent=coverage_pct,
        isCached=True,
        notice="Forecast selected under strict anti-lookahead rule: latest vintage with publishTime <= cutoff timestamp."
    )

    point_models = [SettlementPoint(**i) for i in intervals_raw]

    return ForecastDeskResponse(
        deliveryDate=delivery_date,
        cutoffTime=cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        cutoffDescription=cutoff_desc,
        timezone="UTC (UK Civil Time in January)",
        summary=summary,
        intervals=point_models
    )
