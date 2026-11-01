#!/usr/bin/env node
// test.cjs — Opus team 2, roadmap step 2 "the card law: the line of code is the header", acceptance B1–B7 on Android.
// In the form of neural-link FIXES/NL-009/android-journey.cjs: Playwright, devices['Pixel 7'] and devices['Galaxy S24'],
// real touch (page.touchscreen.tap; CDP Input.dispatchTouchEvent for the swipe), zero console errors, JSON report.
//
//   node test.cjs <edition-url> <outdir> [--devices "Pixel 7,Galaxy S24"] [--with-shell] [--before]
//
// <edition-url> is http://127.0.0.1:<port>/editions/202611012135/ served from the kuiper-belt root. Until the integrator
// (Opus 10) has applied them, the page is served with Opus 4's handoff/04-loader/index.html.patch and our
// handoff/02-card/index.patch applied (page.route, the file on disk is never edited) and a modules.json whose `order` is
// [kuiper-shell (with --with-shell)], line-card, each record carrying the sha256 of the file on disk. When the page on
// disk already carries the hook table and the delegation, it is served as it is. --before also screenshots Edition 4's
// card from the unpatched page. Exit 0 when every check on every device passed, 1 otherwise, 2 on a harness error.
//
// B1 the card's first visible text node equals keys.json bodies[i].line_text byte for byte, for all 344 placed bodies
//    (expected values read from keys.json on disk by this script, not from the page); empty lines carry
//    "empty line at key"; aria-label = the header (K2); a "register quote" row for every quote ≠ line_text.
// B2 the second row is the key: repo, 7-character commit, path:line, key number; its href equals destination.
// B3 the title appears only after the key row; after a touch tap on "next verified line", on a spark and on a LINES row,
//    the card is ≤ 34 % of the viewport (closed and with details open) and the selected spark is in the clear space
//    (under the bar, ≥ 14 px above the card's top); NL-009 02-card: × and details ≥ 44 px, swipe-down closes and
//    un-targets, Escape closes, the card steps behind an open panel, the gesture-bar inset is paid, the link opens a
//    new tab with the card kept.
// B4 the K3 sentence is byte-identical in api.law, the module's header comment, handoff/02-card/LAWS-L11.patch,
//    handoff/02-card/README-card-law.md, the edition README.md, and (with --with-shell, when the shell has the slot)
//    the first paragraph of the ABOUT panel.
// B5 a body without line_text refuses with "no text at key" (never the title, never the quote).
// B6 every LINES row reads line text, key, title, in that order (all rows).
// B7 zero page errors and console errors; python3 tools/ci_check.py prints RESULT: PASS.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto'), cp = require('child_process');

const argv = process.argv.slice(2);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1] === '--devices'));
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : null; };
if (positional.length < 2) { console.error('usage: node test.cjs <edition-url> <outdir> [--devices A,B] [--with-shell] [--before]'); process.exit(2); }
const URL0 = positional[0].replace(/\/?$/, '/'), OUT = path.resolve(positional[1]);
const DEVICES = flag('--devices') ? String(flag('--devices')).split(',').map(s => s.trim()) : ['Pixel 7', 'Galaxy S24'];
const WITH_SHELL = !!flag('--with-shell'), BEFORE = !!flag('--before');
const ED = path.resolve(__dirname, '..', '..');                  // editions/202611012135
const ROOT = path.resolve(ED, '..', '..');                       // kuiper-belt
const HO = __dirname;
const MODULE = 'modules/202611012143-line-card.js', SHELL = 'modules/202611012143-kuiper-shell.js';
const LAW = 'The line of code is the header. Every card opens with the line itself, verbatim from the key; the key is the second row; every name a person gave the line comes after.';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LAUNCH = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
fs.mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------------ the expected values, from disk
const KEYS = JSON.parse(fs.readFileSync(path.join(ED, 'keys.json'), 'utf8'));
const BODIES = KEYS.bodies || KEYS;
const EXPECT = {};                                               // key -> {line_text, destination, quote, quote_key, title}
for (const b of BODIES) if (b.on_wafer && b.verified && Number.isFinite(b.key)) EXPECT[b.key] = { t: b.line_text, d: b.destination, q: b.quote || '', qk: b.quote_key || null, title: b.title,
  keyStr: b.repo + '@' + String(b.commit).slice(0, 7) + ' ' + b.path + ':' + b.line, b: { key: b.key, repo: b.repo, commit: b.commit, path: b.path, line: b.line, title: b.title } };
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

