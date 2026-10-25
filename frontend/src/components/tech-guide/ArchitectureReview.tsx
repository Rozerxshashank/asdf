import React from 'react';
import {
  FileCode2,
  Server,
  Layers,
  Database,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Activity,
  Cpu,
  Table,
  AlertTriangle
} from 'lucide-react';

export const ArchitectureReview: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-slate-200">
      {/* Header / Title */}
      <div className="border-b border-slate-800 pb-5 space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-medium uppercase tracking-wider">
          <FileCode2 className="w-4 h-4" />
          <span>Internal Technical Lead Review &bull; Architecture Specification</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          WindLens System Architecture & Data Methodology
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          Complete technical documentation of the WindLens Day-Ahead wind power decision platform.
          Covers system separation of concerns, Elexon BMRS ingestion constraints, anti-lookahead forecast selection logic,
          hourly-to-half-hourly block alignment, mathematical error formulations, and verified empirical benchmarks.
        </p>
      </div>

      {/* Section 1: System Architecture Overview */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <Server className="w-4 h-4 text-blue-400" />
          <span>1. System Architecture & Separation of Concerns</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-2.5">
            <div className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Frontend Tier</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Built with React 19, TypeScript, Vite, and Tailwind CSS. Provides a restrained, high-density financial analytics interface.
              All components consume strongly typed interfaces mirroring backend Pydantic models. Visualization uses Recharts vector canvases with explicit zero-lines, custom tooltips, and accessible contrasting strokes.
            </p>
          </div>

          <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-2.5">
            <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Backend Tier</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              FastAPI ASGI service in Python 3.11+. Pure analytics engine (<code className="text-cyan-300">analytics_engine.py</code>) is completely decoupled from HTTP transport.
              Modular routers handle Day-Ahead forecasts, accuracy metrics, vintage evolution, and scenario balance simulations.
              Global exception handlers prevent stack trace leakage.
            </p>
          </div>

          <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-2.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Data & Caching Tier</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              In-memory indexing by standardized ISO-8601 UTC timestamps with sub-millisecond lookup latency.
              Packaged with 1,488 verified actual outturn intervals (Elexon <code className="text-emerald-300">FUELHH</code>) and 19,856 forecast vintages (<code className="text-emerald-300">WINDFOR</code>) covering the full January 2026 delivery window.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Elexon BMRS Ingestion & 7-Day Chunking */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>2. Elexon BMRS API Constraints & Resilience</span>
        </h2>
        <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            The platform interfaces with official Elexon Open Insights APIs:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>
              <strong className="text-slate-200">Actual Outturn:</strong> <code className="text-cyan-300">/datasets/FUELHH</code> or stream endpoint, filtered by <code className="text-cyan-300">fuelType == 'WIND'</code>. Records half-hourly outturn generation in MW across settlement periods 1 to 48.
            </li>
            <li>
              <strong className="text-slate-200">Wind Forecasts:</strong> <code className="text-cyan-300">/datasets/WINDFOR</code> or stream endpoint. Contains National Grid ESO rolling wind generation forecasts with target delivery timestamp (<code className="text-cyan-300">startTime</code>), publication timestamp (<code className="text-cyan-300">publishTime</code>), and generation in MW.
            </li>
            <li>
              <strong className="text-slate-200">Strict 7-Day Range Window:</strong> Elexon BMRS enforces an API restriction where date range queries exceeding 7 days return HTTP 400 Bad Request (RFC 9110). Our asynchronous client (<code className="text-cyan-300">elexon_client.py</code>) automatically chunks monthly requests into sequential 5-day windows with exponential backoff retries.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Hourly to Half-Hourly Alignment Convention */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>3. Hourly-to-Half-Hourly Step Block Alignment Convention</span>
        </h2>
        <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            An essential domain fact discovered in the Elexon dataset is that National Grid ESO publishes wind forecasts in <code className="text-cyan-300">WINDFOR</code> at an <strong className="text-white">hourly cadence</strong> (target <code className="text-cyan-300">startTime</code> minutes are always <code className="text-cyan-300">:00</code>), whereas GB wholesale market settlement operates on <strong className="text-white">30-minute settlement periods</strong>.
          </p>
          <div className="bg-[#0b101d] p-3 rounded border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200">GB Market Matching Standard:</div>
            <p className="text-slate-400">
              For clock hour H (00:00 to 01:00 UTC), settlement period 1 (00:00 to 00:30) and settlement period 2 (00:30 to 01:00) both represent instantaneous average power in MW over that clock hour. Because power is an instantaneous rate, an hourly average of 10,000 MW applies legitimately as a constant block across both constituent half-hour settlement periods.
            </p>
            <p className="text-amber-300/90 text-[11px]">
              &bull; Verification rule: We do not manufacture synthetic sub-hourly forecast vintages. The platform transparently maps the prevailing hourly ESO forecast to both settlement periods ($2H-1$ and $2H$) without fabricating intermediate data.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Anti-Lookahead Cutoff Enforcement */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>4. Anti-Lookahead Decision Cutoff & Historical Reconstruction</span>
        </h2>
        <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            In wholesale trading, procurement decisions are committed at market deadlines. Evaluating a forecast that incorporates weather model revisions published <em>after</em> the auction gate produces severe look-ahead bias and invalidates backtesting.
          </p>
          <div className="space-y-2">
            <div className="font-semibold text-slate-200">Selection Algorithm (<code className="text-cyan-300">get_forecast_for_interval()</code>):</div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-400">
              <li>Resolve decision cutoff datetime <code className="text-cyan-300">T_cutoff</code> in UTC. Custom timestamps are strictly required to be timezone-aware (e.g. ISO-8601 with &apos;Z&apos; or &apos;+00:00&apos;). Naive timestamps without timezone offsets are rejected with HTTP 400.</li>
              <li>Filter all historical vintages for target interval <code className="text-cyan-300">T_start</code> where <code className="text-cyan-300">publishTime &le; T_cutoff</code>.</li>
              <li>Select the latest vintage published prior to the cutoff: <code className="text-cyan-300">max(publishTime)</code>.</li>
              <li>If no vintage was published before the cutoff, the interval is explicitly marked <code className="text-rose-400">isAvailableByCutoff = false</code>; no post-cutoff forecast is ever substituted.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Section 5: Mathematical Formulations */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <Table className="w-4 h-4 text-blue-400" />
          <span>5. Mathematical Error Formulations</span>
        </h2>
        <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-lg space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0b101d] p-3 rounded border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200">Mean Absolute Error (MAE)</span>
              <p className="font-mono text-cyan-300 text-[11px]">&frac12;N &Sigma; |F_i - A_i|</p>
              <p className="text-slate-400 text-[11px]">Primary linear penalty metric. Average magnitude of forecast error in MW.</p>
            </div>

            <div className="bg-[#0b101d] p-3 rounded border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200">Root Mean Squared Error (RMSE)</span>
              <p className="font-mono text-purple-300 text-[11px]">&radic;(&frac12;N &Sigma; (F_i - A_i)&sup2;)</p>
              <p className="text-slate-400 text-[11px]">Quadratic penalty metric. Highlights large forecast excursions critical for reserve sizing.</p>
            </div>

            <div className="bg-[#0b101d] p-3 rounded border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200">Mean Bias Error (Signed)</span>
              <p className="font-mono text-amber-300 text-[11px]">&frac12;N &Sigma; (F_i - A_i)</p>
              <p className="text-slate-400 text-[11px]">Signed direction. Positive = over-forecasting (short imbalance risk). Negative = under-forecasting (long risk).</p>
            </div>

            <div className="bg-[#0b101d] p-3 rounded border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200">Weighted Absolute % Error (WAPE)</span>
              <p className="font-mono text-emerald-300 text-[11px]">(&Sigma; |F_i - A_i| / &Sigma; A_i) &times; 100%</p>
              <p className="text-slate-400 text-[11px]">Volume-weighted error. Used over MAPE to prevent catastrophic zero-division during wind lulls.</p>
            </div>
          </div>

          <div className="bg-[#0b101d] p-3.5 rounded border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-200">Predictive R&sup2; vs Squared Pearson Correlation (r&sup2;)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              <strong>Predictive R&sup2; (Skill Benchmark):</strong> Formula <code>1 - &Sigma;(A_i - F_i)&sup2; / &Sigma;(A_i - mean(A))&sup2;</code>. Measures accuracy relative to climatological mean baseline. Directly penalizes the persistent +1,840 MW mean bias.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              <strong>Squared Pearson r&sup2; (Linear Co-Movement):</strong> Square of Pearson correlation. Centers both series on their means and measures linear association regardless of additive bias.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Verified Numerical Reconciliation Table */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>6. Verified Numerical Reconciliation Table (January 2026 Full Dataset)</span>
        </h2>
        <div className="bg-[#111827]/90 border border-slate-800 rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Decision Cutoff Gate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Coverage</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAE (MW)</th>
                <th className="py-2.5 px-3 font-semibold text-right">RMSE (MW)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Mean Bias (MW)</th>
                <th className="py-2.5 px-3 font-semibold text-right">WAPE (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Predictive R&sup2;</th>
                <th className="py-2.5 px-3 font-semibold text-right">Pearson r&sup2;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-sans font-medium text-blue-400">DA_AUCTION_1100 (11:00 D-1)</td>
                <td className="py-2 px-3 text-right">100.0% (1,488 SP)</td>
                <td className="py-2 px-3 text-right">2,126.1</td>
                <td className="py-2 px-3 text-right">2,620.8</td>
                <td className="py-2 px-3 text-right text-amber-400">+1,840.3</td>
                <td className="py-2 px-3 text-right">18.36%</td>
                <td className="py-2 px-3 text-right text-slate-100">0.6021</td>
                <td className="py-2 px-3 text-right text-slate-300">0.8602</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-sans font-medium text-slate-300">DA_AUCTION_1200 (12:00 D-1)</td>
                <td className="py-2 px-3 text-right">100.0% (1,488 SP)</td>
                <td className="py-2 px-3 text-right">2,020.6</td>
                <td className="py-2 px-3 text-right">2,481.4</td>
                <td className="py-2 px-3 text-right text-amber-400">+1,806.2</td>
                <td className="py-2 px-3 text-right">17.45%</td>
                <td className="py-2 px-3 text-right text-slate-100">0.6433</td>
                <td className="py-2 px-3 text-right text-slate-300">0.8929</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-sans font-medium text-slate-300">INTRADAY_2000 (20:00 D-1)</td>
                <td className="py-2 px-3 text-right">100.0% (1,488 SP)</td>
                <td className="py-2 px-3 text-right">1,981.6</td>
                <td className="py-2 px-3 text-right">2,448.5</td>
                <td className="py-2 px-3 text-right text-amber-400">+1,795.7</td>
                <td className="py-2 px-3 text-right">17.11%</td>
                <td className="py-2 px-3 text-right text-slate-100">0.6527</td>
                <td className="py-2 px-3 text-right text-slate-300">0.9034</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7: Key Trading Insight */}
      <section className="bg-[#0b101d] border border-blue-900/50 p-4 rounded-lg space-y-2 text-xs">
        <div className="font-semibold text-blue-300 flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          <span>Core Domain Takeaway for Wholesale Power Procurement</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          National Grid ESO's Day-Ahead wind forecast exhibits strong directional correlation (<span className="font-mono text-white">r&sup2; = 0.8602</span>), but suffers from systematic over-forecasting (<span className="font-mono text-amber-300">+1,840.3 MW</span> mean bias), reducing true predictive skill to <span className="font-mono text-white">R&sup2; = 0.6021</span>.
          Without empirical bias-correction, buying strictly to raw Day-Ahead forecast wind volumes will systematically leave the utility short in the Balancing Mechanism by an average of 1,840 MW per settlement period.
        </p>
      </section>
    </div>
  );
};
