#!/usr/bin/env node
// handoff/00-stub/stub-serve.cjs: the integrator's loader stub (Opus team 10, NL-010 step 10). Apache-2.0 (kuiper-belt).
//
//   node stub-serve.cjs <port> [--add modules/<stamp>-<name>.js ...] [--only]
//
// Serves the kuiper-belt root (two folders up from editions/202611012135/) on 127.0.0.1:<port>, exactly as the
// integrator's journey does, with two substitutions so a team can test its module against the page AS INTEGRATED NOW:
//   1. editions/202611012135/index.html is the integrated page on disk. If the page on disk does not yet build
//      window.KY (Opus 4 not yet admitted), it is served with handoff/04-loader/index.html.patch applied in memory.
//   2. editions/202611012135/modules.json is the integrated manifest on disk (or handoff/04-loader/modules.json when
//      the disk one has no "hooks" field), plus one record per --add, built from the file AT EACH REQUEST: sha256,
//      bytes, generation and id from line 1 of the module, requires/provides from handoff/*/MODULE.json when a record
//      there names the same path, else from the first `requires: [...]` / `provides: [...]` literal in the file.
//      --only drops every record already in the manifest except hello and the --add ones.
// Nothing on disk is written. A pass under the stub is a pre-admission pass, never the admission: the integrator
// admits only what is in modules.json and runs the journey on the page as served without this script.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const { execFileSync } = require('child_process');
const ED = path.resolve(__dirname, '..', '..'), ROOT = path.resolve(ED, '..', '..'), STAMP = path.basename(ED);
const argv = process.argv.slice(2), port = +argv[0];
if (!port) { console.error('usage: node stub-serve.cjs <port> [--add modules/<file>.js ...] [--only]'); process.exit(2); }
const adds = []; argv.forEach((a, i) => { if (a === '--add' && argv[i + 1]) adds.push(argv[i + 1]); });
const only = argv.includes('--only');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.cjs': 'text/javascript', '.json': 'application/json',
  '.tsv': 'text/tab-separated-values', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.md': 'text/markdown', '.txt': 'text/plain' };
function page() {
  const disk = fs.readFileSync(path.join(ED, 'index.html'), 'utf8');
  if (disk.includes('window.KY = KY')) return disk;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ky-stub-')), d = path.join(tmp, 'editions', STAMP);
  fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'index.html'), disk);
  execFileSync('patch', ['-p1', '-s', '-i', path.join(ED, 'handoff/04-loader/index.html.patch')], { cwd: tmp });
  const out = fs.readFileSync(path.join(d, 'index.html'), 'utf8'); fs.rmSync(tmp, { recursive: true, force: true }); return out;
}
function listLit(src, name) { const m = src.match(new RegExp(name + "\\s*:\\s*\\[([^\\]]*)\\]")); return m ? (m[1].match(/'([^']+)'|"([^"]+)"/g) || []).map(s => s.slice(1, -1)) : []; }
function recordFor(rel) {
  const buf = fs.readFileSync(path.join(ED, rel)), src = buf.toString('utf8');
  const head = src.split('\n')[0].match(/^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\), ([^*]*)/);
  if (!head) throw new Error(rel + ': line 1 is not "/* kuiper module <id>, generation <stamp> (UTC), <licence>"');
  let given = null;
  for (const dir of fs.readdirSync(path.join(ED, 'handoff'))) { const f = path.join(ED, 'handoff', dir, 'MODULE.json');
    if (fs.existsSync(f)) { try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); if (j.path === rel) given = j; } catch (e) { /* not JSON yet */ } } }
  return Object.assign({ id: head[1], generation: head[2], path: rel, requires: listLit(src, 'requires'), provides: listLit(src, 'provides'),
    licence: head[3].trim() || 'Apache-2.0', reads: [], writes: [], creates_controls: 'stub', team: 'stub', step: 0, proof: 'stub' }, given || {},
    { sha256: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length, byte_budget: Math.max((given && given.byte_budget) || 0, buf.length) });
}
function manifest() {
  let m = JSON.parse(fs.readFileSync(path.join(ED, 'modules.json'), 'utf8'));
  if (!m.hooks) m = JSON.parse(fs.readFileSync(path.join(ED, 'handoff/04-loader/modules.json'), 'utf8'));
  if (only) { m.order = m.order.filter(id => id === 'hello'); m.modules = m.modules.filter(r => r.id === 'hello'); }
  for (const rel of adds) { const r = recordFor(rel); m.modules = m.modules.filter(x => x.id !== r.id).concat([r]); if (!m.order.includes(r.id)) m.order.push(r.id); }
  return JSON.stringify(m, null, 1) + '\n';
}
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  try {
    if (u === '/editions/' + STAMP + '/' || u === '/editions/' + STAMP + '/index.html') { res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' }); return res.end(page()); }
    if (u === '/editions/' + STAMP + '/modules.json') { res.writeHead(200, { 'content-type': TYPES['.json'], 'cache-control': 'no-store' }); return res.end(manifest()); }
    let f = path.join(ROOT, path.normalize(u)); if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  } catch (e) { res.writeHead(500, { 'content-type': 'text/plain' }); res.end(String(e && e.message || e)); }
}).listen(port, '127.0.0.1', () => console.log('stub: http://127.0.0.1:' + port + '/editions/' + STAMP + '/ (adds: ' + (adds.join(', ') || 'none') + (only ? ', --only' : '') + ')'));
