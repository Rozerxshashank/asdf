import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.services.data_service import data_service
from app.routers import health, metadata, forecast, accuracy, evolution, procurement

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("windlens")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: verify data service readiness on startup."""
    logger.info("Initializing %s v%s", settings.APP_NAME, settings.APP_VERSION)
    if not data_service.is_loaded:
        logger.info("Loading January 2026 Elexon datasets into cache...")
        data_service.load_cache()
    logger.info(
        "DataService ready with %d actuals and %d forecasts",
        data_service.get_actuals_count(),
        data_service.get_forecasts_count()
    )
    yield
    logger.info("Shutting down WindLens service.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "WindLens is a decision-support and accuracy-evaluation platform for UK electricity utility "
        "trading desks procuring wholesale power on the Day-Ahead electricity market. Powered by "
        "official Elexon BMRS data (FUELHH and WINDFOR streams) for January 2026."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

from starlette.exceptions import HTTPException as StarletteHTTPException

# CORS middleware (securely configured for local dev and cloud deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Preserve explicit HTTP error status codes (e.g. 400, 404, 422)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Global unhandled exception handler to prevent leaking internal stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception processing %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred while processing the request."}
    )


# Register routers
app.include_router(health.router)
app.include_router(metadata.router)
app.include_router(forecast.router)
app.include_router(accuracy.router)
app.include_router(evolution.router)
app.include_router(procurement.router)


@app.get("/", tags=["System"])
async def root():
    """Service status and API documentation entry point."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "documentation": "/docs",
        "health": "/api/health",
        "metadata": "/api/metadata"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
