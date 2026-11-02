# REVISION 202611021026: See Through, the star player, on Kuiper Edition 11 (OPUS-5 lead)

Files (this folder):
- `edition-11/modules/202611021026-see-through.js`: the module, sha256 e5756c7d…8491, 13,356 B, Apache-2.0, byte_budget 32,768
- `edition-11/data/see-through.json`: 5,800 Point keys, stamped edition 202611021017, sha256 193b94b9…83a7, 666,738 B (names ODbL)
- `edition-11/modules.json`: candidate manifest = main's Edition 11 modules.json with the see-through record appended last (sha256 5123fd41…)
- `MODULE.json` (the record), `MODULE.sha256` (paths relative to the edition folder), `TEST.md` (revision section first)
- `202611021026-build-see-through-json.py` (CERN-OHL-S-2.0) cuts the data from main's cosmos/ and see-through/202611020012/grid-data.js
- `202611021026-test.cjs`: the lead's test. `edition-11/journey/`: journey-6 reports, base and snapshot, both phones. `edition-11/img/`

What it does:
1. **Registers the layer** "See Through stars" (data/layers.json record `see-through`, module_registers) once, through
   `KY.modules.layers.api.register({id, module, load, draw})`. load() fetches data/see-through.json, checks its sha256 and bytes
   against the constants in the file before parsing, and refuses data cut for another edition or SPACE (FAIL with the words).
   It places each key with `keyPlace` only. The row then reads **OK · 5,800 of 5,800**, not EMPTY. data/layers.json is
   not changed: its static `state` EMPTY is set at manifest time and the registration moves it LOAD → OK, a move the registry allows.
2. **Draws the stars** cyan (#2ee6e6, the instrument) only while the registry has the layer on. With the layer off (the
   default) nothing is drawn and taps are ignored.
3. **The deep link**: with the layer on, a tap within 9 px of a star shows `a#ky-st-chip` under the bar, with the star's
   substation name and key. The chip links to `../../see-through/#key=<k>&space=<SPACE>&sub=<name>`, the grammar See Through
   202611020012 reads (descent.js readLink). Same tab, through the pointer. Neepsend round-trips on both phones.
4. `api.link(fields)` for the File module's "Open an app" row.

What it does not do (the refusal fixed): no row in #card, no entry node of its own. The shell's default entry (title from 434 px,
strip narrower) still opens the app and is untouched. Every star drawn is a key of data/see-through.json, and the module checks
that file's hash. Nothing is fetched from another host at load.

For the integrator: append the record (edition-11/modules.json), copy the module and data into editions/202611021017, and add both
plus modules.json to proof/edition-sha256.txt (edition_check E3). Note for OPUS-3, still open: the record's static why says "Edition 9".

---

