# Kuiper Edition 5 (202611012135)

Under construction by the NL-010 Opus teams. Not yet published; the pointer still names Edition 4.

## What changed from Edition 4

Edition 4 is `../202611012027/`. Edition 5 is the same engine and the same `keys.json` (byte-identical, sha256
`1c293c33…242b`), with a hook table, a loader and stamped modules admitted one at a time by the integrator (Opus team
10) in the order the roadmap proved: 4 loader, 1 shell, 2 card, 3 layers, 6 file, 5 See Through, 7 apps, 8 drift,
9 law (neural-link FIXES/NL-010/ROADMAP.md, "Integration order"). Each admission is a row in
`proof/handoff/10-integration/ADMISSIONS.md` with the Android journey run after it.

### Modules admitted (in `modules.json` order)

None yet.

### Modules refused

None yet.

### Modules waiting for admission (on disk at 23:23 UTC, in the integration order)

Each sha256 is of the file as it stood at 23:23 UTC; a module's bytes may still change until its row in
`ADMISSIONS.md` admits it, and the admitted sha256 is the one in `modules.json`. Each paragraph moves to "Modules
admitted" with its admitted sha256 when the row is written.

**loader** · the hook table and loader in `index.html` (reference copy `modules/202611012145-loader.js`, sha256
`25a16f1d3c3f`, listed under `references`, never fetched) and `hello` (`modules/202611012145-hello.js`, sha256 `ee2130b56e74`)
· Opus 4 · step 4. What a person sees: the wafer as in Edition 4, plus one readout line per module, `<id> admitted ·
<sha12>`; a module whose bytes, stamp, licence or hooks do not match is refused in words (one readout line and one
strip) while the bar, the wafer and every other module keep running. `hello` draws one cyan ring at key 0 and leaves
`order` before PR A. Folds in NL-009 04-touch and 09-robust (`handoff/04-loader/HANDOFF.md`).

**kuiper-shell** · `modules/202611012143-kuiper-shell.js` · sha256 `eeea45817821` · Opus 1 · step 1. What a
person sees: one bar across the top (36 px; 34 px at 700 px and narrower) with FILE EDIT VIEW on the left, the VENTUS
wordmark with "Cables & Connectivity®" centred, and SCOPE WAFER ABOUT on the right, in GridAtlas's face; every title
and command is a 44 px target; a panel opens under the bar, one at a time, and closes on the same title, Escape, a
tap on the wafer or the back gesture. Edition 4's bar stays in the page, hidden. Folds in NL-009 01-bar,
06-seethrough (the bar entry) and 08-type.

**line-card** · `modules/202611012143-line-card.js` · sha256 `788256a97844` · Opus 2 · step 2. What a person
sees: every card opens with the line of code itself, verbatim from the key; the key is the second row; the title,
"n of 344", pattern and finder sit behind "details". On a phone (640 px and narrower) the card is a bottom sheet
capped at 34 dvh with 44 px targets, closed by ×, Escape or a swipe down. Folds in NL-009 02-card. The law is "The
card law" below.

**layers** · `modules/202611012141-layers.js` (records `data/layers.json`) · sha256 `90ab25e24be1` · Opus 3 · step 3.
What a person sees: the WAFER panel lists the 7 reference layers of `data/layers.json` (periods, repos, editions,
lines, see-through, elements, spider), one row each with its live state (WAIT, LOAD, OK, EMPTY, FAIL, REFUSED) in the
row; one switch per layer, which every other surface proxies; Edition 4's LINES panel becomes the verified-lines
layer's control inside WAFER. Folds in NL-009 05-lines.

**file** · `modules/202611012231-file.js` · sha256 `3a03a2abd812` · Opus 6 · step 6. What a person sees: the FILE
panel opens a key, a line, an edition (`data/editions.json`) or an app, copies a link (or shows it selectable where
the clipboard is refused), exports the wafer as a PNG and prints; it lists the edition's seven evidence files with
their bytes measured when FILE opens ("missing · HTTP 404" when absent). The page's hash (key, line, repo, period,
layers) is the link: kept current as you move, and the same view when pasted into EDIT or opened through the pointer.

**see-through** · `modules/202611012141-see-through.js` (data `data/see-through.json`) · sha256 `87a88e488fdf` · Opus 5
· step 5 · CERN-OHL-S v2 (the whole file). What a person sees: a SEE THROUGH entry that opens `../../see-through/`
in the same tab: a title on the left of the bar at 434 px and wider (the shell's measured rule, `STAR_TITLE_MQ` in
`modules/202611012143-kuiper-shell.js`), the 44 px chip at the bottom left on narrower screens, so on both Pixel 7
(412 px) and Galaxy S24 (360 px); the WAFER layer "See Through stars", 5,800 stars at their keys; a card offers "see
this line among the stars". Folds in NL-009 06-seethrough.

