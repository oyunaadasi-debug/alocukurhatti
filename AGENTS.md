# AGENTS.md — Alo Çukur Hattı (Bağımsız Proje Hafızası)

> Bu dosya **bu projeye özeldir**. Üst klasördeki emlak/sosyal-medya bağlamıyla (Ti Group, Yoldaş, EMLAKPROJE vb.) **hiçbir ilgisi yoktur**. Alo Çukur Hattı tek başına ayrı bir üründür; kararları ve stili buradan okunur.

---

## Proje Kimliği

- **İsim:** Alo Çukur Hattı 🕳️
- **Tür:** Sosyal sorumluluk / sivil-tech / akademik platform
- **Fikir sahibi:** Talha Yılmaz
- **Vizyon:** Türkiye genelinde vatandaşların yol çukuru ve yol hasarlarını fotoğraflı, harita üzerinde, tarih damgalı raporlayabildiği; belediyeyi hesap vermeye iten kamuya açık platform.
- **Gelir modeli:** Tamamen ücretsiz, AdMob reklam. Sosyal sorumluluk/akademik kimlik ön planda.
- **Detaylı tasarım belgesi:** `beyin_firtinasi.md` (vizyon, roller, state machine, moderasyon)

## Kullanıcının Çalışma Tarzı (kalıcı)

- Talha **teknik değil** → ekran ekran ilerle, her adımı göster, onay al, toptan değişiklikten kaçın.
- Düzenli `git commit` ister — her anlamlı adımdan sonra kaydet.
- Tasarımı güzelleştirmeye önem veriyor (taste-skill gibi skiller kullanılacak).

---

## Teknik Mimari (3 parça, ortak backend)

