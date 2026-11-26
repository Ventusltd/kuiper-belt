/* kuiper module computation, generation 202611261720 (UTC), Apache-2.0
   Local research cartridge. Existing layer registry, renderer and placement law.
   No source bytes or manifest shipped with this module. */
(() => {
"use strict";
const ID="computation", GEN="202611261720";
const requires=["keyPlace","address","wafer","SPACE","repos","cam","o2","redraw","draw","layers"];
let K,H,L,rows=[],bonds=[],status="NOT SELECTED",generation=0,proof=null,ui;
const inspect=()=>({status,count:rows.length,keys:rows.map(r=>r.key),bonds:bonds.length,proof,
  rendering:"Edition 12 WebGL2 base / existing Canvas2D overlay",execution:"NOT EXECUTED"});
function clear(s="NOT SELECTED"){++generation;rows=[];bonds=[];proof=null;status=s;if(ui){ui.result.textContent=s;ui.list.replaceChildren();ui.bond.textContent="";}if(K)K.redraw();}
function element(tag,parent,text){const el=document.createElement(tag);if(text)el.textContent=text;parent.append(el);return el;}
function field(parent,label,values){const lab=element("label",parent,label+" ");const el=element(values?"select":"input",lab);if(values)for(const [v,t] of values){const op=element("option",el,t);op.value=v;}return el;}
function key(raw){if(!/^\d+$/.test(String(raw)))throw Error("INVALID KEY");const k=Number(raw);if(!Number.isSafeInteger(k)||k<0||k>=H.SPACE)throw Error("KEY RANGE");return k;}
async function select(q){
  clear("SELECTING");const epoch=generation;
  try{
    const res=await fetch("/__kuiper/select?"+new URLSearchParams(q),{cache:"no-store"});
    const body=await res.json();if(epoch!==generation)return;
    if(!res.ok)throw Error(body.error||"REFUSED");
    if(body.schema!=="kuiper.local-selection.v1"||body.manifest_sha256!=="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d"||body.authority!=="SELECTION_ONLY_NO_EXECUTION")throw Error("EVIDENCE PIN");
    const next=body.rows.map(r=>{
      const k=key(r.key), a=H.address(k);
      if(!a||a.silent)throw Error("UNISSUED KEY");
      const name=H.repos[a.c.repo].name.toLowerCase(),source=r.source.repo.toLowerCase();
      if(name!==source&&name!==source.split("/").pop())throw Error("REPO MISMATCH");
      if(!r.source.commit.startsWith(a.c.sha))throw Error("REVISION MISMATCH");
      return {...r,key:k,xy:H.keyPlace(k)};
    });
    if(new Set(next.map(r=>r.key)).size!==next.length)throw Error("DUPLICATE");
    rows=next;bonds=body.bonds;proof=body.receipt_sha256;status="SELECTED · "+rows.length+" keys · NOT EXECUTED";
    ui.result.textContent=status;
    for(const r of rows){
      const li=element("li",ui.list);
      element("span",li,r.key+" · "+r.meaning+" · "+r.module+" · "+r.evidence);
      element("small",li," "+r.source.repo+"@"+r.source.commit.slice(0,12)+" "+r.source.path+":"+r.source.first+"–"+r.source.last+" · exact Stars membership MISSING");
    }
    ui.bond.textContent=bonds.map(b=>b.from+" → "+b.to+" · CONDITIONAL").join("\n")||"No conditional bonds selected";
    K.redraw();
  }catch(e){if(epoch===generation)clear("REFUSED · "+e.message);}
}
function draw(ctx){
  if(!L?.get(ID)?.on)return;
  const c=K.cam,w=ctx.canvas.width,h=ctx.canvas.height;
  ctx.save();for(const r of rows){
    const x=(r.xy[0]-c.x)*c.zoom+w/2,y=h/2-(r.xy[1]-c.y)*c.zoom;
    if(x<-10||x>w+10||y<-10||y>h+10)continue;
    ctx.strokeStyle="#2ee6e6";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#2ee6e6";ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
  }ctx.restore();
}
function install(k){
 K=k;H=k.hooks;L=k.modules.layers.api;
 const section=document.createElement("section");section.id="ky-computation";section.setAttribute("aria-label","Kuiper research selection");
 const css=element("style",document.head);css.textContent="#ky-computation{padding:8px;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere;color:#d8eeee}#ky-computation label{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0;align-items:center}#ky-computation input,#ky-computation select,#ky-computation button{max-width:100%;min-height:44px;box-sizing:border-box;background:#0b2029;color:#eafafa;border:1px solid #567985;border-radius:4px}#ky-computation ul{padding-left:18px}#ky-computation small{display:block}#ky-computation pre{white-space:pre-wrap;overflow-wrap:anywhere}";
 const title=element("h3",section,"Computational selection — local research");
 const mode=field(section,"Instrument",[["machine","Machine predicate"],["vedic","VEDIC meaning"]]);
 const family=field(section,"Family / operation",[["Vg","Vg / ORIENT"],["Vn","Vn / nearest"],["Vd","Vd / electrical"]]);
 const prop=field(section,"Property",[["","Any"],["producer_needs","Producer needs"],["producer_standalone","Producer standalone"],["runtime_effects","Runtime effects"],["typed_ports","Typed ports"]]);
 const state=field(section,"Evidence",[["","Any"],["DERIVED","Derived"],["OBSERVED","Observed"],["UNKNOWN","Unknown"]]);
 const min=field(section,"Minimum key"),max=field(section,"Maximum key");min.inputMode=max.inputMode="numeric";
 const run=element("button",section,"Select");run.type="button";
 const reset=element("button",section,"Reset");reset.type="button";
 const result=element("p",section,"NOT SELECTED");result.setAttribute("role","status");
 const list=element("ul",section),bond=element("pre",section);ui={result,list,bond};
 for(const el of [mode,family,prop,state,min,max])el.addEventListener("change",()=>clear("INPUT CHANGED · NOT SELECTED"));
 reset.onclick=()=>{min.value=max.value=prop.value=state.value="";clear();};
 run.onclick=()=>{const q={mode:mode.value,family:family.value};for(const [n,e] of [["property_name",prop],["state",state],["key_min",min],["key_max",max]])if(e.value)q[n]=e.value;select(q);};
 K.panels.add("wafer",section,"Computational selection");
 const wait=()=>{if(!L.get(ID)){setTimeout(wait,100);return;}L.register({id:ID,module:ID,load:async()=>{await H.wafer;return {placed:8,total:8,why:"Pinned local cohort"};},draw});};wait();
 return Object.freeze({inspect,select,clear});
}
Kdummy();
function Kdummy(){window.KY.register({schema:"kuiper.module.v1",id:ID,generation:GEN,requires,provides:[ID],install,inspect});}
})();
