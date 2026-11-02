# PLAN.md: Opus team 9, step 9 "the release law and the licence register"

Lead OPUS-9 (started 2026-11-02 00:05 UTC). Builder, tester, evidence officer: slots free at start; if a slot has not
appeared by 00:30 UTC the lead does that part. Channel: issue #10. Governing text: ROADMAP.md step 9;
team-5/STEPS.md step 9; this edition's handoff/04-loader/edition_check.py.patch (E6-E8).

## Files this team may touch (and nothing else)

- `tools/edition_check.py` (E1-E9) and its negative tests `handoff/09-law/test_edition_check.py`
- `editions/LAW.md` (the law, 9.1-9.8, delivered with PR B so the owner merges it)
- `editions/202611012135/LICENCES.md` (the register, every row re-verified from files at the heads)
- `.github/workflows/check.yml` (one `run:` line for edition_check beside ci_check)
- `handoff/09-law/` (this folder): PLAN.md, EVIDENCE.md, LICENCE.txt, REQUESTS.md, TEST.md, MODULE.sha256,
  pointer.patch (editions/index.html forwarding location.search + location.hash; the harness applies it when it
  moves the pointer), android-journey.cjs (the gate, adopted from FIXES/NL-009/android-journey.cjs, writing
  proof/android-journey.json)

## Parts

| part | who | state (00:30 UTC) |
|---|---|---|
| A tools/edition_check.py, E1-E9 complete (E1-E5 and E9 new; E6-E8 team 4's logic unchanged) | lead | done 00:15; changes to it go through the lead |
| B negative tests on a SYNTHETIC repository (runs on a GitHub runner): `test_edition_check.py` | builder (arrived ~00:22) | builder owns this file |
| C negative tests on a copy of the REAL repository (estate clones, real drift re-run): `test_real_folder.py` | lead | the lead's; was test_edition_check.py until 00:24 |
| D run B and C, run the journey (`android-journey.cjs --law`) one device at a time, write TEST.md | tester (arrived ~00:21) | |
| E LICENCES.md, EVIDENCE.md, LICENCE.txt (keys re-read by /tmp/nl010-opus/team-9/evidence/verify_keys.py) | lead (no evidence officer by 00:30) | |
| F editions/LAW.md, check.yml, pointer.patch, the journey's law layer | lead | pointer.patch and journey done 00:22 |

## Rules kept

- No commit, no push, no branch switch; the harness commits. Never post ACCEPT.
- The token made of "kuiper", an underscore and "belt" appears in no file (K1).
- One device at a time for any Playwright run; scratch in /tmp/nl010-opus/team-9/<role>/.
- A check that cannot be run on the folder as it stands prints NOT EVALUATED with the reason; `--strict` (the release
  gate) counts NOT EVALUATED as FAIL.

## Builder (OPUS-9 builder), 00:37 UTC

- B is done. `test_edition_check.py` (35,654 bytes, sha256 `33f98f86…4203`) has 62 synthetic tests plus 5 more with `--real`: 67 run, all OK
  (`python3 editions/202611012135/handoff/09-law/test_edition_check.py [--real]`, about 2.5 min synthetic and 4 min with `--real` on this
  loaded machine; it uses only the stdlib, node and no estate, so it can run on a GitHub runner). The untouched fixture
  gives E1-E9 PASS, also under --strict. Each case breaks one thing and asserts the exact set of failing checks, the words
  in the FAIL line, `RESULT: FAIL` and exit 1. Breaks covered: E1 module, older page and reference syntax. E2 sha256 mismatch,
  bytes, missing file, path outside modules/, stray file, order without record, duplicate id, schema or edition, unreadable
  manifest, pending (NOT EVALUATED, strict FAIL). E3 earlier folder edited, file not listed, listed file missing, bad
  line, no proof (strict FAIL, --pre-cut allows only that). E4 disagree, fourth stamp, place missing, /belt/, folder
  without proof or absent, Edition 5 forwarding hash only or nothing, plus an Edition 4 control. E5 silent change, one byte,
  missing, plus a README control. E6 generation or file name, header stamp, no header, header names another module, missing
  hook, order, licence, non-12-digit generation, reference sha, reference block, page without a hook table. E7 writes,
  reads, fetch outside reads, plus a control. E8 register twice or never. E9 hand-edited, clones moved, trailing byte, tool
  missing, tool crash, unreadable file, clone missing (NOT EVALUATED, strict FAIL).
- Tool behaviour seen, no change asked: a record whose path escapes modules/ to an EXISTING file is refused by E2, and E6-E8
  still read that file and fail on it. The verdict is FAIL either way.
- `--real` baseline on a copy of the live folder at 00:35: E3 FAIL (the newest folder's proof/edition-sha256.txt was cut and
  NOTICE.md, README.md, data/apps.json, data/elements.json and the shell module have changed since), E6 FAIL (the loader
  reference's sha256 and hook-table block). The integration is still moving.
- Review of the journey's `lawRecord` (android-journey.cjs, the lead's file; I have not edited it):
  1. `gate` is PASS when no non-MINOR step FAILs, even when steps are NOT EVALUATED. LAW 9.4 (team-5/STEPS.md 9.4) says "The
     gate is PASS only when every non-MINOR step is PASS". As written, the record can show `gate: PASS` with (n) NOT
     EVALUATED. Suggestion: `gate = blocking.length ? 'FAIL' : (non-MINOR NOT EVALUATED ? 'NOT EVALUATED' : 'PASS')`.
  2. (b) reads Playwright's 'Pixel 7' as 393 px, but `devices['Pixel 7'].viewport` is 412x839 (Galaxy S24 is 360x780). The 393 px
     width is measured only by `--law` LAW_WIDTHS (k).
  3. The record is built in one process only. Team 10 runs one device per process (JOURNEY.md), so (b) and (i) stay
     NOT EVALUATED unless `--all` runs in one process. A merge mode (`--merge a/report.json b/report.json --proof FILE`,
     building `lawRecord` from the saved reports) would close this. The builder can write it if the lead wants it in this file.
