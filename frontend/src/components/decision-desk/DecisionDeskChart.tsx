import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { Info, Layers } from 'lucide-react';

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
      forecast: i.forecastGeneration,
      actual: i.actualGeneration,
      error: i.forecastError,
      publishTime: i.publishTime,
      isAvailable: i.forecastAvailableByCutoff,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOver = (data.error ?? 0) > 0;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-semibold">
            <span className="text-white">SP {data.period} &bull; {data.time} UTC</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
              data.isAvailable ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950 text-rose-400'
            }`}>
              {data.isAvailable ? 'Valid Vintage' : 'No Vintage'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-medium">Forecast (Cutoff):</span>
            <span className="font-mono text-white font-semibold">
              {data.forecast !== null ? `${data.forecast.toLocaleString('en-GB')} MW` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Actual Outturn:</span>
            <span className="font-mono text-white font-semibold">
              {data.actual !== null ? `${data.actual.toLocaleString('en-GB')} MW` : '—'}
            </span>
          </div>

          {data.error !== null && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-1">
              <span className="text-slate-400 font-medium">Forecast Error (F − A):</span>
              <span className={`font-mono font-bold ${
                isOver ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {isOver ? `+${data.error.toLocaleString('en-GB')}` : data.error.toLocaleString('en-GB')} MW
              </span>
            </div>
          )}

          {data.publishTime && (
            <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/40">
              Published: {new Date(data.publishTime).toUTCString().replace('GMT', 'UTC').substring(17, 22)} UTC
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
      {/* Chart Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Half-Hourly Generation Profile (30-Minute Resolution)</span>
            <span className="text-xs text-slate-400 font-normal">| 48 Settlement Periods</span>
          </h3>
          <p className="text-xs text-slate-400">
            Comparing selected Day-Ahead forecast against actual outturn generation across Day D.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('generation')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'generation'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Generation (MW)
          </button>
          <button
            onClick={() => setViewMode('error')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'error'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Signed Gap (F − A)
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'generation' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={3}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                unit=" MW"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                name="Forecast at Cutoff (MW)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#forecastGrad)"
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Wind Outturn (MW)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={3}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit=" MW"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              <Bar
                dataKey="error"
                name="Forecast Error (F − A) MW"
                fill="#f59e0b"
                shape={(props: any) => {
                  const { fill, x, y, width, height } = props;
                  const isPositive = props.payload.error >= 0;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isPositive ? '#f59e0b' : '#06b6d4'}
                      rx={2}
                    />
                  );
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Forecast at Cutoff
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Actual Generation
          </span>
          {viewMode === 'error' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                Overforecast (Downside Short Risk)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
                Underforecast (Spill/Long Risk)
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-slate-400">All intervals UTC</span>
      </div>
    </div>
  );
};