// ------------------------------------------------------------------ the page as it will be integrated
function servedIndex() {
  let html = fs.readFileSync(path.join(ED, 'index.html'), 'utf8'); const applied = [];
  if (!/window\.KY\s*=/.test(html)) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nl010-t2-')); const d = path.join(tmp, 'editions', '202611012135'); fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), html);
    cp.execFileSync('patch', ['-s', '-p1', '-i', path.join(ED, 'handoff', '04-loader', 'index.html.patch')], { cwd: tmp });
    html = fs.readFileSync(path.join(d, 'index.html'), 'utf8'); applied.push('handoff/04-loader/index.html.patch');
  }
  if (!/KY\.modules\['line-card'\]/.test(html)) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nl010-t2-')); const d = path.join(tmp, 'editions', '202611012135'); fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), html);
    cp.execFileSync('patch', ['-s', '-p1', '-i', path.join(HO, 'index.patch')], { cwd: tmp });
    html = fs.readFileSync(path.join(d, 'index.html'), 'utf8'); applied.push('handoff/02-card/index.patch');
  }
  return { html, applied };
}
function record(id, file, requires, provides, extra) {
  const buf = fs.readFileSync(path.join(ED, file)); const gen = path.basename(file).slice(0, 12);
  return Object.assign({ id, generation: gen, path: file, sha256: sha(buf), bytes: buf.length, byte_budget: 65536, requires, provides,
    reads: [], writes: [], creates_controls: 'none', licence: 'Apache-2.0' }, extra || {});
}
function moduleRequires(file) {   // the registration's own requires, read from the file (the manifest must list them all)
  const s = fs.readFileSync(path.join(ED, file), 'utf8'); const m = s.match(/requires:\s*\[([^\]]*)\]/); if (!m) return [];
  return m[1].split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}
function servedManifest() {
  const disk = JSON.parse(fs.readFileSync(path.join(ED, 'modules.json'), 'utf8'));
  if ((disk.order || []).includes('line-card')) return { json: disk, from: 'modules.json on disk' };
  const order = [], modules = [];
  if (WITH_SHELL && fs.existsSync(path.join(ED, SHELL))) { order.push('kuiper-shell'); modules.push(record('kuiper-shell', SHELL, moduleRequires(SHELL), ['kuiper-shell'])); }
  order.push('line-card'); modules.push(record('line-card', MODULE, moduleRequires(MODULE), ['line-card'], { team: '02', step: 2 }));
  return { json: { schema: 'kuiper.modules.v1', edition: '202611012135', hooks: 'kuiper.hooks.v1', order, modules }, from: 'test manifest (order ' + order.join(', ') + ')' };
}

// ------------------------------------------------------------------ in-page probes
function overlayProbe() {
  const o = document.getElementById('o'); const W = o.width, H = o.height, k = W / innerWidth; const d = o.getContext('2d').getImageData(0, 0, W, H).data;
  let sx = 0, sy = 0, n = 0; const gp = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]; if (a < 60) continue;
    if (r > 180 && g < 110 && b > 140) { sx += x; sy += y; n++; } else if (g > 150 && r < 120 && b < 170 && a > 120) gp.push([x, y]); }
  const cl = [];
  for (const [x, y] of gp) { let hit = null; for (const c of cl) if (Math.abs(c.cx - x) <= 7 && Math.abs(c.cy - y) <= 7) { hit = c; break; }
    if (hit) { hit.sx += x; hit.sy += y; hit.n++; hit.cx = hit.sx / hit.n; hit.cy = hit.sy / hit.n; } else cl.push({ sx: x, sy: y, n: 1, cx: x, cy: y }); }
  return { magenta: n ? { x: sx / n / k, y: sy / n / k, px: n } : null, greens: cl.filter(c => c.n >= 4).map(c => ({ x: c.cx / k, y: c.cy / k, px: c.n })) };
}
function cardProbe() {
  const card = document.getElementById('card'), bar = document.getElementById('bar');
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const open = getComputedStyle(card).display !== 'none';
  return { open, rect: R(card), bar: R(bar), vh: innerHeight, vw: innerWidth, header: card.querySelector('.lc-h code') ? card.querySelector('.lc-h code').textContent : null,
    behind: getComputedStyle(card).visibility === 'hidden', details: card.classList.contains('lc-open'), x: R(card.querySelector('.lc-x')), t: R(card.querySelector('.lc-t')),
    a: R(card.querySelector('.lc-a a')), fontSize: getComputedStyle(card).fontSize, padBottom: getComputedStyle(card.querySelector('.lc-in') || card).paddingBottom };
}

