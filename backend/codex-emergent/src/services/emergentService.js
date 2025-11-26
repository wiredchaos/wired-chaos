const crypto = require('node:crypto');

class EmergentService {
  constructor(config) {
    this.config = config;
    this.sessions = new Map();
    this.trendSignals = [];
    this.currentSyncToken = null;
    this.lastSyncedAt = null;
  }

  createSession({ mode, creators, prompt, objectives }) {
    if (!mode || !this.config.interaction_modes[mode]) {
      throw new Error('Unsupported interaction mode');
    }
    if (!Array.isArray(creators) || creators.length === 0) {
      throw new Error('At least one creator is required');
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const session = {
      id,
      mode,
      creators,
      prompt,
      objectives: objectives || [],
      outputs: [],
      metrics: {
        engagementScore: 0,
        viewerSentiment: 0,
        revenueProjection: 0,
      },
      revenuePolicy: {
        creatorSplit: Number(this.config.revenue_policy.creator_split),
        platformSplit: Number(this.config.revenue_policy.platform_split),
        payoutCycleDays: this.config.revenue_policy.auto_payout_cycle_days,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(id, session);
    return session;
  }

  recordOutput(sessionId, output) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    session.outputs.push({
      ...output,
      recordedAt: new Date().toISOString(),
    });
    session.updatedAt = new Date().toISOString();
    return session;
  }

  updateMetrics(sessionId, metrics) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    session.metrics = {
      ...session.metrics,
      ...metrics,
    };
    session.updatedAt = new Date().toISOString();
    return session;
  }

  listSessions() {
    return Array.from(this.sessions.values());
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  recordTrend({ signal, description, priority }) {
    if (!signal) {
      throw new Error('Trend signal is required');
    }
    const record = {
      signal,
      description: description || '',
      priority: priority || 'medium',
      recordedAt: new Date().toISOString(),
    };
    this.trendSignals.push(record);
    return record;
  }

  updateSyncToken(token) {
    this.currentSyncToken = token;
    this.lastSyncedAt = new Date().toISOString();
  }

  getStatus() {
    return {
      moduleId: this.config.module_id,
      name: this.config.name,
      version: this.config.version,
      activeSessions: this.sessions.size,
      trendSignals: this.trendSignals.length,
      lastSyncedAt: this.lastSyncedAt,
    };
  }
}

module.exports = EmergentService;
