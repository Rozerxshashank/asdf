import React from 'react';
import { Database, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 mt-16 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Column 1: Data Attribution */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Data Source Attribution</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Powered strictly by official Elexon BMRS Insights streams:{' '}
              <span className="font-mono text-cyan-300">FUELHH</span> (National Wind Outturn) and{' '}
              <span className="font-mono text-cyan-300">WINDFOR</span> (National Grid ESO Rolling Forecasts).
            </p>
            <p className="text-[11px] text-slate-400">
              Target delivery window: January 1–31, 2026.
            </p>
          </div>

          {/* Column 2: Market Rules & Timestamps */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Market Rules & Timezone</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Evaluated in <strong className="text-slate-200">UTC</strong> (coinciding with UK Civil Time / GMT in January).
              Day-Ahead auction gate closure on Day D-1 is explicitly distinguished from Balancing Mechanism 1-hour Gate Closure.
            </p>
          </div>

          {/* Column 3: Analytical Integrity */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Analytical Integrity Guarantee</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Strict anti-lookahead rule enforced: forecasts for each delivery interval are filtered by{' '}
              <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">
                publishTime &le; decisionCutoff
              </code>
              . No future data is substituted.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 WindLens • UK Day-Ahead Electricity Market Decision Support</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-slate-300">
              Elexon Insights API v1
            </span>
            <span>•</span>
            <span className="hover:text-slate-300">
              FastAPI + React 19 + TypeScript
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
