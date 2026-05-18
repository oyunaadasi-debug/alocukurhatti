require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./db/pool');
const reportsRouter = require('./routes/reports');
const statsRouter = require('./routes/stats');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const { router: notificationsRouter } = require('./routes/notifications');
const municipalityRouter = require('./routes/municipality');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Rate limit: rapor göndermeye dakikada 5
const reportLimiter = rateLimit({ windowMs: 60_000, max: 5, message: { error: 'Çok fazla istek. Lütfen bekleyin.' } });

// Rate limit: auth endpoint'leri — brute force koruması (15 dakikada 10 deneme)
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, message: { error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' } });

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/municipality', municipalityRouter);
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
