import { NextResponse } from 'next/server';
import type { NpcMoveRequest, NpcMoveResponse } from '@/lib/swarm/schema';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<NpcMoveRequest>;

  if (!body.userId || !body.platform || !body.prompt || !body.source) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const response: NpcMoveResponse = {
    narrative: `⟪VAULT33 NODE ACK⟫ ${body.prompt} → the corridor hums; echoes align as WL resonance builds.`,
    wlDelta: 5,
    project: 'VAULT33'
  };

  return NextResponse.json(response);
}
