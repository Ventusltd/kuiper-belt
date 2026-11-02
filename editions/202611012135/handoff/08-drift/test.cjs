#!/usr/bin/env node
// test.cjs — Opus team 8, step 8 the drift: P4 on Android (ROADMAP.md step 8 "Acceptance test on Android"), in the
// form of FIXES/NL-009/android-journey.cjs: Playwright, devices['Pixel 7'] and devices['Galaxy S24'] (360 px), real
// touch (page.touchscreen.tap), zero console errors, a measured assertion per step, report.json, exit 0 only when every
// step on every device passed.
//
//   node test.cjs <edition-url> <outdir> [--handoff]
//   e.g. node test.cjs http://127.0.0.1:8480/editions/202611012135/ /tmp/nl010-opus/team-8/tester/out1
//
// The manifest: when modules.json already admits `drift` the page is tested as served. Until then (pre-integration)
// the test routes modules.json to the served one plus line-card (handoff/02-card/MODULE.json) and drift (sha256 and
// bytes measured from the file on disk at the start), and says "pre-integration" in the report.
// Scenarios per device: A no drift module (the baseline wafer), B drift admitted, C drift admitted and data/drift.json
// answering 404. --handoff writes ../img/*.png (CSS-pixel PNGs) and ../TEST.md.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const argv = process.argv.slice(2), pos = argv.filter(a => !a.startsWith('--'));
if (pos.length < 2) { console.error('usage: node test.cjs <edition-url> <outdir> [--handoff]'); process.exit(2); }
const URL0 = pos[0].replace(/\/?$/, '/'), OUT = path.resolve(pos[1]), HANDOFF = argv.includes('--handoff');
const HERE = __dirname, ED = path.resolve(HERE, '..', '..');
const DEVICES = ['Pixel 7', 'Galaxy S24'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const served = JSON.parse(fs.readFileSync(path.join(ED, 'modules.json'), 'utf8'));
const DRIFT = JSON.parse(fs.readFileSync(path.join(ED, 'data', 'drift.json'), 'utf8'));
const modFile = fs.readdirSync(path.join(ED, 'modules')).filter(f => /^\d{12}-drift\.js$/.test(f)).sort().pop();
const modBytes = fs.readFileSync(path.join(ED, 'modules', modFile));
const modSha = crypto.createHash('sha256').update(modBytes).digest('hex');
const src = modBytes.toString('utf8');
const REQ = (src.match(/var REQUIRES = \[([^\]]*)\]/) || [, ''])[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
const PRE = !(served.order || []).includes('drift');
function manifest(withDrift) {
  const m = JSON.parse(JSON.stringify(served));
  if (!PRE) { if (!withDrift) { m.order = m.order.filter(x => x !== 'drift'); m.modules = m.modules.filter(x => x.id !== 'drift'); } return m; }
  // pre-integration: other teams' modules are re-hashed from disk (they are being revised while we test; their
  // admission is the integrator's test, not ours)
  m.modules.forEach(x => { try { const b = fs.readFileSync(path.join(ED, x.path)); x.sha256 = crypto.createHash('sha256').update(b).digest('hex'); x.bytes = b.length; if (x.byte_budget < b.length) x.byte_budget = b.length; } catch (e) {} });
  if (!m.order.includes('line-card')) {
    const lc = JSON.parse(fs.readFileSync(path.join(ED, 'handoff', '02-card', 'MODULE.json'), 'utf8'));
    m.modules.push(lc); m.order.push('line-card');
  }
  if (withDrift) {
    m.modules.push({ id: 'drift', generation: modFile.slice(0, 12), path: 'modules/' + modFile, sha256: modSha, bytes: modBytes.length,
      byte_budget: 65536, requires: REQ, provides: ['drift'], reads: ['data/drift.json', 'keys-min.json', 'keys.json'],
      writes: ['#ky-drift', '#ky-drift-css', '#card .ky-drift-cl'], creates_controls: 'the drift section of the WAFER panel: five class filters and its list',
      licence: 'Apache-2.0', team: '08', step: 8, proof: 'handoff/08-drift/' });
    m.order.push('drift');
  }
  return m;
}
const MOVED = DRIFT.rows.filter(r => r.class === 'MOVED');
const C = DRIFT.summary.counts;

async function overlay(page, x, y, rad) {   // classify overlay pixels in a box (or the whole canvas)
  return page.evaluate(([x, y, rad]) => {
    const ov = document.querySelector('#o'), ctx = ov.getContext('2d');
    const x0 = rad ? Math.max(0, Math.round(x - rad)) : 0, y0 = rad ? Math.max(0, Math.round(y - rad)) : 0;
    const w = rad ? Math.min(ov.width - x0, 2 * rad + 1) : ov.width, h = rad ? Math.min(ov.height - y0, 2 * rad + 1) : ov.height;
    const d = ctx.getImageData(x0, y0, w, h).data; let amber = 0, green = 0;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]; if (a < 60) continue;
      if (r > 200 && g > 120 && g < 200 && b < 70) amber++; else if (g > 180 && r < 90 && b < 150 && g > b + 60) green++; }
    return { amber, green, w: ov.width, cssW: innerWidth };
  }, [x, y, rad || 0]);
}

