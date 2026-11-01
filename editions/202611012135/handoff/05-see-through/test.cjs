#!/usr/bin/env node
// test.cjs — Opus team 5, NL-010 roadmap step 5 "See Through, the star player": the hand-off test, measured, not eyeballed.
// Written by OPUS-5 tester in the form of FIXES/NL-009/android-journey.cjs (Playwright, real touch, a JSON report,
// exit 0 only when every step of every device passed).
//
//   node test.cjs [baseUrl] [outdir] [--devices "Pixel 7 @393,Galaxy S24"] [--all] [--mode auto|integrated|manifest|preview|shim]
//                 [--with kuiper-shell,line-card,...] [--img <dir>] [--module <file>]
//
//   baseUrl  the kuiper-belt repository root as served (default http://127.0.0.1:8452/, team 5 tester's port)
//   outdir   screenshots and report.json (default /tmp/nl010-opus/team-5/tester/run)
//   --img    also write the four hand-off screenshots (each PNG < 300 KB) into this folder (handoff/05-see-through/img)
//   --title-min <px>  the width from which the entry must be a bar title (default 381, ROADMAP R7/Q7; team 1's shell uses 434)
//   --all    adds Pixel 7 at its native 412 px, Pixel 7 at 430 px, Pixel 7 landscape and a 1280x800 desktop
//
// Devices (default): "Pixel 7 @393" = devices['Pixel 7'] with the viewport 393 x 839 (the 393 px class the roadmap names,
// ROADMAP.md step 5 A1; Playwright's own Pixel 7 is 412 px wide); "Galaxy S24" = devices['Galaxy S24'] 360 x 780.
//
// How the module gets into the page (report.mode says which one ran; TEST.md states it):
//   integrated  the page itself carries the hook table (index.html contains 'kuiper.hooks.v1') and modules.json lists
//               id 'see-through': nothing is changed, this is the edition as it will ship.
//   manifest    the page carries the hook table and the loader, but modules.json does not list see-through yet: the test
//               serves modules.json with one record appended (sha256 and bytes measured from the file on disk), so the
//               edition's own loader admits the module.
//   preview     (auto, when index.html has no hook table yet but handoff/04-loader/index.html.patch exists) the test builds,
//               in <outdir>/preview only, index.html + team 4's loader patch (+ handoff/02-card/index.patch when line-card is
//               included, + handoff/03-layers/index.html.after-04-loader.patch when layers is; each patch all hunks or none)
//               and a modules.json of the modules on disk in the roadmap's integration order (kuiper-shell, line-card,
//               layers, file, see-through, apps, drift; --with a,b narrows it), and serves those two files by route.
//   shim        the page has no hook table yet (Edition 4 copy): the test serves index.html with a minimal hook table
//               built from handoff/04-loader/HOOKS.md (kuiper.hooks.v1, the 28 hooks plus cam lit sel redraw draw panels)
//               and a minimal loader that hashes, admits or refuses the module in words. Nothing on disk is changed.
//
// What is asserted (the caller's list; ROADMAP.md step 5 A1, A2, A4, A5, A8; team-3/STEPS.md step 5):
//   static   the module file: header line 1 names the licence, CERN-OHL-S-2.0 whenever the body carries See Through code
//            (ROADMAP step 9's register: such a module cannot be Apache-2.0),
//            generation in the header = file name stamp = registration; one KY.register; node --check; MODULE.sha256
//            data/see-through.json: 5,800 features, key_j = floor((j + 0.5) * SPACE / 20000) recomputed with BigInt,
//            all < SPACE, space = cosmos/wafer-meta.json address_space, 0 remap failures (j = floor(key * 20000 / space)
//            gives back j and the key), every point placed by the law, the ODbL attribution in the file
//   load     the module admitted, zero console errors
//   entry    "#kuiper-star" exists exactly once, an <a> to ../../see-through/ (same origin, same tab), aria-label/title the
//            homepage sentence; >= 381 px: in the bar, first and leftmost title, the widest .gm-title, on the titles' y,
//            lit at rest, bar one row; <= 380 px: the same node inside #kuiper-star-strip, x 8, bottom innerHeight - 8,
//            44 px tall, >= 100 px wide, the bar still one row; the entry is not covered (hit test at its centre)
//   layer    in the page: KY.hooks.keyPlace(key) equals the law for all 5,800 keys; the module's inspect() reports
//            5,800 records, 5,800 placed, 0 remap failures; KY.layers row 'OK' when the registry is admitted
//   tap      a real touch on the entry navigates in the same tab to /see-through/ on the same host (through the pointer),
//            title "See Through"; page.goBack() returns to the edition with the entry once, no panel open
//   spark    the card of a spark (keyboard 'e', as the journey does) carries an <a> to ../../see-through/#key=<key>
//            (ROADMAP 5.7; team-3/STEPS.md 5.7 adds &space=<SPACE>, accepted only with the wafer's SPACE); a real touch on
//            it lands on See Through with exactly that hash; back returns to the edition
//   errors   zero console errors, page errors and failed requests on every page of every device
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), http = require('http'), cp = require('child_process');

const argv = process.argv.slice(2);
const positional = []; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { if (!['--all'].includes(argv[i])) i++; } else positional.push(argv[i]); }
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : null; };
const BASE = (positional[0] || 'http://127.0.0.1:8452/').replace(/\/?$/, '/');
const OUT = path.resolve(positional[1] || '/tmp/nl010-opus/team-5/tester/run');
const IMG = flag('--img') ? path.resolve(String(flag('--img'))) : null;
const MODE_ARG = String(flag('--mode') || 'auto');
const EDDIR = path.resolve(__dirname, '..', '..');            // editions/<stamp>/
const ROOT = path.resolve(EDDIR, '..', '..');                 // the kuiper-belt repository root
const STAMP = path.basename(EDDIR);
const EDURL = BASE + 'editions/' + STAMP + '/';
const SENTENCE = 'See Through: from the stars to one substation in 3D';   // gg@c66759f homepage_versions/homepage_v134.html:35
const DEVSPEC = {
  'Pixel 7 @393': { base: 'Pixel 7', viewport: { width: 393, height: 839 } },
  'Pixel 7': { base: 'Pixel 7' },
  'Pixel 7 @430': { base: 'Pixel 7', viewport: { width: 430, height: 932 } },
  'Pixel 7 landscape': { base: 'Pixel 7', viewport: { width: 839, height: 412 } },
  'Galaxy S24': { base: 'Galaxy S24' },
  'Desktop 1280x800': { desktop: true, viewport: { width: 1280, height: 800 } },
};
let DEVICES = ['Pixel 7 @393', 'Galaxy S24'];
if (flag('--all')) DEVICES = ['Pixel 7 @393', 'Galaxy S24', 'Pixel 7', 'Pixel 7 @430', 'Pixel 7 landscape', 'Desktop 1280x800'];
if (flag('--devices')) DEVICES = String(flag('--devices')).split(',').map(s => s.trim()).filter(Boolean);
const FIXED_WAIT = 6500, ADMIT_MAX = 90000;
// the width from which the entry must be a bar title: ROADMAP.md R7 and Q7 (381 px; "A Pixel 7 (393 px) shows the title").
// Team 1 measured 434 px for its shell (handoff/01-shell/EVIDENCE.md §5 item 2; FINDING issue #10 comment 6564447092);
// the default stays the governing document's until the owner answers Q7 or the harness rules: --title-min 434 runs the other rule.
const TITLE_MIN = +(flag('--title-min') || 381);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const get = (u) => new Promise((res) => { http.get(u, r => { const ch = []; r.on('data', c => ch.push(c)); r.on('end', () => res({ status: r.statusCode, body: Buffer.concat(ch) })); }).on('error', e => res({ status: 0, body: Buffer.from(String(e)) })); });

