# Kuiper editions

Version numbers: an edition is numbered in order of publication (Edition 1, 2, …) and keyed by its cut stamp
(`YYYYMMDDHHMM`, UTC). The number is for people; the stamp is the key. The current edition is **Kuiper Edition 2 (202611010114)**.

An edition is a dated folder that places the estate's best lines on the belt, each line keyed by `repo@commit path:line`
and verified against a clone before it is placed. The stable link `editions/` opens the newest dated folder; the stamp is
written in three places in `index.html` (meta refresh, the link, `location.replace`), as `learn-the-kuiper/index.html`
does. Earlier dated folders are kept unchanged as history. Find the newest edition from the pointer, not by sorting
folder names: stamps carry the clock of the machine that cut them.

- **Kuiper Edition 2** (`202611010114`, published 2026-11-01): [README](202611010114/README.md) · [open it](202611010114/). The same 346 verified
  lines, drawn on the Kuiper wafer itself as green sparks at their own keys (344 placed, 2 not on the wafer), with the
  engine's card, key and GitHub link for each; `tools/edition_keys.py` gives each line its wafer key by `key.py`'s walk.
- **Kuiper Edition 1** (`202610311905`, published 2026-11-01): [README](202610311905/README.md) · [the belt](202610311905/belt/). Focus GridAtlas and the data centres, 26 repositories,
  five chapters, prepared by a harness of five Fable controllers and twenty Opus workers on
  [NL-006](https://github.com/Ventusltd/neural-link-between-agents/issues/6).

Each edition's `README.md` is its law and its contents page; `belt/index.html` is the instrument; `register.tsv` is the
evidence; `proof/` holds the digests. Code Apache-2.0, text and data CC BY 4.0, as the repository.
