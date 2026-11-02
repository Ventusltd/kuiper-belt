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

**Run 1 final, Pixel 7 (23:23:45–23:59:21 UTC, load 57→68): 16 PASS, 2 FAIL, 0 console errors on the edition**
(2 off-edition errors on `see-through/`: CARTO basemap `ERR_TUNNEL_CONNECTION_FAILED`). Report `runs/r1-pixel-7.json`.
Galaxy S24 and Pixel 7 landscape were stopped unrun at 23:59 because line-card had been admitted at 23:33 and the
integrator had patched index.html (`5617077b…`, the shell-pop guard at :799-801); run 2 covers all three devices on
that state.

| step | run 0 | run 1 Pixel 7 | measured |
|---|---|---|---|
| load | FAIL | **PASS** | bar one row: 6 titles top 0, 34 px, scroll 412/412; wafer disc 322×323 (strip box 8,787 105×44 blanked); 0 errors; 21.9 s |
| edition-open (ABOUT) | PASS | PASS | `#kmb-panel-about` 34→833, scrolls inside (scrollTop 145, page 0) |
| edition-close | PASS | PASS | |
| panel-dismiss | FAIL | **PASS** | wafer tap (404,551) on `#c` beside FILE (bottom 262.5) closed it, no card; ABOUT + `history.back()` closed it, URL unchanged |
| lines-open (WAFER) | PASS | PASS | 344 rows |
| lines-filter | PASS | PASS | 7 rows, all match |
| lines-pick | PASS | **FAIL (turned red)** | no card, no selected spark (shell `history.back()` × page ANDROID BACK) |
| card-details | PASS | **FAIL (turned red)** | follows lines-pick |
| card-close | PASS | PASS* | *no card was open; × size 0×0 (not measured) |
| key-e-1..3 | PASS | PASS | cards 1, 2, 3 of 344, spark clear (y 377/352/352, card top 722/671/671) |
| pinch-drag | PASS | PASS | ratio 0.502; drag (−90,70) → (−90,70) |
| spark-tap | PASS | PASS | card 323 = nearest (1.9 px; second 29.7) |
| whole-wafer (VIEW) | PASS | PASS | VIEW › whole wafer ⌫ (44 px row), panel and card closed, disc whole |
| modules | PASS (empty) | PASS | admitted [hello, kuiper-shell], refused [], done, 0 page errors |
| see-through | FAIL | **PASS** | strip link (9,788 102.9×42) → same tab `/see-through/202610050609/` |
| console | — | PASS | 0 on the edition |

## Run 2: modules.json [hello, kuiper-shell, line-card] (`743c1760…`, index.html `5617077b…`), 00:00 UTC — ABORTED, inconsistent snapshot

The snapshot taken at 00:00 held the manifest naming `kuiper-shell` at `eeea4581…` while the module file on disk had
already changed (now `352c20c6…`). Measured on that snapshot (probe, Pixel 7): the loader refused it loudly,
`kuiper-shell refused: sha256 mismatch` (`#refuse`: "1 module refused: kuiper-shell (sha256 mismatch) · the wafer, the
bar and every admitted module keep working"), admitted [hello, line-card]; the Edition 4 bar stayed (journey `load`
FAIL: tops 6/6/6/39). The loader did what step 4 says. At 00:01 the integrator removed `kuiper-shell` from
`modules.json` (`be99c8a1…`) and index.html returned to `418ae14c…`; run 2 was stopped and replaced by run 3.
Team 1: the file `modules/202611012143-kuiper-shell.js` was edited after its admission; a changed module needs a new
hash (and stamp, if the generation changes) in the manifest before it can be admitted again.

## Run 3: admitted [hello, line-card] (modules.json `be99c8a1…`, index.html `418ae14c…` = loader rev 4 + 02-card index.patch), started 00:02 UTC

Snapshot `snap/r3` (00:02), plain `python3 -m http.server 8502`, script `ecde2f34…`. One device at a time.

**Pixel 7 (00:02:31–00:25:09, load 65→70): 16 PASS, 2 FAIL, 0 console errors.** Report `runs/r3-pixel-7.json`.
No step turned red against run 0: both reds are run 0's own (the shell is not in this manifest).

