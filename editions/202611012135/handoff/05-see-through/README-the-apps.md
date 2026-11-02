<!-- For Opus 10 (integrator): paste the section below into editions/202611012135/README.md after "Using it".
     Source: FIXES/NL-009/round1/06-seethrough.md "README.md addition", corrected by the OPUS-5 evidence officer:
     (1) the law sentence (NL-009's "θ = key × golden angle" is the teaching spiral that see-through/202610050609/
     kuiper-law.js:98-108 labels NOT THE REAL KUIPER; the Kuiper's is cosmos/wafer-meta.json:12, index.html:278);
     (2) the SEE THROUGH entry and its two forms; (3) the module's licence (CERN-OHL-S v2, ROADMAP.md:713-715);
     (4) the deep links and the fact that See Through 202610050609 does not read them yet. Numbers are keyed in EVIDENCE.md. -->
## The apps

The kuiper-belt repository carries two apps built on the same placement law as this wafer. Both are on the same host;
the SEE THROUGH entry opens the first in the same tab (a title on the left of the bar where the bar is wide enough, the
44 px chip at the bottom left on a narrow phone, one node either way), and the ABOUT panel links both.

- **See Through** (`../../see-through/`, stable link https://ventusltd.github.io/kuiper-belt/see-through/, which always
  opens the newest dated folder, today `202610050609/`): "See Through: from the stars to one substation in 3D". Type the
  name of any of 5,800 UK substations and press GO; the stars gather into the grid, the real map and satellite view appear
  inside the circle, and the substation rises in 3D on the real terrain with its pylons, drawn by rule from open map data
  (MapLibre GL JS; substations, lines and outlines © OpenStreetMap contributors, ODbL; imagery Esri; terrain AWS Terrain
  Tiles; it needs the internet). Licence: CERN Open Hardware Licence v2, Strongly Reciprocal (CERN-OHL-S v2), the licence
  of the globalgrid2050 code it reuses; `LICENSE.md` and `NOTICE.md` in each dated folder.
  Its stars gather by the law that places every spark here, r = √(key + 0.5), θ = 2π · frac(key × 2654435769 / 2³²)
  (`kuiper-law.js` in See Through; Vogel 1979, Knuth's golden-ratio multiplier). This edition draws the 5,800 stars that
  land on the 5,800 substations as the WAFER layer "See Through stars" (`data/see-through.json`, star j at key
  floor((j + 0.5) × SPACE / 20000), SPACE 63,340,120,796 as `cosmos/wafer-meta.json`; See Through 202610050609 still
  uses its frozen 59,637,070,538). A card offers "see this line among the stars" (`#key=`), a repository's stars
  (`#repo=`) and, for a star, its fall to the named substation; the find box offers an unknown name to See Through
  (`#sub=`). See Through 202610050609 does not read these links yet: they open its first screen until a later dated
  folder carries the hash reader (`handoff/05-see-through/`).
  The Kuiper module that does this (`modules/202611012141-see-through.js`) carries See Through's star-key rule, so it
  is CERN-OHL-S v2 as a whole; the rest of this edition stays Apache-2.0.
- **Learn the Kuiper** (`../../learn-the-kuiper/`, stable link https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/):
  a small game about the one rule, one dot and two numbers, until you can place any dot yourself; its MORE menu holds
  the first SEE THROUGH module, from which the app above grew. Code Apache-2.0 as the repository, text and generated
  data CC BY 4.0; parts adapted from globalgrid2050 keep CERN-OHL-S v2.

The wafer itself without the edition layer is `../../index.html`. Nothing in this edition's `keys.json`, cosmos or
placement law changes for the apps; they are links.
