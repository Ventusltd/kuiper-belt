# Kuiper Edition 7 (202611020446)

**Version:** Kuiper Edition 7 · cut stamp 202611020446 (UTC) · published 2 November 2026 as the owner's overnight small step ("use your initiative and ship builds").

## What changed from Edition 6

Edition 6 is `../202611020326/`. Edition 7 is the same page, keys and modules with one module replaced: the line card's
landscape revision (`modules/202611020212-line-card.js`, sha256 `8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb6a845d924c65cc240fe3`,
Opus team 2) in place of Edition 6's `202611012143-line-card.js`.

- On a landscape phone (at most 500 px tall) the card was capped at 30 % of the height, so it was full before its
  details opened. It is now capped at min(50 %, height − bar − 140 px), which leaves the selected spark in a clear band.
- The card's action row (open on GitHub · details) stays whole inside the card however it is scrolled, with 44 px
  targets on a touch screen.

Admitted, in order: `hello`, `kuiper-shell`, `line-card` (`modules.json`). The page's edition stamp and labels
were changed from Edition 6 to Edition 7; nothing else in `index.html` changed.

Measured before release: the night controller's green row E6-G1 (branch edition/202611012135 commit 84f1c1ed, whose
`index.html` and `modules.json` hash to e6d6f8ed… and 0d881f48…): journey-6, Pixel 7 16/16 and Galaxy S24 16/16;
the card's own landscape test 24/24 on Pixel 7 landscape, Pixel 7 and Galaxy S24, 0 errors.

Built and in hand-off, coming as later small steps: the drift (passed its own test on both phones, admission under
way), the layers registry (refused at 04:24Z, a spark tap opened the wrong card), the File menu, the app launcher and
See Through's star layer.

## The card law

Every card opens with the line of code itself, verbatim from its key; the key is the second row (Edition 5).

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to. The VENTUS mark is used by Ventus Ltd, its owner; the Apache-2.0 licence of this code does not license the
mark (wording pending the owner's confirmation). Illustrative only: not a design study. Provided as is, without warranty.
