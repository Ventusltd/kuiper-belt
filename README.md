# Kuiper-belt

**This is the framework file. Read it before you act. The first 3,000 characters are the law: a
captain that reads no further still has everything it needs to work correctly.**

Kuiper-belt draws the entire Ventus Ltd / GLOBALGRID2050 GitHub estate as a belt of orbiting bodies
on the CPU Wafer Galaxy, loaded through the Spider. It is a navigation instrument, not a picture.
Its destination is the sandboxes: **a body you cannot open is a body that has failed.**

Why it exists, and who built it: [ABOUT.md](ABOUT.md). That file is history, not input. Do not
reason from it, do not score against it, do not quote it as a fact about the estate. Study its
method if you like, never its content: it is a worked example of the first law below, applied to a
biography, and four errors came out of it the first time the law was applied. [EVIDENCE.md](EVIDENCE.md)
holds the numbers it rests on.

## What the instrument is for

Large systems are built in the head, and the head has a limit. Past that limit the system does not
get finished, it collapses under the weight of its own ambition, and the work is lost even though
every piece of it was sound. Scrolling a list of 63 repositories does not raise that limit. It
lowers it, because a list has no shape and the mind must hold the shape itself.

A belt has a shape. Distance, cadence and resonance are held by the picture rather than by the
person, so the work can be *seen* instead of remembered: what is locked to the main body, what has
been flung out, what is frozen, what is drifting away, and what can actually be opened, which is
the only question that finishes anything. This is a working mode, not a diagram. It exists so that a
system too large to hold can still be navigated, one body at a time, to something that runs.

## The first law: no claim without a key

Every body's position is derived from a cryptographic key: a commit SHA, a tree SHA, or the
SHA-256 of a file's bytes. Nothing is placed by narrative, by memory, or by a model's judgement.

- A statement **with** a key is a fact: anyone can recompute it on any machine and must get the
  same answer. If they get a different answer, the run is wrong, not the key.
- A statement **without** a key is a candidate. Write it as a candidate or do not write it.
- A model's text, including yours, including this repository's, is a candidate until a key
  confirms it.
- Every time carries its offset: `2026-09-18T05:33:14+01:00`, never a bare clock.
- A check that examines nothing refuses. It does not pass.

This law is here because it has already caught two errors in one day. A commit read as `04:33` was
`05:33+01:00`, settled only by the commit object. And a frozen file whose bytes hashed to
`e82fd469c85a22585bccb6df04581ae20e92e3498cc4570b995b975ecade9dd3`, where the gate expected
`bc9aff1e7c1e1fd38da5b84d15c4edf4fd1ae4b4e6a78d744402158bbd727206`, failed three validations at
`2026-09-18T03:03Z`, while the night's own notes recorded "Nothing red." The prose was written
from what its author watched. The gate was written from a digest. Only one of them was checkable,
and only one of them was right.

## The six orbital elements

Every body carries six numbers. Each is computed, each is reproducible, none is an opinion.

| element | meaning | computed from |
|---|---|---|
| semi-major axis `a` | distance from the shepherd | reference distance to the shepherd in the federation graph |
| eccentricity `e` | how erratic the work is | variance of the interval between commits, normalised by the median |
| inclination `i` | divergence from the main line | 1 − (shared references ÷ total references) |
| mass `m` | how much there is | bytes, or counted lines where the body is a file |
| resonance `p:q` | locked to the shepherd's rhythm | nearest integer ratio of commit cadence to the shepherd's, kept only within tolerance |
| epoch `t` | where it was at time *t* | commit timestamps, offset always carried |

The shepherd is the body with the highest commit volume and inbound reference count. It is
computed, not declared. If another repository overtakes it, the shepherd changes and every orbit is
recomputed. At the time of seeding this is `globalgrid2050`, and that is a claim to re-check, not a
constant to trust.

## The classes

The Kuiper belt is not rubble. It is a classified population, and every class is defined by its
relationship to Neptune. So is this one.

| class | astronomy | estate meaning | criterion |
|---|---|---|---|
| shepherd | Neptune | the body the rest orbit | highest commit volume + inbound references |
| resonant | plutinos, 3:2 | locked to the shepherd's cadence | `p:q` within tolerance, an hourly publisher sits in **1:1** |
| classical, cold | low `e`, low `i`, primordial | frozen data, pinned and untouched | `e ≈ 0`, no commit in 14 days |
| classical, hot | same distance, stirred | actively worked at the same depth | commits in the last 7 days |
| scattered disc | flung out, eccentric, returning | experiments thrown out and coming back | max commit gap ÷ median gap above threshold |
| detached | never comes near Neptune | orbits that no longer touch the main body | zero shared references and no commit in 60 days |

A class is a measurement, never a label someone typed. Recompute it; do not remember it.

## The seventh law: every body must be openable

Astronomy has no need of this one. We do. The brief is *navigate to clarity*: reach the open
source sandboxes that serve community energy, governments and corporations. So:

- A body with a destination, whether a runnable page, a sandbox, a document or a dataset carrying
  a licence, is drawn lit, and its destination is recorded with the body.
