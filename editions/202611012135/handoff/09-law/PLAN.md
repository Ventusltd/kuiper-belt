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
