"""Real HTTP + actual B Bridge. No independent oracle claim; C1 owns it."""
import hashlib,json,sys,unittest,urllib.request,urllib.error,subprocess,time,os
from pathlib import Path
from kuiper_runtime import bcanon,strict_body,ARCHIVE,MANIFEST
ROOT=Path(__file__).resolve().parents[1]
BONDS=Path(sys.argv.pop(1));STAGE=Path(sys.argv.pop(1));OUT=Path(sys.argv.pop(1))
BASE="http://127.0.0.1:8765"
def sha(x):return hashlib.sha256(bcanon(x)).hexdigest()
def get(family,mode="machine",base=BASE):
    import urllib.parse
    return json.load(urllib.request.urlopen(base+"/__kuiper/select?"+urllib.parse.urlencode({"family":family,"mode":mode}),timeout=10))
def envelope(family,op,inputs,generation=1,base=BASE):
    s=get(family,base=base)
    return {"request":{"schema":"tacit-b.kuiper-request.v1","operation":op,"manifest_sha256":s["manifest_sha256"],"keys":[r["key"] for r in s["rows"]],"inputs":inputs},"query":s["query"],"selection_receipt_sha256":s["receipt_sha256"],"generation":generation}
def post(e,origin=BASE,base=BASE,raw=None):
    q=urllib.request.Request(base+"/__kuiper/execute",data=bcanon(e) if raw is None else raw,headers={"Origin":origin,"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(q,timeout=45) as r:return r.status,json.load(r)
    except urllib.error.HTTPError as ex:
        try:return ex.code,json.load(ex)
        except ValueError:return ex.code,{}
def point(lon,lat):return {"longitude":lon,"latitude":lat}
def inputs(a,b):return {"crs":"WGS84","unit":"degrees","point_a":a,"point_b":b}
class Checks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.procs=[]
        for port,stage in ((8765,STAGE),(8766,None)):
            args=[sys.executable,"-B",str(ROOT/"tools/kuiper_research.py"),str(BONDS),"--port",str(port)]
            if stage:args+=["--runtime-stage",str(stage)]
            proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            cls.procs.append(proc)
            for _ in range(50):
                if proc.poll() is not None:raise RuntimeError("server exited")
                try:get("Vg",base=f"http://127.0.0.1:{port}");break
                except OSError:time.sleep(.1)
            else:raise RuntimeError("server unavailable")
    @classmethod
    def tearDownClass(cls):
        for p in cls.procs:p.terminate();p.wait(timeout=5)
    def test_fresh_and_replay(self):
        results=[]
        for n,x in ((11,inputs(point(0,0),point(2,0))),(12,inputs(point(0,0),point(0,3)))):
            e=envelope("Vg","orient",x,n)
            status,r=post(e)
            self.assertEqual(status,200,r);self.assertEqual(r["state"],"EXECUTED_INTERNAL")
            self.assertEqual(r["generation"],n);self.assertEqual(r["selection_receipt_sha256"],e["selection_receipt_sha256"])
            self.assertEqual(r["request_sha256"],sha(e["request"]));self.assertEqual(r["archive_sha256"],ARCHIVE)
            receipt=r["receipt"];self.assertEqual(receipt["receipt_sha256"],sha({k:v for k,v in receipt.items() if k!="receipt_sha256"}))
            v2=r["pattern_receipt"];self.assertEqual(v2["request_sha256"],sha(r["pattern_request"]))
            self.assertEqual(v2["result_sha256"],sha(v2["result"]));self.assertEqual(v2["pattern_sha256"],sha(v2["pattern"]))
            self.assertEqual(post(e),(200,r));results.append(r)
        self.assertEqual(results[0]["pattern_sha256"],results[1]["pattern_sha256"])
        self.assertNotEqual(results[0]["request_sha256"],results[1]["request_sha256"])
        self.assertEqual(results[0]["pattern_receipt"]["pattern_sha256"],results[1]["pattern_receipt"]["pattern_sha256"])
        self.assertNotEqual(results[0]["pattern_receipt"]["result_sha256"],results[1]["pattern_receipt"]["result_sha256"])
        self.assertNotEqual(results[0]["output"],results[1]["output"])
        self.assertAlmostEqual(results[0]["output"]["initial_bearing_deg"],90)
        self.assertAlmostEqual(results[1]["output"]["initial_bearing_deg"],0)
        self.assertAlmostEqual(results[0]["output"]["distance_km"],222.638981586547,places=7)
        self.assertAlmostEqual(results[1]["output"]["distance_km"],333.958472379821,places=7)
        OUT.write_text(json.dumps({"runtime":"ACTUAL_B1_PATTERN_BRIDGE","fresh_results":results,"review":"PENDING_C1","peer_successor_assembly":"HTTP_VERIFIED_BROWSER_SEPARATE"},indent=2))
    def test_refusal(self):
        for f,op in (("Vd","electrical"),("Vn+Vg","nearest-orient")):
            status,r=post(envelope(f,op,{}))
            self.assertEqual(status,200,r);self.assertEqual(r["state"],"REFUSED")
            self.assertFalse(r["receipt"]["admission"]);self.assertIsNone(r["output"])
    def test_raw_manifest(self):
        raw=urllib.request.urlopen(BASE+'/__kuiper/manifest').read()
        self.assertEqual(hashlib.sha256(raw).hexdigest(),MANIFEST)
    def test_manifest(self):
        e=envelope("Vg","orient",inputs(point(0,0),point(2,0)));e["request"]["manifest_sha256"]="0"*64
        self.assertEqual(post(e)[0],400)
    def test_wrong_key(self):
        e=envelope("Vg","orient",inputs(point(0,0),point(2,0)));e["request"]["keys"].reverse()
        self.assertEqual(post(e)[0],400)
    def test_stale_selection(self):
        e=envelope("Vg","orient",inputs(point(0,0),point(2,0)));e["selection_receipt_sha256"]="0"*64
        self.assertEqual(post(e)[0],400)
    def test_origin(self):self.assertEqual(post({},origin="https://example.invalid")[0],403)
    def test_duplicate(self):self.assertEqual(post({},raw=b'{"generation":1,"generation":2}')[0],400)
    def test_nonfinite(self):self.assertEqual(post({},raw=b'{"value":1e999}')[0],400)
    def test_oversize(self):self.assertEqual(post({},raw=b"x"*32001)[0],400)
    def test_authority(self):
        e=envelope("Vg","orient",inputs(point(0,0),point(2,0)));e["request"]["experiment"]=True
        self.assertEqual(post(e)[0],400)
    def test_wrong_unit(self):
        x=inputs(point(0,0),point(2,0));x["unit"]="radians"
        self.assertEqual(post(envelope("Vg","orient",x))[0],422)
    def test_unavailable(self):
        base="http://127.0.0.1:8766"
        status,r=post(envelope("Vg","orient",inputs(point(0,0),point(2,0)),base=base),origin=base,base=base)
        self.assertEqual(status,503);self.assertEqual(r["state"],"RUNTIME_UNAVAILABLE");self.assertIsNone(r["receipt"])
if __name__=="__main__":unittest.main(verbosity=2)
