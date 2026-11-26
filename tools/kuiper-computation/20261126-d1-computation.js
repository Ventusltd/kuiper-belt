/* kuiper module computation, generation 202611261720 (UTC), Apache-2.0
   Local research cartridge. Existing layer registry, renderer and placement law.
   No source bytes or manifest shipped with this module. */
(() => {
"use strict";
const ID="computation", GEN="202611261720";
const requires=["keyPlace","address","wafer","SPACE","repos","cam","o2","redraw","draw","layers"];
let K,H,L,rows=[],bonds=[],status="NOT SELECTED",generation=0,proof=null,stageOperation=null,selectedQuery=null,ui,execution="NOT EXECUTED",requestEpoch=0,manifestPromise=null,unknownKeys=[];
const PIN="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d";
const GROUP={Vg:[1,5],Vn:[15,16],Vd:[24,25,26,27],"Vn+Vg":[1,5,15,16]};
const OPS={Vg:"orient",Vd:"electrical","Vn+Vg":"nearest-orient"};
const PROPS=["producer_needs","producer_standalone","runtime_effects","typed_ports"];
const STATES=["DECLARED","DERIVED","OBSERVED","UNKNOWN"];
const occ=s=>JSON.stringify(["repo","commit","path","blob","first","last"].map(k=>s[k]));
const numberCanon=v=>!Number.isInteger(v)&&Math.abs(v)<0.0001?v.toExponential().replace(/e([+-])(\d)$/,"e$10$2"):JSON.stringify(v);
const canon=v=>typeof v==="number"?numberCanon(v):Array.isArray(v)?"["+v.map(canon).join(",")+"]":v!==null&&typeof v==="object"?"{"+Object.keys(v).sort().map(k=>canon(k)+":"+canon(v[k])).join(",")+"}":JSON.stringify(v).replace(/[^\x00-\x7f]/g,c=>"\\u"+c.charCodeAt(0).toString(16).padStart(4,"0"));
const digest=async raw=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",raw)),x=>x.toString(16).padStart(2,"0")).join("");
const hash=async v=>digest(new TextEncoder().encode(canon(v)));
function require(ok,why){if(!ok)throw Error(why);}
async function trustedManifest(){
 if(!manifestPromise)manifestPromise=(async()=>{
   const r=await fetch("/__kuiper/manifest",{cache:"no-store"});
   require(r.ok,"PINNED MANIFEST UNAVAILABLE");
   const raw=await r.arrayBuffer();require(raw.byteLength<=2000000&&await digest(raw)===PIN,"MANIFEST BYTES MISMATCH");
   const m=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(raw));
   require(m.schema==="vedic.tacit-a.typed-bond-manifest.v1"&&m.admission==="UNCHANGED"&&m.redistribution==="BLOCKED","MANIFEST AUTHORITY");
   require(m.source_entries.length===8&&m.properties.length===32&&m.typed_bonds.length===5,"MANIFEST COHORT");
   return m;
 })().catch(e=>{manifestPromise=null;throw e;});
 return manifestPromise;
}
function property(m,r,name){return m.properties.find(p=>occ(p.source_occurrence)===occ(r.source)&&p.property===name);}
function expected(m,q){
 require(Object.keys(q).every(k=>["mode","family","property_name","state","key_min","key_max"].includes(k)),"QUERY FIELD");
 require(["machine","vedic"].includes(q.mode)&&Object.hasOwn(GROUP,q.family),"QUERY FAMILY");
 require(!q.property_name||PROPS.includes(q.property_name),"QUERY PROPERTY");
 require(!q.state||(q.property_name&&STATES.includes(q.state)),"QUERY STATE");
 for(const k of ["key_min","key_max"])if(q[k]!==undefined)require(/^\d{1,15}$/.test(q[k])&&Number.isSafeInteger(Number(q[k])),"QUERY RANGE");
 require(q.key_min===undefined||q.key_max===undefined||Number(q.key_min)<=Number(q.key_max),"QUERY RANGE");
 const rs=m.source_entries.filter(r=>{
   const k=r.kuiper.key,p=property(m,r,q.property_name);
   const group=q.mode==="machine"?q.family.split("+").includes(r.module_classification.symbol):GROUP[q.family].map(n=>"GG2050-VEDIC-"+String(n).padStart(6,"0")).includes(r.meaning_id);
   return group&&(q.key_min===undefined||k>=Number(q.key_min))&&(q.key_max===undefined||k<=Number(q.key_max))&&(!q.property_name||p&&(!q.state||p.state===q.state));
 }).sort((a,b)=>a.kuiper.key-b.kuiper.key);
 const rows=rs.map(r=>({key:String(r.kuiper.key),meaning:r.meaning_id,module:r.module_classification.symbol,source:r.source,evidence:property(m,r,q.property_name)?.state??r.kuiper.state}));
 const bonds=rows.length?m.typed_bonds.filter(b=>q.family==="Vd"?["voltageDropVolts","lossesWatts"].includes(b.from.split(".")[0]):["Vn","Vn+Vg"].includes(q.family)&&["nearestSubstation","selected_location"].includes(b.from.split(".")[0])).map(b=>({from:b.from,to:b.to,state:"CONDITIONAL",conditions:b.conditions??null})):[];
 return {schema:"kuiper.local-selection.v1",manifest_sha256:PIN,authority:"SELECTION_ONLY_NO_EXECUTION",rows,bonds,bond_scope:"FAMILY_CANDIDATES_NOT_PROVEN_SELECTED_ENDPOINTS",query:q,stage_operation:rows.length===GROUP[q.family].length?(OPS[q.family]??null):null,execution:"NOT_EXECUTED",review:"PENDING",redistribution:"BLOCKED"};
}
async function authenticate(body,q,m){
 const {receipt_sha256,...actual}=body;
 const want=expected(m,q);
 require(canon(actual)===canon(want)&&receipt_sha256===await hash(want),"SELECTION EXACT JOIN / RECEIPT MISMATCH");
 return want;
}
function filterRows(m,rs,expr){
 const unknown=[];
 const selected=rs.filter(r=>{
   const source=m.source_entries.find(x=>String(x.kuiper.key)===String(r.key));
   const checks=expr.map(x=>{
      if(!x.name){require(!x.state,"STATE WITHOUT PROPERTY");return true;}
      require(PROPS.includes(x.name)&&(!x.state||STATES.includes(x.state)),"EXPRESSION");
      const p=property(m,source,x.name);
      if(!p||p.state==="UNKNOWN"&&x.state&&x.state!=="UNKNOWN")return null;
      const match=!x.state||p.state===x.state;
      return x.exclude?!match:match;
   });
   if(checks.includes(false))return false;
   if(checks.includes(null)){unknown.push(r.key);return false;}
   return true;
 });
 return {selected,unknown};
}
const ARCHIVE="e83937c040499a7060b03ca2c4969e4414cdca48cb7f28a3ef9039f002486787";
const DESCRIPTOR="b45e61e955e0d0ddde15495f9be7c3fc4943c3193dd8f318a4249524f2fb5f53";
const shaText=x=>digest(new TextEncoder().encode(x));
const bHash=x=>shaText(canon(x)+"\n");
const shaShape=x=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x);
async function validateRuntime(raw,body,request,attempt,selectionProof){
 const r=body.receipt,pattern={operation:"orient",manifest_sha256:PIN,keys:request.keys};
 require(body.schema==="kuiper.local-execution.v1"&&body.generation===attempt&&body.selection_receipt_sha256===selectionProof,"STALE / WRONG SELECTION RESPONSE");
 require(body.request_sha256===await bHash(request)&&body.pattern_sha256===await bHash(pattern),"REQUEST / PATTERN MISMATCH");
 require(body.state==="EXECUTED_INTERNAL"&&body.review==="PENDING_EXACT_REQUEST_REVIEW"&&body.rights==="BLOCKED"&&body.archive_sha256===ARCHIVE,"RUNTIME STATE / AUTHORITY");
 require(r&&r.schema==="tacit-b.kuiper-execution.v1"&&r.request_sha256===body.request_sha256&&r.pattern_sha256===body.pattern_sha256&&canon(r.pattern)===canon(pattern),"RECEIPT BINDING");
 require(r.state===body.state&&r.admission===true&&r.formal_gate==="ADMITTED_ORIENT_ONLY"&&r.archive_sha256===ARCHIVE&&r.descriptor_sha256===DESCRIPTOR&&r.rights==="BLOCKED"&&r.independent_verification==="PENDING_EXACT_REQUEST_REVIEW","RECEIPT AUTHORITY");
 require(canon(r.nodes)===canon(["distanceKm","initialBearingDeg"])&&shaShape(r.runtime_receipt_sha256)&&shaShape(r.receipt_sha256),"RECEIPT FIELDS");
 const o=body.output;
 require(o&&Object.keys(o).sort().join(",")==="distance_km,initial_bearing_deg"&&canon(o)===canon(r.output)&&Number.isFinite(o.distance_km)&&o.distance_km>=0&&Number.isFinite(o.initial_bearing_deg)&&o.initial_bearing_deg>=0&&o.initial_bearing_deg<360,"OUTPUT PORTS");
 // Preserve Python's exact numeric spellings in the sorted ASCII wire receipt.
 const wire=raw.match(/"receipt":(\{.*\}),"request_sha256":/s)?.[1];
 require(wire&&canon(JSON.parse(wire))===canon(r),"RECEIPT WIRE FORMAT");
 const marker='"receipt_sha256":"'+r.receipt_sha256+'",';
 require(wire.split(marker).length===2&&await shaText(wire.replace(marker,"")+"\n")===r.receipt_sha256,"RECEIPT DIGEST");
 return r;
}
const inspect=()=>({status,count:rows.length,keys:rows.map(r=>r.key),unknownKeys:unknownKeys.slice(),bonds:bonds.length,proof,
  rendering:"Edition 12 WebGL2 base / existing Canvas2D overlay",execution});
