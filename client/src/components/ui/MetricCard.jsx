import React from 'react';

export function MetricCard({ title, value, subtext, icon: Icon, glowClass }) {
  return (
    <div className={`relative bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:border-indigo-500/30 group ${glowClass}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-medium text-slate-400 tracking-wide uppercase">{title}</h4>
        <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors duration-300" />
      </div>
      <div className="text-3xl font-bold text-white font-mono tracking-tight mb-2">{value}</div>
      <div className="text-xs font-mono text-emerald-400">{subtext}</div>
    </div>
  );
}