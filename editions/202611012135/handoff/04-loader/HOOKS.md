# Kuiper hook table `kuiper.hooks.v1`: the key list (Opus team 4, step 4)

Published 2026-11-01 21:42:44Z (GitHub's time of #10 comment 6564299733) by OPUS-4 lead, before any other team's module is cut. Every Opus team builds against
this list. Keys are `repo@sha path:line` at kuiper-belt@96736f5 (`96736f55c2137defcf02c898f8f2b0d04374d74b`)
`editions/202611012135/index.html` (the Edition 4 copy, unpatched line numbers). Source of the list:
neural-link FIXES/NL-010/team-2/STEPS.md step 4.2; ROADMAP.md step 4, 4.2. A key is added only by a new FINDING on #10
naming the engine line it exposes.

## `Object.keys(window.KY.hooks)`: 28 names, in this order (test 7 asserts it)

```
keyPlace, address, describe, findBy, flyTo, home, homeCamera, safeBox, lightTime, showNew, goKey, fmt,
words, esc, cv, ov, o2, hud, big, sub, card, gbox, gin, SPACE, N, repos, commits, wafer
```

| # | hook | kind | engine line it exposes (kuiper-belt@96736f5 editions/202611012135/index.html) |
|---|---|---|---|
| 1 | `keyPlace(k)` → `[x, y]` | function | :278 `function keyPlace(k){` |
| 2 | `address(k)` → commit address or null | function | :282 `function address(k){` |
| 3 | `describe(a)` → text | function | :284 `function describe(a){` |
| 4 | `findBy(field, v)` → commit index | function | :280 `function findBy(field, v){` |
| 5 | `flyTo(x, y, z)` | function | :253 `function flyTo(x, y, z){` |
| 6 | `home()` | function | :277 `function home(){` |
| 7 | `homeCamera()` → `{x, y, z}` | function | :272 `function homeCamera(){` |
| 8 | `safeBox()` → `{x0, y0, x1, y1}` | function (the bar-aware wrap) | :262 `function safeBox(){`, wrapped at :726; the hook is the wrapped one |
| 9 | `lightTime(y, m, d)` | function | :554 `function lightTime(y, m, d){` |
| 10 | `showNew(hours)` | function | :420 `function showNew(hours){` |
| 11 | `goKey(k)` | function | :416 `function goKey(k){` |
| 12 | `fmt(n)` | function | :125 `const fmt = n => ...` (team-2 wrote :126; measured :125) |
| 13 | `words(n)` | function | :126 `function words(n){` |
| 14 | `esc(v)` | function | :681 `function esc(v){` |
| 15 | `cv` | element (WebGL canvas `#c`) | :121 |
| 16 | `ov` | element (overlay canvas `#o`) | :121 |
| 17 | `o2` | 2D context of `ov` | :121 |
| 18 | `hud` | element `#hud` | :123 |
| 19 | `big` | element `#big` | :123 |
| 20 | `sub` | element `#sub` | :124 |
| 21 | `card` | element `#card` | :124 (`<div id="card">` :91) |
| 22 | `gbox` | element `#goto` | :604 |
| 23 | `gin` | element `#gotoin` | :604 |
| 24 | `SPACE` | getter, number | :198 `let N = 0, SPACE = 0, ...`, set :208 |
| 25 | `N` | getter, number | :198, set :208 |
| 26 | `repos` | getter, array | :198, set :202 |
| 27 | `commits` | getter, array | :198, set :204 |
| 28 | `wafer` | Promise (the wafer promise) | created before `KY` is frozen, never replaced; resolves `{N, SPACE}` right after :208; rejects with the refusal's words (:207 the belt refusal, :240 `../../cosmos/wafer.tsv did not load. The wafer will not invent its keys.`) |

## The rest of `window.KY` (not in `hooks`, but admissible in `requires`)

`requires` may name: `Object.keys(KY.hooks)` ∪ `['cam', 'lit', 'sel', 'redraw', 'draw', 'panels', 'refuse']` ∪ the `provides` of
modules admitted earlier in `order` (a module's `id` is always in its `provides`). `KY.names` is the frozen list of the 28
hooks plus those seven, without `provides` (35 names since rev 3; this is the admitted rev 4).

| member | shape | engine line |
|---|---|---|
| `KY.schema` | `'kuiper.hooks.v1'` | |
| `KY.edition` | `'202611012135'` | |
| `KY.cam` | getters `x y zoom atHome`; setter `atHome` (rev 3: a module that flies the camera sets it false first, so a resize does not re-home) | :243 `cx cy zoom`, :245 `atHome` (read by `resize` :248) |
| `KY.lit` | `repo` get/set (sets `dirty`), `K` get, `Ci` get, `period` set (`lightTime` result or null clears) | :243 `litRepo`, :244 `litK litCi` |
| `KY.sel` | `target` get/set (sets `dirty`) | :243 `target` |
| `KY.redraw()` | sets `dirty = true` | :243 `dirty` |
| `KY.draw.add(fn, order)` | the one wrap of `draw`; `fn(o2, KY)` runs after the engine's and the edition's overlay, ascending `order`; a throwing fn is removed and reported, the frame continues | :332 `function draw(){`, wrapped :654 |
| `KY.panels.add(name, el, title)` / `.set(name)` / `.place()` | rev 4: once `kuiper-shell` (team 1) is admitted, `add` appends `el` to `KY.modules['kuiper-shell'].api.panel(name)` (the shell's six: file edit view scope wafer about); otherwise, or for a name the shell lacks, `PANELS[name] = el`; the bar titles are team 1's | :710 `PANELS`, :712 `placePanels`, :714 `setPanel` |
| `KY.refuse(text, slot)` | rev 3: one line in the shared `#refuse[role=alert]` strip under the module's own `slot` (its id); `engine` and `modules` are the page's (TypeError); empty text clears the slot; the strip goes when every slot is empty | the page's `refuse(m, slot)` (NL-009 09-robust, given slots by team 4; rev-3 patched page :140) |
| `KY.register(module)` | the only call a module makes at parse time; a closure of the loader | |
| `KY.modules` | `{id: frozen {id, generation, sha256, api, inspect}}`; alias `window.__KUIPER_MODULES__` | |
| `KY.inspect()` | `{schema, edition, hooks, order, admitted, refused, timings}` = `window.__KUIPER_EDITION__` | |
| `KY.names` | frozen array: the 28 hooks + `cam lit sel redraw draw panels refuse` (35) | |

`Object.isFrozen(window.KY) === true`, and `KY.hooks`, `KY.names`, `KY.cam`, `KY.lit`, `KY.sel`, `KY.draw`, `KY.panels`
are frozen too. `KY.modules` is the one object the loader fills (each entry frozen).

## The registration a module makes

```js
KY.register({ schema: 'kuiper.module.v1', id: '<id>', generation: '<module-stamp>',
  requires: [/* names from the admissible set */], provides: ['<id>', /* ... */],
  install(KY){ /* build #ky-<id>; may await KY.hooks.wafer; return the public api */ },
  inspect(){ /* state */ } });
```

The loader refuses in words, one readout line `<id> refused: <why>` and one `#refuse[role=alert]` strip, while the rest
runs. These are its exact strings (rev 2, `modules/202611012145-loader.js`), in the order it checks them:

| stage | `why` |
|---|---|
| order | `in order twice`, `in order but not in modules` |
| record | `bad path <path>`, `generation <g> is not twelve digits`, `stamp mismatch: generation <g>, file name <digits>`, `sha256 is not 64 hex`, `no licence`, `requires is not a list` / `provides is not a list`, `missing hook <name>` |
| fetch | `fetch failed <message>`, `HTTP <status>` |
| bytes | `sha256 mismatch`, `bytes <n> ≠ manifest <m>`, `over byte_budget <n> > <budget>` |
| header line 1 | `no header line`, `header names <name> ≠ <id>`, `stamp mismatch: generation <g>, header <digits>` |
| script | `script did not load`, `script error: <message>` (a parse error or a top-level throw of the module itself) |
| registration | `no registration`, `registered twice`, `schema <x>`, `id <x> ≠ <id>`, `registration requires is not a list` / `registration provides is not a list`, `stamp mismatch: generation <g>, registration <x>`, `requires <name> not in the manifest`, `missing hook <name>`, `no install` |
| install | `install threw <message>` |
| anything else | `loader error <message>` (that module only; the next one runs) |

The whole set is refused, strip `MODULES NOT ADMITTED: <why> · the wafer is unchanged`, when `modules.json` is not
fetched or not an object, or its `schema` is not `kuiper.modules.v1`, `hooks` not `kuiper.hooks.v1`, `edition` not the
page's (`edition <x> ≠ page <y>`), `order`/`modules` not lists, or `crypto.subtle` is missing. An `install` that returns
a promise is admitted at once; if that promise rejects (for example a module awaiting `wafer` when the wafer refuses),
the rejection is recorded in `__KUIPER_EDITION__.failures` and the readout (`<id> install rejected: <message>`), not in
`refused`: the engine's own refusal is already in the strip. At `done`, `order`, `admitted`, `refused` and `timings` are
frozen; `failures` stays open, and `KY.modules` stays open (rev 4: the shell publishes `.menuBar` there; each admitted
entry is non-writable).

Header line 1 of every module: `/* kuiper module <id>, generation <module-stamp> (UTC), <licence>` (the comment may
continue on later lines). The stamp is written three times (file name, header, registration) and all three are checked
by the loader and by E6 (ROADMAP.md 4.3, 4.9; this departs from team-2/STEPS.md 4.3's two places on purpose).

Correction to team-2/STEPS.md 4.4: the page script is `<script type="module">` (kuiper-belt@96736f5
editions/202611012135/index.html:102), so it is strict: a write to the frozen table throws a TypeError, it is not a
silent no-op. The rule (state in the loader's closure, never on `KY`) stands.

## Admitted revision and the optional rev 5

The admitted contract is **rev 4**: `index.html.patch` sha256 `d49be8ce…75f5` on the base `390b15ae…`, loader reference
`modules/202611012145-loader.js` `25a16f1d…6e78` (13,206 bytes), carried by the committed page `418ae14c…`. Everything
above describes rev 4. History for the Android back gesture is owned as the shell's rev 2 settled it: the page owns the
card's entry (`edSync`/`edPopping`), the shell owns one `{kmb}` entry only while a panel is open over no card
(REQUESTS.md, "From OPUS-1 lead").

**Rev 5 is optional and NOT admitted** (harness ruling, 2 Nov 00:59 UTC). It adds `KY.nav` (`push(owner)`,
`back(owner)` marked self, `onBack(owner, fn)`, `has`, `isSelf(e)`, `depth`; `KY.names` 36) as the one owner of history
state, per the controller's direction of 00:39 for after tonight. It lives in `handoff/04-loader/rev5/` under its own
stamped loader file, delta patch, record and TEST.md, and is applied only if it fixes a measured red step.

