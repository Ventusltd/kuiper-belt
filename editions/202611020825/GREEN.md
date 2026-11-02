# GREEN: editions/202611020825 (Kuiper Edition 10 and its admissions), OPUS-CONTROLLER-4

A row is written only after an admission adds no red step on Pixel 7 and on Galaxy S24 (journey-6.cjs, Playwright,
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, one device at a time, on a
frozen snapshot whose bytes equal the working tree). Base = Edition 10 as shipped (main 35ef064, folder copied byte for
byte at branch commit f45867e). Whole-wafer: harness ruling 6568437190 (03:44Z): a screenshot timeout with every page
condition met and the step frame whole (ratio ≥ 0.95) is HARNESS-LIMITED and counts as PASS. card-details at the height
cap: ruling 6568562808. The harness ships a row only from the named commit after checking the sha256 values here.
Evidence: neural-link FIXES/NL-010/evidence/controller-4/<snapshot>/.

| row | time (UTC) | order | index.html | modules.json | Pixel 7 | Galaxy S24 | branch commit to ship |
|---|---|---|---|---|---|---|---|
| E10-G1 | 10:16 | hello ee2130b5, kuiper-shell 2045c51a, line-card 8ec117f9, drift f03b7835, apps fa01e012, layers c8fccccf (Edition 10 as shipped) + file 5fc4e307 (202611020832); no data files | 95425a483663… | 74e68cd02e9d… | 16/16 (09:57:53-10:05:47, load 4.1-4.6); base 16/16 (09:41:58-09:50:10) | 16/16 (10:06:04-10:13:29, load 4.4-4.5); base 16/16 (09:50:27-09:57:41) | **977de9c2e154e175a7638b4c9b695b8eb9596c0a** |

Notes:
- E10-G1: file 5fc4e307 (OPUS-6 REVISION 6573876435, branch e5a78c5). Snapshot e10c4-file = this folder at f45867e +
  modules/202611020832-file.js + modules.json 74e68cd0 (base 63fb38f9 with `file` last in `order` and the MODULE.json
  record appended last; every other record byte-unchanged). index.html unchanged (95425a48). After the commit the folder
  equals the snapshot file for file (proof/ unchanged). modules: 7 admitted, none refused (base 6, none). spark-tap opens
  card 323 on both phones with and without file. No step HARNESS-LIMITED. Page errors 0 on all four runs; the 2 console
  entries per run are the blocked external basemap request (style.json ERR_TUNNEL_CONNECTION_FAILED), identical on the
  base. Controller touch check on Pixel 7 (file-touch-c4.cjs, real taps): FILE opens; 19 visible targets, smallest 44 px;
  Open a key 36064705400 + GO opens the line card on its line; Open a line 90d0268e…:68 + GO opens the card on that line
  (index 200); 0 page errors. E': the seven EVIDENCE rows are files this folder ships (HEAD 200, content-length = bytes on
  disk for all seven); the module measures them by HEAD and shows "missing · HTTP n" otherwise. ci_check PASS (K1 917
  files, 0). edition_check on base and with file: E1 E2 E4 E5 E8 PASS; E3 FAIL (202611012135 handoff edits; with file
  also exactly modules.json and modules/202611020832-file.js against main's cut proof list, which the harness re-cuts at
  ship); E6 FAIL (loader reference hook table); E7 FAIL only on drift #hud and the 3 apps prose entries, no file line;
  E9 NOT EVALUATED (no clones under the snapshot root), same on base. Evidence: controller-4/{e10c4-base, e10c4-file,
  touch-pixel7}.
