#!/usr/bin/env node
'use strict';

const path = require('path');
const { parseArgs } = require('../orchestrator/lib/args');
const { writeReport } = require('../orchestrator/lib/report');

function main() {
  const args = parseArgs(process.argv.slice(2));
  const site = args.site || process.env.WIX_SITE_ID || 'unknown-site';
  const tag = args.tag || 'HEAD';
  const canary = Number(args.canary || 0);
  const output = args['json-output'];

  const result = {
    action: 'wix-deploy',
    site,
    tag,
    canary,
    status: 'success',
    timestamp: new Date().toISOString(),
    notes: 'Stub deploy executed. Implement Wix deployment workflow when ready.',
  };

  console.log(`[wix-deploy] Deploying tag ${tag} to site ${site} at canary ${canary}%`);
  console.log('[wix-deploy] Deployment completed (stub mode).');

  if (output) {
    const resolved = path.resolve(process.cwd(), output);
    writeReport(resolved, result);
  }
}

main();
