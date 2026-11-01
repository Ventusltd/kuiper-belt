## The apps of the estate (step 7, the OS in baby steps)

FILE › Open an app opens the launcher under the bar: one row per app of `data/apps.json` (34: the 7 register apps
`block:<Sym>` of elements@f7a92fb APPS.md:7-13, the 25 entities of globalgrid2050@c66759f homepage_v134.html:32-56, the
spider sandbox and the periodic table). The first line of every row is its key, then the name, one line of purpose,
the licence read from the target's own file, and where the link lands. A tap opens that one app in the same tab; the
back gesture comes home. There is no window manager. Links on this host are checked with `fetch(HEAD)` when the
launcher opens, and a failure reads FAIL in its row. Links to other hosts are checked only when you tap "check". The
periodic table is a layer: 221 of its 244 elements have keys computed by `tools/element_keys.py` (the
`tools/edition_keys.py` walk applied to each element's first register file), and 23 are named but not placed. The layer
reads `REFUSED · licence unsettled` until the owner settles the elements licence (Q1). Only keys are copied from the
catalogue. Its "keys ▸" view still flies to any element and opens its card: the line at its key first, `block:<Sym>`
second. The spider is an app row and a graph layer drawn from the only two graphs copied into the edition,
`data/graphs/overview.json` and `data/graphs/periodic-table.json`. Both are DISCLOSED with their sha256 (Q5), and the
second has 2 tokens replaced under K1. The layer draws an edge only between nodes that have keys and counts the nodes
that have none. The 15 overview edges all key to one place (every node is served from ventus-grid-engine), so they
draw as rings there. Nothing in this step is fetched from another host at load.
