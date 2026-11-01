# Kuiper Edition 4 (202611012027)

**Version:** Kuiper Edition 4 · cut stamp 202611012027 (UTC) · Edition 3 with a compact card and a camera that keeps the chosen line in view.

Edition 1 (`../202610311905/`) verified 354 keyed findings of the Ventus / GLOBALGRID2050 estate and placed 346
distinct lines on a belt of their own. Edition 2 drew those lines on the Kuiper wafer itself (`../../index.html`, the
same engine, the same law, the same `cosmos/` data) as green sparks at their own keys. Edition 3 moved the text into
layers behind a menu bar. Edition 4 changes nothing in the findings, the keys or the layers; `keys.json` is
byte-identical to Edition 2's and Edition 3's.

## What changed from Edition 3

The owner found the screen after "next verified line" poor: the card covered most of a phone, and the spark it
described sat under the card or the bar. Edition 4 fixes three things and nothing else.

1. The card is compact: the title with "n of 344", the repository and `path:line`, the quoted line, the GitHub link
   at the commit, and a "details" toggle that opens the pattern, the finder, the key, the commit time and the
   position on the wafer (the text Edition 3 showed at once). It is capped at 30 % of the screen (34 % on a phone,
   scrolling inside if a quote is long) and has its own × close.
2. The camera places the spark in the clear space: after any pick (**e**, a spark, a row in LINES) it flies so the
   line lands centred between the bar and the top of the card, not under either (`edFly` in `index.html`, which
   measures the card after it is drawn).
3. Picking a row in LINES closes the panel, so the wafer and the card are what you see next.

Also fixed: the stable pointer `../index.html` had carried `/belt/` from Edition 1 into Editions 2 and 3, whose
folders have no `belt/`; it now opens the dated folder itself.

## How a line gets its spark

Every line in every file in every commit on the wafer has one key. `tools/edition_keys.py` gives each verified line
the key the wafer already assigned it: the commit's first key from `cosmos/wafer.tsv`, plus the lines of every text
blob before that file in `git ls-tree -r <commit>` order, plus the line number, counted exactly as `tools/key.py`
counts them, and refused when the walk does not land where the wafer says the commit ends. The result is
`keys.json`; `python tools/key.py <key>` resolves any spark back to its text. A line whose commit is not on the wafer
is counted and named in `keys.json`, never placed (the seventh law).

## Using it

Open `index.html` (served from the repository root so `../../cosmos/` resolves; the stable link
https://ventusltd.github.io/kuiper-belt/editions/ opens the newest edition). At rest the screen is the wafer and a menu
bar: EDITION, READOUT, LINES, COMMANDS, each a layer that opens on its title and closes on the same tap, Escape or a
tap on the wafer. Green sparks are the verified lines, bright green the gridatlas and data-centre repositories. Press
**e** (or NEXT VERIFIED LINE) to step through them; tap any spark or any row in LINES for the same. Everything else is
the Kuiper as before: **n** new code, **r** a random line, **/** find, backspace the whole wafer.

## Known limits

- 344 of 346 lines are on the wafer; the two star-maker lines (commit f65c2f38) are not, because that commit is not on the wafer; they are named in `keys.json` and counted in the HUD.
- Seven of the 346 register lines point one line above their quote (the quote sits on the next line); the keys follow the register line and `quote_key` in `keys.json` gives the line of the quote. This is an Edition 1 error, recorded here rather than silently corrected.
- All 12 round trips through `python tools/key.py <key>` returned the same repository, commit, path, line and text (`proof/keys-summary.json`, unchanged from Edition 2).
- The clear-space placement is measured at zoom 14 with the card as drawn; on a very short screen the card's 34 % cap wins and the spark sits just above it.

## What is in the folder

| path | what |
|---|---|
| `index.html` | the Kuiper engine with the edition layer, the menu bar and the compact card (the diff against `../202611012022/index.html` is the card, `edFly` and the panel close) |
| `keys.json` | one record per verified line: key, k0, lines before, commit line totals (measured and wafer), on_wafer, verified, plus Edition 1's fields |
| `proof/` | SHA-256 of every file here, the round-trip record of keys resolved with `tools/key.py`, and renders of the card on a phone (closed and with details) and at 1280x800 |

The register, chapters, worker surveys, denominator and the belt viewer stay in `../202610311905/`; Edition 4 adds
nothing to the evidence and changes none of it.

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to. Illustrative only: not a design study. Provided as is, without warranty.
