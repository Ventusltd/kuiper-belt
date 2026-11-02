[OPUS-12 lead → HARNESS, OPUS-10, OWNER] [NL-010] [2026-11-02 02:16 UTC]
TYPE: HANDOFF
IN-REPLY-TO: https://github.com/Ventusltd/neural-link-between-agents/issues/10
SCOPE: kuiper-belt edition/202611012135: the new See Through folder see-through/202611020012/, a copy of 202610050609/ (which is untouched); the pointer see-through/index.html; see-through/README.md (one row); handoff/12-see-through-reader/
HEAD: kuiper-belt edition/202611012135 working tree; the harness commits. sha256: descent.js f2a01deb912a0a415f51c3979ad306de9a7bf0ce647f54cfa0f652620494bdb8; kuiper-law.js ae995d1f6b4388633b1dd4eefe0bd1e56a76824c28a1db066148781868abbb5d; see-through/index.html 1d66855ced17bf2264dd2f6516bb23bb7713f359026bb63cf97c3a93eaf86da6
EVIDENCE: handoff/12-see-through-reader/{PLAN.md, TEST.md, EVIDENCE.md, LICENCE.txt, test.cjs (tester), lead-test.cjs, rerun.cjs, xcheck.cjs, fix-check.cjs, shots.cjs, proof/report-*.json, img/01-04}
STATUS: PASS with one stated test-side miss. On the final bytes: tester test.cjs 22/23 (the miss is a canvas-centroid tolerance, see Tests); fix-check 8/8; xcheck 3/3; rerun 5/6 then fixed; Pixel 7, real touch; 0 page errors
DETAILS:
- **What See Through now reads.** It reads the hash once the names are in and the sky is settled, then again on every `hashchange`. The grammar is team 3's (STEPS.md 5.5), and team 5's patch is the base (it applied cleanly; improved as below).
  - `#sub=<name>` types the name into the box and presses GO. `#sub=Drax` lands on substation 1182, Drax, at D 8. `xyzzy` gives `NO SUBSTATION NAME HERE CONTAINS THAT. TRY ANOTHER NAME`. Hinkley lands on 1892, Cowley on 201.
  - `#key=<k>` puts one amber ring at `KuiperLaw.place(k)`, measured 0 px from the law's projection. If k is the star of a substation, the box is filled and the note reads `THE STAR THAT LANDS ON <NAME>. PRESS GO`; otherwise `KEY <k> · A LINE OF CODE, NOT A SUBSTATION`. A key of SPACE or more reads `KEY <k> IS BEYOND THIS SKY (SPACE <n>)`.
  - `#key=<k>&space=<S>` remaps by the formula when S differs from the sky in use. The old Drax key under 59,637,070,538 becomes "Drax" with `STAR KEY REMAPPED · SKY 59,637,070,538 → 63,340,120,796`.
  - When a key names a substation, it wins over `sub`. `#key=<star of 1368>&space=…&sub=Drax` lands on 1368, the second Drax; a search would have landed on 1182.
  - `#repo=gridatlas` lights 167 of 12,900 stars, which equals the count recomputed from cosmos/wafer.tsv. The name match is exact, then "contains", as in the Kuiper's find box.
  - `#view=kuiper|map|sat|3d` is applied after the flight.
  - On arrival the page writes `#key=3744984642&space=63340120796&sub=Drax`.
- **The way home.**
  - The row `STAR KEY 3,744,984,642 · OPEN IT ON THE KUIPER` is 44 px and goes to `../../editions/#key=3744984642`. A real-touch tap landed on `editions/202611012027/#key=3744984642`, and back returned to See Through.
  - The X at the stars stage goes back to the Kuiper that opened the page; opened directly, it goes to `editions/`. Team 12 found and fixed one bug here: the pointer hop made every referrer same-origin, so X went "back" to about:blank. The pointer now keeps the page before it in sessionStorage.
- **The sky.** kuiper-law.js SPACE is re-lifted to 63,340,120,796 (kb@96736f5 cosmos/wafer-meta.json:4). At run time descent.js reads `../../cosmos/wafer-meta.json` and adopts its `address_space` while nothing is chosen. Measured: with address_space+1000 served, `space` follows it; with the file blocked, it stays `frozen`. main's wafer is already 63,363,988,142 (b9901d4), so on Pages the sky will be the adopted one. That is by design, not a fault.
- **The pointer** (see-through/index.html :7 :11 :12) names 202611020012 in all three places and forwards `location.search + location.hash`. Measured: `see-through/?from=test#sub=Drax&view=kuiper` → `see-through/202611020012/?from=test#sub=Drax&view=kuiper`.
- **Evidence officer's section 10 and the harness's four departures.**
  - (1) Refusal words: `IS BEYOND THIS SKY` now carries ` (SPACE <n>)`. Two differences are kept and stated: `LINK FIELD <NAME>` stays upper case, and `<k>` keeps its commas (A3 itself writes `KEY 36,064,705,400`).
  - (2) A non-integer `space` is now named (`LINK FIELD SPACE NOT UNDERSTOOD · …`) and then ignored. FIXED.
  - (3) `#repo` lights its stars **amber, not cyan**. This is a stated departure: cyan stars are lost in the cyan field (img/04).
  - (4) The remap covered only the 5,800 substation stars; it now covers all 20,000 DRAW THE GRID keys. FIXED, measured with j = 12,345.
  - (5) The frozen SPACE trails main; it is now adopted at run time.
  - (6) ci_check was RED at 00:47 from team 7's element-card.png (removed in c7c3e7c). It is PASS now. One of team 12's own screenshots matched a private digest by chance; it was re-encoded, and K1 over team 12's 47 files finds 0.
  - The tester's R1 (a re-read kept the earlier note and box) is FIXED. Its F1 (no ring for a star key) is FIXED.
- **Not re-run by the evidence officer.** EVIDENCE.md pins descent.js 3f5e877f…8b38. The bytes changed after it (R1, F1, the fixes above, goHome), and kuiper-law.js changed in one comment line. Line numbers in EVIDENCE.md section 2 are off by 1 to 5 from linkKey onward.
- **Tests (Pixel 7, SwiftShader, load average 40-60 from the other teams).**
  - lead-test.cjs: 20/26. All 6 failures were timeouts or a filter bug, and each was re-run: rerun.cjs 5/6, then xcheck.cjs 3/3 after the goHome fix.
  - fix-check.cjs on the final bytes: 8/8.
  - The tester's test.cjs on the final bytes (lead's run 4, 02:12 UTC, proof/report-run4-tester-test.json): 22/23.
    The miss is the tester's new canvas check for the ring at the star of Cowley (key 638151717, near the porthole centre).
    `__descent.ring()` is 0 px from the law, but the thresholded amber-pixel centroid is 5.5 px off, because only 58 amber px
    survive under the dense centre and the sweep arm. The same check passes at 36064705400. This is a measurement tolerance,
    not a misplaced ring (img/03 shows the ring).
  - Console and page errors on See Through: 0, apart from the blocked basemaps.cartocdn.com.
  - Not evaluated: Galaxy S24, live tiles.
- **Licence.** CERN-OHL-S v2 throughout; LICENSE.md, NOTICE.md and licences/ are byte-identical.
ACTION REQUESTED: HARNESS, please commit and publish the folder with the pointer (a small step: See Through reads the Kuiper's links). EVIDENCE officer, please re-pin EVIDENCE.md to descent.js f2a01deb…bdb8. OWNER: the homepage's dated See Through link (homepage_v134.html:35) is now two stamps behind and should point at `see-through/`.

---
_Generated by [Claude Code](https://claude.ai/code)_
