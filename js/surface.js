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
    { id: 'vsat', n: '01', tag: 'Communications', title: 'Lunar VSAT Terminal', pos: [-10500, 0, -250], agl: 0,
      short: 'High-gain terminal linking landers, rovers and the lunar 5G relay back to Bhubaneswar Mission Control.',
      body: 'A deployable very-small-aperture terminal that gives every surface asset a direct Earth link and a path into the lunar 5G relay developed with Tejas Networks. It is the ground segment of the outpost: tracking, link budget and scheduling are run from Bhubaneswar.',
      specs: [['Dish', '1.2 m deployable, 2-axis tracking'], ['Bands', 'S and Ka (draft)'], ['Downlink', 'up to 100 Mbps (draft)'], ['Network', 'Lunar 5G relay · Tejas Networks'], ['Control', 'Bhubaneswar Mission Control']], img: 'assets/wp-control.jpg', link: 'programmes.html#wp05' },
    { id: 'lander', n: '02', tag: 'Transportation', title: 'OB-1 Lunar Lander', pos: [-6500, 0, 350], agl: 0,
      short: 'Precision south-polar delivery. Landing legs and energy absorbers machined in Odisha.',
      body: 'OB-1 is the group\'s lander for NASA CLPS and commercial customers, delivering up to 1,000 kg to the lunar south pole. The India centre holds design authority for the landing gear, shock attenuation and crushable energy absorbers, built on CTTC Bhubaneswar\'s ISRO-qualified precision base.',
      specs: [['Payload', 'up to 1,000 kg to the south pole'], ['Landing gear', '4 deployable legs, crushable absorbers'], ['GNC lineage', 'ISRO · NASA Marshall · SpaceIL Beresheet'], ['First mission', '2029'], ['Built', 'Bhubaneswar · CTTC']], img: 'assets/wp-legs.jpg', link: 'programmes.html#wp01' },
    { id: 'orbiter', n: '03', tag: 'Satellites', title: 'Relay & Awareness Orbiter', pos: [-2500, 300, -900], agl: 300, sky: true,
      short: 'One common bus, three product lines: lunar 5G relay, cislunar awareness and resource mapping.',
      body: 'A small satellite platform built in India on one common bus and sold in three configurations: a lunar 5G communications relay, a cislunar space-domain-awareness spacecraft at L1/L2 for the US Space Force, and a resource-mapping orbiter for India\'s mineral State. Export revenue from the first unit.',
      specs: [['Platform', 'Common small-sat bus'], ['Lines', 'Comms relay · Cislunar awareness · Resource mapping'], ['Orbits', 'Lunar polar · Earth-Moon L1/L2'], ['Customers', 'USSF · group missions · commercial'], ['Built', 'Phase II production line']], img: 'assets/sat-color.jpg', link: 'programmes.html#wp03' },
    { id: 'stirling', n: '04', tag: 'Power', title: 'Stirling Night-Power Generator', pos: [1500, 0, -300], agl: 0,
      short: 'Keeps the outpost alive through the 354-hour lunar night.',
      body: 'A free-piston Stirling converter with a deployable radiator, sized to keep electronics, batteries and compute warm and powered through fourteen days of darkness. It is the enabling unit behind the 14-day lunar night survival capability developed with Tec-Masters.',
      specs: [['Cycle', 'Free-piston Stirling converter'], ['Night', '354 h continuous operation'], ['Output', 'kW-class (draft)'], ['Heat rejection', 'Deployable radiator panels'], ['Partner', 'Tec-Masters night survival']], img: null, link: 'programmes.html' },
    { id: 'extract', n: '05', tag: 'Resources', title: 'Regolith Extraction Unit', pos: [5500, 0, 450], agl: 0,
      short: 'Auger drill and hopper for volatiles and Helium-3 bearing regolith.',
      body: 'A tracked excavation and extraction demonstrator: an auger drill brings regolith into a heated hopper where volatiles and Helium-3 are released and captured. It is the surface end of the group\'s lunar resource-return logistics and the proving ground for serial resource hardware built in Odisha.',
      specs: [['Drill', 'Auger, 1 to 2 m depth (draft)'], ['Process', 'Thermal release of volatiles'], ['Target', 'Water ice · Helium-3 bearing regolith'], ['Mobility', 'Tracked base, rover-derived drive'], ['Built', 'Odisha production line']], img: 'assets/rover-color.jpg', link: 'programmes.html#wp02' },
    { id: 'datacentre', n: '06', tag: 'Compute', title: 'LunarEdge AI Data Centre', pos: [9500, 0, -250], agl: 0,
      short: 'Radiation-tolerant AI compute on the surface, packaged in Odisha.',
      body: 'A containerised compute module that runs AI inference, autonomy and sensor processing at the Moon instead of round-tripping data to Earth. Its radiation-tolerant, thermally managed processors are an advanced-packaging problem, aligned with the 3D packaging facility at Info Valley, Khordha. Operated as LunarEdge.',
      specs: [['Workloads', 'AI inference · autonomy · sensor fusion'], ['Packaging', 'Radiation-tolerant 3D packaging'], ['Thermal', 'Radiator wall · night survival'], ['Ecosystem', 'Info Valley, Khordha'], ['Operator', 'LunarEdge']], img: 'assets/wp-compute.jpg', link: 'programmes.html#wp04' }
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
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) { var a = i * Math.PI * 2 / 3, leg = mesh(new THREE.CylinderGeometry(.06, .08, 3.2, 8), M.steel, Math.cos(a) * 1.3, 1.5, Math.sin(a) * 1.3); leg.lookAt(new THREE.Vector3(0, 3.1, 0)); leg.rotateX(Math.PI / 2); g.add(leg); g.add(mesh(new THREE.CylinderGeometry(.3, .35, .15, 10), M.gold, Math.cos(a) * 1.35, .05, Math.sin(a) * 1.35)); }
    g.add(mesh(new THREE.CylinderGeometry(.25, .25, .6, 12), M.dark, 0, 3.2, 0));
    var head = new THREE.Group(); head.position.y = 3.6; g.add(head);
    var d = dish(1.6); d.rotation.x = Math.PI * .62; d.position.y = .4; head.add(d);
    head.add(mesh(new THREE.CylinderGeometry(.04, .04, 1.9, 6), M.steel, 0, .9, -.9)); head.add(mesh(new THREE.ConeGeometry(.14, .3, 10), M.white, 0, 1.3, -1.6));
    var box = mesh(new THREE.BoxGeometry(1.6, .9, .8), M.gold, 2.6, .5, 0); g.add(box); g.add(mesh(new THREE.BoxGeometry(1.7, .04, .9), M.panel, 2.6, .97, 0));
    g.add(mesh(new THREE.BoxGeometry(.08, .08, .08), M.glow, 1.9, .8, .3));
    g.userData.anim = function (t) { head.rotation.y = Math.sin(t * .15) * .4; d.rotation.x = Math.PI * .62 + Math.sin(t * .1) * .08; };
    g.userData.anchor = new THREE.Vector3(0, 5.0, 0); return g;
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
    g.userData.anim = function (t, k) { g.rotation.y = t * .08; g.rotation.z = .3; g.position.x = -2500 + Math.sin(t * .05) * 120; }; return g;
  }
  function buildStirling() {
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
  var builders = { vsat: buildVSAT, lander: buildLander, orbiter: buildOrbiter, stirling: buildStirling, extract: buildExtractor, datacentre: buildDataCentre };
  var objects = {};
  STATIONS.forEach(function (s) { var o = builders[s.id](); o.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); o.position.set(s.pos[0], s.pos[1], s.pos[2]); scene.add(o); objects[s.id] = o; });
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
  var OFFS = { vsat: [27, 6.5, 23], lander: [34, 9, -27], orbiter: [90, 0, 420], stirling: [25, 6, 21], extract: [31, 7.5, -24], datacentre: [36, 8, 28] };
  var WIN = [[.11, .24], [.24, .37], [.37, .50], [.50, .63], [.63, .76], [.76, .89]];
  function buildPath() {
    KEYS.length = 0;
    var g = function (x, z) { return ground(x, z); };
    K(0.00, [-16000, g(-16000, 2600) + 2600, 2600], [-9500, 100, 0], true);
    K(0.07, [-12600, g(-12600, 1100) + 380, 1100], [-10500, 60, -250], false);
    var prev = null;
    STATIONS.forEach(function (s, i) {
      var o = objects[s.id], P = o.position, off = OFFS[s.id], w = WIN[i];
      var cam = [P.x + off[0], (s.sky ? g(P.x + off[0], P.z + off[2]) + 8 : P.y + off[1]), P.z + off[2]];
      var look = [P.x, P.y + (s.sky ? 0 : 3), P.z];
      if (prev) { // cruise key between the previous hold and this arrival
        var mx = (prev[0] + cam[0]) / 2, mz = (prev[2] + cam[2]) / 2 + 260;
        K(w[0] - .005, [mx, g(mx, mz) + 140, mz], [cam[0] + 200, cam[1] + 10, cam[2]], false);
      }
      K(w[0] + .035, cam, look, true);
      K(w[1] - .035, [cam[0] + off[0] * .08, cam[1] + .6, cam[2] + off[2] * .08], look, true);
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
      if (si >= 0) { var s = STATIONS[si]; captionEl.innerHTML = '<div class="sc-k">' + s.n + ' / 06 · ' + s.tag + '</div><h3>' + s.title + '</h3><p>' + s.short + '</p><button class="btn" onclick="openStation(\'' + s.id + '\')">Open details <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>'; captionEl.classList.add('on'); }
      else captionEl.classList.remove('on');
      document.querySelectorAll('.sdot').forEach(function (d, i) { d.classList.toggle('on', i === si); });
    }
  }
  var panel = document.getElementById('stationPanel');
  window.openStation = function (id) {
    var s = STATIONS.filter(function (x) { return x.id === id; })[0]; if (!s || !panel) return;
    panel.querySelector('.sp-k').textContent = s.n + ' / 06 · ' + s.tag; panel.querySelector('.sp-t').textContent = s.title; panel.querySelector('.sp-b').textContent = s.body;
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
