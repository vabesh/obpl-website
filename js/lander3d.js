/* ORBITBeyond India — procedural OB1 lander model (Three.js r128); used by surface.js */
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
})();
