import React, { useState, useEffect } from 'react';
import { Navbar, TabId } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StatusBanner } from './components/layout/StatusBanner';

// Decision Desk Components
import { DateSelector } from './components/decision-desk/DateSelector';
import { CutoffSelector } from './components/decision-desk/CutoffSelector';
import { KPISummaryCards } from './components/decision-desk/KPISummaryCards';
import { DecisionDeskChart } from './components/decision-desk/DecisionDeskChart';
import { SettlementTable } from './components/decision-desk/SettlementTable';

// Accuracy Hub Components
import { MetricCards } from './components/accuracy/MetricCards';
import { SettlementProfileChart } from './components/accuracy/SettlementProfileChart';
import { DailyTrendChart } from './components/accuracy/DailyTrendChart';
import { LargestMissesTable } from './components/accuracy/LargestMissesTable';

// Uncertainty Components
import { ForecastEvolutionChart } from './components/uncertainty/ForecastEvolutionChart';
import { ErrorDistributionChart } from './components/uncertainty/ErrorDistributionChart';
import { MethodologyCaveat } from './components/uncertainty/MethodologyCaveat';

// Simulator Components
import { ScenarioControls } from './components/simulator/ScenarioControls';
import { ResidualChart } from './components/simulator/ResidualChart';
import { DisclaimerBox } from './components/simulator/DisclaimerBox';

// Tech Guide
import { ArchitectureReview } from './components/tech-guide/ArchitectureReview';

