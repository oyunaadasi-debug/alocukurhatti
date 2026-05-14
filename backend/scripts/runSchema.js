// Şema kurulumu için external URL kullan (sadece bu script için)
process.env.DATABASE_URL = 'postgresql://alocukurhatti:YTJ4q8Fxk4Ron3E9bIOQm2UsXbLvaFWm@dpg-d8336rnavr4c738176gg-a.oregon-postgres.render.com/alocukurhatti';
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

pool.query(sql)
  .then(() => { console.log('✓ Şema başarıyla kuruldu.'); process.exit(0); })
  .catch(err => { console.error('✗ Hata:', err.message); process.exit(1); });
