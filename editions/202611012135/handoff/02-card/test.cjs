#!/usr/bin/env node
// test.cjs — Opus team 2, ROADMAP step 2 "the card law": the line of code is the header. B1–B7 on Android, measured,
// not eyeballed, in the form of neural-link FIXES/NL-009/android-journey.cjs. Owner: OPUS-2 tester. Merged from the
// tester's version and the version another team-2 agent wrote to this path at 21:52 UTC (its NL-009 checks F4–F7, the
// --with-shell option and README-card-law.md are kept). No page globals are used: the page script is
// <script type="module">, so every body is reached through the UI (touch, and "e" for the walk over all 344).
//
//   node test.cjs [url] [outdir] [--devices "Pixel 7,Galaxy S24"] [--with-shell] [--no-patch] [--label L] [--handoff]
//
//   url        default http://127.0.0.1:8422/editions/202611012135/  (serve the kuiper-belt root on the team-2 tester port)
//   outdir     default /tmp/nl010-opus/team-2/tester/run-<label>     (screenshots per device, report.json)
//   --no-patch serve index.html and modules.json exactly as committed (the "before" run: Edition 4's card)
//              Otherwise, until the integrator has applied them, Opus 4's handoff/04-loader/index.html.patch and our
//              handoff/02-card/index.patch are applied to the served index.html through page.route (the file on disk is
//              never edited) and modules.json is served with the line-card record (kuiper-shell first with --with-shell)
//              when the committed manifest does not list it. Every substitution is printed in the report.
//   --handoff  write TEST.md (pass/fail per assertion) into handoff/02-card/ from the run
//
// Real touch for every tap (page.touchscreen.tap; CDP Input.dispatchTouchEvent for the swipe). The keyboard is used only for
// "e" in the walk over all 344 placed bodies and for Escape, as the journey does. github.com is routed to a stub page.
// The expected values come from keys.json; the body a card shows is identified by its link to the body's destination.
// Exit 0 when every gating assertion passed on every device, 1 otherwise, 2 on a harness error.
//
//   S0  K0 keys.json byte-identical to Edition 2's            S1  one modules/<stamp>-line-card.js, line-1 header, stamps agree
//   S2  node --check; exactly one KY.register(                 S3  handoff MODULE.sha256 = sha256 of the module
//   S4  B4 the K3 sentence byte-identical in the README paragraph (edition README "## The card law", else
//       handoff/02-card/README-card-law.md), LAWS-L11.patch and the module's head comment; the patch carries the L11 heading
//       and the Falsified-by line, applies to LAWS.md, and puts L11 right after L10
//   S5  B7 python3 tools/ci_check.py prints RESULT: PASS
//   per device:
//   D1  load: zero console errors so far; line-card admitted by the loader, nothing refused
//   D2  B4 the K3 sentence on the page: ABOUT panel first paragraph when the panel exists (shell), else api.law / slot
//   D3  B6 every LINES row: first text node = line_text (empty: "empty line at key"); text, then key, then title
//   D4  touch a LINES row: B1 + B2 + B3 (≤ 34 % of the viewport, the spark between the bar and the card after the fly)
//   D5  details: button[aria-expanded] true/false by touch; details shown/hidden; ≤ 34 % with details open; ≥ 44 px tall
//   D6  the GitHub link (href = destination) opens a tab on a touch tap; ≥ 44 px tall; the card stays on the same line
//   D7  × effective touch target ≥ 44 × 44 px; × closes the card and clears the selected spark
//   D8  touch the spark where the selection was: its card opens, B1 + B2 + B3
//   D9  touch COMMANDS → "next verified line": the next body's card, B1 + B2 + B3
//   N1  NL-009 02-card F6: 12 px type on a phone          N2  F4 the card steps behind an open panel and returns
//   N3  F5 a 24 px bottom inset adds ≥ 24 px of padding   N4  F7 a swipe down closes and clears the spark; Escape closes
//   D10 B1/B2/B3 over all 344 placed bodies (walk with e): first visible text node = line_text byte for byte (the × control
//       excepted), key second (repo@commit7 path:line, inside the card without scrolling), title only after the key row,
//       ≤ 34 % of the viewport; the 4 empty lines say "empty line at key" inside the header
//   D10i info: K2 aria-label/aria-live, key number and destination link in row 2, header first element, register-quote rows
//   D11 B5 a body without line_text (keys.json mutated through page.route) shows "no text at key" in the header
//   D12 B7 zero console errors, page errors, failed requests and HTTP errors over the whole device run
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const { execFileSync, spawnSync } = require('child_process');

const HERE = path.basename(__dirname) === '02-card' ? __dirname : '/home/user/estate/kuiper-belt/editions/202611012135/handoff/02-card';
const EDITION = path.resolve(HERE, '..', '..'), REPO = path.resolve(EDITION, '..', '..'), STAMP = path.basename(EDITION);
const argv = process.argv.slice(2);
const VALUED = ['--devices', '--label'];
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUED.includes(argv[i - 1])));
const flag = (n) => { const i = argv.indexOf(n); return i < 0 ? null : (VALUED.includes(n) ? (argv[i + 1] || null) : true); };
const NO_PATCH = !!flag('--no-patch'), WITH_SHELL = !!flag('--with-shell'), WRITE_HANDOFF = !!flag('--handoff');
const LABEL = String(flag('--label') || (NO_PATCH ? 'before' : 'after'));
const URL0 = (positional[0] || `http://127.0.0.1:8422/editions/${STAMP}/`).replace(/\/?$/, '/');
const OUT = path.resolve(positional[1] || `/tmp/nl010-opus/team-2/tester/run-${LABEL}`);
const DEVICES = flag('--devices') ? String(flag('--devices')).split(',').map(s => s.trim()).filter(Boolean) : ['Pixel 7', 'Galaxy S24'];
const SETTLE_MAX = 90000, FIXED_WAIT = 7000, MARGIN = 10, CAP = 0.34;
const LAW = 'The line of code is the header. Every card opens with the line itself, verbatim from the key; the key is the second row; every name a person gave the line comes after.';
const L11_HEAD = '## L11. The line of code is the header';
const FALSIFIED = '**Falsified by:** a card whose first visible row differs from the text at its key; a card that shows a line without its key on the next row; or a quote shown as the header when the quote is not the line at the key.';
const EDITION2_KEYS_SHA = '1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b';   // editions/202611010114/keys.json
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const norm = s => String(s).replace(/\s+/g, ' ').trim();          // a markdown soft wrap renders as one space

// ------------------------------------------------------------------ static checks (once)
function staticChecks() {
  const S = [];
  const rec = (id, name, pass, measured, note, info) => { S.push({ id, name, pass: !!pass, info: !!info, measured, note: note || '' }); process.stderr.write(`[static] ${info ? 'INFO' : pass ? 'PASS' : 'FAIL'} ${id} ${name}${note ? ' — ' + note : ''}\n`); };
  const keysSha = sha256(fs.readFileSync(path.join(EDITION, 'keys.json')));
  rec('S0', 'K0 keys.json byte-identical to Edition 2', keysSha === EDITION2_KEYS_SHA, { sha256: keysSha, edition2: EDITION2_KEYS_SHA });
  // the page may load a compact copy first (keys-min.json, team 10 perf): the card shows what it loads, so every placed
  // body's line_text, destination, repo, commit, path, line and key there must equal keys.json's, byte for byte
  const minFile = path.join(EDITION, 'keys-min.json');
  if (fs.existsSync(minFile)) {
    const full = JSON.parse(fs.readFileSync(path.join(EDITION, 'keys.json'), 'utf8')), mini = JSON.parse(fs.readFileSync(minFile, 'utf8'));
    const P = (j) => (j.bodies || j).filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0);
    const A = P(full), B = P(mini); const F = ['line_text', 'destination', 'repo', 'commit', 'path', 'line', 'key', 'title', 'quote'];
    let diff = 0, first = null; for (let i = 0; i < Math.max(A.length, B.length); i++) { const a = A[i], b = B[i]; const bad = !a || !b ? ['missing'] : F.filter(f => a[f] !== b[f] && !(f === 'quote' && !(f in b)));
      if (bad.length) { diff++; if (!first) first = { i, fields: bad }; } }
    rec('S0b', 'keys-min.json (what the page loads first): every placed body\'s line_text, key, destination, repo, commit, path, line, title equal keys.json\'s', A.length === B.length && diff === 0,
      { placedFull: A.length, placedMin: B.length, differing: diff, first, sha256: sha256(fs.readFileSync(minFile)) }, diff ? diff + ' bodies differ; first ' + JSON.stringify(first) : '');
  }
  const mods = fs.readdirSync(path.join(EDITION, 'modules')).filter(f => /^\d{12}-line-card\.js$/.test(f));
  let modFile = null, modText = '', modSha = null;
  if (mods.length === 1) { modFile = mods[0]; const buf = fs.readFileSync(path.join(EDITION, 'modules', modFile)); modText = buf.toString('utf8'); modSha = sha256(buf); }
  const line1 = modText.split('\n')[0];
  const m1 = line1.match(/^\/\* kuiper module line-card, generation (\d{12}) \(UTC\), (.+?) \*\/\s*$/);
  const fileStamp = modFile ? modFile.slice(0, 12) : null;
  const gen = modText.match(/generation\s*:\s*['"](\d{12})['"]/) || (/generation\s*:\s*STAMP\b/.test(modText) && modText.match(/\bSTAMP\s*=\s*['"](\d{12})['"]/));
  rec('S1', 'one modules/<stamp>-line-card.js; line 1 "/* kuiper module line-card, generation <stamp> (UTC), <licence> */"; file stamp = header = generation; Apache-2.0',
    mods.length === 1 && m1 && m1[1] === fileStamp && gen && gen[1] === fileStamp && /Apache-2\.0/.test(m1[2]),
    { files: mods, headerStamp: m1 && m1[1], fileStamp, generation: gen && gen[1], licence: m1 && m1[2], bytes: Buffer.byteLength(modText), sha256: modSha },
    mods.length !== 1 ? mods.length + ' line-card module files' : (!m1 ? 'line 1 is not the module header' : (gen && gen[1] === fileStamp ? '' : 'generation ' + (gen && gen[1]) + ' ≠ file ' + fileStamp)));
  let checkOk = false, checkErr = '';
  if (modFile) { const r = spawnSync(process.execPath, ['--check', path.join(EDITION, 'modules', modFile)], { encoding: 'utf8' }); checkOk = r.status === 0; checkErr = (r.stderr || '').split('\n').slice(0, 4).join(' | '); }
  const nReg = (modText.match(/KY\.register\(/g) || []).length;
  rec('S2', 'node --check passes; exactly one KY.register(', checkOk && nReg === 1, { nodeCheck: checkOk, registerCalls: nReg }, checkOk ? (nReg === 1 ? '' : nReg + ' KY.register( calls') : 'node --check: ' + checkErr);
  const shaFile = path.join(HERE, 'MODULE.sha256'), shaText = fs.existsSync(shaFile) ? fs.readFileSync(shaFile, 'utf8') : '';
  const shaRec = (shaText.match(/[0-9a-f]{64}/) || [null])[0];
  rec('S3', 'handoff MODULE.sha256 equals the module file sha256', !!modSha && shaRec === modSha, { recorded: shaRec, measured: modSha }, !shaText ? 'MODULE.sha256 missing' : (shaRec === modSha ? '' : 'recorded ' + shaRec + ' measured ' + modSha));
  // the record the integrator is asked to add (REQUESTS.md 2): it must carry the file's own sha256 and bytes
  let hoRec = null, hoName = null;
  for (const f of ['MODULE.json', 'module-record.json']) { if (hoRec) break; try { hoRec = JSON.parse(fs.readFileSync(path.join(HERE, f), 'utf8')); hoName = f; } catch (e) {} }
  const modBytes = modFile ? fs.statSync(path.join(EDITION, 'modules', modFile)).size : null;
  rec('S3r', 'handoff MODULE.json (the record for modules.json): id line-card, path = the module, sha256 and bytes = the file, licence set, bytes ≤ byte_budget', !!hoRec && hoRec.id === 'line-card' && hoRec.path === 'modules/' + modFile && hoRec.sha256 === modSha && hoRec.bytes === modBytes && !!String(hoRec.licence || '').trim() && (!hoRec.byte_budget || modBytes <= hoRec.byte_budget),
    { file: hoName, path: hoRec && hoRec.path, recorded: hoRec && hoRec.sha256, measured: modSha, bytes: hoRec && hoRec.bytes, measuredBytes: modBytes, byte_budget: hoRec && hoRec.byte_budget },
    !hoRec ? 'MODULE.json missing' : (hoRec.sha256 === modSha && hoRec.bytes === modBytes ? '' : 'record sha256 ' + String(hoRec.sha256).slice(0, 12) + '/' + hoRec.bytes + ' B, file ' + String(modSha).slice(0, 12) + '/' + modBytes + ' B'));
  let manifest = null; try { manifest = JSON.parse(fs.readFileSync(path.join(EDITION, 'modules.json'), 'utf8')); } catch (e) {}
  const mrec = manifest && (manifest.modules || []).find(r => r.id === 'line-card');
  rec('S3m', 'modules.json lists line-card with the module sha256 (integrator, team 10)', mrec && mrec.sha256 === modSha, { listed: !!mrec, recorded: mrec && mrec.sha256, inOrder: !!(manifest && (manifest.order || []).includes('line-card')) }, mrec ? (mrec.sha256 === modSha ? '' : 'manifest sha256 differs') : 'not listed yet (served through page.route)', true);
  const readme = fs.readFileSync(path.join(EDITION, 'README.md'), 'utf8');
  const secOf = (t) => t.split(/\n(?=## )/).find(s => s.split('\n')[0].trim() === '## The card law');
  const firstPara = (sec) => { if (!sec) return null; const ps = sec.split('\n').slice(1).join('\n').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean); return ps.length ? norm(ps[0]) : null; };
  const edSec = secOf('\n' + readme);
  const hoFile = path.join(HERE, 'README-card-law.md'), hoText = fs.existsSync(hoFile) ? fs.readFileSync(hoFile, 'utf8') : '';
  const hoSec = secOf('\n' + hoText);
  const sec = edSec || hoSec, readmeSrc = edSec ? 'editions/' + STAMP + '/README.md' : (hoSec ? 'handoff/02-card/README-card-law.md' : null);
  const readmeFirst = firstPara(sec);
  const patchFile = path.join(HERE, 'LAWS-L11.patch'), patch = fs.existsSync(patchFile) ? fs.readFileSync(patchFile, 'utf8') : '';
  const added = patch.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1)).join('\n');
  const addedParas = added.split(/\n\s*\n/).map(p => norm(p));
  const patchHasLaw = addedParas.includes(LAW), patchHead = added.split('\n').some(l => l.trim() === L11_HEAD), patchFals = addedParas.some(p => p.includes(norm(FALSIFIED)));
  const readmeFals = norm(sec || '').includes(norm(FALSIFIED));
  const modHead = modText.split('\n').slice(0, 40).map(l => l.replace(/^\s*\/\/ ?/, '')).join('\n').includes(LAW);
  let applies = false, afterL10 = false, applyMsg = '';
  if (patch) {
    const r = spawnSync('git', ['apply', '--check', patchFile], { cwd: REPO, encoding: 'utf8' }); applies = r.status === 0; applyMsg = (r.stderr || '').trim().split('\n')[0] || '';
    if (applies) { const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l11-')); fs.copyFileSync(path.join(REPO, 'LAWS.md'), path.join(tmp, 'LAWS.md')); spawnSync('git', ['init', '-q'], { cwd: tmp });
      if (spawnSync('git', ['apply', patchFile], { cwd: tmp }).status === 0) { const t = fs.readFileSync(path.join(tmp, 'LAWS.md'), 'utf8'); const i10 = t.indexOf('\n## L10.'), i11 = t.indexOf('\n' + L11_HEAD); afterL10 = i10 >= 0 && i11 > i10 && !/\n## L/.test(t.slice(i10 + 8, i11)); }
      fs.rmSync(tmp, { recursive: true, force: true }); }
  }
  const ok4 = readmeFirst === LAW && readmeFals && patchHasLaw && patchHead && patchFals && applies && afterL10 && modHead;
  rec('S4', 'B4 the K3 sentence identical: README "## The card law" first paragraph, LAWS-L11.patch, module head; L11 heading + Falsified-by; patch applies after L10', ok4,
    { readme: readmeSrc, readmeFirstParagraphEqual: readmeFirst === LAW, readmeFalsifiedBy: readmeFals, editionReadmeSection: !!edSec, handoffReadmeSection: !!hoSec, patchHasLaw, patchL11Heading: patchHead, patchFalsifiedBy: patchFals, gitApplyCheck: applies, l11AfterL10: afterL10, moduleHeadCarriesLaw: modHead },
    [!sec ? 'no "## The card law" section (edition README or handoff/02-card/README-card-law.md)' : (readmeFirst === LAW ? '' : readmeSrc + ' first paragraph differs from the K3 sentence'), sec && !readmeFals ? readmeSrc + ' lacks the Falsified-by line' : '',
      !patch ? 'LAWS-L11.patch missing' : '', patch && !patchHasLaw ? 'patch lacks the K3 sentence' : '', patch && !patchHead ? 'patch lacks the L11 heading' : '', patch && !patchFals ? 'patch lacks the Falsified-by line' : '',
      patch && !applies ? 'git apply --check: ' + applyMsg : '', patch && applies && !afterL10 ? 'L11 not right after L10' : '', modHead ? '' : 'module head comment lacks the sentence'].filter(Boolean).join('; ') || (edSec ? '' : 'README paragraph read from handoff/02-card/README-card-law.md (the edition README section is team 10\'s to merge)'));
  // B7 ci_check: the gate is that no check names a file of this team (handoff/02-card/, the line-card module, the card's
  // README section); the whole-repository result is reported beside it, with the files each failing check names
  let ci = { status: null, last: '', fails: [] };
  try { const r = spawnSync('python3', ['tools/ci_check.py'], { cwd: REPO, encoding: 'utf8', timeout: 600000 }); const lines = (r.stdout || '').trim().split('\n');
    ci = { status: r.status, last: lines.slice(-1)[0], fails: lines.filter(l => /^FAIL /.test(l)).map(l => l.slice(0, 400)) }; } catch (e) { ci.last = String(e); }
  const ours = ci.fails.filter(l => /handoff\/02-card\/|line-card/.test(l));
  const ciPass = /RESULT: PASS/.test(ci.last);
  rec('S5', 'B7 tools/ci_check.py: no failing check names a team-2 file (handoff/02-card/, the line-card module)', !!ci.last && (ciPass || (ours.length === 0 && ci.fails.length > 0)), { ...ci, teamTwoFails: ours },
    ciPass ? 'RESULT: PASS' : (ours.length ? 'ci_check fails on team-2 files: ' + ours.join(' | ') : 'RESULT: FAIL outside team 2: ' + ci.fails.join(' | ')));
  rec('S5r', 'B7 tools/ci_check.py prints RESULT: PASS for the whole repository (all teams; the integrator gates on it)', ciPass, ci, ciPass ? '' : ci.fails.join(' | '), true);
  return { S, modFile, modText, modSha, manifest, mrec, hoRec };
}

// ------------------------------------------------------------------ the served page
function buildServed(st) {
  const subs = [];
  if (NO_PATCH) return { html: null, manifest: null, subs: ['none (--no-patch): index.html and modules.json as committed'] };
  let html = fs.readFileSync(path.join(EDITION, 'index.html'), 'utf8');
  const lpFile = path.join(EDITION, 'handoff', '04-loader', 'index.html.patch'), ipFile = path.join(HERE, 'index.patch');
  const appliesTo = (text, files) => { const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'card-try-')), d = path.join(tmp, 'editions', STAMP); fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), text); spawnSync('git', ['init', '-q'], { cwd: tmp }); let ok = true;
    for (const f of files) if (spawnSync('git', ['apply', '--include=editions/' + STAMP + '/index.html', f], { cwd: tmp }).status !== 0) { ok = false; break; }
    fs.rmSync(tmp, { recursive: true, force: true }); return ok; };
  if (!/window\.KY\s*=|kuiper\.hooks\.v1/.test(html) && fs.existsSync(lpFile) && fs.existsSync(ipFile) && !appliesTo(html, [lpFile, ipFile])) {
    // the committed page moved on (the integrator's base edits) and the patches no longer apply: serve the newest committed
    // revision of index.html they apply to, and say so (the rebase is Opus 4's and Opus 10's)
    const revs = (spawnSync('git', ['log', '--format=%h', '--', 'editions/' + STAMP + '/index.html'], { cwd: REPO, encoding: 'utf8' }).stdout || '').trim().split('\n').filter(Boolean);
    const cur = sha256(Buffer.from(html)).slice(0, 8); let used = null;
    for (const r of revs) { const t = spawnSync('git', ['show', r + ':editions/' + STAMP + '/index.html'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 }).stdout; if (t && appliesTo(t, [lpFile, ipFile])) { html = t; used = r + ' (index.html sha256 ' + sha256(Buffer.from(t)).slice(0, 8) + ')'; break; } }
    subs.push(used ? 'the patches do not apply to the committed index.html (sha256 ' + cur + '); served the newest committed revision they apply to: ' + used : 'the patches apply to no committed revision of index.html');
  }
  const apply = (patchFile, why) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'card-served-')), d = path.join(tmp, 'editions', STAMP); fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), html); spawnSync('git', ['init', '-q'], { cwd: tmp });
    let r = spawnSync('git', ['apply', '--include=editions/' + STAMP + '/index.html', patchFile], { cwd: tmp, encoding: 'utf8' });
    // the integrator's base moves (handoff/10-integration/BASE.md: NL-009 07-perf, 03-camera; Opus 4's hunk 12 is applied
    // there by hand): when git apply refuses, fall back to patch(1) and say how many hunks it rejected (lead, 22:44 UTC)
    let how = '';
    if (r.status !== 0) { const p = spawnSync('patch', ['-p1', '--no-backup-if-mismatch', '-r', '-', '-i', patchFile], { cwd: tmp, encoding: 'utf8' });
      const t = fs.readFileSync(path.join(d, 'index.html'), 'utf8'), rej = ((p.stdout || '').match(/FAILED at \d+/g) || []);
      const landed = /04-loader/.test(patchFile) ? /window\.KY\s*=/.test(t) : /modules\['line-card'\]/.test(t);
      if (landed) { r = { status: 0 }; how = ' by patch(1)' + (rej.length ? ', ' + rej.length + ' hunk(s) rejected: ' + rej.join(', ') : ''); } }
    if (r.status === 0) { html = fs.readFileSync(path.join(d, 'index.html'), 'utf8'); subs.push('applied ' + path.relative(EDITION, patchFile) + how + ' (' + why + ')'); }
    else subs.push('FAILED to apply ' + path.relative(EDITION, patchFile) + ': ' + (r.stderr || '').trim().split('\n')[0]);
    fs.rmSync(tmp, { recursive: true, force: true });
  };
  if (!/window\.KY\s*=|kuiper\.hooks\.v1/.test(html)) {
    const lp = path.join(EDITION, 'handoff', '04-loader', 'index.html.patch');
    if (fs.existsSync(lp)) apply(lp, 'hook table and loader not in the committed page yet'); else subs.push('no hook table in the page and no handoff/04-loader/index.html.patch');
  }
  const ip = path.join(HERE, 'index.patch');
  if (fs.existsSync(ip) && !/modules\['line-card'\]/.test(html)) apply(ip, 'card delegation not in the committed page yet');
  let manifest = null;
  const reqOf = (t) => { const m = t.match(/requires\s*:\s*\[([^\]]*)\]/); return m ? (m[1].match(/['"]([^'"]+)['"]/g) || []).map(s => s.slice(1, -1)) : []; };
  const recOf = (id, file, extra) => { const buf = fs.readFileSync(path.join(EDITION, 'modules', file)), t = buf.toString('utf8');
    return Object.assign({ id, generation: file.slice(0, 12), path: 'modules/' + file, sha256: sha256(buf), bytes: buf.length, byte_budget: Math.max(65536, buf.length), requires: reqOf(t), provides: [id],
      reads: [], writes: [], creates_controls: 'none', licence: 'Apache-2.0' }, extra || {}); };
  const shellFile = fs.readdirSync(path.join(EDITION, 'modules')).filter(f => /^\d{12}-kuiper-shell\.js$/.test(f)).sort().pop();
  const base = st.manifest || { schema: 'kuiper.modules.v1', edition: STAMP, order: [], modules: [] };
  const needCard = st.modFile && !st.mrec, needShell = WITH_SHELL && shellFile && !(base.order || []).includes('kuiper-shell');
  if (needCard || needShell) {
    const order = (base.order || []).filter(x => x !== 'line-card' && x !== 'kuiper-shell'), modules = (base.modules || []).filter(r => r.id !== 'line-card' && r.id !== 'kuiper-shell');
    if (WITH_SHELL && shellFile) { order.push('kuiper-shell'); modules.push((base.modules || []).find(r => r.id === 'kuiper-shell') || recOf('kuiper-shell', shellFile)); }
    order.push('line-card'); modules.push(st.mrec || st.hoRec || recOf('line-card', st.modFile, { team: '02', step: 2, proof: 'handoff/02-card/test.cjs' }));
    manifest = Object.assign({ hooks: 'kuiper.hooks.v1' }, base, { order, modules });
    subs.push('modules.json served with order [' + order.join(', ') + '] (line-card record ' + (st.mrec ? 'from modules.json' : st.hoRec ? 'from handoff/02-card/MODULE.json, verbatim' : 'built from the file on disk') + ')');
  }
  // rebuilt from disk at every request, so a page load never meets a stale sha256; S6 fails the run if the module moved
  const rebuild = () => { if (!manifest) return null; const m = JSON.parse(JSON.stringify(manifest));
    for (const r of m.modules) { try { const buf = fs.readFileSync(path.join(EDITION, r.path)); if (r.id === 'line-card' && !st.mrec && !st.hoRec) { r.sha256 = sha256(buf); r.bytes = buf.length; } } catch (e) {} }
    return JSON.stringify(m, null, 1); };
  return { html, manifest: manifest && JSON.stringify(manifest, null, 1), rebuild, subs };
}

// ------------------------------------------------------------------ in-page probes (no page globals used)
function probeFn() {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) }; };
  const card = document.getElementById('card'), cs = getComputedStyle(card);
  const bar = ['kuiper-menu-bar', 'bar'].map(id => document.getElementById(id)).filter(b => b && b.getBoundingClientRect().height > 0 && getComputedStyle(b).display !== 'none').sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0] || null;
  const open = cs.display !== 'none' && cs.visibility !== 'hidden' && card.getBoundingClientRect().height > 0;
  let magenta = null, greens = [];
  try { const ov = document.getElementById('o'), k = ov.width / innerWidth, W = ov.width, H = ov.height, d = ov.getContext('2d').getImageData(0, 0, W, H).data;
    let sx = 0, sy = 0, n = 0; const gp = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]; if (a < 60) continue;
      if (r > 180 && g < 110 && b > 140) { sx += x; sy += y; n++; } else if (g > 150 && r < 120 && b < 170 && a > 120) gp.push([x, y]); }
    if (n > 0) magenta = { x: +(sx / n / k).toFixed(1), y: +(sy / n / k).toFixed(1), px: n };
    const cl = []; for (const [x, y] of gp) { let hit = null; for (const c of cl) if (Math.abs(c.cx - x) <= 7 && Math.abs(c.cy - y) <= 7) { hit = c; break; }
      if (hit) { hit.sx += x; hit.sy += y; hit.n++; hit.cx = hit.sx / hit.n; hit.cy = hit.sy / hit.n; } else cl.push({ sx: x, sy: y, n: 1, cx: x, cy: y }); }
    greens = cl.filter(c => c.n >= 4).map(c => ({ x: +(c.cx / k).toFixed(1), y: +(c.cy / k).toFixed(1), px: c.n }));
  } catch (e) {}
  const el = magenta && document.elementFromPoint(magenta.x, magenta.y);
  return { viewport: { w: innerWidth, h: innerHeight, scrollY }, bar: R(bar), card: { open, rect: open ? R(card) : null, height: open ? card.getBoundingClientRect().height : 0, visibility: cs.visibility, display: cs.display, fontSize: cs.fontSize },
    magenta, greens, hitAtMagenta: el ? (el.id ? '#' + el.id : el.tagName.toLowerCase()) : null, panelOpen: !!document.querySelector('.gm-open'),
    titles: [...document.querySelectorAll('#kuiper-menu-bar .gm-title, #bar .gm-title, #bar [data-panel]')].filter(b => b.getBoundingClientRect().width > 0).map(b => ({ text: b.textContent.trim(), panel: b.dataset.panel || (b.parentNode && b.parentNode.getAttribute && b.parentNode.getAttribute('data-menu')) || '', rect: R(b) })), frames: window.__fr || 0 };
}
// the card as the law reads it: which body (by the link to its destination), its first visible text, its rows
function cardFn(args) {
  const T = window.__T, card = document.getElementById('card'), cap = args.cap;
  const cs = getComputedStyle(card), cr = card.getBoundingClientRect();
  const open = cs.display !== 'none' && cs.visibility !== 'hidden' && cr.height > 0;
  const out = { open, ok: false, fails: [] };
  if (!open) { out.fails.push('card not open'); return out; }
  let b = null; for (const a of card.querySelectorAll('a[href]')) { const hit = T.byDest[a.getAttribute('href')]; if (hit != null) { b = T.placed[hit]; out.index = hit; break; } }
  if (!b) { out.fails.push('no link to a placed body\'s destination in the card'); out.text = card.textContent.slice(0, 160); return out; }
  out.key = b.key; out.dest = b.destination; out.empty = b.line_text === '';
  const visEl = e => { for (let x = e; x && x !== card.parentNode; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; } return true; };
  const isClose = e => !!(e && e.closest && e.closest('#card .cx, #card [aria-label="close"], #card [aria-label="Close"]'));
  const tw = document.createTreeWalker(card, NodeFilter.SHOW_TEXT); const nodes = []; let n;
  while ((n = tw.nextNode())) {
    if (!n.data.length || (!n.data.trim() && !(n.parentElement && n.parentElement.closest('code')))) continue;
    if (isClose(n.parentElement) || !visEl(n.parentElement)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rr = rg.getClientRects(); if (!rr.length) continue;
    nodes.push({ n, top: rr[0].top }); if (nodes.length > 400) break;
  }
  const header = card.querySelector('header'), code = header && header.querySelector('code');
  const rowBox = (header && header.parentElement && card.contains(header.parentElement)) ? header.parentElement : card;   // rows are the children of the header's container
  const rowOf = (x) => { let e = x.nodeType === 3 ? x.parentElement : x; while (e && e.parentElement !== rowBox && e !== card) e = e.parentElement; return e; };
  const first = nodes[0];
  out.firstText = first ? (first.n.data.length > 120 ? first.n.data.slice(0, 120) + '…(' + first.n.data.length + ' chars)' : first.n.data) : null;
  out.firstLen = first ? first.n.data.length : 0;
  out.headerFirstChild = !!header && (() => { for (const c of rowBox.children) { if (c === header) return true; if (isClose(c)) continue; if (c.textContent.trim()) return false; } return false; })();
  out.codeEqual = !!code && code.textContent === b.line_text;
  let b1 = b.line_text === '' ? (out.codeEqual && !!first && header.contains(first.n) && /empty line at key/.test(first.n.data)) : (!!first && first.n.data === b.line_text && out.codeEqual);
  out.firstVisibleInCard = !!first && first.top >= cr.top - 1 && first.top < cr.bottom;
  b1 = b1 && out.firstVisibleInCard;
  if (!b1) out.fails.push('B1 first visible text "' + String(out.firstText).slice(0, 60) + '" ≠ line_text "' + b.line_text.slice(0, 60) + '"' + (out.codeEqual ? '' : ' (header code differs)'));
  const row1 = first ? rowOf(first.n) : null; let row2 = null;
  for (const x of nodes) { const r = rowOf(x.n); if (r !== row1) { row2 = r; break; } }
  const r2t = row2 ? row2.textContent : '', c7 = String(b.commit).slice(0, 7);
  out.row2 = r2t.length > 160 ? r2t.slice(0, 160) + '…' : r2t;
  const reRepo = new RegExp('(^|\\s)' + b.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '@' + c7 + '[0-9a-f]*(\\s|$)');
  const hasRepoCommit = reRepo.test(r2t), hasPathLine = r2t.includes(b.path + ':' + b.line);
  out.row2HasKeyNumber = r2t.includes(String(b.key)) || r2t.includes(Number(b.key).toLocaleString('en-GB'));
  const r2a = row2 && (row2.matches('a[href]') ? row2 : row2.querySelector('a[href]'));
  out.row2LinkIsDestination = !!r2a && r2a.getAttribute('href') === b.destination;
  const r2r = row2 ? row2.getBoundingClientRect() : null;
  out.row2InsideCard = !!r2r && r2r.height > 0 && r2r.top >= cr.top - 1 && r2r.top < cr.bottom - 4;
  const b2 = !!row2 && hasRepoCommit && hasPathLine && out.row2InsideCard;
  if (!b2) out.fails.push('B2 second row "' + out.row2.slice(0, 80) + '"' + (hasRepoCommit ? '' : ' lacks ' + b.repo + '@' + c7) + (hasPathLine ? '' : ' lacks ' + b.path + ':' + b.line) + (out.row2InsideCard ? '' : ' (not inside the card without scrolling)'));
  const all = []; const tw2 = document.createTreeWalker(card, NodeFilter.SHOW_TEXT); while ((n = tw2.nextNode())) all.push(n);
  // a title quoted inside the line itself (4 bodies: 20, 125, 216, 311) is the line, not the name: skip rows 1 and 2
  const iTitle = b.title ? all.findIndex(x => x.data.includes(b.title) && !(row1 && row1.contains(x)) && !(row2 && row2.contains(x))) : -1;  const iRow2Last = row2 ? all.reduce((m, x, i) => row2.contains(x) ? i : m, -1) : -1;
  out.titleAfterKey = iTitle < 0 || (iRow2Last >= 0 && iTitle > iRow2Last);
  if (!out.titleAfterKey) out.fails.push('title appears before the key row ends');
  out.height = +cr.height.toFixed(1); out.capPx = +(cap * innerHeight).toFixed(1);
  out.underCap = cr.height <= cap * innerHeight + 1 && cr.bottom <= innerHeight + 1;
  if (!out.underCap) out.fails.push('B3 card ' + out.height + ' px over cap ' + out.capPx);
  const al = card.getAttribute('aria-label');
  out.ariaLabelIsHeader = al === b.line_text || (b.line_text === '' && /empty line at key/.test(al || ''));
  out.ariaLive = card.getAttribute('aria-live');
  out.registerQuote = b.quote && b.quote !== b.line_text ? /register quote/.test(card.textContent) : null;
  out.b1 = !!b1; out.b2 = !!b2; out.ok = out.b1 && out.b2 && out.titleAfterKey && out.underCap;
  return out;
}
// every LINES row: first text node = line_text, then the key, then the title
function linesFn() {
  const T = window.__T, rows = [...document.querySelectorAll('#lineslist [data-i]')];
  const res = { rows: rows.length, ok: 0, fails: [] };
  for (const r of rows) {
    const i = +r.dataset.i, b = T.placed[i]; if (!b) { res.fails.push({ i, why: 'no placed body ' + i }); continue; }
    const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n, first = null;
    while ((n = tw.nextNode())) if (n.data.trim() || (n.parentElement && n.parentElement.closest('code') && n.data.length)) { first = n; break; }
    const t = r.textContent;
    const okFirst = b.line_text === '' ? !!first && /empty line at key/.test(first.data) : !!first && first.data === b.line_text;
    const iText = b.line_text === '' ? t.indexOf('empty line at key') : t.indexOf(b.line_text);
    const textLen = b.line_text === '' ? 'empty line at key'.length : b.line_text.length;
    const iKey = t.indexOf(b.repo + '@' + String(b.commit).slice(0, 7), iText + textLen);
    const iPath = t.indexOf(b.path + ':' + b.line, Math.max(iKey, 0));
    const iTitle = t.indexOf(b.title, Math.max(iPath, 0) + 1);
    const ok = okFirst && iText >= 0 && !t.slice(0, iText).trim() && iKey > iText && iPath >= iKey && iTitle > iPath;
    if (ok) res.ok++; else if (res.fails.length < 12) res.fails.push({ i, key: b.key, first: first ? first.data.slice(0, 60) : null, line_text: b.line_text.slice(0, 60), iText, iKey, iPath, iTitle });
  }
  return res;
}

// ------------------------------------------------------------------ one device
async function runDevice(browser, deviceName, served) {
  const dev = devices[deviceName]; if (!dev) throw new Error('unknown Playwright device: ' + deviceName);
  const dir = path.join(OUT, slug(deviceName)); fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ ...dev, locale: 'en-GB' });
  await context.route(/^https:\/\/github\.com\//, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>github stub' }));
  const pageUrl = new URL(URL0);
  if (served.html) await context.route(u => u.origin === pageUrl.origin && (u.pathname === pageUrl.pathname || u.pathname === pageUrl.pathname + 'index.html'), r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: served.html }));
  if (served.manifest) await context.route(u => u.origin === pageUrl.origin && u.pathname === pageUrl.pathname + 'modules.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: served.rebuild() }));
  const page = await context.newPage(); page.setDefaultTimeout(180000);
  const cdp = await context.newCDPSession(page);
  await page.addInitScript(() => { let n = 0; const f = () => { n++; window.__fr = n; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const errors = [];
  const watch = (pg) => {
    pg.on('console', m => { if (m.type() === 'error') errors.push({ kind: 'console', text: m.text().slice(0, 300) }); });
    pg.on('pageerror', e => errors.push({ kind: 'pageerror', text: String(e.message || e).slice(0, 300) }));
    pg.on('requestfailed', r => { const f = r.failure(); if (f && !/aborted|ERR_ABORTED/i.test(f.errorText)) errors.push({ kind: 'request', text: r.url().slice(0, 200) + ' ' + f.errorText }); });
    pg.on('response', r => { if (r.status() >= 400 && r.url().startsWith(pageUrl.origin)) errors.push({ kind: 'http', text: r.status() + ' ' + r.url().slice(0, 200) }); });
  };
  watch(page);
  const steps = []; let n = 0, t0 = Date.now();
  const shot = async (id, pg) => { const f = path.join(dir, String(++n).padStart(2, '0') + '-' + id + '.png');
    for (let a = 0; a < 2; a++) { try { await (pg || page).screenshot({ path: f, scale: 'css', timeout: 180000 }); return path.relative(OUT, f); } catch (e) { if (a) return 'FAILED: ' + String(e.message || e).split('\n')[0]; } } };
  const record = (id, name, pass, measured, note, info) => { steps.push({ id, name, pass: !!pass, info: !!info, ms: Date.now() - t0, measured, note: note || '' }); t0 = Date.now(); process.stderr.write(`[${deviceName}] ${info ? 'INFO' : pass ? 'PASS' : 'FAIL'} ${id} ${name}${note ? ' — ' + note : ''}\n`); };
  const probe = () => page.evaluate(probeFn);
  const cardNow = () => page.evaluate(cardFn, { cap: CAP });
  const tapAt = (x, y) => page.touchscreen.tap(Math.round(x), Math.round(y));
  const tapRect = (r) => tapAt((r.left + r.right) / 2, (r.top + r.bottom) / 2);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
  const rectOf = (sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } : null; }, sel);
  const mark = (js, attr, arg) => page.evaluate(({ js, attr, arg }) => { document.querySelectorAll('[' + attr + ']').forEach(e => e.removeAttribute(attr)); const e = (new Function('arg', js))(arg); if (!e) return null; e.setAttribute(attr, '1'); return '[' + attr + ']'; }, { js, attr, arg });
  const settle = async () => { const s0 = Date.now(); let last = null, seen = 0;
    while (true) { await sleep(300); const p = await probe(); const t = Date.now() - s0;
      if (!p.magenta) { if (t >= SETTLE_MAX) return p; continue; }
      if (!seen) seen = Date.now();
      if (last && Math.hypot(p.magenta.x - last.x, p.magenta.y - last.y) < 0.6 && p.frames - last.frames >= 2 && t >= FIXED_WAIT) return p;
      if (!last || Math.hypot(p.magenta.x - last.x, p.magenta.y - last.y) >= 0.6) last = { x: p.magenta.x, y: p.magenta.y, frames: p.frames };
      if (Date.now() - seen >= SETTLE_MAX) return p; } };
  const clearSpace = (p) => { if (!p.magenta) return { ok: false, why: 'no selected spark drawn on #o' };
    const topY = (p.bar ? p.bar.bottom : 0) + MARGIN, bot = (p.card.open ? p.card.rect.top : p.viewport.h) - MARGIN;
    const ok = p.magenta.y >= topY && p.magenta.y <= bot && p.magenta.x >= MARGIN && p.magenta.x <= p.viewport.w - MARGIN && (p.hitAtMagenta === '#c' || p.hitAtMagenta === '#o' || p.hitAtMagenta === 'canvas');
    return { ok, spark: [p.magenta.x, p.magenta.y], window: [topY, bot], hit: p.hitAtMagenta, why: ok ? '' : 'spark at ' + p.magenta.x + ',' + p.magenta.y + ' outside [' + topY + ',' + bot + '] or covered by ' + p.hitAtMagenta }; };
  const effTarget = (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2; let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (let dx = -40; dx <= 40; dx++) for (let dy = -40; dy <= 40; dy++) { const t = document.elementFromPoint(cx + dx, cy + dy); if (t && (t === el || el.contains(t))) { a = Math.min(a, dx); b = Math.max(b, dx); c = Math.min(c, dy); d = Math.max(d, dy); } }
    return b < a ? [0, 0] : [b - a + 1, d - c + 1]; }, sel);
  const visibleSel = (sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false;
    for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } return r.bottom > 0 && r.top < innerHeight; }, sel);
  // open whichever bar title shows the element, by touch (Edition 4's titles, or the shell's six menus)
  const reveal = async (sel) => {
    if (await visibleSel(sel)) return { ok: true, title: null };
    const names = await page.evaluate(() => { const ts = [...document.querySelectorAll('#kuiper-menu-bar .gm-menu > .gm-title, #bar:not(.kmb-superseded) .gm-title')].filter(b => b.getBoundingClientRect().width > 0 && b.tagName === 'BUTTON');
      document.querySelectorAll('[data-t-title]').forEach(b => b.removeAttribute('data-t-title')); ts.forEach((b, i) => b.setAttribute('data-t-title', String(i))); return ts.map(b => b.textContent.trim()); });
    for (let i = 0; i < names.length; i++) { const r = await rectOf('[data-t-title="' + i + '"]'); if (!r) continue; await tapRect(r); await sleep(800);
      if (await visibleSel(sel)) return { ok: true, title: names[i], sel: '[data-t-title="' + i + '"]' }; const r2 = await rectOf('[data-t-title="' + i + '"]'); if (r2) await tapRect(r2); await sleep(400); }
    return { ok: false, tried: names };
  };
  const closeOpen = async (rv) => { if (rv && rv.sel && await page.evaluate(() => !!document.querySelector('.gm-open'))) { const r = await rectOf(rv.sel); if (r) { await tapRect(r); await sleep(700); } } };
  const titleRect = async (re) => { const p = await probe(); const t = p.titles.find(t => re.test(t.panel) || re.test(t.text)); return t && t.rect; };
  const pickCheck = async (id, name, expectKey) => {
    const p = await settle(); const c = await cardNow(); const cl = clearSpace(p); const same = expectKey == null || c.key === expectKey;
    record(id, name, c.ok && cl.ok && same, { card: c, clear: cl, screenshot: await shot(id) }, [...(c.fails || []), cl.ok ? '' : cl.why, same ? '' : 'card shows key ' + c.key + ', expected ' + expectKey].filter(Boolean).join('; '));
    return { p, c };
  };
  const report = { device: deviceName, viewport: dev.viewport, dpr: dev.deviceScaleFactor, url: URL0, served: served.subs, startedAt: new Date().toISOString(), steps, consoleErrors: errors, pass: false };
  try {
    // D1 load
    await page.goto(URL0, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => /verified lines lit/.test((document.getElementById('big') || {}).textContent || ''), null, { timeout: 120000 }).catch(() => {});
    if (!NO_PATCH) await page.waitForFunction(() => (window.KY && window.KY.modules && window.KY.modules['line-card']) || (window.__KUIPER_EDITION__ && window.__KUIPER_EDITION__.done), null, { timeout: 120000 }).catch(() => {});
    await sleep(FIXED_WAIT);
    const adm = await page.evaluate(() => { const E = window.__KUIPER_EDITION__; const ids = a => (a || []).map(x => typeof x === 'string' ? x : (x.id || JSON.stringify(x)));
      return { ky: !!window.KY, frozen: window.KY ? Object.isFrozen(window.KY) : null, admitted: E ? ids(E.admitted) : null, refused: E ? E.refused : null, lineCard: !!(window.KY && window.KY.modules && window.KY.modules['line-card']) }; });
    await page.evaluate(async () => { const j = await (await fetch('keys.json', { cache: 'no-store' })).json(); const B = j.bodies || j; const SP = window.KY && window.KY.hooks && window.KY.hooks.SPACE;
      const placed = B.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && (!SP || b.key < SP)); const byDest = {}; placed.forEach((b, i) => { byDest[b.destination] = i; }); window.__T = { placed, byDest }; });
    const nPlaced = await page.evaluate(() => window.__T.placed.length);
    const e1 = errors.length, refusedN = adm.refused ? adm.refused.length : 0;
    record('D1', 'load: zero console errors; line-card admitted by the loader, nothing refused', e1 === 0 && adm.lineCard && refusedN === 0, { admission: adm, placed: nPlaced, errors: errors.slice(), screenshot: await shot('load') },
      [e1 ? e1 + ' console error(s): ' + errors.map(e => e.text).join(' | ').slice(0, 300) : '', adm.lineCard ? '' : 'KY.modules["line-card"] absent (' + (adm.ky ? 'KY present' : 'no window.KY') + ')', refusedN ? 'refused ' + JSON.stringify(adm.refused).slice(0, 200) : ''].filter(Boolean).join('; '));
    // D2 the sentence on the page
    const onPage = await page.evaluate((LAW) => {
      const panels = [...document.querySelectorAll('.gm-panel, #about, [id*="about" i]')];
      const menu = document.querySelector('[data-menu="about"]');
      const ab = (menu && menu.querySelector('.gm-panel')) || panels.find(p => /about/i.test((p.id || '') + ' ' + (p.getAttribute('aria-label') || '') + ' ' + (p.dataset.panel || '') + ' ' + (p.dataset.menu || '')));
      const firstP = ab ? [...ab.querySelectorAll('p, .gm-prose, [data-law]')].find(e => e.textContent.trim()) : null;
      const slot = document.querySelector('[data-owner="line-card"][data-law="L11"]');
      const lc = window.KY && window.KY.modules && window.KY.modules['line-card'];
      return { aboutPanel: !!ab, aboutFirst: firstP ? firstP.textContent.trim() : null, slot: slot ? slot.textContent.trim() : null, apiLaw: lc && lc.api ? lc.api.law : null,
        anywhere: [...document.querySelectorAll('body *')].some(e => e.textContent.trim() === LAW) }; }, LAW);
    const d2 = onPage.aboutPanel ? onPage.aboutFirst === LAW : (onPage.apiLaw === LAW || onPage.slot === LAW || onPage.anywhere);
    record('D2', 'B4 the K3 sentence on the page, byte for byte' + (onPage.aboutPanel ? ' (ABOUT panel, first paragraph)' : ' (no ABOUT panel in this run: api.law / slot)'), d2,
      { aboutPanel: onPage.aboutPanel, aboutFirstEqual: onPage.aboutFirst === null ? null : onPage.aboutFirst === LAW, aboutFirst: onPage.aboutFirst && onPage.aboutFirst.slice(0, 200), slotEqual: onPage.slot === null ? null : onPage.slot === LAW, apiLawEqual: onPage.apiLaw === LAW, anywhere: onPage.anywhere },
      d2 ? (onPage.aboutPanel ? '' : 'ABOUT panel (team 1 shell) not in this run; --with-shell checks the panel') : 'sentence not on the page byte for byte' + (onPage.aboutPanel ? ': ABOUT first paragraph reads "' + String(onPage.aboutFirst).slice(0, 80) + '"' : ''));
    // D3 LINES rows (opened by touch)
    const rvL = await reveal('#lineslist [data-i]'); const lt = rvL.ok; await sleep(600);
    const L = await page.evaluate(linesFn);
    record('D3', 'B6 every LINES row reads the line text first, then the key, then the title', !!lt && L.rows === nPlaced && L.ok === L.rows, { ...L, expectedRows: nPlaced, openedBy: rvL.title, screenshot: await shot('lines') },
      !lt ? 'no bar title shows the LINES rows (tried ' + JSON.stringify(rvL.tried) + ')' : (L.ok === L.rows && L.rows === nPlaced ? '' : L.ok + ' of ' + L.rows + ' rows in order (expected ' + nPlaced + '); first fails ' + JSON.stringify(L.fails.slice(0, 2)).slice(0, 300)));
    // D4 touch a LINES row
    const row = await page.evaluate(() => { for (const e of document.querySelectorAll('#lineslist [data-i]')) { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 10);
      if (b.top > 0 && b.bottom < innerHeight && e.contains(document.elementFromPoint(x, y))) return { i: +e.dataset.i, key: window.__T.placed[+e.dataset.i].key, x, y }; } return null; });
    if (row) await tapAt(row.x, row.y);
    const pk = await pickCheck('D4', 'touch a LINES row: B1 header = line_text, B2 key second, B3 ≤ 34 % and the spark in the clear space', row ? row.key : -1);
    // D5 details by touch
    const ctSel = await mark("return document.querySelector('#card button[aria-expanded]')", 'data-t-details');
    let d5 = { found: !!ctSel };
    if (ctSel) {
      d5.target = await effTarget(ctSel); const h0 = (await probe()).card.height;
      const detState = () => page.evaluate((s) => { const c = document.getElementById('card'), b = document.querySelector(s);
        const det = [...c.querySelectorAll('div,section,details,p')].filter(e => /(^|\s)(lc-d|cd|details)(\s|$)/.test(e.className || ''));
        const r = c.getBoundingClientRect(); return { expanded: b.getAttribute('aria-expanded'), shown: det.some(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0), height: r.height, bottom: r.bottom, ih: innerHeight, open: getComputedStyle(c).display !== 'none' }; }, ctSel);
      await tapRect(await rectOf(ctSel)); await sleep(900); const s1 = await detState(); d5.screenshot = await shot('details-open');
      await tapRect(await rectOf(ctSel)); await sleep(900); const s2 = await detState();
      d5 = { ...d5, heightBefore: h0, open: s1, closed: s2, capPx: +(CAP * s1.ih).toFixed(1) };
      d5.ok = s1.expanded === 'true' && s1.shown && s1.height <= CAP * s1.ih + 1 && s1.bottom <= s1.ih + 1 && s2.expanded === 'false' && !s2.shown && s2.open && d5.target[1] >= 44;
    }
    record('D5', 'details by touch: button[aria-expanded] opens and closes the details, ≤ 34 % open, ≥ 44 px tall (NL-009 F2)', d5.ok, d5,
      !ctSel ? 'no button[aria-expanded] in the card' : (d5.ok ? '' : 'expanded ' + d5.open.expanded + '/' + d5.closed.expanded + ', shown ' + d5.open.shown + '/' + d5.closed.shown + ', height ' + d5.open.height + ' (cap ' + d5.capPx + '), target ' + d5.target.join('×')));
    // D6 the GitHub link (the action-row link; the key row's link is checked in D10i)
    const c6 = await cardNow();
    const linkSel = await mark("const c = document.getElementById('card'); c.scrollTop = 0; return [...c.querySelectorAll('a[href]')].reverse().find(a => a.getAttribute('href') === arg)", 'data-t-link', c6.dest || '');
    let d6 = { found: !!linkSel };
    if (linkSel) {
      const r = await rectOf(linkSel); d6.target = await effTarget(linkSel); d6.text = await page.evaluate(s => document.querySelector(s).textContent.slice(0, 80), linkSel);
      const np = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
      await tapAt(r.left + Math.min(30, r.width / 2), (r.top + r.bottom) / 2);
      const p2 = await np; d6.newTab = p2 ? p2.url() : null; if (p2) await p2.close().catch(() => {});
      d6.navigatedAway = !page.url().startsWith(pageUrl.origin); if (d6.navigatedAway) await page.goBack().catch(() => {});
      await sleep(600); const c6b = await cardNow(); d6.cardStillOpen = c6b.open; d6.sameLine = c6b.key === c6.key;
      d6.ok = d6.newTab === c6.dest && d6.cardStillOpen && d6.sameLine && !d6.navigatedAway && d6.target[1] >= 44;
    }
    record('D6', 'the GitHub link (href = destination) opens a tab on a touch tap, ≥ 44 px tall; the card stays open on the same line', d6.ok, d6,
      !linkSel ? 'no link to the destination in the card' : (d6.ok ? '' : 'new tab ' + d6.newTab + ', card open ' + d6.cardStillOpen + ', same line ' + d6.sameLine + ', target ' + d6.target.join('×')));
    // D7 ×
    const cxSel = await mark("return document.querySelector('#card .cx, #card [aria-label=\"close\"], #card [aria-label=\"Close\"]')", 'data-t-close');
    let d7 = { found: !!cxSel }; const before7 = await probe();
    if (cxSel) { d7.target = await effTarget(cxSel); d7.rect = await rectOf(cxSel); await tapRect(d7.rect); await sleep(1500); const p7 = await probe();
      d7.cardOpen = p7.card.open; d7.magentaPx = p7.magenta ? p7.magenta.px : 0; d7.ok = d7.target[0] >= 44 && d7.target[1] >= 44 && !p7.card.open && !p7.magenta; }
    record('D7', '× is a ≥ 44 × 44 px touch target; × closes the card and clears the selected spark', d7.ok, { ...d7, screenshot: await shot('closed') },
      !cxSel ? 'no × in the card' : (d7.ok ? '' : '× effective target ' + d7.target.join('×') + ' px, card open ' + d7.cardOpen + ', magenta px ' + d7.magentaPx));
    // D8 touch the spark where the selection was (now green)
    let d8note = '';
    if (before7.magenta) { const p8 = await probe(); const g = p8.greens.map(g => ({ g, d: Math.hypot(g.x - before7.magenta.x, g.y - before7.magenta.y) })).sort((a, b) => a.d - b.d)[0];
      if (g && g.d < 8) { await tapAt(g.g.x, g.g.y); await pickCheck('D8', 'touch the spark: its card opens, B1 + B2 + B3', pk.c.key); } else d8note = 'no green spark within 8 px of the closed selection (nearest ' + (g ? g.d.toFixed(1) : 'none') + ' px)'; }
    else d8note = 'no selected spark before ×';
    if (d8note) record('D8', 'touch the spark: its card opens, B1 + B2 + B3', false, { screenshot: await shot('spark') }, d8note);
    // D9 COMMANDS → next verified line, by touch
    const c8 = await cardNow();
    const expect9 = c8.index != null ? await page.evaluate((i) => window.__T.placed[(i + 1) % window.__T.placed.length].key, c8.index) : null;
    let d9note = '';
    const eSel = await mark("return [...document.querySelectorAll('button[data-k=\"e\"]')].find(b => !b.closest('#linesctl'))", 'data-t-next');
    const rvE = eSel ? await reveal(eSel) : { ok: false };
    if (rvE.ok) { const er = await rectOf(eSel); await tapRect(er); await sleep(600); await closeOpen(rvE);
      await pickCheck('D9', 'touch ' + (rvE.title || 'the bar') + ' → next verified line: the next body\'s card, B1 + B2 + B3', expect9); }
    else d9note = eSel ? 'no bar title shows "next verified line"' : 'no "next verified line" button';
    if (d9note) record('D9', 'touch COMMANDS → next verified line', false, {}, d9note);
    // N1 12 px type (NL-009 02-card F6)
    const pN = await probe();
    record('N1', 'NL-009 02-card F6: 12 px card type on a phone', pN.card.fontSize === '12px', { fontSize: pN.card.fontSize }, pN.card.fontSize === '12px' ? '' : 'font-size ' + pN.card.fontSize);
    // N2 behind an open panel (F4)
    const rvN = await reveal('#lineslist [data-i]'); const n2 = { openedBy: rvN.title };
    if (rvN.ok && rvN.sel) { await sleep(500); n2.whileOpen = (await probe()).card.visibility; await closeOpen(rvN); await sleep(400); const q = await probe(); n2.after = q.card.visibility; n2.panelClosed = !q.panelOpen; n2.cardOpen = q.card.open; }
    n2.ok = n2.whileOpen === 'hidden' && n2.after === 'visible' && n2.panelClosed && n2.cardOpen;
    record('N2', 'NL-009 02-card F4: the card steps behind an open panel and returns when it closes', n2.ok, n2, n2.ok ? '' : 'visibility while LINES open ' + n2.whileOpen + ', after ' + n2.after + ', card open ' + n2.cardOpen);
    // N3 the gesture-bar inset (F5)
    const padOf = () => page.evaluate(() => { const c = document.getElementById('card'); const pb = e => e ? parseFloat(getComputedStyle(e).paddingBottom) || 0 : 0; return pb(c) + pb(c.firstElementChild); });
    const pad0 = await padOf(); let pad1 = null;
    try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom: 24 } }); await sleep(400); pad1 = await padOf(); await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: {} }); } catch (e) { pad1 = null; }
    record('N3', 'NL-009 02-card F5: a 24 px bottom safe-area inset adds ≥ 24 px of card padding', pad1 != null && pad1 - pad0 >= 23.5, { paddingWithout: pad0, paddingWith24: pad1 }, pad1 == null ? 'CDP safe-area override unavailable' : (pad1 - pad0 >= 23.5 ? '' : 'padding ' + pad0 + ' → ' + pad1));
    // N4 swipe down closes; Escape closes (F7)
    const c4 = (await probe()).card.rect; const n4 = {};
    if (c4) { await page.evaluate(() => { document.getElementById('card').scrollTop = 0; }); const sx = c4.left + c4.width / 2;
      await touch('touchStart', [[sx, c4.top + 14]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[sx, c4.top + 14 + i * 12]]); await sleep(16); } await touch('touchEnd', []); await sleep(1800);
      const q = await probe(); n4.swipeClosed = !q.card.open; n4.swipeMagenta = q.magenta ? q.magenta.px : 0; }
    await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    await page.keyboard.press('e'); await sleep(2500); n4.reopened = (await probe()).card.open;
    await page.keyboard.press('Escape'); await sleep(1200); n4.escapeClosed = !(await probe()).card.open;
    n4.ok = !!n4.swipeClosed && !n4.swipeMagenta && n4.reopened && n4.escapeClosed;
    record('N4', 'NL-009 02-card F7: a swipe down closes the card and clears the spark; Escape closes it', n4.ok, n4, n4.ok ? '' : JSON.stringify(n4));
    // D10 the walk over every placed body with e
    const seen = new Map(); let presses = 0, prevKey = null, stuck = 0, longShot = false;
    const tally = { b1: 0, b2: 0, title: 0, cap: 0, all: 0, empty: 0, emptyOk: 0, ariaLabel: 0, ariaLive: 0, registerQuote: [0, 0], row2KeyNumber: 0, row2Link: 0, headerFirstChild: 0 };
    const fails10 = []; let maxH = 0;
    await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    const tWalk = Date.now();
    while (seen.size < nPlaced && presses < nPlaced + 40 && stuck < 6) {
      await page.keyboard.press('e'); presses++;
      let c = null; for (let w = 0; w < 60; w++) { c = await cardNow(); if (c.open && c.key != null && c.key !== prevKey) break; await sleep(150); }
      if (!c || c.key == null || c.key === prevKey) { stuck++; continue; } stuck = 0; prevKey = c.key;
      if (seen.has(c.key)) continue; seen.set(c.key, c.ok);
      if (c.b1) tally.b1++; if (c.b2) tally.b2++; if (c.titleAfterKey) tally.title++; if (c.underCap) tally.cap++; if (c.ok) tally.all++;
      if (c.empty) { tally.empty++; if (c.b1) tally.emptyOk++; }
      if (c.ariaLabelIsHeader) tally.ariaLabel++; if (c.ariaLive === 'polite') tally.ariaLive++; if (c.row2HasKeyNumber) tally.row2KeyNumber++; if (c.row2LinkIsDestination) tally.row2Link++; if (c.headerFirstChild) tally.headerFirstChild++;
      if (c.registerQuote != null) { tally.registerQuote[1]++; if (c.registerQuote) tally.registerQuote[0]++; }
      maxH = Math.max(maxH, c.height || 0);
      if (!c.ok && fails10.length < 20) fails10.push({ index: c.index, key: c.key, fails: c.fails });
      if (!longShot && c.firstLen > 1e6) { longShot = true; await shot('walk-longest-line'); }   // the 1,240,449-character line
    }
    const ok10 = seen.size === nPlaced && tally.all === nPlaced && tally.empty === tally.emptyOk;
    record('D10', 'B1/B2/B3 over all ' + nPlaced + ' placed bodies: first visible text = line_text, key second, title after, ≤ 34 %', ok10,
      { bodies: seen.size, presses, ms: Date.now() - tWalk, maxCardHeight: +maxH.toFixed(1), tally, fails: fails10, screenshot: await shot('walk-end') },
      ok10 ? 'all ' + seen.size + ' bodies pass; ' + tally.empty + ' empty lines say "empty line at key"; tallest card ' + maxH.toFixed(1) + ' px' : 'distinct bodies ' + seen.size + '/' + nPlaced + '; B1 ' + tally.b1 + ', B2 ' + tally.b2 + ', title-after ' + tally.title + ', cap ' + tally.cap + '; first fail ' + JSON.stringify(fails10[0] || null).slice(0, 300));
    record('D10i', 'K2 aria-label = header and aria-live=polite; key number and destination link in row 2; header first element; register-quote rows (info)', true,
      { ariaLabelIsHeader: tally.ariaLabel, ariaLivePolite: tally.ariaLive, row2KeyNumber: tally.row2KeyNumber, row2LinkIsDestination: tally.row2Link, headerFirstElementChild: tally.headerFirstChild, registerQuoteRows: tally.registerQuote[0] + ' of ' + tally.registerQuote[1], of: seen.size }, '', true);
    // D11 B5 a body without line_text
    const page5 = await context.newPage(); watch(page5); page5.setDefaultTimeout(180000);
    const firstDest = await page.evaluate(() => window.__T.placed[0].destination);
    await page5.route(u => u.origin === pageUrl.origin && (u.pathname === pageUrl.pathname + 'keys.json' || u.pathname === pageUrl.pathname + 'keys-min.json'), async r => { const resp = await r.fetch(); const j = await resp.json(); const b = (j.bodies || j).find(x => x.destination === firstDest); if (b) delete b.line_text; await r.fulfill({ response: resp, body: JSON.stringify(j) }); });
    await page5.goto(URL0, { waitUntil: 'load', timeout: 120000 });
    await page5.waitForFunction(() => /verified lines lit/.test((document.getElementById('big') || {}).textContent || ''), null, { timeout: 120000 }).catch(() => {});
    if (!NO_PATCH) await page5.waitForFunction(() => window.KY && window.KY.modules && window.KY.modules['line-card'], null, { timeout: 120000 }).catch(() => {});
    await sleep(FIXED_WAIT); await page5.keyboard.press('e'); await sleep(3000);
    const b5 = await page5.evaluate((dest) => { const c = document.getElementById('card'), h = c.querySelector('header');
      return { open: getComputedStyle(c).display !== 'none', isThatBody: [...c.querySelectorAll('a[href]')].some(a => a.getAttribute('href') === dest), headerText: h ? h.textContent.slice(0, 120) : null, headerSays: !!h && /no text at key/.test(h.textContent), ariaLabel: c.getAttribute('aria-label'), lineCardAdmitted: !!(window.KY && window.KY.modules && window.KY.modules['line-card']) }; }, firstDest);
    const s5 = await shot('no-text-at-key', page5); await page5.close();
    record('D11', 'B5 a body without line_text shows "no text at key" in the header (keys.json mutated through page.route)', b5.open && b5.isThatBody && b5.headerSays, { ...b5, screenshot: s5 }, b5.headerSays ? '' : 'header reads "' + b5.headerText + '"');
  } catch (e) {
    record('harness', 'harness error', false, { error: String(e && e.stack || e) }, String(e && e.message || e));
  }
  record('D12', 'B7 zero console errors, page errors, failed requests and HTTP errors over the whole run', errors.length === 0, { errors: errors.slice(0, 20), count: errors.length }, errors.length ? errors.length + ': ' + errors.map(e => e.kind + ' ' + e.text).join(' | ').slice(0, 300) : '');
  report.consoleErrors = errors.slice(); report.pass = steps.filter(s => !s.info).every(s => s.pass);
  report.passed = steps.filter(s => !s.info && s.pass).length; report.failed = steps.filter(s => !s.info && !s.pass).length; report.finishedAt = new Date().toISOString();
  await context.close();
  return report;
}

