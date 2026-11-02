# TEST.md — Opus team 8, step 8 the drift (P1-P5: drift_test.py and P4 on Android)

**Tester's verdict (OPUS-8 tester, 00:46 UTC): REFUSED.** 47 of 49. drift_test.py 14 of 14 PASS (P1, P2, P3, P4 data, P5). On the page both devices fail one step only: the LINES filter. The shell is withdrawn from the served modules.json (HARNESS 00:18Z), so `#ky-drift` lands in a page panel that no control opens, and a finger cannot reach its "moved" chip because `#linesctl` covers it. A two-line fix (put the section inside `#lines` before `#lineslist` when the shell has no WAFER panel) was measured in scratch only: Pixel 7 17 of 17 (issue #10 comment 6566200296). The module is the lead's file, so it is unchanged. Re-run with `node test.cjs <url> <out> --device "Pixel 7" --handoff`, then the same with `--device "Galaxy S24"`.

Written by `handoff/08-drift/test.cjs` (OPUS-8 tester). P1 determinism, P2 refusal, P3 ground truth by `git show`, the data half of P4 and P5 are `drift_test.py` (device `python`, independent of `tools/drift.py --check`); P4 on the page is Playwright with real touch on Pixel 7 and Galaxy S24, scenario A no drift module, B drift admitted, C drift admitted and data/drift.json answering 404.

tools/drift.py sha256 `29fdb05e5717aee41a5b0ed149b715bf4d997cdbee045bef90da9dd7a6b6080e`; keys.json sha256 `1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b`.

Run 2026-11-02T00:33:11.071Z · http://127.0.0.1:8482/editions/202611012135/ · **pre-integration** (modules.json routed: served records re-hashed from disk + line-card + drift)
Module `modules/202611012325-drift.js` sha256 `18f7019aad915920e79c1f279ad688f3ccd4f1dd96ff23a992520c19b37fdd8d` (22294 bytes); data/drift.json sha256 `388103129b904a4a038d18adc26b703c144dede2d09497d13fe6223b30b5d103`.

