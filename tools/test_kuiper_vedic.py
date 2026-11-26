"""T17 browser witness: actual A1 grammar and B1 factory, signed response, no generated code.
D1 production UI not simulated; this transport test is independent of D1's editor.
"""
import json,math,os,secrets,subprocess,sys,tempfile,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
from kuiper_runtime import bcanon,sha
ROOT=Path(__file__).resolve().parents[1];stage=Path(sys.argv[1]);out=Path(sys.argv[2]);BASE="http://127.0.0.1:8765"
COMMAND="Calculate the distance and initial bearing from point A to point B and from point A to point C, then identify the nearer destination."
FIXTURES=[{"A":{"longitude":-3.19,"latitude":55.95},"B":{"longitude":-2.24,"latitude":53.48},"C":{"longitude":-1.55,"latitude":53.8}},
 {"A":{"longitude":151.21,"latitude":-33.87},"B":{"longitude":144.96,"latitude":-37.81},"C":{"longitude":153.03,"latitude":-27.47}},
 {"A":{"longitude":-73.98,"latitude":40.75},"B":{"longitude":-71.06,"latitude":42.36},"C":{"longitude":-77.04,"latitude":38.91}}]
JS="""async ({path,request,spki,pin})=>{
 const bytes=h=>Uint8Array.from(h.match(/../g),x=>parseInt(x,16));
 const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
 request.challenge=hex(crypto.getRandomValues(new Uint8Array(32)));
 const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
 const w=await r.json();
 if(!w.payload)return {status:r.status,valid:false};
 const key=await crypto.subtle.importKey('spki',bytes(spki),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 const valid=w.key_id===pin&&hex(await crypto.subtle.digest('SHA-256',bytes(spki)))===pin&&await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,bytes(w.signature),new TextEncoder().encode(w.payload));
 const b=JSON.parse(w.payload);
 return {status:r.status,valid:valid&&b.challenge===request.challenge&&b.generation===request.generation&&b.auth_schema==='kuiper.runtime-origin.p256.v1',body:b};
}"""
def oracle(a,b):
    lon,lat=map(math.radians,(a["longitude"],a["latitude"]));L,P=map(math.radians,(b["longitude"],b["latitude"]))
    u=(math.cos(lat)*math.cos(lon),math.cos(lat)*math.sin(lon),math.sin(lat))
    v=(math.cos(P)*math.cos(L),math.cos(P)*math.sin(L),math.sin(P))
    dot=lambda x,y:sum(i*j for i,j in zip(x,y))
    cross=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
    return 6378.137*math.atan2(math.hypot(*cross),dot(u,v)),math.degrees(math.atan2(dot(v,(-math.sin(lon),math.cos(lon),0)),dot(v,(-math.sin(lat)*math.cos(lon),-math.sin(lat)*math.sin(lon),math.cos(lat)))))%360
