// fx-raw.js  The dependency-free light layer: plain WebGL1, three small shader programs, no library.
// Classic script. Needs fx-common.js first. Registers window.KGFXEngines.raw = { create(host) -> fx }.
(function (root) {
  'use strict';
  var C = root.KGFXCommon;

  var DITHER = 'float dn(){return fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5;}';

  // Points: stars, ghosts, sky. Position goes through px = a + v*b on each axis (device pixels, y down).
  var PT_VS =
    'attribute vec2 a_xy;attribute float a_h;attribute float a_k;' +
    'uniform vec4 u_xf;uniform vec2 u_res;uniform float u_size;uniform float u_maxp;uniform float u_mode;uniform float u_gain;uniform float u_time;' +
    'uniform vec3 u_c0;uniform vec3 u_c1;uniform vec3 u_c2;' +
    'varying vec3 v_col;varying float v_a;varying float v_core;' +
    'vec3 heat(float h){vec3 a=mix(u_c0,u_c1,smoothstep(0.0,0.7,h));return mix(a,u_c2,smoothstep(0.7,1.0,h));}' +
    'void main(){vec2 p=vec2(u_xf.x+a_xy.x*u_xf.y,u_xf.z+a_xy.y*u_xf.w);' +
    'gl_Position=vec4(p/u_res*2.0-1.0,0.0,1.0);gl_Position.y=-gl_Position.y;' +
    'float s=u_size;' +
    'if(u_mode<0.5){float h=clamp(a_h,0.0,1.0);s*=1.0+0.7*h*h;v_col=heat(h);v_a=u_gain*(0.85+0.9*h*h);v_core=0.30/(1.0+0.5*h);}' +
    'else if(u_mode<1.5){v_col=vec3(0.55,0.75,0.95);v_a=u_gain;v_core=0.35;}' +
    'else{float tw=0.8+0.2*sin(u_time*(0.7+a_h*2.0)+a_xy.x*91.0+a_xy.y*57.0);s=max(2.0,u_size*a_k);v_col=vec3(0.75,0.85,1.0);v_a=a_h*tw*u_gain;v_core=0.55;}' +
    'gl_PointSize=min(s,u_maxp);' +
    'v_a*=min(1.0,s/2.5);}';
  var PT_FS =
    'precision mediump float;varying vec3 v_col;varying float v_a;varying float v_core;' + DITHER +
    'void main(){vec2 q=gl_PointCoord*2.0-1.0;float d=length(q);if(d>1.0)discard;' +
    'float core=exp(-d*d/(v_core*v_core)*2.2);' +
    'float halo=(1.0-d)*(1.0-d)*exp(-d*2.2);' +
    'vec3 c=(v_col*halo*0.85+mix(v_col,vec3(1.0),0.85)*core)*v_a;' +
    'gl_FragColor=vec4(c+dn()/255.0,1.0);}';

  // Shapes: one quad per shape, the fragment shader draws glow discs, rings with a filling arc, wedges,
  // the target cell and the lens streak, all analytic, so edges are soft at any size.
  var SH_VS =
    'attribute vec2 a_q;uniform vec2 u_c;uniform vec2 u_hs;uniform vec2 u_res;varying vec2 v_p;' +
    'void main(){vec2 p=u_c+a_q*u_hs;v_p=vec2(a_q.x*u_hs.x,-a_q.y*u_hs.y);' +   // v_p: local px, y up
    'gl_Position=vec4(p/u_res*2.0-1.0,0.0,1.0);gl_Position.y=-gl_Position.y;}';
  var SH_FS =
    'precision highp float;varying vec2 v_p;uniform float u_mode;uniform vec4 u_p0;uniform vec4 u_p1;uniform vec4 u_c0;uniform vec4 u_c1;uniform vec2 u_hs;' + DITHER +
    'const float TAU=6.28318530718;' +
    'float arcIn(vec2 p,float s,float w,float soft){if(w>=TAU-0.0001)return 1.0;if(w<=0.0)return 0.0;' +
    ' float a=atan(p.y,p.x);float rc=mod(a-s-0.5*w+3.14159265,TAU)-3.14159265;' +
    ' float L=length(p);float e=soft/max(L,1.0);return smoothstep(-e,e,0.5*w-abs(rc));}' +
    'float segD(vec2 p,vec2 b){float t=clamp(dot(p,b)/dot(b,b),0.0,1.0);return length(p-b*t);}' +
    'void main(){vec3 col=vec3(0.0);float L=length(v_p);' +
    'if(u_mode<0.5){' +                                   // glow: core radius p0.x, halo radius p0.y
    ' float edge=1.0-smoothstep(0.6,1.0,L/min(u_hs.x,u_hs.y));' +
    ' float core=exp(-L*L/(u_p0.x*u_p0.x));float halo=1.0/(1.0+L*L/(u_p0.y*u_p0.y)*6.0)*edge;' +
    ' col=u_c0.rgb*u_c0.a*core+u_c1.rgb*u_c1.a*halo;' +
    '}else if(u_mode<1.5){' +                             // ring: radius p0.x, width p0.y, glow p0.z, lit p0.w; arc start p1.x, sweep p1.y, base alpha p1.z
    ' float d=L-u_p0.x;float line=exp(-d*d/(u_p0.y*u_p0.y));float glow=exp(-d*d/(u_p0.z*u_p0.z));' +
    ' float edge=1.0-smoothstep(0.85,1.0,L/u_hs.x);' +
    ' float fill=arcIn(v_p,u_p1.x,u_p1.y,1.5);float fillG=arcIn(v_p,u_p1.x,u_p1.y,u_p0.z*1.5);' +
    ' col=(u_c0.rgb*u_p1.z*line+u_c1.rgb*u_c1.a*(line*fill+glow*fillG*0.35)+u_c1.rgb*u_p0.w*(glow*0.6+line*0.8))*edge;' +
    '}else if(u_mode<2.5){' +                             // wedge: radius p0.x, edge width p0.y; start p1.x, sweep p1.y; alpha c0.a
    ' float inA=arcIn(v_p,u_p1.x,u_p1.y,1.2);float inR=1.0-smoothstep(u_p0.x-1.0,u_p0.x+1.0,L);' +
    ' vec2 b0=vec2(cos(u_p1.x),sin(u_p1.x))*u_p0.x;vec2 b1=vec2(cos(u_p1.x+u_p1.y),sin(u_p1.x+u_p1.y))*u_p0.x;' +
    ' float de=min(segD(v_p,b0),segD(v_p,b1));float da=abs(L-u_p0.x)+(1.0-inA)*1e4;de=min(de,da);' +
    ' float line=exp(-de*de/(u_p0.y*u_p0.y))+0.35*exp(-de*de/(16.0*u_p0.y*u_p0.y));' +
    ' float fill=inA*inR*(0.10+0.30*pow(L/u_p0.x,2.0));' +
    ' col=u_c0.rgb*u_c0.a*(fill+line*0.9);' +
    '}else if(u_mode<3.5){' +                             // target cell: half side p0.x, line p0.y, glow p0.z, pulse p0.w
    ' vec2 q=abs(v_p)-vec2(u_p0.x);float sd=length(max(q,0.0))+min(max(q.x,q.y),0.0);' +
    ' float line=exp(-sd*sd/(u_p0.y*u_p0.y));float glow=exp(-max(sd,0.0)/u_p0.z)*(1.0-smoothstep(0.7,1.0,L/u_hs.x));' +
    ' float inside=1.0-smoothstep(-1.0,1.0,sd);' +
    ' col=u_c0.rgb*u_c0.a*(line*(0.7+0.3*u_p0.w)+glow*(0.25+0.35*u_p0.w)+inside*(0.06+0.08*u_p0.w));' +
    '}else{' +                                            // lens streak: half length hs.x, half height p0.x
    ' float x=abs(v_p.x)/u_hs.x;float y=v_p.y/u_p0.x;float k=pow(max(0.0,1.0-x),2.5)*exp(-y*y);' +
    ' col=u_c0.rgb*u_c0.a*k;' +
    '}' +
    'gl_FragColor=vec4(col+dn()/255.0,1.0);}';

  // Sparks: streak quads built on the CPU; u runs tail 0 to head 1, v across -1..1.
  var SP_VS =
    'attribute vec2 a_p;attribute vec2 a_uv;attribute vec4 a_c;uniform vec2 u_res;varying vec2 v_uv;varying vec4 v_c;' +
    'void main(){v_uv=a_uv;v_c=a_c;gl_Position=vec4(a_p/u_res*2.0-1.0,0.0,1.0);gl_Position.y=-gl_Position.y;}';
  var SP_FS =
    'precision mediump float;varying vec2 v_uv;varying vec4 v_c;' + DITHER +
    'void main(){float u=v_uv.x;float w=0.30+0.70*u;float a=exp(-v_uv.y*v_uv.y/(w*w)*3.5)*pow(u,2.2);' +
    'float g=exp(-(1.0-u)*(1.0-u)*30.0)*exp(-v_uv.y*v_uv.y*2.2);' +
    'vec3 c=(v_c.rgb*a*0.95+mix(v_c.rgb,vec3(1.0),0.3)*g*1.2)*v_c.a;gl_FragColor=vec4(c+dn()/255.0,1.0);}';

  function compile(gl, vs, fs) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), i;
    for (i = 0; i < n; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
    var a = {}; n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (i = 0; i < n; i++) { var an = gl.getActiveAttrib(p, i).name; a[an] = gl.getAttribLocation(p, an); }
    return { p: p, u: u, a: a };
  }

  function create(host) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block';
    host.appendChild(canvas);
    var attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    var gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    if (!gl) { host.removeChild(canvas); return null; }

    var PT = compile(gl, PT_VS, PT_FS), SH = compile(gl, SH_VS, SH_FS), SP = compile(gl, SP_VS, SP_FS);
    var maxPoint = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1] || 64;
    var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var starXY = gl.createBuffer(), starH = gl.createBuffer(), ghostXY = gl.createBuffer(), skyXY = gl.createBuffer(), skyHK = gl.createBuffer();
    var sparkBuf = gl.createBuffer(), sparkData = new Float32Array(0);
    var starCap = 0, nStars = 0, nGhosts = 0, nSky = 0, ghostCap = 0;

    var W = 1, H = 1, dpr = 1, cssW = 1, cssH = 1, cx = 0, cy = 0, ppu = 10, time = 0;
    var sel = null, tgt = null, rings = [], wedgeS = null, novas = [], reduced = C.reducedMotion();
    var nova = new C.Nova(11);

    var fx = {
      engine: 'raw', canvas: canvas, gl: gl,
      resize: function (w, h, r) { cssW = w; cssH = h; dpr = r || 1; W = canvas.width = Math.max(1, Math.round(w * dpr)); H = canvas.height = Math.max(1, Math.round(h * dpr)); },
      setView: function (x, y, s) { cx = x; cy = y; ppu = s; },
      stars: function (xy, count, heat) {
        nStars = count;
        gl.bindBuffer(gl.ARRAY_BUFFER, starXY);
        if (count > starCap) { starCap = count; gl.bufferData(gl.ARRAY_BUFFER, xy.subarray(0, count * 2), gl.DYNAMIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, starH); gl.bufferData(gl.ARRAY_BUFFER, heat.subarray(0, count), gl.DYNAMIC_DRAW); }
        else { gl.bufferSubData(gl.ARRAY_BUFFER, 0, xy.subarray(0, count * 2));
          gl.bindBuffer(gl.ARRAY_BUFFER, starH); gl.bufferSubData(gl.ARRAY_BUFFER, 0, heat.subarray(0, count)); }
      },
      select: function (x, y) { sel = (x == null) ? null : [x, y]; },
      ghosts: function (xy, count) {
        nGhosts = count; if (!count) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, ghostXY);
        if (count > ghostCap) { ghostCap = count; gl.bufferData(gl.ARRAY_BUFFER, xy.subarray(0, count * 2), gl.DYNAMIC_DRAW); }
        else gl.bufferSubData(gl.ARRAY_BUFFER, 0, xy.subarray(0, count * 2));
      },
      target: function (x, y, hw, pulse) { tgt = (x == null) ? null : [x, y, hw, pulse || 0]; },
      ring: function (r, fill, lit) { rings.push([r, fill, lit]); },
      wedge: function (s, w, r, a) { wedgeS = (s == null) ? null : [s, w, r, a == null ? 1 : a]; },
      supernova: function (x, y, s) { nova.start(x, y, s, Math.min(cssW, cssH), reduced); },
      sky: function (seed) {
        var n = Math.round(Math.min(900, cssW * cssH / 900)), st = C.skyStars(seed, n), xy = new Float32Array(n * 2), hk = new Float32Array(n * 2);
        for (var i = 0; i < n; i++) { xy[i * 2] = st[i * 4]; xy[i * 2 + 1] = st[i * 4 + 1]; hk[i * 2] = st[i * 4 + 2]; hk[i * 2 + 1] = st[i * 4 + 3]; }
        nSky = n; gl.bindBuffer(gl.ARRAY_BUFFER, skyXY); gl.bufferData(gl.ARRAY_BUFFER, xy, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, skyHK); gl.bufferData(gl.ARRAY_BUFFER, hk, gl.STATIC_DRAW);
      },
      frame: function (dt) { time += reduced ? 0 : dt; nova.step(dt); draw(); rings.length = 0; },
      destroy: function () { var e = gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }
    };

    function U(prog, name) { return prog.u[name]; }
    function toDev(x, y) { return [(cx + x * ppu) * dpr, (cy - y * ppu) * dpr]; }

    function points(buf, hbuf, kbuf, n, mode, xf, size, gain) {
      gl.useProgram(PT.p);
      gl.uniform4fv(U(PT, 'u_xf'), xf); gl.uniform2f(U(PT, 'u_res'), W, H); gl.uniform1f(U(PT, 'u_size'), size);
      gl.uniform1f(U(PT, 'u_maxp'), maxPoint); gl.uniform1f(U(PT, 'u_mode'), mode); gl.uniform1f(U(PT, 'u_gain'), gain);
      gl.uniform1f(U(PT, 'u_time'), time);
      gl.uniform3f(U(PT, 'u_c0'), 0.30, 0.82, 1.0); gl.uniform3f(U(PT, 'u_c1'), 1.0, 0.78, 0.38); gl.uniform3f(U(PT, 'u_c2'), 1.0, 0.93, 0.78);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(PT.a.a_xy); gl.vertexAttribPointer(PT.a.a_xy, 2, gl.FLOAT, false, 0, 0);
      if (hbuf && PT.a.a_h >= 0) { gl.bindBuffer(gl.ARRAY_BUFFER, hbuf); gl.enableVertexAttribArray(PT.a.a_h);
        gl.vertexAttribPointer(PT.a.a_h, 1, gl.FLOAT, false, kbuf === hbuf ? 8 : 0, 0); }
      else if (PT.a.a_h >= 0) { gl.disableVertexAttribArray(PT.a.a_h); gl.vertexAttrib1f(PT.a.a_h, 0); }
      if (kbuf && PT.a.a_k >= 0) { gl.bindBuffer(gl.ARRAY_BUFFER, kbuf); gl.enableVertexAttribArray(PT.a.a_k); gl.vertexAttribPointer(PT.a.a_k, 1, gl.FLOAT, false, 8, 4); }
      else if (PT.a.a_k >= 0) { gl.disableVertexAttribArray(PT.a.a_k); gl.vertexAttrib1f(PT.a.a_k, 1); }
      gl.drawArrays(gl.POINTS, 0, n);
      if (PT.a.a_h >= 0) gl.disableVertexAttribArray(PT.a.a_h); if (PT.a.a_k >= 0) gl.disableVertexAttribArray(PT.a.a_k);
    }

    function shape(mode, cxd, cyd, hx, hy, p0, p1, c0, c1) {
      gl.useProgram(SH.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(SH.a.a_q); gl.vertexAttribPointer(SH.a.a_q, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(U(SH, 'u_res'), W, H); gl.uniform2f(U(SH, 'u_c'), cxd, cyd); gl.uniform2f(U(SH, 'u_hs'), hx, hy);
      gl.uniform1f(U(SH, 'u_mode'), mode); gl.uniform4fv(U(SH, 'u_p0'), p0); gl.uniform4fv(U(SH, 'u_p1'), p1 || Z4);
      gl.uniform4fv(U(SH, 'u_c0'), c0); gl.uniform4fv(U(SH, 'u_c1'), c1 || Z4);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    var Z4 = [0, 0, 0, 0], D2R = Math.PI / 180;

    function sparks(nx, ny) {
      var n = nova.n; if (!n) return;
      if (sparkData.length < n * 48) sparkData = new Float32Array(n * 48);
      var d = sparkData, k = 0;
      nova.eachSpark(function (hx, hy, tx, ty, r, g, b, a, w) {
        var x1 = nx + hx * dpr, y1 = ny + hy * dpr, x0 = nx + tx * dpr, y0 = ny + ty * dpr;
        var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy) || 1, wd = Math.max(1.2, w * dpr * 0.75);
        if (w * dpr < 1.4) a *= w * dpr / 1.4;
        var px = -dy / L * wd, py = dx / L * wd;
        x1 += dx / L * wd * 1.5; y1 += dy / L * wd * 1.5; wd *= 1.25;   // round the head a little
        var v = [x0 + px, y0 + py, 0, -1, x0 - px, y0 - py, 0, 1, x1 + px, y1 + py, 1, -1, x1 - px, y1 - py, 1, 1];
        var order = [0, 1, 2, 2, 1, 3];
        for (var j = 0; j < 6; j++) { var o = order[j] * 4; d[k++] = v[o]; d[k++] = v[o + 1]; d[k++] = v[o + 2]; d[k++] = v[o + 3]; d[k++] = r; d[k++] = g; d[k++] = b; d[k++] = a; }
      });
      if (!k) return;
      gl.useProgram(SP.p); gl.uniform2f(U(SP, 'u_res'), W, H);
      gl.bindBuffer(gl.ARRAY_BUFFER, sparkBuf); gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, k), gl.STREAM_DRAW);
      gl.enableVertexAttribArray(SP.a.a_p); gl.vertexAttribPointer(SP.a.a_p, 2, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(SP.a.a_uv); gl.vertexAttribPointer(SP.a.a_uv, 2, gl.FLOAT, false, 32, 8);
      gl.enableVertexAttribArray(SP.a.a_c); gl.vertexAttribPointer(SP.a.a_c, 4, gl.FLOAT, false, 32, 16);
      gl.drawArrays(gl.TRIANGLES, 0, k / 8);
      gl.disableVertexAttribArray(SP.a.a_uv); gl.disableVertexAttribArray(SP.a.a_c);
    }

    function draw() {
      gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      var st = C.starStyle(ppu, dpr), m = Math.min(cssW, cssH) * dpr;
      if (nSky) points(skyXY, skyHK, skyHK, nSky, 2, [0, W, 0, H], 2.2 * dpr, 1);
      var c = toDev(0, 0);
      if (wedgeS) { var R = wedgeS[2] * ppu * dpr;
        shape(2, c[0], c[1], R + 12 * dpr, R + 12 * dpr, [R, 1.1 * dpr, 0, 0], [wedgeS[0] * D2R, Math.max(0, wedgeS[1]) * D2R, 0, 0], [1.0, 0.68, 0.22, 0.9 * wedgeS[3]]); }
      for (var i = 0; i < rings.length; i++) { var rr = rings[i], Rr = rr[0] * ppu * dpr, lit = C.clamp(rr[2], 0, 1);
        shape(1, c[0], c[1], Rr + 24 * dpr, Rr + 24 * dpr, [Rr, 0.9 * dpr, 7 * dpr, lit * 0.9],
          [Math.PI / 2, C.clamp(rr[1], 0, 1) * Math.PI * 2, 0.22, 0],
          [0.45, 0.70, 0.90, 1], [0.70 + 0.3 * lit, 0.90, 1.0 - 0.25 * lit, 0.9]); }
      if (tgt) { var t = toDev(tgt[0], tgt[1]), hw = Math.max(4 * dpr, tgt[2] * ppu * dpr);
        shape(3, t[0], t[1], hw + 22 * dpr, hw + 22 * dpr, [hw, 1.2 * dpr, 7 * dpr, tgt[3]], null, [1.0, 0.80, 0.42, 0.9]); }
      if (nGhosts) points(ghostXY, null, null, nGhosts, 1, [cx * dpr, ppu * dpr, cy * dpr, -ppu * dpr], Math.max(10, st.halo * 2.6 * dpr), 0.45);
      if (nStars) points(starXY, starH, null, nStars, 0, [cx * dpr, ppu * dpr, cy * dpr, -ppu * dpr], st.sizePx, st.gain);
      if (sel) { var s = toDev(sel[0], sel[1]);
        shape(0, s[0], s[1], 30 * dpr, 30 * dpr, [2.6 * dpr, 9 * dpr, 0, 0], null, [1, 0.97, 0.88, 1.0], [1.0, 0.66, 0.22, 0.75]);
        shape(1, s[0], s[1], 16 * dpr, 16 * dpr, [9 * dpr, 0.8 * dpr, 2.5 * dpr, 0], [0, Math.PI * 2, 0, 0], [0, 0, 0, 0], [1.0, 0.72, 0.30, 0.8]); }
      if (nova.active) {
        var L = nova.look(), n = toDev(nova.x, nova.y), col = C.novaRGB(L.ringAge), dd = dpr;
        // wide lens glow first, then the shock ring, sparks, the core and the streak on top
        shape(0, n[0], n[1], L.haloR * 2.2 * dd, L.haloR * 2.2 * dd, [L.coreR * dd, L.haloR * dd, 0, 0], null, [0, 0, 0, 0], [1.0, 0.62, 0.30, 0.55 * L.lens]);
        if (L.ringA > 0.002) shape(1, n[0], n[1], (L.ringR + L.ringW * 3) * dd, (L.ringR + L.ringW * 3) * dd,
          [L.ringR * dd, L.ringW * 0.30 * dd, L.ringW * 0.8 * dd, 0], [0, Math.PI * 2, 0, 0], [0, 0, 0, 0], [col[0], col[1], col[2], L.ringA]);
        sparks(n[0], n[1]);
        var cr = L.coreR * dd;
        shape(0, n[0], n[1], cr * 9, cr * 9, [cr * 0.5, cr * 1.5, 0, 0], null, [1, 0.97, 0.90, 0.85 * L.flash], [1.0, 0.70, 0.36, 0.8 * L.flash]);
        if (L.streak > 0.003) shape(4, n[0], n[1], m * 0.45, 10 * dd, [3.5 * dd, 0, 0, 0], null, [1.0, 0.82, 0.62, 0.55 * L.streak]);
      }
    }
    return fx;
  }

  root.KGFXEngines.raw = { create: create, files: ['fx-common.js', 'fx-raw.js'] };
})(window);
