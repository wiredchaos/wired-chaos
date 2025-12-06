import { NextResponse } from 'next/server';
import type { TickerItem } from '@/lib/swarm/schema';

const mockItems: TickerItem[] = [
  {
    id: 'evt-001',
    label: 'Beacon ping acknowledged',
    project: 'VRG33589',
    delta: 8,
    source: 'META_X',
    platform: 'web',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  },
  {
    id: 'evt-002',
    label: 'Gatewatcher uplink secured',
    project: 'VAULT33',
    delta: 5,
    source: 'UPLINK',
    platform: 'discord',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    id: 'evt-003',
    label: 'WL ledger adjustment from GRYMM',
    project: 'VRG33589',
    delta: 3,
    source: 'GRYMM',
    platform: 'telegram',
    createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString()
  },
  {
    id: 'evt-004',
    label: 'Lore drop ignites the vault',
    project: 'VAULT33',
    delta: 10,
    source: 'NEUROLUX',
    platform: 'web',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'evt-005',
    label: 'Onboarding pulse validated',
    project: 'VRG33589',
    delta: 2,
    source: 'KIBA',
    platform: 'discord',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
  },
  {
    id: 'evt-006',
    label: 'Moderation filter recalibrated',
    project: 'VAULT33',
    delta: -1,
    source: 'SHADOWLUX',
    platform: 'web',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');
  const platform = searchParams.get('platform');
  const limit = Number(searchParams.get('limit')) || mockItems.length;

  let filtered = [...mockItems];

  if (project) {
    filtered = filtered.filter((item) => item.project === project);
  }

  if (platform) {
    filtered = filtered.filter((item) => item.platform === platform);
  }

  return NextResponse.json({ items: filtered.slice(0, limit) });
}
