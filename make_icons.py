#!/usr/bin/env python3
"""Generate Musicomp PWA icons (192, 512) — dark studio gradient + neon note."""
from PIL import Image, ImageDraw, ImageFont
import math, os

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make(sz, path):
    img = Image.new("RGB", (sz, sz))
    d = ImageDraw.Draw(img)
    # diagonal gradient: deep violet -> near black -> teal hint
    c1, c2, c3 = (24, 8, 40), (10, 14, 22), (8, 30, 44)
    for y in range(sz):
        for_seg = y / sz
        base = lerp(c1, c2, min(1.0, for_seg * 1.6)) if for_seg < 0.625 else lerp(c2, c3, (for_seg - 0.625) / 0.375)
        for x in range(0, sz, 4):  # 4px columns: smooth enough, fast
            t = x / sz
            col = lerp(base, (base[0], base[1], min(255, base[2] + int(18 * t))), 1)
            d.rectangle([x, y, x + 3, y], fill=col[:3])
    # neon pink->cyan gradient band behind the note (rounded rect)
    m = sz * 0.16
    band = [m, sz * 0.30, sz - m, sz * 0.80]
    r = sz * 0.10
    grad = Image.new("RGB", (sz, sz))
    gd = ImageDraw.Draw(grad)
    for x in range(sz):
        t = x / sz
        gd.line([(x, 0), (x, sz)], fill=lerp(lerp((236, 72, 153), (168, 85, 247), min(1, t * 2)),
                                             lerp((168, 85, 247), (34, 211, 238), t * 2 - 1) if t > .5 else (168, 85, 247), max(0, (t - .5) * 2)))
    mask = Image.new("L", (sz, sz), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(band, radius=r, fill=255)
    img.paste(grad, (0, 0), mask)
    # eighth note
    try:
        fnt = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(sz * 0.42))
        d.text((sz / 2, sz * 0.56), "\u266A", font=fnt, fill=(10, 12, 20), anchor="mm")
    except Exception:
        cx, cy = sz * 0.5, sz * 0.55
        d.ellipse([cx - sz*0.09, cy - sz*0.055, cx + sz*0.055, cy + sz*0.09], fill=(10, 12, 20))
        d.line([cx + sz*0.05, cy + sz*0.02, cx + sz*0.05, cy - sz*0.19], fill=(10, 12, 20), width=max(2, int(sz*0.028)))
        d.arc([cx - sz*0.02, cy - sz*0.26, cx + sz*0.16, cy - sz*0.08], 200, 340, fill=(10, 12, 20), width=max(2, int(sz*0.028)))
    # top wordmark dot accents (5 layer lights)
    colors = [(244, 63, 94), (234, 179, 8), (34, 211, 238), (167, 139, 250), (52, 211, 153)]
    y = sz * 0.12
    for i, c in enumerate(colors):
        x = sz * (0.24 + i * 0.13)
        d.ellipse([x - sz*0.022, y - sz*0.022, x + sz*0.022, y + sz*0.022], fill=c)
    img.save(path, "PNG")
    print("wrote", path, img.size)

os.makedirs("icons", exist_ok=True)
make(192, "icons/icon-192.png")
make(512, "icons/icon-512.png")
