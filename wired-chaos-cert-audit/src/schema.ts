import { z } from "zod";

export const CertificateRow = z.object({
  id: z.string().min(1),
  expected_inscription_id: z.string().min(1),
  expected_content_hash: z.string().optional(),
  expected_txid: z.string().optional(),
});
export type CertificateRow = z.infer<typeof CertificateRow>;

export const ProviderResult = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
  inscriptionId: z.string().optional(),
  txid: z.string().optional(),
  contentHash: z.string().optional(),
  raw: z.unknown().optional(),
});
export type ProviderResult = z.infer<typeof ProviderResult>;
