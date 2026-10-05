# NOTICE: See Through

See Through is a separate small app: a fall from a field of stars to one real substation, ending in a 3D drawing of
that substation, drawn by rule from open map data, standing on the real satellite ground with its pylons.

## Our own code, reused here

| File here | Came from | Licence |
|---|---|---|
| `descent.js` | the SEE THROUGH module of Learn the Kuiper (`modules/descent.js`), adapted | owner's |
| `kuiper-law.js`, `grid-data.js` | Learn the Kuiper (grid-data.js carries OpenStreetMap data, see below) | owner's |
| `pf.js` | globalgrid2050 `energy-transition-simulator/202609282123/place-frame.mjs` (origin/main c5ac5219), only `export` removed | CERN-OHL-S v2 |
| `model.js` (parts, cited by line in its header) | globalgrid2050 `.../mod/pylons-real.js` (tower table, towers along a line, lattice, attachments, sag) and `.../mod/substations.js` (fence, box, frame, compound size by voltage) | CERN-OHL-S v2 |
| `see3d.js` (method, cited by line) | globalgrid2050 `.../overlay.html` (custom layer, anchor matrix, terrain, joystick), `.../mod/wire-look.js` (colour, depth fade), `.../mod/morph.js` (cubic rise), `.../mod/perf.js` (terrain heights per block) | CERN-OHL-S v2 |
| `vendor/joystick.js` | the simulator's joystick (verbatim extract) | CERN-OHL-S v2 |
| `data/substations-footprints.odbl.json` | globalgrid2050 `.../mod/substations-footprints.odbl.json` (OpenStreetMap outlines matched to GridAtlas points) | ODbL 1.0 (data) |

The full CERN-OHL-S v2 text as carried by globalgrid2050: `licences/globalgrid2050-CERN-OHL-S-2.0.txt` (verbatim, including
its own punctuation).

## Third-party data and services (their terms apply as written)

- **OpenStreetMap**: substation names, positions, voltages, operators (via globalgrid2050 grid_substations.geojson and
  grid-data.js), GridAtlas line files, substation outlines, and the per-site detail in `data/osm/*.json` (fetched with the
  Overpass API; each file carries its query, endpoint and time). © OpenStreetMap contributors, Open Database Licence 1.0,
  https://opendatacommons.org/licenses/odbl/ . Shown on screen: "Substations and lines © OpenStreetMap contributors, ODbL".
- **GridAtlas line files** (atlas-v9, `https://ventusltd.github.io/gridatlas/atlas/releases/202608300453-atlas-v9/data/`):
  OpenStreetMap-derived, ODbL; loaded at run time.
- **CARTO** dark-matter basemap style: © CARTO, map data © OpenStreetMap contributors. Shown: "Data © OpenStreetMap
  contributors | © CARTO".
- **Esri World Imagery**: shown "Imagery: Esri, Maxar, Earthstar Geographics" (the simulator overlay's wording,
  overlay.html:43). Used under Esri's terms for the World Imagery service.
- **AWS Terrain Tiles** (terrarium, `s3.amazonaws.com/elevation-tiles-prod`): shown "Terrain: AWS Terrain Tiles (open)"
  (overlay.html:46). The tiles' own sources and attributions are listed by the Terrain Tiles project
  (https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
- **Environment Agency LIDAR**: not used in this build (see BUILD.md). If added later it needs: "© Environment Agency
  copyright and/or database right 2022. All rights reserved." under the Open Government Licence v3.0.

## Third-party software

- **MapLibre GL JS 4.7.1** (`vendor/maplibre-gl.js`, `vendor/maplibre-gl.css`), the 3D library of the simulator overlay,
  vendored at the same version. BSD-3-Clause, © MapLibre contributors and Mapbox; full text `vendor/MAPLIBRE-LICENSE.txt`.

## Nothing else

No account, key or tracking. At run time the network is used only for map tiles (CARTO, Esri, AWS terrain), the
GridAtlas line files and, for a site without a saved detail file, one Overpass query.
