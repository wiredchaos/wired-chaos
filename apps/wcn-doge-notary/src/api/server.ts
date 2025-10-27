import http from 'http';
import { URL } from 'url';
import { loadFile } from '../file.js';
import { notarizeBuffer } from '../notary.js';
import { verifyDocument } from '../verifier.js';
import type { AttestationPayload, ManifestDocument, NotaryConfig } from '../types.js';

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleNotarize(body: any) {
  const {
    file_path: filePath,
    content_base64: base64,
    title,
    privacy_mode: privacyMode = 'public',
    recipient_key: recipientKey,
    max_inline_kb: maxInlineKB = 256,
    chunk_kb: chunkKB = 512,
    namespace = 'wcn-ins',
    author = process.env.AUTHOR_HANDLE || 'WIRED CHAOS',
    timestamp = new Date().toISOString(),
    dry_run: dryRun = false,
  } = body ?? {};

  if (!title) {
    throw new Error('DOC_TITLE is required.');
  }

  let buffer: Buffer;
  let mimeType = 'application/octet-stream';
  if (base64) {
    buffer = Buffer.from(String(base64), 'base64');
  } else if (filePath) {
    const loaded = await loadFile(filePath);
    buffer = loaded.buffer;
    mimeType = loaded.mimeType;
  } else {
    throw new Error('Provide file_path or content_base64.');
  }

  const config: NotaryConfig = {
    filePath: filePath ?? 'inline-buffer',
    title,
    privacyMode: privacyMode === 'encrypted' ? 'encrypted' : 'public',
    recipientKey,
    maxInlineKB,
    chunkKB,
    namespace,
    author,
    timestamp,
    mimeType,
    dryRun,
  };

  const result = await notarizeBuffer(config, buffer);
  return {
    mode: result.mode,
    doc_hash: result.docHash,
    file_insc: result.fileInscription?.inscriptionId ?? null,
    manifest_insc: result.manifestInscription?.inscriptionId ?? null,
    attestation_insc: result.attestationInscription.inscriptionId,
    chunks: result.chunks.map((chunk) => ({
      i: chunk.i,
      insc: chunk.inscription?.inscriptionId ?? null,
      hash: chunk.hash,
    })),
    attestation: result.attestationPayload,
    manifest: result.manifestDocument,
    ts: timestamp,
  };
}

async function handleVerify(body: any) {
  const { file_path: filePath, attestation, manifest } = body ?? {};
  if (!filePath) {
    throw new Error('file_path is required.');
  }
  if (!attestation) {
    throw new Error('attestation JSON is required.');
  }
  return verifyDocument(
    filePath,
    attestation as AttestationPayload,
    manifest as ManifestDocument | undefined
  );
}

function sendJson(res: any, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

export function startServer(): any {
  const server = http.createServer(async (req, res) => {
    if (!req.url || !req.method) {
      sendJson(res, 400, { error: 'Bad request' });
      return;
    }
    const url = new URL(req.url, 'http://localhost');

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok', ts: new Date().toISOString() });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/notarize') {
        const body = await readJsonBody(req);
        const result = await handleNotarize(body);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/verify') {
        const body = await readJsonBody(req);
        const result = await handleVerify(body);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === 'GET' && url.pathname.startsWith('/inscription/')) {
        const id = url.pathname.split('/').pop();
        sendJson(res, 200, {
          inscriptionId: id,
          status: 'unverified-local',
          message: 'Connect to DOGE RPC or inscription service for live data.',
        });
        return;
      }

      sendJson(res, 404, { error: 'Not found' });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 8787;
  server.listen(port, () => {
    console.log(`WCN Doge Notary API listening on port ${port}`);
  });
  return server;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startServer();
}
