/* kuiper module see-through, generation 202611012141 (UTC), CERN-OHL-S-2.0 (the whole file; ROADMAP 9.8: never Apache-2.0)
   Opus team 5, NL-010 roadmap step 5 "See Through, the star player" (FIXES/NL-010/ROADMAP.md step 5; team-3/STEPS.md 5.1-5.8).
   Licence: CERN-OHL-S v2 for this whole file (see-through/202610050609/LICENSE.md:3-7, licences/globalgrid2050-CERN-OHL-S-2.0.txt).
   The block marked "CERN-OHL-S-2.0" copies See Through's star-key rule (descent.js:19, :963, :965; from Learn the Kuiper grid.js:36-38,
   CERN-OHL-S v2 by its NOTICE.md:8-10), so the module cannot be Apache-2.0; the Apache-2.0 kuiper-belt engine is only called.
   Substation names drawn from data/see-through.json are (c) OpenStreetMap contributors, ODbL 1.0.
   Folds in NL-009 round 1 06-seethrough (FIXES/NL-009/round1/06-seethrough.md): the SEE THROUGH entry in the bar's face,
   same tab, through the stable pointer ../../see-through/, and the "family" panel text (#edapps).
   requires: wafer, keyPlace, address, describe, goKey, fmt, esc, cv, ov, o2, hud, card, gin, repos, SPACE, cam, sel, redraw, draw
   optional (used when admitted earlier): kuiper-shell (api.mountStar, api.panel('about')), layers (KY.layers), file (step 6)
   provides: see-through
   Public api: KY.modules['see-through'].api = { link(fields), starKey(j, space), remap(key, spaceOld), inspect() } */
