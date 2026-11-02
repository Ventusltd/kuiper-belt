# GREEN: editions/202611020629 (Kuiper Edition 9 and its admissions), OPUS-CONTROLLER-3

A row is written only after an admission adds no red step on Pixel 7 and on Galaxy S24 (journey-6.cjs, Playwright,
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, one device at a time, on a
frozen snapshot whose bytes equal the working tree). Base = Edition 9 as shipped (main fdf6e35, folder copied byte for
byte at branch commit ea853c3). Whole-wafer: harness ruling 6568437190 (03:44Z): a screenshot timeout with every page
condition met and the step frame whole (ratio ≥ 0.95) is HARNESS-LIMITED and counts as PASS. card-details at the height
cap: ruling 6568562808. The harness ships a row only from the named commit after checking the sha256 values here.
Evidence: neural-link FIXES/NL-010/evidence/controller-3/<snapshot>/.

| row | time (UTC) | order | index.html | modules.json | Pixel 7 | Galaxy S24 | branch commit to ship |
|---|---|---|---|---|---|---|---|
| E9-G1 | 08:24 | hello ee2130b5, kuiper-shell 2045c51a, line-card 8ec117f9, drift f03b7835, apps fa01e012 (Edition 9 as shipped) + layers c8fccccf (202611020637) + data/layers.json 4aa35536, data/editions.json d175ffe1 (stamp 202611020629) | 73383218923b… | 47c51d618292… | 16/16 (08:08:01-08:15:54, load 4.3-4.6); base 16/16 (07:52:22-08:00:39) | 16/16 (08:15:55-08:23:12, load 4.6); base 16/16 (08:00:40-08:08:00) | **85c0bc64e7e5e593692e3f6b3fc0dbe39d597650** |

Notes:
- E9-G1: layers c8fccccf (OPUS-3 REVISION 6571928537, branch 4784aa3; replaces refused b16716bd, 6569024455). Snapshot
  e9-layers = this folder at ea853c3 + the module, its two data files and modules.json 47c51d61 (base dc18452f with
  `layers` added to `order` and the MODULE.json record appended last; every other record byte-unchanged). index.html
  unchanged (73383218). spark-tap with layers: tap 1.8 px from line 323 (second nearest 29.6 px P7, 26.1 px S24) opens
  card 323 on both phones, as on the base. modules: 6 admitted, none refused (base: 5, none refused). Page errors 0 on
  all four runs; the 2 console entries per run are the blocked external basemap request (style.json
  ERR_TUNNEL_CONNECTION_FAILED), identical on the base. ci_check PASS (K1 861 files, 0). edition_check on base and on
  the admitted folder alike: E1 E2 E4 E5 E8 PASS; E3 FAIL (202611012135 handoff edits; on this folder also the 4
  admitted files against main's cut proof list, which the harness re-cuts at ship); E6 FAIL (loader reference hook
  table); E7 FAIL only on drift #hud and the 3 apps prose entries, no layers line; E9 FAIL (drift.json recorded
  2f227a13, re-computed db7e3b35 on this machine, same on base). Evidence: controller-3/{e9-base, e9-layers}.
