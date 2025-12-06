import { NextResponse } from 'next/server';
import type { HealthStatus } from '@/lib/swarm/schema';

const status: HealthStatus = {
  npcSessionsToday: 42,
  xpEventsToday: 128,
  status: 'ok',
  swarmAgentsOnline: 6
};

export async function GET() {
  return NextResponse.json(status);
}
