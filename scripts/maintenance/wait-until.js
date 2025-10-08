#!/usr/bin/env node

const { argv, exit } = require('node:process');

function parseArgs() {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) {
      continue;
    }
    const eqIndex = raw.indexOf('=');
    if (eqIndex !== -1) {
      const key = raw.slice(2, eqIndex);
      const value = raw.slice(eqIndex + 1);
      args[key] = value;
      continue;
    }

    const key = raw.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const start = (args.start || '').trim();
  const durationRaw = args.duration || args['duration-min'] || args['maintenance_window_duration_min'];
  const durationMinutes = durationRaw === undefined || durationRaw === '' ? 45 : Number(durationRaw);

  if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
    console.error('[maint] invalid duration minutes:', durationRaw);
    exit(2);
  }

  if (!start) {
    console.log('[maint] no start provided – proceeding immediately');
    return;
  }

  const startTimestamp = Date.parse(start);
  if (Number.isNaN(startTimestamp)) {
    console.error('[maint] invalid ISO start:', start);
    exit(2);
  }

  const now = Date.now();
  const endTimestamp = startTimestamp + durationMinutes * 60 * 1000;

  if (now > endTimestamp) {
    console.error('[maint] window already closed:', new Date(endTimestamp).toISOString());
    exit(3);
  }

  const msUntil = startTimestamp - now;

  if (msUntil > 0) {
    const minutes = Math.ceil(msUntil / 60000);
    console.log(`[maint] waiting ~${minutes}m until window opens at ${new Date(startTimestamp).toISOString()}`);
    await new Promise((resolve) => setTimeout(resolve, msUntil));
  }

  console.log('[maint] window open – proceeding');
}

main().catch((error) => {
  console.error('[maint] unexpected failure:', error);
  exit(1);
});
