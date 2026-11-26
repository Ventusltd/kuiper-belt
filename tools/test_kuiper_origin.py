"""Actual local runtime auth+invalidation, independent client anchor and WebCrypto.
Not C1 certification or a replacement for D1's UI acceptance."""
import hashlib,json,os,secrets,subprocess,sys,tempfile,time,urllib.request,urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright
from kuiper_runtime import bcanon,sha
ROOT=Path(__file__).resolve().parents[1];stage=Path(sys.argv[1]);out=Path(sys.argv[2])
BASE="http://127.0.0.1:8765"
def openssl(*a):return subprocess.check_output(["openssl",*a],stderr=subprocess.DEVNULL,timeout=5)
def post(path,body,origin=BASE):
    req=urllib.request.Request(BASE+path,data=bcanon(body),headers={"Content-Type":"application/json","Origin":origin})
    try:
        with urllib.request.urlopen(req,timeout=45) as r:return r.status,json.load(r)
    except urllib.error.HTTPError as e:return e.code,json.load(e) if e.headers.get_content_type()=="application/json" else {}
def get(path):return json.load(urllib.request.urlopen(BASE+path,timeout=5))
def envelope(family,operation,inputs,generation):
    s=get("/__kuiper/select?mode=machine&family="+family)
    return {"challenge":secrets.token_hex(32),"generation":generation,"query":s["query"],"selection_receipt_sha256":s["receipt_sha256"],
      "request":{"schema":"tacit-b.kuiper-request.v1","operation":operation,"manifest_sha256":s["manifest_sha256"],"keys":[r["key"] for r in s["rows"]],"inputs":inputs}}
def points(lon,lat):return {"crs":"WGS84","unit":"degrees","point_a":{"longitude":0,"latitude":0},"point_b":{"longitude":lon,"latitude":lat}}
def raw_to_der(raw):
    assert len(raw)==64
    parts=[]
    for n in (raw[:32],raw[32:]):
        v=n.lstrip(b"\x00") or b"\x00"
        if v[0]&128:v=b"\x00"+v
        parts.append(bytes([2,len(v)])+v)
    body=b"".join(parts);return bytes([48,len(body)])+body
