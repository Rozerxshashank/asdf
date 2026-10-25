import React from 'react';
import { Wind, BarChart3, Target, GitBranch, Calculator, FileCode2, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthResponse } from '../../types/api';

export type TabId = 'desk' | 'accuracy' | 'uncertainty' | 'simulator' | 'tech';

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  health: HealthResponse | null;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, health, loading }) => {
  const tabs = [
    { id: 'desk' as TabId, label: 'Decision Desk', icon: BarChart3, desc: 'Day-Ahead Procurement' },
    { id: 'accuracy' as TabId, label: 'Accuracy Hub', icon: Target, desc: 'Quantified Error Metrics' },
    { id: 'uncertainty' as TabId, label: 'Vintage Evolution', icon: GitBranch, desc: 'Uncertainty & Lead-Time' },
    { id: 'simulator' as TabId, label: 'Procurement Scenario', icon: Calculator, desc: 'Residual Balance Tool' },
    { id: 'tech' as TabId, label: 'Architecture Review', icon: FileCode2, desc: 'Technical Documentation' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Wind className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">WindLens</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase tracking-wider">
                  UK BMRS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Day-Ahead Wind Procurement Decision Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={tab.desc}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
              {health?.status === 'healthy' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-400 font-medium">BMRS Operational</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400 font-medium">Cache Active</span>
                </>
              )}
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono text-[11px]">Jan 2026</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto gap-1 py-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
