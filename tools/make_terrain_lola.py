# -*- coding: utf-8 -*-
"""
Lunar surface maps for js/surface.js from REAL south-pole elevation (LRO LOLA, LDEM_85S_10M).
Window: 30.08 x 12.16 km beside Shackleton crater, fetched by tools in the scratchpad (window10m.npy).
LOLA resolves ~10 m; below that we add procedural small craters, regolith roughness and hummocks.
Each outpost station gets a gently flattened pad (landing sites are chosen flat).
Outputs the same files as make_terrain.py: height.png, normal.jpg, albedo.jpg, meta.json.
"""
import os, sys, json, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'moon'); os.makedirs(OUT, exist_ok=True)
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'lola_window10m.npy')
W, H = 4096, 1640; KM_X, KM_Z = 30.0, 12.0; MPP = KM_X * 1000 / W
rng = np.random.default_rng(2026)
STATIONS = [(-11000, -250), (-7600, 380), (-4200, -300), (-800, 420), (3000, -350), (10200, -250)]   # x,z of ground stations (surface.js)

def _box(a, r, axis):
    if r < 1: return a
    pad = [(0, 0), (0, 0)]; pad[axis] = (r, r)
    p = np.pad(a, pad, mode='reflect'); c = np.cumsum(p, axis=axis, dtype=np.float64); n = 2 * r + 1
    if axis == 1: out = (c[:, n - 1:] - np.concatenate([np.zeros((c.shape[0], 1)), c[:, :-n]], 1))
    else: out = (c[n - 1:, :] - np.concatenate([np.zeros((1, c.shape[1])), c[:-n, :]], 0))
    return (out / n).astype(np.float32)
def blur(a, sigma):
    r = max(1, int(round(sigma * 0.58)))
    for _ in range(3): a = _box(_box(a, r, 1), r, 0)
    return a
def fbm(h, w, octaves=6, base=4.0, gain=.5, seed=1):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; f = base
    for _ in range(octaves):
        gh, gw = max(2, int(h / w * f) + 1), int(f) + 1
        g = r.random((gh, gw)).astype(np.float32)
        out += amp * (np.array(Image.fromarray(g, 'F').resize((w, h), Image.BICUBIC), np.float32) - .5); amp *= gain; f *= 2.0
    return out

# ---------------- 1. real relief ----------------
dem = np.load(SRC).astype(np.float32)                      # (1216, 3008) at 10 m
dem = blur(dem, 1.2)                                       # LOLA track artefacts
dem = np.array(Image.fromarray(dem, 'F').resize((W, H), Image.BICUBIC), np.float32)
print('LOLA relief m', dem.max() - dem.min())

# ---------------- 2. sub-resolution detail ----------------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
h_cr = np.zeros((H, W), np.float32)
def add_crater(cx, cy, r_px, depth_m, age):
    R = r_px * 2.2; x0, x1 = int(max(0, cx - R)), int(min(W, cx + R)); y0, y1 = int(max(0, cy - R)), int(min(H, cy + R))
    if x1 <= x0 or y1 <= y0: return
    dx = xx[y0:y1, x0:x1] - cx; dy = yy[y0:y1, x0:x1] - cy; d = np.sqrt(dx * dx + dy * dy) / r_px
    bowl = -(1 - d ** 2) * (d < 1); rim = (0.28 - 0.14 * age) * np.exp(-((d - 1.0) / (0.10 + 0.18 * age)) ** 2)
    h_cr[y0:y1, x0:x1] += ((bowl + rim) * depth_m).astype(np.float32)
for i in range(6000):                                      # craters 8-120 m radius, mostly degraded
    r_m = 8.0 * (1 - rng.random()) ** -0.9; r_m = min(r_m, 120.0); r_px = r_m / MPP
    if r_px < 1.0: continue
    age = rng.random() ** 0.7
    add_crater(rng.random() * W, rng.random() * H, r_px, r_m * 0.16 * (0.5 + 0.6 * rng.random()) * (1 - 0.7 * age), age)
