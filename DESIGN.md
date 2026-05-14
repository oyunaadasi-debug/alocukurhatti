---
version: alpha
name: Alo Çukur Hattı
description: >
  Türkiye genelinde çalışan vatandaş güdümlü yol hasar raporlama platformu.
  Tasarım dili: güven veren kamu hizmetinin sertliği + sivil teknolojinin temiz minimalizmi.
  Tek aksan renk (Alarm Kırmızısı), pill imza şekli, Inter yazı tipi, siyah-beyaz yüzey sistemi.

colors:
  # Birincil yüzeyler
  canvas: "#FFFFFF"
  canvas-soft: "#F5F5F5"
  canvas-softer: "#EEEEEE"
  surface-pressed: "#E0E0E0"
  surface-dim: "#BDBDBD"

  # Metin
  ink: "#212121"
  body: "#616161"
  mute: "#9E9E9E"
  on-dark: "#FFFFFF"

  # Birincil aksan — Alarm Kırmızısı (tek renkli aksan, çukur = tehlike)
  primary: "#E53935"
  on-primary: "#FFFFFF"
  primary-dim: "#C62828"
  primary-container: "#FFCDD2"
  on-primary-container: "#B71C1C"

  # İkincil — Otorite Mavisi (belediye, devlet güveni — sadece "Ben de gördüm" için)
  secondary: "#1565C0"
  on-secondary: "#FFFFFF"
  secondary-container: "#BBDEFB"
  on-secondary-container: "#0D47A1"

  # Anlam renkleri
  success: "#2E7D32"
  on-success: "#FFFFFF"
  success-container: "#C8E6C9"
  warning: "#F57F17"
  on-warning: "#FFFFFF"
  warning-container: "#FFF9C4"
  error: "#B71C1C"
  on-error: "#FFFFFF"

  # Durum — harita pin renkleri
  pin-open: "#E53935"
  pin-resolved: "#2E7D32"
  pin-reviewing: "#1565C0"
  pin-forwarded: "#F57F17"

typography:
  display-xl:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 32px
    fontWeight: "800"
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 26px
    fontWeight: "700"
    lineHeight: 34px
    letterSpacing: -0.01em
  display-md:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 30px
  title-lg:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 18px
    fontWeight: "700"
    lineHeight: 26px
  title-md:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-md-strong:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
  label-lg:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 15px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 13px
    fontWeight: "600"
    lineHeight: 18px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  button-primary:
    fontFamily: Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif
    fontSize: 15px
    fontWeight: "700"
    lineHeight: 20px

rounded:
  none: 0px
  sm: 6px
  DEFAULT: 10px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  4xl: 48px

