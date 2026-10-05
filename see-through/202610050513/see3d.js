// see3d.js - SEE THROUGH stage 4: the porthole's own map tips over and one substation rises on the real satellite
// ground, drawn by rule (model.js) with the owner's pylons marching away along the real lines.
//
// HOW IT IS DRAWN (the simulator overlay's method, reused):
//   - The map is the porthole's MapLibre GL JS 4.7.1 map (descent.js). Ground: Esri World Imagery draped on AWS Terrain
//     Tiles (terrarium), exactly the overlay's sources (overlay.html:43, :46, :296).
//   - The drawing is ONE custom WebGL layer inside the map's own camera (overlay.html:79-101), GL_LINES only. Vertices
//     are anchor-relative Mercator from place-frame (pf.js = place-frame.mjs), the anchor folded into the matrix
//     (overlay.html:34-38 withAnchor), each vertex lifted by the terrain height under it (perf.js:106-109 reads it per
//     block; here per ground reference, re-read when terrain tiles arrive, at most 300 queries a frame as perf.js).
//   - The look is wire-look.js: #9cdbff hairlines, premultiplied alpha 0.85 over imagery, fading with view depth past
//     the centre by world/fade.mjs's rule (450 m + 2.5 m per metre of height, to 4 km) (wire-look.js:17-32, :49-57).
//     Conductors keep pylons-real's colours by voltage (pylons-real.js:20-22).
//   - The arrival is morph.js's idea per piece: a height scale 0 to 1 with a cubic in-out (morph.js:26-30), started
//     piece by piece; conductors and busbars "draw themselves" by a reveal parameter along their length.
// Controls: drag to orbit, wheel or pinch to zoom, the overlay's joystick on touch to fly (overlay.html:124-129,
// prospect/snippets/joystick.js), keys W A S D, arrows, Q E, R F, + -. Any tap during the arrival skips to the end.
(function () {
  'use strict';
  var SCRIPT = (document.currentScript && document.currentScript.src) || location.href;
  var BASE = SCRIPT.replace(/[^\/]*$/, '');
  var GA = 'https://ventusltd.github.io/gridatlas/atlas/releases/202608300453-atlas-v9/data/';
  var DEM = { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], tileSize: 256, encoding: 'terrarium', maxzoom: 15 };  // overlay.html:46
  var OVERPASS = 'https://overpass-api.de/api/interpreter';
  var FONT = '"Segoe UI", Arial, sans-serif';
  var C = 2 * Math.PI * 6371008.8;
  var X = null;                 // live state while in 3D
  var cache = { fp: null, lines: null, osm: {}, linesErr: false };

  // ---------------- data ----------------
  function getJSON(u, ms) {
    var ctl = window.AbortController ? new AbortController() : null, t = ctl && setTimeout(function () { ctl.abort(); }, ms || 20000);
    return fetch(u, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw Error(u + ' ' + r.status); return r.json(); });
  }
  function footprints() {
    if (cache.fp) return cache.fp;
    cache.fp = getJSON(BASE + 'data/substations-footprints.odbl.json').then(function (j) {
      var byI = {}, all = [];
      (j.f || []).forEach(function (r) { var ring = r[2], w = 180, s = 90, e = -180, n = -90; ring.forEach(function (p) { if (p[0] < w) w = p[0]; if (p[0] > e) e = p[0]; if (p[1] < s) s = p[1]; if (p[1] > n) n = p[1]; });
        var o = { i: r[0], ring: ring, bbox: [w, s, e, n] }; byI[r[0]] = o; all.push(o); });
      return { byI: byI, all: all };
    }).catch(function () { return { byI: {}, all: [] }; });
    return cache.fp;
  }
  function lines() {   // GridAtlas's own line files (the ones descent.js draws for GRID), with a box per line (pylons-real.js:47-54)
    if (cache.lines) return cache.lines;
    cache.lines = Promise.all(['400', '275', '220', '132', '66'].map(function (kv) {
      return getJSON(GA + 'grid_' + kv + 'kv.geojson', 30000).then(function (j) {
        var L = [];
        (j.features || []).forEach(function (f) { var g = f.geometry; if (!g) return;
          (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []).forEach(function (c) {
            var w = 180, s = 90, e = -180, n = -90; c.forEach(function (p) { if (p[0] < w) w = p[0]; if (p[0] > e) e = p[0]; if (p[1] < s) s = p[1]; if (p[1] > n) n = p[1]; });
            L.push({ bbox: [w, s, e, n], coords: c }); }); });   // names are never read
        return [kv, L];
      }).catch(function () { cache.linesErr = true; return [kv, []]; });
    })).then(function (pairs) { var o = {}; pairs.forEach(function (p) { o[p[0]] = p[1]; }); return o; });
    return cache.lines;
  }
  // OpenStreetMap detail: the saved Overpass answer for this site if the app carries one, else one live query
  function osmDetail(rec, ring) {
    var k = rec.i; if (cache.osm[k]) return cache.osm[k];
    if (!cache.osmIndex) cache.osmIndex = getJSON(BASE + 'data/osm/index.json', 8000).catch(function () { return []; });
    cache.osm[k] = cache.osmIndex.then(function (ix) { if (ix.indexOf(k) < 0) throw Error('not saved'); return getJSON(BASE + 'data/osm/' + k + '.json', 8000); })
      .then(function (j) { return { json: j, how: 'saved' }; })
      .catch(function () {
        var q = window.SeeModel.osmQuery(rec, ring);
        var ctl = window.AbortController ? new AbortController() : null, t = ctl && setTimeout(function () { ctl.abort(); }, 15000);
        return fetch(OVERPASS, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: ctl ? ctl.signal : undefined })
          .then(function (r) { clearTimeout(t); if (!r.ok) throw Error('overpass ' + r.status); return r.json(); })
          .then(function (j) { return { json: j, how: 'live' }; });
      })
      .catch(function () { return { json: null, how: 'none' }; });
    return cache.osm[k];
  }
  function others(all, lat, lon, km) {
    var dl = km / 110.574, dn = km / (111.32 * Math.cos(lat * Math.PI / 180));
    return all.filter(function (o) { return o.bbox[2] > lon - dn && o.bbox[0] < lon + dn && o.bbox[3] > lat - dl && o.bbox[1] < lat + dl; });
  }

  // ---------------- the wire layer ----------------
  var VS = 'uniform mat4 u; uniform float u_mz; uniform float u_e; uniform float u_rise; uniform float u_near; uniform float u_fade;'
    + 'attribute vec4 p; attribute float g; varying float v_a; varying float v_s;'
    + 'void main(){ gl_Position = u * vec4(p.xy, (g - u_e + p.z * u_rise) * u_mz, 1.0); v_s = p.w;'
    + ' v_a = clamp(1.0 - max(gl_Position.w - u_near, 0.0) / u_fade, 0.0, 1.0); }';
  var FS = 'precision mediump float; uniform vec4 u_c; uniform float u_reveal; varying float v_a; varying float v_s;'
    + 'void main(){ if (v_s > u_reveal) discard; float a = u_c.a * v_a; gl_FragColor = vec4(u_c.rgb * a, a); }';
  function program(gl) {
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(o)); return o; };
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(pr));
    var L = {}; ['u', 'u_mz', 'u_e', 'u_rise', 'u_near', 'u_fade', 'u_c', 'u_reveal'].forEach(function (n) { L[n] = gl.getUniformLocation(pr, n); });
    return { pr: pr, L: L, p: gl.getAttribLocation(pr, 'p'), g: gl.getAttribLocation(pr, 'g') };
  }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }   // morph.js:30

  // Pack the model: positions (anchor-relative Mercator x, y; height above ground in metres; reveal s) and grounds.
  function pack(m) {
    var PF = window.STPF, a = m.anchor, ax = PF.mercatorX(a.lon), ay = PF.mercatorY(a.lat), v = m.v, n = v.length / 7;
    var pos = new Float32Array(n * 4), memo = new Map();
    for (var k = 0; k < n; k++) {
      var x = v[7 * k], y = v[7 * k + 1], key = x.toFixed(3) + ',' + y.toFixed(3), q = memo.get(key);
      if (!q) { var gg = PF.fromLocal(a, x, y, 0); q = [PF.mercatorX(gg.lon) - ax, PF.mercatorY(gg.lat) - ay]; memo.set(key, q); }
      pos[4 * k] = q[0]; pos[4 * k + 1] = q[1]; pos[4 * k + 2] = v[7 * k + 2]; pos[4 * k + 3] = v[7 * k + 6];
    }
    return { pos: pos, n: n, ax: ax, ay: ay, mz: 1 / (C * Math.cos(a.lat * Math.PI / 180)) };
  }
  function groundArray(m, H) {   // per vertex: (1 - gt) H[ga] + gt H[gb]
    var v = m.v, n = v.length / 7, out = new Float32Array(n);
    for (var k = 0; k < n; k++) { var ga = v[7 * k + 3], gb = v[7 * k + 4], gt = v[7 * k + 5]; out[k] = gt ? (1 - gt) * H[ga] + gt * H[gb] : H[ga]; }
    return out;
  }

  var layer = {
    id: 'see-through-3d', type: 'custom', renderingMode: '3d',
    onAdd: function (map, gl) { this.gl = gl; this.P = null; this.buf = null; this.gbuf = null; this.ver = -1; this.gver = -1; },
    onRemove: function (map, gl) { if (this.buf) gl.deleteBuffer(this.buf); if (this.gbuf) gl.deleteBuffer(this.gbuf); this.buf = this.gbuf = null; },
    render: function (gl, args) {
      if (!X || !X.pk) return;
      var t0 = performance.now();
      try {
        if (!this.P) this.P = program(gl);
        var P = this.P, pk = X.pk, m = X.model;
        if (this.ver !== X.ver) { if (!this.buf) this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, pk.pos, gl.STATIC_DRAW); this.ver = X.ver; }
        if (this.gver !== X.gver) { if (!this.gbuf) this.gbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.gbuf); gl.bufferData(gl.ARRAY_BUFFER, X.garr, gl.DYNAMIC_DRAW); this.gver = X.gver; }
        var mm = (args && args.defaultProjectionData && args.defaultProjectionData.mainMatrix) || args, u = new Float32Array(16);
        for (var k = 0; k < 4; k++) { u[k] = mm[k]; u[4 + k] = mm[4 + k]; u[8 + k] = mm[8 + k]; u[12 + k] = mm[k] * pk.ax + mm[4 + k] * pk.ay + mm[12 + k]; }   // withAnchor, overlay.html:34-38
        gl.useProgram(P.pr);
        gl.uniformMatrix4fv(P.L.u, false, u); gl.uniform1f(P.L.u_mz, pk.mz);
        // MapLibre 4.7.1 draws the 3D world relative to the camera centre's ground height (queryTerrainElevation subtracts
        // transform.elevation too), so heights read absolute from the terrain are taken back by it here
        var tre = X.map.transform && X.map.transform.elevation; gl.uniform1f(P.L.u_e, isFinite(tre) ? tre : 0);
        var F = fadeNow(); gl.uniform1f(P.L.u_near, F.near); gl.uniform1f(P.L.u_fade, F.fade);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.enableVertexAttribArray(P.p); gl.vertexAttribPointer(P.p, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gbuf); gl.enableVertexAttribArray(P.g); gl.vertexAttribPointer(P.g, 1, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied, wire-look.js:68
        var t = X.t, draws = 0, gs = m.groups, glow = X.glow;
        for (var i = 0; i < gs.length; i++) {
          var G = gs[i]; if (!G.count) continue;
          var x = (t - G.t0) / G.dur; if (x <= 0) continue;
          var rise = 1, rev = 1.01, col = G.col, a = 0.85;
          if (G.mode === 'rise') rise = Math.max(0.002, ease(x)); else rev = x >= 1 ? 1.01 : x;
          if (G.kind === 'busbar' || G.kind === 'bay' || G.kind === 'droppers') { a = 0.55 + 0.45 * glow; }
          if (G.kind === 'span') a = 0.9;
          // conductors: the voltage colour lifted toward the wire-look hairline colour, so it reads over imagery as the overlay's does
          if (col !== window.SeeModel.STEEL) col = [col[0] * 0.55 + 0.45 * 0.75, col[1] * 0.55 + 0.45 * 0.9, col[2] * 0.55 + 0.45];
          var gl2 = (G.kind === 'busbar' ? 1 + 0.9 * X.flash : 1);
          gl.uniform1f(P.L.u_rise, rise); gl.uniform1f(P.L.u_reveal, rev);
          gl.uniform4f(P.L.u_c, Math.min(1, col[0] * gl2), Math.min(1, col[1] * gl2), Math.min(1, col[2] * gl2), a);
          gl.drawArrays(gl.LINES, G.start * 2, G.count * 2); draws++;
        }
        X.draws = draws;
      } catch (e) { X.err = String(e && e.message || e); }
      X.renderMs = performance.now() - t0;
    }
  };
  function fadeNow() {   // wire-look.js:49-57 with world/fade.mjs's aerial rule
    var map = X.map, tr = map.transform, lat = map.getCenter().lat;
    var ppm = 512 * Math.pow(2, map.getZoom()) / (C * Math.cos(lat * Math.PI / 180));
    var camPx = tr && tr.cameraToCenterDistance ? tr.cameraToCenterDistance : 0.5 / Math.tan(0.6435 / 2) * map.getCanvas().clientHeight;
    var above = camPx / ppm * Math.cos(map.getPitch() * Math.PI / 180), fadeM = Math.min(4000, 450 + Math.max(0, above) * 2.5);
    return { near: camPx, fade: Math.max(1, fadeM * ppm) };
  }

  // ---------------- enter, build, animate ----------------
  function enter(o) {
    if (X) exit();
    var map = o.map;
    X = { map: map, o: o, rec: o.rec, t: 0, tStart: 0, model: null, pk: null, ver: 0, gver: 0, glow: 0, flash: 0, H: null, gDone: false,
      start: performance.now(), skip: false, orbit: 0, touched: false, keys: {}, joy: { x: 0, y: 0, id: null }, ptr: {}, fiv: [], lastNow: 0, err: '', draws: 0,
      clip0: o.rx, prevCam: { center: map.getCenter(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() }, phase: 'loading' };
    // ground: the overlay's terrain under the satellite image
    try { if (!map.getSource('see-dem')) map.addSource('see-dem', DEM); map.setTerrain({ source: 'see-dem', exaggeration: 1 }); } catch (e) { X.err = 'terrain: ' + e.message; if (o.networkStatus) o.networkStatus('see-dem', true); }
    // MapLibre 4.7.1 asks the terrain for the camera centre's height at the camera's tile zoom; above the DEM's maxzoom
    // (15, AWS terrarium) that answers 0, so on high ground the camera was placed below the hill behind it (seen at a
    // 138 m site: centre elevation 0, camera at 154 m, ground under the camera 163 m). Ask at 15 at most, then coarser
    // while a tile is missing. Runtime wrap of this map's own terrain object only, as morph.js wraps layers.
    try { var T = map.terrain; if (T && !T.__seeClamp) { var orig = T.getElevationForLngLatZoom.bind(T);
      T.getElevationForLngLatZoom = function (ll, z) { var e = 0; for (var q = Math.min(z, 15); q >= 10 && !e; q--) e = orig(ll, q); return e; }; T.__seeClamp = true; } } catch (e) {}
    try { if (map.setSky) map.setSky({ 'sky-color': '#0b1830', 'horizon-color': '#3a5470', 'fog-color': '#1d2c3c', 'fog-ground-blend': 0.6, 'horizon-fog-blend': 0.7, 'sky-horizon-blend': 0.6, 'atmosphere-blend': 0.6 }); } catch (e) {}
    try { if (!map.getLayer(layer.id)) map.addLayer(layer); } catch (e) { X.err = 'layer: ' + e.message; }
    X.onData = function (e) { if (X && e && e.sourceId === 'see-dem' && e.tile && e.tile.state === 'loaded') { X.demDirty = true; X.demOK = true; if (X.o.networkStatus) X.o.networkStatus('see-dem', false); } }; map.on('sourcedata', X.onData);
    ui(o);
    // the camera tips over at once, toward the point; the frame follows when the model is built
    var lat = o.rec.lat, lon = o.rec.lon;
    tipTo(lon, lat, 60, fitZoom(lat, 140), 2200);
    phoneLayout(o, true);
    footprints().then(function (fp) {
      if (!X || X.rec !== o.rec) return;
      var f = fp.byI[o.rec.i], ring = f ? f.ring : null;
      // build at once with what is local (the outline), then again when the lines and the mapped detail arrive
      Promise.all([lines(), osmDetail(o.rec, ring)]).then(function (res) {
        if (!X || X.rec !== o.rec) return;
        var osm = res[1].json ? window.SeeModel.osmParse(res[1].json, ring) : null;
        build({ footprint: ring, lines: res[0], others: others(fp.all, lat, lon, 6), osm: osm }, res[1].how);
      });
    });
    X.raf = requestAnimationFrame(tick);
    window.__see3d = api;
  }
  function fitZoom(lat, metres) {
    var W = X.map.getCanvas().clientWidth || innerWidth, H = X.map.getCanvas().clientHeight || innerHeight, minWH = Math.min(W, H);
    var z = Math.log(40075016.686 * Math.cos(lat * Math.PI / 180) * minWH / (512 * metres)) / Math.LN2;
    return Math.max(14.2, Math.min(18.6, z));
  }
  function tipTo(lon, lat, pitch, zoom, ms, bearing) {
    try { X.map.easeTo({ center: [lon, lat], pitch: pitch, zoom: zoom, bearing: bearing == null ? -24 : bearing, duration: ms, easing: ease }); } catch (e) {}
  }
  function build(data, how) {
    var t0 = performance.now(), m;
    try { m = window.SeeModel.substation(X.rec, data); } catch (e) { X.err = 'model: ' + e.message; X.phase = 'failed'; setChips(); return; }
    X.model = m; X.buildMs = performance.now() - t0; X.osmHow = how;
    X.pk = pack(m); X.packMs = performance.now() - t0 - X.buildMs;
    X.H = new Float32Array(m.grounds.length); X.Hok = new Uint8Array(m.grounds.length); X.garr = groundArray(m, X.H); X.ver++; X.gver++;
    X.phase = 'arriving';
    // the animation clock starts now (the camera has been tipping since enter)
    X.tStart = performance.now() - Math.min(1800, performance.now() - X.start) ;
    var g0 = m.grounds[0], reach = Math.max(140, Math.min(700, m.extent * 2.2 + 80)) * (X.o.port ? 0.75 : 1);
    if (!X.touched) tipTo(g0.lon, g0.lat, 62, fitZoom(g0.lat, reach), 2000);
    setChips();
  }
  // Terrain height at a place. queryTerrainElevation asks at the camera's tile zoom and answers 0 above the DEM's
  // maxzoom (15) ("cannot calculate elevation if elevation maxzoom > source.maxzoom"), so the terrain is asked at 15.
  function elevation(lon, lat) {
    var map = X.map, tr = map.terrain;
    try { if (tr && tr.getElevationForLngLatZoom) { var ll = new window.maplibregl.LngLat(lon, lat), e = 0;   // a missing tile reads 0: try coarser
      for (var z = 15; z >= 11 && !e; z--) e = tr.getElevationForLngLatZoom(ll, z); return e; } } catch (er) {}
    try { return map.queryTerrainElevation([lon, lat]); } catch (e) { return null; }
  }
  // Heights under the compound and every tower (perf.js:106-109 reads them per block, after terrain tiles arrive):
  // read again every 0.4 s for the first 20 s and whenever a terrain tile lands, at most 300 a frame.
  function readGrounds(now) {
    var m = X.model; if (!m) return;
    if (X.demDirty || (now - (X.gLast || 0) > 400 && (now - X.start) < 20000)) { X.gLast = now; X.demDirty = false; X.gi = 0; }
    if (X.gi == null || X.gi >= m.grounds.length) return;
    var changed = false, end = Math.min(m.grounds.length, X.gi + 300);
    for (var i = X.gi; i < end; i++) {
      var e = elevation(m.grounds[i].lon, m.grounds[i].lat);
      if (e != null && isFinite(e) && Math.abs(e - X.H[i]) > 0.02) { X.H[i] = e; changed = true; }
      if (e != null && isFinite(e)) X.Hok[i] = 1;
    }
    X.gi = end;
    if (changed) { X.garr = groundArray(X.model, X.H); X.gver++; }
  }
  function tick(now) {
    if (!X) return;
    X.raf = requestAnimationFrame(tick);
    if (X.lastNow) { X.fiv.push(now - X.lastNow); if (X.fiv.length > 240) X.fiv.shift(); }
    var dt = Math.min(0.1, X.lastNow ? (now - X.lastNow) / 1000 : 0.016); X.lastNow = now;
    if (!X.demOK && now - X.start > 9000 && X.o.networkStatus) X.o.networkStatus('see-dem', true);
    // the clip of the porthole opens to the whole screen while the camera tips
    var el = X.o.mapEl, k = Math.min(1, (now - X.start) / 1300), Rfull = Math.hypot(window.innerWidth, window.innerHeight);
    if (k < 1) { var r = X.clip0 + (Rfull - X.clip0) * ease(k), cp = 'circle(' + r.toFixed(1) + 'px at ' + X.o.cx.toFixed(1) + 'px ' + X.o.cy.toFixed(1) + 'px)'; el.style.clipPath = cp; el.style.webkitClipPath = cp; }
    else if (el.style.clipPath !== 'none') { el.style.clipPath = 'none'; el.style.webkitClipPath = 'none'; }
    if (X.model) {
      var m = X.model;
      if (X.skip) { X.tStart = now - (m.end + 1.2) * 1000; X.skip = false; }
      X.t = (now - X.tStart) / 1000;
      // energise: after the last span is strung the busbars light (a flash that settles to full colour)
      var tl = m.end - 0.1; X.glow = X.t < tl ? 0 : Math.min(1, (X.t - tl) / 0.5); X.flash = X.t < tl ? 0 : Math.max(0, 1 - Math.abs(X.t - tl - 0.35) / 0.35);
      // the towers march outward: the camera draws back with them (unless the player has taken the camera)
      if (!X.backed && X.t > m.timeline.towers - 0.2 && !X.touched) { X.backed = true; try { X.map.easeTo({ zoom: X.map.getZoom() - (X.o.phone ? 0.4 : 0.6), pitch: 64, duration: 4200, easing: ease }); } catch (e) {} }
      if (X.phase === 'arriving' && X.t > m.end + 0.6) { X.phase = 'orbit'; if (X.o.ping) { X.o.ping(12, 0.03); } }
      readGrounds(now);
    }
    // an ease interrupted by another (the frame follows the model, the camera draws back) can leave MapLibre's
    // elevation freeze on, and the camera then keeps a centre height of 0 under a hill: release it once no ease runs
    try { if (X.map._elevationFreeze && !X.map.isEasing()) X.map._elevationFreeze = false; } catch (e) {}
    move(dt);
    X.map.triggerRepaint();
  }
  function move(dt) {   // orbit after the arrival; keys and joystick fly (overlay.html:131-145 drone speed, 60 m/s)
    var map = X.map, K = X.keys, j = X.joy;
    var f = (K.w || K.arrowup ? 1 : 0) - (K.s || K.arrowdown ? 1 : 0) - j.y;
    var r = (K.d ? 1 : 0) - (K.a ? 1 : 0);
    var turn = (K.e || K.arrowright ? 1 : 0) - (K.q || K.arrowleft ? 1 : 0) + j.x;
    var tilt = (K.r ? 1 : 0) - (K.f ? 1 : 0), zin = (K['+'] || K['='] ? 1 : 0) - (K['-'] || K._ ? 1 : 0);
    if (f || r || turn || tilt || zin) {
      X.touched = true; stopEase();
      var sp = 60 * Math.pow(2, 17 - map.getZoom()) * (K.shift ? 3 : 1), b = map.getBearing() * Math.PI / 180, c = map.getCenter();
      var dn = (f * Math.cos(b) - r * Math.sin(b)) * sp * dt, de = (f * Math.sin(b) + r * Math.cos(b)) * sp * dt;
      map.jumpTo({ center: [c.lng + de / (111320 * Math.cos(c.lat * Math.PI / 180)), c.lat + dn / 111320], bearing: map.getBearing() + turn * 60 * dt,
        pitch: Math.max(0, Math.min(82, map.getPitch() + tilt * 30 * dt)), zoom: Math.max(12, Math.min(19.5, map.getZoom() + zin * dt)) });
    } else if (X.phase === 'orbit' && !X.touched && !X.drag) {
      X.orbit = Math.min(1, X.orbit + dt * 0.5);
      map.jumpTo({ bearing: map.getBearing() + 4.5 * X.orbit * dt });
    }
  }
  function stopEase() { try { if (X.map.isEasing && X.map.isEasing()) X.map.stop(); } catch (e) {} }

  // ---------------- UI: the label, a line of numbers, the joystick, the input pad ----------------
  function ui(o) {
    var host = o.host, pad = document.createElement('div');
    pad.style.cssText = 'position:absolute;inset:0;touch-action:none;background:transparent';
    host.insertBefore(pad, o.ui); X.pad = pad;
    var lab = document.createElement('div');
    lab.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);bottom:calc(' + (o.phone ? 76 : 96) + 'px + env(safe-area-inset-bottom));font:bold ' + (o.phone ? 13 : 15) + 'px ' + FONT + ';letter-spacing:1.5px;color:rgba(156,219,255,0.95);background:rgba(0,0,0,0.55);border:1px solid rgba(156,219,255,0.35);border-radius:6px;padding:5px 10px;white-space:nowrap;pointer-events:none;text-align:center';
    lab.className = 'st-model-note'; lab.textContent = 'MAP + ESTIMATE'; o.ui.appendChild(lab); X.lab = lab;
    var chips = document.createElement('div');
    chips.className = 'st-model-counts'; chips.style.cssText = 'position:absolute;left:16px;top:calc(' + (o.phone ? 60 : 64) + 'px + env(safe-area-inset-top));font:bold ' + (o.phone ? 16 : 20) + 'px/1.35 ' + FONT + ';color:#fff;text-shadow:0 0 4px #000,0 0 2px #000;pointer-events:none;white-space:pre';
    o.ui.appendChild(chips); X.chips = chips; setChips();
    // the joystick, touch screens only (menu-style.js:37-43: hidden on fine pointers)
    var coarse = (navigator.maxTouchPoints || 0) > 0 || (window.matchMedia && (matchMedia('(any-pointer: coarse)').matches || matchMedia('(pointer: coarse)').matches));
    var joy = document.createElement('div'), knob = document.createElement('div');
    joy.style.cssText = 'position:absolute;left:calc(16px + env(safe-area-inset-left));bottom:calc(' + (o.phone ? 120 : 150) + 'px + env(safe-area-inset-bottom));width:120px;height:120px;border-radius:50%;background:rgba(156,219,255,0.04);border:1px solid rgba(156,219,255,0.35);touch-action:none;pointer-events:auto;display:' + (coarse ? 'block' : 'none');
    knob.style.cssText = 'position:absolute;left:36px;top:36px;width:48px;height:48px;border-radius:50%;border:1px solid rgba(156,219,255,0.6);background:rgba(156,219,255,0.12);pointer-events:none';
    joy.className = 'st-joystick'; joy.setAttribute('aria-label', 'Fly: push forward or turn');
    joy.appendChild(knob); o.ui.appendChild(joy); X.joyEl = joy;
    var joyAt = function (e) { var r = joy.getBoundingClientRect(), h = r.width / 2, x = (e.clientX - r.left - h) / (h - 10), y = (e.clientY - r.top - h) / (h - 10), d = Math.hypot(x, y);
      if (d > 1) { x /= d; y /= d; } X.joy.x = x; X.joy.y = y; knob.style.left = (36 + x * 40) + 'px'; knob.style.top = (36 + y * 40) + 'px'; };   // walk-fps.js:137-139
    joy.addEventListener('pointerdown', function (e) { e.stopPropagation(); X.joy.id = e.pointerId; try { joy.setPointerCapture(e.pointerId); } catch (x) {} joyAt(e); X.touched = true; });
    joy.addEventListener('pointermove', function (e) { if (e.pointerId === X.joy.id) joyAt(e); });
    var jup = function (e) { if (e.pointerId !== X.joy.id) return; X.joy.id = null; X.joy.x = X.joy.y = 0; knob.style.left = knob.style.top = '36px'; };
    joy.addEventListener('pointerup', jup); joy.addEventListener('pointercancel', jup); joy.addEventListener('lostpointercapture', jup);
    X.resetJoy = function () { X.joy.id = null; X.joy.x = X.joy.y = 0; knob.style.left = knob.style.top = '36px'; };
    // orbit by drag, pinch or wheel to zoom, tap to skip the arrival
    pad.addEventListener('pointerdown', function (e) { X.ptr[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now() }; try { pad.setPointerCapture(e.pointerId); } catch (x) {}
      var ids = Object.keys(X.ptr); if (ids.length === 2) { var a = X.ptr[ids[0]], b = X.ptr[ids[1]]; X.pinch = Math.hypot(a.x - b.x, a.y - b.y) || 1; } });
    pad.addEventListener('pointermove', function (e) {
      var p = X.ptr[e.pointerId]; if (!p) return; var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      var ids = Object.keys(X.ptr), map = X.map;
      if (ids.length >= 2 && X.pinch) { var a = X.ptr[ids[0]], b = X.ptr[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y) || 1; stopEase(); X.touched = true;
        map.jumpTo({ zoom: Math.max(12, Math.min(19.5, map.getZoom() + Math.log(d / X.pinch) / Math.LN2)) }); X.pinch = d; return; }
      if (Math.hypot(p.x - p.x0, p.y - p.y0) > 8) { X.drag = true; X.touched = true; stopEase();
        map.jumpTo({ bearing: map.getBearing() - dx * 0.35, pitch: Math.max(0, Math.min(82, map.getPitch() + dy * 0.25)) }); }
    });
    var up = function (e) { var p = X.ptr[e.pointerId]; delete X.ptr[e.pointerId]; if (Object.keys(X.ptr).length < 2) X.pinch = 0;
      if (p && e.type === 'pointerup' && Math.hypot(p.x - p.x0, p.y - p.y0) <= 8 && X.model && X.t < X.model.end) X.skip = true;
      if (!Object.keys(X.ptr).length) X.drag = false; };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
    pad.addEventListener('wheel', function (e) { e.preventDefault(); var dy = +e.deltaY || 0; if (e.deltaMode === 1) dy *= 30; if (!isFinite(dy)) return; stopEase(); X.touched = true;
      var map = X.map; map.jumpTo({ zoom: Math.max(12, Math.min(19.5, map.getZoom() - Math.max(-1, Math.min(1, dy * 0.002)))) }); }, { passive: false });
    X.kd = function (e) { var tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA') return; var k = e.key.toLowerCase(); if (k === ' ') { X.skip = true; e.preventDefault(); return; }
      if (/^(w|a|s|d|q|e|r|f|arrowup|arrowdown|arrowleft|arrowright|\+|=|-|_|shift)$/.test(k)) { X.keys[k] = true; e.preventDefault(); } };
    X.ku = function (e) { X.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', X.kd); window.addEventListener('keyup', X.ku);
    X.blur = function () { X.keys = {}; X.resetJoy(); X.ptr = {}; X.pinch = 0; X.drag = false; }; window.addEventListener('blur', X.blur);
  }
  function setChips() {
    if (!X || !X.chips) return;
    var m = X.model, s = m && m.stats, L = [];
    L.push(X.rec.name || 'SUBSTATION');
    if (!m) L.push(X.phase === 'failed' ? 'MODEL FAILED' : 'LOADING');
    else {
      L.push(s.kvs.length ? s.kvs.slice(0, 3).join(' / ') + ' KV' : 'KV UNKNOWN');
      L.push('BY RULE'); L.push('BAYS ' + s.bays + '   TOWERS ' + s.towers);
      L.push('FENCE ' + (s.fence === 'mapped' ? 'MAPPED' : 'ESTIMATED'));
      if (cache.linesErr) L.push('LINES OFFLINE');
    }
    X.chips.textContent = L.join(' · '); X.chips.title = X.chips.textContent;
  }
  // phones: the attribution goes small along the bottom, the numbers sit under the caption, the joystick clears the label
  function phoneLayout(o, on) {
    if (!on) return;
    // All devices use one scrollable edge line, leaving the model unobscured.
    X.lab.style.display = 'none';
    X.chips.className = 'st-edge st-model-counts';
    X.chips.style.cssText = 'position:absolute;left:8px;right:8px;bottom:calc(132px + env(safe-area-inset-bottom));font:400 14px/22px ' + FONT;
    X.joyEl.style.bottom = 'calc(164px + env(safe-area-inset-bottom))';
    if (o.land) { X.chips.style.bottom = 'calc(26px + env(safe-area-inset-bottom))'; X.joyEl.style.bottom = 'calc(64px + env(safe-area-inset-bottom))'; }
    X.joyEl.style.zIndex = '5';
  }
  function exit() {
    if (!X) return;
    phoneLayout(X.o, false);
    var map = X.map;
    cancelAnimationFrame(X.raf); try { map.off('sourcedata', X.onData); } catch (e) {}
    window.removeEventListener('keydown', X.kd); window.removeEventListener('keyup', X.ku); window.removeEventListener('blur', X.blur);
    [X.pad, X.lab, X.chips, X.joyEl].forEach(function (e) { if (e && e.parentNode) e.parentNode.removeChild(e); });
    try { if (map.getLayer(layer.id)) map.removeLayer(layer.id); } catch (e) {}
    try { map.setTerrain(null); } catch (e) {}
    try { map.stop(); map.jumpTo({ pitch: 0, bearing: 0 }); } catch (e) {}
    var el = X.o.mapEl; el.style.clipPath = 'circle(' + X.o.rx.toFixed(1) + 'px at ' + X.o.cx.toFixed(1) + 'px ' + X.o.cy.toFixed(1) + 'px)'; el.style.webkitClipPath = el.style.clipPath;
    X = null; window.__see3d = null;
  }

  var api = {
    enter: enter, exit: exit,
    state: function () { if (!X) return null; var m = X.model; return { phase: X.phase, t: X.t, end: m && m.end, stats: m && m.stats, groups: m && m.groups.length, segs: m && m.v.length / 14,
      grounds: m && m.grounds.length, groundsRead: X.Hok ? Array.prototype.reduce.call(X.Hok, function (a, b) { return a + b; }, 0) : 0, buildMs: X.buildMs, packMs: X.packMs,
      osm: X.osmHow, err: X.err, draws: X.draws, renderMs: X.renderMs, zoom: X.map.getZoom(), pitch: X.map.getPitch(), bearing: X.map.getBearing(), linesErr: cache.linesErr }; },
    frameIntervals: function () { return X ? X.fiv.slice() : []; },
    skip: function () { if (X) X.skip = true; },
    _map: function () { return X && X.map; },
    relayout: function (o) { if (!X) return; Object.assign(X.o, o); X.attCss = null; phoneLayout(X.o, true); },
    model: function () { return X && X.model; },
    groundAt: function (i) { return X && X.H ? X.H[i] : null; }
  };
  window.SeeThrough3D = api;
})();
