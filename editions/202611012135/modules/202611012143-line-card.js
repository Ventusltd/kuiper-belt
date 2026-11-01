/* kuiper module line-card, generation 202611012143 (UTC), Apache-2.0 (kuiper-belt) */
// requires: card esc fmt address describe sel lit redraw gbox · provides: line-card · schema kuiper.card.v1
// reads: nothing fetched (bodies are handed in by the page or a module) · writes: #card (its content, classes, aria),
//   #ky-line-card-style, the empty [data-owner="line-card"] slot of the ABOUT panel, window.KY.modules.line-card
//
// The line of code is the header. Every card opens with the line itself, verbatim from the key; the key is the second row; every name a person gave the line comes after.
//
// Roadmap step 2 (neural-link FIXES/NL-010/ROADMAP.md "Step 2", team-1/STEPS.md:255-345), K0-K6:
//   row 1  <header class="lc-h"><code>  = body.line_text, escaped, pre-wrap, mono, #fff, 600; nothing before it.
//          Empty line at the key: the code is empty and the dim words "empty line at key" follow it.
//          No line_text field: the card refuses with "no text at key" (never the title, never the quote).
//   row 2  the key: repo@commit7 path:line · key N, a link to body.destination.
//   row 2b "register quote", only when quote !== line_text (with quote_key and "quoted one line below" when present).
//   then   the action row (open on GitHub, details) and, behind details, every name: title, n of N, pattern, finder,
//          the wafer position (describe(address(key))).
// NL-009 round 1 patch 02-card (FABLE-02) folded in: bottom sheet on a phone, 44 px targets, 12 px type, 34dvh cap,
//   safe-area padding, swipe-down / Escape / × close, scroll contained, steps behind an open panel.
// The module never wraps an engine function: the page (or a module) calls api.show(body, {index, of, onclose}).
(function () {
  'use strict';
  var LAW = 'The line of code is the header. Every card opens with the line itself, verbatim from the key; the key is the second row; every name a person gave the line comes after.';
  var STAMP = '202611012143';
  // a line longer than this is laid out unwrapped and scrolls sideways inside the header; every byte stays in it.
  // Measured for the 1,240,449-character line (kuiper-belt estate-network.json:1, key 63,013,167,769), Pixel 7
  // emulation, one container: wrapped 9,313 ms, unwrapped 201 ms (lead, 21:59 UTC); unwrapped 1.4-3.6 s at load
  // average 86-95 (evidence officer, handoff/02-card/EVIDENCE.md F-c). Not phone numbers.
  var LONG = 2000;
  if (!window.KY || typeof window.KY.register !== 'function') return;   // no hook table: the page keeps its own card

  var CSS = [
    /* the card is a box on a desktop and a bottom sheet on a phone (NL-009 02-card F5-F7) */
    '#card.lc{padding:0!important;bottom:12px!important;z-index:13;max-height:30vh;max-height:30dvh;overflow:auto;',
    '  overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;scrollbar-width:thin;position:fixed;white-space:normal}',
    '#card.lc .lc-in{position:relative;padding:8px 48px 8px 12px}',
    /* row 1, the header: the line itself */
    '#card.lc .lc-h{display:block;margin:0 0 4px;max-height:7.5em;overflow:auto;overscroll-behavior:contain}',
    '#card.lc .lc-h code{display:block;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;color:#fff;font-weight:600;',
    '  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:inherit;line-height:1.45;tab-size:4}',
    '#card.lc .lc-h.lc-long code{white-space:pre;overflow-wrap:normal;word-break:normal}',
    '#card.lc .lc-h .lc-e,#card.lc .lc-h .lc-none{display:block;color:var(--dim);font-weight:400}',
    '#card.lc .lc-h .lc-none{color:var(--am)}',
    /* row 2, the key */
    '#card.lc .lc-k{display:block;color:#cde;white-space:pre-wrap;overflow-wrap:anywhere;text-decoration:none;margin:0 0 2px}',
    '#card.lc .lc-k:hover{text-decoration:underline}',
    '#card.lc .lc-q{color:#cde;border-left:2px solid #3a4150;padding-left:8px;margin:4px 0;white-space:pre-wrap;overflow-wrap:anywhere}',
    '#card.lc .lc-q i{color:var(--dim);font-style:normal}',
    /* the action row and the close: 44 px targets on a phone (F1, F2) */
    '#card.lc .lc-x{position:absolute;right:0;top:0;width:44px;height:44px;border:0;color:#8fb3bd;background:transparent;padding:0;',
    '  font:18px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;cursor:pointer;touch-action:manipulation}',
    '#card.lc .lc-x:hover,#card.lc .lc-x:active{color:#fff}',
    '#card.lc .lc-a{display:flex;flex-wrap:wrap;align-items:center;gap:0 2px;margin:0 0 -4px -8px;color:var(--dim)}',
    '#card.lc .lc-a a,#card.lc .lc-t{display:inline-flex;align-items:center;min-height:32px;padding:0 8px;touch-action:manipulation}',
    '#card.lc .lc-t{appearance:none;border:0;background:transparent;color:var(--cy);cursor:pointer;font:inherit;text-decoration:underline dotted}',
    '#card.lc .lc-d{display:none;color:var(--dim);margin-top:6px;border-top:1px solid #121a26;padding-top:6px;white-space:pre-wrap;overflow-wrap:anywhere}',
    '#card.lc .lc-d .lc-title{color:var(--am);font-weight:600}',
    '#card.lc.lc-open .lc-d{display:block}',
    '#card.lc.lc-behind{visibility:hidden}',
    '#card.lc .lc-grip{display:none}',
    /* K6, the LINES rows: the line, then the key, then the title */
    '#lineslist .lc-rt{display:block;white-space:pre;overflow:hidden;text-overflow:ellipsis;color:#fff;font-weight:600;',
    '  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '#lineslist .lc-rk{display:block;color:#cde}',
    '#lineslist .lc-rn{display:block}',
    '#lineslist .lc-rt ~ i{color:var(--dim);font-style:normal}',
    '#lineslist .lc-rt ~ i.lc-none{color:var(--am)}',
    '@media (max-width:640px){',
    '  #card.lc{left:0;right:0;bottom:0!important;max-width:none;max-height:34vh;max-height:34dvh;font-size:12px;line-height:1.5;',
    '    border-left:0;border-right:0;border-bottom:0;border-radius:12px 12px 0 0}',
    '  #card.lc .lc-in{padding:4px 48px calc(8px + env(safe-area-inset-bottom,0px)) 12px}',
    '  #card.lc .lc-grip{display:block;position:absolute;left:50%;top:4px;width:36px;height:4px;margin-left:-18px;border-radius:2px;background:#2a5560}',
    '  #card.lc .lc-h{margin-top:8px}',
    '  #card.lc .lc-x{height:48px}',
    '  #card.lc .lc-a a,#card.lc .lc-t{min-height:44px}',
    '  #card.lc .lc-d{font-size:11px}',
    '}'
  ].join('\n');

  function hasText(b) { return b && typeof b.line_text === 'string'; }

  window.KY.register({
    schema: 'kuiper.module.v1', id: 'line-card', generation: STAMP,
    requires: ['card', 'esc', 'fmt', 'address', 'describe', 'sel', 'lit', 'redraw', 'gbox'],
    provides: ['line-card'],
    install: function (KY) {
      var H = KY.hooks, card = H.card, esc = H.esc, fmt = H.fmt;
      var state = { shown: null, index: -1, of: 0, onclose: null, opened: 0, refused: 0, last: null };

      var st = document.createElement('style'); st.id = 'ky-line-card-style'; st.textContent = CSS;
      document.head.appendChild(st);
      card.classList.add('lc');
      card.setAttribute('aria-live', 'polite');

      // the header text: the line at the key, or the refusal (K0)
      function header(b) { return hasText(b) ? b.line_text : 'no text at key'; }
      function keyText(b) {
        return String(b.repo) + '@' + String(b.commit || '').slice(0, 7) + ' ' + String(b.path) + ':' + b.line
          + (Number.isFinite(b.key) ? ' · key ' + fmt(b.key) : '');
      }
      // K1, in this order and no other
      function render(b, o) {
        var h = hasText(b)
          ? '<header class="lc-h' + (b.line_text.length > LONG ? ' lc-long' : '') + '"><code>' + esc(b.line_text) + '</code>'
            + (b.line_text === '' ? '<span class="lc-e">empty line at key</span>' : '')
            + (b.line_text.length > LONG ? '<span class="lc-e">one line of ' + fmt(b.line_text.length) + ' characters, verbatim; it scrolls sideways</span>' : '') + '</header>'
          : '<header class="lc-h"><code></code><span class="lc-none">no text at key</span></header>';
        var k = '<a class="lc-k" href="' + esc(b.destination) + '" target="_blank" rel="noopener">' + esc(keyText(b)) + '</a>';
        var q = '';
        if (b.quote && (!hasText(b) || b.quote !== b.line_text)) {
          q = '<div class="lc-q"><i>register quote' + (b.quote_key ? ', quoted one line below · key ' + esc(fmt(b.quote_key)) : '')
            + '</i>\n' + esc(b.quote) + '</div>';
        }
        var a = '<div class="lc-a"><a href="' + esc(b.destination) + '" target="_blank" rel="noopener">open on GitHub at '
          + esc(String(b.commit || '').slice(0, 7)) + '</a>·<button class="lc-t" type="button" aria-expanded="false">details</button></div>';
        var addr = Number.isFinite(b.key) ? H.address(b.key) : null;
        var d = '<div class="lc-d"><span class="lc-title">' + esc(b.title) + '</span>'
          + (o && o.of ? '  ' + fmt((o.index | 0) + 1) + ' of ' + fmt(o.of) : '')
          + (b.pattern ? '\npattern: ' + esc(b.pattern) : '')
          + (b.worker || b.finding ? '\nfound by ' + esc(b.worker) + ' ' + esc(b.finding) + ', verified by a controller' : '')
          + (b.quote_check ? '\nquote check: ' + esc(b.quote_check) : '')
          + (addr ? '\n' + H.describe(addr) : '') + '</div>';
        // the header is the first element and the first text; the close and the grip come after it in the DOM
        return '<div class="lc-in">' + h + k + q + a + d
          + '<span class="lc-grip" aria-hidden="true"></span><button class="lc-x" type="button" aria-label="close">×</button></div>';
      }

      function show(b, o) {
        o = o || {};
        if (!b) return false;
        state.shown = b; state.index = o.index == null ? -1 : o.index; state.of = o.of || 0;
        state.onclose = typeof o.onclose === 'function' ? o.onclose : null;
        state.opened++; if (!hasText(b)) state.refused++;
        card.classList.remove('lc-open');
        card.innerHTML = render(b, o);
        card.setAttribute('aria-label', header(b));
        card.style.display = 'block'; card.scrollTop = 0;
        behind();
        if (Number.isFinite(b.key)) { var a = H.address(b.key); if (a && !a.silent) KY.lit.repo = a.c.repo; }
        if (Number.isFinite(b.x) && Number.isFinite(b.y)) KY.sel.target = { x: b.x, y: b.y };
        KY.redraw();
        state.last = { header: header(b), key: keyText(b), k: b.key };
        return true;
      }
      function close() {
        var cb = state.onclose;
        card.style.display = 'none'; card.classList.remove('lc-open');
        state.shown = null; state.onclose = null;
        KY.sel.target = null; KY.redraw();
        if (cb) { try { cb(); } catch (e) { /* the caller's callback; the card is closed either way */ } }
      }
      // K6: a LINES row reads the line, then the key, then the title. rowInner(b) is the row's content only, for a
      // module that wraps it in its own .ln[data-i] (Opus 3, #10 issuecomment-6564782359 item 3); row(b, i, cls) is the
      // whole row the page's fillLines uses until then
      function rowInner(b) {
        var t = hasText(b) ? b.line_text : '';
        return '<code class="lc-rt">' + esc(t) + '</code>'
          + (hasText(b) ? (t === '' ? '<i>empty line at key</i>' : '') : '<i class="lc-none">no text at key</i>')
          + '<span class="lc-rk">' + esc(keyText(b)) + '</span>'
          + '<span class="lc-rn">' + esc(b.title) + '</span>';
      }
      function row(b, i, cls) {
        return '<div class="ln lc-row' + (cls ? ' ' + cls : '') + '" data-i="' + (i | 0) + '" role="button" tabindex="0">' + rowInner(b) + '</div>';
      }

      // the card steps behind any open panel (visibility, so the page can still measure it) and returns when it closes
      function behind() { card.classList.toggle('lc-behind', !!document.querySelector('.gm-open')); }
      new MutationObserver(behind).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

      // clicks: × closes, details toggles, the link keeps its default (a new tab), a tap on the body keeps it open.
      // Heard on window in the capture phase, before the page's own capture handler on #card, which stops the event.
      window.addEventListener('click', function (e) {
        if (!state.shown || !e.target || !e.target.closest || !card.contains(e.target)) return;
        if (e.target.closest('.lc-x')) { e.preventDefault(); close(); return; }
        var t = e.target.closest('.lc-t');
        if (t) t.setAttribute('aria-expanded', String(card.classList.toggle('lc-open')));
      }, true);
      // a swipe down from the top of the sheet closes it (02-card F7)
      var sw = null;
      card.addEventListener('touchstart', function (e) {
        var t = e.touches[0]; sw = (e.touches.length === 1 && card.scrollTop <= 0) ? { x: t.clientX, y: t.clientY } : null;
      }, { passive: true });
      card.addEventListener('touchmove', function (e) {
        if (!sw) return; var t = e.touches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
        if (dy > 56 && dy > 2 * Math.abs(dx)) { sw = null; close(); } else if (dy < -8 || Math.abs(dx) > 24) sw = null;
      }, { passive: true });
      card.addEventListener('touchend', function () { sw = null; });
      // Escape closes the card only when no panel and no finder is open (capture, so an open panel is seen before it closes)
      window.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || card.style.display !== 'block' || !state.shown) return;
        if (document.querySelector('.gm-open') || H.gbox.style.display === 'block') return;
        close();
      }, true);

      // K3: the shell's ABOUT panel keeps a slot for the law (data-owner="line-card"); the card fills it only when empty
      function aboutLaw() {
        var p = document.querySelector('[data-owner="line-card"][data-law="L11"]');
        if (p && !p.textContent.trim()) p.textContent = LAW;
        return p ? p.textContent : null;
      }
      aboutLaw();

      function inspect() {
        return { schema: 'kuiper.card.v1', law: LAW, open: card.style.display === 'block' && !!state.shown,
          index: state.index, of: state.of, opened: state.opened, refused: state.refused, last: state.last, about: aboutLaw() };
      }
      return Object.freeze({ law: LAW, header: header, show: show, close: close, row: row, rowInner: rowInner, inspect: inspect });
    },
    inspect: function () { return { schema: 'kuiper.card.v1', law: LAW }; }
  });
})();
