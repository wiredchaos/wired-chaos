'use client';

import { useState } from 'react';

const PROJECTS = {
  VRG33589: {
    name: 'VRG33589',
    description: 'Signal space for emergent sentinels and uplinks.',
    thresholds: ['Signal Carrier ≥ 333', 'Beacon ≥ 589']
  },
  VAULT33: {
    name: 'VAULT33',
    description: 'Gatewatchers guarding the vault and keyholders.',
    thresholds: ['Gatewatcher ≥ 333', 'Keyholder ≥ 589']
  }
};

type ProjectKey = keyof typeof PROJECTS;

export default function ProjectTabs() {
  const [active, setActive] = useState<ProjectKey>('VRG33589');
  const project = PROJECTS[active];

  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/40 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        {Object.keys(PROJECTS).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key as ProjectKey)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              active === key
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500'
            }`}
          >
            {PROJECTS[key as ProjectKey].name}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-300">{project.description}</p>
        <ul className="text-sm text-slate-200 list-disc list-inside space-y-1">
          {project.thresholds.map((threshold) => (
            <li key={threshold}>{threshold}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