def main():
    checks=[];results=[]
    def check(name,ok):assert ok,name;checks.append(name)
    with tempfile.TemporaryDirectory(prefix="e1-vedic-",dir=stage) as tmp:
        tmp=Path(tmp);key=tmp/"private.pem";events=tmp/"events.json";rows=[]
        subprocess.run(["openssl","genpkey","-algorithm","EC","-pkeyopt","ec_paramgen_curve:prime256v1","-out",str(key)],check=True);key.chmod(0o600)
        pub=subprocess.check_output(["openssl","pkey","-in",str(key),"-pubout","-outform","DER"]);pin=sha(pub)
        def write():
            f=tmp/"next";f.write_bytes(bcanon({"schema":"kuiper.local-source-events.v1","events":rows}));f.chmod(0o600);f.replace(events)
        write()
        proc=subprocess.Popen([sys.executable,"-B",str(ROOT/"tools/kuiper_research.py"),str(stage/"bonds.zip"),"--runtime-stage",str(stage),"--origin-key",str(key),"--source-events",str(events)],stdout=subprocess.DEVNULL)
        try:
            for _ in range(100):
                if proc.poll() is not None:raise RuntimeError("SERVER_EXIT")
                try:urllib.request.urlopen(BASE+"/__kuiper/select?mode=machine&family=Vg",timeout=2).close();break
                except OSError:time.sleep(.1)
            else:raise RuntimeError("SERVER_START")
            for engine in ("chromium","webkit"):
                subprocess.run([sys.executable,"-B",str(stage/"d17-browser.py")],check=True,timeout=240,
                    env={**os.environ,"D1_RUNTIME":"1","D1_VEDIC_RUNTIME":"1","D1_BROWSER":engine,"BONDS_ZIP":str(stage/"bonds.zip"),
                         "D1_TRUST_JSON":json.dumps({"spki_hex":pub.hex(),"key_id":pin,"algorithm":"ECDSA-P256-SHA256"})})
                Path("evidence/d1-browser.json").replace("evidence/d17-"+engine+".json")
                check("actual_D1_VEDIC_"+engine,True)
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True)
                page=browser.new_page();page.goto(BASE+"/editions/202611021201/",wait_until="domcontentloaded")
                generation=0
                def call(path,body):
                    nonlocal generation
                    generation+=1
                    return page.evaluate(JS,{"path":"/__kuiper/"+path,"request":{**body,"generation":generation},"spki":pub.hex(),"pin":pin})
                def preview(text,pts,unit="degrees"):
                    q={"instruction":text,"inputs":{"crs":"WGS84","unit":unit,"points":pts}}
                    z=call("vedic-plan-auth",q);check("signed_preview_"+str(generation),z["status"]==200 and z["valid"])
                    return q,z["body"]["plan"]
                for pts in FIXTURES:
                    q,plan=preview(COMMAND,pts)
                    check("two_ORIENT_plan_"+str(generation),plan["state"]=="PARTIAL_PLAN" and len(plan["steps"])==2)
                    exe={**q,"plan_sha256":plan["plan_sha256"]}
                    z=call("vedic-execute-auth",exe);check("signed_actual_compound_"+str(generation),z["status"]==200 and z["valid"] and z["body"]["state"]=="PARTIAL_EXECUTED")
                    receipt=z["body"]["compound_receipt"]
                    check("comparison_refused_"+str(generation),receipt["comparison"]["value"] is None and receipt["comparison"]["state"]=="REFUSED_NOT_ADMITTED")
                    for step in receipt["steps"]:
                        d,b=oracle(pts[step["from_point"]],pts[step["to_point"]]);v=step["values"]
                        check("oracle_"+step["id"]+"_"+str(generation),abs(d-v["distance_km"])<1e-6 and abs((b-v["initial_bearing_deg"]+180)%360-180)<1e-7)
                    results.append({"plan":plan,"receipt":receipt})
                q,plan=preview("Orient A to C and A to B",FIXTURES[0])
                z=call("vedic-execute-auth",{**q,"plan_sha256":plan["plan_sha256"]})
                check("instruction_changes_order",z["valid"] and z["body"]["state"]=="EXECUTED_INTERNAL" and [x["to_point"] for x in z["body"]["compound_receipt"]["steps"]]==["C","B"])
                check("forged_plan_refused",call("vedic-execute-auth",{**q,"plan_sha256":"0"*64})["status"]==409)
                for command,unit in [("Orient A to B or C","degrees"),("Orient A to B","radians"),("Find nearest 132 kV substations","degrees")]:
                    q,bad=preview(command,FIXTURES[0],unit);check("abstain_"+str(generation),bad["state"]=="ABSTAIN" and not bad["steps"])
                q,plan=preview(COMMAND,FIXTURES[0])
                b=json.loads((stage/"b1-patterns.json").read_bytes());geo=b["results"][0]["pattern"]["sources"][0]["source"]
                rows.append({"kind":"source","source":geo,"new_blob":"0"*40});write()
                z=call("vedic-execute-auth",{**q,"plan_sha256":plan["plan_sha256"]})
                check("stale_compound_refused",z["valid"] and z["status"]==409 and z["body"]["compound_receipt"] is None)
                z=call("status-auth",{"operation":"orient","receipt_sha256":results[0]["receipt"]["receipt_sha256"]})
                check("historical_compound_preserved",z["valid"] and z["body"]["state"]=="STALE_HISTORICAL_PRESERVED")
                browser.close()
            out.write_bytes(bcanon({"checks":checks,"results":results,"comparison":"REFUSED_NOT_ADMITTED","scope":"ACTUAL_BROWSER_TRANSPORT_TO_A1_B1","independent_review":"OPEN"}))
            print(json.dumps({"checks":len(checks),"results":[[x["values"] for x in r["receipt"]["steps"]] for r in results],"sha256":sha(out.read_bytes())}))
        finally:proc.terminate();proc.wait(timeout=5)
if __name__=="__main__":main()
