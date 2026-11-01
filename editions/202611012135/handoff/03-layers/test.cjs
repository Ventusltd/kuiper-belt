#!/usr/bin/env node
// test.cjs — Opus team 3, NL-010 roadmap step 3 "the Kuiper layer registry": the acceptance test on Android, measured.
//
//   node test.cjs <root-url> <outdir> [--devices "Pixel 7,Galaxy S24"] [--handoff] [--index FILE] [--manifest FILE]
//
//   <root-url>  the kuiper-belt repository root as served, e.g. http://127.0.0.1:8432/ (python3 -m http.server 8432
//               --bind 127.0.0.1 from /home/user/estate/kuiper-belt). The edition is <root-url>editions/202611012135/.
//   <outdir>    per-device screenshots <outdir>/<device>/NN-<step>.png and <outdir>/report.json (keep it outside the repo).
//   --handoff   also write img/WAIT.png, img/OK.png, img/FAIL.png, img/REFUSED.png (first device, each < 300 KB) and
//               TEST.md (one row per assertion, both devices) next to this file.
//   --index F / --manifest F   PRE-INTEGRATION ONLY: serve file F in place of editions/202611012135/index.html /
//               modules.json (the integrator has not yet applied the step 4 hook table or listed this module). The
//               report and TEST.md say so on their first line; a hand-off pass is a pass WITHOUT these flags. In such a
//               manifest a module record may carry "sha256": "live": it is hashed from disk at each request.
//
// Governing text: neural-link FIXES/NL-010/ROADMAP.md step 3 "Acceptance test on Android" 1-9 and team-2/STEPS.md 3.1-3.8
// (tests at :248-287). Form: neural-link FIXES/NL-009/android-journey.cjs (Playwright, real touch via
// page.touchscreen.tap, harness GL flags, 6.5 s after load, screenshot timeout 180 s). Exit 0 when every gated assertion
// of every device passed, 1 otherwise, 2 on a harness error.
//
// What the script relies on (the contract with the module; keep it or update this list):
//   the registry api: KY.modules.layers.api (KY is frozen by the step 4 loader), else window.__KUIPER_LAYERS__, else KY.layers;
//     {inspect,get,set,value} (team-2/STEPS.md 3.3); inspect() -> {layers, unique, complete, on, states}
//   #ky-layers (else #layers): the WAFER panel host; #layers: the rows, one ORIGINAL <input type=checkbox data-ky-layer="layer:<id>"> per record, inside its row
//     (the row is input.closest('label'), else the input's parent); the row's text carries the state tag
//     "<WAIT|LOAD|OK|EMPTY|FAIL|REFUSED>[ · <why>]"
//   the lines list inside the panel host: rows [data-i] (or #lineslist); a filter input (#lyFind, else input[type=search],
//     else the first non-checkbox input in #layers); a clear control (button with aria-label or text "clear" / "×");
//     a count line "<shown> of <total> rows[ …]"; "the largest label" compares text outside buttons and inputs
//   the WAFER title: a #bar button whose text is WAFER (team 1's shell), or #bar [data-panel=wafer|layers]; before the shell
//     is admitted the module takes over the Edition 4 LINES title (#bar [data-panel=lines]) and t2-title is NOT EVALUATED
//   #refuse[role=alert] (the refusal strip), #big (the heading), #hud (the readout), #o (2d overlay, 1 canvas px = 1 CSS px)
//   KY.cam {x, y, zoom} (step 4 hook table, handoff/04-loader/HOOKS.md), else the page's globals cx, cy, zoom
//   the URL: the ticked layers as "layers=<id>,<id>" in the hash (R3, the hash wins) or the query (team-2 3.6)
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');

const STAMP = '202611012135';
const IDS = ['periods', 'repos', 'editions', 'lines', 'see-through', 'elements', 'spider'];
const APPS = ['see-through', 'elements', 'spider'];
const argv = process.argv.slice(2);
const positional = []; const flags = {};
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const nx = argv[i + 1]; if (nx != null && !nx.startsWith('--') && !['--handoff'].includes(a)) { flags[a] = nx; i++; } else flags[a] = true; } else positional.push(a); }
if (positional.length < 2) { console.error('usage: node test.cjs <root-url> <outdir> [--devices "Pixel 7,Galaxy S24"] [--handoff] [--index FILE] [--manifest FILE]'); process.exit(2); }
const ROOT = positional[0].replace(/\/?$/, '/'), OUT = path.resolve(positional[1]);
const ED_URL = ROOT + 'editions/' + STAMP + '/';
const DEVICES = (flags['--devices'] ? String(flags['--devices']) : 'Pixel 7,Galaxy S24').split(',').map(s => s.trim()).filter(Boolean);
const HERE = __dirname, ED_DIR = path.resolve(HERE, '../..'), REPO = path.resolve(ED_DIR, '../..');
const OVR_INDEX = flags['--index'] ? fs.readFileSync(path.resolve(String(flags['--index']))) : null;
const OVR_MANIFEST = flags['--manifest'] ? fs.readFileSync(path.resolve(String(flags['--manifest']))) : null;
const PRE = !!(OVR_INDEX || OVR_MANIFEST);
// pre-integration only: a record whose sha256 is "live" is hashed from disk at each request, because the module is edited while it is tested
function liveManifest() { let m; try { m = JSON.parse(OVR_MANIFEST.toString('utf8')); } catch (e) { return OVR_MANIFEST; }
  for (const r of m.modules || []) if (r.sha256 === 'live') { const b = fs.readFileSync(path.join(ED_DIR, r.path)); r.sha256 = sha256(b); r.bytes = b.length; }
  return JSON.stringify(m); }
const FIXED_WAIT = 6500, STATE_MAX = 90000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');

// ------------------------------------------------------------------ the data the test measures against, from disk
const KEYS_BYTES = fs.readFileSync(path.join(ED_DIR, 'keys.json'));
const KEYS = JSON.parse(KEYS_BYTES.toString('utf8'));
const META = JSON.parse(fs.readFileSync(path.join(REPO, 'cosmos/wafer-meta.json'), 'utf8'));
const BODIES = KEYS.bodies || KEYS;
// the edition's own admission predicate (index.html:632 at kuiper-belt@96736f5): verified, on the wafer, finite, inside SPACE
const FILTER_EXPECT = BODIES.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && b.key < META.address_space && (b.repo + ' ' + b.path + ' ' + b.title).toLowerCase().includes('gridatlas')).length;
const PLACED_KEYS = BODIES.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && b.key < META.address_space).map(b => b.key);
// one byte changed, the length kept, the JSON still valid: only the sha256 can catch it
const FIRST_KEYS = (() => { try { const r = JSON.parse(fs.readFileSync(path.join(ED_DIR, 'data/layers.json'), 'utf8')).layers.find(x => x.id === 'lines'); return r && r.source && r.source.file || 'keys.json'; } catch (e) { return 'keys.json'; } })();   // lead: the record's first file
const FIRST_BYTES = fs.readFileSync(path.join(ED_DIR, FIRST_KEYS));
const TAMPERED = (() => { const KEYS_BYTES = FIRST_BYTES; const s = KEYS_BYTES.toString('latin1'); const t = s.indexOf('"title"'); let i = s.indexOf('"', s.indexOf(':', t) + 1) + 1;
  while (!/[A-Za-z]/.test(s[i])) i++; const c = s[i], d = c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase();
  const buf = Buffer.from(KEYS_BYTES); buf[i] = d.charCodeAt(0); return { buf, offset: i, from: c, to: d, sha: sha256(buf), shaOriginal: sha256(KEYS_BYTES) }; })();

