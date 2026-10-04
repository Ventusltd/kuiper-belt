// strings.js  SOLAR STRINGS: place a generic solar farm with Kuiper keys.
// Owner: Opus 5 (DC strings). Plug-in shape per MODULE-CONTRACT.md. No build step, works from file:// and offline.
// GENERIC ONLY: a textbook block, no real site, no real design. Every wafer position comes from window.KuiperLaw.place.
(function () {
  'use strict';
  var C = { bg: '#000', cyan: '#00ffff', blue: '#66ccff', amber: '#ffb000', green: '#22ee77', white: '#ffffff', dim: '#1d3a48', spare: '#333' };
  var FONT = 'bold {S}px "Segoe UI", Arial, sans-serif';
  function font(s) { return FONT.replace('{S}', s); }

  // generic, illustrative module and system values (textbook style, NOT a design, NOT any product)
  var MOD = { W: 480, Voc: 45.0, Vmp: 37.5, Isc: 13.5, Imp: 12.8, betaVoc: -0.0028, Tmin: -10, Vsys: 1500 };

  var LIMITS = { strings: [1, 480], pps: [1, 40], spc: [1, 32], cpi: [1, 16] };

  // ---------- the plan: every component gets a permanent key ----------
  // Key 0 is the transformer. Each inverter owns one fixed SLOT of keys (a contiguous range), followed by a quiet GAP of
  // unused keys. Inside a slot: inverter key, then for each combiner its key, then for each string its key and its panels.
  // Adding a string fills the next place in order; no existing key moves.
  function plan(p) {
    var perString = 1 + p.pps, perComb = 1 + p.spc * perString, used = 1 + p.cpi * perComb;
    var slot = Math.ceil(used * 1.1 / 100) * 100;      // 10% headroom, rounded to a hundred for people reading keys
    var gap = Math.max(50, Math.round(slot * 0.15 / 10) * 10);
    var perInv = p.spc * p.cpi, nInv = Math.ceil(p.strings / perInv);
    var items = [], byKey = {};
    function add(o) { o.pos = window.KuiperLaw.place(o.key); items.push(o); byKey[o.key] = o; return o; }
    var tx = add({ type: 'tx', key: 0, label: 'TX', inv: -1, comb: -1, str: -1 });
    var invs = [], combs = [], strs = [];
    var s = 0;
    for (var i = 0; i < nInv; i++) {
      var base = 100 + i * (slot + gap);
      var inv = add({ type: 'inv', key: base, label: 'INV' + (i + 1), inv: i, comb: -1, str: -1, start: base, end: base + slot - 1, gapEnd: base + slot + gap - 1 });
      invs.push(inv);
      for (var c = 0; c < p.cpi && s < p.strings; c++) {
        var ck = base + 1 + c * perComb;
        var cb = add({ type: 'comb', key: ck, label: 'CB' + (combs.length + 1), inv: i, comb: combs.length, str: -1 });
        combs.push(cb);
        for (var t = 0; t < p.spc && s < p.strings; t++, s++) {
          var sk = ck + 1 + t * perString;
          var st = add({ type: 'str', key: sk, label: 'S' + (s + 1), inv: i, comb: cb.comb, str: s, panels: [] });
          strs.push(st);
          for (var m = 0; m < p.pps; m++) st.panels.push(add({ type: 'pan', key: sk + 1 + m, label: 'P' + (m + 1), inv: i, comb: cb.comb, str: s }).key);
        }
      }
    }
    var lastInv = invs[invs.length - 1];
    return { p: p, items: items, byKey: byKey, tx: tx, invs: invs, combs: combs, strs: strs, slot: slot, gap: gap,
             perString: perString, perComb: perComb, used: used, maxKey: lastInv ? lastInv.gapEnd : 100,
             panels: p.strings * p.pps, keysUsed: items.length, reserved: 100 + nInv * slot };
  }

  var S = null; // live state while open

  function el(tag, css, parent, text) {
    var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e;
  }

  // ---------- sound: WebAudio only after the first gesture, soft ----------
  function note(f, dur, vol) {
    if (!S || S.muted) return;
    try {
      if (!S.ac) S.ac = new (window.AudioContext || window.webkitAudioContext)();
      var ac = S.ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol || 0.06, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, t + (dur || 0.35));
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (dur || 0.35) + 0.05);
    } catch (e) {}
  }
  var SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0];
  function chime(n, up) { var f = SCALE[n % SCALE.length] * (n >= SCALE.length ? 2 : 1); note(f, 0.4, 0.06); if (up && S) { var own = S; own.timers.push(setTimeout(function () { if (S === own) note(f * 1.5, 0.3, 0.04); }, 90)); } }

  // ---------- open ----------
  // Layout rule (contract 23:02): the wafer fills the whole screen; a few dim outline buttons float at the edges;
  // BUILD (the four numbers and totals) and DRAWING (the single-line layout) open as bottom sheets; WHY is a popup.
  var CSS = '.kgs-b{font:bold 26px "Segoe UI",Arial,sans-serif;background:transparent;color:rgba(0,255,255,0.75);' +
    'border:2px solid rgba(0,255,255,0.45);border-radius:14px;cursor:pointer;height:var(--bh);min-width:var(--bh);padding:0 14px;' +
    'flex:0 0 auto;line-height:1;transition:color .2s,border-color .2s}' +
    '.kgs-b:hover,.kgs-b:active,.kgs-b.on{color:#00ffff;border-color:#00ffff}' +
    '.kgs-s{font:bold 40px "Segoe UI",Arial,sans-serif;padding:0;width:var(--bh)}' +
    '.kgs-cap{transition:opacity 1.2s}';
  function open(host) {
    if (S) close();
    S = { host: host, p: { strings: 24, pps: 30, spc: 12, cpi: 2 }, sel: null, muted: false, ac: null, born: {}, raf: 0, timers: [], why: false, sheet: null, capT: 0 };
    host.innerHTML = '';
    host.style.background = C.bg; host.style.color = C.white; host.style.fontFamily = '"Segoe UI", Arial, sans-serif';
    host.style.overflow = 'hidden';
    el('style', null, host, CSS);
    var root = el('div', 'position:absolute;inset:0;font-weight:bold;user-select:none', host);
    S.root = root;
    // the circle, edge to edge
    S.cvW = el('canvas', 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block', root);

    // top: one caption line (fades back), mute, X
    S.cap = el('div', 'position:absolute;left:calc(14px + env(safe-area-inset-left));top:calc(18px + env(safe-area-inset-top));right:170px;font-size:28px;color:' + C.cyan + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;text-shadow:0 0 6px #000', root);
    S.cap.className = 'kgs-cap';
    var tr = el('div', 'position:absolute;right:calc(8px + env(safe-area-inset-right));top:calc(8px + env(safe-area-inset-top));display:flex;gap:8px', root);
    S.muteBtn = el('button', null, tr, '♫'); S.muteBtn.className = 'kgs-b kgs-s'; S.muteBtn.style.fontSize = '30px'; S.muteBtn.title = 'sound on / off';
    S.xBtn = el('button', 'height:72px;width:72px;font-size:40px;padding:0', tr, '✕'); S.xBtn.className = 'kgs-b'; S.xBtn.title = 'close';

    // bottom: one row. Toddler -/+ (more or fewer strings) at the corners, BUILD / DRAWING / WHY in the middle
    var bot = el('div', 'position:absolute;left:calc(8px + env(safe-area-inset-left));right:calc(8px + env(safe-area-inset-right));bottom:calc(8px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:space-between;gap:6px', root);
    S.bot = bot;
    S.fMinus = el('button', null, bot, '−'); S.fMinus.className = 'kgs-b kgs-s'; S.fMinus.setAttribute('data-f', '-1'); S.fMinus.title = 'fewer strings';
    var mid = el('div', 'display:flex;gap:6px;min-width:0', bot);
    S.buildBtn = el('button', null, mid, 'BUILD'); S.buildBtn.className = 'kgs-b';
    S.drawBtn = el('button', null, mid, 'DRAWING'); S.drawBtn.className = 'kgs-b';
    S.whyBtn = el('button', null, mid, 'WHY'); S.whyBtn.className = 'kgs-b';
    S.fPlus = el('button', null, bot, '+'); S.fPlus.className = 'kgs-b kgs-s'; S.fPlus.setAttribute('data-f', '1'); S.fPlus.title = 'more strings';
    [S.fMinus, S.fPlus].forEach(function (b) { b.addEventListener('click', function () { setParam('strings', S.p.strings + (+b.getAttribute('data-f'))); flashCap(); }); });

    // the bottom sheet (one at a time): BUILD or DRAWING
    S.sheetEl = el('div', 'position:absolute;left:0;right:0;display:none;background:rgba(0,0,0,0.9);border-top:2px solid rgba(0,255,255,0.35);border-radius:16px 16px 0 0', root);
    S.buildPane = el('div', 'position:absolute;inset:0;padding:8px 12px;overflow:auto;display:flex;flex-direction:column;gap:6px', S.sheetEl);
    S.drawPane = el('div', 'position:absolute;inset:0', S.sheetEl);
    S.cvL = el('canvas', 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block', S.drawPane);
    el('div', 'position:absolute;left:12px;top:6px;font-size:24px;color:' + C.amber + ';pointer-events:none', S.drawPane, 'THE DRAWING');

    S.info = el('div', 'font-size:24px;color:' + C.white + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis', S.buildPane);
    var ctr = el('div', 'display:grid;gap:6px 12px', S.buildPane);
    S.ctr = ctr;
    S.inputs = {};
    [['strings', 'HOW MANY STRINGS', C.cyan], ['pps', 'PANELS PER STRING', C.blue], ['spc', 'STRINGS PER COMBINER', C.amber], ['cpi', 'COMBINERS PER INVERTER', C.green]].forEach(function (d) {
      var cell = el('div', 'display:flex;flex-direction:column;min-width:0', ctr);
      el('div', 'font-size:24px;color:' + d[2] + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis', cell, d[1]);
      var row = el('div', 'display:flex;align-items:center;gap:6px', cell);
      var minus = el('button', null, row, '−'); minus.className = 'kgs-b kgs-s'; minus.setAttribute('data-k', d[0]); minus.setAttribute('data-d', '-1');
      var inp = el('input', 'font:' + font(32) + ';width:0;flex:1 1 auto;min-width:40px;height:var(--bh);box-sizing:border-box;text-align:center;background:transparent;color:#fff;border:2px solid ' + C.dim + ';border-radius:10px', row);
      inp.type = 'text'; inp.inputMode = 'numeric'; inp.value = S.p[d[0]]; inp.setAttribute('data-k', d[0]);
      var plus = el('button', null, row, '+'); plus.className = 'kgs-b kgs-s'; plus.setAttribute('data-k', d[0]); plus.setAttribute('data-d', '1');
      S.inputs[d[0]] = inp;
      minus.addEventListener('click', onStep); plus.addEventListener('click', onStep);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { commit(inp); inp.blur(); } else if (e.key === 'Escape') { inp.value = S.p[d[0]]; inp.blur(); e.stopPropagation(); } });
      inp.addEventListener('change', function () { commit(inp); });
    });
    S.tot = el('div', 'font-size:24px;color:' + C.green + ';line-height:1.25', S.buildPane);
    var leg = el('div', 'font-size:24px;display:flex;flex-wrap:wrap;gap:4px 16px', S.buildPane);
    [['TRANSFORMER', C.white], ['INVERTER', C.green], ['COMBINER', C.amber], ['STRING', C.cyan], ['PANEL', C.blue]].forEach(function (l) { el('span', 'color:' + l[1], leg, '● ' + l[0]); });

    // WHY popup
    S.whyPane = el('div', 'position:absolute;inset:calc(88px + env(safe-area-inset-top)) 10px calc(88px + env(safe-area-inset-bottom)) 10px;background:rgba(0,0,0,0.94);border:2px solid rgba(255,176,0,0.6);border-radius:14px;overflow:auto;padding:14px 18px;font-size:24px;font-weight:normal;line-height:1.35;display:none;user-select:text', host);

    function sheet(name) {
      S.sheet = S.sheet === name ? null : name;
      S.sheetEl.style.display = S.sheet ? 'block' : 'none';
      S.buildPane.style.display = S.sheet === 'build' ? 'flex' : 'none';
      S.drawPane.style.display = S.sheet === 'draw' ? 'block' : 'none';
      S.buildBtn.classList.toggle('on', S.sheet === 'build'); S.drawBtn.classList.toggle('on', S.sheet === 'draw');
      note(S.sheet ? 440 : 330, 0.25, 0.04); layout();
    }
    S.buildBtn.addEventListener('click', function () { sheet('build'); });
    S.drawBtn.addEventListener('click', function () { sheet('draw'); });
    S.whyBtn.addEventListener('click', function () { S.why = !S.why; S.whyPane.style.display = S.why ? 'block' : 'none'; S.whyBtn.classList.toggle('on', S.why); if (S.why) fillWhy(); note(392, 0.3); });
    S.muteBtn.addEventListener('click', function () { S.muted = !S.muted; S.muteBtn.style.opacity = S.muted ? 0.35 : 1; S.muteBtn.textContent = S.muted ? '×' : '♫'; });
    S.xBtn.addEventListener('click', function () { var h = S && S.host; close(); if (h) h.dispatchEvent(new CustomEvent('kgclose', { bubbles: true, detail: { id: 'strings' } })); });

    S.onKey = function (e) {
      if (e.key !== 'Escape') return;
      var a = document.activeElement;
      if (a && a.tagName === 'INPUT') { a.blur(); return; }
      if (S.why) { S.whyBtn.click(); return; }
      if (S.sheet) { sheet(S.sheet); return; }
      S.xBtn.click();
    };
    window.addEventListener('keydown', S.onKey);   // bubble phase only, never capture
    S.onResize = function () { layout(); draw(); };
    window.addEventListener('resize', S.onResize);
    S.cvW.addEventListener('pointerdown', function (e) { pickWafer(e); });
    S.cvL.addEventListener('pointerdown', function (e) { pickLayout(e); });

    rebuild(true);
    layout();
    flashCap();
    loop();
  }
  // captions are few and fade back after a few seconds
  function flashCap() {
    if (!S) return;
    S.cap.style.opacity = 1;
    clearTimeout(S.capT);
    S.capT = setTimeout(function () { if (S) S.cap.style.opacity = 0.3; }, 3500);
    S.timers.push(S.capT);
  }

  function onStep(e) {
    var b = e.currentTarget, k = b.getAttribute('data-k'), d = +b.getAttribute('data-d');
    setParam(k, S.p[k] + d);
  }
  function commit(inp) { var v = parseInt(inp.value, 10); if (isFinite(v)) setParam(inp.getAttribute('data-k'), v); else inp.value = S.p[inp.getAttribute('data-k')]; }
  function setParam(k, v) {
    var L = LIMITS[k]; v = Math.max(L[0], Math.min(L[1], Math.round(v)));
    var up = v > S.p[k];
    if (v === S.p[k]) { S.inputs[k].value = v; note(150, 0.15, 0.04); return; }
    S.p[k] = v; S.inputs[k].value = v;
    rebuild(false);
    chime(k === 'strings' ? S.plan.strs.length : v, up);
  }

  function rebuild(first) {
    var old = S.plan, now = performance.now();
    S.plan = plan(S.p);
    // new keys "pop" in: anything not present before
    S.born = {};
    if (!first && old) S.plan.items.forEach(function (o) { if (!old.byKey[o.key] || old.byKey[o.key].type !== o.type) S.born[o.key] = now; });
    if (S.sel) { var it = S.plan.byKey[S.sel.key]; if (!it || it.type !== S.sel.type) S.sel = null; }
    S.waferCam = null;
    updateText();
    if (S.why) fillWhy();
  }

  function word(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }

  function updateText() {
    var P = S.plan, p = S.p;
    var vocCold = p.pps * MOD.Voc * (1 + MOD.betaVoc * (MOD.Tmin - 25));
    var over = vocCold > MOD.Vsys;
    S.tot.innerHTML = '';
    var line1 = el('div', 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis', S.tot,
      S.phone ? fmt(P.panels) + ' panels, ' + word(P.strs.length, 'string') + ', ' + P.combs.length + ' CB, ' + P.invs.length + ' INV, 1 TX'
              : fmt(P.panels) + ' panels, ' + word(P.strs.length, 'string') + ', ' + word(P.combs.length, 'combiner') + ', ' + word(P.invs.length, 'inverter') + ', 1 transformer');
    var line2 = el('div', 'color:' + C.cyan + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis', S.tot,
      S.phone ? fmt(P.keysUsed) + ' keys, 0 to ' + fmt(P.maxKey) + ', ' + word(P.invs.length, 'dark ring')
              : fmt(P.keysUsed) + ' keys used, keys 0 to ' + fmt(P.maxKey) + ', ' + word(P.invs.length, 'quiet gap') + ' (dark rings)');
    var line3 = el('div', 'color:' + (over ? C.amber : C.blue) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis', S.tot,
      (over ? 'TOO LONG for 1500 V: ' : 'string ') + Math.round(vocCold) + ' V cold, ' + (P.panels * MOD.W / 1e6).toFixed(2) + ' MWp' + (S.phone ? '' : ' (illustrative)'));
    S.cap.textContent = S.sel ? (S.phone ? S.sel.label + ' key ' + S.sel.key : selCaption()) : (S.phone ? fmt(P.strs.length) + ' strings, ' + fmt(P.panels) + ' panels' : 'SOLAR STRINGS: ' + fmt(P.strs.length) + ' strings, ' + fmt(P.panels) + ' panels, every one has a key');
    flashCap();
    if (S.phone) { S.info.textContent = S.sel ? S.sel.label + ' key ' + S.sel.key + ': r ' + S.sel.pos.r.toFixed(2) + ', turn ' + S.sel.pos.turns.toFixed(4) : fmt(P.used) + ' keys per inverter. Tap any part.'; return; }
    S.info.textContent = S.sel ? selInfo() : 'keys = 1 + ' + p.cpi + ' x (1 + ' + p.spc + ' x (1 + ' + p.pps + ')) = ' + fmt(P.used) + ' per inverter, slot ' + fmt(P.slot) + ' + gap ' + P.gap + '. Tap any part.';
  }
  function selCaption() { var o = S.sel; return { tx: 'THE TRANSFORMER, key 0', inv: o.label + ': ', comb: o.label + ': ', str: o.label + ': ', pan: 'PANEL ' }[o.type] + (o.type === 'tx' ? '' : o.type === 'pan' ? o.key : 'keys ' + rangeOf(o)[0] + ' to ' + rangeOf(o)[1]); }
  function selInfo() {
    var o = S.sel, q = o.pos;
    return o.label + ' key ' + o.key + ': r = sqrt(' + o.key + ' + 0.5) = ' + q.r.toFixed(2) + ', turn = frac(' + o.key + ' x 0.6180339887) = ' + q.turns.toFixed(4) + ' (' + q.deg.toFixed(1) + ' deg)';
  }
  // the contiguous key range owned by a component (itself plus everything under it)
  function rangeOf(o) {
    var P = S.plan;
    if (o.type === 'tx') return [0, P.maxKey];
    if (o.type === 'inv') { var last = P.items.filter(function (x) { return x.inv === o.inv; }).pop(); return [o.key, last.key]; }
    if (o.type === 'comb') { var lc = P.items.filter(function (x) { return x.comb === o.comb && x.type !== 'inv'; }).pop(); return [o.key, lc.key]; }
    if (o.type === 'str') return [o.key, o.key + S.p.pps];
    return [o.key, o.key];
  }
  function lit(x) {
    var o = S.sel; if (!o) return false;
    if (o.type === 'tx') return true;
    if (o.type === 'inv') return x.inv === o.inv;
    if (o.type === 'comb') return x.comb === o.comb && x.type !== 'inv';
    if (o.type === 'str') return x.str === o.str;
    return x.key === o.key;
  }
  function select(o) {
    S.sel = (o && S.sel && S.sel.key === o.key) ? null : o;
    if (S.sel) chime({ tx: 0, inv: 2, comb: 4, str: 5, pan: 7 }[S.sel.type] + 2, true); else note(220, 0.2, 0.04);
    updateText();
  }

  // ---------- layout: the circle is full screen; the sheet floats over its lower part ----------
  function layout() {
    var w = S.host.clientWidth || window.innerWidth, h = S.host.clientHeight || window.innerHeight;
    var phone = w < 700;
    S.phone = phone;
    var bh = phone ? 56 : 72;
    S.root.style.setProperty('--bh', bh + 'px');
    S.ctr.style.gridTemplateColumns = phone ? 'repeat(2,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))';
    S.cap.style.fontSize = phone ? '24px' : '28px';
    S.cap.style.right = phone ? '150px' : '170px';
    [S.buildBtn, S.drawBtn, S.whyBtn].forEach(function (b) { b.style.padding = phone ? '0 5px' : '0 18px'; b.style.fontSize = phone ? '24px' : '26px'; });
    S.drawBtn.textContent = phone ? 'DRAW' : 'DRAWING';
    S.botH = bh + 16;
    var sh = S.sheet ? Math.round(Math.min(h * (phone ? 0.44 : 0.42), S.sheet === 'build' ? (phone ? 380 : 330) : 9999)) : 0;
    S.sheetH = sh;
    S.sheetEl.style.bottom = S.botH + 'px'; S.sheetEl.style.height = sh + 'px';
    if (S.plan) updateText();
    [S.cvW, S.cvL].forEach(function (cv) {
      var r = cv.getBoundingClientRect(), d = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d)); cv._d = d; cv._w = r.width; cv._h = r.height;
    });
    S.waferCam = null;
  }

  // ---------- the wafer view: every key at KuiperLaw.place ----------
  // the canvas is the whole screen; the circle is framed in the free area between the caption and the buttons / sheet
  function waferCam() {
    var cv = S.cvW, P = S.plan;
    var R = Math.sqrt(P.maxKey + 0.5) * 1.04;
    var top = S.phone ? 70 : 86, bot = S.botH + (S.sheetH || 0) + 6, hh = Math.max(60, cv._h - top - bot);
    var z = Math.min(cv._w - 16, hh) / 2 / R;
    return { cx: 0, cy: 0, zoom: z, W: cv._w, H: 2 * (top + hh / 2) };
  }
  var TYPE = { tx: [C.white, 7], inv: [C.green, 6], comb: [C.blue, 4.5], str: [C.cyan, 3], pan: [C.cyan, 1.6] };   // cyan = live wafer keys; amber is kept for the selection
  function drawWafer(now) {
    var cv = S.cvW, g = cv.getContext('2d'), d = cv._d, P = S.plan;
    var cam = S.waferCam || (S.waferCam = waferCam());
    g.setTransform(d, 0, 0, d, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, cv._w, cv._h);
    var ox = cam.W / 2, oy = cam.H / 2, z = cam.zoom;
    // slots (reserved) as faint rings, quiet gaps as dark rings with dashed edges
    P.invs.forEach(function (inv, i) {
      var r0 = Math.sqrt(inv.start) * z, r1 = Math.sqrt(inv.end + 1) * z, r2 = Math.sqrt(inv.gapEnd + 1) * z;
      g.beginPath(); g.arc(ox, oy, (r0 + r1) / 2, 0, 7); g.lineWidth = Math.max(1, r1 - r0); g.strokeStyle = (S.sel && S.sel.type !== 'pan' && S.sel.inv === i) ? 'rgba(34,238,119,0.10)' : 'rgba(102,204,255,0.04)'; g.stroke();
      g.setLineDash([4, 5]); g.lineWidth = 1; g.strokeStyle = 'rgba(255,176,0,0.45)';
      g.beginPath(); g.arc(ox, oy, r1, 0, 7); g.stroke(); g.beginPath(); g.arc(ox, oy, r2, 0, 7); g.stroke(); g.setLineDash([]);
    });
    var k = Math.max(0.55, Math.min(1.6, 2.2 / Math.sqrt(Math.max(1, z * z) / 4 + 0.6)));
    var dotScale = Math.max(0.5, Math.min(1.6, 0.36 * z * 1.77)) / 1.6;   // one key covers pi world units: spacing ~ 1.77 z
    var any = !!S.sel;
    // panels first, then bigger parts on top
    ['pan', 'str', 'comb', 'inv', 'tx'].forEach(function (t) {
      var col = TYPE[t][0], rad = TYPE[t][1] * (t === 'pan' ? dotScale : 1);
      for (var i = 0; i < P.items.length; i++) {
        var o = P.items[i]; if (o.type !== t) continue;
        var x = ox + o.pos.x * z, y = oy - o.pos.y * z;  // world y is UP: flip for the 2D canvas
        var on = any && lit(o), me = any && S.sel === o || (any && S.sel.key === o.key && S.sel.type === o.type);   // amber only for the selected item; its family stays cyan and bright
        var b = S.born[o.key], pop = b ? Math.max(0, 1 - (now - b) / 700) : 0;
        g.globalAlpha = any && !on ? 0.22 : 1;
        var rr = rad * (on ? 1.5 : 1) * (1 + 1.5 * pop);
        // star look (as zoom.js): a soft halo, a bright core, a white centre when big; amber glow for the selection
        if (rr >= 2 || me) { g.fillStyle = me ? 'rgba(255,176,0,0.32)' : 'rgba(0,255,255,0.14)'; g.beginPath(); g.arc(x, y, rr * 2.4, 0, 7); g.fill(); }
        g.fillStyle = me ? C.amber : col;
        g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
        if (rr >= 3) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x, y, rr * 0.45, 0, 7); g.fill(); }
        if (pop > 0) { g.globalAlpha = pop; g.strokeStyle = C.white; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, rr + 6 * (1 - pop) + 2, 0, 7); g.stroke(); }
      }
    });
    g.globalAlpha = 1;
    // labels for inverters (engineering-drawing callouts), only if room
    g.font = font(24); g.textBaseline = 'middle';
    var maxLab = S.phone ? 3 : 6;
    P.invs.forEach(function (inv, i) {
      if (i >= maxLab && !(S.sel && S.sel.inv === i)) return;
      var x = ox + inv.pos.x * z, y = oy - inv.pos.y * z;
      var a = Math.atan2(y - oy, x - ox), L = 28;
      var tx = x + Math.cos(a) * L, ty = y + Math.sin(a) * L;
      g.strokeStyle = C.green; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = C.green; g.textAlign = tx < x ? 'right' : 'left';
      var tt = ty; tt = Math.max(46, Math.min(cv._h - 14, tt));
      var tX = Math.max(4, Math.min(cv._w - 4, tx));
      g.fillText(inv.label, tX + (tx < x ? -4 : 4), tt);
    });
    // selected component callout
    if (S.sel) {
      var s = S.sel, sx = ox + s.pos.x * z, sy = oy - s.pos.y * z;
      g.strokeStyle = C.white; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, 12, 0, 7); g.stroke();
      g.fillStyle = C.white; g.textAlign = 'left';
      var txt = s.label + '  key ' + s.key;
      var tw = g.measureText(txt).width, lx = Math.min(cv._w - tw - 8, Math.max(8, sx + 16)), ly = Math.max(52, Math.min(cv._h - 16, sy - 20));
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(lx - 4, ly - 15, tw + 8, 30); g.fillStyle = C.white; g.fillText(txt, lx, ly);
    }
    S.waferCamDrawn = { ox: ox, oy: oy, z: z };
  }

  function pickWafer(e) {
    var cv = S.cvW, r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, c = S.waferCamDrawn; if (!c) return;
    // the key nearest the tap: search by radius ring first (r = sqrt(k+0.5)), then by distance on screen
    var best = null, bd = 1e9;
    for (var i = 0; i < S.plan.items.length; i++) {
      var o = S.plan.items[i], x = c.ox + o.pos.x * c.z, y = c.oy - o.pos.y * c.z, dd = (x - px) * (x - px) + (y - py) * (y - py);
      var bias = { tx: 0.25, inv: 0.35, comb: 0.5, str: 0.7, pan: 1 }[o.type];   // big parts are easier to hit
      dd *= bias;
      if (dd < bd) { bd = dd; best = o; }
    }
    if (!best || bd > 40 * 40) { select(null); return; }
    // a tapped panel selects its string, so the string lights in both views
    if (best.type === 'pan') best = S.plan.strs[best.str];
    select(best);
  }

  // ---------- the drawing: a tidy single-line style layout ----------
  function layoutGeom() {
    var cv = S.cvL, P = S.plan, W = cv._w, H = cv._h;
    var top = 40, bot = 34, n = P.strs.length;
    var colS0 = 12, colS1 = W * 0.42, colC = W * 0.55, colI = W * 0.74, colT = W * 0.92;
    var rowH = (H - top - bot) / Math.max(1, n);
    var g = { W: W, H: H, top: top, rowH: rowH, colS0: colS0, colS1: colS1, colC: colC, colI: colI, colT: colT, sy: [], cy: [], iy: [], ty: 0 };
    for (var s = 0; s < n; s++) g.sy.push(top + (s + 0.5) * rowH);
    P.combs.forEach(function (cb) {
      var mine = P.strs.filter(function (st) { return st.comb === cb.comb; });
      g.cy.push((g.sy[mine[0].str] + g.sy[mine[mine.length - 1].str]) / 2);
    });
    P.invs.forEach(function (inv, i) {
      var mine = P.combs.filter(function (cb) { return cb.inv === i; });
      g.iy.push((g.cy[mine[0].comb] + g.cy[mine[mine.length - 1].comb]) / 2);
    });
    g.ty = (top + H - bot) / 2;
    return g;
  }
  function drawLayout(now) {
    var cv = S.cvL, c = cv.getContext('2d'), d = cv._d, P = S.plan, G = layoutGeom();
    S.geom = G;
    c.setTransform(d, 0, 0, d, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, cv._w, cv._h);
    var any = !!S.sel;
    function A(o) { return any && !lit(o) ? 0.25 : 1; }
    c.lineCap = 'round';
    var stroke = Math.max(1, Math.min(3, G.rowH * 0.25));
    // strings: a row of panel boxes ending in a lead to the combiner
    var nPan = S.p.pps, boxes = Math.min(nPan, Math.floor((G.colS1 - G.colS0) / 6));
    P.strs.forEach(function (st, s) {
      var y = G.sy[s], on = any && lit(st), b = S.born[st.key], pop = b ? Math.max(0, 1 - (now - b) / 700) : 0;
      c.globalAlpha = A(st);
      var bh = Math.max(1.5, Math.min(14, G.rowH * 0.6)), bw = (G.colS1 - G.colS0) / boxes;
      c.fillStyle = on ? C.white : C.blue;
      if (bh >= 4 && bw >= 5) { for (var m = 0; m < boxes; m++) c.fillRect(G.colS0 + m * bw + 0.5, y - bh / 2, bw - 1.5, bh); }
      else { c.fillRect(G.colS0, y - bh / 2, G.colS1 - G.colS0, bh); }
      c.strokeStyle = on ? C.white : C.cyan; c.lineWidth = on ? stroke + 1 : stroke;
      var cy = G.cy[st.comb];
      c.beginPath(); c.moveTo(G.colS1, y); c.lineTo(G.colS1 + (G.colC - G.colS1) * 0.5, y); c.lineTo(G.colC - 10, cy); c.stroke();
      if (pop > 0) { c.globalAlpha = pop; c.strokeStyle = C.white; c.lineWidth = 2; c.strokeRect(G.colS0 - 3, y - bh / 2 - 3, G.colS1 - G.colS0 + 6, bh + 6); }
    });
    // combiners to inverters
    P.combs.forEach(function (cb, i) {
      var y = G.cy[i], iy = G.iy[cb.inv], on = any && lit(cb);
      c.globalAlpha = A(cb);
      c.strokeStyle = on ? C.white : C.amber; c.lineWidth = on ? 4 : 3;
      c.beginPath(); c.moveTo(G.colC + 10, y); c.lineTo(G.colC + (G.colI - G.colC) * 0.5, y); c.lineTo(G.colI - 14, iy); c.stroke();
      var hb = Math.max(6, Math.min(26, (G.rowH * S.p.spc) * 0.5));
      c.fillStyle = '#000'; c.fillRect(G.colC - 10, y - hb / 2, 20, hb);
      c.lineWidth = 2.5; c.strokeRect(G.colC - 10, y - hb / 2, 20, hb);
    });
    // inverters to transformer
    P.invs.forEach(function (inv, i) {
      var y = G.iy[i], on = any && lit(inv);
      c.globalAlpha = A(inv);
      c.strokeStyle = on ? C.white : C.green; c.lineWidth = on ? 5 : 3.5;
      c.beginPath(); c.moveTo(G.colI + 14, y); c.lineTo(G.colI + (G.colT - G.colI) * 0.5, y); c.lineTo(G.colT - 16, G.ty); c.stroke();
      var hs = Math.max(10, Math.min(30, G.rowH * S.p.spc * S.p.cpi * 0.4));
      c.fillStyle = '#000'; c.fillRect(G.colI - 14, y - hs / 2, 28, hs); c.lineWidth = 3; c.strokeRect(G.colI - 14, y - hs / 2, 28, hs);
      if (hs >= 18) { c.beginPath(); c.moveTo(G.colI - 10, y + hs / 2 - 4); c.lineTo(G.colI + 10, y - hs / 2 + 4); c.lineWidth = 1.5; c.stroke(); } // the DC/AC diagonal
    });
    // transformer: two circles
    c.globalAlpha = A(P.tx);
    c.strokeStyle = any && lit(P.tx) ? C.white : C.white; c.lineWidth = 3;
    c.beginPath(); c.arc(G.colT - 4, G.ty, 13, 0, 7); c.stroke(); c.beginPath(); c.arc(G.colT + 12, G.ty, 13, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(G.colT + 25, G.ty); c.lineTo(G.W - 4, G.ty); c.stroke();
    c.globalAlpha = 1;
    // annotations (engineering-drawing style), 24 px
    c.font = font(24); c.textBaseline = 'middle';
    c.fillStyle = C.blue; c.textAlign = 'left';
    c.fillText(S.p.pps + (S.phone ? ' in series' : ' panels in series'), G.colS0, G.H - 14);
    c.textAlign = 'center';
    c.fillStyle = C.amber; if (!S.phone || G.W > 330) c.fillText('CB', G.colC, G.H - 14);
    c.fillStyle = C.green; c.fillText('INV', G.colI, G.H - 14);
    c.fillStyle = C.white; c.fillText('TX', G.colT + 4, G.ty + 34);
    // string labels where rows are tall enough
    c.textAlign = 'right'; c.fillStyle = C.cyan;
    var every = Math.max(1, Math.ceil(28 / G.rowH));
    if (G.rowH * every <= G.H) P.strs.forEach(function (st, s) {
      if (s % every) return;
      if (G.rowH < 26 && !(S.sel && S.sel.key === st.key)) return;
      c.fillText(st.label, G.colS1 + (G.colC - G.colS1) * 0.45, G.sy[s] - 12);
    });
    if (S.sel && S.sel.type === 'str' && G.rowH < 26) {
      var ly = Math.max(52, Math.min(G.H - 50, G.sy[S.sel.str] - 16)); c.textAlign = 'left';
      var lw = c.measureText(S.sel.label).width; c.fillStyle = 'rgba(0,0,0,0.8)'; c.fillRect(G.colS0, ly - 15, lw + 8, 30);
      c.fillStyle = C.white; c.fillText(S.sel.label, G.colS0 + 4, ly);
    }
  }

  function pickLayout(e) {
    var cv = S.cvL, r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, G = S.geom, P = S.plan; if (!G) return;
    function nearest(ys) { var bi = -1, bd = 1e9; ys.forEach(function (y, i) { var dd = Math.abs(y - py); if (dd < bd) { bd = dd; bi = i; } }); return bi; }
    var o = null;
    if (px > G.colT - 30) o = P.tx;
    else if (px > (G.colC + G.colI) / 2 + 10) o = P.invs[nearest(G.iy)];
    else if (px > G.colC - 24) o = P.combs[nearest(G.cy)];
    else o = P.strs[nearest(G.sy)];
    select(o || null);
  }

  // ---------- WHY: for engineers ----------
  function fillWhy() {
    var P = S.plan, p = S.p;
    var dT = MOD.Tmin - 25, vocC = MOD.Voc * (1 + MOD.betaVoc * dT), maxN = Math.floor(MOD.Vsys / vocC);
    var sVoc = p.pps * vocC, sVmp = p.pps * MOD.Vmp, sP = p.pps * MOD.W;
    var iComb = p.spc * MOD.Isc * 1.25, iFuse = MOD.Isc * 1.56, invDc = p.spc * p.cpi * sP;
    var h = '';
    function H(t, c) { h += '<div style="font-weight:bold;font-size:28px;color:' + c + ';margin:14px 0 6px">' + t + '</div>'; }
    function Pp(t) { h += '<div style="margin:4px 0">' + t + '</div>'; }
    function F(t) { h += '<div style="margin:6px 0;padding:6px 10px;border-left:4px solid #66ccff;color:#66ccff;font-family:Consolas,monospace">' + t + '</div>'; }
    H('HOW THE KEYS ARE GIVEN OUT', C.cyan);
    Pp('Key 0 is the transformer. Each inverter owns one <b>contiguous range</b> of keys, its slot. Inside the slot the order is fixed: the inverter, then each combiner, then each string followed by its panels. The live counts:');
    F('keys per string = 1 + ' + p.pps + ' = ' + P.perString + '<br>keys per combiner = 1 + ' + p.spc + ' x ' + P.perString + ' = ' + fmt(P.perComb) + '<br>keys per inverter = 1 + ' + p.cpi + ' x ' + fmt(P.perComb) + ' = ' + fmt(P.used) +
      '<br>slot = ' + fmt(P.used) + ' + 10% headroom, rounded up to a hundred = ' + fmt(P.slot) + '<br>quiet gap after each slot = ' + P.gap + ' keys<br>inverter i starts at key 100 + i x (' + fmt(P.slot) + ' + ' + P.gap + ')');
    Pp('Keys 1 to 99 are kept free for site-level parts (switchgear, metering, weather station), which is why the centre around the transformer is empty.');
    Pp('Because the Kuiper radius is r = sqrt(key + 0.5), a contiguous range of keys is a ring (an annulus) on the wafer. Each inverter block is one ring, and each <b>quiet gap</b> is a ring with no particles: the <b>dark rings</b> between the dashed amber lines. The angle of each key is frac(key x 0.6180339887) of a turn, so parts in one block spread evenly round their ring instead of piling up.');
    Pp('Adding a string fills the next place in order, so no existing key moves. Headroom inside each slot lets a block take a few more strings without touching the next block. Changing the design rule itself (panels per string, strings per combiner) is a re-plan and gives new ranges; the WAFER shows that at once.');
    H('WHY STABLE KEYS HELP PEOPLE TALK', C.green);
    Pp('A designer, an installer, a commissioning engineer, an operator and an owner all talk about the same string. If it is called "key ' + (P.strs[0] ? P.strs[0].key : 102) + '" by everyone, a drawing, a test sheet, a monitoring alarm and a repair ticket can all point at one thing without a translation table. The key never changes; the place on the wafer is <b>computed</b> from the key by the law, so nobody has to store or send coordinates. The range tells you the family: any key between ' + (P.invs[0] ? P.invs[0].start + ' and ' + P.invs[0].end : '') + ' belongs to INV1.');
    H('DC STRING SIZING NOTES (ILLUSTRATIVE, NOT DESIGN)', C.amber);
    Pp('Generic textbook values only, not a product datasheet, not any real site, and not a design. Real sizing follows the module datasheet, the inverter limits and the local code (for example IEC 62548 or the NEC), checked by a qualified engineer.');
    F('module: ' + MOD.W + ' W, Voc ' + MOD.Voc + ' V, Vmp ' + MOD.Vmp + ' V, Isc ' + MOD.Isc + ' A, beta(Voc) ' + (MOD.betaVoc * 100).toFixed(2) + ' %/C<br>' +
      'coldest cell ' + MOD.Tmin + ' C: Voc(cold) = ' + MOD.Voc + ' x (1 + ' + MOD.betaVoc + ' x (' + MOD.Tmin + ' - 25)) = ' + vocC.toFixed(2) + ' V<br>' +
      'string Voc(cold) = ' + p.pps + ' x ' + vocC.toFixed(2) + ' = <b style="color:' + (sVoc > MOD.Vsys ? C.amber : C.green) + '">' + sVoc.toFixed(0) + ' V</b> against a ' + MOD.Vsys + ' V system limit' + (sVoc > MOD.Vsys ? ' : TOO MANY PANELS' : ' : inside') + '<br>' +
      'most panels in series = floor(' + MOD.Vsys + ' / ' + vocC.toFixed(2) + ') = ' + maxN + '<br>' +
      'string Vmp at 25 C = ' + p.pps + ' x ' + MOD.Vmp + ' = ' + sVmp.toFixed(0) + ' V (must sit inside the inverter MPPT window)<br>' +
      'string power = ' + p.pps + ' x ' + MOD.W + ' W = ' + (sP / 1000).toFixed(2) + ' kWp<br>' +
      'combiner output current = ' + p.spc + ' x ' + MOD.Isc + ' A x 1.25 = ' + iComb.toFixed(1) + ' A<br>' +
      'string fuse at least 1.56 x Isc = ' + iFuse.toFixed(1) + ' A (a common rule of thumb)<br>' +
      'inverter DC = ' + p.cpi + ' x ' + p.spc + ' strings x ' + (sP / 1000).toFixed(2) + ' kWp = ' + (invDc / 1000).toFixed(0) + ' kWp<br>' +
      'farm DC = ' + fmt(P.panels) + ' x ' + MOD.W + ' W = ' + (P.panels * MOD.W / 1e6).toFixed(3) + ' MWp');
    Pp('Hot weather lowers voltage: the string Vmp on a hot day must stay above the inverter MPPT minimum. Cable sizing, voltage drop, DC/AC ratio and clipping are left out on purpose here.');
    H('SOURCES', C.white);
    Pp('Positions: window.KuiperLaw.place, lifted verbatim from ' + window.KuiperLaw.source + '. Keys here count from 0 for this generic farm (a site wafer); they are not keys from the public wafer.');
    S.whyPane.innerHTML = h;
  }

  function draw() { var now = performance.now(); drawWafer(now); if (S.sheet === 'draw') drawLayout(now); }
  function loop() {
    if (!S) return;
    draw();
    S.raf = requestAnimationFrame(loop);
  }

  function close() {
    if (!S) return;
    cancelAnimationFrame(S.raf);
    S.timers.forEach(clearTimeout);
    window.removeEventListener('keydown', S.onKey);
    window.removeEventListener('resize', S.onResize);
    try { if (S.ac) S.ac.close(); } catch (e) {}
    S.host.innerHTML = '';
    S = null;
  }

  var mod = { id: 'strings', label: 'SOLAR STRINGS', sentence: 'Place a solar farm with Kuiper keys', open: open, close: close,
              _plan: plan, _state: function () { return S; } };
  (window.KGModules = window.KGModules || []).push(mod);
})();