def main():
    checks=[]
    def check(name,ok):assert ok,name;checks.append(name)
    with tempfile.TemporaryDirectory(prefix="e1-trust-",dir=stage) as tmp:
        tmp=Path(tmp);key=tmp/"private.pem";pub=tmp/"public.der";events=tmp/"events.json";rows=[]
        openssl("genpkey","-algorithm","EC","-pkeyopt","ec_paramgen_curve:prime256v1","-out",str(key));key.chmod(0o600)
        pub.write_bytes(openssl("pkey","-in",str(key),"-pubout","-outform","DER"))
        pin=sha(pub.read_bytes())
        def write_events():
            f=tmp/"events-next";f.write_bytes(bcanon({"schema":"kuiper.local-source-events.v1","events":rows}));f.chmod(0o600);f.replace(events)
        write_events()
        proc=subprocess.Popen([sys.executable,"-B",str(ROOT/"tools/kuiper_research.py"),str(stage/"bonds.zip"),"--runtime-stage",str(stage),"--origin-key",str(key),"--source-events",str(events)],stdout=subprocess.DEVNULL,stderr=None)
        try:
            for _ in range(100):
                if proc.poll() is not None:raise RuntimeError("AUTH_SERVER_EXIT")
                try:get("/__kuiper/select?mode=machine&family=Vg");break
                except OSError:time.sleep(.1)
            else:raise RuntimeError("SERVER_START")
            def verify(wrapper,request):
                assert wrapper["key_id"]==pin
                raw=wrapper["payload"].encode("ascii");sig=bytes.fromhex(wrapper["signature"])
                payload=tmp/"message";payload.write_bytes(raw);signature=tmp/"sig";signature.write_bytes(raw_to_der(sig))
                openssl("dgst","-sha256","-verify",str(pub),"-keyform","DER","-signature",str(signature),str(payload))
                r=json.loads(raw);assert r["challenge"]==request["challenge"] and r["generation"]==request["generation"]
                return r
            e=envelope("Vg","orient",points(0,2),1)
            status,wrap=post("/__kuiper/execute-auth",e);check("fresh_signed_http",status==200)
            r=verify(wrap,e);check("fresh_math",r["state"]=="EXECUTED_INTERNAL" and abs(r["output"]["distance_km"]-222.63898158654712)<1e-8)
            rid=r["pattern_receipt"]["receipt_sha256"]
            bound=r["bound_receipt"];check("B1_context_bound",bound["context"]=={k:e[k] for k in ("challenge","generation","selection_receipt_sha256")} and bound["pattern_receipt"]==r["pattern_receipt"] and bound["receipt_sha256"]==sha(bcanon({k:v for k,v in bound.items() if k!="receipt_sha256"})))
            check("legacy_downgrade_refused",post("/__kuiper/execute",{k:v for k,v in e.items() if k!="challenge"})[0]==403)
            check("duplicate_challenge_refused",post("/__kuiper/execute-auth",e)[0]==400)
            check("cross_origin_refused",post("/__kuiper/execute-auth",e,"https://invalid.example")[0]==403)
            # Execute D1 own exact trusted UI regression before invalidating sources.
            subprocess.run([sys.executable,"-B",str(stage/"d1-auth-browser.py")],check=True,timeout=240,env={**os.environ,"BONDS_ZIP":str(stage/"bonds.zip"),"D1_RUNTIME":"1","D1_BROWSER":"chromium","D1_TRUST_JSON":json.dumps({"spki_hex":pub.read_bytes().hex(),"key_id":pin,"algorithm":"ECDSA-P256-SHA256"})})
            check("D1_actual_authenticated_UI",True)
            Path("evidence/d1-browser.json").replace("evidence/d1-auth-browser.json")
            subprocess.run([sys.executable,"-B",str(stage/"d1-auth-browser.py")],check=True,timeout=240,env={**os.environ,"BONDS_ZIP":str(stage/"bonds.zip"),"D1_RUNTIME":"1","D1_BROWSER":"webkit","D1_TRUST_JSON":json.dumps({"spki_hex":pub.read_bytes().hex(),"key_id":pin,"algorithm":"ECDSA-P256-SHA256"})})
            check("D1_actual_authenticated_WebKit",True)
            Path("evidence/d1-browser.json").replace("evidence/d1-auth-webkit.json")
            # Browser verifies using a key passed independently by the launch harness, not retrieved from server.
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True)
                page=browser.new_page()
                page.goto(BASE+"/editions/202611021201/",wait_until="domcontentloaded")
                js="""async ({req,spki,pin,path,mutate})=>{
                  const bytes=h=>Uint8Array.from(h.match(/../g),x=>parseInt(x,16));
                  const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
                  const res=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(req)});
                  const w=await res.json(); if(mutate==='payload')w.payload=w.payload.replace('EXECUTED_INTERNAL','FORGED');
                  if(mutate==='key')w.key_id='0'.repeat(64);
                  if(mutate==='signature')w.signature='0'.repeat(128);
                  const key=await crypto.subtle.importKey('spki',bytes(spki),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
                  if(w.key_id!==pin||hex(await crypto.subtle.digest('SHA-256',bytes(spki)))!==pin||!await crypto.subtle.verify({name:'Ed25519'},key,bytes(w.signature),new TextEncoder().encode(w.payload)))return {valid:false};
                  const r=JSON.parse(w.payload);return {valid:r.challenge===req.challenge&&r.generation===req.generation,body:r,status:res.status};
                }"""
                for i,mutation in enumerate((None,"payload","key","signature")):
                    q=envelope("Vg","orient",points(-3,0),2+i)
                    v=page.evaluate(js,{"req":q,"spki":pub.read_bytes().hex(),"pin":pin,"path":"/__kuiper/execute-auth","mutate":mutation})
                    check("webcrypto_"+str(mutation),v["valid"]==(mutation is None))
                    if mutation is None:check("browser_math",abs(v["body"]["output"]["distance_km"]-333.95847237982065)<1e-8)
                browser.close()
            b=json.loads((stage/"b1-patterns.json").read_bytes())
            electrical=b["refusals"]["electrical"]["pattern"]["sources"][0]["source"]
            geo=b["results"][0]["pattern"]["sources"][0]["source"]
            def status_query(n):
                q={"challenge":secrets.token_hex(32),"generation":n,"operation":"orient","receipt_sha256":rid}
                code,w=post("/__kuiper/status-auth",q);assert code==200
                return verify(w,q)
            rows.append({"kind":"presentation","source":geo,"field":"display_colour"});write_events()
            check("presentation_preserves_receipt",status_query(10)["state"]=="CURRENT_FOR_PINNED_INPUT")
            rows.append({"kind":"source","source":electrical,"new_blob":"0"*40});write_events()
            r=status_query(11);check("unrelated_electrical_preserves_orient",r["state"]=="CURRENT_FOR_PINNED_INPUT" and r["stale_operations"]==["electrical"])
            q=envelope("Vg","orient",points(0,2),12);code,w=post("/__kuiper/execute-auth",q)
            check("unaffected_real_execution",code==200 and verify(w,q)["state"]=="EXECUTED_INTERNAL")
            q=envelope("Vd","electrical",{},13);code,w=post("/__kuiper/execute-auth",q)
            check("affected_electrical_blocked",code==409 and verify(w,q)["state"]=="STALE_DEPENDENCY")
            # Actual D1 UI holds its accepted receipt while trusted host appends a source event.
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
                page=browser.new_page(viewport={"width":1280,"height":800})
                page.add_init_script("window.__KUIPER_RUNTIME_TRUST__="+json.dumps({"spki_hex":pub.read_bytes().hex(),"key_id":pin,"algorithm":"ECDSA-P256-SHA256"}))
                page.route("**/*",lambda route:route.continue_() if route.request.url.startswith(BASE+"/") or route.request.url.startswith("blob:") else route.abort())
                page.goto(BASE+"/editions/202611021201/",wait_until="domcontentloaded")
                page.wait_for_function("window.KY && KY.inspect().done && KY.modules.computation && KY.hooks.SPACE>0",timeout=90000)
                page.wait_for_function("KY.modules.layers.api.get('computation')?.status === 'OK'",timeout=60000)
                page.locator('[data-menu="wafer"] button').first.click()
                panel=page.locator("#ky-computation");panel.wait_for(state="visible")
                panel.get_by_role("button",name="Select",exact=True).click()
                page.wait_for_function("KY.modules.computation.api.inspect().count===2",timeout=30000)
                for label,value in (("A longitude","0"),("A latitude","0"),("B longitude","0"),("B latitude","2")):
                    panel.get_by_label(label,exact=True).fill(value)
                panel.get_by_role("button",name="Execute ORIENT").click()
                page.wait_for_function("KY.modules.computation.api.inspect().execution==='REPORTED EXECUTED'",timeout=30000)
                accepted=json.loads(panel.locator("textarea[readonly]").input_value())
                rows.append({"kind":"source","source":geo,"new_blob":"0"*40});write_events()
                panel.get_by_role("button",name="Check receipt status").click()
                page.wait_for_function("KY.modules.computation.api.inspect().execution==='STALE HISTORICAL'",timeout=30000)
                historical=json.loads(panel.locator("textarea[readonly]").input_value())
                check("D1_actual_UI_live_stale_status",historical["latest_status"]["state"]=="STALE_HISTORICAL_PRESERVED" and historical["receipt"]==accepted["receipt"])
                browser.close()
            r=status_query(14);check("old_receipt_stale_not_deleted",r["state"]=="STALE_HISTORICAL_PRESERVED" and r["stale_operations"]==["electrical","nearest-orient","orient"])
            q=envelope("Vg","orient",points(0,2),15);code,w=post("/__kuiper/execute-auth",q)
            check("affected_orient_no_execution",code==409 and verify(w,q)["receipt"] is None)
            rows.pop();write_events()
            q=envelope("Vg","orient",points(0,2),16);check("rollback_fails_closed",post("/__kuiper/execute-auth",q)[0]==400)
            out.write_text(json.dumps({"checks":checks,"PASS":len(checks),"FAIL":0,"scope":"LOCAL_TRUSTED_LAUNCHER_AND_OPERATOR_EVENT_REHEARSAL","independent_review":"OPEN","d1_auth_ui":"PRODUCER_TEST_PASS","deployment":"BLOCKED"},sort_keys=True,indent=2))
            print(out.read_text())
        finally:proc.terminate();proc.wait(timeout=5)
if __name__=="__main__":main()
