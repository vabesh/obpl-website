# -*- coding: utf-8 -*-
"""
Lunar surface maps for js/surface.js (v2, cinematic pass).

Outputs: assets/moon/height.png  (8-bit displacement, 2048x820)
         assets/moon/normal.jpg  (tangent-space normal map, 4096x1640)
         assets/moon/albedo.jpg  (lighting-free albedo, 4096x1640)
         assets/moon/detail.jpg  (tiling micro-relief normal map, 1024x1024)
         assets/moon/meta.json   (height range, read by the renderer patch)
World: 30 km x 12 km strip, 7.3 m/px at 4096 px.
Relief: ridged hills around the rim of the strip (a horizon), gentle undulation in the corridor,
a power-law crater population with age-dependent degradation, terraced walls and central peaks on
large craters, secondary-crater clusters, and bright ejecta rays on fresh craters.
"""
import os, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'moon'); os.makedirs(OUT, exist_ok=True)
W, H = 4096, 1640
KM_X, KM_Z = 30.0, 12.0
MPP = KM_X * 1000 / W
rng = np.random.default_rng(2026)

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
def fbm(h, w, octaves=6, base=4.0, gain=.5, seed=1, ridged=False):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; f = base
    for _ in range(octaves):
        gh, gw = max(2, int(h / w * f) + 1), int(f) + 1
        g = r.random((gh, gw)).astype(np.float32)
        up = np.array(Image.fromarray(g, 'F').resize((w, h), Image.BICUBIC), np.float32) - .5
        if ridged: up = (.5 - np.abs(up)) * 2 - .5
        out += amp * up; amp *= gain; f *= 2.0
    return out

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xx / W, yy / H

# ---------------- 1. landscape: horizon hills + corridor ----------------
ridge = fbm(H, W, octaves=6, base=3.0, gain=.55, seed=5, ridged=True)
ridge = np.clip(ridge * 1.6 + .2, 0, None) ** 1.6
edge = np.clip((np.abs(v - .5) - .22) / .28, 0, 1) ** 1.3          # hills toward the far z edges
ends = np.clip((np.abs(u - .5) - .40) / .10, 0, 1) ** 1.2          # and both ends of the strip
hills = ridge * np.maximum(edge, ends) * 420.0
undul = fbm(H, W, octaves=4, base=2.0, gain=.5, seed=11) * 70.0 + fbm(H, W, octaves=3, base=9.0, gain=.5, seed=12) * 18.0

# ---------------- 2. crater population ----------------
h_cr = np.zeros((H, W), np.float32); fresh_map = np.zeros((H, W), np.float32); floor_map = np.zeros((H, W), np.float32)
def add_crater(cx, cy, r_px, depth_m, age, rays=0.0, cluster=True):
    R = r_px * (3.2 if rays > 0 else 2.2)
    x0, x1 = int(max(0, cx - R)), int(min(W, cx + R)); y0, y1 = int(max(0, cy - R)), int(min(H, cy + R))
    if x1 <= x0 or y1 <= y0: return
    dx = xx[y0:y1, x0:x1] - cx; dy = yy[y0:y1, x0:x1] - cy
    d = np.sqrt(dx * dx + dy * dy) / r_px
    ang = np.arctan2(dy, dx)
    if r_px > 4: d = d * (1 + 0.035 * np.cos(ang * 3 + cx * .07) + 0.02 * np.cos(ang * 7 + cy * .05) + 0.012 * np.cos(ang * 13 + cx * .03))   # irregular outline
    rimw = 0.10 + 0.18 * age                                     # degraded rims widen with age
    bowl = -(1 - d ** 2) * (d < 1)
    if r_px > 50:
        floor_r = 0.45 + 0.2 * min(1, (r_px - 50) / 200)
        bowl = np.maximum(bowl, -(1 - floor_r ** 2))              # flat floor
        if r_px > 120:
            bowl += 0.08 * (1 - np.clip(np.abs(d - 0.78) / 0.06, 0, 1)) * (d < 1)   # terrace
            bowl += 0.22 * np.exp(-(d / 0.16) ** 2)              # central peak
    rim = (0.30 - 0.14 * age) * np.exp(-((d - 1.0) / rimw) ** 2)
    ej = (0.07 - 0.04 * age) * np.exp(-((d - 1.0) / 0.6) ** 2) * (d > 1.0)
    prof = (bowl + rim + ej) * depth_m
    h_cr[y0:y1, x0:x1] += prof.astype(np.float32)
    if r_px > 40: floor_map[y0:y1, x0:x1] += ((d < 0.9) * (1 - age)).astype(np.float32) * 0.5
    if rays > 0:
        ph = cx * .013 + cy * .021
        streak = (np.cos(ang * 7.0 + ph) * 0.5 + 0.5) ** 5 * 0.6 + (np.cos(ang * 19.0 + ph * 2.3) * 0.5 + 0.5) ** 7 * 0.5 + (np.cos(ang * 31.0 + ph * 3.1) * 0.5 + 0.5) ** 9 * 0.4
        rayf = np.exp(-((d - 1.0) / 1.4) ** 2) * (d > 0.95) * streak * 0.55 + np.exp(-((d - 1.0) / 0.3) ** 2) * (d > 0.9) * 0.5
        fresh_map[y0:y1, x0:x1] += (rayf * rays).astype(np.float32)
    if cluster and r_px > 90:
        for _ in range(int(8 + r_px / 25)):                       # secondary craters around large ones
            a = rng.random() * np.pi * 2; dd = r_px * (1.6 + rng.random() * 1.8)
            sr = r_px * (0.05 + rng.random() * 0.09)
            add_crater(cx + np.cos(a) * dd, cy + np.sin(a) * dd, sr, sr * MPP * 0.18, age * 0.8 + 0.1, 0.0, cluster=False)

