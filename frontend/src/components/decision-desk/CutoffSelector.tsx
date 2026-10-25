import React, { useState } from 'react';
import { Clock, Info, ShieldAlert, Check } from 'lucide-react';

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
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const presets = [
    {
      id: 'DA_AUCTION_1100',
      label: '11:00 UTC (D-1)',
      title: 'EPEX SPOT UK Day-Ahead Gate',
      desc: '11:00 UTC D-1 (Primary UK Wholesale Auction)'
    },
    {
      id: 'DA_AUCTION_1200',
      label: '12:00 UTC (D-1)',
      title: 'Nord Pool UK Day-Ahead Gate',
      desc: '12:00 UTC D-1 (Secondary UK Wholesale Auction)'
    },
    {
      id: 'INTRADAY_2000',
      label: '20:00 UTC (D-1)',
      title: 'Evening Intraday Update',
      desc: '20:00 UTC D-1 (Evening Position Adjustment)'
    },
    {
      id: 'INTRADAY_0000',
      label: '00:00 UTC (D)',
      title: 'Midnight Day-of-Delivery',
      desc: '00:00 UTC Day D (Delivery Gate Closure)'
    },
  ];

  return (
    <div className="bg-[#111827]/90 border border-slate-800 p-2.5 rounded-lg space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-200">
            Decision Cutoff:
          </span>
          {cutoffTime && (
            <span className="font-mono text-xs text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {cutoffTime}
            </span>
          )}
        </div>

        {/* Info button toggle */}
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          title="Market rules explanation"
        >
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] underline underline-offset-2">Market Rules</span>
        </button>
      </div>

      {/* Compact Segmented Control */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {presets.map((opt) => {
          const isSelected = cutoffRule === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onCutoffChange(opt.id)}
              className={`px-2.5 py-1.5 rounded-md text-left transition-colors border text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
              title={opt.desc}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[11px]">{opt.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">{opt.title}</span>
            </button>
          );
        })}
      </div>

      {/* Market Rules Drawer / Callout */}
      {showInfo && (
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-md text-[11px] text-slate-300 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>UK Wholesale Electricity Timing Rules</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            <strong>EPEX SPOT UK Day-Ahead Auction:</strong> Gates close at 11:00 UTC on Day (D - 1). This is the primary liquidity gate for utility procurement.
          </p>
          <p className="text-slate-400 leading-relaxed">
            <strong>Nord Pool UK Day-Ahead Auction:</strong> Gates close at 12:00 UTC on Day (D - 1).
          </p>
          <p className="text-slate-400 leading-relaxed">
            <strong>Balancing Mechanism Gate Closure:</strong> Physical gate closure occurs exactly 60 minutes prior to the start of each individual half-hour settlement period on Day D.
          </p>
          <p className="text-amber-400/90 text-[10px]">
            &bull; Anti-lookahead enforcement: The platform strictly filters out any WINDFOR forecast vintage published after the selected cutoff timestamp.
          </p>
        </div>
      )}
    </div>
  );
};

