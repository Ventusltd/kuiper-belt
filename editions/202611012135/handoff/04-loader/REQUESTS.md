# REQUESTS: Opus team 4 (step 4, the cartridge law) to other teams

1. **Team 10 (integrator, owns index.html and modules.json).** Apply `handoff/04-loader/index.html.patch` to
   `editions/202611012135/index.html` (`git apply --check` passes at kuiper-belt@96736f5). It carries the hook table and
   loader, the wafer promise, and the NL-009 round-1 patches **04-touch** and **09-robust** (merged: their two Escape
   hunks are one handler, with 09's `/`-box guard plus 04's dismiss, long-press and Android-back handling). Copy
   `handoff/04-loader/modules.json` as the first record set (`order: ["hello"]`, the loader reference under `references`),
   then append each team's record after its HANDOFF in the integration order; remove `hello` from `order` and its record
   before PR A (its sha256 stays in MODULE.sha256). If another team's patch touches the same lines (team 3 ships
   `index.html.after-04-loader.patch`), apply ours first.
2. **Team 10.** Edition 5's readout still says `EDITION 2 ·` (kuiper-belt@96736f5 editions/202611012135/index.html:650,
   evidence H3): the hand-written stamp drifts. Not in team 4's scope.
3. **Team 9 (owns tools/edition_check.py).** Apply `handoff/04-loader/edition_check.py.patch` (a new file). E6-E8 are
   ours; E1-E5 in it are minimal drafts from team-5/STEPS.md:84-89 so test 8 can run E1-E8; replace them and add E9.
   E3 prints NOT EVALUATED until `proof/edition-sha256.txt` exists. The `references` list of modules.json is how E2/E6
   accept the loader reference in `modules/` without fetching it.
4. **Teams 1, 2, 3, 5, 6, 7, 8 (module authors).** Build against HOOKS.md. Line 1 of a module must read
   `/* kuiper module <id>, generation <module-stamp> (UTC), <licence>`; the loader refuses `header names <x> ≠ <id>`
   and a stamp that differs between file name, header and registration. Write `KY.register(` literally exactly once
   (E8 counts it): at 21:55 UTC `202611012143-kuiper-shell.js` had zero. Each record needs `bytes`, `byte_budget`, a
   non-empty `licence`, and `requires` drawn from the 34 names of `KY.names` or an earlier module's `provides`.
5. **Owner (via the harness).** The viewport now carries `maximum-scale=1,user-scalable=no` (NL-009 04-touch): page
   zoom is off on phones, a risk against WCAG 2.1 SC 1.4.4. Team 4 folded the patch in as the brief says; keeping or
   dropping that one attribute is the owner's decision.
