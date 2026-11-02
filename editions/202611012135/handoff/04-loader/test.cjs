#!/usr/bin/env node
// test.cjs: NL-010 step 4 "the Kuiper cartridge law", tests 1-9, with the NL-009 round-1 probes the loader patch folds in.
// Opus team 4 tester (ROADMAP.md step 4; team-2/STEPS.md step 4 "Acceptance test on Android"; OPUS-BRIEF.md "Testing").
//
//   node test.cjs [--devices "Pixel 7,Galaxy S24"] [--patch FILE | --html FILE] [--port 8442]
//                 [--scratch DIR] [--out DIR] [--only c1,c2,...] [--skip-probes] [--base FILE] [--with-committed]
// Apache-2.0 (kuiper-belt), kuiper-belt README.md:157.
//
// 1. A scratch copy, never the repository: <scratch>/root/editions/<stamp>/ is a copy of the edition folder (handoff/
//    left out), ../../cosmos is a symlink to the repository's cosmos/, its index.html is the edition page with
//    handoff/04-loader/index.html.patch applied (--html takes an already patched page; an edition page that already
//    carries the hook table is used as is), its modules/ adds four test modules (probe-a, probe-b, probe-c,
//    probe-wafer), and its modules.json lists team 4's first record set (hello) and the probes, in that order
//    (--with-committed puts the committed manifest's records first: an integration run, reported apart). The scratch root is served with python3 -m http.server on 127.0.0.1:<port> (team 4 tester: 8442).
// 2. Cases, each in a fresh context on each device (Pixel 7 412 px, Galaxy S24 360 px; real touch through
//    page.touchscreen.tap and CDP Input.dispatchTouchEvent; mutations are served through page.route, nothing written):
//    c0  MODULE.sha256 matches the files; the loader reference ≡ the patched page between its marker lines
//    c1  test 1: every order entry admitted in order with the manifest's sha256, refused [], no alert, one readout line
//        per module (READOUT opened by touch), one blob <script data-ky-module> each, nothing under modules/ fetched
//        outside order, the admitted modules draw, the wafer is drawn
//    c2  test 2: one byte changed in the served hello → 'sha256 mismatch', the rest admitted and drawing,
//        #refuse[role=alert] inside the viewport (360 px on the S24), wafer drawn, bar present
//    c3  test 3: probe-a requires 'noSuchHook' → 'missing hook noSuchHook', #ky-probe-a absent, probe-b (requires
//        probe-a) → 'missing hook probe-a', the rest admitted
//    c4  test 4: probe-a served as 202611012201-probe-a.js (generation 202611012200) → refused '… generation
//        202611012200, file name 202611012201'; served as probe-a.js (no leading digits) → admitted
//    c5  test 5: hello's install throws Error('test') → 'install threw test', the rest admitted
//    c6  test 6: hello served as HTTP 404 → 'HTTP 404', the rest admitted
//    c7  test 7: modules.json emptied → wafer and bar present, admitted [], refused [], no alert, KY and its members
//        frozen, Object.keys(KY.hooks) = the 28 names of HOOKS.md in order, __KUIPER_MODULES__ === KY.modules
//    c7b test 7, second half: ../../cosmos/wafer.tsv held, then 404 → the loader finished while the wafer was pending,
//        hello and probe-wafer admitted, KY.hooks.wafer rejects with the engine's words, the page shows them
//    c8  test 8: tools/edition_check.py (from handoff/04-loader/edition_check.py.patch while the tool is not in the
//        repository) E1-E8 PASS on a copy of the folder with team 4's records, FAIL (exit 1) on each mutation
//    c9  test 9: load → last admitted (ms) and Σ bytes against Σ byte_budget, recorded, no threshold
//    c10 the builder's five (loader rev 2, OPUS-4 builder's request; builder/proto-test.cjs): a module with a syntax
//        error, a module that registers then throws at top level, requires as a string (in the record, and in the
//        registration), a null record in modules, an id listed twice in order; each refused in words (or, for the
//        null record, skipped) with the rest admitted and zero pageerrors
//    T*  NL-009 round1 04-touch (04-touch.md TEST; 04-touch-harness.cjs): T1 T2 T2b T2c T3 T4 T5a T5b T5e T6a T6b T6d
//        T6f T6g T7, on the page with the full manifest and the harness's probe appended to the served copy
//    R*  NL-009 round1 09-robust (09-robust.md TEST 1-8): R1 R2 R3 R4 R5 R6 R7 R8
// 3. Console errors and pageerrors: zero in every case, except the browser's own "Failed to load resource … 404" line
//    for the one URL a case serves as 404 on purpose (c6 hello, c7b wafer.tsv, R5 keys.json) and the engine's
//    deliberate 'WebGL2 is not available' throw in R6 (09-robust.md:21-25); those are counted and reported.
// Output: <out>/report.json and <out>/<device>/NN-<case>.png. Exit 0 when every check on every device passed, 1
// otherwise, 2 on a harness error. Licence: Apache-2.0 (kuiper-belt code, kuiper-belt README.md:157).
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process'), http = require('http');

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : null; };
const HERE = flag('--handoff') ? path.resolve(String(flag('--handoff'))) : __dirname;
const EDITION_DIR = path.resolve(HERE, '..', '..');
const STAMP = path.basename(EDITION_DIR);
const REPO = path.resolve(EDITION_DIR, '..', '..');
const PORT = +(flag('--port') || 8442);
const SCRATCH = path.resolve(String(flag('--scratch') || '/tmp/nl010-opus/team-4/tester/run'));
const OUT = path.resolve(String(flag('--out') || path.join('/tmp/nl010-opus/team-4/tester/out', new Date().toISOString().replace(/[:.]/g, '-'))));
const DEVICES = String(flag('--devices') || 'Pixel 7,Galaxy S24').split(',').map(s => s.trim()).filter(Boolean);
const ONLY = flag('--only') ? String(flag('--only')).split(',').map(s => s.trim()) : null;
const want = (id) => !ONLY || ONLY.includes(id);
const SKIP_PROBES = !!flag('--skip-probes');
const FIXED_WAIT = 6500;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const LAUNCH = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
// handoff/04-loader/HOOKS.md and team-2/STEPS.md 4.2: Object.keys(KY.hooks), in this order (28 names)
const HOOK_NAMES = ['keyPlace', 'address', 'describe', 'findBy', 'flyTo', 'home', 'homeCamera', 'safeBox', 'lightTime', 'showNew', 'goKey', 'fmt',
  'words', 'esc', 'cv', 'ov', 'o2', 'hud', 'big', 'sub', 'card', 'gbox', 'gin', 'SPACE', 'N', 'repos', 'commits', 'wafer'];
