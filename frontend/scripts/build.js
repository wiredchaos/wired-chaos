#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

if (process.env.SKIP_TAILWIND_BUILD === '1') {
  console.log('[frontend] SKIP_TAILWIND_BUILD=1 — skipping Tailwind build step for tests.');
  process.exit(0);
}

const cracoBin = require.resolve('@craco/craco/dist/bin/craco.js');
const result = spawnSync(process.execPath, [cracoBin, 'build'], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
