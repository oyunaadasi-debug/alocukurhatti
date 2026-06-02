"""Generate App Store-ready 6.9" and 6.5" screenshots with alternating 3D perspective and floating badges."""

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

# SHOTS configuration: (source_img, dest_img, theme, headlines, crop_top, tilt_direction, badge_text)
SHOTS = [
    (
        "photo_2026-05-31_04-26-22 (3).jpg",
        "00-ana-sayfa.png",
        "mint",
        [[("Yoldaki tüm çukurları", False)], [("haritadan takip edin", True)]],
        78,
        "right",
        "Sorun Çözüldü!"
    ),
    (
        "photo_2026-05-31_04-26-22 (2).jpg",
        "01-cukur-bildir.png",
        "mint",
        [[("Çukuru fotoğrafla", False)], [("saniyeler içinde bildir", True)]],
        78,
        "left",
        "Konum Algılandı"
    ),
    (
        "photo_2026-05-31_04-26-22.jpg",
        "02-siralama.png",
        "blue",
        [[("Şehrindeki sorunları", False)], [("şeffafça takip et", True)]],
        78,
        "right",
        "Aktif Belediyeler"
    ),
    (
        "photo_2026-05-31_04-26-21.jpg",
        "03-hesap-olustur.png",
        "amber",
        [[("Raporlarını takip et", False)], [("çözülünce haberdar ol", True)]],
        92,
        "left",
        "Güvenli Giriş"
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
    background = soft_circle(background, 120, 470, 230, accent, 46)
    background = soft_circle(background, W - 90, 360, 150, WHITE, 150)
    background = soft_circle(background, W - 120, H - 360, 260, accent, 38)

    # Load and crop screenshot
    shot = Image.open(source).convert("RGB")
    shot = shot.crop((0, crop_top, shot.width, shot.height))
    screen_width = 880
    screen_height = round(screen_width / (shot.width / shot.height))
    shot = shot.resize((screen_width, screen_height), Image.Resampling.LANCZOS)

    # Flat mockup measurements
    bezel = 26
    body_width, body_height = screen_width + 2 * bezel, screen_height + 2 * bezel
    padding = 100
    temp_w, temp_h = body_width + 2 * padding, body_height + 2 * padding

    # Temporary canvas for drawing flat phone
    temp_canvas = Image.new("RGBA", (temp_w, temp_h), (0, 0, 0, 0))
    draw_temp = ImageDraw.Draw(temp_canvas)

    # Soft shadow on temp canvas
    shadow_offset = 30
    draw_temp.rounded_rectangle(
        [padding, padding + shadow_offset, padding + body_width, padding + body_height + shadow_offset],
        92,
        fill=(15, 15, 18, 90),
    )
    temp_canvas = Image.alpha_composite(temp_canvas, temp_canvas.filter(ImageFilter.GaussianBlur(32)))
    draw_temp = ImageDraw.Draw(temp_canvas)

    # Draw phone body
    draw_temp.rounded_rectangle(
        [padding, padding, padding + body_width, padding + body_height],
        92,
        fill=BODY
    )

    # Paste screenshot
    shot_rounded = rounded(shot, 62)
    temp_canvas.paste(shot_rounded, (padding + bezel, padding + bezel), shot_rounded)

    # Calculate 3D perspective coordinates on background
    body_x = (W - body_width) // 2
    body_y = 820

    dx0, dy0 = body_x - padding, body_y - padding
    dx1, dy1 = body_x + body_width + padding, body_y - padding
    dx2, dy2 = body_x + body_width + padding, body_y + body_height + padding
    dx3, dy3 = body_x - padding, body_y + body_height + padding

    src_pts = [
        (0, 0),
        (temp_w, 0),
        (temp_w, temp_h),
        (0, temp_h)
    ]

    if tilt == "right":
        dst_pts = [
            (dx0 + 160, dy0 + 140), # TL
            (dx1 - 40, dy1 - 10),   # TR
            (dx2 - 140, dy2 - 150), # BR
            (dx3 + 60, dy3 + 60)    # BL
        ]
    else:  # left tilt
        dst_pts = [
            (dx0 + 50, dy0 - 10),   # TL
            (dx1 - 160, dy1 + 140), # TR
            (dx2 - 60, dy2 + 60),   # BR
            (dx3 + 140, dy3 - 150)  # BL
        ]

    coeffs = get_perspective_coeffs(src_pts, dst_pts)
    warped_phone = temp_canvas.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

    # Paste warped phone onto background
    background = Image.alpha_composite(background, warped_phone)

    # Draw floating glassmorphic badge
    badge_w, badge_h = 420, 160
    if tilt == "right":
        badge_x, badge_y = 120, H - 750
    else:
        badge_x, badge_y = W - badge_w - 120, H - 750

    badge_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_badge = ImageDraw.Draw(badge_canvas)

    # Badge shadow
    draw_badge.rounded_rectangle(
        [badge_x + 10, badge_y + 15, badge_x + badge_w + 10, badge_y + badge_h + 15],
        36,
        fill=(0, 0, 0, 45)
    )
    badge_canvas = Image.alpha_composite(badge_canvas, badge_canvas.filter(ImageFilter.GaussianBlur(16)))
    draw_badge = ImageDraw.Draw(badge_canvas)

    # Badge container (semi-transparent glass card)
    draw_badge.rounded_rectangle(
        [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
        36,
        fill=(255, 255, 255, 235),
        outline=WHITE + (255,),
        width=4
    )

    # Badge text
    try:
        font_b = ImageFont.truetype(FONT_BOLD, 42)
    except:
        font_b = ImageFont.load_default()

    # Center text inside the card
    text_bbox = draw_badge.textbbox((0, 0), badge_text, font=font_b)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]
    tx = badge_x + (badge_w - text_w) // 2
    ty = badge_y + (badge_h - text_h) // 2 - 8 # slight visual adjustment

    draw_badge.text((tx, ty), badge_text, font=font_b, fill=accent)
    background = Image.alpha_composite(background, badge_canvas)

    # Draw headline text
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
