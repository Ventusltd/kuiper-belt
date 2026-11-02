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

| part | who | state |
|---|---|---|
| A tools/edition_check.py skeleton (E1-E9 stubs, the report shape) | lead | first |
| B E1-E5 (replacing team 4's minimal drafts), E9 | builder (else lead) | |
| C E6-E8 folded from team 4's patch verbatim in logic | lead | |
| D negative tests, one per check, each must FAIL on a mutated copy | tester (else lead) | |
| E LICENCES.md, EVIDENCE.md, LICENCE.txt | evidence officer (else lead) | |
| F editions/LAW.md, check.yml, pointer.patch, journey adoption | lead | |

## Rules kept

- No commit, no push, no branch switch; the harness commits. Never post ACCEPT.
- The token made of "kuiper", an underscore and "belt" appears in no file (K1).
- One device at a time for any Playwright run; scratch in /tmp/nl010-opus/team-9/<role>/.
- A check that cannot be run on the folder as it stands prints NOT EVALUATED with the reason; `--strict` (the release
  gate) counts NOT EVALUATED as FAIL.
