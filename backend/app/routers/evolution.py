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
    periods: Optional[str] = Query(
        "16,24,36,44",
        description="Comma-separated settlement periods to inspect (e.g. 16,24,36,44)"
    )
):
    """Retrieve historical forecast-vintage evolution across lead times for selected settlement periods."""
    try:
        period_list = [int(p.strip()) for p in periods.split(",") if p.strip()]
        for p in period_list:
            if p < 1 or p > 48:
                raise ValueError(f"Settlement period {p} out of bounds (1-48)")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid periods parameter: {str(e)}")

    evolution_raw = data_service.get_forecast_evolution_for_date(delivery_date, period_list)
    total_vintages = sum(len(e["vintages"]) for e in evolution_raw)

    models = [
        DeliveryPeriodEvolution(
            settlementPeriod=e["settlementPeriod"],
            startTime=e["startTime"],
            actualMW=e["actualMW"],
            vintages=e["vintages"]
        )
        for e in evolution_raw
    ]

    notice = (
        "Forecast vintages reflect actual historical publications from the Elexon BMRS WINDFOR stream. "
        "Each vintage records National Grid ESO's rolling wind generation forecast published prior to delivery. "
        "Comparing earlier (e.g. 48h-ahead) versus later (e.g. 4h-ahead) vintages illustrates forecast convergence "
        "and lead-time uncertainty reduction as weather model resolution tightens."
    )

    return ForecastEvolutionResponse(
        deliveryDate=delivery_date,
        totalVintagesFound=total_vintages,
        deliveryPeriodEvolution=models,
        evolutionNotice=notice
    )
