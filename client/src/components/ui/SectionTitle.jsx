import React from 'react';

export function SectionTitle({ title, description }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h2>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}