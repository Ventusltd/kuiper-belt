# TEST.md: Opus team 9 tester, step 9 "the release law and the licence register"

Tester OPUS-9 (arrived 00:21 UTC). The test of this step is `tools/edition_check.py` itself: E1-E9 on the edition folder
as it is assembled, a negative test per check that FAILs on a tampered scratch copy, `tools/ci_check.py` staying
`RESULT: PASS`, and the law's Android journey (`handoff/09-law/android-journey.cjs`) on Pixel 7 writing
`proof/android-journey.json`. Scratch: /tmp/nl010-opus/team-9/tester/ (never inside the repositories). Port 8492.
One device at a time; load average 48-72 on 4 cores throughout.

## Verdict: HAND-OFF REFUSED (01:04 UTC)

Refused until every line below reads PASS. Open, each named with its owner:

| # | what | measured | owner |
|---|---|---|---|
| 1 | `tools/ci_check.py` | `RESULT: FAIL` since ~00:48: `FAIL K1: editions/202611012135/handoff/12-see-through-reader/EVIDENCE.md` (731 tracked files, 1 match a private digest). PASS at 00:20 (705 files) | OPUS-12; FINDING issuecomment-6566545614 |
| 2 | E9 on the real folder | `E9 FAIL … re-computed 1640823a7173 (118553 vs 118433 bytes)` since /home/user/estate/pipelinenews was cloned at 00:56; `cmp`-identical with an estate lacking that clone. `tools/drift.py --heads` replays a recorded absent head by today's estate (drift.py:246-255) | OPUS-8; FINDING issuecomment-6566567480 |
| 3 | E3 on the real folder | `proof/edition-sha256.txt` is a draft (26 rows, cut 00:55:43): stale for modules.json, loader, file.js…, lists no `handoff/` file | OPUS-10 (cut last; team 9 REQUESTS.md 2) |
| 4 | E2 strict | 5 files in modules/ pending admission (layers, see-through, file, apps, drift): NOT EVALUATED, FAIL under `--strict` | OPUS-10 admissions |
| 5 | the journey's law gate | `LAW GATE: FAIL (failed: a, b, d, k, l, m)` on the folder at 00:31 (shell not yet admitted: bar two rows, no SEE THROUGH control) | OPUS-1 shell admission, OPUS-10 |

## Runs

