// shots.cjs: the four hand-off screenshots (Pixel 7, CSS scale), one browser each; harness flags as test.cjs
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = process.argv[2] || '/tmp/nl010-opus/team-12/tester/shots'; fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8601/see-through/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cases = [
  ['01-sub-drax-star-key-row', '#sub=Drax&view=kuiper', 'arrive'],
  ['02-key-line-of-code-amber-ring', '#key=36064705400', 'stars'],
  ['03-key-space-remap', '#key=' + Math.floor(1182.5 * 59637070538 / 20000) + '&space=59637070538', 'stars'],
  ['04-repo-gridatlas-lit', '#repo=gridatlas', 'stars'],
];
(async () => {
  for (const [name, hash, mode] of cases) {
    const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const p = await (await b.newContext({ ...devices['Pixel 7'] })).newPage();
    await p.goto(BASE + hash);
    await p.waitForFunction(() => window.__descent && window.__descent.state(), null, { timeout: 60000 });
    if (mode === 'arrive') await p.waitForFunction(() => { const s = window.__descent.state(); return s.T >= 0 && s.D > 7.99 && !s.flight; }, null, { timeout: 90000 }).catch(() => {});
    await sleep(mode === 'arrive' ? 3000 : 9000);
    const s = await p.evaluate(() => window.__descent.state());
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await p.screenshot({ path: path.join(OUT, name + '.png'), scale: 'css', timeout: 120000 }); ok = true; } catch (e) { console.log(name, 'retry', a); } }
    console.log(name, ok ? 'OK' : 'FAILED', JSON.stringify({ T: s.T, note: s.note, view: s.view }));
    await b.close();
  }
})();
