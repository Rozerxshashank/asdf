import React from 'react';
import { Clock, Info, ShieldAlert } from 'lucide-react';

interface CutoffSelectorProps {
  cutoffRule: string;
  onCutoffChange: (rule: string) => void;
  cutoffTime: string;
  cutoffDescription: string;
}

export const CutoffSelector: React.FC<CutoffSelectorProps> = ({
  cutoffRule,
  onCutoffChange,
  cutoffTime,
  cutoffDescription
}) => {
  const options = [
    {
      id: 'DA_AUCTION_1100',
      label: '11:00 UTC (D-1)',
      title: 'EPEX SPOT UK Day-Ahead Auction Deadline',
      tag: 'Primary Market Standard'
    },
    {
      id: 'DA_AUCTION_1200',
      label: '12:00 UTC (D-1)',
      title: 'Nord Pool UK Day-Ahead Auction Deadline',
      tag: 'Exchange Secondary Gate'
    },
    {
      id: 'INTRADAY_2000',
      label: '20:00 UTC (D-1)',
      title: 'Evening Intraday Adjustment Gate',
      tag: 'Evening Revision'
    },
    {
      id: 'INTRADAY_0000',
      label: '00:00 UTC (D)',
      title: 'Midnight Day-of-Delivery Gate',
      tag: 'Delivery Start'
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200">
              Procurement Decision Cutoff Gate
            </span>
            <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
              (Anti-lookahead threshold on Day D-1)
            </span>
          </div>
        </div>

        {cutoffTime && (
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="text-slate-400">Cutoff:</span>
            <span className="text-amber-300 font-semibold">{cutoffTime}</span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {options.map((opt) => {
          const isSelected = cutoffRule === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onCutoffChange(opt.id)}
              className={`p-2.5 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-xs font-bold text-white">
                  {opt.label}
                </span>
                <span className={`text-[9px] uppercase px-1 py-0.2 rounded font-medium ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {opt.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {opt.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Explanatory note */}
      <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300 font-medium">Market Rule Note:</strong> In the UK wholesale market, day-ahead auction buy orders are locked at the Day-Ahead gate closure (11:00 or 12:00 UTC on D-1). WindLens strictly filters forecasts so that only vintages published{' '}
          <strong className="text-amber-300 font-mono">prior to or at this cutoff</strong> are evaluated, completely eliminating look-ahead bias.
        </p>
      </div>
    </div>
  );
};
