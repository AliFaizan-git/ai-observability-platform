import React from 'react';
import { staticExperiments } from '../data/mockData';
import { SectionTitle } from '../components/ui/SectionTitle';

export function Experiments() {
  return (
    <div>
      <SectionTitle title="Evaluation Experiments" description="Run prompt regression testing pipelines against regression datasets." />
      <div className="grid grid-cols-1 gap-6">
        {staticExperiments.map(exp => (
          <div key={exp.id} className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">{exp.name}</h3>
                <span className="text-xs font-mono text-slate-500">{exp.id}</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-md font-mono ${exp.status === 'Running' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' : 'bg-indigo-500/10 text-indigo-400'}`}>{exp.status}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500" style={{ width: `${exp.progress}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <div className="text-slate-500 uppercase mb-1">Evaluations Run</div>
                <div className="text-sm font-bold text-slate-200">{exp.traces} / 500</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase mb-1">Target Match</div>
                <div className="text-sm font-bold text-slate-200">{exp.progress}%</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase mb-1">Mean Quality Profile</div>
                <div className="text-sm font-bold text-emerald-400">{exp.avgScore}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}