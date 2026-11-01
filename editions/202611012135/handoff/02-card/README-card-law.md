## The card law

The line of code is the header. Every card opens with the line itself, verbatim from the key; the key is the second row; every name a person gave the line comes after.

That sentence is the short form of law L11 (`LAWS.md`, carried as `handoff/02-card/LAWS-L11.patch`). The card is the
module `modules/202611012143-line-card.js` (Opus team 2, roadmap step 2). A card, rendered, for the first of the 344
placed lines (`keys.json` `bodies[0]`, key 36,064,705,400):

```
# Every digest in this repository is taken over git blob content, which is LF,
data-centres-gb@f9f4728 .gitattributes:5 · key 36,064,705,400
open on GitHub at f9f4728 · details
  Bytes on disk are the bytes that ship  1 of 344
  pattern: Canonical bytes (LF pinned at the attribute layer, binaries untouched)
  found by W08 F15, verified by a controller
```

Row 1 is `bodies[i].line_text`, the bytes at the key as `tools/edition_keys.py:251` wrote them, never the register's
title or quote. Row 2 is the key. The names (title, n of 344, pattern, finder, the wafer position) sit behind
"details". Where the register's quote differs from the line at the key (216 of 344 bodies), the quote is a row under
the key marked "register quote", never the header; 7 of those are "quoted one line below" with their own key; 4 lines
at their key are empty and the header says "empty line at key". A body without `line_text` is refused with the words
"no text at key". The LINES rows follow the same order: line, key, title.

**Falsified by:** a card whose first visible row differs from the text at its key; a card that shows a line
without its key on the next row; or a quote shown as the header when the quote is not the line at the key.
The test is `handoff/02-card/test.cjs` (B1–B7, Pixel 7 and Galaxy S24, all 344 placed bodies).
