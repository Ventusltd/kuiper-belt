# Kuiper hook table `kuiper.hooks.v1`: the key list (Opus team 4, step 4)

Published 2026-11-01 21:4x UTC by OPUS-4 lead, before any other team's module is cut. Every Opus team builds against
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
| 19 | `big` | element `#big` | :123-124 |
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

`requires` may name: `Object.keys(KY.hooks)` ∪ `['cam', 'lit', 'sel', 'redraw', 'draw', 'panels']` ∪ the `provides` of
modules admitted earlier in `order` (a module's `id` is always in its `provides`). `KY.names` is the frozen list of the 28
hooks plus those six, without `provides`.

| member | shape | engine line |
|---|---|---|
| `KY.schema` | `'kuiper.hooks.v1'` | |
| `KY.edition` | `'202611012135'` | |
| `KY.cam` | getters `x y zoom atHome` | :243 `cx cy zoom`, :245 `atHome` |
| `KY.lit` | `repo` get/set (sets `dirty`), `K` get, `Ci` get, `period` set (`lightTime` result or null clears) | :243 `litRepo`, :244 `litK litCi` |
| `KY.sel` | `target` get/set (sets `dirty`) | :243 `target` |
| `KY.redraw()` | sets `dirty = true` | :243 `dirty` |
| `KY.draw.add(fn, order)` | the one wrap of `draw`; `fn(o2, KY)` runs after the engine's and the edition's overlay, ascending `order`; a throwing fn is removed and reported, the frame continues | :332 `function draw(){`, wrapped :654 |
| `KY.panels.add(name, el, title)` / `.set(name)` / `.place()` | `PANELS[name] = el`; the bar title is team 1's | :710 `PANELS`, :712 `placePanels`, :714 `setPanel` |
| `KY.register(module)` | the only call a module makes at parse time; a closure of the loader | |
| `KY.modules` | `{id: frozen {id, generation, sha256, api, inspect}}`; alias `window.__KUIPER_MODULES__` | |
| `KY.inspect()` | `{schema, edition, hooks, order, admitted, refused, timings}` = `window.__KUIPER_EDITION__` | |
| `KY.names` | frozen array: the 28 hooks + `cam lit sel redraw draw panels` | |

`Object.isFrozen(window.KY) === true`, and `KY.hooks`, `KY.names`, `KY.cam`, `KY.lit`, `KY.sel`, `KY.draw`, `KY.panels`
are frozen too. `KY.modules` is the one object the loader fills (each entry frozen).

## The registration a module makes

```js
KY.register({ schema: 'kuiper.module.v1', id: '<id>', generation: '<module-stamp>',
  requires: [/* names from the admissible set */], provides: ['<id>', /* ... */],
  install(KY){ /* build #ky-<id>; may await KY.hooks.wafer; return the public api */ },
  inspect(){ /* state */ } });
```

The loader refuses in words, one readout line and one `#refuse[role=alert]` strip, while the rest runs:
`HTTP <status>`, `sha256 mismatch`, `bytes <n> ≠ manifest <m>`, `over byte_budget`, `no licence`,
`generation <a>, file name <b>`, `no registration`, `id <x> ≠ <id>`, `missing hook <name>`, `install threw <message>`,
`in order but not in modules`, `bad path`, `registered twice`.
