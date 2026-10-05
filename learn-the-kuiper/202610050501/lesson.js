// lesson.js  LEARN THE KUIPER, rung KUIPER: the four formulas, opened up and played with.
//   r     = SQRT( k )
//   theta = 2 x PI x MOD( k x [2654435769] , [4294967296] ) / [4294967296]
//   X     = r x COS( theta )        Y = r x SIN( theta )
// One diagram. Every bracket is an input, and the drawing is an input too. One strip (k -> r, theta -> X, Y) is
// always on screen; tapping a part of it opens that formula large. Every position comes from window.KuiperLaw.place
// (the live preset) or window.KuiperScale.place (any other numbers). The law is never copied here.
// Plain script: works from file://, no network, no build step. Also loads in Node (the MATHS block only), so the
// truth tests run the same functions the drawing uses.
(function (root) {
  'use strict';

  var TWO53 = 9007199254740992, TWO32 = 4294967296, TAU = Math.PI * 2, D2R = Math.PI / 180;
  var hasBig = typeof BigInt === 'function';
  var CAP = 1200;          // most sampled stars drawn at once
  var CH = 24;             // ghost wedges kept behind the selected key
  var MAXS = CAP + CH + 8; // hard size of every star array
  var LIMIT_LINE = 'THAT NUMBER IS TOO LARGE FOR THIS COMPUTER TO SHOW. THE REAL LIMIT HERE IS 9,007,199,254,740,992.';

  function LAW() { return root.KuiperLaw; }
  function SCALE() { return root.KuiperScale; }
  function G32() { return LAW().constants.G32; }

  // =====================================================================================================
  // MATHS (pure; no DOM).  rule = { start, G, W, rad: 'sqrt' | 'lin' | 'cbrt', off: 0 | 0.5 }
  //   EXERCISE: keys from 1, r = SQRT(k).   LIVE: keys from 0, r = SQRT(k + 0.5).   The angle is the same in both.
  // =====================================================================================================
  function newRule() { return { start: 1, G: G32(), W: TWO32, rad: 'sqrt', off: 0, _p: null }; }
  function lawPath(R) { return R.G === G32() && R.W === TWO32 && R.rad === 'sqrt' && R.off === 0.5; }
  function isLive(R) { return lawPath(R) && R.start === 0; }
  function isExercise(R) { return R.G === G32() && R.W === TWO32 && R.rad === 'sqrt' && R.off === 0 && R.start === 1; }
  function power(R) { return R.rad === 'sqrt' ? 0.5 : R.rad === 'lin' ? 1 : 1 / 3; }
  function offset(R) { return R.rad === 'sqrt' ? R.off : 0; }
  function params(R, extra) { return { first: 0, count: TWO53, turnNumber: R.G, wrap: R.W, power: power(R), offset: offset(R) + (extra || 0) }; }
  function prep(R) { if (!R._p) R._p = SCALE().prepare(params(R)); return R._p; }
  // THE placement every star on screen goes through. out = {x, y, r, turns, m}
  function placeOne(R, k, out) {
    var p = lawPath(R) ? LAW().place(k) : SCALE().place(k, prep(R));
    out.x = p.x; out.y = p.y; out.r = p.r; out.turns = p.turns; out.m = p.m;
    return out;
  }
  function fill(R, keys, n, X, Y) { // n is capped by the arrays
    var t = { x: 0, y: 0, r: 0, turns: 0, m: 0 }, i, lim = Math.min(n, keys.length, X.length, Y.length), rmax = 0;
    for (i = 0; i < lim; i++) { placeOne(R, keys[i], t); X[i] = t.x; Y[i] = t.y; if (t.r > rmax) rmax = t.r; }
    return rmax;
  }
  // the distance for a number between two keys (the square-root piece lets a decimal be typed)
  function radiusAt(R, x) {
    var f = Math.floor(x), fr = x - f;
    if (fr === 0 && lawPath(R)) return LAW().place(f).r;
    return SCALE().place(f, fr === 0 ? prep(R) : SCALE().prepare(params(R, fr))).r;
  }
  // the number under the root for a distance (any point has one; only whole numbers from start are keys)
  function squareFor(R, r) { var v = SCALE().keyAtRadius(r, prep(R)); return v === v ? v + offset(R) : 0; }
  // the smallest key whose remainder is m (or the nearest remainder below m that any key can reach)
  function solveKey(R, m) {
    if (!hasBig) return null;
    var W = BigInt(R.W), G = BigInt(R.G) % W, a = G, b = W, x0 = BigInt(1), x1 = BigInt(0), q, t, i;
    if (G === BigInt(0)) return 0;
    for (i = 0; i < 400 && b !== BigInt(0); i++) { q = a / b; t = a - q * b; a = b; b = t; t = x0 - q * x1; x0 = x1; x1 = t; }
    var g = a, Wg = W / g, mm = BigInt(Math.floor(m)) % W; if (mm < BigInt(0)) mm += W; mm = mm - (mm % g);
    var inv = ((x0 % Wg) + Wg) % Wg;
    return Number(((mm / g) * inv) % Wg);
  }
  // the turn one key makes, in degrees (for drawing the wedge; never used to compute a position)
  function turnDeg(R) { return 360 * (R.G % R.W) / R.W; }

  function commas(s) { // s = string of digits, optional leading '-'
    var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var out = '', n = s.length, i;
    for (i = 0; i < n; i++) { out += s.charAt(i); var left = n - 1 - i; if (left > 0 && left % 3 === 0) out += ','; }
    return (neg ? '−' : '') + out;
  }
  function fmtBig(b) { return commas(b.toString()); }
  function fmtScaled(b, d) { // b: non-negative BigInt holding value x 10^d
    var s = b.toString(); if (d === 0) return commas(s);
    while (s.length <= d) s = '0' + s;
    return commas(s.slice(0, s.length - d)) + '.' + s.slice(s.length - d);
  }
  function fmtNum(v, d) { // a float, cut (not rounded) to d decimals, with commas
    if (!isFinite(v)) return String(v);
    var p = Math.pow(10, d), c = Math.floor(Math.abs(v) * p + 1e-7) / p, s = c.toFixed(d), dot = s.indexOf('.');
    return (v < 0 && c > 0 ? '−' : '') + (dot < 0 ? commas(s) : commas(s.slice(0, dot)) + s.slice(dot));
  }
  function fmtDist(v) { // rounded to 2 decimals, with commas
    if (!isFinite(v)) return String(v);
    var s = Math.abs(v).toFixed(2), dot = s.indexOf('.'), neg = v < 0 && Number(s) > 0;
    return (neg ? '−' : '') + commas(s.slice(0, dot)) + s.slice(dot);
  }
  function fmtShort(v) { // as few decimals as it needs (up to 4)
    if (!isFinite(v)) return String(v);
    if (Math.abs(v) >= 1e15) return commas(hasBig ? BigInt(Math.round(v)).toString() : String(Math.round(v)));
    var s = (Math.round(v * 10000) / 10000).toString(), dot = s.indexOf('.');
    return dot < 0 ? commas(s) : commas(s.slice(0, dot)) + s.slice(dot);
  }

  // MOD, exact for every key up to 2^53:  k x G = product;  product = n whole circles of W + remainder m.
  function angleForm(R, k) {
    var o = { G: R.G, W: R.W };
    if (!hasBig) { // approximate fallback for a runtime without BigInt
      var t = { x: 0, y: 0, r: 0, turns: 0, m: 0 }; placeOne(R, k, t);
      o.m = t.m; o.turns = t.turns; o.nNum = Math.floor(k * R.G / R.W); o.nStr = fmtNum(o.nNum, 0); o.prodStr = fmtNum(k * R.G, 0); o.mStr = fmtNum(t.m, 0);
      o.degStr = fmtNum(t.turns * 360, 2);
    } else {
      var Gb = BigInt(R.G), Wb = BigInt(R.W), prod = BigInt(k) * Gb, n = prod / Wb, m = prod - n * Wb;
      o.m = Number(m); o.turns = o.m / R.W; o.n = n; o.prod = prod;
      o.nNum = Number(n); o.nStr = fmtBig(n); o.prodStr = fmtBig(prod); o.mStr = fmtBig(m);
      o.degStr = fmtScaled((m * BigInt(36000) + Wb / BigInt(2)) / Wb, 2);
    }
    o.remDeg = o.turns * 360; o.theta = 2 * Math.PI * o.m / R.W;
    o.GStr = commas(String(R.G)); o.WStr = commas(String(R.W));
    o.fracStr = fmtNum(o.turns, 5); o.thetaStr = fmtNum(o.theta, 4);
    return o;
  }
  function decimalPair(v) {
    var a=String(v).replace(/,/g,'').split(/[eE]/), p=a[0].split('.'), d=(p[1]||'').length-(+(a[1]||0));
    var n=BigInt(p.join('')); return d<0 ? [n*BigInt(10)**BigInt(-d),BigInt(1)] : [n,BigInt(10)**BigInt(d)];
  }
  function rootSign(shown, value, off) {
    if (!hasBig) return '≈';
    var r=decimalPair(shown), a=decimalPair(value), b=decimalPair(off||0);
    return r[0]*r[0]*a[1]*b[1] === (a[0]*b[1]+b[0]*a[1])*r[1]*r[1] ? '=' : '≈';
  }
  function wrapDeg(v) { var w = v % 360; if (w < 0) w += 360; return w === 360 ? 0 : w; } // MOD( v , 360 ): never negative
  function circDiff(a, b) { var d = Math.abs(a - b); return d > 0.5 ? 1 - d : d; }
  // the band a key owns: between the distances of key - 1/2 and key + 1/2 (overlay geometry, not a star position)
  function bandEdge(R, kReal) { var v = Math.max(0, kReal + offset(R)); return R.rad === 'sqrt' ? Math.sqrt(v) : R.rad === 'lin' ? v : Math.pow(v, 1 / 3); }
  // rings of whole-number distance under a square-root rule: ring n begins at key n x n and holds 2n + 1 keys.
  // True for SQRT(k) and for SQRT(k + 0.5) alike: no whole number plus a half is a square.
  function ringOf(k) { var n = Math.floor(Math.sqrt(k)); while (n * n > k) n--; while ((n + 1) * (n + 1) <= k) n++; return n; }
  function isSquare(k) { var n = ringOf(k); return n * n === k; }

  // the four formulas as the document writes them, with these numbers, ready for a spreadsheet (row 2, key in A2).
  // When a product would pass 2^53 the angle uses the split form, so the spreadsheet stays exact.
  function sheet(R, lastKey) {
    var G = R.G, W = R.W, rad = R.rad === 'sqrt' ? (R.off ? '=SQRT(A2+' + R.off + ')' : '=SQRT(A2)') : R.rad === 'lin' ? '=A2' : '=A2^(1/3)';
    // a spreadsheet holds a product exactly up to 2^53, and one key further when that product is even
    var fits = lastKey * G < TWO53, ang;
    if (hasBig) { var lim = G > 0 ? BigInt(TWO53) / BigInt(G) : BigInt(TWO53); if (((lim + BigInt(1)) * BigInt(G)) % BigInt(2) === BigInt(0)) lim += BigInt(1); fits = BigInt(Math.max(1, lastKey)) <= lim; }
    if (fits) ang = '=2*PI()*MOD(A2*' + G + ',' + W + ')/' + W;
    else if (W === TWO32 && G < TWO32) ang = '=2*PI()*MOD(MOD(MOD(A2,4294967296)*' + Math.floor(G / 65536) + ',65536)*65536+MOD(A2,4294967296)*' + (G % 65536) + ',4294967296)/4294967296';
    else if (hasBig && BigInt(Math.min(lastKey, W - 1)) * BigInt(G % W) <= BigInt(Number.MAX_SAFE_INTEGER)) ang = '=2*PI()*MOD(MOD(A2,' + W + ')*' + (G % W) + ',' + W + ')/' + W;
    else return null; // No proven exact spreadsheet product for this custom domain.
    return [rad, ang, '=B2*COS(C2)', '=B2*SIN(C2)'];
  }

  function parseTyped(str, intOnly) {
    var s = String(str == null ? '' : str).trim().replace(/\s+/g, '').replace(/°/g, '').replace(/−/g, '-');
    if (!s) return { ok: false };
    if (intOnly) s = s.replace(/,/g, '');
    else if (s.indexOf('.') < 0 && /^[^,]*,\d{1,2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
    var v, fr = s.split('/');
    if (fr.length === 2 && fr[0] !== '' && fr[1] !== '') v = Number(fr[0]) / Number(fr[1]); else v = Number(s);
    if (/^[+-]?\d+$/.test(s) && hasBig) { var b = BigInt(s); return { ok: true, v: v, big: b > BigInt(TWO53) || b < -BigInt(TWO53) }; }
    if (v !== v) return { ok: false };
    if (hasBig && isFinite(v) && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s) && Math.abs(v)<=TWO53) {
      var typed=decimalPair(s), represented=decimalPair(v);
      if (typed[0]*represented[1]!==represented[0]*typed[1]) return {ok:true,v:v,big:true};
    }
    return { ok: true, v: v, big: !(Math.abs(v) <= TWO53) };
  }
  // things to find in the square-root piece: a distance, and how close counts. Whole rings first, then one more digit.
  var FINDS = [[3, 0.1], [5, 0.1], [2.5, 0.05], [7.5, 0.01], [1.5, 0.002], [9.9, 0.0005]];
  function findTarget(i) {
    if (i < FINDS.length) return { r: FINDS[i][0], w: FINDS[i][1] };
    var h = Math.imul(i + 11, 2654435761) >>> 0; return { r: 2 + (h % 1100) / 100, w: 0.0005 };
  }

  var M = {
    newRule: newRule, squareFor: squareFor, solveKey: solveKey, lawPath: lawPath, isLive: isLive, isExercise: isExercise, placeOne: placeOne, fill: fill, radiusAt: radiusAt,
    turnDeg: turnDeg, wrapDeg: wrapDeg, angleForm: angleForm, circDiff: circDiff, bandEdge: bandEdge, ringOf: ringOf, isSquare: isSquare, sheet: sheet,
    rootSign: rootSign, parseTyped: parseTyped, findTarget: findTarget, fmtNum: fmtNum, fmtScaled: fmtScaled, fmtDist: fmtDist, commas: commas, LIMIT_LINE: LIMIT_LINE, CAP: CAP
  };

  // =====================================================================================================
  // THE SCREEN
  // =====================================================================================================
  var S = null;
  var PIPS = ['1 DOT', '2 DOTS', 'RING', 'TIME', 'KUIPER'];
  var LABELS = []; (function () { for (var i = 0; i < 100; i++) LABELS.push(String(i)); })();
  var FONT = '"Segoe UI", Arial, sans-serif';
  var CSS = '.kgl-root{position:absolute;left:0;top:0;right:0;bottom:0;background:#000;overflow:hidden;font-family:' + FONT + ';font-weight:400;color:#fff;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent}' +
    '.kgl-root canvas{position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;display:block}' +
    '.kgl-panel{position:absolute;left:0;right:0;bottom:0;padding:4px 10px calc(8px + env(safe-area-inset-bottom,0px));box-sizing:border-box;font-variant-numeric:tabular-nums;pointer-events:none;display:flex;flex-direction:column;justify-content:center}' +
    '.kgl-strip{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;justify-content:flex-start;align-items:flex-end;column-gap:2px;font-size:24px;line-height:1.12;padding-bottom:5px;pointer-events:auto;touch-action:pan-x}.kgl-strip::-webkit-scrollbar{display:none}.kgl-strip>:first-child{margin-left:auto}.kgl-strip>:last-child{margin-right:auto}' +
    '.kgl-cell{display:inline-flex;flex-direction:column;align-items:center;padding:1px 2px 2px;border-bottom:3px solid rgba(255,255,255,.14);cursor:pointer;pointer-events:auto;touch-action:manipulation;min-width:1.3em;flex:none;white-space:nowrap}' +
    '.kgl-cell.big{font-size:28px}.kgl-cell.on{border-bottom-color:#ffb000}.kgl-cell i{font-style:normal;color:rgba(255,255,255,.55)}.kgl-arrow{color:rgba(255,255,255,.4);align-self:center;flex:none;font-size:24px;margin:0 -3px}' +
    '.kgl-line{display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;column-gap:.26em;line-height:1.24}' +
    '.kgl-g{display:inline-flex;align-items:baseline;white-space:nowrap;gap:.2em;flex:none;pointer-events:auto}' +
    '.kgl-scroll{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;pointer-events:auto;touch-action:pan-x;scrollbar-width:none;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent)}.kgl-scroll::-webkit-scrollbar{display:none}.kgl-scroll>:first-child{margin-left:auto}.kgl-scroll>:last-child{margin-right:auto}.kgl-scroll .kgl-f{touch-action:pan-x}' +
    '.kgl-tagset{display:inline-flex;gap:6px 8px;flex-wrap:wrap;justify-content:center}' +
    '.kgl-wrap .kgl-g{white-space:normal;flex-wrap:wrap;overflow-wrap:anywhere;word-break:break-all;max-width:100%;flex:0 1 auto}.kgl-wrap .kgl-f{white-space:normal}' +
    '.kgl-lab,.kgl-op{color:rgba(255,255,255,.6)}' +
    '.kgl-f{cursor:ns-resize;touch-action:none;white-space:nowrap;padding:2px 0}' +
    '.kgl-b{color:rgba(255,255,255,.45)}' +
    '.kgl-f.kgl-ed{background:rgba(255,255,255,.12);border-radius:6px}.kgl-f.kgl-ed .kgl-v::after{content:"";display:inline-block;width:2px;height:.9em;background:currentColor;margin-left:2px;vertical-align:-0.08em;animation:kglc 1s steps(1) infinite}' +
    '@keyframes kglc{50%{opacity:0}}' +
    '.kgl-pill{display:inline-flex;align-items:center;justify-content:center;min-width:1.4em;height:1.16em;border:2px solid rgba(0,255,255,.55);border-radius:.4em;color:#00ffff;cursor:pointer;box-sizing:border-box;align-self:center;line-height:1;padding:0 .2em;touch-action:manipulation}' +
    '.kgl-tag{font-size:24px;line-height:1.2;border:2px solid rgba(255,255,255,.3);color:rgba(255,255,255,.5);border-radius:8px;padding:0 7px;cursor:pointer;align-self:center;touch-action:manipulation;pointer-events:auto;white-space:nowrap}' +
    '.kgl-tag.on{border-color:#00ffff;color:#00ffff;box-shadow:0 0 12px rgba(0,255,255,.55)}' +
    '.kgl-tags{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 8px;padding-top:5px}' +
    '.kgl-meter{display:inline-flex;gap:4px;align-items:center}.kgl-meter i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.2)}.kgl-meter i.on{background:#00ffff}' +
    '.kgl-ring{display:inline-block;width:.72em;height:.72em;border:3px solid #00ffff;border-radius:50%;box-sizing:border-box;align-self:center;flex:none}' +
    '.kgl-tap{cursor:pointer}' +
    '.kgl-msg{font-size:24px;color:#ffb000;text-align:center;line-height:1.2;display:none;padding-top:4px;pointer-events:none}' +
    '.kgl-bad{color:#ff5050}' +
    '@keyframes kglp{0%,100%{text-shadow:none}50%{text-shadow:0 0 16px currentColor,0 0 5px currentColor}}' +
    '.kgl-pulse{animation:kglp 1.3s ease-in-out 2}' +
    '.kgl-pad{position:absolute;left:0;right:0;bottom:0;display:none;grid-template-columns:repeat(5,1fr);gap:4px;padding:4px 6px calc(6px + env(safe-area-inset-bottom,0px));box-sizing:border-box;max-width:520px;margin:0 auto;background:#000}' +
    '.kgl-pad button{height:46px;font:400 26px ' + FONT + ';color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:0;margin:0;cursor:pointer;touch-action:manipulation}' +
    '.kgl-pad button.fn{color:#00ffff}' +
    '.kgl-side.kgl-editing .kgl-strip,.kgl-side.kgl-editing .kgl-tags,.kgl-side.kgl-editing .kgl-live{display:none}' +
    '.kgl-pips{position:absolute;left:6px;top:calc(4px + env(safe-area-inset-top,0px));display:flex;align-items:center;height:44px}' +
    '.kgl-pip{height:44px;min-width:26px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;color:rgba(0,255,255,.8);touch-action:manipulation}' +
    '.kgl-pip i{width:12px;height:12px;border-radius:50%;border:2px solid rgba(0,255,255,.85);box-sizing:border-box;flex:none}' +
    '.kgl-pip b{margin:0 10px 0 6px;font-weight:400}' +
    '.kgl-pip.on{color:#ffb000;cursor:default}.kgl-pip.on i{background:#ffb000;border-color:#ffb000}' +
    '.kgl-pip.dim{opacity:.3;cursor:default}' +
    '.kgl-icons{position:absolute;right:4px;top:calc(4px + env(safe-area-inset-top,0px));display:flex}' +
    '.kgl-ic{width:44px;height:44px;background:none;border:0;padding:0;margin:0;cursor:pointer;color:rgba(255,255,255,.72);display:inline-flex;align-items:center;justify-content:center;touch-action:manipulation}' +
    '.kgl-ic svg{width:28px;height:28px;display:block}.kgl-ic.off{color:rgba(255,255,255,.3)}.kgl-ic.lit{color:#ffb000}';
  CSS += '.kgl-root *{font-weight:400;text-shadow:none!important}.kgl-panel{max-height:46%;overflow-y:auto;overflow-x:hidden;justify-content:flex-start;pointer-events:auto;touch-action:pan-y}.kgl-panel,.kgl-panel *{color:#fff!important}.kgl-g{min-width:0;max-width:100%;flex-wrap:wrap;white-space:normal;overflow-wrap:anywhere;flex:0 1 auto}.kgl-working{font-size:24px!important;line-height:1.5;margin-top:12px}.kgl-f{border:1px solid #fff;border-radius:0;padding:2px 4px;max-width:100%;box-sizing:border-box;white-space:normal;overflow-wrap:anywhere}.kgl-f.kgl-ed{border-radius:0;background:#000;border-bottom:3px solid white}.kgl-b{display:none}.kgl-tag,.kgl-tag.on,.kgl-pill{border:1px solid white;border-radius:0;box-shadow:none;background:#000}.kgl-tag.on{border-bottom:3px solid white}.kgl-cell.on{border-bottom-color:white}.kgl-pip,.kgl-pip.on,.kgl-ic.lit{color:white}.kgl-pip i{border-color:white}.kgl-pip.on i,.kgl-meter i.on{background:white;border-color:white}.kgl-pad button,.kgl-pad button.fn{color:white;background:black;border:1px solid white;border-radius:0}.kgl-editing .kgl-strip,.kgl-editing .kgl-tags{display:none}.kgl-side .kgl-panel{max-height:none}.kgl-pulse{animation:none;outline:2px solid white}.kgl-root .kgl-mod{font-size:28px;gap:8px}.kgl-strip{flex-wrap:wrap;overflow:visible;gap:8px}.kgl-cell{max-width:100%;overflow-wrap:anywhere;white-space:normal}.kgl-cell.big{font-size:24px}';
  CSS += '.kgl-invalid .kgl-strip,.kgl-invalid .kgl-live,.kgl-invalid-root .kgl-root-result{visibility:hidden}';
  var SVG_NOTE = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M11 21V6l11-2v14"/><ellipse cx="8" cy="21" rx="3.4" ry="2.6" fill="currentColor"/><ellipse cx="19" cy="18" rx="3.4" ry="2.6" fill="currentColor"/><path class="s" d="M4 4l20 20" stroke-width="3" style="display:none"/></svg>';
  var SVG_PLAY = '<svg viewBox="0 0 28 28" fill="currentColor"><path class="p" d="M8 5l15 9-15 9z"/><path class="q" d="M7 5h5v18H7zM16 5h5v18h-5z" style="display:none"/></svg>';
  var SVG_STAR = '<svg viewBox="0 0 28 28" fill="currentColor"><path d="M14 2l3.2 8.2 8.8.6-6.8 5.6 2.2 8.6L14 20.2 6.6 25l2.2-8.6L2 10.8l8.8-.6z"/></svg>';
  var SVG_X = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l16 16M22 6L6 22"/></svg>';

  function E(tag, cls, text, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeIO(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function easeO(u) { return 1 - (1 - u) * (1 - u); }
  function seen(name) { try { return root.localStorage.getItem('kgl-' + name) === '1'; } catch (e) { return false; } }
  function markSeen(name) { try { root.localStorage.setItem('kgl-' + name, '1'); } catch (e) { } }
  function show(el, v) { var d = v ? '' : 'none'; if (el.style.display !== d) el.style.display = d; }
  function setT(el, t) { if (el.textContent !== t) el.textContent = t; }

  function sprite(r, g, b) { // a star: soft halo, solid disc, white core. Drawn once; stars are blitted from it.
    var c = document.createElement('canvas'); c.width = c.height = 96; var x = c.getContext('2d'), m = 48, rd = m / 2.6;
    var gr = x.createRadialGradient(m, m, rd * 0.5, m, m, m);
    gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.42)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    x.fillStyle = gr; x.beginPath(); x.arc(m, m, m, 0, TAU); x.fill();
    x.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; x.beginPath(); x.arc(m, m, rd, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.92)'; x.beginPath(); x.arc(m, m, rd * 0.5, 0, TAU); x.fill();
    return c;
  }

  // ------------------------------------------------------------------ open, close
  function open(host, opts) {
    if (S) close(true);
    opts = opts || {};
    host = host || document.body;
    var s = S = {
      host: host, opts: opts, on: [], raf: 0, timers: [],
      rule: newRule(), K: 1, kx: 1, N: 1, dragRule: false, chTop: 0, chN: 0, piece: 't',
      KS: new Float64Array(MAXS), SX: new Float64Array(MAXS), SY: new Float64Array(MAXS), PX: new Float64Array(MAXS), PY: new Float64Array(MAXS),
      CT: new Float64Array(CH + 2), CR: new Float64Array(CH + 2), cnt: 0, selIdx: -1, rFit: 1, rLast: 0, nextX: 0, nextY: 0, selTh: 0, selR: 0, sig: '', prevSig: '',
      T: { x: 0, y: 0, r: 0, turns: 0, m: 0 }, Tdeg: 0,
      W: 0, H: 0, dpr: 1, cx: 0, cy: 0, Rp: 100, cxT: 0, cyT: 0, RpT: 100, vs: 1, vsT: 1, zoomK: 1, stackX: 20, stackY: 20, first: true, holdUntil: 0, padH: 0,
      A: { on: false, type: '', dir: 1, t0: 0, dur: 0, newStar: false, FL: null, FH: null, lastText: 0, ec: Infinity, rLo: 0, rHi: 0, auto: false },
      D: { has: false, e: 1, cross: false }, J: 1, wedgeA: 1, wedgeT0: 0,
      queue: 0, playing: false, band: false, edit: null, userN: 0, liveUser: null, probe: { on: false, dirty: false, x: 0, y: 0, idx: -1, gap: '', keyStr: '', ring: -1 },
      morph: 1, morphT0: 0, pourOn: false, pourFrom: 0, pourT0: 0, t0: 0, fade: 0, landT0: -1e9,
      fly: [], userLands: 0, gest: false, ac: null, lastNote: 0, mutedLocal: false,
      find: true, findIdx: 0, tgt: findTarget(0), tries: new Float64Array(16), nTries: 0, marks: 0, score: 0, scoreStr: '', burstT0: -1e9, burstX: 0, burstY: 0, glowT0: -1e9, ringEvT0: -1e9, ringEvN: 0,
      F: null, form: null, lblRem: '', lblDist: '', lblArea: '', lblX: '', lblY: '', stackStr: '', stackNum: 0, msgTimer: 0, hashTimer: 0,
      ptr: {}, nptr: 0, drag: null, pinch: null
    };
    var i; for (i = 0; i < 6; i++) s.fly.push({ on: false, t0: 0 });

    var fr = opts.from || null;
    var fromHash = !fr && opts.hash !== false && readHash();
    if (fr) { // carried over from the earlier rungs: their TURN becomes the multiplier of a 360 circle, HOW MANY the count
      var ft = fr.turn != null ? fr.turn : fr.TURN, fn = fr.howMany != null ? fr.howMany : (fr.HOW_MANY != null ? fr.HOW_MANY : (fr['HOW MANY'] != null ? fr['HOW MANY'] : fr.count));
      if (opts.carryRule === true && typeof ft === 'number' && isFinite(ft)) { var w = ((ft % 360) + 360) % 360, sc = 1; while (sc < 10000 && Math.abs(w * sc - Math.round(w * sc)) > 1e-9) sc *= 10; s.rule.W = 360 * sc; s.rule.G = Math.round(w * sc); }
      if (typeof fn === 'number' && isFinite(fn) && fn >= 1) { s.N = Math.min(TWO53 - 1, Math.floor(fn)); s.K = s.rule.start + s.N - 1; }
    }
    if (fr && opts.carryRule === true && Number.isSafeInteger(fr.multiplier) && fr.multiplier >= 0 && Number.isSafeInteger(fr.circle) && fr.circle >= 1) { s.rule.G=fr.multiplier; s.rule.W=fr.circle; }
    if (fr && Number.isSafeInteger(fr.key) && fr.key >= s.rule.start) { s.K=fr.key; s.N=Math.max(s.N,s.K-s.rule.start+1); }
    var cinematic = false;
    if (cinematic && s.rule.start === 0) s.N = 1;
    s.kx = s.K; s.userN = s.N;

    var rootEl = s.root = E('div', 'kgl-root', null, host);
    E('style', null, CSS, rootEl);
    s.canvas = E('canvas', null, null, rootEl); s.ctx = s.canvas.getContext('2d');
    s.sprC = sprite(0, 255, 255); s.sprA = sprite(255, 176, 0);
    buildTop(); buildPanel(); buildPad();
    bind();
    setPiece(s.piece, true);
    layout(); s.cx = s.cxT; s.cy = s.cyT; s.Rp = s.RpT;
    recompute(); restD(); if (cinematic) s.rFit = 2; s.vsT = s.vs = fitScale(); updateFormula();
    s.t0 = performance.now(); s.last = s.t0;
    if (cinematic) s.timers.push(setTimeout(function () { if (S === s && !s.A.on && s.K === 0) startStep(1, 1700, true); }, 380));
    else { s.A.on = true; s.A.type = 'jump'; s.A.t0 = s.t0 + 300; s.A.dur = 700; s.J = 0; s.wedgeA = 0; }
    need();
    return api;
  }
  function close(silent) {
    if (!S) return;
    var s = S; S = null;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.timers.forEach(function (t) { clearTimeout(t); }); clearTimeout(s.msgTimer); clearTimeout(s.hashTimer);
    s.on.forEach(function (o) { o[0].removeEventListener(o[1], o[2], o[3]); });
    if (s.ro) { try { s.ro.disconnect(); } catch (e) { } }
    try { if (s.ac) s.ac.close(); } catch (e) { }
    if (s.root && s.root.parentNode) s.root.parentNode.removeChild(s.root);
    if (silent !== true) { try { s.host.dispatchEvent(new CustomEvent('kgclose', { bubbles: true, detail: { id: 'lesson' } })); } catch (e) { } }
  }
  function on(el, type, fn, opt) { el.addEventListener(type, fn, opt || false); S.on.push([el, type, fn, opt || false]); }
  function need() { if (S && !S.raf) S.raf = requestAnimationFrame(tick); }
  function lastKey() { return S.rule.start + S.N - 1; }

  // one link carries an experiment: the numbers live in the page address
  function readHash() {
    var s = S, h = ''; try { h = String(root.location.hash || '').replace(/^#/, ''); } catch (e) { }
    if (!h || h.indexOf('=') < 0) return false;
    var o = {}, parts = h.split('&'), i; for (i = 0; i < parts.length && i < 16; i++) { var kv = parts[i].split('='); o[kv[0]] = kv[1]; }
    function int(v, lo, hi, d) { var p = parseTyped(v, true); if (!p.ok || p.big) return d; var n = Math.floor(p.v); return n >= lo && n <= hi ? n : d; }
    var R = s.rule;
    R.start = int(o.s, 0, TWO53 - 1, R.start); R.G = int(o.g, 0, TWO53, R.G); R.W = int(o.w, 1, TWO53, R.W);
    if (o.r === 'sqrt' || o.r === 'lin' || o.r === 'cbrt') R.rad = o.r;
    R.off = o.o === '0.5' ? 0.5 : (o.o === '0' ? 0 : R.off);
    s.N = int(o.n, 0, TWO53 - R.start, 1); s.K = int(o.k, 0, TWO53, R.start + Math.max(0, s.N - 1));
    if (s.K >= R.start && s.K - R.start + 1 > s.N) s.N = s.K - R.start + 1;
    if (o.p === 'k' || o.p === 'r' || o.p === 't' || o.p === 'x') s.piece = o.p;
    return true;
  }
  function hashText() { var s = S, R = s.rule; return 'k=' + s.K + '&n=' + s.N + '&s=' + R.start + '&g=' + R.G + '&w=' + R.W + '&r=' + R.rad + '&o=' + R.off + '&p=' + s.piece; }
  function writeHash() {
    var s = S; if (s.opts.hash === false) return; clearTimeout(s.hashTimer);
    s.hashTimer = setTimeout(function () { if (S !== s) return; try { root.history.replaceState(null, '', '#' + hashText()); } catch (e) { try { root.location.hash = hashText(); } catch (e2) { } } }, 400);
  }

  // ------------------------------------------------------------------ the top edge: pips, play, find, sound, close
  function buildTop() {
    var s = S, pips = s.pipsEl = E('div', 'kgl-pips', null, s.root), i;
    for (i = 0; i < 5; i++) (function (i) {
      var p = E('span', 'kgl-pip' + (i === 4 ? ' on' : ''), null, pips); E('i', null, null, p);
      p._name = E('b', null, PIPS[i], p);
      if (i < 4) p.addEventListener('click', function () {
        var KP = root.KGPlay; if (!KP || typeof KP.open !== 'function') return;
        var h = s.host, st = exportState(); close(true); KP.open(h, { rung: i + 1, from: st });
      });
    })(i);
    var ic = s.iconsEl = E('div', 'kgl-icons', null, s.root);
    s.playBtn = E('button', 'kgl-ic', null, ic); s.playBtn.innerHTML = SVG_PLAY; s.playBtn.setAttribute('aria-label', 'play');
    s.playBtn.addEventListener('click', function () { gesture(); endEdit(true); setPlaying(!s.playing); });
    s.findBtn = E('button', 'kgl-ic lit', null, ic); s.findBtn.innerHTML = SVG_STAR; s.findBtn.setAttribute('aria-label', 'find');
    s.findBtn.addEventListener('click', function () { gesture(); s.find = !s.find; s.findBtn.className = 'kgl-ic' + (s.find ? ' lit' : ' off'); if (s.find && s.piece !== 'r') setPiece('r'); refit(); need(); });
    s.muteBtn = E('button', 'kgl-ic', null, ic); s.muteBtn.innerHTML = SVG_NOTE; s.muteBtn.setAttribute('aria-label', 'sound');
    s.muteBtn.addEventListener('click', function () {
      var m = !muted(); if (root.KGAudio && typeof root.KGAudio.setMuted === 'function') root.KGAudio.setMuted(m); else s.mutedLocal = m;
      showMute(); if (!m) { gesture(); note(220 * Math.pow(2, s.selTh / 180)); }
    });
    if (s.opts.standalone !== true && s.opts.close !== false) {
      s.closeBtn = E('button', 'kgl-ic', null, ic); s.closeBtn.innerHTML = SVG_X; s.closeBtn.setAttribute('aria-label', 'close');
      s.closeBtn.addEventListener('click', function () { close(); });
    }
    showMute();
  }
  function muted() { return root.KGAudio ? !!root.KGAudio.muted : S.mutedLocal; }
  function showMute() { var m = muted(); S.muteBtn.className = 'kgl-ic' + (m ? ' off' : ''); S.muteBtn.querySelector('.s').style.display = m ? '' : 'none'; }
  function setPlaying(v) {
    var s = S; v = !!v; if (s.playing === v) return; s.playing = v;
    s.playBtn.querySelector('.p').style.display = v ? 'none' : ''; s.playBtn.querySelector('.q').style.display = v ? '' : 'none';
    if (v && !s.A.on) stepKey(1);
  }
  function exportState() { var R = S.rule; return { turn: turnDeg(R), howMany: S.N, key: S.K, start: R.start, multiplier: R.G, circle: R.W, live: isLive(R) }; }

  // ------------------------------------------------------------------ numbers that are controls
  // tap: the keypad opens and the dots move with every digit. drag up or down, or wheel: step it (exploring).
  function field(parent, o) {
    var s = S, el = E('span', 'kgl-f', null, parent); el.style.color = '#fff';
    E('span', 'kgl-b', '[', el); var tx = E('span', 'kgl-v', '', el); E('span', 'kgl-b', ']', el);
    var st = { down: false, id: -1, y0: 0, moved: false };
    var F = { el: el, tx: tx, o: o, buf: '', start: '', fresh: true, set: function (t) { if (s.edit !== F) setT(tx, t); } };
    el.addEventListener('pointerdown', function (e) {
      gesture(); st.down = true; st.id = e.pointerId; st.y0 = e.clientY; st.moved = false; if (o.begin) o.begin();
      try { el.setPointerCapture(e.pointerId); } catch (x) { }
    });
    el.addEventListener('pointermove', function (e) {
      if (!st.down || e.pointerId !== st.id || !o.drag) return; var dy = st.y0 - e.clientY;
      if (!st.moved && Math.abs(dy) < 7) return; if (!st.moved && s.edit) endEdit(true);
      st.moved = true; setPlaying(false); o.drag(dy > 0 ? dy - 7 : dy + 7);
    });
    el.addEventListener('pointerup', function () { if (!st.down) return; st.down = false; if (st.moved) releaseHold(); });
    el.addEventListener('pointercancel', function () { st.down = false; });
    el.addEventListener('click', function () { if (st.moved) { st.moved = false; return; } startEdit(F); });
    el.addEventListener('wheel', function (e) { e.preventDefault(); e.stopPropagation(); if (!o.wheel) return; endEdit(true); setPlaying(false); o.wheel(e.deltaY < 0 ? 1 : -1); releaseHold(); }, { passive: false });
    return F;
  }
  function startEdit(F) {
    var s = S; if (s.edit === F) return; if (s.edit) endEdit(true);
    setPlaying(false); snapRest();
    s.edit = F; F.start = F.o.raw(); F.buf = F.start; F.fresh = true; F.accepted = false; F.trusted = false; F.el.classList.add('kgl-ed'); F.tx.textContent = F.buf;
    showPad(true);
    var sc = F.el.parentNode; while (sc && sc !== s.panel && !(sc.classList && (sc.classList.contains('kgl-scroll') || sc.classList.contains('kgl-strip')))) sc = sc.parentNode;
    if (sc && sc !== s.panel) { var er = F.el.getBoundingClientRect(), sr2 = sc.getBoundingClientRect(); sc.scrollLeft += (er.left + er.width / 2) - (sr2.left + sr2.width / 2); }
  }
  function typeCh(ch, trusted) { // one key of the keypad or the keyboard
    var s = S, F = s.edit; if (!F) return;
    var b = F.fresh ? '' : F.buf;
    if (ch === 'back') b = F.fresh ? F.start.slice(0, -1) : b.slice(0, -1);
    else if (ch === 'clear') b = '';
    else if (ch === '-') b = b.charAt(0) === '-' ? b.slice(1) : '-' + b;
    else if (ch === '.') { if (b.indexOf('.') < 0) b += (b === '' || b === '-') ? '0.' : '.'; }
    else if (b.length < 40) b += ch;
    F.fresh = false; F.buf = b; F.accepted = false; F.trusted = trusted === true; F.tx.textContent = b === '' ? ' ' : b;
    if (b !== '' && b !== '-') F.accepted = F.o.apply(b) === true; // C empties the number; the dot waits where it was
    s.root.classList.toggle('kgl-invalid', !F.accepted); s.root.classList.toggle('kgl-invalid-root', !F.accepted && F === s.F.keyR);
    fitLines(); need();
  }
  function endEdit(commit, trusted) {
    var s = S, F = s && s.edit; if (!F) return; s.edit = null; F.el.classList.remove('kgl-ed');
    if (!commit && !F.fresh) F.o.apply(F.start);
    s.root.classList.remove('kgl-invalid','kgl-invalid-root'); showPad(false); updateFormula();
    if (commit && trusted !== false && F.accepted && F.trusted && !F.fresh && F.o.commit) F.o.commit(); // only a typed, committed number is answered
    need();
  }
  function buildPad() {
    var s = S, pad = s.pad = E('div', 'kgl-pad', null, s.root), keys = ['7', '8', '9', 'back', 'clear', '4', '5', '6', '-', 'ok', '1', '2', '3', '0', '.'];
    var face = { back: '⌫', clear: 'C', '-': '−', ok: 'OK' };
    keys.forEach(function (k) {
      var b = E('button', face[k] && k !== '-' ? 'fn' : null, face[k] || k, pad); b.setAttribute('data-k', k);
      b.addEventListener('click', function (e) { gesture(); if (k === 'ok') endEdit(true, e.isTrusted === true); else typeCh(k, e.isTrusted === true); });
    });
  }
  function showPad(v) {
    var s = S; s.pad.style.display = v ? 'grid' : 'none'; s.root.classList.toggle('kgl-editing', !!v);
    s.padH = v ? s.pad.offsetHeight : 0; applyPanelPos(); fitLines(); placeCircle(); need();
  }
  function grp(line, cls) { return E('span', 'kgl-g' + (cls ? ' ' + cls : ''), null, line); }
  function txt(g, cls, t, color) { var e = E('span', cls, t, g); if (color) e.style.color = '#fff'; return e; }

  function intField(parent, color, get, set, lo) { // a whole number: multiplier, circle, count, start
    var v0 = 0;
    return field(parent, {
      color: color,
      raw: function () { return String(get()); },
      apply: function (v) {
        var p = parseTyped(v, true); if (!p.ok) return; var n = p.v;
        if (p.big || n > TWO53) { showMsg(LIMIT_LINE); return; }
        if (n < lo || n !== Math.floor(n)) return; // the last good value stays
        set(n); return true;
      },
      begin: function () { v0 = get(); },
      drag: function (d) { var a = Math.abs(d), stp = Math.max(1, Math.pow(10, Math.floor(Math.log(Math.max(10, v0)) / Math.LN10) - 2)); set(clamp(v0 + (d < 0 ? -1 : 1) * Math.round(a / 6) * stp, lo, TWO53)); },
      wheel: function (dir) { var v = get(), stp = Math.max(1, Math.pow(10, Math.floor(Math.log(Math.max(10, v)) / Math.LN10) - 2)); set(clamp(v + dir * stp, lo, TWO53)); }
    });
  }
  function keyField(parent) { // the key: a whole-number address. In the square-root piece the same bracket takes any number.
    var k0 = 0;
    return field(parent, {
      color: '#ffffff',
      raw: function () { return String(S.piece === 'r' ? S.kx : S.K); },
      apply: function (v) {
        var dec = S.piece === 'r', p = parseTyped(v, !dec); if (!p.ok) return; var k = p.v;
        if (p.big || k > TWO53) { showMsg(LIMIT_LINE); return; }
        if (k < (dec ? 0 : S.rule.start) || (!dec && k !== Math.floor(k))) return;   // the last good value stays
        S.F.msg.style.display='none'; typeKey(k); return true;
      },
      commit: function () { if (S.piece === 'r' && S.find) tryFind(true); },
      begin: function () { k0 = S.K; },
      drag: function (d) { var a = Math.abs(d), f = a / 8 + Math.pow(a / 40, 3); scrubKey(k0 + (d < 0 ? -1 : 1) * Math.round(f)); },
      wheel: function (dir) { stepKey(dir); }
    });
  }
  function toDistance(r) { // a distance was given: the number under the root follows
    var s = S, R = s.rule; if (!(r >= 0) || !isFinite(r)) return;
    var kx = squareFor(R, r) - offset(R); if (!(kx >= 0)) kx = 0; if (kx > Number.MAX_SAFE_INTEGER) { showMsg(LIMIT_LINE); return; }
    if (s.piece !== 'r') setPiece('r');
    typeKey(kx); return true;
  }
  function toRemainder(m) { // a remainder was given: the smallest key that stops there
    var s = S, k = solveKey(s.rule, m); if (k == null) return;
    if (s.piece !== 't') setPiece('t');
    typeKey(k); return true;
  }
  function quarterFind() { var s = S, W = s.rule.W, m = s.form.m; if (m > 0 && (m * 4) % W === 0 && W % 4 === 0) reward(s.cx + Math.cos(s.selTh * D2R) * s.Rp, s.cy - Math.sin(s.selTh * D2R) * s.Rp); }
  function buildPanel() {
    var s = S, F = s.F = {}, panel = s.panel = E('div', 'kgl-panel', null, s.root), g, L;
    // ---- the strip: k -> r, theta -> X, Y, with the live number under each. Tapping a part opens it.
    var strip = F.strip = E('div', 'kgl-strip', null, panel);
    function cell(id, name, color, big) { var c = E('span', 'kgl-cell' + (big ? ' big' : ''), null, strip); E('i', null, name, c); var v = E('span', null, '', c); v.style.color = '#fff'; c._id = id; c.setAttribute('data-c', name); c.addEventListener('click', function () { gesture(); endEdit(true); setPiece(id); }); return v; }
    F.sk = cell('k', 'k', '#ffffff', true); E('span', 'kgl-arrow', '→', strip);
    F.sr = cell('r', 'r', '#00ffff'); F.st = cell('t', 'θ', '#00ffff'); E('span', 'kgl-arrow', '→', strip);
    F.sx = cell('x', 'X', '#ffb000'); F.sy = cell('x', 'Y', '#ffb000');

    // ---- k: a key is a whole number; how many; where they start
    var pk = F.pk = E('div', null, null, panel);
    L = E('div', 'kgl-line', null, pk);
    g = grp(L); txt(g, 'kgl-lab', 'k'); txt(g, 'kgl-op', '='); F.key = keyField(g);
    g = grp(L); txt(g, 'kgl-lab', 'COUNT');
    F.count = intField(g, '#00ffff', function () { return s.N; }, function (n) { setCount(n); }, 0);
    F.count.o.commit = function () { // a ring exactly filled: the count ends on the key before the next square
      if (s.rule.rad === 'sqrt' && s.N >= 3 && s.K < 1e15 && isSquare(s.K + 1)) { s.ringEvT0 = performance.now(); s.ringEvN = ringOf(s.K); reward(s.cx, s.cy); }
    };
    g = grp(L); txt(g, 'kgl-lab', 'START'); F.start = intField(g, '#00ffff', function () { return s.rule.start; }, function (n) { if (n > TWO53 - 1) n = TWO53 - 1; setRule(function (R) { R.start = n; }, false); }, 0);

    // ---- r: the square root sets the distance
    var pr = F.pr = E('div', null, null, panel), d0 = 0;
    L = F.lr = E('div', 'kgl-line', null, pr);
    function flip() { gesture(); endEdit(true); s.liveUser = !liveOn(); applyLive(); fitLines(); placeCircle(); need(); }
    g = grp(L); txt(g, 'kgl-lab', 'r'); F.flipR = txt(g, 'kgl-pill', '='); F.flipR.setAttribute('data-pill', 'r'); F.flipR.addEventListener('click', flip); F.rPre = txt(g, 'kgl-op', 'SQRT('); F.keyR = keyField(g); F.rPost = txt(g, 'kgl-op', ')');
    g = grp(L); F.rootEq = txt(g, 'kgl-op', '=');
    F.dist = field(g, {
      color: '#00ffff', raw: function () { return String(Math.round(s.selR * 10000) / 10000); },
      apply: function (v) { var p = parseTyped(v, false); if (!p.ok || p.v < 0) return; if (p.big) { showMsg(LIMIT_LINE); return; } return toDistance(p.v); },
      commit: function () {}, // Direct distance is exploration; the radicand earns FIND.
      begin: function () { d0 = s.selR; },
      drag: function (d) { toDistance(Math.max(0, Math.round((d0 + Math.round(d / 5) * 0.05 * Math.max(1, Math.pow(10, Math.floor(Math.log(Math.max(1, d0)) / Math.LN10)))) * 100) / 100)); },
      wheel: function (dir) { toDistance(Math.max(0, Math.round((s.selR + dir * 0.1) * 100) / 100)); }
    });
    F.dist.el.classList.add('kgl-root-result'); F.rootEq.classList.add('kgl-root-result');
    L = F.lrLive = E('div', 'kgl-line kgl-live', null, pr);
    g = grp(L, 'kgl-tap'); F.rSq = txt(g, null, '', '#00ffff'); g.addEventListener('click', function () { gesture(); s.band = !s.band; need(); });
    g = grp(L); txt(g, 'kgl-lab', 'AREA');
    F.area = field(g, {
      color: '#00ffff', raw: function () { return String(Math.round(Math.PI * s.selR * s.selR * 10000) / 10000); },
      apply: function (v) { var p = parseTyped(v, false); if (!p.ok || p.v < 0) return; if (p.big) { showMsg(LIMIT_LINE); return; } return toDistance(Math.sqrt(p.v / Math.PI)); },
      commit: function () {}, // AREA is exploration.
      wheel: function (dir) { toDistance(Math.sqrt(Math.max(0, Math.PI * s.selR * s.selR + dir * Math.PI) / Math.PI)); }
    });
    g = grp(L); F.areaEq = txt(g, 'kgl-op', '');

    // ---- theta: multiply, MOD, share of the circle
    var pt = F.pt = E('div', null, null, panel);
    L = F.lt = E('div', 'kgl-line kgl-mod', null, pt);
    g = grp(L); F.flip = txt(g, 'kgl-pill', '='); txt(g, 'kgl-op', 'MOD(');
    F.flip.setAttribute('data-pill', 't'); F.flip.addEventListener('click', flip);
    F.keyT = keyField(g); txt(g, 'kgl-op', '×'); g = grp(L);
    F.G = intField(g, '#ffb000', function () { return s.rule.G; }, function (n) { setRule(function (R) { R.G = n; }, false); }, 0);
    F.G.o.commit = function () { if (s.rule.G === G32() && s.rule.W === TWO32 && F.G.start !== String(G32())) reward(s.cx, s.cy); };
    txt(g, 'kgl-op', ','); g = grp(L);
    function setW(n) { setRule(function (R) { R.W = n; }, false); }
    F.W1 = intField(g, '#00ffff', function () { return s.rule.W; }, setW, 1); txt(g, 'kgl-op', ')'); F.W2 = F.W1;
    L = F.ltLive = E('div', 'kgl-line kgl-live', null, pt);
    L.classList.add('kgl-working'); g = F.gProd = grp(L); F.prod = txt(g, null, '');
    g = grp(L); txt(g, 'kgl-op', '−'); F.n = txt(g, null, '', '#00ffff'); txt(g, 'kgl-op', '×'); F.circleWorking = txt(g, null, '');
    g = grp(L); txt(g, 'kgl-op', '=');
    F.rem = intField(g, '#00ffff', function () { return s.form.m; }, function (n) { toRemainder(n); }, 0);
    F.rem.o.commit = quarterFind;
    L = F.ltLive2 = E('div', 'kgl-line kgl-live', null, pt);
    g = grp(L); txt(g, 'kgl-op', '≈'); F.frac = txt(g, null, '', '#00ffff'); E('span', 'kgl-ring', null, g);
    g = grp(L); txt(g, 'kgl-op', '≈');
    F.deg = field(g, {
      color: '#00ffff', raw: function () { return String(Math.round(s.form.remDeg * 10000) / 10000); },
      apply: function (v) { var p = parseTyped(v, false); if (!p.ok) return; if (p.big) { showMsg(LIMIT_LINE); return; } var fr = wrapDeg(p.v) / 360, W = s.rule.W; return toRemainder(Math.round(fr * W) % W); },
      commit: quarterFind,
      wheel: function (dir) { var W = s.rule.W, fr = ((Math.round(s.form.remDeg) + dir + 360) % 360) / 360; toRemainder(Math.round(fr * W) % W); }
    });
    txt(g, 'kgl-op', '°');
    g = F.gBad = grp(L); F.diff = txt(g, 'kgl-bad', '');

    // ---- X, Y: across and up
    var px = F.px = E('div', null, null, panel);
    L = E('div', 'kgl-line', null, px); g = grp(L); txt(g, 'kgl-lab', 'X'); txt(g, 'kgl-op', '≈'); F.xr = txt(g, null, '', '#00ffff'); txt(g, 'kgl-op', '× COS('); F.xt = txt(g, null, '', '#00ffff'); txt(g, 'kgl-op', ')');
    g = grp(L); txt(g, 'kgl-op', '≈'); F.xv = txt(g, null, '', '#ffb000');
    L = E('div', 'kgl-line', null, px); g = grp(L); txt(g, 'kgl-lab', 'Y'); txt(g, 'kgl-op', '≈'); F.yr = txt(g, null, '', '#00ffff'); txt(g, 'kgl-op', '× SIN('); F.yt = txt(g, null, '', '#00ffff'); txt(g, 'kgl-op', ')');
    g = grp(L); txt(g, 'kgl-op', '≈'); F.yv = txt(g, null, '', '#ffb000');

    // ---- one row of one-word taps: the two presets, how near these numbers are to the live Kuiper,
    //      the experiments of the open part, and the copy for a spreadsheet
    var tags = F.tags = E('div', 'kgl-tags', null, panel);
    function tag(parent, text, fn) { var t = E('span', 'kgl-tag', text, parent); t.addEventListener('click', function () { gesture(); endEdit(true); fn(); }); return t; }
    F.exTag = tag(tags, 'EXERCISE', function () { preset(1, 0); });
    F.liveTag = tag(tags, 'LIVE', function () { preset(0, 0.5); });
    F.meter = E('span', 'kgl-meter', null, tags); F.mDots = [E('i', null, null, F.meter), E('i', null, null, F.meter), E('i', null, null, F.meter), E('i', null, null, F.meter)];
    F.tgK = E('span', 'kgl-tagset', null, tags);
    [100, 1000, 10000].forEach(function (n) { tag(F.tgK, commas(String(n)), function () { setCount(n); }); });
    F.tgR = E('span', 'kgl-tagset', null, tags); F.radTags = {};
    [['sqrt', 'SQRT(k)'], ['lin', 'k'], ['cbrt', 'k^(1/3)']].forEach(function (a) { F.radTags[a[0]] = tag(F.tgR, a[1], function () { setRule(function (R) { R.rad = a[0]; }, true); }); });
    F.tgT = E('span', 'kgl-tagset', null, tags);
    tag(F.tgT, '12', function () { setRule(function(R){R.G=1;R.W=12;},false); });
    tag(F.tgT, '360', function () { setRule(function(R){R.G=1;R.W=360;},false); });
    F.dragTag = tag(F.tgT, 'DRAG', function () { s.dragRule=!s.dragRule; F.dragTag.className='kgl-tag'+(s.dragRule?' on':''); F.dragTag.setAttribute('aria-pressed',String(s.dragRule)); });
    F.dragTag.setAttribute('aria-label','Allow dot dragging to change multiplier');
    F.dragTag.setAttribute('aria-pressed','false');
    var bench = Array.isArray(root.KGBenchPresets) && root.KGBenchPresets.length ? root.KGBenchPresets.slice(0, 8) : [{ label: 'MIRROR', mirror: true }, { label: 'SPOKES', half: true }];
    bench.forEach(function (b) {
      if (!b || typeof b.label !== 'string') return;
      tag(F.tgT, b.label.slice(0, 12), function () {
        setRule(function (R) {
          if (b.mirror) R.G = R.W - (R.G % R.W); else if (b.half) R.G = Math.floor(R.W / 2);
          else { var w = Math.floor(+b.circle), m = Math.floor(+b.multiplier); if (w >= 1 && w <= TWO53) R.W = w; if (m >= 0 && m <= TWO53) R.G = m; }
        }, true);
      });
    });
    F.copyTag = tag(tags, 'COPY', copySheet);
    F.msg = E('div', 'kgl-msg', '', panel);
    var id; for (id in F) if (F[id] && F[id].el && F[id].o) F[id].el.setAttribute('data-f', id);
  }
  // one line large; the rest of the working unfolds with "=" (open already where the screen has the room)
  function liveOn() { var s = S; return s.liveUser != null ? s.liveUser : (!s.side && s.W >= 700 && s.H >= 640); }
  function applyLive() {
    var s = S, F = s.F, v = liveOn();
    show(F.gProd, true); show(F.ltLive2, v); show(F.lrLive, v);
    show(F.lt, true);
  }
  function setPiece(p, quiet) {
    var s = S, F = s.F, i, cells = F.strip.children; s.piece = p; if(p!=='t'){s.dragRule=false; F.dragTag.className='kgl-tag'; F.dragTag.setAttribute('aria-pressed','false');}
    show(F.pk, p === 'k'); show(F.pr, p === 'r'); show(F.pt, p === 't'); show(F.px, p === 'x');
    show(F.tgK, p === 'k'); show(F.tgR, p === 'r'); show(F.tgT, p === 't');
    for (i = 0; i < cells.length && i < 12; i++) if (cells[i]._id) cells[i].className = 'kgl-cell' + (cells[i]._id === 'k' ? ' big' : '') + (cells[i]._id === p ? ' on' : '');
    if (p !== 'r' && s.kx !== s.K) s.kx = s.K;
    applyLive();
    if (quiet) return;
    recompute(); restD(); updateFormula(); fitLines(); placeCircle(); writeHash(); need();
  }
  function sheetText() { var rows = sheet(S.rule, Math.max(lastKey(), S.K)); return rows ? rows.join('\t') : ''; }
  function copySheet() {
    if (!sheetText()) return;
    var s = S, t = sheetText(), done = function () { s.F.copyTag.className = 'kgl-tag on'; s.timers.push(setTimeout(function () { if (S === s) s.F.copyTag.className = 'kgl-tag'; }, 1200)); };
    s.copied = t;
    function fallback() { try { var ta = E('textarea', null, null, s.root); ta.value = t; ta.style.cssText = 'position:absolute;left:-9999px;top:0'; ta.select(); document.execCommand('copy'); s.root.removeChild(ta); } catch (e) { } done(); }
    try { if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) { root.navigator.clipboard.writeText(t).then(done, fallback); return; } } catch (e) { }
    fallback();
  }
  function showMsg(t) {
    var s = S; s.F.msg.textContent = t; s.F.msg.style.display = 'block'; clearTimeout(s.msgTimer);
    s.msgTimer = setTimeout(function () { if (S === s) { s.F.msg.style.display = 'none'; fitLines(); placeCircle(); need(); } }, 7000);
    fitLines(); placeCircle(); need();
  }

  function updateFormula() {
    var s = S, F = s.F, R = s.rule, k = s.K, f = s.form = angleForm(R, k), T = s.T;
    var ks = commas(String(k)); // keys are whole numbers up to 2^53: String() is exact
    placeOne(R, k, T);
    var between = s.kx !== k, r = between ? radiusAt(R, s.kx) : T.r, x = between ? r * Math.cos(2 * Math.PI * T.m / R.W) : T.x, y = between ? r * Math.sin(2 * Math.PI * T.m / R.W) : T.y;
    // the two paths agree: the exact product above, and the wrapped whole numbers the law itself uses
    var diff = circDiff(f.turns, T.turns); s.diff = diff;
    if (diff > 1e-9) { show(F.gBad, true); setT(F.diff, '≠ ' + diff.toExponential(2)); } else show(F.gBad, false);
    var rs = fmtDist(r), xs = fmtDist(x), ys = fmtDist(y), kxs = between ? String(s.kx) : ks;
    setT(F.sk, between ? '-' : ks); setT(F.sr, rs); setT(F.st, fmtNum(f.theta, 3)); setT(F.sx, xs); setT(F.sy, ys);
    F.key.set(ks); F.keyT.set(ks); F.keyR.set(kxs);
    F.count.set(commas(String(s.N))); F.start.set(commas(String(R.start)));
    F.G.set(f.GStr); F.W1.set(f.WStr); F.W2.set(f.WStr);
    setT(F.circleWorking, f.WStr); setT(F.prod, f.prodStr); setT(F.n, f.nStr); F.rem.set(f.mStr); setT(F.frac, f.fracStr); F.deg.set(f.degStr);
    setT(F.rPre, R.rad === 'sqrt' ? 'SQRT(' : ''); setT(F.rPost, R.rad === 'sqrt' ? (R.off ? '+ ' + R.off + ' )' : ')') : R.rad === 'lin' ? '' : '^ (1/3)');
    F.dist.set(rs);
    var sq = R.rad === 'sqrt' ? s.kx + R.off : r*r, sqs = String(sq), area = Math.PI * r * r;
    var sign = R.rad === 'sqrt' ? rootSign(rs, s.kx, R.off) : '≈'; setT(F.rootEq, sign);
    setT(F.rSq, rs + ' × ' + rs + ' ' + sign + ' ' + sqs); F.area.set(fmtDist(area)); setT(F.areaEq, '≈ PI × ' + sqs);
    setT(F.xr, rs); setT(F.yr, rs); setT(F.xt, f.thetaStr); setT(F.yt, f.thetaStr); setT(F.xv, xs); setT(F.yv, ys);
    var id; for (id in F.radTags) { var onn = id === R.rad; if (F.radTags[id]._on !== onn) { F.radTags[id]._on = onn; F.radTags[id].className = 'kgl-tag' + (onn ? ' on' : ''); } }
    var ex = isExercise(R), lv = isLive(R);
    if (F.exTag._on !== ex) { F.exTag._on = ex; F.exTag.className = 'kgl-tag' + (ex ? ' on' : ''); }
    if (F.liveTag._on !== lv) { F.liveTag._on = lv; F.liveTag.className = 'kgl-tag' + (lv ? ' on' : ''); }
    var eq = [R.G === G32(), R.W === TWO32, R.rad === 'sqrt' && R.off === 0.5, R.start === 0], i;
    for (i = 0; i < 4; i++) { var c = eq[i] ? 'on' : ''; if (F.mDots[i].className !== c) F.mDots[i].className = c; }
    s.lblRem = f.degStr + '°'; s.lblDist = rs; s.lblArea = sqs; s.lblX = xs; s.lblY = ys;
    s.stackNum = f.nNum; s.stackStr = f.nStr; s.selR = r; s.selTh = T.turns * 360;
    fitLines(); writeHash();
  }
  function liveFormula(now) { // while the arm swings the computed numbers run with it (text only, at most 20 times a second)
    var s = S, A = s.A, D = s.D, F = s.F; if (now - A.lastText < 50) return; A.lastText = now;
    var rem = A.FL.remDeg + D.e * s.Tdeg - (D.cross && A.FL.remDeg + s.Tdeg >= 360 ? 360 : 0); if (rem < 0) rem = 0;
    var ds = fmtNum(rem, 2);
    // Keep the committed product, circle count and remainder together during travel.
    // The formula shows the selected destination; only the drawn arm travels.
    s.lblRem = ds + '°'; s.lblDist = fmtDist(A.rLo + (A.rHi - A.rLo) * D.e);
  }
  // roaming: the numbers of the place under the mouse roll in the same cells; the nearest drawn key lights
  function probeFormula() {
    var s = S, F = s.F, R = s.rule, P = s.probe, dx = P.x - s.cx, dy = -(P.y - s.cy), dist = Math.hypot(dx, dy) / s.vs;
    var ang = Math.atan2(dy, dx) / D2R; if (ang < 0) ang += 360;
    var i, n = s.cnt, best = -1, bd = Infinity;
    for (i = 0; i < n; i++) { var ex = s.cx + s.SX[i] * s.vs - P.x, ey = s.cy - s.SY[i] * s.vs - P.y, d = ex * ex + ey * ey; if (d < bd) { bd = d; best = i; } }
    P.idx = best; P.gap = best >= 0 ? fmtDist(Math.sqrt(bd) / s.vs) : '';
    P.keyStr = best >= 0 ? commas(String(s.KS[best])) : '';
    // Hover only highlights the nearest sampled point. It does not rewrite the selected identity.
  }
  function fitLines() { // 28 px or more; a number too long for the screen drops its line to 24 px, then breaks at any digit
    var s = S, lines = s.panel.querySelectorAll('.kgl-line'), i, j;
    var avail = s.panel.clientWidth - 20; if (!(avail > 0)) return;
    for (i = 0; i < lines.length && i < 12; i++) {
      var L = lines[i]; if (L.offsetParent === null || L.classList.contains('kgl-scroll')) continue; L.style.fontSize = ''; L.classList.remove('kgl-wrap');
      var widest = 0, ch = L.children; for (j = 0; j < ch.length && j < 40; j++) { var w = ch[j].offsetWidth; if (w > widest) widest = w; }
      if (widest > avail) { var fs = Math.max(24, Math.floor(s.fs * avail / widest)); L.style.fontSize = fs + 'px'; if (s.fs * avail / widest < 24) L.classList.add('kgl-wrap'); }
    }
    var ph = s.panel.offsetHeight; if (ph !== s.panelH) { s.panelH = ph; if (!s.first) placeCircle(); }
  }

  // ------------------------------------------------------------------ layout: a true circle, as large as the screen allows
  function layout() {
    var s = S, host = s.host, W = host.clientWidth || root.innerWidth || 390, H = host.clientHeight || root.innerHeight || 844;
    var dpr = Math.min(3, root.devicePixelRatio || 1);
    s.W = W; s.H = H; s.dpr = dpr;
    var cw = Math.round(W * dpr), chh = Math.round(H * dpr);
    if (s.canvas.width !== cw || s.canvas.height !== chh) { s.canvas.width = cw; s.canvas.height = chh; }
    var side = s.side = W > H * 1.4 && H < 560, small = Math.min(W, H) < 560;
    s.root.classList.toggle('kgl-side', side);
    s.fs = small ? 28 : (W >= 1100 ? 32 : 30);
    s.panel.style.fontSize = s.fs + 'px';
    s.colW = side ? Math.max(300, W - H) : W;
    var icons = s.iconsEl.children.length * 44 + 8, room = (side ? s.colW : W) - icons - 5 * 26 - 16;
    var names = W >= 1000 && !side, kids = s.pipsEl.children, i;
    for (i = 0; i < kids.length && i < 5; i++) { kids[i]._name.style.display = (names || (i === 4 && room >= 100)) ? '' : 'none'; kids[i].className = 'kgl-pip' + (i === 4 ? ' on' : (root.KGPlay && typeof root.KGPlay.open === 'function' ? '' : ' dim')); }
    s.pipsEl.style.left = (side ? W - s.colW + 6 : 6) + 'px';
    var ps = s.pad.style; if (side) { ps.left = (W - s.colW) + 'px'; ps.margin = '0'; } else { ps.left = '0'; ps.margin = '0 auto'; }
    if (s.edit) s.padH = s.pad.offsetHeight;
    applyLive(); applyPanelPos();
    s.panelH = -1; fitLines(); placeCircle();
    s.first = false;
  }
  function applyPanelPos() {
    var s = S, ps = s.panel.style;
    if (s.side) { ps.left = (s.W - s.colW) + 'px'; ps.right = '0'; ps.top = '50px'; ps.bottom = (s.padH > 0 ? s.padH : 44) + 'px'; }
    else { ps.left = '0'; ps.right = '0'; ps.top = 'auto'; ps.bottom = s.padH + 'px'; }
  }
  function placeCircle() {
    var s = S, W = s.W, H = s.H, x1 = W, y0, y1, R;
    if (s.side) { x1 = W - s.colW; y0 = 0; y1 = H; R = Math.min(x1, y1 - y0) / 2 - 14; s.stackX = x1 + 28; s.stackY = H - 22; s.marksX = W - 20; }
    else {
      y0 = 50; y1 = H - s.panel.offsetHeight - s.padH; R = Math.min(W, y1 - y0) / 2 - 14;
      if (W / 2 - R >= 190) { s.stackX = 30; s.stackY = y1 - 24; }
      else { y1 -= 40; R = Math.min(W, y1 - y0) / 2 - 14; s.stackX = 30; s.stackY = (y0 + y1) / 2 + R + 14 + 22; }
      s.marksX = W - 20;
    }
    s.cxT = x1 / 2; s.cyT = (y0 + y1) / 2; s.RpT = Math.max(40, R);
  }
  function fitScale() { return 0.86 * S.RpT / (S.rFit > 0 ? S.rFit : 1) * S.zoomK; }
  function hold(ms) { S.holdUntil = performance.now() + ms; }
  function releaseHold() { if (S) { hold(300); need(); } }
  function refit() { // what must fit: the last key, the selected dot, and the thing to find
    var s = S, R = s.rule, base = Math.max(s.rLast, s.selR);
    if (s.piece === 'r' && s.find) base = Math.max(base, s.tgt.r + s.tgt.w);
    if (R.rad === 'sqrt' && base < 5000) base = Math.floor(base + 1e-9) + 1; // room for the whole ring being filled
    s.rFit = base > 0 && isFinite(base) ? base : 1;
  }

  // ------------------------------------------------------------------ which stars, and where the formulas put them
  function recompute(chTop) {
    var s = S, R = s.rule, N = s.N, K = s.K, KS = s.KS, n = 0, i, k, T = s.T, st = R.start, last = st + N - 1;
    if (chTop == null) chTop = K; s.chTop = chTop;
    if (N <= CAP) { for (i = 0; i < N && i < CAP; i++) KS[n++] = st + i; }
    else {
      var lo = Math.max(st, chTop - CH), hi = Math.min(chTop, last);
      var smp = SCALE().sample({ first: st, count: N }, CAP), L = Math.min(smp.length, CAP + 2);
      for (i = 0; i < L; i++) { k = smp[i]; if (k >= lo && k <= hi) continue; KS[n++] = k; }
      for (i = 0; i <= CH; i++) { k = lo + i; if (k > hi) break; KS[n++] = k; }
    }
    s.cnt = n; s.selIdx = -1; s.sig = st + ':' + N;
    fill(R, KS, n, s.SX, s.SY);
    for (i = 0; i < n; i++) if (KS[i] === K) { s.selIdx = i; break; }
    s.chN = 0;
    for (i = 0; i <= CH + 1; i++) { k = chTop - i; if (k < 0) break; placeOne(R, k, T); s.CT[i] = T.turns * 360; s.CR[i] = T.r; s.chN = i + 1; }
    s.rLast = 0; if (N > 0) { placeOne(R, last, T); s.rLast = T.r; }
    if (K < TWO53) { placeOne(R, K + 1, T); s.nextX = T.x; s.nextY = T.y; }
    s.selTh = s.CT[chTop - K] || 0; s.selR = s.kx !== K ? radiusAt(R, s.kx) : (s.CR[chTop - K] || 0);
    s.Tdeg = turnDeg(R);
    refit();
  }
  function restD() { var s = S, D = s.D; D.has = s.K >= 1 && s.chN >= 2 && s.chTop === s.K; D.e = 1; D.cross = false; }
  function keepPrev() { var s = S, i, n = s.cnt; for (i = 0; i < n; i++) { s.PX[i] = s.SX[i]; s.PY[i] = s.SY[i]; } s.prevSig = s.sig; }
  function snapRest() { var s = S; if (s.A.on) { s.A.on = false; s.queue = 0; recompute(); restD(); s.J = 1; s.wedgeA = 1; updateFormula(); } }
  // a number of the formulas changed: every dot re-flows from the same four lines
  function setRule(change, morph) {
    var s = S, R = s.rule; snapRest(); setPlaying(false);
    if (morph && s.cnt > 0) keepPrev(); else s.prevSig = '';
    change(R); R._p = null;
    if (R.start + s.N - 1 > TWO53) s.N = Math.max(0, TWO53 - R.start + 1);
    if (s.N > 0 && s.K > R.start + s.N - 1) { s.K = R.start + s.N - 1; s.kx = s.K; } // the selected key stays among the keys shown
    recompute(); restD();
    if (morph && s.prevSig === s.sig) { s.morph = 0; s.morphT0 = performance.now(); hold(700); } else s.morph = 1;
    s.zoomK = 1; updateFormula(); need();
  }
  function preset(start, off) { setRule(function (R) { R.start = start; R.off = off; R.G = G32(); R.W = TWO32; R.rad = 'sqrt'; }, S.rule.start === start); }
  function ensureKey(k) { var s = S, st = s.rule.start; if (k >= st && k - st + 1 > s.N) s.N = Math.min(TWO53 - st, k - st + 1); }

  // ------------------------------------------------------------------ keys: one more equal turn each
  function startStep(dir, dur, auto) {
    var s = S, A = s.A, R = s.rule, lo, hi;
    if (dir > 0) {
      if (s.K >= TWO53 - 1) { showMsg(LIMIT_LINE); s.queue = 0; setPlaying(false); return; }
      lo = s.K; hi = lo + 1; A.newStar = hi >= R.start && hi > lastKey();
      s.K = hi; ensureKey(hi); if (A.newStar) s.userN = s.N;
    } else {
      if (s.K <= R.start) { s.queue = 0; return; }
      hi = s.K; lo = hi - 1; A.newStar = false; s.K = lo;
    }
    s.kx = s.K;
    recompute(hi);
    A.FL = angleForm(R, lo); A.FH = angleForm(R, hi);
    A.rLo = s.CR[1]; A.rHi = s.CR[0];
    var more = A.FH.nNum > A.FL.nNum;
    A.ec = !more ? Infinity : (A.FL.remDeg + s.Tdeg >= 360 - 1e-9 && s.Tdeg > 0 ? (360 - A.FL.remDeg) / s.Tdeg : 0.5);
    A.on = true; A.type = 'step'; A.dir = dir; A.t0 = performance.now(); A.dur = dur; A.auto = !!auto; A.lastText = 0;
    s.D.has = true; s.D.e = dir > 0 ? 0 : 1; s.D.cross = dir < 0 && more; s.J = 1; s.wedgeA = 1;
    updateFormula(); // exact values for the key now named; the running numbers take over on the next frame
    need();
  }
  function land(now) {
    var s = S, A = s.A;
    A.on = false;
    if (A.type === 'step') {
      if (A.dir < 0) recompute();
      restD(); updateFormula();
      s.landT0 = now; note(220 * Math.pow(2, s.selTh / 180));
      if (A.dir > 0 && A.newStar && s.rule.rad === 'sqrt' && s.K >= 1 && isSquare(s.K)) { // a new ring starts at a square number
        s.ringEvT0 = now; s.ringEvN = ringOf(s.K); note(196 * Math.pow(2, (s.ringEvN % 15) / 5), true);
      }
      if (!A.auto) { s.userLands++; if (s.userLands === 2 && !seen('h2')) { markSeen('h2'); [s.F.keyT.el, s.F.G.el, s.F.W1.el].forEach(function (e) { e.classList.add('kgl-pulse'); }); } }
    } else { s.J = 1; s.wedgeT0 = now; s.wedgeA = 0; s.landT0 = now; if (s.gest) note(220 * Math.pow(2, s.selTh / 180)); }
    if (s.queue > 0) {
      if (s.queue > 5) { var skip = s.queue - 3; s.queue = 3; s.K = Math.min(TWO53 - 2, s.K + skip); s.kx = s.K; ensureKey(s.K); s.userN = s.N; recompute(); restD(); }
      s.queue--; startStep(1, Math.max(90, 520 / (1 + s.queue)));
    } else if (s.playing) startStep(1, 125);
  }
  function stepKey(dir) {
    var s = S;
    if (s.A.on) { if (dir > 0 && s.A.type === 'step' && s.A.dir > 0) { if (s.queue < 400) s.queue++; return; } snapRest(); }
    startStep(dir, dir > 0 ? 620 : 420);
  }
  function jumpTo(k) { // a far key: no billions of wedges. The arm swings what is left after the whole circles.
    var s = S, A = s.A; k = clamp(k, 0, TWO53);
    var K = Math.floor(k), oldN = s.N, was = s.K;
    if (s.A.on) { s.A.on = false; s.queue = 0; }
    s.K = K; s.kx = k; ensureKey(K); recompute(); restD(); updateFormula();
    if (s.N > oldN) { s.pourOn = true; s.pourFrom = s.rule.start + oldN; s.pourT0 = performance.now(); }
    if (K !== was) { A.on = true; A.type = 'jump'; A.t0 = performance.now(); A.dur = 500; s.J = 0; s.wedgeA = 0; } else { s.J = 1; s.wedgeA = 1; }
    need();
  }
  function typeKey(k) { // a number was given for the key: the count goes back to what was asked for, or grows to hold it
    var s = S; setPlaying(false); s.zoomK = 1; s.N = Math.min(s.N, s.userN);
    jumpTo(k);
    if (s.piece === 'r' && s.find) tryFind(false);
  }
  function scrubKey(k) { // dragging the key number: stars pour in as it rises
    var s = S; k = clamp(Math.floor(k), s.rule.start, TWO53 - 1); if (k === s.K) return;
    if (s.A.on) { s.A.on = false; s.queue = 0; }
    var oldN = s.N; s.K = k; s.kx = k; ensureKey(k); s.userN = s.N;
    recompute(); restD(); s.J = 1; s.wedgeA = 1; updateFormula();
    if (s.N > oldN) { s.pourOn = true; s.pourFrom = s.rule.start + oldN; s.pourT0 = performance.now() - 250; }
    if (s.piece === 'r' && s.find) tryFind(false);
    note(220 * Math.pow(2, s.selTh / 180)); need();
  }
  function setCount(n) { // how many keys: the same four lines place them all
    var s = S, st = s.rule.start; n = clamp(Math.floor(n), 0, TWO53 - st); snapRest(); setPlaying(false);
    var oldN = s.N; s.N = n; s.zoomK = 1;
    s.userN = n; if (n > 0) { s.K = st + n - 1; s.kx = s.K; }
    recompute(); restD(); updateFormula();
    if (n > oldN) { s.pourOn = true; s.pourFrom = st + oldN; s.pourT0 = performance.now(); } else s.pourOn = false;
    s.J = 1; s.wedgeA = 1;
    need();
  }

  // ------------------------------------------------------------------ things to find: answered with light and a short rising phrase
  function tryFind(typed) {
    var s = S, t = s.tgt, r = s.selR, now = performance.now();
    if (!t || t.found) return;
    if (Math.abs(r - t.r) <= t.w + 1e-12) {
      if (!typed) { s.glowT0 = now; need(); return; }   // exploring is welcome; only a typed, committed number is answered
      t.found = true; // Consume before the delayed target transition.
      reward(s.cx + Math.cos(s.selTh * D2R) * r * s.vsT, s.cy - Math.sin(s.selTh * D2R) * r * s.vsT, Math.max(1, Math.round(10 * (s.findIdx + 1) / (s.nTries + 1))));
      s.findIdx++; s.nTries = 0;
      var s0 = s; s.timers.push(setTimeout(function () { if (S !== s0 || s0.tgt !== t) return; s0.tgt = findTarget(s0.findIdx); refit(); need(); }, 1100));
    } else if (typed && s.nTries < 8) { s.tries[s.nTries * 2] = r; s.tries[s.nTries * 2 + 1] = s.selTh; s.nTries++; }
  }
  function reward(x, y, points) {
    var s = S, now = performance.now(); s.burstT0 = now; s.burstX = x; s.burstY = y; s.marks++; s.score += points || 10; s.scoreStr = commas(String(s.score));
    note(392, true, 0); note(494, true, 0.11); note(587, true, 0.22); need();
  }

  // ------------------------------------------------------------------ sound: one soft note per landing, pitch from the angle
  function gesture() { if (S) S.gest = true; }
  function note(freq, extra, delay) {
    var s = S; if (!s || !s.gest || muted()) return;
    var now = performance.now(); if (!extra) { if (now - s.lastNote < 45) return; s.lastNote = now; }
    try {
      if (!s.ac) { var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return; s.ac = new AC(); }
      var ac = s.ac; if (ac.state === 'suspended') ac.resume();
      var t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.4);
    } catch (e) { }
  }

  // ------------------------------------------------------------------ touch and mouse on the drawing
  function starAt(px, py) {
    var s = S, i, n = s.cnt, best = -1, bd = Infinity, vs = s.vs, cx = s.cx, cy = s.cy;
    var hit = clamp(s.Rp * 0.62 / Math.sqrt(Math.max(1, n)), 9, 26);
    for (i = 0; i < n; i++) { var dx = cx + s.SX[i] * vs - px, dy = cy - s.SY[i] * vs - py, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
    return bd <= hit * hit ? best : -1;
  }
  function bind() {
    var s = S, cv = s.canvas;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    on(cv, 'pointerdown', function (e) {
      gesture();
      var p = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) { }
      if (s.probe.on) { s.probe.on = false; s.probe.idx = -1; updateFormula(); }
      if (!s.ptr[e.pointerId]) s.nptr++; s.ptr[e.pointerId] = { x: p[0], y: p[1] };
      if (s.nptr === 2) {
        var ids = Object.keys(s.ptr), a = s.ptr[ids[0]], b = s.ptr[ids[1]];
        s.pinch = { d0: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), z0: s.zoomK }; s.drag = null; return;
      }
      if (s.nptr > 2) { s.drag = null; return; }
      var i = starAt(p[0], p[1]);
      s.drag = { id: e.pointerId, x0: p[0], y0: p[1], star: i, key: i >= 0 ? s.KS[i] : -1, mode: '', moved: false, wasEdit: !!s.edit };
    });
    on(cv, 'pointermove', function (e) {
      var pt = s.ptr[e.pointerId]; if (!pt) return; var p = pos(e); pt.x = p[0]; pt.y = p[1];
      if (s.pinch && s.nptr === 2) { // stretch or shrink the space by hand
        var ids = Object.keys(s.ptr), a = s.ptr[ids[0]], b = s.ptr[ids[1]], d = Math.max(20, Math.hypot(a.x - b.x, a.y - b.y));
        s.zoomK = clamp(s.pinch.z0 * d / s.pinch.d0, 0.02, 200); need(); return;
      }
      var g = s.drag; if (!g || g.id !== e.pointerId) return;
      var dx = p[0] - g.x0, dy = p[1] - g.y0;
      if (!g.moved) {
        if (dx * dx + dy * dy < 100) return; g.moved = true;
        if (s.dragRule && s.piece === 't' && g.star >= 0 && g.key >= 1) { g.mode = 'turn'; endEdit(true); snapRest(); setPlaying(false); }
      }
      if (g.mode === 'turn') { // drag a dot round the circle: the multiplier follows (exploring)
        var a2 = Math.atan2(-(p[1] - s.cy), p[0] - s.cx) / TAU; if (a2 < 0) a2 += 1;
        var j = g.key, R = s.rule, W = R.W, cur = (R.G % W) / W, m = Math.round(j * cur - a2), t = (a2 + m) / j;
        if (t < 0) t += 1 / j; if (t > 1) t -= 1 / j;
        var q = j <= 1 ? 360 : j <= 2 ? 720 : j <= 10 ? 3600 : j <= 100 ? 36000 : 0;
        var Gn = q && W >= q ? Math.round(Math.round(t * q) / q * W) : Math.round(t * W);
        Gn = clamp(Gn, 0, W);
        if (Gn !== R.G) { s.F.G.el.classList.add('kgl-pulse'); R.G = Gn; R._p = null; recompute(); restD(); updateFormula(); need(); }
        hold(500);
      }
    });
    function up(e) {
      var pt = s.ptr[e.pointerId]; if (!pt) return; delete s.ptr[e.pointerId]; s.nptr = Math.max(0, s.nptr - 1);
      if (s.pinch) { if (s.nptr < 2) s.pinch = null; s.drag = null; return; }
      var g = s.drag; s.drag = null; if (!g || g.id !== e.pointerId) return;
      if (g.moved) { if (g.mode) releaseHold(); return; }
      if (e.type === 'pointercancel') return;
      // a tap
      if (g.wasEdit) { endEdit(true); return; }
      if (s.playing) { setPlaying(false); return; }
      if (g.star >= 0 && g.key !== s.K) { if (g.key === s.K + 1) stepKey(1); else jumpTo(g.key); return; }
      stepKey(1);
    }
    on(cv, 'pointerup', up); on(cv, 'pointercancel', up);
    on(cv, 'mousemove', function (e) { if (e.buttons || s.drag || s.nptr) return; var p = pos(e), P = s.probe; P.on = true; P.x = p[0]; P.y = p[1]; P.dirty = true; need(); });
    on(cv, 'mouseleave', function () { var P = s.probe; if (!P.on) return; P.on = false; P.idx = -1; P.ring = -1; if (!s.edit) updateFormula(); need(); });
    on(cv, 'wheel', function (e) { e.preventDefault(); gesture(); s.zoomK = clamp(s.zoomK * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 0.02, 200); need(); }, { passive: false });
    on(document, 'keydown', function (e) {
      if (S !== s || e.ctrlKey || e.metaKey || e.altKey) return; var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      var k = e.key;
      if (s.edit) {
        if (k >= '0' && k <= '9') { e.preventDefault(); gesture(); typeCh(k, e.isTrusted === true); }
        else if (k === '.' || k === ',') { e.preventDefault(); typeCh('.', e.isTrusted === true); }
        else if (k === '-') { e.preventDefault(); typeCh('-', e.isTrusted === true); }
        else if (k === 'Backspace') { e.preventDefault(); typeCh('back', e.isTrusted === true); }
        else if (k === 'Delete' || k === 'c' || k === 'C') { e.preventDefault(); typeCh('clear', e.isTrusted === true); }
        else if (k === 'Enter' || k === 'Tab') { e.preventDefault(); endEdit(true, e.isTrusted === true); }
        else if (k === 'Escape') { e.preventDefault(); endEdit(false); }
        return;
      }
      if (k >= '0' && k <= '9') { e.preventDefault(); gesture(); var F = s.F; startEdit(s.piece === 'r' ? F.keyR : s.piece === 't' ? F.keyT : F.key); typeCh(k, e.isTrusted === true); if (s.piece === 'x') setPiece('k'); }
      else if (k === ' ' || k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); gesture(); setPlaying(false); stepKey(1); }
      else if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); gesture(); setPlaying(false); stepKey(-1); }
      else if (k === 'Escape' && s.closeBtn) close();
    });
    function resized() { if (S !== s) return; layout(); need(); }
    on(s.root, 'scroll', function () { if (s.root.scrollLeft || s.root.scrollTop) { s.root.scrollLeft = 0; s.root.scrollTop = 0; } });
    on(root, 'resize', resized);
    if (typeof ResizeObserver === 'function') { s.ro = new ResizeObserver(resized); s.ro.observe(s.host); }
  }

  // ------------------------------------------------------------------ the frame
  function tick(now) {
    var s = S; if (!s) return; s.raf = 0;
    var dt = Math.min(64, Math.max(0, now - s.last)); s.last = now;
    var busy = false, A = s.A, D = s.D, i;
    if (s.fade < 1) { s.fade = clamp((now - s.t0) / 350, 0, 1); busy = true; }
    if (A.on) {
      var u = (now - A.t0) / A.dur;
      if (u >= 1) land(now);
      else if (u < 0) { /* waiting to start */ }
      else if (A.type === 'step') {
        var e = A.dur > 1000 ? easeIO(u) : easeO(u); D.e = A.dir > 0 ? e : 1 - e;
        var cross = D.e >= A.ec;
        if (cross && !D.cross && A.dir > 0) spawnFly(now);
        D.cross = cross; liveFormula(now);
      } else s.J = easeO(u);
      busy = true;
    }
    if (s.wedgeA < 1 && !(A.on && A.type === 'jump')) { s.wedgeA = clamp((now - s.wedgeT0) / 350, 0, 1); busy = true; }
    if (s.morph < 1) { s.morph = clamp((now - s.morphT0) / 550, 0, 1); busy = true; }
    if (s.pourOn) { if (now - s.pourT0 > 700) s.pourOn = false; busy = true; }
    if (now >= s.holdUntil) s.vsT = fitScale(); else busy = true;
    var kf = 1 - Math.exp(-dt / 110);
    if (Math.abs(s.vs / s.vsT - 1) > 0.002) { s.vs *= Math.pow(s.vsT / s.vs, kf); busy = true; } else s.vs = s.vsT;
    if (Math.abs(s.cx - s.cxT) + Math.abs(s.cy - s.cyT) + Math.abs(s.Rp - s.RpT) > 0.5) { s.cx += (s.cxT - s.cx) * kf; s.cy += (s.cyT - s.cy) * kf; s.Rp += (s.RpT - s.Rp) * kf; busy = true; }
    else { s.cx = s.cxT; s.cy = s.cyT; s.Rp = s.RpT; }
    for (i = 0; i < s.fly.length; i++) if (s.fly[i].on) { if (now - s.fly[i].t0 > 650) s.fly[i].on = false; else busy = true; }
    if (now - s.landT0 < 300 || now - s.burstT0 < 900 || now - s.glowT0 < 700 || now - s.ringEvT0 < 1000) busy = true;
    if (s.piece === 'r' && s.find) busy = true; // the thing to find breathes
    if (s.probe.dirty) { s.probe.dirty = false; if (s.probe.on && !s.edit && !A.on) probeFormula(); }
    draw(now);
    if (busy) need();
  }
  function spawnFly(now) { var s = S, i; if (s.piece !== 't') return; for (i = 0; i < s.fly.length; i++) if (!s.fly[i].on) { s.fly[i].on = true; s.fly[i].t0 = now; return; } }

  function sector(ctx, cx, cy, r, a0, span) { // from a0, anticlockwise by span (degrees, world: y up)
    ctx.beginPath(); ctx.moveTo(cx, cy);
    if (span >= 360) { ctx.arc(cx, cy, r, 0, TAU); }
    else { ctx.arc(cx, cy, r, -a0 * D2R, -(a0 + span) * D2R, true); ctx.closePath(); }
  }
  function arcOnly(ctx, cx, cy, r, a0, span) { ctx.beginPath(); if (span >= 360) ctx.arc(cx, cy, r, 0, TAU); else ctx.arc(cx, cy, r, -a0 * D2R, -(a0 + span) * D2R, true); }
  function label(ctx, text, x, y, color, W, H) { // 24 px, on a dark plate so it reads over stars
    var w = ctx.measureText(text).width + 12; x = clamp(x, w / 2 + 2, W - w / 2 - 2); y = clamp(y, 16, H - 16);
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(x - w / 2, y - 15, w, 30);
    ctx.fillStyle = '#fff'; ctx.fillText(text, x, y + 1);
  }
  var RSTEP = [1, 2, 5]; var RLBL = {};
  function ringLabel(v) { var t = RLBL[v]; if (!t) { t = RLBL[v] = commas(String(v)); } return t; }

  function draw(now) {
    var s = S, ctx = s.ctx, W = s.W, H = s.H, cx = s.cx, cy = s.cy, Rp = s.Rp, vs = s.vs, R = s.rule, D = s.D, A = s.A, piece = s.piece;
    var i, a, r, n = s.cnt, K = s.K, Td = s.Tdeg, started = A.on && now >= A.t0, jumping = started && A.type === 'jump', stepping = started && A.type === 'step';
    if (A.on && !started && A.type === 'jump') jumping = true;
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    var ga = s.fade; ctx.globalAlpha = ga; ctx.lineCap = 'butt';
    ctx.font = '400 24px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // rim, ticks every 30 degrees, the zero line at 3 o'clock
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,255,255,0.30)'; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,255,255,0.55)'; ctx.beginPath();
    for (i = 0; i < 12; i++) { a = i * 30 * D2R; var len = i % 3 === 0 ? 14 : 8, co = Math.cos(a), si = Math.sin(a); ctx.moveTo(cx + co * (Rp - len), cy - si * (Rp - len)); ctx.lineTo(cx + co * Rp, cy - si * Rp); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,255,255,0.42)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp + 8, cy); ctx.stroke();

    // where the selected dot is right now (riding the arm while it swings)
    var selTh = s.selTh, selR = s.selR, armDeg = selTh, remDeg = selTh, travel = false;
    if (stepping) { armDeg = s.CT[1] + D.e * Td; remDeg = armDeg % 360; if (A.dir > 0) { travel = true; selTh = armDeg; selR = A.rLo + (A.rHi - A.rLo) * D.e; } }
    else if (jumping) { armDeg = remDeg = selTh * s.J; travel = true; selR = selR * (0.35 + 0.65 * s.J); selTh = armDeg; }
    var selX = cx + Math.cos(selTh * D2R) * selR * vs, selY = cy - Math.sin(selTh * D2R) * selR * vs;
    var m = s.morph < 1 ? easeIO(s.morph) : 1;
    if (m < 1 && s.selIdx >= 0) { // the selected dot mid re-flow
      var px0 = s.PX[s.selIdx], py0 = s.PY[s.selIdx], x1 = s.SX[s.selIdx], y1 = s.SY[s.selIdx];
      var a0 = Math.atan2(py0, px0), a1 = Math.atan2(y1, x1), da = a1 - a0; if (da > Math.PI) da -= TAU; if (da < -Math.PI) da += TAU;
      var rr = Math.hypot(px0, py0) + (Math.hypot(x1, y1) - Math.hypot(px0, py0)) * m, aa = a0 + da * m;
      selX = cx + Math.cos(aa) * rr * vs; selY = cy - Math.sin(aa) * rr * vs; selR = rr; armDeg = remDeg = aa / D2R; if (remDeg < 0) remDeg += 360;
    }
    var showDot = K >= R.start || travel || s.kx !== K;

    // rings of whole-number distance. Their numbers re-label as the space stretches: 1, 2, 3 ... 10, 20, 30 ... 100, 200 ...
    var distPiece = piece === 'r' || piece === 'k';
    if (!s.band || piece !== 'r') {
      var stp = 1, g2 = 0, want = 44 / vs; while (stp < want && g2 < 60) { g2++; stp = RSTEP[g2 % 3] * Math.pow(10, Math.floor(g2 / 3)); }
      var unit = vs >= 7 ? 1 : stp;
      ctx.strokeStyle = distPiece ? 'rgba(0,255,255,0.22)' : 'rgba(0,255,255,0.13)'; ctx.lineWidth = 1; ctx.beginPath();
      for (i = 1; i <= 200; i++) { r = i * unit * vs; if (r >= Rp - 2) break; ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); }
      ctx.stroke();
      if (distPiece) {
        // each ring fills as its dots arrive: ring n begins at key n x n and holds 2n + 1 dots
        if (R.rad === 'sqrt' && s.N > 0 && vs >= 7 && !(s.find && piece === 'r')) {
          var last = R.start + s.N - 1, nOut = ringOf(last), nn, lo2, hi2, fr;
          ctx.lineWidth = 2;
          for (i = 0; i < 40; i++) {
            nn = nOut - i; if (nn < 1) break; r = nn * vs; if (r >= Rp + 40) continue;
            lo2 = Math.max(nn * nn, R.start); hi2 = Math.min(nn * nn + 2 * nn, last); fr = Math.max(0, hi2 - lo2 + 1) / (2 * nn + 1);
            ctx.strokeStyle = fr >= 1 ? 'rgba(0,255,255,0.32)' : 'rgba(0,255,255,0.75)';
            arcOnly(ctx, cx, cy, r, 0, fr * 360); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(0,255,255,0.85)';
        for (i = 1; i <= 12; i++) { r = i * stp * vs; if (r >= Rp - 14) break; label(ctx, ringLabel(i * stp), cx + r, cy + 19, 'rgba(0,255,255,0.9)', W, H); }
      }
    } else { // the band each key owns
      var kk = stepping ? (s.chTop - 1 + D.e) : K, r0 = bandEdge(R, kk - 0.5) * vs, r1 = bandEdge(R, kk + 0.5) * vs, prev;
      ctx.strokeStyle = 'rgba(0,255,255,0.20)'; ctx.lineWidth = 1; ctx.beginPath(); prev = r0;
      for (i = 1; i <= 48; i++) { if (K - 0.5 - i < -1) break; r = bandEdge(R, K - 0.5 - i) * vs; if (prev - r < 3 || r <= 0) break; ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); prev = r; }
      prev = r1;
      for (i = 1; i <= 48; i++) { r = bandEdge(R, K + 0.5 + i) * vs; if (r - prev < 3 || r > Rp) break; ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); prev = r; }
      ctx.stroke();
      if (r1 - r0 < 1.6) { ctx.strokeStyle = 'rgba(0,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, (r0 + r1) / 2, 0, TAU); ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(0,255,255,0.34)'; ctx.beginPath(); ctx.arc(cx, cy, r1, 0, TAU, false); ctx.arc(cx, cy, r0, TAU, 0, true); ctx.fill(); }
    }
    // a new ring starting
    var rv = now - s.ringEvT0;
    if (rv < 1000) { ctx.globalAlpha = ga * (1 - rv / 1000); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2 + 4 * (1 - rv / 1000); ctx.beginPath(); ctx.arc(cx, cy, s.ringEvN * vs, 0, TAU); ctx.stroke(); ctx.globalAlpha = ga; }

    // the thing to find: a glowing band at a distance; type the number whose square root reaches it
    if (piece === 'r' && s.find && !s.band) {
      var tr = s.tgt.r * vs, tw = s.tgt.w * vs, pul = 0.5 + 0.5 * Math.sin(now / 420), gl = now - s.glowT0 < 700 ? 0.4 : 0;
      ctx.strokeStyle = '#00ffff'; ctx.globalAlpha = ga * (0.10 + 0.07 * pul + gl * 0.5); ctx.lineWidth = tw * 2 + 14; ctx.beginPath(); ctx.arc(cx, cy, tr, 0, TAU); ctx.stroke(); // a soft halo so a thin band can be seen
      ctx.globalAlpha = ga * (0.38 + 0.2 * pul + gl); ctx.lineWidth = Math.max(2, tw * 2); ctx.beginPath(); ctx.arc(cx, cy, tr, 0, TAU); ctx.stroke(); // the band itself, at its true width
      ctx.globalAlpha = ga * 0.5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
      for (i = 0; i < s.nTries && i < 8; i++) { ctx.beginPath(); ctx.arc(cx + Math.cos(s.tries[i * 2 + 1] * D2R) * s.tries[i * 2] * vs, cy - Math.sin(s.tries[i * 2 + 1] * D2R) * s.tries[i * 2] * vs, 6, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = ga;
    }

    // the wedges: every key is one more equal turn. Ghosts behind, the newest in amber.
    if (piece === 't' && D.has && m >= 1) {
      var wa = s.wedgeA * ga, gapPx = Math.abs(s.CR[0] - s.CR[1]) * vs, G = gapPx >= 1.2 ? 9 : 0;
      ctx.lineWidth = 2;
      for (i = Math.min(G, s.chN - 2); i >= 1; i--) { // key chTop - i: from the dot before it, round by one turn
        r = s.CR[i] * vs; if (r < 1) continue; a = s.CT[i + 1];
        if (i <= 3) { ctx.globalAlpha = wa; ctx.fillStyle = i === 1 ? 'rgba(255,176,0,0.10)' : i === 2 ? 'rgba(255,176,0,0.06)' : 'rgba(255,176,0,0.035)'; sector(ctx, cx, cy, r, a, Td); ctx.fill(); }
        ctx.globalAlpha = wa * Math.max(0.12, 0.62 - i * 0.06); ctx.strokeStyle = '#ffb000'; arcOnly(ctx, cx, cy, r, a, Td); ctx.stroke();
      }
      ctx.globalAlpha = wa;
      r = (stepping ? A.rLo + (A.rHi - A.rLo) * D.e : s.CR[0]) * vs; a = s.CT[1];
      var span = (stepping ? D.e : 1) * Td;
      if (r >= 1 && span > 0) {
        ctx.fillStyle = 'rgba(255,176,0,0.26)'; sector(ctx, cx, cy, r, a, span); ctx.fill();
        ctx.strokeStyle = '#ffb000'; ctx.lineWidth = 3; arcOnly(ctx, cx, cy, r, a, span); ctx.stroke();
        ctx.lineWidth = 1.5; ctx.globalAlpha = wa * 0.7; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a * D2R) * r, cy - Math.sin(a * D2R) * r); ctx.stroke();
      }
      ctx.globalAlpha = ga;
    }

    // what is left after the whole circles: the green arc along the rim, and the arm
    var ax = Math.cos(armDeg * D2R), ay = Math.sin(armDeg * D2R);
    if (piece === 't') {
      if (remDeg > 0.01) { ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4; arcOnly(ctx, cx, cy, Rp, 0, remDeg); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,176,0,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ax * Rp, cy - ay * Rp); ctx.stroke();
      ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(cx + ax * Rp, cy - ay * Rp, 5, 0, TAU); ctx.fill();
    }

    // the square on the radius: its side is r, its area is the number under the root
    if (piece === 'r' && showDot && !s.band) {
      var ux = selX - cx, uy = selY - cy, qx = -uy, qy = ux; if (qy < 0) { qx = -qx; qy = -qy; } // keep the square on the lower side, clear of the top edge
      ctx.fillStyle = 'rgba(0,255,255,0.10)'; ctx.strokeStyle = 'rgba(0,255,255,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(selX, selY); ctx.lineTo(selX + qx, selY + qy); ctx.lineTo(cx + qx, cy + qy); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (Math.hypot(ux, uy) > 54) label(ctx, s.lblArea, cx + (ux + qx) / 2, cy + (uy + qy) / 2, '#00ffff', W, H);
    }
    // across and up: the triangle under the dot
    if (piece === 'x' && showDot) {
      ctx.lineWidth = 3; ctx.strokeStyle = '#ffb000'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(selX, cy); ctx.lineTo(selX, selY); ctx.stroke();
      ctx.fillStyle = 'rgba(255,176,0,0.10)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(selX, cy); ctx.lineTo(selX, selY); ctx.closePath(); ctx.fill();
    }

    // the dots
    var rDot = clamp(Rp * 0.32 / Math.sqrt(Math.max(1, n)), 1.6, 9), hr = rDot * 2.6, spr = s.sprC;
    var tiny = rDot < 2.2 && n > 600, pour = s.pourOn, pu = pour ? (now - s.pourT0) / 450 : 1, pspan = Math.max(1, R.start + s.N - s.pourFrom);
    var selKeyIdx = s.selIdx, x, y, k, solo = piece === 'r' && s.find && !s.band, ga0 = ga;
    if (solo) ga = ga * 0.16;
    ctx.globalAlpha = ga; ctx.fillStyle = '#00ffff';
    for (i = 0; i < n; i++) {
      if (i === selKeyIdx) continue;
      if (m < 1) {
        var p0x = s.PX[i], p0y = s.PY[i], q1x = s.SX[i], q1y = s.SY[i], b0 = Math.atan2(p0y, p0x), b1 = Math.atan2(q1y, q1x), db = b1 - b0;
        if (db > Math.PI) db -= TAU; if (db < -Math.PI) db += TAU;
        var h0 = Math.hypot(p0x, p0y), hh = h0 + (Math.hypot(q1x, q1y) - h0) * m, bb = b0 + db * m;
        x = cx + Math.cos(bb) * hh * vs; y = cy - Math.sin(bb) * hh * vs;
      } else { x = cx + s.SX[i] * vs; y = cy - s.SY[i] * vs; }
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
      if (pour) { k = s.KS[i]; if (k >= s.pourFrom) { var pa = clamp((pu * 1.4 - (k - s.pourFrom) / pspan) * 4, 0, 1); if (pa <= 0) continue; ctx.globalAlpha = ga * pa; } else ctx.globalAlpha = ga; }
      if (tiny) ctx.fillRect(x - rDot, y - rDot, rDot * 2, rDot * 2); else ctx.drawImage(spr, x - hr, y - hr, hr * 2, hr * 2);
    }
    ga = ga0; ctx.globalAlpha = ga;

    // the distance: one line from the centre to the selected dot
    if (showDot) {
      ctx.strokeStyle = '#00ffff'; ctx.lineWidth = piece === 'r' ? 4 : 2; ctx.globalAlpha = ga * (piece === 'r' || piece === 'x' ? 1 : 0.7); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(selX, selY); ctx.stroke(); ctx.globalAlpha = ga;
    }
    ctx.fillStyle = 'rgba(0,255,255,0.9)'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TAU); ctx.fill();
    // the selected dot, amber
    var lf = now - s.landT0, pop = lf < 300 ? 1 + 0.9 * (1 - lf / 300) : 1, sr = Math.max(rDot, 5) * 2.6 * pop;
    if (showDot && piece === 'r' && s.find) {
      var cl = 1 / (1 + Math.abs(s.selR - s.tgt.r) / Math.max(s.tgt.w * 4, 0.05)), wr = sr * (1 + 1.1 * cl);
      ctx.globalAlpha = ga * (0.1 + 0.7 * cl); ctx.drawImage(s.sprA, selX - wr, selY - wr, wr * 2, wr * 2); ctx.globalAlpha = ga;
    }
    if (showDot) ctx.drawImage(s.sprA, selX - sr, selY - sr, sr * 2, sr * 2);

    // key numbers on the dots while they are few, so the order of placement can be read
    var few = n <= 64 && Rp * 1.4 / Math.sqrt(Math.max(1, n)) >= 50 && m >= 1;
    if (few) {
      for (i = 0; i < n; i++) {
        k = s.KS[i]; if (k > 99) continue; var isSel = i === selKeyIdx; if (solo && !isSel) continue; if (isSel) { if (s.kx !== K) continue; x = selX; y = selY; } else { x = cx + s.SX[i] * vs; y = cy - s.SY[i] * vs; }
        var ox = x - cx, oy = y - cy, ol = Math.hypot(ox, oy) || 1, off = (isSel ? Math.max(rDot, 5) : rDot) + 17;
        ctx.fillStyle = isSel ? '#ffffff' : 'rgba(255,255,255,0.66)';
        ctx.fillText(LABELS[k], x + ox / ol * off, y + oy / ol * off + 1);
      }
    }
    // the selected dot's numbers, on the drawing
    if (piece === 't' && (K > 0 || travel)) {
      var lr = Rp - 26, tw3 = ctx.measureText(s.lblRem).width / 2 + 12, back = Math.min(remDeg, (tw3 / lr) / D2R), la = (armDeg - back) * D2R;
      label(ctx, s.lblRem, cx + Math.cos(la) * lr, cy - Math.sin(la) * lr, '#00ffff', W, H);
    }
    if (piece === 'r' && showDot) {
      var mx = (cx + selX) / 2, my = (cy + selY) / 2, nx = -(selY - cy), ny = selX - cx, nl = Math.hypot(nx, ny);
      if (piece === 'r' && ny > 0) { nx = -nx; ny = -ny; } // the square is below; the length reads above
      if (nl > 44) label(ctx, s.lblDist, mx + nx / nl * 22, my + ny / nl * 22, '#00ffff', W, H);
    }
    if (piece === 'x' && showDot) {
      if (Math.abs(selX - cx) > 40) label(ctx, s.lblX, (cx + selX) / 2, cy + (selY < cy ? 20 : -20), '#ffb000', W, H);
      if (Math.abs(selY - cy) > 24) label(ctx, s.lblY, selX + (selX < cx ? -1 : 1) * (ctx.measureText(s.lblY).width / 2 + 14), (cy + selY) / 2, '#ffb000', W, H);
    }

    // whole circles: each time the arm passes the zero line a ring leaves the rim and drops onto the stack
    var sx = s.stackX, sy = s.stackY;
    if (piece === 't') {
      var cnt = (stepping ? (D.cross ? A.FH.nNum : A.FL.nNum) : s.stackNum), str = stepping ? (D.cross ? A.FH.nStr : A.FL.nStr) : s.stackStr;
      var inflight = 0; for (i = 0; i < s.fly.length; i++) if (s.fly[i].on) inflight++;
      ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 3; ctx.textAlign = 'left'; ctx.fillStyle = '#00ffff';
      var shown = cnt <= 6 ? LABELS[Math.max(0, cnt - inflight)] : str, tw2 = ctx.measureText(shown).width, ringsN = cnt <= 6 ? Math.max(1, cnt - inflight) : 1, rx0 = sx - 12 + tw2 + 20;
      ctx.fillStyle = '#fff'; ctx.fillText(shown, sx - 12, sy + 1); ctx.textAlign = 'center';
      if (cnt - inflight <= 0 && cnt <= 6) ctx.globalAlpha = ga * 0.35;
      for (i = 0; i < ringsN; i++) { ctx.beginPath(); ctx.arc(rx0 + i * 15, sy, 12, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = ga;
      for (i = 0; i < s.fly.length; i++) if (s.fly[i].on) {
        var fu = easeIO(clamp((now - s.fly[i].t0) / 650, 0, 1)), slot = cnt > 6 ? 0 : Math.max(0, cnt - 1);
        var tx = rx0 + slot * 15, fx = cx + (tx - cx) * fu, fy = cy + (sy - cy) * fu, fr2 = Rp + (12 - Rp) * fu;
        ctx.globalAlpha = ga * (0.55 + 0.45 * fu); ctx.lineWidth = 3 + 2 * (1 - fu); ctx.beginPath(); ctx.arc(fx, fy, fr2, 0, TAU); ctx.stroke(); ctx.globalAlpha = ga;
      }
    }
    // a small lit mark for each thing found
    if (s.marks > 0) {
      ctx.fillStyle = '#ffb000'; ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.fillText(s.scoreStr, s.marksX - Math.min(s.marks, 8) * 18 - 2, sy + 1); ctx.textAlign = 'center';
      for (i = 0; i < s.marks && i < 8; i++) { var qx2 = s.marksX - i * 18, qy2 = sy; ctx.beginPath(); ctx.moveTo(qx2, qy2 - 7); ctx.lineTo(qx2 + 2.4, qy2 - 2.4); ctx.lineTo(qx2 + 7, qy2); ctx.lineTo(qx2 + 2.4, qy2 + 2.4); ctx.lineTo(qx2, qy2 + 7); ctx.lineTo(qx2 - 2.4, qy2 + 2.4); ctx.lineTo(qx2 - 7, qy2); ctx.lineTo(qx2 - 2.4, qy2 - 2.4); ctx.closePath(); ctx.fill(); }
    }
    // found: light
    var bt = now - s.burstT0;
    if (bt < 900) {
      var bu = bt / 900, br = 20 + 150 * easeO(bu);
      ctx.globalAlpha = ga * (1 - bu); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * (1 - bu) + 1; ctx.beginPath(); ctx.arc(s.burstX, s.burstY, br, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#ffb000'; ctx.lineWidth = 3; ctx.beginPath();
      for (i = 0; i < 16; i++) { a = i * TAU / 16 + 0.2; ctx.moveTo(s.burstX + Math.cos(a) * br * 0.55, s.burstY + Math.sin(a) * br * 0.55); ctx.lineTo(s.burstX + Math.cos(a) * br * 0.92, s.burstY + Math.sin(a) * br * 0.92); }
      ctx.stroke(); ctx.globalAlpha = ga;
    }

    // roaming: the nearest drawn key lights, with its number and how far away it is
    var P = s.probe;
    if (P.on && P.idx >= 0 && P.idx < n && !A.on) {
      var qx3 = cx + s.SX[P.idx] * vs, qy3 = cy - s.SY[P.idx] * vs;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(qx3, qy3, hr + 3, 0, TAU); ctx.stroke();
      ctx.globalAlpha = ga * 0.6; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(qx3, qy3); ctx.stroke(); ctx.globalAlpha = ga;
      if (!few) label(ctx, P.keyStr, qx3, qy3 - hr - 20, '#ffffff', W, H);
      if (Math.hypot(P.x - qx3, P.y - qy3) > 70) label(ctx, P.gap, (P.x + qx3) / 2, (P.y + qy3) / 2, 'rgba(255,255,255,0.8)', W, H);
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ what a test may ask the screen
  function debug() {
    var s = S; if (!s) return null;
    var stars = [], i, lim = Math.min(s.cnt, 40), R = s.rule;
    for (i = 0; i < lim; i++) stars.push({ key: s.KS[i], x: s.cx + s.SX[i] * s.vs, y: s.cy - s.SY[i] * s.vs });
    return {
      dragRule: s.dragRule, stripKey: s.F.sk.textContent, rootWorking: s.F.rSq.textContent, K: s.K, kx: s.kx, N: s.N, cnt: s.cnt, piece: s.piece, start: R.start, G: R.G, circle: R.W, rad: R.rad, off: R.off, live: isLive(R), exercise: isExercise(R),
      circles: s.form ? s.form.nStr : '', product: s.form ? s.form.prodStr : '', remainder: s.form ? s.form.mStr : '', m: s.form ? s.form.m : 0, deg: s.form ? s.form.degStr : '', diff: s.diff,
      selR: s.selR, selTh: s.selTh, rFit: s.rFit, animating: s.A.on, queue: s.queue, playing: s.playing, band: s.band, editing: !!s.edit,
      find: s.find, findIdx: s.findIdx, target: { r: s.tgt.r, w: s.tgt.w }, marks: s.marks, score: s.score, copied: s.copied || '', sheet: sheetText(), hash: hashText(),
      cx: s.cx, cy: s.cy, Rp: s.Rp, vs: s.vs, vsT: s.vsT, W: s.W, H: s.H, side: s.side, stackX: s.stackX, stackY: s.stackY, raf: !!s.raf, stars: stars,
      sel: { x: s.cx + Math.cos(s.selTh * D2R) * s.selR * s.vs, y: s.cy - Math.sin(s.selTh * D2R) * s.selR * s.vs }
    };
  }

  var api = { open: open, close: function () { close(); }, math: M, debug: debug, state: function () { return S ? exportState() : null; } };
  root.KGLesson = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    (root.KGModules = root.KGModules || []).push({
      id: 'lesson', label: 'KUIPER', sentence: 'The four formulas of the Kuiper',
      open: function (host, opts) { return open(host, opts); }, close: function () { close(); }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
