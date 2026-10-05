/* ORBITBeyond India — detailed outpost hardware models (Three.js r128)
   Procedural but engineering-grade: PBR materials with generated normal/albedo maps (crinkled MLI foil,
   solar cells, thermal blankets, radiator fins), lattice trusses, treaded wheels, cable runs and an
   environment map so metals reflect. Exposes OBHardware.builders(renderer). Each builder returns a
   THREE.Group with userData.anchor (hotspot position) and optional userData.anim(t). */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ---------------- procedural textures ---------------- */
  function hash(x, y, s) { var n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
  function sm(t) { return t * t * (3 - 2 * t); }
  function vnoise(x, y, s) { var ix = Math.floor(x), iy = Math.floor(y), fx = sm(x - ix), fy = sm(y - iy); var a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s); return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy; }
  function fbm(x, y, s, o) { var v = 0, a = .5, f = 1; for (var i = 0; i < (o || 5); i++) { v += a * vnoise(x * f, y * f, s + i * 7); a *= .5; f *= 2; } return v; }
  function heightField(size, fn) { var h = new Float32Array(size * size); for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) h[y * size + x] = fn(x / size, y / size); return h; }
  function normalTex(size, h, strength, repeat) {
    var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data;
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var l = h[y * size + ((x - 1 + size) % size)], r = h[y * size + ((x + 1) % size)], u = h[((y - 1 + size) % size) * size + x], dn = h[((y + 1) % size) * size + x];
      var nx = -(r - l) * strength, ny = -(dn - u) * strength, nz = 1, len = Math.sqrt(nx * nx + ny * ny + 1);
      var i = (y * size + x) * 4; d[i] = (nx / len * .5 + .5) * 255; d[i + 1] = (-ny / len * .5 + .5) * 255; d[i + 2] = (nz / len * .5 + .5) * 255; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat || 1, repeat || 1); return t;
  }
  function albedoTex(size, fn, repeat) {
    var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d'); fn(g, size);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat || 1, repeat || 1); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }
  // crinkled MLI foil: creases + fine wrinkles
  var foilH = heightField(256, function (u, v) { var w = fbm(u * 18, v * 18, 3, 5) * .6 + fbm(u * 60, v * 60, 9, 3) * .25; var crease = Math.abs(Math.sin((u * 7 + fbm(u * 3, v * 3, 2, 2) * 2) * Math.PI)) < .03 ? .5 : 0; return w + crease * .3; });
  var foilN = normalTex(256, foilH, 1.6, 2);
  // thermal blanket: quilted seams
  var blanketH = heightField(256, function (u, v) { var q = Math.min(Math.abs(((u * 6) % 1) - .5), Math.abs(((v * 6) % 1) - .5)); return (q < .04 ? -.6 : 0) + fbm(u * 30, v * 30, 5, 3) * .2; });
  var blanketN = normalTex(256, blanketH, 1.2, 2);
  // brushed metal
  var brushH = heightField(256, function (u, v) { return fbm(u * 2, v * 120, 11, 2) * .5; });
  var brushN = normalTex(256, brushH, .6, 3);
  // solar cells
  var cellsA = albedoTex(512, function (g, s) { g.fillStyle = '#0b1b3a'; g.fillRect(0, 0, s, s); var n = 8, m = 12, pw = s / n, ph = s / m; for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) { var gr = g.createLinearGradient(i * pw, j * ph, i * pw + pw, j * ph + ph); gr.addColorStop(0, '#1a3f8a'); gr.addColorStop(.5, '#122d66'); gr.addColorStop(1, '#0e2250'); g.fillStyle = gr; g.fillRect(i * pw + 2, j * ph + 2, pw - 4, ph - 4); g.strokeStyle = 'rgba(190,205,230,.45)'; g.lineWidth = 1; for (var k = 1; k < 4; k++) { g.beginPath(); g.moveTo(i * pw + 2 + (pw - 4) * k / 4, j * ph + 2); g.lineTo(i * pw + 2 + (pw - 4) * k / 4, j * ph + ph - 2); g.stroke(); } } }, 1);
  var cellsH = heightField(256, function (u, v) { var q = Math.min(Math.abs(((u * 8) % 1) - .5), Math.abs(((v * 12) % 1) - .5)); return q < .05 ? -.8 : 0; });
  var cellsN = normalTex(256, cellsH, 1.0, 1);
  // radiator: embossed channels
  var radH = heightField(256, function (u, v) { return Math.abs(Math.sin(u * Math.PI * 24)) < .25 ? .5 : 0; });
  var radN = normalTex(256, radH, .9, 2);
  // label strip: tricolour + OBPL
  var labelA = albedoTex(256, function (g, s) { g.fillStyle = '#e8eefa'; g.fillRect(0, 0, s, s); g.fillStyle = '#f2a33a'; g.fillRect(0, 0, s, s * .18); g.fillStyle = '#138808'; g.fillRect(0, s * .82, s, s * .18); g.fillStyle = '#0a2a6b'; g.font = 'bold 72px Arial'; g.textAlign = 'center'; g.fillText('OBPL', s / 2, s * .6); }, 1);

  /* ---------------- materials (env map assigned later) ---------------- */
  var M = {
    gold: new THREE.MeshStandardMaterial({ color: 0xd4a850, metalness: .95, roughness: .28, normalMap: foilN, normalScale: new THREE.Vector2(.9, .9) }),
    silverFoil: new THREE.MeshStandardMaterial({ color: 0xcfd3da, metalness: .95, roughness: .3, normalMap: foilN, normalScale: new THREE.Vector2(.8, .8) }),
    blanket: new THREE.MeshStandardMaterial({ color: 0xe6e4dc, metalness: .05, roughness: .75, normalMap: blanketN, normalScale: new THREE.Vector2(.6, .6) }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb9bcc3, metalness: .9, roughness: .42, normalMap: brushN, normalScale: new THREE.Vector2(.35, .35) }),
    steel: new THREE.MeshStandardMaterial({ color: 0x8e9299, metalness: .95, roughness: .35 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1b1f26, metalness: .5, roughness: .55 }),
    anod: new THREE.MeshStandardMaterial({ color: 0x2a3140, metalness: .7, roughness: .45 }),
    cells: new THREE.MeshPhysicalMaterial({ map: cellsA, normalMap: cellsN, normalScale: new THREE.Vector2(.5, .5), metalness: .35, roughness: .22, clearcoat: .6, clearcoatRoughness: .15 }),
    rad: new THREE.MeshStandardMaterial({ color: 0xf2f2ee, metalness: .15, roughness: .55, normalMap: radN, normalScale: new THREE.Vector2(.6, .6), side: THREE.DoubleSide }),
    orange: new THREE.MeshStandardMaterial({ color: 0xf2a33a, metalness: .2, roughness: .5 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x2b2a28, metalness: .05, roughness: .95 }),
    mesh: new THREE.MeshStandardMaterial({ color: 0xd9dbdf, metalness: .8, roughness: .5, side: THREE.DoubleSide, wireframe: true }),
    glow: new THREE.MeshStandardMaterial({ color: 0x5fb8c9, emissive: 0x5fb8c9, emissiveIntensity: 1.5, metalness: .2, roughness: .4 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc8282d, emissive: 0x600000, emissiveIntensity: .5, roughness: .5 }),
    label: new THREE.MeshStandardMaterial({ map: labelA, metalness: .1, roughness: .6 }),
    nozzle: new THREE.MeshStandardMaterial({ color: 0x6a6e76, metalness: .9, roughness: .5, side: THREE.DoubleSide, normalMap: radN, normalScale: new THREE.Vector2(.8, .8) })
  };
  var allMats = Object.keys(M).map(function (k) { return M[k]; });

  /* ---------------- helpers ---------------- */
  function mesh(g, m, x, y, z) { var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true; return o; }
  var _a = new THREE.Vector3(), _b = new THREE.Vector3();
  function strut(ax, ay, az, bx, by, bz, r, mat) { _a.set(ax, ay, az); _b.set(bx, by, bz); var len = _a.distanceTo(_b); var s = mesh(new THREE.CylinderGeometry(r, r, len, 8), mat || M.alu); s.position.copy(_a).lerp(_b, .5); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _b.clone().sub(_a).normalize()); return s; }
  function truss(len, w, segs, r, mat) { // square-section lattice along +y
    var g = new THREE.Group(); var h = len / segs;
    for (var i = 0; i < 4; i++) { var sx = (i & 1 ? 1 : -1) * w / 2, sz = (i & 2 ? 1 : -1) * w / 2; g.add(strut(sx, 0, sz, sx, len, sz, r, mat)); }
    for (var k = 0; k <= segs; k++) { var y = k * h; g.add(strut(-w / 2, y, -w / 2, w / 2, y, -w / 2, r * .7, mat)); g.add(strut(-w / 2, y, w / 2, w / 2, y, w / 2, r * .7, mat)); g.add(strut(-w / 2, y, -w / 2, -w / 2, y, w / 2, r * .7, mat)); g.add(strut(w / 2, y, -w / 2, w / 2, y, w / 2, r * .7, mat)); if (k < segs) { var d = (k % 2 ? 1 : -1); g.add(strut(-w / 2, y, -w / 2 * d, w / 2, y + h, -w / 2 * d, r * .6, mat)); g.add(strut(-w / 2 * d, y, -w / 2, -w / 2 * d, y + h, w / 2, r * .6, mat)); } }
    return g;
  }
  function dish(r, depth) { var g = new THREE.Group(); var geo = new THREE.SphereGeometry(r * 1.6, 40, 20, 0, Math.PI * 2, 0, Math.asin(r / (r * 1.6))); var d = new THREE.Mesh(geo, M.blanket); d.castShadow = true; d.rotation.x = Math.PI; d.position.y = r * 1.6 * Math.cos(Math.asin(1 / 1.6)); g.add(d); var back = new THREE.Mesh(geo, M.silverFoil); back.rotation.x = Math.PI; back.position.y = d.position.y + .01; back.scale.setScalar(1.01); g.add(back);
    for (var i = 0; i < 3; i++) { var a = i * Math.PI * 2 / 3; g.add(strut(Math.cos(a) * r * .8, .05, Math.sin(a) * r * .8, 0, r * .9, 0, r * .02, M.steel)); }
    g.add(mesh(new THREE.CylinderGeometry(r * .08, r * .1, r * .18, 10), M.black, 0, r * .9, 0)); return g; }
  function bolts(g, pts, r) { pts.forEach(function (p) { g.add(mesh(new THREE.CylinderGeometry(r, r, r * .6, 6), M.steel, p[0], p[1], p[2])); }); }
  function cable(points, r, mat) { var curve = new THREE.CatmullRomCurve3(points.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); })); return mesh(new THREE.TubeGeometry(curve, 24, r, 6, false), mat || M.black); }
  function wheel(r, w) { var g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(r, r, w, 28), M.alu).rotateX(Math.PI / 2)); for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2; var t = mesh(new THREE.BoxGeometry(w * 1.02, r * .08, r * .18), M.rubber); t.position.set(0, Math.sin(a) * r, Math.cos(a) * r); t.rotation.x = -a; g.add(t); } g.add(mesh(new THREE.CylinderGeometry(r * .35, r * .35, w * 1.1, 12), M.black).rotateX(Math.PI / 2)); for (var k = 0; k < 6; k++) { var b = k / 6 * Math.PI * 2; g.add(mesh(new THREE.BoxGeometry(w * .3, r * .05, r * .6), M.steel, 0, Math.sin(b) * r * .45, Math.cos(b) * r * .45).rotateX(-b)); } return g; }
  function panelWing(w, h) { var g = new THREE.Group(); var p = mesh(new THREE.BoxGeometry(w, h, .04), M.cells); g.add(p); var back = mesh(new THREE.BoxGeometry(w * 1.02, h * 1.02, .02), M.alu, 0, 0, -.03); g.add(back); var f = M.anod; g.add(mesh(new THREE.BoxGeometry(w * 1.03, .05, .07), f, 0, h / 2, 0)); g.add(mesh(new THREE.BoxGeometry(w * 1.03, .05, .07), f, 0, -h / 2, 0)); g.add(mesh(new THREE.BoxGeometry(.05, h, .07), f, w / 2, 0, 0)); g.add(mesh(new THREE.BoxGeometry(.05, h, .07), f, -w / 2, 0, 0)); var n = Math.round(h / .9); for (var i = 1; i < n; i++) g.add(mesh(new THREE.BoxGeometry(w, .025, .05), f, 0, -h / 2 + i * h / n, .01)); return g; }
  function rhu(r, len) { var g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(r, r, len, 20), M.gold)); for (var i = 0; i < 7; i++) g.add(mesh(new THREE.CylinderGeometry(r * 1.5, r * 1.5, len * .04, 20), M.alu, 0, -len / 2 + (i + .5) * len / 7, 0)); g.add(mesh(new THREE.CylinderGeometry(r * .4, r * .4, len * .25, 10), M.steel, 0, len / 2 + len * .1, 0)); return g; }
  function box(w, h, d, mat, x, y, z) { var g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(w, h, d), mat)); var e = M.anod; g.add(mesh(new THREE.BoxGeometry(w * 1.01, .03, d * 1.01), e, 0, h / 2, 0)); g.add(mesh(new THREE.BoxGeometry(w * 1.01, .03, d * 1.01), e, 0, -h / 2, 0)); bolts(g, [[w / 2 - .06, h / 2, d / 2 - .06], [-w / 2 + .06, h / 2, d / 2 - .06], [w / 2 - .06, h / 2, -d / 2 + .06], [-w / 2 + .06, h / 2, -d / 2 + .06]], .02); g.position.set(x || 0, y || 0, z || 0); return g; }
  function connector(x, y, z) { var g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.04, .04, .06, 10), M.steel)); g.add(mesh(new THREE.CylinderGeometry(.03, .03, .04, 10), M.black, 0, .04, 0)); g.position.set(x, y, z); return g; }

  /* ---------------- 1. VSAT: vertical solar array ---------------- */
  function buildVSAT() {
    var g = new THREE.Group();
    // pallet + outriggers
    g.add(box(2.4, .3, 2.4, M.blanket, 0, .15, 0));
    for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2 + Math.PI / 4; var fx = Math.cos(a) * 2.3, fz = Math.sin(a) * 2.3; g.add(strut(Math.cos(a) * 1.1, .3, Math.sin(a) * 1.1, fx, .08, fz, .05, M.alu)); g.add(strut(Math.cos(a) * 1.1, .05, Math.sin(a) * 1.1, fx, .08, fz, .035, M.alu)); g.add(mesh(new THREE.CylinderGeometry(.32, .36, .08, 18), M.gold, fx, .04, fz)); }
    // lattice mast
    g.add(truss(10.5, .36, 14, .022, M.alu).translateY(.3));
    g.add(mesh(new THREE.CylinderGeometry(.09, .09, 10.6, 12), M.alu, 0, 5.6, 0));
    // cable run up the mast
    g.add(cable([[.2, .3, .2], [.22, 3, .2], [.2, 6, .22], [.22, 9, .2], [.2, 10.6, .1]], .018, M.black));
    // deployable wings
    var wings = new THREE.Group(); wings.position.y = 6.0; g.add(wings);
    for (var s = -1; s <= 1; s += 2) { var w = panelWing(3.6, 8.2); w.position.x = s * 2.15; wings.add(w); wings.add(mesh(new THREE.BoxGeometry(.5, .1, .1), M.steel, s * .3, 3.9, 0)); wings.add(mesh(new THREE.BoxGeometry(.5, .1, .1), M.steel, s * .3, -3.9, 0)); for (var k = -3; k <= 3; k += 2) wings.add(strut(s * .18, k, 0, s * .4, k, -.08, .02, M.steel)); }
    wings.add(mesh(new THREE.BoxGeometry(.5, 8.4, .3), M.anod, 0, 0, 0));
    // mast head: gimbal + beacon
    g.add(mesh(new THREE.CylinderGeometry(.4, .34, .5, 16), M.alu, 0, 10.9, 0)); g.add(mesh(new THREE.SphereGeometry(.08, 10, 10), M.red, 0, 11.25, 0));
    // power conditioning + RHU/battery pallet
    g.add(box(1.4, .8, .9, M.gold, 1.7, .7, 1.2)); g.add(connector(1.2, 1.12, 1.4)); g.add(connector(1.4, 1.12, 1.4));
    g.add(box(1.3, .7, .9, M.anod, -1.7, .65, -1.2)); g.add(mesh(new THREE.BoxGeometry(1.0, .02, .5), M.label, -1.7, 1.01, -1.2));
    var r = rhu(.22, .9); r.rotation.z = Math.PI / 2; r.position.set(-1.6, .55, 1.3); g.add(r);
    g.add(cable([[1.0, 1.0, 1.2], [.4, .9, .9], [.1, .5, .3]], .02)); g.add(mesh(new THREE.BoxGeometry(.1, .1, .1), M.glow, 2.25, 1.0, 1.3));
    g.userData.anim = function (t) { wings.rotation.y = .5 + Math.sin(t * .06) * .3; };
    g.userData.anchor = new THREE.Vector3(0, 11.6, 0); return g;
  }

  /* ---------------- 2. Night-survival unit: RHUs, batteries, Stirling, radiators ---------------- */
  function buildNight() {
    var g = new THREE.Group();
    g.add(box(5.0, .35, 3.0, M.anod, 0, .18, 0));
    for (var i = 0; i < 4; i++) g.add(mesh(new THREE.CylinderGeometry(.14, .2, .3, 10), M.gold, (i & 1 ? 2.2 : -2.2), .05, (i & 2 ? 1.3 : -1.3)));
    // Stirling converter: pressure vessel + heater head + cold end fins
    var sv = new THREE.Group(); sv.position.set(.4, 1.3, 0); g.add(sv);
    sv.add(mesh(new THREE.CylinderGeometry(.75, .75, 2.6, 28), M.blanket).rotateZ(Math.PI / 2));
    sv.add(mesh(new THREE.CylinderGeometry(.78, .78, .12, 28), M.alu, 0, 0, 0).rotateZ(Math.PI / 2));
    sv.add(mesh(new THREE.CylinderGeometry(.55, .62, .9, 24), M.gold, 1.7, 0, 0).rotateZ(Math.PI / 2));
    for (var k = 0; k < 10; k++) sv.add(mesh(new THREE.CylinderGeometry(.95, .95, .035, 28), M.alu, -1.3 - k * .09, 0, 0).rotateZ(Math.PI / 2));
    sv.add(mesh(new THREE.TorusGeometry(.8, .05, 10, 40), M.orange, .5, 0, 0).rotateY(Math.PI / 2)); sv.add(mesh(new THREE.TorusGeometry(.8, .05, 10, 40), M.orange, -.5, 0, 0).rotateY(Math.PI / 2));
    g.add(strut(.4, .35, 1.0, .4, .7, .6, .05, M.alu)); g.add(strut(.4, .35, -1.0, .4, .7, -.6, .05, M.alu)); g.add(strut(1.6, .35, .8, 1.6, .8, .4, .05, M.alu)); g.add(strut(1.6, .35, -.8, 1.6, .8, -.4, .05, M.alu));
    // RHU canisters in a rack
    for (var r = 0; r < 3; r++) { var u = rhu(.16, 1.0); u.rotation.z = Math.PI / 2; u.position.set(-1.8, .7 + r * .45, -.9 + r * .25); g.add(u); }
    g.add(mesh(new THREE.BoxGeometry(1.3, .08, .9), M.alu, -1.8, .4, -.7)); g.add(mesh(new THREE.BoxGeometry(1.3, .08, .9), M.alu, -1.8, 1.75, -.7));
    for (var c = 0; c < 4; c++) g.add(strut(-2.4 + (c & 1) * 1.2, .4, -1.1 + ((c >> 1) & 1) * .8, -2.4 + (c & 1) * 1.2, 1.75, -1.1 + ((c >> 1) & 1) * .8, .025, M.steel));
    // battery pack
    g.add(box(1.6, .9, 1.0, M.black, -1.6, .8, .95)); g.add(mesh(new THREE.BoxGeometry(1.1, .02, .4), M.label, -1.6, 1.26, .95));
    for (var b = 0; b < 3; b++) g.add(mesh(new THREE.BoxGeometry(.06, .06, .06), (b < 2 ? M.glow : M.red), -2.0 + b * .3, 1.1, 1.46));
    // deployable radiator panels with heat-pipe manifolds
    var rads = new THREE.Group(); rads.position.set(2.6, 1.2, 0); g.add(rads);
    for (var p = 0; p < 2; p++) { var rp = new THREE.Group(); rp.position.z = (p ? 1 : -1) * 1.05; rp.add(mesh(new THREE.BoxGeometry(2.6, 2.2, .06), M.rad, 1.5, 1.1, 0)); rp.add(mesh(new THREE.BoxGeometry(2.7, .08, .14), M.alu, 1.5, 2.2, 0)); rp.add(mesh(new THREE.BoxGeometry(2.7, .08, .14), M.alu, 1.5, 0, 0)); for (var q = 0; q < 6; q++) rp.add(mesh(new THREE.CylinderGeometry(.03, .03, 2.2, 8), M.steel, .3 + q * .44, 1.1, .05)); rads.add(rp); }
    rads.add(mesh(new THREE.CylinderGeometry(.1, .1, 2.3, 12), M.steel).rotateX(Math.PI / 2));
    g.add(cable([[1.8, .9, .4], [2.3, 1.1, .6], [2.6, 1.25, 1.0]], .025, M.orange)); g.add(cable([[1.8, .9, -.4], [2.3, 1.1, -.6], [2.6, 1.25, -1.0]], .025, M.orange));
    g.add(cable([[-1.1, .95, .5], [-.4, 1.0, .3], [-.2, 1.1, 0]], .02));
    g.userData.anchor = new THREE.Vector3(.6, 3.6, 0); g.userData.anim = function (t) { rads.rotation.y = Math.sin(t * .1) * .12; }; return g;
  }

  /* ---------------- 3. Long-range rover: rocker-bogie, six treaded wheels ---------------- */
  function buildRover() {
    var g = new THREE.Group(), wheels = [];
    g.add(box(2.8, .7, 1.6, M.gold, 0, 1.15, 0)); g.add(mesh(new THREE.BoxGeometry(2.9, .06, 1.7), M.blanket, 0, 1.53, 0));
    g.add(mesh(new THREE.BoxGeometry(2.4, .02, 1.2), M.cells, 0, 1.57, 0));
    g.add(mesh(new THREE.BoxGeometry(.9, .02, .3), M.label, .6, 1.51, .86).rotateX(Math.PI / 2));
    for (var s = -1; s <= 1; s += 2) {
      // rocker (front) and bogie (rear) linkages
      g.add(strut(.2, 1.1, s * .9, 1.25, .62, s * 1.15, .05, M.alu)); g.add(strut(.2, 1.1, s * .9, -.4, .75, s * 1.15, .05, M.alu)); g.add(strut(-.4, .75, s * 1.15, -1.25, .62, s * 1.15, .045, M.alu)); g.add(strut(-.4, .75, s * 1.15, -.1, .62, s * 1.15, .045, M.alu));
      g.add(mesh(new THREE.CylinderGeometry(.09, .09, .4, 12), M.steel, .2, 1.1, s * .95).rotateX(Math.PI / 2));
      [1.25, -.1, -1.25].forEach(function (x) { var w = wheel(.45, .34); w.position.set(x, .45, s * 1.25); g.add(w); wheels.push(w); g.add(strut(x, .62, s * 1.15, x, .45, s * 1.1, .04, M.steel)); });
    }
    // mast with stereo cameras and nav lights
    g.add(mesh(new THREE.CylinderGeometry(.05, .06, 1.8, 10), M.alu, .9, 2.45, -.4)); g.add(mesh(new THREE.BoxGeometry(.6, .22, .22), M.blanket, .9, 3.4, -.4));
    g.add(mesh(new THREE.CylinderGeometry(.06, .06, .06, 12), M.black, .72, 3.4, -.27).rotateX(Math.PI / 2)); g.add(mesh(new THREE.CylinderGeometry(.06, .06, .06, 12), M.black, 1.08, 3.4, -.27).rotateX(Math.PI / 2));
    g.add(mesh(new THREE.BoxGeometry(.08, .08, .08), M.glow, .9, 3.55, -.4));
    // HGA dish + LGA
    var d = dish(.42, .1); d.position.set(-.9, 1.75, .35); d.rotation.x = -.5; g.add(d); g.add(strut(-.9, 1.55, .35, -.9, 1.75, .35, .04, M.alu));
    g.add(mesh(new THREE.CylinderGeometry(.015, .015, .9, 6), M.steel, -1.2, 2.0, -.5));
    // robotic arm
    g.add(mesh(new THREE.CylinderGeometry(.12, .12, .2, 12), M.steel, 1.45, 1.6, .5)); g.add(strut(1.45, 1.7, .5, 2.2, 1.3, .7, .05, M.alu)); g.add(strut(2.2, 1.3, .7, 2.6, .6, .8, .045, M.alu)); g.add(mesh(new THREE.BoxGeometry(.25, .25, .25), M.black, 2.65, .5, .8));
    // RTG-style box / electronics at rear + radiator
    g.add(box(.7, .5, 1.0, M.anod, -1.65, 1.1, 0)); g.add(mesh(new THREE.BoxGeometry(.5, .6, .04), M.rad, -1.2, 1.9, -.6));
    g.add(cable([[1.0, 1.5, -.3], [.6, 1.6, -.7], [-1.0, 1.4, -.7], [-1.6, 1.35, -.5]], .02));
    g.userData.anim = function (t) { var v = (Math.sin(t * .35) + 1) * .5; wheels.forEach(function (w) { w.rotation.z -= v * .03; }); g.position.x = g.userData.x0 + Math.sin(t * .35) * 6; g.rotation.y = Math.cos(t * .35) * .1; };
    g.userData.anchor = new THREE.Vector3(0, 4.1, 0); return g;
  }

  /* ---------------- 4. Helium-3 extraction unit: tracked, auger, heater drum ---------------- */
  function buildExtractor() {
    var g = new THREE.Group();
    // tracked base
    for (var s = -1; s <= 1; s += 2) { var tr = new THREE.Group(); tr.position.z = s * 1.75; tr.add(mesh(new THREE.BoxGeometry(5.2, .9, .7), M.anod, 0, .55, 0)); for (var w = -2; w <= 2; w++) tr.add(mesh(new THREE.CylinderGeometry(.42, .42, .5, 14), M.steel, w * 1.2, .5, 0).rotateX(Math.PI / 2)); for (var k = 0; k < 26; k++) { var a = k / 26; var x = -2.7 + a * 5.4; tr.add(mesh(new THREE.BoxGeometry(.18, .05, .78), M.rubber, x, .06, 0)); tr.add(mesh(new THREE.BoxGeometry(.18, .05, .78), M.rubber, x, 1.02, 0)); } g.add(tr); }
    // chassis + MLI
    g.add(box(5.0, 1.0, 2.9, M.gold, 0, 1.3, 0)); g.add(mesh(new THREE.BoxGeometry(5.1, .06, 3.0), M.blanket, 0, 1.83, 0));
    g.add(mesh(new THREE.BoxGeometry(1.1, .02, .3), M.label, -1.6, 1.5, 1.47).rotateX(Math.PI / 2));
    // heater drum (processing) with insulation and exhaust
    g.add(mesh(new THREE.CylinderGeometry(.9, .9, 1.9, 28), M.silverFoil, -1.3, 2.8, 0)); g.add(mesh(new THREE.CylinderGeometry(.95, .95, .1, 28), M.alu, -1.3, 1.9, 0)); g.add(mesh(new THREE.CylinderGeometry(.95, .95, .1, 28), M.alu, -1.3, 3.7, 0));
    g.add(mesh(new THREE.TorusGeometry(.92, .05, 10, 40), M.orange, -1.3, 2.8, 0).rotateX(Math.PI / 2));
    g.add(mesh(new THREE.CylinderGeometry(.18, .22, .9, 14), M.steel, -1.3, 4.2, .3)); g.add(mesh(new THREE.CylinderGeometry(.5, .5, .5, 16), M.anod, -1.3, 4.0, -.5));
    for (var p = 0; p < 4; p++) g.add(mesh(new THREE.CylinderGeometry(.04, .04, 1.8, 8), M.steel, -1.3 + Math.cos(p * 1.57) * .97, 2.8, Math.sin(p * 1.57) * .97));
    // hopper + conveyor
    g.add(mesh(new THREE.CylinderGeometry(1.0, .45, 1.2, 6), M.blanket, .6, 2.6, -.6)); g.add(strut(.6, 2.0, -.6, -.5, 2.2, -.1, .09, M.alu));
    // excavation boom with auger drill
    var boom = new THREE.Group(); boom.position.set(2.1, 1.9, .3); g.add(boom);
    boom.add(mesh(new THREE.CylinderGeometry(.3, .3, .5, 16), M.steel)); var arm = mesh(new THREE.BoxGeometry(.35, .35, 3.8), M.alu, 0, 1.4, 1.5); arm.rotation.x = .55; boom.add(arm);
    boom.add(strut(0, .3, 0, .0, 2.6, 2.3, .05, M.steel)); // hydraulic/actuator
    var auger = new THREE.Group(); auger.position.set(0, .25, 2.4); boom.add(auger);
    auger.add(mesh(new THREE.CylinderGeometry(.13, .13, 4.2, 10), M.steel, 0, -1.3, 0)); for (var i = 0; i < 12; i++) { var fl = mesh(new THREE.TorusGeometry(.36, .045, 8, 20), M.orange, 0, .5 - i * .36, 0); fl.rotation.x = Math.PI / 2 + .3; auger.add(fl); }
    auger.add(mesh(new THREE.ConeGeometry(.14, .4, 10), M.steel, 0, -3.5, 0).rotateX(Math.PI));
    // control cabin + radiator + lights
    g.add(box(1.4, 1.0, 1.1, M.blanket, 1.5, 2.3, -1.0)); g.add(mesh(new THREE.BoxGeometry(.9, .7, .04), M.rad, 1.5, 2.5, -1.58)); g.add(mesh(new THREE.BoxGeometry(.1, .1, .1), M.glow, 2.2, 2.6, -1.3)); g.add(mesh(new THREE.BoxGeometry(.1, .1, .1), M.red, 2.2, 2.6, -1.0));
    g.add(cable([[.9, 2.0, -.9], [1.8, 2.0, -.2], [2.1, 2.1, .3]], .025, M.orange)); g.add(cable([[-.5, 1.85, 1.0], [-1.2, 2.2, .9], [-1.3, 2.8, .95]], .02));
    g.userData.anchor = new THREE.Vector3(0, 5.4, 0); g.userData.anim = function (t) { auger.rotation.y = t * 3; boom.rotation.y = Math.sin(t * .3) * .15; }; return g;
  }

  /* ---------------- 5. OB1 lander ---------------- */
  function buildLander() {
    var g = new THREE.Group();
    var bus = new THREE.Group(); bus.position.y = 2.9; g.add(bus);
    // octagonal structure, tanks, MLI
    bus.add(mesh(new THREE.CylinderGeometry(1.55, 1.65, 1.5, 8, 1), M.gold).rotateY(Math.PI / 8));
    bus.add(mesh(new THREE.CylinderGeometry(1.72, 1.72, .12, 8), M.anod, 0, .8, 0).rotateY(Math.PI / 8)); bus.add(mesh(new THREE.CylinderGeometry(1.72, 1.72, .12, 8), M.anod, 0, -.8, 0).rotateY(Math.PI / 8));
    for (var e = 0; e < 8; e++) { var a = e * Math.PI / 4 + Math.PI / 8; bus.add(strut(Math.cos(a) * 1.7, -.8, Math.sin(a) * 1.7, Math.cos(a) * 1.7, .8, Math.sin(a) * 1.7, .04, M.alu)); }
    for (var tk = 0; tk < 4; tk++) { var ta = tk * Math.PI / 2; bus.add(mesh(new THREE.SphereGeometry(.62, 24, 18), M.silverFoil, Math.cos(ta) * .95, -1.35, Math.sin(ta) * .95)); }
    bus.add(mesh(new THREE.CylinderGeometry(1.2, 1.3, .3, 8), M.gold, 0, -1.0, 0).rotateY(Math.PI / 8));
    bus.add(mesh(new THREE.CylinderGeometry(1.66, 1.66, .16, 8, 1, true), M.label, 0, .35, 0).rotateY(Math.PI / 8));
    // main engine with cooling channels + verniers
    bus.add(mesh(new THREE.CylinderGeometry(.42, .75, 1.0, 28, 1, true), M.nozzle, 0, -2.2, 0)); bus.add(mesh(new THREE.CylinderGeometry(.3, .42, .35, 20), M.steel, 0, -1.55, 0)); bus.add(mesh(new THREE.TorusGeometry(.75, .04, 8, 36), M.steel, 0, -2.7, 0).rotateX(Math.PI / 2));
    for (var v = 0; v < 4; v++) { var va = v * Math.PI / 2 + Math.PI / 4; bus.add(mesh(new THREE.CylinderGeometry(.08, .16, .3, 12), M.nozzle, Math.cos(va) * 1.5, -1.0, Math.sin(va) * 1.5)); }
    // legs: primary strut + two braces + crushable pad
    for (var i = 0; i < 4; i++) { var la = i * Math.PI / 2 + Math.PI / 4, cx = Math.cos(la), cz = Math.sin(la);
      g.add(strut(cx * 1.5, 3.0, cz * 1.5, cx * 3.2, .22, cz * 3.2, .09, M.alu)); g.add(strut(cx * 1.65, 2.1, cz * 1.65, cx * 3.2, .22, cz * 3.2, .05, M.steel));
      var sx = Math.cos(la + .35) * 1.6, sz = Math.sin(la + .35) * 1.6; g.add(strut(sx, 2.3, sz, cx * 3.2, .22, cz * 3.2, .045, M.steel)); var sx2 = Math.cos(la - .35) * 1.6, sz2 = Math.sin(la - .35) * 1.6; g.add(strut(sx2, 2.3, sz2, cx * 3.2, .22, cz * 3.2, .045, M.steel));
      g.add(strut(cx * 1.9, 2.3, cz * 1.9, cx * 2.5, 1.45, cz * 2.5, .13, M.gold));   // shock absorber
      g.add(mesh(new THREE.CylinderGeometry(.5, .6, .14, 20), M.gold, cx * 3.2, .07, cz * 3.2)); g.add(mesh(new THREE.SphereGeometry(.16, 12, 10), M.steel, cx * 3.2, .22, cz * 3.2)); }
    // deck: HGA, solar panel, star trackers, payload boxes, antenna
    var d = dish(.75, .2); d.position.set(-1.0, 3.75, .7); d.rotation.x = -.6; d.rotation.z = .3; g.add(d); g.add(mesh(new THREE.CylinderGeometry(.08, .1, .5, 10), M.alu, -1.0, 3.9, .7));
    var sp = panelWing(2.6, 1.3); sp.position.set(2.1, 4.4, -.3); sp.rotation.y = Math.PI / 2; sp.rotation.x = -.35; g.add(sp); g.add(strut(1.6, 3.7, -.3, 2.0, 4.3, -.3, .05, M.steel));
    g.add(box(.9, .6, .9, M.blanket, .3, 4.0, .9)); g.add(box(.7, .5, .6, M.anod, -.6, 3.95, -.9)); g.add(mesh(new THREE.CylinderGeometry(.09, .11, .3, 12), M.black, -.8, 4.35, -.6).rotateX(-.6));
    g.add(mesh(new THREE.CylinderGeometry(.02, .02, 1.8, 6), M.steel, .9, 4.6, -.9)); g.add(mesh(new THREE.SphereGeometry(.06, 8, 8), M.glow, .9, 5.5, -.9));
    g.add(cable([[.3, 3.7, 1.3], [-.4, 3.75, 1.4], [-1.0, 3.7, 1.0]], .02)); g.add(cable([[1.0, 3.7, -1.2], [-.2, 3.72, -1.4], [-.6, 3.7, -1.2]], .02));
    g.userData.anchor = new THREE.Vector3(0, 6.2, 0); g.userData.anim = function (t) { d.rotation.y = Math.sin(t * .15) * .3; }; return g;
  }

  /* ---------------- 6. Relay orbiter ---------------- */
  function buildOrbiter() {
    var g = new THREE.Group();
    g.add(box(2.4, 2.4, 2.8, M.gold, 0, 0, 0)); g.add(mesh(new THREE.BoxGeometry(2.5, 2.5, .14), M.anod, 0, 0, 1.45)); g.add(mesh(new THREE.BoxGeometry(2.0, 1.4, .05), M.rad, 0, .2, -1.45));
    g.add(mesh(new THREE.BoxGeometry(1.2, .02, .3), M.label, 0, 1.22, .6).rotateY(0));
    for (var s = -1; s <= 1; s += 2) { var w = panelWing(7.8, 2.2); w.position.set(s * 5.4, 0, 0); g.add(w); g.add(mesh(new THREE.CylinderGeometry(.09, .09, 1.8, 10), M.steel, s * 2.0, 0, 0).rotateZ(Math.PI / 2)); g.add(mesh(new THREE.CylinderGeometry(.16, .16, .3, 12), M.black, s * 1.3, 0, 0).rotateZ(Math.PI / 2)); g.add(strut(s * 2.9, 1.05, 0, s * 2.1, .5, 0, .03, M.steel)); g.add(strut(s * 2.9, -1.05, 0, s * 2.1, -.5, 0, .03, M.steel)); }
    var d = dish(1.2, .3); d.rotation.x = -Math.PI / 2; d.position.set(0, -1.3, .5); g.add(d); g.add(mesh(new THREE.CylinderGeometry(.08, .1, .5, 10), M.alu, 0, -1.3, .5).rotateX(Math.PI / 2));
    g.add(mesh(new THREE.CylinderGeometry(.11, .13, .45, 12), M.black, -.8, 1.35, .6).rotateX(-.5)); g.add(mesh(new THREE.CylinderGeometry(.11, .13, .45, 12), M.black, .8, 1.35, .6).rotateX(-.5));
    g.add(mesh(new THREE.CylinderGeometry(.02, .02, 2.6, 6), M.steel, 0, 2.4, -.6)); g.add(mesh(new THREE.SphereGeometry(.1, 8, 8), M.glow, 0, 3.7, -.6));
    for (var th = 0; th < 4; th++) { var a = th * Math.PI / 2 + Math.PI / 4; g.add(mesh(new THREE.CylinderGeometry(.08, .16, .3, 12), M.nozzle, Math.cos(a) * 1.0, Math.sin(a) * 1.0, -1.6).rotateX(Math.PI / 2)); }
    g.add(mesh(new THREE.CylinderGeometry(.4, .55, .5, 18), M.nozzle, 0, 0, -1.75).rotateX(Math.PI / 2));
    g.add(mesh(new THREE.SphereGeometry(.45, 18, 14), M.silverFoil, 0, 0, -1.2));
    g.scale.setScalar(9); g.userData.anchor = new THREE.Vector3(0, 0, 0);
    g.userData.anim = function (t) { g.rotation.set(1.25, 0.55 + Math.sin(t * .07) * .25, 0.15); g.position.x = g.userData.x0 + Math.sin(t * .05) * 120; }; return g;
  }

  /* ---------------- 7. AI data centre module ---------------- */
  function buildDataCentre() {
    var g = new THREE.Group();
    g.add(box(9, 2.8, 3.2, M.blanket, 0, 1.6, 0)); g.add(mesh(new THREE.BoxGeometry(9.2, .3, 3.4), M.anod, 0, .15, 0));
    for (var c = 0; c < 4; c++) g.add(mesh(new THREE.BoxGeometry(.25, .3, .25), M.steel, (c & 1 ? 4.3 : -4.3), .15, (c & 2 ? 1.5 : -1.5)));
    for (var r = -3; r <= 3; r++) g.add(mesh(new THREE.BoxGeometry(.06, 2.3, 3.5), M.rad, r * 1.25, 4.3, 0));
    g.add(mesh(new THREE.BoxGeometry(9.2, .14, .14), M.alu, 0, 3.1, 0)); g.add(mesh(new THREE.BoxGeometry(9.2, .14, .14), M.alu, 0, 5.45, 0));
    for (var p = -3; p <= 3; p++) { g.add(mesh(new THREE.CylinderGeometry(.045, .045, 3.4, 8), M.steel, p * 1.25 + .62, 3.25, 0).rotateX(Math.PI / 2)); }
    g.add(mesh(new THREE.BoxGeometry(5.0, 2.2, .06), M.cells, 0, 1.6, -1.64)); g.add(mesh(new THREE.BoxGeometry(2.6, 1.2, .04), M.anod, 2.6, 1.3, 1.63));
    for (var k = 0; k < 8; k++) g.add(mesh(new THREE.BoxGeometry(.08, .08, .08), (k % 5 === 4 ? M.red : M.glow), -3.8 + k * .5, 2.2, 1.66));
    g.add(mesh(new THREE.BoxGeometry(1.6, .02, .4), M.label, -2.2, 1.6, 1.62).rotateX(Math.PI / 2));
    g.add(box(1.4, 1.0, .9, M.gold, 3.8, .8, 2.2)); var u = rhu(.18, .9); u.rotation.z = Math.PI / 2; u.position.set(-3.8, .6, 2.2); g.add(u);
    var d = dish(.8, .2); d.position.set(-3.6, 3.4, 1.2); d.rotation.x = -.7; g.add(d); g.add(mesh(new THREE.CylinderGeometry(.07, .09, 1.2, 8), M.steel, -3.6, 3.1, 1.2));
    g.add(cable([[3.1, 1.0, 2.2], [2.0, 1.2, 1.9], [1.3, 1.4, 1.7]], .03, M.orange)); g.add(cable([[-3.2, .7, 2.2], [-2.4, 1.0, 1.9], [-2.0, 1.2, 1.7]], .025));
    g.add(mesh(new THREE.BoxGeometry(.3, .3, .3), M.black, 4.4, 3.0, -1.4)); g.add(mesh(new THREE.CylinderGeometry(.015, .015, 1.4, 6), M.steel, 4.4, 3.9, -1.4));
    g.userData.anchor = new THREE.Vector3(0, 6.6, 0); g.userData.anim = function (t) { d.rotation.y = Math.sin(t * .2) * .5; }; return g;
  }

  /* ---------------- environment map for reflections: 6 painted cube faces ---------------- */
  function makeEnv() {
    function face(kind) {
      var c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d');
      if (kind === 'up') { g.fillStyle = '#05070f'; g.fillRect(0, 0, 128, 128); }
      else if (kind === 'down') { g.fillStyle = '#6d6a65'; g.fillRect(0, 0, 128, 128); }
      else { var gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#05070f'); gr.addColorStop(.48, '#0b1020'); gr.addColorStop(.52, '#8a8782'); gr.addColorStop(1, '#5e5b57'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
      if (kind === 'sun') { var rg = g.createRadialGradient(80, 40, 2, 80, 40, 40); rg.addColorStop(0, 'rgba(255,250,235,1)'); rg.addColorStop(.25, 'rgba(255,240,210,.9)'); rg.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); }
      return c;
    }
    var cube = new THREE.CubeTexture([face('sun'), face('side'), face('up'), face('down'), face('side'), face('side')]);
    cube.encoding = THREE.sRGBEncoding; cube.needsUpdate = true; return cube;
  }

  window.OBHardware = {
    builders: function (renderer) {
      var env = makeEnv(); allMats.forEach(function (m) { m.envMap = env; m.envMapIntensity = .9; m.needsUpdate = true; });
      window.OBHardware.env = env;
      return { vsat: buildVSAT, night: buildNight, rover: buildRover, extract: buildExtractor, lander: buildLander, orbiter: buildOrbiter, datacentre: buildDataCentre };
    },
    materials: M
  };
})();
