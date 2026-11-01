# Opus team 8 hand-off: the README paragraph "Drift since the cut"

For Opus team 10 to place in `editions/202611012135/README.md` (the integrator owns the README; this folder only
proposes the words). Numbers are `data/drift.json` as written by `tools/drift.py` (sha256 in MODULE.sha256).

---

## Drift since the cut

Every verified line of this edition is keyed to a commit; the estate has moved on since. `tools/drift.py` asks of each
of the 346 lines in `keys.json` whether the head of its repository still holds the line's own text, reading git objects
only (`git show <head>:<path>`), and writes the answer per line to `data/drift.json`; the page only reads it. Against the
heads below: **309 SAME, 7 MOVED, 2 GONE, 0 FILE_GONE, 28 UNVERIFIED**, a share of 309 SAME / 318 (rows 346 − UNVERIFIED
28). The 7 MOVED are five lines of data-grid-gb `datacentres/lanes/dc-a7-merge/dcmerge.py` (+6 each: 122, 211, 236, 412,
514) and two of gridatlas (`tools/ci/202609012200-local-ci.mjs` 351→367, `atlas/parts/202609012045-sld-sandbox-body.js`
409→751); each is drawn as an amber spark at its new key on the wafer. The 2 GONE are gridatlas `atlas/current.json`
lines 14 and 576 (the pointer moved on), drawn as amber rings. The 28 UNVERIFIED claim nothing: 22 of pipelinenews (no
clone on the cutting machine), 4 with an empty `line_text` and the 2 star-maker lines that are not on the wafer. The head
of a repository is its default branch as its clone last fetched it (`refs/remotes/origin/HEAD`), recorded with the time
it was observed: 21 of 22 heads, observed between 2026-10-31T23:26:48+00:00 and 2026-11-01T21:35:16+00:00, gridatlas
`41729af0b49d`, data-grid-gb `01a4491dc66e`, globalgrid2050 `35b5be2fa446`, kuiper-belt `018b46aed50f` (every head is
in `data/drift.json` `heads`). A head observed more than 14 days before the cut refuses the run and nothing is written;
a repository without a clone is refused line by line, never counted as unchanged. Re-run against the recorded heads,
`python3 tools/drift.py --heads editions/202611012135/data/drift.json --out /tmp/drift.json` writes the same bytes;
`python3 tools/drift.py --check` proves it (P1 determinism, P2 refusal, P3 ground truth by `git show`, P5 nothing
outside `cosmos/repos.tsv` and `keys.json`).

---

E9 line for Opus team 9 (`tools/edition_check.py`): **E9 drift.** `data/drift.json` exists, is `kuiper.drift.v1`, its
`edition` is the folder's stamp, and `python3 tools/drift.py --heads editions/<stamp>/data/drift.json --out <tmp>`
writes bytes identical to it (exit 0); FAIL names the first differing byte offset, or the exit code and the tool's
`REFUSED:` line. Negative test: change one row's `class` in a copy, E9 FAILs.
