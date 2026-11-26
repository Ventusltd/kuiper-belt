// Kuiper live data: one admitted snapshot per page, never mix generations.
const dataPaths=['cosmos/wafer.tsv','cosmos/repos.tsv','cosmos/wafer-meta.json','cosmos/standing.tsv','cosmos/pulse.tsv','counter.json'];
const liveMode=new URLSearchParams(location.search).get('live')==='1';
const ROOT=new URL('../../',location.href);
const box=document.querySelector('#kuiper-census');
const decoder=new TextDecoder('utf-8',{fatal:true});
const encoder=new TextEncoder();
const hex=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
const ensure=(test,reason)=>{if(!test)throw Error(reason);};
const sha=/^[a-f0-9]{64}$/;
const commit=/^[a-f0-9]{40}$/;
const decimal=/^(0|[1-9][0-9]*)$/;
const get=async url=>{const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(25000)});ensure(r.ok,'HTTP '+r.status);return await r.arrayBuffer();};
const lines=s=>s.split('\n').filter(l=>l&&l[0]!=='#').map(l=>l.split('\t'));
const num=v=>{ensure(typeof v==='string'&&decimal.test(v),'not exact decimal');return BigInt(v);};
const cacheKey='kuiper-live-v1-202611261800';
const groups=['','thousand','million','billion','trillion','quadrillion','quintillion'];
const low=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function triple(n){let a=[];if(n>=100){a.push(low[Math.floor(n/100)]+' hundred');n%=100;if(n)a.push('and');}if(n>=20)a.push(tens[Math.floor(n/10)]+(n%10?'-'+low[n%10]:''));else if(n)a.push(low[n]);return a.join(' ');}
function spell(s){let n=num(s),a=[],i=0;if(n===0n)return 'zero';while(n){let q=Number(n%1000n);if(q)a.unshift(triple(q)+(groups[i]?' '+groups[i]:''));n/=1000n;i++;}return a.join(', ');}
function show(s,mode){
 const m=s.counter.metrics,t=m.total_historical_line_occurrences,u=m.unique_code_lines,c=u.coverage;
 document.querySelector('#kc-total').textContent=num(t.value).toLocaleString('en-GB');
 document.querySelector('#kc-total-words').textContent=spell(t.value);
 document.querySelector('#kc-unique').textContent=u.value===null?'Unavailable':num(u.value).toLocaleString('en-GB');
 document.querySelector('#kc-unique-words').textContent=u.value===null?'No admitted census':spell(u.value);
 const stale=liveMode&&((Date.now()-Date.parse(s.manifest.coverage.measured_utc)>12*3600000)||mode!=='live');
 box.dataset.state=stale?'stale':mode;
 document.querySelector('#kc-coverage').textContent=(u.status==='partial'?'Partial public census':u.status==='measured'?'Named public census':'Unique count unavailable')+' · '+c.repositories_measured+'/'+c.repositories_target+' repositories · '+c.commits_measured+'/'+c.commits_target+' commits · '+c.redacted_repository_rows+' redacted';
 document.querySelector('#kc-status').textContent=(stale?'STALE · last verified':mode==='live'?'LIVE · verified snapshot':'FIXED EDITION · verified snapshot')+' · '+s.manifest.coverage.measured_utc.replace('T',' ').replace('Z',' UTC');
}
async function validate(manifest, raw){
 ensure(manifest.schema==='kuiper-data-snapshot-v1'&&commit.test(manifest.wafer_commit),'manifest schema');
 ensure(Object.keys(manifest.members).sort().join('|')===dataPaths.slice().sort().join('|'),'member set');
 for(const name of dataPaths){const b=encoder.encode(raw[name]);const d=manifest.members[name];ensure(sha.test(d.sha256)&&b.length===d.bytes&&await hex(b)===d.sha256,'member integrity: '+name);}
 const counter=JSON.parse(raw['counter.json']), meta=JSON.parse(raw['cosmos/wafer-meta.json']), m=counter.metrics, c=m.unique_code_lines.coverage;
 ensure(counter.wafer_commit===manifest.wafer_commit&&counter.as_of_utc===manifest.coverage.indexed_utc,'counter pin');
 for(const name of dataPaths.slice(0,4))ensure(counter.inputs[name]===manifest.members[name].sha256,'counter member binding');
 ensure(m.total_historical_line_occurrences.status==='measured'&&num(m.total_historical_line_occurrences.value)===num(manifest.register.issued_keys),'total counter');
 let total=0n,gap=0n;const repos=lines(raw['cosmos/repos.tsv']),sums=repos.map(()=>0n),seen=new Set();let last=null,named=0,namedCommits=0;
 repos.forEach((r,i)=>{ensure(r.length===3&&Number(r[0])===i,'repository index');if(!r[1].startsWith('unnamed-'))named++;});
 for(const r of lines(raw['cosmos/wafer.tsv'])){ensure(r.length===5,'wafer width');const t=num(r[0]),n=num(r[1]),i=Number(r[2]),g=num(r[4]),id=r[2]+':'+r[3];ensure(Number.isInteger(i)&&i>=0&&i<repos.length&&n>0n&&/^[a-f0-9]{12}$/.test(r[3])&&!seen.has(id),'wafer identity');ensure(last===null?g===0n:t>=last&&g===600n*(t-last>1209600n?1209600n:t-last),'wafer gap');last=t;seen.add(id);sums[i]+=n;total+=n;gap+=g;if(!repos[i][1].startsWith('unnamed-'))namedCommits++;}
 ensure(repos.every((r,i)=>num(r[2])===sums[i]),'repo sums');ensure(total===num(manifest.register.issued_keys)&&gap===num(manifest.register.unissued_keys)&&total+gap===num(manifest.register.address_space)&&BigInt(seen.size)===num(manifest.register.commits)&&BigInt(repos.length)===num(manifest.register.repositories),'register arithmetic');
 ensure(total===BigInt(meta.issued_keys)&&total+gap===BigInt(meta.address_space)&&total+gap<=BigInt(Number.MAX_SAFE_INTEGER),'renderer exact integer range');
 ensure(c.repositories_target===named&&c.commits_target===namedCommits&&c.repositories_measured>=0&&c.repositories_measured<=named&&c.commits_measured>=0&&c.commits_measured<=namedCommits,'coverage');
 const u=m.unique_code_lines, o=m.same_cohort_source_line_occurrences;ensure(u.status===o.status&&['measured','partial','unavailable'].includes(u.status),'counter status');if(u.status==='unavailable')ensure(u.value===null&&o.value===null,'unavailable value');else ensure(num(u.value)<=num(o.value)&&num(o.value)<=total,'unique bounds');
 return {manifest,raw,counter};
}
async function fromPointer(pointer,base,initial=false){
 ensure(pointer.schema==='kuiper-live-pointer-v1'&&sha.test(pointer.sha256)&&commit.test(pointer.wafer_commit),'pointer');
 const manifestBytes=await get(new URL(initial?'manifest.json':'live/snapshots/'+pointer.sha256+'.json',base));ensure(await hex(manifestBytes)===pointer.sha256,'manifest digest');
 const manifest=JSON.parse(decoder.decode(manifestBytes));ensure(manifest.wafer_commit===pointer.wafer_commit,'pointer pin');
 const raw=Object.fromEntries(await Promise.all(dataPaths.map(async name=>{
  const url=initial?new URL(name,base):name==='counter.json'?new URL('live/receipts/'+manifest.members[name].sha256+'.json',ROOT):new URL('https://raw.githubusercontent.com/Ventusltd/kuiper-belt/'+manifest.wafer_commit+'/'+name);
  return [name,decoder.decode(await get(url))];
 })));
 const result=await validate(manifest,raw);return result;
}
export async function snapshot(){
 if(liveMode){try{const p=JSON.parse(decoder.decode(await get(new URL('live/current.json',ROOT))));const s=await fromPointer(p,ROOT);try{localStorage.setItem(cacheKey,JSON.stringify({manifest:s.manifest,raw:s.raw,pointer:p}));}catch(_){}show(s,'live');return s;}catch(e){console.warn('Live snapshot unavailable:',e.message);try{const c=JSON.parse(localStorage.getItem(cacheKey));ensure(c&&c.pointer.wafer_commit===c.manifest.wafer_commit,'cached pin');const s=await validate(c.manifest,c.raw);show(s,'cached');return s;}catch(_){} }}
 const base=new URL('data/initial/',location.href),p=JSON.parse(decoder.decode(await get(new URL('pointer.json',base))));const s=await fromPointer(p,base,true);show(s,'fixed');return s;
}
