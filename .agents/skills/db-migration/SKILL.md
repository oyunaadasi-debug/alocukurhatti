---
name: db-migration
description: Alo Çukur Hattı için yeni PostgreSQL migration dosyası oluşturur ve backend/scripts/ altına kaydeder. Schema.sql ile uyumlu kalır.
---

# DB Migration Skill

Yeni tablo, sütun veya index eklemek gerektiğinde bu skill'i kullan.

## Proje DB Bilgisi

- **DB**: PostgreSQL + PostGIS
- **Bağlantı**: `backend/db/pool.js` → `DATABASE_URL` env
- **Ana schema**: `backend/db/schema.sql`
- **Migration runner**: `backend/scripts/runSchema.js`

## Adımlar

1. Kullanıcıdan değişikliği öğren:
   - Yeni tablo mı? Sütun ekleme mi? Index mi?
   - Mevcut tablolarla ilişki var mı? (REFERENCES)

2. `backend/db/schema.sql` dosyasını oku — mevcut tabloları anla

3. Migration SQL yaz:
   - Her zaman `IF NOT EXISTS` kullan — idempotent olsun
   - `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`
   - PostGIS kullanılıyorsa `CREATE EXTENSION IF NOT EXISTS postgis`
   - Coğrafi sütunlar için `GIST` index ekle

4. Migration dosyasını oluştur:
   - Dosya adı: `backend/db/migrations/YYYYMMDD_açıklama.sql`
   - Schema.sql'e de ekle (kalıcı kayıt için)

5. Kullanıcıya çalıştırma komutunu ver:
   ```bash
   node backend/scripts/runSchema.js
   # veya
   psql $DATABASE_URL -f backend/db/migrations/<dosya>.sql
   ```

## Örnek

"push_tokens tablosuna `device_name` sütunu ekle"
→ `ALTER TABLE push_tokens ADD COLUMN IF NOT EXISTS device_name TEXT;`
→ schema.sql'e ekle + migrations/ altına kaydet