// ------------------------------------------------------------------ in-page probe (self-contained)
function probeFn() {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) }; };
  const vis = el => { if (!el) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.hidden) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const q = s => document.querySelector(s);
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const STATE = /(?<![A-Z])(WAIT|LOAD|OK|EMPTY|FAIL|REFUSED)\b(?:\s*·\s*([^\n]*))?/;
  const textOf = el => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const a = []; while (w.nextNode()) a.push(w.currentNode.textContent); return norm(a.join(' ')); };   // text nodes joined by a space: 'periods' + 'WAIT' never reads 'periodsWAIT'
  const KY = window.KY, L = (KY && KY.modules && KY.modules.layers && KY.modules.layers.api) || window.__KUIPER_LAYERS__ || (KY && KY.layers);
  let inspect = null, inspectErr = null; try { inspect = L && L.inspect ? JSON.parse(JSON.stringify(L.inspect())) : null; } catch (e) { inspectErr = String(e && e.message || e); }
  const get = id => { try { const g = L && L.get ? L.get(id) : null; return g ? { on: g.on, value: g.value, status: g.status, why: g.why, placed: g.placed, total: g.total, group: g.group || (g.record && g.record.group) || null } : null; } catch (e) { return { error: String(e && e.message || e) }; } };
  const rowsRoot = q('#layers'), panel = q('#ky-layers') || rowsRoot;   // #ky-layers: the panel host (rows, filter, count, list); #layers: the seven rows
  const fontPx = el => parseFloat(getComputedStyle(el).fontSize) || 0;
  const maxFont = root => { let m = 0; if (!root) return 0; const all = [root, ...root.querySelectorAll('*')]; for (const el of all) { if (el.tagName === 'INPUT' || el.closest('button, [role=button]')) continue; if ([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) m = Math.max(m, fontPx(el)); } return m; };
  const inputs = [...document.querySelectorAll('input[data-ky-layer]')];
  const rows = inputs.map(inp => { const row = inp.closest('label') || inp.parentElement; const text = textOf(row); const tag = row.querySelector('.st, [data-state]'); const m = (tag ? textOf(tag) : text).match(STATE) || text.match(STATE);
    const id = String(inp.getAttribute('data-ky-layer')).replace(/^layer:/, '');
    return { id, key: inp.getAttribute('data-ky-layer'), inPanel: !!(rowsRoot && rowsRoot.contains(inp)), checked: inp.checked, disabled: inp.disabled, text: text.slice(0, 200), status: m ? m[1] : null, why: m && m[2] ? m[2].trim() : '', rect: R(row), inputRect: R(inp), visible: vis(row), maxFont: maxFont(row), get: get(id) }; });
  const panelVis = vis(panel);
  // the lines list, the filter, the clear control and the count line, all inside #layers
  let list = panel && (panel.querySelector('#lineslist') || (panel.querySelector('[data-i]') ? panel.querySelector('[data-i]').parentElement : null));
  const lineRows = panel ? panel.querySelectorAll('[data-i]').length : 0;
  const find = panel && (panel.querySelector('#lyFind') || panel.querySelector('input[type=search]') || [...panel.querySelectorAll('input')].find(i => i.type !== 'checkbox' && !i.hasAttribute('data-ky-layer')));
  const clear = panel && [...panel.querySelectorAll('button, [role=button]')].find(b => /clear/i.test(b.getAttribute('aria-label') || '') || /^(×|✕|clear)$/i.test(b.textContent.trim()));
  let countLine = null; if (panel) { for (const el of panel.querySelectorAll('*')) { const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(''); const t = norm(el.children.length ? own : el.textContent); const m = t.match(/^([\d,]+) of ([\d,]+) rows?\b/); if (m) { countLine = { text: t, shown: +m[1].replace(/,/g, ''), total: +m[2].replace(/,/g, '') }; break; } } }
  const refuse = q('#refuse');
  const bar = q('#bar');
  const titleEl = (() => { if (!bar) return null; const b = [...bar.querySelectorAll('button, a, [role=button]')].find(e => /^wafer$/i.test(norm(e.textContent))); return b || bar.querySelector('[data-panel="wafer"], [data-panel="layers"]') || bar.querySelector('[data-panel="lines"]'); })();   // pre-shell: the module takes over the Edition 4 LINES title
  const hp = new URLSearchParams(location.hash.replace(/^#/, '')), sp = new URLSearchParams(location.search);
  const layersParam = hp.has('layers') ? hp.get('layers') : (sp.has('layers') ? sp.get('layers') : null);
  let cam = null; try { cam = KY && KY.cam ? { x: KY.cam.x, y: KY.cam.y, zoom: KY.cam.zoom } : null; } catch (e) {}
  if (!cam || !Number.isFinite(cam.zoom)) { try { cam = { x: cx, y: cy, zoom: zoom, from: 'globals' }; } catch (e) { cam = null; } }   // eslint-disable-line no-undef
  let SP = null; try { SP = KY && KY.hooks ? KY.hooks.SPACE : null; } catch (e) {} if (!SP) { try { SP = SPACE; } catch (e) {} }        // eslint-disable-line no-undef
  return {
    viewport: { w: innerWidth, h: innerHeight }, hasKY: !!KY, hasLayers: !!L, inspect, inspectErr,
    modules: KY && KY.modules ? Object.keys(KY.modules) : [], refused: (window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.refused) || null,
    rows, panel: panel ? { visible: panelVis, rect: R(panel), scrollHeight: panel.scrollHeight, clientHeight: panel.clientHeight, maxFont: maxFont(panel) } : null,
    list: list ? { rect: R(list), scrollHeight: list.scrollHeight, clientHeight: list.clientHeight, overflowY: getComputedStyle(list).overflowY } : null, lineRows,
    find: find ? { rect: R(find), value: find.value, fontPx: fontPx(find) } : null, clear: clear ? { rect: R(clear), text: clear.textContent.trim() || clear.getAttribute('aria-label') } : null, countLine,
    legacy: document.querySelectorAll('[data-layer-id], [data-pn-layer]').length,
    refuse: refuse ? { role: refuse.getAttribute('role'), visible: vis(refuse), rect: R(refuse), text: norm(refuse.textContent).slice(0, 300) } : null,
    big: q('#big') ? norm(q('#big').textContent) : null, hud: q('#hud') ? q('#hud').textContent : '',
    bar: R(bar), title: titleEl ? { text: norm(titleEl.textContent), rect: R(titleEl) } : null,
    url: { href: location.href, search: location.search, hash: location.hash, layers: layersParam }, historyLength: history.length, marker: window.__t3marker || null,
    cam, SPACE: SP, card: q('#card') ? vis(q('#card')) : false, selftest: window.__selftest ? JSON.parse(JSON.stringify(window.__selftest)) : null,
  };
}
// the overlay pixels at the screen place of every admitted key: green = G > 120 and G > R + 40 (the step's own test) and
// G > B + 60, so the cyan of the instrument (#2ee6e6, PALETTE.md:10: date labels drawn on #o) is not counted as a spark (#22ee77, :11)
function sparksFn(keys) {
  const G32 = 2654435769; const place = k => { const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, th = 2 * Math.PI * m / 4294967296, r = Math.sqrt(k + 0.5); return [r * Math.cos(th), r * Math.sin(th)]; };
  let c = null; try { c = window.KY && KY.cam ? { x: KY.cam.x, y: KY.cam.y, zoom: KY.cam.zoom } : null; } catch (e) {}
  if (!c || !Number.isFinite(c.zoom)) { try { c = { x: cx, y: cy, zoom: zoom }; } catch (e) { return { error: 'no camera (KY.cam nor globals)' }; } }   // eslint-disable-line no-undef
  const ov = document.getElementById('o'); if (!ov) return { error: 'no #o' };
  const W = ov.width, H = ov.height, d = ov.getContext('2d').getImageData(0, 0, W, H).data;
  const greenAt = (sx, sy) => { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = Math.round(sx) + dx, y = Math.round(sy) + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const i = (y * W + x) * 4; if (d[i + 3] > 60 && d[i + 1] > 120 && d[i + 1] > d[i] + 40 && d[i + 1] > d[i + 2] + 60) n++; } return n; };
  let green = 0, onCanvas = 0, first = null;
  keys.forEach((k, j) => { const [x, y] = place(k), sx = (x - c.x) * c.zoom + W / 2, sy = H / 2 - (y - c.y) * c.zoom;
    const on = sx >= 0 && sy >= 0 && sx < W && sy < H; if (on) onCanvas++; const g = on ? greenAt(sx, sy) : 0; if (g) green++;
    if (j === 0) { const i = (Math.round(sy) * W + Math.round(sx)) * 4; first = { key: k, sx: +sx.toFixed(1), sy: +sy.toFixed(1), greenPx: g, rgba: on ? [d[i], d[i + 1], d[i + 2], d[i + 3]] : null }; } });
  return { total: keys.length, onCanvas, green, first, cam: { x: +c.x.toFixed(3), y: +c.y.toFixed(3), zoom: c.zoom } };
}
// the wafer from a screenshot: lit pixels (luminance > 34) inside the wafer's disc, below yMin (bar, alert strip)
async function engineShot(S) {   // the engine's own pixels: hide the DOM layers above the canvases for one screenshot, then restore them
  await S.page.evaluate(() => { window.__t3hid = [...document.querySelectorAll('body > *:not(canvas):not(script):not(style)')].filter(e => getComputedStyle(e).visibility !== 'hidden').map(e => { e.style.setProperty('visibility', 'hidden', 'important'); return e; }); });
  const png = await S.png(); await S.page.evaluate(() => { (window.__t3hid || []).forEach(e => e.style.removeProperty('visibility')); window.__t3hid = null; }); return png; }
async function alertCover(page) {   // the share of the wafer's disc that #refuse covers on screen (measured, reported, not gated: team-2 test 4 asks only that it is visible)
  return page.evaluate(() => { let c = null; try { c = window.KY && KY.cam ? { x: KY.cam.x, y: KY.cam.y, zoom: KY.cam.zoom } : null; } catch (e) {} let SP = null; try { SP = KY.hooks.SPACE; } catch (e) {}
    const el = document.getElementById('refuse'); if (!c || !SP || !el) return null; const r = el.getBoundingClientRect(); const ox = -c.x * c.zoom + innerWidth / 2, oy = innerHeight / 2 + c.y * c.zoom, R = Math.sqrt(SP) * c.zoom;
    let tot = 0, cov = 0; for (let y = Math.floor(oy - R); y <= oy + R; y += 2) for (let x = Math.floor(ox - R); x <= ox + R; x += 2) { if ((x - ox) ** 2 + (y - oy) ** 2 > R * R) continue; tot++; if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) cov++; }
    return { refuseRect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], discCoveredFraction: +(cov / Math.max(1, tot)).toFixed(3) }; }); }
