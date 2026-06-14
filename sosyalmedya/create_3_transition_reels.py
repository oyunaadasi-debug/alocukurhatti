# -*- coding: utf-8 -*-
from __future__ import annotations

import base64
import html
import json
import shutil
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "sosyalmedya" / "reels_3_senaryo_out"
FRAMES = OUT / "frames"
CANVA = OUT / "canva"
REELS = OUT / "reels"
TMP = OUT / "_tmp"

W = 1080
H = 1920

SCREENSHOTS = {
    "home": ROOT / "app-store-assets" / "screenshots" / "6.5-framed" / "00-ana-sayfa.png",
    "map": ROOT / "app-store-assets" / "screenshots" / "6.5-framed" / "01-harita.png",
    "rank": ROOT / "app-store-assets" / "screenshots" / "6.5-framed" / "02-siralama.png",
    "login": ROOT / "app-store-assets" / "screenshots" / "6.5-framed" / "03-giris.png",
}


SCENARIOS = [
    {
        "id": "01_30_saniyede_ihbar",
        "title": "30 Saniyede İhbar",
        "hook": "30 saniyede çukur ihbarı",
        "accent": "#E76F4F",
        "deep": "#14332D",
        "shot": "home",
        "voiceover": (
            "Yolda bir çukur gördüğünde artık sadece söylenmek zorunda değilsin. "
            "Alo Çukur Hattı'nı aç, fotoğrafını çek, konumu kontrol et ve gönder. "
            "Rapor haritada görünür olur, aynı sorunu görenler destek verebilir. "
            "Alo Çukur Hattı App Store'da."
        ),
        "caption": "Yol hasarını gördüğün anda bildir. Alo Çukur Hattı App Store'da.",
        "slides": [
            ("Yoldaki hasarı gör", "Kısa bir duraklama yeter.", "01"),
            ("Fotoğrafını çek", "Kanıtı tek dokunuşla ekle.", "02"),
            ("Konumu pinle", "Sorun haritada net görünsün.", "03"),
            ("Gönder ve takip et", "Mahalle aynı rapora destek verir.", "04"),
            ("APP STORE", "Alo Çukur Hattı'nı ücretsiz indir.", "05"),
        ],
    },
    {
        "id": "02_mahalle_haritasi",
        "title": "Mahalle Haritası",
        "hook": "Mahallendeki sorunlar görünür olsun",
        "accent": "#1FA98B",
        "deep": "#0E2F3C",
        "shot": "map",
        "voiceover": (
            "Bir yol hasarı kayda girmediğinde herkes için görünmez kalır. "
            "Alo Çukur Hattı ile o sorun haritada tek noktaya dönüşür. "
            "Mahalleli aynı rapora destek verir, süreç takip edilir. "
            "Şehrin için küçük ama görünür bir adım at."
        ),
        "caption": "Mahallendeki yol sorunlarını haritada görünür yap.",
        "slides": [
            ("Görünmeyen sorun ertelenir", "Haritada kayıt aç.", "01"),
            ("Tek noktada topla", "Konum, fotoğraf ve tarih bir arada.", "02"),
            ("Ben de Gördüm desteği", "Aynı sorunu yaşayanlar katılsın.", "03"),
            ("Süreci takip et", "Açık ve çözüldü durumlarını izle.", "04"),
            ("APP STORE", "Alo Çukur Hattı yayında.", "05"),
        ],
    },
    {
        "id": "03_gece_surusu",
        "title": "Gece Sürüşü",
        "hook": "Gece fark edilmeyen çukur tehlikedir",
        "accent": "#3B6EA5",
        "deep": "#171A2D",
        "shot": "rank",
        "voiceover": (
            "Gündüz gördüğün küçük bir çukur, gece bir sürücü için büyük tehlikeye dönüşebilir. "
            "Alo Çukur Hattı ile gördüğün yol hasarını fotoğrafla bildir. "
            "Konumu işaretle, haritada görünür yap. "
            "Bugün bildirdiğin bir çukur, yarın bir kazayı önleyebilir."
        ),
        "caption": "Bugün bildirdiğin bir çukur, yarın bir kazayı önleyebilir.",
        "slides": [
            ("Gündüz küçük görünür", "Gece risk büyür.", "01"),
            ("Sürücü, motorcu, yaya", "Herkes aynı yolu kullanıyor.", "02"),
            ("Fotoğrafla bildir", "Hasar kayda girsin.", "03"),
            ("Haritada görünür yap", "Yerel farkındalık artsın.", "04"),
            ("APP STORE", "Alo Çukur Hattı'nı indir.", "05"),
        ],
    },
]


