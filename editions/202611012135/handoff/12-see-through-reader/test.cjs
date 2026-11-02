#!/usr/bin/env node
// test.cjs  Opus team 12 "See Through hash reader" (NL-010): the hand-off test of see-through/<stamp>/, measured, not
// eyeballed. Written by OPUS-12 tester in the form of FIXES/NL-009/android-journey.cjs (Playwright, real touch for taps,
// a JSON report, exit 0 only when every check passed), building on the lead's draft (/tmp/nl010-opus/team-12/tester).
//
//   node test.cjs [baseUrl] [outdir] [--img <dir>] [--devices "Pixel 7,Galaxy S24"]
//
//   baseUrl  the kuiper-belt repository root as served (default http://127.0.0.1:8611/, OPUS-12 tester's port:
//            python3 -m http.server 8611 --bind 127.0.0.1 from /home/user/estate/kuiper-belt)
//   outdir   screenshots and report.json (default /tmp/nl010-opus/team-12/tester/run)
//   --img    also write the four hand-off screenshots (PNG, CSS-pixel scale, each < 300 KB) into this folder
//   --devices default "Pixel 7" (one device at a time, sequentially; the machine is shared)
//
// The grammar is FIXES/NL-010/team-3/STEPS.md step 5.5 (the table) with acceptance A3 and the 5.8 b row; the folder and
// the pointer are handoff/12-see-through-reader/PLAN.md. The stamp is read from the pointer see-through/index.html.
//
// Cases (each a fresh browser: the 3D rise after an arrival holds SwiftShader's GPU process, shared by a browser's pages):
//   C1 <stamp>/#sub=Drax                     the typed name: box "Drax", flight to 1182, D 8, name Drax; the link written on
//                                            arrival (#key=<subKey 1182>&space=<SPACE>&sub=Drax) = __descent.link();
//                                            the row "STAR KEY <k> · OPEN IT ON THE KUIPER", an <a> to ../../editions/#key=<k>,
//                                            >= 44 px, visible, resolving to <base>editions/#key=<k> (HEAD 200)
//   C2 <stamp>/#key=<subKey 1182>&space=63340120796
//                                            the selected star: T -1, D 0 (nothing moves), box "Drax", note
//                                            "THE STAR THAT LANDS ON DRAX. PRESS GO"; sky = wafer-meta address_space
//   C3 <stamp>/#key=<subKey 201>             a star key in See Through's own sky without &space: box "Cowley Substation",
//                                            note "THE STAR THAT LANDS ON COWLEY SUBSTATION. PRESS GO"; then, on the same page by
//                                            hashchange: #key=36064705400 (a line of code: note, one amber ring within 1 px
//                                            of KuiperLaw.place, measured from the canvas pixels), #key=<SPACE> (beyond the
//                                            sky), #key=<old key of 1182>&space=59637070538 (remap to Drax), #sub=xyzzy
//                                            (refusal, no flight), #repo=nosuchrepo, #bogus=1 (field named)
//   C4 <stamp>/#repo=gridatlas               the lit repository: note "GRIDATLAS · <n> OF 12,900 STARS" with n equal to the
//                                            count recomputed here from cosmos/wafer.tsv + repos.tsv, __descent.repoLit() = n,
//                                            lit marks measured on the canvas
//   C5 <stamp>/#view=3d                      the view: no target, so the existing caption "CHOOSE A SUBSTATION FIRST", view
//                                            not 3d, T -1
//   C6 see-through/?via=pointer#sub=Drax&view=map
//                                            the pointer forwards search + hash to <stamp>/ unchanged; arrival at 1182 in the
//                                            map view; a real touch on the STAR KEY row opens ../../editions/#key=<k>
//   static the pointer's three places (meta refresh, <a href>, location.replace with search + hash) name <stamp>, and
//          <stamp>/index.html exists
//   errors zero console errors and page errors on See Through, apart from the sandbox's blocked map host
//          basemaps.cartocdn.com, which is logged separately (report.blocked); failed requests are logged (report.requests)
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http');

