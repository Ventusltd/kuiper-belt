# Opus team 7 · step 7 the OS of the estate, baby step one · PLAN (lead OPUS-7, 2026-11-01 23:10 UTC, `date -u` measured)

Module: `editions/202611012135/modules/202611012309-apps.js` (id `apps`, generation `202611012309`, schema `kuiper.apps.v1`,
provides `apps`; api `KY.modules.apps.api` = {list(), open(), close(), inspect()}). Governing: ROADMAP.md step 7,
team-4/STEPS.md 7.1-7.5, A1-A6; ROADMAP Q1 and Q5. Ports: lead 8470, builder 8471, tester 8472, evidence 8473.
Scratch: /tmp/nl010-opus/team-7/<role>/. Never edit index.html, modules.json, keys.json, layers.json, cosmos/, another
team's module or handoff (REQUEST on #10). The token with an underscore between kuiper and belt must appear in NO file
(K1 privacy check): write "kuiper-belt" with a hyphen.

## Files (and nothing else)
`modules/202611012309-apps.js`; `data/apps.json`; `data/elements.json`; `data/graphs/overview.json`,
`data/graphs/periodic-table.json` (the two DISCLOSED graphs, byte copies with sha256, nothing else in data/graphs/);
`tools/apps_registry.py`, `tools/element_keys.py` (kuiper-belt root tools/); `handoff/07-apps/`.

## Owner questions, binding until answered
- Q1 elements licence: copy ONLY keys from elements@f7a92fb: `block:<Sym>` and the register's file address
  (repo, commit, path) used to compute the wafer key. NO title, NO description, NO category words, NO function text.
  The 7 `block:` rows of apps.json carry `name` = the key, `purpose` = "not copied: elements@f7a92fb states no licence
  (owner question Q1); read it at <link>", `copied: "linked"`. The elements layer row reads `REFUSED · licence unsettled`:
  layers.js decides that from layers.json `licence: UNSETTLED…` (layers.js:598); registering never lifts it (:128).
- Q5 spider graphs: only `overview.json` (testcode@d09c185 spider/…v5…/spider/overview-graph.json) and
  `periodic-table.json` (stars@cbca125 blocks/graph.json) are copied, byte for byte, listed DISCLOSED with sha256 in
  apps.json's spider row. Node keys are computed at runtime (repository node: its first commit's k0 from KY.hooks.repos/
  commits; block node: the element key from data/elements.json). Nothing fetched off-origin, ever.

## Data shapes
- `data/apps.json`: `{schema:'kuiper.apps.v1', edition, built_by:'tools/apps_registry.py', provenance:{sources:[{repo, commit,
  path, sha256}]}, counts:{register:7, homepage:25, issued:2, total:34}, apps:[{key, id, key_source, name, kind, purpose,
  link, source_href?, licence, licence_key, source, wafer, same_as, copied, graphs?}]}`; `key` matches
  `^(block:[A-Za-z0-9]+|surface:https://)` per ROADMAP A1: register rows `block:<Sym>`, homepage and issued rows
  `surface:<stable link>` with `id` = the homepage `data-entity-id` (or `spider-sandbox` / `periodic-table`, `key_source:
  issued-here`). `copied`: `linked` (default: we link to the app) or `copied` (graph data copied into the edition).
- `data/elements.json`: `{schema:'kuiper.elements.v1', edition, built_by:'tools/element_keys.py', source:{repo:'elements',
  commit:'f7a92fb…', path:'catalogue/elements.json', sha256}, licence_note:'keys only (Q1)', counts:{total:244, placed:221,
  named:23, by_kind_unplaced:{…}}, elements:[{sym:'block:Xx', key:<int or null>, repo, commit, path, line:1, line_text?, why?}]}`.
  `line_text` = line 1 of that file at that commit (the code line, licensed by its own repository, as keys.json does), so
  the card's header is the line at its key. The 23 unplaced: `key:null, why:'no register files'`.

## Who does what (ONE module file; sections marked LEAD / BUILDER)
- LEAD: SECTION A (data), B (launcher panel `#ky-apps` under the bar, rows ≥44 px, header = key line, then name, purpose,
  licence, link; same-tab navigation after closing the panel's history entry; HEAD check → `FAIL` in the row, never
  hidden; the periodic-table app panel by number), D (readout), install/registration; `tools/apps_registry.py` +
  `data/apps.json` (A1 script `tools/apps_registry.py --check`).
