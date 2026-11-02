# The release law of Kuiper editions

From Edition 5 (`202611012135`) onwards every Kuiper edition ships by this law and by no other path. Written by Opus
team 9 (NL-010 roadmap step 9) from FIXES/NL-010/ROADMAP.md step 9 and FIXES/NL-010/team-5/STEPS.md 9.1-9.8 in
Ventusltd/neural-link-between-agents, without softening a word. Text CC BY 4.0, as the repository (README.md:156-157);
the tool it names, `tools/edition_check.py`, is Apache-2.0 code. Keys are `repo@sha path:line`; a short sha means that
head: gridatlas `5ec7f62`, kuiper-belt `018b46a`, neural-link `591b57c`. This file lands in the release PR (PR B, 9.6),
so the owner merges it.

In one paragraph: a new dated folder; a pointer that moves in three places and nowhere else; `ci_check` and
`edition_check` green; the Android journey green; every module hashed in a manifest; the owner's `ACCEPT <stamp>` on
a served preview before the pointer moves; the owner merging the pointer; and rollback that is the pointer moving
back, byte-exact, with no folder ever deleted. Every licence of everything the edition brings in is verified from the
files and written in one register in the edition folder.

The lesson it copies: a release is a pointer move and nothing else (gridatlas@5ec7f62 docs/RELEASE.md:3-7, :139-151);
the tested preview is the release (:119-121); the owner accepts in writing, first line, and agents never record
acceptance (:40, :49-53); only the owner merges a release, every PR a draft, rebase never squash (:41, :54-55);
cartridges are hashed in the manifest and refused on mismatch (atlas/current.json:5, :14-21, :31; tools/ci/pr-gate.mjs:176;
docs/RELEASE.md:117); a module installs nothing until its hooks exist (atlas/modules/202609031958-menu-bar.js:8-17);
rollback is a revert of the pointer commit, byte-exact, refused if the pointer has moved since (docs/RELEASE.md:264,
:283-306). The gap it closes: a harness merged release PRs on chat authorisation against "only the owner merges"
(neural-link@591b57c SESSIONS/202611012145-kuiper-edition-harness-notes.md:19-20).

## 9.1 The folder rule

Every change is a new dated folder `editions/YYYYMMDDHHMM/`, the UTC cut stamp. Earlier folders are never edited and
never deleted. The version number is the order of publication; the stamp is the key; the newest edition is found from
the pointer, not by sorting folder names (harness notes :39-41; kuiper-belt@018b46a editions/README.md:3-4, :9-10).

Each folder holds at least: `index.html`, `keys.json`, `modules.json`, `modules/`, `README.md` (with "What changed
from Edition N"), `NOTICE.md`, `LICENCES.md` (the register, 9.8), `proof/edition-sha256.txt` (the sha256 of every file
of the folder but itself, notes :44-46), `proof/keys-summary.json`, `proof/render-*.png`, and from Edition 5
`proof/android-journey.json` (9.4) and `proof/ci_check.log` (9.3).

Checked by: E3 (every listed file matches, every file is listed; an earlier folder whose list no longer matches is a
FAIL, which is how "never edited" is enforced).

## 9.2 The pointer, in three places

`editions/index.html` names the stamp in exactly three places: the meta refresh (kuiper-belt@018b46a
editions/index.html:7), the link (:11) and `location.replace` (:12), each as `<stamp>/`, never `/belt/` (notes :41;
editions/202611012027/README.md:25-26). From Edition 5 the `location.replace` forwards `location.search +
location.hash`, as GridAtlas's root does (gridatlas@5ec7f62 index.html:2), because today it forwards only the hash and
`editions/?layers=...` opens with no layers (team-2/STEPS.md 3.6). The change is prepared as
`editions/202611012135/handoff/09-law/pointer.patch` and lands in the release PR with the stamp move; the same
forwarding is asked of `see-through/index.html:12` when step 5 cuts its folder. The release PR also adds the
edition's entry to `editions/README.md`, updates its "current edition" sentence, and adds the entry to the Editions
section of the root `README.md` (notes :42-43).

