#!/usr/bin/env node
// Apache-2.0 (kuiper-belt code), kuiper-belt@018b46a README.md:156-157; the LICENCES.md row is handoff/08-drift/LICENCE.txt.
// test.cjs — Opus team 8, step 8 the drift: P4 on Android (ROADMAP.md step 8 "Acceptance test on Android"), in the
// form of FIXES/NL-009/android-journey.cjs: Playwright, devices['Pixel 7'] and devices['Galaxy S24'] (360 px), real
// touch (page.touchscreen.tap), zero console errors, a measured assertion per step, report.json, exit 0 only when every
// step on every device passed.
//
//   node test.cjs <edition-url> <outdir> [--handoff] [--device "Pixel 7"|"Galaxy S24"] [--no-py]
//   e.g. node test.cjs http://127.0.0.1:8482/editions/202611012135/ /tmp/nl010-opus/team-8/tester/out1
//   --device runs one device (a loaded machine: one device at a time); each device's steps go to
//   <outdir>/steps-<device>.json and TEST.md / report.json are written from every device file present in <outdir>.
//   P1, P2, P3, P5 and the data half of P4 are drift_test.py (run here first unless --no-py; its JSON is folded into
//   report.json and TEST.md), so one RESULT covers P1-P5.
//
// The manifest: when modules.json already admits `drift` the page is tested as served. Until then (pre-integration)
// the test routes modules.json to the served one plus line-card (handoff/02-card/MODULE.json) and drift (sha256 and
// bytes measured from the file on disk at the start), and says "pre-integration" in the report.
// Scenarios per device: A no drift module (the baseline wafer), B drift admitted, C drift admitted and data/drift.json
// answering 404. --handoff writes ../img/*.png (CSS-pixel PNGs) and ../TEST.md.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const argv = process.argv.slice(2), pos = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--device');
if (pos.length < 2) { console.error('usage: node test.cjs <edition-url> <outdir> [--handoff]'); process.exit(2); }
const URL0 = pos[0].replace(/\/?$/, '/'), OUT = path.resolve(pos[1]), HANDOFF = argv.includes('--handoff');
const HERE = __dirname, ED = path.resolve(HERE, '..', '..');
const ALL_DEVICES = ['Pixel 7', 'Galaxy S24'];
const devArg = argv.indexOf('--device') >= 0 ? process.argv[process.argv.indexOf('--device') + 1] : null;
const DEVICES = devArg ? [devArg] : ALL_DEVICES;
if (devArg && !ALL_DEVICES.includes(devArg)) { console.error('unknown device ' + devArg); process.exit(2); }
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
const BASEBAR = {};
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
  const barOf = () => page.evaluate(() => { const shell = !!document.querySelector('#kuiper-menu-bar');
    const ts = shell ? [...document.querySelectorAll('#kuiper-menu-bar .gm-menu>.gm-title')] : [...document.querySelectorAll('#bar > *')].filter(e => e.getBoundingClientRect().width > 0);
    const tops = new Set(ts.map(t => Math.round(t.getBoundingClientRect().top)));
    const b = document.querySelector(shell ? '#kuiper-menu-bar' : '#bar'); return { bar: shell ? '#kuiper-menu-bar (the shell)' : '#bar (the page, no shell admitted)', shell, titles: ts.map(t => t.textContent.trim()), rows: tops.size, h: b ? Math.round(b.getBoundingClientRect().height) : null, sw: b ? b.scrollWidth : 0, cw: b ? b.clientWidth : 0 }; });
  const bar = await barOf();
  const res = { device: devName, scenario: scen, base, bar };
  if (scen === 'A') { BASEBAR[devName] = bar; ok('baseline wafer', base.green > 0, base.green + ' green overlay px, no drift module; bar ' + bar.bar + ' ' + bar.rows + ' row(s): ' + bar.titles.join('|')); }
  if (scen === 'B') {
    let s = await ins();
    const hud = await page.evaluate(() => document.querySelector('#hud').textContent);
    const dl = hud.split('\n').find(l => /^DRIFT since the cut/.test(l)) || '';
    const got = {}; for (const m of dl.matchAll(/(?:^|· )([\d,]+) (SAME|MOVED|GONE|FILE_GONE|UNVERIFIED)\b/g)) got[m[2]] = +m[1].replace(/,/g, '');
    const want = ['SAME', 'MOVED', 'GONE', 'FILE_GONE', 'UNVERIFIED'];
    ok('admitted', s && s.status === 'OK', s ? 'status ' + s.status + ' registry ' + s.registry + ' marks ' + s.marks : 'drift not in KY.modules: ' + JSON.stringify(await page.evaluate(() => window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.refused)));
    ok('readout five counts = drift.json', want.every(k => got[k] === C[k]) && Object.keys(got).length === 5 && dl.includes(DRIFT.summary.share_text),
      (dl || 'no DRIFT line') + ' · page ' + JSON.stringify(got) + ' · drift.json ' + JSON.stringify(C));
    // the drift adds no bar title and does not change the bar (ROADMAP step 8 "no new bar title"; "the bar stays one
    // row"): B's bar equals A's bar; with the shell admitted it is one row. Without the shell the page's own bar is two
    // rows at 360-412 px before any module (ADMISSIONS.md row 0, NL-009 01-bar, team 1's to fix), so equality is the test.
    const A0 = BASEBAR[devName];
    ok('bar unchanged by drift' + (bar.shell ? ', one row' : ''), A0 && JSON.stringify(A0.titles) === JSON.stringify(bar.titles) && A0.rows === bar.rows && bar.sw <= bar.cw + 1 && (!bar.shell || bar.rows === 1),
      'with drift ' + JSON.stringify(bar) + ' · without (A) ' + JSON.stringify(A0 && { titles: A0.titles, rows: A0.rows }));
    // every MOVED spark: amber in a 9x9 box of the overlay, and nothing of the page drawn over it (elementFromPoint)
    {
      const all = [];
      for (const m of (s && s.moved || [])) {
        const p = await page.evaluate(id => KY.modules.drift.api.screen(id), m.id);
        if (!p) { all.push({ id: m.id, on: false }); continue; }
        const vis = await page.evaluate(([x, y]) => { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return 'off-screen';
          const e = document.elementFromPoint(x, y); return e ? (e.id ? '#' + e.id : e.tagName.toLowerCase()) : 'none'; }, p);
        const px = vis === 'off-screen' ? { amber: 0 } : await overlay(page, p[0], p[1], 4);
        all.push({ id: m.id, repo: m.repo, at: p.map(v => Math.round(v)), top: vis, amber: px.amber });
      }
      const onScreen = all.filter(x => x.top && x.top !== 'off-screen');
      const good = onScreen.filter(x => x.amber >= 4 && /^#(o|c|gl|cv)$|^canvas$/.test(x.top));
      ok('every MOVED spark amber and visible', all.length === MOVED.length && onScreen.length >= 1 && good.length === onScreen.length,
        good.length + ' of ' + onScreen.length + ' on-screen MOVED sparks amber (>=4 px in 9x9) with a canvas on top; ' + (all.length - onScreen.length) + ' off-screen; ' +
        all.map(x => x.repo + ' ' + (x.at ? x.at.join(',') : '-') + ' ' + x.top + ' ' + x.amber + 'px').join('; '));
      res.moved = all;
      if (HANDOFF && devName === 'Pixel 7') await page.screenshot({ path: path.join(HERE, 'img', '4-moved-sparks-Pixel_7.png'), scale: 'css', timeout: 180000 });
    }
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
    // the LINES filter "moved", reached the way a finger reaches it: the shell's WAFER title when the shell is admitted,
    // else the page's own LINES button (ROADMAP step 8: "LINES gains a filter by class"); no programmatic panel opening
    const w = await page.evaluate(() => { const t = document.querySelector('#kuiper-menu-bar') ? [...document.querySelectorAll('#kuiper-menu-bar .gm-title')].find(b => b.textContent.trim().toUpperCase() === 'WAFER')
        : [...document.querySelectorAll('#bar button, #bar a, #bar [role=button]')].find(b => b.textContent.trim().toUpperCase() === 'LINES');
      if (!t) return null; const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, t.textContent.trim()]; });
    if (w) { await page.touchscreen.tap(w[0], w[1]); await sleep(2500); }
    await page.evaluate(() => { const d = document.querySelector('#ky-drift'); if (d) d.scrollIntoView({ block: 'start' }); }); await sleep(800);
    const chip = await page.evaluate(() => { const b = document.querySelector('#ky-drift .kd-c button[data-class=MOVED]'); if (!b) return null; const r = b.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const e = document.elementFromPoint(x, y); return [x, y, r.height, !!(e && b.contains(e)), e ? (e.id || e.className || e.tagName) : 'none', (b.closest('.gm-panel,[id]:not(#ky-drift)') || {}).id || ''];
    });
    if (chip) { await page.evaluate(() => KY.modules.drift.api.filter('SAME')); await sleep(300);
      const c2 = await page.evaluate(() => { const r = document.querySelector('#ky-drift .kd-c button[data-class=MOVED]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await page.touchscreen.tap(c2[0], c2[1]); await sleep(1500); }
    const listed = await page.evaluate(() => [...document.querySelectorAll('#ky-drift .kd-l [data-row]')].map(b => ({ row: +b.dataset.row, cls: b.dataset.class })));
    const wantRows = DRIFT.rows.map((r, i) => r.class === 'MOVED' ? i : -1).filter(i => i >= 0);
    ok('filter "moved" lists exactly the MOVED rows', chip && chip[2] >= 44 && chip[3] && listed.length === wantRows.length && listed.every((x, i) => x.cls === 'MOVED' && x.row === wantRows[i]),
      'opened by a tap on ' + (w ? '"' + w[2] + '"' : 'NOTHING (no WAFER title, no LINES button)') + '; chip ' + (chip ? chip[2].toFixed(0) + ' px tall, ' + (chip[3] ? 'on top' : 'COVERED by ' + chip[4]) + ', in ' + (chip[5] || 'body') : 'missing') + '; listed ' + listed.length + ' rows, drift.json MOVED ' + wantRows.length);
    if (HANDOFF && devName === 'Galaxy S24') await page.screenshot({ path: path.join(HERE, 'img', '2-filter-moved-Galaxy_S24.png'), scale: 'css', timeout: 180000 });
    const bar2 = await barOf();
    ok('bar unchanged with the panel open', bar2.rows === bar.rows && (!bar2.shell || bar2.rows === 1), bar2.bar + ' ' + bar2.rows + ' row(s)');
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
  let py = null;
  if (!argv.includes('--no-py')) {
    const { spawnSync } = require('child_process');
    const pj = path.join(OUT, 'drift_test.json');
    console.log('drift_test.py (P1, P2, P3, P4 data, P5) ...');
    const r = spawnSync('python3', [path.join(HERE, 'drift_test.py'), '--json', pj, '--scratch', path.join(OUT, 'py-scratch')], { encoding: 'utf8', timeout: 1800000 });
    process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
    try { py = JSON.parse(fs.readFileSync(pj, 'utf8')); } catch (e) { py = { result: 'FAIL', results: [{ test: 'drift_test.py ran', pass: false, detail: 'exit ' + r.status + ', no JSON' }] }; }
  } else { try { py = JSON.parse(fs.readFileSync(path.join(OUT, 'drift_test.json'), 'utf8')); } catch (e) {} }
  const all = [];
  for (const d of DEVICES) {
    const A = await run(d, 'A'), B = await run(d, 'B'), Cc = await run(d, 'C');
    // with drift.json missing the wafer and the green sparks are unchanged (the overlay at home, same viewport)
    const same = Cc.base.green === A.base.green;
    const st = { device: d, scenario: 'A/C', step: 'drift.json missing: green sparks unchanged', pass: same && A.base.green > 0, detail: 'green overlay px at home: no module ' + A.base.green + ', drift.json 404 ' + Cc.base.green };
    console.log((st.pass ? 'PASS ' : 'FAIL ') + d + ' A/C ' + st.step + ' · ' + st.detail);
    const mine = [...A.steps, ...B.steps, ...Cc.steps, st];
    fs.writeFileSync(path.join(OUT, 'steps-' + d.replace(/ /g, '_') + '.json'), JSON.stringify({ when: new Date().toISOString(), module_sha256: modSha, steps: mine }, null, 1));
  }
  // every device run so far for THIS module (a device file of another module hash is stale and is dropped)
  const missing = [];
  for (const d of ALL_DEVICES) {
    const f = path.join(OUT, 'steps-' + d.replace(/ /g, '_') + '.json');
    let j = null; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {}
    if (j && j.module_sha256 === modSha) all.push(...j.steps); else missing.push(d);
  }
  missing.forEach(d => all.push({ device: d, scenario: '-', step: 'device run for this module', pass: false, detail: 'no run of module ' + modSha.slice(0, 12) + ' on ' + d + ' in ' + OUT }));
  (py ? py.results : [{ test: 'drift_test.py', pass: false, detail: 'not run' }]).forEach(t => all.push({ device: 'python', scenario: 'P' + (t.test.match(/^P(\d)/) || [, '?'])[1], step: t.test, pass: t.pass, detail: t.detail }));
  if (HANDOFF) {
    const imgs = fs.readdirSync(path.join(HERE, 'img')).filter(f => /\.png$/.test(f));
    const big = imgs.filter(f => fs.statSync(path.join(HERE, 'img', f)).size >= 300 * 1024);
    all.push({ device: 'files', scenario: '-', step: 'img/ at most 4 PNG, each < 300 KB', pass: imgs.length <= 4 && !big.length,
      detail: imgs.map(f => f + ' ' + Math.round(fs.statSync(path.join(HERE, 'img', f)).size / 1024) + ' KB').join(', ') });
  }
  const fails = all.filter(s => !s.pass);
  const report = { when: new Date().toISOString(), url: URL0, pre_integration: PRE, module: { file: modFile, sha256: modSha, bytes: modBytes.length },
    drift: { sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(ED, 'data', 'drift.json'))).digest('hex'), counts: C }, steps: all,
    result: fails.length ? 'FAIL' : 'PASS' };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  if (HANDOFF) {
    const t = ['# TEST.md — Opus team 8, step 8 the drift (P1-P5: drift_test.py and P4 on Android)', '',
      'Written by `handoff/08-drift/test.cjs` (OPUS-8 tester). P1 determinism, P2 refusal, P3 ground truth by `git show`, the data half of P4 and P5 are `drift_test.py` (device `python`, independent of `tools/drift.py --check`); P4 on the page is Playwright with real touch on Pixel 7 and Galaxy S24, scenario A no drift module, B drift admitted, C drift admitted and data/drift.json answering 404.', '',
      'tools/drift.py sha256 `' + (py && py.tool_sha256 || '?') + '`; keys.json sha256 `' + (py && py.keys_json_sha256 || '?') + '`.', '',
      'Run ' + report.when + ' · ' + URL0 + (PRE ? ' · **pre-integration** (modules.json routed: served records re-hashed from disk + line-card + drift)' : ' · as served'),
      'Module `modules/' + modFile + '` sha256 `' + modSha + '` (' + modBytes.length + ' bytes); data/drift.json sha256 `' + report.drift.sha256 + '`.', '',
      '| device | scenario | step | result | measured |', '|---|---|---|---|---|',
      ...all.map(s => '| ' + s.device + ' | ' + s.scenario + ' | ' + s.step + ' | ' + (s.pass ? 'PASS' : 'FAIL') + ' | ' + String(s.detail).replace(/\|/g, '\\|').slice(0, 300) + ' |'), '',
      'RESULT: ' + report.result + ' (' + (all.length - fails.length) + ' of ' + all.length + ')', '',
      ...((py && py.info || []).length ? ['Measured, not pass/fail (drift_test.py):', '', ...py.info.map(x => '- ' + x), ''] : [])];
    fs.writeFileSync(path.join(HERE, 'TEST.md'), t.join('\n'));
  }
  console.log('RESULT: ' + report.result + ' (' + (all.length - fails.length) + ' of ' + all.length + ')' + (PRE ? ' pre-integration' : '') + (fails.length ? ' · failing: ' + fails.map(f => f.device + ' ' + f.step).join('; ') : ''));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('harness error', e); process.exit(2); });
