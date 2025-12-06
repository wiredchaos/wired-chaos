import { NextResponse } from 'next/server';
import type { SwarmEventRequest } from '@/lib/swarm/schema';
import { agents } from '@/lib/swarm/agents';

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<SwarmEventRequest>;

  if (!payload.agentId || !payload.eventType || payload.payload === undefined) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const knownAgent = agents.find((agent) => agent.id === payload.agentId);
  if (!knownAgent) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log(`[SWARM EVENT:${payload.agentId}]`, payload.eventType, JSON.stringify(payload.payload));

  return NextResponse.json({ ok: true });
}
