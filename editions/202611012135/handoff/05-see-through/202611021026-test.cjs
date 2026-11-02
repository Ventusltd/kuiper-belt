#!/usr/bin/env node
// 202611021026-test.cjs: OPUS-5 lead's test of modules/202611021026-see-through.js on a Kuiper Edition 11 snapshot.
//   node 202611021026-test.cjs <edition url> <outdir> [--device "Pixel 7"]
// Real touch (page.touchscreen.tap). Chromium flags as journey-6.cjs. Steps, in this order, each measured:
//   load     the loader is done: every order entry admitted (8), none refused; 0 page errors
//   row      the registry's row "See Through stars" reads "OK · 5,800 of 5,800" (DOM text, and layers.api.get)
//   data     the module's inspect(): sha256 = the manifest record's data sha256, space = KY.hooks.SPACE = the file's
//            space, edition = KY.edition, 5,800 stars placed, every key of the file placed finite by KY.hooks.keyPlace
//   entry    the shell's See Through entry exists once, a[data-star=see-through] -> ../../see-through/, same tab,
//            a title from 434 px, the strip narrower
//   draw     Backspace (whole wafer), then the layer switched on through its one original (layers.api.set):
//            cyan #2ee6e6 pixels on #o grow by more than 200
//   tap      flyTo 12x on a named star, then a real tap on a named star alone within 12 px, clear of the chrome: a#ky-st-chip
//            is >= 44 px, hit-testable, and its href is ../../see-through/#key=<k>&space=<SPACE>&sub=<name>, from the file
//   open     a real tap on the chip lands, same tab, on See Through 202611020012 (title "See Through") with that hash,
//            and See Through's box holds the substation's name (its readLink read the key)
//   back     goBack returns to Edition 11 with the module admitted
//   card     `e` opens a line card; nothing in it is the module's (no [data-owner=see-through], no .ky-st, no See Through link)
//   errors   0 page errors, 0 console errors, 0 same-origin failed requests; another host the sandbox proxy refuses
//            (See Through's CARTO style) is listed in externalUnreachable, not failed
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const argv = process.argv.slice(2), pos = argv.filter(a => !a.startsWith('--'));
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const URL0 = pos[0], OUT = path.resolve(pos[1] || 'out'), DEV = flag('--device') || 'Pixel 7';
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ ...devices[DEV], locale: 'en-GB' });
  const page = await ctx.newPage();
  const errs = [], ext = [], steps = [];
  page.on('pageerror', e => errs.push('pageerror ' + e.message));
  page.on('console', m => { if (m.type() === 'error') { const t = m.text(); if (/Failed to load resource: net::ERR_TUNNEL_CONNECTION_FAILED/.test(t)) ext.push(t); /* the proxy's refusal of another host; a same-origin failure is caught by requestfailed */ else errs.push('console ' + t); } });
  page.on('requestfailed', r => { const u = new URL(r.url()); if (u.host !== new URL(URL0).host) ext.push(u.host + ' ' + (r.failure() || {}).errorText); else errs.push('requestfailed ' + r.url()); });
  const rec = (id, pass, measured) => { steps.push({ id, pass: !!pass, measured }); process.stderr.write(`[${DEV}] ${pass ? 'PASS' : 'FAIL'} ${id} ${JSON.stringify(measured).slice(0, 300)}\n`); };
  const shot = n => page.screenshot({ path: path.join(OUT, slug(DEV) + '-' + n + '.png'), timeout: 60000 }).catch(e => 'screenshot: ' + e.message);
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const data = JSON.parse(Buffer.from(await (await fetch(new URL('data/see-through.json', URL0))).arrayBuffer()).toString('utf8'));
  const manifest = await (await fetch(new URL('modules.json', URL0))).json();
  const record = manifest.modules.find(m => m.id === 'see-through');
  try {
    await page.goto(URL0, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => window.KY && KY.inspect().done, null, { timeout: 120000 });
    await page.waitForFunction(() => { const L = KY.modules.layers && KY.modules.layers.api, r = L && L.get('see-through'); return r && /^(OK|FAIL|EMPTY)$/.test(r.status); }, null, { timeout: 120000 }).catch(() => {});
    await sleep(2000);
    const ld = await page.evaluate(() => { const s = KY.inspect(); return { order: s.order, admitted: s.admitted.map(x => x.id), refused: s.refused }; });
    rec('load', ld.admitted.length === 8 && ld.order.length === 8 && !ld.refused.length && ld.admitted.includes('see-through') && !errs.some(e => /^pageerror/.test(e)), ld);

    const row = await page.evaluate(() => { const L = KY.modules.layers.api, r = L.get('see-through'), el = document.querySelector('label.ky-ly[data-id="see-through"] .st');
      return { dom: el ? el.textContent : null, status: r.status, why: r.why, placed: r.placed, total: r.total, label: r.label }; });
    rec('row', row.dom === 'OK · 5,800 of 5,800' && row.status === 'OK' && row.placed === 5800 && row.total === 5800, row);

    const dt = await page.evaluate(() => { const S = KY.modules['see-through'].api, i = S.inspect(), H = KY.hooks; let bad = 0, n = 0;
      for (let j = 0; j < 5800; j++) { const s = S.star(j); if (!s) continue; n++; }
      return { i, SPACE: H.SPACE, edition: KY.edition, n, stars: S.stars() }; });
    // every placed star at keyPlace(key): recompute in the page from the data file's own keys
    const placedOk = await page.evaluate(keys => { const H = KY.hooks; let bad = 0; for (const k of keys) { const p = H.keyPlace(k); if (!(isFinite(p[0]) && isFinite(p[1]))) bad++; } return bad; }, data.features.map(f => f.geometry.key));
    const dataSha = record.data.files[0].sha256;
    rec('data', dt.i.sha256 === dataSha && dt.i.space === dt.SPACE && dt.i.edition === dt.edition && dt.stars === 5800 && dt.n === 5800 && placedOk === 0 && data.space === dt.SPACE,
      { sha256: dt.i.sha256, record: dataSha, space: dt.i.space, SPACE: dt.SPACE, edition: dt.i.edition, stars: dt.stars, unplaced: placedOk, registered: dt.i.registered });

    const en = await page.evaluate(() => { const a = [...document.querySelectorAll('a[data-star="see-through"]')]; const e = a[0];
      return { n: a.length, href: e && e.getAttribute('href'), target: e && e.getAttribute('target'), form: e && (e.closest('#kuiper-star-strip') ? 'strip' : 'title'), w: innerWidth }; });
    rec('entry', en.n === 1 && en.href === '../../see-through/' && !en.target && en.form === (en.w >= 434 ? 'title' : 'strip'), en);

    await page.keyboard.press('Backspace'); await sleep(2500);   // the whole wafer, as WHOLE WAFER does
    const cyanBefore = await cyan(page);
    await page.evaluate(() => KY.modules.layers.api.set('see-through', true)); await sleep(1500);
    const cyanAfter = await cyan(page);
    const on = await page.evaluate(() => KY.modules['see-through'].api.inspect().on);
    rec('draw', on && cyanAfter > cyanBefore + 200, { on, cyanBefore, cyanAfter });
    await shot('draw');

    // zoom in 12x on a named star of the middle ring (the whole wafer packs 5,800 stars a few px apart), with the engine's flyTo
    await page.evaluate(names => { const H = KY.hooks, j = names[0], k = KY.modules['see-through'].api.star(j).key, p = H.keyPlace(k); H.flyTo(p[0], p[1], KY.cam.zoom * 12); KY.redraw(); },
      data.features.filter(f => f.properties.name && f.properties.sub >= 2000).map(f => f.properties.sub).slice(0, 1));
    await sleep(2500);
    // a named star whose place is on screen, clear of the chrome (hit test lands on a canvas) and alone within 9 px
    const pick = await page.evaluate(() => { const S = KY.modules['see-through'].api, W = innerWidth, Hh = innerHeight; const all = [];
      for (let j = 0; j < 5800; j++) { const s = S.star(j); if (s) all.push(s); }
      for (const s of all) { const [x, y] = s.client; if (!s.name || x < 30 || y < 120 || x > W - 30 || y > Hh - 160) continue;
        const el = document.elementFromPoint(x, y); if (!el || el.tagName !== 'CANVAS') continue;
        if (all.some(o => o !== s && Math.hypot(o.client[0] - x, o.client[1] - y) < 12)) continue;
        return s; } return null; });
    if (!pick) rec('tap', false, 'no clear named star on screen');
    else {
      await page.touchscreen.tap(pick.client[0], pick.client[1]); await sleep(1200);
      const f = data.features.find(x => x.properties.sub === pick.j);
      const want = '../../see-through/#key=' + f.geometry.key + '&space=' + data.space + '&sub=' + encodeURIComponent(f.properties.name);
      const ch = await page.evaluate(() => { const a = document.getElementById('ky-st-chip'); if (!a) return null; const r = a.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { href: a.getAttribute('href'), text: a.textContent, h: r.height, top: r.top, left: r.left, right: r.right, hit: !!hit && a.contains(hit), x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      rec('tap', ch && ch.href === want && ch.h >= 44 && ch.hit && ch.right <= innerWidthOf(DEV) + 0.5, { star: pick.j, name: pick.name, want, chip: ch });
      await shot('chip');
      if (ch) {
        await page.touchscreen.tap(ch.x, ch.y);
        await page.waitForURL(/\/see-through\//, { timeout: 60000 }).catch(() => {});
        await page.waitForFunction(() => document.title === 'See Through', null, { timeout: 60000 }).catch(() => {});
        await sleep(6500);
        const st = await page.evaluate(() => ({ url: location.href, title: document.title, box: (document.querySelector('input[type=search], input[type=text], input') || {}).value || '' }));
        const okUrl = st.url.includes('/see-through/202611020012/') && st.url.includes('#key=' + f.geometry.key);
        rec('open', okUrl && st.title === 'See Through' && st.box === f.properties.name, st);
        await shot('see-through');
        await page.goBack({ timeout: 60000 }).catch(() => {}); await sleep(1000);
        if (/\/see-through\//.test(page.url())) { await page.goBack({ timeout: 60000 }).catch(() => {}); }
        await page.waitForFunction(() => window.KY && KY.inspect().done, null, { timeout: 120000 }).catch(() => {});
        const back = await page.evaluate(() => ({ url: location.href, admitted: window.KY ? KY.inspect().admitted.map(x => x.id) : [] }));
        rec('back', /\/editions\/202611021017\//.test(back.url) && back.admitted.includes('see-through'), back);
      }
    }
    await sleep(3000); await page.keyboard.press('e'); await sleep(1500);
    const cd = await page.evaluate(() => { const c = document.getElementById('card'); return { shown: !!c && getComputedStyle(c).display !== 'none', owned: c ? c.querySelectorAll('[data-owner="see-through"], .ky-st').length : -1, seeLinks: c ? [...c.querySelectorAll('a')].filter(a => /see-through/.test(a.getAttribute('href') || '')).length : -1 }; });
    rec('card', cd.shown && cd.owned === 0 && cd.seeLinks === 0, cd);
    await page.keyboard.press('Escape'); await page.evaluate(() => { const x = document.querySelector('#card .lc-x, #card .cx'); if (x) x.click(); }); await sleep(800);

  } catch (e) { rec('harness', false, String(e && e.stack || e)); }
  rec('errors', errs.length === 0, { errors: errs, externalUnreachable: ext });
  const pass = steps.every(s => s.pass);
  fs.writeFileSync(path.join(OUT, slug(DEV) + '-report.json'), JSON.stringify({ device: DEV, url: URL0, pass, steps }, null, 1));
  console.log(JSON.stringify({ device: DEV, pass, steps: steps.map(s => s.id + ':' + (s.pass ? 'PASS' : 'FAIL')) }));
  await browser.close(); process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });

function innerWidthOf(d) { return devices[d].viewport.width; }
async function cyan(page) {
  return page.evaluate(() => { const o = document.getElementById('o'); if (!o) return -1; const d = o.getContext('2d').getImageData(0, 0, o.width, o.height).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 100 && d[i] < 90 && d[i + 1] > 180 && d[i + 2] > 180) n++; return n; });
}
