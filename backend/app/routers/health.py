from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.data_service import data_service
from app.services.elexon_client import elexon_client

router = APIRouter(prefix="/api", tags=["System"])


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Health check endpoint providing cache state and upstream connectivity."""
    upstream_ok = await elexon_client.ping_upstream()
    actuals_count = data_service.get_actuals_count()
    forecasts_count = data_service.get_forecasts_count()

    status = "healthy" if actuals_count > 0 and forecasts_count > 0 else "degraded"
    msg = (
        f"Data cache operational with {actuals_count} actuals and {forecasts_count} forecasts. "
        f"Upstream Elexon BMRS API: {'connected' if upstream_ok else 'unreachable (cached fallback active)'}."
    )

    return HealthResponse(
        status=status,
        cachedActualsCount=actuals_count,
        cachedForecastsCount=forecasts_count,
        lastCacheRefresh=data_service.last_cache_refresh,
        upstreamReachable=upstream_ok,
        message=msg
    )
