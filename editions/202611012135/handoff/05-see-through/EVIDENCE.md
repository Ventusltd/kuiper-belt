# Opus team 5 EVIDENCE: See Through, the star player (ROADMAP step 5)

Evidence officer: OPUS-5 evidence. Written 2026-11-01 22:10–22:25 UTC. Law: no claim without a key; every number
measured on the clones under /home/user/estate/ at these heads:

- `kb@f6a2bcc` = kuiper-belt@f6a2bcc845ba97254730a06bb742302ff5dd9d78 (branch edition/202611012135, the harness commit
  that carries the module as reviewed here). `see-through/`, `cosmos/`, `learn-the-kuiper/` and the root `index.html` are
  byte-identical to kuiper-belt@018b46a (`git diff 018b46a f6a2bcc --stat -- see-through cosmos learn-the-kuiper index.html`
  prints nothing), and `editions/202611012135/index.html` is identical to the hook table's base kuiper-belt@96736f5.
- `gg@c66759f` = globalgrid2050@c66759f0d7ac3489df9158da6eaa1330a37c069f; `ga@5ec7f62` = gridatlas@5ec7f62f213e2d20a02e86427daa182c0f38e4a4.
- `ST` = `see-through/202610050609/`; `MOD` = `editions/202611012135/modules/202611012141-see-through.js`;
  `ED` = `editions/202611012135/`.

The module as reviewed: `MOD`, 23,827 bytes, 346 lines, sha256 `30541ae813782d922936105cb55b50d918502e65b603d4e122727526b4b4e9f0`,
`node --check` OK. The lead writes `MODULE.sha256` after the last edit; if the bytes change, the code line numbers below
must be re-read (header lines 1–12 changed in the evidence officer's licence edit; line count kept, so lines 13–346 are
those of kuiper-belt@2c87ba4).

## 1. See Through's pointer and newest folder

| Fact | Key |
|---|---|
| Pointer: meta refresh `0; url=202610050609/` | kb@f6a2bcc see-through/index.html:7 |
| Pointer fallback link to the same stamp | kb@f6a2bcc see-through/index.html:11 |
| Pointer forwards the hash: `location.replace('202610050609/' + location.hash)` | kb@f6a2bcc see-through/index.html:12 |
| Newest dated folder `202610050609` (siblings `202610050356`, `202610050513`) | kb@f6a2bcc see-through/ (`ls`) |
| The module links to the pointer, never the dated folder: `var POINTER = '../../see-through/'` | kb@f6a2bcc MOD:16 |
| The entry's `href = POINTER`, same tab (no `target`), click stopped before Edition 4's panel delegate | kb@f6a2bcc MOD:82, :87; the delegate ED index.html:721 |
| Measured absence: See Through reads no URL. `grep -c 'location.hash\|location.search\|URLSearchParams'` over every `ST*.js` = **0** (22:12 UTC). Every link the module writes (`#key=`, `#repo=`, `#sub=`) is forwarded by the pointer into a page that ignores it until a new See Through folder ships the reader (ROADMAP 5.5; `see-through/` is untouchable for this team, OPUS-BRIEF.md:17-19) | kb@f6a2bcc ST*.js (grep count 0) |

## 2. The placement law file and the SPACE constant

| Fact | Key |
|---|---|
| `kuiper-law.js` "lifted VERBATIM from the live page", source kuiper-belt index.html @ 7a65dd3 | kb@f6a2bcc ST kuiper-law.js:1-3 |
| The law in words: `m = key·2654435769 mod 2^32`, `theta = 2π m/2^32`, `r = sqrt(key + 0.5)`; the 137.5° spiral is the mirror image | kb@f6a2bcc ST kuiper-law.js:22-28 |
| `keyPlace` verbatim | kb@f6a2bcc ST kuiper-law.js:39-40; the edition's engine ED index.html:278 |
| The teaching spiral `theta = key × 137.507764°, r = sqrt(key)` is labelled **NOT THE REAL KUIPER** | kb@f6a2bcc ST kuiper-law.js:98-108 |
| See Through's frozen sky: `const SPACE = 59637070538;` | kb@f6a2bcc ST kuiper-law.js:36 |
| See Through uses it for its stars: `S.SPACE = window.KuiperLaw.constants.SPACE` | kb@f6a2bcc ST descent.js:890 |
| The wafer's sky today: `"address_space": 63340120796` | kb@f6a2bcc cosmos/wafer-meta.json:4 |
| Re-sum of `cosmos/wafer.tsv` (`gap_before + lines` over 13,344 rows) = **63,340,120,796**, issued 45,735,836,396 (equal to wafer-meta.json:2, :4) | kb@f6a2bcc cosmos/wafer.tsv (Python re-sum, 22:13 UTC) |
| Difference: 63,340,120,796 − 59,637,070,538 = **3,703,050,258** keys; Drax (j 1182) is star key 3,526,041,795 in See Through 202610050609 and 3,744,984,642 in this layer | computed from the two keys above |
| The module takes the wafer's SPACE from the hook: `st.wafer = (w && w.SPACE) \|\| H.SPACE` | kb@f6a2bcc MOD:333-334 |
| SPACE disagreement draws nothing and reads `FAIL · SPACE <a> ≠ wafer <b>` | kb@f6a2bcc MOD:156, :164, :186 |