const argv = process.argv.slice(2);
const positional = []; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) i++; else positional.push(argv[i]); }
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const BASE = (positional[0] || 'http://127.0.0.1:8611/').replace(/\/?$/, '/');
const OUT = path.resolve(positional[1] || '/tmp/nl010-opus/team-12/tester/run');
const IMG = flag('--img') ? path.resolve(flag('--img')) : null;
const DEVICES = String(flag('--devices') || 'Pixel 7').split(',').map(s => s.trim()).filter(Boolean);
const ROOT = process.env.KB_ROOT || path.resolve(__dirname, '../../../..');
const BLOCKED = /basemaps\.cartocdn\.com/;
const NRULE = 20000, NSUB = 5800, OLD_SPACE = 59637070538;
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => Number(n).toLocaleString('en-GB');
const keyOf = (j, sp) => Number(((2n * BigInt(j) + 1n) * BigInt(sp)) / (2n * BigInt(NRULE)));   // floor((j + 0.5) * sp / 20000), exact
fs.mkdirSync(OUT, { recursive: true }); if (IMG) fs.mkdirSync(IMG, { recursive: true });

// ---------------------------------------------------------------- static facts from the repository (measured here)
const pointer = fs.readFileSync(path.join(ROOT, 'see-through/index.html'), 'utf8');
const stamps = [(pointer.match(/url=(\d{12})\//) || [])[1], (pointer.match(/href="(\d{12})\/"/) || [])[1], (pointer.match(/location\.replace\('(\d{12})\/' \+ location\.search \+ location\.hash\)/) || [])[1]];
const STAMP = stamps[0];
const SPACE = JSON.parse(fs.readFileSync(path.join(ROOT, 'cosmos/wafer-meta.json'), 'utf8')).address_space;
const FROZEN = +((fs.readFileSync(path.join(ROOT, 'see-through', String(STAMP), 'kuiper-law.js'), 'utf8').match(/const SPACE = (\d+);/) || [])[1]);
function repoCount(name, np, sp) {   // the engine's walk (kuiper-belt editions/202611012027/index.html:203-208), independently
  const rows = f => fs.readFileSync(path.join(ROOT, 'cosmos', f), 'utf8').split('\n').filter(l => l && l[0] !== '#').map(l => l.split('\t'));
  const ri = +rows('repos.tsv').find(r => r[1].toLowerCase() === name)[0];
  const ranges = []; let k = 0;
  for (const p of rows('wafer.tsv')) { k += +p[4]; const k0 = k; k += +p[1]; if (+p[2] === ri && k > k0) ranges.push([k0, k]); }
  let n = 0;
  for (let q = 0; q < np; q++) { const ki = (np < NRULE && q >= NSUB) ? NSUB + 2 * (q - NSUB) : q, kk = keyOf(ki, sp); if (ranges.some(r => kk >= r[0] && kk < r[1])) n++; }
  return { n, ranges: ranges.length };
}
const head = u => new Promise(res => { const r = http.request(u, { method: 'HEAD' }, x => { res(x.statusCode); x.resume(); }); r.on('error', () => res(0)); r.end(); });

// ---------------------------------------------------------------- in-page probes
function probe() {
  const d = window.__descent, s = d.state(), inp = document.querySelector('input');
  const a = document.querySelector('a[data-st="kuiper-key"]');
  let row = null;
  if (a) { const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
    row = { text: a.textContent, href: a.getAttribute('href'), abs: a.href, h: +r.height.toFixed(1), w: +r.width.toFixed(1), x: r.left + r.width / 2, y: r.top + r.height / 2,
      vis: cs.display !== 'none' && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight, hit: (() => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e === a || a.contains(e); })() }; }
  return { T: s.T, D: s.D, name: s.name, view: s.view, in3d: s.in3d, NP: s.NP, note: s.note, cap: s.cap, space: s.space, spaceSource: s.spaceSource,
    noteFit: (() => { if (!s.note) return null; const e = [...document.querySelectorAll('div,span')].find(x => x.children.length === 0 && x.textContent === s.note); if (!e) return null;
      const r = e.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect();
      return { textRight: +t.right.toFixed(1), boxRight: +r.right.toFixed(1), innerWidth, fits: t.right <= innerWidth && t.left >= 0 }; })(),
    box: inp ? inp.value : null, hash: location.hash, href: location.href, link: d.link(), ring: d.ring(), lit: d.repoLit(), row, mapState: s.mapState };
}
// amber (#ffb000) pixels on the See Through canvas inside a box around (x, y) CSS px; centroid in CSS px
function amberAt(arg) {
  const cv = document.querySelector('canvas[aria-label="See through the universe to one substation"]'); const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
  const g = cv.getContext('2d'), half = arg.half;
  const x0 = Math.max(0, Math.round((arg.x - half - r.left) * sc)), y0 = Math.max(0, Math.round((arg.y - half - r.top) * sc));
  const w = Math.min(cv.width - x0, Math.round(2 * half * sc)), h = Math.min(cv.height - y0, Math.round(2 * half * sc));
  const px = g.getImageData(x0, y0, w, h).data; let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (px[i] > 200 && px[i + 1] > 120 && px[i + 1] < 210 && px[i + 2] < 90) { n++; sx += x; sy += y; } }
  const cx = n ? x0 + sx / n : 0, cy = n ? y0 + sy / n : 0; let rs = 0;   // mean distance of the amber pixels from their centroid
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (px[i] > 200 && px[i + 1] > 120 && px[i + 1] < 210 && px[i + 2] < 90) rs += Math.hypot(x - (cx - x0), y - (cy - y0)); }
  return { n, x: n ? r.left + cx / sc : null, y: n ? r.top + cy / sc : null, radius: n ? +(rs / n / sc).toFixed(2) : null, scale: sc };
}
// the expected screen position of KuiperLaw.place(k) at the stars stage, from two substations' own screen positions
function lawAt(k) {
  const d = window.__descent, s = d.state(), ks = s.Rpx / Math.sqrt(s.space + 0.5);
  const a = window.KuiperLaw.place(d.subKey(0)), sa = d.screenOf(0), cx = sa[0] - a.x * ks, cy = sa[1] + a.y * ks;
  const b = window.KuiperLaw.place(d.subKey(1)), sb = d.screenOf(1), p = window.KuiperLaw.place(k);
  return { x: cx + p.x * ks, y: cy - p.y * ks, star1: Math.hypot(sb[0] - (cx + b.x * ks), sb[1] - (cy - b.y * ks)) };
}

