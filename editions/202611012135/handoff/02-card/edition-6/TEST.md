# TEST: line-card revision 202611020212 (Edition 6), the landscape fix

Run 2026-11-02T02:23:49.033Z by OPUS-2 lead: `node editions/202611012135/handoff/02-card/edition-6/test-landscape.cjs http://127.0.0.1:8420/editions/202611012135/ <out>`, serving Edition 5 exactly as published (kuiper-belt main `a432b43`, modules.json order hello, line-card, see-through), with only the line-card record of modules.json pointed at this file through page.route. Playwright, Chromium with SwiftShader, real touch. The loader admitted the file by its own checks.

Bytes tested: `modules/202611020212-line-card.js` sha256 `8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb6a845d924c65cc240fe3` (15925 bytes) = `MODULE.sha256`.

**RESULT: PASS** (24 of 24 checks, 0 console errors on each device).

The defect (handoff/10-integration/TEST.md runs 3-4, card-details): with 202611012143 in Pixel 7 landscape (863x360) the card was capped at 30dvh = 108 px, full before details opened, and `details` was 43 % visible (13.8 px).

## Pixel 7 landscape (863x360)

| check | result | measured |
|---|---|---|
| L0 revision admitted, nothing refused | PASS | `{"admitted":[{"id":"hello","sha256":"ee2130b56e74ef3ec26a91aa2a177579c5fddcb8c48c17aa111f9fa8dbf7dd53","t_ms":728},{"id":"line-card","sha256":"8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb6a845d924c65cc240fe3","t_ms":3984},{"id":"see-through","sha256":"87a88e488fdf8433e2dcb3c31b9dfcf11726d5761509d996017ebbe08f6ce873","t_ms":4068}],"refused":[],"gen":"202611020212","sha":"8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb...` |
| L1 card within its cap (landscape: min(50 %, viewport - bar - 140)) | PASS | `{"height":174,"cap":174.4,"maxHeight":"174px","vh":360,"barBottom":45.59375}` |
| L2 action row whole: details and link inside card and viewport, ≥ 44 px | PASS | `{"details":{"top":236.984375,"bottom":280.984375,"left":226.859375,"right":293.4375,"height":44,"width":66.578125},"link":{"top":236.984375,"bottom":280.984375,"left":19,"right":215.625,"height":44,"width":196.625},"card":{"top":186,"bottom":360,"left":14,"right":639.53125,"height":174,"width":625.53125}}` |
| L4 selected spark in the clear band | PASS | `{"spark":{"x":430.94550408719346,"y":115.20435967302453,"px":367},"barBottom":45.59375,"cardTop":186}` |
| L3 details opened by touch, within cap, action row whole, details reachable | PASS | `{"height":174,"cap":174.4,"scrollH":352,"clientH":172,"details":{"top":236.984375,"bottom":280.984375,"left":226.859375,"right":293.4375,"height":44,"width":66.578125},"detailsAfterScroll":{"top":187,"bottom":231,"left":226.859375,"right":293.4375,"height":44,"width":66.578125},"detailsBlock":{"dTop":106.984375,"dBottom":262.734375,"cTop":186,"cBottom":360,"display":"block","visiblePx":76.734375}}` |
| L6 × closes the card, spark cleared | PASS | `{"open":false,"magenta":null}` |
| L5 all placed bodies: header = line_text, key second, within cap, details whole | PASS | `{"bodies":344,"distinct":344,"headerMismatch":[],"overCap":[],"detailsCut":[]}` |
| zero console errors and page errors | PASS | `[]` |

## Pixel 7 (412x839)

