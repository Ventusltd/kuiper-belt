// scale-logic.js  SCALE LOGIC for LEARN THE KUIPER: quadrillions of particles down to one, any one of them movable.
// Pure logic: no DOM, runs in the browser (window.KuiperScale) and in Node (module.exports).
//
// The real law (kuiper-law.js, lifted from the live page) is:  r = sqrt(key + 0.5),
// angle = ((key mod 2^32) x 2654435769 mod 2^32) / 2^32 turns anticlockwise, world y UP.
// Here the same law is written with every number as a lever, so practice mode can bend it, and REAL puts it back:
//   params = { first: 0, count: N, turnNumber: 2654435769, wrap: 4294967296, degreesPerKey: null,
//              power: 0.5, offset: 0.5, skipPerSecond: 600, capSeconds: 1209600, workRest: null }
// With the real params, place(key) equals KuiperLaw.place(key) to the last bit for every key up to 2^53
// (same Math.imul path). Any other params go through exact modular arithmetic (Number when it fits, BigInt
// otherwise), so even ridiculous values compute and never throw; broken cases carry a 'note' string instead.
(function (root) {
  'use strict';

  var TWO32 = 4294967296, TWO53 = 9007199254740992, TAU = 2 * Math.PI;
  var hasBig = typeof BigInt === 'function';

  var REAL = Object.freeze({
    first: 0, count: 1000, turnNumber: 2654435769, wrap: TWO32, degreesPerKey: null,
    power: 0.5, offset: 0.5, skipPerSecond: 600, capSeconds: 1209600, workRest: null
  });

  var LIMITS = Object.freeze({
    scanCap: 8192,         // key bands at or below this are scanned one by one (exact, simple)
    candidateCap: 400000,  // lattice enumeration above this many expected hits switches to seeded random picks
    gapRangesCap: 20000    // the quiet-time allocator never emits more ranges than this
  });

  // ------------------------------------------------------------------ small helpers
  function fin(v, d) { v = +v; return (typeof v === 'number' && isFinite(v)) ? v : d; }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function hash32(a) { // one round of a 32-bit integer hash; deterministic picks come from this
    a = (a ^ 0x9E3779B9) >>> 0;
    a = Math.imul(a ^ (a >>> 16), 0x85EBCA6B) >>> 0;
    a = Math.imul(a ^ (a >>> 13), 0xC2B2AE35) >>> 0;
    return (a ^ (a >>> 16)) >>> 0;
  }
  function rng(seed) { // mulberry32, seeded, in [0, 1)
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / TWO32;
    };
  }
  // a non-negative real as an exact fraction num/den with den = base x 10^dec, dec <= 9
  function toFraction(x, base) {
    var dec = 0, scale = 1;
    while (dec < 9 && Math.abs(x * scale - Math.round(x * scale)) > 1e-9 * Math.max(1, Math.abs(x * scale))) { dec++; scale *= 10; }
    return { num: Math.round(x * scale), den: base * scale };
  }

  // ------------------------------------------------------------------ prepare(params): fill, repair, note
  function prepare(params) {
    if (params && params.__prepared === true) return params;
    var q = params || {}, notes = [];
    var first = fin(q.first, REAL.first); if (first !== Math.floor(first)) { first = Math.floor(first); notes.push('first rounded down to a whole key'); }
    var exactLimitReached = false;
    // every key must stay below 2^53, where k + 1 stops being exact (a loop there would never end)
    if (first > TWO53 - 1) { notes.push('first above 2^53: clamped to the exact limit'); first = TWO53 - 1; exactLimitReached = true; }
    if (first < -TWO53) { notes.push('first below -2^53: clamped'); first = -TWO53; exactLimitReached = true; }
    var count = fin(q.count, REAL.count); if (count < 1) { notes.push('count below 1: showing 1 particle'); count = 1; }
    if (count !== Math.floor(count)) count = Math.floor(count);
    if (count > TWO53) { notes.push('count above 2^53: the computer cannot count these keys exactly, clamped'); count = TWO53; exactLimitReached = true; }
    if (first + count > TWO53) { notes.push('first + count above 2^53: the last keys are not exact, clamped'); count = Math.max(1, TWO53 - first); exactLimitReached = true; }

    var power = fin(q.power, REAL.power), offset = fin(q.offset, REAL.offset);
    if (power === 0) notes.push('power 0: every particle sits on the same circle, radius 1');
    if (power < 0) notes.push('power negative: particles rush OUT at the centre and crowd IN at the rim; the real law is 0.5');
    if (power > 0 && Math.abs(power - 0.5) > 1e-12) notes.push('power ' + power + ': spacing changes with radius (only 0.5 keeps it constant)');

    // the angle: G/W turns per key, exact integers
    var G, W, angleSource;
    var dpk = q.degreesPerKey;
    if (dpk !== null && dpk !== undefined && dpk !== '' && isFinite(+dpk)) {
      var d = +dpk; var sign = d < 0 ? -1 : 1; d = Math.abs(d) % 360;
      var f = toFraction(d, 360); G = f.num; W = f.den; if (sign < 0) G = (W - G) % W;
      angleSource = 'degreesPerKey';
      if (G === 0) notes.push('degreesPerKey is a multiple of 360: every particle on one ray');
    } else {
      var tn = fin(q.turnNumber, REAL.turnNumber), wr = fin(q.wrap, REAL.wrap);
      if (wr < 1) { notes.push('wrap below 1: every particle on one ray (angle always 0)'); wr = 1; }
      if (wr !== Math.floor(wr) || tn !== Math.floor(tn)) {
        var fw = toFraction(wr, 1), ft = toFraction(Math.abs(tn), 1); // bring both to integers with a common scale
        var scale = Math.max(fw.den, ft.den);
        wr = Math.round(wr * scale); tn = Math.round(Math.abs(tn) * scale) * (tn < 0 ? -1 : 1);
        notes.push('turnNumber/wrap were not whole numbers: scaled to a whole fraction');
        if (!isFinite(wr) || !isFinite(tn)) { notes.push('turnNumber/wrap too large to scale: using the real 2654435769 / 2^32'); wr = REAL.wrap; tn = REAL.turnNumber; }
        if (wr < 1) { notes.push('wrap rounds to 0: every particle on one ray'); wr = 1; }
      }
      if (wr > TWO53) { notes.push('wrap above 2^53: angles still computed but with BigInt, slowly'); }
      G = tn; W = wr;
      if (G < 0) { G = ((G % W) + W) % W; notes.push('turnNumber negative: read as turning the other way'); }
      else if (G >= W) { G = G % W; }
      if (G === 0) notes.push('turn number 0 (or a multiple of wrap): every particle on one ray');
      angleSource = 'turnNumber/wrap';
    }
    var mode = (W === TWO32 && G < TWO32) ? 'imul' : ((W * G < TWO53 && W <= TWO53) ? 'num' : (hasBig ? 'big' : 'float'));
    if (mode === 'float') notes.push('no BigInt in this runtime: huge wraps are approximate');

    var skipPerSecond = Math.max(0, fin(q.skipPerSecond, REAL.skipPerSecond));
    var capSeconds = Math.max(0, fin(q.capSeconds, REAL.capSeconds));
    var p = {
      __prepared: true, first: first, count: count, last: first + count - 1,
      G: G, W: W, mode: mode, alpha: G / W, degreesPerKey: 360 * G / W, angleSource: angleSource,
      power: power, offset: offset, skipPerSecond: skipPerSecond, capSeconds: capSeconds,
      workRest: q.workRest || null, exactLimitReached: exactLimitReached, notes: notes, note: notes.join('; '),
      gaps: null
    };
    if (p.workRest) p.gaps = gaps(p);
    return p;
  }

  // ------------------------------------------------------------------ the angle, exact
  // m(key) = (key x G) mod W, as an integer in [0, W). Real params: Math.imul path, identical to kuiper-law.js:250.
  function mOf(p, k) {
    if (!isFinite(k)) return 0;
    if (p.mode === 'imul') return Math.imul((k % TWO32) >>> 0, p.G) >>> 0;
    var km = k % p.W; if (km < 0) km += p.W;
    if (p.mode === 'num') return (km * p.G) % p.W;
    if (p.mode === 'big') return Number((BigInt(km) * BigInt(p.G)) % BigInt(p.W));
    return ((km * p.alpha) % 1) * p.W; // float fallback, approximate
  }
  function lapsOf(p, k, m) { // full turns thrown away by the MOD: floor(key x G / W)
    var prod = k * p.G;
    if (!isFinite(prod) || !isFinite(m) || !isFinite(p.W) || m !== Math.floor(m)) return Math.floor((k * p.alpha)); // approximate when the exact path cannot run
    if (prod < TWO53 || !hasBig) return Math.floor((prod - m) / p.W);
    return Number((BigInt(k) * BigInt(p.G) - BigInt(m)) / BigInt(p.W));
  }
  function radiusOf(p, k) { return Math.pow(k + p.offset, p.power); }
  function keyAtRadius(p, r) { // the real-valued key whose radius is r (inverse of radiusOf); NaN when not invertible
    if (!(p.power > 0) || !(r >= 0)) return NaN;
    return Math.pow(r, 1 / p.power) - p.offset;
  }

  // ------------------------------------------------------------------ the movable layer (practice mode)
  var moves = new Map(); // key -> {x, y}
  function setPosition(key, x, y) {
    var k = Math.floor(fin(key, 0)); x = fin(x, 0); y = fin(y, 0);
    moves.set(k, { x: x, y: y });
    return { key: k, x: x, y: y, r: Math.hypot(x, y), deg: degOf(x, y) };
  }
  function setPolar(key, r, deg) {
    r = fin(r, 0); deg = fin(deg, 0); var th = deg * Math.PI / 180;
    return setPosition(key, r * Math.cos(th), r * Math.sin(th));
  }
  function clearMove(key) { return moves.delete(Math.floor(fin(key, 0))); }
  function clearMoves() { moves.clear(); }
  function getMoves() { var out = []; moves.forEach(function (v, k) { out.push({ key: k, x: v.x, y: v.y }); }); return out; }
  function degOf(x, y) { var d = Math.atan2(y, x) * 180 / Math.PI; return d < 0 ? d + 360 : d; }

  // ------------------------------------------------------------------ 1. place(key, params)
  function truePlace(p, k) {
    var m = mOf(p, k), turns = m / p.W, th = TAU * m / p.W, r = radiusOf(p, k);
    var note = null;
    if (!isFinite(r) || r !== r) { note = 'radius undefined for key ' + k + ' with power ' + p.power + ' and offset ' + p.offset; r = 0; }
    return { key: k, m: m, turns: turns, deg: turns * 360, theta: th, r: r, x: r * Math.cos(th), y: r * Math.sin(th), note: note };
  }
  function place(key, params) {
    try { return placeInner(key, params); }
    catch (e) { return { key: +key, x: 0, y: 0, r: 0, deg: 0, turns: 0, m: 0, laps: 0, moved: false, issued: true, note: 'could not place: ' + (e && e.message || e) }; }
  }
  function placeInner(key, params) {
    var p = prepare(params);
    var k = +key, keyNote = null;
    if (!isFinite(k)) { keyNote = 'key ' + String(key) + ' is not a number: showing the first key'; k = p.first; }
    var kf = Math.floor(k); // whole keys only; the real law truncates the same way
    if (Math.abs(kf) > TWO53) { keyNote = 'key beyond 2^53: clamped to the exact limit'; kf = clamp(kf, -TWO53, TWO53); }
    var t = truePlace(p, kf);
    var out = { key: kf, x: t.x, y: t.y, r: t.r, deg: t.deg, turns: t.turns, m: t.m, laps: lapsOf(p, kf, t.m), moved: false };
    var notes = [];
    if (keyNote) notes.push(keyNote);
    if (t.note) notes.push(t.note);
    if (kf < p.first || kf > p.last) notes.push('key ' + kf + ' is outside first..last (' + p.first + '..' + p.last + ')');
    if (kf > TWO53) notes.push('key above 2^53: not exact');
    if (p.gaps && !isIssued(kf, p.gaps)) { out.issued = false; notes.push('key skipped for time: no particle here (dark ring)'); } else out.issued = true;
    if (moves.has(kf)) {
      var mv = moves.get(kf);
      out.moved = true; out.truePlace = { x: t.x, y: t.y, r: t.r, deg: t.deg };
      out.x = mv.x; out.y = mv.y; out.r = Math.hypot(mv.x, mv.y); out.deg = degOf(mv.x, mv.y);
      out.leader = { fromX: t.x, fromY: t.y, toX: mv.x, toY: mv.y, label: 'MOVED FROM ITS TRUE PLACE' };
    }
    if (p.note) notes.push(p.note);
    if (notes.length) out.note = notes.join('; ');
    return out;
  }

  // ------------------------------------------------------------------ geometry of a window
  function rectOfView(view) {
    var zoom = Math.max(1e-300, fin(view && view.zoom, 1));
    var cx = fin(view && view.cx, 0), cy = fin(view && view.cy, 0);
    var hw = Math.abs(fin(view && view.w, 800)) / (2 * zoom), hh = Math.abs(fin(view && view.h, 600)) / (2 * zoom);
    return { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh, zoom: zoom };
  }
  function inRect(rc, x, y) { return x >= rc.x0 && x <= rc.x1 && y >= rc.y0 && y <= rc.y1; }
  function bandOfRect(rc) { // radii and turn-interval covered by a rectangle, seen from the origin
    var dx = Math.max(rc.x0, 0, -rc.x1), dy = Math.max(rc.y0, 0, -rc.y1);
    var rmin = Math.hypot(dx, dy);
    var rmax = Math.max(Math.hypot(rc.x0, rc.y0), Math.hypot(rc.x1, rc.y0), Math.hypot(rc.x0, rc.y1), Math.hypot(rc.x1, rc.y1));
    var inside = rc.x0 <= 0 && 0 <= rc.x1 && rc.y0 <= 0 && 0 <= rc.y1;
    if (inside) return { rmin: 0, rmax: rmax, full: true, tLo: 0, tHi: 1 };
    var cs = [[rc.x0, rc.y0], [rc.x1, rc.y0], [rc.x1, rc.y1], [rc.x0, rc.y1]];
    var ref = Math.atan2(cs[0][1], cs[0][0]) / TAU, lo = 0, hi = 0;
    for (var i = 1; i < 4; i++) { var d = Math.atan2(cs[i][1], cs[i][0]) / TAU - ref; d -= Math.round(d); if (d < lo) lo = d; if (d > hi) hi = d; }
    var tLo = ref + lo, tHi = ref + hi; // a convex box without the origin spans under half a turn
    tLo -= Math.floor(tLo); tHi = tLo + (hi - lo);
    return { rmin: rmin, rmax: rmax, full: false, tLo: tLo, tHi: tHi };
  }

  // Core: every key of params whose TRUE place lies in rect (exact), capped at maxOut (seeded picks when more).
  // Works at 9e15 because the keys at a given radius and angle form a 2-D lattice {(k, kG - wW)}; a reduced basis
  // lets us enumerate only the candidates inside the box [kLo,kHi] x [yLo,yHi), then test each exactly.
  function keysInRect(p, rc, maxOut, seed) {
    maxOut = Math.max(1, Math.floor(fin(maxOut, 4000)));
    var out = [], info = { exact: true, scanned: 0, candidates: 0, expected: 0, method: 'scan', note: null };
    var band = bandOfRect(rc);
    var kLo = p.first, kHi = p.last;
    var inv = p.power > 0;
    if (inv) {
      var a = keyAtRadius(p, band.rmin), b = keyAtRadius(p, band.rmax);
      if (a === a) kLo = Math.max(p.first, Math.floor(a) - 1);
      if (b === b) kHi = Math.min(p.last, Math.ceil(b) + 1);
    }
    if (kHi < kLo) return { keys: out, info: info };
    var count = kHi - kLo + 1;
    var width = band.full ? 1 : Math.min(1, band.tHi - band.tLo);
    info.expected = count * width;

    function accept(k) {
      if (p.gaps && !isIssued(k, p.gaps)) return;
      var t = truePlace(p, k); info.scanned++;
      if (inRect(rc, t.x, t.y)) out.push(k);
    }

    if (count <= LIMITS.scanCap || p.mode === 'float' || p.W > TWO53) {
      // plain scan (exact when count small; for the float/huge-wrap fallback, a seeded sample of the band)
      if (count <= LIMITS.scanCap) { for (var k = kLo; k <= kHi; k++) accept(k); }
      else { var rn = rng(seed || 1); info.method = 'band-sample'; info.exact = false; for (var i = 0; i < 8 * maxOut && out.length < maxOut; i++) accept(kLo + Math.floor(rn() * count)); }
    } else {
      // lattice enumeration in (k, y) with y = kG - wW in [yLo, yHi), yHi - yLo <= W
      info.method = 'lattice';
      var Gb = BigInt(p.G), Wb = BigInt(p.W);
      var yLo = band.full ? 0 : band.tLo * p.W, yHi = band.full ? p.W : band.tHi * p.W;
      var Sx = 1 / Math.max(1, count), Sy = 1 / Math.max(1e-300, yHi - yLo);
      var u1 = [BigInt(1), Gb], u2 = [BigInt(0), Wb];
      function n2(u) { var ax = Number(u[0]) * Sx, ay = Number(u[1]) * Sy; return ax * ax + ay * ay; }
      function dot(u, v) { return Number(u[0]) * Number(v[0]) * Sx * Sx + Number(u[1]) * Number(v[1]) * Sy * Sy; }
      if (n2(u1) > n2(u2)) { var tmp = u1; u1 = u2; u2 = tmp; }
      for (var it = 0; it < 200; it++) {
        var qf = Math.round(dot(u1, u2) / n2(u1)); if (qf === 0 || !isFinite(qf)) break;
        var qb = BigInt(qf); u2 = [u2[0] - qb * u1[0], u2[1] - qb * u1[1]];
        if (n2(u2) < n2(u1)) { var t2 = u1; u1 = u2; u2 = t2; } else break;
      }
      var a1 = Number(u1[0]), y1 = Number(u1[1]), a2 = Number(u2[0]), y2 = Number(u2[1]);
      var det = Number(u1[0] * u2[1] - u2[0] * u1[1]); // = +-W exactly
      if (det === 0) { info.note = 'degenerate lattice'; return { keys: out, info: info }; }
      // Anchor at the band's middle key k0: work in k' = k - k0 and y' = y - m(k0) brought near 0, so the lattice
      // coordinates (i, j) of every candidate are small and their products stay exact even when k is near 9e15.
      // The lattice basis is unchanged by the translation.
      var cnt = kHi - kLo, h0 = Math.floor(cnt / 2), k0 = kLo + h0, y0 = mOf(p, k0);
      var kkLo = -h0, kkHi = cnt - h0;
      var yLoA = yLo - y0, yHiA = yHi - y0, shift = Math.round(yLoA / p.W) * p.W; yLoA -= shift; yHiA -= shift;
      var iMin = Infinity, iMax = -Infinity;
      var corners = [[kkLo, yLoA], [kkHi, yLoA], [kkLo, yHiA], [kkHi, yHiA]];
      for (var c = 0; c < 4; c++) { var iv = (y2 * corners[c][0] - a2 * corners[c][1]) / det; if (iv < iMin) iMin = iv; if (iv > iMax) iMax = iv; }
      var iLo = Math.floor(iMin) - 1, iHi = Math.ceil(iMax) + 1;
      info.lattice = { a1: a1, y1: y1, a2: a2, y2: y2, det: det, iLo: iLo, iHi: iHi, kLo: kLo, kHi: kHi, k0: k0, y0: y0, yLo: yLo, yHi: yHi };
      function jRange(i) {
        var lo = -Infinity, hi = Infinity, A, B;
        if (a2 !== 0) { A = (kkLo - i * a1) / a2; B = (kkHi - i * a1) / a2; if (A > B) { var s = A; A = B; B = s; } lo = Math.max(lo, A); hi = Math.min(hi, B); }
        else if (i * a1 < kkLo || i * a1 > kkHi) return null;
        if (y2 !== 0) { A = (yLoA - i * y1) / y2; B = (yHiA - i * y1) / y2; if (A > B) { var s2 = A; A = B; B = s2; } lo = Math.max(lo, A); hi = Math.min(hi, B); }
        else if (i * y1 < yLoA || i * y1 >= yHiA) return null;
        var jl = Math.ceil(lo) - 1, jh = Math.floor(hi) + 1;
        return jh < jl ? null : [jl, jh];
      }
      var hardCap = 8 * LIMITS.candidateCap, BIG = 4503599627370496; // 2^52: above this a product may be inexact
      function tryKey(i, j) {
        var pa = i * a1, pb = j * a2, kk; info.candidates++;
        if (Math.abs(pa) > BIG || Math.abs(pb) > BIG) kk = Number(BigInt(i) * BigInt(a1) + BigInt(j) * BigInt(a2)); else kk = pa + pb;
        if (kk < kkLo || kk > kkHi) return;
        var k = k0 + kk, yk = mOf(p, k);
        if (!((yk >= yLo && yk < yHi) || (yk + p.W >= yLo && yk + p.W < yHi) || (yk - p.W >= yLo && yk - p.W < yHi))) return;
        accept(k);
      }
      if (info.expected <= LIMITS.candidateCap && (iHi - iLo) <= 4 * LIMITS.candidateCap) {
        enumerate: for (var ii = iLo; ii <= iHi; ii++) {
          var jr = jRange(ii); if (!jr) continue;
          for (var jj = jr[0]; jj <= jr[1]; jj++) { tryKey(ii, jj); if (info.candidates > hardCap) { info.exact = false; info.note = 'candidate cap reached'; break enumerate; } }
        }
        if (out.length > maxOut) { // too many for the screen: deterministic thinning keeps the picture fair
          info.exact = false; info.note = 'thinned from ' + out.length + ' to ' + maxOut;
          out.sort(function (x, y) { return x - y; });
          var thin = [], step = out.length / maxOut, r0 = rng(seed || 1);
          for (var s3 = 0; s3 < maxOut; s3++) thin.push(out[Math.min(out.length - 1, Math.floor(s3 * step + r0() * step))]);
          out = thin;
        }
      } else {
        info.exact = false; info.method = 'lattice-sample';
        var rn2 = rng(seed || 1), seen = new Set(), span = iHi - iLo + 1;
        for (var at = 0; at < 6 * maxOut && out.length < maxOut; at++) {
          var i2 = iLo + Math.floor(rn2() * span), jr2 = jRange(i2); if (!jr2) continue;
          var j2 = jr2[0] + Math.floor(rn2() * (jr2[1] - jr2[0] + 1));
          var k2 = i2 * a1 + j2 * a2; if (seen.has(k2)) continue; seen.add(k2);
          tryKey(i2, j2);
          if (info.candidates > hardCap) { info.note = 'candidate cap reached'; break; }
        }
      }
    }
    return { keys: out, info: info };
  }

  // ------------------------------------------------------------------ 3. visibleKeys(params, view, maxDots)
  function visibleKeys(params, view, maxDots) {
    var p = prepare(params), rc = rectOfView(view);
    var res = keysInRect(p, rc, maxDots, 7);
    var keys = res.keys;
    moves.forEach(function (v, k) { if (inRect(rc, v.x, v.y) && keys.indexOf(k) < 0) keys.push(k); });
    keys.info = res.info; keys.note = res.info.note || p.note || null;
    return keys;
  }

  // ------------------------------------------------------------------ 2. sample(params, maxDots, viewport)
  // A fair picture of N particles: all of them when N <= maxDots; otherwise one deterministic pick from each of
  // maxDots equal-count key bands [first + N i/m, first + N (i+1)/m) (equal count = equal area for the real law),
  // plus every true neighbour inside the viewport when one is given, so the magnifier is honest.
  function sample(params, maxDots, viewport) {
    var p = prepare(params);
    var m = Math.max(1, Math.floor(fin(maxDots, 4000))), N = p.count, keys = [];
    if (N <= m) {
      for (var k = p.first; k <= p.last; k++) if (!p.gaps || isIssued(k, p.gaps)) keys.push(k);
      keys.exact = true;
    } else {
      var seedBase = hash32((N % TWO32) >>> 0) ^ hash32(Math.floor(N / TWO32) >>> 0);
      for (var i = 0; i < m; i++) {
        var lo = p.first + Math.floor(N * i / m), hi = p.first + Math.floor(N * (i + 1) / m); // [lo, hi)
        if (hi <= lo) hi = lo + 1;
        var span = hi - lo, h = hash32(seedBase ^ i), pick = lo + Math.floor(h / TWO32 * span);
        if (pick >= hi) pick = hi - 1;
        if (p.gaps && !isIssued(pick, p.gaps)) { // try a few more spots in the band before giving the band up as dark
          var ok = false; for (var t = 1; t <= 4 && !ok; t++) { var h2 = hash32(h + t); var p2 = lo + Math.floor(h2 / TWO32 * span); if (isIssued(p2, p.gaps)) { pick = p2; ok = true; } }
          if (!ok) continue;
        }
        keys.push(pick);
      }
      if (p.first <= p.last && keys.indexOf(p.first) < 0 && (!p.gaps || isIssued(p.first, p.gaps))) keys.unshift(p.first); // the first particle is always there
      keys.exact = false;
    }
    if (viewport) {
      var vis = visibleKeys(p, viewport, m);
      var set = new Set(keys); for (var v = 0; v < vis.length; v++) if (!set.has(vis[v])) { set.add(vis[v]); keys.push(vis[v]); }
      keys.visible = vis.length;
    }
    keys.represents = N / Math.max(1, keys.length);
    keys.note = p.note || null;
    return keys;
  }

  // ------------------------------------------------------------------ 4. pick(params, x, y, view)
  // Nearest particle to a world point: candidates from the radius band around r^power inverse (both sides),
  // through the exact lattice enumeration in a square that grows until something is found. Moved particles count
  // at their moved place. Returns {key, distance, place, screenDistance} or null when there is nothing at all.
  function pick(params, x, y, view) {
    var p = prepare(params); x = fin(x, 0); y = fin(y, 0);
    var zoom = view && isFinite(+view.zoom) && +view.zoom > 0 ? +view.zoom : 1;
    var rim = radiusOf(p, p.last); if (!isFinite(rim)) rim = 1e6;
    var s = Math.max(24 / zoom, 1.5), best = null, bestD = Infinity;
    function consider(k, px, py) { var d = Math.hypot(px - x, py - y); if (d < bestD) { bestD = d; best = k; } }
    moves.forEach(function (v, k) { consider(k, v.x, v.y); });
    for (var round = 0; round < 40; round++) {
      var rc = { x0: x - s, x1: x + s, y0: y - s, y1: y + s };
      var res = keysInRect(p, rc, 1024, 11);
      for (var i = 0; i < res.keys.length; i++) { var k = res.keys[i]; if (moves.has(k)) continue; var t = truePlace(p, k); consider(k, t.x, t.y); }
      if (best !== null && bestD <= s) break; // the nearest found is inside the searched square, so it is the nearest
      if (s > rim + Math.hypot(x, y) + 2) break;
      s *= 4;
    }
    if (best === null) return null;
    var pl = place(best, p);
    return { key: best, distance: bestD, screenDistance: bestD * zoom, place: pl, moved: pl.moved };
  }

  // A free particle (not a key) placed anywhere: its own polar reading and its nearest real neighbour.
  function freeDot(x, y, params) {
    x = fin(x, 0); y = fin(y, 0);
    var near = params === undefined && !moves.size ? null : pick(params || REAL, x, y, null);
    return { x: x, y: y, r: Math.hypot(x, y), deg: degOf(x, y), turns: degOf(x, y) / 360,
             keyAtThisRadius: keyAtRadius(prepare(params || REAL), Math.hypot(x, y)),
             nearestKey: near ? near.key : null, nearestDistance: near ? near.distance : null, nearest: near ? near.place : null };
  }

  // ------------------------------------------------------------------ 6. scaleFacts(N, params)
  function scaleFacts(N, params) {
    var p = prepare(Object.assign({}, params || {}, N !== undefined && N !== null ? { count: N } : {}));
    var n = p.count, rim = radiusOf(p, p.last), area = Math.PI * rim * rim;
    var rimPrev = n > 1 ? radiusOf(p, p.last - 1) : 0;
    var ringAreaAtRim = Math.PI * (rim * rim - rimPrev * rimPrev);
    var out = {
      count: n, first: p.first, last: p.last,
      rimRadius: rim, area: area,
      neighbourSpacing: Math.sqrt(Math.abs(ringAreaAtRim)),   // sqrt(pi) = 1.7725 for the real law, at every radius
      meanSpacing: Math.sqrt(area / n),
      angleRepeats: n / p.W,                                   // keys k and k + wrap share an angle
      degreesPerKey: p.degreesPerKey, turnsPerKey: p.alpha, lapsThrownAway: lapsOf(p, p.last, mOf(p, p.last)),
      exactLimitReached: p.exactLimitReached || n > TWO53 || p.last > TWO53,
      exactLimit: TWO53, mode: p.mode, note: p.note || null
    };
    if (p.gaps) { out.issued = p.gaps.issued; out.skipped = p.gaps.skipped; out.darkRings = p.gaps.darkRings; }
    // measured nearest neighbour around the middle key (exact, through the lattice), when it is cheap
    try {
      var mid = p.first + Math.floor(n / 2), t = truePlace(p, mid), s = Math.max(2, out.neighbourSpacing * 2);
      if (!(s < 1e6)) throw new Error('spacing too large to measure');
      var res = keysInRect(p, { x0: t.x - s, x1: t.x + s, y0: t.y - s, y1: t.y + s }, 512, 3), bd = Infinity;
      for (var i = 0; i < res.keys.length; i++) { if (res.keys[i] === mid) continue; var u = truePlace(p, res.keys[i]); var d = Math.hypot(u.x - t.x, u.y - t.y); if (d < bd) bd = d; }
      out.measuredNearest = isFinite(bd) ? bd : null; out.measuredAtKey = mid;
    } catch (e) { out.measuredNearest = null; }
    return out;
  }

  // ------------------------------------------------------------------ 7. gaps(params): the quiet-time allocator
  // workRest = { pattern: [{ work: keysIssued, restSeconds: s }, ...], repeat: times }  (or just the array).
  // Keys run from `first`. Each rest skips min(restSeconds, capSeconds) x skipPerSecond keys: no particle there,
  // so the disc shows a dark ring. Returns the issued and skipped key ranges in order.
  function gaps(params) {
    var p = params && params.__prepared ? params : prepare(Object.assign({}, params || {}, { workRest: null }));
    var wr = (params && params.workRest) || p.workRest;
    var pattern = Array.isArray(wr) ? wr : (wr && Array.isArray(wr.pattern) ? wr.pattern : null);
    var repeat = wr && !Array.isArray(wr) && isFinite(+wr.repeat) ? Math.max(1, Math.floor(+wr.repeat)) : Infinity;
    var capKeys = Math.floor(p.skipPerSecond * p.capSeconds);
    var ranges = [], k = p.first, issued = 0, skipped = 0, dark = 0, note = null;
    if (!pattern || !pattern.length) {
      ranges.push({ from: p.first, to: p.last, count: p.count, issued: true });
      return { ranges: ranges, issued: p.count, skipped: 0, total: p.count, darkRings: 0, capKeys: capKeys, keysPerSecond: p.skipPerSecond, note: null };
    }
    outer: for (var rep = 0; rep < repeat; rep++) {
      for (var i = 0; i < pattern.length; i++) {
        var seg = pattern[i] || {};
        var work = Math.max(0, Math.floor(fin(seg.work, 0)));
        var restS = Math.max(0, fin(seg.restSeconds, fin(seg.rest, 0)));
        var skip = Math.floor(Math.min(restS, p.capSeconds) * p.skipPerSecond);
        if (work > 0 && k <= p.last) {
          var to = Math.min(p.last, k + work - 1);
          ranges.push({ from: k, to: to, count: to - k + 1, issued: true }); issued += to - k + 1; k = to + 1;
        }
        if (skip > 0 && k <= p.last) {
          var to2 = Math.min(p.last, k + skip - 1);
          ranges.push({ from: k, to: to2, count: to2 - k + 1, issued: false, seconds: restS, capped: restS > p.capSeconds }); skipped += to2 - k + 1; dark++; k = to2 + 1;
        }
        if (k > p.last) break outer;
        if (ranges.length >= LIMITS.gapRangesCap) { note = 'pattern cut after ' + ranges.length + ' ranges'; break outer; }
        if (work === 0 && skip === 0) { note = 'pattern issues and skips nothing'; break outer; }
      }
    }
    if (k <= p.last && !note) { ranges.push({ from: k, to: p.last, count: p.last - k + 1, issued: true, tail: true }); issued += p.last - k + 1; }
    return { ranges: ranges, issued: issued, skipped: skipped, total: issued + skipped, darkRings: dark, capKeys: capKeys, keysPerSecond: p.skipPerSecond, note: note };
  }
  function isIssued(key, g) { // binary search over the ranges; keys past the listed ranges count as issued
    var rs = g.ranges, lo = 0, hi = rs.length - 1;
    while (lo <= hi) { var mid = (lo + hi) >> 1, r = rs[mid]; if (key < r.from) hi = mid - 1; else if (key > r.to) lo = mid + 1; else return r.issued; }
    return true;
  }
  // Seconds of silence -> keys skipped (and the cap), for the TIME lever's caption.
  function silence(seconds, params) {
    var p = prepare(params); seconds = Math.max(0, fin(seconds, 0));
    var capped = seconds > p.capSeconds;
    return { seconds: seconds, keysSkipped: Math.floor(Math.min(seconds, p.capSeconds) * p.skipPerSecond), capped: capped, capKeys: Math.floor(p.capSeconds * p.skipPerSecond), capSeconds: p.capSeconds };
  }

  // never throw: any internal failure comes back as an empty result with a note
  function safe(fn, empty) {
    return function () {
      try { return fn.apply(null, arguments); }
      catch (e) { var r = typeof empty === 'function' ? empty() : empty; if (r && typeof r === 'object') r.note = 'could not compute: ' + (e && e.message || e); return r; }
    };
  }
  var KuiperScale = {
    REAL: REAL, LIMITS: LIMITS, EXACT_LIMIT: TWO53,
    prepare: safe(prepare, function () { return prepare({}); }), place: place,
    sample: safe(sample, function () { return []; }), visibleKeys: safe(visibleKeys, function () { return []; }),
    pick: safe(pick, null), freeDot: safe(freeDot, function () { return { x: 0, y: 0, r: 0, deg: 0 }; }),
    setPosition: setPosition, setPolar: setPolar, clearMove: clearMove, clearMoves: clearMoves, getMoves: getMoves,
    scaleFacts: safe(scaleFacts, function () { return {}; }), gaps: safe(gaps, function () { return { ranges: [], issued: 0, skipped: 0, total: 0, darkRings: 0 }; }),
    isIssued: isIssued, silence: safe(silence, function () { return { seconds: 0, keysSkipped: 0 }; }),
    keyAtRadius: function (r, params) { return keyAtRadius(prepare(params), fin(r, 0)); },
    keysInRect: function (params, rect, maxOut) { return keysInRect(prepare(params), rect, maxOut, 5); },
    version: '1.0.0 (4 Oct 2026)'
  };
  root.KuiperScale = KuiperScale;
  if (typeof module !== 'undefined' && module.exports) module.exports = KuiperScale;
})(typeof window !== 'undefined' ? window : globalThis);
