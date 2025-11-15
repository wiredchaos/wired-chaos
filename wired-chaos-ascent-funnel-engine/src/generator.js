/**
 * WIRED CHAOS ASCENT FUNNEL ENGINE
 *
 * This module exposes a simple factory that can be expanded into the
 * production-grade generator referenced in the giga prompt. For now it
 * demonstrates how to load the canonical system prompt payload and make it
 * available to downstream exporters.
 */

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const baseDir = resolve(process.cwd(), 'wired-chaos-ascent-funnel-engine');

const systemPromptPath = resolve(baseDir, 'codex', 'system_prompt.txt');
const businessAscentFunnelPath = resolve(
  baseDir,
  'src',
  'funnels',
  'business-ascent-school.json'
);

function loadSystemPrompt() {
  return readFileSync(systemPromptPath, 'utf8');
}

function loadBusinessAscentSchoolFunnel() {
  return JSON.parse(readFileSync(businessAscentFunnelPath, 'utf8'));
}

function createFunnelContext(overrides = {}) {
  return Object.assign(
    {
      prompt: loadSystemPrompt(),
      timestamp: new Date().toISOString(),
      engine: 'WIRED_CHAOS_ASCENT_FUNNEL_ENGINE',
      samples: {
        businessAscentSchool: loadBusinessAscentSchoolFunnel()
      }
    },
    overrides
  );
}

module.exports = {
  loadSystemPrompt,
  loadBusinessAscentSchoolFunnel,
  createFunnelContext
};
