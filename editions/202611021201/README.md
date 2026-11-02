# Kuiper Edition 12 (202611021201)

**Version:** Kuiper Edition 12 · cut stamp 202611021201 (UTC) · published 2 November 2026 as the owner's small step ("finalise all work"; "I want See Through to be the star player").

## What changed from Edition 11

Edition 11 is `../202611021017/`. Edition 12 is the same page, keys and modules with one module added: See Through, the
star player (`modules/202611021026-see-through.js`, Opus team 5, NL-010 roadmap step 5), with its data
`data/see-through.json`.

- The layers registry's "See Through stars" row now reads OK · 5,800 of 5,800. Switched on, it draws See Through's 5,800
  stars on the wafer in cyan: star j carries key floor((j + 0.5) × SPACE / 20000), the star-key rule of See Through
  202611020012, so each star lands where See Through places the substation it stands for.
- A tap on a star shows one chip under the bar with the substation's name and a link into See Through at that star
  (same tab, through the stable pointer). The bar's See Through entry still opens the app.
- The module writes nothing into the line card (its first revision was refused for filling the card).
- Substation names are © OpenStreetMap contributors, ODbL 1.0.

Admitted, in order: `hello`, `kuiper-shell`, `line-card`, `drift`, `apps`, `layers`, `file`, `see-through`.

Re-seal at the cut. The module is sealed to its edition: it refuses data cut for another edition and checks the data's
sha256 before parsing. So at this cut `data/see-through.json` was rebuilt for stamp 202611021201 with the team's own builder
(only its edition and provenance fields differ from the admitted data), and the module's two constants EDITION and
DATA (bytes, sha256) were set to match; nothing else in the module changed (diff in the release post). Its record in
`modules.json` carries the new sha256 values. The page's stamp and labels were changed to Edition 12; `data/layers.json`,
`data/editions.json` and `data/drift.json` were regenerated for the stamp.

Measured before release: the independent controller's green row E11-G1 (FABLE-FIN-2 as OPUS-CONTROLLER-5, branch
edition/202611012135 commit a7501673, whose `index.html` and `modules.json` hash to 21593a6a… and 5123fd41…):
journey-6, Pixel 7 16/16 and Galaxy S24 16/16, the same as Edition 11 alone; eight modules admitted, none refused,
0 page errors; the stars row OK · 5,800 of 5,800, nothing off-origin (neural-link #10 comments 6575833768 and 6576597543).
The re-sealed folder as published was run through the same journey on both phones before release.

Known limit: the stars are cut against the wafer's address space SPACE = 63,777,293,432. When the engine grows the wafer,
this edition's row will read FAIL with both numbers rather than draw stars in the wrong places; the next edition re-cuts.

## The card law

Every card opens with the line of code itself, verbatim from its key; the key is the second row (Edition 5).

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to, and every app row and layer carries the licence read from its own source; substation names ODbL 1.0
(© OpenStreetMap contributors). The VENTUS mark is used by Ventus Ltd, its owner; the Apache-2.0 licence of this code
does not license the mark (wording pending the owner's confirmation). Illustrative only: not a design study. Provided as
is, without warranty.