// KY.names beyond the 28: read from the published contract (HOOKS.md: "the 28 hooks + `cam lit sel redraw draw panels refuse`"),
// so the test follows the revision the hand-off names (rev 4: 35 names; rev 5 adds nav)
const KY_EXTRA = (() => { try { const m = /the 28 hooks \+ `([^`]+)`/.exec(fs.readFileSync(path.join(HERE, 'HOOKS.md'), 'utf8')); if (m) return m[1].trim().split(/\s+/); } catch (e) {} return ['cam', 'lit', 'sel', 'redraw', 'draw', 'panels', 'refuse']; })();
const PROBE_GEN = '202611012200';

// ------------------------------------------------------------------ 1. the scratch copy
// --base FILE patches that page instead of the edition's current index.html (e.g. the skeleton's page at 96736f5, the
// base the patch was cut against, when the integrator has since changed the page and the patch no longer applies)
function patchedPage() {
  const baseFile = flag('--base') ? path.resolve(String(flag('--base'))) : path.join(EDITION_DIR, 'index.html');
  const original = fs.readFileSync(baseFile, 'utf8');
  if (flag('--html')) { const f = path.resolve(String(flag('--html'))); return { html: fs.readFileSync(f, 'utf8'), base: flag('--base') ? original : null, patchText: '', how: 'html ' + f }; }
  let p = flag('--patch') ? path.resolve(String(flag('--patch'))) : null;
  if (!p && !flag('--base') && /kuiper\.hooks\.v1/.test(original)) {   // the integrator has applied the patch: test the page as committed
    const pf = path.join(HERE, 'index.html.patch'), rv = fs.existsSync(pf) ? cp.spawnSync('patch', ['-R', '--dry-run', '-s', '-o', '/dev/null', baseFile, pf], { encoding: 'utf8' }) : null;
    return { html: original, integrated: { patch_sha256: fs.existsSync(pf) ? sha(fs.readFileSync(pf)) : null, reverses_cleanly: !!rv && rv.status === 0, out: rv ? (rv.stdout + rv.stderr).trim().slice(0, 300) : 'no index.html.patch' },
      how: 'the edition page as committed, which carries the hook table (' + path.relative(REPO, baseFile) + ', sha256 ' + sha(original) + ')' };
  }
  if (!p && fs.existsSync(path.join(HERE, 'index.html.patch'))) p = path.join(HERE, 'index.html.patch');
  if (p) {
    const o = path.join(SCRATCH, 'index.patched.html');
    const r = cp.spawnSync('patch', ['-s', '-o', o, baseFile, p], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error('the patch does not apply: ' + p + ' (sha256 ' + sha(fs.readFileSync(p)) + ') on ' + baseFile + ' (sha256 ' + sha(original) + ')\n' + r.stdout + r.stderr);
    return { html: fs.readFileSync(o, 'utf8'), base: original, patchText: fs.readFileSync(p, 'utf8'), how: 'patch ' + p + ' (sha256 ' + sha(fs.readFileSync(p)) + ') on ' + path.relative(REPO, baseFile) + ' (sha256 ' + sha(original) + ')' };
  }
  if (/kuiper\.hooks\.v1/.test(original)) return { html: original, how: 'the edition page, which already carries the hook table' };
  throw new Error('no patch: expected ' + path.join(HERE, 'index.html.patch') + ' (or --patch / --html)');
}
function prepareScratch() {
  const root = path.join(SCRATCH, 'root'), ed = path.join(root, 'editions', STAMP);
  fs.rmSync(SCRATCH, { recursive: true, force: true });
  fs.mkdirSync(path.join(root, 'editions'), { recursive: true });
  fs.symlinkSync(path.join(REPO, 'cosmos'), path.join(root, 'cosmos'));
  fs.cpSync(EDITION_DIR, ed, { recursive: true, filter: s => s !== path.join(EDITION_DIR, 'handoff') && !s.startsWith(path.join(EDITION_DIR, 'handoff') + path.sep) });
  const { html, how, base, patchText, integrated } = patchedPage();
  if (!/^<!doctype html>/i.test(html.trimStart()) || !/kuiper\.hooks\.v1/.test(html) || !/window\.KY\s*=/.test(html)) throw new Error('the patched page has no window.KY hook table');
  fs.writeFileSync(path.join(ed, 'index.html'), html);
  // the base: team 4's first record set (handoff/04-loader/modules.json); with --with-committed, the committed
  // manifest's records first (the integrator's order: other teams' modules, whose UI the NL-009 probes do not know)
  const recs = [], order = [], bases = [];
  for (const f of [...(flag('--with-committed') ? [path.join(EDITION_DIR, 'modules.json')] : []), path.join(HERE, 'modules.json')]) {
    if (!fs.existsSync(f)) continue; const m = JSON.parse(fs.readFileSync(f, 'utf8')); bases.push({ file: path.relative(REPO, f), order: m.order || [] });
    for (const id of m.order || []) { const r = (m.modules || []).find(x => x.id === id); if (r && !order.includes(id)) { recs.push(r); order.push(id); } } }
  if (!order.includes('hello')) throw new Error('no hello record in modules.json or handoff/04-loader/modules.json');
  for (const id of ['probe-a', 'probe-b', 'probe-c', 'probe-wafer']) {
    const src = probeSource(id), f = 'modules/' + PROBE_GEN + '-' + id + '.js';
    fs.writeFileSync(path.join(ed, f), src); recs.push(probeRecord(id, f, Buffer.from(src))); order.push(id);
  }
  const manifest = { schema: 'kuiper.modules.v1', edition: STAMP, hooks: 'kuiper.hooks.v1', order, modules: recs,
    contracts: { module_sha256_required: true, order_explicit: true, engine_mutation_forbidden: true, stamp_in_name_equals_generation: true, hooks_frozen: true } };
  fs.writeFileSync(path.join(ed, 'modules.json'), JSON.stringify(manifest, null, 1));
  return { root, ed, manifest, how, html, htmlSha: sha(html), bases, base, patchText, integrated };
}
const PROBE_REQ = { 'probe-a': ['keyPlace', 'cam', 'draw', 'redraw'], 'probe-b': ['probe-a', 'cam'], 'probe-c': ['fmt', 'draw'], 'probe-wafer': ['wafer', 'N'] };
function probeRecord(id, p, bytes, requires) {
  return { id, generation: PROBE_GEN, path: p, sha256: sha(bytes), bytes: bytes.length, byte_budget: 4096, requires: requires || PROBE_REQ[id], provides: [id],
    reads: [], writes: ['window.KY.modules.' + id, '#ky-' + id], creates_controls: 'none', licence: 'Apache-2.0', team: '04', step: 4, proof: 'handoff/04-loader/' };
}
// the test modules (scratch copy only): each registers once, builds its host #ky-<id>, and reports through inspect()
function probeSource(id, o = {}) {
  const req = o.requires || PROBE_REQ[id];
  const body = id === 'probe-wafer'
    ? "KY.hooks.wafer.then(function (w) { st.state = 'resolved'; st.N = w && w.N; }, function (e) { st.state = 'refused'; st.why = String(e && e.message || e); }); return st;"
    : id === 'probe-b' ? "st.sawA = !!(KY.modules['probe-a'] && KY.modules['probe-a'].api); return st;"
      : "KY.draw.add(function () { st.frames++; }, 950); KY.redraw(); return st;";
  return `/* kuiper module ${id}, generation ${PROBE_GEN} (UTC), Apache-2.0 (kuiper-belt) */
// test module of handoff/04-loader/test.cjs: written into the scratch copy only, never into the repository
(function () {
  'use strict';
  var st = { frames: 0, state: 'pending' };
  KY.register({ schema: 'kuiper.module.v1', id: '${id}', generation: '${PROBE_GEN}', requires: ${JSON.stringify(req).replace(/"/g, "'")}, provides: ['${id}'],
    install: function (KY) {
      var h = document.createElement('div'); h.id = 'ky-${id}'; h.hidden = true; document.body.appendChild(h);
      ${body}
    },
    inspect: function () { return st; } });
})();
`;
}

// ------------------------------------------------------------------ 2. the server
function serve(root) {
  return new Promise((resolve, reject) => {
    const child = cp.spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'ignore', 'pipe'] });
    let log = '', up = false; child.stderr.on('data', d => { log = (log + d).slice(-4000); });
    child.on('exit', c => { if (!up) reject(new Error('http.server exited ' + c + ': ' + log.slice(-400))); });
    const t0 = Date.now();
    const poll = () => http.get(`http://127.0.0.1:${PORT}/editions/${STAMP}/modules.json`, r => { r.resume(); up = true; resolve(child); })
      .on('error', () => { if (Date.now() - t0 > 15000) reject(new Error('http.server did not answer on ' + PORT)); else setTimeout(poll, 250); });
    setTimeout(poll, 300);
  });
}

// ------------------------------------------------------------------ in-page measurements
function pageState() {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) }; };
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
  const KY = window.KY, rf = document.getElementById('refuse'), bar = document.getElementById('bar');
  const mods = {}; try { if (KY && KY.modules) for (const k of Object.keys(KY.modules)) { const m = KY.modules[k]; mods[k] = { frozen: Object.isFrozen(m), generation: m.generation, sha256: m.sha256, state: m.inspect ? JSON.parse(JSON.stringify(m.inspect() || null)) : null }; } } catch (e) { mods.__error = String(e); }
  let ed = null; try { ed = KY && KY.inspect ? KY.inspect() : JSON.parse(JSON.stringify(window.__KUIPER_EDITION__ || null)); } catch (e) { ed = { error: String(e) }; }
  return {
    vw: innerWidth, vh: innerHeight, ed,
    refuse: rf ? { visible: vis(rf), role: rf.getAttribute('role'), text: rf.textContent, rect: R(rf) } : null,
    bar: bar ? { visible: vis(bar), rect: R(bar), titles: [...bar.querySelectorAll('.gm-title')].map(b => b.textContent.trim()) } : null,
    hosts: [...document.querySelectorAll('[id^="ky-"]')].map(e => e.id),
    scripts: [...document.querySelectorAll('script[data-ky-module]')].map(s => ({ id: s.getAttribute('data-ky-module'), blob: /^blob:/.test(s.src) })),
    modules: mods,
    hud: document.getElementById('hud') ? document.getElementById('hud').textContent : null,
    t: { load: Math.round((performance.getEntriesByType('navigation')[0] || {}).loadEventEnd || 0) || null,
      wafer: Math.round((performance.getEntriesByType('resource').find(e => /cosmos\/wafer\.tsv/.test(e.name)) || {}).responseEnd || 0) || null },
  };
}
async function waferFromPng(page, b64, yFrom, skip) {   // the journey's measurement (FIXES/NL-009/android-journey.cjs:92-102), the refusal strip left out
  return page.evaluate(async ({ b64, yFrom, skip }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const W = innerWidth, H = innerHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data;
    let lit = 0, tot = 0, minx = 1e9, maxx = -1;
    for (let y = Math.max(0, Math.ceil(yFrom)); y < H; y++) for (let x = 0; x < W; x++) {
      if (skip && x >= skip.left && x <= skip.right && y >= skip.top && y <= skip.bottom) continue;
      const i = (y * W + x) * 4; tot++; const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (lum > 34) { lit++; if (x < minx) minx = x; if (x > maxx) maxx = x; } }
    return { litFraction: +(lit / Math.max(1, tot)).toFixed(4), bboxW: lit ? maxx - minx + 1 : 0 };
  }, { b64, yFrom, skip });
}

// ------------------------------------------------------------------ the NL-009 round-1 probe (04-touch-harness.cjs:7-17), appended to the served copy only
const PROBE = `
window.__k = { get:()=>({cx,cy,zoom,moved:(typeof moved!=='undefined'?moved:null),openPanel,card:card.style.display,cardOpen:card.classList.contains('open'),edSel,edN:edPlaced.length,W:innerWidth,H:innerHeight}),
  set:(o)=>{ if ('cx' in o) cx=o.cx; if ('cy' in o) cy=o.cy; if ('zoom' in o) zoom=o.zoom; tween=null; atHome=false; dirty=true; draw(); },
  spark:(i)=>({x:edPlaced[i].x,y:edPlaced[i].y,s:edScreen(edPlaced[i])}), toWorld, key:(k)=>dispatchEvent(new KeyboardEvent('keydown',{key:k})) };
window.edCard = (i)=>edCard(i); Object.defineProperty(window,'edSel',{set:v=>{edSel=v;},get:()=>edSel}); Object.defineProperty(window,'litRepo',{set:v=>{litRepo=v;},get:()=>litRepo});
window.__ev = { cancel:0, ctx:0, ctxPrevented:0, ups:[], clicks:[] };
addEventListener('pointercancel', ()=>__ev.cancel++, true);
addEventListener('contextmenu', e=>{ __ev.ctx++; setTimeout(()=>{ if (e.defaultPrevented) __ev.ctxPrevented++; },0); }, true);
addEventListener('pointerup', e=>__ev.ups.push([performance.now(), e.target.id||e.target.tagName]), true);
addEventListener('click', e=>__ev.clicks.push([performance.now(), e.target.id||e.target.tagName]), true);
`;
function withProbe(html) {
  const a = 'requestAnimationFrame(frame);', i = html.lastIndexOf(a);
  if (i < 0) throw new Error('probe anchor requestAnimationFrame(frame); not found');
  return html.slice(0, i) + PROBE + html.slice(i);
}

