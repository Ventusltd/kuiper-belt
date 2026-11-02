# Opus team 12 "See Through hash reader": TEST (OPUS-12 tester)

Status: **REFUSED, run 2 (2026-11-02 01:22 UTC) FAIL 19/21 on Pixel 7.** Hand-off waits on R1 below; re-run in progress.

Script: `handoff/12-see-through-reader/test.cjs` (Playwright, devices['Pixel 7'] 412 x 915, harness SwiftShader flags,
real touch for the one tap, a fresh browser per case, 7 s settle, screenshots at CSS scale).
Run: `python3 -m http.server 8611 --bind 127.0.0.1` from /home/user/estate/kuiper-belt, then
`node editions/202611012135/handoff/12-see-through-reader/test.cjs http://127.0.0.1:8611/ /tmp/nl010-opus/team-12/tester/run --img editions/202611012135/handoff/12-see-through-reader/img`.
Target: `see-through/202611020012/descent.js` (mtime 00:16 UTC), pointer `see-through/index.html`.

## REQUEST to the lead / builder

R1 (blocking) The re-read on `hashchange` keeps the previous link's note and box. `readLink()` resets `S.ring`,
`S.repoLit`, `S.linkSub` but not `S.note` or `S.input`, and names an unknown field only `if (!S.note.textContent)`
(descent.js `readLink`, line ~927). Measured: `#repo=nosuchrepo` then `#bogus=1` on the same page leaves the note
`NO REPOSITORY CALLED NOSUCHREPO`; `#key=638151717` then `#key=36064705400` leaves "Cowley Substation" in the box beside
`KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION` (img/03). Fix: in `readLink()` after the resets,
`S.note.textContent = ''; S.input.value = '';` (every branch that names a substation sets the box again).

Findings (not blocking; the STEPS 5.5 table against the build, for the lead to decide):
F1 A star key (`#key=<subKey j>`, with or without `&space`) draws no amber ring: `linkKey` returns before `S.ring` is set
(`ring: null`, 0 amber pixels at the law's place, img/02). The table says one amber ring is drawn at
`KuiperLaw.place(key)` for any key at D 0, then the box is pre-filled; A3 asserts only box and note.
F2 `#repo` lights its stars amber (`C.amber`, the `drawFrame` block at descent.js:612-616); the table says "in the
instrument's cyan". Amber reads better against the cyan field (img/04).
F3 The note `KEY 36,064,705,400 · A LINE OF CODE, NOT A SUBSTATION` runs past the 412 px screen edge (img/03 ends
"SUBSTATIO"); the text is not shortened, but the phone does not show all of it (measured as `noteFit` in report.json).

## Run 2 results (Pixel 7)

| case | hash | landing asserted | result |
|---|---|---|---|
| static | pointer | three places name 202611020012, `location.replace(stamp + search + hash)`; frozen SPACE = wafer-meta 63,340,120,796 | PASS |
| C1 | `#sub=Drax` | box "Drax", T 1182 Drax, D 8; hash written `#key=3744984642&space=63340120796&sub=Drax` = `link()`; spaceSource wafer-meta; row `STAR KEY 3,744,984,642 · OPEN IT ON THE KUIPER`, `href ../../editions/#key=3744984642`, 44 px, 396 px wide, visible, not covered; HEAD editions/ 200 | PASS (arrival 113 s from goto under load; 10.8 s in run 1) |
| C2 | `#key=3744984642&space=63340120796` | T -1, D 0, box "Drax", note `THE STAR THAT LANDS ON DRAX. PRESS GO` | PASS (F1) |
| C3 | `#key=638151717` (no space) | box "Cowley Substation", note `THE STAR THAT LANDS ON COWLEY SUBSTATION. PRESS GO` | PASS |
| C3 hashchange | `#key=36064705400` | note exact, ring state 0.000 px from the law; canvas centroid 1.834 px, 190 amber px | FAIL in run 2 (tolerance 1 px on a thresholded pixel centroid, test-side; now ≤ 2 px plus radius 10 ± 1.5) |
| C3 hashchange | `#key=63340120796` | `KEY 63,340,120,796 IS BEYOND THIS SKY` | PASS |
| C3 hashchange | `#key=3526041795&space=59637070538` | box "Drax", `STAR KEY REMAPPED · SKY 59,637,070,538 → 63,340,120,796 · THE STAR THAT LANDS ON DRAX. PRESS GO` | PASS |
| C3 hashchange | `#sub=xyzzy` | T -1, `NO SUBSTATION NAME HERE CONTAINS THAT. TRY ANOTHER NAME` | PASS |
| C3 hashchange | `#repo=nosuchrepo` | `NO REPOSITORY CALLED NOSUCHREPO` | PASS |
| C3 hashchange | `#bogus=1` | `LINK FIELD BOGUS NOT UNDERSTOOD` | **FAIL (R1)**: note stayed `NO REPOSITORY CALLED NOSUCHREPO` |
| C4 | `#repo=gridatlas` | note `GRIDATLAS · 167 OF 12,900 STARS`; 167 = count recomputed from cosmos/wafer.tsv (938 ranges) = `repoLit()`; 969 amber px | PASS (F2) |
| C5 | `#view=3d` | caption `CHOOSE A SUBSTATION FIRST`, view map, in3d false, T -1, no LINK FIELD note | PASS |
| C6 | `see-through/?via=pointer#sub=Drax&view=map` | navigations: pointer, then `see-through/202611020012/?via=pointer#sub=Drax&view=map`, then the written hash; T 1182 in the map view; real touch on the row → `editions/#key=3744984642` → `editions/202611012027/#key=3744984642` | PASS |
| errors | all six pages | 0 console errors, 0 page errors, 0 other failed requests; 12 blocked `basemaps.cartocdn.com` entries (style.json, `net::ERR_TUNNEL_CONNECTION_FAILED`, one console + one requestfailed per page) logged in report.json `blocked` | PASS |
