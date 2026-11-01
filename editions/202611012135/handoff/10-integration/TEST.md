# TEST.md: the Android journey on the assembled edition, one run per admission (Opus team 10 tester)

Tester OPUS-10. Page: `http://127.0.0.1:8502/editions/202611012135/`, served by plain `python3 -m http.server 8502
--bind 127.0.0.1` from /home/user/estate/kuiper-belt (nothing substituted). Script: team 10's copy of the NL-009
journey, `/tmp/nl010-opus/team-10/tester/android-journey.cjs` (see `JOURNEY.md` for the shell/card id mapping and the
two added steps). Chromium headless shell with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist`; Playwright `devices['Pixel 7']` (412×839), `devices['Galaxy S24']` (360×780),
`devices['Pixel 7 landscape']` (863×360); real touch (`touchscreen.tap`, CDP `Input.dispatchTouchEvent`); one device
per process, one at a time; 6.5 s fixed wait after load, settle up to 90 s after each fly; screenshot timeout 180 s.
Raw reports: `/tmp/nl010-opus/team-10/tester/runs/<run>-<device>.json` (+ `.log`, screenshots in `<run>-<device>/`).

Rule (ROADMAP step 10): the integrator admits nothing that turns a step red. A step red in the run before the
admission and still red after is "still red", not "turned red". `NOT EVALUATED` is never a pass.

Steps: load (zero console errors, wafer disc, bar one row) · edition-open · edition-close · panel-dismiss (wafer tap,
back gesture) · lines-open · lines-filter · lines-pick (card; header = line of code when the Opus 2 card is present) ·
card-details · card-close · key-e-1..3 · pinch-drag · spark-tap · whole-wafer · modules · see-through.
Under the Opus 1 shell, EDITION = ABOUT, LINES = WAFER, COMMANDS = VIEW (JOURNEY.md).

## Run 0: the base, nothing admitted (22:29–22:52 UTC)

modules.json `order: []` (index.html sha256 `390b15ae…23ae5` at 22:29, measured = BASE.md "after B3": Edition 4 copy + NL-009 07-perf + 03-camera + the readout stamp). Load average 65.8 at start. Pixel 7 only
(Galaxy S24 and landscape not run on the base: the lead's own base run `--all` was in progress on port 8500 with the
NL-009 script, and the machine is shared). Report `runs/r0-base-pixel-7.json`; 14 PASS, 3 FAIL, 0 console errors.

| step | Pixel 7 | measured |
|---|---|---|
| load | FAIL | bar two rows: title tops 6/6/6/39, bar 75.1 px (NL-009 01-bar BLOCKER, step 1's to fix); 0 console errors; wafer disc 322×323, lit 0.231; load 22.9 s |
| edition-open | PASS | |
| edition-close | PASS | |
| panel-dismiss | FAIL | wafer tap at (406,549) on `#c` closed EDITION, no card: ok; back: opening pushed no history entry (history.length 2→2), so the back gesture would leave the page |
| lines-open | PASS | |
| lines-filter | PASS | |
| lines-pick | PASS | Edition 4 card (no header check) |
| card-details | PASS | |
| card-close | PASS | |
| key-e-1..3 | PASS | |
| pinch-drag | PASS | pinch ratio 0.500, drag (−90,70) moved the spark (−90,70), page scroll 0, vv scale 1 |
| spark-tap | PASS | tap (309.1,452.7) → card 323 = nearest by the law (1.7 px; second 29.4 px) |
| whole-wafer | PASS | wafer 322×322 under the bar |
| modules | PASS | order empty (note), no loader, 0 page errors |
| see-through | FAIL | no SEE THROUGH control in the bar (NL-009 06, step 1/5's to add) |

Red at base: load, panel-dismiss (back), see-through. These are the reference: an admission must not add a red step.

## Pre-admission run P1: shell + loader under the stub (22:53–23:20 UTC), not an admission

Served by `handoff/00-stub/stub-serve.cjs 8502 --add modules/202611012143-kuiper-shell.js` (disk index.html + Opus 4's
`index.html.patch` rev 2 in memory; manifest `order [hello, kuiper-shell]`), Pixel 7, script `03a4a49d…` (the first
NL-010 version). Report `runs/pre-shell-pixel-7.json`. 12 PASS, 5 FAIL. What it taught:

| step | Pixel 7 | cause |
|---|---|---|
| load | FAIL → script fixed | the bar is one row (tops 0×6, 34 px), 0 console errors, but the wafer-disc measure counted the shell's bottom-left SEE THROUGH strip (8,788 103×42) as lit wafer: bbox 359×535. The script now blanks `#kuiper-star-strip` before measuring (JOURNEY.md) |
| panel-dismiss | FAIL → script fixed | ABOUT fills the phone (bottom 833 of 839), so no wafer to tap beside it; and the shell's own `pushState` re-used the forward entry left by the previous close (history.length 3→3), so a length test missed it. The script now tries every panel for the wafer tap and detects the entry by `history.state` |
| lines-pick | **FAIL, real** | WAFER row tap: camera flew, no card, no selected spark. Same race as OPUS-2 tester's REQUEST on #10 (23:04 UTC, issuecomment on `kuiper-shell.js:241-275, :451-454` × `04-loader/index.html.patch:286-295`): the shell's `closeAll(false)` calls `history.back()`, the page's ANDROID BACK popstate listener (not told it is the shell's back) hides the card line-card/the engine has just opened |
| card-details | FAIL (follows lines-pick) | no card to open details on |
| whole-wafer | FAIL → script fixed | the same strip in the wafer bbox ([8,275,366,830]); VIEW › whole wafer closed the panel and the card |
| see-through | PASS | strip `a` "See Through" (9,788 102.9×42) → same tab `/see-through/202610050609/` |
| modules | PASS | admitted [hello, kuiper-shell], refused [], 0 page errors |
| key-e-1..3, pinch-drag, spark-tap, edition-open/close, lines-open/filter | PASS | |

