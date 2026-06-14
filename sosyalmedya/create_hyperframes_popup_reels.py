# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "sosyalmedya" / "hyperframes_popup_reels"
TMP = OUT / "_frames_nasil_kullanilir"
WIDTH = 1080
HEIGHT = 1920
FPS = 16
OUTPUT_FPS = 30
DURATION = 18


HTML = r"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Alo Çukur Hattı - Nasıl Kullanılır Popup Reel</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    width: 1080px;
    height: 1920px;
    margin: 0;
    overflow: hidden;
    background: #050505;
    color: #fff;
    font-family: "Segoe UI", Inter, Arial, sans-serif;
  }
  [data-composition-id="alocukur-nasil-kullanilir"] {
    position: relative;
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    background:
      radial-gradient(circle at 78% 15%, rgba(229,57,53,.48), rgba(229,57,53,.08) 30%, rgba(229,57,53,0) 55%),
      radial-gradient(circle at 10% 74%, rgba(31,169,139,.20), rgba(31,169,139,0) 45%),
      linear-gradient(160deg, #161616 0%, #080808 58%, #030303 100%);
  }
  .grain {
    position: absolute;
    inset: 0;
    opacity: .16;
    background-image:
      linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 54px 54px;
    transform: translateY(calc(var(--t) * -8px));
  }
  .badge {
    position: absolute;
    left: 74px;
    top: 82px;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 16px 28px;
    border-radius: 999px;
    background: rgba(229,57,53,.13);
    border: 1.5px solid rgba(229,57,53,.56);
    color: #ff7171;
    font-size: 23px;
    font-weight: 900;
    letter-spacing: .16em;
  }
  .badge:before {
    content: "";
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #f44336;
    box-shadow: 0 0 18px #f44336;
  }
  .headline {
    position: absolute;
    left: 74px;
    right: 74px;
    top: 172px;
    font-size: 94px;
    line-height: .98;
    font-weight: 950;
    letter-spacing: 0;
    transform: translateY(calc(var(--intro) * 22px));
    opacity: calc(1 - var(--intro));
  }
  .headline .red { color: #ef3d39; }
  .sub {
    position: absolute;
    left: 78px;
    right: 78px;
    top: 493px;
    font-size: 34px;
    line-height: 1.24;
    color: #e8e8e8;
    font-weight: 680;
    opacity: calc(1 - var(--intro));
  }
  .stage-line {
    position: absolute;
    left: 72px;
    right: 72px;
    bottom: 305px;
    height: 2px;
    background: linear-gradient(90deg, #ef3d39, rgba(255,255,255,.18), rgba(255,255,255,0));
    opacity: .82;
  }
  .popup {
    position: absolute;
    left: 74px;
    right: 74px;
    min-height: 170px;
    border-radius: 34px;
    padding: 30px 32px;
    display: flex;
    align-items: center;
    gap: 24px;
    background: linear-gradient(135deg, rgba(255,255,255,.13), rgba(255,255,255,.065));
    border: 1px solid rgba(255,255,255,.15);
    box-shadow: 0 34px 90px rgba(0,0,0,.36);
    backdrop-filter: blur(10px);
    opacity: var(--o);
    transform: translate3d(calc(var(--x) * 1px), calc(var(--y) * 1px), 0) scale(var(--s));
  }
  .popup:nth-of-type(1) { top: 664px; }
  .popup:nth-of-type(2) { top: 854px; }
  .popup:nth-of-type(3) { top: 1044px; }
  .popup:nth-of-type(4) { top: 1234px; }
  .icon {
    flex: 0 0 76px;
    width: 76px;
    height: 76px;
    border-radius: 23px;
    display: grid;
    place-items: center;
    background: #ef3d39;
    color: #fff;
    font-size: 37px;
    font-weight: 950;
    box-shadow: 0 18px 36px rgba(239,61,57,.28);
  }
  .text b {
    display: block;
    font-size: 43px;
    line-height: 1.02;
    font-weight: 950;
  }
  .text span {
    display: block;
    margin-top: 9px;
    font-size: 28px;
    line-height: 1.17;
    color: #d7d7d7;
    font-weight: 650;
  }
  .cta {
    position: absolute;
    left: 74px;
    right: 74px;
    bottom: 84px;
    min-height: 182px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 32px 36px;
    border-radius: 38px;
    background: #fff;
    color: #040404;
    box-shadow: 0 34px 90px rgba(255,255,255,.13);
    opacity: var(--cta-o);
    transform: translateY(calc(var(--cta-y) * 1px)) scale(var(--cta-s));
  }
  .cta .label {
    font-size: 19px;
    color: #777;
    text-transform: uppercase;
    letter-spacing: .22em;
    font-weight: 900;
  }
  .cta .brand {
    margin-top: 8px;
    font-size: 47px;
    line-height: 1.02;
    font-weight: 950;
  }
  .cta .brand .red { color: #ef3d39; }
  .cta .store {
    display: grid;
    place-items: center;
    min-width: 250px;
    min-height: 82px;
    padding: 0 26px;
    border-radius: 26px;
    background: #050505;
    color: #fff;
    font-size: 30px;
    font-weight: 950;
  }
  .handle {
    position: absolute;
    left: 80px;
    bottom: 338px;
    font-size: 28px;
    font-weight: 850;
    color: #fff;
    opacity: .88;
  }
</style>
</head>
<body>
<main data-composition-id="alocukur-nasil-kullanilir" data-width="1080" data-height="1920" data-start="0" data-duration="18">
  <div class="grain"></div>
  <div class="badge">ÜCRETSİZ YAYINDA</div>
  <h1 class="headline">Yoldaki çukuru<br>görürsen<br><span class="red">bildir.</span></h1>
  <p class="sub">Alo Çukur Hattı ile şikayet oluşturmak basit: indir, fotoğrafını çek, konumu onayla.</p>

  <section class="popup" id="p1"><div class="icon">1</div><div class="text"><b>App Store’dan indir</b><span>Alo Çukur Hattı’nı telefonuna kur.</span></div></section>
  <section class="popup" id="p2"><div class="icon">2</div><div class="text"><b>Fotoğrafını çek</b><span>Çukuru veya yol hasarını net şekilde fotoğrafla.</span></div></section>
  <section class="popup" id="p3"><div class="icon">3</div><div class="text"><b>Konum otomatik gelsin</b><span>Uygulama yeri işaretler, sen kontrol edersin.</span></div></section>
  <section class="popup" id="p4"><div class="icon">4</div><div class="text"><b>Şikayetini oluştur</b><span>Gönder; sorun haritada görünür olsun.</span></div></section>

  <div class="handle">@alocukurhatti</div>
  <div class="stage-line"></div>
  <section class="cta">
    <div>
      <div class="label">App Store</div>
      <div class="brand">Alo Çukur Hattı<br><span class="red">hemen indir.</span></div>
    </div>
    <div class="store">APP STORE</div>
  </section>
</main>
<script>
  const root = document.querySelector('[data-composition-id]');
  const popups = ['p1', 'p2', 'p3', 'p4'].map((id) => document.getElementById(id));
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  function enter(t, start, end) { return ease((t - start) / (end - start)); }
  window.__setFrameTime = function(t) {
    root.style.setProperty('--t', t.toFixed(3));
    root.style.setProperty('--intro', (1 - enter(t, 0.1, 1.0)).toFixed(3));
    const times = [[2.2,3.0], [5.1,5.9], [8.0,8.8], [10.9,11.7]];
    popups.forEach((p, i) => {
      const v = enter(t, times[i][0], times[i][1]);
      const settle = Math.sin(clamp((t - times[i][0]) / 1.2) * Math.PI) * 16;
      p.style.setProperty('--o', v.toFixed(3));
      p.style.setProperty('--x', ((1 - v) * -92).toFixed(2));
      p.style.setProperty('--y', ((1 - v) * 38 - settle).toFixed(2));
      p.style.setProperty('--s', (0.92 + v * 0.08).toFixed(3));
    });
    const c = enter(t, 14.3, 15.15);
    root.style.setProperty('--cta-o', c.toFixed(3));
    root.style.setProperty('--cta-y', ((1 - c) * 80).toFixed(2));
    root.style.setProperty('--cta-s', (0.94 + c * 0.06).toFixed(3));
  };
  window.__setFrameTime(0);
</script>
</body>
</html>
"""


def render_frames(html_path: Path) -> None:
    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir(parents=True, exist_ok=True)
    total = DURATION * FPS
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT}, device_scale_factor=1)
        page.set_content(html_path.read_text(encoding="utf-8"), wait_until="networkidle")
        for frame in range(total):
            t = frame / FPS
            page.evaluate("(time) => window.__setFrameTime(time)", t)
            page.screenshot(path=str(TMP / f"frame_{frame:05d}.png"), full_page=True)
        browser.close()


def render_video(mp4_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(TMP / "frame_%05d.png"),
            "-vf",
            "format=yuv420p",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-r",
            str(OUTPUT_FPS),
            str(mp4_path),
        ],
        cwd=ROOT,
        check=True,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    html_path = OUT / "01_nasil_kullanilir_popup.html"
    mp4_path = OUT / "01_nasil_kullanilir_popup.mp4"
    poster_path = OUT / "01_nasil_kullanilir_popup_poster.png"
    html_path.write_text(HTML, encoding="utf-8")
    render_frames(html_path)
    shutil.copyfile(TMP / f"frame_{math.floor(15.5 * FPS):05d}.png", poster_path)
    render_video(mp4_path)
    shutil.rmtree(TMP, ignore_errors=True)
    manifest = {
        "title": "Nasıl Kullanılır Popup Reels",
        "source": str(html_path.relative_to(ROOT)).replace("\\", "/"),
        "video": str(mp4_path.relative_to(ROOT)).replace("\\", "/"),
        "poster": str(poster_path.relative_to(ROOT)).replace("\\", "/"),
        "format": {"width": WIDTH, "height": HEIGHT, "capture_fps": FPS, "output_fps": OUTPUT_FPS, "duration": DURATION},
        "voiceover": (
            "Yoldaki çukuru gördün mü? Alo Çukur Hattı'nı App Store'dan indir. "
            "Fotoğrafını çek, konumunu kontrol et, şikayetini oluştur. "
            "Sorun haritada görünür olsun."
        ),
        "caption": "İndir, fotoğrafını çek, konumunu onayla, şikayetini oluştur. Alo Çukur Hattı App Store'da.",
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "README.md").write_text(
        "# Alo Çukur Hattı HyperFrames Popup Reels\n\n"
        "İlk video: `01_nasil_kullanilir_popup.mp4`\n\n"
        "Akış: App Store'dan indir -> Fotoğrafını çek -> Konum otomatik gelsin -> Şikayetini oluştur -> APP STORE.\n\n"
        "Seslendirme:\n\n"
        f"{manifest['voiceover']}\n",
        encoding="utf-8",
    )
    print(mp4_path)


if __name__ == "__main__":
    main()
