# EVIDENCE: Opus team 6, the File menu and the hash grammar (`modules/202611012231-file.js`)

Evidence officer OPUS-6 (port 8463), 2026-11-01 from 23:07 UTC. Law: no claim without a key; every number is measured,
never estimated. I re-read every key below from the files at these heads. No Playwright was run (the machine is loaded).
The numbers from browser runs are the lead's and builder's measurements (PLAN.md Status) and are labelled as theirs.

- `ga@5ec7f62` = gridatlas@5ec7f62f213e2d20a02e86427daa182c0f38e4a4 (clone /home/user/estate/gridatlas, HEAD = this sha)
- `kb@018b46a` = kuiper-belt@018b46aed50f28f7b1882a0dcaba6593ce522beb (main = origin/main; Edition 4 live)
- `kb@96736f5` = kuiper-belt, Edition 5 skeleton (the HOOKS.md line numbers); `kb@a72c175` = the newest commit of
  `editions/202611012135/index.html` (`git log -- index.html`). Lines 1–623 are identical at the two commits
  (`git diff 96736f5 a72c175` changes only from :624). `ED5` = `editions/202611012135/` on branch edition/202611012135.
- The module: `ED5 modules/202611012231-file.js`, 809 lines, 57,207 bytes, sha256
  `d8c236c0186bb35df1514c8c2c13b11303296614036b8c33ada866f6d06cf9da` (measured 23:36 UTC; committed at kb@febdd99;
  equal to MODULE.sha256 and to MODULE.json `sha256` and `bytes`). `node --check` OK. Every module line number below is
  for this sha. History: `f0a44c74…` (kb@6db1319) → `3a03a2ab…` (kb@38ed53c: `link.format`, `link.parse`, +2 lines from
  :345) → `3d0eadc7…` (kb@513c2f1: my §9 fixes 1 and 2, in place) → `d8c236c0…` (kb@febdd99: the hash reader tells our
  own older text from a new link, `written`/`seen` :329-346, +8 lines; the inert current-edition row becomes a disabled
  44 px `<button>` :704-705, +1 line). If it changes again, re-key it with `grep -n` on the names given.

## 1. GridAtlas's File menu: each item and the code behind it (ga@5ec7f62 `atlas/modules/202609031958-menu-bar.js`, 1,805 lines)

