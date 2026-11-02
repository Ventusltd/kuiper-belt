#!/usr/bin/env node
// test.cjs — Opus team 1, roadmap step 1 "the shell contract": acceptance A1–A9, measured, never estimated.
//
//   node test.cjs [--port 8412] [--ga-port 8512] [--out DIR] [--write] [--module FILE] [--html FILE]
//                 [--devices "Pixel 7,Galaxy S24,Pixel 7 landscape,360x740"] [--extra] [--no-ga] [--no-a8] [--loader] [--also-loader]
//
// What it does, in the form of FIXES/NL-009/android-journey.cjs (Playwright Chromium, SwiftShader flags, real touch:
// page.touchscreen.tap for every tap, the keyboard only for Escape):
//   * serves the kuiper-belt root on --port (the tester's port 8412) and /home/user/estate/gridatlas on --ga-port
//     (port + 100) with `python3 -m http.server`, unless something already answers there;
//   * A9 first, per device: opens GridAtlas /atlas/ with the CDN stubbed exactly as team 1 measured it
//     (FIXES/NL-010/team-1/STEPS.md:20-29: maplibre-gl@3.6.2 answered from kuiper-belt see-through/202610050513/vendor/,
//     the Carto style answered as an empty style with one background layer, every other external request aborted)
//     and measures #gridatlas-menu-bar;
//   * then the same measurements on the Kuiper edition for #kuiper-menu-bar, compared number to number;
//   * A8 (the admission rule) on Pixel 7 with #keys removed after the engine has run;
//   * writes report.json, the four images and TEST.md (with --write, into this folder's img/ and TEST.md).
// Devices: Pixel 7 (412x839), Galaxy S24 (360x780), Pixel 7 landscape (863x360), 360x740 (Pixel 7 at 360x740);
// --extra adds Pixel 7 at 393 and 430 px and a 1280x800 desktop (no touch), as ROADMAP step 1 lists them.
//
// How the module reaches the page (reported as `mode` in TEST.md):
//   page          index.html or modules.json already names *-kuiper-shell.js (team 10's script tag / manifest)
//   inject        neither does yet: the test serves index.html with one `<script defer src="modules/<file>">` before
//                 </body>, standing in for the one script tag team 1 may add (ROADMAP "The ten Opus teams", row 1)
//   --html FILE   serve FILE in place of index.html (for a loader-patched copy before team 10 lands it)
//   --loader      loader-preview: team 4's handoff/04-loader/index.html.patch applied to a copy and modules.json served as
//                 team 4's manifest plus a kuiper-shell record (sha256, bytes, requires read from the module's KY.register)
//   --also-loader after the inject run of Pixel 7 and Galaxy S24, the same device again in loader-preview (extra columns)
//
// Exit 0 when every assertion on every device passed (the hand-off may go), 1 otherwise, 2 on a harness error.
// Element ids, classes and probes the test relies on (C1–C10 of team-1/STEPS.md:115-199):
//   nav#kuiper-menu-bar · .gm-side-left / .gm-brand-slot / .gm-side-right · button.gm-title (six) · optional star entry
//   a.gm-title[href*="see-through"] · .hud-header > .ventus-brand > .ventus-main + .ventus-sub · .gm-panel (one open)
//   #kuiper-menu-bar-failure[role=alert] · state {schema:'kuiper.menu-bar.v1', installed, failure, controls_moved,
//   panel_counts} at window.__KUIPER_MODULES__.menuBar, or the inspect() of the KY.modules entry whose state carries
//   that schema · Edition 4's #c #o #goto #card #keys #top #hud #foot #lines #bar.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

// ------------------------------------------------------------------ arguments and paths
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : null; };
const HERE = __dirname;                                             // editions/<stamp>/handoff/01-shell
const EDITION_DIR = path.resolve(HERE, '..', '..');
const STAMP = path.basename(EDITION_DIR);
const ROOT = path.resolve(EDITION_DIR, '..', '..');                // kuiper-belt root
const GA_ROOT = String(flag('--ga-root') || '/home/user/estate/gridatlas');
const VENDOR = path.join(ROOT, 'see-through/202610050513/vendor/');
const PORT = +(flag('--port') || 8412), GA_PORT = +(flag('--ga-port') || PORT + 100);
const OUT = path.resolve(String(flag('--out') || '/tmp/nl010-opus/team-1/tester/run'));
const WRITE = !!flag('--write');
const IMG_DIR = WRITE ? path.join(HERE, 'img') : path.join(OUT, 'img');
const KURL = `http://127.0.0.1:${PORT}/editions/${STAMP}/`;
const GAURL = `http://127.0.0.1:${GA_PORT}/atlas/`;
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const SETTLE = 7000, INSTALL_MAX = 60000, MARGIN = 10;
// the star entry may be a bar title only from this width (lead's measurement, FINDING issue #10 comment 6564447092: a ~74 px title
// fits the left side beside a centred 77.6 px brand only at W >= 433.2 px; team 1's 381 px counted the total, not the side)
const STAR_MIN = 434;
const SIX = ['FILE', 'EDIT', 'VIEW', 'SCOPE', 'WAFER', 'ABOUT'];
const GA_SIX = ['FILE', 'EDIT', 'VIEW', 'SCOPE', 'GRID', 'ABOUT'];
// GridAtlas's measured values, team-1/STEPS.md:39-82 (gridatlas@5ec7f62, served and measured 1 Nov 2026):
// bar 34 px at max-width:700px else 36 (menu-bar.js:166, :372); .ventus-main 11/14 px 800 #fff; .ventus-sub 4.5/5.5 px #888
// (:195-205, :374-378); .ventus-brand 73.6x16.3 on Pixel 7 and at 360 px, 90.0x20.5 at 1280x800 and in landscape.
const REF = (vw) => vw <= 700
  ? { barH: 34, mainFs: '11px', subFs: '4.5px', brandW: 73.6, brandH: 16.3, titleFs: '9px' }
  : { barH: 36, mainFs: '14px', subFs: '5.5px', brandW: 90.0, brandH: 20.5, titleFs: '11px' };
const DEVICE_SETS = {
  'Pixel 7': () => ({ ...devices['Pixel 7'] }),
  'Galaxy S24': () => ({ ...devices['Galaxy S24'] }),
  'Pixel 7 landscape': () => ({ ...devices['Pixel 7 landscape'] }),
  '360x740': () => ({ ...devices['Pixel 7'], viewport: { width: 360, height: 740 } }),
  'Pixel 7 @393': () => ({ ...devices['Pixel 7'], viewport: { width: 393, height: 851 } }),
  'Pixel 7 @430': () => ({ ...devices['Pixel 7'], viewport: { width: 430, height: 932 } }),
  '1280x800': () => ({ viewport: { width: 1280, height: 800 } }),
};
let DEVICES = ['Pixel 7', 'Galaxy S24', 'Pixel 7 landscape', '360x740'];
if (flag('--extra')) DEVICES = DEVICES.concat(['Pixel 7 @393', 'Pixel 7 @430', '1280x800']);
if (flag('--devices')) DEVICES = String(flag('--devices')).split(',').map(s => s.trim()).filter(Boolean);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const sha256 = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const log = (...a) => process.stderr.write(a.join(' ') + '\n');

// ------------------------------------------------------------------ the module under test
function findModule() {
  if (flag('--module')) return path.resolve(String(flag('--module')));
  const dir = path.join(EDITION_DIR, 'modules');
  const c = fs.readdirSync(dir).filter(f => /^\d{12}-kuiper-shell\.js$/.test(f)).sort();
  return c.length ? path.join(dir, c[c.length - 1]) : null;
}

