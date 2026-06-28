import React from "react";
import { staticDatasets } from "../data/mockData";
import { SectionTitle } from "../components/ui/SectionTitle";

export function Datasets() {
  return (
    <div>
      <SectionTitle
        title="Golden Datasets"
        description="Store verified, immutable ground-truth strings for isolated optimization passes."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staticDatasets.map((dataset) => (
          <div
            key={dataset.id}
            className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl hover:border-white/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {dataset.name}
              </h3>
              <span className="text-xs font-mono bg-white/5 text-slate-300 px-2 py-0.5 rounded">
                {dataset.version}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-500 block mb-6">
              {dataset.id}
            </span>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs font-mono">
              <div>
                <div className="text-slate-500 uppercase mb-0.5">
                  Payload Assertions
                </div>
                <div className="text-sm font-bold text-white">
                  {dataset.rows.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 uppercase mb-0.5">
                  Active Pipelines
                </div>
                <div className="text-sm font-bold text-cyan-400">
                  {dataset.linkEvals} runs
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

