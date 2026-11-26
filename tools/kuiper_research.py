"""Local-only Edition 12 research server; no frozen edition edits or network fetches.
python tools/kuiper_research.py /path/to/bonds.zip --port 8765
Open http://127.0.0.1:8765/editions/202611021201/
"""
import argparse, hashlib, json, time, tracemalloc, zipfile, threading, subprocess
from kuiper_runtime import Runtime, strict_body, execute_envelope, MAX_BODY, manifest_bytes
from kuiper_origin import Origin
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from kuiper_select import Space, load, canonical, JSON_SHA, require

ROOT=Path(__file__).resolve().parents[1]
ED="/editions/202611021201/"
MODULE="202611261720-computation.js"
CODE=ROOT/"tools/kuiper-computation"/MODULE
# VEDIC operation groups are explicit supported meanings; not free-text interpretation.
MEANINGS={"Vg":(1,5),"Vn":(15,16),"Vd":(24,25,26,27),"Vn+Vg":(1,5,15,16)}
OPERATIONS={"Vg":"orient","Vd":"electrical","Vn+Vg":"nearest-orient"}
def selection(space,q):
    require(set(q)<= {"mode","family","property_name","state","key_min","key_max"},"UNKNOWN_QUERY_FIELD")
    mode=q.get("mode");family=q.get("family")
    require(mode in ("machine","vedic") and family in MEANINGS,"UNSUPPORTED_OPERATION")
    filters={k:v for k,v in q.items() if k not in ("mode","family")}
    for k in ("key_min","key_max"):
        if k in filters:
            require(filters[k].isascii() and filters[k].isdigit() and len(filters[k])<=15,"INVALID_RANGE")
            filters[k]=int(filters[k])
    if mode=="machine": keys=tuple(sorted(k for module in family.split("+") for k in space.select(module=module,**filters)))
    else:
        keys=tuple(sorted(k for n in MEANINGS[family] for k in space.select(meaning=f"GG2050-VEDIC-{n:06d}",**filters)))
    rows=[]
    for k in keys:
        row=space.by_key[k]
        prop=space.properties[k].get(filters.get("property_name"),{})
        rows.append({"key":str(k),"meaning":row["meaning_id"],"module":row["module_classification"]["symbol"],
          "source":row["source"],"evidence":prop.get("state",row["kuiper"]["state"])})
    # No inferred node-to-node edges: show only producer's logical port relationships, not proximity.
    bonds=[]
    if keys:
        for b in space.bonds:
            if family=="Vd" and b["from"].split(".")[0] in ("voltageDropVolts","lossesWatts"):
                bonds.append({"from":b["from"],"to":b["to"],"state":"CONDITIONAL","conditions":b.get("conditions")})
            if family in ("Vn","Vn+Vg") and b["from"].split(".")[0] in ("nearestSubstation","selected_location"):
                bonds.append({"from":b["from"],"to":b["to"],"state":"CONDITIONAL","conditions":b.get("conditions")})
    result={"schema":"kuiper.local-selection.v1","manifest_sha256":JSON_SHA,"authority":"SELECTION_ONLY_NO_EXECUTION",
      "rows":rows,"bonds":bonds,"bond_scope":"FAMILY_CANDIDATES_NOT_PROVEN_SELECTED_ENDPOINTS","query":q,
      "stage_operation":OPERATIONS.get(family) if len(keys)==len(MEANINGS[family]) else None,"execution":"NOT_EXECUTED","review":"PENDING","redistribution":"BLOCKED"}
    result["receipt_sha256"]=hashlib.sha256(canonical(result)).hexdigest()
    return result

def manifest():
    m=json.loads((ROOT/ED.strip("/")/"modules.json").read_text())
    raw=CODE.read_bytes();m["order"].append("computation")
    m["modules"].append({"id":"computation","generation":"202611261720","path":"modules/"+MODULE,
      "sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw),"byte_budget":32768,
      "requires":["keyPlace","address","wafer","SPACE","repos","cam","o2","redraw","draw","layers"],
      "provides":["computation"],"licence":"Apache-2.0","writes":["#ky-computation"],"reads":["local validated evidence"]})
    return m
def layers():
    m=json.loads((ROOT/ED.strip("/")/"data/layers.json").read_text())
    m["order"].append("computation")
    m["layers"].append({"id":"computation","key":"layer:computation","label":"Computational selection (local)",
      "group":"THE APPS","colour":"#2ee6e6","meaning":"selected, not executed","draws":"points",
      "preload":False,"on":False,"format":"code-feature-collection.v1","module_registers":True,
      "source":{"file":None,"bytes":0,"features":0,"sha256":""},"licence":"Apache-2.0 cartridge; evidence not redistributed",
      "requires":["keyPlace","o2"],"module":MODULE})
    return m

B_ZIP="74fe853f050765545dfeb6404c8c84c9d9413754c0d8ec38131182544c7a4149"
B_JSON="7bb9e81ca066cafbaeae75a358da42768bb9db6a63746710025d88b7e0701796"
def bcanon(v):
    # Exact existing factory canonical contract, including trailing newline.
    return (json.dumps(v,sort_keys=True,ensure_ascii=True,allow_nan=False,separators=(",",":"))+"\n").encode()