// ------------------------------------------------------------------ servers
function answers(url) { return new Promise(res => { const r = http.get(url, x => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(3000, () => { r.destroy(); res(false); }); }); }
const children = [];
async function ensureServer(port, root, probeUrl) {
  if (await answers(probeUrl)) return 'already serving';
  const ch = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
  children.push(ch);
  for (let i = 0; i < 40; i++) { await sleep(250); if (await answers(probeUrl)) return 'started by test.cjs (pid ' + ch.pid + ')'; }
  throw new Error('could not serve ' + root + ' on ' + port);
}
process.on('exit', () => children.forEach(c => { try { c.kill(); } catch (e) {} }));

// ------------------------------------------------------------------ in-page probes (self-contained, run in the page)
function shellProbe(cfg) {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1) }; };
  const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }); };
  const css = (el, ps) => { if (!el) return null; const s = getComputedStyle(el); const o = {}; ps.forEach(p => o[p] = s.getPropertyValue(p)); return o; };
  // the state probe: window.__KUIPER_MODULES__.menuBar, or any registry entry whose state carries the schema
  let state = null;
  const tryState = x => { try { if (!x || typeof x !== 'object') return null; if (x.schema === cfg.schema) return x;
    for (const f of [x.inspect, x.api && x.api.inspect]) if (typeof f === 'function') { const s = f(); if (s && s.schema === cfg.schema) return s; }
    if (x.api && x.api.schema === cfg.schema) return x.api; if (x.state && x.state.schema === cfg.schema) return x.state; } catch (e) { return { probeError: String(e) }; } return null; };
  for (const ns of cfg.ns) { const reg = window[ns]; if (!reg) continue; state = tryState(reg.menuBar) || null;
    if (!state) for (const k of Object.keys(reg)) { const s = tryState(reg[k]); if (s) { state = s; break; } } if (state) break; }
  if (!state && window.KY && window.KY.modules) for (const k of Object.keys(window.KY.modules)) { const s = tryState(window.KY.modules[k]); if (s) { state = s; break; } }
  const st = state ? JSON.parse(JSON.stringify(state, (k, v) => (v instanceof Element ? '[el]' : v))) : null;
  const fail = document.getElementById(cfg.failId);
  const base = { viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio }, coarse: matchMedia('(pointer: coarse)').matches,
    state: st, ky: !!window.KY, failure: fail ? { visible: vis(fail), text: fail.textContent.replace(/\s+/g, ' ').trim().slice(0, 300), role: fail.getAttribute('role') } : null,
    refuse: (() => { const r = document.getElementById('refuse'); return r ? { visible: vis(r), text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) } : null; })() };
  const bar = document.getElementById(cfg.barId);
  if (!bar) return { ...base, bar: null };
  const isStar = t => /see[\s-]*through/i.test(t.textContent) || /see-through/i.test(t.getAttribute('href') || '');
  const titles = [...bar.querySelectorAll('.gm-title')].map((t, i) => { const s = getComputedStyle(t), a = getComputedStyle(t, '::after');
    return { i, tag: t.tagName.toLowerCase(), text: (t.innerText || t.textContent).replace(/\s+/g, ' ').trim(), star: isStar(t), visible: vis(t),
      side: t.closest('.gm-side-left') ? 'left' : t.closest('.gm-side-right') ? 'right' : '?', rect: R(t),
      fontSize: s.fontSize, letterSpacing: s.letterSpacing, padding: s.padding, color: s.color, fontFamily: s.fontFamily, textTransform: s.textTransform,
      haspopup: t.getAttribute('aria-haspopup'), expanded: t.getAttribute('aria-expanded'), controls: t.getAttribute('aria-controls'), href: t.getAttribute('href'),
      after: { content: a.content, display: a.display, position: a.position, height: a.height, bottom: a.bottom } }; });
  const q = s => bar.querySelector(s);
  const vb = q('.ventus-brand'), vm = q('.ventus-main'), vs = q('.ventus-sub');
  const panels = [...document.querySelectorAll('.gm-panel')].filter(p => bar.contains(p) || (p.id || '').startsWith(cfg.barId)).map(p => ({ id: p.id, visible: vis(p), rect: vis(p) ? R(p) : null, position: getComputedStyle(p).position, labelledby: p.getAttribute('aria-labelledby') }));
  return { ...base,
    bar: R(bar), barCss: css(bar, ['position', 'height', 'background-color', 'border-bottom', 'backdrop-filter', 'font-family', 'font-size', 'z-index', 'overflow-x']), ariaLabel: bar.getAttribute('aria-label'), tag: bar.tagName.toLowerCase(),
    scroll: { scrollWidth: bar.scrollWidth, clientWidth: bar.clientWidth },
    sideLeft: R(q('.gm-side-left')), slot: R(q('.gm-brand-slot')), sideRight: R(q('.gm-side-right')),
    hudHeader: R(q('.hud-header')), hudChildren: q('.hud-header') ? [...q('.hud-header').children].map(c => ({ cls: c.className, display: getComputedStyle(c).display, rect: R(c) })) : null,
    brand: R(vb), brandIsLink: vm ? !!vm.closest('a') : null, brandOnClick: vb ? !!(vb.onclick || (vb.parentElement && vb.parentElement.onclick)) : null,
    main: vm ? { text: vm.textContent, rect: R(vm), style: css(vm, ['font-size', 'font-weight', 'letter-spacing', 'text-transform', 'color', 'line-height', 'font-family']) } : null,
    sub: vs ? { text: vs.textContent, rect: R(vs), style: css(vs, ['font-size', 'font-weight', 'letter-spacing', 'text-transform', 'color', 'line-height']) } : null,
    titles, panels, openPanels: panels.filter(p => p.visible).map(p => p.id) };
}
// the rows of one panel: every interactive row, outermost only
function panelRows(panelId) {
  const p = document.getElementById(panelId); if (!p) return null;
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }); };
  const SEL = 'button, a[href], a[role], label, input:not([type=hidden]), select, textarea, [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=button], [role=option], .gm-row, .ln[data-i]';
  // a link inside a sentence (display:inline, in running text) is prose, not a command row: WCAG 2.5.8's inline exception
  const inlineInProse = el => el.tagName === 'A' && !el.classList.contains('gm-row') && getComputedStyle(el).display === 'inline';
  const all = [...p.querySelectorAll(SEL)].filter(vis).filter(el => !inlineInProse(el));
  const outer = all.filter(el => { let a = el.parentElement; while (a && a !== p) { if (all.includes(a)) return false; a = a.parentElement; } return true; });
  return outer.map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 48), h: +r.height.toFixed(1), w: +r.width.toFixed(1), x: +r.x.toFixed(1), y: +r.y.toFixed(1), dataK: el.getAttribute('data-k') }; });
}
// A4: what is drawn over the wafer at rest, outside the bar
function restScan(cfg) {
  const bar = document.getElementById(cfg.barId); const bb = bar ? bar.getBoundingClientRect().bottom : 0;
  const W = innerWidth, H = innerHeight;
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }); };
  const allowSel = ['#c', '#o', '#goto', '[data-kuiper-find]', '.kuiper-find', '#card', 'a[href*="see-through"]', '[data-star-slot]'];
  const allowed = allowSel.flatMap(s => [...document.querySelectorAll(s)]).filter(el => !(bar && bar.contains(el)) && vis(el));
  const name = el => el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const off = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|LINK|META|TEMPLATE|NOSCRIPT|BR)$/.test(el.tagName)) continue;
    if (bar && (bar === el || bar.contains(el))) continue;
    if (allowed.some(a => a === el || a.contains(el))) continue;
    if (allowed.some(a => el.contains(a)) || (bar && el.contains(bar))) continue;   // a wrapper of an allowed node
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect(); if (r.bottom <= bb + 0.5 || r.top >= H || r.right <= 0 || r.left >= W) continue;
    off.push({ el: name(el), rect: [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)], text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) });
  }
  const named = Object.fromEntries(['#keys', '#top', '#hud', '#foot', '#lines', '#bar'].map(s => { const el = document.querySelector(s); return [s, el ? (vis(el) ? 'VISIBLE' : 'hidden') : 'absent']; }));
  const g = document.querySelector('[data-kuiper-find]') || document.getElementById('goto');
  const gr = g && vis(g) ? g.getBoundingClientRect() : null;
  return { barBottom: +bb.toFixed(1), offenders: off.slice(0, 30), offenderCount: off.length, named, allowedVisible: allowed.map(name),
    find: gr ? { x: +gr.x.toFixed(1), y: +gr.y.toFixed(1), w: +gr.width.toFixed(1), h: +gr.height.toFixed(1), right: +gr.right.toFixed(1) } : null };
}
// the overlay: the selected spark is magenta on #o (Edition 4; android-journey.cjs probeFn)
function sparkProbe(barId) {
  const ov = document.getElementById('o'), card = document.getElementById('card'), bar = document.getElementById(barId) || document.getElementById('bar');
  let magenta = null;
  try { const ctx = ov.getContext('2d'), W = ov.width, H = ov.height, d = ctx.getImageData(0, 0, W, H).data; const sx = W / innerWidth, sy = H / innerHeight;
    let ax = 0, ay = 0, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i + 3] < 60) continue; if (d[i] > 180 && d[i + 1] < 110 && d[i + 2] > 140) { ax += x; ay += y; n++; } }
    if (n) magenta = { x: +(ax / n / sx).toFixed(1), y: +(ay / n / sy).toFixed(1), px: n };
  } catch (e) { magenta = { error: String(e) }; }
  const cs = card ? getComputedStyle(card) : null, open = !!card && cs.display !== 'none' && card.getBoundingClientRect().height > 0;
  const r = open ? card.getBoundingClientRect() : null;
  return { magenta, card: open ? { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), text: card.textContent.replace(/\s+/g, ' ').slice(0, 100) } : null,
    barBottom: bar ? +bar.getBoundingClientRect().bottom.toFixed(1) : null, frames: window.__fr || 0 };
}

// ------------------------------------------------------------------ one context
async function openPage(browser, devName, kind, opts = {}) {
  const ctx = await browser.newContext({ ...DEVICE_SETS[devName](), locale: 'en-GB' });
  const page = await ctx.newPage(); page.setDefaultTimeout(180000);
  await page.addInitScript(() => { let n = 0; const f = () => { n++; window.__fr = n; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const errors = [], sandboxNet = [];
  const local = u => /^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u || '');
  page.on('console', m => { if (m.type() !== 'error') return; const loc = (m.location() || {}).url || '';
    if (/^Failed to load resource/.test(m.text()) && loc && !local(loc)) sandboxNet.push(loc.slice(0, 160)); else errors.push({ kind: 'console', text: m.text().slice(0, 300), at: loc.slice(0, 160) }); });
  page.on('pageerror', e => errors.push({ kind: 'pageerror', text: String(e.message || e).slice(0, 300) }));
  page.on('requestfailed', r => { const f = r.failure(), u = r.url(); if (!f || /ERR_ABORTED|blockedbyclient|ERR_BLOCKED_BY_CLIENT/i.test(f.errorText)) return;
    if (local(u)) errors.push({ kind: 'request', text: u.slice(0, 200) + ' ' + f.errorText }); else sandboxNet.push(u.slice(0, 160) + ' ' + f.errorText); });
  if (kind === 'ga') await page.route('**/*', async (route) => {
    const u = route.request().url();
    if (u.startsWith(`http://127.0.0.1:${GA_PORT}/`)) return route.continue();
    if (u.includes('maplibre-gl@3.6.2/dist/maplibre-gl.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(VENDOR + 'maplibre-gl.js') });
    if (u.includes('maplibre-gl@3.6.2/dist/maplibre-gl.css')) return route.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(VENDOR + 'maplibre-gl.css') });
    if (u.includes('basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: 8, name: 'stub-dark', sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b0e14' } }] }) });
    return route.abort('blockedbyclient');
  });
  if (kind === 'kuiper' && opts.rewrite) await page.route(KURL + '{,index.html}', async (route) => {
    let html;
    if (opts.htmlFile) html = fs.readFileSync(opts.htmlFile, 'utf8');
    else { const resp = await route.fetch(); html = await resp.text(); }
    html = opts.rewrite(html);
    return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
  });
  // the module is served from the bytes read when the run started, so every device tests the one sha256 TEST.md names,
  // even while the lead and the builder keep editing the file
  if (kind === 'kuiper' && SNAPSHOT) await page.route(KURL + 'modules/' + SNAPSHOT.name, route => route.fulfill({ status: 200, contentType: 'application/javascript', headers: { 'cache-control': 'no-store' }, body: SNAPSHOT.bytes }));
  if (kind === 'kuiper' && opts.manifest) await page.route(KURL + 'modules.json', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'cache-control': 'no-store' }, body: opts.manifest }));
  return { ctx, page, errors, sandboxNet };
}
async function until(page, fn, arg, ms = 5000, every = 150) { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { v = await page.evaluate(fn, arg); if (v) return v; await sleep(every); } return v; }
async function shot(page, file, clip) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  for (let a = 0; a < 2; a++) { try { await page.screenshot({ path: file, scale: 'css', timeout: 180000, ...(clip ? { clip } : {}) }); return file; } catch (e) { if (a) return 'FAILED ' + String(e.message || e).split('\n')[0]; } }
}
async function shotB64(page, clip) { try { return (await page.screenshot({ scale: 'css', timeout: 180000, ...(clip ? { clip } : {}) })).toString('base64'); } catch (e) { return null; } }
let SNAPSHOT = null;   // {name, bytes} of the module under test, read once at the start
const KCFG = { barId: 'kuiper-menu-bar', failId: 'kuiper-menu-bar-failure', schema: 'kuiper.menu-bar.v1', ns: ['__KUIPER_MODULES__'] };
const GCFG = { barId: 'gridatlas-menu-bar', failId: 'gridatlas-menu-bar-failure', schema: 'gridatlas.menu-bar.v2', ns: ['__GRIDATLAS_MODULES__'] };

