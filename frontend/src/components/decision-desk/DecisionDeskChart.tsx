import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { SettlementPoint } from '../../types/api';
import { Layers, Activity } from 'lucide-react';

interface DecisionDeskChartProps {
  intervals: SettlementPoint[];
  deliveryDate: string;
  cutoffTime: string;
}

export const DecisionDeskChart: React.FC<DecisionDeskChartProps> = ({
  intervals,
  deliveryDate,
  cutoffTime
}) => {
  const [viewMode, setViewMode] = useState<'generation' | 'error'>('generation');

  const chartData = intervals.map((i) => {
    const timeLabel = i.startTime.split('T')[1].substring(0, 5);
    return {
      period: i.settlementPeriod,
      time: timeLabel,
      fullStartTime: i.startTime,
      fullEndTime: i.endTime,
      forecast: i.forecastGeneration,
      actual: i.actualGeneration,
      error: i.forecastError,
      publishTime: i.publishTime,
      isAvailable: i.forecastAvailableByCutoff,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOver = (data.error ?? 0) > 0;
      return (
        <div className="bg-[#0b1324] border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-semibold text-slate-100">
            <span>SP {data.period} &bull; {data.time} UTC</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              data.isAvailable ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400'
            }`}>
              {data.isAvailable ? 'Valid Vintage' : 'No Vintage'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-sky-400 font-medium">Day-Ahead Forecast:</span>
            <span className="font-mono text-slate-100 font-semibold">
              {data.forecast !== null ? `${Math.round(data.forecast).toLocaleString('en-GB')} MW` : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Actual Outturn:</span>
            <span className="font-mono text-slate-100 font-semibold">
              {data.actual !== null ? `${Math.round(data.actual).toLocaleString('en-GB')} MW` : 'Missing'}
            </span>
          </div>

          {data.error !== null && (
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
              <span className="text-slate-400 font-medium">Forecast Error (F − A):</span>
              <span className={`font-mono font-bold ${
                isOver ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {isOver ? `+${data.error.toLocaleString('en-GB')}` : data.error.toLocaleString('en-GB')} MW
              </span>
            </div>
          )}

          {data.publishTime && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
              Vintage Published: {data.publishTime.replace('T', ' ').replace('Z', ' UTC')}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-3">
      {/* Header and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Half-Hourly Wind Generation Profile</span>
            <span className="text-xs text-slate-400 font-normal">| 48 Settlement Periods (Day D)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates the selected Day-Ahead forecast available at the procurement cutoff against actual outturn.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#0b1324] p-1 rounded-md border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('generation')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'generation'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Generation (MW)
          </button>
          <button
            onClick={() => setViewMode('error')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'error'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Signed Gap (F − A)
          </button>
        </div>
      </div>

      {/* Main Centerpiece Chart (Increased Usable Height) */}
      <div className="h-[460px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'generation' ? (
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={3}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
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
              <Line
                type="monotone"
                dataKey="forecast"
                name="Day-Ahead Forecast at Cutoff (MW)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#38bdf8' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Wind Outturn (MW)"
                stroke="#34d399"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4, fill: '#34d399' }}
                connectNulls={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={3}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit=" MW"
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              <Bar
                dataKey="error"
                name="Forecast Error (F − A) MW"
                shape={(props: any) => {
                  const { x, y, width, height } = props;
                  const isPositive = props.payload.error >= 0;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isPositive ? '#fbbf24' : '#22d3ee'}
                      rx={1.5}
                    />
                  );
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Clean Bottom Legend / Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
            <span className="text-slate-300">Selected Forecast (WINDFOR)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span>
            <span className="text-slate-300">Actual Outturn (FUELHH)</span>
          </span>
          {viewMode === 'error' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                <span>Over-forecast (Short Imbalance Risk)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
                <span>Under-forecast (Long Imbalance Risk)</span>
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-slate-400 text-[11px]">
          Timezone: UTC &bull; 30-min settlement intervals
        </span>
      </div>
    </div>
  );
};
