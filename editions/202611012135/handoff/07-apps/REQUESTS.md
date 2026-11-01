# Opus team 7 · step 7 · REQUESTS (what we need from other teams; lead OPUS-7, 23:28 UTC by date -u)

1. **Opus 3 (layers), data/layers.json via tools/build_layers.py.** The `elements` and `spider` records name
   `source.file: null` (owner "Opus team 7 writes …"). Our files now exist; please record them so step 3's test 9
   ("every data/*.json hashes to its layers.json record") holds: `elements` → `data/elements.json`; `spider` →
   `data/graphs/overview.json` and `data/graphs/periodic-table.json` (two files; if the record takes one, name
   overview and list the second in `source.also`). Keep `module_registers: true`: the apps module loads, hashes (the
   spider graphs by sha256 inside the module) and registers both through `KY.modules.layers.api.register({id, module:
   'apps', load, draw})`. Keep the `elements` licence `UNSETTLED: …` until the owner answers Q1: that is what makes the
   row read `REFUSED · licence unsettled` (layers.js:598), which this team must honour. `data/apps.json` is not a layer
   (a registry the launcher reads); please do not count it as an unrecorded layer file, or record it as `registry`.
2. **Opus 10 (integrator), modules.json.** Admit `apps` after `see-through` (order 7): path
   `modules/202611012309-apps.js`, generation `202611012309`, licence `Apache-2.0`, requires (16): wafer keyPlace flyTo
   esc fmt cv o2 hud card repos commits SPACE cam sel redraw draw, provides `apps`; sha256 and bytes in
   `handoff/07-apps/MODULE.sha256` / `MODULE.json`. No index.html patch. README: one paragraph (README-apps.md in this
   folder when written). NOTICE.md: the copied-versus-linked lines of LICENCE.txt (globalgrid2050 homepage purpose lines
   CERN-OHL-S v2 by key; the two spider graphs DISCLOSED; elements keys only, Q1).
3. **Opus 9 (register), LICENCES.md.** Take the rows of `handoff/07-apps/LICENCE.txt`; the periodic table `not stated`
   (Q1) and the stars graph `not stated` / DISCLOSED (Q5) go to the owner before PR A.
4. **Opus 6 (File).** Nothing to change: file.js:652-654 calls `KY.modules.apps.api.open()` and file.js:213-221 reads
   `api.list()` → `[{id, key, name, link, licence}]`; both are provided. Measured: the shell's back popstate from your
   `closePanel()` arrives after `open()`; the launcher waits for it (handled in our module).
5. **Owner, Q1 and Q5** (ROADMAP "Open questions"): until answered the elements layer stays REFUSED (keys computed,
   nothing drawn), and the two graphs are copied as DISCLOSED.
6. **FINDING for all: K1.** The homepage row `cable-selection` links a globalgrid2050.com folder whose name equals a
   repository that is not public (K1 digest, tools/ci_check.py:8); `data/apps.json` writes it as `not-public` with
   `link_withheld`, and the launcher shows "link withheld (K1)" instead of navigating. The same K1 rule replaced 2 tokens
   in the stars graph copy.
