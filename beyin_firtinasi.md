# ALO ÇUKUR HATTI — Proje Tasarım Belgesi

**Tarih:** 2026-05-14  
**Fikir sahibi:** Talha Yılmaz  
**Proje türü:** Sosyal sorumluluk / sivil tech / akademik

---

## Vizyon

Türkiye genelinde vatandaşların yol çukuru ve yol hasarlarını fotoğraflı, harita üzerinde,  
tarih damgalı olarak raporlayabildiği, belediyeyi hesap vermeye zorlayan kitlesel platform.

---

## Kullanıcı Kararları (Kesinleşti)

### 1. Kimlik / Kayıt
- Kayıt **zorunlu değil** — anonim rapor gönderilebilir
- İsteğe bağlı üyelik: profil, isim, bildirim alma
- Raporlayan ismi paylaşmak isterse görünür, istemezse "Anonim vatandaş"

### 2. Belediye Bildirimi
- Sistem altyapıda **mevcut** ama varsayılan kapalı
- Belediye ile anlaşma yapılınca o ilçe için aktifleştirilir
- Anlaşmadan önce: "Belediyenize iletilmek istiyorsanız anlaşma yapın" mesajı

### 3. "Çözüldü" Sistemi — 3 Katmanlı
| Kim | Nasıl | Kanıt |
|---|---|---|
| **Admin** | Direkt işaretler | Gerekmez |
| **Belediye Memuru** | İşaretler + fotoğraf zorunlu | Onarım fotoğrafı |
| **Vatandaş** | İşaretler + fotoğraf zorunlu | Yeni halin fotoğrafı |

Çözüldü durumunda orijinal + yeni fotoğraf yan yana gösterilir.

### 4. Platform
- **Mobil öncelikli** (React Native / Expo)
- Web görüntüleme ek olarak (harita browsing)

### 5. Gelir Modeli
- Uygulama içi reklam (Google AdMob)
- Tamamen ücretsiz kullanım
- Sosyal sorumluluk projesi — akademik/sivil kimlik ön planda

### 6. Moderasyon — İki Katmanlı
- **Katman 1 — Yükleme anında:** Google Vision SafeSearch API
  - NSFW, şiddet, kan, müstehcenlik → otomatik red, yüklenmez
- **Katman 2 — Sonradan:** Kullanıcı "Uygunsuz bildir" butonu
  - 3+ şikayet → otomatik gizle + admin kuyruğuna al
  - Admin onaylarsa silinir, yanlış bildirimse geri açılır

---

## Rapor Durumları (State Machine)

```
Açık → Belediyeye İletildi → İnceleniyor → Çözüldü
                                         → Reddedildi (belediye: yetki alanımız dışı vb.)
```

---

## Kullanıcı Rolleri

| Rol | Yapabilecekleri |
|---|---|
| **Anonim** | Rapor ekle, haritayı gör, "Ben de gördüm" |
| **Kayıtlı Vatandaş** | + Profil, bildirim alma, "Çözüldü" işaretle + fotoğraf |
| **Belediye Memuru** | + "Çözüldü" işaretle (fotoğraf zorunlu), belediye paneli |
| **Admin** | Her şey |

---

## Teknik Mimari

### Mobil (React Native / Expo)
- Kamera entegrasyonu (expo-camera / expo-image-picker)
- Konum: expo-location (otomatik GPS + manuel pin)
- Harita: react-native-maps (Google Maps) veya Mapbox
- Push notification: Expo Notifications

### Backend (Node.js + Express)
- PostgreSQL + PostGIS (coğrafi sorgular: "en yakın 10 çukur")
- Fotoğraf: Cloudinary (ücretsiz 25GB başlangıç)
- Moderasyon: Google Vision SafeSearch API
- Auth: JWT (anonim için token yok, kayıtlı için JWT)
- Belediye API: webhook sistemi (anlaşma yapılınca aktif)

### Web (Next.js veya statik)
- Harita browsing (Mapbox GL JS veya Leaflet)
- Rapor detay sayfaları (SEO — "Adana Turgut Özal Blv çukur")
- Admin paneli

### Altyapı
- Deploy: Render (backend) + Vercel (web)
- DB: Render PostgreSQL veya Supabase
- CDN: Cloudinary

---

## Rakip Analizi

| Platform | Ülke | Eksik olan |
|---|---|---|
| SeeClickFix | ABD | TR lokalizasyonu yok |
| FixMyStreet | İngiltere | Açık kaynak ama TR adaptasyonu yok |
| e-Belediye şikayet | TR | Fotoğraf yok, harita yok, kamuya açık değil |

**Alo Çukur Hattı farkı:** Kamuya açık harita + sosyal baskı + fotoğraflı çözüm kanıtı

---

## Sonraki Adımlar

- [ ] Logo / isim (Alacukur kesin mi?)
- [ ] MVP scope belirle (hangi özellikler ilk sürümde)
- [ ] GitHub repo aç
- [ ] Backend iskelet (yoldas'tan fork)
- [ ] Harita + rapor ekleme ekranı (mobil)
- [ ] Google Vision entegrasyonu

---

## Notlar

_Tartışma devam ettikçe buraya eklenecek._
