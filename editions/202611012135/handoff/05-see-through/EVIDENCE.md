# Opus team 5 EVIDENCE: See Through, the star player (ROADMAP step 5)

Evidence officer: OPUS-5 evidence. Written 2026-11-01 22:10–22:25 UTC; re-keyed 23:25 UTC against the module and data as they stand then. Law: no claim without a key; every number
measured on the clones under /home/user/estate/ at these heads:

- `kb@f6a2bcc` = kuiper-belt@f6a2bcc845ba97254730a06bb742302ff5dd9d78 (branch edition/202611012135; first harness
  commit carrying the corrected header). Module and data lines are read in the working tree at 23:25 UTC on top of
  kuiper-belt@a72c175eb1bbab81263b60230aefe31d83cbbf90 (the bytes are pinned by the sha256 below, not by a commit). `see-through/`, `cosmos/`, `learn-the-kuiper/` and the root `index.html` are
  byte-identical to kuiper-belt@018b46a (`git diff 018b46a f6a2bcc --stat -- see-through cosmos learn-the-kuiper index.html`
  prints nothing), and `editions/202611012135/index.html` is identical to the hook table's base kuiper-belt@96736f5.
- `gg@c66759f` = globalgrid2050@c66759f0d7ac3489df9158da6eaa1330a37c069f; `ga@5ec7f62` = gridatlas@5ec7f62f213e2d20a02e86427daa182c0f38e4a4.
- `ST` = `see-through/202610050609/`; `MOD` = `editions/202611012135/modules/202611012141-see-through.js`;
  `ED` = `editions/202611012135/`.

The module as keyed: `MOD`, 26,000 bytes, 369 lines, sha256 `87a88e488fdf8433e2dcb3c31b9dfcf11726d5761509d996017ebbe08f6ce873`,
`node --check` OK (23:24 UTC). The data as keyed: `ED data/see-through.json`, 666,940 bytes, sha256
`440950711a148eb019b7309ea1a0610219c096742893ce8d7c1f81be18d479a6` (22:48:28 UTC build). If `MODULE.sha256` records other
bytes, every `MOD:n` below must be re-read before the HANDOFF.

## 1. See Through's pointer and newest folder

| Fact | Key |
|---|---|
| Pointer: meta refresh `0; url=202610050609/` | kb@f6a2bcc see-through/index.html:7 |
| Pointer fallback link to the same stamp | kb@f6a2bcc see-through/index.html:11 |
| Pointer forwards the hash: `location.replace('202610050609/' + location.hash)` | kb@f6a2bcc see-through/index.html:12 |
| Newest dated folder `202610050609` (siblings `202610050356`, `202610050513`) | kb@f6a2bcc see-through/ (`ls`) |
| The module links to the pointer, never the dated folder: `var POINTER = '../../see-through/'` | MOD:16 |
| The entry's `href = POINTER`, same tab (no `target`), click stopped before Edition 4's panel delegate | MOD:81, :86; the delegate ED index.html:721 |
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
| The module takes the wafer's SPACE from the hook: `st.wafer = (w && w.SPACE) \|\| H.SPACE` | MOD:356-357 |
| SPACE disagreement draws nothing and reads `FAIL · SPACE <a> ≠ wafer <b>` | MOD:148, :156, :189 |

## 3. The star-key rule (the one block of See Through code in the module)

