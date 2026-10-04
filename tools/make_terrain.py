# -*- coding: utf-8 -*-
"""
Generates the lunar surface maps used by js/surface.js.

Inputs : a stitched LROC WAC strip (NASA/ASU, public domain) around the Chandrayaan-3
         landing region, 69.4S 32.3E, fetched from NASA Moon Trek tiles (zoom 8).
Outputs: assets/moon/height.png  (8-bit displacement, 2048x820)
         assets/moon/normal.jpg  (tangent-space normal map, 4096x1640)
         assets/moon/albedo.jpg  (lighting-free albedo, 4096x1640)
         assets/moon/detail.jpg  (tiling micro-relief normal map, 512x512)
World scale: the strip is 30 km x 12 km. 4096 px = 30 km -> 7.3 m/px.
"""
import os, sys, numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'moon'); os.makedirs(OUT, exist_ok=True)
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'wac_strip.jpg')
W, H = 4096, 1640           # output px
KM_X, KM_Z = 30.0, 12.0     # world size
MPP = KM_X * 1000 / W       # metres per pixel (7.32)
rng = np.random.default_rng(42)

def _box(a, r, axis):
    if r < 1: return a
    pad = [(0, 0), (0, 0)]; pad[axis] = (r, r)
    p = np.pad(a, pad, mode='reflect'); c = np.cumsum(p, axis=axis, dtype=np.float64)
    n = 2 * r + 1
    if axis == 1: out = (c[:, n - 1:] - np.concatenate([np.zeros((c.shape[0], 1)), c[:, :-n]], 1))
    else: out = (c[n - 1:, :] - np.concatenate([np.zeros((1, c.shape[1])), c[:-n, :]], 0))
    return (out / n).astype(np.float32)

def blur(a, sigma):
    # three box blurs approximate a gaussian (float32 safe)
    r = max(1, int(round(sigma * 0.58)))
    for _ in range(3): a = _box(_box(a, r, 1), r, 0)
    return a

def fbm(h, w, octaves=6, base=4.0, gain=.5, seed=1):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; f = base
    for _ in range(octaves):
        gh, gw = max(2, int(h / w * f) + 1), int(f) + 1
        g = r.random((gh, gw)).astype(np.float32)
        up = np.array(Image.fromarray(g, 'F').resize((w, h), Image.BICUBIC), np.float32)
        out += amp * (up - .5); amp *= gain; f *= 2.0
    return out

# ---------------- 1. large-scale relief ----------------
# The WAC strip at this latitude is ~80 m/px with baked polar shadows, so it only supplies a faint
# large-scale tone. Relief is built from crater morphology (bowl, rim, ejecta, flat floors, central peaks).
wac = Image.open(SRC).convert('L')
sq = wac.resize((int(wac.width * 0.352), wac.height), Image.LANCZOS)
win = sq.crop((20, 20, 381, 165)).resize((W, H), Image.BICUBIC)
I = np.array(win, np.float32) / 255.0
I0 = blur(I, 90)
albedo_big = np.clip(.52 + .05 * (I0 - I0.mean()) / (I0.std() + 1e-6), .4, .64)
h_big = fbm(H, W, octaves=4, base=2.0, gain=.5, seed=11) * 90.0          # gentle highland undulation

# ---------------- 2. procedural crater field (power-law sizes) ----------------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
h_cr = np.zeros((H, W), np.float32); ejecta = np.zeros((H, W), np.float32)
def add_crater(cx, cy, r_px, depth_m, fresh):
    x0, x1 = int(max(0, cx - r_px * 2.2)), int(min(W, cx + r_px * 2.2)); y0, y1 = int(max(0, cy - r_px * 2.2)), int(min(H, cy + r_px * 2.2))
    if x1 <= x0 or y1 <= y0: return
    d = np.sqrt((xx[y0:y1, x0:x1] - cx) ** 2 + (yy[y0:y1, x0:x1] - cy) ** 2) / r_px
    bowl = -(1 - d ** 2) * (d < 1)                                     # parabolic bowl
    flat = 0.0
    if r_px > 60: bowl = np.maximum(bowl, -0.6)                        # flat floors for big craters
    if r_px > 160: bowl = bowl + 0.25 * np.exp(-(d / 0.18) ** 2)         # central peak
    rim = 0.26 * np.exp(-((d - 1.0) / 0.12) ** 2)                      # raised rim
    ej = 0.08 * np.exp(-((d - 1.0) / 0.55) ** 2) * (d > 1.0)           # ejecta blanket
    prof = (bowl + rim + ej) * depth_m
    h_cr[y0:y1, x0:x1] += prof.astype(np.float32)
    if fresh: ejecta[y0:y1, x0:x1] += (np.exp(-((d - .9) / 1.1) ** 2) * (d > .7) * fresh).astype(np.float32)
