export type SwarmAgent = {
  id: string;
  name: string;
  role: string;
  description: string;
};

export const agents: SwarmAgent[] = [
  {
    id: 'META_X',
    name: 'META_X',
    role: 'Swarm General and orchestrator',
    description: 'Routes signals between shards, balancing lore, safety, and throughput.'
  },
  {
    id: 'KIBA',
    name: 'KIBA',
    role: 'Onboarding and UX Guide',
    description: 'Welcomes initiates, aligns expectations, and teaches WL rituals.'
  },
  {
    id: 'SHADOWLUX',
    name: 'SHADOWLUX',
    role: 'Moderation and Safety',
    description: 'Filters harmful pulses, protects comms, and preserves community intent.'
  },
  {
    id: 'GRYMM',
    name: 'GRYMM',
    role: 'WL & Ledger / Ticker',
    description: 'Tracks deltas, ledger updates, and emits WL confirmations across the feed.'
  },
  {
    id: 'OYALAN',
    name: 'OYALAN',
    role: 'Governance & WL Tiers',
    description: 'Determines access levels, promotes gatewatchers, and anchors vault keys.'
  },
  {
    id: 'NEUROLUX',
    name: 'NEUROLUX',
    role: 'Lore & ARG',
    description: 'Broadcasts cryptic lore drops, building connective tissue across missions.'
  },
  {
    id: 'UPLINK',
    name: 'UPLINK',
    role: 'Infra & Routing',
    description: 'Ensures network stability, bridges bots to APIs, and keeps the swarm online.'
  }
];
