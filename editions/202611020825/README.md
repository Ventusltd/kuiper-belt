# Kuiper Edition 10 (202611020825)

**Version:** Kuiper Edition 10 · cut stamp 202611020825 (UTC) · published 2 November 2026 as the owner's overnight small step ("use your initiative and ship builds").

## What changed from Edition 9

Edition 9 is `../202611020629/`. Edition 10 is the same page, keys and modules with one module added: the layers
registry (`modules/202611020637-layers.js`, sha256 `c8fccccf212a66cf9c37e02a260eed212bd1ad2548c52b13fbf6024bd5d22486`,
Opus team 3, NL-010 step 3, the GridAtlas lesson of layer management), with its data `data/layers.json` and
`data/editions.json`.

- The layers row sits above the lines list: seven layers, each with its key, licence and source, switched on and off as
  GridAtlas switches its layers. Its lines row drives the page's own lines switch and still checks keys-min.json's sha256.
- The editions layer lists every Kuiper edition from editions/README.md and the pointer.
- A tap on a line's spark opens that line's card. The first revision (refused at 04:24Z) missed the finger lifting after
  a tap on the bar, so later taps counted as drags; this revision always sees it.
- The periodic-table layer stays REFUSED until the owner settles the elements licence (roadmap Q1).

Admitted, in order: `hello`, `kuiper-shell`, `line-card`, `drift`, `apps`, `layers` (`modules.json`). The page's
edition stamp and labels were changed to Edition 10; nothing else in `index.html` changed. `data/layers.json`,
`data/editions.json` (tools/build_layers.py) and `data/drift.json` (tools/drift.py --heads) were regenerated for this
stamp, and the layers record's edition and built_by fields name it.

Measured before release: the independent controller's green row E9-G1 (OPUS-CONTROLLER-3, branch edition/202611012135
commit 85c0bc64, whose `index.html` and `modules.json` hash to 73383218… and 47c51d61…): journey-6, Pixel 7 16/16 and
Galaxy S24 16/16, the same as Edition 9 alone; six modules admitted, none refused, 0 page errors; spark-tap opens card 323
on both phones. The author's own test 22/22 on each phone (neural-link #10 comments 6571928537 and 6572503742).

Coming as later small steps: the File menu (needed layers, now unblocked) and See Through's star layer.

## The card law

Every card opens with the line of code itself, verbatim from its key; the key is the second row (Edition 5).

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to, and every app row and layer carries the licence read from its own source. The VENTUS mark is used by Ventus
Ltd, its owner; the Apache-2.0 licence of this code does not license the mark (wording pending the owner's
confirmation). Illustrative only: not a design study. Provided as is, without warranty.
