'use strict';

function parseArgs(argv) {
  const args = {};
  const positional = [];
  let currentKey = null;

  argv.forEach((token) => {
    if (token.startsWith('--')) {
      if (currentKey) {
        args[currentKey] = true;
      }

      const trimmed = token.slice(2);
      const eqIndex = trimmed.indexOf('=');

      if (eqIndex !== -1) {
        const key = trimmed.slice(0, eqIndex);
        const value = trimmed.slice(eqIndex + 1);
        args[key] = value;
        currentKey = null;
        return;
      }

      currentKey = trimmed;
      return;
    }

    if (currentKey) {
      args[currentKey] = token;
      currentKey = null;
      return;
    }

    positional.push(token);
  });

  if (currentKey) {
    args[currentKey] = true;
  }

  if (positional.length > 0) {
    args._ = positional;
  }

  return args;
}

module.exports = {
  parseArgs,
};