| GridAtlas fact | Key (ga@5ec7f62 menu-bar.js unless named) | In the Kuiper module |
|---|---|---|
| The six menus, in order: `['File', 'Edit', 'View', 'Scope', 'Grid', 'About']` | :31 | The shell owns the names (Opus 1); FILE fills `.gm-group[data-group="file"]` (kuiper-shell.js:404), `build` :755-772 |
| Why File exists: "we are heading towards a grid OS in our website the menus must be neat, it should allow AI and humans to develop and use" (the architect, 2026-09-05) | :616-618 (comment :614-621) | The roadmap's goal sentence; module header :2 |
| File lists the engine's maths, FETCHED from `ENGINE_GRAPH_URL` and opened at `ENGINE_VIEW_URL` | :629-632; fetch :641-647 | OPEN rows: key, line, edition, app (:634-670). No fetch at install (6.2): editions.json only when `Open an edition ▸` opens (`fillEditions` :695-719) |
| Each engine node is `<a role="button" target="_blank" rel="noopener">` | :744-749 | Departure, as the roadmap asks: no `target="_blank"` (`grep -c _blank` = 0, `window.open` = 0); same tab, back returns |
| A failed fetch adds no group and no error ("Deliberately silent") | :758-763 | Departure: the Kuiper says the failure in the row (`the editions list did not load: …` :717; `missing · HTTP <status>` :741) because 09-robust asks for a missing file to be a test FAIL, not a silent 404 |
| The one runnable command `RUN_COMMAND = 'git clone https://github.com/Ventusltd/ventus-grid-engine' + ' && cd ventus-grid-engine && node verify.mjs'`, under the group "Run the engine yourself · offline, no dependencies" | :707-711 | `python tools/key.py <k>` (row `ky-file-key-cmd` :644-646; `Copy python tools/key.py <k>` :675). The engine's own card already ends with it: "the text itself:  python tools/key.py " + a.k (kb@a72c175 ED5 index.html:292; kb@018b46a index.html, same `describe`) |
| Copy with `navigator.clipboard.writeText`, label `✓ Copied — paste it into a terminal`; otherwise the button shows `⧉ ` + the command | :716-733 (writeText :724-726, labels :719-721) | `copyText` :401-414: `✓ Copied` for 4,000 ms (`COPIED_MS` :372); refused or absent → `showPayload` :387-400, a read-only 44 px field holding the payload, focused and selected |
| "A control that silently does nothing is worse than one that shows its own payload." | :728-730 | Same rule: no branch of `copyText` returns without the payload copied or shown |
| Rows ≥ 44 px: `min-height:44px` | :221 | `.ky-file-form{…min-height:44px…}` :586; payload field `min-height:44px` :382; GO 56 px wide :591 |
| Group headings by `appendGroup(panel, text)` | :584 | `heading()` :613 with four groups: Open, Link, Evidence, Export (:634, :671, :679, :689) |
| Export, the architect's words: "allow the user to export screenshot prints via file save or file print and they should produce beautiful slides …" (2026-09-05) | :797-799 | EXPORT group: `Save an image of this view`, `Print` (`exportRows` :515-521) |
| THE IMAGE MUST NOT BE BLANK: a WebGL canvas without preserveDrawingBuffer reads empty after compositing, so capture INSIDE a render frame and check before offering; "Handing someone an empty PNG that looks like a successful save is worse than refusing." | :804-810 | `capturePainter` :439-449 is a `KY.draw.add` painter at order 1e9 (:570), so it reads `#c` in the same task the wafer was drawn. The Kuiper's context is `{ antialias:false, alpha:false, … }` with no preserveDrawingBuffer (kb@a72c175 ED5 index.html:122) |
| THE CREDIT MUST TRAVEL WITH THE ARTEFACT | :812-816 | the foot `footLines` :437: the edition name + UTC time, `code Apache-2.0, text and data CC BY 4.0` (:373, from kb@018b46a editions/README.md:27), the link that reopens the view |
| `exportStamp()` = `toISOString().replace('T',' ').slice(0,16) + ' UTC'` | :817-820 | `utcStamp` :425, same expression (method, not copied as a function) |
| `attributionText(doc)` | :822-826 | the licence line above (the Kuiper has no third-party map tiles to credit) |
| `looksBlank(canvas)`: a 40×40 probe, blank when every alpha is 0; a tainted canvas (throws) is NOT blank | :1082-1096 (tainted :1091-1095) | `looksBlank` :416-424: a 160×160 probe, blank when every pixel is ONE colour, because the Kuiper's canvas is opaque (`alpha:false`) so a lost frame reads one colour, not transparent; a throw → not blank (:423). Departure stated at :363-368 |
| Capture inside a frame: `map.once('render', grab); map.triggerRepaint()` | :1120-1137 | `capture()` :450-457 asks `KYc.redraw()` and waits for the painter (4,000 ms cap, `CAPTURE_WAIT_MS` :372) |
| `saveImage`: refusal said on the control, `⊘ The map could not be captured — use Print instead` | :1139-1165 (refusal :1154) | `the image came back blank; try again after the wafer has drawn` (`BLANK_WORDS` :374), said in the row's second line (`say` :470-473); no file |
| `appendExport`: group "Export this view", three controls: `#gridatlas-export-print` "⎙ Print · or save as PDF", `#gridatlas-export-pdf` (in-page PDF writer), `#gridatlas-export-image` "⤓ Save an image of this view" | :1350-1390 | two controls: `#kuiper-export-image` "⤓ Save an image of this view", `#kuiper-export-print` "⎙ Print"; no PDF writer copied (the browser's print-to-PDF), as ROADMAP 6.1 says |
| EACH CONTROL IS NAMED, BECAUSE ITS LABEL IS NOT A NAME: `id` + `data-gm-export="print\|pdf\|image"` | :1354-1365 (attributes :1366-1367, :1374-1375, :1382-1383) | `id` + `data-ky-export="image\|print"` (:516-519); rows by id `ky-file-*`, EDIT row `ky-edit-paste`, evidence `data-ky-evidence` |
| What File holds in the live page: the search bar `move(panels.File, ready.nodes.search)`, the engine's Export button `move(panels.File, ready.nodes.exportButton)`, the engine modules and the export group | :1662, :1663, :1586, :1587 | — (the Kuiper's search is the find box, in EDIT, per 6.5) |
| …the engine's Export button is `#btn-export` "⬇ Export CSV"; the search is `#search-input` "Search project name..." + `#search-btn` GO | required nodes :146, :148; ga@5ec7f62 atlas/releases/202608300453-atlas-v9/index.html:44, :47, :51 | — |
| Edit ← status button, View ← fullscreen, Scope ← radius/area/zone/measure | :1664, :1665, :1666-1669 | — (EDIT/VIEW are Opus 1's; this module adds one EDIT row, `Paste a link…`, `pasteRow` :552-557, wired at :769) |

## 2. GridAtlas's `?repd_ref=` deep link (the lesson for "copy a link")

| Fact | Key |
|---|---|
| The repository root forwards query AND hash: `window.location.replace(target+window.location.search+window.location.hash)`, `target='./atlas/'` | ga@5ec7f62 index.html:2 |
| The receiver's identity: `"identity_parameter": "repd_ref"`, `"identity_rule": "EXACT_REPD_REF_ONLY"` | ga@5ec7f62 atlas/releases/202608300453-atlas-v9/deep-link-receiver-manifest.json:4-5 |
| Written on selection: `setDeepLink(result)`: `url.searchParams.set('repd_ref', result.repd_ref); history.replaceState(history.state, '', url)` | ga@5ec7f62 atlas/releases/202608300453-atlas-v9/202608291818-place-postcode-search.js:206-210 |
| Read on arrival: `receiveExactRepdDeepLink`: `new URLSearchParams(window.location.search).get('repd_ref')`; absent → `status: 'ABSENT'` | same file :293-298 |
| The cartridge live today (current.json id `uk-gazetteer-flyto`, generation 202609071213, path `./cartridges/202609071213-place-global-search-v9-5.js`) has the same writer and reader | ga@5ec7f62 atlas/current.json:16, :58-64; atlas/cartridges/202609071213-place-global-search-v9-5.js:380-384 (writer), :695-702 (reader) |
| A place selection DELETES `repd_ref` and flies: `url.searchParams.delete('repd_ref'); history.replaceState(…)`, `map.flyTo({ center, zoom, duration: 1200, essential: true })` | same cartridge :559-570 |
| GridAtlas reads no hash: `git grep -l 'location\.hash'` over `atlas/*.js *.mjs *.html` → 0 files | ga@5ec7f62 atlas/ (measured 23:10) |

The Kuiper's mapping (module SECTION A): written on every change by `history.replaceState(history.state, '', path +
search + '#' + hashText())` (`writeNow` :125-132), never `pushState`; read on arrival after `KY.hooks.wafer` resolves (:793)
and on `popstate` and `hashchange` through one reader, `seen` (:334-346); identity exact by rule (`RULES` :66-76: `key ^\d{1,15}$ < SPACE`, `line ^[0-9a-f]{40}:\d+$`,
…). The departure, query → hash, is ROADMAP R3 and is written in GRAMMAR.md "Why the hash" with these keys.

## 3. The Kuiper engine's hash handling, and flyTo by key

Finding: the engine reads NO hash. `grep -c 'location.hash'` = 0 in kb@018b46a index.html, kb@018b46a
editions/202611012027/index.html and ED5 index.html (kb@a72c175) (measured 23:11). Its only URL input is the `?selftest=` query.
This module is the first hash reader in the engine. The table below gives what it reads and calls, and where.

| Fact | Key (ED5 = kb@a72c175 editions/202611012135/index.html; live = kb@018b46a index.html) |
|---|---|
| `?selftest=YYYY-MM`, `=new`, `=phone`, `=repo:<name>`, read by `new URLSearchParams(location.search)` | ED5 :220, :236, :237, :238 |
| `flyTo(x, y, z)`: a 900 ms tween of the camera to world x, y at zoom z | ED5 :253; live :225 |
| `goKey(k)`: `keyPlace(k)` → `target` → `show(address(k))` → `flyTo(p[0], p[1], 14)`. This is "fly to a key" | ED5 :416; live :388 |
| `keyPlace(k)`: `Math.imul((k % 2^32) >>> 0, G32) >>> 0`, θ = 2π m / 2^32, r = √(k + 0.5) | ED5 :278 |
| `address(k)`: null unless `0 <= k < SPACE`; `findBy('k0', k)` | ED5 :282, :280; live :254 |
| `describe(a)`: the card text begins `key <b>` + fmt(k) + `</b>`. The module's card watcher matches `^\s*key ([\d,]+)` on it (:304) | ED5 :284-293 |
| `show(a)`: `card.style.display = 'block'; card.innerHTML = describe(a)` | ED5 :415 |
| `home()` → `homeCamera()` → `flyTo` | ED5 :277, :272; live :249 |
| `SPACE` and `N` set from cosmos/wafer.tsv: `N = issued; SPACE = k` | ED5 :198, :208 |
| The find box `#goto`/`#gotoin` and its grammar on Enter: period `^(20\d\d)(?:-(\d\d))?(?:-(\d\d))?$` → `lightTime`; `new …` → `showNew`; digits → `goKey(Math.min(SPACE-1, Number(q)))`; else a repository by exact lower-case name, then `includes` | ED5 :604-613; live :577-585 |
| The engine CLAMPS a digit string to `SPACE-1`; FILE's `Open a key…` REFUSES it in words, `key <k> is not on this wafer (SPACE <n>)` (module :637-639, :281), as ROADMAP 6.1 asks. These are two different behaviours for two different controls, and the difference is intended | ED5 :611 vs module :639 |
| Single keys: `r` random issued line → `goKey`; `n` → `showNew(24)`; `/` opens the box; `Backspace` clears and `home()` | ED5 :614-618; live :586-590 |
| `lightTime(y, m, d)` | ED5 :554; live :526 |
| The placeholder today: "a key, or a repository name to send light through" (the module sets "a key, a repository, a period, or a pasted link", :524, :544) | live :64 |
| The verified-lines predicate `b.on_wafer && b.verified && Number.isFinite(b.key) && b.key >= 0 && b.key < SPACE` | ED5 :636 at kb@a72c175 (:632 at kb@96736f5); copied unchanged into layers.js `loadLines` (ED5 modules/202611012141-layers.js:417) and the module's `loadBodies` (:164) |
| The Edition 4 card and fly (`edCard`, `edFly`) moved out of the page into Opus 3's layers module: `api.open(i)` = `openLine(i); fly(lines.placed[i])`; `fly(b)` = `H.flyTo(aim(b, 14), 14)`, re-aimed one frame later | ED5 modules/202611012141-layers.js:687, :491-496 |
| What the module calls to fly to a key: a placed verified line → `KY.modules.layers.api.open(i)` (:175-181); any other key → `H.goKey(k)` (:284) | module :280-285 |

