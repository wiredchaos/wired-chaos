import http from 'http';
import https from 'https';
import { URL } from 'url';
import { fileURLToPath } from 'url';
import { notarizeBuffer } from '../notary.js';
import type { NotaryConfig } from '../types.js';

interface FreshRssEntry {
  id: string;
  title: string;
  url?: string;
  author?: string;
  content: string;
  published?: string;
}

interface FreshRssResponse {
  items: FreshRssEntry[];
}

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function fetchJson(urlString: string, token?: string): Promise<any> {
  const url = new URL(urlString);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: 'GET',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
      (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          reject(new Error(`FreshRSS request failed with status ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            resolve(raw ? JSON.parse(raw) : {});
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function renderArticlePdf(entry: FreshRssEntry): Buffer {
  const lines = [
    `${entry.title} — WIRED CHAOS`,
    entry.author ? `Author: ${entry.author}` : '',
    entry.url ? `Source: ${entry.url}` : '',
    '',
    entry.content,
    '',
    'WIRED CHAOS • Artist @neurometax • GROK Metadata Integration • Palette #000000 #00FFFF #FF3131 #39FF14 #FF00FF',
  ].filter(Boolean);

  let content = 'BT\n/F1 16 Tf\n1 -18 TL\n50 760 Td\n';
  lines.forEach((line, index) => {
    if (index > 0) {
      content += 'T*\n';
    }
    content += `(${escapePdfText(line)}) Tj\n`;
  });
  content += 'ET';

  const contentBuffer = Buffer.from(content, 'utf8');

  const header = '%PDF-1.4\n';
  const objects: string[] = [];
  const offsets: number[] = [0];
  let offset = Buffer.byteLength(header);

  function addObject(id: number, body: string) {
    const objectString = `${id} 0 obj\n${body}\nendobj\n`;
    offsets[id] = offset;
    objects.push(objectString);
    offset += Buffer.byteLength(objectString);
  }

  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const streamObject = `<< /Length ${contentBuffer.length} >>\nstream\n${content}\nendstream\n`;
  addObject(5, streamObject);
  addObject(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>');

  const xrefOffset = offset;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const position = offsets[i];
    xref += `${position.toString().padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfParts = [header, ...objects, xref, trailer];
  return Buffer.concat(pdfParts.map((part) => Buffer.from(part, 'utf8')));
}

export async function runFreshRssNotary(): Promise<void> {
  const apiUrl = assertEnv('FRESHRSS_API_URL');
  const token = assertEnv('FRESHRSS_TOKEN');
  const namespace = process.env.NAMESPACE ?? 'wcn-ins';
  const author = process.env.AUTHOR_HANDLE ?? 'WIRED CHAOS';
  const dryRun = process.env.FRESHRSS_DRY_RUN === 'true';
  const privacyMode = (process.env.FRESHRSS_PRIVACY ?? 'public') === 'encrypted' ? 'encrypted' : 'public';
  const recipientKey = process.env.FRESHRSS_RECIPIENT_KEY;

  const response = (await fetchJson(apiUrl, token)) as FreshRssResponse;
  const entries = response.items ?? [];
  if (entries.length === 0) {
    console.log('No FreshRSS items found for notarization.');
    return;
  }

  for (const entry of entries) {
    const pdfBuffer = renderArticlePdf(entry);
    const config: NotaryConfig = {
      filePath: entry.url ?? entry.id,
      title: entry.title,
      privacyMode,
      recipientKey,
      maxInlineKB: Number(process.env.MAX_INLINE_KB ?? 256),
      chunkKB: Number(process.env.CHUNK_KB ?? 512),
      namespace,
      author,
      timestamp: new Date().toISOString(),
      mimeType: 'application/pdf',
      dryRun,
    };

    const result = await notarizeBuffer(config, pdfBuffer);
    console.log(
      JSON.stringify(
        {
          entry: entry.id,
          mode: result.mode,
          doc_hash: result.docHash,
          attestation: result.attestationInscription.inscriptionId,
          manifest: result.manifestInscription?.inscriptionId ?? null,
          chunks: result.chunks.map((chunk) => chunk.inscription?.inscriptionId ?? null),
          ts: config.timestamp,
        },
        null,
        2
      )
    );
  }
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] === modulePath) {
  runFreshRssNotary().catch((error) => {
    console.error('FreshRSS hook failed', error);
    process.exit(1);
  });
}
