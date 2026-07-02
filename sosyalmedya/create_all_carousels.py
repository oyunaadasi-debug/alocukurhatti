# -*- coding: utf-8 -*-
"""
Alo Çukur Hattı — 15 Farklı Sosyal Medya Carousels Oluşturucu
HTML + Playwright (Tek Oturumda Hızlı Rendering)
"""
import os
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

# Yollar
BASE = Path(r"C:\Users\talha\OneDrive\Masaüstü\telegram bot\alocukurhatti")
SOSYAL = BASE / "sosyalmedya"
OUT = SOSYAL / "carousels_out"
PHOTOS = BASE / "cukurhattilansman" / "photos"

OUT.mkdir(parents=True, exist_ok=True)

def img_b64(filename):
    """Fotoğrafı base64'e çevirerek HTML içine gömer, yoksa boş döner."""
    if not PHOTOS.exists():
        return ""
    p = PHOTOS / filename
    if not p.exists():
        return ""
    try:
        with open(p, "rb") as f:
            data = base64.b64encode(f.read()).decode()
        ext = p.suffix.lower().replace(".", "")
        if ext == "jpg": ext = "jpeg"
        return f"data:image/{ext};base64,{data}"
    except Exception:
        return ""

# Fontlar ve Ortak CSS
HEAD = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;
  height:1080px;
  overflow:hidden;
  font-family:'Plus Jakarta Sans', sans-serif;
  background:#1B1A16;
}

:root {
  --primary: #1FA98B;
  --primary-dim: #178A70;
  --attention: #E76F4F;
  --success: #2E9E6B;
  --dark: #1B1A16;
  --light: #FBF9F4;
  --light-card: rgba(242, 238, 229, 0.95);
  --dark-card: rgba(27, 26, 22, 0.82);
  --white: #FFFFFF;
  --text-mute: #9A9488;
}

.slide {
  width: 1080px; height: 1080px;
  position: relative; overflow: hidden;
}

/* Koyu Tema Arka Planı (Radial + Linear Gradient) */
.dark-bg {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 30%, #2A4840 0%, #1B1A16 80%);
}

.dark-bg-attention {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 30%, #502A24 0%, #1B1A16 80%);
}

/* Görsel/Fotoğraf Arka Planı + Karartma Katmanı */
.photo-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
}
.photo-bg::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(27,26,22,0.3) 0%,
    rgba(27,26,22,0.65) 45%,
    rgba(27,26,22,0.92) 75%,
    rgba(27,26,22,0.98) 100%
  );
}

/* Izgara Deseni */
.grid-overlay {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  z-index: 1;
}

/* İçerik Konteyneri */
.content {
  position: relative; z-index: 10;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  padding: 64px 80px 56px;
}

/* Pill/Badge */
.pill {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px;
  font-weight: 700; letter-spacing: 0.05em;
  font-size: 24px;
}
.pill-primary { background: var(--primary); color: var(--white); }
.pill-attention { background: var(--attention); color: var(--white); }
.pill-glass {
  background: rgba(255, 255, 255, 0.07);
  color: var(--primary);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}
.pill-light-glass {
  background: rgba(27, 26, 22, 0.04);
  color: var(--primary);
  border: 1px solid rgba(27, 26, 22, 0.08);
}

/* Başlık Stilleri */
.h1-hero {
  font-size: 92px; font-weight: 900; line-height: 1.05; letter-spacing: -2px; color: var(--white);
}
.h1-hero span {
  color: var(--primary);
}

.h1-hero span.coral {
  color: var(--attention);
}

.h2-header {
  font-size: 64px; font-weight: 800; line-height: 1.1; letter-spacing: -1px; color: var(--dark);
}

/* Çizgiler */
.line-decor { width: 140px; height: 6px; border-radius: 3px; }
.line-primary { background: var(--primary); }
.line-attention { background: var(--attention); }

/* Cam Kart Stilleri */
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(12px);
  padding: 32px 36px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.light-card {
  background: rgba(242, 238, 229, 0.88);
  border: 1px solid rgba(27, 26, 22, 0.06);
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 8px 30px rgba(27, 26, 22, 0.05);
}

