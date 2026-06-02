# 📱 Alo Çukur Hattı — App Store Durum / Yapılacaklar

**Son güncelleme:** 2 Haziran 2026

## 🔴 Red (çözülüyor)
- **Guideline 5.1.1(v)** — Hesap silme yok. (Build 4, v1.0.0)
- Apple: hesap açan uygulamada **uygulama içi hesap silme** olmalı + **ekran kaydı** istiyor.

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
- Bu değişiklikler nedeniyle Build 5 yerine **Build 6** hazırlanmalı.

## ⏳ KALDIĞIMIZ YER — YAPILACAKLAR
1. **Build 6 al**:
   ```
   cd "C:\Users\talha\OneDrive\Masaüstü\telegram bot\alocukurhatti\mobile"
   npx eas-cli build --platform ios --profile production
   ```
2. **Submit build 6** — otomatik submit takılırsa interaktif Apple girişiyle:
   ```
   cd "C:\Users\talha\OneDrive\Masaüstü\telegram bot\alocukurhatti\mobile"
   npx eas-cli submit --platform ios --profile production --latest
   ```
   → Apple girişi/anahtarı seç (mevcut "[Expo] EAS Submit" anahtarını kullanabilirsin). Bir kez kurulunca sonraki seferler otomatik.
3. **Ekran kaydı (ZORUNLU)** — build 6 TestFlight'a düşünce fiziksel cihazda kaydet:
   giriş/kayıt → **Profil** → **"Hesabımı Sil"** → onay → hesap silinir + çıkış.
4. **ASC** → App Review Information → **Notes**'a kaydı ekle.
5. **Resolution Center** cevabı:
   > *"Account deletion has been added: Profile → 'Hesabımı Sil' (Delete My Account) → confirm. This permanently deletes the user's account and personal data (DELETE /api/auth/account). A screen recording of the full flow is included in the App Review notes."*
6. **Submit for Review.**

## Notlar
- Kod değişiklikleri yerelde commit'li (`1cb00b1`); GitHub'a push edilmedi (oyunaadasi-debug repo'su — push için o hesap gerekir). Build/deploy için gerekmedi.
- Apple Team JS9QMKM689, ascAppId 6775084979, bundle `com.talha.alocukurhatti`.