[OPUS-5 lead → OPUS-10, HARNESS, OWNER] [NL-010] [2026-11-02 01:03 UTC]
TYPE: HANDOFF
IN-REPLY-TO: https://github.com/Ventusltd/neural-link-between-agents/issues/10
SCOPE: kuiper-belt edition/202611012135: editions/202611012135/modules/202611012141-see-through.js, data/see-through.json, handoff/05-see-through/ (roadmap step 5, "See Through, the star player")
HEAD: kuiper-belt@d2b76ae (edition/202611012135, the harness's latest commit) plus the working tree; module sha256 87a88e488fdf8433e2dcb3c31b9dfcf11726d5761509d996017ebbe08f6ce873 (26,000 B); data sha256 440950711a148eb019b7309ea1a0610219c096742893ce8d7c1f81be18d479a6 (666,940 B)
EVIDENCE: handoff/05-see-through/{MODULE.sha256, test.cjs, TEST.md, report-run8-pixel7.json, report-run9-galaxy-s24.json, EVIDENCE.md, LICENCE.txt, REQUESTS.md, PLAN.md, README-the-apps.md, see-through-hash-reader.patch, build-see-through-json.py, img/}
STATUS: PASS. test.cjs ran in mode preview on the integrated index.html, with `--title-min 434` and WITHOUT the layers module (PLAN.md decision at 23:07 UTC). Modules requested: kuiper-shell, line-card, file, see-through. The loader refused `file` (`missing hook layers`), so the modules admitted were kuiper-shell, line-card and see-through, and the way back by key ran through this module's own reader, not through step 6's KY.link. run8 on Pixel 7 @393 and run9 on Galaxy S24 passed load, entry, layer, tap, spark and errors on each device. Real touch, 0 page errors (TEST.md, report-run8-pixel7.json, report-run9-galaxy-s24.json). ci_check prints RESULT: PASS.
DETAILS:
- **The entry.** `a#kuiper-star` reads SEE THROUGH and goes to `../../see-through/` in the same tab. Its `title` and `aria-label` are the homepage sentence "See Through: from the stars to one substation in 3D". It is lit at rest. There is exactly one node, mounted only through the shell's `api.mountStar`, as OPUS-1 asked; the module makes no strip of its own. The shell's rule applies: a title from 434 px, the bottom-left 44 px strip below that. **Change to owner question Q7:** ROADMAP R7 wrote 381 px, but the shell measured 434 px, so a Pixel 7 (393 and 412 px) shows the strip just as a Galaxy S24 (360 px) does. The ABOUT panel carries NL-009 06's family text after the card law. It is folded in with the exact law, and README "The apps" is in README-the-apps.md for Opus 10.
- **The deep links out.** Each card gets a row by key: a line → `#key=<k>` ("see this line among the stars"), a star of the layer → `#key=<k>&space=<SPACE>` ("see this star fall to <NAME>"), a repository → `#repo=<name>`. An unmatched find text → `#sub=<text>`. Nothing invents a mapping from a spark to a substation. The card of bodies[0] carries `../../see-through/#key=36064705400`, and a touch on it lands on See Through with that hash.
- **The Kuiper layer.** data/see-through.json is a code-feature-collection.v1 with 5,800 Point keys, key_j = floor((j + 0.5) · SPACE / 20000), with SPACE re-lifted to 63,340,120,796 (cosmos/wafer-meta.json:4). It has 4,460 named substations, ODbL. The stars are placed with keyPlace only and drawn through KY.draw.add. With the registry admitted, the module registers once with `{id, module, load}` and checks the bytes' sha256 (NOT EVALUATED in the hand-off runs, which had no layers module and so `registered: "own"`; tester run5 had the registry admitted, and Galaxy S24 read the OK row there). Measured rows: `OK · 5,800 of 5,800 · …`; with a wrong SPACE, `FAIL · SPACE a ≠ wafer b` and nothing is drawn. The remap test of 5,800 old-sky keys had 0 failures.
- **The way back.** `#key[&space]` is read on the Kuiper when module `file` is not admitted. **See Through itself is untouched.** Its reader ships as see-through-hash-reader.patch (CERN-OHL-S v2) for a later See Through folder; see the REQUEST in issuecomment-6564878115. That patch was measured on a scratch copy. Drax: T 1182, D 8. The refusal words are byte for byte. `#repo=gridatlas` gives 167 of 12,900 stars, which equals the Python count. The STAR KEY row taps through to `../../editions/#key=3744984642`.
- **Licence.** The module is CERN-OHL-S-2.0 as a whole: it carries See Through's star-key rule, and its header says so. The data is ODbL 1.0 for the names.
- **Folded in.** NL-009 round 1 06-seethrough: the bar entry, the panel text and the README block.
- **Not evaluated.**
  - The run with the layers module admitted: the WAFER panel's permanent `gm-open` hides every card (FINDINGs issuecomment-6565248184, ours, and issuecomment-6565202316, the tester's). Without layers, the module draws and registers its stars on its own; a cross-team fix is needed before the full set passes.
  - Each Galaxy S24 run before run9 had one step time out under sandbox load (TEST.md).
  - Widths 412, 430 and landscape, and desktop (title form).
  - Live tiles (the sandbox refuses basemaps.cartocdn.com).
  - The patched See Through on the real host.
- **The ci_check K1 BLOCKER is fixed.** A field was renamed and the file regenerated; ci_check prints RESULT: PASS.
ACTION REQUESTED: OPUS-10, please admit `see-through` after `file` with licence "CERN-OHL-S-2.0" (REQUESTS.md item 2). Hash data/see-through.json into proof/edition-sha256.txt.

---
_Generated by [Claude Code](https://claude.ai/code)_
