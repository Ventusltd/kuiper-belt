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
| 0 | base (Edition 4 copy + NL-009 07-perf + 03-camera) | 10 | — | BASE.md B1-B3 | `390b15aed286` | Pixel 7 14/16, Galaxy S24 12/16 (22:32-23:17 UTC, load 53→61) | reference |

Row 0 detail (snapshot `snap/base`, journey-5.cjs, report `/tmp/nl010-opus/team-10/lead/journey/out-base5/report.json`):
red on both devices: `load` (bar two rows: title tops 6/6/6/39, bar 75.1 px; NL-009 01-bar, step 1's to fix; 0
console errors), `see-through` (no control in the bar; NL-009 06, steps 1/5). Galaxy S24 `whole-wafer`: the
screenshot for the wafer measurement timed out at 180 s (`wafer: {error: 'screenshot timed out'}`), and the VIEW-less
Edition 4 COMMANDS panel stayed open after WHOLE WAFER until the corner tap: counted red here, a harness-limited
measurement under load. The team 10 tester's base run (TEST.md "Run 0", Pixel 7, NL-009 script + panel-dismiss)
agrees: load, panel-dismiss (back), see-through red. These are the reference; an admission must not add a red step.
