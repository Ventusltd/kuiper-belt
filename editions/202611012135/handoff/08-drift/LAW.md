# The drift law, in LAWS.md form (Opus team 8, step 8)

Proposed for kuiper-belt `LAWS.md` after L11 (team 2's card law, handoff/02-card/LAWS-L11.patch); the number is the
integrator's to give. Keys are `repo@sha path:line`; `kb` is kuiper-belt, `018b46a` its main.

## L12. Drift: a line of an edition is only as true as its head says

An edition keys every verified line to a commit: `keys.json` holds the repository, the commit, the path, the line and
the line's own text (`line_text`, written by kb@018b46a tools/edition_keys.py:250 as
`body.split(b'\n')[line - 1].decode('utf-8', 'replace').rstrip('\r')`). The estate moves on. The drift asks, of each
line, one question with one answer read from git objects alone: does the head of the repository still hold that text?

The head of a repository is the sha its clone holds for `refs/remotes/origin/HEAD` (the host's default branch as the
clone last fetched it), recorded with the moment it was observed and that moment's offset (kb@018b46a README.md:39):
the clone's `FETCH_HEAD` time when `FETCH_HEAD` names the sha, else the time in the ref's reflog. A branch someone has
checked out is not the head. Every head is recorded before any line is classified.

For each body, with `T` its `line_text` and `F` the blob at `git show <head>:<path>` split on `\n`, each line decoded
by the same rule:

| class | when | carries |
|---|---|---|
| `SAME` | `F[line] = T` | |
| `MOVED` | `F[line] ≠ T` and `F[j] = T` for some `j` | `head_line` = the first such `j`, `delta = head_line − line`, `occurrences`, `head_lines_before` (the lines before `path` in `git ls-tree -r <head>`, kb@018b46a tools/edition_keys.py:137) |
| `GONE` | the head has a blob at `path` and no line of it equals `T` | |
| `FILE_GONE` | the head has no blob at `path` | the reason |
| `UNVERIFIED` | nothing is claimed: no clone, no head, a recorded head the clone does not hold, a head with no observation time, an empty `T`, a key not on the wafer, a repository not in `cosmos/repos.tsv` | the reason |

The share is `SAME / (rows − UNVERIFIED)`, printed with its denominator. The new key of a `MOVED` line is the wafer's
own key law at the head, `k0(head) + head_lines_before + head_line − 1` (kb@018b46a tools/edition_keys.py:12), when the
head commit is on the wafer and the key falls inside that commit's range; otherwise the line keeps the edition's key and
says why. Equality is of whole lines, byte for byte after the decoding rule: no trimming, no quote fallback, no
nearest match.

Three refusals bind it. A repository without a clone or without a head makes every one of its rows `UNVERIFIED`, never
`SAME`; stability is never inferred from the absence of a fetch (kb@018b46a README.md:40 "A check that examines
nothing refuses. It does not pass"; tools/key.py:49 "Never trusted blind"). A run given no heads writes nothing and
exits non-zero. A head observed more than the cap before the cut refuses the whole run and writes nothing; the cap is
the README's, and until the README states one it is the fortnight the wafer already declares (kb@018b46a
tools/wafer_keys.py:34 `CAP_SECONDS = 14 * 86400`, there the cap on a silence; borrowed, DISCLOSED).

The inputs are `cosmos/repos.tsv`, the edition's `keys.json` and the git objects of the clones, and nothing else:
`drift.json` names no repository outside `repos.tsv` and no key outside `keys.json`, and it quotes no line text. Two
runs against the same recorded heads write the same bytes (`tools/drift.py --heads data/drift.json`).

**Falsified by:** a `SAME` row whose `git show <head>:<path>` differs at `line`; a `MOVED` row whose `head_line` does
not hold `T`, or is not its first occurrence, or whose `line` still holds it; a `GONE` row for which
`git grep -F -x -f <T> <head> -- <path>` finds a line; a `FILE_GONE` row whose path `git cat-file -e` finds; a row of a
repository without a clone or head that is not `UNVERIFIED`; two runs against the same recorded heads that differ by
one byte; a repository in `drift.json` not in `cosmos/repos.tsv`, or a key not in `keys.json`. `tools/drift.py
--check` evaluates every one of these (P1, P2, P3, P5) and prints `RESULT: PASS` or names the row.