**apps** · `modules/202611012309-apps.js` (data `data/apps.json`, `data/elements.json`, `data/graphs/*.json`) · sha256
`432b0aae925d` · Opus 7 · step 7. What a person sees: FILE > "Open an app" opens the launcher under the bar, one
44 px row per app of the registry (34 rows), the key as each row's header; an app opens in the same tab, one at a
time, and the back gesture is the way home (no window manager). The periodic table is a WAFER layer (221 of 244
elements keyed on the wafer, 23 named but not placed; the row reads "REFUSED · licence unsettled" until the owner
answers Q1) and an app; the spider sandbox is an app row and a graph layer (the two DISCLOSED graphs, Q5).

Not on disk at 23:23 UTC: Opus 8 (the drift, step 8) and Opus 9 (the law, `tools/edition_check.py`, `LICENCES.md`,
step 9).

### NL-009 round-1 findings folded in

| finding | folded in by | where | state |
|---|---|---|---|
| 01 bar | Opus 1 (shell) | `modules/202611012143-kuiper-shell.js` | waiting for admission |
| 02 card | Opus 2 (card) | `modules/202611012143-line-card.js` | waiting for admission |
| 03 camera | Opus 10 (base) | `index.html` | applied: the spark is aimed into the band under the bar and any open panel and above the card, re-aimed on the next frame and kept there when the card or the window changes; a finger reaches a spark at 24 px (48 dp), a mouse at 9 px, only from a press that began on the wafer; a pick closes a panel only when under 96 px of band would be left. Merged with 04-touch's tap verdict (a long press opens no card). |
| 04 touch | Opus 4 (loader patch) | `index.html` (hook table patch) | waiting for admission |
| 05 lines | Opus 3 (layers) | `modules/202611012141-layers.js` | waiting for admission |
| 06 see-through | Opus 1 (bar entry), Opus 5 (See Through) | the two modules | waiting for admission |
| 07 perf | Opus 10 (base) | `index.html`, `keys-min.json`, `tools/edition_min.py` | applied: list rows `content-visibility:auto`; the page loads `keys-min.json` (1,558,451 bytes, 17 fields) and falls back to `keys.json`. The card law keeps `line_text` whole, so the file is 8.8 % smaller than `keys.json`, not 07's 86 %: one placed record's line is 1,240,449 characters. |
| 08 type | Opus 1 (shell) | `modules/202611012143-kuiper-shell.js` | waiting for admission |
| 09 robust | Opus 4 (loader patch) | `index.html` (hook table patch) | waiting for admission |

## The card law

The line of code is the header. Every card opens with the line itself, verbatim from the key; the key is the second row; every name a person gave the line comes after.

That sentence is the short form of law L11 (`LAWS.md`, carried as `handoff/02-card/LAWS-L11.patch`). The card is the
module `modules/202611012143-line-card.js` (Opus team 2, roadmap step 2). A card, rendered, for the first of the 344
placed lines (`keys.json` `bodies[0]`, key 36,064,705,400), abridged: the details are shown open and the wafer
position rows that `describe()` adds under them are left out:

```
# Every digest in this repository is taken over git blob content, which is LF,
data-centres-gb@f9f4728 .gitattributes:5 · key 36,064,705,400
open on GitHub at f9f4728 · details
  Bytes on disk are the bytes that ship  1 of 344
  pattern: Canonical bytes (LF pinned at the attribute layer, binaries untouched)
  found by W08 F15, verified by a controller
```

Row 1 is `bodies[i].line_text`, the bytes at the key as `tools/edition_keys.py:251` wrote them, never the register's
title or quote. Row 2 is the key. The names (title, n of 344, pattern, finder, the wafer position) sit behind
"details". Where the register's quote differs from the line at the key (216 of 344 bodies), the quote is a row under
the key marked "register quote", never the header; 7 of those are "quoted one line below" with their own key; 4 lines
at their key are empty and the header says "empty line at key". A body without `line_text` is refused with the words
"no text at key". The LINES rows follow the same order: line, key, title.

**Falsified by:** a card whose first visible row differs from the text at its key; a card that shows a line
without its key on the next row; or a quote shown as the header when the quote is not the line at the key.
The test is `handoff/02-card/test.cjs` (B1–B7, Pixel 7 and Galaxy S24, all 344 placed bodies).
