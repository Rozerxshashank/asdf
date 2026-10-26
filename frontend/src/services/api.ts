import {
  HealthResponse,
  MetadataResponse,
  ForecastDeskResponse,
  AccuracyHubResponse,
  ForecastEvolutionResponse,
  ProcurementScenarioRequest,
  ProcurementScenarioResponse
} from '../types/api';

const RAW_BASE_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // Use fallback status text
    }
    throw new ApiError(errMsg, res.status);
  }
  return res.json();
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/api/health`);
  return handleResponse<HealthResponse>(res);
}

export async function fetchMetadata(): Promise<MetadataResponse> {
  const res = await fetch(`${BASE_URL}/api/metadata`);
  return handleResponse<MetadataResponse>(res);
}

export async function fetchForecast(
  deliveryDate: string = '2026-01-15',
  cutoffRule: string = 'DA_AUCTION_1100'
): Promise<ForecastDeskResponse> {
  const params = new URLSearchParams({
    delivery_date: deliveryDate,
    cutoff_rule: cutoffRule
  });
  const res = await fetch(`${BASE_URL}/api/forecast?${params.toString()}`);
  return handleResponse<ForecastDeskResponse>(res);
}

export async function fetchAccuracy(
  cutoffRule: string = 'DA_AUCTION_1100'
): Promise<AccuracyHubResponse> {
  const params = new URLSearchParams({ cutoff_rule: cutoffRule });
  const res = await fetch(`${BASE_URL}/api/accuracy?${params.toString()}`);
  return handleResponse<AccuracyHubResponse>(res);
}

export async function fetchForecastEvolution(
  deliveryDate: string = '2026-01-15',
  cutoffRule: string = 'DA_AUCTION_1100',
  periods: string = '16,24,36,44'
): Promise<ForecastEvolutionResponse> {
  const params = new URLSearchParams({
    delivery_date: deliveryDate,
    cutoff_rule: cutoffRule,
    periods: periods
  });
  const res = await fetch(`${BASE_URL}/api/forecast-evolution?${params.toString()}`);
  return handleResponse<ForecastEvolutionResponse>(res);
}

export async function simulateProcurement(
  payload: ProcurementScenarioRequest
): Promise<ProcurementScenarioResponse> {
  const res = await fetch(`${BASE_URL}/api/procurement/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<ProcurementScenarioResponse>(res);
}