def digest(raw):return hashlib.sha256(raw).hexdigest()
def load_b(path):
    if path is None:return None
    require(digest(path.read_bytes())==B_ZIP,"B_ZIP_PIN")
    with zipfile.ZipFile(path) as z:
        members=[i for i in z.infolist() if i.filename.split("/")[-1]=="tacit-b-kuiper.json"]
        require(len(members)==1 and members[0].file_size<=1_000_000,"B_MEMBER")
        raw=z.read(members[0])
    require(digest(raw)==B_JSON,"B_JSON_PIN")
    b=json.loads(raw)
    require(b["schema"]=="tacit-b.kuiper-bridge-proof.v1" and b["rights"]=="BLOCKED","B_PROOF_SCHEMA")
    return b
def match_receipt(space,b,envelope):
    require(set(envelope)=={"request","query","selection_receipt_sha256"},"ENVELOPE_FIELDS")
    selected=selection(space,envelope["query"])
    require(selected["receipt_sha256"]==envelope["selection_receipt_sha256"],"STALE_SELECTION")
    req=envelope["request"]
    require(set(req)=={"schema","operation","manifest_sha256","keys","inputs"},"REQUEST_FIELDS")
    require(req["schema"]=="tacit-b.kuiper-request.v1" and req["manifest_sha256"]==JSON_SHA,"REQUEST_PIN")
    op=req["operation"]
    require(op and op==selected["stage_operation"] and req["keys"]==[r["key"] for r in selected["rows"]],"SELECTION_KEYS")
    require(isinstance(req["inputs"],dict),"INPUT_FIELDS")
    rh=digest(bcanon(req));pattern={"operation":op,"manifest_sha256":JSON_SHA,"keys":req["keys"]}
    ph=digest(bcanon(pattern))
    pending={"request_sha256":rh,"pattern_sha256":ph,"state":"NOT EXECUTED","review":"PENDING","rights":"BLOCKED"}
    # Reproduce no runtime here. Only the exact authenticated historical request may show an observation.
    if b is None or bcanon(req)!=bcanon(b["requests"].get(op)):return pending
    out=b["results"][op]
    require(out["request_sha256"]==rh and out["pattern_sha256"]==ph and out["pattern"]==pattern,"B_LINK")
    require(digest(bcanon({k:v for k,v in out.items() if k!="receipt_sha256"}))==out["receipt_sha256"],"B_RECEIPT_PIN")
    require(out["rights"]=="BLOCKED" and out["state"] in ("EXECUTED_INTERNAL","PRE_ADMISSION_EXECUTED","NO_ELIGIBLE_RECORD"),"B_AUTHORITY")
    return {**pending,"state":out["state"],"scope":"HISTORICAL_PINNED_B_EXECUTION_NOT_LIVE","output":out["output"],
        "admission":out["admission"],"formal_gate":out["formal_gate"],"receipt_sha256":out["receipt_sha256"],
        "producer_proof_sha256":B_JSON,"review":"PENDING_EXACT_REQUEST_REVIEW"}
