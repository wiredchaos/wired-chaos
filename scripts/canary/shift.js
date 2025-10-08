#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('apps', {
    type: 'string',
    demandOption: true,
    describe: 'Comma separated list of app identifiers to shift',
  })
  .option('pct', {
    type: 'number',
    demandOption: true,
    describe: 'Desired canary traffic percentage',
  })
  .strict()
  .help()
  .argv;

const apps = String(argv.apps)
  .split(',')
  .map((app) => app.trim())
  .filter(Boolean);

if (apps.length === 0) {
  console.error('No apps provided for canary shift.');
  process.exit(1);
}

const pct = Number.isFinite(argv.pct) ? argv.pct : Number(argv.pct);

if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
  console.error('Invalid pct value. Provide a percentage between 0 and 100.');
  process.exit(1);
}

for (const app of apps) {
  console.log(`[canary] ${app} -> ${pct}%`);
}

process.exit(0);
