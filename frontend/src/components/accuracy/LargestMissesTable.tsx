import React from 'react';
import { MissRecord } from '../../types/api';
import { AlertTriangle, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LargestMissesTableProps {
  largestMisses: {
    topOverforecasts: MissRecord[];
    topUnderforecasts: MissRecord[];
  };
}

export const LargestMissesTable: React.FC<LargestMissesTableProps> = ({ largestMisses }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top Over-forecasts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Top 5 Over-Forecasts (Shortfall Risk)
              </h4>
              <p className="text-[11px] text-slate-400">
                Forecast &gt; Actual &bull; Utility caught short in Balancing Mechanism
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-2 px-2.5">Date & SP</th>
                <th className="py-2 px-2.5 text-right">Forecast</th>
                <th className="py-2 px-2.5 text-right">Actual</th>
                <th className="py-2 px-2.5 text-right text-amber-400 font-bold">Error (F − A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {largestMisses.topOverforecasts.map((m, idx) => {
                const timeFmt = m.startTime.split('T')[1].substring(0, 5);
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2.5">
                      <span className="text-slate-200 font-semibold">{m.settlementDate}</span>{' '}
                      <span className="text-slate-400">SP {m.settlementPeriod} ({timeFmt})</span>
                    </td>
                    <td className="py-2 px-2.5 text-right text-blue-400">
                      {m.forecastMW.toLocaleString('en-GB')} MW
                    </td>
                    <td className="py-2 px-2.5 text-right text-emerald-400">
                      {m.actualMW.toLocaleString('en-GB')} MW
                    </td>
                    <td className="py-2 px-2.5 text-right text-amber-400 font-bold">
                      +{m.errorMW.toLocaleString('en-GB')} MW
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Under-forecasts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Top 5 Under-Forecasts (Spill / Long Risk)
              </h4>
              <p className="text-[11px] text-slate-400">
                Actual &gt; Forecast &bull; Excess power must be spilled or sold long
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-2 px-2.5">Date & SP</th>
                <th className="py-2 px-2.5 text-right">Forecast</th>
                <th className="py-2 px-2.5 text-right">Actual</th>
                <th className="py-2 px-2.5 text-right text-cyan-400 font-bold">Error (F − A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {largestMisses.topUnderforecasts.map((m, idx) => {
                const timeFmt = m.startTime.split('T')[1].substring(0, 5);
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2.5">
                      <span className="text-slate-200 font-semibold">{m.settlementDate}</span>{' '}
                      <span className="text-slate-400">SP {m.settlementPeriod} ({timeFmt})</span>
                    </td>
                    <td className="py-2 px-2.5 text-right text-blue-400">
                      {m.forecastMW.toLocaleString('en-GB')} MW
                    </td>
                    <td className="py-2 px-2.5 text-right text-emerald-400">
                      {m.actualMW.toLocaleString('en-GB')} MW
                    </td>
                    <td className="py-2 px-2.5 text-right text-cyan-400 font-bold">
                      {m.errorMW.toLocaleString('en-GB')} MW
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
