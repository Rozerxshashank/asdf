import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

export const MethodologyCaveat: React.FC = () => {
  return (
    <div className="bg-amber-950/30 border border-amber-800/60 p-4 rounded-xl text-xs space-y-2">
      <div className="flex items-center gap-2 text-amber-300 font-bold">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Analytical Methodology & Uncertainty Limitations</span>
      </div>

      <div className="text-slate-300 leading-relaxed space-y-1.5 pl-6">
        <p>
          <strong className="text-amber-200">1. Empirical Sample Quantiles vs Probabilistic Forecasts:</strong> The P10, P50, and P90 figures presented above represent empirical rank-based percentiles computed strictly from the observed January 2026 forecast error sample under the specified decision cutoff. They must <em className="text-amber-300">not</em> be conflated with calibrated parametric probabilistic weather ensemble forecasts or regulatory financial Value-at-Risk (VaR).
        </p>
        <p>
          <strong className="text-amber-200">2. Single-Month Sample Limitations:</strong> Atmospheric weather regimes in the British Isles during January exhibit pronounced seasonal characteristics (e.g. Atlantic low-pressure depressions and winter storms). Error distributions derived from this single month cannot be generalized uncritically to summer lull conditions or transitional shoulder months without full annual multi-year calibration.
        </p>
        <p>
          <strong className="text-amber-200">3. Operational Decision Usage:</strong> For wholesale procurement desks, these empirical quantiles provide an intuitive benchmark for potential forecast deviation magnitude at the day-ahead gate, helping determine prudent reserve hedging margins rather than definitive dispatch forecasts.
        </p>
      </div>
    </div>
  );
};
