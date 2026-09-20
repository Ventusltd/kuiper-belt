// tools/page_faces.mjs - open every page the card may send a visitor to, ONCE, and say whether it WORKS FOR A STRANGER.
//
// WHY. Vikram followed the card to a page that answered 200 and showed a black screen: "GRIDATLAS COMPOSITION
// FAILED, immutable shell HTTP 404". It was a kept extract of another application's page, sitting in a sources
// folder, which can never work where it sits. tools/pages.py had checked that the address ANSWERS. The site's own
// lesson, learned once already tonight, is to compare what is SHOWN, not status codes.
//
// WHAT IT ASKS OF EACH PAGE, in one headless browser: it loads; it is not blank (words on its face, or a picture
// being drawn); and none of the words a broken page says are on its face. The answer is written beside the table
// as cosmos/page-faces.tsv, and tools/pages.py drops every page that failed, so that work falls to the next rung
// of the ladder instead of to a dead end.
//
//   node tools/page_faces.mjs <cosmos folder>          (CHROME may be set)
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cosmos = process.argv[2];
if (!cosmos || !existsSync(join(cosmos, 'pages.tsv'))) { console.error('REFUSED: give the cosmos folder that holds pages.tsv'); process.exit(2); }
const chrome = process.env.CHROME || ['/usr/bin/google-chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(existsSync);
// THE WORDS A BROKEN PAGE SAYS. Kept short and exact: a page about errors is not a broken page, so these are the
// phrases this estate's own pages use when they fail, and the browser's own.
const BROKEN = [/COMPOSITION FAILED/i, /CRITICAL ERROR/i, /HTTP 404/i, /\b404\b.{0,20}not found/i, /page not found/i, /could not (be )?load/i,
  /did not open/i, /failed to (load|fetch)/i, /is not available\. refusing/i];

const pages = readFileSync(join(cosmos, 'pages.tsv'), 'utf8').split('\n').filter(l => l && l[0] !== '#').map(l => l.split('\t'));
const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--window-size=1100,800'] });
const tab = await browser.newPage();
await tab.setViewport({ width: 1100, height: 800 });
const out = ['# address\tworks\twhy'];
let bad = 0;
for (const [id, address] of pages) {
  let works = 'yes', why = '';
  try {
    const r = await tab.goto(address, { waitUntil: 'networkidle2', timeout: 45000 });
    if (!r || r.status() !== 200) { works = 'no'; why = 'answered ' + (r ? r.status() : 'nothing'); }
    else {
      await new Promise(f => setTimeout(f, 1200));
      const face = await tab.evaluate(() => ({ text: (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').trim(),
        drawn: document.querySelectorAll('canvas, svg, img, video, iframe').length }));
      const said = BROKEN.find(re => re.test(face.text.slice(0, 4000)));
      if (said) { works = 'no'; why = 'its face says: ' + (face.text.match(said) || [''])[0]; }
      else if (face.text.length < 20 && !face.drawn) { works = 'no'; why = 'blank: no words and nothing drawn'; }
    }
  } catch (e) { works = 'no'; why = 'did not load: ' + String(e && e.message || e).slice(0, 80); }
  if (works === 'no') { bad++; console.log('  NO   ' + address + '   ' + why); }
  out.push([address, works, why].join('\t'));
}
await browser.close();
writeFileSync(join(cosmos, 'page-faces.tsv'), out.join('\n') + '\n');
console.log(`\n${pages.length} pages opened once: ${pages.length - bad} work for a stranger, ${bad} do not and will be dropped`);
