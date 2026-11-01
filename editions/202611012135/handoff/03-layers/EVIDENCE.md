# Opus team 3, step 3 "the layer registry": EVIDENCE

Evidence officer OPUS-3, 1 Nov 2026. Law: no claim without a key. Every table row with a key is
`repo@sha path:line` and a literal fragment that stands on that line. `kuiper-belt@WORKTREE` means the uncommitted
edition folder on branch `edition/202611012135` as it stood when this file was written (the module is anchored by its
sha256 in section D); `neural-link-between-agents path:line` is the harness repository's working tree.
`/tmp/nl010-opus/team-3/evidence/check_keys.py` re-reads every row (git show for a sha, the file for the worktree)
and PASSes only if the line exists and the fragment is on it. Nothing here is remembered; everything was read today.

Heads: gridatlas@5ec7f62 · kuiper-belt@96736f5 (edition branch; the roadmap's 018b46a is its parent) ·
galaxies-wafers@fff6fc6 · elements@f7a92fb · testcode@d09c185 · ventus-grid-engine@96a800e · stars@cbca125 ·
code-generator@857ea81 (all clean clones under /home/user/estate/).

Contents: R the review findings (what must change before the HANDOFF) · A GridAtlas's 63 controls, the proxying and
the admission rule · B the states · C the record schema · D every Kuiper hook the module uses · E the source and
licence of each of the seven layers' data · F the module header · G NL-009 round 1 folded in · H the verdict on
the lead's HANDOFF.

## R. Review findings for the lead, the builder and the tester

First written 22:09 UTC against the module at sha256 `36ac0ea6…` (635 lines) and placed in this folder; re-measured
against the module keyed in section D. Every RESOLVED item is keyed to the line that resolves it.

| # | severity | finding | status (re-measured) | keys |
|---|---|---|---|---|
| R1 | BLOCKER for test.cjs | `window.KY` is frozen by the hook table, so `KY.layers` (ROADMAP step 3 tests 1 and 7) cannot exist; the API is the synchronous return of `install`, at `KY.modules.layers.api` (a Promise would make it `undefined`). test.cjs read `window.KY.layers` | RESOLVED: test.cjs reads `KY.modules.layers.api`; `install` returns the api object. The HANDOFF must say once: "`KY.layers` in ROADMAP step 3 is `KY.modules.layers.api` under kuiper.hooks.v1" | RK1, RK2, RK4 |
| R2 | MAJOR (the requires law) | the module read `H.N`, `H.SPACE` with neither in `REQUIRES` nor the header | RESOLVED: `REQUIRES` and the header list 27 names, equal to the 27 hooks used (section D comparison line). The `modules.json` record the integrator receives must carry the same 27 (REQUESTS.md item 1 said 25 when read) | D |
| R3 | MAJOR | a file record with an empty `sha256` was admitted unverified (`if (src.sha256 && …)`) | RESOLVED: a record without a 64-hex `sha256` is refused, "unhashed data refused"; no `crypto.subtle` is refused the same way | RK3 |
| R4 | MAJOR (licence) | `lines`, `periods`, `repos` named Apache-2.0 for generated data | RESOLVED: CC BY 4.0 (kuiper-belt generated data, README.md:157), `lines` keeping each quoted line's licence | RK6, E1-E4 |
| R5 | MAJOR (a false key) | the `spider` record cited `testcode LICENSE:1` (blank) and a manifest licence that does not exist | RESOLVED: Apache-2.0 for the spider code (LICENSE:2); graph data by source, stars and code-generator DISCLOSED (Q5), spiders NOT EVALUATED | RK7, E21-E37 |
| R6 | MAJOR (licence) | the `see-through` layer's data is Opus team 5's `data/see-through.json`: 4,460 of 5,800 features carry an OpenStreetMap name, an ODbL 1.0 extract, while the file calls itself "Data CC BY 4.0" | RECORD RESOLVED. OPEN for Opus team 5: the file's own `licence` field (a REQUEST from this team) | RK10, E38 |
| R7 | MINOR (a stamp written by hand drifts) | `drawLines` wrote `EDITION 2` (Edition 4's drift, team-2 EVIDENCE B2.19) beside `EDITION 5` literals | RESOLVED: one function names the edition from `KY.edition`; no `EDITION 2` or `Edition 5` literal remains (`grep` empty) | RK5 |
| R8 | MINOR | `editions` record said `edition-keys.v1`; `loadEditions` demands `kuiper.editions.v1` | RESOLVED 21:52 (`data/editions.json` built: 5 editions, 2 placed, 3 beyond the rim) | E39 |
| R9 | MINOR | `#refuse` has no hook; the loader writes it through the page's own `refuse()` | WORKED AROUND in the module (a MutationObserver re-appends the layers line if the page rewrites the strip). OPEN: a `refuse(text, slot)` hook from Opus team 4 would retire the workaround | RK8, RK11 |
| R10 | NOTE | without team 1's shell the Edition 4 bar title `lines` has no panel behind it after the patch; the module registers `wafer` | OPEN until the shell is admitted (team 1 replaces the title by WAFER, ROADMAP R2; the module mounts into the shell's `.gm-group[data-group="layers"]`) | RK12 |
| R11 | MINOR | `window.__KUIPER_LAYERS__`, a write outside `KY` (ROADMAP 4.7) | RESOLVED: removed (`grep` empty) | RK2 |
| R12 | NOTE | panel id `#layers` (team 2's test 1) against ROADMAP 4.7's `#ky-<id>` host | met both ways: the host is `#ky-layers`, the seven rows sit in `#layers` inside it | C |

Keys for section R:

| # | claim | key | fragment |
|---|---|---|---|
| RK1 | the hook table is frozen: no module can add `KY.layers` | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:36 | `const KY = Object.freeze({` |
| RK2 | a module's API is `KY.modules[id].api`, only when `install` returns it synchronously | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:99 | `api: (api && typeof api.then === 'function') ? undefined : api` |
| RK3 | a record without a 64-hex sha256 is refused | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:161 | `unhashed data refused'));` |
| RK4 | test.cjs reads the API where the frozen table puts it | kuiper-belt@WORKTREE editions/202611012135/handoff/03-layers/test.cjs:83 | `L = (KY && KY.modules && KY.modules.layers && KY.modules.layers.api)` |
| RK5 | the edition is named from `KY.edition`, once | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:38 | `function edName() { return 'Kuiper edition ' + (KY && KY.edition ? KY.edition : '?'); }` |
| RK6 | the `lines` record's licence | kuiper-belt@WORKTREE editions/202611012135/data/layers.json:118 | `CC BY 4.0 (kuiper-belt generated data, README.md:157); each quoted line keeps its repository's licence` |
| RK7 | the `spider` record's licence | kuiper-belt@WORKTREE editions/202611012135/data/layers.json:218 | `Apache-2.0 for the spider code (testcode@d09c185 LICENSE:2); graph data: ventus-grid-engine Apache-2.0` |
| RK8 | the loader writes the alert strip through the page's own `refuse`, which `KY` does not expose | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:62 | `function kyRefuse(t){ refuse(t, 'modules'); }` |
| RK10 | the `see-through` record's licence | kuiper-belt@WORKTREE editions/202611012135/data/layers.json:154 | `ODbL-1.0 for the substation names (OpenStreetMap contributors` |
| RK11 | the module keeps its alert line when the page rewrites the strip | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:215 | `the page's refuse() rewrites textContent; keep our line` |
| RK12 | without the shell the panel is registered as `wafer` | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:284 | `KY.panels.add('wafer', panel, 'WAFER'); panelName = 'wafer';` |

## A. GridAtlas: the 63 controls, the proxying, the admission rule (the lesson step 3 copies)

Measured today at gridatlas@5ec7f62: `sed -n 142,264p atlas/releases/202608300453-atlas-v9/index.html` holds 60 `id:`
entries, 60 unique, under 11 `group:` lines; the Pipeline News `CONTROLS` table (pipeline-news-layers.js:81-100) holds 3
`id:` entries; 60 + 3 = 63, the number the menu bar demands.

| # | lesson | key | fragment on that line |
|---|---|---|---|
| A1 | The inventory the menu bar will accept: 60 engine | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:32 | `EXPECTED_ENGINE_LAYERS = 60` |
| A2 | 3 Pipeline News | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:33 | `EXPECTED_PIPELINE_LAYERS = 3` |
| A3 | 63 in all | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:34 | `EXPECTED_LAYER_CONTROLS = 63` |
| A4 | A layer is a record: the shell declares the 60 as data | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/index.html:142 | `const ukConfig = [` |
| A5 | the first of the 11 groups | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/index.html:144 | `group: "Topology (GeoJSON)"` |
| A6 | the first record: id, label, colour | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/index.html:146 | `{ id: "400",  label: "400kV", color: "#0054ff"` |
| A7 | the records are handed to the engine once | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/index.html:264 | `config: ukConfig` |
| A8 | the engine indexes the records by id | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:61 | `const layerConfigById = new Map(` |
| A9 | one original `<input type=checkbox data-layer-id>` per record | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:991 | `input.setAttribute('data-layer-id', layer.id)` |
| A10 | the same builder line in the live engine cartridge | gridatlas@5ec7f62 atlas/cartridges/202609062358-substation-intelligence-v9-63.js:1060 | `input.setAttribute('data-layer-id', layer.id)` |
| A11 | the three Pipeline News controls are a table | gridatlas@5ec7f62 atlas/modules/202609030048-pipeline-news-layers.js:81 | `const CONTROLS = [` |
| A12 | and dispatch on their own attribute, never the engine's | gridatlas@5ec7f62 atlas/modules/202609030048-pipeline-news-layers.js:358 | `input.setAttribute('data-pn-layer', control.id)` |
| A13 | the rule, in its header | gridatlas@5ec7f62 atlas/modules/202609030048-pipeline-news-layers.js:22 | `borrow the styling, never` |
| A14 | one namespaced key per control, `engine:<id>` / `pipeline:<id>` (Kuiper: `layer:<id>` on `data-ky-layer`) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:79 | `function layerKey(input)` |
| A15 | the proxy rule: the Grid menu proxies the 63 ORIGINAL inputs | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:12 | `the Grid menu proxies those 63 ORIGINAL inputs` |
| A16 | so the owner's handlers stay the only implementation | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:13 | `handlers remain the only implementation of behaviour` |
| A17 | two surfaces, one truth: the dropdown and the panel drive the SAME inputs | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:314 | `this panel drive the SAME 63 original inputs` |
| A18 | `inventory()` collects the originals by attribute | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:107 | `function inventory(doc)` |
| A19 | `complete` is a five-part predicate (60, 3, 63, 63 unique, no empty key; :122-126) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:122 | `complete: engine.length === EXPECTED_ENGINE_LAYERS` |
| A20 | the fifth part: no empty key | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:126 | `&& !keys.includes('')` |
| A21 | the probe `menuBar.inspect()` (Kuiper: `KY.layers.inspect()`) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:130 | `state.inspect = function ()` |
| A22 | a later cartridge's contract is written against the probe | gridatlas@5ec7f62 atlas/current.json:687 | `menuBar.inspect() stays {60,3,63,63,true}` |
| A23 | one proxy per original | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1428 | `function buildLayerControls(found)` |
| A24 | a proxy change forwards to `original.click()` and nothing else (Kuiper: `KY.layers.set`) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1458 | `try { original.click(); }` |
| A25 | `syncLayer` mirrors checked, disabled and label from original to proxy, never back (:419-431) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:419 | `function syncLayer(key)` |
| A26 | checked | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:423 | `proxy.checked = !!original.checked;` |
| A27 | disabled | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:424 | `proxy.disabled = !!original.disabled;` |
| A28 | label | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:425 | `proxy.setAttribute('aria-label', layerLabel(original));` |
| A29 | one document `change` listener keeps proxies in step with any change of an original | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1723 | `doc.addEventListener('change'` |
| A30 | a MutationObserver adopts late controls | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1740 | `observer = new MutationObserver(` |
| A31 | the hit target is the whole row: the proxy input stretched over its label | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1419 | `function layerCheckbox(kind)` |
| A32 | the CSS of that stretch | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:257 | `position:absolute;inset:0` |
| A33 | the group is read from where the control sits, never re-declared | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:101 | `function layerGroup(input)` |
| A34 | the six menu names (GRID is WAFER in the Kuiper, ROADMAP R2) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:31 | `MENUS = ['File', 'Edit', 'View', 'Scope', 'Grid', 'About']` |
| A35 | the admission rule: install nothing until all 63 are present and unique | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:10 | `it installs nothing until` |
| A36 | a missing control is published as a failure, never silently skipped | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:17 | `A missing control leaves the old interface reachable` |
| A37 | the inventory is one of the requirements | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:157 | `missing.push('63 unique layer controls')` |
| A38 | a bounded retry, 160 tries | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:35 | `MAX_TRIES = 160` |
| A39 | `loudFailure`: console.error and a `role=alert` naming the counts found (Kuiper: `#refuse[role=alert]`) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1752 | `function loudFailure(doc)` |
| A40 | the alert's words: the originals remain (Kuiper: the wafer keeps drawing) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1763 | `Original controls remain available` |
| A41 | the draw order is a list kept apart from the records (Kuiper: `layers.json` `order`) | gridatlas@5ec7f62 atlas/current.json:14 | `"cartridge_order": [` |
| A42 | a fetched file's bytes are hashed in the browser and a mismatch refused (Kuiper: `FAIL · sha256 mismatch`) | gridatlas@5ec7f62 atlas/index.html:81 | `SHA-256 mismatch` |
| A43 | the hash must be 64-hex | gridatlas@5ec7f62 atlas/index.html:75 | `invalid SHA-256` |
| A44 | the composer fetches its manifest no-store (Kuiper: `layers.json` and every source no-store) | gridatlas@5ec7f62 atlas/index.html:39 | `fetch('./current.json', { cache: 'no-store' })` |

## B. The states: WAIT, LOAD, OK, EMPTY, FAIL, REFUSED

The Kuiper's six states are GridAtlas's engine states plus galaxies-wafers' REFUSED; galaxies-wafers' QUEUE is not
taken (the registry has no fetch queue). Measured: the engine emits WAIT, LOAD, OK, EMPTY and FAIL (rows B1-B6), so
the menu bar's comment naming four (B7) undercounts its own engine by one; the Kuiper takes the five the engine
emits.

| # | state, where it is written | key | fragment |
|---|---|---|---|
| B1 | WAIT: every record starts waiting | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:57 | `RUNTIME_STATE[layer.id] = { status: 'WAIT', loading: false, loaded: false };` |
| B2 | one function writes the state onto the row | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:622 | `function updateUIState(id, state, stats)` |
| B3 | LOAD | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:1135 | `updateUIState(layerId, 'LOAD')` |
| B4 | FAIL when a record has no config: listed, not drawn blank | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:1137 | `if (!layerConfig) { updateUIState(layerId, 'FAIL')` |
| B5 | OK when features came, EMPTY when none did | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:1190 | `updateUIState(layerId, stats.count > 0 ? 'OK' : 'EMPTY'` |
| B6 | FAIL on a thrown load, with console.error | gridatlas@5ec7f62 atlas/releases/202608300453-atlas-v9/ventus-corev8engine.js:1196 | `console.error(` |
| B7 | the label keeps its live suffix: a stripped suffix made success and failure indistinguishable on a phone (:92-95) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:92 | `WAIT/LOAD/OK/FAIL` |
| B8 | galaxies-wafers inherited them: its README names WAIT, LOAD, OK, EMPTY, FAIL as Grid Atlas's states | galaxies-wafers@fff6fc6 README.md:7 | `with Grid Atlas's states:` |
| B9 | galaxies-wafers' row state starts WAIT with an empty `why` (Kuiper: every state carries `why`) | galaxies-wafers@fff6fc6 layers-panel.mjs:86 | `status: 'WAIT', why: ''` |
| B10 | its seven tags, including QUEUE (not taken) | galaxies-wafers@fff6fc6 layers-panel.mjs:117 | `.ltag.WAIT,.ltag.QUEUE` |
| B11 | EMPTY, FAIL, REFUSED tags | galaxies-wafers@fff6fc6 layers-panel.mjs:118 | `.ltag.EMPTY{color:#b39ddb}.ltag.FAIL{color:#ff8a80}.ltag.REFUSED` |
| B12 | LOAD clears `why` | galaxies-wafers@fff6fc6 layers-panel.mjs:307 | `s.status = 'LOAD'; s.why = ''` |
| B13 | OK or EMPTY by count | galaxies-wafers@fff6fc6 layers-panel.mjs:315 | `s.status = n ? 'OK' : 'EMPTY';` |
| B14 | FAIL carries the error's words as `why` | galaxies-wafers@fff6fc6 layers-panel.mjs:318 | `s.status = 'FAIL'; s.why = e.message;` |
| B15 | REFUSED: `refuse()` turns the layer off and says why on its row | galaxies-wafers@fff6fc6 layers-panel.mjs:327 | `s.on = false; s.loading = false; s.status = 'REFUSED';` |
| B16 | a timeout on every fetch, 15 s (Kuiper: a timeout on every source fetch) | galaxies-wafers@fff6fc6 layers-panel.mjs:62 | `FETCH_TIMEOUT_MS = 15000` |
| B17 | the ticked layers written to the URL with `history.replaceState` (Kuiper: `layers=` in the hash, R3) | galaxies-wafers@fff6fc6 layers-panel.mjs:518 | `history.replaceState(history.state, '', next);` |
| B18 | the Kuiper page today: a failed load is a printed error, not an empty success (the FAIL the registry generalises) | kuiper-belt@96736f5 editions/202611012135/index.html:631 | `edMeta = { error: 'keys.json did not load' }` |
| B19 | the wafer's own refusal (every layer REFUSED when it fires) | kuiper-belt@96736f5 editions/202611012135/index.html:207 | `REFUSED: the commits of` |
| B20 | the wafer's load failure (every layer REFUSED with these words) | kuiper-belt@96736f5 editions/202611012135/index.html:240 | `did not load. The wafer will not invent its keys.` |
| B21 | NL-009: with `keys.json` 404 the heading still read "0 verified lines lit" (why the state goes on the row, the heading and the alert) | neural-link-between-agents FIXES/NL-009/round1/09-robust.md:25 | `MINOR` |

## C. The record schema `kuiper.layers.v1`: every field and where it comes from

The governing text names the fields (ROADMAP.md:190-191); team 2 wrote the full record (team-2/STEPS.md:103-113). Each
field below is keyed to the line it was copied from. Where ROADMAP and team 2 differ in spelling (`source.path` at
ROADMAP.md:191, `source.file` at team-2/STEPS.md:107), the module and `layers.json` must use one; section D records
which the lead chose.

| # | field: what it holds | origin key | fragment |
|---|---|---|---|
| C1 | the governing field list | neural-link-between-agents FIXES/NL-010/ROADMAP.md:190 | `The registry record schema` |
| C2 | the six states and `why` | neural-link-between-agents FIXES/NL-010/ROADMAP.md:191 | `state {WAIT, LOAD, OK, EMPTY, FAIL, REFUSED} and` |
| C3 | `schema`, `edition`, `substrate` (team 2's record) | neural-link-between-agents FIXES/NL-010/team-2/STEPS.md:103 | `"schema": "kuiper.layers.v1"` |
| C4 | `order`: the draw order, bottom first, a list apart from the records | neural-link-between-agents FIXES/NL-010/team-2/STEPS.md:104 | `"order": ["periods", "repos", "editions", "lines", "see-through", "elements", "spider"]` |
| C5 | every field required except `deeplink`; `bytes`, `features` measured and checked at load | neural-link-between-agents FIXES/NL-010/team-2/STEPS.md:113 | `Every field is required except` |
| C6 | `substrate`: galaxies-wafers names the wafer its keys belong to | galaxies-wafers@fff6fc6 layers/manifest.json:2 | `"substrate": "wafer.v1"` |
| C7 | `id` | galaxies-wafers@fff6fc6 layers/manifest.json:6 | `"id": "copying"` |
| C8 | `label` | galaxies-wafers@fff6fc6 layers/manifest.json:7 | `"label": "Real copying"` |
| C9 | `group` (a group title in the panel) | galaxies-wafers@fff6fc6 layers/manifest.json:8 | `"group": "WHAT IS WRITTEN TWICE"` |
| C10 | `preload`: nothing fetched until ticked unless true | galaxies-wafers@fff6fc6 layers/manifest.json:9 | `"preload": false` |
| C11 | `colour` (Kuiper: one of PALETTE.md's hexes, C19-C23) | galaxies-wafers@fff6fc6 layers/manifest.json:10 | `"colour": "#ff2bd6"` |
| C12 | `draws` (points or lines) | galaxies-wafers@fff6fc6 layers/manifest.json:24 | `"draws": "lines"` |
| C13 | `source.file` | galaxies-wafers@fff6fc6 layers/manifest.json:13 | `"file": "layers/copying.json"` |
| C14 | `source.bytes` | galaxies-wafers@fff6fc6 layers/manifest.json:14 | `"bytes": 4073845` |
| C15 | `source.features` | galaxies-wafers@fff6fc6 layers/manifest.json:15 | `"features": 41286` |
| C16 | `source.sha256` (galaxies-wafers records it and checks it nowhere, team-2/STEPS.md:95-97; the Kuiper checks it in the browser, A42) | galaxies-wafers@fff6fc6 layers/manifest.json:16 | `"sha256": "3ef484f075b6392d43a970e8446ab7877e8b43d90470ec5fe3d0a921c1ea577f"` |
| C17 | a layer may ship EMPTY with its reason on the row | galaxies-wafers@fff6fc6 layers/manifest.json:119 | `Empty here means not anchored in these records, not absent from the estate.` |
| C18 | `format` `code-feature-collection.v1`: geometry carries keys, never coordinates | galaxies-wafers@fff6fc6 README.md:11 | `A layer is a` |
| C19 | `colour` + `meaning`: the record, grey | kuiper-belt@018b46a PALETTE.md:9 | `the record, as measured: dust, nodes, text` |
| C20 | the instrument, cyan (See Through stars) | kuiper-belt@018b46a PALETTE.md:10 | `the instrument: frames, headings, graticules, buttons` |
| C21 | energised, green (verified lines, repositories, periods) | kuiper-belt@018b46a PALETTE.md:11 | `energised, operational, lit by a query` |
| C22 | attention, amber (editions, UNSETTLED elements) | kuiper-belt@018b46a PALETTE.md:12 | `attention: new, under construction, a boundary` |
| C23 | selected, magenta (the spark under the hand) | kuiper-belt@018b46a PALETTE.md:13 | `selected, the thing under the hand` |
| C24 | nothing coloured for decoration | kuiper-belt@018b46a PALETTE.md:19 | `nothing is coloured for decoration` |
| C25 | `key` `layer:<id>` on `data-ky-layer`: namespaced as GridAtlas namespaces `engine:`/`pipeline:` | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:82 | `if (engine) return 'engine:' + engine;` |
| C26 | `licence`: each record carries its own (ROADMAP licence note) | neural-link-between-agents FIXES/NL-010/ROADMAP.md:220 | `each record carries its own` |
| C27 | admission of a body: on the wafer, verified, finite key inside SPACE | kuiper-belt@96736f5 editions/202611012135/index.html:632 | `edPlaced = ED.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && b.key < SPACE)` |
| C28 | then placed by `keyPlace` and nothing else | kuiper-belt@96736f5 editions/202611012135/index.html:633 | `const p = keyPlace(b.key)` |
| C29 | what fails admission is counted and named, never placed | kuiper-belt@96736f5 editions/202611012135/index.html:651 | `counted, not placed` |
| C30 | the seventh law behind C29 | kuiper-belt@018b46a README.md:84 | `## The seventh law: every body must be openable` |

## D. Every Kuiper hook the module uses

Module keyed: `modules/202611012141-layers.js`, 51,710 bytes, 684 lines, sha256 `1ec07e2348b895a8dac948b675a5b79c01003bb0e9e5d787118c2d3adacf75a2`.

Hooks used (27): N, SPACE, address, big, cam, card, commits, cv, describe, draw, esc, findBy, flyTo, fmt, gbox, hud, keyPlace, lightTime, lit, o2, panels, redraw, repos, safeBox, sel, sub, wafer
REQUIRES array (27): wafer, keyPlace, address, describe, findBy, flyTo, safeBox, fmt, esc, cv, o2, hud, big, sub, card, gbox, repos, commits, N, SPACE, lightTime, cam, lit, sel, redraw, draw, panels
Header requires (27): wafer, keyPlace, address, describe, findBy, flyTo, safeBox, fmt, esc, cv, o2, hud, big, sub, card, gbox, repos, commits, N, SPACE, lightTime, cam, lit, sel, redraw, draw, panels
used but not in REQUIRES: none; in REQUIRES but never used: none; header = REQUIRES: True

| # | hook: what the registry does with it | key | fragment |
|---|---|---|---|
| D1a | `keyPlace` engine line: the placement law; the only way a body gets x,y | kuiper-belt@96736f5 editions/202611012135/index.html:278 | `function keyPlace(k){` |
| D1b | `keyPlace` in the hook table (KY.hooks.keyPlace) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `keyPlace` |
| D1c | `keyPlace` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:183 | `H.keyPlace` |
| D2a | `address` engine line: key to commit, null outside SPACE | kuiper-belt@96736f5 editions/202611012135/index.html:282 | `function address(k){` |
| D2b | `address` in the hook table (KY.hooks.address) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `address` |
| D2c | `address` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:449 | `H.address` |
| D3a | `describe` engine line: the commit text under the fallback card | kuiper-belt@96736f5 editions/202611012135/index.html:284 | `function describe(a){` |
| D3b | `describe` in the hook table (KY.hooks.describe) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `describe` |
| D3c | `describe` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:469 | `H.describe` |
| D4a | `findBy` engine line: the first commit at or after an edition stamp | kuiper-belt@96736f5 editions/202611012135/index.html:280 | `function findBy(field, v){` |
| D4b | `findBy` in the hook table (KY.hooks.findBy) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `findBy` |
| D4c | `findBy` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:558 | `H.findBy` |
| D5a | `flyTo` engine line: the only camera mover (fly to a spark) | kuiper-belt@96736f5 editions/202611012135/index.html:253 | `function flyTo(x, y, z){` |
| D5b | `flyTo` in the hook table (KY.hooks.flyTo) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `flyTo` |
| D5c | `flyTo` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:485 | `H.flyTo` |
| D6a | `safeBox` engine line: the bar-aware clear space (the wrapped one) | kuiper-belt@96736f5 editions/202611012135/index.html:726 | `{ const _safe = safeBox; safeBox = function(){` |
| D6b | `safeBox` in the hook table (KY.hooks.safeBox) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `safeBox` |
| D6c | `safeBox` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:482 | `H.safeBox` |
| D7a | `lightTime` engine line: lights a period: the periods layer | kuiper-belt@96736f5 editions/202611012135/index.html:554 | `function lightTime(y, m, d){` |
| D7b | `lightTime` in the hook table (KY.hooks.lightTime) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `lightTime` |
| D7c | `lightTime` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:519 | `H.lightTime` |
| D8a | `fmt` engine line: numbers in the state tags | kuiper-belt@96736f5 editions/202611012135/index.html:125 | `const fmt = n => Math.round(n).toLocaleString` |
| D8b | `fmt` in the hook table (KY.hooks.fmt) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `fmt` |
| D8c | `fmt` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:40 | `H.fmt` |
| D9a | `esc` engine line: escapes every record field written as HTML | kuiper-belt@96736f5 editions/202611012135/index.html:681 | `function esc(v){` |
| D9b | `esc` in the hook table (KY.hooks.esc) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:21 | `esc` |
| D9c | `esc` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:39 | `H.esc` |
| D10a | `cv` engine line: a tap counts only on the wafer canvas (05-lines #9) | kuiper-belt@96736f5 editions/202611012135/index.html:121 | `const cv = document.getElementById('c')` |
| D10b | `cv` in the hook table (KY.hooks.cv) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `cv` |
| D10c | `cv` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:501 | `H.cv` |
| D11a | `o2` engine line: every layer draws on the overlay | kuiper-belt@96736f5 editions/202611012135/index.html:121 | `o2 = ov.getContext('2d')` |
| D11b | `o2` in the hook table (KY.hooks.o2) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `o2` |
| D11c | `o2` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:193 | `H.o2` |
| D12a | `hud` engine line: the readout line each layer owns | kuiper-belt@96736f5 editions/202611012135/index.html:123 | `const hud = document.getElementById('hud')` |
| D12b | `hud` in the hook table (KY.hooks.hud) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `hud` |
| D12c | `hud` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:430 | `H.hud` |
| D13a | `big` engine line: the heading: a preload FAIL is written here | kuiper-belt@96736f5 editions/202611012135/index.html:123 | `big = document.getElementById('big')` |
| D13b | `big` in the hook table (KY.hooks.big) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `big` |
| D13c | `big` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:204 | `H.big` |
| D14a | `sub` engine line: the subtitle the lines layer extends | kuiper-belt@96736f5 editions/202611012135/index.html:124 | `sub = document.getElementById('sub')` |
| D14b | `sub` in the hook table (KY.hooks.sub) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `sub` |
| D14c | `sub` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:423 | `H.sub` |
| D15a | `card` engine line: the fallback card when line-card is absent | kuiper-belt@96736f5 editions/202611012135/index.html:124 | `card = document.getElementById('card')` |
| D15b | `card` in the hook table (KY.hooks.card) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `card` |
| D15c | `card` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:459 | `H.card` |
| D16a | `gbox` engine line: e/E are ignored while the go-to box is open | kuiper-belt@96736f5 editions/202611012135/index.html:604 | `const gbox = document.getElementById('goto')` |
| D16b | `gbox` in the hook table (KY.hooks.gbox) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:22 | `gbox` |
| D16c | `gbox` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:495 | `H.gbox` |
| D17a | `SPACE` engine line: the admission predicate 0 <= key < SPACE | kuiper-belt@96736f5 editions/202611012135/index.html:198 | `let N = 0, SPACE = 0, repos = [], commits = [];` |
| D17b | `SPACE` in the hook table (KY.hooks.SPACE) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:41 | `get SPACE()` |
| D17c | `SPACE` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:174 | `H.SPACE` |
| D18a | `N` engine line: a wafer layer is admitted iff N > 0 and SPACE > 0 | kuiper-belt@96736f5 editions/202611012135/index.html:208 | `N = issued; SPACE = k;` |
| D18b | `N` in the hook table (KY.hooks.N) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:41 | `get N()` |
| D18c | `N` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:544 | `H.N` |
| D19a | `repos` engine line: repository names for the repos layer | kuiper-belt@96736f5 editions/202611012135/index.html:202 | `repos = rr.map(p =>` |
| D19b | `repos` in the hook table (KY.hooks.repos) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:41 | `get repos()` |
| D19c | `repos` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:104 | `H.repos` |
| D20a | `commits` engine line: commit times for the editions and periods layers | kuiper-belt@96736f5 editions/202611012135/index.html:204 | `commits = ww.map(p =>` |
| D20b | `commits` in the hook table (KY.hooks.commits) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:41 | `get commits()` |
| D20c | `commits` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:537 | `H.commits` |
| D21a | `wafer` engine line: every layer waits for the wafer; a rejection REFUSES every layer | kuiper-belt@96736f5 editions/202611012135/index.html:208 | `N = issued; SPACE = k;` |
| D21b | `wafer` in the hook table (KY.hooks.wafer) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:42 | `wafer: kyWafer` |
| D21c | `wafer` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:651 | `H.wafer` |
| D22a | `cam` engine line: wafer to screen for every layer | kuiper-belt@96736f5 editions/202611012135/index.html:243 | `let cx = 0, cy = 0, zoom = 1` |
| D22b | `cam` in the hook table (KY.cam) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:43 | `cam: Object.freeze(` |
| D22c | `cam` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:193 | `KY.cam` |
| D23a | `lit` engine line: the lit repository and period (repos, periods) | kuiper-belt@96736f5 editions/202611012135/index.html:243 | `litRepo = -1` |
| D23b | `lit` in the hook table (KY.lit) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:44 | `lit: Object.freeze(` |
| D23c | `lit` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:108 | `KY.lit.repo` |
| D24a | `sel` engine line: the crosshair on the selected spark | kuiper-belt@96736f5 editions/202611012135/index.html:243 | `target = null` |
| D24b | `sel` in the hook table (KY.sel) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:47 | `sel: Object.freeze(` |
| D24c | `sel` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:451 | `KY.sel.target` |
| D25a | `redraw` engine line: asks for a frame after a state change | kuiper-belt@96736f5 editions/202611012135/index.html:243 | `dirty = true` |
| D25b | `redraw` in the hook table (KY.redraw) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:48 | `redraw(){ dirty = true; }` |
| D25c | `redraw` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:115 | `KY.redraw` |
| D26a | `draw` engine line: the ONE wrap, in registry order (replaces this wrap) | kuiper-belt@96736f5 editions/202611012135/index.html:654 | `{ const _draw = draw; draw = function(){ _draw(); drawEdition(); }; }` |
| D26b | `draw` in the hook table (KY.draw) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:49 | `draw: Object.freeze(` |
| D26c | `draw` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:632 | `KY.draw.add` |
| D27a | `panels` engine line: the WAFER panel registered beside the others | kuiper-belt@96736f5 editions/202611012135/index.html:710 | `const PANELS = { top: elTop, hud: hud, lines: linesPanel, foot: elFoot };` |
| D27b | `panels` in the hook table (KY.panels) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:51 | `panels: Object.freeze(` |
| D27c | `panels` first use in the module | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:283 | `KY.panels.add` |

## E. The seven layers: the source and the licence of each one's data

Measured at 21:4x UTC on the edition branch (kuiper-belt@96736f5 plus the uncommitted edition folder):
`stat -c%s` and `sha256sum` of each source file; body counts by `json.load`.

| layer | source file (served path from the edition folder) | bytes | sha256 | features measured | licence of the data | state it must show at Edition 5 |
|---|---|---|---|---|---|---|
| `periods` | none of its own: the wafer, `../../cosmos/wafer.tsv` | 535,037 | `2be9a78371de3603089ca9b58955c9d9ddd9f547ad24904da9d51fbc407f4bca` | 13,344 commits (13,345 lines with the header) | CC BY 4.0 (kuiper-belt generated data, E4); the engine code that lights a period is Apache-2.0 (E3) | OK when the wafer is (N > 0, SPACE > 0); value = the period |
| `repos` | none of its own: `../../cosmos/repos.tsv` | 2,467 | `0aadce5b97a3260cf4928cca82030f755a6ce2b63b2f3d96d1cc7e5b0ab72751` | 98 repositories (99 lines with the header) | CC BY 4.0 (generated data, E4); repository names only | OK · none lit until a value is set |
| `editions` | `data/editions.json` (team 3's `tools/build_layers.py` builds it from editions/README.md, the edition README and the pointer, E39) | 1,707 | `2013c39afa2b1f5f859631cb207f6c74f1ae149ab5af916ee5e744d6ecca4230` (= the record) | 5 editions (1-4 published, 5 under construction); 2 placed (stamps before the wafer's last commit), 3 beyond the rim | CC BY 4.0 (kuiper-belt data, E4) | OK · 2 of 5 placed, 3 beyond the rim (wafer's last commit 2026-11-01T13:18:32Z, E12) |
| `lines` | `keys.json` (byte-identical to Edition 4's: `cmp` exit 0) | 1,709,129 | `1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b` (= Edition 4 proof, E8) | 346 bodies; 344 on the wafer and verified; 2 star-maker bodies `on_wafer: false` | CC BY 4.0 for the register (generated data, E4); each quoted line keeps its repository's licence (E9) | OK · 344 of 346; preload |
| `see-through` | `data/see-through.json` (Opus team 5's file, step 5) | 666,922 at 21:46 UTC | not in a record yet (`source.file: null`; team 5 registers it in step 5) | 5,800 Point features (`code-feature-collection.v1`, substrate `kuiper.wafer.v1`) | the file says "Data CC BY 4.0 (kuiper-belt); substation names (c) OpenStreetMap contributors, ODbL 1.0"; See Through itself CERN-OHL-S v2, linked not copied (E15-E18). FINDING F1 below | EMPTY (with why) until the file and its record agree; then OK |
| `elements` | none admitted: elements@f7a92fb has no LICENSE or NOTICE (E19-E20) | — | — | — | **none in repository** (`DISCLOSED`, owner's Q1) | REFUSED · licence unsettled (elements@f7a92fb has no LICENSE) |
| `spider` | none in the edition: the v5 page reads `./spider/data/` (not in the clone) and its manifest's 16 graphs live on 5 hosts (E21-E26, E29-E37) | — | — | — | code Apache-2.0 (testcode, E21); graph data: ventus-grid-engine 4 Apache-2.0, stars 9 and code-generator 1 none in repository (`DISCLOSED`, owner's Q5), spiders 1 NOT EVALUATED, testcode 1 Apache-2.0 | EMPTY · awaiting step 7 keys |

| # | claim | key | fragment |
|---|---|---|---|
| E1 | kuiper-belt LICENSE is Apache-2.0 | kuiper-belt@018b46a LICENSE:1 | `Apache License` |
| E2 | the repository's licence sentence (:156-157) | kuiper-belt@018b46a README.md:156 | `This repository is public so the method can be checked` |
| E3 | code Apache-2.0 | kuiper-belt@018b46a README.md:157 | `under Apache-2.0, see [LICENSE](LICENSE); documentation and generated data under CC BY 4.0` |
| E4 | the editions folder restates it | kuiper-belt@018b46a editions/README.md:27 | `Code Apache-2.0, text and data CC BY 4.0, as the repository.` |
| E5 | the wafer's commit count (periods) | kuiper-belt@018b46a cosmos/wafer-meta.json:6 | `"commits": 13344` |
| E6 | the repositories' count (repos) | kuiper-belt@018b46a cosmos/wafer-meta.json:7 | `"repositories": 98` |
| E7 | the page loads exactly these two wafer files | kuiper-belt@96736f5 editions/202611012135/index.html:201 | `Promise.all([tsv('../../cosmos/repos.tsv'), tsv('../../cosmos/wafer.tsv')])` |
| E8 | keys.json's sha256 in Edition 4's proof | kuiper-belt@018b46a editions/202611012027/proof/edition-sha256.txt:4 | `1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b  ./keys.json` |
| E9 | each quoted line keeps its repository's licence (:7-10) | kuiper-belt@018b46a editions/202611012027/NOTICE.md:7 | `Every quoted line belongs to the repository it is keyed to and keeps that repository's licence` |
| E10 | a quote is a citation, not a relicensing | kuiper-belt@018b46a editions/202611012027/NOTICE.md:10 | `A quote here is a citation with its key, not a relicensing.` |
| E11 | keys.json's own summary: 346 bodies, 344 on the wafer, 344 verified | kuiper-belt@96736f5 editions/202611012135/keys.json:1 | `{"summary":{"bodies":346,"on_wafer":344,"verified":344` |
| E12 | the wafer's last commit, 1793539112 = 2026-11-01T13:18:32Z (editions after it are beyond the rim) | kuiper-belt@018b46a cosmos/wafer-meta.json:9 | `"last_unix": 1793539112` |
| E13 | the four published editions and their stamps (:12, :16, :19, :22) | kuiper-belt@018b46a editions/README.md:12 | `published 2026-11-01): [README](202611012027/README.md)` |
| E14 | Edition 1's stamp, the earliest | kuiper-belt@018b46a editions/README.md:22 | `published 2026-11-01): [README](202610311905/README.md)` |
| E15 | See Through's licence: CERN-OHL-S v2 | kuiper-belt@018b46a see-through/202610050609/LICENSE.md:6 | `CERN Open Hardware Licence Version 2, Strongly Reciprocal` |
| E16 | its substations are OpenStreetMap data, ODbL 1.0, with the on-screen credit (:22-25) | kuiper-belt@018b46a see-through/202610050609/NOTICE.md:25 | `Shown on screen: "Substations and lines © OpenStreetMap contributors, ODbL".` |
| E17 | the attribution inside the data file See Through draws from | kuiper-belt@018b46a see-through/202610050609/grid-data.js:7 | `OpenStreetMap contributors, ODbL` |
| E18 | the 5,800 substations | kuiper-belt@018b46a see-through/202610050609/grid-data.js:8 | `"n":5800` |
| E19 | elements: its README carries keys and no licence line (25 tracked files, `grep -rnil licen` over the clone returns nothing, measured 21:44 UTC) | elements@f7a92fb README.md:13 | `block:<Sym>` |
| E20 | the owner's open question on elements | neural-link-between-agents FIXES/NL-010/ROADMAP.md:1011 | `**Q1 elements' licence.**` |
| E21 | testcode LICENSE: Apache-2.0 | testcode@d09c185 LICENSE:2 | `Apache License` |
| E22 | testcode's NOTICE: third-party data it reads is not covered by that licence (:25-32) | testcode@d09c185 NOTICE:25 | `WHAT THIS LICENCE DOES NOT COVER:` |
| E23 | the spider reads its graphs from `./spider/data/`, which the clone does not hold (`ls` shows identity.json, manifest.json, overview-graph.json) | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/index.html:239 | `const DATA_BASE="./spider/data/"` |
| E24 | its manifest: `receiver-manifest-v1`, 16 graphs (measured: 16 `"id"` lines) | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:2 | `"schema_version": "receiver-manifest-v1"` |
| E25 | one of them is the periodic table | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:57 | `"id": "periodic-table"` |
| E26 | the owner's open question on the spider's data | neural-link-between-agents FIXES/NL-010/ROADMAP.md:1023 | `**Q5 the spider's graph data.**` |
| E27 | `periods` draws with the engine's own `lightTime` | kuiper-belt@96736f5 editions/202611012135/index.html:554 | `function lightTime(y, m, d){` |
| E28 | `repos` lights by the shader uniform | kuiper-belt@96736f5 editions/202611012135/index.html:350 | `gl.uniform1i(U(PF,'u_litRepo'), litRepo)` |
| E29 | ventus-grid-engine (4 of the spider's 16 graphs) is Apache-2.0 | ventus-grid-engine@96a800e LICENSE:2 | `Apache License` |
| E30 | its NOTICE grants it | ventus-grid-engine@96a800e NOTICE:10 | `Licensed under the Apache License, Version 2.0.` |
| E31 | and excludes third-party data it reads | ventus-grid-engine@96a800e NOTICE:25 | `WHAT THIS LICENCE DOES NOT COVER:` |
| E32 | a ventus-grid-engine graph (manifest :8, :16, :24, :32) | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:8 | `https://ventusltd.github.io/ventus-grid-engine/spider/data/nodes.json` |
| E33 | a stars graph (manifest :49, :59, :69, :79, :89, :99, :109, :129, :139: nine); stars@cbca125 has no LICENSE or NOTICE at its root (`ls`, measured 21:53 UTC) | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:49 | `https://ventusltd.github.io/stars/modular/graph.json` |
| E34 | the periodic-table graph (id at :57) is a stars graph | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:59 | `https://ventusltd.github.io/stars/blocks/graph.json` |
| E35 | the code-generator graph; code-generator@857ea81 has no LICENSE or NOTICE at its root (`ls`) | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:119 | `https://ventusltd.github.io/code-generator/spider/graphs/apps.json` |
| E36 | the spiders graph; `spiders` is not in the estate clone: NOT EVALUATED | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:40 | `https://ventusltd.github.io/spiders/species/genome-spider/data/gridatlas-lineage.json` |
| E37 | testcode's own graph (Apache-2.0, E21) | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/manifest.json:149 | `./spider/overview-graph.json` |
| E38 | Opus team 5's see-through data file calls itself CC BY 4.0 while it carries OSM names (4,460 of 5,800 features have `properties.name`) | kuiper-belt@WORKTREE editions/202611012135/data/see-through.json:1 | `"licence":"Data CC BY 4.0 (kuiper-belt); substation names (c) OpenStreetMap contributors, ODbL 1.0` |
| E39 | the editions file the registry built | kuiper-belt@WORKTREE editions/202611012135/data/editions.json:2 | `"schema": "kuiper.editions.v1",` |
| E40 | stars' README, line 1 (anchor for the root listing above; no licence line in it) | stars@cbca125 README.md:1 | `# Stars` |
| E41 | code-generator's README, line 1 (same) | code-generator@857ea81 README.md:1 | `# Code generator` |

## F. The module header

The loader admits a module only if line 1 matches `^/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),` and the
stamp equals the manifest's and the registration's (loader reference, F6). Measured with that regex in node:
line 1 matches, name `layers`, generation `202611012141`; the file name stamp is `202611012141`; the registration's `GEN` is `202611012141`.
Three copies, one value. The licence line names Apache-2.0 (kuiper-belt code): correct, because no See Through code
is copied (`grep -n "CERN\|G32\|2654435769\|kuiper-law"` over the module finds nothing; See Through's placement law stays
in Opus team 5's module) and no GridAtlas file is copied: the GridAtlas lines in the header are cited lessons (method,
names), re-written, not copied blocks, so gridatlas's Apache-2.0 NOTICE duty (§4(d)) is not triggered; if a later
revision copies a menu-bar block verbatim it must cite it `repo@sha path:line` in the header (ROADMAP step 4 licence
note). The header's `requires:` line equals the `REQUIRES` array and the hooks used (section D; R2 resolved). The
header says the API is reached through `KY.modules.layers.api` (correct under the frozen table, R1).

| # | claim | key | fragment |
|---|---|---|---|
| F1 | line 1: name, stamp, licence (ROADMAP 4.3 form; the loader's regex) | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:1 | `/* kuiper module layers, generation 202611012141 (UTC), Apache-2.0 (kuiper-belt code)` |
| F2 | the stamp in the registration | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:21 | `var ID = 'layers', GEN = '202611012141';` |
| F3 | the header's requires line | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:15 | `requires: wafer, keyPlace, address` |
| F4 | the header names the API path under the frozen table | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:5 | `proxies it through KY.modules.layers.api` |
| F5 | exactly one registration call | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:681 | `window.KY.register({` |
| F6 | the loader's header regex | kuiper-belt@WORKTREE editions/202611012135/modules/202611012145-loader.js:82 | `kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),` |
| F7 | the governing header form | neural-link-between-agents FIXES/NL-010/ROADMAP.md:265 | `/* kuiper module <name>, generation <module-stamp> (UTC), <licence> */` |

## G. NL-009 round 1, patch 05-lines, folded into the module (the LINES panel becomes the lines layer's control)

Each finding of FABLE-05 (05-lines.md) and the module line that answers it. Folded in: findings 1, 2, 3, 4, 5, 6, 7, 9 and
10; 8, 11 and 12 were PASS and are kept. Patches 01, 06, 08 (team 1), 02 (team 2), 04, 09 (team 4), 03, 07 (team 10)
are other teams'.

| # | finding (05-lines.md) and the fix | key | fragment |
|---|---|---|---|
| G1a | 1 MAJOR the panel scrolled as one block | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:16 | `the panel scrolls as one block, not the list inside it.` |
| G1b | the list is the one scroller | NOT FOUND in the module | `#lineslist{flex:1 1 auto;min-height:0;overflow-y:auto` |
| G2a | 2 MAJOR tap targets under 44 px | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:25 | `tap targets under 44 px.` |
| G2b | every layer row ≥ 44 px, the original input stretched over it (GridAtlas A31-A32) | NOT FOUND in the module | `min-height:44px;padding:0 4px;border-top` |
| G2c | the input over the whole row | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:231 | `input[data-ky-layer]{position:absolute;inset:0` |
| G3a | 3 MINOR the filter was 11 px | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:31 | `the filter input is 11 px` |
| G3b | 16 px filter with inputmode and enterkeyhint | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:351 | `inputmode="search" enterkeyhint="search"` |
| G4a | 4 MAJOR a filter could not be cleared | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:40 | `a filter cannot be cleared.` |
| G4b | a clear control | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:352 | `id="lyClear" aria-label="clear the filter"` |
| G4c | and Escape clears | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:362 | `if (e.key === 'Escape') { if (q.value)` |
| G5a | 5 MINOR the soft keyboard (62vh of the layout viewport) | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:45 | `the soft keyboard.` |
| G5b | height from the visual viewport | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:294 | `visualViewport.addEventListener('resize', sizePanel)` |
| G6a | 6 MINOR no count of rows | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:54 | `the count of rows is shown nowhere.` |
| G6b | a count line | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:353 | `<div id="lycount" aria-live="polite">` |
| G7a | 7 MINOR no grouping | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:58 | `no grouping; rows are tall.` |
| G7b | grouped by repository, largest first, foldable | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:388 | `(groups[b.repo] = groups[b.repo] || []).push(i)` |
| G9a | 9 the 9 px spark hit-test ran for taps on panel rows | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:74 | `picking a row (Edition 4 behaviour).` |
| G9b | only a tap on the wafer canvas opens a spark | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:507 | `e.target !== H.cv` |
| G10a | 10 MINOR not full width on a phone | neural-link-between-agents FIXES/NL-009/round1/05-lines.md:83 | `the panel is not full width on a phone.` |
| G10b | left:0; right:0 on a phone; the 720 px cap only above 640 px | kuiper-belt@WORKTREE editions/202611012135/modules/202611012141-layers.js:226 | `@media (min-width:641px){#layers{right:auto;width:min(720px,96vw)}}` |

## H. The verdict on the lead's HANDOFF

PENDING: the lead's HANDOFF draft has not been shown to the evidence officer yet. Written when it is.
