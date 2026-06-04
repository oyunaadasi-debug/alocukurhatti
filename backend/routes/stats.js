const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/stats/cities — iller lider tablosu
router.get('/cities', async (req, res) => {
  const sort = ['open', 'supported', 'fastest'].includes(req.query.sort) ? req.query.sort : 'open';
  const orderBy = sort === 'supported'
    ? 'total_metoo DESC, total_count DESC'
    : sort === 'fastest'
      ? 'avg_resolution_hours ASC NULLS LAST, resolved_count DESC'
      : 'open_count DESC, total_count DESC';

  try {
    const { rows } = await pool.query(`
      SELECT
        city,
        COUNT(*) FILTER (WHERE status != 'resolved') AS open_count,
        COUNT(*) FILTER (WHERE status = 'resolved')  AS resolved_count,
        COUNT(*)                                      AS total_count,
        SUM(me_too_count)                             AS total_metoo,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7_days,
        ROUND(AVG(EXTRACT(EPOCH FROM (res.first_resolved_at - reports.created_at)) / 3600)
          FILTER (WHERE res.first_resolved_at IS NOT NULL), 1) AS avg_resolution_hours
      FROM reports
      LEFT JOIN (
        SELECT report_id, MIN(created_at) AS first_resolved_at
        FROM resolutions
        GROUP BY report_id
      ) res ON res.report_id = reports.id
      WHERE moderation_status = 'approved'
        AND city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY ${orderBy}
      LIMIT 81
    `);
    res.json({ cities: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/stats/cities/:city — ilçe dökümü
router.get('/cities/:city', async (req, res) => {
  const { city } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT
        district,
        COUNT(*) FILTER (WHERE status != 'resolved') AS open_count,
        COUNT(*) FILTER (WHERE status = 'resolved')  AS resolved_count,
        COUNT(*)                                      AS total_count,
        SUM(me_too_count)                             AS total_metoo,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7_days,
        ROUND(AVG(EXTRACT(EPOCH FROM (res.first_resolved_at - reports.created_at)) / 3600)
          FILTER (WHERE res.first_resolved_at IS NOT NULL), 1) AS avg_resolution_hours,
        AVG(lat) AS center_lat,
        AVG(lng) AS center_lng
      FROM reports
      LEFT JOIN (
        SELECT report_id, MIN(created_at) AS first_resolved_at
        FROM resolutions
        GROUP BY report_id
      ) res ON res.report_id = reports.id
      WHERE moderation_status = 'approved'
        AND city ILIKE $1
        AND district IS NOT NULL AND district != ''
      GROUP BY district
      ORDER BY open_count DESC
    `, [city]);

    // Şehir toplamı
    const { rows: totals } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status != 'resolved') AS open_count,
        COUNT(*) FILTER (WHERE status = 'resolved')  AS resolved_count,
        COUNT(*)                                      AS total_count,
        SUM(me_too_count)                             AS total_metoo,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7_days,
        ROUND(AVG(EXTRACT(EPOCH FROM (res.first_resolved_at - reports.created_at)) / 3600)
          FILTER (WHERE res.first_resolved_at IS NOT NULL), 1) AS avg_resolution_hours,
        AVG(lat) AS center_lat,
        AVG(lng) AS center_lng
      FROM reports
      LEFT JOIN (
        SELECT report_id, MIN(created_at) AS first_resolved_at
        FROM resolutions
        GROUP BY report_id
      ) res ON res.report_id = reports.id
      WHERE moderation_status = 'approved'
        AND city ILIKE $1
    `, [city]);

    res.json({ city, summary: totals[0], districts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/stats/reporters — en duyarlı vatandaşlar (kayıtlı kullanıcılar)
router.get('/reporters', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id,
        COALESCE(u.name, split_part(u.email, '@', 1)) AS display_name,
        COUNT(r.id)         AS report_count,
        SUM(r.me_too_count) AS total_metoo,
        COUNT(r.id) FILTER (WHERE r.status = 'resolved') AS resolved_count
      FROM users u
      JOIN reports r ON r.user_id = u.id AND r.moderation_status = 'approved'
      GROUP BY u.id, u.name, u.email
      ORDER BY report_count DESC, total_metoo DESC
      LIMIT 20
    `);
    res.json({ reporters: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
