const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body, query, param, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { upload, uploadToBlob, deleteFromBlob } = require('../middleware/upload');
const { checkImageSafe, checkVisionSafe } = require('../middleware/moderation');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { reverseGeocode } = require('../middleware/geocode');
const { sendExpoPushNotification } = require('./notifications');

function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || process.env.JWT_SECRET || 'default-salt';
  return crypto.createHash('sha256').update(salt + ip).digest('hex');
}

const SEVERITY_VALUES = ['small', 'medium', 'dangerous'];
const SEVERITY_LABELS = {
  small: 'Küçük',
  medium: 'Orta',
  dangerous: 'Tehlikeli',
};

async function notifyUsers(userIds, reportId, type, title, body) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (!uniqueIds.length) return;
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, report_id, type, title, body)
       SELECT unnest($1::int[]), $2, $3, $4, $5`,
      [uniqueIds, reportId, type, title, body]
    );
    const { rows } = await pool.query(
      `SELECT token FROM push_tokens WHERE user_id = ANY($1::int[])`,
      [uniqueIds]
    );
    const tokens = rows.map((r) => r.token).filter(Boolean);
    if (tokens.length) await sendExpoPushNotification(tokens, title, body, { reportId, type });
  } catch (err) {
    console.error('Bildirim gönderilemedi:', err);
  }
}

async function notifyReportFollowers(reportId, type, title, body, excludeUserId) {
  const { rows } = await pool.query(
    `SELECT user_id FROM report_follows
     WHERE report_id = $1 AND ($2::int IS NULL OR user_id != $2)`,
    [reportId, excludeUserId || null]
  );
  await notifyUsers(rows.map((r) => r.user_id), reportId, type, title, body);
}

async function notifyAreaSubscribers(report) {
  const { rows } = await pool.query(
    `SELECT user_id FROM area_subscriptions
     WHERE ($3::int IS NULL OR user_id != $3)
       AND (
         6371 * 2 * ASIN(SQRT(
           POWER(SIN(RADIANS(($1::float - lat) / 2)), 2) +
           COS(RADIANS(lat)) * COS(RADIANS($1::float)) *
           POWER(SIN(RADIANS(($2::float - lng) / 2)), 2)
         ))
       ) <= radius_km`,
    [report.lat, report.lng, report.user_id || null]
  );
  const place = [report.district, report.city].filter(Boolean).join(', ') || 'takip ettiğiniz bölgede';
  await notifyUsers(
    rows.map((r) => r.user_id),
    report.id,
    'area_new_report',
    'Yakınınızda yeni yol hasarı',
    `${place} yeni bir ${SEVERITY_LABELS[report.severity] || 'Orta'} rapor eklendi.`
  );
}

// GET /api/reports
router.get('/', [
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat({ min: 0.1, max: 100 }),
  query('city').optional().isString().trim(),
  query('status').optional().isIn(['open', 'forwarded', 'reviewing', 'resolved']),
  query('severity').optional().isIn(SEVERITY_VALUES),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { lat, lng, radius = 50, city, status = 'open', severity } = req.query;

  try {
    let queryText, queryParams;

    if (lat && lng) {
      // PostGIS yerine Haversine bounding box (Neon destekler ama basit tutalım)
      const latF = parseFloat(lat), lngF = parseFloat(lng), radF = parseFloat(radius);
      const latDelta = radF / 111.0;
      const lngDelta = radF / (111.0 * Math.cos(latF * Math.PI / 180));
      queryText = `
        SELECT id, lat, lng, address, city, district, photo_url,
               description, reporter_name, status, severity, me_too_count, created_at, issue_type,
               ROUND(CAST(
                 6371 * 2 * ASIN(SQRT(
                   POWER(SIN(RADIANS(($1::float - lat) / 2)), 2) +
                   COS(RADIANS(lat)) * COS(RADIANS($1::float)) *
                   POWER(SIN(RADIANS(($2::float - lng) / 2)), 2)
                 )) AS numeric
               ), 2) AS distance_km
        FROM reports
        WHERE moderation_status = 'approved'
          AND ($3::text IS NULL OR status = $3)
          AND ($4::text IS NULL OR city ILIKE $4)
          AND ($9::text IS NULL OR severity = $9)
          AND lat BETWEEN $5 AND $6
          AND lng BETWEEN $7 AND $8
        ORDER BY CASE WHEN severity = 'dangerous' THEN 0 ELSE 1 END, me_too_count DESC, distance_km ASC
        LIMIT 500
      `;
      queryParams = [lat, lng, status || null, city || null,
        latF - latDelta, latF + latDelta, lngF - lngDelta, lngF + lngDelta, severity || null];
    } else {
      queryText = `
        SELECT id, lat, lng, address, city, district, photo_url,
               description, reporter_name, status, severity, me_too_count, created_at, issue_type
        FROM reports
        WHERE moderation_status = 'approved'
          AND ($1::text IS NULL OR status = $1)
          AND ($2::text IS NULL OR city ILIKE $2)
          AND ($3::text IS NULL OR severity = $3)
        ORDER BY CASE WHEN severity = 'dangerous' THEN 0 ELSE 1 END, me_too_count DESC, created_at DESC
        LIMIT 500
      `;
      queryParams = [status || null, city || null, severity || null];
    }

    const { rows } = await pool.query(queryText, queryParams);
    res.json({ reports: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/reports/my — kullanıcının kendi raporları
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, lat, lng, address, city, district, photo_url,
              description, status, severity, me_too_count, created_at
       FROM reports
       WHERE user_id = $1 AND moderation_status = 'approved'
       ORDER BY created_at DESC
       LIMIT 200`,
      [req.user.id]
    );
    res.json({ reports: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/reports/following — kullanıcının takip ettiği raporlar
router.get('/following', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.lat, r.lng, r.address, r.city, r.district, r.photo_url,
              r.description, r.status, r.severity, r.me_too_count, r.created_at,
              rf.created_at AS followed_at
       FROM report_follows rf
       JOIN reports r ON r.id = rf.report_id
       WHERE rf.user_id = $1 AND r.moderation_status = 'approved'
       ORDER BY rf.created_at DESC
       LIMIT 200`,
      [req.user.id]
    );
    res.json({ reports: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/reports/:id
router.get('/:id', optionalAuth, param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
              EXISTS(
                SELECT 1 FROM report_follows rf
                WHERE rf.report_id = r.id AND rf.user_id = $2
              ) AS is_followed,
              (SELECT json_agg(res ORDER BY res.created_at DESC) FROM resolutions res WHERE res.report_id = r.id) AS resolutions,
              (SELECT json_agg(upd ORDER BY upd.created_at DESC) FROM report_updates upd WHERE upd.report_id = r.id) AS updates
       FROM reports r
       WHERE r.id = $1 AND r.moderation_status = 'approved'`,
      [id, req.user?.id || null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports/:id/follow — raporu takip et
router.post('/:id/follow', requireAuth, param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const exists = await pool.query(
      `SELECT id FROM reports WHERE id = $1 AND moderation_status = 'approved'`,
      [req.params.id]
    );
    if (!exists.rows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });

    await pool.query(
      `INSERT INTO report_follows (report_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (report_id, user_id) DO NOTHING`,
      [req.params.id, req.user.id]
    );
    res.json({ following: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// DELETE /api/reports/:id/follow — rapor takibini bırak
router.delete('/:id/follow', requireAuth, param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await pool.query(
      `DELETE FROM report_follows WHERE report_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ following: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports
router.post('/', optionalAuth, upload.single('photo'), [
  body('lat').isFloat({ min: 35, max: 43 }).withMessage('Geçersiz enlem (Türkiye sınırları dışı).'),
  body('lng').isFloat({ min: 25, max: 45 }).withMessage('Geçersiz boylam (Türkiye sınırları dışı).'),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('reporter_name').optional().isString().trim().isLength({ max: 100 }),
  body('issue_type').optional().isIn(['cukur', 'bozuk_yol', 'kaldirim', 'tumsek', 'su_birikintisi']),
  body('severity').optional().isIn(SEVERITY_VALUES),
  body('address').optional().isString().trim().isLength({ max: 300 }),
  body('city').optional().isString().trim().isLength({ max: 100 }),
  body('district').optional().isString().trim().isLength({ max: 100 }),
], async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fotoğraf zorunludur.' });

  const mimeCheck = checkImageSafe(req);
  if (!mimeCheck.safe) return res.status(422).json({ error: mimeCheck.reason });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { lat, lng, description, reporter_name, issue_type = 'cukur', severity = 'medium' } = req.body;
  let { address, city, district } = req.body;

  // Blob'a yükle
  let photoUrl, photoPublicId;
  try {
    const blob = await uploadToBlob(req.file);
    photoUrl = blob.url;
    photoPublicId = blob.pathname;
  } catch (err) {
    console.error('Blob yükleme hatası:', err);
    return res.status(500).json({ error: 'Fotoğraf yüklenemedi.' });
  }

  // Adres yoksa otomatik doldur
  if (!address || !city) {
    const geo = await reverseGeocode(lat, lng);
    address = address || geo.address;
    city = city || geo.city;
    district = district || geo.district;
  }

  // Google Vision moderasyon (API key varsa)
  const visionCheck = await checkVisionSafe(photoUrl);
  if (!visionCheck.safe) {
    await deleteFromBlob(photoUrl);
    return res.status(422).json({ error: visionCheck.reason });
  }

  const reporterIp = hashIp(req.ip);
  const userId = req.user?.id || null;
  try {
    const { rows } = await pool.query(
      `INSERT INTO reports (lat, lng, photo_url, photo_public_id, description,
                            reporter_name, reporter_ip, address, city, district, user_id, issue_type, severity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, lat, lng, photo_url, description, reporter_name, status, severity, me_too_count, created_at, issue_type, city, district, user_id`,
      [lat, lng, photoUrl, photoPublicId, description || null,
       reporter_name || null, reporterIp, address || null, city || null, district || null, userId,
       ['cukur', 'bozuk_yol', 'kaldirim', 'tumsek', 'su_birikintisi'].includes(issue_type) ? issue_type : 'cukur',
       SEVERITY_VALUES.includes(severity) ? severity : 'medium']
    );
    await notifyAreaSubscribers(rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    await deleteFromBlob(photoUrl);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports/:id/metoo
router.post('/:id/metoo', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const ip = hashIp(req.ip);
  try {
    await pool.query(
      `INSERT INTO me_too (report_id, reporter_ip) VALUES ($1, $2)
       ON CONFLICT (report_id, reporter_ip) DO NOTHING`,
      [id, ip]
    );
    await pool.query(
      `UPDATE reports SET me_too_count = (SELECT COUNT(*) FROM me_too WHERE report_id = $1) WHERE id = $1`,
      [id]
    );
    const { rows } = await pool.query('SELECT me_too_count FROM reports WHERE id = $1', [id]);
    res.json({ me_too_count: rows[0]?.me_too_count ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports/:id/resolve
router.post('/:id/resolve', requireAuth, upload.single('photo'), [
  param('id').isInt(),
  body('note').optional().isString().trim().isLength({ max: 500 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { note } = req.body;
  const resolverRole = req.user.role;

  if (resolverRole !== 'admin' && !req.file) {
    return res.status(400).json({ error: 'Çözüm kanıtı olarak fotoğraf zorunludur.' });
  }

  try {
    const { rows: reportRows } = await pool.query(
      'SELECT id, status FROM reports WHERE id = $1 AND moderation_status = $2',
      [id, 'approved']
    );
    if (!reportRows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });
    if (reportRows[0].status === 'resolved') return res.status(409).json({ error: 'Bu rapor zaten çözüldü.' });

    let photoUrl = null;
    if (req.file) {
      const mimeCheck = checkImageSafe(req);
      if (!mimeCheck.safe) return res.status(422).json({ error: mimeCheck.reason });
      const blob = await uploadToBlob(req.file);
      photoUrl = blob.url;
    }

    await pool.query('BEGIN');
    await pool.query(
      `INSERT INTO resolutions (report_id, resolved_by, resolver_role, photo_url, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, req.user.id, resolverRole, photoUrl, note || null]
    );
    await pool.query(`UPDATE reports SET status = 'resolved', updated_at = NOW() WHERE id = $1`, [id]);
    await pool.query('COMMIT');
    await notifyReportFollowers(
      id,
      'report_resolved',
      'Takip ettiğiniz rapor çözüldü',
      'Bir yol hasarı çözüldü olarak işaretlendi.',
      req.user.id
    );

    res.json({ success: true, message: 'Rapor çözüldü olarak işaretlendi.' });
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports/:id/updates — vatandaş güncelleme
router.post('/:id/updates', upload.single('photo'), [
  param('id').isInt(),
  body('update_type').isIn(['complaint_joined', 'resolution_proof', 'still_unresolved']),
  body('note').optional().isString().trim().isLength({ max: 300 }),
  body('reporter_name').optional().isString().trim().isLength({ max: 100 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { update_type, note, reporter_name } = req.body;
  const reporterIp = hashIp(req.ip);

  if (update_type === 'resolution_proof' && !req.file) {
    return res.status(400).json({ error: 'Çözüm kanıtı için fotoğraf zorunludur.' });
  }

  try {
    const { rows: reportRows } = await pool.query(
      `SELECT id FROM reports WHERE id = $1 AND moderation_status = 'approved'`, [id]
    );
    if (!reportRows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });

    let photoUrl = null, photoPublicId = null;
    if (req.file) {
      const mimeCheck = checkImageSafe(req);
      if (!mimeCheck.safe) return res.status(422).json({ error: mimeCheck.reason });
      const blob = await uploadToBlob(req.file);
      photoUrl = blob.url;
      photoPublicId = blob.pathname;
    }

    const { rows } = await pool.query(
      `INSERT INTO report_updates (report_id, update_type, photo_url, photo_public_id, note, reporter_name, reporter_ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, update_type, photoUrl, photoPublicId, note || null, reporter_name || null, reporterIp]
    );
    const title = update_type === 'resolution_proof'
      ? 'Takip ettiğiniz rapora çözüm kanıtı eklendi'
      : 'Takip ettiğiniz rapor güncellendi';
    const body = update_type === 'resolution_proof'
      ? 'Bir vatandaş yol hasarının düzeldiğini fotoğrafla bildirdi.'
      : 'Bir vatandaş sorunun hâlâ devam ettiğini bildirdi.';
    await notifyReportFollowers(id, 'report_update', title, body, null);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports/:id/flag
router.post('/:id/flag', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const ip = hashIp(req.ip);
  try {
    const exists = await pool.query('SELECT id FROM reports WHERE id = $1', [id]);
    if (!exists.rows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });

    await pool.query(
      `INSERT INTO report_flags (report_id, reporter_ip) VALUES ($1, $2)
       ON CONFLICT (report_id, reporter_ip) DO NOTHING`,
      [id, ip]
    );
    const { rows } = await pool.query('SELECT COUNT(*) AS flag_count FROM report_flags WHERE report_id = $1', [id]);
    const flagCount = parseInt(rows[0].flag_count);

    // Otomatik gizleme eşiği yüksek tutulur; az sayıda IP ile meşru raporun
    // sansürlenmesini zorlaştırır (F-003). Daha güçlü çözüm: kimlik doğrulamalı/CAPTCHA'lı flag.
    if (flagCount >= 10) {
      await pool.query(
        `UPDATE reports SET moderation_status = 'flagged' WHERE id = $1 AND moderation_status = 'approved'`,
        [id]
      );
    }
    res.json({ flagged: true, flag_count: flagCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