async function waferDisc(page, png, yMin) {
  return page.evaluate(async ({ b64, yMin }) => {
    let c = null; try { c = window.KY && KY.cam ? { x: KY.cam.x, y: KY.cam.y, zoom: KY.cam.zoom } : null; } catch (e) {}
    if (!c || !Number.isFinite(c.zoom)) { try { c = { x: cx, y: cy, zoom: zoom }; } catch (e) { return { error: 'no camera' }; } }   // eslint-disable-line no-undef
    let SP = null; try { SP = window.KY && KY.hooks ? KY.hooks.SPACE : null; } catch (e) {} if (!SP) { try { SP = SPACE; } catch (e) {} }   // eslint-disable-line no-undef
    if (!SP) return { error: 'SPACE is 0: the wafer did not admit its keys' };
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const W = innerWidth, H = innerHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data; const ox = -c.x * c.zoom + W / 2, oy = H / 2 + c.y * c.zoom, Rr = Math.sqrt(SP) * c.zoom;
    let lit = 0, tot = 0;
    for (let y = Math.max(0, Math.ceil(Number.isFinite(+yMin) ? +yMin : 0)); y < H; y++) for (let x = 0; x < W; x++) { if ((x - ox) ** 2 + (y - oy) ** 2 > Rr * Rr) continue; tot++; const i = (y * W + x) * 4; if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] > 34) lit++; }
    return { yMin: yMin, centre: [+ox.toFixed(1), +oy.toFixed(1)], radius: +Rr.toFixed(1), pixels: tot, lit, litFraction: +(lit / Math.max(1, tot)).toFixed(4) };
  }, { b64: png.toString('base64'), yMin });
}

