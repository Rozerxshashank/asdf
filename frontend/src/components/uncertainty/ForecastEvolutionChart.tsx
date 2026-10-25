import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { DeliveryPeriodEvolution } from '../../types/api';
import { GitBranch, ShieldAlert, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface ForecastEvolutionChartProps {
  evolution: DeliveryPeriodEvolution[];
  deliveryDate: string;
  cutoffDescription?: string;
}

export const ForecastEvolutionChart: React.FC<ForecastEvolutionChartProps> = ({
  evolution,
  deliveryDate,
  cutoffDescription = 'Day-Ahead Auction Gate (11:00 UTC D-1)'
}) => {
  const [selectedSP, setSelectedSP] = useState<number>(
    evolution.length > 0 ? evolution[0].settlementPeriod : 16
  );
  const [filterMode, setFilterMode] = useState<'all' | 'pre_only'>('all');

  const activePeriod = evolution.find((e) => e.settlementPeriod === selectedSP) || evolution[0];

  if (!activePeriod) {
    return (
      <div className="bg-[#111827]/90 border border-slate-800 p-6 rounded-lg text-center text-slate-400 text-xs">
        No forecast vintage evolution data available for this date.
      </div>
    );
  }

  // Sort vintages by lead time descending (e.g. 48h ahead -> 1h ahead)
  const sortedVintages = [...activePeriod.vintages].sort((a, b) => b.leadTimeHours - a.leadTimeHours);

  const chartData = sortedVintages
    .filter((v) => {
      if (filterMode === 'pre_only') {
        return v.isAvailableAtCutoff;
      }
      return true;
    })
    .map((v) => ({
      leadTime: v.leadTimeHours,
      leadTimeLabel: `${v.leadTimeHours}h Ahead`,
      forecast: v.generation,
      preCutoffForecast: v.isAvailableAtCutoff ? v.generation : null,
      postCutoffForecast: !v.isAvailableAtCutoff ? v.generation : null,
      isPreCutoff: v.isAvailableAtCutoff,
      actual: activePeriod.actualMW,
      publishTime: v.publishTime,
      category: v.vintageCategory || (v.isAvailableAtCutoff ? 'PRE_CUTOFF_DECISION' : 'POST_CUTOFF_REVISION')
    }));

  const preCutoffCount = activePeriod.vintages.filter((v) => v.isAvailableAtCutoff).length;
  const postCutoffCount = activePeriod.vintages.length - preCutoffCount;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0b1324] border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[230px]">
          <div className="border-b border-slate-800 pb-1 font-semibold text-slate-100 flex items-center justify-between">
            <span>{data.leadTimeLabel}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              data.isPreCutoff
                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
            }`}>
              {data.isPreCutoff ? 'Available at Cutoff' : 'Post-Cutoff Revision'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Vintage Forecast:</span>
            <span className="font-mono text-slate-100 font-bold">
              {Math.round(data.forecast).toLocaleString('en-GB')} MW
            </span>
          </div>

          {data.actual !== null && (
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-medium">Actual Outturn:</span>
              <span className="font-mono text-slate-100">
                {Math.round(data.actual).toLocaleString('en-GB')} MW
              </span>
            </div>
          )}

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
            Published: {data.publishTime.replace('T', ' ').replace('Z', ' UTC')}
          </div>
          {!data.isPreCutoff && (
            <div className="text-[10px] text-amber-400/90 font-sans italic">
              * Published after auction gate — not available at decision time
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-3">
      {/* Header, SP Selector, and Pre/Post Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>Forecast Vintage Progression & Lead-Time Convergence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares rolling forecasts across lead times against actual outturn, separating pre-decision forecasts from retrospective revisions.
          </p>
        </div>

        {/* View Mode Toggle: Pre-Cutoff vs All */}
        <div className="flex items-center gap-1 bg-[#0b101d] p-0.5 rounded-md border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Retrospective History
          </button>
          <button
            onClick={() => setFilterMode('pre_only')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterMode === 'pre_only'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-Cutoff Reality Only
          </button>
        </div>
      </div>

      {/* Target Settlement Period Pills & Active Decision Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0d1424] p-2 rounded-md border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Inspect Settlement Period:</span>
          {evolution.map((e) => {
            const timeLabel = e.startTime.split('T')[1].substring(0, 5);
            const isSelected = selectedSP === e.settlementPeriod;
            return (
              <button
                key={e.settlementPeriod}
                onClick={() => setSelectedSP(e.settlementPeriod)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                SP {e.settlementPeriod} ({timeLabel} UTC)
              </button>
            );
          })}
        </div>

        {/* Decision Forecast Info */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Decision Forecast:</span>
          <span className="text-sky-300 font-semibold">
            {activePeriod.decisionForecastMW !== null && activePeriod.decisionForecastMW !== undefined
              ? `${Math.round(activePeriod.decisionForecastMW).toLocaleString('en-GB')} MW`
              : '—'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">
            Actual: {activePeriod.actualMW !== null ? `${Math.round(activePeriod.actualMW).toLocaleString('en-GB')} MW` : '—'}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[400px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="leadTime"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `${val}h`}
              reversed={true} // 48h -> 1h ahead (chronological)
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit=" MW"
              domain={['auto', 'auto']}
              tickLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            {activePeriod.actualMW !== null && (
              <ReferenceLine
                y={activePeriod.actualMW}
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Actual Outturn: ${Math.round(activePeriod.actualMW).toLocaleString('en-GB')} MW`,
                  fill: '#34d399',
                  fontSize: 11,
                  position: 'insideBottomRight'
                }}
              />
            )}
            {/* Pre-Cutoff Vintages: Solid sky blue line */}
            <Line
              type="monotone"
              dataKey="preCutoffForecast"
              name="Pre-Cutoff Forecast (Available at Decision Gate)"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#38bdf8' }}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
            {/* Post-Cutoff Revisions: Dashed amber line */}
            {filterMode === 'all' && (
              <Line
                type="monotone"
                dataKey="postCutoffForecast"
                name="Post-Cutoff Revisions (Retrospective Updates)"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: '#fbbf24' }}
                activeDot={{ r: 5 }}
                connectNulls={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Critical Anti-Lookahead Trading Warning Box */}
      <div className="bg-[#0b101d] border border-amber-900/40 p-2.5 rounded-md flex items-start gap-2 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed text-slate-300">
          <strong className="text-amber-300 font-medium">Trading Desk Protocol:</strong> Vintages marked in amber (dashed) were published after the day-ahead auction cutoff ({cutoffDescription}). In wholesale procurement, contracts are locked at auction closure. Retrospective model improvements published afterwards reflect weather model updates, but were <strong className="text-amber-200">never available at decision time</strong>.
        </div>
      </div>
    </div>
  );
};
