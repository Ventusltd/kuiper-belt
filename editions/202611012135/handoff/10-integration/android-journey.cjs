#!/usr/bin/env node
// android-journey.cjs — the Android end-to-end journey of a Kuiper edition, measured, not eyeballed.
//
//   node android-journey.cjs <url> <outdir> [--device "Pixel 7"] [--all] [--devices "Pixel 7,Galaxy S24"]
//
// Runs on Pixel 7 by default; --all adds Galaxy S24 and Pixel 7 landscape. Real touch only
// (page.touchscreen.tap for taps, CDP Input.dispatchTouchEvent for pinch, drag and in-panel scroll;
// the keyboard is used only for the three presses of "e" and for typing the filter). Every step
// takes a screenshot into <outdir>/<device>/NN-<step>.png and records a measured assertion. The JSON
// report goes to stdout and to <outdir>/report.json. Exit code 0 when every step of every device
// passed, 1 otherwise, 2 on a harness error.
//
// Element ids and texts the script relies on (keep them in later editions or update this list):
//   #bar with .gm-title buttons carrying data-panel="top" (text EDITION), "hud" (READOUT), "lines" (LINES),
//     "foot" (COMMANDS); a SEE THROUGH control is any <button> or <a> in #bar whose text matches /see ?through/i
//     or whose href contains "see-through"; the open title carries class gm-on
//   panels: #top (EDITION, with #big and #sub inside), #hud, #lines, #foot; an open panel carries class gm-open
//   #lines: #lyFind (filter input), #lineslist with rows .ln[data-i]
//   #foot: #keys button[data-k="Backspace"] (text WHOLE WAFER)
//   #card: shown with style display:block; title line "<b>title</b> <span>n of N</span>"; .ct toggles details
//     (class open on #card, .cd becomes visible); .cx closes
//   canvases: #c (WebGL wafer), #o (2d overlay where the sparks are drawn: green rgba(34,238,119), the selected
//     spark magenta rgba(255,43,214) with a 14 px ring); #o.width === innerWidth (1 canvas px = 1 CSS px)
//   keys.json next to the page: bodies[] with key, on_wafer, verified, in the order the page uses (edPlaced)
//   #big text contains "verified lines lit" once keys.json has loaded
//
// NL-010 (Opus team 10 tester, 2026-11-01): the same journey on Edition 5's assembled page. When the Opus 1 shell is
// installed (nav#kuiper-menu-bar; Edition 4's #bar stays in the DOM with class kmb-superseded, hidden) the script
// reads the new bar and maps Edition 4's four titles onto the shell's six:
//   EDITION  data-panel="top"   -> ABOUT  #kmb-title-about / #kmb-panel-about (holds #top, #big, #sub)
//   LINES    data-panel="lines" -> WAFER  #kmb-title-wafer / #kmb-panel-wafer (holds #lines, #lyFind, #lineslist)
//   COMMANDS data-panel="foot"  -> VIEW   #kmb-title-view  / #kmb-panel-view  (holds [data-k="Backspace"] WHOLE WAFER)
//   READOUT  data-panel="hud"   -> VIEW   (holds #hud)
//   an open shell panel is .gm-menu.gm-open with its .gm-panel not [hidden]; the bar's lockup is .ventus-brand
//   SEE THROUGH: a[data-star] / any see-through link in #kuiper-menu-bar or in the bottom-left #kuiper-star-strip
// The Opus 2 card (#card.lc): details .lc-t, body .lc-d, open class lc-open, close .lc-x, header .lc-h code (the line
// of code, compared with keys.json line_text), "n of N" read from .lc-d. Edition 4's ids are still used when absent.
// Added steps: panel-dismiss (a wafer tap and the back gesture close an open panel; ROADMAP 9.4 (c)) and modules
// (every modules.json order entry admitted by the loader, refused empty, zero page errors; ROADMAP 9.4 (o)).
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');