/* Footer */
.footer {
  margin-top: auto;
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  font-size: 24px; color: var(--text-mute); font-weight: 500;
  z-index: 10;
}
.footer.light-foot {
  border-top: 1px solid rgba(27, 26, 22, 0.08);
  color: var(--text-mute);
}

/* Kaydır Butonu */
.swipe-btn {
  font-size: 28px; font-weight: 700; padding: 18px 44px;
  background: var(--primary); color: var(--white);
  border-radius: 999px; align-self: center;
  box-shadow: 0 10px 25px rgba(31, 169, 139, 0.3);
  text-transform: uppercase;
}
.swipe-btn.coral {
  background: var(--attention);
  box-shadow: 0 10px 25px rgba(231, 111, 79, 0.3);
}

/* Kelime Vurgulama */
.accent-word {
  color: var(--primary); font-weight: 900;
}
.accent-coral {
  color: var(--attention); font-weight: 900;
}
</style>
</head>
<body>
"""

FOOT = "</body></html>"

# 15 Farklı İçerik Paketi Tanımı
CAROUSELS = [
    # 1. LANSMAN
    {
        "folder": "01_lansman",
        "slides": [
            # Slide 1: Kapak
            {
                "bg_photo": "road_bg2.jpg",
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="photo-bg" style="background-image:url({bg_data})"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-attention" style="padding: 10px 24px;">🚀 LANSMAN</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">ALO ÇUKUR HATTI<br><span class="coral">ARTIK APP STORE'DA!</span></h1>
                      <div class="line-decor line-attention"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Şikayet değil, çözüm odaklı.<br>Mahallendeki sorunları bildirmek artık App Store ile cebinizde!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn coral">Detaylar için kaydırın &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            # Slide 2: Bilgi
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">📱 YENİ SÜRÜM</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">YENİLİKLER & ÖZELLİKLER</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🍎</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">App Store Entegrasyonu</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">iOS kullanıcıları için mükemmel arayüz ve akıcı kullanım hazır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🔒</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Üst Düzey Güvenlik</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">App Store 5.1.1 standartlarına uyumlu kolay profil silme ve gizlilik koruması.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">⚡</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Konum Kilitli Raporlama</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">GPS tabanlı adresleme sayesinde ekipler adresi aramakla zaman kaybetmez.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            # Slide 3: CTA
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg-attention"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px; color:var(--attention); border-color:var(--attention)">🎉 ARAMIZA KATIL</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">ŞEHRİNİN SESİ OLMAYA<br><span style="color:var(--attention)">HAZIR MISIN?</span></h2>
                      <div class="line-decor line-attention" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Alo Çukurhattı uygulamasını App Store ve Google Play'den indirerek mahallenizdeki yol ve kaldırım hasarlarını anında bildirebilirsiniz.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn coral" style="font-size:38px; padding:22px 64px;">HEMEN İNDİR VE BİLDİR</div>
                      <span style="font-size:26px; color:var(--text-mute);">www.alocukurhatti.com</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 2. EMLAK DEĞERİ
    {
        "folder": "02_emlak_degeri",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🏠 EMLAK DEĞERİ</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">BOZUK YOLLAR<br><span>MÜLK DEĞERİNİ DÜŞÜRÜR</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Mahalle altyapısının kalitesi, evinizin değerini <span class="accent-word">%15'e kadar</span> etkileyebilir. Çukurlar sadece sürüşü değil, bütçenizi de vurur!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Detaylar için kaydırın &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">📊 DEĞERLENDİRME</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">SOKAK KALİTESİ NEDEN ÖNEMLİ?</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🛑</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Kötü İlk İzlenim</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Alıcılar eve gelmeden önce sokağa bakar. Çukur dolu bir sokak mülk prestijini sıfırlar.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚕</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Ulaşım ve Konfor Engelleri</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Hırpalanmış yollar taksi, kurye ve kişisel ulaşımda konforu bozarak kira potansiyelini düşürür.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">✨</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Çözüm: Alo Çukurhattı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Uygulamayı kullanarak mahallenizi güzelleştirebilir ve mülkünüzün değerini koruyabilirsiniz.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">📈 MÜLKÜNÜ DEĞERLENDİR</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">SOKAĞINI BİRLİKTE<br><span>GÜZELLEŞTİRİN!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Belediye birimlerine koordinatlı, fotoğraflı ve şeffaf bildirimler yollayarak mahallenizin sokak standardını yükseltin. Mülkünüze değer katın!
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">SOKAĞINI ŞİMDİ GÜZELLEŞTİR</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı cebinde. Ücretsiz indir.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 3. NASIL ÇALIŞIR
    {
        "folder": "03_nasil_calisir",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🛠️ KULLANIM</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">3 BASİT ADIMDA<br><span>ÇUKUR BİLDİR!</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Şehrindeki tehlikeli ve bozuk yolları belediyeye bildirmek sadece <span class="accent-word">1 dakika</span> sürer. İşte adım adım kullanımı!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Adımları Görün &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">📖 KILAVUZ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">NASIL ÇALIŞIR?</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <div style="width:72px; height:72px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:900; flex-shrink:0;">1</div>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Fotoğrafını Çek</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Hasarlı yolun, kaldırımın veya çukurun fotoğrafını uygulama içinden çekin.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <div style="width:72px; height:72px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:900; flex-shrink:0;">2</div>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Haritada Pinle</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">GPS'in otomatik belirlediği konumu harita üzerinden doğrulayarak işaretleyin.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <div style="width:72px; height:72px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:900; flex-shrink:0;">3</div>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Raporunu Gönder</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">"Bildir" tuşuna basın. Rapor belediye sistemlerine doğrudan ve anında iletilir.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">✨ SIRA SENDE</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">İNDİR VE SOKAĞINI<br><span>İYİLEŞTİR!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Üyelik şartı olmadan, tamamen ücretsiz ve hızlı bildirim yapmaya bugün başlayın. Şehrimizi birlikte temizleyelim.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">HEMEN BİLDİRİME BAŞLA</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı cebinde.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 4. GÜVENLİK
    {
        "folder": "04_yol_guvenligi",
        "slides": [
            {
                "bg_photo": "road_danger.jpg",
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="photo-bg" style="background-image:url({bg_data})"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-attention" style="padding: 10px 24px;">⚠️ GÜVENLİK</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">SİZİN İÇİN SARSINTI<br><span class="coral">ONLAR İÇİN KAZA!</span></h1>
                      <div class="line-decor line-attention"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Yol çukurları, otomobiller için sadece bir titreşimken; motosiklet ve bisiklet sürücüleri için ölümcül tuzaklardır!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn coral">Detayları Görün &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px; color:var(--attention); border-color:rgba(231,111,79,0.15)">⚠️ TEHLİKE ANALİZİ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">KİMLER TEHLİKEDE?</h2>
                      <div class="line-decor line-attention" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🏍️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Motosiklet Sürücüleri</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Yüksek hızlarda küçük bir çukur bile denge kaybına ve ciddi kazalara sebep olur.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚲</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Bisiklet ve Scooterlar</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Dar tekerler, derin çukurlara takıldığında sürücüyü doğrudan asfaltın üzerine fırlatır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚶</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Karanlıkta Yayalar</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Özellikle aydınlatması zayıf sokaklarda yayalar çukurları fark etmeyip düşerek sakatlanabilir.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg-attention"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px; color:var(--attention); border-color:var(--attention)">🤝 CAN GÜVENLİĞİ</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">BİLDİRİN VE TUZAKLARI<br><span style="color:var(--attention)">BİRLİKTE YOK EDİN!</span></h2>
                      <div class="line-decor line-attention" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Sokağınızda fark ettiğiniz her derin çukur, bir motosikletlinin hayatına mal olabilir. Bildirerek bir hayat kurtarabilirsiniz.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn coral" style="font-size:38px; padding:22px 64px;">TEHLİKELİ YOLLARI BİLDİR</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı ile yollar daha güvenli.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 5. AKILLI ŞEHİRLER
    {
        "folder": "05_akilli_sehirler",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🏙️ SİVİL TEKNOLOJİ</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">GELECEĞİN AKILLI<br><span>ŞEHİRLERİNİ KURUYORUZ</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Veriye dayalı, şeffaf ve katılımcı bir yerel yönetim modeli mümkün. Kitlesel sivil veri ile belediyeler artık daha hızlı!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Nasıl Yapıyoruz? &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">⚡ BÜROKRASİSİZ TEKNOLOJİ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">KİTLESEL VERİNİN GÜCÜ</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🗺️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Isı Haritaları</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Şehir genelindeki en bozuk ve acil onarım bekleyen yollar otomatik haritalandırılır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🏛️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Direkt Bilgi Akışı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Şikayet dilekçeleriyle uğraşmadan, koordinatlı temiz veri belediye ekiplerine gider.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">💎</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Şeffaf Sonuç</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Yapılan her onarım, fotoğraflı kanıtıyla harita üzerinde güncellenerek sonlandırılır.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">🚀 TEKNOLOJİ GÜCÜ</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">ŞEHRİNİ YARINA<br><span>BİRLİKTE TAŞIYALIM</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Dijital sivil inisiyatif ile akıllı şehirleşmeye katkıda bulunun. Her bildirim daha yaşanabilir ve modern bir sokak demektir.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">AKILLI ŞEHRE KATKI SAĞLA</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı ücretsiz yayında.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 6. MİZAH: ÇUKUR DOĞUM GÜNÜ
    {
        "folder": "06_mizah_dogumgunu",
        "slides": [
            {
                "bg_photo": "road_damage.jpg",
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="photo-bg" style="background-image:url({bg_data})"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-attention" style="padding: 10px 24px;">🎂 MİZAH</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">MUTLU YILLAR<br><span class="coral">SEVGİLİ ÇUKUR!</span></h1>
                      <div class="line-decor line-attention"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Sokağımızdaki bu çukur tam <span class="accent-coral">6 aylık</span> oldu. Pastamızı kestik, büyümesini hayretle izliyoruz!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn coral">Çukurun Günlüğü &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px; color:var(--attention); border-color:rgba(231,111,79,0.15)">📢 ÇUKURUN SESİ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">180 GÜNDÜR BURADAYIM</h2>
                      <div class="line-decor line-attention" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">😩</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Lastik Düşmanı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Her gün onlarca araba üstümden geçti, amortisör kırdım, jant ezdim. Kimse bana dokunmadı.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚗</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Herkes Gördü ve Geçti</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Beni bildirmek yerine herkes direksiyonu kırdı. Bir kişi bile durup fotoğrafımı çekmedi.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">💡</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Artık Kapatılma Zamanım!</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Büyümek istemiyorum. Lütfen Alo Çukurhattı ile beni bildirin, artık emekli olayım.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg-attention"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px; color:var(--attention); border-color:var(--attention)">🎂 PARTİYİ BİTİR</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">ŞAKAYI BİTİRELİM,<br><span style="color:var(--attention)">ÇUKURU RAPORLAYALIM!</span></h2>
                      <div class="line-decor line-attention" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Sokağınızda aylardır duran o malum çukuru fotoğraflayıp gönderin, belediye en kısa sürede kapatarak sokağınızı eski sağlığına kavuştursun.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn coral" style="font-size:38px; padding:22px 64px;">O ÇUKURU ŞİMDİ RAPORLA</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı ile doğum günlerine son!</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 7. EMLAK YATIRIMCILARI İÇİN
    {
        "folder": "07_emlak_yatirim",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🔑 YATIRIM REHBERİ</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">EV ALIRKEN MAHALLE<br><span>KALİTESİNİ NASIL ANLARSINIZ?</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Bir bölgenin altyapı sorunları ve belediye reaksiyon hızı, gayrimenkul yatırımınızın geri dönüş hızını belirler.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Yatırım İpuçları &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">🏠 ALTYAPI KONTROLÜ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">YATIRIM YAPARKEN SORUN</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🛣️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Yol ve Kaldırım Durumu</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Hasarlı ve bakımsız sokaklardaki evler daha yavaş değer kazanır ve zor kiracı bulur.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">📊</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Hizmet Hızı Verisi</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Alo Çukurhattı haritasından, bölgedeki sorunların ne kadar sürede çözüldüğünü izleyin.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">📈</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Mahalle Gelişim Hızı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Altyapısı hızlıca tamamlanan veya toparlanan sokaklar, ilk prim yapacak mülklerdir.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">📊 ANALİZ ET</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">DOĞRU YERE GÜVENLE<br><span>YATIRIM YAPIN!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Satın alacağınız veya kiralayacağınız evin çevresindeki altyapı şeffaflığını görmek için Alo Çukurhattı haritasını açın, bölgeyi ücretsiz analiz edin.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">BÖLGEYİ HARİTADAN İNCELE</div>
                      <span style="font-size:26px; color:var(--text-mute);">Gayrimenkulde altyapı analizi cebinizde.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 8. MAHALLE AVCILARI (GAMIFICATION)
    {
        "folder": "08_cukur_avcilari",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🛡️ AKTİF KATILIM</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">ÇUKUR AVCILARI<br><span>SAYESİNDE TEMİZ YOLLAR</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Mahalle sakinleri el ele veriyor. Çukurları bulup raporluyor, liderlik tablosunda yarışarak ünvan kazanıyor!
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Avcı Sistemi &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">🏆 ROZET VE REKABET</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">NASIL ROZET KAZANILIR?</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🛡️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Sokak Koruyucusu</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Kendi mahallesinde ilk yol hasarı ihbarını başarılı şekilde gönderenlere verilir.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🕵️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Asfalt Müfettişi</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">10 ve üzeri yol hasarı bildirip onarılmasına vesile olan aktif vatandaş ünvanı.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🏅</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Mahalle Kahramanı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">En çok "Ben de Gördüm" onayı alan ve sokağını zirveye taşıyan sakinler.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">🏆 YARIŞA KATIL</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">LİDERLİK TABLOSUNDA<br><span>YERİNİ AL!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Alo Çukurhattı profilini oluştur, sokağındaki sorunları işaretle ve kazandığın puanlarla liderlik sıralamasına gir. Yarışarak güzelleştir.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">HEMEN PROFİL OLUŞTUR</div>
                      <span style="font-size:26px; color:var(--text-mute);">Rozetler ve sıralama uygulamada.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 9. KİRA GELİRİ
    {
        "folder": "09_kira_geliri",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">📈 KİRA POTANSİYELİ</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">KİRA GELİRİNİ ARTIRMANIN<br><span>SIRRI: SOKAK ESTETİĞİ</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Temiz, düzenli ve altyapısı sağlam sokaklar, mülkünüze nitelikli kiracı çeker. Kira değerini sokak güzelliğiyle artırın.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Nasıl Yapılır? &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">💰 MÜLK YÖNETİMİ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">SOKAK ESTETİĞİ VE KİRA</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🏘️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Prestijli Konum</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Çukursuz, düzgün kaldırımlı ve temiz sokaklar mülkün cazibesini ve değerini korur.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚙</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Nitelikli Kiracı Tercihi</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Nitelikli kiracılar, araçlarına zarar verecek çukurlu sokaklardaki evlerden kaçınır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">📱</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Komşularla Güç Birliği</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Alo Çukurhattı ile komşularınızla birlikte sokağı güzelleştirip bölge kalitesini yükseltin.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">💰 YATIRIMINIZI KORUYUN</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">SOKAĞINDAKİ DEĞİŞİMİ<br><span>BUGÜN BAŞLAT!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Ev sahibi veya gayrimenkul danışmanı olarak, portföy çevresindeki altyapı eksiklerini Alo Çukurhattı ile kolayca bildirin ve onarım sürecini hızlandırın.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">SOKAĞINI ŞİMDİ RAPORLA</div>
                      <span style="font-size:26px; color:var(--text-mute);">Mülkünüzün değerini koruyan ücretsiz asistan.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 10. VERİ GÜVENLİĞİ
    {
        "folder": "10_veri_guvenligi",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🔒 GİZLİLİK</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">VERİLERİNİZ BİZİMLE<br><span>TAM GÜVENDE!</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        App Store 5.1.1 standartlarına tam uyumlu altyapımızla verileriniz ve gizliliğiniz tamamen güvencemiz altında.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Güvenlik Politikamız &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">🛡️ GÜVENLİ VERİ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">ŞEFFAFLIK TAAHHÜDÜMÜZ</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🕵️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Anonim Raporlama Desteği</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">İhbarlarınızı kimliğinizi paylaşmak zorunda kalmadan, tamamen gizli olarak gönderebilirsiniz.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚫</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Veri Satışı ve Reklam Yok</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Kişisel kullanım verileriniz hiçbir reklam şirketiyle veya üçüncü tarafla paylaşılmaz.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🗑️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Hesap ve Veri Silme Özgürlüğü</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">İstediğiniz an profil ekranından "Hesabımı Sil" butonuyla tüm kayıtlarınızı tek tıkla silebilirsiniz.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">🔒 GÜVENLİ TEKNOLOJİ</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">ŞEFFAFLIK VE GÜVEN<br><span>BİR ARADA!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Gelişmiş veri güvenliği protokollerimiz sayesinde gözünüz arkada kalmadan sivil katılımın bir parçası olun. Sokağınızı koruyun.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">GÜVENLE İNDİR VE KULLAN</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı verilerinizi korur.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 11. BELEDİYE DOSTU
    {
        "folder": "11_belediye_destek",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🏛️ YEREL YÖNETİM</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">BELEDİYELERİN İŞİNİ<br><span>KOLAYLAŞTIRIYORUZ!</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Alo Çukurhattı, yerel yönetimlerin sahadaki ücretsiz asistanıdır. Yapılandırılmış canlı veri ile arıza tespitleri anında çözülür.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Belediye Süreçleri &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">🏛️ DOĞRUDAN İLETİŞİM</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">SAHADAN NET AKIŞ</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">📍</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Hassas Koordinatlar</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">İhbarlar doğrudan GPS pini ile gider. Ekipler adresi bulmak için vakit kaybetmez.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">📸</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Detaylı Görsel Bilgi</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Yol hasarının boyutu fotoğrafla anında görülür, uygun malzeme ve ekipmanla yola çıkılır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">⌛</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Maliyet ve Keşif Tasarrufu</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Gereksiz keşif turları ortadan kalkar, belediyenin zaman ve bütçe tasarrufu yapması sağlanır.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">🏛️ BİRLİKTE YÖNETİM</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">BELEDİYENE YARDIMCI<br><span>OL VE HIZLANDIR!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Uygulama üzerinden toplanan temiz veriler belediyelerin sorunları önceliklendirmesini sağlar. Katkıda bulunarak süreci hızlandırın.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">SAHA VERİSİNE DESTEK OL</div>
                      <span style="font-size:26px; color:var(--text-mute);">Şehrimizin belediyeleri ile ortak çözüm.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 12. LİDERLİK TABLOSU
    {
        "folder": "12_liderlik_tablosu",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🏆 REKABET</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">LİDERLİK TABLOSUNDA<br><span>SIRALAMANIZ KAÇ?</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Şehrini en çok düşünen, mahalle sorunlarını en aktif şekilde bildiren sakinlerin sıralaması güncellendi. Yerinizi gördünüz mü?
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Sıralama Ayrıntıları &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">⚡ AKTİF SIRALAMA</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">YARIŞARAK İYİLEŞTİR</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🥇</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Haftalık Birinciler</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Her hafta en çok onaylanan raporu gönderen kullanıcılar haftalık liderlikte zirveye oturur.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">👥</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">"Ben de Gördüm" Puanı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Gönderdiğiniz çukura gelen her destek pini size ek sıralama puanı kazandırır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🏡</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Mahalle Sıralaması</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Yalnızca bireysel değil, sokağınızdaki komşularınızın aktifliğiyle mahalleniz üst sıralara taşınır.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">🏆 REKABETE KATIL</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">SOKAĞINI LİSTEDE<br><span>ZİRVEYE TAŞI!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Hemen Alo Çukurhattı uygulamasını indirin, profil oluşturun ve sokağınızdaki çukurları avlayarak mahalle liderleri arasına adınızı yazdırın.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">SIRALAMAYI HARİTADA GÖR</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı ile eğlenceli sivil katılım.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 13. GECE SÜRÜŞÜ
    {
        "folder": "13_gece_surusu",
        "slides": [
            {
                "bg_photo": "road_night.jpg",
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="photo-bg" style="background-image:url({bg_data})"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-attention" style="padding: 10px 24px;">🌑 GECE GÜVENLİĞİ</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">GECE GİZLENEN<br><span class="coral">TUZAKLARA DİKKAT!</span></h1>
                      <div class="line-decor line-attention"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Karanlık çöktüğünde yoldaki çukurları fark etmek neredeyse imkansızdır. Gece gizlenen bu tuzaklar kazalara davet çıkarır.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn coral">Gece Sürüş Riski &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px; color:var(--attention); border-color:rgba(231,111,79,0.15)">⚠️ GECE RİSK ANALİZİ</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">KARANLIKTAKİ TEHLİKELER</h2>
                      <div class="line-decor line-attention" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">👁️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Sınırlı Görüş Alanı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Kısa farların aydınlatma mesafesinde, derin bir yol çukurunu önceden fark edip kaçmak zordur.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">💥</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Hız ve Hasar Çarpımı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Gece boşalan yollarda yapılan yüksek hızlar, çukura girildiğindeki hasar boyutunu kat kat artırır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">☀️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Çözüm: Gündüz Bildirin</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Gündüz görüp bildirdiğiniz ve kapatılan bir çukur, gece başkasının hayatını veya aracını kurtarır.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg-attention"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px; color:var(--attention); border-color:var(--attention)">🌑 SOKAKLARI AYDINLAT</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">GECE YOLCULUKLARINI<br><span style="color:var(--attention)">GÜVENLİ KILIN!</span></h2>
                      <div class="line-decor line-attention" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Sokağınızda veya işe gidiş yolunuzdaki karanlıkta tehlike yaratan çukurları Alo Çukurhattı'ndan hemen bildirin, gece sürüş güvenliğini artırın.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn coral" style="font-size:38px; padding:22px 64px;">TEHLİKELİ SOKAKLARI RAPORLA</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı cebinizde.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 14. YAPAY ZEKA
    {
        "folder": "14_yapay_zeka",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">🤖 YAPAY ZEKA</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">BİLDİRİMLERİNİZİ AI İLE<br><span>ANINDA DOĞRULUYORUZ</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Google Vision AI entegrasyonumuz sayesinde, hatalı veya mükerrer ihbarları saniyeler içinde tespit edip filtreliyoruz.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Teknoloji Ayrıntıları &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">🧠 AKILLI KONTROL</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">YAPAY ZEKA DESTEĞİ</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🤖</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Otomatik Fotoğraf Analizi</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Yüklenen fotoğrafın gerçekten bir yol hasarı veya çukur içerdiği yapay zeka ile teyit edilir.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🚫</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Spam ve Kötü İçerik Filtresi</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">İlgisiz görseller, plakalar veya uygunsuz içerikler otomatik denetimle anında elenir.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">⚡</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Mükerrer Kayıt Engelleme</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Aynı çukurun birden çok kez ayrı bildirilmesi engellenir, destek pini olarak tek kayıtta birleştirilir.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">🚀 YAPAY ZEKA GÜCÜ</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">ŞEHRİ TEKNOLOJİ İLE<br><span>BİRLİKTE GÜNCELLEYELİM</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Yapay zeka filtrelemesi sayesinde belediyelere sadece doğrulanmış, temiz ve eyleme dökülebilir yol hasar verileri gider. Süreç hızlanır.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">BİLDİRİMİNİ ANINDA GÖNDER</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı saniyeler içinde doğrular.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    },
    # 15. SİVİL İNİSİYATİF
    {
        "folder": "15_sivil_inisiyatif",
        "slides": [
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content">
                    <div style="margin-top: 24px;"><span class="pill pill-primary" style="padding: 10px 24px;">✊ SİVİL GÜÇ</span></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px;">
                      <h1 class="h1-hero">BİREYSEL ŞİKAYET DEĞİL<br><span>KİTLESEL ÇÖZÜM!</span></h1>
                      <div class="line-decor line-primary"></div>
                      <p style="font-size:38px; color:var(--white); line-height:1.5; max-width:850px; font-weight:500;">
                        Tek başınıza sesinizi duyuramadığınız yol hasarlarını sivil katılımın gücüyle, tek bir harita üzerinde birleştirip çözüme kavuşturuyoruz.
                      </p>
                    </div>
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                      <div class="swipe-btn">Sivil Katılım &nbsp;›</div>
                    </div>
                    <div class="footer"><span>@alocukurhatti</span><span>1/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": False,
                "html": """
                <div class="slide" style="background:var(--light)">
                  <div class="grid-overlay" style="opacity:0.3;"></div>
                  <div class="content">
                    <div style="margin-top: 12px;"><span class="pill pill-light-glass" style="padding: 10px 24px;">🏡 MAHALLE DAYANIŞMASI</span></div>
                    <div style="margin-top: 32px;">
                      <h2 class="h2-header">BİRLİKTEN KUVVET DOĞAR</h2>
                      <div class="line-decor line-primary" style="margin-top:12px;"></div>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:24px;">
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">📢</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">"Ben de Gördüm" Desteği</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Bir çukuru ne kadar çok mahalle sakini onaylarsa, belediyenin öncelik listesinde o kadar yükselir.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">🗺️</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Şeffaf Kamuoyu Baskısı</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Haritada herkesin gördüğü sorunların gözden kaçırılması veya ertelenmesi imkansızlaşır.</p>
                        </div>
                      </div>
                      <div class="light-card" style="display:flex; align-items:center; gap:24px;">
                        <span style="font-size:52px;">💪</span>
                        <div>
                          <h3 style="font-size:32px; font-weight:800; color:var(--dark);">Ortak Yaşam Alanı Bilinci</h3>
                          <p style="font-size:26px; color:var(--dark); margin-top:4px;">Bireysel şikayetlerden, kitlesel sokak iyileştirme hareketine geçişi destekleyin.</p>
                        </div>
                      </div>
                    </div>
                    <div class="footer light-foot"><span>@alocukurhatti</span><span>2/3</span></div>
                  </div>
                </div>
                """
            },
            {
                "is_dark": True,
                "html": """
                <div class="slide">
                  <div class="dark-bg"></div>
                  <div class="grid-overlay"></div>
                  <div class="content" style="align-items:center; justify-content:space-between; text-align:center;">
                    <div style="margin-top:24px;"><span class="pill pill-glass" style="padding: 10px 24px;">✊ MAHALLENE SAHİP ÇIK</span></div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:24px;">
                      <h2 style="font-size:74px; font-weight:900; line-height:1.1;">ŞEHRİNİN GELECEĞİNİ<br><span>BİRLİKTE BELİRLEYİN!</span></h2>
                      <div class="line-decor line-primary" style="margin: 0 auto;"></div>
                      <p style="font-size:34px; color:var(--text-mute); max-width:780px; line-height:1.5;">
                        Alo Çukurhattı topluluğuna katılarak mahalle komşularınızla birlikte altyapı sorunlarını çözüme kavuşturun. İndir ve sokağını değiştir.
                      </p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:24px;">
                      <div class="swipe-btn" style="font-size:38px; padding:22px 64px;">HEMEN BİZE KATIL</div>
                      <span style="font-size:26px; color:var(--text-mute);">Alo Çukurhattı ücretsiz sivil katılım platformudur.</span>
                    </div>
                    <div class="footer" style="width:100%;"><span>@alocukurhatti</span><span>3/3</span></div>
                  </div>
                </div>
                """
            }
        ]
    }
]

def main():
    print("Playwright başlatılıyor...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1080, "height": 1080})

        total_slides = 0
        for item in CAROUSELS:
            folder_name = item["folder"]
            slides = item["slides"]
            dest_dir = OUT / folder_name
            dest_dir.mkdir(parents=True, exist_ok=True)

            print(f"\n[{folder_name}] oluşturuluyor...")
            for idx, slide in enumerate(slides):
                slide_num = idx + 1
                out_name = f"slide_{slide_num:02d}.png"
                out_path = dest_dir / out_name

                # HTML şablonuna verileri giydir
                bg_photo = slide.get("bg_photo", "")
                bg_data = ""
                if bg_photo:
                    bg_data = img_b64(bg_photo)

                html_content = slide["html"].format(bg_data=bg_data)
                full_html = HEAD + html_content + FOOT

                tmp_file = SOSYAL / f"_tmp_{folder_name}_{slide_num}.html"
                tmp_file.write_text(full_html, encoding="utf-8")

                page.goto(f"file:///{tmp_file}", wait_until="networkidle", timeout=20000)
                page.screenshot(path=str(out_path), clip={"x": 0, "y": 0, "width": 1080, "height": 1080})

                tmp_file.unlink()
                print(f"  -> Slide {slide_num} kaydedildi: {out_path.name}")
                total_slides += 1

        browser.close()
        print(f"\nBaşarıyla tamamlandı! Toplam {total_slides} görsel üretildi.")
        print(f"Görsellerin bulunduğu klasör: {OUT}")

if __name__ == "__main__":
    main()
