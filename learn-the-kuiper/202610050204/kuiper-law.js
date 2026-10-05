// kuiper-law.js  THE ONE LAW OF THE REAL KUIPER, lifted VERBATIM from the live page.
// Source: github.com/Ventusltd/kuiper-belt  index.html @ commit 7a65dd315b0c60b1baf9a7090206c900b2cfd0a1
//         (2026-10-04 16:08 +0100, "docs: add What is the Kuiper page"), live at https://ventusltd.github.io/kuiper-belt/
// Every screen of LEARN THE KUIPER GAME that places a real-wafer particle must go through window.KuiperLaw.
// Nothing in here is invented: every formula below is quoted with the live line number it came from.
//
// index.html:79      //     key k  ->  r = sqrt(k),  theta = 2 pi frac(k G / 2^32),  G = 2654435769
// index.html:92      const G32 = 2654435769, TW = 4096;
// index.html:250     function keyPlace(k){ const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, th = 2*Math.PI*m/4294967296, r = Math.sqrt(k + 0.5);
// index.html:251       return [r*Math.cos(th), r*Math.sin(th)]; }
// index.html:143       float d = float(gl_VertexID);
// index.html:144       float r = u_R0 + (d + 0.5) / (u_R0 + sqrt(u_R0*u_R0 + d + 0.5) + 1e-9);      // sqrt(k0+d+.5), kept precise
// index.html:145       uint m = (u_k0lo + uint(gl_VertexID)) * ${G32}u;
// index.html:146       float A = 6.283185307179586 * float(m >> 16) / 65536.0, B = 6.283185307179586 * float(m & 0xFFFFu) / 4294967296.0;
// index.html:147       vec2 cs = vec2(cos(A)*cos(B) - sin(A)*sin(B), sin(A)*cos(B) + cos(A)*sin(B));
// index.html:148       gl_Position = vec4((r*cs - u_center) * u_zoom / (0.5*u_res), 0.0, 1.0);
// index.html:333         for (let off = s0; off < s1; off += 4000000) {                       // bounded calls; the driver watchdog is real
// index.html:334           gl.uniform1ui(U(PK,'u_k0lo'), (off % 4294967296) >>> 0); gl.uniform1f(U(PK,'u_R0'), Math.sqrt(off));
// index.html:335           gl.drawArrays(gl.POINTS, 0, Math.min(4000000, s1 - off)); } }
// index.html:357     { const x0 = (0 - cx)*zoom + ov.width/2, y0 = ov.height/2 + cy*zoom, ...   (the 2D overlay: world y is UP on screen)
//
// WHAT THE LAW SAYS, in words that match the code exactly:
//   keys start at 0.  m = (key * 2654435769) mod 2^32, an unsigned 32-bit integer product (Math.imul, wrapping).
//   turns = m / 2^32           the angle as a fraction of one full turn, in [0, 1)
//   theta = 2 pi turns         radians, anticlockwise from +x, with world y UP on screen (WebGL clip space, :148; overlay :357)
//   r     = sqrt(key + 0.5)    the radius; NOT sqrt(key). The half is in the live code at :250 and :144.
//   Successive keys turn by G32/2^32 = 0.6180339887 of a turn = 222.4922 degrees anticlockwise on screen, which is the
//   same point as 137.5078 degrees CLOCKWISE. The Excel "137.5 anticlockwise" spiral is the MIRROR IMAGE of the Kuiper.
//   Keys beyond 2^32 wrap: key % 4294967296 first (:250), and the shader gets the low 32 bits of the batch offset (:334).
(function (root) {
  'use strict';
  // index.html:92      const G32 = 2654435769, TW = 4096;
  const G32 = 2654435769, TW = 4096;
  const TWO32 = 4294967296;
  // the whole wafer as of this commit: sum of every gap_before and lines in cosmos/wafer.tsv (index.html:180  N = issued; SPACE = k;)
  const SPACE = 59637070538;

  // index.html:250-251, VERBATIM. This is the electron. Do not edit it; edit the live page and re-lift.
  function keyPlace(k){ const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0, th = 2*Math.PI*m/4294967296, r = Math.sqrt(k + 0.5);
    return [r*Math.cos(th), r*Math.sin(th)]; }

  // The same law, opened up so the game can show each part: m, turns, degrees, r, x, y.
  // Every expression here is the one in keyPlace at :250, nothing added.
  function place(key){
    const k = +key;
    const m = Math.imul((k % 4294967296) >>> 0, G32) >>> 0;        // :250
    const turns = m / 4294967296;                                   // :250  th = 2*Math.PI*m/4294967296
    const th = 2*Math.PI*m/4294967296;                              // :250
    const r = Math.sqrt(k + 0.5);                                   // :250
    return { key: k, m: m, turns: turns, deg: turns * 360, theta: th, r: r, x: r*Math.cos(th), y: r*Math.sin(th) };
  }

  // n keys from k0, x,y interleaved, exactly as the live batch does it (:333-335): u_k0lo is the low 32 bits of the
  // batch offset and the shader adds gl_VertexID in uint32. Written here with keyPlace so the result is identical to :250.
  function placeMany(k0, n, out){
    out = out || new Float64Array(2*n);
    for (let d = 0; d < n; d++) { const p = keyPlace(k0 + d); out[2*d] = p[0]; out[2*d+1] = p[1]; }
    return out;
  }

  // The vertex shader at :143-148 reproduced in float32, as the GPU computes it. The live view itself has these float32
  // differences from keyPlace; they are reported separately in kuiper-law.receipt.json and are not photons.
  const f = Math.fround;
  function shader(k0, d){
    // :334  gl.uniform1ui(U(PK,'u_k0lo'), (off % 4294967296) >>> 0); gl.uniform1f(U(PK,'u_R0'), Math.sqrt(off));
    const u_k0lo = (k0 % 4294967296) >>> 0, u_R0 = f(Math.sqrt(k0));
    // :143  float d = float(gl_VertexID);
    const fd = f(d);
    // :144  float r = u_R0 + (d + 0.5) / (u_R0 + sqrt(u_R0*u_R0 + d + 0.5) + 1e-9);
    const r = f(u_R0 + f(f(fd + 0.5) / f(f(u_R0 + f(Math.sqrt(f(f(f(u_R0*u_R0) + fd) + 0.5)))) + f(1e-9))));
    // :145  uint m = (u_k0lo + uint(gl_VertexID)) * ${G32}u;
    const m = Math.imul((u_k0lo + d) >>> 0, G32) >>> 0;
    // :146  float A = 6.283185307179586 * float(m >> 16) / 65536.0, B = 6.283185307179586 * float(m & 0xFFFFu) / 4294967296.0;
    const A = f(f(f(6.283185307179586) * f(m >>> 16)) / 65536.0), B = f(f(f(6.283185307179586) * f(m & 0xFFFF)) / 4294967296.0);
    // :147  vec2 cs = vec2(cos(A)*cos(B) - sin(A)*sin(B), sin(A)*cos(B) + cos(A)*sin(B));
    const cA = f(Math.cos(A)), sA = f(Math.sin(A)), cB = f(Math.cos(B)), sB = f(Math.sin(B));
    const cs = [f(f(cA*cB) - f(sA*sB)), f(f(sA*cB) + f(cA*sB))];
    return { key: k0 + d, m: m, turns: m / TWO32, r: r, x: f(r*cs[0]), y: f(r*cs[1]) };
  }

  // World to screen, as the live page does it. :148 puts world y UP (WebGL clip space); the 2D overlay at :357 agrees
  // (y0 = ov.height/2 + cy*zoom). A 2D canvas is y-down, so the game must FLIP y when it draws KuiperLaw points.
  function toScreen(x, y, cam, W, H){
    return [ W/2 + (x - cam.cx) * cam.zoom, H/2 - (y - cam.cy) * cam.zoom ];
  }

  // index.html:244-248, how the live home camera frames the whole wafer: radius = 80% of half the clear box.
  function homeZoom(boxW, boxH, space){ return Math.min(boxW, boxH) / 2 * 0.80 / Math.sqrt(space == null ? SPACE : space); }

  const constants = {
    G32: G32, TW: TW, TWO32: TWO32, SPACE: SPACE, KEYS_FROM: 0, RADIUS_OFFSET: 0.5,
    TURN_PER_KEY: G32 / TWO32,                       // 0.6180339887 of a turn per key
    DEG_PER_KEY_ANTICLOCKWISE: 360 * G32 / TWO32,    // 222.4922359 degrees anticlockwise, y up
    DEG_PER_KEY_CLOCKWISE: 360 - 360 * G32 / TWO32,  // 137.5077641 degrees clockwise, the same point
    Y_UP_ON_SCREEN: true, BATCH: 4000000, MAX_CALLS: 3000, POINTS_FROM: 1.0
  };

  // TEACHING VARIANT, clearly NOT THE REAL KUIPER. The spreadsheet spiral: theta = key x 137.507764 degrees anticlockwise,
  // r = sqrt(key) (no half). Its angle runs the OTHER WAY round and its radius is off by sqrt(k+0.5)-sqrt(k). Show it only
  // beside the real one, labelled. It exists so a learner can see why the Kuiper is not it.
  const teach = {
    excel: function (key) {
      const k = +key, deg = (k * 137.507764) % 360, th = deg * Math.PI / 180, r = Math.sqrt(k);
      return { key: k, deg: deg, turns: deg / 360, theta: th, r: r, x: r*Math.cos(th), y: r*Math.sin(th),
               label: 'NOT THE REAL KUIPER: Excel spiral, 137.507764 deg per key anticlockwise, r = sqrt(key)' };
    },
    label: 'NOT THE REAL KUIPER'
  };

  const KuiperLaw = {
    place: place, placeMany: placeMany, keyPlace: keyPlace, shader: shader, toScreen: toScreen, homeZoom: homeZoom,
    constants: constants, teach: teach,
    source: 'kuiper-belt@7a65dd315b0c60b1baf9a7090206c900b2cfd0a1 index.html:92,143-148,250-251,333-335,357',
    live: 'https://ventusltd.github.io/kuiper-belt/'
  };
  Object.freeze(constants); Object.freeze(KuiperLaw);
  root.KuiperLaw = KuiperLaw;
  if (typeof module !== 'undefined' && module.exports) module.exports = KuiperLaw;
})(typeof window !== 'undefined' ? window : globalThis);
