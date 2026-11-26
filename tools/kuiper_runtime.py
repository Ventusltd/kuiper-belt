"""Local CI-only adapter; delegates all computation to the inherited B Bridge."""
import hashlib, json, math, os, signal, subprocess, sys, threading, zipfile
from pathlib import Path

MAX_BODY=32000
FACTORY="2ccc717933f97e7d191dae85360559a12de7ed21"
B_HEAD="3c921cb913d35ad8bd8a0cf94fe9ede55fa0e529"
BONDS_ZIP="649209e8723af1efd4c73f85ebd90b524a2312907d8a5e24759c8bf72ad1f72a"
MANIFEST="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d"
ARCHIVE="e83937c040499a7060b03ca2c4969e4414cdca48cb7f28a3ef9039f002486787"
DESCRIPTOR="b45e61e955e0d0ddde15495f9be7c3fc4943c3193dd8f318a4249524f2fb5f53"
OPS=("orient","nearest-orient","electrical")

def require(ok,reason):
    if not ok:raise ValueError(reason)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def bcanon(x):return (json.dumps(x,sort_keys=True,ensure_ascii=True,allow_nan=False,separators=(",",":"))+"\n").encode()
def fields(x,expected):require(type(x) is dict and set(x)==set(expected),"FIELDS")
def unique(pairs):
    out={}
    for k,v in pairs:
        require(k not in out,"DUPLICATE_FIELD");out[k]=v
    return out
def invalid_constant(x):raise ValueError("NONFINITE")
def strict_body(raw,limit=MAX_BODY,max_depth=12):
    require(0<len(raw)<=limit,"BODY_SIZE")
    x=json.loads(raw.decode("utf-8"),object_pairs_hook=unique,parse_constant=invalid_constant)
    def validate(v,depth=0):
        require(depth<=max_depth,"DEPTH")
        if type(v) is float:require(math.isfinite(v),"NONFINITE")
        elif type(v) is int:require(abs(v)<=2**53-1,"INTEGER_RANGE")
        elif type(v) is dict:
            require(len(v)<=32,"FIELDS_LIMIT")
            for k,val in v.items():require(len(k)<=128,"KEY_SIZE");validate(val,depth+1)
        elif type(v) is list:
            require(len(v)<=256,"ARRAY_SIZE")
            for val in v:validate(val,depth+1)
        elif type(v) is str:require(len(v)<=4096,"STRING_SIZE")
    validate(x);return x

def offline():
    # Fail closed if the process can see a non-loopback interface. CI makes a
    # fresh Linux network namespace and enables loopback only; no host credentials.
    require(sys.platform.startswith("linux"),"LINUX_NAMESPACE_REQUIRED")
    names=[line.split(":",1)[0].strip() for line in Path("/proc/net/dev").read_text().splitlines()[2:] if ":" in line]
    require(names==["lo"],"OFFLINE_NAMESPACE_REQUIRED")
def pinned_checkout(root,expected):
    def git(*args):
        return subprocess.check_output(["git","-C",str(root),*args],text=True,timeout=5,env={"PATH":os.environ["PATH"],"GIT_CONFIG_NOSYSTEM":"1","HOME":"/nonexistent"}).strip()
    require(git("rev-parse","HEAD")==expected and git("status","--porcelain","--untracked-files=all")=="","CHECKOUT_PIN")
def exact_file(path,pin,limit=8_000_000):
    require(path.is_file() and not path.is_symlink() and 0<path.stat().st_size<=limit,"STAGE_FILE")
    raw=path.read_bytes();require(sha(raw)==pin,"STAGE_DIGEST");return raw
def manifest_bytes(path):
    import io
    with zipfile.ZipFile(io.BytesIO(exact_file(path,BONDS_ZIP))) as z:
        hits=[m for m in z.infolist() if m.filename.split("/")[-1]=="bonds.json"]
        require(len(hits)==1 and hits[0].file_size<=2_000_000,"MANIFEST_MEMBER")
        raw=z.read(hits[0])
    require(sha(raw)==MANIFEST,"MANIFEST_PIN");return raw
def validate_stage(stage,bonds):
    offline()
    pinned_checkout(stage/"factory",FACTORY);pinned_checkout(stage/"b",B_HEAD)
    exact_file(stage/"package.zip",ARCHIVE)
    manifest_bytes(bonds)
    receipt=stage/"build-receipt.json"
    require(receipt.is_file() and not receipt.is_symlink() and receipt.stat().st_size<=128000,"BUILD_RECEIPT_FILE")
    r=strict_body(receipt.read_bytes(),128000)
    require(r["archive_sha256"]==ARCHIVE and r["descriptor_sha256"]==DESCRIPTOR and r["redistribution"]=="BLOCKED","BUILD_RECEIPT_PIN")