// ------------------------------------------------------------------ A9: GridAtlas, the reference measured live
async function runGA(browser, devName) {
  const { ctx, page, errors, sandboxNet } = await openPage(browser, devName, 'ga');
  let p = null, err = null, strip = null;
  try {
    await page.goto(GAURL, { waitUntil: 'load', timeout: 120000 });
    await until(page, () => { const s = window.__GRIDATLAS_MODULES__ && window.__GRIDATLAS_MODULES__.menuBar; return !!(s && s.installed); }, null, INSTALL_MAX, 1000);
    await sleep(2500);
    p = await page.evaluate(shellProbe, GCFG);
    const st = await page.evaluate(() => { const s = (window.__GRIDATLAS_MODULES__ || {}).menuBar; return s ? { schema: s.schema, installed: s.installed, failure: s.failure, controls_moved: s.controls_moved, panel_counts: s.panel_counts } : null; });
    p.state = st;
    strip = await shotB64(page, { x: 0, y: 0, width: p.viewport.w, height: 50 });
  } catch (e) { err = String(e.message || e).split('\n')[0]; }
  await ctx.close();
  return { device: devName, url: GAURL, probe: p, error: err, errors, sandboxNet, strip };
}

// ------------------------------------------------------------------ the Kuiper run on one device
async function runKuiper(browser, devName, mod, ga, label) {
  label = label || devName; const touch = !!DEVICE_SETS[devName]().hasTouch;
  const A = {};   // id -> {pass, measured, note}
  const rec = (id, pass, measured, note) => { A[id] = { pass: !!pass, measured, note: note || '' }; log(`[${label}] ${pass ? 'PASS' : 'FAIL'} ${id}${note ? ' — ' + note : ''}`); };
  const imgs = {};
  const { ctx, page, errors, sandboxNet } = await openPage(browser, devName, 'kuiper', mod.pageOpts);
  const tap = (x, y) => touch ? page.touchscreen.tap(Math.round(x), Math.round(y)) : page.mouse.click(Math.round(x), Math.round(y));   // real touch on every phone; the 1280x800 desktop has no touch screen
  const tapR = r => tap(r.x + r.w / 2, r.y + r.h / 2);
  try {
    await page.goto(KURL, { waitUntil: 'load', timeout: 120000 });
    const t0 = Date.now();
    await until(page, (cfg) => { const b = document.getElementById(cfg.barId); const f = document.getElementById(cfg.failId); return !!(b && b.querySelector('.gm-title')) || !!f; }, KCFG, INSTALL_MAX, 500);
    await sleep(SETTLE);
    let p = await page.evaluate(shellProbe, KCFG);
    const vw = p.viewport.w, ref = REF(vw), gp = ga && ga.probe && ga.probe.bar ? ga.probe : null;
    const installMs = Date.now() - t0 - SETTLE;

    // A1 the bar
    {
      const b = p.bar, st = p.state || {};
      const ok = !!b && near(b.x, 0, 0.5) && near(b.y, 0, 0.5) && near(b.w, vw, 0.5) && near(b.h, ref.barH, 0.5) && st.installed === true && (st.failure === null || st.failure === undefined) && st.schema === 'kuiper.menu-bar.v1' && !(p.failure && p.failure.visible);
      rec('A1', ok, { rect: b, expectH: ref.barH, gaH: gp ? gp.bar.h : null, tag: p.tag, ariaLabel: p.ariaLabel, position: p.barCss && p.barCss.position, state: st && { schema: st.schema, installed: st.installed, failure: st.failure, controls_moved: st.controls_moved, panel_counts: st.panel_counts }, ky: p.ky, failureStrip: p.failure, refuse: p.refuse, waitedMs: installMs },
        !b ? 'no #kuiper-menu-bar in the page' + (p.failure ? ' — failure strip: ' + p.failure.text : '') + (p.ky ? '' : ' — window.KY absent') : (st.installed !== true ? 'state.installed is ' + JSON.stringify(st.installed) : ''));
    }
    // A2 one row, the six names, no horizontal scroll
    let six = [];
    {
      const ts = p.titles || [], nonStar = ts.filter(t => !t.star), star = ts.find(t => t.star) || null; six = nonStar;
      const names = nonStar.map(t => t.text.toUpperCase());
      const ys = new Set(ts.filter(t => t.visible).map(t => Math.round(t.rect.y)));
      const sides = nonStar.map(t => t.side).join(',');
      const brandInBar = p.brand && p.bar && p.brand.y >= p.bar.y - 0.5 && p.brand.bottom <= p.bar.bottom + 0.5;
      const titlesInBar = ts.every(t => !t.visible || (t.rect.y >= p.bar.y - 0.5 && t.rect.bottom <= p.bar.bottom + 0.5));
      const lastRight = ts.length ? Math.max(...ts.map(t => t.rect.right)) : null;
      const noScroll = p.scroll && p.scroll.scrollWidth === p.scroll.clientWidth;
      const starOk = !star || (vw >= STAR_MIN ? (star.side === 'left' && ts.indexOf(star) < ts.findIndex(t => t.text.toUpperCase() === 'FILE')) : false);
      const ok = !!p.bar && JSON.stringify(names) === JSON.stringify(SIX) && sides === 'left,left,left,right,right,right' && ys.size === 1 && brandInBar && titlesInBar && lastRight <= vw + 0.5 && noScroll && starOk
        && nonStar.every(t => t.tag === 'button' && t.haspopup === 'menu' && t.controls && t.expanded === 'false');
      rec('A2', ok, { names, sides, rowsY: [...ys], titleRects: ts.map(t => [t.text, t.rect && t.rect.x, t.rect && t.rect.w]), titleSum: +nonStar.reduce((s, t) => s + (t.rect ? t.rect.w : 0), 0).toFixed(1), slot: p.slot, slack: p.bar && p.slot ? +(vw - nonStar.reduce((s, t) => s + t.rect.w, 0) - p.slot.w - (star ? star.rect.w : 0)).toFixed(1) : null, lastRight, scroll: p.scroll, star: star && { text: star.text, side: star.side, rect: star.rect, href: star.href }, aria: nonStar.map(t => [t.tag, t.haspopup, t.expanded, t.controls]), titleFont: nonStar[0] && [nonStar[0].fontSize, nonStar[0].letterSpacing, nonStar[0].padding, nonStar[0].color] },
        JSON.stringify(names) !== JSON.stringify(SIX) ? 'names ' + names.join(' ') : ys.size !== 1 ? 'titles on ' + ys.size + ' rows' : !noScroll ? 'bar scrolls horizontally' : !starOk ? 'star entry violates the width rule' : '');
    }
    // A3 the wordmark
    {
      const m = p.main, s = p.sub, b = p.brand;
      const ms = m && m.style, ss = s && s.style;
      const cx = b ? b.x + b.w / 2 : null, cy = b ? b.y + b.h / 2 : null, barCy = p.bar ? p.bar.y + p.bar.h / 2 : null;
      const gb = gp && gp.brand ? gp.brand : null;
      const checks = {
        mainText: m && /^ventus$/i.test(m.text.trim()), subText: s && /cables\s*&\s*connectivity®/i.test(s.text),
        mainSize: ms && ms['font-size'] === ref.mainFs, mainWeight: ms && ms['font-weight'] === '800', mainColour: ms && ms.color === 'rgb(255, 255, 255)', mainUpper: ms && ms['text-transform'] === 'uppercase',
        subSize: ss && ss['font-size'] === ref.subFs, subColour: ss && ss.color === 'rgb(136, 136, 136)', subUpper: ss && ss['text-transform'] === 'uppercase',
        // centred within 1 px, or (with the desktop flanks, where GridAtlas's own wordmark sits off centre) at GridAtlas's offset within 1 px
        centreX: near(cx, vw / 2, 1) || !!(gb && gp.bar && near(cx - vw / 2, (gb.x + gb.w / 2) - (gp.bar.x + gp.bar.w / 2), 1)), centreY: near(cy, barCy, 1), slotCentred: !!(p.slot && near(p.slot.x + p.slot.w / 2, vw / 2, 1)), notLink: p.brandIsLink === false && p.brandOnClick === false,
        boxVsTable: b && near(b.w, ref.brandW, 1) && near(b.h, ref.brandH, 1),
        boxVsGridAtlasLive: !!(b && gb && near(b.w, gb.w, 1) && near(b.h, gb.h, 1)),
      };
      const ok = Object.values(checks).every(Boolean);
      rec('A3', ok, { brand: b, table: [ref.brandW, ref.brandH], gridatlasLive: gb ? [gb.w, gb.h] : null, centre: [cx && +cx.toFixed(2), cy && +cy.toFixed(2)], viewportCentre: vw / 2, barCentreY: barCy, main: m, sub: s, checks },
        ok ? '' : 'failed: ' + Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', ') + (gb ? '' : ' (GridAtlas live box unavailable)'));
    }
    // A4 at rest nothing over the wafer but the bar, the canvases, the find box (and the star chip at <=380 px)
    {
      const r = await page.evaluate(restScan, KCFG);
      const namedOk = ['#keys', '#top', '#hud', '#foot', '#lines', '#bar'].every(k => r.named[k] !== 'VISIBLE');
      const findOk = !r.find || (near(r.find.y, r.barBottom + 36, 1) && r.find.right <= vw + 0.5 && (!p.coarse || r.find.h >= 44 - 0.5));
      const ok = !!p.bar && r.offenderCount === 0 && namedOk && findOk && (p.openPanels || []).length === 0;
      rec('A4', ok, { ...r, openAtRest: p.openPanels, findExpectTop: r.barBottom + 36 }, ok ? '' : (r.offenderCount ? r.offenderCount + ' element(s) over the wafer: ' + r.offenders.slice(0, 4).map(o => o.el).join(' ') : '') + (namedOk ? '' : ' named still visible: ' + Object.entries(r.named).filter(([, v]) => v === 'VISIBLE').map(([k]) => k).join(' ')) + (findOk ? '' : ' find box misplaced ' + JSON.stringify(r.find)));
    }
    if (!fs.existsSync(path.join(OUT, slug(label)))) fs.mkdirSync(path.join(OUT, slug(label)), { recursive: true });
    imgs.rest = await shot(page, path.join(OUT, slug(label), '01-rest.png'));
    imgs.strip = await shotB64(page, { x: 0, y: 0, width: vw, height: 50 });

    // A6 (closed): the 44 px hit box below the bar on a coarse pointer
    const a6 = { coarse: p.coarse, closed: [], open: null };
    if (p.bar && six.length) for (const t of six) { const x = t.rect.x + t.rect.w / 2;
      const hit = await page.evaluate(({ x, i }) => { const el = document.elementFromPoint(x, 40); const t = document.querySelectorAll('#kuiper-menu-bar .gm-title')[i]; return { hitsTitle: !!(el && t && (el === t || t.contains(el))), el: el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]) : null }; }, { x, i: t.i });
      a6.closed.push({ t: t.text, x: +x.toFixed(1), ...hit }); }

    // A5 every title: tap opens exactly one panel under the bar, second tap / Escape / back close it; rows >= 44 px
    const a5 = { titles: [], rowsUnder44: [], rowCount: 0, wafer: null, next: null };
    const openState = () => page.evaluate((cfg) => { const bar = document.getElementById(cfg.barId); const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }); };
      const ps = [...document.querySelectorAll('.gm-panel')].filter(p => bar.contains(p) || (p.id || '').startsWith(cfg.barId)).filter(vis);
      return { open: ps.map(p => { const r = p.getBoundingClientRect(); return { id: p.id, top: +r.top.toFixed(1), right: +r.right.toFixed(1), left: +r.left.toFixed(1), bottom: +r.bottom.toFixed(1), position: getComputedStyle(p).position }; }), barBottom: +bar.getBoundingClientRect().bottom.toFixed(1), histLen: history.length, href: location.href, marker: window.__tester_marker === 1,
        expanded: [...bar.querySelectorAll('.gm-title')].map(t => t.getAttribute('aria-expanded')) }; }, KCFG);
    const titleRect = i => page.evaluate(i => { const r = document.querySelectorAll('#kuiper-menu-bar .gm-title')[i].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, i);
    const waitOpen = (n) => until(page, ({ cfg, n }) => { const bar = document.getElementById(cfg.barId); const ps = [...document.querySelectorAll('.gm-panel')].filter(p => (bar.contains(p) || (p.id || '').startsWith(cfg.barId)) && p.getBoundingClientRect().height > 0 && p.checkVisibility({ visibilityProperty: true, opacityProperty: true })); return ps.length === n; }, { cfg: KCFG, n }, 4000);
    if (p.bar && six.length) {
      await page.evaluate(() => { window.__tester_marker = 1; });
      for (const t of six) {
        const r = { t: t.text };
        await tapR(await titleRect(t.i)); await waitOpen(1); let s = await openState();
        r.open1 = s.open.length; r.panel = s.open[0] || null; r.expanded = s.expanded[t.i];
        r.underBar = !!r.panel && r.panel.top >= s.barBottom - 0.5; r.inside = !!r.panel && r.panel.right <= vw + 0.5 && r.panel.left >= -0.5;
        if (r.panel) { const rows = await page.evaluate(panelRows, r.panel.id); r.rows = rows.length; a5.rowCount += rows.length; rows.filter(x => x.h < 44 - 0.05).forEach(x => a5.rowsUnder44.push({ panel: t.text, ...x }));
          if (t.text.toUpperCase() === 'VIEW' || (!a5.viewShot && t === six[0])) { const f = await shot(page, path.join(OUT, slug(label), `02-panel-${slug(t.text)}.png`)); if (t.text.toUpperCase() === 'VIEW') { imgs.view = f; a5.viewShot = true; } else imgs.firstPanel = f; } }
        await tapR(await titleRect(t.i)); await waitOpen(0); s = await openState(); r.closedBySecondTap = s.open.length === 0;
        await tapR(await titleRect(t.i)); await waitOpen(1);
        await page.keyboard.press('Escape'); await waitOpen(0); s = await openState(); r.closedByEscape = s.open.length === 0;
        await tapR(await titleRect(t.i)); await waitOpen(1); const before = await openState(); r.histBefore = before.histLen;
        try { await page.goBack({ waitUntil: 'commit', timeout: 8000 }); } catch (e) { r.goBackNote = String(e.message || e).split('\n')[0].slice(0, 80); }
        await sleep(600); await waitOpen(0);
        let after; try { after = await openState(); } catch (e) { after = null; }
        r.closedByBack = !!after && after.open.length === 0; r.stayedOnPage = !!after && after.marker && after.href === before.href;
        if (!r.stayedOnPage) {   // back left the page: no history entry was pushed. Restore and carry on, recording the failure.
          try { await page.goto(KURL, { waitUntil: 'load', timeout: 120000 }); await sleep(SETTLE); await page.evaluate(() => { window.__tester_marker = 1; }); } catch (e) {}
        }
        s = await openState(); if (s.open.length) { await page.keyboard.press('Escape'); await waitOpen(0); }
        a5.titles.push(r);
      }
      // a tap on the wafer closes an open panel (C7), at a point outside the panel and the bar
      { await tapR(await titleRect(six[0].i)); await waitOpen(1); const s = await openState(); const pn = s.open[0];
        let pt = null; if (pn) { for (const [x, y] of [[vw / 2, p.viewport.h - 30], [vw - 30, p.viewport.h - 30], [30, p.viewport.h - 120]]) if (y > pn.bottom + 4 || x > pn.right + 4 || x < pn.left - 4) { pt = [x, y]; break; } }
        if (pt) { await tap(pt[0], pt[1]); await waitOpen(0); const s2 = await openState(); a5.wafer = { tappedAt: pt, closed: s2.open.length === 0 }; } else a5.wafer = { tappedAt: null, closed: null, note: 'the open panel covers the wafer; no free point to tap' };
        const s3 = await openState(); if (s3.open.length) { await page.keyboard.press('Escape'); await waitOpen(0); } }
      // A6 (open): with the first panel open, the point 4 px into its first row is that row, not the title above
      { await tapR(await titleRect(six[0].i)); await waitOpen(1); const s = await openState();
        if (s.open[0]) { const rows = await page.evaluate(panelRows, s.open[0].id); const row = rows[0];
          if (row) { const x = Math.min(row.x + row.w / 2, six[0].rect.x + six[0].rect.w / 2 > row.x && six[0].rect.x + six[0].rect.w / 2 < row.x + row.w ? six[0].rect.x + six[0].rect.w / 2 : row.x + row.w / 2);
            a6.open = await page.evaluate(({ x, y, id, i }) => { const el = document.elementFromPoint(x, y); const p = document.getElementById(id); const t = document.querySelectorAll('#kuiper-menu-bar .gm-title')[i];
              return { x, y, el: el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]) : null, inPanel: !!(el && p.contains(el)), isTitle: !!(el && t && (el === t || t.contains(el))) }; }, { x: Math.round(x), y: Math.round(row.y + 4), id: s.open[0].id, i: six[0].i }); }
          else a6.open = { note: 'first panel has no rows' }; }
        await page.keyboard.press('Escape'); await waitOpen(0); }
      // A5 "next verified line": the VIEW row lands the spark between the bar and the card (Edition 4 edFly law)
      { const vi = six.find(t => t.text.toUpperCase() === 'VIEW');
        let found = null;
        for (const t of [vi, ...six.filter(x => x !== vi)].filter(Boolean)) {
          await tapR(await titleRect(t.i)); await waitOpen(1); const s = await openState(); if (!s.open[0]) continue;
          const rows = await page.evaluate(panelRows, s.open[0].id); const row = rows.find(x => /next verified line/i.test(x.text) || x.dataK === 'e');
          if (row) { found = { panel: t.text, row }; await tap(row.x + row.w / 2, row.y + row.h / 2); break; }
          await page.keyboard.press('Escape'); await waitOpen(0);
        }
        if (found) {
          let sp = null, last = null; const tS = Date.now();
          while (Date.now() - tS < 90000) { await sleep(400); sp = await page.evaluate(sparkProbe, KCFG.barId);
            if (sp.magenta && sp.magenta.x != null && sp.card) { if (last && Math.hypot(sp.magenta.x - last.x, sp.magenta.y - last.y) < 0.6 && sp.frames - last.frames >= 2) break; last = { ...sp.magenta, frames: sp.frames }; } }
          await sleep(1500); sp = await page.evaluate(sparkProbe, KCFG.barId); const s = await openState();
          const between = !!(sp.magenta && sp.magenta.x != null && sp.card && sp.magenta.y >= sp.barBottom + MARGIN && sp.magenta.y <= sp.card.top - MARGIN && sp.magenta.x >= MARGIN && sp.magenta.x <= vw - MARGIN);
          a5.next = { found, spark: sp.magenta, card: sp.card, barBottom: sp.barBottom, between, panelsOpenAfter: s.open.length };
          imgs.next = await shot(page, path.join(OUT, slug(label), '03-next-line.png'));
          if (s.open.length) { await page.keyboard.press('Escape'); await waitOpen(0); }
        } else a5.next = { found: null, between: false, note: 'no row "next verified line" (data-k="e") in any panel' };
      }
    }
    {
      const ts = a5.titles;
      const ok = ts.length === 6 && ts.every(r => r.open1 === 1 && r.underBar && r.inside && r.expanded === 'true' && r.closedBySecondTap && r.closedByEscape && r.closedByBack && r.stayedOnPage)
        && a5.rowsUnder44.length === 0 && a5.rowCount > 0 && a5.next && a5.next.between && (!a5.wafer || a5.wafer.closed !== false);
      const why = [];
      ts.forEach(r => { const f = ['open1', 'underBar', 'inside', 'closedBySecondTap', 'closedByEscape', 'closedByBack', 'stayedOnPage'].filter(k => k === 'open1' ? r.open1 !== 1 : !r[k]); if (r.expanded !== 'true') f.push('aria-expanded'); if (f.length) why.push(r.t + ': ' + f.join('/')); });
      if (a5.rowsUnder44.length) why.push(a5.rowsUnder44.length + ' row(s) under 44 px');
      if (!a5.rowCount) why.push('no panel rows');
      if (!a5.next || !a5.next.between) why.push('next verified line: ' + (a5.next && a5.next.found ? 'spark not between bar and card' : 'row not found'));
      if (a5.wafer && a5.wafer.closed === false) why.push('wafer tap did not close');
      if (ts.length !== 6) why.push(ts.length + ' titles exercised');
      rec('A5', ok, a5, why.join('; '));
    }
    {
      const closedOk = a6.closed.length === 6 && a6.closed.every(c => c.hitsTitle);
      const openOk = !!(a6.open && a6.open.inPanel && !a6.open.isTitle);
      const ok = p.coarse ? closedOk && openOk : openOk;
      rec('A6', ok, a6, ok ? '' : (!p.coarse ? 'pointer not coarse; ' : '') + (closedOk ? '' : 'closed: ' + a6.closed.filter(c => !c.hitsTitle).map(c => c.t + '→' + c.el).join(' ')) + (openOk ? '' : ' open: ' + JSON.stringify(a6.open)));
    }
    // A2b: a 1.3x system font scale on the titles and the wordmark (01-bar's method) — one row still; scroll reaches the last title
    if (devName === '360x740' && p.bar && six.length) {
      await page.evaluate(() => { const bar = document.getElementById('kuiper-menu-bar');
        for (const el of bar.querySelectorAll('.gm-title, .ventus-main, .ventus-sub')) el.style.setProperty('font-size', (parseFloat(getComputedStyle(el).fontSize) * 1.3).toFixed(2) + 'px', 'important'); });
      await sleep(300);                                            // a real font-scale change relayouts before the next frame; let it
      const r = await page.evaluate(() => { const bar = document.getElementById('kuiper-menu-bar');
        const ts = [...bar.querySelectorAll('.gm-title')]; return { rows: new Set(ts.map(t => Math.round(t.getBoundingClientRect().y))).size, barH: +bar.getBoundingClientRect().height.toFixed(1), scrollWidth: bar.scrollWidth, clientWidth: bar.clientWidth, overflowX: getComputedStyle(bar).overflowX }; });
      let reach = null;
      if (r.scrollWidth > r.clientWidth) { const last = six[six.length - 1];
        await page.evaluate(i => document.querySelectorAll('#kuiper-menu-bar .gm-title')[i].scrollIntoView({ inline: 'end', block: 'nearest' }), last.i); await sleep(300);
        const tr = await titleRect(last.i); reach = { rect: tr, onScreen: tr.x >= 0 && tr.x + tr.w <= p.viewport.w + 0.5 };
        if (reach.onScreen) { await tapR(tr); await waitOpen(1); const s = await openState(); reach.opened = s.open.length === 1; if (s.open.length) { await page.keyboard.press('Escape'); await waitOpen(0); } } }
      await page.evaluate(() => { for (const el of document.querySelectorAll('#kuiper-menu-bar .gm-title, #kuiper-menu-bar .ventus-main, #kuiper-menu-bar .ventus-sub')) el.style.removeProperty('font-size'); });
      const ok = r.rows === 1 && near(r.barH, REF(p.viewport.w).barH, 0.5) && (r.scrollWidth <= r.clientWidth || (/(auto|scroll)/.test(r.overflowX) && reach && reach.onScreen && reach.opened));
      rec('A2b', ok, { ...r, reach }, ok ? '' : 'at 1.3x: ' + JSON.stringify(r));
    }
    // A7 zero page errors, zero console errors, node --check of the module
    {
      const snapFile = path.join(OUT, 'module-under-test.js'); if (SNAPSHOT) fs.writeFileSync(snapFile, SNAPSHOT.bytes);
      const chk = SNAPSHOT ? spawnSync(process.execPath, ['--check', snapFile], { encoding: 'utf8' }) : { status: -1, stderr: 'no module file' };
      const ok = errors.length === 0 && chk.status === 0;
      rec('A7', ok, { errors, nodeCheck: chk.status === 0 ? 'ok' : String(chk.stderr).slice(0, 300), sandboxNetworkDenied: sandboxNet.slice(0, 10) }, ok ? '' : (errors.length ? errors.length + ' error(s): ' + errors[0].text.slice(0, 120) : 'node --check failed'));
    }
    // A9 per device: the same table for both shells, number to number
    {
      const k = p, g = gp; const rows = [];
      const add = (what, kv, gv, pass) => rows.push({ what, kuiper: kv, gridatlas: gv, pass: !!pass });
      if (!g) rows.push({ what: 'GridAtlas measured', kuiper: '-', gridatlas: ga && ga.error ? ga.error : 'menu bar not installed: ' + JSON.stringify(ga && ga.probe && ga.probe.failure), pass: false });
      else {
        add('bar height px', k.bar && k.bar.h, g.bar.h, k.bar && near(k.bar.h, g.bar.h, 0.5));
        add('bar background', k.barCss && k.barCss['background-color'], g.barCss['background-color'], k.barCss && k.barCss['background-color'] === g.barCss['background-color']);
        add('bar rule', k.barCss && k.barCss['border-bottom'], g.barCss['border-bottom'], k.barCss && k.barCss['border-bottom'] === g.barCss['border-bottom']);
        add('bar blur', k.barCss && k.barCss['backdrop-filter'], g.barCss['backdrop-filter'], k.barCss && k.barCss['backdrop-filter'] === g.barCss['backdrop-filter']);
        add('bar font', k.barCss && k.barCss['font-family'], g.barCss['font-family'], k.barCss && k.barCss['font-family'] === g.barCss['font-family']);
        const kt = (k.titles || []).filter(t => !t.star), gt = (g.titles || []);
        add('title rows', new Set(kt.map(t => Math.round(t.rect.y))).size, new Set(gt.map(t => Math.round(t.rect.y))).size, new Set(kt.map(t => Math.round(t.rect.y))).size === 1 && new Set(gt.map(t => Math.round(t.rect.y))).size === 1);
        add('title names', kt.map(t => t.text.toUpperCase()).join(' '), gt.map(t => t.text.toUpperCase()).join(' '), JSON.stringify(kt.map(t => t.text.toUpperCase())) === JSON.stringify(SIX) && JSON.stringify(gt.map(t => t.text.toUpperCase())) === JSON.stringify(GA_SIX));
        add('title height px', kt[0] && kt[0].rect.h, gt[0] && gt[0].rect.h, kt[0] && gt[0] && near(kt[0].rect.h, gt[0].rect.h, 0.5));
        for (const prop of ['fontSize', 'letterSpacing', 'padding', 'color', 'fontFamily', 'textTransform']) add('title ' + prop, kt[0] && kt[0][prop], gt[0] && gt[0][prop], kt[0] && gt[0] && kt[0][prop] === gt[0][prop]);
        for (let i = 0; i < 6; i++) { if (i === 4) continue; const a = kt[i], b = gt[i]; add('title width ' + (b ? b.text.toUpperCase() : i), a && a.rect.w, b && b.rect.w, a && b && near(a.rect.w, b.rect.w, 1)); }
        add('brand slot w x h', k.slot && [k.slot.w, k.slot.h].join(' x '), g.slot && [g.slot.w, g.slot.h].join(' x '), k.slot && g.slot && near(k.slot.w, g.slot.w, 1) && near(k.slot.h, g.slot.h, 1));
        add('wordmark box w x h', k.brand && [k.brand.w, k.brand.h].join(' x '), g.brand && [g.brand.w, g.brand.h].join(' x '), k.brand && g.brand && near(k.brand.w, g.brand.w, 1) && near(k.brand.h, g.brand.h, 1));
        add('wordmark centre - bar centre (x, y)', k.brand && k.bar && [+(k.brand.x + k.brand.w / 2 - k.bar.x - k.bar.w / 2).toFixed(2), +(k.brand.y + k.brand.h / 2 - k.bar.y - k.bar.h / 2).toFixed(2)].join(', '), g.brand && [+(g.brand.x + g.brand.w / 2 - g.bar.x - g.bar.w / 2).toFixed(2), +(g.brand.y + g.brand.h / 2 - g.bar.y - g.bar.h / 2).toFixed(2)].join(', '),
          k.brand && k.bar && g.brand && near(k.brand.x + k.brand.w / 2 - k.bar.x - k.bar.w / 2, g.brand.x + g.brand.w / 2 - g.bar.x - g.bar.w / 2, 1) && near(k.brand.y + k.brand.h / 2 - k.bar.y - k.bar.h / 2, g.brand.y + g.brand.h / 2 - g.bar.y - g.bar.h / 2, 1));
        for (const prop of ['font-size', 'font-weight', 'letter-spacing', 'text-transform', 'color', 'font-family', 'line-height']) add('.ventus-main ' + prop, k.main && k.main.style[prop], g.main && g.main.style[prop], k.main && g.main && k.main.style[prop] === g.main.style[prop]);
        for (const prop of ['font-size', 'letter-spacing', 'text-transform', 'color', 'line-height']) add('.ventus-sub ' + prop, k.sub && k.sub.style[prop], g.sub && g.sub.style[prop], k.sub && g.sub && k.sub.style[prop] === g.sub.style[prop]);
        add('.ventus-main box w x h', k.main && [k.main.rect.w, k.main.rect.h].join(' x '), g.main && [g.main.rect.w, g.main.rect.h].join(' x '), k.main && g.main && near(k.main.rect.w, g.main.rect.w, 1) && near(k.main.rect.h, g.main.rect.h, 1));
        add('.ventus-sub box w x h', k.sub && [k.sub.rect.w, k.sub.rect.h].join(' x '), g.sub && [g.sub.rect.w, g.sub.rect.h].join(' x '), k.sub && g.sub && near(k.sub.rect.w, g.sub.rect.w, 1) && near(k.sub.rect.h, g.sub.rect.h, 1));
        add('lockup flanks shown', k.hudChildren && k.hudChildren.filter(c => c.display !== 'none').length, g.hudChildren && g.hudChildren.filter(c => c.display !== 'none').length, k.hudChildren && g.hudChildren && k.hudChildren.filter(c => c.display !== 'none').length === g.hudChildren.filter(c => c.display !== 'none').length);
        add('wordmark is a link', k.brandIsLink, g.brandIsLink, k.brandIsLink === false && g.brandIsLink === false);
        add('horizontal scroll', k.scroll && k.scroll.scrollWidth > k.scroll.clientWidth, g.scroll.scrollWidth > g.scroll.clientWidth, k.scroll && k.scroll.scrollWidth === k.scroll.clientWidth && g.scroll.scrollWidth === g.scroll.clientWidth);
        add('panel position (phone fixed / wide absolute)', k.panels && [...new Set(k.panels.map(x => x.position))].join(','), g.panels && [...new Set(g.panels.map(x => x.position))].join(','), k.panels && g.panels && [...new Set(k.panels.map(x => x.position))].join(',') === [...new Set(g.panels.map(x => x.position))].join(','));
      }
      const ok = rows.length > 0 && rows.every(r => r.pass);
      rec('A9', ok, { rows, gaState: g && g.state, gaErrors: ga && ga.errors }, ok ? '' : rows.filter(r => !r.pass).map(r => r.what).slice(0, 8).join('; '));
    }
  } catch (e) {
    rec('HARNESS', false, { error: String(e.stack || e).slice(0, 600) }, String(e.message || e).split('\n')[0]);
  }
  await ctx.close();
  return { device: label, base: devName, mode: mod.mode, A, imgs, errors, sandboxNet };
}

