/* kuiper loader reference, generation 202611020103 (UTC), Apache-2.0 (kuiper-belt) */
// NOT A MODULE and never fetched: rev 5 (optional) of the hook table and loader that Opus team 4 hands to the integrator
// as handoff/04-loader/rev5/index.html.delta.patch. The bytes between the two marker lines below are byte-identical to
// the block that patch writes into editions/202611012135/index.html; rev 4 stays modules/202611012145-loader.js, never
// edited. The block runs only inside the page script, where the engine names it closes over are in scope. Listed in
// modules.json under "references" when admitted (record: rev5/record.json), never in "order".
// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · begin (Opus team 4, step 4)
// Engine lines this patch changes: the wafer promise (one line after `let N = 0`, and kyWaferOk/kyWaferNo at the belt
// check, after `N = issued` and in the wafer.tsv catch), and the NL-009 round-1 fixes folded in by team 4: 09-robust
// (refuse() for the WebGL, context-lost, belt and wafer.tsv refusals, given slots here) and 04-touch (viewport, tap slop
// and tapUp). Nothing else above is changed. Everything a module
// may reach is in window.KY, built here after every wrap of the edition layer and frozen; the loader admits the
// modules of modules.json in `order`, each only when its bytes hash as recorded and every hook it requires exists,
// and refuses in words while the rest runs. Apache-2.0 (kuiper-belt). The same bytes, between the same two marker
// lines, are modules/202611020103-loader.js (the reviewable reference; it is never fetched). Lessons, cited:
// gridatlas@5ec7f62 atlas/index.html:39-44 (no-store, schema), :65-67 (missing id refused), :78-81 (hash in the
// browser), :82-83 (one blob script per cartridge), :104-114 (one published state); menu-bar.js:37-38 (never twice);
// atlas/modules/202610291043-uk-lightning-overlay.js:393-400 (one frozen API). The anti-lesson: learn-the-kuiper
// modes.html:16-24 skips a missing module silently; this loader says why, on screen.
const KY_EDITION = '202611012135';
const KY_NAMES = Object.freeze(['keyPlace', 'address', 'describe', 'findBy', 'flyTo', 'home', 'homeCamera', 'safeBox',
  'lightTime', 'showNew', 'goKey', 'fmt', 'words', 'esc', 'cv', 'ov', 'o2', 'hud', 'big', 'sub', 'card', 'gbox', 'gin',
  'SPACE', 'N', 'repos', 'commits', 'wafer', 'cam', 'lit', 'sel', 'redraw', 'draw', 'panels', 'refuse', 'nav']);
const kyDraw = [], kyLines = [];
let kyAdmitting = null, kyInstalling = null;
function kyLine(t){ kyLines.push(t); if (!N) hud.textContent += '\n' + t; dirty = true; }
// the one wrap of draw: module painters run after the engine's and the edition's overlay, in ascending order;
// a painter that throws is taken out and named, the frame goes on
{ const _draw = draw; draw = function(){ _draw();
    if (kyLines.length) hud.textContent += '\nMODULES · ' + kyLines.join('\n');
    for (const d of kyDraw.slice()) { try { d.fn(o2, KY); }
      catch (e) { kyDraw.splice(kyDraw.indexOf(d), 1); kyLine(d.id + ' draw threw ' + (e && e.message || e) + ' · painter removed'); } } }; }
// ONE OWNER OF HISTORY (rev 5): every layer that holds a history entry for the Android back gesture pushes it through
// KY.nav (the edition's card and panels as owner 'edition', the shell as 'kuiper-shell'). A back the page starts is
// marked self (event.kuiperSelf) and never read as the user's gesture; a user's back calls the handler of the owner
// whose entry it removed, and nobody else's. An entry is ours when its state carries kuiperDepth; a foreign state is
// left alone (never reconciled), so a module still pushing its own entries degrades to the Edition 4 behaviour.
const kyNav = { stack: [], self: 0, pending: [], handlers: {} };
function kyDepth(){ const s = history.state; return s == null ? 0 : (typeof s.kuiperDepth === 'number' ? s.kuiperDepth : null); }
function kyNavReconcile(){ const d = kyDepth(), lost = []; if (d === null) return lost;
  while (kyNav.stack.length && kyNav.stack[kyNav.stack.length - 1].depth > d) lost.push(kyNav.stack.pop()); return lost; }
