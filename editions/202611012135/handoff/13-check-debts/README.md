# 13-check-debts: candidate fixes for edition_check E6 and E7 (not admitted)

FABLE-FIN-1, 2026-11-02 10:45Z. A candidate only: nothing here changes a module, a manifest or a shipped
folder, and nothing here is applied to tools/edition_check.py on this branch. The controller or the owner decides.

- `PLAN.md`: the debts with exact file and line references (a copy of neural-link FIXES/NL-010/CHECK-DEBTS.md).
- `edition_check.patch`: a unified diff against tools/edition_check.py at this branch (last changed 6d69972). Two
  changes, tool only: E6 compares the loader reference's hook-table block with the page's after normalising the one
  `const KY_EDITION = '<stamp>';` line and reports both stamps in the PASS text; E7 strips one trailing parenthetical
  annotation from a reads/writes entry before the literal test. Prose with no literal still fails.
- `ec-main-orig.txt`: the unpatched tool on a clean worktree of kuiper-belt main 94aa593 (`--root <worktree>
  --estate /home/user/estate`): E6 FAIL, E7 FAIL, E9 FAIL.
- `ec-main-patched.txt`: the patched tool on the same worktree: E6 PASS; E7 FAIL only on the apps record's two entries
  with no literal (`history entry {kyApps}`, `layers elements, spider`), which the next cut's MODULE.json must correct
  (PLAN.md, E7 Fix B); E9 FAIL unchanged (team 8).

To apply: `git apply editions/202611012135/handoff/13-check-debts/edition_check.patch` from the kuiper-belt root, then
`python3 tools/edition_check.py --pre-cut` on the branch and `python3 tools/edition_check.py --root <main worktree>`.
