---
name: api-endpoint
description: Alo Çukur Hattı backend için yeni Express route endpoint'i scaffold eder. express-validator + pool.query + hata yönetimi kalıbına uyar.
---

# API Endpoint Scaffold

Kullanıcı yeni bir API endpoint'i tanımladığında bu skill'i kullan.

## Proje Kalıbı

Tüm endpoint'ler şu yapıya uyar:

```js
// METHOD /api/<route>/<path>
router.<method>('<path>', [
  // express-validator kuralları
  body('field').isString().trim(),
  param('id').isInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rows } = await pool.query(`SQL`, [params]);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});
```

## Adımlar

1. Kullanıcıdan şunları öğren:
   - HTTP metodu (GET / POST / PATCH / DELETE)
   - URL path (/api/...)
   - Hangi route dosyasına eklenecek (routes/ altında)
   - Gerekli parametreler (body, query, param)
   - Kimlik doğrulama gerekiyor mu? (requireAuth / requireRole)
   - Hangi DB tablosu kullanılacak

2. Mevcut route dosyasını oku, stiline uy

3. Endpoint kodu yaz:
   - Validation kurallarını ekle
   - Auth gerekiyorsa middleware'i ekle
   - SQL sorgusu yaz (PostGIS gerekiyorsa ST_ fonksiyonları kullan)
   - Hata yönetimi ekle
   - Transaction gerekiyorsa BEGIN/COMMIT/ROLLBACK kullan

4. Route'u `server.js`'e eklemek gerekiyorsa ekle

## Örnek Kullanım

"GET /api/reports/nearby — 5km içindeki açık raporları döndür"
→ reports.js'e radius + ST_DWithin sorgusu ekle