for (fx, fz, rm, dp, ag) in [(.20, .60, 2300, 220, .55), (.47, .27, 1500, 160, .35), (.72, .68, 950, 130, .25), (.86, .36, 1900, 200, .6), (.07, .32, 700, 95, .4), (.58, .80, 600, 90, .2)]:
    add_crater(fx * W, fz * H, rm / MPP, dp, ag, rays=(0.7 if ag < .3 else 0.0))
for i in range(3400):
    r_m = 10.0 * (1 - rng.random()) ** -0.95
    r_m = min(r_m, 1200.0); r_px = r_m / MPP
    if r_px < 1.0: continue
    cx, cy = rng.random() * W, rng.random() * H
    age = rng.random() ** 0.8
    depth = r_m * (0.14 if r_m < 300 else 0.08) * (0.55 + 0.6 * rng.random()) * (1 - 0.65 * age)
    add_crater(cx, cy, r_px, depth, age, rays=((0.5 + rng.random() * 0.5) if (age < 0.07 and r_px > 8) else 0.0))
h_cr = blur(h_cr, 2.0)

# ---------------- 3. regolith roughness, hummocks ----------------
rough = fbm(H, W, octaves=8, base=7.0, gain=.56, seed=7) * 5.0
hummock = np.clip(fbm(H, W, octaves=5, base=30.0, gain=.5, seed=8), 0, None) * 3.5
height = hills + undul + h_cr + rough + hummock
height -= height.min()
HMAX = float(height.max()); print('height range m', HMAX)

# ---------------- 4. outputs ----------------
disp = (height / HMAX * 255).astype(np.uint8)
Image.fromarray(disp).resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(OUT, 'height.png'), optimize=True)

gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) / (2 * MPP)
gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) / (2 * MPP)
nx, ny, nz = -gx, -gy, np.ones_like(gx); l = np.sqrt(nx * nx + ny * ny + nz * nz); nx /= l; ny /= l; nz /= l
nrm = np.stack([(nx * .5 + .5), (-ny * .5 + .5), (nz * .5 + .5)], -1)
Image.fromarray((nrm * 255).astype(np.uint8)).save(os.path.join(OUT, 'normal.jpg'), quality=90, subsampling=0)

base = .56 + fbm(H, W, octaves=5, base=3.0, gain=.55, seed=21) * .06
alb = base + np.clip(fresh_map, 0, 1.0) * .16 - np.clip(floor_map, 0, 1) * .05
slope = np.sqrt(gx * gx + gy * gy); alb += np.clip(slope * 0.35, 0, .08)
alb += fbm(H, W, octaves=4, base=60.0, gain=.5, seed=3) * .03
alb = np.clip(alb, .16, .95)
rgb = np.stack([alb, alb * .985, alb * .955], -1)
Image.fromarray((rgb * 255).astype(np.uint8)).save(os.path.join(OUT, 'albedo.jpg'), quality=84, optimize=True)

S = 1024; dyy, dxx = np.mgrid[0:S, 0:S].astype(np.float32); dh = np.zeros((S, S), np.float32)
r2 = np.random.default_rng(9)
for i in range(2600):
    r = 2.0 * (1 - r2.random()) ** -0.85; r = min(r, 70); cx, cy = r2.random() * S, r2.random() * S; ag = r2.random()
    for ox in (-S, 0, S):
        for oy in (-S, 0, S):
            d = np.sqrt((dxx - cx - ox) ** 2 + (dyy - cy - oy) ** 2) / r
            m = d < 1.7
            if not m.any(): continue
            dh += (-(1 - d ** 2) * (d < 1) * (1 - .5 * ag) + (.3 - .15 * ag) * np.exp(-((d - 1) / (.12 + .2 * ag)) ** 2)) * r * .28 * m
g = r2.random((S, S)).astype(np.float32); dh += blur(g, 1.0) * 5 + blur(g, 3) * 7 + blur(g, 9) * 9
for i in range(140):
    r = 1.5 + r2.random() ** 2 * 6; cx, cy = r2.random() * S, r2.random() * S
    d = np.sqrt((dxx - cx) ** 2 + (dyy - cy) ** 2) / r; dh += np.clip(1 - d * d, 0, None) * r * 1.4
gx = np.roll(dh, -1, 1) - np.roll(dh, 1, 1); gy = np.roll(dh, -1, 0) - np.roll(dh, 1, 0)
nx, ny, nz = -gx * .35, -gy * .35, np.ones_like(gx); l = np.sqrt(nx * nx + ny * ny + nz * nz)
dn = np.stack([(nx / l * .5 + .5), (-ny / l * .5 + .5), (nz / l * .5 + .5)], -1)
Image.fromarray((dn * 255).astype(np.uint8)).save(os.path.join(OUT, 'detail.jpg'), quality=88, subsampling=0)

pv = Image.new('RGB', (1024, 410 * 3))
pv.paste(Image.open(os.path.join(OUT, 'albedo.jpg')).resize((1024, 410)), (0, 0))
pv.paste(Image.open(os.path.join(OUT, 'normal.jpg')).resize((1024, 410)), (0, 410))
pv.paste(Image.open(os.path.join(OUT, 'height.png')).convert('RGB').resize((1024, 410)), (0, 820))
pv.save(os.path.join(HERE, 'preview_maps.jpg'), quality=80)
open(os.path.join(OUT, 'meta.json'), 'w').write('{"hmax": %.1f}' % HMAX)
for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
