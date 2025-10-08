#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('event', {
      type: 'string',
      demandOption: true,
      describe: 'Event name to log into SWARM',
    })
    .option('env', {
      type: 'string',
      default: 'staging',
      describe: 'Environment label for the SWARM event',
    })
    .strict()
    .help()
    .argv;

  const token = process.env.SWARM_NOTION_TOKEN;
  const db = process.env.SWARM_DB_ID;

  if (!token || !db) {
    throw new Error(
      'Missing SWARM_NOTION_TOKEN or SWARM_DB_ID environment variables.'
    );
  }

  const body = {
    parent: { database_id: db },
    properties: {
      Title: { title: [{ text: { content: argv.event } }] },
      Type: { select: { name: 'DeployEvent' } },
      Environment: { select: { name: argv.env } },
      Status: { status: { name: 'Active' } },
      'Last Sync': { date: { start: new Date().toISOString() } },
    },
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SWARM log failed: ${response.status} ${text}`);
  }

  console.log(`[SWARM] logged: ${argv.event}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