n_craters = 2600
for (fx, fz, rm, dp) in [(.22, .62, 2300, 260), (.47, .25, 1500, 190), (.70, .70, 900, 150), (.86, .35, 1900, 230), (.06, .3, 700, 120)]:
    add_crater(fx * W, fz * H, rm / MPP, dp, fresh=0.0)
for i in range(n_craters):
    r_m = 12.0 * (1 - rng.random()) ** -0.9                           # 12 m .. several km, power law
    r_m = min(r_m, 2600.0); r_px = r_m / MPP
    if r_px < 1.2: continue
    cx, cy = rng.random() * W, rng.random() * H
    depth = r_m * (0.2 if r_m < 300 else 0.1) * (0.6 + 0.6 * rng.random())
    age = rng.random()
    add_crater(cx, cy, r_px, depth * (0.35 + 0.65 * age), fresh=(age > .82) * (0.35 + rng.random() * .4))
# soften old craters slightly
h_cr = blur(h_cr, 1.2)

# ---------------- 3. regolith roughness ----------------
rough = fbm(H, W, octaves=7, base=6.0, gain=.55, seed=7) * 14.0
height = h_big + h_cr + rough
height -= height.min()

# ---------------- 4. outputs ----------------
# displacement (8-bit) at half res
disp = (height / height.max() * 255).astype(np.uint8)
Image.fromarray(disp).resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(OUT, 'height.png'), optimize=True)
print('height range m', float(height.max()))

# normal map from full-res height (tangent space, +y up in texture = -z in world; Three.js convention)
gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) / (2 * MPP)
gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) / (2 * MPP)
nx, ny, nz = -gx, -gy, np.ones_like(gx)
l = np.sqrt(nx * nx + ny * ny + nz * nz); nx /= l; ny /= l; nz /= l
nrm = np.stack([(nx * .5 + .5), (-ny * .5 + .5), (nz * .5 + .5)], -1)   # flip green for Three.js (y up in UV)
Image.fromarray((nrm * 255).astype(np.uint8)).save(os.path.join(OUT, 'normal.jpg'), quality=90, subsampling=0)

# albedo: lighting-free; fresh ejecta bright, crater floors slightly dark, fine speckle
alb = albedo_big + np.clip(ejecta, 0, 1) * .2 - np.clip(-h_cr, 0, 80) / 80 * .05
alb += fbm(H, W, octaves=4, base=40.0, gain=.5, seed=3) * .06
alb = np.clip(alb, .18, .92)
rgb = np.stack([alb * 1.0, alb * .985, alb * .96], -1)              # neutral grey, a touch warm
Image.fromarray((rgb * 255).astype(np.uint8)).save(os.path.join(OUT, 'albedo.jpg'), quality=82, optimize=True)

# tiling detail normal (micro craters + grain), 512 px ~ 400 m world
S = 512; dyy, dxx = np.mgrid[0:S, 0:S].astype(np.float32); dh = np.zeros((S, S), np.float32)
r2 = np.random.default_rng(9)
for i in range(900):
    r = 2.0 * (1 - r2.random()) ** -0.8; r = min(r, 40); cx, cy = r2.random() * S, r2.random() * S
    for ox in (-S, 0, S):
        for oy in (-S, 0, S):
            d = np.sqrt((dxx - cx - ox) ** 2 + (dyy - cy - oy) ** 2) / r
            m = d < 1.6
            if not m.any(): continue
            dh += (-(1 - d ** 2) * (d < 1) + .3 * np.exp(-((d - 1) / .15) ** 2)) * r * .25 * m
g = r2.random((S, S)).astype(np.float32); dh += blur(g, 1.2) * 6 + blur(g, 4) * 10
gx = np.roll(dh, -1, 1) - np.roll(dh, 1, 1); gy = np.roll(dh, -1, 0) - np.roll(dh, 1, 0)
nx, ny, nz = -gx * .6, -gy * .6, np.ones_like(gx); l = np.sqrt(nx * nx + ny * ny + nz * nz)
dn = np.stack([(nx / l * .5 + .5), (-ny / l * .5 + .5), (nz / l * .5 + .5)], -1)
Image.fromarray((dn * 255).astype(np.uint8)).save(os.path.join(OUT, 'detail.jpg'), quality=88, subsampling=0)

# preview composite
pv = Image.new('RGB', (1024, 410 * 3))
pv.paste(Image.open(os.path.join(OUT, 'albedo.jpg')).resize((1024, 410)), (0, 0))
pv.paste(Image.open(os.path.join(OUT, 'normal.jpg')).resize((1024, 410)), (0, 410))
pv.paste(Image.open(os.path.join(OUT, 'height.png')).convert('RGB').resize((1024, 410)), (0, 820))
pv.save(os.path.join(HERE, 'preview_maps.jpg'), quality=80)
for f in os.listdir(OUT): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
