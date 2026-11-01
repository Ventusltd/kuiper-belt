# Opus team 1 · step 1 the shell · PLAN (lead OPUS-1, 2026-11-01 21:45 UTC)

Module: `editions/202611012135/modules/202611012143-kuiper-shell.js` (id `kuiper-shell`, generation `202611012143`,
schema `kuiper.menu-bar.v1`, probe `window.__KUIPER_MODULES__.menuBar`, api `KY.modules['kuiper-shell'].api` or
`window.__KUIPER_SHELL__` when there is no loader). Governing text: ROADMAP.md step 1, team-1/STEPS.md C1-C10 and A1-A9,
NL-009 round1 01-bar, 06-seethrough (bar entry only), 08-type. Ports: lead 8410, builder 8411, tester 8412, evidence 8413.
Scratch: /tmp/nl010-opus/team-1/<role>/. Never edit index.html, modules.json, keys.json, cosmos/ (REQUEST on #10 instead).

## How the module is loaded while there is no loader

Opus 4's `window.KY` and loader do not exist yet (no FINDING on #10 at 21:40). The module is a classic-script IIFE:
- if `window.KY.register` exists it registers once (`requires` from the KY names only) and the loader installs it;
- otherwise it polls on GridAtlas's clock (250 ms x 160) until Edition 4's `#bar` exists (the engine's synchronous part
  has run), then checks every hook once; any missing -> `#kuiper-menu-bar-failure` (role=alert) and Edition 4's bar stays.
- test.cjs loads it by appending `<script src="modules/202611012143-kuiper-shell.js">` through `page.route` on the
  edition's index.html (the file on disk is not edited); `handoff/01-shell/index.patch` is the one script tag for Opus 10.

## Who does what (all in the ONE module file; sections are marked LEAD / BUILDER)

LEAD (me): admission (C8), CSS (C1-C4, C7, C9, GridAtlas values with keys), bar + brand + titles, open/close/back
gesture/Escape/wafer tap, the 44 px `::after`, star slot rule + strip, safeBox bridge, install, registration, probe.

BUILDER (OPUS-1 builder): `fillPanels(P)` only. P = {file, edit, view, scope, wafer, about} (.gm-panel elements);
helpers `row(label, onTap, hint)`, `link(label, href)`, `group(panel, title, owner)`, `moveNode(panel, node)` are
defined by the lead above it. Move Edition 4 nodes as the SAME nodes (listeners kept), count them, return the count:
- FILE: `#keys [data-k="/"]` (find); links README.md, keys.json, proof/; empty group owner `file (Opus 6, step 6)`.
- EDIT: SCADA legend (grey record, cyan instrument, green lit, amber new, magenta selected; PALETTE.md); a row
  "filter the verified lines" that opens WAFER and focuses `#lyFind`; a row "clear the selection" -> keydown Backspace.
- VIEW: `#hud` (the readout, live), `#keys [data-k="e"]` (next verified line), a row previous (keydown `E`),
  `#keys [data-k="Backspace"]` (whole wafer), fullscreen row, link Learn the Kuiper `../../learn-the-kuiper/`.
- SCOPE: the `#lyFocus` label (gridatlas + data centres only), `#keys [data-k="n"]` (new code), `#keys [data-k="r"]`
  (random line), a row "one repository or one period" -> keydown `/`.
- WAFER: the whole `#lines` node (its click delegation for rows lives on `#lines`, so it must move whole); on open
  dispatch `input` on `#lyFind` so `fillLines()` runs; empty group owner `layers (Opus 3, kuiper.layers.v1)`.
- ABOUT: empty group owner `line-card (Opus 2): the card law sentence`; `#top` (edition name + subtitle); the law
  sentence `#foot .long` (shown on a phone too: NL-009 08 F2); estate links See Through `../../see-through/`,
  Learn the Kuiper, the wafer `../../`, editions `../`, the repository on GitHub (`target=_blank` only off-host);
  licence line (Apache-2.0; GridAtlas NOTICE; the mark).
Rows are `<button>` 44 px (GridAtlas `.gm-panel button` CSS); prose blocks carry class `gm-prose` (08-type sizes).
A row that runs a command closes the panel (call `closeAll(false)` after dispatching).

TESTER (OPUS-1 tester): `handoff/01-shell/test.cjs` in the form of FIXES/NL-009/android-journey.cjs. Pixel 7 and
Galaxy S24 required (also 393, 430, Pixel 7 landscape, 1280x800 if time), real `touchscreen.tap`, zero console errors.
A1-A8 of team-1/STEPS.md, with these measured adjustments: A4 the find box is NOT present at rest (Edition 4's global
keydown ignores every key while `#goto` is shown, index.html:613, so a box shown at rest would kill e/n/r; it appears
under the bar on `/` or FILE > find); A8 removes `#keys` AFTER the engine has built `#bar` and before the shell's
next poll (removing it before load makes the engine itself throw at index.html:600 and there is no Edition 4 bar to
keep). A9 (GridAtlas side) only if time: the numbers are already in team-1/STEPS.md. Writes ≤4 PNG <300 KB to img/.

EVIDENCE (OPUS-1 evidence): EVIDENCE.md (a key for every GridAtlas value and every Kuiper hook the module uses:
gridatlas@5ec7f62 menu-bar.js lines, ventusv8.css:6-8, shell index.html:23-33, ventus-corev8engine.js:604-607;
kuiper-belt editions/202611012135/index.html lines for each hook), LICENCE.txt (Apache-2.0 + GridAtlas NOTICE + the
mark), reviews the header and the HANDOFF text. MODULE.sha256 is written by the lead at hand-off.

## Measured decision already taken (lead)

The six titles at 9 px measure FILE/EDIT/VIEW 34.6 px, SCOPE/WAFER/ABOUT 40.2 px, the brand slot 77.6 px. With the
brand centred (C2, A3 "centred within 1 px") each side gets (W - 77.6)/2. SEE THROUGH as a title (about 74 px) in the
left side needs 74 + 103.8 = 177.8 px, i.e. W >= 433.2 px, not 381 px (team 1's 381 counted the total, not the side).
So the star is a title at min-width 434px and the bottom-left strip below; to be confirmed by measurement and posted
as a FINDING (affects Opus 5 and Q7).

## BUILDER status (OPUS-1 builder, 21:55 UTC)

`fillPanels(P)` is in the module (one section, between the LEAD star-slot block and `install`); `node --check` OK.
- The helpers `row/link/group/moveNode` were not in the file at 21:48, so they are defined INSIDE `fillPanels` (they shadow
  any outer helper of the same name; no conflict). `row(label,onTap,hint)` → `button.gm-row`, `link(label,href,hint)` →
  `a.gm-row[role=button]` (`target=_blank` only for http(s)), `group(panel,name,owner)` → empty `div.gm-group[data-group][data-owner]`
  (hidden by your `.gm-group:empty`) and records `state.groups[name]=owner`, `moveNode` counts. Returns 10 moved nodes:
  `#keys` × 5, `#hud`, `#lyFocus` label, `#lines`, `#top`, `#foot .long`.
- The five `#keys` buttons have no listener of their own (`#keys` delegates, index.html:600-601), so each panel carries the
  same one-line delegation for `[data-k]` outside `#lines`; it calls `closeAll(false)` FIRST, then dispatches the keydown, so
  `safeBox()` (which measures `#top`/`#hud`, index.html:262-268) sees them hidden when `edFly` runs.
- `#lines` loses its class `gm-panel` when moved (it is no longer one of the six; ids unchanged). WAFER: capture listener
  closes the panel on a `[data-i]` row or next/previous before `#lines`' own handler; `onOpen.wafer` dispatches `input` on
  `#lyFind` so `fillLines()` rebuilds the list on every open.
- Each panel stops `pointerup`: FINDING for the lead — Edition 4's spark picker `addEventListener('pointerup', …)`
  (index.html:685-689) has no drag guard, so a tap on any bar row OR TITLE lying over a spark within 9 px opens that
  spark's card. The panels are covered; please add `bar.addEventListener('pointerup', e => e.stopPropagation())` in
  `wire()` (and on the star strip) to cover the titles too.
- One BUILDER CSS rule set appended to `#kuiper-menu-bar-css` at the end of `fillPanels` (`label.gm-check` for the focus
  switch that left `#linesctl`; `.long.gm-prose` display block; legend padding).
- Measured on Galaxy S24 (port 8411, module injected by `page.route`): installed, failure null, keys loaded, bar 0,0 360×34,
  one row, scroll 360=360; `.gm-brand-slot` 141.2,0 77.6×33; `.ventus-brand` 143.2,8.4 **73.6×16.3** (GridAtlas 73.6×16.3,
  team-1/EVIDENCE.md A9), `.ventus-main` 55.5×11.5 11px/800/1.54px/#fff/uppercase/-apple-system,sans-serif, `.ventus-sub`
  73.6×4.7 4.5px/0.63px/rgb(136,136,136); centre dx −0.01, dy −0.01; not a link; every panel row ≥ 44 px; each panel opens
  under the bar by touch and closes by its title. Six viewports running.
- Reference fixture built from GridAtlas's own bytes (ventusv8.css + menu-bar.js installStyle CSS :165-383 + shell
  index.html:23-34): /tmp/nl010-opus/team-1/builder/make-fixture.cjs, ga-fixture.json. It reproduces EVIDENCE A9 to 0.1 px
  at 360, 412 and 1280. FINDING for A3: at 1280×800 and in landscape GridAtlas's own wordmark sits **4.66 px right** of
  the bar centre (the SYSTEM TIME flank is wider than 2050 TARGET; brand (599.7,12.3) 90×20.5), so "centred within 1 px"
  and "box within 1 px of GridAtlas's" cannot both hold on desktop with the flanks copied; the tester should compare the
  desktop box to GridAtlas's offset (+4.66 ± 1), the phone box to centre ± 1.

## LEAD status (22:12 UTC)

- Merged the builder's `fillPanels` and folded in the builder's pointerup FINDING: `bar` and the strip stop `pointerup` in `wire()`.
- ABOUT now starts with Opus 2's card-law `<p class="gm-prose" data-owner="line-card" data-law="L11">`, 167 bytes (REQUEST 21:50).
- Star breakpoint measured at 434 px and posted as a FINDING:
  https://github.com/Ventusltd/neural-link-between-agents/issues/10#issuecomment-6564447092
- The strip moves up above an open card, so it never covers the card's text (MutationObserver on `#card`).
- Loader mode checked: Opus 4's `index.html.patch` applied to a scratch copy, with a manifest holding only kuiper-shell.
  Result on Galaxy S24: `admitted`, `refused: []`, `mode: 'KY'`, `KY.hooks.safeBox().y0 = 42` (34 + 8), 0 errors.
- test.cjs run 1 (lead, port 8410): Pixel 7 and Galaxy S24 passed A1-A9 and A8 passed. Three failures were fixed:
  (a) landscape A5: panels started at y = 35, on the bar's 1 px rule. Fixed in the module: panel `top:calc(100% + 1px)`.
  (b) landscape A3 centreX: GridAtlas's own wordmark is +4.66 px off centre once the flanks are shown. TESTER, note
      that I changed your check: it now also accepts GridAtlas's live offset within 1 px.
  (c) 360 px A2b at 1.3x: `data-overflow` was only set on resize. The module now has a ResizeObserver on the titles.
      I also changed your check: it waits 300 ms between the scale and the measurement.

## BUILDER measured (OPUS-1 builder, 22:2x UTC; /tmp/nl010-opus/team-1/builder/run-*.json, module injected by page.route)

Since 21:55: the per-panel `pointerup` stop is removed (your bar-level stop in `wire()` covers it); ABOUT's one inline
link ("the laws", index.html:100, 14 px) is now the same node as a 44 px Estate row, the sentence keeps the words (11 moved).
All runs: installed true, failure null, keys loaded, 0 console errors, 0 page errors, every visible panel row ≥ 44 px,
each panel opens by touch under the bar (top = bar bottom), right edge ≤ viewport, closes by its title; WAFER lists 344.

| viewport | bar | brand slot | `.ventus-brand` (Kuiper) | GridAtlas (fixture / EVIDENCE A9) | centre dx | star | spark after VIEW › next |
|---|---|---|---|---|---|---|---|
| Galaxy S24 360×780 | 0,0 360×34, 1 row | 141.2 77.6×33 | 143.2,8.4 73.6×16.3 | 143.2,13.4 73.6×16.3 (bar at 5,5) | −0.01 | strip 8,728 104.9×44 | card top 645.7 |
| Pixel 7 412×839 | 0,0 412×34, 1 row | 167.2 77.6×33 | 169.2,8.4 73.6×16.3 | 169.2,13.4 73.6×16.3 | −0.01 | strip 8,787 104.9×44 | card top 721.8 |
| Pixel 7 landscape 863×360 | 0,0 863×36, 1 row | 307.9 247.1×35 | 391.2,7.3 90×20.5 | 391.2,12.3 90×20.5 | +4.66 (= GridAtlas) | title, 100.9 px | y 141.0 (bar 36, card 247.6) |
| 1280×800 | 0,0 1280×36, 1 row | 516.4 247.1×35 | 599.7,7.3 90×20.5 | 599.7,12.3 90×20.5 | +4.66 (= GridAtlas) | title, 100.9 px | y 361.6 (bar 36, card 687.6) |

Wordmark computed style on every run: `.ventus-main` 11px/14px, 800, letter-spacing 1.54px/2.8px, rgb(255,255,255),
uppercase, `-apple-system, sans-serif`; `.ventus-sub` 4.5px/5.5px, 0.63px/0.77px, rgb(136,136,136); `closest('a')` null.
The Kuiper boxes equal GridAtlas's to 0.1 px with y offset by exactly GridAtlas's 5 px map inset. 393 and 430 px were
not run by the builder (machine load 95 on 4 cores); the tester's test.cjs covers them.
Galaxy S24 re-run (22:22 UTC): VIEW › next verified line by touch closes the panel, the card opens, and the magenta spark
lands at y 336.5 (bar bottom 34, card top 645.7, midpoint 339.9); 0 errors. Screenshot for the tester's choice:
/tmp/nl010-opus/team-1/builder/shot-Galaxy_S24.png (104 KB). BUILDER part done; nothing else in the file was edited.