// ------------------------------------------------------------------ A8: the admission rule (#keys gone after the engine ran)
async function runA8(browser, mod) {
  const devName = 'Pixel 7';
  // Removing #keys from the HTML would make the engine itself throw at index.html:600 (getElementById('keys').addEventListener)
  // before Edition 4's bar exists, so nothing could be "still clickable". The test removes #keys after the engine's module script
  // has run: a module script inserted right after it, and again at DOMContentLoaded (capture), before the shell can look.
  const removal = `<script type="module">{const k=document.getElementById('keys'); if(k) k.remove(); window.__a8_removed=(window.__a8_removed||0)+1;}</script>`;
  const baseRewrite = mod.pageOpts.rewrite || (h => h);
  const rewrite = (html) => { html = baseRewrite(html); const i = html.indexOf('<script type="module">'); const j = i >= 0 ? html.indexOf('</script>', i) : -1;
    return j >= 0 ? html.slice(0, j + 9) + '\n' + removal + html.slice(j + 9) : html.replace('</body>', removal + '</body>'); };
  const { ctx, page, errors } = await openPage(browser, devName, 'kuiper', { ...mod.pageOpts, rewrite });
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const k = document.getElementById('keys'); if (k) k.remove(); window.__a8_dcl = 1; }, { capture: true }));
  let m = {}, ok = false, note = '', img = null;
  try {
    await page.goto(KURL, { waitUntil: 'load', timeout: 120000 });
    await until(page, () => !!document.getElementById('kuiper-menu-bar-failure'), null, INSTALL_MAX, 500);
    await sleep(SETTLE);
    const p = await page.evaluate(shellProbe, KCFG);
    const old = await page.evaluate(() => { const b = document.getElementById('bar'); if (!b) return null; const r = b.getBoundingClientRect(); const t = b.querySelector('.gm-title[data-panel="foot"]') || b.querySelector('.gm-title'); const tr = t ? t.getBoundingClientRect() : null;
      return { rect: [r.x, r.y, r.width, r.height], visible: r.height > 0 && b.checkVisibility(), title: t ? { text: t.textContent, panel: t.dataset.panel, x: tr.x + tr.width / 2, y: tr.y + tr.height / 2 } : null, hit: tr ? (() => { const e = document.elementFromPoint(tr.x + tr.width / 2, tr.y + tr.height / 2); return e === t || (t && t.contains(e)); })() : false, keysPresent: !!document.getElementById('keys') }; });
    let clicked = null;
    if (old && old.title) { await page.touchscreen.tap(Math.round(old.title.x), Math.round(old.title.y)); await sleep(800);
      clicked = await page.evaluate(id => { const el = document.getElementById(id); return !!el && (el.classList.contains('gm-open') || (el.getBoundingClientRect().height > 0 && el.checkVisibility())); }, old.title.panel); }
    img = await shot(page, path.join(OUT, 'a8-pixel-7-refused.png'));
    const st = p.state || {};
    const strip = p.failure;
    m = { state: st, failureStrip: strip, oldBar: old, oldBarTapOpened: clicked, keysRemoved: old ? !old.keysPresent : null, errors };
    ok = st.installed === false && !!strip && strip.visible && /#keys|\bkeys\b/.test(strip.text) && strip.role === 'alert' && !!old && old.visible && old.hit && clicked === true;
    note = ok ? '' : [st.installed !== false ? 'state.installed=' + JSON.stringify(st.installed) : '', !strip ? 'no #kuiper-menu-bar-failure' : (!strip.visible ? 'strip hidden' : (!/keys/.test(strip.text) ? 'strip does not name #keys' : '')), strip && strip.role !== 'alert' ? 'strip role ' + strip.role : '', !old ? 'Edition 4 #bar absent' : (!old.visible ? '#bar hidden' : (!old.hit ? '#bar title covered' : (clicked !== true ? '#bar title tap opened nothing' : '')))].filter(Boolean).join('; ');
  } catch (e) { note = 'harness: ' + String(e.message || e).split('\n')[0]; }
  await ctx.close();
  log(`[A8 ${devName}] ${ok ? 'PASS' : 'FAIL'} ${note}`);
  return { device: devName, pass: ok, measured: m, note, img };
}

