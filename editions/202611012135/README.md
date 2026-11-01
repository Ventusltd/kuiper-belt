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
placed lines (`keys.json` `bodies[0]`, key 36,064,705,400):

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
