/* LEARN THE KUIPER: one.js. One circle, one dot, two numbers. The whole specification is ONE-SPEC.md with its
 * three amendments.
 *   SQRT( [A] )            the first number sets how far out the dot is, and nothing else
 *   MOD( [B] x [M] , [C] ) the second number sets where round the circle the dot is, and nothing else
 *   LINK                   both numbers are the same KEY: the real Kuiper rule
 * Three parts in one classic script: (1) exact arithmetic, (2) the game with no screen (node can run it),
 * (3) the screen. Nothing is fetched. Sources of borrowed ideas are named where they are used.
 */
(function (root) {
  'use strict';

  // =====================================================================================================
  // 1. EXACT ARITHMETIC. Every number shown or judged comes from here, in whole numbers (BigInt).
  // =====================================================================================================
  var MAX = 9007199254740991, MAXB = BigInt(MAX);
  var REAL_M = 2654435769n, REAL_C = 4294967296n;
  var LEVELS = [[1n, 4n], [1n, 12n], [1n, 360n], [5n, 12n], [222n, 360n], [REAL_M, REAL_C]];
  // rings the linked targets are drawn from, by how many have been found: near the centre first, then outward
  var STAGES = [[1, 3], [2, 6], [4, 10], [8, 20], [15, 40], [30, 100], [60, 300], [100, 1000]];
  // what each target of a level needs, in order: [B] alone, then [A] alone, then both; a digit = whole turns
  // asked for; d = a distance between two rings (a decimal [A]). After these, three targets ask for the LINK.
  var PLAN = ['B', 'B', 'B1', 'A', 'A', 'A', 'AB', 'AB', 'AB', 'AB2', 'Ad', 'ABd', 'AB1'];
  var LATER = ['AB', 'AB1', 'ABd', 'AB2'];
  var LINK_AT = PLAN.length, LINK_N = 3;
  var LIMIT_LINE = 'THAT NUMBER IS TOO LARGE FOR THIS COMPUTER TO SHOW. THE REAL LIMIT HERE IS 9,007,199,254,740,991.';

  // FLOOR(SQRT(n)) in whole numbers: a first guess from the machine root, then corrected until n x n <= key < (n + 1) x (n + 1)
  function isqrt(n) {
    if (n < 2n) return n;
    var x = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (x * x > n) x -= 1n;
    while ((x + 1n) * (x + 1n) <= n) x += 1n;
    return x;
  }
  function stepOf(k, M, C) { var s = (k * M) % C; return s < 0n ? s + C : s; }   // the floor rule: MOD( -1 , 12 ) = 11
  // B x M = Q x C + S with 0 <= S < C, for any whole B (negative too)
  function modParts(b, M, C) { var P = b * M, S = stepOf(b, M, C); return { P: P, S: S, Q: (P - S) / C }; }
  // which of N equal sectors a step stands in. Sector j is centred on j / N of a turn, so on a small circle
  // (N = C) sector j is exactly step j with the mark in its middle. Whole numbers only.
  function sectorOf(step, C, N) { var n = BigInt(N); return Number(((2n * step * n + C) / (2n * C)) % n); }
  function pad(v, n) { var s = v.toString(); while (s.length < n) s = '0' + s; return s; }

  // ---- a decimal number as typed: { n, s } means n / 10^s, exactly
  function D(n, s) { while (s > 0 && n % 10n === 0n) { n /= 10n; s--; } return { n: n, s: s }; }
  function dText(d) { if (d.s === 0) return d.n.toString(); var t = pad(d.n, d.s + 1); return t.slice(0, -d.s) + '.' + t.slice(-d.s); }
  function dFloor(d) { return d.n / 10n ** BigInt(d.s); }
  function dNum(d) { return Number(d.n) / Math.pow(10, d.s); }
  function dEq(a, b) { return a.n === b.n && a.s === b.s; }
  // is the number below, at, or above ( t / 10 ) squared? t is a distance in tenths. Exact.
  function dCmpSqT(d, t) { var l = d.n * 100n, r = BigInt(t) * BigInt(t) * 10n ** BigInt(d.s); return l < r ? -1 : l > r ? 1 : 0; }
  function dAddTenths(d, k) { var s = Math.max(d.s, 1), n = d.n * 10n ** BigInt(s - d.s) + BigInt(k) * 10n ** BigInt(s - 1); return n < 0n ? D(0n, 0) : D(n, s); }
  // a typed decimal, 0 or more: { ok, value } or { ok: false, tooLarge }. Up to six places after the point.
  function parseDec(str) {
    var m = /^(\d*)(?:\.(\d*))?$/.exec(typeof str === 'string' ? str : '');
    if (!m || (m[1] === '' && !m[2])) return { ok: false, tooLarge: false };
    var whole = (m[1] || '0').replace(/^0+(?=\d)/, ''), frac = m[2] || '';
    if (whole.length > 16 || BigInt(whole) > MAXB) return { ok: false, tooLarge: true };
    if (frac.length > 6) return { ok: false, tooLarge: false };
    return { ok: true, value: D(BigInt(whole + frac), frac.length) };
  }
  // a typed whole number, negative allowed when signed: { ok, value } or { ok: false, tooLarge }
  function parseWhole(str, signed) {
    if (typeof str !== 'string' || !(signed ? /^-?\d+$/ : /^\d+$/).test(str)) return { ok: false, tooLarge: false };
    var neg = str[0] === '-', digits = (neg ? str.slice(1) : str).replace(/^0+(?=\d)/, '');
    if (digits.length > 16 || BigInt(digits) > MAXB) return { ok: false, tooLarge: true };
    var v = BigInt(digits);
    return { ok: true, value: neg ? -v : v };
  }
  // the square root of a decimal. Exact when there is an exact answer (6.25 gives 2.5, to as many places as it
  // needs); otherwise two places, marked as rounded, and never the next whole number before it is reached.
  function sqrtInfo(d) {
    var n = d.n, s = d.s;
    if (s % 2) { n *= 10n; s++; }
    var r = isqrt(n);
    if (r * r === n) return { exact: true, text: dText(D(r, s / 2)) };
    var t = s <= 6 ? isqrt(n * 10n ** BigInt(6 - s)) : isqrt(n / 10n ** BigInt(s - 6));   // FLOOR( SQRT x 1000 )
    var h = (t + 5n) / 10n, whole = isqrt(dFloor(d));
    if (h / 100n > whole) h = whole * 100n + 99n;
    return { exact: false, text: (h / 100n).toString() + '.' + pad(h % 100n, 2) };
  }
  // 360 x STEP / C to four places, rounded from the exact fraction
  function degText(step, C) {
    var u = (step * 3600000n * 2n + C) / (2n * C);
    if (u >= 3600000n) u = 3599999n;
    return (u / 10000n).toString() + '.' + pad(u % 10000n, 4);
  }
  // the signed turn from one step to another, in degrees to two places: the short way round
  function turnText(s1, s2, C) {
    var d = (((s2 - s1) % C) + C) % C, neg = false;
    if (2n * d > C) { d = C - d; neg = true; }
    var u = (d * 36000n * 2n + C) / (2n * C);
    return (neg && u > 0n ? '-' : '+') + (u / 100n).toString() + '.' + pad(u % 100n, 2);
  }
  // how many sectors a target can have on a circle of C steps, largest cell first
  function sectorsFor(C) {
    if (C <= 24n) return [Number(C)];
    var out = [12, 36, 120, 360].filter(function (n) { return BigInt(n) <= C; });
    if (C < 360n && out[out.length - 1] !== Number(C)) out.push(Number(C));
    return out;
  }
  // the same step in ordinary numbers, for searching many keys quickly (keys 0 and up). Exact for every key
  // up to MAX: the real pair uses the split form of LESSON-CONTRACT.md (2654435769 = 40503 x 65536 + 31161);
  // other pairs reduce the key first; anything that could round goes back to BigInt.
  function fastStep(M, C) {
    if (M === REAL_M && C === REAL_C) return function (k) { var a = k % 4294967296; return (((a * 40503) % 65536) * 65536 + a * 31161) % 4294967296; };
    var c = Number(C), mr = Number(M % C);
    if (C <= MAXB && (c - 1) * mr <= MAX) return function (k) { return ((k % c) * mr) % c; };
    return function (k) { return Number((BigInt(k) * M) % C); };
  }
  // the two lines as spreadsheet formulas (first number in A2, second in B2). The real pair copies the split
  // form that stays exact (LESSON-CONTRACT.md). Linked: both read the one key in A2.
  function sheetFormulas(M, C, linked) {
    var x = linked ? 'A2' : 'B2';
    var b = (M === REAL_M && C === REAL_C)
      ? '=MOD(MOD(MOD(' + x + ',4294967296)*40503,65536)*65536+MOD(' + x + ',4294967296)*31161,4294967296)'
      : (M === 1n ? '=MOD(' + x + ',' + C.toString() + ')' : '=MOD(' + x + '*' + M.toString() + ',' + C.toString() + ')');
    return ['=SQRT(A2)', b];
  }
  // a small repeatable random source for tests (mulberry32); play uses Math.random
  function seeded(a) {
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // =====================================================================================================
  // 2. THE GAME, with no screen. Numbers in, events out.
  //    A typed, committed number that completes a target gives the full score; a rolled one a small one.
  // =====================================================================================================
  function makeGame(opts) {
    opts = opts || {};
    var rnd = opts.random || Math.random;
    var M = LEVELS[0][0], C = LEVELS[0][1], level = 0, fast = fastStep(M, C);
    var slots = [], i;
    for (i = 0; i < 7; i++) slots.push(newSlot());   // six levels and one for the player's own [M] and [C]
    var A = D(4n, 0), B = 0n, pA = A, pB = B, linked = false, sel = 'B', buf = null, score = 0, listeners = [];
    var g = {};

    function newSlot() { return { found: 0, lit: [], target: null, tries: 0, ghosts: [] }; }
    function emit(type, data) { data = data || {}; for (var j = 0; j < listeners.length; j++) listeners[j](type, data); }
    function slot() { return slots[level]; }
    function ringA(a) { return Number(isqrt(dFloor(a))); }
    function secOf(b, N) { return sectorOf(stepOf(b, M, C), C, N); }
    function inBand(a, t) { return dCmpSqT(a, t.t0) >= 0 && dCmpSqT(a, t.t1) < 0; }
    function inSec(b, t) { return secOf(b, t.N) === t.sec; }
    function turnsOK(b, t) { return !t.turns || modParts(b, M, C).Q >= BigInt(t.turns); }
    // one rule draws the cell and judges the hit: the distance band, the sector, the whole turns, the link
    function isHit(a, b, t) { return !!t && inBand(a, t) && inSec(b, t) && turnsOK(b, t) && (!t.link || linked); }
    function fastSector(st, N) {
      var c = Number(C);
      if (C <= MAXB && 2 * c * N + c <= MAX) {
        var x = 2 * st * N + c, y = 2 * c, q = Math.floor(x / y), r = x - q * y;
        if (r < 0) q--; else if (r >= y) q++;
        return q % N;
      }
      return sectorOf(BigInt(st), C, N);
    }
    function isLit(s, t) { for (var j = 0; j < s.lit.length; j++) { var l = s.lit[j]; if (l.t0 === t.t0 && l.t1 === t.t1 && l.N === t.N && l.sec === t.sec) return true; } return false; }
    // the first [B] of 0 or more that stands in a sector after going round at least `turns` times, or -1
    function findB(sec, N, turns) {
      var b0 = 0;
      if (turns) { if (M === 0n) return -1; var need = (BigInt(turns) * C + M - 1n) / M; if (need > MAXB - 400000n) return -1; b0 = Number(need); }
      var span = C > 400000n ? 400000 : Number(C);
      for (var k = b0; k <= b0 + span; k++) if (fastSector(fast(k), N) === sec) return k;
      return -1;
    }
    // the first key of a ring that stands in a sector, or -1
    function findKey(n, N, sec) {
      var lo = n * n, hi = Math.min(MAX, lo + Math.min(2 * n, 400000));
      for (var k = lo; k <= hi; k++) if (fastSector(fast(k), N) === sec) return k;
      return -1;
    }
    // a linked target is made from a real key T: the cell that T's dot stands in. It asks for the link.
    function keyTarget(s) {
      var gi = Math.max(0, s.found - LINK_AT), l = sectorsFor(C), N = l[Math.min(l.length - 1, Math.floor(gi / 4))];
      var st = STAGES[Math.min(STAGES.length - 1, Math.floor(gi / 3))];
      var cr = ringA(A), cs = secOf(B, N), fallback = null, cand = null;
      for (var a = 0; a < 60; a++) {
        var n = st[0] + Math.floor(rnd() * (st[1] - st[0] + 1));
        var T = n * n + Math.floor(rnd() * (2 * n + 1));
        cand = { t0: n * 10, t1: n * 10 + 10, N: N, sec: sectorOf(stepOf(BigInt(T), M, C), C, N), turns: 0, link: true, kind: 'KEY', a: String(T), b: String(T), hand: false };
        if (n === cr && cand.sec === cs) continue;   // never under the dot
        fallback = fallback || cand;
        if (!isLit(s, cand)) return cand;
      }
      return fallback || cand;
    }
    // an unlinked target is made from a real answer too: an [A] and a [B] that hit it are kept with it
    function freeTarget(s) {
      var f = s.found, later = f - LINK_AT - LINK_N, kind = f < PLAN.length ? PLAN[f] : LATER[Math.max(0, later) % LATER.length];
      var N = sectorsFor(C)[0], cr = ringA(A), cs = secOf(B, N);
      var wantA = kind.indexOf('A') >= 0, wantB = kind.indexOf('B') >= 0, dec = kind.indexOf('d') >= 0;
      var turns0 = kind.indexOf('2') >= 0 ? 2 : kind.indexOf('1') >= 0 ? 1 : 0;
      var st = f < PLAN.length ? [1, 3] : STAGES[Math.min(STAGES.length - 1, 1 + Math.floor(Math.max(0, later) / 4))];
      var best = null, n, t0, t1, sec, b, turns, j, cand;
      for (var a = 0; a < 40; a++) {
        turns = turns0;
        n = (!wantA && !dec && cr >= 1 && cr <= 9) ? cr : st[0] + Math.floor(rnd() * (st[1] - st[0] + 1));   // [A] already right: only [B] is needed
        t0 = dec ? n * 10 + 4 : n * 10; t1 = dec ? n * 10 + 6 : n * 10 + 10;
        if ((wantA || dec) && dCmpSqT(A, t0) >= 0 && dCmpSqT(A, t1) < 0) continue;   // it must need a new [A]
        sec = cs;
        if (wantB) for (j = 0; j < 40; j++) { sec = fastSector(fast(Math.floor(rnd() * Math.min(Number(C), 1000000))), N); if (sec !== cs) break; }
        b = findB(sec, N, turns);
        if (b < 0 && turns) { turns = 0; b = findB(sec, N, 0); }
        if (b < 0) continue;
        var tc = dec ? (t0 + t1) / 2 : t0;
        cand = { t0: t0, t1: t1, N: N, sec: sec, turns: turns, link: false, kind: kind, a: dText(D(BigInt(tc * tc), 2)), b: String(b), hand: false };
        if (isHit(A, B, cand)) continue;
        best = best || cand;
        if (!isLit(s, cand)) return cand;
      }
      if (best) return best;
      n = cr === 1 ? 2 : 1;   // nothing else fits (a circle of one step, say): the next ring in or out
      return { t0: n * 10, t1: n * 10 + 10, N: N, sec: cs, turns: 0, link: false, kind: 'A', a: String(n * n), b: String(Math.max(0, findB(cs, N, 0))), hand: false };
    }
    function makeTarget(s) { return (linked || (s.found >= LINK_AT && s.found < LINK_AT + LINK_N)) ? keyTarget(s) : freeTarget(s); }
    // more for a smaller target (more sectors, longer numbers), more for fewer typed tries, twice for whole
    // turns or a decimal when typed; a rolled find is a small quiet score
    function basePoints(t) { return 10 * (Math.round(Math.log2(Math.max(1, t.N))) + String(Math.floor(t.t0 * t.t0 / 100)).length); }
    function points(t, tries, typed) {
      var b = basePoints(t), hard = t.turns > 0 || t.t1 - t.t0 < 10;
      if (!typed) return Math.max(1, Math.round(b * 0.2));
      return Math.max(Math.ceil(b * 0.3), Math.round(b / (1 + 0.25 * (Math.max(1, tries) - 1)))) * (hard ? 2 : 1);
    }
    function award(typed) {
      var s = slot(), t = s.target, tries = Math.max(1, s.tries), p = points(t, tries, typed);
      score += p;
      s.lit.push({ t0: t.t0, t1: t.t1, N: t.N, sec: t.sec, a: dText(A), b: B.toString() });
      if (s.lit.length > 400) s.lit.shift();
      s.found++; s.tries = 0; s.ghosts = [];
      s.target = makeTarget(s);
      emit('hit', { typed: typed, points: p, tries: tries, target: t, score: score, a: A, b: B, key: linked ? B : null });
    }
    function setNumbers(m, c, how) {
      if (c < 1n || m < 0n || m > MAXB || c > MAXB) return false;
      var changed = m !== M || c !== C;
      M = m; C = c; fast = fastStep(M, C);
      var li = -1;
      for (var j = 0; j < LEVELS.length; j++) if (LEVELS[j][0] === M && LEVELS[j][1] === C) li = j;
      if (li >= 0) level = li;
      else { level = 6; if (changed || !slots[6].target) slots[6] = newSlot(); }
      if (!slot().target || (linked && !slot().target.link)) slot().target = makeTarget(slot());
      emit('change', { how: how || 'numbers' });
      return true;
    }
    function setAB(a, b) { if (!dEq(a, A) || b !== B) { pA = A; pB = B; } A = a; B = b; }
    function setOne(which, v) {   // v: a decimal for [A], a whole number for [B]; linked: one whole key for both
      if (linked) setAB(D(v, 0), v);
      else if (which === 'A') setAB(v, B);
      else setAB(A, v);
    }
    // what a half-typed string means for the selected number, or null when it is not a number yet
    function parseSel(str) {
      var p;
      if (sel === 'A' && !linked) { p = parseDec(str.replace(/\.$/, '')); return p.ok ? p.value : null; }
      p = parseWhole(str, sel === 'B' && !linked); return p.ok ? p.value : null;
    }
    function fieldText() { return sel === 'M' ? M.toString() : sel === 'C' ? C.toString() : sel === 'A' ? dText(A) : B.toString(); }

    // one key of the keypad or the keyboard: '0'..'9', 'dot', 'sign', 'back', 'clear', 'enter'
    g.press = function (name) {
      var cur, next, p, onAB = sel === 'A' || sel === 'B';
      if (/^[0-9]$/.test(name)) {
        cur = buf === null ? '' : buf;                   // after a commit the next digit starts a new number
        next = cur === '0' ? name : cur === '-0' ? '-' + name : cur + name;
        if (sel === 'A' && !linked) {
          p = parseDec(next);
          if (!p.ok) { if (p.tooLarge) emit('limit'); return; }
        } else {
          p = parseWhole(next, sel === 'B' && !linked);
          if (!p.ok) { if (p.tooLarge) emit('limit'); return; }   // the last good value stays
        }
        buf = next; emit('change', { how: 'preview', which: sel }); return;
      }
      if (name === 'dot') {
        if (sel !== 'A' || linked) return;
        cur = buf === null ? '' : buf;
        if (cur.indexOf('.') >= 0) return;
        buf = (cur === '' ? '0' : cur) + '.'; emit('change', { how: 'preview', which: sel }); return;
      }
      if (name === 'sign') {
        if (sel !== 'B' || linked) return;
        cur = buf === null ? '' : buf;
        buf = cur[0] === '-' ? cur.slice(1) : '-' + cur; emit('change', { how: 'preview', which: sel }); return;
      }
      if (name === 'back') { cur = buf === null ? fieldText() : buf; buf = cur.slice(0, -1); emit('change', { how: 'preview', which: sel }); return; }
      if (name === 'clear') { buf = ''; emit('change', { how: 'preview', which: sel }); return; }
      if (name === 'enter') {
        if (buf === null) return false;
        if (onAB) {
          var v = parseSel(buf);
          if (v === null) return false;
          var s = slot(), which = sel;
          s.tries++;
          setOne(which, v); buf = null;
          emit('change', { how: 'commit', which: which });
          if (isHit(A, B, s.target)) award(true);
          else if (!s.ghosts.some(function (q) { return dEq(q.a, A) && q.b === B; })) { s.ghosts.push({ a: A, b: B }); if (s.ghosts.length > 60) s.ghosts.shift(); }
          return true;
        }
        var f = sel, pv = parseWhole(buf, false);
        sel = 'B'; buf = null;
        if (!pv.ok || (f === 'C' && pv.value < 1n) || !setNumbers(f === 'M' ? pv.value : M, f === 'C' ? pv.value : C)) emit('change', { how: 'field' });
        return true;
      }
    };
    // rolling: the number steps, the dot answers. fine = tenths, for [A] only.
    g.roll = function (which, steps, fine) {
      if (!steps) return;
      if (which === 'M' || which === 'C') {
        var v = (which === 'M' ? M : C) + BigInt(steps);
        if (v > MAXB) { emit('limit'); return; }
        if (v < (which === 'C' ? 1n : 0n)) return;
        buf = null; setNumbers(which === 'M' ? v : M, which === 'C' ? v : C); return;
      }
      buf = null; sel = which;
      if (linked) {
        var k = B + BigInt(steps);
        if (k > MAXB) { emit('limit'); k = MAXB; }
        if (k < 0n) k = 0n;
        setAB(D(k, 0), k);
      } else if (which === 'A') {
        var a = dAddTenths(A, fine ? BigInt(steps) : BigInt(steps) * 10n);
        if (dFloor(a) > MAXB) { emit('limit'); return; }
        setAB(a, B);
      } else {
        var b = B + BigInt(steps);
        if (b > MAXB || b < -MAXB) { emit('limit'); return; }
        setAB(A, b);
      }
      emit('change', { how: 'roll', which: which, steps: steps });
    };
    // the roll has come to rest: a target reached this way is found quietly
    g.settle = function () { if (buf === null && isHit(A, B, slot().target)) { award(false); return true; } return false; };
    g.select = function (f) { if ('ABMC'.indexOf(f) < 0 || f.length !== 1) return; sel = f; buf = null; emit('change', { how: 'field' }); };
    g.setLevel = function (li) { if (li < 0 || li > 5) return; if (sel !== 'A') sel = 'B'; buf = null; setNumbers(LEVELS[li][0], LEVELS[li][1], 'level'); };
    // LINK: both numbers become the same KEY. The key is the selected number, as a whole number of 0 or more.
    g.setLink = function (on) {
      on = !!on; if (on === linked) return;
      var s = slot();
      buf = null; if (sel !== 'A') sel = 'B';
      if (on) { var k = sel === 'A' ? dFloor(A) : (B < 0n ? 0n : B); linked = true; setAB(D(k, 0), k); }
      else linked = false;
      // the target must suit the way of playing: a linked target is always one a single key can hit
      if (on ? !s.target.link : (s.target.link && !(s.found >= LINK_AT && s.found < LINK_AT + LINK_N))) { s.target = makeTarget(s); s.tries = 0; s.ghosts = []; }
      emit('change', { how: 'link' });
    };
    // press and hold: the cell under the finger becomes the target, if a number can stand in it; otherwise the
    // nearest cell of that ring that one can. So a target is always hittable.
    g.setTargetAt = function (r, turn) {
      var s = slot(), N = s.target ? s.target.N : sectorsFor(C)[0], c = Number(C);
      var n = Math.max(1, Math.min(94906264, Math.floor(r)));
      turn = ((turn % 1) + 1) % 1;
      var want = Math.round(turn * N) % N, made = linked ? findKey(n, N, want) : findB(want, N, 0);
      if (made < 0) {   // nearest sector that a number does reach
        var lo = linked ? n * n : 0, hi = linked ? Math.min(MAX, lo + Math.min(2 * n, 400000)) : Math.min(c, 400000), nd = Infinity;
        for (var k = lo; k <= hi; k++) { var da = Math.abs(fast(k) / c - turn); if (da > 0.5) da = 1 - da; if (da < nd) { nd = da; made = k; } }
      }
      var sec = fastSector(fast(made), N);
      s.target = { t0: n * 10, t1: n * 10 + 10, N: N, sec: sec, turns: 0, link: linked, kind: linked ? 'KEY' : 'AB', a: String(linked ? made : n * n), b: String(made), hand: true };
      s.tries = 0; s.ghosts = [];
      emit('target', { hand: true });
      return s.target;
    };
    // how many keys of its ring hit a linked target (every key of the ring is tried)
    g.countKeys = function (t) {
      var n = t.t0 / 10, lo = n * n, hi = lo + 2 * n, cnt = 0;
      for (var k = lo; k <= hi; k++) if (fastSector(fast(k), t.N) === t.sec) cnt++;
      return cnt;
    };
    g.isHit = function (a, b, t) { return isHit(a, b, t || slot().target); };
    // how near the dot is: 1 in the cell, falling with the ring gap and with the angle to the sector
    g.warmth = function (a, b) {
      var t = slot().target; if (!t) return 0;
      var inB = inBand(a, t), inS = inSec(b, t);
      if (inB && inS) return 1;
      var d = Math.sqrt(dNum(a)), mid = (t.t0 + t.t1) / 20, wr = inB ? 1 : 1 - Math.min(1, Math.abs(d - mid) / (mid * 0.5 + 2));
      var ang = Number(stepOf(b, M, C)) / Number(C), da = Math.abs(ang - t.sec / t.N); if (da > 0.5) da = 1 - da;
      var half = 0.5 / t.N, ws = inS || t.N === 1 ? 1 : 1 - Math.max(0, da - half) / (0.5 - half);
      return Math.max(0, Math.min(0.9, 0.5 * wr + 0.5 * ws));
    };
    // what the screen shows: the typed number while typing (a preview), otherwise the committed numbers
    g.shown = function () {
      var a = A, b = B, preview = null, empty = false;
      if (buf !== null && (sel === 'A' || sel === 'B')) {
        var v = parseSel(buf);
        if (v === null) empty = true;
        else if (linked) { a = D(v, 0); b = v; }
        else if (sel === 'A') a = v; else b = v;
        preview = sel;
      }
      return { a: a, b: b, preview: preview, empty: empty };
    };
    // everything worked out for the shown numbers
    g.view = function () {
      var sh = g.shown(), t = slot().target, m = modParts(sh.b, M, C);
      return { a: sh.a, b: sh.b, preview: sh.preview, empty: sh.empty, sqrt: sqrtInfo(sh.a), P: m.P, Q: m.Q, S: m.S,
        dist: Math.sqrt(dNum(sh.a)), turn: Number(m.S) / Number(C), ring: ringA(sh.a),
        ringOn: !!t && inBand(sh.a, t), spokeOn: !!t && inSec(sh.b, t), turnsOn: !!t && turnsOK(sh.b, t) };
    };
    g.place = function (a, b) { return { dist: Math.sqrt(dNum(a)), turn: Number(stepOf(b, M, C)) / Number(C) }; };
    g.on = function (fn) { listeners.push(fn); };
    g.state = function () {
      var s = slot();
      return { level: level, M: M, C: C, A: A, B: B, pA: pA, pB: pB, linked: linked, sel: sel, buf: buf, score: score, target: s.target, lit: s.lit, ghosts: s.ghosts, found: s.found, tries: s.tries };
    };
    // the numbers that ride in the page address
    g.address = function () {
      var t = slot().target;
      return 'm=' + M + '&c=' + C + '&a=' + dText(A) + '&b=' + B + (linked ? '&k=1' : '') + (t ? '&t=' + [t.t0, t.t1, t.N, t.sec, t.turns, t.link ? 1 : 0].join('.') : '');
    };
    g.restore = function (q) {
      var m = M, c = C, p;
      if (q.l && /^[1-6]$/.test(q.l)) { m = LEVELS[+q.l - 1][0]; c = LEVELS[+q.l - 1][1]; }
      if (q.m) { p = parseWhole(q.m, false); if (p.ok) m = p.value; }
      if (q.c) { p = parseWhole(q.c, false); if (p.ok && p.value >= 1n) c = p.value; }
      if (q.a) { p = parseDec(q.a); if (p.ok) A = p.value; }
      if (q.b) { p = parseWhole(q.b, true); if (p.ok) B = p.value; }
      if (q.k === '1') { linked = true; if (B < 0n) B = 0n; A = D(B, 0); }
      pA = A; pB = B; sel = 'B'; buf = null;
      slot().target = null;
      setNumbers(m, c, 'level');
      if (q.t && /^\d{1,9}(\.\d{1,9}){5}$/.test(q.t)) {     // a target sent in a link: kept only if numbers can hit it
        var x = q.t.split('.').map(Number), t = { t0: x[0], t1: x[1], N: x[2], sec: x[3], turns: x[4], link: x[5] === 1, kind: 'AB', hand: true };
        if (t.t0 >= 1 && t.t1 > t.t0 && t.t1 <= 949062650 && t.N >= 1 && t.N <= 360 && t.sec < t.N && t.turns <= 9 && (!t.link || (t.t0 % 10 === 0 && t.t1 === t.t0 + 10))) {
          var made = t.link ? findKey(t.t0 / 10, t.N, t.sec) : findB(t.sec, t.N, t.turns);
          if (made >= 0 && (!linked || t.link)) { t.a = t.link ? String(made) : dText(D(BigInt(t.t0) * BigInt(t.t0), 2)); t.b = String(made); slot().target = t; slot().tries = 0; slot().ghosts = []; emit('target', { hand: true }); }
        }
      }
    };
    slot().target = makeTarget(slot());
    return g;
  }

  var api = {
    MAX: MAX, LEVELS: LEVELS, STAGES: STAGES, PLAN: PLAN, LINK_AT: LINK_AT, LINK_N: LINK_N, LIMIT_LINE: LIMIT_LINE,
    isqrt: isqrt, stepOf: stepOf, modParts: modParts, sectorOf: sectorOf, D: D, dText: dText, dFloor: dFloor, dCmpSqT: dCmpSqT,
    parseDec: parseDec, parseWhole: parseWhole, sqrtInfo: sqrtInfo, degText: degText, turnText: turnText,
    sectorsFor: sectorsFor, fastStep: fastStep, sheetFormulas: sheetFormulas, seeded: seeded, makeGame: makeGame,
    // the place where the real thing plugs in: called with the key of every linked hit (a BigInt). Later this
    // opens SEE THROUGH at the place that key stands for. Replace it; nothing else needs to change.
    onHit: function (key) {}
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KGOne = api;
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  // =====================================================================================================
  // 3. THE SCREEN. One canvas for the circle; plain white text for the two numbers. Colour is in the
  //    drawing only: white, one cool colour (the target and its two lights), one warm colour (the dot).
  // =====================================================================================================
  var FONT = '-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  var WARM = '255,176,0';   // the dot: the star colour of modules\zoom.js (C.amber, a disc with a soft halo)
  var COOL = '102,204,255';
  var query = {};
  (location.search.slice(1) + '&' + location.hash.slice(1)).split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) query[a[0]] = decodeURIComponent(a[1] || ''); });
  var calm = query.calm === '1' || (query.calm !== '0' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var game = makeGame(query.seed ? { random: seeded(+query.seed) } : {});
  api.game = game;
  api._dbg = function () { return { R: cv.R, w: cv.w, h: cv.h, rv: Math.exp(view.lrv), padOpen: padOpen, rolling: !!mom }; };   // for the tests: what the circle measures

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var ICON = {
    back: '<svg viewBox="0 0 32 24" width="30" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 3.5h18.5v17H11L2.5 12z"/><path d="M15.5 8l8 8M23.5 8l-8 8"/></svg>',
    enter: '<svg viewBox="0 0 30 24" width="30" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 13l7.5 7.5L26 4"/></svg>',
    on: '<svg viewBox="0 0 28 24" width="26" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9h5l6-5v16l-6-5H3z"/><path d="M18.5 8.5a5 5 0 0 1 0 7M21.5 5.5a9 9 0 0 1 0 13"/></svg>',
    off: '<svg viewBox="0 0 28 24" width="26" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9h5l6-5v16l-6-5H3z"/><path d="M19 9l6 6M25 9l-6 6"/></svg>',
    link: '<svg viewBox="0 0 40 24" width="40" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="20" height="10" rx="5"/><rect x="17" y="7" width="20" height="10" rx="5"/></svg>',
    unlink: '<svg viewBox="0 0 40 24" width="40" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="7" width="16" height="10" rx="5"/><rect x="22.5" y="7" width="16" height="10" rx="5"/></svg>'
  };
  var host = document.getElementById('one') || document.body;
  var rootEl = el('div', 'k1');
  var tlEl = el('div', 'k1-tl'), trEl = el('div', 'k1-tr'), pipsEl = el('div', 'k1-pips'), scoreEl = el('div', 'k1-score', '<span class="k1-add"></span><span class="k1-sv">0</span>');
  var muteEl = el('div', 'k1-tool k1-mute'), copyEl = el('div', 'k1-copy', 'COPY');
  var stageEl = el('div', 'k1-stage'), canvas = el('canvas', 'k1-cv'), msgEl = el('div', 'k1-msg');
  var linkEl = el('div', 'k1-link'), padEl = el('div', 'k1-pad');
  var pips = [];
  for (var pi = 0; pi < 6; pi++) { var pe = el('div', 'k1-pip', '<i></i>'); pe.setAttribute('data-l', pi); pipsEl.appendChild(pe); pips.push(pe); }
  tlEl.appendChild(pipsEl); tlEl.appendChild(muteEl); trEl.appendChild(scoreEl);
  stageEl.appendChild(canvas); stageEl.appendChild(msgEl); stageEl.appendChild(copyEl);
  function makeRoller(which) {
    var r = el('div', 'k1-rl k1-rl-' + which.toLowerCase());
    r.head = el('div', 'k1-h'); r.row = el('div', 'k1-row'); r.box = el('div', 'k1-box'); r.num = el('span', 'k1-n'); r.res = el('div', 'k1-res'); r.work = el('div', 'k1-w');
    r.box.appendChild(el('i', 'k1-up')); r.box.appendChild(r.num); r.box.appendChild(el('i', 'k1-dn'));
    r.row.appendChild(r.box); r.row.appendChild(r.res);
    r.appendChild(r.head); r.appendChild(r.row); r.appendChild(r.work);
    r.which = which; return r;
  }
  var rA = makeRoller('A'), rB = makeRoller('B');
  var KEYS = [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['0', '0'],
    ['clear', 'C'], ['back', ICON.back], ['dot', '.'], ['sign', '&minus;'], ['enter', ICON.enter]];
  KEYS.forEach(function (k) { var b = el('div', 'k1-key k1-key-' + k[0], k[1]); b.setAttribute('data-k', k[0]); padEl.appendChild(b); });
  [tlEl, trEl, stageEl, rA, linkEl, rB, padEl].forEach(function (n) { rootEl.appendChild(n); });
  host.appendChild(rootEl);
  var ctx = canvas.getContext('2d');
  // the light layer under the drawing (fx-common.js and fx-raw.js, copied from fx\; interface in fx\INTEGRATION.md).
  // Used for one thing: the burst of a typed hit. When the files or WebGL are missing, one.js draws its own burst.
  var light = null;
  if (query.nogl !== '1' && window.KGFXEngines && window.KGFXEngines.raw) {
    try {
      var fxHost = el('div', 'k1-fx'); stageEl.insertBefore(fxHost, canvas);
      light = window.KGFXEngines.raw.create(fxHost);
      if (!light) stageEl.removeChild(fxHost);
      else light.canvas.addEventListener('webglcontextlost', function () { var l = light; light = null; try { l.destroy(); } catch (e) {} });
    } catch (e) { light = null; }
  }
  api.light = function () { return !!light; };
  var padOpen = false;

  // ---------------------------------------------------------------- sound: one soft rising chord, only after a gesture
  var actx = null, muted = false;
  function audio() {
    if (muted) return null;
    if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { actx = new AC(); } catch (e) { return null; } }
    if (actx.state === 'suspended') { try { var p = actx.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    return actx;
  }
  var ROOTS = [261.63, 293.66, 329.63, 392.0, 440.0], chords = 0;
  function chord() {
    var a = audio(); if (!a) return;
    var base = ROOTS[chords++ % ROOTS.length], t0 = a.currentTime + 0.02, out = a.createGain();
    out.gain.value = 0.5; out.connect(a.destination);
    [1, 1.25, 1.5, 2].forEach(function (mult, n) {
      var o = a.createOscillator(), o2 = a.createOscillator(), gn = a.createGain(), g2 = a.createGain(), t = t0 + n * 0.075;
      o.type = 'sine'; o.frequency.value = base * mult; o2.type = 'triangle'; o2.frequency.value = base * mult * 2;
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.11, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      g2.gain.value = 0.18;
      o.connect(gn); o2.connect(g2); g2.connect(gn); gn.connect(out);
      o.start(t); o2.start(t); o.stop(t + 0.65); o2.stop(t + 0.65);
    });
  }
  function setMuted(b) {
    muted = !!b; muteEl.innerHTML = muted ? ICON.off : ICON.on;
    if (window.KGAudio && window.KGAudio.setMuted) { try { window.KGAudio.setMuted(muted); } catch (e) {} }
  }
  setMuted(false);

  // ---------------------------------------------------------------- the two numbers and their working
  var showFull = false, msgTimer = 0;
  function sg(html, cls) { return '<span class="k1-sg' + (cls ? ' ' + cls : '') + '">' + html + '</span>'; }
  function numClass(txt) { var n = txt.length; return n <= 4 ? '' : n <= 7 ? ' k1-n2' : n <= 11 ? ' k1-n3' : ' k1-n4'; }
  function boxText(which, st, v) {
    var typing = st.buf !== null && (st.sel === which || (st.linked && (st.sel === 'A' || st.sel === 'B')));
    var txt = typing ? st.buf : which === 'A' ? dText(st.A) : st.B.toString();
    return { txt: txt, typing: typing };
  }
  function renderRoller(r, st, v) {
    var which = r.which, bt = boxText(which, st, v), on = st.sel === which || (st.linked && (st.sel === 'A' || st.sel === 'B'));
    r.num.className = 'k1-n' + numClass(bt.txt) + (bt.typing ? ' k1-typing' : '');
    r.num.innerHTML = bt.txt.replace('-', '&minus;') + (bt.typing ? '<i class="k1-ct"></i>' : '');
    r.box.classList.toggle('k1-on', on);
    var blank = v.empty && bt.typing;
    if (which === 'A') {
      r.head.innerHTML = 'SQRT';
      r.res.innerHTML = blank ? '' : '<i class="k1-ar"></i>' + (v.sqrt.exact ? '' : '&asymp;&thinsp;') + v.sqrt.text;
      r.work.innerHTML = blank ? '' : sg(v.sqrt.text + ' x ' + v.sqrt.text + ' ') + sg((v.sqrt.exact ? '= ' : '&asymp; ') + dText(v.a));
    } else {
      var mOn = st.sel === 'M', cOn = st.sel === 'C', big = st.C > 360n, m = st.M.toString(), c = st.C.toString();
      var mTxt = mOn && st.buf !== null ? st.buf + '<i class="k1-ct"></i>' : m, cTxt = cOn && st.buf !== null ? st.buf + '<i class="k1-ct"></i>' : c;
      r.head.innerHTML = (st.M !== 1n || mOn ? sg('x <span class="k1-f' + (mOn ? ' k1-on' : '') + '" data-f="M">' + mTxt + '</span> ') : '') +
        sg('MOD <span class="k1-f' + (cOn ? ' k1-on' : '') + '" data-f="C">' + cTxt + '</span>');
      r.res.innerHTML = blank ? '' : '<i class="k1-ar"></i>' + v.S.toString();
      var b = v.b.toString().replace('-', '&minus;'), q = v.Q.toString().replace('-', '&minus;'), w = '';
      if (!blank) {
        var tail = sg('= ' + q + ' x ' + c + ' ', big ? 'k1-wq' : '') + sg('+ ' + v.S.toString(), big ? 'k1-wq' : '');
        if (st.M === 1n) w = sg(b + ' ') + tail;
        else if (big && !showFull) w = sg('... ', 'k1-more k1-wq') + tail;
        else w = sg(b + ' x ' + m + ' ') + sg('= ' + v.P.toString().replace('-', '&minus;') + ' ') + tail;
        if (big) {   // large circles: the step as degrees, and, linked, what the last change of key did
          w += sg('  ' + degText(v.S, st.C) + '&deg;', 'k1-deg');
          var base = v.preview ? st.B : st.pB, d = v.b - base;
          if (st.linked && d !== 0n) w += '<span class="k1-br"></span>' + sg('KEY ' + (d > 0n ? '+ ' : '&minus; ') + (d > 0n ? d : -d).toString() + ' : TURN ' + turnText(stepOf(base, st.M, st.C), v.S, st.C).replace('-', '&minus;'));
        }
      }
      r.work.innerHTML = w;
    }
  }
  function render() {
    var st = game.state(), v = game.view(), j;
    renderRoller(rA, st, v); renderRoller(rB, st, v);
    for (j = 0; j < 6; j++) pips[j].classList.toggle('k1-on', st.level === j);
    rootEl.classList.toggle('k1-bigc', st.C > 360n);
    linkEl.innerHTML = st.linked ? ICON.link : ICON.unlink;
    linkEl.classList.toggle('k1-on', st.linked);
    linkEl.classList.toggle('k1-ask', !!st.target && st.target.link && !st.linked);
    // the point is for [A] (decimals), the minus sign for [B] (clockwise); neither when the two are one key
    padEl.querySelector('.k1-key-dot').classList.toggle('k1-off', !(st.sel === 'A' && !st.linked));
    padEl.querySelector('.k1-key-sign').classList.toggle('k1-off', !(st.sel === 'B' && !st.linked));
    // side by side when both fit; one above the other when a number is too long for half the width
    if (!rootEl.classList.contains('k1-side')) {
      rootEl.classList.remove('k1-stack');
      if (overflows(rA) || overflows(rB)) rootEl.classList.add('k1-stack');
    }
  }
  function overflows(r) { return r.row.scrollWidth > r.clientWidth + 1 || r.head.scrollWidth > r.clientWidth + 1; }
  function say(text, ms) {
    msgEl.textContent = text; msgEl.style.display = text ? 'block' : 'none';
    clearTimeout(msgTimer); if (text) msgTimer = setTimeout(function () { msgEl.style.display = 'none'; msgEl.textContent = ''; }, ms || 5000);
  }
  function rollTick(r, dir) {   // the number slides the way the finger went
    if (calm) return;
    r.num.classList.remove('k1-up1', 'k1-dn1'); void r.num.offsetWidth; r.num.classList.add(dir > 0 ? 'k1-up1' : 'k1-dn1');
  }

  // ---------------------------------------------------------------- the score
  var scoreShown = 0, scoreFrom = 0, scoreTo = 0, scoreT0 = 0;
  function setScore(v, add) {
    scoreFrom = scoreShown; scoreTo = v; scoreT0 = performance.now();
    var a = scoreEl.querySelector('.k1-add'); a.textContent = '+' + add; a.classList.remove('k1-go'); void a.offsetWidth; a.classList.add('k1-go');
  }

  // ---------------------------------------------------------------- the circle
  var cv = { w: 0, h: 0, dpr: 1, R: 100 }, rim = { ticks: [], labels: [] };
  var view = { lrv: Math.log(4), target: Math.log(4) };
  // the dot: distance r0 -> r1; angle a1 at the end, reached after a sweep of `sweep` turns (signed, the true way round)
  var dot = { r0: 2, r1: 2, a1: 0, sweep: 0, t0: -1e9, dur: 0, dim: 0, warm: 0, warmTo: 0, q: 0n, b: 0n, trueWay: false };
  var fx = { hitT: -1e9, softT: -1e9, hitCell: null, hitAt: null, parts: [], ringT: -1e9, ringN: 0, targetT: 0, hold: null, drops: [], lapShown: null };
  var lastRing = 2, lastT = performance.now();

  function cfont(px) { return '400 ' + px + 'px ' + FONT; }
  function buildRim() {
    var st = game.state(), C = st.C, c = Number(C), j;
    rim.ticks = []; rim.labels = [];
    if (C <= 72n) for (j = 0; j < c; j++) rim.ticks.push(j / c); else for (j = 0; j < 12; j++) rim.ticks.push(j / 12);
    if (C <= 24n) for (j = 0; j < c; j++) rim.labels.push({ a: j / c, text: String(j), step: j });
    else {
      var all = [];
      for (j = 0; j < 12; j++) if ((C * BigInt(j)) % 12n === 0n) all.push({ a: j / 12, text: (C * BigInt(j) / 12n).toString(), i: j });   // only marks that are whole steps get a number
      var long = all.some(function (l) { return l.text.length > 4; });
      rim.labels = long ? all.filter(function (l) { return l.i % 3 === 0; }) : all;
      rim.labels.forEach(function (l) { if (long && l.i === 6) l.rot = true; });
    }
    ctx.font = cfont(24);
    rim.labels.forEach(function (l) { l.w = ctx.measureText(l.text).width; l.h = 22; });
  }
  // the largest circle whose rim numbers still fit in the space
  function solveR(W, H) {
    var R = Math.min(W, H) / 2 - 6, gap = 8;
    rim.labels.forEach(function (l) {
      var w = l.rot ? l.h : l.w, h = l.rot ? l.w : l.h, co = Math.abs(Math.cos(2 * Math.PI * l.a)), si = Math.abs(Math.sin(2 * Math.PI * l.a));
      var sup = (co * w + si * h) / 2 + gap; l.sup = sup;
      if (co > 1e-6) R = Math.min(R, (W / 2 - 3 - w / 2) / co - sup);
      if (si > 1e-6) R = Math.min(R, (H / 2 - 3 - h / 2) / si - sup);
    });
    return Math.max(30, R);
  }
  function sizeCanvas() {
    var w = stageEl.clientWidth, h = stageEl.clientHeight, dpr = Math.min(3, window.devicePixelRatio || 1);
    if (!w || !h) return;
    if (w !== cv.w || h !== cv.h || dpr !== cv.dpr) {
      cv.w = w; cv.h = h; cv.dpr = dpr; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      if (light) { try { light.resize(w, h, dpr); } catch (e) { light = null; } }
    }
    rim.hide = false; cv.R = solveR(w, h);
    if (cv.R < 64) { rim.hide = true; cv.R = Math.max(20, Math.min(w, h) / 2 - 8); }   // no room for the rim numbers: the circle keeps the space
  }
  function layout() {
    var W = window.innerWidth, H = window.innerHeight, side = W > H * 1.15 && W >= 600;
    rootEl.classList.toggle('k1-side', side);
    rootEl.classList.toggle('k1-padopen', padOpen);
    rootEl.classList.toggle('k1-short', side && H < 620);
    if (side) {
      rootEl.classList.remove('k1-stack');
      var col = Math.max(200, Math.min(300, Math.floor((W - H) / 2)));
      rootEl.style.setProperty('--col', col + 'px');
      render();
      var need = 0;
      [].forEach.call(rootEl.querySelectorAll('.k1-rl .k1-sg,.k1-rl .k1-box,.k1-rl .k1-res'), function (n) { need = Math.max(need, n.offsetWidth); });
      need += 20;   // the widest piece that cannot be broken decides how wide the two columns must be
      if (need > col) rootEl.style.setProperty('--col', Math.min(need, Math.floor((W - 220) / 2)) + 'px');
    } else render();
    buildRim(); sizeCanvas();
  }
  function setPad(open) { if (open === padOpen) return; padOpen = open; layout(); }
  function nice(x) {   // the rim sits on a whole distance: 4, 5, 6 ... then 15, 20, 25 ... 150, 200 ...
    if (x <= 10) return Math.max(4, Math.ceil(x));
    var s = Math.pow(10, Math.floor(Math.log10(x))) / 2;
    return Math.ceil(x / s) * s;
  }
  function aimView() {
    var st = game.state(), v = game.view(), need = v.dist * 1.04 + 0.2;
    if (st.target) need = Math.max(need, st.target.t1 / 10);
    view.target = Math.log(nice(need));
    if (calm) view.lrv = view.target;
  }
  function dotNow(now) {
    var u = dot.dur <= 0 ? 1 : Math.min(1, (now - dot.t0) / dot.dur), e = 1 - Math.pow(1 - u, 3);
    return { r: dot.r0 + (dot.r1 - dot.r0) * e, u: dot.a1 - dot.sweep * (1 - e), done: u >= 1 };
  }
  // the dot answers a change of number. [A] slides it along its spoke; [B] runs it round the true way, right
  // round when the number is larger than the circle (at most three full turns are drawn).
  function moveDot(d) {
    var now = performance.now(), st = game.state(), v = game.view(), p = dotNow(now);
    var cur = ((p.u % 1) + 1) % 1, base = v.turn - cur, sweep;
    if (base > 0.5) base -= 1; if (base < -0.5) base += 1;
    sweep = base;
    var db = v.b - dot.b;
    dot.trueWay = db !== 0n && (!st.linked || db === 1n || db === -1n);
    if (dot.trueWay) {
      var want = Number(db * st.M) / Number(st.C);                       // the true sweep, in turns
      sweep = base + Math.round(want - base);
      if (Math.abs(sweep - want) > 0.5) sweep = base;                    // very large numbers: only the last part is exact
      if (Math.abs(sweep) > 3.999) sweep = (sweep > 0 ? 1 : -1) * (3 + (Math.abs(sweep) % 1));
    }
    dot.b = v.b;
    dot.r0 = p.r; dot.r1 = v.dist; dot.a1 = v.turn; dot.sweep = sweep; dot.t0 = now; dot.q = v.Q;
    fx.lapShown = Math.floor(dot.a1 - dot.sweep + 1e-9);
    dot.dur = calm ? 0 : d.how === 'roll' ? 110 : Math.max(200, Math.min(1100, 200 + 300 * Math.abs(sweep)));
    dot.warmTo = game.warmth(v.a, v.b);
    if (v.ring !== lastRing) { if (v.ring >= 1) { fx.ringT = now; fx.ringN = v.ring; } lastRing = v.ring; }   // a square number was crossed: the new ring lights
    aimView();
  }
  function jumpDot() {
    var v = game.view();
    dot.r0 = dot.r1 = v.dist; dot.a1 = v.turn; dot.sweep = 0; dot.dur = 0; dot.b = v.b; dot.q = v.Q; dot.trueWay = false; lastRing = v.ring; fx.lapShown = null;
    dot.warmTo = game.warmth(v.a, v.b); aimView();
  }

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function nextTier(m) { var lead = m / Math.pow(10, Math.floor(Math.log10(m) + 1e-9)); return Math.abs(lead - 2) < 0.01 ? m * 2.5 : m * 2; }
  function cellPath(cx, cy, sc, t) {
    var r0 = t.t0 / 10 * sc, r1 = t.t1 / 10 * sc;
    ctx.beginPath();
    if (t.N === 1) { ctx.arc(cx, cy, r1, 0, 2 * Math.PI); ctx.moveTo(cx + r0, cy); ctx.arc(cx, cy, r0, 0, 2 * Math.PI, true); return; }
    var a0 = 2 * Math.PI * (t.sec - 0.5) / t.N, a1 = 2 * Math.PI * (t.sec + 0.5) / t.N;
    ctx.arc(cx, cy, r1, -a0, -a1, true); ctx.arc(cx, cy, r0, -a1, -a0, false); ctx.closePath();
  }
  function cellCentre(cx, cy, sc, t) { var a = t.N === 1 ? 0 : 2 * Math.PI * t.sec / t.N, r = (t.t0 + t.t1) / 20 * sc; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; }
  function glow(x, y, rad, rgb, alpha) {
    var gr = ctx.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')'); gr.addColorStop(0.4, 'rgba(' + rgb + ',' + alpha * 0.35 + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rad, 0, 2 * Math.PI); ctx.fill();
  }
  function stackPlace(W, H, cx, cy, R) { return [W - 16, Math.min(H - 12, cy + R + 52)]; }

  function draw(now) {
    var dt = Math.min(100, now - lastT); lastT = now;
    rollStep(dt);
    var W = cv.w, H = cv.h, cx = W / 2, cy = H / 2, R = cv.R, st = game.state(), v = game.view(), j, d;
    view.lrv += (view.target - view.lrv) * (calm ? 1 : 1 - Math.exp(-dt / 110));
    if (Math.abs(view.target - view.lrv) < 1e-4) view.lrv = view.target;
    var rv = Math.exp(view.lrv), sc = R / rv, t = st.target;
    dot.warm += (dot.warmTo - dot.warm) * (calm ? 1 : 1 - Math.exp(-dt / 140));
    dot.dim += ((v.preview ? 1 : 0) - dot.dim) * (calm ? 1 : 1 - Math.exp(-dt / 70));
    ctx.setTransform(cv.dpr, 0, 0, cv.dpr, 0, 0);
    if (light) {   // the light layer paints the black and the burst; this canvas stays clear above it
      ctx.clearRect(0, 0, W, H);
      try { light.setView(cx, cy, sc); light.frame(dt / 1000); } catch (e) { light = null; }
    } else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    var born = t ? Math.max(0, Math.min(1, (now - fx.targetT) / 500)) : 0, breath = calm ? 0.5 : 0.5 + 0.5 * Math.sin(now / 900);

    // the target's two lights, under everything: its ring when [A] is right, its spoke when [B] is right
    if (t && born > 0) {
      if (v.ringOn && !v.empty) {
        ctx.beginPath(); ctx.arc(cx, cy, t.t1 / 10 * sc, 0, 2 * Math.PI); ctx.moveTo(cx + t.t0 / 10 * sc, cy); ctx.arc(cx, cy, t.t0 / 10 * sc, 0, 2 * Math.PI, true);
        ctx.fillStyle = 'rgba(' + COOL + ',' + 0.08 * born + ')'; ctx.fill('evenodd');
        ctx.strokeStyle = 'rgba(' + COOL + ',' + 0.55 * born + ')'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      if (v.spokeOn && !v.empty && t.N > 1) {
        var s0 = 2 * Math.PI * (t.sec - 0.5) / t.N, s1 = 2 * Math.PI * (t.sec + 0.5) / t.N;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -s0, -s1, true); ctx.closePath();
        ctx.fillStyle = 'rgba(' + COOL + ',' + 0.08 * born + ')'; ctx.fill();
        ctx.strokeStyle = 'rgba(' + COOL + ',' + 0.55 * born + ')'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    // faint rings at whole distances, with their numbers under the line at 3 o'clock. The number the target
    // wants is brighter; a number that would crowd it goes.
    ctx.font = cfont(24); ctx.textBaseline = 'top'; ctx.textAlign = 'right';
    var lt = 1, Lt = 1;
    while (lt * sc < 9) lt = nextTier(lt);
    while (Lt * sc < Math.max(30, ctx.measureText(String(Math.floor(rv / Lt) * Lt)).width + 14)) Lt = nextTier(Lt);
    var fade = smooth(9, 20, lt * sc), seen = {}, want = null;
    if (t && born > 0) {
      var wd = t.t1 - t.t0 < 10 ? (t.t0 + t.t1) / 20 : t.t0 / 10, wtxt = String(wd), ww = ctx.measureText(wtxt).width, wx = cx + wd * sc - 5;
      if (wd * sc - ww - 5 > 3) { want = { x0: wx - ww - 8, x1: wx + 8, d: wd }; ctx.fillStyle = 'rgba(255,255,255,' + 0.95 * born + ')'; ctx.fillText(wtxt, wx, cy + 6); }
    }
    function ring(d0, strong) {
      if (seen[d0] || d0 > rv + 1e-9) return; seen[d0] = 1;
      if (Math.abs(d0 - rv) > 1e-6) {
        ctx.strokeStyle = 'rgba(255,255,255,' + (strong ? 0.2 : 0.11 * fade) + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, d0 * sc, 0, 2 * Math.PI); ctx.stroke();
      }
      if (strong) {
        var txt = String(d0), tw = ctx.measureText(txt).width, x1 = cx + d0 * sc - 5, x0 = x1 - tw;
        if (want && (want.d === d0 || (x0 < want.x1 && x1 > want.x0))) return;
        if (d0 * sc - tw - 5 > 3) { ctx.fillStyle = 'rgba(255,255,255,0.42)'; ctx.fillText(txt, x1, cy + 6); }
      }
    }
    for (d = Lt; d <= rv + 1e-9; d += Lt) ring(d, true);
    if (fade > 0.01) for (d = lt; d <= rv + 1e-9; d += lt) ring(d, false);
    // the line at 3 o'clock, the one circle, its step marks and their numbers
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.beginPath();
    for (j = 0; j < rim.ticks.length; j++) { var ta = 2 * Math.PI * rim.ticks[j], co = Math.cos(ta), si = Math.sin(ta); ctx.moveTo(cx + (R - 4) * co, cy - (R - 4) * si); ctx.lineTo(cx + (R + 4) * co, cy - (R + 4) * si); }
    ctx.stroke();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    var tStep = t && born > 0 && t.N > 1 ? Number((2n * BigInt(t.sec) * st.C + BigInt(t.N)) / (2n * BigInt(t.N))) : -1;   // the step in the middle of the target's sector
    var stepNow = v.empty ? -1 : Number(v.S), tDrawn = false;
    for (j = 0; j < rim.labels.length && !rim.hide; j++) {
      var l = rim.labels[j], la = 2 * Math.PI * l.a, lx = cx + (R + l.sup) * Math.cos(la), ly = cy - (R + l.sup) * Math.sin(la);
      var isT = String(tStep) === l.text, isNow = String(stepNow) === l.text;
      if (isT) tDrawn = true;
      ctx.fillStyle = 'rgba(255,255,255,' + (isT ? 0.95 : isNow ? 0.8 : 0.42) + ')';
      if (l.rot) { ctx.save(); ctx.translate(lx, ly); ctx.rotate(-Math.PI / 2); ctx.fillText(l.text, 0, 1); ctx.restore(); }
      else ctx.fillText(l.text, lx, ly + 1);
    }

    // found cells stay lit
    for (j = 0; j < st.lit.length; j++) {
      var lc = st.lit[j]; if (lc.t0 / 10 > rv) continue;
      var fresh = fx.hitCell === lc ? Math.max(0, 1 - (now - fx.hitT) / 900, 0.5 * (1 - (now - fx.softT) / 700)) : 0;
      if (lc.t1 / 10 * sc < 3) { glow(cx, cy, 3, WARM, 0.5); continue; }
      cellPath(cx, cy, sc, lc);
      ctx.fillStyle = 'rgba(255,' + Math.round(176 + 60 * fresh) + ',' + Math.round(140 * fresh) + ',' + (0.3 + 0.55 * fresh) + ')'; ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(255,196,64,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // the one target: a softly glowing cell. Small rings on it = whole turns it asks for; a link = it asks for LINK.
    if (t && born > 0) {
      var tc = cellCentre(cx, cy, sc, t), both = v.ringOn && v.spokeOn && !v.empty;
      var size = Math.min((t.t1 - t.t0) / 10 * sc, t.N === 1 ? 1e9 : (t.t0 + t.t1) / 20 * sc * 2 * Math.PI / t.N);
      if (size < 22) glow(tc[0], tc[1], 16, COOL, (0.3 + 0.2 * breath) * born);   // a small cell is never lost: a soft light marks it
      cellPath(cx, cy, sc, t);
      ctx.fillStyle = 'rgba(' + COOL + ',' + (both ? 0.42 : 0.17 + 0.11 * breath) * born + ')'; ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(' + COOL + ',' + 0.22 * born + ')'; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = 'rgba(' + COOL + ',' + (0.72 + 0.2 * breath) * born + ')'; ctx.lineWidth = 1.5; ctx.stroke();
      if (t.turns) {
        var have = v.empty ? 0n : v.Q;
        for (j = 0; j < t.turns; j++) {
          var tx = tc[0] + (j - (t.turns - 1) / 2) * 15;
          ctx.beginPath(); ctx.arc(tx, tc[1], 5.5, 0, 2 * Math.PI);
          ctx.fillStyle = have > BigInt(j) ? 'rgba(255,255,255,' + 0.95 * born + ')' : 'rgba(0,0,0,0.55)'; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,' + 0.95 * born + ')'; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
      if (t.link) {
        ctx.strokeStyle = 'rgba(255,255,255,' + (st.linked ? 0.95 : 0.75) * born + ')'; ctx.lineWidth = 1.5;
        var off = st.linked ? 4 : 7;
        ctx.beginPath(); ctx.ellipse(tc[0] - off, tc[1], 7, 4, 0, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(tc[0] + off, tc[1], 7, 4, 0, 0, 2 * Math.PI); ctx.stroke();
      }
      // the step the target wants, at the rim, when the rim does not already carry that number
      if (!tDrawn && !rim.hide && tStep >= 0 && String(tStep).length <= 4) {
        var ta2 = 2 * Math.PI * t.sec / t.N, tw2 = ctx.measureText(String(tStep)).width, crowd = false;
        var sup2 = (Math.abs(Math.cos(ta2)) * tw2 + Math.abs(Math.sin(ta2)) * 22) / 2 + 8, qx = cx + (R + sup2) * Math.cos(ta2), qy = cy - (R + sup2) * Math.sin(ta2);
        for (j = 0; j < rim.labels.length; j++) { var l2 = rim.labels[j], a3 = 2 * Math.PI * l2.a; if (Math.abs(cx + (R + l2.sup) * Math.cos(a3) - qx) < (l2.w + tw2) / 2 + 6 && Math.abs(cy - (R + l2.sup) * Math.sin(a3) - qy) < 26) crowd = true; }
        if (!crowd && qx - tw2 / 2 > 2 && qx + tw2 / 2 < W - 2 && qy > 12 && qy < H - 12) { ctx.fillStyle = 'rgba(255,255,255,' + 0.95 * born + ')'; ctx.fillText(String(tStep), qx, qy + 1); }
      }
    }
    // a square number was crossed: the new ring lights for a moment
    var rf = 1 - (now - fx.ringT) / 800;
    if (rf > 0 && fx.ringN <= rv) {
      rf = rf * rf;
      ctx.strokeStyle = 'rgba(255,255,255,' + 0.9 * rf + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, fx.ringN * sc, 0, 2 * Math.PI); ctx.stroke();
    }
    // earlier typed tries: faint ghosts until the target is found
    for (j = 0; j < st.ghosts.length; j++) {
      var gq = st.ghosts[j]; if (!v.preview && gq.b === st.B && gq.a.n === st.A.n && gq.a.s === st.A.s) continue;
      var gp = game.place(gq.a, gq.b), ga = 2 * Math.PI * gp.turn, gx = cx + gp.dist * sc * Math.cos(ga), gy = cy - gp.dist * sc * Math.sin(ga);
      if (gp.dist > rv) continue;
      ctx.strokeStyle = 'rgba(' + WARM + ',0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(gx, gy, 4.5, 0, 2 * Math.PI); ctx.stroke();
    }
    // the one dot, its radius line (carried on, faint, to the rim where the step is read) and its arc from 3 o'clock
    var p = dotNow(now), an = ((p.u % 1) + 1) % 1, pa = 2 * Math.PI * an, pr = Math.min(p.r, rv * 1.02) * sc, px = cx + pr * Math.cos(pa), py = cy - pr * Math.sin(pa);
    var solid = 1 - 0.55 * dot.dim, bright = 0.55 + 0.45 * dot.warm;
    ctx.strokeStyle = 'rgba(' + WARM + ',' + 0.22 * solid + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx + R * Math.cos(pa), cy - R * Math.sin(pa)); ctx.stroke();
    if (pr > 0.5) {
      ctx.strokeStyle = 'rgba(' + WARM + ',' + 0.8 * solid + ')'; ctx.lineWidth = 2;
      if (dot.dim > 0.5) ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      if (an > 1e-6) { ctx.strokeStyle = 'rgba(' + WARM + ',' + 0.5 * solid + ')'; ctx.beginPath(); ctx.arc(cx, cy, pr, 0, -pa, true); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    var swell = calm ? 0 : Math.max(0, 1 - (now - fx.hitT) / 500);
    glow(px, py, (15 + 20 * dot.warm) * (1 + 1.4 * swell), WARM, (0.25 + 0.5 * dot.warm) * (1 - 0.85 * dot.dim));
    ctx.fillStyle = 'rgba(' + WARM + ',' + solid * bright + ')'; ctx.beginPath(); ctx.arc(px, py, 7.5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.6 * dot.warm) * (1 - dot.dim) + ')'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 2 * Math.PI); ctx.fill();

    // whole circles thrown away: a small stack with its count. A circle drops onto it each time the dot comes round.
    var laps = dot.trueWay ? dot.q + BigInt(Math.floor(p.u + 1e-9)) : dot.q, sp = stackPlace(W, H, cx, cy, R);
    if (v.empty) laps = 0n;
    var wrap = Math.floor(p.u + 1e-9);   // the dot has just come round past 3 o'clock: one whole circle drops onto the stack
    if (dot.trueWay && fx.lapShown !== null && wrap > fx.lapShown && !calm && fx.drops.length < 3) fx.drops.push({ t: now });
    fx.lapShown = wrap;
    if (laps !== 0n || fx.drops.length) {
      var ltxt = laps.toString(), lw, nring = laps < 0n ? Number(-laps > 5n ? 5n : -laps) : Number(laps > 5n ? 5n : laps);
      ctx.font = cfont(24); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      if (ltxt.length > 5) ltxt = '';   // a long count stays in the working under the number; here it would crowd the rim
      lw = ctx.measureText(ltxt).width;
      if (laps !== 0n && ltxt) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(ltxt, sp[0], sp[1]); }
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.2;
      if (laps < 0n) ctx.setLineDash([3, 3]);
      for (j = 0; j < nring; j++) { ctx.beginPath(); ctx.ellipse(sp[0] - lw - 22, sp[1] - 5 - j * 5, 13, 4.5, 0, 0, 2 * Math.PI); ctx.stroke(); }
      ctx.setLineDash([]);
      for (j = fx.drops.length - 1; j >= 0; j--) {
        var du = (now - fx.drops[j].t) / 450; if (du >= 1) { fx.drops.splice(j, 1); continue; }
        var de = du * du, dx = cx + (sp[0] - lw - 22 - cx) * de, dy = cy + (sp[1] - 8 - cy) * de, dr = R + (13 - R) * de;
        ctx.strokeStyle = 'rgba(255,255,255,' + 0.55 * (1 - 0.4 * du) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(dx, dy, dr, dr * (1 - 0.65 * de), 0, 0, 2 * Math.PI); ctx.stroke();
      }
    }

    // a typed hit: a burst of light for about a second, then calm
    var ht = (now - fx.hitT) / 1000;
    if (ht < 1.1 && fx.hitAt && !calm && !fx.byLight) {
      var hx = fx.hitAt[0], hy = fx.hitAt[1];
      var rr = 12 + 110 * (1 - Math.pow(1 - Math.min(1, ht / 0.8), 3)), ra = Math.max(0, 1 - ht / 0.8);
      ctx.strokeStyle = 'rgba(255,214,120,' + 0.7 * ra + ')'; ctx.lineWidth = 2 + 3 * ra; ctx.beginPath(); ctx.arc(hx, hy, rr, 0, 2 * Math.PI); ctx.stroke();
      for (j = 0; j < fx.parts.length; j++) {
        var q = fx.parts[j], life = ht / q.life; if (life >= 1) continue;
        var e = 1 - Math.pow(1 - life, 2), qx2 = hx + q.vx * e, qy2 = hy + q.vy * e + 30 * life * life;
        ctx.fillStyle = 'rgba(' + q.c + ',' + (1 - life) + ')'; ctx.beginPath(); ctx.arc(qx2, qy2, q.s * (1 - 0.5 * life), 0, 2 * Math.PI); ctx.fill();
      }
    }
    // press and hold: a ring closes round the finger, then the target is set
    if (fx.hold) {
      var hu = Math.min(1, (now - fx.hold.t) / 550);
      ctx.strokeStyle = 'rgba(' + COOL + ',0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fx.hold.x, fx.hold.y, 26, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * hu); ctx.stroke();
    }
    // the score counts up
    if (scoreShown !== scoreTo) {
      var su = Math.min(1, (now - scoreT0) / 600); scoreShown = su >= 1 ? scoreTo : Math.round(scoreFrom + (scoreTo - scoreFrom) * su);
      scoreEl.querySelector('.k1-sv').textContent = String(scoreShown);
    }
    requestAnimationFrame(draw);
  }

  // ---------------------------------------------------------------- what the game says happened
  var addrTimer = 0;
  function writeAddress() {
    clearTimeout(addrTimer);
    addrTimer = setTimeout(function () { try { location.replace('#' + game.address()); } catch (e) {} }, 450);
  }
  var numbersKey = '';
  game.on(function (type, d) {
    var st = game.state(), now = performance.now();
    if (type === 'change') {
      var nk = st.M + '/' + st.C;
      if (msgEl.textContent === LIMIT_LINE || d.how !== 'preview') say('');
      if (nk !== numbersKey) {   // new numbers: a new circle
        numbersKey = nk; showFull = false; fx.targetT = now; fx.hitCell = null;
        layout(); jumpDot();
        if (st.M === REAL_M && st.C === REAL_C) loadReal();
      } else {
        var side = rootEl.classList.contains('k1-side'), was = rootEl.classList.contains('k1-stack');
        render();
        if (side || was !== rootEl.classList.contains('k1-stack')) layout();
        if (d.how === 'link') { fx.targetT = now; jumpDot(); } else if (d.how !== 'field') moveDot(d);
      }
      if (d.how !== 'preview' && d.how !== 'field') writeAddress();
    } else if (type === 'limit') { say(LIMIT_LINE, 6000);
    } else if (type === 'hit') {
      fx.hitCell = st.lit[st.lit.length - 1]; fx.targetT = now + (d.typed ? 650 : 350);
      if (d.typed) {
        var sc = cv.R / Math.exp(view.target), pl = game.place(d.a, d.b), a = 2 * Math.PI * pl.turn;
        fx.hitT = now; fx.hitAt = [cv.w / 2 + pl.dist * sc * Math.cos(a), cv.h / 2 - pl.dist * sc * Math.sin(a)];
        fx.byLight = false;
        if (light && !calm) { try { light.supernova(pl.dist * Math.cos(a), pl.dist * Math.sin(a), 0.75); fx.byLight = true; } catch (e) { light = null; } }
        fx.parts = [];
        for (var j = 0; j < 34; j++) { var an = Math.random() * 2 * Math.PI, sp0 = 40 + Math.random() * 120; fx.parts.push({ vx: Math.cos(an) * sp0, vy: Math.sin(an) * sp0, life: 0.55 + Math.random() * 0.5, s: 1.5 + Math.random() * 2, c: Math.random() < 0.4 ? '255,255,255' : '255,196,64' }); }
        chord();
        dot.warmTo = 1;
      } else fx.softT = now;   // found by rolling: the cell lights, quietly
      setScore(d.score, d.points);
      setTimeout(function () { var v = game.view(); dot.warmTo = game.warmth(v.a, v.b); aimView(); }, d.typed ? 700 : 350);
      render(); writeAddress();
      if (d.key !== null) { whatLives(d.key); try { api.onHit(d.key); } catch (e) {} }
    } else if (type === 'target') { fx.targetT = now; var v2 = game.view(); dot.warmTo = game.warmth(v2.a, v2.b); aimView(); render(); writeAddress(); }
  });

  // ---------------------------------------------------------------- toward the actual thing: what lives at a real key
  // Only on the real circle, linked, and only when modules\realgame-data.js is beside this file. Same table and
  // same arithmetic as modules\realgame.js (decode and at): first key of commit i = sum of earlier gaps and lines + its gap.
  var real = null, realAsked = false;
  function loadReal() {
    if (realAsked || window.KGRealData) return; realAsked = true;
    var s = document.createElement('script'); s.src = 'modules/realgame-data.js'; s.onerror = function () { s.remove(); }; document.body.appendChild(s);
  }
  function whatLives(k) {
    var st = game.state(), Dt = window.KGRealData;
    if (!Dt || st.M !== REAL_M || st.C !== REAL_C || k < 0n || k >= BigInt(Dt.space)) return;
    try {
      if (!real) {
        var num = function (s) { return s.split(',').map(function (x) { return parseInt(x, 36); }); };
        var lines = num(Dt.lines), gap = num(Dt.gap600), repo = num(Dt.repo), start = [], kk = 0;
        for (var j = 0; j < Dt.n; j++) { kk += gap[j] * 600; start.push(kk); kk += lines[j]; }
        real = { start: start, lines: lines, repo: repo };
      }
      var K = Number(k), lo = 0, hi = Dt.n - 1;
      if (K < real.start[0]) return;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (real.start[mid] <= K) lo = mid; else hi = mid - 1; }
      if (K >= real.start[lo] + real.lines[lo]) return;   // an address no line of code was given: no line
      var name = Dt.repos[real.repo[lo]]; if (!name) return;
      say(name + ' ' + Dt.sha.substr(12 * lo, 12), 7000);
    } catch (e) {}
  }

  // ---------------------------------------------------------------- input
  var PE = !!window.PointerEvent;
  function tap(node, fn) {
    node.addEventListener(PE ? 'pointerdown' : 'touchstart', function (e) { e.preventDefault(); audio(); fn(e); }, { passive: false });
    if (!PE) node.addEventListener('mousedown', function (e) { e.preventDefault(); fn(e); });
  }
  // the keypad: types into the selected number; tick commits
  var flashTimer = 0;
  tap(padEl, function (e) {
    var b = e.target.closest ? e.target.closest('.k1-key') : null; if (!b || b.classList.contains('k1-off')) return;
    stopRoll();
    b.classList.add('k1-hit'); clearTimeout(b._t); b._t = setTimeout(function () { b.classList.remove('k1-hit'); }, 130);
    game.press(b.getAttribute('data-k'));
  });
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, st = game.state();
    var name = /^[0-9]$/.test(k) ? k : k === 'Backspace' ? 'back' : k === 'Enter' ? 'enter' : (k === '.' || k === ',') ? 'dot' : k === '-' ? 'sign' : (k === 'Delete' || k === 'c' || k === 'C') ? 'clear' : null;
    if (name) { e.preventDefault(); audio(); stopRoll(); game.press(name); return; }
    if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); audio(); nudge(st.sel, k === 'ArrowUp' ? 1 : -1); return; }
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Tab') { e.preventDefault(); game.select(k === 'ArrowLeft' ? 'A' : k === 'ArrowRight' ? 'B' : st.sel === 'A' ? 'B' : 'A'); return; }
    if (k === 'Escape') { e.preventDefault(); if (st.buf !== null) game.select(st.sel); else setPad(false); return; }
    if (k === 'l' || k === 'L') { e.preventDefault(); game.setLink(!st.linked); }
  });
  tap(pipsEl, function (e) { var b = e.target.closest('.k1-pip'); if (b) { stopRoll(); game.setLevel(+b.getAttribute('data-l')); } });
  tap(linkEl, function () { stopRoll(); game.setLink(!game.state().linked); });
  tap(muteEl, function () { setMuted(!muted); if (!muted) audio(); });
  tap(copyEl, function () {
    var st = game.state(), text = sheetFormulas(st.M, st.C, st.linked).join('\t');
    function old() { try { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-999px;top:0;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } catch (e) {} }
    api.lastCopy = text;
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(old); else old(); } catch (e) { old(); }
    copyEl.classList.remove('k1-go'); void copyEl.offsetWidth; copyEl.classList.add('k1-go');
  });

  // the rollers: slide up for more, down for less; a flick runs on and slows down; a tap opens the keypad
  var STEP_PX = 22, mom = null, settleTimer = 0;
  function settleSoon(ms) { clearTimeout(settleTimer); settleTimer = setTimeout(function () { game.settle(); }, ms || 260); }
  function stopRoll() { mom = null; clearTimeout(settleTimer); }
  function nudge(which, steps, fine) {
    var r = which === 'A' ? rA : rB;
    game.roll(which, steps, fine); if (which === 'A' || which === 'B') rollTick(r, steps);
    settleSoon(600);
  }
  function rollStep(dt) {   // the run-on after a flick, eased out
    if (!mom) return;
    mom.acc += mom.rate * dt; mom.rate *= Math.exp(-dt / 420);
    var n = mom.acc < 0 ? Math.ceil(mom.acc) : Math.floor(mom.acc);
    if (n) { mom.acc -= n; game.roll(mom.which, n, mom.fine); rollTick(mom.which === 'A' ? rA : rB, n); }
    if (Math.abs(mom.rate) < 0.0035) { mom = null; settleSoon(200); }
  }
  function rollerEvents(r) {
    var which = r.which, s = null;
    function still() { if (s && which === 'A' && !game.state().linked) { s.fine = true; s.y0 = s.y; s.applied = 0; r.classList.add('k1-fine'); } }   // held still for two seconds: [A] steps by tenths
    r.addEventListener('pointerdown', function (e) {
      e.preventDefault(); audio(); stopRoll();
      var hit = e.target.closest ? e.target.closest('[data-f]') : null, more = e.target.closest ? e.target.closest('.k1-w') : null;
      try { r.setPointerCapture(e.pointerId); } catch (err) {}
      s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, y: e.clientY, t: performance.now(), v: 0, applied: 0, rolling: false, fine: false, timer: setTimeout(still, 2000),
        f: hit ? hit.getAttribute('data-f') : null, more: !!more && which === 'B' };
    });
    r.addEventListener('pointermove', function (e) {
      if (!s || e.pointerId !== s.id) return;
      var now = performance.now(), dt = Math.max(1, now - s.t), vy = (s.y - e.clientY) / dt;
      if (Math.abs(e.clientY - s.y) > 3) { clearTimeout(s.timer); s.timer = setTimeout(still, 2000); }
      s.v = s.v * 0.6 + vy * 0.4; s.y = e.clientY; s.t = now;
      var dy = s.y0 - e.clientY;
      if (!s.rolling && Math.abs(dy) > 8) s.rolling = true;
      if (!s.rolling) return;
      var n = dy < 0 ? Math.ceil(dy / STEP_PX) : Math.floor(dy / STEP_PX), dn = n - s.applied;
      if (dn) { s.applied = n; game.roll(which, dn, s.fine); rollTick(r, dn); }
    });
    function end(e) {
      if (!s || (e && e.pointerId !== s.id)) return;
      clearTimeout(s.timer); r.classList.remove('k1-fine');
      var me = s; s = null;
      if (me.rolling) {
        var idle = performance.now() - me.t;
        if (e && e.type === 'pointerup' && Math.abs(me.v) > 0.35 && idle < 80) mom = { which: which, rate: Math.max(-0.09, Math.min(0.09, me.v / STEP_PX)), acc: 0, fine: me.fine };
        else settleSoon(160);
        return;
      }
      if (!e || e.type !== 'pointerup') return;
      // a tap: on [M] or [C] in the heading, the keypad goes to that number; on the working of a long product, all of it shows
      var bx = r.box.getBoundingClientRect(), st = game.state();
      if (me.f) { game.select(st.sel === me.f ? 'B' : me.f); setPad(true); return; }
      if (me.more && (showFull || r.work.querySelector('.k1-more'))) { showFull = !showFull; render(); layout(); return; }
      // just above or below the box steps by one; on the number, the keypad opens to type it exactly
      if (e.clientY < bx.top - 1 && e.clientY > bx.top - 30 && Math.abs(e.clientX - (bx.left + bx.width / 2)) < bx.width / 2 + 12) { nudge(which, 1); return; }
      if (e.clientY > bx.bottom + 1 && e.clientY < bx.bottom + 30 && Math.abs(e.clientX - (bx.left + bx.width / 2)) < bx.width / 2 + 12) { nudge(which, -1); return; }
      var same = st.sel === which || (st.linked && (st.sel === 'A' || st.sel === 'B'));
      if (padOpen && same && st.buf === null) { setPad(false); return; }
      if (!same || st.buf !== null) game.select(which);
      setPad(true);
    }
    r.addEventListener('pointerup', end); r.addEventListener('pointercancel', end);
    r.addEventListener('wheel', function (e) { e.preventDefault(); nudge(which, e.deltaY < 0 ? 1 : -1); }, { passive: false });
  }
  rollerEvents(rA); rollerEvents(rB);

  // the circle: a tap puts the keypad away; press and hold sets a target there
  var ptr = null;
  function place(e) {
    var b = canvas.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, sc = cv.R / Math.exp(view.lrv);
    var dx = x - cv.w / 2, dy = cv.h / 2 - y, turn = Math.atan2(dy, dx) / (2 * Math.PI);
    return { x: x, y: y, r: Math.hypot(dx, dy) / sc, turn: turn < 0 ? turn + 1 : turn };
  }
  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault(); audio();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    var p = place(e), now = performance.now();
    ptr = { id: e.pointerId, x: p.x, y: p.y, moved: false, held: false, timer: 0 };
    if (p.r <= Math.exp(view.lrv) && p.r >= 1) {
      fx.hold = { x: p.x, y: p.y, t: now };
      var me = ptr; ptr.timer = setTimeout(function () { if (ptr !== me || me.moved) return; me.held = true; fx.hold = null; stopRoll(); game.setTargetAt(p.r, p.turn); }, 550);
    }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!ptr || e.pointerId !== ptr.id || ptr.held || ptr.moved) return;
    var p = place(e);
    if (Math.hypot(p.x - ptr.x, p.y - ptr.y) < 10) return;
    ptr.moved = true; clearTimeout(ptr.timer); fx.hold = null;
  });
  function ptrEnd(e) {
    if (!ptr || (e && e.pointerId !== ptr.id)) return;
    clearTimeout(ptr.timer); fx.hold = null;
    if (e && e.type === 'pointerup' && !ptr.held && !ptr.moved && padOpen) { if (game.state().buf !== null) game.select(game.state().sel); setPad(false); }
    ptr = null;
  }
  canvas.addEventListener('pointerup', ptrEnd); canvas.addEventListener('pointercancel', ptrEnd);
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // ---------------------------------------------------------------- start
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function () { setTimeout(layout, 60); });
  if (window.ResizeObserver) new ResizeObserver(function () { sizeCanvas(); }).observe(stageEl);
  game.restore(query);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); });
  requestAnimationFrame(function (t) { lastT = t; view.lrv = view.target; draw(t); });
})(typeof window === 'object' ? window : globalThis);
