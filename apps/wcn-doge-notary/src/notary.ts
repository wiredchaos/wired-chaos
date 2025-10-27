import { planInscription, finalizeManifest, buildAttestationAfterInscribe } from './planner.js';
import { resolveCredentials, validateCredentials, inscribeBinary } from './doge.js';
import type {
  AttestationPayload,
  ManifestDocument,
  NotaryConfig,
  InscriptionResult,
} from './types.js';

export interface NotarizeResult {
  mode: 'full' | 'chunked';
  docHash: string;
  fileInscription?: InscriptionResult;
  manifestInscription?: InscriptionResult;
  attestationInscription: InscriptionResult;
  chunks: {
    i: number;
    hash: string;
    inscription?: InscriptionResult;
  }[];
  attestationPayload: AttestationPayload;
  manifestDocument?: ManifestDocument;
}

export async function notarizeBuffer(
  config: NotaryConfig,
  buffer: Buffer
): Promise<NotarizeResult> {
  const plan = planInscription(config, buffer);

  const credentials = resolveCredentials();
  validateCredentials(credentials, config.dryRun);

  const chunkResults: NotarizeResult['chunks'] = [];
  let fileInscription: InscriptionResult | undefined;
  let manifestInscription: InscriptionResult | undefined;
  let manifestDocument: ManifestDocument | undefined;

  if (plan.mode === 'full') {
    const chunk = plan.chunks[0];
    fileInscription = await inscribeBinary(credentials, {
      mimeType: config.mimeType ?? 'application/octet-stream',
      content: chunk.buffer,
      label: `${config.namespace}-full`,
      dryRun: config.dryRun,
    });
    chunk.inscription = fileInscription;
    chunkResults.push({
      i: chunk.index,
      hash: chunk.hash,
      inscription: fileInscription,
    });
  } else {
    for (const chunk of plan.chunks) {
      const inscription = await inscribeBinary(credentials, {
        mimeType: 'application/octet-stream',
        content: chunk.buffer,
        label: `${config.namespace}-chunk-${chunk.index}`,
        dryRun: config.dryRun,
      });
      chunk.inscription = inscription;
      chunkResults.push({ i: chunk.index, hash: chunk.hash, inscription });
    }

    if (!plan.manifestTemplate) {
      throw new Error('Manifest template missing in chunked mode.');
    }
    manifestDocument = finalizeManifest(plan.manifestTemplate, plan.chunks);
    const manifestBuffer = Buffer.from(JSON.stringify(manifestDocument, null, 2));
    manifestInscription = await inscribeBinary(credentials, {
      mimeType: 'application/json',
      content: manifestBuffer,
      label: `${config.namespace}-manifest`,
      dryRun: config.dryRun,
    });
  }

  const attestationPayload = buildAttestationAfterInscribe(config, plan.docHash, {
    file: fileInscription,
    manifest: manifestInscription,
  });

  const attestationBuffer = Buffer.from(JSON.stringify(attestationPayload, null, 2));
  const attestationInscription = await inscribeBinary(credentials, {
    mimeType: 'application/json',
    content: attestationBuffer,
    label: `${config.namespace}-attestation`,
    dryRun: config.dryRun,
  });

  return {
    mode: plan.mode,
    docHash: plan.docHash,
    fileInscription,
    manifestInscription,
    attestationInscription,
    chunks: chunkResults,
    attestationPayload,
    manifestDocument,
  };
}