## 3. The star-key rule (the one block of See Through code in the module)

| Fact | Key |
|---|---|
| `var NRULE = 20000; // grid.js N: particle i carries key floor((i + 0.5) * SPACE / NRULE)` | kb@f6a2bcc ST descent.js:19 |
| `var NSUB = 5800;` | kb@f6a2bcc ST descent.js:20 |
| `key = Math.floor((ki + 0.5) * S.SPACE / NRULE)` | kb@f6a2bcc ST descent.js:963 |
| `if (c === 0) S.subKey[p] = key;` (star j < 5,800 lands on substation j) | kb@f6a2bcc ST descent.js:965 |
| Origin of the rule: `function keyOf(i, SPACE) { return Math.floor((i + 0.5) * SPACE / N); }` in Learn the Kuiper's grid.js | kb@f6a2bcc learn-the-kuiper/202610050609/modules/grid.js:36-38 |
| grid.js keeps CERN-OHL-S v2 (adapted from globalgrid2050) | kb@f6a2bcc learn-the-kuiper/202610050609/NOTICE.md:7-10 |
| The module's copy, marked `CERN-OHL-S-2.0`: `function starKey(j, space) { return Math.floor((j + 0.5) * space / NRULE); }` | kb@f6a2bcc MOD:27-32 |
| The remap (5.6) built on it | kb@f6a2bcc MOD:34-42 |

## 4. Licence: CERN-OHL-S v2 and the NOTICE lines

| Fact | Key |
|---|---|
| See Through reuses globalgrid2050 code "licensed CERN-OHL-S v2 … offered under the same licence" | kb@f6a2bcc ST LICENSE.md:3-6 |
| Full text location | kb@f6a2bcc ST LICENSE.md:7; ST licences/globalgrid2050-CERN-OHL-S-2.0.txt:1 |
| Data and libraries keep their own terms (OSM ODbL, CARTO, Esri, AWS, MapLibre BSD-3) | kb@f6a2bcc ST LICENSE.md:9-10 |
| NOTICE: "See Through is offered under CERN-OHL-S v2 … All source repositories belong to Ventus Ltd" | kb@f6a2bcc ST NOTICE.md:3-4 |
| NOTICE reuse table (descent.js, kuiper-law.js, grid-data.js, pf.js, model.js, see3d.js, joystick.js CERN-OHL-S v2) | kb@f6a2bcc ST NOTICE.md:8-15 |
| OpenStreetMap credit and on-screen wording "Substations and lines © OpenStreetMap contributors, ODbL" | kb@f6a2bcc ST NOTICE.md:22-25 |
| Origin licence | gg@c66759f LICENSE.txt:1-2 |
| The law for modules: "copying `kuiper-law.js` or `descent.js` into a module makes that module CERN-OHL-S v2 and it cannot be relicensed Apache-2.0: keep See Through code in its own module so the reciprocity stops at that file" | neural-link FIXES/NL-010/ROADMAP.md:713-715 (step 9, 9.8) |
| The brief: header licence line "Apache-2.0 for kuiper-belt code; CERN-OHL-S v2 wherever See Through code is copied" | neural-link FIXES/NL-010/OPUS-BRIEF.md:23-24 |
| Opus table row 5: "CERN-OHL-S v2 code kept inside this module … the header naming the licence" | neural-link FIXES/NL-010/ROADMAP.md:977 |

