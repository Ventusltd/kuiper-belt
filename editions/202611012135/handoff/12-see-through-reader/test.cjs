#!/usr/bin/env node
// test.cjs  Opus team 12 "See Through hash reader": every hash form of see-through/202611020012/ on Pixel 7, through the
// stable pointer see-through/ served from the kuiper-belt root. Real touch for taps. Zero console errors apart from the
// sandbox's blocked map hosts (listed in IGNORE). Usage: node test.cjs [base=http://127.0.0.1:8601] [outdir]
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8601';
const OUT = path.resolve(process.argv[3] || '/tmp/nl010-opus/team-12/tester/out');
const ROOT = process.env.KB_ROOT || '/home/user/estate/kuiper-belt';
const STAMP = '202611020012', NRULE = 20000, NSUB = 5800;
const IGNORE = /basemaps\.cartocdn\.com/;
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'cosmos/wafer-meta.json'), 'utf8'));
const SPACE = meta.address_space;
const fmt = n => Number(n).toLocaleString('en-US');
const key = (j, sp) => Math.floor((j + 0.5) * sp / NRULE);

// independent count for #repo=gridatlas: walk cosmos/wafer.tsv as the engine does, count the phone's 12,900 star keys inside
function repoCount(name, np) {
  const rows = f => fs.readFileSync(path.join(ROOT, 'cosmos', f), 'utf8').split('\n').filter(l => l && l[0] !== '#').map(l => l.split('\t'));
  const ri = +rows('repos.tsv').find(r => r[1].toLowerCase() === name)[0];
  const ranges = []; let k = 0;
  for (const p of rows('wafer.tsv')) { k += +p[4]; const k0 = k; k += +p[1]; if (+p[2] === ri) ranges.push([k0, k]); }
  let n = 0;
  for (let q = 0; q < np; q++) { const ki = (np < NRULE && q >= NSUB) ? NSUB + 2 * (q - NSUB) : q, kk = key(ki, SPACE); if (ranges.some(r => kk >= r[0] && kk < r[1])) n++; }
  return n;
}

const results = []; const errors = [];
function check(name, ok, got) { results.push({ name, ok: !!ok, got }); console.log((ok ? 'PASS ' : 'FAIL ') + name + '  ' + JSON.stringify(got)); }

