/* kuiper module see-through, generation 202611021026 (UTC), Apache-2.0 (kuiper-belt code; no See Through code in this file)
   Opus team 5 (OPUS-5 lead), NL-010 roadmap step 5 "See Through, the star player", on Kuiper Edition 11 (202611021017).
   Revision of 202611012141-see-through.js (sha256 87a88e48..., REFUSED by its tester, withdrawn 01:53Z by the controller:
   on Pixel 7 the journey's card-details turned red because the module's two card rows, "see this line among the stars"
   and "its stars in See Through", filled the line card to its 34dvh cap before details opened; REVIEW issuecomment-
   6567342104 item 1). This revision writes NOTHING into #card, makes no entry of its own and moves no node: the shell's
   own See Through entry (kuiper-shell.js defaultStar, a title from 434 px, the bottom-left 44 px strip narrower) stays
   the way into the app, untouched. What it adds is the layer the registry already lists and could not fill:
     (1) the layer "See Through stars" (data/layers.json record see-through, module_registers): registered once through
         KY.modules.layers.api.register({id, module, load, draw}); load() fetches data/see-through.json, checks its
         sha256 and bytes against DATA below before a byte is parsed, refuses a file cut for another edition or another
         SPACE, and places each of the 5,800 Point keys with the engine's keyPlace and nothing else (code-feature-
         collection.v1: geometry carries keys, never coordinates). The row then reads OK · 5,800 of 5,800.
     (2) with the layer on, the 5,800 stars are drawn cyan (#2ee6e6, PALETTE.md: the instrument), and a tap within
         9 px of one shows one chip under the bar, a#ky-st-chip, the star's substation name and a link into See Through
         at that star, ../../see-through/#key=<k>&space=<SPACE>&sub=<name>, the grammar See Through 202611020012 reads
         (descent.js readLink: key with space is the identity). Same tab, same host, through the stable pointer. A tap
         elsewhere hides the chip. With the layer off (the default) the tap listener returns at once.
     (3) api.link(fields) for the File module's "Open an app" row (file.js appLink): repo, key (+space), sub.
   The keys are cut by handoff/05-see-through/202611021026-build-see-through-json.py (CERN-OHL-S-2.0: it evaluates See
   Through's star-key rule); this file only reads them, so it carries no See Through code and stays Apache-2.0.
   Substation names shown in the chip are (c) OpenStreetMap contributors, ODbL 1.0 (see-through/202611020012/NOTICE.md).
   requires: keyPlace, SPACE, wafer, cam, o2, fmt, esc, redraw, draw, layers
   provides: see-through */
