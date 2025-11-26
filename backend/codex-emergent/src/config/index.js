const fs = require('node:fs');
const path = require('node:path');

const CONFIG_PATH = process.env.WIREDCHAOS_CONFIG_PATH ||
  path.join(__dirname, '../../config/wiredchaos.config.json');

let cachedConfig = null;

function applyEnvOverrides(config) {
  const codex = config.wiredchaos_modules.codex;
  const emergent = config.wiredchaos_modules.emergent;

  if (process.env.CODEX_API_GATEWAY) {
    codex.integration_points.api_gateway = process.env.CODEX_API_GATEWAY;
  }
  if (process.env.EMERGENT_API_GATEWAY) {
    emergent.integration_points.api_gateway = process.env.EMERGENT_API_GATEWAY;
  }
  if (process.env.CODEX_STORAGE_LAYER) {
    codex.integration_points.storage_layer = process.env.CODEX_STORAGE_LAYER;
  }
  if (process.env.WIREDCHAOS_API_VERSION) {
    config.global_settings.api_version = process.env.WIREDCHAOS_API_VERSION;
  }
  return config;
}

function loadConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
  const parsed = JSON.parse(configContent);
  cachedConfig = applyEnvOverrides(parsed);
  return cachedConfig;
}

module.exports = {
  loadConfig,
};
