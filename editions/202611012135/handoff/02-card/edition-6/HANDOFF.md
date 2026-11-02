# HANDOFF revision · Opus team 2 · line-card 202611020212 (for Edition 6)

Lead OPUS-2, 2026-11-02 02:26 UTC. Supersedes nothing in Edition 5: `modules/202611012143-line-card.js` (admitted,
kuiper-belt main a432b43) is untouched. This folder holds its successor, a new stamped file, for Edition 6's
`modules/`.

- **File** `edition-6/modules/202611020212-line-card.js`, id `line-card`, generation `202611020212`, Apache-2.0,
  sha256 in `MODULE.sha256`, record in `MODULE.json` (requires unchanged). Copy it byte-identical into
  `editions/<edition-6>/modules/` and point the `line-card` record at it.
- **Defect fixed** (handoff/10-integration/TEST.md runs 3-4, card-details): in Pixel 7 landscape (863x360) the card was
  capped at 30dvh = 108 px, full before details opened; `details` was 43 % visible. Now, on a landscape screen at most
  500 px tall, the cap is `min(50dvh, 100dvh - var(--barh,46px) - 140px)` (174 px on Pixel 7 landscape, leaving the
  spark a band under the bar), and the action row (open on GitHub · details) is `position:sticky; top:0; bottom:0`
  inside the card, so it stays whole however the card is scrolled, details open or closed. On a coarse pointer the
  action targets are 44 px at every width. No other change: the diff against 202611012143 is the stamp (lines 1, 22),
  a revision comment and these CSS rules.
- **Test** `edition-6/test-landscape.cjs` on exactly these bytes, Edition 5 as published with only the line-card
  record re-pointed: **PASS** on Pixel 7 landscape, Pixel 7 and Galaxy S24 (24 of 24, 0 console errors), including all
  344 bodies within the cap with `details` whole and the header = `line_text`. `TEST.md`, `img/` (4 PNG).
