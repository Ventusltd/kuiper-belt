# Opus team 2 · step 2 "the card law" · PLAN (lead, 2026-11-01 21:44 UTC)

Module (ONE file, nobody makes a second): `editions/202611012135/modules/202611012143-line-card.js`, id `line-card`,
schema `kuiper.card.v1`, registers once through `KY.register` (ROADMAP step 4, 4.4). Ports: lead 8420, builder 8421,
tester 8422, evidence 8423. Scratch: /tmp/nl010-opus/team-2/<role>/.

## Design (decided by the lead)

- The module never wraps an engine function (4.8). It exposes `KY.modules['line-card'].api`:
  `show(body, {index, of, onclose})`, `close()`, `row(body, i, cls)` (LINES row HTML), `law` (the K3 sentence),
  `header(body)` (the header text), `inspect()`.
- The page delegates to it with a small patch the integrator applies: `handoff/02-card/index.patch`
  (edCard → `api.show`, fillLines row → `api.row`, script/manifest record). Team 3's layers module later calls
  `api.show` directly (team-2/STEPS.md 3.3).
- Card order (K1): `header.lc-h > code` = `line_text` verbatim (pre-wrap, mono, #fff, 600; "empty line at key" dim
  words when empty; "no text at key" refusal when the field is missing) → `.lc-k` key row
  `repo@commit7 path:line · key N` linked to `destination` → `.lc-q` "register quote" row when quote ≠ line_text
  (with `quote_key` and "quoted one line below" when present) → action row (`open on GitHub`, `details`
  button[aria-expanded]) → `.lc-d` details: title, n of N, pattern, finder, describe(address).
- NL-009 02-card folded in, inside the module's own `<style id="ky-line-card-style">`: bottom sheet ≤ 640 px
  (full width, 12 px radius, `34dvh` cap with `34vh` fallback, safe-area padding), 44 px × and action targets,
  12 px type, handle (class `lc-grip`, NOT `.ch` — `.ch` was the handle in 02-card and clashes with nothing now
  because the header is `.lc-h`), swipe-down ≥ 56 px closes, Escape closes, `overscroll-behavior:contain`,
  `.lc-behind` while any `.gm-open` panel is open (MutationObserver, no setPanel wrap). NL-009 02-card F3 (a tap
  on the card re-picks a spark) is closed by Opus 4's loader patch (`tapUp`, true only for a press that began on the
  canvas; and the base's 03-camera guard `e.target !== cv`, BASE.md B3), NOT by our index.patch, which no longer
  touches the `pointerup` handler (corrected 23:2x; EVIDENCE.md F16).
- K2: `card` gets `aria-label` = header text, `aria-live=polite`.

## Who does what

- LEAD: render/show/close/row/api, index.patch, LAWS-L11.patch, README-card-law.md, REQUESTS.md, HANDOFF.
- BUILDER: CSS block, swipe/Escape/× listeners, behind-panel observer — in the same file, between the markers
  `/* [BUILDER] begin */` and `/* [BUILDER] end */`. If no builder shows up by 22:05 the lead writes them.
- TESTER: `test.cjs` (Pixel 7 + Galaxy S24, real touch) B1–B7 per ROADMAP step 2 over all 344 placed bodies,
  serving the page with index.patch applied through `page.route` until the integrator applies it; img/ ≤ 4 PNG.
- EVIDENCE: EVIDENCE.md, LICENCE.txt, confirm the three wordings identical (B4), review the HANDOFF.

## Status (lead)

- 21:50 the lead wrote the [BUILDER] parts (CSS, swipe/Escape/×, behind-panel observer) into the module directly;
  builder-block.js in /tmp/nl010-opus/team-2/builder/ was not merged (same behaviour, already in the file).
- 22:12 lead cross-check (the lead's own earlier test, /tmp/nl010-opus/team-2/lead/run2/report.json): every device check
  PASS on Pixel 7 and Galaxy S24; ci_check FAIL only on Opus 5's two files (tester's FINDING 6564796205).
- 22:28 module changed: `api.rowInner(b)` added for Opus 3 (no data-i), row CSS keyed on `.lc-rt/.lc-rk/.lc-rn`;
  index.patch regenerated against base 864c89e9 + 04-loader patch 811e5dad (applies with no offset); 22:45 again against base 390b15ae + 04-loader 811e5dad (its hunk 12 rejected, BASE.md B3), test.cjs falls back to patch(1).
  TESTER: please rerun test.cjs on this module; MODULE.json carries the current sha256. The lead posts HANDOFF on your PASS.
- 22:46 LEAD → TESTER: your 22:3x runs served the page WITHOUT window.KY: `git apply` of 04-loader's patch fails on the
  moved base (index.html 390b15ae, BASE.md B3; its hunk 12 is applied by hand by the integrator). test.cjs now falls
  back to patch(1) and names the rejected hunk in the "served" line (one replacement in apply(), nothing else touched).
  Please re-run with --handoff; the lead is running the same file on 8420 (no --handoff) as a cross-check.
