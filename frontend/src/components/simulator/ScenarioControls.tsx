import React from 'react';
import { Sliders, RefreshCw, Calculator, Calendar } from 'lucide-react';
import { ProcurementScenarioRequest } from '../../types/api';

interface ScenarioControlsProps {
  request: ProcurementScenarioRequest;
  onChange: (updated: ProcurementScenarioRequest) => void;
  onSimulate: () => void;
  loading: boolean;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  request,
  onChange,
  onSimulate,
  loading
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Procurement Scenario Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Define hypothetical system assumptions to calculate net residual wholesale procurement.
            </p>
          </div>
        </div>

        <button
          onClick={onSimulate}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Calculator className="w-3.5 h-3.5" />
          )}
          <span>Recalculate Residual</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Control 1: Delivery Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Target Delivery Date</span>
            <span className="text-[10px] text-slate-400 font-mono">Jan 2026</span>
          </label>
          <input
            type="date"
            min="2026-01-01"
            max="2026-01-31"
            value={request.deliveryDate}
            onChange={(e) => {
              if (e.target.value.startsWith('2026-01-')) {
                onChange({ ...request, deliveryDate: e.target.value });
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Control 2: Assumed Demand */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Assumed Demand</span>
            <span className="font-mono text-cyan-400 font-bold">
              {request.assumedDemandMW.toLocaleString('en-GB')} MW
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={55000}
            step={500}
            value={request.assumedDemandMW}
            onChange={(e) => onChange({ ...request, assumedDemandMW: parseFloat(e.target.value) })}
            className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>10k MW</span>
            <span>UK Peak ~45k</span>
            <span>55k MW</span>
          </div>
        </div>

        {/* Control 3: Assumed Non-Wind Baseline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Non-Wind Baseline</span>
            <span className="font-mono text-emerald-400 font-bold">
              {request.assumedNonWindMW.toLocaleString('en-GB')} MW
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={35000}
            step={500}
            value={request.assumedNonWindMW}
            onChange={(e) => onChange({ ...request, assumedNonWindMW: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0 MW</span>
            <span>Nuclear/Biomass</span>
            <span>35k MW</span>
          </div>
        </div>

        {/* Control 4: Reserve Margin */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Reserve Margin Buffer</span>
            <span className="font-mono text-amber-400 font-bold">
              {request.reserveMarginMW.toLocaleString('en-GB')} MW
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={8000}
            step={250}
            value={request.reserveMarginMW}
            onChange={(e) => onChange({ ...request, reserveMarginMW: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0 MW</span>
            <span>Hedging Buffer</span>
            <span>8k MW</span>
          </div>
        </div>
      </div>
    </div>
  );
};
