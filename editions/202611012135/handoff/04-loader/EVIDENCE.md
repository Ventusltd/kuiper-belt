# EVIDENCE: Opus team 4, step 4 "the cartridge law" (hook table, loader, hello module, modules.json)

OPUS-4 evidence officer, 2026-11-01. Law: no claim without a key (neural-link FIXES/NL-010/OPUS-BRIEF.md:6-8;
ROADMAP.md Preface law 1). Every row is `repo@sha path:line` with a literal fragment that stands on that line (or on
one line of the range). `python3 -I /tmp/nl010-opus/team-4/evidence/check_keys.py EVIDENCE.md` re-reads every row
from `git show <sha>:<path>` (or the working tree for sha `WT`) and PASSes only when the file exists, the line exists
and the fragment is on it. Its result is the last section. Nothing here is remembered; everything was read today.

Heads: gridatlas@5ec7f62 (`5ec7f62f213e2d20a02e86427daa182c0f38e4a4`, the roadmap's head); kuiper-belt@96736f5
(`96736f55c2137defcf02c898f8f2b0d04374d74b`, branch `edition/202611012135`, the Edition 5 skeleton) and
kuiper-belt@018b46a (Edition 4, the roadmap's head). `editions/202611012135/index.html` at 96736f5 is the Edition 4
page with six lines changed (`diff` against `editions/202611012027/index.html`: lines 6, 96, 634, 641, 699, 745, all
"Edition 4" → "Edition 5"), so every engine line number below is the same in both. Sources read: ROADMAP.md step 4;
team-2/STEPS.md 4.1-4.10 and tests 1-9; team-2/EVIDENCE.md A3-A5, B1-B3 (each re-read here, not copied on trust).

## A. GridAtlas `current.json`: the hashes and `cartridge_order`

| # | lesson | key | fragment |
|---|---|---|---|
| A1 | The pointer names its schema | gridatlas@5ec7f62 atlas/current.json:2 | `"schema": "gridatlas.current.v2"` |
| A2 | The pointer names its generation; a cartridge of an older generation is carried inside it byte-identical (A9) | gridatlas@5ec7f62 atlas/current.json:3 | `"generation": "202610292044"` |
| A3 | The architecture is a contract the composer checks | gridatlas@5ec7f62 atlas/current.json:5 | `"architecture": "IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES"` |
| A4 | The order is its own list, separate from the records | gridatlas@5ec7f62 atlas/current.json:14 | `"cartridge_order": [` |
| A5 | order entry 1 | gridatlas@5ec7f62 atlas/current.json:15 | `"streaming-parquet-bridge",` |
| A6 | order entry 3 is `substation-intelligence` ... | gridatlas@5ec7f62 atlas/current.json:17 | `"substation-intelligence",` |
| A7 | ... order entry 4 is `sld-sandbox`, while in `cartridges[]` the sld-sandbox record (:81) comes BEFORE substation-intelligence (:566): the composer follows `cartridge_order`, never the record order (measured, A8 and the table below) | gridatlas@5ec7f62 atlas/current.json:18 | `"sld-sandbox",` |
| A8 | The records array | gridatlas@5ec7f62 atlas/current.json:22 | `"cartridges": [` |
| A9 | Record fields, first cartridge: id | gridatlas@5ec7f62 atlas/current.json:24 | `"id": "streaming-parquet-bridge"` |
| A10 | generation (UTC minute), older than the pointer's | gridatlas@5ec7f62 atlas/current.json:25 | `"generation": "202609241251"` |
| A11 | version | gridatlas@5ec7f62 atlas/current.json:26 | `"version": "v9.156"` |
| A12 | type | gridatlas@5ec7f62 atlas/current.json:27 | `"type": "script"` |
| A13 | slot | gridatlas@5ec7f62 atlas/current.json:28 | `"slot": "replace-script"` |
| A14 | path, the stamp in the file name | gridatlas@5ec7f62 atlas/current.json:30 | `"path": "./cartridges/202609241251-streaming-parquet-bridge-v9-5.js"` |
| A15 | sha256, 64 hex | gridatlas@5ec7f62 atlas/current.json:31 | `"sha256": "60be8215ba873ac2886786bf6e3fd51e5764e7c5e26684fde71ebe9974a329a2"` |
| A16 | contract file | gridatlas@5ec7f62 atlas/current.json:32 | `"contract": "../ui/cartridges/202609241251-streaming-parquet-bridge-v9-5.mjs"` |
| A17 | capabilities | gridatlas@5ec7f62 atlas/current.json:33 | `"capabilities": [` |
| A18 | the record says it did not modify the shell | gridatlas@5ec7f62 atlas/current.json:41 | `"immutable_shell_modified": false` |
| A19 | sha256, uk-gazetteer-flyto | gridatlas@5ec7f62 atlas/current.json:65 | `15f324e5c279` |
| A20 | sha256, sld-sandbox | gridatlas@5ec7f62 atlas/current.json:88 | `7812953671d8` |
| A21 | sha256, substation-intelligence | gridatlas@5ec7f62 atlas/current.json:573 | `d94b0de50ded` |
| A22 | sha256, uk-lightning-overlay | gridatlas@5ec7f62 atlas/current.json:641 | `"sha256": "15ff1e37890770efc42b75651fac2fcc98a16c71a694481c79778ae0a6d818db"` |
| A23 | sha256, uk-offtakers-overlay | gridatlas@5ec7f62 atlas/current.json:724 | `e4d3fb288ef0` |
| A24 | `bytes` beside the hash (the Kuiper's `bytes`) | gridatlas@5ec7f62 atlas/current.json:642 | `"bytes": 63707` |
| A25 | `byte_budget` (the Kuiper's `byte_budget`) | gridatlas@5ec7f62 atlas/current.json:643 | `"byte_budget": 64781` |
| A26 | an `after-cartridge` record names its anchor | gridatlas@5ec7f62 atlas/current.json:639 | `"after": "sld-sandbox"` |
| A27 | what it reads at run time (the Kuiper's `reads` and `requires`) | gridatlas@5ec7f62 atlas/current.json:650 | `"reads_at_runtime": {` |
| A28 | what it writes (the Kuiper's `writes`) | gridatlas@5ec7f62 atlas/current.json:657-658 | `window.__GRIDATLAS_MODULES__.ukLightning` |
| A29 | isolation: its own script element, so one module's throw does not stop the next | gridatlas@5ec7f62 atlas/current.json:660 | `"isolation": "its own script element` |
| A30 | Stamp lesson 1 (team-2/EVIDENCE.md A4.32-A4.33, re-read): the cartridge's header says `202609060259` ... | gridatlas@5ec7f62 atlas/cartridges/202609062358-substation-intelligence-v9-63.js:2 | `generation 202609060259 (UTC)` |
| A31 | ... while its file name and its record say `202609062358`. Nothing checks the header, so it drifted | gridatlas@5ec7f62 atlas/current.json:567 | `"generation": "202609062358"` |
| A32 | Stamp lesson 2 (new here): the lightning record's `generation` is the pointer's generation ... | gridatlas@5ec7f62 atlas/current.json:635 | `"generation": "202610292044"` |
| A33 | ... and a second field carries the module's own stamp, which equals its file name and its header | gridatlas@5ec7f62 atlas/current.json:644 | `"module_generation": "202610291043"` |
| A34 | the lightning file's header | gridatlas@5ec7f62 atlas/modules/202610291043-uk-lightning-overlay.js:1 | `uk-lightning-overlay, generation 202610291043 (UTC)` |
| A35 | the same stamp a fourth time, in code | gridatlas@5ec7f62 atlas/modules/202610291043-uk-lightning-overlay.js:9 | `let GEN='202610291043'` |

Measured today (`python3`, sha256 of each file at the path its record names, against the record; gridatlas@5ec7f62):

| cartridge_order # | id | record line | file | bytes on disk | record `bytes` | sha256 | result |
|---|---|---|---|---|---|---|---|
| 1 | streaming-parquet-bridge | :24 | cartridges/202609241251-streaming-parquet-bridge-v9-5.js | 13,589 | (absent) | 60be8215ba87… | MATCH |
| 2 | uk-gazetteer-flyto | :58 | cartridges/202609071213-place-global-search-v9-5.js | 41,120 | 41,120 | 15f324e5c279… | MATCH |
| 3 | substation-intelligence | :566 | cartridges/202609062358-substation-intelligence-v9-63.js | 451,935 | 451,935 | d94b0de50ded… | MATCH |
| 4 | sld-sandbox | :81 | cartridges/202609241334-sld-sandbox-v9-8.js | 435,218 | 435,218 | 7812953671d8… | MATCH |
| 5 | uk-lightning-overlay | :634 | modules/202610291043-uk-lightning-overlay.js | 63,707 | 63,707 | 15ff1e378907… | MATCH |
| 6 | uk-offtakers-overlay | :717 | modules/202610292044-uk-offtakers-overlay.js | 71,191 | 71,191 | e4d3fb288ef0… | MATCH |

6 of 6 match; 13 `"sha256"` lines in the file (the other 7 hash data partitions, e.g. :45). What the Kuiper takes:
`modules.json` keeps `order` separate from `modules[]` (A4), every record carries `sha256`, `bytes`, `byte_budget`
(A15, A24, A25), and the stamp has ONE meaning (the module's cut minute) checked everywhere it is written: GridAtlas
writes it up to four times (A30-A35) and needed a second field once the pointer's generation and the module's
diverged; the Kuiper's record has no pointer-generation field, the edition stamp is `modules.json` `edition`.

## B. The admission rule (the composer, the menu bar, the overlay)

| # | lesson | key | fragment |
|---|---|---|---|
| B1 | The manifest is fetched past every cache | gridatlas@5ec7f62 atlas/index.html:39 | `fetch('./current.json', { cache: 'no-store' })` |
| B2 | a non-OK manifest fails with its status | gridatlas@5ec7f62 atlas/index.html:40 | `current.json HTTP ${currentResponse.status}` |
| B3 | schema checked | gridatlas@5ec7f62 atlas/index.html:42 | `unsupported current.json schema` |
| B4 | architecture checked | gridatlas@5ec7f62 atlas/index.html:43 | `architecture contract mismatch` |
| B5 | shape checked: order and records are both arrays | gridatlas@5ec7f62 atlas/index.html:44 | `cartridge registry malformed` |
| B6 | records indexed by id; the order drives | gridatlas@5ec7f62 atlas/index.html:54 | `new Map(current.cartridges.map(item => [item.id, item]))` |
| B7 | compose in `cartridge_order` | gridatlas@5ec7f62 atlas/index.html:65 | `for (const id of current.cartridge_order)` |
| B8 | an id in the order without a record fails | gridatlas@5ec7f62 atlas/index.html:67 | `missing cartridge ${id}` |
| B9 | type checked | gridatlas@5ec7f62 atlas/index.html:68 | `unsupported cartridge type` |
| B10 | slot checked against a closed list | gridatlas@5ec7f62 atlas/index.html:69 | `unsupported cartridge slot` |
| B11 | a dependency (the anchor) must be composed EARLIER in the order: the Kuiper's `requires` ⊆ hooks ∪ earlier `provides` | gridatlas@5ec7f62 atlas/index.html:73 | `is not composed before it` |
| B12 | the recorded hash must be 64 hex before anything is fetched | gridatlas@5ec7f62 atlas/index.html:75 | `/^[a-f0-9]{64}$/.test(cartridge.sha256` |
| B13 | each file fetched no-store | gridatlas@5ec7f62 atlas/index.html:78 | `await fetch(cartridgeUrl, { cache: 'no-store' })` |
| B14 | non-OK file fails with its status (the Kuiper's `HTTP 404`) | gridatlas@5ec7f62 atlas/index.html:79 | `${id}: HTTP ${response.status}` |
| B15 | the bytes, not the text, are hashed | gridatlas@5ec7f62 atlas/index.html:80 | `await response.arrayBuffer()` |
| B16 | SHA-256 in the browser | gridatlas@5ec7f62 atlas/index.html:28 | `crypto.subtle.digest('SHA-256', bytes)` |
| B17 | a mismatch refuses (the Kuiper's `sha256 mismatch`) | gridatlas@5ec7f62 atlas/index.html:81 | `SHA-256 mismatch` |
| B18 | the verified bytes, and only they, become the script (a blob URL: the network cannot swap them after the check) | gridatlas@5ec7f62 atlas/index.html:82 | `URL.createObjectURL(new Blob([bytes], { type: 'text/javascript' }))` |
| B19 | one script element per cartridge, stamped with its id (the Kuiper's `data-ky-module`) | gridatlas@5ec7f62 atlas/index.html:83 | `data-gridatlas-cartridge=` |
| B20 | what loaded is recorded with its hash | gridatlas@5ec7f62 atlas/index.html:101 | `loaded.push({ id, sha256: cartridge.sha256, blob_url: blobUrl })` |
| B21 | and published as one public object (the Kuiper's `window.__KUIPER_EDITION__`) | gridatlas@5ec7f62 atlas/index.html:113 | `window.__GRIDATLAS_ATLAS__=` |
| B22 | its `loaded_cartridges` carry {id, sha256} | gridatlas@5ec7f62 atlas/index.html:111 | `loaded_cartridges: loaded.map(item => ({ id: item.id, sha256: item.sha256 }))` |
| B23 | The menu bar installs nothing until its whole inventory exists | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:10 | `it installs nothing until` |
| B24 | `required()` names every node the install needs | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:141 | `function required(doc)` |
| B25 | install refuses while anything is missing, and records what | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1653-1655 | `state.waiting_for = ready.missing.slice();` |
| B26 | `installed` flips only after the complete build | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1731 | `state.installed = true` |
| B27 | never admit twice: same namespace and schema → return | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:38 | `if (NS.menuBar && NS.menuBar.schema === SCHEMA) return;` |
| B28 | the lightning overlay names what it waits for | gridatlas@5ec7f62 atlas/modules/202610291043-uk-lightning-overlay.js:393 | `miss=[]` |
| B29 | and POLLS for it, MutationObserver plus 250 ms, because GridAtlas has no hook table: the Kuiper's `window.KY` exists before any module, so a missing hook is refused at once, no poll (team-2/STEPS.md 4.8) | gridatlas@5ec7f62 atlas/modules/202610291043-uk-lightning-overlay.js:398 | `new MutationObserver(()=>tick()),poll=setInterval(()=>tick(),250)` |
| B30 | one frozen public API under one namespace (the Kuiper's frozen `KY.modules[id]`) | gridatlas@5ec7f62 atlas/modules/202610291043-uk-lightning-overlay.js:400 | `NS.ukLightning=Object.freeze({` |
| B31 | a cartridge is a new timestamped file, the old one never rewritten | gridatlas@5ec7f62 atlas/cartridges/README.md:3-4 | `new timestamped file next to the` |
| B32 | the builder refuses a missing part or a generation collision: cartridges are immutable | gridatlas@5ec7f62 tools/build-cartridge.mjs:12-14 | `cartridges are immutable here` |
| B33 | the boundary | gridatlas@5ec7f62 governance/202609011940-modular-architecture-and-domain-map.md:26 | `One module, one responsibility, one proof, one public surface.` |

## C. The loud failure

| # | lesson | key | fragment |
|---|---|---|---|
| C1 | an invariant throws; nothing is skipped | gridatlas@5ec7f62 atlas/index.html:20 | `if (!condition) throw new Error(message);` |
| C2 | the failure goes to the console ... | gridatlas@5ec7f62 atlas/index.html:33 | `console.error('[GRIDATLAS COMPOSER]', error)` |
| C3 | ... to a data attribute a test can read ... | gridatlas@5ec7f62 atlas/index.html:34 | `document.body.dataset.gridatlasRouter = 'failed'` |
| C4 | ... and to ONE screen naming the reason and saying what was not changed | gridatlas@5ec7f62 atlas/index.html:35 | `The immutable shell was not changed.` |
| C5 | every invariant reaches that screen | gridatlas@5ec7f62 atlas/index.html:119-120 | `fail(error);` |
| C6 | the menu bar: a missing control leaves the old interface reachable and is published, never skipped | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:17 | `A missing control leaves the old interface reachable` |
| C7 | `loudFailure` | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1752 | `function loudFailure(doc)` |
| C8 | the words say expected and found | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1755 | `expected 60 engine + 3 Pipeline News layer controls; found` |
| C9 | console.error | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1758 | `window.console.error('[GRIDATLAS MENU] ' + state.failure)` |
| C10 | a visible `role=alert` (the Kuiper's `#refuse[role=alert]`) | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1762 | `alert.setAttribute('role', 'alert')` |
| C11 | the alert says the originals remain (the Kuiper's "the wafer is unchanged") | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1763 | `Original controls remain available.` |
| C12 | a bounded retry: 160 × 250 ms = 40 s | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:35 | `var MAX_TRIES = 160;` |
| C13 | the retry ends in loudFailure, not silence | gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:1795 | `loudFailure(document);` |
| C14 | The anti-lesson in the Kuiper's own family: Learn the Kuiper removes a missing module silently. The edition refuses in words instead | kuiper-belt@018b46a learn-the-kuiper/202610050609/modes.html:16 | `a missing file is skipped` |
| C15 | the silent removal itself | kuiper-belt@018b46a learn-the-kuiper/202610050609/modes.html:17 | `onerror="this.remove()"` |
| C16 | The Kuiper engine's own refusal words, which the `wafer` hook rejects with: the belt sum | kuiper-belt@96736f5 editions/202611012135/index.html:207 | `REFUSED: the commits of` |
| C17 | and the missing file | kuiper-belt@96736f5 editions/202611012135/index.html:240 | `did not load. The wafer will not invent its keys.` |

## D. The pr-gate and the release re-hash

| # | lesson | key | fragment |
|---|---|---|---|
| D1 | the PR gate runs on every PR to main, Node built-ins, no network | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:2-3 | `run by the runner on every PR to main` |
| D2 | every check runs even after one fails, so one run reports everything (the Kuiper loader keeps going after a refusal) | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:9-10 | `every check runs even after an earlier one fails` |
| D3 | the generations check: the pinned composition hashes | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:14-16 | `(atlas/v/<gen>/current.json) hashes` |
| D4 | the pinned composition must declare its own generation | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:168 | `declares generation ${composition.generation}` |
| D5 | walk `cartridge_order` | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:170 | `for (const id of composition.cartridge_order \|\| [])` |
| D6 | an order entry without a record fails (the Kuiper's `in order but not in modules`) | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:172 | `in cartridge_order but not in cartridges` |
| D7 | a path may not escape the folder (the Kuiper's `bad path`: `modules/` prefix, no `..`) | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:174 | `path escapes atlas/` |
| D8 | a missing file fails | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:175 | `missing` |
| D9 | the file is re-hashed against the record | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:176 | `SHA-256 mismatch for` |
| D10 | the result is recorded per composition, all failures joined | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:179 | `failures.length === 0, failures.join('; ')` |
| D11 | the gate exits non-zero on any failure | gridatlas@5ec7f62 tools/ci/pr-gate.mjs:451 | `process.exitCode = 1;` |
| D12 | the hash CI takes is of the published (LF) bytes | gridatlas@5ec7f62 tools/scope/lib.mjs:249 | `export function sha256PublishedFile(filePath)` |
| D13 | CRLF is normalised before hashing text files | gridatlas@5ec7f62 tools/scope/lib.mjs:255 | `replace(/\r\n/g, '\n')` |
| D14 | kuiper-belt avoids that branch by storing and checking out LF everywhere, so the bytes `edition_check.py` E6 hashes are the bytes Pages serves and the loader hashes | kuiper-belt@96736f5 .gitattributes:3 | `* text=auto eol=lf` |
| D15 | the release re-hashes every cartridge before the pointer moves | gridatlas@5ec7f62 docs/RELEASE.md:117 | `each hashing to its recorded sha256` |

## E. The Kuiper hooks the table exposes, with the engine line each one reads

The 28 names of `Object.keys(window.KY.hooks)` in the published order (FINDING on #10, comment 6564299733;
handoff/04-loader/HOOKS.md:9-14), each re-read at kuiper-belt@96736f5 editions/202611012135/index.html.

| # | hook | key | fragment |
|---|---|---|---|
| E1 | `keyPlace` | kuiper-belt@96736f5 editions/202611012135/index.html:278 | `function keyPlace(k){` |
| E2 | `address` | kuiper-belt@96736f5 editions/202611012135/index.html:282 | `function address(k){` |
| E3 | `describe` | kuiper-belt@96736f5 editions/202611012135/index.html:284 | `function describe(a){` |
| E4 | `findBy` | kuiper-belt@96736f5 editions/202611012135/index.html:280 | `function findBy(field, v){` |
| E5 | `flyTo` | kuiper-belt@96736f5 editions/202611012135/index.html:253 | `function flyTo(x, y, z){` |
| E6 | `home` | kuiper-belt@96736f5 editions/202611012135/index.html:277 | `function home(){` |
| E7 | `homeCamera` | kuiper-belt@96736f5 editions/202611012135/index.html:272 | `function homeCamera(){` |
| E8 | `safeBox`, engine definition | kuiper-belt@96736f5 editions/202611012135/index.html:262 | `function safeBox(){` |
| E9 | `safeBox`, the bar-aware wrap the hook must expose (bound after :726) | kuiper-belt@96736f5 editions/202611012135/index.html:726 | `{ const _safe = safeBox; safeBox = function(){` |
| E10 | `lightTime` | kuiper-belt@96736f5 editions/202611012135/index.html:554 | `function lightTime(y, m, d){` |
| E11 | `showNew` | kuiper-belt@96736f5 editions/202611012135/index.html:420 | `function showNew(hours){` |
| E12 | `goKey` | kuiper-belt@96736f5 editions/202611012135/index.html:416 | `function goKey(k){` |
| E13 | `fmt` (at :125; team-2 STEPS 4.2 and ROADMAP 4.2 wrote :126, corrected by the lead and confirmed here) | kuiper-belt@96736f5 editions/202611012135/index.html:125 | `const fmt = n => Math.round(n).toLocaleString('en-GB');` |
| E14 | `words` | kuiper-belt@96736f5 editions/202611012135/index.html:126 | `function words(n){` |
| E15 | `esc` | kuiper-belt@96736f5 editions/202611012135/index.html:681 | `function esc(v){` |
| E16 | `cv` | kuiper-belt@96736f5 editions/202611012135/index.html:121 | `const cv = document.getElementById('c')` |
| E17 | `ov` | kuiper-belt@96736f5 editions/202611012135/index.html:121 | `ov = document.getElementById('o')` |
| E18 | `o2` | kuiper-belt@96736f5 editions/202611012135/index.html:121 | `o2 = ov.getContext('2d')` |
| E19 | `hud` | kuiper-belt@96736f5 editions/202611012135/index.html:123 | `const hud = document.getElementById('hud')` |
| E20 | `big` (on :123 alone; HOOKS.md:36 writes :123-124, harmless) | kuiper-belt@96736f5 editions/202611012135/index.html:123 | `big = document.getElementById('big')` |
| E21 | `sub` | kuiper-belt@96736f5 editions/202611012135/index.html:124 | `sub = document.getElementById('sub')` |
| E22 | `card` | kuiper-belt@96736f5 editions/202611012135/index.html:124 | `card = document.getElementById('card')` |
| E23 | `card`'s element | kuiper-belt@96736f5 editions/202611012135/index.html:91 | `<div id="card"></div>` |
| E24 | `gbox` | kuiper-belt@96736f5 editions/202611012135/index.html:604 | `const gbox = document.getElementById('goto')` |
| E25 | `gin` | kuiper-belt@96736f5 editions/202611012135/index.html:604 | `gin = document.getElementById('gotoin')` |
| E26 | `SPACE`, `N`, `repos`, `commits` declared (getters, because they are reassigned) | kuiper-belt@96736f5 editions/202611012135/index.html:198 | `let N = 0, SPACE = 0, repos = [], commits = [];` |
| E27 | `repos` assigned | kuiper-belt@96736f5 editions/202611012135/index.html:202 | `repos = rr.map(` |
| E28 | `commits` assigned | kuiper-belt@96736f5 editions/202611012135/index.html:204 | `commits = ww.map(` |
| E29 | `N`, `SPACE` assigned only after the belt sum passes: where `wafer` must resolve | kuiper-belt@96736f5 editions/202611012135/index.html:208 | `N = issued; SPACE = k;` |
| E30 | `wafer`: the wafer's two fetches (the promise chain the hook settles from) | kuiper-belt@96736f5 editions/202611012135/index.html:201 | `Promise.all([tsv('../../cosmos/repos.tsv'), tsv('../../cosmos/wafer.tsv')])` |
| E31 | `wafer` rejects here (belt refusal) | kuiper-belt@96736f5 editions/202611012135/index.html:207 | `if (bad) { hud.textContent = 'REFUSED: the commits of '` |
| E32 | `wafer` rejects here (file missing) | kuiper-belt@96736f5 editions/202611012135/index.html:240 | `}).catch(() => { hud.textContent = '../../cosmos/wafer.tsv did not load.` |

Members of `window.KY` outside `hooks` that `requires` may also name (HOOKS.md:47-66):

| # | member | key | fragment |
|---|---|---|---|
| E33 | `cam` x, y, zoom; `redraw` (dirty); `sel` (target); `lit.repo` (litRepo) | kuiper-belt@96736f5 editions/202611012135/index.html:243 | `let cx = 0, cy = 0, zoom = 1, dirty = true, tween = null, litRepo = -1, target = null;` |
| E34 | `lit.K`, `lit.Ci` | kuiper-belt@96736f5 editions/202611012135/index.html:244 | `litK = [-1,-1], litCi = null` |
| E35 | `cam.atHome` | kuiper-belt@96736f5 editions/202611012135/index.html:245 | `let atHome = true;` |
| E36 | `draw`: the engine's draw, which `KY.draw.add` wraps once | kuiper-belt@96736f5 editions/202611012135/index.html:332 | `function draw(){` |
| E37 | the overlay is cleared inside draw, so every `KY.draw.add` fn runs after this | kuiper-belt@96736f5 editions/202611012135/index.html:384 | `o2.clearRect(0,0,ov.width,ov.height);` |
| E38 | the edition layer's wrap of draw that `KY.draw.add` succeeds (the idiom modules may no longer use, 4.8) | kuiper-belt@96736f5 editions/202611012135/index.html:654 | `{ const _draw = draw; draw = function(){ _draw(); drawEdition(); }; }` |
| E39 | the second wrap (drawEdition, LINES switch) | kuiper-belt@96736f5 editions/202611012135/index.html:745 | `{ const _drawEd = drawEdition; drawEdition = function(){` |
| E40 | the third wrap (edNext) | kuiper-belt@96736f5 editions/202611012135/index.html:747 | `{ const _edNext = edNext; edNext = function(step){` |
| E41 | `panels`: the name → element map `panels.add` writes into | kuiper-belt@96736f5 editions/202611012135/index.html:710 | `const PANELS = { top: elTop, hud: hud, lines: linesPanel, foot: elFoot };` |
| E42 | `panels.place` | kuiper-belt@96736f5 editions/202611012135/index.html:712 | `function placePanels(){` |
| E43 | `panels.set` | kuiper-belt@96736f5 editions/202611012135/index.html:714 | `function setPanel(name){` |
| E44 | the frame loop starts here: the hook table is built after :747 and before this line, so every wrap above is already bound when `KY` captures it | kuiper-belt@96736f5 editions/202611012135/index.html:750 | `requestAnimationFrame(frame);` |
| E45 | FINDING (corrects team-2/STEPS.md 4.4): the page script is `type="module"`, so it runs in strict mode although it never writes `'use strict'` (`grep -c` = 0). A write to the frozen `KY` from page code therefore THROWS a TypeError, it is not a silent no-op. Team 2's rule stands (loader state lives in a closure, never assigned onto `KY`), for the opposite reason. Module scope is also why a separate file cannot reach the engine's `let`s (4.1), and why the page script runs deferred, after parsing | kuiper-belt@96736f5 editions/202611012135/index.html:102 | `<script type="module">` |

## F. The hook table in the patched page: where each hook is bound

The integrator's page is `editions/202611012135/index.html` at 96736f5 with `handoff/04-loader/index.html.patch`
applied: `patch -p1` applies cleanly (15 hunks), the result is 911 lines, sha256
`8cfebaacafcbec3a87ce97cdfb9d5ca1cae70c03811ea3205f7543ccfc41866d`. The working-tree page is NOT patched yet (team
10 applies it). The block between the two marker lines is byte-identical in the patch and in the reference
`modules/202611012145-loader.js` (`cmp` of the 118 extracted lines: identical), so each row keys the reference file
(sha `WT`: the working tree, uncommitted; the harness commits) and gives the patched page's line in brackets; page
line = reference line + 783. The engine lines each hook reads are section E; in the patched page they move to
keyPlace :294, address :298, describe :300, findBy :296, flyTo :269, home :293, homeCamera :288, safeBox :278 (wrap
:763), lightTime :570, showNew :436, goKey :432, fmt :137, words :138, esc :704, cv/ov/o2 :133, hud/big :135,
sub/card :136, gbox/gin :626, N/SPACE/repos/commits :213, cx…target :259, litK/litCi :260, atHome :261, draw :348,
PANELS :733, placePanels :736, setPanel :738 (measured with `grep -n` on the patched copy).

| # | binding | key | fragment |
|---|---|---|---|
| F1 | the block begins (patched page :790) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:7 | `KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · begin` |
| F2 | `KY.names`: the 28 hooks + the six members, frozen (page :801) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:18-20 | `'SPACE', 'N', 'repos', 'commits', 'wafer', 'cam', 'lit', 'sel', 'redraw', 'draw', 'panels']);` |
| F3 | `KY.draw.add`'s one wrap of draw: painters after the engine and edition overlay; a throwing painter is removed and named (page :809) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:26 | `{ const _draw = draw; draw = function(){ _draw();` |
| F4 | `window.KY` built and frozen (page :816) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:33 | `const KY = Object.freeze({` |
| F5 | `KY.hooks` frozen (page :818) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:35 | `hooks: Object.freeze({` |
| F6 | hooks 1-14: keyPlace … esc, bound by name AFTER every wrap, so `safeBox` is the bar-aware one (page :819) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:36 | `keyPlace, address, describe, findBy, flyTo, home, homeCamera, safeBox, lightTime, showNew, goKey, fmt, words, esc,` |
| F7 | hooks 15-23: the elements and the 2D context (page :820) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:37 | `cv, ov, o2, hud, big, sub, card, gbox, gin,` |
| F8 | hooks 24-27: getters over the reassigned lets (page :821) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:38 | `get SPACE(){ return SPACE; }, get N(){ return N; }, get repos(){ return repos; }, get commits(){ return commits; },` |
| F9 | hook 28: `wafer` (page :822) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:39 | `wafer: kyWafer }),` |
| F10 | `KY.cam` (page :823) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:40 | `cam: Object.freeze({ get x(){ return cx; }` |
| F11 | `KY.lit` (page :824) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:41 | `lit: Object.freeze({ get repo(){ return litRepo; }, set repo(v){ litRepo = v; dirty = true; },` |
| F12 | `KY.sel` (page :827) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:44 | `sel: Object.freeze({ get target(){ return target; }, set target(t){ target = t; dirty = true; } }),` |
| F13 | `KY.redraw` (page :828) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:45 | `redraw(){ dirty = true; },` |
| F14 | `KY.draw` (page :829) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:46 | `draw: Object.freeze({ add(fn, order){` |
| F15 | `KY.panels` add/set/place (page :831) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:48-51 | `set: setPanel, place: placePanels }),` |
| F16 | `KY.register`: a closure over the loader's `kyAdmitting`; a registration outside admission is ignored and named (page :836) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:53 | `register(m){ if (!kyAdmitting) { kyLine('a registration outside admission ignored: '` |
| F17 | `KY.modules`, `KY.inspect()` (page :838-839) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:56 | `inspect(){ return JSON.parse(JSON.stringify(KY_STATE)); } });` |
| F18 | `window.KY`, `window.__KUIPER_MODULES__`, `window.__KUIPER_EDITION__` (page :840) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:57 | `window.KY = KY; window.__KUIPER_MODULES__ = KY_MODULES; window.__KUIPER_EDITION__ = KY_STATE;` |
| F19 | the wafer promise, created before the data block's fetch (patch hunk at page :214) | kuiper-belt@WT editions/202611012135/handoff/04-loader/index.html.patch:59 | `const kyWafer = new Promise((ok, no) => { kyWaferOk = ok; kyWaferNo = no; }); kyWafer.catch(() => {});` |
| F20 | resolves `{N, SPACE}` right after the sum passes (page :224) | kuiper-belt@WT editions/202611012135/handoff/04-loader/index.html.patch:70 | `N = issued; SPACE = k; kyWaferOk({ N, SPACE });` |
| F21 | rejects with the belt refusal's words (page :223) | kuiper-belt@WT editions/202611012135/handoff/04-loader/index.html.patch:69 | `kyWaferNo(new Error(hud.textContent)); return; }` |
| F22 | rejects with the missing-file words (page :256) | kuiper-belt@WT editions/202611012135/handoff/04-loader/index.html.patch:79 | `kyWaferNo(new Error('../../cosmos/wafer.tsv did not load. The wafer will not invent its keys.'));` |
| F23 | `refuse(m, slot)`: one `#refuse[role=alert]` strip, one line per slot (engine, modules): NL-009 09-robust (page :140) | kuiper-belt@WT editions/202611012135/handoff/04-loader/index.html.patch:41 | `function refuse(m, slot){ slot = slot || 'engine';` |

The loader, refusal by refusal (each word the acceptance tests look for, and the GridAtlas line it answers):

| # | rule | key | fragment |
|---|---|---|---|
| G1 | manifest fetched no-store (B1) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:102 | `await fetch('modules.json', { cache: 'no-store' })` |
| G2 | whole-set refusal on schema, hooks, edition, shape, no crypto.subtle: one strip, "the wafer is unchanged" (C4, C11) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:107 | `kyRefuse('MODULES NOT ADMITTED: ' + shape + ' · the wafer is unchanged')` |
| G3 | in `order`, in order, never twice (B7, B27) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:111 | `seen.has(id) ? 'in order twice'` |
| G4 | `in order but not in modules` (B8, D6) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:65 | `if (!rec) return 'in order but not in modules';` |
| G5 | `bad path` (D7) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:67 | `return 'bad path ' + path;` |
| G6 | stamp: file name ≠ generation (A30-A31) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:69 | `'stamp mismatch: generation ' + rec.generation + ', file name ' + fd[1]` |
| G7 | hash must be 64 hex (B12) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:70 | `return 'sha256 is not 64 hex';` |
| G8 | `no licence` (ROADMAP step 4 licence note) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:71 | `return 'no licence';` |
| G9 | `missing hook` from the manifest, before any fetch (B11) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:72 | `return 'missing hook ' + r;` |
| G10 | `HTTP <status>` (B14) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:74 | `if (!res.ok) return 'HTTP ' + res.status;` |
| G11 | SHA-256 of the bytes in the browser (B15-B16) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:75 | `crypto.subtle.digest('SHA-256', buf)` |
| G12 | `sha256 mismatch` (B17) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:76 | `if (sha !== rec.sha256) return 'sha256 mismatch';` |
| G13 | `over byte_budget` (A25) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:78 | `return 'over byte_budget '` |
| G14 | stamp: header ≠ generation (the check A30 lacked) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:81 | `'stamp mismatch: generation ' + rec.generation + ', header ' + head[2]` |
| G15 | one blob-URL script per module, `data-ky-module` (B18-B19, A29) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:61-62 | `s.dataset.kyModule = id;` |
| G16 | `no registration` | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:84 | `if (!reg) return 'no registration';` |
| G17 | stamp: registration ≠ generation | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:88 | `', registration ' + reg.generation` |
| G18 | `install threw <message>` | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:92 | `return 'install threw '` |
| G19 | an async install that rejects AFTER admission is a failure line in the readout and `failures[]`, not a refusal and not in the strip (finding R4 below) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:94 | `KY_STATE.failures.push({ id, why: 'install rejected '` |
| G20 | `<id> admitted · <sha256 first 12>` | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:114 | `kyLine(id + ' admitted · ' + KY_MODULES[id].sha256.slice(0, 12))` |
| G21 | `<n> module(s) refused: …` in the strip while the rest runs (C10-C11) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:122 | `' · the wafer, the bar and every admitted module keep working'` |
| G22 | the block ends right before the frame loop (page :907; :908 is `requestAnimationFrame(frame);`) | kuiper-belt@WT editions/202611012135/modules/202611012145-loader.js:124 | `KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · end` |

## G. Measured by the evidence officer, independently of test.cjs

Scratch site `/tmp/nl010-opus/team-4/evidence/site/` (the edition folder copied, `index.html` = the patched copy of
section F, `modules.json` = `handoff/04-loader/modules.json`, `cosmos/` a symlink to the repository's), served on
127.0.0.1:8443 (team 4 evidence port), Playwright chromium with SwiftShader as OPUS-BRIEF.md "Testing", 7 s wait.
Scripts: `/tmp/nl010-opus/team-4/evidence/js/smoke.cjs`, `neg.cjs`. Run at 21:5x UTC on 2026-11-01.

| measurement | Pixel 7 | Galaxy S24 (360 px) |
|---|---|---|
| `Object.isFrozen(window.KY)`, `Object.isFrozen(KY.hooks)` | true, true | true, true |
| `Object.keys(KY.hooks)` equals the 28-name list of HOOKS.md:12-13, in order | yes | yes |
| `KY.names.length` | 34 | 34 |
| `window.__KUIPER_MODULES__ === KY.modules` | true | true |
| `admitted` | `hello` · `ee2130b56e74…` (= MODULE.sha256:1 and modules.json) | same |
| `refused`, `failures`, `#refuse` present | [], [], false | [], [], false |
| `KY.hooks.N`, `KY.hooks.SPACE` after load | 45,735,836,396 · 63,340,120,796 | same |
| hello's ring drawn (`frames_drawn`), `#ky-hello` connected | 1, true | 3, true |
| loader start → last admitted (ms, `performance.now()`) | 907 → 4,895 | 907 → 1,320 |
| Σ `bytes` / Σ `byte_budget` of admitted | 1,303 / 4,096 | 1,303 / 4,096 |
| `pageerror`, console errors | 0, 0 | 0, 0 |
| one byte of hello changed in flight (`page.route`) | | `refused: [{id:'hello', why:'sha256 mismatch'}]`; `#refuse` `role=alert`, rect 12,281 → 348,367 inside 360 × 780; text `1 module refused: hello (sha256 mismatch) · the wafer, the bar and every admitted module keep working`; pageerror 0 |

Also measured: `sha256sum` of `modules/202611012145-hello.js` = `ee2130b5…dd53` (1,303 bytes) and
`modules/202611012145-loader.js` = `055ee887…afc5` (11,043 bytes), equal to MODULE.sha256 and to the manifest's
`modules[0]` and `references[0]`. Every other module in `modules/` at 21:55 UTC (layers, see-through, kuiper-shell,
line-card) has line 1 matching the loader's header pattern (loader :79) and exactly one `KY.register(`; the loader
reference has neither, by design (it is listed under `references`, never in `order`). The SwiftShader timings are
one run each, not a benchmark; the full acceptance (tests 1-9) is test.cjs's.

## H. Findings

| # | finding | key | fragment |
|---|---|---|---|
| H1 | The roadmap's `fmt :126` is :125 (the lead's correction, confirmed) | kuiper-belt@96736f5 editions/202611012135/index.html:125 | `const fmt = n =>` |
| H2 | team-2 STEPS 4.4's reason for the closure (a frozen write is a silent no-op) is inverted: the page script is a module, so strict; the rule stands (E45) | kuiper-belt@96736f5 editions/202611012135/index.html:102 | `<script type="module">` |
| H3 | The hand-written edition stamp still drifts: Edition 5's readout line says EDITION 2 (team-2 EVIDENCE B2.19 found the same in Edition 4); for team 10, whose file index.html is | kuiper-belt@96736f5 editions/202611012135/index.html:650 | `'\nEDITION 2 · '` |
| H4 | GridAtlas's lightning record needs two stamp fields (A32-A33) because its `generation` means the pointer's; the Kuiper record keeps ONE meaning and checks it in all three places (G6, G14, G17) | gridatlas@5ec7f62 atlas/current.json:644 | `"module_generation"` |
| H5 | GridAtlas's CI hashes LF-normalised text (D13) while its browser hashes raw bytes; kuiper-belt's `eol=lf` makes the two the same bytes, so E6 and the loader cannot disagree on a checkout | kuiper-belt@96736f5 .gitattributes:3 | `eol=lf` |

## I. Review of the lead's FINDING (HOOKS.md, #10 comment 6564299733) and of HANDOFF.md

Status written 21:59 UTC, before HANDOFF.md existed; updated below when it is read.

**HOOKS.md / the FINDING: PASS with three corrections to words, none to keys.** All 28 hook lines and the six
members re-read and correct (E1-E45); `fmt :125` correct. Corrections: (a) HOOKS.md:3 "21:4x UTC" is not a
measurement; GitHub's time of the FINDING is 21:42:44Z (comment 6564299733). (b) HOOKS.md:36 `big` is :123 only.
(c) HOOKS.md:80-83 lists refusal words that differ from what the loader prints: `bytes <n> ≠ manifest <m>` is printed
`bytes <n>, manifest <m>` (loader :77); `generation <a>, file name <b>` is printed `stamp mismatch: generation <a>,
file name <b>` (:69), and the loader also prints `stamp mismatch: … header …` (:81), `… registration …` (:88), `no
header line` (:80), `sha256 is not 64 hex` (:70), `schema <x>` (:86), `requires <x> not in the manifest` (:89), `no
install` (:90), `script did not load` (:83), `fetch failed` (:73), `in order twice` (:111), and records `install
rejected` as a failure (:94). Other teams read HOOKS.md as the contract, so its list should be the loader's strings.
The stamp written three times (file name, header, registration) departs from team-2/STEPS.md 4.3 (two places) but
follows ROADMAP.md 4.3 and OPUS-BRIEF.md:22-24; it is sound because every copy is checked (G6, G14, G17 and E6), and
A30-A31 drifted only because one copy was not.

**The loader and the patch: PASS on behaviour, conditions on words.**
- R1 (must be stated before posting). The block's comment says "The engine above is untouched but for the wafer
  promise (three statements in the data block)" (loader reference :8, page :791). The same patch also changes engine
  lines: `refuse()` replaces the WebGL refusal (patch :41-44), the context-lost line (:53), the belt and file refusals
  (:69, :79); the tap-or-drag slop and `tapUp` (:90-91, :114, NL-009 04-touch); the viewport meta (:8). These are the
  NL-009 round-1 patches 04-touch and 09-robust, which OPUS-BRIEF.md:28-30 assigns to team 4's loader patch, so they
  are allowed, but the sentence is false as written. HANDOFF.md must name each engine hunk and the NL-009 patch it
  folds in; correcting the comment (which changes both copies' bytes and the reference's sha256) is recommended.
- R2 (low). The header's `<name>` is captured but compared with nothing, in the loader (:79) and in E6; a header
  `kuiper module foo` on module `bar` is admitted. One `head[1] !== id` line in each closes it.
- R3 (low). `window.__KUIPER_EDITION__` is the live `KY_STATE` (:57), writable by any script; GridAtlas publishes a
  serialised snapshot (B21). `KY.inspect()` returns a copy; tests should read that, or freeze the state at `done`.
- R4 (disclose). An `install` that returns a rejecting promise is admitted and its rejection goes to `failures[]` and
  the readout only, not to `refused` nor the `#refuse` strip (G19). A module awaiting `wafer` when the wafer refuses
  lands here; the engine's own refusal is already in the strip, so nothing is silent, but the HANDOFF should say so.
- R5 (low). `KY.modules` is not frozen; a module can add an entry (existing entries are non-writable,
  `defineProperty`, :95). Admission is recorded in `KY_STATE`, so a forged entry never appears in `admitted`.
- R6 (owner's call, record it). The viewport now carries `maximum-scale=1,user-scalable=no` (patch :8, NL-009
  04-touch): page zoom is disabled, a risk against WCAG 2.1 SC 1.4.4 (resize text). Not team 4's decision to reverse;
  it belongs in the HANDOFF's limitations.
- R7 (must fix before posting: the header law). `test.cjs` line 1-12 and `edition_check.py.patch`'s docstring carry no
  licence line; add `Apache-2.0 (kuiper-belt)` to each (LICENCE.txt). hello.js :1, the loader reference :1, the block
  :11 and modules.schema.json `description` carry theirs.
- R8 (for team 10, not team 4). H3: `EDITION 2` at index.html:650.

VERDICT-PENDING-HANDOFF

## J. Key check

`python3 -I /tmp/nl010-opus/team-4/evidence/check_keys.py EVIDENCE.md`: KEYCHECK
