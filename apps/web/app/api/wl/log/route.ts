import { NextResponse } from 'next/server';
import type { WlLogRequest } from '@/lib/swarm/schema';

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<WlLogRequest>;

  if (!payload.userId || !payload.platform || !payload.project || payload.delta === undefined || !payload.source) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log('[WL LOG]', JSON.stringify(payload, null, 2));

  return NextResponse.json({ ok: true });
}