class Runtime:
    def __init__(self,stage,bonds):
        self.stage=stage.resolve();self.bonds=bonds.resolve()
        validate_stage(self.stage,self.bonds)
        self.lock=threading.BoundedSemaphore(1)
    def vedic(self,wire,events):
        # Same bounded runtime semaphore, clean environment, group timeout and offline worker.
        if not self.lock.acquire(blocking=False):return None,"BUSY"
        try:
            with subprocess.Popen([sys.executable,"-B",str(Path(__file__).resolve()),"--vedic-worker",str(self.stage),str(self.bonds),str(events)],
                    stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,
                    env={"PATH":os.environ["PATH"],"HOME":"/nonexistent","PYTHONDONTWRITEBYTECODE":"1"},
                    cwd=self.stage,start_new_session=True) as proc:
                try:out,_=proc.communicate(bcanon(wire),timeout=75)
                except subprocess.TimeoutExpired:
                    os.killpg(proc.pid,signal.SIGKILL);proc.communicate();return None,"TIMEOUT"
                if proc.returncode:return None,"RUNTIME_REFUSED"
            proof=strict_body(out,512000,32)
            fields(proof,("plan","compound_receipt"))
            return proof,None
        except (OSError,ValueError,KeyError,TypeError,subprocess.SubprocessError):return None,"RUNTIME_UNAVAILABLE"
        finally:self.lock.release()
    def run(self,q,context=None):
        if not self.lock.acquire(blocking=False):return None,"BUSY"
        try:
            # Process group bounds both Python and the Node child. No caller args,
            # cwd, code, environment or filenames are accepted.
            with subprocess.Popen([sys.executable,"-B",str(Path(__file__).resolve()),"--worker",str(self.stage),str(self.bonds)],
                    stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,
                    env={"PATH":os.environ["PATH"],"HOME":"/nonexistent","PYTHONDONTWRITEBYTECODE":"1"},
                    cwd=self.stage,start_new_session=True) as proc:
                try:out,_=proc.communicate(bcanon({"request":q,"context":context}),timeout=35)
                except subprocess.TimeoutExpired:
                    os.killpg(proc.pid,signal.SIGKILL);proc.communicate();return None,"TIMEOUT"
                if proc.returncode:return None,"RUNTIME_REFUSED"
            proof=strict_body(out,128000,24)
            fields(proof,("receipt","pattern_request","pattern_receipt","bound_receipt") if context is not None else ("receipt","pattern_request","pattern_receipt"))
            result=proof["receipt"];v2=proof["pattern_receipt"];q2=proof["pattern_request"]
            require(v2["schema"]=="tacit-b.kuiper-execution.v2" and v2["legacy_receipt"]==result,"V2_LEGACY")
            require({k:v for k,v in q2.items() if k not in ("schema","pattern_sha256")}=={k:v for k,v in q.items() if k!="schema"},"V2_REQUEST_BINDING")
            require(v2["request_sha256"]==sha(bcanon(q2)) and v2["pattern_sha256"]==q2["pattern_sha256"]==sha(bcanon(v2["pattern"])),"V2_PATTERN_BINDING")
            require(v2["result_sha256"]==sha(bcanon(v2["result"])) and v2["receipt_sha256"]==sha(bcanon({k:v for k,v in v2.items() if k!="receipt_sha256"})),"V2_RESULT_BINDING")
            require(v2["result"]["output"]==result["output"] and v2["result"]["state"]==result["state"] and v2["rights"]=="BLOCKED","V2_RESULT")
            if context is not None:
                bound=proof["bound_receipt"]
                require(bound["schema"]=="tacit-b.execution-context.v1" and bound["context"]==context and bound["request"]==q2 and bound["pattern_receipt"]==v2,"B1_CONTEXT")
                require(bound["origin_authentication"]=="HOST_REQUIRED" and bound["rights"]=="BLOCKED" and bound["receipt_sha256"]==sha(bcanon({k:v for k,v in bound.items() if k!="receipt_sha256"})),"B1_CONTEXT_RECEIPT")
            require(result["request_sha256"]==sha(bcanon(q)),"RUNTIME_REQUEST")
            require(result["receipt_sha256"]==sha(bcanon({k:v for k,v in result.items() if k!="receipt_sha256"})),"RUNTIME_RECEIPT")
            require(result["rights"]=="BLOCKED","RUNTIME_RIGHTS")
            if q["operation"]=="orient":
                require(result["state"]=="EXECUTED_INTERNAL" and result["archive_sha256"]==ARCHIVE and result["descriptor_sha256"]==DESCRIPTOR and result["admission"] is True,"RUNTIME_ADMISSION")
            else:require(result["state"]=="REFUSED" and result["admission"] is False and result["output"] is None,"RUNTIME_REFUSAL")
            return proof,None
        except (OSError,ValueError,KeyError,TypeError,subprocess.SubprocessError):return None,"RUNTIME_UNAVAILABLE"
        finally:self.lock.release()
