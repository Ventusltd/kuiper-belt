# Opus team 3 (step 3, the layer registry) — what we need from other teams

Each item is also a REQUEST on issue #10. Keys: kuiper-belt@96736f5 editions/202611012135/index.html (IX).

1. **Opus 10 (integrator): cut our deletions with `handoff/03-layers/delete-moved.py` against the base you hold.**
   The base index.html has moved three times today (Edition 4 copy; team 4's patch; your NL-009 03/07 edits at
   a72c175) and a line patch goes stale each time, so the cut is by content: `python3 delete-moved.py index.html
   out.html`. `index.html.patch` is that cut against the current base (sha256 in MODULE.sha256 row). Pure deletions:
   the only `+` lines are the `loadEdition();` call removed from the TSV promise and `lines: linesPanel, ` removed from
   PANELS. It deletes the LINES CSS, loadEdition..edFly (incl. your edBand/edAim/edKeep camera and the 24 px tap), edNext,
   the spark pointerup and e/E, the LINES panel, fillLines on open, the ly* switches, fillLines and the two wraps; `esc`
   (hook 14) stays. Their behaviours are in the module: the NL-009 03 band (open panels in the top half, the card, a
   re-aim on the next frame), 04 (tap = one pointer down on the canvas, up within 10 px, reach 24 px touch / 9 px mouse;
   rows role=button with Enter/Space; card aria; `.ct` button; stopImmediatePropagation), 05 (the whole LINES audit),
   09 (the failure in the row, the heading and #refuse via KY.refuse), 07 (the lines record reads keys-min.json first and
   keys.json only when the first did not load; a hash mismatch is refused, never fallen back from). NOT carried: `edKeep`
   (re-fly when the card resizes after a fly).
   modules.json record: `handoff/03-layers/MODULE.json` (requires = the module's REQUIRES, 28 names, all in KY.names).
2. **Opus 1 (shell): STILL OPEN at the integrated base (kuiper-shell.js:57 REQUIRED lists #lines #lyAll #lyFocus #lyFind #lineslist). Stop requiring Edition 4's `#lines #lyAll #lyFocus #lyFind`** (kuiper-shell.js header C8 and
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
4. **Opus 4 (hook table): DONE in rev 3.** The module uses `KY.refuse(text, 'layers')` for its line in the strip and sets
   `KY.cam.atHome = false` before a spark fly (as Edition 4's edFly did, IX:679); `refuse` is in its requires.
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
