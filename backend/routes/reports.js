const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { upload, uploadToBlob, deleteFromBlob } = require('../middleware/upload');
const { checkImageSafe, checkVisionSafe } = require('../middleware/moderation');
const { requireAuth } = require('../middleware/auth');
const { reverseGeocode } = require('../middleware/geocode');

// GET /api/reports
router.get('/', [
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat({ min: 0.1, max: 100 }),
  query('city').optional().isString().trim(),
  query('status').optional().isIn(['open', 'forwarded', 'reviewing', 'resolved']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { lat, lng, radius = 50, city, status = 'open' } = req.query;

  try {
    let queryText, queryParams;

    if (lat && lng) {
      // PostGIS yerine Haversine bounding box (Neon destekler ama basit tutalım)
      const latF = parseFloat(lat), lngF = parseFloat(lng), radF = parseFloat(radius);
      const latDelta = radF / 111.0;
      const lngDelta = radF / (111.0 * Math.cos(latF * Math.PI / 180));
      queryText = `
        SELECT id, lat, lng, address, city, district, photo_url,
               description, reporter_name, status, me_too_count, created_at,
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
          AND lat BETWEEN $5 AND $6
          AND lng BETWEEN $7 AND $8
        ORDER BY distance_km ASC
        LIMIT 500
      `;
      queryParams = [lat, lng, status || null, city || null,
        latF - latDelta, latF + latDelta, lngF - lngDelta, lngF + lngDelta];
    } else {
      queryText = `
        SELECT id, lat, lng, address, city, district, photo_url,
               description, reporter_name, status, me_too_count, created_at
        FROM reports
        WHERE moderation_status = 'approved'
          AND ($1::text IS NULL OR status = $1)
          AND ($2::text IS NULL OR city ILIKE $2)
        ORDER BY created_at DESC
        LIMIT 500
      `;
      queryParams = [status || null, city || null];
    }

    const { rows } = await pool.query(queryText, queryParams);
    res.json({ reports: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/reports/:id
router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
              json_agg(res ORDER BY res.created_at DESC) FILTER (WHERE res.id IS NOT NULL) AS resolutions
       FROM reports r
       LEFT JOIN resolutions res ON res.report_id = r.id
       WHERE r.id = $1 AND r.moderation_status = 'approved'
       GROUP BY r.id`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Rapor bulunamadı.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports
router.post('/', upload.single('photo'), [
  body('lat').isFloat({ min: 35, max: 43 }).withMessage('Geçersiz enlem (Türkiye sınırları dışı).'),
  body('lng').isFloat({ min: 25, max: 45 }).withMessage('Geçersiz boylam (Türkiye sınırları dışı).'),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('reporter_name').optional().isString().trim().isLength({ max: 100 }),
  body('address').optional().isString().trim().isLength({ max: 300 }),
  body('city').optional().isString().trim().isLength({ max: 100 }),
  body('district').optional().isString().trim().isLength({ max: 100 }),
], async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fotoğraf zorunludur.' });

  const mimeCheck = checkImageSafe(req);
  if (!mimeCheck.safe) return res.status(422).json({ error: mimeCheck.reason });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { lat, lng, description, reporter_name } = req.body;
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

  const reporterIp = req.ip;
  try {
    const { rows } = await pool.query(
      `INSERT INTO reports (lat, lng, photo_url, photo_public_id, description,
                            reporter_name, reporter_ip, address, city, district)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, lat, lng, photo_url, description, reporter_name, status, me_too_count, created_at`,
      [lat, lng, photoUrl, photoPublicId, description || null,
       reporter_name || null, reporterIp, address || null, city || null, district || null]
    );
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
  const ip = req.ip;
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

    res.json({ success: true, message: 'Rapor çözüldü olarak işaretlendi.' });
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reports/:id/flag
router.post('/:id/flag', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const ip = req.ip;
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

    if (flagCount >= 3) {
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
