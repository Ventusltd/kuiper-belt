#!/usr/bin/env node
// test-landscape.cjs — Opus team 2, line-card revision 202611020212 (Edition 6), the landscape fix, on Android.
// In the form of neural-link FIXES/NL-009/android-journey.cjs: Playwright, devices['Pixel 7 landscape'] (the defect),
// devices['Pixel 7'] and devices['Galaxy S24'] (no regression), real touch, zero console errors, JSON report.
//
//   node test-landscape.cjs <edition-url> <outdir> [--devices "Pixel 7 landscape,Pixel 7,Galaxy S24"]
//
// <edition-url> serves Edition 5 as published (kuiper-belt main a432b43, modules.json order hello, line-card,
// see-through). Through page.route only, the line-card record of modules.json is pointed at the revised file
// (modules/202611020212-line-card.js, served from handoff/02-card/edition-6/modules/ with its sha256 and bytes computed
// from those bytes); nothing else is substituted. The loader runs every check for real.
//
// L0 the revision is admitted (generation 202611020212, sha256 = the file), nothing refused, zero console errors
// L1 a card opened by touch (COMMANDS -> next verified line, panel closed by its title) is within its cap:
//    landscape min(50 % of the viewport, viewport - bar bottom - 140 px); portrait 34 % (Edition 4's cap)
// L2 the action row is whole: "details" and "open on GitHub" lie entirely inside the card's box and the viewport, ≥ 44 px tall
// L3 "details" tapped by touch at its centre opens the details (aria-expanded true), the card stays within the cap and the
//    action row stays whole; the details are reachable by scrolling the card
// L4 the selected spark lies in the clear band: under the bar and ≥ 14 px above the card's top
// L5 B1/B2 over all 344 placed bodies (stepping the page's own "e"): the first visible text node = keys.json line_text
//    (read from disk), the next row is the key with href = destination; every card within the cap with "details" whole
// L6 × tapped by touch closes the card and clears the selected spark
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const argv = process.argv.slice(2);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1] === '--devices'));
const di = argv.indexOf('--devices');
if (positional.length < 2) { console.error('usage: node test-landscape.cjs <edition-url> <outdir> [--devices A,B]'); process.exit(2); }
const URL0 = positional[0].replace(/\/?$/, '/'), OUT = path.resolve(positional[1]);
const DEVICES = di >= 0 ? argv[di + 1].split(',').map(s => s.trim()) : ['Pixel 7 landscape', 'Pixel 7', 'Galaxy S24'];
const FILE = 'modules/202611020212-line-card.js', SRC = path.join(__dirname, FILE);
const BYTES = fs.readFileSync(SRC), SHA = crypto.createHash('sha256').update(BYTES).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
let EXPECT = null;   // key -> {t, d, keyStr}, from the served keys.json bytes

function cardProbe() {
  const card = document.getElementById('card'), bar = document.getElementById('bar') || document.querySelector('.gm-bar');
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height, width: r.width }; };
  const c = R(card), t = R(card.querySelector('.lc-t')), a = R(card.querySelector('.lc-a a'));
  const whole = r => !!r && !!c && r.top >= c.top - 0.5 && r.bottom <= c.bottom + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5 && r.height >= 44 - 0.5;
  const landscape = innerWidth > innerHeight && innerHeight <= 500, barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
  const cap = landscape ? Math.min(0.5 * innerHeight, innerHeight - barBottom - 140) : 0.34 * innerHeight;
  return { open: getComputedStyle(card).display !== 'none', card: c, vh: innerHeight, vw: innerWidth, barBottom, landscape, cap: +cap.toFixed(1),
    withinCap: !!c && c.height <= cap + 1, details: t, link: a, detailsWhole: whole(t), linkWhole: whole(a), open_d: card.classList.contains('lc-open'),
    aria: card.querySelector('.lc-t') && card.querySelector('.lc-t').getAttribute('aria-expanded'), scrollH: card.scrollHeight, clientH: card.clientHeight,
    maxHeight: getComputedStyle(card).maxHeight, behind: getComputedStyle(card).visibility === 'hidden' };
}
function magentaProbe() {
  const o = document.getElementById('o'), k = o.width / innerWidth, d = o.getContext('2d').getImageData(0, 0, o.width, o.height).data; let sx = 0, sy = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 60 && d[i] > 180 && d[i + 1] < 110 && d[i + 2] > 140) { const p = i / 4; sx += p % o.width; sy += Math.floor(p / o.width); n++; }
  return n ? { x: sx / n / k, y: sy / n / k, px: n } : null;
}

