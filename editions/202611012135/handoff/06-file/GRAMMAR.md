# The Kuiper hash deep-link grammar (`kuiper.link.v1`), as `modules/202611012231-file.js` reads and writes it

Opus team 6, ROADMAP step 6 (6.3, 6.4); team-3/STEPS.md 6.3; ROADMAP "Resolved between teams" R3. Text CC BY 4.0.
Every rule below is the module's code: `RULES`, `FIELDS`, `WRITTEN`, `parse`, `readText`, `hashText`, `apply` in
SECTION A of the module. A link to this page is its hash: key, line, repo, period, layers; copy it from File, paste
it in Edit; the pointer keeps it.

## Why the hash, not GridAtlas's query

GridAtlas's deep link is a query parameter (gridatlas@5ec7f62 atlas/modules/202608291818-place-postcode-search.js:206-209,
:294-298) and its root forwards `search + hash` (gridatlas@5ec7f62 index.html:2). The Kuiper's three pointers forward only
the hash (`location.replace('202611012027/' + location.hash)`, kuiper-belt editions/index.html:12; see-through/index.html:12;
learn-the-kuiper/index.html:12), Learn the Kuiper already keeps its state in the hash (learn-the-kuiper/202610050609/
lesson.js:336, `history.replaceState`, 400 ms), and a hash change does not reload a WebGL page whose wafer is in memory.
So: the reader merges `location.search.slice(1) + '&' + location.hash.slice(1)` (as learn-the-kuiper/202610050609/one.js:468
does) and the hash wins a duplicate; the writer writes only the hash.

## The fields (byte for byte from the module)

| field | rule (`RULES`) | read as (`apply`) | written by this page when |
|---|---|---|---|
| `key` | `^\d{1,15}$` and `< SPACE` | a placed verified line with that key: its card (the line is the header) and the fly into the clear space (`KY.modules.layers.api.open(i)`); any other key: `goKey(k)` (zoom 14, `describe`'s card) | a key is opened by any means: `Open a key`, `r`, the find box, a spark, `e`/`E` (the card is watched) |
| `line` | `^[0-9a-f]{40}:\d+$` (`keys.json bodies[].id`) | that body's card and fly; unknown → `line <id> is not in this edition's keys.json` | `e`/`E`, a spark tap, a LINES row, `Open a line`, a pasted link; `key=` is written beside it |
| `repo` | 1-100 chars, no space `&` `#` | lit by exact lower-case name, then `includes` (the find box's rule, index.html Edition 4 :612-613), `home()`; none → `no repository called <name>` | the find box lights a repository |
| `period` | `^20\d\d(-\d\d){0,2}$` | `lightTime(y, m, d)` | the find box lights a period |
| `layers` | `^([a-z0-9-]+(,[a-z0-9-]+)*)?$` (ids of `data/layers.json`) | on arrival Opus 3's registry applies it itself (layers.js `applyLink`); from a pasted link this module calls `KY.modules.layers.api.set(id, on)` for each record | written by Opus 3's registry on every layer change (layers.js `writeURL`); this writer copies it back byte for byte and never drops it |
| `edition` | `^\d{12}$` | navigate to `../<stamp>/#<the rest>` (Edition 1: `../202610311905/belt/`), stop; the page's own stamp is ignored | never |
| `app` | `^[a-z0-9-]{1,64}$` | navigate to the app's link with the carried fields (See Through gets `repo key space sub` through `KY.modules['see-through'].api.link`), stop; unknown → `no app called <id>` | never |
| `sub` | 1-200 chars | carried only, to See Through | never in this page's hash; `Open an app → See Through` carries the find box's unmatched text as `#sub=<text>` |
| `space` | `^\d{1,16}$` | carried only, beside `key`, to See Through | never |

A name that is not in the table, or a value that fails its rule, is ignored and named once in the readout (`#hud`,
VIEW panel): `link: <field> not understood`. Never an error, never a throw.

## Order, writing, history

- Arrival: after the wafer promise resolves (`KY.hooks.wafer`), once: `edition` (navigate, stop), `app` (navigate, stop),
  `layers`, `period`, `repo`, `line`, `key`; the last camera wins (a `key` equal to the `line`'s key is not opened twice).
  A `line` (and a `key` that is a verified line) waits until the lines layer is OK and the body list is read.
- `hashchange` runs the same reader (a hash typed or pasted into the address bar).
- Writing: `history.replaceState(history.state, '', path + search + '#' + hashText())`, 400 ms debounced. `hashText()`
  emits only `key, line, repo, period, layers`, in that order, only those with a value; values `encodeURIComponent`'d
  with `:` and `,` written back as themselves (legal in a fragment, RFC 3986 §3.5).
- A link change never adds a history entry. An open panel (kuiper-shell) and an open card (the page's ANDROID BACK)
  each hold one pushed entry; after every `popstate` the module writes the hash again, so closing them never brings
  back an older hash, and the `hashchange` that traversal fires is not read as a new link.
- Backspace (whole wafer, also EDIT's `clear the selection`) clears every field but `layers`.

## Examples (each one is a step of test.cjs A4; results in TEST.md)

| link | does |
|---|---|
| `editions/202611012135/#key=36064705400` | the card of `bodies[0]`, header `# Every digest in this repository is taken over git blob content, which is LF,`, zoom 14 |
| `#line=0048802883266c68d5bdb6f5add0074e8b5b729d:5` | the same body selected, the spark between the bar and the card |
| `#repo=gridatlas&period=2026-07` | July 2026 lit, then gridatlas lit |
| `#layers=lines,see-through&key=63035688574` | those two layers on, the others off; the camera at the key |
| `#edition=202611010114&key=36064705400` | navigation to `editions/202611010114/#key=36064705400` (Edition 2 ignores the hash today) |
| `#app=see-through&sub=Drax` | navigation to `see-through/#sub=Drax` (See Through lands on Drax once its reader ships, Opus 5) |

## The round trip (6.4), the law of the grammar

`Copy a link to this view` after a verified line is open copies `…/editions/<stamp>/#key=<key>&line=<id>[&layers=…]`
(the table's order; 6.4 lists the same two fields as `line=<id>&key=<key>`, the reader is order-free). Opened fresh
through the pointer `editions/`, which forwards the hash, it selects the same body, lands it in the clear space, and
the card header is the same line of code. test.cjs A5 proves it for `e` and two random `edPlaced[i]` per device.

## A pasted link (EDIT)

`KY.modules.file.api.link.read(text)` takes a whole URL or a bare `#…`/`?…`/`name=value…`: a path containing
`/see-through/` is navigation to this host's `../../see-through/` with the pasted hash; anything else is a Kuiper link
whose fields are applied here (the pasted link's edition path is not followed: a line is looked at in this edition).
