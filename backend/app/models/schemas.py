from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status: healthy, degraded, or unhealthy")
    cachedActualsCount: int = Field(..., description="Count of cached actual records")
    cachedForecastsCount: int = Field(..., description="Count of cached forecast records")
    lastCacheRefresh: Optional[str] = Field(None, description="ISO timestamp of last cache update")
    upstreamReachable: bool = Field(..., description="Whether upstream Elexon API is reachable")
    message: str = Field(..., description="Status summary message")


class MetadataResponse(BaseModel):
    datasetStart: str = Field(..., description="Start of dataset window")
    datasetEnd: str = Field(..., description="End of dataset window")
    totalSettlementPeriods: int = Field(..., description="Expected settlement periods in Jan 2026")
    elexonActualsDataset: str = Field("FUELHH", description="Elexon dataset name for actuals")
    elexonForecastDataset: str = Field("WINDFOR", description="Elexon dataset name for forecasts")
    fuelType: str = Field("WIND", description="Target fuel type")
    marketRulesSummary: Dict[str, Any] = Field(..., description="Market timing rules summary")


class SettlementPoint(BaseModel):
    settlementDate: str = Field(..., description="Settlement date YYYY-MM-DD")
    settlementPeriod: int = Field(..., description="Settlement period (1 to 48)")
    startTime: str = Field(..., description="Settlement interval start time (UTC)")
    endTime: str = Field(..., description="Settlement interval end time (UTC)")
    actualGeneration: Optional[float] = Field(None, description="Actual wind generation in MW")
    forecastGeneration: Optional[float] = Field(None, description="Forecasted wind generation in MW")
    publishTime: Optional[str] = Field(None, description="Forecast publication timestamp (UTC)")
    forecastAvailableByCutoff: bool = Field(..., description="Whether a forecast was published before cutoff")
    forecastError: Optional[float] = Field(None, description="Forecast Error in MW: forecast - actual")
    absoluteError: Optional[float] = Field(None, description="Absolute Error in MW: |forecast - actual|")
    signedGap: Optional[float] = Field(None, description="Signed gap: forecast - actual")


class DecisionDeskSummary(BaseModel):
    totalForecastMWh: Optional[float] = None
    totalActualMWh: Optional[float] = None
    avgForecastMW: Optional[float] = None
    avgActualMW: Optional[float] = None
    maeMW: Optional[float] = None
    rmseMW: Optional[float] = None
    meanBiasMW: Optional[float] = None
    wapePercent: Optional[float] = None
    matchedRecords: int
    totalExpectedRecords: int
    coveragePercent: float
    isCached: bool = True
    notice: Optional[str] = None


class ForecastDeskResponse(BaseModel):
    deliveryDate: str
    cutoffTime: str
    cutoffDescription: str
    timezone: str = "UTC (UK Civil Time in January)"
    summary: DecisionDeskSummary
    intervals: List[SettlementPoint]


class SettlementPeriodStat(BaseModel):
    settlementPeriod: int
    avgActualMW: float
    avgForecastMW: float
    maeMW: float
    meanBiasMW: float
    count: int


class DailyAccuracyStat(BaseModel):
    settlementDate: str
    actualMWh: float
    forecastMWh: float
    maeMW: float
    rmseMW: float
    meanBiasMW: float
    wapePercent: Optional[float]
    coveragePercent: float
    sampleCount: int


class MissRecord(BaseModel):
    settlementDate: str
    settlementPeriod: int
    startTime: str
    forecastMW: float
    actualMW: float
    errorMW: float
    publishTime: Optional[str]


class DistributionBin(BaseModel):
    binStart: float
    binEnd: float
    count: int
    frequencyPercent: float


class OverallMetrics(BaseModel):
    sampleSize: int
    matchedRecords: int
    missingRecords: int
    coveragePercent: float
    maeMW: float
    rmseMW: float
    meanBiasMW: float
    wapePercent: Optional[float]
    correlationR2: Optional[float]
    p10ErrorMW: float
    p50ErrorMW: float
    p90ErrorMW: float


class AccuracyHubResponse(BaseModel):
    evaluationWindow: Dict[str, str]
    cutoffRule: str
    cutoffDescription: str
    overallMetrics: OverallMetrics
    settlementPeriodProfile: List[SettlementPeriodStat]
    dailyTrends: List[DailyAccuracyStat]
    largestMisses: Dict[str, List[MissRecord]]
    errorDistribution: Dict[str, Any]
    analyticalNotice: str


class ForecastVintageRecord(BaseModel):
    publishTime: str
    startTime: str
    generation: float
    leadTimeHours: float


class DeliveryPeriodEvolution(BaseModel):
    settlementPeriod: int
    startTime: str
    actualMW: Optional[float]
    vintages: List[Dict[str, Any]]


class ForecastEvolutionResponse(BaseModel):
    deliveryDate: str
    totalVintagesFound: int
    deliveryPeriodEvolution: List[DeliveryPeriodEvolution]
    evolutionNotice: str


class ProcurementScenarioRequest(BaseModel):
    deliveryDate: str = Field(
        "2026-01-15",
        pattern=r"^2026-01-(0[1-9]|[12][0-9]|3[01])$",
        description="Target delivery date in January 2026 (YYYY-MM-DD)"
    )
    assumedDemandMW: float = Field(32000.0, ge=1000.0, le=100000.0, description="Assumed national consumer demand (MW)")
    assumedNonWindMW: float = Field(14000.0, ge=0.0, le=80000.0, description="Assumed non-wind base generation (MW)")
    reserveMarginMW: float = Field(2000.0, ge=0.0, le=20000.0, description="Optional system reserve margin (MW)")
    cutoffTime: Optional[str] = Field(None, description="Optional custom cutoff timestamp (UTC)")


class ProcurementInterval(BaseModel):
    settlementPeriod: int
    startTime: str
    assumedDemandMW: float
    assumedNonWindMW: float
    reserveMarginMW: float
    forecastWindMW: Optional[float]
    actualWindMW: Optional[float]
    netResidualForecastMW: float
    netResidualActualMW: Optional[float]
    residualDeltaMW: Optional[float]


class ScenarioSummary(BaseModel):
    avgNetResidualForecastMW: float
    peakNetResidualForecastMW: float
    totalNetResidualForecastMWh: float
    avgProcurementImbalanceMW: Optional[float]
    maxDeficitExposureMW: Optional[float]


class ProcurementScenarioResponse(BaseModel):
    deliveryDate: str
    assumedDemandMW: float
    assumedNonWindMW: float
    reserveMarginMW: float
    disclaimer: str
    summary: ScenarioSummary
    intervals: List[ProcurementInterval]
