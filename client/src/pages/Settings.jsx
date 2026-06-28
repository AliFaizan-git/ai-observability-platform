import React, { useState } from 'react';
import { SectionTitle } from '../components/ui/SectionTitle';

export function Settings() {
  const [weights, setWeights] = useState({ quality: 0.3, hallucination: 0.3, safety: 0.2, relevance: 0.1, coherence: 0.1 });
  const [threshold, setThreshold] = useState(0.75);

  const handleWeightChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  return (
    <div className="max-w-2xl">
      <SectionTitle title="Platform Configuration" description="Direct evaluation model thresholds and pipeline notification controls." />
      
      <div className="bg-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-xl mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Judge Optimization Metrics Weights</h3>
        <div className="space-y-4 font-mono text-xs">
          {Object.entries(weights).map(([key, val]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between uppercase">
                <span className="text-slate-400">{key}</span>
                <span className="text-cyan-400 font-bold">{val.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={val} onChange={(e) => handleWeightChange(key, e.target.value)} className="w-full accent-cyan-400 bg-white/10 h-1 rounded-lg cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-2">Automated Alert Threshold</h3>
        <p className="text-xs text-slate-400 mb-6 font-sans">Triggers notification pipelines if composite evaluations drop below this level.</p>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">ALERT TARGET LIMIT</span>
            <span className="text-rose-400 font-bold">{threshold}</span>
          </div>
          <input type="range" min="0.5" max="0.95" step="0.01" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} className="w-full accent-rose-500 bg-white/10 h-1 rounded-lg cursor-pointer" />
        </div>
      </div>
    </div>
  );
}