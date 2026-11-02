// xcheck.cjs (01:45, after the pointer-hop fix of goHome): the X steps of rerun.cjs. rerun.cjs: the four steps of test.cjs run 1 that failed on time under load 40-60 (round trip by the STAR KEY row, #view=sat
// after the flight, the X at the stars both ways), with long waits; same assertions as test.cjs. Pixel 7, real touch.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8601', STAMP = '202611020012', IGNORE = /basemaps\.cartocdn\.com/;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SPACE = JSON.parse(fs.readFileSync('/home/user/estate/kuiper-belt/cosmos/wafer-meta.json', 'utf8')).address_space;
const k1182 = Math.floor(1182.5 * SPACE / 20000);
const results = [], errors = [];
const check = (n, ok, got) => { results.push({ name: n, ok: !!ok, got }); console.log((ok ? 'PASS ' : 'FAIL ') + n + '  ' + JSON.stringify(got)); };
async function newPage(tag) {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ ...devices['Pixel 7'] })).newPage(); p.__b = b;
  p.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text() + ' ' + m.location().url)) errors.push({ tag, text: m.text(), url: m.location().url }); });
  p.on('pageerror', e => errors.push({ tag, text: 'pageerror ' + e.message }));
  return p;
}
const ready = p => p.waitForFunction(() => window.__descent && window.__descent.state(), null, { timeout: 120000 });
const arrived = p => p.waitForFunction(() => { const s = window.__descent.state(); return s.T >= 0 && s.D > 7.99 && !s.flight; }, null, { timeout: 180000 });
const xbtn = p => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent === 'X'); const r = b.getBoundingClientRect(); return { label: b.getAttribute('aria-label'), x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
(async () => {
  let p, x;
  p = await newPage('x-direct');
  await p.goto(BASE + '/see-through/'); await ready(p); await sleep(8000);
  x = await xbtn(p); await p.touchscreen.tap(x.x, x.y);
  await p.waitForURL(/\/editions\/\d{12}\//, { timeout: 120000 }).catch(() => {});
  check('X at the stars (opened directly): aria-label "back to the Kuiper", lands on editions/', x.label === 'back to the Kuiper' && /\/editions\/\d{12}\//.test(p.url()), { label: x.label, url: p.url() });
  await p.__b.close();

  p = await newPage('x-referrer');
  await p.goto(BASE + '/editions/202611012135/'); await sleep(5000);
  await p.evaluate(u => { location.href = u; }, BASE + '/see-through/');
  await p.waitForURL(/\/see-through\/202611020012\//, { timeout: 120000 }); await ready(p); await sleep(8000);
  x = await xbtn(p); await p.touchscreen.tap(x.x, x.y);
  await p.waitForURL(/\/editions\/202611012135\//, { timeout: 120000 }).catch(() => {});
  check('X at the stars (from the Kuiper): history.back() to the edition', p.url().endsWith('/editions/202611012135/'), p.url());
  await p.__b.close();

  check('zero console errors on See Through pages apart from ' + IGNORE.source, errors.filter(e => /see-through/.test(e.url || '') || /pageerror/.test(e.text)).length === 0, errors.slice(0, 8));
  fs.writeFileSync('/tmp/nl010-opus/team-12/tester/out/report-xcheck.json', JSON.stringify({ when: new Date().toISOString(), results, errors }, null, 1));
  console.log('RESULT ' + (results.every(r => r.ok) ? 'PASS' : 'FAIL') + ' ' + results.filter(r => r.ok).length + '/' + results.length);
})().catch(e => { console.error(e); process.exit(2); });
