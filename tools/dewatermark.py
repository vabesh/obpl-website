# -*- coding: utf-8 -*-
"""Remove the generator's sparkle mark from the bottom-right corner of a 1920x1080 frame of the flight video.

The mark is a fixed, semi-transparent white star. watermark_alpha.npz holds its shape (taken from the frames where
that corner is black sky), its position, and its strength in every frame of the video: about 0.3 for most of it and
about 0.55 in a few stretches where the mark was applied twice. clean(frame, n) undoes the blend for source frame n,
evens out what is left against the surrounding picture, and fills the thin rim of the star from its neighbours.
Belongs to this video only; drop it for a render that has no mark."""
import os
import numpy as np
from PIL import Image, ImageFilter

_d = np.load(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'watermark_alpha.npz'))
SHAPE, X0, Y0, STRENGTH, COLOUR = _d['shape'].astype(float), int(_d['x']), int(_d['y']), _d['strength'].astype(float), _d['colour'].astype(float)
H, W = SHAPE.shape

def _grow(m, r): return np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(2 * r + 1))) > 127
def _shrink(m, r): return np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MinFilter(2 * r + 1))) > 127
def _blur(a, s):
    r = int(3 * s + 1); k = np.exp(-.5 * (np.arange(-r, r + 1) / s) ** 2); k /= k.sum()
    p = np.pad(a, ((r, r), (r, r)) + ((0, 0),) * (a.ndim - 2), mode='edge')
    p = sum(k[i] * p[i:i + a.shape[0]] for i in range(2 * r + 1))
    return sum(k[i] * p[:, i:i + a.shape[1]] for i in range(2 * r + 1))
def _fill(img, known, s):
    """average of the known pixels around each point (normalised blur)"""
    w = known.astype(float)[..., None]
    return _blur(img * w, s) / np.maximum(_blur(w, s), 1e-6)

STAR = SHAPE > .07
RIM = _grow(STAR, 2) & ~_shrink(STAR, 3)            # antialiased edge and bright outline of the star
INNER = STAR & ~RIM
OUTER = ~_grow(STAR, 2)
IN_BAND = INNER & ~_shrink(STAR, 7)                 # just inside the rim
OUT_BAND = _grow(STAR, 7) & OUTER                   # just outside it

def clean(frame, n):
    """frame: uint8 array (1080, 1920, 3); n: its index in the video. Returns a corrected copy."""
    out = frame.copy(); src = frame[Y0:Y0 + H, X0:X0 + W].astype(float)
    a = (SHAPE * STRENGTH[min(n, len(STRENGTH) - 1)])[..., None]; inv = np.clip((src - COLOUR * a) / (1 - a), 0, 255)
    # what is left of the star after undoing the blend: compare the picture just inside and just outside the rim
    d = _fill(inv, IN_BAND, 4.0) - _fill(inv, OUT_BAND, 4.0)
    d = np.clip(_fill(d, RIM, 9.0), -22, 22)
    fix = inv.copy(); fix[INNER] = np.clip(inv - d, 0, 255)[INNER]
    fix[RIM] = _fill(fix, ~RIM, 2.2)[RIM]
    out[Y0:Y0 + H, X0:X0 + W] = (fix + .5).astype('uint8')
    return out
