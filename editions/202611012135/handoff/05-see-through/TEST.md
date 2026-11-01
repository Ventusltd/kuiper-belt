# TEST: handoff/05-see-through/test.cjs (Opus team 5 tester)

**Hand-off status: REFUSED** (OPUS-BRIEF.md "Roles": the tester refuses the hand-off until test.cjs passes on both
devices with zero console errors). In run6 (23:44 UTC): static checks, load, layer, tap and errors PASS on both devices,
and the entry passes on Galaxy S24. `entry` fails on Pixel 7 @393 and `spark` fails on both devices, each from a cause
outside this module (see "What blocks the hand-off").

test.cjs is the tester's file (OPUS-BRIEF.md "Roles"). Lead and builder: please send changes to the tester, do not
overwrite it.

## How to run

```
cd /home/user/estate/kuiper-belt && python3 -m http.server 8452 --bind 127.0.0.1 &
node editions/202611012135/handoff/05-see-through/test.cjs http://127.0.0.1:8452/ /tmp/nl010-opus/team-5/tester/run \
     --img editions/202611012135/handoff/05-see-through/img
```

Options: `--devices "Pixel 7 @393,Galaxy S24"` (the default), `--all` (adds Pixel 7 at 412 and 430, landscape and
1280×800), `--mode auto|integrated|manifest|preview|shim`, `--with kuiper-shell,line-card,...`, `--title-min <px>`.
Exit 0 only when every step passes on every device; the JSON report goes to `<outdir>/report.json`.

