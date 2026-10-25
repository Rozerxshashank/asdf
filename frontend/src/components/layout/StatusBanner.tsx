import React from 'react';
import { Database, Clock, CheckCircle2 } from 'lucide-react';
import { HealthResponse } from '../../types/api';

interface StatusBannerProps {
  health: HealthResponse | null;
  cutoffDescription?: string;
  matchedRecords?: number;
  totalExpected?: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  health,
  cutoffDescription,
  matchedRecords = 48,
  totalExpected = 48
}) => {
  return (
    <div className="bg-[#0f172a]/70 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-medium">Data Integrity:</span>
          <span>
            {health ? (
              <>
                Historical cache loaded &bull; <span className="font-mono text-slate-200">1,488</span> settlement intervals (FUELHH) &bull;{' '}
                <span className="font-mono text-slate-200">19,856</span> forecast vintages (WINDFOR)
              </>
            ) : (
              'Loading historical January 2026 Elexon datasets...'
            )}
          </span>
        </div>

        {cutoffDescription && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[11px]">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-slate-400">Decision Cutoff:</span>
              <span className="font-medium text-slate-200">{cutoffDescription}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              (Hourly WINDFOR block matching)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
