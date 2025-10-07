#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('./lib/args');
const { writeReport } = require('./lib/report');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const REQUIRED_SECRETS = [
  'SWARM_NOTION_TOKEN',
  'SWARM_DB_ID',
  'WIX_API_KEY',
  'WIX_SITE_ID',
  'WIX_SYNC_ENDPOINT',
  'GAMMA_TOKEN',
  'GAMMA_SPACE_ID',
  'NOTION_SLO_BADGE_URL',
];

const OPTIONAL_EMAIL = {
  sendgrid: ['SENDGRID_API_KEY'],
  smtp: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
};

const DEFAULT_BOT_INVENTORY = [
  {
    name: 'SWARM ↔ Emergent Bridge',
    slug: 'swarm-emergent-bridge',
    purpose: 'Unify deploy logs, violations, and SLO data into Notion.',
    inputs: ['GitHub events', 'Gamma events', 'Wix events'],
    outputs: ['Notion DeployEvent pages'],
    triggers: ['Pull requests', 'Tags', 'Manual runs'],
  },
  {
    name: 'Notion→Wix Sync Worker',
    slug: 'notion-wix-sync-worker',
    purpose: 'Mirror Notion database items to the Wix CMS SwarmRegistry collection.',
    inputs: ['Notion database rows'],
    outputs: ['Wix CMS upserts'],
    triggers: ['Scheduled syncs', 'On-demand deploy hooks'],
    endpoint: '/_functions/notionSync',
  },
  {
    name: 'Marketing SWARM',
    slug: 'marketing-swarm',
    purpose: 'Generate campaigns from curated feeds and project memory.',
    inputs: ['Awesome ML & AI OPML feeds', 'X/Twitter discovery', 'Project tags'],
    outputs: ['Post drafts', 'CTA blocks', 'Promo schedules'],
    triggers: ['New feed items', 'Calendar beats'],
  },
  {
    name: 'SEO SWARM',
    slug: 'seo-swarm',
    purpose: 'Deliver keywords, schema.org markup, and Ask Engine Optimization (AEO) assets.',
    inputs: ['Site maps', 'Post drafts', 'X threads'],
    outputs: ['Meta tags', 'JSON-LD documents', 'Alt text', 'Headline tests'],
  },
  {
    name: 'MERCH Line SWARM (University + BeastCoast)',
    slug: 'merch-line-swarm',
    purpose: 'Coordinate print-on-demand plus AR/VR try-on experiences across dual stores.',
    inputs: ['Product specs', 'Size tables', 'Mockups'],
    outputs: ['Wix collections', 'AR assets (GLB/USDZ)', 'SEO content'],
  },
  {
    name: 'Funnel Engine SWARM',
    slug: 'funnel-engine-swarm',
    purpose: 'Provide form builder, conditional logic, and analytics routing.',
    inputs: ['Lead forms', 'UTM parameters', 'Experiment definitions'],
    outputs: ['Dynamic routes', 'Feature flags', 'Dashboards'],
  },
  {
    name: 'RSS LLM-ML Ingest SWARM',
    slug: 'rss-llm-ml-swarm',
    purpose: 'Process OPML feeds through FreshRSS and produce research briefs.',
    inputs: ['arXiv ML', 'BAIR', 'MIT AI', 'Nvidia AI feeds'],
    outputs: ['Briefs', 'Voiceover teasers', 'Prompt drills'],
  },
  {
    name: 'Investor Showcase (Gamma)',
    slug: 'investor-showcase-gamma',
    purpose: 'Maintain Gamma demo pages featuring Neurodivergent HRM and status panels.',
    inputs: ['Emergent LLM key', 'HRM schema'],
    outputs: ['Gamma blocks', 'Investor-ready pages'],
  },
  {
    name: 'Ticket Simulator / Ed-Trading SWARM',
    slug: 'ticket-simulator-swarm',
    purpose: 'Offer paper-trading modules and Telegram bot practice flows.',
    inputs: ['Course modules', 'Simulated tokens ($CHAOS, $NEURO, $VRG)'],
    outputs: ['Dashboards', 'Leaderboards', 'NFT-gated allocations'],
  },
  {
    name: 'DBN → Barbed Wired Broadcasting',
    slug: 'dbn-barbed-wired-broadcasting',
    purpose: 'Produce newsdesk captions and maintain plushy Neuro anchor continuity.',
    inputs: ['External feeds', 'Internal alerts'],
    outputs: ['Short scripts', 'Overlay assets'],
  },
];

