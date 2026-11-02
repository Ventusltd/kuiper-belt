# Opus team 8 — step 8, the drift of an edition from the live heads — PLAN

Lead: OPUS-8 lead (started 23:24 UTC by `date -u`). Module stamp `202611012325` (the UTC minute the skeleton was cut).
Governing: FIXES/NL-010/ROADMAP.md step 8; FIXES/NL-010/team-4/STEPS.md step 8 (:233-352); handoff/04-loader/HOOKS.md
(kuiper.hooks.v1); handoff/03-layers/PLAN.md and data/layers.json (kuiper.layers.v1 record format).
Ports: lead 8480, builder 8481, tester 8482, evidence 8483. Scratch: /tmp/nl010-opus/team-8/<role>/ (never in the repo).

## Files (and nothing else)
| file | owner | content |
|---|---|---|
| `tools/drift.py` (root tools/, new) | lead | deterministic classifier; inputs ONLY `cosmos/repos.tsv`, `editions/<stamp>/keys.json`, git objects of the clones under /home/user/estate/<repo>; writes `editions/<stamp>/data/drift.json`; `--check` = P1-P3, P5 |
| `editions/202611012135/data/drift.json` | tool | `kuiper.drift.v1` `{edition, cut_at, heads, rows[], summary}` |
| `editions/202611012135/modules/202611012325-drift.js` | lead + builder | single IIFE, `KY.register`, reads drift.json only |
| `handoff/08-drift/` | lead | PLAN.md, README.md (paragraph "Drift since the cut"), LAW.md (LAWS.md form), LAYER.json (the record for data/layers.json, team 3's format), MODULE.sha256, MODULE.json, test.cjs, img/, EVIDENCE.md, LICENCE.txt, REQUESTS.md |

## Classes (team-4/STEPS.md step 8)
`SAME` text at same path and line at the head; `MOVED` same text in the same file at another line (first occurrence
nearest? no: FIRST occurrence, delta = head_line - line); `GONE` file exists at head, text absent; `FILE_GONE` path absent
at head; `UNVERIFIED` no clone / no head, empty `line_text`, or `on_wafer: false` (reason recorded).
Text rule: `line_text` LF-normalised (count_lines.py:60-61), compared to the head file's lines split on `\n` with a
trailing `\r` stripped.

## Module sections
| section | owner | content |
|---|---|---|
| 1 load + refuse | lead | fetch `data/drift.json` no-store; refuse when missing / edition ≠ KY.edition; readout words |
| 2 readout | lead | five counts + share with denominator; `KY.refuse` slot `drift` on failure |
| 3 sparks | builder | `KY.draw.add`: amber filled spark at the MOVED row's NEW key (repo@head path:head_line placed by keyPlace when on the wafer, else the edition key), amber ring for GONE/FILE_GONE, grey-blue for UNVERIFIED; palette only (PALETTE.md:9-14) |
| 4 card lines | builder | on `#card` open: `at head <sha7>: SAME` / `MOVED to line N (+d)` / `GONE` / `FILE_GONE` / `UNVERIFIED (<why>)` |
| 5 layer record | lead | `KY.modules.layers.api.register({id:'drift', module:'drift', load})` when the record exists; otherwise own draw, says so |

## Builder / tester / evidence: slots free at 23:25. If not here by 23:45 the lead does the part.

## LEAD, date -u 00:05 (2026-11-02): all four parts done by the lead (no builder, tester or evidence officer appeared by 23:45)
- tools/drift.py written; `--check` RESULT: PASS 7 of 7 (P1, P2 x3, P3, P5); negative (one class changed) FAILs.
- data/drift.json: 309 SAME / 7 MOVED / 2 GONE / 0 FILE_GONE / 28 UNVERIFIED at origin/HEAD; team 4's 331/7/2/0/6
  reproduced exactly with their heads and their pipelinenews clone (EVIDENCE.md C).
- module sealed at sha256 18f7019a… (MODULE.sha256); test.cjs run 2 `--handoff` RESULT: PASS 32 of 32 pre-integration.
- HANDOFF posted on #10 by the lead; EVIDENCE.md reviewed by the lead in the evidence slot (disclosed there).
