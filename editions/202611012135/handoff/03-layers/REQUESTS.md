# Opus team 3 (step 3, the layer registry) — what we need from other teams

Each item is also a REQUEST on issue #10. Keys: kuiper-belt@96736f5 editions/202611012135/index.html (IX).

1. **Opus 10 (integrator): apply our index.html deletions after team 4's patch.** Use
   `handoff/03-layers/index.html.after-04-loader.patch` (`patch -p1`) on top of `handoff/04-loader/index.html.patch`;
   `index.html.patch` is the same deletion against the bare Edition 4 copy. Pure deletions: the only `+` lines are IX:219
   without `loadEdition();` and IX:710 without `lines: linesPanel, `. Deleted: IX:70-75 (LINES CSS), IX:620-680
   (loadEdition, edScreen, drawEdition, the draw wrap, edCard and its card listener, edFly), IX:682-692 (edNext, the
   spark pointerup, e/E), IX:705-709 (the LINES panel), IX:718, IX:727-749 (ly* switches, fillLines, two wraps).
   `esc` (IX:681) stays: it is hook 14. Team 4's NL-009 04/09 edits inside those lines (row role=button, Enter/Space,
   card aria, `.ct` button, stopImmediatePropagation, the tapUp guard) are carried into the module.
   modules.json record: `handoff/03-layers/MODULE.json` (requires = the module's REQUIRES, 25 names, all in KY.names).
2. **Opus 1 (shell): stop requiring Edition 4's `#lines #lyAll #lyFocus #lyFind`** (kuiper-shell.js header C8 and
   fillPanels: `document.getElementById('lyFocus').closest('label')` throws once our patch lands). The layers module
   mounts `#layers` (7 original `input[data-ky-layer]`, the lines controls `#lyFocus #lyFind #lyClear #lycount
   #lineslist`) inside your `.gm-group[data-group="layers"]` when it exists (it is admitted after you). SCOPE's focus
   and EDIT's filter should be proxies: `KY.modules.layers.api.value('lines', {focus:true})`, `value('lines',{query})`,
   reading `api.get('lines')`. To close the panel on a row pick we call your api's `close()` (`KY.modules['kuiper-shell'].api`, else
   `window.__KUIPER_SHELL__`); please keep that name.
3. **Opus 2 (card): `index.patch` edits edCard/fillLines (IX:655-667, :736-743), which our patch deletes.** The layers
   module calls `KY.modules['line-card'].api.show(body, {index, of, onclose})` and `api.row(body, i, cls)` when your
   module is admitted (it is earlier in order), and falls back to the Edition 4 card otherwise. Your `row()` HTML is
   wrapped by us in `<div class="ln" data-i role=button tabindex=0>`; please do not emit your own `data-i`.
4. **Opus 4 (hook table): `cam.atHome` setter.** Edition 4's edFly wrote `atHome = false` (IX:679) before `flyTo`; a
   module cannot, so after a spark fly a resize re-homes the camera (IX:248). Requested: `KY.cam.atHome` set, or a
   `flyTo` hook that clears it (IX:253, :245).
5. **Opus 9/10 (pointer law, step 9 9.2): forward `location.search + location.hash`** in `editions/index.html` (IX
   pointer :12 forwards only the hash). Our writer writes only the hash (R3), so `#layers=` survives the pointer
   today; `?layers=` through the pointer passes only after this fix. Test 6 measures both; the query spelling through
   the pointer is DISCLOSED until then.
6. **Opus 5 (See Through) and Opus 7 (apps): register into the records already listed.** `data/layers.json` holds
   `see-through` (module `202611012141-see-through.js`), `elements` and `spider` (module `apps`). Call
   `KY.modules.layers.api.register({id, module:'<your id>', draw(o2, KY), load(KY) -> Promise<{placed,total,why}>})`,
   or give the record a `source.file` in `code-feature-collection.v1` (Points with `key`, LineStrings with `keys`) and
   we load, hash and draw it. Send the record change as a REQUEST to us; we run `tools/build_layers.py`. `elements`
   stays `REFUSED · licence unsettled` until the owner answers Q1, whatever registers.
7. **Opus 9 (edition_check): extend E2/E6 to `data/*.json`** with `python3 tools/build_layers.py --edition <stamp>
   --check` (exit 1 on any hash, byte or feature difference, a colour outside PALETTE.md, a key outside SPACE).
