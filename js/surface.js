/* ORBITBeyond India — scroll-driven lunar surface (Three.js r128)
   One continuous terrain strip (30 km x 12 km). Scrolling flies the camera along a path with six
   stops; each stop is a piece of outpost hardware with a hotspot that opens a detail drawer. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var wrap = document.getElementById('surface'); if (!wrap) return;
  var canvas = wrap.querySelector('canvas'), section = document.getElementById('surfaceSection');
  var isSmall = Math.min(innerWidth, innerHeight) < 700 || !window.matchMedia('(pointer:fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var WX = 30000, WZ = 12000, HMAX = 607, SEG_X = isSmall ? 512 : 1024, SEG_Z = isSmall ? 205 : 410;
  var SKY = 0x070c1a;

  /* ---------------- stations (draft specifications, to be confirmed by the company) ---------------- */
  var STATIONS = [
    { id: 'vsat', n: '01', tag: 'Power', title: 'Lunar Power · VSAT', pos: [-11000, 0, -250], agl: 0,
      short: 'A 6 to 10 kW vertical solar array that keeps the outpost powered through the long polar day.',
      body: 'VSAT is a deployable vertical solar array sized at 6 to 10 kW, built for the low sun angles of the lunar poles where a vertical panel catches light that a flat array would miss. Paired with radioisotope heater units and lunar batteries, it is the power backbone of every surface asset Orbit Beyond builds. Surface infrastructure needs kW-class power, and today only a handful of suppliers serve the surface.',
      specs: [['Output', '6 to 10 kW, vertical deployable array'], ['Night survival', 'Radioisotope heater units and lunar batteries'], ['Site', 'Polar, low sun-angle operation'], ['Role', 'Power for landers, rovers and surface payloads'], ['Future', 'Lunar power-as-a-service']], img: null, link: 'programmes.html#stack' },
    { id: 'night', n: '02', tag: 'Night survival', title: 'RHUs, Batteries & Stirling Night Unit', pos: [-7600, 0, 380], agl: 0,
      short: 'Keeps landers and surface assets alive through 14 Earth days of darkness below minus 170 °C.',
      body: 'Lunar missions stall at nightfall: roughly 14 Earth days of darkness below minus 170 °C, and few surface assets survive it today. Orbit Beyond\'s night-survival unit combines radioisotope heater units, lunar-rated batteries and a Stirling conversion stage with deployable radiators, so electronics, batteries and compute stay warm and powered until sunrise. Only about two suppliers serve this need on the surface.',
      specs: [['Night', 'About 354 hours of darkness'], ['Thermal', 'Radioisotope heater units (RHUs)'], ['Storage', 'Lunar batteries, cold-rated'], ['Conversion', 'Stirling stage with deployable radiators'], ['Thermal lead', 'Dr. Alok Srivastava']], img: null, link: 'programmes.html#stack' },
    { id: 'rover', n: '03', tag: 'Mobility', title: 'Long-Range Rover Platform', pos: [-4200, 0, -300], agl: 0,
      short: 'India-owned mobility IP: long-distance rovers with AI-based autonomous navigation.',
      body: 'Mining, prospecting and logistics on the Moon need rovers that travel long distances, and very few have been built. Orbit Beyond\'s rover platform is designed for site survey, prospecting and mining logistics with AI-based autonomous navigation, developed under India-owned IP. The first prototype will be field-tested on lunar-analogue terrain within 18 months of the GENESIS programme.',
      specs: [['Range', 'Long-distance traverse for prospecting and logistics'], ['Autonomy', 'AI-based autonomous navigation'], ['IP', 'Mobility platform owned in India'], ['Autonomy', 'Developed in-house on India-owned IP'], ['Milestone', 'Analogue-terrain prototype within 18 months']], img: 'assets/rover-color.jpg', link: 'programmes.html#stack' },
    { id: 'extract', n: '04', tag: 'Resources', title: 'Helium-3 Extraction', pos: [-800, 0, 420], agl: 0,
      short: 'Regolith processing and Helium-3 separation for quantum computing, medical imaging and fusion.',
      body: 'Helium-3 is scarce on Earth and demand from quantum computing, medical imaging and future fusion is already being contracted through offtake agreements worth hundreds of millions of dollars. Orbit Beyond is developing regolith processing and Helium-3 separation on India-owned IP, starting with an extraction and purification bench demonstrator, with surface units to follow.',
      specs: [['Process', 'Regolith heating and He-3 separation'], ['Demand', 'Quantum computing, medical, fusion'], ['IP', 'Extraction system owned in India'], ['Milestone', 'Bench demonstrator within 18 months'], ['Built', 'India']], img: null, link: 'programmes.html#stack' },
    { id: 'lander', n: '05', tag: 'Systems', title: 'OB1 Lunar Lander', pos: [3000, 0, -350], agl: 0,
      short: 'Full-system lander engineering under a ₹200 Cr programme, completion targeted for 2029.',
      body: 'OB1 is the lunar lander Orbit Beyond Private Limited engineers for its customer, Orbit Beyond, Inc. (USA). The company holds the full engineering scope: full-system design, payloads, integration and test, delivered milestone by milestone from system requirements review through preliminary and critical design, structures and integration. Ex-ISRO Chandrayaan leads head every subsystem, from the landing legs to propulsion, thermal, communications, guidance and power.',
      specs: [['Scope', 'Design, payloads, integration and test'], ['Milestones', 'SRR, PDR, CDR, structures, integration'], ['Completion', 'Targeted 2029'], ['Architect', 'Dr. M. Krishnaswamy, Chief Systems Engineer'], ['Structures', 'Dr. R.K. Srinivasan, Chandrayaan-2/3 landing legs']], img: 'assets/wp-legs.jpg', link: 'programmes.html#programme' },
    { id: 'orbiter', n: '06', tag: 'Systems', title: 'Communications Relay Orbiter', pos: [6800, 300, -900], agl: 300, sky: true,
      short: 'No lunar relay network exists today. The orbiter links landers and rovers back to Earth.',
      body: 'Surface assets on the far side, in craters and across the poles need a relay. Orbit Beyond is engineering a communications relay orbiter as part of its contracted programme. The same platform supports exploration payloads and, in later configurations, cislunar awareness and resource mapping.',
      specs: [['Role', 'Relay for landers, rovers and surface payloads'], ['Payloads', 'Relay, exploration and later awareness configurations'], ['Programme', 'Contracted scope for Orbit Beyond, Inc. (USA)'], ['Lead', 'Dr. Sambasiva Rao Venigalla, Communications'], ['Delivery', 'Orbiter testing FY28, delivery FY29']], img: 'assets/sat-color.jpg', link: 'programmes.html#programme' },
    { id: 'datacentre', n: '07', tag: 'Compute', title: 'AI Data Centre Prototype', pos: [10200, 0, -250], agl: 0,
      short: 'Radiation-tolerant AI compute on the surface, prototyped under the contracted programme.',
      body: 'A containerised compute module that runs AI inference, autonomy and sensor processing at the Moon instead of round-tripping data to Earth. The prototype is part of the ₹200 Cr programme with design reviews in FY27 and a demonstration targeted for FY29. Its processors are radiation-tolerant and thermally managed for the surface. Operated as LunarEdge.',
      specs: [['Workloads', 'AI inference, autonomy, sensor fusion'], ['Packaging', 'Radiation-tolerant 3D packaging'], ['Thermal', 'Radiator wall, night survival'], ['Milestone', 'Design reviews FY27, demo FY29'], ['Operator', 'LunarEdge']], img: 'assets/wp-compute.jpg', link: 'programmes.html#programme' }
  ];
  window.OB_STATIONS = STATIONS;

  /* ---------------- renderer, scene, lights ---------------- */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isSmall, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.25 : 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  var scene = new THREE.Scene(); scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 5000, 24000);
  var camera = new THREE.PerspectiveCamera(52, 1, 1, 90000);
  var SUN_DIR = new THREE.Vector3(0.82, 0.20, 0.42).normalize();          // low sun, long shadows
  var sun = new THREE.DirectionalLight(0xfff3e2, 2.1); sun.castShadow = true;
  sun.shadow.mapSize.set(isSmall ? 1024 : 2048, isSmall ? 1024 : 2048);
  var SH = isSmall ? 1200 : 1700; sun.shadow.camera.left = -SH; sun.shadow.camera.right = SH; sun.shadow.camera.top = SH; sun.shadow.camera.bottom = -SH;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 12000; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 3;
  scene.add(sun); scene.add(sun.target);
  scene.add(new THREE.HemisphereLight(0x27406e, 0x000000, 0.42));          // earthshine / sky bounce
  scene.add(new THREE.AmbientLight(0x1a2235, 0.6));

  /* ---------------- textures and terrain ---------------- */
  var manager = new THREE.LoadingManager(), loader = new THREE.TextureLoader(manager);
  var tex = function (p, srgb) { var t = loader.load(p); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding; return t; };
  var albedo = tex('assets/moon/albedo.jpg', true), normal = tex('assets/moon/normal.jpg'), height = tex('assets/moon/height.png'), detail = tex('assets/moon/detail.jpg');
  albedo.wrapS = albedo.wrapT = normal.wrapS = normal.wrapT = height.wrapS = height.wrapT = THREE.ClampToEdgeWrapping;
  var geo = new THREE.PlaneGeometry(WX, WZ, SEG_X, SEG_Z); geo.rotateX(-Math.PI / 2);
  var mat = new THREE.MeshStandardMaterial({ map: albedo, normalMap: normal, normalScale: new THREE.Vector2(1.1, 1.1), displacementMap: height, displacementScale: HMAX, roughness: 0.97, metalness: 0, color: 0xc6c2ba });
  mat.onBeforeCompile = function (sh) {
    sh.uniforms.detailMap = { value: detail }; sh.uniforms.detailRepeat = { value: new THREE.Vector2(140, 56) }; sh.uniforms.detailScale = { value: 0.9 };
    sh.fragmentShader = 'uniform sampler2D detailMap; uniform vec2 detailRepeat; uniform float detailScale;\n' + sh.fragmentShader.replace('#include <normal_fragment_maps>',
      'vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0; mapN.xy *= normalScale;\n' +
      'vec3 dN = texture2D( detailMap, vUv * detailRepeat ).xyz * 2.0 - 1.0; dN.xy *= detailScale;\n' +
      'vec3 dN2 = texture2D( detailMap, vUv * detailRepeat * 4.1 + 0.37 ).xyz * 2.0 - 1.0; dN2.xy *= detailScale * 0.5;\n' +
      'mapN = normalize( vec3( mapN.xy + dN.xy + dN2.xy, mapN.z ) );\n' +
      'normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );');
  };
  var terrain = new THREE.Mesh(geo, mat); terrain.castShadow = true; terrain.receiveShadow = true; scene.add(terrain);
  // horizon skirt: a vast dark plane so the strip never ends against black
  var skirt = new THREE.Mesh(new THREE.CircleGeometry(90000, 64), new THREE.MeshStandardMaterial({ color: 0x8d8982, roughness: 1 }));
  skirt.rotation.x = -Math.PI / 2; skirt.position.y = 70; scene.add(skirt);

  /* height sampling (reads the displacement map through a canvas, approximating the mesh) */
  var hData = null, hW = 0, hH = 0;
  var hImg = new Image(); hImg.onload = function () { var c = document.createElement('canvas'); c.width = hImg.width; c.height = hImg.height; var g = c.getContext('2d'); g.drawImage(hImg, 0, 0); hData = g.getImageData(0, 0, c.width, c.height).data; hW = c.width; hH = c.height; placeAll(); }; hImg.src = 'assets/moon/height.png';
  function hAt(u, v) { if (!hData) return 0; var x = Math.max(0, Math.min(hW - 1.001, u * (hW - 1))), y = Math.max(0, Math.min(hH - 1.001, v * (hH - 1))); var x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0; var p = function (xx, yy) { return hData[(yy * hW + xx) * 4]; }; return ((p(x0, y0) * (1 - fx) + p(x0 + 1, y0) * fx) * (1 - fy) + (p(x0, y0 + 1) * (1 - fx) + p(x0 + 1, y0 + 1) * fx) * fy) / 255 * HMAX; }
  function ground(x, z) { // bilinear between the mesh vertices nearest to (x,z)
    var gx = (x / WX + .5) * SEG_X, gz = (z / WZ + .5) * SEG_Z, x0 = Math.floor(gx), z0 = Math.floor(gz), fx = gx - x0, fz = gz - z0;
    var v = function (i, j) { return hAt(i / SEG_X, j / SEG_Z); };
    return (v(x0, z0) * (1 - fx) + v(x0 + 1, z0) * fx) * (1 - fz) + (v(x0, z0 + 1) * (1 - fx) + v(x0 + 1, z0 + 1) * fx) * fz;
  }

  /* ---------------- sky: stars, Earth, sun glare ---------------- */
  var sg = new THREE.BufferGeometry(), N = 3500, sp = new Float32Array(N * 3), sc = new Float32Array(N * 3), col = new THREE.Color();
  for (var i = 0; i < N; i++) { var th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1), r = 60000; sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = Math.abs(r * Math.cos(ph)) + 200; sp[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th); var hue = Math.random(); col.setHSL(hue < .25 ? .08 : hue < .4 ? .6 : .12, .5, .7 + Math.random() * .3); sc[i * 3] = col.r; sc[i * 3 + 1] = col.g; sc[i * 3 + 2] = col.b; }
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  var stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 140, vertexColors: true, fog: false, transparent: true, opacity: .95, sizeAttenuation: true })); scene.add(stars);
  var earth = new THREE.Group(); var EARTH_D = 52000;
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(950, 48, 32), new THREE.MeshStandardMaterial({ color: 0x3a7bdc, emissive: 0x0b2a6a, emissiveIntensity: .55, roughness: .7, fog: false })));
  var eg = new THREE.Mesh(new THREE.SphereGeometry(1250, 32, 24), new THREE.MeshBasicMaterial({ color: 0x8fb6ff, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); earth.add(eg);
  earth.position.set(-0.35 * EARTH_D, 0.16 * EARTH_D, -0.92 * EARTH_D); scene.add(earth);
  var glareCanvas = document.createElement('canvas'); glareCanvas.width = glareCanvas.height = 256; var gctx = glareCanvas.getContext('2d'); var grd = gctx.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, 'rgba(255,245,225,1)'); grd.addColorStop(.12, 'rgba(255,235,200,.9)'); grd.addColorStop(.35, 'rgba(242,163,58,.25)'); grd.addColorStop(1, 'rgba(242,163,58,0)'); gctx.fillStyle = grd; gctx.fillRect(0, 0, 256, 256);
  var glare = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glareCanvas), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false })); glare.scale.set(9000, 9000, 1); scene.add(glare);

  /* ---------------- hardware models (built from primitives) ---------------- */
  var M = {
    white: new THREE.MeshStandardMaterial({ color: 0xe9ecf2, roughness: .55, metalness: .1 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: .3, metalness: .85, flatShading: true }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a2742, roughness: .5, metalness: .5 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb8bcc8, roughness: .35, metalness: .9 }),
    panel: new THREE.MeshStandardMaterial({ color: 0x15305e, roughness: .3, metalness: .4, emissive: 0x0b2a6a, emissiveIntensity: .3 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xf2a33a, roughness: .5, metalness: .2 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x5fb8c9, emissive: 0x5fb8c9, emissiveIntensity: 1.2 }),
    rad: new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: .9, metalness: 0, side: THREE.DoubleSide })
  };
  function mesh(g, m, x, y, z) { var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true; return o; }
  function dish(r) { var d = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4), M.rad); d.castShadow = true; return d; }

  function buildVSAT() {
    // vertical solar array: tall mast with two panel wings, RHU/battery pallet at the base
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(3.4, .35, 3.4), M.dark, 0, .18, 0));
    for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2 + Math.PI / 4; g.add(mesh(new THREE.CylinderGeometry(.22, .3, .3, 10), M.gold, Math.cos(a) * 2.0, .15, Math.sin(a) * 2.0)); g.add(mesh(new THREE.CylinderGeometry(.05, .06, 2.2, 8), M.steel, Math.cos(a) * 1.2, 1.1, Math.sin(a) * 1.2).rotateZ(0)); }
    g.add(mesh(new THREE.CylinderGeometry(.16, .22, 9.5, 12), M.steel, 0, 5.0, 0));
    var wings = new THREE.Group(); wings.position.y = 5.6; g.add(wings);
    for (var s = -1; s <= 1; s += 2) {
      wings.add(mesh(new THREE.BoxGeometry(3.6, 7.6, .06), M.panel, s * 2.0, 0, 0));
      wings.add(mesh(new THREE.BoxGeometry(3.7, .08, .14), M.steel, s * 2.0, 3.85, 0)); wings.add(mesh(new THREE.BoxGeometry(3.7, .08, .14), M.steel, s * 2.0, -3.85, 0));
      for (var r = -3; r <= 3; r++) wings.add(mesh(new THREE.BoxGeometry(3.6, .02, .08), M.dark, s * 2.0, r * 1.05, .04));
    }
    g.add(mesh(new THREE.CylinderGeometry(.5, .5, .5, 16), M.gold, 0, 9.9, 0));
    var rhu = mesh(new THREE.BoxGeometry(1.4, .9, .9), M.white, 2.1, .8, 1.3); g.add(rhu); g.add(mesh(new THREE.BoxGeometry(1.5, .06, 1.0), M.orange, 2.1, 1.28, 1.3));
    g.add(mesh(new THREE.BoxGeometry(1.6, .7, .8), M.gold, -2.0, .7, -1.2)); g.add(mesh(new THREE.BoxGeometry(.1, .1, .1), M.glow, -1.2, 1.0, -1.2));
    g.userData.anim = function (t) { wings.rotation.y = Math.sin(t * .05) * .35 + .4; };
    g.userData.anchor = new THREE.Vector3(0, 10.8, 0); return g;
  }
  function buildRover() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(2.6, .7, 1.7), M.gold, 0, 1.0, 0)); g.add(mesh(new THREE.BoxGeometry(2.9, .05, 1.9), M.panel, 0, 1.38, 0));
    var wheels = [];
    for (var s = -1; s <= 1; s += 2) for (var i = -1; i <= 1; i++) { var w = mesh(new THREE.CylinderGeometry(.42, .42, .32, 18), M.steel, i * 1.05, .42, s * 1.05); w.rotation.x = Math.PI / 2; g.add(w); wheels.push(w); g.add(mesh(new THREE.BoxGeometry(.12, .5, .12), M.dark, i * 1.05, .75, s * .85)); }
    g.add(mesh(new THREE.CylinderGeometry(.05, .05, 1.4, 8), M.steel, .9, 2.1, -.4)); g.add(mesh(new THREE.BoxGeometry(.5, .25, .22), M.white, .9, 2.85, -.4)); g.add(mesh(new THREE.BoxGeometry(.08, .08, .08), M.glow, .9, 2.85, -.27));
    g.add(mesh(new THREE.BoxGeometry(.6, .4, .5), M.white, -1.0, 1.6, .4)); var d = dish(.35); d.rotation.x = Math.PI * .7; d.position.set(-1.0, 2.0, .4); g.add(d);
    g.add(mesh(new THREE.BoxGeometry(.9, .14, .14), M.steel, 1.5, 1.15, .5).rotateZ(-.5)); g.add(mesh(new THREE.BoxGeometry(.3, .3, .3), M.dark, 1.95, .75, .5));
    g.userData.anim = function (t) { var v = (Math.sin(t * .35) + 1) * .5; wheels.forEach(function (w) { w.rotation.y += v * .04; }); g.position.x = g.userData.x0 + Math.sin(t * .35) * 6; g.rotation.y = Math.cos(t * .35) * .1; };
    g.userData.anchor = new THREE.Vector3(0, 3.6, 0); return g;
  }
  function buildLander() {
    var g = window.OBLander ? OBLander.build() : new THREE.Group(); g.scale.setScalar(2.8); g.position.y = 2.98;
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    var w = new THREE.Group(); w.add(g); w.userData.anchor = new THREE.Vector3(0, 6.2, 0);
    w.userData.anim = function (t) { if (g.parts && g.parts.antenna) g.parts.antenna.rotation.y = t * .2; }; return w;
  }
  function buildOrbiter() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(2.2, 2.2, 2.6), M.gold)); g.add(mesh(new THREE.BoxGeometry(2.3, 2.3, .12), M.dark, 0, 0, 1.3));
    for (var s = -1; s <= 1; s += 2) { g.add(mesh(new THREE.BoxGeometry(7.5, 2.0, .06), M.panel, s * 5.1, 0, 0)); g.add(mesh(new THREE.CylinderGeometry(.08, .08, 1.6, 6), M.steel, s * 1.9, 0, 0).rotateZ(Math.PI / 2)); }
    var d = dish(1.1); d.rotation.x = -Math.PI / 2; d.position.set(0, -1.6, .4); g.add(d);
    g.add(mesh(new THREE.CylinderGeometry(.05, .05, 2.4, 6), M.steel, 0, 2.3, -.6)); g.add(mesh(new THREE.SphereGeometry(.12, 8, 8), M.glow, 0, 3.5, -.6));
    g.add(mesh(new THREE.CylinderGeometry(.5, .7, .6, 16), M.steel, 0, 0, -1.6).rotateX(Math.PI / 2));
    g.scale.setScalar(9); g.userData.anchor = new THREE.Vector3(0, 0, 0);
    g.userData.anim = function (t, k) { g.rotation.y = t * .08; g.rotation.z = .3; g.position.x = g.userData.x0 + Math.sin(t * .05) * 120; }; return g;
  }
  function buildNight() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(5, .4, 3), M.dark, 0, .2, 0)); g.add(mesh(new THREE.CylinderGeometry(.9, .9, 3.2, 20), M.white, 0, 1.4, 0).rotateZ(Math.PI / 2));
    for (var i = 0; i < 9; i++) g.add(mesh(new THREE.BoxGeometry(.06, 2.6, 2.4), M.rad, -3.2 - i * .32, 1.9, 0));
    g.add(mesh(new THREE.BoxGeometry(3.2, .3, .3), M.steel, -4.4, 3.3, 0)); g.add(mesh(new THREE.BoxGeometry(3.2, .3, .3), M.steel, -4.4, .5, 0));
    g.add(mesh(new THREE.CylinderGeometry(.5, .5, 1.4, 16), M.gold, 2.3, 1.4, 0).rotateZ(Math.PI / 2)); g.add(mesh(new THREE.TorusGeometry(.95, .07, 8, 32), M.orange, .6, 1.4, 0).rotateY(Math.PI / 2)); g.add(mesh(new THREE.TorusGeometry(.95, .07, 8, 32), M.orange, -.6, 1.4, 0).rotateY(Math.PI / 2));
    var c = dish(1.8); c.rotation.x = Math.PI * .9; c.position.set(2.2, 4.4, 0); g.add(c); g.add(mesh(new THREE.CylinderGeometry(.1, .12, 2.6, 8), M.steel, 2.2, 2.9, 0));
    g.add(mesh(new THREE.BoxGeometry(.12, .12, .12), M.glow, 2.9, 2.0, 1.2));
    g.userData.anchor = new THREE.Vector3(0, 6.2, 0); g.userData.anim = function (t) { c.rotation.y = t * .05; }; return g;
  }
  function buildExtractor() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(5.2, 1.0, 3.0), M.gold, 0, 1.1, 0)); g.add(mesh(new THREE.BoxGeometry(5.4, .06, 3.2), M.panel, 0, 1.64, 0));
    for (var s = -1; s <= 1; s += 2) { g.add(mesh(new THREE.BoxGeometry(5.6, 1.0, .7), M.dark, 0, .5, s * 1.75)); for (var w = -2; w <= 2; w++) g.add(mesh(new THREE.CylinderGeometry(.42, .42, .5, 14), M.steel, w * 1.25, .5, s * 2.15).rotateX(Math.PI / 2)); }
    var boom = new THREE.Group(); boom.position.set(2.2, 1.8, 0); g.add(boom);
    boom.add(mesh(new THREE.BoxGeometry(.4, .4, 4.2), M.steel, 0, 1.6, 0).rotateX(.55));
    var auger = new THREE.Group(); auger.position.set(0, .2, 1.9); boom.add(auger);
    auger.add(mesh(new THREE.CylinderGeometry(.12, .12, 4.0, 8), M.steel, 0, -1.2, 0)); for (var i = 0; i < 10; i++) auger.add(mesh(new THREE.TorusGeometry(.32, .04, 6, 16), M.orange, 0, .4 - i * .38, 0).rotateX(Math.PI / 2 + .25));
    g.add(mesh(new THREE.CylinderGeometry(1.0, .5, 1.6, 6), M.white, -1.4, 2.6, 0)); g.add(mesh(new THREE.CylinderGeometry(.4, .4, .6, 12), M.dark, -1.4, 3.6, 0));
    g.add(mesh(new THREE.BoxGeometry(1.4, .9, .6), M.white, 1.4, 2.1, -1.2)); g.add(mesh(new THREE.BoxGeometry(.1, .1, .1), M.glow, 2.1, 2.3, -1.5));
    g.userData.anchor = new THREE.Vector3(0, 5.4, 0); g.userData.anim = function (t) { auger.rotation.y = t * 3; boom.rotation.y = Math.sin(t * .3) * .15; }; return g;
  }
  function buildDataCentre() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(9, 2.8, 3.2), M.white, 0, 1.6, 0)); g.add(mesh(new THREE.BoxGeometry(9.1, .25, 3.3), M.dark, 0, .15, 0));
    for (var i = -3; i <= 3; i++) g.add(mesh(new THREE.BoxGeometry(.06, 2.2, 3.4), M.rad, i * 1.3, 4.3, 0));
    g.add(mesh(new THREE.BoxGeometry(9.2, .2, .2), M.steel, 0, 3.1, 0)); g.add(mesh(new THREE.BoxGeometry(9.2, .2, .2), M.steel, 0, 5.4, 0));
    for (var k = 0; k < 6; k++) g.add(mesh(new THREE.BoxGeometry(.1, .1, .1), M.glow, -3.4 + k * 1.36, 2.4, 1.66));
    g.add(mesh(new THREE.BoxGeometry(4.2, 2.4, .08), M.panel, 0, 1.6, -1.7)); g.add(mesh(new THREE.BoxGeometry(1.2, 1.0, .5), M.gold, 3.6, .8, 1.9));
    var d = dish(.9); d.rotation.x = Math.PI * .7; d.position.set(-3.6, 3.6, 1.2); g.add(d); g.add(mesh(new THREE.CylinderGeometry(.06, .06, 1.2, 6), M.steel, -3.6, 3.1, 1.2));
    g.userData.anchor = new THREE.Vector3(0, 6.6, 0); g.userData.anim = function (t) { d.rotation.y = Math.sin(t * .2) * .5; }; return g;
  }
  var builders = { vsat: buildVSAT, night: buildNight, rover: buildRover, extract: buildExtractor, lander: buildLander, orbiter: buildOrbiter, datacentre: buildDataCentre };
  var objects = {};
  STATIONS.forEach(function (s) { var o = builders[s.id](); o.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); o.position.set(s.pos[0], s.pos[1], s.pos[2]); o.userData.x0 = s.pos[0]; scene.add(o); objects[s.id] = o; });
  // a few boulders around the sites
  var rocks = new THREE.Group(); scene.add(rocks); var rockMat = new THREE.MeshStandardMaterial({ color: 0x5e5a55, roughness: 1, flatShading: true });
  function rockGeo() { var g = new THREE.DodecahedronGeometry(1, 1), pa = g.attributes.position; for (var i = 0; i < pa.count; i++) { var k = .75 + Math.random() * .5; pa.setXYZ(i, pa.getX(i) * k, pa.getY(i) * (k * .8), pa.getZ(i) * k); } g.computeVertexNormals(); return g; }
  var rockGeos = [rockGeo(), rockGeo(), rockGeo(), rockGeo(), rockGeo()];
  var rockList = [];
  STATIONS.forEach(function (s) { if (s.sky) return; for (var i = 0; i < 70; i++) { var r = mesh(rockGeos[i % 5], rockMat); var a = Math.random() * Math.PI * 2, d = 6 + Math.pow(Math.random(), .6) * 90; r.position.set(s.pos[0] + Math.cos(a) * d, 0, s.pos[2] + Math.sin(a) * d); var sc = .12 + Math.pow(Math.random(), 2.2) * 1.3; r.scale.set(sc, sc * (.55 + Math.random() * .5), sc); r.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); rocks.add(r); rockList.push(r); } });
  function placeAll() {
    STATIONS.forEach(function (s) { var o = objects[s.id]; o.position.y = ground(s.pos[0], s.pos[2]) + (s.sky ? s.agl : .1); s.gy = o.position.y; });
    rockList.forEach(function (r) { r.position.y = ground(r.position.x, r.position.z) - r.scale.y * .35; });
    buildPath();
  }

  /* ---------------- camera path ---------------- */
  // Each station gets an arrival key and a hold key ~35 m from the hardware on the sunlit side;
  // between stations the camera cruises at altitude. Ground clearance is enforced at runtime.
  var KEYS = [];
  function K(p, pos, look, stop) { KEYS.push({ p: p, pos: new THREE.Vector3(pos[0], pos[1], pos[2]), look: new THREE.Vector3(look[0], look[1], look[2]), stop: !!stop }); }
  var OFFS = { vsat: [34, 7, 30], night: [25, 6, 21], rover: [26, 6, 22], extract: [31, 7.5, -24], lander: [34, 9, -27], orbiter: [90, 0, 420], datacentre: [36, 8, 28] };
  var WIN = (function () { var n = STATIONS.length, out = [], a = .10, b = .90, w = (b - a) / n; for (var i = 0; i < n; i++) out.push([a + i * w, a + (i + 1) * w]); return out; })();
  function buildPath() {
    KEYS.length = 0;
    var g = function (x, z) { return ground(x, z); };
    K(0.00, [-16000, g(-16000, 2600) + 2600, 2600], [-9500, 100, 0], true);
    K(0.06, [-13000, g(-13000, 1100) + 380, 1100], [-11000, 60, -250], false);
    var prev = null;
    STATIONS.forEach(function (s, i) {
      var o = objects[s.id], P = o.position, off = OFFS[s.id], w = WIN[i];
      var cam = [P.x + off[0], (s.sky ? g(P.x + off[0], P.z + off[2]) + 8 : P.y + off[1]), P.z + off[2]];
      var look = [P.x, P.y + (s.sky ? 0 : 3), P.z];
      if (prev) { // cruise key between the previous hold and this arrival
        var mx = (prev[0] + cam[0]) / 2, mz = (prev[2] + cam[2]) / 2 + 260;
        K(w[0] - .005, [mx, g(mx, mz) + 140, mz], [cam[0] + 200, cam[1] + 10, cam[2]], false);
      }
      K(w[0] + .03, cam, look, true);
      K(w[1] - .03, [cam[0] + off[0] * .08, cam[1] + .6, cam[2] + off[2] * .08], look, true);
      prev = cam;
    });
    K(0.93, [11800, g(11800, 900) + 650, 900], [14500, 300, -1200], false);
    K(1.00, [12600, g(12600, 2800) + 4200, 2800], [-20000, 9000, -50000], true);
  }
  buildPath();
  function ease(t, a, b) { // a,b: whether start/end keys are stops
    if (a && b) return t * t * (3 - 2 * t);
    if (a) return t * t;                 // accelerate out of a stop
    if (b) return 1 - (1 - t) * (1 - t); // decelerate into a stop
    return t;
  }
  var camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function evalPath(p) {
    for (var i = 0; i < KEYS.length - 1; i++) { var a = KEYS[i], b = KEYS[i + 1]; if (p <= b.p || i === KEYS.length - 2) { var t = ease(Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p))), a.stop, b.stop); camPos.copy(a.pos).lerp(b.pos, t); camLook.copy(a.look).lerp(b.look, t); break; } }
    var gy = ground(camPos.x, camPos.z) + 4.5; if (camPos.y < gy) camPos.y = gy;
  }

  /* ---------------- scroll, hotspots, UI ---------------- */
  var progress = 0, target = 0, hotEls = {}, captionEl = document.getElementById('stationCaption'), heroEl = document.getElementById('surfaceHero'), endEl = document.getElementById('surfaceEnd'), progEl = document.getElementById('surfaceProgress');
  STATIONS.forEach(function (s, i) { var h = document.createElement('button'); h.className = 'shot'; h.innerHTML = '<span class="shot-n">' + s.n + '</span><span class="shot-t">' + s.title + '</span>'; h.setAttribute('aria-label', s.title); h.addEventListener('click', function () { openStation(s.id); }); wrap.appendChild(h); hotEls[s.id] = h; });
  var windows = WIN;
  function stationAt(p) { for (var i = 0; i < windows.length; i++) if (p >= windows[i][0] && p < windows[i][1]) return i; return -1; }
  var lastStation = -2;
  function updateUI(p) {
    var si = stationAt(p);
    if (heroEl) heroEl.style.opacity = Math.max(0, 1 - p / .07); if (heroEl) heroEl.style.pointerEvents = p < .07 ? 'auto' : 'none';
    if (endEl) { var e = Math.max(0, (p - .9) / .08); endEl.style.opacity = e; endEl.style.pointerEvents = e > .5 ? 'auto' : 'none'; }
    if (progEl) progEl.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    if (si !== lastStation) {
      lastStation = si;
      if (si >= 0) { var s = STATIONS[si]; captionEl.innerHTML = '<div class="sc-k">' + s.n + ' / 0' + STATIONS.length + ' · ' + s.tag + '</div><h3>' + s.title + '</h3><p>' + s.short + '</p><button class="btn" onclick="openStation(\'' + s.id + '\')">Open details <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>'; captionEl.classList.add('on'); }
      else captionEl.classList.remove('on');
      document.querySelectorAll('.sdot').forEach(function (d, i) { d.classList.toggle('on', i === si); });
    }
  }
  var panel = document.getElementById('stationPanel');
  window.openStation = function (id) {
    var s = STATIONS.filter(function (x) { return x.id === id; })[0]; if (!s || !panel) return;
    panel.querySelector('.sp-k').textContent = s.n + ' / 0' + STATIONS.length + ' · ' + s.tag; panel.querySelector('.sp-t').textContent = s.title; panel.querySelector('.sp-b').textContent = s.body;
    panel.querySelector('.sp-specs').innerHTML = s.specs.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');
    var im = panel.querySelector('.sp-img'); if (s.img) { im.src = s.img; im.style.display = ''; } else { im.style.display = 'none'; }
    panel.querySelector('.sp-link').href = s.link; panel.classList.add('open'); document.body.classList.add('panel-open');
  };
  window.closeStation = function () { if (panel) { panel.classList.remove('open'); document.body.classList.remove('panel-open'); } };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeStation(); });
  document.querySelectorAll('.sdot').forEach(function (d, i) { d.addEventListener('click', function () { var mid = (windows[i][0] + windows[i][1]) / 2 + .02; window.scrollTo({ top: section.offsetTop + mid * (section.offsetHeight - innerHeight), behavior: 'smooth' }); }); });

  function readScroll() { var r = section.getBoundingClientRect(), h = section.offsetHeight - innerHeight; target = Math.max(0, Math.min(1, -r.top / h)); }
  window.addEventListener('scroll', readScroll, { passive: true }); readScroll();
  function resize() { var w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', function () { resize(); readScroll(); });

  var visible = true; new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(section);
  var loaded = false; manager.onLoad = function () { loaded = true; wrap.classList.add('ready'); };
  var clock = new THREE.Clock(), proj = new THREE.Vector3(), mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });

  function frame() {
    requestAnimationFrame(frame); if (!visible) return;
    var dt = clock.getDelta(), t = clock.getElapsedTime();
    progress += (target - progress) * (reduce ? 1 : 1 - Math.exp(-dt * 5.5)); if (Math.abs(target - progress) < .0002) progress = target;
    evalPath(progress);
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    camera.position.copy(camPos);
    tmpA.copy(camLook); var look = tmpA; var dir = tmpB.copy(look).sub(camPos); var side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    look.add(side.multiplyScalar(mx * dir.length() * .08)); look.y -= my * dir.length() * .05;
    camera.lookAt(look);
    // sun and shadow follow the camera focus
    var focus = new THREE.Vector3().copy(camPos).lerp(look, .35); sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(SUN_DIR, 6000); sun.target.updateMatrixWorld();
    glare.position.copy(camera.position).addScaledVector(SUN_DIR, 50000);
    stars.position.copy(camera.position); earth.position.copy(camera.position).add(new THREE.Vector3(-0.35 * EARTH_D, 0.16 * EARTH_D, -0.92 * EARTH_D));
    STATIONS.forEach(function (s) { var o = objects[s.id]; if (o.userData.anim) o.userData.anim(t); });
    // hotspots
    var si = stationAt(progress), W = wrap.clientWidth, H = wrap.clientHeight;
    STATIONS.forEach(function (s, i) {
      var o = objects[s.id], el = hotEls[s.id]; if (Math.abs(i - si) > 0) { el.classList.remove('on'); return; }
      proj.copy(o.userData.anchor || new THREE.Vector3()).applyMatrix4(o.matrixWorld); proj.project(camera);
      var inFront = proj.z < 1; el.classList.toggle('on', inFront); el.style.left = ((proj.x * .5 + .5) * W) + 'px'; el.style.top = ((-proj.y * .5 + .5) * H) + 'px';
    });
    updateUI(progress);
    renderer.render(scene, camera);
  }
  frame();
})();