// ------------------------------------------------------------------ the law, the same arithmetic as the page (index.html:278)
const G32 = 2654435769;
function keyPlace(k) { const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, th = 2 * Math.PI * m / 4294967296, r = Math.sqrt(k + 0.5); return [r * Math.cos(th), r * Math.sin(th)]; }
const starKey = (j, space) => Number((BigInt(2 * j + 1) * BigInt(space)) / 40000n);   // floor((j + 0.5) * SPACE / 20000), exact

// ------------------------------------------------------------------ static checks (run once, Node side)
function findModule() {
  if (flag('--module')) return path.resolve(String(flag('--module')));
  const dir = path.join(EDDIR, 'modules'); if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).filter(n => /^\d{12}-see-through\.js$/.test(n)).sort(); return f.length ? path.join(dir, f[f.length - 1]) : null;
}
function staticChecks() {
  const out = { module: null, data: null };
  const file = findModule();
  if (!file || !fs.existsSync(file)) { out.module = { pass: false, note: 'no modules/<stamp>-see-through.js in ' + path.join(EDDIR, 'modules') }; }
  else {
    const src = fs.readFileSync(file), text = src.toString('utf8'), name = path.basename(file);
    const header = (text.match(/^\s*\/\*[\s\S]*?\*\//) || [''])[0];
    const fileStamp = name.slice(0, 12);
    const hdrGen = (header.match(/kuiper module see-through, generation (\d{12}) \(UTC\)/) || [])[1] || null;
    const regGen = (text.match(/GEN\s*=\s*'(\d{12})'/) || text.match(/generation:\s*'(\d{12})'/) || [])[1] || null;
    const registers = (text.match(/\bKY\.register\s*\(/g) || []).length;
    // the licence rule (ROADMAP.md step 9, the register: copying See Through code makes the module CERN-OHL-S v2 and it cannot be
    // relicensed Apache-2.0; step 4, 4.3: the licence is on the header's first line): the first line names exactly one of the two,
    // and CERN-OHL-S-2.0 whenever the body carries See Through code
    const line1 = header.split('\n')[0];
    const l1Licence = (line1.match(/\(UTC\),\s*(CERN-OHL-S-2\.0|Apache-2\.0)/) || [])[1] || null;
    const copiesCern = /CERN-OHL-S|SEE-THROUGH-CERN/.test(text.slice(header.length));
    const apache = !!l1Licence;                              // a licence is named on line 1
    const cernNamed = copiesCern ? l1Licence === 'CERN-OHL-S-2.0' : true;
    let nodeCheck = null; try { cp.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); nodeCheck = 'ok'; } catch (e) { nodeCheck = String(e.stderr || e.message).split('\n').slice(0, 3).join(' '); }
    const shaFile = path.join(__dirname, 'MODULE.sha256');
    const shaRecorded = fs.existsSync(shaFile) ? (fs.readFileSync(shaFile, 'utf8').match(/[0-9a-f]{64}/) || [null])[0] : null;
    const sha = sha256(src);
    const pass = apache && (!copiesCern || cernNamed) && hdrGen === fileStamp && regGen === fileStamp && registers === 1 && nodeCheck === 'ok' && (shaRecorded === null || shaRecorded === sha);
    out.module = { pass, file: path.relative(ROOT, file), bytes: src.length, sha256: sha, moduleSha256File: shaRecorded, headerFirstLine: line1, licence: l1Licence, licenceInHeader: { namedOnLine1: apache, copiesSeeThroughCode: copiesCern, cernWhenCopied: cernNamed }, generation: { fileName: fileStamp, header: hdrGen, registration: regGen }, kyRegisterCalls: registers, nodeCheck,
      note: [apache ? '' : 'header line 1 names no licence (CERN-OHL-S-2.0 or Apache-2.0 after "(UTC),")', copiesCern && !cernNamed ? 'the body carries See Through code (CERN-OHL-S) but line 1 says ' + l1Licence : '', hdrGen === fileStamp ? '' : 'header generation ' + hdrGen + ' ≠ file name ' + fileStamp, regGen === fileStamp ? '' : 'registration generation ' + regGen + ' ≠ file name ' + fileStamp, registers === 1 ? '' : registers + ' KY.register calls (want 1)', nodeCheck === 'ok' ? '' : 'node --check: ' + nodeCheck, shaRecorded === null || shaRecorded === sha ? '' : 'MODULE.sha256 ' + shaRecorded.slice(0, 12) + ' ≠ file ' + sha.slice(0, 12)].filter(Boolean).join('; ') };
  }
  // data/see-through.json
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'cosmos', 'wafer-meta.json'), 'utf8'));
  const SPACE = meta.address_space;
  const dfile = path.join(EDDIR, 'data', 'see-through.json');
  if (!fs.existsSync(dfile)) { out.data = { pass: false, waferSpace: SPACE, note: 'no ' + path.relative(ROOT, dfile) }; return out; }
  const raw = fs.readFileSync(dfile); let j;
  try { j = JSON.parse(raw.toString('utf8')); } catch (e) { out.data = { pass: false, note: 'not JSON: ' + e.message }; return out; }
  const feats = Array.isArray(j) ? j : (j.features || []);
  const fileSpace = j.space != null ? j.space : (j.address_space != null ? j.address_space : (feats[0] && feats[0].properties && feats[0].properties.space));
  const keyOf = f => f.key != null ? f.key : (f.properties && f.properties.key != null ? f.properties.key : (f.geometry && f.geometry.key != null ? f.geometry.key : null));
  const jOf = (f, i) => f.properties && Number.isInteger(f.properties.sub) ? f.properties.sub : (f.properties && Number.isInteger(f.properties.j) ? f.properties.j : i);
  let keyMismatch = 0, beyond = 0, remapFail = 0, placeFail = 0, placeChecked = 0, spaceMismatch = 0; const firstBad = [];
  feats.forEach((f, i) => {
    const k = keyOf(f), jj = jOf(f, i), want = starKey(jj, SPACE);
    if (k !== want) { keyMismatch++; if (firstBad.length < 3) firstBad.push({ i, j: jj, key: k, want }); }
    if (!(k >= 0 && k < SPACE)) beyond++;
    const sp = (f.properties && f.properties.space != null) ? f.properties.space : fileSpace;
    if (sp !== SPACE) spaceMismatch++;
    const j2 = Number((BigInt(k) * 20000n) / BigInt(sp || SPACE));                     // the remap formula of team-3/STEPS.md 5.5 `space`
    if (j2 !== jj || starKey(j2, sp || SPACE) !== k) remapFail++;
    const c = f.coordinates || (f.geometry && f.geometry.coordinates);
    if (Array.isArray(c) && c.length >= 2) { placeChecked++; const [x, y] = keyPlace(k); if (Math.abs(c[0] - x) > 1e-6 * Math.max(1, Math.abs(x)) || Math.abs(c[1] - y) > 1e-6 * Math.max(1, Math.abs(y))) placeFail++; }
  });
  const distinctJ = new Set(feats.map((f, i) => jOf(f, i))).size;
  const odbl = /ODbL/.test(raw.toString('utf8')) && /OpenStreetMap/.test(raw.toString('utf8'));
  const pass = feats.length === 5800 && distinctJ === 5800 && keyMismatch === 0 && beyond === 0 && remapFail === 0 && placeFail === 0 && spaceMismatch === 0 && fileSpace === SPACE && odbl;
  out.data = { pass, file: path.relative(ROOT, dfile), bytes: raw.length, sha256: sha256(raw), features: feats.length, distinctJ, waferSpace: SPACE, fileSpace, keyMismatches: keyMismatch, firstBad, beyondSpace: beyond, remapFailures: remapFail, spaceMismatches: spaceMismatch, coordinatesChecked: placeChecked, placementFailures: placeFail, odblAttribution: odbl,
    note: [feats.length === 5800 ? '' : feats.length + ' features (want 5,800)', distinctJ === 5800 ? '' : distinctJ + ' distinct j', keyMismatch ? keyMismatch + ' keys ≠ floor((j+0.5)·SPACE/20000)' : '', beyond ? beyond + ' keys outside [0, SPACE)' : '', remapFail ? remapFail + ' remap failures' : '', placeFail ? placeFail + ' points not where the law puts them' : '', fileSpace === SPACE && !spaceMismatch ? '' : 'space ' + fileSpace + ' ≠ wafer ' + SPACE, odbl ? '' : 'no OpenStreetMap / ODbL attribution in the file'].filter(Boolean).join('; ') };
  out.keys = feats.map(keyOf);
  return out;
}

