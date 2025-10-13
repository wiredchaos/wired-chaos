#!/usr/bin/env node
'use strict';

const path = require('path');
const { parseArgs } = require('../orchestrator/lib/args');
const { writeReport } = require('../orchestrator/lib/report');

function main() {
  const args = parseArgs(process.argv.slice(2));
  const event = args.event || 'unspecified';
  const env = args.env || process.env.environment || 'staging';
  const data = args.data ? safeParse(args.data) : undefined;
  const output = args['json-output'];

  const payload = {
    action: 'swarm-log',
    event,
    environment: env,
    data: data || null,
    status: 'success',
    timestamp: new Date().toISOString(),
    notes: 'Stub SWARM event logging. Connect to SWARM bridge when ready.',
  };

  console.log(`[swarm-log] event=${event} env=${env}`);
  if (data) {
    console.log(`[swarm-log] data=${JSON.stringify(data)}`);
  }
  console.log('[swarm-log] Log dispatched (stub mode).');

  if (output) {
    const resolved = path.resolve(process.cwd(), output);
    writeReport(resolved, payload);
  }
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { raw };
  }
}

main();
