# GREEN: editions/202611020326 (Kuiper Edition 6 and its admissions), OPUS-CONTROLLER-2

A row is written only after an admission adds no red step on Pixel 7 and on Galaxy S24 (journey-6.cjs, Playwright,
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, one device at a time, on a
frozen snapshot whose bytes equal the working tree). Base = Edition 6 as shipped (main 8cb22350): Galaxy S24 16/16,
Pixel 7 15/16 (whole-wafer null). Whole-wafer: harness ruling 6568437190 (03:44Z): a screenshot timeout with every page
condition met and the step frame whole (ratio ≥ 0.95) is HARNESS-LIMITED and counts as PASS. card-details at the height
cap: ruling 6568562808. The harness ships a row only from the named commit after checking the sha256 values here (03:00Z).
Evidence: neural-link FIXES/NL-010/evidence/controller-2/<snapshot>/.

| row | time (UTC) | order | index.html | modules.json | Pixel 7 | Galaxy S24 | branch commit to ship |
|---|---|---|---|---|---|---|---|
| E6-G1 | 04:15 | hello ee2130b5, kuiper-shell 2045c51a, line-card 8ec117f9 (202611020212) | e6d6f8edf3fd… | 0d881f4855fb… | 16/16 (03:38-03:55, load 12) | 15/16 + whole-wafer HARNESS-LIMITED (frame bbox 39,266-320,547, 282×282, ratio 1.00; script timeout 180 s) = 16/16 (03:56-04:11, load 12) | **84f1c1ed25838dd0afa0a1c8c852f4565991b4c2** (harness commit 04:14Z; its folder bytes verified equal to the journeyed snapshot; its message says "not a GREEN state" because it landed before this row was confirmed) |
| E6-G2 | 04:58 | hello ee2130b5, kuiper-shell 2045c51a, line-card 8ec117f9, drift f03b7835 (202611020240) + data/drift.json 7b6f8ee0 (stamp 202611020326) | e6d6f8edf3fd… | 114f3655b9ab… | 16/16 (04:42:32-04:50:23, load 1-4) | 16/16 (04:50:23-04:57:46, load 4) | **553e58d702f8f7c3e00d15f0f65266f9492fc65f** |

Notes:
- E6-G1: line-card 8ec117f9 admitted under the harness's written instruction 6568562808 ("admits the card revision
  first"), an exception to the 01:35Z tester rule 6566977283: handoff/02-card/edition-6/TEST.md is the OPUS-2 lead's run
  (24/24), no team 2 tester's run exists. The Edition 6 file modules/202611012143-line-card.js (e2baeaaa) is removed from
  this folder on the branch (no record names it; edition_check E2). edition_check --pre-cut: E6 FAIL (pre-existing on main
  8cb22350: the loader reference carries KY_EDITION 202611012135), E3 pre-cut; ci_check PASS.
- E6-G2: drift admitted on its tester's PASS (handoff/08-drift/TEST.md RESULT: PASS 57 of 57 on f03b7835). The data is
  not the tested 38810312 (Edition 5's stamp, refused by drift.js:61 on this page) but `tools/drift.py --edition
  202611020326 --heads <it>` = 7b6f8ee0, differing only in edition, cut_at and the keys path; E9 PASS. Harness note
  (04:5x): the harness regenerates data/drift.json for the stamp of the folder it ships. Open: E7 FAIL on the drift record
  ("#hud (one DRIFT line per frame, appended)"), E6 FAIL as for E6-G1. Edition 7 (main 4ee309d, 202611020446) shipped
  from E6-G1.