// ------------------------------------------------------------------ the shim (mode 'shim' only): hook table + loader, from handoff/04-loader/HOOKS.md
function shimSource(modulePath, sha) {
  return `
// ===== OPUS-5 TEST SHIM: not shipped; served by handoff/05-see-through/test.cjs only (the hook table of handoff/04-loader/HOOKS.md) =====
{ const drawFns = [], refused = [], admitted = [], modules = {}, provided = new Set();
  const F = Object.freeze;
  const hooks = { keyPlace: k => keyPlace(k), address: k => address(k), describe: a => describe(a), findBy: (f, v) => findBy(f, v),
    flyTo: (x, y, z) => flyTo(x, y, z), home: () => home(), homeCamera: () => homeCamera(), safeBox: () => safeBox(),
    lightTime: (y, m, d) => lightTime(y, m, d), showNew: h => showNew(h), goKey: k => goKey(k), fmt: n => fmt(n), words: n => words(n),
    esc: v => esc(v), cv, ov, o2, hud, big, sub, card, gbox, gin,
    get SPACE(){ return SPACE; }, get N(){ return N; }, get repos(){ return repos; }, get commits(){ return commits; },
    wafer: new Promise(res => { const t = setInterval(() => { if (N && SPACE) { clearInterval(t); res({ N, SPACE }); } }, 50); }) };
  const names = F(Object.keys(hooks).concat(['cam', 'lit', 'sel', 'redraw', 'draw', 'panels']));
  { const _d = draw; draw = function(){ _d(); for (const e of drawFns.slice()) { try { e.fn(o2, KYo); } catch (err) { drawFns.splice(drawFns.indexOf(e), 1); hud.textContent += '\\nmodule draw removed: ' + err.message; } } }; }
  let admitting = null;
  const KYo = { schema: 'kuiper.hooks.v1', edition: '${STAMP}', shim: true, hooks: F(hooks), names,
    cam: F({ get x(){ return cx; }, get y(){ return cy; }, get zoom(){ return zoom; }, get atHome(){ return atHome; } }),
    lit: F({ get repo(){ return litRepo; }, set repo(v){ litRepo = v; dirty = true; }, get K(){ return litK; }, get Ci(){ return litCi; }, set period(v){ if (v == null) { litK = [-1, -1]; litCi = null; dirty = true; } } }),
    sel: F({ get target(){ return target; }, set target(v){ target = v; dirty = true; } }),
    redraw: () => { dirty = true; },
    draw: F({ add(fn, order){ drawFns.push({ fn, order: +order || 0 }); drawFns.sort((a, b) => a.order - b.order); dirty = true; } }),
    panels: F({ add(name, el, title){ PANELS[name] = el; }, set(name){ setPanel(name); }, place(){ placePanels(); } }),
    register(m){ const why = (() => { if (!m || m.schema !== 'kuiper.module.v1') return 'no registration';
        if (m.id !== admitting.id) return 'id ' + m.id + ' ≠ ' + admitting.id;
        if (m.generation !== admitting.generation) return 'generation ' + m.generation + ', file name ' + admitting.generation;
        for (const r of (m.requires || [])) if (!names.includes(r) && !provided.has(r)) return 'missing hook ' + r; return null; })();
      if (why) { refused.push({ id: admitting.id, why }); hud.textContent += '\\n' + admitting.id + ' refused: ' + why; return; }
      let api; try { api = m.install(KYo); } catch (e) { refused.push({ id: m.id, why: 'install threw ' + e.message }); hud.textContent += '\\n' + m.id + ' refused: install threw ' + e.message; return; }
      modules[m.id] = F({ id: m.id, generation: m.generation, sha256: admitting.sha256, api, inspect: m.inspect }); (m.provides || []).concat([m.id]).forEach(p => provided.add(p));
      admitted.push({ id: m.id, sha256: admitting.sha256 }); admitting.done = true; },
    modules, inspect: () => window.__KUIPER_EDITION__ };
  window.KY = F(KYo); window.__KUIPER_MODULES__ = modules; window.__KUIPER_EDITION__ = { mode: 'shim', admitted, refused };
  (async () => { const p = ${JSON.stringify(modulePath)}; admitting = { id: 'see-through', generation: p.match(/(\\d{12})-see-through\\.js$/)[1], sha256: null };
    const r = await fetch(p, { cache: 'no-store' }); if (!r.ok) { refused.push({ id: 'see-through', why: 'HTTP ' + r.status }); return; }
    const b = await r.arrayBuffer(); const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map(x => x.toString(16).padStart(2, '0')).join('');
    admitting.sha256 = h; if (h !== ${JSON.stringify(sha)}) { refused.push({ id: 'see-through', why: 'sha256 mismatch' }); return; }
    const s = document.createElement('script'); s.dataset.kyModule = 'see-through'; s.src = URL.createObjectURL(new Blob([b], { type: 'text/javascript' }));
    s.onload = () => { if (!admitting.done && !refused.some(x => x.id === 'see-through')) refused.push({ id: 'see-through', why: 'no registration' }); };
    document.head.appendChild(s); })();
}
// ===== end of the test shim =====
`;
}