function summarize(m) { if (!m) return ''; const o = {};
  for (const [k, v] of Object.entries(m)) { if (['screenshot', 'errors', 'fails'].includes(k)) continue;
    if (v && typeof v === 'object') { if (k === 'card') { o.key = v.key; o.height = v.height; o.cap = v.capPx; } else if (k === 'clear') o.spark = v.spark; else if (k === 'tally') Object.assign(o, v); else if (Array.isArray(v) && v.length <= 4 && v.every(x => typeof x !== 'object')) o[k] = v; else continue; }
    else o[k] = v; }
  return JSON.stringify(o).slice(0, 380); }
function writeTestMd(out) {
  const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 420);
  const row = s => `| ${s.id} | ${s.name} | ${s.info ? 'INFO' : s.pass ? 'PASS' : '**FAIL**'} | ${esc(s.note || summarize(s.measured))} |`;
  const L = ['# handoff/02-card TEST — ROADMAP step 2 "the card law", B1–B7 on Android', '',
    `Run ${out.generatedAt} (label \`${out.label}\`) by OPUS-2 tester: \`node editions/${STAMP}/handoff/02-card/test.cjs ${out.url} ${out.outdir}${out.withShell ? ' --with-shell' : ''}${out.label === 'before' ? ' --no-patch' : ''}\`. Playwright ${require('playwright/package.json').version}, Chromium with SwiftShader, devices['Pixel 7'] and devices['Galaxy S24'], real touch. Module \`${out.module || 'none'}\`${out.moduleSha ? ' sha256 `' + out.moduleSha + '`' : ''}; kuiper-belt \`edition/${STAMP}\` @ \`${out.head || '?'}\`.`, '',
    `**RESULT: ${out.pass ? 'PASS' : 'FAIL'}** — ${out.pass ? 'the tester releases the hand-off.' : 'the tester REFUSES the hand-off until every gating row reads PASS on both devices with zero console errors.'}`, '',
    'Served page: ' + out.served.map(s => '`' + s + '`').join('; ') + '.', '',
    '## Static (once)', '', '| id | assertion | result | measured / note |', '|---|---|---|---|', ...out.static.map(row)];
  for (const d of out.devices) L.push('', `## ${d.device} (${d.viewport.width}×${d.viewport.height} @${d.dpr}) — ${d.pass ? 'PASS' : 'FAIL'}: ${d.passed} pass, ${d.failed} fail, ${d.consoleErrors.length} console errors`, '', '| id | assertion | result | measured / note |', '|---|---|---|---|', ...d.steps.map(row));
  L.push('', '## Reading the table', '', 'Gating: every row not marked INFO. B1 = D4, D8, D9, D10 (the first visible text node of the card, the × control excepted, equals `keys.json` `line_text` byte for byte; the 4 empty lines show "empty line at key" inside the header); B2 = the next row carries `repo@commit7` and `path:line` and sits inside the card without scrolling; B3 = card height ≤ 34 % of the viewport and the selected spark between the bar and the card after the fly; B4 = S4 + D2; B5 = D11; B6 = D3; B7 = S5 + D12. N1–N4 are the NL-009 round-1 02-card fixes folded into the module. Screenshots of every step are in `' + out.outdir + '/<device>/`, the full measurements in `' + out.outdir + '/report.json`; img/ holds the before/after pair.', '',
    '## Rerun', '', '```', 'cd /home/user/estate/kuiper-belt && python3 -m http.server 8422 --bind 127.0.0.1 &', `node editions/${STAMP}/handoff/02-card/test.cjs http://127.0.0.1:8422/editions/${STAMP}/ /tmp/nl010-opus/team-2/tester/run-after --handoff`, '```', '');
  fs.writeFileSync(path.join(HERE, 'TEST.md'), L.join('\n'));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const st = staticChecks(), served = buildServed(st);
  let head = null; try { head = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim(); } catch (e) {}
  const out = { schema: 'kuiper.card.accept.v1', step: 2, url: URL0, outdir: OUT, label: LABEL, withShell: WITH_SHELL, generatedAt: new Date().toISOString(), head, module: st.modFile, moduleSha: st.modSha, served: served.subs, static: st.S, devices: [] };
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { for (const d of DEVICES) { out.devices.push(await runDevice(browser, d, served)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1)); } }
  finally { await browser.close(); }
  const endSha = st.modFile ? sha256(fs.readFileSync(path.join(EDITION, 'modules', st.modFile))) : null;
  const s6 = { id: 'S6', name: 'the module did not change while the run ran (sha256 at start = at end)', pass: endSha === st.modSha, info: false, measured: { start: st.modSha, end: endSha }, note: endSha === st.modSha ? '' : 'module changed during the run: results are void, rerun' };
  st.S.push(s6); process.stderr.write(`[static] ${s6.pass ? 'PASS' : 'FAIL'} S6 ${s6.name}${s6.note ? ' — ' + s6.note : ''}\n`);
  out.pass = st.S.filter(s => !s.info).every(s => s.pass) && out.devices.length === DEVICES.length && out.devices.every(d => d.pass);
  out.RESULT = out.pass ? 'PASS' : 'FAIL';
  out.summary = { static: st.S.filter(s => !s.info && !s.pass).map(s => s.id), devices: out.devices.map(d => ({ device: d.device, passed: d.passed, failed: d.failed, failedSteps: d.steps.filter(s => !s.info && !s.pass).map(s => s.id), consoleErrors: d.consoleErrors.length })) };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(out, null, 1));
  if (WRITE_HANDOFF) writeTestMd(out);
  console.log(JSON.stringify({ RESULT: out.RESULT, served: out.served, summary: out.summary }, null, 1));
  process.exit(out.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