components:
  # — Butonlar —
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg} {spacing.2xl}"
    elevation: 4
  button-primary-pressed:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg} {spacing.2xl}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: "{spacing.md} {spacing.lg}"
  button-soft:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: "{spacing.md} {spacing.lg}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg} {spacing.2xl}"
  button-floating-report:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg} {spacing.3xl}"
    elevation: 6
  button-locate:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.full}"
    size: 48px
    elevation: 4

  # — Kart sistemi —
  card-report:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    elevation: 2
  card-report-pressed:
    backgroundColor: "{colors.canvas-soft}"
  card-leaderboard-city:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    elevation: 2
  card-district-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "{spacing.md} 0"
    borderBottom: "{colors.canvas-softer}"
  card-resolution:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "{spacing.md}"

  # — Durum badge sistemi (pill) —
  badge-open:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    paddingH: 10px
    paddingV: 4px
  badge-resolved:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    paddingH: 10px
    paddingV: 4px
  badge-forwarded:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    paddingH: 10px
    paddingV: 4px
  badge-reviewing:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    paddingH: 10px
    paddingV: 4px
  badge-rejected:
    backgroundColor: "{colors.canvas-softer}"
    textColor: "{colors.mute}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    paddingH: 10px
    paddingV: 4px

  # — Ben de gördüm —
  metoo-button-default:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg} {spacing.2xl}"
  metoo-button-voted:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg} {spacing.2xl}"
  metoo-count-badge:
    backgroundColor: "rgba(255,255,255,0.25)"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md-strong}"
    rounded: "{rounded.pill}"
    paddingH: 10px
    paddingV: 3px

  # — Form öğeleri —
  input-field:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.mute}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.DEFAULT}"
    padding: "{spacing.lg}"
    borderColor: "{colors.canvas-softer}"
  input-field-focused:
    borderColor: "{colors.primary}"
    borderWidth: 2px

  # — Harita bileşenleri —
  map-callout:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    elevation: 4
    minWidth: 200px
    maxWidth: 260px
  map-count-badge:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    paddingH: 14px
    paddingV: 6px
    backdropFilter: "rgba(0,0,0,0.65)"

  # — Lider tablosu —
  leaderboard-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    paddingH: 20px
    paddingV: 16px
  leaderboard-rank-medal:
    fontSize: 22px
  leaderboard-rank-number:
    typography: "{typography.title-md}"
    textColor: "{colors.mute}"
    width: 32px
  leaderboard-progress-bar-track:
    backgroundColor: "{colors.canvas-softer}"
    height: 4px
    rounded: "{rounded.sm}"
  leaderboard-progress-bar-fill:
    backgroundColor: "{colors.success}"
    height: 4px
    rounded: "{rounded.sm}"
  leaderboard-count-large:
    typography: "{typography.display-lg}"
    textColor: "{colors.primary}"
  leaderboard-map-chip:
    backgroundColor: "#E3F0FF"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"

  # — Navigasyon —
  tab-bar:
    backgroundColor: "{colors.canvas}"
    activeColor: "{colors.primary}"
    inactiveColor: "{colors.mute}"
    paddingBottom: 4px
    height: 58px
  top-header:
    backgroundColor: "{colors.canvas}"
    tintColor: "{colors.primary}"
    titleTypography: "{typography.title-md}"
    elevation: 1
---

## Genel Bakış & Marka Kimliği

**Alo Çukur Hattı**, Türkiye'nin 81 ilinde çalışan vatandaş güdümlü yol hasar raporlama platformudur. İsim, "Alo 182" gibi belediye acil hatlarını çağrıştırır: sistem ciddidir, güven verir, halkın sesidir.

Tasarım felsefesi iki gerilimi dengeler: **Kamu hizmetinin otoritesi** (güven, kurum, hesap verebilirlik) + **Sivil teknolojinin sadeliği** (temiz, hızlı, erişilebilir). Ne çok kurumsal, ne çok startup — ikisi arasındaki "sivil teknoloji" noktası.

Tasarım imzası: **tek aksan rengi (Alarm Kırmızısı) + pill buton şekli + siyah-beyaz-gri yüzey sistemi.**

---

## Renk Sistemi

### Alarm Kırmızısı — Primary (`#E53935`)
Uygulamanın tek renkli aksanı. Çukur tehlikelidir — kırmızı bu gerçeği somutlaştırır.
- **Kullan:** "Çukur Bildir" butonu, açık rapor sayaçları, harita pinleri (açık durum), lider tablosu büyük rakamları, badge-open
- **Kullanma:** Başarı durumları, bilgi metinleri, genel ikonlar, çözüldü işaretleri

### Otorite Mavisi — Secondary (`#1565C0`)
Devlet ve belediye kurumunu çağrıştırır. Sadece bir bileşene tahsis edilmiştir: "Ben de Gördüm" butonu. Vatandaşın kurumsal sisteme katılımını temsil eder.
- **Kullan:** Yalnızca "Ben de Gördüm" butonu ve ilçe drill-down vurgusu
- **Kullanma:** Ana eylemler, tehlike gösterimi, genel vurgu

