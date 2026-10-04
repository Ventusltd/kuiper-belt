// realgame.js: REAL KUIPER GAME, a module of LEARN THE KUIPER (owner: Opus 2).
// A radar game played on the REAL wafer: 11,326 real public commits from kuiper-belt cosmos/wafer.tsv (realgame-data.js).
// Every real position comes from KuiperLaw.place; dark rings are real unissued keys (600 per second of quiet, 14-day cap).
// Missions are done by pointing and tapping. No arithmetic, no quiz. WHY gives the exact numbers and the sources.
(function () {
  function RK(k) { return KuiperLaw.place(k).r; }   // ring radius from the shared law (KuiperLaw.place(k).r)
  'use strict';
  var COL = { cy: '#00ffff', sky: '#66ccff', amb: '#ffb000', grn: '#22ee77', w: '#ffffff' };
  var FONT = '"Segoe UI", Arial, sans-serif';
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // ---------- real data ----------
  var W = null;
  function decode() {
    if (W) return W;
    var D = window.KGRealData;
    if (!D) throw new Error('realgame-data.js not loaded');
    var n = D.n;
    function arr(s) { var a = s.split(','), o = new Float64Array(a.length); for (var i = 0; i < a.length; i++) o[i] = parseInt(a[i], 36); return o; }
    var dt = arr(D.dt), lines = arr(D.lines), gap = arr(D.gap600), repo = arr(D.repo);
    var t = new Float64Array(n), start = new Float64Array(n), cumIss = new Float64Array(n);
    var u = D.t0, k = 0, iss = 0;
    for (var i = 0; i < n; i++) {
      u += dt[i]; t[i] = u; gap[i] *= 600;
      k += gap[i]; start[i] = k; cumIss[i] = iss; iss += lines[i]; k += lines[i];
    }
    W = { D: D, n: n, t: t, lines: lines, gap: gap, repo: repo, start: start, cumIss: cumIss, total: k, issued: iss,
      sumOK: k === D.space && k === window.KuiperLaw.constants.SPACE };
    W.sha = function (i) { return D.sha.substr(12 * i, 12); };
    W.repoName = function (i) { return D.repos[W.repo[i]] || ('repo ' + W.repo[i]); };
    // records found from the data, not typed in
    var big = 0, wide = 0, wideW = -1;
    for (i = 0; i < n; i++) {
      if (lines[i] > lines[big]) big = i;
      var w = RK(start[i]) - RK(start[i] - gap[i]);
      if (w > wideW) { wideW = w; wide = i; }
    }
    W.big = big; W.wide = wide; W.capped = 0;
    for (i = 0; i < n; i++) if (gap[i] >= D.gapKeysPerSecond * D.capSeconds) W.capped++;
    return W;
  }
  function lastStartAtOrBelow(K) { var lo = 0, hi = W.n - 1; if (K < W.start[0]) return -1; while (lo < hi) { var m = (lo + hi + 1) >> 1; if (W.start[m] <= K) lo = m; else hi = m - 1; } return lo; }
  function issuedBefore(K) { if (K <= 0) return 0; if (K >= W.total) return W.issued; var i = lastStartAtOrBelow(K); if (i < 0) return 0; return W.cumIss[i] + Math.min(K - W.start[i], W.lines[i]); }
  // what lives at key K: { commit i, issued true } or { silence before commit i, issued false }
  function at(K) {
    K = Math.floor(K); if (K < 0) K = 0;
    if (K >= W.total) return { beyond: true, key: K };
    var i = lastStartAtOrBelow(K);
    if (i >= 0 && K < W.start[i] + W.lines[i]) return { issued: true, i: i, key: K };
    return { issued: false, i: i + 1, key: K };
  }
  function keyAtR(r) { return Math.max(0, r * r - 0.5); }

  // ---------- words ----------
  function fmt(x) { return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function big(x) { if (x >= 1e9) return (x / 1e9).toFixed(1) + ' BILLION'; if (x >= 1e6) return (x / 1e6).toFixed(1) + ' MILLION'; if (x >= 1e4) return (x / 1e3).toFixed(1) + ' THOUSAND'; return fmt(x); }
  function day(u) { var d = new Date(u * 1000); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function clock(u) { var d = new Date(u * 1000); return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2) + ' UTC'; }
  function dur(s) { if (s >= 86400 * 2) return (s / 86400).toFixed(1) + ' DAYS'; if (s >= 7200) return (s / 3600).toFixed(1) + ' HOURS'; if (s >= 120) return Math.round(s / 60) + ' MINUTES'; return Math.round(s) + ' SECONDS'; }
  function plural(n, w) { return fmt(n) + ' ' + w + (n === 1 ? '' : 'S'); }

  // ---------- module state ----------
  var S = null;

  function open(host) {
    decode();
    var root = document.createElement('div');
    root.className = 'kgrg';
    root.innerHTML =
      '<style>' +
      '.kgrg{position:absolute;inset:0;background:#000;color:#fff;font:bold 24px ' + FONT + ';overflow:hidden;user-select:none;-webkit-user-select:none}' +
      '.kgrg canvas{position:absolute;left:0;top:0;touch-action:none;display:block;cursor:crosshair}' +
      '.kgrg .x{position:absolute;right:calc(8px + env(safe-area-inset-right));top:calc(8px + env(safe-area-inset-top));width:72px;height:72px;font:bold 40px ' + FONT + ';color:#fff;background:transparent;border:2px solid rgba(255,255,255,.55);border-radius:12px;cursor:pointer;z-index:5;padding:0}' +
      '.kgrg .hud{position:absolute;left:calc(14px + env(safe-area-inset-left));right:96px;top:calc(10px + env(safe-area-inset-top));pointer-events:none;transition:opacity 1.2s}' +
      '.kgrg .hud.dim{opacity:.4}' +
      '.kgrg .cap{font-size:36px;line-height:1.12;color:#fff;text-shadow:0 0 6px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.kgrg .sub{font-size:24px;line-height:1.25;color:#66ccff;margin-top:4px;text-shadow:0 0 6px #000}' +
      '.kgrg .bar{position:absolute;bottom:calc(10px + env(safe-area-inset-bottom));display:flex;gap:10px;transition:opacity .6s}' +
      '.kgrg .bar.l{left:calc(12px + env(safe-area-inset-left))}.kgrg .bar.r{right:calc(12px + env(safe-area-inset-right))}' +
      '.kgrg.busy .bar{opacity:.2}' +
      '.kgrg button.b{min-height:72px;min-width:110px;font:bold 24px ' + FONT + ';color:rgba(0,255,255,.75);background:transparent;border:2px solid rgba(0,255,255,.5);border-radius:14px;cursor:pointer;padding:4px 14px}' +
      '.kgrg button.b:hover,.kgrg button.b:active,.kgrg button.b:focus-visible{color:#00ffff;border-color:#00ffff}' +
      '.kgrg .ov{position:absolute;left:0;right:0;bottom:0;max-height:78%;background:rgba(0,0,0,.92);border-top:2px solid rgba(0,255,255,.5);z-index:4;display:none;flex-direction:column;padding:16px 96px calc(16px + env(safe-area-inset-bottom)) 16px;box-sizing:border-box;gap:10px}' +
      '.kgrg .ov.show{display:flex}' +
      '.kgrg .ov .x{top:8px}' +
      '.kgrg .ov h2{margin:0;font-size:30px;color:#00ffff;min-height:56px;line-height:56px}' +
      '.kgrg .ov .body{overflow:auto;flex:1;font-size:24px;line-height:1.35;color:#fff;-webkit-overflow-scrolling:touch}' +
      '.kgrg .ov .body p{margin:0 0 10px 0}.kgrg .ov .body b{color:#ffb000}' +
      '.kgrg .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
      '.kgrg button.m{min-height:72px;font:bold 24px ' + FONT + ';color:#fff;background:transparent;border:2px solid rgba(102,204,255,.6);border-radius:14px;cursor:pointer;padding:4px 10px;line-height:1.1}' +
      '.kgrg button.m.done{border-color:#22ee77;color:#22ee77}.kgrg button.m.done::before{content:"\\2605  "}' +
      '.kgrg button.m.on{border-color:#ffb000;color:#ffb000}' +
      '.kgrg .row{display:block;width:100%;text-align:left;min-height:64px;margin:0 0 8px 0;font:bold 24px ' + FONT + ';color:#fff;background:transparent;border:2px solid rgba(102,204,255,.6);border-radius:12px;padding:6px 12px;cursor:pointer}' +
      '.kgrg .row i{font-style:normal;color:#66ccff}.kgrg .row em{font-style:normal;color:#ffb000}' +
      '.kgrg.phone .cap{font-size:26px}.kgrg.phone .sub{display:none}.kgrg.phone button.b{min-height:56px;min-width:0;flex:1;padding:4px 6px}.kgrg.phone button.m{min-height:56px}' +
      '.kgrg.phone .bar.l{right:calc(50% + 5px)}.kgrg.phone .bar.r{left:calc(50% + 5px)}.kgrg.phone button.b{padding:4px 2px}' +
      '.kgrg.phone .ov{padding-right:16px;padding-top:88px}.kgrg.phone .grid{grid-template-columns:1fr}' +
      '</style>' +
      '<canvas></canvas>' +
      '<div class="hud"><div class="cap">TAP PLAY</div><div class="sub"></div></div>' +
      '<div class="bar l"><button class="b" data-a="play">PLAY</button><button class="b" data-a="home">HOME</button></div>' +
      '<div class="bar r"><button class="b" data-a="why">WHY</button><button class="b" data-a="mute">SOUND</button></div>' +
      '<button class="x" aria-label="close">X</button>' +
      '<div class="ov" data-ov="play"><h2>MISSIONS</h2><div class="body"><div class="grid">' +
      '  <button class="m" data-m="first">FIND THE FIRST LINE</button>' +
      '  <button class="m" data-m="newest">FLY TO THE NEWEST WORK</button>' +
      '  <button class="m" data-m="silence">FIND THE LONGEST SILENCE</button>' +
      '  <button class="m" data-m="bigc">SPOT A BIG COMMIT</button>' +
      '  <button class="m" data-m="may">WHERE WAS 29 MAY 2025?</button>' +
      '  <button class="m" data-m="pick">PICK A REAL COMMIT</button>' +
      '</div></div></div>' +
      '<div class="ov" data-ov="pick"><h2>PICK A REAL COMMIT</h2><div class="body"></div></div>' +
      '<div class="ov" data-ov="why"><h2>WHY: THE EXACT NUMBERS</h2><div class="body"></div></div>';
    host.appendChild(root);

    var cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
    S = { host: host, root: root, cv: cv, ctx: ctx, cam: { cx: 0, cy: 0, s: 1 }, fly: null, mission: null, mStart: 0,
      done: {}, land: null, hit: null, found: null, muted: false, ac: null, lastPing: 0, cache: null, raf: 0,
      t0: performance.now(), sweep0: 0, lastWhy: [], listeners: [], scope: { x: 0, y: 0, R: 100 }, dpr: 1 };
    var cap = root.querySelector('.cap'), sub = root.querySelector('.sub'), hud = root.querySelector('.hud');
    S.say = function (a, b) { cap.textContent = a; sub.textContent = b || ''; hud.classList.remove('dim'); clearTimeout(S.dimT); S.dimT = setTimeout(function () { hud.classList.add('dim'); }, 6000); };

    function on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt || false); S.listeners.push([el, ev, fn, opt || false]); }

    // ----- layout -----
    function layout() {
      var w = root.clientWidth || window.innerWidth, h = root.clientHeight || window.innerHeight;
      var dpr = window.devicePixelRatio || 1; S.dpr = dpr;
      var phone = w < 700 || w < h;
      root.classList.toggle('phone', phone);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      // a true circle, centred; on a phone it keeps clear of the caption and the one button row
      var R = phone ? Math.min(w / 2 - 8, (h - 260) / 2) : Math.min(w, h) / 2 - 10;
      var cyy = phone ? Math.max(h / 2, 130 + R) : h / 2;
      if (phone && cyy + R > h - 86) cyy = h - 86 - R;
      var old = S.scope;
      S.scope = { x: w / 2, y: cyy, R: R, w: w, h: h };
      if (!S.camSet) S.cam = homeCam();
      else if (old && old.R) S.cam = { cx: S.cam.cx, cy: S.cam.cy, s: S.cam.s * R / old.R };
      if (S.fly) S.fly = null;
      S.cache = null; S.cs = null;
    }
    on(window, 'resize', layout);
    layout();

    // ----- input: own canvas, own listeners -----
    on(cv, 'pointerdown', function (e) {
      e.preventDefault(); wake();
      var rc = cv.getBoundingClientRect();
      tap(e.clientX - rc.left, e.clientY - rc.top);
    });
    root.querySelectorAll('button.m, button.b').forEach(function (b) {
      on(b, 'click', function () {
        wake();
        var m = b.getAttribute('data-m'), a = b.getAttribute('data-a');
        if (m) { root.querySelector('[data-ov="play"]').classList.remove('show'); startMission(m); }
        else if (a === 'play') { markButtons(); root.querySelector('[data-ov="play"]').classList.add('show'); }
        else if (a === 'home') { S.mission = null; S.land = null; S.found = null; markButtons(); flyTo(homeCam(), 900); S.say('THE WHOLE REAL WAFER', fmt(W.n) + ' COMMITS, ' + big(W.issued) + ' LINES. DARK RINGS ARE QUIET TIME'); }
        else if (a === 'why') showWhy();
        else if (a === 'mute') { S.muted = !S.muted; b.textContent = S.muted ? 'SOUND OFF' : 'SOUND'; }
      });
    });
    on(root.querySelector('.x'), 'click', function () { closeFromX(); });
    root.querySelectorAll('.ov').forEach(function (ov) {
      var x = document.createElement('button'); x.className = 'x'; x.textContent = 'X'; x.setAttribute('aria-label', 'close panel');
      ov.appendChild(x); on(x, 'click', function () { ov.classList.remove('show'); });
    });
    on(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      var a = document.activeElement;
      if (a && root.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName)) { a.blur(); return; }
      var ov = root.querySelector('.ov.show');
      if (ov) { ov.classList.remove('show'); return; }
      closeFromX();
    });

    buildPickList();
    S.say('TAP PLAY FOR A MISSION', fmt(W.n) + ' REAL COMMITS. TAP ANYWHERE TO ASK');
    S.raf = requestAnimationFrame(frame);
  }

  function closeFromX() {
    var host = S && S.host;
    close();
    if (host) { try { host.dispatchEvent(new CustomEvent('kg-close', { bubbles: true })); } catch (e) {} }
  }

  function close() {
    if (!S) return;
    cancelAnimationFrame(S.raf); clearTimeout(S.dimT); clearTimeout(S.allT); S.dimT = S.allT = 0;
    S.listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    if (S.ac) { try { S.ac.close(); } catch (e) {} }
    if (S.root && S.root.parentNode) S.root.parentNode.removeChild(S.root);
    S = null;
  }

  // ---------- sound (after the first gesture, soft, mutable) ----------
  function wake() { if (!S.ac) { try { S.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { S.ac = null; } } else if (S.ac.state === 'suspended') S.ac.resume(); }
  function tone(f, d, vol, type, when) {
    if (!S || !S.ac || S.muted) return;
    var ac = S.ac, t = ac.currentTime + (when || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.05);
  }
  function flourish() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { tone(f, 0.5, 0.07, 'triangle', i * 0.09); }); tone(261.6, 1.1, 0.05, 'sine', 0); }

  // ---------- camera ----------
  function homeCam() { return { cx: 0, cy: 0, s: S.scope.R * 0.94 / Math.sqrt(W.total) }; }
  function flyTo(c, ms) { S.camSet = true; S.fly = { a: { cx: S.cam.cx, cy: S.cam.cy, s: S.cam.s }, b: c, t0: performance.now(), ms: ms || 1000 }; }
  function stepFly(now) {
    if (!S.fly) return;
    var f = S.fly, u = Math.min(1, (now - f.t0) / f.ms), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    var ls = Math.log(f.a.s) + (Math.log(f.b.s) - Math.log(f.a.s)) * e;
    S.cam = { cx: f.a.cx + (f.b.cx - f.a.cx) * e, cy: f.a.cy + (f.b.cy - f.a.cy) * e, s: Math.exp(ls) };
    S.cache = null;
    if (u >= 1) { S.cam = f.b; S.fly = null; }
  }
  function toS(x, y) { var c = S.cam, sc = S.scope; return [sc.x + (x - c.cx) * c.s, sc.y - (y - c.cy) * c.s]; }
  function toW(X, Y) { var c = S.cam, sc = S.scope; return [c.cx + (X - sc.x) / c.s, c.cy - (Y - sc.y) / c.s]; }
  function centred() { var o = toS(0, 0); return Math.hypot(o[0] - S.scope.x, o[1] - S.scope.y) < 2; }

  // ---------- missions ----------
  var MISSIONS = {
    first: { ask: 'TAP THE VERY FIRST LINE', hint: 'IT IS KEY 0, RIGHT IN THE MIDDLE' },
    newest: { ask: 'TAP THE NEWEST WORK', hint: 'NEW LINES LAND AT THE EDGE' },
    silence: { ask: 'TAP THE WIDEST DARK RING', hint: 'DARK RINGS ARE TIME WITH NO WORK' },
    bigc: { ask: 'TAP THE THICK GOLD BAND', hint: 'ONE COMMIT, MILLIONS OF LINES' },
    may: { ask: 'WHERE WAS 29 MAY 2025? TAP IT', hint: 'THE OLDEST WORK IS IN THE MIDDLE' }
  };
  function markButtons() {
    S.root.querySelectorAll('button.m[data-m]').forEach(function (b) {
      var m = b.getAttribute('data-m');
      b.classList.toggle('on', S.mission === m); b.classList.toggle('done', !!S.done[m] && S.mission !== m);
    });
  }
  function startMission(m) {
    S.land = null; S.found = null;
    if (m === 'pick') { S.mission = null; markButtons(); S.root.querySelector('[data-ov="pick"]').classList.add('show'); return; }
    S.mission = m; S.mStart = performance.now(); markButtons();
    var M = MISSIONS[m]; S.say(M.ask, M.hint);
    tone(440, 0.25, 0.05); tone(660, 0.3, 0.04, 'triangle', 0.12);
    if (m === 'bigc') {
      // fly to the biggest commit (found from the data): centre on the middle of its band, under its first key
      var i = W.big, r0 = RK(W.start[i]), r1 = RK(W.start[i] + W.lines[i]), q = KuiperLaw.place(W.start[i]);
      var rm = (r0 + r1) / 2, th = q.theta;
      flyTo({ cx: rm * Math.cos(th), cy: rm * Math.sin(th), s: (S.scope.R * 0.7) / (r1 - r0) }, 1600);
    } else if (!centred() || Math.abs(S.cam.s / homeCam().s - 1) > 0.01) flyTo(homeCam(), 900);
    S.lastWhy = whyFor(m);
  }
  // where each target is, on screen now (used for the gold hint and by the test harness to aim real pointer events)
  function target(m) {
    var o = toS(0, 0), R = S.cam.s;
    if (m === 'first' || m === 'may') { var q = KuiperLaw.place(0); var p = toS(q.x, q.y); return { kind: 'point', x: p[0], y: p[1], cx: o[0], cy: o[1] }; }
    if (m === 'newest') { return { kind: 'ring', cx: o[0], cy: o[1], r0: RK(W.start[W.n - 1]) * R, r1: RK(W.total) * R }; }
    if (m === 'silence') { var i = W.wide; return { kind: 'ring', cx: o[0], cy: o[1], r0: RK(W.start[i] - W.gap[i]) * R, r1: RK(W.start[i]) * R }; }
    if (m === 'bigc') { var j = W.big; return { kind: 'ring', cx: o[0], cy: o[1], r0: RK(W.start[j]) * R, r1: RK(W.start[j] + W.lines[j]) * R }; }
    return null;
  }
  function aimPoint(m) { // a screen point inside the target, along the direction of the scope centre (for tests)
    var t = target(m); if (!t) return null;
    if (t.kind === 'point') return [t.x, t.y];
    var sc = S.scope, dx = sc.x - t.cx, dy = sc.y - t.cy, d = Math.hypot(dx, dy) || 1, rr = (t.r0 + t.r1) / 2;
    if (d < 2) { return [t.cx - rr, t.cy]; }
    return [t.cx + dx / d * rr, t.cy + dy / d * rr];
  }

  function tap(X, Y) {
    var w = toW(X, Y), r = Math.hypot(w[0], w[1]), K = keyAtR(r), here = at(K);
    var o = toS(0, 0), rs = Math.hypot(X - o[0], Y - o[1]);
    S.hit = { X: X, Y: Y, t: performance.now() };
    if (S.fly) return;
    var m = S.mission, ok = false;
    if (m === 'first' || m === 'may') ok = rs <= Math.max(36, 0.06 * S.scope.R);
    else if (m === 'newest') { var t = target(m); ok = rs >= t.r1 - Math.max(30, 0.08 * S.scope.R) && rs <= t.r1 + 40; }
    else if (m === 'silence' || m === 'bigc') { var g = target(m), slack = Math.max(12, (g.r1 - g.r0) * 0.25); ok = rs >= g.r0 - slack && rs <= g.r1 + slack; }
    if (m && ok) return success(m);
    if (m) { tone(330, 0.18, 0.04, 'sine'); S.say(MISSIONS[m].ask, 'NOT THERE: THE GOLD GLOW SHOWS THE WAY'); S.mStart = -1e9; return; }
    // free tap: say what is really here
    tone(500 + 500 * Math.min(1, rs / S.scope.R), 0.15, 0.04);
    if (here.beyond) { S.say('NOTHING YET OUT HERE', 'THE WAFER ENDS AT KEY ' + fmt(W.total) + ': FUTURE WORK LANDS HERE'); return; }
    if (here.issued) { var i = here.i; S.found = { i: i }; S.say(day(W.t[i]) + ': ' + plural(W.lines[i], 'LINE'), 'KEY ' + fmt(here.key) + ' IS LINE ' + fmt(here.key - W.start[i] + 1) + ' OF COMMIT ' + W.sha(i) + ' (' + W.repoName(i).toUpperCase() + ')'); }
    else { var j = here.i, prev = j - 1, secs = prev >= 0 ? W.t[j] - W.t[prev] : 0; S.found = null; S.say('QUIET TIME: NO WORK HERE', 'KEY ' + fmt(here.key) + ' WAS NEVER ISSUED: ' + dur(secs) + ' OF QUIET BEFORE ' + day(W.t[j]) + ', ' + fmt(W.gap[j]) + ' KEYS SKIPPED'); }
  }

  function success(m) {
    flourish();
    S.done[m] = true; S.mission = null; markButtons();
    S.burst = { m: m, t: performance.now(), tg: target(m) };
    var i, f;
    if (m === 'first') { var q = KuiperLaw.place(0); f = ['KEY 0 IS THE FIRST LINE OF ALL', 'r = sqrt(0 + 0.5) = ' + q.r.toFixed(3) + ', ANGLE ' + q.deg.toFixed(1) + ' DEG, COMMIT ' + W.sha(0) + ', ' + day(W.t[0])];
      flyTo({ cx: 0, cy: 0, s: S.scope.R / 9 }, 1400); S.found = { i: 0 }; }
    if (m === 'may') { f = ['29 MAY 2025, ' + clock(W.t[0]) + ': THE FIRST COMMIT', W.sha(0) + ' ADDED ' + plural(W.lines[0], 'LINE') + ', KEYS 0 AND 1. ' + Math.round((W.t[W.n - 1] - W.t[0]) / 86400) + ' DAYS OF WORK GREW OUTWARD FROM HERE']; S.found = { i: 0 }; }
    if (m === 'newest') { i = W.n - 1; f = ['THE NEWEST WORK: ' + day(W.t[i]), plural(W.lines[i], 'LINE') + ', COMMIT ' + W.sha(i) + ', LAST KEY ' + fmt(W.total - 1) + ' AT THE RIM']; S.found = { i: i }; }
    if (m === 'silence') { i = W.wide; var secs = W.t[i] - W.t[i - 1], capK = W.D.gapKeysPerSecond * W.D.capSeconds;
      f = [dur(secs) + ' OF QUIET: ' + big(W.gap[i]) + ' KEYS NEVER ISSUED', (W.gap[i] >= capK ? 'CAPPED AT 14 DAYS x 600 KEYS A SECOND = ' + fmt(capK) + ' KEYS. ' : '') + 'FROM ' + day(W.t[i - 1]) + ' TO ' + day(W.t[i])]; }
    if (m === 'bigc') { i = W.big; f = ['THIS COMMIT ADDED ' + big(W.lines[i]) + ' LINES', fmt(W.lines[i]) + ' LINES ON ' + day(W.t[i]) + ', COMMIT ' + W.sha(i) + ' (' + W.repoName(i).toUpperCase() + ')']; S.found = { i: i }; }
    S.say(f[0], f[1]);
    var n = Object.keys(S.done).length;
    clearTimeout(S.allT); if (n >= 5) S.allT = setTimeout(function () { if (S && !S.mission) S.say('ALL FIVE MISSIONS DONE ON THE REAL WAFER', 'NOW PICK ANY REAL COMMIT AND WATCH IT LAND'); }, 4200);
  }

  // ---------- pick a real commit, watch its lines land ----------
  function notable() {
    var set = {}, i, n = W.n;
    set[0] = 1; set[n - 1] = 1; set[W.big] = 1; set[W.wide] = 1;
    var byLines = []; for (i = 0; i < n; i++) byLines.push(i); byLines.sort(function (a, b) { return W.lines[b] - W.lines[a]; });
    for (i = 0; i < 3; i++) set[byLines[i]] = 1;
    var lastMon = -1; for (i = 0; i < n; i++) { var d = new Date(W.t[i] * 1000), mo = d.getUTCFullYear() * 12 + d.getUTCMonth(); if (mo !== lastMon) { set[i] = 1; lastMon = mo; } }
    for (i = 1; i < n; i++) if (W.gap[i] >= W.D.gapKeysPerSecond * W.D.capSeconds) set[i] = 1;
    // small, readable commits too
    for (i = 1; i < n && Object.keys(set).length < 40; i += 997) set[i] = 1;
    return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  }
  function buildPickList() {
    var body = S.root.querySelector('[data-ov="pick"] .body'), list = notable();
    var html = '<button class="row" data-i="rand"><em>SURPRISE ME: ANY OF THE ' + fmt(W.n) + ' REAL COMMITS</em></button>';
    list.forEach(function (i) { html += '<button class="row" data-i="' + i + '">' + day(W.t[i]) + ' <em>' + big(W.lines[i]) + ' LINE' + (W.lines[i] === 1 ? '' : 'S') + '</em> <i>' + W.repoName(i).toUpperCase() + '</i></button>'; });
    body.innerHTML = html;
    body.querySelectorAll('.row').forEach(function (b) {
      var fn = function () { wake(); var v = b.getAttribute('data-i'); var i = v === 'rand' ? Math.floor(Math.random() * W.n) : +v; S.root.querySelector('[data-ov="pick"]').classList.remove('show'); land(i); };
      b.addEventListener('click', fn); S.listeners.push([b, 'click', fn, false]);
    });
  }
  function land(i) {
    S.mission = null; S.found = { i: i }; markButtons();
    var r = RK(W.start[i]), rr = Math.max(r, 2.2);
    flyTo({ cx: 0, cy: 0, s: Math.min(S.scope.R * 0.62 / rr, S.scope.R / 2.5) }, 1300);
    S.land = { i: i, t0: performance.now() + 1350, shown: 0, pts: [], lastTone: 0 };
    S.say(day(W.t[i]) + ': WATCH ' + plural(W.lines[i], 'LINE') + ' LAND', 'COMMIT ' + W.sha(i) + ', ' + W.repoName(i).toUpperCase() + ', FIRST KEY ' + fmt(W.start[i]));
    S.lastWhy = whyFor('pick', i);
  }
  var LAND_MAX = 2400;
  function stepLand(now) {
    var L = S.land; if (!L || now < L.t0) return;
    var i = L.i, n = W.lines[i], e = (now - L.t0) / 1000;
    // the first lines land one by one (4 a second), then faster and faster
    var want = e < 3 ? Math.floor(e * 4) + 1 : Math.floor(12 + Math.pow(e - 3, 2.2) * 30);
    want = Math.min(n, LAND_MAX, want);
    while (L.shown < want) { var k = W.start[i] + L.shown; var q = KuiperLaw.place(k); L.pts.push(q); L.shown++; }
    if (L.shown <= 24 && now - L.lastTone > 120 && L.lastShown !== L.shown) { tone(392 + 40 * (L.shown % 8), 0.18, 0.045); L.lastTone = now; L.lastShown = L.shown; }
    var last = L.pts[L.pts.length - 1];
    if (!L.said || L.said !== L.shown) {
      L.said = L.shown;
      if (L.shown >= Math.min(n, LAND_MAX) && !L.fin) {
        L.fin = true; flourish();
        S.say('ALL ' + (n > LAND_MAX ? fmt(LAND_MAX) + ' SHOWN OF ' + big(n) : fmt(n)) + ' LINES LANDED, IN ORDER', day(W.t[i]) + ' ' + clock(W.t[i]) + ', COMMIT ' + W.sha(i) + ', KEYS ' + fmt(W.start[i]) + ' TO ' + fmt(W.start[i] + n - 1));
      } else if (!L.fin) {
        S.say('LINE ' + fmt(L.shown) + ' OF ' + fmt(n) + ' LANDS AT KEY ' + fmt(last.key), 'EACH NEW LINE TURNS ' + KuiperLaw.constants.DEG_PER_KEY_ANTICLOCKWISE.toFixed(2) + ' DEG ANTICLOCKWISE AND STEPS A HAIR FURTHER OUT. ' + day(W.t[i]) + ', ' + W.sha(i));
      }
    }
  }

  // ---------- WHY (exact numbers, sources) ----------
  function whyFor(m, i) {
    var o = [];
    if (m === 'first' || m === 'may') o.push('Commit 1 of ' + fmt(W.n) + ': ' + W.sha(0) + ', unix ' + W.t[0] + ' (' + day(W.t[0]) + ' ' + clock(W.t[0]) + '), ' + W.lines[0] + ' lines, gap_before 0, so its keys are 0 and 1. KuiperLaw.place(0): r = ' + KuiperLaw.place(0).r.toFixed(6) + ', m = 0, angle 0 deg.');
    if (m === 'newest') { i = W.n - 1; o.push('Commit ' + fmt(W.n) + ' of ' + fmt(W.n) + ': ' + W.sha(i) + ', unix ' + W.t[i] + ' (' + day(W.t[i]) + '), ' + fmt(W.lines[i]) + ' lines, keys ' + fmt(W.start[i]) + ' to ' + fmt(W.total - 1) + '. Rim r = sqrt(' + fmt(W.total) + ') = ' + Math.sqrt(W.total).toFixed(1) + '.'); }
    if (m === 'silence') { i = W.wide; o.push('Widest dark ring by radius: the gap before commit ' + (i + 1) + ' (' + W.sha(i) + '). gap_before = ' + fmt(W.gap[i]) + ' keys, keys ' + fmt(W.start[i] - W.gap[i]) + ' to ' + fmt(W.start[i] - 1) + ' unissued. Ring from r = ' + RK(W.start[i] - W.gap[i]).toFixed(1) + ' to ' + RK(W.start[i]).toFixed(1) + '. Real quiet: unix ' + W.t[i - 1] + ' to ' + W.t[i] + ' = ' + fmt(W.t[i] - W.t[i - 1]) + ' s; charged min(seconds, 1,209,600) x 600. Gaps at the 14-day cap in this wafer: ' + W.capped + '. An earlier ring is wider for the same keys because r = sqrt(key): width = sqrt(b) - sqrt(a).'); }
    if (m === 'bigc') { i = W.big; o.push('Biggest commit by lines: ' + W.sha(i) + ' (' + W.repoName(i) + '), unix ' + W.t[i] + ' (' + day(W.t[i]) + '), ' + fmt(W.lines[i]) + ' lines, keys ' + fmt(W.start[i]) + ' to ' + fmt(W.start[i] + W.lines[i] - 1) + '. Band from r = ' + RK(W.start[i]).toFixed(2) + ' to ' + RK(W.start[i] + W.lines[i]).toFixed(2) + ' (' + (RK(W.start[i] + W.lines[i]) - RK(W.start[i])).toFixed(2) + ' units thick: too thin to see on the whole wafer, so the radar zooms in). Dots there are the true keys from KuiperScale.visibleKeys, placed by KuiperLaw.place.'); }
    if (m === 'pick') o.push('Commit ' + (i + 1) + ' of ' + fmt(W.n) + ': ' + W.sha(i) + ' (' + W.repoName(i) + '), unix ' + W.t[i] + ' (' + day(W.t[i]) + ' ' + clock(W.t[i]) + '), ' + fmt(W.lines[i]) + ' lines, gap_before ' + fmt(W.gap[i]) + ' keys. First key = sum of every earlier (gap_before + lines) + its own gap_before = ' + fmt(W.start[i]) + '. Line j lands at key ' + fmt(W.start[i]) + ' + j - 1, placed by KuiperLaw.place: angle = (key x 2654435769 mod 2^32) / 2^32 turns, r = sqrt(key + 0.5).');
    return o;
  }
  function showWhy() {
    var D = W.D, K = KuiperLaw.constants;
    var h = '';
    if (S.lastWhy && S.lastWhy.length) h += '<p><b>THIS MISSION.</b> ' + S.lastWhy.join(' ') + '</p>';
    h += '<p><b>THE LAW.</b> Every dot here is KuiperLaw.place(key): m = (key x ' + K.G32 + ') mod 2^32, angle = m / 2^32 turns anticlockwise (' + K.DEG_PER_KEY_ANTICLOCKWISE.toFixed(7) + ' deg per key), r = sqrt(key + 0.5). Source: ' + KuiperLaw.source + '.</p>';
    h += '<p><b>THE REAL DATA.</b> ' + fmt(W.n) + ' public commits from ' + D.source + '. Issued keys (lines) ' + fmt(W.issued) + ' + unissued keys (quiet) ' + fmt(D.unissued) + ' = ' + fmt(W.total) + '. Check against KuiperLaw SPACE ' + fmt(K.SPACE) + ': <b>' + (W.sumOK ? 'EQUAL' : 'NOT EQUAL') + '</b>.</p>';
    h += '<p><b>DARK RINGS.</b> Before each commit, the seconds since the last commit x ' + D.gapKeysPerSecond + ' keys are skipped, capped at ' + fmt(D.capSeconds) + ' s (14 days = ' + fmt(D.gapKeysPerSecond * D.capSeconds) + ' keys). Those keys are never issued: no dot, a dark ring. ' + W.capped + ' gaps hit the cap.</p>';
    h += '<p><b>WHAT THE RADAR DRAWS.</b> Whole-wafer views: each 2-pixel ring is lit by its real share of issued keys, plus about 7,000 real issued keys picked evenly by area; blips are the first key of each commit. Zoomed views: every true key in the window (KuiperScale.visibleKeys), coloured gold for the chosen commit, cyan for other commits, nothing for unissued keys.</p>';
    h += '<p><b>FRESHNESS.</b> The live wafer.tsv now holds ' + fmt(D.liveCommits) + ' commits (' + fmt(D.liveSpace) + ' keys); this game uses the first ' + fmt(W.n) + ', the set pinned by kuiper-law.js, so the game and the law agree to the key.</p>';
    S.root.querySelector('[data-ov="why"] .body').innerHTML = h;
    S.root.querySelector('[data-ov="why"]').classList.add('show');
  }

  // ---------- drawing ----------
  function hash(a, b) { var h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; }
  function buildCache() {
    var sc = S.scope, dpr = S.dpr, c = document.createElement('canvas');
    c.width = Math.round(sc.w * dpr); c.height = Math.round(sc.h * dpr);
    var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.save(); g.beginPath(); g.arc(sc.x, sc.y, sc.R, 0, 2 * Math.PI); g.clip();
    var s = S.cam.s, o = toS(0, 0), info = { mode: '', dots: 0 };
    var viewKeys = Math.pow(2 * sc.R / s, 2) / Math.PI;
    if (centred() && viewKeys > 20000) {
      info.mode = 'rings';
      var maxR = sc.R + 2, rimS = Math.sqrt(W.total) * s;
      for (var p = 0; p < Math.min(maxR, rimS); p += 2) {
        var k0 = keyAtR(p / s), k1 = keyAtR(Math.min(p + 2, rimS) / s), span = k1 - k0;
        if (span <= 0) continue;
        var fr = (issuedBefore(k1) - issuedBefore(k0)) / span;
        if (fr <= 0.002) continue;
        g.strokeStyle = 'rgba(0,255,255,' + (0.025 + 0.085 * fr).toFixed(3) + ')'; g.lineWidth = 2;
        g.beginPath(); g.arc(o[0], o[1], p + 1, 0, 2 * Math.PI); g.stroke();
      }
      // real issued keys, spread evenly by area
      var N = 7000, acc = 0; g.fillStyle = 'rgba(102,204,255,0.75)';
      for (p = 0; p < Math.min(maxR, rimS); p += 2) {
        var a0 = keyAtR(p / s), a1 = keyAtR(Math.min(p + 2, rimS) / s);
        acc += N * (a1 - a0) / W.total; var m = Math.floor(acc); acc -= m;
        for (var j = 0; j < m; j++) {
          var K = Math.floor(a0 + hash(p, j) * (a1 - a0)), A = at(K);
          if (!A.issued) continue;
          var q = KuiperLaw.place(K), P = toS(q.x, q.y); g.fillRect(P[0] - 1, P[1] - 1, 2, 2); info.dots++;
        }
      }
    } else {
      info.mode = 'exact';
      var P2 = KuiperScale.prepare({ count: W.total });
      var keys = KuiperScale.visibleKeys(P2, { cx: S.cam.cx, cy: S.cam.cy, zoom: s, w: 2 * sc.R, h: 2 * sc.R }, 30000);
      info.exactKeys = keys.info ? keys.info.exact : undefined;
      var fi = S.found ? S.found.i : -1, dotR = Math.max(1.2, Math.min(7, s * 0.45));
      for (var t = 0; t < keys.length; t++) {
        var Kk = keys[t]; if (Kk >= W.total) continue;
        var B = at(Kk); if (!B.issued) continue;
        var qq = KuiperLaw.place(Kk), PP = toS(qq.x, qq.y);
        // star look (as zoom.js): soft cyan halo, bright core, white centre when big; amber glow for the found commit
        if (keys.length < 1500) { var hg = g.createRadialGradient(PP[0], PP[1], dotR * 0.5, PP[0], PP[1], dotR * 2.6); hg.addColorStop(0, B.i === fi ? 'rgba(255,176,0,0.45)' : 'rgba(0,255,255,0.35)'); hg.addColorStop(1, 'rgba(0,255,255,0)'); g.fillStyle = hg; g.beginPath(); g.arc(PP[0], PP[1], dotR * 2.6, 0, 2 * Math.PI); g.fill(); }
        g.fillStyle = B.i === fi ? COL.amb : (B.i % 2 ? COL.cy : COL.sky);
        g.beginPath(); g.arc(PP[0], PP[1], dotR, 0, 2 * Math.PI); g.fill(); info.dots++;
        if (dotR >= 3) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(PP[0], PP[1], dotR * 0.45, 0, 2 * Math.PI); g.fill(); }
      }
      if (s > 12) { // close enough to read the keys
        g.font = 'bold 24px ' + FONT; g.fillStyle = '#fff';
        for (t = 0; t < keys.length && t < 60; t++) { var q3 = KuiperLaw.place(keys[t]), P3 = toS(q3.x, q3.y); if (at(keys[t]).issued) g.fillText(String(keys[t]), P3[0] + dotR + 3, P3[1] - dotR - 2); }
      }
    }
    g.restore();
    S.cache = { c: c, cam: S.cam, info: info };
  }

  function commitScreen() { // first key of every commit, on screen, with its anticlockwise screen angle
    if (S.cs && S.cs.cam === S.cam) return S.cs;
    var n = W.n, xs = new Float32Array(n), ys = new Float32Array(n), an = new Float32Array(n), sc = S.scope;
    for (var i = 0; i < n; i++) { var q = KuiperLaw.place(W.start[i]), p = toS(q.x, q.y); xs[i] = p[0]; ys[i] = p[1]; var a = Math.atan2(-(p[1] - sc.y), p[0] - sc.x); an[i] = a < 0 ? a + 2 * Math.PI : a; }
    S.cs = { cam: S.cam, xs: xs, ys: ys, an: an };
    return S.cs;
  }

  function frame(now) {
    if (!S) return;
    S.raf = requestAnimationFrame(frame);
    stepFly(now); stepLand(now);
    var ctx = S.ctx, sc = S.scope, dpr = S.dpr, R = sc.R;
    if (!S.cache || S.cache.cam !== S.cam || (S.cache.fi !== (S.found ? S.found.i : -1))) { buildCache(); S.cache.fi = S.found ? S.found.i : -1; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, S.cv.width, S.cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // scope rim and cross
    ctx.strokeStyle = '#1e5f66'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sc.x, sc.y, R, 0, 2 * Math.PI); ctx.stroke();
    ctx.drawImage(S.cache.c, 0, 0, sc.w, sc.h);
    var o = toS(0, 0), isC = centred();
    ctx.save(); ctx.beginPath(); ctx.arc(sc.x, sc.y, R, 0, 2 * Math.PI); ctx.clip();
    ctx.strokeStyle = 'rgba(0,255,255,0.35)'; ctx.lineWidth = 1;
    for (var dg = 0; dg < 360; dg += 10) { var ra = dg * Math.PI / 180, tl = dg % 90 === 0 ? 16 : 7; ctx.beginPath(); ctx.moveTo(sc.x + (R - tl) * Math.cos(ra), sc.y - (R - tl) * Math.sin(ra)); ctx.lineTo(sc.x + R * Math.cos(ra), sc.y - R * Math.sin(ra)); ctx.stroke(); }
    ctx.font = 'bold 24px ' + FONT; ctx.fillStyle = 'rgba(0,255,255,0.55)';
    ctx.textAlign = 'right'; ctx.fillText('0', sc.x + R - 20, sc.y + 8); ctx.textAlign = 'left'; ctx.fillText('180', sc.x - R + 20, sc.y + 8);
    ctx.textAlign = 'center'; ctx.fillText('270', sc.x, sc.y + R - 22); ctx.textAlign = 'left';
    // date rings (engineering annotation): time runs outward
    if (isC) {
      ctx.font = 'bold 24px ' + FONT; ctx.textAlign = 'center';
      var rimS = Math.sqrt(W.total) * S.cam.s;
      [0.35, 0.7, 1].forEach(function (f) {
        var rr = f * Math.min(R, rimS);
        var K = keyAtR(rr / S.cam.s), A = at(Math.min(K, W.total - 1)), i = Math.min(W.n - 1, A.i);
        ctx.strokeStyle = 'rgba(255,176,0,0.35)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(o[0], o[1], rr, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
        var d = new Date(W.t[i] * 1000), lab = MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
        var ly = o[1] - rr + 28; if (ly < 130) ly = o[1] + rr - 44;
        ctx.fillStyle = '#000'; var tw = ctx.measureText(lab).width; ctx.fillRect(o[0] - tw / 2 - 4, ly - 22, tw + 8, 28);
        ctx.fillStyle = COL.amb; ctx.fillText(lab, o[0], ly);
      });
      ctx.textAlign = 'left';
    }
    // sweep: anticlockwise, one turn in 6 s
    var period = 6000, a = ((now - S.t0) / period * 2 * Math.PI) % (2 * Math.PI);
    var cs = commitScreen(), n = W.n, minLinesPing = 200000, pinged = null;
    for (var i = 0; i < n; i++) {
      var x = cs.xs[i], y = cs.ys[i]; if (Math.hypot(x - sc.x, y - sc.y) > R + 4) continue;
      var age = ((a - cs.an[i]) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * period;
      var br = Math.exp(-age / 900);
      if (br > 0.04) { ctx.fillStyle = 'rgba(255,255,255,' + br.toFixed(3) + ')'; var sz = 2 + 3 * br; ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz); }
      if (age < 34 && W.lines[i] >= minLinesPing && now - S.lastPing > 110) pinged = i;
    }
    if (pinged !== null) { S.lastPing = now; var d0 = Math.hypot(cs.xs[pinged] - sc.x, cs.ys[pinged] - sc.y) / R; tone(1100 - 700 * Math.min(1, d0), 0.12, 0.025, 'triangle'); }
    var grd = 26;
    for (var w = 0; w < grd; w++) { var aa = a - w * 0.02; ctx.strokeStyle = 'rgba(34,238,119,' + (0.22 * (1 - w / grd)).toFixed(3) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sc.x, sc.y); ctx.lineTo(sc.x + R * Math.cos(aa), sc.y - R * Math.sin(aa)); ctx.stroke(); }
    ctx.strokeStyle = COL.grn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sc.x, sc.y); ctx.lineTo(sc.x + R * Math.cos(a), sc.y - R * Math.sin(a)); ctx.stroke();
    // mission hint: the gold glow comes after 3 s (or at once after a miss)
    if (S.mission && !S.fly) {
      var tg = target(S.mission), since = now - S.mStart, puls = 0.5 + 0.5 * Math.sin(now / 220);
      if (tg && since > 3000) {
        ctx.strokeStyle = 'rgba(255,176,0,' + (0.35 + 0.5 * puls).toFixed(3) + ')';
        if (tg.kind === 'point') { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(tg.x, tg.y, 20 + 14 * puls, 0, 2 * Math.PI); ctx.stroke(); }
        else { var mid = (tg.r0 + tg.r1) / 2, wd = Math.max(5, tg.r1 - tg.r0); ctx.lineWidth = wd + 6 * puls; ctx.beginPath(); ctx.arc(tg.cx, tg.cy, mid, 0, 2 * Math.PI); ctx.stroke(); }
      }
      if (S.mission === 'bigc' && tg) { ctx.fillStyle = 'rgba(255,176,0,0.10)'; ctx.beginPath(); ctx.arc(tg.cx, tg.cy, tg.r1, 0, 2 * Math.PI); ctx.arc(tg.cx, tg.cy, Math.max(0, tg.r0), 0, 2 * Math.PI, true); ctx.fill(); }
    }
    // landing lines of a picked commit
    if (S.land && S.land.pts.length) {
      var L = S.land, pts = L.pts, m = pts.length;
      ctx.strokeStyle = 'rgba(255,176,0,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
      var from = Math.max(0, m - 30); for (var j = from; j < m; j++) { var P = toS(pts[j].x, pts[j].y); if (j === from) ctx.moveTo(P[0], P[1]); else ctx.lineTo(P[0], P[1]); } ctx.stroke();
      ctx.fillStyle = COL.amb; for (j = 0; j < m; j++) { var Q = toS(pts[j].x, pts[j].y); ctx.fillRect(Q[0] - 2.5, Q[1] - 2.5, 5, 5); }
      var Z = toS(pts[m - 1].x, pts[m - 1].y), pl = 0.5 + 0.5 * Math.sin(now / 120);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(Z[0], Z[1], 10 + 6 * pl, 0, 2 * Math.PI); ctx.stroke();
      // leader line from the newest line to its label
      var lx = Z[0] + (Z[0] < sc.x ? 40 : -40), ly2 = Z[1] + (Z[1] < sc.y ? 46 : -46);
      ctx.beginPath(); ctx.moveTo(Z[0], Z[1]); ctx.lineTo(lx, ly2); ctx.stroke();
      ctx.font = 'bold 24px ' + FONT; ctx.textAlign = Z[0] < sc.x ? 'left' : 'right';
      var lab2 = 'LINE ' + fmt(m); var tw2 = ctx.measureText(lab2).width;
      ctx.fillStyle = '#000'; ctx.fillRect(Z[0] < sc.x ? lx : lx - tw2, ly2 - 22, tw2, 28); ctx.fillStyle = '#fff'; ctx.fillText(lab2, lx, ly2); ctx.textAlign = 'left';
    }
    // success burst
    if (S.burst) {
      var bt = (now - S.burst.t) / 1400;
      if (bt > 1) S.burst = null; else {
        var hx = S.hit ? S.hit.X : sc.x, hy = S.hit ? S.hit.Y : sc.y;
        for (var b = 0; b < 3; b++) { var rb = (bt + b * 0.15) * R * 0.5; ctx.strokeStyle = 'rgba(34,238,119,' + Math.max(0, 1 - bt - b * 0.2).toFixed(3) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(hx, hy, rb, 0, 2 * Math.PI); ctx.stroke(); }
      }
    }
    // where you tapped
    if (S.hit && now - S.hit.t < 900) { var ht = (now - S.hit.t) / 900; ctx.strokeStyle = 'rgba(255,255,255,' + (1 - ht).toFixed(3) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(S.hit.X, S.hit.Y, 8 + 30 * ht, 0, 2 * Math.PI); ctx.stroke(); }
    ctx.restore();
    // scale annotation (engineering drawing), bottom left of the scope
    ctx.font = 'bold 24px ' + FONT; ctx.fillStyle = COL.sky;
    var keysAcross = Math.pow(R / S.cam.s, 2);
    // cockpit readouts in the spare black space (left side on a laptop, under the circle on a phone)
    var ro = [isC ? 'EDGE KEY ' + big(Math.min(W.total, keysAcross)) : 'ZOOM: EVERY TRUE KEY', 'COMMITS ' + fmt(W.n), 'MISSIONS ' + Object.keys(S.done).length + ' OF 5'];
    if (S.found) ro.push('AMBER ' + W.sha(S.found.i));
    var phoneL = S.root.classList.contains('phone');
    var rx = phoneL ? 14 : 16, ry = phoneL ? Math.min(sc.h - 96 - 30 * (ro.length - 1), sc.y + R + 34) : sc.h / 2 - 15 * ro.length;
    if (!phoneL && sc.x - R < 300) { rx = 16; ry = 150; }
    for (var t2 = 0; t2 < ro.length; t2++) { ctx.fillStyle = t2 === 3 ? COL.amb : COL.sky; ctx.globalAlpha = 0.8; ctx.fillText(ro[t2], rx, ry + t2 * 30); }
    ctx.globalAlpha = 1;
    S.root.classList.toggle('busy', !!S.fly || !!(S.land && !S.land.fin));
  }

  // test hooks: read the state, and aim real pointer events where a child would tap
  window.KGRealGame = {
    state: function () {
      if (!S) return { open: false };
      return { open: true, mission: S.mission, done: Object.keys(S.done), caption: S.root.querySelector('.cap').textContent, sub: S.root.querySelector('.sub').textContent,
        cam: S.cam, flying: !!S.fly, scope: S.scope, cache: S.cache && S.cache.info, landed: S.land ? S.land.shown : 0, sumOK: W.sumOK, total: W.total, n: W.n, big: W.big, wide: W.wide,
        canvasRect: S.cv.getBoundingClientRect().toJSON() };
    },
    aim: function (m) { if (!S) return null; var p = aimPoint(m); if (!p) return null; var rc = S.cv.getBoundingClientRect(); return [rc.left + p[0], rc.top + p[1]]; },
    data: function () { return decode(); }
  };

  (window.KGModules = window.KGModules || []).push({ id: 'realgame', label: 'REAL KUIPER GAME', sentence: 'Play on the real Kuiper', open: open, close: close });
})();
