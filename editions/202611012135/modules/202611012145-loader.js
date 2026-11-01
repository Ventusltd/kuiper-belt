/* kuiper loader reference, generation 202611012145 (UTC), Apache-2.0 (kuiper-belt) */
// NOT A MODULE and never fetched: the reviewable copy of the hook table and loader that Opus team 4 hands to the
// integrator as handoff/04-loader/index.html.patch. The bytes between the two marker lines below are byte-identical
// to the block the patch inserts in editions/202611012135/index.html before requestAnimationFrame(frame); the block
// runs only inside that page script, where the engine names it closes over (cx, litRepo, PANELS, refuse, kyWafer, ...)
// are in scope. Listed in modules.json under "references", not in "order" (E6 checks the two copies agree).
// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · begin (Opus team 4, step 4)
// The engine above is untouched but for the wafer promise (three statements in the data block). Everything a module
// may reach is in window.KY, built here after every wrap of the edition layer and frozen; the loader admits the
// modules of modules.json in `order`, each only when its bytes hash as recorded and every hook it requires exists,
// and refuses in words while the rest runs. Apache-2.0 (kuiper-belt). The same bytes, between the same two marker
// lines, are modules/202611012145-loader.js (the reviewable reference; it is never fetched). Lessons, cited:
// gridatlas@5ec7f62 atlas/index.html:39-44 (no-store, schema), :65-67 (missing id refused), :78-81 (hash in the
// browser), :82-83 (one blob script per cartridge), :104-114 (one published state); menu-bar.js:37-38 (never twice);
// atlas/modules/202610291043-uk-lightning-overlay.js:393-400 (one frozen API). The anti-lesson: learn-the-kuiper
// modes.html:16-24 skips a missing module silently; this loader says why, on screen.
const KY_EDITION = '202611012135';
const KY_NAMES = Object.freeze(['keyPlace', 'address', 'describe', 'findBy', 'flyTo', 'home', 'homeCamera', 'safeBox',
  'lightTime', 'showNew', 'goKey', 'fmt', 'words', 'esc', 'cv', 'ov', 'o2', 'hud', 'big', 'sub', 'card', 'gbox', 'gin',
  'SPACE', 'N', 'repos', 'commits', 'wafer', 'cam', 'lit', 'sel', 'redraw', 'draw', 'panels']);
const kyDraw = [], kyLines = [];
let kyAdmitting = null, kyInstalling = null;
function kyLine(t){ kyLines.push(t); if (!N) hud.textContent += '\n' + t; dirty = true; }
// the one wrap of draw: module painters run after the engine's and the edition's overlay, in ascending order;
// a painter that throws is taken out and named, the frame goes on
{ const _draw = draw; draw = function(){ _draw();
    if (kyLines.length) hud.textContent += '\nMODULES · ' + kyLines.join('\n');
    for (const d of kyDraw.slice()) { try { d.fn(o2, KY); }
      catch (e) { kyDraw.splice(kyDraw.indexOf(d), 1); kyLine(d.id + ' draw threw ' + (e && e.message || e) + ' · painter removed'); } } }; }
const KY_STATE = { schema: 'kuiper.modules.v1', edition: KY_EDITION, hooks: 'kuiper.hooks.v1', order: [], admitted: [],
  refused: [], failures: [], done: false, timings: { loader_start_ms: Math.round(performance.now()) } };