// ------------------------------------------------------------------ one device
async function runDevice(browser, name) {
  const dev = devices[name]; if (!dev) throw new Error('unknown device ' + name);
  const dir = path.join(OUT, name.toLowerCase().replace(/[^a-z0-9]+/g, '-')); fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ ...dev, locale: 'en-GB' });
  await ctx.route(/^https:\/\/github\.com\//, r => r.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' }));
  const S = servedIndex(), M = servedManifest();
  await ctx.route(u => u.href.replace(/[?#].*$/, '') === URL0 || u.href.replace(/[?#].*$/, '') === URL0 + 'index.html',
    r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: S.html }));
  await ctx.route(u => u.href.replace(/[?#].*$/, '') === URL0 + 'modules.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(M.json) }));
  const page = await ctx.newPage(); page.setDefaultTimeout(180000);
  const cdp = await ctx.newCDPSession(page);
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push('pageerror: ' + String(e.message || e).slice(0, 300)));
  const checks = []; const rec = (id, pass, measured, note) => { checks.push({ id, pass: !!pass, measured, note: note || '' }); process.stderr.write(`[${name}] ${pass ? 'PASS' : 'FAIL'} ${id}${note ? ' — ' + note : ''}\n`); };
  const shot = async f => { try { await page.screenshot({ path: path.join(dir, f), scale: 'css', timeout: 180000 }); return f; } catch (e) { return 'FAILED ' + String(e.message).split('\n')[0]; } };
  const tap = (x, y) => page.touchscreen.tap(Math.round(x), Math.round(y));
  const tapEl = async sel => { const r = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.width && b.height ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null; }, sel); if (!r) return false; await tap(r.x, r.y); return true; };
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
  const visible = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  // open whichever bar title shows the element (Edition 4's titles, or the shell's), by touch
  const reveal = async sel => {
    if (await visible(sel)) return true;
    const titles = await page.evaluate(() => [...document.querySelectorAll('#bar .gm-title, #bar [data-panel], #bar [data-menu]')].map((b, i) => { b.setAttribute('data-t2', i); return i; }));
    for (const i of titles) { await tapEl(`[data-t2="${i}"]`); await sleep(500); if (await visible(sel)) return true; await tapEl(`[data-t2="${i}"]`); await sleep(300); }
    return false;
  };
  const settleSpark = async () => { let last = null; for (let t = 0; t < 40; t++) { await sleep(t ? 700 : 6500); const o = await page.evaluate(overlayProbe); if (o.magenta && last && Math.hypot(o.magenta.x - last.x, o.magenta.y - last.y) < 0.6) return o; last = o.magenta; } return page.evaluate(overlayProbe); };
  const clearSpace = async (label) => {
    const o = await settleSpark(), c = await page.evaluate(cardProbe);
    const ok = c.open && !c.behind && !!o.magenta && o.magenta.y >= c.bar.bottom && o.magenta.y <= c.rect.top - 14 && c.rect.height <= 0.34 * c.vh + 0.5;
    rec('B3 ' + label + ': capped and spark in clear space', ok, { spark: o.magenta, cardTop: c.rect && c.rect.top, cardH: c.rect && c.rect.height, share: c.rect && +(c.rect.height / c.vh).toFixed(3), barBottom: c.bar && c.bar.bottom });
    return { o, c };
  };

  const t0 = Date.now();
  await page.goto(URL0, { waitUntil: 'load' });
  await page.waitForFunction(() => /verified lines lit/.test((document.getElementById('big') || {}).textContent || '') && window.KY && window.KY.modules && window.KY.modules['line-card'], null, { timeout: 180000 });
  await sleep(7000);
  const edition = await page.evaluate(() => ({ admitted: window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.admitted, refused: window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.refused, big: document.getElementById('big').textContent }));
  rec('line-card admitted by the loader', (edition.admitted || []).some(a => a.id === 'line-card') && !(edition.refused || []).length, edition, 'served: ' + S.applied.join(' + ') + ' · ' + M.from);

  // ---- B3 by touch: "next verified line"
  const okE = await reveal('#keys [data-k="e"]') && await tapEl('#keys [data-k="e"]'); await sleep(600);
  // Edition 4's COMMANDS panel stays open after a command (the shell's rows close theirs): the card waits behind it
  // (02-card F4), so close the panel the way a person does, by tapping its open title
  const stillOpen = await page.evaluate(() => { const t = document.querySelector('#bar .gm-on'); if (t) t.setAttribute('data-t2o', '1'); return !!t; });
  const behindWhileOpen = (await page.evaluate(cardProbe)).behind; if (stillOpen) { await tapEl('[data-t2o="1"]'); await sleep(600); }
  rec('touch: next verified line tapped', okE, { panelStayedOpen: stillOpen, cardBehindWhileOpen: behindWhileOpen });
  const e1 = await clearSpace('after next verified line');
  const shotAfter = await shot('after-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png');
  // NL-009 02-card targets and type
  const hit = await page.evaluate(() => { const card = document.getElementById('card'); const out = {};
    for (const [k, s] of [['x', '.lc-x'], ['details', '.lc-t'], ['link', '.lc-a a']]) { const el = card.querySelector(s), r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let a = cx, b = cx, c = cy, d = cy;
      for (let dx = -40; dx <= 40; dx++) for (let dy = -40; dy <= 40; dy++) { const t = document.elementFromPoint(cx + dx, cy + dy); if (t && (t === el || el.contains(t))) { a = Math.min(a, cx + dx); b = Math.max(b, cx + dx); c = Math.min(c, cy + dy); d = Math.max(d, cy + dy); } }
      out[k] = [b - a + 1, d - c + 1]; } return out; });
  rec('02-card F1/F2: × ≥ 44×44, details and link ≥ 44 tall', hit.x[0] >= 44 && hit.x[1] >= 44 && hit.details[1] >= 44 && hit.link[1] >= 44, hit);
  rec('02-card F6: 12 px type on a phone', e1.c.fontSize === '12px', e1.c.fontSize);
  // details by touch: names come after, cap holds
  await tapEl('#card .lc-t'); await sleep(800);
  const det = await page.evaluate(() => { const card = document.getElementById('card'), k = card.querySelector('.lc-k'), t = card.querySelector('.lc-title'), r = card.getBoundingClientRect();
    return { open: card.classList.contains('lc-open'), aria: card.querySelector('.lc-t').getAttribute('aria-expanded'), titleAfterKey: !!(k && t && (k.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)), titleTop: t.getBoundingClientRect().top, keyBottom: k.getBoundingClientRect().bottom, share: r.height / innerHeight }; });
  rec('B3 details open: title only after the key row, aria-expanded, still ≤ 34 %', det.open && det.aria === 'true' && det.titleAfterKey && det.titleTop >= det.keyBottom - 0.5 && det.share <= 0.3405, det);
  // the link: a new tab, the card stays
  await page.evaluate(() => { document.getElementById('card').scrollTop = 0; });
  const np = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null); await tapEl('#card .lc-a a'); const p2 = await np;
  rec('02-card F8: the link opens a new tab, card kept', !!p2 && (await page.evaluate(cardProbe)).open, { newTab: p2 ? p2.url() : null }); if (p2) await p2.close();
  // a panel over the card: the card steps behind, and returns
  const panelTitle = await page.evaluate(() => { const b = document.querySelector('#bar .gm-title'); if (b) b.setAttribute('data-t2p', '1'); return !!b; });
  if (panelTitle) { await tapEl('[data-t2p="1"]'); await sleep(800); const b1 = (await page.evaluate(cardProbe)).behind; await tapEl('[data-t2p="1"]'); await sleep(800); const b2 = (await page.evaluate(cardProbe)).behind;
    rec('02-card F4: behind an open panel, back when it closes', b1 && !b2, { behindWhileOpen: b1, behindAfter: b2 }); }
  // the gesture-bar inset
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom: 24 } }).catch(() => null); await sleep(400);
  const pad = (await page.evaluate(cardProbe)).padBottom; await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: {} }).catch(() => null);
  rec('02-card F5: pays the gesture bar (24 px inset → 32 px padding)', pad === '32px', pad);
  // swipe down closes and un-targets
  await page.evaluate(() => { const c = document.getElementById('card'); c.scrollTop = 0; });
  const c3 = (await page.evaluate(cardProbe)).rect; const sx = c3.left + c3.width / 2;
  await touch('touchStart', [[sx, c3.top + 14]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[sx, c3.top + 14 + i * 12]]); await sleep(16); } await touch('touchEnd', []); await sleep(1800);
  const sw = await page.evaluate(cardProbe), swo = await page.evaluate(overlayProbe);
  rec('02-card F7: swipe down closes, spark un-targeted', !sw.open && !swo.magenta, { open: sw.open, magenta: swo.magenta });

  // ---- B3 by touch: a spark
  const greens = (await page.evaluate(overlayProbe)).greens; const bar = (await page.evaluate(cardProbe)).bar;
  const vh = (await page.evaluate(cardProbe)).vh, vw = (await page.evaluate(cardProbe)).vw;
  const spark = greens.filter(g => g.y > bar.bottom + 40 && g.y < vh * 0.6 && g.x > 20 && g.x < vw - 20).sort((a, b) => Math.hypot(a.x - vw / 2, a.y - vh / 3) - Math.hypot(b.x - vw / 2, b.y - vh / 3))[0];
  let spOk = false;
  if (spark) { await tap(spark.x, spark.y); await sleep(1500); spOk = (await page.evaluate(cardProbe)).open; }
  rec('touch: a spark tapped opens its card', spOk, { spark, candidates: greens.length });
  if (spOk) await clearSpace('after a spark');
  // Escape closes when no panel is open
  await page.keyboard.press('Escape'); await sleep(1200);
  rec('02-card F7: Escape closes the card', !(await page.evaluate(cardProbe)).open);

  // ---- B6 and B3 by touch: the LINES rows
  const okL = await reveal('#lineslist .ln[data-i]');
  const rows = await page.evaluate(EX => { const out = { n: 0, bad: [] };
    const seen = new Set();
    for (const row of document.querySelectorAll('#lineslist .ln[data-i]')) { out.n++;
      const kids = [...row.children], code = kids[0], kEl = row.querySelector('.lc-rk'), tEl = row.querySelector('.lc-rn');
      const m = kEl && kEl.textContent.match(/ · key ([\d,]+)$/), k = m ? Number(m[1].replace(/,/g, '')) : NaN, ex = EX[k]; seen.add(k);
      const order = code && kEl && tEl && code.tagName === 'CODE' && (code.compareDocumentPosition(kEl) & 4) && (kEl.compareDocumentPosition(tEl) & 4);
      if (!ex || !order || code.textContent !== ex.t || kEl.textContent.indexOf(ex.keyStr) !== 0 || tEl.textContent !== (ex.title || ''))
        out.bad.push(k); }
    out.distinct = seen.size;
    return out; }, EXPECT);
  rec('B6 LINES rows read text, key, title (all rows)', okL && rows.n === Object.keys(EXPECT).length && rows.distinct === rows.n && rows.bad.length === 0, { rows: rows.n, distinct: rows.distinct, mismatches: rows.bad.slice(0, 5) });
  const rowSel = await page.evaluate(() => { const rs = [...document.querySelectorAll('#lineslist .ln[data-i]')]; const r = rs.find(x => { const b = x.getBoundingClientRect(); return b.top > 0 && b.bottom < innerHeight * 0.6; }) || rs[0]; r.setAttribute('data-t2r', '1');
    const m = r.querySelector('.lc-rk').textContent.match(/ · key ([\d,]+)$/); return m ? Number(m[1].replace(/,/g, '')) : null; });
  await tapEl('[data-t2r="1"]'); await sleep(1200);
  const afterRow = await page.evaluate(() => ({ open: getComputedStyle(document.getElementById('card')).display !== 'none', header: document.querySelector('#card .lc-h code').textContent, k: KY.modules['line-card'].api.inspect().last.k, panel: !!document.querySelector('.gm-open') }));
  rec('touch: a LINES row opens its card with its line as the header', afterRow.open && afterRow.k === rowSel && afterRow.header === EXPECT[rowSel].t && !afterRow.panel, { rowKey: rowSel, cardKey: afterRow.k, panelOpen: afterRow.panel });
  if (afterRow.open) await clearSpace('after a LINES row');

  // ---- B1, B2 over all 344 placed bodies, stepping the page's own 'e' (edNext -> edCard -> api.show)
  const all = await page.evaluate(EX => {
    const out = { n: 0, b1: [], b2: [], aria: [], empty: 0, emptyWords: 0, quoteRows: 0, quoteKeyRows: 0, expectQuoteRows: 0, slowest: [0, -1] };
    const card = document.getElementById('card'), api = KY.modules['line-card'].api, seen = new Set(); api.close();
    const total = Object.keys(EX).length;
    for (let i = 0; i < total; i++) {
      const t0 = performance.now(); dispatchEvent(new KeyboardEvent('keydown', { key: 'e' })); const dt = performance.now() - t0;   // the page's own path: edNext -> edCard -> api.show
      const k = api.inspect().last.k, ex = EX[k]; if (dt > out.slowest[0]) out.slowest = [Math.round(dt), k]; seen.add(k);
      const b = ex.b; out.n++;
      const inner = card.querySelector('.lc-in'), first = inner && inner.firstElementChild, code = card.querySelector('.lc-h code');
      // the first visible text node of the card
      const w = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, { acceptNode: n => { const el = n.parentElement; if (!n.data.length) return NodeFilter.FILTER_SKIP; for (let p = el; p && p !== card.parentElement; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.display === 'none' || p.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_SKIP; } return NodeFilter.FILTER_ACCEPT; } });
      const ft = w.nextNode(); const firstText = ft ? ft.data : null;
      const okHeader = first && first.tagName === 'HEADER' && first.classList.contains('lc-h') && code && code.textContent === ex.t
        && (ex.t === '' ? (firstText === 'empty line at key') : firstText === ex.t);
      if (ex.t === '') { out.empty++; if (firstText === 'empty line at key') out.emptyWords++; }
      if (!okHeader) out.b1.push({ key: b.key, first: first && first.tagName, firstText: firstText && firstText.slice(0, 60), expect: ex.t.slice(0, 60) });
      if (card.getAttribute('aria-label') !== ex.t || card.getAttribute('aria-live') !== 'polite') out.aria.push(b.key);
      const second = first && first.nextElementSibling;
      const keyStr = b.repo + '@' + String(b.commit).slice(0, 7) + ' ' + b.path + ':' + b.line;
      if (!(second && second.classList.contains('lc-k') && second.tagName === 'A' && second.getAttribute('href') === ex.d && second.textContent.indexOf(keyStr) === 0 && second.textContent.indexOf(b.key.toLocaleString('en-GB')) > 0))
        out.b2.push({ key: b.key, second: second && second.className, text: second && second.textContent.slice(0, 80) });
      if (ex.q && ex.q !== ex.t) out.expectQuoteRows++;
      const q = card.querySelector('.lc-q'); if (q) { out.quoteRows++; if (/quoted one line below/.test(q.textContent)) out.quoteKeyRows++; }
      // the title is never in the header or the key row
      if (b.title && (code.textContent === b.title && ex.t !== b.title)) out.b1.push({ key: b.key, titleAsHeader: true });
    }
    out.distinct = seen.size; api.close();
    return out; }, EXPECT);
  rec('B1 first visible text node = line_text, all placed bodies', all.n === Object.keys(EXPECT).length && all.distinct === all.n && all.b1.length === 0 && all.empty === all.emptyWords,
    { bodies: all.n, distinct: all.distinct, mismatches: all.b1.length, first: all.b1.slice(0, 3), empty: all.empty, emptyWords: all.emptyWords, slowest_ms_key: all.slowest });
  rec('K2 aria-label = header, aria-live polite, all bodies', all.aria.length === 0, { mismatches: all.aria.length });
  rec('B1 register quote row for every quote ≠ line_text', all.quoteRows === all.expectQuoteRows, { quoteRows: all.quoteRows, expected: all.expectQuoteRows, quotedOneLineBelow: all.quoteKeyRows });
  rec('B2 second row = key (repo@commit7 path:line · key N), href = destination, all bodies', all.b2.length === 0, { mismatches: all.b2.length, first: all.b2.slice(0, 3) });

  // ---- B5: a body without line_text refuses
  const b5 = await page.evaluate(b => { delete b.line_text; const api = KY.modules['line-card'].api; api.show(b, { index: 0, of: 344 });
    const card = document.getElementById('card'), h = card.querySelector('.lc-h'); const r = { headerText: h.textContent, code: h.querySelector('code').textContent, title: b.title, quote: b.quote, aria: card.getAttribute('aria-label'), apiHeader: api.header(b) }; api.close(); return r; }, Object.assign({}, BODIES.find(b => b.on_wafer && b.verified)));
  rec('B5 no line_text → "no text at key", never the title or the quote', b5.headerText === 'no text at key' && b5.code === '' && b5.aria === 'no text at key' && b5.apiHeader === 'no text at key', b5);

  // ---- B4 in the page (api.law and, with the shell, ABOUT's first paragraph)
  const b4 = await page.evaluate(() => { const api = KY.modules['line-card'].api; const slot = document.querySelector('[data-owner="line-card"][data-law="L11"]');
    let about = null; const panels = [...document.querySelectorAll('.gm-panel')]; const ab = panels.find(p => /about/i.test(p.id + ' ' + (p.getAttribute('aria-label') || '') + ' ' + (p.dataset.panel || '') + ' ' + (p.dataset.menu || '')));
    if (ab) { const p = ab.querySelector('p, .gm-prose'); about = p ? p.textContent : null; }
    return { law: api.law, slot: slot ? slot.textContent : null, about }; });
  const fileOf = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } };
  const srcs = { module: fileOf(path.join(ED, MODULE)), laws: fileOf(path.join(HO, 'LAWS-L11.patch')), readmeSection: fileOf(path.join(HO, 'README-card-law.md')), editionReadme: fileOf(path.join(ED, 'README.md')) };
  const has = Object.fromEntries(Object.entries(srcs).map(([k, v]) => [k, v.includes(LAW)]));
  const pageOk = b4.law === LAW && (!WITH_SHELL || b4.slot === LAW || b4.about === LAW);
  rec('B4 the K3 sentence identical in page, README, LAWS patch, module', pageOk && Object.values(has).every(Boolean), { apiLaw: b4.law === LAW, aboutSlot: b4.slot === null ? 'absent (shell not in this run or no slot yet)' : b4.slot === LAW, aboutFirst: b4.about === null ? null : b4.about === LAW, files: has });

  // ---- B7
  rec('B7 zero page errors and console errors', errors.length === 0, errors.slice(0, 5));
  const report = { device: name, viewport: dev.viewport, ms: Date.now() - t0, served: S.applied, manifest: M.from, screenshot: shotAfter, checks };
  await ctx.close();
  return report;
}

