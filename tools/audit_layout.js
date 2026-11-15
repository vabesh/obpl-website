/* Layout audit for local previews. Open any page from tools/serve.py, load this file in the console, then run
   await __runAudit([[360,640],[768,1024],[1366,768]], ['/','/about','/programmes','/team','/contact'])
   It loads every page at every size and reports: sideways overflow, overlapping text, clipped text, top-bar collisions,
   hero fit, and whether the phone menu, profile pop-ups and station panel open fully on screen. Empty result = clean. */
window.__auditDoc = function (win) {
  const doc = win.document, W = win.innerWidth, H = win.innerHeight, sy = win.scrollY;
  doc.querySelectorAll('#loader,.loader,.surface-load').forEach(e => e.style.display = 'none');
  doc.querySelectorAll('.rv').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
  const cs = e => win.getComputedStyle(e);
  const vis = e => { const c = cs(e); if (c.display === 'none' || c.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const lab = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '') + ':' + (e.textContent || '').trim().replace(/[^!-~]+/g, ' ').slice(0, 22);
  const over = [];
  doc.querySelectorAll('main *, footer *, .nav *').forEach(e => {
    if (!vis(e) || e.closest('.spanel,.modal,.shot,.hot,.s-rail,canvas')) return;
    const r = e.getBoundingClientRect();
    if (r.right > W + 2 || r.left < -2) {
      let p = e.parentElement, cl = false;
      while (p && p !== doc.body) { const pc = cs(p); if (pc.overflowX !== 'visible') { const pr = p.getBoundingClientRect(); if (pr.right <= W + 2 && pr.left >= -2) { cl = true; break; } } p = p.parentElement; }
      if (!cl) over.push(lab(e) + ' L' + Math.round(r.left) + ' R' + Math.round(r.right) + ' y' + Math.round(r.top + sy));
    }
  });
  const T = [...doc.querySelectorAll('main h1,main h2,main h3,main h4,main p,main li,main .eyebrow,main .tag,main .btn,main td,main th,main label,main input,main select,main textarea,footer a,footer p,footer h4,.crumbs,.cue')].filter(e => vis(e) && !e.closest('.spanel,.modal,.shot,.hot,.s-end,.s-caption,.s-plate') && ((e.textContent || '').trim() || /INPUT|SELECT|TEXTAREA/.test(e.tagName)));
  const R = T.map(e => { const r = e.getBoundingClientRect(); return { e, l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy }; });
  const ov = [];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const x = Math.min(a.r, b.r) - Math.max(a.l, b.l), y = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (x > 4 && y > 4) ov.push(lab(a.e) + ' <> ' + lab(b.e) + ' y' + Math.round(a.t) + ' (' + Math.round(x) + 'x' + Math.round(y) + ')');
  }
  const tx = [...doc.querySelectorAll('main h1,main h2,main h3,main h4,main .btn,main td,main th,.brand,footer a,main .r,main .eyebrow')].filter(e => vis(e) && e.scrollWidth > e.clientWidth + 2).map(e => lab(e) + ' sw' + e.scrollWidth + '>cw' + e.clientWidth);
  const nav = doc.querySelector('.nav'), nr = nav.getBoundingClientRect();
  const kids = [...doc.querySelectorAll('.nav .brand,.nav .nav-links,.nav .nav-cta .btn,.nav .burger')].filter(vis).map(e => ({ n: lab(e).slice(0, 14), r: e.getBoundingClientRect() }));
  const navOv = [];
  for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) { const a = kids[i].r, b = kids[j].r; if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0) navOv.push(kids[i].n + ' <> ' + kids[j].n + ' by ' + Math.round(Math.min(a.right, b.right) - Math.max(a.left, b.left))); }
  const underNav = R.filter(a => a.t < nr.bottom - 2 && a.b > 0 && !a.e.closest('.nav')).map(a => lab(a.e) + ' top' + Math.round(a.t)).slice(0, 5);
  const hero = doc.querySelector('.s-hero-in'); let heroInfo = null;
  if (hero) { const r = hero.getBoundingClientRect(), cue = doc.querySelector('.s-hero .cue'), cr = cue && vis(cue) ? cue.getBoundingClientRect() : null; heroInfo = { top: Math.round(r.top), bottom: Math.round(r.bottom), H, navBottom: Math.round(nr.bottom), cueTop: cr ? Math.round(cr.top) : null }; }
  /* interactive states */
  const st = {};
  const burger = doc.querySelector('.burger'), mnav = doc.querySelector('.mnav');
  if (burger && vis(burger) && mnav) {
    mnav.style.transition = 'none'; mnav.querySelectorAll('a').forEach(a => { a.style.transition = 'none'; });
    burger.click(); const ls = [...mnav.querySelectorAll('a')].map(a => a.getBoundingClientRect()), nb = nav.getBoundingClientRect().bottom;
    const first = Math.round(ls[0].top), fits = mnav.scrollHeight <= mnav.clientHeight + 1;
    if (first < nb - 1 || (!fits && cs(mnav).overflowY === 'visible')) st.menu = { firstLinkTop: first, navBottom: Math.round(nb), fits, scroll: cs(mnav).overflowY };
    burger.click(); doc.body.style.overflow = '';
  }
  const person = doc.querySelectorAll('.person'), card = doc.querySelector('.modal-card');
  if (person.length && card && win.closeTeam) {
    card.style.transition = 'none'; const bad = [];
    person.forEach(pn => {
      pn.click(); card.style.transform = 'none'; const r = card.getBoundingClientRect(), x = doc.querySelector('.modal-x').getBoundingClientRect(), b = doc.querySelector('.modal-body');
      const okScroll = b.scrollHeight <= b.clientHeight + 1 || /auto|scroll/.test(cs(b).overflowY);
      if (r.top < 0 || r.bottom > H + 1 || x.top < 0 || x.right > W || !okScroll) bad.push((pn.querySelector('h3') || pn).textContent.trim().slice(0, 14) + ' top' + Math.round(r.top) + ' bot' + Math.round(r.bottom) + ' x' + Math.round(x.top));
      win.closeTeam();
    });
    if (bad.length) st.modal = bad.slice(0, 4);
  }
  const panel = doc.getElementById('stationPanel');
  if (panel && win.openStation && win.OB_STATIONS) {
    panel.style.transition = 'none'; win.openStation(win.OB_STATIONS[0].id); const x = panel.querySelector('.sp-x'), xr = x.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    const top = doc.elementFromPoint(Math.min(W - 2, xr.left + xr.width / 2), xr.top + xr.height / 2);
    if (!(top && (top === x || x.contains(top))) || pr.left < -1 || pr.right > W + 1) st.panel = { xTop: Math.round(xr.top), hit: top ? lab(top) : null, left: Math.round(pr.left), right: Math.round(pr.right) };
    win.closeStation();
  }
  return { W, docW: doc.documentElement.scrollWidth, over: over.slice(0, 8), overlaps: ov.slice(0, 10), textOverflow: tx.slice(0, 8), navOv, underNav, heroInfo, states: st };
};
window.__runAudit = async function (sizes, pages) {
  const res = {}; let n = 0;
  for (const [w, h] of sizes) {
    const frames = pages.map(p => { const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-6000px;top:0;border:0;width:' + w + 'px;height:' + h + 'px'; f.src = p + '?audit=' + w + 'x' + h; document.body.appendChild(f); return f; });
    await Promise.all(frames.map(f => new Promise(r => { f.onload = r; setTimeout(r, 6000); })));
    await new Promise(r => setTimeout(r, 600));
    frames.forEach((f, i) => {
      n++; let a; try { a = __auditDoc(f.contentWindow); } catch (e) { res[w + 'x' + h + ' ' + pages[i]] = 'ERR ' + e; f.remove(); return; }
      const hi = a.heroInfo, heroBad = hi && (hi.top < hi.navBottom - 1 || hi.bottom > hi.H || (hi.cueTop !== null && hi.bottom > hi.cueTop));
      const bad = a.docW > a.W || a.over.length || a.overlaps.length || a.textOverflow.length || a.navOv.length || a.underNav.length || heroBad || Object.keys(a.states).length;
      if (bad) { delete a.W; ['over', 'overlaps', 'textOverflow', 'navOv', 'underNav'].forEach(k => { if (!a[k].length) delete a[k]; }); if (!heroBad) delete a.heroInfo; if (!Object.keys(a.states).length) delete a.states; res[w + 'x' + h + ' ' + pages[i]] = a; }
      f.remove();
    });
  }
  res.checked = n; return res;
};
