// grid.js  DRAW THE GRID, a LEARN THE KUIPER module.
// The wafer at rest (every place from KuiperLaw.place), then the same particles fly onto the UK grid and back.
// Reused from the owner's public page globalgrid2050 testcode/wafer-development-environment/202609180245-real-systems:
//   pilot.mjs networkTargets()  the rule that lays particles along edges by length and clusters them at stations
//                               on the golden angle (adapted: edge networks put every particle on edges).
//   app.mjs blendTo()           drawn = from + (target - from) * ease(u), cubic in-out ease, one target per particle.
//   app.mjs release()           every particle back to its own law place exactly.
//   pilot.mjs NETWORKS + the "Draw every substation / 400 kV / 132 kV / British Isles / Release" sentences.
// Data: grid-data.js (window.KGGridData), built from the same folder's *-network.json files, attribution kept.
(function () {
  'use strict';
  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || '';
  var C = { bg: '#000', cyan: '#00ffff', sky: '#66ccff', amber: '#ffb000', green: '#22ee77', white: '#ffffff' };
  var FONT = '"Segoe UI", Arial, sans-serif';
  var N = 20000;                      // particles shown
  var MOVE_MS = 2600;                 // app.mjs MOVE_MS is 2000; a little slower so the eye can follow
  var GA = 2.399963229728653;         // golden angle, as pilot.mjs networkTargets uses for station clusters
  var ORDER = ['substations', 'grid400', 'grid132', 'uk'];
  var SENT = {
    substations: 'DRAW EVERY SUBSTATION', grid400: 'DRAW THE 400 kV GRID', grid132: 'DRAW THE 132 kV NETWORK',
    uk: 'DRAW THE BRITISH ISLES', release: 'RELEASE: EVERY PARTICLE BACK TO ITS OWN PLACE'
  };

  var S = null; // module state while open

  function ensureData(cb) {
    if (window.KGGridData) return cb();
    var s = document.createElement('script');
    s.src = SCRIPT_SRC ? SCRIPT_SRC.replace(/grid\.js(\?.*)?$/, 'grid-data.js') : 'modules/grid-data.js';
    s.onload = function () { cb(); };
    s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }

  // ---- the key rule (stated in WHY) ----
  // particle i carries key K_i = floor((i + 0.5) * SPACE / N): N keys spread evenly over the whole issued wafer.
  // Node j of a network takes the key of particle j (file order); a particle's place at rest is KuiperLaw.place(K_i).
  function keyOf(i, SPACE) { return Math.floor((i + 0.5) * SPACE / N); }

  function decode(net) {
    if (net._st) return net;
    var n = net.n, st = new Float32Array(2 * n), xy = net.xy, i;
    for (i = 0; i < n; i++) { st[2 * i] = xy[2 * i] / 10000; st[2 * i + 1] = xy[2 * i + 1] / 10000; }
    var e = net.e, m = e.length / 2, E = new Int32Array(2 * m), a = 0;
    for (i = 0; i < m; i++) { a += e[2 * i]; E[2 * i] = a; E[2 * i + 1] = a + e[2 * i + 1]; }
    net._st = st; net._E = E; net._m = m;
    return net;
  }

  // pilot.mjs networkTargets(N, m), adapted. Writes world targets (scale Sc) and the node each particle belongs to.
  function networkTargets(net, Sc) {
    decode(net);
    var st = net._st, E = net._E, mE = net._m, n = net.n;
    var t = new Float32Array(2 * N), node = new Int32Array(N), j = 0, e, i;
    if (mE > 0) {
      var lens = new Float64Array(mE), L = 0;
      for (e = 0; e < mE; e++) { var a = E[2 * e], b = E[2 * e + 1]; lens[e] = Math.hypot(st[2 * b] - st[2 * a], st[2 * b + 1] - st[2 * a + 1]); L += lens[e]; }
      L = L || 1;
      // largest-remainder share so the counts add to exactly N (pilot.mjs rounds and lets the station clusters fill the rest)
      var share = new Int32Array(mE), rem = [], used = 0;
      for (e = 0; e < mE; e++) { var q = N * lens[e] / L; share[e] = Math.floor(q); used += share[e]; rem.push([q - share[e], e]); }
      rem.sort(function (p, r) { return r[0] - p[0]; });
      for (i = 0; used < N && i < rem.length; i++, used++) share[rem[i][1]]++;
      for (e = 0; e < mE && j < N; e++) {
        var a2 = E[2 * e], b2 = E[2 * e + 1], k = share[e];
        for (i = 0; i < k && j < N; i++, j++) {
          var u = (i + 0.5) / k;
          t[2 * j] = Sc * (st[2 * a2] + (st[2 * b2] - st[2 * a2]) * u);
          t[2 * j + 1] = Sc * (st[2 * a2 + 1] + (st[2 * b2 + 1] - st[2 * a2 + 1]) * u);
          node[j] = u < 0.5 ? a2 : b2;
        }
      }
    }
    for (var s = 0; j < N; s++, j++) {      // pilot.mjs: station q = s mod n, ring c, golden-angle cluster
      var q2 = s % n, c = Math.floor(s / n), th = c * GA, r = 0.004 * Sc * Math.sqrt(c);
      t[2 * j] = Sc * st[2 * q2] + r * Math.cos(th); t[2 * j + 1] = Sc * st[2 * q2 + 1] + r * Math.sin(th);
      node[j] = q2;
    }
    return { t: t, node: node };
  }

  // ---- sound: soft WebAudio after the first gesture ----
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  function audio() {
    if (!S || S.muted) return null;
    if (!S.ac) { try { S.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (S.ac.state === 'suspended') S.ac.resume();
    return S.ac;
  }
  function note(semi, when, dur, gain, type) {
    var ac = audio(); if (!ac) return;
    var t0 = ac.currentTime + (when || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.value = 220 * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain || 0.05, t0 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.6));
    o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + (dur || 0.6) + 0.05);
  }
  function flightMusic(up) {
    for (var i = 0; i < 10; i++) note(PENTA[up ? i : 9 - i] + 12, i * 0.22, 0.9, 0.035, 'triangle');
    [0, 7, 16].forEach(function (s, k) { note(s + (up ? 12 : 0), 2.5 + k * 0.03, 2.2, 0.03, 'sine'); });
  }

  // ---- geometry helpers ----
  function cam() { return { cx: 0, cy: 0, zoom: S.zoom }; }
  function toScr(x, y) { return [S.W / 2 + x * S.zoom, S.H / 2 - y * S.zoom]; }  // KuiperLaw.toScreen with cam (0,0): y UP
  function bearingOf(p) { var b = (90 - p.deg) % 360; return b < 0 ? b + 360 : b; } // clockwise from up on screen

  function el(tag, css, text, parent) {
    var d = document.createElement(tag); if (css) d.style.cssText = css; if (text != null) d.textContent = text;
    if (parent) parent.appendChild(d); return d;
  }

  function layout() {
    var host = S.host, dpr = Math.max(1, window.devicePixelRatio || 1);
    var W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight;
    S.W = W; S.H = H; S.dpr = dpr; S.phone = Math.min(W, H) < 600;
    S.cv.width = Math.round(W * dpr); S.cv.height = Math.round(H * dpr);
    S.cv.style.width = W + 'px'; S.cv.style.height = H + 'px';
    S.Rpx = Math.min(W, H) / 2 * (S.phone ? 0.94 : 0.88);                 // the wafer edge on screen, a true circle
    S.zoom = S.Rpx / S.Rw;
    var bh = S.phone ? 56 : 72, side = (W - 2 * S.Rpx) / 2 - 24;
    var landPhone = S.phone && W > H;
    S.att.style.maxWidth = (landPhone ? Math.max(200, side) : W - 110) + 'px';
    S.att.style.bottom = landPhone ? 'calc(80px + env(safe-area-inset-bottom))' : 'calc(' + (bh + 16) + 'px + env(safe-area-inset-bottom))';
    S.card.style.maxWidth = (landPhone ? Math.max(220, side) : Math.min(560, W - 32)) + 'px';
    S.selRO.style.display = S.phone ? 'none' : 'block';
    S.btns.forEach(function (b) { b.style.height = bh + 'px'; b.style.minWidth = bh + 'px'; b.style.padding = S.phone ? '0 9px' : '0 20px'; });
    S.xbtn.style.width = S.xbtn.style.height = '72px';
    makeStars();
    S.dirty = true;
  }

  function makeStars() {
    var n = Math.round(S.W * S.H / 2600), a = [], seed = 12345;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    for (var i = 0; i < n; i++) a.push([rnd() * S.W, rnd() * S.H, rnd()]);
    S.stars = a;
  }

  // ---- drawing ----
  function render() {
    var g = S.ctx, dpr = S.dpr, W = S.W, H = S.H, cx = W / 2, cy = H / 2, R = S.Rpx, i;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    // stars: far dimmer than the dots
    for (i = 0; i < S.stars.length; i++) { var s = S.stars[i]; g.fillStyle = 'rgba(160,190,255,' + (0.08 + 0.18 * s[2]).toFixed(3) + ')'; g.fillRect(s[0], s[1], 1, 1); }
    // instruments: range rings, ticks, compass rose
    g.lineWidth = 1; g.strokeStyle = 'rgba(0,255,255,0.16)';
    for (i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, R * i / 4, 0, 2 * Math.PI); g.stroke(); }
    for (i = 0; i < 360; i += 5) {
      var a = (i - 90) * Math.PI / 180, l = i % 30 === 0 ? 14 : (i % 10 === 0 ? 8 : 4);
      g.strokeStyle = i % 30 === 0 ? 'rgba(0,255,255,0.45)' : 'rgba(0,255,255,0.22)';
      g.beginPath(); g.moveTo(cx + Math.cos(a) * (R + 3), cy + Math.sin(a) * (R + 3)); g.lineTo(cx + Math.cos(a) * (R + 3 + l), cy + Math.sin(a) * (R + 3 + l)); g.stroke();
    }
    g.font = '24px ' + FONT; g.fillStyle = 'rgba(102,204,255,0.55)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (!S.phone) {
      [[0, '000'], [90, '090'], [270, '270']].forEach(function (p) {
        var a2 = (p[0] - 90) * Math.PI / 180, rr = R + 36; g.fillText(p[1], cx + Math.cos(a2) * rr, cy + Math.sin(a2) * rr);
      });
    }
    if (S.phone && W > H) compass(g, W - 44, 130, 20); else compass(g, S.phone ? 40 : 58, H - (S.phone ? 56 : 72) - (S.phone ? 50 : 70), S.phone ? 20 : 28);

    // the dots: brightest thing on screen
    var P = S.pos, z = S.zoom, sz = S.phone ? 1.7 : 2;
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(150,245,255,0.95)';
    g.beginPath();
    for (i = 0; i < N; i++) { var x = cx + P[2 * i] * z, y = cy - P[2 * i + 1] * z; g.rect(x - sz / 2, y - sz / 2, sz, sz); }
    g.fill();
    g.globalCompositeOperation = 'source-over';

    // the selection: amber, with an engineering annotation from the wafer centre to the key's home place
    if (S.sel) drawSel(g, cx, cy);
  }

  function compass(g, x, y, r) {
    g.save(); g.strokeStyle = 'rgba(0,255,255,0.45)'; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.stroke();
    g.beginPath(); g.moveTo(x, y - r - 6); g.lineTo(x + 6, y); g.lineTo(x, y + r + 6); g.lineTo(x - 6, y); g.closePath(); g.stroke();
    g.fillStyle = 'rgba(0,255,255,0.7)'; g.beginPath(); g.moveTo(x, y - r - 6); g.lineTo(x + 6, y); g.lineTo(x - 6, y); g.closePath(); g.fill();
    g.font = 'bold 24px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText('N', x, y - r - 8);
    g.restore();
  }

  function drawSel(g, cx, cy) {
    var sel = S.sel, h = toScr(sel.home.x, sel.home.y), p = toScr(S.pos[2 * sel.i], S.pos[2 * sel.i + 1]);
    g.save();
    g.strokeStyle = 'rgba(255,176,0,0.55)'; g.lineWidth = 1; g.setLineDash([6, 5]);
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(h[0], h[1]); g.stroke();          // range line on the wafer
    var a0 = -Math.PI / 2, a1 = -sel.home.theta, rr = Math.min(60, Math.hypot(h[0] - cx, h[1] - cy) * 0.5);
    // bearing arc, clockwise from up to the home place
    var b = bearingOf(sel.home) * Math.PI / 180;
    g.beginPath(); g.arc(cx, cy, rr, a0, a0 + b, false); g.stroke();
    if (Math.hypot(p[0] - h[0], p[1] - h[1]) > 4) { g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(p[0], p[1]); g.stroke(); }
    g.setLineDash([]);
    g.strokeStyle = C.amber; g.lineWidth = 2;
    g.beginPath(); g.arc(p[0], p[1], 11, 0, 2 * Math.PI); g.stroke();
    g.beginPath(); g.arc(h[0], h[1], 7, 0, 2 * Math.PI); g.stroke();
    g.fillStyle = C.amber; g.font = 'bold 24px ' + FONT; g.textBaseline = 'middle';
    g.textAlign = h[0] > cx ? 'left' : 'right';
    g.fillText('K ' + sel.key.toLocaleString('en-GB'), h[0] + (h[0] > cx ? 14 : -14), h[1]);
    g.restore();
  }

  // ---- motion: app.mjs blendTo, per particle, with a gentle wave from the centre outward ----
  function blendTo(target, up, done) {
    var from = new Float32Array(S.pos), token = ++S.token, t0 = performance.now(), P = S.pos, i;
    var delay = S.delay;
    S.moving = true; fadeControls(true); flightMusic(up);
    (function step(t) {
      if (!S || token !== S.token) return;
      var u = Math.min(1, (t - t0) / MOVE_MS);
      if (u >= 1) P.set(target);
      else for (i = 0; i < N; i++) {
        var v = (u - delay[i]) / 0.7; v = v < 0 ? 0 : (v > 1 ? 1 : v);
        var e = v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
        P[2 * i] = from[2 * i] + (target[2 * i] - from[2 * i]) * e;
        P[2 * i + 1] = from[2 * i + 1] + (target[2 * i + 1] - from[2 * i + 1]) * e;
      }
      render();
      if (u < 1) S.raf = requestAnimationFrame(step);
      else { S.moving = false; fadeControls(false); if (done) done(); }
    })(t0);
  }

  function draw(name) {
    closePop();
    var net = window.KGGridData && window.KGGridData[name];
    if (!net) { caption('the network data did not load'); return; }
    if (!S.targets[name]) S.targets[name] = networkTargets(net, 0.85 * S.Rw);
    S.mode = name; S.sel = null; hideCard(); S.selRO.textContent = '';
    var lab = net.label.charAt(0).toUpperCase() + net.label.slice(1);
    caption(S.phone ? lab : SENT[name].charAt(0) + SENT[name].slice(1).toLowerCase().replace('kv', 'kV'));
    attrib(/OpenStreetMap/.test(net.attribution) ? '(c) OpenStreetMap contributors, ODbL' : 'Coastline: Natural Earth, public domain');
    readout();
    blendTo(S.targets[name].t, true, function () { caption(lab); });
  }
  function release() {
    closePop(); S.mode = 'wafer'; S.sel = null; hideCard(); attrib(''); S.selRO.textContent = '';
    caption('Release: every particle back to its own place'); readout();
    blendTo(S.home, false, function () { S.pos.set(S.home); render(); caption(S.phone ? 'The wafer' : 'The wafer: every place from KuiperLaw.place'); });
  }

  // ---- UI ----
  function fadeControls(on) { S.bar.style.opacity = on ? '0.15' : '1'; }
  function caption(t) {
    S.cap.textContent = t; S.cap.style.transition = 'none'; S.cap.style.opacity = '1';
    clearTimeout(S.capT); S.capT = setTimeout(function () { if (S) { S.cap.style.transition = 'opacity 1.6s'; S.cap.style.opacity = '0.35'; } }, 4000);
  }
  function attrib(t) { S.att.textContent = t; S.att.style.display = t ? 'block' : 'none'; }
  function readout() {
    var lab = S.mode === 'wafer' ? 'WAFER' : ({ substations: 'SUBSTATIONS', grid400: '400 kV', grid132: '132 kV', uk: 'BRITISH ISLES' })[S.mode];
    var net = S.mode !== 'wafer' && window.KGGridData && window.KGGridData[S.mode];
    var cnt = net ? '  ' + net.n.toLocaleString('en-GB') + (net.e.length && !S.phone ? ' NODES' : '') : '';
    S.ro.textContent = (S.phone ? '' : N.toLocaleString('en-GB') + ' PARTICLES  ') + lab + cnt;
  }

  function btn(label, parent, fn, title) {
    var b = el('button', 'pointer-events:auto;font:bold 24px ' + FONT + ';color:' + C.cyan + ';background:transparent;border:1px solid rgba(0,255,255,0.5);border-radius:8px;opacity:0.62;cursor:pointer;white-space:nowrap;letter-spacing:0.5px;transition:opacity .2s,border-color .2s', label, parent);
    b.type = 'button'; if (title) b.setAttribute('aria-label', title);
    b.addEventListener('pointerenter', function () { b.style.opacity = '1'; });
    b.addEventListener('pointerleave', function () { b.style.opacity = '0.62'; });
    b.addEventListener('click', function (e) { e.stopPropagation(); audio(); fn(); });
    return b;
  }

  function popup(build) {
    closePop(); hideCard(); if (S.sel) { S.sel = null; render(); }
    var p = el('div', 'position:absolute;left:50%;transform:translateX(-50%);bottom:calc(' + (S.phone ? 72 : 96) + 'px + env(safe-area-inset-bottom));width:min(720px,calc(100% - 32px));max-height:calc(100% - ' + (S.phone ? 150 : 200) + 'px);overflow:auto;background:rgba(0,0,0,0.94);border:1px solid rgba(0,255,255,0.45);border-radius:12px;padding:12px;box-sizing:border-box;pointer-events:auto;color:#fff;font:24px/1.35 ' + FONT, null, S.ui);
    p.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    build(p); S.pop = p; return p;
  }
  function closePop() { if (S && S.pop) { S.pop.remove(); S.pop = null; } }

  function drawMenu() {
    popup(function (p) {
      ORDER.concat(['release']).forEach(function (k, i) {
        var b = btn(SENT[k], p, function () { k === 'release' ? release() : draw(k); });
        b.style.cssText += ';display:block;width:100%;text-align:left;margin:' + (i ? 8 : 0) + 'px 0 0;height:auto;min-height:' + (S.phone ? 56 : 64) + 'px;padding:8px 14px;font-size:24px;white-space:normal;line-height:1.1';
        if (k === 'release') b.style.color = C.green, b.style.borderColor = 'rgba(34,238,119,0.5)';
        b.dataset.cmd = k;
      });
    });
  }

  function whyMenu() {
    var D = window.KGGridData || {}, L = window.KuiperLaw.constants;
    popup(function (p) {
      function h(t) { el('div', 'font:bold 26px ' + FONT + ';color:' + C.cyan + ';margin:14px 0 6px', t, p); }
      function para(t, col) { el('div', 'margin:0 0 8px;color:' + (col || '#fff'), t, p); }
      h('WHY: how a key is given to each node');
      para('Particle i (i = 0 to ' + (N - 1).toLocaleString('en-GB') + ') carries key K = floor((i + 0.5) x SPACE / N), with SPACE = ' + L.SPACE.toLocaleString('en-GB') + ' (the whole issued wafer) and N = ' + N.toLocaleString('en-GB') + '. So the keys are spread evenly over the wafer.');
      para('Node j of a network, in the order of the public file, takes the key of particle j. A substation\'s KEY is that K. On the lines, particles are shared out along each edge in proportion to its length (pilot.mjs networkTargets), in file order, so the rule is fixed and repeatable.');
      h('Why the same key always comes back to the same place');
      para('The place at rest is a pure function of the key, the real law (KuiperLaw.place, kuiper-belt index.html:250): m = (K x 2654435769) mod 2^32, theta = 2 pi m / 2^32, r = sqrt(K + 0.5). Nothing is stored and nothing is random, so RELEASE returns every particle to exactly where it began, on any device.');
      para('Bearing is measured clockwise from the top of the wafer: bearing = 90 - theta in degrees. Range is r, in wafer units, out of ' + Math.round(S.Rw).toLocaleString('en-GB') + ' at the rim.', C.sky);
      h('The motion');
      para('Every frame, drawn = from + (target - from) x ease(u), cubic in and out, over ' + (MOVE_MS / 1000) + ' s (app.mjs blendTo), started a little later the further a particle sits from the centre.');
      h('Source and attribution of the network data');
      ORDER.forEach(function (k) {
        var n = D[k]; if (!n) return;
        para(n.label.toUpperCase() + ': ' + n.n.toLocaleString('en-GB') + ' nodes, ' + (n.e.length / 2).toLocaleString('en-GB') + ' edges. Source: ' + n.source + '. ' + n.attribution + '. Law: ' + n.law + '.', '#cfe');
      });
      para('Copied from the owner\'s public folder globalgrid2050 testcode/wafer-development-environment/202609180245-real-systems (*-network.json). Coordinates kept to 4 decimals as published; circuit names on line vertices dropped. It charts published data; it is not a design.', C.sky);
    });
  }

  function showCard(lines) {
    S.card.innerHTML = '';
    lines.forEach(function (l, i) { el('div', 'color:' + (i === 0 ? C.amber : (l.c || '#fff')) + ';' + (i === 0 ? 'font-weight:bold;' : ''), l.t || l, S.card); });
    S.card.style.display = 'block';
  }
  function hideCard() { if (S) S.card.style.display = 'none'; }

  function pick(sx, sy) {
    var cx = S.W / 2, cy = S.H / 2, z = S.zoom, best = -1, bd = 900, P = S.pos;   // within 30 px
    for (var i = 0; i < N; i++) { var dx = cx + P[2 * i] * z - sx, dy = cy - P[2 * i + 1] * z - sy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
    if (best < 0) { S.sel = null; hideCard(); render(); return; }
    var D = window.KGGridData, sub = D && D.substations, lines = [], i2 = best, key, home;
    if (S.mode === 'substations' || S.mode === 'wafer') {
      var nt = S.targets.substations || (S.targets.substations = networkTargets(sub, 0.85 * S.Rw));
      var q = nt.node[best], nm = sub.names[q];     // the substation this particle belongs to
      if (S.mode === 'wafer') {
        key = keyOf(best, S.SPACE); home = window.KuiperLaw.place(key);
        lines.push({ t: 'KEY ' + key.toLocaleString('en-GB') });
        lines.push({ t: 'flies to: ' + (nm || 'substation ' + q + ' (no name in the public file)'), c: C.sky });
      } else {
        key = keyOf(q, S.SPACE); home = window.KuiperLaw.place(key); i2 = q;
        lines.push({ t: nm ? nm : 'Substation ' + q + ' (no name in the public file)' });
        lines.push({ t: 'KEY ' + key.toLocaleString('en-GB') });
      }
    } else {
      var t = S.targets[S.mode], node = t.node[best];
      key = keyOf(best, S.SPACE); home = window.KuiperLaw.place(key);
      lines.push({ t: (S.mode === 'uk' ? 'Coastline' : D[S.mode].label.replace('the ', '')) + ' node ' + node });
      lines.push({ t: 'KEY ' + key.toLocaleString('en-GB') });
    }
    lines.push({ t: 'BEARING ' + bearingOf(home).toFixed(1) + ' deg   RANGE ' + Math.round(home.r).toLocaleString('en-GB'), c: C.sky });
    S.sel = { i: i2 < N ? i2 : best, key: key, home: home };
    S.selRO.textContent = 'KEY ' + key.toLocaleString('en-GB') + '  ' + bearingOf(home).toFixed(1) + ' deg  r ' + Math.round(home.r).toLocaleString('en-GB');
    showCard(lines); render();
    note(PENTA[key % 7] + 12, 0, 0.5, 0.05, 'sine');
  }

  function open(host) {
    if (S) close();
    S = { host: host, token: 0, targets: {}, mode: 'wafer', muted: false, listeners: [] };
    host.style.position = host.style.position || 'fixed';
    host.style.overflow = 'hidden'; host.style.background = '#000';
    var cv = el('canvas', 'position:absolute;left:0;top:0;touch-action:none;display:block', null, host);
    cv.setAttribute('aria-label', 'Kuiper particles drawing the UK grid');
    S.cv = cv; S.ctx = cv.getContext('2d');
    var ui = el('div', 'position:absolute;inset:0;pointer-events:none;font:24px ' + FONT + ';color:#fff', null, host); S.ui = ui;
    var pad = 'env(safe-area-inset-top)';
    S.cap = el('div', 'position:absolute;left:16px;right:96px;top:calc(18px + ' + pad + ');font:bold 26px ' + FONT + ';color:' + C.white + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis', '', ui);
    S.ro = el('div', 'position:absolute;left:16px;right:96px;overflow:hidden;text-overflow:ellipsis;top:calc(56px + ' + pad + ');font:24px ' + FONT + ';color:rgba(0,255,255,0.7);white-space:nowrap', '', ui);
    S.selRO = el('div', 'position:absolute;left:16px;top:calc(88px + ' + pad + ');font:24px ' + FONT + ';color:rgba(255,176,0,0.85);white-space:nowrap', '', ui);
    S.att = el('div', 'position:absolute;right:16px;bottom:calc(' + 84 + 'px + env(safe-area-inset-bottom));font:24px ' + FONT + ';color:rgba(102,204,255,0.75);text-align:right;max-width:calc(100% - 32px);display:none', '', ui);
    S.card = el('div', 'position:absolute;left:16px;top:calc(124px + ' + pad + ');max-width:min(560px,calc(100% - 32px));background:rgba(0,0,0,0.78);border:1px solid rgba(255,176,0,0.55);border-radius:10px;padding:8px 12px;font:24px/1.3 ' + FONT + ';display:none;pointer-events:auto', '', ui);
    S.card.addEventListener('pointerdown', function (e) { e.stopPropagation(); S.sel = null; hideCard(); render(); });
    S.xbtn = btn('X', ui, function () { M.close(); }, 'close');
    S.xbtn.style.cssText += ';position:absolute;right:calc(8px + env(safe-area-inset-right));top:calc(8px + ' + pad + ');font-size:34px;padding:0;opacity:0.7';
    var bar = el('div', 'position:absolute;left:0;right:0;bottom:calc(8px + env(safe-area-inset-bottom));display:flex;justify-content:center;gap:6px;transition:opacity .4s;pointer-events:none', null, ui);
    S.bar = bar;
    S.btns = [
      btn('DRAW', bar, drawMenu, 'draw a network'),
      btn('RELEASE', bar, release, 'release every particle'),
      btn('WHY', bar, whyMenu, 'why: keys, law and data source'),
      btn('♪', bar, function () { S.muted = !S.muted; S.btns[3].textContent = S.muted ? '♪ off' : '♪'; }, 'mute')
    ];
    S.btns[0].dataset.cmd = 'draw'; S.btns[1].dataset.cmd = 'release'; S.btns[2].dataset.cmd = 'why'; S.btns[3].dataset.cmd = 'mute';
    S.btns.push(S.xbtn);

    var L = window.KuiperLaw; S.SPACE = L.constants.SPACE; S.Rw = Math.sqrt(S.SPACE + 0.5);
    S.home = new Float32Array(2 * N); S.delay = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var p = L.place(keyOf(i, S.SPACE)); S.home[2 * i] = p.x; S.home[2 * i + 1] = p.y;
      S.delay[i] = 0.3 * p.r / S.Rw;
    }
    S.pos = new Float32Array(S.home);

    // pointer: tap picks, nothing else steals input
    var down = null;
    on(cv, 'pointerdown', function (e) { down = [e.clientX, e.clientY]; closePop(); audio(); });
    on(cv, 'pointerup', function (e) {
      if (!down) return; var r = cv.getBoundingClientRect();
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 12) pick(e.clientX - r.left, e.clientY - r.top);
      down = null;
    });
    on(window, 'keydown', function (e) {
      var tg = e.target && e.target.tagName;
      if (e.key === 'Escape') {
        if (tg === 'INPUT' || tg === 'TEXTAREA') { e.target.blur(); return; }
        if (S.pop) { closePop(); return; }
        M.close(); return;
      }
      if (tg === 'INPUT' || tg === 'TEXTAREA') return;
      var k = e.key.toLowerCase();
      if (k >= '1' && k <= '4') { audio(); draw(ORDER[+k - 1]); }
      else if (k === 'r' || k === '0') { audio(); release(); }
      else if (k === 'w') whyMenu();
    });
    on(window, 'resize', function () { layout(); render(); });
    on(window, 'orientationchange', function () { setTimeout(function () { if (S) { layout(); render(); } }, 200); });

    layout(); readout(); render();
    caption(S.phone ? 'DRAW THE GRID' : 'Draw the UK grid with Kuiper particles');
    ensureData(function () { if (S && !window.KGGridData) caption('grid-data.js did not load'); });
    window.__grid = { draw: draw, release: release, state: function () { return S && { mode: S.mode, moving: !!S.moving, sel: S.sel && { key: S.sel.key, bearing: bearingOf(S.sel.home), r: S.sel.home.r }, card: S.card.textContent, att: S.att.textContent, W: S.W, H: S.H, Rpx: S.Rpx }; },
      screenOf: function (i) { return toScr(S.pos[2 * i], S.pos[2 * i + 1]); }, keyOf: function (i) { return keyOf(i, S.SPACE); },
      homeErr: function () { var m = 0; for (var i = 0; i < N; i++) { var p = window.KuiperLaw.place(keyOf(i, S.SPACE)); m = Math.max(m, Math.abs(S.pos[2 * i] - Math.fround(p.x)), Math.abs(S.pos[2 * i + 1] - Math.fround(p.y))); } return m; } };
  }

  function on(t, ev, fn) { t.addEventListener(ev, fn); S.listeners.push([t, ev, fn]); }

  function close() {
    if (!S) return;
    S.token++; cancelAnimationFrame(S.raf); clearTimeout(S.capT);
    S.listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2]); });
    if (S.ac) { try { S.ac.close(); } catch (e) {} }
    var h = S.host; S = null;
    while (h.firstChild) h.removeChild(h.firstChild);
    if (window.__grid) window.__grid = null;
  }

  // the registered object; X and Escape call M.close so a sheet that wraps close() sees it
  var M = {
    id: 'grid', label: 'DRAW THE GRID', sentence: 'Draw the UK grid with Kuiper particles',
    open: open, close: close
  };
  (window.KGModules = window.KGModules || []).push(M);
})();
