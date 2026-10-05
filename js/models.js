/* ORBITBeyond India — glTF hardware models for the surface stops (Three.js r128 + GLTFLoader)
   Loads real 3D models and swaps them into the station groups built by surface.js/hardware.js.
   Each entry: url (or list of urls merged into one model), target height in metres, optional yaw.
   Procedural models stay in place until a glTF finishes loading, and remain on small screens. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var MAP = {
    lander:     { url: 'assets/models/apollo-lm.glb',   height: 7.0, yaw: 0.6, anchor: 8.0 },
    rover:      { url: 'assets/models/perseverance.glb', height: 2.3, yaw: 0.4, anchor: 3.6 },
    extract:    { url: 'assets/models/rassor.glb',       height: 3.0, yaw: -0.5, anchor: 4.4 },
    orbiter:    { url: 'assets/models/lro.glb',          height: 8.0, yaw: 0, anchor: 0, sky: true },
    // datacentre: the NASA Habitat Demonstration Unit carries a US flag in its texture, so the procedural module stays
    datacentre: null
  };
  function fit(model, cfg) {
    var box = new THREE.Box3().setFromObject(model), size = new THREE.Vector3(), centre = new THREE.Vector3();
    box.getSize(size); box.getCenter(centre);
    var s = cfg.height / Math.max(size.y, 1e-6); model.scale.setScalar(s);
    box.setFromObject(model); box.getCenter(centre);
    model.position.x -= centre.x; model.position.z -= centre.z;
    if (cfg.sky) model.position.y -= centre.y; else model.position.y -= box.min.y;
    model.rotation.y = cfg.yaw || 0;
  }
  function prepare(model, env) {
    model.traverse(function (o) {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(function (m) { if (!m) return; if ('envMap' in m) { m.envMap = env; m.envMapIntensity = .8; } if ('roughness' in m && m.roughness === undefined) m.roughness = .6; m.needsUpdate = true; });
    });
  }
  window.OBModels = {
    apply: function (objects, env, small) {
      if (small || !THREE.GLTFLoader || !window.OB_USE_MODELS) return;   // OB_USE_MODELS is set in the page
      var loader = new THREE.GLTFLoader();
      if (THREE.DRACOLoader) { var draco = new THREE.DRACOLoader(); draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/'); loader.setDRACOLoader(draco); }
      Object.keys(MAP).forEach(function (id) {
        var cfg = MAP[id], target = objects[id]; if (!cfg || !target) return;
        var urls = Array.isArray(cfg.url) ? cfg.url : [cfg.url], holder = new THREE.Group(), pending = urls.length;
        urls.forEach(function (u) {
          loader.load(u, function (gltf) {
            holder.add(gltf.scene); pending--;
            if (pending === 0) {
              fit(holder, cfg); prepare(holder, env);
              // swap: drop the procedural children, keep the station's position, anchor and animation
              for (var i = target.children.length - 1; i >= 0; i--) target.remove(target.children[i]);
              target.add(holder);
              if (target.userData.anchor) target.userData.anchor.set(0, cfg.anchor, 0);
              target.userData.model = holder; window.__obModels = window.__obModels || {}; window.__obModels[id] = holder;
            }
          }, undefined, function (err) { console.warn('model failed, keeping procedural:', u, err && err.message); });
        });
      });
    }
  };
})();