(async () => {
  // one browser per case: the 3D rise of an arrival keeps SwiftShader's GPU process busy for minutes, and that process is
  // shared by every page of a browser, so a fresh browser keeps one case from stalling the next
  async function newPage() {
    const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const ctx = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await ctx.newPage(); page.__b = browser; return page;
  }
  const done = async page => { await page.__b.close().catch(() => {}); };
  async function open(hash, opts = {}) {
    const page = await newPage();
    page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text() + ' ' + JSON.stringify(m.location()))) errors.push({ hash, text: m.text(), url: m.location().url }); });
    page.on('pageerror', e => errors.push({ hash, text: 'pageerror ' + e.message }));
    page.on('requestfailed', r => { if (!IGNORE.test(r.url())) errors.push({ hash, text: 'requestfailed ' + r.url() + ' ' + (r.failure() || {}).errorText, soft: true }); });
    if (opts.route) await opts.route(page);
    await page.goto(BASE + (opts.path || '/see-through/') + hash, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__descent && window.__descent.state(), null, { timeout: 30000 });
    await sleep(opts.wait || 7000);
    return page;
  }
  const st = p => p.evaluate(() => window.__descent.state());
  async function shot(page, name) {     // CDP capture: Playwright's own screenshot waits on a frame the 3D WebGL rise may hold for minutes under SwiftShader
    try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 60000 }); return; } catch (e) { console.log('playwright screenshot slow, CDP: ' + name); }
    try { const c = await page.context().newCDPSession(page);
      const r = await Promise.race([c.send('Page.captureScreenshot', { format: 'png' }), sleep(90000).then(() => null)]);
      if (r) fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64')); else console.log('screenshot timed out: ' + name);
      await c.detach().catch(() => {});
    } catch (e) { console.log('screenshot failed: ' + name + ' ' + e.message); }
  }
  async function waitArrive(page, t = 120000) { try { await page.waitForFunction(() => { const s = window.__descent.state(); return s.T >= 0 && s.D > 7.99 && !s.flight; }, null, { timeout: t }); } catch (e) {} }

  const k1182 = key(1182, SPACE), k1368 = key(1368, SPACE), old1182 = key(1182, 59637070538);

  // pointer: forwards search and hash to the stamp
  let p = await open('#sub=Drax', { wait: 1500 });
  await waitArrive(p);
  let s = await st(p);
  check('#sub=Drax flies to 1182 Drax, D 8', s.T === 1182 && s.name === 'Drax' && s.D > 7.99, { T: s.T, name: s.name, D: s.D });
  const wantHash = '#key=' + k1182 + '&space=' + SPACE + '&sub=Drax';
  const h = await p.evaluate(() => location.hash), lk = await p.evaluate(() => window.__descent.link());
  check('arrival writes ' + wantHash, h === wantHash && lk === wantHash, { hash: h, link: lk, space: s.space, spaceSource: s.spaceSource });
  check('spaceSource wafer-meta, space = cosmos address_space', s.spaceSource === 'wafer-meta' && s.space === SPACE, { space: s.space, src: s.spaceSource });
  await done(p);
  // the STAR KEY row (with view=kuiper, so the page stays in the 2D kuiper view instead of rising into 3D, whose WebGL under
  // SwiftShader holds the renderer for minutes; the rise is unchanged from 202610050609)
  p = await open('#sub=Drax&view=kuiper', { path: '/see-through/?from=test', wait: 1500 });
  check('pointer forwards search+hash to ' + STAMP, p.url().includes('/see-through/' + STAMP + '/?from=test#sub=Drax&view=kuiper'), p.url());
  await waitArrive(p); await sleep(2500);
  s = await st(p);
  check('#sub=Drax&view=kuiper: arrives at 1182 in the kuiper view', s.T === 1182 && s.view === 'kuiper' && !s.in3d, { T: s.T, view: s.view, in3d: s.in3d });
  const row = await p.evaluate(() => { const a = document.querySelector('a[data-st="kuiper-key"]'); if (!a) return null; const r = a.getBoundingClientRect(); return { text: a.textContent, href: a.getAttribute('href'), h: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2, vis: getComputedStyle(a).display !== 'none' }; });
  check('STAR KEY row: text, href ../../editions/#key=<k>, >= 44 px', row && row.vis && row.text === 'STAR KEY ' + fmt(k1182) + ' · OPEN IT ON THE KUIPER' && row.href === '../../editions/#key=' + k1182 && row.h >= 44, row);
  await shot(p, '01-sub-drax-star-key-row');
  if (row) {
    await p.touchscreen.tap(row.x, row.y);
    await p.waitForURL(/\/editions\/\d{12}\/#key=/, { timeout: 90000 }).catch(() => {});
    check('tap on the row opens the Kuiper at #key=<k> through the editions pointer', /\/editions\/\d{12}\/#key=(\d+)$/.test(p.url()) && p.url().endsWith('#key=' + k1182), p.url());
    await p.goBack({ timeout: 90000 }).catch(e => console.log('goBack: ' + e.message.split('\n')[0])); await sleep(4000);
    check('back returns to See Through', p.url().includes('/see-through/' + STAMP + '/'), p.url());
  }
  await done(p);

  for (const [hash, test, label] of [
    ['#sub=xyzzy', s => s.T === -1 && s.note === 'NO SUBSTATION NAME HERE CONTAINS THAT. TRY ANOTHER NAME', '#sub=xyzzy refusal words, no flight'],
    ['#sub=Hinkley', s => s.T === 1892, '#sub=Hinkley first substring match 1892'],
    ['#sub=Cowley', s => s.T === 201, '#sub=Cowley 201'],
  ]) { p = await open(hash, { wait: 3000 }); await sleep(1500); s = await st(p); check(label, test(s), { T: s.T, name: s.name, note: s.note }); await done(p); }

  // key: a line of code, one amber ring at KuiperLaw.place(k)
  p = await open('#key=36064705400');
  s = await st(p);
  const ring = await p.evaluate(() => {
    const d = window.__descent, s = d.state(), Rw = Math.sqrt(s.space + 0.5), ks = s.Rpx / Rw;
    const a = window.KuiperLaw.place(d.subKey(0)), sa = d.screenOf(0), cx = sa[0] - a.x * ks, cy = sa[1] + a.y * ks;
    const b = window.KuiperLaw.place(d.subKey(1)), sb = d.screenOf(1);
    const k = window.KuiperLaw.place(36064705400), r = d.ring();
    return { ring: r, want: { x: cx + k.x * ks, y: cy - k.y * ks }, starCheck: Math.hypot(sb[0] - (cx + b.x * ks), sb[1] - (cy - b.y * ks)) };
  });
  const rd = ring.ring ? Math.hypot(ring.ring.x - ring.want.x, ring.ring.y - ring.want.y) : 99;
  check('#key=36064705400: note, T -1, D 0, ring within 1 px of KuiperLaw.place(k)', s.T === -1 && s.D < 0.01 && s.note === 'KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION' && rd <= 1 && ring.starCheck <= 1, { note: s.note, D: s.D, ringPx: +rd.toFixed(3), star1Px: +ring.starCheck.toFixed(3) });
  await shot(p, '02-key-line-of-code-amber-ring');
  await done(p);

  p = await open('#key=' + k1182); s = await st(p);
  let box = await p.evaluate(() => document.querySelector('input').value);
  check('#key=<subKey 1182>: box Drax, THE STAR THAT LANDS ON DRAX', box === 'Drax' && s.note.startsWith('THE STAR THAT LANDS ON DRAX') && s.T === -1, { box, note: s.note });
  await done(p);

  p = await open('#key=' + SPACE); s = await st(p);
  check('#key=<SPACE>: IS BEYOND THIS SKY', /^KEY [\d,]+ IS BEYOND THIS SKY/.test(s.note), { note: s.note });
  await done(p);

  p = await open('#key=' + old1182 + '&space=59637070538'); s = await st(p);
  box = await p.evaluate(() => document.querySelector('input').value);
  check('#key=<old key>&space=59637070538: SPACE remap to the star of Drax', box === 'Drax' && s.note.startsWith('STAR KEY REMAPPED · SKY 59,637,070,538 → ' + fmt(SPACE)), { box, note: s.note });
  await shot(p, '03-key-space-remap');
  await done(p);

  p = await open('#key=' + k1368 + '&space=' + SPACE + '&sub=Drax', { wait: 2000 }); await waitArrive(p); s = await st(p);
  check('#key=<subKey 1368>&space&sub=Drax: identity wins, flies to 1368 (the second Drax)', s.T === 1368 && s.name === 'Drax', { T: s.T, name: s.name });
  await done(p);

  const want = repoCount('gridatlas', 12900);
  p = await open('#repo=gridatlas', { wait: 9000 }); s = await st(p);
  const lit = await p.evaluate(() => window.__descent.repoLit());
  check('#repo=gridatlas: note count equals the count from wafer.tsv (' + want + ')', s.note === 'GRIDATLAS · ' + fmt(want) + ' OF 12,900 STARS' && lit === want && s.NP === 12900, { note: s.note, lit });
  await shot(p, '04-repo-gridatlas-lit');
  await done(p);

  p = await open('#repo=nosuchrepo', { wait: 9000 }); s = await st(p);
  check('#repo=nosuchrepo refusal', s.note === 'NO REPOSITORY CALLED NOSUCHREPO', { note: s.note }); await done(p);

  p = await open('#sub=Cowley&view=sat', { wait: 2000 }); await waitArrive(p); await sleep(1500); s = await st(p);
  check('#sub=Cowley&view=sat: view after the flight', s.T === 201 && s.view === 'sat', { T: s.T, view: s.view }); await done(p);

  p = await open('#bogus=1'); s = await st(p);
  check('#bogus=1: LINK FIELD BOGUS NOT UNDERSTOOD', s.note === 'LINK FIELD BOGUS NOT UNDERSTOOD', { note: s.note }); await done(p);

  // hashchange on a loaded page
  p = await open(''); await p.evaluate(() => { location.hash = '#sub=Drax'; }); await waitArrive(p); s = await st(p);
  check('hashchange #sub=Drax on an open page flies', s.T === 1182, { T: s.T }); await done(p);

  // the sky: adopted from wafer-meta when it differs; frozen when it cannot be read
  p = await open('', { route: pg => pg.route('**/cosmos/wafer-meta.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...meta, address_space: SPACE + 1000 }) })) });
  s = await st(p); let sk = await p.evaluate(() => window.__descent.subKey(1182));
  check('wafer-meta address_space adopted at run time', s.space === SPACE + 1000 && s.spaceSource === 'wafer-meta' && sk === key(1182, SPACE + 1000), { space: s.space, src: s.spaceSource, k1182: sk });
  await done(p);
  p = await open('', { route: pg => pg.route('**/cosmos/wafer-meta.json', r => r.abort()) });
  s = await st(p);
  check('wafer-meta blocked: frozen sky', s.space === 63340120796 && s.spaceSource === 'frozen', { space: s.space, src: s.spaceSource });
  await done(p);
  errors.splice(0, errors.length, ...errors.filter(e => !(e.hash === '' && /wafer-meta/.test(e.text + ' ' + (e.url || '')))));   // the deliberate abort above

  // the X at the stars stage: opened directly -> the editions pointer; from the Kuiper -> history.back()
  p = await open('');
  const xl = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent === 'X'); const r = b.getBoundingClientRect(); return { label: b.getAttribute('aria-label'), x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(xl.x, xl.y);
  await p.waitForURL(/\/editions\/\d{12}\//, { timeout: 90000 }).catch(() => {});
  check('X at the stars (opened directly): aria-label "back to the Kuiper", lands on editions/', xl.label === 'back to the Kuiper' && /\/editions\/\d{12}\//.test(p.url()), { label: xl.label, url: p.url() });
  await done(p);
  p = await newPage();
  p.on('pageerror', e => errors.push({ hash: 'X-referrer', text: 'pageerror ' + e.message }));
  await p.goto(BASE + '/editions/202611012135/', { waitUntil: 'load' }); await sleep(3000);
  await p.evaluate(u => { location.href = u; }, BASE + '/see-through/');
  await p.waitForFunction(() => window.__descent && window.__descent.state(), null, { timeout: 30000 }); await sleep(5000);
  const xb = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent === 'X'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(xb.x, xb.y);
  await p.waitForURL(/\/editions\/202611012135\//, { timeout: 90000 }).catch(() => {});
  check('X at the stars (from the Kuiper): history.back() to the edition', p.url().endsWith('/editions/202611012135/'), p.url());
  await done(p);

  const hard = errors.filter(e => !e.soft);
  check('zero console errors apart from ' + IGNORE.source, hard.length === 0, hard.slice(0, 6));
  const report = { device: 'Pixel 7', base: BASE, stamp: STAMP, space: SPACE, when: new Date().toISOString(), pass: results.every(r => r.ok), n: results.length, failed: results.filter(r => !r.ok).length, results, softRequestFailures: errors.filter(e => e.soft) };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log('RESULT ' + (report.pass ? 'PASS' : 'FAIL') + ' ' + (report.n - report.failed) + '/' + report.n);
  process.exit(report.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
