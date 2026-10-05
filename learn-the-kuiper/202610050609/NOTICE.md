# NOTICE

Credits and licences for this folder. All source repositories belong to Ventus Ltd (github.com/Ventusltd).

## Licence

Code in this folder is Apache-2.0, as the kuiper-belt repository (see its `LICENSE`); documentation and generated data
are CC BY 4.0. Two parts are adapted from the globalgrid2050 repository and keep its licence, CERN-OHL-S v2:

- `modules/grid.js`: the DRAW THE GRID animation, from `testcode/wafer-development-environment/202609180245-real-systems`.
- `modules/zoom.js`: the touch joystick pattern, from `energy-transition-simulator/202609282123/mod/walk-fps.js`.

## Sources

- `kuiper-law.js`: the Kuiper placement rule, from kuiper-belt `index.html` (commit 7a65dd3), unchanged.
- Lines of code shown on the sheet: kuiper-belt `tools/wafer_keys.py`, `tools/key.py` and `README.md`.
- `modules/realgame-data.js`: kuiper-belt `cosmos/wafer.tsv`, `cosmos/repos.tsv` and `cosmos/wafer-meta.json`.
- `modules/grid-data.js`: substations and networks (c) OpenStreetMap contributors, Open Database Licence 1.0;
  coastline from Natural Earth, public domain.
- The SPIDER look and deep-link format follow ventus-grid-engine (Ventus Ltd, Apache-2.0); no code copied.

## Online services used by SEE THROUGH (`modules/descent.js`)

These are used only when the device is online; they are not bundled in this folder.

- Substation names, voltages, operators, positions and lines: (c) OpenStreetMap contributors, ODbL.
- Map: CARTO dark matter, (c) CARTO, map data (c) OpenStreetMap contributors.
- Satellite: Esri World Imagery (Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community), under Esri's terms of use.
- MapLibre GL JS 3.6.2, BSD-3-Clause, loaded from cdn.jsdelivr.net.

## Fonts

System fonts only.

## Acknowledgements

The rule this game teaches is built on other people's work. Oldest first:

- Archimedes, "On the Sphere and Cylinder" (about 225 BC): equal steps in height cut a sphere into bands of equal
  area. The SPHERE screen sets height this way.
- Leonardo of Pisa, known as Fibonacci, "Liber Abaci" (1202): the number sequence whose neighbouring ratios settle
  on the golden ratio. The spiral arms you can count in the circle come in neighbouring Fibonacci numbers.
- L. and A. Bravais (1837), Annales des Sciences Naturelles, Botanique 7: the golden angle, about 137.5 degrees,
  as the turn between one leaf or seed and the next.
- H. Vogel (1979), "A better way to construct the sunflower head", Mathematical Biosciences 44 (3-4), 179-189:
  the placement rule (distance by the square root of the number, one golden-angle turn per item). The Kuiper
  turns 222.4922 degrees per key, which is the same angle measured the other way round.
- D. E. Knuth, "The Art of Computer Programming, Volume 3: Sorting and Searching" (1973), section 6.4: multiply
  by a whole-number form of the golden ratio and keep the remainder, known as Fibonacci hashing. The multiplier
  2654435769 is 2^32 divided by the golden ratio, rounded down.
- M. Roberts (2018), "The Unreasonable Effectiveness of Quasirandom Sequences", extremelearning.com.au: the
  plastic-number pair behind the two multipliers on the SPHERE screen.
- Design influenced by Bret Victor, "Explorable Explanations" (2011).
- The spiral family is explained for a general audience by Daniel Shiffman, The Coding Train.

Any error in how their work is used here is ours.
