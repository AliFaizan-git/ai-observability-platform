import React from 'react';
import { Activity, Clock, Award, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLiveMetrics } from '../hooks/useLiveMetrics';
import { staticTraces } from '../data/mockData';
import { MetricCard } from '../components/ui/MetricCard';
import { TraceTag } from '../components/ui/TraceTag';
import { SectionTitle } from '../components/ui/SectionTitle';

export function Overview() {
  const liveMetrics = useLiveMetrics();

  return (
    <div>
      <SectionTitle title="Overview" description="Real-time performance profiles and asynchronous telemetry tracking." />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Ingested Traces" value={liveMetrics.totalTraces.toLocaleString()} subtext="Live stream increment active" icon={Activity} glowClass="cyan-glow" />
        <MetricCard title="Avg Latency" value={`${liveMetrics.avgLatency}ms`} subtext="Rolling 20-payload median" icon={Clock} glowClass="indigo-glow" />
        <MetricCard title="Judge Quality Target" value={`${liveMetrics.avgQuality}/1.0`} subtext="Gemini 2.5 real-time score" icon={Award} glowClass="cyan-glow" />
        <MetricCard title="Est Compute Cost" value={`$${liveMetrics.computeCost.toFixed(2)}`} subtext="Accumulated infrastructure cost" icon={DollarSign} glowClass="indigo-glow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-6 uppercase tracking-wider">Operational Throughput</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveMetrics.throughputTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="time" stroke="#475569" strokeWidth={1} style={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                <YAxis stroke="#475569" strokeWidth={1} style={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="requests" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-6 uppercase tracking-wider">Live Pipeline Feed</h3>
          <div className="space-y-4">
            {staticTraces.map(trace => (
              <div key={trace.id} className="p-4 border border-white/5 bg-white/[0.01] rounded-xl hover:border-indigo-500/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-cyan-400 font-semibold">{trace.id}</span>
                  <TraceTag status={trace.status} />
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>{trace.model}</span>
                  <span className="text-white font-bold">{trace.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}