function kyNavPush(owner){ if (kyNav.self > 0) { if (!kyNav.pending.includes(owner)) kyNav.pending.push(owner); return true; }
  kyNavReconcile(); const top = kyNav.stack[kyNav.stack.length - 1], depth = Math.max(top ? top.depth : 0, kyDepth() || 0) + 1;
  try { history.pushState({ kuiper: 1, kuiperDepth: depth, owner }, ''); } catch (e) { return false; }
  kyNav.stack.push({ owner, depth, live: true }); return true; }
function kyNavTrim(){ const top = kyNav.stack[kyNav.stack.length - 1];
  if (top && !top.live && kyNav.self === 0 && kyDepth() === top.depth) { kyNav.self++; history.back(); } }
function kyNavBack(owner){ const i = kyNav.pending.indexOf(owner); if (i >= 0) { kyNav.pending.splice(i, 1); return; }
  for (let j = kyNav.stack.length - 1; j >= 0; j--) if (kyNav.stack[j].owner === owner && kyNav.stack[j].live) { kyNav.stack[j].live = false; break; }
  kyNavTrim(); }
function kyNavHas(owner){ kyNavReconcile(); return kyNav.pending.includes(owner) || kyNav.stack.some(x => x.live && x.owner === owner); }
kyNav.handlers.edition = edBack;
addEventListener('popstate', e => { const gone = kyNavReconcile();
  if (kyNav.self > 0) { kyNav.self--; e.kuiperSelf = true;                 // our own back(): close nothing; re-arm what it took by accident
    for (const o of gone.filter(g => g.live).map(g => g.owner).concat(kyNav.pending.splice(0))) kyNavPush(o); }
  else for (const g of gone) if (g.live && kyNav.handlers[g.owner]) { try { kyNav.handlers[g.owner](e); } catch (x) { kyLine(g.owner + ' back handler threw ' + (x && x.message || x)); } }
  kyNavTrim(); });
const kyOwner = o => { if (typeof o !== 'string' || !/^[a-z0-9-]+$/.test(o) || o === 'edition') throw new TypeError('KY.nav: the owner is the module id'); return o; };
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
  cam: Object.freeze({ get x(){ return cx; }, get y(){ return cy; }, get zoom(){ return zoom; }, get atHome(){ return atHome; }, set atHome(v){ atHome = !!v; } }),
  lit: Object.freeze({ get repo(){ return litRepo; }, set repo(v){ litRepo = v; dirty = true; },
    get K(){ return litK; }, get Ci(){ return litCi; },
    set period(p){ if (p == null) { litK = [-1, -1]; litCi = null; dirty = true; } else lightTime(+p.y, +p.m || 0, +p.d || 0); } }),
  sel: Object.freeze({ get target(){ return target; }, set target(t){ target = t; dirty = true; } }),
  redraw(){ dirty = true; },
  draw: Object.freeze({ add(fn, order){ if (typeof fn !== 'function') throw new TypeError('KY.draw.add needs a function');
    kyDraw.push({ fn, order: +order || 0, id: kyInstalling || 'module' }); kyDraw.sort((a, b) => a.order - b.order); dirty = true; } }),
  // once the shell (team 1, id kuiper-shell) is admitted the bar and its panels are its own: add() forwards into the
  // shell's panel of that name (handoff/01-shell/REQUESTS.md item 2); a name the shell does not have falls back here
  panels: Object.freeze({ add(name, el, title){ const sh = KY_MODULES['kuiper-shell'], sp = sh && sh.api && typeof sh.api.panel === 'function' ? sh.api.panel(name) : null;
      if (sp) { sp.appendChild(el); KY.redraw(); return el; }
      if (PANELS[name]) throw new Error('panel ' + name + ' exists');
      el.classList.add('gm-panel'); el.setAttribute('role', 'region'); el.setAttribute('aria-label', String(title || name));
      if (!el.isConnected) document.body.appendChild(el); PANELS[name] = el; placePanels(); return el; },
    set: setPanel, place: placePanels }),
  refuse(text, slot){ if (typeof slot !== 'string' || !/^[a-z0-9-]+$/.test(slot) || slot === 'engine' || slot === 'modules')
      throw new TypeError('KY.refuse(text, slot): slot is the module id; engine and modules are the page\'s'); refuse(String(text || ''), slot); },
  nav: Object.freeze({ push(owner){ return kyNavPush(kyOwner(owner)); }, back(owner){ kyNavBack(kyOwner(owner)); },
    onBack(owner, fn){ if (typeof fn !== 'function') throw new TypeError('KY.nav.onBack needs a function'); kyNav.handlers[kyOwner(owner)] = fn; },
    has(owner){ return kyNavHas(kyOwner(owner)); }, isSelf(e){ return !!(e && e.kuiperSelf); }, get depth(){ return kyDepth(); } }),
  names: KY_NAMES,
  register(m){ if (!kyAdmitting) { kyLine('a registration outside admission ignored: ' + (m && m.id)); return false; }
    if (kyAdmitting.reg) { kyAdmitting.twice = true; return false; } kyAdmitting.reg = m; return true; },
  modules: KY_MODULES,
  inspect(){ return JSON.parse(JSON.stringify(KY_STATE)); } });
