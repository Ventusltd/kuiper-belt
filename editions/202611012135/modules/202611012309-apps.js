/* kuiper module apps, generation 202611012309 (UTC), Apache-2.0 (kuiper-belt code)
   Opus team 7, NL-010 roadmap step 7 "the OS of the estate, baby step one" (neural-link FIXES/NL-010/ROADMAP.md
   step 7; FIXES/NL-010/team-4/STEPS.md 7.1-7.5). The app registry (data/apps.json, 34 rows), the launcher (a panel
   under the bar opened from FILE > "Open an app", rows 44 px, the key is the header; no window manager: one app at a
   time, by same-tab navigation, the back gesture is the way home), the periodic table as a layer (data/elements.json:
   the elements keyed on the wafer, the 23 without register files named, not placed) and as an app, and the spider
   sandbox as an app row and a graph layer (data/graphs/overview.json, data/graphs/periodic-table.json, the only two
   graphs copied, DISCLOSED). Never a bar title (the bar is Opus 1's budget, NL-009 06-seethrough.md:24-30).
   Owner questions honoured: Q1 (elements@f7a92fb states no licence: only keys block:<Sym> and register file addresses
   are copied, never a title, a description or a category; the elements layer row reads REFUSED · licence unsettled,
   which layers.js decides from data/layers.json, layers.js:598, and registering never lifts, layers.js:128) and Q5 (no
   spider graph JSON beyond the two DISCLOSED graphs). Nothing is fetched off-origin at load; the launcher checks each
   link with fetch(HEAD) only when it is opened, and a failed link reads FAIL in its row, never hidden.
   GridAtlas lessons: a thing enters only through a registry record (gridatlas@5ec7f62 atlas/current.json:5, :14-21);
   install nothing until the hooks exist, and count what was found (atlas/modules/202609031958-menu-bar.js:8-17, :34);
   the estate's apps as one entity table with a key, a type, a purpose (globalgrid2050@c66759f homepage_v134.html:31-56).
   requires: wafer, keyPlace, address, flyTo, safeBox, esc, fmt, o2, hud, card, repos, commits, SPACE, cam, sel, redraw, draw, panels
   optional (used when admitted earlier, never required): kuiper-shell (FILE panel, close), layers (register, get),
             file (its FILE row "Open an app" calls api.open() and api.list()), line-card (closed before our card)
   provides: apps */