(function () {
  'use strict';
  var ID = 'see-through', GEN = '202611021026', EDITION = '202611021201';
  var POINTER = '../../see-through/';
  var DATA = { file: 'data/see-through.json', bytes: 666705, sha256: '1b91c2d5116a1bef531b99ad91b0b041a8bd7b402fe3d854d36209f02666661c', features: 5800 };
  var REQUIRES = ['keyPlace', 'SPACE', 'wafer', 'cam', 'o2', 'fmt', 'esc', 'redraw', 'draw', 'layers'];
  var CYAN = '#2ee6e6', HIT = 9, TIMEOUT_MS = 60000;
  var CSS = '#ky-st-chip{position:fixed;left:8px;z-index:60;display:flex;align-items:center;gap:10px;box-sizing:border-box;'
    + 'min-height:44px;max-width:calc(100vw - 16px);padding:0 14px;background:rgba(4,20,24,.92);border:1px solid ' + CYAN + ';'
    + 'color:#fff;font:12px/1.2 ui-monospace,Consolas,monospace;text-decoration:none;letter-spacing:.04em}'
    + '#ky-st-chip b{color:' + CYAN + ';font-weight:600;white-space:nowrap}#ky-st-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';

  var KY = null, H = null;
  var st = { status: 'WAIT', why: 'waiting for the wafer', registered: 'no', placed: 0, total: 0, space: 0, wafer: 0,
    sha256: null, bytes: 0, edition: null, see_through: null, named: 0, taps: 0, chip: null, errors: [] };
  var stars = [];               // { j, key, name, x, y } for each admitted feature

  function hex(buf) { var b = new Uint8Array(buf), s = ''; for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16); return s; }
  function layersApi() { var m = KY && KY.modules && KY.modules.layers; return m && m.api && typeof m.api.register === 'function' ? m.api : null; }
  function layerOn() { var L = layersApi(), r = L && L.get ? L.get('see-through') : null; return !!(r && r.on && r.status === 'OK'); }

  // ------------------------------------------------------------------ links out (See Through 202611020012 descent.js readLink)
  function link(f) {
    f = f || {}; var p = [];
    if (f.repo) p.push('repo=' + encodeURIComponent(String(f.repo)));
    if (f.key != null && /^\d{1,15}$/.test(String(f.key))) { p.push('key=' + f.key); if (f.space != null && /^\d{1,15}$/.test(String(f.space))) p.push('space=' + f.space); }
    if (f.sub) p.push('sub=' + encodeURIComponent(String(f.sub).slice(0, 80)));
    return POINTER + (p.length ? '#' + p.join('&') : '');
  }
  function starLink(s) { return link({ key: s.key, space: st.space, sub: s.name || null }); }

  // ------------------------------------------------------------------ the layer's load: fetch, hash, refuse, place
  function fetchBytes(file) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_MS);
    return fetch('data/see-through.json', { cache: 'no-store', signal: ctl ? ctl.signal : undefined }).then(function (res) {
      if (!res.ok) throw new Error(file + ' HTTP ' + res.status);
      return res.arrayBuffer();
    }, function (e) { throw new Error(file + (e && e.name === 'AbortError' ? ' timed out' : ' did not load (network)')); })
      .finally(function () { clearTimeout(t); });
  }
  function load() {
    st.status = 'LOAD'; st.why = DATA.file;
    return H.wafer.then(function () {
      st.wafer = H.SPACE;
      if (!(window.crypto && crypto.subtle)) throw new Error('crypto.subtle unavailable, unhashed data refused');
      return fetchBytes(DATA.file);
    }).then(function (buf) {
      st.bytes = buf.byteLength;
      return crypto.subtle.digest('SHA-256', buf).then(function (d) {
        st.sha256 = hex(d);
        if (st.sha256 !== DATA.sha256) throw new Error(DATA.file + ' sha256 mismatch');
        if (buf.byteLength !== DATA.bytes) throw new Error(DATA.file + ' bytes ' + buf.byteLength + ' ≠ ' + DATA.bytes);
        return JSON.parse(new TextDecoder('utf-8').decode(buf));
      });
    }).then(function (j) {
      st.edition = j.edition; st.see_through = j.see_through; st.space = +j.space;
      if (j.format !== 'code-feature-collection.v1') throw new Error('format ' + j.format + ' not admitted');
      if (j.edition !== EDITION || j.edition !== KY.edition) throw new Error('data cut for edition ' + j.edition + ', page ' + KY.edition);
      if (st.space !== H.SPACE) throw new Error('SPACE ' + H.fmt(st.space) + ' ≠ wafer ' + H.fmt(H.SPACE));
      var fs = j.features || [];
      if (fs.length !== DATA.features) throw new Error('features ' + fs.length + ' ≠ ' + DATA.features);
      stars = []; var bad = 0, named = 0;
      fs.forEach(function (f) {
        var g = f && f.geometry, k = g && g.key, pr = (f && f.properties) || {};
        if (!g || g.type !== 'Point' || typeof k !== 'number' || !(k >= 0 && k < H.SPACE) || Math.floor(k) !== k) { bad++; return; }
        var p = H.keyPlace(k); if (pr.name) named++;
        stars.push({ j: pr.sub, key: k, name: pr.name || '', x: p[0], y: p[1] });
      });
      st.placed = stars.length; st.total = fs.length; st.named = named;
      st.status = stars.length ? 'OK' : 'EMPTY'; st.why = H.fmt(stars.length) + ' of ' + H.fmt(fs.length) + (bad ? ', ' + H.fmt(bad) + ' refused' : '');
      KY.redraw();
      return { placed: stars.length, total: fs.length, why: stars.length ? '' : 'no star admitted' };
    }).catch(function (e) { st.status = 'FAIL'; st.why = String(e && e.message || e); st.errors.push(st.why); stars = []; throw e; });
  }

  // ------------------------------------------------------------------ drawing (only while the registry has the layer on)
  function scr(s, o) { var c = KY.cam; return [(s.x - c.x) * c.zoom + o.width / 2, o.height / 2 - (s.y - c.y) * c.zoom]; }
  function draw(o2) {
    if (!stars.length) return;
    var o = o2.canvas, w = o.width, h = o.height, chosen = st.chip ? st.chip.j : -1, cp = null;
    o2.save(); o2.fillStyle = CYAN; o2.globalAlpha = 0.85; o2.beginPath();
    for (var i = 0; i < stars.length; i++) { var p = scr(stars[i], o);
      if (p[0] < -3 || p[1] < -3 || p[0] > w + 3 || p[1] > h + 3) continue;
      if (stars[i].j === chosen) cp = p;
      o2.moveTo(p[0] + 1.8, p[1]); o2.arc(p[0], p[1], 1.8, 0, 6.2832); }
    o2.fill();
    if (cp) { o2.globalAlpha = 1; o2.strokeStyle = CYAN; o2.lineWidth = 1.5; o2.beginPath(); o2.arc(cp[0], cp[1], 10, 0, 6.2832); o2.stroke(); }
    o2.restore();
  }

  // ------------------------------------------------------------------ the tap: the nearest star within 9 px, then the chip
  function nearest(cx, cy) {
    var o = H.o2.canvas, r = o.getBoundingClientRect(), sx = o.width / (r.width || 1), x = (cx - r.left) * sx, y = (cy - r.top) * sx;
    var best = null, bd = HIT * HIT * sx * sx;
    for (var i = 0; i < stars.length; i++) { var p = scr(stars[i], o), dx = p[0] - x, dy = p[1] - y, d = dx * dx + dy * dy;
      if (d <= bd) { bd = d; best = stars[i]; } }
    return best;
  }
  function chipTop() {
    var b = document.getElementById('kuiper-menu-bar') || document.getElementById('bar');
    var r = b && b.getBoundingClientRect(); return Math.round((r && r.height ? r.bottom : 0) + 8);
  }
  function showChip(s) {
    var a = document.getElementById('ky-st-chip');
    if (!a) { a = document.createElement('a'); a.id = 'ky-st-chip'; a.setAttribute('data-owner', ID); document.body.appendChild(a);
      a.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      a.addEventListener('click', function (e) { e.stopPropagation(); }); }
    var nm = s.name || ('substation ' + s.j + ', no name in the public file');
    a.href = starLink(s); a.style.top = chipTop() + 'px';
    a.title = 'See Through: the star that lands on ' + nm;
    a.setAttribute('aria-label', 'Open See Through at the star that lands on ' + nm);
    a.innerHTML = '<b>SEE THROUGH ›</b><span>' + H.esc(nm) + ' · key ' + H.esc(H.fmt(s.key)) + '</span>';
    st.chip = { j: s.j, key: s.key, name: s.name, href: a.getAttribute('href') }; st.taps++;
    KY.redraw();
  }
  function hideChip() { var a = document.getElementById('ky-st-chip'); if (a) a.remove(); if (st.chip) { st.chip = null; KY.redraw(); } }
  var down = null;
  function onDown(e) { if (e.isPrimary === false) { down = null; return; } down = { x: e.clientX, y: e.clientY, id: e.pointerId }; }
  function onUp(e) {
    var d = down; down = null;
    if (!d || d.id !== e.pointerId || !stars.length) return;
    if (!layerOn()) { if (st.chip) hideChip(); return; }
    if (Math.abs(e.clientX - d.x) > 6 || Math.abs(e.clientY - d.y) > 6) return;      // a drag or a pinch, not a tap
    var t = e.target; if (!t || t.tagName !== 'CANVAS') return;                         // taps on the bar, panels and card are theirs
    var s = nearest(e.clientX, e.clientY);
    if (s) showChip(s); else hideChip();
  }

  // ------------------------------------------------------------------ registration with the layer registry
  function registerLayer() {
    var tries = 0;
    (function wait() {
      var L = layersApi();
      if (L && typeof L.get === 'function' && L.get('see-through')) {
        try { L.register({ id: 'see-through', module: ID, load: load, draw: function (o2) { draw(o2); } }); st.registered = 'yes'; }
        catch (e) { st.registered = 'refused: ' + (e && e.message || e); st.errors.push(st.registered); }
        return;
      }
      if (++tries < 240) { setTimeout(wait, 125); return; }
      st.registered = 'no: ' + (L ? 'the registry has no see-through record' : 'no layer registry'); st.why = st.registered;
    })();
  }

  function install(K) {
    KY = K; H = K.hooks;
    var s = document.createElement('style'); s.id = 'ky-see-through-css'; s.textContent = CSS; document.head.appendChild(s);
    addEventListener('pointerdown', onDown, true);
    addEventListener('pointerup', onUp, false);
    addEventListener('pointercancel', function () { down = null; }, true);
    registerLayer();
    return api;
  }
  function inspect() { var o = JSON.parse(JSON.stringify(st)); o.on = layerOn(); return o; }
  var api = Object.freeze({ schema: 'kuiper.see-through.v1', generation: GEN, link: link, inspect: inspect,
    star: function (j) { for (var i = 0; i < stars.length; i++) if (stars[i].j === j) { var s = stars[i];
      var p = scr(s, H.o2.canvas), r = H.o2.canvas.getBoundingClientRect(), k = (r.width || 1) / H.o2.canvas.width;
      return { j: s.j, key: s.key, name: s.name, href: starLink(s), client: [r.left + p[0] * k, r.top + p[1] * k] }; } return null; },
    stars: function () { return stars.length; } });

  if (window.KY && typeof window.KY.register === 'function') {
    window.KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN, requires: REQUIRES, provides: ['see-through'],
      install: install, inspect: inspect });
  }
})();
