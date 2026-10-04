/* ORBITBeyond India — procedural lunar lander model + interactive explorer (Three.js r128) */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var GOLD = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: .85, roughness: .32, emissive: 0x3a2200, emissiveIntensity: .25 });
  var FOIL = new THREE.MeshStandardMaterial({ color: 0xf0c060, metalness: .95, roughness: .22, flatShading: true });
  var DARK = new THREE.MeshStandardMaterial({ color: 0x1b2359, metalness: .6, roughness: .5 });
  var STEEL = new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: .9, roughness: .35 });
  var PANEL = new THREE.MeshStandardMaterial({ color: 0x14305e, metalness: .4, roughness: .3, emissive: 0x0b2a6a, emissiveIntensity: .35 });
  var WHITE = new THREE.MeshStandardMaterial({ color: 0xe9e4d6, metalness: .2, roughness: .6 });
  var TEAL = new THREE.MeshStandardMaterial({ color: 0x2fd6c3, emissive: 0x2fd6c3, emissiveIntensity: .8, metalness: .2, roughness: .4 });

  function mesh(geo, mat, x, y, z) { var m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; }

  /* Builds the OB-1 style lander. Returns group with .parts {legs, body, rover, antenna, compute, nozzle} and .anchors */
  function buildLander() {
    var g = new THREE.Group(), parts = {};
    // main octagonal bus
    var body = mesh(new THREE.CylinderGeometry(.62, .68, .62, 8, 1), FOIL, 0, 0, 0); body.rotation.y = Math.PI / 8; g.add(body); parts.body = body;
    var deck = mesh(new THREE.CylinderGeometry(.7, .7, .05, 8, 1), DARK, 0, .33, 0); deck.rotation.y = Math.PI / 8; g.add(deck);
    var belly = mesh(new THREE.CylinderGeometry(.5, .55, .12, 8, 1), DARK, 0, -.36, 0); belly.rotation.y = Math.PI / 8; g.add(belly);
    // gold MLI belts
    var belt = mesh(new THREE.TorusGeometry(.66, .025, 8, 48), GOLD, 0, .12, 0); belt.rotation.x = Math.PI / 2; g.add(belt);
    var belt2 = belt.clone(); belt2.position.y = -.16; g.add(belt2);
    // engine nozzle
    var nozzle = new THREE.Group();
    nozzle.add(mesh(new THREE.CylinderGeometry(.16, .3, .34, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x6b6f7a, metalness: .9, roughness: .4, side: THREE.DoubleSide }), 0, -.57, 0));
    nozzle.add(mesh(new THREE.CylinderGeometry(.12, .16, .14, 24), STEEL, 0, -.33, 0));
    g.add(nozzle); parts.nozzle = nozzle;
    // thruster flame (hidden by default)
    var flame = mesh(new THREE.ConeGeometry(.2, .9, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb55e, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }), 0, -1.15, 0);
    flame.rotation.x = Math.PI; g.add(flame); parts.flame = flame;
    var flameCore = mesh(new THREE.ConeGeometry(.09, .6, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), 0, -1.0, 0);
    flameCore.rotation.x = Math.PI; g.add(flameCore); parts.flameCore = flameCore;
    // landing legs (WP1)
    var legs = new THREE.Group();
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2 + Math.PI / 4, leg = new THREE.Group();
      var strut = mesh(new THREE.CylinderGeometry(.03, .035, 1.05, 10), STEEL, 0, 0, 0);
      strut.position.set(Math.cos(a) * .95, -.55, Math.sin(a) * .95);
      strut.lookAt(new THREE.Vector3(Math.cos(a) * .45, .05, Math.sin(a) * .45)); strut.rotateX(Math.PI / 2);
      leg.add(strut);
      var brace = mesh(new THREE.CylinderGeometry(.018, .018, .78, 8), STEEL);
      brace.position.set(Math.cos(a) * 1.0, -.72, Math.sin(a) * 1.0);
      brace.lookAt(new THREE.Vector3(Math.cos(a) * .5, -.4, Math.sin(a) * .5)); brace.rotateX(Math.PI / 2);
      leg.add(brace);
      var shock = mesh(new THREE.CylinderGeometry(.045, .045, .3, 10), GOLD, Math.cos(a) * .72, -.3, Math.sin(a) * .72);
      shock.lookAt(new THREE.Vector3(Math.cos(a) * 1.25, -1.03, Math.sin(a) * 1.25)); shock.rotateX(Math.PI / 2); leg.add(shock);
      var pad = mesh(new THREE.CylinderGeometry(.2, .24, .06, 20), GOLD, Math.cos(a) * 1.28, -1.06, Math.sin(a) * 1.28); leg.add(pad);
      legs.add(leg);
    }
    g.add(legs); parts.legs = legs;
    // stowed rover (WP2) on a side deck
    var rover = new THREE.Group();
    rover.add(mesh(new THREE.BoxGeometry(.34, .14, .26), FOIL, 0, 0, 0));
    rover.add(mesh(new THREE.BoxGeometry(.36, .02, .3), PANEL, 0, .09, 0));
    for (var w = 0; w < 6; w++) { var wh = mesh(new THREE.CylinderGeometry(.045, .045, .04, 14), STEEL, -.13 + (w % 3) * .13, -.07, w < 3 ? .15 : -.15); wh.rotation.x = Math.PI / 2; rover.add(wh); }
    rover.add(mesh(new THREE.CylinderGeometry(.01, .01, .18, 6), STEEL, .1, .18, 0));
    rover.position.set(.88, .0, -.18); rover.rotation.y = -Math.PI / 2;
    var ramp = mesh(new THREE.BoxGeometry(.28, .02, .42), DARK, .83, -.1, -.18); g.add(ramp);
    g.add(rover); parts.rover = rover;
    // comms / satellite-relay mast (WP3)
    var antenna = new THREE.Group();
    antenna.add(mesh(new THREE.CylinderGeometry(.018, .022, .7, 8), STEEL, 0, .35, 0));
    var dish = mesh(new THREE.SphereGeometry(.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), new THREE.MeshStandardMaterial({ color: 0xf2eee4, metalness: .3, roughness: .5, side: THREE.DoubleSide }), 0, .72, 0);
    dish.rotation.x = Math.PI * .75; antenna.add(dish);
    antenna.add(mesh(new THREE.CylinderGeometry(.008, .008, .2, 6), STEEL, 0, .86, -.12));
    antenna.add(mesh(new THREE.SphereGeometry(.03, 10, 10), TEAL, 0, .97, -.16));
    antenna.position.set(-.42, .35, .28); g.add(antenna); parts.antenna = antenna;
    // AI compute payload (WP4) on top deck
    var compute = new THREE.Group();
    compute.add(mesh(new THREE.BoxGeometry(.42, .3, .42), DARK, 0, .15, 0));
    for (var f = 0; f < 5; f++) compute.add(mesh(new THREE.BoxGeometry(.46, .012, .46), STEEL, 0, .04 + f * .06, 0));
    compute.add(mesh(new THREE.BoxGeometry(.1, .04, .1), TEAL, .12, .32, .12));
    compute.position.set(.18, .35, .18); g.add(compute); parts.compute = compute;
    // solar panel wing
    var wing = mesh(new THREE.BoxGeometry(.02, .5, 1.0), PANEL, -.9, .35, -.1); g.add(wing);
    g.add(mesh(new THREE.BoxGeometry(.3, .03, .03), STEEL, -.72, .35, -.1));
    // star tracker / guidance sensor (WP5 mission control link)
    var sensor = new THREE.Group();
    sensor.add(mesh(new THREE.CylinderGeometry(.07, .09, .18, 16), WHITE, 0, 0, 0));
    sensor.add(mesh(new THREE.CylinderGeometry(.05, .05, .02, 16), TEAL, 0, .1, 0));
    sensor.position.set(-.3, .44, -.38); sensor.rotation.z = .5; sensor.rotation.x = -.4; g.add(sensor); parts.sensor = sensor;
    // tricolour band (subtle)
    var tri = mesh(new THREE.CylinderGeometry(.655, .655, .06, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xff9933, metalness: .5, roughness: .4, side: THREE.DoubleSide }), 0, .24, 0); tri.rotation.y = Math.PI / 8; g.add(tri);
    var tri2 = mesh(new THREE.CylinderGeometry(.655, .655, .04, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0x1e8a3a, metalness: .5, roughness: .4, side: THREE.DoubleSide }), 0, -.04, 0); tri2.rotation.y = Math.PI / 8; g.add(tri2);

    g.parts = parts;
    g.anchors = {
      legs: new THREE.Vector3(1.0, -.8, 1.0),
      rover: new THREE.Vector3(1.0, .08, -.2),
      antenna: new THREE.Vector3(-.42, 1.1, .28),
      compute: new THREE.Vector3(.2, .72, .2),
      sensor: new THREE.Vector3(-.36, .5, -.44)
    };
    return g;
  }
  window.OBLander = { build: buildLander };

  /* ---------- Explorer ---------- */
  var WP = [
    { id: 'legs', k: 'WP 01', t: 'Lander Leg Development', s: 'Deployable landing gear is where Odisha\'s capability is most directly relevant: legs, shock-attenuation struts and crushable energy absorbers, machined to ISRO standards.', b: ['Legs, shock-attenuation and energy absorbers', 'CTTC Bhubaneswar built ~70,000 precision parts for Chandrayaan-3', 'Built on Odisha\'s aluminium ecosystem'], yaw: -.8, pitch: .35 },
    { id: 'rover', k: 'WP 02', t: 'Rover Development', s: 'Serial manufacture of lunar surface rovers: mobility, autonomy, wheels and drive assemblies. Flown on group missions and sold to third-party operators worldwide.', b: ['Mobility, autonomy, wheels and drive assemblies', 'Regolith test yard built in-state', '0 to 60 rover engineers by 2031'], yaw: -1.5, pitch: .15 },
    { id: 'antenna', k: 'WP 03', t: 'Satellite Development', s: 'Three product lines on one common bus, generating recurring export revenue: lunar 5G relay, cislunar awareness and resource mapping.', b: ['Lunar 5G comms relay, with Tejas Networks', 'Cislunar awareness at L1/L2 for the US Space Force', 'Resource mapping, built in India\'s mineral State'], yaw: .9, pitch: .1 },
    { id: 'compute', k: 'WP 04', t: 'Lunar AI Data Centre', s: 'AI compute engineered for the lunar surface is an advanced-packaging problem: radiation-tolerant, thermally managed processing operated as LunarEdge.', b: ['Radiation-tolerant, thermally-managed processing', 'Aligned with the $225M 3D packaging facility at Info Valley, Khordha', 'Operated as LunarEdge'], yaw: -.45, pitch: .55 },
    { id: 'sensor', k: 'WP 05', t: 'Mission Control & Ground Segment', s: 'Two linked centres, NASA Marshall and Bhubaneswar, with dual control so there is no single point of failure during descent.', b: ['Bhubaneswar leads all non-US missions', 'Dual control during descent', 'Offered commercially to IN-SPACe operators'], yaw: 2.4, pitch: .3 }
  ];

  var stage = document.getElementById('explorerStage');
  if (!stage) return;
  var canvas = stage.querySelector('canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, .1, 50); camera.position.set(0, .6, 5.6);
  scene.add(new THREE.AmbientLight(0x6f7fbf, .55));
  var key = new THREE.DirectionalLight(0xfff1dc, 1.6); key.position.set(3, 4, 4); scene.add(key);
  var rim = new THREE.PointLight(0xff9933, 2.2, 12); rim.position.set(-4, 1, -3); scene.add(rim);
  var fill = new THREE.PointLight(0x2fd6c3, .9, 10); fill.position.set(2, -3, 3); scene.add(fill);
  var pivot = new THREE.Group(); scene.add(pivot);
  var lander = buildLander(); lander.position.y = .25; pivot.add(lander);
  // ground disc with soft glow
  var ground = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshBasicMaterial({ color: 0xff9933, transparent: true, opacity: .07 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.82; pivot.add(ground);
  var ring = new THREE.Mesh(new THREE.RingGeometry(1.95, 1.98, 96), new THREE.MeshBasicMaterial({ color: 0xffbf5e, transparent: true, opacity: .35, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -.81; pivot.add(ring);
  // orbit particles
  var pg = new THREE.BufferGeometry(), pp = new Float32Array(600 * 3);
  for (var i = 0; i < 600; i++) { var r = 2.6 + Math.random() * 3, th = Math.random() * Math.PI * 2, ph = (Math.random() - .5) * Math.PI; pp[i * 3] = Math.cos(th) * Math.cos(ph) * r; pp[i * 3 + 1] = Math.sin(ph) * r * .6; pp[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * r; }
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  var dots = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd9a0, size: .022, transparent: true, opacity: .55 })); scene.add(dots);

  var yaw = .6, pitch = .25, tYaw = .6, tPitch = .25, dragging = false, lx = 0, ly = 0, idle = 0, auto = true;
  stage.addEventListener('pointerdown', function (e) { dragging = true; lx = e.clientX; ly = e.clientY; auto = false; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', function (e) { if (!dragging) return; tYaw += (e.clientX - lx) * .008; tPitch = Math.max(-.6, Math.min(1.1, tPitch + (e.clientY - ly) * .005)); lx = e.clientX; ly = e.clientY; idle = 0; });
  var up = function () { dragging = false; }; stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', function (e) { if (!e.ctrlKey) return; }, { passive: true });

  function resize() { var w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); var base = w < 600 ? 6.4 : 5.6; camera.position.z = camera.aspect < 1.15 ? Math.min(11, base * 1.15 / camera.aspect) : base; camera.lookAt(0, .15, 0); }
  resize(); window.addEventListener('resize', resize);

  // hotspots
  var hots = {}, listEl = document.getElementById('wpList'), detail = document.getElementById('wpDetail'), active = 'legs';
  WP.forEach(function (w, i) {
    var h = document.createElement('button'); h.className = 'hot'; h.textContent = '0' + (i + 1); h.setAttribute('aria-label', w.t); h.setAttribute('data-id', w.id);
    h.addEventListener('click', function (e) { e.stopPropagation(); select(w.id, true); }); stage.appendChild(h); hots[w.id] = h;
    var li = document.createElement('button'); li.className = 'wp-item'; li.setAttribute('data-id', w.id);
    li.innerHTML = '<span class="k">' + w.k + '</span><span class="t">' + w.t + '</span><span class="a"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
    li.addEventListener('click', function () { select(w.id, true); }); listEl.appendChild(li);
  });
  var tmp = new THREE.Vector3(), camDir = new THREE.Vector3();
  function select(id, user) {
    active = id; var w = WP.filter(function (x) { return x.id === id; })[0];
    Object.keys(hots).forEach(function (k) { hots[k].classList.toggle('on', k === id); });
    listEl.querySelectorAll('.wp-item').forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-id') === id); });
    detail.innerHTML = '<p>' + w.s + '</p><ul>' + w.b.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>';
    detail.classList.remove('fade-swap'); void detail.offsetWidth; detail.classList.add('fade-swap');
    if (user) { tYaw = w.yaw; tPitch = w.pitch; auto = false; idle = 0; }
  }
  window.OBSelectWP = function (id) { select(id, true); };
  select('legs', false);

  var pulse = 0, visible = true, clock = new THREE.Clock();
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(stage);
  function frame() {
    requestAnimationFrame(frame); if (!visible) return;
    var dt = Math.min(clock.getDelta(), .05); idle += dt; pulse += dt;
    if (!dragging && idle > 4) auto = true;
    if (auto) tYaw += dt * .25;
    yaw += (tYaw - yaw) * .08; pitch += (tPitch - pitch) * .08;
    pivot.rotation.y = yaw; pivot.rotation.x = pitch * .55;
    lander.position.y = .25 + Math.sin(pulse * .9) * .03;
    dots.rotation.y -= dt * .03;
    // highlight the active part with a subtle scale pulse
    var glow = .5 + Math.sin(pulse * 4) * .5;
    Object.keys(lander.parts).forEach(function (p) { var s = (p === active) ? 1 + glow * .035 : 1; if (lander.parts[p].scale) lander.parts[p].scale.setScalar(s); });
    // project hotspots
    camera.getWorldDirection(camDir);
    var rect = { w: stage.clientWidth, h: stage.clientHeight };
    WP.forEach(function (w) {
      tmp.copy(lander.anchors[w.id]); lander.localToWorld(tmp);
      var toCam = tmp.clone().sub(camera.position).normalize();
      var centre = new THREE.Vector3(); lander.getWorldPosition(centre);
      var outward = tmp.clone().sub(centre).normalize();
      var back = outward.dot(camDir) > .55;
      tmp.project(camera);
      var h = hots[w.id]; h.style.left = ((tmp.x * .5 + .5) * rect.w) + 'px'; h.style.top = ((-tmp.y * .5 + .5) * rect.h) + 'px';
      h.classList.toggle('back', back);
    });
    renderer.render(scene, camera);
  }
  frame();
})();
