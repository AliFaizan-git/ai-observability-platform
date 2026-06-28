import React from 'react';

export function TraceTag({ status }) {
  const isEvaluated = status === 'evaluated';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-xs uppercase tracking-wider font-semibold ${
      isEvaluated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    }`}>
      {status}
    </span>
  );
}