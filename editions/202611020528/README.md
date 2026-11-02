# Kuiper Edition 8 (202611020528)

**Version:** Kuiper Edition 8 · cut stamp 202611020528 (UTC) · published 2 November 2026 as the owner's overnight small step ("use your initiative and ship builds").

## What changed from Edition 7

Edition 7 is `../202611020446/`. Edition 8 is the same page, keys and modules with one module added: the drift
(`modules/202611020240-drift.js`, sha256 `f03b78350694362f0d0203647231c9809661a0aac7392f6fd776f519ce391480`, Opus team 8,
NL-010 step 8), with its data `data/drift.json`.

- The drift asks of every line this edition quotes: is it still at the head of its repository? Each line is SAME,
  MOVED (now at another line), GONE, FILE_GONE or UNVERIFIED, and the counts and the list sit in one collapsed DRIFT
  row under LINES. A tap opens the counts, the five class filters and the list.
- At this cut: 346 lines, 309 SAME, 7 MOVED, 2 GONE, 0 FILE_GONE, 28 UNVERIFIED (one repository has no clone on the
  cutting machine, so its 22 lines are UNVERIFIED, never SAME). Share SAME: 309 of 318.
- The data was made by `tools/drift.py --heads` with the heads the night controller recorded when it tested the
  module, so it is the tested data with this edition's stamp: every field but `edition`, `cut_at` and the keys path is
  equal.

Admitted, in order: `hello`, `kuiper-shell`, `line-card`, `drift` (`modules.json`). The page's edition stamp and
labels were changed to Edition 8; nothing else in `index.html` changed.

Measured before release: the night controller's green row E6-G2 (branch edition/202611012135 commit 553e58d7, whose
`index.html` and `modules.json` hash to e6d6f8ed… and 114f3655…): journey-6, Pixel 7 16/16 and Galaxy S24 16/16; the
drift's own test 57/57 on both phones, 0 errors (neural-link #10 comment 6568883224).

Coming as later small steps: the app launcher (passed the journey on both phones, waits for its tester's ruling), the
layers registry (refused at 04:24Z), the File menu (waits on layers) and See Through's star layer.

## The card law

Every card opens with the line of code itself, verbatim from its key; the key is the second row (Edition 5).

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to. The VENTUS mark is used by Ventus Ltd, its owner; the Apache-2.0 licence of this code does not license the
mark (wording pending the owner's confirmation). Illustrative only: not a design study. Provided as is, without warranty.
