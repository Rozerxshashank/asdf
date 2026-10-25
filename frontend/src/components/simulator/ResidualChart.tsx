import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { ProcurementScenarioResponse } from '../../types/api';
import { Flame, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ResidualChartProps {
  scenario: ProcurementScenarioResponse;
}

export const ResidualChart: React.FC<ResidualChartProps> = ({ scenario }) => {
  const chartData = scenario.intervals.map((i) => {
    const timeLabel = i.startTime.split('T')[1].substring(0, 5);
    return {
      period: i.settlementPeriod,
      time: timeLabel,
      residualForecast: i.netResidualForecastMW,
      residualActual: i.netResidualActualMW,
      delta: i.residualDeltaMW,
      windForecast: i.forecastWindMW,
      windActual: i.actualWindMW,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isDeficit = (data.delta ?? 0) < 0;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="border-b border-slate-800 pb-1 font-semibold text-white flex justify-between">
            <span>SP {data.period} ({data.time} UTC)</span>
            <span className="text-slate-400 font-mono">Residual Balance</span>
          </div>

          <div className="flex justify-between">
            <span className="text-blue-400 font-medium">Procured Residual (Forecast):</span>
            <span className="font-mono text-white font-bold">
              {data.residualForecast.toLocaleString('en-GB')} MW
            </span>
          </div>

          {data.residualActual !== null && (
            <div className="flex justify-between">
              <span className="text-emerald-400 font-medium">Actual Residual Needed:</span>
              <span className="font-mono text-white font-bold">
                {data.residualActual.toLocaleString('en-GB')} MW
              </span>
            </div>
          )}

          {data.delta !== null && (
            <div className="flex justify-between border-t border-slate-800 pt-1">
              <span className="text-slate-400 font-medium">Imbalance Gap:</span>
              <span className={`font-mono font-bold ${isDeficit ? 'text-rose-400' : 'text-cyan-400'}`}>
                {data.delta > 0 ? `+${data.delta}` : data.delta} MW
              </span>
            </div>
          )}

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 flex justify-between">
            <span>Wind Forecast: {data.windForecast?.toLocaleString('en-GB') ?? '—'} MW</span>
            <span>Actual: {data.windActual?.toLocaleString('en-GB') ?? '—'} MW</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Avg Residual Required</span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-blue-400">
              {scenario.summary.avgNetResidualForecastMW.toLocaleString('en-GB')}
            </span>
            <span className="text-[10px] text-slate-400">MW</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Peak Residual Required</span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-amber-400">
              {scenario.summary.peakNetResidualForecastMW.toLocaleString('en-GB')}
            </span>
            <span className="text-[10px] text-slate-400">MW</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Total Day Residual Energy</span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-purple-400">
              {scenario.summary.totalNetResidualForecastMWh.toLocaleString('en-GB')}
            </span>
            <span className="text-[10px] text-slate-400">MWh</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Max Shortfall Exposure</span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-rose-400">
              {scenario.summary.maxDeficitExposureMW.toLocaleString('en-GB')}
            </span>
            <span className="text-[10px] text-slate-400">MW Peak Deficit</span>
          </div>
        </div>
      </div>

      {/* Residual Chart */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Net Residual Power Requirement Across Settlement Periods</span>
        </h4>
        <p className="text-[11px] text-slate-400">
          Net Residual = max(0, Assumed Demand + Reserve Margin − Non-Wind Baseline − Wind Generation)
        </p>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="residualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
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
              dataKey="residualForecast"
              name="Procurement Need (Forecast Wind)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#residualGrad)"
            />
            <Line
              type="monotone"
              dataKey="residualActual"
              name="Outturn Need (Actual Wind)"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
