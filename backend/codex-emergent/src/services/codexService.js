const crypto = require('node:crypto');

class CodexService {
  constructor(config) {
    this.config = config;
    this.loreEntries = new Map();
    this.metadataLog = [];
    this.creators = new Map();
    this.currentSyncToken = null;
    this.lastSyncedAt = null;
  }

  registerCreator({ wallet, name, role }) {
    if (!wallet || !name) {
      throw new Error('Creator wallet and name are required');
    }
    const normalizedRole = role || 'Creator_Holder';
    this.creators.set(wallet, {
      wallet,
      name,
      role: normalizedRole,
      registeredAt: new Date().toISOString(),
    });
    return this.creators.get(wallet);
  }

  createLoreEntry(payload) {
    const { title, synopsis, body, tags = [], createdBy } = payload;
    if (!title || !body || !createdBy) {
      throw new Error('Lore entry title, body, and creator are required');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const entry = {
      id,
      title,
      synopsis: synopsis || '',
      body,
      tags,
      createdBy,
      createdAt: now,
      updatedAt: now,
      metadataHash: this.createMetadataHash({ id, title, createdBy, tags }),
    };
    this.loreEntries.set(id, entry);
    return entry;
  }

  updateLoreEntry(id, updates) {
    const existing = this.loreEntries.get(id);
    if (!existing) {
      throw new Error('Lore entry not found');
    }
    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.loreEntries.set(id, merged);
    return merged;
  }

  listLoreEntries() {
    return Array.from(this.loreEntries.values());
  }

  createMetadataHash(data) {
    const serialized = JSON.stringify(data);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  registerMetadata({ assetId, assetType, hash, createdBy, description }) {
    if (!assetId || !assetType || !hash) {
      throw new Error('assetId, assetType, and hash are required');
    }

    const record = {
      assetId,
      assetType,
      hash,
      createdBy: createdBy || 'system',
      description: description || '',
      recordedAt: new Date().toISOString(),
    };
    this.metadataLog.push(record);
    return record;
  }

  getMetadataLog() {
    return this.metadataLog.slice(-250);
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
      loreEntries: this.loreEntries.size,
      creators: this.creators.size,
      lastSyncedAt: this.lastSyncedAt,
    };
  }
}

module.exports = CodexService;
