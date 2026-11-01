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
- 22:2x UTC tester (OPUS-5 tester): test.cjs runs in mode `preview` until the integrator lands (index.html + 04-loader patch +
  02-card patch, modules kuiper-shell, line-card, layers, see-through from disk; 03-layers' deletion patch conflicts with
  02-card's patch, both cannot apply: a FINDING for team 10). Pixel 7 @393: load PASS, layer PASS (5,800 placed, 0 remap
  failures over all 5,800 old-sky keys), entry FAIL: team 1's shell puts the star in the strip below 434 px
  (kuiper-shell.js STAR_TITLE_MQ '(min-width: 434px)') against ROADMAP R7/Q7 (title at >= 381 px; "A Pixel 7 (393 px) shows
  the title"). Not fixable in our module (the shell owns the rule): REQUEST to team 1, or the owner's Q7. Hand-off refused
  until the 393 px title passes.
- 22:16 UTC LEAD DECISION on the 393 px entry form (tester's FAIL above): ROADMAP R7 chose "team 1's breakpoint as the rule,
  team 3's node-move and strip form as the content". Team 1 has re-measured its breakpoint and published it as a FINDING
  on #10 (issuecomment-6564447092, 21:56 UTC: 434 px, the title does not fit beside a centred brand below 433.2 px;
  kuiper-shell.js:41 STAR_TITLE_MQ). Their ACTION REQUESTED to us is "mount the star entry through api.mountStar", which
  the module does. So the test asserts THE SHELL'S rule when the shell is admitted: the form equals
  KY.modules['kuiper-shell'].api.inspect().star.form, title at >= 434 px, strip at <= 433 px, one node, never two; and the
  ROADMAP 381 px rule only when no shell is admitted (the module's own fallback, STRIP_MQ max-width 380px). The 393/412/430
  px class showing the strip is recorded in EVIDENCE.md and the HANDOFF as a cross-team FINDING for the owner's Q7 (a
  Pixel 7 shows the strip), not as a failure of this module. Tester: please change A1 accordingly and re-run.
- Lead: see-through-hash-reader.patch built against a scratch copy (/tmp/nl010-opus/team-5/lead/st/{a,b}), being tested on
  a scratch site (port 8460, patched copy as see-through/202611012200/, pointer moved there). Results go in EVIDENCE.md.
- 22:2x UTC lead: SECTION 3 registration changed after reading Opus 3's register(layer) (layers.js:118-136): it throws when
  `module` is not the layer record's module id ('see-through', not '<stamp>-see-through.js'), so the module now registers
  `{id:'see-through', module:'see-through', load}`; load() does the ONE fetch, checks sha256 against the record's
  source.sha256 when the registry names one (crypto.subtle), runs admit(), resolves {placed,total} or rejects with the row's
  words (registry then shows OK / FAIL). No registry: loadLayer() alone. inspect() adds registered, bytes, sha256.
- 22:21 UTC evidence officer: EVIDENCE.md and LICENCE.txt written. HEADER LICENCE LINE CHANGED (my role, OPUS-BRIEF.md:49-50;
  comment lines only, line count kept, node --check OK): MOD:1 now `CERN-OHL-S-2.0 (the whole file; ROADMAP 9.8: never
  Apache-2.0)`, MOD:3-5 name the licence text, the copied block (descent.js:19,:963,:965; grid.js:36-38, itself CERN-OHL-S
  v2) and that the Apache-2.0 engine is only called. Reason: ROADMAP.md:713-715 (a module carrying See Through code is
  CERN-OHL-S v2 and cannot be relicensed Apache-2.0); the old header said Apache-2.0 and "copies none of its code" while
  marking a CERN block. Same one-line change in build-see-through-json.py:19. Consequences for the lead:
  (a) REQUESTS.md item 2(a) must say modules.json `"licence": "CERN-OHL-S-2.0"` (not Apache-2.0); item 3's register
      signature is stale since 22:25 ({id, module:'see-through', load}).
  (b) MOD:128-129 says "r = √key, θ = key × golden angle": that is the teaching spiral kuiper-law.js:98-108 labels NOT THE
      REAL KUIPER. Replace with `r = √(key + 0.5), θ = 2π · frac(key × 2654435769 / 2³²)` (wafer-meta.json:12; index.html:278).
  (c) No ODbL credit is drawn where names show (row MOD:155 / star row): add ` · names © OpenStreetMap contributors, ODbL`.
  (d) Builder: data/see-through.json `licence` should read ODbL 1.0 (a database with 4,460 OSM names), script :87-88; rebuild.
  (e) The row says `See Through 202610050609 · SPACE 63,340,120,796`, but 202610050609 draws with 59,637,070,538.
  (f) startLayer(): an exception thrown by L.register inside the `new Promise` executor rejects the promise (the outer
      try/catch never sees it), so the row would read "the wafer refused: layer …" and never fall back to 'own'; and a
      record the registry holds as REFUSED returns before load() (layers.js register), so the promise never settles
      and wayBack() never runs. Resolve `done` in both paths.
  Tester: test.cjs:106 should require CERN-OHL-S-2.0 in the header when the body carries the block; :482 licence string.
- 22:32 UTC lead: evidence officer's (b)(c)(d)(e)(f) applied: family text uses the exact law; row carries the ODbL credit and says 202610050609 still draws 59,637,070,538; data licence ODbL 1.0, data rebuilt (sha256 above in EVIDENCE when final); startLayer settles in every path (try inside the executor + 6 s timeout); REQUESTS 2(a) licence CERN-OHL-S-2.0, item 3 signature updated.
- 22:33 UTC (GitHub timestamps 22:32:40Z, 22:33:03Z) lead: REQUESTs posted on #10: issuecomment-6564873869 (OPUS-3: new see-through.json sha256 87d5db35..., 666,945 bytes) and issuecomment-6564878115 (See Through patch for a later dated folder).
- 22:35 UTC lead: cardKey() reads the line-card's `.lc-k` row ('… · key 36,064,705,400') or describe()'s 'key <b>…</b>'
  only (the old regex could match a number inside the line of code); the family text goes AFTER Opus 2's law sentence in
  ABOUT (their B4: the law is ABOUT's first child). Tester, for the next run: (1) mode preview (shell admitted), A1 per the
  22:16 decision; (2) the See Through page's request to basemaps.cartocdn.com fails in this sandbox (proxy), NL-009 06
  F4 recorded it as the environment, not a defect: count it under "network refused by the sandbox", not as a console error
  of ours (pageerror must still be 0); (3) "after back #kuiper-star count 0" and the S24 sha256 mismatches in run3 came
  from files edited mid-run; the module is now frozen except for fixes you report.
- 22:49 UTC lead: HARNESS BLOCKER (ci_check K1 privacy) fixed: the provenance field name in build-see-through-json.py and data/see-through.json renamed to 'kuiper' (the underscore form is on the not-public digest list); data regenerated: 666,940 bytes, sha256 440950711a148eb019b7309ea1a0610219c096742893ce8d7c1f81be18d479a6; python3 tools/ci_check.py from the kuiper-belt root -> K1 615 tracked files, 0 match; RESULT: PASS. No other team-5 file carries the token (grep over modules/202611012141-see-through.js, data/see-through.json, handoff/05-see-through/, the scratch patch). Opus 3 asked again to re-record the sha256.
- 23:03 UTC tester: run5 (preview: 96736f5 index + 04-loader + 02-card patches; shell, line-card, layers, file, see-through):
  Pixel 7 @393 load PASS, layer PASS once layers.json carried the new sha256, entry FAIL (strip at 393: shell's 434 px
  rule vs R7 381), tap FAIL only on "a panel is open" (fixed in test.cjs: open = on screen, not the class), spark FAIL:
  our row is right (`../../see-through/#key=36064705400`, api.link equal) but #card is visibility:hidden (layers.js:277
  keeps `gm-open` on #layers; line-card.js:165 hides the card while any `.gm-open` exists), so the row cannot be
  touched. FINDING posted: issuecomment-6565202316. Errors: 0 same-origin; See Through's basemaps.cartocdn.com style is
  refused by this sandbox's egress (recorded as externalUnreachable, not counted).
- 23:04 UTC lead: (1) OPUS-1's request (via harness): the module no longer creates any #kuiper-star-strip of its own;
  the entry is mounted ONLY through the shell's api.mountStar (title from 434 px, the shell's bottom-left strip narrower,
  so Pixel 7 at 393/412 px shows the strip: a change to owner question Q7, stated in the HANDOFF). Without a shell the
  entry is the first title of Edition 4's #bar (form 'title-fallback'), never a strip. inspect().form reads the shell's.
  (2) see-through-hash-reader.patch fixed and re-published: the STAR KEY row was inside the one-line card (st-edge,
  max-height 24 px, plain.css:28) so it was clipped and a tap hit MAP below; it is now its own 44 px <a> above the card,
  made once and re-labelled. Measured (scratch, Pixel 7): row 396x44 at y 635, elementFromPoint = the row, a real tap
  lands on ../../editions/ -> 202611012027/#key=3744984642 (the pointer at this HEAD), 0 pageerror. The patch applies
  with patch -p1 to a byte copy of 202610050609/ and equals the tested copy byte for byte.
