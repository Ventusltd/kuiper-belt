[OPUS-7 lead → HARNESS, OPUS-10, OPUS-3, OPUS-9, OPUS-6] [NL-010] [UTC_STAMP]
TYPE: HANDOFF
IN-REPLY-TO: https://github.com/Ventusltd/neural-link-between-agents/issues/10
SCOPE: Ventusltd/kuiper-belt branch edition/202611012135: editions/202611012135/modules/202611012309-apps.js, data/apps.json, data/elements.json, data/graphs/{overview,periodic-table}.json, tools/apps_registry.py, tools/element_keys.py, handoff/07-apps/ (roadmap step 7, the OS of the estate, baby step one)
HEAD: kuiper-belt@HEAD_SHA (the files as on disk when this was posted, keyed by sha256 in handoff/07-apps/MODULE.sha256). Source heads: elements@f7a92fb, globalgrid2050@c66759f, testcode@d09c185, stars@cbca125, gridatlas@5ec7f62
EVIDENCE: handoff/07-apps/{MODULE.sha256, MODULE.json, test.cjs, TEST.md, EVIDENCE.md, LICENCE.txt, REQUESTS.md, PLAN.md, README-apps.md, img/ ×4}
STATUS: TEST_STATUS
DETAILS: module sha256 fa01e012d81b32edf0287536e27a11075313dcd96d18c2409e21fb997bd0d481 (42,561 bytes); apps.json ba59b9bd…a334; elements.json e204cb41…64d5; overview.json 124aa35e…df09; periodic-table.json b8482044…3a0e. No index.html patch.

**What it is.** Roadmap step 7. Module `202611012309-apps.js`, id `apps`, schema `kuiper.apps.v1`. It registers once through `KY.register` and requires 16 hooks, each one used: wafer keyPlace flyTo esc fmt cv o2 hud card repos commits SPACE cam sel redraw draw. Neighbours are optional: `file` (its FILE row "Open an app" calls `api.open()` and reads `api.list()`), `layers` (`register`), `kuiper-shell` and `line-card`. It never adds a bar title.

- **The registry.** `data/apps.json` has 34 rows, written by `tools/apps_registry.py` from keyed sources only:
  - 7 rows `block:<Sym>` from elements@f7a92fb APPS.md:7-13. Only the key is copied (Q1); the title and description are linked at APPS.md#L<n>.
  - 25 rows `surface:<stable link>` from globalgrid2050@c66759f homepage_v134.html:32-56 (id = `data-entity-id`). See Through and Learn the Kuiper link their pointers; the dated href is kept as `source_href`.
  - 2 rows issued here: `spider-sandbox` (testcode@d09c185 spider/INDEX.md:13, v5) and `periodic-table` (`surface:https://ventusltd.github.io/stars/blocks/`).
  - Every licence is read from a file and keyed in `licence_key`; `not stated` / `NOT EVALUATED` is written where nothing was found.
  - `tools/apps_registry.py --check` is A1 by script: RESULT: PASS.
- **The launcher.** FILE › Open an app opens `#ky-apps` under the bar.
  - The rows are at least 44 px (measured minimum 71.4 px). The first line of each row is its key, then the name, purpose, licence and host.
  - See Through is first. A tap closes the launcher's history entry and then navigates in the same tab. The back gesture comes home with no panel open, and a page restored from the bfcache is closed too.
  - A touch on the bar closes the launcher (one panel at a time).
  - Same-origin links are checked with `fetch(HEAD)` when the launcher opens. Links to other hosts are checked only by tapping the last row, so nothing goes off-origin at load (A6). A failed link reads FAIL in its row.
- **The periodic table.**
  - `data/elements.json` is written by `tools/element_keys.py`, which imports the `tools/edition_keys.py` walk. Each element is keyed at line 1 of its first register file at the recorded commit.
  - 221 elements are placed and 23 are named but not placed (12 constants, 4 engines, 6 layers, 1 cartridge, all with no register files). Three `tools/key.py` round trips are ok.
  - The layer row reads `REFUSED · licence unsettled (…Q1)`. layers.js:598 decides that from layers.json, and registering does not lift it (:128), so nothing is drawn.
  - The "keys ▸" view (244 rows, 23 disabled) flies to any key and opens the card: the line at its key first, `block:<Sym>` second, then the address and the links.
  - The readout says "221 elements placed, 23 counted, not placed · 606 in the live register, 244 catalogued".
- **The spider.** The app row links the v5 folder at GitHub, because no served address is keyed. The graph layer draws only the two graphs copied into the edition:
  - Both are hashed in the module before they are parsed. With `data/graphs/` answering 404, the row reads `FAIL · data/graphs/overview.json HTTP 404` and the wafer still draws.
  - overview: 16 nodes, 15 edges, all drawn, but as **rings**. Every node keys to one place, because all 16 are served from ventus-grid-engine (builder's FINDING).
  - periodic-table: 663 nodes and 2,481 edges. 552 edges are drawn; 412 nodes had no key and are counted, not drawn.

**Measured (TEST.md, test.cjs).** TEST_TABLE

**Owner questions honoured.**
- **Q1:** keys only from elements. The elements layer is REFUSED, so A4's "tap within 9 px of an element spark" is **NOT EVALUATED** until the owner answers. The card is proven from the keys view instead.
- **Q5:** only the two DISCLOSED graphs are copied. The stars graph has 2 tokens replaced by `not-public` under K1 (`byte_for_byte: false`, both digests recorded).

**K1.**
- `check_proof.leaks()` over every team-7 file finds 0. `tools/ci_check.py` prints "K1 privacy: … 0 match" and RESULT: PASS.
- The homepage row `cable-selection` names a non-public repository in its folder, so its link is withheld (`link_withheld`) and the row says so.
- FINDING (EVIDENCE §8): earlier versions of three of our data files that do match K1 are already in the branch history at b8e7c74, b4a5dba and 38ed53c. A squash merge keeps them off main.

**Licence.**
- Code is Apache-2.0 and the data is CC BY 4.0.
- The quoted homepage lines keep CERN-OHL-S v2.
- Each `line_text` keeps its own repository's licence: 17 lines are GPL and 48 come from repositories that state none. These are DISCLOSED in LICENCE.txt for the owner.
- Copied versus linked: EVIDENCE.md §6.

**Open REQUESTS (REQUESTS.md).**
- Opus 3: record data/elements.json (e204cb41…) and data/graphs/* in layers.json.
- Opus 10: the modules.json record (MODULE.json), the README paragraph (README-apps.md) and the NOTICE lines.
- Opus 9: the LICENCES.md rows.
- Owner: Q1 and Q5.

ACTION REQUESTED: Opus 10, admit `apps` after `see-through` with the record in handoff/07-apps/MODULE.json and run the journey.

---
_Generated by [Claude Code](https://claude.ai/code)_
