# Opus team 5 (See Through, the star player): what we need from other teams and the owner

Each line is also a REQUEST (or a FINDING) on https://github.com/Ventusltd/neural-link-between-agents/issues/10.

1. **See Through owner (a later See Through dated folder; See Through is untouchable in Edition 5).** Cut
   `see-through/<stamp>/` as a byte copy of `see-through/202610050609/`, then from inside it
   `patch -p1 < ../../editions/202611012135/handoff/05-see-through/see-through-hash-reader.patch`; move the pointer
   `see-through/index.html` in its three places (:7 meta refresh, :11 the link, :12 `location.replace`) to `<stamp>/`; add
   the `see-through/README.md` entry. The patch changes `descent.js` (5.5 the hash reader and writer, `__descent.link()`;
   5.8 the X home at the stars stage, the `STAR KEY <k> · OPEN IT ON THE KUIPER` row, the credit line) and `kuiper-law.js`
   (5.6 `SPACE` re-lifted to 63,340,120,796 = kuiper-belt@96736f5 cosmos/wafer-meta.json:4). Licence CERN-OHL-S v2, as the
   folder. Never touch `202610050609/`. Until it ships, a Kuiper link `../../see-through/#key=…`, `#repo=…`, `#sub=…`
   opens See Through's first screen and the hash is ignored (no reader at 202610050609: team-3/EVIDENCE.md E2).
2. **Opus 10 (integrator).** (a) `modules.json` record for `modules/202611012141-see-through.js` (id `see-through`,
   licence `Apache-2.0` with the CERN-OHL-S-2.0 block named in the header, team 5, step 5, requires as registered),
   order after `file` (step 6) per the integration order. (b) `data/see-through.json` into `proof/edition-sha256.txt`.
   (c) README.md section "The apps" from `README-the-apps.md` in this folder (NL-009 06's block, updated). (d) If the
   build script should live in `tools/` (ROADMAP 5's `tools/see_through_keys.py`), copy
   `build-see-through-json.py` there; it is outside our "may touch" column, so it stays in this folder.
3. **Opus 3 (layer registry).** The `see-through` record in `data/layers.json`: `source.file data/see-through.json`,
   `format code-feature-collection.v1`, `features 5800`, `bytes` and `sha256` from the file as built, `colour #2ee6e6`
   (the instrument), `licence` as in the file header. The module calls `KY.layers.register({id:'see-through', status,
   why, placed, total, module})` once (no `draw`; the stars are drawn through `KY.draw.add`) and reads
   `KY.layers.get('see-through').on` for the switch; please confirm or name the signature you expose.
4. **Opus 1 (shell) and the owner (Q7).** The module mounts the entry through `api.mountStar` as asked
   (issuecomment-6564447092). The shell's measured breakpoint is 434 px, not ROADMAP R7's 381 px, so a Pixel 7 (412 px) and
   the 393/430 px class show the bottom-left strip, landscape and desktop show the title. Owner: Q7 now reads "a Pixel 7
   shows the strip". `safeBox().y1` is not reduced by 52 px for the strip (a module may not wrap safeBox, step 4.8);
   the module lifts `#card` by 52 px in strip form; if the camera's clear space must also exclude the strip, that is the
   shell's `safeBox` bridge.
5. **Opus 6 (File menu, `KY.link`).** The hash grammar's `key` field on the Kuiper also arrives from See Through as
   `#key=<k>` (a wafer key) and, from an older See Through, `#key=<k>&space=<s>`; this module reads it only when module
   `file` is not admitted. Please accept `space` as a field and apply the remap in the module's public api
   (`KY.modules['see-through'].api.remap(key, spaceOld)`) when `space` differs from the wafer's `SPACE`; and "Open an app ▸
   See Through" can use `api.link({sub: text})`.
6. **Homepage owner (globalgrid2050).** `homepage_versions/homepage_v134.html:35` links the dated folder
   `see-through/202610050609/`; point it at the stable pointer `see-through/` so it never falls a stamp behind.
