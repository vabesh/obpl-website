# -*- coding: utf-8 -*-
"""Synthetic test flight for js/sequence.js: a pan across the real south-pole relief with a
labelled hold at each of the seven stops (stop 1 uses the client's VSAT render). Replace with the
client's rendered frames (see RENDER-BRIEF.md). Writes assets/sequence/f_0000.jpg ... and manifest.json."""
import os, json, numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'sequence'); os.makedirs(OUT, exist_ok=True)
FW, FH, F = 1280, 720, 168
STOPS = ['vsat', 'night', 'rover', 'extract', 'lander', 'orbiter', 'datacentre']; SF = [24, 46, 68, 90, 112, 134, 156]
nrm = np.asarray(Image.open(os.path.join(HERE, '..', 'assets', 'moon', 'normal.jpg')).convert('RGB')).astype(np.float32) / 255 * 2 - 1
sh = np.clip(nrm[..., 0] * .80 + nrm[..., 2] * .30 + .12, 0, 1)
alb = np.asarray(Image.open(os.path.join(HERE, '..', 'assets', 'moon', 'albedo.jpg')).convert('L')).astype(np.float32) / 255
pano = Image.fromarray((np.clip(sh * alb * 1.35, 0, 1) * 255).astype(np.uint8)).convert('RGB')   # 4096x1640 lit relief
PW, PH = pano.size
vsat = Image.open(os.path.join(HERE, '..', 'assets', 'renders', 'vsat.jpg')).convert('RGB')
s = max(FW / vsat.width, FH / vsat.height); vs = vsat.resize((int(vsat.width * s) + 1, int(vsat.height * s) + 1), Image.LANCZOS); vsat_c = vs.crop(((vs.width - FW) // 2, (vs.height - FH) // 2, (vs.width - FW) // 2 + FW, (vs.height - FH) // 2 + FH))
try: font = ImageFont.truetype('arial.ttf', 44)
except Exception: font = ImageFont.load_default()
for i in range(F):
    t = i / (F - 1); cw = 1800 - 700 * (0.5 - 0.5 * np.cos(t * np.pi * 7)) ; ch_ = cw * FH / FW   # zoom in and out between stops
    x0 = int(t * (PW - cw)); y0 = int((PH - ch_) / 2 + 200 * np.sin(t * 6.1))
    fr = pano.crop((x0, y0, x0 + int(cw), y0 + int(ch_))).resize((FW, FH), Image.BILINEAR)
    k = [j for j, f in enumerate(SF) if abs(i - f) <= 1]
    if k and STOPS[k[0]] == 'vsat': fr = vsat_c.copy()
    d = ImageDraw.Draw(fr)
    if k: d.text((60, FH - 110), 'STOP %d  %s  (test frame %d)' % (k[0] + 1, STOPS[k[0]].upper(), i), fill=(242, 163, 58), font=font)
    d.text((FW - 170, 30), '%03d' % i, fill=(200, 200, 200), font=font)
    fr.save(os.path.join(OUT, 'f_%04d.jpg' % i), quality=70, optimize=True)
mf = {"frames": F, "fps": 24, "width": FW, "height": FH, "pad": 4, "pattern": "assets/sequence/f_{i}.jpg", "hold": 0.035,
      "stops": {sid: {"frame": f, "hotspot": [0.5, 0.42]} for sid, f in zip(STOPS, SF)}}
mf["stops"]["vsat"]["hotspot"] = [0.505, 0.36]
json.dump(mf, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1); open(os.path.join(OUT, 'manifest.js'), 'w').write('window.OB_SEQUENCE = ' + json.dumps(mf) + ';')
tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)); print('frames', F, 'total MB', round(tot / 1e6, 1))