(function () {
  'use strict';
  var ID = 'see-through', GEN = '202611012141';
  var POINTER = '../../see-through/';                        // the stable pointer (NL-009 06 decision (c); see-through/index.html:7,:11,:12)
  var SENTENCE = 'See Through: from the stars to one substation in 3D';   // globalgrid2050@c66759f homepage_versions/homepage_v134.html:35
  var DATA = 'data/see-through.json';
  var STRIP_MQ = '(max-width: 380px)';                       // ROADMAP R7 (used only without team 1's shell, which owns the rule); Q7 open
  var HIT2 = 81;                                             // 9 px tap radius, Edition 4's spark rule (index.html:688-693)
  var CYAN = 'rgba(46,230,230,', AMBER = '#ffb000';          // PALETTE.md: cyan #2ee6e6 the instrument; amber attention

  var KY = null, H = null;
  var st = { form: 'none', status: 'WAIT', why: 'waiting for the wafer', placed: 0, total: 0, space: 0, wafer: 0,
             keys: null, xy: null, names: null, linkRead: null, rowsAdded: 0, starTap: null, errors: [] };

  // ------------------------------------------------------------------ CERN-OHL-S-2.0 (See Through's star-key rule)
  // see-through/202610050609/descent.js:19  var NRULE = 20000;  // particle i carries key floor((i + 0.5) * SPACE / NRULE)
  // descent.js:963  key = Math.floor((ki + 0.5) * S.SPACE / NRULE);  :965  if (c === 0) S.subKey[p] = key;  (j < 5800)
  var NRULE = 20000, NSUB = 5800;
  function starKey(j, space) { return Math.floor((j + 0.5) * space / NRULE); }
  // ------------------------------------------------------------------ end CERN-OHL-S-2.0

  // The SPACE remap (ROADMAP 5.6): a star key cut under an older sky names star j; under the wafer's sky star j has a new
  // key. j = floor(key * NRULE / spaceOld) is accepted only when starKey(j, spaceOld) === key; otherwise null.
  function remap(key, spaceOld, spaceNew) {
    spaceNew = spaceNew || st.wafer;
    if (!(spaceOld > 0) || !(key >= 0)) return null;
    var j = Math.floor(key * NRULE / spaceOld);
    for (var d = -1; d <= 1; d++) { var jj = j + d; if (jj >= 0 && jj < NSUB && starKey(jj, spaceOld) === key) return { j: jj, key: starKey(jj, spaceNew) }; }
    return null;
  }

  // ------------------------------------------------------------------ SECTION 2: links out by the hash grammar (5.5, 5.7)
  // Field order on the way out is the order See Through resolves them: repo, key (+space), sub, view.
  function link(f) {
    f = f || {}; var p = [];
    if (f.repo) p.push('repo=' + encodeURIComponent(f.repo));
    // space travels only when the caller names the sky a STAR key was cut for (a layer star); a line's key is the wafer's
    // own address and goes out bare, #key=<k> (ROADMAP 5.7(a); A5: the card of bodies[0] ends /see-through/#key=36064705400)
    if (f.key != null && /^\d{1,15}$/.test(String(f.key))) { p.push('key=' + f.key); if (f.space && /^\d{1,15}$/.test(String(f.space))) p.push('space=' + f.space); }
    if (f.sub) p.push('sub=' + encodeURIComponent(String(f.sub).slice(0, 80)));
    if (f.view && /^(kuiper|map|sat|3d)$/.test(f.view)) p.push('view=' + f.view);
    return POINTER + (p.length ? '#' + p.join('&') : '');
  }

  // ------------------------------------------------------------------ SECTION 1: the entry, two forms, one node (5.1, 5.2)
  var LIT = 'background:rgba(80,220,240,.16);color:#fff;text-decoration:none';     // the shell's lit face (menu-bar.js:177-178)
  var CSS = ''
    + '#kuiper-menu-bar #kuiper-star.gm-title,#bar #kuiper-star.gm-title{' + LIT + ';border-color:var(--cy,#2ee6e6);flex:0 0 auto}'
    + '#kuiper-star-strip #kuiper-star.gm-title{' + LIT + ';min-height:44px;height:44px;padding:0 14px;font-size:11px;'
    + 'letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(80,220,240,.5);box-sizing:border-box;display:flex;align-items:center}'
    + '#kuiper-star-strip.ky-st-own{position:fixed;left:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:14;background:#090c13}'
    + '#kuiper-star-strip.ky-st-own:empty{display:none}'
    + 'html.kuiper-star-strip #card{bottom:calc(60px + env(safe-area-inset-bottom))!important}'
    + '#card .ky-st{display:block;min-height:44px;line-height:44px;color:var(--cy,#2ee6e6);text-decoration:none;border-top:1px solid #12414a;margin-top:6px}'
    + '#card .ky-st+.ky-st{margin-top:0}'
    + '#ky-st-apps{margin-top:6px;color:var(--dim,#8fb3bd)} #ky-st-apps a{color:#66ccff}';

  // team 1's shell owns the star slot and its rule (R7; modules/202611012143-kuiper-shell.js api.mountStar); without it,
  // this module places the same node itself by ROADMAP R7's breakpoint
  function shell() {
    var m = KY && KY.modules && KY.modules['kuiper-shell'];
    return (m && m.api && typeof m.api.mountStar === 'function') ? m.api
      : (window.__KUIPER_SHELL__ && typeof window.__KUIPER_SHELL__.mountStar === 'function' ? window.__KUIPER_SHELL__ : null);
  }

  function mountEntry() {
    if (document.getElementById('kuiper-star')) return;     // never two copies
    var s = document.createElement('style'); s.id = 'ky-see-through-css'; s.textContent = CSS; document.head.appendChild(s);
    var a = document.createElement('a');
    a.id = 'kuiper-star'; a.className = 'gm-title'; a.href = POINTER; a.textContent = 'SEE THROUGH';
    a.title = SENTENCE; a.setAttribute('aria-label', SENTENCE); a.setAttribute('role', 'button');
    a.setAttribute('data-star', 'see-through'); a.setAttribute('data-ky-app', 'see-through');
    // Edition 4's bar delegates clicks on .gm-title to its panels (index.html:721); the star is a link, so its click
    // stops here and the browser follows the href in the same tab (NL-009 06 decision (a))
    a.addEventListener('click', function (e) { e.stopPropagation(); });
    st.a = a;
    var mq = window.matchMedia ? window.matchMedia(STRIP_MQ) : null;
    function own() {                                        // no shell: R7's breakpoint, the same node moved
      var strip = document.getElementById('kuiper-star-strip');
      if (!strip) { strip = document.createElement('div'); strip.id = 'kuiper-star-strip'; strip.className = 'ky-st-own'; document.body.appendChild(strip); }
      if (mq ? mq.matches : innerWidth <= 380) { if (a.parentNode !== strip) strip.appendChild(a); return 'strip'; }
      var bar = document.getElementById('bar'), name = document.getElementById('barname');
      if (bar) { var ref = name && name.parentNode === bar ? name.nextSibling : bar.firstChild; if (ref !== a) bar.insertBefore(a, ref); }
      return 'title';
    }
    function place() {
      var sh = shell();
      if (sh) {
        if (!st.mounted) { sh.mountStar(a, ID + ' ' + GEN); st.mounted = 'kuiper-shell'; }
        var f = null; try { f = sh.inspect().star.form; } catch (e) {}
        st.form = f || (a.closest('#kuiper-star-strip') ? 'strip' : 'title');
      } else { st.form = own(); st.mounted = 'own'; }
      document.documentElement.classList.toggle('kuiper-star-strip', st.form === 'strip');
    }
    st.place = place; place();
    function later() { setTimeout(place, 0); }               // after the shell's own matchMedia listener has moved the node
    if (mq) { if (mq.addEventListener) mq.addEventListener('change', later); else if (mq.addListener) mq.addListener(later); }
    addEventListener('resize', later);
    if (!shell() && window.MutationObserver) {               // a shell installed after this module takes the node over
      var mo = new MutationObserver(function () { if (shell()) { mo.disconnect(); st.mounted = null; place(); } });
      mo.observe(document.body, { childList: true });
    }
  }

  // The family text (NL-009 06 #edapps), in ABOUT when team 1's shell provides it, else in the EDITION panel (#top).
  function mountAbout() {
    if (document.getElementById('ky-st-apps')) return;
    var sh = shell(), host = null;
    try { host = sh && sh.panel ? sh.panel('about') : null; } catch (e) {}
    host = host || document.getElementById('top');
    if (!host) return;
    var d = document.createElement('div'); d.id = 'ky-st-apps';
    d.innerHTML = 'The apps: <a href="' + POINTER + '">See Through</a>, from the stars to one substation in 3D (any of 5,800 UK '
      + 'substations rising on the real satellite ground with its pylons, drawn by rule from open map data; CERN-OHL-S v2; the SEE THROUGH '
      + 'entry above), and <a href="../../learn-the-kuiper/">Learn the Kuiper</a>, a small game about the one rule that places every dot '
      + 'here, one dot and two numbers (code Apache-2.0, text CC BY 4.0). Both gather their stars by the placement law of this wafer, '
      + 'r = √key, θ = key × golden angle, and both stay on this host: see-through/ and learn-the-kuiper/ always open the newest dated folder.';
    d.addEventListener('click', function (e) { if (e.target.closest('a')) e.stopPropagation(); });
    if (host.firstChild && host.id !== 'top') host.insertBefore(d, host.firstChild); else host.appendChild(d);   // ABOUT: See Through first
  }

  // ------------------------------------------------------------------ SECTION 3: the Kuiper layer of See Through's stars (5.6)
  function layersApi() { return KY && KY.layers ? KY.layers : (KY && KY.modules && KY.modules.layers && KY.modules.layers.api) || null; }
  function layerOn() {
    var L = layersApi();
    if (L && typeof L.get === 'function') { try { var r = L.get('see-through'); if (r && typeof r.on === 'boolean') return r.on; } catch (e) {} }
    return true;
  }
  function setState(status, why) {
    st.status = status; st.why = why || '';
    // registered once with the registry (team-2/STEPS.md 3.3 KY.layers.register), without a draw function: the stars are
    // drawn by KY.draw.add(drawStars) alone, so a registry that also calls record.draw cannot draw them twice; the row's
    // state is read from api.inspect().layer (status, why, row, placed, total)
    var L = layersApi();
    if (!st.registered && L && typeof L.register === 'function') {
      st.registered = true;
      try { L.register({ id: 'see-through', key: 'layer:see-through', module: GEN + '-see-through.js', drawn_by: ID,
        inspect: function () { return inspect().layer; } }); } catch (e) { st.errors.push('layers.register: ' + e.message); }
    }
    if (KY) KY.redraw();
  }
  function row() {
    if (st.status === 'OK') return 'OK · ' + H.fmt(st.placed) + ' of ' + H.fmt(st.total) + ' · See Through 202610050609 · SPACE ' + H.fmt(st.space);
    if (st.status === 'FAIL' && st.space && st.wafer && st.space !== st.wafer) return 'FAIL · SPACE ' + H.fmt(st.space) + ' ≠ wafer ' + H.fmt(st.wafer);
    return st.status + (st.why ? ' · ' + st.why : '');
  }
  function admit(j) {
    // the layer's own predicate (team-2/STEPS.md 3.2): a code-feature-collection.v1, 5,800 Point keys, each the star key
    // of its substation under the file's space, the file's space equal to the wafer's; otherwise nothing is drawn
    if (!j || j.format !== 'code-feature-collection.v1' || !Array.isArray(j.features)) return 'format ' + (j && j.format) + ' not admitted';
    st.space = +j.space; st.total = j.features.length;
    if (st.space !== st.wafer) return null;               // FAIL by SPACE, worded by row()
    if (st.total !== NSUB) return 'features ' + st.total + ' ≠ ' + NSUB;
    var keys = new Float64Array(NSUB), names = new Array(NSUB);
    for (var i = 0; i < NSUB; i++) {
      var f = j.features[i], g = f && f.geometry, p = (f && f.properties) || {};
      if (!g || g.type !== 'Point' || p.sub !== i) return 'feature ' + i + ' is not substation ' + i;
      if (g.key !== starKey(i, st.space)) return 'feature ' + i + ' key ' + g.key + ' ≠ law ' + starKey(i, st.space);
      if (!(g.key >= 0 && g.key < st.wafer)) return 'feature ' + i + ' key beyond the wafer';
      keys[i] = g.key; names[i] = p.name || '';
    }
    var xy = new Float64Array(2 * NSUB);
    for (var k = 0; k < NSUB; k++) { var q = H.keyPlace(keys[k]); xy[2 * k] = q[0]; xy[2 * k + 1] = q[1]; }   // keyPlace and nothing else
    st.keys = keys; st.names = names; st.xy = xy; st.placed = NSUB;
    return '';
  }
  function loadLayer() {
    setState('LOAD', DATA);
    return fetch(DATA, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(DATA + ' HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      var why = admit(j);
      if (why === null) { st.placed = 0; setState('FAIL', 'SPACE ' + st.space + ' ≠ wafer ' + st.wafer); }
      else if (why) { st.placed = 0; setState('FAIL', why); }
      else setState('OK', '');
    }).catch(function (e) { st.placed = 0; setState('FAIL', e.message); });
  }
  function toScreen(x, y) {
    var c = KY.cam; return [(x - c.x) * c.zoom + H.ov.width / 2, H.ov.height / 2 - (y - c.y) * c.zoom];
  }
  function drawStars(o2) {
    o2 = o2 || H.o2;
    var on = layerOn(), line = '\nSEE THROUGH · ' + (on ? row() : 'stars layer off');
    if (on && st.status === 'OK' && st.xy) {
      var c = KY.cam, w = H.ov.width, h = H.ov.height, n = 0, z = c.zoom, cx = c.x, cy = c.y, xy = st.xy;
      o2.fillStyle = CYAN + '.85)'; o2.beginPath();
      for (var i = 0; i < NSUB; i++) {
        var x = (xy[2 * i] - cx) * z + w / 2, y = h / 2 - (xy[2 * i + 1] - cy) * z;
        if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
        o2.moveTo(x + 1.6, y); o2.arc(x, y, 1.6, 0, 6.2832); n++;
      }
      o2.fill(); st.inView = n;
      line += ' · ' + H.fmt(n) + ' in view';
    }
    if (st.ring) {                                         // the key a link arrived with (5.8), amber, attention
      var p = toScreen(st.ring[0], st.ring[1]);
      o2.strokeStyle = AMBER; o2.lineWidth = 1.5; o2.beginPath(); o2.arc(p[0], p[1], 12, 0, 6.2832); o2.stroke();
    }
    try { H.hud.textContent += line; } catch (e) {}
  }
  // a tap within 9 px of a star: the card for the line of code at that key, with the row down into See Through
  function starAt(px, py) {
    if (!layerOn() || st.status !== 'OK' || !st.xy) return -1;
    var best = -1, bd = HIT2;
    for (var i = 0; i < NSUB; i++) { var p = toScreen(st.xy[2 * i], st.xy[2 * i + 1]), d = (p[0] - px) * (p[0] - px) + (p[1] - py) * (p[1] - py); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function mountTap() {
    var down = null;
    H.cv.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, id: e.pointerId, n: (down && down.live) ? 2 : 1, live: true }; });
    addEventListener('pointerup', function (e) {
      if (!down || down.id !== e.pointerId) return; var d0 = down; down = null;
      if (Math.abs(e.clientX - d0.x) + Math.abs(e.clientY - d0.y) >= 4 || d0.n > 1) return;
      var j = starAt(e.clientX, e.clientY); if (j < 0) return;
      setTimeout(function () {                             // after the engine's and the edition's own tap handlers
        var card = H.card, spark = card.style.display === 'block' && card.querySelector('.cq, a[target="_blank"]');
        st.starTap = { j: j, key: st.keys[j], spark: !!spark };
        if (!spark) {                                      // a spark wins its own card; a star gets the card of its key
          var k = st.keys[j], a = H.address(k);
          // the card law (team-1/STEPS.md K0, K1): row 1 is the line at the key; the edition holds no text for a star's key,
          // so an issued key opens with the card law's own refusal "no text at key", then the key (describe); a silent key
          // has no line at all and opens with describe's own "was never issued"
          // wrapped in line-card's .lc-in so the sheet keeps its padding when line-card is admitted (#card.lc has padding 0)
          card.style.display = 'block'; card.innerHTML = '<div class="lc-in"><button class="cx" aria-label="close">×</button>'
            + (a && !a.silent ? '<header class="lc-h"><code></code><span class="lc-none" style="color:var(--am)">no text at key</span></header>' : '')
            + H.describe(a) + '</div>';
          card.setAttribute('aria-label', a && !a.silent ? 'no text at key' : 'key ' + H.fmt(k) + ' was never issued');
          try { KY.sel.target = { x: st.xy[2 * j], y: st.xy[2 * j + 1] }; } catch (err) {}
        }
        addRows(); KY.redraw();
      }, 0);
    });
  }

  // ------------------------------------------------------------------ SECTION 2b: the card rows (5.7 a, b, d)
  function cardKey() {
    var card = H.card, el = card.querySelector('[data-key]');
    if (el && /^\d{1,15}$/.test(el.getAttribute('data-key'))) return +el.getAttribute('data-key');
    var m = /key\s*(?:<b>)?\s*([\d,]{1,20})\s*(?:<\/b>)?/i.exec(card.innerHTML);
    return m ? +m[1].replace(/,/g, '') : -1;
  }
  function starIndexOfKey(k) {
    if (!st.keys) return -1; var j = Math.floor(k * NRULE / st.space);
    for (var d = -1; d <= 1; d++) if (j + d >= 0 && j + d < NSUB && st.keys[j + d] === k) return j + d;
    return -1;
  }
  function addRows() {
    var card = H.card; if (!card || card.style.display === 'none' || card.querySelector('.ky-st')) return;
    var k = cardKey(); if (!(k >= 0)) return;
    var html = '', j = starIndexOfKey(k);
    if (j >= 0) {
      var nm = st.names[j] || ('SUBSTATION ' + j + ' (NO NAME IN THE PUBLIC FILE)');
      html += '<a class="ky-st" data-ky-st="star" href="' + H.esc(link({ key: k, space: st.space })) + '">see this star fall to ' + H.esc(nm.toUpperCase()) + '</a>';
    } else {
      html += '<a class="ky-st" data-ky-st="key" href="' + H.esc(link({ key: k })) + '">see this line among the stars</a>';
    }
    var a = H.address(k);
    if (a && !a.silent && H.repos[a.c.repo]) {
      var name = H.repos[a.c.repo].name;
      html += '<a class="ky-st" data-ky-st="repo" href="' + H.esc(link({ repo: name })) + '">its stars in See Through: ' + H.esc(name) + '</a>';
    }
    (card.querySelector('.lc-in') || card).insertAdjacentHTML('beforeend', html); st.rowsAdded++;
  }
  function mountCardRows() {
    if (!window.MutationObserver) return;
    var busy = false;
    new MutationObserver(function () { if (busy) return; busy = true; try { addRows(); } finally { busy = false; } })
      .observe(H.card, { childList: true, attributes: true, attributeFilter: ['style'] });
  }
  // 5.7 (c): the find box's text that is no key, no period, no "new" and no repository is a substation name for See Through
  function mountFindFallback() {
    H.gin.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var raw = H.gin.value.trim(), q = raw.replace(/[ ,_]/g, ''), low = raw.toLowerCase();
      if (!raw || /^(20\d\d)(?:-(\d\d))?(?:-(\d\d))?$/.test(raw) || /^(?:show\s+)?new(?:\s+code)?(?:\s+(\d+)\s*h?)?$/.test(low) || /^\d+$/.test(q)) return;
      if (H.repos.some(function (r) { return r.name.toLowerCase().indexOf(low) >= 0; })) return;   // the engine's own repository match
      setTimeout(function () {
        var card = H.card; card.style.display = 'block';
        card.innerHTML = '<button class="cx" aria-label="close">×</button>no key, period or repository called <b>' + H.esc(raw.slice(0, 80)) + '</b> on this wafer'
          + '<a class="ky-st" data-ky-st="sub" href="' + H.esc(link({ sub: raw })) + '">find ' + H.esc(raw.slice(0, 80)) + ' in See Through</a>';
      }, 0);
    });
  }

  // ------------------------------------------------------------------ SECTION 4: the way back by key (5.8, read side)
  // See Through's patched folder links home as ../../editions/#key=<k> (handoff/05-see-through/see-through-hash-reader.patch).
  // Step 6's KY.link (module "file") owns the grammar; this reader runs only when that module was not admitted.
  function readHash() {
    var h = (location.hash || '').replace(/^#/, ''), f = {};
    h.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) { try { f[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) {} } });
    return f;
  }
  function wayBack() {
    if (KY.modules && (KY.modules.file || KY.modules.link)) { st.linkRead = 'file'; return; }
    var f = readHash(); if (!f.key || !/^\d{1,15}$/.test(f.key)) { st.linkRead = 'none'; return; }
    var k = +f.key, note = '';
    if (f.space && /^\d{1,15}$/.test(f.space) && +f.space !== st.wafer) {
      var r = remap(k, +f.space);
      if (r) { note = 'STAR KEY REMAPPED · SKY ' + H.fmt(+f.space) + ' → ' + H.fmt(st.wafer); k = r.key; }
    }
    if (!(k < st.wafer)) { st.linkRead = 'beyond'; st.note = 'KEY ' + H.fmt(k) + ' IS BEYOND THIS WAFER (SPACE ' + H.fmt(st.wafer) + ')'; H.hud.textContent += '\n' + st.note; return; }
    var p = H.keyPlace(k); st.ring = p; st.linkRead = 'key'; st.linkKey = k; st.note = note;
    H.goKey(k);
    if (note) H.card.insertAdjacentHTML('afterbegin', '<div class="ky-st-note">' + H.esc(note) + '</div>');
  }

  // ------------------------------------------------------------------ install
  function inspect() {
    var a = st.a, r = a ? a.getBoundingClientRect() : null;
    return { id: ID, generation: GEN, form: st.form, parent: a && a.parentNode ? (a.parentNode.id || a.parentNode.className) : null,
      entry: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null, href: a ? a.getAttribute('href') : null,
      layer: { status: st.status, why: st.why, row: H ? row() : '', placed: st.placed, total: st.total, space: st.space, wafer: st.wafer, inView: st.inView || 0, on: layerOn() },
      mounted: st.mounted || null, linkRead: st.linkRead, linkKey: st.linkKey, note: st.note || '', rowsAdded: st.rowsAdded, starTap: st.starTap, errors: st.errors.slice() };
  }
  function install(ky) {
    KY = ky; H = ky.hooks;
    mountEntry(); mountAbout();
    ky.draw.add(drawStars, 50);
    mountCardRows(); mountFindFallback(); mountTap();
    H.wafer.then(function (w) {
      st.wafer = (w && w.SPACE) || H.SPACE;
      return loadLayer();
    }).then(function () { wayBack(); }, function (e) { setState('FAIL', 'the wafer refused: ' + (e && e.message || e)); });
    return { link: link, starKey: starKey, remap: remap, inspect: inspect, readHash: readHash };
  }

  if (window.KY && typeof window.KY.register === 'function') {
    window.KY.register({ schema: 'kuiper.module.v1', id: ID, generation: GEN,
      requires: ['wafer', 'keyPlace', 'address', 'describe', 'goKey', 'fmt', 'esc', 'cv', 'ov', 'o2', 'hud', 'card', 'gin',
                 'repos', 'SPACE', 'cam', 'sel', 'redraw', 'draw'],
      provides: ['see-through'], install: install, inspect: inspect });
  }
})();
