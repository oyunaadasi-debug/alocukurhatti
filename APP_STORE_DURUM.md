# 📱 Alo Çukur Hattı — App Store Durum / Yapılacaklar

**Son güncelleme:** 5 Haziran 2026

## ✅ Güncel Durum
- Önceki red sebebi olan kamera/izin akışı düzeltildi.
- Daha önceki hesap silme gereksinimi için uygulama içi **Hesabımı Sil** akışı mevcut.
- Canlı veritabanına V1 migration uygulandı: `severity`, `report_follows`, `area_subscriptions`.
- Backend production deploy edildi ve canlı API doğrulandı: raporlarda `severity` dönüyor, yakınımdaki rapor sorgusu çalışıyor.
- iOS Store build alındı ve App Store Connect'e yüklendi: **v1.0.0 / build 10**.
- Apple şu anda build'i App Store Connect/TestFlight tarafında işliyor.

## ✅ YAPILDI
- **Backend** (`backend/routes/auth.js`): `DELETE /api/auth/account` eklendi — kimlik doğrulamalı, kullanıcı kendi hesabını kalıcı siler (raporlar anonimleşir SET NULL, push/bildirim CASCADE, resolutions.resolved_by önce boşaltılır). **Commit:** `1cb00b1`.
- **Backend DEPLOY edildi → CANLI** (`backend-mu-seven-26.vercel.app`). Doğrulandı: token'sız `DELETE /api/auth/account` → **HTTP 401 "Token gerekli"** (404 değil = yayında).
- **Mobil** (`mobile/src/screens/ProfileScreen.tsx`): onaylı **"Hesabımı Sil"** akışı → siler → çıkış.
- **Build 5** alındı (build no 4→5, yerel credentials), EAS'te HAZIR:
  https://expo.dev/accounts/talha1yilmaz/projects/alocukurhatti/builds/1399796a-2872-4513-829e-d375baeab7ff

## 🟡 2 Haziran 2026 — Ek denetim
- Apple 5.1.1(i) için mobil Profil ekranına herkesin görebildiği **Gizlilik Politikası**, **Kullanım Koşulları** ve **Destek** bağlantıları eklendi.
- Expo Metro yapılandırması standart hale getirildi.
- Web destek/KVKK/koşullar metinleri güncellendi: uygulama içi hesap silme açıklandı, mevcut sürümde olmayan AdMob ifadeleri kaldırıldı.
- Web güncellemesi canlıya alındı (`web-ten-kappa-37.vercel.app`).
- Güvenlik düzeltmesi: herkese açık kayıt akışı yalnızca `citizen` hesabı oluşturur; belediye/admin rolleri yalnızca yönetici tarafından atanır.
- Backend güvenlik düzeltmesi canlıya alındı ve doğrulandı: dışarıdan `municipality` kaydı → HTTP 400.
- App Store için `1290×2796` ölçüsünde çerçeveli ekran görselleri üretildi (`app-store-assets/screenshots/6.9-framed/`). İlk ve üçüncü görsel kullanılabilir; sıralama görseli Build 6 sonrası temiz çekimle yenilenecek.
- 5 Haziran 2026: V1 büyüme özellikleri sonrası **Build 10** hazırlandı ve App Store Connect'e yüklendi.

## ⏳ KALDIĞIMIZ YER — YAPILACAKLAR
1. App Store Connect'te build 10 processing bitince sürüme seç.
2. App Store metadata'yı güncelle: açıklama, anahtar kelime, gizlilik cevapları.
3. Ekran görüntülerini mümkünse V1 özellikleriyle yenile: takip, yakınımdaki raporlar, ciddiyet.
4. **Ekran kaydı (önceki red için önerilir)** — fiziksel cihazda kaydet:
   giriş/kayıt → **Profil** → **"Hesabımı Sil"** → onay → hesap silinir + çıkış.
5. **ASC** → App Review Information → **Notes**'a kaydı ekle.
6. **Resolution Center** cevabı:
   > *"Account deletion has been added: Profile → 'Hesabımı Sil' (Delete My Account) → confirm. This permanently deletes the user's account and personal data (DELETE /api/auth/account). A screen recording of the full flow is included in the App Review notes."*
7. **Submit for Review.**

## Notlar
- Kod değişiklikleri yerelde commit'li (`1cb00b1`); GitHub'a push edilmedi (oyunaadasi-debug repo'su — push için o hesap gerekir). Build/deploy için gerekmedi.
- Apple Team JS9QMKM689, ascAppId 6775084979, bundle `com.talha.alocukurhatti`.
