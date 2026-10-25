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
import { GitBranch, Clock } from 'lucide-react';

interface ForecastEvolutionChartProps {
  evolution: DeliveryPeriodEvolution[];
  deliveryDate: string;
}

export const ForecastEvolutionChart: React.FC<ForecastEvolutionChartProps> = ({
  evolution,
  deliveryDate
}) => {
  const [selectedSP, setSelectedSP] = useState<number>(
    evolution.length > 0 ? evolution[0].settlementPeriod : 36
  );

  const activePeriod = evolution.find((e) => e.settlementPeriod === selectedSP) || evolution[0];

  if (!activePeriod) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl text-center text-slate-400 text-xs">
        No forecast vintage evolution data available for this date.
      </div>
    );
  }

  // Sort vintages by lead time descending (earliest publication 48h ahead to latest 1h ahead)
  const chartData = [...activePeriod.vintages]
    .sort((a, b) => b.leadTimeHours - a.leadTimeHours)
    .map((v) => ({
      leadTime: v.leadTimeHours,
      leadTimeLabel: `${v.leadTimeHours}h Ahead`,
      forecast: v.generation,
      actual: activePeriod.actualMW,
      publishTime: v.publishTime,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 min-w-[200px]">
          <div className="border-b border-slate-800 pb-1 font-semibold text-white flex justify-between">
            <span>{data.leadTimeLabel}</span>
            <span className="text-slate-400 font-mono">
              {new Date(data.publishTime).toUTCString().replace('GMT', 'UTC').substring(17, 22)} UTC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400 font-medium">Vintage Forecast:</span>
            <span className="font-mono text-white font-bold">{data.forecast.toLocaleString('en-GB')} MW</span>
          </div>
          {data.actual !== null && (
            <div className="flex justify-between border-t border-slate-800 pt-1">
              <span className="text-emerald-400 font-medium">Actual Outturn:</span>
              <span className="font-mono text-white">{data.actual.toLocaleString('en-GB')} MW</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
      {/* Header and SP Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>Forecast Vintage Evolution (Lead-Time Convergence)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Observing how National Grid ESO rolling wind forecasts evolved leading into delivery.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {evolution.map((e) => {
            const timeLabel = e.startTime.split('T')[1].substring(0, 5);
            const isSelected = selectedSP === e.settlementPeriod;
            return (
              <button
                key={e.settlementPeriod}
                onClick={() => setSelectedSP(e.settlementPeriod)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SP {e.settlementPeriod} ({timeLabel})
              </button>
            );
          })}
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="leadTime"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `${val}h`}
              reversed={true} // Left: 48h ahead -> Right: 1h ahead (chronological toward delivery)
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit=" MW"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            {activePeriod.actualMW !== null && (
              <ReferenceLine
                y={activePeriod.actualMW}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Actual Outturn: ${activePeriod.actualMW.toLocaleString('en-GB')} MW`,
                  fill: '#10b981',
                  fontSize: 11,
                  position: 'insideBottomRight'
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="forecast"
              name="Rolling Forecast Vintage (MW)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span>X-Axis: Lead time prior to settlement start (48h ahead &rarr; 1h Gate Closure)</span>
        <span className="font-mono text-cyan-300">
          {activePeriod.vintages.length} historical publication vintages captured
        </span>
      </div>
    </div>
  );
};
