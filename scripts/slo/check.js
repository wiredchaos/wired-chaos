# WIRED CHAOS / CODEX - SLO Badge Checker
# Usage: node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99.0 --window "10m"

const fetch = require('node-fetch');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { apps, sloUrl, min = "99.0" } = yargs(hideBin(process.argv)).argv;

fetch(sloUrl)
  .then(res => {
    if (!res.ok) {
      console.error("SLO endpoint bad");
      process.exit(1);
    }
    return res.json();
  })
  .then(json => {
    const score = Number(json.score ?? json.uptime ?? 0);
    console.log(`SLO score: ${score}`);
    if (score < Number(min)) {
      console.error(`SLO below threshold (${score} < ${min}) for ${apps}`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("SLO check failed:", err);
    process.exit(1);
  });
