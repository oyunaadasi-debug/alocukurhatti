require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./db/pool');
const reportsRouter = require('./routes/reports');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Rate limit: rapor göndermeye dakikada 5
const reportLimiter = rateLimit({ windowMs: 60_000, max: 5, message: { error: 'Çok fazla istek. Lütfen bekleyin.' } });

app.use('/api/reports', reportLimiter, reportsRouter);
app.use('/api/stats', statsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// DB bağlantı testi + başlat
pool.query('SELECT 1').then(() => {
  console.log('PostgreSQL bağlantısı başarılı.');
  app.listen(PORT, () => console.log(`Alo Çukur Hattı backend — port ${PORT}`));
}).catch(err => {
  console.error('DB bağlantı hatası:', err.message);
  process.exit(1);
});
