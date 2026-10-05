// play.js  LEARN THE KUIPER: place a dot with numbers.
// Rungs 1 DOT, 2 DOTS, RING, TIME on one canvas; FIND; the formula line, keypad and number chips (window.KGFormula).
// Plain script, no build step, works from file:// with no network. Loads in Node for the truth test (module.exports).
// Every position is the formula on screen: angle = 360 x MOD(number, d) / d degrees anticlockwise from 3 o'clock,
// x = distance x cos(angle), y = distance x sin(angle), y up on screen.
(function (root) {
  'use strict';

  // ------------------------------------------------------------------ the numbers of FIND, in one place.
  // window.KGPlayTuning (gpu/trillion/play-tuning.js, when it is there) replaces any of these; they are the defaults.
  var TUNING = {
    // target sizes, one level after another: a piece of a ring this many degrees wide and this deep
    levels: [
      { angleDeg: 30, distance: 1, digits: 0 },
      { angleDeg: 10, distance: 0.3, digits: 0 },
      { angleDeg: 3, distance: 0.1, digits: 0 },
      { angleDeg: 1, distance: 0.03, digits: 0 },
      { angleDeg: 0.1, distance: 0.01, digits: 1 },
      { angleDeg: 0.01, distance: 0.001, digits: 2 }
    ],
    equalArea: true,       // a target keeps the same area wherever it sits: wider in angle near the centre, narrower far out
    refDistance: 3,        // the distance at which a level is exactly angleDeg wide
    warmth: { curve: 'log', width: 1, steps: 0 },   // the light: 'log' (one step per ten times closer), 'inv' or 'exp'
    lights: 2,             // 2 = the dot warms and the target answers; 1 = the dot only
    typedPair: true,       // after exploring, two different numbers must be typed before a find is rewarded
    triesBand: [2, 4],     // found within this many typed tries: the biggest burst; the middle burst
    findOnOpen: true       // the first screen already has a target glowing
  };
  var LIMIT = 9007199254740991;
  var LIMIT_TEXT = 'THAT NUMBER IS TOO LARGE FOR THIS COMPUTER TO SHOW. THE REAL LIMIT HERE IS 9,007,199,254,740,991.';
  var FONT = '"Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif';
  var RAD = Math.PI / 180, TAU = Math.PI * 2;
  var CAP = 6000;                       // most dots drawn in one frame; larger counts draw a fair sample
  var PIPS = ['1 DOT', '2 DOTS', 'RING', 'TIME', 'KUIPER'];

  // ------------------------------------------------------------------ the maths (pure; used by the page and by the test)
  // MOD as a spreadsheet gives it: the result has the sign of the divisor, never -0.
  // circles = FLOOR(number / d), remainder = number - circles x d, 0 <= remainder < d. Decimals are worked as typed:
  // both numbers are scaled to whole numbers first when they are decimals of up to nine places (0.3 on a circle of
  // 0.1 leaves 0), so the binary form of a decimal never leaks into the remainder.
  var DM = { m: 0, q: 0 }, P10 = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];
  function divmod(a, c) {
    var k, s, A, C, ra, rc, m;
    if (Number.isSafeInteger(a) && Number.isSafeInteger(c) && c > 0) { var ba = BigInt(a), bc = BigInt(c), bm = ((ba % bc) + bc) % bc; DM.m = Number(bm); DM.q = Number((ba - bm) / bc); return DM; }
    for (k = 1; k < 10; k++) {
      s = P10[k]; A = a * s; C = c * s; ra = Math.round(A); rc = Math.round(C);
      if (Math.abs(A) > 9007199254740991 || C > 9007199254740991) break;
      if (Math.abs(A - ra) <= 4.5e-16 * Math.abs(A) && Math.abs(C - rc) <= 4.5e-16 * C && rc > 0) { m = ra % rc; if (m < 0) m += rc; DM.m = m / s + 0; DM.q = (ra - m) / rc + 0; return DM; }
    }
    m = a % c; if (m < 0) m += c; if (m >= c) m = 0;
    DM.m = m + 0; DM.q = Math.round((a - m) / c) + 0; return DM;
  }
  function ratio(v) {
    var t = String(v), z = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(t);
    if (!z) return null;
    var k = (z[3] || '').length - Number(z[4] || 0), n = BigInt(z[2] + (z[3] || '')) * (z[1] === '-' ? -1n : 1n);
    return k < 0 ? { n: n * 10n ** BigInt(-k), d: 1n } : { n: n, d: 10n ** BigInt(k) };
  }
  function addRat(a,b) { return { n: a.n*b.d+b.n*a.d, d:a.d*b.d }; }
  function mulRat(a,b) { return { n:a.n*b.n, d:a.d*b.d }; }
  function ratText(a) {
    var n=a.n, d=a.d, neg=n<0n, out; if(neg)n=-n;
    out=String(n/d); n%=d;
    if(n) { out+='.'; for(var i=0;n && i<340;i++) { n*=10n; out+=String(n/d); n%=d; } }
    return (neg?'-':'')+out;
  }
  function exact(p,n) {
    var a=ratio(p.start), c=ratio(p.mod), term={n:0n,d:1n};
    if(!a || !c || c.n<=0n)return null;
    if(p.rung>=2) { term=mulRat(ratio(n),ratio(p.turn)); a=addRat(a,term); }
    if(p.rung>=4) a=addRat(a,mulRat(ratio(p.t),ratio(p.speed)));
    var num=a.n*c.d, den=a.d*c.n, q=num/den; if(num%den<0n)q--;
    var rem={n:a.n*c.d-q*c.n*a.d,d:a.d*c.d};
    return {raw:ratText(a), q:String(q), m:ratText(rem), product:ratText(term)};
  }
  function mod(a, c) { return divmod(a, c).m; }
  // whole circles thrown away: circles x c + mod = a
  function circles(a, c) { return divmod(a, c).q; }
  function clean(v) { return v === 0 ? 0 : v; }

  var IN = { x: 0, y: 0, d: 0, deg: 0 };
  function r9(v) { return Math.round(v * 1e9) / 1e9; }
  var M = {
    mod: mod, circles: circles, divmod: divmod, exact: exact,
    // how many dots the formula on this rung places
    count: function (p) {
      if (p.rung <= 1) return 1; if (p.rung === 2) return 2;
      var n = Math.floor(p.count);
      if (p.rung >= 4) { var e = Math.floor(p.t * p.newDots); if (e > 0) n += e; }
      return n > 0 ? n : 0;
    },
    // the number inside MOD( ... ) for dot n
    raw: function (p, n) { var a = p.start; if (p.rung >= 2) a += n * p.turn; if (p.rung >= 4) a += p.t * p.speed; return a; },
    // distance never goes below 0: it stops at the centre
    dist: function (p, n) { var d = p.dist; if (p.rung >= 2) d += n * p.step; if (p.rung >= 4) d += p.t * p.grow; return d > 0 ? d : 0; },
    deg: function (p, n) {
      var raw=M.raw(p,n), product=p.rung>=2?n*p.turn:0, time=p.rung>=4?p.t*p.speed:0;
      if(Number.isSafeInteger(p.start) && Number.isSafeInteger(p.mod) &&
         (p.rung<2 || Number.isSafeInteger(n) && Number.isSafeInteger(p.turn) && Number.isSafeInteger(product)) &&
         (p.rung<4 || Number.isSafeInteger(p.t) && Number.isSafeInteger(p.speed) && Number.isSafeInteger(time)) &&
         Number.isSafeInteger(p.start+product) && Number.isSafeInteger(raw)) {
        var rem=raw%p.mod; if(rem<0)rem+=p.mod; return rem*(360/p.mod);
      }
      var e=exact(p,n); return (e ? Number(e.m) : mod(raw,p.mod)) * (360 / p.mod);
    },
    place: function (p, n, out) {
      var deg = M.deg(p, n), d = M.dist(p, n), r = deg * RAD;
      out.deg = deg; out.d = d; out.x = clean(d * Math.cos(r)); out.y = clean(d * Math.sin(r));
      return out;
    },
    // the drag inverse: which numbers put dot n exactly on the point (x, y). Dot 0 changes START and DISTANCE;
    // any later dot changes TURN and STEP. The angle moves the short way round from where the dot is now.
    inverse: function (p, n, x, y, out) {
      var d = Math.sqrt(x * x + y * y), deg = Math.atan2(y, x) / RAD; if (deg < 0) deg += 360;
      var u = deg * (p.mod / 360), A = M.raw(p, n), dl = u - mod(A, p.mod), h = p.mod / 2;
      if (dl > h) dl -= p.mod; else if (dl <= -h) dl += p.mod;
      if (d === 0) dl = 0;                                   // the centre has every angle: keep the one it had
      var tg = p.rung >= 4 ? p.t * p.grow : 0;
      out.start = p.start; out.dist = p.dist; out.turn = p.turn; out.step = p.step;
      if (n === 0 || p.rung < 2) { out.start = p.start + dl; out.dist = d - tg > 0 ? d - tg : 0; }
      else { out.turn = p.turn + dl / n; out.step = (d - p.dist - tg) / n; }
      return out;
    },
    // the six numbers of a point (x, y) on a circle of c steps. At the centre the angle is the one handed in.
    six: function (x, y, c, keepDeg, out) {
      var d = Math.sqrt(x * x + y * y), deg;
      if (d === 0) deg = keepDeg || 0; else { deg = Math.atan2(y, x) / RAD; if (deg < 0) deg += 360; if (deg >= 360) deg = 0; }
      out.d = d; out.sq = d * d; out.area = Math.PI * d * d; out.deg = deg + 0; out.rem = deg * (c / 360) + 0; out.x = clean(x); out.y = clean(y);
      return out;
    },
    // type one of them: the point it gives. which: 'd','sq','area','deg','rem','x','y'; pt = {x, y, deg (kept angle)}.
    fromSix: function (which, v, pt, c, out) {
      var d = Math.sqrt(pt.x * pt.x + pt.y * pt.y), deg = d === 0 ? (pt.deg || 0) : Math.atan2(pt.y, pt.x) / RAD, x = pt.x, y = pt.y, polar = true;
      if (deg < 0) deg += 360;
      if (which === 'd') d = v < 0 ? 0 : v;
      else if (which === 'sq') d = v < 0 ? 0 : Math.sqrt(v);
      else if (which === 'area') d = v < 0 ? 0 : Math.sqrt(v / Math.PI);
      else if (which === 'deg') deg = mod(v, 360);
      else if (which === 'rem') deg = mod(v, c) * (360 / c);
      else { polar = false; if (which === 'x') x = v; else y = v; }
      if (polar) { x = clean(d * Math.cos(deg * RAD)); y = clean(d * Math.sin(deg * RAD)); }
      else { d = Math.sqrt(x * x + y * y); if (d > 0) { deg = Math.atan2(y, x) / RAD; if (deg < 0) deg += 360; } }
      out.x = x; out.y = y; out.d = d; out.deg = deg + 0;
      return out;
    },
    // is a point inside a target? Tested in the target's own coordinates, lower edge in, upper edge out.
    // polar target: a piece of a ring, centre (deg, d), widths (wdeg, wd); pt = {deg, d}. square: centre (x, y), side s; pt = {x, y}.
    inside: function (tg, pt) {
      // differences are taken to nine decimal places, so a typed decimal exactly on an edge is judged as the decimal it is
      if (tg.kind === 'xy') { var dx = r9(pt.x - tg.x), dy = r9(pt.y - tg.y), h = r9(tg.s / 2); return dx >= -h && dx < h && dy >= -h && dy < h; }
      var da = r9(mod(r9(mod(pt.deg, 360) - tg.deg + 180), 360) - 180), dr = r9(pt.d - tg.d), ha = r9(tg.wdeg / 2), hd = r9(tg.wd / 2);
      return da >= -ha && da < ha && dr >= -hd && dr < hd;
    },
    insideAt: function (tg, x, y) { IN.x = x; IN.y = y; IN.d = Math.sqrt(x * x + y * y); IN.deg = Math.atan2(y, x) / RAD; if (IN.deg < 0) IN.deg += 360; return M.inside(tg, IN); },
    // how many different places n equal turns land on (step 0): the smallest count that already closes, or n
    places: function (n, turn, c) {
      var k, lim = n > 4000 ? 4000 : n;
      for (k = 1; k <= lim; k++) if (exact({rung:2,start:0,turn:turn,mod:c},k).m === '0') return k;
      return n;
    }
  };

  // ------------------------------------------------------------------ numbers as text
  function parseOne(s) { return /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s) ? Number(s) : NaN; }
  // text to a number: digits, sign, decimal point, thousands commas, one fraction bar (360/12). Anything else is NaN.
  function parse(text) {
    var s = String(text == null ? '' : text).replace(/[\s ]/g, '').replace(/−/g, '-');
    if (/^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(s)) s = s.replace(/,/g, '');
    else if (/^[+-]?\d*,\d+$/.test(s)) s = s.replace(',', '.');
    var i = s.indexOf('/');
    if (i > 0) { var p = parseOne(s.slice(0, i)), q = parseOne(s.slice(i + 1)); return (p !== p || q !== q || q === 0) ? NaN : p / q; }
    return parseOne(s);
  }
  function group(s) { var i = s.indexOf('.'), a = i < 0 ? s : s.slice(0, i), b = i < 0 ? '' : s.slice(i); return a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + b; }
  // a number as plain digits: never an exponent, never -0, never NaN. dec = most decimals; fixed keeps trailing zeros.
  function plain(v, dec, fixed) {
    if (v !== v || v === Infinity || v === -Infinity) return '0';
    if (dec == null) dec = 4;
    var a = Math.abs(v); if (a > LIMIT) a = LIMIT;
    var s = a.toFixed(dec);
    if (!fixed && s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return (v < 0 && /[1-9]/.test(s) ? '-' : '') + s;
  }
  function fmt(v, dec, fixed) { var s = plain(v, dec, fixed), neg = s.charAt(0) === '-'; if (neg) s = s.slice(1); return (neg ? '-' : '') + (s.replace(/\..*/, '').length > 4 ? group(s) : s); }
  function decimalsOf(v) { var s = plain(v, 4), i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  // the largest 1, 2, 5 x 10^k that is not above v; and the smallest that is not below v
  function niceDown(v) { if (!(v > 0)) return 1; var k = Math.pow(10, Math.floor(Math.log10(v))), f = v / k; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * k; }
  function niceUp(v) { if (!(v > 0)) return 1; var k = Math.pow(10, Math.floor(Math.log10(v))), f = v / k; return (f <= 1.0000001 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * k; }
  function stepDec(q) { var d = Math.ceil(-Math.log10(q) - 1e-9); return d < 0 ? 0 : d > 9 ? 9 : d; }
  function snapTo(v, q) { return Number((Math.round(v / q) * q).toFixed(stepDec(q))) + 0; }
  // a value checked against a field: null = not acceptable (the last good value stays); lim = it was above the real limit
  function check(cfg, v) {
    if (v !== v) return null;
    if (cfg.int && isFinite(v) && !Number.isInteger(v)) return null;
    if (cfg.min != null && v < cfg.min) return null;
    if (cfg.pos && !(v > 0)) return null;
    var lim = false;
    if (v > LIMIT) { v = LIMIT; lim = true; } else if (v < -LIMIT) { v = -LIMIT; lim = true; }
    return { v: v + 0, lim: lim };
  }

  // ------------------------------------------------------------------ the look (one style block, added once)
  var CSS = '' +
    '.kgf-root{position:absolute;left:0;top:0;right:0;bottom:0;background:#000;overflow:hidden;font-family:' + FONT + ';font-weight:400;color:#fff;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent;font-variant-numeric:tabular-nums}' +
    '.kgf-root canvas.kgf-cv{position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;display:block}' +
    '.kgf-block{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;font:400 28px/1.32 ' + FONT + ';font-variant-numeric:tabular-nums;color:#fff;touch-action:none;pointer-events:none}' +
    '.kgf-line{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.24em;padding-left:1.1em}.kgf-line>.kgf-term:first-child{margin-left:-1.1em}' +
    '.kgf-term{display:inline-flex;align-items:baseline;gap:.2em;white-space:nowrap}' +
    '.kgf-w{color:rgba(255,255,255,.7);font-size:24px;letter-spacing:.01em}' +
    '.kgf-op{color:rgba(255,255,255,.62)}' +
    '.kgf-n{color:#ffb000}' +
    '.kgf-out{color:#fff}' +
    '.kgf-num{position:relative;display:inline-flex;align-items:baseline;justify-content:center;padding:0 .34em;min-width:.7em;color:#0ff;cursor:ns-resize;touch-action:none;pointer-events:auto;border-radius:5px}' +
    '.kgf-num::before,.kgf-num::after{content:"";position:absolute;top:.2em;bottom:.14em;width:.2em;border:2px solid currentColor;opacity:.6;box-sizing:border-box}' +
    '.kgf-num::before{left:0;border-right:0}.kgf-num::after{right:0;border-left:0}' +
    '.kgf-hit{position:absolute;left:-4px;right:-4px;top:-7px;bottom:-7px}' +
    '.kgf-lab{font-size:24px;color:rgba(255,255,255,.62);margin-right:.3em}' +
    '.kgf-num.kgf-edit{color:#ffb000;background:rgba(255,176,0,.14)}' +
    '.kgf-num.kgf-edit .kgf-v::after{content:"";display:inline-block;width:2px;height:.86em;background:#ffb000;margin-left:2px;vertical-align:-.08em;animation:kgf-blink 1s steps(2,start) infinite}' +
    '@keyframes kgf-blink{to{visibility:hidden}}' +
    '.kgf-eq{position:relative;color:#0ff;cursor:pointer;pointer-events:auto;padding:0 .12em}' +
    '.kgf-eq .kgf-hit{left:-12px;right:-12px}' +
    '.kgf-pulse{animation:kgf-pulse .9s ease-out 1}' +
    '@keyframes kgf-pulse{0%{transform:scale(1)}35%{transform:scale(1.4);text-shadow:none}100%{transform:scale(1)}}' +
    '.kgf-chips{position:absolute;display:flex;align-items:flex-end;gap:14px;font:400 28px/1.2 ' + FONT + ';font-variant-numeric:tabular-nums;pointer-events:none;box-sizing:border-box}' +
    '.kgf-chip{display:flex;flex-direction:column;align-items:flex-start;pointer-events:auto}' +
    '.kgf-cl{font-size:24px;line-height:1.1;color:rgba(255,255,255,.55);white-space:nowrap}' +
    '.kgf-dots{width:56px;height:56px;border:1.5px solid rgba(0,255,255,.4);border-radius:10px;background:none;color:rgba(0,255,255,.85);font:400 28px/1 ' + FONT + ';pointer-events:auto;cursor:pointer;padding:0 0 12px 0;margin-left:auto}' +
    '.kgf-dots.on{background:rgba(0,255,255,.16)}' +
    '.kgf-more{position:absolute;right:0;bottom:100%;margin-bottom:8px;display:none;grid-template-columns:auto auto;gap:10px 22px;padding:12px 14px;background:rgba(0,0,0,.9);border:1.5px solid rgba(0,255,255,.35);border-radius:12px;pointer-events:auto}' +
    '.kgf-more.on{display:grid}' +
    '.kgf-pad{position:absolute;display:none;box-sizing:border-box;padding:6px;gap:6px;background:#000;touch-action:none;flex-direction:column;z-index:6}' +
    '.kgf-pad.on{display:flex}.kgf-pad.row{flex-direction:row;align-items:stretch}' +
    '.kgf-digits{display:flex;justify-content:center;align-items:stretch;gap:2px;height:104px;flex:none}' +
    '.kgf-pad.row .kgf-digits{height:auto;min-width:250px}' +
    '.kgf-dcol{display:flex;flex-direction:column;align-items:stretch;flex:0 1 54px;min-width:30px}' +
    '.kgf-dsep{flex:none;align-self:center;font:400 30px/1 ' + FONT + ';color:#ffb000;width:8px;text-align:center}' +
    '.kgf-dbtn{flex:1;border:0;background:none;padding:0;margin:0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(0,255,255,.8);touch-action:none}' +
    '.kgf-dbtn svg{width:26px;height:16px;display:block}.kgf-dbtn.on{color:#fff}' +
    '.kgf-dval{font:400 30px/36px ' + FONT + ';font-variant-numeric:tabular-nums;color:#ffb000;text-align:center;height:36px;flex:none}' +
    '.kgf-dval.z{color:rgba(255,176,0,.4)}' +
    '.kgf-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;flex:1}' +
    '.kgf-pad.row .kgf-keys{grid-template-columns:repeat(8,1fr)}' +
    '.kgf-key{height:56px;min-width:0;border:1.5px solid rgba(0,255,255,.4);border-radius:10px;background:transparent;color:#fff;font:400 28px/1 ' + FONT + ';padding:0;margin:0;cursor:pointer;touch-action:none;display:flex;align-items:center;justify-content:center}' +
    '.kgf-key svg{width:30px;height:30px}.kgf-key.on{background:rgba(0,255,255,.28)}' +
    '.kgf-limit{position:absolute;left:12px;right:12px;display:none;font:400 24px/1.25 ' + FONT + ';color:#ffb000;text-align:center;pointer-events:none;z-index:7;text-shadow:none}' +
    '.kgf-limit.on{display:block}' +
    '.kgf-pips{position:absolute;display:flex;align-items:center;height:44px;z-index:3}' +
    '.kgf-pip{height:44px;min-width:26px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;color:rgba(102,204,255,.8);touch-action:manipulation}' +
    '.kgf-pip i{width:12px;height:12px;border-radius:50%;border:2px solid rgba(102,204,255,.85);box-sizing:border-box;flex:none}' +
    '.kgf-pip b{margin:0 10px 0 6px;font-weight:400}' +
    '.kgf-pip.on{color:#ffb000;cursor:default}.kgf-pip.on i{background:#ffb000;border-color:#ffb000}' +
    '.kgf-pip.dim{opacity:.3;cursor:default}' +
    '.kgf-icons{position:absolute;display:flex;z-index:3}' +
    '.kgf-ic{width:44px;height:44px;background:none;border:0;padding:0;margin:0;cursor:pointer;color:rgba(255,255,255,.72);display:inline-flex;align-items:center;justify-content:center;touch-action:manipulation}' +
    '.kgf-ic svg{width:28px;height:28px;display:block}.kgf-ic.off{color:rgba(255,255,255,.3)}.kgf-ic.lit{color:#ffb000}' +
    '.kgf-time{position:absolute;display:none;align-items:center;gap:6px;height:48px;box-sizing:border-box}' +
    '.kgf-time.on{display:flex}.kgf-time canvas{flex:1;height:48px;min-width:0;touch-action:none;cursor:ew-resize}' +
    /* the joystick: the simulator's own (prospect/snippets/joystick.js), restyled for the bottom left */
    '.kgf-joy{position:absolute;z-index:4;width:120px;height:120px;border-radius:50%;background:rgba(156,219,255,.04);border:1px solid rgba(156,219,255,.35);touch-action:none;display:none}' +
    '.kgf-joy.on{display:block}' +
    '.kgf-knob{position:absolute;left:36px;top:36px;width:48px;height:48px;border-radius:50%;border:1px solid rgba(156,219,255,.5);background:rgba(156,219,255,.12);box-sizing:border-box}';
  CSS += '.kgf-root *{font-weight:400;text-shadow:none!important}' +
    '.kgf-root .kgf-num,.kgf-root .kgf-out,.kgf-root .kgf-n,.kgf-root .kgf-eq,.kgf-root .kgf-limit,.kgf-root .kgf-pip,.kgf-root .kgf-dval,.kgf-root .kgf-dsep,.kgf-root .kgf-dbtn{color:#fff!important}' +
    '.kgf-root .kgf-num{border:1px solid #fff;border-radius:0;padding:0 .2em;font-size:32px;background:#000}' +
    '.kgf-root .kgf-num::before,.kgf-root .kgf-num::after{display:none}' +
    '.kgf-root .kgf-num.kgf-edit{background:#000;border-bottom:3px solid #fff}' +
    '.kgf-root .kgf-num.kgf-edit .kgf-v::after{background:#fff}' +
    '.kgf-root .kgf-key,.kgf-root .kgf-dots,.kgf-root .kgf-more{border:1px solid #fff;border-radius:0;color:#fff;background:#000}' +
    '.kgf-root .kgf-key.on{background:#222}.kgf-root .kgf-pip i{border-color:#fff}.kgf-root .kgf-pip.on i{background:#fff}' +
    '.kgf-root .kgf-ic.lit{color:#fff}.kgf-root .kgf-digits{display:none}' +
    '.kgf-root .kgf-key{height:44px}.kgf-root .kgf-pad{padding:6px;gap:4px}' +
    '.kgf-root .kgf-block{overflow-x:auto}.kgf-root .kgf-num *{touch-action:none}' +
    '.kgf-root .kgf-line{row-gap:4px;margin:4px 0;flex-shrink:0}.kgf-root .kgf-term{flex-shrink:0}';
  CSS += '.kgf-working{position:absolute;color:rgba(255,255,255,.7);font:400 24px/32px ' + FONT + ';white-space:nowrap;overflow-x:auto;pointer-events:auto;touch-action:pan-x}' +
    '.kgf-root .kgf-block.rung-one .kgf-line{flex-wrap:nowrap}.kgf-root .kgf-key{color:#fff!important;border-color:#fff!important}';
  function css() {
    if (typeof document === 'undefined' || document.getElementById('kgf-style')) return;
    var st = document.createElement('style'); st.id = 'kgf-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  function E(tag, cls, text, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  var SVG = {
    up: '<svg viewBox="0 0 26 16"><path d="M3 13 L13 3 L23 13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 26 16"><path d="M3 3 L13 13 L23 3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg viewBox="0 0 30 30"><path d="M24 6 V17 H8 M13 11 L7 17 L13 23" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 30 30"><path d="M11 7 H26 V23 H11 L3 15 Z M15 11 L22 19 M22 11 L15 19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    x: '<svg viewBox="0 0 28 28"><path d="M6 6 L22 22 M22 6 L6 22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    note: '<svg viewBox="0 0 28 28"><path d="M4 11 H9 L15 5 V23 L9 17 H4 Z" fill="currentColor"/><path d="M19 10 Q22 14 19 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path class="s" style="display:none" d="M5 4 L24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 28 28"><path d="M14 2.5 L17.3 10.2 L25.6 10.9 L19.3 16.4 L21.2 24.5 L14 20.2 L6.8 24.5 L8.7 16.4 L2.4 10.9 L10.7 10.2 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    joy: '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="11" r="4.5" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 28 28"><path d="M8 5 L23 14 L8 23 Z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 28 28"><path d="M7 5 H12 V23 H7 Z M16 5 H21 V23 H16 Z" fill="currentColor"/></svg>'
  };

  // ------------------------------------------------------------------ the formula line, the chips and the keypad
  var probeFns = [];
  // create(host, opts): opts.onInput(id, value, how) with how = 'type' (keys or keypad), 'explore' (drag a number,
  // wheel, digit arrows) or 'restore' (Escape); opts.onEdit(id or null); opts.onEq(); opts.onLand(id).
  function create(host, opts) {
    css(); opts = opts || {};
    var F = { el: E('div', 'kgf-block', null, host), chipsEl: E('div', 'kgf-chips', null, host), padEl: E('div', 'kgf-pad', null, host), limitEl: E('div', 'kgf-limit', null, host) };
    var nums = {}, outs = {}, ed = null, drag = null, limT = 0, rep = 0, repT = 0, moreEl = null, dotsBtn = null, digN = -1, dead = false, padEv = null;
    F.workingEl = E('div', 'kgf-working', null, host);
    var digitsEl = E('div', 'kgf-digits', null, F.padEl), keysEl = E('div', 'kgf-keys', null, F.padEl);
    var KEYS = ['7', '8', '9', 'back', '4', '5', '6', 'C', '1', '2', '3', '-', '0', '.', '/', 'ok'];
    KEYS.forEach(function (k) {
      var b = E('button', 'kgf-key', null, keysEl); b.setAttribute('data-k', k); b.setAttribute('aria-label', k === 'back' ? 'backspace' : k === 'C' ? 'clear' : k === '-' ? 'minus' : k === 'ok' ? 'enter' : k);
      if (k === 'back') b.innerHTML = SVG.back; else if (k === 'ok') { b.innerHTML = SVG.ok; b.style.color = '#fff'; b.style.borderColor = '#fff'; } else b.textContent = k === '-' ? '−' : k;
    });

    function show(n) { n.vEl.textContent = ed && ed.n === n ? ed.buf : (n.txt || fmt(n.v, n.cfg.show == null ? 4 : n.cfg.show, n.cfg.fixed)); }
    function token(parent, p) {
      var cfg = p.cfg || {}, el = E('span', 'kgf-num', null, parent), n = nums[p.id];
      el.style.color = '#fff';
      el.setAttribute('data-id', p.id);
      if (cfg.label) E('span', 'kgf-lab', cfg.label, el);
      var v = E('span', 'kgf-v', '', el); E('span', 'kgf-hit', null, el);
      if (!n) n = nums[p.id] = { id: p.id, v: p.v == null ? 0 : p.v, txt: null };
      n.cfg = cfg; n.el = el; n.vEl = v; n.live = true;
      if (ed && ed.n === n) el.classList.add('kgf-edit');
      show(n);
      return n;
    }
    function part(parent, p) {
      if (typeof p === 'string') {
        var c = p === 'N' ? 'kgf-n' : /^[A-Z][A-Z ]*\(?$/.test(p) && p !== 'T' && p !== 'X' && p !== 'Y' ? 'kgf-w' : /^[A-Z]$/.test(p) ? 'kgf-w' : 'kgf-op';
        E('span', c, p, parent); return;
      }
      if (p.id) { token(parent, p); return; }
      if (p.out) { var o = E('span', 'kgf-out', outs[p.out] ? outs[p.out].text : '', parent); o.style.color = '#fff'; outs[p.out] = { el: o, text: o.textContent }; return; }
      if (p.eq) { var q = E('span', 'kgf-eq', '=', parent); E('span', 'kgf-hit', null, q); q.setAttribute('data-eq', '1'); }
    }
    function sweep() { var k; for (k in nums) if (!nums[k].live) { if (ed && ed.n === nums[k]) closeEditor(true); delete nums[k]; } }
    // lines = [ line, ... ]; line = [ term, ... ]; term = [ part, ... ]. A line wraps only between terms.
    F.setLines = function (lines) {
      var k; for (k in nums) if (!nums[k].chip) nums[k].live = false;
      for (k in outs) outs[k].el = null;
      F.el.textContent = '';
      lines.forEach(function (ln) { var L = E('div', 'kgf-line', null, F.el); ln.forEach(function (tm) { var T = E('span', 'kgf-term', null, L); tm.forEach(function (p) { part(T, p); }); }); });
      sweep();
    };
    // chips = [ {id, label, cfg, big}, ... ]: one row; the big ones stay, the rest open from the "..." chip
    F.setChips = function (chips) {
      var k; for (k in nums) if (nums[k].chip) nums[k].live = false;
      var wasOpen = moreEl && moreEl.classList.contains('on');
      F.chipsEl.textContent = '';
      var small = chips.filter(function (c) { return !c.big; });
      function chip(parent, c) { var w = E('div', 'kgf-chip', null, parent); E('span', 'kgf-cl', c.label, w); var n = token(w, c); n.chip = true; return w; }
      chips.forEach(function (c) { if (c.big) chip(F.chipsEl, c); });
      dotsBtn = moreEl = null;
      if (small.length) {
        dotsBtn = E('button', 'kgf-dots', '...', F.chipsEl); dotsBtn.setAttribute('aria-label', 'more numbers');
        moreEl = E('div', 'kgf-more' + (wasOpen ? ' on' : ''), null, F.chipsEl);
        small.forEach(function (c) { chip(moreEl, c); });
        if (wasOpen) dotsBtn.classList.add('on');
        dotsBtn.addEventListener('click', function () { F.more(!moreEl.classList.contains('on')); });
      }
      sweep();
    };
    F.more = function (on) { if (!moreEl) return; if (!on && ed && ed.n.el && moreEl.contains(ed.n.el)) closeEditor(true); moreEl.classList.toggle('on', !!on); dotsBtn.classList.toggle('on', !!on); if (opts.onMore) opts.onMore(!!on); };
    F.moreOpen = function () { return !!(moreEl && moreEl.classList.contains('on')); };
    // set a number from outside (a dragged dot, the clock): no callback. txt keeps a typed fraction on show.
    F.setValue = function (id, v, txt) {
      var n = nums[id]; if (!n) return;
      if (ed && ed.n === n) { if (Math.abs(v - n.v) <= 1e-9 * Math.max(1, Math.abs(v))) { n.v = v; return; } n.v = v; n.txt = null; ed.buf = plain(v, 6); ed.fresh = true; show(n); digits(); return; }
      if (n.v === v && n.txt === (txt || null) && n.vEl.textContent !== '') return;
      n.v = v; n.txt = txt || null; show(n);
    };
    F.setCfg = function (id, key, val) { var n = nums[id]; if (n && n.cfg[key] !== val) { n.cfg[key] = val; show(n); } };
    F.setText = function (key, text) { var o = outs[key]; if (!o) return; if (o.text !== text) { o.text = text; if (o.el) o.el.textContent = text; } };
    F.get = function (id) { return nums[id] ? nums[id].v : undefined; };
    F.txt = function (id) { return nums[id] ? nums[id].txt : null; };
    F.has = function (id) { return !!nums[id]; };
    F.editing = function () { return ed ? ed.n.id : null; };
    F.buffer = function () { return ed ? ed.buf : null; };
    F.pulse = function (id) {
      var el = nums[id] ? nums[id].el : id === '=' ? F.el.querySelector('.kgf-eq') : outs[id] ? outs[id].el : null; if (!el) return;
      el.classList.remove('kgf-pulse'); void el.offsetWidth; el.classList.add('kgf-pulse');
    };
    F.limit = function () { F.limitEl.textContent = LIMIT_TEXT; F.limitEl.classList.add('on'); clearTimeout(limT); limT = setTimeout(function () { F.limitEl.classList.remove('on'); }, 4500); };

    function stepFor(n) {
      if(n.id==='square' || n.id==='start')return 1;
      var a = Math.abs(n.v), cfg = n.cfg, s = a >= 10 ? Math.pow(10, Math.floor(Math.log10(a)) - 1) : (cfg.step || (cfg.int ? 1 : 0.1));
      if (cfg.int && s < 1) s = 1; return s;
    }
    // put a value into a number; clamp = an explored value below the floor stops at the floor
    function apply(n, v, how, clamp) {
      var c = check(n.cfg, v);
      if (!c) { if (!clamp || v !== v) return false; if (n.cfg.min != null && v < n.cfg.min) c = { v: n.cfg.min }; else return false; }
      if (c.lim) { F.limit(); return false; }
      F.limitEl.classList.remove('on');
      if (how !== 'type' && ed && ed.n === n) { ed.typed = false; ed.valid = false; }
      if (how !== 'type' && c.v === n.v) return true;
      n.v = c.v; if (how !== 'type') n.txt = null;
      show(n);
      if (opts.onInput) opts.onInput(n.id, c.v, how);
      return true;
    }
    function openEditor(n) {
      if (ed && ed.n === n) return;
      if (ed) closeEditor(true);
      ed = { n: n, buf: n.txt || plain(n.v, 6), fresh: true, v0: n.v, txt0: n.txt, typed: false, valid: false };
      n.el.classList.add('kgf-edit'); show(n); digN = -1; digits();
      F.padEl.classList.add('on');
      if (opts.onEdit) opts.onEdit(n.id);
    }
    function closeEditor(commit) {
      if (!ed) return;
      var e = ed, n = e.n; var accepted = commit && e.typed && e.valid; ed = null; stopRep();
      if (n.el) n.el.classList.remove('kgf-edit');
      if (!commit || (e.typed && !e.valid)) { var ch = n.v !== e.v0; n.v = e.v0; n.txt = e.txt0; if (ch && opts.onInput) opts.onInput(n.id, n.v, 'restore'); }
      else if (accepted) {
        var p = parse(e.buf), c = p !== p ? null : check(n.cfg, p);
        n.txt = (c && !c.lim && c.v === n.v && (e.buf.indexOf('/') > 0 || /\.\d{5,}/.test(e.buf))) ? e.buf : null;
      }
      if (n.vEl) show(n);
      F.padEl.classList.remove('on');
      if (opts.onEdit) opts.onEdit(null, accepted ? n.id : null);
    }
    F.open = function (id) { if (nums[id]) openEditor(nums[id]); };
    F.close = function (commit) { closeEditor(commit !== false); };
    // one key of the keypad or the keyboard: '0'..'9', '.', '-', '/', 'back', 'C'
    function key(k) {
      if (!ed || !/^(?:[0-9eE+]|\.|-|\/|back|C)$/.test(k)) return;
      var n = ed.n, b = ed.fresh ? '' : ed.buf, seg;
      if (ed.blocked && k !== 'back' && k !== 'C' && !ed.fresh) return;
      ed.blocked = false;
      if (k === 'C') b = '';
      else if (k === 'back') b = ed.buf.slice(0, -1);
      else if (k === '-') b = (ed.fresh || !ed.typed) ? '-' : (ed.buf.charAt(0) === '-' ? ed.buf.slice(1) : '-' + ed.buf);
      else if (k === '.') { if (ed.fresh) b = '0.'; else { seg = b.slice(b.lastIndexOf('/') + 1); if (seg.indexOf('.') >= 0) return; b += (seg === '' || seg === '-') ? '0.' : '.'; } }
      else if (k === '/') { if (ed.fresh) b = ed.buf; if (b === '' || b === '-' || b.indexOf('/') >= 0) return; b += '/'; }
      else { if (b.length >= 22) return; seg = b.slice(b.lastIndexOf('/') + 1); if (seg === '0') b = b.slice(0, -1); else if (seg === '-0') b = b.slice(0, -1); b += k; }
      ed.buf = b; ed.fresh = false; ed.typed = true; ed.valid = false; show(n);
      var p = parse(b);
      if (p === p) {
        var c = check(n.cfg, p), typedRatio = b.indexOf('/') < 0 && isFinite(p) ? ratio(b.replace(/^([+-]?)\./,'$10.')) : null;
        if(typedRatio && (typedRatio.n>BigInt(LIMIT)*typedRatio.d || typedRatio.n<-BigInt(LIMIT)*typedRatio.d)) c={lim:true};
        if (c && c.lim) { ed.blocked = true; F.limit(); } else if (c) { ed.valid = true; F.limitEl.classList.remove('on'); n.v = c.v; if (opts.onInput) opts.onInput(n.id, c.v, 'type'); }
      }
      if (!ed.valid && opts.onInvalid) opts.onInvalid(n.id);
      digits();
    }
    F.key = key;
    // Enter (or the keypad's enter): the typed number is committed. opts.onCommit may keep the number open for the next try.
    function enter() {
      if (!ed) return;
      var n = ed.n, typed = ed.typed && ed.valid, keep = false;
      if (ed.typed && !ed.valid) {
        n.v = ed.v0; n.txt = ed.txt0;
        if (opts.onInput) opts.onInput(n.id, n.v, 'restore');
        if (opts.onInvalid) opts.onInvalid(n.id);
        ed.fresh = true; ed.typed = false; ed.valid = false; show(n); digits(); return;
      }
      if (typed) { var p = parse(ed.buf), c = p !== p ? null : check(n.cfg, p); n.txt = (c && !c.lim && c.v === n.v && (ed.buf.indexOf('/') > 0 || /\.\d{5,}/.test(ed.buf))) ? ed.buf : null; }
      if (opts.onCommit) keep = opts.onCommit(n.id, typed) === true;
      if (!ed || ed.n !== n) return;
      if (keep) { ed.buf = n.txt || plain(n.v, 6); ed.fresh = true; ed.v0 = n.v; ed.txt0 = n.txt; ed.typed = false; ed.valid = false; show(n); digits(); }
      else { ed.typed = false; closeEditor(true); }
    }
    F.enter = enter;

    // ---- the digit arrows over the selected number: one press changes one place
    function places(n) {
      var cfg = n.cfg, a = Math.abs(n.v), nd = typeof cfg.dec === 'function' ? cfg.dec() : cfg.dec;
      var intD = Math.max(cfg.intDigits || 1, a >= 1 ? Math.floor(Math.log10(a) + 1e-12) + 1 : 1), dec = cfg.int ? 0 : Math.max(nd == null ? 1 : nd, decimalsOf(n.v));
      if (dec > 4) dec = 4;
      while (intD + dec > 7 && dec > 0) dec--;
      var low = intD > 7 ? intD - 7 : 0;
      return { hi: intD - 1, lo: dec > 0 ? -dec : low, dec: dec };
    }
    function digits() {
      if (!ed) return;
      var n = ed.n, P = places(n), cols = P.hi - P.lo + 1, sig = cols * 100 + P.dec * 10 + (n.v < 0 ? 1 : 0), i, p, col;
      if (sig !== digN) {
        digN = sig; digitsEl.textContent = '';
        if (n.v < 0) E('span', 'kgf-dsep', '−', digitsEl).style.width = '18px';
        for (p = P.hi; p >= P.lo; p--) {
          if (p === -1) E('span', 'kgf-dsep', '.', digitsEl);
          col = E('div', 'kgf-dcol', null, digitsEl); col.setAttribute('data-p', p);
          var u = E('button', 'kgf-dbtn', null, col); u.innerHTML = SVG.up; u.setAttribute('data-s', '1'); u.setAttribute('aria-label', 'up');
          E('div', 'kgf-dval', '0', col);
          var d = E('button', 'kgf-dbtn', null, col); d.innerHTML = SVG.down; d.setAttribute('data-s', '-1'); d.setAttribute('aria-label', 'down');
        }
      }
      var s = Math.abs(n.v).toFixed(P.dec).replace('.', ''), vals = digitsEl.querySelectorAll('.kgf-dval'), lead = true;
      while (s.length < P.hi + 1 + P.dec) s = '0' + s;
      for (i = 0; i < vals.length; i++) {
        var ch = s.charAt(s.length - (P.hi + P.dec + 1) + i + (P.dec > 0 ? 0 : 0)) || '0', pp = P.hi - i;
        if (ch !== '0' || pp <= 0) lead = false;
        if (vals[i].textContent !== ch) vals[i].textContent = ch;
        vals[i].className = 'kgf-dval' + (lead ? ' z' : '');
      }
    }
    function bump(p, s) {
      if (!ed) return;
      var n = ed.n, P = places(n), q = Math.pow(10, p), v = Number((n.v + s * q).toFixed(P.dec));
      if (apply(n, v, 'digit', true)) { ed.buf = plain(n.v, 6); ed.fresh = true; show(n); digits(); if (opts.onLand) opts.onLand(n.id); }
    }
    function stopRep() { clearTimeout(repT); clearInterval(rep); rep = 0; repT = 0; }
    function padDown(e) {
      var t = e.target.closest ? e.target.closest('.kgf-key,.kgf-dbtn') : null;
      e.preventDefault(); padEv = e;
      if (!t || !ed) return;
      t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 110);
      if (t.classList.contains('kgf-key')) { var kk = t.getAttribute('data-k'); if (kk === 'ok') enter(); else key(kk); return; }
      var p = +t.parentNode.getAttribute('data-p'), s = +t.getAttribute('data-s');
      bump(p, s); stopRep();
      repT = setTimeout(function () { rep = setInterval(function () { bump(p, s); }, 110); }, 420);
    }
    F.padEl.addEventListener('pointerdown', padDown);
    F.padEl.addEventListener('pointerup', stopRep); F.padEl.addEventListener('pointercancel', stopRep); F.padEl.addEventListener('pointerleave', stopRep);
    F.padEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // ---- a number: tap to type, drag up or down to step, wheel to step
    function onDown(e) {
      var t = e.target.closest ? e.target.closest('.kgf-num,.kgf-eq') : null; if (!t || drag) return;
      e.preventDefault();
      if (t.classList.contains('kgf-eq')) drag = { eq: true, pid: e.pointerId, y0: e.clientY, x0: e.clientX, el: t };
      else { var n = nums[t.getAttribute('data-id')]; if (!n) return; drag = { n: n, pid: e.pointerId, x0: e.clientX, y0: e.clientY, v0: n.v, step: stepFor(n), moved: false, el: t }; }
      try { t.setPointerCapture(e.pointerId); } catch (_) { }
    }
    function onMove(e) {
      if (!drag || drag.pid !== e.pointerId || !drag.n) return;
      var dy = drag.y0 - e.clientY, a = Math.abs(dy) - 8;
      if (!drag.moved) { if (a < 0) return; drag.moved = true; if (ed && ed.n !== drag.n) closeEditor(true); }
      if (a < 0) a = 0;
      var k = Math.round(Math.pow(a / 9, 1.3)) * (dy < 0 ? -1 : 1);
      apply(drag.n, snapTo(drag.v0 + k * drag.step, drag.step), 'explore', true);
      if (ed && ed.n === drag.n) { ed.buf = plain(drag.n.v, 6); ed.fresh = true; show(drag.n); digits(); }
    }
    function onUp(e) {
      if (!drag || drag.pid !== e.pointerId) return;
      var d = drag; drag = null;
      try { d.el.releasePointerCapture(e.pointerId); } catch (_) { }
      if (e.type === 'pointercancel') return;
      if (d.eq) { if (Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) < 16 && opts.onEq) opts.onEq(); return; }
      if (!d.moved) openEditor(d.n); else if (opts.onLand) opts.onLand(d.n.id);
    }
    function onWheel(e) {
      var t = e.target.closest ? e.target.closest('.kgf-num') : null; if (!t) return;
      e.preventDefault(); e.stopPropagation();
      if (!e.deltaY) return;
      var n = nums[t.getAttribute('data-id')]; if (!n) return;
      var s = stepFor(n);
      apply(n, snapTo(n.v + (e.deltaY < 0 ? s : -s), s), 'explore', true);
      if (ed && ed.n === n) { ed.buf = plain(n.v, 6); ed.fresh = true; show(n); digits(); }
      if(opts.onRoll)opts.onRoll(n.id);
    }
    [F.el, F.chipsEl].forEach(function (el) {
      el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp);
      el.addEventListener('wheel', onWheel, { passive: false });
    });
    // the keyboard (bubble phase on the document; nothing is captured)
    function onKey(e) {
      if (dead || !ed || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key, h = true;
      if (k >= '0' && k <= '9' && k.length === 1) key(k);
      else if (k === '.' || k === ',') key('.');
      else if (k === '-' || k === '−') key('-');
      else if (k === '/') key('/');
      else if (k === 'e' || k === 'E' || k === '+') key(k);
      else if (k === 'Backspace') key('back');
      else if (k === 'Delete' || k === 'c' || k === 'C') key('C');
      else if (k === 'Enter') enter();
      else if (k === 'Escape') closeEditor(false);
      else if (k === 'ArrowUp' || k === 'ArrowDown') { var n = ed.n, s = stepFor(n); apply(n, snapTo(n.v + (k === 'ArrowUp' ? s : -s), s), 'explore', true); ed.buf = plain(n.v, 6); ed.fresh = true; show(n); digits(); if(opts.onRoll)opts.onRoll(n.id); }
      else if (k === 'Tab') { var ids = Object.keys(nums).filter(function (id) { return nums[id].el && nums[id].el.offsetParent; }), i = ids.indexOf(ed.n.id); closeEditor(true); if (ids.length) openEditor(nums[ids[(i + (e.shiftKey ? ids.length - 1 : 1)) % ids.length]]); }
      else h = false;
      if (h) { e.preventDefault(); e.stopPropagation(); }
    }
    // a tap anywhere else applies the number
    function onDocDown(e) {
      if (dead) return;
      var t = e.target, inPad = e === padEv || F.padEl.contains(t);
      if (ed && !(ed.n.el && ed.n.el.contains(t)) && !inPad) closeEditor(true);
      if (moreEl && moreEl.classList.contains('on') && !F.chipsEl.contains(t) && !inPad) F.more(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDocDown);
    F.destroy = function () {
      dead = true; stopRep(); clearTimeout(limT); ed = null;
      document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDocDown);
      [F.el, F.chipsEl, F.padEl, F.limitEl, F.workingEl].forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    };
    return F;
  }

  // the five pips (the same look as the KUIPER rung draws): pips(parent, {active, names, onPick}) -> {el, set(active, names), kuiper(on)}
  function pips(parent, o) {
    css();
    var el = E('div', 'kgf-pips', null, parent), kids = [], act = o.active, kOn = true, names = !!o.names;
    PIPS.forEach(function (nm, i) {
      var p = E('span', 'kgf-pip', null, el); E('i', null, null, p); p._b = E('b', null, nm, p); kids.push(p);
      p.addEventListener('click', function () { if (i === act || (i === 4 && !kOn)) return; o.onPick(i + 1); });
    });
    function paint() { kids.forEach(function (p, i) { p.className = 'kgf-pip' + (i === act ? ' on' : (i === 4 && !kOn ? ' dim' : '')); p._b.style.display = (names || i === act) ? '' : 'none'; }); }
    paint();
    return { el: el, set: function (a, nm) { act = a; if (nm != null) names = !!nm; paint(); }, kuiper: function (on) { if (kOn !== !!on) { kOn = !!on; paint(); } } };
  }

  // ------------------------------------------------------------------ PLAY: the four rungs on one canvas
  var S = null;        // the open instance
  var KEEP = null;     // the player's numbers, kept between opens
  var PT = { x: 0, y: 0, d: 0, deg: 0 }, PT2 = { x: 0, y: 0, d: 0, deg: 0 }, INV = {}, SIX = {}, Q = {};
  var IDS = ['start', 'mod', 'dist', 'turn', 'step', 'count', 'speed', 'grow', 'newDots', 't'];
  var CHIP = { c_d: 'd', c_sq: 'sq', c_area: 'area', c_ang: 'deg', c_rem: 'rem', c_x: 'x', c_y: 'y', x: 'x', y: 'y' };

  function tuning() {
    var T = {}, U = root.KGPlayTuning, k;
    for (k in TUNING) T[k] = TUNING[k];
    if (U && typeof U === 'object') {
      if (Array.isArray(U.levels) && U.levels.length) {
        var lv = U.levels.filter(function (l) { return l && l.angleDeg > 0 && l.angleDeg <= 180 && l.distance > 0 && isFinite(l.angleDeg) && isFinite(l.distance); });
        if (lv.length) T.levels = lv;
      }
      if (typeof U.equalArea === 'boolean') T.equalArea = U.equalArea;
      if (U.warmth && typeof U.warmth === 'object') T.warmth = { curve: U.warmth.curve || TUNING.warmth.curve, width: U.warmth.width > 0 ? U.warmth.width : TUNING.warmth.width, steps: U.warmth.steps >= 0 ? U.warmth.steps : TUNING.warmth.steps };
      if (U.lights === 1 || U.lights === 2) T.lights = U.lights;
      if (typeof U.typedPair === 'boolean') T.typedPair = U.typedPair;
      if (Array.isArray(U.triesBand) && U.triesBand.length >= 2) T.triesBand = U.triesBand;
    }
    return T;
  }
  // warmth with the tuned curve: strictly falls with distance, everywhere
  function warm(T, tg, x, y) {
    var cx = tg.kind === 'xy' ? tg.x : tg.d * Math.cos(tg.deg * RAD), cy = tg.kind === 'xy' ? tg.y : tg.d * Math.sin(tg.deg * RAD);
    var s = (tg.kind === 'xy' ? tg.s : Math.min(tg.wd, tg.wdeg * RAD * Math.max(tg.d, 1e-9))) / 2 * T.warmth.width;
    var e = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / Math.max(s, 1e-12), w;
    if (T.warmth.curve === 'inv') w = 1 / (1 + e);
    else if (T.warmth.curve === 'exp') w = Math.exp(-e / 8);
    else w = 1 / (1 + Math.log(1 + e) / 3);
    if (T.warmth.steps > 1) w = Math.ceil(w * T.warmth.steps) / T.warmth.steps;
    return w;
  }
  M.warm = function (tg, x, y, T) { return warm(T || TUNING, tg, x, y); };

  function defaults() { return { found: [], score: 0, rung: 1, start: 40, mod: 360, dist: 3, turn: 90, step: 0, count: 12, speed: 20, grow: 0, newDots: 1, t: 0, xy: false, sel: 1, turnSet: false, txt: {}, facts: {}, stars: 0, findOn: null, muted: false }; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function sprite(r, g, b) {
    var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.16, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',.85)');
    gr.addColorStop(0.55, 'rgba(' + r + ',' + g + ',' + b + ',.22)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c;
  }
  function glowSprite(r, g, b) {
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',.9)'); gr.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ',.3)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return c;
  }
  function nowMs() { return (root.performance && performance.now) ? performance.now() : Date.now(); }

  function open(host, opts) {
    if (S) close(true);
    opts = opts || {}; css();
    var p = KEEP || defaults(), fr = opts.from, i;
    KEEP = p;
    if (!fr && opts.hash !== false) readHash(p);
    if (fr) {
      if (typeof fr.turn === 'number' && isFinite(fr.turn)) { p.turn = fr.turn * (p.mod / 360); p.turnSet = true; p.txt.turn = null; }
      var fn = fr.howMany != null ? fr.howMany : fr.count; if (typeof fn === 'number' && fn >= 0 && isFinite(fn)) p.count = Math.min(LIMIT, Math.floor(fn));
      if (typeof fr.start === 'number' && isFinite(fr.start)) p.start = fr.start;
      if (typeof fr.t === 'number' && isFinite(fr.t)) p.t = fr.t;
    }
    if (opts.rung >= 1 && opts.rung <= 4 && p.rung !== (opts.rung | 0)) { p.rung = opts.rung | 0; if (!p.turnSet) p.turn = (p.rung >= 3 ? 30 : 90) * (p.mod / 360); p.sel = p.rung === 2 ? 1 : p.rung >= 3 ? M.count(p) : 0; }
    var s = S = {
      host: host, opts: opts, p: p, a: {}, T: tuning(), tw: {}, on: [], timers: [], raf: 0, closed: false,
      W: 0, H: 0, dpr: 1, box: { l: 0, t: 0, r: 0, b: 0 }, cx: 0, cy: 0, R: 100, cxT: 0, cyT: 0, RT: 100, first: true,
      cam: { x: 0, y: 0, z: 20 }, camT: { x: 0, y: 0, z: 20 }, viewR: 4, zoomMul: 1,
      xy: new Float64Array(2 * CAP + 2), nDraw: 0, nTrue: 0, dirty: true, last: 0, t0: nowMs(),
      ptw: { on: false, x0: 0, y0: 0, x1: 0, y1: 0, t0: 0, dur: 1 },
      drag: null, press: null, pinch: null, ptr: [{ id: -1, x: 0, y: 0 }, { id: -1, x: 0, y: 0 }],
      playing: false, tape: null, hashT: 0, fitT: 0, keptDeg: 0,
      probe: { on: false, x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0 }, joy: { x: 0, y: 0, id: null, on: false, t0: 0, max: 0 },
      find: { on: false, seq: 0, target: null, ghosts: new Float64Array(24), gN: 0, gI: 0, tries: 0, explored: false, typedIds: {}, lastHow: '', evalAt: 0, heat: 0, hot: -1, inside: false, softAt: -1e9, nextAt: 0, lastFlash: -1e9, novas: 0, softs: 0, flashTimes: [], born: 0, held: false,
        nova: { on: false, t0: 0, x: 0, y: 0, scale: 1, gentle: false } },
      cele: { t0: -1e9, kind: '' }, stackPulse: -1e9, lastCirc: 0, lastLand: 0, ac: null, lastNote: 0, mutedLocal: !!p.muted,
      part: new Float32Array(4 * 96), labels: {}, rimKey: '', rimStep: 30, rimMinor: 10, rand: rng(opts.seed != null ? opts.seed : (Date.now() & 0x7fffffff)),
      reduced: !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)
    };
    if (opts.reducedMotion != null) s.reduced = !!opts.reducedMotion;
    for (i = 0; i < IDS.length; i++) { s.a[IDS[i]] = p[IDS[i]]; s.tw[IDS[i]] = { on: false, from: 0, to: 0, t0: 0, dur: 1 }; }
    s.a.rung = p.rung;
    var rootEl = s.root = E('div', 'kgf-root', null, host);
    s.cv = E('canvas', 'kgf-cv', null, rootEl); s.ctx = s.cv.getContext('2d');
    s.sprC = sprite(0, 255, 255); s.sprA = sprite(255, 176, 0); s.sprH = sprite(255, 214, 120); s.glowG = glowSprite(0, 255, 255); s.glowW = glowSprite(255, 236, 190);
    s.F = create(rootEl, { onInput: onInput, onInvalid: function () { s.find.pending = false; s.find.evalAt = 0; s.find.lastHow = ''; s.F.setText('ang',''); s.F.setText('rootEquals',''); s.F.setText('rootValue',''); s.F.workingEl.textContent=''; }, onEdit: onEdit, onCommit: onCommit, onEq: flip, onMore: function () { if (S) { chips(); layout(); } }, onLand: function () { landNote(); exploreCheck(); queueRoll(); }, onRoll: queueRoll });
    s.pips = pips(rootEl, { active: p.rung - 1, names: false, onPick: pick });
    var ic = s.icons = E('div', 'kgf-icons', null, rootEl);
    s.findBtn = iconBtn(ic, SVG.star, 'find', function () { if (s.starHeld) { s.starHeld = false; return; } setFind(!s.find.on); });
    on(s.findBtn, 'pointerdown', function () { s.starHeld = false; clearTimeout(s.starT); s.starT = setTimeout(function () { if (S !== s || s.p.rung !== 1) return; s.starHeld = true; M.place(s.p, 0, PT); dropTarget(PT.x, PT.y); }, 560); });
    on(s.findBtn, 'pointerup', function () { clearTimeout(s.starT); }); on(s.findBtn, 'pointerleave', function () { clearTimeout(s.starT); });
    s.joyBtn = iconBtn(ic, SVG.joy, 'joystick', function () { setJoy(!s.joy.on); });
    s.muteBtn = iconBtn(ic, SVG.note, 'sound', function () { var m = !muted(); if (root.KGAudio && typeof root.KGAudio.setMuted === 'function') root.KGAudio.setMuted(m); else s.mutedLocal = m; p.muted = m; showMute(); if (!m) { gesture(); landNote(); } });
    if (opts.standalone !== true && opts.close !== false) s.closeBtn = iconBtn(ic, SVG.x, 'close', function () { close(); });
    // the clock (rung 4): play, and a tape to drag both ways
    s.timeEl = E('div', 'kgf-time', null, rootEl);
    s.playBtn = iconBtn(s.timeEl, SVG.play, 'play', function () { setPlaying(!s.playing); });
    s.tape = E('canvas', null, null, s.timeEl);
    // the joystick: the simulator's own DOM and pointer logic
    s.joyEl = E('div', 'kgf-joy', null, rootEl); s.knob = E('div', 'kgf-knob', null, s.joyEl);
    bind();
    buildFormula();
    layout(); s.cx = s.cxT; s.cy = s.cyT; s.R = s.RT;
    fit(true); camTarget(); s.cam.x = s.camT.x; s.cam.y = s.camT.y; s.cam.z = s.camT.z;
    showMute(); refresh();
    var fo = opts.find != null ? !!opts.find : (p.findOn != null ? p.findOn : s.T.findOnOpen);
    s.findBtn.style.display = p.rung === 1 ? '' : 'none';
    if (fo && p.rung === 1) setFind(true, true);
    s.timers.push(setTimeout(function () { if (S === s && p.rung === 1) s.F.pulse('='); }, 900));
    s.last = nowMs(); need();
    return api;
  }
  function iconBtn(parent, svg, label, fn) { var b = E('button', 'kgf-ic', null, parent); b.innerHTML = svg; b.setAttribute('aria-label', label); b.addEventListener('click', function (e) { gesture(); fn(e); }); return b; }
  function on(el, type, fn, opt) { el.addEventListener(type, fn, opt || false); S.on.push([el, type, fn, opt || false]); }
  function need() { if (S && !S.raf) S.raf = requestAnimationFrame(tick); }
  function close(silent) {
    if (!S) return;
    var s = S; S = null; s.closed = true;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.timers.forEach(function (t) { clearTimeout(t); }); clearTimeout(s.hashT); clearTimeout(s.starT); if (s.press) clearTimeout(s.press.hold);
    s.on.forEach(function (o) { o[0].removeEventListener(o[1], o[2], o[3]); });
    if (s.ro) { try { s.ro.disconnect(); } catch (e) { } }
    s.F.destroy();
    try { if (s.ac) s.ac.close(); } catch (e) { }
    if (s.root && s.root.parentNode) s.root.parentNode.removeChild(s.root);
    if (silent !== true) { try { s.host.dispatchEvent(new CustomEvent('kgclose', { bubbles: true, detail: { id: 'play' } })); } catch (e) { } }
  }
  function muted() { return (root.KGAudio && root.KGAudio.muted) || (S && S.mutedLocal); }
  function showMute() { var m = muted(); S.muteBtn.className = 'kgf-ic' + (m ? ' off' : ''); S.muteBtn.querySelector('.s').style.display = m ? '' : 'none'; }

  // ------------------------------------------------------------------ the page address carries the numbers
  function readHash(p) {
    var h; try { h = String(root.location.hash || '').replace(/^#/, ''); } catch (e) { return; }
    if (!/(^|&)rung=/.test(h)) return;
    var map = { a: 'start', d: 'dist', m: 'mod', turn: 'turn', step: 'step', n: 'count', t: 't', sp: 'speed', gr: 'grow', nd: 'newDots' };
    var cf = { mod: { pos: true }, count: { int: true, min: 0 }, newDots: { min: 0 } };
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i < 1) return;
      var k = kv.slice(0, i), raw; try { raw = decodeURIComponent(kv.slice(i + 1)); } catch (e) { return; }
      var v = parse(raw);
      if (k === 'rung') { if (v >= 1 && v <= 4) p.rung = Math.floor(v); return; }
      if (k === 'xy') { p.xy = raw === '1'; return; }
      if (!map[k] || v !== v) return;
      var c = check(cf[map[k]] || {}, v); if (!c) return;
      p[map[k]] = c.v; p.txt[map[k]] = raw.indexOf('/') > 0 ? raw : null; if (k === 'turn') p.turnSet = true;
    });
  }
  function hashText() {
    var p = S.p, r = p.rung, o = 'rung=' + r, t = p.txt;
    function f(k, id) { o += '&' + k + '=' + encodeURIComponent(t[id] || plain(p[id], 9)); }
    f('a', 'start'); f('d', 'dist'); f('m', 'mod');
    if (r >= 2) { f('turn', 'turn'); f('step', 'step'); }
    if (r >= 3) f('n', 'count');
    if (r >= 4) { f('t', 't'); f('sp', 'speed'); f('gr', 'grow'); f('nd', 'newDots'); }
    if (r === 1 && p.xy) o += '&xy=1';
    return o;
  }
  function saveHash() {
    var s = S; if (!s || s.opts.hash === false) return;
    clearTimeout(s.hashT);
    s.hashT = setTimeout(function () { if (S !== s) return; try { root.history.replaceState(null, '', '#' + hashText()); } catch (e) { } }, 350);
  }

  // ------------------------------------------------------------------ the formula for each rung
  function findDec(which) {
    var s = S, tg = s.find.on ? s.find.target : null; if (!tg) return which === 'a' ? 1 : 2;
    if (tg.kind === 'xy') return Math.min(4, stepDec(tg.s) + 1);
    return which === 'a' ? Math.min(4, Math.max(1, stepDec(tg.wdeg * (s.p.mod / 360) / 2))) : Math.min(4, stepDec(tg.wd) + 1);
  }
  function buildFormula() {
    var s = S, p = s.p, r = p.rung, L = [], cA = '#00ffff', cD = '#66ccff', cT = '#00ffff', cM = '#9fdcff';
    function dA() { return findDec('a'); } function dD() { return findDec('d'); }
    if (r === 1 && p.xy) {
      L.push([['X', { eq: 1 }, { out: 'r1', color: cD }, '×', 'COS(', { out: 'th1', color: cA }, ')'], ['=', { id: 'x', cfg: { color: '#fff', dec: dD, show: 2, fixed: true, step: 0.1 } }]]);
      L.push([['Y', { eq: 1 }, { out: 'r2', color: cD }, '×', 'SIN(', { out: 'th2', color: cA }, ')'], ['=', { id: 'y', cfg: { color: '#fff', dec: dD, show: 2, fixed: true, step: 0.1 } }]]);
    } else {
      var t = [r === 1 ? ['MOD(', { id: 'start', cfg: { color: cA, intDigits: 3, dec: dA, step: 1 } }] : ['ANGLE', '=', 'MOD(', { id: 'start', cfg: { color: cA, intDigits: 3, dec: dA, step: 1 } }]];
      if (r >= 2) t.push(['+', { id: 'sel', cfg: { color: '#ffb000', int: true, min: 0, label: 'N', dec: 0 } }, '×', { id: 'turn', cfg: { color: cT, intDigits: 3, dec: 1, step: 1 } }]);
      if (r >= 4) t.push(['+', 'T', '×', { id: 'speed', cfg: { color: '#fff', label: 'SPEED', step: 1 } }]);
      t.push([',', { id: 'mod', cfg: { color: cM, pos: true, intDigits: 3, dec: 0, step: 1 } }, ')']);
      t.push([r === 1 ? { eq: 1 } : '=', { out: 'ang', color: r >= 2 ? '#ffb000' : '#fff' }]);
      L.push(t);
      var d = r === 1 ? [['SQRT(', { id: 'square', cfg: { color: '#fff', dec: dD, step: 1, min: 0 } }, ')'], [{ out: 'rootEquals' }, { out: 'rootValue' }]] : [['DISTANCE', '=', { id: 'dist', cfg: { color: cD, dec: dD, step: 0.1, min: 0 } }]];
      if (r >= 2) d.push(['+', 'N', '×', { id: 'step', cfg: { color: cD, dec: 1, step: 0.1 } }]);
      if (r >= 4) d.push(['+', 'T', '×', { id: 'grow', cfg: { color: '#fff', label: 'GROW', step: 0.1 } }]);
      if (r >= 2) d.push(['=', { out: 'dis', color: '#ffb000' }]);
      L.push(d);
      if (r >= 3) { var h = [['HOW MANY', { id: 'count', cfg: { color: '#fff', int: true, min: 0, dec: 0, intDigits: 2 } }]]; if (r >= 4) h.push(['T', '=', { id: 't', cfg: { color: '#fff', show: 1, fixed: true, step: 0.1 } }]); L.push(h); }
      if (r >= 4) L.push([['NEW DOTS', { id: 'newDots', cfg: { color: '#fff', min: 0, step: 1 } }, 'A SECOND']]);
    }
    s.F.setLines(L); s.F.el.classList.toggle('rung-one', r === 1);
    s.F.setChips([
      { id: 'c_d', label: 'DISTANCE', cfg: { color: cD, show: 2, fixed: true, dec: dD, step: 0.1, min: 0 } },
      { id: 'c_sq', label: 'SQUARE', cfg: { color: cD, show: 2, fixed: true, dec: 1, min: 0, step: 1 } },
      { id: 'c_area', label: 'AREA', cfg: { color: cD, show: 2, fixed: true, dec: 1, min: 0, step: 1 } },
      { id: 'c_ang', label: 'ANGLE', cfg: { color: cA, show: 2, intDigits: 3, dec: dA, step: 1 } },
      { id: 'c_rem', label: 'REMAINDER', cfg: { color: cA, show: 2, intDigits: 3, dec: dA, step: 1 } },
      { id: 'c_x', label: 'X', cfg: { color: '#fff', show: 2, fixed: true, dec: dD, step: 0.1 } },
      { id: 'c_y', label: 'Y', cfg: { color: '#fff', show: 2, fixed: true, dec: dD, step: 0.1 } }
    ]);
  }
  function selN() { var s = S, p = s.p; if (p.rung <= 1) return 0; var n = M.count(p), m = p.rung === 2 ? 1 : n; return p.sel < 0 ? 0 : p.sel > m ? m : p.sel; }
  // put every number on screen from the true state (the dot or, while roaming, the probe)
  function refresh() {
    var s = S, p = s.p, F = s.F, r = p.rung, n = selN(), i, id;
    for (i = 0; i < IDS.length; i++) { id = IDS[i]; if (F.has(id)) F.setValue(id, p[id], p.txt[id]); }
    if (F.has('sel')) F.setValue('sel', n);
    M.place(p, n, PT);
    if (PT.d !== 0) s.keptDeg = PT.d < 0 ? mod(PT.deg + 180, 360) : PT.deg;
    if (r === 1 && p.xy) {
      F.workingEl.textContent = ''; F.workingEl.style.display = 'none';
      F.setValue('x', PT.x); F.setValue('y', PT.y);
      var rs = fmt(Math.abs(p.dist), 2), ts = fmt(PT.d < 0 ? mod(PT.deg + 180, 360) : PT.deg, 2) + '°';
      F.setText('r1', rs); F.setText('r2', rs); F.setText('th1', ts); F.setText('th2', ts);
    } else {
      var ex = exact(p,n); F.setText('ang', ex ? ex.m : fmt(mod(M.raw(p,n),p.mod),4));
      F.workingEl.textContent = ex ? ex.raw + ' = ' + ex.q + ' × ' + String(p.mod) + ' + ' + ex.m : '';
      F.workingEl.style.display = '';
      if (r === 1) {
        var square = p.square == null ? p.dist * p.dist : p.square;
        F.setValue('square', square);
        var shownRoot = plain(p.dist, 4), rn = Number(shownRoot);
        var ar=ratio(square), rr=ratio(shownRoot);
        var isExact = rr.n*rr.n*ar.d===ar.n*rr.d*rr.d;
        F.setText('rootEquals', isExact ? '=' : '≈'); F.setText('rootValue', fmt(p.dist, 4));
      }
      if (r >= 2) F.setText('dis', fmt(M.dist(p, n), 4));
    }
    chips();
    s.dirty = true; need();
  }
  function chips() {
    var s = S, F = s.F, pr = s.probe;
    if (!F.moreOpen() && !probeFns.length) return;
    if (pr.on) M.six(pr.x, pr.y, s.p.mod, s.keptDeg, SIX); else { M.place(s.p, selN(), PT2); M.six(PT2.x, PT2.y, s.p.mod, s.keptDeg, SIX); }
    if (!F.moreOpen()) return;
    F.setValue('c_d', SIX.d); F.setValue('c_sq', SIX.sq); F.setValue('c_area', SIX.area); F.setValue('c_ang', SIX.deg); F.setValue('c_rem', SIX.rem); F.setValue('c_x', SIX.x); F.setValue('c_y', SIX.y);
  }

  // ------------------------------------------------------------------ changes
  function tween(id, to, dur) { var s = S, w = s.tw[id]; if (s.a[id] === to) { w.on = false; return; } w.from = s.a[id]; w.to = to; w.t0 = nowMs(); w.dur = dur; w.on = true; }
  function setNow(id, v) { S.a[id] = v; S.tw[id].on = false; }
  function busy() { var s = S, i; if (s.ptw.on) return true; for (i = 0; i < IDS.length; i++) if (s.tw[IDS[i]].on) return true; return false; }
  function windDur(d, c) { var t = Math.abs(d) / c; return 170 + 900 * Math.pow(t > 2.4 ? 2.4 : t, 0.8); }
  function set(id, v, how) {
    var s = S, p = s.p, ease = how === 'type' || how === 'digit' || how === 'restore' || how === 'tap';
    if (id === 'turn') p.turnSet = true;
    if (id === 'dist') p.square = null;
    p[id] = v; p.txt[id] = null;
    if (id === 'mod' || id === 't' || id === 'newDots' || !ease) { setNow(id, v); return; }
    tween(id, v, id === 'start' ? windDur(v - s.a.start, p.mod) : id === 'turn' ? Math.min(900, 220 + 40 * Math.abs(v - s.a.turn) / p.mod * 12) : id === 'count' ? 320 : 180);
  }
  function mark(how, id) {
    var f = S.find; f.quietAt=0;
    if (how === 'type') { f.typedIds[id] = 1; f.lastHow = 'type'; f.pending = true; S.zoomMul = 1; }
    else { f.typedIds = {}; f.explored = true; f.lastHow = 'explore'; f.evalAt = 0; f.pending = false; }
  }
  // the keypad, the keyboard, a dragged number, the wheel and the digit arrows all arrive here
  function onInput(id, v, how) {
    var s = S, p = s.p, r = p.rung, n = selN(), w = CHIP[id];
    gesture();
    if (w) {
      M.place(p, n, PT); PT.deg = s.keptDeg;
      M.fromSix(w, v, PT, p.mod, Q);
      if (r === 1 && (w === 'd' || w === 'sq' || w === 'area')) set('dist', w === 'd' ? v : Q.d, how);
      else if (r === 1 && (w === 'deg' || w === 'rem')) set('start', w === 'rem' ? mod(v, p.mod) : mod(v, 360) * (p.mod / 360), how);
      else moveDot(n, Q.x, Q.y, how, false);
    } else if (id === 'square') { set('dist', Math.sqrt(v), how); p.square = v; if (Number.isSafeInteger(v) && Number.isSafeInteger(p.dist) && BigInt(p.dist)*BigInt(p.dist)===BigInt(v)) s.ringFlash={d:p.dist,t:nowMs()}; } else if (id === 'sel') { p.sel = v; landNote(); }
    else set(id, v, how);
    if (id === 'count' && r >= 3 && p.sel >= M.count(p) - 1) p.sel = M.count(p);
    if (id === 't') drawTape();
    mark(how, id);
    after(how);
    if (how !== 'type') exploreCheck();
  }
  function after(how) { var s = S; refresh(); if (!s.drag) fit(false); camTarget(); saveHash(); }
  function onEdit(id, done) {
    var s = S; if (!s) return;
    if (id) { s.probe.on = false; s.F.pulse(id); }
    refresh(); layout();
    if (done) committed(done);
    s.dirty = true; need();
  }
  // a typed number was committed (Enter, the keypad's enter, or a tap away): this is the only thing that is judged
  function committed(id) { var s = S, f = s.find; if (id && id in s.p.txt || id && IDS.indexOf(id) >= 0) s.p.txt[id] = s.F.txt(id); if (f.pending) { f.pending = false; if (f.on && f.target && !f.target.found) f.evalAt = nowMs(); s.factsDue = true; } landNote(); saveHash(); need(); }
  function onCommit(id, typed) { var s = S, f = s.find; if (typed) committed(id); return !!(f.on && f.target && !f.target.found); }
  // move dot n to a point: dot 0 changes START and DISTANCE, a later dot changes TURN and STEP
  function moveDot(n, x, y, how, snap) {
    var s = S, p = s.p, z = s.cam.z, ease = how !== 'explore';
    if (p.rung === 1 && (p.xy || ease)) { M.place(s.a, 0, PT2); if (s.ptw.on) { PT2.x = s.xy[0]; PT2.y = s.xy[1]; } }
    if (snap) {
      var qd = niceDown(3.2 / z);
      if (p.rung === 1 && p.xy) { x = snapTo(x, qd); y = snapTo(y, qd); }
    }
    M.inverse(p, n, x, y, INV);
    if (snap && !(p.rung === 1 && p.xy)) {
      var dpx = Math.max(20, Math.sqrt(x * x + y * y) * z), qu = niceDown(3.2 / dpx / RAD * (p.mod / 360)), qd2 = niceDown(3.2 / z);
      if (n === 0 || p.rung < 2) { INV.start = snapTo(INV.start, qu); INV.dist = snapTo(INV.dist, qd2); }
      else { INV.turn = snapTo(INV.turn, niceDown(qu / n)); INV.step = snapTo(INV.step, niceDown(qd2 / n)); }
    }
    if (n === 0 || p.rung < 2) {
      p.start = INV.start; p.dist = INV.dist; p.square = null; p.txt.start = p.txt.dist = null;
      if (p.rung === 1 && ease) { setNow('start', p.start); setNow('dist', p.dist); M.place(p, 0, PT); var w = s.ptw; w.x0 = PT2.x; w.y0 = PT2.y; w.x1 = PT.x; w.y1 = PT.y; w.t0 = nowMs(); w.dur = 200; w.on = true; }
      else if (ease) { tween('start', p.start, 200); tween('dist', p.dist, 200); }
      else { setNow('start', p.start); setNow('dist', p.dist); s.ptw.on = false; }
    } else {
      p.turn = INV.turn; p.step = INV.step; p.turnSet = true; p.txt.turn = p.txt.step = null;
      if (ease) { tween('turn', p.turn, 200); tween('step', p.step, 200); } else { setNow('turn', p.turn); setNow('step', p.step); }
    }
  }
  function flip() {
    var s = S, p = s.p; if (p.rung !== 1) return;
    s.F.close(true); p.xy = !p.xy;
    buildFormula(); refresh(); layout(); saveHash(); landNote();
    if (s.find.on) newTarget(false);
  }
  function pick(r) {
    var s = S, p = s.p;
    if (r === 5) { var KL = root.KGLesson; if (!KL || typeof KL.open !== 'function') return; var h = s.host, st = exportState(); close(true); KL.open(h, { from: {howMany:st.howMany}, hash:false }); return; }
    setRung(r);
  }
  function setRung(r) {
    var s = S, p = s.p; if (r < 1 || r > 4 || r === p.rung) return;
    s.F.close(true); if (s.playing) setPlaying(false);
    var was = p.rung; p.rung = r; s.a.rung = r;
    if (!p.turnSet) { p.turn = (r >= 3 ? 30 : 90) * (p.mod / 360); tween('turn', p.turn, 400); }
    p.sel = r === 2 ? 1 : r >= 3 ? M.count(p) : 0;
    if (r >= 3 && was < 3) { s.a.count = Math.min(2, p.count); tween('count', p.count, 700); }
    s.ptw.on = false;
    s.findBtn.style.display = r === 1 ? '' : 'none';
    if (r !== 1 && s.find.on) setFind(false, true); else if (r === 1 && p.findOn && !s.find.on) setFind(true, true);
    s.pips.set(r - 1); buildFormula(); refresh(); layout(); fit(true); camTarget(); saveHash(); landNote();
  }
  function exportState() { var p = S.p; return { start: p.start, turn: p.turn * (360 / p.mod), howMany: p.count, t: p.t, mod: p.mod, distance: p.dist, step: p.step, rung: p.rung }; }

  // ------------------------------------------------------------------ the view: the circle always fits what was typed
  function maxDist() {
    var s = S, p = s.p, n = M.count(p), m = Math.abs(M.dist(p, 0)), e = n > 1 ? Math.abs(M.dist(p, n - 1)) : 0, tg = s.find.on ? s.find.target : null;
    if (e > m) m = e;
    if (tg) { e = tg.kind === 'xy' ? Math.sqrt(tg.x * tg.x + tg.y * tg.y) + tg.s : tg.d + tg.wd / 2; if (e > m) m = e; }
    return m;
  }
  function fit(force) {
    var s = S, m = maxDist(); if (!(m > 0)) return; if (m > 1.8e16) m = 1.8e16;
    var q = m / s.viewR;
    if (force || q > 0.93 || q < 0.3) { s.viewR = m / 0.75; if (s.viewR < 1e-6) s.viewR = 1e-6; }
  }
  // where the camera should be: the whole circle, or closing in on the target and the dot nearest to it
  function camTarget() {
    var s = S, f = s.find, tg = f.on ? f.target : null, c = s.camT, zd = s.R / s.viewR;
    c.x = 0; c.y = 0; c.z = zd;
    // FIND keeps the whole circle in view; no automatic target close-up.
    return;
  }

  // ------------------------------------------------------------------ layout: a true circle, as large as the screen allows
  function safe() {
    var s = S; if (!s.probeEl) { s.probeEl = E('div', null, null, s.root); s.probeEl.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'; }
    var c = getComputedStyle(s.probeEl); return { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 };
  }
  function layout() {
    var s = S, host = s.host, W = host.clientWidth || root.innerWidth || 390, H = host.clientHeight || root.innerHeight || 844;
    var dpr = Math.min(3, root.devicePixelRatio || 1), sf = safe(), F = s.F, editing = !!F.editing(), r = s.p.rung;
    s.W = W; s.H = H; s.dpr = dpr;
    var cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (s.cv.width !== cw || s.cv.height !== ch) { s.cv.width = cw; s.cv.height = ch; }
    var wide = s.wide = W >= H * 1.15, short = wide && H < 600, fs = wide && !short ? Math.max(28, Math.min(32, Math.round(W / 42))) : 28;
    var es = F.el.style, cs = F.chipsEl.style, ps = F.padEl.style, ts = s.timeEl.style, b = s.box, padH = 0, PW = 0;
    es.fontSize = fs + 'px'; s.fs = fs;
    F.padEl.classList.remove('row');
    s.pips.set(r - 1, !wide && W >= 900);
    if (wide) {
      PW = Math.max(330, Math.min(520, W - H)); if (short) PW = Math.max(330, Math.min(470, W - H + 16));
      var px = W - PW - sf.r;
      s.pips.el.style.cssText = 'left:' + (px + 4) + 'px;top:' + (4 + sf.t) + 'px';
      s.icons.style.cssText = 'right:' + (4 + sf.r) + 'px;top:' + (4 + sf.t) + 'px';
      es.cssText = 'font-size:' + fs + 'px;left:' + (px + 10) + 'px;top:' + (56 + sf.t) + 'px;width:' + (PW - 18) + 'px;bottom:auto;justify-content:flex-start';
      var twoRows = short && PW >= 400;
      F.padEl.classList.toggle('row', twoRows);
      if (short) { ps.cssText = 'left:' + px + 'px;width:' + PW + 'px;bottom:' + sf.b + 'px;height:'+(twoRows?104:196)+'px'; }
      else ps.cssText = 'left:' + px + 'px;width:' + PW + 'px;bottom:0;padding-bottom:' + (6 + sf.b) + 'px';
      padH = editing ? F.padEl.offsetHeight : 0;
      if (short) { es.maxHeight = Math.max(48,H - sf.t - sf.b - 96 - (editing ? (twoRows?108:200) : 8)) + 'px'; es.overflowY = 'auto'; es.pointerEvents = 'auto'; }
      var fh = F.el.offsetHeight;
      F.workingEl.style.cssText = 'left:'+(px+10)+'px;top:'+(56+sf.t+fh+4)+'px;width:'+(PW-20)+'px;height:32px';
      ts.cssText = 'left:' + (px + 6) + 'px;width:' + (PW - 12) + 'px;top:' + (56 + sf.t + fh + 6) + 'px';
      cs.cssText = 'left:' + (px + 10) + 'px;width:' + (PW - 20) + 'px;bottom:' + ((editing ? padH : sf.b) + 8) + 'px';
      b.l = sf.l; b.r = px; b.t = sf.t; b.b = H - sf.b;
      F.limitEl.style.cssText = 'left:' + (b.l + 12) + 'px;right:' + (W - b.r + 12) + 'px;top:' + (b.t + 60) + 'px';
    } else {
      s.pips.el.style.cssText = 'left:6px;top:' + (4 + sf.t) + 'px';
      s.icons.style.cssText = 'right:4px;top:' + (4 + sf.t) + 'px';
      ps.cssText = 'left:0;right:0;bottom:0;padding-bottom:' + (6 + sf.b) + 'px';
      padH = editing ? F.padEl.offsetHeight : 0;
      es.cssText = 'font-size:' + fs + 'px;left:12px;right:10px;top:auto;bottom:' + (editing ? padH + 4 : sf.b + 10) + 'px;min-height:' + (W < 520 ? [3, 5, 6, 8][r - 1] * 1.32 : 0) + 'em';
      if (r === 1) { es.minHeight = '0'; }
      es.bottom = ((editing ? padH + 4 : sf.b + 10) + 36) + 'px';
      F.workingEl.style.cssText = 'left:12px;right:10px;bottom:'+(editing ? padH+4 : sf.b+10)+'px;height:32px';
      var top = H - (editing ? padH + 4 : sf.b + 10) - 36 - F.el.offsetHeight;
      if (r >= 4 && !editing) { top -= 52; ts.cssText = 'left:6px;right:6px;top:' + top + 'px'; }
      cs.cssText = 'left:10px;right:10px;bottom:' + (H - top + 6) + 'px';
      b.l = 0; b.r = W; b.t = 50 + sf.t; b.b = top - 4;
      F.limitEl.style.cssText = 'left:12px;right:12px;top:' + (b.t + 44) + 'px';
    }
    s.timeEl.classList.toggle('on', r >= 4 && !(editing && !wide));
    var chipsHide = editing && !F.moreOpen();
    F.chipsEl.style.display = chipsHide ? 'none' : 'flex';
    var bw = b.r - b.l, bh = b.b - b.t;
    var strip = 36;
    s.RT = Math.max(1, Math.min(bw, bh - strip) / 2 - 8); s.cxT = (b.l + b.r) / 2; s.cyT = (b.t + strip + b.b) / 2;
    s.cx = s.cxT; s.cy = s.cyT; s.R = s.RT; s.first = false;
    s.cam.x = 0; s.cam.y = 0; s.cam.z = s.R / s.viewR;
    s.joyEl.style.left = (b.l + 16) + 'px'; s.joyEl.style.top = (b.b - 150) + 'px';
    drawTape(); camTarget();
    s.dirty = true; need();
  }

  // ------------------------------------------------------------------ pointer, wheel and keys on the drawing
  function X(wx) { return S.cx + (wx - S.cam.x) * S.cam.z; }
  function Y(wy) { return S.cy - (wy - S.cam.y) * S.cam.z; }
  function WX(sx) { return S.cam.x + (sx - S.cx) / S.cam.z; }
  function WY(sy) { return S.cam.y - (sy - S.cy) / S.cam.z; }
  function sampleN(i) { var n = S.nAnim; return n > CAP ? Math.floor(i * n / CAP) : i; }
  function hit(x, y, rad) {
    var s = S, xy = s.xy, n = s.nDraw + (s.ghost ? 1 : 0), i, best = -1, bd = rad * rad, dx, dy, d;
    for (i = 0; i < n; i++) { dx = X(xy[2 * i]) - x; dy = Y(xy[2 * i + 1]) - y; d = dx * dx + dy * dy; if (d < bd - 0.25) { bd = d; best = i; } }
    return best;
  }
  function inBox(x, y, m) { var b = S.box; m = m || 0; return x >= b.l + m && x <= b.r - m && y >= b.t + m && y <= b.b - m; }
  function bind() {
    var s = S, cv = s.cv;
    function pos(e, o) { var r = cv.getBoundingClientRect(); o.x = e.clientX - r.left; o.y = e.clientY - r.top; }
    var P = { x: 0, y: 0 };
    function slotOf(id) { return s.ptr[0].id === id ? s.ptr[0] : s.ptr[1].id === id ? s.ptr[1] : null; }
    function gap() { var a = s.ptr[0], b = s.ptr[1]; return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)) || 1; }
    function cancelPress() { if (s.press) { clearTimeout(s.press.hold); s.press = null; } }
    on(cv, 'pointerdown', function (e) {
      gesture();
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var sl = s.ptr[0].id < 0 ? s.ptr[0] : s.ptr[1].id < 0 ? s.ptr[1] : null; if (!sl) return;
      pos(e, P); sl.id = e.pointerId; sl.x = P.x; sl.y = P.y;
      try { cv.setPointerCapture(e.pointerId); } catch (_) { }
      if (s.ptr[0].id >= 0 && s.ptr[1].id >= 0) { if (s.drag) return; cancelPress(); s.pinch = { d0: gap(), v0: s.viewR, m0: s.zoomMul }; return; }
      if (!inBox(P.x, P.y)) return;
      var closing = !!s.F.editing() || s.F.moreOpen();
      var h = hit(P.x, P.y, e.pointerType === 'mouse' ? 20 : 32);
      if (h >= 0) {
        var N = h >= s.nDraw ? s.nAnim : sampleN(h);
        s.drag = { n: N, pid: e.pointerId, ox: P.x - X(s.xy[2 * h]), oy: P.y - Y(s.xy[2 * h + 1]), x0: P.x, y0: P.y, moved: false };
        s.probe.on = false;
        if (s.p.rung >= 2 && s.p.sel !== N) { s.p.sel = N; refresh(); }
        s.dirty = true; need();
      } else {
        if (closing) return;
        var pr = s.press = { pid: e.pointerId, x0: P.x, y0: P.y, t0: nowMs(), moved: false, held: false, hold: 0 };
        pr.hold = setTimeout(function () { if (S !== s || s.press !== pr || pr.moved || s.p.rung !== 1) return; pr.held = true; dropTarget(WX(pr.x0), WY(pr.y0)); }, 560);
      }
    });
    on(cv, 'pointermove', function (e) {
      pos(e, P);
      var sl = slotOf(e.pointerId); if (sl) { sl.x = P.x; sl.y = P.y; }
      if (s.pinch && s.ptr[0].id >= 0 && s.ptr[1].id >= 0) {
        var q = gap() / s.pinch.d0;
        if (s.camT.x === 0 && s.camT.y === 0) { s.viewR = Math.min(2.4e16, Math.max(1e-6, s.pinch.v0 / q)); camTarget(); s.cam.z = s.camT.z; }
        else { s.zoomMul = Math.min(40, Math.max(0.05, s.pinch.m0 * q)); camTarget(); }
        s.dirty = true; need(); return;
      }
      var d = s.drag;
      if (d && d.pid === e.pointerId) {
        if (!d.moved) { if (Math.abs(P.x - d.x0) + Math.abs(P.y - d.y0) < 4) return; d.moved = true; s.F.close(true); }
        moveDot(d.n, WX(P.x - d.ox), WY(P.y - d.oy), 'explore', true); mark('explore'); refresh(); saveHash();
        return;
      }
      var pr = s.press;
      if (pr && pr.pid === e.pointerId) { if (!pr.moved && Math.abs(P.x - pr.x0) + Math.abs(P.y - pr.y0) > 10) { pr.moved = true; clearTimeout(pr.hold); } return; }
      if (e.pointerType === 'mouse' && !e.buttons && !s.joy.on) {
        if (inBox(P.x, P.y, 2) && !s.F.editing()) { s.probe.on = true; s.probe.x = WX(P.x); s.probe.y = WY(P.y); emitProbe(); }
        else if (s.probe.on) { s.probe.on = false; chips(); }
        s.dirty = true; need();
      }
    });
    function up(e) {
      gesture();
      var sl = slotOf(e.pointerId); if (sl) sl.id = -1;
      try { cv.releasePointerCapture(e.pointerId); } catch (_) { }
      if (s.pinch) { s.pinch = null; return; }
      var d = s.drag;
      if (d && d.pid === e.pointerId) {
        s.drag = null;
        if (d.moved) { fit(false); camTarget(); exploreCheck(); saveHash(); }
        landNote(); s.dirty = true; need(); return;
      }
      var pr = s.press;
      if (pr && pr.pid === e.pointerId) {
        s.press = null; clearTimeout(pr.hold);
        if (e.type === 'pointerup' && !pr.moved && !pr.held && nowMs() - pr.t0 < 450 && s.p.rung <= 2 && inBox(pr.x0, pr.y0)) dropDot(WX(pr.x0), WY(pr.y0));
      }
    }
    on(cv, 'pointerup', up); on(cv, 'pointercancel', up);
    on(cv, 'pointerleave', function (e) { if (e.pointerType === 'mouse' && s.probe.on && !s.joy.on) { s.probe.on = false; chips(); s.dirty = true; need(); } });
    on(cv, 'contextmenu', function (e) { e.preventDefault(); });
    on(cv, 'wheel', function (e) {
      e.preventDefault();
      var f = Math.exp((e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * 0.0015);
      if (s.camT.x === 0 && s.camT.y === 0) s.viewR = Math.min(2.4e16, Math.max(1e-6, s.viewR * f)); else s.zoomMul = Math.min(40, Math.max(0.05, s.zoomMul / f));
      camTarget(); s.dirty = true; need();
    }, { passive: false });
    function rs() { if (S === s) { s.needLayout = true; need(); } }
    on(root, 'resize', rs); on(root, 'orientationchange', rs);
    if (root.ResizeObserver) { s.ro = new ResizeObserver(rs); s.ro.observe(s.host); s.ro.observe(s.F.el); }
    on(document, 'keydown', function (e) {
      if (e.defaultPrevented || s.F.editing()) return;
      if (e.key === 'Escape') { if (s.F.moreOpen()) s.F.more(false); else if (s.closeBtn) close(); }
      else if (e.key === ' ' && s.p.rung >= 4) { e.preventDefault(); gesture(); setPlaying(!s.playing); }
    });
    // the tape: drag the clock both ways
    var td = null;
    on(s.tape, 'pointerdown', function (e) { gesture(); td = { pid: e.pointerId, x0: e.clientX, t0: s.p.t }; try { s.tape.setPointerCapture(e.pointerId); } catch (_) { } if (s.playing) setPlaying(false); });
    on(s.tape, 'pointermove', function (e) {
      if (!td || td.pid !== e.pointerId) return;
      var t = Number((td.t0 - (e.clientX - td.x0) / 44).toFixed(2)); if (t > LIMIT) t = LIMIT; if (t < -LIMIT) t = -LIMIT;
      if (t === s.p.t) return;
      set('t', t, 'explore'); mark('explore', 't'); refresh(); fit(false); camTarget(); drawTape();
    });
    function tu(e) { if (td && td.pid === e.pointerId) { td = null; saveHash(); exploreCheck(); } }
    on(s.tape, 'pointerup', tu); on(s.tape, 'pointercancel', tu);
    // the joystick (pointer logic as in the simulator: capture, clamp to the ring, release to zero)
    var joy = s.joy, joyEl = s.joyEl, knob = s.knob;
    var joyAt = function (e) {
      var r = joyEl.getBoundingClientRect(), h = r.width / 2; var x = (e.clientX - r.left - h) / (h - 10), y = (e.clientY - r.top - h) / (h - 10);
      var d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; } joy.x = x; joy.y = y; if (d > joy.max) joy.max = d;
      knob.style.left = (36 + x * 40) + 'px'; knob.style.top = (36 + y * 40) + 'px';
    };
    on(joyEl, 'pointerdown', function (e) { gesture(); e.preventDefault(); joy.id = e.pointerId; joy.t0 = nowMs(); joy.max = 0; try { joyEl.setPointerCapture(e.pointerId); } catch (_) { } joyAt(e); need(); });
    on(joyEl, 'pointermove', function (e) { if (e.pointerId === joy.id) { joyAt(e); need(); } });
    var ju = function (e) {
      if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.left = knob.style.top = '36px';
      if (e.type === 'pointerup' && nowMs() - joy.t0 < 320 && joy.max < 0.3 && s.probe.on && s.p.rung <= 2) dropDot(s.probe.x, s.probe.y);
      need();
    };
    on(joyEl, 'pointerup', ju); on(joyEl, 'pointercancel', ju);
  }
  // a tap, a click or the joystick knob drops the dot on a point: exploring, eased, never rewarded
  function dropDot(wx, wy) {
    var s = S; s.F.close(true);
    moveDot(selN(), wx, wy, 'tap', true); mark('explore'); after('tap');
    s.timers.push(setTimeout(function () { if (S === s) { landNote(); exploreCheck(); } }, 240));
  }
  function setJoy(on) {
    var s = S; s.joy.on = !!on; s.joyEl.classList.toggle('on', s.joy.on); s.joyBtn.classList.toggle('lit', s.joy.on);
    if (!on) { s.probe.on = false; s.probe.vx = s.probe.vy = 0; chips(); }
    else { M.place(s.p, selN(), PT); s.probe.x = PT.x; s.probe.y = PT.y; s.probe.on = true; emitProbe(); }
    s.dirty = true; need();
  }
  function emitProbe() {
    var s = S, pr = s.probe, i; chips();
    if (!probeFns.length) return;
    M.six(pr.x, pr.y, s.p.mod, s.keptDeg, SIX);
    for (i = 0; i < probeFns.length; i++) { try { probeFns[i](SIX.deg, SIX.d); } catch (e) { } }
  }

  // ------------------------------------------------------------------ the clock
  function setPlaying(on) { var s = S; s.playing = !!on && s.p.rung >= 4; s.playBtn.innerHTML = s.playing ? SVG.pause : SVG.play; s.playBtn.setAttribute('aria-label', s.playing ? 'pause' : 'play'); if (!s.playing) saveHash(); s.last = nowMs(); need(); }
  function drawTape() {
    var s = S, c = s.tape; if (!c || s.p.rung < 4) return;
    var w = c.clientWidth, h = 48, dpr = s.dpr; if (!w) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    var x = c.getContext('2d'), t = s.p.t, pp = 44, k0 = Math.floor(t - w / 2 / pp) - 1, k1 = Math.ceil(t + w / 2 / pp) + 1, k, X0, every = Math.abs(t) < 90 ? 2 : Math.abs(t) < 9000 ? 5 : 0;
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    x.strokeStyle = 'rgba(102,204,255,.5)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, 40.5); x.lineTo(w, 40.5);
    if (k1 - k0 > 80) k1 = k0 + 80;
    for (k = k0; k <= k1; k++) { X0 = w / 2 + (k - t) * pp; x.moveTo(X0, 40); x.lineTo(X0, every && k % every === 0 ? 28 : 34); }
    x.stroke();
    x.font = '400 24px ' + FONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(255,255,255,.6)';
    if (every) for (k = k0; k <= k1; k++) if (k % every === 0) x.fillText(String(k), w / 2 + (k - t) * pp, 14);
    x.fillStyle = '#ffb000'; x.beginPath(); x.moveTo(w / 2, 30); x.lineTo(w / 2 - 7, 46); x.lineTo(w / 2 + 7, 46); x.closePath(); x.fill();
  }

  // ------------------------------------------------------------------ sound: soft, after a gesture, pitch from the angle
  var SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  function gesture() {
    var s = S; if (!s || muted()) return;
    if (s.ac) { if (s.ac.state === 'suspended') { try { s.ac.resume(); } catch (e) { } } return; }
    var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return;
    try { s.ac = new AC(); } catch (e) { s.ac = null; }
  }
  function tone(freq, vol, dur, delay) {
    var s = S; if (!s || !s.ac || muted() || s.ac.state !== 'running') return;
    try {
      var ac = s.ac, t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { }
  }
  function landNote() {
    var s = S, now = nowMs(); if (!s || now - s.lastNote < 45) return; s.lastNote = now;
    M.place(s.p, selN(), PT2);
    var deg = PT2.d < 0 ? mod(PT2.deg + 180, 360) : PT2.deg;
    tone(220 * Math.pow(2, SCALE[Math.floor(deg / 360 * 10)] / 12), 0.1, 0.4, 0);
  }
  function phrase(n, base, vol) { var i; for (i = 0; i < n; i++) tone((base || 330) * Math.pow(2, SCALE[i * 2] / 12), vol || 0.09, 0.5, i * 0.11); }

  // ------------------------------------------------------------------ FIND: a target, typed tries, a supernova
  function setFind(on, quiet) {
    var s = S, f = s.find; if (on && s.p.rung !== 1) return;
    f.on = !!on; if (!quiet || on) s.p.findOn = f.on;
    s.findBtn.classList.toggle('lit', f.on);
    if (f.on) { if (!f.target) newTarget(false); } else { f.target = null; f.gN = 0; f.nova.on = false; s.zoomMul = 1; }
    fit(false); camTarget(); refresh();
  }
  function targetSize(base) { return { angleDeg: Math.max(5, base.angleDeg), distance: Math.max(0.25, base.distance) }; }
  function seqDef(i) {
    var s = S, L = s.T.levels, q = [], k;
    for (k = 0; k < L.length; k++) q.push({ lv: k, turns: 0 });
    return q[i < q.length ? i : q.length - 1];
  }
  function p10(v) { return Math.pow(10, Math.floor(Math.log10(v) + 1e-9)); }
  function isMult(v, q) { var r = v / q; return Math.abs(r - Math.round(r)) < 1e-6; }
  function cellFor(def, u, d) {   // a polar cell at u (circle units), d; equal in area wherever it sits
    var s = S, T = s.T, base = targetSize(T.levels[def.lv]), C = s.p.mod, wdeg = base.angleDeg;
    if (T.equalArea && d > 0) wdeg = Math.min(90, base.angleDeg * T.refDistance / d);
    return { kind: 'polar', deg: mod(u, C) * (360 / C), u: mod(u, C), d: d, wdeg: Math.max(5, wdeg), wd: base.distance, turns: def.turns, lv: def.lv, found: false };
  }
  function newTarget(advance) {
    var s = S, f = s.find, p = s.p, T = s.T, R = s.rand, def, base, i, C = p.mod, tg = null;
    if (advance) f.seq++;
    def = seqDef(f.seq); base = targetSize(T.levels[def.lv]);
    M.place(p, 0, PT2);
    var cd = Math.abs(PT2.d), cdeg = PT2.d < 0 ? mod(PT2.deg + 180, 360) : PT2.deg;
    if (p.rung === 1 && p.xy) {
      var sz = base.distance, q = p10(sz), x = 0, y = 0;
      for (i = 0; i < 60; i++) {
        x = snapTo((R() * 2 - 1) * 3.4, q); y = snapTo((R() * 2 - 1) * 3.4, q);
        var h = Math.sqrt(x * x + y * y); if (h < 1 || h > 4.6) continue;
        if (i < 40 && def.lv >= 1 && isMult(x, q * 10) && isMult(y, q * 10)) continue;
        if (i < 40 && (Math.abs(x - PT2.x) < sz + 0.4 || Math.abs(y - PT2.y) < sz + 0.4)) continue;
        break;
      }
      if (Math.abs(x - PT2.x) < sz || Math.abs(y - PT2.y) < sz) { x = PT2.x < 0 ? 2 : -2; y = PT2.y < 0 ? 2 : -2; }
      tg = { kind: 'xy', x: x, y: y, s: sz, turns: 0, lv: def.lv, found: false };
    } else {
      var qd = Math.max(0.1, p10(base.distance)), qa = Math.max(0.01, p10(base.angleDeg * C / 360)), d = 3, u = 0;
      for (i = 0; i < 60; i++) {
        d = snapTo(1.5 + R() * 3, qd); u = snapTo(R() * C, qa); if (u >= C) u = 0;
        if (i < 40 && def.lv >= 2 && isMult(d, qd * 10)) continue;
        if (i < 40 && def.lv >= 1 && isMult(u, qa * 10)) continue;
        var dd = Math.abs(mod(u * 360 / C - cdeg + 180, 360) - 180);
        if (dd < Math.max(25, base.angleDeg) || Math.abs(d - cd) < base.distance * 0.75 + 0.3) continue;
        break;
      }
      if (i === 60) { d = cd < 3 ? 4.5 : 1.5; u = snapTo(mod(cdeg + 180, 360) * C / 360, qa); }
      tg = cellFor(def, u, d);
    }
    f.target = tg; f.gN = 0; f.gI = 0; f.tries = 0; f.explored = false; f.typedIds = {}; f.lastHow = ''; f.evalAt = 0; f.born = nowMs(); f.held = false;
    s.zoomMul = 1; fit(false); camTarget(); s.dirty = true; need();
  }
  // press and hold in the circle: a target there, for someone else to find
  function dropTarget(wx, wy) {
    var s = S, f = s.find, p = s.p, def = seqDef(f.seq), base = targetSize(s.T.levels[def.lv]);
    if (!f.on) { f.on = true; p.findOn = true; s.findBtn.classList.add('lit'); }
    if (p.rung === 1 && p.xy) { var q = p10(base.distance); f.target = { kind: 'xy', x: snapTo(wx, q), y: snapTo(wy, q), s: base.distance, turns: 0, lv: def.lv, found: false }; }
    else {
      M.six(wx, wy, p.mod, 0, SIX);
      f.target = cellFor({ lv: def.lv, turns: 0 }, snapTo(SIX.rem, p10(base.angleDeg * p.mod / 360)), Math.max(p10(base.distance), snapTo(SIX.d, p10(base.distance))));
    }
    f.gN = 0; f.gI = 0; f.tries = 0; f.explored = false; f.typedIds = {}; f.lastHow = ''; f.evalAt = 0; f.born = nowMs(); f.held = true;
    tone(660, 0.08, 0.5, 0); fit(false); camTarget(); refresh();
  }
  function typedOK() { return S.find.lastHow === 'type'; }
  function ghost(x, y) {
    var f = S.find, g = f.ghosts, i;
    for (i = 0; i < f.gN; i++) if (g[2 * i] === x && g[2 * i + 1] === y) return;
    g[2 * f.gI] = x; g[2 * f.gI + 1] = y; f.gI = (f.gI + 1) % 12; if (f.gN < 12) f.gN++;
  }
  // which true dot (if any) is in the cell: returns its number or -1; near = the closest dot's place, in PT
  function inCell(needTurns) {
    var s = S, p = s.p, tg = s.find.target, n = M.count(p), lim = n > CAP ? CAP : n, i, N, be = Infinity, e, bx = 0, by = 0, hitN = -1;
    var tx = tg.kind === 'xy' ? tg.x : tg.d * Math.cos(tg.deg * RAD), ty = tg.kind === 'xy' ? tg.y : tg.d * Math.sin(tg.deg * RAD);
    for (i = 0; i < lim; i++) {
      N = n > CAP ? Math.floor(i * n / CAP) : i; M.place(p, N, PT2);
      e = (PT2.x - tx) * (PT2.x - tx) + (PT2.y - ty) * (PT2.y - ty); if (e < be) { be = e; bx = PT2.x; by = PT2.y; }
      if (hitN < 0 && M.inside(tg, PT2)) hitN = N;
    }
    PT.x = bx; PT.y = by;
    return hitN;
  }
  function judge(now) {
    var s = S, f = s.find; if (!f.target || f.target.found) return;
    var h = inCell(true);
    if (h >= 0 && typedOK()) { supernova(now); return; }
    f.tries++; ghost(PT.x, PT.y);
    if (h >= 0 || inCell(false) >= 0) soft(now);
  }
  function exploreCheck() { var s = S, f = s.find; if (!s || !f.on || !f.target || f.target.found) return; if (inCell(false) >= 0) soft(nowMs()); }
  // reached without typing (or without enough circles): a soft glow, and the numbers ask to be typed
  function soft(now) {
    var s = S, f = s.find; if (now - f.softAt < 700) return;
    f.softAt = now; f.softs++;
    if (s.p.rung === 1 && s.p.xy) { s.F.pulse('x'); s.F.pulse('y'); } else { s.F.pulse('start'); if (!f.target.turns) s.F.pulse('square'); }
    tone(392, 0.05, 0.6, 0);
  }
  function supernova(now) {
    var s = S, f = s.find, tg = f.target, nv = f.nova, tr = f.tries + 1, band = s.T.triesBand, i, P = s.part;
    tg.found = true; f.novas++; s.p.stars++;
    // the score only goes up: more for a smaller target, more for fewer typed tries
    s.p.score += 10 * (tg.lv + 1) * (tr <= band[0] ? 3 : tr <= band[1] ? 2 : 1);
    s.p.found.push(tg.kind === 'xy' ? tg.x : tg.d * Math.cos(tg.deg * RAD), tg.kind === 'xy' ? tg.y : tg.d * Math.sin(tg.deg * RAD)); if (s.p.found.length > 160) s.p.found.splice(0, 2);
    nv.on = true; nv.t0 = now; nv.scale = tr <= band[0] ? 1.6 : tr <= band[1] ? 1.25 : 1;
    nv.x = tg.kind === 'xy' ? tg.x : tg.d * Math.cos(tg.deg * RAD); nv.y = tg.kind === 'xy' ? tg.y : tg.d * Math.sin(tg.deg * RAD);
    nv.gentle = s.reduced || now - f.lastFlash < 400;
    if (!nv.gentle) { f.lastFlash = now; f.flashTimes.push(now); if (f.flashTimes.length > 12) f.flashTimes.shift(); }
    for (i = 0; i < 96; i++) { var a = s.rand() * TAU, v = (0.35 + s.rand() * 0.9) * nv.scale; P[4 * i] = Math.cos(a) * v; P[4 * i + 1] = Math.sin(a) * v; P[4 * i + 2] = 0.5 + s.rand() * 0.5; P[4 * i + 3] = s.rand(); }
    var b = nv.scale > 1.4 ? 5 : nv.scale > 1.1 ? 4 : 3; for (i = 0; i < b; i++) tone(262 * Math.pow(2, [0, 4, 7, 12, 16][i] / 12), 0.1, 0.9, i * 0.1);
    f.nextAt = now + 1700; f.evalAt = 0;
    need();
  }
  function queueRoll() { if(S) { S.find.quietAt=nowMs()+220; need(); } }
  function findTick(now) {
    var s = S, f = s.find, tg = f.target; if (!f.on) return false;
    if (f.nova.on && now - f.nova.t0 > 1700) { f.nova.on = false; newTarget(true); refresh(); return true; }
    if (!tg) return false;
    if(f.quietAt && now>=f.quietAt && !busy()) { f.quietAt=0; if(!tg.found && inCell(false)>=0 && f.lastHow==='explore') { tg.found=true; s.p.score+=1; s.p.found.push(PT.x,PT.y); if(s.p.found.length>160)s.p.found.splice(0,2); newTarget(true); refresh(); return true; } }
    var i, n = s.nDraw, xy = s.xy, best = -1, bw = -1, w;
    for (i = 0; i < n; i++) { w = warm(s.T, tg, xy[2 * i], xy[2 * i + 1]); if (w > bw) { bw = w; best = i; } }
    f.heat = bw < 0 ? 0 : bw; f.hot = best; f.inside = best >= 0 && M.insideAt(tg, xy[2 * best], xy[2 * best + 1]);
    if (f.evalAt && now >= f.evalAt && !busy() && !f.nova.on) { f.evalAt = 0; judge(now); }
    return true;
  }
  // small things to come across, each one a fact of the rule: typed values earn them
  function facts() {
    var s = S, p = s.p, k = p.facts, r = p.rung, got = '';
    if (!s.factsDue || busy()) return; s.factsDue = false;
    if (s.find.lastHow !== 'type') return;
    if (!k.wind && Math.abs(circles(p.start, p.mod)) >= 1) got = 'wind';
    if (r >= 3) {
      var n = M.count(p);
      if (!k.spokes && closedRing(p)) got = 'spokes';
      else if (!k.real && n >= 30 && p.turn === 2654435769 && p.mod === 4294967296) got = 'real';   // the exact whole-number rule, never a rounded turn
    }
    if (!got) return;
    k[got] = 1; s.cele.t0 = nowMs(); s.cele.kind = got; phrase(4, 392, 0.09); need();
  }
  // a ring closes when STEP is 0 and HOW MANY x TURN is a whole number of circles
  function closedRing(a) { var n = M.count(a); return a.rung >= 3 && n >= 2 && a.step === 0 && mod(a.turn, a.mod) !== 0 && exact({rung:2,start:0,turn:a.turn,mod:a.mod},n).m === '0'; }

  // ------------------------------------------------------------------ one frame
  function tick(now) {
    var s = S; if (!s) return; s.raf = 0;
    var dt = Math.min(0.1, Math.max(0, (now - s.last) / 1000)), p = s.p, a = s.a, anim = false, landed = false, i, id, w, k;
    s.last = now;
    if (s.needLayout && !s.drag) { s.needLayout = false; layout(); }
    if (s.pips && (now - (s.kChk || 0) > 800)) { s.kChk = now; s.pips.kuiper(!!(root.KGLesson && typeof root.KGLesson.open === 'function')); }
    for (i = 0; i < IDS.length; i++) {
      id = IDS[i]; w = s.tw[id]; if (!w.on) continue;
      k = (now - w.t0) / w.dur;
      if (k >= 1) { a[id] = w.to; w.on = false; landed = true; } else { k = 1 - Math.pow(1 - k, 3); a[id] = w.from + (w.to - w.from) * k; }
      anim = true;
    }
    if (s.ptw.on) { k = (now - s.ptw.t0) / s.ptw.dur; if (k >= 1) { s.ptw.on = false; landed = true; } anim = true; }
    if (landed && !busy()) landNote();
    if (s.factsDue) facts();
    if (s.playing) {
      p.t += dt; if (p.t > LIMIT) { p.t = LIMIT; setPlaying(false); s.F.limit(); }
      a.t = p.t; s.F.setValue('t', p.t); var ex=exact(p,selN()); s.F.setText('ang',ex.m); s.F.workingEl.textContent=ex.raw+' = '+ex.q+' × '+p.mod+' + '+ex.m; s.F.setText('dis', fmt(M.dist(p, selN()), 4));
      drawTape(); fit(false); camTarget(); anim = true;
    }
    k = 1 - Math.exp(-dt / 0.09);
    if (Math.abs(s.cxT - s.cx) + Math.abs(s.cyT - s.cy) + Math.abs(s.RT - s.R) > 0.3) { s.cx += (s.cxT - s.cx) * k; s.cy += (s.cyT - s.cy) * k; s.R += (s.RT - s.R) * k; camTarget(); anim = true; }
    else if (s.cx !== s.cxT || s.cy !== s.cyT || s.R !== s.RT) { s.cx = s.cxT; s.cy = s.cyT; s.R = s.RT; camTarget(); anim = true; }
    var c = s.cam, ct = s.camT, lz = Math.log(c.z), lt = Math.log(ct.z), kc = 1 - Math.exp(-dt / 0.12);
    if (Math.abs(lt - lz) > 0.002 || (Math.abs(ct.x - c.x) + Math.abs(ct.y - c.y)) * c.z > 0.3) { c.z = Math.exp(lz + (lt - lz) * kc); c.x += (ct.x - c.x) * kc; c.y += (ct.y - c.y) * kc; anim = true; }
    else if (c.z !== ct.z || c.x !== ct.x || c.y !== ct.y) { c.z = ct.z; c.x = ct.x; c.y = ct.y; anim = true; }
    var j = s.joy, pr = s.probe;
    if (j.on) {
      var kj = 1 - Math.exp(-dt * 8); pr.vx += (j.x * 300 - pr.vx) * kj; pr.vy += (j.y * 300 - pr.vy) * kj;
      if (Math.abs(pr.vx) + Math.abs(pr.vy) > 0.5) {
        var sx = Math.min(s.box.r - 6, Math.max(s.box.l + 6, X(pr.x) + pr.vx * dt)), sy = Math.min(s.box.b - 6, Math.max(s.box.t + 6, Y(pr.y) + pr.vy * dt));
        pr.x = WX(sx); pr.y = WY(sy); pr.on = true; emitProbe(); anim = true;
      }
    }
    positions();
    if (findTick(now)) anim = true;
    if (now - s.cele.t0 < 1400 || now - s.stackPulse < 500) anim = true;
    if (s.dirty || anim) { s.dirty = false; draw(now); }
    if (anim || s.dirty) need();
  }
  function positions() {
    var s = S, a = s.a, r = a.rung, n = M.count(a), nd = n > CAP ? CAP : n, xy = s.xy, i, N, w = s.ptw;
    for (i = 0; i < nd; i++) { N = n > CAP ? Math.floor(i * n / CAP) : i; M.place(a, N, PT); xy[2 * i] = PT.x; xy[2 * i + 1] = PT.y; }
    if (r === 1 && w.on) { var k = (nowMs() - w.t0) / w.dur; k = k >= 1 ? 1 : 1 - Math.pow(1 - k, 3); xy[0] = w.x0 + (w.x1 - w.x0) * k; xy[1] = w.y0 + (w.y1 - w.y0) * k; }
    s.nAnim = n; s.nDraw = nd; s.ghost = r >= 3 && n <= CAP;
    if (s.ghost) { M.place(a, n, PT); xy[2 * nd] = PT.x; xy[2 * nd + 1] = PT.y; }
  }

  // ------------------------------------------------------------------ drawing
  function lab(v, dec) {
    var s = S, m = s.labels[dec] || (s.labels[dec] = new Map()), t = m.get(v);
    if (t === undefined) { if (m.size > 400) m.clear(); t = fmt(v, dec); m.set(v, t); }
    return t;
  }
  function text(ctx, t, x, y, color, align) { ctx.textAlign = align || 'center'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(t, x, y); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(t, x, y); }
  function arcPoly(ctx, ox, oy, rp, t0, t1, cont) {
    var i, n = 28, t;
    for (i = 0; i <= n; i++) { t = t0 + (t1 - t0) * i / n; if (i === 0 && !cont) ctx.moveTo(ox + rp * Math.cos(t), oy - rp * Math.sin(t)); else ctx.lineTo(ox + rp * Math.cos(t), oy - rp * Math.sin(t)); }
  }
  function rimSteps() {
    var s = S, C = s.p.mod, key = C + ':' + Math.round(s.R); if (key === s.rimKey) return;
    s.rimKey = key;
    var st = C / 12; if (Math.abs(st - Math.round(st)) > 1e-9) st = niceUp(C / 12);
    var wmax = 14.5 * fmt(C, 4).length + 12, g = 0;
    while (TAU * (s.R - 26) * st / C < wmax && g++ < 8) st *= 2;
    var mn = 0; if (Math.abs(st - Math.round(st)) < 1e-9) { var q = Math.round(st); mn = q % 3 === 0 ? q / 3 : q % 5 === 0 ? q / 5 : q % 2 === 0 ? q / 2 : 0; }
    if (mn && (C / mn > 150 || TAU * s.R * mn / C < 7)) mn = 0;
    s.rimStep = st; s.rimMinor = mn; s.rimDec = stepDec(st);
  }
  function draw(now) {
    var s = S, ctx = s.ctx, dpr = s.dpr, b = s.box;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, s.W, s.H);
    ctx.save(); ctx.beginPath(); ctx.rect(b.l, b.t, b.r - b.l, b.b - b.t); ctx.clip();
    ctx.font = '400 24px ' + FONT; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    drawGrid(ctx);
    if(s.ringFlash && now-s.ringFlash.t<800) { ctx.strokeStyle='rgba(0,255,255,'+(1-(now-s.ringFlash.t)/800)+')'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(X(0),Y(0),s.ringFlash.d*s.cam.z,0,TAU); ctx.stroke(); }
    drawTarget(ctx, now);
    drawBuild(ctx, now);
    drawDots(ctx, now);
    drawProbe(ctx);
    drawNova(ctx, now);
    drawHud(ctx, now);
    ctx.restore();
  }
  function drawGrid(ctx) {
    var s = S, b = s.box, z = s.cam.z, p = s.p, C = p.mod, ox = X(0), oy = Y(0), xyMode = p.rung === 1 && p.xy, i, k, t;
    var centred = Math.abs(s.cam.x) * z < 0.75 && Math.abs(s.cam.y) * z < 0.75;
    var bx = (b.l + b.r) / 2, by = (b.t + b.b) / 2, hw = (b.r - b.l) / 2, hh = (b.b - b.t) / 2, hm = Math.min(hw, hh);
    var fx = Math.max(Math.abs(ox - b.l), Math.abs(ox - b.r)), fy = Math.max(Math.abs(oy - b.t), Math.abs(oy - b.b)), rmax = Math.sqrt(fx * fx + fy * fy);
    var nx = ox < b.l ? b.l - ox : ox > b.r ? ox - b.r : 0, ny = oy < b.t ? b.t - oy : oy > b.b ? oy - b.b : 0, rmin = Math.sqrt(nx * nx + ny * ny), inside = rmin === 0;
    var dr = niceUp(58 / z), drp = dr * z, dec = stepDec(dr), i0 = Math.max(1, Math.ceil(rmin / drp - 1e-9)), i1 = Math.floor(rmax / drp + 1e-9);
    if (i1 - i0 > 70) i1 = i0 + 70;
    s.dr = dr; s.drp = drp; s.centred = centred;
    var thc = 0, th0 = 0, th1 = TAU;
    if (!inside) {
      thc = Math.atan2(oy - by, bx - ox); var lo = 0, hi = 0, cxs = [b.l, b.r, b.r, b.l], cys = [b.t, b.t, b.b, b.b];
      for (i = 0; i < 4; i++) { t = Math.atan2(oy - cys[i], cxs[i] - ox) - thc; if (t > Math.PI) t -= TAU; else if (t < -Math.PI) t += TAU; if (t < lo) lo = t; if (t > hi) hi = t; }
      th0 = thc + lo; th1 = thc + hi;
    }
    // distance rings at round numbers
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(102,204,255,' + (xyMode ? '.1' : '.2') + ')';
    for (i = i0; i <= i1; i++) { ctx.beginPath(); if (inside) ctx.arc(ox, oy, i * drp, 0, TAU); else arcPoly(ctx, ox, oy, i * drp, th0, th1); ctx.globalAlpha = centred && i * drp > s.R + 2 ? 0.45 : 1; ctx.stroke(); }
    ctx.globalAlpha = 1;
    var every = Math.max(1, Math.ceil((14.5 * lab(i1 * dr, dec).length + 14) / drp));
    if (xyMode) {
      // the X, Y grid: lines at the same round numbers, numbered along the two axes
      var kx0 = Math.ceil((b.l - ox) / drp), kx1 = Math.floor((b.r - ox) / drp), ky0 = Math.ceil((oy - b.b) / drp), ky1 = Math.floor((oy - b.t) / drp);
      if (kx1 - kx0 > 80) kx1 = kx0 + 80; if (ky1 - ky0 > 80) ky1 = ky0 + 80;
      ctx.strokeStyle = 'rgba(102,204,255,.2)'; ctx.beginPath();
      for (k = kx0; k <= kx1; k++) { ctx.moveTo(ox + k * drp, b.t); ctx.lineTo(ox + k * drp, b.b); }
      for (k = ky0; k <= ky1; k++) { ctx.moveTo(b.l, oy - k * drp); ctx.lineTo(b.r, oy - k * drp); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,255,255,.45)'; ctx.beginPath(); ctx.moveTo(b.l, oy); ctx.lineTo(b.r, oy); ctx.moveTo(ox, b.t); ctx.lineTo(ox, b.b); ctx.stroke();
      var ly = Math.min(b.b - 16, Math.max(b.t + 16, oy + 18)), lx = Math.min(b.r - 8, Math.max(b.l + 46, ox - 10));
      for (k = kx0; k <= kx1; k++) if (k !== 0 && k % every === 0) text(ctx, lab(k * dr, dec), ox + k * drp, ly, 'rgba(255,255,255,.55)');
      for (k = ky0; k <= ky1; k++) if (k !== 0 && k % every === 0) text(ctx, lab(k * dr, dec), lx, oy - k * drp, 'rgba(255,255,255,.55)', 'right');
      if (centred) { ctx.strokeStyle = 'rgba(0,255,255,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, s.R, 0, TAU); ctx.stroke(); }
      return;
    }
    // the zero line at 3 o'clock
    if (oy > b.t && oy < b.b) { ctx.strokeStyle = 'rgba(0,255,255,.38)'; ctx.beginPath(); ctx.moveTo(Math.max(ox, b.l), oy); ctx.lineTo(centred ? ox + s.R : b.r, oy); ctx.stroke(); }
    if (inside) {
      rimSteps();
      var st = s.rimStep, mn = s.rimMinor, rr = centred ? s.R : Math.min(0.8 * hm, Math.max(60, rmax * 0.5)), a, ca, sa;
      if (centred) { ctx.strokeStyle = 'rgba(0,255,255,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, s.R, 0, TAU); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(0,255,255,.5)'; ctx.lineWidth = 1.5; ctx.beginPath();
      if (mn && centred) for (k = 0; k * mn < C - 1e-9 && k < 400; k++) { a = k * mn / C * TAU; ca = Math.cos(a); sa = Math.sin(a); ctx.moveTo(ox + (s.R - 5) * ca, oy - (s.R - 5) * sa); ctx.lineTo(ox + s.R * ca, oy - s.R * sa); }
      for (k = 0; k * st < C - 1e-9 && k < 400; k++) {
        a = k * st / C * TAU; ca = Math.cos(a); sa = Math.sin(a);
        if (centred) { ctx.moveTo(ox + (s.R - 11) * ca, oy - (s.R - 11) * sa); ctx.lineTo(ox + s.R * ca, oy - s.R * sa); }
        else { ctx.moveTo(ox, oy); ctx.lineTo(ox + rmax * ca, oy - rmax * sa); }
      }
      ctx.stroke();
      for (k = 0; k * st < C - 1e-9 && k < 400; k++) { a = k * st / C * TAU; text(ctx, lab(k * st, s.rimDec), ox + (rr - 27) * Math.cos(a), oy - (rr - 27) * Math.sin(a), 'rgba(0,255,255,.62)'); }
      // ring numbers along the zero line
      for (i = i0; i <= i1; i++) { var rp = i * drp; if (i % every !== 0 || (centred && rp > s.R - 58) || !inBox(ox + rp, oy + 17, 10)) continue; text(ctx, lab(i * dr, dec), ox + rp, oy + 17, 'rgba(159,220,255,.6)'); }
    } else {
      // far from the centre: the piece of the circle in view, lines of equal angle and arcs of equal distance, numbered
      var rc = Math.sqrt((bx - ox) * (bx - ox) + (by - oy) * (by - oy)), need = 110 / rc * (C / TAU), da = niceUp(need), u12 = C / 360;
      if (Math.abs(C / 12 - Math.round(C / 12)) < 1e-9 && need > 2 * u12) da = (need <= 5 * u12 ? 5 : need <= 10 * u12 ? 10 : need <= 30 * u12 ? 30 : 90) * u12;
      var adec = stepDec(da);
      var k0 = Math.ceil(th0 * C / TAU / da), k1 = Math.floor(th1 * C / TAU / da); if (k1 - k0 > 60) k1 = k0 + 60;
      ctx.strokeStyle = 'rgba(0,255,255,.26)'; ctx.lineWidth = 1; ctx.beginPath();
      for (k = k0; k <= k1; k++) { t = k * da * TAU / C; ctx.moveTo(ox + rmin * Math.cos(t), oy - rmin * Math.sin(t)); ctx.lineTo(ox + rmax * Math.cos(t), oy - rmax * Math.sin(t)); }
      ctx.stroke();
      var rl = rc - 0.4 * hm, tl = thc - 0.4 * hm / rc, xx, yy;
      for (k = k0; k <= k1; k++) { t = k * da * TAU / C; xx = ox + rl * Math.cos(t); yy = oy - rl * Math.sin(t); if (inBox(xx, yy, 26)) text(ctx, lab(mod(k * da, C), adec), xx, yy, 'rgba(0,255,255,.8)'); }
      for (i = i0; i <= i1; i++) { xx = ox + i * drp * Math.cos(tl); yy = oy - i * drp * Math.sin(tl); if (inBox(xx, yy, 26)) text(ctx, lab(i * dr, dec), xx, yy, 'rgba(159,220,255,.8)'); }
    }
  }
  function tgPath(ctx, tg, grow) {
    var g = grow || 0;
    if (tg.kind === 'xy') { var h = tg.s / 2; ctx.rect(X(tg.x - h) - g, Y(tg.y + h) - g, tg.s * S.cam.z + 2 * g, tg.s * S.cam.z + 2 * g); return; }
    var ox = X(0), oy = Y(0), z = S.cam.z, a0 = (tg.deg - tg.wdeg / 2) * RAD, a1 = (tg.deg + tg.wdeg / 2) * RAD, r0 = Math.max(0, tg.d - tg.wd / 2) * z, r1 = (tg.d + tg.wd / 2) * z;
    arcPoly(ctx, ox, oy, r1 + g, a0, a1, false); arcPoly(ctx, ox, oy, Math.max(0, r0 - g), a1, a0, true); ctx.closePath();
  }
  function drawTarget(ctx, now) {
    var s = S, f = s.find, tg = f.target, i, fd = s.p.found;
    if (s.p.rung === 1) for (i = 0; i < fd.length; i += 2) { starShape(ctx, X(fd[i]), Y(fd[i + 1]), 9); ctx.fillStyle = 'rgba(255,176,0,.9)'; ctx.fill(); }
    if (!f.on || !tg) return;
    var z = s.cam.z, tx = tg.kind === 'xy' ? tg.x : tg.d * Math.cos(tg.deg * RAD), ty = tg.kind === 'xy' ? tg.y : tg.d * Math.sin(tg.deg * RAD), sx = X(tx), sy = Y(ty);
    var size = (tg.kind === 'xy' ? tg.s : Math.min(tg.wd, tg.wdeg * RAD * tg.d)) * z;
    var heat = s.T.lights === 2 ? f.heat : 0, hz = 0.45 + 1.1 * heat, pulse = s.reduced ? 0.5 : 0.5 + 0.5 * Math.sin((now - f.born) / 1000 * TAU * hz);
    var softK = Math.max(0, 1 - (now - f.softAt) / 900), inK = f.inside ? 1 : 0, born = Math.min(1, (now - f.born) / 500);
    var al = (0.16 + 0.16 * pulse * (0.4 + 0.6 * heat) + 0.2 * inK + 0.25 * softK) * born;
    // the faint dots of earlier tries
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,255,255,.4)';
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,255,255,.55)'; ctx.fillStyle = 'rgba(0,255,255,.55)';
    for (i = 0; i < f.gN; i++) { var gx = X(f.ghosts[2 * i]), gy = Y(f.ghosts[2 * i + 1]); ctx.beginPath(); ctx.arc(gx, gy, 7, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(gx, gy, 2, 0, TAU); ctx.fill(); }
    if (tg.found) return;
    if (size < 20) { var gr = 16 + 5 * pulse + 6 * inK; ctx.globalAlpha = Math.min(1, 0.55 + 0.3 * pulse) * born; ctx.drawImage(s.glowG, sx - gr, sy - gr, 2 * gr, 2 * gr); ctx.globalAlpha = 1; }
    ctx.beginPath(); tgPath(ctx, tg, 0); ctx.fillStyle = 'rgba(0,255,255,' + al.toFixed(3) + ')'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,255,255,' + Math.min(1, 0.55 + 0.25 * pulse + 0.2 * inK).toFixed(3) + ')'; ctx.stroke();
    // empty rings beside the target: this one wants a number that goes round that many whole circles
    if (tg.turns > 0) {
      var have = Math.abs(circles(M.raw(s.a, 0), s.a.mod)), ex = sx + Math.max(size / 2, 12) + 22, ey = sy;
      for (i = 0; i < tg.turns; i++) { ctx.beginPath(); ctx.ellipse(ex, ey - i * 8 + (tg.turns - 1) * 4, 14, 5, 0, 0, TAU); ctx.strokeStyle = i < have ? 'rgba(0,255,255,.95)' : 'rgba(0,255,255,' + (0.4 + 0.4 * pulse).toFixed(2) + ')'; ctx.lineWidth = i < have ? 3 : 1.5; ctx.stroke(); }
    }
  }
  // what the formula builds: the arc from 3 o'clock, the distance line, the equal wedges, the triangle
  function drawBuild(ctx, now) {
    var s = S, p = s.p, a = s.a, r = p.rung, z = s.cam.z, ox = X(0), oy = Y(0), xy = s.xy, n = s.nDraw, C = a.mod, sel = selN(), i;
    if (!n) return;
    var x0 = xy[0], y0 = xy[1], sx0 = X(x0), sy0 = Y(y0), d0 = Math.sqrt(x0 * x0 + y0 * y0), dpx = d0 * z, deg0 = Math.atan2(y0, x0) / RAD; if (deg0 < 0) deg0 += 360;
    var cA = 'rgba(0,255,255,.95)', cD = 'rgba(102,204,255,.95)', cT = 'rgba(0,255,255,.95)';
    if (r === 1 && p.xy) {
      // the triangle under the dot: across is X, up is Y
      var fx = X(x0), fy = oy;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(fx, fy); ctx.lineTo(sx0, sy0); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = cD; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(sx0, sy0); ctx.stroke();
      var q = Math.min(12, Math.abs(fx - ox) / 2, Math.abs(sy0 - fy) / 2), sgx = x0 >= 0 ? -1 : 1, sgy = y0 >= 0 ? -1 : 1;
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(fx + sgx * q, fy); ctx.lineTo(fx + sgx * q, fy + sgy * q); ctx.lineTo(fx, fy + sgy * q); ctx.stroke();
      if (Math.abs(fx - ox) > 44) text(ctx, lab(Number(x0.toFixed(2)), 2), (ox + fx) / 2, fy + (y0 >= 0 ? 17 : -17), '#fff');
      if (Math.abs(sy0 - fy) > 30) text(ctx, lab(Number(y0.toFixed(2)), 2), fx + (x0 >= 0 ? 10 : -10), (fy + sy0) / 2, '#fff', x0 >= 0 ? 'left' : 'right');
      return;
    }
    // the distance line to dot 0, with its number
    ctx.lineWidth = 2; ctx.strokeStyle = cD; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(sx0, sy0); ctx.stroke();
    var ra = Math.max(24, Math.min(0.5 * dpx, 0.3 * s.R)), am = deg0 * RAD;
    if (dpx > 50 && inBox(ox + (sx0 - ox) * 0.68, oy + (sy0 - oy) * 0.68, 10)) { var pa = am + Math.PI / 2; text(ctx, lab(Number(d0.toFixed(4)), 4), ox + (sx0 - ox) * 0.68 + 17 * Math.cos(pa), oy + (sy0 - oy) * 0.68 - 17 * Math.sin(pa), cD); }
    // the arc from 3 o'clock to dot 0, with the remainder on it
    if (deg0 > 0.05 && dpx > 6) {
      ctx.lineWidth = 3; ctx.strokeStyle = cA; ctx.beginPath(); ctx.arc(ox, oy, ra, 0, -am, true); ctx.stroke();
      if (deg0 > 12 && r === 1) text(ctx, s.tw.start.on ? lab(Math.floor(mod(a.start, C)), 0) : lab(Number(mod(a.start, C).toFixed(4)), 4), ox + (ra + 22) * Math.cos(am / 2), oy - (ra + 22) * Math.sin(am / 2), cA);
    }
    // winding: a tail behind the dot while the number runs round
    if (s.tw.start.on && dpx > 10) {
      var dirn = s.tw.start.to > s.tw.start.from ? 1 : -1, tail = Math.min(1.4, Math.abs(s.tw.start.to - a.start) / C * TAU + 0.25);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,255,255,.35)'; ctx.beginPath(); ctx.arc(ox, oy, dpx, -am, -(am - dirn * tail), dirn > 0); ctx.stroke();
    }
    if (r < 2 || n < 2) return;
    // one equal wedge for every step of N, up to the chosen dot
    var tu = a.turn, sweep = (tu >= 0 ? 1 : -1) * mod(Math.abs(tu), C) / C * TAU, st0 = mod(M.raw(a, 0), C) / C * TAU, rw = Math.max(34, Math.min(0.62 * dpx, 0.5 * s.R)), m = Math.min(sel, 72), closed = closedRing(a);
    if (sweep !== 0 && dpx > 20) {
      for (i = 0; i < m; i++) {
        var w0 = st0 + i * sweep, w1 = w0 + sweep;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, rw, -w0, -w1, sweep > 0); ctx.closePath();
        ctx.fillStyle = 'rgba(0,255,255,' + (i % 2 ? '.1' : '.17') + ')'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,255,255,.55)'; ctx.stroke();
      }
      if (m >= 1 && Math.abs(sweep) > 0.2) { var wm = st0 + sweep / 2; text(ctx, lab(Number(mod(Math.abs(tu), C).toFixed(4)) * (tu < 0 ? -1 : 1), 4), ox + (rw + 20) * Math.cos(wm), oy - (rw + 20) * Math.sin(wm), cT); }
    }
    // the path from dot to dot, and on to where the next dot would land
    if (r >= 3 && n <= 600) {
      ctx.lineWidth = closed ? 2 : 1; ctx.strokeStyle = closed ? 'rgba(0,255,255,.75)' : 'rgba(102,204,255,.3)'; ctx.beginPath(); ctx.moveTo(sx0, sy0);
      for (i = 1; i < n; i++) ctx.lineTo(X(xy[2 * i]), Y(xy[2 * i + 1]));
      if (s.ghost) ctx.lineTo(X(xy[2 * n]), Y(xy[2 * n + 1]));
      ctx.stroke();
    }
    // the distance line to the chosen dot
    if (sel >= 1 && sel <= n && (sel < n || s.ghost) && s.nAnim <= CAP) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,176,0,.8)'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(xy[2 * sel]), Y(xy[2 * sel + 1])); ctx.stroke(); }
    // a closed ring says how many places its dots stand on
    if (closed && inBox(ox, oy - 26, 8)) text(ctx, lab(M.places(M.count(a), a.turn, C), 0), ox, oy - 26, cT);
  }
  function drawDots(ctx, now) {
    var s = S, p = s.p, r = p.rung, xy = s.xy, n = s.nDraw, b = s.box, f = s.find, sel = selN(), i, sx, sy;
    var hs = n <= 2 ? 20 : Math.max(5, Math.min(20, 27 - 3.1 * Math.log(n) / Math.LN2)), cele = Math.max(0, 1 - (now - s.cele.t0) / 1300), big = hs * (1 + 0.6 * cele);
    var few = r >= 2 && s.nAnim <= 24, ox = X(0), oy = Y(0);
    for (i = 0; i < n; i++) {
      sx = X(xy[2 * i]); sy = Y(xy[2 * i + 1]);
      if (sx < b.l - 24 || sx > b.r + 24 || sy < b.t - 24 || sy > b.b + 24) continue;
      ctx.drawImage(s.sprC, sx - big, sy - big, 2 * big, 2 * big);
    }
    // the chosen dot is amber; on rung 1 the dot is amber while it is held
    var am = r >= 2 ? (sel < n && s.nAnim <= CAP ? sel : -1) : (s.drag ? 0 : -1);
    if (am >= 0) { sx = X(xy[2 * am]); sy = Y(xy[2 * am + 1]); ctx.drawImage(s.sprA, sx - big * 1.25, sy - big * 1.25, big * 2.5, big * 2.5); }
    // the dot nearest the target burns warmer and brighter the closer it is
    if (f.on && f.target && f.hot >= 0 && f.hot < n) {
      var h = f.heat, k = Math.pow(Math.max(0, (h - 0.22) / 0.78), 1.6), g = hs * (1.1 + 1.5 * k);
      sx = X(xy[2 * f.hot]); sy = Y(xy[2 * f.hot + 1]);
      ctx.globalAlpha = Math.min(1, 0.15 + 0.85 * k); ctx.drawImage(s.sprH, sx - g, sy - g, 2 * g, 2 * g); ctx.globalAlpha = 1;
    }
    if (s.ghost) {
      sx = X(xy[2 * n]); sy = Y(xy[2 * n + 1]);
      ctx.lineWidth = 2; ctx.strokeStyle = sel === n ? '#ffb000' : 'rgba(255,255,255,.55)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(sx, sy, Math.max(7, hs * 0.55), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    if (few) {
      var m = n + (s.ghost ? 1 : 0), dx, dy, l;
      for (i = 0; i < m; i++) {
        sx = X(xy[2 * i]); sy = Y(xy[2 * i + 1]); dx = sx - ox; dy = sy - oy; l = Math.sqrt(dx * dx + dy * dy);
        if (l < 1) { dx = 0; dy = -1; l = 1; }
        sx += dx / l * (hs * 0.5 + 17); sy += dy / l * (hs * 0.5 + 17);
        if (inBox(sx, sy, 8)) text(ctx, lab(i, 0), sx, sy, i === sel ? '#ffb000' : i === n ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.85)');
      }
    }
  }
  function drawProbe(ctx) {
    var s = S, pr = s.probe; if (!pr.on) return;
    var ox = X(0), oy = Y(0), sx = X(pr.x), sy = Y(pr.y), d = Math.sqrt(pr.x * pr.x + pr.y * pr.y), dp = d * s.cam.z, a = Math.atan2(pr.y, pr.x); if (a < 0) a += TAU;
    var ra = Math.max(18, Math.min(dp * 0.42, 0.24 * s.R)), C = s.p.mod, dec = Math.min(4, stepDec(niceDown(3 / Math.max(20, dp) / RAD * (C / 360)))), ddec = Math.min(4, stepDec(niceDown(3 / s.cam.z)));
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(sx, sy); ctx.stroke();
    if (dp > 6) { ctx.beginPath(); ctx.arc(ox, oy, ra, 0, -a, true); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(sx, sy, 9, 0, TAU); ctx.moveTo(sx - 14, sy); ctx.lineTo(sx + 14, sy); ctx.moveTo(sx, sy - 14); ctx.lineTo(sx, sy + 14); ctx.stroke();
    var right = sx < s.box.r - 150, up = sy > s.box.t + 70;
    text(ctx, lab(Number((a / TAU * C).toFixed(dec)), dec), sx + (right ? 18 : -18), sy + (up ? -40 : 24), 'rgba(0,255,255,.95)', right ? 'left' : 'right');
    text(ctx, lab(Number(d.toFixed(ddec)), ddec), sx + (right ? 18 : -18), sy + (up ? -16 : 48), 'rgba(102,204,255,.95)', right ? 'left' : 'right');
  }
  function drawNova(ctx, now) {
    var s = S, nv = s.find.nova; if (!nv.on) return;
    var t = (now - nv.t0) / 1000, sx = X(nv.x), sy = Y(nv.y), i, P = s.part, R = Math.max(s.box.r - s.box.l, s.box.b - s.box.t);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (nv.gentle) { var g = Math.sin(Math.min(1, t / 1.6) * Math.PI), gr = 70 * nv.scale; ctx.globalAlpha = 0.55 * g; ctx.drawImage(s.glowW, sx - gr, sy - gr, 2 * gr, 2 * gr); ctx.restore(); return; }
    var k = Math.min(1, t / 0.9), e = 1 - Math.pow(1 - k, 3), fr = (30 + R * 0.75 * e) * nv.scale;
    ctx.globalAlpha = Math.max(0, 0.8 * (1 - k)); ctx.drawImage(s.glowW, sx - fr, sy - fr, 2 * fr, 2 * fr);
    ctx.globalAlpha = Math.max(0, 1 - k); ctx.lineWidth = 4; ctx.strokeStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(sx, sy, 10 + R * 0.5 * e * nv.scale, 0, TAU); ctx.stroke();
    var n = Math.min(96, Math.round(56 * nv.scale)), tp = Math.min(1, t / 1.5), ep = 1 - Math.pow(1 - tp, 2);
    for (i = 0; i < n; i++) {
      var px = sx + P[4 * i] * R * 0.42 * ep, py = sy + P[4 * i + 1] * R * 0.42 * ep, z = 5 + 9 * P[4 * i + 2] * (1 - tp);
      ctx.globalAlpha = Math.max(0, (1 - tp) * (0.5 + 0.5 * P[4 * i + 3])); ctx.drawImage(i % 3 ? s.sprH : s.sprC, px - z, py - z, 2 * z, 2 * z);
    }
    ctx.restore();
  }
  // the figures that go with the drawing: the stack of whole circles and what it adds back to, the running product,
  // one ring's worth, the row of lit stars
  function drawHud(ctx, now) {
    var s = S, p = s.p, a = s.a, b = s.box, r = p.rung, C = a.mod, sel = selN(), x = b.l + 14, y = b.t + 20, i, t;
    s.hudR = 0;
    if (r === 1 && p.xy) { scaleMark(ctx); stars(ctx); return; }
    var raw = M.raw(a, r === 1 ? 0 : sel), dm = divmod(raw, C), q = dm.q, m = dm.m;
    if (q !== s.lastCirc) { s.lastCirc = q; s.stackPulse = now; }
    if (q !== 0) {
      var k = Math.max(0, 1 - (now - s.stackPulse) / 450), nn = Math.min(Math.abs(q), 5), w = 15 + 4 * k;
      ctx.lineWidth = 2 + 2 * k; ctx.strokeStyle = q < 0 ? '#ffb000' : '#00ffff';
      if (q < 0) ctx.setLineDash([4, 3]);
      for (i = 0; i < nn; i++) { ctx.beginPath(); ctx.ellipse(x + 17, y + 6 - i * 5 + (nn - 1) * 2, w, 5 + k, 0, 0, TAU); ctx.stroke(); }
      ctx.setLineDash([]);
      var busyW = s.tw.start.on, dec = busyW ? 0 : 4;
      t = lab(q,0); if(ctx.measureText(t).width < b.r-x-70) text(ctx,t,x+42,y,'#fff','left');
    }
    scaleMark(ctx); stars(ctx);
  }
  function scaleMark(ctx) {
    var s = S, b = s.box, w = s.drp, x1 = b.r - 12, x0 = x1 - w, y = b.t + 26; if (!(w > 0) || w > (b.r - b.l) * 0.5 || s.hudR > x0 - 60) return;
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(159,220,255,.75)'; ctx.beginPath(); ctx.moveTo(x0, y - 7); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y - 7); ctx.stroke();
    text(ctx, lab(s.dr, stepDec(s.dr)), x0 - 8, y - 8, 'rgba(159,220,255,.8)', 'right');
  }
  function starShape(ctx, x, y, R) { var i, a; ctx.beginPath(); for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; var rr = i % 2 ? R * 0.45 : R; if (i) ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); else ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } ctx.closePath(); }
  function stars(ctx) {
    var s = S, p = s.p, b = s.box, x = b.l + 18, y = b.b - 18, i, k, fresh = s.find.nova.on;
    if (p.score > 0) { starShape(ctx, x, y, 10); ctx.fillStyle = fresh ? '#fff3c4' : '#ffb000'; ctx.fill(); var st = lab(p.score, 0); text(ctx, st, x + 16, y + 1, fresh ? '#fff3c4' : '#ffb000', 'left'); x += 30 + ctx.measureText(st).width + 14; }
    // the facts come across so far: a wound circle, a closed ring, the whole-number rule
    for (k in p.facts) {
      ctx.lineWidth = 2; ctx.strokeStyle = '#00ffff'; ctx.beginPath();
      if (k === 'wind') ctx.arc(x, y, 7, 0, TAU);
      else if (k === 'spokes') { for (i = 0; i < 3; i++) { var an = i * Math.PI / 3; ctx.moveTo(x - 8 * Math.cos(an), y - 8 * Math.sin(an)); ctx.lineTo(x + 8 * Math.cos(an), y + 8 * Math.sin(an)); } }
      else { for (i = 0; i < 8; i++) { var g = i * 2.39996, rr = 2.6 * Math.sqrt(i + 0.5); ctx.moveTo(x + rr * Math.cos(g) + 1.4, y - rr * Math.sin(g)); ctx.arc(x + rr * Math.cos(g), y - rr * Math.sin(g), 1.4, 0, TAU); } }
      ctx.stroke(); x += 24;
    }
  }

  // ------------------------------------------------------------------ the doors
  var api = {
    open: open, close: close, math: M, tuning: TUNING,
    rung: function (r) { if (S && r >= 1 && r <= 4) setRung(r | 0); },
    find: function (on) { if (S) setFind(on); },
    exportState: function () { return S ? exportState() : null; },
    // a plain copy of what is on screen, for looking at from outside
    state: function () {
      if (!S) return null;
      var s = S, p = s.p, f = s.find, tg = f.target, o = {
        rung: p.rung, start: p.start, mod: p.mod, dist: p.dist, square: p.square == null ? p.dist * p.dist : p.square, turn: p.turn, step: p.step, count: p.count, speed: p.speed, grow: p.grow, newDots: p.newDots, t: p.t, xy: p.xy, sel: selN(),
        dots: M.count(p), drawn: s.nDraw, viewR: s.viewR, cam: { x: s.cam.x, y: s.cam.y, z: s.cam.z }, box: { l: s.box.l, t: s.box.t, r: s.box.r, b: s.box.b }, cx: s.cx, cy: s.cy, R: s.R, W: s.W, H: s.H, wide: s.wide,
        editing: s.F.editing(), buffer: s.F.buffer(), more: s.F.moreOpen(), busy: busy(), playing: s.playing, reduced: s.reduced, audio: s.ac ? s.ac.state : 'none', muted: !!muted(),
        probe: { on: s.probe.on, x: s.probe.x, y: s.probe.y }, joy: s.joy.on, facts: Object.keys(p.facts), stars: p.stars, score: p.score, found: p.found.length / 2, circles: Number(exact(p,selN()).q), remainder: Number(exact(p,selN()).m), exact: exact(p,selN()),
        closed: closedRing(p), places: closedRing(p) ? M.places(M.count(p), p.turn, p.mod) : null,
        find: { on: f.on, seq: f.seq, tries: f.tries, novas: f.novas, softs: f.softs, heat: f.heat, inside: f.inside, ghosts: f.gN, novaOn: f.nova.on, gentle: f.nova.gentle, scale: f.nova.scale, flashTimes: f.flashTimes.slice(), pending: !!f.pending,
          target: tg ? { kind: tg.kind, deg: tg.deg, u: tg.u, d: tg.d, wdeg: tg.wdeg, wd: tg.wd, x: tg.x, y: tg.y, s: tg.s, turns: tg.turns, lv: tg.lv, found: tg.found } : null }
      };
      return o;
    },
    // where dot n really is: the formula's point and its place on the screen
    dot: function (n) { if (!S) return null; var o = M.place(S.p, n || 0, { x: 0, y: 0, d: 0, deg: 0 }); o.sx = X(o.x); o.sy = Y(o.y); return o; },
    toScreen: function (x, y) { return S ? { x: X(x), y: Y(y) } : null; },
    toWorld: function (sx, sy) { return S ? { x: WX(sx), y: WY(sy) } : null; },
    formula: function () { return S ? S.F : null; },
    reset: function () { var h = S ? S.host : null, o = S ? S.opts : null; if (S) close(true); KEEP = null; if (h) open(h, o); }
  };
  var KGFormula = {
    create: create, pips: pips, css: css, parse: parse, fmt: fmt, plain: plain, check: check, mod: mod, circles: circles, divmod: divmod,
    LIMIT: LIMIT, LIMIT_TEXT: LIMIT_TEXT, PIPS: PIPS, math: M,
    // fn(angleDeg, distance) is called as the probe moves (mouse over the circle, or the joystick)
    onProbe: function (fn) { if (typeof fn === 'function' && probeFns.indexOf(fn) < 0) probeFns.push(fn); return function () { var i = probeFns.indexOf(fn); if (i >= 0) probeFns.splice(i, 1); }; },
    // the row of number chips of the open play screen (null when it is not open)
    chips: function () { return S ? S.F : null; }
  };
  root.KGFormula = KGFormula;
  root.KGPlay = api;
  if (typeof document !== 'undefined') {
    (root.KGModules = root.KGModules || []).push({ id: 'play', label: 'PLAY', sentence: 'Place a dot with numbers', open: function (host) { return open(host, {}); }, close: function () { close(); } });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { KGPlay: api, KGFormula: KGFormula, math: M, mod: mod, circles: circles, divmod: divmod, parse: parse, fmt: fmt, plain: plain, check: check, snapTo: snapTo, niceDown: niceDown, niceUp: niceUp, tuning: TUNING, LIMIT: LIMIT };
})(typeof window !== 'undefined' ? window : globalThis);
