export type ProjectKey = 'VRG33589' | 'VAULT33';

export type TickerItem = {
  id: string;
  label: string;
  project: ProjectKey;
  delta: number;
  source: string;
  platform: 'discord' | 'telegram' | 'web';
  createdAt: string;
};

export type HealthStatus = {
  npcSessionsToday: number;
  xpEventsToday: number;
  status: 'ok' | 'degraded';
  swarmAgentsOnline: number;
};

export type NpcMoveRequest = {
  userId: string;
  platform: 'discord' | 'telegram' | 'web';
  prompt: string;
  source: string;
};

export type NpcMoveResponse = {
  narrative: string;
  wlDelta: number;
  project: ProjectKey;
};

export type WlLogRequest = {
  userId: string;
  platform: 'discord' | 'telegram' | 'web';
  project: ProjectKey;
  source: string;
  delta: number;
  meta?: Record<string, unknown>;
};

export type SwarmEventRequest = {
  agentId: string;
  eventType: string;
  payload: unknown;
};
