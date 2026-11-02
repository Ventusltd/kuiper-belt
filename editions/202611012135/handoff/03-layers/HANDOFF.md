# Opus team 3, step 3 the layer registry: HANDOFF

## Revision 202611020637 (OPUS-3 lead, 2026-11-02; times from `date -u`)

**Module** `202611020637-layers.js` (this folder; admitted path `modules/202611020637-layers.js`), 64,237 bytes,
sha256 **c8fccccf212a66cf9c37e02a260eed212bd1ad2548c52b13fbf6024bd5d22486**. A new file: the refused
`editions/202611012135/modules/202611020304-layers.js` (b16716bd…) is unchanged.

**Base** Kuiper Edition 9 (kuiper-belt main fdf6e35, editions/202611020629), index.html unchanged (73383218…). To admit:
copy into editions/202611020629 (or the next stamp's folder) the module into `modules/`, `edition-9/data/layers.json`
and `edition-9/data/editions.json` into `data/`, and append MODULE.json's record to modules.json with `layers` last in
order (`edition-9/modules.json` is exactly that manifest for 202611020629). For another stamp, re-stamp the two data
files with `python3 tools/build_layers.py --edition <stamp>` (it writes editions.json from editions/README.md and the
pointer and re-measures layers.json; then set layers.json `edition`).

### What was wrong (refusal 04:24Z, journey spark-tap on Pixel 7)

The refused file kept its tap bookkeeping (`down`, `moved`) in a bubble-phase `pointerup` on window. kuiper-shell stops
`pointerup` on its bar and its strip, so after any tap on a menu title (the journey taps EDITION and WAFER first) that
pointer stayed in `down`, and every later `pointerdown` set `moved = 99`: the tap 1.6 px from line 323 never reached the
picker, and the engine's key card (35,670,583,406) stayed on screen.

### What changed

1. **The tap**: the bookkeeping now runs in the capture phase (it sees every up, stopped or not), a primary
   `pointerdown` starts a fresh gesture, and the pick still runs in the bubble phase after the engine's key card, so the
   line's card wins. Measured on a cut page (owner mode, below): spark-tap PASS, card 323.
2. **Engine lines**: Edition 9's page still owns the verified lines (loadEdition, the green sparks, its spark picker,
   e/E, the LINES block the shell moves into WAFER). When `#lyAll` and `#lineslist` exist the module does not draw,
   list, pick or step lines a second time (no duplicate ids, no second picker): the engine's layer is the lines layer;
   `#lyAll` follows the registry's lines row both ways; the registry still verifies keys-min.json against its sha256
   (OK · 344 of 346), and a FAIL switches the engine's lines off. The seven rows sit in the engine's LINES block after
   its filter and before its list, and fold away while the filter has the focus (back 350 ms after it is left).
   `inspect().lines_owner` says `engine` or `module`. On a cut page (no `#lyAll`) the module owns the lines as before.
3. **E7**: MODULE.json `reads` = data/layers.json, data/editions.json, keys-min.json, keys.json, location.hash,
   location.search; `writes` are literal ids and names. The module carries the same list (`READS`) and refuses to fetch a
   file a record names outside it. edition_check on the layers snapshot: no layers line in E7.
4. **Data for 202611020629**: data/layers.json and data/editions.json carry `"edition": "202611020629"` (editions.json:
   9 editions, pointer 202611020629; build_layers.py `--check` PASS). The see-through record names no file (Edition 9 has
   no data/see-through.json; its module is not admitted). keys-min.json / keys.json are Edition 9's own.

### Proof (TEST.md, edition-9/)

| run | Pixel 7 | Galaxy S24 |
|---|---|---|
| journey-6.cjs, Edition 9 alone (base) | 16/16 | 16/16 |
| journey-6.cjs, Edition 9 + layers 202611020637 | 16/16 | 16/16 |
| test.cjs (`--stamp 202611020629`), layers snapshot | 22/22 | 22/22 (static 6/6, RESULT PASS) |
| journey-6.cjs, Edition 9 cut by delete-moved.py + flyTo dur (owner mode, for the record) | 16/16 | not run |

No red step is added to Edition 9 on either phone; no step was HARNESS-LIMITED. The cut-page run (07:41:52-07:49:17Z,
index df66421f…, the controller's e6-cand-layers recipe applied to Edition 9) is evidence for the tap fix only; it is not
the admission recipe, which is Edition 9 uncut.

Open: elements stays REFUSED (licence, owner Q1); see-through EMPTY until its module is admitted; the fly duration by
distance still waits on flyTo's 4th argument in the engine (REQUEST, unchanged).

---

Earlier hand-offs: issue #10 comments 6567112212 (d5f71980…) and 6568555984 (202611020304, b16716bd…, refused 6569024455).
