#!/usr/bin/env node
// test.cjs: the acceptance test of Opus team 7's module `apps` (NL-010 ROADMAP step 7, A1-A6; team-4/STEPS.md 7.1-7.5),
// in the form of FIXES/NL-009/android-journey.cjs: real touch (page.touchscreen.tap), measured assertions, one JSON
// report and a TEST.md written from it. Apache-2.0 (kuiper-belt code). Opus team 7 tester (OPUS-7 tester), 2026-11-01.
//
//   node test.cjs <edition url> <outdir> [--device NAME] [--devices "Pixel 7,Galaxy S24"] [--shots DIR] [--testmd FILE]
//                 [--edition-dir DIR] [--estate DIR] [--roots A:B:C] [--skip-keypy]
//
// <edition url> is http://127.0.0.1:<port>/editions/202611012135/ on a server of the kuiper-belt root, or of a scratch
// copy of it (until the integrator admits the module: /tmp/nl010-opus/team-7/tester/site, made by mksite.py there, team
// 6's method: loader + layers patch in a copy of index.html, modules shell, line-card, layers, file, see-through, apps).
// Devices run ONE AT A TIME (the machine is loaded). Exit 0 when every gate of every device passed, 1 otherwise, 2 on a
// harness error. NOT EVALUATED is never a pass.
//
// What is a gate (ROADMAP step 7 "Acceptance test on Android"; Opus table row 7):
//   S  (once, by script, no browser) A1: data/apps.json has 34 records; every key matches
//      ^(block:[A-Za-z0-9]+|surface:https://); the 7 block: keys equal elements@f7a92fb APPS.md:7-13 in order; the 25
//      homepage ids equal the data-entity-id set of globalgrid2050@c66759f homepage_versions/homepage_v134.html:32-56,
//      and each row's source line, link, name, kind and purpose equal that line's own words; rows that share a key name
//      each other in same_as (7.1); no APPS.md title or description is copied (Q1); the two graphs in data/graphs/ are
//      the only files there and hash as the spider row records (Q5). A4 data: data/elements.json lists the catalogue's
//      244 symbols in order, 221 placed with a key inside the wafer row of their commit (cosmos/wafer.tsv), 23 named
//      with a reason and no files in the catalogue; no catalogue title or description copied (Q1); python tools/key.py
//      on three sampled elements returns the recorded repository, commit and path.
//   M  the loader admitted `apps`, nothing refused.
//   A2 the bar keeps step 1's six titles (FILE EDIT VIEW SCOPE WAFER ABOUT), none names apps; FILE > Open an app (real
//      tap) opens #ky-apps under the bar; 34 rows, each >= 44 px, each row's first visible line is its key; the first
//      row's header is a key; a row with a failed link says FAIL and is never hidden.
//   A3 the See Through row navigates in the same tab to ../../see-through/ (200, title "See Through"); goBack() returns
//      to the edition with no panel open.
//   A4 the readout says "221 elements placed, 23 counted, not placed" (and "606 in the live register, 244 catalogued");
//      inspect() agrees; while Q1 is open (layers.json elements licence UNSETTLED) the WAFER row of `elements` reads
//      REFUSED · licence unsettled and its control is disabled; the card from the periodic-table panel (if the module has
//      one): first line = the element's line_text, second = block:<Sym>.
//   A5 the spider row opens its dashboard link (that one URL is answered by a stub; the test asserts the URL); the spider
//      layer, switched on by a real tap, is OK and draws the overview's 15 edges; the readout names the periodic-table
//      nodes with no key; with data/graphs/* answered 404 (routed; nothing deleted) the row is FAIL naming the file and
//      the wafer still draws.
//   A6 the whole device run, every step above, runs with every off-origin request blocked (ctx.route abort); the
//      blocked requests are listed.
//   E  zero pageerrors, zero console errors and zero failed same-origin requests on the edition during the device run
//      (the only allowed ones are the 404s of the routed data/graphs negative case; See Through's own console is listed,
//      not counted, it is not this module's page).
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');

