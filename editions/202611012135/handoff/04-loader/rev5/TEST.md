# TEST: loader rev 5 (optional, not admitted), on exactly these bytes

Opus team 4 lead, 2 Nov 2026 01:15 UTC. Apache-2.0 (kuiper-belt) for the code; this text CC BY 4.0.

Bytes under test: `rev5/modules/202611020103-loader.js` (sha256 `db3a00e6…3e22`, 16,351 bytes) and
`rev5/index.html.delta.patch` (`562d176a…f16c`) applied to the committed page `418ae14ca39bc92b…`
(kuiper-belt@93a5ae9); the patched page is sha256 `0de622becba408e9…`, and its block between the marker lines is byte-identical to the
reference (`diff`, empty). `patch -p1 --dry-run` is clean on the committed page.

Harness: `/tmp/nl010-opus/team-4/lead/leadtest5.cjs` (the lead's test.cjs draft, cases 1-11 of step 4), served from
127.0.0.1:8440, Playwright Chromium + SwiftShader, devices['Pixel 7'] and devices['Galaxy S24'], real touch for READOUT.
Report: `/tmp/nl010-opus/team-4/lead/report-rev5-202611020103.json`.

| case | Pixel 7 | Galaxy S24 |
|---|---|---|
| 1 all admitted in order, sha256 = manifest, 3 readout lines, ring drawn | PASS | PASS |
| 2 one byte changed → sha256 mismatch, rest admitted, alert in viewport, wafer drawn | PASS | PASS |
| 3 missing hook noSuchHook; dependant refused | PASS | PASS |
| 4 stamp mismatch in words; no-digit name admitted | PASS | PASS |
| 5 install threw test | PASS | PASS |
| 6 HTTP 404 | PASS | PASS |
| 7 empty manifest, KY frozen, 28 hooks, KY.names 36 incl. refuse and nav, KY.refuse, atHome setter | PASS | PASS |
| 7b wafer.tsv 404: engine words in the strip, wafer module rejected in words | PASS | PASS |
| 7c wafer.tsv held 12 s: modules admitted first | PASS | PASS |
| 8 tools/edition_check.py (team 9's, committed) on an integrated copy: E1-E8 PASS, E9 NOT EVALUATED (no data/drift.json); exit 1 on each of 7 mutations | PASS | |
| 9 nav → last admitted / Σ bytes / Σ budget | 9,656 ms (load 933) / 2,401 / 12,288 | 3,659 ms (load 798) / 2,401 / 12,288 |
| 10 the admitted rev-2 kuiper-shell, then KY.panels.add('wafer') lands in its WAFER panel | PASS | PASS |
| 11 KY.nav: another owner's self back keeps the card; a person's back calls only the top owner; second back closes the card; 'edition' reserved | PASS | PASS |

pageerror 0 in every case; console errors 0 except the browser's own 404 line in cases 6 and 7b.

Also: the tester's test.cjs (93 checks + c11) on the earlier rev-5 bytes (`index.html.rev5-on-live.patch` `ffdac169…`,
identical to this delta except the one comment line naming the reference file): 94/94 PASS on Pixel 7 and 94/94 PASS on
Galaxy S24 (/tmp/nl010-opus/team-4/tester/out/full-rev5b/report.json, finished 01:13 UTC). The tester's builder cases
c0, c10a-f on those bytes: 16/16 PASS on each device (/tmp/nl010-opus/team-4/lead/tout5/report.json).

Not tested: the shell using KY.nav (the shell's rev 2 does not call it); a real phone.
