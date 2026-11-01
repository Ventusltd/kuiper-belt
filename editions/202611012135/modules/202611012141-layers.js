/* kuiper module layers, generation 202611012141 (UTC), Apache-2.0 (kuiper-belt code)
   Opus team 3, NL-010 roadmap step 3 "the Kuiper layer registry" (neural-link FIXES/NL-010/ROADMAP.md step 3;
   FIXES/NL-010/team-2/STEPS.md 3.1-3.8). Reference layers are records in data/layers.json (kuiper.layers.v1); each
   layer has ONE original control, input[data-ky-layer="layer:<id>"] in the WAFER panel (#layers); every other surface
   (keys e/E, the readout, the URL, the File menu, SCOPE/EDIT, the apps) proxies it through KY.modules.layers.api.
   Folds in NL-009 round 1 patch 05-lines (FIXES/NL-009/round1/05-lines.md, findings 1-10): the Edition 4 LINES panel
   becomes the verified-lines layer's control inside the WAFER panel.
   Moved here from the page (Edition 4 copy, editions/202611012135/index.html at kuiper-belt@96736f5):
   :626-654 loadEdition/edScreen/drawEdition and the draw wrap, :655-674 edCard and its card listener (fallback only;
   the card is Opus team 2's line-card module when admitted), :676-692 edFly/edNext/pointerup/e-E, :705-709 the LINES
   panel, :718 fillLines on open, :728-749 the ly* switches, fillLines and the two wraps.
   GridAtlas lessons: one original, many proxies (gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:12-13,
   :419-432, :1451-1462); the live state in the label (:91-98); install-then-inventory (:107-139); the whole row is the
   hit target (:1414-1425); galaxies-wafers@fff6fc6 layers-panel.mjs:117-118 (states), :325-330 (refuse on the row).
   requires: wafer, keyPlace, address, describe, findBy, flyTo, safeBox, fmt, esc, cv, o2, hud, big, sub, card, gbox,
             repos, commits, lightTime, cam, lit, sel, redraw, draw, panels
   optional (used when admitted earlier, never required): line-card (api.show), see-through/apps (api via register)
   provides: layers */
