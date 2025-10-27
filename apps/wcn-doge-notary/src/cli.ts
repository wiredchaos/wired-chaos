#!/usr/bin/env node
import { loadFile } from './file.js';
import { notarizeBuffer } from './notary.js';
import { logStructured, readJsonFile } from './utils.js';
import type { AttestationPayload, ManifestDocument, NotaryConfig } from './types.js';
import { verifyDocument } from './verifier.js';

interface ParsedOptions {
  command: string;
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedOptions {
  const [command = 'help', ...rest] = argv;
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith('--')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }

  return { command, flags };
}

async function handleNotarize(flags: Record<string, string | boolean>) {
  const file = flags['file'];
  const title = flags['title'];
  if (typeof file !== 'string' || typeof title !== 'string') {
    throw new Error('Missing required --file and --title options.');
  }

  const privacy = flags['privacy'] === 'encrypted' ? 'encrypted' : 'public';
  const recipient = typeof flags['recipient'] === 'string' ? (flags['recipient'] as string) : undefined;
  const maxInlineKB = Number(flags['max-inline-kb'] ?? 256);
  const chunkKB = Number(flags['chunk-kb'] ?? 512);
  const namespace = typeof flags['namespace'] === 'string' ? (flags['namespace'] as string) : 'wcn-ins';
  const author = typeof flags['author'] === 'string' ? (flags['author'] as string) : process.env.AUTHOR_HANDLE || 'WIRED CHAOS';
  const timestamp = typeof flags['timestamp'] === 'string' ? (flags['timestamp'] as string) : new Date().toISOString();
  const dryRun = Boolean(flags['dry-run']);

  const loaded = await loadFile(file);

  const config: NotaryConfig = {
    filePath: file,
    title,
    privacyMode: privacy,
    recipientKey: recipient,
    maxInlineKB,
    chunkKB,
    namespace,
    author,
    timestamp,
    mimeType: loaded.mimeType,
    dryRun,
  };

  const result = await notarizeBuffer(config, loaded.buffer);

  const output = {
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
    ts: config.timestamp,
  };

  console.log(JSON.stringify(output, null, 2));
}

async function handleVerify(flags: Record<string, string | boolean>) {
  const file = flags['file'];
  const attestationPath = flags['attestation'];
  if (typeof file !== 'string' || typeof attestationPath !== 'string') {
    throw new Error('Missing required --file and --attestation options.');
  }
  const manifestPath = typeof flags['manifest'] === 'string' ? (flags['manifest'] as string) : undefined;

  const attestation = await readJsonFile<AttestationPayload>(attestationPath);
  const manifest = manifestPath ? await readJsonFile<ManifestDocument>(manifestPath) : undefined;

  const result = await verifyDocument(file, attestation, manifest);
  console.log(JSON.stringify(result, null, 2));
}

function handleInfo(flags: Record<string, string | boolean>) {
  const insc = flags['insc'];
  if (typeof insc !== 'string') {
    throw new Error('Missing required --insc option.');
  }
  const result = {
    inscriptionId: insc,
    status: 'unverified-local',
    note: 'Use DOGE_RPC_URL or INSCRIBE_SERVICE_URL to fetch live details.',
  };
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  try {
    if (command === 'notarize') {
      await handleNotarize(flags);
    } else if (command === 'verify') {
      await handleVerify(flags);
    } else if (command === 'info') {
      handleInfo(flags);
    } else {
      console.log(`WIRED CHAOS Doge Notary\n\nCommands:\n  notarize --file <path> --title <title> [--privacy public|encrypted] [--dry-run]\n  verify --file <path> --attestation <path> [--manifest <path>]\n  info --insc <id>`);
    }
  } catch (error) {
    logStructured(`${command}_failed`, {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  }
}

main();
