const http = require('node:http');
const { URL } = require('node:url');

const { loadConfig } = require('./config');
const CodexService = require('./services/codexService');
const EmergentService = require('./services/emergentService');
const { SyncManager } = require('./sync/syncManager');

const JSON_LIMIT_BYTES = 1 * 1024 * 1024;

function normalizePathname(pathname) {
  if (pathname === '/') {
    return '/';
  }
  return pathname.replace(/\/+$/g, '') || '/';
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > JSON_LIMIT_BYTES) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      const buffer = Buffer.concat(chunks);
      try {
        const parsed = JSON.parse(buffer.toString('utf-8'));
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    req.on('error', reject);
  });
}

function securityHeaders() {
  return {
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
  };
}

function corsHeaders(origin, allowedOrigins) {
  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin || '*',
      'Vary': 'Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    };
  }
  return {};
}

function sendJson(res, statusCode, body, baseHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    ...securityHeaders(),
    ...baseHeaders,
  });
  res.end(payload);
}

function notFound(res, headers) {
  sendJson(res, 404, { error: 'NotFound' }, headers);
}

function methodNotAllowed(res, headers) {
  sendJson(res, 405, { error: 'MethodNotAllowed' }, headers);
}

function validationError(res, details, headers) {
  sendJson(res, 400, { error: 'ValidationError', details }, headers);
}

function createServer() {
  const config = loadConfig();
  const codexService = new CodexService(config.wiredchaos_modules.codex);
  const emergentService = new EmergentService(config.wiredchaos_modules.emergent);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((value) => value.trim());

  const syncManager = new SyncManager({
    codexService,
    emergentService,
    intervalMs: Number(process.env.CODEX_EMERGENT_SYNC_MS || 24 * 60 * 60 * 1000),
  });
  syncManager.start();

  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin;
    const baseHeaders = corsHeaders(origin, allowedOrigins);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        ...securityHeaders(),
        ...baseHeaders,
      });
      res.end();
      return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = normalizePathname(requestUrl.pathname);
    const segments = pathname.split('/').filter(Boolean);

    try {
      if (pathname === '/health' && req.method === 'GET') {
        sendJson(res, 200, {
          status: 'ok',
          apiVersion: config.global_settings.api_version,
          modules: {
            codex: codexService.getStatus(),
            emergent: emergentService.getStatus(),
          },
          timestamp: new Date().toISOString(),
        }, baseHeaders);
        return;
      }

      if (segments[0] === 'codex') {
        await handleCodexRoute({ req, res, segments: segments.slice(1), baseHeaders, codexService });
        return;
      }

      if (segments[0] === 'emergent') {
        await handleEmergentRoute({ req, res, segments: segments.slice(1), baseHeaders, emergentService });
        return;
      }

      notFound(res, baseHeaders);
    } catch (error) {
      if (error.message === 'Payload too large') {
        sendJson(res, 413, { error: 'PayloadTooLarge' }, baseHeaders);
        return;
      }
      if (error.message === 'Invalid JSON payload') {
        validationError(res, [error.message], baseHeaders);
        return;
      }
      console.error(error);
      sendJson(res, 500, { error: 'InternalServerError' }, baseHeaders);
    }
  });

  return { server, syncManager };
}