// ------------------------------------------------------------------ in-page probe
function probeFn(sentence) {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) }; };
  const all = [...document.querySelectorAll('#kuiper-star')];
  const el = all[0] || null, bar = document.getElementById('kuiper-menu-bar') || document.getElementById('bar');   // team 1's shell bar, else Edition 4's
  const titles = bar ? [...bar.querySelectorAll('.gm-title')].filter(t => t.getBoundingClientRect().width > 0) : [];
  const others = titles.filter(t => t !== el);
  const strip = document.getElementById('kuiper-star-strip');
  const side = document.querySelector('.gm-side-left');
  let entry = null;
  if (el) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    entry = { tag: el.tagName.toLowerCase(), cls: el.className, text: el.textContent.trim(), hrefAttr: el.getAttribute('href'), hrefResolved: el.href, target: el.getAttribute('target'), role: el.getAttribute('role'),
      title: el.getAttribute('title'), ariaLabel: el.getAttribute('aria-label'), sentenceOk: el.getAttribute('aria-label') === sentence || el.getAttribute('title') === sentence,
      rect: R(el), background: cs.backgroundColor, color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight, textTransform: cs.textTransform,
      parentId: el.parentElement && el.parentElement.id, parentClass: el.parentElement && el.parentElement.className,
      inBar: !!(bar && bar.contains(el)), inStrip: !!(strip && strip.contains(el)), firstOfSideLeft: !!(side && side.firstElementChild && (side.firstElementChild === el || side.firstElementChild.contains(el)) && side.querySelector('.gm-title') === el), firstTitleInBar: titles[0] === el,
      hitOk: !!hit && (hit === el || el.contains(hit)), hitAt: hit ? (hit.id ? '#' + hit.id : hit.tagName.toLowerCase()) : null };
  }
  return { viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio }, count: all.length, entry, barId: bar ? bar.id : null,
    sideLeft: !!side, strip: strip ? { rect: R(strip), position: getComputedStyle(strip).position, children: strip.children.length } : null,
    bar: bar ? { rect: R(bar), scrollWidth: bar.scrollWidth, clientWidth: bar.clientWidth } : null,
    titles: titles.map(t => ({ text: t.textContent.trim(), star: t === el, rect: R(t) })),
    otherMaxWidth: others.length ? Math.max(...others.map(t => +t.getBoundingClientRect().width.toFixed(1))) : 0,
    otherMinLeft: others.length ? Math.min(...others.map(t => +t.getBoundingClientRect().left.toFixed(1))) : null,
    openPanels: [...document.querySelectorAll('.gm-open')].map(p => p.id || p.className),
    card: (() => { const c = document.getElementById('card'); if (!c || getComputedStyle(c).display === 'none') return null; const m = c.textContent.match(/(\d[\d,]*)\s+of\s+(\d[\d,]*)/);
      const links = [...c.querySelectorAll('a')].filter(a => /see-through/.test(a.getAttribute('href') || '')).map(a => ({ text: a.textContent.trim(), hrefAttr: a.getAttribute('href'), hrefResolved: a.href, target: a.getAttribute('target'), rect: R(a) }));
      return { index: m ? +m[1].replace(/,/g, '') : null, total: m ? +m[2].replace(/,/g, '') : null, first: c.textContent.trim().slice(0, 100), links, rect: R(c) }; })(),
    ky: (() => { const K = window.KY; if (!K) return null; const m = K.modules && K.modules['see-through'];
      let ins = null; try { ins = m && typeof m.inspect === 'function' ? m.inspect() : null; } catch (e) { ins = { error: String(e.message || e) }; }
      let layers = null; try { if (K.layers && typeof K.layers.inspect === 'function') { const li = K.layers.inspect(); layers = { state: li && li.states ? li.states['see-through'] : null, row: li && li.rows ? li.rows['see-through'] : null }; } } catch (e) { layers = { error: String(e.message || e) }; }
      const ed = window.__KUIPER_EDITION__ || (K.inspect && K.inspect()) || null;
      return { schema: K.schema, shim: !!K.shim, frozen: Object.isFrozen(K), admitted: !!m, generation: m && m.generation, sha256: m && m.sha256, apiKeys: m && m.api ? Object.keys(m.api) : [], inspect: ins, layers,
        refused: ed && ed.refused ? ed.refused : null, admittedIds: ed && ed.admitted ? ed.admitted.map(a => a.id || a) : null }; })(),
  };
}

// ------------------------------------------------------------------ PNG size discipline for img/ (each < 300 KB)
function fitPng(src, dst) {
  fs.copyFileSync(src, dst); if (fs.statSync(dst).size < 300 * 1024) return fs.statSync(dst).size;
  const py = 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nfor n in (256,128,64,32):\n  im.quantize(colors=n, method=Image.Quantize.MEDIANCUT).save(sys.argv[2], optimize=True)\n  import os\n  if os.path.getsize(sys.argv[2]) < 300*1024: break\n';
  try { cp.execFileSync('python3', ['-I', '-c', py, src, dst], { stdio: 'pipe' }); } catch (e) { /* the size check below records it */ }
  return fs.statSync(dst).size;
}