function clear(s="NOT SELECTED"){++generation;++requestEpoch;execution="NOT EXECUTED";unknownKeys=[];rows=[];bonds=[];proof=null;stageOperation=null;selectedQuery=null;status=s;if(ui){ui.result.textContent=s;ui.list.replaceChildren();ui.bond.textContent="";ui.stage.disabled=true;ui.execute.disabled=true;ui.stageStatus.textContent="NOT STAGED";ui.preview.value="";}if(K)K.redraw();}
function element(tag,parent,text){const el=document.createElement(tag);if(text)el.textContent=text;parent.append(el);return el;}
function field(parent,label,values){
 const id="ky-computation-"+label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-$/,"");
 const lab=element("label",parent);lab.htmlFor=id;element("span",lab,label);
 const el=element(values?"select":"input",lab);el.id=id;el.setAttribute("aria-label",label);
 if(values)for(const [v,t] of values){const op=element("option",el,t);op.value=v;}
 return el;
}
function key(raw){if(!/^\d+$/.test(String(raw)))throw Error("INVALID KEY");const k=Number(raw);if(!Number.isSafeInteger(k)||k<0||k>=H.SPACE)throw Error("KEY RANGE");return k;}
async function select(q,expr=[]){
  clear("SELECTING");const epoch=generation;
  try{
    const m=await trustedManifest();if(epoch!==generation)return;
    const res=await fetch("/__kuiper/select?"+new URLSearchParams(q),{cache:"no-store"});
    const body=await res.json();if(epoch!==generation)return;
    if(!res.ok)throw Error(body.error||"REFUSED");
    if(body.schema!=="kuiper.local-selection.v1"||body.manifest_sha256!=="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d"||body.authority!=="SELECTION_ONLY_NO_EXECUTION")throw Error("EVIDENCE PIN");
    await authenticate(body,q,m);if(epoch!==generation)return;
    const {selected,unknown}=filterRows(m,body.rows,expr);unknownKeys=unknown;
    if(q.property_name&&q.state&&q.state!=="UNKNOWN"){
      const baseline=expected(m,{...q,state:"UNKNOWN"});
      unknownKeys=[...new Set([...unknownKeys,...filterRows(m,baseline.rows,expr).selected.map(r=>r.key)])].sort((a,b)=>Number(a)-Number(b));
    }
    const next=selected.map(r=>{
      const k=key(r.key), a=H.address(k);
      if(!a||a.silent)throw Error("UNISSUED KEY");
      const name=H.repos[a.c.repo].name.toLowerCase(),source=r.source.repo.toLowerCase();
      if(name!==source&&name!==source.split("/").pop())throw Error("REPO MISMATCH");
      if(!r.source.commit.startsWith(a.c.sha))throw Error("REVISION MISMATCH");
      return {...r,key:k,xy:H.keyPlace(k)};
    });
    if(new Set(next.map(r=>r.key)).size!==next.length)throw Error("DUPLICATE");
    rows=next;bonds=rows.length?body.bonds:[];proof=expr.some(x=>x.name)?null:body.receipt_sha256;stageOperation=expr.some(x=>x.name)?null:body.stage_operation;selectedQuery=body.query;status="SELECTED · "+rows.length+" authenticated keys · NOT EXECUTED"+(expr.some(x=>x.name)?" · LOCAL EXPRESSION / SELECTION ONLY":"");
    if(unknownKeys.length)status+=" · "+unknownKeys.length+" indeterminate, not selected";
    ui.result.textContent=status;ui.stage.disabled=!stageOperation;ui.execute.disabled=stageOperation!=="orient"; if(rows.length)L.set(ID,true);
    for(const r of rows){
      const li=element("li",ui.list);
      const line=element("span",li,r.key+" · "+r.meaning+" · "+r.module+" · "+r.evidence);
      line.style.color=r.evidence==="UNKNOWN"?"#ffcf78":r.evidence==="OBSERVED"?"#a4efb4":"#78e7ef";
      const source=m.source_entries.find(x=>String(x.kuiper.key)===String(r.key));
      element("small",li,PROPS.map(n=>n+": "+(property(m,source,n)?.state??"UNKNOWN")).join(" · "));
      element("small",li," "+r.source.repo+"@"+r.source.commit.slice(0,12)+" "+r.source.path+":"+r.source.first+"–"+r.source.last+" · exact Stars membership MISSING");
    }
    if(unknownKeys.length)element("li",ui.list,"Indeterminate keys (not selected): "+unknownKeys.join(", "));
    ui.bond.textContent=(bonds.length?"Family candidate ports (not proven selected endpoint edges):\n"+bonds.map(b=>b.from+" → "+b.to+" · CONDITIONAL"+(b.conditions?" · "+JSON.stringify(b.conditions):"")).join("\n"):"No conditional bonds selected");
    K.redraw();
  }catch(e){if(epoch===generation)clear("REFUSED · "+e.message);}
}
function draw(ctx){
  if(!L?.get(ID)?.on)return;
  const c=K.cam,w=ctx.canvas.width,h=ctx.canvas.height;
  ctx.save();for(const r of rows){
    const x=(r.xy[0]-c.x)*c.zoom+w/2,y=h/2-(r.xy[1]-c.y)*c.zoom;
    if(x<-10||x>w+10||y<-10||y>h+10)continue;
    ctx.strokeStyle=r.evidence==="UNKNOWN"?"#ffcf78":r.evidence==="OBSERVED"?"#a4efb4":"#2ee6e6";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
  }ctx.restore();
}
function install(k){
 K=k;H=k.hooks;L=k.modules.layers.api;
 const section=document.createElement("section");section.id="ky-computation";section.setAttribute("aria-label","Kuiper research selection");
 const css=element("style",document.head);css.textContent="#ky-computation{padding:8px;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere;color:#d8eeee}#ky-computation label{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0;align-items:center}#ky-computation input,#ky-computation select,#ky-computation button{max-width:100%;min-height:44px;box-sizing:border-box;background:#0b2029;color:#eafafa;border:1px solid #567985;border-radius:4px}#ky-computation fieldset{min-width:0;max-width:100%;box-sizing:border-box}#ky-computation ul{padding-left:18px}#ky-computation small{display:block}#ky-computation pre{white-space:pre-wrap;overflow-wrap:anywhere}";
 const title=element("h3",section,"Computational selection — local research");
 const mode=field(section,"Instrument",[["machine","Machine predicate"],["vedic","VEDIC meaning"]]);
 const family=field(section,"Family / operation",[["Vg","Vg / ORIENT"],["Vn","Vn / nearest only"],["Vn+Vg","Nearest → ORIENT (four-key closure)"],["Vd","Vd / electrical"]]);
 const prop=field(section,"Property",[["","Any"],["producer_needs","Producer needs"],["producer_standalone","Producer standalone"],["runtime_effects","Runtime effects"],["typed_ports","Typed ports"]]);
 const state=field(section,"Evidence",[["","Any"],["DERIVED","Derived"],["OBSERVED","Observed"],["UNKNOWN","Unknown"]]);
 const expression=element("fieldset",section);element("legend",expression,"Additional property expression (local selection only)");
 const propOptions=[["","None"],...PROPS.map(n=>[n,n])],stateOptions=[["","Any"],...STATES.map(n=>[n,n])];
 const inc=field(expression,"Intersect property",propOptions),incState=field(expression,"Intersect state",stateOptions);
 const exc=field(expression,"Exclude property",propOptions),excState=field(expression,"Exclude state",stateOptions);
 element("p",expression,"UNKNOWN is explicit evidence, not false or zero. Additional expressions cannot execute without an exact server proof.");
 const min=field(section,"Minimum key"),max=field(section,"Maximum key");min.inputMode=max.inputMode="numeric";
 const run=element("button",section,"Select");run.type="button";
 const reset=element("button",section,"Reset");reset.type="button";
 const result=element("p",section,"NOT SELECTED");result.setAttribute("role","status");result.setAttribute("aria-live","polite");
 const list=element("ul",section),bond=element("pre",section);
 const label=element("label",section,"Typed inputs (JSON; explicit user declaration)");const input=element("textarea",label);input.rows=4;input.style.cssText="width:100%;box-sizing:border-box;max-width:100%;background:#0b2029;color:#eafafa";
 const stage=element("button",section,"Stage B request");stage.type="button";stage.disabled=true;
 const coords=element("fieldset",section);element("legend",coords,"ORIENT typed WGS84 coordinates (degrees)");
 const coordFields=["A longitude","A latitude","B longitude","B latitude"].map(n=>{const e=field(coords,n);e.type="number";e.step="any";e.inputMode="decimal";return e;});
 const execute=element("button",section,"Execute ORIENT");execute.type="button";execute.disabled=true;
 const stageStatus=element("p",section,"NOT STAGED");stageStatus.setAttribute("role","status");
 const preview=element("textarea",section);preview.readOnly=true;preview.rows=4;preview.setAttribute("aria-label","Local typed request and selection receipt");preview.style.cssText=input.style.cssText;
 ui={result,list,bond,stage,execute,stageStatus,preview};
 function changed(){++requestEpoch;execution="NOT EXECUTED";preview.value="";stageStatus.textContent="INPUT CHANGED · NOT EXECUTED";}
 input.addEventListener("input",changed);for(const e of coordFields)e.addEventListener("input",changed);
 execute.onclick=async()=>{
   const epoch=generation,attempt=++requestEpoch;preview.value="";execution="EXECUTING";stageStatus.textContent="EXECUTING · independent review pending";
   try{
     require(stageOperation==="orient"&&proof&&rows.length===2,"NO ADMITTED ORIENT SELECTION");
     const v=coordFields.map(e=>{require(e.value.trim()!=="","COORDINATE REQUIRED");return Number(e.value);});
     require(v.every(Number.isFinite)&&Math.abs(v[0])<=180&&Math.abs(v[2])<=180&&Math.abs(v[1])<=90&&Math.abs(v[3])<=90,"COORDINATE RANGE");
     const request={schema:"tacit-b.kuiper-request.v1",operation:"orient",manifest_sha256:PIN,keys:rows.map(r=>String(r.key)),inputs:{crs:"WGS84",unit:"degrees",point_a:{longitude:v[0],latitude:v[1]},point_b:{longitude:v[2],latitude:v[3]}}};
     const response=await fetch("/__kuiper/execute",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({request,query:selectedQuery,selection_receipt_sha256:proof,generation:attempt})});
     const raw=await response.text();if(epoch!==generation||attempt!==requestEpoch)return;
     require(raw.length<=1000000,"RESPONSE SIZE");
     require(response.ok,"RUNTIME REFUSED · HTTP "+response.status);
     const body=JSON.parse(raw),r=await validateRuntime(raw,body,request,attempt,proof);
     if(epoch!==generation||attempt!==requestEpoch)return;
     execution="REPORTED EXECUTED";
     stageStatus.textContent="RUNTIME REPORTED EXECUTED · "+body.output.distance_km+" km · "+body.output.initial_bearing_deg+"° · receipt correlated · independent review pending";
     preview.value=JSON.stringify({request,selection_receipt_sha256:proof,generation:attempt,receipt:r,review:"PENDING_EXACT_REQUEST_REVIEW",rights:"BLOCKED"},null,2);
   }catch(e){if(epoch===generation&&attempt===requestEpoch){execution="REFUSED";stageStatus.textContent="REFUSED · "+e.message;}}
 };
 for(const el of [mode,family,prop,state,min,max,reset,run])el.addEventListener("change",()=>{preview.value="";});
 reset.addEventListener("click",()=>{preview.value="";input.value="";});
 run.addEventListener("click",()=>{preview.value="";});
 stage.onclick=async()=>{
   preview.value="";const epoch=generation,attempt=++requestEpoch,raw=input.value;
   try{
     if(!stageOperation||!proof||!rows.length||raw.length>16000)throw Error("NO COMPLETE SUPPORTED SELECTION OR INPUT TOO LARGE");
     const inputs=JSON.parse(raw);if(!inputs||Array.isArray(inputs)||typeof inputs!=="object")throw Error("TYPED INPUT OBJECT REQUIRED");
     const request={schema:"tacit-b.kuiper-request.v1",operation:stageOperation,manifest_sha256:"821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d",keys:rows.map(r=>String(r.key)),inputs};
     const res=await fetch("/__kuiper/receipt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({request,query:selectedQuery,selection_receipt_sha256:proof})});
     const observed=await res.json();
     if(epoch!==generation||attempt!==requestEpoch||raw!==input.value)return;
     if(!res.ok)throw Error(observed.error||"RECEIPT REFUSED");
     require(observed.request_sha256===await bHash(request)&&observed.pattern_sha256===await bHash({operation:request.operation,manifest_sha256:PIN,keys:request.keys}),"STAGED REQUEST BINDING");
     if(epoch!==generation||attempt!==requestEpoch)return;
     preview.value=JSON.stringify({request,request_sha256:observed.request_sha256,pattern_sha256:observed.pattern_sha256,selection_receipt_sha256:proof,execution:"NOT EXECUTED",redistribution:"BLOCKED"},null,2);
     stageStatus.textContent=observed.scope?"HISTORICAL RECEIPT REPORTED · NOT LIVE EXECUTION · output withheld":"STAGED ONLY · NOT EXECUTED";
   }catch(e){if(epoch===generation&&attempt===requestEpoch)stageStatus.textContent="REFUSED · "+e.message;}
 };
 for(const el of [mode,family,prop,state,min,max,inc,incState,exc,excState])el.addEventListener("change",()=>clear("INPUT CHANGED · NOT SELECTED"));
 reset.onclick=()=>{min.value=max.value=prop.value=state.value=inc.value=incState.value=exc.value=excState.value="";for(const e of coordFields)e.value="";clear();mode.focus();};
 run.onclick=()=>{const q={mode:mode.value,family:family.value};for(const [n,e] of [["property_name",prop],["state",state],["key_min",min],["key_max",max]])if(e.value)q[n]=e.value;select(q,[{name:inc.value,state:incState.value,exclude:false},{name:exc.value,state:excState.value,exclude:true}]);};
 K.panels.add("wafer",section,"Computational selection");
 const wait=()=>{if(!L.get(ID)){setTimeout(wait,100);return;}L.register({id:ID,module:ID,load:async()=>{await H.wafer;const res=await fetch("/__kuiper/select?mode=machine&family=Vg"); if(!res.ok)throw Error("Evidence unavailable");const d=await res.json();if(d.manifest_sha256!=="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d")throw Error("Evidence pin");return {placed:d.rows.length,total:d.rows.length,why:"Availability probe only; selection requires authenticated manifest"};},draw});};wait();
 return Object.freeze({inspect,select,clear});
}
window.KY.register({schema:"kuiper.module.v1",id:ID,generation:GEN,requires,provides:[ID],install,inspect});
})();
