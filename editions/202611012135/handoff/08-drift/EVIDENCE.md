# EVIDENCE — Opus team 8, step 8, the drift of an edition from the live heads

Written by OPUS-8 lead, who also held the evidence officer's slot (no builder, tester or evidence officer appeared
in the first 20 minutes; PLAN.md). Every number below was measured on this machine; every claim carries a key
`repo@sha path:line`. `kb` = kuiper-belt. `kb@018b46a` is kuiper-belt main (= the clone's `origin/HEAD`); `kb@0cd7910`
is the edition branch as the harness last committed it; `kb@96736f5` is the commit HOOKS.md is keyed to.

## A. What was written (sha256 = MODULE.sha256)

| file | bytes | sha256 |
|---|---|---|
| `editions/202611012135/modules/202611012325-drift.js` | 22,294 | `18f7019aad915920e79c1f279ad688f3ccd4f1dd96ff23a992520c19b37fdd8d` |
| `editions/202611012135/data/drift.json` | 118,553 | `388103129b904a4a038d18adc26b703c144dede2d09497d13fe6223b30b5d103` |
| `tools/drift.py` | 26,522 | `29fdb05e5717aee41a5b0ed149b715bf4d997cdbee045bef90da9dd7a6b6080e` |

Inputs, recorded inside drift.json `inputs`: `editions/202611012135/keys.json` sha256 `1c293c33…7242b` (byte-identical
to Edition 4's `editions/202611012027/keys.json`, measured), `cosmos/repos.tsv`, and the git objects of the clones under
/home/user/estate. Nothing else is read (P5; the tool has no other open()).

## B. The result

`python3 tools/drift.py` (observes `refs/remotes/origin/HEAD` of each clone): 346 bodies → **309 SAME, 7 MOVED, 2 GONE,
0 FILE_GONE, 28 UNVERIFIED**; share 309 / 318 (rows 346 − UNVERIFIED 28); 21 of 22 heads observed.

- MOVED (7): data-grid-gb@01a4491 `datacentres/lanes/dc-a7-merge/dcmerge.py` 122→128, 211→217, 236→242, 412→418,
  514→520 (+6 each); gridatlas@41729af `tools/ci/202609012200-local-ci.mjs` 351→367 (+16);
  gridatlas@41729af `atlas/parts/202609012045-sld-sandbox-body.js` 409→751 (+342). Each has 1 occurrence at the head.
  All 7 land at a new key on the wafer (the head commits 01a4491dc66e and 41729af0b49d are rows of kb cosmos/wafer.tsv,
  measured: `grep -c` 1 each); test.cjs "MOVED placed at a new key" 7 of 7 on both devices.
- GONE (2): gridatlas `atlas/current.json` lines 14 and 576 (the pointer file now names generation 202610292044,
  gridatlas@5ec7f62 atlas/current.json:3).
- UNVERIFIED (28), each with its reason in the row: 22 `no clone of pipelinenews in the estate`; 4 `empty line_text`
  (globalgrid2050 diary …:89, kuiper-belt README.md:33, data-centres-gb README.md:8, kuiper-belt
  learn-the-kuiper/202610050144/NOTICE.md:6); 2 `key not on the wafer (on_wafer: false)` (star-maker README.md:115,
  machinery/bench/starmaker.mjs:86).
- Heads (drift.json `heads`): every one read from `refs/remotes/origin/HEAD` → `refs/remotes/origin/main`, observed
  at the mtime of the clone's FETCH_HEAD, which names the sha: 20 between 2026-10-31T23:26:48+00:00 and
  23:27:07+00:00, kuiper-belt 2026-11-01T21:35:16+00:00. All are within the cap (14 d) of the cut 2026-11-01T21:35:00+00:00.

## C. Team 4's numbers, reproduced and explained

Team 4 (neural-link FIXES/NL-010/team-4/STEPS.md:300 loose 333/10/3/0/0, :308 strict 331/7/2/0/6) ran a prototype
against the checked-out HEAD of each clone and a pipelinenews clone at /home/user/pipelinenews (STEPS.md:299-300).

1. **Reproduced exactly.** `tools/drift.py --estate <the estate plus a symlink to /home/user/pipelinenews> --heads <team
   4's 21 recorded heads>` → **331 SAME, 7 MOVED, 2 GONE, 0 FILE_GONE, 6 UNVERIFIED**, and 0 of 346 rows differ from
   `/tmp/nl010/team-4/drift_strict.json` in class or head_line (measured, scratch
   /tmp/nl010-opus/team-8/lead/drift.team4-reproduction.json). That run reads outside the step's inputs and is
   evidence only, never the deliverable.
2. **Our 309/28 against their 331/6 is pipelinenews and nothing else.** No clone of pipelinenews exists under
   /home/user/estate (measured: `ls`), so the refusal rule (ROADMAP step 8 "an unobserved head makes every row of that
   repository UNVERIFIED, never SAME"; kb@018b46a README.md:40) makes its 22 rows UNVERIFIED: 331 − 22 = 309, 6 + 22 =
   28. Row by row against team 4's strict file the deliverable differs in exactly those 22 rows (measured).
3. **The heads differ and no class changes.** Ours are the default branches as fetched; team 4's were the checked-out
   branches: gridatlas 41729af0b49d vs 5ec7f62f213e (a preview branch), data-grid-gb 01a4491dc66e vs 75ab8ae54e95
   (fix/nl007-operator-canon, an ancestor of 01a4491), globalgrid2050 35b5be2fa446 vs c66759f0d7ac, particle-physics-
   drawing-engine e51127791aab vs eb52ad7ebab1, stars 529ae15839dd vs cbca125bb5ee, time-stone c507d8ce8639 vs
   a1703b1bb017, ventus-grid-engine 5eead830d990 vs 96a800eb0182; the other 14 equal. Run against team 4's heads
   (`--heads`, scratch drift.team4heads.json) the deliverable's counts are the same 309/7/2/0/28 (measured), so every
   line team 4 measured reads the same at both sets of heads.
4. **The loose 333/10/3** is the quote fallback team 4's prototype used where `line_text` is empty (STEPS.md:305-307):
   by `/tmp/nl010/team-4/drift.json` against `drift_strict.json` (measured), star-maker README.md:115 and
   starmaker.mjs:86 went SAME (+2), globalgrid2050 diary :89→90, kuiper-belt README.md:33→34 and data-centres-gb
   README.md:8→9 went MOVED (+3), kuiper-belt learn-the-kuiper/202610050144/NOTICE.md:6 went GONE (+1). 331+2, 7+3,
   2+1, 6−6. The deliverable never falls back to `quote`.

## D. The tool's own test (`python3 tools/drift.py --check`, RESULT: PASS 7 of 7, scratch check-final.out)

P1 two runs against the recorded heads byte-identical (118,553 bytes, sha256 3881031…) and equal to data/drift.json
byte for byte (the E9 predicate); P2 gridatlas removed from the estate (symlink estate) → its 121 rows UNVERIFIED,
denominator 318 → 197, `REFUSED: no clone of gridatlas` printed; heads emptied → exit 2, nothing written; heads
observed 2026-10-01 → exit 3, nothing written; P3 through `git show` (a separate code path from the tool's
`git cat-file --batch`): 309 SAME at `line`, 7 MOVED at `head_line` and first occurrence and not at `line`, 2 GONE with
`git grep -F -x -f` empty, 28 UNVERIFIED with reasons, and the walk that places a new key re-run at the edition's commit
equals keys.json `lines_before` for all 7 MOVED bodies: 0 disagreements; P5 346 rows = 346 bodies, no repository
outside cosmos/repos.tsv (kuiper-belt matches `Kuiper-belt` case-insensitively, as kb@018b46a tools/edition_keys.py:94-104
find_clone does), no key outside keys.json. Negative: one GONE row changed to SAME in a copy → P1 and P3 FAIL,
`RESULT: FAIL (5 of 7)` naming row `2c55690d…:576` (measured).

## E. Keys for every lesson, law and hook used

| what | key |
|---|---|
| the GridAtlas lesson: a hashed cartridge is admitted only when its bytes hash to the record | gridatlas@5ec7f62 atlas/current.json:5 `IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES`, :31 `sha256`; tools/ci/pr-gate.mjs:176 `SHA-256 mismatch` |
| the word drift is the Kuiper's | kb@018b46a DRIFT.md:2; LAWS.md:139 (L10) |
| a law must be falsifiable (LAW.md's form) | kb@018b46a LAWS.md:3-4 |
| refusal: a check that examines nothing refuses | kb@018b46a README.md:40 |
| never trusted blind | kb@018b46a tools/key.py:49 |
| every time carries its offset | kb@018b46a README.md:39 |
| the text rule of line_text | kb@018b46a tools/edition_keys.py:250 |
| the key law (new key of a MOVED line) | kb@018b46a tools/edition_keys.py:12; the walk :136-159, the sum :209-215 |
| lines_of (binary rule) | kb@018b46a tools/edition_keys.py:43-46 |
| the cap (borrowed, DISCLOSED) | kb@018b46a tools/wafer_keys.py:34 `CAP_SECONDS = 14 * 86400` (there: the silence cap) |
| colours | kb@018b46a PALETTE.md:9 grey-blue the record, :11 green energised, :12 amber attention, :19 no decoration |
| licence | kb@018b46a README.md:155-156 |
| hooks used (REQUIRES, header, MODULE.json agree): wafer, keyPlace, o2, ov, cv, card, esc, fmt, commits, repos, SPACE, hud, flyTo, cam, sel, draw, redraw, panels | handoff/04-loader/HOOKS.md rows 1, 5, 12, 14-18, 21, 24, 26-28 and the KY table (cam, sel, redraw, draw.add, panels.add); engine lines kb@96736f5 editions/202611012135/index.html:121 (cv ov o2), :123-124 (hud card), :125 (fmt), :198 (N SPACE repos commits), :208 (wafer resolves), :243 (cam sel), :253 (flyTo), :278 (keyPlace), :332 (draw), :681 (esc), :710 (PANELS) |
| commit records carry sha (12 hex), k0, k1 | kb@0cd7910 editions/202611012135/index.html:220-221 |
| tap reach and slop copied | kb@0cd7910 editions/202611012135/index.html:742 `ED_TAP_TOUCH = 24, ED_TAP_MOUSE = 9, ED_SLOP = 10`; fly zoom :709 `ED_Z = 14` |
| the page's own key files | kb@0cd7910 editions/202611012135/index.html:649 `EDPATH = 'keys-min.json', EDFULL = 'keys.json'` |
| refusal idiom copied | kb@0cd7910 editions/202611012135/index.html:256 `... did not load. The wafer will not invent its keys.` |
| line-card api used (optional) | kb@0cd7910 editions/202611012135/modules/202611012143-line-card.js:126 `show`, :140 `state.last = {..., k: b.key}` |
| layer registry api used (optional) | kb@0cd7910 editions/202611012135/modules/202611012141-layers.js:119 `register`, :122 the throw, :29 FORMATS (no `kuiper.drift.v1`: REQUESTS item 2) |
| the step | neural-link FIXES/NL-010/ROADMAP.md:589-648; team-4/STEPS.md:233-352 |

## F. Disclosed

- The second-machine re-run of ROADMAP step 8's team brief was not done: there is one machine. The determinism proof is
  P1 on this machine; E9 is the place it repeats elsewhere.
- The edition README states no cap; the tool borrows 14 days (E row "the cap") and the README paragraph proposes it.
- `observed_at` is the time the clone last fetched (FETCH_HEAD mtime), not a live call to GitHub: the step allows only
  the clones as inputs, and this sandbox does not fetch. A fetch before a re-cut moves the heads; `--heads` re-runs never do.
- kuiper-belt's head 018b46a is not a row of the wafer (measured `grep -c` 0); no kuiper-belt line is MOVED, so no spark
  falls back to the edition's key in this cut, but the module says why when one does.
- test.cjs ran pre-integration (modules.json routed: the served records re-hashed from disk, line-card, drift); the
  layer registry is not admitted in the served manifest, so the module drew on its own (`registry own`).

## G. Android (test.cjs, run 2, `--handoff`)

`node handoff/08-drift/test.cjs http://127.0.0.1:8480/editions/202611012135/ <out> --handoff` → **RESULT: PASS (32 of
32) pre-integration**, Pixel 7 and Galaxy S24, real touch, zero console errors in every scenario (the deliberate 404 of
data/drift.json in scenario C excluded and counted). TEST.md holds every step with its measurement; img/ holds three
CSS-pixel PNGs (the MOVED card on Pixel 7, the filter "moved" on Galaxy S24, the refusal on Galaxy S24).
