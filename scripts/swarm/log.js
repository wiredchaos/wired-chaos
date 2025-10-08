#!/usr/bin/env node

const { argv, exit } = require('node:process');

function parseArgs() {
  const args = {};
  const extras = [];
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      extras.push(token);
      continue;
    }
    const eqIndex = token.indexOf('=');
    if (eqIndex !== -1) {
      const key = token.slice(2, eqIndex);
      const value = token.slice(eqIndex + 1);
      args[key] = value;
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  if (extras.length > 0) {
    args._ = extras;
  }
  return args;
}

function normalizeEnvironment(args) {
  if (args.env) {
    return args.env;
  }
  if (args.environment) {
    return args.environment;
  }
  return undefined;
}

function buildMeta(args) {
  const reserved = new Set(['event', 'env', 'environment', '_']);
  const meta = {};
  Object.entries(args).forEach(([key, value]) => {
    if (reserved.has(key)) {
      return;
    }
    meta[key] = value;
  });
  return meta;
}

function main() {
  const args = parseArgs();
  const event = args.event;
  const environment = normalizeEnvironment(args);

  if (!event) {
    console.error('[swarm] missing required --event argument');
    exit(1);
  }

  const payload = {
    timestamp: new Date().toISOString(),
    event,
    environment: environment || 'unknown',
    meta: buildMeta(args),
  };

  console.log(`[swarm] ${payload.timestamp} :: ${payload.event} :: env=${payload.environment}`);
  if (Object.keys(payload.meta).length > 0) {
    console.log(`[swarm] meta -> ${JSON.stringify(payload.meta)}`);
  }
}

main();
