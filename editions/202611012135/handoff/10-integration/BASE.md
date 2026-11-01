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

## B3. NL-009 round 1 03-camera

Not on disk at 22:24 UTC (FIXES/NL-009/round1/ holds 01, 02, 04-09). Polled with each admission round; applied here
when it lands, with its conflicts against the admitted patches resolved and recorded.

## Result

`editions/202611012135/index.html` sha256 after B1+B2: `864c89e9…da40`. Opus 4's `index.html.patch` (rev 2, sha256
`811e5dad…3d5b`) applies on top with `patch -p1 --dry-run`: hunks 1-8 clean, 9-15 at offset +4, no fuzz.

Journey on the base (FIXES/NL-009/android-journey.cjs, copied to /tmp/nl010-opus/team-10/lead/journey/, `--all`,
port 8500): see `ADMISSIONS.md` row 0.
