export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  cachedActualsCount: number;
  cachedForecastsCount: number;
  lastCacheRefresh?: string;
  upstreamReachable: boolean;
  message: string;
}

export interface MetadataResponse {
  datasetStart: string;
  datasetEnd: string;
  totalSettlementPeriods: number;
  elexonActualsDataset: string;
  elexonForecastDataset: string;
  fuelType: string;
  marketRulesSummary: {
    market: string;
    settlementResolution: string;
    dayAheadAuctionGateClosure: string;
    balancingMechanismGateClosure: string;
    forecastSelectionConvention: string;
    errorConvention: string;
    timezone: string;
  };
}

export interface SettlementPoint {
  settlementDate: string;
  settlementPeriod: number;
  startTime: string;
  endTime: string;
  actualGeneration: number | null;
  forecastGeneration: number | null;
  publishTime: string | null;
  forecastAvailableByCutoff: boolean;
  forecastError: number | null;
  absoluteError: number | null;
  signedGap: number | null;
}

export interface DecisionDeskSummary {
  totalForecastMWh: number | null;
  totalActualMWh: number | null;
  avgForecastMW: number | null;
  avgActualMW: number | null;
  maeMW: number | null;
  rmseMW: number | null;
  meanBiasMW: number | null;
  wapePercent: number | null;
  matchedRecords: number;
  totalExpectedRecords: number;
  coveragePercent: number;
  isCached: boolean;
  notice?: string;
}

export interface ForecastDeskResponse {
  deliveryDate: string;
  cutoffTime: string;
  cutoffDescription: string;
  timezone: string;
  summary: DecisionDeskSummary;
  intervals: SettlementPoint[];
}

export interface SettlementPeriodStat {
  settlementPeriod: number;
  avgActualMW: number;
  avgForecastMW: number;
  maeMW: number;
  meanBiasMW: number;
  count: number;
}

export interface DailyAccuracyStat {
  settlementDate: string;
  actualMWh: number;
  forecastMWh: number;
  maeMW: number;
  rmseMW: number;
  meanBiasMW: number;
  wapePercent: number | null;
  coveragePercent: number;
  sampleCount: number;
}

export interface MissRecord {
  settlementDate: string;
  settlementPeriod: number;
  startTime: string;
  forecastMW: number;
  actualMW: number;
  errorMW: number;
  publishTime: string | null;
}

export interface DistributionBin {
  binStart: number;
  binEnd: number;
  count: number;
  frequencyPercent: number;
}

export interface OverallMetrics {
  sampleSize: number;
  matchedRecords: number;
  missingRecords: number;
  coveragePercent: number;
  maeMW: number;
  rmseMW: number;
  meanBiasMW: number;
  wapePercent: number | null;
  squaredPearsonR2: number | null;
  predictiveR2: number | null;
  correlationR2: number | null;
  p10ErrorMW: number;
  p50ErrorMW: number;
  p90ErrorMW: number;
}

export interface AccuracyHubResponse {
  evaluationWindow: {
    start: string;
    end: string;
  };
  cutoffRule: string;
  cutoffDescription: string;
  overallMetrics: OverallMetrics;
  settlementPeriodProfile: SettlementPeriodStat[];
  dailyTrends: DailyAccuracyStat[];
  largestMisses: {
    topOverforecasts: MissRecord[];
    topUnderforecasts: MissRecord[];
  };
  errorDistribution: {
    bins: DistributionBin[];
    quantiles: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    sampleCount: number;
  };
  analyticalNotice: string;
}

export interface VintageRecord {
  publishTime: string;
  leadTimeHours: number;
  generation: number;
  isAvailableAtCutoff: boolean;
  vintageCategory: 'PRE_CUTOFF_DECISION' | 'POST_CUTOFF_REVISION';
}

export interface DeliveryPeriodEvolution {
  settlementPeriod: number;
  startTime: string;
  actualMW: number | null;
  decisionForecastMW?: number | null;
  decisionPublishTime?: string | null;
  postCutoffRevisionCount?: number;
  vintages: VintageRecord[];
}

export interface ForecastEvolutionResponse {
  deliveryDate: string;
  cutoffRule?: string;
  cutoffTime?: string;
  cutoffDescription?: string;
  totalVintagesFound: number;
  deliveryPeriodEvolution: DeliveryPeriodEvolution[];
  evolutionNotice: string;
}

export interface ProcurementScenarioRequest {
  deliveryDate: string;
  assumedDemandMW: number;
  assumedNonWindMW: number;
  reserveMarginMW: number;
  cutoffTime?: string;
}

export interface ProcurementInterval {
  settlementPeriod: number;
  startTime: string;
  assumedDemandMW: number;
  assumedNonWindMW: number;
  reserveMarginMW: number;
  forecastWindMW: number | null;
  actualWindMW: number | null;
  netResidualForecastMW: number;
  netResidualActualMW: number | null;
  residualDeltaMW: number | null;
}

export interface ScenarioSummary {
  avgNetResidualForecastMW: number;
  peakNetResidualForecastMW: number;
  totalNetResidualForecastMWh: number;
  avgProcurementImbalanceMW: number | null;
  maxDeficitExposureMW: number;
}

export interface ProcurementScenarioResponse {
  deliveryDate: string;
  assumedDemandMW: number;
  assumedNonWindMW: number;
  reserveMarginMW: number;
  disclaimer: string;
  summary: ScenarioSummary;
  intervals: ProcurementInterval[];
}