// ------------------------------------------------------------------ one device
async function runDevice(browser, deviceName, S) {
  const dev = devices[deviceName]; if (!dev) throw new Error('unknown device ' + deviceName);
  const dir = path.join(OUT, slug(deviceName)); fs.mkdirSync(dir, { recursive: true });
  const BASE = `http://127.0.0.1:${PORT}/editions/${STAMP}/`;
  const checks = []; let shotN = 0;
  const check = (id, name, pass, measured, note) => { const c = { id, name, pass: !!pass, measured, note: note || '' }; checks.push(c); process.stderr.write(`[${deviceName}] ${pass ? 'PASS' : 'FAIL'} ${id} ${name}${note ? ' — ' + note : ''}\n`); return c; };
  const M = S.manifest, rec = id => M.modules.find(m => m.id === id), clone = o => JSON.parse(JSON.stringify(o));
  const result = { device: deviceName, viewport: dev.viewport, checks, measured: {}, shots: {} };

  async function open(caseId, { manifest = null, files = {}, status = {}, ctxOpts = {}, probe = false, hold = null, expect404 = [], waitDone = true } = {}) {
    const context = await browser.newContext({ ...dev, locale: 'en-GB', ...ctxOpts });
    const page = await context.newPage(); page.setDefaultTimeout(180000);
    const errors = [], expected = [], requests = [];
    const isExp = u => expect404.some(r => r.test(u));
    page.on('console', m => { if (m.type() !== 'error') return; const t = m.text(), loc = (m.location() || {}).url || '';
      if (/Failed to load resource: the server responded with a status of 404/.test(t) && isExp(loc)) { expected.push({ kind: 'console', text: t.slice(0, 160), url: loc }); return; }
      errors.push({ kind: 'console', text: t.slice(0, 300), url: loc }); });
    page.on('pageerror', e => errors.push({ kind: 'pageerror', text: String(e.message || e).slice(0, 300) }));
    page.on('requestfailed', r => { const f = r.failure(); if (f && !/aborted|ERR_ABORTED/i.test(f.errorText)) errors.push({ kind: 'request', text: r.url().slice(0, 200) + ' ' + f.errorText }); });
    page.on('request', r => requests.push(r.url()));
    if (manifest) await page.route(BASE + 'modules.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(manifest) }));
    for (const [p, body] of Object.entries(files)) await page.route(BASE + p, r => r.fulfill({ status: 200, contentType: 'text/javascript', body }));
    for (const [p, st] of Object.entries(status)) await page.route(BASE + p, r => r.fulfill({ status: st, contentType: 'text/plain', body: 'not found' }));
    if (probe) { const h = withProbe(S.html); for (const u of [BASE, BASE + 'index.html']) await page.route(u, r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: h })); }
    let release = null, heldAt = null, released = false;
    if (hold) { const gate = new Promise(r => { release = r; }); await page.route(hold.url, async r => { heldAt = Date.now(); await gate; released = true; await r.fulfill({ status: hold.status, contentType: 'text/plain', body: 'not found' }); }); }
    await page.goto(BASE, { waitUntil: 'load', timeout: 180000 });
    if (waitDone) { let ok = true; await page.waitForFunction(() => window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.done === true, null, { timeout: 120000 }).catch(() => { ok = false; });
      if (!ok) check(caseId + '.done', 'the loader finished (window.__KUIPER_EDITION__.done) within 120 s', false, { ed: await page.evaluate(() => JSON.parse(JSON.stringify(window.__KUIPER_EDITION__ || null))).catch(() => null) }); }
    return { context, page, errors, expected, requests, release: () => release && release(), heldAt: () => heldAt, released: () => released };
  }
  const state = page => page.evaluate(pageState);
  const shot = async (page, id) => { const f = path.join(dir, String(++shotN).padStart(2, '0') + '-' + id + '.png');
    for (let a = 0; a < 2; a++) { try { await page.screenshot({ path: f, scale: 'css', timeout: 180000 }); result.shots[id] = path.relative(OUT, f); return; } catch (e) { if (a) result.shots[id] = 'FAILED: ' + String(e.message || e).split('\n')[0]; } } };
  const wafer = async (page, s) => { try { const png = await page.screenshot({ type: 'png', scale: 'css', timeout: 180000 });
    return await waferFromPng(page, png.toString('base64'), s.bar ? s.bar.rect.bottom + 2 : 0, s.refuse && s.refuse.visible ? s.refuse.rect : null); } catch (e) { return { error: String(e.message || e).split('\n')[0], litFraction: 0 }; } };
  const waferOk = w => !!w && w.litFraction > 0.03 && w.bboxW > 100;
  const inside = s => !!(s.refuse && s.refuse.visible && s.refuse.role === 'alert' && s.refuse.rect.left >= 0 && s.refuse.rect.top >= 0 && s.refuse.rect.right <= s.vw + 0.5 && s.refuse.rect.bottom <= s.vh + 0.5);
  const noAlert = s => !s.refuse || !s.refuse.visible;
  const ids = s => ((s.ed && s.ed.admitted) || []).map(a => a.id);
  const why = (s, id) => (((s.ed && s.ed.refused) || []).find(x => x.id === id) || {}).why || null;
  const others = except => M.order.filter(id => !except.includes(id));
  const errOk = (h, cid) => check(cid + '.errors', 'zero console errors and pageerrors' + (h.expected.length ? ' (' + h.expected.length + ' deliberate 404 line(s) reported, not counted)' : ''), h.errors.length === 0, { errors: h.errors, expected: h.expected });
  const frames = (s, id) => s.modules[id] && s.modules[id].state ? (s.modules[id].state.frames != null ? s.modules[id].state.frames : s.modules[id].state.frames_drawn) : null;
  const running = async (page, id) => { const a = frames(await state(page), id); for (let i = 0; i < 3; i++) { await page.evaluate(() => window.KY.redraw()); await sleep(700); } const b = frames(await state(page), id); return { id, before: a, after: b, running: a != null && b > a }; };
  const tapSel = async (page, sel) => { const bb = await page.locator(sel).first().boundingBox(); if (!bb) throw new Error('nothing to tap: ' + sel); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  const readout = s => (s.hud || '').split('\n').map(l => l.replace(/^MODULES · /, '')).filter(l => / admitted · [0-9a-f]{12}$| refused: /.test(l));

  // ---------------------------------------------------------------- c1 / test 1
  if (want('c1')) {
    const h = await open('c1'); await sleep(FIXED_WAIT);
    const s = await state(h.page);
    const exp = M.order.map(id => ({ id, sha256: rec(id).sha256 }));
    check('c1.admitted', 'every order entry admitted, in order, each sha256 = the manifest', JSON.stringify(ids(s).map(id => ({ id, sha256: s.ed.admitted.find(a => a.id === id).sha256 }))) === JSON.stringify(exp), { admitted: s.ed && s.ed.admitted, order: M.order });
    check('c1.refused', 'refused is empty, no failures, no alert', s.ed && s.ed.refused.length === 0 && !(s.ed.failures || []).length && noAlert(s), { refused: s.ed && s.ed.refused, failures: s.ed && s.ed.failures, refuse: s.refuse });
    const lines = M.order.map(id => id + ' admitted · ' + rec(id).sha256.slice(0, 12));
    check('c1.readout', 'the readout has one "<id> admitted · <sha256 first 12>" line per module and nothing else', lines.every(l => readout(s).includes(l)) && readout(s).length === M.order.length, { readout: readout(s) });
    check('c1.isolation', 'one blob-URL <script data-ky-module> per module; each KY.modules entry frozen with the manifest sha256', s.scripts.length === M.order.length && s.scripts.every(x => x.blob) && M.order.every(id => s.modules[id] && s.modules[id].frozen && s.modules[id].sha256 === rec(id).sha256), { scripts: s.scripts, modules: Object.keys(s.modules) });
    const modReq = h.requests.filter(u => u.startsWith(BASE + 'modules/')).map(u => u.slice(BASE.length));
    check('c1.fetch', 'nothing under modules/ fetched outside order; each module fetched once (the loader reference never)', modReq.length === M.order.length && M.order.every(id => modReq.includes(rec(id).path)), { fetched: modReq });
    const w = await wafer(h.page, s); check('c1.wafer', 'the wafer is drawn under the bar', waferOk(w), w);
    const rh = await running(h.page, 'hello'), ra = await running(h.page, 'probe-a');
    check('c1.running', 'the admitted modules draw (hello ring and probe-a painter counts grow)', rh.running && ra.running, { hello: rh, probe_a: ra });
    check('c1.wafer-hook', 'probe-wafer saw KY.hooks.wafer resolve with N > 0', ((s.modules['probe-wafer'] || {}).state || {}).state === 'resolved' && s.modules['probe-wafer'].state.N > 0, { probe_wafer: s.modules['probe-wafer'] });
    let hud = null;
    try { await tapSel(h.page, '#bar .gm-title[data-panel="hud"]'); await sleep(2500);
      hud = await h.page.evaluate(() => { const e = document.getElementById('hud'), r = e.getBoundingClientRect(); return { text: e.textContent, open: getComputedStyle(e).display !== 'none' && r.height > 0 }; }); } catch (e) { hud = { error: String(e.message || e) }; }
    check('c1.readout-panel', 'READOUT opened by a touch tap shows every admitted line', !!(hud && hud.open && lines.every(l => (hud.text || '').includes(l))), hud && { open: hud.open, tail: (hud.text || hud.error || '').split('\n').slice(-8) });
    await shot(h.page, 'c1-readout-admitted');
    await h.page.keyboard.press('Escape'); await sleep(1500);
    await shot(h.page, 'c1-all-admitted');
    // c9 / test 9 measured here, no threshold
    const tm = s.ed.timings || {};
    result.measured.c9 = { load_event_end_ms: s.t.load, loader_start_ms: tm.loader_start_ms, last_admitted_ms: tm.last_admitted_ms, loader_end_ms: tm.loader_end_ms,
      load_to_last_admitted_ms: tm.last_admitted_ms != null && s.t.load ? tm.last_admitted_ms - s.t.load : null, wafer_tsv_response_end_ms: s.t.wafer,
      per_module_t_ms: (s.ed.admitted || []).map(a => [a.id, a.t_ms]), sum_bytes: M.modules.reduce((a, m) => a + m.bytes, 0), sum_byte_budget: M.modules.reduce((a, m) => a + m.byte_budget, 0),
      page_reported: { bytes: s.ed.bytes, byte_budget: s.ed.byte_budget }, modules: M.order.length,
      note: 'Playwright Chromium, SwiftShader, served from 127.0.0.1; a negative load_to_last_admitted means the last module was admitted before the load event' };
    check('c9.measured', 'load → last admitted and Σ bytes / Σ byte_budget recorded and equal to the page\'s own sums (no threshold)', tm.last_admitted_ms != null && s.ed.bytes === result.measured.c9.sum_bytes && s.ed.byte_budget === result.measured.c9.sum_byte_budget, result.measured.c9);
    errOk(h, 'c1'); await h.context.close();
  }
  // ---------------------------------------------------------------- c2 / test 2: one byte changed in the served hello
  if (want('c2')) {
    const hp = rec('hello').path, m = Buffer.from(fs.readFileSync(path.join(S.ed, hp)));
    let at = m.indexOf(Buffer.from('cyan')); if (at < 0) at = 10; m[at] = m[at] === 0x41 ? 0x42 : 0x41;   // one byte, inside a comment
    const h = await open('c2', { files: { [hp]: m } }); await sleep(FIXED_WAIT);
    const s = await state(h.page);
    check('c2.refused', "hello refused 'sha256 mismatch', nothing else refused", why(s, 'hello') === 'sha256 mismatch' && s.ed.refused.length === 1, { refused: s.ed && s.ed.refused, byte_changed_at: at });
    check('c2.rest', 'every other module admitted, in order', JSON.stringify(ids(s)) === JSON.stringify(others(['hello'])), { admitted: ids(s) });
    check('c2.alert', '#refuse[role=alert] visible inside the viewport, naming hello and the reason', inside(s) && /hello/.test(s.refuse.text) && /sha256 mismatch/.test(s.refuse.text), { refuse: s.refuse, viewport: [s.vw, s.vh] });
    check('c2.nothing', 'the refused bytes never ran: no script, no #ky-hello, no KY.modules.hello', !s.scripts.some(x => x.id === 'hello') && !s.hosts.includes('ky-hello') && !s.modules.hello, { hosts: s.hosts, scripts: s.scripts });
    const w = await wafer(h.page, s); check('c2.wafer', 'the wafer is drawn and the bar present', waferOk(w) && s.bar && s.bar.visible, { wafer: w, bar: s.bar });
    const ra = await running(h.page, 'probe-a'); check('c2.running', 'the rest keeps running (probe-a painter count grows)', ra.running, ra);
    await shot(h.page, 'c2-sha256-mismatch');
    errOk(h, 'c2'); await h.context.close();
  }
  // ---------------------------------------------------------------- c3 / test 3: missing hook
  if (want('c3')) {
    const man = clone(M), src = probeSource('probe-a', { requires: ['noSuchHook', 'cam'] }), r = man.modules.find(x => x.id === 'probe-a');
    Object.assign(r, { requires: ['noSuchHook', 'cam'], sha256: sha(src), bytes: Buffer.byteLength(src) });
    const h = await open('c3', { manifest: man, files: { [r.path]: src } }); await sleep(1500);
    const s = await state(h.page);
    check('c3.refused', "probe-a refused 'missing hook noSuchHook'", why(s, 'probe-a') === 'missing hook noSuchHook', { refused: s.ed && s.ed.refused });
    check('c3.unhosted', '#ky-probe-a absent', !s.hosts.includes('ky-probe-a'), { hosts: s.hosts });
    check('c3.dependent', "probe-b, which requires probe-a, refused 'missing hook probe-a'", why(s, 'probe-b') === 'missing hook probe-a', { why: why(s, 'probe-b') });
    check('c3.rest', 'the modules that do not need it admitted', JSON.stringify(ids(s)) === JSON.stringify(others(['probe-a', 'probe-b'])), { admitted: ids(s) });
    check('c3.alert', '#refuse[role=alert] inside the viewport names both', inside(s) && /probe-a/.test(s.refuse.text) && /probe-b/.test(s.refuse.text), { refuse: s.refuse });
    errOk(h, 'c3'); await h.context.close();
  }
  // ---------------------------------------------------------------- c4 / test 4: stamp mismatch; no stamp in the name
  if (want('c4')) {
    const body = fs.readFileSync(path.join(S.ed, rec('probe-a').path));
    for (const [sub, np] of [['c4a', 'modules/202611012201-probe-a.js'], ['c4b', 'modules/probe-a.js']]) {
      const man = clone(M); man.modules.find(x => x.id === 'probe-a').path = np;
      const h = await open(sub, { manifest: man, files: { [np]: body } }); await sleep(1500);
      const s = await state(h.page);
      if (sub === 'c4a') {
        check('c4a.refused', "served as 202611012201-probe-a.js with generation 202611012200 → refused, the stamp named in words", /stamp mismatch: generation 202611012200, file name 202611012201/.test(why(s, 'probe-a') || ''), { refused: s.ed && s.ed.refused });
        check('c4a.rest', 'the rest admitted, except probe-b which requires probe-a', JSON.stringify(ids(s)) === JSON.stringify(others(['probe-a', 'probe-b'])), { admitted: ids(s) });
        check('c4a.alert', '#refuse[role=alert] inside the viewport names the stamp', inside(s) && /stamp/.test(s.refuse.text), { refuse: s.refuse });
      } else check('c4b.admitted', 'served as probe-a.js (no leading digits) → admitted: identity is generation + sha256', JSON.stringify(ids(s)) === JSON.stringify(M.order) && s.ed.refused.length === 0, { admitted: ids(s), refused: s.ed && s.ed.refused });
      errOk(h, sub); await h.context.close();
    }
  }
  // ---------------------------------------------------------------- c5 / test 5: hello's install throws
  if (want('c5')) {
    const hp = rec('hello').path, src = fs.readFileSync(path.join(S.ed, hp), 'utf8');
    const thr = src.replace(/install\s*(?::\s*function\s*)?\(KY\)\s*\{/, m => m + " throw new Error('test');");
    const man = clone(M); Object.assign(man.modules.find(x => x.id === 'hello'), { sha256: sha(thr), bytes: Buffer.byteLength(thr) });
    const h = await open('c5', { manifest: man, files: { [hp]: thr } }); await sleep(1500);
    const s = await state(h.page);
    check('c5.refused', "hello refused 'install threw test'", thr !== src && why(s, 'hello') === 'install threw test', { refused: s.ed && s.ed.refused });
    check('c5.rest', 'every other module admitted', JSON.stringify(ids(s)) === JSON.stringify(others(['hello'])), { admitted: ids(s) });
    check('c5.alert', '#refuse[role=alert] inside the viewport', inside(s) && /install threw test/.test(s.refuse.text), { refuse: s.refuse });
    errOk(h, 'c5'); await h.context.close();
  }
  // ---------------------------------------------------------------- c6 / test 6: 404
  if (want('c6')) {
    const hp = rec('hello').path;
    const h = await open('c6', { status: { [hp]: 404 }, expect404: [new RegExp(hp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$')] }); await sleep(1500);
    const s = await state(h.page);
    check('c6.refused', "hello refused 'HTTP 404'", why(s, 'hello') === 'HTTP 404', { refused: s.ed && s.ed.refused });
    check('c6.rest', 'every other module admitted', JSON.stringify(ids(s)) === JSON.stringify(others(['hello'])), { admitted: ids(s) });
    check('c6.alert', '#refuse[role=alert] inside the viewport', inside(s) && /HTTP 404/.test(s.refuse.text), { refuse: s.refuse });
    errOk(h, 'c6'); await h.context.close();
  }
  // ---------------------------------------------------------------- c7 / test 7: the empty manifest
  if (want('c7')) {
    const man = clone(M); man.order = []; man.modules = [];
    const h = await open('c7', { manifest: man }); await sleep(FIXED_WAIT);
    const s = await state(h.page);
    check('c7.empty', 'admitted [] and refused [], no alert', s.ed && s.ed.admitted.length === 0 && s.ed.refused.length === 0 && noAlert(s), { ed: s.ed, refuse: s.refuse });
    const fr = await h.page.evaluate(() => { const K = window.KY; return { KY: Object.isFrozen(K), hooks: Object.isFrozen(K.hooks), names: Object.isFrozen(K.names), cam: Object.isFrozen(K.cam), lit: Object.isFrozen(K.lit), sel: Object.isFrozen(K.sel), draw: Object.isFrozen(K.draw), panels: Object.isFrozen(K.panels),
      keys: Object.keys(K.hooks), names_list: Array.from(K.names || []), alias: window.__KUIPER_MODULES__ === K.modules, schema: K.schema, edition: K.edition,
      writes_refused: (() => { try { K.hooks.flyTo = null; } catch (e) {} try { K.injected = 1; } catch (e) {} try { K.modules.x = 1; } catch (e) {} return typeof K.hooks.flyTo === 'function' && !('injected' in K); })() }; });
    check('c7.frozen', 'Object.isFrozen(window.KY) and of hooks, names, cam, lit, sel, draw, panels; writes do not land', ['KY', 'hooks', 'names', 'cam', 'lit', 'sel', 'draw', 'panels'].every(k => fr[k]) && fr.writes_refused, fr);
    check('c7.hooks', 'Object.keys(KY.hooks) = the 28 names of HOOKS.md in order; KY.names = those + the extras HOOKS.md lists (' + KY_EXTRA.join(' ') + ': ' + (28 + KY_EXTRA.length) + ')', JSON.stringify(fr.keys) === JSON.stringify(HOOK_NAMES) && JSON.stringify(fr.names_list) === JSON.stringify([...HOOK_NAMES, ...KY_EXTRA]), { keys: fr.keys, names: fr.names_list });
    check('c7.alias', "window.__KUIPER_MODULES__ === KY.modules; KY.schema 'kuiper.hooks.v1'; KY.edition = the stamp", fr.alias && fr.schema === 'kuiper.hooks.v1' && fr.edition === STAMP, { alias: fr.alias, schema: fr.schema, edition: fr.edition });
    const kr = await h.page.evaluate(async () => { const K = window.KY, rf = () => { const d = document.getElementById('refuse'); return d && getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().height > 0 ? d.textContent : null; };
      const o = { has: typeof K.refuse === 'function' }; if (!o.has) return o;
      K.refuse('probe words', 'probe-x'); await new Promise(r => setTimeout(r, 300)); o.shown = rf();
      K.refuse('', 'probe-x'); await new Promise(r => setTimeout(r, 300)); o.cleared = rf();
      for (const slot of ['engine', 'modules']) { try { K.refuse('x', slot); o[slot] = 'no throw'; } catch (e) { o[slot] = e instanceof TypeError ? 'TypeError' : String(e); } }
      const z = K.cam.atHome; try { K.cam.atHome = false; o.atHomeSet = K.cam.atHome === false; K.cam.atHome = z; } catch (e) { o.atHomeSet = 'threw ' + e; }
      return o; });
    check('c7.refuse', 'rev 3: KY.refuse(text, slot) shows its line in #refuse and clears it with empty text; slots engine and modules throw TypeError; KY.cam.atHome is settable', kr.has && /probe words/.test(kr.shown || '') && kr.cleared === null && kr.engine === 'TypeError' && kr.modules === 'TypeError' && kr.atHomeSet === true, kr);
    // rev 5: KY.nav, the one owner of history for the Android back gesture (HOOKS.md)
    if (KY_EXTRA.includes('nav')) { const nav = { api: await h.page.evaluate(() => { const n = window.KY.nav; if (!n) return null; let ed; try { n.push('edition'); ed = 'no throw'; } catch (e) { ed = e instanceof TypeError ? 'TypeError' : String(e); }
      return { fns: ['push', 'back', 'onBack', 'has', 'isSelf'].filter(k => typeof n[k] === 'function'), edition: ed, frozen: Object.isFrozen(n) }; }) };
    if (nav.api) {
      nav.push = await h.page.evaluate(() => { window.__navCalls = 0; const n = window.KY.nav, d0 = n.depth; n.onBack('probe-x', () => { window.__navCalls++; }); n.push('probe-x'); return { d0, d1: n.depth, has: n.has('probe-x'), state: history.state }; });
      await h.page.evaluate(() => window.KY.nav.back('probe-x')); await sleep(1500);
      nav.selfBack = await h.page.evaluate(() => ({ has: window.KY.nav.has('probe-x'), calls: window.__navCalls, depth: window.KY.nav.depth, url: location.href }));
      await h.page.evaluate(() => window.KY.nav.push('probe-x')); await sleep(800);
      await h.page.goBack({ waitUntil: 'commit' }).catch(() => {}); await sleep(1500);
      nav.personBack = await h.page.evaluate(() => ({ alive: true, has: window.KY.nav.has('probe-x'), calls: window.__navCalls })).catch(() => ({ alive: false }));
    }
    check('c7.nav', "rev 5: KY.nav push/back/onBack/has/isSelf; 'edition' reserved (TypeError); a self back calls no handler; a person's back calls the owner's handler once and stays on the page",
      !!nav.api && nav.api.fns.length === 5 && nav.api.edition === 'TypeError' && nav.push.has && nav.push.d1 === nav.push.d0 + 1 && !nav.selfBack.has && nav.selfBack.calls === 0 && nav.personBack.alive && !nav.personBack.has && nav.personBack.calls === 1, nav); }
    const w = await wafer(h.page, s); check('c7.wafer', 'a whole wafer without modules: the wafer drawn, the bar present', waferOk(w) && s.bar && s.bar.visible, { wafer: w, bar: s.bar && s.bar.titles });
    await shot(h.page, 'c7-empty-manifest');
    errOk(h, 'c7'); await h.context.close();
  }
  // ---------------------------------------------------------------- c7b / test 7 second half: wafer.tsv held, then 404
  if (want('c7b')) {
    const h = await open('c7b', { hold: { url: '**/cosmos/wafer.tsv', status: 404 }, expect404: [/cosmos\/wafer\.tsv$/] });
    const s0 = await state(h.page), pending = h.heldAt() !== null && !h.released();
    const pw0 = (s0.modules['probe-wafer'] || {}).state || {};
    check('c7b.nowait', 'the loader finished while ../../cosmos/wafer.tsv was still pending; hello and probe-wafer admitted, the wafer promise pending', pending && ids(s0).includes('hello') && ids(s0).includes('probe-wafer') && pw0.state === 'pending',
      { wafer_pending: pending, admitted: ids(s0), probe_wafer: pw0, timings: s0.ed && s0.ed.timings });
    result.measured.c7b = { wafer_pending_when_loader_done: pending, loader_end_ms: s0.ed && s0.ed.timings && s0.ed.timings.loader_end_ms, hello_admitted_ms: ((s0.ed && s0.ed.admitted || []).find(a => a.id === 'hello') || {}).t_ms };
    await sleep(1500); h.release(); await sleep(3500);
    const s = await state(h.page), words = 'did not load. The wafer will not invent its keys.', pw = (s.modules['probe-wafer'] || {}).state || {};
    check('c7b.words', "the page says the engine's words and KY.hooks.wafer rejects with them", pw.state === 'refused' && (pw.why || '').includes(words) && ((s.refuse && s.refuse.visible && s.refuse.text.includes(words)) || (s.hud || '').includes(words)), { probe_wafer: pw, refuse: s.refuse });
    check('c7b.rest', 'every module stays admitted', JSON.stringify(ids(s)) === JSON.stringify(M.order), { admitted: ids(s) });
    errOk(h, 'c7b'); await h.context.close();
  }
  // ---------------------------------------------------------------- c10 the builder's five
  if (want('c10')) {
    const pc = rec('probe-c'), head = '/* kuiper module probe-c, generation ' + PROBE_GEN + ' (UTC), Apache-2.0 (kuiper-belt) */\n';
    const variant = (src, recPatch) => { const man = clone(M); Object.assign(man.modules.find(x => x.id === 'probe-c'), { sha256: sha(src), bytes: Buffer.byteLength(src) }, recPatch || {}); return { manifest: man, files: { [pc.path]: src } }; };
    const cases = [
      ['c10a', 'a module with a syntax error → refused "script error: …", never admitted', variant(head + "(function () { KY.register({ ;\n"), s => /^script error: .*SyntaxError|^script error: .*Unexpected/.test(why(s, 'probe-c') || '')],
      ['c10b', 'a module that registers, then throws at top level → refused "script error: …", not admitted, no #ky-probe-c', variant(probeSource('probe-c').replace("inspect: function () { return st; } });", "inspect: function () { return st; } });\n  throw new Error('after');")), s => /^script error: .*after/.test(why(s, 'probe-c') || '') && !s.hosts.includes('ky-probe-c')],
      ['c10c', 'requires as a string in the record → refused "requires is not a list"', (() => { const man = clone(M); man.modules.find(x => x.id === 'probe-c').requires = 'fmt'; return { manifest: man }; })(), s => why(s, 'probe-c') === 'requires is not a list'],
      ['c10d', 'requires as a string in the registration → refused "registration requires is not a list"', variant(probeSource('probe-c').replace("requires: ['fmt','draw']", "requires: 'fmt'")), s => why(s, 'probe-c') === 'registration requires is not a list'],
    ];
    for (const [cid, name, o, ok] of cases) {
      const h = await open(cid, o); await sleep(1500); const s = await state(h.page);
      check(cid + '.refused', name, ok(s) && !ids(s).includes('probe-c') && !s.modules['probe-c'], { refused: s.ed && s.ed.refused, admitted: ids(s) });
      check(cid + '.rest', 'every other module admitted; #refuse[role=alert] inside the viewport', JSON.stringify(ids(s)) === JSON.stringify(others(['probe-c'])) && inside(s), { admitted: ids(s), refuse: s.refuse });
      errOk(h, cid); await h.context.close();
    }
    { const man = clone(M); man.modules.splice(2, 0, null);
      const h = await open('c10e', { manifest: man }); await sleep(1500); const s = await state(h.page);
      check('c10e.null', 'a null record in modules is skipped: every order entry admitted, refused [], no alert, the sums still computed', s.ed && s.ed.done && JSON.stringify(ids(s)) === JSON.stringify(M.order) && s.ed.refused.length === 0 && noAlert(s) && s.ed.bytes === M.modules.reduce((a, m) => a + m.bytes, 0), { admitted: ids(s), refused: s.ed && s.ed.refused, bytes: s.ed && s.ed.bytes });
      errOk(h, 'c10e'); await h.context.close(); }
    { const man = clone(M); man.order.splice(2, 0, 'probe-a');
      const h = await open('c10f', { manifest: man }); await sleep(1500); const s = await state(h.page);
      const fetched = h.requests.filter(u => u === BASE + rec('probe-a').path).length;
      check('c10f.twice', "an id listed twice in order: admitted once, the second refused 'in order twice', fetched once, the rest admitted", JSON.stringify(ids(s)) === JSON.stringify(M.order) && s.ed.refused.length === 1 && why(s, 'probe-a') === 'in order twice' && fetched === 1 && inside(s), { admitted: ids(s), refused: s.ed && s.ed.refused, probe_a_fetches: fetched });
      errOk(h, 'c10f'); await h.context.close(); }
  }
  if (!SKIP_PROBES && want('T')) await touchProbes();
  if (!SKIP_PROBES && want('R')) await robustProbes();
  return result;

  // ---------------------------------------------------------------- NL-009 round1 04-touch
  async function ready(h) { await h.page.waitForFunction(() => window.__k && window.__k.get().edN > 0, null, { timeout: 120000 }); await sleep(7000); }
  async function touchProbes() {
    const h = await open('T', { probe: true }); const { page } = h; await ready(h);
    const cdp = await h.context.newCDPSession(page);
    const G = () => page.evaluate(() => window.__k.get());
    const VV = () => page.evaluate(() => ({ scale: visualViewport.scale, scrollY, scrollX }));
    const pts = p => p.map((q, i) => ({ x: q[0], y: q[1], id: i, radiusX: 8, radiusY: 8 }));
    const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts(p) });
    const seq = async steps => { const t0 = Date.now() / 1000; for (const [type, p, dt] of steps) await cdp.send('Input.dispatchTouchEvent', { type, timestamp: t0 + dt / 1000, touchPoints: pts(p) }); };
    const settle = async () => { const fr = () => page.evaluate(() => new Promise(r => requestAnimationFrame(a => requestAnimationFrame(b => r(b - a))))); for (let i = 0; i < 60; i++) { if (await fr() < 120 && await fr() < 120) return i; } return -1; };
    const key = k => page.evaluate(k => window.__k.key(k), k);
    const pinch = async (x, y, d0, step) => { await touch('touchStart', [[x - d0, y]]); await touch('touchStart', [[x - d0, y], [x + d0, y]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[x - d0 - step * i, y], [x + d0 + step * i, y]]); await sleep(16); } await touch('touchEnd', [[x + d0 + 10 * step, y]]); await touch('touchEnd', []); await sleep(400); };
    const { W, H } = await G();
    try {
      { const a = await G(), x0 = Math.round(W * 0.5), y0 = Math.round(H * 0.55);
        await touch('touchStart', [[x0, y0]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[x0 + 10 * i, y0 + 6 * i]]); await sleep(16); } await touch('touchEnd', []); await sleep(300);
        const b = await G(), v = await VV(), cancel = await page.evaluate(() => __ev.cancel), dx = +((a.cx - b.cx) * a.zoom).toFixed(2), dy = +((b.cy - a.cy) * a.zoom).toFixed(2);
        check('T1', '04-touch T1 a one-finger drag moves the camera 100 × 60 px; no pointercancel, no page scroll', Math.abs(dx - 100) < 2 && Math.abs(dy - 60) < 2 && cancel === 0 && v.scale === 1 && v.scrollY === 0, { dx, dy, cancel, vv: v }); }
      { const a = await G(), x = Math.round(W * 0.5), y = Math.round(H * 0.55), w0 = await page.evaluate(([x, y]) => window.__k.toWorld(x, y), [x, y]);
        await pinch(x, y, 50, 5); const b = await G(), w1 = await page.evaluate(([x, y]) => window.__k.toWorld(x, y), [x, y]), v = await VV();
        const ratio = +(b.zoom / a.zoom).toFixed(3), drift = +(Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) * b.zoom).toFixed(3);
        check('T2', '04-touch T2 a pinch on the wafer zooms × 2.000 about the fingers; page scale 1', Math.abs(ratio - 2) < 0.05 && drift < 2 && v.scale === 1, { ratio, centre_drift_px: drift, vv: v }); }
      { const br = await page.$eval('#bar', e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }); await pinch(Math.round(W * 0.5), Math.round(br), 40, 8);
        const v1 = await VV(); check('T2b', '04-touch T2b a pinch on the bar does not zoom the page', v1.scale === 1, { vv: v1 });
        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 }).catch(() => {}); await key('Escape');
        await tapSel(page, '#bar .gm-title[data-panel="lines"]'); await sleep(500);
        const ly = await page.$eval('#lines', e => { const r = e.getBoundingClientRect(); return r.top + Math.min(r.height / 2, 200); }); await pinch(Math.round(W * 0.5), Math.round(ly), 40, 8);
        const v2 = await VV(), g = await G(); check('T2c', '04-touch T2c a pinch on the open LINES panel does not zoom the page', v2.scale === 1 && g.openPanel === 'lines', { vv: v2, openPanel: g.openPanel });
        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 }).catch(() => {}); await key('Escape'); await sleep(300); }
      { const clear = async () => { await page.evaluate(() => { card.style.display = 'none'; __k.key('Backspace'); }); await sleep(1500); await settle(); };
        const x = Math.round(W * 0.5), y = Math.round(H * 0.5);
        await clear(); await seq([['touchStart', [[x, y]], 0], ['touchEnd', [], 60]]); await sleep(300); const clean = (await G()).card;
        await clear(); await seq([['touchStart', [[x, y]], 0], ['touchEnd', [], 900]]); await sleep(300); const held = (await G()).card;
        await clear(); await seq([['touchStart', [[x, y]], 0], ['touchMove', [[x + 3, y + 2]], 20], ['touchMove', [[x + 5, y + 5]], 40], ['touchMove', [[x + 6, y + 6]], 60], ['touchEnd', [], 80]]); await sleep(300); const jit = (await G()).card;
        await clear(); await seq([['touchStart', [[x, y]], 0], ...[1, 2, 3, 4, 5, 6].map(i => ['touchMove', [[x + 5 * i, y]], 16 * i]), ['touchEnd', [], 120]]); await sleep(300); const drag = (await G()).card;
        check('T3', '04-touch T3 a 60 ms tap opens the card, a 900 ms hold does not, a 6 px jittered tap does, a 30 px drag does not', clean === 'block' && held !== 'block' && jit === 'block' && drag !== 'block', { clean, held, jitter: jit, drag30: drag }); }
      { await page.evaluate(() => { card.style.display = 'none'; }); const x = Math.round(W * 0.5), y = Math.round(H * 0.6);
        await touch('touchStart', [[x, y]]); await sleep(50); await touch('touchEnd', []); await sleep(120); await touch('touchStart', [[x, y]]); await sleep(50); await touch('touchEnd', []); await sleep(600);
        // pointerup → click on a bar title, three taps, the median: one sample can land on a seconds-long SwiftShader frame
        const v = await VV(), lats = [];
        for (let i = 0; i < 3; i++) { await page.evaluate(() => { __ev.ups = []; __ev.clicks = []; }); await tapSel(page, '#bar .gm-title[data-panel="hud"]'); await sleep(600);
          lats.push(await page.evaluate(() => __ev.clicks.length && __ev.ups.length ? +(__ev.clicks[0][0] - __ev.ups[0][0]).toFixed(1) : null)); }
        const lat = lats.includes(null) ? null : [...lats].sort((a, b) => a - b)[1];
        check('T4', '04-touch T4 a double tap does not zoom the page; a bar tap clicks at once (median of 3 < 100 ms)', v.scale === 1 && lat !== null && lat < 100, { vv: v, pointerup_to_click_ms: lats, median_ms: lat });
        await key('Escape'); await sleep(300); }
      { const put = (i, sx, sy) => page.evaluate(([i, sx, sy]) => { const b = __k.spark(i), g = __k.get(); __k.set({ zoom: 14, cx: b.x - (sx - g.W / 2) / 14, cy: b.y + (sy - g.H / 2) / 14 }); return __k.spark(i).s; }, [i, sx, sy]);
        await page.evaluate(() => { card.style.display = 'none'; edSel = -1; });
        const bb = await page.locator('#bar .gm-title[data-panel="lines"]').boundingBox(), bx = bb.x + bb.width / 2, by = bb.y + bb.height / 2;
        await put(5, bx, by); await sleep(300); await settle(); await page.touchscreen.tap(bx, by); await sleep(1500);
        const g1 = await G(); check('T5a', '04-touch T5a a bar tap over a spark opens the panel, not the spark', g1.openPanel === 'lines' && g1.edSel !== 5, { openPanel: g1.openPanel, edSel: g1.edSel });
        if (g1.openPanel) await key('Escape');
        await page.evaluate(() => { card.style.display = 'none'; edSel = -1; edCard(3); }); await sleep(300);
        const xb = await page.locator('#card .cx').boundingBox(), xx = xb.x + xb.width / 2, xy = xb.y + xb.height / 2;
        await put(7, xx, xy); await sleep(300); await settle(); await page.touchscreen.tap(xx, xy); await sleep(1500);
        const g2 = await G(); check('T5b', "04-touch T5b the card's × over a spark closes the card and does not reopen it", g2.card !== 'block', { card: g2.card, edSel: g2.edSel });
        await page.evaluate(() => { card.style.display = 'none'; edSel = -1; litRepo = -1; }); await tapSel(page, '#bar .gm-title[data-panel="hud"]'); await sleep(400);
        await page.touchscreen.tap(Math.round(W * 0.5), Math.round(H * 0.75)); await sleep(600);
        const g5 = await G(); check('T5e', '04-touch T5e a wafer tap with a panel open only dismisses the panel', !g5.openPanel && g5.card !== 'block', { openPanel: g5.openPanel, card: g5.card }); }
      { const back = async () => { await page.goBack({ waitUntil: 'commit' }).catch(() => {}); await sleep(900); return page.evaluate(() => !!window.__k).catch(() => false); };
        const armed = async () => { const t0 = Date.now(); await page.waitForFunction(() => !!(history.state && history.state.kuiper), null, { timeout: 15000 }).catch(() => {}); return Date.now() - t0; };   // the entry is armed on the next drawn frame (04-touch.md LIMITS); under SwiftShader that can take seconds
        const recover = async () => { await page.goForward({ waitUntil: 'commit' }).catch(() => {}); await page.waitForFunction(() => window.__k && window.__k.get().edN > 0, null, { timeout: 120000 }).catch(() => {}); await sleep(6000); };
        await page.evaluate(() => { card.style.display = 'none'; }); await tapSel(page, '#bar .gm-title[data-panel="lines"]'); await sleep(400);
        let wa = await armed(), al = await back(), g = al ? await G() : null;
        check('T6a', '04-touch T6a back with a panel open closes the panel and stays on the page', al && !g.openPanel, { alive: al, openPanel: g && g.openPanel, armed_after_ms: wa }); if (!al) await recover();
        await page.evaluate(() => edCard(2)); await sleep(300); wa = await armed(); al = await back(); g = al ? await G() : null;
        check('T6b', '04-touch T6b back with the card open closes the card', al && g.card !== 'block', { alive: al, card: g && g.card, armed_after_ms: wa }); if (!al) await recover();
        await page.evaluate(() => edCard(4)); await sleep(200); await page.keyboard.press('Escape'); await sleep(300);
        g = await G(); check('T6d', '04-touch T6d Escape closes the card', g.card !== 'block', { card: g.card });
        await tapSel(page, '#bar .gm-title[data-panel="lines"]'); await sleep(400); await page.evaluate(() => { __k.key('Escape'); edCard(6); }); await sleep(1500);
        g = await G(); check('T6f', "04-touch T6f a panel closed and a card opened in one task: the card survives the page's own back()", g.card === 'block', { card: g.card, edSel: g.edSel });
        wa = await armed(); al = await back(); g = al ? await G() : null; check('T6g', '04-touch T6g a user back after that race closes the card', al && g.card !== 'block', { alive: al, card: g && g.card }); if (!al) await recover(); }
      { await page.evaluate(() => { card.style.display = 'none'; }); await settle(); const x = Math.round(W * 0.5), y = Math.round(H * 0.65);
        await touch('touchStart', [[x, y]]); await sleep(900); await touch('touchEnd', []); await sleep(300);
        const c1 = await page.evaluate(() => ({ card: __k.get().card, selection: getSelection().toString().length }));
        const syn = await page.evaluate(() => ({ canvas: !document.getElementById('c').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 200, clientY: 500 })),
          bar: !document.querySelector('#bar .gm-title').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) }));
        check('T7', '04-touch T7 a 900 ms press opens nothing; contextmenu is prevented on the wafer and the bar', c1.card !== 'block' && c1.selection === 0 && syn.canvas && syn.bar, { press: c1, contextmenu_prevented: syn }); }
    } catch (e) { check('T.harness', '04-touch probes ran to the end', false, { error: String(e.stack || e).slice(0, 600) }); }
    await shot(page, 'T-touch-probes');
    errOk(h, 'T'); await h.context.close();
  }
  // ---------------------------------------------------------------- NL-009 round1 09-robust
  async function robustProbes() {
    const G2 = page => page.evaluate(() => window.__k.get());
    { const h = await open('R', { probe: true }); const { page } = h; await ready(h);
      try {
        await tapSel(page, '#bar .gm-title[data-panel="hud"]'); await sleep(400); await page.keyboard.press('e'); await sleep(7000);
        const hud = await page.$eval('#hud', e => ({ top: e.style.top, y: +e.getBoundingClientRect().y.toFixed(1) })), barB = await page.$eval('#bar', e => +e.getBoundingClientRect().bottom.toFixed(1));
        check('R1', '09-robust R1 READOUT after a pick sits under the bar, not at 0', parseFloat(hud.top) >= barB - 1 && hud.y >= barB - 1, { hud, bar_bottom: barB });
        const aria = await page.evaluate(() => { const q = s => document.querySelector(s), t = [...document.querySelectorAll('#bar .gm-title')];
          return { bar: q('#bar').getAttribute('role'), titles: t.map(b => ({ panel: b.dataset.panel, controls: b.getAttribute('aria-controls'), expanded: b.getAttribute('aria-expanded'), target: !!(b.getAttribute('aria-controls') && document.getElementById(b.getAttribute('aria-controls'))) })),
            panels: ['top', 'hud', 'lines', 'foot'].map(id => { const e = q('#' + id); return e ? [id, e.getAttribute('role'), e.getAttribute('aria-label')] : [id, null, null]; }),
            card: [q('#card').getAttribute('role'), q('#card').getAttribute('aria-live')], ct: q('#card .ct') ? [q('#card .ct').tagName, q('#card .ct').getAttribute('aria-expanded')] : null }; });
        await page.keyboard.press('Escape'); await sleep(300);
        await tapSel(page, '#bar .gm-title[data-panel="lines"]'); await sleep(500);
        const rows = await page.evaluate(() => { const r = [...document.querySelectorAll('#lineslist [data-i]')]; return { n: r.length, tabindex0: r.filter(e => e.getAttribute('tabindex') === '0').length }; });
        await page.focus('#lineslist [data-i]'); await page.keyboard.press('Enter'); await sleep(1200);
        const after = await G2(page);
        const titlesOk = aria.titles.filter(t => ['top', 'hud', 'lines', 'foot'].includes(t.panel));
        check('R8', '09-robust R8 toolbar, aria-controls/aria-expanded (READOUT true when open), named regions, card live region, details button, rows focusable, Enter opens a row',
          aria.bar === 'toolbar' && titlesOk.length === 4 && titlesOk.every(t => t.target && (t.expanded === 'true' || t.expanded === 'false')) && titlesOk.find(t => t.panel === 'hud').expanded === 'true'
          && aria.panels.every(p => p[1] === 'region' && p[2]) && aria.card[0] === 'region' && aria.card[1] === 'polite' && aria.ct && aria.ct[0] === 'BUTTON' && aria.ct[1] !== null
          && rows.n > 0 && rows.tabindex0 === rows.n && after.card === 'block' && !after.openPanel, { aria, rows, after_enter: { card: after.card, openPanel: after.openPanel, edSel: after.edSel } });
        await tapSel(page, '#bar .gm-title[data-panel="hud"]'); await sleep(400);
        await page.keyboard.press('Escape'); await sleep(300); const e1 = await G2(page); await page.keyboard.press('Escape'); await sleep(300); const e2 = await G2(page);
        check('R3', '09-robust R3 Escape closes the panel, then the card', !e1.openPanel && e1.card === 'block' && e2.card !== 'block', { first: { openPanel: e1.openPanel, card: e1.card }, second: { openPanel: e2.openPanel, card: e2.card } });
        const vp = dev.viewport, geo = [];
        await tapSel(page, '#bar .gm-title[data-panel="hud"]'); await sleep(400);
        // the canvas follows on the next resize event, which Chromium dispatches with a frame; under SwiftShader on a shared
        // machine a frame can take seconds, so wait (up to 30 s) for the canvas to follow and record how long it took
        for (const [w, hh] of [[vp.height, vp.width], [vp.width, vp.height], [vp.width, vp.height - 56]]) { const t0 = Date.now(); await page.setViewportSize({ width: w, height: hh });
          await page.waitForFunction(([w, hh]) => document.getElementById('c').width === w && document.getElementById('c').height === hh, [w, hh], { timeout: 30000 }).catch(() => {}); const followMs = Date.now() - t0; await sleep(2000);
          geo.push(Object.assign(await page.evaluate(() => { const c = document.getElementById('c'), p = document.querySelector('.gm-open'), b = document.getElementById('bar').getBoundingClientRect(); return { w: innerWidth, h: innerHeight, cw: c.width, ch: c.height, panelTop: p ? parseFloat(p.style.top) : null, barBottom: +b.bottom.toFixed(1) }; }), { follow_ms: followMs })); }
        await page.setViewportSize(vp); await sleep(2000);
        check('R2', '09-robust R2 rotation and the toolbar: the canvas follows the window, the open panel sits under the bar', geo.every(g => g.cw === g.w && g.ch === g.h && g.panelTop !== null && g.panelTop >= g.barBottom - 1 && g.panelTop <= g.barBottom + 6), { geo });
      } catch (e) { check('R.harness', '09-robust R1 R2 R3 R8 ran to the end', false, { error: String(e.stack || e).slice(0, 600) }); }
      errOk(h, 'R'); await h.context.close(); }
    { const h = await open('R4', { probe: true, ctxOpts: { reducedMotion: 'reduce' } }); const { page } = h; await ready(h);
      const z = await page.evaluate(() => new Promise(res => { const seen = []; let n = 0; const f = () => { seen.push(+window.KY.cam.zoom.toFixed(4)); if (++n < 60) requestAnimationFrame(f); else res(seen); }; window.__k.key('e'); requestAnimationFrame(f); }));
      const distinct = [...new Set(z)];
      check('R4', '09-robust R4 prefers-reduced-motion: the camera lands in one step after e (one zoom value)', distinct.length === 1, { distinct: distinct.slice(0, 40), frames: z.length });
      errOk(h, 'R4'); await h.context.close(); }
    { const h = await open('R5', { status: { 'keys.json': 404, 'keys-min.json': 404 }, expect404: [/keys(-min)?\.json$/] }); const { page } = h; await sleep(FIXED_WAIT);
      await tapSel(page, '#bar .gm-title[data-panel="lines"]'); await sleep(1500);
      const t = await page.evaluate(() => ({ big: document.getElementById('big').textContent, lines: (document.getElementById('lineslist') || {}).textContent || '' }));
      check('R5', '09-robust R5 keys.json 404 is said in EDITION and LINES', /keys\.json did not load/i.test(t.big) && /keys\.json did not load/i.test(t.lines), t);
      errOk(h, 'R5'); await h.context.close(); }
    { const context = await browser.newContext({ ...dev, javaScriptEnabled: false }); const page = await context.newPage();
      await page.goto(BASE, { waitUntil: 'load' }); const t = await page.evaluate(() => document.body.innerText).catch(() => ''), c = await page.content();
      check('R7', '09-robust R7 with JavaScript off the <noscript> sentence renders', /<noscript>/i.test(c) && t.trim().length > 20, { innerText: t.trim().slice(0, 200) });
      await context.close(); }
    { const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2'] }); const context = await b2.newContext({ ...dev }); const page = await context.newPage();
      const errs = [], exp = []; page.on('pageerror', e => { const t = String(e.message || e); (/WebGL2 is not available/.test(t) ? exp : errs).push(t); }); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await page.goto(BASE, { waitUntil: 'load' }); await sleep(3000);
      const r = await page.evaluate(() => { const d = document.getElementById('refuse'); return d ? { role: d.getAttribute('role'), text: d.textContent, visible: getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().height > 0 } : null; });
      check('R6', "09-robust R6 WebGL off: #refuse[role=alert] says WebGL2 in words; the engine's throw names itself 'WebGL2 is not available'", !!r && r.role === 'alert' && r.visible && /WebGL2/.test(r.text) && exp.length >= 1, { refuse: r, deliberate_pageerror: exp });
      check('R6.errors', 'no other console error or pageerror with WebGL off', errs.length === 0, { errors: errs });
      await b2.close(); }
  }
}