// ------------------------------------------------------------------ composite image: the two bars, strip over strip, per device
async function composite(browser, rows, file) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const b64 = await page.evaluate(async (rows) => {
    const imgs = []; for (const r of rows) for (const k of ['k', 'g']) if (r[k]) { const im = new Image(); im.src = 'data:image/png;base64,' + r[k]; await im.decode(); imgs.push([r, k, im]); }
    const W = Math.max(400, ...imgs.map(x => x[2].width)) , LH = 14, rowH = 50 + LH;
    const c = document.createElement('canvas'); c.width = W; c.height = rows.length * 2 * rowH; const g = c.getContext('2d');
    g.fillStyle = '#05080b'; g.fillRect(0, 0, c.width, c.height); g.font = '11px monospace'; let y = 0;
    for (const r of rows) for (const k of ['k', 'g']) { g.fillStyle = k === 'k' ? '#7fe' : '#fc6'; g.fillText((k === 'k' ? 'KUIPER  ' : 'GRIDATLAS  ') + r.label, 4, y + 11);
      const it = imgs.find(x => x[0] === r && x[1] === k); if (it) g.drawImage(it[2], 0, y + LH); else { g.fillStyle = '#f55'; g.fillText('not measured', 4, y + LH + 20); } y += rowH; }
    return c.toDataURL('image/png').split(',')[1];
  }, rows);
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  await ctx.close(); return file;
}
function placeImg(src, dst) { if (!src || /^FAILED/.test(src) || !fs.existsSync(src)) return null; fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); return dst; }

