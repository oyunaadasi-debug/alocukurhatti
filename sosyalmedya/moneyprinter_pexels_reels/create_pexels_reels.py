from __future__ import annotations

import asyncio
import json
import math
import random
import shutil
import subprocess
import textwrap
import tomllib
from pathlib import Path
from typing import Iterable

import edge_tts
import requests
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
MONEYPRINTER = Path(r"C:\Users\talha\OneDrive\Masaüstü\MoneyPrinterTurbo")
CONFIG = MONEYPRINTER / "config.toml"
WORK = ROOT / "sosyalmedya" / "moneyprinter_pexels_reels"
ASSETS = WORK / "assets"
OUTPUTS = WORK / "outputs"
SIZE = (1080, 1920)
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")


REELS = [
    {
        "id": "01_profesyonel_lansman",
        "filename": "reels_01_pexels_lansman.mp4",
        "title": "Yoldaki çukuru artık bildiriyorsun",
        "script": (
            "Yoldaki çukur sadece küçük bir sorun gibi görünür. "
            "Ama her gün aynı yerden geçen sürücüler, motosikletliler ve yayalar için gerçek bir risktir. "
            "Alo Çukur Hattı ile fotoğraf çek, konumu işaretle ve raporu haritada görünür yap. "
            "Aynı sorunu görenler destek versin, çözüm süreci takip edilebilsin. "
            "Şehrindeki yol sorunlarını görünür hale getir."
        ),
        "scenes": [
            {
                "query": "street road damage",
                "preferred_id": 34218230,
                "label": "GÖRÜNÜR SORUN",
                "headline": "Her gün yanından geçilen yol hasarı",
            },
            {
                "query": "asphalt crack road",
                "preferred_id": 35988850,
                "label": "KANITLI KAYIT",
                "headline": "Hasarı net gösteren kanıt",
            },
            {
                "query": "road repair construction",
                "preferred_id": 18393428,
                "label": "TAKİP EDİLEBİLİR",
                "headline": "Rapor haritada görünür olur",
            },
            {
                "query": "road construction repair",
                "preferred_id": 13305663,
                "label": "TOPLULUK ETKİSİ",
                "headline": "Aynı sorunu görenler destek verir",
            },
            {
                "query": "smartphone city street",
                "label": "ALO ÇUKUR HATTI",
                "headline": "Ücretsiz indir, ilk raporunu bildir",
            },
        ],
    },
    {
        "id": "02_profesyonel_30_saniye",
        "filename": "reels_02_pexels_30_saniyede_rapor.mp4",
        "title": "30 saniyede yol hasarı bildir",
        "script": (
            "Alo Çukur Hattı'nda rapor oluşturmak çok kısa sürer. "
            "Önce yoldaki sorunu güvenli bir noktadan görüntüle. "
            "Uygulamada sorun türünü seç, ciddiyetini işaretle ve fotoğrafı ekle. "
            "Konumu kontrol et, gerekirse haritada düzelt. "
            "Gönderdiğinde rapor haritada görünür olur. "
            "Yol hasarını konuşmakla bırakma, kayda dönüştür."
        ),
        "scenes": [
            {
                "query": "person using phone street",
                "preferred_id": 13929579,
                "label": "1. AÇ",
                "headline": "Çukur Bildir ekranına gir",
            },
            {
                "query": "street road damage",
                "preferred_id": 34218230,
                "label": "2. SEÇ",
                "headline": "Sorun türünü ve ciddiyeti belirle",
            },
            {
                "query": "asphalt crack road",
                "preferred_id": 35988850,
                "label": "3. EKLE",
                "headline": "Fotoğrafı güvenli noktadan çek",
            },
            {
                "query": "navigation map phone city",
                "preferred_id": 4546864,
                "label": "4. KONTROL ET",
                "headline": "Konumu haritada doğrula",
            },
            {
                "query": "road work asphalt repair",
                "preferred_id": 855956,
                "label": "5. GÖNDER",
                "headline": "Rapor görünür ve takip edilir",
            },
        ],
    },
]


def ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if not found:
        raise RuntimeError("ffmpeg bulunamadı")
    return found


def ffprobe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def pexels_key() -> str:
    config = tomllib.loads(CONFIG.read_text(encoding="utf-8"))
    keys = config.get("app", {}).get("pexels_api_keys", [])
    if not keys:
        raise RuntimeError("MoneyPrinterTurbo config.toml içinde Pexels API anahtarı yok")
    return keys[0]


def best_video_file(files: Iterable[dict]) -> dict:
    candidates = []
    for item in files:
        width = int(item.get("width") or 0)
        height = int(item.get("height") or 0)
        if not item.get("link") or width < 640 or height < 640:
            continue
        portrait_bonus = 1 if height >= width else 0
        candidates.append((portrait_bonus, min(width, 1080), min(height, 1920), width * height, item))
    if not candidates:
        raise RuntimeError("Pexels sonucunda uygun video dosyası yok")
    return sorted(candidates, reverse=True)[0][-1]


def video_payload_to_source(video: dict, query: str) -> dict:
    file_info = best_video_file(video.get("video_files", []))
    return {
        "id": int(video["id"]),
        "query": query,
        "duration": video.get("duration"),
        "url": video.get("url"),
        "download": file_info["link"],
        "width": file_info.get("width"),
        "height": file_info.get("height"),
    }


def get_pexels_video_by_id(video_id: int, query: str) -> dict:
    response = requests.get(
        f"https://api.pexels.com/videos/videos/{video_id}",
        headers={"Authorization": pexels_key()},
        timeout=35,
    )
    response.raise_for_status()
    return video_payload_to_source(response.json(), query)


def search_pexels_video(query: str, used_ids: set[int]) -> dict:
    response = requests.get(
        "https://api.pexels.com/videos/search",
        params={"query": query, "orientation": "portrait", "per_page": 15},
        headers={"Authorization": pexels_key()},
        timeout=35,
    )
    response.raise_for_status()
    videos = response.json().get("videos", [])
    if not videos:
        response = requests.get(
            "https://api.pexels.com/videos/search",
            params={"query": query, "per_page": 15},
            headers={"Authorization": pexels_key()},
            timeout=35,
        )
        response.raise_for_status()
        videos = response.json().get("videos", [])
    random.shuffle(videos)
    for video in videos:
        video_id = int(video["id"])
        if video_id in used_ids:
            continue
        used_ids.add(video_id)
        return video_payload_to_source(video, query)
    raise RuntimeError(f"Pexels uygun video bulamadı: {query}")


def download(url: str, target: Path) -> None:
    if target.exists() and target.stat().st_size > 100_000:
        return
    with requests.get(url, stream=True, timeout=90) as response:
        response.raise_for_status()
        with target.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 512):
                if chunk:
                    handle.write(chunk)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def overlay_png(reel: dict, scene: dict, index: int, target: Path) -> None:
    image = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # A restrained dark gradient keeps Pexels footage visible while preserving legibility.
    for y in range(SIZE[1]):
        alpha = int(36 + 112 * (y / SIZE[1]) ** 1.7)
        draw.line((0, y, SIZE[0], y), fill=(8, 20, 17, alpha))

    accent = (31, 169, 139, 255)
    cream = (250, 247, 238, 255)
    dark = (12, 30, 26, 230)

    draw.rounded_rectangle((64, 88, 318, 152), radius=32, fill=accent)
    draw.text((92, 106), scene["label"], font=font(FONT_BOLD, 28), fill=cream)
    draw.text((64, 176), "@alocukurhatti", font=font(FONT_BOLD, 34), fill=cream)

    title_lines = textwrap.wrap(scene["headline"], width=18)
    y = 1110
    for line_index, line in enumerate(title_lines[:3]):
        draw.text(
            (64, y + line_index * 92),
            line,
            font=font(FONT_BOLD, 72),
            fill=cream if line_index == 0 else accent,
            stroke_width=2,
            stroke_fill=dark,
        )

    draw.rounded_rectangle((64, 1664, 1016, 1772), radius=54, fill=accent)
    cta = "Ücretsiz indir" if index == len(reel["scenes"]) - 1 else "Raporu görünür yap"
    draw.text((104, 1696), cta, font=font(FONT_BOLD, 42), fill=cream)
    draw.ellipse((918, 1684, 984, 1750), fill=(255, 255, 255, 46))
    draw.text((944, 1692), ">", font=font(FONT_BOLD, 42), fill=cream)

    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target)


