import { useState, useEffect } from 'react';

export function useLiveMetrics() {
  const [metrics, setMetrics] = useState({
    totalTraces: 142893,
    avgLatency: 312,
    avgQuality: 0.89,
    computeCost: 42.10,
    throughputTimeline: [
      { time: '10:20', requests: 120, latency: 290 },
      { time: '10:25', requests: 210, latency: 310 },
      { time: '10:30', requests: 180, latency: 280 },
      { time: '10:35', requests: 310, latency: 450 },
      { time: '10:40', requests: 250, latency: 290 },
      { time: '10:45', requests: 380, latency: 312 },
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const nextRequests = Math.floor(Math.random() * 150) + 200;
        const nextLatency = Math.floor(Math.random() * 80) + 260;
        const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const updatedTimeline = [...prev.throughputTimeline.slice(1), { time: newTime, requests: nextRequests, latency: nextLatency }];

        return {
          totalTraces: prev.totalTraces + Math.floor(Math.random() * 3) + 1,
          avgLatency: parseFloat(((prev.avgLatency * 19 + nextLatency) / 20).toFixed(1)),
          avgQuality: parseFloat((0.85 + Math.random() * 0.1).toFixed(2)),
          computeCost: prev.computeCost + 0.02,
          throughputTimeline: updatedTimeline
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}