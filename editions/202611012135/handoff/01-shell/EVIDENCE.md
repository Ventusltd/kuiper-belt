# EVIDENCE: Opus team 1, step 1 "the shell contract"

Evidence officer: OPUS-1 evidence. Channel: https://github.com/Ventusltd/neural-link-between-agents/issues/10. Law: no
claim without a key; a key is `repo@sha path:line`. Governing text: neural-link FIXES/NL-010/ROADMAP.md step 1, R2, R7,
Q7, Q8; FIXES/NL-010/team-1/STEPS.md C1-C10 and team-1/EVIDENCE.md (FABLE-T1B), whose keys were re-read here, not copied.

## 0. Heads every key is written against

| repo | sha | how read |
|---|---|---|
| gridatlas | `5ec7f62f213e2d20a02e86427daa182c0f38e4a4` (`5ec7f62`) | `git log -1` in /home/user/estate/gridatlas (branch preview/202610312138-gridatlas-v9.188; the shell files are identical on main, team-1/EVIDENCE.md:9) |
| kuiper-belt | `96736f55c2137defcf02c898f8f2b0d04374d74b` (`96736f5`) | `git log -1` on branch edition/202611012135, the Edition 5 skeleton (the Edition 4 copy) |
| kuiper-belt, Edition 4 | `018b46aed50f28f7b1882a0dcaba6593ce522beb` (`018b46a`) | the roadmap's head |
| the module under review | `editions/202611012135/modules/202611012143-kuiper-shell.js`, working tree (not committed; the harness commits) | line numbers below are the module's as read at the time in section 6; MODULE.sha256 is the hash of record |

`editions/202611012135/index.html` differs from Edition 4's only on lines 6, 96, 634, 641, 699 and 745, each the word
"4" → "5" (`diff editions/202611012027/index.html editions/202611012135/index.html`), so every Edition 4 line number
in team-1/EVIDENCE.md B1-B3 holds at `96736f5` unchanged.

