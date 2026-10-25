import React from 'react';
import { Wind, BarChart3, Target, GitBranch, Calculator, BookOpen, Database, Check } from 'lucide-react';
import { HealthResponse } from '../../types/api';

export type TabId = 'desk' | 'accuracy' | 'uncertainty' | 'simulator' | 'tech';

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  health: HealthResponse | null;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, health, loading }) => {
  const primaryTabs = [
    { id: 'desk' as TabId, label: 'Decision Desk', icon: BarChart3 },
    { id: 'accuracy' as TabId, label: 'Accuracy', icon: Target },
    { id: 'uncertainty' as TabId, label: 'Forecast Evolution', icon: GitBranch },
    { id: 'simulator' as TabId, label: 'Scenarios', icon: Calculator },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#0c1322] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-slate-100">WindLens</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  UK BMRS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block leading-none mt-0.5">
                Day-Ahead Wholesale Power Procurement Desk
              </p>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Architecture Review Doc Link & Data Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onTabChange('tech')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors border ${
                activeTab === 'tech'
                  ? 'bg-slate-800 text-blue-300 border-blue-500/50 font-medium'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border-slate-800 hover:bg-slate-800'
              }`}
              title="Technical Architecture & Review Documentation"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Architecture Review</span>
            </button>

            {/* Discreet Data Status Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-sans hidden lg:inline">Historical cache loaded</span>
              <span className="text-slate-500 hidden lg:inline">&bull;</span>
              <span className="text-slate-400">Jan 2026 UTC</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto gap-1 py-1.5 border-t border-slate-800/60 no-scrollbar">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
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
          <button
            onClick={() => onTabChange('tech')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
              activeTab === 'tech'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
