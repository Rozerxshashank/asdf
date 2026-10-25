import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerBoxProps {
  disclaimer: string;
}

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({ disclaimer }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Conditional Scenario Disclaimer & Operational Limits</span>
      </div>

      <div className="text-xs text-slate-300 leading-relaxed space-y-2">
        <p>
          {disclaimer}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] border-t border-slate-800/80 text-slate-400">
          <div>
            <strong className="text-slate-200 block mb-0.5">Missing External Data Elements:</strong>
            Retail customer shape profiles, CCGT & nuclear availability, pumped storage dispatch, HVDC interconnectors (France, Norway, Netherlands), and network transmission constraints.
          </div>
          <div>
            <strong className="text-slate-200 block mb-0.5">Commercial Dispatch Realities:</strong>
            Actual utility hedging combines Day-Ahead auctions, intraday exchanges, and the ESO Balancing Mechanism, governed by cashout spread arbitrage rather than static generation arithmetic.
          </div>
        </div>
      </div>
    </div>
  );
};
