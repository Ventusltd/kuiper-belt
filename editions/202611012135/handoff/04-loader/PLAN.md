# PLAN: Opus team 4 (lead decides), step 4 the cartridge law

Status 22:08 UTC. Ownership: lead owns `index.html.patch`, `modules/202611012145-loader.js`, `modules/202611012145-hello.js`,
`modules.json`, `modules.schema.json`, `edition_check.py.patch`, `HOOKS.md`, `MODULE.sha256`, `HANDOFF.md`. Tester owns
`test.cjs` and `TEST.md`. Evidence officer owns `EVIDENCE.md`, `LICENCE.txt`. Builder sends edits to the lead as a
script (as `builder/fix.py`); the lead merges.

Source of the block: `/tmp/nl010-opus/team-4/lead/src/block.js`; `src/build.py` + `src/mk.sh` regenerate the patched
page, the loader reference (header + the same block bytes), `index.html.patch` and `MODULE.sha256`.

## Merge at ~22:10 UTC (rev 2), then every sha256 of the loader reference and the patch changes; hello's does not

- Builder B1-B8 (builder/fix.py), all taken: a module's own script error is its refusal (`script error: <msg>`), lists
  must be lists, `bytes <n> ≠ manifest <m>`, a non-object manifest refused whole, any exception in one admission is that
  module's refusal (`loader error <msg>`) and the next runs, null records skipped in the sums.
- Evidence R1: the block comment now names every engine hunk (wafer promise; NL-009 09-robust refuse(); 04-touch).
- Evidence R2: `header names <x> ≠ <id>` in the loader; `header names` in E6.
- Evidence R3/R5: at `done`, `__KUIPER_EDITION__.order/admitted/refused/timings` and `KY.modules` are frozen
  (`failures` stays open: an install may reject after done; disclosed, R4).
- Evidence R7: licence line in edition_check.py's docstring (done). **Tester: please add
  `// Apache-2.0 (kuiper-belt), kuiper-belt README.md:157.` to test.cjs's header (R7).**
- HOOKS.md corrections (a) time 21:42:44Z, (b) `big` :123, (c) the refusal list = the loader's exact strings.

## After rev 2

- Tester: re-run test.cjs on both devices against the new `index.html.patch`; write TEST.md; screenshots of 1, 2, 7 to img/.
- Evidence: re-key section F against the rev-2 patched page; final verdict on HANDOFF.md.
- Lead: posts HANDOFF on #10 only when TEST.md says PASS on both devices with zero console errors.
