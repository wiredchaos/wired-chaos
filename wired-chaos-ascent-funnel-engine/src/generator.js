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

const systemPromptPath = resolve(
  process.cwd(),
  'wired-chaos-ascent-funnel-engine',
  'codex',
  'system_prompt.txt'
);

function loadSystemPrompt() {
  return readFileSync(systemPromptPath, 'utf8');
}

function createFunnelContext(overrides = {}) {
  return Object.assign(
    {
      prompt: loadSystemPrompt(),
      timestamp: new Date().toISOString(),
      engine: 'WIRED_CHAOS_ASCENT_FUNNEL_ENGINE'
    },
    overrides
  );
}

module.exports = {
  loadSystemPrompt,
  createFunnelContext
};
