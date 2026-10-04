/* Kuiper Codex: pure addressing, sampling and bounded inverse queries.
 * Real placements ALWAYS call the unchanged KuiperLaw.place.
 * No coordinates are cached. A rendered sample is temporary, not an address table.
 * Neighbour certificates concern the computed Float64 positions, not exact reals.
 */
(function (root, factory) {
  'use strict';
  var law = root.KuiperLaw;
  if (typeof module === 'object' && module.exports) law = require('./kuiper-law.js');
  var api = factory(law);
  root.KuiperCodexLogic = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (KuiperLaw) {
  'use strict';
  var MAX = 9007199254740992, MAXB = 9007199254740992n;
  var TAU = 2 * Math.PI, EPS = Number.EPSILON;
  var names = ['first','count','turnNumber','wrap','degreesPerKey','power','offset',
    'skipPerSecond','capSeconds','workLines','restSeconds','dotSize','scale'];
  function defaults() {
    return { first:0,count:1,turnNumber:2654435769,wrap:4294967296,degreesPerKey:null,
      power:0.5,offset:0.5,skipPerSecond:600,capSeconds:1209600,
      workLines:100,restSeconds:0,dotSize:3,scale:1 };
  }
  function number(v) { try { return Number(v); } catch (_) { return NaN; } }
  function normalize(raw) {
    var d=defaults(), p={}, r=raw && typeof raw==='object' ? raw : {};
    names.forEach(function(n) {
      var v = Object.prototype.hasOwnProperty.call(r,n) ? r[n] : d[n];
      p[n] = n==='degreesPerKey' && (v===null || v==='' || v===undefined) ? null : number(v);
    });
    p._raw = {};
    names.forEach(function(n){p._raw[n] = r._raw && Object.prototype.hasOwnProperty.call(r._raw,n) ? r._raw[n] : Object.prototype.hasOwnProperty.call(r,n) ? r[n] : d[n];});
    return p;
  }
  function P(p) { return p && p._raw ? p : normalize(p); }
  function integer(n) { return Number.isFinite(n) && Math.floor(n)===n; }
  function keyOK(k) { return integer(k) && k>=0 && k<=MAX; }
  function mod(a,m) { return ((a%m)+m)%m; }
  function modB(a,m) { var r=a%m; return r<0n?r+m:r; }
  function isReal(p) {
    p=P(p); return p.degreesPerKey===null && p.turnNumber===2654435769 && p.wrap===4294967296 && p.power===0.5 && p.offset===0.5;
  }
  function bad(key,reason,p) { return {key:key,x:NaN,y:NaN,r:NaN,deg:NaN,theta:NaN,valid:false,exactKey:keyOK(key),real:isReal(p),reason:reason}; }

  // Interpret a finite typed decimal as a rational. No huge floating product k*turn.
  function rational(v) {
    if (!Number.isFinite(v)) return null;
    var s=String(v), sign=1n;
    if(s[0]==='-'){sign=-1n;s=s.slice(1);}
    var ep=s.split(/e/i), exp=ep.length>1?Number(ep[1]):0, bits=ep[0].split('.');
    var ds=bits.join(''), places=(bits[1]||'').length-exp;
    var n=BigInt(ds)*sign,d=1n;
    if(places>0)d=10n**BigInt(places); else if(places<0)n*=10n**BigInt(-places);
    return {n:n,d:d};
  }
  function fractionNumber(n,d) {
    if(n===0n)return 0;
    var nn=Number(n),dd=Number(d);
    if(Number.isFinite(nn)&&Number.isFinite(dd))return nn/dd;
    // Preserve tiny, finite turns as well as ordinary fractions. Scale numerator
    // and denominator independently so enormous rationals never form Inf/Inf.
    var bn=n.toString(2).length,bd=d.toString(2).length;
    var sn=Math.max(0,bn-54),sd=Math.max(0,bd-54);
    var ratio=Number(n>>BigInt(sn))/Number(d>>BigInt(sd)),exp=sn-sd;
    if(exp < -1074)return ratio*Math.pow(2,exp+1074)*Number.MIN_VALUE;
    return ratio*Math.pow(2,exp);
  }
  function angularSpec(p) {
    if(p.degreesPerKey!==null){
      var q=rational(p.degreesPerKey); if(!q)return null;
      var mm=360n*q.d; return {a:modB(q.n,mm),m:mm};
    }
    if(!Number.isFinite(p.turnNumber)||!Number.isFinite(p.wrap)||p.wrap<=0)return null;
    var a=rational(p.turnNumber), w=rational(p.wrap), m=w.n*a.d;
    if(m<=0n)return null;
    return {a:modB(a.n*w.d,m),m:m};
  }
  function place(key,params) {
    var p=P(params), k=number(key);
    if(!keyOK(k))return bad(k, !Number.isFinite(k)?'The key is not a finite number.':k<0?'Keys start at zero.':k>MAX?'Above 2^53 the computer cannot count every key exactly.':'A key must be a whole number.',p);
    if(!Number.isFinite(p.power)||!Number.isFinite(p.offset))return bad(k,'Power and offset must be finite numbers.',p);
    if(isReal(p)) {
      if(!KuiperLaw || typeof KuiperLaw.place!=='function')return bad(k,'The shared Kuiper law has not loaded.',p);
      var out=KuiperLaw.place(k);
      return Object.assign({},out,{valid:true,exactKey:true,real:true,reason:'',precisionLimited:k>=4503599627370496});
    }
    var base=k+p.offset, r=Math.pow(base,p.power);
    if(!Number.isFinite(r)||r<0)return bad(k,base<0?'This power of a negative distance is not a drawable real radius.':'This radius is infinite or outside the drawing domain.',p);
    var spec=angularSpec(p);
    if(!spec)return bad(k,'The turn must be finite and the wrap size positive.',p);
    var m=modB(BigInt(k)*spec.a,spec.m), turns=fractionNumber(m,spec.m), theta=TAU*turns;
    var x=r*Math.cos(theta), y=r*Math.sin(theta);
    if(!Number.isFinite(x)||!Number.isFinite(y))return bad(k,'This position exceeds finite coordinate precision.',p);
    return {key:k,r:r,turns:turns,deg:turns*360,theta:theta,x:x,y:y,valid:true,exactKey:true,
      real:false,reason:'',precisionLimited:k>=4503599627370496};
  }
  function pattern(p) {
    if(!Number.isFinite(p.restSeconds)||!Number.isFinite(p.skipPerSecond)||!Number.isFinite(p.capSeconds) || p.restSeconds<0||p.skipPerSecond<0||p.capSeconds<0)
      return {valid:false,reason:'Quiet time, its cap and skipped keys per second must be finite and nonnegative.'};
    var v=p.skipPerSecond*Math.min(p.restSeconds,p.capSeconds);
    if(!Number.isFinite(v)||v>MAX)return {valid:false,reason:'This quiet interval skips more keys than can be counted exactly.'};
    var gap=Math.floor(v);
    if(gap===0)return {valid:true,gap:0,work:1,gapB:0n,workB:1n};
    if(!keyOK(p.workLines)||p.workLines<1)return {valid:false,reason:'Lines per work burst must be a positive whole number up to 2^53.'};
    return {valid:true,gap:gap,work:p.workLines,gapB:BigInt(gap),workB:BigInt(p.workLines)};
  }
  function addressForIndex(index,params) {
    var p=P(params), i=number(index), pat=pattern(p);
    if(!keyOK(i)||!keyOK(p.first)||!pat.valid)return NaN;
    return Number(BigInt(p.first)+BigInt(i)+(BigInt(i)/pat.workB)*pat.gapB);
  }
  function indexForAddress(key,p,pat) {
    if(!keyOK(key)||key<p.first)return -1;
    var d=BigInt(key)-BigInt(p.first), cycle=pat.workB+pat.gapB;
    var block=d/cycle, within=d%cycle;
    if(within>=pat.workB)return -1;
    var ix=block*pat.workB+within;
    return ix<BigInt(p.count)?Number(ix):-1;
  }
  function bounds(params) {
    var p=P(params), pat=pattern(p), b={first:p.first,last:NaN,count:p.count,radius:NaN,minRadius:NaN,valid:false,exactKeys:false,reason:''};
    if(!keyOK(p.first)){b.reason='First key must be a whole number from 0 through 2^53.';return b;}
    if(!keyOK(p.count)||p.count<1){b.reason=p.count>MAX?'Above 9 quadrillion the computer cannot count every key exactly.':'How many must be a positive whole number.';return b;}
    if(!pat.valid){b.reason=pat.reason;return b;}
    var end=BigInt(p.first)+BigInt(p.count-1)+(BigInt(p.count-1)/pat.workB)*pat.gapB;
    b.last=Number(end); b.exactKeys=end<=MAXB;
    if(!b.exactKeys){b.reason='The final address exceeds 2^53 after work and quiet time.';return b;}
    var a=place(p.first,p), z=place(b.last,p), rs=[];
    if(a.valid)rs.push(a.r); if(z.valid)rs.push(z.r);
    // Negative offsets can leave an invalid prefix, yet later addresses can draw.
    var crossing=Math.ceil(-p.offset);
    if(crossing>=p.first&&crossing<=b.last){var c=place(crossing,p);if(c.valid)rs.push(c.r);var d=place(crossing+1,p);if(d.valid&&crossing+1<=b.last)rs.push(d.r);}
    if(!rs.length){b.reason=a.reason||z.reason||'No finite radius at the address boundaries.';return b;}
    b.radius=Math.max.apply(null,rs);b.minRadius=Math.min.apply(null,rs);b.valid=true;
    if(!a.valid||!z.valid)b.reason='Some keys have no finite real position with these numbers.';
    return b;
  }
  function budgetOf(value,fallback,max) { var n=number(value); return Number.isFinite(n)&&n>0?Math.max(1,Math.min(max,Math.floor(n))):fallback; }
  function sample(params,budget) {
    var p=P(params), b=bounds(p), out=[]; out.valid=b.valid;out.reason=b.reason;out.total=p.count;
    if(!b.valid)return out;
    var n=Math.min(p.count,budgetOf(budget,1800,20000)), used=new Set();
    function add(i){ if(used.has(i))return;used.add(i);var k=addressForIndex(i,p),q=place(k,p);q.index=i;out.push(q); }
    if(p.count<=n){for(var j=0;j<p.count;j++)add(j);}
    else {
      // One address from each equal-population stratum. With the real square-root
      // law these are equal-area radial strata, without favouring the centre.
      var cnt=BigInt(p.count), nb=BigInt(n);
      for(var t=0;t<n;t++) {
        var lo=BigInt(t)*cnt/nb, hi=BigInt(t+1)*cnt/nb;
        var span=hi-lo, hash=BigInt((Math.imul(t+1,2654435761)>>>0));
        add(Number(lo+(span*hash)/4294967296n));
      }
    }
    out.sampled=p.count>out.length; out.stratification='equal address population; equal area under the real radius law';
    return out;
  }

  // Euclidean floor sum: sum floor((a*i+b)/m), i=0..n-1, exactly in BigInt.
  function floorSum(n,m,a,b) {
    var ans=0n;
    while(true){
      if(a>=m){ans+=(n-1n)*n*(a/m)/2n;a%=m;}
      if(b>=m){ans+=n*(b/m);b%=m;}
      var top=a*n+b;if(top<m)return ans;
      n=top/m;b=top%m;var swap=m;m=a;a=swap;
    }
  }
  function lessCount(lo,hi,a,m,c) {
    if(hi<lo||c<=0n)return 0n;
    var n=hi-lo+1n;if(c>=m)return n;
    var b=modB(a*lo,m);
    return n-(floorSum(n,m,a,b+m-c)-floorSum(n,m,a,b));
  }
  function rangeCount(lo,hi,spec,intervals) {
    var n=0n;
    for(var j=0;j<intervals.length;j++)n+=lessCount(lo,hi,spec.a,spec.m,intervals[j][1]+1n)-lessCount(lo,hi,spec.a,spec.m,intervals[j][0]);
    return n;
  }
  function angularIntervals(x,y,R,spec) {
    var rho=Math.hypot(x,y);
    if(R>=rho||rho===0)return [[0n,spec.m-1n]];
    // Every point in a disk has angular deviation at most asin(R/rho).
    // Inflate for Float64 direction error before converting to integer residues.
    var mid=mod(Math.atan2(y,x)/TAU,1), half=Math.asin(Math.min(1,R/rho))/TAU+64*EPS;
    if(half>=0.5)return [[0n,spec.m-1n]];
    function bound(v,upper) {
      var q=rational(v), prod=q.n*spec.m, v0=prod/q.d;
      if(upper&&prod%q.d!==0n)v0+=1n;
      return v0;
    }
    var pieces=[];
    function push(l,h){var a=bound(l,false)-2n,b=bound(h,true)+2n;if(a<0n)a=0n;if(b>=spec.m)b=spec.m-1n;if(a<=b)pieces.push([a,b]);}
    if(mid-half<0){push(0,mid+half);push(1+mid-half,1);}
    else if(mid+half>=1){push(0,mid+half-1);push(mid-half,1);}
    else push(mid-half,mid+half);
    pieces.sort(function(a,b){return a[0]<b[0]?-1:1;});
    if(pieces.length===2&&pieces[0][1]+1n>=pieces[1][0])return [[pieces[0][0],pieces[1][1]]];
    return pieces;
  }
  function radialRange(x,y,R,p,b) {
    // Certified monotonic inverse for nonnegative bases and positive powers.
    // Other shapes remain drawable but inversion is labelled incomplete.
    if(!(p.power>0)||!Number.isFinite(p.power))return null;
    var rho=Math.hypot(x,y), low=Math.max(0,rho-R), high=rho+R;
    var aa=Math.pow(low,1/p.power)-p.offset, zz=Math.pow(high,1/p.power)-p.offset;
    if(!Number.isFinite(aa)||!Number.isFinite(zz))return null;
    var pad=Math.max(8,64*EPS*Math.max(1,Math.abs(aa),Math.abs(zz)));
    var l=Math.max(b.first,0,Math.ceil(aa-pad)), h=Math.min(b.last,MAX,Math.floor(zz+pad));
    if(l>h)return {lo:1n,hi:0n,certified:true};
    // Integer even powers also have a negative-base branch, not covered here.
    return {lo:BigInt(l),hi:BigInt(h),certified:p.first+p.offset>=0 || !integer(p.power)};
  }
  function emptyNeighbours(reason) {var a=[];a.certified=false;a.truncated=false;a.reason=reason||'';a.candidateCount=0;a.examined=0;return a;}
  function neighbours(x,y,worldRadius,params,budget,options) {
    var p=P(params), b=bounds(p), out=emptyNeighbours(), R=number(worldRadius);
    x=number(x);y=number(y);
    if(!b.valid||!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(R)||R<0){out.reason=b.reason||'The query needs finite coordinates and a nonnegative radius.';return out;}
    var cap=budgetOf(budget,256,10000), opts=options||{}, maxCandidates=budgetOf(opts.maxCandidates,Math.max(4096,cap*32),100000);
    var pat=pattern(p), spec=angularSpec(p), rr=radialRange(x,y,R,p,b);
    if(!spec||!rr){
      out.reason='This shape has no certified radial inverse; showing a bounded address sample.';
      var sparse=sample(p,Math.min(2048,maxCandidates));
      sparse.forEach(function(q){if(q.valid){var d=Math.hypot(q.x-x,q.y-y);if(d<=R&&out.length<cap)out.push(Object.assign({},q,{distance:d}));}});
      out.truncated=p.count>sparse.length;out.examined=sparse.length;return out;
    }
    out.certified=rr.certified;out.reason=rr.certified?'All computed positions in this window were enumerated.':'The negative-base branch is not certified.';
    if(rr.hi<rr.lo)return out;
    var intervals=angularIntervals(x,y,R,spec), total=rangeCount(rr.lo,rr.hi,spec,intervals);
    out.candidateCount=Number(total); var stack=[[rr.lo,rr.hi,total]], examined=0;
    while(stack.length){
      if(examined>=maxCandidates||out.length>=cap){out.truncated=true;out.certified=false;break;}
      var part=stack.pop(), lo=part[0],hi=part[1],n=part[2];if(n===0n)continue;
      if(lo===hi){
        examined++;var key=Number(lo), ix=indexForAddress(key,p,pat);if(ix<0)continue;
        var q=place(key,p);if(!q.valid)continue;
        var dist=Math.hypot(q.x-x,q.y-y);if(dist<=R)out.push(Object.assign({},q,{index:ix,distance:dist}));
      } else {
        var mid=(lo+hi)/2n, nl=rangeCount(lo,mid,spec,intervals);
        if(n-nl>0n)stack.push([mid+1n,hi,n-nl]);if(nl>0n)stack.push([lo,mid,nl]);
      }
    }
    out.examined=examined;
    if(out.truncated)out.reason='The window contains too many candidates to finish within the drawing budget. Zoom closer.';
    out.sort(function(a,b){return a.distance-b.distance||a.key-b.key;});
    return out;
  }
  function pick(x,y,params,options) {
    var p=P(params), opts=options||{}, b=bounds(p);x=number(x);y=number(y);
    if(!b.valid||!Number.isFinite(x)||!Number.isFinite(y))return null;
    var pat=pattern(p), rho=Math.hypot(x,y), best=null, candidate;
    function consider(k){
      if(!keyOK(k)||k<b.first||k>b.last)return;
      var ix=indexForAddress(k,p,pat);if(ix<0)return;
      var q=place(k,p);if(!q.valid)return;
      var d=Math.hypot(q.x-x,q.y-y);
      if(!best||d<best.distance)best=Object.assign({},q,{index:ix,distance:d,exact:d===0,certified:d===0});
    }
    // Exact dot taps first: radial rounding error is bounded by a handful of ulps.
    // This is independent of the rendered sample and stores no point table.
    if(p.power!==0 && Number.isFinite(p.power)){
      candidate=Math.pow(rho,1/p.power)-p.offset;
      if(Number.isFinite(candidate)){
        var center=Math.round(candidate), pad=Math.min(256,Math.max(4,Math.ceil(64*EPS*Math.max(1,Math.abs(candidate)))));
        for(var j=-pad;j<=pad;j++)consider(center+j);
      }
    }
    if(best&&best.distance===0){best.reason='Recovered directly from the address law; exact computed coordinate match.';return best;}
    var R=Number.isFinite(opts.worldRadius)&&opts.worldRadius>=0?opts.worldRadius:2;
    if(best)R=Math.min(R||best.distance,best.distance*(1+64*EPS)+Number.MIN_VALUE);
    R=Math.max(R,Math.max(1,rho)*32*EPS);
    var rounds=budgetOf(opts.maxRounds,3,8), cap=budgetOf(opts.budget,128,4096);
    for(var t=0;t<rounds;t++){
      var near=neighbours(x,y,R,p,cap,{maxCandidates:opts.maxCandidates});
      if(near.length){var q0=near[0];if(!best||q0.distance<best.distance)best=Object.assign({},q0);}
      if(best&&best.distance<=R&&near.certified){best.certified=true;best.exact=best.distance===0;best.reason='Nearest among all computed positions inside a disk containing this point.';return best;}
      if(near.truncated)break;
      R*=4;
    }
    // A free point may be far outside the addressed region. Return a useful,
    // explicitly approximate nearest sample instead of pretending it is exact.
    sample(p,Math.min(128,cap)).forEach(function(q){if(q.valid)consider(q.key);});
    consider(b.first);consider(b.last);
    if(best){best.exact=best.distance===0;best.certified=best.exact;best.reason=best.exact?'Exact computed coordinate match.':'Closest candidate found within the query budget; zoom in to refine.';}
    return best;
  }
  function describe(params) {
    var p=P(params), b=bounds(p), lines=[];
    if(!b.valid)lines.push(b.reason);
    if(isReal(p))lines.push('Real Kuiper: each distance and turn comes from the shared law.');
    else lines.push('Practice rule: these positions use your numbers.');
    if(p.degreesPerKey!==null&&Number.isFinite(p.degreesPerKey)){
      if(mod(p.degreesPerKey,360)===0)lines.push('Every dot points along one line.');
      else if(integer(360/Math.abs(p.degreesPerKey)))lines.push((360/Math.abs(p.degreesPerKey))+' repeated directions.');
    } else if(p.wrap>0&&integer(p.wrap)&&p.wrap<=1000)lines.push('The wrap permits at most '+p.wrap+' directions.');
    if(p.power===1)lines.push('Equal distance steps crowd the centre and leave the rim sparse.');
    if(p.power===0.5)lines.push('Square-root distance keeps area growth in step with address count.');
    if(p.power<0)lines.push('Later keys move inward; key plus offset must stay in the radius domain.');
    if(p.offset<0)lines.push('A negative offset can leave early keys without a real distance.');
    var pat=pattern(p);if(pat.valid&&pat.gap>0)lines.push('After each '+pat.work+' lines, '+pat.gap+' addresses stay empty.');
    if(b.last>=1e14)lines.push('At this scale floating-point coordinates lose fine detail; spacing is not literally constant.');
    if(isReal(p))lines.push('Angles repeat every 4,294,967,296 keys; radius continues to grow.');
    return lines;
  }
  return {defaults:defaults,normalize:normalize,isReal:isReal,place:place,sample:sample,bounds:bounds,
    pick:pick,neighbours:neighbours,addressForIndex:addressForIndex,describe:describe,
    limits:{maxExactKey:MAX,maxCount:MAX,angularPeriod:4294967296},version:'1.0.0'};
});