The Kuiper's own hash precedents, which the grammar copies:

| Fact | Key |
|---|---|
| Learn the Kuiper writes its state into the hash: `history.replaceState(null, '', '#' + hashText())`, 400 ms debounced | kb@018b46a learn-the-kuiper/202610050609/lesson.js:333-336 |
| Learn the Kuiper's reader merges query and hash: `(location.search.slice(1) + '&' + location.hash.slice(1)).split('&')` | kb@018b46a learn-the-kuiper/202610050609/one.js:468 |
| Opus 3's registry already writes `layers=` into the hash (`writeURL`, replaceState) and reads it from the hash first, then `?layers=` | ED5 modules/202611012141-layers.js:607-637 (`writeURL` :621-629, `applyLink` :630-636) |
| The module never drops `layers`: `syncLayers()` reads it back from the hash before each write | module :119-122, :127 |
| See Through's module stands down its own hash reader when `KY.modules.file` is admitted | ED5 modules/202611012141-see-through.js:329-330 |
| See Through's link builder, which the module calls for `#app=see-through`: `link(f)` → `POINTER + '#repo=…&key=…[&space=…]&sub=…'` | same file :47-56; api :360 |

## 4. The pointers' forwarding

| Fact | Key |
|---|---|
| `editions/` forwards the hash only: `location.replace('202611012027/' + location.hash)` | kb@018b46a editions/index.html:12 |
| `see-through/` forwards the hash only: `location.replace('202610050609/' + location.hash)` | kb@018b46a see-through/index.html:12 |
| `learn-the-kuiper/` forwards the hash only: same form, same stamp | kb@018b46a learn-the-kuiper/index.html:12 |
| None of the three forwards `location.search`; GridAtlas's root forwards both | above; ga@5ec7f62 index.html:2 |
| Caution: each pointer also has a 0-second meta refresh to the bare folder WITHOUT the hash (`content="0; url=202611012027/"`). The script runs first and the hash survives. Without JavaScript the hash is dropped | kb@018b46a editions/index.html:7 (see-through/index.html:7, learn-the-kuiper/index.html:7) |
| Today `editions/` points at Edition 4 (202611012027), and Edition 4 reads no hash (§3). A link through the real pointer therefore keeps its hash in the URL but does nothing until PR B moves the pointer to 202611012135. A4 and A5 "through the pointer" must use a routed copy of the pointer, or assert the forwarded URL only (the tester's G2) | kb@018b46a editions/index.html:7, :11, :12 |
| Step 9's pointer law (9.2) forwards `location.search + location.hash` from Edition 5. The module's reader merges both (`parse` :88-96, search first, the hash wins a duplicate), so either form survives | ROADMAP R3; module :86-96 |
| Edition 1's instrument is `202610311905/belt/` (the module's `editionTarget` :190-193). data/editions.json writes `../202610311905/` for it | kb@018b46a editions/README.md:22; ED5 data/editions.json (Edition 1 path) |

