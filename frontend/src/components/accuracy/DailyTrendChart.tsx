import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { DailyAccuracyStat } from '../../types/api';

interface DailyTrendChartProps {
  trends: DailyAccuracyStat[];
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ trends }) => {
  const chartData = trends.map((t) => {
    const day = t.settlementDate.split('-')[2];
    return {
      date: t.settlementDate,
      dayLabel: `Jan ${day}`,
      actualGWh: Math.round(t.actualMWh / 1000),
      forecastGWh: Math.round(t.forecastMWh / 1000),
      mae: t.maeMW,
      rmse: t.rmseMW,
      bias: t.meanBiasMW,
      wape: t.wapePercent,
      coverage: t.coveragePercent,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="border-b border-slate-800 pb-1 font-semibold text-white flex justify-between">
            <span>{data.date}</span>
            <span className="text-slate-400 font-mono">{data.coverage}% Coverage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-400 font-medium">Actual Energy:</span>
            <span className="font-mono text-white">{data.actualGWh.toLocaleString('en-GB')} GWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400 font-medium">Forecast Energy:</span>
            <span className="font-mono text-white">{data.forecastGWh.toLocaleString('en-GB')} GWh</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1">
            <span className="text-amber-400 font-medium">Daily MAE:</span>
            <span className="font-mono font-bold text-white">{data.mae.toLocaleString('en-GB')} MW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Daily WAPE:</span>
            <span className="font-mono text-slate-200">{data.wape !== null ? `${data.wape}%` : '—'}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>January 2026 Daily Error & Generation Trends</span>
          <span className="text-xs text-slate-400 font-normal">| 31 Days Chronological</span>
        </h3>
        <p className="text-xs text-slate-400">
          Tracking daily wind energy outturn (GWh) against daily forecast error magnitude (MAE in MW).
        </p>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="dayLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              interval={2}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit=" GWh"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              tick={{ fill: '#f59e0b', fontSize: 11 }}
              unit=" MW"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Bar
              yAxisId="left"
              dataKey="actualGWh"
              name="Actual Wind Outturn (GWh)"
              fill="#10b981"
              opacity={0.6}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="mae"
              name="Daily MAE (MW)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#f59e0b' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
