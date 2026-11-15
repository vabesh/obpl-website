/* ORBITBeyond India — boulder fields for the lunar surface (Three.js r128)
   Instanced rocks: dense near each station (what the camera sees when it stops), sparse larger
   blocks along the cruise corridor. Sizes follow a power law; rocks sit partly buried. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function rockGeo(seed) {
    var g = new THREE.IcosahedronGeometry(1, 3), pa = g.attributes.position, v = new THREE.Vector3();
    var ax = .7 + hash(seed) * .6, ay = .55 + hash(seed + 1) * .45, az = .7 + hash(seed + 2) * .6;   // overall ellipsoid
    for (var i = 0; i < pa.count; i++) {
      v.set(pa.getX(i), pa.getY(i), pa.getZ(i));
      var n = 1 + (hash(seed + v.x * 7.3 + v.y * 11.1 + v.z * 5.7) - .5) * .5 + (hash(seed * 3 + v.x * 2.1 + v.z * 3.3) - .5) * .35;   // lumps and facets
      v.multiplyScalar(n); v.x *= ax; v.y *= ay; v.z *= az;
      if (v.y < -.25) v.y = -.25 - (v.y + .25) * .25;                                                      // flattened, buried base
      pa.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return g;
  }
  window.OBRocks = {
    build: function (scene, ground, stations, isSmall, detailTex) {
      var mat = new THREE.MeshStandardMaterial({ color: 0x615e5a, roughness: 1, metalness: 0, flatShading: false });   // weathered, slightly darker than the regolith
      if (detailTex) { mat.normalMap = detailTex; mat.normalScale = new THREE.Vector2(.6, .6); }
      var geos = [rockGeo(1), rockGeo(2), rockGeo(3), rockGeo(4), rockGeo(5), rockGeo(6)];
      var items = [], rnd = function (a, b) { return a + Math.random() * (b - a); };
      var stationN = isSmall ? 260 : 900, corridorN = isSmall ? 500 : 1600;
      stations.forEach(function (s) {
        if (s.sky) return;
        for (var i = 0; i < stationN; i++) {
          var a = Math.random() * Math.PI * 2, d = 9 + Math.pow(Math.random(), .7) * 380;
          var r = .16 * Math.pow(1 - Math.random() * .999, -.5); r = Math.min(r, d > 90 ? 3.2 : (d > 35 ? 1.4 : .7));   // metres (half-size): small stones near the hardware, blocks further out
          items.push([s.pos[0] + Math.cos(a) * d, s.pos[2] + Math.sin(a) * d, r]);
        }
      });
      for (var j = 0; j < corridorN; j++) {
        var x = rnd(-16500, 13000), z = rnd(-3200, 3200), r2 = 1.0 * Math.pow(1 - Math.random() * .995, -.5); r2 = Math.min(r2, 4.5);
        var nearStation = stations.some(function (s) { return !s.sky && Math.hypot(s.pos[0] - x, s.pos[2] - z) < 450; });
        if (!nearStation) items.push([x, z, r2]);
      }
      var per = Math.ceil(items.length / geos.length), meshes = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
      geos.forEach(function (g, gi) {
        var im = new THREE.InstancedMesh(g, mat, per); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
        var slot = 0;
        for (var k = gi; k < items.length && slot < per; k += geos.length, slot++) {
          var it = items[k], r = it[2];
          e.set(rnd(-.25, .25), Math.random() * Math.PI * 2, rnd(-.25, .25)); q.setFromEuler(e);
          sc.set(r * rnd(.8, 1.25), r * rnd(.7, 1.1), r * rnd(.8, 1.25));
          p.set(it[0], ground(it[0], it[1]) - sc.y * .22, it[1]);
          m4.compose(p, q, sc); im.setMatrixAt(slot, m4);
        }
        im.count = slot; im.instanceMatrix.needsUpdate = true; scene.add(im); meshes.push(im);
      });
      return meshes;
    }
  };
})();
