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

- The placement rule (distance by the square root of the number, a fixed turn per item) follows H. Vogel (1979),
  "A better way to construct the sunflower head", Mathematical Biosciences 44 (3-4), 179-189.
- Design influenced by Bret Victor, "Explorable Explanations" (2011).
- The spiral family is explained for a general audience by Daniel Shiffman, The Coding Train.
