import React from 'react';
import { Wind, Zap, Gauge, CheckCircle2 } from 'lucide-react';
import { DecisionDeskSummary } from '../../types/api';

interface KPISummaryCardsProps {
  summary: DecisionDeskSummary;
}

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ summary }) => {
  const bias = summary.meanBiasMW ?? 0;
  const isOverforecast = bias > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Forecast Generation */}
      <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Selected Forecast</span>
          <Wind className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {summary.totalForecastMWh !== null ? summary.totalForecastMWh.toLocaleString('en-GB') : '—'}
            </span>
            <span className="text-xs text-slate-400 font-mono">MWh</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
            <span>Average Generation:</span>
            <span className="font-mono text-slate-300 font-medium">
              {summary.avgForecastMW !== null ? `${summary.avgForecastMW.toLocaleString('en-GB')} MW` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Actual Generation */}
      <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Actual Outturn</span>
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {summary.totalActualMWh !== null ? summary.totalActualMWh.toLocaleString('en-GB') : '—'}
            </span>
            <span className="text-xs text-slate-400 font-mono">MWh</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
            <span>Average Generation:</span>
            <span className="font-mono text-slate-300 font-medium">
              {summary.avgActualMW !== null ? `${summary.avgActualMW.toLocaleString('en-GB')} MW` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAE & Bias */}
      <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Day MAE & Bias</span>
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {summary.maeMW !== null ? summary.maeMW.toLocaleString('en-GB') : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">MW MAE</span>
            </div>
            {summary.wapePercent !== null && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {summary.wapePercent}% WAPE
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
            <span>Mean Bias (F − A):</span>
            <span className={`font-mono font-medium ${
              isOverforecast ? 'text-amber-400' : bias < 0 ? 'text-cyan-400' : 'text-emerald-400'
            }`}>
              {bias > 0 ? `+${bias.toLocaleString('en-GB')}` : bias.toLocaleString('en-GB')} MW
            </span>
          </div>
        </div>
      </div>

      {/* 4. Coverage */}
      <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Evaluation Coverage</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {summary.coveragePercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({summary.matchedRecords}/{summary.totalExpectedRecords} SP)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
            <span>Historical Alignment:</span>
            <span className="text-slate-300 font-medium">Hourly block match</span>
          </div>
        </div>
      </div>
    </div>
  );
};
