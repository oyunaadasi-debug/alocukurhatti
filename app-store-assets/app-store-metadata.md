# Alo Çukur Hattı — Mağaza Listesi Metaları

App Store Connect ve Google Play Console formlarına kopyala-yapıştır içerikler.

---

## Yasal URL'ler (canlı)

| Alan | URL |
|---|---|
| Gizlilik Politikası (Privacy Policy) | https://web-ten-kappa-37.vercel.app/kvkk |
| Kullanım Koşulları (Terms of Use) | https://web-ten-kappa-37.vercel.app/kullanim-kosullari |
| Destek (Support URL) | https://web-ten-kappa-37.vercel.app/destek |
| Pazarlama / Web | https://web-ten-kappa-37.vercel.app |

> Not: Apple "Privacy Policy URL" zorunlu; KVKK sayfası bu görevi görür. Play Console için aynı URL kullanılır.

---

## Uygulama Kimliği

- **İsim:** Alo Çukur Hattı
- **Bundle ID / Package:** com.talha.alocukurhatti
- **Sürüm:** 1.0.0
- **Kategori (öneri):** Apple → Utilities (veya Lifestyle); Play → Maps & Navigation (alt: House & Home / Social)
- **Yaş sınırı:** 4+ / Everyone (kullanıcı içeriği moderasyonlu olduğundan 12+ de seçilebilir)
- **Fiyat:** Ücretsiz (uygulama içi reklam — AdMob)

---

## Kısa Açıklama (Play — 80 karakter sınırı)

```
Yolundaki çukurları fotoğrafla, haritaya işle, belediyeyi göreve çağır.
```

## Alt Başlık (App Store — 30 karakter sınırı)

```
Çukuru bildir, takip et
```

---

## Tam Açıklama (App Store / Play — uzun metin)

```
Alo Çukur Hattı, Türkiye'nin yollarını birlikte iyileştirmek için kurulmuş ücretsiz bir vatandaş platformudur.

Yolda bir çukur mu gördünüz? Fotoğrafını çekin, konumunu haritaya işleyin, saniyeler içinde kamuya açık bir kayda dönüşsün. Her bildirim tarih damgalıdır ve haritada herkese görünür — böylece sorunların gerçekten çözülüp çözülmediği takip edilebilir.

NELER YAPABİLİRSİNİZ?
• Çukuru fotoğrafla, otomatik konumla haritaya ekle
• Kayıt olmadan, anonim bildirim gönder
• Tüm bildirimleri canlı harita üzerinde gör
• "Ben de Gördüm" ile başkalarının bildirimlerini destekle
• Bildirim durumunu izle: Açık → Belediyeye İletildi → İnceleniyor → Çözüldü
• Çözülen çukurların önceki/sonraki halini yan yana gör
• Katkı sıralamasında yer al

NEDEN ALO ÇUKUR HATTI?
• Tamamen ücretsiz, kâr amacı gütmeyen sosyal sorumluluk projesi
• Kamuya açık, şeffaf veri — belediyeleri hesap vermeye teşvik eder
• KVKK uyumlu: ham IP adresiniz asla saklanmaz, konum yalnızca rapor anında kullanılır
• Yüklenen tüm fotoğraflar otomatik güvenli içerik kontrolünden geçer

Yolların güvenliği hepimizin sorumluluğu. Bir çukur, bir bildirim ile başlar.
```

---

## Anahtar Kelimeler (App Store — 100 karakter, virgülle)

```
çukur,yol,belediye,şikayet,harita,vatandaş,ihbar,asfalt,trafik,güvenlik,bildirim,kamu,rapor
```

## Etiketler / Tags (Play)

```
yol çukuru, belediye şikayet, vatandaş ihbar, harita, kamu hizmeti
```

---

## Gizlilik Bildirimi (App Privacy / Data Safety)

Toplanan veriler ve amaçları:

| Veri Türü | Toplanıyor mu? | Amaç | Kullanıcıya bağlı mı? |
|---|---|---|---|
| Konum (yaklaşık + tam) | Evet | Uygulama işlevi (çukuru haritaya işleme) | Hayır (anonim olabilir) |
| Fotoğraf | Evet | Uygulama işlevi (hasarı belgeleme) | Hayır |
| İsim (isteğe bağlı) | Evet | Uygulama işlevi | Evet (kayıtlıysa) |
| E-posta (kayıt) | Evet | Hesap yönetimi | Evet |
| IP adresi | Hayır* | — | — |

- *IP adresi geri döndürülemez şekilde özetlenir (SHA-256 hash); ham IP saklanmaz.
- Reklam: AdMob (üçüncü taraf) cihaz tanımlayıcıları kullanabilir → reklam için "Veri toplanıyor" işaretlenmelidir.
- Veri satışı: YOK. Üçüncü taraflarla paylaşım: yalnızca ilgili belediye/yol bakım kurumlarıyla rapor paylaşımı.

---

## İzin Açıklamaları (app.json'da tanımlı)

- **Konum:** "Çukurun konumunu otomatik tespit etmek için konum iznine ihtiyacımız var."
- **Kamera:** "Çukurun fotoğrafını çekmek için kamera iznine ihtiyacımız var."
- **Galeri:** "Galeriden fotoğraf seçmek için izin gerekiyor."

---

## Yayın Öncesi Kontrol Listesi

- [ ] EAS projectId güncellendi (`mobile/app.json` → extra.eas.projectId — şu an placeholder)
- [ ] icon.png / splash.png / adaptive-icon.png assets/ klasöründe mevcut
- [ ] Ekran görüntüleri çekildi (iPhone 6.7"/6.5" + Android telefon)
- [ ] Apple Developer hesabı aktif → `eas build -p ios --profile production` + `eas submit`
- [ ] Google Play Console hesabı → `eas build -p android --profile production`
- [ ] App Store Connect / Play Console listesi yukarıdaki metinlerle dolduruldu
- [ ] Yasal URL'ler canlı doğrulandı (web Vercel deploy güncel)
- [ ] AdMob reklam birimleri tanımlandıysa gizlilik bildirimi reklam verisini içeriyor
```
