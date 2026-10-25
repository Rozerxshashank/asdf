import React from 'react';
import { Database, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { HealthResponse } from '../../types/api';

interface StatusBannerProps {
  health: HealthResponse | null;
  cutoffDescription?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ health, cutoffDescription }) => {
  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">Dataset:</span>
          <span className="text-slate-400">
            {health ? (
              <>
                <strong className="text-slate-200">{health.cachedActualsCount}</strong> actual intervals &bull;{' '}
                <strong className="text-slate-200">{health.cachedForecastsCount}</strong> forecast vintages
                {health.lastCacheRefresh && (
                  <span className="text-slate-400 ml-1.5 hidden sm:inline">
                    (Verified cache: {new Date(health.lastCacheRefresh).toLocaleDateString('en-GB')})
                  </span>
                )}
              </>
            ) : (
              'Loading verified January 2026 Elexon datasets...'
            )}
          </span>
        </div>

        {cutoffDescription && (
          <div className="flex items-center gap-1.5 bg-blue-950/60 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded text-[11px]">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="font-medium">Active Decision Gate:</span>
            <span>{cutoffDescription}</span>
          </div>
        )}
      </div>
    </div>
  );
};
