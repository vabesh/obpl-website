# -*- coding: utf-8 -*-
"""Build the home-page flight (assets/sequence) from the client's rendered video.

  python tools/make_sequence_from_video.py <video.mp4>        (needs: pip install imageio-ffmpeg pillow numpy)

Every STEP-th frame of the video becomes one frame of the scroll-driven flight, in two sets:
  v_####.webp  1280x720 landscape (desktop, tablets, phones held sideways)
  m_####.webp   540x960 portrait  (phones held upright; the crop follows each machine via FOCUS)
and manifest.json / manifest.js describe the stops. STOPS is the order of the machines in the video
and must match the order of window.OB_STATIONS in js/stations.js. The video itself is not committed."""
import os, sys, json, subprocess, glob
import numpy as np
from PIL import Image
import imageio_ffmpeg

VIDEO = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'sequence')
SW, SH, STEP = 1920, 1080, 4            # source size, keep every 4th frame (24 fps -> 6 fps)
DW, DH, DQ = 1280, 720, 62              # landscape set
MW, MH, MQ = 540, 960, 54               # portrait set
CW = round(SH * MW / MH)                # portrait crop width in source pixels (608)

# stop id -> (source frame the page holds on, hotspot x, y as fractions of the 16:9 frame)
STOPS = [('vsat',    272, .500, .55),
         ('lander',  420, .490, .33),
         ('rover',   720, .420, .40),
         ('orbiter', 888, .470, .24),
         ('night',  1116, .340, .28),
         ('extract', 1348, .550, .22)]
# (source frame, x) : where the subject sits across the frame; narrow screens pan / crop to keep it in view
FOCUS = [(0, .50), (272, .50), (300, .50), (420, .49), (500, .50), (540, .58), (588, .47), (660, .43), (720, .42), (750, .45),
         (780, .50), (900, .50), (972, .50), (1020, .49), (1044, .46), (1068, .37), (1116, .34), (1140, .36), (1164, .52),
         (1260, .52), (1296, .54), (1348, .55)]
fx_at = lambda f: float(np.interp(f, [k[0] for k in FOCUS], [k[1] for k in FOCUS]))
crop_x0 = lambda f: int(round(min(max(fx_at(f) * SW - CW / 2, 0), SW - CW)))

os.makedirs(OUT, exist_ok=True)
for old in glob.glob(os.path.join(OUT, '*.jpg')) + glob.glob(os.path.join(OUT, '*.webp')): os.remove(old)
ff = imageio_ffmpeg.get_ffmpeg_exe()
p = subprocess.Popen([ff, '-loglevel', 'error', '-i', VIDEO, '-vf', r"select='not(mod(n\,%d))',scale=%d:%d" % (STEP, SW, SH), '-fps_mode', 'vfr',
                      '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
n = 0; tot = [0, 0]
while True:
    buf = p.stdout.read(SW * SH * 3)
    if len(buf) < SW * SH * 3: break
    im = Image.frombuffer('RGB', (SW, SH), buf, 'raw', 'RGB', 0, 1); src = n * STEP
    a = os.path.join(OUT, 'v_%04d.webp' % n); im.resize((DW, DH), Image.LANCZOS).save(a, 'WEBP', quality=DQ, method=5)
    x0 = crop_x0(src)
    b = os.path.join(OUT, 'm_%04d.webp' % n); im.crop((x0, 0, x0 + CW, SH)).resize((MW, MH), Image.LANCZOS).save(b, 'WEBP', quality=MQ, method=5)
    tot[0] += os.path.getsize(a); tot[1] += os.path.getsize(b); n += 1
    if n % 50 == 0: print('  ', n, 'frames', flush=True)
p.wait()

stops = {}
for sid, f, hx, hy in STOPS:
    assert f % STEP == 0 and f // STEP < n, (sid, f)
    stops[sid] = {"frame": f // STEP, "hotspot": [hx, hy], "mobileHotspot": [round((hx * SW - crop_x0(f)) / CW, 3), hy]}
mf = {"frames": n, "fps": 24 / STEP, "width": DW, "height": DH, "pad": 4, "hold": 0.04,
      "pattern": "assets/sequence/v_{i}.webp", "mobilePattern": "assets/sequence/m_{i}.webp",
      "focus": [[round(f / STEP, 2), x] for f, x in FOCUS], "stops": stops}
json.dump(mf, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
open(os.path.join(OUT, 'manifest.js'), 'w').write('window.OB_SEQUENCE = ' + json.dumps(mf) + ';')
print('frames', n, '| landscape %.1f MB | portrait %.1f MB' % (tot[0] / 1e6, tot[1] / 1e6))