## 5. The hook table: every name in `requires`, and what it is

`requires` (module :9-10 header, :805-806 registration; the two lists are identical, 27 names since kb@513c2f1). The admissible set is
the 28 hooks ∪ `cam lit sel redraw draw panels refuse` ∪ the `provides` of modules earlier in `order`
(ED5 handoff/04-loader/HOOKS.md "The rest of window.KY"). Engine lines are kb@96736f5 = kb@a72c175 for :1-623.

| name | kind | engine line (HOOKS.md row) | used by the module |
|---|---|---|---|
| keyPlace | hook 1 | :278 | not called directly (goKey and layers.js call it) |
| fmt | hook 12 | :125 | `H.fmt` through `fmt()` :59, in `measureEvidence` :742 (added to `requires` at kb@513c2f1) |
| address | hook 2 | :282 | not called directly |
| describe | hook 3 | :284 | not called; its text is matched (:316) |
| goKey | hook 11 | :416 | `H.goKey(k)` :284 |
| lightTime | hook 9 | :554 | `H.lightTime` :254 |
| home | hook 6 | :277 | `H.home()` :259 |
| flyTo | hook 5 | :253 (patched with the reduced-motion wrap, 04-loader index.html.patch:223) | not called directly (goKey, layers.fly) |
| safeBox | hook 8 | :262, wrapped :726 | not called directly |
| card | hook 21 | :124 | `H.card` (watcher `watchCard` :294-308, :259) |
| gbox, gin | hooks 22-23 | :604 | `watchFind` :309-328, `wireFind` :535-545, `openPaste` :546-551 |
| SPACE, N | hooks 24-25 | :198, :208 | `H.SPACE` (rules, refusals); N unused |
| repos | hook 26 | :198, :202 | `findRepo` :184-189 |
| wafer | hook 28 (the promise) | after :208 (04-loader index.html.patch:59) | `H.wafer.then(readLocation)` :793 |
| cv, ov | hooks 15-16 | :121 | the capture `Hc.cv`, `Hc.ov` :441-447 |
| hud | hook 18 | :123 | `readout()` :775 |
| big | hook 19 | :123 | `editionName()` :426-431 |
| panels | extra | `KY.panels.add` (:710 PANELS) | the fallback FILE panel when no shell :761 |
| draw | extra | `KY.draw.add(fn, order)`, the one wrap of draw (:332; patch :269-274) | the capture painter (order 1e9) :570, the readout (order 40) :790 |
| redraw | extra | sets `dirty` | :138, :259, :455 |
| cam | extra | :243-245 | declared, not used |
| lit, sel | extras | :243 | `KY.lit.repo = r.i; KY.sel.target = null` :259 |
| layers | `provides` of Opus 3 (`id: layers`), before `file` in `order` (integration order 4 < 5) | ED5 modules/202611012141-layers.js:686-693 | `api.open/placed/get/set/inspect` :144-181, :232-250 |

