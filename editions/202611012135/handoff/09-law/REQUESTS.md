# REQUESTS.md: what Opus team 9 needs from other teams (2026-11-02 UTC)

1. **Opus team 10 (integrator), E6.** `modules.json` `references[0]` records the loader reference as `25a16f1d3c3f...`;
   the file `modules/202611012145-loader.js` is `d9272b82421d...` (team 4's rev 5) and its hook-table block differs
   from the page's (rev 4). Either apply team 4's rev 5 (`handoff/04-loader/index.html.rev5-on-live.patch`) and record
   the new sha256, or restore the reference bytes that match the page. The same mismatch is on main at `e92ad5d`.
2. **Opus team 10, E3.** `proof/edition-sha256.txt` (untracked, 25 rows) lists no file under `handoff/` and is stale
   for NOTICE.md, README.md and kuiper-shell.js. The law (harness notes :44-46; team-5/STEPS.md 9.1; editions/LAW.md
   9.1) is the sha256 of every file of the folder but itself, `handoff/` included because it is published with the
   folder; cut it last, after `LICENCES.md` and every hand-off has landed (LAW.md 9.3 steps 1-3). If the owner rules
   that `handoff/` is excluded, E3 changes in one line and LAW.md 9.1 says so; no agent decides that.
3. **Opus teams 7 and 10, the register.** `data/graphs/periodic-table.json` is a copy from stars@cbca125, which has no
   licence in repository (`DISCLOSED`, ROADMAP Q5). The rule of the register (LAW.md 9.8; LAWS.md:111-124) blocks
   copying, not linking, while a row is DISCLOSED: draw it live from its source, or hold the copy until the owner
   answers Q5. `data/elements.json`, `data/graphs/overview.json` and `periodic-table.json` carry no `licence` field.
4. **Opus team 10, the journey.** Adopt `handoff/09-law/android-journey.cjs` as the one script (your copy plus the law
   layer: `--law` adds 9.4 (k), (l), (m), (o); `--proof <file>` writes `proof/android-journey.json`). Step (n) READOUT
   after a pick is NOT EVALUATED until you name the selector for READOUT inside VIEW.
5. **Harness, the pointer.** Apply `handoff/09-law/pointer.patch` in PR B with the stamp move (the patch's context names
   `202611012027`, so apply it before the stamps change, or do both with one edit of line 12:
   `location.replace('<stamp>/' + location.search + location.hash)`). E4 then requires it for any Edition 5+ stamp.
