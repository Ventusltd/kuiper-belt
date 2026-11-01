# Kuiper Edition 2 (202611010114)

**Version:** Kuiper Edition 2 · cut stamp 202611010114 (UTC) · the lines of Edition 1, drawn on the wafer itself.

Edition 1 (`../202610311905/`) verified 354 keyed findings of the Ventus / GLOBALGRID2050 estate and placed 346
distinct lines on a belt of their own, drawn by a small viewer. The owner judged that viewer poorer than the Kuiper.
Edition 2 corrects that without changing a single finding: it is the Kuiper wafer (`../../index.html`, the same
engine, the same law, the same `cosmos/` data) with the verified lines lit as green sparks at their own keys.

## How a line gets its spark

Every line in every file in every commit on the wafer has one key. `tools/edition_keys.py` gives each verified line
the key the wafer already assigned it: the commit's first key from `cosmos/wafer.tsv`, plus the lines of every text
blob before that file in `git ls-tree -r <commit>` order, plus the line number, counted exactly as `tools/key.py`
counts them, and refused when the walk does not land where the wafer says the commit ends. The result is
`keys.json`; `python tools/key.py <key>` resolves any spark back to its text. A line whose commit is not on the wafer
is counted and named in `keys.json`, never placed (the seventh law).

## Using it

Open `index.html` (served from the repository root so `../../cosmos/` resolves; the stable link
https://ventusltd.github.io/kuiper-belt/editions/ opens the newest edition). Green sparks are the verified lines,
bright green the gridatlas and data-centre repositories. Press **e** (or the button) to step through them: the camera
flies to the spark and the card shows the finding, the quote, the key, the commit and a link that opens the line on
GitHub at that commit. Tap any spark for the same. Everything else is the Kuiper as before: **n** new code, **r** a
random line, **/** find, backspace the whole wafer.

## What is in the folder

| path | what |
|---|---|
| `index.html` | the Kuiper engine with the edition layer (the diff against `../../index.html` is the layer only) |
| `keys.json` | one record per verified line: key, k0, lines before, commit line totals (measured and wafer), on_wafer, verified, plus Edition 1's fields |
| `proof/` | SHA-256 of every file here and the round-trip record of keys resolved with `tools/key.py` |

The register, chapters, worker surveys, denominator and the belt viewer stay in `../202610311905/`; Edition 2 adds
nothing to the evidence and changes none of it.

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to. Illustrative only: not a design study. Provided as is, without warranty.