## 5. ODbL for the footprints and the names

| Fact | Key |
|---|---|
| `data/substations-footprints.odbl.json` from globalgrid2050, ODbL 1.0 (data) | kb@f6a2bcc ST NOTICE.md:16 |
| The file's own header: `"licence":"ODbL-1.0","attribution":"Footprints (c) OpenStreetMap contributors, ODbL 1.0"`, counts contains 5,550, near 62, none 188 | kb@f6a2bcc ST data/substations-footprints.odbl.json (first 400 bytes) |
| The module does not read, copy or link the footprints file (`grep -c footprint MOD` = 0) | kb@f6a2bcc MOD |
| grid-data.js attribution line: OSM-derived layers ODbL | kb@f6a2bcc ST grid-data.js:7 |
| Substation object: `"attribution":"© OpenStreetMap contributors, Open Database Licence (ODbL); published at globalgrid2050.com"` | kb@f6a2bcc ST grid-data.js:8 (substations member) |
| The names in `ED data/see-through.json` come from that object | kb@f6a2bcc ED handoff/05-see-through/build-see-through-json.py:15 |

## 6. Substation data and count

| Fact | Key |
|---|---|
| `var SUB = /*DATA-BEGIN*/{"n":5800, …` and `var NSUB = 5800;` | kb@f6a2bcc ST descent.js:15, :20 |
| Header source: names from grid-data.js (OSM, ODbL) plus the table from `globalgrid2050.com/grid_substations.geojson` | kb@f6a2bcc ST descent.js:5-6 |
| `ED data/see-through.json`: 666,922 bytes, sha256 `87069db330a59108ed8f532cd6f8a32b01a52a69725906291b978382513c8dbd` | kb@f6a2bcc ED data/see-through.json (`sha256sum`, 22:13 UTC) |
| `format: code-feature-collection.v1`, `space: 63340120796`, `see_through: 202610050609`, **5,800** Point features, **4,460** named, 1,340 unnamed, min key 1,583,503, max key 18,367,051,527 (< SPACE) | same file, recounted in Python |
| Every feature j: `properties.sub == j` and `geometry.key == floor((2j+1)·SPACE/40000)` = `floor((j+0.5)·SPACE/20000)`: **0 of 5,800** differ | same file, recomputed in Python |
| j 0 → key 1,583,503 (no name); j 1182 → key 3,744,984,642, name `Drax` | same file, features[0], features[1182] |
| The module admits only that shape: format, 5,800, `sub === i`, `key === starKey(i, space)`, key < wafer | kb@f6a2bcc MOD:159-178 |
| Places each key with `keyPlace` and nothing else | kb@f6a2bcc MOD:175 |

## 7. The homepage row

| Fact | Key |
|---|---|
| Apps entry: "See Through: from the stars to one substation in 3D … About 5,800 mapped substations" | gg@c66759f homepage_versions/homepage_v134.html:18 |
| Registry row `data-entity-id="see-through"`, the same sentence, Operative, build `20261005-0609`, link to the dated folder `https://ventusltd.github.io/kuiper-belt/see-through/202610050609/` (3 occurrences in the file) | gg@c66759f homepage_versions/homepage_v134.html:35 |
| `homepage_v134.html` is the highest-numbered homepage version | gg@c66759f homepage_versions/ (`ls`) |
| The module's `title` and `aria-label` are that sentence, byte for byte | kb@f6a2bcc MOD:17, :83 |

## 8. GridAtlas lessons the module uses

| Lesson | GridAtlas key | Where in the module |
|---|---|---|
| The lit face of a title: `background:rgba(80,220,240,.16);color:#fff` | ga@5ec7f62 atlas/modules/202609031958-menu-bar.js:177-178 | MOD:58, :60-61 |
| One node moved, never cloned (`move(panel, node, label)`) | ga@5ec7f62 menu-bar.js:1490 | MOD:79, :90-97 (strip form without the shell) |
| GRID/SUBS chips stay on the map on a phone ("one tap, not two") | ga@5ec7f62 menu-bar.js:1521-1523 (`chipStaysOnMap`) | MOD:61-63 (44 px bottom-left strip) |
| The first title of the left group is read first (`buildBar`) | ga@5ec7f62 menu-bar.js:481-483 | the shell's `mountStar` (kb@f6a2bcc ED modules/202611012143-kuiper-shell.js:308-314) called at MOD:101 |

