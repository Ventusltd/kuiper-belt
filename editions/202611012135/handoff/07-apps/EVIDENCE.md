# Opus team 7 · step 7 "the OS of the estate, baby step one" · EVIDENCE

Evidence officer OPUS-7 (evidence), written 2026-11-01 from 23:33 UTC (`date -u`; final stamp in section 10). Governing: neural-link
FIXES/NL-010/OPUS-BRIEF.md, ROADMAP.md step 7 (lines 516-588), team-4/EVIDENCE.md E1-E5, this folder's PLAN.md.
Law: no claim without a key `repo@sha path:line`; where a fact is an absence the key is the command that measured it;
a gap is written `DISCLOSED` or `NOT EVALUATED`, never filled in. Every check below was re-run by this officer with
`git show <sha>:<path>` on the clones under `/home/user/estate/` (and `/home/user/pipelinenews`,
`/home/user/globalgrid2050-homepage`, the builder's depth-1 clones in `/tmp/nl010-opus/team-7/builder/clones/`);
scratch in `/tmp/nl010-opus/team-7/evidence/`. No Playwright was run by this officer (brief: the machine is loaded).

## 0. Heads and the files reviewed

| repo | sha | clone |
|---|---|---|
| elements | f7a92fb085c38dcbbd5cb469a66cd5ca61fb95bf | full |
| globalgrid2050 | c66759f0d7ac3489df9158da6eaa1330a37c069f | shallow (HEAD tree complete) |
| testcode | d09c185c8dacbc5c73afb2b0d0d8dad40745a544 | full |
| stars | cbca125bb5eeb7d0ffb02f4546d60eb5d47dadc9 | shallow (HEAD tree complete) |
| gridatlas | 5ec7f62f213e2d20a02e86427daa182c0f38e4a4 | shallow |
| kuiper-belt | 018b46a (main, roadmap head); edition branch `edition/202611012135` HEAD febdd99 at 23:47 | full |

In-edition files are not yet at a fixed commit (the harness commits as they land), so they are keyed by their sha256
as reviewed (data and tools at 23:47 UTC, the module at 23:50); line numbers below refer to these bytes.

| file | sha256 | bytes |
|---|---|---|
| `editions/202611012135/modules/202611012309-apps.js` | fa01e012d81b32edf0287536e27a11075313dcd96d18c2409e21fb997bd0d481 (re-read 23:50, after the lead's requires fix) | 42,561 (`node --check` OK) |
| `editions/202611012135/data/apps.json` | 9ade18cfdb582ac6d7beede7efe05906dfc6027d51d62b425211183ca6987fe7 | 32,460 |
| `editions/202611012135/data/elements.json` | 28b8b2df02b5b7766ec31b2b04d14c5e7701f0198ab37b7f49c6d85a17184c02 (rebuilt 23:59 with `counts.live_register`; was 781dc0d9…a620) | |
| `editions/202611012135/data/graphs/overview.json` | 124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09 | 6,125 |
| `editions/202611012135/data/graphs/periodic-table.json` | b84820447a0f8d18687f48f409e2a5442bc66c7f8b71d7ff1a171ecc7dc53a0e | 509,639 |
| `tools/apps_registry.py` | caa40c002108284ad0be778d850e3868d2442e13ff3fd11f79ec5b27a1a6bd4e | (ast OK) |
| `tools/element_keys.py` | ba0217b8e99d1bf2373c6c72da503b619bb56d82a1b9138ddfa0383816212f57 | (ast OK) |
| `editions/202611012135/index.html` (the integrator's, hook table rev 3) | 418ae14ca39bc92be028f852825da196fd634ec12bb48f8f538d0cf739564d05 | |

If the lead rebuilds any of these after 23:47 the MODULE.sha256 / HANDOFF must carry the new digests; the keys of
sections 1-6 (to the source repositories) do not move.

## 1. The registry's five sources (apps.json `provenance.sources`), each re-hashed

| source | lines used | sha256 of the file at that commit (re-measured = recorded) |
|---|---|---|
| elements@f7a92fb APPS.md | :7-13 (the 7 `block:<Sym>` rows) | f9b3f6f7855d74b88ca0064625bab57c8d3f52a62f707e1ecc028ad6488716c0 = |
| elements@f7a92fb catalogue/apps.json | key lines :3, :109, :226, :340, :567, :715, :813; `live[0]` and `files[0]` only | ace0bde6d54853491bbc908755c25d1518d45b91b1d41c02c4b283fc70e027c4 = |
| globalgrid2050@c66759f homepage_versions/homepage_v134.html | :32-56 (25 `<tr data-entity-id>` rows) | 39a08ae0ba63e9461a1b7eeb1dbfb3d9dfa70160151a580783c647fc785d6044 = |
| testcode@d09c185 spider/INDEX.md | :13 (v5 row); :1 (title) | 17e67541feaf2ec38e919a4430762e13b5095aadd98df245534f8f53c6d180fc = |
| elements@f7a92fb CATALOGUE.md | :1 (title), :7-9 (counts 244 / 7 / 97) | ae26a1f245b73f57297aa9ded4c94fc3d1031a20c5ff73483eaa8fcf1c29127d = |

A1 by this officer's own script (not the team's `--check`): 34 records; every `key` matches
`^(block:[A-Za-z0-9]+|surface:https://)`; the 7 `block:` keys equal APPS.md:7-13 in order; the 25 homepage ids equal the
`data-entity-id` set of homepage_v134.html:32-56 in page order (line 13's highlight cards excluded: they are not
`<tr>` rows); for all 25, `source` names the right line and `name`, `kind`, `purpose` equal the line's
`<a>` text, `<summary>` and "Intended purpose:" sentence after `html.unescape`; for all 7 register rows `link` =
catalogue `live[0]` and `wafer.path` = catalogue `files[0]`. 33 distinct keys: rows 19 and 21 (homepage :44 and :46)
carry the same href in the source, and name each other in `same_as` (never merged, 7.1). Links differ from the source
href in exactly 3 rows, each declared in the row: `see-through` and `learn-the-kuiper` link the stable pointer folder
(`source_href` keeps the dated `202610050609/` href of the line), `cable-selection` is withheld under K1 (section 8).

## 2. A key for every one of the 34 rows

Licence = the licence file of the repository that serves the row's link, quoted at that clone's HEAD by
`tools/apps_registry.py` `licence_of()` (repository from the host rule `repo_of()`, nearest LICENSE/NOTICE first); every
licence key below was re-read by this officer (section 5). `copied` is the row's own field.

| # | id | key | source key | licence · key | copied | note |
|---|---|---|---|---|---|---|
| 1 | `block:Ra` | `block:Ra` | `elements@f7a92fb APPS.md:7`; link + wafer file: elements@f7a92fb catalogue/apps.json:3 (key line; live[0], files[0]) | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked (key only, Q1) | wafer file code-generator@857ea81 apps/substation-finder/Si/index.html |
| 2 | `block:Cg` | `block:Cg` | `elements@f7a92fb APPS.md:8`; link + wafer file: elements@f7a92fb catalogue/apps.json:109 (key line; live[0], files[0]) | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked (key only, Q1) | wafer file cable-trench-or-drill@9584492 releases/202609052001/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js |
| 3 | `block:Sb` | `block:Sb` | `elements@f7a92fb APPS.md:9`; link + wafer file: elements@f7a92fb catalogue/apps.json:226 (key line; live[0], files[0]) | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked (key only, Q1) | wafer file globalgrid2050@d3898fa scripts/upgrade_v5_skid_mva_controls.py |
| 4 | `block:St` | `block:St` | `elements@f7a92fb APPS.md:10`; link + wafer file: elements@f7a92fb catalogue/apps.json:340 (key line; live[0], files[0]) | NOT EVALUATED: no clone of solar-electrical-topology-analysis-engine-text-based on this machine | linked (key only, Q1) | wafer file solar-electrical-topology-analysis-engine-text-based@d3b4c49 b9-sandbox/app.js |
| 5 | `block:Pn` | `block:Pn` | `elements@f7a92fb APPS.md:11`; link + wafer file: elements@f7a92fb catalogue/apps.json:567 (key line; live[0], files[0]) | Apache-2.0 · `data-grid-gb@75ab8ae LICENSE:2` | linked (key only, Q1) | same_as pipeline-news; wafer file data-grid-gb@5181de3 chatgpt/ingest_etys.py |
| 6 | `block:Gp` | `block:Gp` | `elements@f7a92fb APPS.md:12`; link + wafer file: elements@f7a92fb catalogue/apps.json:715 (key line; live[0], files[0]) | Apache-2.0 · `pipelinenews@2c0c856 LICENSE:2` | linked (key only, Q1) | wafer file pipelinenews@4980096 tools/intelligence/cartridges/capacity-range-filter/proof.mjs |
| 7 | `block:Wf` | `block:Wf` | `elements@f7a92fb APPS.md:13`; link + wafer file: elements@f7a92fb catalogue/apps.json:813 (key line; live[0], files[0]) | Apache-2.0 · `pipelinenews@2c0c856 LICENSE:2` | linked (key only, Q1) | wafer file pipelinenews@4980096 tools/intelligence/cartridges/wider-fleet/build_payload.py |
| 8 | `kuiper` | `surface:https://globalgrid2050.com/kuiper/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:32` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 9 | `what-is-kuiper` | `surface:https://ventusltd.github.io/kuiper-belt/what-is-kuiper.html` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:33` | Apache-2.0 · `kuiper-belt@2662a4f LICENSE:1` | linked |  |
| 10 | `learn-the-kuiper` | `surface:https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:34` | Apache-2.0 · `kuiper-belt@2662a4f learn-the-kuiper/202610050609/NOTICE.md:7` | linked | link = stable pointer; source line href kept in source_href |
| 11 | `see-through` | `surface:https://ventusltd.github.io/kuiper-belt/see-through/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:35` | CERN-OHL-S-2.0 · `kuiper-belt@2662a4f see-through/202610050609/LICENSE.md:5` | linked | link = stable pointer; source line href kept in source_href |
| 12 | `kuiper-diary` | `surface:https://ventusltd.github.io/kuiper-belt/diary/20261005.html` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:36` | Apache-2.0 · `kuiper-belt@2662a4f LICENSE:1` | linked |  |
| 13 | `gridatlas` | `surface:https://ventusltd.github.io/gridatlas/atlas/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:37` | Apache-2.0 · `gridatlas@5ec7f62 LICENSE:2` | linked |  |
| 14 | `ventus-grid-engine` | `surface:https://ventusltd.github.io/ventus-grid-engine/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:38` | Apache-2.0 · `ventus-grid-engine@96a800e LICENSE:2` | linked |  |
| 15 | `faraday-pulse` | `surface:https://ventusltd.github.io/faraday/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:39` | NOT EVALUATED: no clone of faraday on this machine | linked |  |
| 16 | `dc-string-drawing` | `surface:https://globalgrid2050.com/solar-bess-topology-v7/dc-ac-lv-topology-review/index.html#topo_tab_string` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:40` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 17 | `ac-block-diagram` | `surface:https://globalgrid2050.com/solar-bess-topology-v7/dc-ac-lv-topology-review/index.html#topo_scada` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:41` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 18 | `deep-grid-engine` | `surface:https://ventusltd.github.io/ventus-grid-engine/genome/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:42` | Apache-2.0 · `ventus-grid-engine@96a800e LICENSE:2` | linked |  |
| 19 | `pipeline-news` | `surface:https://globalgrid2050.com/uk_renewables_pipeline/202609082224/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:43` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked | same_as block:Pn |
| 20 | `solar-design-studio` | `surface:https://globalgrid2050.com/energy-transition-simulator/202609282123/overlay.html` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:44` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked | same_as energy-transition-simulator |
| 21 | `electrical-scene-explorer` | `surface:https://globalgrid2050.com/solar-design-studio/202609262041-site-world/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:45` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 22 | `energy-transition-simulator` | `surface:https://globalgrid2050.com/energy-transition-simulator/202609282123/overlay.html` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:46` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked | same_as solar-design-studio |
| 23 | `identity-registry` | `surface:https://ventusltd.github.io/globalgrid2050-ip-and-mac-addresses/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:47` | NOT EVALUATED: no clone of globalgrid2050-ip-and-mac-addresses on this machine | linked |  |
| 24 | `electricity-market-intelligence` | `surface:https://globalgrid2050.com/uk_energy_tracking_v6/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:48` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 25 | `generation-history` | `surface:https://globalgrid2050.com/uk_energy_tracking_v6/generation_history/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:49` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 26 | `metals-cable-prices` | `surface:https://globalgrid2050.com/copper_and_aluminium_prices_historic_trends/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:50` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 27 | `lv-ac-dc-prices` | `surface:https://globalgrid2050.com/lv_ac_dc_price_estimator/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:51` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 28 | `33kv-cable-prices` | `surface:https://globalgrid2050.com/33kv_uk_dap_price_estimator/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:52` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 29 | `cable-engineering` | `surface:https://globalgrid2050.com/ac_cables_knowledge/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:53` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 30 | `dc-cable-guide` | `surface:https://globalgrid2050.com/dc_cables_knowledge/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:54` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 31 | `conductor-resistance` | `surface:https://globalgrid2050.com/conductor_resistances/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:55` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked |  |
| 32 | `cable-selection` | `surface:https://globalgrid2050.com/not-public/` | `globalgrid2050@c66759f homepage_versions/homepage_v134.html:56` | CERN-OHL-S-2.0 · `globalgrid2050@c66759f LICENSE.txt:1` | linked | link withheld (K1) |
| 33 | `spider-sandbox` | `surface:https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/` | `testcode@d09c185 spider/INDEX.md:13` | Apache-2.0 · `testcode@d09c185 LICENSE:2` | linked; 2 graphs copied (DISCLOSED, Q5) |  |
| 34 | `periodic-table` | `surface:https://ventusltd.github.io/stars/blocks/` | `elements@f7a92fb CATALOGUE.md:1` | not stated · `stars@cbca125 (no LICENSE, NOTICE or licence sentence tracked)` | linked; keys only copied (data/elements.json, Q1) |  |

Row 34's `source` (CATALOGUE.md:1) keys the catalogue's title; its link and licence are the live register's host
(stars, section 5). Row 33's `name` is INDEX.md:1 and its `purpose` is INDEX.md:13 (testcode, Apache-2.0, so the copy is
licensed); its `source` names :13 only (defect h, section 9). Its link is the GitHub tree at the recorded commit: no
served address of the v5 dashboard is keyed anywhere (elements@f7a92fb SURFACES.md lists 2 spider surfaces, :95
`spiders/codex/build-plan/` = block:Gn and :96 `spiders/species/seer-spider/estate-menu/` = block:Em, neither the v5
dashboard; globalgrid2050@c66759f `git ls-files | grep -i spider` lists only `testcode/202609141350|202609141522/
v01-spider-drill/`), so A5 "the spider row opens the dashboard" opens the dashboard's source folder, not a running page.

## 3. The `block:<Sym>` rule (where the 7 register keys and the 244 element keys come from)

- elements@f7a92fb README.md:9 "Every element, app and function with more than 10 lines of code has a unique key. Each
  key is one the estate already uses and never reuses. None is invented here."
- README.md:13 `| element | block:<Sym> | the live block register, one per block |`; README.md:14 `| app | block:<Sym> |
  register blocks whose kind is app |`; README.md:15 `surface:<url>` "the folders of the live addresses the register
  records" (the rule the 27 `surface:` rows follow; rows 33-34 are `issued-here` by data/apps.json, `key_source` says so).
- elements@f7a92fb catalogue/provenance.json:5 `"apps": "register blocks whose kind is app"`; :10-14 the register read:
  `https://ventusltd.github.io/stars/blocks/blocks.json`, generated 2026-09-15T18:28:26.149Z, sha256 d356562b2e8f0312…,
  403,894 bytes, copy `inputs/blocks-2026-09-15T182826149Z.json`.
- CATALOGUE.md:7-8: 244 elements, 7 apps, both `block:<Sym>`. The live register has moved on: stars@cbca125
  blocks/blocks.json is ONE line (0 newlines; `generated_utc` 2026-10-31T18:45:22.798Z) holding `blocks` of length 606
  (measured by `json.load`). The key for "606" is therefore `stars@cbca125 blocks/blocks.json:1`, not `:2` as
  data/elements.json `register_note` and ROADMAP 7.3 write (defect b).
- data/elements.json: `source` elements@f7a92fb catalogue/elements.json sha256
  c8a3452c703f6f77524fee4ae5a92dda4409aafda75d04f5df150b8c5a147734 (re-measured =); counts total 244, placed 221,
  named 23 (constant 12, engine 4, layer 6, cartridge 1); readout "221 elements placed, 23 counted, not placed"; every
  record carries only `sym`, `number`, the register file address and computed fields; no `title`, `description` or
  `category` key exists in any of the 244 records (measured: the field sets of all 244 records). The key law is
  `tools/edition_keys.py` `walk_commit()` imported, not copied (elements.json `law`); the builder's reverse checks
  (block:Gc, block:x174, block:x466) and three unmodified `tools/key.py` runs (block:x776, block:x126, block:Gc) are
  recorded in the file's `checks` / `checks_keypy`; this officer did not re-run `key.py` (machine load), and the
  tester's script gate re-ran it (PLAN.md 23:40: ALL PASS).

## 4. The spider: its live URLs, and the two DISCLOSED graphs

The v5 folder is `testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/` (4 tracked files:
index.html, spider/identity.json, spider/manifest.json, spider/overview-graph.json; `git ls-files`). INDEX.md:3-4 "reads
the live GlobalGrid2050 data over https". The 15 live graph URLs, each the `path` of its entry in
`spider/manifest.json` (line of `path`; re-read this session):

| manifest line | id | live URL | repository · licence (at its clone's HEAD or the commit named) |
|---|---|---|---|
| :8 | federation | https://ventusltd.github.io/ventus-grid-engine/spider/data/nodes.json | ventus-grid-engine · Apache-2.0 (@96a800e LICENSE:2) |
| :16 | globalgrid2050-contents | https://ventusltd.github.io/ventus-grid-engine/spider/data/contents/nodes.json | ventus-grid-engine · Apache-2.0 |
| :24 | engine-graph | https://ventusltd.github.io/ventus-grid-engine/genome/engine-graph.json | ventus-grid-engine · Apache-2.0 |
| :32 | genome-spider | https://ventusltd.github.io/ventus-grid-engine/spider/data/genome-spider.json | ventus-grid-engine · Apache-2.0 |
| :40 | gridatlas-lineage | https://ventusltd.github.io/spiders/species/genome-spider/data/gridatlas-lineage.json | spiders · Apache-2.0 (@b47609b LICENSE:2, builder clone; HEAD not evaluated) |
| :49 | modular | https://ventusltd.github.io/stars/modular/graph.json | stars · DISCLOSED (no licence file) |
| :59 | periodic-table | https://ventusltd.github.io/stars/blocks/graph.json | stars · DISCLOSED |
| :69 | proof-of-work | https://ventusltd.github.io/stars/proof/graph.json | stars · DISCLOSED |
| :79 | structure | https://ventusltd.github.io/stars/structure/graph.json | stars · DISCLOSED |
| :89 | chemistry | https://ventusltd.github.io/stars/spider/graphs/chemistry.json | stars · DISCLOSED |
| :99 | vedic | https://ventusltd.github.io/stars/spider/graphs/vedic.json | stars · DISCLOSED |
| :109 | random | https://ventusltd.github.io/stars/spider/graphs/random.json | stars · DISCLOSED |
| :119 | generated-apps | https://ventusltd.github.io/code-generator/spider/graphs/apps.json | code-generator · DISCLOSED (@857ea81: no LICENSE/NOTICE/COPYING tracked) |
| :129 | sense | https://ventusltd.github.io/stars/sense/graph.json | stars · DISCLOSED |
| :139 | decisions | https://ventusltd.github.io/stars/decisions/graph.json | stars · DISCLOSED |
| :149 | overview | `./spider/overview-graph.json` (local to the v5 folder) | testcode · Apache-2.0 |

None of the 15 live URLs is fetched by the module: its only `fetch` calls are `data/apps.json`, `data/elements.json`,
the two graph files (apps.js:49, :462) and the launcher's `fetch(HEAD)` (apps.js:215), which runs on same-origin links
when the launcher opens and on other hosts only when the viewer taps `button.ky-check` (PLAN.md 23:25). The v5 page's
own third-party script (index.html:108, team-4/EVIDENCE.md E3) is not loaded: the spider is LINKED.

The two graphs copied into the edition (owner question Q5 open, so both DISCLOSED):

| copy | source | source sha256 · bytes | copy sha256 · bytes | measured |
|---|---|---|---|---|
| data/graphs/overview.json | testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/overview-graph.json (manifest :149) | 124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09 · 6,125 | identical | byte for byte; 16 nodes, 15 edges |
| data/graphs/periodic-table.json | stars@cbca125 blocks/graph.json (git blob 6d361d336897bcd64e3bb3c7f6b747b231b5e549; manifest :59) | 72349730a0207a689061f88b7e83d25a843b37512b708fe1e949123ff709749e · 509,649 | b84820447a0f8d18687f48f409e2a5442bc66c7f8b71d7ff1a171ecc7dc53a0e · 509,639 | equals the source with ONE token (2 occurrences) replaced by `not-public` (K1, section 8), every other byte the source's; 663 nodes, 2,481 edges |

The module hard-codes both digests and byte counts and refuses a mismatch before parsing (apps.js:380-389 `GRAPHS`,
:462-468 check). apps.json row 33 `graphs[1].copy_matches_source` reads `true` beside `k1_redacted_tokens: 2`; it
should read false or "after K1 redaction" (defect e).

## 5. Licence state of elements, stars and testcode (and of every repository whose text is copied)

| repository | licence | key (the command is the key for an absence) |
|---|---|---|
| elements@f7a92fb | NOT STATED → DISCLOSED (owner Q1) | `git -C elements ls-files \| grep -iE 'licen\|notice\|copying'` → 0 of 25 tracked files; `git grep -niE 'licen[cs]e\|copyright\|apache\|CC BY' HEAD -- '*.md' '*.py' catalogue/provenance.json` → 0 lines |
| stars@cbca125 | NOT STATED → DISCLOSED (owner Q5) | `git -C stars ls-files \| grep -iE 'licen\|notice'` → 0 of 358 tracked files; the 529 lines matching `licen[cs]e` are all inside LINES.md (quoted code of other repositories), e.g. LINES.md:11311 "A published derived graph needs its licence position settled before it ships." |
| testcode@d09c185 | Apache-2.0 | LICENSE:2 "Apache License", :3 "Version 2.0, January 2004"; NOTICE:1-2 "testcode / Copyright 2026 Ventus Ltd", NOTICE:10-12 "Licensed under the Apache License, Version 2.0 …"; NOTICE:27-32 third-party data keeps its own terms. The spider folder has no licence file of its own (its 4 tracked files above), so the root licence governs |
| globalgrid2050@c66759f | CERN-OHL-S v2 | LICENSE.txt:1 "This project is licensed under the CERN Open Hardware Licence Version 2 - Strongly Reciprocal (CERN OHL-S v2)" |
| gridatlas@5ec7f62, ventus-grid-engine@96a800e, data-grid-gb@75ab8ae, pipelinenews@2c0c856 | Apache-2.0 | LICENSE:2 each (re-read) |
| kuiper-belt@018b46a (= @2662a4f, the key apps.json writes) | Apache-2.0 code, CC BY 4.0 docs and generated data | LICENSE:1-2; README.md:156-157; see-through/202610050609/LICENSE.md:5-6 CERN-OHL-S v2; learn-the-kuiper/202610050609/NOTICE.md:7-8 |
| faraday, globalgrid2050-ip-and-mac-addresses | NOT EVALUATED: no clone on this machine | as the rows say |
| solar-electrical-topology-analysis-engine-text-based (row `block:St`) | GNU GPL v3 at the register file's commit | @d3b4c497144c2c9b3e8f0e82117e7e9abe4672b9 LICENSE:1 "GNU GENERAL PUBLIC LICENSE", :2 "Version 3, 29 June 2007" (builder's depth-1 clone). apps.json still reads `NOT EVALUATED: no clone` (defect g); the served HEAD was not evaluated |

`line_text` in data/elements.json (line 1 of each placed element's register file, 221 lines) is quoted from 26
repositories. Licence file at the ROOT of the tree at the element's commit (`git ls-tree --name-only <commit>`),
measured this session; a quote keeps its repository's licence (precedent editions/202611012027/NOTICE.md:7-10):

| repository @ commit | lines quoted | licence at that commit |
|---|---|---|
| globalgrid2050@d3898fa | 90 | CERN-OHL-S v2 (LICENSE.txt:1) |
| gridatlas@ece8481 | 23 | Apache-2.0 (LICENSE:2) |
| pipelinenews@4980096 | 20 | Apache-2.0 |
| ventus-grid-engine@d9cd18b | 16 | Apache-2.0 |
| claude@df9da02 | 15 | GNU GPL v2 (COPYING:1-2) |
| testcode@faf1006, grid-distance-maths@30aa4e0, spiders@b47609b, globalgrid2050-homepage@13055b1 | 3, 2, 1, 1 | Apache-2.0 |
| solar-electrical-topology-analysis-engine-text-based@d3b4c49, v11@debb30e | 1, 1 | GNU GPL v3 (LICENSE:1-2) |
| galaxies-wafers@abda58b (10), chatgpt-audits@2ffb435 (8), youengineer-code-review@f86dcb2 (6), data-federation-map-for-globalgrid2050-all-repos@b759a7d (5), star-solar-star@2290e8f (5), code-generator@857ea81 (2), star-maker@c5bf5f6 (2), star-quantum-twin@71726cf (2), star-sector-star@54d5b07 (2), cable-trench-or-drill@9584492, data-grid-gb@5181de3, companies@ac70a37, cvaa@48393ff, registry_of_all_content_in_repos_and_dependencies@4088117, gpu-drivers-for-global-grid@31e1bcf (1 each) | 48 | NOT STATED at that commit → DISCLOSED (no LICENSE, NOTICE or COPYING at the root) |

So 156 quoted lines are Apache-2.0 or CERN-OHL-S v2, 17 come from GPL repositories and 48 from repositories that state no licence at the quoted commit.
Each is one line, cited with its key (the card law), as keys.json already does; the register (LICENCES.md) should list
them, and the owner may prefer `line_text: null` for the DISCLOSED ones until stated.

## 6. Copied versus linked (the register's column)

COPIED into the edition:
1. `data/graphs/overview.json` — whole file, byte for byte, testcode (Apache-2.0), DISCLOSED under Q5.
2. `data/graphs/periodic-table.json` — whole file less one K1 token, stars (licence NOT STATED), DISCLOSED under Q5.
3. `data/apps.json`, 25 homepage rows — per row the title, the type word, the "Intended purpose" sentence and the href
   of homepage_v134.html:32-56: globalgrid2050, CERN-OHL-S v2 (LICENSE.txt:1). The file's top-level `licence` field
   says "CC BY 4.0 (kuiper-belt data)"; that is not true of these 25 copied lines, which keep CERN-OHL-S v2 (defect f;
   the row-level `licence` names the TARGET app's licence, not the copied text's).
4. `data/apps.json` row 33 — INDEX.md:1 title and INDEX.md:13 sentence, testcode Apache-2.0.
5. `data/elements.json` — per element `block:<Sym>`, catalogue number, register file address (keys and addresses from
   elements, licence NOT STATED: the minimum Q1 allows, ROADMAP Q1 "copies only keys") and `line_text` (section 5).
6. `data/apps.json` 7 register rows — the key `block:<Sym>`, `live[0]` and `files[0]` address only (elements, Q1).

LINKED, nothing copied: every app itself (34 rows; same-tab navigation for the rows, apps.js launcher); the element
titles, descriptions and categories (the card links `elements@f7a92fb ELEMENTS.md`); APPS.md descriptions (each
register row links `APPS.md#L<n>`); the 15 live spider graphs (section 4); See Through (CERN-OHL-S v2: no See Through
code in the module; it is a row navigating to `../../see-through/`); the GridAtlas lessons (method only).

## 7. The Kuiper hooks the module uses (hook table `kuiper.hooks.v1`)

The table: editions/202611012135/index.html:845-847 `KY_NAMES` (35 names), :862-866 `KY.hooks`, :867 `cam`, :871
`sel`, :872 `redraw`, :873-874 `draw.add`, :877 `panels`, :885 `names`, :886 `register`, :888 `modules`; :214 `kyWafer`
(the wafer promise, exposed as `hooks.wafer`); list published by Opus 4 in handoff/04-loader/HOOKS.md:9 and :49-51.

| hook | used at apps.js line(s) | for |
|---|---|---|
| `KY.register` | 576-578 | the one registration: id `apps`, generation 202611012309, requires, provides `apps` |
| `hooks.wafer` (promise) | 562 | load the registry and the two layers only after the wafer admitted its data |
| `KY.draw.add` | 525, 558 (readout painter at order 50) | the readout lines and the layer painters run in the loader's draw wrap |
| `hooks.keyPlace` | 251, 404, 475, 492-493 | element spark and graph-node positions from keys (no stored x,y) |
| `hooks.flyTo` + `KY.cam.atHome` | 251 | fly to an element's key from the keys panel |
| `hooks.card` | 253, 272 | the element card (header = `line_text`, second line `block:<Sym>`) |
| `KY.sel.target`, `KY.redraw` | 266, 272, 396 | selection crosshair, request a frame |
| `KY.cam`, `hooks.o2` | 392 | world→screen for the overlay |
| `hooks.SPACE` | 71, 238, 391 | refuse a key outside the address space |
| `hooks.repos`, `hooks.commits` | 444 | first-commit `k0` of a repository (spider nodes keyed by repository) |
| `hooks.cv` | 431, 436 | a tap must start on the wafer canvas |
| `hooks.fmt`, `hooks.esc`, `hooks.hud` | 43, 44, 548 | number format, HTML escape, the readout |
| `KY.modules` | 41, 361 | optional neighbours: `layers` (register/get, apps.js:532), `kuiper-shell`, `line-card` (close), `file` |

Neighbour keys: layers.js (`modules/202611012141-layers.js`) :598-599 `admitRecord` returns `REFUSED · licence
unsettled` when the record's licence begins `UNSETTLED`, and :128 "a refusal … is never lifted by registering";
data/layers.json record `elements` carries `licence: "UNSETTLED: elements@f7a92fb has no LICENSE, owner question Q1"`
and `source.sha256` 781dc0d9…a620 (the pre-23:59 data/elements.json: stale, defect c); record `spider` still has `source.file: null` and
format `code-feature-collection.v1` (REQUESTS.md item 1 to Opus 3). file.js (`modules/202611012231-file.js`) :215
reads `KY.modules.apps.api.list()`, :662-666 the FILE row "Open an app" (`#ky-file-open-app`) calls `api.open()`
(PLAN.md quotes :652-654 and :213-221: file.js has grown since; these are the lines at 23:47).

GridAtlas lessons cited in the module header (apps.js:14-16), re-read: gridatlas@5ec7f62 atlas/current.json:5
`"architecture": "IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES"`, :14-21 `cartridge_order`; atlas/modules/
202609031958-menu-bar.js:8-17 "it installs nothing until the engine's 60 layer controls and the three Pipeline News
controls are all present …", :34 `var EXPECTED_LAYER_CONTROLS = 63;`; globalgrid2050@c66759f homepage_v134.html:31
(the table head) to :56. Palette: kuiper-belt PALETTE.md:9-13 (`#c9d3e6`, `#2ee6e6`, `#22ee77`, `#ffb000`, `#ff2bd6`),
the only colours at apps.js:30.

## 8. K1 (tools/ci_check.py:8, `check_proof.leaks()`)

- Measured 23:44 and again at writing: `leaks()` over the 11 team files (module, 4 data files, 2 tools, LICENCE.txt,
  PLAN.md, REQUESTS.md, test.cjs) and over EVERY file under `editions/202611012135/` (PNG excluded) = 0 matches.
  `grep -ril` for the token "kuiper" + underscore + "belt" over the same files = 0 files. This EVIDENCE.md is checked
  the same way before it is left (section 10).
- Withheld under K1, by design: row `cable-selection` link (written `https://globalgrid2050.com/not-public/`, field
  `link_withheld`); 2 occurrences of one token in the stars graph copy; 1 record of data/elements.json
  (`redacted`, block:x618 path and github; key untouched).
- HISTORY (finding for the harness and the owner): K1-matching versions of team-7 files are PUSHED on
  `origin/edition/202611012135` (github.com/Ventusltd/kuiper-belt): data/apps.json @b8e7c74 and @b4a5dba,
  data/elements.json @38ed53c, data/graphs/periodic-table.json @b8e7c74 (`git show <c>:<f> | leaks()` = 1 each).
  `ci_check.py` K1 scans the working tree only (`git ls-files`, ci_check.py:30-45), so it PASSES; the branch history
  still carries the token. Squash-merging PR A keeps it off main; removing it from the branch is the owner's decision.

## 9. Module header check, and the defects found

Header (apps.js:1-20): line 1 `/* kuiper module apps, generation 202611012309 (UTC), Apache-2.0 (kuiper-belt code)`:
name, stamp (= file name, = `GEN` at :23), licence line correct (no See Through or other CERN-OHL-S code is copied
into the module; nothing vendored); purpose; Q1 and Q5 honoured with keys; GridAtlas lessons keyed; `requires` (apps.js:17, = `REQUIRES` :24-25) and
`provides: apps` present; the 16 names are all in `KY_NAMES` (index.html:845-847) and each is used (section 7).

Defects (handed to the lead in PLAN.md at 23:47; status at the verdict in section 10):
- (a) apps.json row 34 `purpose` cites neural-link FIXES/NL-010/BRIEF.md:9; "bring in periodic table" is BRIEF.md:8
  (tools/apps_registry.py:213).
- (b) data/elements.json `register_note` keys 606 at `stars@cbca125 blocks/blocks.json:2`; the file is one line: `:1`.
- (c) FIXED by the builder (23:59): data/elements.json now carries `counts.live_register` 606 and
  `live_register_source` stars@cbca125 blocks/blocks.json sha256 07675d74…a573 (re-measured =). Consequence: data/layers.json
  record `elements` still holds `source.sha256` 781dc0d9…a620 (the old file); Opus 3 must re-record it or step 3's test 9
  refuses the layer (REQUEST, REQUESTS.md item 1).
- (d) FIXED by the lead (commit 57195d2, 23:49): `requires` named `safeBox`, `panels`, `address` (never called) and
  omitted `cv` (read); it now lists exactly the 16 names used.
- (e) apps.json row 33 `graphs[1].copy_matches_source: true` beside 2 redacted tokens.
- (f) apps.json top-level `licence` "CC BY 4.0" is not true of the 25 copied CERN-OHL-S v2 homepage lines.
- (g) row `block:St` licence `NOT EVALUATED: no clone`: the register file's commit states GPL v3 (section 5).
- (h) row 33 `source` cites INDEX.md:13; its `name` is INDEX.md:1.
- Noted, not a defect: the element card's two GitHub/catalogue links open with `target="_blank"` (apps.js:261-262);
  the launcher's app rows navigate in the same tab as 7.2 requires.

## 10. Review of the lead's HANDOFF, and the evidence officer's verdict

(Written when HANDOFF.md is reviewed; see below.)
