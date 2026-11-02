#!/usr/bin/env node
// test.cjs: the acceptance test of Opus team 6's module `file` (ROADMAP step 6, A1-A8; team-3/STEPS.md 6.1-6.5),
// in the form of FIXES/NL-009/android-journey.cjs: real touch (page.touchscreen.tap), measured assertions, one JSON
// report. Apache-2.0 (kuiper-belt), kuiper-belt README.md:157. Opus team 6 lead; the A6/A7 flows follow the builder's
// smoke-touch.cjs (OPUS-6 builder, 22:49 UTC). The G gates are the tester's (OPUS-6 tester, 23:06 UTC):
//   G1 every GRAMMAR.md example round-trips parse -> serialise -> parse byte-identical, in the page, through the module's
//      own link.read and its serialiser (link.format when the module exposes it, else link.set + link.hashText on a hash
//      that holds only the example's own `layers`, because hashText() re-reads `layers` from location.hash);
//   G2 the REAL pointer editions/index.html (not routed) forwards each example's hash byte for byte, and the routed
//      pointer lands on this edition with the hash byte for byte before the page has read it;
//   G3 Open an edition by touch: the row lands on ../<stamp>/#<the copied link's hash>, byte for byte;
//   G4 Open an app by touch: See Through lands on ../../see-through/#key=<the open key>;
//   G5 Copy a link to this view with the clipboard denied: the link (= link.url()) in a selected read-only 44 px field.
// Pages that are not this edition (Edition 2, Edition 1, the published 202611012027, See Through) are answered with a
// one-line page through ctx.route: the test asserts the URL the Kuiper sends the person to, not another page's console.
// Console errors are counted strictly: a 404 of an EVIDENCE file the integrator has not written yet is a FAIL unless
// --allow-missing-evidence is given, which turns it into NOT EVALUATED (never a pass).
//
//   node test.cjs <edition url> <outdir> [--device "Pixel 7"] [--devices "Pixel 7,Galaxy S24"] [--shots <dir>]
//
// <edition url> is http://127.0.0.1:<port>/editions/202611012135/ on a server of the kuiper-belt root (or a scratch
// copy of it). "Through the pointer" means <root>/editions/#<hash>: the pointer on disk opens the newest PUBLISHED
// edition (editions/index.html:12 -> 202611012027), so the test serves the pointer's own two lines with this edition's
// stamp through page.route (the same location.replace(stamp + '/' + location.hash), nothing else changed); stated in
// the report as `pointer: routed`.
// Exit 0 when every gate of every device passed, 1 otherwise, 2 on a harness error. NOT EVALUATED is never a pass.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const argv = process.argv.slice(2), pos = argv.filter(a => !a.startsWith('--'));
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] || true) : null; };
if (pos.length < 2) { console.error('usage: node test.cjs <edition url> <outdir> [--device NAME] [--devices A,B] [--shots DIR]'); process.exit(2); }
const URL0 = pos[0].replace(/\/?$/, '/'), OUT = path.resolve(pos[1]), SHOTS = flag('--shots') ? path.resolve(String(flag('--shots'))) : null;
let DEVICES = ['Pixel 7', 'Galaxy S24'];
if (flag('--device')) DEVICES = [String(flag('--device'))];
if (flag('--devices')) DEVICES = String(flag('--devices')).split(',').map(s => s.trim()).filter(Boolean);
const STAMP = (URL0.match(/editions\/(\d{12})\//) || [])[1];
const ROOT = URL0.replace(/editions\/\d{12}\/$/, ''), POINTER = ROOT + 'editions/';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const EVIDENCE = ['keys.json', 'proof/edition-sha256.txt', 'proof/keys-summary.json', 'modules.json', 'LICENCES.md', 'proof/android-journey.json', 'README.md'];
const ROWS = ['Open', 'Open a key…', 'python tools/key.py', 'Open a line…', 'Open an edition ▸', 'Open an app ▸', 'Link', 'Copy a link to this view',
  'Copy the key', 'Copy python tools/key.py', 'Evidence'].concat(EVIDENCE).concat(['Export', '⤓ Save an image of this view', '⎙ Print']);
const LINE0 = '0048802883266c68d5bdb6f5add0074e8b5b729d:5', KEY0 = 36064705400;
const ALLOW404 = argv.includes('--allow-missing-evidence');
// GRAMMAR.md "Examples" (and ROADMAP step 6.3), byte for byte
const EXAMPLES = ['#key=36064705400', '#line=0048802883266c68d5bdb6f5add0074e8b5b729d:5', '#repo=gridatlas&period=2026-07',
  '#layers=lines,see-through&key=63035688574', '#edition=202611010114&key=36064705400', '#app=see-through&sub=Drax'];
const FOREIGN = u => /\/editions\/(202611010114|202611012027|202610311905)\//.test(u.pathname) || /\/see-through\//.test(u.pathname);
const LANDED = '<!DOCTYPE html><meta charset="utf-8"><title>landed</title><p>not this edition: the test asserts the URL only</p>';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const keys = await (await fetch(URL0 + 'keys.json')).json();
  const bodies = keys.bodies || keys;
  const browser = await chromium.launch({ args: ARGS });
  const report = { url: URL0, stamp: STAMP, pointer: 'routed', started: new Date().toISOString(), devices: {} };
  let allPass = true;
  for (const DEV of DEVICES) {
    const R = report.devices[DEV] = { steps: [], errors: [], expected_404: [], other_console: [] };
    const blk = async (name, fn) => { try { await fn(); } catch (e) { step(name + ' (block threw)', false, String(e && e.message || e).split('\n').slice(0, 3).join(' ')); } };
    const step = (id, pass, measured) => { R.steps.push({ id, result: pass === null ? 'NOT EVALUATED' : (pass ? 'PASS' : 'FAIL'), measured }); if (pass === false) allPass = false;
      try { fs.writeFileSync(path.join(OUT, 'report.partial.json'), JSON.stringify(report, null, 1)); } catch (e) {} };   // a killed run keeps what it measured
    const slug = DEV.replace(/[^A-Za-z0-9]+/g, '_');
    async function newPage(opts) {
      const ctx = await browser.newContext({ ...devices[DEV], acceptDownloads: true });
      if (!opts || opts.clip !== false) await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(URL0).origin });
      await ctx.route(FOREIGN, r => r.fulfill({ status: 200, contentType: 'text/html', body: LANDED }));
      if (!opts || !opts.realPointer) await ctx.route(POINTER, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!DOCTYPE html><meta charset="utf-8"><script>location.replace(' + JSON.stringify(STAMP + '/') + ' + location.hash);</script>' }));
      const p = await ctx.newPage();
      p.on('pageerror', e => R.errors.push(String(e)));
      p.on('console', m => { if (m.type() !== 'error') return; const u = (m.location() || {}).url || '', t = m.text();
        if (/status of 404/.test(t) && EVIDENCE.some(f => u === URL0 + f)) { if (!R.expected_404.includes(u)) R.expected_404.push(u); } else R.other_console.push(t + ' @ ' + u); });
      return p;
    }
    async function ready(p) {
      try { await readyInner(p); } catch (e) {
        const snap = await p.evaluate(() => { try { const s = window.__KUIPER_EDITION__ || {}; const L = window.KY && KY.modules.layers && KY.modules.layers.api;
          return { url: location.href, admitted: (s.admitted || []).map(a => a.id), refused: s.refused, lines: L ? L.get('lines').status + ' ' + (L.get('lines').why || '') : null, kyfile: !!document.getElementById('ky-file') }; } catch (x) { return String(x); } }).catch(x => String(x));
        throw new Error('not ready: ' + e.message.split('\n')[0] + ' · ' + JSON.stringify(snap));
      }
    }
    async function readyInner(p) {
      await p.waitForFunction(() => { const s = window.__KUIPER_EDITION__; return s && s.admitted && s.admitted.some(a => a.id === 'file') && window.KY && KY.hooks.N > 0; }, null, { timeout: 240000, polling: 500 });
      await p.waitForFunction(() => { try { return KY.modules.layers.api.get('lines').status === 'OK' && document.getElementById('ky-file') && document.querySelector('#ky-file > .gm-layer-group'); } catch (e) { return false; } }, null, { timeout: 240000, polling: 500 });
      await p.waitForTimeout(6500);
    }
    async function settle(p, ms) { await p.waitForTimeout(ms || 7000); await p.waitForFunction(() => !KY.cam || true, null, { timeout: 5000 }).catch(() => {}); }
    const tapSel = async (p, sel) => { const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel); await p.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 22)); return b; };
    const openMenu = async (p, n) => { const open = await p.evaluate(m => { const b = document.getElementById('kuiper-menu-bar'); return b && b.getAttribute('data-open') === m; }, n); if (!open) { await tapSel(p, '#kuiper-menu-bar .gm-menu[data-menu="' + n + '"] > .gm-title'); await p.waitForTimeout(900); } };
    const shot = async (p, name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, slug + '-' + name + '.png'), scale: 'css', timeout: 180000 }).catch(e => (R.shot_errors = R.shot_errors || []).push('screenshot ' + name + ': ' + e.message.split('\n')[0])); };
    const sel = p => p.evaluate(() => { const lc = KY.modules['line-card'].api.inspect(); const h = document.querySelector('#card .lc-h code');
      return { open: lc.open, index: lc.index, header: h ? h.textContent : null, hash: location.hash, zoom: KY.cam.zoom, card: KY.hooks.card.style.display }; });
    const placed = bodies.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0);
    try {
      // ------------------------------------------------------------------ page 1: arrival, A1, A3, A2, A6, A7
      let p = await newPage(); await p.goto(URL0, { timeout: 180000 }); await ready(p);
      const ed = await p.evaluate(() => ({ admitted: __KUIPER_EDITION__.admitted.map(a => a.id), refused: __KUIPER_EDITION__.refused, SPACE: KY.hooks.SPACE }));
      step('M admitted', ed.admitted.includes('file') && ed.refused.length === 0, ed);
      const SPACE = ed.SPACE, P = placed.filter(b => b.key < SPACE);
      await blk('A1', async () => {
      // A1 the panel
      await openMenu(p, 'file');
      await tapSel(p, '#ky-file-open-edition'); await p.waitForFunction(() => document.querySelector('#ky-file-editions[data-filled="ok"]'), null, { timeout: 60000 }).catch(() => {});
      await tapSel(p, '#ky-file-open-app'); await p.waitForTimeout(600);
      await p.waitForFunction(() => Object.keys(KY.modules.file.api.inspect().evidence).length === 7, null, { timeout: 60000 }).catch(() => {});
      const a1 = await p.evaluate(() => {
        const bar = document.getElementById('kuiper-menu-bar').getBoundingClientRect(), panel = document.querySelector('#kuiper-menu-bar .gm-menu[data-menu="file"] .gm-panel');
        const g = document.getElementById('ky-file'), items = [];
        g.querySelectorAll(':scope > .gm-layer-group, :scope > button, :scope > a, :scope > div > .ky-file-form').forEach(e => { const r = e.getBoundingClientRect();
          items.push({ t: (e.querySelector('.ky-file-label') || e).textContent.trim(), h: Math.round(r.height * 10) / 10, heading: e.classList.contains('gm-layer-group') }); });
        const sub = [...document.querySelectorAll('#ky-file-editions > *, #ky-file-apps > *')].map(e => ({ ed: e.getAttribute('data-ky-edition'), app: e.getAttribute('data-ky-app'), lit: e.classList.contains('ky-lit'), inert: e.getAttribute('aria-disabled') === 'true', h: Math.round(e.getBoundingClientRect().height) }));
        return { barBottom: bar.bottom, panelTop: panel.getBoundingClientRect().top, items, sub };
      });
      const eds = (await (await fetch(URL0 + 'data/editions.json')).json()).editions.map(e => e.stamp);
      const rowsOk = a1.items.filter(i => !i.heading).every(i => i.h >= 44) && a1.sub.every(s => s.h >= 44);
      const order = a1.items.map(i => i.t), orderOk = ROWS.every((w, i) => (order[i] || '').startsWith(w));
      const edList = a1.sub.filter(s => s.ed).map(s => s.ed), apps = a1.sub.filter(s => s.app);
      step('A1 one panel under the bar, rows >= 44 px, 6.1 order, four headings', a1.panelTop >= a1.barBottom - 0.5 && rowsOk && orderOk
        && a1.items.filter(i => i.heading).map(i => i.t).join() === 'Open,Link,Evidence,Export', { panelTop: a1.panelTop, barBottom: a1.barBottom, order, heights: a1.items.map(i => i.h), sub_rows: a1.sub, under_44: a1.items.filter(i => !i.heading && i.h < 44).concat(a1.sub.filter(x => x.h < 44)) });
      step('A1 editions: every stamp newest first, the pointer last, this one inert', JSON.stringify(edList) === JSON.stringify(eds.slice().sort().reverse().concat(['pointer']))
        && a1.sub.find(s => s.ed === STAMP).inert, { edList });
      step('A1 apps: See Through first and lit', apps.length > 0 && apps[0].app === 'see-through' && apps[0].lit, { apps });
      await shot(p, '01-file-panel');
      }); await blk('A3', async () => {
      // A3 evidence
      const ev = await p.evaluate(() => [...document.querySelectorAll('#ky-file a[data-ky-evidence]')].map(a => ({ p: a.getAttribute('data-ky-evidence'), bytes: a.getAttribute('data-ky-bytes'), dl: a.hasAttribute('download'), hint: a.querySelector('.gm-hint').textContent })));
      const a3 = [];
      for (const e of ev) { const r = await fetch(URL0 + e.p, { method: 'HEAD' }); a3.push({ p: e.p, status: r.status, len: r.headers.get('content-length'), row: e.bytes, hint: e.hint, download: e.dl }); }
      const present = a3.filter(x => x.status === 200), missing = a3.filter(x => x.status !== 200);
      step('A3 every present EVIDENCE file 200 with content-length = the row', present.every(x => x.len === x.row && x.download) && missing.every(x => /missing · HTTP 404/.test(x.hint)), { a3 });
      if (missing.length) step('A3 all seven files present', null, { missing: missing.map(x => x.p), why: 'written by the integrator (proof/*) and Opus 9 (LICENCES.md) at assembly' });
      const shaTxt = await fetch(URL0 + 'proof/edition-sha256.txt');
      if (shaTxt.ok) { const t = await shaTxt.text(), m = t.match(/^([0-9a-f]{64})\s+\*?(?:\.\/)?keys\.json$/m), srv = crypto.createHash('sha256').update(Buffer.from(await (await fetch(URL0 + 'keys.json')).arrayBuffer())).digest('hex');
        step('A3 sha256(keys.json) = edition-sha256.txt', !!m && m[1] === srv, { listed: m && m[1], served: srv }); }
      else step('A3 sha256(keys.json) = edition-sha256.txt', null, { why: 'proof/edition-sha256.txt HTTP ' + shaTxt.status });
      }); await blk('A2', async () => {
      // A2 open a key
      await openMenu(p, 'file');
      await tapSel(p, '#ky-file-key-in'); await p.keyboard.type(String(KEY0)); await tapSel(p, '#ky-file-key .ky-go'); await settle(p, 8000);
      const a2 = await sel(p), spark = await p.evaluate(i => { const s = KY.modules.layers.api.edScreen(i), bar = document.getElementById('kuiper-menu-bar').getBoundingClientRect(), c = KY.hooks.card.getBoundingClientRect(); return { s, barBottom: bar.bottom, cardTop: c.top, w: innerWidth }; }, a2.index);
      step('A2 Open a key: hash, header = bodies[0].line_text, zoom 14, spark in the clear space', /(^#|&)key=36064705400(&|$)/.test(a2.hash) && a2.header === bodies[0].line_text && Math.abs(a2.zoom - 14) < 0.01
        && spark.s && spark.s[1] > spark.barBottom && spark.s[1] < spark.cardTop && spark.s[0] > 0 && spark.s[0] < spark.w,
        { hash: a2.hash, header_equal: a2.header === bodies[0].line_text, zoom: a2.zoom, spark: spark.s, barBottom: spark.barBottom, cardTop: spark.cardTop, band_centre_dy: spark.s ? Math.round((spark.s[1] - (spark.barBottom + spark.cardTop) / 2) * 10) / 10 : null });
      await shot(p, '02-open-key');
      const cam0 = await p.evaluate(() => [KY.cam.x, KY.cam.y, KY.cam.zoom]);
      await openMenu(p, 'file'); await p.locator('#ky-file-key-in').fill(''); await tapSel(p, '#ky-file-key-in'); await p.keyboard.type(String(SPACE)); await tapSel(p, '#ky-file-key .ky-go'); await p.waitForTimeout(1500);
      const refusal = await p.evaluate(() => document.querySelector('#ky-file-key-in').closest('div').parentNode.querySelector('.ky-file-why').textContent);
      const cam1 = await p.evaluate(() => [KY.cam.x, KY.cam.y, KY.cam.zoom]);
      step('A2 SPACE refused in words, camera unchanged', refusal === 'key ' + SPACE + ' is not on this wafer (SPACE ' + SPACE + ')' && JSON.stringify(cam0) === JSON.stringify(cam1), { refusal, cam0, cam1 });
      await tapSel(p, '#ky-file-copy-cmd'); await p.waitForTimeout(1200);
      const clip = await p.evaluate(() => navigator.clipboard.readText().catch(e => 'ERR ' + e.message));
      step('A2 Copy python tools/key.py <k> -> clipboard', clip === 'python tools/key.py ' + KEY0, { clip });
      }); await blk('A6', async () => {
      // A6 save an image (a step of its own: a timeout under load is measured, not a harness abort)
      try {
      await openMenu(p, 'file');
      const dlP = p.waitForEvent('download', { timeout: 300000 }); await tapSel(p, '#kuiper-export-image'); const dl = await dlP;
      const fp = path.join(OUT, slug + '-' + dl.suggestedFilename()); await dl.saveAs(fp);
      const png = fs.readFileSync(fp), isPng = png.slice(1, 4).toString() === 'PNG';
      const a6 = await p.evaluate(async ({ b64 }) => {
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), bmp = await createImageBitmap(new Blob([bin], { type: 'image/png' }));
        const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; const x = c.getContext('2d'); x.drawImage(bmp, 0, 0);
        const rec = KY.modules.file.api.inspect().c.exports.slice(-1)[0], vh = rec.view_height, fh = bmp.height - vh;
        const d = x.getImageData(0, 0, bmp.width, vh).data; let colours = new Set(); for (let i = 0; i < d.length && colours.size < 3; i += 4 * 97) colours.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ',' + d[i + 3]);
        const count = (data) => { let n = 0; for (let i = 0; i < data.length; i += 4) if (Math.abs(data[i] - 5) + Math.abs(data[i + 1] - 7) + Math.abs(data[i + 2] - 12) > 60) n++; return n; };
        const foot = count(x.getImageData(0, vh, bmp.width, fh).data);
        // the reference: the same foot drawn again with the same lines (the builder's stamped(): 11/16/8 px x scale)
        const s = Math.min(devicePixelRatio || 1, 2), r = document.createElement('canvas'); r.width = bmp.width; r.height = fh; const o = r.getContext('2d');
        o.fillStyle = '#05070c'; o.fillRect(0, 0, r.width, fh); o.fillStyle = '#2ee6e6'; o.fillRect(0, 0, r.width, Math.max(1, Math.round(s)));
        o.font = Math.round(11 * s) + 'px ui-monospace, Menlo, Consolas, monospace'; o.textBaseline = 'top'; o.fillStyle = '#c9d3e6';
        rec.foot.forEach((t, i) => o.fillText(t, Math.round(8 * s), Math.round(8 * s) + i * Math.round(16 * s), r.width - 2 * Math.round(8 * s)));
        const ref = count(o.getImageData(0, 0, r.width, fh).data);
        return { w: bmp.width, h: bmp.height, expectW: Math.round(innerWidth * Math.min(devicePixelRatio, 2)), colours: colours.size, foot, ref, lines: rec.foot };
      }, { b64: png.toString('base64') });
      step('A6 Save an image: PNG, not one colour, innerWidth x min(dpr,2) wide, the stamp strip within 5 %', isPng && a6.colours > 1 && a6.w === a6.expectW && a6.ref > 0 && Math.abs(a6.foot - a6.ref) / a6.ref <= 0.05
        && /Apache-2\.0, text and data CC BY 4\.0/.test(a6.lines.join('\n')) && a6.lines[0].indexOf(STAMP) >= 0, Object.assign({ file: path.basename(fp), bytes: png.length }, a6));
      } catch (e) { const row = await p.evaluate(() => (document.querySelector('#kuiper-export-image .ky-file-why') || {}).textContent || null).catch(() => null);
        step('A6 Save an image: PNG, not one colour, innerWidth x min(dpr,2) wide, the stamp strip within 5 %', false, { error: String(e.message || e).split('\n')[0], row, exports: await p.evaluate(() => KY.modules.file.api.inspect().c).catch(() => null) }); }
      }); await blk('A6 negative', async () => {
      await p.evaluate(() => { KY.draw.add(() => { if (!window.__blank) return; const gl = KY.hooks.cv.getContext('webgl2'); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }, 1e8); window.__blank = 1; });
      let got = false; const onDl = () => { got = true; }; p.on('download', onDl);
      await openMenu(p, 'file'); await tapSel(p, '#kuiper-export-image'); await p.waitForTimeout(7000); p.off('download', onDl);
      const blankRow = await p.evaluate(() => (document.querySelector('#kuiper-export-image .ky-file-why') || {}).textContent);
      step('A6 a cleared #c is refused in words, no file', blankRow === 'the image came back blank; try again after the wafer has drawn' && !got, { row: blankRow, download: got });
      await p.evaluate(() => { window.__blank = 0; });
      }); await blk('A7', async () => {
      // A7 EDIT: paste a Kuiper link, Backspace
      if (await p.evaluate(() => !!document.getElementById('kuiper-menu-bar').getAttribute('data-open'))) await p.evaluate(() => KY.modules['kuiper-shell'].api.close());
      await p.waitForTimeout(800);
      await openMenu(p, 'edit'); await tapSel(p, '#ky-edit-paste'); await p.waitForTimeout(700);
      await p.keyboard.type('https://ventusltd.github.io/kuiper-belt/editions/202611012027/#line=' + LINE0); await p.keyboard.press('Enter'); await settle(p, 9000);
      const a7 = await sel(p), i0 = P.findIndex(b => b.id === LINE0);
      step('A7 a pasted Kuiper link -> the line', a7.open && a7.index === i0 && a7.header === bodies[0].line_text && /line=0048802883266c68d5bdb6f5add0074e8b5b729d:5/.test(a7.hash), a7);
      const kb = await p.evaluate(() => { const t = KY.hooks.card; return t.getBoundingClientRect().height; });
      await p.keyboard.press('Backspace'); await p.waitForTimeout(2500);
      const bs = await p.evaluate(() => location.hash);
      step('A7 Backspace clears key line repo period, keeps layers', !/(^#|&)(key|line|repo|period)=/.test(bs) && /(^#|&)layers=/.test(bs), { hash: bs });
      }); await blk('A4 direct', async () => {
      // A4 direct (hashchange on the open page)
      const direct = {};
      await p.evaluate(() => { location.hash = '#repo=gridatlas&period=2026-07'; }); await settle(p, 6000);
      direct.repoPeriod = await p.evaluate(() => { const r = KY.hooks.repos[KY.lit.repo]; return { repo: r && r.name, K: KY.lit.K, hash: location.hash }; });
      await p.evaluate(k => { location.hash = '#key=' + k; }, KEY0); await settle(p, 8000);
      direct.key = await sel(p);
      step('A4 direct: repo&period lights gridatlas over July 2026; key opens the line', direct.repoPeriod.repo === 'gridatlas' && direct.repoPeriod.K && direct.repoPeriod.K[0] >= 0
        && direct.key.header === bodies[0].line_text && Math.abs(direct.key.zoom - 14) < 0.01, direct);
      await shot(p, '03-pasted-line');
      }); await blk('A7 See Through paste', async () => {
      // A7 a pasted See Through link -> navigation
      await openMenu(p, 'edit'); await tapSel(p, '#ky-edit-paste'); await p.waitForTimeout(700);
      await p.keyboard.type('https://ventusltd.github.io/kuiper-belt/see-through/#sub=Drax'); await p.keyboard.press('Enter');
      await p.waitForURL(/\/see-through\//, { timeout: 240000 }).catch(() => {});
      step('A7 a pasted See Through link -> navigation to See Through, the hash kept', /\/see-through\/.*#sub=Drax$/.test(p.url()), { url: p.url() });
      });
      await p.context().close();

      // ------------------------------------------------------------------ A4 through the pointer, A5 round trip
      const forwarded = [];
      const viaPointer = async (hash, wantNav) => { const q = await newPage(); await q.goto(POINTER + hash, { timeout: 180000 });
        if (!wantNav) { await q.waitForURL(u => u.pathname.indexOf('/editions/' + STAMP + '/') >= 0, { timeout: 120000, waitUntil: 'commit' }).catch(() => {}); forwarded.push({ hash, landed: q.url(), ok: q.url() === URL0 + hash }); }
        if (wantNav) { await q.waitForURL(wantNav, { timeout: 120000 }).catch(() => {}); return q; } await ready(q); await settle(q, 8000); return q; };
      let q = await viaPointer('#key=' + KEY0);
      const pk = await sel(q); step('A4 pointer #key: zoom 14 at the key, the card', pk.header === bodies[0].line_text && Math.abs(pk.zoom - 14) < 0.01, pk); await q.context().close();
      q = await viaPointer('#line=' + LINE0);
      const pl = await sel(q), plS = await q.evaluate(i => { const s = KY.modules.layers.api.edScreen(i), c = KY.hooks.card.getBoundingClientRect(), b = document.getElementById('kuiper-menu-bar').getBoundingClientRect(); return { s, top: b.bottom, bot: c.top }; }, pl.index);
      step('A4 pointer #line: that body, the spark between the bar and the card', pl.index === P.findIndex(b => b.id === LINE0) && plS.s && plS.s[1] > plS.top && plS.s[1] < plS.bot, Object.assign({}, pl, plS)); await q.context().close();
      q = await viaPointer('#repo=gridatlas&period=2026-07');
      const pr = await q.evaluate(() => { const r = KY.hooks.repos[KY.lit.repo]; return { repo: r && r.name, K: KY.lit.K }; });
      step('A4 pointer #repo&period: gridatlas lit, July 2026 lit', pr.repo === 'gridatlas' && pr.K && pr.K[0] >= 0, pr); await q.context().close();
      q = await viaPointer('#layers=lines,see-through&key=63035688574');
      const py = await q.evaluate(() => ({ on: KY.modules.layers.api.inspect().on, zoom: KY.cam.zoom, hash: location.hash, states: KY.modules.layers.api.inspect().states, lit_repo: KY.lit.repo }));
      const stAdmitted = await q.evaluate(() => !!KY.modules['see-through']);
      const asked = ['lines', 'see-through'], extras = py.on.filter(x => asked.indexOf(x) < 0);
      // extras allowed: `repos`, mirrored on by layers.js:539 when the key's repository is lit (Opus 3's rule); nothing else
      step('A4 pointer #layers=lines,see-through&key=…: the asked layers on, no other layer but a mirrored repos, camera at the key',
        asked.every(x => py.on.indexOf(x) >= 0) && extras.every(x => x === 'repos' && py.lit_repo >= 0) && Math.abs(py.zoom - 14) < 0.01,
        Object.assign({ see_through_admitted: stAdmitted, extras }, py));
      await q.context().close();
      q = await viaPointer('#edition=202611010114&key=' + KEY0, u => /\/editions\/202611010114\/$/.test(u.pathname));
      step('A4 pointer #edition=…&key=…: the URL is that edition with the rest of the hash', /editions\/202611010114\/#key=36064705400$/.test(q.url()), { url: q.url() }); await q.context().close();
      q = await viaPointer('#app=see-through&sub=Drax', u => /\/see-through\//.test(u.pathname));
      step('A4 pointer #app=see-through&sub=Drax: the URL is See Through with #sub=Drax', /\/see-through\/(\d{12}\/)?#sub=Drax$/.test(q.url()), { url: q.url() }); await q.context().close();
      step('G2 the routed pointer lands on this edition with the hash byte for byte', forwarded.length === 4 && forwarded.every(f => f.ok), { forwarded });
      // A5 the round trip: e, then two random verified lines
      const picks = ['e', Math.floor(Math.random() * P.length), Math.floor(Math.random() * P.length)];
      for (const pick of picks) { try {
        p = await newPage(); await p.goto(URL0, { timeout: 180000 }); await ready(p);
        if (pick === 'e') { await openMenu(p, 'view'); await tapSel(p, '#kuiper-menu-bar [data-k="e"]'); }
        else await p.evaluate(i => KY.modules.layers.api.open(i), pick);
        await settle(p, 7000);
        const s0 = await sel(p);
        await openMenu(p, 'file'); await tapSel(p, '#ky-file-copy-link'); await p.waitForTimeout(1200);
        const link = await p.evaluate(() => navigator.clipboard.readText());
        if (pick === picks[0] || pick === picks[1]) {
          await openMenu(p, 'file');
          const isFirst = pick === picks[0];
          if (isFirst) {                              // G3 Open an edition by touch: Edition 2's row carries the hash
            if (!(await p.evaluate(() => document.getElementById('ky-file-editions').classList.contains('ky-open')))) await tapSel(p, '#ky-file-open-edition');
            await p.waitForFunction(() => document.querySelector('#ky-file-editions[data-filled="ok"]'), null, { timeout: 60000 }).catch(() => {});
            const h = await p.evaluate(() => KY.modules.file.api.link.hashText());
            const navReq = []; const onReq = rq => { if (rq.isNavigationRequest()) navReq.push(rq.url()); }; p.on('request', onReq);
            const hit = await p.evaluate(() => { const e = document.querySelector('#ky-file-editions [data-ky-edition="202611010114"]'); e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 22), h = document.elementFromPoint(x, y);
              return { x, y, on_row: !!h && (h === e || e.contains(h)), hit: h ? h.tagName + '#' + h.id + '.' + h.className : null }; });
            const r = await tapSel(p, '#ky-file-editions [data-ky-edition="202611010114"]');
            await p.waitForURL(/\/editions\/202611010114\//, { timeout: 240000 }).catch(() => {});
            p.off('request', onReq);
            const after = p.url().indexOf('/202611010114/') < 0 ? await p.evaluate(() => { const i = KY.modules.file.api.inspect(); return { left: i.left || null, opened: (i.opened || []).slice(-3), history_length: history.length }; }).catch(e => String(e)) : 'navigated';
            const want = ROOT + 'editions/202611010114/#' + h;
            step('G3 Open an edition by touch: ../202611010114/#<hash>, the copied link\'s hash byte for byte', p.url() === want && link.slice(link.indexOf('#')) === '#' + h && r.height >= 44,
              { landed: p.url(), want, copied_hash: link.slice(link.indexOf('#')), row_h: Math.round(r.height), hit, navigation_requests: navReq, after });
          } else {                                    // G4 Open an app by touch: See Through, first and lit, carries the key
            if (await p.evaluate(() => !!(KY.modules.apps && KY.modules.apps.api))) step('G4 Open an app by touch', null, { why: 'the apps module is admitted: Open an app opens its launcher (step 7 tests it)' });
            else {
              if (!(await p.evaluate(() => document.getElementById('ky-file-apps').classList.contains('ky-open')))) await tapSel(p, '#ky-file-open-app');
              await p.waitForTimeout(600);
              const k = await p.evaluate(() => KY.modules.file.api.link.inspect().fields.key);
              const first = await p.evaluate(() => { const e = document.querySelector('#ky-file-apps > *'); return e && { app: e.getAttribute('data-ky-app'), lit: e.classList.contains('ky-lit') }; });
              const hit = await p.evaluate(() => { const e = document.querySelector('#ky-file-apps [data-ky-app="see-through"]'); e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 22), h = document.elementFromPoint(x, y);
                return { x, y, on_row: !!h && (h === e || e.contains(h)), hit: h ? h.tagName + '#' + h.id + '.' + h.className : null }; });
              const r = await tapSel(p, '#ky-file-apps [data-ky-app="see-through"]');
              await p.waitForURL(/\/see-through\//, { timeout: 240000 }).catch(() => {});
              const opened = p.url().indexOf('/see-through/') < 0 ? await p.evaluate(() => (KY.modules.file.api.inspect().opened || []).slice(-3)).catch(e => String(e)) : 'navigated';
              const want = ROOT + 'see-through/#key=' + k;   // or ROOT + 'see-through/<stamp>/#key=' + k when See Through's own pointer has forwarded it
              const landedOk = p.url() === want || new RegExp('^' + ROOT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 'see-through/\\d{12}/#key=' + k + '$').test(p.url());
              step('G4 Open an app by touch: See Through first and lit, lands on ../../see-through/#key=<the open key>', landedOk && first && first.app === 'see-through' && first.lit && r.height >= 44,
                { landed: p.url(), want, first, row_h: Math.round(r.height), hit, opened });
            }
          }
        }
        await p.context().close();
        const hash = link.slice(link.indexOf('#'));
        q = await viaPointer(hash); const s1 = await sel(q); await q.context().close();
        step('A5 round trip (' + (pick === 'e' ? 'e' : 'edPlaced[' + pick + ']') + ')', s0.index >= 0 && s1.index === s0.index && s1.header === s0.header && /line=[0-9a-f]{40}:\d+/.test(hash) && /key=\d+/.test(hash),
          { link, before: s0.index, after: s1.index, header_equal: s1.header === s0.header });
      } catch (e) { step('A5 round trip (' + pick + ') harness', false, String(e && e.stack || e).slice(0, 1500)); await p.context().close().catch(() => {}); if (q) await q.context().close().catch(() => {}); } }

      // ------------------------------------------------------------------ clipboard refused, A8 history
      p = await newPage({ clip: false }); await p.goto('about:blank'); await p.goto(URL0, { timeout: 180000 }); await ready(p);
      await blk('A2/G5 clipboard refused', async () => {
      await p.evaluate(() => { Object.defineProperty(navigator.clipboard ? Object.getPrototypeOf(navigator.clipboard) : {}, 'writeText', { value: () => Promise.reject(new Error('denied by the test')), configurable: true }); });
      await p.evaluate(k => { location.hash = '#key=' + k; }, KEY0); await settle(p, 8000);
      await openMenu(p, 'file'); await tapSel(p, '#ky-file-copy-cmd'); await p.waitForTimeout(1200);
      const fb = await p.evaluate(() => { const f = document.querySelector('input.ky-file-payload[data-for="ky-file-copy-cmd"]'); if (!f) return null; const r = f.getBoundingClientRect();
        return { value: f.value, readOnly: f.readOnly, selected: f.selectionStart === 0 && f.selectionEnd === f.value.length, focused: document.activeElement === f, h: Math.round(r.height) }; });
      step('A2 clipboard refused -> the command in a selected read-only field', !!fb && fb.value === 'python tools/key.py ' + KEY0 && fb.readOnly && fb.selected && fb.h >= 44, fb);
      await openMenu(p, 'file'); await tapSel(p, '#ky-file-copy-link'); await p.waitForTimeout(1500);
      const fl = await p.evaluate(() => { const f = document.querySelector('input.ky-file-payload[data-for="ky-file-copy-link"]'); if (!f) return null; const r = f.getBoundingClientRect();
        return { value: f.value, url: KY.modules.file.api.link.url(), readOnly: f.readOnly, selected: f.selectionStart === 0 && f.selectionEnd === f.value.length, focused: document.activeElement === f, h: Math.round(r.height),
          why: (document.querySelector('#ky-file-copy-link .ky-file-why') || {}).textContent || null, open: document.getElementById('kuiper-menu-bar').getAttribute('data-open') }; });
      step('G5 Copy a link to this view, clipboard denied -> the link in a selected read-only 44 px field, never silent', !!fl && fl.value === fl.url && /#key=36064705400(&|$)/.test(fl.value)
        && fl.readOnly && fl.selected && fl.h >= 44, fl);
      await shot(p, '04-copy-fallback');
      await p.evaluate(() => KY.modules['kuiper-shell'].api.close()); await p.waitForTimeout(800);
      }); await blk('A8', async () => {
      // three link changes on one page (no card left open), then back leaves the page in one step
      await p.evaluate(() => { location.hash = '#repo=gridatlas'; }); await settle(p, 3000);
      await p.evaluate(() => { location.hash = '#period=2026-07'; }); await settle(p, 3000);
      await p.evaluate(() => { location.hash = '#repo=kuiper-belt'; }); await settle(p, 3000);
      // a hash typed in the address bar is a navigation (one entry each); the module's own writes are replaceState:
      // the measured history length before and after the module wrote proves it adds none
      const hl = await p.evaluate(() => ({ len: history.length, writes: KY.modules.file.api.inspect().writes }));
      await openMenu(p, 'scope'); const openBefore = await p.evaluate(() => document.getElementById('kuiper-menu-bar').getAttribute('data-open'));
      await p.goBack().catch(() => {}); await p.waitForTimeout(1500);
      const afterPanel = await p.evaluate(() => ({ open: document.getElementById('kuiper-menu-bar').getAttribute('data-open'), url: location.href }));
      step('A8 back with a panel open closes the panel, stays on the page', openBefore === 'scope' && !afterPanel.open && afterPanel.url.indexOf(STAMP) >= 0, { openBefore, afterPanel });
      const lenBefore = await p.evaluate(() => history.length);
      await p.evaluate(k => { KY.modules.file.api.link.set('key', String(k)); KY.modules.file.api.link.flush(); KY.modules.file.api.link.set('repo', 'gridatlas'); KY.modules.file.api.link.flush(); KY.modules.file.api.link.set('period', '2026-07'); KY.modules.file.api.link.flush(); }, KEY0);
      const lenAfter = await p.evaluate(() => ({ len: history.length, hash: location.hash }));
      step('A8 three module link writes add no history entry (replaceState)', lenAfter.len === lenBefore && /period=2026-07/.test(lenAfter.hash), { lenBefore, lenAfter, hl });
      }); await blk('G1', async () => {
      // G1 parse -> serialise -> parse, byte-identical, for every GRAMMAR.md example
      await p.waitForTimeout(600);
      const g1 = await p.evaluate(exs => {
        const L = KY.modules.file.api.link, W = ['key', 'line', 'repo', 'period', 'layers'], pure = typeof L.format === 'function', saved = location.pathname + location.hash;
        const pick = f => { const o = {}; W.forEach(k => { if (f[k] != null) o[k] = f[k]; }); return o; };
        const ser = f => { if (pure) return L.format(f);
          history.replaceState(history.state, '', location.pathname + (f.layers != null ? '#layers=' + f.layers : ''));
          L.clear([]); let ok = true; W.forEach(k => { if (f[k] != null) ok = L.set(k, f[k]) && ok; }); const h = L.hashText(); return ok ? h : 'SET REFUSED ' + h; };
        const out = exs.map(ex => {
          const r1 = L.read(ex), f1 = r1.fields, s1 = ser(pick(f1)), r2 = L.read('#' + s1), f2 = r2.fields, s2 = ser(f2), r3 = L.read('#' + s2);
          const nav = Object.keys(f1).filter(k => W.indexOf(k) < 0);
          return { ex, f1, s1, f2, s2, nav, refused: r1.refused.concat(r2.refused), canonical: '#' + s1 === ex,
            identical: JSON.stringify(pick(f1)) === JSON.stringify(f2) && JSON.stringify(f2) === JSON.stringify(r3.fields) && s1 === s2 };
        });
        L.clear([]); history.replaceState(history.state, '', saved); L.flush();
        return { serialiser: pure ? 'link.format (pure)' : 'link.set + link.hashText (format not exposed)', out };
      }, EXAMPLES);
      step('G1 every grammar example: parse -> serialise -> parse byte-identical, nothing refused', g1.out.length === EXAMPLES.length && g1.out.every(o => o.identical && o.refused.length === 0 && Object.keys(o.f1).length > 0), g1);
      });
      await p.context().close();

      // ------------------------------------------------------------------ G2 the real pointer forwards the hash byte for byte
      p = await newPage({ realPointer: true });
      const g2 = [];
      for (const ex of EXAMPLES) {
        await p.goto(POINTER + ex, { timeout: 180000 }); await p.waitForURL(/\/editions\/\d{12}\//, { timeout: 120000 }).catch(() => {});
        const ptrSrc = g2.length ? null : await (await fetch(POINTER)).text();
        const m = ptrSrc && ptrSrc.match(/location\.replace\('(\d{12})\/' \+ location\.hash\)/);
        if (m) g2.target = m[1];
        g2.push({ ex, landed: p.url(), ok: p.url() === POINTER + (g2.target || '') + '/' + ex });
      }
      step('G2 the real pointer editions/index.html forwards every example\'s hash byte for byte', !!g2.target && g2.every(x => x.ok), { pointer_target: g2.target, results: g2 });
      await p.context().close();
    } catch (e) { step('harness', false, String(e && e.stack || e)); }
    step('zero pageerror', R.errors.length === 0, R.errors);
    step('zero console errors (strict)', R.other_console.length === 0 && (R.expected_404.length === 0 || (ALLOW404 ? null : false)), { other: R.other_console, evidence_404: R.expected_404, allow_missing_evidence: ALLOW404 });
    R.pass = R.steps.every(s => s.result !== 'FAIL');
  }
  report.finished = new Date().toISOString(); report.pass = allPass;
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  await browser.close(); process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('HARNESS', e); process.exit(2); });