## 9. Every Kuiper hook the module uses, with its line

Hook table `kuiper.hooks.v1` (kb@f6a2bcc ED handoff/04-loader/HOOKS.md); `KY` built at kb@f6a2bcc ED
modules/202611012145-loader.js:36-60 (`hooks` :38-42); engine lines at kb@96736f5 ED index.html (unchanged at f6a2bcc).
Requires list in the header MOD:9 and in the registration MOD:342-343: 19 names, identical, all used.

| Hook | Module line(s) | Engine / loader line |
|---|---|---|
| `hooks.wafer` (promise `{N, SPACE}`) | MOD:333 | handoff/04-loader/index.html.patch:59, :70; loader.js:42 |
| `hooks.SPACE` (getter) | MOD:334 | ED index.html:198, :208; loader.js:41 |
| `hooks.keyPlace` | MOD:175, :315 | ED index.html:278; loader.js:39 |
| `hooks.address` | MOD:232, :270 | ED index.html:282-283; loader.js:39 |
| `hooks.describe` | MOD:239 | ED index.html:284; loader.js:39 |
| `hooks.goKey` | MOD:316 | ED index.html:416; loader.js:39 |
| `hooks.fmt` | MOD:155, :156, :206, :240, :312, :314 | ED index.html:125; loader.js:39 |
| `hooks.esc` | MOD:266, :268, :273, :292, :293, :317 | ED index.html:681; loader.js:39 |
| `hooks.cv` | MOD:223 | ED index.html:121; loader.js:40 |
| `hooks.ov` | MOD:192, :198 | ED index.html:121; loader.js:40 |
| `hooks.o2` | MOD:195 | ED index.html:121; loader.js:40 |
| `hooks.hud` | MOD:212, :314 | ED index.html:123; loader.js:40 |
| `hooks.card` | MOD:229, :250, :261, :281, :291, :317 | ED index.html:124; loader.js:40 |
| `hooks.gin` | MOD:285, :287 | ED index.html:604; loader.js:40 |
| `hooks.repos` (getter) | MOD:271, :272, :289 | ED index.html:198, :202; loader.js:41 |
| `KY.cam` (`x y zoom`) | MOD:192, :198 | ED index.html:243; loader.js:43 |
| `KY.sel.target` (set) | MOD:241 | ED index.html:243; loader.js:47 |
| `KY.redraw()` | MOD:152, :243 | ED index.html:243 (`dirty`); loader.js:48 |
| `KY.draw.add(fn, 50)` | MOD:331 | ED index.html:332 (`draw`); loader.js:29-32, :49 |
| `KY.register` (once) | MOD:340-344 | loader.js:56 |
| `KY.modules` (optional: kuiper-shell, layers, file/link) | MOD:73, :135, :307 | loader.js:58 |
| `KY.layers` (optional; absent from frozen `KY`, so :135 always falls back to `KY.modules.layers.api`) | MOD:135, :138, :147-150 | layers api kb@f6a2bcc ED modules/202611012141-layers.js:77, :118, :667 |

Divergence from ROADMAP step 5 "Module name" (ROADMAP.md:398-400: requires `keyPlace, address, o2, card, flyTo, safeBox,
panels, draw, redraw, layers, menuBar`): the module does not require `flyTo`, `safeBox`, `panels`, `layers` or `menuBar`
(it uses `goKey`, which calls `flyTo` at ED index.html:416; the shell's `mountStar` instead of `menuBar`; `layers` is
optional). The hook table (HOOKS.md) governs admission; the roadmap list is superseded, stated here, not hidden.

## 10. The module header's licence line: verdict

As found (kuiper-belt@2c87ba4 MOD:1, :3-5): line 1 "Apache-2.0 (kuiper-belt code)", line 3 "this file is Apache-2.0 …
copies none of its code", lines 4-5 "the one block below marked CERN-OHL-S-2.0 restates See Through's star-key rule".
That contradicts itself and ROADMAP.md:713-715 (a module carrying See Through code is CERN-OHL-S v2 and cannot be
relicensed Apache-2.0). The block MOD:27-32 is See Through's rule (descent.js:19, :963, :965), the same expression as
grid.js:38, and grid.js is itself CERN-OHL-S v2 (learn-the-kuiper NOTICE.md:7-10).

