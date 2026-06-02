# 🚀 Alo Çukur Hattı — App Store Yayın Kılavuzu

> Bu dosya yayın sürecinin tek kaynağıdır. Her adım tamamlandıkça `[ ]` → `[x]` işaretle.
> Güncellenme: 2026-05-29

---

## 0) Şu an hazır olanlar ✅ (Claude tarafından yapıldı)

- [x] EAS projesi oluşturuldu ve bağlandı → `projectId: 9e16af7f-5e95-4abe-8a41-bd5671e7640a` (sahip: talha1yilmaz)
- [x] `app.json` hazır: bundle id `com.talha.alocukurhatti`, sürüm `1.0.0`, izin açıklamaları (konum/kamera/galeri)
- [x] İkon 1024×1024, splash 1242×2688 — Apple boyut kurallarına uygun
- [x] expo 54.0.35'e hizalandı (expo-doctor sürüm uyumu)
- [x] Mağaza metinleri hazır → `app-store-assets/app-store-metadata.md` (açıklama, anahtar kelimeler, gizlilik tablosu)
- [x] Premium font (Plus Jakarta Sans) eklendi, uygulama bundle'ı temiz derleniyor
- [x] Backend canlı ve çalışıyor (raporlar/harita 200 dönüyor)

---

## ✅ 2026-05-31 İLERLEME (Claude, App Store Connect API key ile — 2FA'sız)
- [x] Apple Developer hesabı aktif
- [x] iOS açılış çökmesi düzeltildi (harita PROVIDER_GOOGLE → iOS Apple Haritalar)
- [x] İmzalama: yeni dağıtım sertifikası + bundle ID kaydı + App Store provisioning profile (ASC API, headless)
- [x] iOS production build EAS bulutunda alındı (build no 2, .ipa hazır)
- [x] App Store Connect uygulama kaydı oluşturuldu → **ascAppId 6775084979**
- [x] Binary `eas submit` ile yüklendi → Apple işliyor (TestFlight'ta görünecek)
- [ ] KALAN (App Store Connect arayüzü): mağaza metinleri, ekran görüntüleri, App Privacy, "Submit for Review"

---

## 1) ÖN KOŞUL — Apple Developer hesabı (SENİN YAPMAN GEREKEN) ⛔ EN KRİTİK

iOS'ta App Store'a çıkmanın **tek zorunlu ücretli adımı**.

- [ ] **developer.apple.com** → "Account" → **Apple Developer Program**'a kayıt ol ($99/yıl)
- [ ] Ödeme + kimlik doğrulama tamamlansın (bireysel hesapta genelde birkaç saat, bazen 1-2 gün sürer)
- [ ] Hesap "Active" olunca devam edilir

**Not:** Bu hesap olmadan iOS build'i imzalanamaz ve mağazaya yüklenemez. Android (Google Play) ayrı bir hesap ister ($25, tek seferlik) — onu sonra ele alırız.

**Mac gerekiyor mu? HAYIR.** Build, Apple'ın değil EAS'ın bulut sunucularında yapılır. Senin bilgisayarın Windows olması sorun değil.

---

## 2) Yasal sayfaları canlıya al (Claude yapabilir — onayın lazım)

Apple **Privacy Policy URL** ve **Support URL** ister. Şu an (2026-05-31 deploy sonrası):
- ✅ `/kvkk` (gizlilik) → CANLI
- ✅ `/destek` → CANLI
- ✅ `/kullanim-kosullari` → CANLI

- [x] Web production'a deploy edildi → 3 sayfa da canlı (2026-05-31)
- [x] Deploy sonrası şu 3 URL'in de açıldığı doğrulandı (hepsi 200):
  - https://web-ten-kappa-37.vercel.app/kvkk
  - https://web-ten-kappa-37.vercel.app/destek
  - https://web-ten-kappa-37.vercel.app/kullanim-kosullari

---

## 3) iOS production build (SEN kendi terminalinde çalıştırırsın)

⚠️ Bu komut Apple hesabına giriş + 2 faktörlü doğrulama (telefonuna gelen kod) ister.
Bu yüzden **senin kendi terminalinde** çalışman gerekir (Claude'un ortamı interaktif giriş yapamaz).

```bash
cd "C:\Users\talha\OneDrive\Masaüstü\telegram bot\alocukurhatti\mobile"
npx eas build --platform ios --profile production
```

Komut sırasıyla soracak:
- [ ] Apple hesabıyla giriş (Apple ID + şifre + telefona gelen 6 haneli kod)
- [ ] "Generate a new Apple Distribution Certificate?" → **Yes** (EAS otomatik yönetir)
- [ ] "Generate a new Provisioning Profile?" → **Yes**
- [ ] Build EAS bulutunda başlar (~15-25 dk). Bittiğinde bir `.ipa` linki verir.

**Takıldığın her ekranın fotoğrafını Claude'a at, yönlendirir.**

---

## 4) App Store Connect — uygulama kaydı (SEN yaparsın, Claude metinleri verir)

- [ ] **appstoreconnect.apple.com** → "My Apps" → **+** → New App
  - Platform: iOS
  - İsim: **Alo Çukur Hattı**
  - Birincil dil: Türkçe
  - Bundle ID: **com.talha.alocukurhatti** (listede çıkmalı; çıkmazsa build sonrası otomatik gelir)
  - SKU: `alocukurhatti` (serbest metin)
- [ ] Açıklama / anahtar kelimeler / alt başlık → `app-store-metadata.md`'den kopyala-yapıştır
- [ ] Privacy Policy URL: `.../kvkk` · Support URL: `.../destek`
- [ ] Kategori: Utilities · Yaş: 4+ · Fiyat: Ücretsiz
- [ ] **App Privacy** bölümü → `app-store-metadata.md`'deki gizlilik tablosuna göre doldur

---

## 5) Ekran görüntüleri (SEN sağlarsın) 📸

Apple **1-10 ekran görüntüsü** kabul eder. En pratik seçenek, güncel **6.9" iPhone**
ölçülerinden birini kullanmaktır: 1260×2736, 1290×2796 veya 1320×2868 piksel
(dikey). Mevcut `ekrangor/` görselleri 590×1280 olduğu için doğrudan yüklemeye uygun değildir.

Sende iPhone yoksa en kolay yol:
- [ ] Build bittikten sonra **TestFlight** ile herhangi bir iPhone'a yükle (arkadaş/aile telefonu olur)
- [ ] Uygulamadan harita, çukur bildirme, rapor detay, sıralama ekranlarının görüntüsünü al
- [ ] App Store Connect'e yükle

(Alternatif: iPhone hiç yoksa, Claude'a söyle — doğru boyutta tanıtım görselleri hazırlamanın yollarını anlatır.)

---

## 6) Mağazaya gönder (SEN kendi terminalinde)

```bash
cd "C:\Users\talha\OneDrive\Masaüstü\telegram bot\alocukurhatti\mobile"
npx eas submit --platform ios --profile production
```
- [ ] Son build'i seçer, App Store Connect'e yükler
- [ ] App Store Connect'te build "Processing" → birkaç dk sonra hazır olur
- [ ] Uygulama kaydında o build'i seç → **"Submit for Review"**

---

## 7) İnceleme & yayın

- [ ] Apple incelemesi: genelde **1-3 gün**
- [ ] Onaylanınca otomatik veya manuel yayınla
- [ ] 🎉 Mağazada!

---

## Sık takılınan noktalar
- **2FA kodu gelmiyor:** Apple ID'ye kayıtlı güvenilir cihaz/telefon doğru mu?
- **Bundle ID listede yok:** önce iOS build'i çalıştır, sonra App Store Connect'te otomatik görünür.
- **Reklam (AdMob) varsa:** App Privacy'de "reklam verisi toplanıyor" işaretlenmeli (metadata'da not var).
- **Reddedilirse:** Apple gerekçe yazar; metni Claude'a at, düzeltiriz, tekrar göndeririz.
