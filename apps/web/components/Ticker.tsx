'use client';

import { useEffect, useState } from 'react';
import type { TickerItem } from '@/lib/swarm/schema';

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/ticker');
        if (!res.ok) {
          throw new Error('Failed to load ticker');
        }
        const data = await res.json();
        setItems(data.items || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTicker();
  }, []);

  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/40 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">WL Event Ticker</h2>
        <span className="text-xs text-slate-400">Live feed</span>
      </div>
      {loading && <p className="text-sm text-slate-400">Loading ticker...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between rounded-lg bg-slate-800/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-400">
                  {item.project} • {item.platform} • {item.source}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${item.delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {item.delta > 0 ? '+' : ''}
                  {item.delta}
                </p>
                <p className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</p>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="text-sm text-slate-400">No events yet.</li>}
        </ul>
      )}
    </div>
  );
}
