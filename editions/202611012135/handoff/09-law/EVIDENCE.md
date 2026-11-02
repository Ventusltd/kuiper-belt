# EVIDENCE.md: Opus team 9, step 9 "the release law and the licence register"

Lead OPUS-9, 2026-11-02 UTC. Every claim of team 9's files carries a key `repo@sha path:line`; heads as in
`editions/LAW.md`. Scratch and scripts in /tmp/nl010-opus/team-9/.

## 1. The register's keys, re-read from git objects (LICENCES.md)

`python3 -I /tmp/nl010-opus/team-9/evidence/verify_keys.py` (00:24 UTC; `git show <sha>:<path>`, lines printed and
matched against the claim; `git ls-tree -r` and `git grep -i licen` for "none in repository"). RESULT: PASS, 31 rows.
The first run printed one FAIL, `kb-ed4-notice-code`: the claim was right and the pattern was wrong (the file says
"Apache License 2.0", the pattern looked for "Apache-2.0"); the pattern was corrected and the row passes.

| id | key | result | lines read (trimmed to 200 characters) |
|---|---|---|---|
| kb-licence | kuiper-belt@018b46a LICENSE:1-3 | PASS | Apache License / Version 2.0, January 2004 / http://www.apache.org/licenses/ |
| kb-readme | kuiper-belt@018b46a README.md:156-157 | PASS | This repository is public so the method can be checked, reused and argued with. Code is licensed / under Apache-2.0, see [LICENSE](LICENSE); documentation and generated data under CC BY 4.0. No |
| kb-editions-readme | kuiper-belt@018b46a editions/README.md:27 | PASS | evidence; `proof/` holds the digests. Code Apache-2.0, text and data CC BY 4.0, as the repository. |
| kb-ed4-notice-code | kuiper-belt@018b46a editions/202611012027/NOTICE.md:3-5 | PASS | Code in this folder (`index.html`, the Kuiper engine with the edition layer; `tools/edition_keys.py` at the repository root) is licensed under the Apache License 2.0, / as the kuiper-belt repository.  |
| kb-ed4-notice-quotes | kuiper-belt@018b46a editions/202611012027/NOTICE.md:7-10 | PASS | Every quoted line belongs to the repository it is keyed to and keeps that repository's licence: / Apache-2.0 (kuiper-belt, pipelinenews and most code), CERN-OHL-S v2 (globalgrid2050-derived material,  |
| kb-laws-l8 | kuiper-belt@018b46a LAWS.md:111-124 | PASS | ## L8. Openness: the only law that judges / A body is `open` when a destination can be resolved *and fetched*: a published page returning 200, / a runnable entry point, a document, or a dataset carryi |
| kb-laws-disclosed | kuiper-belt@018b46a LAWS.md:156 | PASS | \| `NOT EVALUATED` \| listed, never merely counted, so the remainder becomes a queue of statements to refine \| |
| ga-licence | gridatlas@5ec7f62 LICENSE:1-4 | PASS | Apache License / Version 2.0, January 2004 / http://www.apache.org/licenses/ |
| ga-notice | gridatlas@5ec7f62 NOTICE:1-12 | PASS | gridatlas / Copyright 2026 Ventus Ltd / Author: Vikram (Ventus Ltd) / Project: GlobalGrid2050 \| Ventus Core - Open Infrastructure Intelligence / Site: globalgrid2050.com / The Grid Atlas: the map, it |
| ga-notice-thirdparty | gridatlas@5ec7f62 NOTICE:25-32 | PASS | WHAT THIS LICENCE DOES NOT COVER: / Third-party data this repository reads or redistributes keeps its own terms / and is not licensed by this file. That includes, where present, the DESNZ / Renewable  |
| ga-trademarks | gridatlas@5ec7f62 LICENSE:139-142 | PASS | 6. Trademarks. This License does not grant permission to use the trade / names, trademarks, service marks, or product names of the Licensor, / except as required for reasonable and customary use in de |
| ga-ventus-css | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:184-205 | PASS | /* The VENTUS masthead, fused into the centre of this same 36px strip / (see buildBar) rather than a second row, so it costs no map height / on a phone and can never be torn out into a closed panel ag |
| st-licence | kuiper-belt@018b46a see-through/202610050609/LICENSE.md:1-10 | PASS | # Licence / See Through reuses simulator code by Ventus Ltd from the globalgrid2050 repository (place-frame.mjs, / mod/pylons-real.js, mod/substations.js, and the method of overlay.html, mod/wire-look |
| st-notice-head | kuiper-belt@018b46a see-through/202610050609/NOTICE.md:3 | PASS | Credits and licences for this folder. See Through is offered under CERN-OHL-S v2 (see `LICENSE.md`). |
| st-notice-files | kuiper-belt@018b46a see-through/202610050609/NOTICE.md:8-16 | PASS | \| File here \| Came from \| Licence \| / \|---\|---\|---\| / \| `descent.js` \| the SEE THROUGH module of Learn the Kuiper (`modules/descent.js`), adapted \| CERN-OHL-S v2 here \| / \| `kuiper-law.js |
| st-notice-odbl | kuiper-belt@018b46a see-through/202610050609/NOTICE.md:22-27 | PASS | - **OpenStreetMap**: substation names, positions, voltages, operators, GridAtlas line files, substation outlines, and / the per-site detail in `data/osm/*.json` (fetched with the Overpass API; each fi |
| st-notice-services | kuiper-belt@018b46a see-through/202610050609/NOTICE.md:28-34 | PASS | - **CARTO** dark-matter basemap style: (c) CARTO, map data (c) OpenStreetMap contributors. Shown on screen: / "Data © OpenStreetMap contributors \| © CARTO". / - **Esri World Imagery**: shown on scree |
| st-notice-maplibre | kuiper-belt@018b46a see-through/202610050609/NOTICE.md:38-39 | PASS | - **MapLibre GL JS 4.7.1** (`vendor/maplibre-gl.js`, `vendor/maplibre-gl.css`). BSD-3-Clause, (c) MapLibre / contributors and Mapbox; full text `vendor/MAPLIBRE-LICENSE.txt`. |
| st-maplibre-licence | kuiper-belt@018b46a see-through/202610050609/vendor/MAPLIBRE-LICENSE.txt:1 | PASS | Copyright (c) 2023, MapLibre contributors |
| st-cern-text | kuiper-belt@018b46a see-through/202610050609/licences/globalgrid2050-CERN-OHL-S-2.0.txt:1 | PASS | This project is licensed under the CERN Open Hardware Licence Version 2 - Strongly Reciprocal (CERN OHL-S v2) |
| st-pointer | kuiper-belt@018b46a see-through/index.html:12 | PASS | <script>location.replace('202610050609/' + location.hash);</script> |
| gg-licence | globalgrid2050@c66759f LICENSE.txt:1-5 | PASS | This project is licensed under the CERN Open Hardware Licence Version 2 - Strongly Reciprocal (CERN OHL-S v2) / Author: Vikram (Ventus Ltd) / Project: GlobalGrid2050 \| Ventus Core — Open Infrastructu |
| lk-readme | kuiper-belt@018b46a learn-the-kuiper/README.md:34-37 | PASS | ## Credits and licences / - Code: Apache-2.0, as the kuiper-belt repository (see `LICENSE` at the top of the repository). Documentation and / generated data: CC BY 4.0. Parts adapted from the globalgr |
| lk-notice | kuiper-belt@018b46a learn-the-kuiper/202610050609/NOTICE.md:7-11 | PASS | Code in this folder is Apache-2.0, as the kuiper-belt repository (see its `LICENSE`); documentation and generated data / are CC BY 4.0. Two parts are adapted from the globalgrid2050 repository and kee |
| tc-licence | testcode@d09c185 LICENSE:2-4 | PASS | Apache License / Version 2.0, January 2004 / http://www.apache.org/licenses/ |
| tc-notice | testcode@d09c185 NOTICE:1-12 | PASS | testcode / Copyright 2026 Ventus Ltd / Author: Vikram (Ventus Ltd) / Project: GlobalGrid2050 \| Ventus Core - Open Infrastructure Intelligence / Site: globalgrid2050.com / The test code engine: the li |
| tc-notice-thirdparty | testcode@d09c185 NOTICE:26-33 | PASS | Third-party data this repository reads or redistributes keeps its own terms / and is not licensed by this file. That includes, where present, the DESNZ / Renewable Energy Planning Database, NESO's Ele |
| none-elements | elements@f7a92fb (tree) | PASS | 25 tracked files; licence/notice/copying files: none; `git grep -i licen`: 0 line(s) |
| none-galaxies-wafers | galaxies-wafers@fff6fc6 (tree) | PASS | 735 tracked files; licence/notice/copying files: ['iterations/12-visibility-lab/geometry/copying.json', 'layers/copying.json']; `git grep -i licen`: 2 line(s) e.g. fff6fc6:iterations/15-price-spread/R |
| none-stars | stars@cbca125 (tree) | PASS | 358 tracked files; licence/notice/copying files: none; `git grep -i licen`: 540 line(s) e.g. cbca125:LINES.md:2269:2264 |
| none-code-generator | code-generator@857ea81 (tree) | PASS | 59 tracked files; licence/notice/copying files: none; `git grep -i licen`: 2 line(s) e.g. 857ea81:apps/substation-finder/Si/202609031958-menu-bar.js:342:         the ABOUT title. A licence credit that |

Also measured: `git diff --exit-code 018b46a 9adcc00 -- LICENSE` empty (kuiper-belt's licence unchanged on this branch);
README.md:157 at `9adcc00` reads "under Apache-2.0, see [LICENSE](LICENSE); documentation and generated data under CC BY
4.0"; `cmp` of see-through/202610050609/{LICENSE,NOTICE}.md with see-through/202611020012/ (the See Through pointer's
target at `9adcc00`, kuiper-belt see-through/index.html:7, :11, :12): identical.

## 2. The law's keys (LAW.md)

| claim | key | read |
|---|---|---|
| a release moves the pointer and nothing else | gridatlas@5ec7f62 docs/RELEASE.md:3-7 | "A **release** moves `atlas/current.json` ... Nothing else changes: the cartridges, manifest, proof and preview loader are already on main from the preview PR." |
| only the pointer is in the release commit; revertable byte for byte | docs/RELEASE.md:139-151 | "Only those two files may change ... That is what keeps the release separately revertable, byte for byte." |
| the owner's ACCEPT, first line, on the preview PR | docs/RELEASE.md:40 | "the owner comments `ACCEPT G` (first line) on the preview PR" |
| agents never record acceptance; only the owner merges a release; drafts; rebase | docs/RELEASE.md:49-55 | "**Agents never record acceptance.** ... **Only the owner merges a release.** Every PR the flow opens is a draft. The release PR is merged with rebase, never squash" |
| the tested preview is the release | docs/RELEASE.md:119-121 | "**The tested preview is the release:** `atlas/v/<G>/current.json` must equal the pointer about to be written" |
| rollback reverse order; route C refusals; byte-identical to the parent | docs/RELEASE.md:264, :283-306 | "Rollback is in the reverse order: pointer first"; "the pointer has moved since that commit"; "requires `atlas/current.json` to be **byte-identical** to the release commit's parent" |
| the NL-008 gap | neural-link SESSIONS/202611012145-kuiper-edition-harness-notes.md:19-20 | "the harness merged release PRs on chat authorisation against RELEASE.md \"only the owner merges\"" |
| folder rule, three places, no /belt/ | harness notes :39-41 | "every change is a new dated folder ... names the stamp in three places (meta refresh, link, `location.replace`) and must point at `<stamp>/` (no `/belt/`)" |
| each folder's files; sha256 of every file except itself | harness notes :44-46 | "`proof/edition-sha256.txt` (sha256 of every file except itself)" |
| ci_check before push | harness notes :48; kuiper-belt@018b46a tools/ci_check.py:97 | "`python3 tools/ci_check.py` must print `RESULT: PASS`"; `print('RESULT: ' + ('PASS' if not fails else 'FAIL'))` |
| K3 parses root pages only | kuiper-belt@018b46a tools/ci_check.py:68 | `pages = [f for f in os.listdir(ROOT) if f.endswith('.html')]` |
| the pointer's three places today | kuiper-belt editions/index.html:7, :11, :12 (working tree = 018b46a for this file) | `url=202611012027/`; `<a href="202611012027/">`; `location.replace('202611012027/' + location.hash)` |
| no agent declares ACCEPT or merges release branches | neural-link AGENTS.md:18 | "No agent may impersonate the owner or declare `ACCEPT <generation>`, merge protected or live release branches" |
| the newest edition from the pointer, not by sorting | kuiper-belt@018b46a editions/README.md:9-10 | "Find the newest edition from the pointer, not by sorting folder names" |

## 3. The tool's measurements (tools/edition_check.py on the folder as it stands)

Run at 00:29 UTC on the working tree of `edition/202611012135` (HEAD `9adcc00`), `python3 tools/edition_check.py`,
26 s (E9's drift re-run 12 s of it): E1 PASS (4 script blocks in 4 pages, 9 modules), E2 PASS with 6 files pending
admission NOT EVALUATED, **E3 FAIL**, E4 PASS, E5 PASS (`1c293c33...` both sides), **E6 FAIL**, E7 PASS, E8 PASS, E9
PASS (drift.json re-computed byte-identical, 118,553 bytes, sha256 `388103129b90...`, = handoff/08-drift/MODULE.sha256).

- E3: `proof/edition-sha256.txt` was cut by the integrator at about 00:20 (25 rows, untracked) without `handoff/` and
  before NOTICE.md, README.md and kuiper-shell.js changed again (NOTICE.md `58705e08fc33` vs listed `a0a79bd23736`;
  README.md `26e075f63492` vs `f40f107e4509`; kuiper-shell.js `1edf2e1ab3ac` vs `6fa6d5c0d1bd`; 129 hand-off files not
  listed). The law (harness notes :44-46, team-5/STEPS.md 9.1) says every file but itself; the list is cut last.
- E6: `modules.json` `references[0]` records the loader reference `25a16f1d3c3f...`, the file is `d9272b82421d...`
  (team 4's rev 5, `handoff/04-loader/MODULE.sha256`), and the page's hook-table block is still rev 4's (ADMISSIONS.md
  row 1, sha256 of the block `3ed23ad1...`). The same mismatch is on main: `git show e92ad5d:editions/202611012135/
  modules/202611012145-loader.js | sha256sum` = `d9272b82421d...` while main's modules.json records `25a16f1d...`.

## 4. The tests

- `test_real_folder.py` (lead): a copy of this repository made clean (admitted modules only, references dropped,
  sha256 list cut): clean copy `RESULT: PASS` under `--strict` with nothing NOT EVALUATED; 18 one-change cases each
  make their check FAIL with the law's words (`refused: sha256 mismatch`, `refused: stamp mismatch`, `refused: missing
  hook noSuchHook`, ...); pointer.patch applied and the pointer moved to Edition 5 makes E4 PASS. 20 of 20 at 00:30 UTC
  (`TEST-REAL-RESULTS.json`).
- `test_edition_check.py` (builder): the same law on a synthetic repository with a stub drift tool, so it runs on a
  GitHub runner; its result is in TEST.md.
