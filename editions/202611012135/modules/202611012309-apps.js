/* kuiper module apps, generation 202611012309 (UTC), Apache-2.0 (kuiper-belt code)
   Opus team 7, NL-010 roadmap step 7 "the OS of the estate, baby step one" (neural-link FIXES/NL-010/ROADMAP.md
   step 7; FIXES/NL-010/team-4/STEPS.md 7.1-7.5). The app registry (data/apps.json, 34 rows), the launcher (a panel
   under the bar opened from FILE > "Open an app", rows 44 px, the key is the header; no window manager: one app at a
   time, by same-tab navigation, the back gesture is the way home), the periodic table as a layer (data/elements.json:
   221 of 244 elements keyed on the wafer, 23 named, not placed) and as an app, and the spider sandbox as an app row
   and a graph layer (data/graphs/overview.json, data/graphs/periodic-table.json, the only two graphs copied, DISCLOSED).
   Owner questions honoured: Q1 (elements@f7a92fb states no licence: only keys block:<Sym> are copied, never a title or
   a description; the elements layer row reads REFUSED · licence unsettled, which layers.js decides from data/layers.json)
   and Q5 (no spider graph JSON beyond the two DISCLOSED graphs; nothing fetched off-origin).
   requires: wafer, keyPlace, address, flyTo, safeBox, esc, fmt, o2, hud, card, repos, commits, SPACE, cam, redraw, draw, panels
   optional (used when admitted earlier, never required): kuiper-shell (FILE panel, open/close), layers (register),
             file (its FILE row "Open an app" calls api.open() and api.list()), line-card
   provides: apps */
(function () {
  'use strict';
  var ID = 'apps', GEN = '202611012309', SCHEMA = 'kuiper.apps.v1';
  var REQUIRES = ['wafer', 'keyPlace', 'address', 'flyTo', 'safeBox', 'esc', 'fmt', 'o2', 'hud', 'card', 'repos',
    'commits', 'SPACE', 'cam', 'redraw', 'draw', 'panels'];
  var FILES = { apps: 'data/apps.json', elements: 'data/elements.json',
    graphs: ['data/graphs/overview.json', 'data/graphs/periodic-table.json'] };

  var KY = null, H = null;
  var st = { schema: SCHEMA, id: ID, generation: GEN, installed: false, open: false,
    apps: { status: 'WAIT', why: '', rows: 0 }, elements: { status: 'WAIT', why: '', placed: 0, named: 0, total: 0 },
    spider: { status: 'WAIT', why: '', graphs: {} }, heads: {}, said: [] };
  var REG = null, EL = null, GR = {};
  var panel = null;

  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function mod(id) { try { var m = KY.modules[id]; return m && m.api ? m.api : null; } catch (e) { return null; } }
  function shell() { return mod('kuiper-shell') || window.__KUIPER_SHELL__ || null; }

  // ======================================================================== SECTION A: data (LEAD)
  function getJSON(file) {
    return fetch(file, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(file + ' HTTP ' + r.status); return r.json(); });
  }

  // ======================================================================== SECTION B: the launcher panel (LEAD)
  function buildPanel() { /* LEAD: #ky-apps under the bar, one row per record, header = key */ }
  function open() { st.open = true; }
  function close() { st.open = false; }

  // ======================================================================== SECTION C: layers (BUILDER)
  // C1 elements: data/elements.json -> places; layers.register({id:'elements', module:'apps', load, draw})
  // C2 spider: data/graphs/*.json -> node keys (repository: first commit k0; block:<Sym>: element key) -> chords
  function registerLayers() { /* BUILDER */ }

  // ======================================================================== SECTION D: readout (LEAD)
  function readout() { if (st.said.length) H.hud.textContent += '\n' + st.said.join('\n'); }

  // ======================================================================== install, registration (LEAD)
  function install(K) {
    KY = K; H = K.hooks;
    buildPanel();
    K.draw.add(readout, 50);
    st.installed = true;
    return api;
  }
  function inspect() { return JSON.parse(JSON.stringify(st)); }
  function list() { return REG && REG.apps ? REG.apps.slice() : []; }
  var api = Object.freeze({ schema: SCHEMA, generation: GEN, list: list, open: open, close: close, inspect: inspect });

  if (window.KY && typeof window.KY.register === 'function') {
    window.KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN, requires: REQUIRES, provides: ['apps'],
      install: install, inspect: inspect });
  }
})();
