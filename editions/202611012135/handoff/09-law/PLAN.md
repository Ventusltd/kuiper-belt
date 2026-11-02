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

## Evidence officer (arrived 00:36 UTC)

OPUS-9 evidence officer owns EVIDENCE.md from 00:36 (the lead's measured sections kept in it under his name). At 00:50:
EVIDENCE.md section 8 checks LAW.md against ROADMAP step 9 sentence by sentence: PASS with corrections C1-C11 for the
lead (C1 the eight steps, C2 "by an owner login", C3 "publishes a missing hook", C8 (m) against R7/Q7 are words of the
roadmap; the rest are one-line key or fact fixes). Section 10 lists LICENCES.md fixes (team 7's row sha stale; no section
A row for elements.json line_text quotations; team 9's own row has no sha). The evidence officer reviews HANDOFF.md
before it is posted and writes the verdict in EVIDENCE.md section 11.

## Lead's answer to the builder's review of the journey proof writer (00:53 UTC)

All three points accepted; the lead made the changes in `android-journey.cjs` (sha256 in MODULE.sha256), so the builder
need not write (3). (1) gate = PASS only when every non-MINOR step was measured and passed; FAIL when one failed;
otherwise NOT EVALUATED, never PASS. Consequence, stated plainly: (i) font scale 1.3 and (n) READOUT after a pick are
not measurable by this script today, so the gate reads NOT EVALUATED at best, and the preview goes to the owner with
that list (LAW.md 9.4). (2) (b) is now read from the --law pass at 360 and 393 px (bar one row, lockup at the top);
Playwright's Pixel 7 is 412x839, Galaxy S24 360x780 (measured from require('playwright').devices). (3)
`node android-journey.cjs --merge <proof.json> <report.json>...` combines per-device reports and one --law pass; tested
on synthetic reports in /tmp/nl010-opus/team-9/lead/merge/: all green -> NOT EVALUATED (i, n); one red -> FAIL (a); a
device twice -> refused, exit 2. The tester's running Pixel 7 process uses the earlier copy (journey-run1.cjs); its
report.json can be merged with the new script.

## Lead, 01:47 UTC: corrections made, HANDOFF posted

The evidence officer's C1-C3, C5-C11 are made in LAW.md (C8: the shell's 434 px rule; C11: PR B carries everything
outside the folder); the overnight delegation is recorded in 9.6 as a record. LICENCES.md: the elements.json quotations
row added (221 counted), section C re-cut last with every team's sha256 (team 7 `635ca9d37044`, team 9 `e3f6988e3b0e`,
team 12 added). `--pre-cut` now reads a draft sha256 list as not cut (harness ruling 2). test_real_folder.py runs on the
estate of record (pipelinenews left out as recorded absent): 20 of 20. ci_check PASS. HANDOFF.md posted:
issuecomment-6567128344. Evidence officer: please review it in EVIDENCE.md section 11.
