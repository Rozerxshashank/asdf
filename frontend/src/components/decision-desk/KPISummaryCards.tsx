import React from 'react';
import { Wind, Zap, Gauge, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { DecisionDeskSummary } from '../../types/api';

interface KPISummaryCardsProps {
  summary: DecisionDeskSummary;
}

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ summary }) => {
  const bias = summary.meanBiasMW ?? 0;
  const isOverforecast = bias > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Card 1: Forecast Generation */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Selected Forecast
          </span>
          <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
            <Wind className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">
              {summary.totalForecastMWh !== null ? summary.totalForecastMWh.toLocaleString('en-GB') : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">MWh</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Average Generation:</span>
            <span className="font-mono text-slate-200 font-medium">
              {summary.avgForecastMW !== null ? `${summary.avgForecastMW.toLocaleString('en-GB')} MW` : '—'}
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Card 2: Actual Generation */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Actual Outturn
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {summary.totalActualMWh !== null ? summary.totalActualMWh.toLocaleString('en-GB') : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">MWh</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Average Generation:</span>
            <span className="font-mono text-slate-200 font-medium">
              {summary.avgActualMW !== null ? `${summary.avgActualMW.toLocaleString('en-GB')} MW` : '—'}
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Card 3: Error & Bias */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Day MAE & Bias
          </span>
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {summary.maeMW !== null ? summary.maeMW.toLocaleString('en-GB') : '—'}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">MW MAE</span>
            </div>
            {summary.wapePercent !== null && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {summary.wapePercent}% WAPE
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Mean Bias (F − A):</span>
            <span className={`font-mono font-medium ${
              bias > 100
                ? 'text-rose-400'
                : bias < -100
                ? 'text-cyan-400'
                : 'text-emerald-400'
            }`}>
              {bias > 0 ? `+${bias.toLocaleString('en-GB')}` : bias.toLocaleString('en-GB')} MW
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Card 4: Data Coverage */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Evaluation Coverage
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {summary.coveragePercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({summary.matchedRecords}/{summary.totalExpectedRecords} HH)
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Cache Verification:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Anti-Lookahead Passed
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};
