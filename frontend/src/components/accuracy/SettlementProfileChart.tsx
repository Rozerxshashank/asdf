import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import { SettlementPeriodStat } from '../../types/api';

interface SettlementProfileChartProps {
  profile: SettlementPeriodStat[];
}

export const SettlementProfileChart: React.FC<SettlementProfileChartProps> = ({ profile }) => {
  const chartData = profile.map((p) => {
    const hour = Math.floor((p.settlementPeriod - 1) / 2);
    const minute = (p.settlementPeriod - 1) % 2 === 0 ? '00' : '30';
    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute}`;
    return {
      period: p.settlementPeriod,
      time: timeLabel,
      avgActual: p.avgActualMW,
      avgForecast: p.avgForecastMW,
      mae: p.maeMW,
      bias: p.meanBiasMW,
      count: p.count,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="border-b border-slate-800 pb-1 font-semibold text-white flex justify-between">
            <span>Settlement Period {data.period}</span>
            <span className="text-slate-400 font-mono">{data.time} UTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-400 font-medium">Avg Actual:</span>
            <span className="font-mono text-white">{data.avgActual.toLocaleString('en-GB')} MW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400 font-medium">Avg Forecast:</span>
            <span className="font-mono text-white">{data.avgForecast.toLocaleString('en-GB')} MW</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1">
            <span className="text-amber-400 font-medium">MAE:</span>
            <span className="font-mono font-bold text-white">{data.mae.toLocaleString('en-GB')} MW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Mean Bias:</span>
            <span className={`font-mono font-bold ${data.bias > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {data.bias > 0 ? `+${data.bias}` : data.bias} MW
            </span>
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
            <span>Settlement Period Error Profile (HH 1 to 48)</span>
            <span className="text-xs text-slate-400 font-normal">| Full Month Diurnal Pattern</span>
          </h3>
          <p className="text-xs text-slate-400">
            Evaluating wind generation and forecast accuracy across each half-hour of the day.
          </p>
        </div>
      </div>

      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              interval={3}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              unit=" MW"
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
            {/* Shaded Area for UK Evening Peak (SP 33 - 39: 16:00 to 19:30 UTC) */}
            <ReferenceArea
              yAxisId="left"
              x1="16:00"
              x2="19:30"
              strokeOpacity={0.3}
              fill="#a855f7"
              fillOpacity={0.08}
            />
            <Bar
              yAxisId="right"
              dataKey="mae"
              name="Mean Absolute Error (MW)"
              fill="#f59e0b"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgActual"
              name="Avg Actual Wind (MW)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgForecast"
              name="Avg Forecast Wind (MW)"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500/40 border border-purple-400"></span>
            Highlighted: GB Evening Peak Window (16:30 – 19:30 UTC)
          </span>
        </div>
        <p className="text-slate-400">
          Peak periods represent peak retail demand and highest wholesale price volatility.
        </p>
      </div>
    </div>
  );
};
