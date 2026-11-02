# GREEN.md: admissions that added no red step on Pixel 7 and Galaxy S24 (Opus team 10)

Each entry is an admitted state whose journey (journey-5.cjs on a frozen snapshot, port 8500) shows no step red that
was green in the state before it. "Base reds" are the two steps red since the base (BASE.md; ADMISSIONS.md row 0):
`load` (Edition 4's bar on two rows: title tops 6/6/6/39, bar 75.1 px; NL-009 01-bar, closed only by the shell) and
`see-through` (no SEE THROUGH control; closed by the shell's strip and Opus 5). They stay red until the shell is
admitted; they are not new reds. The harness may publish each state below as the next small step.

| state | admitted (`modules.json` order) | index.html sha256 | modules.json sha256 | journey | new reds |
|---|---|---|---|---|---|
| G1 (row 1) | hello (+ hook table and loader, Opus 4 rev 4) | `1b008b51520520af91a98a874d5db23c6a0af4fb0bf2e2e35845a3c0c344899a` | `7ad997c1d832680d5c4a9def804d145b895c8852a8a9ed16929571af58752202` | Pixel 7 14/16, Galaxy S24 14/16, 0 console errors (23:19-23:47 UTC) | none (base reds only) |
| G2 (row 3) | hello, line-card | `418ae14ca39bc92be028f852825da196fd634ec12bb48f8f538d0cf739564d05` | `be99c8a126ce691805e3b8deffb849f09ffdba49478c787cb217b03297e75752` | Pixel 7 14/16, Galaxy S24 14/16, 0 console errors (00:02-00:26 UTC) | none (base reds only) |

Not green: row 2, kuiper-shell `eeea4581…` (refused; ADMISSIONS.md, REVIEW issuecomment-6565858587).

## Controller's note (WATCHER-B, the one Fable controller; owner via the harness, 2026-11-02 00:0x UTC) · 2026-11-02 00:28 UTC

The harness publishes a preview of the newest state in the table above at each 40-minute check-in (pointer untouched). This file says **POINTER-READY** only when base + loader + shell + card + layers shows no new red on Pixel 7 and Galaxy S24; then the harness moves the pointer. State now: **PREVIEW-GREEN at G2 (hello, line-card), NOT POINTER-READY.** The integrator's table above is the record; WATCHER-B appends here and does not rewrite it.

What POINTER-READY waits for (measured, 00:00–00:30 UTC):
1. The shell: team 1's rev-2 hand-off (MODULE.sha256 still eeea4581…; the file churns 352c20c6 → 4c0e8314 → 6fa6d5c0 → 1edf2e1a) or team 4's loader rev 5 (`KY.nav`, index.html.patch fdb4d3c2 against base 390b15ae, HANDOFF.md placeholders, TEST.md "running"); one owner of history, agreed between them. WATCHER-B snapshot w2-adm (shell eeea + a page-side pop guard, Pixel 7): lines-pick and card-details still red, as the integrator measured.
2. Layers after the shell: team 3's own pre-integration run 00:10 (cut page + shell rev 2 + card + layers) reads FAIL (t2-panel width 4..408 of 412, t2-list). WATCHER-B snapshot w3 (the same candidate, tester's script, Pixel 7): load, edition-open/close, panel-dismiss, lines-open, key-e-1..3, pinch-drag, whole-wafer PASS; lines-filter (filter input/first row off screen under the keyboard: the list sits under seven layer rows), lines-pick (camera flew, spark selected, panel closed, no card), card-details, card-close, spark-tap (card shows 21307418144, nearest by the law is 323), modules (1 page error) FAIL. The cut page uses `edSel` twice (ANDROID BACK and Escape handlers) and defines it nowhere.
- 00:33 UTC · w3 final (Pixel 7): 11 PASS / 7 FAIL (lines-filter, lines-pick, card-details, card-close, spark-tap, modules, console: pageerror edSel is not defined); FINDING on #10 by WATCHER-B. Still NOT POINTER-READY.

## OPUS-CONTROLLER · 2026-11-02 01:45 UTC

Row 4 (kuiper-shell rev 2 `1edf2e1a…`, order [hello, kuiper-shell, line-card], modules.json `5ef02d3e…`) is **not green**: Pixel 7 15/16, Galaxy S24 13/16. It cures the base's two reds (`load`, `see-through`) on both devices, but adds `pinch-drag` and `spark-tap` (Galaxy S24; the SEE THROUGH strip sits over the wafer above an open card and takes a pinch finger) and `whole-wafer` (both; wafer screenshot timed out) that were green at G2. Withdrawn 01:37 UTC; the published state stays **G2, NOT POINTER-READY**. ci_check PASS; edition_check --pre-cut: E1 E2 E4-E8 PASS, E3 NOT EVALUATED (pre-cut), E9 FAIL (data/drift.json, team 8).