async function runDevice(browser, name) {
  const dev = devices[name]; if (!dev) throw new Error('unknown device ' + name);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ ...dev, locale: 'en-GB' });
  await ctx.route(/^https:\/\/github\.com\//, r => r.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' }));
  await ctx.route(u => u.href.replace(/[?#].*$/, '') === URL0 + 'modules.json', async r => {
    const res = await r.fetch(); const m = await res.json(); const rec = m.modules.find(x => x.id === 'line-card');
    Object.assign(rec, { generation: '202611020212', path: FILE, sha256: SHA, bytes: BYTES.length });
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(m) }); });
  await ctx.route(u => u.href.replace(/[?#].*$/, '') === URL0 + FILE, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: BYTES }));
  const page = await ctx.newPage(); page.setDefaultTimeout(180000);
  const errors = []; page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push('pageerror: ' + String(e.message || e).slice(0, 300)));
  const checks = []; const rec = (id, pass, measured) => { checks.push({ id, pass: !!pass, measured }); process.stderr.write(`[${name}] ${pass ? 'PASS' : 'FAIL'} ${id}\n`); };
  const tap = (x, y) => page.touchscreen.tap(Math.round(x), Math.round(y));
  const tapSel = async s => { const r = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.width && b.height ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null; }, s); if (r) await tap(r.x, r.y); return !!r; };
  const shot = async f => { try { await page.screenshot({ path: path.join(dir, f), scale: 'css', timeout: 180000 }); return path.join(slug, f); } catch (e) { return 'FAILED ' + e.message.split('\n')[0]; } };

  await page.goto(URL0, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.done && /verified lines lit/.test(document.getElementById('big').textContent), null, { timeout: 180000 });
  await sleep(7000);
  if (!EXPECT) { EXPECT = {}; const j = await page.evaluate(async () => { const r = await fetch('keys.json'); return (await r.json()).bodies; });
    for (const b of j) if (b.on_wafer && b.verified && Number.isFinite(b.key)) EXPECT[b.key] = { t: b.line_text, d: b.destination, keyStr: b.repo + '@' + String(b.commit).slice(0, 7) + ' ' + b.path + ':' + b.line }; }
  const E = await page.evaluate(() => ({ admitted: window.__KUIPER_EDITION__.admitted, refused: window.__KUIPER_EDITION__.refused, gen: window.KY.modules['line-card'] && window.KY.modules['line-card'].generation, sha: window.KY.modules['line-card'] && window.KY.modules['line-card'].sha256 }));
  rec('L0 revision admitted, nothing refused', E.gen === '202611020212' && E.sha === SHA && !(E.refused || []).length, E);

  // open a card by touch: COMMANDS -> next verified line, then close the panel by its title
  await tapSel('#bar [data-panel="foot"]'); await sleep(600); await tapSel('#keys [data-k="e"]'); await sleep(600);
  if (await page.evaluate(() => !!document.querySelector('#bar .gm-on'))) { await tapSel('#bar .gm-on'); await sleep(600); }
  let s1 = null, m1 = null; for (let t = 0; t < 30; t++) { await sleep(t ? 700 : 6500); const m = await page.evaluate(magentaProbe); if (m && m1 && Math.hypot(m.x - m1.x, m.y - m1.y) < 0.6) break; m1 = m; }
  s1 = await page.evaluate(cardProbe); m1 = await page.evaluate(magentaProbe);
  rec('L1 card within its cap' + (s1.landscape ? ' (landscape: min(50 %, viewport - bar - 140))' : ' (34 %)'), s1.open && !s1.behind && s1.withinCap, { height: s1.card && s1.card.height, cap: s1.cap, maxHeight: s1.maxHeight, vh: s1.vh, barBottom: s1.barBottom });
  rec('L2 action row whole: details and link inside card and viewport, ≥ 44 px', s1.detailsWhole && s1.linkWhole, { details: s1.details, link: s1.link, card: s1.card });
  rec('L4 selected spark in the clear band', !!m1 && m1.y >= s1.barBottom && m1.y <= s1.card.top - 14, { spark: m1, barBottom: s1.barBottom, cardTop: s1.card && s1.card.top });
  const shotClosed = await shot('card-closed.png');
  // details by touch
  await tap(s1.details.left + s1.details.width / 2, s1.details.top + s1.details.height / 2); await sleep(900);
  const s2 = await page.evaluate(cardProbe);
  await page.evaluate(() => { const c = document.getElementById('card'); c.scrollTop = c.scrollHeight; }); await sleep(400);
  const dvis = await page.evaluate(() => { const c = document.getElementById('card').getBoundingClientRect(), d = document.querySelector('#card .lc-d').getBoundingClientRect(); return { dTop: d.top, dBottom: d.bottom, cTop: c.top, cBottom: c.bottom, display: getComputedStyle(document.querySelector('#card .lc-d')).display, visiblePx: Math.max(0, Math.min(c.bottom, d.bottom) - Math.max(c.top, d.top)) }; });
  const s3 = await page.evaluate(cardProbe);
  rec('L3 details opened by touch, within cap, action row whole, details reachable', s2.open_d && s2.aria === 'true' && s2.withinCap && s2.detailsWhole && dvis.display === 'block' && dvis.visiblePx >= 20 && s3.detailsWhole,
    { height: s2.card.height, cap: s2.cap, scrollH: s2.scrollH, clientH: s2.clientH, details: s2.details, detailsAfterScroll: s3.details, detailsBlock: dvis });
  const shotOpen = await shot('card-details-open.png');
  await page.evaluate(() => { document.getElementById('card').scrollTop = 0; });
  // × closes by touch
  await tapSel('#card .lc-x'); await sleep(1800);
  const closed = await page.evaluate(cardProbe), m6 = await page.evaluate(magentaProbe);
  rec('L6 × closes the card, spark cleared', !closed.open && !m6, { open: closed.open, magenta: m6 });
  // all 344 bodies through the page's own "e"
  const all = await page.evaluate(EX => {
    const card = document.getElementById('card'), api = KY.modules['line-card'].api, out = { n: 0, seen: 0, bad: [], capBad: [], wholeBad: [] }, seen = new Set();
    const landscape = innerWidth > innerHeight && innerHeight <= 500, bar = document.getElementById('bar'), bb = bar ? bar.getBoundingClientRect().bottom : 0;
    const cap = landscape ? Math.min(0.5 * innerHeight, innerHeight - bb - 140) : 0.34 * innerHeight;
    for (let i = 0; i < Object.keys(EX).length; i++) {
      dispatchEvent(new KeyboardEvent('keydown', { key: 'e' })); const k = api.inspect().last.k, ex = EX[k]; seen.add(k); out.n++;
      const inner = card.querySelector('.lc-in'), first = inner.firstElementChild, code = card.querySelector('.lc-h code'), second = first.nextElementSibling;
      const w = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, { acceptNode: n => n.data.length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP }); const ft = w.nextNode();
      const ok = ex && first.tagName === 'HEADER' && code.textContent === ex.t && (ex.t === '' ? ft.data === 'empty line at key' : ft.data === ex.t)
        && second.classList.contains('lc-k') && second.getAttribute('href') === ex.d && second.textContent.indexOf(ex.keyStr) === 0;
      if (!ok) out.bad.push(k);
      const c = card.getBoundingClientRect(), t = card.querySelector('.lc-t').getBoundingClientRect();
      if (c.height > cap + 1) out.capBad.push([k, Math.round(c.height)]);
      if (!(t.top >= c.top - 0.5 && t.bottom <= c.bottom + 0.5 && t.bottom <= innerHeight + 0.5 && t.height >= 43.5)) out.wholeBad.push([k, Math.round(t.top), Math.round(t.bottom), Math.round(c.bottom)]);
    }
    out.seen = seen.size; api.close(); return out; }, EXPECT);
  rec('L5 all placed bodies: header = line_text, key second, within cap, details whole', all.n === Object.keys(EXPECT).length && all.seen === all.n && !all.bad.length && !all.capBad.length && !all.wholeBad.length,
    { bodies: all.n, distinct: all.seen, headerMismatch: all.bad.slice(0, 5), overCap: all.capBad.slice(0, 5), detailsCut: all.wholeBad.slice(0, 5) });
  rec('zero console errors and page errors', errors.length === 0, errors.slice(0, 5));
  await ctx.close();
  return { device: name, viewport: dev.viewport, screenshots: [shotClosed, shotOpen], checks };
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const reports = [];
  try { for (const d of DEVICES) reports.push(await runDevice(browser, d)); } catch (e) { console.error('HARNESS ERROR', e); await browser.close(); process.exit(2); }
  await browser.close();
  const pass = reports.every(r => r.checks.every(c => c.pass));
  const out = { schema: 'kuiper.card.landscape.v1', url: URL0, utc: new Date().toISOString(), module: FILE, sha256: SHA, bytes: BYTES.length, devices: reports, RESULT: pass ? 'PASS' : 'FAIL' };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ RESULT: out.RESULT, sha256: SHA, devices: reports.map(r => ({ device: r.device, failed: r.checks.filter(c => !c.pass).map(c => c.id) })) }, null, 1));
  process.exit(pass ? 0 : 1);
})();
