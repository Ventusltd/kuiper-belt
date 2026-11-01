# PLAN: Opus team 10 (the integrator), roadmap step 10. The lead decides.

Lead OPUS-10, 2026-11-01 22:24 UTC. Repository /home/user/estate/kuiper-belt, branch edition/202611012135 (never switch,
never commit, never push, never open a PR; the harness commits). Ports: lead 8500, builder 8501, tester 8502,
evidence 8503. Scratch: /tmp/nl010-opus/team-10/<role>/, never inside a repository.

## Files team 10 owns (and nothing else)

`index.html`, `keys.json` (unchanged: E5), `keys-min.json` (generated, BASE.md B1), `modules.json`, `README.md`,
`NOTICE.md`, `proof/`, `handoff/00-stub/`, `handoff/10-integration/`. Every other file is a REQUEST on issue #10.

## Who does what

- **Lead (me):** BASE.md (NL-009 07-perf and 03-camera applied to the base), the stub (handoff/00-stub/), admissions in
  the order 4, 1, 2, 3, 6, 5, 7, 8, 9: apply the team's `index.html` patch (team 4 first), add the record
  (file/path, sha256, generation, requires, provides, order, licence, team, step, proof) to `modules.json`, run the
  journey, write the row in `ADMISSIONS.md`; REVIEW on #10 for a module that turns a step red; the HANDOFF on #10.
- **Builder:** `README.md` "What changed from Edition 4" kept current after each admission: one paragraph per admitted
  module (id, file, sha256 first 12, team, step, what a person sees) and one line per NL-009 round-1 finding folded in
  (01 bar, 02 card, 03 camera, 04 touch, 05 lines, 06 see-through, 07 perf, 08 type, 09 robust: which team, which
  file, or "not folded in: why"). Keep Opus 2's "The card law" section byte-for-byte. Read ADMISSIONS.md; never edit
  it. Then `NOTICE.md` from Edition 4's (`editions/202611012027/NOTICE.md`) with the module licences and the VENTUS
  sentence of ROADMAP Q8, marked pending the owner's confirmation (the lead writes the first draft; the builder keeps
  it current).
- **Tester:** the journey. Run `node /tmp/nl010-opus/team-10/lead/journey/android-journey.cjs
  http://127.0.0.1:8502/editions/202611012135/ <out> --all` on the page as admitted (plain `python3 -m http.server`,
  nothing substituted) after each admission row appears in ADMISSIONS.md; report each step per device into
  `ADMISSIONS.md`'s companion `JOURNEY.md` (step, Pixel 7, Galaxy S24, Pixel 7 landscape, measured value). The NL-009
  script names Edition 4's ids (`#bar .gm-title[data-panel=top|hud|lines|foot]`); once Opus 1's shell supersedes them,
  a step that goes red because an id moved is reported as `SELECTOR` with the new id, never as a pass, and the lead
  decides whether the module or the script is at fault. Add the step-4 module check: every `order` entry in
  `window.__KUIPER_EDITION__.admitted`, `refused` empty, `pageerror` 0. Load average on this machine was 93 at 22:20;
  record it with each run.
- **Evidence officer:** `proof/`: `edition-sha256.txt` (every file of the folder except `handoff/` and `proof/handoff/`,
  `sha256sum` format, sorted), `keys-summary.json` (from Edition 4's form), the journey JSON as
  `proof/android-journey.json`, `ci_check.log` (`python3 tools/ci_check.py` must print `RESULT: PASS`) and, when team 9
  lands, `edition_check.py` output. Re-check every key in README.md and NOTICE.md (`repo@sha path:line`) against the
  files; review the lead's HANDOFF before it is posted. The move `handoff/` → `proof/handoff/` is the lead's, last.

## Rules everyone keeps

- A module is admitted only when its `HANDOFF.md` and a `TEST.md` reading PASS on Pixel 7 and Galaxy S24 with zero
  console errors are in its handoff folder.
- Every number in README, NOTICE, ADMISSIONS and the HANDOFF is measured; a step that could not be run is
  `NOT EVALUATED` with the reason.
- Never post ACCEPT. Never edit another team's module, data, tool or handoff file.
