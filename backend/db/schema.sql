-- Alo Çukur Hattı — Veritabanı Şeması (PostGIS gerektirmez)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  role VARCHAR(20) DEFAULT 'citizen',
  municipality_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  district TEXT,
  photo_url TEXT NOT NULL,
  photo_public_id TEXT,
  description TEXT,
  reporter_name TEXT,
  reporter_ip TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'open',
  severity VARCHAR(20) DEFAULT 'medium',
  me_too_count INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
CREATE INDEX IF NOT EXISTS reports_severity_idx ON reports (severity);
CREATE INDEX IF NOT EXISTS reports_city_idx ON reports (city);
CREATE INDEX IF NOT EXISTS reports_lat_lng_idx ON reports (lat, lng);

CREATE TABLE IF NOT EXISTS me_too (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reporter_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, reporter_ip)
);

CREATE TABLE IF NOT EXISTS resolutions (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  resolved_by INTEGER REFERENCES users(id),
  resolver_role VARCHAR(20),
  photo_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_flags (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  reporter_ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, reporter_ip)
);

CREATE TABLE IF NOT EXISTS push_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(token)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS municipality_webhooks (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city)
);

CREATE TABLE IF NOT EXISTS municipality_log (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id) ON DELETE SET NULL,
  webhook_id INTEGER REFERENCES municipality_webhooks(id) ON DELETE SET NULL,
  success BOOLEAN NOT NULL,
  http_status INTEGER,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
