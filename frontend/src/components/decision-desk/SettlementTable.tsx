import React, { useState } from 'react';
import { SettlementPoint } from '../../types/api';
import { ChevronDown, ChevronUp, ArrowUpDown, Filter } from 'lucide-react';

interface SettlementTableProps {
  intervals: SettlementPoint[];
}

export const SettlementTable: React.FC<SettlementTableProps> = ({ intervals }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'misses' | 'peak'>('all');
  const [sortField, setSortField] = useState<'period' | 'error' | 'forecast' | 'actual'>('period');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const filtered = intervals.filter((item) => {
    if (filterMode === 'misses') {
      return item.absoluteError !== null && item.absoluteError > 1000;
    }
    if (filterMode === 'peak') {
      // UK electricity evening peak: Settlement Periods 33 to 39 (16:00 to 19:30 UTC)
      return item.settlementPeriod >= 33 && item.settlementPeriod <= 39;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    if (sortField === 'period') {
      aVal = a.settlementPeriod;
      bVal = b.settlementPeriod;
    } else if (sortField === 'error') {
      aVal = Math.abs(a.forecastError ?? 0);
      bVal = Math.abs(b.forecastError ?? 0);
    } else if (sortField === 'forecast') {
      aVal = a.forecastGeneration ?? 0;
      bVal = b.forecastGeneration ?? 0;
    } else if (sortField === 'actual') {
      aVal = a.actualGeneration ?? 0;
      bVal = b.actualGeneration ?? 0;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (field: 'period' | 'error' | 'forecast' | 'actual') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default to descending for numbers
    }
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800 rounded-lg overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0d1424]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-100">
            Settlement Period Detail
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({sorted.length} of {intervals.length} intervals)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0b101d] p-0.5 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All 48 SP
            </button>
            <button
              onClick={() => setFilterMode('misses')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                filterMode === 'misses'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Misses &gt; 1 GW
            </button>
            <button
              onClick={() => setFilterMode('peak')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                filterMode === 'peak'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
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
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0b101d] text-slate-400 sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th
                  onClick={() => toggleSort('period')}
                  className="py-2 px-3 font-medium cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>SP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-2 px-3 font-medium">Interval (UTC)</th>
                <th
                  onClick={() => toggleSort('forecast')}
                  className="py-2 px-3 font-medium text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Forecast (MW)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('actual')}
                  className="py-2 px-3 font-medium text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Actual (MW)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('error')}
                  className="py-2 px-3 font-medium text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Error (F − A)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-2 px-3 font-medium">Vintage Published</th>
                <th className="py-2 px-3 font-medium text-center">Cutoff Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {sorted.map((item) => {
                const startTimeFmt = item.startTime.split('T')[1].substring(0, 5);
                const endTimeFmt = item.endTime.split('T')[1].substring(0, 5);
                const isOver = (item.forecastError ?? 0) > 0;
                const absErr = item.absoluteError ?? 0;
                const isMajorMiss = absErr >= 1500;

                return (
                  <tr
                    key={item.settlementPeriod}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isMajorMiss ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold text-slate-300">
                      SP {item.settlementPeriod}
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-sans">
                      {startTimeFmt} &ndash; {endTimeFmt} UTC
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-sky-400">
                      {item.forecastGeneration !== null
                        ? item.forecastGeneration.toLocaleString('en-GB')
                        : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-400">
                      {item.actualGeneration !== null
                        ? item.actualGeneration.toLocaleString('en-GB')
                        : '—'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${
                      isOver ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {item.forecastError !== null
                        ? (isOver ? `+${item.forecastError.toLocaleString('en-GB')}` : item.forecastError.toLocaleString('en-GB'))
                        : '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {item.publishTime
                        ? item.publishTime.replace('T', ' ').replace('Z', ' UTC')
                        : '—'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                        item.forecastAvailableByCutoff
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      }`}>
                        {item.forecastAvailableByCutoff ? 'Available before cutoff' : 'Unavailable at cutoff'}
                      </span>
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
