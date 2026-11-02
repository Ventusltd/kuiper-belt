# JOURNEY.md: the Android journey script as team 10 runs it (Opus team 10 tester, NL-010 step 9.4 / step 10)

Tester OPUS-10, 2026-11-01. For Opus teams 1 (shell), 2 (card) and 9 (law; owner of the gate script). Runs are in
`TEST.md`; this file is only about the script and the ids it relies on.

## Which script

- Source: neural-link `FIXES/NL-009/android-journey.cjs` as of 22:27 UTC, 39,578 bytes, sha256 `b3444215…b3b7` (the
  wafer is measured on the same PNG that is saved as the step's screenshot). The lead's `journey/android-journey.cjs`
  is the 22:19 version (39,204 bytes, `234a2a0c…`); the lead's `journey-5.cjs` adapts the same selectors (see below).
- Team 10's copy: `handoff/10-integration/android-journey.cjs` (= `/tmp/nl010-opus/team-10/tester/android-journey.cjs`;
  55,054 bytes, sha256 `346faed5…902d` at 01:47 UTC (run 4 portrait used `b7b9b074…`, runs 1–3 `ecde2f34…`; the first NL-010 version was `03a4a49d…`). Run as
  `node android-journey.cjs http://127.0.0.1:8502/editions/202611012135/ <out> --device "<name>"`, one device per
  process, Pixel 7, Galaxy S24, Pixel 7 landscape, plain `python3 -m http.server 8502` from the repository root.
- Team 9: no team-9 copy exists yet (`/tmp/nl010-opus/team-9/` absent at 22:31 UTC). When you start, please take
  team 10's copy (or the diff) so the gate and the integrator's runs are one script; tell me here if you change it and
  I will keep mine in sync.

## Element ids changed by the Opus 1 shell (`modules/202611012143-kuiper-shell.js`) and how the script follows them

The NL-009 script names Edition 4's bar (`#bar .gm-title[data-panel=top|hud|lines|foot]`, panels `#top #hud #lines
#foot` carrying `gm-open`). Once the shell installs, Edition 4's `#bar` stays in the DOM with class `kmb-superseded`
(hidden, `pointer-events:none`; shell :164, :507) and the four titles no longer exist as taps. The script now reads
`nav#kuiper-menu-bar` when present and maps:

| journey step | Edition 4 | Opus 1 shell |
|---|---|---|
| EDITION open/close, panel-dismiss | `#bar .gm-title[data-panel=top]`, `#top.gm-open` | `#kmb-title-about`, `#kmb-panel-about` (not `[hidden]`, parent `.gm-menu.gm-open`); `#top #big #sub` inside |
| LINES open/filter/pick | `[data-panel=lines]`, `#lines.gm-open` | `#kmb-title-wafer`, `#kmb-panel-wafer`; `#lines #lyFind #lineslist` moved inside unchanged |
| COMMANDS → WHOLE WAFER | `[data-panel=foot]`, `#foot button[data-k=Backspace]` | `#kmb-title-view`, `#kmb-panel-view [data-k=Backspace]` |
| READOUT | `[data-panel=hud]` | VIEW (holds `#hud`) |
| bar one row, lockup | `#bar`, `#barname` | `#kuiper-menu-bar` (every visible `.gm-title`, incl. the star link when it is a title), `.ventus-brand` |
| SEE THROUGH | a control in `#bar` | a visible see-through link in `#kuiper-menu-bar` or `#kuiper-star-strip` (strip below 434 px) |

Opus 2's card (`modules/202611012143-line-card.js`, `#card.lc`): details `.lc-t` (was `.ct`), body `.lc-d` (was
`.cd`), open class `lc-open` (was `open`), close `.lc-x` (was `.cx`), "n of N" read from `.lc-d` (so a line of code
containing "1 of 2" is never mistaken for the index), title `.lc-title`. When `#card.lc` is present, `lines-pick` also
checks ROADMAP 9.4 (e): `.lc-h code` textContent equals `keys.json` `line_text` of the picked body, and it is the first
non-empty text node of the card.

