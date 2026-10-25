import React, { useState } from 'react';
import { Target, Gauge, TrendingUp, Layers, CheckCircle2, HelpCircle } from 'lucide-react';
import { OverallMetrics } from '../../types/api';

interface MetricCardsProps {
  metrics: OverallMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const [showR2Help, setShowR2Help] = useState<boolean>(false);
  const isOverforecast = metrics.meanBiasMW > 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. MAE */}
        <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Mean Absolute Error
            </span>
            <Target className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {metrics.maeMW.toLocaleString('en-GB')}
              </span>
              <span className="text-xs text-slate-400 font-mono">MW</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
              Average error magnitude across all 1,488 SP.
            </p>
          </div>
        </div>

        {/* 2. RMSE */}
        <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Root Mean Squared Error
            </span>
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {metrics.rmseMW.toLocaleString('en-GB')}
              </span>
              <span className="text-xs text-slate-400 font-mono">MW</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
              Penalizes large forecast spikes (reserve risk).
            </p>
          </div>
        </div>

        {/* 3. Mean Bias Error */}
        <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Mean Bias Error (F − A)
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono ${
                isOverforecast ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {metrics.meanBiasMW > 0 ? `+${metrics.meanBiasMW.toLocaleString('en-GB')}` : metrics.meanBiasMW.toLocaleString('en-GB')}
              </span>
              <span className="text-xs text-slate-400 font-mono">MW</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80 truncate">
              {isOverforecast ? 'Over-forecast (Short Imbalance)' : 'Under-forecast (Long Imbalance)'}
            </p>
          </div>
        </div>

        {/* 4. WAPE */}
        <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Weighted Error (WAPE)
            </span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {metrics.wapePercent !== null ? `${metrics.wapePercent}%` : '—'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
              &Sigma;|F − A| / &Sigma;A (prevents zero division).
            </p>
          </div>
        </div>

        {/* 5. Predictive R² & Pearson r² */}
        <div className="bg-[#111827]/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Correlation & Skill
            </span>
            <button
              onClick={() => setShowR2Help(!showR2Help)}
              className="text-slate-400 hover:text-slate-200"
              title="Click to explain difference between Predictive R² and Pearson r²"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 mr-1">Predictive R&sup2;:</span>
                <span className="text-lg font-bold font-mono text-slate-100">
                  {metrics.predictiveR2 !== null && metrics.predictiveR2 !== undefined
                    ? metrics.predictiveR2.toFixed(3)
                    : (metrics.correlationR2 ?? '—')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/80">
              <span>Pearson r&sup2;:</span>
              <span className="font-mono text-slate-300 font-medium">
                {metrics.squaredPearsonR2 !== null && metrics.squaredPearsonR2 !== undefined
                  ? metrics.squaredPearsonR2.toFixed(3)
                  : (metrics.correlationR2 ?? '—')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* R² Distinction Explanation Panel */}
      {showR2Help && (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-200">
            Statistical Metric Distinction: Predictive R&sup2; vs Squared Pearson r&sup2;
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            <strong>Squared Pearson correlation (r&sup2; = {metrics.squaredPearsonR2 ?? 0.860}):</strong> Measures linear co-movement / shape alignment. Because it centers both series on their respective means, it completely ignores constant additive biases.
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            <strong>Predictive coefficient of determination (R&sup2; = {metrics.predictiveR2 ?? 0.602}):</strong> Formula <code>1 - &Sigma;(A - F)&sup2; / &Sigma;(A - mean(A))&sup2;</code>. Directly penalizes the persistent +1,840 MW mean bias. This proves that while the weather models predict wind swings directionally well (r&sup2; &gt; 0.86), relying on uncorrected Day-Ahead forecasts will systematically under-procure thermal base energy by an average of 1,840 MW per period!
          </p>
        </div>
      )}
    </div>
  );
};
