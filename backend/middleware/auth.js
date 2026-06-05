const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
}

// Yetkiyi token claim'inden DEĞİL, DB'deki GÜNCEL rolden doğrula.
// Böylece rolü düşürülen (ör. admin → citizen) bir kullanıcının elindeki
// eski token artık ayrıcalıklı işlem yapamaz (F-001).
function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
    }
    try {
      const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
      const currentRole = rows[0]?.role;
      if (!currentRole || !roles.includes(currentRole)) {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
      }
      req.user.role = currentRole; // taze rol ile devam et
      next();
    } catch (err) {
      console.error('Rol doğrulama hatası:', err);
      res.status(500).json({ error: 'Sunucu hatası.' });
    }
  };
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      // geçersiz token — kullanıcısız devam et
    }
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth };
