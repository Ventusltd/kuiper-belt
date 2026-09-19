// tools/card_parity.mjs - THE WAFER'S CARD AND THE KUIPER'S CARD MUST SHOW THE SAME CODE.
//
// Vikram, 20 Sept: "The pop up card doesn't show code from GitHub, this is already built in wafer iterations
// if you use a CI runner to compare." So parity with the wafer is the definition of done, and it is checked
// on a machine that is not ours, on a schedule, by opening both pages headless:
//
//   1  the wafer (galaxies-wafers iteration 31, the canonical card) is asked to open SEEDED lines with its own
//      openLine(key), until twenty of them show code. For each, the card's own heading gives the place
//      (repository, commit, path, line) and its code window gives the text, row by row.
//   2  the Kuiper's code window is asked for THE SAME PLACE (window.__kuiperCode), which is the one reader and
//      the one window its cards use.
//   3  every row both windows show must carry the same text, and the marked row must be among them. One
//      difference fails the run, and the two texts are printed side by side.
//
//   node tools/card_parity.mjs            (CHROME, WAFER_URL, KUIPER_URL, LINES and SEED may be set)
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const WAFER = process.env.WAFER_URL || 'https://ventusltd.github.io/galaxies-wafers/iterations/31-code-card-everywhere/';
const KUIPER = process.env.KUIPER_URL || 'https://globalgrid2050.com/kuiper/';
const WANT = Number(process.env.LINES || 20), TRIES = WANT * 12;
let seed = Number(process.env.SEED || 20260920) >>> 0;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const chrome = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(existsSync);
if (!chrome) { console.error('REFUSED: no Chrome found; set CHROME'); process.exit(2); }

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--window-size=1366,900'] });
const fail = async why => { console.error('PARITY FAIL: ' + why); await browser.close(); process.exit(1); };

// ---- 1. the wafer -----------------------------------------------------------------------------------------
const wafer = await browser.newPage();
await wafer.goto(WAFER, { waitUntil: 'networkidle2', timeout: 120000 });
const max = await wafer.evaluate(async () => { for (let i = 0; i < 300; i++) { const m = document.body.innerText.match(/1 to ([\d,]+)/); await new Promise(r => setTimeout(r, 100)); if (window.__wafer) break; }
  return 385223; });
const places = [];
for (let t = 0; t < TRIES && places.length < WANT; t++) {
  const key = 1 + Math.floor(rnd() * max);
  const got = await wafer.evaluate(async k => {
    const m = await import(new URL('card.mjs', location.href).href);
    m.openLine(k);
    for (let i = 0; i < 200; i++) { await new Promise(r => setTimeout(r, 100));
      const tag = document.querySelector('#card .cc-tag'); const st = tag && tag.dataset.s;
      if (st === 'OK') break; if (st === 'EMPTY' || st === 'FAIL') return { state: st }; }
    const head = document.querySelector('#card .cc-codehead'), link = head && head.querySelector('a'), pre = document.querySelector('#card .cc-code');
    if (!head || !link || !pre) return { state: 'no code window' };
    const line = (head.textContent.match(/line (\d+)/) || [])[1];
    return { state: 'OK', href: link.href, line: Number(line), text: pre.textContent };
  }, key);
  if (got.state !== 'OK') continue;
  const m = got.href.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([0-9a-f]{40})\/([^#]+)/);
  if (!m) continue;
  const rows = new Map();
  for (const r of got.text.split('\n')) { const x = r.match(/^\s*(\d+)[ *] (.*)$/) || r.match(/^\s*(\d+)[ *]$/); if (x) rows.set(Number(x[1]), x[2] || ''); }
  places.push({ key, owner: m[1], repo: m[2], commit: m[3], path: decodeURIComponent(m[4]), line: got.line, rows });
  console.log(`wafer  line ${key}: ${m[2]} ${decodeURIComponent(m[4])} line ${got.line} (${rows.size} rows shown)`);
}
if (places.length < WANT) await fail(`the wafer's card showed code for only ${places.length} of ${WANT} seeded lines in ${TRIES} tries`);

// ---- 2. the Kuiper, asked for the same places ------------------------------------------------------------------
const kuiper = await browser.newPage();
await kuiper.goto(KUIPER, { waitUntil: 'networkidle2', timeout: 120000 });
await kuiper.waitForFunction(() => typeof window.__kuiperCode === 'function', { timeout: 120000 })
  .catch(() => fail('the Kuiper never offered its code window (window.__kuiperCode): is the card part released?'));

// ---- 3. the same text, row for row ---------------------------------------------------------------------------
let shared = 0; const differences = [];
for (const p of places) {
  const k = await kuiper.evaluate((o, r, c, f, l) => window.__kuiperCode(o, r, c, f, l).catch(e => ({ error: String(e && e.message || e) })), p.owner, p.repo, p.commit, p.path, p.line);
  if (k.error) { differences.push(`${p.repo} ${p.path} line ${p.line}: the Kuiper could not read it: ${k.error}`); continue; }
  // A CHECK NOBODY HAS TRIED TO FOOL IS A CHECK NOBODY KNOWS THE STRENGTH OF. PLANT=1 changes one letter of one
  // row the Kuiper returned; the run must then FAIL, and a workflow step asserts that it does.
  if (process.env.PLANT === '1' && p === places[0] && k.rows.length) k.rows[0].text = k.rows[0].text + ' planted';
  let both = 0, marked = false;
  for (const row of k.rows) { if (!p.rows.has(row.n)) continue; both++; if (row.n === p.line) marked = true;
    if (p.rows.get(row.n) !== row.text) differences.push(`${p.repo} ${p.path} line ${row.n}\n   wafer : ${JSON.stringify(p.rows.get(row.n))}\n   kuiper: ${JSON.stringify(row.text)}`); }
  if (!marked) differences.push(`${p.repo} ${p.path}: the marked line ${p.line} is not in both windows`);
  shared += both;
  console.log(`kuiper same place: ${both} rows in both windows, marked line ${marked ? 'among them' : 'MISSING'}`);
}
await browser.close();
if (differences.length) { console.error('\nPARITY FAIL: ' + differences.length + ' differences\n' + differences.slice(0, 20).join('\n')); process.exit(1); }
console.log(`\nPARITY PASS: ${places.length} seeded lines, ${shared} rows shown by both cards, every one the same text (seed ${process.env.SEED || 20260920})`);
