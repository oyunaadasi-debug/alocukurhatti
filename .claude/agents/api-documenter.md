---
name: api-documenter
description: Alo Çukur Hattı backend route'larını okuyup OpenAPI 3.0 dokümantasyonu oluşturur. Belediye entegrasyonu ve üçüncü taraf erişim için.
---

# API Documenter Agent

Backend route dosyalarını okuyup OpenAPI 3.0 spec üretir.

## İncelenecek Dosyalar

- `backend/routes/reports.js`
- `backend/routes/stats.js`
- `backend/routes/auth.js`
- `backend/routes/admin.js`
- `backend/routes/notifications.js`
- `backend/routes/municipality.js`

## Çıktı Formatı

`backend/docs/openapi.yaml` dosyası oluştur:

```yaml
openapi: 3.0.0
info:
  title: Alo Çukur Hattı API
  version: 1.0.0
  description: Vatandaş güdümlü yol hasar raporlama platformu

servers:
  - url: https://api.alocukurhatti.com
    description: Production
  - url: http://localhost:3000
    description: Development

paths:
  /api/reports:
    get: ...
    post: ...
  ...
```

## Her Endpoint İçin Belgele

- HTTP metodu ve path
- Açıklama (Türkçe)
- Auth gereksinimi (Bearer JWT)
- Request body / query params / path params (schema + örnekler)
- Response örnekleri (200, 400, 401, 404, 500)
- Rate limit bilgisi

## Öncelik Sırası

1. `POST /api/reports` — en çok kullanılan
2. `GET /api/reports` — harita için kritik
3. `POST /api/municipality/forward/:id` — belediye entegrasyonu
4. `POST /api/auth/*` — giriş/kayıt
5. Diğerleri
