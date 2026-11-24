# -*- coding: utf-8 -*-
"""Prepare a photo for the News page.

    python tools/news_image.py <photo> <name>

Writes assets/news/<name>.jpg (longest side 2000 px, opened in the photo viewer) and assets/news/<name>-s.jpg
(1000 px, shown on the page). Phone rotation is applied, and the camera metadata (location, device, time) is dropped.
Then list the photo in a NEWS post in build_pages.py as ("assets/news/<name>.jpg", "caption").
"""
import os, sys
from PIL import Image, ImageOps

def main(src, name):
    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "news")
    os.makedirs(out, exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for suffix, side, q in (("", 2000, 84), ("-s", 1000, 80)):
        c = im.copy()
        c.thumbnail((side, side), Image.LANCZOS)
        p = os.path.join(out, name + suffix + ".jpg")
        c.save(p, "JPEG", quality=q, optimize=True, progressive=True)
        print("wrote", os.path.relpath(p), c.size, "%d KB" % (os.path.getsize(p) // 1024))

if __name__ == "__main__":
    if len(sys.argv) != 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
