#!/usr/bin/env node
// test.cjs: NL-010 step 4 "the Kuiper cartridge law", tests 1-9 (ROADMAP.md step 4; team-2/STEPS.md step 4 acceptance).
//
//   node test.cjs <edition-url> <outdir> [--page <patched index.html>] [--devices "Pixel 7,Galaxy S24"]
//
// <edition-url> is http://127.0.0.1:<port>/editions/202611012135/ served from the kuiper-belt root. Until the
// integrator applies handoff/04-loader/index.html.patch, pass --page with the patched file and the test serves it in
// place of index.html (served, not committed). The manifests and every mutated module are served by the test through
// page.route, never written into the repository. Pixel 7 and Galaxy S24 (360 px), real touch (page.touchscreen.tap),
// pageerror 0 in every case; console errors 0 except the browser's own "Failed to load resource" line in the cases that
// serve a 404 on purpose (6 and 7b), which is counted and reported. Test 8 runs tools/edition_check.py (from
// handoff/04-loader/edition_check.py.patch when the tool is not in the repository yet) on a copy. Exit 0 when all pass.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const argv = process.argv.slice(2), pos = argv.filter((a, i) => !a.startsWith('--') && !(i && argv[i - 1].startsWith('--')));
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
if (pos.length < 2) { console.error('usage: node test.cjs <edition-url> <outdir> [--page file] [--devices A,B]'); process.exit(2); }
const BASE = pos[0].replace(/\/?$/, '/'), OUT = path.resolve(pos[1]), PAGE = flag('--page');
const DEVICES = (flag('--devices') || 'Pixel 7,Galaxy S24').split(',').map(s => s.trim());
const HERE = __dirname, ED = path.resolve(HERE, '../..'), REPO = path.resolve(ED, '../..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------------------------------------- fixtures
const FIRST = JSON.parse(fs.readFileSync(path.join(HERE, 'modules.json'), 'utf8'));
const HELLO = fs.readFileSync(path.join(ED, FIRST.modules[0].path));
const STAMP = '202611012145';
const HOOKS28 = ['keyPlace', 'address', 'describe', 'findBy', 'flyTo', 'home', 'homeCamera', 'safeBox', 'lightTime', 'showNew',
  'goKey', 'fmt', 'words', 'esc', 'cv', 'ov', 'o2', 'hud', 'big', 'sub', 'card', 'gbox', 'gin', 'SPACE', 'N', 'repos', 'commits', 'wafer'];
function probe(id, requires, body) {           // a test-only module, served by the test, never committed
  return Buffer.from(`/* kuiper module ${id}, generation ${STAMP} (UTC), Apache-2.0 (kuiper-belt) */
// test-only probe of handoff/04-loader/test.cjs; served by the test, never committed
(function () {
  'use strict';
  KY.register({ schema: 'kuiper.module.v1', id: '${id}', generation: '${STAMP}', requires: ${JSON.stringify(requires)}, provides: ['${id}'],
    install(KY) { const h = document.createElement('div'); h.id = 'ky-${id}'; h.hidden = true; document.body.appendChild(h); ${body || 'return { ok: true };'} },
    inspect() { return { id: '${id}' }; } });
})();
`);
}
function rec(id, file, buf, requires, extra) {
  return Object.assign({ id, generation: STAMP, path: 'modules/' + file, sha256: sha(buf), bytes: buf.length, byte_budget: 4096,
    requires, provides: [id], reads: [], writes: ['window.KY.modules.' + id, '#ky-' + id], creates_controls: 'none',
    licence: 'Apache-2.0', team: '04', step: 4, proof: 'handoff/04-loader/' }, extra || {});
}
const PA = probe('probe-a', ['keyPlace', 'cam']), PB = probe('probe-b', ['keyPlace', 'probe-a']);
const PW = probe('probe-w', ['wafer', 'N'], `window.__probeW = { installed_ms: performance.now(), N_at_install: KY.hooks.N };
      return KY.hooks.wafer.then(w => { window.__probeW.resolved_ms = performance.now(); window.__probeW.N = w.N; return { N: w.N }; },
        e => { window.__probeW.rejected = String(e && e.message || e); throw e; });`);
function manifest(mods) { return Object.assign({}, FIRST, { order: mods.map(m => m.id), modules: mods }); }
const R_HELLO = FIRST.modules[0];
const R_PA = rec('probe-a', STAMP + '-probe-a.js', PA, ['keyPlace', 'cam']);
const R_PB = rec('probe-b', STAMP + '-probe-b.js', PB, ['keyPlace', 'probe-a']);
const R_PW = rec('probe-w', STAMP + '-probe-w.js', PW, ['wafer', 'N']);
const THREE = manifest([R_HELLO, R_PA, R_PB]);
const files = { [R_PA.path]: PA, [R_PB.path]: PB, [R_PW.path]: PW };

// ------------------------------------------------------------------------------------------- one run
async function run(browser, dev, name, o) {
  const ctx = await browser.newContext({ ...devices[dev] }), page = await ctx.newPage();
  const errors = [], consoleErr = [];
  page.on('pageerror', e => errors.push(String(e && e.message || e)));
  page.on('console', m => { if (m.type() === 'error') consoleErr.push(m.text()); });
  if (PAGE) await page.route(u => u.href === BASE || u.href === BASE + 'index.html', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fs.readFileSync(PAGE) }));
  await page.route(BASE + 'modules.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o.manifest) }));
  const served = Object.assign({}, files, o.files || {});
  await page.route(u => u.href.startsWith(BASE + 'modules/'), r => { const p = r.request().url().slice(BASE.length);
    if (served[p] === 404) return r.fulfill({ status: 404, body: 'not found' });
    if (served[p]) return r.fulfill({ status: 200, contentType: 'text/javascript', body: served[p] });
    return r.continue(); });
  let waferAt = null;
  if (o.wafer === '404') await page.route(/cosmos\/wafer\.tsv$/, r => r.fulfill({ status: 404, body: 'not found' }));
  if (o.wafer === 'delay') await page.route(/cosmos\/wafer\.tsv$/, async r => { await sleep(o.delay || 12000); waferAt = Date.now(); await r.continue(); });
  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.done, null, { timeout: 90000 });
  await sleep(o.settle || 7000);
  const st = await page.evaluate(() => {
    const E = window.__KUIPER_EDITION__, nav = performance.getEntriesByType('navigation')[0], rf = document.getElementById('refuse');
    const rr = rf && rf.getBoundingClientRect();
    return { admitted: E.admitted, refused: E.refused, failures: E.failures, whole: E.whole || null, order: E.order, timings: E.timings,
      bytes: E.bytes, byte_budget: E.byte_budget, load_event_ms: Math.round(nav.loadEventStart), dcl_ms: Math.round(nav.domContentLoadedEventStart),
      refuse: rf ? { text: rf.textContent, role: rf.getAttribute('role'), rect: { left: rr.left, top: rr.top, right: rr.right, bottom: rr.bottom },
        visible: getComputedStyle(rf).display !== 'none' && rr.height > 0, inViewport: rr.left >= 0 && rr.top >= 0 && rr.right <= innerWidth && rr.bottom <= innerHeight } : null,
      hud: document.getElementById('hud').textContent, bar: !!document.getElementById('bar'), vw: innerWidth, vh: innerHeight,
      hosts: [...document.querySelectorAll('[id^="ky-"]')].map(e => e.id), scripts: [...document.querySelectorAll('script[data-ky-module]')].map(s => s.dataset.kyModule),
      N: window.KY ? window.KY.hooks.N : null, probeW: window.__probeW || null,
      frozen: window.KY ? { KY: Object.isFrozen(window.KY), hooks: Object.isFrozen(KY.hooks), names: Object.isFrozen(KY.names), cam: Object.isFrozen(KY.cam),
        lit: Object.isFrozen(KY.lit), sel: Object.isFrozen(KY.sel), draw: Object.isFrozen(KY.draw), panels: Object.isFrozen(KY.panels) } : null,
      hookKeys: window.KY ? Object.keys(KY.hooks) : null, alias: window.KY ? window.__KUIPER_MODULES__ === KY.modules : null,
      writeThrows: (function () { 'use strict'; try { window.KY.hooks.flyTo = null; return false; } catch (e) { return e instanceof TypeError; } })(),
      helloInspect: window.KY && KY.modules.hello ? KY.modules.hello.inspect() : null };
  });
  // the wafer is drawn: non-black pixels of a CSS-px screenshot, outside the bar and the refusal strip
  const shot = await page.screenshot({ scale: 'css', timeout: 180000 });
  st.wafer = await page.evaluate(async ({ b64, skip }) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data, bar = document.getElementById('bar').getBoundingClientRect(); let lit = 0, n = 0;
    for (let y = Math.ceil(bar.bottom) + 2; y < c.height; y += 2) for (let X = 0; X < c.width; X += 2) {
      if (skip && X >= skip.left && X <= skip.right && y >= skip.top && y <= skip.bottom) continue;
      const i = (y * c.width + X) * 4; n++; if (d[i] + d[i + 1] + d[i + 2] > 60) lit++; }
    return { lit_fraction: +(lit / n).toFixed(4), sampled: n }; }, { b64: shot.toString('base64'), skip: st.refuse && st.refuse.rect });
  st.waferDrawn = st.wafer.lit_fraction > 0.01;
  if (o.shot) fs.writeFileSync(path.join(OUT, `${o.shot}-${dev.replace(/ /g, '_')}.png`), shot);
  if (o.touch) st.touch = await o.touch(page);
  st.pageerror = errors; st.console_errors = consoleErr; st.wall_ms = Date.now() - t0; st.wafer_delayed_until_ms = waferAt ? waferAt - t0 : null;
  await ctx.close();
  return st;
}
const sameOrder = (st, ids, m) => st.admitted.length === ids.length && st.admitted.every((a, i) => a.id === ids[i] && a.sha256 === m.modules.find(x => x.id === a.id).sha256);
const why = (st, id) => (st.refused.find(r => r.id === id) || {}).why || '';
const net404 = s => s.every(t => /Failed to load resource.*404/.test(t));

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const report = { url: BASE, page: PAGE || 'served index.html', started: new Date().toISOString(), devices: {}, test8: null };
  let allPass = true;
  for (const dev of DEVICES) {
    const T = {}; report.devices[dev] = T;
    const add = (k, pass, data) => { T[k] = Object.assign({ PASS: !!pass }, data); if (!pass) allPass = false; console.log(dev, k, pass ? 'PASS' : 'FAIL'); };
    let s;
    // 1 every order entry admitted in order with the manifest's sha256; readout lines; real touch opens READOUT
    s = await run(browser, dev, 't1', { manifest: THREE, shot: '1-admitted', touch: async page => {
      const b = await page.$('#bar .gm-title[data-panel="hud"]'); const r = await b.boundingBox();
      await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await sleep(1500);
      return page.evaluate(() => ({ open: document.getElementById('hud').classList.contains('gm-open'), lines: document.getElementById('hud').textContent.split('\n').filter(l => / admitted · [0-9a-f]{12}$/.test(l)) })); } });
    add('1', sameOrder(s, ['hello', 'probe-a', 'probe-b'], THREE) && !s.refused.length && !s.refuse && s.touch.open && s.touch.lines.length === 3
      && s.helloInspect && s.helloInspect.frames_drawn > 0 && !s.pageerror.length && !s.console_errors.length, s);
    // 2 one byte changed in a served module: sha256 mismatch, the rest admitted, alert inside the viewport, wafer drawn
    const bad = Buffer.from(HELLO); bad[bad.length - 2] ^= 1;
    s = await run(browser, dev, 't2', { manifest: THREE, files: { [R_HELLO.path]: bad }, shot: '2-sha-mismatch' });
    add('2', why(s, 'hello') === 'sha256 mismatch' && s.admitted.map(a => a.id).join() === 'probe-a,probe-b' && s.refuse && s.refuse.role === 'alert'
      && s.refuse.visible && s.refuse.inViewport && s.waferDrawn && s.bar && !s.hosts.includes('ky-hello') && !s.scripts.includes('hello') && !s.pageerror.length && !s.console_errors.length, s);
    // 3 requires noSuchHook: missing hook; host absent; the module that requires its provides refused too
    s = await run(browser, dev, 't3', { manifest: manifest([R_HELLO, Object.assign({}, R_PA, { requires: ['noSuchHook'] }), R_PB]) });
    add('3', why(s, 'probe-a') === 'missing hook noSuchHook' && why(s, 'probe-b') === 'missing hook probe-a' && s.admitted.map(a => a.id).join() === 'hello'
      && !s.hosts.includes('ky-probe-a') && !s.pageerror.length && !s.console_errors.length, s);
    // 4 renamed stamp: refused in words; renamed without leading digits: admitted (identity is generation + sha256)
    s = await run(browser, dev, 't4a', { manifest: manifest([R_HELLO, Object.assign({}, R_PA, { path: 'modules/202611012146-probe-a.js' })]), files: { 'modules/202611012146-probe-a.js': PA } });
    const s4b = await run(browser, dev, 't4b', { manifest: manifest([R_HELLO, Object.assign({}, R_PA, { path: 'modules/probe-a.js' })]), files: { 'modules/probe-a.js': PA } });
    add('4', why(s, 'probe-a') === 'stamp mismatch: generation 202611012145, file name 202611012146' && s.admitted.map(a => a.id).join() === 'hello'
      && s4b.admitted.map(a => a.id).join() === 'hello,probe-a' && !s.pageerror.length && !s4b.pageerror.length && !s.console_errors.length && !s4b.console_errors.length, { renamed: s, no_digits: s4b });
    // 5 install throws: install threw test, the rest admitted
    const thr = Buffer.from(HELLO.toString().replace('install(KY) {', "install(KY) { throw new Error('test');"));
    s = await run(browser, dev, 't5', { manifest: manifest([Object.assign({}, R_HELLO, { sha256: sha(thr), bytes: thr.length }), R_PA, R_PB]), files: { [R_HELLO.path]: thr } });
    add('5', why(s, 'hello') === 'install threw test' && s.admitted.map(a => a.id).join() === 'probe-a,probe-b' && !s.pageerror.length && !s.console_errors.length, s);
    // 6 file deleted: HTTP 404
    s = await run(browser, dev, 't6', { manifest: THREE, files: { [R_HELLO.path]: 404 } });
    add('6', why(s, 'hello') === 'HTTP 404' && s.admitted.map(a => a.id).join() === 'probe-a,probe-b' && !s.pageerror.length && net404(s.console_errors), s);
    // 7 empty manifest: whole wafer and bar, admitted [], no alert, KY frozen, the 28 hooks, the alias
    s = await run(browser, dev, 't7', { manifest: manifest([]), shot: '7-empty' });
    add('7', s.waferDrawn && s.bar && !s.admitted.length && !s.refused.length && !s.refuse && s.frozen && Object.values(s.frozen).every(Boolean) && s.writeThrows
      && JSON.stringify(s.hookKeys) === JSON.stringify(HOOKS28) && s.alias && !s.pageerror.length && !s.console_errors.length, s);
    // 7b wafer.tsv 404: modules that do not require the wafer admitted, the engine's words in the strip, the wafer module's install rejects in words
    s = await run(browser, dev, 't7b', { manifest: manifest([R_HELLO, R_PA, R_PW]), wafer: '404' });
    add('7b', s.admitted.map(a => a.id).join() === 'hello,probe-a,probe-w' && s.refuse && /did not load\. The wafer will not invent its keys\./.test(s.refuse.text)
      && s.probeW && /did not load/.test(s.probeW.rejected || '') && s.failures.some(f => f.id === 'probe-w') && !s.pageerror.length && net404(s.console_errors), s);
    // 7c wafer.tsv held back 12 s: hello is admitted while the 535,037-byte fetch is still pending
    s = await run(browser, dev, 't7c', { manifest: manifest([R_HELLO, R_PW]), wafer: 'delay', delay: 12000, settle: 16000 });
    const hAd = (s.admitted.find(a => a.id === 'hello') || {}).t_ms;
    add('7c', hAd != null && s.probeW && s.probeW.N_at_install === 0 && s.probeW.resolved_ms > hAd + 5000 && s.N > 0 && !s.pageerror.length && !s.console_errors.length,
      Object.assign(s, { hello_admitted_ms: hAd, wafer_resolved_ms: s.probeW && Math.round(s.probeW.resolved_ms) }));
    // 9 measured, no threshold: load to last admitted; sum of bytes against sum of byte_budget (from test 1's manifest)
    const t1 = T['1'];
    add('9', t1.timings.last_admitted_ms != null, { nav_to_last_admitted_ms: t1.timings.last_admitted_ms, load_event_ms: t1.load_event_ms,
      load_to_last_admitted_ms: t1.timings.last_admitted_ms - t1.load_event_ms, loader_start_ms: t1.timings.loader_start_ms,
      bytes: t1.bytes, byte_budget: t1.byte_budget, modules: t1.admitted.length, note: 'SwiftShader in Playwright, served from 127.0.0.1; negative load_to_last_admitted means the last module was admitted before the load event' });
  }
  // 8 edition_check.py E1-E8 PASS on the integrated copy, FAIL on each mutation applied to a copy
  report.test8 = test8(); if (!report.test8.PASS) allPass = false; console.log('test 8', report.test8.PASS ? 'PASS' : 'FAIL');
  report.PASS = allPass; report.finished = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  await browser.close();
  console.log('RESULT:', allPass ? 'PASS' : 'FAIL'); process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });

function test8() {
  const tmp = fs.mkdtempSync(path.join(process.env.KY_TMP || os.tmpdir(), 'ky-t8-')), out = {};
  const mk = name => { const d = path.join(tmp, name), e = path.join(d, 'editions', '202611012135');
    fs.mkdirSync(path.join(e, 'modules'), { recursive: true }); fs.mkdirSync(path.join(d, 'tools'));
    fs.copyFileSync(path.join(REPO, 'editions', 'index.html'), path.join(d, 'editions', 'index.html'));
    fs.cpSync(path.join(REPO, 'editions', '202611012027'), path.join(d, 'editions', '202611012027'), { recursive: true });
    for (const f of ['index.html', 'keys.json', 'README.md']) fs.copyFileSync(path.join(ED, f), path.join(e, f));
    for (const f of [R_HELLO.path, FIRST.references[0].file]) fs.copyFileSync(path.join(ED, f), path.join(e, f));
    fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(FIRST, null, 1));
    if (!fs.readFileSync(path.join(e, 'index.html'), 'utf8').includes('KUIPER HOOK TABLE AND LOADER'))
      cp.execFileSync('patch', ['-p1', '-s', '-i', path.join(HERE, 'index.html.patch')], { cwd: d });
    const tool = path.join(REPO, 'tools', 'edition_check.py');
    if (fs.existsSync(tool)) fs.copyFileSync(tool, path.join(d, 'tools', 'edition_check.py'));
    else cp.execFileSync('patch', ['-p1', '-s', '-i', path.join(HERE, 'edition_check.py.patch')], { cwd: d });
    return { d, e }; };
  const proof = e => { const lines = []; const walk = p => { for (const f of fs.readdirSync(p).sort()) { const q = path.join(p, f);
      if (fs.statSync(q).isDirectory()) { if (f !== 'handoff') walk(q); } else if (!q.endsWith('edition-sha256.txt')) lines.push(sha(fs.readFileSync(q)) + '  ./' + path.relative(e, q)); } };
    walk(e); fs.mkdirSync(path.join(e, 'proof'), { recursive: true }); fs.writeFileSync(path.join(e, 'proof', 'edition-sha256.txt'), lines.join('\n') + '\n'); };
  const check = d => { const r = cp.spawnSync('python3', ['tools/edition_check.py', 'editions/202611012135'], { cwd: d, encoding: 'utf8' }); return { rc: r.status, out: r.stdout.trim().split('\n') }; };
  const mut = {
    hash: e => { const p = path.join(e, R_HELLO.path), b = fs.readFileSync(p); b[b.length - 2] ^= 1; fs.writeFileSync(p, b); },
    stamp: e => { fs.renameSync(path.join(e, R_HELLO.path), path.join(e, 'modules/202611012146-hello.js'));
      const m = JSON.parse(fs.readFileSync(path.join(e, 'modules.json'))); m.modules[0].path = 'modules/202611012146-hello.js'; fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(m)); },
    requires: e => { const m = JSON.parse(fs.readFileSync(path.join(e, 'modules.json'))); m.modules[0].requires = ['noSuchHook']; fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(m)); },
    stray: e => fs.writeFileSync(path.join(e, 'modules/202611012150-stray.js'), '/* stray */\n'),
    writes: e => { const m = JSON.parse(fs.readFileSync(path.join(e, 'modules.json'))); m.modules[0].writes.push('#ky-nowhere'); fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(m)); },
    register_twice: e => { const p = path.join(e, R_HELLO.path), t = fs.readFileSync(p, 'utf8') + '// KY.register( again\n'; fs.writeFileSync(p, t);
      const m = JSON.parse(fs.readFileSync(path.join(e, 'modules.json'))); m.modules[0].sha256 = sha(Buffer.from(t)); m.modules[0].bytes = Buffer.byteLength(t); fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(m)); },
    no_licence: e => { const m = JSON.parse(fs.readFileSync(path.join(e, 'modules.json'))); m.modules[0].licence = ''; fs.writeFileSync(path.join(e, 'modules.json'), JSON.stringify(m)); } };
  const c0 = mk('committed'); proof(c0.e); out.integrated = check(c0.d);
  let pass = out.integrated.rc === 0 && ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'].every(k => out.integrated.out.some(l => l.startsWith(k + ' PASS')));
  out.mutations = {};
  for (const [k, f] of Object.entries(mut)) { const c = mk(k); f(c.e); proof(c.e); const r = check(c.d); out.mutations[k] = r; if (r.rc !== 1) pass = false; }
  out.PASS = pass; fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}
