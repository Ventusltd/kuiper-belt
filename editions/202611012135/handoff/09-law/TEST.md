# TEST.md: Opus team 9 tester, step 9 "the release law and the licence register"

Tester OPUS-9 (arrived 00:21 UTC). The test of this step is `tools/edition_check.py` itself: E1-E9 on the edition folder
as it is assembled, a negative test per check that FAILs on a tampered scratch copy, `tools/ci_check.py` staying
`RESULT: PASS`, and the law's Android journey (`handoff/09-law/android-journey.cjs`) on Pixel 7 writing
`proof/android-journey.json`. Scratch: /tmp/nl010-opus/team-9/tester/ (never inside the repositories). Port 8492.
One device at a time; load average 48-72 on 4 cores throughout.

## Verdict: HAND-OFF REFUSED (02:52 UTC): the tool PASSES its tests; the folder does not yet pass E1-E9 under --strict

What passes (the tool itself): every negative test FAILs its check on a tampered scratch copy and the clean copy
PASSes `--strict` (test_real_folder.py 20/20; test_edition_check.py 67/67 incl. `--real`; the tester's 4 `--pre-cut`
draft cases; the page refusals). `tools/ci_check.py` reads `RESULT: PASS` (01:51, 01:55, 02:51).
The branch folder (`edition_check.py editions/202611012135 --strict --pre-cut`, 01:55 and 02:51, tool `01a9e5d429ef`): E1, E4-E9
PASS (E9 PASS again: the harness moved the pipelinenews clone out of the estate at ~01:53; drift.py unchanged).
What blocks:

