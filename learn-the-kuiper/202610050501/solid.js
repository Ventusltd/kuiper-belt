/* solid.js  Learn the Kuiper: the same rule one dimension up (SPHERE, CUBE, and the flat CIRCLE and SQUARE).
   Plain classic script, no build step, no network, works from file://. Own WebGL point renderer, Canvas 2D fallback.
   Registers as a module: window.KGModules.push({id:'solid', ...}). Exposes window.KGSolid (maths + test hooks).

   The rules (every key k is a whole number; MOD is exact in whole numbers for every k up to 2^53):
     SPHERE  r = CBRT(k)           u = MOD(k x G1, 2^32) / 2^32   v = MOD(k x G2, 2^32) / 2^32
             angle = 2 PI u,  h = 1 - 2 v,  X = r SQRT(1 - h h) COS(angle),  Y = r SQRT(1 - h h) SIN(angle),  Z = r h
     CUBE    s = CBRT(k), the surface of the centred cube of side s, unfolded as a 3 x 2 net of six equal faces:
             col = FLOOR(3u), row = FLOOR(2v), a = 3u - col, b = 2v - row, face = 3 row + col
     CIRCLE  r = SQRT(k), angle = 2 PI MOD(k x G0, 2^32) / 2^32   (the 2D Kuiper rule, G0 = 2654435769)
     SQUARE  s = SQRT(k), the perimeter of the centred square of side s: t = 4 u0, edge = FLOOR(t), a = t - edge
   Defaults G1 = 2447445413 (turn), G2 = 3242174889 (height): the plastic-number pair, chosen by the GPU run
   (solid\out\even.json): round-odd(0.5698402909980532 x 2^32) and round-odd(0.7548776662466927 x 2^32). */
