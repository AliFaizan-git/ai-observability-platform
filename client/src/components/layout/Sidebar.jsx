import React from 'react';
import { LayoutDashboard, TerminalSquare, Zap, FlaskConical, Database, Settings, Activity } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Traces', label: 'Traces', icon: TerminalSquare },
    { id: 'Agents', label: 'Agents', icon: Zap },
    { id: 'Experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'Datasets', label: 'Datasets', icon: Database },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-black/60 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <Activity size={16} className="text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-wider text-white">NeuralOps</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative font-medium text-sm tracking-wide ${
                isActive ? 'text-cyan-400 bg-cyan-500/5 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => setActiveTab('Settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm tracking-wide ${
            activeTab === 'Settings' ? 'text-cyan-400 bg-cyan-500/5 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}