(async () => {
  const browser = await chromium.launch(LAUNCH); const reports = [];
  try {
    if (BEFORE) {   // Edition 4's card on the unpatched page, for the before/after pair
      const ctx = await browser.newContext({ ...devices['Pixel 7'], locale: 'en-GB' }); const p = await ctx.newPage(); p.setDefaultTimeout(180000);
      await p.goto(URL0, { waitUntil: 'load' }); await p.waitForFunction(() => /verified lines lit/.test(document.getElementById('big').textContent), null, { timeout: 180000 }); await sleep(7000);
      await p.evaluate(() => { const t = document.querySelector('#bar [data-panel="foot"]'); if (t) t.click(); }); await sleep(500);
      const r = await p.evaluate(() => { const b = document.querySelector('#keys [data-k="e"]').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
      await p.touchscreen.tap(r.x, r.y); await sleep(8000);
      fs.mkdirSync(path.join(OUT, 'pixel-7'), { recursive: true }); await p.screenshot({ path: path.join(OUT, 'pixel-7', 'before-pixel-7.png'), scale: 'css', timeout: 180000 }); await ctx.close();
    }
    for (const d of DEVICES) reports.push(await runDevice(browser, d));
  } catch (e) { console.error('HARNESS ERROR', e); await browser.close(); process.exit(2); }
  await browser.close();
  let ci = null; try { ci = cp.execFileSync('python3', ['tools/ci_check.py'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { ci = String(e.stdout || '') + String(e.stderr || ''); }
  const ciPass = /RESULT: PASS/.test(ci || '');
  const pass = reports.every(r => r.checks.every(c => c.pass)) && ciPass;
  const out = { schema: 'kuiper.card.accept.v1', step: 2, url: URL0, utc: new Date().toISOString(), module: MODULE, module_sha256: sha(fs.readFileSync(path.join(ED, MODULE))),
    ci_check: { pass: ciPass, tail: (ci || '').trim().split('\n').slice(-2) }, devices: reports, RESULT: pass ? 'PASS' : 'FAIL' };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ RESULT: out.RESULT, ci_check: out.ci_check, devices: reports.map(r => ({ device: r.device, failed: r.checks.filter(c => !c.pass).map(c => c.id) })) }, null, 1));
  process.exit(pass ? 0 : 1);
})();
