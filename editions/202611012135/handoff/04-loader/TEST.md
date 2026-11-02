# TEST: handoff/04-loader/test.cjs (Opus team 4 tester)

**Verdict: PASS on Pixel 7 and Galaxy S24, zero console errors and zero pageerrors in every case (the deliberate 404 lines and the engine's deliberate WebGL2 throw are reported, not counted). The tester does not refuse the hand-off.**

- test.cjs sha256 `816f46f3f8fb14732f2a2435c9f65494d377d0be4de453a90b6363d9b63f4641` (77436 bytes); the tester owns it (PLAN.md 22:08). Licence: Apache-2.0 (kuiper-belt), kuiper-belt README.md:157.
- run `2026-11-02T01:15:54.481Z` → `2026-11-02T01:39:31.023Z`: page = the edition page as committed, which carries the hook table (editions/202611012135/index.html, sha256 418ae14ca39bc92be028f852825da196fd634ec12bb48f8f538d0cf739564d05); page sha256 `418ae14ca39bc92be028f852825da196fd634ec12bb48f8f538d0cf739564d05`; served from a scratch copy (`/tmp/nl010-opus/team-4/tester/run/root`) at http://127.0.0.1:8442/editions/202611012135/; result **PASS**.
- order in the scratch manifest: `hello, probe-a, probe-b, probe-c, probe-wafer` (hello is team 4's record from handoff/04-loader/modules.json; probe-a, probe-b, probe-c, probe-wafer are test modules written into the scratch copy only, never into the repository).

Run it: `node editions/202611012135/handoff/04-loader/test.cjs [--devices "Pixel 7,Galaxy S24"] [--out DIR]` from anywhere; it copies the edition folder to `/tmp/nl010-opus/team-4/tester/run/` (the committed page as is when it already carries the hook table, as now; otherwise `index.html.patch` applied; `--patch`/`--base`/`--html` choose another page), serves the copy on 127.0.0.1:8442 and writes `report.json` and the screenshots to `--out`. Exit 0 = all pass. Playwright Chromium with SwiftShader, `devices['Pixel 7']` (412×839) and `devices['Galaxy S24']` (360×780), real touch (`page.touchscreen.tap`, CDP `Input.dispatchTouchEvent`).

## Checks (every check, both devices)

| check | what is measured | Pixel 7 | Galaxy S24 |
|---|---|---|---|
| c1.admitted | every order entry admitted, in order, each sha256 = the manifest | PASS | PASS |
| c1.refused | refused is empty, no failures, no alert | PASS | PASS |
| c1.readout | the readout has one "&lt;id&gt; admitted · &lt;sha256 first 12&gt;" line per module and nothing else | PASS | PASS |
| c1.isolation | one blob-URL &lt;script data-ky-module&gt; per module; each KY.modules entry frozen with the manifest sha256 | PASS | PASS |
| c1.fetch | nothing under modules/ fetched outside order; each module fetched once (the loader reference never) | PASS | PASS |
| c1.wafer | the wafer is drawn under the bar | PASS | PASS |
| c1.running | the admitted modules draw (hello ring and probe-a painter counts grow) | PASS | PASS |
| c1.wafer-hook | probe-wafer saw KY.hooks.wafer resolve with N &gt; 0 | PASS | PASS |
| c1.readout-panel | READOUT opened by a touch tap shows every admitted line | PASS | PASS |
| c9.measured | load → last admitted and Σ bytes / Σ byte_budget recorded and equal to the page's own sums (no threshold) | PASS | PASS |
| c1.errors | zero console errors and pageerrors | PASS | PASS |
| c2.refused | hello refused 'sha256 mismatch', nothing else refused | PASS | PASS |
| c2.rest | every other module admitted, in order | PASS | PASS |
| c2.alert | #refuse[role=alert] visible inside the viewport, naming hello and the reason | PASS | PASS |
| c2.nothing | the refused bytes never ran: no script, no #ky-hello, no KY.modules.hello | PASS | PASS |
| c2.wafer | the wafer is drawn and the bar present | PASS | PASS |
| c2.running | the rest keeps running (probe-a painter count grows) | PASS | PASS |
| c2.errors | zero console errors and pageerrors | PASS | PASS |
| c3.refused | probe-a refused 'missing hook noSuchHook' | PASS | PASS |
| c3.unhosted | #ky-probe-a absent | PASS | PASS |
| c3.dependent | probe-b, which requires probe-a, refused 'missing hook probe-a' | PASS | PASS |
| c3.rest | the modules that do not need it admitted | PASS | PASS |
| c3.alert | #refuse[role=alert] inside the viewport names both | PASS | PASS |
| c3.errors | zero console errors and pageerrors | PASS | PASS |
| c4a.refused | served as 202611012201-probe-a.js with generation 202611012200 → refused, the stamp named in words | PASS | PASS |
| c4a.rest | the rest admitted, except probe-b which requires probe-a | PASS | PASS |
| c4a.alert | #refuse[role=alert] inside the viewport names the stamp | PASS | PASS |
| c4a.errors | zero console errors and pageerrors | PASS | PASS |
| c4b.admitted | served as probe-a.js (no leading digits) → admitted: identity is generation + sha256 | PASS | PASS |
| c4b.errors | zero console errors and pageerrors | PASS | PASS |
| c5.refused | hello refused 'install threw test' | PASS | PASS |
| c5.rest | every other module admitted | PASS | PASS |
| c5.alert | #refuse[role=alert] inside the viewport | PASS | PASS |
| c5.errors | zero console errors and pageerrors | PASS | PASS |
| c6.refused | hello refused 'HTTP 404' | PASS | PASS |
| c6.rest | every other module admitted | PASS | PASS |
| c6.alert | #refuse[role=alert] inside the viewport | PASS | PASS |
| c6.errors | zero console errors and pageerrors (1 deliberate 404 line(s) reported, not counted) | PASS | PASS |
| c7.empty | admitted [] and refused [], no alert | PASS | PASS |
| c7.frozen | Object.isFrozen(window.KY) and of hooks, names, cam, lit, sel, draw, panels; writes do not land | PASS | PASS |
| c7.hooks | Object.keys(KY.hooks) = the 28 names of HOOKS.md in order; KY.names = those + the extras HOOKS.md lists (cam lit sel redraw draw panels refuse: 35) | PASS | PASS |
| c7.alias | window.__KUIPER_MODULES__ === KY.modules; KY.schema 'kuiper.hooks.v1'; KY.edition = the stamp | PASS | PASS |
| c7.refuse | rev 3: KY.refuse(text, slot) shows its line in #refuse and clears it with empty text; slots engine and modules throw TypeError; KY.cam.atHome is settable | PASS | PASS |
| c7.wafer | a whole wafer without modules: the wafer drawn, the bar present | PASS | PASS |
| c7.errors | zero console errors and pageerrors | PASS | PASS |
| c7b.nowait | the loader finished while ../../cosmos/wafer.tsv was still pending; hello and probe-wafer admitted, the wafer promise pending | PASS | PASS |
| c7b.words | the page says the engine's words and KY.hooks.wafer rejects with them | PASS | PASS |
| c7b.rest | every module stays admitted | PASS | PASS |
| c7b.errors | zero console errors and pageerrors (1 deliberate 404 line(s) reported, not counted) | PASS | PASS |
| c10a.refused | a module with a syntax error → refused "script error: …", never admitted | PASS | PASS |
| c10a.rest | every other module admitted; #refuse[role=alert] inside the viewport | PASS | PASS |
| c10a.errors | zero console errors and pageerrors | PASS | PASS |
| c10b.refused | a module that registers, then throws at top level → refused "script error: …", not admitted, no #ky-probe-c | PASS | PASS |
| c10b.rest | every other module admitted; #refuse[role=alert] inside the viewport | PASS | PASS |
| c10b.errors | zero console errors and pageerrors | PASS | PASS |
| c10c.refused | requires as a string in the record → refused "requires is not a list" | PASS | PASS |
| c10c.rest | every other module admitted; #refuse[role=alert] inside the viewport | PASS | PASS |
| c10c.errors | zero console errors and pageerrors | PASS | PASS |
| c10d.refused | requires as a string in the registration → refused "registration requires is not a list" | PASS | PASS |
| c10d.rest | every other module admitted; #refuse[role=alert] inside the viewport | PASS | PASS |
| c10d.errors | zero console errors and pageerrors | PASS | PASS |
| c10e.null | a null record in modules is skipped: every order entry admitted, refused [], no alert, the sums still computed | PASS | PASS |
| c10e.errors | zero console errors and pageerrors | PASS | PASS |
| c10f.twice | an id listed twice in order: admitted once, the second refused 'in order twice', fetched once, the rest admitted | PASS | PASS |
| c10f.errors | zero console errors and pageerrors | PASS | PASS |
| T1 | 04-touch T1 a one-finger drag moves the camera 100 × 60 px; no pointercancel, no page scroll | PASS | PASS |
| T2 | 04-touch T2 a pinch on the wafer zooms × 2.000 about the fingers; page scale 1 | PASS | PASS |
| T2b | 04-touch T2b a pinch on the bar does not zoom the page | PASS | PASS |
| T2c | 04-touch T2c a pinch on the open LINES panel does not zoom the page | PASS | PASS |
| T3 | 04-touch T3 a 60 ms tap opens the card, a 900 ms hold does not, a 6 px jittered tap does, a 30 px drag does not | PASS | PASS |
| T4 | 04-touch T4 a double tap does not zoom the page; a bar tap clicks at once (median of 3 &lt; 100 ms) | PASS | PASS |
| T5a | 04-touch T5a a bar tap over a spark opens the panel, not the spark | PASS | PASS |
| T5b | 04-touch T5b the card's × over a spark closes the card and does not reopen it | PASS | PASS |
| T5e | 04-touch T5e a wafer tap with a panel open only dismisses the panel | PASS | PASS |
| T6a | 04-touch T6a back with a panel open closes the panel and stays on the page | PASS | PASS |
| T6b | 04-touch T6b back with the card open closes the card | PASS | PASS |
| T6d | 04-touch T6d Escape closes the card | PASS | PASS |
| T6f | 04-touch T6f a panel closed and a card opened in one task: the card survives the page's own back() | PASS | PASS |
| T6g | 04-touch T6g a user back after that race closes the card | PASS | PASS |
| T7 | 04-touch T7 a 900 ms press opens nothing; contextmenu is prevented on the wafer and the bar | PASS | PASS |
| T.errors | zero console errors and pageerrors | PASS | PASS |
| R1 | 09-robust R1 READOUT after a pick sits under the bar, not at 0 | PASS | PASS |
| R8 | 09-robust R8 toolbar, aria-controls/aria-expanded (READOUT true when open), named regions, card live region, details button, rows focusable, Enter opens a row | PASS | PASS |
| R3 | 09-robust R3 Escape closes the panel, then the card | PASS | PASS |
| R2 | 09-robust R2 rotation and the toolbar: the canvas follows the window, the open panel sits under the bar | PASS | PASS |
| R.errors | zero console errors and pageerrors | PASS | PASS |
| R4 | 09-robust R4 prefers-reduced-motion: the camera lands in one step after e (one zoom value) | PASS | PASS |
| R4.errors | zero console errors and pageerrors | PASS | PASS |
| R5 | 09-robust R5 keys.json 404 is said in EDITION and LINES | PASS | PASS |
| R5.errors | zero console errors and pageerrors (2 deliberate 404 line(s) reported, not counted) | PASS | PASS |
| R7 | 09-robust R7 with JavaScript off the &lt;noscript&gt; sentence renders | PASS | PASS |
| R6 | 09-robust R6 WebGL off: #refuse[role=alert] says WebGL2 in words; the engine's throw names itself 'WebGL2 is not available' | PASS | PASS |
| R6.errors | no other console error or pageerror with WebGL off | PASS | PASS |
| c0 | MODULE.sha256 = the files; the loader reference ≡ the patched page between its marker lines; hello = its record | PASS (device independent) | |
| c8 | test 8: tools/edition_check.py (tools/edition_check.py) E1-E8 PASS on a copy with team 4's records; exit 1 on each of 7 mutations (hash, stamp, requires, stray file, writes, register twice, no licence) | PASS (device independent) | |

## c0 and c8 in detail (run of record)

- c0 PASS: MODULE.sha256 modules/202611012145-hello.js
- c0 PASS: MODULE.sha256 modules/202611012145-loader.js
- c0 PASS: MODULE.sha256 index.html.patch
- c0 PASS: modules/202611012145-loader.js ≡ the patched page between the marker lines
- c0 PASS: index.html.patch applies cleanly to a page the integrator committed; the committed page carries its loader block (row above) applies to: a72c175 (390b15aed286)
- c0 PASS: modules/202611012145-hello.js = its record (sha256, bytes, generation = file name)
- c8 PASS: copy of the folder with team 4's records, expect PASS, E1-E8 each PASS, exit 0
- c8 PASS: mutation hash, expect FAIL (exit 1), exit 1 · E2 FAIL: 202611012135: hello refused: sha256 mismatch (file 44e11ebd4caf, manifest ee2130b56e74); RESULT: FAIL
- c8 PASS: mutation stamp, expect FAIL (exit 1), exit 1 · E6 FAIL: 202611012135: hello refused: stamp mismatch: generation 202611012145, file name 202611012146; RESULT: FAIL
- c8 PASS: mutation requires, expect FAIL (exit 1), exit 1 · E6 FAIL: 202611012135: hello refused: missing hook noSuchHook; RESULT: FAIL
- c8 PASS: mutation stray, expect FAIL (exit 1), exit 1 · E2 FAIL: 202611012135: modules/202611012150-stray.js is in no manifest record and no hand-off names it (stray file); RESULT: FAIL
- c8 PASS: mutation writes, expect FAIL (exit 1), exit 1 · E7 FAIL: 202611012135: hello: writes #ky-nowhere, no literal in the file; RESULT: FAIL
- c8 PASS: mutation register_twice, expect FAIL (exit 1), exit 1 · E8 FAIL: 202611012135: hello: KY.register( appears 2 times; RESULT: FAIL
- c8 PASS: mutation no_licence, expect FAIL (exit 1), exit 1 · E6 FAIL: 202611012135: hello: no licence; RESULT: FAIL

## Measured (test 9 and the wafer race), no threshold

- Pixel 7: load event end 98 ms; loader start 96 ms; last module admitted 2890 ms (load → last admitted 2792 ms); wafer.tsv response end 1206 ms; per module hello 2703, probe-a 2714, probe-b 2872, probe-c 2881, probe-wafer 2890; Σ bytes 4166 against Σ byte_budget 20480 for 5 modules (the page's own sums: 4166 / 20480).
- Pixel 7, test 7b (wafer.tsv held, then 404): loader done at 626 ms with the wafer still pending = True; hello admitted at 578 ms.
- Galaxy S24: load event end 43 ms; loader start 41 ms; last module admitted 33967 ms (load → last admitted 33924 ms); wafer.tsv response end 70 ms; per module hello 33881, probe-a 33938, probe-b 33946, probe-c 33953, probe-wafer 33967; Σ bytes 4166 against Σ byte_budget 20480 for 5 modules (the page's own sums: 4166 / 20480).
  (Galaxy S24: measured on a machine shared with nine other teams' Playwright runs; the same page took 2792 ms on the other device in the same run. Recorded, no threshold, as the step says.)
- Galaxy S24, test 7b (wafer.tsv held, then 404): loader done at 295 ms with the wafer still pending = True; hello admitted at 234 ms.

## Refusals, in the loader's words (measured on Pixel 7)

- c2: `hello`: "sha256 mismatch"
- c3: `probe-a`: "missing hook noSuchHook"; `probe-b`: "missing hook probe-a"
- c4a: `probe-a`: "stamp mismatch: generation 202611012200, file name 202611012201"; `probe-b`: "missing hook probe-a"
- c5: `hello`: "install threw test"
- c6: `hello`: "HTTP 404"
- c10a: `probe-c`: "script error: SyntaxError: Unexpected token ';'"
- c10b: `probe-c`: "script error: Error: after"
- c10c: `probe-c`: "requires is not a list"
- c10d: `probe-c`: "registration requires is not a list"
- c10f: `probe-a`: "in order twice"

## Notes the run depends on (disclosed)

- Console errors counted are every `console` message of type error and every `pageerror` and failed request; the only lines not counted are the browser's own `Failed to load resource … 404` for the one URL a case serves as 404 on purpose (c6 hello, c7b `../../cosmos/wafer.tsv`, R5 `keys-min.json` and `keys.json`) and, in R6 only, the engine's deliberate `WebGL2 is not available` throw (09-robust.md:21-25), which R6 requires.
- The NL-009 probes (T*, R1-R4, R8) append the 04-touch harness's probe (`window.__k`, FIXES/NL-009/round1/04-touch-harness.cjs:7-17) to the served copy before the last `requestAnimationFrame(frame);`; the probe is not in the patch. R2 waits up to 30 s for the canvas to follow each `setViewportSize` and records `follow_ms` (a resize event is dispatched with a frame, and a SwiftShader frame on this shared machine can take seconds; a fixed 6 s wait failed once for that reason, not because of the page). T6a/T6b/T6g wait until the page has armed its history entry (`history.state.kuiper`, set on the next drawn frame, 04-touch.md LIMITS) before going back and record `armed_after_ms`.
- c10 is the builder's request via the harness (loader rev 2): syntax error, register-then-throw at top level, `requires` as a string in the record and in the registration, a `null` record, an id twice in `order`.
- The target moved while it was tested: loader rev 1 → rev 5 and the integrator's page 585e4cf5 → 864c89e9 → 390b15ae → 1b008b51 (rev 4 applied) → 418ae14c (rev 4 + line-card hooks). Rev 3 (`59911f4b…`) applied to 390b15ae without a reject yet dropped 48 of the integrator's lines (NL-009 07-perf, 03-camera); the tester's rev-3 run passed 93/93 because no check looked for them. c0 now does: every line the integrator added since the skeleton (96736f5) must survive the patch unless the patch names it as a removed line; the rev-3 page fails it (48 lines), rev 4 and rev 5 pass (one line, 03-camera's `pointerup` guard, replaced by name).
- Rev 5 (KY.nav) is optional under the 00:59 harness ruling and lives in rev5/. This test passed 94/94 on both devices on an earlier rev-5 variant (`index.html.rev5-on-live.patch` sha256 `ffdac169…`, loader block under stamp 202611012145, KY.nav checked in c7) at 01:03 UTC (out/full-rev5b); it has not been run on `rev5/index.html.delta.patch` (`562d176a…`, loader 202611020103). When HOOKS.md lists `nav`, c7 checks KY.nav; the expected KY.names are read from HOOKS.md.
- T4 sampled one tap until 00:57 UTC; the first rev-5 full run measured pointerup → click 363 ms once on the Galaxy S24 (1.2 ms on the Pixel 7), and two reruns of the touch probes on the S24 gave 0.9 and 1.6 ms (out/full-rev5, out/s24-T-1, out/s24-T-2). A double-tap delay would recur at ≈300 ms; it did not, so the sample was a stalled SwiftShader frame. T4 now takes the median of three taps and records all three.
- Integration observation for teams 1 and 10 (not a loader defect): with the committed manifest (`--with-committed`, `kuiper-shell` admitted) the shell supersedes Edition 4's `#bar` (display none), so c1's READOUT tap and c2's "bar present" fail on `#bar`; every module is still admitted and the readout carries every `admitted · <sha12>` line. The integration journey must reach READOUT through `#kuiper-menu-bar`.
- Not evaluated here: a real Android phone, TalkBack, the long-press menu itself (headless Chromium raises none, 04-touch.md LIMITS). The test serves a scratch copy; the committed modules.json is the integrator's and stays empty.

## Screenshots (img/, CSS px, from the run of record, each < 150 KB)

- `1-admitted-readout-Pixel_7.png`: test 1, READOUT opened by touch, one `<id> admitted · <sha12>` line per module.
- `1-admitted-Galaxy_S24.png`: test 1 at 360 px, every module admitted, no alert, the wafer drawn.
- `2-sha256-mismatch-Galaxy_S24.png`: test 2 at 360 px, `#refuse[role=alert]` names hello and `sha256 mismatch`; the rest admitted, the wafer drawn.
- `7-empty-manifest-Pixel_7.png`: test 7, `order: []`: the whole wafer and the bar, no alert.
