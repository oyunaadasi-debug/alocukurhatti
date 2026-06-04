ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'medium';

UPDATE reports SET severity = 'medium' WHERE severity IS NULL;

CREATE INDEX IF NOT EXISTS reports_severity_idx ON reports (severity);

CREATE TABLE IF NOT EXISTS report_follows (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

CREATE INDEX IF NOT EXISTS report_follows_report_idx ON report_follows (report_id);
CREATE INDEX IF NOT EXISTS report_follows_user_idx ON report_follows (user_id);

CREATE TABLE IF NOT EXISTS area_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS area_subscriptions_user_idx ON area_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS area_subscriptions_lat_lng_idx ON area_subscriptions (lat, lng);
