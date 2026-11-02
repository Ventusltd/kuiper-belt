# Opus team 12 "See Through hash reader": EVIDENCE

Evidence officer: OPUS-12 evidence. Written 2026-11-02 00:40-01:00 UTC. Law: no claim without a key (repo@sha path:line);
every number measured (the command is named). No Playwright was run by the evidence officer (machine loaded; the
tester's test.cjs is the Playwright record).

Short forms:

- `kb@aa04b3b` = kuiper-belt@aa04b3b61a61cf35ad024d51dac34a5eb743e295 (branch edition/202611012135 HEAD at the time of
  writing; `git diff HEAD -- see-through/` is empty, so the working tree equals it; the team's files first landed in
  9adcc007cd8c4ec5664191ca0fcf5210f9691c04 and `git diff 9adcc00 aa04b3b -- see-through` is empty).
- `kb@018b46a` = kuiper-belt@018b46aed50f28f7b1882a0dcaba6593ce522beb (Edition 4 main, team 3's base).
- `kb@96736f5` = kuiper-belt@96736f55c2137defcf02c898f8f2b0d04374d74b (edition skeleton; SPACE re-lift source).
- `nl@54c0f04` = neural-link-between-agents@54c0f041e032d7fd0d76e597a04e64ad633970c1 (FIXES/NL-010/team-3 and ROADMAP.md clean).
- `OLD` = `see-through/202610050609/`, `NEW` = `see-through/202611020012/`.

Pinned bytes this evidence describes (re-run `sha256sum` before trusting a line number below):

| file | bytes | sha256 |
|---|---|---|
| NEW descent.js | 168,298 | `3f5e877f48b2e26495b9e0cdd6776e5b15287fe9ccd0318296f52e8db4e28b38` |
| NEW kuiper-law.js | 8,935 | `fbbc5b80cb9be9043c6c699973e36ba6d739ab46d14757358ad50d7b4e0fce1c` |
| NEW README.md | 1,671 | `fa152d908bc45b007b4c58d3be7b0f7e9623a44268b2349d8f2221a3b0f5fe36` |
| see-through/index.html (pointer) | | `d0bf63b2e96e0e4ff874454280ae80cf0a9e6aa05783f85ac2c7332a64f613c6` |
| see-through/README.md | | `06e623a0921c4806b8ea21dd87816d60d6765b967c00a3f2ac7d284e4370bb39` |

## 1. What the team changed, file by file (`diff -rq OLD NEW`, `git diff kb@018b46a -- see-through`)

`diff -rq` reports exactly three files differing: README.md, descent.js, kuiper-law.js. Outside the folder, two files
change: see-through/index.html (3 lines) and see-through/README.md (+4 lines). `git diff kb@018b46a --
see-through/202610050609 see-through/202610050356 see-through/202610050513` is empty (0 lines): no earlier folder touched.

Provenance: kuiper-law.js is byte-identical to team 5's patch applied to OLD (`patch -p1 <
editions/202611012135/handoff/05-see-through/see-through-hash-reader.patch`, sha256 of the patch `325aff9f…d191`; `cmp`
equal). descent.js = team 5's patch + 82 changed lines by team 12 (`diff` of patched OLD against NEW: hunks NEW
:15-18, :918-925, :945, :950, :954-955, :964-1001, :1108, :1179-1180, :1197, :1199, :1205, :1207-1208).

### 1a. NEW/descent.js against OLD/descent.js (17 hunks, 173 changed lines, `diff OLD NEW | grep -c '^[<>]'`)

| OLD line | NEW line (kb@aa04b3b NEW/descent.js) | what changed | by |
|---|---|---|---|
| after :11 | :12-14 | header: the NL-010 step 5 additions, "CERN-OHL-S v2, as the rest of this file", grammar source ROADMAP 5.5 / team-3 STEPS 5.5 | team 5 |
| after :11 | :15-18 | header: team 12's additions (link read after names AND sky; sky re-cut from wafer-meta; key wins over sub; repo exact-then-contains, team 3's refusal words), same licence | team 12 |
| after :36 | :44 | `KUIPER_URL = '../../editions/'` (the Kuiper pointer, kb@aa04b3b editions/index.html:7, :11, :12) | team 5 |
| after :36 | :45 | `KUIPER_LAW_SHA = '96736f55…74d74b'` (credit line) | team 5 |
| after :246 | :256 | `layout()` re-places or hides the STAR KEY home row (5.8 b) | team 5 |
| after :442 | :453 | `back()` at the stars stage, nothing chosen, empty box → `goHome()` (5.8 a) | team 5 |
| :447 | :458-459 | `back()` clears `S.ring`, `S.repoLit` and the hash (`history.replaceState(null,'',pathname+search)`) | team 5 |
| after :521 | :534-535 | X `aria-label` "back to the Kuiper" at the stars stage, "back" otherwise (A7) | team 5 |
| after :597 | :612-617 | draws the key ring (radius 10, `cx + x·ks, cy − y·ks`) and the repo-lit stars, `C.amber`, alpha `1 − D`, only `D < 1` | team 5 |
| after :835 | :856 | credit line at `D < 1`: `Stars placed by the Kuiper law (kuiper-belt@96736f5, SPACE <n>)` | team 5 |
| after :852 | :874-891 | `homeRow()`: 44 px `<a data-st="kuiper-key">` `STAR KEY <k> · OPEN IT ON THE KUIPER` → `../../editions/#key=<k>`, placed above the card | team 5 |
| :854 | :893 | `hideCard()` also hides the home row | team 5 |
| after :858 | :898-899 | `arrive()` → `writeLink()`; a pending `#view` applied after the flight | team 5 |
| after :858 | :902-904 | comment: key+space identity, sub search, repo, view | team 5 |
| after :858 | :905-906 | `linkText()` = `#key=<subKey[T]>&space=<SPACE>&sub=<encodeURIComponent(name)>`; `writeLink()` by `history.replaceState` | team 5 |
| after :858 | :907-915 | `linkFields()`: split on `&`, `name=value`, `+`→space, `decodeURIComponent` in try/catch; fields `sub key space repo view`, others collected in `bad` | team 5 |
| after :858 | :916-920, :926-928 | `readLink()`: order repo, key(+space), sub, view; first unknown field named in the note | team 5 |
| after :858 | :921-925 | key that names a substation wins over `sub` (flies to it; 'Drax' 1182/1368 round-trips); else `sub` types the name and `goSearch()` | team 12 |
| after :858 | :929-944 | `linkKey()`: integer test, SPACE remap (:932-936), beyond-sky, star-that-lands, ring at `KuiperLaw.place(k)` | team 5 |
| after :858 | :945-967 | `linkRepo()`: fetch `../../cosmos/repos.tsv` and `wafer.tsv`, name match exact then contains (:950-955, team 12), engine walk (:957-958), binary search of the star keys, note | team 5 + team 12 (:945, :950, :954-955) |
| after :858 | :968-982 | `cutStars(space)`: the OLD :961-967 star loop moved verbatim into a function taking the sky | team 12 |
| after :858 | :983-1002 | `readSky(done)`: `fetch('../../cosmos/wafer-meta.json',{cache:'no-store'})`, re-cut when `address_space` differs and nothing is chosen, 4 s timeout, `spaceSource` `wafer-meta` / `frozen` / `frozen (wafer <n>)` | team 12 |
| after :858 | :1003-1006 | `goHome()`: `history.back()` when the referrer is same-origin, else `location.href = '../../editions/'` | team 5 |
| :961-967 | :1108 | `open()` calls `cutStars(S.SPACE)` instead of the inline loop | team 12 |
| :1038 | :1179-1180 | `__descent.state()` gains `space`, `spaceSource`, `link` | team 5 + team 12 |
| :1050 | :1192-1197 | `__descent` gains `link()`, `subKey(i)`, `ring()`, `sky()`, `repoLit()` | team 5 + team 12 (:1197) |
| after :1050 | :1199 | `S.linkWait = 2` (names and sky) | team 12 |
| after :1056 | :1205 | names loaded → `readLink()` when the sky is also settled | team 12 |
| after :1057 | :1207 | `hashchange` → `readLink()` unless the hash is the page's own written link (via `on()`, removed in `close()`, NEW :155) | team 5 |
| after :1057 | :1208 | `readSky(...)` → `readLink()` when the names are also in | team 12 |

`node --check NEW/descent.js` OK (also kuiper-law.js, grid-data.js, model.js, pf.js, see3d.js).

### 1b. NEW/kuiper-law.js against OLD/kuiper-law.js (2 hunks)

| OLD line | NEW line | what changed |
|---|---|---|
| :36 `const SPACE = 59637070538;` | :36-39 (comment) and :40 `const SPACE = 63340120796;` | SPACE re-lifted; the comment names kb@96736f5 cosmos/wafer-meta.json:4 and the re-sum (13,344 rows) |
| :113 `source: 'kuiper-belt@7a65dd3… index.html:92,143-148,250-251,333-335,357'` | :117 same + `; SPACE re-lifted at kuiper-belt@96736f55… cosmos/wafer-meta.json:4` | the source line names the re-lift |

The law itself is untouched: `G32`, `TW` (:33), `keyPlace` (:43-44) are the OLD lines unchanged (only SPACE moved
by 4 lines). Measured: kb@96736f5 cosmos/wafer-meta.json:4 `"address_space": 63340120796`; re-sum of kb@96736f5
cosmos/wafer.tsv `lines + gap_before` over 13,344 rows = 63,340,120,796 (`awk`); `tools/ci_check.py` K4 "address space
63,340,120,796 vs 63,340,120,796".

### 1c. NEW/README.md against OLD/README.md

Lines :1-3 unchanged; :4-18 added (kb@aa04b3b NEW/README.md): :5-6 the way home (STAR KEY row → `../../editions/#key=<k>`,
the X); :8-14 the hash forms (`#sub=Drax`, `#key=36064705400`, `#key=<k>&space=<S>`, `#repo=gridatlas`, `#sub=Cowley&view=3d`);
:15-16 "key with space is the identity; sub is a search that lands on the first named match" and the written link;
:17-18 the sky from `../../cosmos/wafer-meta.json`, frozen value 63,340,120,796.

## 2. The hash grammar it reads (team-3 STEPS.md step 5.5) and where the code meets it

Spec keys: nl@54c0f04 FIXES/NL-010/team-3/STEPS.md:141-148 (where and when read), :149-155 (identity), :157-162 (the
table: `sub` :158, `key` :159, `space` :160, `repo` :161, `view` :162), :164-170 (order, writer, examples, `link()`);
ROADMAP.md:351-359 (5.5 short form), :371-374 (5.8).

| spec (STEPS.md line) | code (kb@aa04b3b NEW/descent.js) | verdict |
|---|---|---|
| read once after names are in (OLD :1051-1057) and on `hashchange` (:142-146) | :1199, :1205, :1207-1208 (waits for names and sky) | meets (adds the sky wait, ROADMAP 5.6) |
| `name=value`, `&`, `decodeURIComponent` in try/catch (:144-145) | :907-915 | meets (`+` also read as space) |
| unknown field: note `LINK FIELD <name> NOT UNDERSTOOD` (:146-147) | :927 `'LINK FIELD ' + name.toUpperCase()` | **differs**: name upper-cased (`LINK FIELD FOO`), spec keeps it as typed |
| `sub` :158: box + `goSearch()` (OLD :409-415); 0 matches `NO SUBSTATION NAME HERE CONTAINS THAT. TRY ANOTHER NAME` (OLD :412) | :924 → `goSearch()`, words unchanged at NEW :422 (OLD :412) | meets |
| `key` :159 `^\d{1,15}$`; ring at `KuiperLaw.place(key)`, amber | :930, :942, :612-617 | meets |
| `key` = `subKey[j]` → box `nameOf(j)`, `THE STAR THAT LANDS ON <NAME>. PRESS GO` | :938-941 | meets |
| otherwise `KEY <k> · A LINE OF CODE, NOT A SUBSTATION` | :943 `fmt(k)` | **differs**: `<k>` printed with en-GB thousands commas (`fmt`, OLD :103) |
| `key ≥ SPACE`: `KEY <k> IS BEYOND THIS SKY (SPACE <SPACE>)` | :937 `'KEY ' + fmt(k) + ' IS BEYOND THIS SKY'` | **differs**: the ` (SPACE <SPACE>)` tail is missing; commas in `<k>` |
| `key` not an integer: `LINK FIELD key NOT UNDERSTOOD` | :930 `LINK FIELD KEY NOT UNDERSTOOD` | **differs**: `KEY` upper-case |
| `space` :160 not an integer: ignored **and named** | :932 silently ignored | **differs**: not named |
| `repo` :161: fetch repos.tsv + wafer.tsv, engine walk (kb@018b46a editions/202611012027/index.html:203-208), match exact then `includes` (:612-613), notes `<NAME> · <n> OF <NP> STARS`, `REPOSITORY RANGES NEED ../../cosmos/wafer.tsv`, `NO REPOSITORY CALLED <NAME>`, `NO STAR OF THIS SKY FALLS IN <NAME>` | :945-967; walk :957-958 `k += gap; k0 = k; k += lines` = engine :203-205; match :950-955 = engine :612 (`find` exact `||` `find` includes; the code's exact loop keeps the last exact hit, equal here: `cut -f2 cosmos/repos.tsv` has 0 duplicate lower-case names) | meets the words; **differs**: stars lit in `C.amber` (:613-615), spec says "the instrument's cyan" |
| `view` :162 `kuiper|map|sat|3d`, `setView(v,true)` after the flight; other values named | :926, :899 | meets |
| order `repo`, `space`+`key`, `sub`, `view` (:164) | :919-926 | meets |
| writer `#key=<subKey[T]>&space=<SPACE>&sub=<name>` by `replaceState` in `arrive()`; `back()` clears (:165-167) | :898, :905-906, :459 | meets (unnamed substation writes `sub=` empty instead of the `nameOf` fallback) |
| `window.__descent.link()` (:169-170) | :1193 | meets |
| identity: `key` with `space` (:149-155) | :921-925 (key that names a substation flies, `sub` only a search) | meets; strengthens: identity wins when both name a substation |

## 3. The SPACE remap: formula, source, measurement

Formula (spec nl@54c0f04 FIXES/NL-010/team-3/STEPS.md:160): `j = floor(key · 20000 / space)`, accepted only if
`floor((j + 0.5) · space / 20000) === key`; then `key ← floor((j + 0.5) · SPACE_in_use / 20000)`, note
`STAR KEY REMAPPED · SKY <space> → <SPACE>`; if the check fails the ring is drawn at the key as given.
Its source is the star cut itself: particle key `floor((ki + 0.5) · SPACE / NRULE)`, NRULE 20000 (kb@018b46a OLD
descent.js:19, :962-963; NEW :975 inside `cutStars`), `subKey[j]` for j < NSUB 5800 (OLD :20, :965; NEW :977).

Code: kb@aa04b3b NEW/descent.js:932-936. It tests `j−1, j, j+1` and accepts only `j < NSUB`, then takes `keyOfSub(hit)`
(the key under the sky in use). Measured in node (`/tmp/nl010-opus/team-12/evidence/remap.cjs`): the spec's single
`j = floor(k·20000/space)` recovers j for all 5,800 substations under each of four sky pairs (frozen 63,340,120,796 ↔
main 63,363,988,142; 59,637,070,538 ↔ frozen), so the ±1 window is harmless; 0 of 200,000 random keys pass the check
(no false remap). Difference from the spec: keys of particles 5,800-19,999 (DRAW THE GRID keys that land on no
substation) are not remapped; they get the ring at the key as given. Example values: `subKey[1182]` (Drax) =
3,744,984,642 under the frozen sky, 3,746,395,798 under main's sky, 3,526,041,795 under 7a65dd3's.

The sky read (5.6): NEW :987-1002 reads `../../cosmos/wafer-meta.json` `address_space`; frozen fallback kb@aa04b3b
NEW/kuiper-law.js:40. **Measured caution:** kuiper-belt origin/main e92ad5d cosmos/wafer-meta.json:4 is already
63,363,988,142 (engine Actions commit b9901d4), 23,867,346 larger than the frozen 63,340,120,796 of this branch; once the
folder is served from main the page re-cuts to the wafer's sky (`spaceSource: 'wafer-meta'`), as designed, and
`#key=<k>&space=63340120796` links are remapped.

## 4. The pointer's three places (kb@aa04b3b see-through/index.html)

| line | kb@018b46a | kb@aa04b3b |
|---|---|---|
| :7 | `<meta http-equiv="refresh" content="0; url=202610050609/">` | `<meta http-equiv="refresh" content="0; url=202611020012/">` |
| :11 | `<a href="202610050609/">Tap here if it does not open.</a>` | `<a href="202611020012/">Tap here if it does not open.</a>` |
| :12 | `location.replace('202610050609/' + location.hash);` | `location.replace('202611020012/' + location.search + location.hash);` |

All three stamps equal the shipped folder name. Note: :12 now forwards the query too; STEPS.md:142 described the old
pointer as dropping it. The meta refresh (:7) still carries neither query nor hash (only the script line does).

## 5. LICENSE.md and NOTICE.md carried unchanged

NEW/LICENSE.md 619 B sha256 `650e3a06…4bac` = OLD; NEW/NOTICE.md 3,877 B `5713318f…71fc` = OLD;
NEW/licences/globalgrid2050-CERN-OHL-S-2.0.txt `b76e339b…c036` = OLD (`sha256sum`, table in section 7). Licence of the
additions: CERN-OHL-S v2, stated in NEW/descent.js:12 and :15 (kb@018b46a OLD/LICENSE.md:3-6). The edition register
already records it: kb@aa04b3b editions/202611012135/LICENCES.md:12-14.

## 6. The See Through README row (kb@aa04b3b see-through/README.md:27-29)

:27-28 table head `| folder | what it added |`; :29 `| \`202611020012/\` | Links from the Kuiper: the page reads its hash
(…), writes \`#key=<k>&space=<S>&sub=<name>\` on arrival, and links back with the row \`STAR KEY <k> · OPEN IT ON THE
KUIPER\` (\`../../editions/#key=<k>\`) and the X among the stars. The sky is read from \`cosmos/wafer-meta.json\`. The
stable link forwards both the query and the hash. |`. It sits under the folder rule :23-25 (unchanged). Every claim in
the row is in the code: hash forms (section 2), writer NEW :905-906, row NEW :874-891, X NEW :453/:1003-1006, sky NEW
:987-1002, pointer :12.

## 7. Every other file is byte-identical (sha256, OLD vs NEW; same 27-file list, `find -type f | sort`, `diff` equal)

| file | bytes | sha256 (NEW) | vs OLD |
|---|---|---|---|
| `LICENSE.md` | 619 | `650e3a065cec482c2f1b7d87689b5a0ed68d1c8bf531a982c954168246be4bac` | identical |
| `NOTICE.md` | 3877 | `5713318f22f944148a9a76eac8d139113baea862a6835d4631d81f07cb2571fc` | identical |
| `README.md` | 1671 | `fa152d908bc45b007b4c58d3be7b0f7e9623a44268b2349d8f2221a3b0f5fe36` | CHANGED (OLD `be5efd78…a8c7`) |
| `data/osm/201.json` | 18340 | `05c73da7efc0435b0f566a672d5484a42217f807bd2f46ce1395a374f9554ea0` | identical |
| `data/osm/229.json` | 12096 | `a8d89287d93bc0fda361f11c9070722fa7694256598a3e41b5548e5ba9802519` | identical |
| `data/osm/2392.json` | 7191 | `f982e73948da4ce440ca19d0b7493b14f854b03a7dbcf7ebc320755f6821c284` | identical |
| `data/osm/259.json` | 3152 | `1ddd0f2fa3270857bb896cad9205b997c0dd824f87b8f8e671c3ac0853e79c73` | identical |
| `data/osm/324.json` | 5636 | `7e4f45194f8bd8aba58ab30600d98a9c24fcb8a5b23ae22b3dda55a355937a96` | identical |
| `data/osm/350.json` | 2008 | `79f54af7feb19b50a7832f64a61faeb0dbeaa79482dece8c36312a715546db7d` | identical |
| `data/osm/463.json` | 61910 | `10f50d1e54af0cddc1a4a51f7823605465db06b5daa4e395aa22d0d119e7815b` | identical |
| `data/osm/578.json` | 44191 | `773e5b636fcd07c9ca0058a6676f2ee173bb48797059d593b4ad9ff540ab540b` | identical |
| `data/osm/9.json` | 8826 | `376094cafe068e725ab0431b1faf0305719f1130fa7bf27794322dd93a3c7d71` | identical |
| `data/osm/index.json` | 44 | `0c5c603e54cf4331538c7016fd3b866c0663e54d4949313f99b8b46c34ba7a19` | identical |
| `data/substations-footprints.odbl.json` | 1180729 | `455d08e81b855dc983cea57dd55d4cba44a4383755d498d16c556d8b04daf7ff` | identical |
| `descent.js` | 168298 | `3f5e877f48b2e26495b9e0cdd6776e5b15287fe9ccd0318296f52e8db4e28b38` | CHANGED (OLD `b31fdd98…e092e`) |
| `grid-data.js` | 587233 | `86d776edb4d44735900a591c63150a6326b1b1efbeda3e830a10abf4799d9a71` | identical |
| `index.html` | 1032 | `cfda63c4f5b9e5aaf24a21dfbf2a910254a005a671844115874d47500f614c3f` | identical |
| `kuiper-law.js` | 8935 | `fbbc5b80cb9be9043c6c699973e36ba6d739ab46d14757358ad50d7b4e0fce1c` | CHANGED (OLD `2c7512ea…64ea`) |
| `licences/globalgrid2050-CERN-OHL-S-2.0.txt` | 15156 | `b76e339bfb98ce26308087b503a6c8d6f962f711e10216cd6116bbd2883ec036` | identical |
| `model.js` | 40054 | `d66749b209814a87ac51521a82491a1066474eca19ddff047680b626a1b3dd92` | identical |
| `pf.js` | 12311 | `41040e53f7f27bc30963fb48ef36715c4cb95e9ac8ad5438944007a2c641df3d` | identical |
| `plain.css` | 2562 | `bd9097cc62886353a2f45ca9ea57862f0c132f2445d7af6131b307cf61169916` | identical |
| `see3d.js` | 31590 | `336f23788a70ac4a821766516d8aff0067c7a5c4b4e9449de33e8d196e452993` | identical |
| `vendor/MAPLIBRE-LICENSE.txt` | 5984 | `ee5fc05a0677eaf69601d2c7db0d9ecd6cc27c3abc1d0733bc9ed34707cf8ef2` | identical |
| `vendor/joystick.js` | 5171 | `9e4cda77503207e1423301a0547edd2c5ad14dc693e9f132e6c0a61282e0b52d` | identical |
| `vendor/maplibre-gl.css` | 65534 | `576b085fdd9487a65a19215328c1e086c07ce5bf6da09b666b3806d3d008dae9` | identical |
| `vendor/maplibre-gl.js` | 803086 | `be9633c4d870e26fb37f1cfe5c5a77181667114003ea16207ac7850d8da8add1` | identical |

24 identical, 3 changed (exactly the three of section 1).

## 8. Forbidden token and ci_check

- Token `kuiper_belt`: `grep -rlI kuiper_belt --exclude-dir=.git .` over the whole kuiper-belt working tree: **0 files**
  (so 0 in see-through/, the pointer, README and this hand-off folder). The rule itself is not written in
  FIXES/NL-010/OPUS-BRIEF.md (`grep -n kuiper_belt` 0 lines in every FIXES/NL-010/*.md); it came with this agent's task.
- `python3 tools/ci_check.py` on the branch working tree (00:47 UTC): **RESULT: FAIL**, not from team 12:
  `K1 privacy: 725 tracked files scanned, 1 match a private digest` → `FAIL K1:
  editions/202611012135/handoff/07-apps/img/element-card.png` (team 7's screenshot, tracked since b9d514c). K2 agree,
  K3 20 tools 5 pages, K4 0 out of order, address space 63,340,120,796 vs 63,340,120,796.
- The same K1 test (`check_proof.leaks`) over team 12's 110 files (see-through/ whole, handoff/12-see-through-reader/):
  **0 match** (`/tmp/nl010-opus/team-12/evidence/k1_scope.py`).
- `ci_check.py` on a `git archive kb@aa04b3b` copy with only that PNG removed from the index:
  **RESULT: PASS** (K1 721 files, 0 matches; K2 agree; K3 20 tools, 5 pages; K4 0). So team 12's change passes;
  the branch passes again when team 7 replaces element-card.png (REQUEST to team 7 / the harness, not a team-12 edit).

## 9. Scope check (OPUS-BRIEF and the owner's team-12 scope)

Files touched by team 12: NEW/ (new folder), see-through/index.html, see-through/README.md, and this hand-off folder.
OPUS-BRIEF names see-through/ untouchable for teams 1-10 (FIXES/NL-010/OPUS-BRIEF.md "Where you work"); team 12's scope
is the owner's later instruction recorded at nl@54c0f04 FIXES/NL-010/OVERNIGHT.md (2026-11-02T00:16Z line: "teams 11-13
added: … See Through hash reader folder") and handoff/12-see-through-reader/PLAN.md:3-5. No earlier folder changed
(section 1). No other repository file changed by this team (`git diff kb@018b46a --stat -- see-through` lists only NEW/*,
index.html, README.md).

## 10. Findings for the lead (measured, for HANDOFF.md)

1. Refusal words not byte-for-byte with STEPS.md:159-160 (rule "every string in the refusal column is used byte for
   byte", STEPS.md team 5 brief): `IS BEYOND THIS SKY` lacks ` (SPACE <SPACE>)` (NEW :937); `LINK FIELD KEY` / upper-cased
   field names (NEW :927, :930) where the spec writes the name as typed; `<k>` printed with commas (NEW :937, :943).
2. A non-integer `space` is ignored silently (NEW :932); STEPS.md:160 says "ignored and named".
3. `#repo` lights stars amber (NEW :613-615); STEPS.md:161 says cyan.
4. The remap covers only substation star keys (j < 5,800), section 3.
5. The frozen SPACE is already behind main's wafer by 23,867,346 keys (section 3); harmless by design, worth one line in
   HANDOFF so nobody reads `spaceSource: 'wafer-meta'` on the live site as a fault.
6. ci_check is red on the branch because of team 7's element-card.png, not team 12 (section 8).
None of 1-5 breaks a test the plan names; they are differences from the written spec for the lead to fix or state.

## 11. Review of the lead's HANDOFF.md

No HANDOFF.md in this folder as of 00:48 UTC (polled from 00:48). Verdict: PENDING. Conditions for APPROVE: HANDOFF states findings 1-6 of section 10 (fixed or named), quotes ci_check honestly (branch FAIL from team 7 PNG; team-12 scope PASS), keys pointer :7 :11 :12, and descent.js sha256 still 3f5e877f…8b38 or this evidence is re-run.
