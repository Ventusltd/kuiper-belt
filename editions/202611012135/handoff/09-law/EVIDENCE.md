# EVIDENCE.md: Opus team 9, step 9 "the release law and the licence register"

Evidence officer OPUS-9 (arrived 00:36 UTC, 2 Nov 2026; until then the lead kept this file, and the lead's measured
sections are kept below under his name). Every claim carries a key `repo@sha path:line`; every key in sections 1-7
was re-read from git objects (`git show <sha>:<path>`), never from a working tree or from memory, by two scripts kept
outside the repositories:

- `/tmp/nl010-opus/team-9/evidence/verify_evidence.py` (evidence officer, 00:41 UTC): **87 keys, RESULT: PASS**, plus 7
  "unchanged since the roadmap's head" rows, all PASS. Output: `verify_evidence.tsv` beside it.
- `/tmp/nl010-opus/team-9/evidence/verify_keys.py` (lead, the register's 31 keys): re-run by the evidence officer at
  00:42 UTC, **31 keys, RESULT: PASS** (`verify_keys-eo.tsv`), the same result the lead had at 00:24.

Heads (full): gridatlas `5ec7f62f213e2d20a02e86427daa182c0f38e4a4`; kuiper-belt `018b46aed50f28f7b1882a0dcaba6593ce522beb`
(the roadmap's head and main's parent of this branch); elements `f7a92fb085c38dcbbd5cb469a66cd5ca61fb95bf`; testcode
`d09c185c8dacbc5c73afb2b0d0d8dad40745a544`; globalgrid2050 `c66759f0d7ac3489df9158da6eaa1330a37c069f`; galaxies-wafers
`fff6fc6ad4f93a15fe8f6456942a1b44e5547105`; stars `cbca125bb5eeb7d0ffb02f4546d60eb5d47dadc9`; code-generator
`857ea81244848b1da8fe21fffaed74cab568a3b4`; neural-link `591b57c` (the harness notes, AGENTS.md) and `fc822ee` / HEAD
`98f5cfa` (NL-009 round 1, committed after 591b57c). Branch `edition/202611012135` HEAD at 00:46 UTC: `aa04b3b`.
Files the edition uses are unchanged between 018b46a and `aa04b3b`: `LAWS.md`, `tools/ci_check.py`, `editions/index.html`,
`LICENSE`, `README.md`, `editions/README.md` (`git diff --stat 018b46a HEAD -- <file>` empty for each); gridatlas
`docs/RELEASE.md` unchanged at its HEAD; globalgrid2050 `LICENSE.txt` unchanged at its HEAD `6845b28`.

## 1. GridAtlas RELEASE.md: the eight steps and the rules the law copies

| # | step | key | row read (start) | where LAW.md carries it |
|---|---|---|---|---|
| 1 | cut | gridatlas@5ec7f62 docs/RELEASE.md:38 | `\| 1 \| cut \| tools/lightning/make-generation.mjs --gen G ...` | 9.1 (a new dated folder, cut stamp) |
| 2 | preview PR | docs/RELEASE.md:39 | `\| 2 \| preview PR \| publish-preview.mjs ...` "draft PR open ... rebase-merged, so atlas/v/G/ is on Pages" | 9.6 PR A |
| 3 | owner acceptance | docs/RELEASE.md:40 | "the owner comments `ACCEPT G` (first line) on the preview PR ... by an owner login, not through a GitHub App, no agent signature, after G's `cut_at_utc`; a later `REJECT G` ... withdraws it" | 9.6 (ACCEPT on PR A); "by an owner login" is not carried (section 8, C2) |
| 4 | release | docs/RELEASE.md:41 | "draft release PR with CI green; the owner merges it with **rebase**" | 9.6 PR B |
| 5 | live bytes | docs/RELEASE.md:42 | `check-live.mjs --generation G --wait` | no Kuiper equivalent named (Pages run, notes :49-51) |
| 6 | homepage | docs/RELEASE.md:43 | `homepage-bump.mjs label ... pin ... deploy` | not in step 9 (the R3 homepage card is the harness's) |
| 7 | served | docs/RELEASE.md:44 | "the served ... match the pin byte for byte" | 9.4's second run against the pointer |
| 8 | rollback | docs/RELEASE.md:45 | "`rollback-generation.mjs --release-commit <sha>` (route C ...)" | 9.7 |

"Eight steps, each one script" (docs/RELEASE.md:26). Rules: a release moves the pointer, "Nothing else changes"
(:3-7); "Agents never record acceptance" (:49-53); "Only the owner merges a release ... rebase, never squash" (:54-55);
every cartridge "hashing to its recorded sha256" (:117); "The tested preview is the release" (:119-121); "Only those two
files may change ... revertable, byte for byte" (:147-151); "Rollback is in the reverse order: pointer first" (:264);
route C refuses when "the pointer has moved since that commit" (:291-296), requires "byte-identical" to the parent
(:300-302), runs the gates and commits on `rollback/<G>-to-<P>` (:305-306). Manifest: atlas/current.json:5
`IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES`, :14-21 `cartridge_order` (six ids), :31 a 64-hex `sha256`; the gate refuses a
mismatch, tools/ci/pr-gate.mjs:176 (`SHA-256 mismatch`). Admission: atlas/modules/202609031958-menu-bar.js:8-17 ("it
installs nothing until ..."), **:17-18** ("A missing control leaves the old interface reachable and is published as / a
failure instead of being silently skipped"), :122-124 (`complete:` against `EXPECTED_LAYER_CONTROLS`), :157
(`missing.push('63 unique layer controls')`). GridAtlas's root forwards both: index.html:2
`location.replace(target+window.location.search+window.location.hash)`.

## 2. kuiper-belt LAWS.md: L1-L10 (unchanged at aa04b3b)

| law | key | heading read |
|---|---|---|
| preface | kuiper-belt@018b46a LAWS.md:3-4 | "A law that cannot be falsified is not a law" |
| L1 | LAWS.md:12 | `## L1. The shepherd is computed, never declared` |
| L2 | LAWS.md:26 | `## L2. Semi-major axis` |
| L3 | LAWS.md:42 | `## L3. Eccentricity` |
| L4 | LAWS.md:57 | `## L4. Inclination` |
| L5 | LAWS.md:72 | `## L5. Mass` |
| L6 | LAWS.md:82 | `## L6. Resonance` |
| L7 | LAWS.md:100 | `## L7. Epoch` |
| L8 | LAWS.md:111 (body :111-124, holds "licen") | `## L8. Openness: the only law that judges`: the register's rule rests here |
| L9 | LAWS.md:128 | `## L9. Reproducibility`: E9's byte-identical re-run is this law |
| L10 | LAWS.md:139 (verdicts :152-157) | `## L10. Reconciliation`: HONOURED / OVERREACHED / NOT EVALUATED (:156) / DISCLOSED (:157) |

L11 (the card law) is not in LAWS.md at 018b46a or aa04b3b; it is team 2's `handoff/02-card/LAWS-L11.patch`, not
applied. LAW.md uses L8, L10 :156 (NOT EVALUATED) and L10 :157 (DISCLOSED) only.

## 3. kuiper-belt tools/ci_check.py: K1-K4 (unchanged at aa04b3b)

| check | definition | code | what |
|---|---|---|---|
| K1 privacy | kuiper-belt@018b46a tools/ci_check.py:8 | :37-48 | every tracked file <= 3 MB scanned for a token whose digest is a non-public repository name |
| K2 sums | :9 | :50-60 | `cosmos/wafer.tsv` re-summed = `wafer-meta.json` = `repos.tsv` |
| K3 syntax | :10 | :62-80; root pages only `os.listdir(ROOT)` :68 | tools parse; the module script of each **root** page passes `node --check` |
| K4 order | :11 | :82-93 | keys in time order; address space closes |
| result | | :97 | `print('RESULT: ' + ('PASS' if not fails else 'FAIL'))` |

Workflow at 018b46a: `.github/workflows/check.yml:6-8` (`on: push`, `workflow_dispatch`), :25-26 (`run: python
tools/ci_check.py`). On this branch (committed at `3e0d8e7`, the harness's commit) :27-28 add `run: python
tools/edition_check.py`; file 862 bytes, sha256 `ac5b37ada96a...` (= MODULE.sha256).

Measured: the lead's run at 00:33 UTC on HEAD `9adcc00` (`/tmp/nl010-opus/team-9/lead/ci1.txt`): K1 `713 tracked files
scanned, 1 match a private digest`, `FAIL K1: editions/202611012135/handoff/07-apps/img/element-card.png`; K2 `issued
45,735,836,396 ... commits 13344: agree`; K3 `20 tools, 5 pages`; K4 `0 commits out of order`; `RESULT: FAIL`. The
evidence officer re-checked K1 for that one file with `check_proof.leaks` (the function K1 calls), read-only: `leaks:
True`; file sha256 `c00841869291...`, tracked. The token is not written here. Team 7's file; the lead's FINDING names it.

## 4. The pointer lines

| file | at | :7 meta refresh | :11 link | :12 location.replace |
|---|---|---|---|---|
| editions/index.html | kuiper-belt@018b46a and aa04b3b (identical) | `url=202611012027/` | `href="202611012027/"` | `location.replace('202611012027/' + location.hash)` (hash only) |
| see-through/index.html | kuiper-belt@018b46a | `url=202610050609/` | `href="202610050609/"` | `location.replace('202610050609/' + location.hash)` |
| see-through/index.html | kuiper-belt@aa04b3b (changed at `9adcc00`, the harness's commit) | `url=202611020012/` | `href="202611020012/"` | `location.replace('202611020012/' + location.search + location.hash)` |
| index.html (root) | gridatlas@5ec7f62 :2 | | | `location.replace(target+window.location.search+window.location.hash)` |

Rule's words: kuiper-belt@018b46a editions/README.md:3-4 ("The number is for people; the stamp is the key ... Kuiper
Edition 4"), :9-10 ("Find the newest edition from the pointer, not by sorting folder names"); the `/belt/` correction
editions/202611012027/README.md:25-26; Edition 4's `keys.json` digest editions/202611012027/proof/edition-sha256.txt:4
(`1c293c337b4c...`), and `editions/202611012135/keys.json` hashes the same (`sha256sum`, 00:40 UTC).
`handoff/09-law/pointer.patch` (366 bytes, `c24184cefb32...`) changes only line 12 to `+ location.search +
location.hash`; `git apply --check` against aa04b3b: applies cleanly (nothing written).

## 5. Every licence file consulted, with its sha

| repo@sha | path | bytes | git blob | sha256 |
|---|---|---|---|---|
| kuiper-belt@018b46a | LICENSE | 11,341 | 1afba8d896d2 | fdeda10cf13d92cb7e7aff9b864a72dd6054de64bb2f9a120e5f19040da65a76 |
| kuiper-belt@018b46a | README.md (licence sentence :156-157) | 11,612 | 47ce1a91ed16 | a4ed724e36f654c264d8e3a61fd4f05f6ec5b15ae4349c1c144b8ca477375d8b |
| kuiper-belt@018b46a | editions/README.md (:27) | 2,611 | 30da2d00c4c1 | 3511e6a628a7e5054644c2a2855e7dd181c0698b8c93298546068ae1f87bcd83 |
| kuiper-belt@018b46a | editions/202611012027/NOTICE.md | 1,149 | ac65324f9e19 | 626fd4582a76cc9ee56cd0402351fbad01bba476608d511a47f87153c4bb6550 |
| kuiper-belt@018b46a | LAWS.md (L8, L10) | 7,313 | 79dae2440dc0 | e5faec54c03af7919df3f046c25e69957e233df1d6e907717b8515b493ae57c3 |
| kuiper-belt@018b46a | see-through/README.md (:27-36) | 1,734 | 9d5f1718179f | 5c3370ff356c28dfd7e6db22e27494943780c957fc4c8c59bffcc4ce3ea757db |
| kuiper-belt@018b46a | see-through/202610050609/LICENSE.md | 619 | 8b08d72a3732 | 650e3a065cec482c2f1b7d87689b5a0ed68d1c8bf531a982c954168246be4bac |
| kuiper-belt@018b46a | see-through/202610050609/NOTICE.md | 3,877 | 0c1fb675ca4e | 5713318f22f944148a9a76eac8d139113baea862a6835d4631d81f07cb2571fc |
| kuiper-belt@018b46a | see-through/202610050609/licences/globalgrid2050-CERN-OHL-S-2.0.txt | 15,156 | c0e3c0b9b144 | b76e339bfb98ce26308087b503a6c8d6f962f711e10216cd6116bbd2883ec036 |
| kuiper-belt@018b46a | see-through/202610050609/vendor/MAPLIBRE-LICENSE.txt | 5,984 | 1e8acbb54fa7 | ee5fc05a0677eaf69601d2c7db0d9ecd6cc27c3abc1d0733bc9ed34707cf8ef2 |
| kuiper-belt@aa04b3b | see-through/202611020012/{LICENSE.md, NOTICE.md, licences/..., vendor/MAPLIBRE-LICENSE.txt} | as above | **the same four blobs** | identical to 202610050609's |
| kuiper-belt@018b46a | learn-the-kuiper/README.md (:34-37) | 2,692 | aadb5776a4d1 | 5f1ba0e1b91b833a12c500d6801b99383f0eef6798bc59456b351a066a9a09f1 |
| kuiper-belt@018b46a | learn-the-kuiper/202610050609/NOTICE.md | 3,388 | 5731e93e8bdd | 3eaa48d933fa6eda89bcd13be1851176ca9da8c2077806724c4e03c3d25e6eab |
| gridatlas@5ec7f62 | LICENSE | 11,358 | d64569567334 | cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30 |
| gridatlas@5ec7f62 | NOTICE | 1,415 | a4b2c1dba578 | 06d4c6325f518a159cb89f1bd823d0078e601428c9248d5b24a55b1489d7e541 |
| testcode@d09c185 | LICENSE | 11,358 | d64569567334 (= gridatlas's) | cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30 |
| testcode@d09c185 | NOTICE | 1,414 | dae2d5ad6949 | f1a6e6031c2e29c06892005c55460e66e7738101c32a0dcdf275f3a9dab321d2 |
| globalgrid2050@c66759f (and HEAD 6845b28) | LICENSE.txt | 15,156 | c0e3c0b9b144 (= See Through's licences/ copy) | b76e339bfb98ce26308087b503a6c8d6f962f711e10216cd6116bbd2883ec036 |

None in repository (`git ls-tree -r` at the head; a file named LICENSE/LICENCE/NOTICE/COPYING; `git grep -I -i -c licen`):

| repo@sha | tracked files | licence-named files | grep "licen" lines | note |
|---|---|---|---|---|
| elements@f7a92fb | 25 | 0 | 0 | DISCLOSED, Q1 |
| galaxies-wafers@fff6fc6 | 735 | 0 (two data files named `copying.json`: `layers/copying.json` 4,073,845 bytes, `iterations/12-visibility-lab/geometry/copying.json` 1,337,666 bytes, both a wafer layer `"id":"copying","label":"Real copying"`) | 2 (iterations/15-price-spread/README.md:3, :9; neither a grant) | DISCLOSED, Q2 |
| stars@cbca125 | 358 | 0 | 540 (mentions, not a grant) | DISCLOSED, Q5 |
| code-generator@857ea81 | 59 | 0 | 2 | DISCLOSED, Q5 |

Copied data traced to its source: `data/graphs/overview.json` sha256 `124aa35e3eab...` equals testcode@d09c185
`spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/overview-graph.json` byte for byte (and v1-v4's), a
tracked file under testcode's root LICENSE; `data/graphs/periodic-table.json` sha256 `b84820447a0f...` from stars (none
in repository). Not re-read here (repositories not in the estate clone): the GPL-2.0 / GPL-3.0 keys of team 7's 17
`line_text` quotations (`handoff/07-apps/LICENCE.txt:17`): `NOT EVALUATED` by this officer, team 7's keys.

Each team's row, measured on disk at 00:40 UTC (`wc -c`, `sha256sum`):

| file | bytes | sha256 | LICENCES.md section C says |
|---|---|---|---|
| handoff/01-shell/LICENCE.txt | 3,986 | 5983110cc7fb... | same |
| handoff/02-card/LICENCE.txt | 3,439 | 80f23a4f8f29... | same |
| handoff/03-layers/LICENCE.txt | 4,203 | 998a6ad8d2e3... | same |
| handoff/04-loader/LICENCE.txt | 3,343 | 274dda7700d1... | same |
| handoff/05-see-through/LICENCE.txt | 5,797 | b2b09032a06c... | same |
| handoff/06-file/LICENCE.txt | 4,216 | 1a5b58ab61b9... | same |
| handoff/07-apps/LICENCE.txt | **8,832** | **eb3b68f51cc0...** | **stale: 8,015, b062b2c14155 (the version at e92ad5d; changed at 3e0d8e7, adding the line_text row :17)** |
| handoff/08-drift/LICENCE.txt | 2,595 | c2f129ba3373... | same |
| handoff/09-law/LICENCE.txt | 1,917 | e3f6988e3b0e... | no size or sha written |
| handoff/10-integration/LICENCE.txt | absent | | NOT EVALUATED (correct) |

Modules, line 1 of each file (`grep -n -m1`): eight say `Apache-2.0` on line 1, `202611012141-see-through.js` says
`CERN-OHL-S-2.0 (the whole file ...)` on line 1: section B of LICENCES.md agrees.

## 6. The register's keys (lead, 00:24 UTC; re-run by the evidence officer 00:42 UTC, PASS)

`verify_keys.py`: `git show <sha>:<path>`, the lines printed and matched; `git ls-tree -r` and `git grep -i licen` for
"none in repository". 31 rows, all PASS both runs. The lead's first run printed one FAIL, `kb-ed4-notice-code`, where the
pattern was wrong and the claim right (the file says "Apache License 2.0"); the pattern was corrected.

| id | key | read (trimmed) |
|---|---|---|
| kb-licence | kuiper-belt@018b46a LICENSE:1-3 | Apache License / Version 2.0, January 2004 |
| kb-readme | README.md:156-157 | "Code is licensed / under Apache-2.0, see [LICENSE](LICENSE); documentation and generated data under CC BY 4.0" |
| kb-editions-readme | editions/README.md:27 | "Code Apache-2.0, text and data CC BY 4.0, as the repository." |
| kb-ed4-notice-code | editions/202611012027/NOTICE.md:3-5 | "... is licensed under the Apache License 2.0, as the kuiper-belt repository" |
| kb-ed4-notice-quotes | editions/202611012027/NOTICE.md:7-10 | "Every quoted line belongs to the repository it is keyed to and keeps that repository's licence ..." |
| kb-laws-l8 | LAWS.md:111-124 | "## L8. Openness: the only law that judges ..." |
| kb-laws-disclosed | LAWS.md:156 | "`NOT EVALUATED` \| listed, never merely counted ..." |
| ga-licence | gridatlas@5ec7f62 LICENSE:1-4 | Apache License / Version 2.0 |
| ga-notice | NOTICE:1-12 | "gridatlas / Copyright 2026 Ventus Ltd ..." |
| ga-notice-thirdparty | NOTICE:25-32 | "WHAT THIS LICENCE DOES NOT COVER: / Third-party data ... keeps its own terms" |
| ga-trademarks | LICENSE:139-142 | "6. Trademarks. This License does not grant permission to use the trade names, trademarks ..." |
| ga-ventus-css | atlas/modules/202609031958-menu-bar.js:184-205 | "/* The VENTUS masthead, fused into the centre of this same 36px strip ..." |
| st-licence | kuiper-belt@018b46a see-through/202610050609/LICENSE.md:1-10 | "See Through reuses simulator code by Ventus Ltd from the globalgrid2050 repository ..." |
| st-notice-head | see-through/202610050609/NOTICE.md:3 | "See Through is offered under CERN-OHL-S v2" |
| st-notice-files | NOTICE.md:8-16 | per-file table: `descent.js` ... CERN-OHL-S v2 here |
| st-notice-odbl | NOTICE.md:22-27 | "OpenStreetMap: substation names ... GridAtlas line files ..." (ODbL) |
| st-notice-services | NOTICE.md:28-34 | CARTO, Esri World Imagery, AWS Terrain Tiles |
| st-notice-maplibre | NOTICE.md:38-39 | "MapLibre GL JS 4.7.1 ... BSD-3-Clause" |
| st-maplibre-licence | vendor/MAPLIBRE-LICENSE.txt:1 | "Copyright (c) 2023, MapLibre contributors" |
| st-cern-text | licences/globalgrid2050-CERN-OHL-S-2.0.txt:1 | "This project is licensed under the CERN Open Hardware Licence Version 2 - Strongly Reciprocal" |
| st-pointer | see-through/index.html:12 | `location.replace('202610050609/' + location.hash)` |
| gg-licence | globalgrid2050@c66759f LICENSE.txt:1-5 | the same CERN OHL-S v2 header; Author: Vikram (Ventus Ltd) |
| lk-readme | kuiper-belt@018b46a learn-the-kuiper/README.md:34-37 | "Code: Apache-2.0 ... Documentation and generated data: CC BY 4.0. Parts adapted from the globalgrid2050 ..." |
| lk-notice | learn-the-kuiper/202610050609/NOTICE.md:7-11 | "Code in this folder is Apache-2.0 ... Two parts are adapted from the globalgrid2050 repository ..." |
| tc-licence | testcode@d09c185 LICENSE:2-4 | Apache License / Version 2.0 |
| tc-notice | NOTICE:1-12 | "testcode / Copyright 2026 Ventus Ltd ..." |
| tc-notice-thirdparty | NOTICE:26-33 | "Third-party data this repository reads or redistributes keeps its own terms ..." |
| none-elements / none-galaxies-wafers / none-stars / none-code-generator | (tree) | as section 5 |

## 7. The law's process keys (harness notes, AGENTS.md, NL-009)

| claim in LAW.md | key | read |
|---|---|---|
| the NL-008 gap | neural-link@591b57c SESSIONS/202611012145-kuiper-edition-harness-notes.md:19-20 | "the harness merged release PRs on chat authorisation against RELEASE.md \"only the owner merges\"" |
| folder rule, three places, no `/belt/` | notes :39-41 | "every change is a new dated folder ... three places ... no `/belt/`" |
| README entries, "current edition" sentence | notes :42-43 | |
| each folder's files; sha256 of every file except itself | notes :44-46 | "`proof/edition-sha256.txt` (sha256 of every file except itself)" |
| ci_check before push; the old merge path | notes :48-49 | "`python3 tools/ci_check.py` must print `RESULT: PASS`. ... merge `--no-ff` into main, push main" |
| Android test method | notes :52-58 | Pixel 7 with `hasTouch`, `isMobile`, `deviceScaleFactor`; real touch |
| agents never post ACCEPT | notes :63-64 | "Agents never post ACCEPT; the owner does." |
| no agent declares ACCEPT or merges release branches | neural-link@591b57c AGENTS.md:18 | "No agent may impersonate the owner or declare `ACCEPT <generation>`, merge protected or live release branches" |
| (cited with :18) | AGENTS.md:11 | "For GridAtlas, never move the live generation ... without explicit owner acceptance": GridAtlas's rule, by analogy |
| (k) | neural-link@fc822ee FIXES/NL-009/round1/01-bar.md:13 | "BLOCKER — the bar is two rows on every phone width. Bar height 75.1 px" |
| (l) | 01-bar.md:18 | "MAJOR — titles are below the touch target. Button height 29.0 px" |
| (m) | 01-bar.md:20; 06-seethrough.md:11, :24 | "MAJOR — there is no room for SEE THROUGH"; "BLOCKER ... unreachable from Edition 4"; "MAJOR ... the bar is two rows" |
| (n) | 09-robust.md:11 | "MAJOR · the READOUT panel slides under the bar after any pick" |
| (o) | 09-robust.md:18 | "MAJOR · WebGL unavailable gives a blank black screen" |
| the journey's test method | neural-link FIXES/NL-009/round1/BRIEF.md:11-20 (committed `d7805cc`) | serve the root, Pixel 7, SwiftShader flags, real touch, wait 6-8 s |

The NL-009 round-1 files are not in `591b57c` (`git show 591b57c:FIXES/NL-009/round1/01-bar.md` fails); they were
committed at `fc822ee`. `FIXES/NL-009/android-journey.cjs` is now 40,885 bytes (`418e215`), not the roadmap's 35,990.

## 8. LAW.md against ROADMAP step 9, sentence by sentence

LAW.md as on disk at 00:27 UTC (15,334 bytes, sha256 `66b2fa999252...` = MODULE.sha256), against
neural-link FIXES/NL-010/ROADMAP.md step 9 (:649-741) and team-5/STEPS.md 9.1-9.8. Verdicts: SAME (the roadmap's words or
the same meaning, every key kept), ADDED (more than the roadmap, not weaker), and the corrections C1-C10 the lead
should make before the HANDOFF.

| roadmap sentence (ROADMAP.md line) | LAW.md | verdict |
|---|---|---|
| Goal 1: one written law: folder, pointer in three places and nowhere else, ci_check green, journey green, modules hashed, owner's ACCEPT on a served preview before the pointer moves, owner merges the pointer, rollback byte-exact, no folder deleted (:651-654) | :3, :10-13 | SAME; ADDED `edition_check` green |
| Goal 2: every licence verified from the files, one register in the folder (:654-655) | :13-14 | SAME (verbatim) |
| Lesson: a release is a pointer move and nothing else (RELEASE.md:3-7, :139-151) (:657-658) | :16 | SAME |
| Lesson: the eight steps cut, preview PR, owner acceptance, release, live bytes, homepage, served, rollback (:38-45) (:658-659) | absent | **C1 OMITTED**: add the clause and its key to :16-17 |
| Lesson: the tested preview is the release (:119-121) (:659) | :17 | SAME |
| Lesson: owner accepts in writing, first line, **by an owner login**, agents never record acceptance (:40, :49-53) (:659-660) | :17-18 "the owner accepts in writing, first line" | **C2 SOFTENED**: "by an owner login" dropped; RELEASE.md:40 adds "not through a GitHub App, no agent signature". Restore at :17 and in 9.6's gate (:144) |
| Lesson: only the owner merges, every PR a draft, rebase never squash (:41, :54-55) (:660-661) | :18 | SAME |
| Lesson: cartridges hashed and refused on mismatch (current.json:5, :14-21, :31; pr-gate.mjs:176; RELEASE.md:117) (:661-662) | :19-20 | SAME, all five keys |
| Lesson: a module installs nothing until its hooks exist **and publishes a missing hook** (menu-bar.js:8-17, :122-124, :157) (:662-663) | :20 "installs nothing until its hooks exist (menu-bar.js:8-17)" | **C3 OMITTED**: "and publishes a missing hook" and the keys :122-124, :157 |
| Lesson: rollback a revert of the pointer commit, byte-exact, **gates re-run**, refused if the pointer has moved (:264, :283-306, :291-296, :300-302) (:663-664) | :21-22 | SAME in substance (:283-306 covers the sub-ranges; "gates re-run" is in 9.7 as "9.3 re-run"); optional: add "gates re-run" |
| Lesson: the NL-008 finding (notes :19-20) (:664-665) | :22-23 | SAME, key with sha |
| Kuiper change: `editions/LAW.md` root-level, in the release PR so the owner merges it; repeated in short in each edition's README (:667-668) | :7-8 | SAME for the PR; "repeated in short in each edition's README" not said: **C4** add one sentence (the duty falls on team 10's README) |
| 9.1 folder rule (notes :39-46; editions/README.md:3-4, :9-10) (:668-669) | :27-29 | SAME; ADDED "never deleted" (team-5 9.1 says it) |
| 9.1 the folder's files, incl. android-journey.json and ci_check.log from Edition 5 (:669-671) | :31-34 | SAME, every file named |
| 9.2 three places (:7, :11, :12), `<stamp>/`, no `/belt/` (:671-672) | :41-42 | SAME, keys checked in section 4 |
| 9.2 from Edition 5 forward `location.search + location.hash` as gridatlas index.html:2; today hash only, `editions/?layers=` opens with no layers (team-2 3.6) (:672-674) | :43-45 | SAME |
| 9.2 the same forwarding asked of `see-through/index.html:12` when step 5 cuts its folder (:674-675) | :46-47 | SAME words, **C5 STALE fact**: at aa04b3b the See Through pointer already names `202611020012/` and forwards `location.search + location.hash` (section 4; the harness's commit `9adcc00`). Say so in one clause |
| 9.2 the release PR adds the editions/README.md and root README entries (:675-676) | :47-49 | SAME |
| 9.3 ci_check PASS, K3 root only (:68) (:676-677) | :57-59 | SAME |
| 9.3 E1 every `editions/*/index.html` script and every `modules/*.js` pass `node --check` (:677-678) | table E1 | SAME |
| 9.3 E2 every module in modules.json exists and hashes as recorded, no stray file (:678-679) | table E2 | ADDED a third state: a hand-off-named file not in the manifest is NOT EVALUATED, a FAIL only under `--strict`; check.yml runs without `--strict`, so on GitHub E2 is softer than "no stray file". The release gate (9.3 step 3, `--strict`) keeps the roadmap's meaning. Acceptable as written because LAW.md says so; noted |
| 9.3 E3 proof/edition-sha256.txt matches every file (:679) | table E3 | ADDED: every edition folder (enforces "never edited") |
| 9.3 E4 three stamps agree and name a folder with a proof (:679-680) | table E4, :51-53 | SAME; ADDED search+hash once Edition 5+ |
| 9.3 E5 keys.json byte-identical unless the README names a change (1c293c33..., proof/edition-sha256.txt:4) (:680-681) | table E5 | SAME, key re-read (section 4) |
| 9.3 E6-E8 from step 4; E9 from step 8 (:681-682) | table E6-E9 | SAME; ADDED E9 NOT EVALUATED where clones are absent |
| 9.3 output saved as proof/ci_check.log; wired into check.yml (:6-8, :25-26) in the same PR (:682-683) | :79-87 | SAME; ADDED the three-step order and `--pre-cut` (the log is hashed by the list, so the list is cut after it) |
| 9.4 the journey script, Pixel 7, real touch, SwiftShader, served from the root (:683-685) | :91-96 | SAME (the adapted script, as the team brief :738-739 allows); NL-009 brief key: **C6** path is `FIXES/NL-009/round1/BRIEF.md:11-20` |
| 9.4 (a)-(j) (:685-689) | :99-106 | SAME; (i) "or wraps by design and says so" is team-5 9.4's wording |
| 9.4 every NL-009 BLOCKER and MAJOR (01-bar.md:13, :18, :20; 06-seethrough.md:11, :24; 09-robust.md:11, :18) (:689-690) | :105-111 (k)-(o) | SAME, every key re-read (section 7); **C7** the NL-009 keys carry no sha and LAW.md :7 says a short key means neural-link `591b57c`, where these files do not exist: name `fc822ee`. **C8** (m) reads "SEE THROUGH fits on that row" at 360 px, but ROADMAP R7 (:940-947) and Q7 (:1029-1033) put SEE THROUGH in the bottom-left 44 px strip at 380 px and narrower, and the journey script's own (m) reports the strip "not failed" (android-journey.cjs:546-547). Write R7's rule into (m) so the law and the gate agree |
| 9.4 every MINOR measured and reported without blocking ACCEPT (:690) | :113-116 | SAME |
| 9.4 NOT EVALUATED with the reason (LAWS.md:156), the list in the PR body (:691-692) | :116-117 | SAME |
| 9.5 modules.json hashes and the loader's refusals (step 4) (:692) | :122-130 | SAME; **C9 KEY**: "never a silent skip (menu-bar.js:15-17)" is at :17-18, "stays usable ... (menu-bar.js:16)" is at :17 (section 1); inherited from team-5 9.5 |
| 9.6 two draft PRs from edition/<stamp>; PR A adds the folder and nothing else, merged so Pages serves it, owner posts ACCEPT/REJECT first line on PR A (:692-694) | :134-141 | SAME |
| 9.6 PR B only the pointer, editions/README.md, root README, LAW.md the first time; gate ACCEPT after cut time, 9.3 PASS on PR head, pointer names the tested folder; only the owner merges PR B, with rebase (:695-697) | :142-146 | SAME; ADDED check.yml with LAW.md (the roadmap's "Files touched" :720-723 puts it in PR B) |
| 9.6 who merges PR A is Q6 (:697-698) | :148-150 | SAME |
| (not in the roadmap) | :150-153 "Edition 5's preview folder is already on kuiper-belt main at e92ad5d ... every later change to that folder before PR B is a further additive commit, and E3 is cut last" | **C10 ADDED, needs rewording**: the fact (e92ad5d on main, pointer unchanged there: `git diff --stat 018b46a origin/main -- editions/index.html` empty) is right; "every later change ... is a further additive commit" is a new practice the roadmap does not have, and it is not what happened: since e92ad5d the branch has modified 47 files of the folder and added 24 (`git diff --name-status e92ad5d HEAD -- editions/202611012135`), NOTICE.md and README.md among them. State it as a record, not a rule, or leave it to the owner (Q6) |
| 9.7 rollback by git revert on rollback/<stamp>-to-<previous>, refused unless the pointer has not moved, byte-identical to the parent, 9.3 re-run, draft PR only the owner merges, no folder deleted or edited (:698-700) | :160-166 | SAME; ADDED the README "rolled back" line and the older-edition route (both team-5 9.7) |
| 9.8 the register in the folder, verified from the files at the heads (:700-701) | :170-172 | SAME; the per-repository facts (:701-711) live in LICENCES.md section A, every key re-read (section 6) |
| 9.8 rule: DISCLOSED or NOT EVALUATED blocks copying, not linking (L8) (:712) | :173-174 | SAME (verbatim) |
| 9.8 linking to See Through brings no duty; copying kuiper-law.js or descent.js makes the module CERN-OHL-S v2, never relicensed; keep it in its own module (:713-715) | :174-176 | SAME |
| Licence note: the law and register CC BY 4.0, edition_check.py Apache-2.0 (:732-733) | :5-6 | SAME |
| Licence note: gaps elements, spider graph data, galaxies-wafers; neither invented (:733-734) | :179-180 | SAME (Q1, Q5, Q2) |
| Acceptance: E1-E9 PASS; one altered byte -> E2 FAIL and `<id> refused: sha256 mismatch`; missing hook; revert byte-identical (:725-730) | 9.3, 9.5, 9.7 | SAME |

Gap in the roadmap itself, carried into LAW.md: no PR in 9.6 carries new files under `tools/`. PR A is "editions/<stamp>/
and nothing else", PR B lists the pointer, the READMEs, LAW.md and check.yml; but check.yml's new line runs
`tools/edition_check.py` and E9 runs `tools/drift.py`, so PR B as listed would fail its own CI. On this branch
`git diff --name-status origin/main...HEAD` shows, outside the edition folder: `M .github/workflows/check.yml`,
`M see-through/README.md`, `M see-through/index.html`, `A see-through/202611020012/` (25 files), and `A tools/`
`apps_registry.py`, `build_layers.py`, `drift.py`, `edition_check.py`, `edition_min.py`, `element_keys.py`. None of these
is in PR A's or PR B's list. **C11**: add to 9.6 PR B "and, the first time, the `tools/*.py` the checks and the
edition's data need", or the owner rules on it (a REQUEST to the harness either way).

**Verdict on LAW.md: PASS with corrections.** Every key in it was re-read and holds (sections 1, 4, 6, 7). C1, C2, C3
(words of the roadmap dropped) and C8 (law and gate disagree) must be made for "without softening a word" to be true;
C4-C7, C9-C11 are one-line key or fact fixes. No sentence of the roadmap is contradicted except by C8.

## 9. The team's files, measured (00:40-00:46 UTC)

- `MODULE.sha256`: all eight digests re-computed by `sha256sum` and equal (tools/edition_check.py `13d1da026345...`,
  27,974 bytes; editions/LAW.md `66b2fa999252...`; LICENCES.md `9dfca7cad134...`, 13,292 bytes; check.yml
  `ac5b37ada96a...`; pointer.patch `c24184cefb32...`; android-journey.cjs `6f6627550649...`, 65,472 bytes;
  test_real_folder.py `a1e0d98f713e...`; test_edition_check.py `33f98f862d75...`, 35,654 bytes).
- `tools/edition_check.py` docstring line 2: "Apache-2.0 (kuiper-belt code)": the header licence line is right.
- `python3 tools/edition_check.py` (evidence officer, 00:42:08-00:42:20 UTC, 12 s, HEAD moving from `3e0d8e7` to
  `aa04b3b` during the run; output `/tmp/nl010-opus/team-9/evidence/ec-run1.txt`): E1 PASS (4 script blocks, 9 modules);
  E2 PASS, 6 files pending admission NOT EVALUATED; **E3 FAIL** (Edition 5's list stale: NOTICE.md `58705e08fc33` vs listed
  `a0a79bd23736`, README.md `26e075f63492` vs `f40f107e4509`, data/apps.json `027f6614745d` vs `9ade18cfdb58`,
  data/elements.json `e204cb414d38` vs `28b8b2df02b5`, kuiper-shell.js `1edf2e1ab3ac`, hand-off files unlisted); E4 PASS
  (hash-only forwarding allowed while the pointer names Edition 4); E5 PASS (`1c293c33...`); **E6 FAIL** (loader
  reference `d9272b82421d` vs manifest `25a16f1d3c3f`; hook-table block differs); E7 PASS; E8 PASS; E9 PASS (drift.json
  re-computed byte-identical, 118,553 bytes, `388103129b90...`); `RESULT: FAIL`, exit 1. The two FAILs are team 10's
  files (REQUESTS.md 1-2), and they are the tool doing its job.
- Tests (not re-run here, machine loaded; the runs' own files): `test_real_folder.py` 20 of 20 at 00:29:16 UTC,
  `TEST-REAL-RESULTS.json` (`tool_sha256` = the tool's current digest); `test_edition_check.py` (builder) `Ran 67 tests
  ... OK (skipped=5)` twice (`/tmp/nl010-opus/team-9/lead/synth-run2.txt`, `/tmp/nl010-opus/team-9/tester/synthetic-2.txt`).
  The tester's journey run on Pixel 7 was in progress at 00:46 (`journey1.log`: (a) FAIL "bar is not one row ... 75.1",
  the Edition 4 bar, because the shell module is pending admission). TEST.md is not on disk yet.

## 10. Findings outside team 9's files (for the HANDOFF and for #10)

1. **K1 FAIL** on `editions/202611012135/handoff/07-apps/img/element-card.png` (section 3), team 7's; every push of the
   branch fails `ci_check` until it is replaced. The lead's FINDING (`/tmp/nl010-opus/team-9/lead/finding-k1.md`) names
   the file and not the token: correct.
2. **LICENCES.md section C is stale for team 7** (8,832 bytes `eb3b68f51cc0`, not 8,015 `b062b2c14155`) and writes no
   size or sha for team 9's own row (1,917 bytes `e3f6988e3b0e`). The register is cut last, after every LICENCE.txt.
3. **LICENCES.md section A has no row for the 221 `line_text` quotations of `data/elements.json`** (team 7: 156 Apache-2.0
   or CERN-OHL-S v2, 17 GPL-2.0/GPL-3.0, 48 with no licence at the quoted commit; `handoff/07-apps/LICENCE.txt:17`). They
   appear only in section C's summary. By the register's own sentence "everything this edition brings in", they need a
   section A row (the same footing as the keys.json quotations, editions/202611012027/NOTICE.md:7-10, with the 48 marked
   DISCLOSED and the owner's choice of `line_text: null` named).
4. **The branch carries changes no PR of the law admits** (section 8, C11): check.yml, see-through/index.html,
   see-through/README.md, see-through/202611020012/, six new tools. The brief lists `see-through/` as untouchable for the
   Opus teams; these changes are the harness's commit `9adcc00`, not a team's. When the harness commits `editions/LAW.md`
   (untracked now) to this branch, a PR A cut from the branch carries it too, against 9.6 ("PR A ... nothing else").
5. **The law and the overnight plan**: the HARNESS DECISION-PROPOSAL (issue #10 comment 6565556866, 23:33 UTC) relays the
   owner's chat words "ACCEPT. ... merging and publishing in small steps" and reads them as authority for R1 "preview
   merge ... (squashed ...)" and R2 "pointer move". Under LAW.md 9.6 a pointer move needs `ACCEPT <stamp>` as the first
   line of the owner's comment on PR A after the cut time, and only the owner merges PR B, with rebase, never squash
   (RELEASE.md:41, :54-55). The chat relay is the NL-008 pattern (notes :19-20). Not team 9's to decide; the law is not
   in force until the owner merges it, and the owner may rule otherwise. Recorded so that nobody reads LAW.md as having
   allowed R2.

## 11. Review of the lead's HANDOFF

See the last section of this file (written after the review).