Checked by: E4 (three places, one stamp, no `/belt/`, the folder named holds `proof/edition-sha256.txt`; and once the
pointer names an Edition 5 or later folder, a `location.replace` that does not forward both `location.search` and
`location.hash` is a FAIL).

## 9.3 `ci_check` PASS and `edition_check` PASS

Before any push, `python3 tools/ci_check.py` prints `RESULT: PASS` (notes :48; kuiper-belt@018b46a tools/ci_check.py:97).
Its K3 parses root pages only (tools/ci_check.py:68), so edition pages and modules are not parsed by it; K1-K4 stay
unchanged so their numbers stay comparable run to run. `python3 tools/edition_check.py` adds, for every edition folder
that holds a `modules.json` (or the folders named on its command line):

| check | what fails it |
|---|---|
| E1 | a `<script>` block of any `editions/*/index.html`, or any `modules/*.js`, that fails `node --check` |
| E2 | a `modules.json` record whose file is missing or whose sha256 or bytes differ (`<id> refused: sha256 mismatch`); an `order` id without a record; a file in `modules/` in no record that no hand-off names (a stray file). A file a hand-off names but the manifest does not is pending admission: NOT EVALUATED |
| E3 | a listed file missing or changed, or a file not listed, in the `proof/edition-sha256.txt` of ANY edition folder |
| E4 | 9.2 broken |
| E5 | `keys.json` differing from the previous edition's (the pointer's stamp; Edition 4's is `1c293c33...`, editions/202611012027/proof/edition-sha256.txt:4) while the README names no change to the findings |
| E6 | a record whose generation, file-name stamp and header line disagree (`refused: stamp mismatch`), an empty licence, a `requires` name that is neither on the hook table nor provided earlier in `order` (`refused: missing hook <name>`), a loader reference whose hash or hook-table block differs from the page (Opus team 4, step 4) |
| E7 | a `reads`/`writes` entry with no literal in its file, or a `fetch(` outside `reads` (Opus team 4) |
| E8 | an admitted module that fails `node --check` or holds `KY.register(` other than exactly once (Opus team 4) |
| E9 | `data/drift.json` that `tools/drift.py --heads data/drift.json` does not re-compute byte for byte (step 8); NOT EVALUATED where the estate's clones are absent (GitHub's runner) |

A check that cannot be evaluated prints NOT EVALUATED with its reason (LAWS.md:156) and is listed at the end; it is
neither a pass nor a fail, except under `--strict`, the release gate, where it is a FAIL. Each check has a negative
test that makes it FAIL (`editions/202611012135/handoff/09-law/test_edition_check.py`, synthetic, and
`test_real_folder.py`, on a copy of this repository).

On GitHub, `.github/workflows/check.yml` runs `tools/ci_check.py` and then `tools/edition_check.py` on every push; a
FAIL fails the run. On the measuring machine, the integrator runs, in this order:

1. `{ python3 tools/ci_check.py; python3 tools/edition_check.py editions/<stamp> --strict --pre-cut; } >
   editions/<stamp>/proof/ci_check.log` (`--pre-cut` allows only E3 to be NOT EVALUATED, and only because the sha256
   list that will hash this log is not cut yet);
2. cut `proof/edition-sha256.txt` (every file of the folder but itself, `handoff/` included);
3. `python3 tools/edition_check.py editions/<stamp> --strict`, which must print `RESULT: PASS` with nothing NOT
   EVALUATED; its output is quoted in PR A's body.

## 9.4 The Android journey gate

