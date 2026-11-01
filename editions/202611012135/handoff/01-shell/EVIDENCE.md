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

## 4. The header's licence line (checked)

See section 6 for the verdict against the module as it stands.

## 5. Findings for the lead and the HANDOFF

See section 6.

## 6. Review of the module and of the HANDOFF draft

(filled in below as the module grows)
