# EVIDENCE: Opus team 8, step 8, the drift of an edition from the live heads

Written by the OPUS-8 evidence officer (started 2026-11-02 00:02 UTC by `date -u`). It takes over the draft the lead
wrote while holding this slot: the lead's measurements are kept where I re-measured them and they held, and corrected
where they did not (section L lists each correction). Every number below was measured on this machine between 00:02 and
00:15 UTC; every claim has a key `repo@sha path:line`. `kb` = kuiper-belt. `kb@018b46a` is kuiper-belt main at the cut
(the edition's `cosmos/` and `tools/edition_keys.py` are byte-identical to it, measured with `git diff --quiet 018b46a`),
`kb@96736f5` is the commit HOOKS.md is keyed to, and `kb@0cd7910` is the edition branch as the harness committed it at 23:59:40.
Scratch: /tmp/nl010-opus/team-8/evidence/ (check.out, live.out, drift.live.json, drift.live2.json, quotes.jsonl).
No Playwright run by me (machine loaded, as instructed). The page results quoted are the team's test.cjs run.

## 0. Verdict on the lead's HANDOFF draft (/tmp/nl010-opus/team-8/lead/handoff.md, 00:03 UTC)

**PASS WITH CORRECTIONS. Post it only after these six edits.** The numbers it states are true at the recorded heads,
and I re-measured each one (sections D to J).

1. Replace "No builder/tester/evidence officer appeared; the lead did all four parts". It is no longer true: the tester
   wrote `handoff/08-drift/drift_test.py` (RESULT: PASS 14 of 14, /tmp/nl010-opus/team-8/tester/drift_test.out) and
   TEST.md, and the evidence officer wrote this file and LICENCE.txt. Add `drift_test.py` to the EVIDENCE list.
2. Say what the heads are as of. drift.json records heads observed 2026-10-31T23:26:48Z to 2026-11-01T21:35:16Z. At run
   time two of them had moved: globalgrid2050 35b5be2 → 3248bf7 (fetched 2026-11-01T23:51:08Z) and kuiper-belt
   018b46a → e92ad5d (2026-11-02T00:06:59Z, PR A's merge). I re-ran the tool at the new heads (00:10:11Z, section D):
   **the same 309/7/2/0/28; 95 rows differ only in `head` (34 globalgrid2050 + 61 kuiper-belt), 0 in class or
   head_line**. Suggested line: "drift.json is as of its recorded heads; re-observed at 00:10 UTC two heads had moved
   (globalgrid2050, kuiper-belt) and no row's class changed."
3. `tools/drift.py` no longer matches MODULE.sha256. The file was edited at 00:01:50 (a docstring line, `:136-160,
   :207-213` → `:136-159, :209-215`, one line changed, same 26,522 bytes). Its sha256 is now
   `29fdb05e5717aee41a5b0ed149b715bf4d997cdbee045bef90da9dd7a6b6080e`, not `caa61fd4…`. Update MODULE.sha256 (and
   the hash in section A of this file follows the file). P1 and P3 still pass with the edited file (my `--check`, 00:08Z).
4. GONE `atlas/current.json:14` is a re-indent, not a removal. At the head 41729af line 14 is ` "cartridge_order": [`
   (one space) where the edition has `  "cartridge_order": [` (two spaces), measured with `cat -A`. The byte rule
   makes it GONE, and that is correct under the law, but the HANDOFF should not imply that the cartridge order went
   away. `:576` (`"derived_from": "./cartridges/202609241334-sld-sandbox-v9-8.js",`) really is gone: the path survives
   only as `"path": …` at line 87.
5. Three of the 309 SAME rows are `quote_not_at_line` bodies whose `line_text` is the line before the finding's quote
   (section H): gridatlas tools/release/acceptance.mjs:15 ` *`, maths 08a-…md:17 three backticks, ventus-grid-engine
   deeplink/contract.js:67. SAME is true of the line the key points at. It does not mean the quoted finding is
   intact. Add one clause.
6. Licence key: kb@018b46a README.md:**156-157** holds "Code is licensed / under Apache-2.0 … documentation and
   generated data under CC BY 4.0", and line 155 is blank (measured with `sed -n 153,159p`). LICENCE.txt is corrected.
   LAYER.json is also corrected (its `licence` line said 155-156).

Things I checked and found right: the envelope (PROTOCOL form, ends with blank line, `---`, the Claude Code line),
counts, MOVED list, GONE list, UNVERIFIED reasons, team-4 reproduction (0 of 346 rows differ, re-measured), the module
sha256, the 18 hooks (each one is used, and no hook is used that is not listed), card wording, the K1 note. Not posted by me (the lead posts).

## A. What the team wrote (sha256 measured 00:13 UTC)

| file | bytes | sha256 | header licence line |
|---|---|---|---|
| `editions/202611012135/modules/202611012325-drift.js` | 22,294 | `18f7019aad915920e79c1f279ad688f3ccd4f1dd96ff23a992520c19b37fdd8d` (= MODULE.sha256, = MODULE.json) | line 1 `Apache-2.0 (kuiper-belt code)`; name, stamp, requires, provides present (:1, :18-20) |
| `editions/202611012135/data/drift.json` | 118,553 | `388103129b904a4a038d18adc26b703c144dede2d09497d13fe6223b30b5d103` (= MODULE.sha256) | `licence` field `CC BY 4.0 (kuiper-belt data); quotes no line text` |
| `tools/drift.py` | 26,522 | `29fdb05e5717aee41a5b0ed149b715bf4d997cdbee045bef90da9dd7a6b6080e` (**≠ MODULE.sha256 `caa61fd4…`**, verdict item 3) | line 2 `Apache-2.0 (kuiper-belt code)` |
| `handoff/08-drift/drift_test.py` (tester) | being edited | n/a | line 2 `Apache-2.0` |
| `handoff/08-drift/test.cjs` (tester) | being edited | n/a | licence line added by the evidence officer (line 2), see LICENCE.txt |

## B. keys.json: the fields, where each is made, and where the drift reads it

`editions/202611012135/keys.json` is one line of minified JSON (0 newlines, 1,709,129 bytes, sha256
`1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b`, the value drift.json `inputs` records). So a
field has no line of its own. Each one is keyed instead to **the line of code that writes it** and the line that reads it.
Top level `{summary, bodies}`; `summary.bodies` 346, `on_wafer` 344, `verified` 344, `keyed` 344, `quote_matches` 337,
`quote_not_at_line` 7 objects, `not_on_wafer` 2, `not_verified` 0, `commits_walked` 34 (measured).

| field (bodies[], count present) | written by | read by the drift |
|---|---|---|
| `id` (346) | kb@018b46a editions/202610311905/tools/edition_belt.py:73 `"id": key` | tools/drift.py:288 `row['id'] = b['id']`; module card lookup |
| `repo` (346) | edition_belt.py:73 | drift.py:234 (the repositories), :285; module :209 card line |
| `commit` (346) | edition_belt.py:73 | drift.py:293 `row['edition_commit'] = b['commit']`; module :209 `sha7(b.commit)` |
| `path` (346) | edition_belt.py:73 | drift.py:291, :314 `git cat-file` `<head>:<path>` |
| `line` (346) | edition_belt.py:73 | drift.py:292, :322-323 the SAME test at `line - 1` |
| `key` (346; null for 2) | kb@018b46a tools/edition_keys.py:249 `rec['key'] = c['k0'] + before + (line - 1)` (law :12) | drift.py:289, :300 (null → UNVERIFIED); module :197 `H.keyPlace(b.key)` |
| `on_wafer` (346) | edition_keys.py:179 (False), :193 (True) | drift.py:300 `b.get('on_wafer') is False` → UNVERIFIED "key not on the wafer" |
| `line_text` (346; empty for 4) | edition_keys.py:250 `text = body.split(b'\n')[line - 1].decode('utf-8', 'replace').rstrip('\r')`, :251 `rec['line_text'] = text` | drift.py:302 (empty → UNVERIFIED), :320 `text = b['line_text']`, compared by :170-171 `line_at` (the same decode and rstrip) |
| `lines_before` (346) | edition_keys.py:230 `rec['lines_before'] = before` | drift.py `--check` P3 re-walks it at the edition commit for the 7 MOVED (0 disagreements) |
| `quote`, `quote_check`, `quote_matches` (346), `quote_line`, `quote_key` (7) | edition_belt.py:77 (`quote[:160]`); edition_keys.py:252-268 | **never read** by drift.py (no fallback to `quote`: `grep -n quote tools/drift.py` matches only :4 and :370, both prose) |
| `k0`, `wafer_row`, `commit_lines_wafer`, `repo_on_wafer` | edition_keys.py:193-194 | not read |
| `repo_name_differs` (61, all kuiper-belt → `Kuiper-belt`) | edition_keys.py:195-196 | not read. The matching rule is drift.py:76-83 `tsv_name` (exact, then case-insensitive) |
| `blob`, `blob_at_path`, `blob_lines`, `blob_matches_body`, `commit_lines_measured`, `verified`, `reason` | edition_belt.py:73; edition_keys.py:224-277 | not read |
| `title, pattern, worker, finding, class, line_end, destination, open` | edition_belt.py:74-80 | not read |
| `k, x, y, r, theta` | edition_belt.py:94 | module only (placement of the edition's own spark, through keys-min.json) |

The page reads `keys-min.json` first (`kb@0cd7910 editions/202611012135/index.html:649 EDPATH = 'keys-min.json',
EDFULL = 'keys.json'`). The module reads it the same way for line text and placement. keys-min.json bodies carry `id,
key, on_wafer, verified, class, title, repo, path, line, quote, destination, commit, pattern, worker, finding,
line_text, quote_check` (measured, first body).
Note: edition_keys.py:304 writes `indent=1`, but the edition's keys.json has no newlines and carries `summary.roundtrip`
and `roundtrip_tool`, which edition_keys.py:280-302 does not write. So the file was re-serialised after the tool ran.
DISCLOSED: I did not find the step that re-serialised it. The bodies' values are what the tool's lines above produce.

## C. cosmos/repos.tsv: the columns, and the 22 repositories of keys.json

kb@018b46a cosmos/repos.tsv:1 `# repo_index	name	lines` (tab-separated; 99 lines = 1 header + 98 rows; sha256
`0aadce5b97a3260cf4928cca82030f755a6ce2b63b2f3d96d1cc7e5b0ab72751`, the value drift.json `inputs` records). The drift reads
**column 2 `name` only**: tools/drift.py:68-73 `l.rstrip('\n').split('\t')[1]`, skipping `#` lines. `repo_index` is
what wafer.tsv column 3 points at. `lines` is the per-repository sum that the wafer must equal or refuse (kb@96736f5
editions/202611012135/index.html:202 `repos = rr.map(p => ({ i:+p[0], name:p[1], lines:+p[2], ...`). P5 "no repository
outside repos.tsv": all 22 are rows:

| repos.tsv line | row | | repos.tsv line | row |
|---|---|---|---|---|
| :7 | `5	Kuiper-belt	21948444` (case differs; tsv_name matches it) | | :48 | `46	pipelinenews	1310639243` (no clone) |
| :9 | `7	particle-physics-drawing-engine	11684055` | | :52 | `50	data-centres-gb	51033` |
| :11 | `9	elements	643461` | | :68 | `66	globalgrid2050	41877174755` |
| :12 | `10	galaxies-wafers	10388257` | | :76 | `74	kuiper-drawing-engine	28347` |
| :21 | `19	stars	366853541` | | :86 | `84	time-stone	239974` |
| :22 | `20	star-maker	22207132` | | :88 | `86	trillion-loop	2387` |
| :25 | `23	gridmachine1	244231` | | :89 | `87	worlds-	10870441` |
| :36 | `34	ventus-grid-engine	5299204` | | :93 | `91	energy-transition-simulator	3143947` |
| :40 | `38	data-grid-gb	17570882` | | :96 | `94	maths	15266` |
| :41 | `39	grid-distance-maths	10571` | | :43 | `41	cvaa	273381` |
| :45 | `43	data-gridatlas	445524` | | :46 | `44	gridatlas	1080208664` |

The new keys of the MOVED rows use cosmos/wafer.tsv (header kb@018b46a cosmos/wafer.tsv:1 `# unix	lines	repo_index
sha12	gap_before`): the head commits are rows :13252 `1793482407	364588	38	01a4491dc66e	51600` (data-grid-gb) and
:13287 `1793487191	1514396	44	41729af0b49d	65400` (gridatlas). kuiper-belt main e92ad5d has a larger wafer (66 more
rows in cosmos/wafer.tsv), but the edition branch's cosmos/ is still 018b46a's (measured), and that is what the page serves.

## D. The live heads of the 25 clones at run time

`refs/remotes/origin/HEAD` of each clone under /home/user/estate, read 2026-11-02T00:09:57Z (`git rev-parse`; FETCH_HEAD
mtime UTC). For comparison, the head drift.json recorded and the checked-out HEAD. 25 clones = the 21 of keys.json's
22 repositories that have a clone, plus 4 that keys.json does not name. pipelinenews has no clone.

| clone | origin/HEAD at 00:09:57Z | fetched | drift.json `heads` | checked-out HEAD (if different) |
|---|---|---|---|---|
| code-generator | 857ea81244848b1da8fe21fffaed74cab568a3b4 | 2026-10-31T23:26:48Z | not in keys.json | |
| cvaa | 877bf380202b6a922932afc0bdcfd7f42a183086 | 2026-10-31T23:26:48Z | same | |
| data-centres-gb | f9f47286fae63872375c558fc89ff4b1793914e4 | 2026-10-31T23:26:49Z | same | |
| data-grid-gb | 01a4491dc66ec4e6319a05a394926043b9d992f9 | 2026-10-31T23:26:49Z | same | 75ab8ae (fix/nl007-operator-canon) |
| data-gridatlas | 8bf88da9e210ce9f61dc0398869d3369f3fa2445 | 2026-10-31T23:26:49Z | same | |
| elements | f7a92fb085c38dcbbd5cb469a66cd5ca61fb95bf | 2026-10-31T23:26:50Z | same | |
| energy-transition-simulator | a6b5ae63cc0eeb4d619f154c7e116616c997af77 | 2026-10-31T23:26:50Z | same | |
| galaxies-wafers | fff6fc6ad4f93a15fe8f6456942a1b44e5547105 | 2026-10-31T23:26:50Z | same | |
| **globalgrid2050** | **3248bf7f1c3dca8c03864c4d271cfe5d51e24f24** | **2026-11-01T23:51:08Z** | **35b5be2fa446 (moved since)** | c66759f |
| grid-distance-maths | 8e91b07d8312acca5bcaef43e839f06a3b1d642a | 2026-10-31T23:26:51Z | same | |
| gridatlas | 41729af0b49dcfbe8f2a3ebc485eff217a61b84d | 2026-10-31T23:26:56Z | same | 5ec7f62 (preview/202610312138-gridatlas-v9.188) |
| gridmachine1 | c6cbf9686eea1aa148b2e4616b7d603e6a93b450 | 2026-10-31T23:26:56Z | same | |
| **kuiper-belt** | **e92ad5dde7ccfd28e9b04b63e02499c4fcfb3111** | 2026-11-02T00:04:40Z (FETCH_HEAD does not name it; reflog 00:06:59Z) | **018b46aed50f (moved since; b9901d4 at 00:03Z)** | 01ca766 (edition/202611012135) |
| kuiper-drawing-engine | ee69a07a7ebf71f2f20c052f392991f115fdbee0 | 2026-10-31T23:26:57Z | same | |
| kuiper-ship | 668ff0897022d5c14635198939673de3d9a66ce9 | 2026-10-31T23:26:57Z | not in keys.json | |
| maths | b898a5ee39aa81a45197c5f17ba1195727aa538e | 2026-10-31T23:26:57Z | same | |
| particle-physics-drawing-engine | e51127791aab091ccb96f0b4eab807c02a9d116e | 2026-10-31T23:26:58Z | same | eb52ad7 |
| star-maker | f65c2f381d91eeb1eba75a97ae6765c24e32197d | 2026-10-31T23:26:59Z | same | |
| stars | 529ae15839ddfb586960fd4805df16e8049c9a01 | 2026-10-31T23:27:04Z | same | cbca125 |
| substations | 7d3f8233d3f01ee5f069727f21e387d90a280c26 | 2026-10-31T23:27:04Z | not in keys.json | |
| testcode | d09c185c8dacbc5c73afb2b0d0d8dad40745a544 | 2026-10-31T23:27:05Z | not in keys.json | |
| time-stone | c507d8ce86392411afbd14190ccd22ff978c7ca1 | 2026-10-31T23:27:06Z | same | a1703b1 |
| trillion-loop | 35fdea2f2744df338cfa7e28200e18008b307e73 | 2026-10-31T23:27:06Z | same | |
| ventus-grid-engine | 5eead830d99021c90fd58add2f8bf05b0b752340 | 2026-10-31T23:27:07Z | same | 96a800e |
| worlds- | b5f15716486c3ff509c56914fbee06f2e6aec2d8 | 2026-10-31T23:27:07Z | same | |

The moved heads: globalgrid2050@3248bf7 (2026-11-01T23:38:58+00:00, "kuiper-editions: the door on globalgrid2050.com to the
newest Kuiper edition") and kuiper-belt@e92ad5d (2026-11-02T00:05:55+00:00, "Publish Kuiper Edition 5 preview folder
(202611012135); pointer stays on Edition 4"), with b9901d4 (22:09:33Z, "engine: lines standing and the wafer grown")
before it. **Live re-runs at run time** (`python3 tools/drift.py --out <scratch>`, the default `--ref origin/HEAD`):
00:03:37Z at heads (…, globalgrid2050 3248bf7, kuiper-belt b9901d4) and 00:10:11Z at (…, 3248bf7, e92ad5d). Both gave
**309 SAME / 7 MOVED / 2 GONE / 0 FILE_GONE / 28 UNVERIFIED** and 21 of 22 heads. Against data/drift.json, 95 rows differ,
only in `head`: 34 globalgrid2050 + 61 kuiper-belt (keys.json per-repo counts). 0 rows differ in class or head_line
(scratch drift.live.json sha256 80f2036f…, drift.live2.json 2859593c…). The deliverable stays the cut-time record. E9 re-runs it
with `--heads`, which never re-observes.

## E. The result (data/drift.json, re-checked 00:08 UTC)

346 bodies → **309 SAME, 7 MOVED, 2 GONE, 0 FILE_GONE, 28 UNVERIFIED**; share `309 SAME / 318 (rows 346 - UNVERIFIED
28)` = 0.971698. UNVERIFIED reasons (drift.json `summary.unverified_reasons`): 22 `no clone of pipelinenews in the
estate`; 4 `empty line_text`; 2 `key not on the wafer (on_wafer: false)` (star-maker README.md:115,
machinery/bench/starmaker.mjs:86). Per repository: gridatlas 117 SAME / 2 MOVED / 2 GONE; data-grid-gb 30 / 5 MOVED; every
other repository with a clone has SAME only, apart from its UNVERIFIED rows (summary.per_repo).

## F. The seven MOVED rows, both lines quoted

Each quote is from `git show <commit>:<path>`, line N, LF split, trailing CR stripped (the text rule, kb@018b46a
tools/edition_keys.py:250). In all 7, the edition line equals keys.json `line_text` (True ×7), and the head has exactly 1
occurrence. "now at the old line" is what the head holds at the edition's line number. The new key is
`k0(head row) + head_lines_before + head_line − 1` (edition_keys.py:12), recomputed by me from cosmos/wafer.tsv. It equals the
module's (test.cjs "card names head and new line" prints `key 63,134,296,269` for the first). Each edition key also
recomputes to keys.json `key` (7 of 7).

| # | edition: repo@commit path:line | the line at the edition | head: @sha:head_line (delta) | the line at the head | now at the old line | new key |
|---|---|---|---|---|---|---|
| 1 | data-grid-gb@b57c94d datacentres/lanes/dc-a7-merge/dcmerge.py:122 | `def operator_match(a, b):` | @01a4491 :128 (+6) | `def operator_match(a, b):` | `def _op_core(s):` | 63134296269 |
| 2 | same file :211 | `def url_link(a, b, dist):` | @01a4491 :217 (+6) | `def url_link(a, b, dist):` | (empty line) | 63134296358 |
| 3 | same file :236 | `    # Hard guard BEFORE planning refs, connection refs or shared URLs. Even a` | @01a4491 :242 (+6) | `    # Hard guard BEFORE planning refs, connection refs or shared URLs. Even a` | `def compare(a, b):` | 63134296383 |
| 4 | same file :412 | `    # MW: each field on its own; never across fields` | @01a4491 :418 (+6) | `    # MW: each field on its own; never across fields` | `    out["status_source_id"] = sts[0][1] if sts else None` | 63134296559 |
| 5 | same file :514 | `def merge(records):` | @01a4491 :520 (+6) | `def merge(records):` | (empty line) | 63134296661 |
| 6 | gridatlas@9118a2d tools/ci/202609012200-local-ci.mjs:351 | `   Codex found the original on 202609012230: the topology proof skipped` | @41729af :367 (+16) | `   Codex found the original on 202609012230: the topology proof skipped` | `/* ═══…` (a rule line) | 63176411212 |
| 7 | gridatlas@93c13cf atlas/parts/202609012045-sld-sandbox-body.js:409 | `  /* Published so a reviewer can ask the page whether any answer it gave` | @41729af :751 (+342) | `  /* Published so a reviewer can ask the page whether any answer it gave` | ``      + `data-gridatlas-corridor="1" ` `` | 63176246094 |

Why +6 in dcmerge.py: data-grid-gb@01a4491 dcmerge.py:122 is now `def _op_core(s):` and :129 calls it (`na, nb =
norm_operator(_op_core(a)), norm_operator(_op_core(b))`). These are the six lines the NL-007 operator patch inserted above
`operator_match` (01a4491 = "Merge pull request #7 from Ventusltd/fix/nl007-operator-canon"). b57c94d is an ancestor of
01a4491, and 08b5cae is an ancestor of 41729af (`git merge-base --is-ancestor`, measured).

## G. The two GONE rows, both lines quoted

| edition: repo@commit path:line | the line at the edition | at the head 41729af, same line number | where the text went |
|---|---|---|---|
| gridatlas@8e017d5 atlas/current.json:14 | `  "cartridge_order": [` (2 spaces) | ` "cartridge_order": [` (1 space) | **re-indented in place**: the file was re-serialised with one-space indent (738 → 890 lines). GONE is right under the byte rule |
| gridatlas@08b5cae atlas/current.json:576 | `   "derived_from": "./cartridges/202609241334-sld-sandbox-v9-8.js",` | `    "canonical-deep-link-technology-vocabulary",` | removed: the cartridge path survives only as `   "path": "./cartridges/202609241334-sld-sandbox-v9-8.js",` at :87 |

The pointer file at the drift head names `"generation": "202610312138"` (gridatlas@41729af atlas/current.json:3). The
lead's draft cited gridatlas@5ec7f62 atlas/current.json:3 `202610292044`. That is the preview branch's file, not the
head the drift measured (verdict section L).

## H. The seven `summary.quote_not_at_line` rows of keys.json

From keys.json `summary.quote_not_at_line` (written by kb@018b46a tools/edition_keys.py:285-289). The quote checker
(:252-268) found the finding's quoted first line one line below `line` in all seven. Quotes come from `git show
<commit>:<path>` at the edition commit.

| # | repo path:line (key) | `line_text` = the line at `line` | the line at `quote_line` (quote_key) | drift class |
|---|---|---|---|---|
| 1 | globalgrid2050 diary-notes-log/260522-0115-v7-rollback-and-working-method.md:89 (62728320318) | (empty) | :90 `The intended feature was to introduce separate Energy Users layers in addition to Energy Assets. The desired Energy Users were:` (62728320319) | UNVERIFIED, empty line_text |
| 2 | gridatlas tools/release/acceptance.mjs:15 (62884836484) | ` *` | :16 ` * WHAT COUNTS (tools/release/flow-lib.mjs decideAcceptance)` (62884836485) | **SAME** (` *` still at :15) |
| 3 | kuiper-belt README.md:33 (63013108974) | (empty) | :34 `- A statement **with** a key is a fact: anyone can recompute it on any machine and must get the` (63013108975) | UNVERIFIED, empty line_text |
| 4 | data-centres-gb README.md:8 (36064706321) | (empty) | :9 ``The `202608281053` candidate producer:`` (36064706322) | UNVERIFIED, empty line_text |
| 5 | maths 08a-which-way-the-golden-turn-goes.md:17 (60072442240) | three backticks (a code fence) | :18 `222.492236° + 137.507764° = 360°` (60072442241) | **SAME** (the fence still at :17) |
| 6 | ventus-grid-engine deeplink/contract.js:67 (63027326240) | ` * control has ever existed. Measured blast radius: 2,508 of 7,680 register` | :68 ` * rows, a third of the register, reporting green while the layer sat off.` (63027326241) | **SAME** |
| 7 | kuiper-belt learn-the-kuiper/202610050144/NOTICE.md:6 (63013178579) | (empty) | :7 ``Code in this folder is Apache-2.0, as the kuiper-belt repository (see its `LICENSE`); documentation and generated data`` (63013178580) | UNVERIFIED, empty line_text |

So 4 of the 7 are 4 of the 6 empty-line_text UNVERIFIED rows. The other two empty ones are the star-maker bodies,
which are UNVERIFIED as not on the wafer, an earlier rule in drift.py:300-303. The other 3 count among the 309 SAME. The
drift measures the line the key points at, and is right to. Team 4's loose prototype compared through `quote` and turned
#1, #3, #4 into MOVED (+1) and #7 into GONE: their 333/10/3 (team-4/EVIDENCE.md E12; reproduced, section I).

## I. Team 4's numbers, re-measured

- The lead's reproduction file /tmp/nl010-opus/team-8/lead/drift.team4-reproduction.json (their 21 heads plus their
  /home/user/pipelinenews clone, evidence only) against /tmp/nl010/team-4/drift_strict.json: **0 of 346 rows differ** in
  class or head_line; counts 331/7/2/0/6 (I re-measured this at 00:12Z).
- The deliverable against drift_strict.json: rows whose class differs = **22, all pipelinenews** (UNVERIFIED by the refusal
  rule, kb@018b46a README.md:40 "A check that examines nothing refuses. It does not pass."). 331 − 22 = 309, 6 + 22 = 28.
- Heads: ours are the default branches as fetched; team 4's were the checked-out branches (section D, last column).
  The lead measured that the classes are the same at both sets (EVIDENCE draft C.3). I did not repeat that run.

## J. Tests

| test | who ran it, when | result |
|---|---|---|
| `python3 tools/drift.py --check --scratch /tmp/nl010-opus/team-8/evidence` (P1, P2, P3, P5) | evidence officer, 00:08:13 to 00:08:50Z | **RESULT: PASS (7 of 7)**: P1 118,553 / 118,553 bytes, sha256 388103129b904a4a both, and re-run = the file (E9); P2 gridatlas removed → 121 UNVERIFIED, 318 → 197; heads emptied exit 2; stale heads exit 3; P3 309/28/7/2 + 7 re-walks, 0 disagreements; P5 346 = 346, nothing outside repos.tsv or keys.json |
| `handoff/08-drift/drift_test.py` (independent of `--check`) | tester, before 00:09Z | **RESULT: PASS (14 of 14)**, incl. P5 strace: 46 files opened under /home/user = repos.tsv, keys.json, tools/drift.py + 21 clones; 0 sockets |
| `handoff/08-drift/test.cjs` P4, Pixel 7 + Galaxy S24, real touch | team run 2, 2026-11-02T00:02:14Z (TEST.md) | **RESULT: PASS (32 of 32) pre-integration** (modules.json routed; layer registry not admitted, `registry own`). Not re-run by me (no Playwright) |
| `python3 tools/ci_check.py` | lead, 00:05Z (/tmp/nl010-opus/team-8/lead/ci.out) | K1 to K4 PASS |

## K. Keys for the lesson, the laws and every Kuiper hook used (each re-read at its commit by me)

| what | key (verbatim where short) |
|---|---|
| the GridAtlas lesson: a cartridge admitted only when its bytes hash to the record | gridatlas@5ec7f62 atlas/current.json:5 `"architecture": "IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES"`, :31 `"sha256": "60be82…"`; tools/ci/pr-gate.mjs:176 `` `${id}: SHA-256 mismatch for …` `` (the head 41729af keeps :5, measured) |
| drift is the Kuiper's word | kb@018b46a DRIFT.md:1 `<!-- DRIFT:START -->`, :2 `### Host entanglement, 2026-09-19T12:50:01.970Z`; LAWS.md:139 `## L10. Reconciliation: the bond grants only what its words grant` |
| a law must be falsifiable (LAW.md's form) | kb@018b46a LAWS.md:3-4 |
| DISCLOSED is a counted gap | kb@018b46a LAWS.md:157 |
| refusal | kb@018b46a README.md:40 `- A check that examines nothing refuses. It does not pass.` |
| every time carries its offset | kb@018b46a README.md:39 |
| never trusted blind | kb@018b46a tools/key.py:49-50 |
| the key law; the walk; the sum | kb@018b46a tools/edition_keys.py:12 `key    =  k0 + lines_before + (line - 1)`; :136-159 `walk_commit`; :209-215 |
| lines_of, the binary rule | kb@018b46a tools/edition_keys.py:43-46 (copied byte for byte at tools/drift.py:174) |
| the text rule | kb@018b46a tools/edition_keys.py:250 (= drift.py:170-171 `line_at`) |
| the cap (borrowed, DISCLOSED) | kb@018b46a tools/wafer_keys.py:34 `CAP_SECONDS = 14 * 86400          # no silence counts for more than a fortnight` |
| colours | kb@018b46a PALETTE.md:9 grey-blue `#c9d3e6` the record, :11 green `#22ee77`, :12 amber `#ffb000` attention, :19 nothing for decoration; module :29 `INK` uses exactly these three |
| licence | kb@018b46a README.md:156-157 (corrected from 155-156) |
| hook table | handoff/04-loader/HOOKS.md (kuiper.hooks.v1, published on #10 as comment 6564299733, 2026-11-01 21:42:44Z) |

**Hooks the module uses** = its `requires` (module :18 header, :24-25 `REQUIRES`, MODULE.json `requires`, all three
the same 18 in the same order). Each one is used in the body (measured: `grep -o 'H\.[A-Za-z_0-9]*'` gives SPACE card commits
cv esc flyTo fmt hud keyPlace o2 ov repos wafer; `grep -o 'KY\.[a-z.]*'` gives cam, sel, draw.add, redraw, panels.add).
No hook is used that is not in `requires`. Engine lines at kb@96736f5 editions/202611012135/index.html, each re-read:

| hook (HOOKS.md row) | engine line |
|---|---|
| keyPlace (1) | :278 `function keyPlace(k){ const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, …` |
| flyTo (5) | :253 `function flyTo(x, y, z){ tween = { … dur:900 }; }` |
| fmt (12) | :125 `const fmt = n => Math.round(n).toLocaleString('en-GB');` |
| esc (14) | :681 `function esc(v){ return String(v == null ? '' : v).replace(/[&<>"]/g, …` |
| cv, ov, o2 (15-17) | :121 `const cv = document.getElementById('c'), ov = document.getElementById('o'), o2 = ov.getContext('2d');` |
| hud (18) | :123 `const hud = document.getElementById('hud'), big = …` |
| card (21) | :124 `sub = document.getElementById('sub'), card = document.getElementById('card');` |
| SPACE, repos, commits (24, 26, 27) | :198 `let N = 0, SPACE = 0, repos = [], commits = [];` set :202, :204, :208 `N = issued; SPACE = k;` |
| wafer (28) | the wafer promise, resolves after :208 |
| cam (KY member) | :243 `let cx = 0, cy = 0, zoom = 1, dirty = true, tween = null, litRepo = -1, target = null;`, :245 `let atHome = true;` |
| sel (KY member) | :243 `target` |
| redraw (KY member) | :243 `dirty` |
| draw (KY member, `draw.add`) | :332 `function draw(){` |
| panels (KY member, `panels.add`) | :710 `const PANELS = { top: elTop, hud: hud, lines: linesPanel, foot: elFoot };` |

Copied constants and idioms, at kb@0cd7910 editions/202611012135/index.html (patched page): :220-221 commit records
`{ unix, lines, repo, sha, gap, k0 … }`, `c.k1 = k`; :742 `const ED_TAP_TOUCH = 24, ED_TAP_MOUSE = 9, ED_SLOP = 10;`
(module :31); :709 `const ED_Z = 14, …`; :256 `refuse('../../cosmos/wafer.tsv did not load. The wafer will not invent its
keys.')` (module NOLOAD :30 copies its form). Optional APIs: kb@0cd7910 modules/202611012143-line-card.js:126 `function
show(b, o) {`, :140 `state.last = { header: header(b), key: keyText(b), k: b.key };`; modules/202611012141-layers.js:29
`FORMATS` (no `kuiper.drift.v1` yet: REQUESTS item 2), :119 `function register(layer) {`, :122 the throw `layer … not in layers.json`.
The step: neural-link FIXES/NL-010/ROADMAP.md:589-648; team-4/STEPS.md:233-352.

## L. Corrections to the lead's draft of this file, and disclosures

- README licence key 155-156 → **156-157** (line 155 blank). Fixed here, in LICENCE.txt and in LAYER.json `licence`.
- "the pointer file now names generation 202610292044, gridatlas@5ec7f62 atlas/current.json:3" → at the drift head it is
  **gridatlas@41729af atlas/current.json:3 `202610312138`**. 5ec7f62 is the checked-out preview branch.
- "kb@96736f5 … :256" is not the refusal idiom. At 96736f5, :256 is a comment. The idiom is kb@0cd7910 :256 (as the
  draft's later row says).
- tools/drift.py sha256 changed after MODULE.sha256 was written (verdict item 3).
- Heads moved after drift.json was cut (section D). The classes did not change (measured).
- DISCLOSED: no second machine for the re-run. The determinism proof is P1 here plus the tester's two-PYTHONHASHSEED runs.
- DISCLOSED: `observed_at` is the clone's FETCH_HEAD mtime or the reflog, not a live GitHub call. The sandbox's clones are
  the step's only allowed head source. For kuiper-belt@e92ad5d, FETCH_HEAD does not name the sha (the fetch was of the edition
  branch), so the tool fell back to the reflog of refs/remotes/origin/main (00:06:59Z), and said so in `observed_by`.
- DISCLOSED: the edition README states no stale-head cap. The tool borrows 14 d (section K), and README.md (handoff) proposes it.
- DISCLOSED: who re-serialised keys.json is not found (section B note).
