import fs from 'fs';
import crypto from 'crypto';

const SRC = 'public/wired-chaos-syntax.min.css';
if (!fs.existsSync(SRC)) {
  console.error('Minified CSS not found. Run: npm run build:css');
  process.exit(1);
}
const css = fs.readFileSync(SRC);
const hash = crypto.createHash('md5').update(css).digest('hex').slice(0, 8);
const now = new Date();
const ver = `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}-${hash}`;

const CDN_ROOT = 'public/cdn';
fs.mkdirSync(CDN_ROOT, { recursive: true });
const DST_DIR = `${CDN_ROOT}/${ver}`;
fs.mkdirSync(DST_DIR, { recursive: true });
fs.copyFileSync(SRC, `${DST_DIR}/wired-chaos-syntax.min.css`);

const meta = {
  theme: 'WIRED CHAOS Syntax',
  version: ver,
  palette: {
    background: '#000000',
    neonCyan: '#00FFFF',
    glitchRed: '#FF3131',
    electricGreen: '#39FF14',
    accentPink: '#FF00FF'
  },
  checksum: hash,
  cdn: 'https://wiredchaos.github.io/wired-chaos/cdn/'
};
fs.writeFileSync(`${DST_DIR}/meta.json`, JSON.stringify(meta, null, 2));
console.log(`📦 Versioned build → ${DST_DIR}\n🧭 meta.json written.`);
