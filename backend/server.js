require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./db/pool');

// Üretimde JWT_SECRET zorunlu — eksikse token'lar güvensiz olur, başlatma durdurulur
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET tanımlı değil. Sunucu başlatılmıyor.');
  process.exit(1);
}
const reportsRouter = require('./routes/reports');
const statsRouter = require('./routes/stats');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const { router: notificationsRouter } = require('./routes/notifications');
const municipalityRouter = require('./routes/municipality');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json());

const reportLimiter = rateLimit({ windowMs: 60_000, max: 5, message: { error: 'Çok fazla istek. Lütfen bekleyin.' } });
const authLimiter   = rateLimit({ windowMs: 15 * 60_000, max: 10, message: { error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' } });

app.use('/api/auth',         authLimiter,   authRouter);
app.use('/api/admin',                       adminRouter);
app.use('/api/notifications',               notificationsRouter);
app.use('/api/municipality',                municipalityRouter);
app.use('/api/reports',      reportLimiter, reportsRouter);
app.use('/api/stats',                       statsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Vercel serverless olarak çalışıyorsa sadece export et
if (require.main === module) {
  pool.query('SELECT 1').then(() => {
    console.log('PostgreSQL bağlantısı başarılı.');
    app.listen(PORT, () => console.log(`Alo Çukur Hattı backend — port ${PORT}`));
  }).catch(err => {
    console.error('DB bağlantı hatası:', err.message);
    process.exit(1);
  });
}

module.exports = app;
