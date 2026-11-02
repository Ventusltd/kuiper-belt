# handoff/07-apps/TEST.md: step 7 "the OS of the estate, baby step one", acceptance A1-A6

Tester OPUS-7 (Opus team 7). Written by `test.cjs` at 2026-11-02T01:27:04.977Z; every cell is a measurement of that run, never an estimate.

**Verdict: PASS for every team-7 gate; NOT EVALUATED: E' (the EVIDENCE files of file.js that the integrator writes at assembly). Not a full pass until the integrator's run shows them present.**

| run | value |
|---|---|
| edition | http://127.0.0.1:8470/editions/202611012135/ |
| served index.html | sha256 `418ae14ca39bc92be028f852825da196fd634ec12bb48f8f538d0cf739564d05` (84309 bytes) |
| served modules.json | sha256 `3d98406946f0b563a96d38c66099bff4060b04f2fa250b7d2b7f801bc7f8a633` (4973 bytes) |
| module | `modules/202611012309-apps.js` sha256 `fa01e012d81b32edf0287536e27a11075313dcd96d18c2409e21fb997bd0d481` (42561 bytes) |
| data/apps.json | sha256 `027f6614745dae924a642d2c2f463b2dc5fc9f4eb11e2b08f4ab78e2ae9a80a5` (32936 bytes) |
| data/elements.json | sha256 `e204cb414d38d4c174083f55a46a57179fd48b4c8ed8248a7ba0f995601964d5` (165622 bytes) |
| data/graphs/overview.json | sha256 `124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09` (6125 bytes) |
| data/graphs/periodic-table.json | sha256 `b84820447a0f8d18687f48f409e2a5442bc66c7f8b71d7ff1a171ecc7dc53a0e` (509639 bytes) |
| test.cjs | sha256 `16d9d8274fa480ab4b22c13baf8a4137a25dba342afcdba5c0ffdad031942999` |
| browser | Playwright Chromium 153.0.8010.12, `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, real touch (`touchscreen.tap`), 7 s settle, one device at a time |
| network | every off-origin request aborted for the whole device run (A6); the spider dashboard link answered by a stub page (the URL is asserted) |

## By script, against the sources (once)

| gate | result | measured |
|---|---|---|
| A1 34 records, every key matches ^(block:[A-Za-z0-9]+\|surface:https://), ids unique | PASS | {"records":34,"counts":{"register":7,"homepage":25,"issued":2,"total":34},"bad_keys":[],"duplicate_ids":[]} |
| A1 the 7 block: keys equal elements@f7a92fb APPS.md:7-13 (order, source line) | PASS | {"apps_md":["block:Ra","block:Cg","block:Sb","block:St","block:Pn","block:Gp","block:Wf"],"rows":[["block:Ra","elements@f7a92fb APPS.md:7"],["block:Cg","elements@f7a92fb APPS.md:8"],["block:Sb","elements@f7a92fb APPS.md:9"],["block:St","elements@f7a92fb APPS.md:10"],["block:Pn","elements@f7a92fb APPS.md:11"],["block:Gp","elements@f7a92fb APPS.md:12"],["block… |
| A1 Q1: no APPS.md title or description copied into apps.json | PASS | {"leaked":[]} |
| A1 the 25 homepage ids equal the data-entity-id set of homepage_v134.html:32-56 | PASS | {"homepage_ids":25,"rows":25,"missing":[],"extra":[]} |
| A1 each homepage row = its source line (key surface:<link>, link = href or its stable folder or K1-withheld, name, kind, purpose, source line) | PASS | {"differences":[],"count":0,"link_notes":[{"id":"learn-the-kuiper","how":"stable folder of source_href"},{"id":"see-through","how":"stable folder of source_href"},{"id":"cable-selection","how":"withheld (K1): K1 (tools/ci_check.py): the folder name equals a repository that is not public; …"}]} |
| A1 rows that share a key cross-reference each other in same_as (7.1), never merged | PASS | {"shared":[{"key":"surface:https://globalgrid2050.com/energy-transition-simulator/202609282123/overlay.html","ids":["solar-design-studio","energy-transition-simulator"],"same_as":[["energy-transition-simulator"],["solar-design-studio"]]}]} |
| A1 spider-sandbox row = testcode@d09c185 spider/INDEX.md:13 (v5), periodic-table row key surface:https://ventusltd.github.io/stars/blocks/ | PASS | {"spider":{"key":"surface:https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","link":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","source":"testcode@d09c185 spider/IN… |
| A1 Q5: data/graphs holds exactly the two DISCLOSED graphs, each hashing as the spider row records; overview 16 nodes 15 edges | PASS | {"files":["overview.json","periodic-table.json"],"recorded":[{"file":"data/graphs/overview.json","sha256":"124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09","bytes":6125,"status":"DISCLOSED (owner question Q5): copied with its sha256 and source address, byte for byte"},{"file":"data/graphs/periodic-table.json","sha256":"b84820447a0f8d18687f48… |
| A4 elements.json: the catalogue's 244 symbols in order; 221 placed; 23 named with a reason, none with files in the catalogue | PASS | {"total":244,"catalogue":244,"placed":221,"named":23,"by_kind_unplaced":{"constant":12,"engine":4,"layer":6,"cartridge":1},"counts":{"total":244,"with_files":221,"placeable":221,"placed":221,"named":23,"no_files":23,"by_kind_unplaced":{"constant":12,"engine":4,"layer":6,"cartridge":1},"distinct_commits_walked":26,"redacted_records":1,"live_register":606,"liv… |
| A4 every placed key lies inside the cosmos/wafer.tsv row of its recorded repository and commit | PASS | {"placed":221,"outside":[],"address_space":63340120796} |
| A4 Q1: no catalogue title or description copied into elements.json | PASS | {"leaked":[]} |
| A4 python tools/key.py on three sampled elements returns the recorded repository, commit and path (line 1) | PASS | {"samples":[{"sym":"block:Gc","key":47018556351,"exit":0,"repo":"ventus-grid-engine","sha12":"d9cd18b0e203","path":"engine/geo-core.js","line":1,"ok":true,"out":"key 47,018,556,351 -> ventus-grid-engine / d9cd18b0e203 / line 4,315 of 17,512 \|   engine/geo-core.js : 1   (blob 9d47bb03d356) \|   \| /* geo-core — the one distance primitive, and the earth model it… |

## On the devices

| gate | Pixel 7 | Galaxy S24 |
|---|---|---|
| M the loader admitted apps, nothing refused | PASS | PASS |
| A2 the bar keeps step 1's six titles; no bar title names apps | PASS | PASS |
| A2 FILE > Open an app (real tap) opens #ky-apps under the bar | PASS | PASS |
| A2 34 rows, one per apps.json record (FAIL rows never hidden), every row >= 44 px | PASS | PASS |
| A2 each row's first visible line is its key; the first row's header is a key | PASS | PASS |
| A2 one panel at a time: a real tap on WAFER while the launcher is open closes the launcher | PASS | PASS |
| A4 the readout says "221 elements placed, 23 counted, not placed" and "606 in the live register, 244 catalogued"; inspect() 221 / 23 / 244 | PASS | PASS |
| A4 Q1 open: the elements row reads REFUSED · licence unsettled, its control disabled | PASS | PASS |
| A5 the spider layer (real tap) is OK and draws the overview's 15 edges (inspect: 16 nodes, 15 edges, 15 drawn) | PASS | PASS |
| A5 the readout names how many periodic-table nodes had no key (663 nodes, 2,481 edges) | PASS | PASS |
| A4 card from the periodic-table panel: first line = line_text, second = block:<Sym> (3 elements) | PASS | PASS |
| A5 the spider row opens the dashboard (same tab, its link) | PASS | PASS |
| A3 the See Through row navigates in the same tab to ../../see-through/ (200, title "See Through") | PASS | PASS |
| A3 goBack() returns to the edition with no panel open | PASS | PASS |
| A5 with data/graphs/* answered 404 the spider row is FAIL naming the file; lines OK; the wafer still draws | PASS | PASS |
| A6 every step above ran with every off-origin request blocked (listed) | PASS | PASS |
| E zero pageerrors, zero console errors, zero failed same-origin requests on the edition | PASS | PASS |
| E' the EVIDENCE files file.js rows HEAD are present (written by the integrator at assembly) | NOT EVALUATED | NOT EVALUATED |

## Measurements per device

### Pixel 7

- PASS M the loader admitted apps, nothing refused: `{"ready_s":29,"admitted":["kuiper-shell","line-card","layers","file","see-through","apps"],"refused":[]}`
- PASS A2 the bar keeps step 1's six titles; no bar title names apps: `{"buttons":["File","Edit","View","Scope","Wafer","About"],"all":["File","Edit","View","Scope","Wafer","About"]}`
- PASS A2 FILE > Open an app (real tap) opens #ky-apps under the bar: `{"bar":{"top":0,"bottom":34,"left":0,"right":412,"height":34},"launcher":{"top":35,"bottom":826,"left":4,"right":408,"height":791}}`
- PASS A2 34 rows, one per apps.json record (FAIL rows never hidden), every row >= 44 px: `{"rows":34,"min_h":71.4,"under44":[],"hidden":[],"states":{"":34}}`
- PASS A2 each row's first visible line is its key; the first row's header is a key: `{"first_row":{"key":"surface:https://ventusltd.github.io/kuiper-belt/see-through/","id":"see-through","header":"surface:https://ventusltd.github.io/kuiper-belt/see-through/","h":103.8,"st":"· OK · HTTP 200","hidden":false},"mismatches":[]}`
- PASS A2 one panel at a time: a real tap on WAFER while the launcher is open closes the launcher: `{"launcherOpen":false,"menuOpen":"wafer"}`
- PASS A4 the readout says "221 elements placed, 23 counted, not placed" and "606 in the live register, 244 catalogued"; inspect() 221 / 23 / 244: `{"has221":true,"has606":true,"inspect_elements":{"status":"OK","why":"221 placed","placed":221,"named":23,"total":244,"not_computed":0}}`
- PASS A4 Q1 open: the elements row reads REFUSED · licence unsettled, its control disabled: `{"status":"REFUSED","why":"licence unsettled (elements@f7a92fb has no LICENSE, owner question Q1)","row":"REFUSED · licence unsettled (elements@f7a92fb has no LICENSE, owner question Q1)","disabled":true,"checked":false}`
- PASS A5 the spider layer (real tap) is OK and draws the overview's 15 edges (inspect: 16 nodes, 15 edges, 15 drawn): `{"layer":{"status":"OK","why":"567 of 2,496","row":"OK · 567 of 2,496","disabled":false,"checked":true},"overview":{"nodes":16,"keyed":16,"no_key":0,"keyed_by":{"served folder ventus-grid-engine":16},"edges":15,"drawn":15,"rings":15,"sha256":"124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09","source":"testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/overview-graph.json"},"overlay_px_off":10160,"overlay_px_on":56378}`
- PASS A5 the readout names how many periodic-table nodes had no key (663 nodes, 2,481 edges): `{"line":"spider graphs: overview 15 of 15 edges drawn (15 as rings: both ends at one key), 0 of 16 nodes had no key · periodic-table 552 of 2,481 edges drawn, 412 of 663 nodes had no key","periodic":{"nodes":663,"keyed":251,"no_key":412,"keyed_by":{"element":206,"repository":45},"edges":2481,"drawn":552,"rings":0,"sha256":"b84820447a0f8d18687f48f409e2a5442bc66c7f8b71d7ff1a171ecc7dc53a0e","source":"stars@cbca125 blocks/graph.json (K1-redacted copy: 2 tokens)"}}`
- PASS A4 card from the periodic-table panel: first line = line_text, second = block:<Sym> (3 elements): `{"rows":244,"cards":[{"sym":"block:Gc","open":true,"first":true,"second":true,"header_equal":true,"sym_span":"block:Gc","w1":"/* geo-core — the one distance primitive, and the earth model it stands on.","w2":"block:Gc","i1":"/* geo-core — the one distance primitive, and the earth model it stands on.","i2":"block:Gc","h":173.78125,"ok":true},{"sym":"block:x309","open":true,"first":true,"second":true,"header_equal":true,"sym_span":"block:x309","w1":"import csv","w2":"block:x309","i1":"import csv","i2":"block:x309","h":174.390625,"ok":true},{"sym":"block:x996","open":true,"first":true,"second":tr…`
- PASS A5 the spider row opens the dashboard (same tab, its link): `{"landed":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","link":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","page":{"href":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","title":"stub","history":6}}`
- PASS A3 the See Through row navigates in the same tab to ../../see-through/ (200, title "See Through"): `{"requested":["http://127.0.0.1:8470/see-through/","http://127.0.0.1:8470/see-through/202611020012/"],"landed":"http://127.0.0.1:8470/see-through/202611020012/","want":"http://127.0.0.1:8470/see-through/","status":200,"title":"See Through","tabs":1}`
- PASS A3 goBack() returns to the edition with no panel open: `{"url":"http://127.0.0.1:8470/editions/202611012135/","launcherOpen":false,"menuOpen":"","card":""}`
- PASS A5 with data/graphs/* answered 404 the spider row is FAIL naming the file; lines OK; the wafer still draws: `{"spider":{"status":"FAIL","why":"data/graphs/overview.json HTTP 404","row":"FAIL · data/graphs/overview.json HTTP 404","disabled":false,"checked":true},"lines":"OK","wafer":{"litFraction":0.2366,"litPx":78285},"routed_404":["http://127.0.0.1:8470/editions/202611012135/data/graphs/overview.json","http://127.0.0.1:8470/editions/202611012135/data/graphs/periodic-table.json"]}`
- PASS A6 every step above ran with every off-origin request blocked (listed): `{"blocked":0,"sample":[]}`
- PASS E zero pageerrors, zero console errors, zero failed same-origin requests on the edition: `{"pageerrors":[],"console":[],"failed_local":[],"see_through_console_listed_not_counted":0,"aborted_listed":22,"evidence_404_listed":["http://127.0.0.1:8470/editions/202611012135/proof/edition-sha256.txt","http://127.0.0.1:8470/editions/202611012135/proof/android-journey.json"]}`
- NOT EVALUATED E' the EVIDENCE files file.js rows HEAD are present (written by the integrator at assembly): `{"missing":["http://127.0.0.1:8470/editions/202611012135/proof/edition-sha256.txt","http://127.0.0.1:8470/editions/202611012135/proof/android-journey.json"],"why":"--allow-missing-evidence: NOT EVALUATED (never a pass); team 6's rows, the integrator's files"}`
- screenshots: launcher.png (154251 B), table-layer.png (101471 B), spider-layer.png (172497 B), element-card.png (37170 B)

### Galaxy S24

- PASS M the loader admitted apps, nothing refused: `{"ready_s":11,"admitted":["kuiper-shell","line-card","layers","file","see-through","apps"],"refused":[]}`
- PASS A2 the bar keeps step 1's six titles; no bar title names apps: `{"buttons":["File","Edit","View","Scope","Wafer","About"],"all":["File","Edit","View","Scope","Wafer","About"]}`
- PASS A2 FILE > Open an app (real tap) opens #ky-apps under the bar: `{"bar":{"top":0,"bottom":34,"left":0,"right":360,"height":34},"launcher":{"top":35,"bottom":767,"left":4,"right":356,"height":732}}`
- PASS A2 34 rows, one per apps.json record (FAIL rows never hidden), every row >= 44 px: `{"rows":34,"min_h":71.4,"under44":[],"hidden":[],"states":{"":34}}`
- PASS A2 each row's first visible line is its key; the first row's header is a key: `{"first_row":{"key":"surface:https://ventusltd.github.io/kuiper-belt/see-through/","id":"see-through","header":"surface:https://ventusltd.github.io/kuiper-belt/see-through/","h":121.3,"st":"· OK · HTTP 200","hidden":false},"mismatches":[]}`
- PASS A2 one panel at a time: a real tap on WAFER while the launcher is open closes the launcher: `{"launcherOpen":false,"menuOpen":"wafer"}`
- PASS A4 the readout says "221 elements placed, 23 counted, not placed" and "606 in the live register, 244 catalogued"; inspect() 221 / 23 / 244: `{"has221":true,"has606":true,"inspect_elements":{"status":"OK","why":"221 placed","placed":221,"named":23,"total":244,"not_computed":0}}`
- PASS A4 Q1 open: the elements row reads REFUSED · licence unsettled, its control disabled: `{"status":"REFUSED","why":"licence unsettled (elements@f7a92fb has no LICENSE, owner question Q1)","row":"REFUSED · licence unsettled (elements@f7a92fb has no LICENSE, owner question Q1)","disabled":true,"checked":false}`
- PASS A5 the spider layer (real tap) is OK and draws the overview's 15 edges (inspect: 16 nodes, 15 edges, 15 drawn): `{"layer":{"status":"OK","why":"567 of 2,496","row":"OK · 567 of 2,496","disabled":false,"checked":true},"overview":{"nodes":16,"keyed":16,"no_key":0,"keyed_by":{"served folder ventus-grid-engine":16},"edges":15,"drawn":15,"rings":15,"sha256":"124aa35e3eabafe15f3c90f82d1a38b7132fb7cdf23aba836a9757a84202df09","source":"testcode@d09c185 spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/spider/overview-graph.json"},"overlay_px_off":9316,"overlay_px_on":45713}`
- PASS A5 the readout names how many periodic-table nodes had no key (663 nodes, 2,481 edges): `{"line":"spider graphs: overview 15 of 15 edges drawn (15 as rings: both ends at one key), 0 of 16 nodes had no key · periodic-table 552 of 2,481 edges drawn, 412 of 663 nodes had no key","periodic":{"nodes":663,"keyed":251,"no_key":412,"keyed_by":{"element":206,"repository":45},"edges":2481,"drawn":552,"rings":0,"sha256":"b84820447a0f8d18687f48f409e2a5442bc66c7f8b71d7ff1a171ecc7dc53a0e","source":"stars@cbca125 blocks/graph.json (K1-redacted copy: 2 tokens)"}}`
- PASS A4 card from the periodic-table panel: first line = line_text, second = block:<Sym> (3 elements): `{"rows":244,"cards":[{"sym":"block:Gc","open":true,"first":true,"second":true,"header_equal":true,"sym_span":"block:Gc","w1":"/* geo-core — the one distance primitive, and the earth model it stands on.","w2":"block:Gc","i1":"/* geo-core — the one distance primitive, and the earth model it stands on.","i2":"block:Gc","h":173.78125,"ok":true},{"sym":"block:x309","open":true,"first":true,"second":true,"header_equal":true,"sym_span":"block:x309","w1":"import csv","w2":"block:x309","i1":"import csv","i2":"block:x309","h":174.390625,"ok":true},{"sym":"block:x996","open":true,"first":true,"second":tr…`
- PASS A5 the spider row opens the dashboard (same tab, its link): `{"landed":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","link":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","page":{"href":"https://github.com/Ventusltd/testcode/tree/d09c185c8dacbc5c73afb2b0d0d8dad40745a544/spider/20260914T143049Z-v5-linkify-frontdoor-brandfaithful/","title":"stub","history":6}}`
- PASS A3 the See Through row navigates in the same tab to ../../see-through/ (200, title "See Through"): `{"requested":["http://127.0.0.1:8470/see-through/","http://127.0.0.1:8470/see-through/202611020012/"],"landed":"http://127.0.0.1:8470/see-through/202611020012/","want":"http://127.0.0.1:8470/see-through/","status":200,"title":"See Through","tabs":1}`
- PASS A3 goBack() returns to the edition with no panel open: `{"url":"http://127.0.0.1:8470/editions/202611012135/","launcherOpen":false,"menuOpen":"","card":""}`
- PASS A5 with data/graphs/* answered 404 the spider row is FAIL naming the file; lines OK; the wafer still draws: `{"spider":{"status":"FAIL","why":"data/graphs/overview.json HTTP 404","row":"FAIL · data/graphs/overview.json HTTP 404","disabled":false,"checked":true},"lines":"OK","wafer":{"litFraction":0.2284,"litPx":61186},"routed_404":["http://127.0.0.1:8470/editions/202611012135/data/graphs/overview.json","http://127.0.0.1:8470/editions/202611012135/data/graphs/periodic-table.json"]}`
- PASS A6 every step above ran with every off-origin request blocked (listed): `{"blocked":0,"sample":[]}`
- PASS E zero pageerrors, zero console errors, zero failed same-origin requests on the edition: `{"pageerrors":[],"console":[],"failed_local":[],"see_through_console_listed_not_counted":0,"aborted_listed":22,"evidence_404_listed":["http://127.0.0.1:8470/editions/202611012135/proof/edition-sha256.txt","http://127.0.0.1:8470/editions/202611012135/proof/android-journey.json"]}`
- NOT EVALUATED E' the EVIDENCE files file.js rows HEAD are present (written by the integrator at assembly): `{"missing":["http://127.0.0.1:8470/editions/202611012135/proof/edition-sha256.txt","http://127.0.0.1:8470/editions/202611012135/proof/android-journey.json"],"why":"--allow-missing-evidence: NOT EVALUATED (never a pass); team 6's rows, the integrator's files"}`
- screenshots: galaxy-s24-launcher.png (130314 B), galaxy-s24-table-layer.png (86091 B), galaxy-s24-spider-layer.png (135054 B), galaxy-s24-element-card.png (35388 B)

