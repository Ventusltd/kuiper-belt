#!/usr/bin/env python3
"""Build Edition 13 from the immutable Edition 12. Do not edit any old edition."""
import hashlib, json, pathlib, shutil, sys, subprocess
from kuiper_snapshot import assemble, read_pin, verify_bundle, canonical, digest

ROOT=pathlib.Path(__file__).resolve().parents[1]
OLD="202611021201"
STAMP="202611261800"
PIN="f7a4cb9e3a764a72b7133bb275bb5387ea083be2"
RECEIPT="47c5a3338d04d97f302317d0e53ca3141cd4ea053326700f58b26e5ca1160edc"
def write(path,body):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(body)
def jsonwrite(path,obj): write(path,canonical(obj))
def replace_once(s,old,new):
    if s.count(old)!=1: raise ValueError("expected one occurrence of "+old[:100])
    return s.replace(old,new)
def make_live(pin, counter, previous=None):
    data=read_pin(ROOT,pin)
    prev=read_pin(ROOT,previous) if previous else None
    manifest,members=assemble(data,pin,counter,prev)
    blob=canonical(manifest); verify_bundle(blob,members)
    if manifest["coverage"]["missed"]!=0: raise ValueError("standing census incomplete; retain previous pointer")
    key=digest(blob)
    ptr=dict(schema="kuiper-live-pointer-v1",sha256=key,wafer_commit=pin)
    write(ROOT/"live"/"snapshots"/(key+".json"),blob)
    write(ROOT/"live"/"receipts"/(digest(counter)+".json"),counter)
    jsonwrite(ROOT/"live"/"current.json",ptr)
    return ptr,blob,members
