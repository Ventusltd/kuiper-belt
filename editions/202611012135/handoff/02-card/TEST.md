# handoff/02-card TEST — ROADMAP step 2 "the card law", B1–B7 on Android

Run 2026-11-01T23:33:26.575Z (label `final`) by OPUS-2 tester: `node editions/202611012135/handoff/02-card/test.cjs http://127.0.0.1:8422/editions/202611012135/ /tmp/nl010-opus/team-2/tester/run-final`. Playwright 1.63.0, Chromium with SwiftShader, devices['Pixel 7'] and devices['Galaxy S24'], real touch. Module `202611012143-line-card.js` sha256 `e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065`; kuiper-belt `edition/202611012135` @ `513c2f1`.

**RESULT: PASS** — the tester releases the hand-off.

Served page: `modules.json served with order [hello, line-card] (line-card record from handoff/02-card/MODULE.json, verbatim)`.

## Static (once)

| id | assertion | result | measured / note |
|---|---|---|---|
| S0 | K0 keys.json byte-identical to Edition 2 | PASS | {"sha256":"1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b","edition2":"1c293c337b4c3c8442c12746ce3cd08d920c763344f18333f75e73aa9fc7242b"} |
| S0b | keys-min.json (what the page loads first): every placed body's line_text, key, destination, repo, commit, path, line, title equal keys.json's | PASS | {"placedFull":344,"placedMin":344,"differing":0,"first":null,"sha256":"e153dfa45d3028577462002d229000c4a313fb1a76052801edc29cf8ceceb10d"} |
| S1 | one modules/<stamp>-line-card.js; line 1 "/* kuiper module line-card, generation <stamp> (UTC), <licence> */"; file stamp = header = generation; Apache-2.0 | PASS | {"files":["202611012143-line-card.js"],"headerStamp":"202611012143","fileStamp":"202611012143","generation":"202611012143","licence":"Apache-2.0 (kuiper-belt)","bytes":14509,"sha256":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065"} |
| S2 | node --check passes; exactly one KY.register( | PASS | {"nodeCheck":true,"registerCalls":1} |
| S3 | handoff MODULE.sha256 equals the module file sha256 | PASS | {"recorded":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065","measured":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065"} |
| S3r | handoff MODULE.json (the record for modules.json): id line-card, path = the module, sha256 and bytes = the file, licence set, bytes ≤ byte_budget | PASS | {"file":"MODULE.json","path":"modules/202611012143-line-card.js","recorded":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065","measured":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065","bytes":14509,"measuredBytes":14509,"byte_budget":32768} |
| S3m | modules.json lists line-card with the module sha256 (integrator, team 10) | INFO | not listed yet (served through page.route) |
| S4 | B4 the K3 sentence identical: README "## The card law" first paragraph, LAWS-L11.patch, module head; L11 heading + Falsified-by; patch applies after L10 | PASS | {"readme":"editions/202611012135/README.md","readmeFirstParagraphEqual":true,"readmeFalsifiedBy":true,"editionReadmeSection":true,"handoffReadmeSection":true,"patchHasLaw":true,"patchL11Heading":true,"patchFalsifiedBy":true,"gitApplyCheck":true,"l11AfterL10":true,"moduleHeadCarriesLaw":true} |
| S5 | B7 tools/ci_check.py: no failing check names a team-2 file (handoff/02-card/, the line-card module) | PASS | RESULT: PASS |
| S5r | B7 tools/ci_check.py prints RESULT: PASS for the whole repository (all teams; the integrator gates on it) | INFO | {"status":0,"last":"RESULT: PASS"} |
| S6 | the module did not change while the run ran (sha256 at start = at end) | PASS | {"start":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065","end":"e2baeaaaf244ad0b7ab6c2e8f727d0cc5a39a1f1b3765b26db00d36fc957c065"} |

## Pixel 7 (412×839 @2.625) — PASS: 16 pass, 0 fail, 0 console errors

| id | assertion | result | measured / note |
|---|---|---|---|
| D1 | load: zero console errors; line-card admitted by the loader, nothing refused | PASS | {"placed":344} |
| D2 | B4 the K3 sentence on the page, byte for byte (no ABOUT panel in this run: api.law / slot) | PASS | ABOUT panel (team 1 shell) not in this run; --with-shell checks the panel |
| D3 | B6 every LINES row reads the line text first, then the key, then the title | PASS | {"rows":344,"ok":344,"expectedRows":344,"openedBy":"lines"} |
| D4 | touch a LINES row: B1 header = line_text, B2 key second, B3 ≤ 34 % and the spark in the clear space | PASS | {"key":36064705400,"height":137.8,"cap":285.3,"spark":[205.5,387.7]} |
| D5 | details by touch: button[aria-expanded] opens and closes the details, ≤ 34 % open, ≥ 44 px tall (NL-009 F2) | PASS | {"found":true,"target":[68,44],"heightBefore":137.78125,"capPx":285.3,"ok":true} |
| D6 | the GitHub link (href = destination) opens a tab on a touch tap, ≥ 44 px tall; the card stays open on the same line | PASS | {"found":true,"target":[81,44],"text":"open on GitHub at f9f4728","newTab":"https://github.com/Ventusltd/data-centres-gb/blob/f9f47286fae63872375c558fc89ff4b1793914e4/.gitattributes#L5","navigatedAway":false,"cardStillOpen":true,"sameLine":true,"ok":true} |
| D7 | × is a ≥ 44 × 44 px touch target; × closes the card and clears the selected spark | PASS | {"found":true,"target":[44,48],"cardOpen":false,"magentaPx":0,"ok":true} |
| D8 | touch the spark: its card opens, B1 + B2 + B3 | PASS | {"key":36064705400,"height":137.8,"cap":285.3,"spark":[205.5,387.8]} |
| D9 | touch commands → next verified line: the next body's card, B1 + B2 + B3 | PASS | {"key":62737254220,"height":251.2,"cap":285.3,"spark":[205.5,387.8]} |
| N1 | NL-009 02-card F6: 12 px card type on a phone | PASS | {"fontSize":"12px"} |
| N2 | NL-009 02-card F4: the card steps behind an open panel and returns when it closes | PASS | {"openedBy":"lines","whileOpen":"hidden","after":"visible","panelClosed":true,"cardOpen":true,"ok":true} |
| N3 | NL-009 02-card F5: a 24 px bottom safe-area inset adds ≥ 24 px of card padding | PASS | {"paddingWithout":8,"paddingWith24":32} |
| N4 | NL-009 02-card F7: a swipe down closes the card and clears the spark; Escape closes it | PASS | {"swipeClosed":true,"swipeMagenta":0,"reopened":true,"escapeClosed":true,"ok":true} |
| D10 | B1/B2/B3 over all 344 placed bodies: first visible text = line_text, key second, title after, ≤ 34 % | PASS | all 344 bodies pass; 4 empty lines say "empty line at key"; tallest card 285.3 px |
| D10i | K2 aria-label = header and aria-live=polite; key number and destination link in row 2; header first element; register-quote rows (info) | INFO | {"ariaLabelIsHeader":344,"ariaLivePolite":344,"row2KeyNumber":344,"row2LinkIsDestination":344,"headerFirstElementChild":344,"registerQuoteRows":"216 of 216","of":344} |
| D11 | B5 a body without line_text shows "no text at key" in the header (keys.json mutated through page.route) | PASS | {"open":true,"isThatBody":true,"headerText":"no text at key","headerSays":true,"ariaLabel":"no text at key","lineCardAdmitted":true} |
| D12 | B7 zero console errors, page errors, failed requests and HTTP errors over the whole run | PASS | {"count":0} |

## Galaxy S24 (360×780 @3) — PASS: 16 pass, 0 fail, 0 console errors

| id | assertion | result | measured / note |
|---|---|---|---|
| D1 | load: zero console errors; line-card admitted by the loader, nothing refused | PASS | {"placed":344} |
| D2 | B4 the K3 sentence on the page, byte for byte (no ABOUT panel in this run: api.law / slot) | PASS | ABOUT panel (team 1 shell) not in this run; --with-shell checks the panel |
| D3 | B6 every LINES row reads the line text first, then the key, then the title | PASS | {"rows":344,"ok":344,"expectedRows":344,"openedBy":"lines"} |
| D4 | touch a LINES row: B1 header = line_text, B2 key second, B3 ≤ 34 % and the spark in the clear space | PASS | {"key":36064705400,"height":137.8,"cap":265.2,"spark":[179.5,358]} |
| D5 | details by touch: button[aria-expanded] opens and closes the details, ≤ 34 % open, ≥ 44 px tall (NL-009 F2) | PASS | {"found":true,"target":[68,44],"heightBefore":137.78125,"capPx":265.2,"ok":true} |
| D6 | the GitHub link (href = destination) opens a tab on a touch tap, ≥ 44 px tall; the card stays open on the same line | PASS | {"found":true,"target":[81,44],"text":"open on GitHub at f9f4728","newTab":"https://github.com/Ventusltd/data-centres-gb/blob/f9f47286fae63872375c558fc89ff4b1793914e4/.gitattributes#L5","navigatedAway":false,"cardStillOpen":true,"sameLine":true,"ok":true} |
| D7 | × is a ≥ 44 × 44 px touch target; × closes the card and clears the selected spark | PASS | {"found":true,"target":[44,48],"cardOpen":false,"magentaPx":0,"ok":true} |
| D8 | touch the spark: its card opens, B1 + B2 + B3 | PASS | {"key":36064705400,"height":137.8,"cap":265.2,"spark":[179.5,358]} |
| D9 | touch commands → next verified line: the next body's card, B1 + B2 + B3 | PASS | {"key":62737254220,"height":265.2,"cap":265.2,"spark":[179.5,351]} |
| N1 | NL-009 02-card F6: 12 px card type on a phone | PASS | {"fontSize":"12px"} |
| N2 | NL-009 02-card F4: the card steps behind an open panel and returns when it closes | PASS | {"openedBy":"lines","whileOpen":"hidden","after":"visible","panelClosed":true,"cardOpen":true,"ok":true} |
| N3 | NL-009 02-card F5: a 24 px bottom safe-area inset adds ≥ 24 px of card padding | PASS | {"paddingWithout":8,"paddingWith24":32} |
| N4 | NL-009 02-card F7: a swipe down closes the card and clears the spark; Escape closes it | PASS | {"swipeClosed":true,"swipeMagenta":0,"reopened":true,"escapeClosed":true,"ok":true} |
| D10 | B1/B2/B3 over all 344 placed bodies: first visible text = line_text, key second, title after, ≤ 34 % | PASS | all 344 bodies pass; 4 empty lines say "empty line at key"; tallest card 265.2 px |
| D10i | K2 aria-label = header and aria-live=polite; key number and destination link in row 2; header first element; register-quote rows (info) | INFO | {"ariaLabelIsHeader":344,"ariaLivePolite":344,"row2KeyNumber":344,"row2LinkIsDestination":344,"headerFirstElementChild":344,"registerQuoteRows":"216 of 216","of":344} |
| D11 | B5 a body without line_text shows "no text at key" in the header (keys.json mutated through page.route) | PASS | {"open":true,"isThatBody":true,"headerText":"no text at key","headerSays":true,"ariaLabel":"no text at key","lineCardAdmitted":true} |
| D12 | B7 zero console errors, page errors, failed requests and HTTP errors over the whole run | PASS | {"count":0} |

## Reading the table

Gating: every row not marked INFO. B1 = D4, D8, D9, D10 (the first visible text node of the card, the × control excepted, equals `keys.json` `line_text` byte for byte; the 4 empty lines show "empty line at key" inside the header); B2 = the next row carries `repo@commit7` and `path:line` and sits inside the card without scrolling; B3 = card height ≤ 34 % of the viewport and the selected spark between the bar and the card after the fly; B4 = S4 + D2; B5 = D11; B6 = D3; B7 = S5 + D12. N1–N4 are the NL-009 round-1 02-card fixes folded into the module. Screenshots of every step are in `/tmp/nl010-opus/team-2/tester/run-final/<device>/`, the full measurements in `/tmp/nl010-opus/team-2/tester/run-final/report.json`; img/ holds the before/after pair.

## Rerun

```
cd /home/user/estate/kuiper-belt && python3 -m http.server 8422 --bind 127.0.0.1 &
node editions/202611012135/handoff/02-card/test.cjs http://127.0.0.1:8422/editions/202611012135/ /tmp/nl010-opus/team-2/tester/run-after --handoff
```