// API Services & Types
import {
  fetchHealth,
  fetchForecast,
  fetchAccuracy,
  fetchForecastEvolution,
  simulateProcurement
} from './services/api';
import {
  HealthResponse,
  ForecastDeskResponse,
  AccuracyHubResponse,
  ForecastEvolutionResponse,
  ProcurementScenarioRequest,
  ProcurementScenarioResponse
} from './types/api';
import { RefreshCw, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('desk');
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [cutoffRule, setCutoffRule] = useState<string>('DA_AUCTION_1100');

  // API State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDeskResponse | null>(null);
  const [accuracyData, setAccuracyData] = useState<AccuracyHubResponse | null>(null);
  const [evolutionData, setEvolutionData] = useState<ForecastEvolutionResponse | null>(null);

  // Scenario state
  const [scenarioReq, setScenarioReq] = useState<ProcurementScenarioRequest>({
    deliveryDate: '2026-01-15',
    assumedDemandMW: 32000,
    assumedNonWindMW: 14000,
    reserveMarginMW: 2000,
  });
  const [scenarioRes, setScenarioRes] = useState<ProcurementScenarioResponse | null>(null);

  // Loading & Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [scenarioLoading, setScenarioLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load: Health
  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health check warning:', err));
  }, []);

  // Fetch Forecast data whenever date or cutoff changes
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchForecast(selectedDate, cutoffRule)
      .then((data) => {
        if (!ignore) {
          setForecastData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to fetch Day-Ahead forecast data');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [selectedDate, cutoffRule]);

  // Lazy-load Accuracy data when tab is opened or cutoff changes
  useEffect(() => {
    let ignore = false;
    if (activeTab === 'accuracy' && (!accuracyData || accuracyData.cutoffRule !== cutoffRule)) {
      setLoading(true);
      fetchAccuracy(cutoffRule)
        .then((data) => {
          if (!ignore) {
            setAccuracyData(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err.message || 'Failed to fetch accuracy evaluation');
            setLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, cutoffRule]);

  // Lazy-load Evolution data when tab is opened, date changes, or cutoff changes
  useEffect(() => {
    let ignore = false;
    if (activeTab === 'uncertainty') {
      fetchForecastEvolution(selectedDate, cutoffRule, '16,24,36,44')
        .then((data) => {
          if (!ignore) {
            setEvolutionData(data);
          }
        })
        .catch((err) => console.warn('Evolution fetch warning:', err));

      if (!accuracyData) {
        fetchAccuracy(cutoffRule)
          .then((data) => {
            if (!ignore) {
              setAccuracyData(data);
            }
          })
          .catch(console.warn);
      }
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, selectedDate, cutoffRule]);

  // Run scenario simulation
  const handleRunScenario = () => {
    setScenarioLoading(true);
    simulateProcurement({ ...scenarioReq, cutoffTime: cutoffRule })
      .then((res) => {
        setScenarioRes(res);
        setScenarioLoading(false);
      })
      .catch((err) => {
        console.error('Scenario simulation failed:', err);
        setScenarioLoading(false);
      });
  };

  // Run initial scenario when tab is opened if not already loaded
  useEffect(() => {
    if (activeTab === 'simulator' && !scenarioRes) {
      handleRunScenario();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Compact Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        health={health}
        loading={loading}
      />

      {/* Discreet Data Integrity Banner */}
      <StatusBanner
        health={health}
        cutoffDescription={forecastData?.cutoffDescription}
        matchedRecords={forecastData?.summary.matchedRecords}
        totalExpected={forecastData?.summary.totalExpectedRecords}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchForecast(selectedDate, cutoffRule).then(setForecastData).catch(console.error);
              }}
              className="px-3 py-1 bg-rose-900 hover:bg-rose-800 rounded font-semibold text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: DAY-AHEAD DECISION DESK */}
        {activeTab === 'desk' && (
          <div className="space-y-4">
            {/* Unified Compact Control Bar */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <div className="lg:col-span-5">
                  <DateSelector
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                </div>
                <div className="lg:col-span-7">
                  <CutoffSelector
                    cutoffRule={cutoffRule}
                    onCutoffChange={setCutoffRule}
                    cutoffTime={forecastData?.cutoffTime || ''}
                    cutoffDescription={forecastData?.cutoffDescription || ''}
                  />
                </div>
              </div>

              {/* Status & Timing Metadata Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#111827]/70 border border-slate-800 rounded-md text-xs font-mono">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-sans">Market Timezone:</span>
                    <span className="text-slate-200 font-semibold">UTC</span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-sans">Selected Vintage Publication:</span>
                    <span className="text-sky-300">
                      {forecastData?.intervals[0]?.publishTime
                        ? forecastData.intervals[0].publishTime.replace('T', ' ').replace('Z', ' UTC')
                        : 'Aligned before cutoff'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium ${
                    forecastData?.intervals.every(i => i.forecastAvailableByCutoff)
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                      : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      forecastData?.intervals.every(i => i.forecastAvailableByCutoff) ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}></span>
                    {forecastData?.intervals.every(i => i.forecastAvailableByCutoff)
                      ? 'Forecast available before cutoff'
                      : 'Forecast unavailable at cutoff'}
                  </span>
                </div>
              </div>
            </div>

            {loading && !forecastData ? (
              <div className="bg-[#111827]/60 border border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Aligning Elexon WINDFOR and FUELHH streams...</span>
              </div>
            ) : forecastData ? (
              <>
                {/* 4 Compact KPI Summaries */}
                <KPISummaryCards summary={forecastData.summary} />

                {/* Main 48-Period Centerpiece Chart */}
                <DecisionDeskChart
                  intervals={forecastData.intervals}
                  deliveryDate={selectedDate}
                  cutoffTime={forecastData.cutoffTime}
                />

                {/* Half-Hourly Settlement Table */}
                <SettlementTable intervals={forecastData.intervals} />
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: QUANTIFIED ACCURACY HUB */}
        {activeTab === 'accuracy' && (
          <div className="space-y-4">
            {/* Cutoff Selector */}
            <CutoffSelector
              cutoffRule={cutoffRule}
              onCutoffChange={setCutoffRule}
              cutoffTime={accuracyData ? 'Full Month Window (Jan 2026)' : ''}
              cutoffDescription={accuracyData?.cutoffDescription || ''}
            />

            {loading && !accuracyData ? (
              <div className="bg-[#111827]/60 border border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Calculating monthly accuracy metrics and error profiles...</span>
              </div>
            ) : accuracyData ? (
              <>
                {/* 5 Core Metric Cards with Predictive R2 vs Pearson r2 */}
                <MetricCards metrics={accuracyData.overallMetrics} />

                {/* Diurnal Error Profile (HH 1 - 48) */}
                <SettlementProfileChart profile={accuracyData.settlementPeriodProfile} />

                {/* Chronological Daily Trend Chart */}
                <DailyTrendChart trends={accuracyData.dailyTrends} />

                {/* Largest Over/Under Forecast Misses */}
                <LargestMissesTable largestMisses={accuracyData.largestMisses} />
              </>
            ) : null}
          </div>
        )}

        {/* TAB 3: FORECAST EVOLUTION */}
        {activeTab === 'uncertainty' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
              <div className="lg:col-span-5">
                <DateSelector
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>
              <div className="lg:col-span-7">
                <CutoffSelector
                  cutoffRule={cutoffRule}
                  onCutoffChange={setCutoffRule}
                  cutoffTime={forecastData?.cutoffTime || ''}
                  cutoffDescription={forecastData?.cutoffDescription || ''}
                />
              </div>
            </div>

            {evolutionData && (
              <ForecastEvolutionChart
                evolution={evolutionData.deliveryPeriodEvolution}
                deliveryDate={selectedDate}
                cutoffDescription={evolutionData.cutoffDescription || forecastData?.cutoffDescription}
              />
            )}

            {accuracyData && (
              <ErrorDistributionChart
                distribution={accuracyData.errorDistribution}
              />
            )}

            {/* Methodology Limitations Caveat */}
            <MethodologyCaveat />
          </div>
        )}

        {/* TAB 4: PROCUREMENT SCENARIO SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <ScenarioControls
              request={scenarioReq}
              onChange={setScenarioReq}
              onSimulate={handleRunScenario}
              loading={scenarioLoading}
            />

            {scenarioRes && (
              <ResidualChart scenario={scenarioRes} />
            )}

            <DisclaimerBox
              disclaimer={
                scenarioRes?.disclaimer ||
                'This simulation computes hypothetical net residual requirements based strictly on user scenario assumptions.'
              }
            />
          </div>
        )}

        {/* TAB 5: ARCHITECTURE REVIEW */}
        {activeTab === 'tech' && (
          <div>
            <ArchitectureReview />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default App;