Findings for the lead (§9 item 2):

- RESOLVED at kb@513c2f1. Used but NOT in `requires`: `fmt` (hook 12, :125). It is called as `H.fmt` through `fmt()` (:59), in `measureEvidence`
  (:742). It is in the 28-hook table, so the loader always provides it, but the module's own law is that `requires`
  names what it uses.
- In `requires` but never used: `keyPlace address describe flyTo safeBox N cam`. They are admissible and do no harm,
  and they come from the roadmap's list. They are kept, and the header names them.
- Optional and never required, as HOOKS.md allows: `kuiper-shell` (`api.panel('file'|'edit'|'about')`, `close()`,
  `inspect().open`, kuiper-shell.js:528-531, `state.open` :230; the FILE group :378, :404), `line-card`
  (`api.inspect().index`/`.open`, line-card.js:201-203), `see-through` (`api.link`), `apps` (Opus 7, `api.open/list`,
  not yet cut).

## 6. The module's own header and registration (checked against the loader)

| Check | Result | Key |
|---|---|---|
| Header line 1 is `/* kuiper module file, generation 202611012231 (UTC), Apache-2.0 (kuiper-belt)` | matches the loader's regex `^\/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),` with id `file`, generation `202611012231` | ED5 modules/202611012145-loader.js:84-86; HOOKS.md "Header line 1" |
| The stamp written three times: file name `202611012231-file.js`, header `202611012231`, registration `GEN = '202611012231'` (:28, :804) | equal | module :1, :28, :804 |
| `schema: 'kuiper.module.v1'`, `id: 'file'`, `provides: ['file', 'link']` (the id is in provides) | as HOOKS.md "The registration a module makes" | module :804-808 |
| One `KY.register` call; returns early when no hook table (`if (!window.KY …) return`) | yes (one call, `grep -c 'KY.register('` = 1 outside comments) | module :29, :804 |
| Licence line: Apache-2.0, kuiper-belt code; GridAtlas method credited with its keys; "No GridAtlas bytes are copied verbatim but the words of two row labels" | correct. Every GridAtlas line it cites (:707-733, :794-834, :1082-1097, :1120-1137, :1354-1365) was re-read (§1) | module :1-7; kb@018b46a LICENSE (Apache 2.0), README.md:156-157 |
| CERN-OHL-S v2: no See Through code is copied (the module calls `KY.modules['see-through'].api.link`, and its own fallback builds a hash string) | none needed | module :198-213 |
| No `target="_blank"`, no `window.open`, no `innerHTML`, no `eval`/`new Function` | 0 / 0 / 0 / 0 (`grep -c`, 23:15) | module |
| Network: three `fetch` sites, none at install: `keys.json` (only to resolve or write a `line`, or to test a key for a line), `data/editions.json` (on opening `Open an edition ▸`), HEAD of the seven evidence files (on first opening FILE) | as the header says | module :161, :698, :739 |

