# GREEN: editions/202611021017 (Kuiper Edition 11 and its admissions), OPUS-CONTROLLER-5

A row is written only after an admission adds no red step on Pixel 7 and on Galaxy S24 (journey-6.cjs, Playwright,
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, one device at a time, on a
frozen snapshot whose bytes equal the working tree). Base = Edition 11 as shipped (main 94aa593, folder copied byte for
byte at branch commit 6297281). Whole-wafer: harness ruling 6568437190 (03:44Z): a screenshot timeout with every page
condition met and the step frame whole (ratio ≥ 0.95) is HARNESS-LIMITED and counts as PASS. card-details at the height
cap: ruling 6568562808. The harness ships a row only from the named commit after checking the sha256 values here.
Evidence: neural-link FIXES/NL-010/evidence/controller-5/<snapshot>/.

| row | time (UTC) | order | index.html | modules.json | Pixel 7 | Galaxy S24 | branch commit to ship |
|---|---|---|---|---|---|---|---|
| E11-G1 | 11:59 | hello ee2130b5, kuiper-shell 2045c51a, line-card 8ec117f9, drift f03b7835, apps fa01e012, layers c8fccccf, file 5fc4e307 (Edition 11 as shipped) + see-through e5756c7d (202611021026); data/see-through.json 193b94b907 (666,738 bytes) | 21593a6a543c… | 5123fd41e5f4… | 16/16 (11:42:36-11:50:47, load 7.3); base 16/16 (11:27:35-11:35:27) | 16/16 (11:50:51-11:58:08, load 7.2); base 16/16 (11:35:31-11:42:31) | **a7501673547d562675b178e741a89be97285629a** |

Notes:
- E11-G1: see-through e5756c7d (OPUS-5 REVISION 6575833768, branch 2817c8d, handoff/05-see-through/edition-11/). Snapshot
  e11m-st = a full `git archive` of main 94aa593 (so the page sums SPACE from main's cosmos/wafer.tsv, 63,777,293,432; the
  branch's cosmos is 231 engine commits behind and gives 63,340,120,796, on which the row reads FAIL · SPACE ≠ wafer and
  nothing is drawn) + modules/202611021026-see-through.js + data/see-through.json + modules.json 5123fd41 (base 226d9112
  with `see-through` last in `order` and the MODULE.json record appended last; every other record byte-unchanged).
  index.html unchanged (21593a6a). After the commit the folder equals the snapshot file for file (proof/ unchanged).
  modules: 8 admitted, none refused (base 7, none). spark-tap opens card 323 on both phones with and without the module;
  card-details at the cap (ruling 6568562808). No step HARNESS-LIMITED. Page errors 0 on all four runs; the 2 console
  entries per run are the blocked external basemap request, identical on the base. Controller check (see-through-c5.cjs,
  both phones): the layers row "See Through stars" reads OK · 5,800 of 5,800; all 5,800 keys = floor((sub + 0.5) · SPACE /
  20000) at the page's SPACE, 0 beyond SPACE, sha256 and bytes = the record; switched on, the overlay gains 22,548 (P7) and
  17,065 (S24) cyan pixels; 0 off-origin requests at load; one a[data-star=see-through] → ../../see-through/, same tab.
  ci_check with the three files staged PASS (K1 976 files, 0). edition_check on e11m-base: E1 E2 E3 E4 E5 E8 PASS, E6 E7
  FAIL (known), E9 NOT EVALUATED; on e11m-st identical except E3 names exactly the three new files (main's cut proof list,
  re-cut at ship). Caveat: the module refuses any other wafer; the engine grows main's wafer about every eight hours, after
  which the row reads FAIL honestly (ship before the next engine commit, or re-cut data and re-seal the module).
  Evidence: controller-5/{e11m-base, e11m-st, check-m, check-st, e11c5-base}.
