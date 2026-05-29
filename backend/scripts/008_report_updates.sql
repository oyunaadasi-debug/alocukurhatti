-- Migration 008: issue_type + report_updates
ALTER TABLE reports ADD COLUMN IF NOT EXISTS issue_type VARCHAR(50) NOT NULL DEFAULT 'cukur';

CREATE TABLE IF NOT EXISTS report_updates (
  id              SERIAL PRIMARY KEY,
  report_id       INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  update_type     VARCHAR(30) NOT NULL CHECK (update_type IN ('complaint_joined', 'resolution_proof', 'still_unresolved')),
  photo_url       TEXT,
  photo_public_id TEXT,
  note            TEXT,
  reporter_name   VARCHAR(100),
  reporter_ip     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_updates_report_id ON report_updates(report_id);
