const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { deleteFromBlob } = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendExpoPushNotification } = require('./notifications');

const STATUS_LABELS = {
  open: 'Açık',
  forwarded: 'Belediyeye İletildi',
  reviewing: 'İnceleniyor',
  resolved: 'Çözüldü ✓',
  rejected: 'Reddedildi',
};

async function notifyReportOwner(reportId, title, body) {
  try {
    const { rows } = await pool.query(`
      SELECT pt.token FROM push_tokens pt
      JOIN reports r ON r.user_id = pt.user_id
      WHERE r.id = $1
    `, [reportId]);
    const tokens = rows.map((r) => r.token).filter(Boolean);
    if (tokens.length) await sendExpoPushNotification(tokens, title, body, { reportId });
  } catch {}
}

// Tüm admin route'ları JWT + admin rolü gerektirir
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/queue — moderasyon kuyruğu (pending + flagged raporlar)
router.get('/queue', [
  query('status').optional().isIn(['pending', 'flagged']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { status, limit = 50, offset = 0 } = req.query;

  try {
    const { rows } = await pool.query(`
      SELECT r.*,
             (SELECT COUNT(*) FROM report_flags WHERE report_id = r.id) AS flag_count
      FROM reports r
      WHERE ($1::text IS NULL OR r.moderation_status = $1)
        AND r.moderation_status IN ('pending', 'flagged')
      ORDER BY r.created_at ASC
      LIMIT $2 OFFSET $3
    `, [status || null, limit, offset]);

    const { rows: countRows } = await pool.query(`
      SELECT COUNT(*) FROM reports
      WHERE ($1::text IS NULL OR moderation_status = $1)
        AND moderation_status IN ('pending', 'flagged')
    `, [status || null]);

    res.json({ reports: rows, total: parseInt(countRows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/admin/reports/:id/approve — raporu onayla
router.post('/reports/:id/approve', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rowCount } = await pool.query(
      `UPDATE reports SET moderation_status = 'approved', updated_at = NOW()
       WHERE id = $1 AND moderation_status IN ('pending', 'flagged')`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Rapor bulunamadı veya zaten işlendi.' });

    await notifyReportOwner(req.params.id, 'Şikayetiniz yayınlandı 🎉', 'Bildirdiğiniz çukur haritada görünüyor. Teşekkürler!');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/admin/reports/:id/reject — raporu reddet + Cloudinary'den sil
router.post('/reports/:id/reject', [
  param('id').isInt(),
  body('reason').optional().isString().trim().isLength({ max: 300 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rows } = await pool.query(
      `UPDATE reports SET moderation_status = 'rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING photo_url`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });

    if (rows[0].photo_url) {
      await deleteFromBlob(rows[0].photo_url);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// PATCH /api/admin/reports/:id/status — rapor durumunu manuel değiştir
router.patch('/reports/:id/status', [
  param('id').isInt(),
  body('status').isIn(['open', 'forwarded', 'reviewing', 'resolved', 'rejected']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rowCount } = await pool.query(
      `UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2`,
      [req.body.status, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Rapor bulunamadı.' });

    await notifyReportOwner(
      req.params.id,
      `Rapor durumu: ${STATUS_LABELS[req.body.status]}`,
      'Bildirdiğiniz çukurun durumu güncellendi.'
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// DELETE /api/admin/reports/:id — raporu tamamen sil
router.delete('/reports/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rows } = await pool.query(
      'DELETE FROM reports WHERE id = $1 RETURNING photo_url',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });

    if (rows[0].photo_url) {
      await deleteFromBlob(rows[0].photo_url);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/admin/users — kullanıcı listesi
router.get('/users', [
  query('role').optional().isIn(['citizen', 'municipality', 'admin']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { role, limit = 50, offset = 0 } = req.query;

  try {
    const { rows } = await pool.query(`
      SELECT id, email, name, role, municipality_code, created_at
      FROM users
      WHERE ($1::text IS NULL OR role = $1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [role || null, limit, offset]);
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// PATCH /api/admin/users/:id/role — kullanıcı rolünü değiştir
router.patch('/users/:id/role', [
  param('id').isInt(),
  body('role').isIn(['citizen', 'municipality', 'admin']),
  body('municipality_code').optional().isString().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rowCount } = await pool.query(
      `UPDATE users SET role = $1, municipality_code = $2 WHERE id = $3`,
      [req.body.role, req.body.municipality_code || null, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/admin/stats — genel platform istatistikleri
router.get('/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE moderation_status = 'approved' AND status != 'resolved') AS open_reports,
        COUNT(*) FILTER (WHERE moderation_status = 'approved' AND status = 'resolved')  AS resolved_reports,
        COUNT(*) FILTER (WHERE moderation_status = 'pending')                           AS pending_moderation,
        COUNT(*) FILTER (WHERE moderation_status = 'flagged')                           AS flagged_reports,
        COUNT(*) FILTER (WHERE moderation_status = 'rejected')                          AS rejected_reports,
        COUNT(*)                                                                         AS total_reports,
        SUM(me_too_count)                                                                AS total_metoo
      FROM reports
    `);

    const { rows: userRows } = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'municipality') AS municipality_users,
        COUNT(*) FILTER (WHERE role = 'admin') AS admin_users
      FROM users
    `);

    res.json({ reports: rows[0], users: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
