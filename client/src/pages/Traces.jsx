import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { staticTraces } from '../data/mockData';
import { TraceTag } from '../components/ui/TraceTag';
import { SectionTitle } from '../components/ui/SectionTitle';

export function Traces() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      <SectionTitle title="Telemetry Traces" description="Deep inspection into payload pipelines, runtime spans, and score evaluation weights." />
      <div className="border border-white/10 bg-black/40 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Trace ID</th>
                <th className="p-4">Target Model</th>
                <th className="p-4">Latency</th>
                <th className="p-4">Tokens</th>
                <th className="p-4">Judge Status</th>
                <th className="p-4">Composite</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {staticTraces.map(trace => {
                const isExpanded = expandedId === trace.id;
                return (
                  <React.Fragment key={trace.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : trace.id)}>
                      <td className="p-4 font-mono text-cyan-400 font-semibold">{trace.id}</td>
                      <td className="p-4 text-slate-300">{trace.model}</td>
                      <td className="p-4 font-mono text-slate-400">{trace.latency}</td>
                      <td className="p-4 font-mono text-slate-400">{trace.tokens}</td>
                      <td className="p-4"><TraceTag status={trace.status} /></td>
                      <td className="p-4 font-mono text-white font-bold">{trace.score}</td>
                      <td className="p-4 text-right text-slate-500">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan="7" className="p-6 border-t border-white/5 font-mono text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="text-slate-400 font-bold mb-2 uppercase tracking-wide">Inbound Prompt Context:</div>
                              <div className="bg-black/60 border border-white/10 p-4 rounded-xl text-slate-300 whitespace-pre-wrap">{trace.prompt}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 font-bold mb-2 uppercase tracking-wide">Outbound Intercept Payload:</div>
                              <div className="bg-black/60 border border-white/10 p-4 rounded-xl text-slate-300 whitespace-pre-wrap">{trace.output}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}