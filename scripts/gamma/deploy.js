#!/usr/bin/env node
'use strict';

const path = require('path');
const { parseArgs } = require('../orchestrator/lib/args');
const { writeReport } = require('../orchestrator/lib/report');

function main() {
  const args = parseArgs(process.argv.slice(2));
  const space = args.space || process.env.GAMMA_SPACE_ID || 'unknown-space';
  const tag = args.tag || 'HEAD';
  const canary = Number(args.canary || 0);
  const output = args['json-output'];

  const result = {
    action: 'gamma-deploy',
    space,
    tag,
    canary,
    status: 'success',
    timestamp: new Date().toISOString(),
    notes: 'Stub deploy executed. Connect to Gamma deployment APIs when ready.',
  };

  console.log(`[gamma-deploy] Deploying tag ${tag} to space ${space} at canary ${canary}%`);
  console.log('[gamma-deploy] Deployment completed (stub mode).');

  if (output) {
    const resolved = path.resolve(process.cwd(), output);
    writeReport(resolved, result);
  }
}

main();
