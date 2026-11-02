// model.js - SEE THROUGH: one substation drawn BY RULE from open data, with its pylons, as a 3D wire model.
//
//   SeeModel.substation(record, data) -> model
//     record: { i, name, lat, lon, volt }   one row of the public substation table (OpenStreetMap, ODbL)
//     data:   { footprint: [[lon, lat], ...] or null   the OpenStreetMap outline (simulator footprints file or Overpass)
//               lines: { '400': [{ bbox, coords }], ... }   GridAtlas line files (OpenStreetMap, ODbL)
//               others: [{ bbox, ring }]                 other substations' outlines, so a line stops where it lands
//               osm: { busbars, transformers, buildings, portals } or null   mapped features inside the fence }
//   No site-specific code: the same function runs for all 5,800 rows (tools/run-all.mjs) and in the page (see3d.js).
//
// Model: segments in metres on the site's tangent plane (x east, y north, from place-frame toLocal around the
// substation point), heights above a ground reference. Each vertex carries (x, y, z, ga, gb, gt, s):
//   ga, gb, gt  the ground under it is (1 - gt) * ground[ga] + gt * ground[gb]   (towers and spans each stand on
//               their own ground, read from the map's terrain at run time; the compound is one level platform)
//   s           0..1 along its group, for the "draws itself" reveal.
// Groups carry the animation: { kind, kv, t0, dur, mode: 'rise' | 'reveal', col, start, count }.
//
// REUSED (owner's code, globalgrid2050 origin/main c5ac5219, energy-transition-simulator/202609282123/):
//   mod/pylons-real.js:19-23   KV table (tower height, base, arms, insulators, span, catenary a, conductor colour)
//   mod/pylons-real.js:60-91   towers along a line: vertices merged under 60 m, infill at the typical span, bisector
//   mod/pylons-real.js:94-112  the lattice tower and its conductor attachment points; :124-131 the parabolic sag
//   mod/substations.js:49-80   seg, box, fence (posts every 8 m, rails), frameOf, EST_HALF (compound size by voltage)
// ESTIMATED HERE (not surveyed; by voltage class): gantry, busbar and transformer sizes, bay layout where OpenStreetMap
// has no detail, the 66 kV tower class. Every model says which of its parts are mapped and which are drawn by rule.
(function (root) {
  'use strict';
  var PF = (typeof module !== 'undefined' && module.exports) ? require('./pf.js') : root.STPF;

  // ---- tables ----
  // pylons-real.js:19-23, verbatim values; '220' uses the 275 kV class and '66' is an estimate added here.
  var KV = {
    '400': { H: 50, base: 6.0, armZ: [0.62, 0.77, 0.92], arm: [10.5, 12.0, 9.0], ins: 4.5, span: 360, a: 1500, col: [0.25, 0.5, 1.0] },
    '275': { H: 46, base: 5.5, armZ: [0.62, 0.77, 0.92], arm: [9.5, 11.0, 8.2], ins: 3.4, span: 340, a: 1400, col: [1.0, 0.3, 0.3] },
    '132': { H: 27, base: 3.2, armZ: [0.60, 0.76, 0.92], arm: [4.6, 5.3, 4.1], ins: 1.8, span: 280, a: 1100, col: [0.2, 0.9, 0.4] },
    '66': { H: 20, base: 2.4, armZ: [0.60, 0.76, 0.92], arm: [3.2, 3.8, 3.0], ins: 1.2, span: 220, a: 900, col: [0.75, 0.35, 1.0] }
  };
  KV['220'] = Object.assign({}, KV['275'], { col: [1.0, 0.62, 0.15] });
  // GridAtlas voltage colours (shell index.html:145-151), brightened to read over imagery like pylons-real's.
  function kvCol(kv) { return kv >= 400 ? KV['400'].col : kv >= 275 ? KV['275'].col : kv >= 220 ? KV['220'].col : kv >= 132 ? KV['132'].col : kv >= 66 ? KV['66'].col : [1.0, 0.75, 0.2]; }
  var STEEL = [156 / 255, 219 / 255, 1];          // wire-look.js:17, #9cdbff
  // Substation plant by voltage (estimates, typical GB air-insulated values): gantry height, bay width, phase pitch,
  // busbar height, insulator length, transformer half-size [length, width, height].
  function plant(kv) {
    if (kv >= 400) return { h: 16, bw: 26, ph: 6.5, bb: 10, ins: 3.5, tx: [7, 4.5, 7] };
    if (kv >= 220) return { h: 14, bw: 21, ph: 5.2, bb: 9, ins: 2.8, tx: [6, 4, 6] };
    if (kv >= 132) return { h: 10.5, bw: 12, ph: 3.0, bb: 6.5, ins: 1.6, tx: [4, 2.8, 4.5] };
    if (kv >= 66) return { h: 8, bw: 8, ph: 2.0, bb: 5.5, ins: 1.0, tx: [3, 2, 3.5] };
    if (kv >= 33) return { h: 6.5, bw: 5.5, ph: 1.3, bb: 4.5, ins: 0.6, tx: [2, 1.5, 2.6] };
    return { h: 4.5, bw: 3.5, ph: 0.7, bb: 3.2, ins: 0.3, tx: [1.2, 1, 1.8] };
  }
  var EST_HALF = function (kv) { return kv >= 275 ? 90 : kv >= 132 ? 40 : kv >= 66 ? 25 : 15; };   // substations.js:80
  var MERGE_M = 60, SEG = 12, ARM_M = 4500, CAPTURE_M = 40;
  // Arrival timeline, seconds (the camera tips over first; see3d.js)
  var T = { fence: 1.0, fenceDur: 1.6, gantry: 2.3, plant: 3.0, bays: 3.6, towers: 4.1, towersEnd: 8.3, rise: 0.7, string: 0.55 };

  function kvList(v) {   // substations.js:32 kvList
    return String(v || '').split(/[;:,]/).map(function (s) { return Math.round(Number(s) / 1000); })
      .filter(function (k) { return k >= 1 && isFinite(k); }).sort(function (a, b) { return b - a; })
      .filter(function (k, i, a) { return i === 0 || a[i - 1] !== k; });
  }
  function classOf(kv) { return kv >= 400 ? '400' : kv >= 275 ? '275' : kv >= 220 ? '220' : kv >= 132 ? '132' : kv >= 66 ? '66' : null; }

  // ---- geometry helpers ----
  function Builder() { this.v = []; this.groups = []; this.g = null; }
  Builder.prototype.group = function (o) { this.g = Object.assign({ start: this.v.length / 14, count: 0, col: STEEL, mode: 'rise' }, o); this.groups.push(this.g); return this.g; };
  // one segment: a = [x, y, z], b likewise; grounds ga/gb/gt per end; s per end
  Builder.prototype.seg = function (a, b, s0, s1, G0, G1) {
    G0 = G0 || [0, 0, 0]; G1 = G1 || G0;
    this.v.push(a[0], a[1], a[2], G0[0], G0[1], G0[2], s0 == null ? 0 : s0, b[0], b[1], b[2], G1[0], G1[1], G1[2], s1 == null ? (s0 == null ? 0 : s0) : s1);
    this.g.count++;
  };
  function close(ring) { var r = ring.slice(); var a = r[0], b = r[r.length - 1]; if (a[0] !== b[0] || a[1] !== b[1]) r.push(a); return r; }
  function frameOf(ring) {   // substations.js:65-72 (centroid of the vertices, longest-edge axis, half extents, area)
    var cx = 0, cy = 0, n = ring.length - 1, i; for (i = 0; i < n; i++) { cx += ring[i][0]; cy += ring[i][1]; } cx /= n; cy /= n;
    var best = 0, ux = 1, uy = 0;
    for (i = 0; i < n; i++) { var dx = ring[i + 1][0] - ring[i][0], dy = ring[i + 1][1] - ring[i][1], l = Math.hypot(dx, dy); if (l > best) { best = l; ux = dx / l; uy = dy / l; } }
    var w = 0, d = 0; for (i = 0; i < n; i++) { var x = ring[i][0] - cx, y = ring[i][1] - cy; w = Math.max(w, Math.abs(x * ux + y * uy)); d = Math.max(d, Math.abs(-x * uy + y * ux)); }
    var area = 0; for (i = 0; i < n; i++) area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    if (d > w) { var t = ux; ux = -uy; uy = t; var q = w; w = d; d = q; }     // u along the long side
    return { cx: cx, cy: cy, ux: ux, uy: uy, vx: -uy, vy: ux, hw: w, hd: d, area: Math.abs(area) / 2 };
  }
  function inRing(x, y, R) {   // pylons-real.js:62-64, even-odd
    var c = false; for (var i = 0, j = R.length - 1; i < R.length; j = i++) { var xi = R[i][0], yi = R[i][1], xj = R[j][0], yj = R[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c;
  }
  function nearestOnSeg(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, t = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
    var x = ax + dx * t, y = ay + dy * t; return { x: x, y: y, t: t, d: Math.hypot(px - x, py - y) };
  }
  function ringDist(x, y, R) {   // 0 inside, else distance to the outline
    if (inRing(x, y, R)) return 0; var b = 1e18; for (var i = 0; i + 1 < R.length; i++) b = Math.min(b, nearestOnSeg(x, y, R[i][0], R[i][1], R[i + 1][0], R[i + 1][1]).d); return b;
  }
  function ringNearest(x, y, R) { var b = null; for (var i = 0; i + 1 < R.length; i++) { var q = nearestOnSeg(x, y, R[i][0], R[i][1], R[i + 1][0], R[i + 1][1]); if (!b || q.d < b.d) { b = q; b.e = i; } } return b; }
  function segCross(a, b, c, d) {   // segment ab with cd: param on ab or -1
    var r0 = b[0] - a[0], r1 = b[1] - a[1], s0 = d[0] - c[0], s1 = d[1] - c[1], den = r0 * s1 - r1 * s0; if (Math.abs(den) < 1e-12) return -1;
    var t = ((c[0] - a[0]) * s1 - (c[1] - a[1]) * s0) / den, u = ((c[0] - a[0]) * r1 - (c[1] - a[1]) * r0) / den;
    return (t >= 0 && t <= 1 && u >= 0 && u <= 1) ? t : -1;
  }

  // ---- pieces ----
  function fence(B, ring, dashed, G) {   // substations.js:54-64, with the reveal parameter s along the perimeter
    var per = 0, i; for (i = 0; i + 1 < ring.length; i++) per += Math.hypot(ring[i + 1][0] - ring[i][0], ring[i + 1][1] - ring[i][1]);
    var run = 0;
    for (i = 0; i + 1 < ring.length; i++) {
      var a = ring[i], b = ring[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), n = Math.max(1, Math.round(len / 8));
      for (var k = 0; k < n; k++) {
        var p = [a[0] + dx * k / n, a[1] + dy * k / n], q = [a[0] + dx * (k + 1) / n, a[1] + dy * (k + 1) / n];
        var s0 = (run + len * k / n) / per, s1 = (run + len * (k + 1) / n) / per;
        B.seg([p[0], p[1], 0], [p[0], p[1], 2.4], s0, s0, G);
        if (dashed) { var m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; B.seg([p[0], p[1], 2.4], [m[0], m[1], 2.4], s0, (s0 + s1) / 2, G); B.seg([p[0], p[1], 0.1], [m[0], m[1], 0.1], s0, (s0 + s1) / 2, G); }
        else { B.seg([p[0], p[1], 2.4], [q[0], q[1], 2.4], s0, s1, G); B.seg([p[0], p[1], 0.1], [q[0], q[1], 0.1], s0, s1, G); B.seg([p[0], p[1], 1.2], [q[0], q[1], 1.2], s0, s1, G); }
      }
      run += len;
    }
  }
  // An oriented lattice box column from z0 to z1 (a gantry leg): 4 corner posts, square frames and X bracing.
  function column(B, x, y, ux, uy, w, z0, z1, G) {
    var vx = -uy, vy = ux, h = w / 2, C = [[-h, -h], [h, -h], [h, h], [-h, h]].map(function (p) { return [x + p[0] * ux + p[1] * vx, y + p[0] * uy + p[1] * vy]; });
    var n = Math.max(1, Math.round((z1 - z0) / Math.max(1.2, w * 1.4)));
    for (var k = 0; k <= n; k++) {
      var z = z0 + (z1 - z0) * k / n, zn = z0 + (z1 - z0) * (k + 1) / n;
      for (var i = 0; i < 4; i++) { var a = C[i], b = C[(i + 1) % 4];
        if (k > 0) B.seg([a[0], a[1], z], [b[0], b[1], z]);
        if (k < n) { B.seg([a[0], a[1], z], [a[0], a[1], zn]); B.seg([a[0], a[1], z], [b[0], b[1], zn]); } }
    }
  }
  // A truss beam between two points at height z: two chords, depth d, zigzag web.
  function truss(B, a, b, z, d, G) {
    var len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / Math.max(1, d * 1.2)));
    B.seg([a[0], a[1], z], [b[0], b[1], z]); B.seg([a[0], a[1], z - d], [b[0], b[1], z - d]);
    for (var k = 0; k <= n; k++) { var t = k / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      B.seg([x, y, z], [x, y, z - d]);
      if (k < n) { var t2 = (k + 1) / n, x2 = a[0] + (b[0] - a[0]) * t2, y2 = a[1] + (b[1] - a[1]) * t2; if (k % 2) B.seg([x, y, z], [x2, y2, z - d]); else B.seg([x, y, z - d], [x2, y2, z]); } }
  }
  function box(B, cx, cy, ux, uy, hl, hw, z0, h) {   // substations.js:50-53, oriented box with a base level
    var vx = -uy, vy = ux, P = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]].map(function (p) { return [cx + p[0] * ux + p[1] * vx, cy + p[0] * uy + p[1] * vy]; });
    for (var i = 0; i < 4; i++) { var a = P[i], b = P[(i + 1) % 4]; B.seg([a[0], a[1], z0], [b[0], b[1], z0]); B.seg([a[0], a[1], z0 + h], [b[0], b[1], z0 + h]); B.seg([a[0], a[1], z0], [a[0], a[1], z0 + h]); }
    return P;
  }
  function sagLine(B, A, Bp, sag, n, s0, s1, GA, GB) {   // parabola (pylons-real.js:129); grounds blended along the span
    var prev = A, pg = GA;
    for (var k = 1; k <= n; k++) {
      var t = k / n, p = [A[0] + (Bp[0] - A[0]) * t, A[1] + (Bp[1] - A[1]) * t, A[2] + (Bp[2] - A[2]) * t - 4 * sag * t * (1 - t)];
      var g = GA[0] === GB[0] ? GA : [GA[0], GB[0], t];
      if (GA[0] === GB[0]) g = GA; else if (k === n) g = GB;
      B.seg(prev, p, s0 + (s1 - s0) * (k - 1) / n, s0 + (s1 - s0) * t, pg, g); prev = p; pg = g;
    }
  }
  // pylons-real.js:94-111, verbatim, geometry in tower-frame metres (along, left, up)
  function lattice(g) {
    var L = [], H = g.H, b = g.base, zw = g.armZ[0] * H - 2, w = b * 0.32, zt = g.armZ[2] * H + 1, wt = w * 0.8;
    var half = function (z) { return z <= zw ? b + (w - b) * z / zw : w + (wt - w) * (z - zw) / (zt - zw); };
    var lv = [0, zw * 0.3, zw * 0.58, zw * 0.8, zw].concat(g.armZ.map(function (f) { return f * H; }), [zt]);
    var sq = function (z) { var h = half(z); return [[-h, -h, z], [h, -h, z], [h, h, z], [-h, h, z]]; };
    for (var k = 0; k < lv.length; k++) {
      var A = sq(lv[k]), i, j;
      for (i = 0; i < 4; i++) { j = (i + 1) % 4; if (k > 0) L.push(A[i].concat(A[j])); }
      if (k + 1 < lv.length) { var Bq = sq(lv[k + 1]);
        for (i = 0; i < 4; i++) { j = (i + 1) % 4; L.push(A[i].concat(Bq[i]));
          if (lv[k] < zw) L.push(A[i].concat(Bq[j]), A[j].concat(Bq[i])); else L.push(A[i].concat(Bq[j])); } }
    }
    sq(zt).forEach(function (p) { L.push(p.concat([0, 0, H])); });          // earth-wire peak
    g.armZ.forEach(function (f, k) { var z = f * H, h = half(z), a = g.arm[k];     // crossarms, both sides
      [-1, 1].forEach(function (s) { var tip = [0, s * a, z];
        L.push([-h, s * h, z].concat(tip), [h, s * h, z].concat(tip), [-h, s * h, z - 2.2].concat(tip), [h, s * h, z - 2.2].concat(tip), tip.concat([0, s * a, z - g.ins])); }); });
    return L;
  }
  var attach = function (g) { var P = []; g.armZ.forEach(function (f, k) { [-1, 1].forEach(function (s) { P.push([s * g.arm[k], f * g.H - g.ins]); }); }); P.push([0, g.H]); return P; };   // pylons-real.js:112

  // towers along one arm (an outward polyline in local metres): pylons-real.js:68-91, plus a stop at another substation
  function towersOn(arm, cls, others, own) {
    var P = [], i;
    for (i = 0; i < arm.length; i++) { if (!P.length || Math.hypot(arm[i][0] - P[P.length - 1].p[0], arm[i][1] - P[P.length - 1].p[1]) >= MERGE_M) P.push({ p: arm[i], est: false }); }
    var last = arm[arm.length - 1]; if (P.length > 1 && Math.hypot(P[P.length - 1].p[0] - last[0], P[P.length - 1].p[1] - last[1]) > 1) P[P.length - 1] = { p: last, est: false };
    var Tw = [];
    for (i = 0; i < P.length; i++) {
      Tw.push(P[i]);
      if (i + 1 < P.length) { var d = Math.hypot(P[i + 1].p[0] - P[i].p[0], P[i + 1].p[1] - P[i].p[1]), n = Math.round(d / KV[cls].span) - 1;
        for (var k = 1; k <= n; k++) { var t = k / (n + 1), a = P[i].p, b = P[i + 1].p; Tw.push({ p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], est: true }); } }
    }
    var out = [];
    for (i = 0; i < Tw.length; i++) {
      var q = Tw[i].p;
      if (i === 0 && Tw.length > 1) continue;                       // arm[0] is where the line crosses the fence: the gantry takes it
      if (inRing(q[0], q[1], own)) continue;
      var hit = false; for (var o = 0; o < others.length; o++) { var R = others[o]; if (q[0] >= R.bb[0] && q[0] <= R.bb[2] && q[1] >= R.bb[1] && q[1] <= R.bb[3] && inRing(q[0], q[1], R.ring)) { hit = true; break; } }
      if (hit) break;                                                // the line lands at another substation: stop
      out.push({ p: q, est: Tw[i].est });
    }
    for (i = 0; i < out.length; i++) {                              // along-line direction: bisector at angle towers
      var t0 = out[i], dir = [0, 0];
      [i - 1, i + 1].forEach(function (j) { var o2 = out[j]; if (!o2) return; var s = j < i ? 1 : -1, dx = (t0.p[0] - o2.p[0]) * s, dy = (t0.p[1] - o2.p[1]) * s, l = Math.hypot(dx, dy) || 1; dir[0] += dx / l; dir[1] += dy / l; });
      if (out.length === 1) { dir = [arm[arm.length - 1][0] - arm[0][0], arm[arm.length - 1][1] - arm[0][1]]; }
      var l = Math.hypot(dir[0], dir[1]) || 1; t0.u = [dir[0] / l, dir[1] / l];
    }
    return out;
  }

  // ---- the rule ----
  function substation(rec, data) {
    data = data || {};
    var lat = +rec.lat, lon = +rec.lon;
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 85) throw Error('no usable position');
    var anchor = { lat: lat, lon: lon };
    var loc = function (la, lo) { var q = PF.toLocal(anchor, la, lo, 0); return [q.x, q.y]; };
    var kvs = kvList(rec.volt), top = kvs[0] || 0, topEst = !top; if (!top) top = 33;
    var stats = { i: rec.i, kvs: kvs.slice(), top: top, voltage: topEst ? 'not in the public file: 33 kV class assumed' : 'public file',
      fence: '', busbars: '', transformers: '', buildings: 0, bays: 0, towers: 0, towersMapped: 0, towersInfill: 0, arms: 0, armKm: 0, gantries: '' };
    var B = new Builder();
    var grounds = [{ x: 0, y: 0, lat: lat, lon: lon, kind: 'compound' }];   // ground 0: the compound platform
    var G0 = [0, 0, 0];

    // fence: the mapped outline, else a square of typical size for the voltage (dashed: an estimate)
    var ring, dashed = false;
    if (data.footprint && data.footprint.length >= 4) { ring = close(data.footprint.map(function (p) { return loc(p[1], p[0]); })); stats.fence = 'mapped'; }
    else { var h = EST_HALF(top); ring = [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]]; dashed = true; stats.fence = 'estimated'; }
    var f = frameOf(ring);
    grounds[0].x = f.cx; grounds[0].y = f.cy;
    var g0 = PF.fromLocal(anchor, f.cx, f.cy, 0); grounds[0].lat = g0.lat; grounds[0].lon = g0.lon;
    B.group({ kind: 'fence', t0: T.fence, dur: T.fenceDur, mode: 'reveal', col: STEEL }); fence(B, ring, dashed, G0);

    // other substations near here (their outlines stop a line's towers)
    var others = [];
    (data.others || []).forEach(function (o) {
      if (o.i === rec.i) return; var r = close(o.ring.map(function (p) { return loc(p[1], p[0]); })), bb = [1e9, 1e9, -1e9, -1e9];
      r.forEach(function (p) { bb[0] = Math.min(bb[0], p[0]); bb[1] = Math.min(bb[1], p[1]); bb[2] = Math.max(bb[2], p[0]); bb[3] = Math.max(bb[3], p[1]); });
      others.push({ ring: r, bb: bb });
    });

    // landings: every GridAtlas line that comes within CAPTURE_M of the fence is split at its nearest point; each part
    // that runs on outward is one circuit arriving, with its gantry where it crosses the fence
    var R0 = Math.max(f.hw, f.hd), lonR = (ARM_M + R0) / (111320 * Math.cos(lat * Math.PI / 180)), latR = (ARM_M + R0) / 110574;
    var landings = [];
    Object.keys(data.lines || {}).forEach(function (cls) {
      var kvn = +cls; if (!KV[cls]) return;
      (data.lines[cls] || []).forEach(function (ln, li) {
        var bb = ln.bbox; if (bb[2] < lon - lonR || bb[0] > lon + lonR || bb[3] < lat - latR || bb[1] > lat + latR) return;
        var c = ln.coords, nb = Math.min(lonR, 0.02), quick = false, k;
        for (k = 0; k < c.length; k++) if (Math.abs(c[k][0] - lon) < nb * 3 && Math.abs(c[k][1] - lat) < latR) { quick = true; break; }
        if (!quick && c.length > 1) { /* long segments may still pass close: checked below */ }
        var L = c.map(function (p) { return loc(p[1], p[0]); });
        var best = null;
        for (k = 0; k + 1 < L.length; k++) {
          var q = nearestOnSeg(f.cx, f.cy, L[k][0], L[k][1], L[k + 1][0], L[k + 1][1]);
          var dq = ringDist(q.x, q.y, ring);
          if (dq <= CAPTURE_M) { var dc = Math.hypot(q.x - f.cx, q.y - f.cy); if (!best || dc < best.dc) best = { k: k, q: q, dc: dc }; }
        }
        if (!best && L.length === 1) return;
        if (!best) return;
        var P = [best.q.x, best.q.y];
        var fwd = [P].concat(L.slice(best.k + 1)), back = [P].concat(L.slice(0, best.k + 1).reverse());
        [fwd, back].forEach(function (arm) {
          // trim to ARM_M of length and find where it leaves the fence
          var out = [arm[0]], len = 0, reach = 0;
          for (var j = 1; j < arm.length && len < ARM_M; j++) { var d = Math.hypot(arm[j][0] - arm[j - 1][0], arm[j][1] - arm[j - 1][1]); len += d; out.push(arm[j]); reach = Math.max(reach, ringDist(arm[j][0], arm[j][1], ring)); }
          if (reach < 120) return;                                      // ends inside or just by the fence: not a circuit arriving
          var cross = null, ci = 0;
          if (inRing(out[0][0], out[0][1], ring)) {
            for (j = 0; j + 1 < out.length && !cross; j++) for (var e = 0; e + 1 < ring.length; e++) { var t = segCross(out[j], out[j + 1], ring[e], ring[e + 1]); if (t >= 0) { cross = [out[j][0] + (out[j + 1][0] - out[j][0]) * t, out[j][1] + (out[j + 1][1] - out[j][1]) * t]; ci = j + 1; break; } }
          }
          if (!cross) { var rn = ringNearest(out[0][0], out[0][1], ring); cross = [rn.x, rn.y]; ci = 1; }
          var armOut = [cross].concat(out.slice(ci));
          var far = armOut[Math.min(armOut.length - 1, 1)], dx = far[0] - cross[0], dy = far[1] - cross[1], dl = Math.hypot(dx, dy) || 1;
          landings.push({ cls: cls, kv: kvn, cross: cross, dir: [dx / dl, dy / dl], arm: armOut, line: li, len: len });
        });
      });
    });

    // one gantry per landing circuit, just inside the fence on the side the line arrives from; spread when they crowd
    var gantries = [];
    landings.sort(function (a, b) { return b.kv - a.kv; });
    landings.forEach(function (Ld) {
      var pl = plant(Ld.kv), inx = f.cx - Ld.cross[0], iny = f.cy - Ld.cross[1], il = Math.hypot(inx, iny) || 1;
      var inset = Math.min(8, Math.max(2, Math.min(f.hw, f.hd) * 0.15));
      var gx = Ld.cross[0] + inx / il * inset, gy = Ld.cross[1] + iny / il * inset;
      var ax = -Ld.dir[1], ay = Ld.dir[0];                            // the beam runs across the incoming line
      for (var tries = 0; tries < 6; tries++) {
        var clash = gantries.some(function (o) { return Math.hypot(o.x - gx, o.y - gy) < (o.pl.bw + pl.bw) / 2 + 2; });
        if (!clash) break; var sgn = tries % 2 ? -1 : 1, st = (Math.floor(tries / 2) + 1) * (pl.bw + 3) * sgn; gx += ax * st; gy += ay * st;
      }
      // a mapped portal within 50 m takes the gantry to its true place
      var portal = null;
      (data.osm && data.osm.portals || []).forEach(function (p) { var q = loc(p.lat, p.lon), d = Math.hypot(q[0] - gx, q[1] - gy); if (d < 50 && (!portal || d < portal.d) && !p.used) portal = { d: d, x: q[0], y: q[1], p: p }; });
      var bw = pl.bw;
      if (portal) { gx = portal.x; gy = portal.y; portal.p.used = true;
        if (portal.p.a) { var pa = loc(portal.p.a[1], portal.p.a[0]), pb = loc(portal.p.b[1], portal.p.b[0]), pdx = pb[0] - pa[0], pdy = pb[1] - pa[1], pll = Math.hypot(pdx, pdy);
          if (pll > 2) { ax = pdx / pll; ay = pdy / pll; bw = Math.max(pl.ph * 2.6, Math.min(pl.bw * 1.6, pll)); } } }
      gantries.push({ x: gx, y: gy, ax: ax, ay: ay, ux: Ld.dir[0], uy: Ld.dir[1], pl: Object.assign({}, pl, { bw: bw }), L: Ld, mapped: !!portal });
    });
    var spare = [];
    (data.osm && data.osm.portals || []).forEach(function (p) { if (p.used) return; var q = loc(p.lat, p.lon); if (!inRing(q[0], q[1], ring) && ringDist(q[0], q[1], ring) > 10) return;
      var kv = kvList(p.voltage)[0] || top, pl = plant(kv), ax = f.ux, ay = f.uy, bw = pl.bw;
      if (p.a) { var pa = loc(p.a[1], p.a[0]), pb = loc(p.b[1], p.b[0]), dx = pb[0] - pa[0], dy = pb[1] - pa[1], l = Math.hypot(dx, dy); if (l > 2) { ax = dx / l; ay = dy / l; bw = Math.max(pl.ph * 2.6, Math.min(pl.bw * 1.6, l)); } }
      spare.push({ x: q[0], y: q[1], ax: ax, ay: ay, pl: Object.assign({}, pl, { bw: bw }), L: { kv: kv }, mapped: true, spare: true }); });
    stats.portals = (data.osm && data.osm.portals || []).length;
    stats.gantries = gantries.length ? (gantries.filter(function (g) { return g.mapped; }).length + ' at mapped portals, ' + gantries.filter(function (g) { return !g.mapped; }).length + ' by rule') : 'none';
    stats.bays = gantries.length;

    gantries.concat(spare).forEach(function (g, k) {
      var pl = g.pl, hb = pl.bw / 2;
      B.group({ kind: 'gantry', kv: g.L.kv, t0: T.gantry + 0.07 * k, dur: 0.8, mode: 'rise', col: STEEL });
      var A = [g.x - g.ax * hb, g.y - g.ay * hb], Bq = [g.x + g.ax * hb, g.y + g.ay * hb], w = Math.max(0.5, pl.h * 0.07);
      column(B, A[0], A[1], g.ax, g.ay, w, 0, pl.h, G0); column(B, Bq[0], Bq[1], g.ax, g.ay, w, 0, pl.h, G0);
      truss(B, A, Bq, pl.h, Math.max(0.6, pl.h * 0.08), G0);
      g.phase = [-1, 0, 1].map(function (s) { var x = g.x + g.ax * s * pl.ph, y = g.y + g.ay * s * pl.ph; B.seg([x, y, pl.h - 0.2], [x, y, pl.h - pl.ins]); return [x, y, pl.h - pl.ins]; });
    });

    // busbars: as mapped, else one per voltage class across the compound's long axis (double for 220 kV and above)
    var bars = [], classes = kvs.length ? kvs.filter(function (k) { return k >= 11; }).slice(0, 3) : [top];
    if (!classes.length) classes = [top];
    var mappedBars = (data.osm && data.osm.busbars || []).filter(function (b) { return b.coords && b.coords.length >= 2; });
    if (mappedBars.length) {
      mappedBars.forEach(function (b) { var kv = kvList(b.voltage)[0] || top; var P = b.coords.map(function (p) { return loc(p[1], p[0]); }); bars.push({ kv: kv, pts: P, mapped: true }); });
      stats.busbars = mappedBars.length + ' mapped';
    }
    var bayL = (data.osm && data.osm.bayLines || []).filter(function (b) { return b.coords && b.coords.length >= 2; });
    if (bayL.length) { bayL.forEach(function (b) { var kv = kvList(b.voltage)[0] || top; bars.push({ kv: kv, pts: b.coords.map(function (p) { return loc(p[1], p[0]); }), mapped: true, bay: true }); }); stats.bayLines = bayL.length; }
    if (mappedBars.length) {} else {
      var nC = classes.length, offs = nC === 1 ? [0] : nC === 2 ? [0.32, -0.36] : [0.45, 0, -0.45];
      classes.forEach(function (kv, ci) {
        var pl = plant(kv), half = Math.max(8, Math.min(f.hw - 6, f.hw * 0.72)), o = offs[ci] * f.hd;
        var sets = kv >= 220 ? [-1, 1] : [0];
        sets.forEach(function (sv) {
          var oo = o + sv * (pl.ph * 1.6 + 2);
          bars.push({ kv: kv, pts: [[f.cx - f.ux * half + f.vx * oo, f.cy - f.uy * half + f.vy * oo], [f.cx + f.ux * half + f.vx * oo, f.cy + f.uy * half + f.vy * oo]], mapped: false });
        });
      });
      stats.busbars = bars.length + ' by rule';
    }
    var lit = [];
    bars.forEach(function (bar, k) {
      var pl = plant(bar.kv), P = bar.pts;
      B.group({ kind: 'busbar-posts', kv: bar.kv, t0: T.plant + 0.05 * k, dur: 0.7, mode: 'rise', col: STEEL });
      for (var j = 0; j + 1 < P.length; j++) {
        var dx = P[j + 1][0] - P[j][0], dy = P[j + 1][1] - P[j][1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, n = Math.max(1, Math.round(l / 20));
        for (var q = 0; q <= n; q++) { if (j > 0 && q === 0) continue; var x = P[j][0] + dx * q / n, y = P[j][1] + dy * q / n;
          [-1, 0, 1].forEach(function (s) { var px = x + nx * s * pl.ph, py = y + ny * s * pl.ph; B.seg([px, py, 0], [px, py, pl.bb - pl.ins * 0.6]); B.seg([px, py, pl.bb - pl.ins * 0.6], [px, py, pl.bb]); });
          B.seg([x - nx * pl.ph, y - ny * pl.ph, pl.bb - pl.ins * 0.6], [x + nx * pl.ph, y + ny * pl.ph, pl.bb - pl.ins * 0.6]);
        }
      }
      B.group({ kind: 'busbar', kv: bar.kv, t0: T.plant + 0.5, dur: 0.6, mode: 'reveal', col: kvCol(bar.kv), lights: true });
      var tot = 0, acc = 0; for (j = 0; j + 1 < P.length; j++) tot += Math.hypot(P[j + 1][0] - P[j][0], P[j + 1][1] - P[j][1]);
      for (j = 0; j + 1 < P.length; j++) {
        var ddx = P[j + 1][0] - P[j][0], ddy = P[j + 1][1] - P[j][1], ll = Math.hypot(ddx, ddy) || 1, mx = -ddy / ll, my = ddx / ll;
        [-1, 0, 1].forEach(function (s) { B.seg([P[j][0] + mx * s * pl.ph, P[j][1] + my * s * pl.ph, pl.bb], [P[j + 1][0] + mx * s * pl.ph, P[j + 1][1] + my * s * pl.ph, pl.bb], acc / (tot || 1), (acc + ll) / (tot || 1)); });
        acc += ll;
      }
      lit.push(bar);
    });
    function nearestBar(x, y, kv) {
      var best = null; bars.forEach(function (bar) { var pen = Math.abs(bar.kv - kv) > 1 ? 1e5 : 0;
        for (var j = 0; j + 1 < bar.pts.length; j++) { var q = nearestOnSeg(x, y, bar.pts[j][0], bar.pts[j][1], bar.pts[j + 1][0], bar.pts[j + 1][1]); if (!best || q.d + pen < best.d) best = { d: q.d + pen, x: q.x, y: q.y, bar: bar }; } });
      return best;
    }

    // transformers: as mapped, else between voltage classes (count by area), each with tank, conservator and bushings
    var txs = [], mappedTx = data.osm && data.osm.transformers || [];
    if (mappedTx.length) {
      mappedTx.forEach(function (t) {
        var kv = kvList(t.voltage)[0] || top, q, ux = f.ux, uy = f.uy, hl = plant(kv).tx[0], hw2 = plant(kv).tx[1];
        if (t.ring && t.ring.length >= 4) { var r = close(t.ring.map(function (p) { return loc(p[1], p[0]); })), fr = frameOf(r); q = [fr.cx, fr.cy]; ux = fr.ux; uy = fr.uy; hl = Math.max(1, fr.hw); hw2 = Math.max(0.8, fr.hd); }
        else q = loc(t.lat, t.lon);
        txs.push({ x: q[0], y: q[1], ux: ux, uy: uy, hl: hl, hw: hw2, h: plant(kv).tx[2], kv: kv, mapped: true });
      });
      stats.transformers = mappedTx.length + ' mapped';
    } else if (classes.length >= 2) {
      var area = f.area, per = top >= 275 ? 14000 : top >= 132 ? 5000 : 2000, n = Math.max(1, Math.min(4, Math.round(area / per)));
      var pl0 = plant(classes[0]), oT = (classes.length === 2 ? -0.02 : 0.22) * f.hd, span2 = Math.min(f.hw * 0.55, n * pl0.tx[0] * 3);
      for (var t = 0; t < n; t++) { var a2 = n === 1 ? 0 : (t / (n - 1) - 0.5) * 2 * span2; txs.push({ x: f.cx + f.ux * a2 + f.vx * oT, y: f.cy + f.uy * a2 + f.vy * oT, ux: f.vx, uy: f.vy, hl: pl0.tx[0], hw: pl0.tx[1], h: pl0.tx[2], kv: classes[0], mapped: false }); }
      stats.transformers = n + ' by rule';
    } else stats.transformers = 'none';
    txs.forEach(function (tx, k) {
      B.group({ kind: 'transformer', kv: tx.kv, t0: T.plant + 0.12 * k, dur: 0.8, mode: 'rise', col: STEEL });
      box(B, tx.x, tx.y, tx.ux, tx.uy, tx.hl, tx.hw, 0, tx.h);
      var vx = -tx.uy, vy = tx.ux;
      for (var r2 = -2; r2 <= 2; r2++) { var rx = tx.x + vx * (tx.hw + 0.8) + tx.ux * r2 * tx.hl * 0.35, ry = tx.y + vy * (tx.hw + 0.8) + tx.uy * r2 * tx.hl * 0.35; B.seg([rx, ry, 0.5], [rx, ry, tx.h * 0.85]); }
      box(B, tx.x - tx.ux * tx.hl * 0.6, tx.y - tx.uy * tx.hl * 0.6, tx.ux, tx.uy, tx.hl * 0.3, tx.hw * 0.25, tx.h, tx.hw * 0.5);
      tx.bush = [-1, 0, 1].map(function (s) { var x = tx.x + tx.ux * s * tx.hl * 0.45, y = tx.y + tx.uy * s * tx.hl * 0.45, ht = tx.h + tx.h * 0.5; B.seg([x, y, tx.h], [x, y, ht]); return [x, y, ht]; });
    });
    // buildings as mapped (walls and roof outline); nothing is invented where none is mapped
    var blds = data.osm && data.osm.buildings || [];
    blds.forEach(function (b) {
      if (!b.ring || b.ring.length < 4) return; var r = close(b.ring.map(function (p) { return loc(p[1], p[0]); })), c = frameOf(r);
      if (!inRing(c.cx, c.cy, ring)) return;
      var hgt = isFinite(+b.levels) && +b.levels > 0 ? +b.levels * 3.5 : (isFinite(parseFloat(b.height)) ? parseFloat(b.height) : 6);
      B.group({ kind: 'building', t0: T.plant + 0.2, dur: 0.8, mode: 'rise', col: STEEL });
      for (var j = 0; j + 1 < r.length; j++) { B.seg([r[j][0], r[j][1], 0], [r[j + 1][0], r[j + 1][1], 0]); B.seg([r[j][0], r[j][1], hgt], [r[j + 1][0], r[j + 1][1], hgt]); B.seg([r[j][0], r[j][1], 0], [r[j][0], r[j][1], hgt]); }
      stats.buildings++;
    });

    // bays: gantry phases to the nearest busbar of that voltage, through a breaker and an isolator on posts
    gantries.forEach(function (g) {
      var pl = g.pl, nb = nearestBar(g.x, g.y, g.L.kv); if (!nb) return;
      B.group({ kind: 'bay', kv: g.L.kv, t0: T.bays, dur: 0.6, mode: 'reveal', col: kvCol(g.L.kv) });
      var dx = nb.x - g.x, dy = nb.y - g.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, vx = -uy, vy = ux, bpl = plant(nb.bar.kv);
      var eq = [0.35, 0.65].map(function (t) { return [g.x + dx * t, g.y + dy * t]; });
      [-1, 0, 1].forEach(function (s, k) {
        var a = g.phase[k], e1 = [eq[0][0] + vx * s * pl.ph * 0.7, eq[0][1] + vy * s * pl.ph * 0.7, pl.bb * 0.55], e2 = [eq[1][0] + vx * s * pl.ph * 0.7, eq[1][1] + vy * s * pl.ph * 0.7, pl.bb * 0.6];
        var bt = [nb.x + vx * s * bpl.ph, nb.y + vy * s * bpl.ph, bpl.bb];
        if (l < 3) { B.seg(a, bt, 0, 1); return; }
        sagLine(B, a, e1, 0.3, 3, 0, 0.4, G0, G0); B.seg(e1, e2, 0.4, 0.7); sagLine(B, e2, bt, 0.2, 3, 0.7, 1, G0, G0);
      });
      B.group({ kind: 'bay-plant', kv: g.L.kv, t0: T.bays - 0.3, dur: 0.6, mode: 'rise', col: STEEL });
      eq.forEach(function (p, j) { [-1, 0, 1].forEach(function (s) { var x = p[0] + vx * s * pl.ph * 0.7, y = p[1] + vy * s * pl.ph * 0.7, z = pl.bb * (j ? 0.6 : 0.55);
        B.seg([x, y, 0], [x, y, z]); if (!j) box(B, x, y, ux, uy, Math.max(0.3, pl.ph * 0.12), Math.max(0.3, pl.ph * 0.12), z * 0.55, z * 0.3); }); });
    });
    // transformer bushings to the busbars either side
    if (txs.length) {
      B.group({ kind: 'droppers', t0: T.bays, dur: 0.6, mode: 'reveal', col: kvCol(top) });
      txs.forEach(function (tx) { var hi = nearestBar(tx.bush[0][0], tx.bush[0][1], tx.kv), lo = classes.length > 1 ? nearestBar(tx.bush[2][0], tx.bush[2][1], classes[1]) : null;
        if (hi) [0, 1, 2].forEach(function (k) { var b = tx.bush[k]; sagLine(B, b, [hi.x + (k - 1) * plant(hi.bar.kv).ph * (k === 1 ? 0 : 1), hi.y, plant(hi.bar.kv).bb], 0.4, 3, 0, 1, G0, G0); });
        if (lo && lo.bar !== (hi && hi.bar)) { var b2 = tx.bush[2]; sagLine(B, [b2[0], b2[1], tx.h * 0.9], [lo.x, lo.y, plant(lo.bar.kv).bb], 0.3, 3, 0, 1, G0, G0); } });
    }

    // pylons: from each gantry the owner's towers march away along the real line, conductors sagging span by span
    var maxRank = 1; var armTowers = gantries.map(function (g) { var tw = towersOn(g.L.arm, g.L.cls, others, ring); maxRank = Math.max(maxRank, tw.length); return tw; });
    var step = Math.min(0.24, (T.towersEnd - T.towers) / maxRank);
    gantries.forEach(function (g, gi) {
      var tw = armTowers[gi], cls = g.L.cls, kg = KV[cls]; if (!tw.length) return;
      stats.arms++; var armLen = 0;
      var prevPts = g.phase.concat(g.phase), prevG = G0, prevT = null;     // the gantry takes both circuits' phases
      tw.forEach(function (t, r) {
        var gi2 = grounds.length; var gg = PF.fromLocal(anchor, t.p[0], t.p[1], 0); grounds.push({ x: t.p[0], y: t.p[1], lat: gg.lat, lon: gg.lon, kind: 'tower' });
        var G = [gi2, gi2, 0], u = t.u, v = [-u[1], u[0]];
        var X = function (a, l, z) { return [t.p[0] + u[0] * a + v[0] * l, t.p[1] + u[1] * a + v[1] * l, z]; };
        var t0 = T.towers + r * step;
        B.group({ kind: 'tower', kv: +cls, t0: t0, dur: T.rise, mode: 'rise', col: STEEL, est: t.est, rank: r });
        lattice(kg).forEach(function (s) { B.seg(X(s[0], s[1], s[2]), X(s[3], s[4], s[5]), 0, 0, G, G); });
        var at = attach(kg).map(function (p) { return X(0, p[0], p[1]); });
        // conductors from the previous support (gantry or tower) to this one: 3 phases a side + earth wire
        B.group({ kind: 'span', kv: +cls, t0: t0 + T.rise * 0.7, dur: T.string, mode: 'reveal', col: kg.col, rank: r });
        var d = prevT ? Math.hypot(t.p[0] - prevT.p[0], t.p[1] - prevT.p[1]) : Math.hypot(t.p[0] - g.x, t.p[1] - g.y);
        armLen += d;
        var sag = d * d / (8 * kg.a);
        // gantry span: tower phases ordered as [left low, right low, left mid, right mid, left top, right top, peak];
        // the gantry offers three phases, so each side's three land on them (a terminal span); no earth wire to the gantry
        for (var k = 0; k < 6; k++) {
          var A = prevT ? prevT.at[k] : prevPts[k % 2 === 0 ? Math.floor(k / 2) : 2 - Math.floor(k / 2)];
          sagLine(B, A, at[k], prevT ? sag : sag * 0.5, prevT ? SEG : 6, 0, 1, prevG, G);
        }
        if (prevT) sagLine(B, prevT.at[6], at[6], sag * 0.7, SEG, 0, 1, prevG, G);
        t.at = at; prevT = t; prevG = G;
        stats.towers++; if (t.est) stats.towersInfill++; else stats.towersMapped++;
      });
      stats.armKm += armLen / 1000;
    });
    stats.armKm = +stats.armKm.toFixed(2);
    // size of the whole model, for the camera
    var ext = Math.max(f.hw, f.hd);
    return { v: B.v, groups: B.groups, grounds: grounds, anchor: anchor, frame: f, ring: ring, stats: stats, extent: ext, timeline: T,
      end: Math.max(T.towers + maxRank * step + T.rise + T.string, T.bays + 1) };
  }


  // ---- OpenStreetMap detail inside one fence: the Overpass query (one per site) and the parser (page and tools) ----
  // Query: busbars, bays, transformers, portals and buildings in the outline's box (or 150 m round the point).
  function osmQuery(rec, footprint) {
    var w = +rec.lon - 0.0022, e = +rec.lon + 0.0022, s = +rec.lat - 0.00135, n = +rec.lat + 0.00135;
    if (footprint && footprint.length) { w = 180; e = -180; s = 90; n = -90; footprint.forEach(function (p) { w = Math.min(w, p[0]); e = Math.max(e, p[0]); s = Math.min(s, p[1]); n = Math.max(n, p[1]); }); w -= 0.0003; e += 0.0003; s -= 0.0002; n += 0.0002; }
    var bb = [s, w, n, e].map(function (x) { return x.toFixed(6); }).join(',');
    return '[out:json][timeout:25];(way["power"="busbar"](' + bb + ');way["power"="bay"](' + bb + ');way["power"~"^(line|minor_line)$"]["line"~"^(busbar|bay)$"](' + bb + ');node["power"="transformer"](' + bb + ');way["power"="transformer"](' + bb + ');node["power"="portal"](' + bb + ');way["power"="portal"](' + bb + ');way["building"](' + bb + '););out geom;';
  }
  function osmParse(json, footprint) {
    var inside = function (lon, lat) { return !footprint || footprint.length < 4 || inRing(lon, lat, footprint); };
    var out = { busbars: [], bays: 0, bayLines: [], transformers: [], portals: [], buildings: [] };
    ((json && json.elements) || []).forEach(function (el) {
      var t = el.tags || {}, g = el.geometry ? el.geometry.map(function (p) { return [p.lon, p.lat]; }) : null;
      var mid = g && g.length ? g.reduce(function (a, p) { return [a[0] + p[0] / g.length, a[1] + p[1] / g.length]; }, [0, 0]) : (el.type === 'node' ? [el.lon, el.lat] : null);
      if (!mid || !inside(mid[0], mid[1])) return;
      if ((t.power === 'busbar' || t.line === 'busbar') && g) out.busbars.push({ coords: g, voltage: t.voltage || '' });
      else if (t.power === 'bay' || t.line === 'bay') { out.bays++; if (g && g.length >= 2 && t.power !== 'bay') out.bayLines.push({ coords: g, voltage: t.voltage || '' }); }
      else if (t.power === 'transformer') out.transformers.push(g && g.length >= 4 ? { ring: g, voltage: t.voltage || t['voltage:primary'] || '' } : { lon: mid[0], lat: mid[1], voltage: t.voltage || t['voltage:primary'] || '' });
      else if (t.power === 'portal') { if (g && g.length >= 2) { var a = g[0], b = g[g.length - 1]; out.portals.push({ lon: (a[0] + b[0]) / 2, lat: (a[1] + b[1]) / 2, a: a, b: b, voltage: t.voltage || '' }); } else out.portals.push({ lon: mid[0], lat: mid[1], voltage: t.voltage || '' }); }
      else if (t.building && g && g.length >= 4) out.buildings.push({ ring: g, levels: t['building:levels'], height: t.height });
    });
    return out;
  }

  // Validity of a model: finite numbers, a fence, every group in range.
  function check(m) {
    var bad = 0; for (var i = 0; i < m.v.length; i++) if (!isFinite(m.v[i])) { bad++; if (bad > 3) break; }
    var segs = m.v.length / 14, fenceOK = m.groups.some(function (g) { return g.kind === 'fence' && g.count > 0; });
    var inRange = m.groups.every(function (g) { return g.start >= 0 && g.start + g.count <= segs; });
    var gOK = true; for (var j = 0; j < m.v.length; j += 7) { if (m.v[j + 3] >= m.grounds.length || m.v[j + 4] >= m.grounds.length) { gOK = false; break; } }
    return { ok: !bad && fenceOK && inRange && gOK && segs > 0, nonFinite: bad, segs: segs, fence: fenceOK, groups: inRange, grounds: gOK };
  }

  var API = { substation: substation, check: check, osmQuery: osmQuery, osmParse: osmParse, KV: KV, plant: plant, kvList: kvList, kvCol: kvCol, STEEL: STEEL, T: T };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SeeModel = API;
})(typeof window !== 'undefined' ? window : globalThis);