## 7. The edition files FILE offers (EVIDENCE rows), measured on disk 23:12 UTC

| row | bytes on disk | note |
|---|---|---|
| `keys.json` | 1,709,129 | sha256 `1c293c33…9fc7242b` = data/layers.json `lines.source.sha256` (346 bodies; 344 pass the predicate; bodies[0] id `0048802883266c68d5bdb6f5add0074e8b5b729d:5`, key 36064705400, `line_text` starts `# Every digest in this repository is taken over git blob content, which is LF,`) |
| `proof/edition-sha256.txt` | missing | the integrator's (Opus 10) |
| `proof/keys-summary.json` | 9,828 | now present. REQUESTS.md 3(d) still lists it as missing (§9 item 4) |
| `modules.json` | 93 | the empty manifest (`order: []`) |
| `LICENCES.md` | missing | Opus 9's |
| `proof/android-journey.json` | missing | Opus 9's journey script |
| `README.md` | 4,187 | Edition 5 README |

## 8. NL-009 round-1 patches this module relies on (folded by others, not by team 6)

The page's ANDROID BACK (04-touch, folded by Opus 4) holds one pushed entry while a panel or the card is open:
`history.pushState({ kuiper:1 }, '')` (no URL argument, so the hash is kept), and `popstate` closes the card (ED5
handoff/04-loader/index.html.patch:207-217). The module's `closeThen` (:50-57) and its one reader for history moves
(`seen` :336-343, on both `popstate` and `hashchange` :344-345) exist because of it. A traversal that lands on a hash
this writer wrote (the last 64, `written` and `mine` :332-333) is written over, and any other hash is read as a new link. The shell pushes its own entry per open panel, `history.pushState({ kmb: name }, '')`
(kuiper-shell.js:241), and closes with `history.back()` (:248).

