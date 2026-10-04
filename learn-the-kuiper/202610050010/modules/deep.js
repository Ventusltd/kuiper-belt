// modules/deep.js  LEARN THE KUIPER: the DEEP panel. Go deep: the maths and the proofs.
// Owner: Opus 4. Contract: MODULE-CONTRACT.md. Plain JS, no build, works from file://.
// Every real-wafer position comes from window.KuiperLaw.place (kuiper-law.js, lifted verbatim from kuiper-belt
// index.html @ 7a65dd315b0c60b1baf9a7090206c900b2cfd0a1). Exact integer checks use BigInt beside it, never instead of it.
// Every printed constant was recomputed in Python (Decimal, Fraction) and Node before it went in; see deep.md.
(function () {
  'use strict';
  var C = { bg: '#000', cyan: '#00ffff', blue: '#66ccff', amber: '#ffb000', green: '#22ee77', white: '#ffffff', dim: '#1d4a55' };
  var FONT = '"Segoe UI", Arial, sans-serif';
  var G = 2654435769, T32 = 4294967296, TWO53 = 9007199254740992;
  var BG = 2654435769n, BT = 4294967296n;
  var FIB = (function () { var s = {}, a = 1, b = 2; s[1] = 1; while (a < 1e13) { s[a] = 1; var c = a + b; a = b; b = c; } return s; })();

  function fmt(n) { // whole numbers with commas; works for Number and BigInt
    var s = (typeof n === 'bigint') ? n.toString() : String(Math.round(n));
    var neg = s[0] === '-'; if (neg) s = s.slice(1);
    return (neg ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function fx(v, d) { return (+v).toFixed(d); }
  function mExact(k) { return Number((BigInt(k) * BG) % BT); }           // the integer truth, beside the law
  function el(tag, css, html, parent) {
    var e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e); return e;
  }

  var state = null; // everything open() creates, so close() can undo it

  // ---------------------------------------------------------------- sound: WebAudio only after the first gesture
  function blip(freq, len) {
    if (!state || state.muted) return;
    try {
      if (!state.ac) state.ac = new (window.AudioContext || window.webkitAudioContext)();
      var ac = state.ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = 'sine'; o.frequency.value = freq || 523;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (len || 0.5));
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (len || 0.5) + 0.05);
    } catch (e) { /* no sound is fine */ }
  }
  var SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0];

  // ---------------------------------------------------------------- canvas helpers
  function makeCanvas(parent, h, cls) {
    var cv = el('canvas', 'display:block;width:100%;height:' + h + 'px;touch-action:none;background:#000;border:2px solid ' + C.dim + ';border-radius:10px;cursor:pointer', null, parent);
    cv.className = cls || '';
    return cv;
  }
  function fit(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g: g, w: w, h: h };
  }
  function txt(g, s, x, y, col, size, align) {
    g.fillStyle = col || C.white; g.font = 'bold ' + (size || 24) + 'px ' + FONT; g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillText(s, x, y);
  }
  function dot(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
  function dimLine(g, x1, y1, x2, y2, col) { // engineering-drawing leader with an arrow head at the far end
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1); g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - 12 * Math.cos(a - 0.4), y2 - 12 * Math.sin(a - 0.4)); g.lineTo(x2 - 12 * Math.cos(a + 0.4), y2 - 12 * Math.sin(a + 0.4)); g.closePath(); g.fillStyle = col; g.fill();
  }
  // world y is UP on screen (index.html:148, :357), so screen y = cy - y * s
  function P(k) { return window.KuiperLaw.place(k); }

  // ---------------------------------------------------------------- page building blocks
  function chapter(body, n, title, sentence) {
    var sec = el('section', 'margin:0 auto 56px auto;max-width:1100px;padding:0 16px', null, body);
    el('div', 'color:' + C.amber + ';font-size:28px;font-weight:bold;letter-spacing:2px;margin:18px 0 4px', 'CHAPTER ' + n, sec);
    el('h2', 'color:' + C.cyan + ';font-size:40px;line-height:1.15;margin:0 0 8px;font-weight:bold', title, sec);
    el('div', 'color:' + C.white + ';font-size:28px;margin:0 0 14px', sentence, sec);
    return sec;
  }
  function para(sec, html, col) { return el('p', 'overflow-wrap:anywhere;font-size:26px;line-height:1.45;color:' + (col || C.white) + ';margin:14px 0', html, sec); }
  function formula(sec, html) { return el('div', 'font-size:26px;line-height:1.6;color:' + C.cyan + ';border:2px solid ' + C.dim + ';border-left:8px solid ' + C.cyan + ';padding:12px 16px;margin:14px 0;border-radius:8px;overflow-x:auto;white-space:pre-wrap;word-break:break-word', html, sec); }
  function source(sec, html) { return el('pre', 'font-size:24px;line-height:1.4;color:' + C.blue + ';background:#03141a;border:2px solid ' + C.dim + ';padding:12px 16px;margin:14px 0;border-radius:8px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;font-family:Consolas,monospace', html, sec); }
  function label(sec, s) { return el('div', 'font-size:24px;color:' + C.amber + ';font-weight:bold;margin:18px 0 6px;letter-spacing:1px', s, sec); }
  function row(sec) { return el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0', null, sec); }
  function button(parent, s, fn, col) {
    var b = el('button', 'min-height:' + state.btn + 'px;padding:0 20px;font:bold 24px ' + FONT + ';color:#000;background:' + (col || C.cyan) + ';border:0;border-radius:10px;cursor:pointer', s, parent);
    b.addEventListener('click', function () { blip(SCALE[(state.note++) % SCALE.length], 0.3); fn(b); });
    return b;
  }
  function input(parent, value, onCommit, width) {
    var i = el('input', 'height:' + state.btn + 'px;width:' + (width || 330) + 'px;max-width:100%;font:bold 28px ' + FONT + ';color:' + C.cyan + ';background:#001014;border:3px solid ' + C.cyan + ';border-radius:10px;padding:0 12px;box-sizing:border-box', null, parent);
    i.value = value; i.setAttribute('inputmode', 'numeric');
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { onCommit(i.value); e.preventDefault(); } else if (e.key === 'Escape') { i.blur(); e.stopPropagation(); } });
    i.addEventListener('change', function () { onCommit(i.value); });
    return i;
  }
  function readKey(s, max) {
    s = String(s).replace(/[,\s_]/g, '');
    if (/^2\^\d+$/.test(s)) { var p = +s.slice(2); return Math.min(Math.pow(2, p), max); }
    var v = Math.floor(+s); if (!isFinite(v) || v < 0) return null; return Math.min(v, max);
  }
  // a hero picture: big, animated, touchable; a toddler can enjoy it with no reading
  function hero(sec, h, draw) {
    var cv = makeCanvas(sec, h, 'deep-hero');
    var item = { cv: cv, draw: draw, taps: [], visible: true };
    cv.addEventListener('pointerdown', function (e) {
      var r = cv.getBoundingClientRect(); item.taps.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      blip(SCALE[Math.floor(Math.random() * SCALE.length)], 0.6);
    });
    state.heroes.push(item); if (state.io) state.io.observe(cv);
    return item;
  }
  function drawTaps(g, item, now) { // rings of light where a finger touched
    item.taps = item.taps.filter(function (p) { return now - p.t < 1200; });
    item.taps.forEach(function (p) {
      var a = (now - p.t) / 1200; g.strokeStyle = 'rgba(255,176,0,' + (1 - a) + ')'; g.lineWidth = 4;
      g.beginPath(); g.arc(p.x, p.y, 10 + a * 90, 0, 6.2832); g.stroke();
    });
  }
  function proofCanvas(sec, h, redraw) {
    var cv = makeCanvas(sec, h, 'deep-proof'); var item = { cv: cv, redraw: redraw }; state.proofs.push(item); return item;
  }

  // ================================================================ CHAPTER 1: the exact law
  function ch1(body) {
    var sec = chapter(body, 1, 'The exact law', 'One key, one place, forever.');
    hero(sec, state.heroH, function (g, w, h, t) { // keys appear one by one and fly to their true place
      var n = Math.floor((t / 12) % 1600), s = Math.min(w, h) / 2 / Math.sqrt(1600) * 0.95, cx = w / 2, cy = h / 2;
      for (var k = 0; k <= n; k++) { var p = P(k); dot(g, cx + p.x * s, cy - p.y * s, k === n ? 7 : 2.2, k === n ? C.amber : (k % 89 === 0 ? C.green : C.cyan)); }
    });
    para(sec, 'Each line of work gets the next whole number, its <b style="color:' + C.amber + '">key</b>. The key alone decides where its dot sits. These are the live lines, quoted with their line numbers in <b>kuiper-belt index.html</b> at commit 7a65dd3:');
    source(sec, ':92   const G32 = 2654435769, TW = 4096;\n' +
      ':250  function keyPlace(k){ const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, th = 2*Math.PI*m/4294967296, r = Math.sqrt(k + 0.5);\n' +
      ':251    return [r*Math.cos(th), r*Math.sin(th)]; }\n' +
      ':143  float d = float(gl_VertexID);\n' +
      ':144  float r = u_R0 + (d + 0.5) / (u_R0 + sqrt(u_R0*u_R0 + d + 0.5) + 1e-9);      // sqrt(k0+d+.5), kept precise\n' +
      ':145  uint m = (u_k0lo + uint(gl_VertexID)) * ${G32}u;\n' +
      ':146  float A = 6.283185307179586 * float(m >> 16) / 65536.0, B = 6.283185307179586 * float(m & 0xFFFFu) / 4294967296.0;\n' +
      ':147  vec2 cs = vec2(cos(A)*cos(B) - sin(A)*sin(B), sin(A)*cos(B) + cos(A)*sin(B));\n' +
      ':148  gl_Position = vec4((r*cs - u_center) * u_zoom / (0.5*u_res), 0.0, 1.0);\n' +
      ':333  for (let off = s0; off < s1; off += 4000000) {\n' +
      ':334    gl.uniform1ui(U(PK,\'u_k0lo\'), (off % 4294967296) >>> 0); gl.uniform1f(U(PK,\'u_R0\'), Math.sqrt(off));\n' +
      ':335    gl.drawArrays(gl.POINTS, 0, Math.min(4000000, s1 - off)); } }');
    formula(sec, 'm = (k × 2654435769) mod 2³²      the turn, as a whole number\nθ = 2π × m / 2³²                   radians, anticlockwise, world y up\nr = √(k + ½)                        the radius, with the half (:250, :144)\n(x, y) = (r cos θ, r sin θ)');
    para(sec, 'The shader at :144 writes the same radius in a form that keeps float32 precise: u_R0 + (d + ½) / (u_R0 + √(u_R0² + d + ½)) is √(k0 + d + ½) by the identity √(a² + b) = a + b / (a + √(a² + b)). The angle at :146 is split into a high and a low 16-bit part, and :147 adds them back with the sum formula for cos and sin.');
    para(sec, 'The page text at :79 says r = √k. The code at :250 and :144 says √(k + ½). The code is the law.', C.amber);
    label(sec, 'TRY ANY KEY (TYPE, THEN ENTER)');
    var r1 = row(sec), out;
    var key = 1000;
    var inp = input(r1, '1000', function (v) { var k = readKey(v, TWO53); if (k == null) return; key = k; inp.value = fmt(k); pc.redraw(); });
    [0, 1, 1000, 59537904924].forEach(function (k) { button(r1, fmt(k), function () { key = k; inp.value = fmt(k); pc.redraw(); }, C.blue); });
    var pc = proofCanvas(sec, state.proofH, function () {
      var f = fit(pc.cv), g = f.g, w = f.w, h = f.h, p = P(key), cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
      g.clearRect(0, 0, w, h);
      if (key < 3000) { var s = R / Math.max(p.r, 3); for (var k = 0; k < Math.min(3000, (p.r * p.r) + 1); k++) { var q = P(k); dot(g, cx + q.x * s, cy - q.y * s, 2, C.dim); } }
      g.strokeStyle = C.dim; g.lineWidth = 2; g.setLineDash([8, 8]); g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke(); g.setLineDash([]);
      g.strokeStyle = C.blue; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R + 30, cy); g.stroke(); txt(g, '+x', cx + R + 34, cy, C.blue, 24);
      g.strokeStyle = C.amber; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 46, 0, -p.theta, true); g.stroke();
      var px = cx + R * Math.cos(p.theta), py = cy - R * Math.sin(p.theta);
      dimLine(g, cx, cy, px, py, C.cyan); dot(g, px, py, 10, C.amber);
      var ha = p.theta / 2; txt(g, 'θ', cx + 70 * Math.cos(ha), cy - 70 * Math.sin(ha), C.amber, 28, 'center');
      txt(g, 'r', (cx + px) / 2 - 18 * Math.sin(p.theta), (cy + py) / 2 - 18 * Math.cos(p.theta), C.cyan, 28, 'center');
      txt(g, 'KEY ' + fmt(key), 16, 26, C.white, 26);
      txt(g, 'θ = ' + fx(p.deg, 4) + '°', 16, 60, C.amber, 24);
      txt(g, 'r = ' + fx(p.r, 4), 16, 92, C.cyan, 24);
      var mE = mExact(key);
      out.innerHTML = 'm = (' + fmt(key) + ' × 2,654,435,769) mod 4,294,967,296 = <b style="color:' + C.amber + '">' + fmt(p.m) + '</b>\n' +
        'turns = m / 2³² = ' + fx(p.turns, 10) + '      θ = ' + fx(p.theta, 6) + ' rad = ' + fx(p.deg, 6) + '°\n' +
        'r = √(' + fmt(key) + ' + 0.5) = ' + fx(p.r, 6) + '\n' +
        'x = ' + fx(p.x, 6) + '     y = ' + fx(p.y, 6) + '\n' +
        'BigInt check of m: ' + fmt(mE) + (mE === p.m ? '  <b style="color:' + C.green + '">SAME</b>' : '  <b style="color:#ff4040">DIFFERENT</b>');
    });
    out = formula(sec, '');
  }

  // ================================================================ CHAPTER 2: equal area
  function ch2(body) {
    var sec = chapter(body, 2, 'Equal area', 'Every key owns the same piece of the circle.');
    hero(sec, state.heroH, function (g, w, h, t) { // rings fill up with dots, one colour per ring
      var cols = [C.cyan, C.amber, C.green, C.blue, C.white], N = 14, s = Math.min(w, h) / 2 / N * 0.95, cx = w / 2, cy = h / 2;
      var upto = Math.floor((t / 25) % (N * N + 60));
      for (var k = 0; k < Math.min(upto, N * N); k++) { var p = P(k), ring = Math.floor(p.r); dot(g, cx + p.x * s, cy - p.y * s, 5, cols[ring % 5]); }
      for (var n = 1; n <= N; n++) { g.strokeStyle = 'rgba(102,204,255,0.25)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, n * s, 0, 6.2832); g.stroke(); }
    });
    formula(sec, 'disc out to key k:   π r² = π (k + ½)\nso key k adds exactly   π (k + ½) − π (k − ½) = π   of area\nring n (n ≤ r < n + 1):  n ≤ √(k + ½) < n + 1  ⇔  n² ≤ k + ½ < (n + 1)²\n                          ⇔  k = n², n² + 1, ... , (n + 1)² − 1     (2n + 1 keys)\nring area  π ((n + 1)² − n²) = π (2n + 1) = π per key');
    para(sec, 'Because area grows exactly with the key, <b style="color:' + C.amber + '">r² is a clock</b>: how far out a dot sits says how many keys came before it, and nothing else. The ½ shifts the picture by half a key and changes no count: k + ½ can never equal a whole square, so no key sits on a ring line.');
    label(sec, 'PICK A RING: THE DOTS ARE COUNTED LIVE FROM KuiperLaw.place');
    var r1 = row(sec), n = 6, info;
    button(r1, '−', function () { n = Math.max(0, n - 1); pc.redraw(); }, C.blue);
    button(r1, '+', function () { n = Math.min(40, n + 1); pc.redraw(); }, C.blue);
    var pc = proofCanvas(sec, state.proofH, function () {
      var f = fit(pc.cv), g = f.g, w = f.w, h = f.h, cx = w / 2, cy = h / 2, M = Math.max(n + 2, 6), s = Math.min(w, h) / 2 / M * 0.92;
      g.clearRect(0, 0, w, h);
      var first = null, count = 0, last = null;
      for (var k = 0; k < (M + 1) * (M + 1); k++) {
        var p = P(k), inRing = p.r >= n && p.r < n + 1;
        if (inRing) { count++; if (first === null) first = k; last = k; }
        dot(g, cx + p.x * s, cy - p.y * s, inRing ? 6 : 3, inRing ? C.amber : C.dim);
      }
      g.setLineDash([8, 6]); g.lineWidth = 2; g.strokeStyle = C.white;
      [n, n + 1].forEach(function (rr) { if (rr > 0) { g.beginPath(); g.arc(cx, cy, rr * s, 0, 6.2832); g.stroke(); } });
      g.setLineDash([]);
      dimLine(g, cx, cy, cx + (n + 1) * s * 0.7071, cy - (n + 1) * s * 0.7071, C.cyan);
      txt(g, 'r = ' + (n + 1), cx + (n + 1) * s * 0.7071 + 8, cy - (n + 1) * s * 0.7071 - 14, C.cyan, 24);
      txt(g, 'RING ' + n, 16, 26, C.amber, 28);
      txt(g, count + ' KEYS', 16, 60, C.amber, 28);
      info.innerHTML = 'ring ' + n + ':  first key found = <b style="color:' + C.amber + '">' + first + '</b>   (n² = ' + (n * n) + ')' + (first === n * n ? '  <b style="color:' + C.green + '">SAME</b>' : '') +
        '\nkeys counted = <b style="color:' + C.amber + '">' + count + '</b>   (2n + 1 = ' + (2 * n + 1) + ')' + (count === 2 * n + 1 ? '  <b style="color:' + C.green + '">SAME</b>' : '') +
        '\nlast key = ' + last + '   ((n + 1)² − 1 = ' + ((n + 1) * (n + 1) - 1) + ')     ring area = π × ' + (2 * n + 1) + ' = ' + fx(Math.PI * (2 * n + 1), 4);
    });
    info = formula(sec, '');
    para(sec, 'Checked offline for every ring 0 to 1,999 (Python, the same law): first key n², 2n + 1 keys, no exceptions.', C.blue);
  }

  // ================================================================ CHAPTER 3: the turn
  function ch3(body) {
    var sec = chapter(body, 3, 'The turn', 'Why the dots never line up in spokes.');
    hero(sec, state.heroH, function (g, w, h, t) { // an arm sweeps 222.49 degrees and drops a dot each step
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42, step = (t / 700) % 135, k = Math.floor(step), fr = step - k;
      var s = R / Math.sqrt(120);
      for (var j = 0; j <= Math.min(k, 120); j++) { var p = P(j); dot(g, cx + p.x * s, cy - p.y * s, 6, j % 2 ? C.cyan : C.green); }
      var a0 = P(k % 121).theta, a1 = a0 + 2 * Math.PI * (G / T32) * Math.min(1, fr * 1.4);
      g.strokeStyle = C.amber; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.cos(a1), cy - R * Math.sin(a1)); g.stroke();
      dot(g, cx + R * Math.cos(a1), cy - R * Math.sin(a1), 12, C.amber);
    });
    var phi = (1 + Math.sqrt(5)) / 2;
    formula(sec, 'φ = (1 + √5) / 2 = 1.6180339887...\n2³² / φ = 2,654,435,769.497...  →  floor = <b style="color:' + C.amber + '">' + fmt(Math.floor(T32 / phi)) + '</b>  (computed now: ' + (Math.floor(T32 / phi) === G ? 'equals G32' : 'differs') + ')\none step = 2654435769 / 2³² = 0.6180339886 turn = 222.4922359083° anticlockwise\n          = 360° − 222.4922359083° = <b style="color:' + C.amber + '">137.5077640917° clockwise</b>\nVogel\'s golden angle 360° (2 − φ) = 137.5077640500°   (the integer is 4.2 × 10<sup>-8</sup> degrees off)');
    para(sec, 'So the Kuiper turns <b>anticlockwise by 222.49°</b>, which lands on the same point as <b>137.51° clockwise</b>. A spreadsheet spiral that turns 137.5° anticlockwise is the <b style="color:' + C.amber + '">mirror image</b> of the Kuiper, not the Kuiper.');
    label(sec, 'CONTINUED FRACTION OF 2654435769 / 2³² (EUCLID ON BIGINT, COMPUTED NOW)');
    var cfBox = el('div', 'display:flex;flex-wrap:wrap;gap:6px;margin:8px 0', null, sec);
    var a = BG, b = BT, cf = [];
    while (b !== 0n) { cf.push(Number(a / b)); var t2 = a % b; a = b; b = t2; }
    cf.forEach(function (v, i) { el('span', 'font:bold 24px ' + FONT + ';min-width:40px;text-align:center;padding:6px 8px;border-radius:8px;color:#000;background:' + (i === 0 ? C.blue : (v === 1 ? C.green : C.amber)), String(v), cfBox); });
    var ones = 0; for (var i = 1; i < cf.length && cf[i] === 1; i++) ones++;
    var h0 = 1, h1 = 0, dens = []; // denominators q_n = a_n q_{n-1} + q_{n-2}
    for (var j = 1; j < cf.length; j++) { var q = cf[j] * h0 + h1; h1 = h0; h0 = q; dens.push(q); }
    para(sec, '[0; ' + cf.slice(1).join(', ') + ']: after the 0 come <b style="color:' + C.green + '">' + ones + ' ones</b>, then ' + cf.slice(ones + 1, ones + 6).join(', ') + '... Exact φ would be ones forever. A 1 is the worst possible fit by a fraction, so every early fraction 1/2, 2/3, 3/5, 5/8 ... 17711/28657 misses badly, and no spoke can form.');
    para(sec, 'The best fractions have these denominators: ' + dens.slice(0, 27).map(function (d) { return '<b style="color:' + (FIB[d] ? C.green : C.amber) + '">' + fmt(d) + '</b>'; }).join(', ') + ' ... Green are Fibonacci numbers; amber are where the integer stops being golden (after 28,657).');
    para(sec, 'What it means for evenness: in a √ spiral the nearest neighbours of key k are k ± q for denominators q near 1.585 √k. While those q are Fibonacci the field is as even as a sunflower. Past about key 28,657² / 2.5 ≈ 3.3 × 10<sup>8</sup> the neighbours become 75,025, 103,682 (= 28,657 + 75,025), 328,757...: still no spokes, but the hexagon pattern changes shape.');
    label(sec, 'NEAREST NEIGHBOURS, SEARCHED BY BRUTE FORCE NOW');
    var r1 = row(sec), K = 1000000, found = null, info;
    [100, 10000, 1000000, 100000000, 1000000000, 59000000000].forEach(function (k) {
      button(r1, k >= 1e9 ? (k / 1e9) + ' bn' : fmt(k), function () { K = k; found = null; pc.redraw(); }, C.blue);
    });
    function search(K) { // every key within 3.2 sqrt(K) either side, exact law, keep the closest
      var p = P(K), W = Math.ceil(3.2 * Math.sqrt(K)) + 60, best = [];
      for (var d = 1; d <= W; d++) for (var sgn = -1; sgn <= 1; sgn += 2) {
        var k2 = K + sgn * d; if (k2 < 0) continue; var q = P(k2), dx = q.x - p.x, dy = q.y - p.y, dd = dx * dx + dy * dy;
        if (dd < 9) best.push({ d: d * sgn, x: q.x, y: q.y, dist: Math.sqrt(dd) });
      }
      best.sort(function (u, v) { return u.dist - v.dist; }); return { p: p, best: best, scanned: 2 * W };
    }
    var pc = proofCanvas(sec, state.proofH, function () {
      var f = fit(pc.cv), g = f.g, w = f.w, h = f.h; g.clearRect(0, 0, w, h);
      if (!found) {
        txt(g, 'SEARCHING ' + fmt(6.4 * Math.sqrt(K)) + ' KEYS...', w / 2, h / 2, C.amber, 28, 'center');
        var own = state; own.timers.push(setTimeout(function () { if (state !== own) return; found = search(K); pc.redraw(); }, 30)); return;
      }
      var p = found.p, ang = Math.atan2(p.y, p.x), s = Math.min(w, h) / 6.4, cx = w / 2, cy = h / 2;
      function rot(q) { var dx = q.x - p.x, dy = q.y - p.y, c = Math.cos(Math.PI / 2 - ang), sn = Math.sin(Math.PI / 2 - ang); return [cx + (dx * c - dy * sn) * s, cy - (dx * sn + dy * c) * s]; }
      found.best.forEach(function (q, i) {
        var xy = rot(q); if (i < 6) { g.strokeStyle = FIB[Math.abs(q.d)] ? C.green : C.amber; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(xy[0], xy[1]); g.stroke(); }
        dot(g, xy[0], xy[1], 9, C.cyan);
        if (i < 6) txt(g, (q.d > 0 ? '+' : '−') + fmt(Math.abs(q.d)), xy[0], xy[1] + 24, FIB[Math.abs(q.d)] ? C.green : C.amber, 24, 'center');
      });
      dot(g, cx, cy, 12, C.amber); txt(g, 'KEY ' + fmt(K), 16, 26, C.white, 26); txt(g, '↑ outward', w - 16, 26, C.blue, 24, 'right');
      var offs = []; found.best.slice(0, 6).forEach(function (q) { var a2 = Math.abs(q.d); if (offs.indexOf(a2) < 0) offs.push(a2); });
      info.innerHTML = 'key ' + fmt(K) + ': scanned ' + fmt(found.scanned) + ' keys; nearest at ' + fx(found.best[0].dist, 4) + ' units\nneighbour offsets: ' +
        offs.map(function (o) { return '<b style="color:' + (FIB[o] ? C.green : C.amber) + '">' + fmt(o) + (FIB[o] ? ' (Fibonacci)' : '') + '</b>'; }).join(', ') +
        '\n1.585 √k = ' + fmt(1.585 * Math.sqrt(K));
    });
    info = formula(sec, '');
  }

  // ================================================================ CHAPTER 4: 2^32 repetition and exactness to 2^53
  function ch4(body) {
    var sec = chapter(body, 4, 'The odometer: 2³² and 2<sup>53</sup>', 'The angle repeats; the radius never does.');
    hero(sec, state.heroH, function (g, w, h, t) { // an odometer wheel spins and rolls over, a lap counter ticks
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38, a = (t / 900) % 1, laps = Math.floor(t / 900);
      g.strokeStyle = C.dim; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke();
      g.strokeStyle = C.cyan; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + a * 6.2832); g.stroke();
      g.strokeStyle = C.amber; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.cos(-Math.PI / 2 + a * 6.2832), cy + R * Math.sin(-Math.PI / 2 + a * 6.2832)); g.stroke();
      for (var i = 0; i < Math.min(laps, 12); i++) dot(g, cx - R - 50, cy + R - i * 22, 9, C.green);
      txt(g, String(laps % 100), cx, cy, C.white, 56, 'center');
    });
    formula(sec, 'm uses k mod 2³² (:250, and the low 32 bits at :334), so\n   key k and key k + 4,294,967,296 have the same m, the same angle\n   but r = √(k + ½) keeps growing, so they never share a place.\nJavaScript Numbers are exact whole numbers up to 2<sup>53</sup> = 9,007,199,254,740,992.\n   (k % 2³²) and Math.imul stay exact for every key up to 2<sup>53</sup>.\n   A plain k × 2654435769 passes 2<sup>53</sup> from key 3,393,264 and then rounds.');
    para(sec, 'This is why Excel goes wrong: <b>=MOD(43486619138*2654435769, 4294967296)</b> gives 305,758,208; the true value is <b style="color:' + C.green + '">305,752,434</b> (recomputed in Python with exact integers, and below in BigInt). The wafer today ends near key 59.6 billion, far past 2³² = 4.29 billion, so its outer rings rhyme with inner ones in angle. Every key up to 2<sup>53</sup> is still exact.');
    label(sec, 'TYPE A KEY UP TO 2^53 (ENTER)');
    var r1 = row(sec), key = 43486619138, info;
    var inp = input(r1, fmt(key), function (v) { var k = readKey(v, TWO53 - 1); if (k == null) return; key = k; inp.value = fmt(k); pc.redraw(); });
    [3393263, 3393264, 43486619138, 4294967303, TWO53 - 1].forEach(function (k) { button(r1, k === TWO53 - 1 ? '2<sup>53</sup> − 1' : fmt(k), function () { key = k; inp.value = fmt(k); pc.redraw(); }, C.blue); });
    var pc = proofCanvas(sec, state.proofH, function () {
      var f = fit(pc.cv), g = f.g, w = f.w, h = f.h; g.clearRect(0, 0, w, h);
      // log scale bar from 1 to 2^53 with engineering marks
      var x0 = 30, x1 = w - 30, y = h * 0.30, L = Math.log2(TWO53);
      function X(k) { return x0 + (x1 - x0) * Math.log2(Math.max(1, k)) / L; }
      g.strokeStyle = C.blue; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      var marks = [[3393264, 'k×G > 2^53', C.amber, -1], [T32, '2³²', C.green, 1], [59637070538, 'wafer', C.cyan, 2], [TWO53, '2^53', C.white, 1]];
      marks.forEach(function (m) { var xx = X(m[0]); g.strokeStyle = m[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(xx, y - 18); g.lineTo(xx, y + 18); g.stroke(); txt(g, m[1], Math.min(Math.max(xx, 60), w - 60), y + m[3] * 40, m[2], 24, 'center'); });
      dot(g, X(key), y, 11, C.amber);
      // same ray: key and key + 2^32
      var p = P(key), k2 = key + T32 <= TWO53 ? key + T32 : null, q = k2 != null ? P(k2) : null;
      var cx = w / 2, cy = h * 0.66, R = h * 0.2;
      g.strokeStyle = C.dim; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke();
      dimLine(g, cx, cy, cx + R * Math.cos(p.theta), cy - R * Math.sin(p.theta), C.cyan);
      dot(g, cx + R * 0.55 * Math.cos(p.theta), cy - R * 0.55 * Math.sin(p.theta), 9, C.amber);
      if (q) dot(g, cx + R * Math.cos(q.theta), cy - R * Math.sin(q.theta), 9, C.green);
      txt(g, 'same angle, bigger r', cx, cy + R + 22, C.green, 24, 'center');
      var mI = p.m, mB = mExact(key), naive = (key * G) % T32, exactProd = key * G <= TWO53;
      info.innerHTML = 'key ' + fmt(key) + '\nMath.imul (the law)   m = <b style="color:' + C.amber + '">' + fmt(mI) + '</b>\nBigInt exact          m = ' + fmt(mB) + (mB === mI ? '  <b style="color:' + C.green + '">SAME</b>' : '  <b style="color:#ff4040">DIFFERENT</b>') +
        '\nplain (k × G) % 2³²    m = ' + fmt(naive) + (naive === mB ? '  <b style="color:' + C.green + '">ok</b>' : '  <b style="color:#ff4040">WRONG by ' + fmt(Math.abs(naive - mB)) + '</b> (product past 2<sup>53</sup>)') +
        (q ? '\nkey + 2³² = ' + fmt(k2) + ':  m = ' + fmt(q.m) + (q.m === p.m ? ' (same)' : '') + ',  r = ' + fx(q.r, 3) + ' vs ' + fx(p.r, 3) : '\nkey + 2³² is past 2<sup>53</sup>: not a whole Number any more');
    });
    info = formula(sec, '');
  }

  // ================================================================ CHAPTER 5: quiet time and dark rings
  function ch5(body) {
    var sec = chapter(body, 5, 'Quiet time and the dark rings', 'Silence is kept as empty rings.');
    hero(sec, state.heroH, function (g, w, h, t) { // bursts of dots, then a quiet ring, then more dots
      var cx = w / 2, cy = h / 2, N = 2400, s = Math.min(w, h) / 2 / Math.sqrt(N) * 0.95, upto = Math.floor((t / 3) % (N + 400));
      for (var k = 0; k < Math.min(upto, N); k++) {
        var band = Math.floor(k / 400); if (band % 2 === 1) continue; // odd bands are silence
        var p = P(k); dot(g, cx + p.x * s, cy - p.y * s, 2.6, band % 4 === 0 ? C.cyan : C.amber);
      }
      var tick = (t / 1000) * 6.2832; g.strokeStyle = C.white; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 40 * Math.sin(tick), cy - 40 * Math.cos(tick)); g.stroke();
    });
    formula(sec, 'keys skipped before a commit = 600 × min(seconds of silence, 1,209,600)\n14 days = 1,209,600 s     so the most ever skipped = 600 × 1,209,600 = <b style="color:' + C.amber + '">725,760,000</b> keys\nskipped keys are never issued: a whole band of radius stays dark');
    para(sec, 'Real totals at the law commit 7a65dd3 (cosmos/wafer-meta.json):');
    formula(sec, '  43,486,619,138  issued keys (lines of work)\n+ 16,150,451,400  silent keys (dark rings)\n= <b style="color:' + C.amber + '">59,637,070,538</b>  address space = KuiperLaw SPACE ' + (window.KuiperLaw && window.KuiperLaw.constants && window.KuiperLaw.constants.SPACE === 59637070538 ? '(checked: same)' : '') + '\nsilence share 27.08%     rim radius √(59,637,070,538.5) = 244,207.02');
    para(sec, 'The live repo has moved on since (commit ab5a696, 4 Oct 22:45): 43,710,819,042 + 16,170,333,600 = 59,881,152,642 over 11,376 commits in 95 repositories. The law has not changed; only the count grows.', C.blue);
    label(sec, 'TWO COMMITS OF 1,500 LINES, WITH SILENCE BETWEEN (SECONDS)');
    var r1 = row(sec), secs = 4, info;
    button(r1, '−1 s', function () { secs = Math.max(0, secs - 1); pc.redraw(); }, C.blue);
    button(r1, '+1 s', function () { secs = Math.min(30, secs + 1); pc.redraw(); }, C.blue);
    button(r1, '14 days', function () { secs = 1209600; pc.redraw(); }, C.amber);
    button(r1, '30 days', function () { secs = 2592000; pc.redraw(); }, C.amber);
    var pc = proofCanvas(sec, state.proofH, function () {
      var f = fit(pc.cv), g = f.g, w = f.w, h = f.h; g.clearRect(0, 0, w, h);
      var gap = 600 * Math.min(secs, 1209600), A = 1500, cx = w / 2, cy = h / 2;
      var big = gap > 40000, shownGap = big ? 30000 : gap; // a big gap is drawn shortened, and says so
      var N = A + shownGap + A, s = Math.min(w, h) / 2 / Math.sqrt(N) * 0.92;
      for (var k = 0; k < A; k++) { var p = P(k); dot(g, cx + p.x * s, cy - p.y * s, 1.8, C.cyan); }
      for (var j = 0; j < A; j++) { var k2 = A + gap + j, q = P(k2), sc = big ? Math.sqrt(A + shownGap + j + 0.5) / q.r : 1; dot(g, cx + q.x * s * sc, cy - q.y * s * sc, 1.8, C.amber); }
      g.setLineDash([6, 6]); g.strokeStyle = C.white; g.lineWidth = 2;
      [Math.sqrt(A + 0.5), Math.sqrt(A + shownGap + 0.5)].forEach(function (r) { g.beginPath(); g.arc(cx, cy, r * s, 0, 6.2832); g.stroke(); });
      g.setLineDash([]);
      if (gap > 0) { var rm = (Math.sqrt(A + 0.5) + Math.sqrt(A + shownGap + 0.5)) / 2 * s; dimLine(g, w - 20, 40, cx + rm * 0.7071, cy - rm * 0.7071, C.white); txt(g, 'DARK RING', w - 20, 24, C.white, 24, 'right'); }
      txt(g, secs + ' s', 16, 26, C.amber, 28); if (big) txt(g, 'gap drawn shortened', 16, h - 22, C.blue, 24);
      info.innerHTML = 'silence ' + fmt(secs) + ' s' + (secs > 1209600 ? ' (capped at 1,209,600 s)' : '') + '  →  skipped keys = 600 × ' + fmt(Math.min(secs, 1209600)) + ' = <b style="color:' + C.amber + '">' + fmt(gap) + '</b>\nfirst commit keys 0 to 1,499; second commit starts at key ' + fmt(A + gap) + '\ndark ring from r = ' + fx(Math.sqrt(A + 0.5), 3) + ' to r = ' + fx(Math.sqrt(A + gap + 0.5), 3);
    });
    info = formula(sec, '');
  }

  // ================================================================ CHAPTER 6: proofs and receipts
  function ch6(body) {
    var sec = chapter(body, 6, 'Proofs: the receipts', 'Checked by machine, and you can check again.');
    hero(sec, state.heroH, function (g, w, h, t) { // a big tick draws itself, then a zero stamp lands
      var cx = w / 2, cy = h / 2, u = Math.min(w, h) * 0.3, a = (t / 2500) % 1.3;
      g.strokeStyle = C.green; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath();
      var p1 = [cx - u, cy], p2 = [cx - u * 0.3, cy + u * 0.7], p3 = [cx + u * 1.1, cy - u * 0.8], q = Math.min(1, a * 1.5);
      g.moveTo(p1[0], p1[1]);
      if (q < 0.4) g.lineTo(p1[0] + (p2[0] - p1[0]) * q / 0.4, p1[1] + (p2[1] - p1[1]) * q / 0.4);
      else { g.lineTo(p2[0], p2[1]); var r = (q - 0.4) / 0.6; g.lineTo(p2[0] + (p3[0] - p2[0]) * r, p2[1] + (p3[1] - p2[1]) * r); }
      g.stroke(); g.lineCap = 'butt';
      if (a > 0.7) { var z = Math.min(1, (a - 0.7) * 4); txt(g, '0', cx + u * 1.5, cy + u * 0.5, 'rgba(255,176,0,' + z + ')', 40 + 60 * z, 'center'); }
    });
    formula(sec, 'kuiper-law.receipt.json (Fidelity gate)\n  11,000,008 keys: live keyPlace (run from the text of index.html) vs kuiper-law.js\n  differences: <b style="color:' + C.green + '">0</b>     max radius diff 5.8 × 10<sup>-11</sup>     max turns diff 2.2 × 10<sup>-16</sup>\n  CuPy GPU (uint64 law): 10,000,001 + 1,000,000 keys, 0 mismatches, identical SHA-256 of m\n  14 quoted live lines checked, 0 wrong\n  visual gate: game on live 0.942 upright vs 0.138 mirrored (direction proven)\n  the GPU view itself rounds in float32: up to 0.099 units at key 59,082,588,229 (not a mismatch)');
    formula(sec, 'scale-logic.receipt.json (KuiperScale, Node v24)\n  exactness: 1,100,001 keys vs KuiperLaw.place, max difference <b style="color:' + C.green + '">0</b>; BigInt path 20,000 of 20,000\n  pick(): 10,000 of 10,000 at N = 10<sup>9</sup>; exact clicks 2,000 of 2,000 at 9 × 10<sup>15</sup>\n  visibleKeys vs brute force: 20 of 20, 12 of 12, 6 of 6 windows exact\n  fuzz: 10,000 broken parameter sets, 0 throws');
    label(sec, 'RUN A CHECK HERE, NOW, IN THIS BROWSER');
    var r1 = row(sec), res = null, info;
    var pc = proofCanvas(sec, Math.round(state.proofH * 0.6), function () {
      var f = fit(pc.cv), g = f.g, w = f.w, h = f.h; g.clearRect(0, 0, w, h);
      var cols = 40, rows = 8, cw = (w - 20) / cols, ch = (h - 20) / rows, done = res ? res.cells : 0;
      for (var i = 0; i < cols * rows; i++) { g.fillStyle = i < done ? (res.bad ? '#ff4040' : C.green) : C.dim; g.fillRect(10 + (i % cols) * cw + 2, 10 + Math.floor(i / cols) * ch + 2, cw - 4, ch - 4); }
    });
    button(r1, 'CHECK 320,000 KEYS', function () {
      var seed = 12345, rnd = function () { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      res = { cells: 0, bad: 0, n: 0, t0: performance.now(), scaleBad: 0 };
      var S = window.KuiperScale;
      (function chunk() {
        if (!state) return;
        for (var c = 0; c < 8; c++) {
          for (var i = 0; i < 1000; i++) {
            var k = res.cells < 160 ? res.cells * 1000 + i : Math.floor(rnd() * 59637070538);
            var p = P(k); if (p.m !== mExact(k) || p.r !== Math.sqrt(k + 0.5)) res.bad++;
            if (S && (i % 10 === 0)) { var s = S.place(k); if (s.x !== p.x || s.y !== p.y) res.scaleBad++; }
            res.n++;
          }
          res.cells++;
        }
        pc.redraw();
        info.innerHTML = 'keys checked ' + fmt(res.n) + '  (0 to 159,999, then random up to 59,637,070,537)\nKuiperLaw.place m vs BigInt exact: <b style="color:' + (res.bad ? '#ff4040' : C.green) + '">' + res.bad + ' differences</b>\nKuiperScale.place vs KuiperLaw.place (every 10th key): <b style="color:' + (res.scaleBad ? '#ff4040' : C.green) + '">' + res.scaleBad + ' differences</b>\n' + fmt(performance.now() - res.t0) + ' ms';
        if (res.cells < 320) state.timers.push(setTimeout(chunk, 0)); else blip(784, 0.8);
      })();
    }, C.green);
    info = formula(sec, 'press the button');
    label(sec, 'RERUN IT YOURSELF (NODE, IN THIS FOLDER)');
    source(sec, 'node -e "const L=require(\'./kuiper-law.js\'),S=require(\'./scale-logic.js\');let d=0,e=0;\n for(let k=0;k<1e6;k++){const p=L.place(k);\n  if(p.m!==Number(BigInt(k)*2654435769n%4294967296n))d++;\n  const s=S.place(k);if(s.x!==p.x||s.y!==p.y)e++;}\n console.log(\'m diffs\',d,\'scale diffs\',e)"');
    para(sec, 'Expected output: m diffs 0 scale diffs 0. The gate in the receipt goes further: it runs the live keyPlace straight from the text of kuiper-belt index.html, so a change on the live page would show up as differences.', C.blue);
  }

  // ================================================================ CHAPTER 7: addressing comparison
  function hilbert(n, d) { // classic d -> (x, y) on an n x n Hilbert curve, written from the textbook algorithm
    var x = 0, y = 0, t = d;
    for (var s = 1; s < n; s *= 2) {
      var rx = 1 & (t / 2), ry = 1 & (t ^ rx);
      if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } var tmp = x; x = y; y = tmp; }
      x += s * rx; y += s * ry; t = Math.floor(t / 4);
    }
    return [x, y];
  }
  function morton(d) { var x = 0, y = 0; for (var b = 0; b < 8; b++) { x |= ((d >> (2 * b)) & 1) << b; y |= ((d >> (2 * b + 1)) & 1) << b; } return [x, y]; }
  function layouts(n) { // 64 keys three ways; units: one key's share of area = 1
    var out = { kuiper: [], hilbert: [], morton: [] }, sc = 1 / Math.sqrt(Math.PI);
    for (var k = 0; k < n; k++) { var p = P(k); out.kuiper.push([p.x * sc, p.y * sc]); out.hilbert.push(hilbert(8, k)); out.morton.push(morton(k)); }
    return out;
  }
  function meanStep(a) { var s = 0, mx = 0; for (var i = 1; i < a.length; i++) { var d = Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]); s += d; mx = Math.max(mx, d); } return [s / (a.length - 1), mx]; }
  function ch7(body) {
    var sec = chapter(body, 7, 'Kuiper beside H3, S2, Hilbert and Morton', 'Spiral keeps time; snakes keep nearness.');
    var L = layouts(64);
    hero(sec, state.heroH, function (g, w, h, t) { // the same 64 keys walked three ways, a light runs along each path
      var names = ['kuiper', 'hilbert', 'morton'], cols = [C.cyan, C.green, C.amber], cw = w / 3, k = Math.floor(t / 120) % 64;
      names.forEach(function (nm, i) {
        var pts = L[nm], s, ox, oy;
        if (nm === 'kuiper') { s = Math.min(cw, h) / 10; ox = cw * i + cw / 2; oy = h / 2; } else { s = Math.min(cw, h) / 9.5; ox = cw * i + cw / 2 - 3.5 * s; oy = h / 2 + 3.5 * s; }
        g.strokeStyle = cols[i]; g.globalAlpha = 0.35; g.lineWidth = 2; g.beginPath();
        pts.forEach(function (q, j) { var X = ox + q[0] * s, Y = oy - q[1] * s; if (j) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); g.globalAlpha = 1;
        pts.forEach(function (q, j) { dot(g, ox + q[0] * s, oy - q[1] * s, j === k ? 9 : 3.5, j <= k ? cols[i] : C.dim); });
      });
    });
    var ks = meanStep(L.kuiper), hs = meanStep(L.hilbert), ms = meanStep(L.morton);
    formula(sec, 'mean jump from key k to key k + 1 (64 keys, one key\'s area = 1, measured now):\n  Kuiper  <b style="color:' + C.cyan + '">' + fx(ks[0], 2) + '</b>   (max ' + fx(ks[1], 2) + ')   time order, not nearness\n  Hilbert <b style="color:' + C.green + '">' + fx(hs[0], 2) + '</b>   (max ' + fx(hs[1], 2) + ')   always a neighbour\n  Morton  <b style="color:' + C.amber + '">' + fx(ms[0], 2) + '</b>   (max ' + fx(ms[1], 2) + ')   mostly near, jumps at quadrant edges');
    var tbl = el('div', 'overflow-x:auto;margin:14px 0', null, sec);
    var rows = [
      ['', 'Kuiper', 'H3', 'S2', 'Hilbert / Morton'],
      ['addresses', 'time: the n-th line of work, ever', 'place on Earth', 'place on Earth', 'a cell of any square grid'],
      ['key to place', '√(k + ½) and k × G mod 2³², one line', 'icosahedron, aperture-7 digits', 'cube faces, Hilbert curve', 'bit interleave or Gray-code turns'],
      ['place to key', 'no closed form; nearest-key search', 'direct', 'direct', 'direct'],
      ['k and k+1 near?', 'no: 222.49° apart', 'partly', 'yes, strongly', 'Hilbert yes; Morton mostly'],
      ['hierarchy / zoom', 'none (radius = time range)', '16 resolutions', '31 levels', 'drop low bits'],
      ['equal area', 'exact: π per key', 'up to about 1.99 : 1, 12 pentagons', 'varies after projection', 'exact on a flat grid'],
      ['append-only, time-ordered', 'yes, only one', 'no', 'no', 'no'],
      ['cost per address', '3 multiplies, 1 sqrt, sin, cos, no tables', 'dozens of ops and tables', 'dozens of ops', 'a few dozen bit ops'],
      ['licence', 'owner\'s own law, his repo', 'Apache-2.0, © Uber Technologies', 'Apache-2.0, © Google', 'hilbertcurve MIT © 2017 Gabriel Altay; libmorton MIT © 2016 Jeroen Baert']
    ];
    var html = '<table style="border-collapse:collapse;font:bold 24px ' + FONT + ';min-width:900px">';
    rows.forEach(function (r, i) { html += '<tr>' + r.map(function (c, j) { return '<td style="border:2px solid ' + C.dim + ';padding:8px 10px;vertical-align:top;color:' + (i === 0 ? C.amber : (j === 0 ? C.blue : (j === 1 ? C.cyan : C.white))) + '">' + c + '</td>'; }).join('') + '</tr>'; });
    tbl.innerHTML = html + '</table>';
    para(sec, '<b style="color:' + C.green + '">Better:</b> one tiny rule anyone can type; exact equal area, so how far out is how long ago; append-only, so a dark ring is honest silence; no table, no tree, no library; it runs in a vertex shader at four million points a call (:333-335).');
    para(sec, '<b style="color:' + C.amber + '">Worse:</b> no hierarchy, no zoom-out where dots merge into a parent; no nearness across keys (a commit\'s lines scatter round a ring); no direct inverse from a place to a key; the angle repeats every 2³² keys, so a wafer of billions has rings that rhyme in angle.');
    para(sec, 'The Hilbert and Morton pictures here are drawn by a few lines written in this file from the public textbook algorithms; no H3, S2, hilbertcurve or libmorton code is used. If their code is ever reused, the attribution lines are: "Uses H3 (c) Uber Technologies, Inc., Apache License 2.0"; "Uses S2 Geometry (c) Google Inc., Apache License 2.0"; "hilbertcurve (c) Gabriel Altay, MIT License"; "libmorton (c) Jeroen Baert, MIT License". Source: study/OPEN-ENGINES.md.', C.blue);
  }

  // ================================================================ CHAPTER 8: references
  function ch8(body) {
    var sec = chapter(body, 8, 'References', 'Where every piece comes from.');
    hero(sec, Math.round(state.heroH * 0.8), function (g, w, h, t) { // stars twinkle into a sunflower
      var cx = w / 2, cy = h / 2, N = 900, s = Math.min(w, h) / 2 / Math.sqrt(N) * 0.95;
      for (var k = 0; k < N; k++) { var p = P(k), tw = 0.5 + 0.5 * Math.sin(t / 400 + k * 0.7); g.globalAlpha = 0.3 + 0.7 * tw; dot(g, cx + p.x * s, cy - p.y * s, 1.5 + 2 * tw, k % 3 ? C.cyan : C.white); }
      g.globalAlpha = 1;
    });
    var refs = [
      'H. Vogel (1979). A better way to construct the sunflower head. <i>Mathematical Biosciences</i> 44 (3-4): 179-189. The √n radius and the golden angle 137.5°.',
      'The live Kuiper: <a style="color:' + C.cyan + '" href="https://ventusltd.github.io/kuiper-belt/" target="_blank" rel="noopener">ventusltd.github.io/kuiper-belt</a>',
      'The repository: <a style="color:' + C.cyan + '" href="https://github.com/Ventusltd/kuiper-belt" target="_blank" rel="noopener">github.com/Ventusltd/kuiper-belt</a>, index.html @ 7a65dd315b0c60b1baf9a7090206c900b2cfd0a1, lines 79, 92, 143-148, 250-251, 333-335, 357; tools/wafer_keys.py (600 keys per second, 14-day cap, writes cosmos/wafer-meta.json at :80); cosmos/wafer-meta.json.',
      'D. E. Knuth, <i>The Art of Computer Programming</i>, Vol. 3, Sorting and Searching, section 6.4: multiplicative (Fibonacci) hashing with a multiplier near 2³²/φ.',
      'Learn the Kuiper receipts: kuiper-law.receipt.json, scale-logic.receipt.json, scale-logic.md, study/OPEN-ENGINES.md (licences read from each project\'s own licence file).',
      'Uber H3 (Apache-2.0), Google S2 Geometry (Apache-2.0), hilbertcurve (MIT, Gabriel Altay), libmorton (MIT, Jeroen Baert): compared, not used.'
    ];
    var ol = el('ol', 'font-size:26px;line-height:1.5;color:' + C.white + ';padding-left:36px', null, sec);
    refs.forEach(function (r) { el('li', 'margin:10px 0', r, ol); });
  }

  // ---------------------------------------------------------------- the loop: animate only heroes that are on screen
  function loop(now) {
    if (!state) return;
    state.heroes.forEach(function (it) {
      if (!it.visible) return;
      var f = fit(it.cv); f.g.clearRect(0, 0, f.w, f.h);
      try { it.draw(f.g, f.w, f.h, now - state.t0); } catch (e) { /* keep animating the rest */ }
      drawTaps(f.g, it, now);
    });
    state.raf = requestAnimationFrame(loop);
  }

  function open(host) {
    if (state) close();
    var phone = Math.min(window.innerWidth, host.clientWidth || window.innerWidth) < 700;
    state = { host: host, heroes: [], proofs: [], timers: [], muted: false, note: 0, ac: null, t0: performance.now(),
      btn: phone ? 56 : 72, heroH: phone ? 260 : 340, proofH: phone ? 380 : 460 };
    var root = el('div', 'position:absolute;inset:0;background:#000;color:#fff;font-family:' + FONT + ';font-weight:bold;overflow:hidden', null, host);
    root.className = 'kg-deep';
    state.root = root;
    var bar = el('div', 'position:absolute;left:0;right:0;top:0;height:' + (state.btn + 16) + 'px;display:flex;align-items:center;gap:12px;padding:0 12px;background:#000;border-bottom:2px solid ' + C.dim + ';z-index:2;box-sizing:border-box', null, root);
    el('div', 'font-size:' + (phone ? 28 : 36) + 'px;color:' + C.cyan + ';flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis', 'DEEP <span style="color:#fff">' + (phone ? '' : ': the maths and the proofs') + '</span>', bar);
    var mute = el('button', 'height:' + state.btn + 'px;min-width:' + state.btn + 'px;padding:0 14px;font:bold 24px ' + FONT + ';background:#001014;color:' + C.green + ';border:3px solid ' + C.green + ';border-radius:10px;cursor:pointer', 'SOUND ON', bar);
    mute.addEventListener('click', function () { state.muted = !state.muted; mute.textContent = state.muted ? 'SOUND OFF' : 'SOUND ON'; mute.style.color = state.muted ? C.amber : C.green; mute.style.borderColor = mute.style.color; });
    var x = el('button', 'width:' + state.btn + 'px;height:' + state.btn + 'px;font:bold ' + (state.btn * 0.6) + 'px ' + FONT + ';line-height:1;background:#000;color:#fff;border:3px solid #fff;border-radius:10px;cursor:pointer;padding:0', '✕', bar);
    x.setAttribute('aria-label', 'Close'); x.className = 'kg-deep-close';
    x.addEventListener('click', function () { close(); });
    var scroll = el('div', 'position:absolute;left:0;right:0;bottom:0;top:' + (state.btn + 16) + 'px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch', null, root);
    state.scroll = scroll;
    var intro = el('div', 'max-width:1100px;margin:20px auto 30px;padding:0 16px', null, scroll);
    el('div', 'font-size:' + (phone ? 34 : 48) + 'px;color:' + C.cyan + ';line-height:1.15', 'Go deep: the maths and the proofs', intro);
    el('div', 'font-size:26px;color:' + C.white + ';margin-top:10px;line-height:1.4', 'Touch the big pictures to hear them. Every proof below is live: it runs the real law, KuiperLaw.place, in this browser.', intro);
    var nav = el('div', 'display:flex;flex-wrap:wrap;gap:8px;margin-top:14px', null, intro);
    if ('IntersectionObserver' in window) {
      state.io = new IntersectionObserver(function (es) { es.forEach(function (e) { state.heroes.forEach(function (it) { if (it.cv === e.target) it.visible = e.isIntersecting; }); }); }, { root: scroll });
    }
    var chapters = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8], secs = [];
    chapters.forEach(function (fn) { var before = scroll.children.length; fn(scroll); secs.push(scroll.children[before]); });
    ['LAW', 'AREA', 'TURN', '2³²', 'DARK', 'PROOF', 'H3 S2', 'REFS'].forEach(function (s, i) {
      var b = el('button', 'min-height:' + state.btn + 'px;padding:0 16px;font:bold 24px ' + FONT + ';background:#001014;color:' + C.cyan + ';border:2px solid ' + C.cyan + ';border-radius:10px;cursor:pointer', (i + 1) + ' ' + s, nav);
      b.addEventListener('click', function () { secs[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); blip(SCALE[i], 0.3); });
    });
    state.onKey = function (e) {
      if (e.key !== 'Escape' || !state) return;
      var a = document.activeElement;
      if (a && a !== document.body && state.root.contains(a)) { a.blur(); return; }
      close();
    };
    document.addEventListener('keydown', state.onKey); // bubble phase on document, never capture on window
    state.onResize = function () { state.proofs.forEach(function (p) { p.redraw(); }); };
    window.addEventListener('resize', state.onResize);
    state.proofs.forEach(function (p) { p.redraw(); });
    state.raf = requestAnimationFrame(loop);
  }

  function close() {
    if (!state) return;
    var s = state; state = null;
    cancelAnimationFrame(s.raf);
    s.timers.forEach(clearTimeout);
    document.removeEventListener('keydown', s.onKey);
    window.removeEventListener('resize', s.onResize);
    if (s.io) s.io.disconnect();
    if (s.ac) { try { s.ac.close(); } catch (e) { } }
    if (s.root && s.root.parentNode) s.root.parentNode.removeChild(s.root);
    try { s.host.dispatchEvent(new CustomEvent('kgmodule:close', { bubbles: true, detail: { id: 'deep' } })); } catch (e) { }
  }

  (window.KGModules = window.KGModules || []).push({
    id: 'deep', label: 'DEEP', sentence: 'Go deep: the maths and the proofs',
    open: open, close: close,
    _test: { hilbert: hilbert, morton: morton, mExact: mExact, isOpen: function () { return !!state; } }
  });
})();
