/* kuiper module kuiper-shell, generation 202611020243 (UTC), Apache-2.0 (kuiper-belt).
 * NOTICE: the bar's CSS values and the menu structure are copied from GridAtlas, Copyright 2026 Ventus Ltd,
 * Apache-2.0 (gridatlas@5ec7f62 LICENSE:1-4, NOTICE:1-12), atlas/modules/202609031958-menu-bar.js, keys beside
 * each value below. "Ventus" and "Cables & Connectivity(R)" are the mark of Ventus Ltd, used by its owner's
 * instruction of 1 Nov 2026; the Apache-2.0 licence of this code does not license the mark (LICENSE:139, s.6).
 *
 * requires (C8): DOM #c #o #top #hud #foot #keys (five [data-k]: n r / e Backspace) #card #bar #goto #gotoin, each
 *   present once (rev 2: #lines #lyAll #lyFocus #lyFind #lineslist are optional; Opus 3's layers module owns them); through window.KY when the loader exists (ROADMAP step 4,
 *   team-2/STEPS.md 4.2): safeBox card hud big sub cv gbox gin redraw. Engine functions edCard edFly edNext setPanel
 *   are module-scoped in index.html (type="module"), so the shell reaches them only through their own DOM controls
 *   (the #keys buttons and #lines rows, moved as the same nodes with their listeners) and the engine's keydown table.
 *
 * THE SHELL CONTRACT (FIXES/NL-010/team-1/STEPS.md C1-C10, ROADMAP.md step 1; measured on gridatlas@5ec7f62 on
 * 1 Nov 2026 by FABLE-T1A/T1B; folded in: NL-009 round 1 01-bar, 06-seethrough (the bar entry), 08-type):
 *  C1 one bar nav#kuiper-menu-bar, fixed at the window's top, 36 px (34 px at max-width:700px), GridAtlas's chrome.
 *  C2 three zones: two flex:1 1 0 sides and a brand slot between them, so the brand is centred whatever the titles weigh.
 *  C3 the VENTUS wordmark as GridAtlas renders it (text, not an image; not a link), flanked above 700 px by SYSTEM
 *     TIME and 2050 TARGET as the v8 masthead is.
 *  C4 button.gm-title in GridAtlas's face; a 44 px hit box on a coarse pointer by an invisible ::after.
 *  C5 FILE EDIT VIEW . VENTUS . SCOPE WAFER ABOUT (GridAtlas's GRID becomes WAFER, R2).
 *  C6 every command a 44 px row inside a panel; at rest nothing over the wafer but the bar.
 *  C7 panels at top:100%, one open at a time, closed by the same title, Escape, a wafer tap and the back gesture.
 *  C8 admission: install nothing until every hook exists once; otherwise a loud strip and Edition 4's bar stays.
 *  C9 one row at 360, 393, 412, 430 px and in landscape.
 *  C10 this block.
 * Revision 2 (2 Nov 2026, same generation, not yet admitted; BLOCKER from the integrator's journey and Opus 3's REQUEST):
 *  history has one owner per entry. The page owns the card's entry; the shell never causes a popstate while a card is
 *  shown and steps over its own dead entries (closeAll, stepOver, onPop). Edition 4's #lines #lyAll #lyFocus #lyFind
 *  are no longer required; SCOPE's focus is a proxy for whichever #lyFocus exists.
 * Generation 202611020220 (2 Nov 2026) = revision 3 of 202611012143, a new stamped file because 202611012143 was published
 * with Edition 5's files; the earlier file is never edited. (Earlier cuts 202611020154 and 202611020220 were never handed off or listed.)
 * Revision 3: a panel reopened while the shell's own back() is on its way gets a fresh
 *  entry when that pop arrives (pendingBack), so the next back gesture closes it and never leaves the page. The star
 *  strip steps aside while a card is shown (it sat under a pinch's finger when lifted above the card), and the clock of
 *  the flanks does no work while the flanks are hidden.
 * The star slot (R7, Q7): reserved for See Through (owner: Opus team 5, schema kuiper.see-through.v1). The shell owns
 * the rule (title in the bar when it fits beside a centred brand, else the bottom-left 44 px strip); step 5 owns the
 * words and the target. Until step 5 mounts its node, the slot carries NL-009 06's entry: a.gm-title "See Through"
 * -> ../../see-through/ in the same tab.
 */
