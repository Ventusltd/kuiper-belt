# EVIDENCE: Opus team 2, step 2 "the card law" (`modules/202611012143-line-card.js`)

OPUS-2 evidence officer, 2026-11-01 (UTC). Law: no claim without a key (neural-link FIXES/NL-010/OPUS-BRIEF.md;
ROADMAP.md Preface, law 1). Every table row below is `repo@sha path:line` and a literal fragment that stands on that
line (or on one line of the range). `python3 -I /tmp/nl010-opus/team-2/evidence/check_keys.py EVIDENCE.md` reads
each row again from `git show <sha>:<path>`, or from the working tree when the sha is `WT`. A row passes only when the
file exists, the line exists and the fragment is on that line. The result is in section G. Every number in this file
was measured today by the scripts named next to it. None is copied from another file.

Heads:
- kuiper-belt@96736f5 (`96736f55c2137defcf02c898f8f2b0d04374d74b`, branch `edition/202611012135`, the Edition 5
  skeleton).
- kuiper-belt@018b46a (Edition 4, the roadmap's head). `tools/`, `README.md`, `LAWS.md` and `editions/202611012027/`
  are the same at both shas (`git diff --quiet 018b46a 96736f5 -- tools README.md LAWS.md editions/202611012027`
  exits 0).
- gridatlas@5ec7f62 (`5ec7f62f213e2d20a02e86427daa182c0f38e4a4`).
- neural-link@b9b7d5d (`b9b7d5d5d052f95c81ed6ac96427f7f4d19adbf1`).
- `WT`: the uncommitted working tree of the edition branch (the module, the handoff folders).

`editions/202611012135/index.html` at 96736f5 is the Edition 4 page with six lines changed (lines 6, 96, 634, 641,
699 and 745, each "Edition 4" to "Edition 5"), so every engine line number below is the same in both editions.
`editions/202611012135/keys.json` is byte-identical to Edition 4's: sha256 `1c293c33…7242b` for both, the value
Edition 4 records at editions/202611012027/proof/edition-sha256.txt:4.

## A. The GridAtlas lesson and the Kuiper's first law

| # | claim | key | fragment |
|---|---|---|---|
| A1 | GridAtlas shows the engine's live WAIT/LOAD/OK/FAIL text, never a cleaned label | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:92 | `The V8 panel exposes WAIT/LOAD/OK/FAIL beside every layer` |
| A2 | why: the cleaned label hid success from failure on a phone | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:95 | `load indistinguishable in the only layer surface left on a phone` |
| A3 | the live text is what is shown (ROADMAP cites :92-100; the comment and the expression are :92-98) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:96 | `var text = cleanText((span && span.textContent) \|\| base` |
| A4 | the Kuiper's first law | kuiper-belt@018b46a README.md:29 | `## The first law: no claim without a key` |
| A5 | a statement with a key is a fact | kuiper-belt@018b46a README.md:34 | `A statement **with** a key is a fact` |
| A6 | a check that examines nothing refuses (this is why K0 refuses with "no text at key") | kuiper-belt@018b46a README.md:40 | `A check that examines nothing refuses. It does not pass.` |

## B. The `keys.json` fields the card uses, and where each is written

`keys.json` is written by `tools/edition_keys.py` (summary.command: `python3 tools/edition_keys.py --bodies
editions/202610311905/belt/bodies.json …`). The register fields (title, quote, pattern and so on) are copied from
Edition 1's `bodies.json` by `rec = dict(b)`. The key fields are computed from git.

| # | field (used by) | key | fragment |
|---|---|---|---|
| B1 | register fields `repo commit path line title quote pattern worker finding destination class` are carried from bodies.json (module `keyText`, `render`; page :632) | kuiper-belt@018b46a tools/edition_keys.py:177 | `rec = dict(b)` |
| B2 | every body starts with `line_text` None: a body that never reaches a line keeps `null` (the two star-maker bodies) | kuiper-belt@018b46a tools/edition_keys.py:181 | `'line_text': None` |
| B3 | `on_wafer` (page filter :632) | kuiper-belt@018b46a tools/edition_keys.py:193 | `rec.update({'on_wafer': True` |
| B4 | `key` = k0 + lines before path + (line − 1) (module `keyText`, and the `H.address` lookup in `render`) | kuiper-belt@018b46a tools/edition_keys.py:249 | `rec['key'] = c['k0'] + before + (line - 1)` |
| B5 | `line_text` = the line of the blob at the key, UTF-8 decoded with `replace`, `\r` stripped | kuiper-belt@018b46a tools/edition_keys.py:250 | `text = body.split(b'\n')[line - 1].decode('utf-8', 'replace').rstrip('\r')` |
| B6 | `line_text` stored: this is the header (module `render`, `header`, `row`) | kuiper-belt@018b46a tools/edition_keys.py:251 | `rec['line_text'] = text` |
| B7 | only the quote's first line is compared | kuiper-belt@018b46a tools/edition_keys.py:252 | `q = (b.get('quote') or '').split('\n')[0].rstrip('\r')` |
| B8 | `quote_check` (shown in details, module `render`) | kuiper-belt@018b46a tools/edition_keys.py:256 | `rec['quote_check'] = how` |
| B9 | the four levels of `quote_check` | kuiper-belt@018b46a tools/edition_keys.py:81-90 | `return 'exact after trimming whitespace'` |
| B10 | `quote_line` when the quote is not at the line | kuiper-belt@018b46a tools/edition_keys.py:265 | `rec['quote_line'] = near` |
| B11 | `quote_key` (module `render`, "quoted one line below · key N") | kuiper-belt@018b46a tools/edition_keys.py:266 | `rec['quote_key'] = c['k0'] + before + (near - 1)` |
| B12 | `verified` (page filter :632) | kuiper-belt@018b46a tools/edition_keys.py:277 | `rec['verified'] = True` |
| B13 | the summary list of the seven | kuiper-belt@018b46a tools/edition_keys.py:285 | `'quote_not_at_line': [` |
| B14 | the page places only on_wafer, verified, finite-key bodies (344): the star-maker bodies never reach a card | kuiper-belt@96736f5 editions/202611012135/index.html:632 | `edPlaced = ED.filter(b => b.on_wafer && b.verified && Number.isFinite(b.key)` |
| B15 | `x, y` on a placed body come from `keyPlace(key)` in the page, not from keys.json (module `show` sets the target from them) | kuiper-belt@96736f5 editions/202611012135/index.html:633 | `Object.assign({}, b, { x:p[0], y:p[1] })` |
| B16 | `tools/key.py` prints the first 200 characters of the line (relevant to B5 of the acceptance test, see C5) | kuiper-belt@018b46a tools/key.py:126 | `text[:200]` |

## C. The measurement: register `quote` against `line_text`, reproduced

Script: `/tmp/nl010-opus/team-2/evidence/measure.py`, run as `python3 -I measure.py
editions/202611012135/keys.json`. It reads the file on disk (sha256 `1c293c33…7242b`).

| measured | value |
|---|---|
| bodies / placed (`on_wafer`) / placed and verified with a finite key | 346 / 344 / 344 |
| placed bodies with a string `line_text` | 344 |
| unplaced bodies (star-maker `164372f7…:115`, `4152a7a6…:86`) | 2, both carrying `line_text: null` (field present, value null; B2) |
| placed with `line_text` the empty string | 4 (all four are `quote_not_at_line` rows, below) |
| non-empty `line_text` | 340 |
| of the 340, `quote === line_text` byte for byte | **128** |
| of the 340, `quote !== line_text` | **212** |
| of all 344, `quote !== line_text` (the register-quote rows the card must show) | 216 = 212 + 4 empty |
| `quote_check` over the 344 | exact 128 · exact after trimming whitespace 147 · equal after dropping quote marks and collapsing whitespace 31 · fragment 31 · not at line 7. Sum 344 |
| of the 147 "trimmed", `quote === line_text.lstrip()` | 147: the register dropped only leading indentation |
| bodies carrying `quote_key` | 7 |
| multi-line quotes | 0 |
| `line_text` needing HTML escaping (`< > & "`) | 81 |
| `line_text` containing a tab | 3 (the module sets `tab-size:4`) |
| `line_text` containing U+FFFD (a decode replacement) | 0. Five lines are non-ASCII and every one decoded cleanly, so "byte for byte" holds after UTF-8 decoding |
| `line_text` longer than 200 characters | 16 |
| **longest `line_text`** | **1,240,449 characters**: kuiper-belt `estate-network.json:1`, key 63,013,167,769. That is 73 % of keys.json's 1,709,129 bytes and 98 % of the 1,266,436 characters of all 344 headers together (see F3) |

C5. `tools/key.py` round trip. `/tmp/nl010-opus/team-2/evidence/roundtrip.py` ran 12 keys: the seven below and five
others chosen with seed 20261101. It used a scratch copy of key.py whose only change is line 31, `ROOTS`, which names
local clones instead of `C:/Users/vikra/Documents/GitHub` (`diff` shows one line). The repository's key.py was not
touched.
- 11 of 12 printed lines equal `line_text` exactly.
- The 12th is pipelinenews `archive/202608261547-pipelinenews/newsv6/modules/data-centre-identity.mjs:2`, a 217-character
  line. key.py prints the first 200 characters (B16), and those equal `line_text[:200]`.
- For the seven, the line at `quote_key` passes the edition's own `quote_check` against the register quote: six
  exactly, and the learn-the-kuiper NOTICE quote is a prefix (a fragment) of its line.
- The acceptance test's B5 must therefore compare key.py's output with `line_text[:200]`. A plain equality test fails
  for any line longer than 200 characters.

## D. The seven `quote_not_at_line` rows (keys.json `summary.quote_not_at_line`, re-measured)

In all seven, `quote_line = line + 1`. That makes the module's fixed words "quoted one line below" true for 7 of 7.
The column "key.py at key" is the line the round trip printed, and it equals `line_text` in all seven.

| # | repo | path:line | key | line_text (the header) | quote_key | the register quote (first 60 chars) |
|---|---|---|---|---|---|---|
| D1 | globalgrid2050 | diary-notes-log/260522-0115-v7-rollback-and-working-method.md:89 | 62728320318 | `` (empty: "empty line at key") | 62728320319 | The intended feature was to introduce separate Energy Users |
| D2 | gridatlas | tools/release/acceptance.mjs:15 | 62884836484 | ` *` | 62884836485 | * WHAT COUNTS (tools/release/flow-lib.mjs decideAcceptance) |
| D3 | kuiper-belt | README.md:33 | 63013108974 | `` (empty) | 63013108975 | - A statement **with** a key is a fact: anyone can recompute |
| D4 | data-centres-gb | README.md:8 | 36064706321 | `` (empty) | 36064706322 | The `202608281053` candidate producer: |
| D5 | maths | 08a-which-way-the-golden-turn-goes.md:17 | 60072442240 | ```` ``` ```` | 60072442241 | 222.492236° + 137.507764° = 360° |
| D6 | ventus-grid-engine | deeplink/contract.js:67 | 63027326240 | ` * control has ever existed. Measured blast radius: 2,508 of 7,680 register` | 63027326241 | * rows, a third of the register, reporting green while the l |
| D7 | kuiper-belt | learn-the-kuiper/202610050144/NOTICE.md:6 | 63013178579 | `` (empty) | 63013178580 | Code in this folder is Apache-2.0, as the kuiper-belt reposit |

D3 is the Kuiper's own first law, keyed one line above itself (README.md:33 is blank and :34 is A5). It is the clearest
case of why the header is the line at the key and the quote moves below it.

## E. The Kuiper hooks: `edCard`, `edFly`, `describe` (and what the module actually reaches)

The page script is a module (`index.html:102`, `<script type="module">`), so `edCard`, `edFly`, `edPlaced` and
`fillLines` are module-scoped. A separate file cannot reach or wrap them, and ROADMAP 4.8 forbids wrapping an engine
function anyway. The published hook table (`handoff/04-loader/HOOKS.md`, 28 names) has `describe`, `card`, `esc`,
`fmt`, `address` and `gbox`, but not `edCard`, `edFly` or `fillLines`. The lead's design (PLAN.md) does not wrap them:
the page delegates to `KY.modules['line-card'].api` through `handoff/02-card/index.patch`. That patch (sha256 `8395bd3f…`) was re-verified at 22:53 UTC in `/tmp/nl010-opus/team-2/evidence/apply4/`. The
base was the index.html committed at a72c175, sha256 `390b15ae…`, which contains another team's rewrite of `edFly`
(`edBand`/`edAim`). The rebased `handoff/04-loader/index.html.patch` (sha256 `59911f4b…`) applies with `patch -p1`, all
hunks. `index.patch` then applies on top with no fuzz, at offsets −4 and −37. Both patches are still moving; the
integrator must re-run this pair on the base it actually uses.
The E rows below are keyed at 96736f5, where they remain true. ROADMAP step 2's phrase "wrapping `edCard` and `fillLines` through the hook table" is met by
that delegation, not by a hook.

| # | hook / engine line | key | fragment |
|---|---|---|---|
| E1 | the page script is a module: its top-level names are not on `window` | kuiper-belt@96736f5 editions/202611012135/index.html:102 | `<script type="module">` |
| E2 | `edCard(i)` today, Edition 4 | kuiper-belt@96736f5 editions/202611012135/index.html:655 | `function edCard(i){` |
| E3 | today the header is the title… | kuiper-belt@96736f5 editions/202611012135/index.html:659 | `'<b>' + esc(b.title) + '</b>` |
| E4 | …and the register quote is shown, never `line_text` | kuiper-belt@96736f5 editions/202611012135/index.html:661 | `(b.quote ? '<div class="cq">' + esc(b.quote) + '</div>' : '')` |
| E5 | edCard sets the target ring and selection (the module keeps this: `show` sets `KY.sel.target` and `KY.lit.repo`) | kuiper-belt@96736f5 editions/202611012135/index.html:666 | `target = { x:b.x, y:b.y }; edSel = i; dirty = true;` |
| E6 | `edFly(b)`: unchanged by step 2 | kuiper-belt@96736f5 editions/202611012135/index.html:676 | `function edFly(b){` |
| E7 | edFly measures the card only while `display === 'block'` (`show` sets display block before the caller's edFly, so B3's clear-space rule still holds) | kuiper-belt@96736f5 editions/202611012135/index.html:677 | `card.style.display === 'block' ? card.getBoundingClientRect().height + 12 : 0` |
| E8 | every caller is `edCard(i); edFly(b)`: e/E | kuiper-belt@96736f5 editions/202611012135/index.html:683 | `edCard(edSel); edFly(b); }` |
| E9 | spark tap | kuiper-belt@96736f5 editions/202611012135/index.html:689 | `if (best >= 0) { edCard(best); edFly(edPlaced[best]); }` |
| E10 | LINES row pick | kuiper-belt@96736f5 editions/202611012135/index.html:734 | `edCard(i); edFly(b);` |
| E11 | the layer-aware next/previous | kuiper-belt@96736f5 editions/202611012135/index.html:749 | `edCard(edSel); edFly(b); }; }` |
| E12 | `describe(a)`, the wafer position in the details (module `render` via `H.describe`) | kuiper-belt@96736f5 editions/202611012135/index.html:284 | `function describe(a){` |
| E13 | describe ends | kuiper-belt@96736f5 editions/202611012135/index.html:292 | `}` |
| E14 | `fillLines` (K6; ROADMAP writes `:737-744`, measured :736-743) | kuiper-belt@96736f5 editions/202611012135/index.html:736 | `function fillLines(){` |
| E15 | today a LINES row is repo, path:line, title: no line text | kuiper-belt@96736f5 editions/202611012135/index.html:741 | `'"><b>' + esc(b.repo) + '</b> '` |
| E16 | `esc` escapes `& < > "` (enough for a text node and a double-quoted href) | kuiper-belt@96736f5 editions/202611012135/index.html:681 | `function esc(v){` |
| E17 | `fmt` = en-GB grouping, so the key row reads `key 36,064,705,400` | kuiper-belt@96736f5 editions/202611012135/index.html:125 | `toLocaleString('en-GB')` |
| E18 | `#card` element | kuiper-belt@96736f5 editions/202611012135/index.html:91 | `<div id="card"></div>` |
| E19 | Edition 4's phone cap 34vh (B3) | kuiper-belt@96736f5 editions/202611012135/index.html:82 | `max-height:34vh` |
| E20 | hook `describe` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:20 | `` `describe(a)` → text `` |
| E21 | hook `address` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:19 | `` `address(k)` `` |
| E22 | hook `fmt` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:29 | `` `fmt(n)` `` |
| E23 | hook `esc` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:31 | `` `esc(v)` `` |
| E24 | hook `card` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:38 | `` `card` \| element `#card` `` |
| E25 | hook `gbox` (Escape must not close the card while the finder is open, module keydown listener) | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:39 | `` `gbox` `` |
| E26 | `KY.lit` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:58 | `` `KY.lit` `` |
| E27 | `KY.sel` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:59 | `` `KY.sel` `` |
| E28 | `KY.redraw()` | kuiper-belt@WT editions/202611012135/handoff/04-loader/HOOKS.md:60 | `` `KY.redraw()` `` |
| E29 | index.patch: edCard delegates to the module | kuiper-belt@WT editions/202611012135/handoff/02-card/index.patch:8 | `const LC = window.KY && KY.modules && KY.modules['line-card'];` |
| E30 | index.patch: delegation keeps the page's selection | kuiper-belt@WT editions/202611012135/handoff/02-card/index.patch:9 | `LC.api.show(b, { index:i, of:edPlaced.length, onclose:` |
| E31 | index.patch: a LINES row comes from the module | kuiper-belt@WT editions/202611012135/handoff/02-card/index.patch:21 | `LC.api.row(b, i,` |

`requires` in the registration (F5) is `card esc fmt address describe sel lit redraw gbox`. A grep of the module
for `H.*` and `KY.*` finds exactly these nine names used and no others. All nine are in HOOKS.md's admissible set
(hooks ∪ `cam lit sel redraw draw panels`).

## F. The module: header, licence line, wordings, findings

Module checked: `editions/202611012135/modules/202611012143-line-card.js`. Its bytes and sha256 at the final check are
in section G. The file changed three times during the review (27e1cf5a…, 77a4e60e…, 3f48b2a0…), so the rows below are
re-keyed by `/tmp/nl010-opus/team-2/evidence/rekey.py` before G is run. `node --check` passes,
and the file contains exactly one `KY.register(`.

| # | claim | key | fragment |
|---|---|---|---|
| F1 | header line 1, the form of ROADMAP 4.3; it matches the loader's regex (loader :79; run: `['line-card','202611012143']`) | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:1 | `/* kuiper module line-card, generation 202611012143 (UTC), Apache-2.0 (kuiper-belt) */` |
| F2 | requires list in the header = the registration's | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:2 | `// requires: card esc fmt address describe sel lit redraw gbox` |
| F3 | the law as the head comment (team-1/STEPS.md K3: "and as a comment at the head of the card module") | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:6 | `// The line of code is the header. Every card opens with the line itself` |
| F4 | the NL-009 02-card patch is named as folded in | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:16 | `NL-009 round 1 patch 02-card (FABLE-02) folded in` |
| F5 | registration requires | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:82 | `requires: ['card', 'esc', 'fmt', 'address', 'describe', 'sel', 'lit', 'redraw', 'gbox'],` |
| F6 | K0 handles a missing field and a `null` (B2): `typeof === 'string'`, not `'line_text' in b` | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:78 | `typeof b.line_text === 'string'` |
| F7 | K1 row 1: the header is `line_text`, escaped | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:102 | `esc(b.line_text) + '</code>'` |
| F8 | the register quote row only when it differs (216 of 344, C) | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:108 | `b.quote !== b.line_text` |
| F9 | K2 aria-label = the header | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:134 | `card.setAttribute('aria-label', header(b));` |
| F10 | the NL-009 handle is `.lc-grip`, not `.ch` | kuiper-belt@WT editions/202611012135/modules/202611012143-line-card.js:58 | `#card.lc .lc-grip{display:none}` |
| F11 | NL-009 02-card used `.ch` for the handle and hid it on a desktop… | neural-link@b9b7d5d FIXES/NL-009/round1/02-card.md:107 | `#card .ch{display:none}` |
| F12 | …and squeezed it to 36×4 px on a phone | neural-link@b9b7d5d FIXES/NL-009/round1/02-card.md:120 | `#card .ch{display:block;width:36px;height:4px` |
| F13 | ROADMAP K1 names the header `<header class="ch">` | neural-link@b9b7d5d FIXES/NL-010/ROADMAP.md:139 | `<header class="ch"><code>` |
| F14 | the shell's ABOUT slot carries the sentence first (B4) | kuiper-belt@WT editions/202611012135/modules/202611012143-kuiper-shell.js:460 | `var law = el('p', 'gm-prose', 'The line of code is the header.` |
| F15 | the slot is owned by line-card | kuiper-belt@WT editions/202611012135/modules/202611012143-kuiper-shell.js:462 | `law.setAttribute('data-owner', 'line-card'); law.setAttribute('data-law', 'L11');` |
| F16 | NL-009 02-card F3 (a tap on the card re-picks a spark) is closed by Opus 4's loader patch: the spark picker returns unless the target is the canvas and tapUp holds. Team 2's index.patch does not do it | kuiper-belt@WT editions/202611012135/handoff/04-loader/index.html.patch:160 | `e.target !== cv \|\| !tapUp` |
| F17 | 02-card F3 as found | neural-link@b9b7d5d FIXES/NL-009/round1/02-card.md:33 | `a tap on the card where a spark lies beneath it re-picks that spark` |

F-a, the three wordings are identical (B4). Compared byte for byte by a Python script in this session, these all equal
the team-1 STEPS.md K3 text. That text is 167 bytes, ASCII, sha256 prefix `ebfba04c477b898c`.
- the module header comment (:6) and `var LAW` (:21)
- `handoff/02-card/LAWS-L11.patch` (the added sentence line)
- `handoff/02-card/README-card-law.md` line 3
- the edition `README.md`
- the shell's ABOUT paragraph (kuiper-shell.js:457-458, concatenated; the shell file is still moving, so re-key at hand-off)
- ROADMAP step 2 K3

Two further checks, both with whitespace flattened:
- L11's body in the patch, without that sentence, equals team-1/STEPS.md K5.
- Its **Falsified by** line equals ROADMAP K5's. The README section's Falsified-by equals the patch's.

`git apply --check editions/202611012135/handoff/02-card/LAWS-L11.patch` passes at the repository root. The patch's
`---` separator follows LAWS.md's own form (`---` at :10, :24 … :137). **Identical: CONFIRMED.**

F-b, a deviation that is justified. ROADMAP K1 (F13) names the header `.ch`. The NL-009 02-card patch, which step 2
must fold in, already uses `.ch` for its handle (F11, F12). If it were folded in verbatim, the header would be hidden on
a desktop and 4 px tall on a phone. The module names the header `.lc-h` and the handle `.lc-grip`, and that is right.
team-1/STEPS.md B1 reads "first element child is `header.ch`", so any test written from STEPS.md must use `header.lc-h`.
The module's first element child is `div.lc-in`, and the header is its first child. The ROADMAP's B1 wording ("first
visible text node") holds.

F-c, the 1,240,449-character header (C). The law shows the line verbatim. The lead's revision (module `LONG = 2000`,
the `lc-long` class) lays a line longer than 2,000 characters out unwrapped (`white-space:pre`), scrolling sideways
inside the header. It adds the dim words "one line of 1,240,449 characters, verbatim; it scrolls sideways" inside the
header, after the code, so the key is still the next row. Every byte stays in the header: `code.textContent ===
line_text` was true in every run below. Measured by the evidence officer with
`/tmp/nl010-opus/team-2/evidence/t/bigline.cjs` (index.html served as Edition 5 + the 04-loader patch + index.patch,
manifest order `line-card`, the module as on disk at 22:14 UTC), with `api.show(body)` followed by
`getBoundingClientRect()`:

| device | short card, key 36,064,705,400 (78 chars): show + layout | long card, key 63,013,167,769: show + layout, first / second | to the second frame, first | card share | header scrollWidth |
|---|---|---|---|---|---|
| Pixel 7 | 6.6 ms | 2,877 ms / 1,523 ms | 3,220 ms | 0.301 | 8,961,759 px (one line, 17 px tall) |
| Galaxy S24 | 6.5 ms | 3,586 ms / 1,427 ms | 4,287 ms | 0.340 | 8,961,759 px |

The container's load average was 86-95 during the run (`uptime` before and after), because other teams' browsers were
running, so these are upper bounds for this container, not phone numbers. Two earlier runs under the same load gave
15,258 ms (Pixel 7) and 16,528 ms (Galaxy S24) for the first show. The module comment states 9,313 ms wrapped and
201 ms unwrapped. The evidence officer did not reproduce 201 ms: under this load the unwrapped first show costs
1.4-3.6 s. The hand-off should give its own number together with the load average it was measured under. The card cap
holds: 0.340 ≤ 0.34 on the Galaxy S24, exactly at the cap. Screenshot: `/tmp/nl010-opus/team-2/evidence/t/big-Galaxy-S24.png`
(not in img/, which is the tester's). The header must not be truncated, because truncation would falsify L11.

F-d, NL-009 02-card folded in, by the module's CSS and listeners:
- F1 → `.lc-x` 44×44 (44×48 on a phone).
- F2 → `.lc-a`, a 44 px action row on a phone.
- F3 → Opus 4's tapUp (F16). PLAN.md says index.patch, but the guard is not in index.patch.
- F4 → `.lc-behind`, set by a MutationObserver; there is no `setPanel` wrap.
- F5 → `34dvh` and the safe-area padding.
- F6 → 12 px type on a phone.
- F7 → `.lc-grip`, the swipe-down close and the Escape close.
- F9 → `overscroll-behavior:contain; touch-action:pan-y`.
- F10 → `close` sets `KY.sel.target = null` (the close un-targets the spark).

F-e, the README example (`README-card-law.md`, "A card, rendered") is abridged. In the module, the details also hold
`quote check: exact` (:112) and the `describe()` wafer-position lines (:113). The example shows neither. Either add the
two rows, or mark the example "details abridged".

## G. Key check

`python3 -I /tmp/nl010-opus/team-2/evidence/check_keys.py EVIDENCE.md` (run from this folder):

```
rows 70 PASS 70 FAIL 0
```
Run at 23:22 UTC. The module at that time: 14,495 bytes, sha256
`788256a97844c184ec5bdd0c7784e2dc217ffbbd48ca535fbbbeba44f468e5ed`, equal to `MODULE.sha256` and `MODULE.json`.
`node --check` passes, the file has one `KY.register(`, and line 1 matches the loader's header pattern.

## H. Evidence officer's review of the hand-off (verdict)

`HANDOFF.md` / the HANDOFF comment had not been written when this review closed (23:22 UTC). The materials it will
rest on were reviewed:

| item | verdict | evidence |
|---|---|---|
| module header (name, stamp, licence line, requires) | PASS | F1, F2, F5: Apache-2.0 (kuiper-belt) is right; no CERN-OHL-S or GridAtlas code is copied (LICENCE.txt) |
| three wordings identical (B4) | PASS | F-a: module, README section, edition README, LAWS-L11.patch and shell ABOUT, each 167 bytes, the same bytes |
| 128 / 212 measurement | PASS, reproduced | C: 128 equal and 212 differ of 340 non-empty; 216 register-quote rows; 4 empty; 7 quote_key |
| seven quote_not_at_line rows | PASS | D: all at line + 1; key.py confirms the line at both keys |
| Kuiper hooks | PASS with a note | E: `describe`, `card`, `esc`, `fmt`, `address`, `gbox`, `sel`, `lit`, `redraw` are in kuiper.hooks.v1. `edCard`, `edFly`, `fillLines` are not hooks; they are reached by index.patch delegation, which is what the ROADMAP's "wrapping" means here |
| MODULE.sha256 / MODULE.json = file | PASS | G |
| test.cjs | Pixel 7 PASS 16/16 and 10/11 static, 0 console errors (tester `run-after/report.json`, 23:19 UTC). **Galaxy S24 not finished at review time.** Static S3m FAIL is the integrator's modules.json, not team 2's |
| B5 (`key.py` round trip) | NOTE | C5: key.py prints 200 characters; B5 must compare `line_text[:200]`. The test reads key text through the page, so state this in the HANDOFF |

Conditions on the HANDOFF comment before it is posted:
1. Post only after test.cjs passes on **both** Pixel 7 and Galaxy S24 with zero console errors (OPUS-BRIEF, Tester).
2. Quote the module sha256 `788256a9…` and re-hash at the moment of posting. The file changed four times during this
   review.
3. Name NL-009 02-card as folded in, F1-F10, and say that F3 is closed by Opus 4's tapUp, not by index.patch
   (F16). PLAN.md's design paragraph still says index.patch.
4. State the `.lc-h` deviation from ROADMAP K1's `.ch` and the reason (F-b).
5. State the long-line handling (`LONG = 2000`, unwrapped, verbatim) with the measured cost and the load average
   (F-c). The 201 ms in the module comment was not reproduced under load 86-95: 1.4-3.6 s.
6. Name the open REQUESTs: Opus 10 (index.patch after the 04-loader patch, the modules.json record, README kept,
   LAWS-L11 in PR B); Opus 1 (ABOUT slot bytes kept); Opus 3 (`api.show` / `api.rowInner`).
7. Either fix the README example (F-e: details abridged) or label it abridged.

**Verdict: PASS WITH CONDITIONS.** The keys, the licence and the wordings are sound. The HANDOFF may be posted once
conditions 1-2 hold, and it should carry 3-7. The HANDOFF text itself was not reviewed because it did not exist yet:
NOT EVALUATED.
