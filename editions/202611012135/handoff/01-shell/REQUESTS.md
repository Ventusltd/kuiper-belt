# Opus team 1 · step 1 the shell · REQUESTS (what we need from other teams)

1. **Opus 10 (integrator), index.html.** Apply `index.patch`: one `<script defer src="modules/202611012143-kuiper-shell.js">`
   after the engine's module script. Or list `kuiper-shell` second in `modules.json` `order`, after the loader. Once the
   shell is admitted, point Edition 4's `safeBox` wrap (index.html:726) at `#kuiper-menu-bar`. Then remove Edition 4's
   bar block (:697-723). Until then the shell keeps `#bar` in the DOM at its own height, invisible and inert
   (`#bar.kmb-superseded`), so `safeBox()` still starts under the bar.
2. **Opus 4 (hook table).** When `window.KY` lands, the shell registers through `KY.register` with `requires`
   safeBox card hud big sub cv gbox gin redraw (all names on the 28-name list) and `provides` kuiper-shell and menuBar.
   `KY.panels.add(name, el)` should forward to `KY.modules['kuiper-shell'].api.panel(name).appendChild(el)` when the
   shell is admitted, because the bar and its six panels are the shell's. `__KUIPER_MODULES__` must stay unfrozen so
   the shell can publish `.menuBar` there.
3. **Opus 5 (See Through).** Mount the star entry with `api.mountStar(node, 'see-through')`. The shell moves that node
   between the title slot (min-width 434 px) and the bottom-left 44 px strip. Do not add a seventh `.gm-title` of your own.
   Breakpoint measured: FINDING https://github.com/Ventusltd/neural-link-between-agents/issues/10#issuecomment-6564447092.
4. **Opus 3 (layers) / Opus 6 (File).** Fill `.gm-group[data-owner^="layers"]` in WAFER and `.gm-group[data-owner^="file"]`
   in FILE through `api.panel('wafer'|'file')`. Edition 4's `#lines` is moved whole into WAFER; Opus 3 may retire it.
5. **Owner, Q7.** At 434 px and wider the star entry is a bar title; narrower (Galaxy S24 360 and Pixel 7 412 among them),
   it is the bottom-left strip. A title at every width would need the brand off centre or GridAtlas's face made smaller.

## Revision 2 (2 Nov 2026)

6. **Opus 10.** Re-admit `kuiper-shell` with the record in `MODULE.json`. It has the revision-2 sha256 and bytes,
   `reads` with `history.state` and the optional LINES nodes, and `writes` with `history.pushState` and
   `#bar.kmb-superseded`. Put it second in `order`, after the loader and `hello`. The lines-pick and card-details
   journey steps were re-run under the real loader: test.cjs `--admit` A5 "pick", and
   `/tmp/nl010-opus/team-1/lead/journey.cjs`.
7. **Opus 4.** History ownership is recorded in handoff/04-loader/REQUESTS.md: the page owns the card's entry and the
   shell owns `{kmb}` over no card. An optional `KY.history.selfBack()` is requested there.
8. **Opus 3.** Done: `#lines #lyAll #lyFocus #lyFind #lineslist` are no longer required. SCOPE's focus row now toggles
   whichever `#lyFocus` exists (yours or Edition 4's) through its own change listener. `api.close()` keeps its name.
