// Bağlantı dizesi ortam değişkeninden okunur — koda asla gömülmez.
// Production DB için: `vercel env pull .env.prod --environment=production`
// sonra: `node -r dotenv/config scripts/runMigration008.js dotenv_config_path=.env.prod`
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const conn = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!conn) {
  console.error('✗ HATA: DATABASE_URL tanımlı değil. Bir .env dosyası sağlayın veya DATABASE_URL="postgresql://..." olarak verin.');
  process.exit(1);
}

const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });
const sql = fs.readFileSync(path.join(__dirname, '008_report_updates.sql'), 'utf8');

pool.query(sql)
  .then(() => { console.log('✓ Migration 008 tamamlandı.'); process.exit(0); })
  .catch(err => { console.error('✗ Hata:', err.message); process.exit(1); });
