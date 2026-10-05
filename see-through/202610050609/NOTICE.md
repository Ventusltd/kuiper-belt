# NOTICE: See Through

Credits and licences for this folder. See Through is offered under CERN-OHL-S v2 (see `LICENSE.md`).
All source repositories belong to Ventus Ltd (github.com/Ventusltd).

## Code reused from Ventus Ltd repositories

| File here | Came from | Licence |
|---|---|---|
| `descent.js` | the SEE THROUGH module of Learn the Kuiper (`modules/descent.js`), adapted | CERN-OHL-S v2 here |
| `kuiper-law.js`, `grid-data.js` | Learn the Kuiper (`grid-data.js` carries OpenStreetMap data, see below) | CERN-OHL-S v2 here |
| `pf.js` | globalgrid2050 `energy-transition-simulator/202609282123/place-frame.mjs` (c5ac5219), only `export` removed | CERN-OHL-S v2 |
| `model.js` (parts, cited by line in its header) | globalgrid2050 `.../mod/pylons-real.js` and `.../mod/substations.js` | CERN-OHL-S v2 |
| `see3d.js` (method, cited by line) | globalgrid2050 `.../overlay.html`, `.../mod/wire-look.js`, `.../mod/morph.js`, `.../mod/perf.js` | CERN-OHL-S v2 |
| `vendor/joystick.js` | globalgrid2050 simulator joystick (verbatim extract) | CERN-OHL-S v2 |
| `data/substations-footprints.odbl.json` | globalgrid2050 `.../mod/substations-footprints.odbl.json` (OpenStreetMap outlines matched to GridAtlas points) | ODbL 1.0 (data) |

The full CERN-OHL-S v2 text, as carried by globalgrid2050: `licences/globalgrid2050-CERN-OHL-S-2.0.txt`.

## Third-party data and services (their terms apply as written)

- **OpenStreetMap**: substation names, positions, voltages, operators, GridAtlas line files, substation outlines, and
  the per-site detail in `data/osm/*.json` (fetched with the Overpass API; each file carries its query, endpoint and
  time). (c) OpenStreetMap contributors, Open Database Licence 1.0, https://opendatacommons.org/licenses/odbl/ .
  Shown on screen: "Substations and lines © OpenStreetMap contributors, ODbL".
- **GridAtlas line files** (atlas-v9, `https://ventusltd.github.io/gridatlas/atlas/releases/202608300453-atlas-v9/data/`):
  OpenStreetMap-derived, ODbL; loaded at run time.
- **CARTO** dark-matter basemap style: (c) CARTO, map data (c) OpenStreetMap contributors. Shown on screen:
  "Data © OpenStreetMap contributors | © CARTO".
- **Esri World Imagery**: shown on screen "Imagery: Esri, Maxar, Earthstar Geographics". Used under Esri's terms for
  the World Imagery service.
- **AWS Terrain Tiles** (terrarium, `s3.amazonaws.com/elevation-tiles-prod`): shown on screen "Terrain: AWS Terrain
  Tiles (open)". The tiles' own sources and attributions are listed by the Terrain Tiles project
  (https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

## Third-party software

- **MapLibre GL JS 4.7.1** (`vendor/maplibre-gl.js`, `vendor/maplibre-gl.css`). BSD-3-Clause, (c) MapLibre
  contributors and Mapbox; full text `vendor/MAPLIBRE-LICENSE.txt`.

## Network use

No account, key or tracking. The network is used only for map tiles (CARTO, Esri, AWS terrain), the GridAtlas line
files and, for a site without a saved detail file, one Overpass query.
