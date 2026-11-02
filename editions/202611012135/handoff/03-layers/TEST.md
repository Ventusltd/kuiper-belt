# Opus team 3, step 3 the layer registry: TEST.md

Verdict: **FAIL** — written by `test.cjs` at 2026-11-02T03:05:27.820Z from http://127.0.0.1:8431/editions/202611012135/ (kuiper-belt 66be444).

Run: `node editions/202611012135/handoff/03-layers/test.cjs http://127.0.0.1:8432/ /tmp/nl010-opus/team-3/tester/out --handoff` from the repository root served by `python3 -m http.server 8432 --bind 127.0.0.1`. Playwright, harness GL flags, `devices['Pixel 7']` and `devices['Galaxy S24']`, real touch (`page.touchscreen.tap`), 6.5 s after load. Failures are served by Playwright routes only (keys.json 404, keys.json with byte 8370 changed `i`→`I` (sha256 9f6bae817dd2… against e153dfa45d30…), cosmos/wafer.tsv 404, cosmos/wafer.tsv and keys.json held to show WAIT and LOAD); no file on disk is changed. The one allowed console line in F and H is Chromium's own `Failed to load resource … 404` for the file served 404.

Governing text: neural-link FIXES/NL-010/ROADMAP.md step 3 "Acceptance test on Android" 1–9; team-2/STEPS.md 3.1–3.8 and its tests (:248-287).

| assertion | what is measured | Pixel 7 | Galaxy S24 |
|---|---|---|---|
| `state-wait` | 3.4/3.5 until the wafer settles every wafer-bound row reads WAIT · wafer (cosmos/wafer.tsv held) | PASS | PASS |
| `state-load` | 3.4 while keys.json is fetched the lines row reads LOAD (keys.json held after the wafer admitted) | PASS | PASS |
| `t1-inspect` | test 1: inspect() -> layers 7, unique 7, complete; 7 input[data-ky-layer] in #layers, one original per layer, no [data-layer-id]/[data-pn-layer] | PASS | PASS |
| `t2-title` | test 2: the WAFER title is in #bar and a tap on it opens #layers | NOT EVALUATED: team 1 shell (kuiper-shell) not admitted; panel opened by already open | NOT EVALUATED: team 1 shell (kuiper-shell) not admitted; panel opened by already open |
| `t2-panel` | test 2: #layers under the bar, full width, every row >= 44 px with its input over it and a state tag; lines OK · 344 of 346; editions OK · n of m placed, k beyond the rim | PASS | PASS |
| `t2-list` | test 2: the lines list scrolls inside the panel (panel scrollHeight = clientHeight, list overflows), "344 of 344 rows", filter "gridatlas" shows exactly the Edition 4 predicate's count over keys.json (repo + path + title, index.html:741), clear restores 344 | PASS | PASS |
| `t3-toggle` | test 3: tap the lines row: get(lines).on false, readout "verified lines layer off", no green at edScreen(edPlaced[0]); tap again: OK and green returns | PASS | PASS |
| `t3-repos` | test 3: tap the repos row with no value: OK · none lit, nothing new drawn, no error | PASS | PASS |
| `t6-written` | test 6: each toggle is written to the URL (layers=<on ids, in order>) with history.replaceState: same document, history.length unchanged | PASS | PASS |
| `t8-apps` | test 8: see-through, elements, spider rows present with EMPTY/REFUSED and a why (elements REFUSED · licence unsettled, Q1); see-through first of THE APPS and the largest label in the panel | PASS | PASS |
| `a-escape-back` | REVIEW 6566289513: e opens a card; Escape, e and one back gesture (history.back) on the cut page: no page error, the page stays | PASS | PASS |
| `a-console` | scenario A: zero console errors, zero page errors, zero failed requests | PASS | PASS |
| `t10-card-details` | pick a LINES row, tap details: the card stays shown, opens its details and grows (REVIEW 6567442274) | PASS | PASS |
| `t10-card-close` | tap x: the card closes and the selection (KY.sel.target) clears | PASS | PASS |
| `t6-hash` | test 6: editions/202611012135/#layers=lines,periods restores on = [periods, lines]; untick periods writes layers=lines, no reload | PASS | PASS |
| `t6-query` | test 6: editions/202611012135/?layers=lines,periods restores on = [periods, lines]; untick periods writes layers=lines, no reload | PASS | PASS |
| `t6-pointer` | test 6: through the pointer editions/#layers=lines,periods (pointer stamp 202611012027 moved to 202611012135, as the integrator moves it; editions/index.html:7,:11,:12) restores the layers | PASS: pointer still names 202611012027 (Edition 4); measured with the stamp moved | PASS: pointer still names 202611012027 (Edition 4); measured with the stamp moved |
| `t7-repos` | test 7: ?selftest=repo:gridatlas PASS; "/" gridatlas Enter -> repos row OK · gridatlas (value gridatlas, on); KY.layers.set(repos, true) keeps PASS | PASS | PASS |
| `t4-keys-404` | test 4: keys.json HTTP 404 -> lines row FAIL · keys.json HTTP 404, #big KEYS.JSON DID NOT LOAD, #refuse[role=alert] visible, wafer still drawn (engine pixels, DOM layers hidden for the shot), pageerror 0, e does not fly | PASS | PASS |
| `t5-keys-tampered` | test 5: keys.json with one byte changed (same length, valid JSON) -> FAIL · sha256 mismatch, zero sparks at the 344 places, alert visible, wafer still drawn, zero console errors | PASS | PASS |
| `t7b-wafer-404` | test 7b: cosmos/wafer.tsv HTTP 404 -> every row REFUSED · the wafer refused: ../../cosmos/wafer.tsv did not load…, bar and alert present, pageerror 0 | PASS | PASS |
| `states-shown` | 3.4: WAIT, LOAD, OK, EMPTY, FAIL and REFUSED were each shown in a row (across the scenarios) | PASS | PASS |

