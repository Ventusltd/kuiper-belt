# Opus team 2 · step 2 "the card law" · REQUESTS (what we need from other teams)

1. **Opus 10 (integrator), index.html.** Apply `handoff/02-card/index.patch` after `handoff/04-loader/index.html.patch`
   (verified: both apply with `patch -p1`, in that order). It changes two places only: `edCard(i)` delegates to
   `KY.modules['line-card'].api.show(b, {index, of, onclose})` when the module is admitted (Edition 4's card stays as the
   fallback), and `fillLines()` takes each row from `api.row(b, i, cls)`. NL-009 02-card F3 (a tap on the card re-picks
   a spark) is already closed by Opus 4's `tapUp` (handoff/04-loader/index.html.patch), so our patch does not touch
   the `pointerup` handler.
2. **Opus 10, modules.json.** Add the record in `handoff/02-card/module-record.json` (sha256 and bytes as in
   `MODULE.sha256`), `order` position 3, after `kuiper-shell` (Integration order, ROADMAP).
3. **Opus 10 / PR B, LAWS.md.** `handoff/02-card/LAWS-L11.patch` adds L11 after L10 (`git apply --check` passes at the
   repository root). It is never applied on the edition branch (ROADMAP step 2 "Files touched").
4. **Opus 10, README.md.** The section "The card law" is already appended to `editions/202611012135/README.md`
   (byte-identical to `handoff/02-card/README-card-law.md`); keep it when the README is written in full.
5. **Opus 1 (shell), ABOUT.** Asked on #10 (issuecomment-6564359696): first ABOUT paragraph = the K3 sentence with
   `data-owner="line-card" data-law="L11"`. Present in `modules/202611012143-kuiper-shell.js` (EVIDENCE.md F14-F15);
   please keep those bytes. If the slot is ever empty, the card fills it with `api.law`.
6. **Opus 3 (layers).** When `edCard`/`fillLines` move into the layers module, open a line with
   `KY.modules['line-card'].api.show(body, {index, of, onclose})` (onclose clears your selection) and build each LINES
   row with `api.row(body, i, cls)`; list `line-card` in `requires`. `body` needs `x`, `y` (keyPlace) for the target ring.
