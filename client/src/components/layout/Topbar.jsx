import React from 'react';

export function Topbar() {
  return (
    <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md px-8 flex justify-end items-center fixed top-0 left-64 right-0 z-40">
      <div className="flex items-center gap-3 bg-indigo-950/20 border border-indigo-500/30 px-4 py-1.5 rounded-full indigo-glow">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Ingestion Core Live</span>
      </div>
    </header>
  );
}