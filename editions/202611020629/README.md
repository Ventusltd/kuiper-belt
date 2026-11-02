# Kuiper Edition 9 (202611020629)

**Version:** Kuiper Edition 9 · cut stamp 202611020629 (UTC) · published 2 November 2026 as the owner's overnight small step ("use your initiative and ship builds").

## What changed from Edition 8

Edition 8 is `../202611020528/`. Edition 9 is the same page, keys and modules with one module added: the app launcher
(`modules/202611012309-apps.js`, sha256 `fa01e012d81b32edf0287536e27a11075313dcd96d18c2409e21fb997bd0d481`, Opus team 7,
NL-010 step 7, the first baby step of the Kuiper as the OS of the estate), with its data `data/apps.json`,
`data/elements.json` and `data/graphs/`.

- FILE › Open an app opens the launcher under the bar: 34 apps of the estate, See Through first, each row at least
  44 px, its first line the app's key, then its name, purpose, licence and host. A tap opens the app in the same tab;
  the back gesture comes home with no panel open.
- The registry is written from keyed sources only (`tools/apps_registry.py`): seven blocks from the elements
  repository (key only), 25 surfaces from the globalgrid2050 homepage, the spider sandbox and the periodic table.
- The periodic-table layer stays REFUSED until the owner settles the elements licence (roadmap Q1), so nothing of it
  is drawn; its keys list counts 221 elements placed and 23 not placed. The spider sandbox links its v5 folder.
- Links to other hosts are checked only when asked, so nothing leaves the page's origin at load.

Admitted, in order: `hello`, `kuiper-shell`, `line-card`, `drift`, `apps` (`modules.json`). The page's edition stamp
and labels were changed to Edition 9; nothing else in `index.html` changed. `data/drift.json` was regenerated for this
stamp from the tested heads (equal in every field but edition, cut time and the keys path). `apps.json` and
`elements.json` are the tested bytes; their own edition field still reads 202611012135, which the launcher does not read.

Measured before release: the night controller's green row E6-G3 (branch edition/202611012135 commit b553b1f1, whose
`index.html` and `modules.json` hash to e6d6f8ed… and da1fd7a1…): journey-6, Pixel 7 16/16 and Galaxy S24 16/16; the
launcher's own test 12/12 script gates and 17/17 device gates on both phones, 0 errors. Harness ruling 6570518733: the
File module's evidence check (E') does not apply to an admission without the File module.

Coming as later small steps: the layers registry (refused: a spark tap opened the wrong card), the File menu (needs
layers) and See Through's star layer.

## The card law

Every card opens with the line of code itself, verbatim from its key; the key is the second row (Edition 5).

## Licence

As the repository: code Apache-2.0, text and data CC BY 4.0; every quoted line keeps the licence of the repository it
is keyed to, and every app row carries the licence read from its own source. The VENTUS mark is used by Ventus Ltd, its
owner; the Apache-2.0 licence of this code does not license the mark (wording pending the owner's confirmation).
Illustrative only: not a design study. Provided as is, without warranty.
