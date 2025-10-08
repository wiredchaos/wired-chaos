#!/usr/bin/env node

const { argv, exit } = require('node:process');

function parseArgs() {
  const args = {};
  const flags = [];
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const eqIndex = token.indexOf('=');
    if (eqIndex !== -1) {
      const key = token.slice(2, eqIndex);
      const value = token.slice(eqIndex + 1);
      if (key === 'flag') {
        flags.push(value);
      } else {
        args[key] = value;
      }
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (key === 'flag') {
      if (!next || next.startsWith('--')) {
        console.error('[flags] missing value for --flag');
        exit(1);
      }
      flags.push(next);
      i += 1;
      continue;
    }

    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }

  if (flags.length > 0) {
    args.flag = flags;
  }
  return args;
}

function parseFlagUpdates(rawFlags = []) {
  const updates = [];
  rawFlags.forEach((entry) => {
    const [key, ...rest] = entry.split('=');
    if (!key || rest.length === 0) {
      throw new Error(`invalid flag format: ${entry}`);
    }
    const value = rest.join('=');
    updates.push({ key: key.trim(), value: value.trim() });
  });
  return updates;
}

function main() {
  const args = parseArgs();
  const app = args.app || args.application;
  const rawFlags = Array.isArray(args.flag) ? args.flag : args.flag ? [args.flag] : [];

  if (!app) {
    console.error('[flags] missing required --app argument');
    exit(1);
  }

  if (rawFlags.length === 0) {
    console.error('[flags] at least one --flag key=value pair is required');
    exit(1);
  }

  let updates;
  try {
    updates = parseFlagUpdates(rawFlags);
  } catch (error) {
    console.error(`[flags] ${error.message}`);
    exit(1);
  }

  updates.forEach(({ key, value }) => {
    console.log(`[flags] ${app} :: set ${key}=${value}`);
  });

  if (args.dryRun === 'true' || args['dry-run'] === 'true') {
    console.log('[flags] dry run enabled – no remote update performed');
    return;
  }

  console.log('[flags] updates applied (local simulation)');
}

main();
