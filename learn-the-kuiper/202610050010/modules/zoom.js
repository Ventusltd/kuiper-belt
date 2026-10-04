// LEARN THE KUIPER: ZOOM module (Opus 1). Deep-zoom viewer of the real Kuiper law.
// Plug-in shape per MODULE-CONTRACT.md. Every position comes from KuiperLaw.place; the key lists come from
// KuiperScale.visibleKeys (zoomed in, exact) and KuiperScale.sample (zoomed out). No build step, works from file://.
(function () {
  'use strict';
  var EXACT = 9007199254740992; // 2^53
  var C = { bg: '#000', cyan: '#00ffff', blue: '#66ccff', amber: '#ffb000', green: '#22ee77', white: '#fff' };
  var FONT = '"Segoe UI", Arial, sans-serif';
  var MAXDOTS = 5000, SAMPLEDOTS = 4000;

  var S = null; // state of the open module

  function fmt(n) {
    if (!isFinite(n)) return String(n);
    if (Math.abs(n) >= 1e21) return n.toExponential(3);
    return Math.round(n).toLocaleString('en-GB');
  }
  function fmtZoom(z) {
    if (z >= 10) return fmt(z);
    if (z >= 1) return (Math.round(z * 10) / 10).toLocaleString('en-GB');
    return (Math.round(z * 100) / 100).toString();
  }
  function fmtDec(x, d) { var t = x.toFixed(d).split('.'); return fmt(+t[0]) + (t[1] ? '.' + t[1] : ''); }
  // "1,000,000", "1e15", "2^53", "10 ^ 6" all read as numbers
  function parseNum(s) {
    s = String(s || '').replace(/[,\s_]/g, '').toLowerCase();
    if (!s) return NaN;
    var m = s.match(/^(\d+(?:\.\d+)?)(?:\^|\*\*)(\d+(?:\.\d+)?)$/);
    if (m) return Math.pow(+m[1], +m[2]);
    return Number(s);
  }

  function el(tag, css, text, parent) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  // ------------------------------------------------------------------ sound (WebAudio after the first gesture)
  function audioInit() {
    if (S.ac || S.muted) return;
    try { var AC = window.AudioContext || window.webkitAudioContext; if (AC) S.ac = new AC(); } catch (e) { S.ac = null; }
  }
  function note(freq, when, dur, vol) {
    if (!S || !S.ac || S.muted) return;
    try {
      var ac = S.ac, t = ac.currentTime + (when || 0);
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.4));
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (dur || 0.4) + 0.05);
    } catch (e) { /* sound is optional */ }
  }
  var PENTA = [0, 2, 4, 7, 9];
  function penta(i, base) { var o = Math.floor(i / 5), s = PENTA[((i % 5) + 5) % 5]; return (base || 262) * Math.pow(2, o + s / 12); }
  function flightMusic(sec) {
    var n = Math.max(6, Math.round(sec * 5));
    for (var i = 0; i < n; i++) note(penta(i % 10 + (i >= 10 ? 2 : 0), 330), i * sec / n, 0.5, 0.045);
    note(penta(10, 330), sec, 1.2, 0.07);
  }

  // ------------------------------------------------------------------ camera and law
  function params() { return S.P; }
  function setCount(n) {
    n = Math.floor(n);
    if (!(n >= 1)) n = 1;
    if (n > EXACT) n = EXACT;
    S.N = n;
    S.P = KuiperScale.prepare(Object.assign({}, KuiperScale.REAL, { count: n }));
    S.facts = KuiperScale.scaleFacts(n, S.P);
    S.rim = Math.sqrt(n - 1 + 0.5);
    S.countBox.value = fmt(n);
    S.dirty = true;
  }
  // full-screen canvas: the circle is centred and fills 80% of the shorter side; spare space stays black
  function homeZoom() { return Math.min(S.W, S.H) / 2 * 0.80 / Math.max(S.rim, 1); }
  function homeCy() { return 0; }
  function maxZoom() { return 160; }
  function minZoom() { return homeZoom() * 0.25; }
  function clampZ(z) { return Math.max(minZoom(), Math.min(maxZoom(), z)); }
  function toScreen(x, y) { return [S.W / 2 + (x - S.cam.cx) * S.cam.z, S.H / 2 - (y - S.cam.cy) * S.cam.z]; }
  function toWorld(sx, sy) { return [S.cam.cx + (sx - S.W / 2) / S.cam.z, S.cam.cy - (sy - S.H / 2) / S.cam.z]; }

  function goHome(animated) {
    var z = homeZoom();
    var cy = 0;
    if (animated) fly(0, cy, z, 1.2, false); else { S.anim = null; S.cam.cx = 0; S.cam.cy = cy; S.cam.z = z; S.dirty = true; }
  }

  // smooth wheel zoom about an anchor point on screen
  function zoomAt(sx, sy, factor) {
    var w = toWorld(sx, sy);
    var target = clampZ((S.zoomAnim ? S.zoomAnim.tz : S.cam.z) * factor);
    S.anim = null;
    S.zoomAnim = { tz: target, sx: sx, sy: sy, wx: w[0], wy: w[1] };
    S.dirty = true;
  }

  // a fly-to: out, across, in (log-zoom with a bump), eased, with music
  function fly(cx, cy, z, sec, music) {
    var c0 = { cx: S.cam.cx, cy: S.cam.cy, z: S.cam.z };
    var dist = Math.hypot(cx - c0.cx, cy - c0.cy);
    var viewSpan = Math.min(S.W, S.H) / Math.min(c0.z, z);
    var bump = Math.max(0, Math.log(Math.max(1, dist / viewSpan)) * 0.9);
    S.zoomAnim = null;
    S.anim = { t0: performance.now(), dur: sec * 1000, c0: c0, c1: { cx: cx, cy: cy, z: z }, bump: bump };
    if (music) flightMusic(sec);
    S.dirty = true;
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function stepAnim(now) {
    var moving = false;
    if (S.anim) {
      var a = S.anim, t = Math.min(1, (now - a.t0) / a.dur), e = ease(t);
      var l0 = Math.log(a.c0.z), l1 = Math.log(a.c1.z);
      var lz = l0 + (l1 - l0) * e - a.bump * Math.sin(Math.PI * t);
      // move in a way that is even on screen: interpolate position in the zoomed-out frame
      S.cam.cx = a.c0.cx + (a.c1.cx - a.c0.cx) * e;
      S.cam.cy = a.c0.cy + (a.c1.cy - a.c0.cy) * e;
      S.cam.z = Math.exp(lz);
      if (t >= 1) { S.cam.cx = a.c1.cx; S.cam.cy = a.c1.cy; S.cam.z = a.c1.z; S.anim = null; shareHash(); }
      moving = true;
    } else if (S.zoomAnim) {
      var za = S.zoomAnim, r = za.tz / S.cam.z;
      if (Math.abs(Math.log(r)) < 0.002) { S.cam.z = za.tz; S.zoomAnim = null; }
      else S.cam.z *= Math.pow(r, 0.28);
      S.cam.cx = za.wx - (za.sx - S.W / 2) / S.cam.z;
      S.cam.cy = za.wy + (za.sy - S.H / 2) / S.cam.z;
      moving = true;
    }
    return moving;
  }

  // ------------------------------------------------------------------ which keys to draw
  function viewObj() { return { cx: S.cam.cx, cy: S.cam.cy, zoom: S.cam.z, w: S.W, h: S.H }; }
  // true number of keys whose place is in the window: density is exactly one key per pi square units inside the rim
  function keysOnScreen() {
    var hw = S.W / 2 / S.cam.z, hh = S.H / 2 / S.cam.z, n = 48, inside = 0, R2 = S.rim * S.rim;
    var x0 = S.cam.cx - hw, y0 = S.cam.cy - hh;
    if (Math.abs(S.cam.cx) + hw < S.rim / Math.SQRT2 && Math.abs(S.cam.cy) + hh < S.rim / Math.SQRT2) inside = n * n;
    else for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var x = x0 + (i + 0.5) / n * 2 * hw, y = y0 + (j + 0.5) / n * 2 * hh;
      if (x * x + y * y <= R2) inside++;
    }
    return Math.min(S.N, inside / (n * n) * (4 * hw * hh) / Math.PI);
  }
  function computeKeys() {
    var est = keysOnScreen();
    S.est = est;
    var keys, mode;
    if (est <= MAXDOTS) {
      keys = KuiperScale.visibleKeys(S.P, viewObj(), MAXDOTS);
      mode = 'visibleKeys';
      S.method = keys.info ? keys.info.method : 'scan';
      S.exact = !(keys.info && keys.info.exact === false);
    } else {
      // whole circle (or most of it) on screen: the plain equal-area sample; part of it: add the window's own keys
      keys = est > S.N * 0.5 ? KuiperScale.sample(S.P, SAMPLEDOTS) : KuiperScale.sample(S.P, SAMPLEDOTS, viewObj());
      mode = 'sample';
      S.method = 'sample';
      S.exact = !!keys.exact;
    }
    S.mode = mode;
    S.keys = keys;
  }

  // ------------------------------------------------------------------ drawing
  function dim(ctx, ax, ay, bx, by, label, col) {
    // engineering dimension: line with arrow ticks and a label box
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    var ang = Math.atan2(by - ay, bx - ax);
    [[ax, ay, ang], [bx, by, ang + Math.PI]].forEach(function (p) {
      ctx.beginPath(); ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] + 14 * Math.cos(p[2] + 0.35), p[1] + 14 * Math.sin(p[2] + 0.35));
      ctx.lineTo(p[0] + 14 * Math.cos(p[2] - 0.35), p[1] + 14 * Math.sin(p[2] - 0.35));
      ctx.closePath(); ctx.fill();
    });
    ctx.font = 'bold 26px ' + FONT;
    var mx = (ax + bx) / 2, my = (ay + by) / 2, w = ctx.measureText(label).width + 16;
    ctx.fillStyle = '#000'; ctx.fillRect(mx - w / 2, my - 18, w, 36);
    ctx.strokeRect(mx - w / 2, my - 18, w, 36);
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, mx, my + 1);
    ctx.restore();
  }

  function draw() {
    var ctx = S.ctx, W = S.W, H = S.H, z = S.cam.z;
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    computeKeys();

    // the rim and the centre (engineering drawing)
    var o = toScreen(0, 0), rr = S.rim * z;
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.setLineDash([12, 8]);
    if (rr < 4e6) { ctx.beginPath(); ctx.arc(o[0], o[1], rr, 0, Math.PI * 2); ctx.stroke(); }
    ctx.setLineDash([]);
    drawInstruments(ctx, o, rr);
    if (o[0] > -40 && o[0] < W + 40 && o[1] > -40 && o[1] < H + 40) {
      ctx.strokeStyle = C.green; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(o[0] - 22, o[1]); ctx.lineTo(o[0] + 22, o[1]); ctx.moveTo(o[0], o[1] - 22); ctx.lineTo(o[0], o[1] + 22); ctx.stroke();
    }

    // the dots, each placed by KuiperLaw.place
    var rDot = Math.max(1.6, Math.min(26, 0.18 * z));
    if (S.mode === 'sample') rDot = Math.max(1.6, Math.min(3, rDot));
    var drawn = [], keys = S.keys, labelKeys = z * 1.77 > 150 && keys.length < 40;
    for (var i = 0; i < keys.length; i++) {
      var q = KuiperLaw.place(keys[i]);
      var sx = W / 2 + (q.x - S.cam.cx) * z, sy = H / 2 - (q.y - S.cam.cy) * z;
      if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
      drawn.push({ k: keys[i], sx: sx, sy: sy, x: q.x, y: q.y });
    }
    S.drawn = drawn;
    // stars: a soft cyan halo, then a bright core (white when big enough to see it)
    if (drawn.length < 1500) {
      var hr = rDot * 2.6;
      drawn.forEach(function (d) {
        var g = ctx.createRadialGradient(d.sx, d.sy, rDot * 0.5, d.sx, d.sy, hr);
        g.addColorStop(0, 'rgba(0,255,255,0.35)'); g.addColorStop(1, 'rgba(0,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.sx, d.sy, hr, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.fillStyle = C.cyan; ctx.beginPath();
    drawn.forEach(function (d) { ctx.moveTo(d.sx + rDot, d.sy); ctx.arc(d.sx, d.sy, rDot, 0, Math.PI * 2); });
    ctx.fill();
    if (rDot >= 5) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath();
      drawn.forEach(function (d) { ctx.moveTo(d.sx + rDot * 0.45, d.sy); ctx.arc(d.sx, d.sy, rDot * 0.45, 0, Math.PI * 2); });
      ctx.fill();
    }
    drawBoundary(ctx);
    if (labelKeys) {
      ctx.font = 'bold 24px ' + FONT; ctx.fillStyle = 'rgba(102,204,255,0.7)'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (var d = 0; d < drawn.length; d++) ctx.fillText(fmt(drawn[d].k), drawn[d].sx, drawn[d].sy + rDot + 6);
    }

    // spacing dimension: the dot nearest the screen centre and its nearest drawn neighbour
    S.dimShown = null;
    if (S.mode === 'visibleKeys' && z * 1.77 > 70 && drawn.length > 1) {
      var cxs = W / 2, cys = (S.topH + H - S.botH) / 2, best = null, bd = Infinity;
      drawn.forEach(function (p) { var dd = Math.hypot(p.sx - cxs, p.sy - cys); if (dd < bd) { bd = dd; best = p; } });
      var nb = null, nd = Infinity;
      drawn.forEach(function (p) { if (p === best) return; var dd = Math.hypot(p.x - best.x, p.y - best.y); if (dd < nd) { nd = dd; nb = p; } });
      if (nb && !(S.sel && (S.sel.key === best.k || S.sel.key === nb.k))) {
        dim(ctx, best.sx, best.sy, nb.sx, nb.sy, nd.toFixed(2), C.amber);
        S.dimShown = { a: best.k, b: nb.k, d: nd };
      }
    }

    // the chosen key: ring, leader line and card
    drawSelection(ctx);

    S.zoomBox.textContent = 'ZOOM x' + fmtZoom(z / homeZoom());
    S.countRead.textContent = S.phone ? 'KEYS ' + fmt(S.N) + ' · VISITED ' + fmt(S.visited.size) : 'KEYS ' + fmt(S.N) + '   PLACES VISITED ' + fmt(S.visited.size);
    var shown = S.mode === 'visibleKeys' ? drawn.length : S.est;
    var many = (S.mode === 'visibleKeys' ? '' : (S.phone ? '≈ ' : 'ABOUT ')) + fmt(shown) + (shown === 1 ? ' KEY' : ' KEYS') + (S.phone ? ' IN VIEW' : ' ON SCREEN');
    var each = S.mode === 'sample' && S.est > drawn.length * 1.5 ? ', A DOT FOR EVERY ' + fmt(S.est / Math.max(1, drawn.length)) : '';
    S.captions = [many, 'SPACING ABOUT 1.77'].concat(each ? [each.slice(2)] : [], ['THE CIRCLE GROWS,', 'THE SPACING NEVER CHANGES']);
    var sig = S.captions[0];
    if (sig !== S.capSig) { S.capSig = sig; S.capT = performance.now(); }
    showCaption();
    window.__zoomState = { cam: { cx: S.cam.cx, cy: S.cam.cy, z: S.cam.z }, W: W, H: H, N: S.N, mode: S.mode, method: S.method,
      exact: S.exact, onScreen: shown, drawn: drawn.slice(0, 2000), drawnCount: drawn.length, sel: S.sel, dim: S.dimShown,
      zoomText: S.zoomBox.textContent, caption: S.captions.join(' | '), home: homeZoom() };
  }

  // one caption line at the top: keys on screen, then the spacing, then the growth law, then it fades back
  function showCaption() {
    if (!S.captions) return;
    var t = (performance.now() - (S.capT || 0)) / 1000, i = Math.floor(t / 2.6), n = S.captions.length;
    var txt = i < n ? S.captions[i] : S.captions[0];
    if (S.capMain.textContent !== txt) S.capMain.textContent = txt;
    var op = i < n ? '1' : '0.35';
    if (S.capMain.style.opacity !== op) S.capMain.style.opacity = op;
  }

  // the cockpit: range rings at a quarter, half and three quarters of the keys, rim ticks, and a compass rose
  function drawInstruments(ctx, o, rr) {
    ctx.save();
    ctx.strokeStyle = 'rgba(102,204,255,0.35)'; ctx.fillStyle = 'rgba(102,204,255,0.6)'; ctx.lineWidth = 1;
    if (rr > 40 && rr < 4e6) {
      [0.25, 0.5, 0.75].forEach(function (f) {
        ctx.beginPath(); ctx.arc(o[0], o[1], rr * Math.sqrt(f), 0, Math.PI * 2); ctx.stroke();
      });
      for (var d = 0; d < 360; d += 10) {
        var a = -d * Math.PI / 180, L = d % 90 === 0 ? 22 : 9;
        ctx.beginPath(); ctx.moveTo(o[0] + rr * Math.cos(a), o[1] + rr * Math.sin(a));
        ctx.lineTo(o[0] + (rr + L) * Math.cos(a), o[1] + (rr + L) * Math.sin(a)); ctx.stroke();
      }
      if (rr > 120) {
        ctx.font = 'bold 24px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ['TURN 0', '0.25', '0.5', '0.75'].forEach(function (s, j) {
          var a = -j * Math.PI / 2, R = rr + 44;
          var x = o[0] + R * Math.cos(a), y = o[1] + R * Math.sin(a);
          if (x > 60 && x < S.W - 60 && y > S.topH + 20 && y < S.H - S.botH - 20) ctx.fillText(s, x, y);
        });
      }
    }
    // compass rose, right edge above the button row: 0 turn points right, turns run anticlockwise
    var cx = S.W - 70, cy = S.H - S.botH - 80, R = 34;
    ctx.strokeStyle = 'rgba(0,255,255,0.5)'; ctx.fillStyle = 'rgba(0,255,255,0.7)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + R + 10, cy); ctx.lineTo(cx + R - 4, cy - 7); ctx.lineTo(cx + R - 4, cy + 7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, R - 10, -0.15, -Math.PI / 2 + 0.25, true); ctx.stroke();
    ctx.font = 'bold 24px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('0', cx + R + 4, cy - 10);
    ctx.fillText('0.25', cx, cy - R - 4);
    ctx.restore();
  }

  function drawSelection(ctx) {
    var W = S.W, H = S.H;
    S.card.style.display = 'none';
    if (!S.sel) return;
    var q = KuiperLaw.place(S.sel.key), p = toScreen(q.x, q.y);
    if (p[0] < -50 || p[0] > W + 50 || p[1] < -50 || p[1] > H + 50) return;
    ctx.strokeStyle = C.amber; ctx.fillStyle = C.amber; ctx.lineWidth = 3;
    var rr = Math.max(14, Math.min(40, 0.3 * S.cam.z));
    ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.shadowColor = C.amber; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(4, Math.min(26, 0.18 * S.cam.z)), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // the card is a corner instrument (keeps the centre clear); on a laptop it sits on the side away from the dot
    S.card.style.display = 'block';
    S.topH = S.top.offsetHeight;
    var cw = S.card.offsetWidth, ch = S.card.offsetHeight, left, top;
    if (S.phone) { left = 8; top = p[1] > H / 2 ? S.topH + 4 : H - S.botH - ch - 4; }
    else { left = p[0] < W / 2 ? W - cw - 16 : 16; top = S.topH + 10; }
    S.card.style.left = left + 'px'; S.card.style.top = top + 'px';
    // leader: from the ring, a slanted line, then a shelf along the card edge
    var ex = left + (p[0] < left ? 0 : cw), ey = top + ch / 2;
    if (p[0] >= left && p[0] <= left + cw) { ex = left + cw / 2; ey = p[1] < top ? top : top + ch; }
    var ang = Math.atan2(ey - p[1], ex - p[0]);
    var bx = p[0] + rr * Math.cos(ang), by = p[1] + rr * Math.sin(ang);
    var kx = ex + (ex === left ? -26 : (ex === left + cw ? 26 : 0));
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ey); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
  }

  // ---------------------------------------------------------------- the real wafer: which commit holds a key
  // Same arithmetic as the live Kuiper (kuiper-belt index.html:252-263, findBy / address / describe), over the public
  // commit table in realgame-data.js (cosmos/wafer.tsv). Links only to repos marked public in cosmos/public.tsv.
  var PUBLIC = 'faraday,law,grid,cosmic,stones,Kuiper-belt,particle-physics-drawing-engine,elements,galaxies-wafers,star-cable-derating-star,star-sector-star,star-solar-star,star-electron-star,star-seer-star,star-quantum-twin,grid-dictionary,code-generator,stars,star-maker,control-pad,gridmachine2,gridmachine1,cable-trench-or-drill,layout-tool,gpu-drivers-for-global-grid,linux-for-the-power-grid,teleprinter,testcode,ventusltd.com,studies,ventus-grid-engine,codex-chatgpt,claude,gemini,data-grid-gb,grid-distance-maths,chatgpt-audits,cvaa,architecture,data-gridatlas,gridatlas,companies,pipelinenews,uk-dno-data,v11,seed-data,data-centres-gb,solar-electrical-topology-analysis-engine-text-based,Mahabharata,reports,registry_of_all_content_in_repos_and_dependencies,data_uk_dno_and_tso,spiders,data-federation-map-for-globalgrid2050-all-repos,gb-electricity-ui,data-interconnectors,data-gb-electricity,globalgrid2050-homepage,globalgrid2050-hompage,youengineer-code-review,globalgrid2050,Solar-PV-Hybrid-and-off-grid,solar-repowering-whitepaper,pv-arc-protection-circuit'.split(',');
  var REALW = null;
  function realWafer() {
    if (REALW) return REALW;
    var D = window.KGRealData; if (!D || !D.n) return null;
    function arr(s) { var a = s.split(','), o = new Float64Array(a.length); for (var i = 0; i < a.length; i++) o[i] = parseInt(a[i], 36); return o; }
    var dt = arr(D.dt), lines = arr(D.lines), gap = arr(D.gap600), repo = arr(D.repo), n = D.n;
    var unix = new Float64Array(n), k0 = new Float64Array(n), cum = new Float64Array(n), u = D.t0, k = 0, iss = 0;
    for (var i = 0; i < n; i++) { u += dt[i]; unix[i] = u; k += gap[i] * 600; k0[i] = k; cum[i] = iss; iss += lines[i]; k += lines[i]; }
    REALW = { D: D, n: n, unix: unix, k0: k0, lines: lines, repo: repo, cum: cum, issued: iss, space: k };
    return REALW;
  }
  // index.html:252 findBy, :254-255 address
  function findBy(arrv, v) { var lo = 0, hi = arrv.length - 1; while (lo < hi) { var m = (lo + hi + 1) >> 1; if (arrv[m] <= v) lo = m; else hi = m - 1; } return lo; }
  function address(k) {
    var w = realWafer(); if (!w || !(k >= 0) || k >= w.space) return null;
    var i = findBy(w.k0, k);
    if (k >= w.k0[i] && k < w.k0[i] + w.lines[i]) return { k: k, i: i, m: k - w.k0[i] };
    return { k: k, i: i, silent: true, next: k < w.k0[i] ? i : i + 1 };
  }
  function commitInfo(i) {
    var w = realWafer(), name = w.D.repos[w.repo[i]] || ('repo ' + w.repo[i]), sha = w.D.sha.substr(12 * i, 12);
    var pub = PUBLIC.indexOf(name) >= 0;
    return { name: name, sha: sha, date: new Date(w.unix[i] * 1000).toISOString().slice(0, 16).replace('T', ' ') + 'Z',
      url: pub ? 'https://github.com/Ventusltd/' + name + '/commit/' + sha : null };
  }
  // index.html:256-263 describe(), in big plain words
  function describeReal(k) {
    var a = address(k);
    if (!a) { S.cardReal.textContent = ''; S.cardLink.style.display = 'none'; return; }
    var w = realWafer();
    if (a.silent) {
      var nx = a.next < w.n ? commitInfo(a.next) : null;
      S.cardReal.textContent = 'SILENCE: NEVER ISSUED' + (nx && !S.phone ? ' (QUIET BEFORE ' + nx.name + ', ' + nx.date + ')' : '');
      S.cardReal.style.color = C.blue; S.cardLink.style.display = 'none'; return;
    }
    var c = commitInfo(a.i);
    S.cardReal.style.color = C.green;
    S.cardReal.textContent = 'LINE ' + fmt(a.m + 1) + ' OF ' + fmt(w.lines[a.i]) + ' IN COMMIT ' + c.sha + ', ' + (S.phone ? c.date.slice(0, 10) : c.date + ' (' + c.name + ')');
    if (c.url) { S.cardLink.href = c.url; S.cardLink.textContent = S.phone ? 'GITHUB: ' + c.name : 'OPEN ' + c.name + ' / ' + c.sha + ' ON GITHUB'; S.cardLink.style.display = 'inline-block'; }
    else S.cardLink.style.display = 'none';
  }
  // index.html:388-398 showNew(hours): new is measured from the newest commit, so the boundary is one circle;
  // index.html:364-381 draws it as an amber dashed line across the radius, NEW CODE outward, older inward.
  function flyToNewest(hours) {
    var w = realWafer(); if (!w) return;
    var last = w.unix[w.n - 1], cut = last - hours * 3600;
    var newFrom = findBy(w.unix, cut - 1) + (w.unix[0] >= cut ? 0 : 1); if (newFrom >= w.n) newFrom = w.n - 1;
    var k = w.k0[newFrom];
    goToKey(k);
    var q = KuiperLaw.place(k);
    S.boundary = { x: q.x, y: q.y, key: k, commits: w.n - newFrom };
  }
  function drawBoundary(ctx) {
    var b = S.boundary; if (!b || S.cam.z < 1) return;
    var x = (b.x - S.cam.cx) * S.cam.z + S.W / 2, y = S.H / 2 - (b.y - S.cam.cy) * S.cam.z, rr = Math.hypot(b.x, b.y) || 1;
    var tx = -b.y / rr, ty = b.x / rr, Lp = Math.hypot(S.W, S.H);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,176,0,0.95)'; ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.beginPath();
    ctx.moveTo(x - tx * Lp, y + ty * Lp); ctx.lineTo(x + tx * Lp, y - ty * Lp); ctx.stroke(); ctx.setLineDash([]);
    var ox = b.x / rr, oy = -b.y / rr;
    ctx.font = 'bold 28px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.amber; ctx.fillText('NEW CODE', x + ox * 130, y + oy * 130);
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText('older', x - ox * 130, y - oy * 130);
    ctx.restore();
  }
  function shareHash() {
    if (!S || !S.sel) return;
    var h = '#key=' + S.sel.key + '&zoom=' + (Math.round(S.cam.z * 1000) / 1000);
    S.shareUrl = location.href.split('#')[0] + h;
    try { history.replaceState(null, '', h); } catch (e) { }
  }
  function readHash() {
    var m = /[#&]key=(\d+)/.exec(location.hash || ''), z = /[#&]zoom=([\d.e+-]+)/.exec(location.hash || '');
    if (!m) return null;
    return { key: +m[1], zoom: z ? +z[1] : 90 };
  }

  function selectKey(k, how) {
    var q = KuiperLaw.place(k);
    S.sel = { key: k, r: q.r, deg: q.deg, turns: q.turns, how: how };
    S.cardKey.textContent = 'KEY ' + fmt(k);
    S.cardDist.textContent = 'DISTANCE ' + fmtDec(q.r, q.r < 1e6 ? 3 : 1);
    S.cardTurn.textContent = 'TURN ' + q.turns.toFixed(6) + ' (' + q.deg.toFixed(2) + '°)';
    S.cardSmall.textContent = 'm = ' + fmt(q.m) + ' of 2^32, r = sqrt(key + 0.5)';
    S.cardSmall.style.display = S.phone ? 'none' : 'block';
    describeReal(k);
    if (!S.visited.has(k)) { S.visited.add(k); }
    if (how !== 'goto') S.boundary = null;
    shareHash();
    note(penta(Math.floor(q.turns * 10), 392), 0, 0.5, 0.07);
    S.dirty = true;
  }

  function tapAt(sx, sy) {
    var best = null, bd = Infinity, tol = Math.max(30, Math.min(60, 0.5 * S.cam.z));
    for (var i = 0; i < S.drawn.length; i++) {
      var d = Math.hypot(S.drawn[i].sx - sx, S.drawn[i].sy - sy);
      if (d < bd) { bd = d; best = S.drawn[i]; }
    }
    if (best && bd <= tol) { selectKey(best.k, 'dot'); return; }
    var w = toWorld(sx, sy);
    var hit = KuiperScale.pick(S.P, w[0], w[1], { zoom: S.cam.z });
    if (hit && hit.screenDistance <= 120) selectKey(hit.key, 'pick');
    else { S.sel = null; S.dirty = true; }
  }

  function goToKey(k) {
    k = Math.floor(k);
    if (!(k >= 0)) return;
    if (k > EXACT - 1) k = EXACT - 1;
    if (k >= S.N) setCount(Math.min(EXACT, k + 1));
    var q = KuiperLaw.place(k);
    var z = 120;
    var cy = q.y;
    selectKey(k, 'goto');
    var sec = Math.min(4.2, 1.8 + 0.12 * Math.log(1 + Math.hypot(q.x - S.cam.cx, q.y - S.cam.cy)));
    audioInit();
    fly(q.x, cy, z, sec, true);
  }

  // ------------------------------------------------------------------ the WHY panel (for a PhD)
  function whyText() {
    var f = S.facts, k = S.sel ? S.sel.key : 123456789;
    var q = KuiperLaw.place(k);
    var info = S.keys && S.keys.info ? S.keys.info : null;
    return [
      ['THE LAW (KuiperLaw.place, lifted verbatim from the live Kuiper)', C.cyan],
      ['m = (k mod 2^32) x 2654435769 mod 2^32   (Math.imul, then >>> 0)', C.white],
      ['turn = m / 2^32     r = sqrt(k + 0.5)     x = r cos(2 pi turn), y = r sin(2 pi turn)', C.white],
      ['Live: k = ' + fmt(k) + ', m = ' + fmt(q.m) + ', turn = ' + q.turns.toFixed(9) + ', r = ' + q.r.toFixed(6), C.amber],
      ['WHICH KEYS ARE DRAWN', C.cyan],
      ['Zoomed in: KuiperScale.visibleKeys. The window becomes a key band by inverting r: k from r^2 - 0.5. Inside the band the keys at the window\'s angles form a 2-D lattice {(k, kG - w 2^32)}. A reduced basis enumerates only those candidates, and each is tested exactly. Every key in the window is drawn, none missed.', C.white],
      ['Zoomed out: KuiperScale.sample. One fixed pick from each of ' + fmt(SAMPLEDOTS) + ' equal-count key bands (equal count is equal area for this law), plus the visible window thinned the same way.', C.white],
      ['Now: method ' + S.method + (info ? ', candidates ' + fmt(info.candidates || 0) + ', expected ' + fmt(info.expected || 0) : '') + ', exact ' + (S.exact ? 'YES' : 'NO (thinned)') + '.', C.amber],
      ['EXACT TO 2^53', C.cyan],
      ['Keys are JavaScript doubles, whole numbers to 2^53 = 9,007,199,254,740,992. k mod 2^32 is exact there, and Math.imul works on 32-bit integers, so m is exact for every key. scale-logic receipt: 1,000,000 + 100,000 random keys to 2^53, 0 differences from KuiperLaw.place.', C.white],
      ['ANGLES REPEAT EVERY 2^32', C.cyan],
      ['m depends only on k mod 2^32, so key k and key k + 4,294,967,296 point the same way at different distances. With ' + fmt(S.N) + ' keys the angle list repeats ' + (f.angleRepeats < 1 ? f.angleRepeats.toPrecision(3) : fmt(f.angleRepeats)) + ' times.', C.white],
      ['SPACING', C.cyan],
      ['N keys fill a disc of area pi (N + 0.5) at one key per pi square units, so the mean spacing is sqrt(pi) = ' + f.neighbourSpacing.toFixed(4) + ' at every N. Rim now r = ' + f.rimRadius.toFixed(2) + '; true nearest neighbour at the middle key: ' + (f.measuredNearest ? f.measuredNearest.toFixed(3) : 'n/a') + '.', C.white],
      ['Turn per key G / 2^32 = ' + f.turnsPerKey.toFixed(10) + ' (the golden ratio part, 222.4922° anticlockwise).', C.white],
      ['Source: ' + (KuiperLaw.source || 'kuiper-law.js') + '  ' + (KuiperLaw.live || ''), C.blue]
    ];
  }
  function openWhy() {
    S.whyBody.innerHTML = '';
    var box = el('div', 'max-width:1100px;margin:0 auto;padding:24px 24px 120px;', null, S.whyBody);
    whyText().forEach(function (row) {
      var head = row[1] === C.cyan;
      el('div', 'color:' + row[1] + ';font:bold ' + (head ? S.big : S.med) + 'px ' + FONT + ';margin:' + (head ? '26px 0 8px' : '0 0 10px') + ';line-height:1.3;', row[0], box);
    });
    S.why.style.display = 'block';
  }

  // ------------------------------------------------------------------ build UI
  function button(text, parent, onClick, extra) {
    var b = el('button', 'height:' + S.btn + 'px;min-width:' + S.btn + 'px;padding:0 ' + (S.phone ? 9 : 16) + 'px;background:transparent;color:rgba(0,255,255,0.75)' +
      ';border:2px solid rgba(0,255,255,0.5);border-radius:10px;font:bold ' + S.btnFont + 'px ' + FONT + ';cursor:pointer;flex:none;touch-action:manipulation;' + (extra || ''), text, parent);
    b.addEventListener('pointerenter', function () { b.style.filter = 'brightness(1.6)'; });
    b.addEventListener('pointerleave', function () { b.style.filter = ''; });
    b.addEventListener('click', function (e) { e.stopPropagation(); audioInit(); onClick(e); });
    return b;
  }
  function inputBox(parent, width, onEnter) {
    var i = el('input', 'height:' + (S.btn - 6) + 'px;width:' + width + 'px;background:#000;color:' + C.white + ';border:3px solid ' + C.blue +
      ';border-radius:10px;font:bold ' + (S.phone ? 24 : 26) + 'px ' + FONT + ';padding:0 10px;flex:none;box-sizing:border-box;', null, parent);
    i.type = 'text'; i.inputMode = 'numeric'; i.spellcheck = false; i.autocomplete = 'off';
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); audioInit(); onEnter(i.value); } });
    i.addEventListener('change', function () { onEnter(i.value); });
    return i;
  }

  function layout() {
    var r = S.host.getBoundingClientRect();
    S.W = Math.max(1, r.width); S.H = Math.max(1, r.height);
    S.dpr = Math.min(2, window.devicePixelRatio || 1);
    S.canvas.width = Math.round(S.W * S.dpr); S.canvas.height = Math.round(S.H * S.dpr);
    S.canvas.style.width = S.W + 'px'; S.canvas.style.height = S.H + 'px';
    S.topH = S.top.offsetHeight; S.botH = S.bottom.offsetHeight + 10;
    S.dirty = true;
  }

  function open(host) {
    if (S) close();
    var phone = Math.min(window.innerWidth, host.clientWidth || window.innerWidth) < 700;
    S = { host: host, cam: { cx: 0, cy: 0, z: 1 }, pointers: new Map(), dirty: true, muted: false, ac: null, sel: null,
      drawn: [], keys: [], visited: new Set(), boundary: null, phone: phone, btn: phone ? 56 : 72, btnFont: phone ? 24 : 28, big: phone ? 28 : 40, med: phone ? 24 : 28 };
    host.style.background = '#000'; host.style.overflow = 'hidden';
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var root = el('div', 'position:absolute;inset:0;font-family:' + FONT + ';color:#fff;user-select:none;-webkit-user-select:none;', null, host);
    S.root = root;
    var cv = el('canvas', 'position:absolute;left:0;top:0;touch-action:none;display:block;cursor:grab;', null, root);
    S.canvas = cv; S.ctx = cv.getContext('2d');

    // corners: zoom readout and count top left, X top right, one caption line at the top
    var safe = 'env(safe-area-inset-top,0px)';
    var top = el('div', 'position:absolute;left:0;right:0;top:0;padding:calc(8px + ' + safe + ') 10px 0;pointer-events:none;transition:opacity .3s;', null, root);
    S.top = top;
    var tl = el('div', 'margin-right:96px;', null, top);
    S.zoomBox = el('div', 'color:' + C.cyan + ';opacity:0.9;font:bold ' + (phone ? 30 : 44) + 'px ' + FONT + ';white-space:nowrap;line-height:1.1;', 'ZOOM x1', tl);
    S.countRead = el('div', 'color:' + C.blue + ';opacity:0.8;font:bold 24px ' + FONT + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;', '', tl);
    S.capMain = el('div', 'color:#fff;font:bold ' + S.big + 'px ' + FONT + ';line-height:1.15;margin-top:6px;transition:opacity .8s;' + (phone ? '' : 'position:absolute;left:0;right:0;top:calc(14px + ' + safe + ');text-align:center;padding:0 240px;white-space:nowrap;'), '', top);
    S.closeBtn = button('\u2715', root, function () { close(); }, 'position:absolute;top:calc(8px + ' + safe + ');right:10px;width:72px;height:72px;font-size:40px;color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.5);z-index:4;');

    // the bottom edge: one row of dim outline buttons; everything else opens in a sheet
    var bottom = el('div', 'position:absolute;left:0;right:0;bottom:0;padding:0 8px calc(10px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;gap:' + (phone ? 6 : 12) + 'px;pointer-events:none;transition:opacity .3s;', null, root);
    S.bottom = bottom;
    function rowBtn(t, fn, extra) { var bt = button(t, bottom, fn, extra); bt.style.pointerEvents = 'auto'; return bt; }
    rowBtn(phone ? 'MANY' : 'HOW MANY', function () { openSheet('many'); });
    rowBtn(phone ? 'KEY' : 'GO TO KEY', function () { openSheet('key'); }, 'color:rgba(255,176,0,0.85);border-color:rgba(255,176,0,0.5);');
    rowBtn(phone ? '\u2302' : 'HOME', function () { goHome(true); }, phone ? 'font-size:30px;' : '');
    rowBtn('WHY', openWhy, 'color:rgba(34,238,119,0.85);border-color:rgba(34,238,119,0.5);');
    S.muteBtn = rowBtn('\u266a', function () {
      S.muted = !S.muted; S.muteBtn.textContent = S.muted ? (phone ? '\u00d7\u266a' : 'MUTE') : '\u266a';
      if (!S.muted) audioInit();
    }, 'font-size:' + (phone ? 28 : 34) + 'px;');
    S.muteBtn.title = 'MUSIC ON / MUTE';

    // bottom sheets: HOW MANY (box, /10, x10) and GO TO KEY (box, GO)
    var lab = 'font:bold ' + (phone ? 24 : 28) + 'px ' + FONT + ';color:' + C.blue + ';flex:1 1 100%;';
    var sheetCss = 'position:absolute;left:50%;transform:translateX(-50%);bottom:calc(' + (S.btn + 18) + 'px + env(safe-area-inset-bottom,0px));width:min(640px,calc(100% - 16px));box-sizing:border-box;display:none;flex-wrap:wrap;gap:10px;align-items:center;padding:14px;background:rgba(0,0,0,0.9);border:2px solid rgba(0,255,255,0.5);border-radius:14px;z-index:3;';
    S.sheetMany = el('div', sheetCss, null, root);
    el('div', lab, 'HOW MANY KEYS (1 TO 2^53)', S.sheetMany);
    S.countBox = inputBox(S.sheetMany, 100, function (v) {
      var n = parseNum(v); if (isFinite(n) && n >= 1) changeCount(n); else S.countBox.value = fmt(S.N);
    });
    S.countBox.style.flex = '1'; S.countBox.style.minWidth = '0';
    button('/10', S.sheetMany, function () { changeCount(Math.max(1, Math.floor(S.N / 10))); });
    button('x10', S.sheetMany, function () { changeCount(Math.min(EXACT, S.N * 10)); });
    S.sheetKey = el('div', sheetCss, null, root);
    el('div', lab, 'GO TO KEY (0 TO 2^53 - 1)', S.sheetKey);
    S.keyBox = inputBox(S.sheetKey, 100, function (v) { var k = parseNum(v); if (isFinite(k)) { closeSheets(); goToKey(k); } });
    S.keyBox.style.flex = '1'; S.keyBox.style.minWidth = '0';
    S.keyBox.placeholder = '123456';
    S.flyRow = el('div', 'display:flex;flex-wrap:wrap;gap:10px;flex:1 1 100%;order:5;', null, S.sheetKey);
    button('KEY 0', S.flyRow, function () { closeSheets(); S.boundary = null; goToKey(0); });
    button(phone ? 'NEWEST' : 'NEWEST WORK', S.flyRow, function () { closeSheets(); if (S.N < 59637070538) setCount(59637070538); flyToNewest(24); },
      'color:' + C.amber + ';border-color:rgba(255,176,0,0.6);');
    S.linkBtn = button(phone ? 'LINK' : 'COPY LINK', S.flyRow, function () {
      shareHash(); var u = S.shareUrl || location.href;
      try { navigator.clipboard.writeText(u); } catch (e) { }
      S.linkBtn.textContent = 'COPIED'; setTimeout(function () { if (S) S.linkBtn.textContent = phone ? 'LINK' : 'COPY LINK'; }, 1500);
    });
    button('GO', S.sheetKey, function () { var k = parseNum(S.keyBox.value); if (isFinite(k)) { closeSheets(); goToKey(k); } },
      'color:' + C.amber + ';border-color:' + C.amber + ';');

    // the selected-key card (a corner instrument with a leader line to the dot)
    S.card = el('div', 'position:absolute;display:none;max-width:calc(100% - 16px);box-sizing:border-box;background:rgba(0,0,0,0.7);border:2px solid ' + C.amber + ';border-radius:8px;padding:8px 14px;pointer-events:none;', null, root);
    var wrapCss = phone ? 'overflow-wrap:anywhere;' : 'white-space:nowrap;';
    S.cardKey = el('div', 'color:' + C.amber + ';font:bold ' + (phone ? 28 : 40) + 'px ' + FONT + ';' + wrapCss, '', S.card);
    S.cardDist = el('div', 'color:#fff;font:bold ' + (phone ? 26 : 32) + 'px ' + FONT + ';' + wrapCss, '', S.card);
    S.cardTurn = el('div', 'color:' + C.cyan + ';font:bold ' + (phone ? 26 : 32) + 'px ' + FONT + ';' + wrapCss, '', S.card);
    S.cardSmall = el('div', 'color:' + C.blue + ';font:bold 24px ' + FONT + ';' + wrapCss, '', S.card);
    S.cardReal = el('div', 'color:' + C.green + ';font:bold 24px ' + FONT + ';max-width:' + (phone ? '100%' : '560px') + ';white-space:normal;margin-top:4px;', '', S.card);
    S.cardLink = el('a', 'display:none;pointer-events:auto;margin-top:6px;color:' + C.cyan + ';font:bold 24px ' + FONT + ';border:2px solid rgba(0,255,255,0.5);border-radius:8px;padding:6px 10px;text-decoration:none;overflow-wrap:anywhere;', '', S.card);
    S.cardLink.target = '_blank'; S.cardLink.rel = 'noopener';

    // WHY popup
    S.why = el('div', 'position:absolute;inset:0;display:none;background:#000;overflow:auto;z-index:5;', null, root);
    var whyClose = button('BACK', S.why, function () { S.why.style.display = 'none'; }, 'position:sticky;top:10px;float:right;margin:10px;color:#fff;border-color:rgba(255,255,255,0.6);');
    whyClose.style.zIndex = 6;
    S.whyBody = el('div', '', null, S.why);

    // input
    S.on = [];
    function on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); S.on.push([t, ev, fn, opt]); }
    on(cv, 'wheel', function (e) {
      e.preventDefault(); audioInit();
      var dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 800 : 1);
      if (e.ctrlKey) dy *= 3; // trackpad pinch arrives as ctrl+wheel with small deltas
      var r = cv.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-dy * 0.0022));
      var now = performance.now();
      if (!S.lastTick || now - S.lastTick > 90) { S.lastTick = now; note(220 * Math.pow(2, Math.log10(S.cam.z / homeZoom() + 1) / 2), 0, 0.12, 0.025); }
    }, { passive: false });
    on(cv, 'pointerdown', function (e) {
      audioInit();
      cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
      var r = cv.getBoundingClientRect();
      S.pointers.set(e.pointerId, { x: e.clientX - r.left, y: e.clientY - r.top, x0: e.clientX - r.left, y0: e.clientY - r.top, t0: performance.now() });
      if (S.pointers.size === 2) S.pinch = pinchState();
      S.anim = null; S.zoomAnim = null; cv.style.cursor = 'grabbing'; closeSheets();
      if (document.activeElement && document.activeElement.blur && document.activeElement !== document.body) document.activeElement.blur();
    });
    on(cv, 'pointermove', function (e) {
      var p = S.pointers.get(e.pointerId); if (!p) return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (S.pointers.size === 1) {
        S.cam.cx -= (x - p.x) / S.cam.z; S.cam.cy += (y - p.y) / S.cam.z;
        if (Math.hypot(x - p.x0, y - p.y0) > 8) p.moved = true;
        p.x = x; p.y = y;
      } else if (S.pointers.size >= 2) {
        p.x = x; p.y = y; p.moved = true;
        var ps = pinchState(), q = S.pinch;
        if (q && q.d > 0) {
          var w = [S.cam.cx + (q.mx - S.W / 2) / S.cam.z, S.cam.cy - (q.my - S.H / 2) / S.cam.z];
          S.cam.z = clampZ(S.cam.z * ps.d / q.d);
          S.cam.cx = w[0] - (ps.mx - S.W / 2) / S.cam.z; S.cam.cy = w[1] + (ps.my - S.H / 2) / S.cam.z;
        }
        S.pinch = ps; S.pinched = true;
      }
      S.dirty = true;
    });
    function up(e) {
      var p = S.pointers.get(e.pointerId); if (!p) return;
      S.pointers.delete(e.pointerId);
      if (S.pointers.size === 1) S.pinch = null;
      if (S.pointers.size === 0) {
        cv.style.cursor = 'grab';
        if (!p.moved && !S.pinched && e.type === 'pointerup' && performance.now() - p.t0 < 800) tapAt(p.x, p.y);
        S.pinched = false;
      }
    }
    on(cv, 'pointerup', up); on(cv, 'pointercancel', up);
    on(document, 'keydown', function (e) {
      if (!S) return;
      var a = document.activeElement, inBox = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
      if (e.key === 'Escape') {
        if (inBox) { a.blur(); return; }
        if (S.sheetMany.style.display === 'flex' || S.sheetKey.style.display === 'flex') { closeSheets(); return; }
        if (S.why.style.display === 'block') { S.why.style.display = 'none'; return; }
        close(); return;
      }
      if (inBox) return;
      audioInit();
      if (e.key === '+' || e.key === '=') zoomAt(S.W / 2, S.H / 2, 2);
      else if (e.key === '-' || e.key === '_') zoomAt(S.W / 2, S.H / 2, 0.5);
      else if (e.key === 'h' || e.key === 'H' || e.key === '0') goHome(true);
      else if (e.key === 'ArrowLeft') { S.cam.cx -= 80 / S.cam.z; S.dirty = true; }
      else if (e.key === 'ArrowRight') { S.cam.cx += 80 / S.cam.z; S.dirty = true; }
      else if (e.key === 'ArrowUp') { S.cam.cy += 80 / S.cam.z; S.dirty = true; }
      else if (e.key === 'ArrowDown') { S.cam.cy -= 80 / S.cam.z; S.dirty = true; }
    });
    on(window, 'resize', function () { layout(); });

    layout();
    setCount(1000000);
    goHome(false);
    S.raf = requestAnimationFrame(frame);
    // the first second moves: a slow zoom in from the whole circle
    S.cam.z = homeZoom() * 0.6; S.cam.cy = homeCy(); goHome(true);
    var hk = readHash();
    if (hk) { if (hk.key >= S.N) setCount(Math.min(EXACT, hk.key + 1)); var hq = KuiperLaw.place(hk.key); selectKey(hk.key, 'link'); S.anim = null; S.cam.cx = hq.x; S.cam.cy = hq.y; S.cam.z = clampZ(hk.zoom); S.dirty = true; }
    window.__zoomApi = { newest: flyToNewest, address: address, realWafer: realWafer, goToKey: goToKey, setCount: changeCount, home: goHome, zoomAt: zoomAt, select: selectKey };
  }

  function openSheet(which) {
    var m = which === 'many', s = m ? S.sheetMany : S.sheetKey, was = s.style.display === 'flex';
    closeSheets();
    if (was) return;
    s.style.display = 'flex';
    if (m) S.countBox.value = fmt(S.N);
    (m ? S.countBox : S.keyBox).focus();
  }
  function closeSheets() { if (!S) return; S.sheetMany.style.display = 'none'; S.sheetKey.style.display = 'none'; }

  function changeCount(n) {
    var wasHome = S.cam.z <= homeZoom() * 1.08;
    var old = S.N;
    setCount(n);
    note(S.N > old ? 523 : 330, 0, 0.35, 0.06);
    if (S.sel && S.sel.key >= S.N) S.sel = null;
    if (wasHome) goHome(true);
  }

  function pinchState() {
    var a = Array.from(S.pointers.values());
    return { mx: (a[0].x + a[1].x) / 2, my: (a[0].y + a[1].y) / 2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) };
  }

  function frame(now) {
    if (!S) return;
    var moving = stepAnim(now);
    if (moving || S.dirty) { S.dirty = false; draw(); }
    var busy = moving || S.pointers.size > 0, op = busy ? '0.15' : '1';
    if (S.bottom.style.opacity !== op) { S.bottom.style.opacity = op; S.top.style.opacity = busy ? '0.5' : '1'; }
    showCaption();
    S.raf = requestAnimationFrame(frame);
  }

  function close() {
    if (!S) return;
    var s = S;
    cancelAnimationFrame(s.raf);
    (s.on || []).forEach(function (o) { o[0].removeEventListener(o[1], o[2], o[3]); });
    try { if (s.ac) s.ac.close(); } catch (e) { }
    if (s.root && s.root.parentNode) s.root.parentNode.removeChild(s.root);
    S = null;
    try { s.host.dispatchEvent(new CustomEvent('kgclose', { bubbles: true, detail: { id: 'zoom' } })); } catch (e) { }
  }

  (window.KGModules = window.KGModules || []).push({
    id: 'zoom', label: 'ZOOM', sentence: 'Zoom into the Kuiper',
    open: open, close: close
  });
})();
