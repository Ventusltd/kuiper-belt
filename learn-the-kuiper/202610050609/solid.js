/* solid.js  Learn the Kuiper: the same rule one dimension up (SPHERE, CUBE, and the flat CIRCLE and SQUARE).
   Plain classic script, no build step, no network, works from file://. Own WebGL point renderer, Canvas 2D fallback.
   Registers as a module: window.KGModules.push({id:'solid', ...}). Exposes window.KGSolid (maths + test hooks).

   The rules (every key k is a whole number; MOD is exact in whole numbers for every k up to 2^53):
     SPHERE  r = CBRT(k)           u = MOD(k x G1, 2^32) / 2^32   v = MOD(k x G2, 2^32) / 2^32
             angle = 2 PI u,  h = 1 - 2 v,  X = r SQRT(1 - h h) COS(angle),  Y = r SQRT(1 - h h) SIN(angle),  Z = r h
     CUBE    s = CBRT(k), the surface of the centred cube of side s, unfolded as a 3 x 2 net of six equal faces:
             col = FLOOR(3u), row = FLOOR(2v), a = 3u - col, b = 2v - row, face = 3 row + col
     CIRCLE  r = SQRT(k), angle = 2 PI MOD(k x G0, 2^32) / 2^32   (the 2D Kuiper rule, G0 = 2654435769)
     SQUARE  s = SQRT(k), the perimeter of the centred square of side s: t = 4 u0, edge = FLOOR(t), a = t - edge
   Defaults G1 = 2447445413 (turn), G2 = 3242174889 (height): the plastic-number pair, chosen by the GPU run
   (solid\out\even.json): round-odd(0.5698402909980532 x 2^32) and round-odd(0.7548776662466927 x 2^32). */
