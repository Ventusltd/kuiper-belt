# Opus team 3 — step 3, the Kuiper layer registry — PLAN

Lead: OPUS-3 lead. Module: `editions/202611012135/modules/202611012141-layers.js` (one file; the builder works in it, never a second).
Governing: FIXES/NL-010/ROADMAP.md step 3 and R2/R3; FIXES/NL-010/team-2/STEPS.md 3.1-3.8; NL-009 round1 05-lines (folded in).
Port: lead 8430, builder 8431, tester 8432, evidence 8433. Scratch: /tmp/nl010-opus/team-3/<role>/.

## Files (and nothing else)
- `modules/202611012141-layers.js` — registry + WAFER panel + verified-lines layer moved from the page.
- `data/layers.json` (`kuiper.layers.v1`, 7 records, order periods, repos, editions, lines, see-through, elements, spider).
- `data/editions.json` (`kuiper.editions.v1`, built from editions/README.md and the pointer).
- `tools/build_layers.py` (root tools/, new): writes `bytes`, `features`, `sha256`; refuses a colour outside PALETTE.md,
  a key outside SPACE, a record `requires` outside the module's `requires`.
- `handoff/03-layers/`: `index.html.patch` (deletions only of what moved: index.html:626-654 loader/draw/wrap, :676-692
  edFly/edNext/pointerup/e-E, :705-709 lines panel markup, :728-749 ly* handlers, fillLines, the two wraps),
  MODULE.sha256, test.cjs, img/ (WAIT, OK, FAIL, REFUSED), EVIDENCE.md, LICENCE.txt, REQUESTS.md.