function loadEnvFile(envFile) {
  if (!envFile) {
    return {};
  }

  const resolved = path.resolve(process.cwd(), envFile);
  if (!fs.existsSync(resolved)) {
    console.warn(`[orchestrator] Env file not found: ${resolved}`);
    return {};
  }

  const content = fs.readFileSync(resolved, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  });

  return env;
}

function validateSecrets(env) {
  const missing = REQUIRED_SECRETS.filter((key) => !env[key]);

  const email = {
    sendgrid: OPTIONAL_EMAIL.sendgrid.filter((key) => env[key]),
    smtp: OPTIONAL_EMAIL.smtp.filter((key) => env[key]),
  };

  const emailStatus = {
    sendgridConfigured: email.sendgrid.length === OPTIONAL_EMAIL.sendgrid.length,
    smtpConfigured: email.smtp.length === OPTIONAL_EMAIL.smtp.length,
    missing: [],
  };

  if (!emailStatus.sendgridConfigured && !emailStatus.smtpConfigured) {
    emailStatus.missing = OPTIONAL_EMAIL.sendgrid.concat(OPTIONAL_EMAIL.smtp).filter((key) => !env[key]);
  }

  return {
    missing,
    emailStatus,
  };
}

function discoverCanonicalPaths() {
  const canonical = [
    'apps/wix-sync-worker',
    'apps/gamma',
    'scripts',
    '.github/workflows',
    'docs/NOTION_DB_TEMPLATE.json',
    'docs/WIREDCHAOS_PALETTE.md',
  ];

  return canonical.map((relativePath) => {
    const absolutePath = path.join(ROOT_DIR, relativePath);
    return {
      path: relativePath,
      exists: fs.existsSync(absolutePath),
    };
  });
}

function buildComponentGraph() {
  const definitions = [
    {
      name: 'wix-sync-worker',
      path: 'apps/wix-sync-worker',
      buildCmd: 'node scripts/wix/build.js --tag ${version_tag}',
      deployCmd: 'node scripts/wix/deploy.js --site $WIX_SITE_ID --tag ${version_tag} --canary ${canary_pct}',
      dependencies: ['scripts/wix/build.js', 'scripts/wix/deploy.js'],
    },
    {
      name: 'gamma-app',
      path: 'apps/gamma',
      buildCmd: 'pnpm -C apps/gamma install && pnpm -C apps/gamma build',
      deployCmd: 'node scripts/gamma/deploy.js --space $GAMMA_SPACE_ID --tag ${version_tag} --canary ${canary_pct}',
      dependencies: ['scripts/gamma/deploy.js'],
    },
    {
      name: 'notion-sync-worker',
      path: 'scripts/notion',
      buildCmd: 'node scripts/notion/sync.js --dry-run',
      deployCmd: 'node scripts/notion/sync.js',
      dependencies: ['scripts/notion/sync.js'],
    },
  ];

  return definitions.map((definition) => {
    const absolutePath = path.join(ROOT_DIR, definition.path);
    return {
      ...definition,
      exists: fs.existsSync(absolutePath),
    };
  });
}

