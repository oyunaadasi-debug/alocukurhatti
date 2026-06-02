const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı.'),
  body('name').optional().isString().trim().isLength({ max: 100 }),
  body('role').optional().equals('citizen').withMessage('Yetkili roller yalnızca yönetici tarafından atanabilir.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, municipality_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, created_at`,
      [email, password_hash, name || null, 'citizen', null]
    );

    const user = rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token: signToken(safeUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GET /api/auth/me — token doğrulama + profil
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token gerekli.' });

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, email, name, role, municipality_code, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json(rows[0]);
  } catch {
    res.status(401).json({ error: 'Geçersiz token.' });
  }
});

// DELETE /api/auth/account — kullanıcı kendi hesabını kalıcı siler (Apple 5.1.1(v))
router.delete('/account', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token gerekli.' });

  let userId;
  try {
    userId = jwt.verify(header.slice(7), process.env.JWT_SECRET).id;
  } catch {
    return res.status(401).json({ error: 'Geçersiz token.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // resolutions.resolved_by'da ON DELETE kuralı yok → silmeden önce boşalt.
    await client.query('UPDATE resolutions SET resolved_by = NULL WHERE resolved_by = $1', [userId]);
    // users silinince: raporlar/me_too anonimleşir (SET NULL), push_token/bildirim silinir (CASCADE).
    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    if (!rowCount) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Hesap silme hatası:', err);
    res.status(500).json({ error: 'Hesap silinemedi.' });
  } finally {
    client.release();
  }
});

module.exports = router;