| # | what | measured | owner |
|---|---|---|---|
| 1 | E2 under `--strict` (branch) | 10 files in modules/ pending admission at 02:51 (7 at 01:55; Edition 6 revisions now land in this folder's modules/) (in no `modules.json` record): NOT EVALUATED = FAIL under `--strict`; admitted: hello, line-card | OPUS-10 / controller (admit or remove before the folder is final) |
| 2 | E3 final (branch) | Edition 5's `proof/edition-sha256.txt` not cut (allowed by `--pre-cut` only; the final run is `--strict` without it, handoff/ included, ruling 6566796733) | OPUS-10 |
| 3 | the journey's law gate | no run has measured a gate-PASS state: the shell (needed for (b) (k) (l) (m)) is withdrawn. Run 3 on main's shipped tree, both phones: LAW GATE FAIL (a, b, e, k, l, m): `load` (no shell) and **`card-details` red on both phones** (collapsed card already at its cap), which G2 had green (FINDING issuecomment-6567874903) | team 1 shell rev 3, controller |
| 4 | the shipped tree, main a432b43 (`--strict`) | **E4 FAIL** (the pointer names 202611012135, which has no proof/edition-sha256.txt), **E9 FAIL** (only `inputs.repos.tsv.sha256` differs: the engine's b9901d4 moved cosmos/repos.tsv on main after the drift was cut), E2 5 pending, E3 not cut; and main's manifest admits see-through (`4e6b40313d9d…`), not the G2 state the harness names | HARNESS, OPUS-10, OPUS-8; FINDINGs issuecomment-6567215418, -6567232690 |
| 5 | E9 robustness | `tools/drift.py --heads` reads two live inputs: the estate's clone set (drift.py:246-255) and the root's cosmos/repos.tsv. E9 PASSes on the branch only while both stay as recorded | OPUS-8; FINDING issuecomment-6566567480 |
| — | `ci_check.py` | PASS since 01:13; FAIL 00:48-01:02 on team 12's EVIDENCE.md (FINDING issuecomment-6566545614, fixed by team 12) | closed |

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
| `ci_check.py` | 01:13, 01:51 | — | RESULT: PASS (K1 737 then 743 files, 0 match) |
| `edition_check.py` (real) | 01:13 | `13d1da026345` | E3 NOT EVALUATED (draft removed), E6 PASS, E9 FAIL; RESULT FAIL |
| `edition_check.py --strict --pre-cut` (real) | 01:51 | `01a9e5d429ef` (pre-cut reads a draft as NOT EVALUATED, harness ruling 6566796733) | E1, E4-E8 PASS; E2, E3 NOT EVALUATED; **E9 FAIL**; RESULT FAIL |
| `android-journey.cjs --law --proof` on Pixel 7, run 2 | 01:02-01:38 (36 min) | `f156bbbd1493` | order hello, kuiper-shell, line-card at start: **18 of 18 journey steps PASS** (load: bar one row; see-through: same-tab → `../../see-through/202611020012/`), 0 console errors on the edition (2 after leaving it, not counted). Law layer FAIL (b, k, l, m): at 360 px the shell's bar (one row, 6 titles, hit 44 px, lockup in the bar, See Through strip bottom-left); at 393/412/430 px Edition 4's bar (2 rows, hit 30 px, no see through): consistent with the shell's withdrawal during the law layer (modules.json back to `be99c8a1…`, order hello, line-card, between 01:37:18 and 01:38:18; the law files were written 01:38:11-15); each width is a fresh context. Not a measurement of an assembled folder; not written to proof/ |
| `test_edition_check.py --real` | 01:45 | `33f98f862d75` vs tool `01a9e5d429ef` | Ran 67 tests, OK |
| `test_real_folder.py` | 01:46 | `75939350c5ed` (estate of record: pipelinenews left out as recorded absent) | 20 of 20 as written, RESULT: PASS |
| tester `precut_cases.py` (scratch) | 01:50 | tool `01a9e5d429ef` | 4/4: stale draft + `--strict` → E3 FAIL `late.json`; + `--pre-cut` → PASS (draft allowed); + an earlier folder edited → E3 FAIL (earlier folders still verified); + a stray module → E2 FAIL (pre-cut excuses E3 only) |
| `edition_check.py --strict --pre-cut` (branch) | 01:55 | `01a9e5d429ef` | E1, E4-E9 PASS (E9 byte-identical, 118,553 bytes, `388103129b90`); E2 7 pending, E3 not cut: RESULT FAIL |
| `edition_check.py --strict` on main a432b43 (`git archive` to scratch) | 01:54 | `01a9e5d429ef` | E1, E5-E8 PASS (3 records: hello, line-card, see-through); E2 5 pending; E3 not cut; **E4 FAIL** proof/edition-sha256.txt missing; **E9 FAIL** re-computed `0b9cf208ddfa` (same 118,553 bytes; `inputs.repos.tsv.sha256` `0aadce5b97…` → `23692e2f07…`); RESULT FAIL. FINDING header stamped 02:00 UTC by mistake; GitHub's time (~01:54) is right |
| `android-journey.cjs --law` Pixel 7, then Galaxy S24, `--merge`, on main a432b43 (`git archive`, served from the root on 8492) | 02:03-02:51 (24 + 23 min) | `f156bbbd1493` | manifest `4e6b40313d9d` (hello, line-card, see-through). Pixel 7 16/18, Galaxy S24 16/18, 0 console errors on the edition. Red: `load` (bar 2 rows, 75.1 px) and `card-details` ("card did not grow": collapsed 285.25 of cap 285.3 px / 265.19 of 265.2 px; card 40 of 344). `see-through` PASS (opens see-through/202610050609/ same tab). LAW GATE FAIL (a, b, e, k, l, m), 11 NOT EVALUATED. Record: handoff/09-law/android-journey.main-a432b43.json |
| `edition_check.py --strict --pre-cut` (branch) | 02:51 | `01a9e5d429ef` | E1, E4-E9 PASS; E2 10 pending; E3 not cut: RESULT FAIL. `ci_check.py`: RESULT PASS |

## Per check: real folder, and the negative tests that must FAIL

Negative cases: L = `test_real_folder.py` (copy of the real repository), S = `test_edition_check.py` (synthetic), P = the
page on a served scratch copy. Each case below FAILed its check, with the named words, exit 1, at the runs above.

| check | branch folder (01:55, `--strict --pre-cut`) | negative tests (each FAILs on one change) |
|---|---|---|
| E1 node --check, every page and module | PASS: 4 script blocks in 4 editions/*/index.html, 9 modules/*.js | L: `const = ;` in the page → `SyntaxError: Unexpected token '='`. S: module syntax error; an OLDER edition's page script; an unreferenced .js in modules/; control: a JSON script block is not parsed |
| E2 manifest exists, hashes, no stray | PASS with 7 pending (NOT EVALUATED; FAIL under `--strict`) | L: one byte appended → `hello refused: sha256 mismatch`; stray file → `stray file`; `order` ghost → `no record`; strict + pending → FAIL. S: same-length byte change, bytes disagree, file missing, path outside modules/, duplicate id, wrong schema/edition, unreadable manifest. P: page prints `hello refused: sha256 mismatch` |
| E3 proof/edition-sha256.txt | the four earlier folders 51/9/10/8 rows all match; Edition 5 not cut (NOT EVALUATED, allowed by `--pre-cut` only) | L: an earlier edition's README edited → `sha256 … listed …`; a file added after the cut → `not in proof/edition-sha256.txt`. S: listed file missing, unreadable line, no proof (NOT EVALUATED; `--strict` FAIL; `--pre-cut` allows only that). Tester: stale draft FAILs without `--pre-cut`; with it, earlier folders still FAIL when edited |
| E4 pointer in three places | PASS: 202611012027, forwards hash (pre-Edition-5 folder) | L: stamps disagree; a fourth stamp → `not 3`; moved to Edition 5 forwarding hash only → `location.search + location.hash`; positive: `pointer.patch` applied and moved → E4 PASS. S: a place missing, /belt/, folder without proof, folder absent, no pointer, forwarding nothing |
| E5 keys.json unchanged unless said | PASS: byte-identical to 202611012027 (`1c293c33…`) | L: keys.json changed, README silent → `names no change`. S: one byte appended, keys.json missing; control: change named in README passes |
| E6 stamp = name = header = manifest | PASS (2 records, 35 hooks, loader reference rev 4 `25a16f1d3c3f` = page block) | L: generation ≠ file name → `stamp mismatch`; `requires noSuchHook` → `refused: missing hook noSuchHook`; no licence. S: generation not 12 digits, header missing / other name / other stamp, page lost hook table, reference block differs, reference sha256 differs, requires a module later in order. P: page prints `hello refused: missing hook noSuchHook` |
| E7 reads/writes literal | PASS (2 modules) | L: writes `#no-such-node-anywhere` → `no literal`; `fetch('data/secret.json')` → `not in reads`. S: reads without literal; control fetch inside reads |
| E8 parse, register once | PASS (2 modules) | L: `KY.register(` twice → `appears 2 times`. S: never registers |
| E9 drift re-computed | PASS (01:55); FAIL 00:59-01:51 while the pipelinenews clone was in the estate; FAIL on main (repos.tsv moved) | L: `cap_seconds` edited → `re-computed`. S: one trailing byte, tool missing/crashes, unreadable, clone missing (NOT EVALUATED; strict FAIL), clones moved since |

## Notes for the lead and builder (no edit made to your files)

- The builder's suite writes its temporary repositories to the system temp directory (`/tmp/edition-check-case-*`)
  unless TMPDIR is set; the brief puts scratch in /tmp/nl010-opus/team-9/<role>/. It also leaves 10 ResourceWarnings
  (unclosed files). Neither changes a verdict.
- `test_real_folder.py`'s clean fixture drops `references` and strips pending modules, so it proves the checks, not
  the real folder; the real folder's verdict is the run of the tool on it (table above).
- The journey's law step (b) needs both 360 px (Galaxy S24) and 393 px (Pixel 7): a Pixel-7-only run writes (b) FAIL
  by construction ("only Pixel 7 ran"). The final gate run will be `--devices "Pixel 7,Galaxy S24"`, one at a time.

## proof/android-journey.json

Not written into `editions/202611012135/proof/`: no run has measured a state of this folder whose gate reads PASS, and the
branch folder's manifest (`be99c8a126ce`, hello, line-card) is not the manifest main serves (`4e6b40313d9d`, + see-through),
so a record of either would misdescribe the other. The law-shaped two-phone record of what the pointer serves now is
`handoff/09-law/android-journey.main-a432b43.json` (gate FAIL). Earlier records: /tmp/nl010-opus/team-9/tester/journey1/
(00:31, hello + line-card, Pixel 7) and journey2/ (01:02, + kuiper-shell, Pixel 7; law layer contaminated by a withdrawal).
`proof/android-journey.json` is written from the `--law` Pixel 7 + Galaxy S24 `--merge` run on the folder as it is cut.

## Timestamps

FINDING issuecomment-6567215418 carried a header stamp of 02:00 UTC; GitHub received it at 01:55:03Z (flagged by the NL-011
live reviewer, 6567275739). GitHub's time is authoritative; later stamps read from `date -u`.