### Backend — Express (CANLI)
- `backend/` · Express.js + Neon PostgreSQL (PostGIS coğrafi sorgular) + Vercel Blob (fotoğraf)
- Auth: JWT (anonim kullanıcı token'sız rapor ekleyebilir, kayıtlı kullanıcı JWT)
- Moderasyon: Google Vision SafeSearch (yükleme anı) + 3+ şikayet → otomatik gizle
- Route'lar: `auth.js, reports.js, admin.js, municipality.js, notifications.js, stats.js`
- Deploy: Vercel → **https://backend-mu-seven-26.vercel.app/api**

### Web — Next.js 14 (CANLI, EN OLGUN PARÇA)
- `web/` · Next.js 14 + React + Leaflet (harita) + SWR
- Sayfalar: harita ana sayfa, raporlar, rapor detay (`reports/[id]`), sıralama, admin paneli (queue/users/login), kvkk, giriş/kayıt, profilim, investor
- Bileşenler: `MapView, ReportActions, ReportList, ReportersTable, Leaderboard, MeTooButton, StatsBar, CookieBanner, Header`
- KVKK uyumlu: çerez banner, konum açık rıza, IP→SHA-256 hash, zorunlu onay checkbox
- Deploy: Vercel → **https://web-ten-kappa-37.vercel.app**

### Mobile — Expo (İSKELET, SDK 54 güncel)
- `mobile/` · Expo SDK 54 / RN 0.81 / React 19 (Yoldaş ile aynı, güncel stack)
- Kurulu: navigasyon (bottom-tab + stack), AuthContext (anonim destekli), tasarım token'ları (`src/theme.ts` — `C`/`R`/`S`/`elevation`/`statusColor`), `react-native-maps`
- 7 ekran: Map, AddReport, ReportDetail, Leaderboard, Profile, Login, Register
- Backend'e bağlı: `src/config.ts` → API_URL canlı backend'e işaret ediyor
- **Durum:** çalışan iskelet ama web'in son tasarım iyileştirmelerinin (modern arama çubuğu, şehir/ilçe istatistik kartı, polished harita) gerisinde. Son dokunulma 2026-05-19; web 2026-05-20'ye kadar geliştirildi.

---

## Tasarım Sistemi (`DESIGN.md` + `mobile/src/theme.ts`)

- **Token zorunlu:** ekranlarda doğrudan renk kodu yazılmaz, `C.` / `R.` / `S.` kullanılır.
- **Palet:** beyaz zemin (`canvas #FFFFFF`), tek aksan **Alarm Kırmızısı** (`primary #E53935`), otorite mavisi sadece "Ben de Gördüm" için (`secondary #1565C0`).
- **Durum renkleri:** açık=kırmızı, belediyeye iletildi=warning, inceleniyor=mavi, çözüldü=yeşil, reddedildi=gri (`statusColor`/`statusLabel` helper'ları).

## Rapor State Machine

`Açık → Belediyeye İletildi → İnceleniyor → Çözüldü / Reddedildi`
"Çözüldü" 3 katmanlı (Admin direkt / Belediye+foto / Vatandaş+foto). Çözüldüde orijinal + yeni foto yan yana.

---

## Kurulu Otomasyonlar (`.Codex/`, detay: `CLAUDE_AUTOMATIONS.md`)

- **Hooks:** `.env` koruma (PreToolUse) + web/ TypeScript otomatik `tsc --noEmit` (PostToolUse)
- **Skills:** `/api-endpoint` (Express route scaffold), `/db-migration` (idempotent PostGIS migration)
- **Agents:** `security-reviewer` (OWASP), `api-documenter` (OpenAPI üretir)

---

## Aktif Karar / Yön (2026-05-29)

**KARAR — Mobil yön:** Mevcut iskelet KORUNUR, sıfırdan yazılmaz (sağlam, güncel SDK 54, ortak canlı backend). Üzerine tasarım yenilemesi yapılıyor.

**KARAR — Tasarım dili:** Kullanıcı **Soft Structuralism** (yumuşak/modern) paletini seçti — eski alarm-kırmızısı kimlik bırakıldı. Yeni palet `mobile/src/theme.ts`'te: sıcak krem zemin (`canvas #FBF9F4`), nane/teal vurgu (`primary #1FA98B`), açık raporlar için mercan (`attention #E76F4F`), yumuşak otorite mavisi sadece "Ben de Gördüm" (`secondary #3B6EA5`). Gölgeler dağılmış/yumuşak ambient. Kart deseni: **double-bezel** (dış kabuk + iç çekirdek). CTA'lar **button-in-button** (nested ikon dairesi). Skill: `.Codex/skills/high-end-visual-design`.

**İlerleme (ekran ekran, kullanıcı onayıyla):**
- [x] `theme.ts` palet + elevation + statusColor güncellendi (global)
- [x] Harita ekranı (`MapScreen.tsx`) yenilendi — kullanıcı cihazda teyit edecek
- [ ] Kalan ekranlar: AddReport, ReportDetail, Leaderboard, Profile, Login, Register
- [ ] (Öneri/bekliyor) Premium font (Plus Jakarta Sans / Clash Display) — `expo-font` ile App.tsx'te yüklenmeli; ayrı adım

**Çalışma tarzı hatırlatma:** kullanıcı non-teknik → her ekran yenilemesinden sonra cihazda göster+onay al, sonra diğerine geç. Toptan tüm ekranları tek seferde yenileme.

**Bilinen kısıt:** `react-native-maps` Expo Go'da tam Google Maps göstermez → dev build gerekir (Yoldaş'taki aynı kısıt). `config.ts` ayrıca Mapbox token alanı içeriyor — harita sağlayıcı kararı verilmeli.

**Bilinen kısıt:** `react-native-maps` Expo Go'da tam Google Maps göstermez → dev build gerekir (Yoldaş'taki aynı kısıt). `config.ts` ayrıca Mapbox token alanı içeriyor — harita sağlayıcı kararı verilmeli.

## Canlı URL'ler

| Servis | URL |
|---|---|
| Web | https://web-ten-kappa-37.vercel.app |
| Backend API | https://backend-mu-seven-26.vercel.app |
