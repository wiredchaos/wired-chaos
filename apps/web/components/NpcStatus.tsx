'use client';

import { useEffect, useState } from 'react';
import type { HealthStatus } from '@/lib/swarm/schema';

export default function NpcStatus() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) {
          throw new Error('Failed to load health');
        }
        const data: HealthStatus = await res.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadHealth();
  }, []);

  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/40 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">NPC & Swarm Health</h2>
        <span
          className={`h-2 w-2 rounded-full inline-block ${
            status?.status === 'ok' ? 'bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]' : 'bg-amber-400'
          }`}
          aria-label={`Status ${status?.status ?? 'unknown'}`}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!error && status && (
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-slate-400">NPC Sessions Today</p>
            <p className="text-xl font-semibold">{status.npcSessionsToday}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-slate-400">XP Events Today</p>
            <p className="text-xl font-semibold">{status.xpEventsToday}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-slate-400">Swarm Agents Online</p>
            <p className="text-xl font-semibold">{status.swarmAgentsOnline}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-slate-400">Status</p>
            <p className="text-xl font-semibold capitalize">{status.status}</p>
          </div>
        </div>
      )}
      {!error && !status && <p className="text-sm text-slate-400">Loading status...</p>}
    </div>
  );
}
