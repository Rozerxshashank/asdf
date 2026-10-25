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
import { RefreshCw, AlertCircle } from 'lucide-react';

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

  // Initial load: Health and Data
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

  // Lazy-load Accuracy data when tab is opened
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

  // Lazy-load Evolution data when tab is opened or date changes
  useEffect(() => {
    let ignore = false;
    if (activeTab === 'uncertainty') {
      fetchForecastEvolution(selectedDate, '16,24,36,44')
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        health={health}
        loading={loading}
      />

      {/* Status & Freshness Banner */}
      <StatusBanner
        health={health}
        cutoffDescription={forecastData?.cutoffDescription}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
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
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Control Bar: Date Selector & Cutoff Gate */}
            <div className="space-y-3">
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              <CutoffSelector
                cutoffRule={cutoffRule}
                onCutoffChange={setCutoffRule}
                cutoffTime={forecastData?.cutoffTime || ''}
                cutoffDescription={forecastData?.cutoffDescription || ''}
              />
            </div>

            {loading && !forecastData ? (
              <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Aligning Elexon WINDFOR and FUELHH streams...</span>
              </div>
            ) : forecastData ? (
              <>
                {/* KPI Summary Cards */}
                <KPISummaryCards summary={forecastData.summary} />

                {/* Main 48-Period Chart */}
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
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Cutoff context selector */}
            <CutoffSelector
              cutoffRule={cutoffRule}
              onCutoffChange={setCutoffRule}
              cutoffTime={accuracyData ? 'Full Month Window' : ''}
              cutoffDescription={accuracyData?.cutoffDescription || ''}
            />

            {loading && !accuracyData ? (
              <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Calculating monthly accuracy metrics and error profiles...</span>
              </div>
            ) : accuracyData ? (
              <>
                {/* 5 Core Metric Cards */}
                <MetricCards metrics={accuracyData.overallMetrics} />

                {/* Settlement Period Error Profile (HH 1 - 48) */}
                <SettlementProfileChart profile={accuracyData.settlementPeriodProfile} />

                {/* Daily Chronological Trends */}
                <DailyTrendChart trends={accuracyData.dailyTrends} />

                {/* Top 5 Over/Under Forecast Misses */}
                <LargestMissesTable largestMisses={accuracyData.largestMisses} />
              </>
            ) : null}
          </div>
        )}

        {/* TAB 3: FORECAST UNCERTAINTY & EVOLUTION */}
        {activeTab === 'uncertainty' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Target Date Picker */}
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {evolutionData && (
              <ForecastEvolutionChart
                evolution={evolutionData.deliveryPeriodEvolution}
                deliveryDate={selectedDate}
              />
            )}

            {accuracyData && (
              <ErrorDistributionChart
                distribution={accuracyData.errorDistribution}
              />
            )}

            {/* Transparent Methodology Limitations Caveat */}
            <MethodologyCaveat />
          </div>
        )}

        {/* TAB 4: CONDITIONAL PROCUREMENT SCENARIO SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Scenario Sliders */}
            <ScenarioControls
              request={scenarioReq}
              onChange={setScenarioReq}
              onSimulate={handleRunScenario}
              loading={scenarioLoading}
            />

            {scenarioRes && (
              <ResidualChart scenario={scenarioRes} />
            )}

            {/* Mandatory Scenario Limitations Disclaimer */}
            <DisclaimerBox
              disclaimer={
                scenarioRes?.disclaimer ||
                'This simulation computes hypothetical net residual requirements based strictly on user assumptions.'
              }
            />
          </div>
        )}

        {/* TAB 5: TECHNICAL ARCHITECTURE & REVIEW GUIDE */}
        {activeTab === 'tech' && (
          <div className="animate-in fade-in duration-200">
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
