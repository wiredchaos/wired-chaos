const crypto = require('node:crypto');
const EventEmitter = require('node:events');

class SyncManager extends EventEmitter {
  constructor({ codexService, emergentService, intervalMs }) {
    super();
    this.codexService = codexService;
    this.emergentService = emergentService;
    this.intervalMs = intervalMs;
    this.timer = null;
  }

  start() {
    if (this.timer) {
      return;
    }
    this.rotateKey();
    this.timer = setInterval(() => this.rotateKey(), this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  rotateKey() {
    const rawToken = crypto.randomUUID();
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const payload = {
      hash,
      generatedAt: new Date().toISOString(),
    };
    this.codexService.updateSyncToken(payload);
    this.emergentService.updateSyncToken(payload);
    this.emit('sync', payload);
  }
}

module.exports = {
  SyncManager,
};