## 9. Review findings for the lead (keys, not opinions)

1. RESOLVED at kb@513c2f1 (both comments now read `:817-820`). Wrong key in SECTION C: the comment at :364 and the `utcStamp` comment at :425 cite `exportStamp` as GridAtlas
   `:813-816`. Those lines are the "credit must travel" comment. `function exportStamp()` is ga@5ec7f62 menu-bar.js
   :817-820 (LICENCE.txt already has it right). Change both to `:817-820`.
2. RESOLVED at kb@513c2f1 (header, registration, MODULE.json). `requires` should name `fmt` (§5). One word in the header (:9) and in the registration (:805).
3. `requires`, header :9 and HOOKS.md: `refuse` (rev 3) is available. The module puts refusals in `#hud` (`say` :138)
   and does not call `KY.refuse`. That is allowed. I record it because 09-robust found that READOUT can be hidden (its
   finding 1); the FILE rows also say each refusal on the row itself.
4. RESOLVED (REQUESTS.md corrected 23:31). REQUESTS.md 3(d): `proof/keys-summary.json` exists now (9,828 B). Three files are still missing:
   `proof/edition-sha256.txt`, `LICENCES.md`, `proof/android-journey.json`.
5. Edition 1: the module opens `../202610311905/belt/` (README :22), while data/editions.json gives `../202610311905/`.
   Both are served. The module's choice follows the roadmap and is correct. Opus 3 may want its record to agree.
6. A4/A5 "through the pointer": see §4. The live pointer lands in Edition 4 until PR B, so TEST.md must say which
   pointer was used (routed copy or the real one, with the URL asserted).
7. `#app=see-through&sub=Drax`: See Through's own page reads no hash yet (team-3/EVIDENCE.md E11 item 1; Opus 5's
   `see-through-hash-reader.patch` is pending). Only the URL can be asserted, which GRAMMAR.md already says.

