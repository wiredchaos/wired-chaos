#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const env = { ...process.env, SKIP_TAILWIND_BUILD: '1' };
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'frontend:build'], {
  stdio: 'inherit',
  env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('Build test completed successfully');
