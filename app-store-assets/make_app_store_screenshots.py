"""Generate App Store-ready 6.9" marketing screenshots from raw TestFlight captures."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter


W, H = 1290, 2796
INK = (26, 26, 28)
BODY = (17, 17, 19)
WHITE = (255, 255, 255)
FONT_BOLD = r"C:\Windows\Fonts\seguibl.ttf"

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "ekrangor"
OUT_69 = ROOT / "app-store-assets" / "screenshots" / "6.9-framed"
OUT_65 = ROOT / "app-store-assets" / "screenshots" / "6.5-framed"

THEMES = {
    "mint": ((226, 246, 241), (176, 224, 213), (31, 169, 139)),
    "blue": ((228, 238, 250), (188, 212, 242), (52, 126, 206)),
    "amber": ((251, 244, 228), (244, 224, 184), (214, 150, 44)),
}

# Crop removes the TestFlight header while preserving the app navigation bar.
SHOTS = [
    (
        "photo_2026-05-31_04-26-22 (3).jpg",
        "00-ana-sayfa.png",
        "mint",
        [[("Yoldaki tüm çukurları", False)], [("haritadan takip edin", True)]],
        78,
    ),
    (
        "photo_2026-05-31_04-26-22 (2).jpg",
        "01-cukur-bildir.png",
        "mint",
        [[("Çukuru fotoğrafla", False)], [("saniyeler içinde bildir", True)]],
        78,
    ),
    (
        "photo_2026-05-31_04-26-22.jpg",
        "02-siralama.png",
        "blue",
        [[("Şehrindeki sorunları", False)], [("şeffafça takip et", True)]],
        78,
    ),
    (
        "photo_2026-05-31_04-26-21.jpg",
        "03-hesap-olustur.png",
        "amber",
        [[("Raporlarını takip et", False)], [("çözülünce haberdar ol", True)]],
        92,
    ),
]


def diagonal_gradient(c1, c2):
    canvas = Image.new("RGB", (96, 208))
    px = canvas.load()
    for y in range(canvas.height):
        for x in range(canvas.width):
            t = (x / (canvas.width - 1) + y / (canvas.height - 1)) / 2
            px[x, y] = tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return canvas.resize((W, H), Image.Resampling.BICUBIC)


def soft_circle(canvas, cx, cy, radius, color, alpha):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=color + (alpha,),
    )
    return Image.alpha_composite(canvas, layer.filter(ImageFilter.GaussianBlur(radius // 2)))


def rounded(image, radius):
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, *image.size], radius, fill=255)
    output = Image.new("RGBA", image.size)
    output.paste(image, (0, 0), mask)
    return output


def measure(draw, parts, font):
    return sum(draw.textbbox((0, 0), text, font=font)[2] for text, _ in parts)


def draw_headline(canvas, lines, font, accent):
    draw = ImageDraw.Draw(canvas)
    ascent, descent = font.getmetrics()
    line_height = ascent + descent + 18
    y = 140 + (470 - line_height * len(lines)) // 2
    for parts in lines:
        x = (W - measure(draw, parts, font)) // 2
        for text, highlight in parts:
            width = draw.textbbox((0, 0), text, font=font)[2]
            if highlight:
                draw.rounded_rectangle(
                    [x - 22, y - 8, x + width + 22, y + ascent + descent + 8],
                    24,
                    fill=accent,
                )
                color = WHITE
            else:
                color = INK
            draw.text((x, y), text, font=font, fill=color)
            x += width
        y += line_height


def make(source, destination, theme_name, lines, crop_top, font):
    color_a, color_b, accent = THEMES[theme_name]
    background = diagonal_gradient(color_a, color_b).convert("RGBA")
    background = soft_circle(background, 120, 470, 230, accent, 46)
    background = soft_circle(background, W - 90, 360, 150, WHITE, 150)
    background = soft_circle(background, W - 120, H - 360, 260, accent, 38)

    shot = Image.open(source).convert("RGB")
    shot = shot.crop((0, crop_top, shot.width, shot.height))
    screen_width = 880
    screen_height = round(screen_width / (shot.width / shot.height))
    shot = shot.resize((screen_width, screen_height), Image.Resampling.LANCZOS)

    bezel = 26
    body_width, body_height = screen_width + 2 * bezel, screen_height + 2 * bezel
    body_x = (W - body_width) // 2
    body_y = 690

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle(
        [body_x - 30, body_y - 20, body_x + body_width + 30, body_y + body_height + 20],
        120,
        fill=accent + (120,),
    )
    background = Image.alpha_composite(background, glow.filter(ImageFilter.GaussianBlur(70)))

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [body_x, body_y + 40, body_x + body_width, body_y + body_height + 40],
        92,
        fill=(15, 15, 18, 110),
    )
    background = Image.alpha_composite(background, shadow.filter(ImageFilter.GaussianBlur(42)))

    body = Image.new("RGBA", (body_width, body_height), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle([0, 0, body_width, body_height], 92, fill=BODY)
    background.paste(body, (body_x, body_y), body)
    shot = rounded(shot, 62)
    background.paste(shot, (body_x + bezel, body_y + bezel), shot)

    draw_headline(background, lines, font, accent)
    background.convert("RGB").save(destination, "PNG")


def main():
    OUT_69.mkdir(parents=True, exist_ok=True)
    OUT_65.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype(FONT_BOLD, 84)
    for source_name, output_name, theme, lines, crop_top in SHOTS:
        dest_69 = OUT_69 / output_name
        dest_65 = OUT_65 / output_name
        make(SRC / source_name, dest_69, theme, lines, crop_top, font)
        
        # Generate 6.5" version by resizing the 6.9" version
        img_69 = Image.open(dest_69)
        img_65 = img_69.resize((1242, 2688), Image.Resampling.LANCZOS)
        img_65.save(dest_65, "PNG")
        
        print(f"OK {output_name} (6.9\" & 6.5\")")


if __name__ == "__main__":
    main()