The preview is not ready for the owner until the journey passes: `node android-journey.cjs
http://127.0.0.1:<port>/editions/<stamp>/ <outdir> --all --law --proof editions/<stamp>/proof/android-journey.json`
(the script is `editions/202611012135/handoff/09-law/android-journey.cjs`: FIXES/NL-009/android-journey.cjs as adapted
by Opus team 10 for Edition 5's shell, with the law layer added), on Playwright `devices['Pixel 7']` with `hasTouch`,
`isMobile` and `deviceScaleFactor`, real touch only, SwiftShader flags, served from the repository root, one device at
a time (NL-009 BRIEF.md:11-20; notes :53-58); run one device per process, the reports are combined by `node
android-journey.cjs --merge editions/<stamp>/proof/android-journey.json <report.json>...`. Each step is measured and written to `proof/android-journey.json` with
its rectangle, timing or hit-test result:

(a) load `editions/<stamp>/` with zero console errors; (b) the bar is one row at 360 px and 393 px and the Ventus lockup
is at the top; (c) each menu title opens, the same tap closes it, a tap on the wafer closes it, the back gesture closes
it; (d) SEE THROUGH opens `../../see-through/` on the same host; (e) LINES, pick a row: the panel closes, the card
appears with the line of code as its header, the spark is in clear space between bar and card; (f) NEXT VERIFIED LINE
three times: the same holds each time; (g) a pinch on the wafer zooms the wafer, not the page; a drag pans, not
scrolls; (h) a 4 px spark is hit, or the page says what it hit instead; (i) landscape and a font scale of 1.3: the bar
is still one row or wraps by design and says so; (j) every module of `modules.json` reports `admitted`, none
`refused`; and every NL-009 round-1 BLOCKER and MAJOR as a step: (k) the bar is one row at 360, 393, 412 and 430 px,
not the 75.1 px two rows of Edition 4 (01-bar.md:13, BLOCKER); (l) every bar title is at least 44 px tall, not 29.0 px
(01-bar.md:18, MAJOR); (m) SEE THROUGH fits on that row and "see through" is named on the page (01-bar.md:20,
06-seethrough.md:24-32, MAJOR; 06-seethrough.md:11, BLOCKER); (n) after a pick with READOUT open, READOUT is not
under the bar (09-robust.md:11, MAJOR); (o) with `--disable-webgl --disable-webgl2` the page shows a sentence, not a
blank black screen (09-robust.md:18, MAJOR).

The MINOR findings (01-bar.md:27-33 sticky hover, safe-area insets, dvh; 06-seethrough.md:33 landscape scroll;
09-robust.md:23-36 noscript, keys.json 404 said in the open, Escape closes the card, reduced motion, ARIA) are journey
steps marked MINOR: measured and reported; a MINOR FAIL does not block ACCEPT but is listed in PR A's body. The gate is
PASS only when every non-MINOR step is PASS; a non-MINOR step not measured makes the gate `NOT EVALUATED`, never PASS. A
step that cannot be run is `NOT EVALUATED` with its reason (LAWS.md:156),
and the preview goes to the owner only with the `NOT EVALUATED` list in PR A's body. The journey runs again against
the pointer `editions/` after PR B lands on the same stamp (`location.replace` resolves to `<stamp>/`, step (a)).

## 9.5 The module manifest and its hashes

`modules.json` is the edition's `current.json` (gridatlas@5ec7f62 atlas/current.json:14-21, :31): `{"schema":
"kuiper.modules.v1", "edition": "<stamp>", "order": [...], "modules": [{"id", "generation", "path", "sha256", "bytes",
"requires", "provides", "reads", "writes", "licence", "team", ...}], "references": [...]}` (the schema is
`editions/202611012135/handoff/04-loader/modules.schema.json`, Opus team 4). The loader in `index.html` fetches each
module in `order`, computes its sha256 in the browser, refuses it when the digest differs or when a name in `requires`
is not on the hook table, and prints the refusal in the readout: `<id> refused: sha256 mismatch` or `<id> refused:
missing hook <name>`, never a silent skip (menu-bar.js:15-17). The edition stays usable without any refused module
(menu-bar.js:16). `order` is the integration order in which the modules were proven (ROADMAP "Integration order").
Checked by: E2, E6, E7, E8, and the journey's step (j).

## 9.6 The owner's ACCEPT on the preview; who merges

Two PRs per edition, both drafts, both from the branch `edition/<stamp>`:

- **PR A, the preview**, adds `editions/<stamp>/` and nothing else: no pointer, no README entries, no root file. Gate:
  9.3 and 9.4 PASS, `proof/` complete, the PR body carrying the journey table and the `NOT EVALUATED` list. Pages
  serves main only, so PR A is merged for the folder to be served at `editions/<stamp>/`. The owner tests the served
  folder on the phone and posts `ACCEPT <stamp>` as the first line of a comment on PR A, or `REJECT <stamp>`, which
  withdraws it (the shape of gridatlas@5ec7f62 docs/RELEASE.md:40). **Agents never post ACCEPT** (notes :64;
  RELEASE.md:49-53; neural-link@591b57c AGENTS.md:18).
- **PR B, the release**, changes only `editions/index.html` (three places, 9.2), `editions/README.md`, the root
  `README.md` Editions section, and `editions/LAW.md` the first time (with it, `.github/workflows/check.yml`'s one
  `run:` line). Gate: `ACCEPT <stamp>` on PR A, by the owner, after the folder's cut time; 9.3 PASS on the PR head;
  the pointer names the folder the owner tested, byte for byte the one in main (RELEASE.md:119-121). **Only the owner
  merges PR B**, with rebase (RELEASE.md:41, :54-55; neural-link@591b57c AGENTS.md:11, :18).

**Who merges PR A is open: ROADMAP question Q6, pending the owner's answer.** As drafted, the integrator may merge PR A
because it changes nothing the stable link shows (the pointer is untouched) and the owner alone merges PR B; or the
owner merges both, as GridAtlas's law reads for the release. Until the owner answers Q6, no agent treats either reading
as settled. Edition 5's preview folder is already on kuiper-belt main at `e92ad5d` ("Publish Kuiper Edition 5 preview
folder (202611012135); pointer stays on Edition 4"), with the pointer unchanged, so the owner can test it in small
published steps; every later change to that folder before PR B is a further additive commit, and E3 is cut last.

This tightens the Edition 2-4 procedure, where the harness merged and pushed main itself (notes :48-49): that is the
NL-008 gap (notes :19-20).

## 9.7 Rollback by the pointer

A rollback is `git revert` of PR B's pointer commit on a branch `rollback/<stamp>-to-<previous>`, refused unless the
pointer has not moved since (RELEASE.md:291-296), proven by `editions/index.html` being byte-identical to the
commit's parent (`git diff --exit-code <parent> -- editions/index.html`; RELEASE.md:300-302), with 9.3 re-run, and
published as a draft PR that only the owner merges. No folder is deleted or edited: the rolled-back edition stays
served at its own stamp, and its `editions/README.md` entry gains one line "rolled back on <date>, <reason>" in a
later PR. A rollback to an older edition after the pointer has moved since is a new release of the earlier stamp
through PR B, with the owner's `ACCEPT` of that stamp quoted.

## 9.8 The licence register

Each edition folder carries `LICENCES.md`: everything the edition brings in, the licence as the files state it, the
key, and whether it is copied or linked, verified from the files at the heads named in it. SPDX where the file names
one; "none in repository" where no LICENSE, NOTICE or licence sentence exists (`git ls-tree` and `git grep -i licen`
at the head). Rule of the register: a row with `DISCLOSED` or `NOT EVALUATED` blocks copying, not linking (L8,
kuiper-belt@018b46a LAWS.md:111-124). Linking to See Through brings in no licence duty; copying `kuiper-law.js` or
`descent.js` into a module makes that module CERN-OHL-S v2, and it cannot be relicensed Apache-2.0: See Through code
stays in its own module so the reciprocity stops at that file. Each team's `handoff/NN-*/LICENCE.txt` is its row; the
register names each one by its sha256.

Gaps the owner must close before the steps that need them ship, never filled in by an agent: elements has no licence
file (Q1); the spider's graph data has no stated terms (Q5); galaxies-wafers has no licence file (Q2).
