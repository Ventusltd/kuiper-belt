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

## Builder notes (OPUS-3 builder, 22:12 UTC; replaces the 21:45 note, which the lead's full-file write overtook)
The lead's 21:50 whole-file write replaced the builder's sections; the builder now merges INTO the lead's code by
exact-string edits only, each marked "(builder)" in a comment. Measured under a KY shim of HOOKS.md (Galaxy S24, Pixel 7
landscape; /tmp/nl010-opus/team-3/builder/probe.cjs) and changed:
1. State machine: `setState` now has a legal-moves table (REFUSED terminal except a restated refusal; FAIL only to
   WAIT/LOAD/FAIL/REFUSED), returns false on an illegal move, never an empty why for EMPTY/FAIL/REFUSED, keeps
   `history` (last 24 `[status, why, ms]`, also in `get(id).history` for the WAIT/LOAD screenshots); fixed the old bug
   where an unknown state wrote "unknown state FAIL".
2. sha256: `verified()` refused nothing when a record had no sha256 (`src.sha256 && …`): measured, a layers.json with
   lines' sha256 deleted gave `OK · 344 of 346`. Now a record without a 64-hex sha256, or no crypto.subtle, is
   `FAIL · record has no sha256 …` before any fetch; compare is lowercase; `bytes` checked when it is a number.
   `loud()` says DID NOT LOAD only for a FAIL (the wafer's refusal read "KEYS.JSON DID NOT LOAD").
3. Rows: the 1 px border-top made the stretched input miss the row (`covers false` on all 7); now an inset box-shadow,
   the input covers the row exactly. Group headers `.lg` 40 → 44 px (they are fold targets). Landscape 863x360: rows
   were `flex:none`, so `elements` and `spider` were clipped and unreachable and `#lineslist` had clientHeight 0; now
   `.ky-ly-rows` shrinks and scrolls itself (min 88 px) and `#lineslist` is `flex:1 1 0; min-height:88px`.
4. One keys.json body has a 1,240,449-character `line_text`; rendered whole it was a 723,252 px list row. The list row
   now shows 600 characters verbatim + "… (+N characters, the whole line is on its card)" and clamps to 3 lines.

## TESTER 22:14 UTC (OPUS-3 tester)
test.cjs is mine; lead, thanks for the api fix (kept). Please tell me here rather than editing it, so two edits do not
cross. Now in test.cjs: the panel host is `#ky-layers` (else `#layers`), rows from `#layers`; pre-shell the WAFER panel is
opened by a real tap on `#bar [data-panel=lines]`, and t2-title is NOT EVALUATED until kuiper-shell is admitted (a NOT
EVALUATED row blocks the hand-off pass). Pre-integration runs: `node /tmp/nl010-opus/team-3/tester/build-pre.cjs layers`
(04-loader patch + our after-04 patch; manifest records `"sha256": "live"`, hashed at each request), then
`node test.cjs http://127.0.0.1:8432/ <out> --index /tmp/nl010-opus/team-3/tester/pre/index.html --manifest
/tmp/nl010-opus/team-3/tester/pre/modules.json`. A pass with --index/--manifest prints "pre-integration" and is never
the hand-off pass. `--handoff` writes img/ and TEST.md.
