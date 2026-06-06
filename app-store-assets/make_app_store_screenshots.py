"""Generate App Store-ready 6.9" and 6.5" screenshots with alternating 3D perspective and floating badges."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1290, 2796
INK = (26, 26, 28)
BODY = (17, 17, 19)
WHITE = (255, 255, 255)
FONT_BOLD = r"C:\Windows\Fonts\seguibl.ttf"

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "ekrangoruntuleri"
OUT_69 = ROOT / "app-store-assets" / "screenshots" / "6.9-framed"
OUT_65 = ROOT / "app-store-assets" / "screenshots" / "6.5-framed"

THEMES = {
    "mint": ((226, 246, 241), (176, 224, 213), (31, 169, 139)),
    "blue": ((228, 238, 250), (188, 212, 242), (52, 126, 206)),
    "amber": ((251, 244, 228), (244, 224, 184), (214, 150, 44)),
}

# SHOTS configuration: (source_img, dest_img, theme, headlines, crop_top, tilt_direction, badge_text)
SHOTS = [
    (
        "IMG_2583.PNG",
        "00-ana-sayfa.png",
        "mint",
        [[("Yoldaki çukurları", False)], [("tek dokunuşla bildir", True)]],
        60,
        "right",
        "Hızlı Bildirim"
    ),
    (
        "IMG_2584.PNG",
        "01-harita.png",
        "blue",
        [[("Tüm yol hasarları", False)], [("haritada tek yerde", True)]],
        60,
        "left",
        "Canlı Harita"
    ),
    (
        "IMG_2585.PNG",
        "02-siralama.png",
        "amber",
        [[("Belediyeleri", False)], [("şeffafça karşılaştır", True)]],
        60,
        "right",
        "Şeffaf Sıralama"
    ),
    (
        "IMG_2586.PNG",
        "03-giris.png",
        "mint",
        [[("Saniyeler içinde", False)], [("ücretsiz başla", True)]],
        60,
        "left",
        "Üyeliksiz Kullan"
    ),
]


def solve_linear_system(A, B):
    n = len(A)
    M = [A[i] + [B[i]] for i in range(n)]
    for i in range(n):
        pivot_row = max(range(i, n), key=lambda r: abs(M[r][i]))
        M[i], M[pivot_row] = M[pivot_row], M[i]
        pivot = M[i][i]
        M[i] = [val / pivot for val in M[i]]
        for r in range(n):
            if r != i:
                factor = M[r][i]
                M[r] = [M[r][j] - factor * M[i][j] for j in range(n + 1)]
    return [row[-1] for row in M]


def get_perspective_coeffs(src_pts, dst_pts):
    A = []
    B = []
    for (u, v), (x, y) in zip(dst_pts, src_pts):
        A.append([u, v, 1, 0, 0, 0, -x*u, -x*v])
        B.append(x)
        A.append([0, 0, 0, u, v, 1, -y*u, -y*v])
        B.append(y)
    return solve_linear_system(A, B)


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


def make(source, destination, theme_name, lines, crop_top, tilt, badge_text, font):
    color_a, color_b, accent = THEMES[theme_name]
    background = diagonal_gradient(color_a, color_b).convert("RGBA")
    background = soft_circle(background, 120, 470, 230, accent, 34)
    background = soft_circle(background, W - 90, 360, 150, WHITE, 120)
    background = soft_circle(background, W - 120, H - 360, 260, accent, 26)

    # Load and crop screenshot
    shot = Image.open(source).convert("RGB")
    shot = shot.crop((0, crop_top, shot.width, shot.height))

    # Flat, straight phone — normal size, centered (no 3D perspective).
    screen_width = 940
    screen_height = round(screen_width / (shot.width / shot.height))
    shot = shot.resize((screen_width, screen_height), Image.Resampling.LANCZOS)

    bezel = 24
    body_width = screen_width + 2 * bezel
    body_height = screen_height + 2 * bezel
    body_x = (W - body_width) // 2
    body_y = 690

    # Soft straight drop shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [body_x, body_y + 28, body_x + body_width, body_y + body_height + 28],
        96,
        fill=(15, 15, 18, 95),
    )
    background = Image.alpha_composite(background, shadow.filter(ImageFilter.GaussianBlur(36)))

    # Phone body
    body = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle(
        [body_x, body_y, body_x + body_width, body_y + body_height], 96, fill=BODY
    )
    background = Image.alpha_composite(background, body)

    # Screenshot inside the bezel
    shot_rounded = rounded(shot, 60)
    background.paste(shot_rounded, (body_x + bezel, body_y + bezel), shot_rounded)

    # Headline text (top)
    draw_headline(background, lines, font, accent)

    # Save to destination
    background.convert("RGB").save(destination, "PNG")


def main():
    OUT_69.mkdir(parents=True, exist_ok=True)
    OUT_65.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype(FONT_BOLD, 84)

    for source_name, output_name, theme, lines, crop_top, tilt, badge_text in SHOTS:
        dest_69 = OUT_69 / output_name
        dest_65 = OUT_65 / output_name

        # Generate 6.9" version
        make(SRC / source_name, dest_69, theme, lines, crop_top, tilt, badge_text, font)

        # Generate 6.5" version by resizing
        img_69 = Image.open(dest_69)
        img_65 = img_69.resize((1242, 2688), Image.Resampling.LANCZOS)
        img_65.save(dest_65, "PNG")

        print(f"OK {output_name} (6.9\" & 6.5\")")


if __name__ == "__main__":
    main()
