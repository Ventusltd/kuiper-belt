// RADAR module for LEARN THE KUIPER (Opus 3, 4 Oct 2026). Converted from finish3/radar.html (the prototype is untouched).
// The circle as a radar scope for grid engineering. Every real-wafer position comes from KuiperLaw.place.
// Plain JS, no build step, works from file:// and offline. Follows MODULE-CONTRACT.md.
(function () {
  'use strict';
  var DEG_REAL = 222.4922359, G32 = 2654435769, SHOW_CAP = 150000, KEYS_PER_SEC = 600, CAP_SEC = 1209600;
  var C = { bg: '#000', cyan: '#00ffff', blue: '#66ccff', amber: '#ffb000', green: '#22ee77', white: '#ffffff' };
  var rad = Math.PI / 180;
  function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }
  function md(a, m) { return ((a % m) + m) % m; }
  function el(tag, css, txt) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }

  var M = {
    id: 'radar', label: 'RADAR', sentence: 'Use the Kuiper as a radar for the grid',
    open: function (host) { this._run = build(host); },
    close: function () { if (this._run) { this._run.stop(); this._run = null; } }
  };
  (window.KGModules = window.KGModules || []).push(M);

  function build(host) {
    var L = window.KuiperLaw;
    var S = { N: 400, quiet: 0, turn: 'REAL', sweep: 90, spinning: true, muted: false, contact: null, woke: false,
      drag: false, downAt: null, moved: 0, lastPing: 0, probe: null, big: null, lap: 0, alive: true, why: false };
    var P = { n: 0, R: 1, rings: [], dark: null, stride: 1 };
    var PR = null, AC = null, raf = 0, timers = [], tsec = 0, last = performance.now();

    // ---------- DOM ----------
    var style = el('style');
    style.textContent =
      '.kgr{position:absolute;inset:0;background:#000;color:#00ffff;font:bold 24px/1.25 "Segoe UI",Arial,sans-serif;overflow:hidden}' +
      '.kgr .bd{position:absolute;inset:0;overflow:hidden}' +
      '.kgr *{box-sizing:border-box}' +
      '.kgr .sc{position:absolute;inset:0}' +
      '.kgr canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}' +
      '.kgr .cap{position:absolute;left:0;right:0;top:0;padding:calc(8px + env(safe-area-inset-top)) 96px 0 calc(12px + env(safe-area-inset-left));font-size:26px;line-height:40px;color:#ffb000;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity 1.5s;z-index:2}' +
      '.kgr .bar{position:absolute;left:0;right:0;bottom:0;padding:0 calc(10px + env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) calc(10px + env(safe-area-inset-left));display:flex;gap:8px;justify-content:space-between;z-index:3;transition:opacity .4s}' +
      '.kgr .bar .gp{display:flex;gap:8px}' +
      '.kgr .pn{position:absolute;left:0;right:0;bottom:0;max-height:72%;overflow:auto;padding:16px calc(16px + env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));display:none;flex-direction:column;gap:10px;background:rgba(0,0,0,0.92);border-top:2px solid rgba(0,255,255,0.5);z-index:4}' +
      '.kgr .pn.open{display:flex}' +
      '.kgr .pn>*{flex:none}' +
      '.kgr h2{margin:0;font-size:30px;color:#00ffff;letter-spacing:2px}' +
      '.kgr .mode{font-size:24px;color:#22ee77}.kgr .mode.pr{color:#ffb000}' +
      '.kgr label{display:block;font-size:24px;color:#66ccff}' +
      '.kgr input,.kgr select{font:bold 28px "Segoe UI",Arial,sans-serif;background:#000;color:#fff;border:2px solid rgba(0,255,255,0.4);border-radius:10px;padding:6px 12px;width:100%;min-height:72px}' +
      '.kgr input:focus,.kgr select:focus{border-color:#00ffff;outline:none}' +
      '.kgr button{font:bold 24px "Segoe UI",Arial,sans-serif;background:transparent;color:rgba(0,255,255,0.75);border:2px solid rgba(0,255,255,0.5);border-radius:12px;min-height:72px;min-width:72px;padding:0 12px;cursor:pointer}' +
      '.kgr button:hover,.kgr button:active{color:#00ffff;border-color:#00ffff}' +
      '.kgr button.on{color:#ffb000;border-color:rgba(255,176,0,0.7)}' +
      '.kgr .row{display:flex;gap:8px}.kgr .row>*{flex:1}' +
      '.kgr .ct{font-size:26px;color:#fff;white-space:pre-wrap}' +
      '.kgr .wk{font-size:24px;color:#66ccff;white-space:pre-wrap}' +
      '.kgr .x{position:absolute;right:calc(10px + env(safe-area-inset-right));top:calc(8px + env(safe-area-inset-top));width:72px;height:72px;font-size:40px;line-height:1;z-index:5;padding:0}' +
      '.kgr .why{position:absolute;inset:0;background:rgba(0,0,0,0.95);z-index:4;overflow:auto;padding:calc(96px + env(safe-area-inset-top)) 28px calc(28px + env(safe-area-inset-bottom));font-size:24px;color:#fff;white-space:pre-wrap;display:none}' +
      '.kgr .why b{color:#ffb000}' +
      '@media (max-width:760px){.kgr h2{font-size:26px}.kgr .cap{font-size:24px;padding-right:72px}' +
      '.kgr button{min-height:56px;min-width:56px;font-size:24px;padding:0 8px}.kgr input,.kgr select{min-height:56px;font-size:26px}.kgr .x{width:56px;height:56px;font-size:32px}.kgr .why{padding:calc(76px + env(safe-area-inset-top)) 14px 14px}}';
    var root = el('div'); root.className = 'kgr';
    root.innerHTML =
      '<div class="bd"><div class="sc"><canvas></canvas><div class="cap">TAP THE SCOPE. DRAG TO AIM.</div></div>' +
      '<div class="bar"><div class="gp"><button data-k="div" aria-label="fewer keys">/10</button><button data-k="mul" aria-label="more keys">x10</button></div>' +
      '<div class="gp"><button data-k="whyb">WHY</button><button data-k="menu" aria-label="controls">MENU</button></div></div>' +
      '<div class="pn">' +
      ' <div class="row"><h2 style="flex:3">KUIPER RADAR</h2><button data-k="hide" style="flex:1">HIDE</button></div><div class="mode"></div>' +
      ' <label>FIND a key or a grid name (SUBSTATION 7)<input data-k="find" aria-label="find" placeholder="type, then Enter" autocomplete="off" enterkeyhint="go"></label>' +
      ' <label>HOW MANY keys on the scope<input data-k="many" aria-label="how many" value="400" inputmode="numeric"></label>' +
      ' <label>TURN per key, degrees<select data-k="turn" aria-label="turn per key">' +
      '  <option value="REAL">222.49 REAL KUIPER</option><option value="90">90 practice</option><option value="120">120 practice</option>' +
      '  <option value="137.5078">137.51 practice</option><option value="180">180 practice</option><option value="1">1 practice</option></select></label>' +
      ' <label>QUIET TIME, seconds (600 keys a second)<input data-k="quiet" aria-label="quiet seconds" value="0" inputmode="numeric"></label>' +
      ' <div class="row"><button data-k="real">REAL</button><button data-k="spin" class="on">SWEEP</button><button data-k="mute">MUTE</button></div>' +
      ' <div class="ct">No contact yet. Tap the scope, or type a key and press Enter.</div><div class="wk"></div>' +
      '</div></div><div class="why"></div><button class="x" aria-label="close">X</button>';
    host.appendChild(style); host.appendChild(root);
    var q = function (s) { return root.querySelector(s); }, K = function (k) { return root.querySelector('[data-k="' + k + '"]'); };
    var cv = q('canvas'), g = cv.getContext('2d'), cap = q('.cap'), modeEl = q('.mode'), ct = q('.ct'), wk = q('.wk'), whyEl = q('.why'), bar = q('.bar'), pn = q('.pn');

    // ---------- law ----------
    function isReal() { return S.turn === 'REAL'; }
    function placeKey(k) {
      if (isReal()) return L.place(k);                    // the real Kuiper, never copied
      // PRACTICE spiral, labelled. KuiperScale reduces the key before multiplying, so it stays exact at giant keys
      // (a plain k * t loses whole degrees once k * t passes 2^53).
      var t = parseFloat(S.turn);
      if (!PR || PR.degreesPerKey !== t) PR = { first: 0, count: 9007199254740992, degreesPerKey: t };
      var q = window.KuiperScale.place(k, PR);
      return { key: k, deg: q.deg, theta: q.deg * rad, r: q.r, x: q.x, y: q.y };
    }
    function quietKeys() { return Math.min(S.quiet, CAP_SEC) * KEYS_PER_SEC; }
    function hash(b) { b = Math.imul(b ^ 0x9e3779b9, 0x85ebca6b) >>> 0; b ^= b >>> 13; b = Math.imul(b, 0xc2b2ae35) >>> 0; return (b ^ (b >>> 16)) >>> 0; }

    function rebuild() {
      var N = Math.max(1, Math.min(S.N, 9e15)), qn = quietKeys(), q0 = Math.floor(N / 2);
      var shown = Math.min(N, SHOW_CAP), stride = Math.max(1, Math.ceil(N / shown));
      P.x = new Float32Array(shown); P.y = new Float32Array(shown); P.r = new Float32Array(shown); P.k = new Float64Array(shown);
      P.ping = new Float32Array(shown); P.buckets = []; for (var b = 0; b < 360; b++) P.buckets.push([]);
      P.n = 0;
      for (var blk = 0; blk * stride < N && P.n < shown; blk++) {
        var k = blk * stride + (stride > 1 ? hash(blk) % stride : 0); if (k >= N) continue;
        if (qn && k >= q0 && k < q0 + qn) continue;
        var p = placeKey(k), i = P.n++;
        P.x[i] = p.x; P.y[i] = p.y; P.r[i] = p.r; P.k[i] = k; P.buckets[Math.floor(p.deg) % 360].push(i);
      }
      P.stride = stride; P.R = Math.sqrt(N - 1 + 0.5) * 1.06;
      P.dark = qn ? [Math.sqrt(q0 + 0.5), Math.sqrt(Math.min(N, q0 + qn) + 0.5)] : null;
      var step = 1; while (P.R / step > 10) step = step * (String(step)[0] === '2' ? 2.5 : 2);
      P.rings = []; for (var rr = step; rr < P.R; rr += step) P.rings.push(rr);
      modeEl.className = 'mode' + (isReal() ? '' : ' pr');
      modeEl.textContent = (isReal() ? 'REAL KUIPER: r = sqrt(key + 0.5), 222.49 deg a key, anticlockwise'
        : 'PRACTICE, NOT THE KUIPER: ' + S.turn + ' deg a key') + (stride > 1 ? '. Showing 1 dot in ' + fmt(stride) : '');
    }

    // stated rule: letters A=1 .. Z=26 added, plus the numbers
    function nameToKey(s) {
      s = String(s).trim(); if (!s) return null;
      if (/^[\d,\s]+$/.test(s)) return { key: parseInt(s.replace(/[^\d]/g, ''), 10), how: 'KEY ' + fmt(parseInt(s.replace(/[^\d]/g, ''), 10)) };
      var sum = 0, parts = [];
      s.toUpperCase().replace(/[A-Z]/g, function (c) { var v = c.charCodeAt(0) - 64; sum += v; parts.push(c + '=' + v); return c; });
      s.replace(/\d+/g, function (d) { sum += +d; parts.push(d); return d; });
      if (!parts.length) return null;
      return { key: sum, how: s.toUpperCase() + ' = ' + parts.join(' + ') + ' = KEY ' + sum };
    }
    function compassOf(deg) { return md(90 - deg, 360); }
    function setContact(k, how, quietly) {
      var p = placeKey(k);
      if (k >= S.N) { S.N = k + 1; K('many').value = String(S.N); rebuild(); }
      S.contact = { key: k, deg: p.deg, r: p.r, x: p.x, y: p.y, found: false, how: how };
      var comp = compassOf(p.deg);
      ct.textContent = 'CONTACT ' + how + '\nBEARING ' + p.deg.toFixed(1) + ' deg (maths, from 3 o\'clock, anticlockwise)\nCOMPASS ' +
        ('00' + comp.toFixed(1)).slice(-5) + ' deg (from north, clockwise)\nRANGE ' + p.r.toFixed(3);
      if (isReal()) {
        var laps = Number((BigInt(Math.floor(k)) * BigInt(G32)) >> 32n);
        wk.textContent = 'WORKING: ' + fmt(k) + ' x 222.4922 deg = ' + fmt(k * DEG_REAL) + ' deg\n' + fmt(laps) +
          ' whole laps thrown away (that is MOD 360)\nleaves ' + p.deg.toFixed(1) + ' deg.  RANGE = sqrt(' + fmt(k) + ' + 0.5) = ' + p.r.toFixed(3);
      } else {
        var t = parseFloat(S.turn), tot = k * t;
        wk.textContent = 'WORKING (practice): ' + fmt(k) + ' x ' + S.turn + ' = ' + fmt(tot) + ' deg\n' + fmt(Math.floor(tot / 360)) +
          ' whole laps thrown away (MOD 360)\nleaves ' + p.deg.toFixed(1) + ' deg.  RANGE = sqrt(' + fmt(k) + ' + 0.5) = ' + p.r.toFixed(3);
      }
      if (!quietly) { S.big = { key: k, deg: p.deg, comp: comp, r: p.r, t: tsec }; beep(p.r, 0.09, 0.6); }
    }
    function find(txt) { var nk = nameToKey(txt); if (!nk || !(nk.key >= 0) || !isFinite(nk.key)) { ct.textContent = 'Type a key (97) or a name with letters (SUBSTATION 7).'; return; } setContact(nk.key, nk.how); }

    // ---------- sound (after first gesture, soft, mute) ----------
    function beep(r, vol, dur) {
      if (S.muted || !S.woke) return;
      try {
        if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
        var o = AC.createOscillator(), gn = AC.createGain(), f = 220 * Math.pow(2, 2.5 * (1 - Math.min(1, r / P.R)));   // near = high
        o.type = 'triangle'; o.frequency.value = f; gn.gain.value = vol;
        gn.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur); o.connect(gn); gn.connect(AC.destination);
        o.start(); o.stop(AC.currentTime + dur + 0.05);
      } catch (e) { }
    }
    function blip(r) { var t = performance.now(); if (t - S.lastPing < 90) return; S.lastPing = t; beep(r, 0.025, 0.35); }

    // ---------- layout ----------
    function size() {
      // the canvas fills the host; the backing store follows devicePixelRatio; drawing is in CSS pixels
      var box = q('.sc'), cw = Math.max(200, box.clientWidth), ch = Math.max(200, box.clientHeight), d = window.devicePixelRatio || 1;
      cv.width = Math.round(cw * d); cv.height = Math.round(ch * d);
      // the scope is a true circle in a square centred in the screen; spare space stays black for the instruments
      var top = 48, bot = 76, s = Math.max(200, Math.min(cw, ch - top - bot));
      VW = { cw: cw, ch: ch, d: d, s: s, ox: (cw - s) / 2, oy: top + (ch - top - bot - s) / 2 };
    }
    var VW = { cw: 400, ch: 400, d: 1, s: 400, ox: 0, oy: 0 };
    function geo() { var W = VW.s, pad = W < 500 ? 34 : 54; return { W: W, c: W / 2, sc: (W / 2 - pad) / P.R, pad: pad }; }

    // ---------- draw ----------
    function draw(now) {
      if (!S.alive) return;
      var dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now; tsec += dt;
      if (S.spinning && !S.drag) { var prev = S.sweep; S.sweep = S.sweep + dt * 60; if (S.sweep >= 360) { S.sweep -= 360; S.lap++; } passed(prev, S.sweep); }
      var G = geo(), W = G.W, c = G.c, sc = G.sc, small = W < 500, i;
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
      g.setTransform(VW.d, 0, 0, VW.d, VW.d * VW.ox, VW.d * VW.oy);
      starField(c, W);
      if (P.dark) { g.fillStyle = '#1a1000'; g.beginPath(); g.arc(c, c, P.dark[1] * sc, 0, 2 * Math.PI); g.moveTo(c + P.dark[0] * sc, c); g.arc(c, c, P.dark[0] * sc, 0, 2 * Math.PI, true); g.fill('evenodd'); }
      // range rings, ring n starts at key n^2
      g.lineWidth = 2; g.font = 'bold 24px "Segoe UI",Arial,sans-serif'; g.textBaseline = 'middle';
      var every = small && P.rings.length > 5 ? 2 : 1;
      for (i = 0; i < P.rings.length; i++) {
        var rr = P.rings[i]; g.strokeStyle = '#124a52'; g.beginPath(); g.arc(c, c, rr * sc, 0, 7); g.stroke();
        if ((i + 1) % every === 0 || i === P.rings.length - 1) {
          var a = -38 * rad, lx = c + rr * sc * Math.cos(a), ly = c + rr * sc * Math.sin(a);
          g.fillStyle = '#66ccff'; g.textAlign = 'left'; var rl = small ? fmt(rr) : 'r ' + fmt(rr) + '  key ' + fmt(rr * rr); g.fillText(rl, Math.min(lx + 4, W - g.measureText(rl).width - 6), ly);
        }
      }
      g.beginPath(); g.arc(c, c, P.R * sc, 0, 7); g.strokeStyle = '#00ffff'; g.lineWidth = 3; g.stroke();
      // crosshair and compass ticks
      g.strokeStyle = '#0d343a'; g.lineWidth = 1; g.beginPath(); g.moveTo(c, G.pad); g.lineTo(c, W - G.pad); g.moveTo(G.pad, c); g.lineTo(W - G.pad, c); g.stroke();
      g.strokeStyle = '#2b7f88'; g.lineWidth = 2;
      for (var d = 0; d < 360; d += 10) { var tr = P.R * sc, tl = d % 90 === 0 ? 14 : 7; g.beginPath(); g.moveTo(c + tr * Math.cos(-d * rad), c + tr * Math.sin(-d * rad)); g.lineTo(c + (tr + tl) * Math.cos(-d * rad), c + (tr + tl) * Math.sin(-d * rad)); g.stroke(); }
      // both angle systems: maths (cyan, from 3 o'clock) and compass (amber, from north)
      var e = P.R * sc;
      g.textAlign = 'center';
      g.fillStyle = '#00ffff';
      g.fillText('0', c + e - 16, c - 18); g.fillText('90', c + 26, c - e + 18); g.fillText('180', c - e + 30, c - 18); g.fillText('270', c + 32, c + e - 18);
      g.fillStyle = '#ffb000';
      g.fillText('N 000', c, c - e - (small ? 18 : 30)); g.fillText(small ? 'E' : 'E 090', W - (small ? 14 : 34), c); g.fillText(small ? 'W' : 'W 270', small ? 14 : 34, c); g.fillText('S 180', c, c + e + (small ? 18 : 30));
      // contacts
      var dz = P.n > 40000 ? 1.5 : P.n > 4000 ? 2 : P.n > 600 ? 3 : 4;
      // star look (as zoom.js): a soft cyan halo, then a bright core; white centres when big enough
      if (P.n < 1500) { var hr = dz * 2.2; for (i = 0; i < P.n; i++) { var hx = c + P.x[i] * sc, hy = c - P.y[i] * sc, hg = g.createRadialGradient(hx, hy, dz * 0.3, hx, hy, hr); hg.addColorStop(0, 'rgba(0,255,255,0.35)'); hg.addColorStop(1, 'rgba(0,255,255,0)'); g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, hr, 0, 7); g.fill(); } }
      g.fillStyle = P.n > 40000 ? 'rgba(0,255,255,0.55)' : '#00ffff'; g.beginPath();
      for (i = 0; i < P.n; i++) { var ux = c + P.x[i] * sc, uy = c - P.y[i] * sc; g.moveTo(ux + dz / 2, uy); g.arc(ux, uy, dz / 2, 0, 7); } g.fill();
      if (dz >= 3) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); for (i = 0; i < P.n; i++) { var wx = c + P.x[i] * sc, wy = c - P.y[i] * sc; g.moveTo(wx + dz * 0.22, wy); g.arc(wx, wy, dz * 0.22, 0, 7); } g.fill(); }
      for (i = 0; i < P.n; i++) { var age = tsec - P.ping[i]; if (P.ping[i] && age < 1.5) { var al = 1 - age / 1.5, s = dz + (P.n > 4000 ? 1 : P.n > 600 ? 4 : 8) * al; g.fillStyle = 'rgba(180,255,255,' + (P.n > 4000 ? 0.5 * al : al).toFixed(3) + ')'; g.beginPath(); g.arc(c + P.x[i] * sc, c - P.y[i] * sc, s / 2, 0, 7); g.fill(); } }
      if (P.dark) { g.fillStyle = '#ffb000'; g.textAlign = 'center'; g.fillText(small ? 'QUIET: no contacts' : 'QUIET TIME: ' + fmt(quietKeys()) + ' keys, no contacts', c, c + (P.dark[0] + P.dark[1]) / 2 * sc); }
      // sweep: anticlockwise, wedge trails behind the arm
      var th = S.sweep * rad; g.save(); g.translate(c, c);
      var grd = g.createRadialGradient(0, 0, 0, 0, 0, e); grd.addColorStop(0, 'rgba(0,255,255,0.05)'); grd.addColorStop(1, 'rgba(0,255,255,0.22)');
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, e, -th, -th + 40 * rad); g.closePath(); g.fillStyle = grd; g.fill();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(e * Math.cos(-th), e * Math.sin(-th)); g.strokeStyle = 'rgba(0,255,255,0.45)'; g.lineWidth = 2; g.stroke(); g.restore();
      // the contact
      if (S.contact) {
        var px = c + S.contact.x * sc, py = c - S.contact.y * sc, dd = md(S.sweep - S.contact.deg, 360);
        if (dd < 4 && !S.contact.found) { S.contact.found = true; beep(S.contact.r, 0.05, 0.5); }
        var hot = S.contact.found ? (0.65 + 0.35 * Math.sin(tsec * 6)) : 0.55;
        g.strokeStyle = 'rgba(255,176,0,' + hot.toFixed(3) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, 16, 0, 7); g.stroke();
        g.save(); g.shadowColor = '#ffb000'; g.shadowBlur = 24; g.fillStyle = '#ffb000'; g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill(); g.restore();
        g.setLineDash([8, 6]); g.beginPath(); g.moveTo(c, c); g.lineTo(px, py); g.stroke(); g.setLineDash([]);
        if (!S.big || tsec - S.big.t > 4) { g.fillStyle = '#ffb000'; g.textAlign = 'left'; var lab = 'KEY ' + fmt(S.contact.key) + '  ' + S.contact.deg.toFixed(1) + ' deg  r ' + S.contact.r.toFixed(2); g.fillText(lab, Math.max(8, Math.min(px + 20, W - g.measureText(lab).width - 8)), Math.max(30, Math.min(py + 34, W - 30))); }
      }
      // toddler big numbers
      if (S.big && tsec - S.big.t < 4) {
        var fa = Math.min(1, 4 - (tsec - S.big.t)), bs = small ? 48 : 72;
        g.globalAlpha = fa; g.textAlign = 'center'; g.font = 'bold ' + bs + 'px "Segoe UI",Arial,sans-serif'; g.fillStyle = '#ffffff';
        // the big numbers sit in the spare black space (side on a laptop, above the scope on a phone), never over the centre
        var bx = c, by = bs * 0.45, sideW = VW.ox - 16, topH = VW.oy - 48;
        if (sideW > 240) { bx = -VW.ox / 2; by = bs; bs = Math.min(bs, sideW / 4); } else if (topH > bs * 1.4) { by = -topH + bs * 0.5; }
        g.font = 'bold ' + bs + 'px "Segoe UI",Arial,sans-serif';
        g.fillText(fmt(S.big.key), bx, by);
        g.font = 'bold ' + Math.max(24, Math.round(bs * 0.38)) + 'px "Segoe UI",Arial,sans-serif'; g.fillStyle = '#ffb000';
        if (sideW > 240) { g.fillText('BEARING ' + S.big.deg.toFixed(0), bx, by + bs * 0.75); g.fillText('RANGE ' + S.big.r.toFixed(1), bx, by + bs * 1.3); }
        else g.fillText('BEARING ' + S.big.deg.toFixed(0) + '   RANGE ' + S.big.r.toFixed(1), bx, by + bs * 0.6);
        g.globalAlpha = 1; g.font = 'bold 24px "Segoe UI",Arial,sans-serif';
      }
      if (S.probe) { g.fillStyle = '#fff'; g.textAlign = 'left'; var pl = 'bearing ' + S.probe.deg.toFixed(0) + '  compass ' + compassOf(S.probe.deg).toFixed(0) + '  range ' + S.probe.r.toFixed(1); g.fillText(pl, Math.max(8, Math.min(S.probe.sx + 14, W - g.measureText(pl).width - 8)), Math.max(30, S.probe.sy - 24)); }
      g.fillStyle = '#22ee77'; g.textAlign = 'left';
      g.fillText('SWEEP ' + S.sweep.toFixed(0) + (small ? '' : ' deg  LAP ' + S.lap), 8, W - 16); g.textAlign = 'right';
      g.fillText(small ? 'LAP ' + S.lap : fmt(P.n) + ' of ' + fmt(S.N) + ' keys', W - 8, W - 16);
      bar.style.opacity = S.drag ? '0.15' : '1';
      raf = requestAnimationFrame(draw);
    }
    // a faint star field behind the scope (fixed seed, so it does not flicker)
    function starField(c, W) {
      g.fillStyle = 'rgba(255,255,255,0.18)';
      for (var j = 0; j < 140; j++) { var hx = hash(j * 2 + 7) / 4294967296, hy = hash(j * 2 + 8) / 4294967296; g.fillRect(hx * W, hy * W, 1.2, 1.2); }
    }
    function passed(a, b) {   // every dot the arm crosses pings
      var from = Math.floor(a), n = md(Math.floor(b) - from, 360), best = -1;
      for (var s = 1; s <= n; s++) { var bk = P.buckets[md(from + s, 360)]; for (var j = 0; j < bk.length; j++) { P.ping[bk[j]] = tsec; best = bk[j]; } }
      if (best >= 0) blip(P.r[best]);
    }

    // ---------- pointer ----------
    function world(e) { var r = cv.getBoundingClientRect(), G = geo(), x = (e.clientX - r.left) - VW.ox - G.c, y = G.c - ((e.clientY - r.top) - VW.oy); return { x: x / G.sc, y: y / G.sc, sx: e.clientX - r.left - VW.ox, sy: e.clientY - r.top - VW.oy }; }
    function aim(e) {
      var w = world(e), prev = S.sweep; S.sweep = md(Math.atan2(w.y, w.x) / rad, 360);
      S.probe = { deg: S.sweep, r: Math.hypot(w.x, w.y), sx: w.sx, sy: w.sy };
      var d = md(S.sweep - prev, 360); if (d > 0 && d < 180) passed(prev, S.sweep);
    }
    function wake() { if (!S.woke) { S.woke = true; cap.textContent = 'DRAG TO AIM. TYPE A KEY. CHANGE HOW MANY.'; timers.push(setTimeout(function () { cap.style.opacity = '0.3'; }, 7000)); } }
    function nearest(w) { var bi = -1, bd = Infinity; for (var i = 0; i < P.n; i++) { var dx = P.x[i] - w.x, dy = P.y[i] - w.y, d2 = dx * dx + dy * dy; if (d2 < bd) { bd = d2; bi = i; } } return bi; }
    function onDown(e) { wake(); S.drag = true; S.downAt = { x: e.clientX, y: e.clientY }; S.moved = 0; try { cv.setPointerCapture(e.pointerId); } catch (x) { } aim(e); }
    function onMove(e) { if (!S.drag) return; S.moved = Math.max(S.moved, Math.hypot(e.clientX - S.downAt.x, e.clientY - S.downAt.y)); aim(e); }
    function onUp(e) {
      if (!S.drag) return; S.drag = false;
      if (S.moved < 10) { var i = nearest(world(e)); if (i >= 0) { S.probe = null; setContact(P.k[i], 'KEY ' + fmt(P.k[i])); } }   // tap: toddler contact
      timers.push(setTimeout(function () { S.probe = null; }, 2500));
    }
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', function () { S.drag = false; });

    // ---------- controls (each box owns its Enter and change) ----------
    function num(v, d) { v = parseFloat(String(v).replace(/[^\d.eE+-]/g, '')); return isFinite(v) ? v : d; }
    function setN(n) { S.N = Math.max(1, Math.min(9e15, Math.floor(n))); K('many').value = String(S.N); rebuild(); if (S.contact) setContact(S.contact.key, S.contact.how, true); }
    function commit(k) {
      wake(); var v = K(k).value;
      if (k === 'many') return setN(num(v, S.N));
      if (k === 'quiet') { S.quiet = Math.max(0, num(v, 0)); K('quiet').value = String(S.quiet); }
      if (k === 'turn') { S.turn = (v === 'REAL' || Math.abs(parseFloat(v) - DEG_REAL) < 0.005) ? 'REAL' : v; }
      rebuild(); if (S.contact) setContact(S.contact.key, S.contact.how, true);
    }
    ['many', 'quiet'].forEach(function (k) {
      var b = K(k);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter') { commit(k); b.blur(); } else if (e.key === 'Escape') { b.blur(); e.stopPropagation(); } });
      b.addEventListener('change', function () { commit(k); });
    });
    K('turn').addEventListener('change', function () { commit('turn'); });
    K('turn').addEventListener('keydown', function (e) { if (e.key === 'Escape') { K('turn').blur(); e.stopPropagation(); } });
    var lastFind = null;
    function commitFind() { var v = K('find').value; if (!String(v).trim() || v === lastFind) return; lastFind = v; wake(); find(v); }
    K('find').addEventListener('keydown', function (e) { if (e.key === 'Enter') { lastFind = null; commitFind(); } else if (e.key === 'Escape') { K('find').blur(); e.stopPropagation(); } });
    K('find').addEventListener('change', commitFind);
    function sheet(on) { pn.classList.toggle('open', on); K('menu').classList.toggle('on', on); bar.style.visibility = on ? 'hidden' : 'visible'; }
    K('menu').addEventListener('click', function () { wake(); sheet(!pn.classList.contains('open')); });
    K('hide').addEventListener('click', function () { sheet(false); });
    K('div').addEventListener('click', function () { wake(); setN(Math.max(1, S.N / 10)); });
    K('mul').addEventListener('click', function () { wake(); setN(S.N * 10); });
    K('real').addEventListener('click', function () { wake(); S.turn = 'REAL'; K('turn').value = 'REAL'; S.quiet = 0; K('quiet').value = '0'; rebuild(); if (S.contact) setContact(S.contact.key, S.contact.how, true); });
    K('spin').addEventListener('click', function () { S.spinning = !S.spinning; this.classList.toggle('on', S.spinning); });
    K('mute').addEventListener('click', function () { wake(); S.muted = !S.muted; this.classList.toggle('on', S.muted); this.textContent = S.muted ? 'MUTED' : 'MUTE'; });
    K('whyb').addEventListener('click', function () { S.why = !S.why; if (S.why) whyEl.innerHTML = whyText(); whyEl.style.display = S.why ? 'block' : 'none'; this.classList.toggle('on', S.why); });
    whyEl.addEventListener('click', function () { S.why = false; whyEl.style.display = 'none'; K('whyb').classList.remove('on'); });
    q('.x').addEventListener('click', function () { M.close(); });

    function whyText() {
      var cst = L.constants || {}, k = S.contact ? S.contact.key : 97, p = L.place(k);
      var laps = Number((BigInt(Math.floor(k)) * BigInt(G32)) >> 32n);
      return '<b>WHY THE RADAR WORKS</b>   (tap anywhere to close)\n\n' +
        '<b>The law.</b> Key k sits at range r = sqrt(k + 0.5) and turns k x 2654435769 / 2^32 of a lap anticlockwise,\n' +
        'that is ' + (cst.DEG_PER_KEY_ANTICLOCKWISE || DEG_REAL).toFixed(7) + ' deg a key (137.5077641 deg clockwise is the same point).\n\n' +
        '<b>MOD = laps thrown away.</b> Key ' + fmt(k) + ': ' + fmt(k) + ' x 2654435769 = ' + (BigInt(Math.floor(k)) * BigInt(G32)).toString() + '.\n' +
        'Divide by 2^32 = 4294967296: ' + fmt(laps) + ' whole laps (thrown away) and a remainder m = ' + p.m + '.\n' +
        'm / 2^32 x 360 = ' + p.deg.toFixed(4) + ' deg. The 32-bit multiply does the MOD for free.\n\n' +
        '<b>Two bearings.</b> Maths: 0 at 3 o\'clock, anticlockwise. Grid compass: 000 at north, clockwise.\n' +
        'compass = (90 - maths) MOD 360;  maths = (90 - compass) MOD 360.  Key ' + fmt(k) + ': maths ' + p.deg.toFixed(1) + ', compass ' + compassOf(p.deg).toFixed(1) + '.\n\n' +
        '<b>Why sqrt gives equal area.</b> The disc inside range r has area pi r^2 = pi (k + 0.5).\n' +
        'Each new key adds exactly pi of area, so the contacts stay evenly packed however many there are.\n' +
        'Ring n begins at key n^2; between ring n and ring n+1 sit 2n + 1 keys, because (n+1)^2 - n^2 = 2n + 1.\n' +
        'Ten times the keys makes the scope sqrt(10) = 3.16 times wider: the /10 and x10 buttons re-range it.\n\n' +
        '<b>Quiet time.</b> Keys are issued at 600 a second (14-day cap, 1,209,600 s). Quiet seconds skip 600 keys each: a dark band, no contacts.\n\n' +
        '<b>Names to keys (a stated rule for this page only).</b> A=1 .. Z=26 added, plus the numbers. SUBSTATION 7 = 140 + 7 = KEY 147.\n\n' +
        '<b>Practice turns.</b> 90, 120, 180 and 1 deg are NOT the Kuiper: simple fractions of a lap pile contacts into spokes.\n\n' +
        '<b>Sources.</b> window.KuiperLaw.place, lifted from ' + (L.source || 'kuiper-belt index.html') + '\nLive wafer: ' + (L.live || 'https://ventusltd.github.io/kuiper-belt/') +
        '\nWhole wafer key space: ' + fmt(cst.SPACE || 59637070538) + ' keys.';
    }

    function onKey(e) {   // bubble phase on document, removed in close(): Escape with nothing focused closes
      if (e.key !== 'Escape') return;
      var a = document.activeElement;
      if (a && root.contains(a) && /INPUT|SELECT/.test(a.tagName)) { a.blur(); return; }
      if (S.why) { S.why = false; whyEl.style.display = 'none'; return; }
      if (pn.classList.contains('open')) { sheet(false); return; }
      M.close();
    }
    document.addEventListener('keydown', onKey);
    var onResize = function () { size(); };
    window.addEventListener('resize', onResize);

    size(); rebuild(); raf = requestAnimationFrame(draw);
    window.KGRadar = { state: function () { return { N: S.N, contacts: P.n, R: P.R, rings: P.rings.slice(), dark: P.dark, sweep: S.sweep, lap: S.lap, contact: S.contact, turn: S.turn, quiet: S.quiet, stride: P.stride, woke: S.woke, why: S.why, alive: S.alive, real: isReal(), mode: modeEl.textContent, text: ct.textContent, work: wk.textContent }; } };

    return {
      stop: function () {
        S.alive = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
        document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize);
        try { if (AC) AC.close(); } catch (e) { }
        if (root.parentNode) root.parentNode.removeChild(root); if (style.parentNode) style.parentNode.removeChild(style);
        if (window.KGRadar) window.KGRadar.closed = true;
      }
    };
  }
})();