8. RESOLVED (GRAMMAR.md corrected 23:31). GRAMMAR.md "Why the hash" gave the path `gridatlas@5ec7f62 atlas/modules/202608291818-place-postcode-search.js`.
   That path does not exist at ga@5ec7f62 (`git ls-tree -r`). The file is
   `atlas/releases/202608300453-atlas-v9/202608291818-place-postcode-search.js`, and the lines :206-209 and :294-298 are
   right in that file (§2).

None of these blocks the hand-off. Items 1, 2, 4 and 8 are fixed. Items 3, 5, 6 and 7 are recorded: 3 and 5 for
awareness, and 6 and 7 for TEST.md and HANDOFF.md to state honestly.

## 10. Evidence officer's review of HANDOFF.md (draft read 23:34 UTC, module d8c236c0…)

Verdict: **HOLD. Not ready to post.** The content is accurate against the module and the keys above. Every claim in
the "What it does" list matches a module line in §1–§6. These must be added before it goes to #10:

1. The PROTOCOL.md envelope (neural-link PROTOCOL.md:9-22), in Opus 1's form (handoff/01-shell/HANDOFF.md:1-8):
   `[OPUS-6 lead → HARNESS, OPUS-10, OPUS-3, OPUS-1, OPUS-5, OPUS-7] [NL-010] [<UTC>]`, `TYPE: HANDOFF`, `SCOPE:`
   (the module + handoff/06-file/), `HEAD:` (the kuiper-belt commit that holds the module; keys at ga@5ec7f62,
   kb@018b46a, kb@96736f5), `EVIDENCE:` (the handoff file list), `STATUS:`, `DETAILS:`, `ACTION REQUESTED:` (Opus 10:
   admit MODULE.json after `layers`, add the NOTICE.md line and the README sections). It must end with a blank line,
   `---` and `_Generated by [Claude Code](https://claude.ai/code)_`.
2. STATUS and the measured test result. The brief allows the HANDOFF only when test.cjs passes on Pixel 7 AND Galaxy S24
   with zero console errors (OPUS-BRIEF "Roles", Lead and Tester). TEST.md does not exist yet, and the S24 run is being
   restarted (PLAN.md 23:34). Write the device rows from TEST.md, with numbers. Do not carry them over from PLAN.md.
3. The module sha256 inline (`d8c236c0186bb35df1514c8c2c13b11303296614036b8c33ada866f6d06cf9da`, 57,207 bytes, or
   whatever it is when the PASS run hashes it). It must equal MODULE.sha256 and the sha TEST.md's run hashed.
4. The disclosures a reader needs: (a) the run used a scratch site (lead's mksite.py: Opus 4 patch without hunk 12,
   Opus 3's hunk 3 done by hand, hidden Edition 4 LINES nodes) because the integrated page cannot be built yet
   (issuecomment-6565553299); (b) the live `editions/` pointer lands in Edition 4, which reads no hash (§4), so A4/A5
   "through the pointer" used a routed copy or asserted the URL only, and the HANDOFF says which; (c) `#app=see-through`
   is asserted by URL only, because See Through's page reads no hash yet (§9 item 7); (d) three EVIDENCE rows read
   `missing · HTTP 404` until Opus 10 and Opus 9 write `proof/edition-sha256.txt`, `proof/android-journey.json` and
   `LICENCES.md`. Their console 404s are counted in TEST.md on their own line (the tester's G6), not hidden;
   (e) NL-009 round-1 patches folded in by team 6: none. 03-camera and 04-touch are relied on, folded by Opus 10 and Opus 4 (§8).
5. Departures: add the blank test (one colour on a 160 px probe, not GridAtlas's transparent 40 px probe, because the
   Kuiper's canvas is opaque; §1) to the three already named.

When 1–5 are in and TEST.md reads PASS on both devices, I re-read the posted text against TEST.md and MODULE.sha256 and
record PASS here.
