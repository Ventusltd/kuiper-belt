# TEST.md: Opus team 6, `file` (ROADMAP step 6), the acceptance test and its measured results

Tester OPUS-6 (2026-11-02). Text CC BY 4.0. Every number below is read from a run report written by `test.cjs`
(`report-pixel7.json`, `report-galaxy-s24.json` in this folder); none is estimated.

## What was tested

- Module: `editions/202611012135/modules/202611012231-file.js`, sha256
  `3ae05df7dc0848534831539c7a60f38cc18e2aeb04a489250d346274a6f626e5` (= MODULE.sha256).
- Test: `handoff/06-file/test.cjs`, in the form of FIXES/NL-009/android-journey.cjs: Playwright, `devices['Pixel 7']` and
  `devices['Galaxy S24']`, real touch (`page.touchscreen.tap` on the measured centre of each row), the chromium flags of
  the brief (ANGLE / SwiftShader), one JSON report. Exit 0 only when no gate FAILs; NOT EVALUATED is never a pass.
- Page: a scratch copy of the edition as it will stand at admission 6 (the lead's `mksite.py`: Edition 5's
  `index.html` with Opus 4's loader and hook table, Opus 3's deletions, the `let edSel = -1` shim of REQUESTS 1(d), the
  hidden Edition 4 LINES nodes kuiper-shell still requires; manifest kuiper-shell, line-card, layers, file; every other
  file a symlink to the repository), served by `python3 -m http.server` (Content-Length sent). Not admitted on it:
  see-through, apps (so `Open an app ▸` shows the module's own two-row list, See Through first and lit).
- Run: `node test.cjs http://127.0.0.1:<port>/editions/202611012135/ <outdir> --device "<name>" --shots <dir>`, one device
  at a time, machine load average 46-73 on 4 cores during every run.

## Gates (the caller's six, then ROADMAP step 6 A1-A8)

| gate | what is measured | Pixel 7 | Galaxy S24 |
|---|---|---|---|
| G1 grammar round trip | each of the six GRAMMAR.md examples: `link.read(ex)` → `link.format(f)` (the module's pure serialiser) → `link.read` → `link.format`; the field objects and the two serialisations byte-identical, nothing refused | PASS (6/6) | PASS (6/6) |
| G2 the pointer keeps the hash | (a) the REAL `editions/index.html` (not routed) forwards all six examples byte for byte to `202611012027/<hash>`; (b) the routed pointer lands on `202611012135/<hash>` byte for byte before the page has read it | PASS (6/6; 4/4) | PASS (6/6; 4/4) |
| G3 open an edition | FILE → `Open an edition ▸` → tap `Kuiper Edition 2 · 202611010114`: lands on `editions/202611010114/#<hash>`, the hash equal byte for byte to the one `Copy a link` copied; row 44 px | PASS | PASS |
| G4 open an app | FILE → `Open an app ▸`: first row See Through, lit; tap: lands on `see-through/#key=<the open key>`; row 44 px | PASS | PASS |
| G5 copy a link, clipboard denied | `writeText` rejects: `Copy a link to this view` shows the link (= `link.url()`) in a read-only field, focused, all selected, 44 px; the panel stays open | PASS | PASS |
| G6 zero console errors (strict) | every `console.error` and every `pageerror` | FAIL: pageerror 0; console exactly 1 × 404 `proof/edition-sha256.txt` (see below) | FAIL: the same, pageerror 0, the same single 404 |
| A1 the panel | under the bar (panel top 34 = bar bottom 34); 21 items in 6.1's order; four headings Open, Link, Evidence, Export; every row and sub-row ≥ 44 px (the inert `· this edition` row too); editions newest first + `editions/` last; See Through first and lit | PASS | PASS |
| A2 open a key | `36064705400` + GO: hash `#key=36064705400&line=0048802883266c68d5bdb6f5add0074e8b5b729d:5&layers=…`, card header = `keys.json bodies[0].line_text`, zoom 14, the spark at the centre of the clear band (dy 0.0 px); `SPACE` refused `key <SPACE> is not on this wafer (SPACE <SPACE>)`, camera unchanged; `Copy python tools/key.py 36064705400` in the clipboard; refused clipboard → the command in a selected read-only 44 px field | PASS (4/4) | PASS (4/4) |
| A3 evidence | every present file 200 with `content-length` = the row's byte count, an `<a download>`; a missing file says `missing · HTTP 404` | PASS; 1 file absent → 2 NOT EVALUATED | PASS; the same 2 NOT EVALUATED |
| A4 the six examples | direct (hashchange on an open page) and through the pointer; `edition=` and `app=` assert the URL (path checked, not the hash text) | PASS (8/8) | PASS (8/8) |
| A5 the round trip | `e` and two random placed lines: Copy a link → open it fresh through the pointer → the same body, the same header | PASS (3/3: e, edPlaced[43], edPlaced[307]) | PASS (3/3: e, edPlaced[263], edPlaced[198]) |
| A6 save an image | PNG, more than one colour, `innerWidth × min(dpr, 2)` wide, the foot strip within 5 % of a redraw of the same lines, licence and stamp in the foot; a cleared `#c` → `the image came back blank; try again after the wafer has drawn`, no file | PASS (824 × 1806 = 412 × 2 wide, 111,433 B) | PASS (720 × 1688 = 360 × 2 wide, 98,049 B) |
| A7 edit | a pasted Kuiper link → that line; Backspace → no key/line/repo/period, `layers` kept; a pasted See Through link → `see-through/…#sub=Drax` | PASS (3/3) | PASS (3/3) |
| A8 history | back with a panel open closes the panel and stays; three module link writes add no history entry (length 9 → 9 on Pixel 7, 8 → 8 on S24) | PASS (2/2) | PASS (2/2) |

Runs of record, both on module 3ae05df7 and the scratch site on port 8462: Pixel 7 `run-p7f` 02:15:58-02:38:20 UTC
(test.cjs 69f636fa; the final 4afaa6d6 only adds the A4-direct settle wait, a gate Pixel 7 already passed), Galaxy S24
`run-s24t` 02:39:27-03:17:45 UTC (test.cjs 4afaa6d6, this file's bytes). Each: 34 PASS, 2 NOT EVALUATED, 1 FAIL (G6
strict, the one 404 below), 0 pageerror. The lead's Galaxy S24 `run-s24` (00:59-01:35, port 8464, same module, the
test.cjs of 00:59) read the same: 33 PASS, 2 NOT EVALUATED, G6 on two 404s. Reports: `report-pixel7.json`,
`report-galaxy-s24.json`. One S24 screenshot (03, after the paste) timed out at 180 s under load; kept apart from
pageerrors (`shot_errors`).

## The console 404s (G6), named

The module HEADs the seven EVIDENCE files when FILE first opens (6.1, "each with its byte count so a missing file is a
test FAIL, not a silent 404"). Chromium logs one console error per 404. On the Pixel 7 run of record the only console
error is `proof/edition-sha256.txt` 404: team 10 removed it at ~00:59 to rebuild it (it was present at 00:21 and A3's
sha256 check PASSED then, run-p7d). `LICENCES.md` (Opus 9) and `proof/android-journey.json` (team 10) appeared during the
runs and now return 200 with matching byte counts. No other console error and no pageerror on either device. The
strict gate stays FAIL until that file exists; it is the integrator's file, not a module error, and the module says it
in its row (`missing · HTTP 404`). Re-run G6 (and A3's sha256 check) on the assembled edition.

## What failed on the way, and what changed (module or test)

| when | run | measured | cause | fixed in |
|---|---|---|---|---|
| 23:28 | p7 (f0a44c74) | A1: inert edition row ~29 px | module | lead: a disabled 44 px button |
| 23:28 | p7 | A4 direct: a typed `#repo=…` overwritten | module: popstate precedes hashchange on a fragment navigation, read as our own traversal | lead: a traversal is ours only if it lands on a hash this page wrote or read |
| 23:28 | p7 | `ReferenceError: edSel is not defined` × 2 | page, not module: the base's ANDROID BACK / Escape still name `edSel` after Opus 3's deletion | REQUESTS 1(d) to Opus 3 + 10; scratch shim |
| 23:28 | p7 | A4 `edition=`/`app=` read before navigation; A4 layers expected `[lines]`; A6 licence looked for on line 1 | test | test: path predicates; asked layers on + mirrored `repos` allowed (layers.js:539); licence on any foot line |
| 23:37 | p7b | loader refused `layers` (`missing hook refuse`) and so `file` | scratch page older than Opus 4 rev 3 | site rebuilt |
| 00:17 | p7c | A6 download wait 120 s ran out; a screenshot 180 s | load average 73 | test: every block in its own try, 300 s, screenshot timeouts kept apart from pageerrors |
| 00:49 | p7d (013d6dda) | G4: the See Through tap stayed on the page | module: a hash write pending during the navigation | lead: `leave(url)` (write once, stop writes, `location.assign`) |
| 02:11 | p7e (3ae05df7) | G3: still on the page after 60 s | slow unload (probe: the navigation request was sent at once, no History call after it, commit after ~20 s) | test: in-page navigation waits 240 s; no module change |
| 02:38 | lead s24b (withdrawn 4568e3e5) | A4 direct: zoom 0.00055 8 s after the hash, card and hash right | load: the fly not finished | test: A4 direct waits up to 90 s for the light and the fly |

## Disclosures

- "Through the pointer" for A4/A5/G2(b) means `editions/` served with the pointer's own two lines and this edition's
  stamp (`page.route`): the real pointer still forwards to the published Edition 4 (`202611012027`). G2(a) runs the real,
  unrouted pointer and proves its forwarding byte for byte.
- Pages that are not this edition (Edition 2 `202611010114`, Edition 1, the published `202611012027`, See Through) are
  answered with a one-line page through `ctx.route`: the gates assert the URL the Kuiper sends the person to, not
  another page's console.
- Clipboard: granted (`clipboard-read/write`) except on the denial page, where `Clipboard.prototype.writeText` is made
  to reject; the fallback is measured, never assumed.
- G1 runs the module's own `link.read` and `link.format` (pure `hashText`, added at the tester's REQUEST). `edition`,
  `app`, `sub` are navigation fields that this page never writes (6.3), so their serialisation is the navigation itself:
  A4 and G2 assert those URLs byte for byte (`editions/202611010114/#key=36064705400`, `see-through/#sub=Drax`). The
  example `#layers=lines,see-through&key=63035688574` serialises canonically as `key=63035688574&layers=lines,see-through`
  (the table's order); parse of both is the same field object.
- `see-through` is a record of `layers.json`; with its module not admitted the layer is on and `EMPTY`; REPOS is mirrored
  on when the key's repository is lit (Opus 3's rule). The A4 layers gate allows exactly that extra.
- Not run here: Pixel 7 landscape and 1280 × 800 of the roadmap's `proof/accept-file.cjs` (the caller asked for Pixel 7
  and Galaxy S24); `node --check` PASS for the module and test.cjs; `ci_check` belongs to the integrator.

## Screenshots (`img/`, 4 PNG, each < 70 KB)

- `01-pixel7-file-panel.png`: FILE open on Pixel 7, OPEN with the editions list (this edition inert) and See Through lit.
- `02-pixel7-open-key.png`: `Open a key` 36064705400: the spark in the clear space, the card's first line is the line.
- `03-s24-open-key.png`: Galaxy S24 (360 px), the same key: the card's first line is the line, the spark above it.
- `04-s24-copy-fallback.png`: Galaxy S24, the clipboard denied: the link and the command each in a selected read-only field.
All four from the runs of record (run-p7f, run-s24t).

## Verdict

Every gate that measures the module PASSES on Pixel 7 and Galaxy S24, real touch, 0 pageerrors: open a key, open an
edition, open an app, copy a link (and the key command) with the read-only selected fallback when the clipboard is
denied, all six grammar examples parse → serialise → parse byte-identical, the hash survives the real pointer's
forwarding and the routed pointer byte for byte, every row 44 px, A1-A8.

The strict zero-console-errors gate does NOT pass yet: one console 404, `proof/edition-sha256.txt`, which team 10 is
rebuilding. The tester therefore does not sign "zero console errors". The module's part of G6 is clean (no other
console error, no pageerror on either device); the hand-off is acceptable for admission on that disclosed condition,
and G6 plus A3's sha256 check must be re-run, by this test.cjs, on the assembled edition once that file exists. If the
lead or the integrator reads the caller's rule strictly, the hand-off waits for that file and one re-run.