const argv = process.argv.slice(2);
const positional = argv.filter(a => !a.startsWith('--'));
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] || true) : null; };
if (positional.length < 2) { console.error('usage: node android-journey.cjs <url> <outdir> [--device NAME] [--all] [--devices A,B]'); process.exit(2); }
const URL0 = positional[0], OUT = path.resolve(positional[1]);
let DEVICES = ['Pixel 7'];
if (flag('--all')) DEVICES = ['Pixel 7', 'Galaxy S24', 'Pixel 7 landscape'];
if (flag('--device')) DEVICES = [String(flag('--device'))];
if (flag('--devices')) DEVICES = String(flag('--devices')).split(',').map(s => s.trim()).filter(Boolean);
const SETTLE_MAX = 90000, APPEAR_MAX = 90000, FIXED_WAIT = 6500, MARGIN = 10;   // px margin for "clear space"
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ------------------------------------------------------------------ in-page probes (self-contained)
function probeFn() {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) }; };
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().height > 0;   // NL-010: a card with visibility:hidden (line-card lc-behind) is not open on screen
  const q = s => document.querySelector(s);
  const shell = q('#kuiper-menu-bar');
  const MAP = { top: 'about', hud: 'view', lines: 'wafer', foot: 'view' }, BACK = { about: 'top', wafer: 'lines', view: 'foot' };
  const bar = shell || q('#bar'), card = q('#card');
  const titles = shell
    ? [...shell.querySelectorAll('.gm-title')].filter(b => b.getBoundingClientRect().height > 0).map(b => { const m = b.parentNode && b.parentNode.getAttribute && b.parentNode.getAttribute('data-menu'); return { text: b.textContent.trim(), panel: m ? (BACK[m] || m) : null, menu: m, on: !!m && b.parentNode.classList.contains('gm-open'), rect: R(b) }; })
    : [...document.querySelectorAll('#bar .gm-title')].map(b => ({ text: b.textContent.trim(), panel: b.dataset.panel, on: b.classList.contains('gm-on'), rect: R(b) }));
  const barname = shell ? shell.querySelector('.ventus-brand') : q('#barname');
  const panelEl = id => shell ? q('#kmb-panel-' + MAP[id]) : q('#' + id);
  const panelOpen = (id, el) => shell ? !el.hidden && el.parentNode.classList.contains('gm-open') : el.classList.contains('gm-open');
  // the overlay canvas: magenta = selected spark, green = sparks
  let magenta = null, greens = [], overlayOk = false;
  const ov = q('#o');
  if (ov && ov.width > 0) {
    try {
      const ctx = ov.getContext('2d'); const W = ov.width, H = ov.height; const d = ctx.getImageData(0, 0, W, H).data;
      let sx = 0, sy = 0, n = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1; const gp = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
        if (a < 60) continue;
        if (r > 180 && g < 110 && b > 140) { sx += x; sy += y; n++; if (x < minx) minx = x; if (y < miny) miny = y; if (x > maxx) maxx = x; if (y > maxy) maxy = y; }
        else if (g > 150 && r < 120 && b < 170 && a > 120) gp.push([x, y]); }
      overlayOk = true;
      if (n > 0) magenta = { x: +(sx / n).toFixed(1), y: +(sy / n).toFixed(1), px: n, bbox: [minx, miny, maxx, maxy] };
      // greedy clustering of green pixels into sparks
      const cl = [];
      for (const [x, y] of gp) { let hit = null; for (const c of cl) { if (Math.abs(c.cx - x) <= 7 && Math.abs(c.cy - y) <= 7) { hit = c; break; } }
        if (hit) { hit.sx += x; hit.sy += y; hit.n++; hit.cx = hit.sx / hit.n; hit.cy = hit.sy / hit.n; } else cl.push({ sx: x, sy: y, n: 1, cx: x, cy: y }); }
      greens = cl.filter(c => c.n >= 6).map(c => ({ x: +c.cx.toFixed(1), y: +c.cy.toFixed(1), px: c.n }));
    } catch (e) { overlayOk = false; }
  }
  const cardOpen = vis(card);
  let cardIndex = null, cardTotal = null;
  const lc = card && card.classList.contains('lc');
  const cq = s => card && card.querySelector(s);
  if (cardOpen) { const src = (lc && cq('.lc-d')) ? cq('.lc-d').textContent : card.textContent; const m = src.match(/(\d[\d,]*)\s+of\s+(\d[\d,]*)/); if (m) { cardIndex = +m[1].replace(/,/g, ''); cardTotal = +m[2].replace(/,/g, ''); } }
  const cs = cardOpen ? getComputedStyle(card) : null;
  const hitAt = (x, y) => { const el = document.elementFromPoint(x, y); return el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '')) : null; };
  return {
    viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio, scrollX: scrollX, scrollY: scrollY, vvScale: visualViewport ? visualViewport.scale : null, vvOffset: visualViewport ? [visualViewport.offsetLeft, visualViewport.offsetTop] : null },
    bar: R(bar), barScroll: bar ? { scrollWidth: bar.scrollWidth, clientWidth: bar.clientWidth } : null, barname: barname ? { text: barname.textContent.trim(), rect: R(barname) } : null, titles,
    shell: shell ? { installed: !!(window.__KUIPER_MODULES__ && window.__KUIPER_MODULES__.menuBar && window.__KUIPER_MODULES__.menuBar.installed), open: shell.getAttribute('data-open'), oldBarSuperseded: !!(q('#bar') && q('#bar').classList.contains('kmb-superseded')) } : null,
    panels: Object.fromEntries(['top', 'hud', 'lines', 'foot'].map(id => { const el = panelEl(id); return [id, el ? { el: el.id, visible: vis(el), open: panelOpen(id, el), rect: R(el), overflowY: getComputedStyle(el).overflowY, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollTop: el.scrollTop } : null]; })),
    sub: q('#sub') ? { scrollHeight: q('#sub').scrollHeight, clientHeight: q('#sub').clientHeight, scrollTop: q('#sub').scrollTop, overflowY: getComputedStyle(q('#sub')).overflowY } : null,
    card: { open: cardOpen, lineCard: !!lc, rect: cardOpen ? R(card) : null, maxHeight: cs ? cs.maxHeight : null, height: cardOpen ? card.getBoundingClientRect().height : 0, scrollHeight: card.scrollHeight, detailsOpen: card.classList.contains('open') || card.classList.contains('lc-open'), index: cardIndex, total: cardTotal, title: cardOpen ? (cq('.lc-title') ? cq('.lc-title').textContent : (cq('b') ? cq('b').textContent : card.textContent.slice(0, 80))) : null, header: cardOpen && cq('.lc-h code') ? cq('.lc-h code').textContent : null, headerIsFirst: cardOpen && lc ? (() => { const w = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 }); const f = w.nextNode(); return !!f && !!cq('.lc-h code') && cq('.lc-h code').contains(f); })() : null, hasClose: !!cq('.cx, .lc-x'), hasDetails: !!cq('.ct, .lc-t'), detailsVisible: vis(cq('.cd, .lc-d')), closeRect: R(cq('.cx, .lc-x')), detailsRect: R(cq('.ct, .lc-t')) },
    lines: { rows: document.querySelectorAll('#lineslist .ln[data-i]').length, firstRow: R(q('#lineslist .ln[data-i]')), firstRowText: q('#lineslist .ln[data-i]') ? q('#lineslist .ln[data-i]').textContent.trim().slice(0, 120) : null, allRowsMatch: null, find: R(q('#lyFind')), findValue: q('#lyFind') ? q('#lyFind').value : null },
    big: q('#big') ? q('#big').textContent : null,
    overlayOk, magenta, greens, greensCount: greens.length,
    hitAtMagenta: magenta ? hitAt(magenta.x, magenta.y) : null,
    seeThrough: (() => { const els = [...document.querySelectorAll('#bar button, #bar a, #kuiper-menu-bar button, #kuiper-menu-bar a, #kuiper-star-strip button, #kuiper-star-strip a')].filter(e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.gm-panel')); const el = els.find(e => /see\s*-?\s*through/i.test(e.textContent) || /see-through/i.test(e.getAttribute('href') || '')); return el ? { text: el.textContent.trim(), tag: el.tagName.toLowerCase(), href: el.getAttribute('href'), target: el.getAttribute('target'), form: el.closest('#kuiper-star-strip') ? 'strip' : 'bar', rect: R(el) } : null; })(),
    activeElement: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null,
    frames: window.__fr || 0,
  };
}
// screenshot analysis: paint the PNG onto a canvas sized like the viewport and measure the lit pixels under the bar
async function waferFromPng(page, b64, yFrom) {
  return page.evaluate(async ({ b64, yFrom }) => {
    // UI that is not the wafer and sits over it at rest: the Opus 1 shell's bottom-left star strip (shell contract R7). Its box is skipped.
    const ex = [...document.querySelectorAll('#kuiper-star-strip')].map(e => e.getBoundingClientRect()).filter(r => r.height > 0 && r.width > 0);
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const W = innerWidth, H = innerHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data;
    let lit = 0, tot = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
    for (let y = Math.max(0, Math.floor(yFrom)); y < H; y++) for (let x = 0; x < W; x++) { if (ex.some(r => x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 1 && y <= r.bottom + 1)) continue; const i = (y * W + x) * 4; tot++;
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (lum > 34) { lit++; if (x < minx) minx = x; if (y < miny) miny = y; if (x > maxx) maxx = x; if (y > maxy) maxy = y; } }
    return { excluded: ex.map(r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]), litFraction: +(lit / Math.max(1, tot)).toFixed(4), litPx: lit, bbox: lit ? [minx, miny, maxx, maxy] : null, bboxW: lit ? maxx - minx + 1 : 0, bboxH: lit ? maxy - miny + 1 : 0 };
  }, { b64, yFrom });
}
// the placement law, the same arithmetic as the page: used only to predict which spark is nearest to a tap
const G32 = 2654435769;
function keyPlace(k) { const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, th = 2 * Math.PI * m / 4294967296, r = Math.sqrt(k + 0.5); return [r * Math.cos(th), r * Math.sin(th)]; }