def b64(path: Path) -> str:
    data = path.read_bytes()
    mime = "image/png"
    return f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def make_html(scenario: dict, slide: tuple[str, str, str], index: int, *, canva: bool = False) -> str:
    title, subtitle, step = slide
    shot = b64(SCREENSHOTS[scenario["shot"]])
    accent = scenario["accent"]
    deep = scenario["deep"]
    secondary = "#FBF9F4" if scenario["id"] != "03_gece_surusu" else "#F4F7FB"
    canva_class = " canva" if canva else ""
    return f"""
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      width: {W}px;
      height: {H}px;
      overflow: hidden;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      background: {secondary};
      color: #17211f;
    }}
    .stage {{
      position: relative;
      width: {W}px;
      height: {H}px;
      padding: 86px 74px 74px;
      background:
        radial-gradient(circle at 18% 12%, rgba(255,255,255,.95), rgba(255,255,255,0) 25%),
        linear-gradient(156deg, rgba(255,255,255,.98), rgba(251,249,244,.76) 38%, rgba(255,255,255,.94));
    }}
    .stage:before {{
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(120deg, {deep} 0%, rgba(20,51,45,.92) 49%, rgba(255,255,255,0) 49.2%),
        linear-gradient(0deg, rgba(255,255,255,.82), rgba(255,255,255,.18));
      clip-path: polygon(0 0, 100% 0, 100% 31%, 0 58%);
      opacity: .95;
    }}
    .stage:after {{
      content: "";
      position: absolute;
      left: 54px;
      right: 54px;
      bottom: 52px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(90deg, {accent}, rgba(255,255,255,.2), {deep});
      opacity: .72;
    }}
    .top {{
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      font-weight: 800;
      letter-spacing: .02em;
    }}
    .brand {{
      font-size: 34px;
      line-height: 1;
    }}
    .tag {{
      padding: 14px 22px;
      border: 1px solid rgba(255,255,255,.32);
      border-radius: 999px;
      background: rgba(255,255,255,.14);
      font-size: 22px;
    }}
    .hero {{
      position: relative;
      z-index: 2;
      margin-top: 170px;
      max-width: 690px;
      color: #fff;
    }}
    .hook {{
      font-size: 74px;
      line-height: .94;
      font-weight: 920;
      letter-spacing: 0;
      text-wrap: balance;
    }}
    .step {{
      display: inline-flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 26px;
      padding: 12px 18px 12px 13px;
      border-radius: 999px;
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.25);
      font-size: 22px;
      font-weight: 800;
    }}
    .dot {{
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: {accent};
      color: #fff;
    }}
    .phone {{
      position: absolute;
      right: 54px;
      top: 582px;
      width: 396px;
      height: 792px;
      border-radius: 58px;
      padding: 12px;
      background: rgba(255,255,255,.88);
      box-shadow: 0 34px 88px rgba(15, 33, 30, .28);
      transform: rotate(2.5deg);
      z-index: 3;
    }}
    .phone img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 48px;
    }}
    .card {{
      position: absolute;
      left: 74px;
      right: 74px;
      bottom: 218px;
      min-height: 330px;
      padding: 42px 42px 38px;
      border-radius: 42px;
      background: rgba(255,255,255,.9);
      border: 1px solid rgba(20,51,45,.12);
      box-shadow: 0 28px 74px rgba(31,52,47,.14);
      z-index: 4;
    }}
    .card h1 {{
      margin: 0;
      width: 610px;
      font-size: 66px;
      line-height: .98;
      font-weight: 920;
      color: #152420;
      letter-spacing: 0;
    }}
    .card p {{
      margin: 22px 0 0;
      width: 560px;
      font-size: 31px;
      line-height: 1.22;
      font-weight: 650;
      color: rgba(21,36,32,.76);
    }}
    .cta {{
      position: absolute;
      left: 74px;
      right: 74px;
      bottom: 98px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      border-radius: 30px;
      padding: 26px 30px;
      background: {deep};
      color: #fff;
      box-shadow: 0 18px 40px rgba(20,31,30,.24);
    }}
    .cta b {{
      font-size: 28px;
      line-height: 1;
    }}
    .cta span {{
      font-size: 22px;
      opacity: .76;
      font-weight: 700;
    }}
    .store {{
      white-space: nowrap;
      padding: 18px 23px;
      border-radius: 22px;
      background: {accent};
      color: #fff;
      font-size: 25px;
      font-weight: 900;
    }}
    .canva .hero {{
      margin-top: 118px;
    }}
    .canva .hook {{
      font-size: 67px;
      max-width: 780px;
    }}
    .canva .card h1 {{
      width: 620px;
      font-size: 62px;
    }}
    .canva .card {{
      bottom: 245px;
    }}
  </style>
</head>
<body>
  <main class="stage{canva_class}">
    <div class="top">
      <div class="brand">Alo Çukur Hattı</div>
      <div class="tag">@alocukurhatti</div>
    </div>
    <section class="hero">
      <div class="step"><span class="dot">{esc(step)}</span><span>{esc(scenario["title"])}</span></div>
      <div class="hook">{esc(scenario["hook"])}</div>
    </section>
    <div class="phone"><img src="{shot}" /></div>
    <section class="card">
      <h1>{esc(title)}</h1>
      <p>{esc(subtitle)}</p>
    </section>
    <section class="cta">
      <div>
        <b>Yol hasarını bildir</b><br />
        <span>Fotoğraf + konum + harita</span>
      </div>
      <div class="store">APP STORE</div>
    </section>
  </main>
</body>
</html>
"""