// ------------------------------------------------------------------ c0 the hand-off's hashes and the reference copy
function handoffCheck(S) {
  const out = { runs: [] }, f = path.join(HERE, 'MODULE.sha256');
  if (!fs.existsSync(f)) return { pass: false, runs: [], note: 'no MODULE.sha256' };
  for (const line of fs.readFileSync(f, 'utf8').split('\n').filter(l => l.trim())) { const [h, p] = line.trim().split(/\s+/);
    const abs = [path.join(EDITION_DIR, p), path.join(HERE, p)].find(x => fs.existsSync(x)), got = abs ? sha(fs.readFileSync(abs)) : null;
    out.runs.push({ check: 'MODULE.sha256 ' + p, recorded: h, measured: got, ok: got === h }); }
  const ref = fs.readdirSync(path.join(EDITION_DIR, 'modules')).filter(x => /^\d{12}-loader\.js$/.test(x)).sort().pop();
  if (ref) { const mark = /\/\/ =+ KUIPER HOOK TABLE AND LOADER kuiper\.hooks\.v1 · begin[^\n]*\n[\s\S]*?\/\/ =+ KUIPER HOOK TABLE AND LOADER kuiper\.hooks\.v1 · end/;
    const a = (fs.readFileSync(path.join(EDITION_DIR, 'modules', ref), 'utf8').match(mark) || [])[0], b = (S.html.match(mark) || [])[0];
    out.runs.push({ check: 'modules/' + ref + ' ≡ the patched page between the marker lines', bytes: a ? Buffer.byteLength(a) : null, ok: !!a && a === b }); }
  // the patch keeps what the integrator added to the page since the skeleton: every line of the base page that is not in
  // the skeleton's page must be in the patched page, unless the patch names it as a removed ('-') line (rev 3 lost 48)
  if (S.base && S.patchText != null) { const first = cp.spawnSync('git', ['-C', REPO, 'log', '--diff-filter=A', '--format=%H', '--', path.relative(REPO, path.join(EDITION_DIR, 'index.html'))], { encoding: 'utf8' }).stdout.trim().split('\n').pop();
    const skel = first ? cp.spawnSync('git', ['-C', REPO, 'show', first + ':' + path.relative(REPO, path.join(EDITION_DIR, 'index.html'))], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout : null;
    if (skel) { const sk = new Set(skel.split('\n')), out_ = new Set(S.html.split('\n')), minus = new Set(S.patchText.split('\n').filter(l => l.startsWith('-') && !l.startsWith('---')).map(l => l.slice(1)));
      const added = S.base.split('\n').filter(l => l.trim() && !sk.has(l)), lost = added.filter(l => !out_.has(l)), unnamed = lost.filter(l => !minus.has(l));
      out.runs.push({ check: 'the integrator\'s ' + added.length + ' lines since ' + first.slice(0, 7) + ' kept in the patched page (removals only where the patch names them)', removed_by_patch: lost.map(l => l.trim().slice(0, 160)), removed_unnamed: unnamed.map(l => l.trim().slice(0, 160)), ok: unnamed.length === 0 }); } }
  if (S.integrated) {   // the committed page may carry later teams' hunks too; the patch must apply cleanly to a page the integrator committed
    const rel = path.relative(REPO, path.join(EDITION_DIR, 'index.html')), pf = path.join(HERE, 'index.html.patch'), hits = [];
    for (const c of cp.spawnSync('git', ['-C', REPO, 'log', '--format=%h', '--', rel], { encoding: 'utf8' }).stdout.trim().split('\n').filter(Boolean)) {
      const t = path.join(SCRATCH, 'base-' + c + '.html'); fs.writeFileSync(t, cp.spawnSync('git', ['-C', REPO, 'show', c + ':' + rel], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout);
      if (cp.spawnSync('patch', ['--dry-run', '-s', '-o', '/dev/null', t, pf]).status === 0) hits.push(c + ' (' + sha(fs.readFileSync(t)).slice(0, 12) + ')'); }
    out.runs.push({ check: 'index.html.patch applies cleanly to a page the integrator committed; the committed page carries its loader block (row above)', applies_to: hits, reverse_on_committed_page: S.integrated.reverses_cleanly ? 'clean' : S.integrated.out, ok: hits.length > 0 }); }
  const hello = S.manifest.modules.find(m => m.id === 'hello'), hb = fs.readFileSync(path.join(S.ed, hello.path));
  out.runs.push({ check: hello.path + ' = its record (sha256, bytes, generation = file name)', ok: sha(hb) === hello.sha256 && hb.length === hello.bytes && path.basename(hello.path).startsWith(hello.generation + '-') });
  out.pass = out.runs.every(r => r.ok); return out;
}

// ------------------------------------------------------------------ c8 / test 8: edition_check.py E1-E8 on a copy, and on each mutation
// The folder layout and the mutations follow the first draft of this test by the team 4 lead (21:52 UTC).
function editionCheck(S) {
  const first = JSON.parse(fs.readFileSync(path.join(HERE, 'modules.json'), 'utf8')), hello = first.modules.find(m => m.id === 'hello');
  const tmp = path.join(SCRATCH, 'c8'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  const tool = path.join(REPO, 'tools', 'edition_check.py'), toolFrom = fs.existsSync(tool) ? 'tools/edition_check.py' : 'handoff/04-loader/edition_check.py.patch';
  const prev = fs.readdirSync(path.join(REPO, 'editions')).filter(f => /^\d{12}$/.test(f) && f < STAMP).sort().pop();
  const mk = name => { const d = path.join(tmp, name), e = path.join(d, 'editions', STAMP);
    fs.mkdirSync(path.join(e, 'modules'), { recursive: true }); fs.mkdirSync(path.join(d, 'tools'));
    fs.copyFileSync(path.join(REPO, 'editions', 'index.html'), path.join(d, 'editions', 'index.html'));
    if (prev) fs.cpSync(path.join(REPO, 'editions', prev), path.join(d, 'editions', prev), { recursive: true });
    for (const f of ['keys.json', 'README.md']) fs.copyFileSync(path.join(EDITION_DIR, f), path.join(e, f));
    fs.writeFileSync(path.join(e, 'index.html'), S.html);   // the same patched page the browser cases use
    for (const f of [hello.path, ...(first.references || []).map(r => r.file)]) fs.copyFileSync(path.join(EDITION_DIR, f), path.join(e, f));
    fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(first, null, 1));
    if (fs.existsSync(tool)) fs.copyFileSync(tool, path.join(d, 'tools', 'edition_check.py'));
    else cp.execFileSync('patch', ['-p1', '-s', '-i', path.join(HERE, 'edition_check.py.patch')], { cwd: d });
    return { d, e }; };
  const proof = e => { const lines = []; const walk = p => { for (const f of fs.readdirSync(p).sort()) { const q = path.join(p, f);
      if (fs.statSync(q).isDirectory()) { if (f !== 'handoff') walk(q); } else if (!q.endsWith('edition-sha256.txt')) lines.push(sha(fs.readFileSync(q)) + '  ./' + path.relative(e, q)); } };
    walk(e); fs.mkdirSync(path.join(e, 'proof'), { recursive: true }); fs.writeFileSync(path.join(e, 'proof', 'edition-sha256.txt'), lines.join('\n') + '\n'); };
  const run = d => { const r = cp.spawnSync('python3', ['tools/edition_check.py', 'editions/' + STAMP], { cwd: d, encoding: 'utf8', timeout: 300000 }); return { exit: r.status, out: (r.stdout + r.stderr).trim().split('\n') }; };
  const J = e => JSON.parse(fs.readFileSync(path.join(e, 'modules.json'))), W = (e, m) => fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(m, null, 1));
  const mut = {
    hash: e => { const p = path.join(e, hello.path), b = fs.readFileSync(p); b[b.indexOf('cyan')] ^= 1; fs.writeFileSync(p, b); },
    stamp: e => { const np = 'modules/202611012146-hello.js'; fs.renameSync(path.join(e, hello.path), path.join(e, np)); const m = J(e); m.modules[0].path = np; W(e, m); },
    requires: e => { const m = J(e); m.modules[0].requires.push('noSuchHook'); W(e, m); },
    stray: e => fs.writeFileSync(path.join(e, 'modules', '202611012150-stray.js'), '/* stray */\n'),
    writes: e => { const m = J(e); m.modules[0].writes.push('#ky-nowhere'); W(e, m); },
    register_twice: e => { const p = path.join(e, hello.path), t = fs.readFileSync(p, 'utf8') + '// KY.register( again\n'; fs.writeFileSync(p, t); const m = J(e); Object.assign(m.modules[0], { sha256: sha(Buffer.from(t)), bytes: Buffer.byteLength(t) }); W(e, m); },
    no_licence: e => { const m = J(e); m.modules[0].licence = ''; W(e, m); } };
  const out = { tool: toolFrom, previous_edition: prev, runs: [] };
  const c = mk('committed'); proof(c.e); const r0 = run(c.d);
  const e18 = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'].map(k => [k, r0.out.some(l => l.startsWith(k + ' PASS'))]);
  out.runs.push({ case: 'copy of the folder with team 4\'s records', expect: 'PASS, E1-E8 each PASS', exit: r0.exit, e1_e8: Object.fromEntries(e18), ok: r0.exit === 0 && e18.every(x => x[1]), out: r0.out });
  for (const [k, f] of Object.entries(mut)) { const m = mk(k); f(m.e); proof(m.e); const r = run(m.d);
    out.runs.push({ case: 'mutation ' + k, expect: 'FAIL (exit 1)', exit: r.exit, ok: r.exit === 1, fails: r.out.filter(l => / FAIL/.test(l)).slice(0, 4) }); }
  out.pass = out.runs.every(r => r.ok); return out;
}

// ------------------------------------------------------------------ main
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const S = prepareScratch();
  process.stderr.write(`scratch ${S.root}\npage: ${S.how}\norder: ${S.manifest.order.join(', ')}\nout ${OUT}\n`);
  const report = { schema: 'opus4.loader-test.v1', stamp: STAMP, started: new Date().toISOString(), url: `http://127.0.0.1:${PORT}/editions/${STAMP}/`, scratch: S.root, page: S.how, page_sha256: S.htmlSha,
    bases: S.bases, manifest: S.manifest, c0: null, c8: null, devices: [] };
  if (want('c0')) { report.c0 = handoffCheck(S); process.stderr.write(`[all] ${report.c0.pass ? 'PASS' : 'FAIL'} c0 MODULE.sha256 and the loader reference\n`); }
  if (want('c8')) { try { report.c8 = editionCheck(S); } catch (e) { report.c8 = { pass: false, error: String(e.stack || e).slice(0, 800) }; } process.stderr.write(`[all] ${report.c8.pass ? 'PASS' : 'FAIL'} c8 edition_check.py E1-E8 and its mutations\n`); }
  const server = await serve(S.root);
  let browser;
  try { browser = await chromium.launch({ args: LAUNCH }); for (const d of DEVICES) report.devices.push(await runDevice(browser, d, S)); }
  finally { if (browser) await browser.close().catch(() => {}); server.kill(); }
  const fails = [];
  for (const d of report.devices) for (const c of d.checks) if (!c.pass) fails.push(d.device + ' ' + c.id);
  if (report.c0 && !report.c0.pass) fails.push('c0'); if (report.c8 && !report.c8.pass) fails.push('c8');
  report.pass = fails.length === 0; report.fails = fails; report.finished = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  process.stderr.write(`\n${report.pass ? 'PASS' : 'FAIL'} · ${report.devices.map(d => d.device + ' ' + d.checks.filter(c => c.pass).length + '/' + d.checks.length).join(' · ')}${fails.length ? ' · failing: ' + fails.join(', ') : ''}\nreport ${path.join(OUT, 'report.json')}\n`);
  process.exit(report.pass ? 0 : 1);
})().catch(e => { process.stderr.write('HARNESS ERROR ' + (e.stack || e) + '\n'); process.exit(2); });
