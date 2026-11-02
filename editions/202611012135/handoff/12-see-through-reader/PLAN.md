# Opus team 12 "See Through hash reader": plan (lead, 2026-11-02 00:12 UTC)

Scope (owner, tonight): a new dated See Through folder `see-through/202611020012/` (a copy of `202610050609/`, which
stays untouched) that reads the Kuiper's deep links, plus the pointer `see-through/index.html` (three places, forwards
`search + hash`) and one new row in `see-through/README.md`. Nothing else in the repository is touched.

Grammar: FIXES/NL-010/team-3/STEPS.md step 5.5 (the table) and ROADMAP.md step 5.5/5.8; base: Opus team 5's
`handoff/05-see-through/see-through-hash-reader.patch` (applied cleanly with `patch -p1`, then improved below).

| part | who | state |
|---|---|---|
| copy `202610050609/` to `202611020012/`, apply team 5's patch | lead | done 00:12 |
| improvements: identity wins over search when `#key` and `#sub` both name a substation; `#repo` name match exact then `includes` (engine's rule); team 3's refusal words for `#repo`; the sky read before the link (wafer-meta `address_space` adopted at run time, frozen constant otherwise) | builder (lead if absent by 00:32) | |
| pointer `see-through/index.html` :7 :11 :12 to the stamp, forwarding `location.search + location.hash`; README row | lead | |
| Playwright Pixel 7 test of every hash form from the repository root (`python3 -m http.server 8601`), screenshots ≤ 4 PNG < 300 KB | tester (lead if absent by 00:32) | |
| EVIDENCE.md keys (descent.js, grid.js, kuiper-law.js lines), ci_check PASS, forbidden-token check (OPUS-BRIEF rule) | evidence officer (lead if absent by 00:32) | |
| HANDOFF.md and the one HANDOFF comment on issue #10 | lead | |

Scratch: /tmp/nl010-opus/team-12/<role>/. Server: port 8601 from /home/user/estate/kuiper-belt.

## 01:36 UTC lead: changes after the tester's run 2 and the evidence officer's section 10

descent.js is now sha256 05defb3db0419380f518efb0f46f5dbb4d212551f06b72c4cb2ba9a6d423767a (was 3f5e877f…8b38):
- R1 fixed: `readLink()` clears the note, and the box while nothing is chosen, before every re-read.
- F1 fixed: every key on this sky draws the amber ring at `KuiperLaw.place(key)`, the star of a substation included.
- Evidence 10.1 partly: `KEY <k> IS BEYOND THIS SKY (SPACE <SPACE>)`, as STEPS 5.5 writes it. `LINK FIELD <NAME>` stays upper case
  (both tests assert `LINK FIELD BOGUS NOT UNDERSTOOD`), and `<k>` keeps its commas (A3 writes `KEY 36,064,705,400`).
- Evidence 10.2 fixed: a non-integer `space` is named (`LINK FIELD SPACE NOT UNDERSTOOD · …`), then ignored.
- Evidence 10.4 fixed: the remap covers all 20,000 DRAW THE GRID keys (j < 20,000). A star of a substation fills the box,
  and any other star gets the ring under the new sky.
- Not changed: `#repo` stays amber (F2; the tester measured that it reads better against the cyan field). This is a stated
  departure from "the instrument's cyan".
Tester: please re-run test.cjs against these bytes (the lead's check is /tmp/nl010-opus/team-12/tester/fix-check.cjs: 8/8 PASS).