async function run(devName, scen) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ ...devices[devName] });
  const page = await ctx.newPage();
  const errors = [], steps = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror ' + e.message));
  await page.route('**/editions/202611012135/modules.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(manifest(scen !== 'A')) }));
  if (scen === 'C') await page.route('**/editions/202611012135/data/drift.json', r => r.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' }));
  const ok = (name, pass, detail) => { steps.push({ device: devName, scenario: scen, step: name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + devName + ' ' + scen + ' ' + name + ' · ' + detail); };
  await page.goto(URL0, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.done !== false && document.querySelector('#big') && /verified lines lit/.test(document.querySelector('#big').textContent), null, { timeout: 180000 }).catch(() => {});
  if (scen !== 'A') await page.waitForFunction(() => { const m = window.KY && KY.modules && KY.modules.drift; const s = m && m.api && m.api.inspect(); return s && (s.status === 'OK' || s.status === 'REFUSED'); }, null, { timeout: 180000 }).catch(() => {});
  await sleep(7000);
  const ins = () => page.evaluate(() => { const m = window.KY && KY.modules && KY.modules.drift; return m && m.api ? m.api.inspect() : null; });
  const base = await overlay(page);
  const bar = await page.evaluate(() => { const ts = [...document.querySelectorAll('#kuiper-menu-bar .gm-menu>.gm-title')]; const tops = new Set(ts.map(t => Math.round(t.getBoundingClientRect().top)));
    const b = document.querySelector('#kuiper-menu-bar'); return { titles: ts.map(t => t.textContent.trim()), rows: tops.size, h: b ? Math.round(b.getBoundingClientRect().height) : null, sw: b ? b.scrollWidth : 0, cw: b ? b.clientWidth : 0 }; });
  const res = { device: devName, scenario: scen, base, bar };
  if (scen === 'A') { ok('baseline wafer', base.green > 0, base.green + ' green overlay px, no drift module'); }
  if (scen === 'B') {
    let s = await ins();
    const hud = await page.evaluate(() => document.querySelector('#hud').textContent);
    const want = ['SAME', 'MOVED', 'GONE', 'FILE_GONE', 'UNVERIFIED'].map(k => C[k] + ' ' + k);
    ok('admitted', s && s.status === 'OK', s ? 'status ' + s.status + ' registry ' + s.registry + ' marks ' + s.marks : 'drift not in KY.modules: ' + JSON.stringify(await page.evaluate(() => window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.refused)));
    ok('readout five counts', want.every(w => hud.includes(w)) && hud.includes(DRIFT.summary.share_text), (hud.split('\n').find(l => /^DRIFT/.test(l)) || 'no DRIFT line'));
    ok('bar one row', bar.rows === 1 && bar.sw <= bar.cw + 1, JSON.stringify(bar));
    // the amber spark at its new key, and its card
    const mv = (s && s.moved || []).find(m => m.atNew);
    ok('MOVED placed at a new key', !!mv && s.moved.filter(m => m.atNew).length >= 1, s ? s.moved.filter(m => m.atNew).length + ' of ' + MOVED.length + ' MOVED at their new keys; ' + s.moved.filter(m => !m.atNew).map(m => m.repo + ': ' + m.note).join('; ') : '');
    if (mv) {
      const row = MOVED.find(r => r.id === mv.id && r.repo === mv.repo);
      await page.evaluate(id => KY.modules.drift.api.open(id), mv.id); await sleep(8000);
      const card = await page.evaluate(() => { const c = document.querySelector('#card'); const d = c.querySelector('.ky-drift-cl'); return { open: c.style.display === 'block', drift: d ? d.textContent : null, first: (c.querySelector('header code') || {}).textContent }; });
      const line = 'at head ' + row.head.slice(0, 7) + ': MOVED to line ' + row.head_line + ' (' + (row.delta > 0 ? '+' : '') + row.delta + ')';
      ok('card names head and new line', card.open && card.drift && card.drift.includes(line), JSON.stringify(card.drift));
      let p = await page.evaluate(id => KY.modules.drift.api.screen(id), mv.id);
      const px = await overlay(page, p[0], p[1], 4);
      ok('MOVED spark amber', px.amber >= 4, 'at (' + p.map(v => v.toFixed(1)).join(', ') + '): ' + px.amber + ' amber px in a 9x9 box');
      if (HANDOFF && devName === 'Pixel 7') await page.screenshot({ path: path.join(HERE, 'img', '1-moved-card-Pixel_7.png'), scale: 'css', timeout: 180000 });
      // close the card, then tap within 9 px of the amber spark with a finger
      await page.evaluate(() => { const c = document.querySelector('#card'); const x = c.querySelector('.lc-x,.cx'); if (x) x.click(); }); await sleep(2500);
      p = await page.evaluate(id => KY.modules.drift.api.screen(id), mv.id);
      const before = (await ins()).taps;
      await page.touchscreen.tap(p[0] + 6, p[1] + 6); await sleep(4000);
      s = await ins();
      const card2 = await page.evaluate(() => { const c = document.querySelector('#card'); const d = c.querySelector('.ky-drift-cl'); return { open: c.style.display === 'block', drift: d ? d.textContent : null }; });
      ok('tap within 9 px opens its card', s.taps === before + 1 && card2.open && card2.drift && card2.drift.includes(line), 'tap at +6,+6 (8.5 px): taps ' + before + '→' + s.taps + ', ' + JSON.stringify(card2.drift));
      await page.evaluate(() => { const c = document.querySelector('#card'); const x = c.querySelector('.lc-x,.cx'); if (x) x.click(); }); await sleep(1500);
    }
    // the LINES filter "moved": the WAFER panel, real taps
    const w = await page.evaluate(() => { const t = [...document.querySelectorAll('#kuiper-menu-bar .gm-title')].find(b => b.textContent.trim().toUpperCase() === 'WAFER'); if (!t) return null; const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    if (w) { await page.touchscreen.tap(w[0], w[1]); await sleep(2500); }
    else await page.evaluate(() => KY.panels.set('wafer'));
    await page.evaluate(() => { const d = document.querySelector('#ky-drift'); if (d) d.scrollIntoView({ block: 'start' }); }); await sleep(800);
    const chip = await page.evaluate(() => { const b = document.querySelector('#ky-drift .kd-c button[data-class=MOVED]'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.height]; });
    if (chip) { await page.evaluate(() => KY.modules.drift.api.filter('SAME')); await sleep(300);
      const c2 = await page.evaluate(() => { const r = document.querySelector('#ky-drift .kd-c button[data-class=MOVED]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await page.touchscreen.tap(c2[0], c2[1]); await sleep(1500); }
    const listed = await page.evaluate(() => [...document.querySelectorAll('#ky-drift .kd-l [data-row]')].map(b => ({ row: +b.dataset.row, cls: b.dataset.class })));
    const wantRows = DRIFT.rows.map((r, i) => r.class === 'MOVED' ? i : -1).filter(i => i >= 0);
    ok('filter "moved" lists exactly the MOVED rows', chip && chip[2] >= 44 && listed.length === wantRows.length && listed.every((x, i) => x.cls === 'MOVED' && x.row === wantRows[i]),
      'chip ' + (chip ? chip[2].toFixed(0) + ' px tall' : 'missing') + '; listed ' + listed.length + ' rows, drift.json MOVED ' + wantRows.length);
    if (HANDOFF && devName === 'Galaxy S24') await page.screenshot({ path: path.join(HERE, 'img', '2-filter-moved-Galaxy_S24.png'), scale: 'css', timeout: 180000 });
    const bar2 = await page.evaluate(() => { const ts = [...document.querySelectorAll('#kuiper-menu-bar .gm-menu>.gm-title')]; return new Set(ts.map(t => Math.round(t.getBoundingClientRect().top))).size; });
    ok('bar one row with the panel open', bar2 === 1, bar2 + ' row(s)');
  }
  if (scen === 'C') {
    const s = await ins();
    const hud = await page.evaluate(() => document.querySelector('#hud').textContent);
    ok('drift.json missing: refused in words', s && s.status === 'REFUSED' && hud.includes('data/drift.json did not load. The wafer will not invent a head.'), (hud.split('\n').find(l => /^DRIFT/.test(l)) || 'no DRIFT line'));
    ok('drift.json missing: no amber drawn by drift', s && s.marks === 0, 'marks ' + (s && s.marks));
    res.hud = hud;
    if (HANDOFF && devName === 'Galaxy S24') await page.screenshot({ path: path.join(HERE, 'img', '3-drift-missing-Galaxy_S24.png'), scale: 'css', timeout: 180000 });
  }
  const errs = scen === 'C' ? errors.filter(e => !/404/.test(e) || !/Failed to load resource/.test(e)) : errors;
  ok('zero console errors', errs.length === 0, errs.length ? errs.slice(0, 3).join(' | ') : '0' + (scen === 'C' ? ' (the deliberate 404 of data/drift.json excluded: ' + (errors.length - errs.length) + ')' : ''));
  res.steps = steps;
  await browser.close();
  return res;
}

(async () => {
  const all = [];
  for (const d of DEVICES) {
    const A = await run(d, 'A'), B = await run(d, 'B'), Cc = await run(d, 'C');
    // with drift.json missing the wafer and the green sparks are unchanged (the overlay at home, same viewport)
    const same = Cc.base.green === A.base.green;
    const st = { device: d, scenario: 'A/C', step: 'drift.json missing: green sparks unchanged', pass: same && A.base.green > 0, detail: 'green overlay px at home: no module ' + A.base.green + ', drift.json 404 ' + Cc.base.green };
    console.log((st.pass ? 'PASS ' : 'FAIL ') + d + ' A/C ' + st.step + ' · ' + st.detail);
    all.push(...A.steps, ...B.steps, ...Cc.steps, st);
  }
  const fails = all.filter(s => !s.pass);
  const report = { when: new Date().toISOString(), url: URL0, pre_integration: PRE, module: { file: modFile, sha256: modSha, bytes: modBytes.length },
    drift: { sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(ED, 'data', 'drift.json'))).digest('hex'), counts: C }, steps: all,
    result: fails.length ? 'FAIL' : 'PASS' };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  if (HANDOFF) {
    const t = ['# TEST.md — Opus team 8, step 8 the drift (P4 on Android)', '',
      'Run ' + report.when + ' · ' + URL0 + (PRE ? ' · **pre-integration** (modules.json routed: served records re-hashed from disk + line-card + drift)' : ' · as served'),
      'Module `modules/' + modFile + '` sha256 `' + modSha + '` (' + modBytes.length + ' bytes); data/drift.json sha256 `' + report.drift.sha256 + '`.', '',
      '| device | scenario | step | result | measured |', '|---|---|---|---|---|',
      ...all.map(s => '| ' + s.device + ' | ' + s.scenario + ' | ' + s.step + ' | ' + (s.pass ? 'PASS' : 'FAIL') + ' | ' + String(s.detail).replace(/\|/g, '\\|').slice(0, 300) + ' |'), '',
      'RESULT: ' + report.result + ' (' + (all.length - fails.length) + ' of ' + all.length + ')', ''];
    fs.writeFileSync(path.join(HERE, 'TEST.md'), t.join('\n'));
  }
  console.log('RESULT: ' + report.result + ' (' + (all.length - fails.length) + ' of ' + all.length + ')' + (PRE ? ' pre-integration' : ''));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('harness error', e); process.exit(2); });
