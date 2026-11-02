# BASE.md: what the integrator did to the base `index.html` (Opus team 10, NL-010 step 10)

Lead OPUS-10. Base: kuiper-belt@96736f5 `editions/202611012135/index.html` (the Edition 4 copy with the six
`EDITION 4` → `EDITION 5` words; sha256 `585e4cf5…b76e`). Every change below is listed with its source and the
measurement that decided it. No module is admitted by this file; admissions are in `ADMISSIONS.md`.

## B1. NL-009 round 1 07-perf, applied 2026-11-01 22:18 UTC

Source: neural-link FIXES/NL-009/round1/07-perf.patch (written against `editions/202611012027/index.html`; the path
was rewritten to `editions/202611012135/` and the patch applied with `patch -p1`, both hunks clean, no fuzz).

- Hunk 1 (finding 2, MINOR): `#lineslist .ln` gets `content-visibility:auto; contain-intrinsic-size:auto 44px`.
  Taken unchanged.
- Hunk 2 (finding 1, MAJOR): `loadEdition` reads `keys-min.json`, falling back to `keys.json`. Taken, with one
  **conflict resolved**: 07's generator keeps 15 fields and drops `line_text`; the card law (ROADMAP step 2, L11; Opus 2's
  `modules/202611012143-line-card.js:77,93` and Opus 3's `modules/202611012141-layers.js:382,396`) makes `line_text` the
  header of every card, verbatim, for all 344 placed bodies, and refuses with "no text at key" when it is missing. The
  one record that makes `keys.json` heavy (`kuiper-belt estate-network.json:1`, `line_text` 1,240,449 characters) is
  placed (`on_wafer` and `verified` true, key 63,013,167,769), so dropping or clipping it would break the law for that
  card. **Chosen: the law.** `tools/edition_min.py` keeps 07's 15 fields plus `line_text` and `quote_check` (read by
  the card's "register quote" row): 17 fields.
  - Measured: `keys-min.json` 1,558,451 bytes against `keys.json` 1,709,129 (−150,678 bytes, −8.8 %), not 07's
    232,859. `python3 tools/edition_min.py editions/202611012135 --check` → `keys-min.json matches keys.json`.
  - The page comment written by 07 (it said "233 kB") was corrected to the measured number, and says why.
  - `keys.json` is unchanged (E5: byte-identical to Edition 4's, sha256 `1c293c33…242b`).
- The generator is `tools/edition_min.py` (sha256 `43a38f72…ce6a`), 07's `07-perf-edition_min.py` (byte-identical to
  the block in 07-perf.md) with the FIELDS change above and one docstring sentence. **Scope note:** `tools/` is
  outside team 10's "may touch" column of the Opus table; it was added on the harness's explicit instruction for this
  role ("plus tools/edition_min.py … run in the new folder to create keys-min.json") and is named here so team 9
  (`edition_check.py`) and the owner can see it. `keys-min.json` goes into `proof/edition-sha256.txt`.
- **Forward conflict, recorded now:** Opus 3's layer registry moves the keys loader into its module and reads
  `keys.json` itself, hash-checked against `data/layers.json` (`source.file "keys.json"`, sha256 `1c293c33…`), and its
  deletion patch removes `loadEdition` and the `#lineslist` CSS. When Opus 3 is admitted, 07's two hunks leave the page
  with that code, and `keys-min.json` is loaded by nothing unless the `lines` record names it. A REQUEST to Opus 3 asks
  for the record to name `keys-min.json` (346 features, its own sha256) and for the module's list CSS to keep
  `content-visibility:auto`. Until that lands, 07 finding 1 is folded in at the base and undone by step 3; the README
  says so.

## B2. Stale readout stamp

`hud.textContent += '\nEDITION 2 · '` (base :650, Opus 4 REQUESTS.md item 2 / evidence H3) → `EDITION 5 · `. One word.

## B3. NL-009 round 1 03-camera, applied 2026-11-01 22:33 UTC

Source: neural-link FIXES/NL-009/round1/03-camera.md, the diff block of its PATCH section (64 lines, written against
`editions/202611012027/index.html`; path rewritten to `editions/202611012135/`, applied with `patch -p0` from the
kuiper-belt root): one hunk, clean at offset +4 (07-perf's three lines and B1's extra comment line). The extracted
module script passes `node --check`.

- What it changes (03 findings 1-5): `edFly` becomes `edBand`/`edAim`/`edFly`/`edKeep`: the spark is aimed into the
  band under the bar and every open `.gm-open` panel and above the card, aimed again on the next frame, kept in the
  band by a `ResizeObserver` on the card and on `resize`; the fly is 300-900 ms by distance, instant under
  `prefers-reduced-motion`. The edition's `pointerup` hit test: 24 px reach for a finger (48 dp), 9 px for a mouse,
  nearest spark, only for a pointer that went down on the canvas (`e.target === cv`), within 10 px of where it went
  down, never on a layer that is off (`visibleLine`).
- **Behaviour the integrator keeps as written:** a pick closes an open panel **only when under 96 px of band would be
  left** (`ED_MINBAND = 96`): the 62 vh LINES/EDITION panels on a phone and any panel in landscape close; the 183 px
  EDITION panel in portrait stays open with the spark centred under it. 03 finding 6 (zoom 14 stays) and 7 (fly
  frames, UNVERIFIED on hardware) change nothing.
- **Conflict with Opus 4's patch (NL-009 04-touch), resolved at Opus 4's admission:** 04-touch's hunk 12 rewrites the
  same `pointerup` guard (`moved >= 4` → `!tapUp`) and no longer applies (measured: `patch --dry-run` hunk 12 FAILED,
  hunk 11 at fuzz 2, the rest clean at +4/+37). 04-touch makes the engine's `tapUp` the one verdict of "tap or drag"
  (movement under a 10 px touch slop from the down point, and for touch a press under 700 ms, so a long press is not
  a tap); 03 says "a slow press is still a tap". **Chosen: 03's guard plus `tapUp`** (`!d || d.id !== e.pointerId ||
  e.target !== cv || !tapUp || …`), so the engine's tap (the record card) and the edition's tap (the line card)
  agree on every press: a long press opens neither. 03's wobble case (path 8 px, net 0) stays a tap, because 04-touch
  measures `moved` as the largest distance from the down point, not the path. Hunk 11's trailing context is the old
  comment 03 replaced; the hunk's own lines (`.ct` `aria-expanded`, `stopImmediatePropagation`) apply unchanged.
- **Forward conflict:** Opus 3's deletion patch removes `edFly`, the edition `pointerup` and the `e`/`E` keys from the
  page and moves them into `modules/202611012141-layers.js` (its "9 px tap hit-test only on the canvas", 05-lines #9).
  A REQUEST to Opus 3 asks for 03's band, re-aim, keeper, 24 px touch reach and the 96 px panel rule in the module, so
  step 3 does not undo 03; at its admission the journey's `lines-pick`, `key-e-*` and `spark-tap` steps measure it.

## Result

`editions/202611012135/index.html` sha256 after B1+B2: `864c89e9…da40`; after B3: `390b15ae…3ae5`. Opus 4's
`index.html.patch` (rev 2, sha256 `811e5dad…3d5b`) on top: hunks 1-11 apply (11 at fuzz 2), 12 fails as described in
B3 and is applied by hand, 13-15 at offset +37.

Journey on the base (FIXES/NL-009/android-journey.cjs, copied to /tmp/nl010-opus/team-10/lead/journey/, `--all`,
port 8500): see `ADMISSIONS.md` row 0.
