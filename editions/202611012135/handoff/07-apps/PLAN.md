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
- 23:22 TESTER (OPUS-7 tester) → LEAD, BUILDER: what `handoff/07-apps/test.cjs` reads (build to this or tell me in this file
  and I change the test). Scratch site: /tmp/nl010-opus/team-7/tester/site on 8472 (team 6's method, modules shell,
  line-card, layers, file, see-through, apps; `python3 /tmp/nl010-opus/team-7/tester/mksite.py` re-copies modules/).
  Every device run blocks every off-origin request (A6 is the whole run, not a sub-step) and counts console errors
  strictly: a fetch(HEAD) to an off-origin link that is blocked prints "Failed to load resource" = a console error = FAIL,
  so off-origin rows must not be HEAD-fetched in a way that logs (e.g. say `not checked: off-origin` or check same-origin
  only); a same-origin link that 404s is FAIL in its row (that console 404 is expected and listed).
  DOM: launcher `#ky-apps` (visible = open), top >= `#kuiper-menu-bar` bottom; rows `#ky-apps [data-key]` (34, one per
  apps.json record, `data-key` = the record's key, `data-id` = its id); the row's FIRST visible text line = its key;
  each row >= 44 px tall; a row's state in `[data-st]` text (OK / FAIL / not checked ...). Opened by a real tap on FILE >
  `#ky-file-open-app` (file.js:652-654 calls api.open()). Tapping the See Through row navigates the same tab to
  `../../see-through/`; the spider row to its link (test routes that one URL to a stub and asserts the URL).
  `page.goBack()` returns to the edition with `#ky-apps` closed.
  Layers: `KY.modules.layers.api.get('elements').status === 'REFUSED'` and the WAFER row `label.ky-ly[data-id=elements]
  .st` text contains `REFUSED` and `licence unsettled`; spider row via a real tap on `label.ky-ly[data-id=spider]` → OK.
  Readout (KY.hooks.hud text or any text in the page): `221 elements placed, 23 counted, not placed` and
  `606 in the live register, 244 catalogued`; a line naming the periodic-table nodes with no key (/(\d[\d,]*)[^\n]*no key/).
  inspect(): `elements: {placed:221, named:23, total:244}`, `spider.graphs.overview: {nodes:16, edges:15, drawn:15}`,
  `spider.graphs['periodic-table']: {nodes:663, edges:2481, nokey:<n>}`. With `data/graphs/*` answered 404 (routed, no
  file deleted) the spider row is FAIL naming the file and `lines` stays OK.
  A4 card: while Q1 holds the elements layer draws nothing, so the card is tested from the periodic-table app panel if
  it exists: `#ky-apps-elements [data-sym]` rows; a tap opens `#card` whose first line = that element's `line_text` and
  second = `block:<Sym>`. If there is no such panel the test reports A4-card NOT EVALUATED (never a pass) - say which.
  FINDING for LEAD (A1 by script): apps.json rows `solar-design-studio` and `energy-transition-simulator` share one key
  (homepage_v134.html:44 and :46 carry the same href, the source is right) but both `same_as` are []; 7.1 says
  `same_as` cross-references: each should name the other. The test checks it.
- 23:27 BUILDER FINDING (K1, urgent): tools/check_proof.py leaks() (the K1 privacy digest) MATCHES in three edition data
  files: `data/apps.json` (LEAD's), `data/elements.json`, `data/graphs/periodic-table.json`. The matching token (15
  characters, not spelled here) is a folder name inside globalgrid2050 that equals a non-public repository name; it is
  in stars@cbca125 blocks/graph.json itself (block x618 "Functions from globalgrid2050 <token>/index.html"). The harness
  has already committed apps.json and periodic-table.json on the branch. BUILDER fixes: element_keys.py redacts any
  token whose digest is in check_proof.NOT_PUBLIC (replaced by `not-public`, field `redacted` names what) and the
  periodic-table graph becomes a REDACTED copy (both sha256 recorded: source and copy). LEAD: please run
  `python3 -B -c "import sys,io;sys.path.insert(0,'tools');from check_proof import leaks;print(leaks(io.open('editions/202611012135/data/apps.json').read()))"`
  from the kuiper-belt root and redact apps.json the same way (element_keys.redact() is importable).
- 23:25 LEAD (date -u read 23:25 when written; first written as 23:27, a stamp ahead of the clock, corrected): SECTIONS A, B, D and install are in (node --check OK); `tools/apps_registry.py` + `data/apps.json` written,
  `--check` (A1 by script) RESULT: PASS (34 records; 33 unique keys: solar-design-studio and energy-transition-simulator
  share homepage_v134.html's href and now name each other in `same_as`, tester's FINDING fixed). Measured on Galaxy S24
  (lead scratch site 8470, modules shell, line-card, layers, file, apps; all admitted, refused []): FILE > Open an app
  opens `#ky-apps` under the bar (top 35, bar bottom 34), 34 rows, min height 71 px, first row header
  `surface:https://ventusltd.github.io/kuiper-belt/see-through/`; See Through row → same tab `/see-through/202610050609/`
  title "See Through"; goBack → edition, launcher closed. Fixed on the way: file.js closes the shell panel
  (history.back(), async) and calls api.open() at once; the shell's popstate then closed the launcher; open() now waits
  for that popstate when history.state is a shell entry.
  TESTER contract accepted: rows `#ky-apps [data-key][data-id]` (class ky-app), state `[data-st]` (text ` · OK · HTTP 200`,
  ` · FAIL · …`, ` · not checked (other host)`); off-origin links are NOT fetched on open: one button at the END of the
  list, `button.ky-check`, "check the N links to other hosts (fetch HEAD)" (do not tap it in the strict run); same-origin
  links HEAD on open. Elements panel `#ky-apps-elements` with `button.ky-el[data-sym]`, opened by the periodic-table row's
  `button.ky-app-w` ("keys ▸"); a tap closes the launcher, flies to the key and opens `#card` (header `.ky-ec-h code` =
  line_text, then `.ky-ec-s` = block:<Sym>). inspect(): spider graph counts use the BUILDER's field `no_key` (not `nokey`).
  Readout line: `periodic table: 221 elements placed, 23 counted, not placed · <N> in the live register, 244 catalogued ·
  layer REFUSED · licence unsettled (…)`. BUILDER: please add `counts.live_register` (measured 606 from stars@cbca125
  blocks/blocks.json, number of blocks) to data/elements.json; the module reads it and never hard-codes 606.
- 23:27 BUILDER DONE (OPUS-7 builder). Everything measured on this machine:
  * `data/elements.json` (sha256 781dc0d9…a620, 165,383 B; the record layers.json now carries) by
    `python3 -B tools/element_keys.py --elements /home/user/estate/elements --roots /home/user/estate,/home/user,/tmp/nl010-opus/team-7/builder/clones --out editions/202611012135/data/elements.json --check 3 --keypy-root /home/user/estate`
    (72 s): 244 total, 221 placed (every walk of the 26 distinct files[0] commits landed on its wafer row's lines,
    e.g. globalgrid2050@d3898fa 33,106,402), 23 named, not placed (constant 12, engine 4, layer 6, cartridge 1),
    `readout` "221 elements placed, 23 counted, not placed". Reverse check (key -> wafer row -> walk -> path:1) OK on
    block:Gc, block:x174, block:x466; `tools/key.py` itself (unmodified, ROOTS set to /home/user/estate at import) exit 0
    and naming the recorded repo / sha12 / path:1 on block:x776 38,104,477,612 (grid-distance-maths src/geodesy.mjs),
    block:x126 45,103,705,422 (cvaa tools/selftest.mjs), block:Gc 47,018,556,351 (ventus-grid-engine engine/geo-core.js);
    all in the file's `checks` / `checks_keypy`. One record K1-redacted (block:x618 path and github), key untouched.
    The file carries built_utc and seconds, so every rebuild changes its sha256: re-record it after a rebuild.
  * `data/graphs/overview.json` byte for byte (124aa35e…df09, 6,125 B); `data/graphs/periodic-table.json` K1-redacted
    copy (b8482044…3a0e, 509,639 B; source 72349730…749e, 509,649 B; 2 tokens -> `not-public`) by
    `python3 -B tools/element_keys.py --copy-graph <source> <copy>`. EVIDENCE: record both digests.
  * SECTION C in the module (node --check OK; unit test outside the browser,
    /tmp/nl010-opus/team-7/builder/test_sectionC.cjs, real files + Node webcrypto): registers `elements` (load ->
    {placed 221, total 244}; draw = sparks #c9d3e6, the card's element magenta; a tap within 9 px mouse / 24 px finger of a
    DRAWN spark calls openElement) and `spider` (sha256 + bytes checked before parse; load -> {placed 567, total 2,496}).
    Readout line (st.said): "spider graphs: overview 15 of 15 edges drawn (15 as rings: both ends at one key), 0 of 16
    nodes had no key · periodic-table 552 of 2,481 edges drawn, 412 of 663 nodes had no key". With data/graphs/ absent:
    "spider graphs: FAIL · data/graphs/overview.json HTTP 404 · the wafer draws on", layer row FAIL. Waits up to 30 s for
    layers.js to hold both records before registering; without the layers module both still load for inspect().
    Periodic-table graph keyed nodes: 206 by element key, 45 repositories by first-commit k0; unkeyed 412 = 377 auto
    blocks not in the 244 catalogue or not placed, 12 categories, 23 unplaced elements.
  * NOT run: Playwright (machine load ~50 on 4 cores; brief says avoid unless the lead asks). Tester: A4 tap needs the
    elements layer DRAWN, which layers.js refuses while its licence reads UNSETTLED (Q1) — the launcher's keys view and
    `KY.modules.apps.api.openElement('block:Gc')` still open the card.
- 23:29 LEAD → TESTER: (1) FILE opening makes file.js HEAD its seven EVIDENCE files; 3 are not written yet
  (proof/edition-sha256.txt, LICENCES.md, proof/android-journey.json → 3 console 404s, measured on 8470). They are Opus 6's
  and the integrator's, not this module's: list them by URL as "other module, not counted" or the E gate can never pass
  before integration; anything from data/apps.json, data/elements.json, data/graphs/* or ../../see-through/ counts.
  (2) homepage `purpose`/`name` are html.unescape()d from the line (`&amp;` → `&`, `&#x27;` → `'`): compare unescaped.
  (3) `cable-selection` row: link written `https://globalgrid2050.com/not-public/` with `link_withheld` (K1: the folder
  name equals a non-public repository); its source line's href differs on purpose; its row reads "link withheld (K1)".
  (4) the stars graph copy differs from stars@cbca125 blocks/graph.json by 2 K1 tokens (`not-public`); apps.json spider
  row `graphs[]` records both digests (`sha256` of the copy, `source_sha256`) and `k1_redacted_tokens: 2`.
  LEAD also wrote LICENCE.txt and REQUESTS.md (evidence officer: please review rather than rewrite).
- 23:29 LEAD → BUILDER (your K1 message): done before it arrived. tools/apps_registry.py redacts with
  tools/element_keys.py redact() (row `cable-selection`: link and key written `https://globalgrid2050.com/not-public/`,
  `link_withheld` names K1; launcher shows "link withheld (K1)"). Measured: check_proof.leaks() (the function ci_check.py
  K1 calls) over the 11 team-7 files (tools x2, module, data x4, handoff) = 0 matches; `python3 tools/ci_check.py` from the
  kuiper-belt root: "K1 privacy: 642 tracked files scanned, 0 match a private digest", RESULT: PASS (our files are not
  tracked yet, hence the direct scan). Builder findings carried to the HANDOFF: the 15 overview edges are rings (all 16
  nodes keyed by one served folder, ventus-grid-engine); the elements layer is REFUSED until Q1, so A4's spark-tap is
  NOT EVALUATED with that reason (the card is tested from the periodic-table panel instead).
- 23:3x TESTER (time not read from date -u when written; between run 1 end 23:36 and 23:46): test.cjs written; script gates (A1 by script against APPS.md:7-13, homepage_v134.html:32-56, INDEX.md:13;
  Q1/Q5; elements.json vs catalogue + cosmos/wafer.tsv; tools/key.py on 3 samples) ALL PASS. Device run 1 FAILED at M:
  team-6's 22:50 index has no `refuse` hook and layers.js (23:23) now requires it, so layers and file were refused. The
  tester site now uses the integrator's live index.html (sha256 418ae14c…, loader rev 3 with KY.refuse; team 3's
  index.html.patch does NOT apply to it: 2 of 6 hunks fail, so it runs without those deletions). Accepted in the test:
  `source_href` + stable folder link (see-through, learn-the-kuiper), K1-withheld link (cable-selection), `no_key`.
- 23:46 TESTER (corrected: first headed 23:58, a guess, not read from date -u) run 2 (Pixel 7, integrator index): M, A2 x4, A4 REFUSED row PASS. FAIL for LEAD: (1) the launcher stays
  open when WAFER (any other bar title) is tapped: #ky-apps (z 10025) covers the WAFER panel, the next tap meant for the
  spider row landed on a launcher row and left the page (measured: GET https://globalgrid2050.com/scripts/
  upgrade_v5_skid_mva_controls.py). Gate added: "a real tap on WAFER while the launcher is open closes the launcher"
  (one panel at a time, step 1 A5). (2) readout lacks "606 in the live register, 244 catalogued": waits for the
  BUILDER's counts.live_register. Not ours: file.js EVIDENCE rows 404 (proof/edition-sha256.txt, LICENCES.md,
  proof/android-journey.json; integrator writes them) -> listed as E' (FAIL, or NOT EVALUATED with
  --allow-missing-evidence), never counted as a team-7 console error.
- 23:47 EVIDENCE (OPUS-7 evidence officer) → LEAD, BUILDER: keys re-verified by script (all 5 provenance sha256 equal the
  sources at their commits; 25 homepage rows: id, name, kind, purpose and line equal homepage_v134.html:32-56; links
  equal except see-through / learn-the-kuiper (pointer, source_href kept) and cable-selection (K1); 7 register rows:
  key = APPS.md:7-13, link = catalogue/apps.json live[0], wafer = files[0]; both graph copies verified, the stars copy =
  source with 1 token x 2 occurrences replaced; K1 leaks() = 0 over all 11 team files and the whole edition folder; no
  file contains the underscore token). DEFECTS for you to fix (EVIDENCE.md section 9 lists them; HANDOFF must not claim
  them done until fixed): (a) apps.json periodic-table purpose cites neural-link BRIEF.md:9; the owner's "bring in
  periodic table" is BRIEF.md:8 (tools/apps_registry.py:213). (b) elements.json register_note keys the 606 at
  stars@cbca125 blocks/blocks.json:2; that file has 0 newlines (one line): the key is blocks/blocks.json:1, len(blocks)=606.
  (c) elements.json has no counts.live_register, so the module (apps.js:85) prints "the live register not counted" and the
  tester's "606 in the live register, 244 catalogued" check fails. (d) module header/REQUIRES: H.cv is used
  (apps.js:418,423) but not in requires; safeBox, panels and address are required but never called. (e) apps.json
  spider graphs[1].copy_matches_source = true although k1_redacted_tokens = 2: write false (or "after K1 redaction").
  (f) apps.json top-level licence "CC BY 4.0" is not true of the 25 copied homepage name/kind/purpose lines: those are
  globalgrid2050 CERN-OHL-S v2 (globalgrid2050@c66759f LICENSE.txt:1); say so in the field. (g) block:St licence is
  now evaluable: solar-electrical-topology-analysis-engine-text-based@d3b4c49 LICENSE:1 GNU GPL v3 (builder's clone);
  apps.json still says NOT EVALUATED. (h) spider row name is INDEX.md:1, purpose INDEX.md:13; source cites :13 only.
  (i) HISTORY: K1-matching versions are PUSHED on origin/edition/202611012135: data/apps.json@b8e7c74,@b4a5dba,
  data/elements.json@38ed53c, data/graphs/periodic-table.json@b8e7c74 (leaks()=1 each). ci_check K1 reads the tree only,
  so it passes; the branch history still carries the token. FINDING for the harness/owner, not fixable by this team.
- 23:47 LEAD (date -u): TESTER (1) fixed: a pointerdown on #kuiper-menu-bar while the launcher is open hides it at
  once (capture listener); its history entry is replaced by {kyAppsClosed} and skipped when back lands on it (the shell
  pushes its own entry in the same gesture, so an async back there would pop the shell's). Also: every open() resets the
  list scroll to the star player (measured: a kept scroll hid the See Through row). Pixel 7 on 8470 (integrator index +
  shell, line-card, layers, file, apps; all admitted, refused []): launcher 34 rows min 71 px; keys ▸ → 244 element rows,
  23 disabled; tap block:Gc → card header "/* geo-core — the one distance primitive, and the earth model it stands on.",
  second "block:Gc"; readout lines present; See Through tap starts same-tab navigation (the loaded machine timed out the
  page before goBack in that run; the 23:20 Galaxy S24 run completed NAV + BACK). TESTER: your "23:58" heading is ahead
  of the clock (date -u read 23:46-23:47 at that time); please correct it. BUILDER: counts.live_register still absent
  from data/elements.json; please add it (measured count of stars@cbca125 blocks/blocks.json blocks) and re-run.
- 23:48 LEAD: requires narrowed to the 16 names the module uses (removed address, safeBox, panels: never called;
  added cv: SECTION C's tap test reads H.cv). Module changed since the testers' last copy: re-run mksite before the next run.
- 23:55 TESTER (date -u): run 3 (Pixel 7, module of 23:37): spider layer PASS (OK, overview 15 of 15 drawn as
  rings, readout "412 of 663 nodes had no key"), elements REFUSED PASS, card header = line_text for block:Gc, x309, x996
  (the test's text-walk probe was wrong; fixed). FAIL: 606 line (counts.live_register), one-panel (fixed by LEAD at 23:47,
  not in that copy), the spider row tap did not navigate within 120 s and the page then had no bar for 60 s (diagnostics
  added: location, history.length, inspect().navigated). Re-running on the 23:48 module.
- 23:59 LEAD: the builder has been silent since 23:24, so the lead added `live_register()` to tools/element_keys.py
  (counts the blocks of stars@cbca125 blocks/blocks.json from git's bytes: 606, sha256 07675d74…a573) and re-ran the
  recorded command. data/elements.json: the 244 element records are byte-identical to before, checks_ok and
  checks_keypy_ok are true, counts.live_register 606, and the file sha256 is now 28b8b2df…4c02; K1 leaks 0. The readout now reads
  "… · 606 in the live register, 244 catalogued". TESTER: re-copy the data (it is symlinked on your site) and the module.
- 00:10 LEAD → TESTER, on run4 A5: your own page probe read `location.href` = the spider link
  (https://github.com/Ventusltd/testcode/tree/d09c185…/spider/…v5…/), so the module did navigate the same tab; `landed` was
  read before the stub committed (load ~65 on 4 cores). Suggest `page.waitForURL(link, {timeout:180000})` after the tap.
  ("navigated": null is the next page's context, no inspect() there.) run4's readout FAIL is the pre-00:00 elements.json;
  live_register is in since 23:59.
- 00:23 TESTER (date -u): run 5, module sha256 fa01e012…d481 (42,561 B), integrator index 418ae14c…, BOTH devices
  (Pixel 7 then Galaxy S24, one at a time): 12 of 12 script gates PASS (key.py on block:Gc, Vn, Sp), 17 of 17 device gates
  PASS on each device, 0 console errors, 0 pageerrors, 0 off-origin requests made. Only non-pass: E' NOT EVALUATED = the
  3 EVIDENCE files of file.js the integrator writes (proof/edition-sha256.txt, LICENCES.md, proof/android-journey.json).
  Final run with the screenshot changes (spider layer shown with no panel over it, plus element card) now writing
  handoff/07-apps/TEST.md and img/. Do not change the module until it reports, or the run is void.
- 00:35 LEAD: SEALED for the hand-off run. Evidence defects fixed: (a) BRIEF.md:8; (b) register_note keys blocks.json:1
  and reads the measured counts.live_register; (e) graphs[] now carry `byte_for_byte` (false for the stars copy) and
  `copy_equals_source_after_k1`; (f) the top-level licence says the quoted homepage lines keep CERN-OHL-S v2 and the spider's
  Apache-2.0; (g) block:St licence GPL-3.0, solar-electrical-topology-analysis-engine-text-based@d3b4c49 LICENSE:1, read at
  the register file's commit (the builder's fetch; the served HEAD not evaluated); (h) spider row source names INDEX.md:13
  and :1. apps_registry.py --check RESULT: PASS; K1 leaks 0 on all four files. elements.json records unchanged (checks_ok,
  checks_keypy_ok true). Digests now (MODULE.sha256): module fa01e012…d481 (unchanged since 23:48, = run5), apps.json
  ba59b9bd…a334, elements.json e204cb41…64d5, graphs unchanged. MODULE.json written.
  TESTER: run5 PASSED both devices on module fa01e012 with the older apps.json/elements.json. Please run ONE final
  hand-off run (both devices, --shots img/ --testmd TEST.md) on these bytes; nobody writes module or data until it ends.
  EVIDENCE: re-key against MODULE.sha256 and review HANDOFF.md (draft next, in this folder).
- 00:36 LEAD → EVIDENCE: HANDOFF.md draft is in this folder (placeholders UTC_STAMP, HEAD_SHA, TEST_STATUS, TEST_TABLE
  are filled from the final run). Please review and write your verdict in EVIDENCE.md §10.
- 00:38 EVIDENCE → LEAD: EVIDENCE.md section 10 written. Defects a-h all fixed (re-verified on apps.json ba59b9bd…,
  elements.json e204cb41…; MODULE.sha256 5/5 OK; K1 0). HANDOFF.md review: fill the four placeholders ([UTC_STAMP],
  HEAD_SHA, TEST_STATUS, TEST_TABLE) before posting, and STATUS must say PASS for team-7 gates with E' NOT EVALUATED and
  A4 spark-tap NOT EVALUATED (Q1), not a bare PASS. With those, evidence VERDICT: PASS. (Note: layers.js admitRecord is
  now :599-600, not :598; HANDOFF's ":598" is one line off.)
- 00:39 TESTER (date -u): FINAL run (test.cjs sha256 16d9d827…2999, module fa01e012…d481) wrote TEST.md and img/ (4 PNG,
  37-172 KB). 12/12 script gates PASS; 17/17 device gates PASS on Pixel 7 and on Galaxy S24; 0 console errors, 0
  pageerrors, 0 off-origin requests. Verdict: PASS for every team-7 gate; E' NOT EVALUATED (integrator's 3 EVIDENCE
  files). The tester does not refuse the hand-off on team-7 grounds; a module change after fa01e012 voids this run.
