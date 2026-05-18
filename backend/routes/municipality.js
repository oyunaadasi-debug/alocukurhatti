const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { body, param, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

// Webhook gönderici — belediyenin endpoint'ine POST atar
async function sendWebhook(webhookUrl, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const url = new URL(webhookUrl);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'X-AlocukurHatti-Signature': 'v1' } },
      (res) => {
        res.resume();
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
      }
    );
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.write(data);
    req.end();
  });
}

// POST /api/municipality/forward/:reportId — raporu belediyeye ilet
// Sadece admin veya belediye memuru yapabilir
router.post('/forward/:reportId', requireAuth, requireRole('admin', 'municipality'), [
  param('reportId').isInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { reportId } = req.params;

  try {
    // Raporu getir
    const { rows: reportRows } = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND moderation_status = $2',
      [reportId, 'approved']
    );
    if (!reportRows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });
    const report = reportRows[0];

    // Şehre ait aktif belediye webhook'unu bul
    const { rows: webhookRows } = await pool.query(
      'SELECT * FROM municipality_webhooks WHERE city ILIKE $1 AND active = true LIMIT 1',
      [report.city || '']
    );

    if (!webhookRows.length) {
      return res.status(404).json({
        error: `${report.city || 'Bu şehir'} için aktif belediye entegrasyonu bulunamadı.`,
        hint: 'Belediye ile anlaşma yapıldıktan sonra webhook ekleyin.',
      });
    }

    const webhook = webhookRows[0];

    // Belediyeye gönderilecek payload
    const payload = {
      source: 'alocukurhatti',
      report_id: report.id,
      location: { lat: report.lat, lng: report.lng, address: report.address, district: report.district, city: report.city },
      photo_url: report.photo_url,
      description: report.description,
      me_too_count: report.me_too_count,
      reported_at: report.created_at,
      detail_url: `${process.env.WEB_URL || 'https://alocukurhatti.com'}/reports/${report.id}`,
    };

    const result = await sendWebhook(webhook.endpoint_url, payload);

    if (result.ok) {
      await pool.query(
        `UPDATE reports SET status = 'forwarded', updated_at = NOW() WHERE id = $1`,
        [reportId]
      );
      await pool.query(
        `INSERT INTO municipality_log (report_id, webhook_id, success, http_status) VALUES ($1, $2, true, $3)`,
        [reportId, webhook.id, result.status]
      );
      res.json({ success: true, message: 'Rapor belediyeye iletildi.' });
    } else {
      await pool.query(
        `INSERT INTO municipality_log (report_id, webhook_id, success, error_message) VALUES ($1, $2, false, $3)`,
        [reportId, webhook.id, result.error || String(result.status)]
      );
      res.status(502).json({ error: 'Belediye webhook\'u yanıt vermedi.', detail: result });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// --- Admin-only: webhook yönetimi ---

// GET /api/municipality/webhooks
router.get('/webhooks', requireAuth, requireRole('admin'), async (req, res) => {
  const { rows } = await pool.query('SELECT id, city, endpoint_url, active, created_at FROM municipality_webhooks ORDER BY city');
  res.json({ webhooks: rows });
});

// POST /api/municipality/webhooks — yeni belediye webhook ekle
router.post('/webhooks', requireAuth, requireRole('admin'), [
  body('city').isString().trim().notEmpty(),
  body('endpoint_url').isURL(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rows } = await pool.query(
      `INSERT INTO municipality_webhooks (city, endpoint_url) VALUES ($1, $2)
       ON CONFLICT (city) DO UPDATE SET endpoint_url = $2, active = true, updated_at = NOW()
       RETURNING *`,
      [req.body.city, req.body.endpoint_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// PATCH /api/municipality/webhooks/:id/toggle — aktif/pasif yap
router.patch('/webhooks/:id/toggle', requireAuth, requireRole('admin'), param('id').isInt(), async (req, res) => {
  const { rowCount, rows } = await pool.query(
    `UPDATE municipality_webhooks SET active = NOT active, updated_at = NOW() WHERE id = $1 RETURNING active`,
    [req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Webhook bulunamadı.' });
  res.json({ active: rows[0].active });
});

module.exports = router;
