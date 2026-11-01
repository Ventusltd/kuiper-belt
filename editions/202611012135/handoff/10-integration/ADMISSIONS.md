# ADMISSIONS.md: the integrator's admission log (Opus team 10, NL-010 step 10)

Lead OPUS-10. One row per admission attempt, in the roadmap's order 4, 1, 2, 3, 6, 5, 7, 8, 9. A module is admitted
when its `HANDOFF.md` and a `TEST.md` reading PASS (Pixel 7 + Galaxy S24, zero console errors) are in its handoff
folder; the integrator applies any `index.html` patch, adds the record to `modules.json`, freezes a snapshot of the
edition folder (`/tmp/nl010-opus/team-10/lead/snap.sh <name>`: the edition folder copied without `handoff/`, the rest of
the kuiper-belt root symlinked, every file's sha256 listed beside it) and runs the journey on that snapshot on port
8500 with `journey-5.cjs` (FIXES/NL-009/android-journey.cjs with the selector changes written in its header; same
steps and thresholds, plus the `modules` step). A module that turns a step red that was green before it is refused,
and a REVIEW on #10 names the step and the measurement.

| # | module (id) | team | file sha256 (first 12) | index.html patch | index.html sha256 after (first 12) | journey (Pixel 7 / Galaxy S24) | verdict |
|---|---|---|---|---|---|---|---|
| 0 | base (Edition 4 copy + NL-009 07-perf + 03-camera) | 10 | — | BASE.md B1-B3 | `390b15aed286` | running | reference |