function discoverAdditionalBots() {
  const roots = ['apps', 'bots'];
  const discovered = [];

  roots.forEach((root) => {
    const rootPath = path.join(ROOT_DIR, root);
    if (!fs.existsSync(rootPath)) {
      return;
    }

    const entries = fs.readdirSync(rootPath, { withFileTypes: true });
    entries.forEach((entry) => {
      if (!entry.isDirectory()) {
        return;
      }

      const slug = `${root}-${entry.name}`;
      if (DEFAULT_BOT_INVENTORY.some((bot) => bot.slug === slug)) {
        return;
      }

      discovered.push({
        name: entry.name,
        slug,
        path: path.join(root, entry.name),
        purpose: 'Discovered automatically. Review to document purpose and integration points.',
        inputs: [],
        outputs: [],
      });
    });
  });

  return discovered;
}

function ensurePipeline(skipCreation) {
  const pipelinePath = path.join(ROOT_DIR, 'codex.pipeline.yaml');
  const exists = fs.existsSync(pipelinePath);

  if (exists) {
    return {
      path: 'codex.pipeline.yaml',
      created: false,
    };
  }

  if (skipCreation) {
    return {
      path: 'codex.pipeline.yaml',
      created: false,
      skipped: true,
    };
  }

  fs.writeFileSync(pipelinePath, createPipelineTemplate(), 'utf8');
  return {
    path: 'codex.pipeline.yaml',
    created: true,
  };
}

function createPipelineTemplate() {
  return `version: 1\n` +
    `name: wired-chaos-dual-canary\n` +
    `description: >\n` +
    `  Dual deploy pipeline orchestrated by Codex with staged canary ramps and SLO gates.\n` +
    `inputs:\n` +
    `  environment: staging\n` +
    `  version_tag: HEAD\n` +
    `stages:\n` +
    `  - name: bootstrap\n` +
    `    steps:\n` +
    `      - run: node scripts/orchestrator/execute.js --summary-only\n` +
    `        displayName: Orchestrator self-check\n` +
    `  - name: deploy_wix\n` +
    `    agent: wix/runner\n` +
    `    steps:\n` +
    `      - run: node scripts/wix/build.js --tag \${version_tag}\n` +
    `      - run: node scripts/wix/deploy.js --site $WIX_SITE_ID --tag \${version_tag} --canary 5\n` +
    `      - run: node scripts/swarm/log.js --event "wix:canary:5" --env \${environment}\n` +
    `  - name: deploy_gamma\n` +
    `    agent: gamma/runner\n` +
    `    steps:\n` +
    `      - run: pnpm -C apps/gamma install && pnpm -C apps/gamma build\n` +
    `      - run: node scripts/gamma/deploy.js --space $GAMMA_SPACE_ID --tag \${version_tag} --canary 5\n` +
    `      - run: node scripts/swarm/log.js --event "gamma:canary:5" --env \${environment}\n` +
    `  - name: canary_ramp\n` +
    `    agent: qa/canary-orchestrator\n` +
    `    steps:\n` +
    `      - run: node scripts/canary/shift.js --apps wix,gamma --pct 5\n` +
    `      - run: node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99\n` +
    `      - run: node scripts/swarm/log.js --event "canary:ramp:5" --env \${environment}\n` +
    `      - run: node scripts/canary/shift.js --apps wix,gamma --pct 25\n` +
    `      - run: node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99\n` +
    `      - run: node scripts/swarm/log.js --event "canary:ramp:25" --env \${environment}\n` +
    `      - run: node scripts/canary/shift.js --apps wix,gamma --pct 50\n` +
    `      - run: node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99\n` +
    `      - run: node scripts/swarm/log.js --event "canary:ramp:50" --env \${environment}\n` +
    `      - run: node scripts/canary/shift.js --apps wix,gamma --pct 100\n` +
    `      - run: node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99\n` +
    `      - run: node scripts/swarm/log.js --event "canary:ramp:100" --env \${environment}\n` +
    `  - name: sync_and_finalize\n` +
    `    steps:\n` +
    `      - run: node scripts/notion/sync.js\n` +
    `      - run: node scripts/flags/set.js --app wix --flag CanaryEnabled=false\n` +
    `      - run: node scripts/flags/set.js --app gamma --flag CanaryEnabled=false\n` +
    `      - run: node scripts/swarm/log.js --event "deploy:complete" --env \${environment}\n`;
}