### Yüzey Sistemi
Siyah-beyaz-gri eksen. Kırmızı ve mavi dışında hiçbir ton yok.
- `canvas` (#FFFFFF): Varsayılan sayfa arka planı, kart yüzeyleri
- `canvas-soft` (#F5F5F5): Giriş alanı arka planı, tab bar, harita badge
- `canvas-softer` (#EEEEEE): Kart ayırıcılar, devre dışı durumlar
- `ink` (#212121): Tüm birincil metin
- `body` (#616161): İkincil metin, meta bilgi
- `mute` (#9E9E9E): Placeholder, sıra numarası, pasif öğeler

### Anlam Renkleri
| Durum | Renk | Hex |
|---|---|---|
| Açık (Tehlike) | Alarm Kırmızısı | `#E53935` |
| Belediyeye İletildi | Uyarı Sarısı | `#F57F17` |
| İnceleniyor | Otorite Mavisi | `#1565C0` |
| Çözüldü | Güven Yeşili | `#2E7D32` |
| Reddedildi | Gri | `#9E9E9E` |

---

## Tipografi

**Inter** kullanılır — açık kaynak, geniş ağırlık skalası, güçlü Türkçe karakter desteği, platform native hissi.

| Token | Boyut | Ağırlık | Kullanım |
|---|---|---|---|
| `display-xl` | 32px / 800 | Lider tablosu hero numaraları |
| `display-lg` | 26px / 700 | Açık rapor sayacı (kırmızı büyük rakam) |
| `display-md` | 22px / 700 | Ekran başlıkları |
| `title-lg` | 18px / 700 | Kart başlıkları, şehir adları |
| `title-md` | 16px / 600 | Alt başlıklar, navigasyon başlığı |
| `body-lg` | 16px / 400 | Rapor açıklaması |
| `body-md` | 14px / 400 | Meta bilgi, adres, tarih |
| `body-md-strong` | 14px / 600 | Sayaç badge içerikleri |
| `label-lg` | 15px / 700 | Buton metni (birincil) |
| `label-md` | 13px / 600 | Badge metni, chip |
| `caption` | 12px / 400 | Tarih, sıra numarası |

**Kurallar:**
- Headline'lar her zaman sentence-case — ALL-CAPS yasak
- Buton metni: 700 ağırlık, asla 400
- Tarih/meta: `caption` token, `body` değil
- Mesafe: negatif letter-spacing yalnızca `display-xl` ve `display-lg`'de

---

## Şekil İmzası: Pill

**Her interaktif öğe `{rounded.pill}` 999px kullanır.** Bu uygulamanın tek geometrik imzasıdır.

| Token | Değer | Kullanım |
|---|---|---|
| `{rounded.none}` | 0px | Tam ekran harita, fotoğraf tam genişlik |
| `{rounded.sm}` | 6px | Lider tablosu harita chip'i |
| `{rounded.DEFAULT}` | 10px | Giriş alanları |
| `{rounded.md}` | 12px | İkincil kartlar, küçük bileşenler |
| `{rounded.lg}` | 16px | Ana rapor kartları, panel yüzeyleri |
| `{rounded.xl}` | 20px | Harita callout balonu |
| `{rounded.pill}` | 999px | TÜM butonlar, TÜM badge'ler, TÜM chip'ler |
| `{rounded.full}` | 9999px | Dairesel ikon butonlar (konuma git) |

---

## Layout & Spacing

**8px grid sistemi.**

- Kart içi padding: `{spacing.lg}` 16px
- Kartlar arası boşluk: `{spacing.sm}` 8px
- Sayfa yan kenar: `{spacing.md}` 12px (gutter)
- Büyük bölüm ayrımı: `{spacing.3xl}` 32px
- Buton padding yatay: `{spacing.2xl}` 24px

**Felsefe:** Harita ekranı neredeyse tam harita — harita kazanır, UI öğeleri yüzer. Rapor listesi ve lider tablosunda temiz hiyerarşi, bol boşluk.

---

## Elevation & Gölge

| Seviye | Shadow | Kullanım |
|---|---|---|
| 0 — Flat | Yok | Varsayılan listeler, harita overlay text |
| 1 — Subtle | `rgba(0,0,0,0.08) 0px 1px 4px` | Kart kenarlık alternatifi |
| 2 — Card | `rgba(0,0,0,0.12) 0px 2px 8px` | Rapor kartları, lider tablosu |
| 4 — Float | `rgba(0,0,0,0.16) 0px 4px 16px` | Konum butonu, harita callout |
| 6 — Hero | `rgba(0,0,0,0.24) 0px 6px 24px` | "Çukur Bildir" floating CTA |

---

## Bileşen Kuralları

### "Çukur Bildir" Floating Butonu
Harita ekranında alt-ortada yüzer. Tüm harita öğelerinin üstünde, elevation 6.
- `button-floating-report` — kırmızı, pill, `elevation: 6`
- Solunda `+` ikonu, yanında "Çukur Bildir" metni
- Haritayla etkileşimde kaybolmaz

### "Ben de Gördüm" Butonu
Tek mavi öğe. Tıklandığında 200ms ease ile yeşile (`button-metoo-voted`) geçer.
- Sağ köşe: `metoo-count-badge` — saydam beyaz pill içinde sayı
- Voted durumunda gözbebeği ikonu dolu → `eye` (outline yerine)

### Lider Tablosu Satırı
```
[🥇/1] [Şehir Adı          ] [47  ]  [🗺]  [v]
        [========= %23 ====  ]  [açık]
        [Toplam: 204 • 47 görmüş]
```
- Sol: madalya veya rakam (32px genişlik, ortala)
- Orta: şehir adı + yeşil progress bar (h:4px) + meta caption
- Sağ: `leaderboard-count-large` kırmızı (26px/700)
- Harita chip: `#E3F0FF` arka plan, `sm` köşe
- Expand ok: sağda, `chevron-down` / `chevron-up`

İlçe drill-down açılınca:
```
   İlçe Bazlı Raporlar
   ─────────────────────
   Seyhan        [23] 🗺 →
   Çukurova      [14] 🗺 →
   Yüreğir       [10] 🗺 →
```

### Durum Badge'leri (Pill)
Her zaman `rounded.pill`. Padding: 4px dikey, 10px yatay. Rapor fotoğrafının üst-sol köşesine overlay olarak da kullanılabilir.

### Harita Pinleri
- `pin-open` kırmızı → aktif tehlike
- `pin-resolved` yeşil → çözüldü (haritada opsiyonel)
- Cluster (10+): sayı badge'li kırmızı küme

---

## Ses Tonu & Mikrokopi

| Durum | Metin |
|---|---|
| CTA | "Çukur Bildir" — doğrudan, eylem |
| Sosyal onay | "Ben de Gördüm" |
| Voted sonrası | "Gördüğünüz kaydedildi" |
| Anonim kullanıcı | "Anonim vatandaş" |
| İletildi durumu | "Belediyeye iletildi" (pasif değil, aktif geçmiş) |
| Çözüldü | "Çözüldü ✓" (tik işareti: kanıtlandı) |
| Fotoğraf zorunlu | "Lütfen çukurun fotoğrafını ekleyin" — suçlayıcı değil, yönlendirici |
| Boş harita | "Bu bölgede henüz rapor yok. İlk sen bildir." |
| Moderasyon reddi | "Bu görsel yüklenemedi. Lütfen çukurun net fotoğrafını çekin." |

---

## Yapılmaması Gerekenler

- `{colors.primary}` dışında başka aksan rengi ekleme — kırmızı sistemin tek renk anahtarı
- `{rounded.pill}` dışında buton köşesi kullanma — pill uygulamanın geometrik imzası
- ALL-CAPS başlık — sentence-case zorunlu
- Beyaz arka plan üzerinde beyaz kart — `canvas-soft` veya `elevation` kullan
- İkon butonlarda etiket kullanmayı unutma — erişilebilirlik için `accessibilityLabel` şart
- Haritayı listeyle yarıştırma — harita ekranı tam haritadır, liste ayrı bir ekran değil overlay