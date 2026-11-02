# LICENCES.md: the licence register of Kuiper Edition 5 (202611012135)

The register of everything this edition brings in (editions/LAW.md 9.8; NL-010 ROADMAP step 9, 9.8; team-5/STEPS.md
9.8). Built by Opus team 9 on 2026-11-02 UTC. Text CC BY 4.0, as kuiper-belt (README.md:156-157).

**How it was verified.** Every key below was re-read from git objects at the heads, never from a working tree or from
memory, by `/tmp/nl010-opus/team-9/evidence/verify_keys.py` (`git show <sha>:<path>`, the lines printed and matched;
`git ls-tree` and `git grep -i licen` for "none in repository"): 31 keys, `RESULT: PASS` at 00:24 UTC; the lines read
are in `handoff/09-law/EVIDENCE.md`. Heads: gridatlas `5ec7f62`, kuiper-belt `018b46a`, elements `f7a92fb`, testcode
`d09c185`, globalgrid2050 `c66759f`, galaxies-wafers `fff6fc6`, stars `cbca125`, code-generator `857ea81`. kuiper-belt
files read at `018b46a` are unchanged at this branch's head `9adcc00` where the edition uses them (`git diff --exit-code
018b46a 9adcc00 -- LICENSE` empty; README.md:157 the same sentence), and the new See Through folder
`see-through/202611020012/` (the See Through pointer's target at `9adcc00`) carries `LICENSE.md` and `NOTICE.md`
byte-identical to `see-through/202610050609/`'s (`cmp`).

**Rule of the register.** A row with `DISCLOSED` or `NOT EVALUATED` blocks copying, not linking (kuiper-belt@018b46a
LAWS.md:111-124, L8). A quotation of one line with its key is a citation, not a relicensing
(editions/202611012027/NOTICE.md:7-10). Gaps are written, never filled in: the owner closes Q1, Q2, Q5 and Q8.

## A. What every edition brings in (the step 9 register, re-verified)

| brought in | what the edition takes | licence as the files state it | key (re-read) | copied or linked; note |
|---|---|---|---|---|
| kuiper-belt: the engine, the edition layer, the modules, the tools | the page, `modules/*.js` (unless line 1 names another licence), `tools/edition_check.py`, `tools/drift.py`, `tools/build_layers.py`, `tools/apps_registry.py`, `tools/element_keys.py` | code Apache-2.0; text and data CC BY 4.0 | kuiper-belt@018b46a LICENSE:1-3 ("Apache License / Version 2.0, January 2004"); README.md:156-157 ("Code is licensed under Apache-2.0 ... documentation and generated data under CC BY 4.0"); editions/README.md:27 ("Code Apache-2.0, text and data CC BY 4.0"); editions/202611012027/NOTICE.md:3-5 | written here; each module's line 1 names its licence (section B) |
| GridAtlas UI contract (bar, wordmark sizes, admission rule, manifest shape, release law) | CSS values and menu structure copied into the shell module (team 1); methods and names elsewhere | Apache-2.0, Copyright 2026 Ventus Ltd | gridatlas@5ec7f62 LICENSE:1-4; NOTICE:1-12 ("gridatlas / Copyright 2026 Ventus Ltd ..."); its third-party data excluded by NOTICE:25-32 ("Third-party data this repository reads or redistributes keeps its own terms") | copied in `kuiper-shell.js` with the NOTICE line in its header (Apache-2.0 4(d)); a measurement or a method is not a copy |
| the VENTUS mark as GridAtlas shows it | the lockup "Ventus" / "Cables & Connectivity®" set as text by CSS; no image file | not licensed by Apache-2.0: section 6 grants no trademark right; used by the owner's instruction of 1 Nov 2026 | gridatlas@5ec7f62 LICENSE:139-142 ("6. Trademarks. This License does not grant permission to use the trade names, trademarks ..."); atlas/modules/202609031958-menu-bar.js:184-205 (the masthead CSS) | NOTICE.md carries "The VENTUS mark is used by Ventus Ltd, its owner. The Apache-2.0 licence of this code does not license the mark." **Q8: wording pending the owner's confirmation** |
| See Through (the star player): the app | a link `../../see-through/` and deep links; no app code copied | CERN-OHL-S v2 (strongly reciprocal) | kuiper-belt@018b46a see-through/202610050609/LICENSE.md:1-10; NOTICE.md:3 ("See Through is offered under CERN-OHL-S v2"), :8-16 (per-file table); licences/globalgrid2050-CERN-OHL-S-2.0.txt:1 (full text present); see-through/index.html:12 | linked: no licence duty |
| See Through: the star-key rule | one block copied into `modules/202611012141-see-through.js` (team 5) | CERN-OHL-S v2 | as above; team 5's row (section C) keys descent.js:19-20, :963, :965 | **copied: that module is CERN-OHL-S v2 as a whole file** (its line 1 says so) and cannot be relicensed Apache-2.0; the reciprocity stops at that file |
| globalgrid2050 (the origin of See Through's simulator code) | nothing directly; one nine-word homepage title quoted by team 5; 25 homepage entity rows by team 7 | CERN-OHL-S v2 | globalgrid2050@c66759f LICENSE.txt:1-5 ("This project is licensed under the CERN Open Hardware Licence Version 2 - Strongly Reciprocal (CERN OHL-S v2)") | quoted with keys; the reason See Through is CERN-OHL-S v2 |
| OpenStreetMap data via See Through | 4,460 substation names in `data/see-through.json` (team 5) | ODbL 1.0 | see-through/202610050609/NOTICE.md:16, :22-27 ("OpenStreetMap: substation names, positions ... Open Database Licence") | copied; the file's own `licence` field says "ODbL 1.0 ... (c) OpenStreetMap contributors"; on-screen credit wherever drawn; derived data stays ODbL |
| See Through runtime services (CARTO, Esri World Imagery, AWS Terrain Tiles) | nothing: reached only through See Through itself | their own terms as written | see-through/202610050609/NOTICE.md:28-34 | nothing to do unless a module fetches them, which none does |
| MapLibre GL JS 4.7.1 | nothing (the wafer is canvas) | BSD-3-Clause | see-through/202610050609/NOTICE.md:38-39; vendor/MAPLIBRE-LICENSE.txt:1 ("Copyright (c) 2023, MapLibre contributors") | register only |
| Learn the Kuiper | a link, if any | code Apache-2.0, docs CC BY 4.0, `modules/grid.js` and `modules/zoom.js` CERN-OHL-S v2 | kuiper-belt@018b46a learn-the-kuiper/README.md:34-37; learn-the-kuiper/202610050609/NOTICE.md:7-11 | linked only |
| testcode and its spider (v5) | a launcher row (two lines, team 7); `data/graphs/overview.json` copied byte for byte (team 7) | Apache-2.0 (the root licence; the spider folder has none of its own); third-party data not covered | testcode@d09c185 LICENSE:2-4; NOTICE:1-12 ("testcode / Copyright 2026 Ventus Ltd"); NOTICE:26-33 ("Third-party data ... keeps its own terms") | copied with attribution; ROADMAP Q5 still asks the owner whether graph data is copied at all |
| elements (the periodic table) | keys `block:<Sym>` and catalogue numbers in `data/elements.json` and `data/apps.json` (team 7); no titles or descriptions copied | **none in repository** | elements@f7a92fb: 25 tracked files, none named LICENSE, NOTICE or COPYING; `git grep -i licen` 0 lines | `DISCLOSED` (Q1). Keys only: facts, not expression. Copying descriptions is blocked until the owner adds a licence |
| stars (the periodic-table graph) | `data/graphs/periodic-table.json`, 663 nodes, 2,481 edges, copied by team 7 (sha256 `b84820447a0f...`) | **none in repository** | stars@cbca125: 358 tracked files, none named LICENSE, NOTICE or COPYING (the 540 `git grep -i licen` hits are code and text that mention the word, not a grant) | `DISCLOSED` (Q5). **Copied while DISCLOSED: by the rule of this register the copy is blocked until the owner answers Q5** (REQUEST to teams 7 and 10, handoff/09-law/REQUESTS.md) |
| galaxies-wafers | nothing in steps 1-10 (Phase 2 numbers only); 10 quoted lines in `data/elements.json` | **none in repository** | galaxies-wafers@fff6fc6: 735 tracked files, no root LICENSE or NOTICE (`layers/copying.json`, `iterations/12-visibility-lab/geometry/copying.json` are data files of that name, not licences); `git grep -i licen` 2 lines, iterations/15-price-spread/README.md:3, :9, neither a grant | `DISCLOSED` (Q2); quotations with keys only |
| code-generator | nothing copied; one spider graph not fetched | **none in repository** | code-generator@857ea81: 59 tracked files, no LICENSE, NOTICE or COPYING | `DISCLOSED` (Q5) |
| OSM-derived and DESNZ/DUKES material quoted by the verified lines | quotations with keys in `keys.json` (byte-identical to Edition 4, sha256 `1c293c33...`) | ODbL 1.0; OGL v3 | kuiper-belt@018b46a editions/202611012027/NOTICE.md:7-10 ("A quote here is a citation with its key, not a relicensing") | unchanged since Edition 2 |

## B. The modules in `modules/`, line 1 of each file as on disk (00:40 UTC)

| file | team | licence on line 1 | state (modules.json) |
|---|---|---|---|
| `202611012145-loader.js` | 04 | Apache-2.0 (kuiper-belt) | reference record (never fetched) |
| `202611012145-hello.js` | 04 | Apache-2.0 (kuiper-belt) | admitted |
| `202611012143-line-card.js` | 02 | Apache-2.0 (kuiper-belt) | admitted |
| `202611012143-kuiper-shell.js` | 01 | Apache-2.0 (kuiper-belt), with the GridAtlas NOTICE line | pending admission |
| `202611012141-layers.js` | 03 | Apache-2.0 (kuiper-belt code) | pending admission |
| `202611012141-see-through.js` | 05 | **CERN-OHL-S-2.0 (the whole file)** | pending admission |
| `202611012231-file.js` | 06 | Apache-2.0 (kuiper-belt) | pending admission |
| `202611012309-apps.js` | 07 | Apache-2.0 (kuiper-belt code) | pending admission |
| `202611012325-drift.js` | 08 | Apache-2.0 (kuiper-belt code) | pending admission |

Data files: `data/layers.json`, `data/editions.json`, `data/apps.json`, `data/drift.json` each state CC BY 4.0 in their
own `licence` field; `data/see-through.json` states ODbL 1.0; `data/elements.json`, `data/graphs/overview.json` and
`data/graphs/periodic-table.json` carry no `licence` field (elements.json has a `licence_note`): their rows are above
and in team 7's LICENCE.txt.

## C. Each team's row, as handed in (`handoff/NN-*/LICENCE.txt`)

Each file is that team's row of this register, kept in its hand-off folder and named here by its sha256 (00:40 UTC).
The licence keys each row rests on are the ones re-read in section A; team-specific keys were re-read by that team's
evidence officer as its file says.

| team, step | file (bytes, sha256) | what the row says, in short | status |
|---|---|---|---|
| 01 shell | `handoff/01-shell/LICENCE.txt` (3,986, `5983110cc7fb`) | module Apache-2.0; GridAtlas CSS values and structure copied, Apache-2.0 with NOTICE; the VENTUS mark not licensed by Apache-2.0, text only, by the owner's instruction; no See Through code, no image or font | agrees with A; Q8 open |
| 02 card | `handoff/02-card/LICENCE.txt` (3,439, `80f23a4f8f29`) | module and the folded NL-009 02-card patch Apache-2.0; L11 text CC BY 4.0; card headers are citations from keys.json; GridAtlas lesson as method only | agrees with A |
| 03 layers | `handoff/03-layers/LICENCE.txt` (4,203, `998a6ad8d2e3`) | module and tools/build_layers.py Apache-2.0; layers.json and editions.json CC BY 4.0; elements row REFUSED (DISCLOSED, Q1); galaxies-wafers method only (DISCLOSED, Q2) | agrees with A |
| 04 loader | `handoff/04-loader/LICENCE.txt` (3,343, `274dda7700d1`) | hook table, loader, hello Apache-2.0; modules.json CC BY 4.0; GridAtlas composer as method only; the loader refuses an empty licence | agrees with A |
| 05 See Through | `handoff/05-see-through/LICENCE.txt` (5,797, `b2b09032a06c`) | the star-key rule copied: the module and build-see-through-json.py CERN-OHL-S v2; 4,460 OSM names ODbL 1.0; the app linked; one globalgrid2050 title quoted | agrees with A |
| 06 File | `handoff/06-file/LICENCE.txt` (4,216, `1a5b58ab61b9`) | module Apache-2.0; GridAtlas and Learn the Kuiper methods only; the exported image CC BY 4.0 with its credit; no third party | agrees with A |
| 07 apps | `handoff/07-apps/LICENCE.txt` (8,015, `b062b2c14155`) | module and tools Apache-2.0; apps.json CC BY 4.0, each row its target's licence; 25 globalgrid2050 rows quoted (CERN-OHL-S v2); elements keys only (DISCLOSED, Q1); overview.json copied (Apache-2.0, testcode); periodic-table.json copied from stars (DISCLOSED, Q5); 156 + 17 GPL + 48 unstated-licence `line_text` quotations in elements.json | **periodic-table.json: copy blocked by the rule while DISCLOSED** (A); the 17 GPL and 48 unstated one-line quotations are citations with keys, the owner to confirm (team 7's own note) |
| 08 drift | `handoff/08-drift/LICENCE.txt` (2,595, `c2f129ba3373`) | tools/drift.py, the module, tests Apache-2.0; drift.json CC BY 4.0, quotes no line text | agrees with A |
| 09 law | `handoff/09-law/LICENCE.txt` | `tools/edition_check.py`, the tests and the journey script Apache-2.0; `editions/LAW.md` and this register CC BY 4.0; copies nothing from outside kuiper-belt except the journey script, which is neural-link's own NL-009 work adapted by team 10 | agrees with A |
| 10 integration | none on disk at 00:40 UTC | index.html, keys.json, modules.json, README.md, NOTICE.md, proof/ | `NOT EVALUATED`: no LICENCE.txt in handoff/10-integration/ |

## D. Open, for the owner (never answered by an agent)

- **Q1** elements has no licence file: keys only until it has one.
- **Q2** galaxies-wafers has no licence file: numbers and quotations with keys only.
- **Q5** the spider's graph data: copy as `DISCLOSED` or draw live only. Until answered, `data/graphs/periodic-table.json`
  (stars, none in repository) is a copy this register's rule blocks; `overview.json` is testcode's Apache-2.0.
- **Q8** the VENTUS mark sentence in NOTICE.md: proposed, pending confirmation.
