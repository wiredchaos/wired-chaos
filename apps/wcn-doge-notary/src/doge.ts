import http from 'http';
import https from 'https';
import { URL } from 'url';
import { randomUUID, createHash } from 'crypto';
import type { DogeCredentials, InscriptionRequestOptions, InscriptionResult } from './types.js';

const BRAND_NOTES = 'GROK: Artist @neurometax • © WIRED CHAOS / 33.3FM DOGECHAIN • Palette #000000 #00FFFF #FF3131 #39FF14 #FF00FF';

function postJson(urlString: string, payload: unknown): Promise<any> {
  const url = new URL(urlString);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
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
    req.write(JSON.stringify(payload));
    req.end();
  });
}

export function resolveCredentials(): DogeCredentials {
  return {
    walletMnemonic: process.env.DOGE_WALLET_MNEMONIC,
    walletWif: process.env.DOGE_WALLET_WIF,
    rpcUrl: process.env.DOGE_RPC_URL,
    inscribeServiceUrl: process.env.INSCRIBE_SERVICE_URL,
  };
}

export function validateCredentials(credentials: DogeCredentials, dryRun?: boolean): void {
  if (dryRun) return;
  const hasWallet = Boolean(credentials.walletMnemonic || credentials.walletWif);
  const hasPath = Boolean(credentials.rpcUrl || credentials.inscribeServiceUrl);
  if (!hasWallet || !hasPath) {
    throw new Error('DOGE inscription credentials missing. Provide wallet secret and DOGE_RPC_URL or INSCRIBE_SERVICE_URL, or run with --dry-run.');
  }
}

export async function inscribeBinary(
  credentials: DogeCredentials,
  options: InscriptionRequestOptions
): Promise<InscriptionResult> {
  if (options.dryRun) {
    return simulateInscription(options);
  }

  if (credentials.inscribeServiceUrl) {
    return inscribeViaService(credentials.inscribeServiceUrl, options);
  }

  if (credentials.rpcUrl) {
    return inscribeViaRpc(credentials.rpcUrl, options);
  }

  throw new Error('No Dogecoin inscription path configured.');
}

async function inscribeViaService(url: string, options: InscriptionRequestOptions): Promise<InscriptionResult> {
  const payload = {
    mimeType: options.mimeType,
    label: options.label,
    metadata: BRAND_NOTES,
    content: Buffer.isBuffer(options.content)
      ? options.content.toString('base64')
      : Buffer.from(options.content).toString('base64'),
  };
  const response = await postJson(url, payload);
  return {
    inscriptionId: response?.inscriptionId ?? response?.id ?? randomUUID(),
    txid: response?.txid,
    costEstimateDoge: response?.fee,
  };
}

async function inscribeViaRpc(url: string, options: InscriptionRequestOptions): Promise<InscriptionResult> {
  const payload = {
    jsonrpc: '2.0',
    id: randomUUID(),
    method: 'inscribe_wcn',
    params: [
      {
        label: options.label,
        mimeType: options.mimeType,
        base64: Buffer.isBuffer(options.content)
          ? options.content.toString('base64')
          : Buffer.from(options.content).toString('base64'),
        notes: BRAND_NOTES,
      },
    ],
  };

  const response = await postJson(url, payload);
  if (response?.error) {
    throw new Error(`Dogecoin RPC error: ${response.error.message}`);
  }
  const result = response?.result ?? {};
  return {
    inscriptionId: result.inscriptionId ?? result.id ?? randomUUID(),
    txid: result.txid,
    costEstimateDoge: result.fee,
  };
}

function simulateInscription(options: InscriptionRequestOptions): InscriptionResult {
  const hash = createHash('sha256')
    .update(typeof options.content === 'string' ? options.content : options.content)
    .digest('hex')
    .slice(0, 32);

  return {
    inscriptionId: `sim-${options.label}-${hash}`,
    txid: undefined,
    costEstimateDoge: 0,
  };
}
