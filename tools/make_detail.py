# -*- coding: utf-8 -*-
"""Tiling regolith detail normal map (1024x1024) matched to the reference renders: pebbles, small
rocks and fine grain rather than micro-craters. Writes assets/moon/detail.jpg (consumed by surface.js)."""
import os, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'moon')
S = 1024; yy, xx = np.mgrid[0:S, 0:S].astype(np.float32); r = np.random.default_rng(31)
def blur(a, sig):
    k = int(sig * 3) | 1; x = np.arange(k) - k // 2; g = np.exp(-x * x / (2 * sig * sig)); g /= g.sum()
    a = np.apply_along_axis(lambda m: np.convolve(np.concatenate([m[-k:], m, m[:k]]), g, 'same')[k:-k], 0, a)
    return np.apply_along_axis(lambda m: np.convolve(np.concatenate([m[-k:], m, m[:k]]), g, 'same')[k:-k], 1, a)
h = np.zeros((S, S), np.float32)
# pebbles and small rocks: rounded bumps, power-law sizes, wrapped at the tile edges
for i in range(2600):
    rad = 1.3 * (1 - r.random()) ** -0.62; rad = min(rad, 15.0); cx, cy = r.random() * S, r.random() * S
    ex, ey = 0.75 + r.random() * .5, 0.75 + r.random() * .5; ang = r.random() * np.pi
    ca, sa = np.cos(ang), np.sin(ang)
    x0, x1, y0, y1 = int(cx - rad * 2), int(cx + rad * 2) + 1, int(cy - rad * 2), int(cy + rad * 2) + 1
    for ox in (-S, 0, S):
        for oy in (-S, 0, S):
            xa, xb, ya, yb = x0 + ox, x1 + ox, y0 + oy, y1 + oy
            if xb < 0 or xa >= S or yb < 0 or ya >= S: continue
            xa, xb, ya, yb = max(0, xa), min(S, xb), max(0, ya), min(S, yb)
            dx = xx[ya:yb, xa:xb] - cx - ox; dy = yy[ya:yb, xa:xb] - cy - oy
            u = (dx * ca + dy * sa) / (rad * ex); v = (-dx * sa + dy * ca) / (rad * ey)
            d2 = u * u + v * v
            h[ya:yb, xa:xb] += np.sqrt(np.clip(1 - d2, 0, None)) * rad * (0.5 if rad > 5 else 0.4)
# fine grain and gentle undulation
g = r.random((S, S)).astype(np.float32)
h += blur(g, 0.8) * 2.6 + blur(g, 2.0) * 3.4 + blur(g, 5) * 3.6 + blur(g, 12) * 4.5 + blur(g, 30) * 7.0
gx = np.roll(h, -1, 1) - np.roll(h, 1, 1); gy = np.roll(h, -1, 0) - np.roll(h, 1, 0)
nx, ny, nz = -gx * .5, -gy * .5, np.ones_like(gx); l = np.sqrt(nx * nx + ny * ny + nz * nz)
dn = np.stack([(nx / l * .5 + .5), (-ny / l * .5 + .5), (nz / l * .5 + .5)], -1)
Image.fromarray((dn * 255).astype(np.uint8)).save(os.path.join(OUT, 'detail.jpg'), quality=88, subsampling=0)
# preview: shaded with a low sun from the left
sh = np.clip((nx / l) * .9 + (nz / l) * .35 + .05, 0, 1)
Image.fromarray((sh * 255).astype(np.uint8)).save(os.path.join(HERE, 'preview_detail.jpg'), quality=80)
print('detail.jpg', os.path.getsize(os.path.join(OUT, 'detail.jpg')) // 1024, 'KB')
