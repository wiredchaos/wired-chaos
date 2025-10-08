#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('apps', {
      type: 'string',
      demandOption: true,
      describe: 'Comma separated list of apps being validated',
    })
    .option('slo-url', {
      type: 'string',
      demandOption: true,
      describe: 'URL returning the SLO badge JSON payload',
    })
    .option('min', {
      type: 'number',
      default: 99.0,
      describe: 'Minimum acceptable SLO score',
    })
    .option('window', {
      type: 'string',
      describe: 'Optional reporting window label for logging purposes',
    })
    .strict()
    .help()
    .argv;

  const apps = String(argv.apps)
    .split(',')
    .map((app) => app.trim())
    .filter(Boolean);

  if (apps.length === 0) {
    throw new Error('No apps provided to validate.');
  }

  const sloUrl = argv['slo-url'];

  if (!sloUrl) {
    throw new Error('Missing --slo-url argument.');
  }

  const response = await fetch(sloUrl);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SLO endpoint responded with ${response.status}: ${body}`);
  }

  const payload = await response.json();
  const score = Number(
    payload.score ?? payload.uptime ?? payload.value ?? Number.NaN
  );

  if (!Number.isFinite(score)) {
    throw new Error('Unable to determine SLO score from response payload.');
  }

  const windowLabel = argv.window ? ` (${argv.window})` : '';
  console.log(`SLO score${windowLabel}: ${score}`);

  if (score < Number(argv.min)) {
    throw new Error(
      `SLO below threshold (${score} < ${argv.min}) for ${apps.join(', ')}`
    );
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
