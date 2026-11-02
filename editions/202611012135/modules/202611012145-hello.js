/* kuiper module hello, generation 202611012145 (UTC), Apache-2.0 (kuiper-belt) */
// The loader's proof (Opus team 4, NL-010 step 4): registers once, draws one cyan ring at keyPlace(0), the first key
// on the wafer, and exposes inspect(). requires: keyPlace, cam, draw, redraw. provides: hello. Removed from `order`
// before PR A; its sha256 stays in handoff/04-loader/MODULE.sha256. Hooks: kuiper.hooks.v1 (handoff/04-loader/HOOKS.md).
(function () {
  'use strict';
  let frames = 0, host = null;
  KY.register({ schema: 'kuiper.module.v1', id: 'hello', generation: '202611012145',
    requires: ['keyPlace', 'cam', 'draw', 'redraw'], provides: ['hello'],
    install(KY) {
      host = document.createElement('div'); host.id = 'ky-hello'; host.hidden = true; document.body.appendChild(host);
      const p = KY.hooks.keyPlace(0);
      KY.draw.add(function (o2) { const c = KY.cam, x = (p[0] - c.x) * c.zoom + o2.canvas.width / 2, y = o2.canvas.height / 2 - (p[1] - c.y) * c.zoom;
        o2.strokeStyle = '#2ee6e6'; o2.lineWidth = 2; o2.beginPath(); o2.arc(x, y, 18, 0, 6.2832); o2.stroke(); frames++; }, 100);
      KY.redraw();
      return { key: 0, place: p };
    },
    inspect() { return { id: 'hello', ring_at_key: 0, frames_drawn: frames, host: !!host && host.isConnected }; } });
})();
