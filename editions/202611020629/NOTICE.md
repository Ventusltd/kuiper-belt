# NOTICE — Kuiper Edition 9 (202611020629)

Code in this folder (`index.html`, the Kuiper engine with the edition layer, the hook table and the loader; every
`modules/*.js` unless its own header names another licence; `tools/edition_keys.py` and `tools/edition_min.py` at the
repository root) is licensed under the Apache License 2.0, as the kuiper-belt repository. Documentation, the register
and generated data (`keys.json`, `keys-min.json`, `modules.json`, `data/*.json`, `proof/*`, `README.md`) are under
CC BY 4.0, except the OpenStreetMap names in `data/see-through.json` (below). Each module's own licence is written on
line 1 of its file and in its `modules.json` record; a module that carries code copied from See Through is
CERN-OHL-S v2 as a whole file, and the reciprocity stops at that file (ROADMAP step 9, 9.8). The licence register of
everything this edition brings in is `LICENCES.md` (Opus team 9) when it lands.

**The modules and their licences.** Line 1 of each file in `modules/`, as on disk; "admitted" means listed in `modules.json` `order` with this sha256
(`handoff/10-integration/ADMISSIONS.md`). Builder OPUS-10 keeps this list current after each admission.

| file | team, step | licence (line 1) | state |
|---|---|---|---|
| `modules/202611012145-loader.js` | Opus 4, step 4 (reference copy of the hook table and loader in `index.html`; never fetched) | Apache-2.0 | admitted 23:19 UTC as `references` (sha256 `25a16f1d3c3f`) |
| `modules/202611012145-hello.js` | Opus 4, step 4 (the loader's proof; leaves `order` before PR A) | Apache-2.0 | admitted 23:19 UTC (sha256 `ee2130b56e74`) |
| `modules/202611012143-kuiper-shell.js` | Opus 1, step 1 | Apache-2.0; the bar's CSS values and menu structure copied from GridAtlas (Apache-2.0, gridatlas@5ec7f62 LICENSE:1-4, NOTICE:1-12) | refused 00:03 UTC (`ADMISSIONS.md` row 2); waits for rev 2 |
| `modules/202611012143-line-card.js` | Opus 2, step 2 | Apache-2.0 | admitted 23:35 UTC (sha256 `e2baeaaaf244`) |
| `modules/202611020212-line-card.js` | Opus 2, step 2, landscape revision | Apache-2.0 | admitted 04:15 UTC by OPUS-CONTROLLER-2, GREEN E6-G1 (sha256 `8ec117f9dd43`); replaces 202611012143 from Edition 7 |
| `modules/202611020240-drift.js` and `data/drift.json` | Opus 8, step 8 | Apache-2.0 code; CC BY 4.0 data, quotes no line text | admitted 04:58 UTC, GREEN E6-G2 (sha256 `f03b78350694`) |
| `modules/202611012309-apps.js`, `data/apps.json`, `data/elements.json`, `data/graphs/` | Opus 7, step 7 | Apache-2.0 code; CC BY 4.0 data; each app row carries its source's licence; elements keys only (Q1) | admitted 06:28 UTC, GREEN E6-G3 (sha256 `fa01e012d81b`) |
| `modules/202611012141-layers.js` | Opus 3, step 3 | Apache-2.0 | waiting for admission |
| `modules/202611012141-see-through.js` | Opus 5, step 5 | **CERN-OHL-S v2, the whole file**: it copies See Through's star-key rule (`see-through/202610050609/descent.js:19, :963, :965`; licence `see-through/202610050609/LICENSE.md:3-7`, text `see-through/202610050609/licences/globalgrid2050-CERN-OHL-S-2.0.txt`). The Apache-2.0 engine is only called, never copied into it. | waiting for admission |
| `modules/202611012231-file.js` | Opus 6, step 6 | Apache-2.0; GridAtlas's copy-or-show clipboard, export blank-check and travelling-stamp method (Apache-2.0, gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:707-733, :794-834, :1082-1097, :1120-1137, :1354-1365); no GridAtlas bytes copied but the words of two row labels (its header, lines 4-7) | waiting for admission |
| `modules/202611012309-apps.js` | Opus 7, step 7 | Apache-2.0; copies no elements catalogue text (ROADMAP Q1: only keys `block:<Sym>`) and no spider graph beyond the two below (Q5) | waiting for admission |
| `modules/202611012325-drift.js` | Opus 8, step 8 (reads `data/drift.json`, CC BY 4.0, which quotes no line text; written by `tools/drift.py`, Apache-2.0) | Apache-2.0 | waiting for admission |

Step 9 (Opus 9): `tools/edition_check.py` at the repository root is on disk (00:27 UTC), Apache-2.0 by its own docstring (lines 2-3); `LICENCES.md` is not on disk yet.

**The spider graphs (Opus 7, ROADMAP Q5).** `data/graphs/overview.json` and `data/graphs/periodic-table.json` are
copied and marked DISCLOSED by Opus 7 pending the owner's answer to Q5. Measured by the builder: `overview.json` is
byte-identical (sha256) to `spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/overview-graph.json` and
its four sibling copies in testcode@d09c185, a repository licensed Apache-2.0 (testcode@d09c185 LICENSE:1-2,
NOTICE:10-12); no byte-identical source of `periodic-table.json` was found in the estate's checkouts.

**OpenStreetMap.** `data/see-through.json` (Opus 5) holds the names of 4,460 of its 5,800 substations (measured:
features with `properties.name`), taken from See Through: © OpenStreetMap contributors, Open Database Licence 1.0
(`see-through/202610050609/NOTICE.md:22-25`). Those names are ODbL 1.0 data, not CC BY 4.0; the rest of the file
(the star keys) is CC BY 4.0. See Through itself is linked (`../../see-through/`), not copied.

Every quoted line belongs to the repository it is keyed to and keeps that repository's licence:
Apache-2.0 (kuiper-belt, pipelinenews and most code), CERN-OHL-S v2 (globalgrid2050-derived material,
see-through), CC BY 4.0 (documentation), ODbL 1.0 for OpenStreetMap-derived data cited by the data-centre
work, OGL v3 for DESNZ and DUKES material. A quote here is a citation with its key, not a relicensing.

The bar and the wordmark are measured from GridAtlas (gridatlas@5ec7f62, Apache-2.0, its LICENSE and NOTICE); GridAtlas's
third-party data is excluded by its own NOTICE and none of it is copied here.

**The mark (pending the owner's confirmation, ROADMAP Q8).** The VENTUS mark is used by Ventus Ltd, its owner. The
Apache-2.0 licence of this code does not license the mark. ("Ventus" and "Cables & Connectivity®" are used by the
owner's instruction; Apache-2.0 §6 grants no trademark rights, gridatlas@5ec7f62 LICENSE:139.)

The placement law follows H. Vogel (1979), "A better way to construct the sunflower head", Mathematical
Biosciences 44 (3-4), 179-189, and the golden-ratio multiplier of D. E. Knuth, The Art of Computer
Programming, Volume 3, section 6.4. The numbers behind both are Fibonacci's (1202).

Illustrative only: not a design study. Provided as is, without warranty.