(function () {
  'use strict';
  var T32 = 4294967296, T16 = 65536, LIMIT = 9007199254740992;
  var LIMIT_LINE = 'THAT NUMBER IS TOO LARGE FOR THIS COMPUTER TO SHOW. THE REAL LIMIT HERE IS 9,007,199,254,740,992.';
  var DEF = { G0: 2654435769, G1: 2447445413, G2: 3242174889 };

  /* ---------- exact maths ---------- */
  function mod32(x) { return x - Math.floor(x / T32) * T32; }          // exact for whole x <= 2^53 (power-of-two divide)
  function mulmod32(k, G) {                                              // MOD(k x G, 2^32), exact for whole k, G <= 2^53
    var kl = mod32(k), g = mod32(G), gh = Math.floor(g / T16), gl = g - gh * T16;
    var hi = (kl * gh) % T16;                                            // kl*gh < 2^48: exact
    return (hi * T16 + kl * gl) % T32;                                   // < 2^32 + 2^48: exact
  }
  function rootFn(name) { return name === 'CBRT' ? Math.cbrt : name === 'SQRT' ? Math.sqrt : function (k) { return k; }; }
  function invRoot(name, d) { return name === 'CBRT' ? d * d * d : name === 'SQRT' ? d * d : d; }
  function wholeRoot(k, p) {                                             // FLOOR(k^(1/p)) exactly, k whole <= 2^53
    var n = Math.floor(p === 3 ? Math.cbrt(k) : Math.sqrt(k));
    if (k < 9e15) {                                                      // fast exact path: every power below 2^53 is exact
      var m = Math.floor(p === 3 ? Math.cbrt(k) : Math.sqrt(k)), pm = function (x) { return p === 3 ? x * x * x : x * x; };
      while (m > 0 && pm(m) > k) m--; while (pm(m + 1) <= k) m++; if (pm(m + 1) < 9007199254740992) return m;
    }
    function pw(x) { return p === 3 ? BigInt(x) * BigInt(x) * BigInt(x) : BigInt(x) * BigInt(x); }
    var K = BigInt(k);
    while (n > 0 && pw(n) > K) n--;
    while (pw(n + 1) <= K) n++;
    return n;
  }
  function shellOf(k, root) {                                            // which shell (ring) key k starts in
    if (root === 'CBRT') return wholeRoot(k, 3);
    if (root === 'SQRT') return wholeRoot(k, 2);
    return k;
  }
  function place(shape, k, P, out) {                                     // P: {G0,G1,G2,root}; out: [x,y,z]
    out = out || [0, 0, 0];
    var rr = rootFn(P.root)(k), u, v, h, s, a, b, col, row, f, H, A, B, t, e;
    if (shape === 'sphere') {
      u = mulmod32(k, P.G1) / T32; v = mulmod32(k, P.G2) / T32; h = 1 - 2 * v; s = Math.sqrt(Math.max(0, 1 - h * h));
      a = 2 * Math.PI * u; out[0] = rr * s * Math.cos(a); out[1] = rr * s * Math.sin(a); out[2] = rr * h;
    } else if (shape === 'cube') {
      u = mulmod32(k, P.G1) / T32; v = mulmod32(k, P.G2) / T32;
      col = Math.floor(3 * u); row = Math.floor(2 * v); a = 3 * u - col; b = 2 * v - row; f = row * 3 + col;
      A = rr * (a - 0.5); B = rr * (b - 0.5); H = rr / 2;
      if (f === 0) { out[0] = H; out[1] = A; out[2] = B; } else if (f === 1) { out[0] = -H; out[1] = A; out[2] = B; }
      else if (f === 2) { out[0] = A; out[1] = H; out[2] = B; } else if (f === 3) { out[0] = A; out[1] = -H; out[2] = B; }
      else if (f === 4) { out[0] = A; out[1] = B; out[2] = H; } else { out[0] = A; out[1] = B; out[2] = -H; }
    } else if (shape === 'circle') {
      a = 2 * Math.PI * mulmod32(k, P.G0) / T32; out[0] = rr * Math.cos(a); out[1] = rr * Math.sin(a); out[2] = 0;
    } else {                                                             // square
      t = 4 * mulmod32(k, P.G0) / T32; e = Math.floor(t); a = t - e; H = rr / 2; A = rr * (a - 0.5);
      if (e === 0) { out[0] = A; out[1] = -H; } else if (e === 1) { out[0] = H; out[1] = A; }
      else if (e === 2) { out[0] = -A; out[1] = H; } else { out[0] = -H; out[1] = -A; }
      out[2] = 0;
    }
    return out;
  }
  function measure(shape, k) {                                           // VOLUME or AREA held by the first k keys
    if (shape === 'sphere') return 4 / 3 * Math.PI * k;
    if (shape === 'circle') return Math.PI * k;
    return k;                                                            // cube VOLUME = k, square AREA = k
  }
  function keyFromMeasure(shape, m) {
    if (shape === 'sphere') return Math.round(m * 3 / (4 * Math.PI));
    if (shape === 'circle') return Math.round(m / Math.PI);
    return Math.round(m);
  }
  function outerRadius(shape, root, k) {                                 // farthest a key-k point can be from the centre
    var r = rootFn(root)(k);
    return shape === 'cube' ? r * Math.sqrt(3) / 2 : shape === 'square' ? r * Math.SQRT2 / 2 : r;
  }
  function groupDigits(s) { var neg = s[0] === '-'; if (neg) s = s.slice(1); var p = s.split('.'), i = p[0], o = '';
    while (i.length > 3) { o = ',' + i.slice(-3) + o; i = i.slice(0, -3); } return (neg ? '-' : '') + i + o + (p.length > 1 ? '.' + p[1] : ''); }
  function fmtWhole(n) { return groupDigits(String(Math.round(n))); }
  function fmtReal(x, dp) {
    if (!isFinite(x)) return '0';
    if (Math.abs(x) >= 1e15) { var m = x.toPrecision(15).split('e+'), dg = m[0].replace('.', ''), ex = +m[1]; while (dg.length < ex + 1) dg += '0'; return '≈ ' + groupDigits(dg); }   // 15 significant digits, marked as near
    if (dp === undefined) dp = Math.abs(x) >= 1e6 ? 0 : Math.abs(x) >= 1000 ? 1 : 2;
    return groupDigits(x.toFixed(dp));
  }
  /* parse a typed number. whole: digits only. Returns {ok, v} or {over:true} or {bad:true} */
  function parseTyped(str, whole) {
    str = String(str).replace(/,/g, '').trim();
    if (!str || str === '.' || str === '-') return { bad: true };
    if (whole) {
      if (!/^\d+$/.test(str)) return { bad: true };
      if (BigInt(str) > BigInt(LIMIT)) return { over: true };
      var v = Number(str); return v < 1 ? { bad: true } : { ok: true, v: v };
    }
    if (!/^\d*\.?\d*$/.test(str)) return { bad: true };
    var ip = str.split('.')[0] || '0';
    if (BigInt(ip) > BigInt(LIMIT)) return { over: true };
    var x = Number(str); return isFinite(x) ? { ok: true, v: x } : { bad: true };
  }
  function hash01(i, seed) {                                             // 53-bit fair uniform in [0,1)
    function h32(x) { x = Math.imul(x ^ (x >>> 16), 0x7feb352d); x = Math.imul(x ^ (x >>> 15), 0x846ca68b); return (x ^ (x >>> 16)) >>> 0; }
    var a = h32(i * 2 + 1 + seed), b = h32(i * 2 + 2 + seed * 7919);
    return (a * 2097152 + (b >>> 11)) / 9007199254740992;
  }

  var KGSolid = {mulmod32,mod32,place,shellOf,wholeRoot,measure,keyFromMeasure,outerRadius,parseTyped,fmtWhole,fmtReal,DEF,LIMIT,LIMIT_LINE};
  if(typeof module!=='undefined'&&module.exports)module.exports=KGSolid;
  if(typeof window!=='undefined')window.KGSolid=KGSolid;
})();
/* FIX-solid: three-control teaching shell. Exact domain/membership; approximate XYZ.
 * Legacy pure maths above is preserved from Claude; S1 comparisons pin multiplier order explicitly.
 * This 3D experiment is not the canonical 2D Kuiper law. */