function buildSummary({ env, secrets, canonicalPaths, componentGraph, botInventory, pipelineInfo }) {
  return {
    environment: env.environment || 'staging',
    secrets,
    canonicalPaths,
    componentGraph,
    botInventory,
    pipeline: pipelineInfo,
    canaryPlan: [5, 25, 50, 100],
    sloGate: {
      url: env.NOTION_SLO_BADGE_URL || null,
      minimum: 99,
    },
    postDeployEvents: ['wix:canary:x', 'gamma:canary:x', 'canary:ramp:xx', 'deploy:complete'],
    timestamp: new Date().toISOString(),
  };
}

function printSummary(summary) {
  console.log('=== Codex Orchestrator Summary ===');
  console.log(`Environment: ${summary.environment}`);
  console.log('--- Secrets ---');
  if (summary.secrets.missing.length === 0) {
    console.log('All required secrets present.');
  } else {
    console.log('Missing secrets:');
    summary.secrets.missing.forEach((key) => console.log(`  - ${key}`));
  }

  if (summary.secrets.emailStatus.sendgridConfigured || summary.secrets.emailStatus.smtpConfigured) {
    console.log('Email channel configured.');
  } else {
    console.log('Optional email configuration missing. Provide one of: SENDGRID_API_KEY or SMTP credentials.');
  }

  console.log('--- Canonical Paths ---');
  summary.canonicalPaths.forEach((entry) => {
    console.log(`${entry.exists ? '✓' : '✗'} ${entry.path}`);
  });

  console.log('--- Component Graph ---');
  summary.componentGraph.forEach((component) => {
    console.log(`${component.exists ? '✓' : '✗'} ${component.name} (${component.path})`);
    console.log(`    build: ${component.buildCmd}`);
    console.log(`    deploy: ${component.deployCmd}`);
  });

  console.log('--- Bot Inventory ---');
  summary.botInventory.forEach((bot) => {
    console.log(`• ${bot.name} [${bot.slug}]`);
    console.log(`    Purpose: ${bot.purpose}`);
    if (bot.path) {
      console.log(`    Path: ${bot.path}`);
    }
  });

  console.log('--- Pipeline ---');
  const pipelineDetails = summary.pipeline;
  if (pipelineDetails.created) {
    console.log(`Materialized pipeline at ${pipelineDetails.path}`);
  } else if (pipelineDetails.skipped) {
    console.log('Pipeline creation skipped.');
  } else {
    console.log(`Pipeline already present at ${pipelineDetails.path}`);
  }

  console.log('--- Canary Plan ---');
  console.log(summary.canaryPlan.join(' → ') + '%');

  console.log('--- SLO Gate ---');
  console.log(`URL: ${summary.sloGate.url || 'not configured'}`);
  console.log(`Minimum: ${summary.sloGate.minimum}`);

  console.log('--- Post-Deploy Events ---');
  summary.postDeployEvents.forEach((evt) => console.log(`  - ${evt}`));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const envFile = args['env-file'];
  const skipPipeline = Boolean(args['skip-pipeline']);
  const jsonOutput = args['json-output'];

  const env = { ...process.env, ...loadEnvFile(envFile) };
  if (args.environment) {
    env.environment = args.environment;
  }

  const secrets = validateSecrets(env);
  const canonicalPaths = discoverCanonicalPaths();
  const componentGraph = buildComponentGraph();
  const additionalBots = discoverAdditionalBots();
  const botInventory = DEFAULT_BOT_INVENTORY.concat(additionalBots);
  const pipelineInfo = ensurePipeline(skipPipeline);

  const summary = buildSummary({ env, secrets, canonicalPaths, componentGraph, botInventory, pipelineInfo });

  if (!args['summary-only']) {
    printSummary(summary);
  } else {
    console.log('Summary generation completed (output suppressed by --summary-only).');
  }

  if (jsonOutput) {
    const resolved = path.resolve(process.cwd(), jsonOutput);
    writeReport(resolved, summary);
  }
}

main();
