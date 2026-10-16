/* ORBITBeyond India — pre-rendered surface flight, scrubbed by scroll.
   The flight is an image sequence described by assets/sequence/manifest.json. Scrolling maps to a frame;
   each station has a hold where the frame stays put and its hotspot opens the detail drawer.
   Station copy lives in js/stations.js. */
(function () {
  'use strict';
  var wrap = document.getElementById('surface'), MF = window.OB_SEQUENCE, STATIONS = window.OB_STATIONS || [];
  if (!wrap || !MF) return;
  var canvas = wrap.querySelector('canvas'), ctx = canvas.getContext('2d'), section = document.getElementById('surfaceSection');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, isSmall = Math.min(innerWidth, innerHeight) < 700;
  var F = MF.frames, pat = (isSmall && MF.mobilePattern) ? MF.mobilePattern : MF.pattern, V = '?v=' + (window.OB_VER || 1), pad = MF.pad || 4;
  function url(i) { var s = String(i); while (s.length < pad) s = '0' + s; return pat.replace('{i}', s) + V; }

  /* ---------- scroll -> frame: linear flight between holds, frame held still during each hold ---------- */
  var n = STATIONS.length;
  var WIN = (function () { var out = [], a = .10, b = .90, w = (b - a) / n; for (var i = 0; i < n; i++) out.push([a + i * w, a + (i + 1) * w]); return out; })();
  var HOLD = MF.hold || .035, anchors = [[0, 0]], stopFrames = [];
  STATIONS.forEach(function (s, i) {
    var st = MF.stops[s.id] || {}, f = Math.min(F - 1, st.frame || 0);
    stopFrames.push(f); anchors.push([WIN[i][0] + HOLD, f], [WIN[i][1] - HOLD, f]);
  });
  anchors.push([1, F - 1]);
  function frameAt(p) {
    for (var i = 0; i < anchors.length - 1; i++) {
      var a = anchors[i], b = anchors[i + 1];
      if (p <= b[0]) { var t = (p - a[0]) / Math.max(1e-6, b[0] - a[0]); return a[1] + (b[1] - a[1]) * Math.max(0, Math.min(1, t)); }
    }
    return F - 1;
  }
  function stationAt(p) { for (var i = 0; i < n; i++) if (p >= WIN[i][0] && p < WIN[i][1]) return i; return -1; }
  function holdPhase(p, i) {
    if (i < 0) return 0;
    var w = WIN[i], a = w[0] + HOLD, b = w[1] - HOLD, f = .012;
    return Math.max(0, Math.min((p - a) / f + 1, (b - p) / f + 1, 1));
  }

  /* ---------- progressive loading: first frame and stop frames first, then coarse-to-fine ---------- */
  var imgs = new Array(F), ok = new Array(F), order = [], seen = {};
  function want(i) { if (i >= 0 && i < F && !seen[i]) { seen[i] = 1; order.push(i); } }
  want(0); stopFrames.forEach(want);
  [16, 8, 4, 2, 1].forEach(function (st) { for (var i = 0; i < F; i += st) want(i); });
  var loaded = 0, firstWave = Math.min(F, stopFrames.length + Math.ceil(F / 8) + 1), ready = false, inflight = 0, next = 0;
  var loadEl = wrap.querySelector('.surface-load .l');
  function pump() {
    while (inflight < 6 && next < order.length) {
      (function (i) {
        var im = new Image(); im.decoding = 'async'; inflight++;
        im.onload = function () {
          imgs[i] = im; ok[i] = 1; loaded++; inflight--;
          if (loadEl && !ready) loadEl.textContent = 'Loading surface ' + Math.min(100, Math.round(loaded / firstWave * 100)) + '%';
          if (!ready && loaded >= firstWave) { ready = true; wrap.classList.add('ready'); }
          lastDrawn = -1; pump();
        };
        im.onerror = function () { inflight--; loaded++; pump(); };
        im.src = url(i);
      })(order[next++]);
    }
  }
  pump();
  function nearest(f) { if (ok[f]) return f; for (var d = 1; d < F; d++) { if (ok[f - d]) return f - d; if (ok[f + d]) return f + d; } return -1; }

  /* ---------- drawing (cover fit) ---------- */
  var cw = 0, ch = 0, dpr = 1, fit = { x: 0, y: 0, w: 1, h: 1 }, lastDrawn = -1;
  function resize() { cw = wrap.clientWidth; ch = wrap.clientHeight; dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); lastDrawn = -1; }
  addEventListener('resize', resize); resize();
  function draw(f) {
    var i = nearest(f); if (i < 0) return;
    var im = imgs[i], iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(cw / iw, ch / ih);
    fit.w = iw * s; fit.h = ih * s; fit.x = (cw - fit.w) / 2; fit.y = (ch - fit.h) / 2;
    if (i === lastDrawn) return; lastDrawn = i;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.drawImage(im, fit.x, fit.y, fit.w, fit.h);
  }

  /* ---------- hotspots, caption, rail, drawer ---------- */
  var hot = {}, captionEl = document.getElementById('stationCaption'), heroEl = document.getElementById('surfaceHero'), endEl = document.getElementById('surfaceEnd'), progEl = document.getElementById('surfaceProgress');
  STATIONS.forEach(function (s) {
    var h = document.createElement('button'); h.className = 'shot';
    h.innerHTML = '<span class="shot-n">' + s.n + '</span><span class="shot-t">' + s.title + '</span>'; h.setAttribute('aria-label', s.title);
    h.addEventListener('click', function () { openStation(s.id); }); wrap.appendChild(h); hot[s.id] = h;
  });
  var lastStation = -2;
  function updateUI(p) {
    var si = stationAt(p);
    if (heroEl) { heroEl.style.opacity = Math.max(0, 1 - p / .07); heroEl.style.pointerEvents = p < .07 ? 'auto' : 'none'; }
    if (endEl) { var e = Math.max(0, (p - .9) / .08); endEl.style.opacity = e; endEl.style.pointerEvents = e > .5 ? 'auto' : 'none'; }
    if (progEl) progEl.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    STATIONS.forEach(function (s, i) {
      var h = hot[s.id], st = MF.stops[s.id] || {}, ph = (i === si) ? holdPhase(p, i) : 0;
      h.style.opacity = ph; h.style.pointerEvents = ph > .5 ? 'auto' : 'none';
      if (ph > 0 && st.hotspot) { h.style.left = (fit.x + st.hotspot[0] * fit.w) + 'px'; h.style.top = (fit.y + st.hotspot[1] * fit.h) + 'px'; }
    });
    if (si !== lastStation) {
      lastStation = si;
      if (si >= 0) {
        var s = STATIONS[si];
        captionEl.innerHTML = '<div class="sc-k">' + s.n + ' / 0' + n + ' · ' + s.tag + '</div><h3>' + s.title + '</h3><p>' + s.short + '</p><button class="btn" onclick="openStation(\'' + s.id + '\')">Open details ' + (window.OB_ARROW || '→') + '</button>';
        captionEl.classList.add('on');
      } else captionEl.classList.remove('on');
      document.querySelectorAll('.sdot').forEach(function (d, i) { d.classList.toggle('on', i === si); });
    }
  }
  var panel = document.getElementById('stationPanel');
  window.openStation = function (id) {
    var s = STATIONS.filter(function (x) { return x.id === id; })[0]; if (!s || !panel) return;
    panel.querySelector('.sp-k').textContent = s.n + ' / 0' + n + ' · ' + s.tag; panel.querySelector('.sp-t').textContent = s.title; panel.querySelector('.sp-b').textContent = s.body;
    panel.querySelector('.sp-specs').innerHTML = s.specs.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');
    var im = panel.querySelector('.sp-img'); if (s.img) { im.src = s.img; im.style.display = ''; } else { im.style.display = 'none'; }
    panel.querySelector('.sp-link').href = s.link; panel.classList.add('open'); document.body.classList.add('panel-open');
  };
  window.closeStation = function () { if (panel) { panel.classList.remove('open'); document.body.classList.remove('panel-open'); } };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeStation(); });
  document.querySelectorAll('.sdot').forEach(function (d, i) {
    d.addEventListener('click', function () { var mid = (WIN[i][0] + WIN[i][1]) / 2; window.scrollTo({ top: section.offsetTop + mid * (section.offsetHeight - innerHeight), behavior: reduce ? 'auto' : 'smooth' }); });
  });

  /* ---------- loop ---------- */
  var progress = 0, target = 0, visible = true, last = performance.now();
  function readScroll() { var r = section.getBoundingClientRect(), h = section.offsetHeight - innerHeight; target = Math.max(0, Math.min(1, -r.top / h)); }
  addEventListener('scroll', readScroll, { passive: true }); readScroll();
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(section);
  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min(.1, (now - last) / 1000); last = now; if (!visible) return;
    progress += (target - progress) * (reduce ? 1 : 1 - Math.exp(-dt * 7)); if (Math.abs(target - progress) < .0002) progress = target;
    draw(Math.round(frameAt(progress))); updateUI(progress);
  }
  requestAnimationFrame(tick);
  window.__obSeq = { frameAt: frameAt, anchors: anchors, windows: WIN };
})();
