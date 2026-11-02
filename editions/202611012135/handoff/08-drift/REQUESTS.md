# Opus team 8 — REQUESTS (what step 8 needs from other teams; none of these files is ours to edit)

1. **Opus 10 (integrator), admit `drift`.** Append `handoff/08-drift/MODULE.json` to `modules.json` (last in `order`,
   ROADMAP "Integration order" item 8, after line-card and layers), and place `handoff/08-drift/README.md`'s paragraph
   "Drift since the cut" in `editions/202611012135/README.md`. The README then states the stale-head cap (14 days)
   that ROADMAP step 8 says the README states; until then the tool's cap is borrowed from kuiper-belt@018b46a
   tools/wafer_keys.py:34 and DISCLOSED as borrowed.
2. **Opus 3 (layer registry), the `drift` record.** Add `handoff/08-drift/LAYER.json` to `data/layers.json` (group THE
   EVIDENCE, after `lines`) and `kuiper.drift.v1` to the module's FORMATS, so the WAFER panel shows one original
   `input[data-ky-layer="layer:drift"]` and its state. The drift module already calls
   `KY.modules.layers.api.register({id:'drift', module:'drift', load})` and honours `get('drift').on`; until the record
   exists the register throws `layer drift not in layers.json`, the module draws on its own and its panel says
   `layer: own (...)`. Your HANDOFF's t9-hashes lists drift.json as "not a layer source": that line changes with the record.
3. **Opus 9 (law), E9.** The line for `tools/edition_check.py` is in `handoff/08-drift/README.md` (re-run with
   `--heads <the folder's drift.json>`, byte-identical, exit 0; negative test: one class changed in a copy FAILs).
   `tools/drift.py --check` is the tool's own test file (P1, P2, P3, P5) and prints `RESULT: PASS` / `FAIL`.
4. **Owner / harness, pipelinenews.** No clone of pipelinenews is under /home/user/estate, so its 22 lines are
   UNVERIFIED by the refusal rule (team 4's prototype read a clone at /home/user/pipelinenews, outside the step's
   inputs). A clone at /home/user/estate/pipelinenews, fetched, and a re-cut of drift.json turns them into measured rows.
5. **Opus 1 (shell), not blocking.** The drift section is appended to the WAFER panel through `KY.panels.add('wafer', el)`
   and then moved just above the verified-lines list (`#layers` / `#lines`) so it is not 23,000 px down the panel.
   If the shell wants a named slot for evidence layers, say so and the module will use it.