h_cr = blur(h_cr, 1.5)
rough = fbm(H, W, octaves=8, base=7.0, gain=.56, seed=7) * 3.0
hummock = np.clip(fbm(H, W, octaves=5, base=30.0, gain=.5, seed=8), 0, None) * 2.5
height = dem + h_cr + rough + hummock

# ---------------- 3. station pads ----------------
for (sx, sz) in STATIONS:
    cx, cy = (sx / 30000.0 + .5) * W, (sz / 12000.0 + .5) * H
    r_in, r_out = 120.0 / MPP, 300.0 / MPP
    x0, x1 = int(max(0, cx - r_out)), int(min(W, cx + r_out)); y0, y1 = int(max(0, cy - r_out)), int(min(H, cy + r_out))
    d = np.sqrt((xx[y0:y1, x0:x1] - cx) ** 2 + (yy[y0:y1, x0:x1] - cy) ** 2)
    pad_h = float(np.mean(height[y0:y1, x0:x1][d < r_in]))
    t = np.clip((d - r_in) / (r_out - r_in), 0, 1); t = t * t * (3 - 2 * t)
    flat = pad_h + rough[y0:y1, x0:x1] * .6
    height[y0:y1, x0:x1] = flat * (1 - t) + height[y0:y1, x0:x1] * t

height -= height.min(); HMAX = float(height.max()); print('height range m', HMAX)

# ---------------- 4. outputs ----------------
# 16-bit height packed into R (high byte) and G (low byte); surface.js decodes it (8-bit steps would be 7 m)
h2 = np.array(Image.fromarray(height, 'F').resize((W // 2, H // 2), Image.LANCZOS), np.float32)
d16 = np.clip(h2 / HMAX * 65535 + .5, 0, 65535).astype(np.uint16)
Image.fromarray(np.stack([(d16 >> 8).astype(np.uint8), (d16 & 255).astype(np.uint8), np.zeros_like(d16, np.uint8)], -1)).save(os.path.join(OUT, 'height.png'), optimize=True)
gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) / (2 * MPP); gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) / (2 * MPP)
nx, ny, nz = -gx, -gy, np.ones_like(gx); l = np.sqrt(nx * nx + ny * ny + nz * nz); nx /= l; ny /= l; nz /= l
Image.fromarray((np.stack([(nx * .5 + .5), (-ny * .5 + .5), (nz * .5 + .5)], -1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'normal.jpg'), quality=90, subsampling=0)
# albedo: neutral light-grey regolith (reference renders), brighter on steep sunlit-facing slopes, faint patchiness
base = .62 + fbm(H, W, octaves=5, base=3.0, gain=.55, seed=21) * .05 + fbm(H, W, octaves=4, base=60.0, gain=.5, seed=3) * .025
slope = np.sqrt(gx * gx + gy * gy); alb = np.clip(base + np.clip(slope * .3, 0, .07), .2, .95)
rgb = np.stack([alb, alb * .99, alb * .975], -1)
Image.fromarray((rgb * 255).astype(np.uint8)).save(os.path.join(OUT, 'albedo.jpg'), quality=84, optimize=True)
open(os.path.join(OUT, 'meta.json'), 'w').write('{"hmax": %.1f}' % HMAX)
pv = Image.new('RGB', (1024, 410 * 2)); sh = np.clip(nx * .85 + nz * .3 + .1, 0, 1)
pv.paste(Image.fromarray((sh * 255).astype(np.uint8)).convert('RGB').resize((1024, 410)), (0, 0))
pv.paste(Image.open(os.path.join(OUT, 'height.png')).split()[0].convert('RGB').resize((1024, 410)), (0, 410)); pv.save(os.path.join(HERE, 'preview_lola.jpg'), quality=80)
for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