Written by the evidence officer (OPUS-BRIEF.md:49-50 gives this role the header licence line), committed by the harness
in kb@f6a2bcc, line count kept: MOD:1 `CERN-OHL-S-2.0 (the whole file; ROADMAP 9.8: never Apache-2.0)`; MOD:3-5 name
the licence text, the copied block and its origin, and that the Apache-2.0 engine is only called. The loader's header
regex (loader.js:83, `/^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),/`) still matches. The same
correction was made to the one licence line of `handoff/05-see-through/build-see-through-json.py:19` (it quotes and
evaluates the same rule). **Verdict: PASS after the correction**, with the consequences in LICENCE.txt (modules.json
record `"licence": "CERN-OHL-S-2.0"`; `data/layers.json` row; `LICENCES.md` row).

## 11. Findings the lead must act on before the HANDOFF (each measured)

1. **Wrong law sentence on the page.** MOD:128-129 (the family text) says "r = √key, θ = key × golden angle". That is the
   teaching spiral labelled NOT THE REAL KUIPER (ST kuiper-law.js:22-28, :98-108). The Kuiper's sentence is
   cosmos/wafer-meta.json:12 "r = sqrt(key), theta = 2 pi frac(key x 2654435769 / 2^32)" (the code adds 0.5 inside the
   root, index.html:278). Replace with: `r = √(key + 0.5), θ = 2π · frac(key × 2654435769 / 2³²)`. The NL-009 06 README
   block carries the same error (FIXES/NL-009/round1/06-seethrough.md, README addition); README-the-apps.md here is corrected.
2. **No ODbL credit on screen.** Substation names are shown (MOD:265-266 "see this star fall to DRAX") but no credit is
   drawn: the row (MOD:155) and the star card carry none. ROADMAP step 5 licence note: names "carried in the file's header
   and shown on the row"; See Through's own wording is ST NOTICE.md:25. Add ` · names © OpenStreetMap contributors, ODbL`
   to the OK row or to the star row's card.
3. **data/see-through.json licence string.** It reads "Data CC BY 4.0 (kuiper-belt); substation names … ODbL 1.0"
   (build-see-through-json.py:87-88). The file holds 4,460 OSM names extracted from an ODbL database (§6), so it is a
   derivative database under ODbL 1.0 share-alike; recommended: `"licence": "ODbL 1.0 (4,460 OpenStreetMap substation
   names with computed Kuiper star keys)"`. Whether 4,460 names is a "substantial" extract was not keyable from the clones
   (NOT EVALUATED); the conservative string costs nothing. Rebuild through the script, then rehash.
4. **The row pairs a folder with a sky it does not use.** `OK · … · See Through 202610050609 · SPACE 63,340,120,796`
   (MOD:155): See Through 202610050609 draws its stars with SPACE 59,637,070,538 (§2). The layer is the wafer's re-lifted
   sky; only a future See Through folder with the patch will draw the same keys. Say so on the row
   (`See Through stars re-lifted to the wafer · SPACE …`) or in the HANDOFF.
5. **Deep links are written, not yet read.** §1: 0 hash readers in ST; `see-through-hash-reader.patch` was not in the
   folder at 22:17 UTC. The Opus table's acceptance "a deep link from a spark or a repository lands on the named
   substation" (ROADMAP.md:977) cannot be measured in this edition: the HANDOFF must say NOT EVALUATED, not PASS.
6. Minor: MOD:20 cites the 9 px rule at "index.html:688-693"; in this edition it is ED index.html:685-689 (`bd = 81` at
   :687). MOD:12 lists four api functions; install returns five (`readHash`, MOD:337).
7. For the tester: test.cjs:106 requires `Apache-2.0` in the header and passes only because MOD:1 says "never
   Apache-2.0"; the rule for this module is `CERN-OHL-S` named in the header when the body carries the block
   (ROADMAP.md:713-715). test.cjs:482's preview manifest record should carry `licence: 'CERN-OHL-S-2.0'`.

## 12. Review of the lead's HANDOFF comment

See the "HANDOFF review" section at the end of this file (appended when the lead's draft is read).
