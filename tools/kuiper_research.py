"""Local-only Edition 12 research server; no frozen edition edits or network fetches.
python tools/kuiper_research.py /path/to/bonds.zip --port 8765
Open http://127.0.0.1:8765/editions/202611021201/
"""
import argparse, hashlib, json, time, tracemalloc
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

def serve(space,port):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
        def send_bytes(self,raw,kind="application/json",status=200):
            self.send_response(status);self.send_header("Content-Type",kind);self.send_header("Content-Length",str(len(raw)))
            self.send_header("Cache-Control","no-store");self.end_headers();self.wfile.write(raw)
        def do_GET(self):
            # Restrict the local evidence endpoint to same-origin browser and loopback.
            if self.headers.get("Host")!=f"127.0.0.1:{port}" or self.headers.get("Sec-Fetch-Site")=="cross-site":
                self.send_error(403);return
            u=urlsplit(self.path)
            if u.path=="/__kuiper/select":
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
    ThreadingHTTPServer(("127.0.0.1",port),Handler).serve_forever()
def benchmark(space):
    repeats=1000
    tracemalloc.start();t=time.perf_counter_ns()
    for _ in range(repeats):selection(space,{"mode":"machine","family":"Vg"})
    elapsed=time.perf_counter_ns()-t;_,peak=tracemalloc.get_traced_memory();tracemalloc.stop()
    t=time.perf_counter_ns();space.project(tuple(sorted(space.by_key)));projection=time.perf_counter_ns()-t
    return {"cohort":8,"repeats":repeats,"selection_and_receipt_total_ns":elapsed,"peak_python_traced_bytes":peak,
      "projection_with_node_startup_ns":projection,"gpu":"NOT_RUN","rendering":"NOT_MEASURED"}
def main():
    p=argparse.ArgumentParser();p.add_argument("zip",type=Path);p.add_argument("--port",type=int,default=8765);p.add_argument("--benchmark",action="store_true")
    a=p.parse_args();t=time.perf_counter_ns();s=Space(load(a.zip));parse=time.perf_counter_ns()-t
    if a.benchmark:print(json.dumps({**benchmark(s),"local_zip_load_and_validation_ns":parse},sort_keys=True))
    else:serve(s,a.port)
if __name__=="__main__":main()
