"""D1 real inherited Edition 12 UI; manifest route supplied by CI fixture only.
No execution success is simulated. E1 owns server and runtime integration."""
import json, hashlib, os, zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
base="http://127.0.0.1:8765"
with zipfile.ZipFile(os.environ["BONDS_ZIP"]) as z:
    members=[n for n in z.namelist() if n.split("/")[-1]=="bonds.json"]
    assert len(members)==1
    raw=z.read(members[0])
assert hashlib.sha256(raw).hexdigest()=="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d"
out=Path("evidence");out.mkdir(exist_ok=True)
results=[]
engine=os.environ.get("D1_BROWSER","chromium")
runtime=os.environ.get("D1_RUNTIME")=="1"
trust=os.environ.get("D1_TRUST_JSON")
assert not trust or runtime, "trusted runtime test requires actual runtime"
manifest_fixture=not runtime or os.environ.get("D1_MANIFEST_FIXTURE")=="1"
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]) if engine=="chromium" else p.webkit.launch(headless=True)
    for width,height in [(1280,800),(390,844)]:
        page=browser.new_page(viewport={"width":width,"height":height},has_touch=width<500,is_mobile=width<500)
        if trust:page.add_init_script("window.__KUIPER_RUNTIME_TRUST__="+trust)
        errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
        mode={"tamper":None,"manifest":True,"hold":False,"held":None,"auth_case":None,"previous":None,"auth_held":None}
        def route(r):
            url=r.request.url
            if url==base+"/__kuiper/manifest" and (manifest_fixture or mode["manifest"]):
                return r.fulfill(status=200,content_type="application/json",body=raw+(b" " if mode["manifest"] else b""))
            if mode["hold"] and "/__kuiper/select?" in url:
                mode["held"]=r;return
            if mode["tamper"] and "/__kuiper/select?" in url:
                response=r.fetch();body=response.json()
                case=mode["tamper"]
                if case=="span":body["rows"][0]["source"]["first"]+=1
                elif case=="key":body["rows"][0]["key"]=str(int(body["rows"][0]["key"])+1)
                elif case=="blob":body["rows"][0]["source"]["blob"]="0"*40
                elif case=="review":body["review"]="VERIFIED"
                elif case=="bond":body["bonds"]=[{"from":"fake","to":"fake","state":"CONDITIONAL","conditions":[]}]
                # Even a self-consistent rehash is not a trusted exact join.
                body.pop("receipt_sha256")
                body["receipt_sha256"]=hashlib.sha256(json.dumps(body,sort_keys=True,separators=(",",":"),ensure_ascii=True).encode()).hexdigest()
                return r.fulfill(response=response,json=body)
            if url==base+"/__kuiper/execute-auth" and mode["auth_case"]:
                case=mode["auth_case"]
                if case=="replay":return r.fulfill(status=200,content_type="application/json",body=mode["previous"])
                response=r.fetch();assert response.ok
                if case=="delay":mode["auth_held"]=(r,response);return
                payload=response.json()
                if case=="signature":payload["signature"]=("0" if payload["signature"][0]!="0" else "1")+payload["signature"][1:]
                elif case=="key":payload["key_id"]="0"*64
                elif case=="payload":
                    altered=json.loads(payload["payload"]);altered["output"]["distance_km"]+=1
                    payload["payload"]=json.dumps(altered,sort_keys=True,separators=(",",":"))
                elif case=="unsigned":return r.fulfill(status=200,content_type="application/json",body=payload["payload"])
                return r.fulfill(response=response,json=payload)
            if url.startswith(base+"/") or url.startswith("blob:"):return r.continue_()
            return r.abort()
        page.route("**/*",route)
        page.goto(base+"/editions/202611021201/",wait_until="domcontentloaded",timeout=60000)
        page.wait_for_function("window.KY && KY.inspect().done && KY.modules.computation && KY.hooks.SPACE>0",timeout=90000)
        page.wait_for_function("KY.modules.layers.api.get('computation')?.status === 'OK'",timeout=60000)
        page.locator('[data-menu="wafer"] button').first.click()
        panel=page.locator("#ky-computation");panel.wait_for(state="visible")
        for label,slug in [("Instrument","instrument"),("Family / operation","family-operation"),("A longitude","a-longitude"),("A latitude","a-latitude"),("B longitude","b-longitude"),("B latitude","b-latitude")]:
            control=panel.get_by_label(label,exact=True)
            assert control.count()==1 and control.get_attribute("id")=="ky-computation-"+slug
        select=panel.get_by_role("button",name="Select",exact=True)
        inspect=lambda:page.evaluate("KY.modules.computation.api.inspect()")
        wait_count=lambda n:page.wait_for_function("n=>KY.modules.computation.api.inspect().count===n",arg=n)
        select.click()
        page.wait_for_function("KY.modules.computation.api.inspect().status.includes('MANIFEST BYTES MISMATCH')")
        assert inspect()["count"]==0
        mode["manifest"]=False
        for family,count in [("Vg",2),("Vn",2),("Vn+Vg",4),("Vd",4)]:
            panel.get_by_label("Family / operation",exact=True).select_option(family)
            panel.get_by_label("Instrument",exact=True).select_option("machine")
            select.focus();page.keyboard.press("Enter");wait_count(count);a=inspect()["keys"]
            panel.get_by_label("Instrument",exact=True).select_option("vedic");select.click();wait_count(count)
            assert inspect()["keys"]==a
            panel.get_by_label("Exclude property",exact=True).select_option("runtime_effects")
            panel.get_by_label("Exclude state",exact=True).select_option("OBSERVED")
            select.click()
            page.wait_for_function("KY.modules.computation.api.inspect().status.includes('indeterminate')")
            assert inspect()["count"]==0 and len(inspect()["unknownKeys"])==count
            panel.get_by_role("button",name="Reset").click()
            assert panel.get_by_label("Instrument",exact=True).evaluate("el=>el===document.activeElement")
        panel.get_by_label("Family / operation",exact=True).select_option("Vd")
        panel.get_by_label("Intersect property",exact=True).select_option("runtime_effects")
        panel.get_by_label("Intersect state",exact=True).select_option("UNKNOWN")
        select.click();wait_count(4)
        assert panel.get_by_role("button",name="Execute ORIENT").is_disabled()
        panel.get_by_label("Exclude property",exact=True).select_option("runtime_effects")
        panel.get_by_label("Exclude state",exact=True).select_option("UNKNOWN")
        select.click()
        page.wait_for_function("KY.modules.computation.api.inspect().status.startsWith('SELECTED')");assert inspect()["count"]==0
        panel.get_by_label("Intersect property",exact=True).select_option("")
        panel.get_by_label("Intersect state",exact=True).select_option("")
        panel.get_by_label("Exclude state",exact=True).select_option("OBSERVED")
        select.click()
        page.wait_for_function("KY.modules.computation.api.inspect().status.includes('indeterminate')")
        assert inspect()["count"]==0 and len(inspect()["unknownKeys"])==4
        panel.get_by_role("button",name="Reset").click()
        panel.get_by_label("Family / operation",exact=True).select_option("Vg")
        for case in ["span","key","blob","review","bond"]:
            mode["tamper"]=case;select.click()
            page.wait_for_function("KY.modules.computation.api.inspect().status.startsWith('REFUSED')")
            assert inspect()["count"]==0 and panel.get_by_role("button",name="Execute ORIENT").is_disabled()
        mode["tamper"]=None
        mode["hold"]=True;select.click()
        for _ in range(20):
            if mode["held"]:break
            page.wait_for_timeout(100)
        assert mode["held"] is not None
        panel.get_by_role("button",name="Reset").click()
        mode["hold"]=False
        mode["held"].continue_()
        page.wait_for_timeout(300)
        assert inspect()["count"]==0 and inspect()["status"]=="NOT SELECTED"
        select.click();wait_count(2)
        assert panel.get_by_role("button",name="Execute ORIENT").is_enabled()
        panel.get_by_role("button",name="Execute ORIENT").click()
        assert panel.get_by_role("status").last.inner_text().startswith("REFUSED")
        for label,value in [("A longitude","0"),("A latitude","0"),("B longitude","0"),("B latitude","2")]:
            panel.get_by_label(label,exact=True).fill(value)
        panel.get_by_role("button",name="Execute ORIENT").click()
        if runtime:
            page.wait_for_function("KY.modules.computation.api.inspect().execution==='REPORTED EXECUTED'",timeout=30000)
            first=json.loads(panel.locator("textarea[readonly]").input_value())
            assert inspect()["originState"]==("SIGNATURE VERIFIED" if trust else "UNAUTHENTICATED RESEARCH")
            if trust:assert first["runtime_origin"]["key_id"]==json.loads(trust)["key_id"]
            assert abs(first["receipt"]["output"]["distance_km"]-222.63898158654712)<1e-8
            assert first["receipt"]["output"]["initial_bearing_deg"]==0
            panel.get_by_label("B longitude",exact=True).fill("-3");panel.get_by_label("B latitude",exact=True).fill("0")
            assert panel.locator("textarea[readonly]").input_value()==""
            panel.get_by_role("button",name="Execute ORIENT").click()
            page.wait_for_function("KY.modules.computation.api.inspect().execution==='REPORTED EXECUTED'",timeout=30000)
            second=json.loads(panel.locator("textarea[readonly]").input_value())
            assert abs(second["receipt"]["output"]["distance_km"]-333.9584723798207)<1e-8
            assert second["receipt"]["output"]["initial_bearing_deg"]==270
            assert first["receipt"]["request_sha256"]!=second["receipt"]["request_sha256"]
            if trust:
                assert first["runtime_origin"]["challenge"]!=second["runtime_origin"]["challenge"]
                # Replaying a genuine prior signed payload is not a fresh execution.
                previous=second["runtime_origin"]
                mode["previous"]=json.dumps({k:previous[k] for k in ("key_id","signature","payload")})
                for case in ("signature","key","payload","unsigned","replay"):
                    mode["auth_case"]=case
                    panel.get_by_role("button",name="Execute ORIENT").click()
                    page.wait_for_function("KY.modules.computation.api.inspect().execution==='REFUSED'",timeout=30000)
                    assert not panel.locator("textarea[readonly]").input_value()
                    assert inspect()["originState"]=="REFUSED"
                mode["auth_case"]="delay"
                panel.get_by_role("button",name="Execute ORIENT").click()
                for _ in range(100):
                    if mode["auth_held"]:break
                    page.wait_for_timeout(100)
                assert mode["auth_held"] is not None
                coordinate=panel.get_by_label("B longitude",exact=True);coordinate.fill("-2");coordinate.fill("-3")
                held,response=mode["auth_held"];held.fulfill(response=response)
                page.wait_for_timeout(300)
                assert inspect()["execution"]=="NOT EXECUTED" and not panel.locator("textarea[readonly]").input_value()
                mode["auth_case"]=None
                panel.get_by_role("button",name="Execute ORIENT").click()
                page.wait_for_function("KY.modules.computation.api.inspect().execution==='REPORTED EXECUTED'",timeout=30000)
        else:
            page.wait_for_function("KY.modules.computation.api.inspect().execution==='REFUSED'")
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
        assert page.evaluate("document.getElementById('ky-computation').scrollWidth<=document.getElementById('ky-computation').clientWidth+2")
        page.screenshot(path=str(out/f"d1-{engine}-{width}.png"),mask=[panel.locator("ul"),panel.locator("pre"),panel.locator("textarea[readonly]")])
        panel.get_by_role("button",name="Reset").click();assert inspect()["count"]==0
        assert not errors,errors
        results.append({"viewport":[width,height],"machine_vedic_parity":True,"intersection":True,"exclusion":True,"forged_occurrence_refused":True,"missing_inputs_refused":True,"reset":True,"overflow":False,"fresh_runtime":"TWO_ACTUAL_E1_REQUESTS" if runtime else "UNAVAILABLE_REFUSED","manifest_transport":"CI-only browser fixture; exact original bytes" if manifest_fixture else "actual E1 manifest route","engine":engine,"runtime_origin":"SIGNED_ACTUAL" if trust else "NOT_AUTHENTICATED","signed_negative_cases":5 if trust else 0,"signed_stale_aba":bool(trust),"exact_accessible_ids":True,"tamper_cases":5,"manifest_tamper":True,"stale_selection":True,"keyboard":True,"all_pattern_parity":True,"all_eight_unknown_exclusion":True})
        page.close()
    # A malformed out-of-band pin must refuse before network execution, even
    # when the legacy server would otherwise accept a request.
    page=browser.new_page(viewport={"width":390,"height":844})
    page.add_init_script("window.__KUIPER_RUNTIME_TRUST__={spki_hex:'00',key_id:'"+"0"*64+"'}")
    requests=[]
    def invalid_pin_route(r):
        url=r.request.url
        if url==base+"/__kuiper/manifest" and manifest_fixture:return r.fulfill(status=200,content_type="application/json",body=raw)
        if "/__kuiper/execute" in url:requests.append(url);return r.abort()
        if url.startswith(base+"/") or url.startswith("blob:"):return r.continue_()
        return r.abort()
    page.route("**/*",invalid_pin_route)
    page.goto(base+"/editions/202611021201/",wait_until="domcontentloaded",timeout=60000)
    page.wait_for_function("window.KY && KY.inspect().done && KY.modules.computation && KY.hooks.SPACE>0",timeout=90000)
    page.wait_for_function("KY.modules.layers.api.get('computation')?.status === 'OK'",timeout=60000)
    page.locator('[data-menu="wafer"] button').first.click()
    panel=page.locator("#ky-computation");panel.get_by_role("button",name="Select",exact=True).click()
    page.wait_for_function("KY.modules.computation.api.inspect().count===2")
    for label,value in [("A longitude","0"),("A latitude","0"),("B longitude","1"),("B latitude","0")]:
        panel.get_by_label(label,exact=True).fill(value)
    panel.get_by_role("button",name="Execute ORIENT").click()
    page.wait_for_function("KY.modules.computation.api.inspect().execution==='REFUSED'")
    assert not requests and not panel.locator("textarea[readonly]").input_value()
    results.append({"engine":engine,"malformed_launcher_pin_refused_before_network":True})
    page.close()
    browser.close()
(out/"d1-browser.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results));print("browser member SHA256",hashlib.sha256((out/"d1-browser.json").read_bytes()).hexdigest())
