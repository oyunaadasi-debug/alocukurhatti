# Alo Çukur Hattı — Değişiklik Günlüğü

---

## [2026-05-19] — Oturum 4: Şikayet Kategorileri + Vatandaş Güncelleme Sistemi

### Veritabanı
- `reports` tablosuna `issue_type VARCHAR(50) DEFAULT 'cukur'` kolonu eklendi
- Yeni `report_updates` tablosu oluşturuldu:
  - `update_type`: `complaint_joined` | `resolution_proof` | `still_unresolved`
  - `photo_url`, `note`, `reporter_name`, `reporter_ip` (hash'li) alanları
  - Migration dosyası: `backend/scripts/008_report_updates.sql`

### Backend (`backend/routes/reports.js`)
- `GET /api/reports` — `issue_type` alanı SELECT'e eklendi
- `GET /api/reports/:id` — subquery ile `resolutions` + `updates` alanları döndürülüyor
- `POST /api/reports` — `issue_type` body'den alınıp INSERT'e eklendi
- `POST /api/reports/:id/updates` — yeni endpoint:
  - Vatandaş güncelleme ekleyebilir (fotoğraflı veya sadece not)
  - `resolution_proof` tipinde fotoğraf zorunlu
  - IP adresi hash'li kaydediliyor

### Web — Harita (`web/components/MapView.tsx`)
- `ISSUE_TYPES` sabiti eklendi (5 kategori: Çukur, Bozuk Yol, Kaldırım, Tümsek, Su Birikintisi)
- Şikayet formunda kategori seçim grid'i eklendi (formun ilk adımı)
- "Şikayet Bildir" butonu büyütüldü ve pulse animasyonu eklendi
- Form gönderiminde `issue_type` alanı backend'e iletiliyor

### Web — Rapor Detayı (`web/app/reports/[id]/page.tsx`)
- Fotoğraf üzerinde sağ üst köşeye `issue_type` etiketi eklendi
- Vatandaş güncellemeleri zaman çizelgesi eklendi (tip'e göre renk kodlu):
  - 🙋 Ben de Şikayetçiyim → turuncu
  - ⏳ Hala Devam Ediyor → kırmızı
  - ✅ Çözüldü — Kanıtı Bu → yeşil
- `ReportActions` client bileşeni import edildi
- Sayfa metadata'sı `issue_type`'a göre dinamik hale getirildi

### Web — Yeni Bileşen (`web/components/ReportActions.tsx`)
- `'use client'` — tamamen istemci taraflı
- 3 akordeon buton ile vatandaş güncelleme formu:
  - Fotoğraf yükleme (sürükle-bırak önizlemeli)
  - Açıklama ve isim alanları
  - `POST /api/reports/:id/updates` isteği gönderir
  - Başarı mesajı gösterir

---

## [2026-05-19] — Oturum 3: KVKK & Yasal Uyum

- `/kvkk` aydınlatma metni sayfası eklendi (KVKK Madde 10)
- Çerez banner'ı eklendi — `CookieBanner.tsx` + `layout.tsx` (ePrivacy + KVKK)
- Konum rızası dialog'u eklendi — `MapView.tsx` (KVKK Madde 5/1 açık rıza)
- Şikayet formuna zorunlu KVKK onay checkbox'ı eklendi
- IP adresi → SHA-256 hash (geri döndürülemez); ham IP DB'ye yazılmıyor
- `profilim` sayfası eklendi

---

## [2026-05-19] — Oturum 2: Temel Özellikler

- Admin Cloudinary bug'ı düzeltildi → `deleteFromBlob()` kullanılıyor
- Rapor onaylandığında push bildirim eklendi ("Şikayetiniz yayınlandı 🎉")
- Harita popup'ına "👍 Ben de gördüm" butonu eklendi
- `/reports/[id]` sayfasına WhatsApp paylaşım butonu eklendi
- `/siralama` sayfasına "En Duyarlı Vatandaşlar" tablosu eklendi
- Yeni endpoint: `GET /api/stats/reporters`

---

## [2026-05-19] — Oturum 1: İlk Kurulum

- Harita alt ortasına "📍 Şikayet Bildir" butonu eklendi (GPS konum alıyor)
- `next.config.js`'e Vercel Blob domain eklendi (fotoğraf görünmüyordu)
- Backend + web Vercel'e deploy edildi

---

## Canlı URL'ler

| Servis | URL |
|--------|-----|
| Web | https://web-ten-kappa-37.vercel.app |
| Backend API | https://backend-mu-seven-26.vercel.app |

## Stack

- **Frontend:** Next.js 14, React, Leaflet (harita), SWR
- **Backend:** Express.js, Vercel Blob (fotoğraf), Render PostgreSQL
- **Auth:** JWT
- **Push:** Expo Notifications
