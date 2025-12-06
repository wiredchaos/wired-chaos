import NpcStatus from '@/components/NpcStatus';
import ProjectTabs from '@/components/ProjectTabs';
import SwarmAgents from '@/components/SwarmAgents';
import Ticker from '@/components/Ticker';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">VRG33589 × VAULT33</p>
        <h1 className="text-3xl sm:text-4xl font-semibold">WIRED CHAOS META — NEURO SWARM CONTROL PLANE</h1>
        <p className="text-sm text-slate-400">WL, NPC, and Agent State</p>
      </header>

      <section className="grid gap-6">
        <Ticker />
        <ProjectTabs />
        <NpcStatus />
        <SwarmAgents />
      </section>
    </div>
  );
}