| Fact | Key |
|---|---|
| `var NRULE = 20000; // grid.js N: particle i carries key floor((i + 0.5) * SPACE / NRULE)` | kb@f6a2bcc ST descent.js:19 |
| `var NSUB = 5800;` | kb@f6a2bcc ST descent.js:20 |
| `key = Math.floor((ki + 0.5) * S.SPACE / NRULE)` | kb@f6a2bcc ST descent.js:963 |
| `if (c === 0) S.subKey[p] = key;` (star j < 5,800 lands on substation j) | kb@f6a2bcc ST descent.js:965 |
| Origin of the rule: `function keyOf(i, SPACE) { return Math.floor((i + 0.5) * SPACE / N); }` in Learn the Kuiper's grid.js | kb@f6a2bcc learn-the-kuiper/202610050609/modules/grid.js:36-38 |
| grid.js keeps CERN-OHL-S v2 (adapted from globalgrid2050) | kb@f6a2bcc learn-the-kuiper/202610050609/NOTICE.md:7-10 |
| The module's copy, marked `CERN-OHL-S-2.0`: `function starKey(j, space) { return Math.floor((j + 0.5) * space / NRULE); }` | MOD:28-33 |
| The remap (5.6) built on it | MOD:35-43 |

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
| The module does not read, copy or link the footprints file (`grep -c footprint MOD` = 0) | MOD |
| grid-data.js attribution line: OSM-derived layers ODbL | kb@f6a2bcc ST grid-data.js:7 |
| Substation object: `"attribution":"© OpenStreetMap contributors, Open Database Licence (ODbL); published at globalgrid2050.com"` | kb@f6a2bcc ST grid-data.js:8 (substations member) |
| The names in `ED data/see-through.json` come from that object | ED handoff/05-see-through/build-see-through-json.py:14 |

## 6. Substation data and count

| Fact | Key |
|---|---|
| `var SUB = /*DATA-BEGIN*/{"n":5800, …` and `var NSUB = 5800;` | kb@f6a2bcc ST descent.js:15, :20 |
| Header source: names from grid-data.js (OSM, ODbL) plus the table from `globalgrid2050.com/grid_substations.geojson` | kb@f6a2bcc ST descent.js:5-6 |
| `ED data/see-through.json`: 666,940 bytes, sha256 `440950711a148eb019b7309ea1a0610219c096742893ce8d7c1f81be18d479a6` (builds before it: 666,922 B `87069db3…` at 21:46, 666,945 B `87d5db35…` at 22:33, both superseded) | ED data/see-through.json (`sha256sum`, 22:49 UTC) |
| Its `licence`: "ODbL 1.0: a derived database of 4,460 OpenStreetMap substation names (c) OpenStreetMap contributors; …"; `attribution` "Substation names (c) OpenStreetMap contributors, ODbL 1.0 (…NOTICE.md:22-25; grid-data.js:7)" | same file, `licence`, `attribution` |
| `format: code-feature-collection.v1`, `space: 63340120796`, `see_through: 202610050609`, **5,800** Point features, **4,460** named, 1,340 unnamed, min key 1,583,503, max key 18,367,051,527 (< SPACE) | same file, recounted in Python |
| Every feature j: `properties.sub == j` and `geometry.key == floor((2j+1)·SPACE/40000)` = `floor((j+0.5)·SPACE/20000)`: **0 of 5,800** differ | same file, recomputed in Python |
| j 0 → key 1,583,503 (no name); j 1182 → key 3,744,984,642, name `Drax` | same file, features[0], features[1182] |
| The module admits only that shape: format, 5,800, `sub === i`, `key === starKey(i, space)`, key < wafer | MOD:151-170 |
| Places each key with `keyPlace` and nothing else | MOD:167 |

## 7. The homepage row

| Fact | Key |
|---|---|
| Apps entry: "See Through: from the stars to one substation in 3D … About 5,800 mapped substations" | gg@c66759f homepage_versions/homepage_v134.html:18 |
| Registry row `data-entity-id="see-through"`, the same sentence, Operative, build `20261005-0609`, link to the dated folder `https://ventusltd.github.io/kuiper-belt/see-through/202610050609/` (3 occurrences in the file) | gg@c66759f homepage_versions/homepage_v134.html:35 |
| `homepage_v134.html` is the highest-numbered homepage version | gg@c66759f homepage_versions/ (`ls`) |
| The module's `title` and `aria-label` are that sentence, byte for byte | MOD:17, :82 |

## 8. GridAtlas lessons the module uses