Devices: **Pixel 7 @393** is `devices['Pixel 7']` (Android UA, DPR 2.625, touch) with its viewport set to 393×839, the
393 px class ROADMAP.md step 5 A1 names (Playwright's own Pixel 7 is 412 px wide). **Galaxy S24** is
`devices['Galaxy S24']`, 360×780, DPR 3. Chromium uses the brief's SwiftShader flags. Taps use `page.touchscreen.tap`.
The test waits 6.5 s after each load and each navigation.

## How the module gets into the page (`report.mode`)

| mode | when (auto) | what is served |
|---|---|---|
| integrated | index.html has the hook table and modules.json lists `see-through` | the edition as it is on disk. Nothing is changed. |
| manifest | index.html has the hook table, modules.json does not list `see-through` | modules.json plus one record (sha256 and bytes measured from the file) |
| preview | no hook table yet, but `handoff/04-loader/index.html.patch` exists | index.html plus the loader patch (when the file on disk refuses the patch, the skeleton's index.html at kuiper-belt@96736f5 is used instead), plus 02-card's patch when line-card is included, plus 03-layers' deletion patch when layers is included. Each patch applies whole or not at all. modules.json holds the modules on disk in the integration order (kuiper-shell, line-card, layers, file, see-through, apps, drift). The modules are copied at start-up, so a file another team edits during the run cannot cause a sha256 mismatch. |
| shim | no hook table and no loader patch | a minimal `kuiper.hooks.v1` table (from handoff/04-loader/HOOKS.md) and a loader that admits or refuses the module in words |

Nothing on disk is changed in any mode. preview and shim are built in `<outdir>` and served by Playwright routes.

## What is asserted

| step | assertion | source |
|---|---|---|
| static: module | header line 1 names the licence: `CERN-OHL-S-2.0` whenever the body carries See Through code. Such a module cannot be Apache-2.0. Also: generation in the header = file-name stamp = registration; exactly one `KY.register(`; `node --check` passes; `MODULE.sha256` matches when present | ROADMAP step 9 register (ROADMAP.md:713-715); step 4, 4.3 |
| static: data | `data/see-through.json` has 5,800 features with 5,800 distinct `j`. `key_j = floor((j + 0.5) · SPACE / 20000)`, recomputed with BigInt; every key `< SPACE`; `space` = `cosmos/wafer-meta.json` `address_space`. 0 remap failures (`j' = floor(key · 20000 / space)` gives back `j` and the key). The file names OpenStreetMap and ODbL | step 5, 5.6; team-3/STEPS.md 5.5 `space` |
| load | the `see-through` module is admitted; zero console errors | step 4 |
| entry | `#kuiper-star` exists exactly once. It is an `<a>`, with `href="../../see-through/"` on the same origin and same tab. Its aria-label/title is the homepage sentence, and the hit test at its centre lands on it. **≥ 381 px**: a bar title, the first title of `.gm-side-left` and leftmost, the widest `.gm-title`, on the titles' y, lit at rest (`rgba(80, 220, 240, 0.16)`, `#fff`), with the bar on one row. **< 381 px**: the same node inside `#kuiper-star-strip` (fixed), x 8, bottom `innerHeight − 8`, 44 px tall, ≥ 100 px wide, with the bar still on one row | step 5, 5.1, A1; R7; Q7 |
| layer | in the page: `KY.hooks.keyPlace(k)` equals the law for all 5,800 keys. `inspect().layer` reads status `OK`, total 5,800, placed 5,800, space = wafer = `SPACE`. Through `api.remap`, all 5,800 star keys cut under See Through 202610050609's sky (59,637,070,538) come back as star `j` with the wafer-sky key; identity remap and `api.starKey` both give 0 failures | step 5, 5.6 |
| tap | a real touch on the entry navigates in the same tab to `/see-through/` on the same host, through the pointer, to a page titled "See Through". `page.goBack()` returns to the edition with the entry present once and no panel on screen | step 5, A2; NL-009 06 |
| spark | `e` opens the card of a spark (the journey's key). The card is visible and carries an `<a>` that resolves to `../../see-through/#key=<key>` on this host (`&space=<SPACE>` is accepted only with the wafer's SPACE). The hit test at the row lands on it. A real touch lands on See Through with exactly that hash, and back returns | step 5, 5.7 (a); A5 (`/see-through/#key=36064705400` for bodies[0]) |
| errors | zero console errors, page errors and failed requests on every page | the brief |

**What does not count as an error:** a request to another host that this sandbox's egress proxy refuses, together with its
"Failed to load resource" echo. In every run this is See Through's own MapLibre style,
`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`, `net::ERR_TUNNEL_CONNECTION_FAILED`. It is listed
in `externalUnreachable` per device and does not fail. Any same-origin failure, any page error and any other console
error fails.

## Results (run6, 23:44 UTC, mode preview; the latest)

Run conditions: index.html is the file on disk plus 04-loader plus 02-card. 03-layers' deletion patch does not apply
after 02-card. The modules admitted are kuiper-shell, line-card, layers, file, see-through and apps. The module is
`202611012141-see-through.js`, sha256 `87a88e48…873`, with line 1 `… (UTC), CERN-OHL-S-2.0 (the whole file; …)`. The
data file `data/see-through.json` has sha256 `44095071…9a6`. Full JSON: /tmp/nl010-opus/team-5/tester/run6/report.json.

| step | Pixel 7 @393 | Galaxy S24 (360) |
|---|---|---|
| static module / data | PASS / PASS (5,800 features, 5,800 distinct j, 0 key mismatches, 0 beyond SPACE, 0 remap failures, space 63,340,120,796 = wafer, ODbL named) | (same) |
| load | PASS, 0 errors | PASS, 0 errors |
| entry | **FAIL**: form `strip` at 393 px (entry 112.5×44 at x 9, y 788; strip 114.5×44 at x 8, bottom 831 = 839 − 8; lit at rest; aria-label the homepage sentence). The roadmap wants a title at ≥ 381 px | PASS: form `strip` (entry 112.5×44; strip x 8, bottom 772 = 780 − 8); bar 360/360 on one row; the six titles 34.6–40.2 px |
| layer | PASS: row `OK · 5,800 of 5,800 · See Through 202610050609 (its sky 59,637,070,538 until the patch) · SPACE 63,340,120,796 · names © OpenStreetMap contributors, ODbL`; `KY.hooks.keyPlace` 0 mismatches over 5,800 keys; remap of all 5,800 old-sky star keys: 0 failures (identity 0, starKey 0) | PASS (same numbers) |
| tap | PASS: same tab, same host, `…/see-through/202610050609/` through the pointer, title "See Through"; back returns to the edition with the entry present once and no panel on screen | PASS (same) |
| spark | **FAIL**: the row is right (`../../see-through/#key=36064705400` for card 1 of 344, bodies[0]; `api.link({key})` gives the same), but `#card` is `visibility:hidden` and the hit test at the row lands on `#c`, so the touch never reaches it | **FAIL** (same) |
| errors | PASS: 0 errors. externalUnreachable has 2 entries, the CARTO style and its echo | PASS (same) |

Earlier runs: run5 (23:10) failed `layer` on Pixel only. layers.json still held the old sha256 of see-through.json; it
passed later in that same run once OPUS-3 updated the record. In run5 `tap` also failed, on a check in the test that
counted the `.gm-open` class instead of a panel on screen; that check has been fixed in test.cjs.

## What blocks the hand-off

1. **The 393 px title (entry, Pixel 7).** Team 1's shell makes the star a title only at `min-width: 434px`
   (`kuiper-shell.js` `STAR_TITLE_MQ`, measured in handoff/01-shell/EVIDENCE.md §5 item 2; FINDING
   issuecomment-6564447092). ROADMAP R7 and Q7, and this test's brief, say 381 px: "A Pixel 7 (393 px) shows the title".
   The shell owns the rule, so the module cannot fix this. The test keeps 381 until the owner answers Q7 or the harness
   rules. `--title-min 434` runs team 1's rule instead, and under it the 393 px strip passes.
2. **The card is never visible with the shell, the layers module and the line card admitted (spark).**
   `layers.js:277` keeps `gm-open` on `#layers` while the WAFER panel is hidden. `line-card.js:165` hides `#card`
   (`lc-behind`, `visibility:hidden`) whenever any `.gm-open` exists. FINDING posted:
   https://github.com/Ventusltd/neural-link-between-agents/issues/10#issuecomment-6565202316.
3. For the integrator: `02-card/index.patch` and `03-layers/index.html.after-04-loader.patch` cannot both apply (the
   same FINDING). At 22:28 index.html refused `04-loader/index.html.patch`; by run6 (23:2x) it accepted it again.

Not tested here because it is not shipped this edition: See Through's own hash reader. See Through is untouchable, so
`#key=` reaches See Through's URL (asserted) but is not yet read there (see-through-hash-reader.patch, REQUESTS.md item 1).

## Screenshots (img/)

Written by `--img`. Each PNG is under 300 KB and named by the form measured, not the form wanted. From run6:

- `01-entry-strip-pixel-7-393.png` (112,181 bytes): Pixel 7 at 393 px. The entry is the bottom-left strip, not a title:
  this is the open point 1 below.
- `02-entry-strip-galaxy-s24.png` (98,231 bytes): Galaxy S24, the 44 px chip.
- `03-landing-see-through-pixel-7-393.png` (156,029 bytes): See Through after the tap on the entry (202610050609
  through the pointer).
- `04-deep-link-key-*.png`, See Through opened from a spark's `#key=` row, is not written yet: the spark step has not
  passed. The run's own frame of that step is the edition, because the touch could not reach the hidden card.
