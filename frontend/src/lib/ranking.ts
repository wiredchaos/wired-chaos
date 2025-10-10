/**
 * Persona-Based Provider Ranking System
 * 4 Presets: Builder, Analyst, Trader, Security
 * 7 Criteria: Reliability, Free Quota, Multi-chain, Real-time, Docs, Community, Rate Limits
 */

export interface ProviderCriteria {
  reliability: number;
  freeQuota: number;
  multiChain: number;
  realTime: number;
  docs: number;
  community: number;
  rateLimits: number;
}

export interface PersonaWeights extends ProviderCriteria {}

export interface Provider {
  id: string;
  name: string;
  category: string;
  description: string;
  chains: string[];
  tier: string;
  website: string;
  signupUrl: string;
  criteria: ProviderCriteria;
  score?: number;
}

export type PersonaType = 'builder' | 'analyst' | 'trader' | 'security';

/**
 * Persona Weight Presets
 */
export const PERSONA_PRESETS: Record<PersonaType, PersonaWeights> = {
  builder: {
    reliability: 10,
    freeQuota: 8,
    multiChain: 8,
    realTime: 6,
    docs: 9,
    community: 7,
    rateLimits: 6
  },
  analyst: {
    reliability: 8,
    freeQuota: 7,
    multiChain: 9,
    realTime: 7,
    docs: 8,
    community: 7,
    rateLimits: 6
  },
  trader: {
    reliability: 7,
    freeQuota: 6,
    multiChain: 7,
    realTime: 10,
    docs: 6,
    community: 6,
    rateLimits: 6
  },
  security: {
    reliability: 10,
    freeQuota: 6,
    multiChain: 7,
    realTime: 8,
    docs: 8,
    community: 6,
    rateLimits: 9
  }
};

/**
 * Calculate personalized provider score
 */
export function calculateProviderScore(
  criteria: ProviderCriteria,
  weights: PersonaWeights
): number {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  
  let weightedSum = 0;
  const keys = Object.keys(criteria) as (keyof ProviderCriteria)[];
  
  for (const key of keys) {
    const criteriaValue = criteria[key];
    const weight = weights[key];
    weightedSum += criteriaValue * weight;
  }
  
  // Normalize to 0-100 scale
  const maxPossible = 10 * totalWeight;
  return Math.round((weightedSum / maxPossible) * 100);
}

/**
 * Rank providers based on persona weights
 */
export function rankProviders(
  providers: Provider[],
  weights: PersonaWeights
): Provider[] {
  return providers
    .map(provider => ({
      ...provider,
      score: calculateProviderScore(provider.criteria, weights)
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Get persona preset by name
 */
export function getPersonaPreset(persona: PersonaType): PersonaWeights {
  return PERSONA_PRESETS[persona];
}

/**
 * Criteria labels and descriptions
 */
export const CRITERIA_INFO: Record<keyof ProviderCriteria, { label: string; description: string }> = {
  reliability: {
    label: 'Reliability',
    description: 'Uptime and service stability'
  },
  freeQuota: {
    label: 'Free Quota',
    description: 'Generosity of free tier limits'
  },
  multiChain: {
    label: 'Multi-chain',
    description: 'Number of blockchains supported'
  },
  realTime: {
    label: 'Real-time',
    description: 'Speed and freshness of data'
  },
  docs: {
    label: 'Documentation',
    description: 'Quality of API documentation'
  },
  community: {
    label: 'Community',
    description: 'Active community and support'
  },
  rateLimits: {
    label: 'Rate Limits',
    description: 'Flexibility of rate limiting'
  }
};
