from fastapi import APIRouter, HTTPException
import numpy as np

from app.models.schemas import (
    ProcurementScenarioRequest,
    ProcurementScenarioResponse,
    ProcurementInterval,
    ScenarioSummary
)
from app.services.data_service import data_service
from app.services.analytics_engine import compute_procurement_interval

router = APIRouter(prefix="/api/procurement", tags=["Conditional Procurement Scenario Simulator"])


@router.post("/scenario", response_model=ProcurementScenarioResponse)
async def simulate_procurement_scenario(req: ProcurementScenarioRequest):
    """Simulate residual wholesale procurement requirement under user-defined scenario assumptions."""
    cutoff_rule = req.cutoffTime or "DA_AUCTION_1100"
    try:
        cutoff_dt, _ = data_service.resolve_decision_cutoff(req.deliveryDate, cutoff_rule)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid date or cutoff: {str(e)}")

    day_intervals = data_service.get_day_intervals(req.deliveryDate, cutoff_dt)

    intervals = []
    residual_forecasts = []
    residual_deltas = []

    for item in day_intervals:
        calc = compute_procurement_interval(
            settlement_period=item["settlementPeriod"],
            start_time=item["startTime"],
            demand_mw=req.assumedDemandMW,
            non_wind_mw=req.assumedNonWindMW,
            reserve_margin_mw=req.reserveMarginMW,
            forecast_wind_mw=item["forecastGeneration"],
            actual_wind_mw=item["actualGeneration"]
        )
        intervals.append(ProcurementInterval(**calc))
        residual_forecasts.append(calc["netResidualForecastMW"])
        if calc["residualDeltaMW"] is not None:
            residual_deltas.append(calc["residualDeltaMW"])

    avg_res_fc = float(np.mean(residual_forecasts)) if residual_forecasts else 0.0
    peak_res_fc = float(np.max(residual_forecasts)) if residual_forecasts else 0.0
    total_res_mwh = float(np.sum(residual_forecasts) * 0.5) if residual_forecasts else 0.0
    avg_imbalance = float(np.mean(residual_deltas)) if residual_deltas else None
    
    # Max deficit exposure: where forecast overestimated wind (residual was under-procured)
    # residualDelta < 0 means netResidualForecast < netResidualActual (deficit)
    deficits = [-d for d in residual_deltas if d < 0]
    max_deficit = float(np.max(deficits)) if deficits else 0.0

    disclaimer = (
        "Conditional Scenario Notice: This calculation represents a hypothetical residual balance based strictly "
        "on user-supplied assumptions (assumed demand, non-wind baseline, and reserve margin). Actual wholesale electricity "
        "procurement and thermal dispatch cannot be determined from national wind datasets alone because customer load curves, "
        "bilateral hedge contracts, other generation assets (nuclear, CCGT, biomass), battery storage, interconnectors, and "
        "Balancing Mechanism cashout prices are not present in this dataset. This tool does not claim to optimize trading "
        "costs or forecast actual physical thermal dispatch."
    )

    summary = ScenarioSummary(
        avgNetResidualForecastMW=round(avg_res_fc, 1),
        peakNetResidualForecastMW=round(peak_res_fc, 1),
        totalNetResidualForecastMWh=round(total_res_mwh, 1),
        avgProcurementImbalanceMW=round(avg_imbalance, 1) if avg_imbalance is not None else None,
        maxDeficitExposureMW=round(max_deficit, 1)
    )

    return ProcurementScenarioResponse(
        deliveryDate=req.deliveryDate,
        assumedDemandMW=round(req.assumedDemandMW, 1),
        assumedNonWindMW=round(req.assumedNonWindMW, 1),
        reserveMarginMW=round(req.reserveMarginMW, 1),
        disclaimer=disclaimer,
        summary=summary,
        intervals=intervals
    )