// ------------------------------------------------------------------ one device run
async function runDevice(browser, name, ctx) {
  const spec = DEVSPEC[name]; if (!spec) throw new Error('unknown device ' + name + ' (known: ' + Object.keys(DEVSPEC).join(', ') + ')');
  const dev = spec.desktop ? { viewport: spec.viewport, deviceScaleFactor: 1, isMobile: false, hasTouch: true } : { ...devices[spec.base], ...(spec.viewport ? { viewport: spec.viewport } : {}) };
  const dir = path.join(OUT, slug(name)); fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ ...dev, locale: 'en-GB' });
  // how the module reaches the page
  if (ctx.mode === 'shim') {
    await context.route(u => { const p = new URL(u).pathname; return p === '/editions/' + STAMP + '/' || p === '/editions/' + STAMP + '/index.html'; }, async (route) => {
      const r = await route.fetch(); let body = await r.text(); const i = body.lastIndexOf('</script>');
      body = body.slice(0, i) + shimSource(ctx.modulePathFromEdition, ctx.static.module.sha256) + body.slice(i);
      await route.fulfill({ response: r, body, headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    });
  } else if (ctx.mode === 'preview') {
    await context.route(u => new URL(u).pathname in ctx.preview.bytes, async (route) => {
      await route.fulfill({ status: 200, body: ctx.preview.bytes[new URL(route.request().url()).pathname], headers: { 'content-type': 'text/javascript', 'cache-control': 'no-store' } });
    });
    await context.route(u => { const p = new URL(u).pathname; return p === '/editions/' + STAMP + '/' || p === '/editions/' + STAMP + '/index.html' || p === '/editions/' + STAMP + '/modules.json'; }, async (route) => {
      const isMan = new URL(route.request().url()).pathname.endsWith('/modules.json');
      await route.fulfill({ status: 200, body: isMan ? JSON.stringify(ctx.preview.manifest) : ctx.preview.html, headers: { 'content-type': isMan ? 'application/json' : 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    });
  } else if (ctx.mode === 'manifest') {
    await context.route(u => new URL(u).pathname === '/editions/' + STAMP + '/modules.json', async (route) => {
      const r = await route.fetch(); const j = await r.json(); j.order = (j.order || []).concat(['see-through']); j.modules = (j.modules || []).concat([ctx.record]);
      await route.fulfill({ response: r, body: JSON.stringify(j), headers: { ...r.headers(), 'content-type': 'application/json', 'cache-control': 'no-store' } });
    });
  }
  const page = await context.newPage(); page.setDefaultTimeout(180000);
  const errors = [];
  // A request to ANOTHER host that this sandbox's egress proxy refuses (See Through's MapLibre style at basemaps.cartocdn.com,
  // net::ERR_TUNNEL_CONNECTION_FAILED) is not an error of the edition or of the module: it is recorded in `external`, named in
  // TEST.md, and does not fail the step; its echo "Failed to load resource: <same net error>" is paired with it. Every
  // same-origin failure, every page error and every other console error fails.
  const external = [], EGRESS = /ERR_TUNNEL_CONNECTION_FAILED|ERR_PROXY_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED/;
  const origin0 = new URL(EDURL).origin;
  const watch = (pg, where) => {
    pg.on('console', m => { if (m.type() !== 'error') return; const t = m.text(), loc = (m.location() || {}).url || '';
      const ext = /^Failed to load resource: net::/.test(t) && EGRESS.test(t) && loc && !loc.startsWith(origin0);
      (ext ? external : errors).push({ where, kind: 'console', url: pg.url(), resource: loc.slice(0, 200), text: t.slice(0, 300) }); });
    pg.on('pageerror', e => errors.push({ where, kind: 'pageerror', url: pg.url(), text: String(e.message || e).slice(0, 300) }));
    pg.on('requestfailed', r => { const f = r.failure(); if (!f || /aborted|ERR_ABORTED/i.test(f.errorText)) return;
      const ext = !r.url().startsWith(origin0) && EGRESS.test(f.errorText);
      (ext ? external : errors).push({ where, kind: 'request', url: r.url().slice(0, 200), text: f.errorText }); });
  };
  watch(page, 'tab');
  let newTabs = 0; context.on('page', p => { if (p !== page) { newTabs++; watch(p, 'new-tab'); } });
  const steps = []; let n = 0, t0 = Date.now();
  const shots = {};
  const shot = async (id) => { const f = path.join(dir, String(++n).padStart(2, '0') + '-' + id + '.png');
    for (let a = 0; a < 2; a++) { try { await page.screenshot({ path: f, scale: 'css', timeout: 180000 }); shots[id] = f; return path.relative(OUT, f); } catch (e) { if (a) return 'FAILED: ' + String(e.message || e).split('\n')[0]; } } };
  const record = (id, title, pass, measured, note) => { steps.push({ id, name: title, pass: !!pass, ms: Date.now() - t0, measured, note: note || '' }); t0 = Date.now(); process.stderr.write(`[${name}] ${pass ? 'PASS' : 'FAIL'} ${id}${note ? ' — ' + note : ''}\n`); };
  const probe = () => page.evaluate(probeFn, SENTENCE);
  const tapRect = (r) => page.touchscreen.tap(Math.round((r.left + r.right) / 2), Math.round((r.top + r.bottom) / 2));
  const waitAdmitted = async () => { const s = Date.now(); while (Date.now() - s < ADMIT_MAX) { const ok = await page.evaluate(() => { const K = window.KY, ed = window.__KUIPER_EDITION__;
      return !!(K && K.modules && K.modules['see-through']) || !!(ed && ed.refused && ed.refused.some(r => (r.id || '') === 'see-through')); }).catch(() => false); if (ok) return true; await sleep(250); } return false; };
  const loadEdition = async (url) => { await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => /verified lines lit/.test((document.getElementById('big') || {}).textContent || ''), null, { timeout: 60000 }).catch(() => {});
    await waitAdmitted(); await sleep(FIXED_WAIT); };
  const report = { device: name, viewport: dev.viewport, dpr: dev.deviceScaleFactor, mode: ctx.mode, url: EDURL, startedAt: new Date().toISOString(), steps, consoleErrors: errors, externalUnreachable: external, pass: false };
  const SPACE = ctx.static.data.waferSpace;
  try {
    // 1 load: the module admitted, zero errors so far
    await loadEdition(EDURL);
    let p = await probe();
    record('load', 'load the edition: the see-through module admitted, zero console errors', p.ky && p.ky.admitted && errors.length === 0,
      { ky: p.ky, consoleErrors: errors.slice(), viewport: p.viewport },
      [!p.ky ? 'no window.KY on the page' : (!p.ky.admitted ? 'see-through not admitted' + (p.ky.refused && p.ky.refused.length ? ' (refused: ' + JSON.stringify(p.ky.refused) + ')' : '') : ''), errors.length ? errors.length + ' console error(s): ' + errors[0].text : ''].filter(Boolean).join('; '));

    // 2 the entry: first and largest at >= 381 px, the chip at <= 380 px
    p = await probe(); const e = p.entry; const wide = p.viewport.w >= TITLE_MIN;
    let why = [];
    if (p.count !== 1) why.push('#kuiper-star count ' + p.count + ' (want 1)');
    if (e) {
      if (e.tag !== 'a') why.push('entry is <' + e.tag + '>, want <a>');
      if (e.hrefAttr !== '../../see-through/') why.push('href "' + e.hrefAttr + '", want "../../see-through/"');
      if (new URL(e.hrefResolved).origin !== new URL(EDURL).origin || new URL(e.hrefResolved).pathname !== '/see-through/') why.push('resolves to ' + e.hrefResolved);
      if (e.target && e.target !== '_self') why.push('target ' + e.target + ' (same tab wanted)');
      if (!/^see through$/i.test(e.text)) why.push('text "' + e.text + '"');
      if (!e.sentenceOk) why.push('aria-label/title is not the homepage sentence');
      if (!e.hitOk) why.push('entry covered at its centre by ' + e.hitAt);
      const tops = p.titles.filter(t => !t.star).map(t => t.rect.top);
      const oneRow = p.bar && tops.length && Math.max(...tops) - Math.min(...tops) < 4 && p.bar.scrollWidth <= p.bar.clientWidth + 1;
      if (!oneRow) why.push('bar not one row (title tops ' + tops.join('/') + ', scrollWidth ' + (p.bar && p.bar.scrollWidth) + '/' + (p.bar && p.bar.clientWidth) + ')');
      if (wide) {
        if (!e.inBar || e.inStrip) why.push('at ' + p.viewport.w + ' px the entry is not a bar title');
        if (p.sideLeft ? !e.firstOfSideLeft : !e.firstTitleInBar) why.push(p.sideLeft ? 'not the first child of .gm-side-left' : 'not the first .gm-title of #bar');
        if (p.otherMinLeft != null && e.rect.left > p.otherMinLeft + 0.5) why.push('not leftmost (x ' + e.rect.left + ' > ' + p.otherMinLeft + ')');
        if (!(e.rect.width >= p.otherMaxWidth)) why.push('not the largest title (' + e.rect.width + ' px < ' + p.otherMaxWidth + ' px)');
        if (tops.length && Math.abs(e.rect.top - tops[0]) > 2) why.push('not on the titles\' y (' + e.rect.top + ' vs ' + tops[0] + ')');
        if (!/rgba\(80, 220, 240, 0\.16\)/.test(e.background)) why.push('not lit at rest (background ' + e.background + ')');
        if (e.color !== 'rgb(255, 255, 255)') why.push('colour ' + e.color + ' (want rgb(255, 255, 255))');
      } else {
        if (!e.inStrip || e.parentId !== 'kuiper-star-strip') why.push('at ' + p.viewport.w + ' px the entry is not inside #kuiper-star-strip');
        if (!p.strip || p.strip.position !== 'fixed') why.push('#kuiper-star-strip is not position:fixed');
        const sr = p.strip ? p.strip.rect : e.rect;
        if (Math.abs(sr.left - 8) > 0.6) why.push('chip x ' + sr.left + ' (want 8)');
        if (Math.abs(sr.bottom - (p.viewport.h - 8)) > 1) why.push('chip bottom ' + sr.bottom + ' (want ' + (p.viewport.h - 8) + ')');
        if (Math.abs(sr.height - 44) > 0.6 || e.rect.height < 43.4) why.push('chip height ' + sr.height + ' / entry ' + e.rect.height + ' (want 44)');
        if (e.rect.width < 100) why.push('chip width ' + e.rect.width + ' (want ≥ 100)');
        if (e.inBar) why.push('entry also in the bar');
      }
    } else why.push('no #kuiper-star');
    record('entry', wide ? 'the entry: first and largest bar title, lit at rest, one row' : 'the entry: the 44 px chip bottom-left, the bar one row', why.length === 0,
      { form: e ? (e.inStrip ? 'strip' : (e.inBar ? 'title' : 'elsewhere')) : null, entry: e, count: p.count, sideLeft: p.sideLeft, strip: p.strip, bar: p.bar, titles: p.titles, otherMaxWidth: p.otherMaxWidth, screenshot: await shot('entry') }, why.join('; '));

    // 3 the layer in the page: placed by the law, 5,800 records, 0 remap failures
    const keys = ctx.static.keys || [];
    const lawCheck = await page.evaluate((keys) => { const K = window.KY; if (!K || !K.hooks || typeof K.hooks.keyPlace !== 'function') return null;
      return keys.map(k => K.hooks.keyPlace(k)); }, keys).catch(() => null);
    // the remap, in the page, through the module's own api: every star key cut under See Through 202610050609's sky
    // (SPACE 59,637,070,538, see-through/202610050609/kuiper-law.js:36) must come back as star j under the wafer's sky
    const OLD = 59637070538;
    const oldKeys = keys.map((k, j) => starKey(j, OLD)), newKeys = keys.map((k, j) => starKey(j, SPACE));
    const remapRes = await page.evaluate(({ oldKeys, newKeys, OLD, SPACE }) => { const m = window.KY && window.KY.modules && window.KY.modules['see-through'];
      if (!m || !m.api || typeof m.api.remap !== 'function') return null; let fail = 0, same = 0, star = 0; const bad = [];
      for (let j = 0; j < oldKeys.length; j++) { const r = m.api.remap(oldKeys[j], OLD, SPACE); if (!r || r.j !== j || r.key !== newKeys[j]) { fail++; if (bad.length < 3) bad.push({ j, old: oldKeys[j], got: r }); }
        const r2 = m.api.remap(newKeys[j], SPACE, SPACE); if (!r2 || r2.j !== j || r2.key !== newKeys[j]) same++;
        if (typeof m.api.starKey === 'function' && m.api.starKey(j, SPACE) !== newKeys[j]) star++; }
      return { checked: oldKeys.length, remapFailures: fail, identityFailures: same, starKeyMismatches: star, firstBad: bad }; }, { oldKeys, newKeys, OLD, SPACE }).catch(e => ({ error: String(e.message || e) }));
    let lawMismatch = null; if (lawCheck) { lawMismatch = 0; keys.forEach((k, i) => { const [x, y] = keyPlace(k), q = lawCheck[i]; if (!q || Math.abs(q[0] - x) > 1e-9 * Math.max(1, Math.abs(x)) || Math.abs(q[1] - y) > 1e-9 * Math.max(1, Math.abs(y))) lawMismatch++; }); }
    p = await probe(); const ins = p.ky && p.ky.inspect; const L = ins && (ins.layer || ins.stars || ins);
    const recs = L && (L.total != null ? L.total : (L.records != null ? L.records : L.features));
    const placedN = L && (L.placed != null ? L.placed : null);
    const remapF = remapRes && remapRes.remapFailures != null ? remapRes.remapFailures + remapRes.identityFailures + remapRes.starKeyMismatches : null;
    why = [];
    if (!ctx.static.data.pass) why.push('data/see-through.json: ' + (ctx.static.data.note || 'FAIL'));
    if (lawMismatch == null) why.push('KY.hooks.keyPlace not callable'); else if (lawMismatch) why.push(lawMismatch + ' keys placed off the law by KY.hooks.keyPlace');
    if (recs !== 5800) why.push('module inspect().layer.total ' + recs + ' (want 5800)');
    if (placedN !== 5800) why.push('module inspect().layer.placed ' + placedN + ' (want 5800)');
    if (L && L.status !== 'OK') why.push('layer status ' + (L && L.status) + (L && L.why ? ' (' + L.why + ')' : ''));
    if (L && (L.space !== SPACE || L.wafer !== SPACE)) why.push('layer space ' + (L && L.space) + ' / wafer ' + (L && L.wafer) + ' (want ' + SPACE + ')');
    if (remapF !== 0) why.push('remap failures ' + (remapRes ? JSON.stringify(remapRes) : 'api.remap missing') + ' (want 0)');
    if (p.ky && p.ky.layers && p.ky.layers.state != null && p.ky.layers.state !== 'OK') why.push('KY.layers row state ' + p.ky.layers.state);
    record('layer', 'the stars layer: 5,800 records placed by the law, 0 remap failures', why.length === 0,
      { data: ctx.static.data, keysCheckedInPage: lawCheck ? keys.length : 0, lawMismatches: lawMismatch, remap: remapRes, layer: L, row: L && L.row, registry: p.ky && p.ky.layers }, why.join('; '));

    // 4 a real touch on the entry: same tab, same host, through the pointer; back returns
    p = await probe(); let tap = null;
    if (p.entry) {
      const nav = page.waitForURL(/\/see-through\/(\d{12}\/)?(#.*)?$/, { timeout: 30000 }).then(() => true).catch(() => false);
      const tabs0 = newTabs; await tapRect(p.entry.rect); const navOk = await nav; await sleep(FIXED_WAIT);
      const url = page.url(), title = await page.title().catch(() => null);
      const shotLanding = await shot('landing');
      await page.goBack({ waitUntil: 'load', timeout: 120000 }).catch(() => {});
      await page.waitForFunction(() => /verified lines lit/.test((document.getElementById('big') || {}).textContent || ''), null, { timeout: 60000 }).catch(() => {});
      await waitAdmitted(); await sleep(FIXED_WAIT);
      const back = await probe();
      tap = { navigated: navOk, sameTab: newTabs === tabs0, url, sameHost: new URL(url).origin === new URL(EDURL).origin, title, landing: shotLanding,
        backUrl: page.url(), backIsEdition: new URL(page.url()).pathname === '/editions/' + STAMP + '/', backEntryCount: back.count, backOpenPanels: back.openPanels, backAdmitted: !!(back.ky && back.ky.admitted) };
    }
    why = [];
    if (!tap) why.push('no entry to tap'); else {
      if (!tap.navigated) why.push('the tap did not navigate to /see-through/ (url ' + tap.url + ')');
      if (!tap.sameTab) why.push('opened a new tab'); if (!tap.sameHost) why.push('left the host: ' + tap.url);
      if (tap.title !== 'See Through') why.push('landing title "' + tap.title + '"');
      if (!tap.backIsEdition) why.push('back went to ' + tap.backUrl);
      if (tap.backEntryCount !== 1) why.push('after back #kuiper-star count ' + tap.backEntryCount);
      if (tap.backOpenPanels.length) why.push('after back a panel is open: ' + tap.backOpenPanels.join(','));
    }
    record('tap', 'tap the entry: See Through opens in the same tab on the same host; back returns to the edition', why.length === 0, { ...(tap || {}), screenshot: await shot('back') }, why.join('; '));

    // 5 a deep link from a spark: the card's row carries the documented hash, and a touch lands on it
    await page.keyboard.press('e'); await sleep(2500);
    p = await probe(); let deep = null; why = [];
    if (!p.card) why.push('the card did not open on "e"');
    else {
      const body = ctx.placed[(p.card.index || 0) - 1];
      const link = p.card.links.find(l => /#key=/.test(l.hrefAttr || '')) || p.card.links[0];
      if (!body) why.push('card index ' + p.card.index + ' not in keys.json placed list');
      if (!link) why.push('the card has no <a> to see-through');
      if (body && link) {
        const u = new URL(link.hrefResolved), hm = u.hash.match(/^#key=(\d+)(?:&space=(\d+))?$/);
        const hashOk = !!hm && +hm[1] === body.key && (hm[2] == null || +hm[2] === SPACE);
        const pathOk = u.origin === new URL(EDURL).origin && u.pathname === '/see-through/' && /^\.\.\/\.\.\/see-through\/#key=/.test(link.hrefAttr);
        if (!hashOk) why.push('hash "' + u.hash + '", documented "#key=' + body.key + '" (or with &space=' + SPACE + ')');
        if (!pathOk) why.push('href "' + link.hrefAttr + '" is not ../../see-through/ on this host');
        if (link.target && link.target !== '_self') why.push('target ' + link.target);
        let apiLink = null; try { apiLink = await page.evaluate((k) => { const m = window.KY.modules['see-through']; return m && m.api && typeof m.api.link === 'function' ? m.api.link({ key: k }) : null; }, body.key); } catch (err) { apiLink = 'threw ' + err.message; }
        const shotCard = await shot('spark-card');
        const nav = page.waitForURL(/\/see-through\/(\d{12}\/)?#key=/, { timeout: 30000 }).then(() => true).catch(() => false);
        const tabs0 = newTabs; if (link.rect && link.rect.height > 0) await tapRect(link.rect); const navOk = await nav; await sleep(FIXED_WAIT);
        const landed = page.url(), landedHash = new URL(landed).hash;
        const shotDeep = await shot('deep-link-landing');
        if (!navOk) why.push('the touch on the row did not land on See Through with a #key (url ' + landed + ')');
        else if (landedHash !== u.hash) why.push('landed with hash "' + landedHash + '", the link said "' + u.hash + '"');
        if (newTabs !== tabs0) why.push('opened a new tab');
        await page.goBack({ waitUntil: 'load', timeout: 120000 }).catch(() => {}); await sleep(1500);
        const backOk = new URL(page.url()).pathname === '/editions/' + STAMP + '/'; if (!backOk) why.push('back went to ' + page.url());
        deep = { cardIndex: p.card.index, body: { key: body.key, title: body.title, repo: body.repo }, link, documented: '../../see-through/#key=' + body.key, apiLink, landed, landedHash, backUrl: page.url(), screenshots: { card: shotCard, landing: shotDeep } };
      }
    }
    record('spark', 'a deep link from a spark: the card row is ../../see-through/#key=<key>; a touch lands there with that hash; back returns', why.length === 0, deep || { card: p.card }, why.join('; '));

    // 6 zero console errors across every page this device opened
    record('errors', 'zero console errors, page errors and failed requests on every page', errors.length === 0, { errors: errors.slice(), externalUnreachable: external.slice() }, errors.length ? errors.length + ' error(s); first: [' + errors[0].kind + '] ' + errors[0].text + ' @ ' + errors[0].url : '');
  } catch (err) {
    record('harness', 'harness error', false, { error: String(err && err.stack || err) }, String(err && err.message || err));
  }
  report.pass = steps.length > 0 && steps.every(s => s.pass); report.passed = steps.filter(s => s.pass).length; report.failed = steps.filter(s => !s.pass).length;
  report.finishedAt = new Date().toISOString(); report.shots = shots;
  await context.close();
  return report;
}

// ------------------------------------------------------------------ preview (mode 'preview'): the edition as the integrator will assemble it,
// built in the scratch outdir only: index.html + team 4's loader patch (+ team 2's card patch and team 3's deletions when
// those modules are included), and a modules.json listing the chosen modules in the roadmap's integration order
// (ROADMAP.md "Integration order": loader, shell, card, layers, file, see-through, apps, drift).
const ORDER = ['kuiper-shell', 'line-card', 'layers', 'file', 'see-through', 'apps', 'drift'];
const PATCHES = { '': '04-loader/index.html.patch', 'line-card': '02-card/index.patch', 'layers': '03-layers/index.html.after-04-loader.patch' };
function buildPreview() {
  const vm = require('vm');
  const modDir = path.join(EDDIR, 'modules'), latest = {};
  for (const f of fs.readdirSync(modDir).sort()) { const m = f.match(/^(\d{12})-([a-z0-9-]+)\.js$/); if (m) latest[m[2]] = f; }
  const wanted = flag('--with') ? String(flag('--with')).split(',').map(x => x.trim()) : ORDER.filter(id => latest[id]);
  if (!wanted.includes('see-through')) wanted.push('see-through');
  const ids = ORDER.filter(id => wanted.includes(id) && latest[id]).concat(wanted.filter(id => !ORDER.includes(id) && latest[id]));
  const dir = path.join(OUT, 'preview'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(EDDIR, 'index.html'), path.join(dir, 'index.html'));
  const applied = []; let base = 'index.html on disk';
  // the loader patch is cut against the skeleton (kuiper-belt@96736f5); when index.html has moved on and refuses it, the preview
  // uses the skeleton's index.html (git show) and says so in report.preview.base
  try { cp.execFileSync('patch', ['--dry-run', '-s', '--forward', '-p3', '-d', dir, '-i', path.join(__dirname, '..', PATCHES[''])], { stdio: 'pipe' }); }
  catch (e) { try { fs.writeFileSync(path.join(dir, 'index.html'), cp.execFileSync('git', ['-C', ROOT, 'show', '96736f5:editions/' + STAMP + '/index.html'])); base = 'kuiper-belt@96736f5 editions/' + STAMP + '/index.html (the file on disk refused the loader patch)'; } catch (e2) { /* the patch below records the refusal */ } }
  for (const key of ['', 'line-card', 'layers']) { if (key && !ids.includes(key)) continue; const pf = path.join(__dirname, '..', PATCHES[key]);
    if (!fs.existsSync(pf)) { applied.push({ patch: PATCHES[key], ok: false, why: 'missing' }); continue; }
    try { const args = ['-s', '--forward', '--no-backup-if-mismatch', '-r', '-', '-p3', '-d', dir, '-i', pf];   // all hunks or none: a dry run first
      cp.execFileSync('patch', ['--dry-run'].concat(args), { stdio: 'pipe' }); cp.execFileSync('patch', args, { stdio: 'pipe' }); applied.push({ patch: PATCHES[key], ok: true }); }
    catch (e) { applied.push({ patch: PATCHES[key], ok: false, why: String(e.stdout || '') + String(e.stderr || '') }); } }
  const bytes = {};   // the modules are snapshotted at the start: other teams edit them live, and a manifest must match the bytes it serves
  const modules = ids.map(id => { const f = latest[id], b = fs.readFileSync(path.join(modDir, f)); bytes['/editions/' + STAMP + '/modules/' + f] = b; let reg = null;
    try { const sb = { window: {}, document: { readyState: 'loading', addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; } }, console: { log() {}, warn() {}, error() {} }, setTimeout() {}, addEventListener() {} };
      sb.window = sb; sb.window.KY = { register: x => { reg = x; } }; sb.KY = sb.window.KY; vm.runInNewContext(b.toString('utf8'), sb, { timeout: 2000 }); } catch (e) { /* the registration may need a live page; the regex below reads it */ }
    const t = b.toString('utf8'); const arr = re => { const m = t.match(re); return m ? (m[1].match(/'([^']+)'/g) || []).map(x => x.slice(1, -1)) : []; };
    return { id, generation: f.slice(0, 12), path: 'modules/' + f, sha256: sha256(b), bytes: b.length, byte_budget: Math.max(65536, b.length),
      requires: reg && reg.requires ? reg.requires : arr(/requires:\s*\[([^\]]*)\]/), provides: reg && reg.provides ? reg.provides : (arr(/provides:\s*\[([^\]]*)\]/).length ? arr(/provides:\s*\[([^\]]*)\]/) : [id]),
      reads: [], writes: [], creates_controls: 'none', licence: ((t.split('\n')[0].match(/\(UTC\),\s*(CERN-OHL-S-2\.0|Apache-2\.0)/) || [])[1]) || 'Apache-2.0', team: '', step: 0, proof: '' }; });
  const manifest = { schema: 'kuiper.modules.v1', edition: STAMP, hooks: 'kuiper.hooks.v1', order: ids, modules };
  fs.writeFileSync(path.join(dir, 'modules.json'), JSON.stringify(manifest, null, 1));
  for (const [u, b] of Object.entries(bytes)) fs.writeFileSync(path.join(dir, path.basename(u)), b);
  return { html: fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), manifest, bytes, applied, ids, base, loaderPatched: applied[0] && applied[0].ok };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const st = staticChecks();
  const keysJson = JSON.parse(fs.readFileSync(path.join(EDDIR, 'keys.json'), 'utf8')); const bodies = keysJson.bodies || keysJson;
  const SPACE = st.data.waferSpace || JSON.parse(fs.readFileSync(path.join(ROOT, 'cosmos', 'wafer-meta.json'), 'utf8')).address_space;
  const placed = bodies.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && b.key < SPACE);   // index.html:632, the page's own predicate
  // which mode
  const idx = await get(EDURL), man = await get(EDURL + 'modules.json');
  if (idx.status !== 200) { console.error('cannot GET ' + EDURL + ' (status ' + idx.status + '): serve the kuiper-belt root first'); process.exit(2); }
  const hasLoader = /kuiper\.hooks\.v1/.test(idx.body.toString('utf8'));
  let manifest = null; try { manifest = JSON.parse(man.body.toString('utf8')); } catch (e) { manifest = null; }
  const listed = !!(manifest && (manifest.order || []).includes('see-through'));
  const loaderPatch = fs.existsSync(path.join(__dirname, '..', PATCHES['']));
  let mode = MODE_ARG === 'auto' ? (hasLoader ? (listed ? 'integrated' : 'manifest') : (loaderPatch ? 'preview' : 'shim')) : MODE_ARG;
  const modFile = st.module && st.module.file ? path.join(ROOT, st.module.file) : null;
  const ctx = { mode, static: st, placed, modulePathFromEdition: modFile ? path.relative(EDDIR, modFile).split(path.sep).join('/') : null };
  if (modFile) { const genStamp = path.basename(modFile).slice(0, 12);
    ctx.record = { id: 'see-through', file: path.basename(modFile), generation: genStamp, path: ctx.modulePathFromEdition, sha256: st.module.sha256, bytes: st.module.bytes, byte_budget: Math.max(65536, st.module.bytes),
      requires: [], provides: ['see-through'], reads: ['data/see-through.json'], writes: [], creates_controls: ['#kuiper-star', '#kuiper-star-strip'], licence: st.module.licence || 'CERN-OHL-S-2.0', team: 5, step: 5, proof: 'handoff/05-see-through/test.cjs' }; }
  if (mode === 'preview') { ctx.preview = buildPreview(); if (!ctx.preview.loaderPatched) { process.stderr.write('[mode] preview: the loader patch did not apply; falling back to shim\n'); mode = ctx.mode = 'shim'; } }
  const out = { base: BASE, edition: EDURL, stamp: STAMP, titleMinPx: TITLE_MIN, mode, preview: ctx.preview ? { base: ctx.preview.base, ids: ctx.preview.ids, patches: ctx.preview.applied, manifest: ctx.preview.manifest.modules.map(m => ({ id: m.id, path: m.path, sha256: m.sha256, requires: m.requires, provides: m.provides })) } : null, hasLoader, manifestListsSeeThrough: listed, outdir: OUT, generatedAt: new Date().toISOString(), static: { module: st.module, data: st.data }, devices: [] };
  for (const [k, v] of Object.entries({ module: st.module, data: st.data })) process.stderr.write(`[static] ${v && v.pass ? 'PASS' : 'FAIL'} ${k}${v && v.note ? ' — ' + v.note : ''}\n`);
  process.stderr.write(`[mode] ${mode}${mode === 'shim' ? ' (no hook table in index.html yet: the test serves a minimal one, nothing on disk changes)' : ''}${mode === 'preview' ? ' base ' + ctx.preview.base + ' · modules ' + ctx.preview.ids.join(',') + ' · patches ' + ctx.preview.applied.map(a => a.patch + (a.ok ? ' ok' : ' FAILED')).join(', ') : ''}\n`);
  if (!modFile) { out.pass = false; fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); process.exit(1); }
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { for (const d of DEVICES) { out.devices.push(await runDevice(browser, d, ctx)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1)); } }
  finally { await browser.close(); }
  out.pass = !!(st.module.pass && st.data.pass && out.devices.length && out.devices.every(d => d.pass));
  out.summary = out.devices.map(d => ({ device: d.device, viewport: d.viewport, passed: d.passed, failed: d.failed, failedSteps: d.steps.filter(s => !s.pass).map(s => s.id), consoleErrors: d.consoleErrors.length, form: (d.steps.find(s => s.id === 'entry') || {}).measured ? d.steps.find(s => s.id === 'entry').measured.form : null }));
  if (IMG) {   // the hand-off's four screenshots: the entry as a title (>= 381 px), the entry as the chip (<= 380 px), the landing, the deep-link landing
    fs.mkdirSync(IMG, { recursive: true }); const pick = []; const wideD = out.devices.find(d => d.viewport.width >= TITLE_MIN), narrowD = out.devices.find(d => d.viewport.width < TITLE_MIN);
    if (wideD && wideD.shots.entry) pick.push([wideD.shots.entry, '01-entry-title-' + slug(wideD.device) + '.png']);
    if (narrowD && narrowD.shots.entry) pick.push([narrowD.shots.entry, '02-entry-chip-' + slug(narrowD.device) + '.png']);
    const any = wideD || narrowD; if (any && any.shots.landing) pick.push([any.shots.landing, '03-landing-see-through-' + slug(any.device) + '.png']);
    if (any && any.shots['deep-link-landing']) pick.push([any.shots['deep-link-landing'], '04-deep-link-key-' + slug(any.device) + '.png']);
    out.img = pick.map(([s, d]) => { const size = fitPng(s, path.join(IMG, d)); return { file: d, bytes: size, under300KB: size < 300 * 1024 }; });
    if (out.img.some(i => !i.under300KB)) out.pass = false;
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ pass: out.pass, mode: out.mode, static: { module: st.module.pass, data: st.data.pass, moduleNote: st.module.note, dataNote: st.data.note }, summary: out.summary, img: out.img }, null, 1));
  process.exit(out.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
