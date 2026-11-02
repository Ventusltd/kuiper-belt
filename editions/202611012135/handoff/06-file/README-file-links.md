## File

(For the integrator, Opus 10: the README section "File", ROADMAP step 6 "Files touched". Text CC BY 4.0.)

FILE is the Kuiper's File menu of an operating system: what opens, what links, what leaves the building.
**Open** — `Open a key…` (digits; a key beyond the wafer is refused in words, `key <k> is not on this wafer (SPACE <n>)`;
its second row copies `python tools/key.py <k>` so the bytes can be had from a clone), `Open a line…` (a `blob:line` id
of `keys.json`), `Open an edition ▸` (every edition of `data/editions.json`, newest first, this one inert, the pointer
`editions/` last; the current hash travels), `Open an app ▸` (See Through first and lit; the find box's unmatched text
travels as `#sub=`). **Link** — `Copy a link to this view`, `Copy the key`, `Copy python tools/key.py <k>`: copied with
`navigator.clipboard`, `✓ Copied` for 4 s; when the clipboard refuses, the payload is shown selected in a read-only
field, never swallowed (GridAtlas's rule, gridatlas@5ec7f62 atlas/modules/202609031958-menu-bar.js:729-730).
**Evidence** — `keys.json`, `proof/edition-sha256.txt`, `proof/keys-summary.json`, `modules.json`, `LICENCES.md`,
`proof/android-journey.json`, `README.md` as downloads, each with its byte count measured when FILE opens; a missing file
says `missing · HTTP 404` in its row. **Export** — `Save an image of this view`: captured inside the page's own frame
(`KY.draw.add`), refused in words when the wafer comes back one colour (`the image came back blank; try again after the
wafer has drawn`), `innerWidth × min(dpr, 2)` wide, with a foot naming the edition, the stamp, the UTC time, "code
Apache-2.0, text and data CC BY 4.0" and the link that reopens the view; `Print`: the same image in a print sheet (the
browser's print-to-PDF is the PDF; no PDF writer is copied from GridAtlas). FILE fetches nothing at install, switches no
layer, adds no bar title and opens no new window.

## Links

A link to this page is its hash: key, line, repo, period, layers; copy it from File, paste it in Edit; the pointer
keeps it. The grammar, its rules, its order and the six examples are in `handoff/06-file/GRAMMAR.md` (proof/handoff/
after the move). This is a departure from GridAtlas, whose deep links are query parameters: the Kuiper's pointers
forward only the hash, so the Kuiper writes the hash and reads a `?…` query as a courtesy (the hash wins).
Examples: `#key=36064705400` · `#line=0048802883266c68d5bdb6f5add0074e8b5b729d:5` · `#repo=gridatlas&period=2026-07` ·
`#layers=lines,see-through&key=63035688574` · `#edition=202611010114&key=36064705400` · `#app=see-through&sub=Drax`.
The round trip is the law: a link copied while a verified line is open, opened fresh through `editions/`, selects the
same body and shows the same line of code as its header (measured in handoff/06-file/TEST.md, A5).
