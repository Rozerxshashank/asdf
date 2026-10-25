import React, { useState } from 'react';
import { SettlementPoint } from '../../types/api';
import { ChevronDown, ChevronUp, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettlementTableProps {
  intervals: SettlementPoint[];
}

export const SettlementTable: React.FC<SettlementTableProps> = ({ intervals }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'misses' | 'peak'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const filtered = intervals.filter((item) => {
    if (filterMode === 'misses') {
      return item.absoluteError !== null && item.absoluteError > 1000;
    }
    if (filterMode === 'peak') {
      // UK peak electricity periods: SP 33 to 39 (16:00 to 19:30 UTC)
      return item.settlementPeriod >= 33 && item.settlementPeriod <= 39;
    }
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Settlement Period Detail
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({filtered.length} of {intervals.length} periods)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All 48 SP
            </button>
            <button
              onClick={() => setFilterMode('misses')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filterMode === 'misses'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Misses &gt; 1 GW
            </button>
            <button
              onClick={() => setFilterMode('peak')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filterMode === 'peak'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Evening Peak (SP 33-39)
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            title={isExpanded ? 'Collapse Table' : 'Expand Table'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Body */}
      {isExpanded && (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">SP</th>
                <th className="py-2.5 px-3 font-semibold">Start Time (UTC)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Forecast (MW)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actual (MW)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Error (F − A)</th>
                <th className="py-2.5 px-3 font-semibold">Vintage Published</th>
                <th className="py-2.5 px-3 font-semibold text-center">Cutoff Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((item) => {
                const startTimeFmt = item.startTime.split('T')[1].substring(0, 5);
                const endTimeFmt = item.endTime.split('T')[1].substring(0, 5);
                const isOver = (item.forecastError ?? 0) > 0;
                return (
                  <tr
                    key={item.settlementPeriod}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2 px-3 font-bold text-slate-300">
                      #{item.settlementPeriod}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {startTimeFmt} - {endTimeFmt}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-blue-400">
                      {item.forecastGeneration !== null
                        ? item.forecastGeneration.toLocaleString('en-GB')
                        : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-400">
                      {item.actualGeneration !== null
                        ? item.actualGeneration.toLocaleString('en-GB')
                        : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      {item.forecastError !== null ? (
                        <span
                          className={
                            isOver
                              ? 'text-amber-400'
                              : item.forecastError < 0
                              ? 'text-cyan-400'
                              : 'text-slate-300'
                          }
                        >
                          {isOver
                            ? `+${item.forecastError.toLocaleString('en-GB')}`
                            : item.forecastError.toLocaleString('en-GB')}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {item.publishTime ? (
                        new Date(item.publishTime)
                          .toUTCString()
                          .replace('GMT', 'UTC')
                          .substring(17, 22) + ' UTC'
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.forecastAvailableByCutoff ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-sans">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800/60 font-sans">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
