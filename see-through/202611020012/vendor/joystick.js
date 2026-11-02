/* 01 JOYSTICK: the simulator's touch joystick (DOM, CSS, pointer logic). Push to move, release to zero.
 * Extracted read-only by the LEARN THE KUIPER prospector, 2026-10-04. Code below is verbatim; do not edit it here,
 * copy it into a module and adapt there. Licence: globalgrid2050 is CERN OHL-S v2 (strongly reciprocal, LICENSE.txt). Same owner; keep this header and the source path.
 */

/* DOM (overlay.html line 17):  <div id="joy"><div id="knob"></div></div>  */
/* ---- VERBATIM from Ventusltd/globalgrid2050 @ c5ac5219288b66f583cbba1c1df7a4cb7d883544 : energy-transition-simulator/202609282123/overlay.html lines 12-13 (base CSS) ---- */
  #joy{position:absolute;right:24px;bottom:40px;z-index:3;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.3);touch-action:none}
  #knob{position:absolute;left:40px;top:40px;width:40px;height:40px;border-radius:50%;background:rgba(160,220,255,.6)}

/* ---- VERBATIM from Ventusltd/globalgrid2050 @ c5ac5219288b66f583cbba1c1df7a4cb7d883544 : energy-transition-simulator/202609282123/mod/menu-style.js lines 37-43 (site-world restyle, hidden on fine pointers) ---- */
/* The touch joystick, restyled (site world #pad). Mouse users never see it. */
#joy { left: 24px !important; right: auto !important; bottom: 56px !important; border: 1px solid var(--edge) !important;
       background: rgba(156, 219, 255, 0.04) !important; }
#knob { width: 48px !important; height: 48px !important; left: 36px; top: 36px; border: 1px solid var(--line);
        background: rgba(156, 219, 255, 0.12) !important; }
@media (pointer: fine) { #joy { display: none !important; } }
@media (pointer: coarse) { #joy { bottom: 88px !important; } }   /* clear of the note, #where and the strip */

/* ---- VERBATIM from Ventusltd/globalgrid2050 @ c5ac5219288b66f583cbba1c1df7a4cb7d883544 : energy-transition-simulator/202609282123/mod/walk-fps.js lines 18-18 (state) ---- */
    const keys = new Set(), joy = { x: 0, y: 0, id: null }, look = { id: null, x: 0, y: 0 };

/* ---- VERBATIM from Ventusltd/globalgrid2050 @ c5ac5219288b66f583cbba1c1df7a4cb7d883544 : energy-transition-simulator/202609282123/mod/walk-fps.js lines 69-79 (tick: joystick to velocity with exp easing, the release drift) ---- */
    function tick(t) {
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      if (!on) return;
      const f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - joy.y;
      const r = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + joy.x;
      yaw += ((keys.has('e') ? 1 : 0) - (keys.has('q') ? 1 : 0)) * 90 * dt;
      const run = keys.has('shift') || Math.hypot(joy.x, joy.y) > 0.95, sp = run ? RUN : WALK, b = yaw * Math.PI / 180;
      const n = Math.hypot(f, r) > 1 ? Math.hypot(f, r) : 1;
      const tx = (f * Math.sin(b) + r * Math.cos(b)) / n * sp, ty = (f * Math.cos(b) - r * Math.sin(b)) / n * sp;
      const k = 1 - Math.exp(-dt * 8); vx += (tx - vx) * k; vy += (ty - vy) * k;  // east, north m/s, eased
      if (Math.abs(vx) + Math.abs(vy) > 0.01) {

/* ---- VERBATIM from Ventusltd/globalgrid2050 @ c5ac5219288b66f583cbba1c1df7a4cb7d883544 : energy-transition-simulator/202609282123/mod/walk-fps.js lines 136-151 (pointer capture joystick + drag-to-look) ---- */
    // Phones: the page's joystick drives the walk; a drag anywhere else on the map looks around.
    const joyEl = document.getElementById('joy'), knob = document.getElementById('knob');
    const joyAt = e => { const r = joyEl.getBoundingClientRect(), h = r.width / 2; let x = (e.clientX - r.left - h) / (h - 10), y = (e.clientY - r.top - h) / (h - 10);
      const d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; } joy.x = x; joy.y = y;
      if (knob) { knob.style.left = (40 + x * 40) + 'px'; knob.style.top = (40 + y * 40) + 'px'; } };
    if (joyEl) {
      joyEl.addEventListener('pointerdown', e => { if (!on) return; e.stopImmediatePropagation(); joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); joyAt(e); }, true);
      joyEl.addEventListener('pointermove', e => { if (!on) return; e.stopImmediatePropagation(); if (e.pointerId === joy.id) joyAt(e); }, true);
      const up = e => { if (!on) return; e.stopImmediatePropagation(); if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; if (knob) knob.style.left = knob.style.top = '40px'; };
      joyEl.addEventListener('pointerup', up, true); joyEl.addEventListener('pointercancel', up, true);
    }
    canvas.addEventListener('pointerdown', e => { if (!on || e.pointerType === 'mouse') return; look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; });
    canvas.addEventListener('pointermove', e => { if (!on || e.pointerId !== look.id) return;
      yaw -= (e.clientX - look.x) * 0.25; pitch = Math.max(PMIN, Math.min(PMAX, pitch + (e.clientY - look.y) * 0.2)); look.x = e.clientX; look.y = e.clientY; });
    const lookUp = e => { if (e.pointerId === look.id) look.id = null; };
    canvas.addEventListener('pointerup', lookUp); canvas.addEventListener('pointercancel', lookUp);

