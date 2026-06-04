# -*- coding: utf-8 -*-
"""
Alo Çukur Hattı - İlk 5 sosyal medya içeriği görsel üretici.

Çıktılar:
- Reels/TikTok kapak ve storyboard görselleri: 1080x1920
- Instagram carousel: 1080x1080
- Story anket görselleri: 1080x1920
- X paylaşım kartı: 1600x900
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parent
OUT = BASE / "ready_content" / "ilk_5"
TMP = BASE / "_tmp_first_5.html"
CAROUSEL_BG = BASE / "moneyprinter_pexels_reels" / "outputs" / "reels_01_pexels_lansman_contact.jpg"

PALETTE = {
    "canvas": "#FBF9F4",
    "canvas_soft": "#F2EEE5",
    "canvas_softer": "#E8E2D6",
    "ink": "#1B1A16",
    "body": "#5C574D",
    "mute": "#9A9488",
    "primary": "#1FA98B",
    "primary_dim": "#178A70",
    "primary_container": "#CDEDE3",
    "secondary": "#3B6EA5",
    "attention": "#E76F4F",
    "success": "#2E9E6B",
    "warning": "#E0A23B",
    "white": "#FFFFFF",
}


def shell(title, eyebrow, body, cta="", icon="pin", dark=False, meta="@alocukurhatti", size="vertical", bg_image=""):
    if size == "square":
        width, height = 1080, 1080
        pad = 76
        h1 = 76
        body_size = 34
        center_rule = "justify-content: center;"
    elif size == "wide":
        width, height = 1600, 900
        pad = 76
        h1 = 72
        body_size = 32
        center_rule = "justify-content: center;"
    else:
        width, height = 1080, 1920
        pad = 76
        h1 = 82
        body_size = 40
        center_rule = "justify-content: flex-start; padding-top: 250px;"

    bg = (
        f"radial-gradient(circle at 50% 20%, #24534a 0%, {PALETTE['ink']} 72%)"
        if dark
        else f"linear-gradient(160deg, {PALETTE['canvas']} 0%, {PALETTE['canvas_soft']} 100%)"
    )
    text = PALETTE["white"] if dark else PALETTE["ink"]
    sub = "#D8D2C6" if dark else PALETTE["body"]
    card = "rgba(255,255,255,0.08)" if dark else "rgba(255,255,255,0.55)"
    border = "rgba(255,255,255,0.16)" if dark else "rgba(27,26,22,0.08)"
    photo_opacity = 0.22 if dark else 0.18
    photo_overlay = "rgba(8,20,17,0.48)" if dark else "rgba(251,249,244,0.76)"
    photo_bg = (
        f"""
          .photo-bg {{
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(160deg, {photo_overlay}, {photo_overlay}),
              url("{bg_image}");
            background-size: cover;
            background-position: center;
            opacity: {photo_opacity};
            filter: saturate(0.82) contrast(1.08);
            transform: scale(1.04);
          }}
          .photo-sheen {{
            position: absolute;
            inset: 0;
            background:
              linear-gradient(120deg, transparent 0 46%, rgba(31,169,139,0.14) 46% 50%, transparent 50% 100%),
              radial-gradient(circle at 16% 18%, rgba(31,169,139,0.18), transparent 28%),
              radial-gradient(circle at 86% 80%, rgba(231,111,79,0.12), transparent 30%);
          }}
        """
        if bg_image
        else ""
    )
    photo_html = '<div class="photo-bg"></div><div class="photo-sheen"></div>' if bg_image else ""

    return f"""
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * {{ box-sizing: border-box; }}
          body {{
            margin: 0;
            width: {width}px;
            height: {height}px;
            overflow: hidden;
            font-family: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;
            background: {bg};
            color: {text};
          }}
          .frame {{
            position: relative;
            width: {width}px;
            height: {height}px;
            padding: {pad}px;
            display: flex;
            flex-direction: column;
          }}
          .grid {{
            position: absolute;
            inset: 0;
            background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
            background-size: 52px 52px;
            opacity: {0.45 if dark else 0.23};
          }}
          {photo_bg}
          .badge {{
            position: relative;
            z-index: 2;
            align-self: flex-start;
            display: inline-flex;
            align-items: center;
            gap: 14px;
            padding: 14px 26px;
            border-radius: 999px;
            background: {PALETTE['primary']};
            color: white;
            font-size: 28px;
            font-weight: 850;
            letter-spacing: 0.02em;
          }}
          .center {{
            position: relative;
            z-index: 2;
            flex: 1;
            display: flex;
            flex-direction: column;
            {center_rule}
            gap: 30px;
          }}
          .icon {{
            width: 132px;
            height: 132px;
            border-radius: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: {card};
            border: 1.5px solid {border};
            box-shadow: 0 22px 80px rgba(27,26,22,0.22);
          }}
          .icon svg {{ width: 74px; height: 74px; stroke: {PALETTE['primary']}; stroke-width: 2.3; fill: none; stroke-linecap: round; stroke-linejoin: round; }}
          h1 {{
            margin: 0;
            font-size: {h1}px;
            line-height: 0.98;
            letter-spacing: -0.03em;
            font-weight: 900;
            max-width: {width - pad * 2}px;
          }}
          h1 span {{ color: {PALETTE['primary']}; }}
          p {{
            margin: 0;
            max-width: {width - pad * 2 - 40}px;
            color: {sub};
            font-size: {body_size}px;
            line-height: 1.26;
            font-weight: 620;
          }}
          .cta {{
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 22px;
            min-height: 96px;
            padding: 18px 22px 18px 34px;
            border-radius: 999px;
            background: {PALETTE['primary']};
            color: white;
            font-size: 31px;
            font-weight: 900;
            box-shadow: 0 22px 52px rgba(31,169,139,0.32);
          }}
          .cta .dot {{
            width: 60px;
            height: 60px;
            border-radius: 999px;
            background: rgba(255,255,255,0.22);
            display:flex;
            align-items:center;
            justify-content:center;
          }}
          .footer {{
            position: relative;
            z-index: 2;
            margin-top: 28px;
            padding-top: 24px;
            border-top: 1px solid {border};
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: {sub};
            font-size: 25px;
            font-weight: 760;
          }}
        </style>
      </head>
      <body>
        <div class="frame">
          <div class="grid"></div>
          {photo_html}
          <div class="badge">{eyebrow}</div>
          <div class="center">
            <div class="icon">{icon_svg(icon)}</div>
            <h1>{title}</h1>
            <p>{body}</p>
          </div>
          {f'<div class="cta"><span>{cta}</span><span class="dot">›</span></div>' if cta else ''}
          <div class="footer"><span>{meta}</span><span>Alo Çukur Hattı</span></div>
        </div>
      </body>
    </html>
    """


def icon_svg(name):
    icons = {
        "camera": '<svg viewBox="0 0 24 24"><path d="M4 8h4l2-3h4l2 3h4v11H4z"/><circle cx="12" cy="13" r="4"/></svg>',
        "pin": '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
        "map": '<svg viewBox="0 0 24 24"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/></svg>',
        "eye": '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
        "bell": '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
        "chart": '<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3-4 3 2 4-7"/></svg>',
        "phone": '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
        "warning": '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 9v5M12 17h.01"/></svg>',
        "share": '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4.4M8.6 13.3l6.8 4.4"/></svg>',
    }
    return icons.get(name, icons["pin"])


def render(page, html, out_path, width, height):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    TMP.write_text(html, encoding="utf-8")
    page.set_viewport_size({"width": width, "height": height})
    page.goto(f"file:///{TMP}", wait_until="networkidle", timeout=20000)
    page.screenshot(path=str(out_path), clip={"x": 0, "y": 0, "width": width, "height": height})


def vertical(page, folder, name, title, eyebrow, body, cta="", icon="pin", dark=False):
    html = shell(title, eyebrow, body, cta, icon, dark, size="vertical")
    render(page, html, OUT / folder / name, 1080, 1920)


def square(page, folder, name, title, eyebrow, body, cta="", icon="pin", dark=False):
    bg_image = CAROUSEL_BG.resolve().as_uri() if CAROUSEL_BG.exists() else ""
    html = shell(title, eyebrow, body, cta, icon, dark, size="square", bg_image=bg_image)
    render(page, html, OUT / folder / name, 1080, 1080)


def wide(page, folder, name, title, eyebrow, body, cta="", icon="pin", dark=False):
    html = shell(title, eyebrow, body, cta, icon, dark, size="wide")
    render(page, html, OUT / folder / name, 1600, 900)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Gün - Reels/TikTok lansman
        vertical(page, "01_reels_lansman", "cover.png", "Yoldaki çukuru<br><span>artık bildiriyorsun</span>", "LANSMAN", "Fotoğrafla bildir, konumu işaretle, rapor haritada görünür olsun.", "Ücretsiz indir", "pin", True)
        vertical(page, "01_reels_lansman", "storyboard_01.png", "Her gün yanından<br><span>geçiyorsun</span>", "SAHNE 1", "Gördüğün yol hasarı kayda dönüşmezse görünmez kalır.", "", "warning", True)
        vertical(page, "01_reels_lansman", "storyboard_02.png", "Fotoğraf çek", "SAHNE 2", "Alo Çukur Hattı'nı aç ve yol hasarını net şekilde fotoğrafla.", "", "camera")
        vertical(page, "01_reels_lansman", "storyboard_03.png", "Konumu işaretle", "SAHNE 3", "GPS ile konumu al veya haritadan manuel düzelt.", "", "map")
        vertical(page, "01_reels_lansman", "storyboard_04.png", "Herkes görsün", "SAHNE 4", "Rapor haritada görünür olur. Aynı sorunu görenler destek verebilir.", "", "eye")
        vertical(page, "01_reels_lansman", "storyboard_05.png", "Bugün ilk raporunu<br><span>bildir</span>", "CTA", "Ücretsiz kullan. Anonim bildirim yapabilirsin.", "Hemen indir", "phone", True)

        # 2. Gün - Carousel
        square(page, "02_carousel_3_adim", "slide_01.png", "3 adımda<br><span>yol hasarı bildir</span>", "REHBER", "Fotoğraf çek. Konumu işaretle. Haritada görünür yap.", "Kaydır", "pin", True)
        square(page, "02_carousel_3_adim", "slide_02.png", "1. Fotoğraf çek", "ADIM 1", "Çukurun veya yol hasarının net göründüğü bir fotoğraf ekle.", "", "camera")
        square(page, "02_carousel_3_adim", "slide_03.png", "2. Konumu işaretle", "ADIM 2", "Uygulama konumunu otomatik alır. İstersen haritadan manuel düzeltebilirsin.", "", "map")
        square(page, "02_carousel_3_adim", "slide_04.png", "3. Gönder ve<br><span>takip et</span>", "ADIM 3", "Rapor haritada görünür olur. Aynı sorunu görenler Ben de Gördüm diyebilir.", "", "bell")
        square(page, "02_carousel_3_adim", "slide_05.png", "İlk pin<br><span>senden gelsin</span>", "CTA", "Alo Çukur Hattı ücretsiz bir vatandaş uygulamasıdır.", "Ücretsiz indir", "phone", True)

        # 3. Gün - Story anket serisi
        vertical(page, "03_story_anket", "story_01.png", "Mahallende<br><span>yol hasarı var mı?</span>", "ANKET", "Var / Yok gibi", "Cevapla", "warning")
        vertical(page, "03_story_anket", "story_02.png", "Varsa genelde<br><span>ne oluyor?</span>", "ANKET", "Çukur mu, bozuk yol mu?", "Oy ver", "map")
        vertical(page, "03_story_anket", "story_03.png", "Fotoğrafla haritaya<br><span>işlemek ister misin?</span>", "ANKET", "Evet / Nasıl?", "Cevapla", "camera")
        vertical(page, "03_story_anket", "story_04.png", "Fotoğraf çek,<br><span>konumu işaretle</span>", "CTA", "Alo Çukur Hattı ile raporu takip et.", "Ücretsiz indir", "phone", True)

        # 4. Gün - Reels ekran kaydı storyboard
        vertical(page, "04_reels_30_saniye", "cover.png", "30 saniyede<br><span>rapor nasıl atılır?</span>", "REELS", "Uygulamayı aç, türü seç, fotoğraf ekle, konumu kontrol et.", "İzle", "phone", True)
        vertical(page, "04_reels_30_saniye", "storyboard_01.png", "Çukur Bildir'e<br><span>dokun</span>", "1/6", "Ana ekrandan rapor oluşturma akışını başlat.", "", "phone")
        vertical(page, "04_reels_30_saniye", "storyboard_02.png", "Sorun türünü seç", "2/6", "Çukur, bozuk yol, kaldırım, tümsek veya su birikintisi.", "", "pin")
        vertical(page, "04_reels_30_saniye", "storyboard_03.png", "Ciddiyeti işaretle", "3/6", "Küçük, orta veya tehlikeli olarak belirt.", "", "warning")
        vertical(page, "04_reels_30_saniye", "storyboard_04.png", "Fotoğraf ekle", "4/6", "Kamera veya galeriden net bir fotoğraf seç.", "", "camera")
        vertical(page, "04_reels_30_saniye", "storyboard_05.png", "Konumu kontrol et", "5/6", "GPS konumu doğru değilse haritadan düzelt.", "", "map")
        vertical(page, "04_reels_30_saniye", "storyboard_06.png", "Haritada<br><span>görünsün</span>", "6/6", "Gönder. Rapor görünür olsun, takip edilebilsin.", "Rapor oluştur", "bell", True)

        # 5. Gün - X paylaşım görsel kartı
        wide(page, "05_x_paylasim", "x_card_01.png", "Fotoğraf + konum + tarih<br><span>daha güçlü vatandaş verisi</span>", "X PAYLAŞIMI", "Bir yol hasarı görünür olursa takip edilebilir. Alo Çukur Hattı ile gördüğün çukuru haritaya ekle.", "Ücretsiz indir", "chart", True)

        browser.close()
    if TMP.exists():
        TMP.unlink()
    print(f"Hazır içerikler üretildi: {OUT}")


if __name__ == "__main__":
    main()