- BUILDER: `tools/element_keys.py` + `data/elements.json` (the `edition_keys.py` walk applied to each element's `files[0]`;
  `--check` prints placed/named and runs `tools/key.py` on three samples), the copies of the two graphs into
  `data/graphs/`, and SECTION C of the module: C1 elements layer `KY.modules.layers.api.register({id:'elements',
  module:'apps', load, draw})` (load returns {placed, total}; draw `fn(o2)` sparks in #c9d3e6, UNSETTLED amber, selected
  magenta), C2 spider layer (same register, id `spider`; 15 chords for overview, readout counts periodic-table nodes
  without a key; missing data/graphs → FAIL in its row, wafer draws on). Builder edits by exact-string Edit INSIDE the
  `SECTION C` block only, and writes status here.
- TESTER: `handoff/07-apps/test.cjs` (form of FIXES/NL-009/android-journey.cjs; Pixel 7 and Galaxy S24, real touch,
  0 console errors) for A1-A6; until the integrator admits modules, run under team 6's scratch-site method
  (/tmp/nl010-opus/team-6/lead/site, mksite.py) with apps added to the manifest; TEST.md; img/ ≤4 PNG <300 KB
  (launcher, table layer row/readout, spider layer, offline).
- EVIDENCE: EVIDENCE.md (a key for every hook, every GridAtlas lesson, every licence), LICENCE.txt, header licence line,
  copied-versus-linked list (COPIED.md section inside EVIDENCE.md), review of HANDOFF.md.
If tester/evidence have not appeared by 23:30 UTC the lead does their parts.

## Status
- 23:09 skeleton cut (registers, api list/open/close/inspect stubs; node --check OK).
- 23:14 LEAD → BUILDER, measured facts for element_keys.py: elements@f7a92fb catalogue/elements.json is a list of 244;
  23 have no `files` (12 constant, 6 layer, 4 engine, 1 cartridge). `files[0].repo` spans 26 repositories; clones exist
  for globalgrid2050 (90), gridatlas (23), ventus-grid-engine (16), galaxies-wafers (10), testcode, code-generator,
  star-maker, grid-distance-maths, data-grid-gb, cvaa (all /home/user/estate/), pipelinenews (20) and
  globalgrid2050-homepage (/home/user/). NO clone for claude (15), chatgpt-audits (8), youengineer-code-review (6),
  data-federation-map-…(5), star-solar-star (5), star-quantum-twin, star-sector-star (2 each), cable-trench-or-drill,
  solar-electrical-topology-…, spiders, companies, registry_of_…, v11, gpu-drivers-… (1 each). Import the walk from
  tools/edition_keys.py (load_wafer, find_clone, walk_commit, lines_of; roots /home/user/estate,/home/user); for a repo
  with no clone try a shallow fetch of that one commit into /tmp/nl010-opus/team-7/builder/clones/ (gh is configured;
  one at a time, the machine is loaded); if that fails, write `key: null, why: 'no clone of <repo> at <sha12>: key not
  computed'` and COUNT it separately. Never invent a key, never place at k0 silently. Report the measured counts here
  (placed / not computed / no files); the ROADMAP's 221 is "commit on the wafer", the key needs the walk.
- 23:15 BUILDER (OPUS-7 builder): `tools/element_keys.py` written (imports tools/edition_keys.py walk_commit/load_wafer/
  batch_read, no copy of the law; writes the PLAN shape `{schema, edition, built_by, source, licence_note, counts, readout,
  checks, elements:[{sym, number, key, placed, repo, commit, path, line:1, line_text, k0, wafer_row, why, ...}]}`; Q1: no
  title/description/category). Local clones are shallow: 50 of 221 files[0] commits are in repositories with no local
  clone and globalgrid2050@d3898fa (90 elements, 33,106,402 lines) is not in the shallow clone at c66759f; fetching those
  commits depth 1 into /tmp/nl010-opus/team-7/builder/clones (13 small repos done, globalgrid2050 in progress).
  `data/graphs/overview.json` (sha256 124aa35e…df09, 6,125 B, = testcode@d09c185 spider/20260914T143049Z-v5-…/spider/
  overview-graph.json) and `data/graphs/periodic-table.json` (sha256 72349730…749e, 509,649 B, = stars@cbca125
  blocks/graph.json, git blob 6d361d33) copied byte for byte. FINDING for the spider layer: the overview graph's 16 nodes are
  `overview` + 15 `graph:<id>`; none names a repository or block; all 16 `ext` URLs are served from
  ventusltd.github.io/ventus-grid-engine/, so by the surface rule (served folder -> repository -> first commit k0) all 16
  key to ONE place: the 15 edges are drawn but degenerate (drawn as loops at that place, readout says so).