(function(root){'use strict';
const K=typeof module==='object'&&module.exports?module.exports:root.KGSolid;
const MAX=9007199254740991n,TAU=2*Math.PI,F=['a','b','d'];
function icbrt(n){let lo=0n,hi=1n;while(hi**3n<=n)hi*=2n;while(hi-lo>1n){const m=(lo+hi)/2n;if(m**3n<=n)lo=m;else hi=m;}return lo;}
function decimal(t){if(typeof t!=='string'||t.length>128||!/^\d+(?:\.\d*)?$/.test(t))return null;const [a,b='']=t.split('.'),den=10n**BigInt(b.length),num=BigInt(a+b);return num<=MAX*den?{num,den,text:t}:null;}
function integer(t){if(typeof t!=='string'||t.length>128||! /^-?\d+$/.test(t))return null;const n=BigInt(t);return n>=-MAX&&n<=MAX?n:null;}
function format(n,d){let s=n<0n?'-':'';if(n<0n)n=-n;s+=n/d;let r=n%d;if(r)s+='.';while(r){r*=10n;s+=r/d;r%=d;}return s;}
function rootLabel(a){let x=a.num,y=a.den;while(y){const t=x%y;x=y;y=t;}const n=a.num/x,d=a.den/x,u=icbrt(n),v=icbrt(d);if(u**3n===n&&v**3n===d)return '= '+format(u,v);return '≈ '+Math.cbrt(Number(a.num)/Number(a.den)).toPrecision(7).replace(/(\.\d*?[1-9])0+(?=e|$)|\.0+(?=e|$)/g,'$1');}
function divmod(n,c){const r=(n%c+c)%c;return {product:n,q:(n-r)/c,r};}
function point(a,b,d,g1,c,g2,shape='sphere'){
 const turn=divmod(b*g1,c),up=divmod(d*g2,c),shell=icbrt(a.num/a.den),radius=Math.cbrt(Number(a.num)/Number(a.den)),u=Number(turn.r)/Number(c),v=Number(up.r)/Number(c),h=1-2*v,t=TAU*u;
 let x,y,z;
 if(shape==='cube'){const col=Math.floor(3*u),row=Math.floor(2*v),A=radius*(3*u-col-.5),B=radius*(2*v-row-.5),H=radius/2;[x,y,z]=[[H,A,B],[-H,A,B],[A,H,B],[A,-H,B],[A,B,H],[A,B,-H]][row*3+col];}
 else {const rho=radius*Math.sqrt(Math.max(0,1-h*h));x=rho*Math.cos(t);y=rho*Math.sin(t);z=radius*h;}
 return {turn,up,shell,radius,u,v,h,x,y,z,a};
}
function pos(s){return point(s.a,s.b,s.d,s.g1,s.c,s.g2,s.shape);}
function cell(p,c){const bins=c<12n?c:12n;return {shell:p.shell,turn:p.turn.r*bins/c,up:p.up.r*bins/c,bins};}
function lights(t,p,c){const v=cell(p,c);const a=decimal(t.a);return [a.num*p.a.den===p.a.num*a.den,t.turn===v.turn,t.up===v.up];}
function create(){const s={a:decimal('8'),b:0n,d:2n,g1:1n,g2:1n,c:4n,shape:'sphere',linked:false,score:0,hits:0,target:null};next(s);return s;}
function targetFor(s,a,b,d){const p=point(a,b,d,s.g1,s.c,s.g2,s.shape);return {...cell(p,s.c),a:a.text,b:String(b),d:String(d)};}
function next(s){
 const current=cell(pos(s),s.c);let t;
 for(let j=1;j<200;j++){
  const key=BigInt(2+(s.hits*3+j)%12)**3n,stage=s.hits%9;
  let a=s.a,b=s.b,d=s.d;
  if(s.linked){a=decimal(String(key));b=key;d=key;}
  else if(stage<3)a=decimal(String(((current.shell+BigInt(j)-1n)%icbrt(MAX)+1n)**3n));
  else if(stage<6)b=s.b+BigInt(j);
  else d=s.d+BigInt(j);
  // At the domain edge wrap target witnesses into the supported input domain.
  if(b>MAX)b%=MAX;if(d>MAX)d%=MAX;
  if(!a)continue;t=targetFor(s,a,b,d);
  if(!lights(t,pos(s),s.c).every(Boolean)){s.target=t;return t;}
 }
 throw Error('No reachable distinct target');
}
function apply(s,field,text){const v=field==='a'?decimal(text):integer(text);if(v===null)return false;
 if(s.linked){const n=integer(text);if(n===null||n<0n)return false;s.a=decimal(String(n));s.b=n;s.d=n;}
 else s[field]=v;return true;}
function link(s){const was=s.linked;if(!was){const n=s.a.num/s.a.den;s.a=decimal(String(n));s.b=n;s.d=n;}s.linked=!was;next(s);}
function award(s,kind){if(!['typed','roll'].includes(kind)||!lights(s.target,pos(s),s.c).every(Boolean))return 0;const points=kind==='typed'?30:1;s.score+=points;s.hits++;next(s);return points;}
const CSS=`.fs{position:absolute;inset:0;background:#000;color:#fff;font:400 24px/1.15 system-ui,sans-serif;font-variant-numeric:tabular-nums;display:grid;grid-template-rows:32px minmax(0,1fr) 182px 60px;gap:6px;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:none;padding:0 8px max(8px,env(safe-area-inset-bottom));box-sizing:border-box}
.fs *{box-sizing:border-box;touch-action:none;min-width:0}.fs button{color:#fff;background:#000;border:1px solid #fff;border-radius:0;font:inherit;cursor:pointer}.fs-head{display:flex;justify-content:space-between;align-items:center}.fs-head button{border:0}.fs-view{position:relative;min-height:0}.fs canvas{position:absolute;width:100%;height:100%}.fs-target{display:none}.fs-rolls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;min-height:0;overflow:auto}.fs-roll{padding:4px;display:grid;grid-template-rows:minmax(28px,max-content) minmax(36px,max-content) minmax(28px,max-content) minmax(32px,max-content);align-content:center;justify-items:center;gap:2px;overflow:visible}.fs-roll.selected{box-shadow:inset 0 -3px #fff}.fs-label,.fs-result{font-size:24px}.fs-value{font-size:30px;max-width:100%;overflow:visible;white-space:normal;overflow-wrap:anywhere}.fs-result{max-width:100%;overflow:visible;white-space:normal;overflow-wrap:anywhere;opacity:.75}.fs-goal{display:flex;align-items:center;gap:6px;font-size:24px;max-width:100%;overflow:visible;white-space:normal;overflow-wrap:anywhere}.fs-light{display:block;flex:none;width:10px;height:10px;border:1px solid #fff;border-radius:50%;background:#000}.fs-light.on{background:#fff}.fs-panel{display:none;min-height:0}.fs.open{grid-template-rows:32px minmax(0,1fr) 182px 60px 191px}.fs.open .fs-panel{display:block}.fs-working{font-size:24px;line-height:28px;white-space:pre;overflow:auto;min-height:0;opacity:.8}.fs-pad{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(4,44px);gap:5px}.fs-pad button{height:44px}.fs-tools{display:none;position:absolute;right:8px;top:34px;z-index:5;background:#000;border:1px solid #fff;padding:8px;max-width:calc(100% - 16px);max-height:calc(100% - 40px);overflow:auto;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.fs-tools button{min-height:44px}.fs.menu-open .fs-tools{display:grid}.fs-error{position:absolute;left:8px;right:8px;top:34px;background:#000;z-index:4;font-size:24px;max-height:112px;overflow:auto}.fs-error:empty{display:none}
@media(min-aspect-ratio:1/1){.fs{grid-template-columns:minmax(250px,1fr) 300px;grid-template-rows:32px minmax(0,1fr);gap:6px}.fs-head{grid-column:1/-1}.fs-view{grid-column:1;grid-row:2}.fs-rolls{grid-column:2;grid-row:2;grid-template-columns:1fr;grid-template-rows:repeat(3,minmax(min-content,1fr));gap:4px;overflow:auto}.fs-roll{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(26px,max-content) minmax(32px,max-content);gap:0 4px;padding:2px}.fs-label{grid-column:1;grid-row:1}.fs-value{font-size:28px;grid-column:1;grid-row:2}.fs-result{grid-column:2;grid-row:2}.fs-goal{grid-column:2;grid-row:1}.fs-working{display:none}.fs.open{grid-template-columns:minmax(250px,1fr) 300px 212px;grid-template-rows:32px minmax(0,1fr)}.fs.open .fs-working{display:none}.fs.open .fs-panel{grid-column:3;grid-row:2;align-self:end}.fs:not(.open) .fs-view{margin-bottom:60px}.fs:not(.open) .fs-working{display:block;grid-column:1;grid-row:2;align-self:end;height:56px}}
`;
let active=null;
function open(host,opts={}){
 if(active)active.close();const s=create(),listeners=[],rollers={},motions=new Map();let selected='a',draft=null,dirty=false,dead=false,raf=0,settle=0,pendingRoll=false,burst=0,viewScale=4,audio=null,muted=false,yaw=.45,pitch=.25,drag=null,lastFrame=0;
 function el(tag,cls,text,parent){const e=document.createElement(tag);e.className=cls||'';if(text!==undefined)e.textContent=text;if(parent)parent.appendChild(e);return e;}
 const style=el('style','',CSS,host),box=el('div','fs',undefined,host),head=el('div','fs-head',undefined,box),score=el('span','','0',head),menu=el('button','','…',head),view=el('div','fs-view',undefined,box),canvas=el('canvas','',undefined,view),ctx=canvas.getContext('2d'),target=el('div','fs-target','',view),row=el('div','fs-rolls',undefined,box),panel=el('div','fs-panel',undefined,box),tools=el('div','fs-tools',undefined,box),working=el('div','fs-working','',box),error=el('div','fs-error','',box),pad=el('div','fs-pad',undefined,panel);
 menu.setAttribute('aria-label','Tools');
 box.appendChild(panel);
 function on(e,t,fn,opt){e.addEventListener(t,fn,opt);listeners.push([e,t,fn,opt]);}
 function button(t,fn){const b=el('button','',t,tools);on(b,'click',fn);return b;}
 const linked=button('LINK',()=>{stop();link(s);draft=null;dirty=false;render();});
 button('4',()=>preset(1n,1n,4n));button('12',()=>preset(1n,1n,12n));button('2³²',()=>preset(2447445413n,3242174889n,4294967296n));
 const shape=button('CUBE',()=>{stop();s.shape=s.shape==='sphere'?'cube':'sphere';shape.textContent=s.shape==='sphere'?'CUBE':'SPHERE';draft=null;dirty=false;next(s);render();});
 const mute=button('♪',()=>{muted=!muted;mute.textContent=muted?'×♪':'♪';});button('×',()=>{box.classList.remove('open');box.classList.remove('menu-open');draft=null;dirty=false;render();});
 function unlock(){try{const A=root.AudioContext||root.webkitAudioContext;if(!A)return;if(!audio)audio=new A();if(audio.state==='suspended')audio.resume();}catch(_){}}
 function sound(hit){if(muted)return;try{unlock();if(!audio)return;[0,...(hit?[4,7]:[])].forEach((n,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.08;o.frequency.value=220*Math.pow(2,n/12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.025,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.32);});}catch(_){}}
 function stop(){motions.clear();clearTimeout(settle);settle=0;pendingRoll=false;}
 function preset(g1,g2,c){stop();s.g1=g1;s.g2=g2;s.c=c;s.hits=0;draft=null;dirty=false;next(s);render();}
 function textValue(f){return f==='a'?s.a.text:String(s[f]);}
 function preview(){if(draft===null)return s;const t={...s};return apply(t,selected,draft)?t:null;}
 function render(){const shown=preview(),p=shown?pos(shown):null;F.forEach((f,i)=>{const r=rollers[f];if(!r)return;r.box.classList.toggle('selected',selected===f);r.value.textContent=draft!==null&&selected===f?draft||'·':textValue(f);r.label.textContent=f==='a'?'CBRT':f==='b'?'MOD ↺':'MOD ↕';r.result.textContent=p?(f==='a'?rootLabel(shown.a):'→ '+(f==='b'?p.turn.r:p.up.r)):'·';r.light.classList.toggle('on',!!p&&lights(s.target,p,s.c)[i]);});score.textContent=String(s.score);linked.style.textDecoration=s.linked?'underline':'none';linked.textContent=s.linked?'KEY':'LINK';
 const t=s.target;function goalPart(n){const lo=(n*s.c+t.bins-1n)/t.bins,hi=((n+1n)*s.c+t.bins-1n)/t.bins;return hi-lo===1n?String(lo):lo+'…'+(hi-1n);}rollers.a.goal.textContent=rootLabel(decimal(t.a)).replace(/^= /,'');rollers.b.goal.textContent=goalPart(t.turn);rollers.d.goal.textContent=goalPart(t.up);target.textContent='';

 working.textContent=p?p.turn.product+' = '+p.turn.q+' × '+s.c+' + '+p.turn.r+'\n'+p.up.product+' = '+p.up.q+' × '+s.c+' + '+p.up.r:'';working.title=p?'MOD('+shown.b+' × '+s.g1+', '+s.c+') = '+p.turn.r+'; MOD('+shown.d+' × '+s.g2+', '+s.c+') = '+p.up.r:'';

 }
 function edit(f){stop();selected=f;draft=null;dirty=false;box.classList.add('open');error.textContent='';render();}
 function reward(kind){const n=award(s,kind);if(n){burst=kind==='typed'?1:0;sound(kind==='typed');}render();return n;}
 function key(k){unlock();stop();if(k==='Enter'||k==='OK'){if(dirty&&draft!==null){const before=selected==='a'?s.a:s[selected];if(apply(s,selected,draft)){const changed=selected==='a'?before.num*s.a.den!==s.a.num*before.den:before!==s[selected];draft=null;dirty=false;error.textContent='';if(changed)reward('typed');sound(false);}}render();return;}
 if(k==='Escape'){draft=null;dirty=false;error.textContent='';render();return;}
 if(k==='ArrowUp'||k==='ArrowDown'){if(roll(selected,k==='ArrowUp'?1:-1))schedule();return;}
 if(k.length!==1&&!['Backspace','C'].includes(k))return;
 box.classList.add('open');if(draft===null)draft='';dirty=true;
 if(k==='C')draft='';else if(k==='Backspace')draft=draft.slice(0,-1);else if(k==='-')draft=draft.startsWith('-')?draft.slice(1):'-'+draft;else if(draft.length<129)draft+=k;
 let over=false;if(/^-?\d+(?:\.\d*)?$/.test(draft)){const [a,b='']=draft.replace('-','').split('.');over=BigInt(a+b)>MAX*10n**BigInt(b.length);}
 error.textContent=over?'THAT NUMBER IS TOO LARGE FOR THIS COMPUTER TO SHOW. THE REAL LIMIT HERE IS 9,007,199,254,740,991.':'';render();}
 function roll(f,steps,fine=false){draft=null;dirty=false;error.textContent='';selected=f;let value;const before=textValue(f);
 if(f==='a'&&!s.linked){const scale=fine?10n:1n,den=s.a.den*scale;let n=s.a.num*scale+BigInt(steps)*s.a.den;if(n<0n)n=0n;if(n>MAX*den)n=MAX*den;value=format(n,den);}
 else {let n=(s.linked?BigInt(s.a.text):s[f])+BigInt(steps);if(n>MAX)n=MAX;if(n<(s.linked?0n:-MAX))n=s.linked?0n:-MAX;value=String(n);}
 apply(s,f,value);render();const changed=before!==textValue(f);pendingRoll=pendingRoll||changed;return changed;}
 function schedule(){clearTimeout(settle);settle=setTimeout(()=>{settle=0;if(!motions.size&&pendingRoll){pendingRoll=false;reward('roll');}},180);}
 F.forEach(f=>{const b=el('button','fs-roll',undefined,row),label=el('span','fs-label','',b),value=el('span','fs-value','',b),result=el('span','fs-result','',b),goalBox=el('span','fs-goal','',b),light=el('span','fs-light','',goalBox),goal=el('span','','',goalBox);b.setAttribute('aria-label',f==='a'?'Distance cube-root input':f==='b'?'Turn MOD input':'Height MOD input');rollers[f]={box:b,label,value,result,light,goal};
 on(b,'focus',()=>{if(selected!==f){draft=null;dirty=false;}selected=f;render();});on(b,'wheel',e=>{e.preventDefault();if(!e.deltaY)return;stop();if(roll(f,e.deltaY<0?1:-1))schedule();},{passive:false});
 on(b,'pointerdown',e=>{unlock();e.preventDefault();clearTimeout(settle);selected=f;draft=null;dirty=false;b.setPointerCapture(e.pointerId);motions.set(e.pointerId,{f,y:e.clientY,start:e.clientY,t:performance.now(),last:performance.now(),v:0,carry:0,moved:false,held:false});render();});
 on(b,'pointermove',e=>{const m=motions.get(e.pointerId);if(!m)return;const now=performance.now(),dy=m.y-e.clientY,dt=Math.max(1,now-m.last);m.v=dy/dt;m.carry+=dy;m.moved=m.moved||Math.abs(e.clientY-m.start)>5;m.held=m.held||now-m.last>=2000;const n=Math.trunc(m.carry/14);if(n){m.changed=roll(f,n,m.held)||m.changed;m.carry-=n*14;}m.last=now;m.y=e.clientY;});
 on(b,'pointerup',e=>{const m=motions.get(e.pointerId);if(!m)return;motions.delete(e.pointerId);const age=performance.now()-m.last;if(!m.moved&&performance.now()-m.t<450&&!pendingRoll){edit(f);return;}if(age<120&&Math.abs(m.v)>.45){m.inertia=true;m.v*=18;m.last=performance.now();motions.set(e.pointerId,m);}else if(pendingRoll&&!motions.size)schedule();});
 on(b,'pointercancel',e=>{motions.delete(e.pointerId);clearTimeout(settle);pendingRoll=false;});
 on(b,'lostpointercapture',e=>{const m=motions.get(e.pointerId);if(m&&!m.inertia){motions.delete(e.pointerId);clearTimeout(settle);pendingRoll=false;}});
 on(b,'click',e=>{if(e.detail===0)edit(f);});
 });
 ['7','8','9','Backspace','4','5','6','C','1','2','3','-','0','.','OK'].forEach(k=>{const b=el('button','',k==='Backspace'?'⌫':k,pad);if(k==='OK')b.style.gridColumn='span 2';on(b,'click',()=>key(k));});
 on(menu,'click',()=>{stop();box.classList.toggle('menu-open');render();});
 on(root,'keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key.length===1||['Enter','Escape','ArrowUp','ArrowDown','Backspace'].includes(e.key)){e.preventDefault();key(e.key);}});
 on(box,'touchmove',e=>e.preventDefault(),{passive:false});
 on(root,'blur',()=>{stop();draft=null;dirty=false;render();});
 on(canvas,'pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
 on(canvas,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.01;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag.y)*.01));drag.x=e.clientX;drag.y=e.clientY;});
 on(canvas,'pointerup',()=>{drag=null;});on(canvas,'pointercancel',()=>{drag=null;});
 function draw(time){if(dead)return;const dt=Math.min(40,Math.max(0,time-lastFrame));lastFrame=time;
 motions.forEach((m,id)=>{if(!m.inertia)return;m.carry+=m.v*dt/16;m.v*=Math.exp(-dt/140);const n=Math.trunc(m.carry/14);if(n){roll(m.f,n);m.carry-=n*14;}if(Math.abs(m.v)<.15){motions.delete(id);if(!motions.size)schedule();}});
 const rect=view.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height),dpr=Math.min(2,root.devicePixelRatio||1);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const show=preview()||s,p=pos(show),t=s.target,need=Math.max(p.radius,Math.cbrt(Number(decimal(t.a).num)/Number(decimal(t.a).den)),1)*1.06;viewScale=need>viewScale?need:viewScale+(need-viewScale)*Math.min(1,dt/100);const reserve=0,R=Math.max(10,Math.min(w-16,h-16)/2),cx=w/2,cy=reserve+(h-reserve)/2,sc=R/viewScale;
 function project(x,y,z){const X=x*Math.cos(yaw)-y*Math.sin(yaw),Y=x*Math.sin(yaw)+y*Math.cos(yaw);return [cx+X*sc,cy-(z*Math.cos(pitch)-Y*Math.sin(pitch))*sc];}
 function path(points,col,width=1,fill=false){ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);if(i)ctx.lineTo(...q);else ctx.moveTo(...q);});ctx.strokeStyle=col;ctx.lineWidth=width;if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}ctx.stroke();}
 function spherePoint(r,u,v){const z=1-2*v,q=Math.sqrt(Math.max(0,1-z*z));return [r*q*Math.cos(TAU*u),r*q*Math.sin(TAU*u),r*z];}
 function wire(r,col){if(s.shape==='cube'){const v=[];for(let i=0;i<8;i++)v.push([i&1?r/2:-r/2,i&2?r/2:-r/2,i&4?r/2:-r/2]);[[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]].forEach(e=>path([v[e[0]],v[e[1]]],col));}else{for(let plane=0;plane<3;plane++){const pts=[];for(let i=0;i<=80;i++){const a=TAU*i/80,c=r*Math.cos(a),d=r*Math.sin(a);pts.push(plane===0?[c,d,0]:plane===1?[c,0,d]:[0,c,d]);}path(pts,col);}}}
 const lit=lights(t,p,s.c);wire(p.radius,'rgba(255,255,255,.22)');wire(Math.cbrt(Number(decimal(t.a).num)/Number(decimal(t.a).den)),lit[0]?'#8ce6ff':'rgba(255,209,154,.65)');
 if(s.shape==='sphere'){
 const pts=[],bins=Number(t.bins),u=Number(t.turn)/bins,v=Number(t.up)/bins,r=Math.cbrt(Number(decimal(t.a).num)/Number(decimal(t.a).den));
 for(let i=0;i<=12;i++)pts.push(spherePoint(r,u+i/12/bins,v));for(let i=0;i<=12;i++)pts.push(spherePoint(r,u+1/bins,v+i/12/bins));for(let i=12;i>=0;i--)pts.push(spherePoint(r,u+i/12/bins,v+1/bins));for(let i=12;i>=0;i--)pts.push(spherePoint(r,u,v+i/12/bins));path(pts,'#ffd19a',2,'rgba(255,209,154,.32)');
 const lat=[],lon=[];for(let i=0;i<=80;i++){lat.push(spherePoint(p.radius,i/80,p.v));lon.push(spherePoint(p.radius,p.u,i/80));}path(lat,lit[2]?'#8ce6ff':'rgba(255,255,255,.16)');path(lon,lit[1]?'#8ce6ff':'rgba(255,255,255,.16)');
 }else {const bins=Number(t.bins),u0=Number(t.turn)/bins,u1=(Number(t.turn)+1)/bins,v0=Number(t.up)/bins,v1=(Number(t.up)+1)/bins,r=Math.cbrt(Number(decimal(t.a).num)/Number(decimal(t.a).den));
 for(let face=0;face<6;face++){const col=face%3,row=Math.floor(face/3),lo=Math.max(u0,col/3),hi=Math.min(u1,(col+1)/3),bot=Math.max(v0,row/2),top=Math.min(v1,(row+1)/2);if(lo>=hi||bot>=top)continue;
 const pts=[[lo,bot],[hi,bot],[hi,top],[lo,top]].map(([u,v])=>{const A=r*(3*u-col-.5),B=r*(2*v-row-.5),H=r/2;return [[H,A,B],[-H,A,B],[A,H,B],[A,-H,B],[A,B,H],[A,B,-H]][face];});path(pts,'#ffd19a',2,'rgba(255,209,154,.32)');}}
 const xy=project(p.x,p.y,p.z);path([[0,0,0],[p.x,p.y,p.z]],'rgba(255,255,255,.35)');ctx.globalAlpha=draft===null?1:.55;const glow=ctx.createRadialGradient(...xy,1,...xy,18);glow.addColorStop(0,'#fff');glow.addColorStop(.2,'#8ce6ff');glow.addColorStop(1,'rgba(140,230,255,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(...xy,18,0,TAU);ctx.fill();ctx.globalAlpha=1;
 if(burst>0){ctx.strokeStyle='rgba(255,209,154,'+burst+')';ctx.lineWidth=2;for(let i=0;i<28;i++){const a=TAU*i/28,l=(1-burst)*R;ctx.beginPath();ctx.moveTo(xy[0]+Math.cos(a)*l,xy[1]+Math.sin(a)*l);ctx.lineTo(xy[0]+Math.cos(a)*(l+25),xy[1]+Math.sin(a)*(l+25));ctx.stroke();}burst=Math.max(0,burst-dt/900);}
 raf=requestAnimationFrame(draw);
 }
 function close(){if(dead)return;dead=true;stop();cancelAnimationFrame(raf);listeners.forEach(([e,t,fn,opt])=>e.removeEventListener(t,fn,opt));if(audio)audio.close();box.remove();style.remove();if(active===api)active=null;}
 const api={state:s,close,set:o=>{if(o.key!==undefined)api.setKey(o.key);if(o.G1!==undefined)s.g1=BigInt(o.G1);if(o.G2!==undefined)s.g2=BigInt(o.G2);next(s);render();},controls:{rollers,menu,pad,linked,shape,working,error,canvas,box,view},render,info:()=>({renderer:'canvas2d',drawn:1,scale:viewScale}),setKey:k=>{stop();const a=decimal(String(k)),n=integer(String(k));if(!a||n===null||n<0n)return false;s.a=a;s.b=n;s.d=n;draft=null;dirty=false;render();return true;},setShape:sh=>{if(!['sphere','cube'].includes(sh))return false;s.shape=sh;next(s);render();return true;}};
 active=api;render();raf=requestAnimationFrame(draw);return api;
}
K.steering={MAX,icbrt,decimal,integer,rootLabel,divmod,point,pos,cell,lights,create,next,targetFor,apply,link,award};K.open=open;K.close=()=>active&&active.close();K.instance=()=>active;
if(typeof window==='object')(window.KGModules=window.KGModules||[]).push({id:'solid',label:'SPHERE',open,close:K.close});
})(typeof window==='object'?window:globalThis);
