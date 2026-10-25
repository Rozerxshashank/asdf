from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException

from app.models.schemas import ForecastEvolutionResponse, DeliveryPeriodEvolution
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["Forecast Evolution & Uncertainty"])


@router.get("/forecast-evolution", response_model=ForecastEvolutionResponse)
async def get_forecast_evolution(
    delivery_date: str = Query(
        "2026-01-15",
        pattern=r"^2026-01-(0[1-9]|[12][0-9]|3[01])$",
        description="Target delivery date in January 2026 (YYYY-MM-DD)"
    ),
    cutoff_rule: str = Query(
        "DA_AUCTION_1100",
        description="Cutoff rule preset (DA_AUCTION_1100, DA_AUCTION_1200, INTRADAY_2000, INTRADAY_0000) or custom ISO timestamp"
    ),
    periods: Optional[str] = Query(
        "16,24,36,44",
        description="Comma-separated settlement periods to inspect (e.g. 16,24,36,44)"
    )
):
    """Retrieve historical forecast-vintage evolution across lead times for selected settlement periods.
    
    Explicitly separates:
    - Pre-Cutoff Forecasts: Vintages published prior to the specified procurement gate (available at decision time).
    - Post-Cutoff Revisions: Retrospective forecast updates published after the procurement decision.
    """
    try:
        cutoff_dt, cutoff_desc = data_service.resolve_decision_cutoff(delivery_date, cutoff_rule)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid cutoff parameter: {str(e)}")

    try:
        period_list = [int(p.strip()) for p in periods.split(",") if p.strip()]
        for p in period_list:
            if p < 1 or p > 48:
                raise ValueError(f"Settlement period {p} out of bounds (1-48)")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid periods parameter: {str(e)}")

    evolution_raw = data_service.get_forecast_evolution_for_date(
        delivery_date,
        settlement_periods=period_list,
        cutoff_dt=cutoff_dt
    )
    total_vintages = sum(len(e["vintages"]) for e in evolution_raw)

    models = [
        DeliveryPeriodEvolution(
            settlementPeriod=e["settlementPeriod"],
            startTime=e["startTime"],
            actualMW=e["actualMW"],
            decisionForecastMW=e.get("decisionForecastMW"),
            decisionPublishTime=e.get("decisionPublishTime"),
            postCutoffRevisionCount=e.get("postCutoffRevisionCount", 0),
            vintages=e["vintages"]
        )
        for e in evolution_raw
    ]

    notice = (
        f"Forecast vintages reflect actual historical publications from the Elexon BMRS WINDFOR stream. "
        f"Active decision cutoff: {cutoff_desc}. "
        f"CRITICAL TRADING RULE: Vintages marked as 'PRE_CUTOFF_DECISION' (solid line/badge) were published before {cutoff_dt.strftime('%H:%M UTC on %Y-%m-%d')} "
        f"and were available for the procurement decision. Vintages marked as 'POST_CUTOFF_REVISION' (dashed line/amber badge) "
        f"represent retrospective model updates published after the auction gate and must NEVER be assumed available at original decision time."
    )

    return ForecastEvolutionResponse(
        deliveryDate=delivery_date,
        cutoffRule=cutoff_rule,
        cutoffTime=cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        cutoffDescription=cutoff_desc,
        totalVintagesFound=total_vintages,
        deliveryPeriodEvolution=models,
        evolutionNotice=notice
    )