def serve(space,port,b=None,runtime=None,manifest_raw=None,origin=None):
    slots=threading.BoundedSemaphore(8)
    class LocalServer(ThreadingHTTPServer):
        def process_request(self,request,address):
            if not slots.acquire(blocking=False):
                self.shutdown_request(request);return
            try:super().process_request(request,address)
            except BaseException:slots.release();raise
        def process_request_thread(self,request,address):
            try:super().process_request_thread(request,address)
            finally:slots.release()
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
        def setup(self):
            self.request.settimeout(5);super().setup()
        def do_HEAD(self):self.send_error(405)
        def send_bytes(self,raw,kind="application/json",status=200):
            self.send_response(status);self.send_header("Content-Type",kind);self.send_header("Content-Length",str(len(raw)))
            self.send_header("Cache-Control","no-store");self.send_header("X-Content-Type-Options","nosniff");self.end_headers();self.wfile.write(raw)
        def do_POST(self):
            if (self.path not in ("/__kuiper/receipt","/__kuiper/execute","/__kuiper/execute-auth","/__kuiper/status-auth")
                or self.headers.get_all("Host")!=[f"127.0.0.1:{port}"]
                or self.headers.get_all("Origin")!=[f"http://127.0.0.1:{port}"]
                or self.headers.get("Sec-Fetch-Site") not in (None,"same-origin")
                or self.headers.get("Transfer-Encoding") is not None):
                self.send_error(403);return
            try:
                lengths=self.headers.get_all("Content-Length") or []
                require(len(lengths)==1 and lengths[0].isascii() and lengths[0].isdigit() and len(lengths[0])<=6,"REQUEST_LENGTH")
                n=int(lengths[0])
                require(0<n<=MAX_BODY and self.headers.get_all("Content-Type")==["application/json"],"REQUEST_SIZE_TYPE")
                raw=self.rfile.read(n)
                require(len(raw)==n,"INCOMPLETE_BODY")
                body=strict_body(raw)
                if self.path in ("/__kuiper/execute-auth","/__kuiper/status-auth"):
                    if origin is None:self.send_bytes(canonical({"state":"AUTH_UNAVAILABLE"}),status=503);return
                    status,result=origin.handle(body,lambda args,enabled,context:execute_envelope(space,args,runtime if enabled else None,match_receipt,context),self.path=="/__kuiper/status-auth")
                    self.send_bytes(canonical(result),status=status)
                elif self.path=="/__kuiper/execute":
                    if origin is not None:self.send_bytes(canonical({"state":"AUTH_REQUIRED"}),status=403);return
                    status,result=execute_envelope(space,body,runtime,match_receipt)
                    self.send_bytes(canonical(result),status=status)
                else:self.send_bytes(canonical(match_receipt(space,b,body)))
            except (ValueError,KeyError,TypeError,AttributeError,RecursionError,TimeoutError,OSError,subprocess.SubprocessError) as e:
                self.send_bytes(canonical({"state":"REFUSED","error":"INVALID_REQUEST"}),status=400)
        def do_GET(self):
            # Restrict the local evidence endpoint to same-origin browser and loopback.
            if self.headers.get("Host")!=f"127.0.0.1:{port}" or self.headers.get("Sec-Fetch-Site")=="cross-site":
                self.send_error(403);return
            u=urlsplit(self.path)
            if u.path=="/__kuiper/manifest":
                if manifest_raw is None:self.send_error(503)
                else:self.send_bytes(manifest_raw)
            elif u.path=="/__kuiper/select":
                try:
                    q=parse_qs(u.query,strict_parsing=True,max_num_fields=8)
                    require(all(len(x)==1 for x in q.values()),"DUPLICATE_QUERY")
                    result=selection(space,{k:v[0] for k,v in q.items()})
                    self.send_bytes(canonical(result))
                except (ValueError,KeyError,TypeError) as e:self.send_bytes(canonical({"error":str(e)}),status=400)
            elif u.path==ED+"modules.json":self.send_bytes(canonical(manifest()))
            elif u.path==ED+"data/layers.json":self.send_bytes(canonical(layers()))
            elif u.path==ED+"modules/"+MODULE:self.send_bytes(CODE.read_bytes(),"text/javascript")
            elif u.path.startswith(ED) or u.path.startswith("/cosmos/"):
                target=Path(self.translate_path(u.path)).resolve()
                allowed=(ROOT/ED.strip("/"),ROOT/"cosmos")
                if not target.is_file() or not any(target.is_relative_to(x) for x in allowed):
                    # Only the exact existing edition landing directory is served as index.
                    if u.path==ED:super().do_GET()
                    else:self.send_error(404)
                else:super().do_GET()
            else:self.send_error(404)
    with LocalServer(("127.0.0.1",port),Handler) as server:server.serve_forever()
def benchmark(space):
    repeats=1000
    tracemalloc.start();t=time.perf_counter_ns()
    for _ in range(repeats):selection(space,{"mode":"machine","family":"Vg"})
    elapsed=time.perf_counter_ns()-t;_,peak=tracemalloc.get_traced_memory();tracemalloc.stop()
    t=time.perf_counter_ns();space.project(tuple(sorted(space.by_key)));projection=time.perf_counter_ns()-t
    return {"cohort":8,"repeats":repeats,"selection_and_receipt_total_ns":elapsed,"peak_python_traced_bytes":peak,
      "projection_with_node_startup_ns":projection,"gpu":"NOT_RUN","rendering":"NOT_MEASURED"}
def main():
    p=argparse.ArgumentParser();p.add_argument("zip",type=Path);p.add_argument("--port",type=int,default=8765);p.add_argument("--benchmark",action="store_true");p.add_argument("--b-proof",type=Path);p.add_argument("--runtime-stage",type=Path);p.add_argument("--origin-key",type=Path);p.add_argument("--source-events",type=Path)
    a=p.parse_args();t=time.perf_counter_ns();s=Space(load(a.zip));parse=time.perf_counter_ns()-t
    if a.benchmark:print(json.dumps({**benchmark(s),"local_zip_load_and_validation_ns":parse},sort_keys=True))
    else:
        require(bool(a.origin_key)==bool(a.source_events),"ORIGIN_CONFIG")
        require(not a.origin_key or a.runtime_stage,"ORIGIN_STAGE")
        if a.origin_key:
            for pth in (a.origin_key,a.source_events):
                require(not pth.resolve().is_relative_to(ROOT),"PRIVATE_CONFIG_OUTSIDE_WEB_ROOT")
        runtime=Runtime(a.runtime_stage,a.zip) if a.runtime_stage else None
        origin=Origin(a.origin_key,a.runtime_stage,a.source_events) if a.origin_key else None
        serve(s,a.port,load_b(a.b_proof),runtime,manifest_bytes(a.zip),origin)
if __name__=="__main__":main()