// ------------------------------------------------------------------ one device run
async function runDevice(browser, deviceName) {
  const dev = devices[deviceName];
  if (!dev) throw new Error('unknown Playwright device: ' + deviceName);
  const dir = path.join(OUT, slug(deviceName)); fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ ...dev, locale: 'en-GB' });
  const page = await context.newPage(); page.setDefaultTimeout(180000);
  await page.addInitScript(() => { let n = 0; const f = () => { n++; window.__fr = n; requestAnimationFrame(f); }; requestAnimationFrame(f); });   // counts drawn frames, so "settled" means unchanged across frames, not across wall time
  // NL-010: errors raised after the journey has left the edition (the SEE THROUGH step navigates to ../../see-through/, another
  // app, whose basemap fetch fails in this sandbox) are kept apart in offPageErrors; consoleErrors are the edition's own.
  const errors = [], offPageErrors = []; let leftEdition = false;
  const errPush = (e) => (leftEdition ? offPageErrors : errors).push({ ...e, url: page.url().slice(0, 120) });
  page.on('console', m => { if (m.type() === 'error') errPush({ kind: 'console', text: m.text().slice(0, 300) }); });
  page.on('pageerror', e => errPush({ kind: 'pageerror', text: String(e.message || e).slice(0, 300) }));
  page.on('requestfailed', r => { const f = r.failure(); if (f && !/aborted|ERR_ABORTED/i.test(f.errorText)) errPush({ kind: 'request', text: r.url().slice(0, 200) + ' ' + f.errorText }); });
  const cdp = await context.newCDPSession(page);
  const steps = []; let n = 0, stepT0 = Date.now();
  const probe = () => page.evaluate(probeFn);
  // a screenshot waits for a frame, and a frame at zoom 14 under SwiftShader on a loaded machine can take minutes: it is
  // retried once and never aborts the journey. The steps that measure the wafer analyse this same file, so the evidence
  // image and the measurement are one capture.
  const shotTo = async (f) => { for (let attempt = 0; attempt < 2; attempt++) { try { await page.screenshot({ path: f, scale: 'css', timeout: 180000 }); return path.relative(OUT, f); } catch (e) { if (attempt) return 'FAILED: ' + String(e.message || e).split('\n')[0]; } } };
  const shotName = (id) => path.join(dir, String(++n).padStart(2, '0') + '-' + id + '.png');
  const shot = (id) => shotTo(shotName(id));
  const waferFromFile = async (file, yFrom) => { try { return await waferFromPng(page, fs.readFileSync(file).toString('base64'), yFrom); } catch (e) { return { error: 'screenshot failed: ' + String(e.message || e).split('\n')[0], litFraction: 0, bbox: null }; } };
  const record = (id, name, pass, measured, note) => { const s = { id, name, pass: !!pass, ms: Date.now() - stepT0, measured, note: note || '' }; stepT0 = Date.now(); steps.push(s); process.stderr.write(`[${deviceName}] ${pass ? 'PASS' : 'FAIL'} ${id}${note ? ' — ' + note : ''}\n`); return s; };
  const tapAt = (x, y) => page.touchscreen.tap(Math.round(x), Math.round(y));
  const tapRect = async (r) => { if (!r) throw new Error('no rect to tap'); await tapAt((r.left + r.right) / 2, (r.top + r.bottom) / 2); };
  const touch = async (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map((p, i) => ({ x: p[0], y: p[1], id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
  const settle = async (opts = {}) => {
    // Under SwiftShader on a loaded machine a frame can take seconds, and a position that is unchanged for a second of wall
    // time may be one stale frame from the middle of a fly. So "settled" is: the selected spark is drawn, and its position is
    // unchanged across at least two further frames (the rAF counter advanced by 2). The measurement is the final position.
    const t0 = Date.now(); let last = null, seen = 0, f0 = -1;
    while (true) { await sleep(300); const p = await probe(); const t = Date.now() - t0;
      if (!p.magenta) { if (opts.noSpark) { if (f0 < 0) f0 = p.frames; if (t >= FIXED_WAIT && p.frames - f0 >= 2) return p; if (t >= SETTLE_MAX) return p; continue; }
        if (t >= APPEAR_MAX) return p; continue; }
      if (!seen) seen = Date.now();
      if (last && Math.hypot(p.magenta.x - last.x, p.magenta.y - last.y) < 0.6) { if (p.frames - last.frames >= 2) return p; }
      else last = { x: p.magenta.x, y: p.magenta.y, frames: p.frames };
      if (Date.now() - seen >= SETTLE_MAX) return p; }
  };
  const framesPass = async (k, max = 60000) => { const f0 = await page.evaluate(() => window.__fr || 0), t0 = Date.now(); while (Date.now() - t0 < max) { await sleep(250); if ((await page.evaluate(() => window.__fr || 0)) - f0 >= k) return true; } return false; };
  const clearSpace = (p) => {                          // the spark must sit between the bar and the card, with margins, and the hit test must land on the wafer
    if (!p.magenta) return { ok: false, why: 'no selected spark drawn on #o' };
    const top = p.bar.bottom + MARGIN, bot = (p.card.open ? p.card.rect.top : p.viewport.h) - MARGIN;
    const okY = p.magenta.y >= top && p.magenta.y <= bot, okX = p.magenta.x >= MARGIN && p.magenta.x <= p.viewport.w - MARGIN;
    const okHit = p.hitAtMagenta === '#c' || p.hitAtMagenta === '#o' || p.hitAtMagenta === 'canvas';
    return { ok: okY && okX && okHit, sparkY: p.magenta.y, sparkX: p.magenta.x, barBottom: p.bar.bottom, cardTop: p.card.open ? p.card.rect.top : null, windowY: [top, bot], hitTest: p.hitAtMagenta, why: okY && okX ? (okHit ? '' : 'spark covered by ' + p.hitAtMagenta) : 'spark at y=' + p.magenta.y + ' outside [' + top + ',' + bot + ']' };
  };
  const cardCapPx = (p) => { const mh = p.card.maxHeight || ''; const m = mh.match(/([\d.]+)(vh|px)/); if (!m) return null; return m[2] === 'vh' ? +m[1] / 100 * p.viewport.h : +m[1]; };
  const cardUnderCap = (p) => { const cap = cardCapPx(p); return { cap: cap && +cap.toFixed(1), height: p.card.height, ok: !p.card.open || (cap == null ? p.card.rect.bottom <= p.viewport.h + 1 : p.card.height <= cap + 1 && p.card.rect.bottom <= p.viewport.h + 1) }; };
  let bodies = [], placed = [];  // keys.json, for the nearest-spark prediction
  const report = { device: deviceName, viewport: dev.viewport, dpr: dev.deviceScaleFactor, url: URL0, startedAt: new Date().toISOString(), steps, consoleErrors: errors, pass: false };
  try {
    // 1 load
    const t0 = Date.now();
    await page.goto(URL0, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => /verified lines lit/.test((document.getElementById('big') || {}).textContent || ''), null, { timeout: 60000 }).catch(() => {});
    await sleep(FIXED_WAIT);
    const frames = await page.evaluate(() => new Promise(res => { const t = []; let last = performance.now(); const f = () => { const now = performance.now(); t.push(now - last); last = now; if (t.length < 12) requestAnimationFrame(f); else res(t); }; requestAnimationFrame(f); setTimeout(() => res(t), 6000); }));
    let p = await probe();
    // the first frames under SwiftShader can take long: the wafer check is retried across drawn frames before it counts as absent
    let wafer = null, waferOk = false, waferTries = 0; const loadFile = shotName('load');
    for (; waferTries < 4 && !waferOk; waferTries++) {
      if (waferTries) await framesPass(2, 40000);
      p = await probe(); const got = await shotTo(loadFile);
      wafer = got.startsWith('FAILED') ? { error: got, litFraction: 0, bbox: null } : await waferFromFile(loadFile, p.bar ? p.bar.bottom : 0);
      const clearMin = Math.min(p.viewport.w, p.viewport.h - (p.bar ? p.bar.bottom : 0));
      waferOk = wafer.litFraction > 0.03 && !!wafer.bbox && wafer.bboxW > 0.4 * clearMin && Math.abs(wafer.bboxW / wafer.bboxH - 1) < 0.25;
    }
    const tops = p.titles.map(t => t.rect.top);   // the buttons' tops: one row means they all share one, the bar is under two button heights, and nothing is clipped off the right
    const nameInRow = !p.barname || !p.barname.rect || (p.barname.rect.bottom <= Math.max(...p.titles.map(t => t.rect.bottom)) + 4 && p.barname.rect.top >= Math.min(...tops) - 4);
    const oneRow = p.bar && tops.length && Math.max(...tops) - Math.min(...tops) < 4 && nameInRow && p.bar.height < 2 * Math.min(...p.titles.map(t => t.rect.height)) && p.barScroll.scrollWidth <= p.barScroll.clientWidth + 1;
    const fr = frames.slice(1).sort((a, b) => a - b);
    record('load', 'load: zero console errors, wafer drawn, bar one row', errors.length === 0 && waferOk && oneRow,
      { loadMs: Date.now() - t0, consoleErrors: errors.slice(), big: p.big, wafer, waferTries, bar: p.bar, barTitles: p.titles.map(t => t.text), titleTops: tops, barScroll: p.barScroll, oneRow: !!oneRow, sparksVisible: p.greensCount, frameMs: fr.length ? { median: +fr[fr.length >> 1].toFixed(0), max: +fr[fr.length - 1].toFixed(0) } : null, screenshot: path.relative(OUT, loadFile) },
      [errors.length ? errors.length + ' console error(s)' : '', waferOk ? '' : 'wafer not detected as a disc under the bar', oneRow ? '' : 'bar is not one row (button tops ' + tops.join('/') + ', bar height ' + (p.bar && p.bar.height) + ', scrollWidth ' + p.barScroll.scrollWidth + '/' + p.barScroll.clientWidth + ')'].filter(Boolean).join('; '));
    try { const j = await page.evaluate(async () => (await (await fetch('keys.json')).json())); bodies = j.bodies || j; placed = bodies.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0).map(b => { const [x, y] = keyPlace(b.key); return { key: b.key, x, y, title: b.title, repo: b.repo, line_text: b.line_text }; }); } catch (e) { placed = []; }

    // 2 EDITION opens
    const titleRect = (panel) => { const t = p.titles.find(t => t.panel === panel); return t && t.rect; };
    await tapRect(titleRect('top')); await framesPass(1); p = await probe();
    const tp = p.panels.top; let scrolled = null;
    if (tp && tp.visible) {
      const sh = Math.max(tp.scrollHeight - tp.clientHeight, p.sub ? p.sub.scrollHeight - p.sub.clientHeight : 0);
      if (sh > 8) {   // a one-finger drag upward inside the panel must scroll the panel, not the page
        const x = (tp.rect.left + tp.rect.right) / 2, y0 = tp.rect.bottom - 30, y1 = Math.max(tp.rect.top + 20, y0 - 160);
        await touch('touchStart', [[x, y0]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[x, y0 + (y1 - y0) * i / 10]]); await sleep(25); } await touch('touchEnd', []); await framesPass(2);
        const q = await probe(); scrolled = { panelScrollTop: q.panels.top.scrollTop, subScrollTop: q.sub ? q.sub.scrollTop : null, pageScrollY: q.viewport.scrollY, scrollable: sh };
        scrolled.ok = (scrolled.panelScrollTop > 4 || (scrolled.subScrollTop || 0) > 4) && q.viewport.scrollY === 0;
      } else scrolled = { scrollable: sh, ok: true, note: 'panel content fits, nothing to scroll' };
    }
    const underBar = tp && tp.visible && tp.rect.top >= p.bar.bottom - 1 && tp.rect.bottom <= p.viewport.h + 1 && /auto|scroll/.test(tp.overflowY);
    record('edition-open', 'tap EDITION: panel opens under the bar and scrolls inside', tp && tp.visible && underBar && scrolled && scrolled.ok,
      { panel: tp, barBottom: p.bar.bottom, titleOn: (p.titles.find(t => t.panel === 'top') || {}).on, scroll: scrolled, screenshot: await shot('edition-open') },
      !tp || !tp.visible ? 'EDITION panel did not open' : (!underBar ? 'panel top ' + tp.rect.top + ' vs bar bottom ' + p.bar.bottom + ', bottom ' + tp.rect.bottom + ', overflow ' + tp.overflowY : (scrolled && !scrolled.ok ? 'drag inside the panel did not scroll it (scrollTop ' + scrolled.panelScrollTop + '/' + scrolled.subScrollTop + ')' : '')));

    // 3 EDITION closes
    await tapRect(titleRect('top')); await framesPass(1); p = await probe();
    record('edition-close', 'tap EDITION again: panel closes', !p.panels.top.visible && !(p.titles.find(t => t.panel === 'top') || {}).on, { panel: p.panels.top, screenshot: await shot('edition-close') }, p.panels.top.visible ? 'panel still visible' : '');

    // 3b a wafer tap and the back gesture close an open panel (ROADMAP 9.4 (c); shell contract C7)
    {
      const dm = { wafer: null, back: null };
      const openPanel = () => page.evaluate(() => { const sh = document.getElementById('kuiper-menu-bar');
        const el = sh ? sh.querySelector('.gm-menu.gm-open > .gm-panel:not([hidden])') : ['top', 'hud', 'lines', 'foot'].map(i => document.getElementById(i)).find(e => e && e.classList.contains('gm-open'));
        if (!el) return null; const r = el.getBoundingClientRect(); return { id: el.id, top: r.top, bottom: r.bottom, left: r.left, right: r.right }; });
      const hitAt = (x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id ? '#' + e.id : e.tagName.toLowerCase()) : null; }, [x, y]);
      // the panel to test the wafer tap on: EDITION/ABOUT first, then every other title, the first that leaves wafer visible below it
      const cands = ['top', ...p.titles.filter(t => t.panel && t.panel !== 'top').map(t => t.panel)].filter((v, i, a) => a.indexOf(v) === i);
      const tried = [];
      for (const c of cands) {
        const tr = titleRect(c); if (!tr) continue;
        await tapRect(tr); await framesPass(1); await sleep(300); let q = await probe(); const op = await openPanel();
        if (!op) { tried.push({ panel: c, opened: false }); continue; }
        const x = Math.round(q.viewport.w - 8), y = Math.round(Math.min(q.viewport.h - 8, op.bottom + (q.viewport.h - op.bottom) / 2));
        const hit = op.bottom < q.viewport.h - 16 ? await hitAt(x, y) : null;
        tried.push({ panel: c, el: op.id, panelBottom: +op.bottom.toFixed(1), hit });
        if (hit === '#c' || hit === '#o' || hit === 'canvas') {
          await tapAt(x, y); await framesPass(1); await sleep(500); q = await probe(); const after = await openPanel();
          dm.wafer = { panel: c, el: op.id, tappedAt: [x, y], hit, closed: !after, cardOpened: q.card.open, ok: !after && !q.card.open, tried };
          if (q.card.open && q.card.closeRect) { await tapRect(q.card.closeRect); await sleep(500); }
          if (after) { await tapRect(titleRect(c)); await framesPass(1); }
          break;
        }
        await tapRect(tr); await framesPass(1); await sleep(300);   // close it by its own title and try the next
      }
      if (!dm.wafer) dm.wafer = { status: 'NOT EVALUATED', why: 'no open panel leaves wafer visible to tap (viewport ' + p.viewport.w + 'x' + p.viewport.h + ')', tried };
      let q = await probe();
      // the back gesture: opening must create a history entry (length or state changes), history.back() closes and the URL stays
      const urlBefore = page.url(), h0 = await page.evaluate(() => ({ len: history.length, state: JSON.stringify(history.state) }));
      await tapRect(titleRect('top')); await framesPass(1); await sleep(300); q = await probe();
      const h1 = await page.evaluate(() => ({ len: history.length, state: JSON.stringify(history.state) }));
      const entry = h1.len > h0.len || h1.state !== h0.state;
      if (!q.panels.top.visible) dm.back = { ok: false, why: 'EDITION/ABOUT did not open' };
      else if (!entry) dm.back = { ok: false, history: [h0, h1], why: 'opening pushed no history entry: the Android back gesture would leave the page' };
      else {
        await page.evaluate(() => history.back()); await sleep(1500); await framesPass(1); q = await probe();
        dm.back = { history: [h0, h1], closed: !q.panels.top.visible, urlBefore, urlAfter: page.url(), ok: !q.panels.top.visible && page.url() === urlBefore };
      }
      if (q.panels.top.visible) { await tapRect(titleRect('top')); await framesPass(1); q = await probe(); }
      const evald = [dm.wafer, dm.back].filter(d => d && d.status !== 'NOT EVALUATED');
      record('panel-dismiss', 'open a panel, tap the wafer: it closes; open EDITION/ABOUT, back gesture: it closes and the page stays', evald.length > 0 && evald.every(d => d.ok),
        { ...dm, panelClosedAfter: !q.panels.top.visible, screenshot: await shot('panel-dismiss') },
        [dm.wafer && dm.wafer.status ? 'wafer tap NOT EVALUATED: ' + dm.wafer.why : (dm.wafer && !dm.wafer.ok ? 'wafer tap on ' + dm.wafer.panel + ': ' + (dm.wafer.closed ? 'a card opened' : 'panel stayed open') : ''), dm.back && !dm.back.ok ? 'back: ' + (dm.back.why || (dm.back.closed ? 'url changed to ' + dm.back.urlAfter : 'panel stayed open')) : ''].filter(Boolean).join('; '));
      p = q;
    }

    // 4 LINES
    await tapRect(titleRect('lines')); await sleep(800); p = await probe();
    const lp = p.panels.lines;
    record('lines-open', 'tap LINES: panel opens under the bar with the rows', lp.visible && lp.rect.top >= p.bar.bottom - 1 && lp.rect.bottom <= p.viewport.h + 1 && p.lines.rows > 0,
      { panel: lp, rows: p.lines.rows, firstRow: p.lines.firstRow, find: p.lines.find, screenshot: await shot('lines-open') }, lp.visible ? (p.lines.rows ? '' : 'no rows') : 'LINES did not open');

    // 5 filter "acceptance"
    if (p.lines.find) { await tapRect(p.lines.find); await sleep(300); await page.keyboard.type('acceptance', { delay: 30 }); await sleep(600); }
    p = await probe();
    const rowsMatch = await page.evaluate(() => [...document.querySelectorAll('#lineslist .ln[data-i]')].every(r => /acceptance/i.test(r.textContent)));
    const findVisible = p.lines.find && p.lines.find.bottom <= p.viewport.h && p.lines.firstRow && p.lines.firstRow.bottom <= p.viewport.h;
    record('lines-filter', 'type "acceptance": the list narrows to matching rows, input and first row on screen', p.lines.rows > 0 && rowsMatch && p.lines.findValue === 'acceptance' && findVisible,
      { rows: p.lines.rows, allRowsMatch: rowsMatch, findValue: p.lines.findValue, firstRow: p.lines.firstRow, firstRowText: p.lines.firstRowText, pageScrollY: p.viewport.scrollY, activeElement: p.activeElement, screenshot: await shot('lines-filter') },
      p.lines.rows ? (rowsMatch ? (findVisible ? '' : 'filter input or first row off screen (keyboard/visual viewport)') : 'rows do not all match') : 'no rows match');

    // 6 tap the first row
    const before = p;
    if (p.lines.firstRow) await tapRect(p.lines.firstRow);
    await sleep(150); const early = await probe(); p = await settle();
    const cs6 = clearSpace(p), cap6 = cardUnderCap(p);
    const flew = early.magenta && p.magenta ? +Math.hypot(early.magenta.x - p.magenta.x, early.magenta.y - p.magenta.y).toFixed(1) : null;
    const lb6 = p.card.index != null ? placed[p.card.index - 1] : null;
    const hdr6 = !p.card.lineCard ? { checked: false, why: 'Edition 4 card (no #card.lc)' } : { checked: true, header: p.card.header == null ? null : p.card.header.slice(0, 160), headerLength: p.card.header == null ? null : p.card.header.length, lineTextLength: lb6 && lb6.line_text != null ? lb6.line_text.length : null, equalsLineText: !!lb6 && p.card.header === lb6.line_text, headerIsFirstText: p.card.headerIsFirst };
    hdr6.ok = !hdr6.checked || (hdr6.equalsLineText && hdr6.headerIsFirstText);
    record('lines-pick', 'tap the first row: LINES closes, camera flies, card opens, spark in the clear space, the header is the line of code', !p.panels.lines.visible && p.card.open && cs6.ok && cap6.ok && hdr6.ok,
      { linesVisible: p.panels.lines.visible, card: { open: p.card.open, rect: p.card.rect, index: p.card.index, total: p.card.total, title: p.card.title, ...cap6 }, cardHeader: hdr6, clear: cs6, sparkMovedAfterTapPx: flew, rowTapped: before.lines.firstRowText, screenshot: await shot('lines-pick') },
      [p.panels.lines.visible ? 'LINES still open' : '', p.card.open ? '' : 'no card', cs6.ok ? '' : cs6.why, cap6.ok ? '' : 'card over its cap', hdr6.ok ? '' : 'card header is not the line of code (equals line_text ' + hdr6.equalsLineText + ', first text ' + hdr6.headerIsFirstText + ')'].filter(Boolean).join('; '));

    // 7 details
    const h1 = p.card.height; if (p.card.detailsRect) await tapRect(p.card.detailsRect); await sleep(700); p = await probe();
    const cap7 = cardUnderCap(p), cs7 = clearSpace(p);
    record('card-details', 'tap details: the card grows, stays under its cap and on screen', p.card.open && p.card.detailsOpen && p.card.detailsVisible && p.card.height > h1 && cap7.ok,
      { heightBefore: h1, heightAfter: p.card.height, ...cap7, cardRect: p.card.rect, cardScrollHeight: p.card.scrollHeight, detailsOpen: p.card.detailsOpen, sparkStillClear: cs7.ok, clear: cs7, screenshot: await shot('card-details') },
      [p.card.detailsOpen ? '' : 'details did not open', p.card.height > h1 ? '' : 'card did not grow', cap7.ok ? '' : 'card ' + p.card.height + ' px over cap ' + cap7.cap, cs7.ok ? '' : 'spark no longer clear: ' + cs7.why].filter(Boolean).join('; '));

    // 8 ×
    const xr = p.card.closeRect; if (xr) await tapRect(xr); await sleep(600); p = await probe();
    record('card-close', 'tap ×: the card closes and the selection clears', !p.card.open && !p.magenta, { closeRect: xr, closeSize: xr ? [xr.width, xr.height] : null, cardOpen: p.card.open, magenta: p.magenta, screenshot: await shot('card-close') }, p.card.open ? 'card still open' : (p.magenta ? 'spark still selected' : (xr && (xr.width < 24 || xr.height < 24) ? 'note: × is ' + xr.width + 'x' + xr.height + ' px (under 24)' : '')));

    // 9 e × 3
    let prevIndex = null;
    for (let k = 1; k <= 3; k++) {
      await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
      await page.keyboard.press('e'); p = await settle();
      const cs = clearSpace(p), cap = cardUnderCap(p);
      const seq = prevIndex == null || p.card.index == null ? true : (p.card.index === prevIndex + 1 || (p.card.index === 1 && prevIndex === p.card.total));
      record('key-e-' + k, 'press e (' + k + '): next line, card open, spark in the clear space', p.card.open && cs.ok && cap.ok && seq,
        { card: { index: p.card.index, total: p.card.total, title: p.card.title, rect: p.card.rect, ...cap }, clear: cs, screenshot: await shot('key-e-' + k) },
        [p.card.open ? '' : 'no card', cs.ok ? '' : cs.why, cap.ok ? '' : 'card over cap', seq ? '' : 'index did not advance'].filter(Boolean).join('; '));
      prevIndex = p.card.index;
    }

    // 10 pinch out, then drag: the camera moves, the page neither scrolls nor zooms. The camera stays known
    // throughout: zoom 14 after a fly, then zoom × (finger distance ratio) per pinch, cx/cy solved from the selected spark.
    const solve = (p, zoom) => { if (!p.magenta || p.card.index == null || !placed[p.card.index - 1]) return null; const b = placed[p.card.index - 1]; return { zoom, cx: b.x - (p.magenta.x - p.viewport.w / 2) / zoom, cy: b.y - (p.viewport.h / 2 - p.magenta.y) / zoom }; };
    const toScreen = (c, b, p) => [(b.x - c.cx) * c.zoom + p.viewport.w / 2, p.viewport.h / 2 - (b.y - c.cy) * c.zoom];
    const pinchAt = async (mx, my, d0, d1, horizontal = true) => { const pts = d => horizontal ? [[mx - d / 2, my], [mx + d / 2, my]] : [[mx, my - d / 2], [mx, my + d / 2]];
      await touch('touchStart', pts(d0)); for (let i = 1; i <= 10; i++) { await touch('touchMove', pts(d0 + (d1 - d0) * i / 10)); await sleep(30); } await touch('touchEnd', []); return settle(); };
    let zoomNow = 14, cam = solve(p, zoomNow);
    const P0 = p.magenta, vv0 = p.viewport; let pinch = null, drag = null, zoomOut = [];
    if (P0) {
      // the fingers' midpoint must be well away from the spark (edFly puts the spark at the centre of the clear space, so the
      // centre is the one place not to pinch: the spark would stay put and the ratio would be noise); go 100 px up or down,
      // whichever side of the spark has more clear room
      const bandTop = p.bar.bottom + 30, bandBot = (p.card.open ? p.card.rect.top : p.viewport.h) - 30;
      const off = Math.min(100, Math.max(20, Math.max(P0.y - bandTop, bandBot - P0.y) - 10));
      const mx = p.viewport.w / 2, my = (bandBot - P0.y >= P0.y - bandTop) ? Math.min(bandBot, P0.y + off) : Math.max(bandTop, P0.y - off), d0 = Math.min(220, p.viewport.w - 60), d1 = d0 / 2;
      const q = await pinchAt(mx, my, d0, d1);   // pinchAt settles, so the last drawn frame is the finished pinch, not one from the middle of it
      const r0 = Math.hypot(P0.x - mx, P0.y - my), r1 = q.magenta ? Math.hypot(q.magenta.x - mx, q.magenta.y - my) : null;
      pinch = { centre: [mx, +my.toFixed(1)], sparkBefore: [P0.x, P0.y], fingerDistance: [d0, d1], sparkDistanceFromCentre: [+r0.toFixed(1), r1 && +r1.toFixed(1)], ratio: r1 != null ? +(r1 / r0).toFixed(3) : null, expected: 0.5, pageScroll: [q.viewport.scrollX, q.viewport.scrollY], vvScale: q.viewport.vvScale, innerWidth: q.viewport.w };
      pinch.ok = pinch.ratio != null && r0 >= 25 && Math.abs(pinch.ratio - 0.5) < 0.12 && q.viewport.scrollX === 0 && q.viewport.scrollY === 0 && Math.abs((q.viewport.vvScale || 1) - 1) < 0.01 && q.viewport.w === vv0.w;
      if (pinch.ok) zoomNow *= d1 / d0;
      const P1 = q.magenta; if (P1) {
        const ax = p.viewport.w / 2, ay = my, dx = -90, dy = 70;
        await touch('touchStart', [[ax, ay]]); for (let i = 1; i <= 12; i++) { await touch('touchMove', [[ax + dx * i / 12, ay + dy * i / 12]]); await sleep(25); } await touch('touchEnd', []);
        const s = await settle(); drag = { finger: [dx, dy], sparkMoved: s.magenta ? [+(s.magenta.x - P1.x).toFixed(1), +(s.magenta.y - P1.y).toFixed(1)] : null, pageScroll: [s.viewport.scrollX, s.viewport.scrollY], vvScale: s.viewport.vvScale, vvOffset: s.viewport.vvOffset, cardOpen: s.card.open };
        drag.ok = !!drag.sparkMoved && Math.abs(drag.sparkMoved[0] - dx) <= 12 && Math.abs(drag.sparkMoved[1] - dy) <= 12 && s.viewport.scrollX === 0 && s.viewport.scrollY === 0 && Math.abs((s.viewport.vvScale || 1) - 1) < 0.01;
        p = s;
      }
      // zoom out until the whole belt of sparks is in view (the engine clamps zoom at 1e-4): the selected spark, under the
      // midpoint of the fingers, must stay put, which is the pinch law measured a second time at a large ratio
      if (pinch.ok && drag && drag.ok && p.magenta && placed.length) {
        const rmax = Math.max(...placed.map(b => Math.hypot(b.x, b.y)));
        const clearH = (p.card.open ? p.card.rect.top : p.viewport.h) - p.bar.bottom;
        const target = Math.max(1.2e-4, 0.40 * Math.min(p.viewport.w, clearH) / rmax);
        for (let k = 0; k < 7 && zoomNow > target * 1.05; k++) {
          // fingers centred on the selected spark (it must not move), on whichever axis has more room, and never off the
          // screen: a touch point outside the viewport is dropped by Chromium and the pinch degrades into a one-finger drag
          const M = p.magenta; const mx2 = M.x, my2 = M.y;
          const roomX = 2 * Math.min(mx2, p.viewport.w - mx2) - 16, roomY = 2 * Math.min(my2 - p.bar.bottom, (p.card.open ? p.card.rect.top : p.viewport.h) - my2) - 16;
          const horizontal = roomX >= roomY, D0 = Math.min(300, Math.max(40, horizontal ? roomX : roomY));
          const ratio = Math.min(D0 / 12, zoomNow / target), D1 = D0 / ratio;
          const q2 = await pinchAt(mx2, my2, D0, D1, horizontal);
          const moved = q2.magenta ? +Math.hypot(q2.magenta.x - mx2, q2.magenta.y - my2).toFixed(1) : null;
          const ok = moved != null && moved <= 3 && q2.viewport.scrollY === 0 && Math.abs((q2.viewport.vvScale || 1) - 1) < 0.01;
          zoomOut.push({ centre: [mx2, my2], axis: horizontal ? 'x' : 'y', fingerDistance: [D0, +D1.toFixed(2)], ratio: +(1 / ratio).toFixed(5), zoomAfter: +(zoomNow / ratio).toExponential(3), selectedSparkMovedPx: moved, greensInView: [p.greensCount, q2.greensCount], ok });
          if (!ok) break; zoomNow /= ratio; p = q2;
        }
        cam = solve(p, zoomNow);
      }
    }
    record('pinch-drag', 'pinch out then drag: the wafer zooms and pans, the page neither scrolls nor zooms', pinch && pinch.ok && drag && drag.ok && zoomOut.length > 0 && zoomOut.every(z => z.ok), { pinch, drag, zoomOut, zoomNow: +zoomNow.toExponential(3), screenshot: await shot('pinch-drag') },
      !P0 ? 'no selected spark to measure against' : [pinch && !pinch.ok ? 'pinch ratio ' + pinch.ratio + ' (expected 0.5) or page moved' : '', drag ? (drag.ok ? '' : 'drag moved spark by ' + JSON.stringify(drag.sparkMoved) + ' for finger ' + JSON.stringify(drag.finger)) : 'no drag measured', zoomOut.length && zoomOut.every(z => z.ok) ? '' : 'zoom-out pinch failed: ' + JSON.stringify(zoomOut.slice(-1))].filter(Boolean).join('; '));

    // 11 tap a spark directly: the nearest spark by the law must be the one the card shows
    p = await probe();
    let cand = null, predicted = null, predictedDist = null, secondDist = null;
    if (cam && placed.length && p.greens.length) {
      const top = p.bar.bottom + 20, bot = (p.card.open ? p.card.rect.top : p.viewport.h) - 20;
      const pos = placed.map(b => toScreen(cam, b, p));
      const scored = p.greens.filter(g => g.y > top && g.y < bot && g.x > 20 && g.x < p.viewport.w - 20 && (!p.magenta || Math.hypot(g.x - p.magenta.x, g.y - p.magenta.y) > 30)).map(g => {
        let b1 = -1, d1 = 1e18, d2 = 1e18; pos.forEach(([x, y], i) => { const d = (x - g.x) ** 2 + (y - g.y) ** 2; if (d < d1) { d2 = d1; d1 = d; b1 = i; } else if (d < d2) d2 = d; });
        return { g, b1, d1: Math.sqrt(d1), d2: Math.sqrt(d2) }; }).filter(s => s.d1 <= 2.5 && s.d2 - s.d1 >= 6).sort((a, b) => (b.d2 - b.d1) - (a.d2 - a.d1));
      if (scored.length) { cand = scored[0].g; predicted = scored[0].b1; predictedDist = +scored[0].d1.toFixed(1); secondDist = +scored[0].d2.toFixed(1); }
    }
    const prevCardIndex = p.card.index;
    if (cand) { await tapAt(cand.x, cand.y); p = await settle(); }
    const csS = clearSpace(p);
    const gotNearest = cand && p.card.open && p.card.index != null && p.card.index === predicted + 1;
    record('spark-tap', 'tap a green spark: the card for the nearest spark opens and the camera places it clear', !!gotNearest && csS.ok,
      { tapped: cand || null, greensInView: p.greensCount, cameraKnown: !!cam, predictedIndex: predicted == null ? null : predicted + 1, predictedTitle: predicted == null ? null : placed[predicted].title, predictedDistanceFromTapPx: predictedDist, secondNearestPx: secondDist, cardIndex: p.card.index, previousCardIndex: prevCardIndex, cardTitle: p.card.title, clear: csS, screenshot: await shot('spark-tap') },
      !cand ? 'no unambiguous spark to tap (camera known: ' + !!cam + ', greens in view: ' + p.greensCount + ')' : (!p.card.open || p.card.index == null ? 'tap did not open a line card (card text: ' + (p.card.title || 'none') + ')' : (gotNearest ? (csS.ok ? '' : csS.why) : 'card shows ' + p.card.index + ', nearest by the law is ' + (predicted + 1))));

    // 12 COMMANDS → WHOLE WAFER
    p = await probe(); await tapRect(titleRect('foot')); await sleep(700); p = await probe();
    const fp = p.panels.foot; const ww = await page.evaluate(() => { const b = [...document.querySelectorAll('#foot button[data-k="Backspace"], #kuiper-menu-bar [data-k="Backspace"]')].find(e => e.getBoundingClientRect().height > 0); if (!b) return null; const r = b.getBoundingClientRect(); return { text: b.textContent.trim(), left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; });
    const cmdOpen = fp.visible && fp.rect.top >= p.bar.bottom - 1 && ww && ww.bottom <= p.viewport.h;
    if (ww) await tapRect(ww); p = await settle({ noSpark: true });
    const panelStillOpen = p.panels.foot.visible;
    if (panelStillOpen) { await tapAt(p.viewport.w - 4, p.viewport.h - 4); await sleep(800); p = await probe(); }   // a tap on the empty corner of the wafer closes the layer
    const wwFile = shotName('whole-wafer'); const got12 = await shotTo(wwFile);
    const wafer12 = got12.startsWith('FAILED') ? { error: got12, bbox: null } : await waferFromFile(wwFile, p.bar.bottom);
    const whole = wafer12.bbox && wafer12.bboxW > 0.4 * Math.min(p.viewport.w, p.viewport.h - p.bar.bottom) && Math.abs(wafer12.bboxW / wafer12.bboxH - 1) < 0.25 && wafer12.bbox[1] >= p.bar.bottom - 1 && wafer12.bbox[3] <= p.viewport.h;
    record('whole-wafer', 'tap COMMANDS then WHOLE WAFER: the card closes and the whole wafer is on screen under the bar', cmdOpen && !p.card.open && !p.magenta && !p.panels.foot.visible && whole,
      { commandsPanel: fp, wholeWaferButton: ww, commandsOpenedUnderBar: !!cmdOpen, panelStayedOpenAfterTap: panelStillOpen, cardOpen: p.card.open, magenta: p.magenta, wafer: wafer12, screenshot: path.relative(OUT, wwFile) },
      [cmdOpen ? '' : 'COMMANDS did not open under the bar or WHOLE WAFER off screen', p.card.open ? 'card still open' : '', p.panels.foot.visible ? 'COMMANDS still open' : '', whole ? '' : 'wafer not whole on screen: ' + JSON.stringify(wafer12.bbox)].filter(Boolean).join('; '));

    // 12b the modules: every modules.json order entry admitted by the loader, refused empty, zero page errors (ROADMAP 9.4 (o))
    {
      const m = await page.evaluate(async () => {
        let manifest = null; try { manifest = await (await fetch('modules.json', { cache: 'no-store' })).json(); } catch (e) { manifest = { error: String(e) }; }
        let E = null; const t1 = Date.now();   // the loader publishes done when every record is admitted or refused (handoff/04-loader/HOOKS.md :100); wait up to 60 s
        while (Date.now() - t1 < 60000) { E = window.__KUIPER_EDITION__ || (window.KY && typeof window.KY.inspect === 'function' ? window.KY.inspect() : null); if (!E || E.done) break; await new Promise(r => setTimeout(r, 500)); }
        const ids = a => (a || []).map(x => typeof x === 'string' ? x : (x && (x.id || x.name)) || JSON.stringify(x));
        return { order: manifest && manifest.order || [], manifestError: manifest && manifest.error || null, loader: !!E, admitted: E ? ids(E.admitted) : null, refused: E ? (E.refused || []) : null, failures: E ? (E.failures || []) : null, done: E ? !!E.done : null, whole: E ? (E.whole || null) : null };
      });
      const pageErrors = errors.filter(e => e.kind === 'pageerror').length;
      const missingIds = m.order.filter(id => !(m.admitted || []).includes(id));
      const ok = !m.manifestError && (m.order.length === 0 ? true : m.loader && m.done && !m.whole && missingIds.length === 0) && (!m.refused || m.refused.length === 0) && (!m.failures || m.failures.length === 0) && pageErrors === 0;
      record('modules', 'every module in modules.json order is admitted, none refused, zero page errors', ok, { ...m, notAdmitted: missingIds, pageErrors },
        [m.manifestError ? 'modules.json: ' + m.manifestError : '', m.order.length && !m.loader ? 'no loader state (window.__KUIPER_EDITION__) with ' + m.order.length + ' module(s) in order' : '', missingIds.length && m.loader ? 'not admitted: ' + missingIds.join(', ') : '', m.refused && m.refused.length ? 'refused: ' + JSON.stringify(m.refused).slice(0, 200) : '', m.failures && m.failures.length ? 'failures: ' + JSON.stringify(m.failures).slice(0, 200) : '', pageErrors ? pageErrors + ' page error(s)' : '', m.order.length === 0 ? 'note: modules.json order is empty' : ''].filter(Boolean).join('; '));
    }

    // 13 SEE THROUGH
    p = await probe(); let st = null;
    if (p.seeThrough) {
      const newPage = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
      const nav = page.waitForURL(/see-through/, { timeout: 10000 }).then(() => 'same-tab').catch(() => null);
      leftEdition = true; await tapRect(p.seeThrough.rect);
      const np = await newPage; let how = null, url = null;
      if (np) { how = 'new-tab'; await np.waitForURL(/see-through\/(\d{12}\/)?/, { timeout: 20000 }).catch(() => {}); url = np.url(); await np.close().catch(() => {}); }
      else if (await nav) { how = 'same-tab'; await page.waitForURL(/see-through\/(\d{12}\/)?/, { timeout: 20000 }).catch(() => {}); url = page.url(); }
      st = { control: p.seeThrough, how, url, ok: !!how && /\/see-through\//.test(url || '') };
    }
    record('see-through', 'tap SEE THROUGH: ../../see-through/ opens (new tab or navigation)', st && st.ok, { ...(st || { control: null }), screenshot: await shot('see-through') }, !p.seeThrough ? 'no SEE THROUGH control in #bar' : (st.ok ? st.how + ' → ' + st.url : 'tap did not open see-through (url ' + st.url + ')'));
    // 14 the whole journey on the edition: zero console errors, page errors and failed requests (off-edition ones reported apart)
    record('console', 'zero console errors on the edition across the whole journey', errors.length === 0, { consoleErrors: errors.slice(), offPageErrors: offPageErrors.slice() },
      [errors.length ? errors.length + ' error(s): ' + errors.slice(0, 3).map(e => e.kind + ' ' + e.text.slice(0, 100)).join(' | ') : '', offPageErrors.length ? 'note: ' + offPageErrors.length + ' error(s) after leaving the edition (not counted)' : ''].filter(Boolean).join('; '));
  } catch (e) {
    record('harness', 'harness error', false, { error: String(e && e.stack || e) }, String(e && e.message || e));
  }
  report.consoleErrors = errors.slice(); report.offPageErrors = offPageErrors.slice(); report.pass = steps.every(s => s.pass); report.passed = steps.filter(s => s.pass).length; report.failed = steps.filter(s => !s.pass).length;
  report.finishedAt = new Date().toISOString();
  await context.close();
  return report;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = { url: URL0, outdir: OUT, generatedAt: new Date().toISOString(), devices: [] };
  try { for (const d of DEVICES) { out.devices.push(await runDevice(browser, d)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1)); } }
  finally { await browser.close(); }
  out.pass = out.devices.every(d => d.pass);
  out.summary = out.devices.map(d => ({ device: d.device, passed: d.passed, failed: d.failed, failedSteps: d.steps.filter(s => !s.pass).map(s => s.id), consoleErrors: d.consoleErrors.length }));
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  process.exit(out.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
