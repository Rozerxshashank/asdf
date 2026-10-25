from fastapi import APIRouter
from app.models.schemas import MetadataResponse
from app.config import settings

router = APIRouter(prefix="/api", tags=["Metadata"])


@router.get("/metadata", response_model=MetadataResponse)
async def get_metadata():
    """Retrieve system metadata, dataset bounds, and UK market rules summary."""
    return MetadataResponse(
        datasetStart=settings.EVALUATION_START_DATE,
        datasetEnd=settings.EVALUATION_END_DATE,
        totalSettlementPeriods=31 * 48,  # 1488 in standard 31-day January
        elexonActualsDataset="FUELHH",
        elexonForecastDataset="WINDFOR",
        fuelType="WIND",
        marketRulesSummary={
            "market": "UK Wholesale Electricity Market (GB)",
            "settlementResolution": "30-minute half-hourly periods (48 periods/day)",
            "dayAheadAuctionGateClosure": "11:00 UTC (EPEX SPOT) / 12:00 UTC (Nord Pool UK) on Day D-1",
            "balancingMechanismGateClosure": "60 minutes prior to physical settlement period start",
            "forecastSelectionConvention": "Latest valid vintage published prior to decision cutoff timestamp (publishTime <= cutoff)",
            "errorConvention": "Forecast Generation - Actual Generation (positive = overforecast, negative = underforecast)",
            "timezone": "UTC (matches GMT / UK Civil Time during January; no BST daylight saving in winter)"
        }
    )