| step | run 0 | run 3 Pixel 7 | measured |
|---|---|---|---|
| load | FAIL | FAIL (still red) | Edition 4 bar two rows (tops 6/6/6/39, 75.1 px); wafer 322×323; 0 errors; 16.4 s |
| edition-open / edition-close | PASS | PASS | |
| panel-dismiss | FAIL | **PASS** | wafer tap (404,549) on `#c` closed EDITION, no card; back: the loader patch's ANDROID BACK pushes `{kuiper:1}`, `history.back()` closed EDITION, URL unchanged |
| lines-open / lines-filter | PASS | PASS | 7 rows match "acceptance" |
| lines-pick | PASS | PASS | card 40 of 344 "Owner acceptance cannot be forged by an agent: the ACCEPT line"; **header `.lc-h code` = keys.json `line_text` (" *", 2 chars), first text node of the card**; spark y 357.1 in [85.1, 630.6], hit `#c` |
| card-details | PASS | PASS | 198.4 → 285.25 px, cap 285.3 (34dvh), spark still clear |
| card-close, key-e-1..3, pinch-drag, spark-tap, whole-wafer | PASS | PASS | |
| modules | PASS (empty) | PASS | admitted [hello, line-card], refused [], done, 0 page errors |
| see-through | FAIL | FAIL (still red) | no control (the shell carries it; not admitted) |
| console | — | PASS | 0 |

Galaxy S24 and Pixel 7 landscape: running (below).

**Galaxy S24 (00:25:09–00:46:59, load 70→41): 16 PASS, 2 FAIL, 0 console errors.** Report `runs/r3-galaxy-s24.json`.
Same two reds as run 0 (load: Edition 4 bar tops 6/6/6/39, 75.1 px at 360; see-through: no control). panel-dismiss
PASS (wafer tap (352,547), back closes, URL unchanged); lines-pick PASS, card 40 of 344, header = `line_text`
(" *"), first text node; card-details 198.4 → 265.19 px under cap 265.2; pinch ratio 0.503, drag (−90,70) → (−90,70);
spark-tap card 323 = nearest (1.8 px; second 26.1); modules [hello, line-card] admitted, refused []; console 0.

**Pixel 7 landscape (00:46:59–01:03:35, load 41→63): 12 PASS, 6 FAIL, 0 console errors.** Report
`runs/r3-pixel-7-landscape.json`. No landscape run exists on the base (run 0 was Pixel 7 only), so "turned red" cannot
be decided from this run alone; each red is analysed:

| step | landscape | cause, measured |
|---|---|---|
| load | FAIL → **SCRIPT** | bbox [0,45,862,324]: row 45 is the Edition 4 bar's 1 px bottom rule (bar bottom 45.6; 863 lit px in row 45, 0 in rows 44, 46, 47). Re-measured on the step's own PNG from row 47: disc 245×245 at (309,80)-(553,324): passes every disc rule. Script now starts at `ceil(bar bottom)` |
| whole-wafer | FAIL → **SCRIPT** | same row 45; from row 47 the disc is 245×245, whole under the bar |
| card-details | **FAIL, real (line-card, landscape)** | the card is capped at 30dvh = 108 px (top 240 of 360); its action row "open on GitHub · details" is cut by the cap (07-lines-pick.png), and the script tapped the centre of `details`, which lies in the clipped part: the tap went through to the wafer, the spark picker opened a pixel card (57.8 px, no ×). A person sees half of "details" at the bottom edge. Script now taps the visible part of a card control (and fails with "not visible" when under 8 px shows) |
| card-close | FAIL (follows card-details) | the pixel card has no `.lc-x` |
| spark-tap | FAIL | no unambiguous green spark in view after the zoom-out (greens 0), and the selected spark at y 242.1 is 0.7 px under the card top 241.4 (hit `div.lc-in`): the 108 px card takes the lower third of a 360 px screen |
| see-through | FAIL (still red) | no control without the shell |
| lines-pick | PASS | card 40, header = `line_text`, spark y 142.2 in [55.6, 230], card cap 108 |
| panel-dismiss, edition-open/close, lines-open/filter, key-e-1..3, pinch-drag, modules, console | PASS | |

Run 3 verdict for the integrator: on Pixel 7 and Galaxy S24 line-card turns no step red (both reds are run 0's).
In landscape, line-card's 30dvh cap hides its action row (`details` half visible): reported to team 2 as a landscape
MAJOR, not decided as "turned red" for lack of a landscape base; run 4 re-measures it with the fair tap.

