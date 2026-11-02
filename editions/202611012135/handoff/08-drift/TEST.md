# TEST.md — Opus team 8, step 8 the drift (P4 on Android)

Run 2026-11-02T00:02:14.440Z · http://127.0.0.1:8480/editions/202611012135/ · **pre-integration** (modules.json routed: served records re-hashed from disk + line-card + drift)
Module `modules/202611012325-drift.js` sha256 `18f7019aad915920e79c1f279ad688f3ccd4f1dd96ff23a992520c19b37fdd8d` (22294 bytes); data/drift.json sha256 `388103129b904a4a038d18adc26b703c144dede2d09497d13fe6223b30b5d103`.

| device | scenario | step | result | measured |
|---|---|---|---|---|
| Pixel 7 | A | baseline wafer | PASS | 7060 green overlay px, no drift module |
| Pixel 7 | A | zero console errors | PASS | 0 |
| Pixel 7 | B | admitted | PASS | status OK registry own (no layer registry admitted) marks 35 |
| Pixel 7 | B | readout five counts | PASS | DRIFT since the cut 202611012135 · 309 SAME · 7 MOVED · 2 GONE · 0 FILE_GONE · 28 UNVERIFIED · 309 SAME / 318 (rows 346 - UNVERIFIED 28) |
| Pixel 7 | B | bar one row | PASS | {"titles":["File","Edit","View","Scope","Wafer","About"],"rows":1,"h":34,"sw":412,"cw":412} |
| Pixel 7 | B | MOVED placed at a new key | PASS | 7 of 7 MOVED at their new keys;  |
| Pixel 7 | B | card names head and new line | PASS | "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Pixel 7 | B | MOVED spark amber | PASS | at (206.0, 419.5): 48 amber px in a 9x9 box |
| Pixel 7 | B | tap within 9 px opens its card | PASS | tap at +6,+6 (8.5 px): taps 0→1, "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Pixel 7 | B | filter "moved" lists exactly the MOVED rows | PASS | chip 44 px tall; listed 7 rows, drift.json MOVED 7 |
| Pixel 7 | B | bar one row with the panel open | PASS | 1 row(s) |
| Pixel 7 | B | zero console errors | PASS | 0 |
| Pixel 7 | C | drift.json missing: refused in words | PASS | DRIFT · data/drift.json did not load. The wafer will not invent a head. (data/drift.json HTTP 404) |
| Pixel 7 | C | drift.json missing: no amber drawn by drift | PASS | marks 0 |
| Pixel 7 | C | zero console errors | PASS | 0 (the deliberate 404 of data/drift.json excluded: 1) |
| Pixel 7 | A/C | drift.json missing: green sparks unchanged | PASS | green overlay px at home: no module 7060, drift.json 404 7060 |
| Galaxy S24 | A | baseline wafer | PASS | 6641 green overlay px, no drift module |
| Galaxy S24 | A | zero console errors | PASS | 0 |
| Galaxy S24 | B | admitted | PASS | status OK registry own (no layer registry admitted) marks 35 |
| Galaxy S24 | B | readout five counts | PASS | DRIFT since the cut 202611012135 · 309 SAME · 7 MOVED · 2 GONE · 0 FILE_GONE · 28 UNVERIFIED · 309 SAME / 318 (rows 346 - UNVERIFIED 28) |
| Galaxy S24 | B | bar one row | PASS | {"titles":["File","Edit","View","Scope","Wafer","About"],"rows":1,"h":34,"sw":360,"cw":360} |
| Galaxy S24 | B | MOVED placed at a new key | PASS | 7 of 7 MOVED at their new keys;  |
| Galaxy S24 | B | card names head and new line | PASS | "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Galaxy S24 | B | MOVED spark amber | PASS | at (180.0, 390.0): 52 amber px in a 9x9 box |
| Galaxy S24 | B | tap within 9 px opens its card | PASS | tap at +6,+6 (8.5 px): taps 0→1, "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Galaxy S24 | B | filter "moved" lists exactly the MOVED rows | PASS | chip 44 px tall; listed 7 rows, drift.json MOVED 7 |
| Galaxy S24 | B | bar one row with the panel open | PASS | 1 row(s) |
| Galaxy S24 | B | zero console errors | PASS | 0 |
| Galaxy S24 | C | drift.json missing: refused in words | PASS | DRIFT · data/drift.json did not load. The wafer will not invent a head. (data/drift.json HTTP 404) |
| Galaxy S24 | C | drift.json missing: no amber drawn by drift | PASS | marks 0 |
| Galaxy S24 | C | zero console errors | PASS | 0 (the deliberate 404 of data/drift.json excluded: 1) |
| Galaxy S24 | A/C | drift.json missing: green sparks unchanged | PASS | green overlay px at home: no module 6641, drift.json 404 6641 |

RESULT: PASS (32 of 32)