// ------------------------------------------------------------------ TEST.md
const ASSERT_TEXT = {
  A1: '`#kuiper-menu-bar` at x=0 y=0, full width, height 34 px (≤700 px) / 36 px; state `installed:true`, `failure:null`, schema `kuiper.menu-bar.v1`',
  A2: 'six `button.gm-title[aria-haspopup=menu]` FILE EDIT VIEW (left) SCOPE WAFER ABOUT (right) on one rounded y, inside the bar, last right edge ≤ viewport, `scrollWidth === clientWidth`; star entry (if any) is a bar title only at ≥ 434 px (the lead\'s measured breakpoint, FINDING #10 6564447092), first on the left',
  A2b: '360 px with a 1.3× font scale on titles and wordmark (01-bar method): still one row, bar height kept; if it overflows, `overflow-x:auto` and the last title reachable by scroll and opens on tap',
  A3: 'wordmark: `.ventus-main` "Ventus" 11/14 px 800 `rgb(255,255,255)` uppercase; `.ventus-sub` 4.5/5.5 px `rgb(136,136,136)`; centred within 1 px (x on the viewport, y on the bar); not a link; box within 1 px of the team-1 table AND of GridAtlas measured live in this run',
  A4: 'at rest nothing over the wafer outside the bar but `#c`, `#o`, the find box (top = bar bottom + 36, right-aligned, 44 px on touch) and the star chip; `#keys #top #hud #foot #lines #bar` hidden; no panel open',
  A5: 'each title: real tap opens exactly one panel under the bar inside the viewport (`aria-expanded=true`), second tap, Escape and `page.goBack()` (the Android back gesture) close it and stay on the page; every panel row ≥ 44 px; a wafer tap closes; VIEW "next verified line" lands the spark between bar bottom and card top (10 px margins)',
  A6: '`elementFromPoint(titleCentreX, 40)` is the title on a coarse pointer, all closed (44 px hit box); with FILE open, 4 px into its first row is the row, not the title',
  A7: 'zero `pageerror`, zero console errors, zero failed local requests during the device run; `node --check` of the module',
  A8: 'admission rule (Pixel 7): `#keys` removed after the engine ran → `installed:false`, `#kuiper-menu-bar-failure[role=alert]` visible naming `#keys`, Edition 4 `#bar` visible and a real tap on its title opens its panel',
  A9: 'the same table measured on GridAtlas `/atlas/` (gridatlas@5ec7f62 served on port+100, CDN stubbed as team 1 did) — bar, title face, wordmark style and box compared number to number (box tolerance 1 px, styles exact)',
};
function writeTestMd(rep, file) {
  const devs = rep.devices.map(d => d.device);
  const L = [];
  L.push('# handoff/01-shell/TEST.md: step 1 "the shell contract", acceptance A1–A9', '');
  L.push(`Tester OPUS-1 (Opus team 1). Written by \`test.cjs\` at ${rep.finished} UTC; every cell below is a measurement from that run, never an estimate.`, '');
  L.push(`**Verdict: ${rep.pass ? 'PASS — the hand-off may go.' : 'FAIL — HAND-OFF REFUSED by the tester until every cell reads PASS.'}**`, '');
  if (rep.alsoLoaderSkipped) L.push(`Loader preview: ${rep.alsoLoaderSkipped}.`, '');
  if (rep.alsoLoader) L.push(`Loader preview (Opus 4's patch, not gating team 1's hand-off, reported for the integrator): **${rep.loaderPreviewPass ? 'PASS' : 'FAIL'}**.`, '');
  L.push('| run | value |', '|---|---|');
  L.push(`| module | ${rep.module.file ? '`modules/' + path.basename(rep.module.file) + '`' : 'NOT FOUND (no `modules/<stamp>-kuiper-shell.js`)'} |`);
  L.push(`| module sha256 | ${rep.module.sha256 ? '`' + rep.module.sha256 + '`' : '-'} (${rep.module.bytes || 0} bytes) |`);
  L.push(`| how the module reached the page | \`${rep.module.mode}\` ${rep.module.modeNote || ''} |`);
  L.push(`| test.cjs sha256 | \`${rep.testSha256}\` |`);
  L.push(`| Kuiper | ${KURL} (kuiper-belt \`${rep.heads.kuiper}\`, branch \`${rep.heads.kuiperBranch}\`, working tree) — server ${rep.servers.kuiper} |`);
  L.push(`| GridAtlas | ${GAURL} (gridatlas \`${rep.heads.gridatlas}\`) — server ${rep.servers.gridatlas}; maplibre-gl@3.6.2 from \`see-through/202610050513/vendor/\`, Carto style = one background layer, all other external requests aborted (team-1/STEPS.md:20-29) |`);
  L.push(`| browser | Playwright Chromium ${rep.browserVersion}, \`${ARGS.join(' ')}\`, real touch (\`touchscreen.tap\`), ${SETTLE / 1000} s settle |`);
  L.push(`| devices | ${rep.devices.map(d => d.device + ' ' + (DEVICE_SETS[d.base]().viewport.width + '×' + DEVICE_SETS[d.base]().viewport.height) + (DEVICE_SETS[d.base]().hasTouch ? ' touch' : ' mouse')).join(' · ')} |`, '');
  if (rep.alsoLoader) L.push(`Columns marked (loader) are the same device with the module admitted by Opus 4's loader instead of the stand-in script tag: ${rep.alsoLoader}`, '');
  L.push('## Pass / fail per assertion', '');
  L.push('| id | assertion | ' + devs.join(' | ') + ' |', '|---|---|' + devs.map(() => '---').join('|') + '|');
  for (const id of ['A1', 'A2', 'A2b', 'A3', 'A4', 'A5', 'A6', 'A7', 'A9', 'HARNESS']) {
    if (!rep.devices.some(d => d.A[id])) continue;
    L.push(`| ${id} | ${ASSERT_TEXT[id] || 'harness error'} | ` + rep.devices.map(d => d.A[id] ? (d.A[id].pass ? 'PASS' : 'FAIL') + (d.A[id].note ? ': ' + d.A[id].note.replace(/\|/g, '/').slice(0, 160) : '') : 'n/a').join(' | ') + ' |');
  }
  if (rep.a8) L.push(`| A8 | ${ASSERT_TEXT.A8} | ` + devs.map(d => d === rep.a8.device ? (rep.a8.pass ? 'PASS' : 'FAIL') + (rep.a8.note ? ': ' + rep.a8.note.replace(/\|/g, '/').slice(0, 160) : '') : '—').join(' | ') + ' |');
  L.push('');
  L.push('## Key measurements per device', '');
  L.push('| device | bar (x,y,w×h) | titles (sum w) / slot w / slack | wordmark box | GridAtlas box (live) | find box | rows <44 px | console errors |', '|---|---|---|---|---|---|---|---|');
  for (const d of rep.devices) { const a1 = d.A.A1 && d.A.A1.measured, a2 = d.A.A2 && d.A.A2.measured, a3 = d.A.A3 && d.A.A3.measured, a4 = d.A.A4 && d.A.A4.measured, a5 = d.A.A5 && d.A.A5.measured;
    L.push(`| ${d.device} | ${a1 && a1.rect ? `${a1.rect.x},${a1.rect.y},${a1.rect.w}×${a1.rect.h}` : '-'} | ${a2 ? `${a2.titleSum} / ${a2.slot ? a2.slot.w : '-'} / ${a2.slack}` : '-'} | ${a3 && a3.brand ? a3.brand.w + '×' + a3.brand.h : '-'} | ${a3 && a3.gridatlasLive ? a3.gridatlasLive.join('×') : '-'} | ${a4 && a4.find ? `${a4.find.x},${a4.find.y} ${a4.find.w}×${a4.find.h}` : '-'} | ${a5 ? a5.rowsUnder44.length + ' of ' + a5.rowCount : '-'} | ${d.errors.length} |`); }
  L.push('');
  L.push('## A9: the two shells, number to number', '');
  for (const d of rep.devices) { const a9 = d.A.A9; if (!a9) continue;
    L.push(`### ${d.device}`, '', '| measure | Kuiper | GridAtlas | pass |', '|---|---|---|---|');
    for (const r of a9.measured.rows) L.push(`| ${r.what} | ${String(r.kuiper).replace(/\|/g, '/')} | ${String(r.gridatlas).replace(/\|/g, '/')} | ${r.pass ? 'PASS' : 'FAIL'} |`);
    L.push(''); }
  const errs = rep.devices.flatMap(d => d.errors.map(e => `- ${d.device}: ${e.kind} — ${e.text.replace(/\n/g, ' ')}${e.at ? ' (' + e.at + ')' : ''}`));
  L.push('## Console and page errors (A7)', '', errs.length ? errs.slice(0, 40).join('\n') : 'None on any device.', '');
  const sn = [...new Set(rep.devices.flatMap(d => d.sandboxNet))];
  if (sn.length) L.push('External requests the sandbox proxy denied (not counted as page errors; a phone on the open network fetches them):', '', sn.slice(0, 12).map(s => '- ' + s).join('\n'), '');
  L.push('## Images (img/)', '', (rep.images.length ? rep.images.map(i => `- \`img/${path.basename(i.file)}\` ${i.kb} KB: ${i.what}`).join('\n') : 'none written'), '');
  L.push('## Method notes', '');
  for (const n of NOTES) L.push('- ' + n);
  L.push('');
  fs.writeFileSync(file, L.join('\n'));
}
const NOTES = [
  'A8 removes `#keys` after the engine has run (a module script right after the engine\'s, and at DOMContentLoaded), not from the HTML: removed from the HTML, the engine itself throws at `index.html:600` (`document.getElementById(\'keys\').addEventListener`) before it creates Edition 4\'s `#bar`, so "Edition 4\'s bar still clickable" could never hold. Measured on the Edition 4 copy at kuiper-belt `editions/202611012135/index.html:600`.',
  'The back gesture is `page.goBack()`: on Android Chrome the system back gesture is history back. A panel that pushes no history entry makes back leave the page; the test records that as FAIL (`stayedOnPage`), reloads and continues.',
  'Box tolerance is 1 px on width and height, as ROADMAP step 1 A3 states; positions differ by design (GridAtlas\'s bar sits at (5,5) inside its 1 px bordered map container, the Kuiper\'s at (0,0) on the window), so centres are compared relative to each bar.',
  'The module is read once when the run starts and served from those bytes for every device (a `page.route` on its URL), so the sha256 at the top of this file is the one every cell measured, even while the file is being edited; `node --check` runs on the same bytes.',
  'Console errors from external hosts the sandbox proxy refuses are listed separately and not counted; every local 4xx/5xx and every page error is counted.',
  'A3 centre, measured adjustment (builder FINDING and lead, PLAN.md 22:12; tester agreed and added the slot check): above 700 px GridAtlas\'s own wordmark sits +4.66 px right of its bar centre because the SYSTEM TIME flank (66 px) is wider than 2050 TARGET (57 px) (team-1 table: brand (599.7,12.3) 90×20.5 at 1280, centre 644.7 vs 640). "Centred within 1 px" and "box within 1 px of GridAtlas" cannot both hold there with the flanks copied, so A3 passes centreX when the wordmark is centred within 1 px OR sits at GridAtlas\'s live offset within 1 px, and additionally requires `.gm-brand-slot` centred within 1 px on every device.',
  'A2b waits 300 ms after the 1.3× scale before measuring (a real font-scale change relayouts first; lead edit, kept). A5 `top ≥ bar bottom` is strict (0.5 px): the first run found the landscape panels at y=35 on the bar\'s 1 px rule (GridAtlas\'s `top:100%` does the same inside its own bar); the module now uses `top:calc(100% + 1px)`.',
  'A4 accepts the find box absent at rest (lead\'s measured decision, PLAN.md: Edition 4\'s keydown ignores every key while `#goto` is shown, index.html:613); if it is shown at rest it must sit at bar bottom + 36 px, right-aligned, 44 px tall on touch.',
  'Pixel 7 landscape is 863 px wide, over GridAtlas\'s 700 px phone rule, so both shells show the 36 px desktop bar and the full lockup there (team-1/STEPS.md:84-86); the expected box is 90.0×20.5.',
];

