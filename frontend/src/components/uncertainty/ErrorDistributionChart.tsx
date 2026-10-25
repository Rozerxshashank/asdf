import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { DistributionBin } from '../../types/api';

interface ErrorDistributionChartProps {
  distribution: {
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
}

export const ErrorDistributionChart: React.FC<ErrorDistributionChartProps> = ({
  distribution
}) => {
  const chartData = distribution.bins.map((b) => ({
    range: `${b.binStart} to ${b.binEnd}`,
    midpoint: Math.round((b.binStart + b.binEnd) / 2),
    count: b.count,
    frequency: b.frequencyPercent,
  }));

  const { p10, p50, p90 } = distribution.quantiles;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
          <div className="border-b border-slate-800 pb-1 font-semibold text-white">
            Error Range: {data.range} MW
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Intervals:</span>
            <span className="font-mono text-white font-bold">{data.count}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-cyan-400">Frequency:</span>
            <span className="font-mono text-cyan-300 font-bold">{data.frequency}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Forecast Error Distribution & Empirical Quantiles</span>
            <span className="text-xs text-slate-400 font-normal">
              | N = {distribution.sampleCount.toLocaleString('en-GB')} HH Periods
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Empirical frequency distribution of signed forecast error (F − A) in MW.
          </p>
        </div>

        {/* Quantile Pill Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            P10: {p10 > 0 ? `+${p10}` : p10} MW
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
            P50: {p50 > 0 ? `+${p50}` : p50} MW
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800/60 text-amber-400">
            P90: {p90 > 0 ? `+${p90}` : p90} MW
          </span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="midpoint"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit=" MW"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
            <Bar
              dataKey="frequency"
              name="Frequency (%)"
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 gap-1">
        <span>Negative errors (&lt; 0 MW) = Under-forecast &bull; Positive errors (&gt; 0 MW) = Over-forecast</span>
        <span className="text-slate-400">Linear quantile interpolation</span>
      </div>
    </div>
  );
};
