#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const REQUIRED_SECRETS = [
  'WIX_API_KEY',
  'WIX_SITE_ID',
  'WIX_SYNC_ENDPOINT',
  'GAMMA_TOKEN',
  'GAMMA_SPACE_ID',
  'SWARM_NOTION_TOKEN',
  'SWARM_DB_ID',
  'NOTION_SLO_BADGE_URL',
];

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJsonIfRequested(filePath, payload) {
  if (!filePath) {
    return;
  }

  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote orchestrator artifact to ${filePath}`);
}

function discoverPipelineArtifacts() {
  const files = ['codex.pipeline.yaml', 'codex.agents.yaml', 'codex.secrets.yaml'];
  const root = process.cwd();

  return files.map((file) => {
    const fullPath = path.join(root, file);
    return {
      file,
      exists: fs.existsSync(fullPath),
    };
  });
}

function main() {
  const argv = yargs(hideBin(process.argv))
    .option('summary-only', {
      type: 'boolean',
      default: false,
      describe: 'Collect rollout readiness data without triggering actions',
    })
    .option('json-output', {
      type: 'string',
      describe: 'Write readiness data to the provided JSON file path',
    })
    .option('skip-pipeline', {
      type: 'boolean',
      default: false,
      describe: 'Skip Codex pipeline artifact validation checks',
    })
    .strict()
    .help()
    .argv;

  const environment = process.env.ENVIRONMENT || 'staging';
  const timestamp = new Date().toISOString();

  const missingSecrets = REQUIRED_SECRETS.filter((key) => {
    const value = process.env[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  const pipelineArtifacts = argv['skip-pipeline'] ? [] : discoverPipelineArtifacts();
  const missingPipelineArtifacts = pipelineArtifacts
    .filter((item) => !item.exists)
    .map((item) => item.file);

  const ready = missingSecrets.length === 0 && missingPipelineArtifacts.length === 0;

  const payload = {
    timestamp,
    environment,
    summaryOnly: argv['summary-only'],
    pipelineValidationSkipped: argv['skip-pipeline'],
    secrets: {
      required: REQUIRED_SECRETS,
      missing: missingSecrets,
    },
    pipelineArtifacts,
    ready,
    recommendedNextSteps: ready
      ? [
          'Run wix build: node scripts/wix/build.js --tag <tag>',
          'Run gamma build: pnpm -C apps/gamma install && pnpm -C apps/gamma build',
          'Execute Codex dual deploy pipeline for staged rollout',
        ]
      : [],
  };

  if (missingSecrets.length > 0) {
    console.error('Missing required secrets:', missingSecrets.join(', '));
  } else {
    console.log('All required secrets present.');
  }

  if (!argv['skip-pipeline']) {
    if (missingPipelineArtifacts.length > 0) {
      console.error(
        'Missing Codex pipeline artifacts:',
        missingPipelineArtifacts.join(', ')
      );
    } else {
      console.log('Codex pipeline artifacts located.');
    }
  }

  console.log(`Environment: ${environment}`);
  console.log(`Summary mode: ${argv['summary-only'] ? 'enabled' : 'disabled'}`);

  if (ready) {
    console.log('Rollout preflight checks passed.');
  } else {
    console.error('Rollout preflight checks failed.');
  }

  writeJsonIfRequested(argv['json-output'], payload);

  if (!ready) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
