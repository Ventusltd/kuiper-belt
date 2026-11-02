// fix-check.cjs: the 01:35 fixes (R1 clean re-read, ring for star keys, space named, remap over 20,000 keys, BEYOND words)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SPACE = 63340120796, OLD = 59637070538, key = (j, s) => Math.floor((j + 0.5) * s / 20000);
const res = []; const ck = (n, ok, g) => { res.push({ n, ok: !!ok, g }); console.log((ok ? 'PASS ' : 'FAIL ') + n + '  ' + JSON.stringify(g)); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ ...devices['Pixel 7'] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/cartocdn/.test(m.text() + m.location().url)) errs.push(m.text() + ' ' + m.location().url); });
  await p.goto('http://127.0.0.1:8601/see-through/#repo=nosuchrepo');
  await p.waitForFunction(() => window.__descent && window.__descent.state() && /NOSUCHREPO/.test(window.__descent.state().note), null, { timeout: 120000 });
  const go = async h => { await p.evaluate(h => { location.hash = h; }, h); await sleep(1500); return p.evaluate(() => { const s = window.__descent.state(); return { T: s.T, note: s.note, box: document.querySelector('input').value, ring: window.__descent.ring() }; }); };
  let s = await go('#bogus=1'); ck('R1: #repo=nosuchrepo then #bogus=1 names bogus', s.note === 'LINK FIELD BOGUS NOT UNDERSTOOD', s);
  s = await go('#key=638151717'); ck('#key=<star of Cowley>: box, note and an amber ring', s.box === 'Cowley Substation' && /^THE STAR THAT LANDS ON COWLEY/.test(s.note) && s.ring && s.ring.key === 638151717, s);
  s = await go('#key=36064705400'); ck('R1: then #key=36064705400 clears the box', s.box === '' && s.note === 'KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION' && s.ring, s);
  s = await go('#key=' + SPACE); ck('BEYOND words with (SPACE n)', s.note === 'KEY 63,340,120,796 IS BEYOND THIS SKY (SPACE 63,340,120,796)', s);
  s = await go('#key=36064705400&space=abc'); ck('non-integer space named', s.note === 'LINK FIELD SPACE NOT UNDERSTOOD · KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION', s);
  s = await go('#key=' + key(12345, OLD) + '&space=' + OLD); ck('remap of a non-substation star key (j 12,345) to this sky', s.note === 'STAR KEY REMAPPED · SKY 59,637,070,538 → 63,340,120,796 · KEY ' + key(12345, SPACE).toLocaleString('en-US') + ' · A LINE OF CODE, NOT A SUBSTATION' && s.ring && s.ring.key === key(12345, SPACE), s);
  s = await go('#key=' + key(1182, OLD) + '&space=' + OLD); ck('remap of the star of Drax', s.box === 'Drax' && /^STAR KEY REMAPPED · SKY 59,637,070,538 → 63,340,120,796 · THE STAR THAT LANDS ON DRAX/.test(s.note), s);
  ck('0 page errors, 0 console errors apart from cartocdn', errs.length === 0, errs.slice(0, 5));
  fs.writeFileSync('/tmp/nl010-opus/team-12/tester/out/report-fixcheck.json', JSON.stringify({ when: new Date().toISOString(), res }, null, 1));
  console.log('RESULT ' + (res.every(r => r.ok) ? 'PASS' : 'FAIL') + ' ' + res.filter(r => r.ok).length + '/' + res.length);
  await b.close();
})().catch(e => { console.error(e); process.exit(2); });