def render_png(page, html_text: str, path: Path) -> None:
    page.set_viewport_size({"width": W, "height": H})
    page.set_content(html_text, wait_until="networkidle")
    page.screenshot(path=str(path), full_page=True)


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, cwd=ROOT, check=True)


def make_reel(scenario: dict, frame_paths: list[Path]) -> Path:
    scenario_tmp = TMP / scenario["id"]
    if scenario_tmp.exists():
        shutil.rmtree(scenario_tmp)
    scenario_tmp.mkdir(parents=True, exist_ok=True)

    segments = []
    for idx, frame in enumerate(frame_paths):
        seg = scenario_tmp / f"seg_{idx+1:02d}.mp4"
        vf = (
            "scale=1200:2134,"
            "zoompan=z='min(zoom+0.0012,1.08)':d=90:"
            "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,"
            "format=yuv420p"
        )
        run([
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            str(frame),
            "-t",
            "3",
            "-vf",
            vf,
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-r",
            "30",
            str(seg),
        ])
        segments.append(seg)

    out = REELS / f"reels_{scenario['id']}.mp4"
    transitions = ["fade", "slideleft", "smoothright", "fadeblack"]
    graph_parts = []
    previous = "[0:v]"
    for idx in range(1, len(segments)):
        output = "[v]" if idx == len(segments) - 1 else f"[v{idx}]"
        offset = 2.55 * idx
        graph_parts.append(
            f"{previous}[{idx}:v]xfade=transition={transitions[idx-1]}:duration=0.45:offset={offset:.2f}{output}"
        )
        previous = output
    cmd = ["ffmpeg", "-y"]
    for seg in segments:
        cmd.extend(["-i", str(seg)])
    cmd.extend([
        "-filter_complex",
        ";".join(graph_parts),
        "-map",
        "[v]",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "30",
        str(out),
    ])
    run(cmd)
    return out


def write_manifest(outputs: dict[str, dict]) -> None:
    lines = [
        "# Alo Çukur Hattı - 3 Reels Senaryo Paketi",
        "",
        "Bu paket Instagram Reels/Hikaye için 1080x1920 formatında hazırlandı.",
        "Videolarda geçiş, hafif zoom hareketi ve büyük altyazı mantığı var.",
        "Lokal bilgisayarda doğal Türkçe TTS bulunmadığı için seslendirme metinleri ayrıca verildi.",
        "",
    ]
    for scenario in SCENARIOS:
        item = outputs[scenario["id"]]
        lines.extend([
            f"## {scenario['title']}",
            "",
            f"- Reels: `{item['reel']}`",
            f"- Canva görsel PNG: `{item['canva_png']}`",
            f"- Canva HTML: `{item['canva_html']}`",
            f"- Caption: {scenario['caption']}",
            "",
            "Seslendirme:",
            "",
            scenario["voiceover"],
            "",
            "Sahne akışı:",
        ])
        for idx, (title, subtitle, _) in enumerate(scenario["slides"], start=1):
            lines.append(f"{idx}. {title} - {subtitle}")
        lines.append("")
    (OUT / "senaryo_manifest.md").write_text("\n".join(lines), encoding="utf-8")
    (OUT / "senaryo_manifest.json").write_text(json.dumps(outputs, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    for directory in [OUT, FRAMES, CANVA, REELS, TMP]:
        directory.mkdir(parents=True, exist_ok=True)

    outputs: dict[str, dict] = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        try:
            for scenario in SCENARIOS:
                scenario_frame_dir = FRAMES / scenario["id"]
                scenario_frame_dir.mkdir(parents=True, exist_ok=True)
                frame_paths = []
                for idx, slide in enumerate(scenario["slides"], start=1):
                    frame = scenario_frame_dir / f"frame_{idx:02d}.png"
                    render_png(page, make_html(scenario, slide, idx), frame)
                    frame_paths.append(frame)

                canva_html = CANVA / f"canva_{scenario['id']}.html"
                canva_png = CANVA / f"canva_{scenario['id']}.png"
                canva_html.write_text(make_html(scenario, scenario["slides"][0], 1, canva=True), encoding="utf-8")
                render_png(page, make_html(scenario, scenario["slides"][0], 1, canva=True), canva_png)

                reel = make_reel(scenario, frame_paths)
                outputs[scenario["id"]] = {
                    "reel": str(reel.relative_to(ROOT)).replace("\\", "/"),
                    "canva_png": str(canva_png.relative_to(ROOT)).replace("\\", "/"),
                    "canva_html": str(canva_html.relative_to(ROOT)).replace("\\", "/"),
                    "frames": [str(path.relative_to(ROOT)).replace("\\", "/") for path in frame_paths],
                    "voiceover": scenario["voiceover"],
                    "caption": scenario["caption"],
                }
        finally:
            browser.close()

    write_manifest(outputs)
    shutil.rmtree(TMP, ignore_errors=True)
    print(f"Created {len(outputs)} reels in {REELS}")


if __name__ == "__main__":
    main()