Two console errors were recorded after the SEE THROUGH navigation (`basemaps.cartocdn.com … ERR_TUNNEL_CONNECTION_FAILED`
on the See Through page: the sandbox has no route to CARTO). They belong to `see-through/`, not to the edition; the
script now keeps them apart (`offPageErrors`) and adds a `console` step for the edition's own errors over the whole
journey.

## Run 1: admitted [hello, kuiper-shell] (modules.json `b1920a4e…`, index.html `1b008b51…` = loader patch applied), started 23:23 UTC

Snapshot `/tmp/nl010-opus/team-10/tester/snap/r1` (frozen 23:22; edition folder copied without handoff/), plain
`python3 -m http.server 8502`, script `ecde2f34…`. Load average 61–70.

**INTERIM, Pixel 7, 23:35 UTC: the shell admission turns `lines-pick` and `card-details` RED (green in run 0).**
A row tap in WAFER flies the camera but leaves no card and no selected spark: measured `card.open false`, magenta
none on `#o`, `linesVisible false`. Cause: OPUS-2 tester's REQUEST on #10 (23:04 UTC): the shell's
`closeAll(false)` → `history.back()` (kuiper-shell.js:241-248, :451-454) is taken by the loader patch's ANDROID BACK
popstate listener (04-loader/index.html.patch:286-295, now in index.html) as the user's back gesture, which hides the
card. Pressing `e` (no panel to close) still opens the card (key-e PASS). Per the rule this admission is not green;
the integrator decides (fix in the shell: close without `history.back()` racing the page, e.g. tell the page via
`edPopping`/a shared flag, or the page's listener ignores a popstate whose state is the shell's `{kmb}`).
Load, panel-dismiss (wafer tap and back gesture), see-through now PASS (were red in run 0).