| check | result | measured |
|---|---|---|
| L0 revision admitted, nothing refused | PASS | `{"admitted":[{"id":"hello","sha256":"ee2130b56e74ef3ec26a91aa2a177579c5fddcb8c48c17aa111f9fa8dbf7dd53","t_ms":827},{"id":"line-card","sha256":"8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb6a845d924c65cc240fe3","t_ms":920},{"id":"see-through","sha256":"87a88e488fdf8433e2dcb3c31b9dfcf11726d5761509d996017ebbe08f6ce873","t_ms":11397}],"refused":[],"gen":"202611020212","sha":"8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb...` |
| L1 card within its cap (34 %) | PASS | `{"height":237.78125,"cap":285.3,"maxHeight":"285.26px","vh":839,"barBottom":75.09375}` |
| L2 action row whole: details and link inside card and viewport, ≥ 44 px | PASS | `{"details":{"top":691,"bottom":735,"left":211.859375,"right":278.4375,"height":44,"width":66.578125},"link":{"top":691,"bottom":735,"left":4,"right":200.625,"height":44,"width":196.625},"card":{"top":601.21875,"bottom":839,"left":0,"right":412,"height":237.78125,"width":412}}` |
| L4 selected spark in the clear band | PASS | `{"spark":{"x":205.50581395348837,"y":394.1831395348837,"px":344},"barBottom":75.09375,"cardTop":601.21875}` |
| L3 details opened by touch, within cap, action row whole, details reachable | PASS | `{"height":285.25,"cap":285.3,"scrollH":431,"clientH":284,"details":{"top":643.53125,"bottom":687.53125,"left":211.859375,"right":278.4375,"height":44,"width":66.578125},"detailsAfterScroll":{"top":554.75,"bottom":598.75,"left":211.859375,"right":278.4375,"height":44,"width":66.578125},"detailsBlock":{"dTop":546.53125,"dBottom":735.03125,"cTop":553.75,"cBottom":839,"display":"block","visiblePx":181.28125}}` |
| L6 × closes the card, spark cleared | PASS | `{"open":false,"magenta":null}` |
| L5 all placed bodies: header = line_text, key second, within cap, details whole | PASS | `{"bodies":344,"distinct":344,"headerMismatch":[],"overCap":[],"detailsCut":[]}` |
| zero console errors and page errors | PASS | `[]` |

## Galaxy S24 (360x780)

| check | result | measured |
|---|---|---|
| L0 revision admitted, nothing refused | PASS | `{"admitted":[{"id":"hello","sha256":"ee2130b56e74ef3ec26a91aa2a177579c5fddcb8c48c17aa111f9fa8dbf7dd53","t_ms":1311},{"id":"line-card","sha256":"8ec117f9dd436965e17fb860d5c12c485479cb3bdfdb6a845d924c65cc240fe3","t_ms":2796},{"id":"see-through","sha256":"87a88e488fdf8433e2dcb3c31b9dfcf11726d5761509d996017ebbe08f6ce873","t_ms":2871}],"refused":[],"gen":"202611020212","sha":"8ec117f9dd436965e17fb860d5c12c485479cb3bdfd...` |
| L1 card within its cap (34 %) | PASS | `{"height":237.78125,"cap":265.2,"maxHeight":"265.2px","vh":780,"barBottom":75.09375}` |
| L2 action row whole: details and link inside card and viewport, ≥ 44 px | PASS | `{"details":{"top":632,"bottom":676,"left":211.859375,"right":278.4375,"height":44,"width":66.578125},"link":{"top":632,"bottom":676,"left":4,"right":200.625,"height":44,"width":196.625},"card":{"top":542.21875,"bottom":780,"left":0,"right":360,"height":237.78125,"width":360}}` |
| L4 selected spark in the clear band | PASS | `{"spark":{"x":179.49428571428572,"y":364.92,"px":350},"barBottom":75.09375,"cardTop":542.21875}` |
| L3 details opened by touch, within cap, action row whole, details reachable | PASS | `{"height":265.1875,"cap":265.2,"scrollH":481,"clientH":264,"details":{"top":604.59375,"bottom":648.59375,"left":211.859375,"right":278.4375,"height":44,"width":66.578125},"detailsAfterScroll":{"top":515.8125,"bottom":559.8125,"left":211.859375,"right":278.4375,"height":44,"width":66.578125},"detailsBlock":{"dTop":437.59375,"dBottom":675.59375,"cTop":514.8125,"cBottom":780,"display":"block","visiblePx":160.78125}}` |
| L6 × closes the card, spark cleared | PASS | `{"open":false,"magenta":null}` |
| L5 all placed bodies: header = line_text, key second, within cap, details whole | PASS | `{"bodies":344,"distinct":344,"headerMismatch":[],"overCap":[],"detailsCut":[]}` |
| zero console errors and page errors | PASS | `[]` |

Screenshots (img/): 01 landscape card closed, 02 landscape details open, 03 Pixel 7, 04 Galaxy S24. Full report: /tmp/nl010-opus/team-2/lead/e6run2/report.json.

NOT EVALUATED: a real phone (dvh and the toolbar), Galaxy S24 landscape, font scale 1.3; the shell (kuiper-shell) and layers modules were not in the published order and are not in this run.