| run | when (UTC) | tool / script sha256 (first 12) | result |
|---|---|---|---|
| `edition_check.py editions/202611012135` (real) | 00:20 | `13d1da026345` | E1-E5 PASS, E6 FAIL (loader reference `d9272b82421d` vs manifest `25a16f1d3c3f`, hook-table block differs), E7-E9 PASS; E2/E3 NOT EVALUATED; RESULT FAIL |
| same | 00:55 | same | E3 FAIL (draft proof), E6 FAIL; others PASS |
| same | 00:59 | same | E1, E2, E4-E8 PASS (E6 PASS: reference restored to `25a16f1d3c3f`, shell admitted, 3 records); E3 FAIL; **E9 FAIL** (row 2 above); RESULT FAIL |
| `ci_check.py` | 00:20 | — | K1-K4 agree, RESULT: PASS |
| `ci_check.py` | 00:55, 00:58 | — | **RESULT: FAIL** (row 1 above) |
| `test_real_folder.py` (lead's; copy of the real repository, real drift re-run) | 00:30-00:33 | `a1e0d98f713e` | **20 of 20 as written, RESULT: PASS** (3 min 25 s) |
| `test_edition_check.py` (builder's; synthetic repository) | 00:26 | earlier draft | 4 failures (over-strict "no other check changes" sets); reported by run, fixed by the builder |
| `test_edition_check.py` | 00:37 | `33f98f862d75` | **Ran 67 tests, OK (skipped=5 --real)** |
| `test_edition_check.py --real` | 00:41 | same | **Ran 67 tests, OK** (incl. 4 mutations of a copy of the real Edition 5 folder) |
| page refusals (`page_negative.cjs`, Pixel 7) | 00:52-00:55 | scratch | real copy: hello, line-card admitted, 0 refused, 0 console errors; one byte of hello.js: `MODULES · hello refused: sha256 mismatch`; `requires` + `noSuchHook`: `MODULES · hello refused: missing hook noSuchHook`; both with line-card still admitted and 0 console errors |
| `android-journey.cjs --law --proof` on Pixel 7 | 00:31-00:54 (23 min) | `6f6627550649` | 16 PASS, 2 FAIL (`load`: bar two rows; `see-through`: no control in #bar), 0 console errors; LAW GATE FAIL (a, b, d, k, l, m); 11 NOT EVALUATED |

## Per check: real folder, and the negative tests that must FAIL

Negative cases: L = `test_real_folder.py` (copy of the real repository), S = `test_edition_check.py` (synthetic), P = the
page on a served scratch copy. Each case below FAILed its check, with the named words, exit 1, at the runs above.

| check | real folder (00:59) | negative tests (each FAILs on one change) |
|---|---|---|
| E1 node --check, every page and module | PASS: 4 script blocks in 4 editions/*/index.html, 9 modules/*.js | L: `const = ;` in the page → `SyntaxError: Unexpected token '='`. S: module syntax error; an OLDER edition's page script; an unreferenced .js in modules/; control: a JSON script block is not parsed |
| E2 manifest exists, hashes, no stray | PASS with 5 pending (NOT EVALUATED) | L: one byte appended → `hello refused: sha256 mismatch`; stray file → `stray file`; `order` ghost → `no record`; strict + pending → FAIL. S: same-length byte change, bytes disagree, file missing, path outside modules/, duplicate id, wrong schema/edition, unreadable manifest. P: page prints `hello refused: sha256 mismatch` |
| E3 proof/edition-sha256.txt | FAIL (draft cut, row 3); the four earlier folders 51/9/10/8 rows all match | L: an earlier edition's README edited → `sha256 … listed …`; a file added after the cut → `not in proof/edition-sha256.txt`. S: listed file missing, unreadable line, no proof (NOT EVALUATED; `--strict` FAIL; `--pre-cut` allows only that) |
| E4 pointer in three places | PASS: 202611012027, forwards hash (pre-Edition-5 folder) | L: stamps disagree; a fourth stamp → `not 3`; moved to Edition 5 forwarding hash only → `location.search + location.hash`; positive: `pointer.patch` applied and moved → E4 PASS. S: a place missing, /belt/, folder without proof, folder absent, no pointer, forwarding nothing |
| E5 keys.json unchanged unless said | PASS: byte-identical to 202611012027 (`1c293c33…`) | L: keys.json changed, README silent → `names no change`. S: one byte appended, keys.json missing; control: change named in README passes |
| E6 stamp = name = header = manifest | PASS (3 records, 35 hooks) | L: generation ≠ file name → `stamp mismatch`; `requires noSuchHook` → `refused: missing hook noSuchHook`; no licence. S: generation not 12 digits, header missing / other name / other stamp, page lost hook table, reference block differs, reference sha256 differs, requires a module later in order. P: page prints `hello refused: missing hook noSuchHook` |
| E7 reads/writes literal | PASS (3 modules) | L: writes `#no-such-node-anywhere` → `no literal`; `fetch('data/secret.json')` → `not in reads`. S: reads without literal; control fetch inside reads |
| E8 parse, register once | PASS (3 modules) | L: `KY.register(` twice → `appears 2 times`. S: never registers |
| E9 drift re-computed | **FAIL** (row 2); PASS at 00:20 | L: `cap_seconds` edited → `re-computed`. S: one trailing byte, tool missing/crashes, unreadable, clone missing (NOT EVALUATED; strict FAIL), clones moved since |

## Notes for the lead and builder (no edit made to your files)

- The builder's suite writes its temporary repositories to the system temp directory (`/tmp/edition-check-case-*`)
  unless TMPDIR is set; the brief puts scratch in /tmp/nl010-opus/team-9/<role>/. It also leaves 10 ResourceWarnings
  (unclosed files). Neither changes a verdict.
- `test_real_folder.py`'s clean fixture drops `references` and strips pending modules, so it proves the checks, not
  the real folder; the real folder's verdict is the run of the tool on it (table above).
- The journey's law step (b) needs both 360 px (Galaxy S24) and 393 px (Pixel 7): a Pixel-7-only run writes (b) FAIL
  by construction ("only Pixel 7 ran"). The final gate run will be `--devices "Pixel 7,Galaxy S24"`, one at a time.

## proof/android-journey.json

Not written into the edition yet: the folder is still being assembled (5 modules pending) and the gate reads FAIL.
The run's record is at /tmp/nl010-opus/team-9/tester/journey1/android-journey.json. It is written to
`editions/202611012135/proof/android-journey.json` from the run on the assembled folder, with the script's sha256.
