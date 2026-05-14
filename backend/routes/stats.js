const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/stats/cities — iller lider tablosu
router.get('/cities', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        city,
        COUNT(*) FILTER (WHERE status != 'resolved') AS open_count,
        COUNT(*) FILTER (WHERE status = 'resolved')  AS resolved_count,
        COUNT(*)                                      AS total_count,
        SUM(me_too_count)                             AS total_metoo
      FROM reports
      WHERE moderation_status = 'approved'
        AND city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY open_count DESC, total_count DESC
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
        AVG(lat) AS center_lat,
        AVG(lng) AS center_lng
      FROM reports
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
        AVG(lat) AS center_lat,
        AVG(lng) AS center_lng
      FROM reports
      WHERE moderation_status = 'approved'
        AND city ILIKE $1
    `, [city]);

    res.json({ city, summary: totals[0], districts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
