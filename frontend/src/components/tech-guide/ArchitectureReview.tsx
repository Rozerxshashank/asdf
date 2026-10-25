import React from 'react';
import {
  FileCode2,
  Server,
  Layers,
  Database,
  CheckCircle2,
  ShieldCheck,
  Code,
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';

export const ArchitectureReview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
          <FileCode2 className="w-5 h-5" />
          <span>Internal Technical Lead Architecture & Design Review</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          This portal provides a comprehensive architectural breakdown of the WindLens platform for technical evaluation.
          It covers system separation of concerns, data ingestion resilience, anti-lookahead forecast selection logic,
          mathematical formulations, and testing practices.
        </p>
      </div>

      {/* Grid: 3 Major Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Frontend Architecture */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Frontend Tier (React + Vite)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>TypeScript & React 19:</strong> Strict typing matching backend Pydantic schemas.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Tailwind CSS v4:</strong> Enterprise dark theme tailored for trading desk ergonomics.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Recharts:</strong> High-performance vector charts for 48-period settlement curves.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Decoupled API Client:</strong> Resilient fetch client with typed error propagation.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Backend Architecture */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>Backend Tier (FastAPI + Python)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>FastAPI Framework:</strong> Asynchronous ASGI service with automatic OpenAPI documentation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Pure Analytics Engine:</strong> Stateless mathematical functions (<code className="text-cyan-300">analytics_engine.py</code>).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Modular Routers:</strong> Strict domain separation for forecast, accuracy, evolution, and scenario.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Exception Safeguard:</strong> Global exception handler prevents internal stack trace leakage.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Data Tier */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Data Ingestion & Integrity</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Elexon BMRS API:</strong> Direct streams (<code className="text-cyan-300">FUELHH</code> and <code className="text-cyan-300">WINDFOR</code>).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>7-Day Query Chunking:</strong> Handles Elexon's strict 7-day API date range constraint.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Packaged Local Cache:</strong> 1,488 verified actuals & 19,856 forecast vintages ready out of the box.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Resilient Fallback:</strong> Seamless fallback to validated cache during upstream network outages.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Deep-Dive Section 1: Forecast Selection & Anti-Lookahead Rule */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Anti-Lookahead Decision Gate Logic</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          In wholesale trading evaluation, using the latest available forecast at time of evaluation introduces fatal <strong>look-ahead bias</strong>.
          WindLens implements a formal filter:
        </p>

        <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-cyan-300 border border-slate-800 space-y-1 overflow-x-auto">
          <div><span className="text-slate-500"># For delivery interval startTime S and procurement cutoff T_cutoff:</span></div>
          <div><span className="text-purple-400">V_valid</span> = [vintage <span className="text-purple-400">for</span> vintage <span className="text-purple-400">in</span> V(S) <span className="text-purple-400">if</span> vintage.publishTime &le; T_cutoff]</div>
          <div><span className="text-purple-400">if</span> V_valid:</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;selected_forecast = max(V_valid, key=<span className="text-purple-400">lambda</span> v: v.publishTime)</div>
          <div><span className="text-purple-400">else</span>:</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;selected_forecast = <span className="text-amber-400">None</span> <span className="text-slate-500"># Flagged explicitly as unavailable at decision cutoff</span></div>
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <p>
            <strong>Hourly to Half-Hourly Alignment:</strong> The Elexon WINDFOR stream publishes forecasts on an hourly cadence (<code className="text-slate-200">:00</code>).
            Under UK balancing arrangements, each hourly forecast block covers both half-hour settlement periods within that hour (Period 2H - 1 and Period 2H).
            WindLens aligns these timestamps deterministically without fabricating artificial half-hourly revisions.
          </p>
        </div>
      </div>

      {/* Deep-Dive Section 2: Mathematical Formulations */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Mathematical Formulations & Metrics Specification</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px] block">
              1. Mean Absolute Error (MAE)
            </span>
            <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center">
              MAE = (1 / N) &Sigma; |Forecast_i − Actual_i|
            </div>
            <p className="text-slate-400 text-[11px]">
              Measures average expected deviation in megawatts without cancellation between positive and negative errors.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px] block">
              2. Root Mean Squared Error (RMSE)
            </span>
            <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center">
              RMSE = &radic;[ (1 / N) &Sigma; (Forecast_i − Actual_i)&sup2; ]
            </div>
            <p className="text-slate-400 text-[11px]">
              Quadratic penalty on large forecast misses. Higher RMSE relative to MAE indicates intermittent severe forecast spikes.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
              3. Mean Bias Error (MBE)
            </span>
            <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center">
              MBE = (1 / N) &Sigma; (Forecast_i − Actual_i)
            </div>
            <p className="text-slate-400 text-[11px]">
              Positive bias explicitly denotes <strong>over-forecasting</strong> (downside commercial risk). Negative denotes under-forecasting.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">
              4. Weighted Absolute Percentage Error (WAPE)
            </span>
            <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center">
              WAPE = [ &Sigma; |Forecast_i − Actual_i| / &Sigma; Actual_i ] &times; 100%
            </div>
            <p className="text-slate-400 text-[11px]">
              Volume-weighted percentage error. Zero-denominator policy: returns <code className="text-slate-200">None</code> if &Sigma;Actual = 0 to prevent division by zero.
            </p>
          </div>
        </div>
      </div>

      {/* Deep-Dive Section 3: Test Suite & Deployment Verification */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Automated Testing & Deployment Configuration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 block">Pytest Suite (28 Tests Passing):</span>
            <ul className="text-slate-400 space-y-1 pl-4 list-disc text-[11px]">
              <li>MAE, RMSE, Mean Bias, and WAPE accuracy calculation tests</li>
              <li>Zero actual outturn and zero-denominator policy validation</li>
              <li>Anti-lookahead cutoff filtering & vintage timestamp selection</li>
              <li>Empirical quantile rank calculations & histogram binning</li>
              <li>Procurement residual balance simulation arithmetic</li>
              <li>FastAPI endpoint validation, status codes, and 422 regex error tests</li>
              <li>DataService offline cache fallback verification</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-200 block">Deployment Architecture:</span>
            <ul className="text-slate-400 space-y-1 pl-4 list-disc text-[11px]">
              <li><strong>Docker Compose:</strong> Single command <code className="text-cyan-300">docker compose up --build</code> spins up backend & frontend.</li>
              <li><strong>Vercel Ready:</strong> Frontend configured with <code className="text-cyan-300">vercel.json</code> SPA rewrites and environment URL support.</li>
              <li><strong>Render / Heroku Ready:</strong> Backend containerized with <code className="text-cyan-300">render.yaml</code> and health check at <code className="text-cyan-300">/api/health</code>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
