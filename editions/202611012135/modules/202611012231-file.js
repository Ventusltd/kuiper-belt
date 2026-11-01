/* kuiper module file, generation 202611012231 (UTC), Apache-2.0 (kuiper-belt)
 * Opus team 6, NL-010 roadmap step 6 "the File menu of an OS, and the hash deep-link grammar"
 * (neural-link FIXES/NL-010/ROADMAP.md step 6; team-3/STEPS.md 6.1-6.5; ROADMAP "Resolved between teams" R3).
 * NOTICE: the copy-or-show clipboard pattern, the export's blank check and the stamp that travels with the artefact are
 * GridAtlas's method, Copyright 2026 Ventus Ltd, Apache-2.0 (gridatlas@5ec7f62 LICENSE, NOTICE;
 * atlas/modules/202609031958-menu-bar.js:707-733, :794-834, :1082-1097, :1120-1137, :1354-1365). No GridAtlas bytes
 * are copied verbatim but the words of two row labels. Code Apache-2.0; text and data CC BY 4.0 (kuiper-belt README).
 *
 * requires: keyPlace address describe goKey lightTime home flyTo safeBox fmt card gbox gin SPACE N repos wafer cv ov hud
 *           big panels draw redraw cam lit sel layers
 * optional (used when admitted earlier, never required): kuiper-shell (the FILE/EDIT/ABOUT panels), line-card (the
 *           selected index), see-through (its link()), apps (the launcher, data/apps.json)
 * provides: file, link (KY.modules.file.api.link is the grammar: read, read(text), hashText, set, clear, inspect)
 * reads: location (search + hash); lazily, never at install: keys.json (only to resolve or write a `line`),
 *        data/editions.json (on opening `Open an edition`), HEAD of the seven EVIDENCE files (on opening FILE),
 *        data/apps.json (only when the apps module is admitted)
 * writes: location.hash by history.replaceState (400 ms debounce), the shell's FILE group [data-group="file"], one EDIT
 *        row, one ABOUT sentence, #ky-file-css, a downloaded PNG, #ky-file-print for print.
 *
 * Departures, each named: (1) the roadmap's requires list names edCard edFly card menuBar, which are not hooks
 * (handoff/04-loader/HOOKS.md: 28 hooks + cam lit sel redraw draw panels); edCard/edFly/edPlaced moved into Opus 3's
 * layers module (layers.js:8-11), so a line is opened through KY.modules.layers.api.open(i) and the shell is optional.
 * (2) Byte counts of the EVIDENCE rows are measured by HEAD when FILE opens, not baked in, because six of the seven files
 * are written by the integrator after this module is cut; a missing file reads "missing · HTTP 404" in its row.
 */