async function handleCodexRoute({ req, res, segments, baseHeaders, codexService }) {
  if (segments.length === 0) {
    if (req.method === 'GET') {
      sendJson(res, 200, { status: 'ok', module: codexService.getStatus() }, baseHeaders);
      return;
    }
    methodNotAllowed(res, baseHeaders);
    return;
  }

  if (segments[0] === 'creators') {
    if (req.method !== 'POST') {
      methodNotAllowed(res, baseHeaders);
      return;
    }
    const body = await readRequestBody(req);
    const errors = [];
    if (!body || typeof body.wallet !== 'string' || !body.wallet.trim()) {
      errors.push('wallet is required');
    }
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('name is required');
    }
    if (errors.length) {
      validationError(res, errors, baseHeaders);
      return;
    }
    const creator = codexService.registerCreator({
      wallet: body.wallet.trim(),
      name: body.name.trim(),
      role: typeof body.role === 'string' ? body.role.trim() : undefined,
    });
    sendJson(res, 201, creator, baseHeaders);
    return;
  }

  if (segments[0] === 'lore') {
    if (segments.length === 1 && req.method === 'GET') {
      sendJson(res, 200, codexService.listLoreEntries(), baseHeaders);
      return;
    }
    if (segments.length === 1 && req.method === 'POST') {
      const body = await readRequestBody(req);
      const errors = [];
      if (!body || typeof body.title !== 'string' || !body.title.trim()) {
        errors.push('title is required');
      }
      if (!body || typeof body.body !== 'string' || !body.body.trim()) {
        errors.push('body is required');
      }
      if (!body || typeof body.createdBy !== 'string' || !body.createdBy.trim()) {
        errors.push('createdBy is required');
      }
      if (errors.length) {
        validationError(res, errors, baseHeaders);
        return;
      }
      const entry = codexService.createLoreEntry({
        title: body.title.trim(),
        synopsis: typeof body.synopsis === 'string' ? body.synopsis : undefined,
        body: body.body,
        tags: Array.isArray(body.tags) ? body.tags.filter((tag) => typeof tag === 'string') : [],
        createdBy: body.createdBy.trim(),
      });
      sendJson(res, 201, entry, baseHeaders);
      return;
    }
    if (segments.length === 2 && req.method === 'PATCH') {
      const id = segments[1];
      const body = await readRequestBody(req) || {};
      try {
        const entry = codexService.updateLoreEntry(id, body);
        sendJson(res, 200, entry, baseHeaders);
      } catch (error) {
        if (error.message === 'Lore entry not found') {
          notFound(res, baseHeaders);
          return;
        }
        throw error;
      }
      return;
    }
    methodNotAllowed(res, baseHeaders);
    return;
  }

  if (segments[0] === 'metadata') {
    if (segments.length === 1 && req.method === 'GET') {
      sendJson(res, 200, codexService.getMetadataLog(), baseHeaders);
      return;
    }
    if (segments.length === 1 && req.method === 'POST') {
      const body = await readRequestBody(req);
      const errors = [];
      if (!body || typeof body.assetId !== 'string' || !body.assetId.trim()) {
        errors.push('assetId is required');
      }
      if (!body || typeof body.assetType !== 'string' || !body.assetType.trim()) {
        errors.push('assetType is required');
      }
      if (!body || typeof body.hash !== 'string' || body.hash.length < 16) {
        errors.push('hash is required and must be at least 16 characters');
      }
      if (errors.length) {
        validationError(res, errors, baseHeaders);
        return;
      }
      const record = codexService.registerMetadata({
        assetId: body.assetId.trim(),
        assetType: body.assetType.trim(),
        hash: body.hash,
        createdBy: typeof body.createdBy === 'string' ? body.createdBy.trim() : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
      });
      sendJson(res, 201, record, baseHeaders);
      return;
    }
    methodNotAllowed(res, baseHeaders);
    return;
  }

  notFound(res, baseHeaders);
}

