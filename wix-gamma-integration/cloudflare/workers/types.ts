/**
 * WIRED CHAOS - Type Definitions
 * TypeScript type definitions for the integration worker
 */

import { RateLimiter } from './durable-objects/RateLimiter';
import { AuditLogger } from './durable-objects/AuditLogger';

export interface Env {
  // KV Namespaces
  CACHE_KV?: KVNamespace;
  ANALYTICS_KV?: KVNamespace;
  SYNC_KV?: KVNamespace;

  // R2 Buckets
  R2_BUCKET?: R2Bucket;

  // Durable Object Namespaces
  RATE_LIMITER: DurableObjectNamespace;
  AUDIT_LOGGER: DurableObjectNamespace;

  // Secrets
  WIX_API_TOKEN?: string;
  WIX_ACCESS_TOKEN?: string;
  WIX_WEBHOOK_SECRET?: string;
  WIX_SITE_ID?: string;
  WIX_AI_BOT_URL?: string;
  GAMMA_API_KEY?: string;

  // Environment Variables
  ENVIRONMENT?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ErrorDetails | null;
  metadata: {
    timestamp: number;
    [key: string]: unknown;
  };
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: unknown;
}

export interface WixWebhook {
  eventType?: string;
  instanceId?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GitHubWebhook {
  action?: string;
  ref?: string;
  commits?: GitHubCommit[];
  repository?: {
    full_name?: string;
  };
  pusher?: {
    name?: string;
  };
  deployment_status?: {
    state?: string;
    description?: string;
  };
  deployment?: {
    environment?: string;
  };
}

export interface GitHubCommit {
  id: string;
  message: string;
  author?: {
    name?: string;
    email?: string;
  };
}

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
}