(function () {
  'use strict';
  var ID = 'kuiper-shell', GEN = '202611020243', SCHEMA = 'kuiper.menu-bar.v1';
  var BAR_ID = 'kuiper-menu-bar', STYLE_ID = 'kuiper-menu-bar-css', FAIL_ID = 'kuiper-menu-bar-failure';
  var STRIP_ID = 'kuiper-star-strip';
  // the six names (C5; gridatlas@5ec7f62 menu-bar.js:31 ['File','Edit','View','Scope','Grid','About'])
  var MENUS = [['file', 'File'], ['edit', 'Edit'], ['view', 'View'], ['scope', 'Scope'], ['wafer', 'Wafer'], ['about', 'About']];
  // GridAtlas's retry clock: every 250 ms, at most 160 times (menu-bar.js:35, :1770-1797)
  var RETRY_MS = 250, RETRY_MAX = 160;
  // the star entry is a title only when it fits in the left side beside a centred brand (MEASURED: see PLAN.md / EVIDENCE.md)
  var STAR_TITLE_MQ = '(min-width: 434px)';

  var state = {
    schema: SCHEMA, id: ID, generation: GEN, installed: false, failure: null, controls_moved: 0,
    panel_counts: {}, closed_at_rest: true, open: null, attempts: 0, mode: null, keys: 'waiting',
    star: { owner: 'see-through (Opus 5, kuiper.see-through.v1)', form: null, mounted_by: null },
    groups: {}
  };
  var bar = null, menus = {}, starNode = null, starHome = null, strip = null, historyDepth = 0, mqStar = null;

  function publish() {
    try { var m = window.__KUIPER_MODULES__ = window.__KUIPER_MODULES__ || {}; if (!Object.isFrozen(m)) m.menuBar = state; } catch (e) { /* frozen table: the KY api carries it */ }
  }
  function $(sel) { return document.querySelectorAll(sel); }

  // ---------------------------------------------------------------- C8 the admission rule (LEAD)
  // rev 2 (Opus 3 REQUEST, handoff/03-layers/REQUESTS.md item 2): Edition 4's LINES nodes are not required; the layers
  // module deletes or moves them. They are used when present and never judged.
  var REQUIRED = ['#c', '#o', '#top', '#hud', '#foot', '#keys', '#card', '#bar', '#goto', '#gotoin'];
  var KEYS = ['n', 'r', '/', 'e', 'Backspace'];
  function missing() {
    var out = [];
    REQUIRED.forEach(function (s) { var n = $(s).length; if (n !== 1) out.push(s + (n ? ' (x' + n + ')' : '')); });
    KEYS.forEach(function (k) { if ($('#keys [data-k="' + k + '"]').length !== 1) out.push('#keys [data-k="' + k + '"]'); });
    var KY = window.KY;
    if (KY && KY.hooks) ['safeBox', 'card', 'hud', 'big', 'sub', 'cv', 'gbox', 'gin'].forEach(function (h) { if (!(h in KY.hooks)) out.push('KY.hooks.' + h); });
    return out;
  }
  function loudFailure(words) {
    state.failure = words; state.installed = false; publish();
    var s = document.getElementById(FAIL_ID);
    if (!s) { s = document.createElement('div'); s.id = FAIL_ID; s.setAttribute('role', 'alert'); document.body.appendChild(s); }
    s.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:10030;padding:8px 10px;background:rgba(40,6,10,.96);'
      + 'border:1px solid #ff5a6a;color:#ffd7dc;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace';
    s.textContent = 'kuiper shell not installed: ' + words + '. Edition 4\'s bar is unchanged and still works.';
  }

  // ---------------------------------------------------------------- C1-C4, C7, C9 the style (LEAD)
  // Every value is GridAtlas's, key beside it (gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js = MB).
  // Departures, each named: position fixed at the window's top (the Kuiper has no .map-container, C1); the top safe
  // inset (NL-009 01 F5); hover only under (hover:hover) (NL-009 01 F4); the coarse-pointer ::after (C4, NL-009 01 F2).
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var B = '#' + BAR_ID, st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = [
      // C1 the strip: MB:166-172
      B + '{position:fixed;top:0;left:0;right:0;height:calc(36px + env(safe-area-inset-top,0px));z-index:10020;',
      'display:flex;align-items:stretch;gap:0;padding-top:env(safe-area-inset-top,0px);',
      'padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);box-sizing:border-box;',
      'background:rgba(4,10,13,.95);border-bottom:1px solid rgba(80,220,240,.3);',
      'font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;',
      '-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);isolation:isolate;pointer-events:auto;',
      '-webkit-text-size-adjust:100%;text-size-adjust:100%}',
      B + ' .gm-menu{position:relative;min-width:0;display:flex}',
      // C4 titles: MB:174-176; hover/open MB:177-178 (hover gated, NL-009 01 F4); focus MB:179-180
      B + ' .gm-title{appearance:none;border:0;background:transparent;color:#cfeef6;display:flex;align-items:center;',
      'min-height:36px;padding:0 11px;cursor:pointer;font:inherit;letter-spacing:.05em;',
      'text-transform:uppercase;white-space:nowrap;text-decoration:none;box-sizing:border-box;position:relative;',
      'touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
      '@media (hover:hover){' + B + ' .gm-title:hover{background:rgba(80,220,240,.16);color:#fff}}',
      B + ' .gm-title:focus-visible,' + B + ' .gm-menu.gm-open>.gm-title{background:rgba(80,220,240,.16);color:#fff}',
      B + ' .gm-title:focus-visible,' + B + ' .gm-panel :focus-visible{outline:2px solid #6bebff;outline-offset:-2px}',
      // C2 zones: MB:181-183
      B + ' .gm-side{display:flex;align-items:stretch;flex:1 1 0;min-width:0}',
      B + ' .gm-side-left{justify-content:flex-start}',
      B + ' .gm-side-right{justify-content:flex-end}',
      // C3 the brand: MB:192-205 over ventusv8.css:4,6-8 (base classes copied so the Kuiper page has them)
      B + ' .gm-brand-slot{flex:0 1 auto;min-width:0;max-width:64%;display:flex;align-items:center;',
      'justify-content:center;overflow:hidden;padding:0 6px;text-align:center}',
      B + ' .hud-header{display:flex;position:static;width:auto;align-items:center;justify-content:center;',
      'gap:11px;margin:0;padding:0;background:none;border:0;color:#fff}',
      B + ' .hud-header>div{flex:0 0 auto;line-height:1.05}',
      B + ' .hud-header small{font-size:6.5px;white-space:nowrap;color:#888}',
      B + ' .hud-header .hud-val{font-size:10.5px;font-weight:bold;color:#00ffff;text-shadow:none}',
      B + ' .hud-header .kmb-date{font-size:11px;color:#888}',
      B + ' .ventus-brand{text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.2}',
      B + ' .ventus-main{font-family:-apple-system,sans-serif;font-size:14px;font-weight:800;color:#fff;',
      'letter-spacing:.2em;text-transform:uppercase;margin:0}',
      B + ' .ventus-sub{font-family:-apple-system,sans-serif;font-size:5.5px;color:#888;letter-spacing:.14em;text-transform:uppercase}',
      // C7 panels: MB:206-211, right group MB:219, rows MB:220-227, headings MB:245-247
      // top: one px below MB's 100% so the panel starts under the bar's 1 px rule, not on it (measured: 35 vs bar bottom 36)
      B + ' .gm-panel{position:absolute;top:calc(100% + 1px);left:0;min-width:240px;max-width:min(92vw,420px);',
      'max-height:min(72dvh,620px);overflow:auto;overscroll-behavior:contain;padding:6px;background:rgba(4,10,13,.98);',
      'border:1px solid rgba(80,220,240,.32);border-top:0;box-shadow:0 12px 34px rgba(0,0,0,.68);box-sizing:border-box;',
      'text-align:left;color:#cfeef6;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;z-index:2}',
      B + ' .gm-panel[hidden]{display:none!important}',
      B + ' .gm-side-right .gm-panel{left:auto;right:0}',
      // rev 3: the row look applies to the shell's own rows only (direct children of a panel), never to a module's
      // content mounted in a named group (Opus 3's #layers rows are div.ln[role=button]; measured: flexed into columns)
      B + ' .gm-panel>button,' + B + ' .gm-panel>[role="button"],' + B + ' .gm-panel>a.gm-row{',
      'display:flex;align-items:center;width:100%;min-height:44px;box-sizing:border-box;',
      'position:static!important;inset:auto!important;transform:none!important;margin:0 0 3px;',
      'padding:7px 10px;border:0;border-radius:2px;background:transparent;color:#cfeef6;',
      'font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:left;',
      'letter-spacing:.03em;text-transform:none;cursor:pointer;text-decoration:none}',
      '@media (hover:hover){' + B + ' .gm-panel>button:hover,' + B + ' .gm-panel>[role="button"]:hover,' + B + ' .gm-panel>a.gm-row:hover{',
      'background:rgba(80,220,240,.14);color:#fff}}',
      B + ' .gm-panel .gm-hint{margin-left:auto;padding-left:10px;color:#6fa2ae}',
      B + ' .gm-layer-group{margin:5px 0 2px;padding:6px 8px 3px;border-top:1px solid #19343b;color:#6fa2ae;',
      'font-size:10px;letter-spacing:.08em;text-transform:uppercase}',
      B + ' .gm-group:empty{display:none}',
      // prose moved into panels: NL-009 08-type scale (desktop 12/11 px, phone 13/12 px, line-height 1.55/1.45)
      B + ' .gm-prose{font-size:12px;line-height:1.55;padding:6px 8px;color:#d5dcea;white-space:normal}',
      B + ' .gm-prose.gm-small{font-size:11px;color:#8fb3bd}',
      // Edition 4's layers become panel blocks (they keep their ids and listeners; index.html:64-70 is overridden here)
      B + ' .gm-panel #top,' + B + ' .gm-panel #hud,' + B + ' .gm-panel #lines,' + B + ' .gm-panel #foot{display:block!important;',
      'position:static!important;inset:auto!important;max-width:none!important;max-height:none!important;width:auto!important;',
      'border:0!important;border-radius:0!important;background:transparent!important;padding:6px 8px!important;',
      'margin:0!important;box-shadow:none!important;pointer-events:auto!important;text-align:left!important}',
      B + ' .gm-panel #hud{white-space:pre-line;color:#8fb3bd;font-size:11px;line-height:1.55}',
      B + ' .gm-panel #top #sub{max-height:none!important;overflow:visible!important;margin-top:4px}',
      B + ' .gm-panel #foot .long{display:inline!important}',
      B + ' .gm-panel #lines #linesctl{display:flex;flex-direction:column;align-items:stretch;gap:3px}',
      B + ' .gm-panel #lines #linesctl label{display:flex;align-items:center;gap:10px;min-height:44px;padding:7px 10px;cursor:pointer}',
      B + ' .gm-panel #lines #linesctl input[type=checkbox]{width:20px;height:20px;margin:0;accent-color:#2ee6e6}',
      B + ' .gm-panel #lines #lyFind{min-height:44px;box-sizing:border-box;width:100%;font:12px ui-monospace,monospace}',
      B + ' .gm-panel #lines #lineslist .ln{min-height:44px;box-sizing:border-box}',
      // Edition 4's NEXT / PREVIOUS inside the moved #lines: 44 px rows (they lost the panel-wide row rule in rev 3)
      B + ' .gm-panel #lines #linesctl button{display:flex;align-items:center;width:100%;min-height:44px;box-sizing:border-box;margin:0 0 3px;',
      'padding:7px 10px;border:0;border-radius:2px;background:transparent;color:#cfeef6;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;',
      'text-align:left;letter-spacing:.03em;cursor:pointer}',
      // the star strip, bottom-left, 44 px (GridAtlas's phone chips: chipStaysOnMap MB:1521-1552; live twin in the cartridge from :5870)
      '#' + STRIP_ID + '{position:fixed;left:calc(8px + env(safe-area-inset-left,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));',
      'z-index:10019;display:flex;height:44px;box-sizing:border-box;background:rgba(4,10,13,.95);border:1px solid rgba(80,220,240,.3);',
      'font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)}',
      '#' + STRIP_ID + ':empty{display:none}',
      '#' + STRIP_ID + ' .gm-title{appearance:none;border:0;background:transparent;color:#cfeef6;display:flex;align-items:center;',
      'min-height:42px;padding:0 12px;font:inherit;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;text-decoration:none}',
      // Edition 4's bar, superseded: kept in the DOM at the shell's height so the engine's safeBox wrap (index.html:726),
      // which measures it, still starts the safe rectangle under the bar; invisible and untouchable.
      '#bar.kmb-superseded{visibility:hidden!important;pointer-events:none!important;height:var(--kmb-h,36px)!important;',
      'padding:0!important;border:0!important;overflow:hidden!important;flex-wrap:nowrap!important}',
      // #goto (the find box) opens right-aligned directly under the bar, 44 px, as GridAtlas's search (C6, cartridge 202609062358-substation-intelligence-v9-63.js:6011-6016)
      'body.kmb-installed #goto{left:auto!important;right:calc(10px + env(safe-area-inset-right,0px))!important;transform:none!important;',
      'top:calc(var(--kmb-h,36px) + 6px)!important;width:min(82vw,390px);min-width:0!important;min-height:44px;box-sizing:border-box;',
      'background:rgba(4,10,13,.98)!important;border:1px solid rgba(80,220,240,.32)!important;z-index:10018!important}',
      // C4 the 44 px hit box on a coarse pointer, removed while a panel is open (A6)
      '@media (pointer:coarse){' + B + ' .gm-title::after{content:"";position:absolute;left:0;right:0;top:0;height:44px}',
      B + '[data-open] .gm-title::after{display:none}}',
      // phone rule MB:372-382 (max-width:700px)
      '@media (max-width:700px){' + B + '{height:calc(34px + env(safe-area-inset-top,0px))}',
      B + ' .gm-title{min-height:34px;padding:0 6px;font-size:9px;letter-spacing:.025em}',
      B + ' .gm-brand-slot{max-width:48%;padding:0 2px}',
      B + ' .hud-header>div:first-child,' + B + ' .hud-header>div:last-child{display:none}',
      B + ' .ventus-main{font-size:11px;letter-spacing:.14em}',
      B + ' .ventus-sub{font-size:4.5px}',
      B + ' .gm-panel{position:fixed;top:calc(34px + env(safe-area-inset-top,0px));left:4px!important;right:4px!important;',
      'width:auto;max-width:none;max-height:calc(100dvh - 40px);padding-bottom:calc(6px + env(safe-area-inset-bottom,0px))}',
      B + ' .gm-prose{font-size:13px;line-height:1.45}' + B + ' .gm-prose.gm-small,' + B + ' .gm-panel #hud{font-size:12px;line-height:1.45}}',
      // last resort for a large system font: the bar scrolls sideways rather than wrapping (C9)
      B + '[data-overflow]:not([data-open]){overflow-x:auto;overflow-y:hidden;scrollbar-width:none}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  // ---------------------------------------------------------------- C1-C5 the bar, the brand, the titles (LEAD)
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function buildBar() {
    bar = el('nav'); bar.id = BAR_ID; bar.setAttribute('aria-label', 'Kuiper menu');
    var left = el('div', 'gm-side gm-side-left'), slot = el('div', 'gm-brand-slot'), right = el('div', 'gm-side gm-side-right');
    // the star slot: first in the left group (R7); its owner's schema name on it; empty until a node is mounted
    starHome = el('div', 'gm-group gm-star-slot'); starHome.setAttribute('data-owner', state.star.owner); left.appendChild(starHome);
    // C3: GridAtlas's masthead (shell atlas/releases/202608300453-atlas-v9/index.html:23-34), the same classes
    var hh = el('div', 'hud-header');
    var lf = el('div'); lf.innerHTML = '<small>SYSTEM TIME</small><br><span class="hud-val kmb-clock">--:--:--</span><br><span class="kmb-date">--/--/----</span>';
    var vb = el('div', 'ventus-brand'); vb.appendChild(el('div', 'ventus-main', 'Ventus')); vb.appendChild(el('div', 'ventus-sub', 'Cables & Connectivity®'));
    var rt = el('div'); rt.style.textAlign = 'right'; rt.innerHTML = '<small>2050 TARGET</small><br><span class="hud-val kmb-days" style="color:#ff9d00">-- DAYS</span>';
    hh.appendChild(lf); hh.appendChild(vb); hh.appendChild(rt); slot.appendChild(hh);
    MENUS.forEach(function (m, i) {
      var name = m[0], menu = el('div', 'gm-menu'), t = el('button', 'gm-title', m[1]), p = el('div', 'gm-panel');
      menu.setAttribute('data-menu', name);
      t.type = 'button'; t.id = 'kmb-title-' + name; t.setAttribute('aria-haspopup', 'menu'); t.setAttribute('aria-expanded', 'false');
      t.setAttribute('aria-controls', 'kmb-panel-' + name);
      p.id = 'kmb-panel-' + name; p.setAttribute('role', 'group'); p.setAttribute('aria-labelledby', t.id); p.hidden = true;
      menu.appendChild(t); menu.appendChild(p);
      (i < 3 ? left : right).appendChild(menu);                 // MB:544 index < 3 ? left : right
      menus[name] = { menu: menu, title: t, panel: p };
    });
    bar.appendChild(left); bar.appendChild(slot); bar.appendChild(right);
    strip = el('div'); strip.id = STRIP_ID; strip.setAttribute('data-owner', state.star.owner);
    // the clock and the days to 2050-01-01 UTC: the engine's own arithmetic (ventus-corev8engine.js:602-608)
    function tick() {
      if (!lf.offsetParent) return;                                // rev 3: the flanks are hidden at max-width:700px; no work then
      var now = new Date(), target = new Date(Date.UTC(2050, 0, 1, 0, 0, 0));
      bar.querySelector('.kmb-clock').textContent = now.toLocaleTimeString('en-GB');
      bar.querySelector('.kmb-date').textContent = now.toLocaleDateString('en-GB');
      bar.querySelector('.kmb-days').textContent = Math.floor((target - now) / 86400000) + ' DAYS';
    }
    tick(); setInterval(tick, 1000);
  }

  // ---------------------------------------------------------------- C7 open / close / back gesture (LEAD)
  function setOpenState(name) {
    Object.keys(menus).forEach(function (k) {
      var on = k === name, m = menus[k];
      m.menu.classList.toggle('gm-open', on); m.title.setAttribute('aria-expanded', on ? 'true' : 'false'); m.panel.hidden = !on;
    });
    state.open = name || null; state.closed_at_rest = !name;
    if (name) bar.setAttribute('data-open', name); else bar.removeAttribute('data-open');
    measure(); publish();
    var KY = window.KY; if (KY && typeof KY.redraw === 'function') KY.redraw();
  }
  function openMenu(name) {
    if (!menus[name]) return;
    if (state.open === name) { closeAll(false); return; }
    var had = !!state.open;
    setOpenState(name);
    // the Android back gesture closes the panel: one history entry per open panel (C7); same URL, hash kept
    // rev 2: over an open card the page's own {kuiper} entry is on top; the panel shares it (one back closes both)
    // rather than stacking an entry the page cannot see past
    if (!had && pendingBack) { historyDepth = 1; }                // rev 3: our entry is being popped; onPop re-arms it on arrival
    else if (!had && history.state && history.state.kuiper && cardShown()) { historyDepth = 0; }
    else if (!had && !(history.state && history.state.kmb)) { try { history.pushState({ kmb: name }, ''); historyDepth = 1; } catch (e) { historyDepth = 0; } }
    else if (!had) { try { history.replaceState({ kmb: name }, ''); historyDepth = 1; } catch (e) {} }   // re-use our own entry, never stack two
    else { try { history.replaceState({ kmb: name }, ''); } catch (e) {} }
    var hook = onOpen[name]; if (hook) try { hook(menus[name].panel); } catch (e) {}
  }
  // rev 2, one owner of history (BLOCKER via the harness, 1 Nov 2026). The page's ANDROID BACK listener (index.html,
  // NL-009 04-touch, Opus 4) owns the card's history entry and reads every popstate it did not cause as a back gesture,
  // closing the card. It is registered before any module and runs first (measured: Chromium runs window popstate
  // listeners in registration order, capture or not), so the shell never causes a popstate while a card is open:
  //  - a programmatic close pops the shell's own {kmb} entry only when, after the command that closed it has run, the
  //    entry is still on top and no card is shown; otherwise the entry stays, and
  //  - whenever history lands on a {kmb} entry with no panel and no card open (a back gesture over it, or the page's
  //    own back() after its card closed), the shell steps over it, so no back gesture is ever spent on nothing.
  function cardShown() { var c = document.getElementById('card'); return !!c && getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().height > 0; }
  function stepOver() { if (!pendingBack && history.state && history.state.kmb && !state.open && !cardShown()) { pendingBack = true; setTimeout(function () { pendingBack = false; }, 2000); try { history.back(); } catch (e) { pendingBack = false; } return true; } return false; }
  function closeAll(fromPop) {
    if (!state.open) return;
    setOpenState(null);
    historyDepth = 0;
    if (!fromPop) setTimeout(stepOver, 0);                         // after the row's command (a pick opens the card synchronously)
  }
  var onOpen = {}, pendingBack = false;
  function onPop() {
    // rev 3 (Pixel 7 landscape A5): the pop the shell asked for has arrived. If a panel was reopened while it was on its
    // way, the reopened panel gets a fresh entry, so the next back gesture closes it instead of leaving the page.
    if (pendingBack) { pendingBack = false;
      if (state.open) { try { history.pushState({ kmb: state.open }, ''); historyDepth = 1; } catch (e) { historyDepth = 0; } }
      return; }
    if (state.open && history.state && history.state.kmb) return;   // a forward step back onto our own entry: nothing to do
    if (state.open) { historyDepth = 0; closeAll(true); return; }   // the back gesture popped our entry: the panel closes
    stepOver();
  }
  function wire() {
    bar.addEventListener('click', function (e) {
      var t = e.target.closest('.gm-title'); if (!t || !bar.contains(t)) return;
      var menu = t.parentNode && t.parentNode.getAttribute && t.parentNode.getAttribute('data-menu');
      if (!menu) return;                                             // the star entry is a link: let it navigate
      e.stopPropagation(); e.preventDefault(); openMenu(menu);
    });
    // keyboard as GridAtlas: ArrowLeft/Right, Home/End between titles, ArrowDown opens (MB:554-583)
    bar.addEventListener('keydown', function (e) {
      var ts = [].slice.call(bar.querySelectorAll('.gm-menu>.gm-title')), i = ts.indexOf(document.activeElement);
      if (i < 0) return; var j = -1;
      if (e.key === 'ArrowRight') j = (i + 1) % ts.length; else if (e.key === 'ArrowLeft') j = (i - 1 + ts.length) % ts.length;
      else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = ts.length - 1;
      else if (e.key === 'ArrowDown') { e.preventDefault(); var n = ts[i].parentNode.getAttribute('data-menu'); if (state.open !== n) openMenu(n); return; }
      if (j >= 0) { e.preventDefault(); ts[j].focus(); if (state.open) openMenu(ts[j].parentNode.getAttribute('data-menu')); }
      e.stopPropagation();                                          // the engine's single-key commands do not fire from the bar
    });
    // Escape closes (capture, before the engine and the card see it)
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) { e.stopPropagation(); closeAll(false); } }, true);
    // a tap on the wafer closes
    var cv = document.getElementById('c');
    cv.addEventListener('pointerdown', function () { if (state.open) closeAll(false); });
    // the back gesture
    addEventListener('popstate', onPop);
    addEventListener('resize', measure);
    // rev 3: a text field focused inside a panel (the WAFER filter) is scrolled to the panel's top, so the field and the
    // first rows under it are on screen (the on-screen keyboard takes the bottom; journey step lines-filter)
    bar.addEventListener('focusin', function (e) {
      var t = e.target, p = t && t.closest && t.closest('.gm-panel');
      if (!p || !/^(INPUT|TEXTAREA)$/.test(t.tagName) || /^(checkbox|radio|button)$/i.test(t.type || '')) return;
      setTimeout(function () { var pr = p.getBoundingClientRect(), r = t.getBoundingClientRect(); if (r.top - pr.top > 8) p.scrollTop += r.top - pr.top - 8; }, 0);
    });
    // a system font scale changes the titles' size without a resize: the overflow rule follows the measured widths
    try { var ro = new ResizeObserver(function () { measure(); }); [].forEach.call(bar.querySelectorAll('.gm-title,.ventus-brand'), function (n) { ro.observe(n); }); } catch (e) {}
    // a tap on the bar, a panel or the strip never reaches Edition 4's window pointerup spark-picker (index.html:685-689)
    bar.addEventListener('pointerup', function (e) { e.stopPropagation(); });
    strip.addEventListener('pointerup', function (e) { e.stopPropagation(); });
    // rev 3: the strip steps aside while a card is shown (it no longer lifts above the card): lifted, it sat where a
    // pinch's lower finger lands (integrator's journey, Galaxy S24 pinch-drag at 89.5,589; ADMISSIONS.md row 4)
    var card = document.getElementById('card');
    function lift() {
      var r = card.getBoundingClientRect(), on = getComputedStyle(card).display !== 'none' && r.height > 0;
      strip.style.display = on ? 'none' : '';
    }
    try { new MutationObserver(lift).observe(card, { attributes: true, childList: true, subtree: true }); } catch (e) {}
    // rev 3: while a finger that started on the wafer is down, the strip lets every other touch through to the wafer,
    // so a pinch whose second finger lands on the strip stays a pinch (Galaxy S24 pinch-drag, ADMISSIONS.md row 4)
    var cvEl = document.getElementById('c'), onWafer = new Set();
    function passThrough() { strip.style.pointerEvents = onWafer.size ? 'none' : ''; }
    addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && e.target === cvEl) { onWafer.add(e.pointerId); passThrough(); } }, true);
    function lifted(e) { if (onWafer.delete(e.pointerId)) passThrough(); }
    addEventListener('pointerup', lifted, true); addEventListener('pointercancel', lifted, true);
    addEventListener('resize', lift);
  }
  // the measured height drives the panels, the find box and Edition 4's safeBox bridge
  function measure() {
    if (!bar) return;
    var h = bar.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--kmb-h', h + 'px');
    if (bar.scrollWidth > bar.clientWidth + 1) bar.setAttribute('data-overflow', ''); else bar.removeAttribute('data-overflow');
    state.bar_height = h;
  }

  // ---------------------------------------------------------------- star slot (LEAD)
  // The rule (R7, measured): a title in the left group when the left side can hold it beside the centred brand
  // (STAR_TITLE_MQ), otherwise the bottom-left 44 px strip. One node, moved; the shell never clones it.
  function placeStar() {
    if (!starNode) { state.star.form = null; return; }
    var asTitle = mqStar ? mqStar.matches : true;
    var home = asTitle ? starHome : strip;
    if (starNode.parentNode !== home) home.appendChild(starNode);
    state.star.form = asTitle ? 'title' : 'strip';
    measure(); publish();
  }
  function mountStar(node, by) {
    if (!node || node.nodeType !== 1) return false;
    if (starNode && starNode !== node && starNode.parentNode) starNode.parentNode.removeChild(starNode);
    starNode = node; if (!node.classList.contains('gm-title')) node.classList.add('gm-title');
    state.star.mounted_by = by || 'unknown';
    placeStar(); return true;
  }
  function defaultStar() {
    // NL-009 round 1 06-seethrough, the bar entry: a link to the stable pointer, same tab (decision 5a), not a panel
    var a = el('a', 'gm-title', 'See Through'); a.href = '../../see-through/';
    a.title = 'See Through: from the stars to one substation in 3D'; a.setAttribute('data-star', 'see-through');
    a.setAttribute('data-default', 'nl009-06');
    mountStar(a, 'kuiper-shell (NL-009 06 default; Opus 5 replaces it through api.mountStar)');
  }

  // ---------------------------------------------------------------- panel helpers for the builder (LEAD)
  // row(label, onTap, hint): a 44 px <button> row; onTap runs, then the panel closes unless onTap returns true.
  // key(k): an onTap that sends the engine's own keydown (exactly what Edition 4's #keys buttons do, index.html:600-601).
  // link(label, href): an <a class="gm-row">; same tab on this host, target=_blank only for another host.
  // group(panel, title, owner): a heading and an empty .gm-group (data-owner) a later module fills; returned.
  // moveNode(panel, node): moves an Edition 4 node as the SAME node (listeners kept); counts it; returns it.
  var movedCount = 0;
  function row(label, onTap, hint) {
    var b = el('button', 'gm-row'); b.type = 'button'; b.appendChild(el('span', null, label));
    if (hint) b.appendChild(el('span', 'gm-hint', hint));
    b.addEventListener('click', function (e) { e.stopPropagation(); var keep = false; try { keep = onTap && onTap(e) === true; } finally { if (!keep) closeAll(false); } });
    return b;
  }
  function key(k) { return function () { closeAll(false); dispatchEvent(new KeyboardEvent('keydown', { key: k })); return true; }; }
  function link(label, href, hint) {
    var a = el('a', 'gm-row'); a.href = href; a.appendChild(el('span', null, label)); if (hint) a.appendChild(el('span', 'gm-hint', hint));
    try { if (new URL(href, location.href).host !== location.host) { a.target = '_blank'; a.rel = 'noopener'; } } catch (e) {}
    return a;
  }
  function group(panel, title, owner) {
    if (title) panel.appendChild(el('div', 'gm-layer-group', title));
    var g = el('div', 'gm-group'); if (owner) { g.setAttribute('data-owner', owner); state.groups[owner] = panel.id; }
    panel.appendChild(g); return g;
  }
  function moveNode(panel, node) { if (!node) return null; panel.appendChild(node); movedCount++; return node; }
  function prose(text, small) { var d = el('div', 'gm-prose' + (small ? ' gm-small' : '')); d.textContent = text; return d; }

  // ---------------------------------------------------------------- C5/C6 the panels' contents (BUILDER)
  // fillPanels(P) receives P = {file, edit, view, scope, wafer, about}, each the .gm-panel element, and helpers
  // row(), group(), moveNode(); it moves Edition 4's nodes as the same nodes (listeners kept) and returns the count moved.
  function fillPanels(P) {
    // BUILDER (OPUS-1 builder, 21:5x UTC). Keys: kuiper-belt editions/202611012135/index.html = IX (the Edition 4 copy).
    // Every Edition 4 control is MOVED as the same node: ids, classes and the listeners bound to the node itself stay
    // (#lyAll/#lyFocus change IX:729-730, #lyFind input/keydown IX:731-732, the #lines row/command delegation IX:733-734,
    // #top's own toggle IX:602). The five #keys buttons carry no listener of their own: #keys delegates
    // (IX:600-601 "dispatchEvent(new KeyboardEvent('keydown', { key:k }))"), so a moved button is answered by the same
    // one-line delegation on its panel, and the engine's keydown table (IX:614-618, :692) stays the only implementation.
    var moved = 0;
    function row(label, onTap, hint) {                           // a 44 px command row (GridAtlas MB:220-225)
      var b = el('button', 'gm-row', label); b.type = 'button';
      if (hint) b.appendChild(el('span', 'gm-hint', hint));
      if (onTap) b.addEventListener('click', function (e) { e.stopPropagation(); onTap(e); });
      return b;
    }
    function link(label, href, hint) {                           // a real link in the row's look (MB:228-233)
      var a = el('a', 'gm-row', label); a.href = href; a.setAttribute('role', 'button');
      if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }   // _blank only off-host (step 4.8)
      if (hint) a.appendChild(el('span', 'gm-hint', hint));
      return a;
    }
    function heading(panel, title) { var h = el('div', 'gm-layer-group', title); panel.appendChild(h); return h; }   // MB:245-247
    function group(panel, name, owner) {                         // a named, empty group its owner fills (STEPS.md C5, brief)
      var g = el('div', 'gm-group'); g.setAttribute('data-group', name); g.setAttribute('data-owner', owner);
      panel.appendChild(g); state.groups[name] = owner; return g;
    }
    function prose(panel, text, small) { var p = el('div', 'gm-prose' + (small ? ' gm-small' : ''), text); panel.appendChild(p); return p; }
    function moveNode(panel, node) { panel.appendChild(node); moved++; return node; }
    function key(k) { return document.querySelector('#keys [data-k="' + k + '"]'); }
    function run(k) { closeAll(false); dispatchEvent(new KeyboardEvent('keydown', { key: k })); }   // IX:601, panel closed first
    function hinted(node, hint) { node.appendChild(el('span', 'gm-hint', hint)); return node; }

    // the panels take the #keys delegation (IX:600-601); a command closes its panel before it runs, so safeBox()
    // (IX:262-268, which measures #top and #hud) sees them hidden and edFly lands the spark in the clear space (A5).
    // (Taps in a panel are kept from IX:685-689's spark picker by the bar's own pointerup stop in wire().)
    Object.keys(P).forEach(function (name) {
      P[name].addEventListener('click', function (e) {
        var b = e.target.closest('[data-k]'); if (!b || !P[name].contains(b)) return;
        if (b.closest('#lines')) return;                          // #lines answers its own (IX:733)
        e.stopPropagation(); run(b.getAttribute('data-k'));
      });
    });

    // ---- FILE: find, the edition's files, step 6's group (STEPS.md C5 FILE; GridAtlas File MB:1662-1663)
    moveNode(P.file, hinted(key('/'), '/'));                     // "find": a key, a repository, a period (IX:617)
    heading(P.file, 'This edition');
    P.file.appendChild(link('README', 'README.md'));
    P.file.appendChild(link('keys.json · the verified lines', 'keys.json'));
    P.file.appendChild(link('proof', 'proof/'));
    group(P.file, 'file', 'file (Opus 6, step 6: open a key, an edition, an app, copy a link)');

    // ---- EDIT: what the colours mean and what is lit (STEPS.md C5 EDIT; GridAtlas Edit = Status Colours MB:1664)
    heading(P.edit, 'Colours (PALETTE.md)');
    [['#c9d3e6', 'grey', 'the record, as measured'], ['#2ee6e6', 'cyan', 'the instrument'],
     ['#22ee77', 'green', 'energised: lit by a query'], ['#ffb000', 'amber', 'attention: new code'],
     ['#ff2bd6', 'magenta', 'selected: the thing under the hand']].forEach(function (c) {   // PALETTE.md:9-13, IX:27-28
      var d = el('div', 'gm-prose gm-legend');
      var sw = el('span'); sw.style.cssText = 'display:inline-block;width:12px;height:12px;margin-right:10px;vertical-align:-1px;background:' + c[0];
      d.appendChild(sw); d.appendChild(document.createTextNode(c[1] + ' · ' + c[2])); P.edit.appendChild(d);
    });
    heading(P.edit, 'Selection');
    P.edit.appendChild(row('filter the verified lines', function () {
      openMenu('wafer'); var f = document.getElementById('lyFind'); if (f) f.focus();
    }, 'WAFER'));
    P.edit.appendChild(row('clear the selection', function () { run('Backspace'); }, '⌫'));   // IX:618, :692

    // ---- VIEW: the readout, the camera (STEPS.md C5 VIEW; GridAtlas View MB:1665, :1556-1558)
    heading(P.view, 'Camera');
    moveNode(P.view, hinted(key('e'), 'e'));                     // next verified line (IX:692 edNext(1))
    P.view.appendChild(row('previous verified line', function () { run('E'); }, 'E'));
    moveNode(P.view, hinted(key('Backspace'), '⌫'));             // whole wafer (IX:618)
    P.view.appendChild(row('full screen', function () {
      closeAll(false);
      var d = document, r = d.documentElement;
      try {
        var p = d.fullscreenElement ? d.exitFullscreen() : (r.requestFullscreen ? r.requestFullscreen() : null);
        if (p && p.catch) p.catch(function () {});               // refused (iframe, iOS): nothing breaks, nothing logged
      } catch (e) {}
    }));
    heading(P.view, 'Readout');
    moveNode(P.view, document.getElementById('hud'));            // live: draw() rewrites it every frame (IX:332 ff.)
    heading(P.view, 'Learn');
    P.view.appendChild(link('Learn the Kuiper', '../../learn-the-kuiper/'));

    // ---- SCOPE: the focus (STEPS.md C5 SCOPE; GridAtlas Scope MB:1666-1669)
    // rev 2: a proxy, not a moved node (Opus 3 owns #lyFocus). One tap toggles whichever #lyFocus exists, Edition 4's or
    // the layers module's, through its own change listener; the row shows the state each time SCOPE opens.
    var focusRow = row('[ ] gridatlas + data centres only', function () {
      var f = document.getElementById('lyFocus'); if (f) f.click(); return true;   // keep SCOPE open to show the new state
    });
    function focusLabel() { var f = document.getElementById('lyFocus'); focusRow.firstChild.nodeValue = (f && f.checked ? '[x]' : '[ ]') + ' gridatlas + data centres only'; focusRow.disabled = !f; }
    focusRow.addEventListener('click', function () { setTimeout(focusLabel, 0); });
    P.scope.appendChild(focusRow); onOpen.scope = focusLabel;
    moveNode(P.scope, hinted(key('n'), 'n'));                    // new code (IX:616)
    moveNode(P.scope, hinted(key('r'), 'r'));                    // random line (IX:615)
    P.scope.appendChild(row('one repository or one period', function () { run('/'); }, '/'));   // IX:604-613

    // ---- WAFER: the verified-lines layer, whole (its row delegation lives on #lines, IX:733-734); step 3's group
    group(P.wafer, 'layers', 'layers (Opus 3, kuiper.layers.v1)');
    var lines = document.getElementById('lines');                // rev 2: optional (Opus 3's patch deletes it)
    if (lines) { lines.classList.remove('gm-panel'); moveNode(P.wafer, lines); }
    // a picked row or a next/previous closes the panel first (capture: before #lines' own handler stops the event)
    P.wafer.addEventListener('click', function (e) {
      if (e.target.closest('#lines [data-i], #lines [data-k]')) closeAll(false);
    }, true);
    // the list is rebuilt on every open, from the same input the filter drives (IX:731 -> fillLines)
    onOpen.wafer = function () { var f = document.getElementById('lyFind'); if (f) f.dispatchEvent(new Event('input')); };

    // ---- ABOUT: the card law first (Opus 2), the edition, the law, the estate, the licence (STEPS.md C5 ABOUT)
    // the card law first, byte for byte as Opus 2 asked on #10 (OPUS-2 lead REQUEST 21:50 UTC; ROADMAP step 2 K3)
    var law = el('p', 'gm-prose', 'The line of code is the header. Every card opens with the line itself, verbatim from the key; '
      + 'the key is the second row; every name a person gave the line comes after.');
    law.setAttribute('data-owner', 'line-card'); law.setAttribute('data-law', 'L11'); law.style.margin = '0';
    P.about.appendChild(law); state.groups['line-card'] = 'line-card (Opus 2): the card law sentence';
    moveNode(P.about, document.getElementById('top'));           // #big the edition's name + count, #sub the subtitle
    var long = document.querySelector('#foot .long');
    long.classList.add('gm-prose', 'gm-small'); moveNode(P.about, long);   // the law sentence, on a phone too (NL-009 08 F2)
    heading(P.about, 'Estate');
    // its one inline link (IX:100 "the laws") is a 14 px target inside prose: the same node becomes a 44 px row here,
    // and the sentence keeps the words
    var laws = long.querySelector('a');
    if (laws) {
      long.replaceChild(document.createTextNode(laws.textContent), laws);
      laws.className = 'gm-row'; laws.setAttribute('role', 'button'); laws.target = '_blank'; laws.rel = 'noopener';
      laws.appendChild(el('span', 'gm-hint', '↗')); P.about.appendChild(laws); moved++;
    }
    P.about.appendChild(link('See Through', '../../see-through/'));
    P.about.appendChild(link('Learn the Kuiper', '../../learn-the-kuiper/'));
    P.about.appendChild(link('the wafer', '../../'));
    P.about.appendChild(link('editions', '../'));
    P.about.appendChild(link('kuiper-belt on GitHub', 'https://github.com/Ventusltd/kuiper-belt', '↗'));
    heading(P.about, 'Licence');
    prose(P.about, 'Code Apache-2.0; text and data CC BY 4.0 (kuiper-belt README). The bar, its CSS and its menus are '
      + 'copied from GridAtlas, Copyright 2026 Ventus Ltd, Apache-2.0. "Ventus" and "Cables & Connectivity®" are the '
      + 'mark of Ventus Ltd, used by its owner; the Apache-2.0 licence of this code does not license the mark.', true);

    // BUILDER CSS: one rule the lead's sheet does not carry, appended to the same <style id="kuiper-menu-bar-css">.
    // The focus switch left #linesctl, so it takes the #linesctl label look (lead's rule above) under its own class.
    var st = document.getElementById(STYLE_ID), B = '#' + BAR_ID;
    if (st) st.textContent += B + ' .gm-panel label.gm-check{display:flex;align-items:center;gap:10px;min-height:44px;'
      + 'padding:7px 10px;cursor:pointer;box-sizing:border-box}'
      + B + ' .gm-panel label.gm-check input{width:20px;height:20px;margin:0;accent-color:#2ee6e6}'
      + B + ' .gm-panel .long.gm-prose{display:block!important}' + B + ' .gm-legend{padding:4px 8px}';
    return moved;
  }

  // ---------------------------------------------------------------- install (LEAD)
  function install(KY) {
    if (state.installed) return api();
    var miss = missing();
    if (miss.length) { loudFailure('missing ' + miss.join(', ')); throw new Error('kuiper-shell: missing ' + miss.join(', ')); }
    installStyle(); buildBar();
    var P = {}; MENUS.forEach(function (m) { P[m[0]] = menus[m[0]].panel; });
    var moved = 0;
    try { moved = fillPanels(P) || 0; } catch (e) { loudFailure('panels did not build: ' + e.message); throw e; }
    document.body.appendChild(bar); document.body.appendChild(strip);
    // Edition 4's bar steps down only now, after the complete inventory is built (C8)
    var old = document.getElementById('bar'); old.classList.add('kmb-superseded'); old.setAttribute('aria-hidden', 'true');
    [].forEach.call(old.querySelectorAll('button,a'), function (b) { b.tabIndex = -1; });
    document.body.classList.add('kmb-installed');
    wire();
    mqStar = window.matchMedia ? window.matchMedia(STAR_TITLE_MQ) : null;
    if (mqStar) { var f = function () { placeStar(); }; if (mqStar.addEventListener) mqStar.addEventListener('change', f); else mqStar.addListener(f); }
    defaultStar();
    var f2 = document.getElementById(FAIL_ID); if (f2) f2.parentNode.removeChild(f2);
    state.controls_moved = moved; state.installed = true; state.failure = null; state.mode = KY ? 'KY' : 'standalone';
    MENUS.forEach(function (m) { state.panel_counts[m[1]] = menus[m[0]].panel.querySelectorAll('button,a,[role="button"],label,input').length; });
    // keys.json is awaited, not failed on (C8): Edition 4's loadEdition rewrites #big when it has loaded or failed
    var big = document.getElementById('big');
    function keysState() { var t = big.textContent || ''; state.keys = /verified lines lit/.test(t) ? 'loaded' : (/did not load/.test(document.getElementById('hud').textContent) ? 'error: keys.json did not load' : 'waiting'); publish(); }
    keysState(); try { new MutationObserver(keysState).observe(big, { childList: true, characterData: true, subtree: true }); } catch (e) {}
    measure(); publish();
    var a = api(); window.__KUIPER_SHELL__ = a;
    return a;
  }

  function api() {
    return Object.freeze({
      open: function (n) { openMenu(n); }, close: function () { closeAll(false); },
      panel: function (n) { return menus[n] ? menus[n].panel : null; },
      mountStar: function (node, by) { return mountStar(node, by); },
      inspect: function () { return JSON.parse(JSON.stringify(state)); }
    });
  }

  // ---------------------------------------------------------------- registration (LEAD)
  // With the loader (ROADMAP step 4): one KY.register call, installed by the loader. Without it (until Opus 4's
  // hook table lands in index.html): the module waits for the engine on GridAtlas's clock and installs itself.
  function start() {
    publish();
    var KY = window.KY;
    if (KY && typeof KY.register === 'function') {
      KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN,
        requires: ['safeBox', 'card', 'hud', 'big', 'sub', 'cv', 'gbox', 'gin', 'redraw'],
        provides: [ID, 'menuBar'],
        install: function (K) { return whenEngine(function () { return install(K); }); },
        inspect: function () { return JSON.parse(JSON.stringify(state)); } });
      return;
    }
    whenEngine(function () { try { install(null); } catch (e) { /* the strip already says why */ } });
  }
  // The engine's synchronous part ends by building Edition 4's #bar (index.html:698-704); until then nothing is
  // judged. After the limit the failure names what never came.
  function whenEngine(go) {
    if (document.getElementById('bar')) return go();
    var t = setInterval(function () {
      state.attempts++;
      if (document.getElementById('bar')) { clearInterval(t); go(); return; }
      if (state.attempts >= RETRY_MAX) { clearInterval(t); loudFailure('the engine never built #bar (' + RETRY_MAX + ' tries every ' + RETRY_MS + ' ms): missing ' + missing().join(', ')); }
    }, RETRY_MS);
    return undefined;
  }
  start();
})();