const KY_MODULES = {};
const KY = Object.freeze({
  schema: 'kuiper.hooks.v1', edition: KY_EDITION,
  hooks: Object.freeze({
    keyPlace, address, describe, findBy, flyTo, home, homeCamera, safeBox, lightTime, showNew, goKey, fmt, words, esc,
    cv, ov, o2, hud, big, sub, card, gbox, gin,
    get SPACE(){ return SPACE; }, get N(){ return N; }, get repos(){ return repos; }, get commits(){ return commits; },
    wafer: kyWafer }),
  cam: Object.freeze({ get x(){ return cx; }, get y(){ return cy; }, get zoom(){ return zoom; }, get atHome(){ return atHome; } }),
  lit: Object.freeze({ get repo(){ return litRepo; }, set repo(v){ litRepo = v; dirty = true; },
    get K(){ return litK; }, get Ci(){ return litCi; },
    set period(p){ if (p == null) { litK = [-1, -1]; litCi = null; dirty = true; } else lightTime(+p.y, +p.m || 0, +p.d || 0); } }),
  sel: Object.freeze({ get target(){ return target; }, set target(t){ target = t; dirty = true; } }),
  redraw(){ dirty = true; },
  draw: Object.freeze({ add(fn, order){ if (typeof fn !== 'function') throw new TypeError('KY.draw.add needs a function');
    kyDraw.push({ fn, order: +order || 0, id: kyInstalling || 'module' }); kyDraw.sort((a, b) => a.order - b.order); dirty = true; } }),
  panels: Object.freeze({ add(name, el, title){ if (PANELS[name]) throw new Error('panel ' + name + ' exists');
      el.classList.add('gm-panel'); el.setAttribute('role', 'region'); el.setAttribute('aria-label', String(title || name));
      if (!el.isConnected) document.body.appendChild(el); PANELS[name] = el; placePanels(); return el; },
    set: setPanel, place: placePanels }),
  names: KY_NAMES,
  register(m){ if (!kyAdmitting) { kyLine('a registration outside admission ignored: ' + (m && m.id)); return false; }
    if (kyAdmitting.reg) { kyAdmitting.twice = true; return false; } kyAdmitting.reg = m; return true; },
  modules: KY_MODULES,
  inspect(){ return JSON.parse(JSON.stringify(KY_STATE)); } });
window.KY = KY; window.__KUIPER_MODULES__ = KY_MODULES; window.__KUIPER_EDITION__ = KY_STATE;
// one strip, role=alert, for refused modules; the engine's own refusals keep their slot in the same strip
function kyRefuse(t){ refuse(t, 'modules'); }
const kyHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
function kyInject(id, buf){ return new Promise(ok => { const s = document.createElement('script'), u = URL.createObjectURL(new Blob([buf], { type: 'text/javascript' }));
  s.dataset.kyModule = id; s.src = u; s.onload = () => { URL.revokeObjectURL(u); ok(true); }; s.onerror = () => { URL.revokeObjectURL(u); ok(false); };
  document.head.appendChild(s); }); }
