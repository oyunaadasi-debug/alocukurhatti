const express = require('express');
const router = express.Router();
const https = require('https');
const { body, param, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

// Expo Push Notification API
function sendExpoPushNotification(tokens, title, body, data = {}) {
  const messages = tokens.map((token) => ({ to: token, title, body, data, sound: 'default' }));
  const payload = JSON.stringify(messages);

  return new Promise((resolve) => {
    const req = https.request(
      'https://exp.host/--/api/v2/push/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(true));
      }
    );
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

// POST /api/notifications/token — push token kaydet (giriş yapılmış kullanıcı)
router.post('/token', requireAuth, [
  body('token').isString().trim().notEmpty(),
  body('platform').optional().isIn(['ios', 'android']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { token, platform } = req.body;

  try {
    await pool.query(`
      INSERT INTO push_tokens (user_id, token, platform)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) DO UPDATE SET user_id = $1, platform = COALESCE($3, push_tokens.platform), updated_at = NOW()
    `, [req.user.id, token, platform || null]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// DELETE /api/notifications/token — push token sil (çıkış yapılınca)
router.delete('/token', requireAuth, [
  body('token').isString().trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await pool.query('DELETE FROM push_tokens WHERE token = $1 AND user_id = $2', [req.body.token, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/notifications/areas — kullanıcının takip ettiği bölgeler
router.get('/areas', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, label, lat, lng, radius_km, created_at
       FROM area_subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ areas: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/notifications/areas — bölge takibi oluştur
router.post('/areas', requireAuth, [
  body('lat').isFloat({ min: 35, max: 43 }).withMessage('Geçersiz enlem.'),
  body('lng').isFloat({ min: 25, max: 45 }).withMessage('Geçersiz boylam.'),
  body('radius_km').optional().isFloat({ min: 1, max: 10 }),
  body('label').optional().isString().trim().isLength({ max: 120 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { lat, lng, radius_km = 3, label } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO area_subscriptions (user_id, label, lat, lng, radius_km)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, label, lat, lng, radius_km, created_at`,
      [req.user.id, label || null, lat, lng, radius_km]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// DELETE /api/notifications/areas/:id — bölge takibini kaldır
router.delete('/areas/:id', requireAuth, param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await pool.query(
      `DELETE FROM area_subscriptions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = { router, sendExpoPushNotification };
