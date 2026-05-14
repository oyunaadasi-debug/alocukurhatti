-- Alo Çukur Hattı — Veritabanı Şeması
-- PostgreSQL + PostGIS gerektirir

CREATE EXTENSION IF NOT EXISTS postgis;

-- Kullanıcılar (opsiyonel kayıt)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  role VARCHAR(20) DEFAULT 'citizen', -- citizen | municipality | admin
  municipality_code TEXT,             -- belediye memuru için ilçe kodu
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raporlar
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(POINT, 4326),        -- PostGIS konum (yakınlık sorguları için)
  address TEXT,                        -- tersine geocoding ile doldurulur
  city TEXT,
  district TEXT,
  photo_url TEXT NOT NULL,             -- Cloudinary URL
  photo_public_id TEXT,                -- Cloudinary public_id (silme için)
  description TEXT,
  reporter_name TEXT,                  -- NULL = anonim
  reporter_ip TEXT,                    -- spam kontrolü için
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'open',   -- open | forwarded | reviewing | resolved | rejected
  me_too_count INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'approved', -- approved | rejected | pending
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coğrafi indeks (yakınlık sorguları için kritik)
CREATE INDEX IF NOT EXISTS reports_geom_idx ON reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
CREATE INDEX IF NOT EXISTS reports_city_idx ON reports (city);

-- Ben de gördüm
CREATE TABLE IF NOT EXISTS me_too (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reporter_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, reporter_ip)       -- aynı IP 2x oy veremesin
);

-- Çözüm kanıtları
CREATE TABLE IF NOT EXISTS resolutions (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  resolved_by INTEGER REFERENCES users(id),
  resolver_role VARCHAR(20),           -- citizen | municipality | admin
  photo_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uygunsuz içerik bildirimleri (3+ şikayet → flagged)
CREATE TABLE IF NOT EXISTS report_flags (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  reporter_ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, reporter_ip)
);

-- geom otomatik güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_report_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER report_geom_trigger
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_report_geom();