Teams 1 and 2: if you rename any id or class above, please write it here (or a REQUEST on #10) before the integrator
admits the change, or the journey will read it as `SELECTOR` and the step goes red.

## Measurement changes (no threshold changed)

- The wafer-disc measure (load, whole-wafer) blanks the box of `#kuiper-star-strip` (the shell's bottom-left SEE
  THROUGH strip below 434 px) before counting lit pixels; the blanked box is in `wafer.excluded`. Without this the
  strip's text made the disc 359×535 on Pixel 7 (pre-admission run P1).
- `vis()` also requires computed `visibility !== 'hidden'`: a card that is `display:block` but hidden (line-card's
  `lc-behind`, OPUS-5's FINDING 23:02/23:06 UTC on `layers.js:277` × `line-card.js:165`) is not an open card.
- The wafer rows start at `ceil(bar bottom)`, not `floor`: with Edition 4's bar ending at 45.6 px in landscape,
  `floor` counted the bar's own 1 px bottom rule (row 45, 863 lit px) and made the "disc" 863 px wide (run 3).
- Card controls (`details`, `×`) are tapped at the centre of the part a person can see: their box clipped by
  `#card`'s box and the viewport. Under 8 px visible fails as "not visible on the card" instead of tapping through to
  the wafer (run 3 landscape: line-card's 108 px cap cut `details` in half).
- The LINES/WAFER filter box is tapped at its visible part (inside the panel's box and the viewport), and the letters
  are typed only when `#lyFind` holds the focus (run 4 landscape try 1: the box's centre was below the 259 px panel,
  the tap went to the wafer and the letters to the engine). When the first row is below the panel's visible box, the
  panel is scrolled by a touch drag (up to 4) before the row is tapped; `lines-filter` still fails when the first row
  is off the first screen, as the NL-009 rule says.
- Errors raised after the SEE THROUGH tap (on `see-through/`, another app) go to `offPageErrors`, not
  `consoleErrors`.

## Steps added to the NL-009 journey

- `panel-dismiss` (ROADMAP 9.4 (c); shell C7): open EDITION/ABOUT, tap the wafer beside the panel (a point where
  `elementFromPoint` is `#c`/`#o`; `NOT EVALUATED` when the panel leaves no wafer visible) → the panel closes and no
  card opens; open again, `history.back()` (the Android back gesture) → the panel closes and the URL is unchanged. If
  opening pushed no history entry the back sub-check fails (the gesture would leave the page) and `history.back()` is
  not called.
- `panel-dismiss` detail: the wafer tap is tried on EDITION/ABOUT first, then on every other title, on the first panel
  that leaves wafer below it (ABOUT fills a phone: bottom 833 of 839); the history entry is detected by
  `history.length` or `history.state` changing (the shell's `pushState` can re-use the forward entry its previous
  close left, so the length alone stays 3→3).
- `console`: zero console errors, page errors and failed requests on the edition over the whole journey.
- `modules` (ROADMAP 9.4 (o)): every id in `modules.json` `order` is in `window.__KUIPER_EDITION__.admitted` (or
  `KY.inspect()`, waited for `done` up to 60 s), `refused` and `failures` empty, `whole` null, zero `pageerror`. With an empty `order` it passes with a note.

Not in the script (reported `NOT EVALUATED` in TEST.md): font scale 1.3 (team 1's test.cjs A2b covers the bar);
the 4 px spark "hit or the page says what it hit" beyond `spark-tap`; the NL-009 06/09 BLOCKER/MAJOR items other
than the ones the steps above measure.

## For team 9 (the gate) and teams 1 and 2

- Team 9: no team-9 copy of the journey existed by 02:10 UTC (`/tmp/nl010-opus/team-9/` absent; no `handoff/09-law/`).
  Please start from `handoff/10-integration/android-journey.cjs`; its JSON is what `proof/android-journey.json` holds.
- Team 1 (shell): ids unchanged between rev 1 and rev 2 as far as the journey reads them. Two measured findings in
  TEST.md run 4: the lifted SEE THROUGH strip takes a pinch finger on a 360 px phone with a card open (Galaxy S24
  pinch-drag red); the 180 px `#lyFind` (Edition 4's `flex:1 1 180px` inside the column panel) pushes the rows off the
  first screen in landscape (lines-filter red).
- Team 2 (card): in landscape the 30dvh cap (108 px of 360) is full before `details` opens and the action row is cut
  in half (TEST.md run 3 and run 4 landscape).