async function handleEmergentRoute({ req, res, segments, baseHeaders, emergentService }) {
  if (segments.length === 0) {
    if (req.method === 'GET') {
      sendJson(res, 200, { status: 'ok', module: emergentService.getStatus() }, baseHeaders);
      return;
    }
    methodNotAllowed(res, baseHeaders);
    return;
  }

  if (segments[0] === 'sessions') {
    if (segments.length === 1 && req.method === 'GET') {
      sendJson(res, 200, emergentService.listSessions(), baseHeaders);
      return;
    }
    if (segments.length === 1 && req.method === 'POST') {
      const body = await readRequestBody(req);
      const errors = [];
      if (!body || typeof body.mode !== 'string' || !body.mode.trim()) {
        errors.push('mode is required');
      }
      if (!body || !Array.isArray(body.creators) || body.creators.length === 0) {
        errors.push('creators must be a non-empty array');
      }
      if (!body || typeof body.prompt !== 'string' || !body.prompt.trim()) {
        errors.push('prompt is required');
      }
      if (errors.length) {
        validationError(res, errors, baseHeaders);
        return;
      }
      try {
        const session = emergentService.createSession({
          mode: body.mode.trim(),
          creators: body.creators.filter((creator) => typeof creator === 'string' && creator.trim()).map((creator) => creator.trim()),
          prompt: body.prompt,
          objectives: Array.isArray(body.objectives)
            ? body.objectives.filter((objective) => typeof objective === 'string')
            : [],
        });
        sendJson(res, 201, session, baseHeaders);
      } catch (error) {
        validationError(res, [error.message], baseHeaders);
      }
      return;
    }
    if (segments.length === 2 && req.method === 'GET') {
      const session = emergentService.getSession(segments[1]);
      if (!session) {
        notFound(res, baseHeaders);
        return;
      }
      sendJson(res, 200, session, baseHeaders);
      return;
    }
    if (segments.length === 2 && req.method === 'POST') {
      methodNotAllowed(res, baseHeaders);
      return;
    }
    if (segments.length === 3 && segments[2] === 'output' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const errors = [];
      if (!body || typeof body.type !== 'string' || !body.type.trim()) {
        errors.push('type is required');
      }
      if (!body || typeof body.uri !== 'string' || !body.uri.trim()) {
        errors.push('uri is required');
      }
      if (errors.length) {
        validationError(res, errors, baseHeaders);
        return;
      }
      try {
        const updated = emergentService.recordOutput(segments[1], {
          type: body.type.trim(),
          uri: body.uri.trim(),
          metadata: typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : undefined,
        });
        sendJson(res, 201, updated, baseHeaders);
      } catch (error) {
        if (error.message === 'Session not found') {
          notFound(res, baseHeaders);
          return;
        }
        throw error;
      }
      return;
    }
    if (segments.length === 3 && segments[2] === 'metrics' && req.method === 'POST') {
      const body = await readRequestBody(req);
      if (!body || typeof body !== 'object') {
        validationError(res, ['metrics payload is required'], baseHeaders);
        return;
      }
      const metrics = {};
      if (typeof body.engagementScore === 'number') {
        metrics.engagementScore = body.engagementScore;
      }
      if (typeof body.viewerSentiment === 'number') {
        metrics.viewerSentiment = body.viewerSentiment;
      }
      if (typeof body.revenueProjection === 'number') {
        metrics.revenueProjection = body.revenueProjection;
      }
      try {
        const updated = emergentService.updateMetrics(segments[1], metrics);
        sendJson(res, 200, updated, baseHeaders);
      } catch (error) {
        if (error.message === 'Session not found') {
          notFound(res, baseHeaders);
          return;
        }
        throw error;
      }
      return;
    }
    methodNotAllowed(res, baseHeaders);
    return;
  }

  if (segments[0] === 'trends' && segments.length === 1 && req.method === 'POST') {
    const body = await readRequestBody(req);
    const errors = [];
    if (!body || typeof body.signal !== 'string' || !body.signal.trim()) {
      errors.push('signal is required');
    }
    if (errors.length) {
      validationError(res, errors, baseHeaders);
      return;
    }
    try {
      const record = emergentService.recordTrend({
        signal: body.signal.trim(),
        description: typeof body.description === 'string' ? body.description : undefined,
        priority: typeof body.priority === 'string' ? body.priority : undefined,
      });
      sendJson(res, 201, record, baseHeaders);
    } catch (error) {
      validationError(res, [error.message], baseHeaders);
    }
    return;
  }

  notFound(res, baseHeaders);
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4200);
  const { server, syncManager } = createServer();
  server.listen(port, () => {
    console.log(`Codex & Emergent gateway running on port ${port}`);
  });

  const shutdown = () => {
    console.log('Shutting down Codex & Emergent gateway');
    syncManager.stop();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { createServer };
