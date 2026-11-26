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
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
    for width,height in [(1280,800),(390,844)]:
        page=browser.new_page(viewport={"width":width,"height":height},has_touch=width<500,is_mobile=width<500)
        errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
        mode={"tamper":False,"manifest":False}
        def route(r):
            url=r.request.url
            if url==base+"/__kuiper/manifest":
                return r.fulfill(status=200,content_type="application/json",body=raw+(b" " if mode["manifest"] else b""))
            if mode["tamper"] and "/__kuiper/select?" in url:
                response=r.fetch();body=response.json();body["rows"][0]["source"]["first"]+=1
                return r.fulfill(response=response,json=body)
            if url.startswith(base+"/") or url.startswith("blob:"):return r.continue_()
            return r.abort()
        page.route("**/*",route)
        page.goto(base+"/editions/202611021201/",wait_until="domcontentloaded",timeout=60000)
        page.wait_for_function("window.KY && KY.inspect().done && KY.modules.computation && KY.hooks.SPACE>0",timeout=90000)
        page.wait_for_function("KY.modules.layers.api.get('computation')?.status === 'OK'",timeout=60000)
        page.locator('[data-menu="wafer"] button').first.click()
        panel=page.locator("#ky-computation");panel.wait_for(state="visible")
        select=panel.get_by_role("button",name="Select",exact=True)
        inspect=lambda:page.evaluate("KY.modules.computation.api.inspect()")
        wait_count=lambda n:page.wait_for_function("n=>KY.modules.computation.api.inspect().count===n",arg=n)
        select.click();wait_count(2);a=inspect()["keys"]
        panel.get_by_label("Instrument").select_option("vedic");select.click();wait_count(2)
        assert inspect()["keys"]==a
        panel.get_by_label("Family / operation").select_option("Vd")
        panel.get_by_label("Intersect property").select_option("runtime_effects")
        panel.get_by_label("Intersect state").select_option("UNKNOWN")
        select.click();wait_count(4)
        assert panel.get_by_role("button",name="Execute ORIENT").is_disabled()
        panel.get_by_label("Exclude property").select_option("runtime_effects")
        panel.get_by_label("Exclude state").select_option("UNKNOWN")
        select.click()
        page.wait_for_function("KY.modules.computation.api.inspect().status.startsWith('SELECTED')");assert inspect()["count"]==0
        panel.get_by_role("button",name="Reset").click()
        panel.get_by_label("Family / operation").select_option("Vg")
        mode["tamper"]=True;select.click()
        page.wait_for_function("KY.modules.computation.api.inspect().status.startsWith('REFUSED')")
        assert inspect()["count"]==0 and panel.get_by_role("button",name="Execute ORIENT").is_disabled()
        mode["tamper"]=False;select.click();wait_count(2)
        assert panel.get_by_role("button",name="Execute ORIENT").is_enabled()
        panel.get_by_role("button",name="Execute ORIENT").click()
        assert panel.get_by_role("status").last.inner_text().startswith("REFUSED")
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
        assert page.evaluate("document.getElementById('ky-computation').scrollWidth<=document.getElementById('ky-computation').clientWidth+2")
        page.screenshot(path=str(out/f"d1-{width}.png"),mask=[panel.locator("ul"),panel.locator("pre")])
        panel.get_by_role("button",name="Reset").click();assert inspect()["count"]==0
        assert not errors,errors
        results.append({"viewport":[width,height],"machine_vedic_parity":True,"intersection":True,"exclusion":True,"forged_occurrence_refused":True,"missing_inputs_refused":True,"reset":True,"overflow":False,"fresh_runtime":"OPEN","manifest_transport":"CI-only browser fixture; exact original bytes"})
        page.close()
    browser.close()
(out/"d1-browser.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results))