async def create_voice(text: str, output: Path) -> None:
    if output.exists() and output.stat().st_size > 50_000:
        return
    await edge_tts.Communicate(text, "tr-TR-AhmetNeural", rate="+4%").save(str(output))


def render_segment(source: Path, overlay: Path, duration: float, target: Path) -> None:
    start = 0
    try:
        source_duration = ffprobe_duration(source)
        if source_duration > duration + 1:
            start = max(0, (source_duration - duration) / 3)
    except Exception:
        pass
    subprocess.run(
        [
            ffmpeg(),
            "-y",
            "-ss",
            f"{start:.2f}",
            "-t",
            f"{duration:.2f}",
            "-i",
            str(source),
            "-i",
            str(overlay),
            "-filter_complex",
            (
                "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,"
                "crop=1080:1920,setsar=1,fps=30,format=yuv420p[base];"
                "[base][1:v]overlay=0:0[v]"
            ),
            "-map",
            "[v]",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            str(target),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def concat_segments(segments: list[Path], audio: Path, output: Path) -> None:
    list_file = output.with_suffix(".txt")
    list_file.write_text(
        "".join(f"file '{path.as_posix()}'\n" for path in segments),
        encoding="utf-8",
    )
    subprocess.run(
        [
            ffmpeg(),
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-i",
            str(audio),
            "-map",
            "0:v",
            "-map",
            "1:a",
            "-shortest",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-movflags",
            "+faststart",
            str(output),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def preview(video: Path, target: Path) -> None:
    subprocess.run(
        [
            ffmpeg(),
            "-y",
            "-ss",
            "00:00:02",
            "-i",
            str(video),
            "-frames:v",
            "1",
            "-update",
            "1",
            str(target),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def build_reel(reel: dict, used_ids: set[int]) -> dict:
    reel_dir = ASSETS / reel["id"]
    reel_dir.mkdir(parents=True, exist_ok=True)
    audio = reel_dir / "voice.mp3"
    asyncio.run(create_voice(reel["script"], audio))
    audio_duration = ffprobe_duration(audio)
    scene_duration = max(4.0, math.ceil(audio_duration / len(reel["scenes"])))

    sources = []
    segments = []
    for index, scene in enumerate(reel["scenes"], start=1):
        if scene.get("preferred_id"):
            item = get_pexels_video_by_id(int(scene["preferred_id"]), scene["query"])
            used_ids.add(item["id"])
        else:
            item = search_pexels_video(scene["query"], used_ids)
        raw = reel_dir / f"pexels_{index:02d}_{item['id']}.mp4"
        download(item["download"], raw)
        overlay = reel_dir / f"overlay_{index:02d}.png"
        overlay_png(reel, scene, index - 1, overlay)
        segment = reel_dir / f"segment_{index:02d}.mp4"
        render_segment(raw, overlay, scene_duration, segment)
        segments.append(segment)
        sources.append({**item, "local_file": str(raw)})

    output = OUTPUTS / reel["filename"]
    OUTPUTS.mkdir(parents=True, exist_ok=True)
    concat_segments(segments, audio, output)
    preview(output, OUTPUTS / reel["filename"].replace(".mp4", "_preview.jpg"))
    return {
        "id": reel["id"],
        "title": reel["title"],
        "video": str(output),
        "duration": round(ffprobe_duration(output), 1),
        "sources": sources,
    }


def main() -> None:
    random.seed(604)
    manifest = [build_reel(reel, set()) for reel in REELS]
    (WORK / "source_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