| device | scenario | step | result | measured |
|---|---|---|---|---|
| Pixel 7 | A | baseline wafer | PASS | 7060 green overlay px, no drift module; bar #bar (the page, no shell admitted) 3 row(s): KUIPER EDITION 5\|edition\|readout\|lines\|commands |
| Pixel 7 | A | zero console errors | PASS | 0 |
| Pixel 7 | B | admitted | PASS | status OK registry own (no layer registry admitted) marks 35 |
| Pixel 7 | B | readout five counts = drift.json | PASS | DRIFT since the cut 202611012135 · 309 SAME · 7 MOVED · 2 GONE · 0 FILE_GONE · 28 UNVERIFIED · 309 SAME / 318 (rows 346 - UNVERIFIED 28) · page {"SAME":309,"MOVED":7,"GONE":2,"FILE_GONE":0,"UNVERIFIED":28} · drift.json {"SAME":309,"MOVED":7,"GONE":2,"FILE_GONE":0,"UNVERIFIED":28} |
| Pixel 7 | B | bar unchanged by drift | PASS | with drift {"bar":"#bar (the page, no shell admitted)","shell":false,"titles":["KUIPER EDITION 5","edition","readout","lines","commands"],"rows":3,"h":75,"sw":412,"cw":412} · without (A) {"titles":["KUIPER EDITION 5","edition","readout","lines","commands"],"rows":3} |
| Pixel 7 | B | every MOVED spark amber and visible | PASS | 7 of 7 on-screen MOVED sparks amber (>=4 px in 9x9) with a canvas on top; 0 off-screen; data-grid-gb 195,615 #c 68px; data-grid-gb 200,615 #c 51px; data-grid-gb 260,308 #c 37px; data-grid-gb 361,488 #c 42px; data-grid-gb 364,449 #c 42px; gridatlas 354,513 #c 40px; gridatlas 75,369 #c 44px |
| Pixel 7 | B | MOVED placed at a new key | PASS | 7 of 7 MOVED at their new keys;  |
| Pixel 7 | B | card names head and new line | PASS | "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Pixel 7 | B | MOVED spark amber | PASS | at (206.0, 419.5): 46 amber px in a 9x9 box |
| Pixel 7 | B | tap within 9 px opens its card | PASS | tap at +6,+6 (8.5 px): taps 0→1, "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Pixel 7 | B | filter "moved" lists exactly the MOVED rows | FAIL | opened by a tap on "lines"; chip 44 px tall, COVERED by linesctl, in ky-drift; listed 309 rows, drift.json MOVED 7 |
| Pixel 7 | B | bar unchanged with the panel open | PASS | #bar (the page, no shell admitted) 3 row(s) |
| Pixel 7 | B | zero console errors | PASS | 0 |
| Pixel 7 | C | drift.json missing: refused in words | PASS | DRIFT · data/drift.json did not load. The wafer will not invent a head. (data/drift.json HTTP 404) |
| Pixel 7 | C | drift.json missing: no amber drawn by drift | PASS | marks 0 |
| Pixel 7 | C | zero console errors | PASS | 0 (the deliberate 404 of data/drift.json excluded: 1) |
| Pixel 7 | A/C | drift.json missing: green sparks unchanged | PASS | green overlay px at home: no module 7060, drift.json 404 7060 |
| Galaxy S24 | A | baseline wafer | PASS | 6641 green overlay px, no drift module; bar #bar (the page, no shell admitted) 3 row(s): KUIPER EDITION 5\|edition\|readout\|lines\|commands |
| Galaxy S24 | A | zero console errors | PASS | 0 |
| Galaxy S24 | B | admitted | PASS | status OK registry own (no layer registry admitted) marks 35 |
| Galaxy S24 | B | readout five counts = drift.json | PASS | DRIFT since the cut 202611012135 · 309 SAME · 7 MOVED · 2 GONE · 0 FILE_GONE · 28 UNVERIFIED · 309 SAME / 318 (rows 346 - UNVERIFIED 28) · page {"SAME":309,"MOVED":7,"GONE":2,"FILE_GONE":0,"UNVERIFIED":28} · drift.json {"SAME":309,"MOVED":7,"GONE":2,"FILE_GONE":0,"UNVERIFIED":28} |
| Galaxy S24 | B | bar unchanged by drift | PASS | with drift {"bar":"#bar (the page, no shell admitted)","shell":false,"titles":["KUIPER EDITION 5","edition","readout","lines","commands"],"rows":3,"h":75,"sw":360,"cw":360} · without (A) {"titles":["KUIPER EDITION 5","edition","readout","lines","commands"],"rows":3} |
| Galaxy S24 | B | every MOVED spark amber and visible | PASS | 7 of 7 on-screen MOVED sparks amber (>=4 px in 9x9) with a canvas on top; 0 off-screen; data-grid-gb 170,565 #c 65px; data-grid-gb 174,565 #c 58px; data-grid-gb 227,298 #c 38px; data-grid-gb 315,455 #c 43px; data-grid-gb 317,421 #c 41px; gridatlas 308,477 #c 36px; gridatlas 66,351 #c 44px |
| Galaxy S24 | B | MOVED placed at a new key | PASS | 7 of 7 MOVED at their new keys;  |
| Galaxy S24 | B | card names head and new line | PASS | "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Galaxy S24 | B | MOVED spark amber | PASS | at (180.0, 390.0): 48 amber px in a 9x9 box |
| Galaxy S24 | B | tap within 9 px opens its card | PASS | tap at +6,+6 (8.5 px): taps 0→1, "at head 01a4491: MOVED to line 128 (+6)\ndata-grid-gb@01a4491 datacentres/lanes/dc-a7-merge/dcmerge.py:128 · key 63,134,296,269 · head observed 2026-10-31T23:26:49+00:00" |
| Galaxy S24 | B | filter "moved" lists exactly the MOVED rows | FAIL | opened by a tap on "lines"; chip 44 px tall, COVERED by linesctl, in ky-drift; listed 309 rows, drift.json MOVED 7 |
| Galaxy S24 | B | bar unchanged with the panel open | PASS | #bar (the page, no shell admitted) 3 row(s) |
| Galaxy S24 | B | zero console errors | PASS | 0 |
| Galaxy S24 | C | drift.json missing: refused in words | PASS | DRIFT · data/drift.json did not load. The wafer will not invent a head. (data/drift.json HTTP 404) |
| Galaxy S24 | C | drift.json missing: no amber drawn by drift | PASS | marks 0 |
| Galaxy S24 | C | zero console errors | PASS | 0 (the deliberate 404 of data/drift.json excluded: 1) |
| Galaxy S24 | A/C | drift.json missing: green sparks unchanged | PASS | green overlay px at home: no module 6641, drift.json 404 6641 |
| python | P1 | P1 two runs byte-identical | PASS | PYTHONHASHSEED 1 / 4242: exit 0 / 0, 118553 / 118553 bytes, sha256 388103129b904a4a / 388103129b904a4a |
| python | P1 | P1 re-run equals data/drift.json | PASS | data/drift.json 118553 bytes sha256 388103129b904a4a038d18adc26b703c144dede2d09497d13fe6223b30b5d103; re-run identical |
| python | P2 | P2a no clone -> UNVERIFIED | PASS | repositories of keys.json without a clone in /home/user/estate: ['pipelinenews']; their 22 rows all UNVERIFIED, head null |
| python | P2 | P2b clone gridatlas removed | PASS | exit 0; its 121 rows UNVERIFIED: True; other rows unchanged: True; denominator 318 -> 197 (drop 121 expected); printed "REFUSED: no clone of gridatlas in the estate; 121 lines UNVERIFIED" |
| python | P2 | P2b clone data-grid-gb removed | PASS | exit 0; its 35 rows UNVERIFIED: True; other rows unchanged: True; denominator 318 -> 283 (drop 35 expected); printed "REFUSED: no clone of data-grid-gb in the estate; 35 lines UNVERIFIED" |
| python | P2 | P2c heads emptied {"heads": {}} | PASS | exit 2, file written: False; "['REFUSED: no heads recorded in /tmp/nl010-opus/team-8/tester/out1/py-scratch/drift-test-ayxo_8d8/empty-heads.json; drift.json not written']" |
| python | P2 | P2c heads emptied {} | PASS | exit 2, file written: False; "['REFUSED: no heads recorded in /tmp/nl010-opus/team-8/tester/out1/py-scratch/drift-test-ayxo_8d8/empty-heads.json; drift.json not written']" |
| python | P3 | P3 ground truth by git show | PASS | {'SAME': 309, 'UNVERIFIED': 28, 'MOVED': 7, 'GONE': 2} re-derived from 192 `git show` blobs at the recorded heads (each held by its clone and an ancestor of its origin/HEAD); 0 disagreements |
| python | P4 | P4 summary = rows | PASS | 309 SAME / 7 MOVED / 2 GONE / 0 FILE_GONE / 28 UNVERIFIED; 309 SAME / 318 (rows 346 - UNVERIFIED 28) |
| python | P4 | P4 README paragraph = drift.json | PASS | "309 SAME, 7 MOVED, 2 GONE, 0 FILE_GONE, 28 UNVERIFIED" present; "309 SAME / 318 (rows 346 − UNVERIFIED 28)" present |
| python | P5 | P5 drift.json inside the law | PASS | 346 rows = 346 bodies in keys.json order: True; repositories outside repos.tsv: none (matched by case only: ['kuiper-belt']); keys outside keys.json: none; line texts quoted: 0 |
| python | P5 | P5 reads (observe, strace) | PASS | exit 0; opened under /home/user: 45 files = repos.tsv, keys.json, tools/drift.py + 21 clones; directories listed: ['/home/user/estate', '/home/user/estate/kuiper-belt/tools']; outside /home/user only system dirs ['dev', 'etc', 'proc', 'root', 'tmp', 'usr']; sockets: 0; stray: none |
| python | P5 | P5 reads (--heads, strace) | PASS | exit 0; opened under /home/user: 25 files = repos.tsv, keys.json, tools/drift.py, data/drift.json (the recorded heads) + 21 clones; directories listed: ['/home/user/estate', '/home/user/estate/kuiper-belt/tools']; outside /home/user only system dirs ['dev', 'etc', 'proc', 'root', 'tmp', 'usr']; sock |
| python | P5 | P5 minimal root, same bytes | PASS | root = repos.tsv + keys.json + tools/drift.py only (/tmp/nl010-opus/team-8/tester/out1/py-scratch/drift-test-ayxo_8d8/mini-root): exit 0, 118553 bytes, identical to data/drift.json |
| files | - | img/ at most 4 PNG, each < 300 KB | PASS | 1-moved-card-Pixel_7.png 39 KB, 2-filter-moved-Galaxy_S24.png 71 KB, 3-drift-missing-Galaxy_S24.png 96 KB, 4-moved-sparks-Pixel_7.png 120 KB |

RESULT: FAIL (47 of 49)

Measured, not pass/fail (drift_test.py):

- heads moved since drift.json was written (fetched later; the drift is as of its recorded heads): globalgrid2050 35b5be2fa446 -> 0b3369d066c3; kuiper-belt 018b46aed50f -> e92ad5dde7cc
- observing the heads now instead of the recorded ones: differs; counts now 309 SAME / 7 MOVED / 2 GONE / 0 FILE_GONE / 28 UNVERIFIED; rows whose class would change: 0 []
