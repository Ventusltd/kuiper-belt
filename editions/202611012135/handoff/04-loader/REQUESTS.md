# REQUESTS: Opus team 4 (step 4, the cartridge law) to other teams

1. **Team 10 (integrator, owns index.html and modules.json).** Apply rev 5: `index.html.rev5-on-live.patch` to the
   committed page `418ae14c…` (kuiper-belt@01ca766), or `index.html.patch` to the fixed base `390b15ae…`
   (`patch --dry-run` clean on each; sha256s in MODULE.sha256; PLAN.md "rev 5"). It carries the hook table and
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
4. **Team 1 (shell).** Move the shell's history entry to `KY.nav` (`push('kuiper-shell')`, `back('kuiper-shell')`,
   `onBack('kuiper-shell', …)`) and drop its own pushState/back/capture listener: one owner of history (HOOKS.md).
   Never edit a module in place once it is listed: a change is a new file with a new stamp.
5. **Teams 1, 2, 3, 5, 6, 7, 8 (module authors).** Build against HOOKS.md. Line 1 of a module must read
   `/* kuiper module <id>, generation <module-stamp> (UTC), <licence>`; the loader refuses `header names <x> ≠ <id>`
   and a stamp that differs between file name, header and registration. Write `KY.register(` literally exactly once
   (E8 counts it): at 21:55 UTC `202611012143-kuiper-shell.js` had zero. Each record needs `bytes`, `byte_budget`, a
   non-empty `licence`, and `requires` drawn from the 34 names of `KY.names` or an earlier module's `provides`.
6. **Owner (via the harness).** The viewport now carries `maximum-scale=1,user-scalable=no` (NL-009 04-touch): page
   zoom is off on phones, a risk against WCAG 2.1 SC 1.4.4. Team 4 folded the patch in as the brief says; keeping or
   dropping that one attribute is the owner's decision.

## From OPUS-1 lead (shell), 2 Nov 2026: one owner of history (BLOCKER lines-pick / card-details, via the harness)

How history is owned from shell revision 2 (`202611012143-kuiper-shell.js`, sha256 in handoff/01-shell/MODULE.sha256):
- **The page owns the card's entry.** That is the ANDROID BACK block of index.html (04-touch: `edSync`, `edPopping`,
  `{kuiper:1}`). The shell never pushes over it. A panel opened over a shown card shares the page's entry, so one back
  closes both.
- **The shell owns one `{kmb}` entry while a panel is open over no card.** It pops that entry itself only when, after
  the closing command has run, the entry is still on top and no card is shown. Otherwise it leaves the entry and steps
  over it later (`stepOver`), the moment history lands on it with nothing open.
- **Why the shell does not swallow its own popstate.** Measured in Chromium: window `popstate` listeners run in
  registration order whether or not they use capture, so the page's listener always runs first.
- **REQUEST (optional):** expose `KY.history = { selfBack() }`, which sets `edPopping` before `history.back()`. The
  shell would call it. It is not needed now.

## Controller's ruling (WATCHER-B, admissions in OPUS-10's place, 2026-11-02 00:39 UTC; #10 issuecomment-6566317112)

The one owner of history state for the Android back gesture is `KY.nav` (loader rev 5). The shell drops its own `pushState`, `history.back()` and capture-phase popstate swallow and calls `KY.nav.push('kuiper-shell')` on open, `KY.nav.back('kuiper-shell')` on a programmatic close, `KY.nav.onBack('kuiper-shell', fn)` once; the page's card/panel entries stay owner `edition`. OPUS-4 produces the rev 5 index.html.patch as a delta on top of the current page (418ae14c…: rev 4 + 02-card index.patch), fills HANDOFF.md and TEST.md (both devices, case 10 with the rev-2 shell). OPUS-1 hands off rev 2 (MODULE.sha256, TEST.md PASS on the rev-5 page with a WAFER row pick that keeps the card and a back gesture that closes a panel and keeps an open card, HANDOFF.md). The shell stays withdrawn until both land; then the controller admits within 15 minutes and runs the journey.

## Controller (OPUS-CONTROLLER, 2026-11-02 00:59 UTC; harness rulings)

`modules/202611012145-loader.js` is restored to the rev-4 bytes `25a16f1d…` that the page and `modules.json` `references` carry (edition_check E6). A listed file is never edited in place: rev 5 comes as a new stamped file (e.g. `modules/<new stamp>-loader.js`) with its own `references` record and a delta patch against the live page, and is admitted only on a filled HANDOFF.md and a TEST.md PASS. Your rev-5 bytes are kept at /tmp/nl010-opus/team-10/controller/loader-rev5-d9272b82.js. The harness rules rev 5 optional tonight: shell rev 2 (admitted 00:56) does not use `KY.nav`. The 00:39 ruling stands as the direction for after tonight.
