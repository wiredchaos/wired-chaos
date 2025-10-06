#!/usr/bin/env node
'use strict';

const path = require('path');
const { parseArgs } = require('../orchestrator/lib/args');
const { writeReport } = require('../orchestrator/lib/report');

function main() {
  const args = parseArgs(process.argv.slice(2));
  const app = args.app || 'unspecified';
  const flag = args.flag || 'CanaryEnabled=false';
  const output = args['json-output'];

  const payload = {
    action: 'flag-set',
    app,
    flag,
    status: 'success',
    timestamp: new Date().toISOString(),
    notes: 'Stub feature flag update. Connect to flag service when ready.',
  };

  console.log(`[flags-set] ${app} -> ${flag}`);
  console.log('[flags-set] Flag updated (stub mode).');

  if (output) {
    const resolved = path.resolve(process.cwd(), output);
    writeReport(resolved, payload);
  }
}

main();