| Lesson | GridAtlas key | Where in the module |
|---|---|---|
| The lit face of a title: `background:rgba(80,220,240,.16);color:#fff` | ga@5ec7f62 atlas/modules/202609031958-menu-bar.js:177-178 | MOD:59, :61-62 |
| One node moved, never cloned (`move(panel, node, label)`) | ga@5ec7f62 menu-bar.js:1490 | MOD:78 (never two copies); the move itself is the shell's `mountStar` |
| GRID/SUBS chips stay on the map on a phone ("one tap, not two") | ga@5ec7f62 menu-bar.js:1521-1523 (`chipStaysOnMap`) | MOD:62-63 (the 44 px strip's face; the strip is the shell's) |
| The first title of the left group is read first (`buildBar`) | ga@5ec7f62 menu-bar.js:481-483 | the shell's `mountStar` (kb@f6a2bcc ED modules/202611012143-kuiper-shell.js:308-314) called at MOD:96 |

## 9. Every Kuiper hook the module uses, with its line

Hook table `kuiper.hooks.v1` (ED handoff/04-loader/HOOKS.md); `KY` built at ED modules/202611012145-loader.js:36-60
(`hooks` :38-42); engine lines at kb@96736f5 ED index.html (the hook table's base). Requires list in the header MOD:9
and in the registration MOD:365-366: 19 names, identical, all used.

| Hook | Module line(s) | Engine / loader line |
|---|---|---|
| `hooks.wafer` (promise `{N, SPACE}`) | MOD:356 | handoff/04-loader/index.html.patch:59, :70; loader.js:42 |
| `hooks.SPACE` (getter) | MOD:357 | ED index.html:198, :208; loader.js:41 |
| `hooks.keyPlace` | MOD:167, :338 | ED index.html:278; loader.js:39 |
| `hooks.address` | MOD:252, :293 | ED index.html:282-283; loader.js:39 |
| `hooks.describe` | MOD:259 | ED index.html:284; loader.js:39 |
| `hooks.goKey` | MOD:339 | ED index.html:416; loader.js:39 |
| `hooks.fmt` | MOD:146, :148, :189, :226, :260, :335, :337 | ED index.html:125; loader.js:39 |
| `hooks.esc` | MOD:289, :291, :296, :315, :316, :340 | ED index.html:681; loader.js:39 |
| `hooks.cv` | MOD:243 | ED index.html:121; loader.js:40 |
| `hooks.ov` | MOD:212, :218 | ED index.html:121; loader.js:40 |
| `hooks.o2` | MOD:215 | ED index.html:121; loader.js:40 |
| `hooks.hud` | MOD:232, :337 | ED index.html:123; loader.js:40 |
| `hooks.card` | MOD:249, :270, :284, :304, :314, :340 | ED index.html:124; loader.js:40 |
| `hooks.gin` | MOD:308, :310 | ED index.html:604; loader.js:40 |
| `hooks.repos` (getter) | MOD:294, :295, :312 | ED index.html:198, :202; loader.js:41 |
| `KY.cam` (`x y zoom`) | MOD:212, :218 | ED index.html:243; loader.js:43 |
| `KY.sel.target` (set) | MOD:261 | ED index.html:243; loader.js:47 |
| `KY.redraw()` | MOD:141, :263 | ED index.html:243 (`dirty`); loader.js:48 |
| `KY.draw.add(fn, 50)` | MOD:354 | ED index.html:332 (`draw`); loader.js:29-32, :49 |
| `KY.register` (once) | MOD:363-367 | loader.js:56 |
| `KY.modules` (optional: kuiper-shell, layers, file/link) | MOD:72, :133, :330 | loader.js:58 |
| `KY.layers` (optional; absent from the frozen `KY`, so MOD:133 always falls back to `KY.modules.layers.api`) | MOD:133, :136, :176, :198-202 | ED modules/202611012141-layers.js:77 (`get`), :118-136 (`register`), :127 (REFUSED returns before load) |

Divergence from ROADMAP step 5 "Module name" (ROADMAP.md:375-377: requires `keyPlace, address, o2, card, flyTo, safeBox,
panels, draw, redraw, layers, menuBar`): the module does not require `flyTo`, `safeBox`, `panels`, `layers` or `menuBar`
(it uses `goKey`, which calls `flyTo` at ED index.html:416; the shell's `mountStar` instead of `menuBar`; `layers` is
optional). The hook table governs admission; the roadmap list is superseded, stated here, not hidden.

## 9a. The entry's form on the test phones (cross-team, for the owner's Q7)

| Fact | Key |
|---|---|
| The shell's rule: `var STAR_TITLE_MQ = '(min-width: 434px)';` (title at 434 px and wider, the strip below) | ED modules/202611012143-kuiper-shell.js:41 |
| ROADMAP R7/Q7 assumed 381 px ("A Pixel 7 (393 px) shows the title") | neural-link FIXES/NL-010/ROADMAP.md:1029-1033 (Q7) |
| Playwright `devices['Pixel 7']` viewport 412×839, `devices['Galaxy S24']` 360×780 | playwright devices table (node, 22:24 UTC) |
| So under the admitted shell both test phones show the bottom-left strip; the title appears at ≥ 434 px (landscape, desktop). The module mounts through `api.mountStar` (MOD:96) and follows the shell (MOD:19-20: "this module never makes a strip of its own"); without the shell it joins Edition 4's bar as its first title (MOD:88-92, form `title-fallback`), which NL-009 01 measured as two rows at 360-430 px (FIXES/NL-009/round1/01-bar.md F1) | lead's decision PLAN.md 22:16 UTC |

## 10. The module header's licence line: verdict

As found (kuiper-belt@2c87ba4 MOD:1, :3-5): line 1 "Apache-2.0 (kuiper-belt code)", line 3 "this file is Apache-2.0 …
copies none of its code", lines 4-5 "the one block below marked CERN-OHL-S-2.0 restates See Through's star-key rule".
That contradicts itself and ROADMAP.md:713-715 (a module carrying See Through code is CERN-OHL-S v2 and cannot be
relicensed Apache-2.0). The block MOD:28-33 is See Through's rule (descent.js:19, :963, :965), the same expression as
grid.js:38, and grid.js is itself CERN-OHL-S v2 (learn-the-kuiper NOTICE.md:7-10).

Written by the evidence officer (OPUS-BRIEF.md:49-50 gives this role the header licence line), committed by the harness
in kb@f6a2bcc, line count kept: MOD:1 `CERN-OHL-S-2.0 (the whole file; ROADMAP 9.8: never Apache-2.0)`; MOD:3-5 name
the licence text, the copied block and its origin, and that the Apache-2.0 engine is only called. The loader's header
regex (loader.js:83, `/^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),/`) still matches. The same
correction was made to the one licence line of `handoff/05-see-through/build-see-through-json.py:19` (it quotes and
evaluates the same rule). **Verdict: PASS after the correction**, with the consequences in LICENCE.txt (modules.json
record `"licence": "CERN-OHL-S-2.0"`; `data/layers.json` row; `LICENCES.md` row).

## 11. Findings put to the lead, and their state at 22:52 UTC (re-measured in MOD and the data)

1. Wrong law sentence in the family text: **fixed**. MOD:125 now reads `r = √(key + 0.5), θ = 2π · frac(key × 2654435769 /
   2³²)` with keys (cosmos/wafer-meta.json:12; index.html:278). README-the-apps.md here carries the same correction of the
   NL-009 06 block (whose "θ = key × golden angle" is the teaching spiral, ST kuiper-law.js:98-108).
2. No ODbL credit on screen: **fixed**. The OK row ends ` · names © OpenStreetMap contributors, ODbL` (MOD:146-147).
3. data/see-through.json licence: **fixed**. `licence` "ODbL 1.0: a derived database of 4,460 OpenStreetMap substation
   names …" (§6). Whether 4,460 names is a "substantial" extract was not keyable from the clones (NOT EVALUATED); the
   conservative label stands.
4. The row's folder and sky: **fixed**. MOD:146 says "See Through 202610050609 (its sky 59,637,070,538 until the patch)".
5. Deep links written, not read, by See Through 202610050609: **open by design**. 0 hash readers in ST (§1). The reader
   is `see-through-hash-reader.patch` (22:30 UTC), measured by the lead on a scratch copy only (REQUEST
   issuecomment-6564878115). In this edition the acceptance "a deep link lands on the named substation" is NOT
   EVALUATED on the shipped site and must be reported so.
6. startLayer() settling: **fixed**. A throwing `register` falls back to the module's own load (MOD:202-203); a registry
   that never calls `load` (REFUSED, layers.js:127) settles after 6 s with a WAIT row (MOD:205).
7. The data hash in `data/layers.json`: **fixed by Opus 3** (re-read 22:54 UTC). The `see-through` record's source now
   holds `data/see-through.json`, bytes 666,940, features 5,800, sha256 `440950711a148eb019b7309ea1a0610219c096742893ce8d7c1f81be18d479a6`,
   equal to the file (ED data/layers.json `see-through` source). Any further rebuild of the data must be re-recorded there,
   or MOD:176-185 refuses it (`sha256 mismatch`, MOD:184). The HANDOFF must quote this sha256.
8. Minor, open: MOD:21 cites the 9 px rule at "index.html:688-693"; in this edition it is ED index.html:685-689 (`bd = 81`
   at :687). MOD:12 lists four api functions; install returns five (`readHash`, MOD:360).
9. For the tester: test.cjs's static check should require `CERN-OHL-S` in the header when the body carries the block
   (ROADMAP.md:713-715), not `Apache-2.0`; its preview manifest record's licence should be `CERN-OHL-S-2.0`.

## 12. Review of the lead's HANDOFF comment, and the evidence officer's verdict

State at 23:25 UTC: **no HANDOFF draft exists** (none in this folder, none in /tmp/nl010-opus/team-5/lead/posts/, which
holds only req1-3 and find1). The tester has **REFUSED** the hand-off (TEST.md:3; run5 23:10 UTC: entry FAIL at 393 px
under the 381 px rule; spark FAIL, `#card` `visibility:hidden` from the layers/line-card `.gm-open` conflict, FINDING
issuecomment-6565202316). So no HANDOFF may be posted yet, and this officer has nothing to pass.

Conditions for this officer's PASS of the HANDOFF comment when it is drafted:
(a) the module sha256 quoted equals `MODULE.sha256` and the file (at 23:25: `87a88e48…873`, 26,000 bytes; if it moved,
    §1-§11's `MOD:n` are re-read first);
(b) the data sha256 quoted equals the file and `data/layers.json` (at 23:25 both `44095071…79a6`, 666,940 bytes; TEST.md's
    run5 still names the superseded `87d5db35…`, so the passing run must be re-run on the current bytes);
(c) licences stated as CERN-OHL-S-2.0 for the module (header MOD:1) and build script, ODbL 1.0 for data/see-through.json,
    Apache-2.0 for test.cjs, and the modules.json record `"licence": "CERN-OHL-S-2.0"` requested of Opus 10;
(d) the deep-link landing in See Through reported NOT EVALUATED on the shipped site (0 hash readers in 202610050609; the
    patch's PASS is a scratch copy only);
(e) the 434 px rule stated as team 1's (kuiper-shell.js:41) and as a change to Q7: a Pixel 7 shows the strip; 381 px
    recorded as R7's figure; the run's `--title-min 434` named;
(f) the spark step and the "without layers" preview run (PLAN.md 23:07 decision) named as such, with the with-layers run
    and FINDING issuecomment-6565202316 kept in the report, not dropped;
(g) every number quoted from test.cjs's report.json, both devices, `pageerror` 0, the CARTO request counted as the
    sandbox's network refusal (NL-009 06 F4), and img/ holding the PNGs (empty at 23:25);
(h) PROTOCOL envelope, the footer, no ACCEPT.

**Verdict of the evidence officer (23:25 UTC):** EVIDENCE.md and LICENCE.txt complete for the module and data as keyed
above. Module header licence line: **PASS** after the correction to CERN-OHL-S-2.0 (§10). Findings 1-4, 6 and 7 of §11 are
fixed in the files; 5 is open by design (See Through untouchable), 8-9 are minor and open. HANDOFF comment: **NOT
REVIEWED: not yet drafted**, and it must not be posted while TEST.md reads REFUSED.
