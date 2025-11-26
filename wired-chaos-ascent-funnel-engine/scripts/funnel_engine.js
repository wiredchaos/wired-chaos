#!/usr/bin/env node
const { writeFileSync, mkdirSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { createFunnelContext } = require('../src/generator');

const outputDir = resolve(process.cwd(), 'wired-chaos-ascent-funnel-engine', 'outputs');

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const context = createFunnelContext();
const targetPath = resolve(outputDir, `context-${Date.now()}.json`);

writeFileSync(targetPath, JSON.stringify(context, null, 2));

console.log(`Context exported to ${targetPath}`);
