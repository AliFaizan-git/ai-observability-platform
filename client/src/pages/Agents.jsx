import React from 'react';
import { staticAgents } from '../data/mockData';
import { SectionTitle } from '../components/ui/SectionTitle';

export function Agents() {
  return (
    <div>
      <SectionTitle title="Agent Infrastructure" description="Monitor physical worker systems, operational health, and concurrent process links." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staticAgents.map(agent => (
          <div key={agent.id} className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${agent.status === 'active' ? 'bg-cyan-500' : 'bg-amber-500'}`} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white mb-1">{agent.name}</h3>
                <span className="text-xs font-mono text-slate-500">{agent.id}</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold ${
                agent.status === 'active' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
              }`}>{agent.status}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs font-mono">
              <div>
                <div className="text-slate-500 uppercase mb-1">System Efficiency</div>
                <div className="text-sm font-bold text-white">{agent.health}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase mb-1">Active Clusters</div>
                <div className="text-sm font-bold text-white">{agent.activeSessions} threads</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}