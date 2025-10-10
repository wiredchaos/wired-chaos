import type { ReactNode } from 'react';

interface GlassCardProps {
  title: string;
  children: ReactNode;
}

export default function GlassCard({ title, children }: GlassCardProps) {
  return (
    <section className="glass p-6 rounded-glass text-white">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-wc-cyan">{title}</h3>
        <span className="wc-chip wc-chip--ok">SLO <b>99.9%</b></span>
      </header>
      <div>{children}</div>
    </section>
  );
}
