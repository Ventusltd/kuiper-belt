# Opus team 5 PLAN: See Through, the star player (ROADMAP step 5; team-3/STEPS.md step 5)

Module: editions/202611012135/modules/202611012141-see-through.js (one file, one KY.register). Data: editions/202611012135/data/see-through.json.
Hand-off: editions/202611012135/handoff/05-see-through/. Lead decides; everything outside these three paths is a REQUEST on #10.
See Through itself (see-through/) is untouchable this edition: its hash reader ships as see-through-hash-reader.patch here.

## Parts
- SECTION 1 entry (lead): a#kuiper-star.gm-title href ../../see-through/, text SEE THROUGH, first child of .gm-side-left
  (team 1's shell) at >=381 px; the same node moved into div#kuiper-star-strip (fixed, left 8, bottom 8+safe inset, 44 px)
  at <=380 px (ROADMAP R7/Q7). Lit at rest rgba(80,220,240,.16)/#fff. title/aria-label = homepage sentence. ABOUT row
  through KY.panels when team 1's ABOUT exists. Same tab. Fallback when no .gm-side-left: first child of #bar.
- SECTION 2 deep links out (builder): KY.seeThrough.link({sub,key,repo,view}) in grammar order repo,key,sub,view;
  card row "see this line among the stars" -> ../../see-through/#key=<k>; repository -> #repo=<name>; no spark->substation mapping.
- SECTION 3 Kuiper layer (builder): data/see-through.json, 5,800 Point features, key_j = floor((j+0.5)*SPACE/20000) in team 3's
  record format; SPACE remap (re-lift with cosmos/wafer-meta.json address_space); drawn through KY.draw.add with keyPlace only;
  row OK / FAIL (SPACE mismatch draws nothing). Builder script kept in handoff/05-see-through/build-see-through-json.py.
- SECTION 4 way back (lead): #key=<k> arriving from See Through -> goKey(k) (the edition's own reader; team 6 owns KY.link,
  this module only falls back when KY.link is absent).
- handoff: test.cjs (tester), EVIDENCE.md + LICENCE.txt (evidence), see-through-hash-reader.patch + REQUESTS.md (lead), img/.

## Status
- 21:41 UTC skeleton cut.
- 21:50 UTC (lead) module SECTIONS 1-4 written in full by the lead (node --check PASS): entry two forms (#kuiper-star,
  #kuiper-star-strip at max-width 380px), ABOUT/#top family text (NL-009 06 #edapps), layer from data/see-through.json
  (FAIL on SPACE mismatch, draws nothing), card rows (MutationObserver on KY.hooks.card: star -> #key&space "see this star
  fall to NAME"; any key -> "see this line among the stars"; repo -> #repo=), find-box fallback #sub=, way back reader
  (#key[&space] remapped; skipped when module "file" is admitted). Public api KY.modules['see-through'].api:
  link(fields), starKey(j,space), remap(key,spaceOld), inspect(), readHash().
  data/see-through.json built (5,800 features, 4,460 named, space 63,340,120,796, 666,922 bytes) by
  handoff/05-see-through/build-see-through-json.py.
- Builder: edits to the module by exact-string Edit only (never a whole-file write); say in this file what you change.
  Lead now writes handoff/05-see-through/see-through-hash-reader.patch (5.5 reader/writer/link(), 5.6 SPACE from
  wafer-meta.json, 5.8 X home + STAR KEY row) against a scratch copy of see-through/202610050609 (repo untouched).
- Evidence officer: EVIDENCE.md, LICENCE.txt, README-the-apps.md (NL-009 06 README block for team 10), REQUESTS.md.
- Tester: test.cjs; module inspect() fields: form ('title'|'title-fallback'|'strip'), entry{x,y,w,h}, layer{status,row,
  placed,total,space,wafer,inView,on}, linkRead, rowsAdded, starTap. Card row anchors carry class ky-st and data-ky-st.
- 21:5x UTC builder (OPUS-5 builder): data/see-through.json is the output of build-see-through-json.py as it now stands
  (5,800 features, 4,460 named, space 63,340,120,796 = wafer re-sum). Exact-string edits to the module, SECTIONS 2/3 only:
  (1) link(): `space` is written only when the caller passes it (a layer star); a spark's key goes out bare `#key=<k>`
      (ROADMAP 5.7(a); A5 expects the bodies[0] card href to end `/see-through/#key=36064705400`; it did not before).
  (2) setState(): registers with the layer registry ONCE, without `draw`, so a registry that calls record.draw cannot
      draw the stars a second time beside KY.draw.add(drawStars); state is read via inspect().layer.
  (3) the star tap card: card law (team-1 K0/K1): an issued key opens with `no text at key`, a silent key with
      describe's "was never issued"; aria-label set; content wrapped in `.lc-in` and the rows appended inside `.lc-in`
      when line-card is admitted (#card.lc has padding 0; the text touched the screen edge on Pixel 7).
  Measured in a scratch copy (/tmp/nl010-opus/team-5/builder/site, team 4's loader patch applied, line-card +
  see-through admitted, Pixel 7 / Galaxy S24, 0 pageerror): row `OK · 5,800 of 5,800 · See Through 202610050609 ·
  SPACE 63,340,120,796`, 5,800 in view at home; space+1 served -> `FAIL · SPACE 63,340,120,797 ≠ wafer 63,340,120,796`,
  inView 0; 404 -> `FAIL · data/see-through.json HTTP 404`; spark bodies[0] card rows `../../see-through/#key=36064705400`
  and `#repo=data-centres-gb` (45 px tall); star 1182 tap -> `see this star fall to DRAX` ->
  `#key=3744984642&space=63340120796`. Scratch rebuild: /tmp/nl010-opus/team-5/builder/prep.sh.
