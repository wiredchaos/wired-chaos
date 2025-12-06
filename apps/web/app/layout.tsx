import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WIRED CHAOS META — NEURO SWARM CONTROL PLANE',
  description: 'VRG33589 × VAULT33 • WL, NPC, and Agent State'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
          {children}
        </main>
      </body>
    </html>
  );
}