(function () {
  'use strict';
  var T32 = 4294967296, T16 = 65536, LIMIT = 9007199254740992;
  var LIMIT_LINE = 'THAT NUMBER IS TOO LARGE FOR THIS COMPUTER TO SHOW. THE REAL LIMIT HERE IS 9,007,199,254,740,992.';
  var DEF = { G0: 2654435769, G1: 2447445413, G2: 3242174889 };

  /* ---------- exact maths ---------- */
  function mod32(x) { return x - Math.floor(x / T32) * T32; }          // exact for whole x <= 2^53 (power-of-two divide)
  function mulmod32(k, G) {                                              // MOD(k x G, 2^32), exact for whole k, G <= 2^53
    var kl = mod32(k), g = mod32(G), gh = Math.floor(g / T16), gl = g - gh * T16;
    var hi = (kl * gh) % T16;                                            // kl*gh < 2^48: exact
    return (hi * T16 + kl * gl) % T32;                                   // < 2^32 + 2^48: exact
  }
  function rootFn(name) { return name === 'CBRT' ? Math.cbrt : name === 'SQRT' ? Math.sqrt : function (k) { return k; }; }
  function invRoot(name, d) { return name === 'CBRT' ? d * d * d : name === 'SQRT' ? d * d : d; }
  function wholeRoot(k, p) {                                             // FLOOR(k^(1/p)) exactly, k whole <= 2^53
    var n = Math.floor(p === 3 ? Math.cbrt(k) : Math.sqrt(k));
    if (k < 9e15) {                                                      // fast exact path: every power below 2^53 is exact
      var m = Math.floor(p === 3 ? Math.cbrt(k) : Math.sqrt(k)), pm = function (x) { return p === 3 ? x * x * x : x * x; };
      while (m > 0 && pm(m) > k) m--; while (pm(m + 1) <= k) m++; if (pm(m + 1) < 9007199254740992) return m;
    }
    function pw(x) { return p === 3 ? BigInt(x) * BigInt(x) * BigInt(x) : BigInt(x) * BigInt(x); }
    var K = BigInt(k);
    while (n > 0 && pw(n) > K) n--;
    while (pw(n + 1) <= K) n++;
    return n;
  }
  function shellOf(k, root) {                                            // which shell (ring) key k starts in
    if (root === 'CBRT') return wholeRoot(k, 3);
    if (root === 'SQRT') return wholeRoot(k, 2);
    return k;
  }
  function place(shape, k, P, out) {                                     // P: {G0,G1,G2,root}; out: [x,y,z]
    out = out || [0, 0, 0];
    var rr = rootFn(P.root)(k), u, v, h, s, a, b, col, row, f, H, A, B, t, e;
    if (shape === 'sphere') {
      u = mulmod32(k, P.G1) / T32; v = mulmod32(k, P.G2) / T32; h = 1 - 2 * v; s = Math.sqrt(Math.max(0, 1 - h * h));
      a = 2 * Math.PI * u; out[0] = rr * s * Math.cos(a); out[1] = rr * s * Math.sin(a); out[2] = rr * h;
    } else if (shape === 'cube') {
      u = mulmod32(k, P.G1) / T32; v = mulmod32(k, P.G2) / T32;
      col = Math.floor(3 * u); row = Math.floor(2 * v); a = 3 * u - col; b = 2 * v - row; f = row * 3 + col;
      A = rr * (a - 0.5); B = rr * (b - 0.5); H = rr / 2;
      if (f === 0) { out[0] = H; out[1] = A; out[2] = B; } else if (f === 1) { out[0] = -H; out[1] = A; out[2] = B; }
      else if (f === 2) { out[0] = A; out[1] = H; out[2] = B; } else if (f === 3) { out[0] = A; out[1] = -H; out[2] = B; }
      else if (f === 4) { out[0] = A; out[1] = B; out[2] = H; } else { out[0] = A; out[1] = B; out[2] = -H; }
    } else if (shape === 'circle') {
      a = 2 * Math.PI * mulmod32(k, P.G0) / T32; out[0] = rr * Math.cos(a); out[1] = rr * Math.sin(a); out[2] = 0;
    } else {                                                             // square
      t = 4 * mulmod32(k, P.G0) / T32; e = Math.floor(t); a = t - e; H = rr / 2; A = rr * (a - 0.5);
      if (e === 0) { out[0] = A; out[1] = -H; } else if (e === 1) { out[0] = H; out[1] = A; }
      else if (e === 2) { out[0] = -A; out[1] = H; } else { out[0] = -H; out[1] = -A; }
      out[2] = 0;
    }
    return out;
  }
  function measure(shape, k) {                                           // VOLUME or AREA held by the first k keys
    if (shape === 'sphere') return 4 / 3 * Math.PI * k;
    if (shape === 'circle') return Math.PI * k;
    return k;                                                            // cube VOLUME = k, square AREA = k
  }
  function keyFromMeasure(shape, m) {
    if (shape === 'sphere') return Math.round(m * 3 / (4 * Math.PI));
    if (shape === 'circle') return Math.round(m / Math.PI);
    return Math.round(m);
  }
  function outerRadius(shape, root, k) {                                 // farthest a key-k point can be from the centre
    var r = rootFn(root)(k);
    return shape === 'cube' ? r * Math.sqrt(3) / 2 : shape === 'square' ? r * Math.SQRT2 / 2 : r;
  }
  function groupDigits(s) { var neg = s[0] === '-'; if (neg) s = s.slice(1); var p = s.split('.'), i = p[0], o = '';
    while (i.length > 3) { o = ',' + i.slice(-3) + o; i = i.slice(0, -3); } return (neg ? '-' : '') + i + o + (p.length > 1 ? '.' + p[1] : ''); }
  function fmtWhole(n) { return groupDigits(String(Math.round(n))); }
  function fmtReal(x, dp) {
    if (!isFinite(x)) return '0';
    if (Math.abs(x) >= 1e15) { var m = x.toPrecision(15).split('e+'), dg = m[0].replace('.', ''), ex = +m[1]; while (dg.length < ex + 1) dg += '0'; return '≈ ' + groupDigits(dg); }   // 15 significant digits, marked as near
    if (dp === undefined) dp = Math.abs(x) >= 1e6 ? 0 : Math.abs(x) >= 1000 ? 1 : 2;
    return groupDigits(x.toFixed(dp));
  }
  /* parse a typed number. whole: digits only. Returns {ok, v} or {over:true} or {bad:true} */
  function parseTyped(str, whole) {
    str = String(str).replace(/,/g, '').trim();
    if (!str || str === '.' || str === '-') return { bad: true };
    if (whole) {
      if (!/^\d+$/.test(str)) return { bad: true };
      if (BigInt(str) > BigInt(LIMIT)) return { over: true };
      var v = Number(str); return v < 1 ? { bad: true } : { ok: true, v: v };
    }
    if (!/^\d*\.?\d*$/.test(str)) return { bad: true };
    var ip = str.split('.')[0] || '0';
    if (BigInt(ip) > BigInt(LIMIT)) return { over: true };
    var x = Number(str); return isFinite(x) ? { ok: true, v: x } : { bad: true };
  }
  function hash01(i, seed) {                                             // 53-bit fair uniform in [0,1)
    function h32(x) { x = Math.imul(x ^ (x >>> 16), 0x7feb352d); x = Math.imul(x ^ (x >>> 15), 0x846ca68b); return (x ^ (x >>> 16)) >>> 0; }
    var a = h32(i * 2 + 1 + seed), b = h32(i * 2 + 2 + seed * 7919);
    return (a * 2097152 + (b >>> 11)) / 9007199254740992;
  }

  /* ---------- module ---------- */
  var S = null;  // live instance
  var CAP_DESKTOP = 200000, CAP_PHONE = 100000;

  var CSS = '\
.ks-root{position:absolute;inset:0;background:#000;overflow:hidden;font-family:"Segoe UI",Arial,sans-serif;font-weight:700;color:#cfefff;user-select:none;-webkit-user-select:none;touch-action:none}\
.ks-root canvas{position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none}\
.ks-top{position:absolute;left:12px;top:10px;right:80px;display:flex;flex-direction:column;gap:6px;pointer-events:none}\
.ks-chips{display:flex;gap:6px;flex-wrap:wrap;pointer-events:auto}\
.ks-chip{font:700 24px "Segoe UI",Arial,sans-serif;color:#66ccff;background:transparent;border:2px solid rgba(0,255,255,.35);border-radius:28px;padding:4px 7px;min-height:48px;cursor:pointer}\
.ks-chip.on{color:#000;background:#00ffff;border-color:#00ffff}\
.ks-formula{pointer-events:auto;display:flex;flex-direction:column;gap:2px;font-size:26px;line-height:34px;font-variant-numeric:tabular-nums;color:#9fdcff;white-space:nowrap}\
.ks-formula>div{display:flex;flex-wrap:wrap;align-items:baseline}\
.ks-formula span{white-space:pre}\
.ks-formula .n,.ks-num .n{color:#ffffff;cursor:pointer;border-bottom:2px solid rgba(255,176,0,.55);padding:0 2px}\
.ks-formula .n.ed,.ks-num .n.ed{color:#000;background:#ffb000;border-color:#ffb000}\
.ks-formula .w{color:#66ccff}\
.ks-x{position:absolute;right:8px;top:8px;width:72px;height:72px;border-radius:36px;border:2px solid rgba(0,255,255,.4);background:transparent;color:#66ccff;font:700 34px Arial;cursor:pointer}\
.ks-bot{position:absolute;left:10px;right:10px;bottom:10px;display:flex;flex-direction:column;gap:8px;pointer-events:none}\
.ks-nums{display:flex;gap:8px;flex-wrap:wrap;pointer-events:auto;justify-content:center}\
.ks-num{display:flex;flex-direction:column;align-items:center;border:2px solid rgba(0,255,255,.25);border-radius:14px;padding:2px 12px 4px;min-width:96px;max-width:100%;box-sizing:border-box}\
.ks-num .l{font-size:24px;color:#66ccff;line-height:28px}\
.ks-num .n{font-size:28px;line-height:34px;font-variant-numeric:tabular-nums;border-bottom:none;white-space:nowrap}\
.ks-num.goal{border-color:#ffb000;box-shadow:0 0 18px rgba(255,176,0,.5)}\
.ks-num.goal .l,.ks-num.goal .n{color:#ffb000}\
.ks-btns{display:flex;gap:8px;justify-content:center;pointer-events:auto}\
.ks-b{width:64px;height:56px;border-radius:14px;border:2px solid rgba(0,255,255,.4);background:transparent;color:#66ccff;font:700 26px "Segoe UI",Arial;cursor:pointer;display:flex;align-items:center;justify-content:center}\
.ks-b.on{color:#000;background:#ffb000;border-color:#ffb000}\
.ks-pad{display:none;grid-template-columns:repeat(4,1fr);gap:6px;pointer-events:auto;max-width:380px;margin:0 auto;width:100%}\
.ks-pad.open{display:grid}\
.ks-pad button{height:52px;border-radius:12px;border:2px solid rgba(0,255,255,.35);background:rgba(0,20,30,.85);color:#e8fbff;font:700 26px "Segoe UI",Arial;cursor:pointer}\
.ks-pad button.ok{background:#00ffff;color:#000}\
.ks-msg{position:absolute;left:12px;right:12px;top:45%;text-align:center;font-size:24px;color:#ffb000;pointer-events:none;opacity:0;transition:opacity .4s}\
.ks-stars{display:none}\
.ks-root.phone .ks-x{width:56px;height:56px;font-size:28px}\
.ks-root.phone .ks-top{right:12px}\
.ks-root.phone .ks-chips{padding-right:52px}\
.ks-root.land .ks-top{right:auto;width:330px}\
.ks-root.land .ks-formula{font-size:24px;line-height:29px}\
.ks-root.land .ks-chips{padding-right:0}\
.ks-root.land .ks-chip{min-height:44px}\
.ks-root.land .ks-top{gap:4px}\
.ks-root.land .ks-bot{right:auto;width:330px;left:12px;bottom:8px}\
.ks-root.land .ks-nums{flex-direction:column;align-items:stretch;gap:4px}\
.ks-root.land .ks-num{flex-direction:row;flex-wrap:wrap;justify-content:space-between;align-items:center;padding:0 10px;min-height:40px}\
.ks-root.land .ks-num .n{font-size:26px;margin-left:auto}\
.ks-side{position:absolute;right:8px;top:72px;bottom:8px;display:flex;flex-direction:column;gap:6px;justify-content:flex-start;align-items:flex-end;pointer-events:auto}\
.ks-side .ks-b{width:56px;height:50px}\
.ks-pad.ks-side{display:none;left:auto;top:auto;width:240px;grid-template-columns:repeat(4,1fr);margin:0}\
.ks-pad.ks-side.open{display:grid}\
';

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }

  function open(host, opts) {
    if (S) close();
    opts = opts || {};
    var st = {
      shape: 'sphere', N: 1000, key: 1000, G0: DEF.G0, G1: DEF.G1, G2: DEF.G2, root3: 'CBRT', root2: 'SQRT',
      yaw: 0.6, pitch: 0.38, zoom: 1, auto: true, muted: false, find: false, goalIx: 0, stars: 0,
      editing: null, buf: '', typedLast: false, playing: false, playAcc: 0
    };
    var I = { host: host, st: st, listeners: [], raf: 0, dead: false };
    S = I;
    var style = el('style'); style.textContent = CSS; host.appendChild(style); I.style = style;
    var root = el('div', 'ks-root'); host.appendChild(root); I.root = root;
    var cv = el('canvas'); root.appendChild(cv);
    var ov = el('canvas'); ov.style.pointerEvents = 'none'; root.appendChild(ov);
    var ctx = ov.getContext('2d');

    /* ----- UI ----- */
    var top = el('div', 'ks-top'); root.appendChild(top);
    var chips = el('div', 'ks-chips'); top.appendChild(chips);
    var chipEls = {};
    [['sphere', 'SPHERE'], ['cube', 'CUBE'], ['circle', 'CIRCLE']].forEach(function (c) {
      var b = el('button', 'ks-chip', c[1]); b.dataset.shape = c[0]; chips.appendChild(b); chipEls[c[0]] = b;
      on(b, 'click', function () {
        if (c[0] === 'circle' && (st.shape === 'circle' || st.shape === 'square')) setShape(st.shape === 'circle' ? 'square' : 'circle');
        else setShape(c[0]);
      });
    });
    var formula = el('div', 'ks-formula'); top.appendChild(formula);
    var x = el('button', 'ks-x', '×'); root.appendChild(x); on(x, 'click', function () { close(); });
    var stars = el('div', 'ks-stars'); root.appendChild(stars);
    var msg = el('div', 'ks-msg'); root.appendChild(msg);
    var bot = el('div', 'ks-bot'); root.appendChild(bot);
    var nums = el('div', 'ks-nums'); bot.appendChild(nums);
    var btns = el('div', 'ks-btns'); bot.appendChild(btns);
    var pad = el('div', 'ks-pad'); bot.appendChild(pad);
    function mkBtn(txt, fn, title) { var b = el('button', 'ks-b', txt); if (title) b.setAttribute('aria-label', title); btns.appendChild(b); on(b, 'click', fn); return b; }
    var bDown = mkBtn('▼', function () { stepKey(-1, false); }, 'down');
    var bUp = mkBtn('▲', function () { stepKey(1, false); }, 'up');
    var bPlay = mkBtn('▶', function () { togglePlay(); }, 'grow');
    var bFind = mkBtn('★', function () { st.find = !st.find; if (st.find) newGoal(); render(); }, 'find');
    var bMute = mkBtn('♪', function () { st.muted = !st.muted; bMute.textContent = st.muted ? '×♪' : '♪'; }, 'sound');
    holdRepeat(bUp, 1); holdRepeat(bDown, -1);
    ['7', '8', '9', '⌫', '4', '5', '6', 'C', '1', '2', '3', '.', '0', 'OK'].forEach(function (t) {
      var b = el('button', t === 'OK' ? 'ok' : '', t); if (t === 'OK') b.style.gridColumn = 'span 3'; pad.appendChild(b);
      on(b, 'click', function (e) { e.stopPropagation(); padKey(t); });
    });

    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o || false); I.listeners.push([t, ev, fn, o || false]); }
    function holdRepeat(b, d) {
      var tm = 0, iv = 0;
      on(b, 'pointerdown', function () { tm = setTimeout(function () { iv = setInterval(function () { stepKey(d, false); }, 70); }, 420); });
      var stop = function () { clearTimeout(tm); clearInterval(iv); };
      on(b, 'pointerup', stop); on(b, 'pointerleave', stop); on(b, 'pointercancel', stop);
      I.listeners.push([{ removeEventListener: stop }, 'x', stop, false]);
    }

    /* ----- state helpers ----- */
    function flat() { return st.shape === 'circle' || st.shape === 'square'; }
    function rootName() { return flat() ? st.root2 : st.root3; }
    function params() { return { G0: st.G0, G1: st.G1, G2: st.G2, root: rootName() }; }
    function measureLabel() { return flat() ? 'AREA' : 'VOLUME'; }
    function sizeLabel() { return (st.shape === 'cube' || st.shape === 'square') ? 'SIDE' : 'DISTANCE'; }

    function setShape(s) {
      var wasFlat = flat(); st.shape = s; var isFlat = flat();
      if (isFlat && !wasFlat) { st.pitchT = Math.PI / 2; } else if (!isFlat && wasFlat) { st.pitchT = 0.38; }
      st.find && newGoal();
      rebuild(); render();
    }

    /* ----- GOALS (typed FIND): fill a given volume or area ----- */
    var GOALS = { cube: [27, 343, 2197, 500, 3000, 12345], sphere: [10, 100, 523, 2000, 7777], circle: [9, 50, 314, 1000, 4321], square: [16, 50, 400, 1234, 9999] };
    function goalKey() { var g = GOALS[st.shape]; return g[st.goalIx % g.length]; }
    function newGoal() { /* keep goalIx; the goal is the next in the list for this shape */ }
    function checkGoal(typed) {
      if (!st.find) return;
      if (st.key === goalKey()) {
        if (typed) { burst(1); st.stars++; st.goalIx++; stars.textContent = new Array(Math.min(st.stars, 12) + 1).join('★'); }
        else glow();
      }
    }

    /* ----- numbers ----- */
    function setKey(k, typed) {
      k = Math.max(1, Math.min(LIMIT, Math.round(k)));
      var old = st.key; st.key = k; st.typedLast = !!typed;
      if (k > st.N && k <= capFor()) { st.N = k; rebuild(); }
      shellCross(old, k);
      checkGoal(typed);
      render();
    }
    function stepKey(d, auto) {
      ensureAudio();
      var k = st.key + d; if (k < 1 || k > LIMIT) return;
      var old = st.key; st.key = k; st.typedLast = false;
      if (k > st.N) { st.N = k; extend(); }
      shellCross(old, k);
      checkGoal(false);
      render();
    }
    function shellCross(oldK, newK) {
      if (newK <= oldK) return;
      var r = rootName(); if (r === 'k') return;
      var a = shellOf(oldK, r), b = shellOf(newK, r);
      if (b > a) { st.flashShell = b; st.flashT = 1; note(b); st.breath = 1; }
    }
    function capFor() { return (Math.min(innerWidth, innerHeight) < 600) ? CAP_PHONE : CAP_DESKTOP; }

    function showLimit() { msg.textContent = LIMIT_LINE; msg.style.opacity = 1; clearTimeout(I.msgT); I.msgT = setTimeout(function () { msg.style.opacity = 0; }, 3500); }

    var FIELDS = {
      N: { whole: true, get: function () { return st.N; }, set: function (v) { st.N = v; if (st.key > v) st.key = v; rebuild(); } },
      G1: { whole: true, get: function () { return st.G1; }, set: function (v) { st.G1 = v; rebuild(); } },
      G2: { whole: true, get: function () { return st.G2; }, set: function (v) { st.G2 = v; rebuild(); } },
      G0: { whole: true, get: function () { return st.G0; }, set: function (v) { st.G0 = v; rebuild(); } },
      KEY: { whole: true, get: function () { return st.key; }, set: function (v) { setKey(v, true); } },
      SIZE: { whole: false, get: function () { return rootFn(rootName())(st.key); }, set: function (v) { setKey(Math.max(1, Math.round(invRoot(rootName(), v))), true); } },
      MEAS: { whole: false, get: function () { return measure(st.shape, st.key); }, set: function (v) { setKey(Math.max(1, keyFromMeasure(st.shape, v)), true); } }
    };

    function startEdit(f) {
      ensureAudio();
      st.editing = f; st.buf = ''; st.previewKey = 0; pad.classList.add('open'); btns.style.display = 'none'; render(); layout();
    }
    function endEdit(apply) {
      var f = st.editing; if (!f) return;
      if (apply && st.buf !== '') {
        var p = parseTyped(st.buf, FIELDS[f].whole);
        if (p.over) showLimit(); else if (p.ok) FIELDS[f].set(p.v);
      }
      st.editing = null; st.buf = ''; st.previewKey = 0; pad.classList.remove('open'); btns.style.display = ''; render(); layout();
    }
    function padKey(t) {
      if (!st.editing) return;
      if (t === 'OK') return endEdit(true);
      if (t === 'C') st.buf = '';
      else if (t === '⌫') st.buf = st.buf.slice(0, -1);
      else if (t === '.') { if (!FIELDS[st.editing].whole && st.buf.indexOf('.') < 0) st.buf += (st.buf ? '.' : '0.'); }
      else if (st.buf.replace(/\D/g, '').length < 20) st.buf += t;
      livePreview(); render();
    }
    function livePreview() {   // the dot moves with every digit typed (KEY, SIZE, MEAS)
      var f = st.editing; if (!f || st.buf === '' || (f !== 'KEY' && f !== 'SIZE' && f !== 'MEAS')) return;
      var p = parseTyped(st.buf, FIELDS[f].whole); if (!p.ok) return;
      var k = f === 'KEY' ? p.v : f === 'SIZE' ? Math.round(invRoot(rootName(), p.v)) : keyFromMeasure(st.shape, p.v);
      if (k >= 1 && k <= LIMIT) { st.previewKey = k; }
    }

    function numSpan(f, text) {
      var s = el('span', 'n' + (st.editing === f ? ' ed' : ''), st.editing === f ? (st.buf === '' ? '_' : groupDigits(st.buf)) : text);
      s.dataset.f = f; return s;
    }
    function render() {
      // formula, at most three short lines
      formula.textContent = '';
      var rn = rootName();
      var l1 = el('div'); l1.appendChild(el('span', 'w', 'N ')); l1.appendChild(numSpan('N', fmtWhole(st.N)));
      l1.appendChild(el('span', 'w', '  ' + ((st.shape === 'cube' || st.shape === 'square') ? 'SIDE' : 'r') + ' = '));
      var rs = el('span', 'n', rn); rs.dataset.f = 'ROOT'; l1.appendChild(rs); l1.appendChild(el('span', 'w', ' k'));
      formula.appendChild(l1);
      if (flat()) {
        var l2 = el('div'); l2.appendChild(el('span', 'w', (st.shape === 'circle' ? 'TURN' : 'ALONG') + ' = MOD k x ')); l2.appendChild(numSpan('G0', String(st.G0))); formula.appendChild(l2);
      } else {
        var la = el('div'); la.appendChild(el('span', 'w', (st.shape === 'cube' ? 'FACE' : 'TURN') + ' = MOD k x ')); la.appendChild(numSpan('G1', String(st.G1))); formula.appendChild(la);
        var lb = el('div'); lb.appendChild(el('span', 'w', 'UP = MOD k x ')); lb.appendChild(numSpan('G2', String(st.G2))); formula.appendChild(lb);
      }
      Object.keys(chipEls).forEach(function (c) {
        var onC = c === st.shape || (c === 'circle' && st.shape === 'square');
        chipEls[c].classList.toggle('on', onC); if (c === 'circle') chipEls[c].textContent = st.shape === 'square' ? 'SQUARE' : 'CIRCLE';
      });
      // number chips
      nums.textContent = '';
      var k = (st.editing && st.previewKey) ? st.previewKey : st.key;
      [['KEY', 'KEY', fmtWhole(k)], ['SIZE', sizeLabel(), fmtReal(rootFn(rn)(k))], ['MEAS', measureLabel(), (st.shape === 'cube' || st.shape === 'square') ? fmtWhole(measure(st.shape, k)) : fmtReal(measure(st.shape, k))]].forEach(function (c) {
        var d = el('div', 'ks-num'); d.appendChild(el('span', 'l', c[1])); d.appendChild(numSpan(c[0], c[2])); nums.appendChild(d);
      });
      if (st.find) {
        var g = el('div', 'ks-num goal'); var gk = goalKey();
        g.appendChild(el('span', 'l', new Array(Math.min(st.stars, 8) + 2).join('★') + ' ' + measureLabel()));
        g.appendChild(el('span', 'n', (st.shape === 'cube' || st.shape === 'square') ? fmtWhole(gk) : fmtReal(measure(st.shape, gk))));
        nums.appendChild(g);
      }
      bFind.classList.toggle('on', st.find); bPlay.classList.toggle('on', st.playing);
      fitFonts();
    }
    function fitFonts() {   // never below 24 px; long numbers shrink from 28 to 24 and the chip wraps to its own row
      var spans = nums.querySelectorAll('.n');
      for (var i = 0; i < spans.length; i++) { var t = spans[i].textContent.length; spans[i].style.fontSize = t > 14 ? '24px' : '28px'; }
      formula.style.fontSize = "26px"; var lim = formula.clientWidth || 9999, over = false, land = root.classList.contains("land");
      for (var li = 0; li < formula.children.length; li++) { var wsum = 0, ch = formula.children[li].children; for (var ci = 0; ci < ch.length; ci++) wsum += ch[ci].getBoundingClientRect().width; if (wsum > lim) over = true; }
      formula.style.fontSize = (over || land) ? "24px" : "26px";
    }
    on(root, 'click', function (e) {
      var t = e.target; if (!t.dataset || !t.dataset.f) return;
      e.stopPropagation();
      var f = t.dataset.f;
      if (f === 'ROOT') { var order = ['CBRT', 'SQRT', 'k']; if (flat()) st.root2 = order[(order.indexOf(st.root2) + 1) % 3]; else st.root3 = order[(order.indexOf(st.root3) + 1) % 3]; rebuild(); render(); return; }
      if (st.editing === f) endEdit(true); else { if (st.editing) endEdit(true); startEdit(f); }
    });
    on(document, 'keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (/^[0-9]$/.test(k) || k === '.') { if (!st.editing) startEdit('KEY'); padKey(k); e.preventDefault(); return; }
      if (k === 'Backspace' && st.editing) { padKey('⌫'); e.preventDefault(); return; }
      if (k === 'Enter') { if (st.editing) endEdit(true); e.preventDefault(); return; }
      if (k === 'Escape') { if (st.editing) endEdit(false); else close(); e.preventDefault(); return; }
      if (k === 'Delete' && st.editing) { padKey('C'); e.preventDefault(); return; }
      if (k === 'ArrowUp' || k === '+') { stepKey(1, false); e.preventDefault(); }
      if (k === 'ArrowDown' || k === '-') { stepKey(-1, false); e.preventDefault(); }
    });

    /* ----- play ----- */
    function togglePlay() {
      ensureAudio();
      st.playing = !st.playing;
      if (st.playing) { if (st.key >= capFor()) st.key = 1; st.N = st.key; rebuild(); }
      render();
    }

    /* ----- point buffers ----- */
    var pos = null, shellA = null, drawn = 0, sampled = false;
    function rebuild() {
      var cap = capFor(), P = params(), rn = rootName(), n = Math.min(st.N, cap), o = [0, 0, 0], i, k;
      sampled = st.N > cap;
      pos = new Float32Array(Math.max(n, 1) * 3); shellA = new Float32Array(Math.max(n, 1));
      for (i = 0; i < n; i++) {
        k = sampled ? 1 + Math.floor(hash01(i, 12345) * st.N) : i + 1;
        place(st.shape, k, P, o); pos[3 * i] = o[0]; pos[3 * i + 1] = o[1]; pos[3 * i + 2] = o[2];
        shellA[i] = rn === 'k' ? 0 : shellOf(k, rn) % 4096;   // flash match is done mod 4096 to stay exact in float32
      }
      drawn = n; I.drawn = n; I.sampled = sampled; uploaded = false;
    }
    function extend() {   // stepping one key past N: add the new dot (no full rebuild)
      if (st.N > capFor()) { if (!sampled) rebuild(); return; }   // a fair sample of 1..N looks the same for N + 1
      if (sampled || st.N !== drawn + 1) return rebuild();
      var n = st.N, P = params(), o = place(st.shape, n, P);
      if (pos.length < n * 3) { var np = new Float32Array(Math.max(n * 2, 1024) * 3); np.set(pos); pos = np; var ns = new Float32Array(Math.max(n * 2, 1024)); ns.set(shellA); shellA = ns; uploaded = false; }
      pos[3 * (n - 1)] = o[0]; pos[3 * (n - 1) + 1] = o[1]; pos[3 * (n - 1) + 2] = o[2];
      shellA[n - 1] = rootName() === 'k' ? 0 : shellOf(n, rootName()) % 4096;
      drawn = n; I.drawn = n; dirtyFrom = Math.min(dirtyFrom, n - 1);
    }
    var dirtyFrom = 1e18;

    /* ----- WebGL ----- */
    var gl = null, prog = null, buf = null, sbuf = null, uploaded = false, U = {}, glCap = 0;
    if (!opts.forceCanvas) {
      try { gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true }); } catch (e) { gl = null; }
    }
    if (gl) {
      var VS = 'attribute vec3 aP;attribute float aS;uniform mat3 uM;uniform float uScale,uDist,uF,uSize,uGain,uDpr,uFlashS,uFlash;uniform vec2 uC,uRes;varying float vB;varying float vF;\
void main(){vec3 p=uM*(aP*uScale);float zc=uDist-p.z;vec2 s=uC+vec2(p.x,-p.y)*uF/zc;\
gl_Position=vec4(s.x/uRes.x*2.0-1.0,1.0-s.y/uRes.y*2.0,0.0,1.0);\
float t=clamp((p.z+1.0)*0.5,0.0,1.0);float fl=(abs(aS-uFlashS)<0.5)?uFlash:0.0;\
gl_PointSize=max(1.5,uSize*uDpr*uDist/zc*(0.45+1.1*t)*(1.0+0.8*fl));vB=uGain*(0.08+0.92*t*t)*(1.0+2.5*fl);vF=fl;}';
      var FS = 'precision mediump float;varying float vB;varying float vF;void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;if(r>1.0)discard;\
float core=smoothstep(0.42,0.0,r);float halo=exp(-r*r*5.0)*(1.0-r);vec3 hc=mix(vec3(0.0,0.85,1.0),vec3(1.0,0.72,0.1),vF);\
vec3 c=(hc*halo*0.9+vec3(1.0)*core)*vB;gl_FragColor=vec4(c,1.0);}';
      var mk = function (t, s) { var sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
      try {
        prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
        gl.useProgram(prog);
        ['uM', 'uScale', 'uDist', 'uF', 'uSize', 'uGain', 'uDpr', 'uC', 'uRes', 'uFlashS', 'uFlash'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
        I.aP = gl.getAttribLocation(prog, 'aP'); I.aS = gl.getAttribLocation(prog, 'aS');
        buf = gl.createBuffer(); sbuf = gl.createBuffer();
        glCap = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
        I.renderer = 'webgl';
      } catch (e) { gl = null; I.glError = String(e); }
    }
    if (!gl) I.renderer = 'canvas2d';

    /* ----- view ----- */
    var W = 0, Hh = 0, dpr = 1, view = { cx: 0, cy: 0, fit: 100 }, Rcur = 1, CAMD = 3.6;
    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = root.clientWidth || innerWidth; Hh = root.clientHeight || innerHeight;
      var land = W > Hh * 1.3 && Hh < 600; root.classList.toggle('land', land); root.classList.toggle('phone', Math.min(W, Hh) < 600);
      if (land && btns.parentNode !== root) { root.appendChild(btns); root.appendChild(pad); btns.classList.add('ks-side'); pad.classList.add('ks-side'); }
      if (!land && btns.parentNode === root) { bot.appendChild(btns); bot.appendChild(pad); btns.classList.remove('ks-side'); pad.classList.remove('ks-side'); }
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); ov.width = cv.width; ov.height = cv.height;
      var tb = top.getBoundingClientRect(), bb = bot.getBoundingClientRect(), rb = root.getBoundingClientRect();
      var L = 0, R = W, T = 0, B = Hh;
      if (land) { var sb = (st.editing ? pad : btns).getBoundingClientRect(); L = Math.max(tb.right, bb.right) - rb.left + 8; R = sb.left - rb.left - 8; T = 8; B = Hh - 8; }
      else { T = tb.bottom - rb.top + 6; B = bb.top - rb.top - 6; }
      if (B - T < 160) { T = Math.max(0, (T + B) / 2 - 80); B = T + 160; }
      view.cx = (L + R) / 2; view.cy = (T + B) / 2; view.fit = Math.max(60, Math.min(R - L, B - T) / 2 - 6); view.T = T; view.B = B; view.L = L; view.R = R;
      I.view = view; fitFonts();
    }
    function matrix() {
      var cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      // M = Rx(pitch) * B * Rz(yaw); B: vx = wx, vy = wz, vz = -wy
      // row-major rows:
      var r0 = [cy, -sy, 0];                       // vx
      var vy = [0, 0, 1], vz = [-sy, -cy, 0];      // B*Rz rows for vy, vz
      var r1 = [vy[0] * cp - vz[0] * sp, vy[1] * cp - vz[1] * sp, vy[2] * cp - vz[2] * sp];
      var r2 = [vy[0] * sp + vz[0] * cp, vy[1] * sp + vz[1] * cp, vy[2] * sp + vz[2] * cp];
      return [r0, r1, r2];
    }
    function project(M, p, scale) {
      var x = (M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2]) * scale, y = (M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2]) * scale,
        z = (M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]) * scale, zc = CAMD - z, f = focal();
      return { x: view.cx + x * f / zc, y: view.cy - y * f / zc, z: z, zc: zc };
    }
    function focal() { return view.fit * Math.sqrt(CAMD * CAMD - 1) / st.zoom; }
    function targetR() {
      var rn = rootName(), kk = Math.max(st.N, st.key, st.previewKey && st.editing ? st.previewKey : 0);
      if (st.find) kk = Math.max(kk, goalKey());
      return Math.max(1, outerRadius(st.shape, rn, kk));
    }

    /* ----- pointer: drag rotates, pinch / wheel zooms ----- */
    var ptrs = {}, lastPinch = 0, idleT = 0;
    on(cv, 'pointerdown', function (e) { ensureAudio(); cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; st.auto = false; idleT = 0; if (st.editing) endEdit(true); });
    on(cv, 'pointermove', function (e) {
      var p = ptrs[e.pointerId]; if (!p) return;
      var ids = Object.keys(ptrs);
      if (ids.length === 1) {
        var dx = e.clientX - p.x, dy = e.clientY - p.y;
        st.yaw += dx * 0.008; st.pitch = Math.max(-1.55, Math.min(1.75, st.pitch + dy * 0.008)); st.pitchT = null;
      }
      p.x = e.clientX; p.y = e.clientY;
      if (ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch) st.zoom = Math.max(0.15, Math.min(6, st.zoom * lastPinch / d));
        lastPinch = d;
      }
    });
    var up = function (e) { delete ptrs[e.pointerId]; lastPinch = 0; };
    on(cv, 'pointerup', up); on(cv, 'pointercancel', up);
    on(cv, 'wheel', function (e) { e.preventDefault(); st.zoom = Math.max(0.15, Math.min(6, st.zoom * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
    on(window, 'resize', function () { layout(); });

    /* ----- sound ----- */
    var ac = null;
    function ensureAudio() { if (ac || st.muted) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    function tone(freq, t0, dur, vol) {
      if (!ac || st.muted) return;
      var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, ac.currentTime + t0); g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur); o.connect(g); g.connect(ac.destination);
      o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.05);
    }
    var SCALE = [0, 2, 4, 7, 9];
    function note(n) { var i = Math.max(0, n - 1) % 15, f = 220 * Math.pow(2, (SCALE[i % 5] + 12 * Math.floor(i / 5)) / 12); tone(f, 0, 0.6, 0.08); I.lastNote = f; }   // one step up the scale per shell, three octaves, then round again
    function burst() { st.burstT = 1; tone(392, 0, 0.9, 0.07); tone(494, 0.08, 0.9, 0.06); tone(587, 0.16, 1.1, 0.06); tone(784, 0.26, 1.4, 0.05); }
    function glow() { st.glowT = 1; }

    /* ----- frame ----- */
    var lastT = 0, frameMs = [], scaleCur = 0;
    function frame(t) {
      if (I.dead) return;
      I.raf = requestAnimationFrame(frame);
      var dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0.016; lastT = t;
      var t0 = performance.now();
      idleT += dt; if (!st.auto && idleT > 6 && !Object.keys(ptrs).length) st.auto = true;
      if (st.auto) st.yaw += dt * 0.18;
      if (st.pitchT != null) { st.pitch += (st.pitchT - st.pitch) * Math.min(1, dt * 4); if (Math.abs(st.pitchT - st.pitch) < 1e-3) st.pitchT = null; }
      if (st.playing) {
        var rn = rootName(), n = rn === 'k' ? 1 : shellOf(st.key, rn), per = rn === 'CBRT' ? 3 * n * n + 3 * n + 1 : rn === 'SQRT' ? 2 * n + 1 : 1;
        st.playAcc += dt * Math.max(6, per / 1.4);
        var steps = Math.floor(st.playAcc); st.playAcc -= steps;
        for (var s = 0; s < steps && st.playing; s++) { if (st.key >= capFor()) { st.playing = false; render(); break; } stepKey(1, true); }
      }
      if (st.flashT > 0) st.flashT = Math.max(0, st.flashT - dt * 0.8);
      if (st.burstT > 0) st.burstT = Math.max(0, st.burstT - dt * 0.7);
      if (st.glowT > 0) st.glowT = Math.max(0, st.glowT - dt * 1.2);
      if (st.breath > 0) st.breath = Math.max(0, st.breath - dt * 1.5);
      var Rt = targetR() * (1 + 0.06 * (st.breath || 0));
      Rcur = scaleCur ? Rcur + (Rt - Rcur) * Math.min(1, dt * 5) : Rt; scaleCur = 1;
      var scale = 1 / Rcur, M = matrix();
      draw(M, scale);
      overlay(M, scale);
      var ms = performance.now() - t0; frameMs.push(ms); if (frameMs.length > 120) frameMs.shift();
      I.frameMs = frameMs; I.lastFrameT = t;
    }
    function pointParams() {
      var n = Math.max(1, drawn), f = focal();
      var spacing = 2 * f / CAMD / Math.cbrt(n) * (flat() ? Math.cbrt(n) / Math.sqrt(n) * 0.9 : 1);
      var size = Math.max(2.2, Math.min(26, spacing * (flat() ? 1.9 : 1.05)));
      var gain = flat() ? 2.6 : Math.max(0.07, Math.min(1.0, 5.5 / Math.cbrt(n)));
      return { size: size, gain: gain };
    }
    function draw(M, scale) {
      var pp = pointParams();
      if (gl) {
        gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(prog);
        if (!uploaded) {
          gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferData(gl.ARRAY_BUFFER, shellA, gl.DYNAMIC_DRAW); uploaded = true; dirtyFrom = 1e18;
        } else if (dirtyFrom < drawn) {
          gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferSubData(gl.ARRAY_BUFFER, dirtyFrom * 12, pos.subarray(dirtyFrom * 3, drawn * 3));
          gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferSubData(gl.ARRAY_BUFFER, dirtyFrom * 4, shellA.subarray(dirtyFrom, drawn)); dirtyFrom = 1e18;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(I.aP); gl.vertexAttribPointer(I.aP, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.enableVertexAttribArray(I.aS); gl.vertexAttribPointer(I.aS, 1, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix3fv(U.uM, false, [M[0][0], M[1][0], M[2][0], M[0][1], M[1][1], M[2][1], M[0][2], M[1][2], M[2][2]]);
        gl.uniform1f(U.uScale, scale); gl.uniform1f(U.uDist, CAMD); gl.uniform1f(U.uF, focal());
        gl.uniform1f(U.uSize, Math.min(pp.size, glCap / dpr / 2)); gl.uniform1f(U.uGain, pp.gain * (st.key < st.N || st.editing ? 0.5 : 1)); gl.uniform1f(U.uDpr, dpr);
        gl.uniform2f(U.uC, view.cx, view.cy); gl.uniform2f(U.uRes, W, Hh);
        gl.uniform1f(U.uFlashS, (st.flashShell || -9) % 4096); gl.uniform1f(U.uFlash, st.flashT || 0);
        gl.drawArrays(gl.POINTS, 0, drawn);
        if (st.finishGL) gl.finish();
      }
    }
    function overlay(M, scale) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
      if (!gl) drawDots2D(M, scale);
      var rn = rootName(), P = params();
      var k = (st.editing && st.previewKey) ? st.previewKey : st.key;
      var p = place(st.shape, k, P), O = [0, 0, 0];
      var po = project(M, O, scale), pk = project(M, p, scale), pb = project(M, [p[0], p[1], 0], scale);
      var f = focal();
      ctx.lineCap = 'round';
      // faint axis zero line (turn 0) in the plane
      var R0 = rootFn(rn)(k);
      var ax = project(M, [Math.max(R0, 1) * 1.1, 0, 0], scale);
      line(po, ax, 'rgba(102,204,255,0.28)', 1.5, [4, 6]);
      // the thing the size means: shell (sphere / circle) or wire cube / square of that side
      shape(M, scale, R0, 'rgba(255,255,255,0.22)', 1.2);
      // flash of a new shell
      if (st.flashT > 0 && st.flashShell) shape(M, scale, st.flashShell, 'rgba(255,176,0,' + (0.8 * st.flashT).toFixed(3) + ')', 2.5);
      // FIND target ghost
      if (st.find) { var gk = goalKey(); shape(M, scale, rootFn(rn)(gk), 'rgba(255,176,0,0.55)', 2, [8, 8]); }
      // three lines: distance from the centre, turn round the axis, height
      var dist = Math.hypot(p[0], p[1], p[2]), turn = Math.atan2(p[1], p[0]); if (turn < 0) turn += 2 * Math.PI;
      var horiz = Math.hypot(p[0], p[1]);
      line(po, pk, 'rgba(255,255,255,0.95)', 3);
      if (!flat()) {
        line(pb, pk, 'rgba(34,238,119,0.95)', 3);
        line(po, pb, 'rgba(34,238,119,0.35)', 1.5, [3, 5]);
      }
      // turn arc in the plane
      var arcR = Math.max(horiz * 0.45, Math.min(horiz, 0.25 * Rcur)), steps = 48, prev = null;
      ctx.strokeStyle = 'rgba(0,255,255,0.95)'; ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= steps; i++) { var a = turn * i / steps, q = project(M, [arcR * Math.cos(a), arcR * Math.sin(a), 0], scale); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); prev = q; }
      ctx.stroke();
      // the selected dot (amber)
      var rad = Math.max(7, 14 * CAMD / pk.zc);
      var g = ctx.createRadialGradient(pk.x, pk.y, 0, pk.x, pk.y, rad * 2.2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,200,60,1)'); g.addColorStop(1, 'rgba(255,176,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pk.x, pk.y, rad * 2.2, 0, 7); ctx.fill();
      // labels with live numbers (24 px or more)
      ctx.font = '700 24px "Segoe UI",Arial'; ctx.textBaseline = 'middle'; placed = [];
      label(fmtReal(dist), (po.x + pk.x) / 2, (po.y + pk.y) / 2, '#ffffff', po, pk);
      var am = turn / 2, qa = project(M, [arcR * 1.25 * Math.cos(am), arcR * 1.25 * Math.sin(am), 0], scale);
      label(fmtReal(turn * 180 / Math.PI, 1) + ' deg', qa.x, qa.y, '#00ffff');
      if (!flat()) label(fmtReal(p[2]), (pb.x + pk.x) / 2, (pb.y + pk.y) / 2, '#22ee77', pb, pk);
      label(fmtWhole(k), pk.x, pk.y - rad * 2.4, '#ffb000');
      if (st.burstT > 0) {   // supernova
        var bt = 1 - st.burstT, br = 40 + bt * Math.min(W, Hh) * 0.6;
        var gb = ctx.createRadialGradient(pk.x, pk.y, 0, pk.x, pk.y, br);
        gb.addColorStop(0, 'rgba(255,255,255,' + (0.9 * st.burstT) + ')'); gb.addColorStop(0.3, 'rgba(255,190,60,' + (0.5 * st.burstT) + ')'); gb.addColorStop(1, 'rgba(255,176,0,0)');
        ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(pk.x, pk.y, br, 0, 7); ctx.fill();
      }
      if (st.glowT > 0) { ctx.strokeStyle = 'rgba(255,176,0,' + st.glowT * 0.6 + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(pk.x, pk.y, rad * 3, 0, 7); ctx.stroke(); }
    }
    var placed = [];
    function label(txt, x, y, col, a, b) {
      var w = ctx.measureText(txt).width, ox = 0, oy = 0;
      if (a && b) { var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; ox = -dy / L * 22; oy = dx / L * 22; if (ox < 0) { ox = -ox; oy = -oy; } }
      x += ox; y += oy;
      var yT = (view.T || 0) + 16, yB = (view.B || Hh) - 16; x = Math.max((view.L || 0) + w / 2 + 4, Math.min((view.R || W) - w / 2 - 4, x)); y = Math.max(yT, Math.min(yB, y));
      var y0 = y, offs = [0, -34, 34, -68, 68, -102, 102, -136, 136];
      for (var tries = 0; tries < offs.length; tries++) {   // keep labels apart: first clear slot above or below
        y = y0 + offs[tries]; if (y < yT || y > yB) continue;
        var hit = false; for (var j = 0; j < placed.length; j++) { var q = placed[j]; if (Math.abs(q.x - x) < (q.w + w) / 2 + 6 && Math.abs(q.y - y) < 32) { hit = true; break; } }
        if (!hit) break;
      }
      if (hit) y = y0;
      placed.push({ x: x, y: y, w: w, t: txt }); if (S) S.placed = placed;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - w / 2 - 4, y - 15, w + 8, 30);
      ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(txt, x, y);
    }
    function line(a, b, col, w, dash) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); }
    function shape(M, scale, size, col, w, dash) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []);
      var i, a, q;
      if (st.shape === 'sphere') {    // silhouette of the sphere of that radius plus its equator
        var c = project(M, [0, 0, 0], scale), r = size * scale, f = focal(), sr = f * r / Math.sqrt(Math.max(1e-6, CAMD * CAMD - r * r));
        ctx.beginPath(); ctx.arc(c.x, c.y, sr, 0, 7); ctx.stroke();
        ctx.globalAlpha = 0.5; ctx.beginPath();
        for (i = 0; i <= 72; i++) { a = i / 72 * 2 * Math.PI; q = project(M, [size * Math.cos(a), size * Math.sin(a), 0], scale); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
        ctx.stroke(); ctx.globalAlpha = 1;
      } else if (st.shape === 'circle') {
        ctx.beginPath();
        for (i = 0; i <= 96; i++) { a = i / 96 * 2 * Math.PI; q = project(M, [size * Math.cos(a), size * Math.sin(a), 0], scale); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
        ctx.stroke();
      } else if (st.shape === 'square') {
        var h = size / 2, sq = [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]]; ctx.beginPath();
        for (i = 0; i < 5; i++) { q = project(M, [sq[i][0], sq[i][1], 0], scale); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
        ctx.stroke();
      } else {
        var hh = size / 2, V = [], E = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        for (i = 0; i < 8; i++) V.push(project(M, [i & 1 ? hh : -hh, i & 2 ? hh : -hh, i & 4 ? hh : -hh], scale));
        ctx.beginPath(); E.forEach(function (e) { ctx.moveTo(V[e[0]].x, V[e[0]].y); ctx.lineTo(V[e[1]].x, V[e[1]].y); }); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    function drawDots2D(M, scale) {   // Canvas 2D fallback: the same projection, size and brightness by depth
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
      var n = Math.min(drawn, 30000), stp = drawn / n, pp = pointParams(), p = [0, 0, 0];
      ctx.globalCompositeOperation = 'lighter';
      for (var j = 0; j < n; j++) {
        var i = Math.floor(j * stp); p[0] = pos[3 * i]; p[1] = pos[3 * i + 1]; p[2] = pos[3 * i + 2];
        var q = project(M, p, scale), t = Math.max(0, Math.min(1, (q.z + 1) / 2)), s = pp.size * CAMD / q.zc * (0.55 + 0.9 * t) * 0.5;
        var b = pp.gain * (0.18 + 0.82 * t * t);
        ctx.fillStyle = 'rgba(0,200,255,' + (0.35 * b).toFixed(3) + ')'; ctx.fillRect(q.x - s, q.y - s, 2 * s, 2 * s);
        ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, b).toFixed(3) + ')'; ctx.fillRect(q.x - s * 0.3, q.y - s * 0.3, s * 0.6, s * 0.6);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* ----- start ----- */
    I.api = {
      state: st, set: function (o) { for (var k in o) st[k] = o[k]; rebuild(); render(); layout(); },
      setShape: setShape, setKey: setKey, stepKey: stepKey, rebuild: rebuild, layout: layout, render: render,
      frameStats: function () { var a = frameMs.slice().sort(function (x, y) { return x - y; }); return { n: a.length, median: a[a.length >> 1], p95: a[Math.floor(a.length * 0.95)] }; },
      info: function () { return { renderer: I.renderer, drawn: I.drawn, sampled: I.sampled, view: view, R: Rcur, glError: I.glError, lastNote: I.lastNote }; },
      project: function (k) { return project(matrix(), place(st.shape, k, params()), 1 / Rcur); }
    };
    rebuild(); render(); layout();
    I.raf = requestAnimationFrame(frame);
    return I.api;
  }

  function close() {
    if (!S) return;
    var I = S; S = null; I.dead = true; cancelAnimationFrame(I.raf); clearTimeout(I.msgT);
    I.listeners.forEach(function (l) { try { l[0].removeEventListener(l[1], l[2], l[3]); } catch (e) {} });
    if (I.root && I.root.parentNode) I.root.parentNode.removeChild(I.root);
    if (I.style && I.style.parentNode) I.style.parentNode.removeChild(I.style);
  }

  var KGSolid = { mulmod32: mulmod32, mod32: mod32, place: place, shellOf: shellOf, wholeRoot: wholeRoot, measure: measure,
    keyFromMeasure: keyFromMeasure, outerRadius: outerRadius, parseTyped: parseTyped, fmtWhole: fmtWhole, fmtReal: fmtReal,
    DEF: DEF, LIMIT: LIMIT, LIMIT_LINE: LIMIT_LINE, open: open, close: close, instance: function () { return S; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = KGSolid;
  if (typeof window !== 'undefined') {
    window.KGSolid = KGSolid;
    (window.KGModules = window.KGModules || []).push({ id: 'solid', label: 'SPHERE', sentence: 'The same rule in a sphere', open: function (host) { return open(host); }, close: close });
  }
})();