async function kyAdmit(id, rec, provided){
  if (!rec) return 'in order but not in modules';
  const path = String(rec.path || ''), file = path.split('/').pop();
  if (!/^modules\/[a-z0-9][a-z0-9.-]*\.js$/.test(path) || path.includes('..')) return 'bad path ' + path;
  if (!/^\d{12}$/.test(rec.generation || '')) return 'generation ' + rec.generation + ' is not twelve digits';
  const fd = file.match(/^(\d{12})-/); if (fd && fd[1] !== rec.generation) return 'stamp mismatch: generation ' + rec.generation + ', file name ' + fd[1];
  if (!/^[0-9a-f]{64}$/.test(rec.sha256 || '')) return 'sha256 is not 64 hex';
  if (!String(rec.licence || '').trim()) return 'no licence';
  for (const r of rec.requires || []) if (!provided.has(r)) return 'missing hook ' + r;
  let res; try { res = await fetch(path, { cache: 'no-store' }); } catch (e) { return 'fetch failed ' + (e && e.message || e); }
  if (!res.ok) return 'HTTP ' + res.status;
  const buf = await res.arrayBuffer(), sha = kyHex(await crypto.subtle.digest('SHA-256', buf));
  if (sha !== rec.sha256) return 'sha256 mismatch';
  if (buf.byteLength !== rec.bytes) return 'bytes ' + buf.byteLength + ', manifest ' + rec.bytes;
  if (rec.byte_budget && buf.byteLength > rec.byte_budget) return 'over byte_budget ' + buf.byteLength + ' > ' + rec.byte_budget;
  const head = new TextDecoder().decode(buf.slice(0, 200)).split('\n')[0].match(/^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),/);
  if (!head) return 'no header line';
  if (head[2] !== rec.generation) return 'stamp mismatch: generation ' + rec.generation + ', header ' + head[2];
  kyAdmitting = { id }; let reg, twice;
  try { if (!(await kyInject(id, buf))) return 'script did not load'; } finally { reg = kyAdmitting.reg; twice = kyAdmitting.twice; kyAdmitting = null; }
  if (!reg) return 'no registration';
  if (twice) return 'registered twice';
  if (reg.schema !== 'kuiper.module.v1') return 'schema ' + reg.schema;
  if (reg.id !== id) return 'id ' + reg.id + ' ≠ ' + id;
  if (reg.generation !== rec.generation) return 'stamp mismatch: generation ' + rec.generation + ', registration ' + reg.generation;
  for (const r of reg.requires || []) { if (!(rec.requires || []).includes(r)) return 'requires ' + r + ' not in the manifest'; if (!provided.has(r)) return 'missing hook ' + r; }
  if (typeof reg.install !== 'function') return 'no install';
  let api; kyInstalling = id;
  try { api = reg.install(KY); } catch (e) { return 'install threw ' + (e && e.message || e); } finally { kyInstalling = null; }
  const ready = Promise.resolve(api);
  ready.catch(e => { KY_STATE.failures.push({ id, why: 'install rejected ' + (e && e.message || e) }); kyLine(id + ' install rejected: ' + (e && e.message || e)); });
  Object.defineProperty(KY_MODULES, id, { enumerable: true, value: Object.freeze({ id, generation: rec.generation, sha256: sha,
    api: (api && typeof api.then === 'function') ? undefined : api, ready, inspect: typeof reg.inspect === 'function' ? reg.inspect : () => ({}) }) });
  for (const p of [id, ...(reg.provides || []), ...(rec.provides || [])]) provided.add(p);
  return null;
}
(async function kyLoad(){
  let m;
  try { const r = await fetch('modules.json', { cache: 'no-store' }); if (!r.ok) throw new Error('modules.json HTTP ' + r.status); m = await r.json(); }
  catch (e) { m = { error: e && e.message || String(e) }; }
  const shape = m.error ? m.error : m.schema !== 'kuiper.modules.v1' ? 'schema ' + m.schema : m.hooks !== 'kuiper.hooks.v1' ? 'hooks ' + m.hooks
    : m.edition !== KY_EDITION ? 'edition ' + m.edition + ' ≠ page ' + KY_EDITION : !Array.isArray(m.order) || !Array.isArray(m.modules) ? 'order and modules must be lists'
    : !crypto.subtle ? 'no crypto.subtle (not a secure context)' : null;
  if (shape) { KY_STATE.whole = shape; KY_STATE.done = true; kyRefuse('MODULES NOT ADMITTED: ' + shape + ' · the wafer is unchanged'); kyLine('modules not admitted: ' + shape); return; }
  KY_STATE.order = m.order.slice();
  const provided = new Set(KY_NAMES), seen = new Set();
  for (const id of m.order) {
    const why = seen.has(id) ? 'in order twice' : await kyAdmit(id, m.modules.find(x => x && x.id === id), provided);
    const t = Math.round(performance.now()); seen.add(id);
    if (why) { KY_STATE.refused.push({ id, why, t_ms: t }); kyLine(id + ' refused: ' + why); }
    else { KY_STATE.admitted.push({ id, sha256: KY_MODULES[id].sha256, t_ms: t }); kyLine(id + ' admitted · ' + KY_MODULES[id].sha256.slice(0, 12)); }
  }
  KY_STATE.timings.last_admitted_ms = KY_STATE.admitted.length ? KY_STATE.admitted[KY_STATE.admitted.length - 1].t_ms : null;
  KY_STATE.timings.loader_end_ms = Math.round(performance.now());
  KY_STATE.bytes = m.modules.filter(x => KY_MODULES[x.id]).reduce((a, x) => a + (x.bytes || 0), 0);
  KY_STATE.byte_budget = m.modules.filter(x => KY_MODULES[x.id]).reduce((a, x) => a + (x.byte_budget || 0), 0);
  KY_STATE.done = true;
  if (KY_STATE.refused.length) kyRefuse(KY_STATE.refused.length + ' module' + (KY_STATE.refused.length > 1 ? 's' : '') + ' refused: '
    + KY_STATE.refused.map(x => x.id + ' (' + x.why + ')').join('; ') + ' · the wafer, the bar and every admitted module keep working');
})();
// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · end