(function () {
  'use strict';
  var ID = 'apps', GEN = '202611012309', SCHEMA = 'kuiper.apps.v1';
  var REQUIRES = ['wafer', 'keyPlace', 'address', 'flyTo', 'safeBox', 'esc', 'fmt', 'o2', 'hud', 'card', 'repos',
    'commits', 'SPACE', 'cam', 'sel', 'redraw', 'draw', 'panels'];
  var FILES = { apps: 'data/apps.json', elements: 'data/elements.json',
    graphs: ['data/graphs/overview.json', 'data/graphs/periodic-table.json'] };
  var HEAD_TIMEOUT_MS = 8000, HEAD_PARALLEL = 4;
  // kuiper-belt PALETTE.md:9-13: record grey-blue, instrument cyan, energised green, attention amber, selected magenta
  var C_RECORD = '#c9d3e6', C_INSTR = '#2ee6e6', C_OK = '#22ee77', C_ATTN = '#ffb000', C_SEL = '#ff2bd6';

  var KY = null, H = null;
  var st = { schema: SCHEMA, id: ID, generation: GEN, installed: false, open: false, view: 'apps', pushed: false,
    apps: { status: 'WAIT', why: '', rows: 0 }, elements: { status: 'WAIT', why: '', placed: 0, named: 0, total: 0, not_computed: 0 },
    spider: { status: 'WAIT', why: '', graphs: {} }, heads: {}, navigated: [], said: [], card: null, entry: 'none' };
  var REG = null, EL = null, GR = {};
  var panel = null, list = null, elsBox = null, headEl = null;
  var appsP = null, elsP = null;

  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function mod(id) { try { var m = KY.modules[id]; return m && m.api ? m.api : null; } catch (e) { return null; } }
  function shell() { return mod('kuiper-shell') || window.__KUIPER_SHELL__ || null; }
  function fmt(n) { return H && H.fmt ? H.fmt(n) : String(n); }
  function esc(v) { return H && H.esc ? H.esc(v) : String(v == null ? '' : v); }

  // ======================================================================== SECTION A: data (LEAD)
  // same origin, no-store, as the edition loads keys.json; an HTTP failure is said in words, never swallowed
  function getJSON(file) {
    return fetch(file, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) { var e = new Error(file + ' HTTP ' + r.status); e.http = r.status; throw e; }
      return r.json().catch(function () { throw new Error(file + ' is not JSON'); });
    }, function (e) { throw new Error(file + ' did not load (' + (e && e.message || 'network') + ')'); });
  }
  function loadApps() {
    if (appsP) return appsP;
    st.apps.status = 'LOAD'; st.apps.why = FILES.apps;
    appsP = getJSON(FILES.apps).then(function (j) {
      if (!j || j.schema !== 'kuiper.apps.v1' || !Array.isArray(j.apps)) throw new Error(FILES.apps + ' schema ' + (j && j.schema) + ' is not kuiper.apps.v1');
      REG = j; st.apps.rows = j.apps.length; st.apps.status = 'OK'; st.apps.why = fmt(j.apps.length) + ' apps';
      return j;
    }).catch(function (e) { st.apps.status = 'FAIL'; st.apps.why = String(e.message || e); REG = null; throw e; });
    return appsP;
  }
  function loadElements() {
    if (elsP) return elsP;
    st.elements.status = 'LOAD'; st.elements.why = FILES.elements;
    elsP = getJSON(FILES.elements).then(function (j) {
      if (!j || !Array.isArray(j.elements)) throw new Error(FILES.elements + ' holds no elements list');
      EL = j; var placed = 0, named = 0, nc = 0;
      j.elements.forEach(function (e) {
        if (Number.isFinite(e.key) && e.key >= 0 && e.key < H.SPACE) placed++;
        else if (e.files_listed === 0 || /lists no files|no register files/.test(e.why || '')) named++; else nc++;
      });
      st.elements.placed = placed; st.elements.named = named; st.elements.not_computed = nc; st.elements.total = j.elements.length;
      st.elements.status = 'OK'; st.elements.why = fmt(placed) + ' placed';
      return j;
    }).catch(function (e) { st.elements.status = 'FAIL'; st.elements.why = String(e.message || e); elsP = null; throw e; });
    return elsP;
  }
  function elementsLine() {
    var E = st.elements;
    if (E.status !== 'OK') return 'periodic table · ' + E.status + (E.why ? ' · ' + E.why : '');
    return fmt(E.placed) + ' elements placed, ' + fmt(E.named) + ' counted, not placed'
      + (E.not_computed ? ', ' + fmt(E.not_computed) + ' not computed (no clone)' : '')
      + (EL && EL.counts && Number.isFinite(EL.counts.live_register) ? ' · ' + fmt(EL.counts.live_register) + ' in the live register, ' + fmt(E.total) + ' catalogued' : ' · ' + fmt(E.total) + ' catalogued, the live register not counted');
  }
  function layerTag(id) {
    var L = mod('layers'); if (!L || !L.get) return '';
    var r = L.get(id); return r ? r.status + (r.why ? ' · ' + r.why : '') : '';
  }

  // ======================================================================== SECTION B: the launcher panel (LEAD)
  var CSS = ''
    + '#ky-apps{position:fixed;left:4px;right:4px;top:40px;z-index:10025;display:none;flex-direction:column;box-sizing:border-box;'
    + 'max-height:calc(100dvh - 48px);background:rgba(4,10,13,.98);border:1px solid rgba(80,220,240,.32);border-top:0;'
    + 'box-shadow:0 12px 34px rgba(0,0,0,.68);color:#cfeef6;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:left;'
    + 'padding:0 6px calc(6px + env(safe-area-inset-bottom,0px));pointer-events:auto;overscroll-behavior:contain}'
    + '#ky-apps.ky-open{display:flex}'
    + '@media (min-width:641px){#ky-apps{right:auto;width:min(560px,96vw)}}'
    + '#ky-apps .ky-apps-h{display:flex;align-items:center;gap:8px;min-height:44px;flex:none;border-bottom:1px solid #12414a}'
    + '#ky-apps .ky-apps-t{flex:1;color:#2ee6e6;letter-spacing:.12em;text-transform:uppercase;font-size:10px;line-height:1.4}'
    + '#ky-apps .ky-apps-t small{display:block;color:#6fa2ae;letter-spacing:.03em;text-transform:none;font-size:10px}'
    + '#ky-apps button.ky-x,#ky-apps button.ky-back{flex:none;min-width:44px;min-height:44px;border:0;background:transparent;color:#cfeef6;font:16px/1 ui-monospace,monospace;cursor:pointer}'
    + '#ky-apps .ky-apps-list{flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}'
    + '#ky-apps .ky-app{display:flex;align-items:stretch;min-height:44px;box-shadow:inset 0 -1px #121a26}'
    + '#ky-apps a.ky-app-a{flex:1;display:block;min-height:44px;box-sizing:border-box;padding:6px 6px;color:#cfeef6;text-decoration:none;-webkit-tap-highlight-color:transparent;min-width:0}'
    + '#ky-apps .ky-app-k{display:block;color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '#ky-apps .ky-app-n{display:block;color:#d5dcea}'
    + '#ky-apps .ky-app-p{display:block;color:#8fb3bd;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '#ky-apps .ky-app-l{display:block;color:#6fa2ae;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '#ky-apps .ky-app-s{margin-left:6px;color:#6fa2ae}#ky-apps .ky-app-s[data-s=OK]{color:#22ee77}#ky-apps .ky-app-s[data-s=FAIL]{color:#ffb000}'
    + '#ky-apps button.ky-app-w{flex:none;width:52px;min-height:44px;border:0;border-left:1px solid #121a26;background:transparent;color:#2ee6e6;font:10px/1.2 ui-monospace,monospace;cursor:pointer}'
    + '#ky-apps .ky-app[data-star] .ky-app-n{color:#2ee6e6;font-size:13px}'
    + '#ky-apps .ky-el{display:flex;align-items:center;min-height:44px;width:100%;box-sizing:border-box;padding:4px 6px;border:0;box-shadow:inset 0 -1px #121a26;'
    + 'background:transparent;color:#cfeef6;font:11px/1.35 ui-monospace,monospace;text-align:left;cursor:pointer}'
    + '#ky-apps .ky-el b{color:#fff;min-width:6em}#ky-apps .ky-el span{color:#8fb3bd;margin-left:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '#ky-apps .ky-el:disabled{cursor:default;color:#6fa2ae}#ky-apps .ky-el:disabled b{color:#8fb3bd}'
    + '#ky-apps .ky-note{padding:6px 4px;color:#8fb3bd;font-size:11px;line-height:1.45}#ky-apps .ky-note[data-s=REFUSED],#ky-apps .ky-note[data-s=FAIL]{color:#ffb000}'
    + '#card.ky-el-card{display:block}#card .ky-ec-h code{display:block;white-space:pre-wrap;overflow-wrap:anywhere;color:#fff;font-weight:600;font-family:ui-monospace,monospace;max-height:7.5em;overflow:auto}'
    + '#card .ky-ec-s{display:block;color:#2ee6e6;margin:2px 0}#card .ky-ec-d{display:block;color:#8fb3bd;white-space:pre-wrap}'
    + '#card .ky-ec-x{position:absolute;top:0;right:0;min-width:44px;min-height:44px;border:0;background:transparent;color:#cfeef6;font:18px/1 ui-monospace,monospace}';

  function installStyle() {
    if (document.getElementById('ky-apps-css')) return;
    var s = mk('style'); s.id = 'ky-apps-css'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
  }
  function barBottom() {
    var b = document.getElementById('kuiper-menu-bar') || document.getElementById('bar');
    if (!b) return 0; var r = b.getBoundingClientRect(); return r.height ? Math.round(r.bottom) : 0;
  }
  function place() { if (panel) panel.style.top = (barBottom() + 1) + 'px'; }
  function buildPanel() {
    if (panel) return;
    panel = mk('div'); panel.id = 'ky-apps'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Open an app');
    var h = mk('div', 'ky-apps-h');
    var back = mk('button', 'ky-back', '‹'); back.type = 'button'; back.setAttribute('aria-label', 'back to the apps'); back.hidden = true;
    headEl = mk('div', 'ky-apps-t'); headEl.textContent = 'Open an app';
    var x = mk('button', 'ky-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'close the launcher');
    h.appendChild(back); h.appendChild(headEl); h.appendChild(x); panel.appendChild(h);
    list = mk('div', 'ky-apps-list'); panel.appendChild(list);
    elsBox = mk('div', 'ky-apps-list'); elsBox.id = 'ky-apps-elements'; elsBox.hidden = true; panel.appendChild(elsBox);
    x.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    back.addEventListener('click', function (e) { e.stopPropagation(); showView('apps'); });
    panel.__back = back;
    // a tap inside the launcher never reaches the wafer's spark picker (the page listens for pointerup on the window)
    ['pointerup', 'pointerdown', 'click', 'touchend'].forEach(function (t) { panel.addEventListener(t, function (e) { e.stopPropagation(); }); });
    document.body.appendChild(panel);
  }
  function showView(v) {
    st.view = v;
    var els = v === 'elements';
    list.hidden = els; elsBox.hidden = !els; panel.__back.hidden = !els;
    if (els) fillElements(); else fillHead();
  }
  function fillHead() {
    if (!REG) { headEl.innerHTML = 'Open an app<small>' + esc(st.apps.status + (st.apps.why ? ' · ' + st.apps.why : '')) + '</small>'; return; }
    headEl.innerHTML = 'Open an app · ' + fmt(REG.apps.length) + '<small>registry data/apps.json · one app at a time, same tab; back returns here</small>';
  }
  function hrefOf(a) { return a.local || a.link; }
  function sameOrigin(u) { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } }
  function hostOf(u) { try { var x = new URL(u, location.href); return x.origin === location.origin ? 'this host ' + x.pathname : x.host; } catch (e) { return u; } }
  function fillApps() {
    list.textContent = '';
    if (!REG) { var n = mk('div', 'ky-note', 'apps · ' + st.apps.status + ' · ' + st.apps.why); n.setAttribute('data-s', st.apps.status); list.appendChild(n); return; }
    var rows = REG.apps.slice();
    rows.sort(function (a, b) { return (b.id === 'see-through' ? 1 : 0) - (a.id === 'see-through' ? 1 : 0); });   // the star player first
    rows.forEach(function (a) {
      var row = mk('div', 'ky-app'); row.setAttribute('data-app', a.id); row.setAttribute('data-id', a.id); row.setAttribute('data-key', a.key);
      if (a.id === 'see-through') row.setAttribute('data-star', '');
      var link = mk('a', 'ky-app-a'); link.href = hrefOf(a);
      // the card law: the header of the row is the key line; then name, purpose, licence, link
      link.appendChild(mk('span', 'ky-app-k', a.key));
      var nm = mk('span', 'ky-app-n', a.name + (a.key_source === 'issued-here' ? ' · issued here' : ''));
      link.appendChild(nm);
      link.appendChild(mk('span', 'ky-app-p', a.purpose));
      var l = mk('span', 'ky-app-l', 'licence ' + a.licence + ' · ' + hostOf(hrefOf(a)));
      var s = mk('span', 'ky-app-s', ''); s.setAttribute('data-s', 'WAIT'); s.setAttribute('data-st', ''); l.appendChild(s);
      link.appendChild(l);
      if (a.link_withheld) { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); s.setAttribute('data-s', 'WITHHELD'); s.textContent = ' · link withheld (K1)'; st.heads[a.id] = 'WITHHELD · K1'; }
      link.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (!a.link_withheld) navigate(a); });
      row.appendChild(link);
      if (a.id === 'periodic-table') {
        var w = mk('button', 'ky-app-w', 'keys ▸'); w.type = 'button'; w.setAttribute('aria-label', 'the elements by key');
        w.addEventListener('click', function (e) { e.stopPropagation(); showView('elements'); });
        row.appendChild(w);
      } else if (a.wafer) {
        var f = mk('button', 'ky-app-w', 'wafer'); f.type = 'button'; f.setAttribute('aria-label', 'fly to ' + a.key + ' on the wafer');
        f.addEventListener('click', function (e) { e.stopPropagation(); flyToApp(a, f); });
        row.appendChild(f);
      }
      list.appendChild(row);
      a.__state = s;
    });
    // same-origin links are checked when the launcher opens; links to other hosts only on this row's tap, so that
    // opening the launcher never sends a request off-origin (A6) and a phone offline is not filled with errors
    var others = rows.filter(function (a) { return !sameOrigin(hrefOf(a)) && !a.link_withheld; });
    var chk = mk('button', 'ky-el ky-check', 'check the ' + fmt(others.length) + ' links to other hosts (fetch HEAD)'); chk.type = 'button';
    chk.addEventListener('click', function (e) { e.stopPropagation(); chk.disabled = true; chk.textContent = 'checking ' + fmt(others.length) + ' links to other hosts…'; st.checked_others = true; checkLinks(others); });
    list.appendChild(chk);
    rows.forEach(function (a) { if (!sameOrigin(hrefOf(a)) && !a.link_withheld && !st.heads[a.id] && a.__state) { a.__state.setAttribute('data-s', 'OFF'); a.__state.textContent = ' · not checked (other host)'; } });
    checkLinks(rows.filter(function (a) { return sameOrigin(hrefOf(a)); }));
  }
  // fetch(HEAD) when the launcher opens (never at load: A6); same origin reads the status, another origin is an
  // opaque reach (no-cors); a failed link reads FAIL in its row, never hidden (team-4/STEPS.md 7.2)
  function checkLinks(rows) {
    var q = rows.slice(), running = 0;
    function say(a, s, why) { st.heads[a.id] = s + (why ? ' · ' + why : ''); if (a.__state) { a.__state.setAttribute('data-s', s); a.__state.textContent = ' · ' + s + (why ? ' · ' + why : ''); } }
    function next() {
      while (running < HEAD_PARALLEL && q.length) {
        var a = q.shift(); if (st.heads[a.id]) { say(a, st.heads[a.id].split(' · ')[0], st.heads[a.id].split(' · ').slice(1).join(' · ')); continue; }
        running++; (function (a) {
          var u = hrefOf(a), same = sameOrigin(u), ctl = typeof AbortController === 'function' ? new AbortController() : null;
          var t = setTimeout(function () { if (ctl) ctl.abort(); }, HEAD_TIMEOUT_MS);
          say(a, 'WAIT', 'HEAD');
          fetch(u, { method: 'HEAD', mode: same ? 'same-origin' : 'no-cors', cache: 'no-store', redirect: 'follow', signal: ctl ? ctl.signal : undefined })
            .then(function (r) { if (same) { if (r.ok) say(a, 'OK', 'HTTP ' + r.status); else say(a, 'FAIL', 'HTTP ' + r.status); } else say(a, 'OK', 'reached'); },
              function (e) { say(a, 'FAIL', e && e.name === 'AbortError' ? 'no answer in ' + (HEAD_TIMEOUT_MS / 1000) + ' s' : 'unreachable'); })
            .then(function () { clearTimeout(t); running--; next(); });
        })(a);
      }
    }
    next();
  }
  function fillElements() {
    var tag = layerTag('elements');
    headEl.innerHTML = 'Periodic table<small>' + esc(st.elements.status === 'OK' ? elementsLine() : st.elements.status + ' · ' + st.elements.why) + '</small>';
    elsBox.textContent = '';
    var note = mk('div', 'ky-note'); note.setAttribute('data-s', /^REFUSED/.test(tag) ? 'REFUSED' : 'OK');
    note.textContent = 'layer elements · ' + (tag || 'no layer registry admitted') + '. Keys only are copied from elements@f7a92fb (owner question Q1): '
      + 'block:<Sym> and the register file it is keyed by; titles and descriptions stay in the catalogue (linked). Tap a key to fly to it.';
    elsBox.appendChild(note);
    loadElements().then(function () {
      headEl.innerHTML = 'Periodic table<small>' + esc(elementsLine()) + '</small>';
      var frag = document.createDocumentFragment();
      EL.elements.forEach(function (e, i) {
        var b = mk('button', 'ky-el'); b.type = 'button'; b.setAttribute('data-sym', e.sym);
        b.appendChild(mk('b', '', e.sym));
        var ok = Number.isFinite(e.key) && e.key >= 0 && e.key < H.SPACE;
        b.appendChild(mk('span', '', ok ? 'key ' + fmt(e.key) + ' · ' + e.repo + ' ' + e.path : (e.why || 'not placed')));
        if (!ok) b.disabled = true;
        else b.addEventListener('click', function (ev) { ev.stopPropagation(); openElement(i, true); });
        frag.appendChild(b);
      });
      elsBox.appendChild(frag);
    }, function (e) { var n = mk('div', 'ky-note', 'periodic table · FAIL · ' + (e.message || e)); n.setAttribute('data-s', 'FAIL'); elsBox.appendChild(n); });
  }
  // the element card (A4): header = the line at its key, verbatim; second row block:<Sym>; then the address and the links
  function openElement(i, fromPanel) {
    var e = EL && EL.elements[i]; if (!e || !Number.isFinite(e.key)) return false;
    var go = function () {
      var p = H.keyPlace(e.key); KY.cam.atHome = false; H.flyTo(p[0], p[1], 14);
      var lc = mod('line-card'); if (lc && lc.close) { try { lc.close(); } catch (x) { /* its own card */ } }
      var c = H.card, txt = typeof e.line_text === 'string' ? e.line_text : null;
      var gh = 'https://github.com/Ventusltd/' + e.repo + '/blob/' + e.commit + '/' + e.path + '#L1';
      var cat = 'https://github.com/Ventusltd/elements/blob/f7a92fb085c38dcbbd5cb469a66cd5ca61fb95bf/ELEMENTS.md';
      c.className = (c.className.replace(/\bky-el-card\b/g, '') + ' lc ky-el-card').trim();
      c.innerHTML = '<div class="lc-in" style="position:relative;padding:8px 48px 8px 12px">'
        + '<header class="lc-h ky-ec-h"><code>' + (txt == null ? '' : esc(txt)) + '</code>' + (txt == null ? '<span class="lc-none">no text at key</span>' : '') + '</header>'
        + '<span class="ky-ec-s">' + esc(e.sym) + '</span>'
        + '<span class="ky-ec-d">' + esc(e.repo + '@' + String(e.commit).slice(0, 7) + ' ' + e.path + ':1 · key ' + fmt(e.key)) + '\n'
        + '<a href="' + esc(gh) + '" target="_blank" rel="noopener">open on GitHub at ' + esc(String(e.commit).slice(0, 7)) + '</a> · '
        + '<a href="' + esc(cat) + '" target="_blank" rel="noopener">title and description in the catalogue (linked, not copied: Q1)</a></span>'
        + '<button class="ky-ec-x" type="button" aria-label="close">×</button></div>';
      c.style.display = 'block';
      c.querySelector('.ky-ec-x').addEventListener('click', function (ev) { ev.stopPropagation(); closeCard(); });
      KY.sel.target = { x: p[0], y: p[1] }; KY.redraw();
      st.card = { sym: e.sym, key: e.key, header: txt, second: e.sym };
    };
    if (fromPanel && st.open) closeThen(go); else go();
    return true;
  }
  function closeCard() { var c = H.card; c.style.display = 'none'; c.className = c.className.replace(/\bky-el-card\b/g, '').trim(); st.card = null; KY.sel.target = null; KY.redraw(); }
  function flyToApp(a, btn) {
    var w = a.wafer; if (!w) return;
    // the app's first register file on the wafer: its element key when data/elements.json holds that file
    loadElements().then(function () {
      var i = -1; EL.elements.forEach(function (e, j) { if (i < 0 && e.sym === a.key && Number.isFinite(e.key)) i = j; });
      if (i >= 0) openElement(i, true); else if (btn) btn.textContent = 'no key';
    }, function () { if (btn) btn.textContent = 'FAIL'; });
  }

  // one app at a time: the launcher closes (its history entry popped), then the page navigates in the same tab
  // (NL-009 06-seethrough.md:51-57: a _blank tab is invisible on Android Chrome); the back gesture is the way home
  function navigate(a) {
    var u = new URL(hrefOf(a), location.href).href;
    st.navigated.push({ id: a.id, url: u });
    closeThen(function () { location.assign(u); });
  }
  function closeThen(fn) {
    if (!st.open) { fn(); return; }
    var done = false;
    var go = function () { if (done) return; done = true; removeEventListener('popstate', pop); setTimeout(fn, 30); };
    var pop = function () { go(); };
    if (st.pushed) { addEventListener('popstate', pop); close(); setTimeout(go, 700); } else { close(); go(); }
  }
  // the shell's FILE panel holds one history entry ({kmb}); file.js closes it (history.back(), asynchronous) and calls
  // open() at once, so the launcher waits for that popstate before it pushes its own entry (measured: without the wait
  // the shell's back popped the launcher's entry and closed it, Galaxy S24, 23:20 UTC)
  function open() {
    var hs = history.state, s = shell();
    if (!st.open && hs && hs.kmb && !(s && s.inspect && s.inspect().open)) {
      if (st.waiting) return true;
      st.waiting = true;
      var done = false, go = function () { if (done) return; done = true; removeEventListener('popstate', pop); st.waiting = false; openNow(); };
      var pop = function () { setTimeout(go, 0); };
      addEventListener('popstate', pop); setTimeout(go, 700);
      return true;
    }
    return openNow();
  }
  function openNow() {
    buildPanel(); place();
    if (!st.open) {
      st.open = true; panel.classList.add('ky-open');
      try { history.pushState({ kyApps: 1 }, ''); st.pushed = true; } catch (e) { st.pushed = false; }
    }
    showView('apps');
    loadApps().then(function () { if (st.open) { fillHead(); fillApps(); } }, function () { if (st.open) { fillHead(); fillApps(); } });
    return true;
  }
  function close() {
    if (!st.open) return false;
    st.open = false; panel.classList.remove('ky-open');
    if (st.pushed) { st.pushed = false; st.ignorePop = true; try { history.back(); } catch (e) { st.ignorePop = false; } }
    return true;
  }
  function onPop() {
    if (st.ignorePop) { st.ignorePop = false; return; }
    if (st.open) { st.open = false; st.pushed = false; panel.classList.remove('ky-open'); }   // the back gesture closes the launcher
  }
  // a page restored from the back-forward cache comes back with no panel open (A3)
  function onShow(e) { if (e && e.persisted && st.open) { st.open = false; st.pushed = false; if (panel) panel.classList.remove('ky-open'); } }
  function onKey(e) { if (st.open && e.key === 'Escape') { e.stopPropagation(); close(); } }
  // the FILE entry: Opus 6's module owns "Open an app ▸" (file.js calls api.open()); without it, one row of our own
  // in the shell's FILE panel; never a bar title
  function mountEntry() {
    if (mod('file')) { st.entry = 'file module (Open an app)'; return; }
    var tries = 0;
    (function wait() {
      var s = shell(), p = s && s.panel ? s.panel('file') : null;
      if (p) {
        var g = mk('div', 'gm-group'); g.setAttribute('data-group', 'apps'); g.setAttribute('data-owner', 'apps (Opus 7, step 7)');
        var b = mk('button', 'gm-row', 'Open an app ▸'); b.type = 'button'; b.setAttribute('data-ky-apps-entry', '');
        b.addEventListener('click', function (e) { e.stopPropagation(); if (s.close) s.close(); setTimeout(open, 60); });
        g.appendChild(b); p.appendChild(g); st.entry = 'own row in FILE';
        return;
      }
      if (++tries < 160) setTimeout(wait, 250); else st.entry = 'none (no shell): KY.modules.apps.api.open()';
    })();
  }

  // ======================================================================== SECTION C: layers (BUILDER)
  // C1 elements: data/elements.json (tools/element_keys.py: each element at the key of line 1 of its register file
  //    files[0], the tools/edition_keys.py walk) -> one spark per placed element at keyPlace(key); registered with
  //    Opus 3's registry as layer `elements` (data/layers.json). A refusal there (licence UNSETTLED, owner Q1) is never
  //    lifted by registering (layers.js register(): REFUSED returns before load), so the sparks draw only when the
  //    registry draws the layer; the launcher's periodic-table view still flies to every key.
  // C2 spider: the two graphs copied byte for byte (DISCLOSED, owner Q5), sha256 checked before a byte is parsed;
  //    a node gets a key only by a rule the estate already has, else it is counted and not drawn:
  //      block:<Sym>            -> its element key (C1), or none when the element is not placed
  //      repo:<owner>/<name>    -> the first key of that repository's first commit on the wafer (k0)
  //      category:*             -> none (a word of the catalogue, no code)
  //      any other node         -> its `gh` repository, else its served folder https://ventusltd.github.io/<name>/
  //                                (`ext`, elements README.md:15 the surface grammar) -> that repository's first k0
  //    an edge is a chord between two keyed nodes (galaxies-wafers README.md:13-16, a LineString of keys); an edge
  //    whose two ends share one key is drawn as a ring at that place and counted as such.
  var GRAPHS = [   // sha256 of the edition copies, 2026-11-01 23:29 UTC (handoff/07-apps/PLAN.md, builder status)
    { id: 'overview', file: 'data/graphs/overview.json', bytes: 6125,
      sha256: '124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09',
      source: 'testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/overview-graph.json' },
    // K1: the source holds one folder name (2 occurrences) that equals a repository that is not public; the copy
    // replaces that token alone by `not-public` (tools/element_keys.py --copy-graph), every other byte the source's.
    // source sha256 72349730a0207a689061f88b7e83d25a843b37512b708fe1e949123ff709749e, 509,649 bytes
    { id: 'periodic-table', file: 'data/graphs/periodic-table.json', bytes: 509639,
      sha256: 'b84820447a0f8d18687f48f409e2a5442bc66c7f8b71d7ff1a171ecc7dc53a0e',
      source: 'stars@cbca125 blocks/graph.json (K1-redacted copy: 2 tokens)' }];
  var C = { elDrawn: false, spots: [], bySym: {}, firstK0: null, graphsP: null, segs: [], rings: [], dots: [], reg: {} };
  function cAdmissible(k) { return typeof k === 'number' && isFinite(k) && k >= 0 && k < H.SPACE; }
  function cScr(x, y) { var c = KY.cam, o = H.o2.canvas; return [(x - c.x) * c.zoom + o.width / 2, o.height / 2 - (y - c.y) * c.zoom]; }
  function cSay(prefix, text) {   // one readout line per prefix, replaced, never stacked
    st.said = st.said.filter(function (l) { return l.indexOf(prefix) !== 0; });
    if (text) st.said.push(prefix + text);
    if (KY) KY.redraw();
  }
  function cHex(buf) { var b = new Uint8Array(buf), s = ''; for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16); return s; }
  // C1 ------------------------------------------------------------------ the elements
  function elementSpots() {
    return loadElements().then(function () {
      if (!C.spots.length) EL.elements.forEach(function (e, i) {
        if (!cAdmissible(e.key)) return;
        var p = H.keyPlace(e.key), s = { i: i, sym: e.sym, key: e.key, x: p[0], y: p[1] };
        C.spots.push(s); C.bySym[e.sym] = s;
      });
      return C.spots;
    });
  }
  function loadElementsLayer() {
    return elementSpots().then(function (sp) {
      return { placed: sp.length, total: EL.elements.length, why: sp.length ? '' : 'no element has a key below SPACE' };
    });
  }
  function drawElements(o2) {
    C.elDrawn = true;
    var sel = st.card && st.card.sym, w = o2.canvas.width, h = o2.canvas.height;
    o2.fillStyle = C_RECORD; o2.globalAlpha = 0.9;
    for (var i = 0; i < C.spots.length; i++) { var s = C.spots[i], p = cScr(s.x, s.y);
      if (p[0] < -4 || p[1] < -4 || p[0] > w + 4 || p[1] > h + 4 || s.sym === sel) continue;
      o2.beginPath(); o2.arc(p[0], p[1], 2.6, 0, 6.2832); o2.fill(); }
    o2.globalAlpha = 1;
    if (sel && C.bySym[sel]) { var q = cScr(C.bySym[sel].x, C.bySym[sel].y);
      o2.strokeStyle = C_SEL; o2.fillStyle = C_SEL; o2.lineWidth = 2;
      o2.beginPath(); o2.arc(q[0], q[1], 3.5, 0, 6.2832); o2.fill(); o2.beginPath(); o2.arc(q[0], q[1], 9, 0, 6.2832); o2.stroke(); }
  }
  // a tap within 9 px (mouse) or 24 px (finger, NL-009 04) of a drawn element spark opens its card (A4); only a tap
  // that began on the wafer canvas, one pointer, moved under 10 px, and only while the layer was drawn this frame
  function elementTaps() {
    var down = {}, moved = 0;
    addEventListener('pointerdown', function (e) { moved = Object.keys(down).length || e.target !== H.cv ? 99 : 0; down[e.pointerId] = [e.clientX, e.clientY]; }, true);
    addEventListener('pointermove', function (e) { var d = down[e.pointerId]; if (d) moved = Math.max(moved, Math.hypot(e.clientX - d[0], e.clientY - d[1])); }, true);
    addEventListener('pointercancel', function (e) { delete down[e.pointerId]; }, true);
    addEventListener('pointerup', function (e) {
      var was = down[e.pointerId]; delete down[e.pointerId];
      if (!was || e.target !== H.cv || moved > 10 || Object.keys(down).length || !C.elDrawn || !C.spots.length) return;
      var R = e.pointerType === 'mouse' ? 9 : 24, best = null, bd = R * R;
      C.spots.forEach(function (s) { var p = cScr(s.x, s.y), d = (p[0] - e.clientX) * (p[0] - e.clientX) + (p[1] - e.clientY) * (p[1] - e.clientY); if (d < bd) { bd = d; best = s; } });
      if (best) openElement(best.i, false);
    });
  }
  // C2 ------------------------------------------------------------------ the spider graphs
  function firstK0(name) {
    if (!C.firstK0) { C.firstK0 = {}; var rs = H.repos, cs = H.commits;
      for (var i = 0; i < cs.length; i++) { var n = String(rs[cs[i].repo].name).toLowerCase(); if (!(n in C.firstK0)) C.firstK0[n] = cs[i].k0; } }
    var k = C.firstK0[String(name || '').toLowerCase()];
    return k == null ? null : k;
  }
  function nodeKey(n) {
    var id = String(n && n.id || ''), m;
    if (/^block:/.test(id)) { var s = C.bySym[id]; return s ? { key: s.key, by: 'element' } : null; }
    if (/^repo:/.test(id)) { m = id.match(/^repo:(?:[^\/]+\/)?([^\/]+)$/); var r = m ? firstK0(m[1]) : null; return r == null ? null : { key: r, by: 'repository' }; }
    if (/^category:/.test(id)) return null;
    m = String(n.gh || '').match(/^https:\/\/github\.com\/[^\/]+\/([^\/?#]+)/);
    if (m && firstK0(m[1]) != null) return { key: firstK0(m[1]), by: 'repository (gh)' };
    m = String(n.ext || '').match(/^https:\/\/ventusltd\.github\.io\/([^\/?#]+)\//i);
    if (m && firstK0(m[1]) != null) return { key: firstK0(m[1]), by: 'served folder ' + m[1] };
    return null;
  }
  function loadGraph(g) {
    if (!(window.crypto && crypto.subtle && crypto.subtle.digest)) return Promise.reject(new Error('crypto.subtle unavailable, unhashed data refused'));
    return fetch(g.file, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(g.file + ' HTTP ' + r.status); return r.arrayBuffer();
    }, function () { throw new Error(g.file + ' did not load (network)'); }).then(function (buf) {
      return crypto.subtle.digest('SHA-256', buf).then(function (d) {
        if (cHex(d) !== g.sha256) throw new Error(g.file + ' sha256 mismatch');
        if (buf.byteLength !== g.bytes) throw new Error(g.file + ' bytes ' + buf.byteLength + ' ≠ ' + g.bytes);
        var j; try { j = JSON.parse(new TextDecoder('utf-8').decode(buf)); } catch (e) { throw new Error(g.file + ' is not JSON'); }
        if (!j || !Array.isArray(j.nodes) || !Array.isArray(j.edges)) throw new Error(g.file + ' has no nodes and edges');
        var keyOf = {}, keyed = 0, by = {}, segs = [], rings = {}, drawn = 0, ringN = 0, dots = {};
        j.nodes.forEach(function (n) { var k = nodeKey(n); if (k) { keyOf[n.id] = k.key; keyed++; by[k.by] = (by[k.by] || 0) + 1; dots[k.key] = 1; } });
        j.edges.forEach(function (e) { var a = keyOf[e.from], b = keyOf[e.to];
          if (a == null || b == null) return; drawn++;
          if (a === b) { ringN++; rings[a] = (rings[a] || 0) + 1; return; }
          var p = H.keyPlace(a), q = H.keyPlace(b); segs.push([p[0], p[1], q[0], q[1]]); });
        var out = { id: g.id, file: g.file, source: g.source, sha256: g.sha256, nodes: j.nodes.length, keyed: keyed,
          no_key: j.nodes.length - keyed, keyed_by: by, edges: j.edges.length, drawn: drawn, rings: ringN,
          segs: segs, ringAt: Object.keys(rings).map(Number), dotAt: Object.keys(dots).map(Number) };
        return out;
      });
    });
  }
  function loadSpider() {
    if (C.graphsP) return C.graphsP;
    st.spider.status = 'LOAD'; st.spider.why = 'data/graphs/';
    C.graphsP = elementSpots().catch(function () { return []; }).then(function () {   // block nodes need C1's keys; without them they are counted unkeyed
      return Promise.all(GRAPHS.map(loadGraph));
    }).then(function (gs) {
      C.segs = []; C.rings = []; C.dots = []; var placed = 0, total = 0, words = [];
      gs.forEach(function (g) {
        Array.prototype.push.apply(C.segs, g.segs);
        g.ringAt.forEach(function (k) { var p = H.keyPlace(k); C.rings.push([p[0], p[1]]); });
        g.dotAt.forEach(function (k) { var p = H.keyPlace(k); C.dots.push([p[0], p[1]]); });
        placed += g.drawn; total += g.edges;
        st.spider.graphs[g.id] = { nodes: g.nodes, keyed: g.keyed, no_key: g.no_key, keyed_by: g.keyed_by, edges: g.edges,
          drawn: g.drawn, rings: g.rings, sha256: g.sha256, source: g.source };
        words.push(g.id + ' ' + fmt(g.drawn) + ' of ' + fmt(g.edges) + ' edges drawn'
          + (g.rings ? ' (' + fmt(g.rings) + ' as rings: both ends at one key)' : '')
          + ', ' + fmt(g.no_key) + ' of ' + fmt(g.nodes) + ' nodes had no key');
      });
      st.spider.status = 'OK'; st.spider.why = words.join(' · ');
      cSay('spider graphs: ', words.join(' · '));
      return { placed: placed, total: total };
    }, function (e) {
      var why = String(e && e.message || e);
      st.spider.status = 'FAIL'; st.spider.why = why; C.graphsP = null;
      cSay('spider graphs: ', 'FAIL · ' + why + ' · the wafer draws on');
      throw e;
    });
    return C.graphsP;
  }
  function drawSpider(o2) {
    o2.strokeStyle = C_RECORD; o2.fillStyle = C_RECORD; o2.lineWidth = 1; o2.globalAlpha = 0.45;
    o2.beginPath();
    for (var i = 0; i < C.segs.length; i++) { var s = C.segs[i], a = cScr(s[0], s[1]), b = cScr(s[2], s[3]); o2.moveTo(a[0], a[1]); o2.lineTo(b[0], b[1]); }
    o2.stroke(); o2.globalAlpha = 0.9;
    C.rings.forEach(function (r) { var p = cScr(r[0], r[1]); o2.beginPath(); o2.arc(p[0], p[1], 7, 0, 6.2832); o2.stroke(); });
    C.dots.forEach(function (d) { var p = cScr(d[0], d[1]); o2.beginPath(); o2.arc(p[0], p[1], 2.2, 0, 6.2832); o2.fill(); });
    o2.globalAlpha = 1;
  }
  // registration: data/layers.json is fetched by layers.js after its install, so wait (up to 30 s) until the
  // registry holds both records; without the layers module both still load for inspect(), and nothing is drawn
  function registerLayers() {
    if (C.started) return; C.started = true;
    KY.draw.add(function () { C.elDrawn = false; }, 29);   // before layers.js (30) calls drawElements this frame
    elementTaps();
    var tries = 0;
    (function wait() {
      var L = mod('layers');
      if (L && L.get && L.register && L.get('elements') && L.get('spider')) {
        [['elements', loadElementsLayer, drawElements], ['spider', loadSpider, drawSpider]].forEach(function (x) {
          try { L.register({ id: x[0], module: ID, load: x[1], draw: x[2] }); C.reg[x[0]] = 'registered · ' + (L.get(x[0]) || {}).status; }
          catch (e) { C.reg[x[0]] = 'not registered: ' + (e.message || e); }
        });
        st.layers = C.reg; return;
      }
      if (++tries < 120) { setTimeout(wait, 250); return; }
      st.layers = { elements: 'no layer registry (layers module ' + (L ? 'has no records' : 'not admitted') + ')', spider: 'same' };
      loadSpider().catch(function () { /* said in the readout */ });
    })();
  }

  // ======================================================================== SECTION D: readout (LEAD)
  function readout() {
    var out = [];
    if (st.elements.status === 'OK') out.push('periodic table: ' + elementsLine() + (layerTag('elements') ? ' · layer ' + layerTag('elements') : ''));
    if (st.said.length) out = out.concat(st.said);
    if (out.length) H.hud.textContent += '\n' + out.join('\n');
  }

  // ======================================================================== install, registration (LEAD)
  function install(K) {
    KY = K; H = K.hooks;
    installStyle(); buildPanel();
    addEventListener('popstate', onPop); addEventListener('pageshow', onShow); addEventListener('keydown', onKey, true);
    addEventListener('resize', place);
    K.draw.add(readout, 50);
    mountEntry();
    st.installed = true;
    // after the wafer admitted its own data (the wafer promise): the registry, then the two layers
    H.wafer.then(function () {
      loadApps().catch(function () { /* said in the launcher and in inspect() */ });
      loadElements().catch(function () { /* said in the readout */ });
      registerLayers();
    }).catch(function (e) { st.apps.status = 'REFUSED'; st.apps.why = 'the wafer refused: ' + String(e && e.message || e); });
    return api;
  }
  function inspect() { return JSON.parse(JSON.stringify(st)); }
  function listApps() { return REG && REG.apps ? REG.apps.map(function (a) { return { id: a.id, key: a.key, name: a.name, link: hrefOf(a), licence: a.licence }; }) : []; }
  var api = Object.freeze({ schema: SCHEMA, generation: GEN, list: listApps, open: open, close: close, inspect: inspect,
    openElement: function (sym) { if (!EL) return false; for (var i = 0; i < EL.elements.length; i++) if (EL.elements[i].sym === sym) return openElement(i, false); return false; },
    elements: function () { return loadElements().then(function () { return JSON.parse(JSON.stringify(st.elements)); }); },
    registry: function () { return loadApps(); } });

  if (window.KY && typeof window.KY.register === 'function') {
    window.KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN, requires: REQUIRES, provides: ['apps'],
      install: install, inspect: inspect });
  }
})();
