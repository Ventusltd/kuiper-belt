# PLAN: Opus team 4 (lead decides), step 4 the cartridge law

Status 22:08 UTC. Ownership: lead owns `index.html.patch`, `modules/202611012145-loader.js`, `modules/202611012145-hello.js`,
`modules.json`, `modules.schema.json`, `edition_check.py.patch`, `HOOKS.md`, `MODULE.sha256`, `HANDOFF.md`. Tester owns
`test.cjs` and `TEST.md`. Evidence officer owns `EVIDENCE.md`, `LICENCE.txt`. Builder sends edits to the lead as a
script (as `builder/fix.py`); the lead merges.

Source of the block: `/tmp/nl010-opus/team-4/lead/src/block.js`; `src/build.py` + `src/mk.sh` regenerate the patched
page, the loader reference (header + the same block bytes), `index.html.patch` and `MODULE.sha256`.

## Merge at ~22:10 UTC (rev 2), then every sha256 of the loader reference and the patch changes; hello's does not

- Builder B1-B8 (builder/fix.py), all taken: a module's own script error is its refusal (`script error: <msg>`), lists
  must be lists, `bytes <n> ≠ manifest <m>`, a non-object manifest refused whole, any exception in one admission is that
  module's refusal (`loader error <msg>`) and the next runs, null records skipped in the sums.
- Evidence R1: the block comment now names every engine hunk (wafer promise; NL-009 09-robust refuse(); 04-touch).
- Evidence R2: `header names <x> ≠ <id>` in the loader; `header names` in E6.
- Evidence R3/R5: at `done`, `__KUIPER_EDITION__.order/admitted/refused/timings` and `KY.modules` are frozen
  (`failures` stays open: an install may reject after done; disclosed, R4).
- Evidence R7: licence line in edition_check.py's docstring (done). **Tester: please add
  `// Apache-2.0 (kuiper-belt), kuiper-belt README.md:157.` to test.cjs's header (R7).**
- HOOKS.md corrections (a) time 21:42:44Z, (b) `big` :123, (c) the refusal list = the loader's exact strings.

## Rev 2 is in (22:14 UTC)

`index.html.patch` sha256 `811e5dad…3d5b`, `modules/202611012145-loader.js` `d6766eec…2f98` (12,405 bytes), hello
unchanged `ee2130b5…dd53`; modules.json and modules.schema.json regenerated; edition_check.py.patch carries the E6
`header names` check and the licence line. Rev 1 passed tests 1-9 on Pixel 7 and Galaxy S24 under the lead's harness
(/tmp/nl010-opus/team-4/lead/report-rev1.json); the lead re-runs it on rev 2 now. HOOKS.md corrected (a)-(c).

## After rev 2

- Tester: re-run test.cjs on both devices against the new `index.html.patch`; write TEST.md; screenshots of 1, 2, 7 to img/.
- Evidence: re-key section F against the rev-2 patched page; final verdict on HANDOFF.md.
- Lead: posts HANDOFF on #10 only when TEST.md says PASS on both devices with zero console errors.

## 22:35 UTC, lead to tester (please act; test.cjs is yours)

- Rev 2 passes tests 1-9 on Pixel 7 and Galaxy S24 under the lead's harness (`/tmp/nl010-opus/team-4/lead/leadtest.cjs`,
  report `/tmp/nl010-opus/team-4/lead/report-rev2.json`). Your dev4 run was on rev 1 (`4de7153b…`); please re-run on
  rev 2 (`index.html.patch` sha256 in MODULE.sha256).
- Your R2 FAIL is the harness, not the page: `/tmp/nl010-opus/team-4/lead/r2/r2.cjs` measures the base page, the base +
  04-touch, and the full rev-2 page on Pixel 7: after `setViewportSize` 839x412, 412x839, 412x783 the canvas is
  839x412, 412x839, 412x783 in all three, one `resize` event each, pageerror 0. Check what your appended probe does
  to `#c` or to the resize listener.
- Your R5 FAIL is the harness: `#lineslist` is filled only when LINES opens (`setPanel` → `fillLines`); 09-robust.md
  TEST 5 reads it after opening LINES. Tap LINES first.
- R7: please add `// Apache-2.0 (kuiper-belt), kuiper-belt README.md:157.` to test.cjs's header.
- img/ holds the lead harness's four (1 Pixel 7, 2 Galaxy S24, 2 Pixel 7, 7 Galaxy S24; each <125 KB, CSS px);
  replace them with yours if you prefer, keeping ≤4.

## 22:55 UTC, rev 3 (adopts OPUS-3 #10 comment 6564782359 item 4)

`KY.cam.atHome` gains a setter (engine :245; without it a resize after a module's spark fly re-homes, :248 in the
base). `KY.refuse(text, slot)` is new, a top-level member, not in `hooks`: it writes the page's `refuse()` (patched
page :140) with the module's own slot; `engine` and `modules` are reserved (TypeError); empty text clears the slot and
the strip disappears when every slot is empty. `KY.names` is now 35 (`refuse` added); `Object.keys(KY.hooks)` is
still the 28. New sha256s in MODULE.sha256 (patch `59911f4b…19ad`, loader `c24cdf99…97b0`, 12,720 bytes; hello
unchanged). **Tester:** please re-run on rev 3; if c7 asserts `KY.names.length === 34`, it is 35 now. **Evidence:**
F-rows for :826 (cam) and :838 (refuse) of the rev-3 patched page.

## 23:15 UTC, rev 4 (rebase onto the integrator's page; shell forwarding). Apply THIS revision; rev 3 is withdrawn.

- **Rev 3 (`59911f4b…`) is withdrawn.** mk.sh diffed the live, moving page against a page built on 96736f5, so rev 3
  would have undone 48 of the 50 lines team 10 added (NL-009 07-perf and 03-camera) and brought back `EDITION 2`
  (evidence officer's BLOCKER, correct).
- **Rev 4 base is fixed:** `editions/202611012135/index.html` as team 10 left it, sha256
  `390b15aed286993593ef64cbd3c22f45a6ec41548228274c5e228ae450123ae5`, copied to `/tmp/nl010-opus/team-4/lead/w4/base.html`.
  On that copy: NL-009 09-robust and 04-touch by patch; `src/prep_w4.py` resolves the two 04-touch hunks that did not
  apply (the Escape/back hunk as before; 03-camera's edition `pointerup` guard keeps every condition and takes 04's
  `!tapUp` in place of `moved >= 48`, as OPUS-10 #10 6564857812 described); `src/build.py` adds the wafer promise,
  refuse() slots and the block. The patch is `diff -u base.html patched.html` (`src/mk4.sh`), never against the live file.
- Verified: `patch --dry-run -p1` applies to the live file (sha256 above); 27 lines removed, every one of them also
  removed by the 96736f5-based build except 03-camera's `pointerup` guard (replaced, above); `EDITION 2 ·` occurs 0 times
  before and after.
- **Shell forwarding (OPUS-1 REQUESTS item 2, via the harness):** once `kuiper-shell` is admitted,
  `KY.panels.add(name, el)` appends `el` to `KY.modules['kuiper-shell'].api.panel(name)`; a name the shell lacks falls
  back to the page's PANELS. `KY.modules` is no longer frozen at `done` (the shell publishes `.menuBar` there); the
  published `order/admitted/refused/timings` still are.
- New sha256s in MODULE.sha256 (hello unchanged). Lead harness case 10 admits the real shell module and a probe that
  calls `KY.panels.add('wafer', el)`. **Tester:** re-run on rev 4; c0's "reference ≡ page block" now reads the rev-4 page.
