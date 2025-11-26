CREATE TABLE IF NOT EXISTS certificates (
  id               TEXT PRIMARY KEY,
  expected_inscription_id TEXT NOT NULL,
  expected_content_hash   TEXT,
  expected_txid           TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificate_audits (
  audit_id          BIGSERIAL PRIMARY KEY,
  certificate_id    TEXT NOT NULL REFERENCES certificates(id),
  status            TEXT NOT NULL CHECK (status IN ('verified','mismatch','not_found','error')),
  provider_chain    TEXT NOT NULL,
  details           JSONB NOT NULL,
  occurred_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audits_cert ON certificate_audits(certificate_id);
