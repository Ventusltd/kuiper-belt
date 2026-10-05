// fx-common.js  Shared, engine-free pieces of the light layer: seeded random, the colour ramps, the star sizing rule,
// the supernova timeline and its spark simulation. Every engine draws from the same numbers so the scene is identical.
// Classic script. Sets window.KGFXCommon and creates window.KGFXEngines.
(function (root) {
  'use strict';
  root.KGFXEngines = root.KGFXEngines || {};

  function rng(seed) {                       // mulberry32
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }

  // Halo colour of a dot by heat: cold cyan, through pale gold, to hot amber-white.
  var COLD = [0.30, 0.82, 1.00], WARM = [1.00, 0.78, 0.38], HOT = [1.00, 0.93, 0.78];
  function heatRGB(h, out) {
    out = out || [0, 0, 0]; h = clamp(h, 0, 1);
    var a, b, t;
    if (h < 0.7) { a = COLD; b = WARM; t = smooth(0, 0.7, h); } else { a = WARM; b = HOT; t = smooth(0.7, 1, h); }
    out[0] = mix(a[0], b[0], t); out[1] = mix(a[1], b[1], t); out[2] = mix(a[2], b[2], t);
    return out;
  }
  // Supernova colour by age 0..1: white, amber, deep red.
  function novaRGB(t, out) {
    out = out || [0, 0, 0]; t = clamp(t, 0, 1);
    if (t < 0.35) { var u = t / 0.35; out[0] = 1; out[1] = mix(0.97, 0.72, u); out[2] = mix(0.90, 0.30, u); }
    else { var v = (t - 0.35) / 0.65; out[0] = mix(1, 0.62, v); out[1] = mix(0.72, 0.10, v); out[2] = mix(0.30, 0.05, v); }
    return out;
  }
  var AMBER = [1.0, 0.70, 0.25];

  // Star sizing: a dot keeps a readable core when the spiral is sparse and dims as dots pack closer than a pixel
  // or two, so 200,000 stars become a glowing disc instead of a white blob. ppu = CSS pixels per circle unit.
  // Keys are about sqrt(pi) = 1.77 units apart on the Kuiper spiral.
  function starStyle(ppu, dpr) {
    var gap = 1.77 * ppu;                                  // CSS px between neighbours
    var core = clamp(gap * 0.16, 0.55, 2.4);               // core radius, CSS px
    var halo = clamp(gap * 0.55, 1.6, 9.0);                // halo radius, CSS px
    var gain = clamp(gap / 6.0, 0.12, 1.0);                // brightness so dense fields do not saturate
    return { core: core, halo: halo, gain: gain, sizePx: Math.max(2, Math.ceil(2 * halo * dpr + 2)) };
  }

  // The supernova. Sizes are in CSS pixels, scaled by the shorter side of the view so it reads the same on any screen.
  // Time constants: flash peaks at 0.06 s, ring reaches 90 percent by 0.55 s, sparks gone by 1.2 s.
  function Nova(seed) { this.rand = rng(seed || 7); this.active = false; this.t = 0; this.sparks = null; this.n = 0; }
  Nova.prototype.start = function (xUnits, yUnits, strength, minDim, reduced) {
    this.x = xUnits; this.y = yUnits; this.s = clamp(strength == null ? 1 : strength, 0, 1);
    this.minDim = minDim; this.reduced = !!reduced; this.t = 0; this.active = this.s > 0;
    var R = minDim; var n = this.reduced ? 0 : Math.round(90 + 290 * this.s);
    var sp = this.sparks = new Float32Array(n * 10);      // ox, oy, vx, vy, life, heatBias, width, curl, birth, brightness
    for (var i = 0; i < n; i++) {
      var a = this.rand() * Math.PI * 2;
      var r = this.rand();
      var speed = R * (0.20 + 1.05 * Math.pow(r, 2.2)) * (0.55 + 0.45 * this.s);   // CSS px / s
      var o = i * 10, r0 = 3 + 9 * this.rand();
      sp[o] = Math.cos(a) * r0; sp[o + 1] = Math.sin(a) * r0;
      sp[o + 2] = Math.cos(a) * speed; sp[o + 3] = Math.sin(a) * speed;
      sp[o + 4] = 0.65 + 0.60 * this.rand();              // life in s
      sp[o + 5] = this.rand() * 0.20;                       // colour bias
      sp[o + 6] = 0.6 + 0.7 * this.rand();                  // width
      sp[o + 7] = (this.rand() - 0.5) * 0.9;                // slight curl
      sp[o + 8] = Math.pow(this.rand(), 2) * 0.07;          // birth delay, s
      var br = this.rand(); sp[o + 9] = 0.45 + 0.55 * br * br; // a few bright sparks, many faint
      if (br > 0.9) { sp[o + 6] *= 1.6; sp[o + 4] += 0.25; }
    }
    this.n = n;
  };
  var DRAG = 2.0;
  Nova.prototype.step = function (dt) {
    if (!this.active) return;
    this.t += dt;
    var sp = this.sparks, n = this.n, k = Math.exp(-DRAG * dt);
    for (var i = 0; i < n; i++) {
      var o = i * 10; if (this.t < sp[o + 8]) continue;
      var vx = sp[o + 2], vy = sp[o + 3], c = sp[o + 7] * dt;
      sp[o] += vx * dt; sp[o + 1] += vy * dt;
      var nvx = (vx - vy * c) * k, nvy = (vy + vx * c) * k;
      sp[o + 2] = nvx; sp[o + 3] = nvy;
    }
    if (this.t > 1.6) this.active = false;
  };
  // Envelope values at the current time. All smooth: no frame jumps from dark to white.
  Nova.prototype.look = function () {
    var t = this.t, s = this.s, R = this.minDim;
    if (this.reduced) {                                    // gentle swell: rise 0.45 s, fall to 1.4 s
      var sw = t < 0.45 ? smooth(0, 0.45, t) : 1 - smooth(0.45, 1.4, t);
      return { flash: 0.55 * sw * s, coreR: R * (0.05 + 0.03 * sw), haloR: R * 0.30, lens: 0.15 * sw * s,
               ringR: R * 0.18, ringW: R * 0.05, ringA: 0.25 * sw * s, ringAge: 0.3, streak: 0 };
    }
    var rise = smooth(0, 0.06, t), fall = Math.exp(-Math.max(0, t - 0.06) / 0.20);
    var flash = s * rise * fall;                           // core brightness 0..1
    var ringP = 1 - Math.exp(-t / 0.30);
    var ringA = s * smooth(0, 0.04, t) * Math.pow(Math.max(0, 1 - t / 1.1), 1.8);
    return {
      flash: 0.75 * flash,
      coreR: R * (0.020 + 0.030 * flash),
      haloR: R * (0.20 + 0.20 * smooth(0, 0.5, t)),
      lens: s * 0.55 * rise * Math.exp(-Math.max(0, t - 0.06) / 0.33),
      ringR: R * (0.03 + 0.42 * ringP),
      ringW: R * (0.008 + 0.030 * ringP),
      ringA: 0.85 * ringA,
      ringAge: clamp(t / 1.0, 0, 1),
      streak: s * 0.7 * rise * Math.exp(-Math.max(0, t - 0.06) / 0.16)
    };
  };
  // Calls fn(x, y, tx, ty, r, g, b, a, widthCss) for every live spark: head at (x,y) CSS px offset from the nova,
  // tail at (tx,ty). Shared so every engine draws the same sparks.
  var tmp = [0, 0, 0];
  Nova.prototype.eachSpark = function (fn) {
    var sp = this.sparks, n = this.n, t = this.t;
    for (var i = 0; i < n; i++) {
      var o = i * 10, life = sp[o + 4], tb = t - sp[o + 8], age = tb / life;
      if (tb <= 0 || age >= 1) continue;
      var vx = sp[o + 2], vy = sp[o + 3], trail = 0.06 + 0.08 * age;
      novaRGB(clamp(age * 1.25 + sp[o + 5], 0, 1), tmp);
      var a = smooth(0, 0.05, tb) * Math.pow(1 - age, 0.8) * (0.6 + 0.4 * this.s) * sp[o + 9];
      fn(sp[o], sp[o + 1], sp[o] - vx * trail, sp[o + 1] - vy * trail, tmp[0], tmp[1], tmp[2], a, sp[o + 6] * (1.3 - 0.6 * age));
    }
  };

  function reducedMotion() {
    try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  // Sky: n faint stars in normalised screen space 0..1 with brightness and size.
  function skyStars(seed, n) {
    var r = rng(seed || 1), out = new Float32Array(n * 4);
    for (var i = 0; i < n; i++) {
      out[i * 4] = r(); out[i * 4 + 1] = r();
      var b = Math.pow(r(), 3.0);
      out[i * 4 + 2] = 0.10 + 0.55 * b;                  // brightness
      out[i * 4 + 3] = 0.5 + 1.1 * b;                    // radius CSS px
    }
    return out;
  }

  // Soft-disc textures for engines that draw with sprites. Dithered so 8-bit gradients do not band.
  function glowCanvas(size, fn) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data, r = rng(size * 31 + 7);
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var u = (x + 0.5) / size * 2 - 1, v = (y + 0.5) / size * 2 - 1;
      var a = fn(u, v);                                  // returns 0..1 (intensity, premultiplied white)
      var q = clamp(a * 255 + (r() - 0.5), 0, 255);
      var o = (y * size + x) * 4; d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = q;
    }
    g.putImageData(img, 0, 0); return c;
  }

  root.KGFXCommon = {
    rng: rng, clamp: clamp, mix: mix, smooth: smooth, heatRGB: heatRGB, novaRGB: novaRGB, AMBER: AMBER,
    starStyle: starStyle, Nova: Nova, reducedMotion: reducedMotion, skyStars: skyStars, glowCanvas: glowCanvas
  };
})(typeof window !== 'undefined' ? window : globalThis);
