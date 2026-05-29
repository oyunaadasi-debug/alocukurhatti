"""Alo Çukur Hattı — uygulama ikonu / splash / adaptive-icon üretici.
Soft Structuralism paleti: nane zemin + beyaz konum pini + mercan nokta (çukur).
"""
from PIL import Image, ImageDraw, ImageFont
import os

MINT  = (31, 169, 139)
CREAM = (251, 249, 244)
CORAL = (231, 111, 79)
INK   = (27, 26, 22)
WHITE = (255, 255, 255)
HERE  = os.path.dirname(os.path.abspath(__file__))
OUT   = os.path.join(HERE, "assets")

SS = 4  # supersample faktörü (kenar yumuşatma)


def draw_pin(size, pin_color=WHITE, dot_color=CORAL):
    """Şeffaf zeminli teardrop konum pini + içinde çukuru temsil eden nokta."""
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx = s / 2
    head_r = s * 0.30
    head_cy = s * 0.40
    # Pin gövdesi: daire (kafa) + alt üçgen uç
    d.ellipse([cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r], fill=pin_color)
    tip_y = s * 0.88
    spread = head_r * 0.78
    d.polygon([(cx - spread, head_cy + head_r * 0.45),
               (cx + spread, head_cy + head_r * 0.45),
               (cx, tip_y)], fill=pin_color)
    # İç nokta (çukur)
    dot_r = head_r * 0.46
    d.ellipse([cx - dot_r, head_cy - dot_r, cx + dot_r, head_cy + dot_r], fill=dot_color)

    return img.resize((size, size), Image.LANCZOS)


def make_icon():
    size = 1024
    img = Image.new("RGBA", (size, size), MINT + (255,))
    pin = draw_pin(int(size * 0.78))
    px = (size - pin.width) // 2
    py = (size - pin.height) // 2
    img.paste(pin, (px, py), pin)
    img.convert("RGB").save(os.path.join(OUT, "icon.png"))
    print("icon.png")


def make_adaptive():
    # Android maskeler → şeffaf zemin, ortada güvenli alanda pin
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pin = draw_pin(int(size * 0.55))
    px = (size - pin.width) // 2
    py = (size - pin.height) // 2
    img.paste(pin, (px, py), pin)
    img.save(os.path.join(OUT, "adaptive-icon.png"))
    print("adaptive-icon.png")


def load_font(paths, sz):
    for p in paths:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            continue
    return ImageFont.load_default()


def make_splash():
    w, h = 1242, 2688
    img = Image.new("RGB", (w, h), CREAM)
    d = ImageDraw.Draw(img)
    # Nane zeminli pini krem üstünde okunsun diye yumuşak nane daire arkasına koyalım
    disc = 720
    dx, dy = (w - disc) // 2, int(h * 0.34)
    d.ellipse([dx, dy, dx + disc, dy + disc], fill=MINT)
    pin = draw_pin(int(disc * 0.74))
    img.paste(pin, (dx + (disc - pin.width) // 2, dy + (disc - pin.height) // 2), pin)

    title = "Alo Çukur Hattı"
    sub = "Yolu birlikte düzeltelim"
    f_title = load_font(["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/seguibl.ttf"], 92)
    f_sub = load_font(["C:/Windows/Fonts/segoeui.ttf"], 46)

    ty = dy + disc + 90
    tw = d.textlength(title, font=f_title)
    d.text(((w - tw) / 2, ty), title, font=f_title, fill=INK)
    sw = d.textlength(sub, font=f_sub)
    d.text(((w - sw) / 2, ty + 130), sub, font=f_sub, fill=(92, 87, 77))

    img.save(os.path.join(OUT, "splash.png"))
    print("splash.png")


if __name__ == "__main__":
    make_icon()
    make_adaptive()
    make_splash()
    print("OK ->", OUT)
