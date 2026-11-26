"""Real browser transport through pinned D1 cartridge to E1/B1; C1 independent review separate."""
import hashlib,json,sys,subprocess,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
from kuiper_runtime import bcanon,MANIFEST
ROOT=Path(__file__).resolve().parents[1];stage=Path(sys.argv[1]);out=Path(sys.argv[2])
base="http://127.0.0.1:8765"
def sha(v):return hashlib.sha256(bcanon(v)).hexdigest()
def get(path):return json.load(urllib.request.urlopen(base+path,timeout=5))
def main():
    proc=subprocess.Popen([sys.executable,"-B",str(ROOT/"tools/kuiper_research.py"),str(stage/"bonds.zip"),"--port","8765","--runtime-stage",str(stage)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(100):
            if proc.poll() is not None:raise RuntimeError("SERVER_EXIT")
            try:sel=get("/__kuiper/select?mode=machine&family=Vg");break
            except OSError:time.sleep(.1)
        else:raise RuntimeError("SERVER_START")
        raw=(stage/"a1-property-impact.json").read_bytes()
        assert hashlib.sha256(raw).hexdigest()=="1233591210b19b006bb5970ecc85bdf0e5951cc3bef92e5e670871a4da0ca9e3"
        a=json.loads(raw)
        assert a["base_manifest_sha256"]==MANIFEST and a["authority"]=="EVIDENCE_ONLY" and a["redistribution"]=="BLOCKED"
        assert len(a["properties"])==32 and len(a["bond_receipts"])==5 and len(a["source_entries"])==8
        assert a["selection_examples"][0]["keys"]==[r["key"] for r in sel["rows"]]
        assert get("/__kuiper/select?mode=vedic&family=Vg")["rows"]==sel["rows"]
        reports=[]
        with sync_playwright() as p:
            b=p.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
            for width,height in [(1280,800),(390,844)]:
                page=b.new_page(viewport={"width":width,"height":height},is_mobile=width<500,has_touch=width<500)
                page.route("**/*",lambda route:route.continue_() if route.request.url.startswith(base+"/") or route.request.url.startswith("blob:") else route.abort())
                errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
                page.goto(base+"/editions/202611021201/",wait_until="domcontentloaded",timeout=60000)
                page.wait_for_function("window.KY && KY.inspect().done && KY.modules.computation && KY.hooks.SPACE>0",timeout=90000)
                page.wait_for_function("KY.modules.layers.api.get('computation')?.status === 'OK'",timeout=60000)
                page.locator('[data-menu="wafer"] button').first.click()
                panel=page.locator("#ky-computation");panel.wait_for(state="visible")
                panel.get_by_role("button",name="Select",exact=True).click()
                page.wait_for_function("KY.modules.computation.api.inspect().count===2",timeout=30000)
                results=[]
                for lon,lat,distance,bearing in ((0,2,222.638981586547,0),(-3,0,333.958472379821,270)):
                    for name,value in zip(("A longitude","A latitude","B longitude","B latitude"),(0,0,lon,lat)):
                        panel.get_by_label(name,exact=True).fill(str(value))
                    with page.expect_response(lambda r:r.url==base+"/__kuiper/execute",timeout=45000) as event:
                        panel.get_by_role("button",name="Execute ORIENT").click()
                    response=event.value;assert response.status==200
                    request=response.request.post_data_json;result=response.json()
                    assert result["generation"]==request["generation"] and result["selection_receipt_sha256"]==request["selection_receipt_sha256"]
                    assert result["request_sha256"]==sha(request["request"]) and result["state"]=="EXECUTED_INTERNAL"
                    v2=result["pattern_receipt"];assert v2["legacy_receipt"]==result["receipt"] and v2["result_sha256"]==sha(v2["result"])
                    assert abs(result["output"]["distance_km"]-distance)<1e-7 and abs(result["output"]["initial_bearing_deg"]-bearing)<1e-7
                    page.wait_for_function("KY.modules.computation.api.inspect().execution === 'REPORTED EXECUTED'",timeout=10000)
                    results.append({"generation":result["generation"],"request_sha256":result["request_sha256"],"v2_pattern_sha256":v2["pattern_sha256"],"v2_result_sha256":v2["result_sha256"],"receipt_sha256":v2["receipt_sha256"],"output":result["output"]})
                assert results[0]["v2_pattern_sha256"]==results[1]["v2_pattern_sha256"] and results[0]["v2_result_sha256"]!=results[1]["v2_result_sha256"]
                page.wait_for_function("KY.modules.computation.api.inspect().execution !== 'EXECUTING'",timeout=30000)
                state=page.evaluate("KY.modules.computation.api.inspect().execution")
                assert state=="REPORTED EXECUTED"
                # Hold a real fresh response until the operator edits its input.
                held=[]
                def hold(route):held.append((route,route.fetch(timeout=45000)))
                page.route("**/__kuiper/execute",hold)
                panel.get_by_label("B longitude",exact=True).fill("4")
                panel.get_by_role("button",name="Execute ORIENT").click()
                for _ in range(100):
                    if held:break
                    page.wait_for_timeout(50)
                assert len(held)==1,"HELD_RESPONSE"
                panel.get_by_label("B longitude",exact=True).fill("5")
                route,response=held[0];assert response.status==200
                with page.expect_response(lambda r:r.url==base+"/__kuiper/execute"):
                    route.fulfill(response=response)
                page.wait_for_timeout(200)
                assert page.evaluate("KY.modules.computation.api.inspect().execution")=="NOT EXECUTED"
                assert panel.locator("textarea[readonly]").input_value()==""
                page.unroute("**/__kuiper/execute",hold)
                assert not errors,errors
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
                reports.append({"viewport":[width,height],"results":results,"ui_execution_state":state,"stale_real_response_discarded":True,"page_errors":len(errors),"renderer":"Chromium software rendering"})
                panel.get_by_role("button",name="Reset").click()
                assert page.evaluate("KY.modules.computation.api.inspect().count")==0
                page.close()
            b.close()
        report={"schema":"kuiper.e1.combined-research.v1","a1_member_sha256":hashlib.sha256(raw).hexdigest(),"a1_key_parity":True,"b1_actual_pattern_runtime":True,"browser":reports,"independent_review":"OPEN","ui_final_receipt_review":"CORRELATED_INDEPENDENT_REVIEW_OPEN","deployment":"NOT_AUTHORISED"}
        out.write_text(json.dumps(report,sort_keys=True,indent=2));print(json.dumps(report,sort_keys=True))
    finally:proc.terminate();proc.wait(timeout=5)
if __name__=="__main__":main()