**index.html is moving under Opus 10 (22:35 UTC).** Every Kuiper key in this file is pinned at `96736f5`. At the
harness's later commit `934a4ca14fd4dc989b852e91e3b6b01bdecadb55` the integrator's perf patch (`keys-min.json`, +4 lines at
:627-631) shifts every line from :628 down by 4 (`loadEdition` :632, `edCard` :659, `edFly` :680, `edNext` :686, the spark
picker :689, `const bar` :702, `PANELS` :714, `setPanel` :718, the `safeBox` wrap :730); lines up to :600 (`#keys`
delegation, the engine's `pointerup` :590, `<script type="module">` :102) are unchanged; the working tree adds a
further `edBand` block at :679 ff. The module's own `IX:` comments should say `@96736f5` so they stay true.

Copy check: the live GridAtlas composes the menu bar from the cartridge, not the module file
(gridatlas@5ec7f62 atlas/current.json:566-573, id `substation-intelligence`, sha256 `d94b0de50deddac7…`, re-hashed here
with `sha256sum`: identical). `diff` of module lines 160-385 (the whole style block) against cartridge lines 4509-4734 is
empty; module 27-35 = cartridge 4376-4384; module 480-583 (`buildBar`, keyboard) = cartridge 4829-4932; module 1752-1797
(`loudFailure`, `start`) = cartridge 6106-6151. So every module key below has a live twin at +4349 lines (style,
constants, buildBar) or +4354 (failure and retry). The one known difference (the search bar move, module :1662 vs
cartridge :6011-6016) is not copied by the shell.

## 1. GridAtlas lessons the module copies (each with its key; `M` = gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js, `L` = the live cartridge atlas/cartridges/202609062358-substation-intelligence-v9-63.js)

### 1a. Bar geometry and chrome (C1, C2, C4, C7)

| lesson | GridAtlas value, verbatim | key | live twin | Kuiper departure, stated |
|---|---|---|---|---|
| the bar | `position:absolute;top:0;left:0;right:0;height:36px;z-index:10020;display:flex;align-items:stretch;gap:0;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);box-sizing:border-box;background:rgba(4,10,13,.95);border-bottom:1px solid rgba(80,220,240,.3);font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);isolation:isolate;pointer-events:auto` | M:166-172 | L:4515-4521 | `position:fixed` at the window's top, because the Kuiper has no `.map-container` and its canvas is the window (`canvas{position:fixed;inset:0}`, kuiper-belt@96736f5 editions/202611012135/index.html:13); C1 |
| the bar on a phone | `@media(max-width:700px){#…{height:34px}` | M:372 | L:4721 | none |
| a title | `.gm-title{appearance:none;border:0;background:transparent;color:#cfeef6;min-height:36px;padding:0 11px;cursor:pointer;font:inherit;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}` | M:174-176 | L:4523-4525 | none on screen; a 44 px `::after` hit box on a coarse pointer, removed while a panel is open (C4, NL-009 01-bar F2) |
| title hover / open | `.gm-title:hover,…:focus-visible,.gm-menu.gm-open>.gm-title{background:rgba(80,220,240,.16);color:#fff}` | M:177-178 | L:4526-4527 | hover only under `(hover:hover)` if the lead folds NL-009 01-bar F4 (sticky hover after a tap) |
| focus ring | `outline:2px solid #6bebff;outline-offset:-2px` | M:179-180 | L:4528-4529 | none |
| a title on a phone | `.gm-title{min-height:34px;padding:0 6px;font-size:9px;letter-spacing:.025em}` | M:373 | L:4722 | none |
| three zones | `.gm-side{display:flex;align-items:stretch;flex:1 1 0;min-width:0}`, left `justify-content:flex-start`, right `flex-end` | M:181-183 | L:4530-4532 | none |
| the zones are built | `nav#gridatlas-menu-bar[aria-label="Atlas menu"]` = `.gm-side-left` + `.gm-brand-slot` + `.gm-side-right`, "Fusing the brand into the CENTRE of the same 36px strip … no extra row and therefore no map height stolen on a phone" | M:480-503 | L:4829-4852 | id `kuiper-menu-bar`, label "Kuiper menu" (C1) |
| a title and its panel | `button.gm-title` `type=button`, `aria-haspopup=menu`, `aria-expanded=false`, `aria-controls=<panel id>`; `div.gm-panel` `hidden` | M:505-520 | L:4854-4869 | none |
| left three, right three | `(index < 3 ? left : right).appendChild(menu)` | M:544 | L:4893 | none (the star entry is extra, see 1e) |
| a panel | `.gm-panel{position:absolute;top:100%;left:0;min-width:240px;max-width:min(92vw,420px);max-height:min(72dvh,620px);overflow:auto;overscroll-behavior:contain;padding:6px;background:rgba(4,10,13,.98);border:1px solid rgba(80,220,240,.32);border-top:0;box-shadow:0 12px 34px rgba(0,0,0,.68);box-sizing:border-box}`; `[hidden]{display:none!important}` | M:206-211 | L:4555-4560 | none |
| right-group panels | `.gm-side-right .gm-panel{left:auto;right:0}` | M:219 | L:4568 | none |
| a command row | `.gm-panel button,.gm-panel [role="button"]{display:flex;align-items:center;width:100%;min-height:44px;…;padding:7px 10px;…;color:#cfeef6;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:left;letter-spacing:.03em;text-transform:none}`; hover `rgba(80,220,240,.14)` `#fff` | M:220-227 | L:4569-4576 | none |
| a group heading | `.gm-layer-group{margin:5px 0 2px;padding:6px 8px 3px;border-top:1px solid #19343b;color:#6fa2ae;font-size:10px;letter-spacing:.08em;text-transform:uppercase}` | M:245-247 | L:4594-4596 | none |
| a layer row (WAFER) | `.gm-layer{…min-height:44px;padding:7px 9px…}`; the `<input>` `position:absolute;inset:0;opacity:0`; `.gm-layer-box` 20×20, checked `#4fd7ee` | M:253-271 | L:4602-4620 | the rows are Opus 3's (step 3); the shell leaves the WAFER group empty and named |
| panels on a phone | `.gm-panel{position:fixed;top:34px;left:4px!important;right:4px!important;width:auto;max-width:none;max-height:calc(100dvh - 40px);padding-bottom:calc(6px + env(safe-area-inset-bottom))}` | M:379-381 | L:4728-4730 | none |
| one open at a time | `openMenu()`: `closeAll()` first, a second tap on the open title closes | M:468-479 | — | adds the Android back gesture (`history.pushState`, C7, NL-009 01-bar) |
| closed at rest | `closeAll()`, `state.closed_at_rest = true` | M:405-416 | — | none |
| keyboard | Escape closes; ArrowLeft/Right move; Home/End; ArrowDown opens and focuses the first control | M:554-583 | L:4903-4932 | none |
| the panel stays inside the viewport | `clampPanel()` (margin 4 px) | M:447-466 | — | to be confirmed in section 6 |
| the bar's height is read, not assumed | `syncAttribClearance`: `bar.getBoundingClientRect().height` | M:387-402 | — | the Kuiper's equivalent is `safeBox()` reading the bar (index.html:726) |

### 1b. The wordmark (C3)

| lesson | GridAtlas value, verbatim | key | live twin |
|---|---|---|---|
| the words, as text, not an image | `<div class="ventus-brand"><div class="ventus-main">Ventus</div><div class="ventus-sub">Cables &amp; Connectivity&reg;</div></div>` inside `.hud-header`, flanked by SYSTEM TIME (`#clock`, `#date`) and 2050 TARGET (`#days`, `color:#ff9d00`) | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/index.html:23-34 (the brand :29-32) | the same shell, `current.json:9-13` |
| the face, weight, case and colours | `.ventus-main{font-family:-apple-system,sans-serif;font-size:17px;font-weight:800;color:#fff;letter-spacing:5px;text-transform:uppercase;margin-bottom:2px}`; `.ventus-sub{font-family:-apple-system,sans-serif;font-size:6.5px;color:#888;letter-spacing:2px;text-transform:uppercase}` | …/ventusv8.css:7-8 | — |
| the slot | `.gm-brand-slot{flex:0 1 auto;min-width:0;max-width:64%;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0 6px;text-align:center}` | M:192-194 | L:4541-4543 |
| the fused header | `.gm-brand-slot .hud-header{display:flex!important;position:static!important;width:auto!important;align-items:center;justify-content:center;gap:11px;margin:0!important;padding:0!important;background:none!important;border:0!important}`; children `flex:0 0 auto;line-height:1.05`; `small{font-size:6.5px;white-space:nowrap}`; `.hud-val{font-size:10.5px;text-shadow:none}` | M:195-202 | L:4544-4551 |
| the wordmark in the bar | `.ventus-main{font-size:14px;font-weight:800;letter-spacing:.2em;margin:0;color:#fff}`; `.ventus-sub{font-size:5.5px;letter-spacing:.14em}` | M:203-205 | L:4552-4554 |
| why it is the hero | "'The VENTUS logo is the best part' -- the architect's own words. It is the hero of this strip" | M:184-191 | L:4533-4540 |
| on a phone | `.gm-brand-slot{max-width:48%;padding:0 2px}`; the flanks `.hud-header>div:first-child,>div:last-child{display:none}`; `.ventus-main{font-size:11px;letter-spacing:.14em}`; `.ventus-sub{font-size:4.5px}` | M:374-378 | L:4723-4727 |
| not a link | a `div` in no `a`, no handler (shell index.html:29-32); measured `insideAnchor:false` | team-1/EVIDENCE.md A5, A9 |
| one identity surface | the v8 letterhead is hidden once the bar hosts the brand: `.gridatlas-menu-hosted #fs-letterhead{display:none!important}` | M:371 | L:4720 |
| the box to match (A3) | `.hud-header` in the bar 73.6×16.3 px at 360 px and on Pixel 7; `.ventus-main` 55.5×11.5, `.ventus-sub` 73.6×4.7; 90.0×20.5 at 1280×800 | team-1/EVIDENCE.md A9 rows 360×780 and Pixel 7 (`/tmp/nl010/team-1/B/ga-*.json`); team-1/STEPS.md C3, A3 |
| no logo file exists | `find gridatlas -iname '*logo*'` returns nothing outside node_modules (re-run here: empty) | team-1/EVIDENCE.md A2 negative findings |

### 1c. The menu names (C5, R2)

| lesson | key |
|---|---|
| `var MENUS = ['File', 'Edit', 'View', 'Scope', 'Grid', 'About'];` | M:31 (L:4380) |
| "The six names are the architect's current vocabulary" | M:19-20 |
| what each GridAtlas menu holds (File export/modules; Edit status colours; View fullscreen/studies; Scope measuring tools; Grid the 63 layer switches; About ledger, estate links, attribution) | M:1662-1669, :1350, :641, :777, :1428-1488, :1557, :1580-1611; team-1/EVIDENCE.md A3 table |
| GRID → WAFER, the one renamed word (five letters like SCOPE, 40.2 px at 9 px) | ROADMAP R2; team-1/STEPS.md C5, C9 |

### 1d. The admission rule (C8)

| lesson | key | live twin |
|---|---|---|
| "it installs nothing until … all present and uniquely identified … A missing control leaves the old interface reachable and is published as a failure instead of being silently skipped" | M:8-18 | L:4357-4367 |
| the retry clock: `MAX_TRIES = 160` × 250 ms = 40 s | M:35, M:1787-1796 | L:4384, L:6141-6150 |
| `required()` collects what is missing | M:141-159 | L:4490-4508 |
| `install()` refuses while anything is missing: `if (ready.missing.length) { state.waiting_for = …; return false; }` | M:1647-1656 | L:5996-6005 |
| loud failure: `console.error('[GRIDATLAS MENU] ' + state.failure)` and a `role=alert` strip "… Original controls remain available." at `position:fixed;left:8px;right:8px;top:8px;z-index:10030` | M:1752-1768 | L:6106-6122 |
| `start()` refuses a partial DOM, installs now or retries | M:1770-1797 | L:6124-6151 |

### 1e. The star slot's phone form (R7)

| lesson | key |
|---|---|
| GridAtlas keeps its two most-used controls (GRID, SUBS) as 44 px chips on the map at every width; measured 65.7×44 at (15,697) at 360 px | M:1521-1552 (`chipStaysOnMap`, returns true); team-1/EVIDENCE.md A9 |
| the rule chosen: title at `min-width:381px`, bottom-left 44 px strip at `max-width:380px`; step 5 changes words and target, not the rule | ROADMAP R7, Q7; team-1/STEPS.md C5 |

## 2. Kuiper hooks the module attaches to (kuiper-belt@96736f5 editions/202611012135/index.html unless named)

The engine and the edition layer are ONE `<script type="module">` (:102 to :751). Their top-level `function`s and
`const`s are module-scoped, not properties of `window` (`grep -n 'window\.' index.html` finds only `window.__selftest`,
:235, :451, :466, :510, :550). A separate file therefore reaches the engine only through (a) the DOM, (b) the
`window.KY` hook table that Opus team 4 adds (FINDING https://github.com/Ventusltd/neural-link-between-agents/issues/10#issuecomment-6564299733;
editions/202611012135/handoff/04-loader/HOOKS.md), or (c) the engine's own listeners on nodes moved as the same nodes.

| hook | key | how the shell reaches it |
|---|---|---|
| `#c`, `#o` (the two canvases) | :88 | DOM; also `KY.hooks.cv`, `ov` (:121) |
| `#top` (`#big`, `#sub`) | :89 | DOM; `KY.hooks.big`, `sub` (:123-124) |
| `#hud` | :90 | DOM; `KY.hooks.hud` (:123) |
| `#card` | :91 | DOM; `KY.hooks.card` (:124) |
| `#goto`, `#gotoin` (the `/` box) | :92 | DOM; `KY.hooks.gbox`, `gin` (:604) |
| `#foot` | :93-101 | DOM |
| `#keys` and its five `data-k` buttons n, r, /, e, Backspace | :94-95 | DOM; moved as the same nodes (their delegated listener stays the engine's) |
| Edition 4's `#bar` and `#barname` (left reachable on failure) | :698-704; CSS :58-63, :84 | DOM |
| `#lines` (`gm-panel`) with `#lyAll`, `#lyFocus`, next/previous `data-k`, `#lyFind`, `#lineslist` | :705-709 | DOM; their listeners at :729-734 stay attached to the moved nodes |
| `PANELS`, `placePanels()`, `setPanel()` | :710, :712, :714-720 | not global; `KY.panels.add/set/place` (HOOKS.md) |
| the three closers (bar click, Escape, wafer `pointerdown`) | :721-723 | not global; replaced by the shell's own closers (C7) |
| `safeBox()`, wrapped to start under Edition 4's bar | :262-268, wrap :726 (`bar.getBoundingClientRect().bottom + 8`) | `KY.hooks.safeBox` = the wrapped one (HOOKS.md row 8); see finding F3 |
| `draw()`, wrapped once by the edition | :332, :654 | `KY.draw.add(fn, order)` |
| `edCard(i)` | :655-666 | NOT in `KY.hooks`; reached only through the `#lines` rows (:733-734) and the `e`/`E` keys (:691-692) |
| `edFly(b)` (spark between the bar and the card) | :676-680 | NOT in `KY.hooks`; reached through `safeBox` (its `y0`) |
| `edNext(step)` | :682-683, wrapped :747-749 | NOT in `KY.hooks`; reached through `#keys [data-k="e"]` and the keydown table |
| `loadEdition()` and `edMeta.error` (the keys.json wait, C8) | :628-638 | NOT in `KY.hooks`; observable as `#big` text :634 or `KY.hooks.hud` text :641 |
| the wafer promise | HOOKS.md row 28 (resolves after :208; rejects with :207 / :240) | `KY.hooks.wafer` |
| CSS of Edition 4 that follows a moved node by its id | :64-70 (`#top,#hud,#foot,#lines{display:none; position:fixed; top:40px…}`), :73 (`#linesctl button`), :84-85 (phone) | the shell must override or leave these nodes in place; see section 6 |
| the module registration | `KY.register({schema:'kuiper.module.v1', id, generation, requires, provides, install, inspect})`; header line 1 `/* kuiper module <name>, generation <module-stamp> (UTC), <licence> */` | HOOKS.md; ROADMAP step 4 (4.3, 4.4) |

## 3. NL-009 round 1 patches the shell folds in (OPUS-BRIEF: 01 bar, 06 see-through, 08 type → team 1)

| patch | finding | key |
|---|---|---|
| 01-bar | F1 BLOCKER two rows at every phone width (75.1 px); F2 MAJOR 29 px titles; F3 no room for SEE THROUGH; F4 sticky hover; F5 safe-area insets; F6 `vh`/`dvh` | neural-link FIXES/NL-009/round1/01-bar.md:13, :18, :20, :43-46 |
| 06-seethrough | F1 BLOCKER See Through unreachable from Edition 4; F2 MAJOR the fifth entry's budget | FIXES/NL-009/round1/06-seethrough.md:11, :24 |
| 08-type | F1 MAJOR every phone text 11 px; F2 MAJOR COMMANDS panel shows no text on a phone; F3 MAJOR EDITION panel 88 words | FIXES/NL-009/round1/08-type.md:13, :22, :32 |

## 4. The header's licence line (checked against the module at 22:05 UTC, 554 lines)

| check | the rule | the module | verdict |
|---|---|---|---|
| line 1 parses | `/* kuiper module <name>, generation <module-stamp> (UTC), <licence> */` (ROADMAP step 4, 4.3; HOOKS.md); the loader reads it with `/^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),/` (editions/202611012135/modules/202611012145-loader.js:79) | `/* kuiper module kuiper-shell, generation 202611012143 (UTC), Apache-2.0 (kuiper-belt).` (kuiper-shell.js:1) | PASS: name `kuiper-shell`, stamp `202611012143` = file name = `GEN` (:33); the licence field reads `Apache-2.0 (kuiper-belt)` as in hello.js:1 and line-card.js:1. Cosmetic: line 1 ends in `.` and the comment closes at :30, not on line 1; the regex does not need the close. |
| the licence is right | kuiper-belt code is Apache-2.0 (kuiper-belt@96736f5 LICENSE:1-3; README.md:156-157); CERN-OHL-S v2 only where See Through code is copied (OPUS-BRIEF) | Apache-2.0; no See Through code in the file (the star entry is a link to `../../see-through/`, the default of NL-009 06, :315-321) | PASS |
| the NOTICE line (Apache-2.0 s.4(d)) | the GridAtlas NOTICE line in the module header (ROADMAP step 1 licence note) | :2-3 "copied from GridAtlas, Copyright 2026 Ventus Ltd, Apache-2.0 (gridatlas@5ec7f62 LICENSE:1-4, NOTICE:1-12), atlas/modules/202609031958-menu-bar.js" | PASS (LICENSE:1 is blank, :2-4 the title; NOTICE:1-12 "gridatlas / Copyright 2026 Ventus Ltd … Licensed under the Apache License, Version 2.0": both re-read) |
| the mark | Q8 wording "The VENTUS mark is used by Ventus Ltd, its owner. The Apache-2.0 licence of this code does not license the mark." | :4-5 "\"Ventus\" and \"Cables & Connectivity(R)\" are the mark of Ventus Ltd, used by its owner's instruction of 1 Nov 2026; the Apache-2.0 licence of this code does not license the mark (LICENSE:139, s.6)"; the ABOUT panel says the same in the page (:481-484) | PASS in substance (gridatlas LICENSE:139-142 is s.6 Trademarks, re-read). The words are not yet Q8's; Q8 is the owner's to confirm and NOTICE.md is Opus 10's. |
| requires list in the header | the header names the hooks (OPUS-BRIEF "requires list") | :7-11 DOM ids + `safeBox card hud big sub cv gbox gin redraw`; `KY.register` `requires` at the registration (:530-535) is the same nine names, each on Opus 4's admissible list (HOOKS.md: 28 hooks + `cam lit sel redraw draw panels`) | PASS. Note: `redraw` is `KY.redraw`, not a `KY.hooks` member; `missing()` checks the eight in `KY.hooks` only, which is right. |

The manifest record (Opus 10's `modules.json`) must carry `"licence": "Apache-2.0"`: the loader refuses an empty licence
(loader.js:71 `no licence`).

## 5. Measured by the evidence officer (independent run, not the tester's)

`/tmp/nl010-opus/team-1/evidence/measure.cjs` (output `measure.json` beside it): kuiper-belt root served on 8413, the
module injected with one `<script src>` before `</body>` by `page.route` (index.html on disk untouched), Playwright
Chromium with the harness flags, 7 s settle, at 22:00 UTC against the 41,578-byte module of 21:54.

| viewport | bar | titles (one row) | `.ventus-brand` box | `.ventus-main` | `.ventus-sub` | brand centre − viewport centre | star | errors |
|---|---|---|---|---|---|---|---|---|
| Galaxy S24 360×780 | 0,0 360×34 fixed; `rgba(4,10,13,.95)`; `1px solid rgba(80,220,240,.3)`; 11px mono | 6 at y 0; scroll 360 = 360 | 143.2,8.4 **73.6×16.3** | 55.5×11.5, 11px, 800, 1.54px, `rgb(255,255,255)`, uppercase, `-apple-system, sans-serif`, not in `a` | 73.6×4.7, 4.5px, 0.63px, `rgb(136,136,136)` | −0.01 | strip 8,728 104.9×44 | 0 |
| 393×852 | 393×34 | 6 at y 0; 393 = 393 | 73.6×16.3 | 55.5×11.5 | 73.6×4.7 | −0.01 | strip | 0 |
| Pixel 7 412×915 | 412×34 | 6 at y 0; 412 = 412 | 73.6×16.3 | 55.5×11.5 | 73.6×4.7 | −0.01 | strip | 0 |
| 430×932 | 430×34 | 6 at y 0 | 73.6×16.3 | 55.5×11.5 | 73.6×4.7 | −0.01 | strip | 0 |
| 434×932 | 434×34 | 7 at y 0 (SEE THROUGH 74.1 px first); left side 178.2 px holds 178 px | 73.6×16.3 | 55.5×11.5 | 73.6×4.7 | −0.01 | title | 0 |
| Pixel 7 landscape 863×360 | 863×36 | 7 at y 0, 11px, .55px, padding 11px | 391.2,7.3 **90×20.5** | 75.7×14.7, 14px, 2.8px | 90×5.8, 5.5px, 0.77px | +4.66 | title | 0 |
| 1280×800 | 1280×36 | 7 at y 0 | 599.7,7.3 **90×20.5** | 606.8,7.3 75.7×14.7 | 599.7,22 90×5.8 | +4.66 | title | 0 |

Against GridAtlas (team-1/EVIDENCE.md A9, measured on gridatlas@5ec7f62 with its own admission rule): `.hud-header`
73.6×16.3 at 360 and on Pixel 7, `.ventus-main` 55.5×11.5, `.ventus-sub` 73.6×4.7: **equal to 0.1 px**. At 1280×800
GridAtlas's `.ventus-main` is at (607,12) 76×15 and `.ventus-sub` (600,27) 90×6 in a bar whose top is y 5, i.e. (607,7)
and (600,22) relative to the bar: the Kuiper's (606.8,7.3) and (599.7,22) are **within 0.3 px**. GridAtlas's titles at
1280: File 51 px, Scope 58 px; the Kuiper's 50.7 and 57.9. At 360: 34.6 and 40.2 in both.

Two facts the acceptance text must absorb (both found independently by the builder, PLAN.md "BUILDER status"):
1. **A3 "centred within 1 px" cannot hold above 700 px** with GridAtlas's flanks copied: SYSTEM TIME is wider than
   2050 TARGET, so the brand sits +4.66 px right of the bar centre in the Kuiper and +5 px (rounded) in GridAtlas
   (640 vs 645 at 1280, team-1/EVIDENCE.md A9). The `.hud-header` itself is centred (522.4 + 235.1/2 = 639.95). Read A3 as
   "the brand box within 1 px of GridAtlas's box" (holds everywhere) and "centred within 1 px" at ≤700 px (holds: −0.01).
2. **The star breakpoint is 434 px, not R7's 381 px**: with a centred brand each side gets (W − 77.6)/2, and FILE EDIT
   VIEW + SEE THROUGH need 3×34.6 + 74.1 = 177.9 px, so W ≥ 433.4. Measured: at 430 the left side is 176.2 px (too
   small), at 434 it is 178.2 px and holds the 178 px of content with scroll 434 = 434. The lead's FINDING
   https://github.com/Ventusltd/neural-link-between-agents/issues/10#issuecomment-6564447092 posts it; ROADMAP Q7's sentence
   "A Pixel 7 (393 px) shows the title" is therefore wrong for this shell: Pixel 7 (393 or 412) shows the strip.

## 6. Review of the module and of the HANDOFF draft

### 6a. Keys cited inside the module that are off (the values are right; the line numbers are not). For the lead, before MODULE.sha256 is cut. Module line numbers are those of the 563-line file of 22:25 UTC (sha256 `10b2cb70…`).

| module line | cites | the line that says it (re-read at gridatlas@5ec7f62 / kuiper-belt@96736f5) |
|---|---|---|
| :94 | titles `MB:174-177`, hover/open `MB:178-179`, focus `MB:180-181` | titles M:174-176, hover/open M:177-178, focus M:179-180 |
| :119 | panels `MB:206-213`, right group `MB:218-224`, rows `MB:226-235` | panel M:206-211, right group M:219, rows M:220-227 (hover :226-227) |
| :155 | `chipStaysOnMap cartridge :1521-1552` | :1521-1552 is the MODULE file (M); the cartridge's is L:5870 ff. |
| :166 | `MB cartridge :6010-6016` | L:6011-6016 ("The search bar is NOT moved") |
| :173 | `MB:372-383` | M:372-382 (:383 is `].join('')`) |
| :196 | shell `index.html:23-33` | :23-34 (the `.hud-header` closes at :34) |
| :209 | `MB:545` | M:544 |
| :214 | `ventus-corev8engine.js:603-608` | :602-608 (`setInterval` at :602, target `Date.UTC(2050,0,1)` :604, days :607) |
| :376 | `MB:244-246` | M:245-247 |
| :142 | Edition 4 `index.html:66-71` | :64-70 (`#top,#hud,#foot,#lines{display:none}` :64 … `#lines{…}` :70) |
| :362 | `IX:610-618` (the keydown table) | :614-618 (:605-613 is the `#gotoin` handler) |
| :444 | `IX:603-613` | :604-613 |
| :410 | `PALETTE.md:8-13` | kuiper-belt@96736f5 PALETTE.md:9-13 (:8 is the table rule) |
| :551 | `index.html:697-703` | :698-704 (`const bar` :698 … `appendChild(bar)` :704) |

Correct as cited: M:166-172, M:181-183, M:192-205, ventusv8.css:4,6-8, M:220-225 (row), M:228-233, M:554-583, M:1662-1669,
:1556-1558; IX:600-601, :602, :615-618, :685-689, :692, :729-734, :726, :262-268.

### 6b. Findings on the module (for the lead; none blocks, each is a sentence in the HANDOFF)

- F1 **The step-1 hook list cannot be met literally** (ROADMAP step 1 C8: `safeBox, draw, edCard, edFly, edNext,
  setPanel`): the engine is one `<script type="module">` (index.html:102), so those functions are not reachable from
  another file, and Opus 4's table exposes `safeBox` and `draw.add`/`panels.set` but not `edCard`, `edFly`, `edNext`.
  The module says so in its header (:9-11) and reaches them through their DOM controls and the keydown table
  (IX:600-601, :614-618, :691-692). This is correct; the HANDOFF should say C8 was met by DOM inventory plus KY names.
- F2 **Module-law tension, recorded, not a defect of this module**: ROADMAP step 4 (4.7/4.8) lets a module touch only
  `KY.*` and its own host, but step 1 C8 orders the shell to move Edition 4's nodes (`#keys` ×5, `#hud`, `#top`, the
  `#lyFocus` label, `#lines`, `#foot .long`: 10 nodes, measured `controls_moved: 10`) and to restyle `#goto` and `#bar`.
  The manifest record's `writes` must list them, or Opus 4's E7 (`reads`/`writes` matched by literals) will fail.
- F3 **The probe**: the shell writes `window.__KUIPER_MODULES__.menuBar` (:52); under the loader
  `__KUIPER_MODULES__ === KY.modules`, "the one object the loader fills" (HOOKS.md). REQUESTS.md item 2 asks Opus 4 to
  leave it unfrozen; the test also accepts `KY.modules[...].inspect()` (test.cjs header). Keep both.
- F4 **Two `#kuiper-star-strip` ids**: the shell creates `#kuiper-star-strip` (:35, :212) and Opus 5's module creates
  its own `#kuiper-star-strip` and places `a#kuiper-star` into `.gm-side-left` at `max-width:380px` / title above
  (202611012141-see-through.js:59, :78, :85). With both loaded: duplicate ids and, between 381 and 433 px, a second
  SEE THROUGH title that overflows the bar. REQUESTS.md item 3 (mount through `api.mountStar`) is the fix; it must be
  answered before both are admitted.
- F5 **The failure strip sits at `bottom:8px`** (:71), GridAtlas's at `top:8px` (M:1764). Departure justified: A8
  requires Edition 4's bar, at the top, to stay clickable. Say so in the README.
- F6 GridAtlas values carried with a stated departure: `position:fixed` (C1), `height:calc(36px + env(safe-area-inset-top))`
  with `padding-top` (NL-009 01-bar F5), hover under `(hover:hover)` (01-bar F4), `::after` 44 px hit box (C4, 01-bar F2),
  `text-size-adjust:100%`, `.gm-menu{display:flex}` and `.gm-title{display:flex}` (so the `a.gm-title` star aligns). The
  `!important`s of M:195-198 are dropped because no rule competes on the Kuiper page. None changes a measured number.

### 6c. The HANDOFF draft

(pending: handoff/01-shell/HANDOFF.md not yet on disk at 22:05 UTC)