// ---------------------------------------------------------------- run
(async () => {
  const report = { base: BASE, stamp: STAMP, space: SPACE, frozen: FROZEN, when: new Date().toISOString(), devices: {} };
  for (const DEV of DEVICES) {
    const results = [], errors = [], blocked = [], requests = [], timings = {};
    const check = (name, ok, got) => { results.push({ name, ok: !!ok, got }); console.log('[' + DEV + '] ' + (ok ? 'PASS ' : 'FAIL ') + name + '  ' + JSON.stringify(got)); };
    let live = true;   // false once a page has left See Through on purpose (the row's tap): the edition's console is not this team's
    async function open(urlPath, ready, tag) {
      const browser = await chromium.launch({ args: ARGS });
      const ctx = await browser.newContext({ ...devices[DEV] });
      const page = await ctx.newPage(); page.__b = browser; live = true; page.__navs = [];
      page.on('framenavigated', f => { if (f === page.mainFrame()) page.__navs.push(f.url()); });
      page.on('console', m => { if (m.type() !== 'error') return; const e = { tag, text: m.text().slice(0, 300), url: m.location().url };
        if (BLOCKED.test(e.text + ' ' + e.url)) blocked.push(e); else if (live) errors.push(e); else requests.push({ ...e, afterLeaving: true }); });
      page.on('pageerror', e => { if (live) errors.push({ tag, text: 'pageerror ' + e.message }); });
      page.on('requestfailed', r => { const e = { tag, url: r.url().slice(0, 200), err: (r.failure() || {}).errorText }; if (BLOCKED.test(e.url)) blocked.push(e); else requests.push(e); });
      const t0 = Date.now();
      await page.goto(BASE + urlPath, { waitUntil: 'load', timeout: 180000 });
      await page.waitForFunction(() => window.__descent && window.__descent.state(), null, { timeout: 120000 });
      await page.waitForFunction(ready, null, { timeout: 150000, polling: 500 }).catch(() => console.log('[' + DEV + '] ready condition not met: ' + tag));
      timings[tag] = Date.now() - t0;
      await sleep(7000);   // settle
      return page;
    }
    const done = async p => { await p.__b.close().catch(() => {}); };
    async function shot(page, name, toImg = true) {   // CSS-pixel PNG; CDP fallback when the WebGL renderer holds Playwright's frame wait
      const file = path.join(OUT, slug(DEV) + '-' + name + '.png');
      try { await page.screenshot({ path: file, scale: 'css', timeout: 180000 }); }
      catch (e) { try { const c = await page.context().newCDPSession(page); const r = await Promise.race([c.send('Page.captureScreenshot', { format: 'png' }), sleep(180000).then(() => null)]); if (r) fs.writeFileSync(file, Buffer.from(r.data, 'base64')); else console.log('screenshot timed out ' + name); await c.detach().catch(() => {}); } catch (e2) { console.log('screenshot failed ' + name); return; } }
      if (toImg && IMG && DEV === DEVICES[0] && fs.existsSync(file)) fs.copyFileSync(file, path.join(IMG, name + '.png'));
    }
    const P = p => p.evaluate(probe);
    const setHash = async (p, h, ready) => { await p.evaluate(x => { location.hash = x; }, h); await p.waitForFunction(ready, null, { timeout: 60000, polling: 300 }).catch(() => {}); await sleep(2500); return P(p); };
    const k1182 = keyOf(1182, SPACE), k201 = keyOf(201, SPACE), old1182 = keyOf(1182, OLD_SPACE);
    const arrived = () => { const s = window.__descent.state(); return s.T >= 0 && s.D > 7.99 && !s.flight; };

    // static: the pointer
    check('pointer see-through/index.html names one stamp in its three places, forwarding search + hash; ' + STAMP + '/index.html exists',
      stamps.every(x => x && x === STAMP) && fs.existsSync(path.join(ROOT, 'see-through', STAMP, 'index.html')), { stamps });
    check('the sky: frozen SPACE of ' + STAMP + '/kuiper-law.js equals cosmos/wafer-meta.json address_space', FROZEN === SPACE, { frozen: FROZEN, wafer: SPACE });

    // C1 #sub=Drax: the typed name
    let p = await open('see-through/' + STAMP + '/#sub=Drax', arrived, 'C1 #sub=Drax');
    let s = await P(p);
    const want1 = '#key=' + k1182 + '&space=' + SPACE + '&sub=Drax';
    check('C1 #sub=Drax: box "Drax", flight to 1182 Drax, D 8 (' + timings['C1 #sub=Drax'] + ' ms from goto)', s.box === 'Drax' && s.T === 1182 && s.name === 'Drax' && s.D > 7.99, { box: s.box, T: s.T, name: s.name, D: s.D, view: s.view });
    check('C1 arrival writes ' + want1 + ' (= __descent.link())', s.hash === want1 && s.link === want1, { hash: s.hash, link: s.link });
    check('C1 sky: space = address_space, spaceSource wafer-meta', s.space === SPACE && s.spaceSource === 'wafer-meta', { space: s.space, src: s.spaceSource });
    const rowText = 'STAR KEY ' + fmt(k1182) + ' · OPEN IT ON THE KUIPER', rowAbs = BASE + 'editions/#key=' + k1182;
    check('C1 row "' + rowText + '": <a href="../../editions/#key=' + k1182 + '">, visible, >= 44 px, not covered', s.row && s.row.text === rowText && s.row.href === '../../editions/#key=' + k1182 && s.row.abs === rowAbs && s.row.vis && s.row.hit && s.row.h >= 44, s.row);
    check('C1 the row resolves to ' + rowAbs + ', HEAD 200', (await head(BASE + 'editions/')) === 200, { abs: s.row && s.row.abs });
    await shot(p, 'c1-sub-drax-landing', false);   // after the auto 3D rise SwiftShader may hold the frame; the hand-off image is C6's
    await done(p);

    // C2 #key=<subKey 1182>&space=<SPACE>: the selected star
    p = await open('see-through/' + STAMP + '/#key=' + k1182 + '&space=' + SPACE, () => !!window.__descent.state().note, 'C2 #key&space');
    s = await P(p);
    check('C2 #key=' + k1182 + '&space=' + SPACE + ': nothing moves (T -1, D 0), box "Drax", note "THE STAR THAT LANDS ON DRAX. PRESS GO"',
      s.T === -1 && s.D < 0.01 && s.box === 'Drax' && s.note === 'THE STAR THAT LANDS ON DRAX. PRESS GO' && s.space === SPACE && s.spaceSource === 'wafer-meta', { T: s.T, D: s.D, box: s.box, note: s.note, space: s.space, src: s.spaceSource, ring: s.ring });
    const law2 = await p.evaluate(lawAt, k1182), amb2 = await p.evaluate(amberAt, { x: law2.x, y: law2.y, half: 16 });
    report.findingRingOnStarKey = report.findingRingOnStarKey || { device: DEV, ring: s.ring, amberPx: amb2.n, note: 'STEPS 5.5 table: "one amber ring is drawn at KuiperLaw.place(key)" for any key at D 0; A3 asserts box and note only' };
    await shot(p, '02-key-space-selected-star');
    await done(p);

    // C3 #key=<subKey 201> without &space, then the refusals by hashchange on the same page
    p = await open('see-through/' + STAMP + '/#key=' + k201, () => !!window.__descent.state().note, 'C3 #key own sky');
    s = await P(p);
    const n201 = await p.evaluate(() => window.__descent.sub(201).name);
    check('C3 #key=' + k201 + ' (no &space): T -1, D 0, box "Cowley Substation", note "THE STAR THAT LANDS ON COWLEY SUBSTATION. PRESS GO"',
      n201 === 'Cowley Substation' && s.T === -1 && s.D < 0.01 && s.box === 'Cowley Substation' && s.note === 'THE STAR THAT LANDS ON COWLEY SUBSTATION. PRESS GO', { name201: n201, T: s.T, box: s.box, note: s.note });
    s = await setHash(p, '#key=36064705400', () => /LINE OF CODE/.test(window.__descent.state().note));
    const law3 = await p.evaluate(lawAt, 36064705400), amb3 = await p.evaluate(amberAt, { x: law3.x, y: law3.y, half: 16 });
    const rd = s.ring ? Math.hypot(s.ring.x - law3.x, s.ring.y - law3.y) : 99, pd = amb3.n ? Math.hypot(amb3.x - law3.x, amb3.y - law3.y) : 99;
    check('C3 hashchange #key=36064705400: note "KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION", T -1, D 0, one amber ring within 1 px of KuiperLaw.place(k) (__descent.ring()); on the canvas an amber ring of radius 10 px centred within 2 px of it (pixel centroid; anti-aliasing against the cyan stars moves a thresholded centroid by up to ~2 px)',
      s.note === 'KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION' && s.T === -1 && s.D < 0.01 && rd <= 1 && pd <= 2 && Math.abs(amb3.radius - 10) <= 1.5 && law3.star1 <= 1 && amb3.n >= 20,
      { note: s.note, noteFit: s.noteFit, ringStatePx: +rd.toFixed(3), ringCanvasPx: +pd.toFixed(3), ringRadiusPx: amb3.radius, amberPx: amb3.n, starCheckPx: +law3.star1.toFixed(3) });
    await shot(p, '03-key-own-sky-amber-ring');
    s = await setHash(p, '#key=' + SPACE, () => /BEYOND/.test(window.__descent.state().note));
    check('C3 hashchange #key=<SPACE>: "KEY ' + fmt(SPACE) + ' IS BEYOND THIS SKY"', s.note === 'KEY ' + fmt(SPACE) + ' IS BEYOND THIS SKY', { note: s.note });
    s = await setHash(p, '#key=' + old1182 + '&space=' + OLD_SPACE, () => /REMAPPED/.test(window.__descent.state().note));
    check('C3 hashchange #key=' + old1182 + '&space=' + OLD_SPACE + ': remapped to the star of Drax', s.box === 'Drax' && s.note === 'STAR KEY REMAPPED · SKY ' + fmt(OLD_SPACE) + ' → ' + fmt(SPACE) + ' · THE STAR THAT LANDS ON DRAX. PRESS GO', { box: s.box, note: s.note });
    s = await setHash(p, '#sub=xyzzy', () => /NO SUBSTATION/.test(window.__descent.state().note));
    check('C3 hashchange #sub=xyzzy: refusal words, no flight', s.T === -1 && s.D < 0.01 && s.note === 'NO SUBSTATION NAME HERE CONTAINS THAT. TRY ANOTHER NAME', { T: s.T, note: s.note });
    s = await setHash(p, '#repo=nosuchrepo', () => /NO REPOSITORY/.test(window.__descent.state().note));
    check('C3 hashchange #repo=nosuchrepo: "NO REPOSITORY CALLED NOSUCHREPO"', s.note === 'NO REPOSITORY CALLED NOSUCHREPO', { note: s.note });
    s = await setHash(p, '#bogus=1', () => /LINK FIELD/.test(window.__descent.state().note));
    check('C3 hashchange #bogus=1 (after #repo=nosuchrepo on the same page): "LINK FIELD BOGUS NOT UNDERSTOOD" (a re-read link replaces the earlier note)', s.note === 'LINK FIELD BOGUS NOT UNDERSTOOD', { note: s.note });
    await done(p);

    // C4 #repo=gridatlas: the lit repository
    p = await open('see-through/' + STAMP + '/#repo=gridatlas', () => !!window.__descent.state().note, 'C4 #repo=gridatlas');
    s = await P(p);
    const rc = repoCount('gridatlas', s.NP, SPACE);
    const marks = await p.evaluate(() => { const d = window.__descent, s = d.state(); let lit = 0, tot = 0;   // amber 3 px marks at lit stars
      const cv = document.querySelector('canvas[aria-label="See through the universe to one substation"]'), r = cv.getBoundingClientRect(), sc = cv.width / r.width, g = cv.getContext('2d'), px = g.getImageData(0, 0, cv.width, cv.height).data;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) { const i = (y * cv.width + x) * 4; if (px[i] > 200 && px[i + 1] > 120 && px[i + 1] < 210 && px[i + 2] < 90) lit++; }
      return { amberPx: lit, NP: s.NP }; });
    check('C4 #repo=gridatlas: note "GRIDATLAS · ' + fmt(rc.n) + ' OF ' + fmt(s.NP) + ' STARS", n = the count from cosmos/wafer.tsv (' + rc.ranges + ' ranges), repoLit() = n, marks drawn',
      s.NP === 12900 && s.note === 'GRIDATLAS · ' + fmt(rc.n) + ' OF 12,900 STARS' && s.lit === rc.n && rc.n > 0 && marks.amberPx > rc.n && s.T === -1, { note: s.note, lit: s.lit, want: rc.n, amberPx: marks.amberPx });
    await shot(p, '04-repo-gridatlas-lit');
    await done(p);

    // C5 #view=3d: the view, before a target
    p = await open('see-through/' + STAMP + '/#view=3d', () => window.__descent.state().cap === 'CHOOSE A SUBSTATION FIRST', 'C5 #view=3d');
    s = await P(p);
    check('C5 #view=3d without a target: caption "CHOOSE A SUBSTATION FIRST", view not 3d, T -1, D 0, no "LINK FIELD" note',
      s.cap === 'CHOOSE A SUBSTATION FIRST' && s.view !== '3d' && !s.in3d && s.T === -1 && s.D < 0.01 && !/LINK FIELD/.test(s.note), { cap: s.cap, view: s.view, in3d: s.in3d, T: s.T, note: s.note });
    await done(p);

    // C6 the pointer forwards search + hash; the row's real touch leads home by key
    const fwd = 'see-through/' + STAMP + '/?via=pointer#sub=Drax&view=map';
    p = await open('see-through/?via=pointer#sub=Drax&view=map', arrived, 'C6 pointer');
    s = await P(p);
    const pnavs = p.__navs.slice();
    check('C6 pointer see-through/?via=pointer#sub=Drax&view=map forwards to ' + fwd + ' (search and hash kept; the hash then rewritten on arrival)',
      pnavs.includes(BASE + fwd) && s.href === BASE + 'see-through/' + STAMP + '/?via=pointer' + want1, { navs: pnavs, now: s.href });
    check('C6 arrival at 1182 in the map view (view field after the flight)', s.T === 1182 && s.view === 'map' && !s.in3d, { T: s.T, view: s.view, in3d: s.in3d });
    await shot(p, '01-sub-drax-landing-star-key-row');
    if (s.row && s.row.vis) {
      const n0 = p.__navs.length; live = false;
      await p.touchscreen.tap(s.row.x, s.row.y);
      await p.waitForURL(/\/editions\/\d{12}\/#key=\d+$/, { timeout: 60000, waitUntil: 'commit' }).catch(() => {});
      const navs = p.__navs.slice(n0);
      check('C6 a real touch on the STAR KEY row opens ' + rowAbs + ' (then the editions pointer forwards the hash)', navs[0] === rowAbs && p.url().endsWith('#key=' + k1182), { navs, url: p.url() });
    } else check('C6 a real touch on the STAR KEY row', false, { row: s.row });
    await done(p);

    check('zero console errors and page errors on See Through apart from ' + BLOCKED.source + ' (' + blocked.length + ' blocked, logged)', errors.length === 0, errors.slice(0, 8));
    report.devices[DEV] = { pass: results.every(r => r.ok), n: results.length, failed: results.filter(r => !r.ok).length, timings, results, errors, blocked, requests };
  }
  report.pass = Object.values(report.devices).every(d => d.pass);
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log('RESULT ' + (report.pass ? 'PASS' : 'FAIL') + ' ' + Object.entries(report.devices).map(([d, r]) => d + ' ' + (r.n - r.failed) + '/' + r.n).join(', '));
  process.exit(report.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
