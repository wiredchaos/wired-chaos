import { agents } from '@/lib/swarm/agents';

export default function SwarmAgents() {
  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/40 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">NEURO SWARM Agents</h2>
        <span className="text-xs text-slate-400">Autonomous shards</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => (
          <article key={agent.id} className="rounded-lg bg-slate-800/60 p-3 border border-slate-800">
            <p className="text-xs text-emerald-300 uppercase tracking-[0.2em]">{agent.id}</p>
            <h3 className="text-lg font-semibold">{agent.name}</h3>
            <p className="text-sm text-slate-300">{agent.role}</p>
            <p className="text-sm text-slate-400 mt-2">{agent.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
