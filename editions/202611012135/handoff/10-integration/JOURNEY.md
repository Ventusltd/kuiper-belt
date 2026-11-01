# JOURNEY.md: the Android journey script as team 10 runs it (Opus team 10 tester, NL-010 step 9.4 / step 10)

Tester OPUS-10, 2026-11-01. For Opus teams 1 (shell), 2 (card) and 9 (law; owner of the gate script). Runs are in
`TEST.md`; this file is only about the script and the ids it relies on.

## Which script

- Source: neural-link `FIXES/NL-009/android-journey.cjs`, 39,204 bytes, sha256 `234a2a0c…0bb13` (the copy in
  `/tmp/nl010-opus/team-10/lead/journey/` is byte-identical).
- Team 10's copy: `/tmp/nl010-opus/team-10/tester/android-journey.cjs` (48,849 bytes, sha256 `03a4a49d…5998` at
  22:31 UTC), diff against the source in `/tmp/nl010-opus/team-10/tester/journey-nl010.diff`. Run as
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

## Steps added to the NL-009 journey

- `panel-dismiss` (ROADMAP 9.4 (c); shell C7): open EDITION/ABOUT, tap the wafer beside the panel (a point where
  `elementFromPoint` is `#c`/`#o`; `NOT EVALUATED` when the panel leaves no wafer visible) → the panel closes and no
  card opens; open again, `history.back()` (the Android back gesture) → the panel closes and the URL is unchanged. If
  opening pushed no history entry the back sub-check fails (the gesture would leave the page) and `history.back()` is
  not called.
- `modules` (ROADMAP 9.4 (o)): every id in `modules.json` `order` is in `window.__KUIPER_EDITION__.admitted` (or
  `KY.inspect()`), `refused` and `failures` empty, zero `pageerror`. With an empty `order` it passes with a note.

Not in the script (reported `NOT EVALUATED` in TEST.md): font scale 1.3 (team 1's test.cjs A2b covers the bar);
the 4 px spark "hit or the page says what it hit" beyond `spark-tap`; the NL-009 06/09 BLOCKER/MAJOR items other
than the ones the steps above measure.