// integration preview: team 4's loader patch applied to a copy of index.html, the shell admitted by the manifest
function loaderMod(mod) {
  const name = path.basename(mod.file);
  const L4 = path.join(EDITION_DIR, 'handoff', '04-loader'), tmp = path.join(OUT, 'loader-preview'); fs.mkdirSync(tmp, { recursive: true });
  const out = path.join(tmp, 'index.html'); const pr = spawnSync('patch', ['-s', '-o', out, path.join(EDITION_DIR, 'index.html'), path.join(L4, 'index.html.patch')], { encoding: 'utf8' });
  if (pr.status !== 0) throw new Error('team 4 index.html.patch did not apply: ' + pr.stdout + pr.stderr);
  const man = JSON.parse(fs.readFileSync(path.join(L4, 'modules.json'), 'utf8')); const src = SNAPSHOT.bytes.toString('utf8');
  const reqs = ((src.match(/KY\.register\(\{[\s\S]*?requires:\s*\[([^\]]*)\]/) || [])[1] || '').split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  const provs = ((src.match(/KY\.register\(\{[\s\S]*?provides:\s*\[([^\]]*)\]/) || [])[1] || '').split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).map(x => x === 'ID' ? 'kuiper-shell' : x);
  man.order = man.order.filter(x => x !== 'kuiper-shell').concat(['kuiper-shell']);
  man.modules = man.modules.filter(x => x.id !== 'kuiper-shell').concat([{ id: 'kuiper-shell', generation: name.slice(0, 12), path: 'modules/' + name, sha256: mod.sha256, bytes: mod.bytes, byte_budget: Math.ceil(mod.bytes / 4096) * 4096 + 4096,
    requires: reqs, provides: provs, reads: [], writes: ['window.__KUIPER_MODULES__.menuBar', '#kuiper-menu-bar'], creates_controls: 'bar', licence: 'Apache-2.0', team: '01', step: 1, proof: 'handoff/01-shell/' }]);
  fs.writeFileSync(path.join(tmp, 'modules.json'), JSON.stringify(man, null, 1));
  return { mode: 'loader-preview', modeNote: `(team 4's handoff/04-loader/index.html.patch applied to a scratch copy; modules.json = team 4's plus a kuiper-shell record with this sha256, order ${JSON.stringify(man.order)}; requires ${JSON.stringify(reqs)})`,
    pageOpts: { htmlFile: out, rewrite: h => h, manifest: JSON.stringify(man) } };
}

// ------------------------------------------------------------------ main
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const modFile = findModule();
  if (modFile) SNAPSHOT = { name: path.basename(modFile), bytes: fs.readFileSync(modFile) };
  const mod = { file: modFile, sha256: modFile ? crypto.createHash('sha256').update(SNAPSHOT.bytes).digest('hex') : null, bytes: modFile ? SNAPSHOT.bytes.length : 0, mode: 'none', pageOpts: {} };
  const servers = { kuiper: await ensureServer(PORT, ROOT, KURL + 'index.html'), gridatlas: flag('--no-ga') ? 'skipped' : await ensureServer(GA_PORT, GA_ROOT, GAURL) };
  if (modFile) {
    const name = path.basename(modFile);
    const html = flag('--html') ? fs.readFileSync(String(flag('--html')), 'utf8') : fs.readFileSync(path.join(EDITION_DIR, 'index.html'), 'utf8');
    const manifest = fs.readFileSync(path.join(EDITION_DIR, 'modules.json'), 'utf8');
    if (html.includes('kuiper-shell') || manifest.includes('kuiper-shell')) { mod.mode = 'page'; mod.modeNote = html.includes('kuiper-shell') ? '(index.html names it)' : '(modules.json names it; the loader admits it)'; if (flag('--html')) mod.pageOpts = { htmlFile: String(flag('--html')), rewrite: h => h }; }
    else { mod.mode = 'inject'; mod.modeNote = `(neither index.html nor modules.json names it yet; served with \`<script defer src="modules/${name}"></script>\` before \`</body>\`, standing in for team 1's one script tag)`;
      mod.pageOpts = { ...(flag('--html') ? { htmlFile: String(flag('--html')) } : {}), rewrite: h => h.replace(/<\/body>/i, `<script defer src="modules/${name}"></script>\n</body>`) }; }
    // page mode through the manifest: when the integrator's record still carries an earlier sha256 of this module (a
    // revision not yet re-recorded), serve modules.json with this file's sha256 and bytes, the one-line update the
    // integrator makes, and say so; every other record is served as committed.
    if (mod.mode === 'page' && !html.includes('kuiper-shell')) { try { const man = JSON.parse(manifest), rec = (man.modules || []).find(m => m && m.id === 'kuiper-shell');
      if (rec && rec.sha256 !== mod.sha256) { const was = rec.sha256; rec.sha256 = mod.sha256; rec.bytes = mod.bytes; mod.pageOpts = { ...mod.pageOpts, manifest: JSON.stringify(man) };
        mod.modeNote += ` — modules.json served with kuiper-shell sha256 ${mod.sha256.slice(0, 12)} (committed record ${was.slice(0, 12)}, an earlier revision)`; } } catch (e) {} }
    if (flag('--html')) mod.modeNote += ' — index.html replaced by ' + flag('--html');
    if (flag('--loader') && mod.mode !== 'page') Object.assign(mod, loaderMod(mod));
  } else mod.modeNote = '— no module file yet; every Kuiper assertion fails';
  log('module:', modFile || 'NONE', mod.mode);
  let alsoLoader = null, alsoLoaderSkipped = null;
  if (flag('--also-loader') && modFile && mod.mode === 'inject') { try { alsoLoader = { ...mod, ...loaderMod(mod) }; } catch (e) { alsoLoaderSkipped = 'loader preview not run: ' + String(e.message || e).split('\n')[0].slice(0, 200) + ' (the edition index.html moved under the patch; Opus 4 rebases it)'; log(alsoLoaderSkipped); } }
  const browser = await chromium.launch({ args: ARGS });
  const rep = { started: new Date().toISOString().slice(0, 16).replace('T', ' '), module: { file: modFile, sha256: mod.sha256, bytes: mod.bytes, mode: mod.mode, modeNote: mod.modeNote }, servers, devices: [], ga: [], images: [],
    heads: { kuiper: spawnSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), kuiperBranch: spawnSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).stdout.trim(), gridatlas: spawnSync('git', ['-C', GA_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim() },
    testSha256: sha256(__filename), browserVersion: browser.version(), alsoLoader: alsoLoader ? alsoLoader.modeNote : null, alsoLoaderSkipped };
  for (const d of DEVICES) {
    const ga = flag('--no-ga') ? null : await runGA(browser, d);
    if (ga) { log(`[GA ${d}] bar ${JSON.stringify(ga.probe && ga.probe.bar)} brand ${JSON.stringify(ga.probe && ga.probe.brand)} installed ${ga.probe && ga.probe.state && ga.probe.state.installed}${ga.error ? ' ERROR ' + ga.error : ''}`); rep.ga.push({ device: d, probe: ga.probe, error: ga.error, errors: ga.errors }); }
    const k = await runKuiper(browser, d, mod, ga);
    k.gaStrip = ga && ga.strip; rep.devices.push(k);
    if (alsoLoader && ['Pixel 7', 'Galaxy S24'].includes(d)) { const kl = await runKuiper(browser, d, alsoLoader, ga, d + ' (loader)'); rep.devices.push(kl); }
  }
  rep.a8 = flag('--no-a8') ? null : await runA8(browser, mod);
  // images: at most four PNG, each under 300 KB
  const want = [
    ['01-pixel7-rest.png', rep.devices.find(d => d.device === 'Pixel 7'), 'rest', 'Kuiper on Pixel 7 at rest: one bar, the wordmark, nothing else over the wafer'],
    ['02-galaxy-s24-view-open.png', rep.devices.find(d => d.device === 'Galaxy S24'), 'view', 'Galaxy S24 (360 px): the VIEW panel open under the bar'],
    ['04-pixel7-next-line.png', rep.devices.find(d => d.device === 'Pixel 7'), 'next', 'Pixel 7: VIEW → "next verified line", the spark between the bar and the card'],
  ];
  for (const [name, d, key, what] of want) { if (!d) continue; const f = placeImg(d.imgs[key], path.join(IMG_DIR, name)); if (f) rep.images.push({ file: f, what }); }
  try { const f = await composite(browser, rep.devices.map(d => ({ label: d.device, k: d.imgs.strip, g: d.gaStrip })), path.join(IMG_DIR, '03-bars-kuiper-over-gridatlas.png')); rep.images.push({ file: f, what: 'the top 50 px of both shells on every device, Kuiper over GridAtlas, same scale' }); } catch (e) { log('composite failed', e.message); }
  for (const im of rep.images) { im.kb = Math.round(fs.statSync(im.file).size / 1024);
    if (im.kb >= 300) { // too heavy: keep the top of the page (the bar is what is under test)
      const tmp = im.file + '.tmp.png'; const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } }); const pg = await ctx.newPage();
      const b64 = await pg.evaluate(async (b) => { const im = new Image(); im.src = 'data:image/png;base64,' + b; await im.decode(); let h = im.height, s = 1, out;
        for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(h * s); c.getContext('2d').drawImage(im, 0, 0, im.width, h, 0, 0, c.width, c.height); out = c.toDataURL('image/png').split(',')[1]; if (out.length * 0.75 < 290 * 1024) break; h = Math.round(h * 0.75); if (k >= 2) s *= 0.8; } return out; }, fs.readFileSync(im.file).toString('base64'));
      fs.writeFileSync(im.file, Buffer.from(b64, 'base64')); await ctx.close(); im.kb = Math.round(fs.statSync(im.file).size / 1024); im.what += ' (cropped to stay under 300 KB)'; void tmp; } }
  await browser.close();
  rep.finished = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const gating = rep.devices.filter(d => d.mode !== 'loader-preview' || rep.module.mode === 'loader-preview');
  rep.loaderPreviewPass = rep.alsoLoader ? rep.devices.filter(d => d.mode === 'loader-preview').every(d => Object.values(d.A).every(a => a.pass)) : null;
  rep.pass = gating.length > 0 && gating.every(d => Object.values(d.A).length > 0 && Object.values(d.A).every(a => a.pass)) && (!rep.a8 || rep.a8.pass) && !flag('--no-ga') && !flag('--no-a8');
  const slim = JSON.parse(JSON.stringify(rep, (k, v) => (k === 'strip' || k === 'gaStrip' ? undefined : v)));
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(slim, null, 1));
  const md = WRITE ? path.join(HERE, 'TEST.md') : path.join(OUT, 'TEST.md');
  writeTestMd(rep, md);
  // summary to stdout
  const ids = ['A1', 'A2', 'A2b', 'A3', 'A4', 'A5', 'A6', 'A7', 'A9'];
  console.log(['device', ...ids].join('\t'));
  for (const d of rep.devices) console.log([d.device, ...ids.map(i => d.A[i] ? (d.A[i].pass ? 'PASS' : 'FAIL') : '-')].join('\t'));
  if (rep.a8) console.log('A8 (' + rep.a8.device + ')\t' + (rep.a8.pass ? 'PASS' : 'FAIL') + '\t' + rep.a8.note);
  console.log((rep.pass ? 'PASS' : 'FAIL') + ' — report ' + path.join(OUT, 'report.json') + ' — ' + md);
  process.exit(rep.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