window.KY = KY; window.__KUIPER_MODULES__ = KY_MODULES; window.__KUIPER_EDITION__ = KY_STATE;
// one strip, role=alert, for refused modules; the engine's own refusals keep their slot in the same strip
function kyRefuse(t){ refuse(t, 'modules'); }
const kyHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
function kyInject(id, buf){ return new Promise(ok => { const s = document.createElement('script'), u = URL.createObjectURL(new Blob([buf], { type: 'text/javascript' })), st = { loaded: false, error: null };
  const se = e => { if (e.filename === u) { st.error = st.error || String(e.message || 'error').replace(/^Uncaught /, ''); e.preventDefault(); } }, fin = l => { removeEventListener('error', se, true); URL.revokeObjectURL(u); st.loaded = l; ok(st); };
  addEventListener('error', se, true); s.dataset.kyModule = id; s.src = u; s.onload = () => fin(true); s.onerror = () => fin(false); document.head.appendChild(s); }); }   // a module's own script error is its refusal, not the page's error
async function kyAdmit(id, rec, provided){
  if (!rec) return 'in order but not in modules';
  const path = String(rec.path || ''), file = path.split('/').pop();
  if (!/^modules\/[a-z0-9][a-z0-9.-]*\.js$/.test(path) || path.includes('..')) return 'bad path ' + path;
  if (!/^\d{12}$/.test(rec.generation || '')) return 'generation ' + rec.generation + ' is not twelve digits';
  const fd = file.match(/^(\d{12})-/); if (fd && fd[1] !== rec.generation) return 'stamp mismatch: generation ' + rec.generation + ', file name ' + fd[1];
  if (!/^[0-9a-f]{64}$/.test(rec.sha256 || '')) return 'sha256 is not 64 hex';
  if (!String(rec.licence || '').trim()) return 'no licence'; for (const f of ['requires', 'provides']) if (rec[f] != null && !Array.isArray(rec[f])) return f + ' is not a list';
  for (const r of rec.requires || []) if (!provided.has(r)) return 'missing hook ' + r;
  let res; try { res = await fetch(path, { cache: 'no-store' }); } catch (e) { return 'fetch failed ' + (e && e.message || e); }
  if (!res.ok) return 'HTTP ' + res.status;
  const buf = await res.arrayBuffer(), sha = kyHex(await crypto.subtle.digest('SHA-256', buf));
  if (sha !== rec.sha256) return 'sha256 mismatch';
  if (buf.byteLength !== rec.bytes) return 'bytes ' + buf.byteLength + ' ≠ manifest ' + rec.bytes;
  if (rec.byte_budget && buf.byteLength > rec.byte_budget) return 'over byte_budget ' + buf.byteLength + ' > ' + rec.byte_budget;
  const head = new TextDecoder().decode(buf.slice(0, 200)).split('\n')[0].match(/^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),/);
  if (!head) return 'no header line'; if (head[1] !== id) return 'header names ' + head[1] + ' ≠ ' + id;
  if (head[2] !== rec.generation) return 'stamp mismatch: generation ' + rec.generation + ', header ' + head[2];
  kyAdmitting = { id }; let reg, twice;
  let inj; try { inj = await kyInject(id, buf); } finally { reg = kyAdmitting.reg; twice = kyAdmitting.twice; kyAdmitting = null; } if (!inj.loaded) return 'script did not load'; if (inj.error) return 'script error: ' + inj.error;
  if (!reg) return 'no registration';
  if (twice) return 'registered twice';
  if (reg.schema !== 'kuiper.module.v1') return 'schema ' + reg.schema;
  if (reg.id !== id) return 'id ' + reg.id + ' ≠ ' + id; for (const f of ['requires', 'provides']) if (reg[f] != null && !Array.isArray(reg[f])) return 'registration ' + f + ' is not a list';
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
  try { const r = await fetch('modules.json', { cache: 'no-store' }); if (!r.ok) throw new Error('modules.json HTTP ' + r.status); m = await r.json(); if (!m || typeof m !== 'object') throw new Error('modules.json is not an object'); }
  catch (e) { m = { error: e && e.message || String(e) }; }
  const shape = m.error ? m.error : m.schema !== 'kuiper.modules.v1' ? 'schema ' + m.schema : m.hooks !== 'kuiper.hooks.v1' ? 'hooks ' + m.hooks
    : m.edition !== KY_EDITION ? 'edition ' + m.edition + ' ≠ page ' + KY_EDITION : !Array.isArray(m.order) || !Array.isArray(m.modules) ? 'order and modules must be lists'
    : !crypto.subtle ? 'no crypto.subtle (not a secure context)' : null;
  if (shape) { KY_STATE.whole = shape; KY_STATE.done = true; kyRefuse('MODULES NOT ADMITTED: ' + shape + ' · the wafer is unchanged'); kyLine('modules not admitted: ' + shape); return; }
  KY_STATE.order = m.order.slice();
  const provided = new Set(KY_NAMES), seen = new Set();
  for (const id of m.order) {
    let why; try { why = seen.has(id) ? 'in order twice' : await kyAdmit(id, m.modules.find(x => x && x.id === id), provided); } catch (e) { kyAdmitting = kyInstalling = null; why = 'loader error ' + (e && e.message || e); }
    const t = Math.round(performance.now()); seen.add(id);
    if (why) { KY_STATE.refused.push({ id, why, t_ms: t }); kyLine(id + ' refused: ' + why); }
    else { KY_STATE.admitted.push({ id, sha256: KY_MODULES[id].sha256, t_ms: t }); kyLine(id + ' admitted · ' + KY_MODULES[id].sha256.slice(0, 12)); }
  }
  KY_STATE.timings.last_admitted_ms = KY_STATE.admitted.length ? KY_STATE.admitted[KY_STATE.admitted.length - 1].t_ms : null;
  KY_STATE.timings.loader_end_ms = Math.round(performance.now());
  KY_STATE.bytes = m.modules.filter(x => x && KY_MODULES[x.id]).reduce((a, x) => a + (x.bytes || 0), 0);
  KY_STATE.byte_budget = m.modules.filter(x => x && KY_MODULES[x.id]).reduce((a, x) => a + (x.byte_budget || 0), 0);
  KY_STATE.done = true; for (const k of ['order', 'admitted', 'refused', 'timings']) Object.freeze(KY_STATE[k]);   // KY.modules stays open: the shell publishes .menuBar there (01-shell REQUESTS 2)
  if (KY_STATE.refused.length) kyRefuse(KY_STATE.refused.length + ' module' + (KY_STATE.refused.length > 1 ? 's' : '') + ' refused: '
    + KY_STATE.refused.map(x => x.id + ' (' + x.why + ')').join('; ') + ' · the wafer, the bar and every admitted module keep working');
})();
// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · end
