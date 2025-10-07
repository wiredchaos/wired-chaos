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
  const sloUrl = args['slo-url'] || process.env.NOTION_SLO_BADGE_URL || 'not-provided';
  const min = Number(args.min || 0);
  const output = args['json-output'];

  const result = {
    action: 'slo-check',
    apps,
    sloUrl,
    minimum: min,
    status: 'success',
    timestamp: new Date().toISOString(),
    notes: 'Stub SLO check executed. Connect to monitoring provider when ready.',
  };

  console.log(`[slo-check] Validating SLO >= ${min} for apps: ${apps.join(', ') || 'none'} using ${sloUrl}`);
  console.log('[slo-check] SLO check passed (stub mode).');

  if (output) {
    const resolved = path.resolve(process.cwd(), output);
    writeReport(resolved, result);
  }
}

main();
