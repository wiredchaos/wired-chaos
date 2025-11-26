import type { CertificateRow } from "../schema.js";

export type Certificate = CertificateRow;

export type CertificateAudit = {
  audit_id: number;
  certificate_id: string;
  status: "verified" | "mismatch" | "not_found" | "error";
  provider_chain: string;
  details: unknown;
  occurred_at: Date;
};
