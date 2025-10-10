# WIRED CHAOS / CODEX - SWARM Event Logger
# Usage: node scripts/swarm/log.js --event "deploy:complete" --env production

const fetch = require('node-fetch');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { event, env = 'staging' } = yargs(hideBin(process.argv)).argv;
const token = process.env.SWARM_NOTION_TOKEN;
const db = process.env.SWARM_DB_ID;

if (!token || !db) {
  console.error('Missing SWARM_NOTION_TOKEN or SWARM_DB_ID');
  process.exit(1);
}

const body = {
  parent: { database_id: db },
  properties: {
    "Title": { title: [{ text: { content: event } }] },
    "Type":  { select: { name: "DeployEvent" } },
    "Environment": { select: { name: env } },
    "Status": { status: { name: "Active" } },
    "Last Sync": { date: { start: new Date().toISOString() } }
  }
};

fetch('https://api.notion.com/v1/pages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
}).then(async r => {
  if (!r.ok) {
    console.error('SWARM log failed', await r.text());
    process.exit(1);
  }
  console.log('[SWARM] logged:', event);
});
