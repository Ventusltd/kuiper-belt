# handoff/01-shell/TEST.md: step 1 "the shell contract", acceptance A1–A9

Tester OPUS-1 (Opus team 1). Written by `test.cjs` at 2026-11-02 02:08 UTC; every cell below is a measurement from that run, never an estimate.

**Verdict: FAIL — HAND-OFF REFUSED by the tester until every cell reads PASS.**

| run | value |
|---|---|
| module | `modules/202611020154-kuiper-shell.js` |
| module sha256 | `ef315e9bfa6af2a8d9196859cb65bb2c612be8ec48b1a832cbb1241676624eef` (47604 bytes) |
| how the module reached the page | `page` (--admit: modules.json served with handoff/01-shell/MODULE.json inserted, sha256 ef315e9bfa6a, order ["hello","kuiper-shell","line-card"]; the page's loader admits it) |
| test.cjs sha256 | `ed5facac8e1a6eb8122db4f1c527f0ee2cb15371b17dedaf27ed1b5683fe83b9` |
| Kuiper | http://127.0.0.1:8410/editions/202611012135/ (kuiper-belt `ae97bce52322868b68a2bd259bf477ecbd17cbb8`, branch `edition/202611012135`, working tree) — server already serving |
| GridAtlas | http://127.0.0.1:8510/atlas/ (gridatlas `5ec7f62f213e2d20a02e86427daa182c0f38e4a4`) — server started by test.cjs (pid 11003); maplibre-gl@3.6.2 from `see-through/202610050513/vendor/`, Carto style = one background layer, all other external requests aborted (team-1/STEPS.md:20-29) |
| browser | Playwright Chromium 153.0.8010.12, `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, real touch (`touchscreen.tap`), 7 s settle |
| devices | Pixel 7 412×839 touch · Galaxy S24 360×780 touch · Pixel 7 landscape 863×360 touch · 360x740 360×740 touch |

## Pass / fail per assertion

| id | assertion | Pixel 7 | Galaxy S24 | Pixel 7 landscape | 360x740 |
|---|---|---|---|---|---|
| A1 | `#kuiper-menu-bar` at x=0 y=0, full width, height 34 px (≤700 px) / 36 px; state `installed:true`, `failure:null`, schema `kuiper.menu-bar.v1` | PASS | PASS | PASS | PASS |
| A2 | six `button.gm-title[aria-haspopup=menu]` FILE EDIT VIEW (left) SCOPE WAFER ABOUT (right) on one rounded y, inside the bar, last right edge ≤ viewport, `scrollWidth === clientWidth`; star entry (if any) is a bar title only at ≥ 434 px (the lead's measured breakpoint, FINDING #10 6564447092), first on the left | PASS | PASS | PASS | PASS |
| A2b | 360 px with a 1.3× font scale on titles and wordmark (01-bar method): still one row, bar height kept; if it overflows, `overflow-x:auto` and the last title reachable by scroll and opens on tap | n/a | n/a | n/a | PASS |
| A3 | wordmark: `.ventus-main` "Ventus" 11/14 px 800 `rgb(255,255,255)` uppercase; `.ventus-sub` 4.5/5.5 px `rgb(136,136,136)`; centred within 1 px (x on the viewport, y on the bar); not a link; box within 1 px of the team-1 table AND of GridAtlas measured live in this run | PASS | PASS | PASS | PASS |
| A4 | at rest nothing over the wafer outside the bar but `#c`, `#o`, the find box (top = bar bottom + 36, right-aligned, 44 px on touch) and the star chip; `#keys #top #hud #foot #lines #bar` hidden; no panel open | PASS | PASS | PASS | PASS |
| A5 | each title: real tap opens exactly one panel under the bar inside the viewport (`aria-expanded=true`), second tap, Escape and `page.goBack()` (the Android back gesture) close it and stay on the page; every panel row ≥ 44 px; a wafer tap closes; VIEW "next verified line" lands the spark between bar bottom and card top (10 px margins) | PASS | PASS | PASS | FAIL: next verified line: spark not between bar and card |
| A6 | `elementFromPoint(titleCentreX, 40)` is the title on a coarse pointer, all closed (44 px hit box); with FILE open, 4 px into its first row is the row, not the title | PASS | PASS | PASS | PASS |
| A7 | zero `pageerror`, zero console errors, zero failed local requests during the device run; `node --check` of the module | PASS | PASS | PASS | PASS |
| A9 | the same table measured on GridAtlas `/atlas/` (gridatlas@5ec7f62 served on port+100, CDN stubbed as team 1 did) — bar, title face, wordmark style and box compared number to number (box tolerance 1 px, styles exact) | PASS | PASS | PASS | PASS |
| A8 | admission rule (Pixel 7): `#keys` removed after the engine ran → `installed:false`, `#kuiper-menu-bar-failure[role=alert]` visible naming `#keys`, Edition 4 `#bar` visible and a real tap on its title opens its panel | PASS | — | — | — |

## Key measurements per device

| device | bar (x,y,w×h) | titles (sum w) / slot w / slack | wordmark box | GridAtlas box (live) | find box | rows <44 px | console errors |
|---|---|---|---|---|---|---|---|
| Pixel 7 | 0,0,412×34 | 224.4 / 77.6 / 110 | 73.6×16.3 | 73.6×16.3 | - | 0 of 370 | 0 |
| Galaxy S24 | 0,0,360×34 | 224.4 / 77.6 / 58 | 73.6×16.3 | 73.6×16.3 | - | 0 of 370 | 0 |
| Pixel 7 landscape | 0,0,863×36 | 325.8 / 247.1 / 189.2 | 90×20.5 | 90×20.5 | - | 0 of 370 | 0 |
| 360x740 | 0,0,360×34 | 224.4 / 77.6 / 58 | 73.6×16.3 | 73.6×16.3 | - | 0 of 21 | 0 |

## A9: the two shells, number to number

### Pixel 7

| measure | Kuiper | GridAtlas | pass |
|---|---|---|---|
| bar height px | 34 | 34 | PASS |
| bar background | rgba(4, 10, 13, 0.95) | rgba(4, 10, 13, 0.95) | PASS |
| bar rule | 1px solid rgba(80, 220, 240, 0.3) | 1px solid rgba(80, 220, 240, 0.3) | PASS |
| bar blur | blur(7px) | blur(7px) | PASS |
| bar font | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title rows | 1 | 1 | PASS |
| title names | FILE EDIT VIEW SCOPE WAFER ABOUT | FILE EDIT VIEW SCOPE GRID ABOUT | PASS |
| title height px | 34 | 34 | PASS |
| title fontSize | 9px | 9px | PASS |
| title letterSpacing | 0.225px | 0.225px | PASS |
| title padding | 0px 6px | 0px 6px | PASS |
| title color | rgb(207, 238, 246) | rgb(207, 238, 246) | PASS |
| title fontFamily | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title textTransform | uppercase | uppercase | PASS |
| title width FILE | 34.6 | 34.6 | PASS |
| title width EDIT | 34.6 | 34.6 | PASS |
| title width VIEW | 34.6 | 34.6 | PASS |
| title width SCOPE | 40.2 | 40.2 | PASS |
| title width ABOUT | 40.2 | 40.2 | PASS |
| brand slot w x h | 77.6 x 33 | 77.6 x 33 | PASS |
| wordmark box w x h | 73.6 x 16.3 | 73.6 x 16.3 | PASS |
| wordmark centre - bar centre (x, y) | 0, -0.45 | 0, -0.45 | PASS |
| .ventus-main font-size | 11px | 11px | PASS |
| .ventus-main font-weight | 800 | 800 | PASS |
| .ventus-main letter-spacing | 1.54px | 1.54px | PASS |
| .ventus-main text-transform | uppercase | uppercase | PASS |
| .ventus-main color | rgb(255, 255, 255) | rgb(255, 255, 255) | PASS |
| .ventus-main font-family | -apple-system, sans-serif | -apple-system, sans-serif | PASS |
| .ventus-main line-height | 11.55px | 11.55px | PASS |
| .ventus-sub font-size | 4.5px | 4.5px | PASS |
| .ventus-sub letter-spacing | 0.63px | 0.63px | PASS |
| .ventus-sub text-transform | uppercase | uppercase | PASS |
| .ventus-sub color | rgb(136, 136, 136) | rgb(136, 136, 136) | PASS |
| .ventus-sub line-height | 4.725px | 4.725px | PASS |
| .ventus-main box w x h | 55.5 x 11.5 | 55.5 x 11.5 | PASS |
| .ventus-sub box w x h | 73.6 x 4.7 | 73.6 x 4.7 | PASS |
| lockup flanks shown | 1 | 1 | PASS |
| wordmark is a link | false | false | PASS |
| horizontal scroll | false | false | PASS |
| panel position (phone fixed / wide absolute) | fixed | fixed | PASS |

### Galaxy S24

| measure | Kuiper | GridAtlas | pass |
|---|---|---|---|
| bar height px | 34 | 34 | PASS |
| bar background | rgba(4, 10, 13, 0.95) | rgba(4, 10, 13, 0.95) | PASS |
| bar rule | 1px solid rgba(80, 220, 240, 0.3) | 1px solid rgba(80, 220, 240, 0.3) | PASS |
| bar blur | blur(7px) | blur(7px) | PASS |
| bar font | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title rows | 1 | 1 | PASS |
| title names | FILE EDIT VIEW SCOPE WAFER ABOUT | FILE EDIT VIEW SCOPE GRID ABOUT | PASS |
| title height px | 34 | 34 | PASS |
| title fontSize | 9px | 9px | PASS |
| title letterSpacing | 0.225px | 0.225px | PASS |
| title padding | 0px 6px | 0px 6px | PASS |
| title color | rgb(207, 238, 246) | rgb(207, 238, 246) | PASS |
| title fontFamily | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title textTransform | uppercase | uppercase | PASS |
| title width FILE | 34.6 | 34.6 | PASS |
| title width EDIT | 34.6 | 34.6 | PASS |
| title width VIEW | 34.6 | 34.6 | PASS |
| title width SCOPE | 40.2 | 40.2 | PASS |
| title width ABOUT | 40.2 | 40.2 | PASS |
| brand slot w x h | 77.6 x 33 | 77.6 x 33 | PASS |
| wordmark box w x h | 73.6 x 16.3 | 73.6 x 16.3 | PASS |
| wordmark centre - bar centre (x, y) | 0, -0.45 | 0, -0.45 | PASS |
| .ventus-main font-size | 11px | 11px | PASS |
| .ventus-main font-weight | 800 | 800 | PASS |
| .ventus-main letter-spacing | 1.54px | 1.54px | PASS |
| .ventus-main text-transform | uppercase | uppercase | PASS |
| .ventus-main color | rgb(255, 255, 255) | rgb(255, 255, 255) | PASS |
| .ventus-main font-family | -apple-system, sans-serif | -apple-system, sans-serif | PASS |
| .ventus-main line-height | 11.55px | 11.55px | PASS |
| .ventus-sub font-size | 4.5px | 4.5px | PASS |
| .ventus-sub letter-spacing | 0.63px | 0.63px | PASS |
| .ventus-sub text-transform | uppercase | uppercase | PASS |
| .ventus-sub color | rgb(136, 136, 136) | rgb(136, 136, 136) | PASS |
| .ventus-sub line-height | 4.725px | 4.725px | PASS |
| .ventus-main box w x h | 55.5 x 11.5 | 55.5 x 11.5 | PASS |
| .ventus-sub box w x h | 73.6 x 4.7 | 73.6 x 4.7 | PASS |
| lockup flanks shown | 1 | 1 | PASS |
| wordmark is a link | false | false | PASS |
| horizontal scroll | false | false | PASS |
| panel position (phone fixed / wide absolute) | fixed | fixed | PASS |

### Pixel 7 landscape

| measure | Kuiper | GridAtlas | pass |
|---|---|---|---|
| bar height px | 36 | 36 | PASS |
| bar background | rgba(4, 10, 13, 0.95) | rgba(4, 10, 13, 0.95) | PASS |
| bar rule | 1px solid rgba(80, 220, 240, 0.3) | 1px solid rgba(80, 220, 240, 0.3) | PASS |
| bar blur | blur(7px) | blur(7px) | PASS |
| bar font | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title rows | 1 | 1 | PASS |
| title names | FILE EDIT VIEW SCOPE WAFER ABOUT | FILE EDIT VIEW SCOPE GRID ABOUT | PASS |
| title height px | 36 | 36 | PASS |
| title fontSize | 11px | 11px | PASS |
| title letterSpacing | 0.55px | 0.55px | PASS |
| title padding | 0px 11px | 0px 11px | PASS |
| title color | rgb(207, 238, 246) | rgb(207, 238, 246) | PASS |
| title fontFamily | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title textTransform | uppercase | uppercase | PASS |
| title width FILE | 50.7 | 50.7 | PASS |
| title width EDIT | 50.7 | 50.7 | PASS |
| title width VIEW | 50.7 | 50.7 | PASS |
| title width SCOPE | 57.9 | 57.9 | PASS |
| title width ABOUT | 57.9 | 57.9 | PASS |
| brand slot w x h | 247.1 x 35 | 247.1 x 35 | PASS |
| wordmark box w x h | 90 x 20.5 | 90 x 20.5 | PASS |
| wordmark centre - bar centre (x, y) | 4.7, -0.45 | 4.7, -0.45 | PASS |
| .ventus-main font-size | 14px | 14px | PASS |
| .ventus-main font-weight | 800 | 800 | PASS |
| .ventus-main letter-spacing | 2.8px | 2.8px | PASS |
| .ventus-main text-transform | uppercase | uppercase | PASS |
| .ventus-main color | rgb(255, 255, 255) | rgb(255, 255, 255) | PASS |
| .ventus-main font-family | -apple-system, sans-serif | -apple-system, sans-serif | PASS |
| .ventus-main line-height | 14.7px | 14.7px | PASS |
| .ventus-sub font-size | 5.5px | 5.5px | PASS |
| .ventus-sub letter-spacing | 0.77px | 0.77px | PASS |
| .ventus-sub text-transform | uppercase | uppercase | PASS |
| .ventus-sub color | rgb(136, 136, 136) | rgb(136, 136, 136) | PASS |
| .ventus-sub line-height | 5.775px | 5.775px | PASS |
| .ventus-main box w x h | 75.7 x 14.7 | 75.7 x 14.7 | PASS |
| .ventus-sub box w x h | 90 x 5.8 | 90 x 5.8 | PASS |
| lockup flanks shown | 3 | 3 | PASS |
| wordmark is a link | false | false | PASS |
| horizontal scroll | false | false | PASS |
| panel position (phone fixed / wide absolute) | absolute | absolute | PASS |

### 360x740

| measure | Kuiper | GridAtlas | pass |
|---|---|---|---|
| bar height px | 34 | 34 | PASS |
| bar background | rgba(4, 10, 13, 0.95) | rgba(4, 10, 13, 0.95) | PASS |
| bar rule | 1px solid rgba(80, 220, 240, 0.3) | 1px solid rgba(80, 220, 240, 0.3) | PASS |
| bar blur | blur(7px) | blur(7px) | PASS |
| bar font | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title rows | 1 | 1 | PASS |
| title names | FILE EDIT VIEW SCOPE WAFER ABOUT | FILE EDIT VIEW SCOPE GRID ABOUT | PASS |
| title height px | 34 | 34 | PASS |
| title fontSize | 9px | 9px | PASS |
| title letterSpacing | 0.225px | 0.225px | PASS |
| title padding | 0px 6px | 0px 6px | PASS |
| title color | rgb(207, 238, 246) | rgb(207, 238, 246) | PASS |
| title fontFamily | ui-monospace, SFMono-Regular, Menlo, monospace | ui-monospace, SFMono-Regular, Menlo, monospace | PASS |
| title textTransform | uppercase | uppercase | PASS |
| title width FILE | 34.6 | 34.6 | PASS |
| title width EDIT | 34.6 | 34.6 | PASS |
| title width VIEW | 34.6 | 34.6 | PASS |
| title width SCOPE | 40.2 | 40.2 | PASS |
| title width ABOUT | 40.2 | 40.2 | PASS |
| brand slot w x h | 77.6 x 33 | 77.6 x 33 | PASS |
| wordmark box w x h | 73.6 x 16.3 | 73.6 x 16.3 | PASS |
| wordmark centre - bar centre (x, y) | 0, -0.45 | 0, -0.45 | PASS |
| .ventus-main font-size | 11px | 11px | PASS |
| .ventus-main font-weight | 800 | 800 | PASS |
| .ventus-main letter-spacing | 1.54px | 1.54px | PASS |
| .ventus-main text-transform | uppercase | uppercase | PASS |
| .ventus-main color | rgb(255, 255, 255) | rgb(255, 255, 255) | PASS |
| .ventus-main font-family | -apple-system, sans-serif | -apple-system, sans-serif | PASS |
| .ventus-main line-height | 11.55px | 11.55px | PASS |
| .ventus-sub font-size | 4.5px | 4.5px | PASS |
| .ventus-sub letter-spacing | 0.63px | 0.63px | PASS |
| .ventus-sub text-transform | uppercase | uppercase | PASS |
| .ventus-sub color | rgb(136, 136, 136) | rgb(136, 136, 136) | PASS |
| .ventus-sub line-height | 4.725px | 4.725px | PASS |
| .ventus-main box w x h | 55.5 x 11.5 | 55.5 x 11.5 | PASS |
| .ventus-sub box w x h | 73.6 x 4.7 | 73.6 x 4.7 | PASS |
| lockup flanks shown | 1 | 1 | PASS |
| wordmark is a link | false | false | PASS |
| horizontal scroll | false | false | PASS |
| panel position (phone fixed / wide absolute) | fixed | fixed | PASS |

## Console and page errors (A7)

None on any device.

## Images (img/)

- `img/01-pixel7-rest.png` 118 KB: Kuiper on Pixel 7 at rest: one bar, the wordmark, nothing else over the wafer
- `img/02-galaxy-s24-view-open.png` 81 KB: Galaxy S24 (360 px): the VIEW panel open under the bar
- `img/04-pixel7-next-line.png` 26 KB: Pixel 7: VIEW → "next verified line", the spark between the bar and the card
- `img/03-bars-kuiper-over-gridatlas.png` 76 KB: the top 50 px of both shells on every device, Kuiper over GridAtlas, same scale

## Method notes

- A8 removes `#keys` after the engine has run (a module script right after the engine's, and at DOMContentLoaded), not from the HTML: removed from the HTML, the engine itself throws at `index.html:600` (`document.getElementById('keys').addEventListener`) before it creates Edition 4's `#bar`, so "Edition 4's bar still clickable" could never hold. Measured on the Edition 4 copy at kuiper-belt `editions/202611012135/index.html:600`.
- The back gesture is `page.goBack()`: on Android Chrome the system back gesture is history back. A panel that pushes no history entry makes back leave the page; the test records that as FAIL (`stayedOnPage`), reloads and continues.
- Box tolerance is 1 px on width and height, as ROADMAP step 1 A3 states; positions differ by design (GridAtlas's bar sits at (5,5) inside its 1 px bordered map container, the Kuiper's at (0,0) on the window), so centres are compared relative to each bar.
- The module is read once when the run starts and served from those bytes for every device (a `page.route` on its URL), so the sha256 at the top of this file is the one every cell measured, even while the file is being edited; `node --check` runs on the same bytes.
- Console errors from external hosts the sandbox proxy refuses are listed separately and not counted; every local 4xx/5xx and every page error is counted.
- A3 centre, measured adjustment (builder FINDING and lead, PLAN.md 22:12; tester agreed and added the slot check): above 700 px GridAtlas's own wordmark sits +4.66 px right of its bar centre because the SYSTEM TIME flank (66 px) is wider than 2050 TARGET (57 px) (team-1 table: brand (599.7,12.3) 90×20.5 at 1280, centre 644.7 vs 640). "Centred within 1 px" and "box within 1 px of GridAtlas" cannot both hold there with the flanks copied, so A3 passes centreX when the wordmark is centred within 1 px OR sits at GridAtlas's live offset within 1 px, and additionally requires `.gm-brand-slot` centred within 1 px on every device.
- A2b waits 300 ms after the 1.3× scale before measuring (a real font-scale change relayouts first; lead edit, kept). A5 `top ≥ bar bottom` is strict (0.5 px): the first run found the landscape panels at y=35 on the bar's 1 px rule (GridAtlas's `top:100%` does the same inside its own bar); the module now uses `top:calc(100% + 1px)`.
- A4 accepts the find box absent at rest (lead's measured decision, PLAN.md: Edition 4's keydown ignores every key while `#goto` is shown, index.html:613); if it is shown at rest it must sit at bar bottom + 36 px, right-aligned, 44 px tall on touch.
- Pixel 7 landscape is 863 px wide, over GridAtlas's 700 px phone rule, so both shells show the 36 px desktop bar and the full lockup there (team-1/STEPS.md:84-86); the expected box is 90.0×20.5.