def worker(stage,bonds):
    import resource
    resource.setrlimit(resource.RLIMIT_CPU,(25,25))
    resource.setrlimit(resource.RLIMIT_FSIZE,(8_000_000,8_000_000))
    resource.setrlimit(resource.RLIMIT_NOFILE,(128,128))
    validate_stage(stage,bonds)
    sys.path[:0]=[str(stage/"factory"/"tools"),str(stage/"b"/"tools")]
    import package_factory as f
    import typed_package_execution as t
    from tacit_b_patterns import PatternBridge
    from kuiper_select import Space
    wire=strict_body(sys.stdin.buffer.read(MAX_BODY+1));fields(wire,("request","context"));q=wire["request"];context=wire["context"]
    require(q["operation"] in OPS,"OPERATION")
    bridge=PatternBridge(f,t,Space,manifest_bytes(bonds),exact_file(stage/"package.zip",ARCHIVE),
                  f.strict((stage/"build-receipt.json").read_bytes()),None,None,None)
    q2=bridge.request_v2(q["operation"],q["inputs"])
    require(q2["keys"]==q["keys"] and q2["manifest_sha256"]==q["manifest_sha256"],"V2_SELECTION")
    if context is not None:
        from tacit_b_convergence import bind_execution
        bound=bind_execution(bridge,q2,context);r2=bound["pattern_receipt"]
    else:r2=bridge.execute_raw(f.canonical(q2))
    proof={"receipt":r2["legacy_receipt"],"pattern_request":q2,"pattern_receipt":r2}
    if context is not None:proof["bound_receipt"]=bound
    print(f.canonical(proof).decode(),end="")
def execute_envelope(space,body,runtime,match_receipt,context=None):
    fields(body,("request","query","selection_receipt_sha256","generation"))
    generation=body["generation"];require(type(generation) is int and 0<=generation<=2**53-1,"GENERATION")
    fields(body["request"],("schema","operation","manifest_sha256","keys","inputs"))
    q=body["request"];require(type(q["operation"]) is str and q["operation"] in OPS,"OPERATION")
    require(type(body["query"]) is dict and all(type(v) is str for v in body["query"].values()),"QUERY")
    require(type(q["keys"]) is list and all(type(k) is str and k.isascii() and k.isdigit() for k in q["keys"]),"KEYS")
    require(type(body["selection_receipt_sha256"]) is str and len(body["selection_receipt_sha256"])==64,"SELECTION_RECEIPT")
    pending=match_receipt(space,None,{k:v for k,v in body.items() if k!="generation"})
    base={"schema":"kuiper.local-execution.v1","generation":generation,"selection_receipt_sha256":body["selection_receipt_sha256"],
          "request_sha256":pending["request_sha256"],"pattern_sha256":pending["pattern_sha256"],"review":"PENDING_EXACT_REQUEST_REVIEW","rights":"BLOCKED"}
    if runtime is None:return 503,{**base,"state":"RUNTIME_UNAVAILABLE","receipt":None}
    proof,err=runtime.run(q,context)
    if err:return (429 if err=="BUSY" else 422 if err=="RUNTIME_REFUSED" else 503),{**base,"state":err,"receipt":None}
    result=proof["receipt"]
    require(result["pattern_sha256"]==pending["pattern_sha256"],"RUNTIME_PATTERN")
    return 200,{**base,"state":result["state"],"receipt":result,"output":result["output"],"archive_sha256":result["archive_sha256"],"pattern_request":proof["pattern_request"],"pattern_receipt":proof["pattern_receipt"],**({"bound_receipt":proof["bound_receipt"]} if context is not None else {})}
if __name__=="__main__":
    if len(sys.argv)==5 and sys.argv[1]=="--vedic-worker":
        import resource
        resource.setrlimit(resource.RLIMIT_CPU,(60,60))
        resource.setrlimit(resource.RLIMIT_FSIZE,(8_000_000,8_000_000))
        resource.setrlimit(resource.RLIMIT_NOFILE,(128,128))
        from kuiper_vedic import worker as vedic_worker
        print(bcanon(vedic_worker(Path(sys.argv[2]),Path(sys.argv[3]),Path(sys.argv[4]),strict_body(sys.stdin.buffer.read(128001),128000,24))).decode(),end="")
    else:
        require(len(sys.argv)==4 and sys.argv[1]=="--worker","WORKER_ARGS")
        worker(Path(sys.argv[2]),Path(sys.argv[3]))
