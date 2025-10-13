import fs from 'fs';
import path from 'path';

const CDN_DIR = 'public/cdn';
fs.mkdirSync(CDN_DIR, { recursive: true });
const versions = fs
  .readdirSync(CDN_DIR)
  .filter((n) => n.startsWith('v'))
  .sort();

const latest = versions.at(-1);
if (!latest) {
  console.error('No versions found.');
  process.exit(1);
}

const LATEST_DIR = path.join(CDN_DIR, 'latest');
fs.rmSync(LATEST_DIR, { recursive: true, force: true });
fs.mkdirSync(LATEST_DIR, { recursive: true });

fs.copyFileSync(`${CDN_DIR}/${latest}/wired-chaos-syntax.min.css`, `${LATEST_DIR}/wired-chaos-syntax.min.css`);
fs.copyFileSync(`${CDN_DIR}/${latest}/meta.json`, `${LATEST_DIR}/meta.json`);
console.log(`🔗 latest → ${latest}`);
