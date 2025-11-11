import pg from "pg";
import { CertificateRow } from "../schema.js";

const connectionString = process.env.DATABASE_URL;
let pool: pg.Pool | undefined;

function getPool() {
  if (!connectionString) {
    throw new Error("DATABASE_URL env var is required for database operations");
  }
  if (!pool) {
    pool = new pg.Pool({ connectionString });
  }
  return pool;
}

export async function getCertificates(limit = 1000): Promise<CertificateRow[]> {
  const client = getPool();
  const { rows } = await client.query(
    `SELECT id, expected_inscription_id, expected_content_hash, expected_txid
     FROM certificates
     ORDER BY id ASC
     LIMIT $1`,
    [limit]
  );
  return rows as CertificateRow[];
}

export async function auditInsert(
  certificateId: string,
  status: "verified" | "mismatch" | "not_found" | "error",
  provider: string,
  details: unknown
) {
  const client = getPool();
  await client.query(
    `INSERT INTO certificate_audits (certificate_id, status, provider_chain, details)
     VALUES ($1, $2, $3, $4)`,
    [certificateId, status, provider, details]
  );
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