// ------------------------------------------------------------------ one device
async function runDevice(browser, deviceName, shots) {
  const dev = devices[deviceName]; if (!dev) throw new Error('unknown Playwright device: ' + deviceName);
  const dir = path.join(OUT, slug(deviceName)); fs.mkdirSync(dir, { recursive: true });
  const steps = []; let n = 0, stepT0 = Date.now();
  const seen = new Set();                                   // every state any row showed, across the scenarios
  const report = { device: deviceName, viewport: dev.viewport, dpr: dev.deviceScaleFactor, url: ED_URL, preIntegration: PRE, startedAt: new Date().toISOString(), steps, scenarios: {}, pass: false };
  const record = (id, name, pass, measured, note) => { const s = { id, name, pass: pass === null ? null : !!pass, status: pass === null ? 'NOT EVALUATED' : (pass ? 'PASS' : 'FAIL'), ms: Date.now() - stepT0, measured, note: note || '' }; stepT0 = Date.now(); steps.push(s);
    process.stderr.write(`[${deviceName}] ${s.status} ${id}${note ? ' — ' + note : ''}\n`); return s; };
  const why = (...parts) => parts.filter(Boolean).join('; ');

  // a fresh context per scenario: routes are the only way a failure is served; the files on disk are never touched
  async function open(scenario, url, opts = {}) {
    const context = await browser.newContext({ ...dev, locale: 'en-GB' });
    const page = await context.newPage(); page.setDefaultTimeout(180000);
    const errors = [], allowed = [], requests = {};
    const allow = opts.allow || [];
    page.on('console', m => { if (m.type() !== 'error') return; const loc = (m.location && m.location().url) || ''; const e = { kind: 'console', text: m.text().slice(0, 300), url: loc };
      if (/Failed to load resource/i.test(e.text) && allow.some(re => re.test(loc))) allowed.push(e); else errors.push(e); });
    page.on('pageerror', e => errors.push({ kind: 'pageerror', text: String(e.message || e).slice(0, 300) }));
    page.on('requestfailed', r => { const f = r.failure(); if (f && !/aborted|ERR_ABORTED/i.test(f.errorText)) errors.push({ kind: 'request', text: r.url().slice(0, 200) + ' ' + f.errorText }); });
    page.on('request', r => { const u = r.url().replace(ROOT, ''); requests[u] = (requests[u] || 0) + 1; });
    if (OVR_INDEX) await page.route(new RegExp('/editions/' + STAMP + '/(index\\.html)?(\\?[^#]*)?$'), r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: OVR_INDEX }));
    if (OVR_MANIFEST) await page.route(new RegExp('/editions/' + STAMP + '/modules\\.json(\\?.*)?$'), r => r.fulfill({ status: 200, contentType: 'application/json', body: liveManifest() }));
    for (const [re, fn] of (opts.routes || [])) await page.route(re, fn);
    await page.addInitScript(() => { window.__t3marker = String(Math.random()); });
    const t0 = Date.now(); await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    const S = { scenario, url, context, page, errors, allowed, requests, loadMs: Date.now() - t0 };
    S.probe = async () => { const p = await page.evaluate(probeFn); for (const r of p.rows) if (r.status) seen.add(r.status); return p; };
    S.shot = async (id) => { const f = path.join(dir, String(++n).padStart(2, '0') + '-' + id + '.png'); for (let a = 0; a < 2; a++) { try { await page.screenshot({ path: f, scale: 'css', timeout: 180000 }); return f; } catch (e) { if (a) return null; } } };
    S.png = async () => { try { return await page.screenshot({ type: 'png', scale: 'css', timeout: 180000 }); } catch (e) { return null; } };
    S.tap = async (r) => { if (!r) throw new Error('nothing to tap'); await page.touchscreen.tap(Math.round((r.left + r.right) / 2), Math.round((r.top + r.bottom) / 2)); };
    S.until = async (pred, max = STATE_MAX) => { const t = Date.now(); let p; while (true) { p = await S.probe(); if (pred(p) || Date.now() - t > max) return p; await sleep(300); } };
    S.row = (p, id) => p.rows.find(r => r.id === id) || null;
    S.settled = (p) => { const r = S.row(p, 'lines'); return !!r && !!r.status && r.status !== 'WAIT' && r.status !== 'LOAD'; };
    // open the WAFER panel: by a tap on its title when team 1's shell put one in #bar; otherwise through KY.panels.set
    S.openPanel = async () => { let p = await S.probe(); if (p.panel && p.panel.visible) return { p, how: 'already open' };
      if (p.title) { await S.tap(p.title.rect); await sleep(700); return { p: await S.probe(), how: 'tap ' + p.title.text }; }
      await page.evaluate(() => { try { window.KY.panels.set('wafer'); } catch (e) {} }); await sleep(700); return { p: await S.probe(), how: 'KY.panels.set(wafer): no WAFER title in #bar' }; };
    S.closePanel = async () => { const p = await S.probe(); if (p.panel && p.panel.visible) { if (p.title) await S.tap(p.title.rect); else await page.evaluate(() => { try { window.KY.panels.set('wafer'); } catch (e) {} }); await sleep(600); } };
    S.intoView = async (id) => page.evaluate((id) => { const i = document.querySelector('input[data-ky-layer="layer:' + id + '"]'); if (!i) return false; const row = i.closest('label') || i.parentElement; const r = row.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight || document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2) !== i) row.scrollIntoView({ block: 'center' }); return true; }, id);
    S.tapRow = async (id) => { await S.intoView(id); await sleep(250); const p = await S.probe(); const r = S.row(p, id); if (!r) throw new Error('no row ' + id); await S.tap(r.rect); await sleep(900); return S.probe(); };
    S.close = async () => { report.scenarios[scenario] = { url, loadMs: S.loadMs, consoleErrors: errors.slice(), allowedErrors: allowed.slice(), requests }; await context.close(); };
    return S;
  }
  const keysRe = new RegExp('/editions/' + STAMP + '/keys(-min)?\\.json(\\?.*)?$')   /* lead: keys-min.json first, keys.json the fallback; both held / refused */, waferRe = /\/cosmos\/wafer\.tsv(\?.*)?$/;
  const errFree = (S, extra) => ({ consoleErrors: S.errors.slice(0, 8), allowed: S.allowed.length, ...(extra || {}) });

  try {
    // ============================================================ A: the normal page, the wafer and keys.json held to show WAIT and LOAD
    let relWafer, relKeys; const holdW = new Promise(r => { relWafer = r; }), holdK = new Promise(r => { relKeys = r; });
    const A = await open('A-normal', ED_URL, { routes: [[waferRe, async r => { await holdW; await r.continue(); }], [keysRe, async r => { await holdK; await r.continue(); }]] });
    let p = await A.until(q => q.hasLayers && q.rows.length >= 7, 60000);
    let op = await A.openPanel(); p = op.p;
    const lw = A.row(p, 'lines');
    const waitRows = p.rows.filter(r => ['periods', 'repos', 'editions', 'lines'].includes(r.id));
    const waitOk = waitRows.length === 4 && waitRows.every(r => r.status === 'WAIT') && /wafer/i.test(lw ? lw.why : '') && p.rows.every(r => r.status);
    shots.WAIT = shots.WAIT || await A.shot('wait');
    record('state-wait', '3.4/3.5 until the wafer settles every wafer-bound row reads WAIT · wafer (cosmos/wafer.tsv held)', p.hasLayers && waitOk,
      { rows: p.rows.map(r => [r.id, r.status, r.why]), panelOpenedBy: op.how },
      !p.hasLayers ? 'window.KY.layers absent (module not admitted)' : (waitOk ? '' : 'rows: ' + p.rows.map(r => r.id + '=' + r.text).join(' | ')));
    relWafer();
    p = await A.until(q => { const r = A.row(q, 'lines'); return !r || (r.status && r.status !== 'WAIT'); }, 60000);
    const ll = A.row(p, 'lines');
    record('state-load', '3.4 while keys.json is fetched the lines row reads LOAD (keys.json held after the wafer admitted)', !!ll && ll.status === 'LOAD',
      { lines: ll && [ll.status, ll.why], keysRequests: Object.entries(A.requests).filter(([u]) => /keys\.json/.test(u)) }, ll ? (ll.status === 'LOAD' ? '' : 'lines row reads ' + ll.text) : 'no lines row');
    relKeys();
    p = await A.until(A.settled, STATE_MAX); await sleep(FIXED_WAIT); p = await A.probe();

    // test 1: seven records, unique, complete, one original per layer, no legacy controls
    const ins = p.inspect || {};
    const keysAll = p.rows.map(r => r.key);
    const onePer = IDS.map(id => [id, p.rows.filter(r => r.id === id).length]);
    const t1 = ins.layers === 7 && ins.unique === 7 && ins.complete === true && p.rows.length === 7 && new Set(keysAll).size === 7 && keysAll.every(k => /^layer:[a-z][a-z-]*$/.test(k))
      && onePer.every(([, c]) => c === 1) && p.rows.every(r => r.inPanel) && p.legacy === 0;
    record('t1-inspect', 'test 1: inspect() -> layers 7, unique 7, complete; 7 input[data-ky-layer] in #layers, one original per layer, no [data-layer-id]/[data-pn-layer]', t1,
      { inspect: ins, inspectErr: p.inspectErr, inputs: keysAll, onePerLayer: onePer, allInPanel: p.rows.every(r => r.inPanel), legacy: p.legacy, modules: p.modules, refused: p.refused },
      t1 ? '' : why(ins.layers !== 7 && 'inspect().layers ' + ins.layers, ins.complete !== true && 'complete ' + ins.complete, p.rows.length !== 7 && p.rows.length + ' inputs', onePer.some(([, c]) => c !== 1) && 'originals ' + JSON.stringify(onePer), p.legacy && p.legacy + ' legacy controls', p.rows.some(r => !r.inPanel) && 'an original outside #layers'));

    // test 2: the WAFER panel under the bar, full width, rows >= 44 px with the input over the row, state tags, lines OK · 344 of 346
    op = await A.openPanel(); p = op.p;
    const titleGate = p.modules.some(m => /shell/.test(m)) || !!(p.title && /^wafer$/i.test(p.title.text));
    record('t2-title', 'test 2: the WAFER title is in #bar and a tap on it opens #layers', titleGate ? !!(p.title && /^wafer$/i.test(p.title.text)) && !!(p.panel && p.panel.visible) : null,
      { title: p.title, panelOpenedBy: op.how, modules: p.modules }, titleGate ? (p.title ? '' : 'team 1 shell admitted but no WAFER title') : 'team 1 shell (kuiper-shell) not admitted; panel opened by ' + op.how);
    const pr = p.panel ? p.panel.rect : null;
    const rowsMeasured = p.rows.map(r => ({ id: r.id, h: r.rect && r.rect.height, covers: !!(r.inputRect && r.rect && r.inputRect.left <= r.rect.left + 1 && r.inputRect.top <= r.rect.top + 1 && r.inputRect.right >= r.rect.right - 1 && r.inputRect.bottom >= r.rect.bottom - 1), state: r.status, text: r.text }));
    const ln = A.row(p, 'lines'), edr = A.row(p, 'editions');
    const linesText = ln ? ln.text : '';
    const edOk = edr && /OK · \d+ of \d+ placed, \d+ beyond the rim/.test(edr.text);
    const t2 = !!(p.panel && p.panel.visible) && pr.top >= p.bar.bottom - 1 && pr.left <= 0.5 && pr.right >= p.viewport.w - 0.5
      && rowsMeasured.length === 7 && rowsMeasured.every(r => r.h >= 44 && r.covers && r.state) && /OK · 344 of 346/.test(linesText) && edOk;
    shots.OK = shots.OK || await A.shot('ok');
    record('t2-panel', 'test 2: #layers under the bar, full width, every row >= 44 px with its input over it and a state tag; lines OK · 344 of 346; editions OK · n of m placed, k beyond the rim', t2,
      { panel: p.panel, barBottom: p.bar && p.bar.bottom, viewportW: p.viewport.w, rows: rowsMeasured, lines: linesText, editions: edr && edr.text },
      t2 ? '' : why(!(p.panel && p.panel.visible) && 'panel not visible', pr && pr.top < p.bar.bottom - 1 && 'panel top ' + pr.top + ' above bar bottom ' + p.bar.bottom, pr && (pr.left > 0.5 || pr.right < p.viewport.w - 0.5) && 'panel ' + pr.left + '..' + pr.right + ' not full width ' + p.viewport.w,
        rowsMeasured.filter(r => !(r.h >= 44)).map(r => r.id + ' ' + r.h + ' px').join(', '), rowsMeasured.filter(r => !r.covers).map(r => r.id + ' input does not cover row').join(', '),
        !/OK · 344 of 346/.test(linesText) && 'lines row: ' + linesText, !edOk && 'editions row: ' + (edr && edr.text)));
    // test 2 continued: the list scrolls inside the panel; the count line; the filter and its clear control
    const scrollIn = p.panel && p.list && Math.abs(p.panel.scrollHeight - p.panel.clientHeight) <= 1 && p.list.scrollHeight > p.list.clientHeight + 1;
    const count0 = p.countLine;
    let filtered = null, cleared = null;
    if (p.find) { await A.page.evaluate(() => { const f = document.getElementById('lyFind') || document.querySelector('#ky-layers input[type=search], #layers input[type=search]'); if (f) f.scrollIntoView({ block: 'center' }); });
      await sleep(200); let q = await A.probe(); await A.tap(q.find.rect); await sleep(300); await A.page.keyboard.type('gridatlas', { delay: 25 }); await sleep(800); q = await A.probe();
      const all = q.countLine ? q.countLine.shown === FILTER_EXPECT : false;   // rows are grouped under their repository's header, so a row need not repeat the name
      filtered = { value: q.find.value, countLine: q.countLine, rows: q.lineRows, expected: FILTER_EXPECT, allMatch: all };
      if (q.clear) { await A.tap(q.clear.rect); await sleep(700); q = await A.probe(); cleared = { value: q.find.value, countLine: q.countLine, rows: q.lineRows }; } }
    const t2b = !!scrollIn && count0 && count0.shown === 344 && count0.total === 344 && filtered && filtered.countLine && filtered.countLine.shown > 0 && filtered.countLine.shown < 344 && filtered.countLine.shown === filtered.rows && filtered.allMatch
      && cleared && cleared.value === '' && cleared.countLine && cleared.countLine.shown === 344;
    record('t2-list', 'test 2: the lines list scrolls inside the panel (panel scrollHeight = clientHeight, list overflows), "344 of 344 rows", filter "gridatlas" shows exactly the Edition 4 predicate\'s count over keys.json (repo + path + title, index.html:741), clear restores 344', t2b,
      { panel: p.panel && { scrollHeight: p.panel.scrollHeight, clientHeight: p.panel.clientHeight }, list: p.list, rows: p.lineRows, countLine: count0, find: p.find, clear: p.clear, filtered, cleared },
      t2b ? '' : why(!p.list && 'no lines list ([data-i] rows) in #layers', p.list && !scrollIn && 'panel ' + p.panel.scrollHeight + '/' + p.panel.clientHeight + ', list ' + p.list.scrollHeight + '/' + p.list.clientHeight, !(count0 && count0.shown === 344 && count0.total === 344) && 'count line ' + JSON.stringify(count0), !p.find && 'no filter input', p.find && !p.clear && 'no clear control', filtered && !(filtered.countLine && filtered.countLine.shown === filtered.rows && filtered.allMatch) && 'filtered ' + JSON.stringify(filtered), cleared && !(cleared.value === '' && cleared.countLine && cleared.countLine.shown === 344) && 'cleared ' + JSON.stringify(cleared)));

    // test 3: a tap on the lines row turns the layer off (no green at edScreen(edPlaced[0])) and on again; repos with no value: OK · none lit
    await A.page.evaluate(() => { const l = document.querySelector('#ky-layers') || document.querySelector('#layers'); if (l) l.scrollTop = 0; const s = document.getElementById('lineslist'); if (s) s.scrollTop = 0; });
    const before = await A.page.evaluate(sparksFn, PLACED_KEYS); const h0 = await A.probe();
    p = await A.tapRow('lines'); await sleep(1200); p = await A.probe();
    const off = await A.page.evaluate(sparksFn, PLACED_KEYS); const lOff = A.row(p, 'lines');
    const hudOff = p.hud || '', offUrl = p.url.layers, offOn = (p.inspect || {}).on;
    p = await A.tapRow('lines'); await sleep(1200); p = await A.probe();
    const on = await A.page.evaluate(sparksFn, PLACED_KEYS); const lOn = A.row(p, 'lines');
    const t3all = !!(before.first && before.first.greenPx > 0 && lOff && lOff.get && lOff.get.on === false && /verified lines layer off/i.test(hudOff)
      && off.first && off.first.greenPx === 0 && off.green === 0 && lOn && lOn.get && lOn.get.on === true && /OK/.test(lOn.status || '') && on.first && on.first.greenPx > 0);
    record('t3-toggle', 'test 3: tap the lines row: get(lines).on false, readout "verified lines layer off", no green at edScreen(edPlaced[0]); tap again: OK and green returns', t3all,
      { before: before, off: { on: lOff && lOff.get && lOff.get.on, row: lOff && lOff.text, sparks: off, url: offUrl, inspectOn: offOn }, readoutHasOff: /verified lines layer off/i.test(hudOff), on: { on: lOn && lOn.get && lOn.get.on, row: lOn && lOn.text, sparks: on } },
      t3all ? '' : why(!(before.first && before.first.greenPx > 0) && 'no green at the first spark before the tap ' + JSON.stringify(before.first || before.error), lOff && lOff.get && lOff.get.on !== false && 'get(lines).on after tap = ' + (lOff.get && lOff.get.on), off.first && off.first.greenPx !== 0 && 'first spark still green when off', off.green && off.green + ' sparks still green when off', !/verified lines layer off/i.test(hudOff) && 'readout lacks "verified lines layer off"', !(lOn && lOn.get && lOn.get.on === true && /OK/.test(lOn.status || '')) && 'after second tap: ' + (lOn && lOn.text), !(on.first && on.first.greenPx > 0) && 'green did not return at the first spark'));
    const e0 = A.errors.length;
    p = await A.tapRow('repos'); await sleep(1000); p = await A.probe(); const rp = A.row(p, 'repos');
    const sparksRepo = await A.page.evaluate(sparksFn, PLACED_KEYS);
    const t3r = rp && rp.get && rp.get.on === true && /OK · none lit/.test(rp.text) && A.errors.length === e0 && sparksRepo.green === on.green;
    record('t3-repos', 'test 3: tap the repos row with no value: OK · none lit, nothing new drawn, no error', t3r,
      { row: rp && rp.text, on: rp && rp.get && rp.get.on, value: rp && rp.get && rp.get.value, newErrors: A.errors.slice(e0), greenBefore: on.green, greenAfter: sparksRepo.green },
      t3r ? '' : why(!(rp && /OK · none lit/.test(rp.text)) && 'repos row: ' + (rp && rp.text), A.errors.length !== e0 && (A.errors.length - e0) + ' new error(s)', sparksRepo.green !== on.green && 'green sparks ' + on.green + ' -> ' + sparksRepo.green));
    // test 6 (part): every toggle above was written to the URL by history.replaceState: no reload, no history entry
    const urlNow = p.url.layers, onNow = (p.inspect || {}).on || [];
    const urlEq = (param, onList) => (param == null || param === '' ? [] : param.split(',')).join(',') === (onList || []).join(',');
    const t6w = urlEq(offUrl, offOn) && urlEq(urlNow, onNow) && p.marker === h0.marker && p.historyLength === h0.historyLength && !(offUrl || '').split(',').includes('lines') && (urlNow || '').split(',').includes('repos');
    record('t6-written', 'test 6: each toggle is written to the URL (layers=<on ids, in order>) with history.replaceState: same document, history.length unchanged', t6w,
      { afterLinesOff: { url: offUrl, on: offOn }, afterReposOn: { url: urlNow, on: onNow, href: p.url.href }, historyLength: [h0.historyLength, p.historyLength], sameDocument: p.marker === h0.marker },
      t6w ? '' : why(!urlEq(offUrl, offOn) && 'after lines off the URL says ' + offUrl + ', inspect().on ' + JSON.stringify(offOn), !urlEq(urlNow, onNow) && 'after repos on the URL says ' + urlNow + ', on ' + JSON.stringify(onNow), p.marker !== h0.marker && 'the page reloaded', p.historyLength !== h0.historyLength && 'history.length ' + h0.historyLength + ' -> ' + p.historyLength));
    p = await A.tapRow('repos'); await sleep(600);

    // test 8: the app rows: present, EMPTY/REFUSED with a why; see-through first of THE APPS and the largest label in the panel
    p = await A.probe();
    const apps = APPS.map(id => A.row(p, id));
    const order = p.rows.map(r => r.id);
    const firstApp = order.find(id => { const r = A.row(p, id); const g = r && r.get && r.get.group; return g ? /apps/i.test(g) : APPS.includes(id); });
    const st = A.row(p, 'see-through');
    const otherMax = Math.max(...p.rows.filter(r => r.id !== 'see-through').map(r => r.maxFont));
    const appOk = r => !!r && ((r.status === 'EMPTY' || r.status === 'REFUSED') && r.why.length > 0 || (r.id === 'see-through' && r.status === 'OK'));
    const elementsRefused = apps[1] && apps[1].status === 'REFUSED' && /licence/i.test(apps[1].why);
    const t8 = apps.every(appOk) && p.rows.every(r => r.text && r.status) && firstApp === 'see-through' && st && st.maxFont > otherMax && st.maxFont >= p.panel.maxFont && elementsRefused;
    record('t8-apps', 'test 8: see-through, elements, spider rows present with EMPTY/REFUSED and a why (elements REFUSED · licence unsettled, Q1); see-through first of THE APPS and the largest label in the panel', t8,
      { rows: apps.map(r => r && [r.id, r.status, r.why]), order, firstOfApps: firstApp, fontPx: { seeThrough: st && st.maxFont, largestOtherRow: otherMax, largestInPanel: p.panel && p.panel.maxFont } },
      t8 ? '' : why(apps.some(r => !appOk(r)) && 'app rows: ' + apps.map(r => r ? r.id + '=' + r.text : 'missing').join(' | '), !elementsRefused && 'elements row is not REFUSED · licence…', firstApp !== 'see-through' && 'first of THE APPS is ' + firstApp, st && !(st.maxFont > otherMax) && 'see-through label ' + st.maxFont + ' px, another row ' + otherMax + ' px', st && p.panel && st.maxFont < p.panel.maxFont && 'something in the panel is larger: ' + p.panel.maxFont + ' px'));
    await A.closePanel();
    p = await A.probe();
    record('a-console', 'scenario A: zero console errors, zero page errors, zero failed requests', A.errors.length === 0, errFree(A, { keysJsonRequests: Object.entries(A.requests).filter(([u]) => /keys\.json/.test(u)) }), A.errors.length ? A.errors.length + ' error(s): ' + A.errors[0].text : '');
    await A.close();

    // ============================================================ B, C, D: the link restores the layers (hash, query, through the pointer)
    const pointerSrc = fs.readFileSync(path.join(REPO, 'editions/index.html'), 'utf8');
    const target = (pointerSrc.match(/location\.replace\('(\d{12})\//) || [])[1];
    const substituted = pointerSrc.split(target).join(STAMP), nSub = pointerSrc.split(target).length - 1;
    const links = [
      ['t6-hash', 'test 6: editions/' + STAMP + '/#layers=lines,periods restores on = [periods, lines]; untick periods writes layers=lines, no reload', ED_URL + '#layers=lines,periods', []],
      ['t6-query', 'test 6: editions/' + STAMP + '/?layers=lines,periods restores on = [periods, lines]; untick periods writes layers=lines, no reload', ED_URL + '?layers=lines,periods', []],
      ['t6-pointer', 'test 6: through the pointer editions/#layers=lines,periods (pointer stamp ' + target + ' moved to ' + STAMP + ', as the integrator moves it; editions/index.html:7,:11,:12) restores the layers', ROOT + 'editions/#layers=lines,periods',
        target === STAMP ? [] : [[new RegExp('/editions/(index\\.html)?(\\?[^#]*)?$'), r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: substituted })]]],
    ];
    for (const [id, name, url, routes] of links) {
      const S = await open(id, url, { routes });
      p = await S.until(q => q.hasLayers && S.settled(q), STATE_MAX); await sleep(FIXED_WAIT); p = await S.probe();
      const on0 = (p.inspect || {}).on, landed = p.url.href, h1 = p;
      let after = null;
      let h1b = h1; if (p.hasLayers) { await S.openPanel(); await sleep(2500); h1b = await S.probe();   /* lead 22:55: the page's back-gesture entry (04 patch edSync) is pushed on the next drawn frame; measure after it */ after = await S.tapRow('periods'); await sleep(800); after = await S.probe(); }   // h1b: after the panel opened (opening it may push the back-gesture entry)
      const ok = JSON.stringify(on0) === JSON.stringify(['periods', 'lines']) && after && after.url.layers === 'lines' && JSON.stringify((after.inspect || {}).on) === JSON.stringify(['lines']) && after.marker === h1.marker && after.historyLength === h1b.historyLength && S.errors.length === 0;
      record(id, name, ok, { opened: url, landed, pointer: id === 't6-pointer' ? { liveTarget: target, substitutions: nSub } : undefined, onAtLoad: on0, afterUntick: after && { url: after.url.layers, href: after.url.href, on: (after.inspect || {}).on }, sameDocument: after && after.marker === h1.marker, historyLength: after && { atLoad: h1.historyLength, panelOpen: h1b.historyLength, afterUntick: after.historyLength }, ...errFree(S) },
        ok ? (id === 't6-pointer' && target !== STAMP ? 'pointer still names ' + target + ' (Edition 4); measured with the stamp moved' : '') : why(!p.hasLayers && 'KY.layers absent at ' + landed, JSON.stringify(on0) !== '["periods","lines"]' && 'on at load ' + JSON.stringify(on0), after && after.url.layers !== 'lines' && 'after untick the URL says layers=' + after.url.layers, after && after.marker !== h1.marker && 'reloaded', after && after.historyLength !== h1b.historyLength && 'history.length ' + h1b.historyLength + ' -> ' + after.historyLength + ' on the untick (a push, not replaceState)', after && JSON.stringify((after.inspect || {}).on) !== '["lines"]' && 'on after untick ' + JSON.stringify((after.inspect || {}).on), S.errors.length && S.errors.length + ' console error(s): ' + S.errors[0].text));
      await S.close();
    }

    // ============================================================ E: ?selftest=repo:gridatlas, then "/" gridatlas Enter, then set('repos', true)
    {
      const E = await open('E-selftest', ED_URL + '?selftest=repo:gridatlas');
      p = await E.until(q => q.selftest && 'PASS' in q.selftest, STATE_MAX); const st0 = p.selftest;
      p = await E.until(E.settled, STATE_MAX); await sleep(1500);
      await E.page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
      await E.page.keyboard.press('/'); await sleep(300); await E.page.keyboard.type('gridatlas', { delay: 25 }); await E.page.keyboard.press('Enter'); await sleep(2500);
      p = await E.probe(); const r1 = E.row(p, 'repos');
      const setRes = await E.page.evaluate(() => { try { ((window.KY.modules.layers && window.KY.modules.layers.api) || window.__KUIPER_LAYERS__).set('repos', true); return 'ok'; } catch (e) { return 'threw ' + e.message; } }); await sleep(2000);
      p = await E.probe(); const r2 = E.row(p, 'repos');
      const t7 = st0 && st0.PASS === true && r1 && /OK · gridatlas/.test(r1.text) && r1.get && r1.get.on === true && r1.get.value === 'gridatlas' && setRes === 'ok' && r2 && /OK · gridatlas/.test(r2.text) && p.selftest && p.selftest.PASS === true && E.errors.length === 0;
      const scope = await E.page.evaluate(() => { const el = document.querySelector('#scope, [data-panel-name="scope"]'); return el ? (el.textContent || '').replace(/\s+/g, ' ').slice(0, 200) : null; });
      record('t7-repos', 'test 7: ?selftest=repo:gridatlas PASS; "/" gridatlas Enter -> repos row OK · gridatlas (value gridatlas, on); KY.layers.set(repos, true) keeps PASS', t7,
        { selftestAtLoad: st0 && { PASS: st0.PASS }, afterSlash: r1 && { row: r1.text, on: r1.get && r1.get.on, value: r1.get && r1.get.value }, set: setRes, afterSet: r2 && r2.text, selftestAfter: p.selftest && p.selftest.PASS, scopePanel: scope || 'no SCOPE panel (team 1 shell not admitted): not evaluated', ...errFree(E) },
        t7 ? '' : why(!(st0 && st0.PASS === true) && 'selftest ' + JSON.stringify(st0 && { PASS: st0.PASS, error: st0.error }), !(r1 && /OK · gridatlas/.test(r1.text)) && 'after "/" the repos row reads ' + (r1 && r1.text), r1 && r1.get && r1.get.value !== 'gridatlas' && 'value ' + r1.get.value, setRes !== 'ok' && 'set ' + setRes, E.errors.length && E.errors.length + ' error(s): ' + E.errors[0].text));
      await E.close();
    }

    // ============================================================ F: keys.json served as HTTP 404
    {
      const F = await open('F-keys-404', ED_URL, { routes: [[keysRe, r => r.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' })]], allow: [/keys(-min)?\.json/] });
      p = await F.until(F.settled, STATE_MAX); await sleep(FIXED_WAIT); p = await F.probe();
      const lr = F.row(p, 'lines');
      const png = await engineShot(F); const disc = png ? await waferDisc(F.page, png, p.bar ? p.bar.bottom : 0) : { error: 'screenshot failed' }; const cover = await alertCover(F.page);
      const cam0 = p.cam; await F.page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
      await F.page.keyboard.press('e'); await sleep(2500); const pe = await F.probe();
      const noFly = cam0 && pe.cam && Math.abs(cam0.x - pe.cam.x) < 1e-6 && Math.abs(cam0.y - pe.cam.y) < 1e-6 && cam0.zoom === pe.cam.zoom && !pe.card;
      const alertOk = p.refuse && p.refuse.role === 'alert' && p.refuse.visible && p.refuse.rect.top >= 0 && p.refuse.rect.bottom <= p.viewport.h;
      const pageErrors = F.errors.filter(e => e.kind === 'pageerror').length;
      const t4 = lr && /FAIL · keys\.json HTTP 404/.test(lr.text) && /KEYS\.JSON DID NOT LOAD/.test((p.big || '').toUpperCase()) && alertOk && disc.litFraction > 0.03 && pageErrors === 0 && F.errors.length === 0 && noFly;
      await F.openPanel(); await F.intoView('lines'); await sleep(400); shots.FAIL = shots.FAIL || await F.shot('fail-keys-404'); const pf = await F.probe();
      record('t4-keys-404', 'test 4: keys.json HTTP 404 -> lines row FAIL · keys.json HTTP 404, #big KEYS.JSON DID NOT LOAD, #refuse[role=alert] visible, wafer still drawn (engine pixels, DOM layers hidden for the shot), pageerror 0, e does not fly', t4,
        { row: lr && lr.text, big: p.big, refuse: p.refuse, alertCoversWafer: cover, wafer: disc, camBefore: cam0, camAfterE: pe.cam, cardAfterE: pe.card, pageErrors, ...errFree(F), allowedErrors: F.allowed.map(e => e.text + ' ' + e.url) },
        t4 ? '' : why(!(lr && /FAIL · keys\.json HTTP 404/.test(lr.text)) && 'lines row: ' + (lr && lr.text), !/KEYS\.JSON DID NOT LOAD/.test((p.big || '').toUpperCase()) && '#big: ' + p.big, !alertOk && '#refuse: ' + JSON.stringify(p.refuse), !(disc.litFraction > 0.03) && 'wafer not drawn: ' + JSON.stringify(disc), pageErrors && pageErrors + ' pageerror(s)', F.errors.length && F.errors.length + ' unexpected console error(s): ' + F.errors[0].text, !noFly && 'e moved the camera or opened a card'));
      for (const r of pf.rows) if (r.status) seen.add(r.status);
      await F.close();
    }

    // ============================================================ G: keys.json with one byte changed
    {
      const G = await open('G-keys-tampered', ED_URL, { routes: [[keysRe, r => r.fulfill({ status: 200, contentType: 'application/json', body: TAMPERED.buf })]] });
      p = await G.until(G.settled, STATE_MAX); await sleep(FIXED_WAIT); p = await G.probe();
      const lr = G.row(p, 'lines'); const sp = await G.page.evaluate(sparksFn, PLACED_KEYS);
      const png = await engineShot(G); const disc = png ? await waferDisc(G.page, png, p.bar ? p.bar.bottom : 0) : { error: 'screenshot failed' }; const cover = await alertCover(G.page);
      const alertOk = p.refuse && p.refuse.role === 'alert' && p.refuse.visible && p.refuse.rect.top >= 0 && p.refuse.rect.bottom <= p.viewport.h;
      const t5 = lr && /FAIL · sha256 mismatch/.test(lr.text) && sp.green === 0 && sp.onCanvas > 0 && alertOk && disc.litFraction > 0.03 && G.errors.length === 0;
      record('t5-keys-tampered', 'test 5: keys.json with one byte changed (same length, valid JSON) -> FAIL · sha256 mismatch, zero sparks at the 344 places, alert visible, wafer still drawn, zero console errors', t5,
        { tamper: { offset: TAMPERED.offset, from: TAMPERED.from, to: TAMPERED.to, sha256Served: TAMPERED.sha, sha256Original: TAMPERED.shaOriginal }, row: lr && lr.text, sparks: sp, refuse: p.refuse, alertCoversWafer: cover, big: p.big, wafer: disc, ...errFree(G) },
        t5 ? '' : why(!(lr && /FAIL · sha256 mismatch/.test(lr.text)) && 'lines row: ' + (lr && lr.text), sp.green && sp.green + ' green sparks drawn from tampered data', !alertOk && '#refuse: ' + JSON.stringify(p.refuse), !(disc.litFraction > 0.03) && 'wafer not drawn: ' + JSON.stringify(disc), G.errors.length && G.errors.length + ' console error(s): ' + G.errors[0].text));
      await G.close();
    }

    // ============================================================ H: cosmos/wafer.tsv served as HTTP 404 (test 7b)
    {
      const H = await open('H-wafer-404', ED_URL, { routes: [[waferRe, r => r.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' })]], allow: [/wafer\.tsv/] });
      p = await H.until(q => q.hasLayers && q.rows.length >= 7 && q.rows.every(r => r.status && r.status !== 'WAIT' && r.status !== 'LOAD'), 60000); await sleep(FIXED_WAIT); p = await H.probe();
      await H.openPanel(); await sleep(300); shots.REFUSED = shots.REFUSED || await H.shot('refused-wafer-404'); const ph = await H.probe();
      const allRef = p.rows.length === 7 && p.rows.every(r => r.status === 'REFUSED' && /the wafer refused: \.\.\/\.\.\/cosmos\/wafer\.tsv did not load/.test(r.why));
      const pageErrors = H.errors.filter(e => e.kind === 'pageerror').length;
      const t7b = allRef && !!p.bar && p.refuse && p.refuse.role === 'alert' && p.refuse.visible && pageErrors === 0 && H.errors.length === 0;
      record('t7b-wafer-404', 'test 7b: cosmos/wafer.tsv HTTP 404 -> every row REFUSED · the wafer refused: ../../cosmos/wafer.tsv did not load…, bar and alert present, pageerror 0', t7b,
        { rows: p.rows.map(r => [r.id, r.status, r.why]), bar: p.bar, refuse: p.refuse, panelAfter: ph.panel && ph.panel.visible, pageErrors, ...errFree(H), allowedErrors: H.allowed.map(e => e.text + ' ' + e.url) },
        t7b ? '' : why(!allRef && 'rows: ' + p.rows.map(r => r.id + '=' + r.text).join(' | '), !(p.refuse && p.refuse.visible) && '#refuse not visible', pageErrors && pageErrors + ' pageerror(s)', H.errors.length && H.errors.length + ' unexpected error(s): ' + H.errors[0].text));
      await H.close();
    }

    // every state the registry knows was shown in a row on this device
    const want = ['WAIT', 'LOAD', 'OK', 'EMPTY', 'FAIL', 'REFUSED'];
    record('states-shown', '3.4: WAIT, LOAD, OK, EMPTY, FAIL and REFUSED were each shown in a row (across the scenarios)', want.every(s => seen.has(s)), { seen: [...seen] }, want.filter(s => !seen.has(s)).length ? 'never shown: ' + want.filter(s => !seen.has(s)).join(', ') : '');
  } catch (e) {
    record('harness', 'harness error', false, { error: String(e && e.stack || e) }, String(e && e.message || e));
  }
  report.pass = steps.every(s => s.pass !== false); report.passed = steps.filter(s => s.pass === true).length; report.failed = steps.filter(s => s.pass === false).length; report.notEvaluated = steps.filter(s => s.pass === null).length;
  report.finishedAt = new Date().toISOString();
  return report;
}

// ------------------------------------------------------------------ test 9: device-independent, from disk
function staticChecks() {
  const steps = []; const rec = (id, name, pass, measured, note) => { steps.push({ id, name, pass: !!pass, status: pass ? 'PASS' : 'FAIL', measured, note: note || '' }); process.stderr.write(`[static] ${pass ? 'PASS' : 'FAIL'} ${id}${note ? ' — ' + note : ''}\n`); };
  let ci = null, tries = 0;
  while (tries++ < 4) { try { ci = cp.execFileSync('python3', ['tools/ci_check.py'], { cwd: REPO, encoding: 'utf8', timeout: 300000, stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { ci = String(e.stdout || '') + String(e.stderr || '') + ' (exit ' + e.status + ')'; }
    if (!/FileNotFoundError[^\n]*\.ci-|FileExistsError[^\n]*\.ci-/.test(ci)) break; cp.execFileSync('sleep', [String(5 + Math.floor(Math.random() * 20))]); }   // another run's temp file at the repo root (tools/ci_check.py:77)
  rec('t9-ci', 'test 9: python3 tools/ci_check.py prints RESULT: PASS', /RESULT: PASS/.test(ci), { tail: ci.trim().split('\n').slice(-5), tries }, /RESULT: PASS/.test(ci) ? '' : ci.trim().split('\n').slice(-1)[0]);
  const mods = fs.readdirSync(path.join(ED_DIR, 'modules')).filter(f => /^\d{12}-layers\.js$/.test(f));
  let nc = null; if (mods.length === 1) { try { cp.execFileSync(process.execPath, ['--check', path.join(ED_DIR, 'modules', mods[0])], { stdio: 'pipe' }); nc = 'exit 0'; } catch (e) { nc = String(e.stderr || e.message).split('\n').slice(0, 4).join(' '); } }
  const modBytes = mods.length === 1 ? fs.readFileSync(path.join(ED_DIR, 'modules', mods[0])) : null;
  const regs = modBytes ? (modBytes.toString('utf8').match(/KY\.register\(/g) || []).length : 0;
  rec('t9-module', 'test 9: exactly one modules/<stamp>-layers.js, node --check exits 0, exactly one KY.register(', mods.length === 1 && nc === 'exit 0' && regs === 1, { files: mods, nodeCheck: nc, registers: regs, sha256: modBytes && sha256(modBytes), bytes: modBytes && modBytes.length },
    mods.length !== 1 ? mods.length + ' layers modules' : (nc !== 'exit 0' ? nc : (regs !== 1 ? regs + ' KY.register( calls' : '')));
  let man = null, manErr = null; try { man = JSON.parse(fs.readFileSync(path.join(ED_DIR, 'data/layers.json'), 'utf8')); } catch (e) { manErr = e.message; }
  const palette = (fs.readFileSync(path.join(REPO, 'PALETTE.md'), 'utf8').match(/#[0-9a-fA-F]{6}\b/g) || []).map(s => s.toLowerCase());
  const L = man && Array.isArray(man.layers) ? man.layers : [];
  const recIds = L.map(r => r.id);
  const schemaOk = man && man.schema === 'kuiper.layers.v1' && L.length === 7 && JSON.stringify(man.order) === JSON.stringify(IDS) && IDS.every(id => recIds.filter(x => x === id).length === 1)
    && L.every(r => r.key === 'layer:' + r.id && r.label && r.group && palette.includes(String(r.colour).toLowerCase()) && r.meaning && r.licence && r.source);
  rec('t9-records', 'test 9: data/layers.json kuiper.layers.v1: seven records, order periods..spider, key layer:<id>, label, group, colour from PALETTE.md with its meaning, licence, source', !!schemaOk,
    { error: manErr, schema: man && man.schema, order: man && man.order, records: L.map(r => ({ id: r.id, key: r.key, group: r.group, colour: r.colour, licence: !!r.licence, source: r.source })), palette },
    schemaOk ? '' : (manErr || 'records: ' + JSON.stringify(L.map(r => [r.id, r.key, r.colour, !!r.licence, !!r.meaning]))));
  const NOT_LAYER_DATA = ['apps.json'];
  const hashes = []; let hashOk = L.length > 0;
  for (const r of L) for (const src of [r.source, r.source && r.source.fallback].filter(Boolean)) { const f = src.file; if (!f) continue; const fp = path.resolve(ED_DIR, f); let b = null; try { b = fs.readFileSync(fp); } catch (e) {}
    const h = b && sha256(b), ok = !!b && h === src.sha256 && (src.bytes == null || src.bytes === b.length); if (!ok) hashOk = false;
    hashes.push({ id: r.id, file: f, exists: !!b, sha256: h, record: src.sha256, bytes: b && b.length, recordBytes: src.bytes, ok }); }
  const dataFiles = fs.existsSync(path.join(ED_DIR, 'data')) ? fs.readdirSync(path.join(ED_DIR, 'data')).filter(f => f.endsWith('.json') && f !== 'layers.json' && !NOT_LAYER_DATA.includes(f)) : [];
  // lead: data files of other steps that are not layer sources (ROADMAP step 7 files: apps.json is the launcher registry)
  const unrecorded = dataFiles.filter(f => !L.some(r => r.source && r.source.file && path.resolve(ED_DIR, r.source.file) === path.join(ED_DIR, 'data', f)));
  rec('t9-hashes', 'test 9: every record with a source file hashes to its sha256 and bytes; every data/*.json (but layers.json) is some record\'s source', hashOk && unrecorded.length === 0, { hashes, dataFiles, unrecorded },
    why2(!hashOk && 'mismatch: ' + JSON.stringify(hashes.filter(h => !h.ok).map(h => [h.id, h.file, h.exists ? 'sha ' + String(h.sha256).slice(0, 12) + ' vs ' + String(h.record).slice(0, 12) + ', bytes ' + h.bytes + ' vs ' + h.recordBytes : 'missing'])), unrecorded.length && 'no record names data/' + unrecorded.join(', data/')));
  const msf = path.join(HERE, 'MODULE.sha256'); let ms = null; if (fs.existsSync(msf)) ms = fs.readFileSync(msf, 'utf8');
  const msOk = ms && modBytes && ms.includes(sha256(modBytes)) && ms.includes(mods[0]);
  rec('t9-module-sha', 'hand-off: MODULE.sha256 names the module file and its measured sha256', !!msOk, { file: ms && ms.trim(), measured: modBytes && sha256(modBytes) }, ms ? (msOk ? '' : 'MODULE.sha256 does not match the module bytes') : 'no MODULE.sha256 in handoff/03-layers/');
  return steps;
}
function why2(...a) { return a.filter(Boolean).join('; '); }

// ------------------------------------------------------------------ hand-off artefacts: img/ (<= 4 PNG, each < 300 KB) and TEST.md
function writeImages(shots) {
  const img = path.join(HERE, 'img'); fs.mkdirSync(img, { recursive: true }); const out = {};
  for (const k of ['WAIT', 'OK', 'FAIL', 'REFUSED']) { const src = shots[k]; if (!src || !fs.existsSync(src)) { out[k] = 'missing'; continue; }
    const dst = path.join(img, k + '.png'); fs.copyFileSync(src, dst);
    if (fs.statSync(dst).size >= 300 * 1024) { try { cp.execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB").quantize(colors=128)\nim.save(sys.argv[1],optimize=True)', dst], { stdio: 'pipe' }); } catch (e) {} }
    out[k] = fs.statSync(dst).size; }
  return out;
}
function writeTestMd(out) {
  const devs = out.devices.map(d => d.device);
  const ids = []; for (const d of out.devices) for (const s of d.steps) if (!ids.find(x => x.id === s.id)) ids.push({ id: s.id, name: s.name });
  const cell = (d, id) => { const s = d.steps.find(x => x.id === id); return s ? s.status + (s.note ? ': ' + s.note.replace(/\|/g, '/').slice(0, 220) : '') : 'not run'; };
  const L = [];
  L.push('# Opus team 3, step 3 the layer registry: TEST.md');
  L.push('');
  L.push((out.preIntegration ? '**PRE-INTEGRATION RUN** (served with ' + [OVR_INDEX && '--index ' + flags['--index'], OVR_MANIFEST && '--manifest ' + flags['--manifest']].filter(Boolean).join(', ') + '): not a hand-off pass. ' : '') + 'Verdict: **' + (out.pass ? 'PASS' : 'FAIL') + '** — written by `test.cjs` at ' + out.generatedAt + ' from ' + out.url + ' (kuiper-belt ' + out.head + ').');
  L.push('');
  L.push('Run: `node editions/' + STAMP + '/handoff/03-layers/test.cjs http://127.0.0.1:8432/ /tmp/nl010-opus/team-3/tester/out --handoff` from the repository root served by `python3 -m http.server 8432 --bind 127.0.0.1`. Playwright, harness GL flags, `devices[\'Pixel 7\']` and `devices[\'Galaxy S24\']`, real touch (`page.touchscreen.tap`), 6.5 s after load. Failures are served by Playwright routes only (keys.json 404, keys.json with byte ' + TAMPERED.offset + ' changed `' + TAMPERED.from + '`→`' + TAMPERED.to + '` (sha256 ' + TAMPERED.sha.slice(0, 12) + '… against ' + TAMPERED.shaOriginal.slice(0, 12) + '…), cosmos/wafer.tsv 404, cosmos/wafer.tsv and keys.json held to show WAIT and LOAD); no file on disk is changed. The one allowed console line in F and H is Chromium\'s own `Failed to load resource … 404` for the file served 404.');
  L.push('');
  L.push('Governing text: neural-link FIXES/NL-010/ROADMAP.md step 3 "Acceptance test on Android" 1–9; team-2/STEPS.md 3.1–3.8 and its tests (:248-287).');
  L.push('');
  L.push('| assertion | what is measured | ' + devs.join(' | ') + ' |');
  L.push('|---|---|' + devs.map(() => '---|').join(''));
  for (const { id, name } of ids) L.push('| `' + id + '` | ' + name.replace(/\|/g, '/') + ' | ' + out.devices.map(d => cell(d, id)).join(' | ') + ' |');
  L.push('');
  L.push('Device-independent (test 9 and the hand-off):');
  L.push('');
  L.push('| assertion | what is measured | result |');
  L.push('|---|---|---|');
  for (const s of out.static) L.push('| `' + s.id + '` | ' + s.name.replace(/\|/g, '/') + ' | ' + s.status + (s.note ? ': ' + s.note.replace(/\|/g, '/').slice(0, 300) : '') + ' |');
  L.push('');
  L.push('Console errors per device and scenario: ' + out.devices.map(d => d.device + ' ' + Object.entries(d.scenarios).map(([k, v]) => k + ' ' + v.consoleErrors.length).join(', ')).join('; ') + '.');
  L.push('');
  L.push('Screenshots (first device): ' + Object.entries(out.images || {}).map(([k, v]) => '`img/' + k + '.png` ' + (typeof v === 'number' ? (v / 1024).toFixed(0) + ' KB' : v)).join(', ') + '. Every device\'s screenshots and `report.json` are in ' + out.outdir + '.');
  L.push('');
  L.push('The tester refuses the hand-off until every row reads PASS on both devices in a run without `--index`/`--manifest`; a NOT EVALUATED row names the other team whose module it waits for.');
  fs.writeFileSync(path.join(HERE, 'TEST.md'), L.join('\n') + '\n');
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let head = null; try { head = cp.execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim(); } catch (e) {}
  const out = { url: ED_URL, outdir: OUT, head, preIntegration: PRE, generatedAt: new Date().toISOString(), devices: [], static: [] };
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const shots = {};
  try { for (const d of DEVICES) { const s = d === DEVICES[0] ? shots : {}; out.devices.push(await runDevice(browser, d, s)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1)); } }
  finally { await browser.close(); }
  out.static = staticChecks();
  if (flags['--handoff']) out.images = writeImages(shots);
  out.pass = !PRE && out.devices.every(d => d.pass && d.notEvaluated === 0) && out.static.every(s => s.pass);
  out.summary = out.devices.map(d => ({ device: d.device, passed: d.passed, failed: d.failed, notEvaluated: d.notEvaluated, failedSteps: d.steps.filter(s => s.pass === false).map(s => s.id), notEvaluatedSteps: d.steps.filter(s => s.pass === null).map(s => s.id) })).concat([{ device: 'static', failedSteps: out.static.filter(s => !s.pass).map(s => s.id) }]);
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1));
  if (flags['--handoff']) writeTestMd(out);
  console.log(JSON.stringify(out.summary, null, 1));
  console.log('RESULT: ' + (out.pass ? 'PASS' : 'FAIL') + (PRE ? ' (pre-integration run: never a hand-off pass)' : ''));
  process.exit(out.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