## Sections of the module
| section | owner | content |
|---|---|---|
| 1 registry | lead | load layers.json no-store; records; rt state; `KY.layers.inspect/get/set/value/register` |
| 2 loading | lead | fetch no-store, timeout, SHA-256, bytes, features; FAIL · <file> HTTP <n>, FAIL · sha256 mismatch; waits on `KY.wafer` |
| 3 panel | builder | `#layers` via `KY.panels.add('wafer', el)`; groups; `<label>` rows ≥44 px with the ORIGINAL `input[data-ky-layer="layer:<id>"]` stretched over the row; state tag; one delegated `change` listener; see-through row first of THE APPS, largest label |
| 4 lines | builder | edPlaced, drawEdition (inside drawLayers), list grouped by repository, filter 16 px + clear + Escape, count line, focus value, `e`/`E`, edFly, 9 px tap hit-test only on the canvas (05-lines #9) |
| 5 wafer layers | lead | repos (value = lit repo via `KY.lit`), periods (value via lightTime), editions (amber rings, beyond-the-rim count); app rows EMPTY/REFUSED with why |
| 6 URL | lead | read `?layers=` and `#layers=` (hash wins), write `#…&layers=` via `history.replaceState` |

## Hooks (built against ROADMAP step 4 table until Opus 4 publishes its FINDING)
wafer (promise {N,SPACE}), keyPlace, address, o2, ov, cam ({cx,cy,zoom}), flyTo, safeBox, panels.add/set/place,
draw.add, redraw, lit (litRepo / lightTime), card (Team 2's line-card module api, else KY.card element), hud/big/sub, esc.
Any hook the table lacks → REQUESTS.md + REQUEST on issue #10.

## Tests 1-9 (tester, test.cjs, Pixel 7 + Galaxy S24, touch, 0 console errors)
Exactly ROADMAP step 3 "Acceptance test on Android" 1-9. Until the integrator's hook table + loader land, test.cjs runs
against a shim (route-served patched index.html that builds KY and admits this one module) and says so in EVIDENCE.md.

## Builder notes (OPUS-3 builder, 21:45 UTC)
The harness assigned the builder: the sha256 check of each layer's data in the browser, the state machine, the WAFER
panel rows with 44 px targets (plus section 4 above). So the builder writes SECTION 2's `loadSource(rec)` (fetch
no-store, timeout, SHA-256 / bytes / features, FAIL/EMPTY/OK) and the state machine `setState(id, status, why)` along
with SECTIONS 3 and 4, by exact-string edits only (never a whole-file write). Lead: if you already wrote section 2, say so
here and the builder will merge into yours instead. Internal contract the builder codes against:
- `reg.manifest` (layers.json), `reg.records[id]` (record), `reg.rt[id]` = `{on, value, status, why, placed, total,
  loaded_sha256, history}`; `setState(id, status, why)` is the ONLY writer of `status`/`why` (legal moves table; REFUSED
  is terminal; EMPTY/FAIL/REFUSED never with an empty why) and repaints the row, the heading and `#refuse[role=alert]`.
- per-layer maps the lead's sections fill: `DRAW[id] = fn(o2, KY)` (called by the one `KY.draw.add` wrap in `order`,
  only when on and OK), `ON[id] = fn(on)` (after a toggle), `VALUE[id] = fn(v)` (the lead's `value()` calls it),
  `ADMIT[id] = fn(json, rec) -> {placed, total, why?}` (after the digest passes; placed 0 → EMPTY).
- `renderRows()` builds the rows once `reg.manifest` is set (lead calls it after layers.json loads); `paintRow(id)`.
- DOM: host `#ky-layers` (the panel given to `KY.panels.add('wafer', host)`), inside it `#layers` (the 7 rows, the one
  delegated `change` listener), then `#linesctl`, `#lycount`, `#lineslist` (the only scroller).

## LEAD UPDATE 21:59 UTC (read this; it supersedes the section table above)
- The module is fully drafted by the lead (all six sections, 202611012141-layers.js). BUILDER: do NOT paste sec2/3/4.js
  over it; review and fix in place, small edits only, and say what you changed at the bottom of this file.
- The API is `KY.modules.layers.api` (KY is frozen by team 4's loader, HOOKS.md; `KY.layers` cannot exist).
  The module also sets `window.__KUIPER_LAYERS__` = the same api. TESTER: use
  `(KY.modules.layers && KY.modules.layers.api) || window.__KUIPER_LAYERS__`. Extra api for tests: `edScreen(i)` (screen
  point of placed body i), `placed()`, `step(dir)`, `open(i)`.
- Data built: `data/layers.json` (7 records), `data/editions.json` (5 editions: E1, E2 placed; E3, E4, E5 beyond the rim),
  by `python3 tools/build_layers.py --edition 202611012135` (`--check` for test 9).
  Expected tags: lines `OK · 344 of 346`; editions `OK · 2 of 5 placed, 3 beyond the rim`; repos `OK · off` / `OK · none lit`
  / `OK · gridatlas`; periods `OK · off`; see-through `EMPTY · awaiting step 5 features …`; elements
  `REFUSED · licence unsettled (elements@f7a92fb has no LICENSE (owner question Q1))`; spider `EMPTY · awaiting step 7 keys …`.
  Default on: lines, editions. Count line: `344 of 344 rows · 21 repositories`; filtered `N of 344 rows match "gridatlas"`.
- URL (R3): read `#layers=` (wins) or `?layers=`; WRITE only the hash `#…&layers=a,b` via replaceState and drop `layers`
  from the query. Test 6 asserts the hash after the untick, not `?layers=`.
- Two index.html patches (pure deletions; the only `+` lines are two shortened lines): `index.html.patch` against the
  Edition 4 copy, `index.html.after-04-loader.patch` against the copy with team 4's patch applied. Both `patch -p1`.
  TESTER build-pre: apply 04-loader then `index.html.after-04-loader.patch`.
- Panel: without team 1's shell the module registers its panel under the name `lines` when `#bar [data-panel=lines]`
  exists (the Edition 4 LINES title then opens WAFER), else `wafer`. With the shell it mounts `#layers` inside the
  shell's `[data-group=layers]` group (team 1 REQUEST filed: the shell must stop requiring #lines/#lyAll/#lyFocus/#lyFind).