(function () {
  'use strict';
  var ID = 'layers', GEN = '202611012141';
  var SCHEMA = 'kuiper.layers.v1', MANIFEST = 'data/layers.json', TIMEOUT_MS = 60000;
  var REQUIRES = ['wafer', 'keyPlace', 'address', 'describe', 'findBy', 'flyTo', 'safeBox', 'fmt', 'esc', 'cv', 'o2',
    'hud', 'big', 'sub', 'card', 'gbox', 'repos', 'commits', 'lightTime', 'cam', 'lit', 'sel', 'redraw', 'draw', 'panels'];
  var STATES = ['WAIT', 'LOAD', 'OK', 'EMPTY', 'FAIL', 'REFUSED'];
  // kuiper-belt PALETTE.md:9-14, one colour one meaning; a layer may not invent a sixth (PALETTE.md:19)
  var PALETTE = { '#c9d3e6': 'the record', '#ffffff': 'the record', '#2ee6e6': 'the instrument', '#22ee77': 'energised',
    '#ffb000': 'attention', '#ff2bd6': 'selected' };
  var FORMATS = ['edition-keys.v1', 'code-feature-collection.v1', 'kuiper.editions.v1', 'engine'];

  var KY = null, H = null;
  var M = null;                 // the manifest, data/layers.json
  var rt = {};                  // id -> runtime { rec, on, value, status, why, placed, total, loaded_sha256, draw, ... }
  var panel = null, panelName = '', refuseLine = null, manifestWhy = 'WAIT · data/layers.json';
  var lines = { ED: [], placed: [], sel: -1, meta: null, focus: false, query: '', folded: {} };
  var lastRepo = -1, lastK0 = -1, booting = true;

  function esc(v) { return H ? H.esc(v) : String(v == null ? '' : v); }
  function fmt(n) { return H.fmt(n); }

  // ======================================================================== SECTION 1: the registry
  function rec(id) { return rt[id] ? rt[id].rec : null; }
  function setState(id, status, why) {
    var r = rt[id]; if (!r) return;
    if (STATES.indexOf(status) < 0) { status = 'FAIL'; why = 'unknown state ' + status; }
    r.status = status; r.why = why || '';
    paintRow(id);
    if (r.rec.preload && (status === 'FAIL' || status === 'REFUSED')) loud(id);
  }
  function tagText(id) {
    var r = rt[id]; if (!r) return '';
    return r.status + (r.why ? ' · ' + r.why : '');
  }
  function inspect() {
    var inputs = panel ? panel.querySelectorAll('input[data-ky-layer]') : [];
    var vals = {}, keyless = 0;
    for (var i = 0; i < inputs.length; i++) { var v = inputs[i].getAttribute('data-ky-layer');
      if (!v || !/^layer:[a-z0-9-]+$/.test(v)) keyless++; vals[v] = 1; }
    var n = inputs.length, u = Object.keys(vals).length, want = M ? M.layers.length : -1;
    var states = {}, on = [];
    (M ? M.order : []).forEach(function (id) { if (!rt[id]) return; states[id] = rt[id].status; if (rt[id].on) on.push(id); });
    return { schema: SCHEMA, generation: GEN, layers: n, unique: u, complete: n === u && n === want && keyless === 0,
      on: on, states: states, tags: (M ? M.order : []).reduce(function (o, id) { o[id] = tagText(id); return o; }, {}),
      manifest: manifestWhy };
  }
  function get(id) {
    var r = rt[id]; if (!r) return null;
    var out = JSON.parse(JSON.stringify(r.rec));
    out.on = r.on; out.value = r.value; out.status = r.status; out.why = r.why; out.placed = r.placed; out.total = r.total;
    out.loaded_sha256 = r.loaded_sha256; out.tag = tagText(id);
    return out;
  }
  function original(id) { return panel ? panel.querySelector('input[data-ky-layer="layer:' + id + '"]') : null; }
  // the ONLY way a layer flips: click its original (menu-bar.js:1451-1462); the delegated change listener does the rest
  function set(id, on) {
    var el = original(id); if (!el) return false;
    if (el.disabled) return false;
    if (el.checked !== !!on) el.click();
    return true;
  }
  function value(id, v) {
    var r = rt[id]; if (!r) return false;
    if (id === 'lines') {
      if (v && typeof v === 'object') { if ('focus' in v) lines.focus = !!v.focus; if ('query' in v) lines.query = String(v.query || '').trim().toLowerCase(); }
      r.value = { focus: lines.focus, query: lines.query };
      var f = document.getElementById('lyFocus'); if (f) f.checked = lines.focus;
      var q = document.getElementById('lyFind'); if (q && q.value.trim().toLowerCase() !== lines.query) q.value = lines.query;
      fillLines();
    } else if (id === 'repos') {
      var ri = -1;
      if (typeof v === 'number') ri = v;
      else if (v) { var s = String(v).toLowerCase(), rs = H.repos;
        var hit = rs.find(function (x) { return x.name.toLowerCase() === s; }) || rs.find(function (x) { return x.name.toLowerCase().indexOf(s) >= 0; });
        ri = hit ? hit.i : -1; }
      r.value = ri >= 0 ? H.repos[ri].name : null;
      if (r.on) { KY.lit.repo = ri; lastRepo = ri; }
    } else if (id === 'periods') {
      r.value = v ? String(v) : null;
      if (r.on) applyPeriod(r.value);
    } else {
      r.value = v == null ? null : v;
    }
    paintRow(id); KY.redraw();
    return true;
  }
  // a layer that arrives with a later module (See Through step 5, elements and spider step 7)
  function register(layer) {
    if (!layer || !layer.id) throw new Error('layers.register: no id');
    var r = rt[layer.id];
    if (!r) throw new Error('layer ' + layer.id + ' not in layers.json');
    var want = moduleId(r.rec.module);
    if (layer.module && want && layer.module !== want) throw new Error('layer ' + layer.id + ' belongs to module ' + want + ', not ' + layer.module);
    if (r.registered) throw new Error('layer ' + layer.id + ' registered twice');
    r.registered = true;
    if (typeof layer.draw === 'function') r.draw = layer.draw;
    if (r.status === 'REFUSED') return api;          // a refusal (licence, format, colour) is never lifted by registering
    if (typeof layer.load === 'function') {
      setState(layer.id, 'LOAD', 'module ' + (layer.module || want));
      Promise.resolve().then(function () { return layer.load(KY); }).then(function (res) {
        res = res || {}; r.placed = res.placed || 0; r.total = res.total || 0;
        if (r.placed) setState(layer.id, 'OK', fmt(r.placed) + ' of ' + fmt(r.total)); else setState(layer.id, 'EMPTY', res.why || 'nothing to place');
        KY.redraw();
      }, function (e) { setState(layer.id, 'FAIL', String(e && e.message || e)); });
    } else if (r.rec.source && r.rec.source.file) { loadSource(layer.id); }
    return api;
  }
  function moduleId(file) { if (!file) return ''; var m = String(file).match(/^(?:\d{12}-)?([a-z0-9-]+?)(?:\.js)?$/); return m ? m[1] : ''; }

  // ======================================================================== SECTION 2: loading, hashing, refusing
  function hex(buf) { var b = new Uint8Array(buf), s = ''; for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16); return s; }
  function fetchBytes(file) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_MS);
    return fetch(file, { cache: 'no-store', signal: ctl ? ctl.signal : undefined }).then(function (res) {
      if (!res.ok) { var e = new Error(file + ' HTTP ' + res.status); e.http = res.status; throw e; }
      return res.arrayBuffer();
    }).catch(function (e) { if (e && e.http) throw e;
      var x = new Error(file + (e && e.name === 'AbortError' ? ' timed out after ' + (TIMEOUT_MS / 1000) + ' s' : ' did not load (network)')); x.http = 0; throw x; })
      .finally(function () { clearTimeout(t); });
  }
  // fetch, then hash, bytes and feature count against the record (gridatlas@5ec7f62 atlas/index.html:75-81 for data)
  function verified(id) {
    var r = rt[id], src = r.rec.source, file = src.file;
    setState(id, 'LOAD', file);
    return fetchBytes(file).then(function (buf) {
      return crypto.subtle.digest('SHA-256', buf).then(function (d) {
        var sha = hex(d); r.loaded_sha256 = sha;
        if (src.sha256 && sha !== src.sha256) throw new Error('sha256 mismatch');
        if (src.bytes && buf.byteLength !== src.bytes) throw new Error('bytes ' + buf.byteLength + ' ≠ record ' + src.bytes);
        var j; try { j = JSON.parse(new TextDecoder('utf-8').decode(buf)); } catch (e) { throw new Error(file + ' is not JSON'); }
        return j;
      });
    });
  }
  function admissible(k) { return Number.isFinite(k) && k >= 0 && k < H.SPACE; }   // index.html:632, the edition's predicate
  // a generic code-feature-collection.v1 layer: geometry carries keys, never coordinates (galaxies-wafers README.md:11-18)
  function loadSource(id) {
    var r = rt[id];
    return verified(id).then(function (j) {
      var fs = (j && j.features) || [];
      if (r.rec.source.features && fs.length !== r.rec.source.features) throw new Error('features ' + fs.length + ' ≠ record ' + r.rec.source.features);
      var pts = [], segs = [], bad = 0;
      fs.forEach(function (f) { var g = f && f.geometry; if (!g) { bad++; return; }
        if (g.type === 'Point' && admissible(g.key)) pts.push(H.keyPlace(g.key));
        else if (g.type === 'LineString' && g.keys && g.keys.length === 2 && admissible(g.keys[0]) && admissible(g.keys[1])) segs.push([H.keyPlace(g.keys[0]), H.keyPlace(g.keys[1])]);
        else bad++; });
      r.placed = pts.length + segs.length; r.total = fs.length;
      if (!r.draw) r.draw = function (o2) { drawFeatures(o2, r.rec.colour, pts, segs); };
      if (r.placed) setState(id, 'OK', fmt(r.placed) + ' of ' + fmt(r.total) + (bad ? ', ' + fmt(bad) + ' outside SPACE, counted, not placed' : ''));
      else setState(id, 'EMPTY', fs.length ? 'no feature admitted (' + fmt(bad) + ' outside SPACE)' : 'the file holds no features');
      KY.redraw();
    }).catch(function (e) { setState(id, 'FAIL', String(e.message || e)); });
  }
  function scr(p) { var c = KY.cam, o = H.o2.canvas; return [(p[0] - c.x) * c.zoom + o.width / 2, o.height / 2 - (p[1] - c.y) * c.zoom]; }
  function drawFeatures(o2, colour, pts, segs) {
    o2.strokeStyle = colour; o2.fillStyle = colour; o2.lineWidth = 1; o2.globalAlpha = 0.8;
    segs.forEach(function (s) { var a = scr(s[0]), b = scr(s[1]); o2.beginPath(); o2.moveTo(a[0], a[1]); o2.lineTo(b[0], b[1]); o2.stroke(); });
    pts.forEach(function (p) { var x = scr(p); o2.beginPath(); o2.arc(x[0], x[1], 2.6, 0, 6.2832); o2.fill(); });
    o2.globalAlpha = 1;
  }
  // a preload layer that fails says so in the row, the heading and an alert (09-robust.md:25-29); the wafer draws on
  function loud(id) {
    var r = rt[id], file = r.rec.source && r.rec.source.file ? r.rec.source.file : r.rec.label;
    var http = /HTTP \d+|did not load|timed out/.test(r.why);
    H.big.textContent = String(file).toUpperCase() + (http ? ' DID NOT LOAD' : ' REFUSED') + ' · ' + r.status + ' · ' + r.why;
    alertLine(r.rec.label + ' layer ' + r.status + ' · ' + r.why + ' · the wafer still draws; nothing of this layer is placed');
  }
  function alertLine(text) {
    var box = document.getElementById('refuse');
    if (!box) { box = document.createElement('div'); box.id = 'refuse'; box.setAttribute('role', 'alert'); box.className = 'ky-layers-refuse'; document.body.appendChild(box); }
    if (!box.getAttribute('role')) box.setAttribute('role', 'alert');
    if (!refuseLine) { refuseLine = document.createElement('div'); refuseLine.setAttribute('data-ky-from', ID); box.appendChild(refuseLine); }
    refuseLine.textContent = 'LAYERS · ' + text;
    if (!refuseLine.isConnected) box.appendChild(refuseLine);
    box.hidden = false; box.style.display = 'block';
    if (!box.__kyLayersWatch) { box.__kyLayersWatch = true;           // the page's refuse() rewrites textContent; keep our line
      new MutationObserver(function () { if (refuseLine && !refuseLine.isConnected) box.appendChild(refuseLine); }).observe(box, { childList: true }); }
  }

  // ======================================================================== SECTION 3: the WAFER panel
  var CSS = ''
    + '#layers{display:none;position:fixed;left:0;right:0;width:auto;max-width:none;z-index:11;background:#090c13f2;border:1px solid #1d6470;'
    + 'border-radius:0 0 6px 6px;padding:6px 10px 8px;pointer-events:auto;text-align:left;overscroll-behavior:contain;'
    + 'max-height:var(--ky-layers-max,80vh);overflow:hidden;flex-direction:column}'
    + '#layers.gm-open{display:flex}'
    + '#layers.ky-in-shell{position:static;border:0;padding:0;background:transparent;max-height:none}#layers.ky-in-shell #lineslist{max-height:45vh}'
    + '@media (min-width:641px){#layers{right:auto;width:min(720px,96vw)}}'
    + '#layers .ky-ly-rows{flex:none}'
    + '#layers .ky-ly-g{color:#2ee6e6;letter-spacing:.12em;text-transform:uppercase;font-size:10px;padding:4px 2px 0;line-height:16px}'
    + '#layers label.ky-ly{position:relative;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;border-top:1px solid #121a26;'
    + 'color:#8fb3bd;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none}'
    + '#layers label.ky-ly input[data-ky-layer]{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:1}'
    + '#layers label.ky-ly .bx{flex:none;width:20px;height:20px;border:1px solid #12414a;border-radius:3px;background:#090c13}'
    + '#layers label.ky-ly input:checked ~ .bx{background:#22ee77;border-color:#22ee77;box-shadow:inset 0 0 0 3px #090c13}'
    + '#layers label.ky-ly input:disabled ~ .bx{border-style:dashed;opacity:.5}'
    + '#layers label.ky-ly:has(input:checked){color:#d5dcea}'
    + '#layers label.ky-ly .sw{flex:none;width:10px;height:10px;border-radius:50%}'
    + '#layers label.ky-ly .tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;padding:4px 0;line-height:1.3}'
    + '#layers label.ky-ly .nm{white-space:normal;overflow-wrap:anywhere}'
    + '#layers label.ky-ly .st{color:#7d8799;font-size:11px;white-space:normal;overflow-wrap:anywhere}'
    + '#layers label.ky-ly .st[data-s=OK]{color:#22ee77}#layers label.ky-ly .st[data-s=FAIL],#layers label.ky-ly .st[data-s=REFUSED]{color:#ffb000}'
    + '#layers label.ky-ly .st[data-s=LOAD],#layers label.ky-ly .st[data-s=WAIT]{color:#2ee6e6}'
    + '#layers label.ky-ly.star .nm{font-size:16px;letter-spacing:.06em;color:#2ee6e6;text-transform:uppercase}'
    + '#layers .ky-ly-why{color:#ffb000;padding:6px 2px;white-space:pre-wrap}'
    // NL-009 05-lines: the controls stay put, only the list scrolls inside itself (finding 1); 44 px targets (2);
    // 16 px filter (3); a clear control and Escape (4); a count line (6); grouped by repository, sticky, foldable (7)
    + '#linesctl{flex:none;display:flex;flex-direction:column;gap:2px;margin-top:4px;border-top:1px solid #12414a;padding-top:4px}'
    + '#linesctl .lyrow{display:flex;gap:6px;align-items:center;flex-wrap:nowrap}'
    + '#linesctl label{display:flex;align-items:center;gap:6px;min-height:44px;padding:0 4px 0 2px;color:#8fb3bd;cursor:pointer;user-select:none;flex:1 1 auto;min-width:0}'
    + '#linesctl label:has(input:checked){color:#d5dcea}'
    + '#linesctl input[type=checkbox]{width:20px;height:20px;margin:0;accent-color:#22ee77;flex:none}'
    + '#linesctl #lyFind{flex:1 1 120px;min-width:0;min-height:44px;background:#090c13;color:#d5dcea;border:1px solid #12414a;padding:8px 10px;font:inherit;font-size:16px;border-radius:0;appearance:none}'
    + '#linesctl #lyFind:focus{outline:none;border-color:#2ee6e6}'
    + '#linesctl button{min-height:44px;min-width:44px;background:#0b1a20;color:#8fb3bd;border:1px solid #12414a;padding:0 10px;font:inherit;text-transform:uppercase;cursor:pointer;touch-action:manipulation;flex:none}'
    + '#linesctl button:active{border-color:#2ee6e6;color:#2ee6e6}'
    + '#lyClear{display:none!important;font-size:20px;line-height:1;padding:0}#lyClear.on{display:inline-block!important}'
    + '#lycount{color:#7d8799;padding:2px 2px 0;line-height:1.4}'
    + '#lineslist{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}'
    + '#lineslist .lg{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:8px;min-height:40px;padding:4px 8px;background:#0b1a20;color:#2ee6e6;'
    + 'border-top:1px solid #12414a;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;touch-action:manipulation;user-select:none}'
    + '#lineslist .lg .n{color:#7d8799;letter-spacing:0;text-transform:none}#lineslist .lg.focus{color:#22ee77}#lineslist .lg .ch{width:12px;color:#7d8799}'
    + '#lineslist .ln{min-height:44px;padding:5px 8px;border-top:1px solid #121a26;cursor:pointer;color:#7d8799;font-size:12px;overflow-wrap:anywhere}'
    + '#lineslist .ln code{display:block;color:#ffffff;white-space:pre-wrap;font:inherit;font-weight:600}'
    + '#lineslist .ln b{color:#d5dcea;font-weight:600}#lineslist .ln.focus b{color:#22ee77}#lineslist .ln.sel{background:rgba(255,43,214,.12)}'
    + '#lineslist .ln .t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '.ky-layers-refuse{position:fixed;left:0;right:0;bottom:0;z-index:30;background:#090c13f2;color:#ffb000;border-top:2px solid #ffb000;padding:8px 12px;'
    + 'font:12px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap}';

  function buildPanel() {
    panel = document.createElement('div'); panel.id = 'layers'; panel.className = 'gm-panel ky-layers';
    panel.setAttribute('aria-label', 'WAFER: the layer registry');
    var st = document.createElement('style'); st.id = 'ky-layers-style'; st.textContent = CSS; panel.appendChild(st);
    var rows = document.createElement('div'); rows.className = 'ky-ly-rows'; rows.innerHTML = '<div class="ky-ly-why">' + esc(manifestWhy) + '</div>';
    panel.appendChild(rows);
    var host = document.querySelector('.gm-group[data-group="layers"]');   // team 1's shell: WAFER > layers group
    if (host) { panel.classList.remove('gm-panel'); panel.classList.add('gm-open', 'ky-in-shell'); host.appendChild(panel); panelName = 'shell'; }
    else {
      document.body.appendChild(panel);
      // without the shell, the Edition 4 LINES title (index.html:702) opens the WAFER panel once the page's #lines is deleted
      var t = document.querySelector('#bar .gm-title[data-panel="lines"]');
      try { if (!t) throw 0; KY.panels.add('lines', panel, 'WAFER'); panelName = 'lines'; }
      catch (e) { KY.panels.add('wafer', panel, 'WAFER'); panelName = 'wafer'; }
    }
    // one delegated change listener: the single implementation of on/off (menu-bar.js:1451-1462, :1723-1726)
    panel.addEventListener('change', function (e) {
      var t = e.target; if (!t || !t.matches('input[data-ky-layer]')) return;
      apply(t.getAttribute('data-ky-layer').slice(6), t.checked);
    });
    panel.addEventListener('keydown', function (e) { if (e.target && e.target.id !== 'lyFind') return; e.stopPropagation(); });
    // the panel height comes from the real viewport, keyboard included (05-lines finding 5)
    sizePanel(); addEventListener('resize', sizePanel);
    if (window.visualViewport) visualViewport.addEventListener('resize', sizePanel);
    // when the panel opens, show where you are (05-lines finding 7); no wrap of setPanel (ROADMAP 4.8)
    new MutationObserver(function () { if (panel.classList.contains('gm-open')) { sizePanel(); fillLines(true); } })
      .observe(panel, { attributes: true, attributeFilter: ['class'] });
    // rows answer Enter and Space as a button does (NL-009 04 touch, as team 4's patch gave the Edition 4 rows)
    panel.addEventListener('keydown', function (e) { var row = e.target.closest && e.target.closest('#lineslist [data-i], #lineslist [data-g]');
      if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); row.click(); } });
  }
  function closePanel() {
    if (panelName === 'shell') { var sh = window.__KUIPER_SHELL__; if (sh && typeof sh.close === 'function') sh.close(); return; }
    if (panel.classList.contains('gm-open')) KY.panels.set(panelName);
  }
  function sizePanel() {
    if (!panel) return;
    var vh = Math.min(innerHeight, window.visualViewport ? visualViewport.height : innerHeight);
    var top = parseFloat(panel.style.top) || 46, avail = Math.max(160, vh - top - 4);
    panel.style.setProperty('--ky-layers-max', Math.round(innerWidth <= 640 ? avail : Math.min(avail, vh * 0.8)) + 'px');
  }
  function fillRows() {
    var host = panel.querySelector('.ky-ly-rows'), html = [], group = null;
    M.order.forEach(function (id) {
      var r = rt[id].rec;
      if (r.group !== group) { group = r.group; html.push('<div class="ky-ly-g">' + esc(group) + '</div>'); }
      html.push('<label class="ky-ly' + (r.star ? ' star' : '') + '" data-id="' + esc(id) + '">'
        + '<input type="checkbox" data-ky-layer="' + esc(r.key) + '" aria-label="' + esc(r.label) + '">'
        + '<span class="bx" aria-hidden="true"></span><span class="sw" style="background:' + esc(r.colour) + '" title="' + esc(r.meaning) + '"></span>'
        + '<span class="tx"><span class="nm">' + esc(r.label) + '</span><span class="st" data-s="WAIT">WAIT</span></span></label>');
      if (id === 'lines') html.push(LINES_CTL);
    });
    host.innerHTML = html.join('');
    M.order.forEach(function (id) { var el = original(id); el.checked = !!rt[id].on; paintRow(id); });
    wireLines();
  }
  function paintRow(id) {
    var r = rt[id]; if (!panel || !r) return;
    var lab = panel.querySelector('label.ky-ly[data-id="' + id + '"]'); if (!lab) return;
    var st = lab.querySelector('.st'); st.setAttribute('data-s', r.status);
    st.textContent = tagText(id);
    var inp = lab.querySelector('input'); inp.checked = !!r.on; inp.disabled = r.status === 'REFUSED';
    lab.setAttribute('aria-label', r.rec.label + ' · ' + tagText(id));
  }

  // apply an on/off that came through the original
  function apply(id, on) {
    var r = rt[id]; if (!r) return;
    r.on = !!on;
    if (id === 'repos') { if (!on) { KY.lit.repo = -1; lastRepo = -1; } else if (r.value) value('repos', r.value); }
    if (id === 'periods') { if (!on) { KY.lit.period = null; lastK0 = -1; } else if (r.value) applyPeriod(r.value); }
    if (id === 'lines') { if (!on) { lines.sel = -1; } fillLines(); }
    if (on && !r.loaded && !r.rec.preload && r.status !== 'REFUSED') load(id);
    refreshWaferTags(); paintRow(id); writeURL(); KY.redraw();
  }

  // ======================================================================== SECTION 4: the verified-lines layer
  var LINES_CTL = '<div id="linesctl">'
    + '<div class="lyrow"><label><input type="checkbox" id="lyFocus"> gridatlas + data centres only</label>'
    + '<button type="button" data-ky-step="1" aria-label="next verified line">next</button><button type="button" data-ky-step="-1" aria-label="previous verified line">prev</button></div>'
    + '<div class="lyrow"><input id="lyFind" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="filter: repository, file or title" aria-label="filter the verified lines">'
    + '<button type="button" id="lyClear" aria-label="clear the filter">×</button></div>'
    + '<div id="lycount" aria-live="polite"></div></div><div id="lineslist"></div>';
  function wireLines() {
    var f = document.getElementById('lyFocus'), q = document.getElementById('lyFind'), c = document.getElementById('lyClear');
    var ctl = document.getElementById('linesctl'), list = document.getElementById('lineslist');
    // the controls and the list are inside .ky-ly-rows, but the list must be the one scroller: move them after it
    panel.appendChild(ctl); panel.appendChild(list);
    f.addEventListener('change', function () { value('lines', { focus: f.checked }); KY.redraw(); });
    q.addEventListener('input', function () { lines.query = q.value.trim().toLowerCase(); rt.lines.value = { focus: lines.focus, query: lines.query }; fillLines(); });
    q.addEventListener('keydown', function (e) { e.stopPropagation();
      if (e.key === 'Escape') { if (q.value) { q.value = ''; lines.query = ''; fillLines(); } else q.blur(); e.preventDefault(); }
      else if (e.key === 'Enter') q.blur(); });
    c.addEventListener('click', function (e) { e.stopPropagation(); q.value = ''; lines.query = ''; rt.lines.value = { focus: lines.focus, query: '' }; fillLines(); });
    ctl.addEventListener('click', function (e) { var b = e.target.closest('[data-ky-step]'); if (!b) return; e.stopPropagation(); step(+b.getAttribute('data-ky-step')); });
    list.addEventListener('click', function (e) {
      var g = e.target.closest('[data-g]');
      if (g) { e.stopPropagation(); if (!lines.query) { var n = g.getAttribute('data-g'); lines.folded[n] = !lines.folded[n]; fillLines(); } return; }
      var row = e.target.closest('[data-i]'); if (!row) return;
      e.stopPropagation(); var i = +row.getAttribute('data-i');
      closePanel();                                                     // LINES closes on pick (Edition 4)
      openLine(i); fly(lines.placed[i]);
    });
  }
  function visibleLine(b) { return rt.lines.on && (!lines.focus || b.class === 'focus'); }
  function fillLines(scrollSel) {
    var list = document.getElementById('lineslist'), cnt = document.getElementById('lycount'), clr = document.getElementById('lyClear');
    if (!list || !rt.lines) return;
    if (clr) clr.classList.toggle('on', !!lines.query);
    var P = lines.placed, total = P.length, groups = {}, shown = 0, repos = {};
    P.forEach(function (b, i) { repos[b.repo] = 1; if (!visibleLine(b)) return;
      var hay = (b.repo + ' ' + b.path + ' ' + b.title + ' ' + (b.line_text || '')).toLowerCase();
      if (lines.query && hay.indexOf(lines.query) < 0) return;
      (groups[b.repo] = groups[b.repo] || []).push(i); shown++; });
    var names = Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length || (a < b ? -1 : 1); });
    var card = KY.modules && KY.modules['line-card'] && KY.modules['line-card'].api, html = [];
    names.forEach(function (n) {
      var idx = groups[n].sort(function (a, b) { var x = P[a], y = P[b]; return x.path < y.path ? -1 : x.path > y.path ? 1 : x.line - y.line; });
      var focus = P[idx[0]].class === 'focus', folded = !lines.query && lines.folded[n] && !(scrollSel && idx.indexOf(lines.sel) >= 0);
      if (scrollSel && idx.indexOf(lines.sel) >= 0) lines.folded[n] = false;
      html.push('<div class="lg' + (focus ? ' focus' : '') + '" data-g="' + esc(n) + '" role="button" tabindex="0" aria-expanded="' + (folded ? 'false' : 'true') + '"><span class="ch">' + (folded ? '▸' : '▾') + '</span>' + esc(n) + ' <span class="n">' + idx.length + '</span></div>');
      if (folded) return;
      idx.forEach(function (i) { var b = P[i], cls = 'ln' + (i === lines.sel ? ' sel' : '') + (b.class === 'focus' ? ' focus' : '');
        if (card && typeof card.row === 'function') { html.push('<div class="' + cls + '" data-i="' + i + '" role="button" tabindex="0">' + card.row(b, i, cls) + '</div>'); return; }
        // the line of code is the header (ROADMAP law 2): line_text first, verbatim; the key follows; the names after
        html.push('<div class="' + cls + '" data-i="' + i + '" role="button" tabindex="0"><code>' + esc(b.line_text != null ? b.line_text : '') + '</code><b>' + esc(b.path) + ':' + b.line + '</b> · key ' + fmt(b.key)
          + '<div class="t">' + esc(b.title) + '</div></div>'); });
    });
    list.innerHTML = html.join('') || '<div class="ln">' + (rt.lines.on ? (total ? 'no line matches' : esc(tagText('lines'))) : 'layer off') + '</div>';
    if (cnt) cnt.textContent = !rt.lines.on ? '0 of ' + fmt(total) + ' rows · layer off · ' + fmt(total) + ' lines hidden'
      : fmt(shown) + ' of ' + fmt(total) + ' rows' + (lines.query ? ' match "' + lines.query + '"' : '') + (lines.focus ? ' · gridatlas + data centres only' : '')
        + (!lines.query && !lines.focus ? ' · ' + Object.keys(repos).length + ' repositories' : '');
    if (scrollSel && lines.sel >= 0) { var s = list.querySelector('[data-i="' + lines.sel + '"]'); if (s) s.scrollIntoView({ block: 'center' }); }
  }
  function loadLines() {
    var r = rt.lines;
    return verified('lines').then(function (j) {
      var bodies = j.bodies || j, summary = j.summary || {};
      if (!Array.isArray(bodies)) throw new Error('keys.json has no bodies');
      if (r.rec.source.features && bodies.length !== r.rec.source.features) throw new Error('features ' + bodies.length + ' ≠ record ' + r.rec.source.features);
      lines.ED = bodies; lines.meta = summary;
      // the edition's admission predicate, unchanged (index.html:632-633); placed by keyPlace and nothing else
      lines.placed = bodies.filter(function (b) { return b.on_wafer && b.verified && admissible(b.key); })
        .map(function (b) { var p = H.keyPlace(b.key); return Object.assign({}, b, { x: p[0], y: p[1] }); });
      r.placed = lines.placed.length; r.total = bodies.length; r.loaded = true;
      if (!r.placed) setState('lines', 'EMPTY', 'no body admitted of ' + fmt(bodies.length));
      else setState('lines', 'OK', fmt(r.placed) + ' of ' + fmt(r.total));
      H.big.textContent = 'Kuiper Edition 5 · ' + fmt(r.placed) + ' verified lines lit';
      H.sub.textContent = 'Edition 1 verified ' + fmt(bodies.length) + ' lines of the estate (354 keyed findings, 495 keys re-resolved; see ../202610311905/). '
        + 'Here each is a green spark at its own key on the one wafer: ' + H.sub.textContent;
      fillLines(); KY.redraw();
    }).catch(function (e) { lines.ED = []; lines.placed = []; r.loaded = true; setState('lines', 'FAIL', String(e.message || e)); fillLines(); KY.redraw(); });
  }
  function edScreen(b) { return scr([b.x, b.y]); }
  function drawLines(o2) {
    var hud = H.hud, P = lines.placed;
    if (!rt.lines.on) { hud.textContent += '\nEDITION 5 · verified lines layer off'; return; }
    if (!P.length) { hud.textContent += '\nEDITION 5 · ' + tagText('lines'); return; }
    var on = 0, W = o2.canvas.width, Hh = o2.canvas.height;
    for (var i = 0; i < P.length; i++) { var b = P[i]; if (lines.focus && b.class !== 'focus') continue;
      var p = edScreen(b), x = p[0], y = p[1];
      if (x < -8 || y < -8 || x > W + 8 || y > Hh + 8) continue; on++;
      var sel = i === lines.sel, focus = b.class === 'focus';
      o2.beginPath(); o2.arc(x, y, sel ? 6 : (focus ? 3.2 : 2.6), 0, 6.2832);
      o2.fillStyle = sel ? 'rgba(255,43,214,.95)' : (focus ? 'rgba(34,238,119,.95)' : 'rgba(34,238,119,.70)'); o2.fill();
      if (sel) { o2.strokeStyle = 'rgba(255,43,214,.9)'; o2.lineWidth = 1.5; o2.beginPath(); o2.arc(x, y, 14, 0, 6.2832); o2.stroke(); } }
    var notOn = lines.ED.length - P.length;
    hud.textContent += '\nEDITION 2 · ' + fmt(P.length) + ' verified lines on this wafer, ' + fmt(on) + ' in view'
      + (notOn ? ' · ' + fmt(notOn) + ' not on the wafer (named in keys.json), counted, not placed' : '')
      + ' · bright green: gridatlas and the data-centre repositories · green: the rest of the estate';
  }
  // the card is Opus team 2's (line-card); the Edition 4 card (index.html:655-674) is the fallback when it is absent
  function openLine(i) {
    var b = lines.placed[i]; if (!b) return;
    var a = H.address(b.key), lc = KY.modules && KY.modules['line-card'] && KY.modules['line-card'].api;
    lines.sel = i;
    if (lc && typeof lc.show === 'function') lc.show(b, { index: i, of: lines.placed.length, onclose: function () { lines.sel = -1; KY.sel.target = null; } });
    else fallbackCard(b, i, a);
    if (a && !a.silent && rt.repos && rt.repos.on) { KY.lit.repo = a.c.repo; lastRepo = a.c.repo; }
    else if (a && !a.silent) KY.lit.repo = a.c.repo;
    KY.sel.target = { x: b.x, y: b.y }; KY.redraw();
  }
  var cardWired = false;
  function fallbackCard(b, i, a) {
    var card = H.card;
    card.style.display = 'block'; card.classList.remove('open');
    card.setAttribute('role', 'region'); card.setAttribute('aria-label', 'verified line'); card.setAttribute('aria-live', 'polite');
    card.innerHTML = '<button class="cx" aria-label="close">×</button>'
      + (b.line_text != null ? '<code style="display:block;color:#fff;white-space:pre-wrap;font-weight:600">' + esc(b.line_text) + '</code>' : '')
      + esc(b.repo) + '@' + esc(String(b.commit).slice(0, 7)) + ' ' + esc(b.path) + ':' + b.line + ' · key ' + fmt(b.key)
      + '\n<b>' + esc(b.title) + '</b>  <span style="color:var(--dim)">' + fmt(i + 1) + ' of ' + fmt(lines.placed.length) + '</span>'
      + (b.quote ? '<div class="cq">' + esc(b.quote) + '</div>' : '')
      + '<a href="' + esc(b.destination) + '" target="_blank" rel="noopener">open on GitHub at ' + esc(String(b.commit).slice(0, 7)) + '</a>'
      + '  ·  <button class="ct" aria-expanded="false">details</button>'
      + '<div class="cd">' + (b.pattern ? 'pattern: ' + esc(b.pattern) + '\n' : '') + 'found by ' + esc(b.worker) + ' ' + esc(b.finding) + ', verified by a controller\n' + H.describe(a) + '</div>';
    if (!cardWired) { cardWired = true;
      card.addEventListener('click', function (e) {
        if (KY.modules && KY.modules['line-card']) return;
        if (e.target.closest('.cx')) { card.style.display = 'none'; lines.sel = -1; KY.sel.target = null; KY.redraw(); e.stopPropagation(); return; }
        if (e.target.closest('.ct')) { var on = card.classList.toggle('open'); e.target.closest('.ct').setAttribute('aria-expanded', on ? 'true' : 'false'); e.stopPropagation(); return; }
        if (e.target.closest('a')) { e.stopPropagation(); return; }
        e.stopImmediatePropagation();                               // a tap on the card body keeps it open (index.html:603 would close it)
      }, true); }
  }
  // fly so the spark lands in the clear space: under the bar, above the card (index.html:676-680)
  function fly(b) {
    if (!b) return;
    var z = 14, s = H.safeBox(), card = H.card;
    var cardH = card.style.display === 'block' ? card.getBoundingClientRect().height + 12 : 0;
    var mx = (s.x0 + s.x1) / 2, my = (s.y0 + Math.max(s.y0 + 40, s.y1 - cardH)) / 2;
    H.flyTo(b.x - (mx - innerWidth / 2) / z, b.y + (my - innerHeight / 2) / z, z);
  }
  function step(dir) {
    var P = lines.placed, n = P.length; if (!n || !rt.lines.on) return;
    var i = lines.sel;
    for (var t = 0; t < n; t++) { i = (i + dir + n) % n; if (visibleLine(P[i])) break; }
    openLine(i); fly(P[i]); fillLines();
  }
  function wireInput() {
    addEventListener('keydown', function (e) {
      if (H.gbox.style.display === 'block') return;
      if (e.target && e.target.id === 'lyFind') return;
      if (e.key === 'e') step(1); else if (e.key === 'E') step(-1); else if (e.key === 'Backspace') lines.sel = -1;
    });
    // a tap within 9 px of a spark opens that line; only a tap on the wafer itself (05-lines finding 9)
    var down = {}, moved = 0;
    addEventListener('pointerdown', function (e) { if (Object.keys(down).length) moved = 99; else moved = e.target === H.cv ? 0 : 99;   // tapUp: began on the canvas
      down[e.pointerId] = [e.clientX, e.clientY]; }, true);
    addEventListener('pointermove', function (e) { var d = down[e.pointerId]; if (d) moved = Math.max(moved, Math.hypot(e.clientX - d[0], e.clientY - d[1])); }, true);
    addEventListener('pointercancel', function (e) { delete down[e.pointerId]; }, true);
    addEventListener('pointerup', function (e) {
      var was = down[e.pointerId]; delete down[e.pointerId];
      if (!was || e.target !== H.cv || moved >= 4 || Object.keys(down).length > 0) return;
      var P = lines.placed; if (!P.length || !rt.lines.on) return;
      var best = -1, bd = 81;
      for (var i = 0; i < P.length; i++) { if (!visibleLine(P[i])) continue; var p = edScreen(P[i]), d = (p[0] - e.clientX) * (p[0] - e.clientX) + (p[1] - e.clientY) * (p[1] - e.clientY); if (d < bd) { bd = d; best = i; } }
      if (best >= 0) { openLine(best); fly(P[best]); }
    });
  }

  // ======================================================================== SECTION 5: wafer layers and app rows
  function applyPeriod(v) {
    var m = v && String(v).match(/^(20\d\d)(?:-(\d\d))?(?:-(\d\d))?$/);
    if (!m) { KY.lit.period = null; return; }
    H.lightTime(+m[1], m[2] ? +m[2] : 0, m[3] ? +m[3] : 0);
    lastK0 = KY.lit.K ? KY.lit.K[0] : -1;
  }
  function day(u) { return new Date(u * 1000).toISOString().slice(0, 10); }
  // the engine's own controls (tap, /, keys) light a repository or a period; the original follows the engine, never back
  function refreshWaferTags() {
    if (!rt.repos || !N()) return;
    var lr = KY.lit.repo;
    if (lr >= 0 && lr !== lastRepo && !rt.repos.on && !booting) { lastRepo = lr; mirrorOn('repos'); }
    lastRepo = lr;
    if (rt.repos.status === 'OK' || rt.repos.status === 'WAIT' || rt.repos.status === 'LOAD') {
      var name = lr >= 0 && H.repos[lr] ? H.repos[lr].name : null; rt.repos.value = name || rt.repos.value;
      setQuiet('repos', 'OK', !rt.repos.on ? 'off' : (name ? name : 'none lit'));
    }
    var K = KY.lit.K, ci = KY.lit.Ci, k0 = K ? K[0] : -1;
    if (k0 >= 0 && k0 !== lastK0 && !rt.periods.on && !booting) { lastK0 = k0; mirrorOn('periods'); }
    lastK0 = k0;
    if (rt.periods.status === 'OK' || rt.periods.status === 'WAIT' || rt.periods.status === 'LOAD') {
      var c = H.commits, txt = 'none lit';
      if (k0 >= 0 && ci && c[ci[0]] && c[ci[1] - 1]) txt = (rt.periods.value ? rt.periods.value + ' · ' : '') + fmt(ci[1] - ci[0]) + ' commits, ' + day(c[ci[0]].unix) + ' to ' + day(c[ci[1] - 1].unix);
      setQuiet('periods', 'OK', !rt.periods.on ? 'off' : txt);
    }
  }
  function mirrorOn(id) { rt[id].on = true; var el = original(id); if (el) el.checked = true; writeURL(); }
  function setQuiet(id, s, why) { var r = rt[id]; if (r.status === s && r.why === why) return; r.status = s; r.why = why; paintRow(id); }
  function N() { return H.N > 0 && H.SPACE > 0; }
  // editions: one amber ring at the radius of the first commit at or after each cut stamp; beyond the rim, counted
  var eds = { placed: [], beyond: [] };
  function stampUnix(s) { return Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12)) / 1000; }
  function loadEditions() {
    var r = rt.editions;
    return verified('editions').then(function (j) {
      if (!j || j.schema !== 'kuiper.editions.v1' || !Array.isArray(j.editions)) throw new Error('editions.json schema is not kuiper.editions.v1');
      if (r.rec.source.features && j.editions.length !== r.rec.source.features) throw new Error('features ' + j.editions.length + ' ≠ record ' + r.rec.source.features);
      var c = H.commits, last = c[c.length - 1].unix;
      eds.placed = []; eds.beyond = [];
      j.editions.forEach(function (e) {
        var u = stampUnix(e.stamp);
        if (u > last) { eds.beyond.push(e); return; }
        var i = Math.min(c.length - 1, H.findBy('unix', u - 1) + 1);
        eds.placed.push({ e: e, k: c[i].k0, r: Math.sqrt(c[i].k0) });
      });
      r.placed = eds.placed.length; r.total = j.editions.length; r.loaded = true;
      setState('editions', 'OK', fmt(r.placed) + ' of ' + fmt(r.total) + ' placed' + (eds.beyond.length ? ', ' + fmt(eds.beyond.length) + ' beyond the rim' : ''));
      KY.redraw();
    }).catch(function (e) { r.loaded = true; setState('editions', 'FAIL', String(e.message || e)); });
  }
  function drawEditions(o2) {
    var c = KY.cam, W = o2.canvas.width, Hh = o2.canvas.height, x0 = (0 - c.x) * c.zoom + W / 2, y0 = Hh / 2 + c.y * c.zoom;
    o2.save(); o2.font = '11px ui-monospace,Consolas,monospace'; o2.lineWidth = 1.5;
    eds.placed.forEach(function (p) { var rp = p.r * c.zoom; if (rp > 30000 || rp < 2) return;
      o2.strokeStyle = 'rgba(255,176,0,.75)'; o2.beginPath(); o2.arc(x0, y0, rp, 0, 6.2832); o2.stroke();
      o2.fillStyle = 'rgba(255,176,0,1)'; o2.fillText('E' + p.e.number, x0 - rp * 0.707 - 18, y0 + rp * 0.707 + 12); });
    if (eds.beyond.length) { var R = Math.sqrt(H.SPACE) * c.zoom; if (R < 30000) {
      o2.strokeStyle = 'rgba(255,176,0,1)'; o2.beginPath(); o2.moveTo(x0 + R, y0); o2.lineTo(x0 + R + 10, y0); o2.stroke();
      o2.fillStyle = 'rgba(255,176,0,1)'; o2.fillText(eds.beyond.map(function (e) { return 'E' + e.number; }).join(' ') + ' beyond the wafer’s last commit', x0 + R + 14, y0 + 4); } }
    o2.restore();
  }
  function load(id) {
    if (id === 'lines') return loadLines();
    if (id === 'editions') return loadEditions();
    var r = rt[id];
    if (r.rec.format === 'engine') { r.loaded = true; refreshWaferTags(); return Promise.resolve(); }
    if (r.rec.source && r.rec.source.file && !r.rec.module_registers) return loadSource(id);
    return Promise.resolve();
  }
  // the record is checked before anything loads: licence, format, colour, substrate (team-2/STEPS.md 3.1, 3.4)
  function admitRecord(r) {
    if (!r.licence || /^UNSETTLED/i.test(r.licence)) return ['REFUSED', 'licence unsettled' + (r.licence ? ' (' + r.licence.replace(/^UNSETTLED:?\s*/i, '') + ')' : '')];
    if (FORMATS.indexOf(r.format) < 0) return ['REFUSED', 'format ' + r.format + ' not admitted'];
    if (!PALETTE[String(r.colour).toLowerCase()]) return ['REFUSED', 'colour ' + r.colour + ' not in PALETTE.md'];
    if (r.substrate && M.substrate && r.substrate !== M.substrate) return ['REFUSED', 'substrate ' + r.substrate + ' ≠ ' + M.substrate];
    if (r.key !== 'layer:' + r.id) return ['REFUSED', 'key ' + r.key + ' ≠ layer:' + r.id];
    return null;
  }

  // ======================================================================== SECTION 6: the URL (R3: hash written, query read)
  function hashFields() {
    var h = location.hash.replace(/^#/, ''), out = [];
    if (!h) return out;
    h.split('&').forEach(function (kv) { if (!kv) return; var i = kv.indexOf('='); out.push(i < 0 ? [kv, null] : [kv.slice(0, i), kv.slice(i + 1)]); });
    return out;
  }
  function linkLayers() {
    var hv = null; hashFields().forEach(function (f) { if (f[0] === 'layers') hv = f[1] == null ? '' : f[1]; });
    if (hv !== null) return { from: 'hash', ids: decodeURIComponent(hv).split(',').filter(Boolean) };
    var q = new URLSearchParams(location.search).get('layers');
    if (q !== null) return { from: 'query', ids: q.split(',').filter(Boolean) };
    return null;
  }
  function onList() { return M.order.filter(function (id) { return rt[id] && rt[id].on; }); }
  function writeURL() {
    if (booting || !M) return;
    var f = hashFields().filter(function (x) { return x[0] !== 'layers'; });
    f.push(['layers', onList().join(',')]);
    var q = new URLSearchParams(location.search); q.delete('layers');
    var qs = q.toString();
    var url = location.pathname + (qs ? '?' + qs : '') + '#' + f.map(function (x) { return x[1] == null ? x[0] : x[0] + '=' + x[1]; }).join('&');
    try { history.replaceState(history.state, '', url); } catch (e) { /* a sandboxed frame may refuse; the layers still work */ }
  }
  function applyLink() {
    var L = linkLayers(); if (!L) return;
    var want = {}; L.ids.forEach(function (id) { want[id] = 1; });
    M.order.forEach(function (id) { var r = rt[id]; if (!r || r.status === 'REFUSED') return;
      var on = !!want[id]; if (r.on === on) return;
      if (booting) { r.on = on; var el = original(id); if (el) el.checked = on; } else set(id, on); });
  }

  // ======================================================================== install
  function install(K) {
    KY = K; H = K.hooks;
    buildPanel();
    wireInput();
    KY.draw.add(function (o2) {
      if (!M) return;
      refreshWaferTags();
      M.order.forEach(function (id) { var r = rt[id]; if (!r || !r.on || r.status === 'REFUSED') return;
        if (id === 'lines') drawLines(o2); else if (id === 'editions') drawEditions(o2); else if (r.draw) r.draw(o2, KY); });
    }, 30);
    fetchBytes(MANIFEST).then(function (buf) {
      var j = JSON.parse(new TextDecoder('utf-8').decode(buf));
      if (j.schema !== SCHEMA) throw new Error(MANIFEST + ' schema ' + j.schema + ' is not ' + SCHEMA);
      var ids = {}; j.layers.forEach(function (r) { ids[r.id] = r; });
      j.order.forEach(function (id) { if (!ids[id]) throw new Error('order names ' + id + ', which has no record'); });
      M = j;
      j.order.forEach(function (id) { var r = ids[id]; rt[id] = { rec: r, on: !!r.on, value: null, status: 'WAIT', why: 'wafer', placed: 0, total: 0, loaded_sha256: null, draw: null, loaded: false }; });
      manifestWhy = 'OK · ' + j.layers.length + ' records';
      fillRows();
      applyLink();
      j.order.forEach(function (id) { var r = rt[id], no = admitRecord(r.rec);
        if (no) { r.on = false; setState(id, no[0], no[1]); return; }
        if (r.rec.state && r.rec.state.status) setState(id, r.rec.state.status, r.rec.state.why); else setState(id, 'WAIT', 'wafer'); });
      return H.wafer.then(function () {
        booting = false;
        j.order.forEach(function (id) { var r = rt[id];
          if (r.status === 'REFUSED' || (r.rec.state && r.rec.state.status)) return;
          if (r.rec.preload || r.on) load(id); else setState(id, 'WAIT', 'not asked for'); });
        refreshWaferTags();
        // a listed layer whose module was admitted but never registered says so (team-2/STEPS.md 3.3)
        setTimeout(function () { j.order.forEach(function (id) { var r = rt[id], mid = moduleId(r.rec.module);
          if (mid && mid !== ID && KY.modules && KY.modules[mid] && !r.registered && r.status !== 'REFUSED') setState(id, 'WAIT', 'module ' + mid + ' did not register'); }); }, 8000);
        addEventListener('hashchange', function () { applyLink(); });
        KY.redraw();
      }, function (why) {
        booting = false;
        var words = String(why && why.message || why || 'the wafer refused');
        j.order.forEach(function (id) { rt[id].on = false; setState(id, 'REFUSED', 'the wafer refused: ' + words); });
        alertLine('every layer REFUSED · the wafer refused: ' + words);
      });
    }).catch(function (e) {
      manifestWhy = 'FAIL · ' + String(e.message || e);
      var w = panel.querySelector('.ky-ly-why'); if (w) w.textContent = manifestWhy;
      alertLine('the layer registry did not load: ' + manifestWhy);
    });
    return api;
  }
  var api = { schema: SCHEMA, generation: GEN, inspect: inspect, get: get, set: set, value: value, register: register,
    step: step, open: function (i) { openLine(i); fly(lines.placed[i]); },
    edScreen: function (i) { var b = lines.placed[i]; return b ? edScreen(b) : null; },
    placed: function () { return lines.placed.length; } };

  try { window.__KUIPER_LAYERS__ = api; } catch (e) { /* a frozen window property: the api is KY.modules.layers.api */ }
  if (window.KY && typeof window.KY.register === 'function') {
    window.KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN, requires: REQUIRES, provides: ['layers'],
      install: install, inspect: inspect });
  }
})();