- A body with no destination is drawn dim, and **counted**.
- The count of dim bodies is the belt's own score. It is published with every run. The instrument
  measures its own uselessness, and that number is the one to drive down.

## What a body is

Bodies exist at three depths. Do not mix depths in one belt without saying so.

1. **Repository.** The repositories of the organisation, plus the local clones. This depth is
   gravel, not a belt. It is for proving the laws, not for flying through.
2. **File.** Every tracked file in every repository. This is the depth at which a belt appears:
   the same order of magnitude as the lines already flying as dust on the wafer.
3. **Commit.** Every commit as a body, epoch as the axis. This is the depth at which *space-time*
   is simulated and the slider becomes a scope over time rather than a scroll.

Build depth 1 first. Do not claim a belt at depth 1.

## The contract with the wafer

Kuiper-belt produces nothing new to render. It produces what the translator already eats:

```json
{ "stations": [ { "id": "<key>", "x": 0.0, "y": 0.0, "m": 0, "class": "resonant", "open": true } ],
  "edges":    [ { "from": "<key>", "to": "<key>", "w": 0.0 } ] }
```

- `x`, `y` in the unit square. `id` **is** a key: a SHA, never a name, never a position.
- Edges are drawn between keys, never between positions. This is the protocol and it does not bend.
- The placement rules are printed with every run, as the translator prints its own: the projection,
  the tolerance, the seed. A run whose rules are not printed is not a run.
- `draw estate` obeys `release` like every other command on the wafer. No exceptions.
- Generated data lands in `data/`. The digest of every run lands in `proof/`. A belt that cannot be
  reproduced from `proof/` did not happen.

## For captains

You are a local model. Your text is a candidate. Work as follows, every hour:

1. Read this file first, then the fact files of the run you are scoring. Do not read `ABOUT.md`.
2. Verify every number you repeat against the fact file that produced it. Report the score as
   *numbers verified N of M*. An unverifiable number is not repeated at all.
3. Name the file each number came from, in brackets, the way the run wrote it.
4. Say what disagrees with this framework. If nothing disagrees, say so in one line, do not
   manufacture a disagreement to fill the section.
5. Give exactly one next test or build, with the exact command to run it.
6. Do not copy sentences from the exemplar. Your copied-sentence score is published. On
   2026-09-18 it moved from 1 of 7 at `14:55Z` to 4 of 8 at `18:55Z`: that is drift, and it is the
   same disease as an unkeyed claim, in a smaller body.
7. Never write "as expected". Expectation is not evidence.

## Forbidden

- A body placed without a key.
- A claim in any file here, presented as a fact, without a key.
- A time without an offset.
- A class remembered rather than recomputed.
- A green report while a gate is red. Check the gates before you write the report.
- Publishing. Decisions are made by VIK-AI and Claude; publishing is Vikram's, after review.

## Provenance and licence

Every input carries its source and licence inside the file it produces, and the attribution travels
with the data, never only in a README. Git history is the proof of this repository's own work: the
commit is the receipt.

This repository is public so the method can be checked, reused and argued with. Code is licensed
under Apache-2.0, see [LICENSE](LICENSE); documentation and generated data under CC BY 4.0. No
warranty is given, as Ubuntu gives none. Nothing here is a design; a drawing of a system is a chart, and an
engineering design carries a named engineer and indemnity.

## Acknowledgements

The placement law is built on other people's work:

- Leonardo of Pisa, known as Fibonacci, "Liber Abaci" (1202): the number sequence whose neighbouring ratios settle
  on the golden ratio.
- L. and A. Bravais (1837), Annales des Sciences Naturelles, Botanique 7: the golden angle in plant spirals.
- H. Vogel (1979), "A better way to construct the sunflower head", Mathematical Biosciences 44 (3-4), 179-189:
  radius by the square root of the number, one golden-angle turn per item.
- D. E. Knuth, "The Art of Computer Programming, Volume 3: Sorting and Searching" (1973), section 6.4: the
  multiplier 2654435769, which is 2^32 divided by the golden ratio, rounded down, known as Fibonacci hashing.

Any error in how their work is used here is ours.

## State

Seeded 2026-09-18. `tools/estate.py` is **not yet written**. See [SPEC.md](SPEC.md) for its
contract and [LAWS.md](LAWS.md) for the derivation of each element. There is nothing in `data/` or
`proof/` yet, and this file says so rather than implying otherwise.

<!-- DRIFT:START -->
### Host entanglement, 2026-09-18T22:24:08.578Z

**NOT EVALUATED.** no observation from gitlab

Run `20260918T222408Z`, digest `a56fbe0df58281ec5971e7890d7c5ff35ab00572d83c31fd766398a30a6a56f0`. LAWS.md L10.
<!-- DRIFT:END -->

## Public diary

- [5 October 2026: Learn the Kuiper and connected projects](diary/2026-10-05-learn-kuiper-project-links.md)
- [Public project links and source revisions](https://github.com/Ventusltd/kuiper-belt/blob/main/diary/2026-10-05-public-links.json)
