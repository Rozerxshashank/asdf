import React from 'react';
import { Target, Gauge, TrendingUp, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { OverallMetrics } from '../../types/api';

interface MetricCardsProps {
  metrics: OverallMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const isOverforecast = metrics.meanBiasMW > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. MAE */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Mean Absolute Error
          </span>
          <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white">
            {metrics.maeMW.toLocaleString('en-GB')}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Average magnitude of forecast error across all 1,488 settlement periods.
        </p>
      </div>

      {/* 2. RMSE */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Root Mean Squared Error
          </span>
          <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400">
            <Gauge className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-purple-300">
            {metrics.rmseMW.toLocaleString('en-GB')}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Penalizes large forecast spikes heavily (critical for reserve planning).
        </p>
      </div>

      {/* 3. Mean Bias Error */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Mean Bias Error
          </span>
          <div className={`p-1.5 rounded-lg border text-xs ${
            isOverforecast
              ? 'bg-amber-950/80 border-amber-800/60 text-amber-400'
              : 'bg-cyan-950/80 border-cyan-800/60 text-cyan-400'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono ${
            isOverforecast ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            {metrics.meanBiasMW > 0 ? `+${metrics.meanBiasMW}` : metrics.meanBiasMW}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {isOverforecast ? 'Over-forecasting (Short in Balancing Mechanism)' : 'Under-forecasting (Spill / Long)'}
        </p>
      </div>

      {/* 4. WAPE */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Weighted Error (WAPE)
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.wapePercent !== null ? `${metrics.wapePercent}%` : 'N/A'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          &Sigma;|F - A| / &Sigma;A. Used over MAPE to avoid zero-division explosion.
        </p>
      </div>

      {/* 5. Evaluation Coverage & Sample */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Evaluation Coverage
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-cyan-300">
            {metrics.coveragePercent}%
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({metrics.matchedRecords}/{metrics.sampleSize})
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          R&sup2; Correlation: <strong className="text-white font-mono">{metrics.correlationR2 ?? '—'}</strong>
        </p>
      </div>
    </div>
  );
};