(function () {
  'use strict';
  var ID = 'file', GEN = '202611012231', SCHEMA = 'kuiper.file.v1';
  if (!window.KY || typeof window.KY.register !== 'function') return;   // no hook table: Edition 4's page is unchanged

  var KY = null, H = null;
  var ABOUT_SENTENCE = 'A link to this page is its hash: key, line, repo, period, layers; copy it from File, paste it in Edit; the pointer keeps it.';
  var EVIDENCE = ['keys.json', 'proof/edition-sha256.txt', 'proof/keys-summary.json', 'modules.json', 'LICENCES.md',
    'proof/android-journey.json', 'README.md'];
  var EVIDENCE_WHAT = { 'keys.json': 'the register of verified lines', 'proof/edition-sha256.txt': 'sha256 of every file but itself',
    'proof/keys-summary.json': 'the key.py round trips', 'modules.json': 'the admitted modules and their hashes',
    'LICENCES.md': 'the licence register', 'proof/android-journey.json': 'the Android journey', 'README.md': 'this edition' };
  var FALLBACK_APPS = [                                  // used only when no apps module (Opus 7) is admitted; the shell's own estate links
    { id: 'see-through', name: 'See Through', link: '../../see-through/', star: true },
    { id: 'learn-the-kuiper', name: 'Learn the Kuiper', link: '../../learn-the-kuiper/' }];

  var st = { schema: SCHEMA, id: ID, generation: GEN, installed: false, panel: null, rows: 0, groups: [],
    fields: {}, last_read: null, last_written: null, refused: [], said: [], writes: 0, reads: 0, deferred: 0,
    bodies: 'not loaded', evidence: {}, editions: 'not loaded', sub: null, opened: [] };
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function shell() { try { var m = KY.modules['kuiper-shell']; return m && m.api ? m.api : (window.__KUIPER_SHELL__ || null); } catch (e) { return null; } }
  function closePanel() { var s = shell(); if (s && s.close) s.close(); }
  // closeThen(fn): close the open panel and run fn after the shell's history.back() has landed (kuiper-shell.js closeAll);
  // the page's own popstate (index.html ANDROID BACK) closes an open card, so a card must open after that popstate
  function closeThen(fn) {
    var s = shell(), open = s && s.inspect ? !!s.inspect().open : false;
    if (!open) { fn(); return; }
    var done = false, go = function () { if (done) return; done = true; removeEventListener('popstate', pop); setTimeout(fn, 30); };
    var pop = function () { go(); };
    addEventListener('popstate', pop); s.close(); setTimeout(go, 600);
  }
  function layersApi() { var m = KY && KY.modules && KY.modules.layers; return m && m.api ? m.api : null; }
  function cardApi() { var m = KY && KY.modules && KY.modules['line-card']; return m && m.api ? m.api : null; }
  function fmt(n) { return H.fmt(n); }

  // ======================================================================== SECTION A: KY.link, the hash grammar (6.3, 6.4) (LEAD)
  // The field table, in its order; hashText() writes only the first five (edition, app, sub, space are never written by
  // this page, team-3/STEPS.md 6.3 "writes when").
  var FIELDS = ['key', 'line', 'repo', 'period', 'layers', 'edition', 'app', 'sub', 'space'];
  var WRITTEN = ['key', 'line', 'repo', 'period', 'layers'];
  var RULES = {
    key: function (v) { return /^\d{1,15}$/.test(v) && +v < H.SPACE; },
    line: function (v) { return /^[0-9a-f]{40}:\d+$/.test(v); },
    repo: function (v) { return v.length > 0 && v.length <= 100 && !/[\s&#]/.test(v); },
    period: function (v) { return /^20\d\d(-\d\d){0,2}$/.test(v); },
    layers: function (v) { return /^([a-z0-9-]+(,[a-z0-9-]+)*)?$/.test(v); },
    edition: function (v) { return /^\d{12}$/.test(v); },
    app: function (v) { return /^[a-z0-9-]{1,64}$/.test(v); },
    sub: function (v) { return v.length > 0 && v.length <= 200; },
    space: function (v) { return /^\d{1,16}$/.test(v); }
  };
  function pairs(s) {
    var out = [];
    String(s || '').split('&').forEach(function (kv) {
      if (!kv) return; var i = kv.indexOf('='), k = i < 0 ? kv : kv.slice(0, i), v = i < 0 ? '' : kv.slice(i + 1);
      try { k = decodeURIComponent(k); v = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) { out.push([k, null]); return; }
      out.push([k, v]);
    });
    return out;
  }
  // parse(search, hash): the merge rule (Learn the Kuiper one.js:468): search first, then hash; the hash wins a duplicate.
  // A field that fails its rule, and a name that is not in the table, is ignored and named once (`link: <f> not understood`).
  function parse(search, hash) {
    var f = {}, bad = [];
    pairs(String(search || '').replace(/^\?/, '') + '&' + String(hash || '').replace(/^#/, '')).forEach(function (p) {
      var k = p[0], v = p[1];
      if (!RULES.hasOwnProperty(k) || v == null || !RULES[k](v)) { if (bad.indexOf(k) < 0) bad.push(k); delete f[k]; return; }
      f[k] = v; var j = bad.indexOf(k); if (j >= 0) bad.splice(j, 1);
    });
    return { fields: f, refused: bad };
  }
  // read(text): a pasted Kuiper or See Through link, or a bare hash -> {fields, refused, target, url}
  function readText(text) {
    var t = String(text || '').trim(), u = null;
    if (!t) return null;
    if (/^[#?]?[a-z]+=/.test(t)) { var r0 = parse('', t.replace(/^[#?]/, '')); r0.target = 'kuiper'; return r0; }
    try { u = new URL(t, location.href); } catch (e) { return null; }
    var r = parse(u.search, u.hash);
    if (/\/see-through\//.test(u.pathname)) {        // a See Through link: navigation to the same host's See Through, its hash kept
      r.target = 'see-through'; r.url = new URL('../../see-through/' + u.hash, location.href).href; return r;
    }
    r.target = 'kuiper'; return r;
  }
  // values are encodeURIComponent'd, then ':' and ',' are written back as themselves (they are legal in a fragment,
  // RFC 3986 3.5), so a written link reads as the grammar's examples do: #line=<40 hex>:5, #layers=lines,see-through
  function enc(v) { return encodeURIComponent(v).replace(/%3A/gi, ':').replace(/%2C/gi, ','); }
  function hashText(f) {
    f = f || st.fields; var out = [];
    WRITTEN.forEach(function (k) { if (f[k] != null && f[k] !== '') out.push(k + '=' + enc(f[k])); });
    return out.join('&');
  }
  // `layers` belongs to Opus 3's registry, which writes it into the hash itself (layers.js writeURL): read it back from
  // the hash so this writer never drops it
  function syncLayers() {
    var p = parse('', location.hash).fields; if ('layers' in p) st.fields.layers = p.layers;
    var L = layersApi(); if (!('layers' in p) && L && L.inspect) { /* not in the hash: the registry has not written yet */ }
  }
  var wTimer = null;
  function writeSoon() { clearTimeout(wTimer); wTimer = setTimeout(writeNow, 400); }       // 400 ms (lesson.js:336)
  function writeNow() {
    clearTimeout(wTimer); wTimer = null;
    syncLayers();
    var h = hashText(), url = location.pathname + location.search + (h ? '#' + h : '');
    if (location.hash.replace(/^#/, '') === h) { st.last_written = h; mine(h); return; }
    try { history.replaceState(history.state, '', url); st.writes++; st.last_written = h; mine(h); lastSeen = h; }
    catch (e) { say('link: the browser refused to write the hash (' + (e && e.message || e) + ')'); }
  }
  function setField(k, v) { if (v == null || v === '') delete st.fields[k]; else st.fields[k] = String(v); }
  function setFields(o) { Object.keys(o).forEach(function (k) { setField(k, o[k]); }); writeSoon(); }
  function clear(keep) { keep = keep || []; Object.keys(st.fields).forEach(function (k) { if (keep.indexOf(k) < 0) delete st.fields[k]; }); writeSoon(); }

  // the readout line: every refusal is named once in #hud (appended after the engine rewrites it each frame)
  function say(words) { st.said.push(words); if (st.said.length > 4) st.said.shift(); KY.redraw(); }
  function refuse(words) { if (st.refused.indexOf(words) < 0) st.refused.push(words); say(words); }

  // ---- the verified lines' bodies, in the layer's own order (layers.js loadLines predicate, index.html:632-633)
  var bodiesP = null, bodies = null;
  // the lines layer must have placed its bodies before an index means anything (layers.js loadLines)
  function linesReady() {
    var L = layersApi(); if (!L || !L.get) return Promise.reject(new Error('the layer registry is not admitted'));
    return new Promise(function (res, rej) {
      var t0 = Date.now(), asked = false;
      (function poll() {
        var g = L.get('lines');
        if (g && g.status === 'OK' && L.placed() > 0) return res(L.placed());
        if (g && (g.status === 'FAIL' || g.status === 'REFUSED' || g.status === 'EMPTY')) return rej(new Error('the lines layer is ' + g.status + ' · ' + g.why));
        if (g && !g.on && !asked && /^OK/.test(String(L.inspect().manifest || ''))) { asked = true; L.set('lines', true); }
        if (Date.now() - t0 > 60000) return rej(new Error('the lines layer did not load in 60 s'));
        setTimeout(poll, 150);
      })();
    });
  }
  function loadBodies() {
    if (bodiesP) return bodiesP;
    st.bodies = 'loading';
    bodiesP = Promise.all([fetch('keys.json').then(function (r) { if (!r.ok) throw new Error('keys.json HTTP ' + r.status); return r.json(); }), linesReady()])
      .then(function (both) { var j = both[0];
        var all = j.bodies || j;
        bodies = all.filter(function (b) { return b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && b.key < H.SPACE; });
        var L = layersApi(), n = L && L.placed ? L.placed() : bodies.length;
        st.bodies = bodies.length === n ? 'OK · ' + bodies.length : 'MISMATCH · ' + bodies.length + ' ≠ layer ' + n;
        if (bodies.length !== n) throw new Error('keys.json gives ' + bodies.length + ' placed bodies, the lines layer ' + n);
        return bodies;
      });
    bodiesP.catch(function (e) { st.bodies = 'FAIL · ' + (e && e.message || e); bodiesP = null; });
    return bodiesP;
  }
  function indexOfId(id) { if (!bodies) return -1; for (var i = 0; i < bodies.length; i++) if (bodies[i].id === id) return i; return -1; }
  function indexOfKey(k) { if (!bodies) return -1; for (var i = 0; i < bodies.length; i++) if (bodies[i].key === k) return i; return -1; }
  function openIndex(i) {
    var L = layersApi(); if (!L || typeof L.open !== 'function') return false;
    if (L.get) { var g = L.get('lines'); if (g && !g.on) L.set('lines', true); }
    L.open(i); var b = bodies && bodies[i];
    if (b) setFields({ line: b.id, key: String(b.key), repo: null, period: null });
    return true;
  }

  // ---- applying fields, in the resolution order: edition, app, layers, period, repo, line, key (the last camera wins)
  function findRepo(name) {
    var R = H.repos || [], low = String(name).toLowerCase(), r = null;
    for (var i = 0; i < R.length && !r; i++) if (R[i].name.toLowerCase() === low) r = R[i];
    for (var j = 0; j < R.length && !r; j++) if (R[j].name.toLowerCase().indexOf(low) >= 0) r = R[j];
    return r;
  }
  function editionTarget(stamp, rest) {
    var path = stamp === '202610311905' ? '../202610311905/belt/' : '../' + stamp + '/';   // editions/README.md:22
    return path + (rest ? '#' + rest : '');
  }
  function restOf(f, drop) {
    var o = []; FIELDS.forEach(function (k) { if (drop.indexOf(k) < 0 && f[k] != null) o.push(k + '=' + enc(f[k])); });
    return o.join('&');
  }
  function appLink(id, f) {
    var a = null, apps = appsList();
    for (var i = 0; i < apps.length; i++) if (apps[i].id === id) a = apps[i];
    if (!a) return null;
    if (id === 'see-through') {
      var S = KY.modules['see-through'] && KY.modules['see-through'].api;
      var carry = { key: f.key, space: f.space, repo: f.repo, sub: f.sub };
      if (S && typeof S.link === 'function') return new URL(S.link(carry), location.href).href;
      var p = []; ['repo', 'key', 'space', 'sub'].forEach(function (k) { if (carry[k] != null) p.push(k + '=' + encodeURIComponent(carry[k])); });
      return new URL(a.link + (p.length ? '#' + p.join('&') : ''), location.href).href;
    }
    var q = restOf(f, ['app', 'edition', 'layers']);
    return new URL(a.link + (q ? '#' + q : ''), location.href).href;
  }
  var appsCache = null;
  function appsList() {
    if (appsCache) return appsCache;
    var A = KY.modules.apps && KY.modules.apps.api;
    var list = A && typeof A.list === 'function' ? A.list() : null;
    if (Array.isArray(list) && list.length) {
      appsCache = list.map(function (x) { return { id: x.id, name: x.name || x.title || x.id, link: x.link || x.href || x.url, star: x.id === 'see-through' }; })
        .filter(function (x) { return x.id && x.link; });
      appsCache.sort(function (a, b) { return (b.star ? 1 : 0) - (a.star ? 1 : 0); });
      return appsCache;
    }
    return FALLBACK_APPS;
  }
  function layersReady() {
    var L = layersApi(); if (!L || !L.inspect) return Promise.resolve(false);
    return new Promise(function (res) {
      var t0 = Date.now();
      (function poll() { var m = String(L.inspect().manifest || ''); if (/^OK/.test(m)) return res(true); if (/^FAIL/.test(m) || Date.now() - t0 > 30000) return res(false); setTimeout(poll, 150); })();
    });
  }
  function apply(f, how) {
    how = how || {}; st.reads++; st.last_read = { fields: JSON.parse(JSON.stringify(f)), from: how.from || 'hash', at: new Date().toISOString() };
    if (f.edition && f.edition !== KY.edition) {                     // navigate, stop (never kept in this page's hash)
      location.href = editionTarget(f.edition, restOf(f, ['edition'])); return Promise.resolve('edition');
    }
    if (f.app) {
      var u = appLink(f.app, f);
      if (!u) refuse('no app called ' + f.app); else { location.href = u; return Promise.resolve('app'); }
    }
    var chain = Promise.resolve();
    if ('layers' in f && how.from !== 'hash') {                       // on arrival Opus 3 applies its own field (layers.js applyLink)
      chain = chain.then(layersReady).then(function (ok) {
        var L = layersApi(); if (!ok || !L) return;
        var want = {}; f.layers.split(',').filter(Boolean).forEach(function (id) { want[id] = 1; });
        var states = L.inspect().states || {};
        Object.keys(states).forEach(function (id) { if (states[id] !== 'REFUSED') L.set(id, !!want[id]); });
        st.fields.layers = f.layers;
      });
    }
    var cam = { period: null, repo: null, line: null, key: null };
    if (f.period) chain = chain.then(function () {
      var m = f.period.match(/^(20\d\d)(?:-(\d\d))?(?:-(\d\d))?$/);
      H.lightTime(+m[1], m[2] ? +m[2] : 0, m[3] ? +m[3] : 0); cam.period = f.period;
    });
    if (f.repo) chain = chain.then(function () {
      var r = findRepo(f.repo);
      if (!r) { refuse('no repository called ' + f.repo); return; }
      KY.lit.repo = r.i; KY.sel.target = null; if (!f.period) H.card.style.display = 'none'; H.home(); KY.redraw(); cam.repo = r.name;
    });
    if (f.line) chain = chain.then(function () {
      return loadBodies().then(function () {
        var i = indexOfId(f.line);
        if (i < 0) { refuse('line ' + f.line + ' is not in this edition\'s keys.json'); return; }
        openIndex(i); cam.line = f.line; cam.key = String(bodies[i].key);
      }, function (e) { refuse('line ' + f.line + ': ' + (e && e.message || e)); });
    });
    if (f.key) chain = chain.then(function () {
      if (cam.key === f.key) return;                                  // the line already put the camera on this key
      return openKey(+f.key, true).then(function (ok) { if (ok) cam.key = f.key; });
    });
    return chain.then(function () {
      var nf = {}; if ('layers' in st.fields) nf.layers = st.fields.layers;
      if (cam.period) nf.period = cam.period; if (cam.repo) nf.repo = cam.repo;
      if (cam.line) nf.line = cam.line; if (cam.key) nf.key = cam.key;
      st.fields = nf; writeSoon(); return 'applied';
    });
  }
  // a key: when it is a placed verified line, its card (the line is the header) lands in the clear space; else goKey
  function openKey(k, fromLink) {
    if (!(k >= 0 && k < H.SPACE)) { refuse('key ' + k + ' is not on this wafer (SPACE ' + H.SPACE + ')'); return Promise.resolve(false); }
    return loadBodies().then(function () { return indexOfKey(k); }, function () { return -1; }).then(function (i) {
      if (i >= 0 && openIndex(i)) return true;
      H.goKey(k); setFields({ key: String(k), line: null, repo: null, period: null }); return true;
    });
  }
  function readLocation(from) {
    var p = parse(location.search, location.hash);
    p.refused.forEach(function (k) { refuse('link: ' + k + ' not understood'); });
    return apply(p.fields, { from: from || 'hash' });
  }

  // ---- what the person does writes the hash (6.3 "writes when"; 6.5 VIEW)
  function watchCard() {
    var card = H.card, lastSig = '';
    function look() {
      if (card.style.display !== 'block') { lastSig = ''; return; }
      var lc = cardApi(), info = lc && lc.inspect ? lc.inspect() : null;
      if (info && info.open && info.index >= 0) {                     // a verified line (e/E, a spark tap, a LINES row, Open a line)
        var sig = 'i' + info.index; if (sig === lastSig) return; lastSig = sig;
        loadBodies().then(function () { var b = bodies[info.index]; if (b) setFields({ line: b.id, key: String(b.key), repo: null, period: null }); }, function () {});
        return;
      }
      var m = String(card.textContent || '').match(/^\s*key ([\d,]+)/);   // describe(): "key <b>N</b> ..." (index.html:284-288)
      if (m) { var k = m[1].replace(/,/g, ''), s2 = 'k' + k; if (s2 === lastSig) return; lastSig = s2; setFields({ key: k, line: null, repo: null, period: null }); }
    }
    try { new MutationObserver(look).observe(card, { attributes: true, attributeFilter: ['style'], childList: true, subtree: false }); } catch (e) {}
  }
  function watchFind() {
    var gin = H.gin, gbox = H.gbox;
    // after the engine's own Enter (index.html:605-613) has run, the hash records what it lit; text it did not match is
    // kept for `Open an app → See Through` as #sub=<text> (team-3/STEPS.md 5.7c)
    gbox.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.target !== gin) return;
      var raw = gin.value.trim(), q = raw.replace(/[ ,_]/g, ''), mt = raw.match(/^(20\d\d)(?:-(\d\d))?(?:-(\d\d))?$/);
      if (!raw) return;
      if (mt) { setFields({ period: raw, key: null, line: null, repo: null }); st.sub = null; return; }
      if (/^(?:show\s+)?new(?:\s+code)?(?:\s+(\d+)\s*h?)?$/i.test(raw)) { st.sub = null; return; }
      if (/^\d+$/.test(q)) { st.sub = null; return; }                  // the card observer writes the key
      var r = findRepo(raw);
      if (r) { setFields({ repo: r.name, key: null, line: null }); st.sub = null; }
      else st.sub = raw.slice(0, 80);
    }, true);
  }
  // An open panel (kuiper-shell.js openMenu) or an open card (index.html ANDROID BACK, edSync) holds one pushed history
  // entry; this writer writes into whichever entry is current, and the back() that closes the panel or the card returns to
  // the entry below, whose hash is older. So after every history traversal the hash is written again from the fields,
  // and the hashchange that traversal fires is not read as a new link (it is our own older text, not the person's).
  // Which hash is ours: every text this writer wrote (the last 64) and the hash the page arrived with. A traversal that
  // lands on one of them is our own older text and is written over; any other hash is a new link (typed, pasted, or a
  // location.hash assignment, which Chrome also reports as a popstate) and is read.
  var written = [], lastSeen = location.hash.replace(/^#/, '');
  function mine(h) { if (written.indexOf(h) < 0) { written.push(h); if (written.length > 64) written.shift(); } }
  function wireHashchange() {
    mine(location.hash.replace(/^#/, ''));
    function seen() {
      var h = location.hash.replace(/^#/, '');
      if (h === lastSeen) return;                                     // popstate and hashchange both report one change
      lastSeen = h;
      if (h === st.last_written) return;
      if (written.indexOf(h) >= 0) { st.deferred++; setTimeout(writeNow, 0); return; }
      mine(h); readLocation('hashchange');
    }
    addEventListener('popstate', seen);
    addEventListener('hashchange', seen);
  }

  var link = Object.freeze({
    schema: 'kuiper.link.v1', fields: FIELDS.slice(),
    read: function (text) { return text == null ? parse(location.search, location.hash) : readText(text); },
    apply: function (f, how) { return apply(f || {}, how || { from: 'api' }); },
    hashText: function () { syncLayers(); return hashText(); },
    format: function (f) { return hashText(f || {}); },              // the pure serialiser: no state, no layers sync (tester G1)
    parse: function (search, hash) { return parse(search, hash); },
    set: function (k, v) { if (FIELDS.indexOf(k) < 0) return false; if (v != null && !RULES[k](String(v))) return false; setField(k, v); writeSoon(); return true; },
    clear: function (keep) { clear(keep); }, flush: function () { writeNow(); },
    url: function () { syncLayers(); var h = hashText(); return location.origin + location.pathname + (h ? '#' + h : ''); },
    inspect: function () { return { fields: JSON.parse(JSON.stringify(st.fields)), last_read: st.last_read, last_written: st.last_written, refused: st.refused.slice() }; }
  });

  // ==== SECTION C begin (OPUS-6 builder): EXPORT, the EDIT paste field, the Backspace rule, copy-or-show
  // Keys: GridAtlas's export and clipboard method, gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:707-733
  // (copy, else show the payload in full), :794-811 (export this view; the image is checked before it is offered),
  // :817-820 exportStamp (UTC to the minute), :1082-1097 looksBlank (sample a 40x40 probe), :1120-1137 capture INSIDE a
  // render frame, :1354-1365 every export control named by id and data-*-export. The Kuiper's WebGL context is
  // {antialias:false, alpha:false} with no preserveDrawingBuffer (editions/202611012135/index.html:122), so a read outside
  // the frame is opaque black, not transparent: the blank test here is "every probe pixel one colour" (alpha 0 included),
  // GridAtlas's sample taken one step further for an opaque canvas. The capture runs as the last painter of KY.draw.add,
  // after the engine's wafer (index.html:332-363) and overlay (:384 ff.) in the same task.
  var C = (function () {
    var KYc = null, Hc = null, Lk = null, st = { exports: [], copies: [], pastes: [], backspace: 0, capture: null };
    var COPIED_MS = 4000, CAPTURE_ORDER = 1e9, CAPTURE_WAIT_MS = 4000;
    var LICENCE_LINE = 'code Apache-2.0, text and data CC BY 4.0';           // editions/README.md:27
    var BLANK_WORDS = 'the image came back blank; try again after the wafer has drawn';
    function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

    // ---- copy, never silent (6.1 LINK; 6.L1). rowEl: the row that asked; text: the payload.
    function payloadField(rowEl) { return rowEl.parentNode ? rowEl.parentNode.querySelector('input.ky-file-payload[data-for="' + rowEl.id + '"]') : null; }
    var PAYLOAD_CSS = 'ky-file-payload-css';
    function payloadStyle() {                                         // a 44 px field in the shell's face (MB:221 rows >= 44 px)
      if (document.getElementById(PAYLOAD_CSS)) return; var c = mk('style'); c.id = PAYLOAD_CSS;
      c.textContent = 'input.ky-file-payload{display:block;box-sizing:border-box;width:100%;min-height:44px;margin:0;padding:10px 12px;'
        + 'font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#fff;background:#05070c;border:1px solid #2ee6e6;border-radius:0;'
        + '-webkit-user-select:text;user-select:text}';
      document.head.appendChild(c);
    }
    function showPayload(rowEl, text, why) {
      payloadStyle();
      var f = payloadField(rowEl);
      if (!f) { f = mk('input', 'ky-file-payload'); f.type = 'text'; f.readOnly = true; f.setAttribute('data-for', rowEl.id);
        f.setAttribute('aria-label', 'the clipboard is not available here: select and copy this by hand');
        f.addEventListener('click', function (e) { e.stopPropagation(); f.select(); });
        f.addEventListener('focus', function () { f.select(); });
        rowEl.parentNode.insertBefore(f, rowEl.nextSibling); }
      f.value = text; f.title = why;
      try { f.focus({ preventScroll: true }); } catch (e) { try { f.focus(); } catch (e2) {} }
      try { f.select(); f.setSelectionRange(0, text.length); } catch (e) {}
      st.copies.push({ row: rowEl.id, ok: false, why: why, text: text });
      return false;
    }
    function copyText(rowEl, text) {
      var label = rowEl.querySelector('.ky-file-label') || rowEl.firstChild || rowEl;
      if (!rowEl.hasAttribute('data-label')) rowEl.setAttribute('data-label', label.textContent);
      var was = rowEl.getAttribute('data-label'), clip = navigator.clipboard;
      if (!clip || typeof clip.writeText !== 'function') return Promise.resolve(showPayload(rowEl, text, 'navigator.clipboard is not available on this page'));
      var p; try { p = clip.writeText(text); } catch (e) { return Promise.resolve(showPayload(rowEl, text, 'the clipboard refused: ' + (e && e.message || e))); }
      return Promise.resolve(p).then(function () {
        var f = payloadField(rowEl); if (f) f.remove();
        label.textContent = '✓ Copied'; st.copies.push({ row: rowEl.id, ok: true, text: text });
        clearTimeout(rowEl._kyCopied); rowEl._kyCopied = setTimeout(function () { label.textContent = was; }, COPIED_MS);
        return true;
      }, function (e) { return showPayload(rowEl, text, 'the clipboard refused: ' + (e && e.message || e)); });
    }

    // ---- EXPORT (6.1): the capture, the blank test, the stamp
    function looksBlank(canvas) {                                    // GridAtlas :1082 generalised for an opaque canvas
      try {
        var probe = mk('canvas'); probe.width = 160; probe.height = 160;   // 160, not 40: a zoomed wafer is sparse (lead)
        var c = probe.getContext('2d'); c.drawImage(canvas, 0, 0, 160, 160);
        var d = c.getImageData(0, 0, 160, 160).data, r = d[0], g = d[1], b = d[2], a = d[3], anyAlpha = false;
        for (var i = 0; i < d.length; i += 4) { if (d[i + 3] !== 0) anyAlpha = true; if (d[i] !== r || d[i + 1] !== g || d[i + 2] !== b || d[i + 3] !== a) return false; }
        return true;                                                   // one colour (or wholly transparent)
      } catch (e) { return false; }                                    // a tainted canvas is not blank (GridAtlas :1090-1094)
    }
    function utcStamp(now) { return now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'; }      // GridAtlas :817-820
    function editionName() {
      // the page's own name when #big carries one ("Kuiper Edition 5 · …", index.html:638); layers.js writes
      // "Kuiper edition <stamp>" instead, so a twelve-digit stamp is never read as an edition number
      var m = String(Hc.big && Hc.big.textContent || '').match(/Kuiper Edition (\d{1,3})(?!\d)/i);
      return m ? 'Kuiper Edition ' + m[1] + ' · ' + KYc.edition : 'Kuiper edition ' + KYc.edition;
    }
    function viewLink() {
      try { if (Lk && typeof Lk.hashText === 'function') { var h = Lk.hashText(); return location.origin + location.pathname + (h ? '#' + h : ''); } } catch (e) {}
      return location.origin + location.pathname + location.hash;
    }
    // the foot every exported artefact carries: edition, stamp, UTC time, licence, and the link that reopens the view
    function footLines(now) { return [editionName() + ' · ' + utcStamp(now), LICENCE_LINE, viewLink()]; }
    var pending = null;
    function capturePainter() {                                       // runs inside draw(), after the wafer and the overlay
      if (!pending) return; var p = pending; pending = null; clearTimeout(p.timer);
      try {
        var cv = Hc.cv, ov = Hc.ov, W = cv.width, Hh = cv.height;
        if (!W || !Hh) { p.done(null, 'the wafer has no size to capture'); return; }
        var blank = looksBlank(cv);                                   // the wafer itself, read inside its own frame (lead)
        var view = mk('canvas'); view.width = W; view.height = Hh;
        var v = view.getContext('2d'); v.drawImage(cv, 0, 0); v.drawImage(ov, 0, 0, W, Hh);
        p.done(view, null, blank);
      } catch (e) { p.done(null, 'the capture failed: ' + (e && e.message || e)); }
    }
    function capture() {                                              // -> Promise<{view} | {refused}>
      return new Promise(function (res) {
        if (pending) { clearTimeout(pending.timer); pending.done(null, 'a newer capture was asked for'); }
        pending = { done: function (view, why, blank) { res(view ? { view: view, blank: !!blank } : { refused: why }); },
          timer: setTimeout(function () { if (pending) { pending = null; res({ refused: BLANK_WORDS }); } }, CAPTURE_WAIT_MS) };
        KYc.redraw();
      });
    }
    function stamped(view, now) {                                     // innerWidth x min(dpr, 2) wide, the foot below the view
      var s = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(innerWidth * s), Hv = Math.round(innerHeight * s);
      var lines = footLines(now), fs = Math.round(11 * s), lh = Math.round(16 * s), pad = Math.round(8 * s), footH = pad * 2 + lh * lines.length;
      var out = mk('canvas'); out.width = W; out.height = Hv + footH;
      var o = out.getContext('2d'); o.imageSmoothingEnabled = true;
      o.fillStyle = '#000'; o.fillRect(0, 0, W, Hv); o.drawImage(view, 0, 0, W, Hv);
      o.fillStyle = '#05070c'; o.fillRect(0, Hv, W, footH);
      o.fillStyle = '#2ee6e6'; o.fillRect(0, Hv, W, Math.max(1, Math.round(s)));          // the instrument's line (PALETTE.md)
      o.font = fs + 'px ui-monospace, Menlo, Consolas, monospace'; o.textBaseline = 'top'; o.fillStyle = '#c9d3e6';
      lines.forEach(function (t, i) { o.fillText(t, pad, Hv + pad + i * lh, W - 2 * pad); });
      return { canvas: out, foot: { lines: lines, height: footH, scale: s } };
    }
    function say(rowEl, words) {                                      // the row's own second line says what happened
      var h = rowEl.querySelector('.ky-file-why'); if (!h) { h = mk('span', 'gm-hint ky-file-why'); rowEl.appendChild(h); }
      h.textContent = words; rowEl.setAttribute('data-ky-state', words === '' ? '' : words.slice(0, 40));
    }
    function fileName(now) { return 'kuiper-' + KYc.edition + '-' + now.toISOString().slice(0, 16).replace(/[-:]/g, '') + 'Z.png'; }
    function exportImage(rowEl) {
      var now = new Date(); say(rowEl, 'capturing inside the next frame…');
      return capture().then(function (r) {
        if (r.refused) { st.exports.push({ kind: 'image', ok: false, why: r.refused, at: now.toISOString() }); say(rowEl, r.refused); return null; }
        if (r.blank) { st.exports.push({ kind: 'image', ok: false, why: BLANK_WORDS, at: now.toISOString() }); say(rowEl, BLANK_WORDS); return null; }
        var s = stamped(r.view, now);
        return new Promise(function (res) {
          s.canvas.toBlob(function (blob) {
            if (!blob) { say(rowEl, BLANK_WORDS); st.exports.push({ kind: 'image', ok: false, why: 'toBlob returned nothing' }); res(null); return; }
            var url = URL.createObjectURL(blob), a = mk('a'); a.href = url; a.download = fileName(now); a.style.display = 'none';
            document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
            var rec = { kind: 'image', ok: true, file: a.download, bytes: blob.size, width: s.canvas.width, height: s.canvas.height,
              view_height: s.canvas.height - s.foot.height, foot: s.foot.lines, at: now.toISOString() };
            st.exports.push(rec); say(rowEl, '✓ saved ' + a.download + ' · ' + blob.size + ' bytes'); res(rec);
          }, 'image/png');
        });
      });
    }
    // Print: the same image and foot in a print stylesheet; the browser's print-to-PDF is the PDF (no PDF writer copied)
    var PRINT_ID = 'ky-file-print', PRINT_CSS = 'ky-file-print-css';
    function printView(rowEl) {
      var now = new Date(); say(rowEl, 'capturing inside the next frame…');
      return capture().then(function (r) {
        var why = r.refused || (r.blank ? BLANK_WORDS : null);
        if (why) { st.exports.push({ kind: 'print', ok: false, why: why, at: now.toISOString() }); say(rowEl, why); return null; }
        var s = stamped(r.view, now), old = document.getElementById(PRINT_ID); if (old) old.remove();
        if (!document.getElementById(PRINT_CSS)) { var css = mk('style'); css.id = PRINT_CSS;
          css.textContent = '#' + PRINT_ID + '{display:none}@media print{body>*:not(#' + PRINT_ID + '){display:none!important}'
            + '#' + PRINT_ID + '{display:block!important;position:static;background:#fff;color:#000}#' + PRINT_ID + ' img{width:100%;height:auto;display:block}'
            + '@page{margin:10mm}}'; document.head.appendChild(css); }
        var box = mk('div'); box.id = PRINT_ID; box.setAttribute('aria-hidden', 'true');
        var img = mk('img'); img.alt = s.foot.lines[0]; img.src = s.canvas.toDataURL('image/png'); box.appendChild(img);
        document.body.appendChild(box);
        var rec = { kind: 'print', ok: true, width: s.canvas.width, height: s.canvas.height, foot: s.foot.lines, at: now.toISOString() };
        st.exports.push(rec); say(rowEl, '✓ sent to the browser’s print · ' + s.foot.lines[0]);
        var go = function () { try { window.print(); } catch (e) { say(rowEl, 'this browser refused to print: ' + (e && e.message || e)); } };
        if (img.complete) go(); else img.onload = go;
        return rec;
      });
    }
    function exportRows(group, row) {                                 // row(label, onTap, id): the lead's row factory
      var img = row('⤓ Save an image of this view', function (el) { exportImage(el); return true; }, 'kuiper-export-image');
      img.setAttribute('data-ky-export', 'image');
      var pr = row('⎙ Print', function (el) { printView(el); return true; }, 'kuiper-export-print');
      pr.setAttribute('data-ky-export', 'print');
      group.appendChild(img); group.appendChild(pr); return [img, pr];
    }

    // ---- EDIT (6.5): the find box also takes a pasted Kuiper or See Through link; `Paste a link…` opens the same field
    var PLACEHOLDER_LINK = 'a key, a repository, a period, or a pasted link';
    function looksLikeLink(t) { return /^(https?:\/\/|\.{0,2}\/|[#?])/i.test(t) || /^(key|line|repo|period|layers|edition|app|sub|space)=/.test(t); }
    function takePaste(text) {                                        // true when the text was a link and was handled
      var t = String(text || '').trim(); if (!t || !looksLikeLink(t) || !Lk || typeof Lk.read !== 'function') return false;
      var r = Lk.read(t);
      if (!r) { st.pastes.push({ text: t, ok: false, why: 'not a link' }); return false; }
      st.pastes.push({ text: t, ok: true, target: r.target || 'kuiper', fields: r.fields, refused: r.refused });
      if (r.target === 'see-through' || r.target === 'other') { location.href = r.url; return true; }   // navigation, same tab
      if (typeof Lk.apply === 'function') Lk.apply(r.fields, { from: 'paste' });
      return true;
    }
    function wireFind() {
      var gin = Hc.gin, gbox = Hc.gbox;
      // capture phase on #goto runs before the engine's own keydown on #gotoin (index.html:605)
      gbox.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.target !== gin) return;
        var t = gin.value.trim(); if (!looksLikeLink(t)) return;      // the find grammar (index.html:606-613) stays the engine's
        e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
        gbox.style.display = 'none'; takePaste(t);
      }, true);
      if (gin.placeholder !== PLACEHOLDER_LINK) { st.placeholder_was = gin.placeholder; gin.placeholder = PLACEHOLDER_LINK; }
    }
    function openPaste() {                                            // `Paste a link…`: the find box, named for a link
      var gbox = Hc.gbox, gin = Hc.gin;
      try { var sh = KYc.modules && KYc.modules['kuiper-shell'] && KYc.modules['kuiper-shell'].api; if (sh && sh.close) sh.close(); } catch (e) {}
      gbox.style.display = 'block'; gin.value = ''; gin.setAttribute('enterkeyhint', 'go');
      try { gin.focus(); } catch (e) {}
    }
    function pasteRow(editPanel, row) {
      if (!editPanel) return null;
      var r = row('Paste a link…', function () { openPaste(); return true; }, 'ky-edit-paste');
      r.setAttribute('data-ky-edit', 'paste');
      editPanel.appendChild(r); return r;
    }

    // ---- Backspace (whole wafer) clears every field but `layers` (6.3, 6.5)
    function wireBackspace() {
      addEventListener('keydown', function (e) {
        if (e.key !== 'Backspace' || Hc.gbox.style.display === 'block') return;
        var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        st.backspace++;
        if (Lk && typeof Lk.clear === 'function') Lk.clear(['layers']);
      });
    }

    return {
      install: function (K, link) { KYc = K; Hc = K.hooks; Lk = link; K.draw.add(capturePainter, CAPTURE_ORDER); wireFind(); wireBackspace(); },
      exportRows: exportRows, pasteRow: pasteRow, copyText: copyText, exportImage: exportImage, printView: printView,
      takePaste: takePaste, looksBlank: looksBlank, footLines: footLines,
      inspect: function () { return JSON.parse(JSON.stringify(st)); },
      strings: { blank: BLANK_WORDS, licence: LICENCE_LINE, placeholder: PLACEHOLDER_LINK }
    };
  })();
  // ==== SECTION C end


  // ======================================================================== SECTION B: the FILE rows (6.1, 6.2) (LEAD)
  var CSS_ID = 'ky-file-css';
  function installStyle() {
    if (document.getElementById(CSS_ID)) return;
    var P = '#kuiper-menu-bar .gm-panel ', s = mk('style'); s.id = CSS_ID;
    s.textContent = [
      P + '.ky-file-form{display:flex;align-items:center;gap:6px;min-height:44px;margin:0 0 3px;padding:0 0 0 10px;box-sizing:border-box;flex-wrap:wrap}',
      P + '.ky-file-form .ky-file-label{flex:0 0 auto;white-space:nowrap}',
      P + '.ky-file-form input,' + P + 'input.ky-file-payload{flex:1 1 120px;min-width:0;height:44px;box-sizing:border-box;background:#02080b;color:#cfeef6;',
      'border:1px solid rgba(80,220,240,.32);border-radius:2px;font:inherit;padding:0 8px}',
      P + 'input.ky-file-payload{display:block;width:100%;margin:0 0 3px;color:#fff;border-color:#2ee6e6}',
      P + '.ky-file-form button.ky-go{width:56px;flex:0 0 56px;justify-content:center;margin:0;border:1px solid rgba(80,220,240,.32)}',
      P + '.ky-file-why{display:block;color:#ffb000;padding:2px 10px 4px;white-space:normal;overflow-wrap:anywhere}',
      P + '.ky-file-why:empty{display:none}',
      P + '.gm-row .gm-hint.ky-file-why{color:#ffb000;margin-left:8px}',
      P + '.ky-sub{display:none;margin:0 0 3px 12px;border-left:1px solid rgba(80,220,240,.25)}',
      P + '.ky-sub.ky-open{display:block}',
      P + '.ky-row2{display:flex;flex-direction:column;align-items:flex-start!important;justify-content:center}',
      P + '.ky-row2 .gm-hint{margin:2px 0 0;opacity:.75;font-size:10px}',
      P + '.ky-lit{background:rgba(80,220,240,.16)!important;color:#fff!important}',
      P + '[aria-disabled="true"]{opacity:.55;cursor:default}',
      P + '.ky-missing .gm-hint{color:#ffb000!important;opacity:1}'
    ].join('\n');
    document.head.appendChild(s);
  }
  // row(label, onTap, id, hint): a 44 px <button> row in the shell's face. onTap(el) runs; the panel closes unless it
  // returns true (kuiper-shell.js row() keeps the same rule).
  function row(label, onTap, id, hint) {
    var b = mk('button', 'gm-row'); b.type = 'button'; if (id) b.id = id;
    b.appendChild(mk('span', 'ky-file-label', label)); if (hint) b.appendChild(mk('span', 'gm-hint', hint));
    b.addEventListener('click', function (e) { e.stopPropagation(); var keep = false; try { keep = onTap && onTap(b, e) === true; } finally { if (!keep) closePanel(); } });
    st.rows++; return b;
  }
  function heading(parent, text) { var h = mk('div', 'gm-layer-group', text); h.setAttribute('data-ky-file-group', text); parent.appendChild(h); st.groups.push(text); return h; }
  function form(label, id, attrs, onGo) {
    var f = mk('div', 'ky-file-form'); f.id = id;
    var l = mk('label', 'ky-file-label', label), i = mk('input'), g = mk('button', 'ky-go', 'GO'), why = mk('span', 'ky-file-why');
    i.type = 'text'; i.id = id + '-in'; l.htmlFor = i.id; i.autocomplete = 'off'; i.spellcheck = false; i.setAttribute('autocapitalize', 'off');
    Object.keys(attrs).forEach(function (k) { i.setAttribute(k, attrs[k]); });
    g.type = 'button'; g.setAttribute('aria-label', label.replace(/…$/, '') + ': go');
    function go() { why.textContent = ''; onGo(i.value.trim(), why); }
    g.addEventListener('click', function (e) { e.stopPropagation(); go(); });
    // the engine's single-key commands (r n e / Backspace, index.html:614-618) never fire from these fields
    i.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); go(); } else if (e.key === 'Escape') closePanel(); });
    f.appendChild(l); f.appendChild(i); f.appendChild(g);
    var wrap = mk('div'); wrap.appendChild(f); wrap.appendChild(why); st.rows++;
    return { el: wrap, input: i, why: why };
  }
  function keyNow() { return st.fields.key || null; }
  function cmd(k) { return 'python tools/key.py ' + k; }

  var refs = {};
  function buildFile(group) {
    // ---- OPEN
    heading(group, 'Open');
    var ok = form('Open a key…', 'ky-file-key', { inputmode: 'numeric', enterkeyhint: 'go', pattern: '[0-9]*', placeholder: 'a key, digits only' }, function (v, why) {
      var d = v.replace(/[ ,_]/g, '');
      if (!/^\d{1,15}$/.test(d)) { why.textContent = v ? 'key ' + v + ' is not on this wafer (SPACE ' + H.SPACE + ')' : 'type a key: digits only'; return; }
      var k = +d;
      if (k >= H.SPACE) { why.textContent = 'key ' + d + ' is not on this wafer (SPACE ' + H.SPACE + ')'; st.refused.push(why.textContent); return; }
      st.opened.push('key ' + d); closeThen(function () { openKey(k); });
    });
    group.appendChild(ok.el); refs.keyForm = ok;
    // its second line: the command that gives the bytes from a clone (GridAtlas's one runnable command, menu-bar.js:707-733)
    refs.keyCmd = row(cmd('<k>'), function (el) { var k = ok.input.value.replace(/[ ,_]/g, '') || keyNow(); if (!/^\d{1,15}$/.test(k || '')) { C.copyText(el, cmd('<k>')); return true; } C.copyText(el, cmd(k)); return true; }, 'ky-file-key-cmd', '⧉ copy');
    ok.input.addEventListener('input', function () { var k = ok.input.value.replace(/[ ,_]/g, ''); refs.keyCmd.querySelector('.ky-file-label').textContent = cmd(/^\d{1,15}$/.test(k) ? k : (keyNow() || '<k>')); });
    group.appendChild(refs.keyCmd);
    var ol = form('Open a line…', 'ky-file-line', { inputmode: 'text', enterkeyhint: 'go', placeholder: 'blob:line, e.g. 0048802…729d:5' }, function (v, why) {
      if (!/^[0-9a-f]{40}:\d+$/.test(v)) { why.textContent = 'line ' + (v || '…') + ' is not in this edition\'s keys.json'; return; }
      why.textContent = 'opening…';
      loadBodies().then(function () {
        var i = indexOfId(v);
        if (i < 0) { why.textContent = 'line ' + v + ' is not in this edition\'s keys.json'; return; }
        why.textContent = ''; st.opened.push('line ' + v); closeThen(function () { openIndex(i); });
      }, function (e) { why.textContent = 'line ' + v + ': ' + (e && e.message || e); });
    });
    group.appendChild(ol.el); refs.lineForm = ol;
    var eds = mk('div', 'ky-sub'); eds.id = 'ky-file-editions';
    refs.editionsRow = row('Open an edition ▸', function () { var on = eds.classList.toggle('ky-open'); if (on) fillEditions(eds); refs.editionsRow.setAttribute('aria-expanded', String(on)); return true; }, 'ky-file-open-edition');
    refs.editionsRow.setAttribute('aria-expanded', 'false'); refs.editionsRow.setAttribute('aria-controls', eds.id);
    group.appendChild(refs.editionsRow); group.appendChild(eds);
    var apps = mk('div', 'ky-sub'); apps.id = 'ky-file-apps';
    refs.appsRow = row('Open an app ▸', function () {
      var A = KY.modules.apps && KY.modules.apps.api;
      if (A && typeof A.open === 'function') { closePanel(); A.open(); st.opened.push('apps launcher'); return true; }   // step 7's launcher
      var on = apps.classList.toggle('ky-open'); if (on) fillApps(apps); refs.appsRow.setAttribute('aria-expanded', String(on)); return true;
    }, 'ky-file-open-app');
    refs.appsRow.setAttribute('aria-expanded', 'false'); refs.appsRow.setAttribute('aria-controls', apps.id);
    group.appendChild(refs.appsRow); group.appendChild(apps);

    // ---- LINK
    heading(group, 'Link');
    group.appendChild(row('Copy a link to this view', function (el) { writeNow(); C.copyText(el, link.url()); return true; }, 'ky-file-copy-link'));
    refs.copyKey = row('Copy the key', function (el) { var k = keyNow(); if (!k) { sayRow(el, 'no key is open: open a key first'); return true; } C.copyText(el, k); return true; }, 'ky-file-copy-key');
    group.appendChild(refs.copyKey);
    refs.copyCmd = row('Copy ' + cmd('<k>'), function (el) { var k = keyNow(); if (!k) { sayRow(el, 'no key is open: open a key first'); return true; } C.copyText(el, cmd(k)); return true; }, 'ky-file-copy-cmd');
    group.appendChild(refs.copyCmd);

    // ---- EVIDENCE: every row an <a download> to this edition's own file, same origin; the byte count is measured
    heading(group, 'Evidence');
    refs.evidence = EVIDENCE.map(function (p) {
      var a = mk('a', 'gm-row ky-row2'); a.href = p; a.setAttribute('download', p.split('/').pop()); a.setAttribute('data-ky-evidence', p);
      a.appendChild(mk('span', 'ky-file-label', p + ' · ' + EVIDENCE_WHAT[p]));
      var h = mk('span', 'gm-hint', 'bytes: measured when FILE opens'); a.appendChild(h);
      a.addEventListener('click', function (e) { e.stopPropagation(); if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
      group.appendChild(a); st.rows++; return a;
    });

    // ---- EXPORT (the builder's SECTION C)
    heading(group, 'Export');
    C.exportRows(group, row);
  }
  function sayRow(el, words) { var h = el.querySelector('.ky-file-why'); if (!h) { h = mk('span', 'gm-hint ky-file-why'); el.appendChild(h); } h.textContent = words; }

  // the editions, from data/editions.json (Opus 3's data), read when the row is opened; newest first; this one inert
  function fillEditions(box) {
    if (box.getAttribute('data-filled')) return;
    box.setAttribute('data-filled', 'loading'); box.textContent = '';
    fetch('data/editions.json').then(function (r) { if (!r.ok) throw new Error('data/editions.json HTTP ' + r.status); return r.json(); }).then(function (j) {
      var list = (j.editions || []).slice().sort(function (a, b) { return String(b.stamp).localeCompare(String(a.stamp)); });
      st.editions = 'OK · ' + list.length;
      list.forEach(function (e) {
        var label = 'Kuiper Edition ' + e.number + ' · ' + e.stamp;
        if (e.stamp === KY.edition) {
          var cur = mk('button', 'gm-row', label + ' · this edition'); cur.type = 'button'; cur.disabled = true;   // inert, 44 px like its neighbours
          cur.setAttribute('aria-disabled', 'true'); cur.setAttribute('aria-current', 'page');
          cur.setAttribute('data-ky-edition', e.stamp); box.appendChild(cur); return;
        }
        var a = mk('a', 'gm-row', label); a.setAttribute('data-ky-edition', e.stamp); a.href = editionTarget(e.stamp, '');
        a.addEventListener('click', function (ev) { ev.stopPropagation(); writeNow(); var h = hashText(); a.href = editionTarget(e.stamp, e.stamp === '202610311905' ? '' : h); st.opened.push('edition ' + e.stamp); });
        box.appendChild(a);
      });
      var ptr = mk('a', 'gm-row', 'editions/ · the newest edition'); ptr.setAttribute('data-ky-edition', 'pointer'); ptr.href = '../';
      ptr.addEventListener('click', function (ev) { ev.stopPropagation(); writeNow(); var h = hashText(); ptr.href = '../' + (h ? '#' + h : ''); });
      box.appendChild(ptr); box.setAttribute('data-filled', 'ok');
    }).catch(function (e) {
      st.editions = 'FAIL · ' + (e && e.message || e); box.setAttribute('data-filled', '');
      var w = mk('div', 'ky-file-why', 'the editions list did not load: ' + (e && e.message || e)); box.appendChild(w);
    });
  }
  function fillApps(box) {
    box.textContent = '';
    appsList().forEach(function (a) {
      var el = mk('a', 'gm-row' + (a.star ? ' ky-lit' : ''), a.name); el.setAttribute('data-ky-app', a.id); el.href = a.link;
      el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var f = {}; if (a.id === 'see-through') { if (st.sub) f.sub = st.sub; else if (st.fields.key) f.key = st.fields.key; }
        else if (st.fields.key) f.key = st.fields.key;
        el.href = appLink(a.id, f) || a.link; st.opened.push('app ' + a.id);
      });
      box.appendChild(el);
    });
  }
  // HEAD each evidence file once, when FILE first opens (no fetch at install, 6.2); a missing file is said in its row
  var evidenceAsked = false;
  function measureEvidence() {
    if (evidenceAsked) return; evidenceAsked = true;
    refs.evidence.forEach(function (a) {
      var p = a.getAttribute('data-ky-evidence'), h = a.querySelector('.gm-hint');
      fetch(p, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
        var n = r.headers.get('content-length');
        if (!r.ok) { a.classList.add('ky-missing'); a.setAttribute('aria-disabled', 'true'); h.textContent = 'missing · HTTP ' + r.status; st.evidence[p] = { status: r.status }; return; }
        h.textContent = (n != null ? fmt(+n) + ' bytes' : 'size not given'); a.setAttribute('data-ky-bytes', n == null ? '' : n);
        st.evidence[p] = { status: r.status, bytes: n == null ? null : +n };
      }).catch(function (e) { a.classList.add('ky-missing'); h.textContent = 'missing · ' + (e && e.message || e); st.evidence[p] = { error: String(e && e.message || e) }; });
    });
  }
  function onFileOpen() {
    measureEvidence();
    var k = keyNow();
    refs.copyCmd.querySelector('.ky-file-label').textContent = 'Copy ' + cmd(k || '<k>');
    refs.copyKey.querySelector('.ky-file-label').textContent = 'Copy the key' + (k ? ' · ' + k : '');
    if (!refs.keyForm.input.value) refs.keyCmd.querySelector('.ky-file-label').textContent = cmd(k || '<k>');
  }

  function build() {
    var sh = shell(), filePanel = sh && sh.panel ? sh.panel('file') : null;
    var group = filePanel ? filePanel.querySelector('.gm-group[data-group="file"]') : null;
    if (!group && filePanel) { group = mk('div', 'gm-group'); group.setAttribute('data-group', 'file'); filePanel.appendChild(group); }
    if (!group) {                                                     // no shell: FILE is a panel of Edition 4's own (KY.panels)
      filePanel = mk('div'); filePanel.id = 'ky-file-panel'; group = mk('div', 'gm-group'); filePanel.appendChild(group);
      KY.panels.add('file', filePanel, 'File'); st.panel = 'KY.panels (no shell)';
    } else st.panel = 'kuiper-shell FILE';
    group.id = 'ky-file';
    buildFile(group);
    // FILE opened: measure the evidence, refresh the key rows (the shell toggles the panel's hidden attribute)
    try { new MutationObserver(function () { if (!filePanel.hidden && filePanel.offsetParent !== null) onFileOpen(); })
      .observe(filePanel, { attributes: true, attributeFilter: ['hidden', 'class'] }); } catch (e) {}
    // EDIT: `Paste a link…` (6.5); ABOUT: the one sentence (6.4)
    var edit = sh && sh.panel ? sh.panel('edit') : null; if (edit) C.pasteRow(edit, row);
    var about = sh && sh.panel ? sh.panel('about') : null;
    if (about) { var p = mk('p', 'gm-prose', ABOUT_SENTENCE); p.setAttribute('data-owner', 'file'); p.style.margin = '6px 0 0'; about.appendChild(p); }
  }

  // the readout: refusals named once, in #hud after the engine's own text (draw rewrites it each frame)
  function readout() { if (st.said.length) H.hud.textContent += '\n' + st.said.join('\n'); }

  // ======================================================================== install, registration (LEAD)
  function install(K) {
    KY = K; H = K.hooks;
    C.install(K, link);                                   // SECTION C first: its find-box link intercept runs before watchFind
    installStyle(); watchCard(); watchFind(); wireHashchange();
    // the shell installs when the engine has built Edition 4's #bar (kuiper-shell.js whenEngine, 250 ms x 160): FILE waits
    // for it on the same clock, then builds once; without a shell after 40 s, FILE is a panel of Edition 4's own
    var tries = 0;
    (function waitShell() {
      var s = shell(); if (s && s.panel && s.panel('file')) { build(); return; }
      if (++tries >= 160) { build(); return; }
      setTimeout(waitShell, 250);
    })();
    K.draw.add(readout, 40);
    st.installed = true;
    // arrival: after the wafer admitted its data (index.html:208, the wafer promise), the reader runs once
    H.wafer.then(function () { return readLocation('arrival'); }).catch(function (e) { st.last_read = { error: String(e && e.message || e) }; });
    return api;
  }
  function inspect() {
    var o = JSON.parse(JSON.stringify(st)); o.link = link.inspect(); o.c = C.inspect(); o.hash = location.hash; return o;
  }
  var api = Object.freeze({ schema: SCHEMA, generation: GEN, link: link, inspect: inspect,
    openKey: function (k) { return openKey(+k); }, openLine: function (id) { return apply({ line: String(id) }, { from: 'api' }); },
    exportImage: function () { return C.exportImage(document.getElementById('kuiper-export-image')); },
    looksBlank: C.looksBlank, footLines: C.footLines, strings: C.strings, about: ABOUT_SENTENCE });

  window.KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN,
    requires: ['keyPlace', 'address', 'describe', 'goKey', 'lightTime', 'home', 'flyTo', 'safeBox', 'fmt', 'card', 'gbox', 'gin',
      'SPACE', 'N', 'repos', 'wafer', 'cv', 'ov', 'hud', 'big', 'panels', 'draw', 'redraw', 'cam', 'lit', 'sel', 'layers'],
    provides: ['file', 'link'],
    install: install, inspect: inspect });
})();