Device-independent (test 9 and the hand-off):

| assertion | what is measured | result |
|---|---|---|
| `t9-ci` | test 9: python3 tools/ci_check.py prints RESULT: PASS | PASS |
| `t9-module` | test 9: exactly one modules/<stamp>-layers.js, node --check exits 0, exactly one KY.register( | PASS |
| `t9-records` | test 9: data/layers.json kuiper.layers.v1: seven records, order periods..spider, key layer:<id>, label, group, colour from PALETTE.md with its meaning, licence, source | PASS |
| `t9-hashes` | test 9: every data file a record names (editions.json, keys.json, see-through.json, …) hashes to the record's sha256 and bytes; data/*.json no record names are listed | PASS |
| `t9-carried` | REVIEW 6566289513 (admission 4): the 96 px band rule, the card-resize keeper (ResizeObserver), the fly duration by distance and 07-perf content-visibility on #lineslist .ln survive the cut, in layers.js or the served page (found by pattern, as the REVIEW measured) | PASS |
| `t9-module-sha` | hand-off: MODULE.sha256 names the module file and its measured sha256 | PASS |

Console errors per device and scenario: Pixel 7 A-normal 0, C-card 0, t6-hash 0, t6-query 0, t6-pointer 0, E-selftest 0, F-keys-404 0, G-keys-tampered 0, H-wafer-404 0; Galaxy S24 A-normal 0, C-card 0, t6-hash 0, t6-query 0, t6-pointer 0, E-selftest 0, F-keys-404 0, G-keys-tampered 0, H-wafer-404 0.

Screenshots (first device): `img/WAIT.png` 52 KB, `img/OK.png` 117 KB, `img/FAIL.png` 87 KB, `img/REFUSED.png` 82 KB. Every device's screenshots and `report.json` are in /tmp/nl010-opus/team-3/lead/run12.

The tester refuses the hand-off until every row reads PASS on both devices in a run without `--index`/`--manifest`; a NOT EVALUATED row names the other team whose module it waits for.

## Journey (journey-6.cjs, the controller's admission script) on exactly these bytes

Frozen root /tmp/nl010-opus/team-3/lead/snap7 (gen/snap7.sh): the branch index.html cut by delete-moved.py plus flyTo's 4th argument (the controller's a6 recipe); modules.json [hello, line-card, layers 202611020304 b16716bd…]; served on 8431. `node journey-6.cjs http://127.0.0.1:8431/editions/202611012135/ <out> --device <d>`.

| step | Pixel 7 | Galaxy S24 | note |
|---|---|---|---|
| load | FAIL | FAIL | base: Edition 4 bar is two rows (same at G2) |
| modules | PASS | PASS |  |
| edition-open | PASS | PASS |  |
| edition-close | PASS | PASS |  |
| lines-open | PASS | PASS |  |
| lines-filter | PASS | PASS |  |
| lines-pick | PASS | PASS |  |
| card-details | PASS | FAIL | S24: details opened (detailsOpen true), card stayed shown; it was already at its 34dvh cap (265.2 px) with this line, so it could not grow |
| card-close | PASS | PASS |  |
| key-e-1 | PASS | PASS |  |
| key-e-2 | PASS | PASS |  |
| key-e-3 | PASS | PASS |  |
| pinch-drag | PASS | PASS |  |
| spark-tap | PASS | PASS |  |
| whole-wafer | PASS | FAIL | S24: "screenshot timed out" in the measurement; frame 14 shows the whole wafer |
| see-through | FAIL | FAIL | base: no SEE THROUGH without the shell / see-through (same at G2) |