def build(receipt):
    receipt=pathlib.Path(receipt).read_bytes()
    if digest(receipt)!=RECEIPT: raise ValueError("candidate receipt changed")
    p=ROOT/"editions"/STAMP
    if p.exists(): raise ValueError("edition already exists")
    shutil.copytree(ROOT/"editions"/OLD,p)
    # These are evidence of the OLD edition, not screenshots of the new one.
    shutil.rmtree(p/"proof");(p/"proof").mkdir()
    ptr,manifest,members=make_live(PIN,receipt)
    initial=p/"data"/"initial"
    for name,b in members.items(): write(initial/name,b)
    write(initial/"manifest.json",manifest);jsonwrite(initial/"pointer.json",ptr)
    for path in ["census.js","census.css","census.html"]:
        shutil.copyfile(ROOT/"tools"/"edition13"/path,p/path)
    h=(p/"index.html").read_text()
    h=h.replace("Kuiper Edition 12","Kuiper Edition 13").replace("KUIPER EDITION 6","KUIPER EDITION 13")
    h=replace_once(h,"const KY_EDITION = '202611021201';","const KY_EDITION = '202611261800';")
    h=replace_once(h,"<body>","<body>\n"+(p/"census.html").read_text())
    h=replace_once(h,"</head>",'<link rel="stylesheet" href="census.css">\n</head>')
    h=replace_once(h,"<script type=\"module\">","<script type=\"module\">\nimport {snapshot} from './census.js';\nconst admittedSnapshot=snapshot();\nadmittedSnapshot.catch(e=>{document.querySelector('#kc-status').textContent='REFUSED: '+e.message;});")
    h=replace_once(h,"Promise.all([tsv('../../cosmos/repos.tsv'), tsv('../../cosmos/wafer.tsv')])","admittedSnapshot.then(s=>['cosmos/repos.tsv','cosmos/wafer.tsv'].map(n=>s.raw[n].split('\\n').filter(l=>l&&l[0]!=='#').map(l=>l.split('\\t'))))")
    h=replace_once(h,"s.y0 = Math.max(s.y0, bar.getBoundingClientRect().bottom + 8);","s.y0 = Math.max(s.y0, bar.getBoundingClientRect().bottom + 8, document.querySelector('#kuiper-census').getBoundingClientRect().bottom + 8);")
    h=h.replace("vec3 bg = vec3(0.035,0.047,0.075), dust = vec3(0.79,0.83,0.90)","vec3 bg = vec3(0.045,0.045,0.05), dust = vec3(0.78,0.79,0.80)")
    (p/"index.html").write_text(h)
    apps=json.loads((p/"data/apps.json").read_text())
    items=[a for a in apps["apps"] if a["id"]=="pipeline-news"]
    assert len(items)==1
    items[0]["link"]="https://globalgrid2050.com/uk_renewables_pipeline/"
    jsonwrite(p/"data/apps.json",apps)
    eds=json.loads((p/"data/editions.json").read_text())
    for e in eds["editions"]: e["pointer"]=False
    eds["editions"].append(dict(number=13,stamp=STAMP,published="2026-11-26",status="published",evidence="editions/README.md",key="edition:"+STAMP,cut_utc="2026-11-26T17:02:58Z",path="../"+STAMP+"/",pointer=True))
    jsonwrite(p/"data/editions.json",eds)
    layers=json.loads((p/"data/layers.json").read_text());layers["edition"]=STAMP
    for layer in layers["layers"]:
        if layer["id"]=="editions":
            b=(p/"data/editions.json").read_bytes();layer["source"].update(sha256=digest(b),bytes=len(b),features=len(eds["editions"]))
        if layer["id"] in ("periods","repos"): layer["source"]["engine"]="admitted snapshot"
    jsonwrite(p/"data/layers.json",layers)
    mods=json.loads((p/"modules.json").read_text());mods["edition"]=STAMP
    # Preserve the sealed old See Through collection as the source identity.
    # Re-project only its validated substation indices, not historic wafer keys.
    st=next(m for m in mods["modules"] if m["id"]=="see-through")
    old=p/st["path"];s=old.read_text()
    s=replace_once(s,"GEN = '202611021026', EDITION = '202611021201'","GEN = '202611261800', EDITION = '202611261800'")
    s=replace_once(s,"if (j.edition !== EDITION || j.edition !== KY.edition) throw new Error('data cut for edition ' + j.edition + ', page ' + KY.edition);","if (j.edition !== '202611021201' || EDITION !== KY.edition) throw new Error('source edition mismatch');")
    s=replace_once(s,"if (st.space !== H.SPACE) throw new Error('SPACE ' + H.fmt(st.space) + ' ≠ wafer ' + H.fmt(H.SPACE));","if (!Number.isSafeInteger(H.SPACE) || H.SPACE <= 0 || j.law.nrule !== 20000 || j.law.nsub !== 5800) throw new Error('projection domain'); st.space=H.SPACE;")
    s=replace_once(s,"var g = f && f.geometry, k = g && g.key, pr = (f && f.properties) || {};","var g = f && f.geometry, pr = (f && f.properties) || {}; if (!Number.isInteger(pr.sub) || pr.sub < 0 || pr.sub >= 5800 || pr.sub !== stars.length) {bad++;return;} var k=Number((BigInt(2*pr.sub+1)*BigInt(H.SPACE))/40000n);")
    s=replace_once(s,"st.placed = stars.length; st.total = fs.length; st.named = named;","if (bad || stars.length!==5800) throw new Error('incomplete projection'); st.placed = stars.length; st.total = fs.length; st.named = named;")
    new=p/"modules"/"202611261800-see-through.js";new.write_text(s);old.unlink()
    st.update(generation=STAMP,path="modules/"+new.name,sha256=digest(new.read_bytes()),bytes=new.stat().st_size)
    st["data"]["edition"]=STAMP;st["data"]["built_by"]="Edition 13 integer re-projection from sealed Edition 12 feature collection"
    jsonwrite(p/"modules.json",mods)
    (p/"README.md").write_text("# Kuiper Edition 13\n\nUnified Edition 12 interface plus original-style prominent exact counters. The dated route uses the immutable initial snapshot; the stable editions route uses live=1 and a single validated refresh. The unique count is a partial public census: 299,425 distinct nonblank source lines, 83 of 95 named repositories, 7,502 of 16,719 indexed commits. The historical text occurrence total is 97,540,883,985. Private/redacted and unavailable history is not claimed. See Through re-projects 5,800 source features using exact integer arithmetic; original feature identity and attribution remain. Old editions are unchanged; historical keys and drift evidence retain their original provenance. No TACIT research branch is included. File/menu and other modules inherited from Edition 12. Browser evidence is generated separately for this edition.\n")
    files=sorted(x for x in p.rglob("*") if x.is_file() and "proof" not in x.relative_to(p).parts)
    (p/"proof"/"edition-sha256.txt").write_text("".join(digest(x.read_bytes())+"  "+str(x.relative_to(p))+"\n" for x in files))
    # Promote only after browser test in the candidate workflow.
    idx=ROOT/"editions"/"index.html"
    h=idx.read_text().replace(OLD+"/",STAMP+"/?live=1")
    h=h.replace("location.replace('"+STAMP+"/?live=1' + location.search + location.hash);","const q=new URLSearchParams(location.search);q.set('live','1');location.replace('"+STAMP+"/?'+q.toString()+location.hash);")
    idx.write_text(h)
    path=ROOT/"editions"/"README.md";s=path.read_text().replace("**Kuiper Edition 12 (202611021201)**","**Kuiper Edition 13 (202611261800)**")
    anchor="- **Kuiper Edition 12**"
    s=s.replace(anchor,"- **Kuiper Edition 13** (202611261800): [open fixed edition](202611261800/) · [live](202611261800/?live=1) · [README](202611261800/README.md). Exact counters, original-inspired visual style and preserved FILE menu.\n"+anchor,1);path.write_text(s)

if __name__=="__main__":
    if sys.argv[1]=="build":build(sys.argv[2])
    elif sys.argv[1]=="refresh":
        p=ROOT/"live"/"current.json"
        old=json.loads(p.read_text())["wafer_commit"] if p.exists() else None
        make_live(sys.argv[2],pathlib.Path(sys.argv[3]).read_bytes(),old)
    else: raise ValueError("unknown command")