const argv = process.argv.slice(2), VALUED = ['--device', '--devices', '--shots', '--testmd', '--edition-dir', '--estate', '--roots'];
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUED.includes(argv[i - 1])));
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? (argv[i + 1] || true) : null; };
if (pos.length < 2) { console.error('usage: node test.cjs <edition url> <outdir> [--device NAME] [--devices A,B] [--shots DIR] [--testmd FILE]'); process.exit(2); }
const URL0 = pos[0].replace(/\/?$/, '/'), OUT = path.resolve(pos[1]);
const SHOTS = flag('--shots') ? path.resolve(String(flag('--shots'))) : null, TESTMD = flag('--testmd') ? path.resolve(String(flag('--testmd'))) : null;
let DEVICES = ['Pixel 7', 'Galaxy S24'];
if (flag('--device')) DEVICES = [String(flag('--device'))];
if (flag('--devices')) DEVICES = String(flag('--devices')).split(',').map(s => s.trim()).filter(Boolean);
const STAMP = (URL0.match(/editions\/(\d{12})\//) || [])[1];
const ORIGIN = new URL(URL0).origin;
const KB = '/home/user/estate/kuiper-belt';
const ED = path.resolve(String(flag('--edition-dir') || (KB + '/editions/' + STAMP)));
const ESTATE = path.resolve(String(flag('--estate') || '/home/user/estate'));
const ROOTS = String(flag('--roots') || '/tmp/nl010-opus/team-7/builder/clones:/home/user/estate:/home/user').split(':').filter(Boolean);
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const SETTLE = 7000, LONG = 300000;
const KEY_RE = /^(block:[A-Za-z0-9]+|surface:https:\/\/)/;
const SRC = { elements: 'f7a92fb085c38dcbbd5cb469a66cd5ca61fb95bf', homepage: 'c66759f0d7ac3489df9158da6eaa1330a37c069f', testcode: 'd09c185c8dacbc5c73afb2b0d0d8dad40745a544' };
const SEE_THROUGH_KEY = 'surface:https://ventusltd.github.io/kuiper-belt/see-through/';
const README_606 = '606 in the live register, 244 catalogued', README_221 = '221 elements placed, 23 counted, not placed';
// file.js's EVIDENCE rows (Opus team 6) HEAD these; the integrator writes the missing ones at assembly (ROADMAP step 6, 10)
const EVIDENCE = ['keys.json', 'proof/edition-sha256.txt', 'proof/keys-summary.json', 'modules.json', 'LICENCES.md', 'proof/android-journey.json', 'README.md'];
const ALLOW_EVIDENCE = argv.includes('--allow-missing-evidence');
const STUB = '<!DOCTYPE html><meta charset="utf-8"><title>stub</title><p>off-origin dashboard: the test asserts the URL only</p>';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const git = (repo, ...a) => cp.execFileSync('git', ['-C', repo, ...a], { maxBuffer: 1 << 28 }).toString('utf8');
const dec = s => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const short = (v, n) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s && s.length > (n || 400) ? s.slice(0, n || 400) + '…' : s; };
fs.mkdirSync(OUT, { recursive: true });

const report = { test: 'handoff/07-apps/test.cjs', url: URL0, stamp: STAMP, started: new Date().toISOString(), edition_dir: ED, script: [], devices: {}, files: {} };
let allPass = true;
const sstep = (id, pass, measured) => { report.script.push({ id, result: pass === null ? 'NOT EVALUATED' : (pass ? 'PASS' : 'FAIL'), measured }); if (pass !== true) allPass = false; };

// ======================================================================== S: by script, against the sources (A1, A4 data)
async function scriptChecks() {
  const get = async f => { const r = await fetch(URL0 + f, { cache: 'no-store' }); if (!r.ok) throw new Error(f + ' HTTP ' + r.status); return Buffer.from(await r.arrayBuffer()); };
  for (const f of ['index.html', 'modules.json', 'modules/202611012309-apps.js', 'data/apps.json', 'data/elements.json', 'data/graphs/overview.json', 'data/graphs/periodic-table.json']) {
    try { const b = await get(f); report.files[f] = { sha256: sha256(b), bytes: b.length }; } catch (e) { report.files[f] = { error: e.message }; } }
  // ---- A1 apps.json
  let A; try { A = JSON.parse(await get('data/apps.json')); } catch (e) { sstep('A1 data/apps.json served and parses', false, e.message); return; }
  const rows = A.apps || [];
  const bad = rows.filter(r => !KEY_RE.test(String(r.key)));
  const ids = rows.map(r => r.id), dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
  sstep('A1 34 records, every key matches ^(block:[A-Za-z0-9]+|surface:https://), ids unique', rows.length === 34 && bad.length === 0 && dupIds.length === 0 && (A.counts || {}).total === 34,
    { records: rows.length, counts: A.counts, bad_keys: bad.map(r => r.key), duplicate_ids: dupIds });
  // block rows against APPS.md:7-13
  const appsMd = git(ESTATE + '/elements', 'show', SRC.elements + ':APPS.md').split('\n');
  const mdKeys = appsMd.slice(6, 13).map(l => (l.match(/^\|\s*`(block:[A-Za-z0-9]+)`/) || [])[1]);
  const blockRows = rows.filter(r => /^block:/.test(r.key));
  const blockOk = blockRows.length === 7 && blockRows.every((r, i) => r.key === mdKeys[i] && r.source === 'elements@f7a92fb APPS.md:' + (7 + i));
  sstep('A1 the 7 block: keys equal elements@f7a92fb APPS.md:7-13 (order, source line)', blockOk, { apps_md: mdKeys, rows: blockRows.map(r => [r.key, r.source]) });
  // Q1: nothing of APPS.md but the key
  const appsText = JSON.stringify(A);
  const mdCells = appsMd.slice(6, 13).map(l => l.split('|').map(c => c.trim())).map(c => ({ title: c[2], description: c[7] }));
  const leaked = mdCells.filter(c => (c.title && appsText.includes(c.title)) || (c.description && appsText.includes(c.description)));
  sstep('A1 Q1: no APPS.md title or description copied into apps.json', leaked.length === 0, { leaked: leaked.map(c => c.title) });
  // homepage rows against homepage_v134.html:32-56
  const hp = git(ESTATE + '/globalgrid2050', 'show', SRC.homepage + ':homepage_versions/homepage_v134.html').split('\n');
  const hpRows = [];
  for (let n = 32; n <= 56; n++) { const l = hp[n - 1] || ''; const id = (l.match(/data-entity-id="([^"]+)"/) || [])[1]; if (!id) continue;
    const a = l.match(/<th[^>]*>\s*<a href="([^"]+)">([\s\S]*?)<\/a>/) || [];
    hpRows.push({ line: n, id, link: dec(a[1] || ''), name: dec((a[2] || '').replace(/<[^>]+>/g, '')).trim(), kind: dec((l.match(/<summary>([^<]*)<\/summary>/) || [])[1] || ''),
      purpose: dec(((l.match(/<p>Intended purpose: ([\s\S]*?)<\/p>/) || [])[1] || '').replace(/<[^>]+>/g, '')).trim() }); }
  const hpIds = new Set(hpRows.map(h => h.id)), homeRows = rows.filter(r => r.key_source === 'homepage' || hpIds.has(r.id));
  const setEq = homeRows.length === 25 && hpRows.length === 25 && homeRows.every(r => hpIds.has(r.id)) && new Set(homeRows.map(r => r.id)).size === 25;
  sstep('A1 the 25 homepage ids equal the data-entity-id set of homepage_v134.html:32-56', setEq, { homepage_ids: hpRows.length, rows: homeRows.length, missing: [...hpIds].filter(i => !homeRows.some(r => r.id === i)), extra: homeRows.filter(r => !hpIds.has(r.id)).map(r => r.id) });
  const diffs = [], linkNotes = [];
  for (const h of hpRows) { const r = rows.find(x => x.id === h.id); if (!r) continue;
    // the link is the source's href, or (recorded as source_href) the stable folder above a 12-digit version folder (7.1
    // "its stable link"), or withheld under K1 (a folder named like a repository that is not public; the URL is not printed)
    let link = h.link, how = 'href';
    if (r.source_href === h.link && h.link.startsWith(r.link) && /^\d{12}\/$/.test(h.link.slice(r.link.length))) { link = r.link; how = 'stable folder of source_href'; }
    else if (r.link_withheld && r.link === 'https://globalgrid2050.com/not-public/' && r.link !== h.link) { link = r.link; how = 'withheld (K1): ' + short(r.link_withheld, 80); }
    if (how !== 'href') linkNotes.push({ id: h.id, how });
    const want = { key: 'surface:' + link, link, name: h.name, kind: h.kind, purpose: h.purpose, source: 'globalgrid2050@c66759f homepage_versions/homepage_v134.html:' + h.line };
    for (const k of Object.keys(want)) if (r[k] !== want[k]) diffs.push({ id: h.id, field: k, row: short(r[k], 120), source: k === 'key' || k === 'link' ? '(the source href)' : short(want[k], 120) }); }
  sstep('A1 each homepage row = its source line (key surface:<link>, link = href or its stable folder or K1-withheld, name, kind, purpose, source line)', diffs.length === 0, { differences: diffs.slice(0, 20), count: diffs.length, link_notes: linkNotes });
  // same_as for shared keys
  const byKey = {}; rows.forEach(r => { (byKey[r.key] = byKey[r.key] || []).push(r); });
  const shared = Object.values(byKey).filter(g => g.length > 1);
  const sameOk = shared.every(g => g.every(r => g.filter(o => o !== r).every(o => (r.same_as || []).some(s => s === o.id || s === o.key || (s && (s.id === o.id || s.key === o.key))))));
  sstep('A1 rows that share a key cross-reference each other in same_as (7.1), never merged', sameOk, { shared: shared.map(g => ({ key: g[0].key, ids: g.map(r => r.id), same_as: g.map(r => r.same_as) })) });
  // the two issued rows
  const sp = rows.find(r => r.id === 'spider-sandbox'), pt = rows.find(r => r.id === 'periodic-table');
  const idx = git(ESTATE + '/testcode', 'show', SRC.testcode + ':spider/INDEX.md').split('\n')[12] || '';
  const v5 = (idx.match(/`([^`]*v5[^`]*)`/) || [])[1];
  sstep('A1 spider-sandbox row = testcode@d09c185 spider/INDEX.md:13 (v5), periodic-table row key surface:https://ventusltd.github.io/stars/blocks/',
    !!sp && !!pt && !!v5 && sp.source === 'testcode@d09c185 spider/INDEX.md:13' && String(sp.link).includes(v5) && pt.key === 'surface:https://ventusltd.github.io/stars/blocks/',
    { spider: sp && { key: sp.key, link: sp.link, source: sp.source }, v5, periodic: pt && { key: pt.key, source: pt.source } });
  // Q5 graphs
  let gfiles = []; try { gfiles = fs.readdirSync(ED + '/data/graphs').sort(); } catch (e) { gfiles = ['ERR ' + e.message]; }
  const rec = (sp && sp.graphs) || [];
  const gOk = JSON.stringify(gfiles) === JSON.stringify(['overview.json', 'periodic-table.json']) && rec.length === 2
    && rec.every(g => report.files[g.file] && report.files[g.file].sha256 === g.sha256 && report.files[g.file].bytes === g.bytes);
  let ov = null; try { ov = JSON.parse(await get('data/graphs/overview.json')); } catch (e) {}
  const ovN = ov ? (ov.nodes || []).length : null, ovE = ov ? (ov.edges || ov.links || []).length : null;
  sstep('A1 Q5: data/graphs holds exactly the two DISCLOSED graphs, each hashing as the spider row records; overview 16 nodes 15 edges',
    gOk && ovN === 16 && ovE === 15, { files: gfiles, recorded: rec.map(g => ({ file: g.file, sha256: g.sha256, bytes: g.bytes, status: g.status })), served: { overview: report.files['data/graphs/overview.json'], periodic: report.files['data/graphs/periodic-table.json'] }, overview: { nodes: ovN, edges: ovE } });

  // ---- A4 data: elements.json against the catalogue and the wafer
  let E; try { E = JSON.parse(await get('data/elements.json')); } catch (e) { sstep('A4 data/elements.json served and parses', false, e.message); return; }
  const cat = JSON.parse(git(ESTATE + '/elements', 'show', SRC.elements + ':catalogue/elements.json'));
  const files0 = c => { let f = c.files; if (typeof f === 'string') { try { f = JSON.parse(f.replace(/'/g, '"')); } catch (e) { f = f === '[]' ? [] : [f]; } } return Array.isArray(f) ? f : []; };
  const els = E.elements || [];
  const symsEq = els.length === cat.length && els.every((e, i) => e.sym === cat[i].key);
  const placed = els.filter(e => e.placed === true && Number.isFinite(e.key)), named = els.filter(e => !(e.placed === true && Number.isFinite(e.key)));
  const namedNoFiles = named.every(e => { const c = cat.find(x => x.key === e.sym); return c && files0(c).length === 0 && e.why; });
  const byKind = {}; named.forEach(e => { const c = cat.find(x => x.key === e.sym); byKind[c.kind] = (byKind[c.kind] || 0) + 1; });
  sstep('A4 elements.json: the catalogue\'s 244 symbols in order; 221 placed; 23 named with a reason, none with files in the catalogue',
    symsEq && placed.length === 221 && named.length === 23 && namedNoFiles && E.counts && E.counts.placed === 221 && E.counts.named === 23 && E.readout === README_221,
    { total: els.length, catalogue: cat.length, placed: placed.length, named: named.length, by_kind_unplaced: byKind, counts: E.counts, readout: E.readout, named_syms: named.map(e => e.sym) });
  // every placed key inside the wafer row of its commit
  const wafer = fs.readFileSync(KB + '/cosmos/wafer.tsv', 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => l.split('\t'));
  const names = Object.fromEntries(fs.readFileSync(KB + '/cosmos/repos.tsv', 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => l.split('\t')).map(p => [+p[0], p[1]]));
  let k = 0; const rowsW = wafer.map(p => { k += +p[4]; const r = { lines: +p[1], name: names[+p[2]], sha12: p[3], k0: k }; k += r.lines; return r; });
  const SPACE = k, offWafer = [];
  for (const e of placed) { const w = rowsW[e.wafer_row]; if (!w || w.name !== e.repo || !String(e.commit).startsWith(w.sha12) || w.k0 !== e.k0 || !(e.key >= w.k0 && e.key < w.k0 + w.lines) || !(e.key < SPACE)) offWafer.push(e.sym); }
  sstep('A4 every placed key lies inside the cosmos/wafer.tsv row of its recorded repository and commit', offWafer.length === 0, { placed: placed.length, outside: offWafer.slice(0, 20), address_space: SPACE });
  // the code line (line_text), its path and its GitHub address are the code's own words, licensed by its repository: excluded
  const elText = JSON.stringify(Object.assign({}, E, { elements: els.map(e => { const o = Object.assign({}, e); delete o.line_text; delete o.path; delete o.github; return o; }), checks: null, checks_keypy: null })), leakedE = cat.filter(c => (c.title && c.title.length >= 16 && elText.includes(c.title)) || (c.description && c.description.length >= 24 && elText.includes(c.description)));
  sstep('A4 Q1: no catalogue title or description copied into elements.json', leakedE.length === 0, { leaked: leakedE.slice(0, 10).map(c => c.key + ' ' + c.title) });
  // python tools/key.py on three sampled elements (ROOTS patched to a folder of links; key.py itself untouched)
  if (argv.includes('--skip-keypy')) { sstep('A4 python tools/key.py on three sampled elements', null, 'skipped by --skip-keypy'); return; }
  const rootDir = path.join(OUT, 'roots'); fs.mkdirSync(rootDir, { recursive: true });
  const hasCommit = (d, sha) => { try { cp.execFileSync('git', ['-C', d, 'cat-file', '-e', sha + '^{commit}'], { stdio: 'ignore' }); return true; } catch (e) { return false; } };
  const linkRepo = (name, sha) => { for (const r of ROOTS) { const d = path.join(r, name); if (fs.existsSync(path.join(d, '.git')) && hasCommit(d, sha)) { const l = path.join(rootDir, name); try { fs.unlinkSync(l); } catch (e) {} fs.symlinkSync(d, l); return d; } } return null; };
  const cand = [0, Math.floor(placed.length / 2), placed.length - 1].concat(placed.map((_, i) => i)), picked = [], seenRepo = new Set();
  for (const i of cand) { const e = placed[i]; if (!e || picked.includes(e) || seenRepo.has(e.repo)) continue; if (linkRepo(e.repo, e.commit)) { picked.push(e); seenRepo.add(e.repo); } if (picked.length === 3) break; }
  const kp = [];
  for (const e of picked) {
    let out = '', code = 0;
    try { out = cp.execFileSync('python3', ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import key; key.ROOTS = sys.argv[2]; sys.argv = ["key.py", sys.argv[3]]; sys.exit(key.main())', KB + '/tools', rootDir, String(e.key)], { cwd: KB, maxBuffer: 1 << 26, timeout: 900000 }).toString(); }
    catch (x) { out = String((x.stdout || '') + (x.stderr || '')); code = x.status || 1; }
    const m = out.match(/key [\d,]+ -> (\S+) \/ ([0-9a-f]{12}) \/ line[\s\S]*?\n\s+(.+?) : (\d+)\s+\(blob/);
    kp.push({ sym: e.sym, key: e.key, exit: code, repo: m && m[1], sha12: m && m[2], path: m && m[3], line: m && +m[4], ok: !!m && code === 0 && m[1] === e.repo && e.commit.startsWith(m[2]) && m[3] === e.path && +m[4] === 1, out: short(out.split('\n').slice(1).join(' | '), 300) });
  }
  sstep('A4 python tools/key.py on three sampled elements returns the recorded repository, commit and path (line 1)', kp.length === 3 && kp.every(x => x.ok), { samples: kp, roots: ROOTS });
}

// ======================================================================== in-page probes
function launcherProbe() {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1), height: +r.height.toFixed(1) }; };
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
  const bar = document.getElementById('kuiper-menu-bar'), L = document.getElementById('ky-apps');
  const rows = L ? [...L.querySelectorAll('[data-key]')] : [];
  const firstLine = el => { const t = (el.innerText || el.textContent || '').split('\n').map(s => s.trim()).filter(Boolean); return t[0] || ''; };
  return { open: vis(L), bar: R(bar), launcher: R(L), rows: rows.map(r => ({ key: r.getAttribute('data-key'), id: r.getAttribute('data-id'), header: firstLine(r), h: +r.getBoundingClientRect().height.toFixed(1),
    st: r.querySelector('[data-st]') ? r.querySelector('[data-st]').textContent.trim() : null, hidden: getComputedStyle(r).display === 'none' || getComputedStyle(r).visibility === 'hidden' })) };
}
function readoutText() {
  let t = ''; try { t += (KY.hooks.hud && KY.hooks.hud.textContent || '') + '\n'; } catch (e) {}
  return t + (document.body.innerText || '') + '\n' + [...document.querySelectorAll('#hud, #big, #sub, #ky-apps')].map(e => e.textContent).join('\n');
}
async function waferLit(page) {
  const b64 = (await page.screenshot({ timeout: 180000, scale: 'css' })).toString('base64');
  return page.evaluate(async ({ b64 }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const W = innerWidth, H = innerHeight, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
    const bar = document.getElementById('kuiper-menu-bar'), y0 = Math.ceil(bar ? bar.getBoundingClientRect().bottom : 0) + 2, d = g.getImageData(0, y0, W, H - y0).data;
    let lit = 0; for (let i = 0; i < d.length; i += 4) if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] > 34) lit++;
    return { litFraction: +(lit / (d.length / 4)).toFixed(4), litPx: lit };
  }, { b64 });
}

// ======================================================================== one device
async function runDevice(browser, DEV) {
  const R = report.devices[DEV] = { steps: [], errors: [], console_errors: [], failed_local: [], expected_404: [], blocked_offorigin: [], see_through_console: [], shots: [], evidence_404: [], aborted_local: [] };
  const step = (id, pass, measured) => { R.steps.push({ id, result: pass === null ? 'NOT EVALUATED' : (pass ? 'PASS' : 'FAIL'), measured }); if (pass !== true) allPass = false; console.error('[' + DEV + '] ' + (pass === null ? 'NOT EVALUATED' : pass ? 'PASS' : 'FAIL') + '  ' + id); };
  const slug = DEV.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();
  let spiderLink = null, allow404 = null;
  async function newPage() {
    const ctx = await browser.newContext({ ...devices[DEV], locale: 'en-GB' });
    await ctx.route('**/*', route => { const u = route.request().url();
      if (u.startsWith(ORIGIN + '/') || u.startsWith('data:') || u.startsWith('blob:')) { if (allow404 && allow404.test(u)) { if (!R.expected_404.includes(u)) R.expected_404.push(u); return route.fulfill({ status: 404, contentType: 'text/plain', body: 'routed 404 (test A5 negative case)' }); } return route.continue(); }
      if (spiderLink && u === spiderLink && route.request().isNavigationRequest()) return route.fulfill({ status: 200, contentType: 'text/html', body: STUB });
      R.blocked_offorigin.push(route.request().method() + ' ' + u.slice(0, 200)); return route.abort('blockedbyclient'); });
    const p = await ctx.newPage(); p.setDefaultTimeout(LONG);
    const onEd = () => p.url().startsWith(URL0);
    p.on('pageerror', e => { (onEd() ? R.errors : R.see_through_console).push('pageerror ' + String(e.message || e).slice(0, 300)); });
    p.on('console', m => { if (m.type() !== 'error') return; const t = m.text().slice(0, 300), u = (m.location() || {}).url || '';
      if (!onEd()) { R.see_through_console.push(t + ' @ ' + u); return; }
      if (/status of 404/.test(t) && allow404 && allow404.test(u)) return;          // the routed negative case, listed in expected_404
      if (/status of 404/.test(t) && EVIDENCE.some(f => u === URL0 + f)) { if (!R.evidence_404.includes(u)) R.evidence_404.push(u); return; }   // team 6's rows, the integrator's files
      R.console_errors.push(t + (u ? ' @ ' + u : '')); });
    p.on('requestfailed', q => { const u = q.url(); if (!u.startsWith(ORIGIN + '/')) return; const f = q.failure(); if (f && /ERR_ABORTED/.test(f.errorText) && q.isNavigationRequest()) return; (f && /ERR_ABORTED/.test(f.errorText) ? R.aborted_local : R.failed_local).push(u + ' ' + (f && f.errorText)); });
    p.on('response', r => { const u = r.url(); if (u.startsWith(ORIGIN + '/') && r.status() >= 400 && !(allow404 && allow404.test(u)) && !(r.status() === 404 && EVIDENCE.some(f => u === URL0 + f)) && onEd()) R.failed_local.push(u + ' HTTP ' + r.status()); });
    return p;
  }
  async function ready(p) {
    await p.waitForFunction(() => { const s = window.__KUIPER_EDITION__; return s && s.done && window.KY && KY.hooks && KY.hooks.N > 0; }, null, { timeout: LONG, polling: 1000 });
    await p.waitForFunction(() => { try { const l = KY.modules.layers.api.get('lines'); return l && l.status === 'OK' && document.getElementById('kuiper-menu-bar'); } catch (e) { return false; } }, null, { timeout: LONG, polling: 1000 }).catch(() => {});
    await sleep(SETTLE);
  }
  const tapSel = async (p, sel) => { const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded({ timeout: 60000 }); const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel); await p.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 22)); return b; };
  const openMenu = async (p, n) => { const open = await p.evaluate(m => { const b = document.getElementById('kuiper-menu-bar'); return !!b && b.getAttribute('data-open') === m; }, n); if (!open) { await tapSel(p, '#kuiper-menu-bar .gm-menu[data-menu="' + n + '"] > .gm-title'); await sleep(1200); } };
  const closeMenus = async p => { await p.evaluate(() => { try { const s = KY.modules['kuiper-shell'] && KY.modules['kuiper-shell'].api; if (s && s.close) s.close(); } catch (e) {} }); await sleep(800); };
  const shot = async (p, name) => { const dir = SHOTS && DEV === 'Pixel 7' ? SHOTS : path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, (SHOTS && DEV === 'Pixel 7' ? '' : slug + '-') + name + '.png');
    try { await p.screenshot({ path: f, scale: 'css', timeout: 180000 }); R.shots.push({ file: f, bytes: fs.statSync(f).size }); } catch (e) { R.errors.push('screenshot ' + name + ': ' + e.message); } };
  const launcherOpen = p => p.evaluate(() => { const L = document.getElementById('ky-apps'); return !!L && getComputedStyle(L).display !== 'none' && L.getBoundingClientRect().height > 0; });
  const closeLauncher = async p => { if (await launcherOpen(p)) { await tapSel(p, '#ky-apps button.ky-x'); await sleep(1200); } };
  const inspect = p => p.evaluate(() => { try { return KY.modules.apps.api.inspect(); } catch (e) { return { error: String(e) }; } });
  const layer = (p, id) => p.evaluate(i => { try { const g = KY.modules.layers.api.get(i); const lab = document.querySelector('label.ky-ly[data-id="' + i + '"]');
    return { status: g && g.status, why: g && g.why, row: lab ? lab.querySelector('.st').textContent.trim() : null, disabled: lab ? lab.querySelector('input').disabled : null, checked: lab ? lab.querySelector('input').checked : null }; } catch (e) { return { error: String(e) }; } }, id);
  const layersJson = JSON.parse(fs.readFileSync(ED + '/data/layers.json', 'utf8'));
  const elRec = (layersJson.layers || layersJson.records || []).find(l => l.id === 'elements') || {};
  const Q1open = !elRec.licence || /^UNSETTLED/i.test(elRec.licence);
  const apps = JSON.parse(fs.readFileSync(ED + '/data/apps.json', 'utf8')).apps;
  spiderLink = (apps.find(a => a.id === 'spider-sandbox') || {}).link || null;
  const elements = JSON.parse(fs.readFileSync(ED + '/data/elements.json', 'utf8')).elements || [];
  let p;
  try {
    // ------------------------------------------------------------------ arrival
    p = await newPage(); const t0 = Date.now(); await p.goto(URL0, { timeout: LONG }); await ready(p);
    const ed = await p.evaluate(() => ({ admitted: (__KUIPER_EDITION__.admitted || []).map(a => a.id || a), refused: __KUIPER_EDITION__.refused || [] }));
    step('M the loader admitted apps, nothing refused', ed.admitted.includes('apps') && ed.refused.length === 0, Object.assign({ ready_s: Math.round((Date.now() - t0) / 1000) }, ed));
    // ------------------------------------------------------------------ A2
    const bar = await p.evaluate(() => ({ buttons: [...document.querySelectorAll('#kuiper-menu-bar button.gm-title')].map(b => b.textContent.trim()), all: [...document.querySelectorAll('#kuiper-menu-bar .gm-title')].map(b => b.textContent.trim()) }));
    step('A2 the bar keeps step 1\'s six titles; no bar title names apps', JSON.stringify(bar.buttons.map(s => s.toUpperCase())) === JSON.stringify(['FILE', 'EDIT', 'VIEW', 'SCOPE', 'WAFER', 'ABOUT']) && !bar.all.some(s => /app|launch|periodic|spider/i.test(s)), bar);
    await openMenu(p, 'file'); await tapSel(p, '#ky-file-open-app');
    await p.waitForFunction(() => { const L = document.getElementById('ky-apps'); return L && getComputedStyle(L).display !== 'none' && L.querySelectorAll('[data-key]').length > 0; }, null, { timeout: 120000, polling: 500 }).catch(() => {});
    await sleep(4000);
    const L1 = await p.evaluate(launcherProbe);
    const keys = apps.map(a => a.key), rowKeys = L1.rows.map(r => r.key);
    const headerOk = L1.rows.length > 0 && L1.rows.every(r => r.header === r.key);
    step('A2 FILE > Open an app (real tap) opens #ky-apps under the bar', L1.open && L1.launcher && L1.bar && L1.launcher.top >= L1.bar.bottom - 0.5, { bar: L1.bar, launcher: L1.launcher });
    step('A2 34 rows, one per apps.json record (FAIL rows never hidden), every row >= 44 px', L1.rows.length === 34 && apps.every(a => L1.rows.some(r => r.key === a.key && (r.id == null || r.id === a.id))) && L1.rows.every(r => r.h >= 44 && !r.hidden),
      { rows: L1.rows.length, min_h: L1.rows.length ? Math.min(...L1.rows.map(r => r.h)) : null, under44: L1.rows.filter(r => r.h < 44).map(r => r.id || r.key), hidden: L1.rows.filter(r => r.hidden).map(r => r.id), states: L1.rows.reduce((o, r) => { const s = (r.st || 'none').split(/[\s·:]/)[0]; o[s] = (o[s] || 0) + 1; return o; }, {}) });
    step('A2 each row\'s first visible line is its key; the first row\'s header is a key', headerOk && KEY_RE.test(L1.rows[0].header) && keys.includes(L1.rows[0].header),
      { first_row: L1.rows[0], mismatches: L1.rows.filter(r => r.header !== r.key).slice(0, 5) });
    await shot(p, 'launcher');
    // one panel at a time (step 1: a real tap opens exactly one panel): WAFER tapped while the launcher is open closes it
    await tapSel(p, '#kuiper-menu-bar .gm-menu[data-menu="wafer"] > .gm-title'); await sleep(1500);
    const one = await p.evaluate(() => { const L = document.getElementById('ky-apps'), b = document.getElementById('kuiper-menu-bar');
      return { launcherOpen: !!L && getComputedStyle(L).display !== 'none' && L.getBoundingClientRect().height > 0, menuOpen: b && b.getAttribute('data-open') }; });
    step('A2 one panel at a time: a real tap on WAFER while the launcher is open closes the launcher', !one.launcherOpen && one.menuOpen === 'wafer', one);
    await closeLauncher(p);
    // ------------------------------------------------------------------ A4 readout, elements row, inspect
    const txt = await p.evaluate(readoutText), ins = await inspect(p);
    const ie = ins.elements || {};
    step('A4 the readout says "' + README_221 + '" and "' + README_606 + '"; inspect() 221 / 23 / 244', txt.includes(README_221) && txt.includes(README_606) && ie.placed === 221 && ie.named === 23 && ie.total === 244,
      { has221: txt.includes(README_221), has606: txt.includes(README_606), inspect_elements: ie });
    await closeLauncher(p); await closeMenus(p); await openMenu(p, 'wafer'); await sleep(1500);
    const el = await layer(p, 'elements');
    if (Q1open) step('A4 Q1 open: the elements row reads REFUSED · licence unsettled, its control disabled', el.status === 'REFUSED' && /REFUSED/.test(el.row || '') && /licence unsettled/.test(el.row || '') && el.disabled === true, el);
    else step('A4 Q1 answered: the elements layer loads, 221 of 244', el.status === 'OK' && /221/.test(el.row || ''), el);
    await p.evaluate(() => { const lab = document.querySelector('label.ky-ly[data-id="elements"]'); if (lab) lab.scrollIntoView({ block: 'center' }); });
    await sleep(800); await shot(p, 'table-layer');
    // ------------------------------------------------------------------ A5 spider layer by a real tap
    const ovPx = () => p.evaluate(() => { const o = document.getElementById('o'); if (!o || !o.width) return null; const d = o.getContext('2d').getImageData(0, 0, o.width, o.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; });
    const px0 = await ovPx();
    await p.evaluate(() => { const lab = document.querySelector('label.ky-ly[data-id="spider"]'); if (lab) lab.scrollIntoView({ block: 'center' }); }); await sleep(600);
    await tapSel(p, 'label.ky-ly[data-id="spider"]');
    await p.waitForFunction(() => { try { const s = KY.modules.layers.api.get('spider').status; return s === 'OK' || s === 'FAIL' || s === 'EMPTY' || s === 'REFUSED'; } catch (e) { return false; } }, null, { timeout: LONG, polling: 1000 }).catch(() => {});
    await sleep(SETTLE);
    const sl = await layer(p, 'spider'), ins2 = await inspect(p), g = (ins2.spider && ins2.spider.graphs) || {}, go = g.overview || {}, gp = g['periodic-table'] || {};
    const noKey = Number.isFinite(gp.no_key) ? gp.no_key : gp.nokey;
    const txt2 = await p.evaluate(readoutText), px1 = await ovPx();
    const nokeyLine = (txt2.split('\n').find(l => /periodic/i.test(l) && /no key/i.test(l)) || null);
    step('A5 the spider layer (real tap) is OK and draws the overview\'s 15 edges (inspect: 16 nodes, 15 edges, 15 drawn)', sl.status === 'OK' && sl.checked === true && go.nodes === 16 && go.edges === 15 && go.drawn === 15,
      { layer: sl, overview: go, overlay_px_off: px0, overlay_px_on: px1 });
    step('A5 the readout names how many periodic-table nodes had no key (663 nodes, 2,481 edges)', !!nokeyLine && gp.nodes === 663 && gp.edges === 2481 && Number.isFinite(noKey) && nokeyLine.replace(/,/g, '').includes(String(noKey)),
      { line: nokeyLine, periodic: gp });
    await shot(p, 'spider-layer');
    // ------------------------------------------------------------------ A4 card from the periodic-table panel (if any)
    await closeLauncher(p); await closeMenus(p);
    await openMenu(p, 'file'); await tapSel(p, '#ky-file-open-app'); await sleep(3000);
    const ptRow = '#ky-apps [data-id="periodic-table"] button.ky-app-w';   // "keys ▸": the panel; the row's link would leave the page
    if (await p.locator(ptRow).count()) { await tapSel(p, ptRow); await sleep(3000); }
    const nEl = await p.locator('#ky-apps-elements [data-sym]').count();
    if (!nEl) step('A4 card from the periodic-table panel: first line = line_text, second = block:<Sym>', null, { why: 'no #ky-apps-elements [data-sym] rows after tapping the periodic-table row (and the REFUSED layer draws no sparks while Q1 holds)' });
    else {
      const cards = [];
      const symsOnPage = await p.evaluate(() => [...document.querySelectorAll('#ky-apps-elements [data-sym]')].map(e => e.getAttribute('data-sym')));
      const want = elements.filter(e => e.placed && symsOnPage.includes(e.sym)); const pick = [want[0], want[Math.floor(want.length / 2)], want[want.length - 1]].filter(Boolean);
      for (const e of pick) {
        if (!(await p.evaluate(() => { const L = document.getElementById('ky-apps'); return L && getComputedStyle(L).display !== 'none'; }))) { await openMenu(p, 'file'); await tapSel(p, '#ky-file-open-app'); await sleep(2500); if (await p.locator(ptRow).count()) { await tapSel(p, ptRow); await sleep(2500); } }
        await tapSel(p, '#ky-apps-elements [data-sym="' + e.sym + '"]'); await sleep(SETTLE);
        // the first visible text node of the card is the header (the card law), its text = line_text; the next = block:<Sym>
        const c = await p.evaluate(() => { const c = document.getElementById('card'); if (!c || getComputedStyle(c).display === 'none') return { open: false };
          const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT), t = []; let n;
          while ((n = w.nextNode()) && t.length < 6) { const el = n.parentElement; if (!n.textContent.trim() || !el || el.closest('style,script') || !el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
            const blk = el.closest('.ky-ec-h, .ky-ec-s, .lc-h, div, p, li') || el; if (t.length && t[t.length - 1].blk === blk) { t[t.length - 1].text += n.textContent; continue; } t.push({ blk, text: n.textContent }); }
          const h = c.querySelector('.ky-ec-h code, .ky-ec-h'), sy = c.querySelector('.ky-ec-s');
          return { open: true, l1: t[0] && t[0].text.trim(), l2: t[1] && t[1].text.trim(), header: h && h.textContent, sym: sy && sy.textContent.trim() }; });
        const lt = String(e.line_text);
        cards.push({ sym: e.sym, open: c.open, l1: short(c.l1, 120), l2: c.l2, header_equal: c.header === lt, ok: c.open && c.l1 === lt.trim() && (c.l2 === e.sym || c.sym === e.sym) && c.header === lt });
      }
      step('A4 card from the periodic-table panel: first line = line_text, second = block:<Sym> (3 elements)', cards.length === 3 && cards.every(c => c.ok), { rows: nEl, cards });
    }
    await closeLauncher(p); await closeMenus(p);
    // ------------------------------------------------------------------ A5 the spider row opens its dashboard
    await openMenu(p, 'file'); await tapSel(p, '#ky-file-open-app'); await sleep(3000);
    const spSel = '#ky-apps [data-id="spider-sandbox"] a.ky-app-a';
    if (!(await p.locator(spSel).count())) step('A5 the spider row opens the dashboard', false, { why: 'no row ' + spSel });
    else {
      await tapSel(p, spSel);
      await p.waitForURL(u => !String(u).startsWith(URL0), { timeout: 120000 }).catch(() => {});
      const landed = p.url();
      step('A5 the spider row opens the dashboard (same tab, its link)', landed === spiderLink, { landed, link: spiderLink });
      if (landed !== URL0 && !landed.startsWith(URL0)) { await p.goBack({ timeout: LONG }).catch(e => R.errors.push('goBack ' + e.message)); await ready(p); }
    }
    // ------------------------------------------------------------------ A3 See Through, same tab, back
    await closeLauncher(p); await closeMenus(p);
    await openMenu(p, 'file'); await tapSel(p, '#ky-file-open-app'); await sleep(3000);
    const stSel = '#ky-apps [data-key="' + SEE_THROUGH_KEY + '"] a.ky-app-a';
    const navs = []; const onReq = q => { if (q.isNavigationRequest() && q.frame() === p.mainFrame()) navs.push(q.url()); }; p.on('request', onReq);
    if (!(await p.locator(stSel).count())) step('A3 the See Through row navigates in the same tab to ../../see-through/', false, { why: 'no row ' + stSel });
    else {
      const pagesBefore = p.context().pages().length;
      await tapSel(p, stSel);
      await p.waitForURL(u => /\/see-through\//.test(String(u)), { timeout: LONG }).catch(() => {});
      await p.waitForLoadState('domcontentloaded', { timeout: LONG }).catch(() => {});
      const stUrl = p.url(), want = new URL('../../see-through/', URL0).href;
      const head = await fetch(want).then(r => r.status).catch(e => 'ERR ' + e.message);
      const title = await p.title().catch(() => null);
      p.off('request', onReq);
      step('A3 the See Through row navigates in the same tab to ../../see-through/ (200, title "See Through")', navs[0] && navs[0].split('#')[0] === want && stUrl.startsWith(want) && head === 200 && /^See Through/.test(title || '') && p.context().pages().length === pagesBefore,
        { requested: navs, landed: stUrl, want, status: head, title, tabs: p.context().pages().length });
      await p.goBack({ timeout: LONG }).catch(e => R.errors.push('goBack ' + e.message));
      await p.waitForURL(u => String(u).startsWith(URL0), { timeout: LONG }).catch(() => {});
      await ready(p);
      const back = await p.evaluate(() => { const L = document.getElementById('ky-apps'), b = document.getElementById('kuiper-menu-bar');
        return { url: location.href, launcherOpen: !!L && getComputedStyle(L).display !== 'none' && L.getBoundingClientRect().height > 0, menuOpen: b ? (b.getAttribute('data-open') || '') : null, card: (document.getElementById('card') || { style: {} }).style.display }; });
      step('A3 goBack() returns to the edition with no panel open', back.url.startsWith(URL0) && !back.launcherOpen && !back.menuOpen, back);
    }
    await p.context().close(); p = null;
    // ------------------------------------------------------------------ A5 negative: data/graphs answered 404
    allow404 = /\/data\/graphs\//;
    p = await newPage(); await p.goto(URL0, { timeout: LONG }); await ready(p);
    await openMenu(p, 'wafer'); await sleep(1200);
    await p.evaluate(() => { const lab = document.querySelector('label.ky-ly[data-id="spider"]'); if (lab) lab.scrollIntoView({ block: 'center' }); }); await sleep(600);
    await tapSel(p, 'label.ky-ly[data-id="spider"]');
    await p.waitForFunction(() => { try { const s = KY.modules.layers.api.get('spider').status; return s === 'FAIL' || s === 'OK' || s === 'EMPTY'; } catch (e) { return false; } }, null, { timeout: LONG, polling: 1000 }).catch(() => {});
    await sleep(3000);
    const neg = await layer(p, 'spider'), lines = await layer(p, 'lines');
    await closeMenus(p); await sleep(SETTLE);
    const lit = await waferLit(p);
    step('A5 with data/graphs/* answered 404 the spider row is FAIL naming the file; lines OK; the wafer still draws', neg.status === 'FAIL' && /data\/graphs\//.test((neg.why || '') + ' ' + (neg.row || '')) && lines.status === 'OK' && lit.litFraction > 0.002,
      { spider: neg, lines: lines.status, wafer: lit, routed_404: R.expected_404 });
    await p.context().close(); p = null; allow404 = null;
  } catch (e) {
    step('harness', false, String(e && e.stack || e).slice(0, 800));
    if (p) await p.context().close().catch(() => {});
  }
  // ------------------------------------------------------------------ A6 and E
  const offDash = R.blocked_offorigin;
  step('A6 every step above ran with every off-origin request blocked (listed)', R.steps.filter(s => /^A[2-5]/.test(s.id)).length >= 14 && !R.steps.some(s => s.id === 'harness') && R.steps.filter(s => /^A[2-5]/.test(s.id)).every(s => s.result === 'PASS'),
    { blocked: offDash.length, sample: offDash.slice(0, 12) });
  step('E zero pageerrors, zero console errors, zero failed same-origin requests on the edition', R.errors.length === 0 && R.console_errors.length === 0 && R.failed_local.length === 0,
    { pageerrors: R.errors.slice(0, 10), console: R.console_errors.slice(0, 10), failed_local: R.failed_local.slice(0, 10), see_through_console_listed_not_counted: R.see_through_console.length,
      aborted_listed: R.aborted_local.length, evidence_404_listed: R.evidence_404 });
  if (R.evidence_404.length) step('E\' the EVIDENCE files file.js rows HEAD are present (written by the integrator at assembly)', ALLOW_EVIDENCE ? null : false,
    { missing: R.evidence_404, why: ALLOW_EVIDENCE ? '--allow-missing-evidence: NOT EVALUATED (never a pass); team 6\'s rows, the integrator\'s files' : 'console 404s on the edition' });
}

// ======================================================================== TEST.md
function writeTestMd(file) {
  const devs = Object.keys(report.devices), ids = [];
  devs.forEach(d => report.devices[d].steps.forEach(s => { if (!ids.includes(s.id)) ids.push(s.id); }));
  const L = [];
  L.push('# handoff/07-apps/TEST.md: step 7 "the OS of the estate, baby step one", acceptance A1-A6');
  L.push('');
  L.push('Tester OPUS-7 (Opus team 7). Written by `test.cjs` at ' + report.finished + '; every cell is a measurement of that run, never an estimate.');
  L.push('');
  const nonPass = [].concat(report.script.filter(s => s.result !== 'PASS').map(s => s.id), ...Object.values(report.devices).map(d => d.steps.filter(s => s.result !== 'PASS').map(s => s.id)));
  const onlyEvidence = !report.pass && nonPass.length > 0 && nonPass.every(id => /^E'/.test(id)) && Object.values(report.devices).every(d => d.steps.filter(s => /^E'/.test(s.id)).every(s => s.result === 'NOT EVALUATED'));
  L.push('**Verdict: ' + (report.pass ? 'PASS: the hand-off may go.' : onlyEvidence ? 'PASS for every team-7 gate; NOT EVALUATED: E\' (the EVIDENCE files of file.js that the integrator writes at assembly). Not a full pass until the integrator\'s run shows them present.' : 'FAIL: the hand-off is refused until every gate below reads PASS on both devices.') + '**');
  L.push('');
  L.push('| run | value |'); L.push('|---|---|');
  L.push('| edition | ' + URL0 + ' |');
  for (const f of ['index.html', 'modules.json']) L.push('| served ' + f + ' | sha256 `' + ((report.files[f] || {}).sha256 || '-') + '` (' + ((report.files[f] || {}).bytes || '-') + ' bytes) |');
  L.push('| module | `modules/202611012309-apps.js` sha256 `' + ((report.files['modules/202611012309-apps.js'] || {}).sha256 || '-') + '` (' + ((report.files['modules/202611012309-apps.js'] || {}).bytes || '-') + ' bytes) |');
  for (const f of ['data/apps.json', 'data/elements.json', 'data/graphs/overview.json', 'data/graphs/periodic-table.json']) L.push('| ' + f + ' | sha256 `' + ((report.files[f] || {}).sha256 || '-') + '` (' + ((report.files[f] || {}).bytes || '-') + ' bytes) |');
  L.push('| test.cjs | sha256 `' + sha256(fs.readFileSync(__filename)) + '` |');
  L.push('| browser | Playwright Chromium ' + report.browser + ', `' + ARGS.join(' ') + '`, real touch (`touchscreen.tap`), ' + (SETTLE / 1000) + ' s settle, one device at a time |');
  L.push('| network | every off-origin request aborted for the whole device run (A6); the spider dashboard link answered by a stub page (the URL is asserted) |');
  L.push('');
  L.push('## By script, against the sources (once)'); L.push('');
  L.push('| gate | result | measured |'); L.push('|---|---|---|');
  report.script.forEach(s => L.push('| ' + s.id.replace(/\|/g, '\\|') + ' | ' + s.result + ' | ' + short(s.measured, 360).replace(/\|/g, '\\|') + ' |'));
  L.push(''); L.push('## On the devices'); L.push('');
  L.push('| gate | ' + devs.join(' | ') + ' |'); L.push('|---|' + devs.map(() => '---').join('|') + '|');
  ids.forEach(id => L.push('| ' + id.replace(/\|/g, '\\|') + ' | ' + devs.map(d => { const s = report.devices[d].steps.find(x => x.id === id); return s ? s.result : '-'; }).join(' | ') + ' |'));
  L.push(''); L.push('## Measurements per device'); L.push('');
  devs.forEach(d => { L.push('### ' + d); L.push('');
    report.devices[d].steps.forEach(s => L.push('- ' + s.result + ' ' + s.id + ': `' + short(s.measured, 600).replace(/`/g, "'") + '`'));
    L.push('- screenshots: ' + report.devices[d].shots.map(x => path.basename(x.file) + ' (' + x.bytes + ' B)').join(', '));
    L.push(''); });
  fs.writeFileSync(file, L.join('\n') + '\n');
}

(async () => {
  try { await scriptChecks(); } catch (e) { sstep('script harness', false, String(e && e.stack || e).slice(0, 800)); }
  const browser = await chromium.launch({ args: ARGS }); report.browser = browser.version();
  if (argv.includes('--script-only')) DEVICES = [];
  for (const DEV of DEVICES) { await runDevice(browser, DEV); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1)); }
  await browser.close();
  report.finished = new Date().toISOString(); report.pass = allPass;
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  writeTestMd(path.join(OUT, 'TEST.md')); if (TESTMD) writeTestMd(TESTMD);
  console.log(JSON.stringify({ pass: allPass, script: report.script.map(s => s.result + ' ' + s.id), devices: Object.fromEntries(Object.entries(report.devices).map(([d, r]) => [d, r.steps.map(s => s.result + ' ' + s.id)])) }, null, 1));
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
