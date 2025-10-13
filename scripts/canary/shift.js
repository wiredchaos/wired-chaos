#!/usr/bin/env node
'use strict';

const path = require('path');
const { parseArgs } = require('../orchestrator/lib/args');
const { writeReport } = require('../orchestrator/lib/report');

function parseApps(value) {
  if (!value) {
    return [];
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const apps = parseApps(args.apps);
  const pct = Number(args.pct || 0);
  const output = args['json-output'];

  const result = {
    action: 'canary-shift',
    apps,
    percentage: pct,
    status: 'success',
    timestamp: new Date().toISOString(),
    notes: 'Stub canary shift executed. Integrate with traffic manager when ready.',
  };

  console.log(`[canary-shift] Adjusting canary traffic to ${pct}% for apps: ${apps.join(', ') || 'none'}`);
  console.log('[canary-shift] Canary shift completed (stub mode).');

  if (output) {
    const resolved = path.resolve(process.cwd(), output);
    writeReport(resolved, result);
  }
}

main();
