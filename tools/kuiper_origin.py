"""E1 authenticated local origin, bounded session and selective stale receipt status.
Trust anchor is provisioned independently by the launcher, not by this HTTP server.
"""
import json,os,re,stat,subprocess,tempfile,threading,sys
from pathlib import Path
from kuiper_runtime import bcanon,sha,require,fields,strict_body,MANIFEST,OPS,offline,exact_file,pinned_checkout

A1_SHA="1233591210b19b006bb5970ecc85bdf0e5951cc3bef92e5e670871a4da0ca9e3"
B1_SHA="a5540a0978117750fd54739e423dbd4e7c0150ce1eba81d5139609ed2db7ee97"
def hex64(v):return type(v) is str and re.fullmatch("[0-9a-f]{64}",v) is not None
def command(*args):
    return subprocess.check_output(["openssl",*args],timeout=5,stderr=subprocess.DEVNULL,env={"PATH":os.environ["PATH"],"HOME":"/nonexistent"})
def der_to_raw(der):
    # OpenSSL emits ASN.1 DER ECDSA; WebCrypto expects fixed-width IEEE P1363.
    require(8<=len(der)<=72 and der[0]==48 and der[1]==len(der)-2,"SIGNATURE_DER")
    i=2;out=[]
    for _ in range(2):
        require(i+2<=len(der) and der[i]==2,"SIGNATURE_INTEGER")
        n=der[i+1];i+=2
        require(1<=n<=33 and i+n<=len(der),"SIGNATURE_INTEGER_SIZE")
        v=der[i:i+n];i+=n
        require(not v[0]&128 and (len(v)==1 or v[0]!=0 or v[1]&128),"SIGNATURE_INTEGER_CANONICAL")
        num=int.from_bytes(v,"big")
        require(0<num<0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551,"SIGNATURE_SCALAR")
        out.append(num.to_bytes(32,"big"))
    require(i==len(der),"SIGNATURE_TRAILING")
    return b"".join(out)

class Origin:
    def __init__(self,key,stage,events):
        offline()
        self.key=key.resolve()
        st=key.lstat()
        require(stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and not st.st_mode&0o077,"PRIVATE_KEY_MODE")
        require(not key.is_symlink(),"KEY_SYMLINK")
        self.spki=command("pkey","-in",str(self.key),"-pubout","-outform","DER")
        require(len(self.spki)==91 and self.spki[:27].hex()=="3059301306072a8648ce3d020106082a8648ce3d03010703420004","P256_ONLY")
        self.key_id=sha(self.spki)
        self.events=events
        self.lock=threading.Lock();self.challenges=set();self.issued={};self.history=[];self.stale=set();self.previews=set()
        pinned_checkout(stage/"a1","46d21c7ef45c1133d1ef24039a79b8dd9978d667")
        sys.path.insert(0,str(stage/"a1"/"tools"))
        from tacit_a1_properties import Space
        from tacit_a1_invalidation import Ledger
        self.ledger=Ledger(Space(stage),stage)
        self.refresh()
    def refresh(self):
        # Local operator only, atomic replacement, append-only while process lives.
        # No HTTP mutation route. A corrupt/rolled-back snapshot fails closed.
        st=self.events.lstat()
        require(stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and not st.st_mode&0o077 and 0<st.st_size<=32000,"EVENT_FILE")
        current=strict_body(self.events.read_bytes())
        fields(current,("schema","events"));require(current["schema"]=="kuiper.local-source-events.v1","EVENT_SCHEMA")
        rows=current["events"];require(type(rows) is list and len(rows)<=128 and rows[:len(self.history)]==self.history,"EVENT_ROLLBACK")
        # Ledger owns all source-to-pattern impact semantics. Apply the exact
        # appended events; fail closed on malformed input; no browser authority.
        for e in rows[len(self.history):]:
            require(type(e) is dict and e.get("kind") in ("source","presentation","property","closure"),"EVENT_KIND")
            if e["kind"]=="source":
                fields(e,("kind","source","new_blob"))
                require(type(e["new_blob"]) is str and re.fullmatch("[0-9a-f]{40}",e["new_blob"]) and e["new_blob"]!=e["source"]["blob"],"EVENT_BLOB")
            self.ledger.apply(e)
            self.history.append(e)
        self.stale=set(self.ledger.snapshot()["blocked"])
    def sign(self,payload):
        raw=bcanon(payload)
        with tempfile.TemporaryDirectory(prefix="kuiper-origin-") as tmp:
            path=Path(tmp)/"payload";path.write_bytes(raw)
            sig=der_to_raw(command("dgst","-sha256","-sign",str(self.key),str(path)))
        require(len(sig)==64,"SIGNATURE_SIZE")
        return {"payload":raw.decode("ascii"),"signature":sig.hex(),"key_id":self.key_id}
    def handle(self,body,execute,status_only=False):
        with self.lock:
            challenge=body.get("challenge")
            require(hex64(challenge) and challenge not in self.challenges and len(self.challenges)<4096,"CHALLENGE_REUSE_OR_LIMIT")
            self.challenges.add(challenge)
            self.refresh()
            if status_only:
                fields(body,("challenge","generation","operation","receipt_sha256"))
                op=body["operation"];rid=body["receipt_sha256"]
                require(type(op) is str and op in OPS and hex64(rid),"STATUS_FIELDS")
                require(type(body["generation"]) is int and 0<=body["generation"]<=2**53-1,"GENERATION")
                require(self.issued.get(rid)==op,"UNKNOWN_RECEIPT")
                status=200;result={"schema":"kuiper.receipt-status.v1","generation":body["generation"],"operation":op,"receipt_sha256":rid,
                    "state":"STALE_HISTORICAL_PRESERVED" if op in self.stale else "CURRENT_FOR_PINNED_INPUT","rights":"BLOCKED"}
            else:
                fields(body,("challenge","generation","request","query","selection_receipt_sha256"))
                op=body["request"]["operation"];require(type(op) is str and op in OPS,"OPERATION")
                args={k:v for k,v in body.items() if k!="challenge"}
                # Existing exact selection/request checks execute even for stale operations,
                # but never call the mathematical worker if the dependency is invalidated.
                if op in self.stale:
                    status,result=execute(args,False,None)
                    result.update(state="STALE_DEPENDENCY",receipt=None)
                    status=409
                else:
                    epoch=self.ledger.begin(op)
                    status,result=execute(args,True,{"generation":body["generation"],"selection_receipt_sha256":body["selection_receipt_sha256"],"challenge":challenge})
                    self.refresh()
                    if op in self.stale:
                        status=409;result={k:v for k,v in result.items() if k not in ("receipt","output","pattern_request","pattern_receipt","archive_sha256","bound_receipt")}
                        result.update(state="STALE_DEPENDENCY",receipt=None)
                    elif status==200:
                        self.ledger.assert_current(op,epoch)
                        rid=self.ledger.record_runtime(result["pattern_request"],result["pattern_receipt"],epoch)
                    if status==200 and result["state"]=="EXECUTED_INTERNAL":
                        require(len(self.issued)<4096 or rid in self.issued,"RECEIPT_LIMIT")
                        self.issued[rid]=op
            return status,self.sign({**result,"auth_schema":"kuiper.runtime-origin.p256.v1","challenge":challenge,"dependency_epoch":len(self.history),"stale_operations":sorted(self.stale)})

    def vedic(self,body,runtime,selected,execute=False):
        with self.lock:
            fields(body,("instruction","inputs","generation","challenge","plan_sha256") if execute else ("instruction","inputs","generation","challenge"))
            challenge=body["challenge"];generation=body["generation"]
            require(hex64(challenge) and challenge not in self.challenges and len(self.challenges)<4096,"CHALLENGE_REUSE_OR_LIMIT")
            require(type(generation) is int and 0<=generation<=2**53-1,"GENERATION")
            require(type(body["instruction"]) is str and 0<len(body["instruction"])<=1024 and type(body["inputs"]) is dict,"INSTRUCTION")
            if execute:require(hex64(body["plan_sha256"]),"PLAN_DIGEST")
            self.challenges.add(challenge);self.refresh()
            context={"generation":generation,"selection_receipt_sha256":selected["receipt_sha256"],"challenge":challenge}
            keys=[x["key"] for x in selected["rows"]]
            def reply(status,state,plan=None,receipt=None):
                result={"schema":"kuiper.vedic-execution.v1" if execute else "kuiper.vedic-plan.v1","state":state,"plan":plan,"generation":generation,"rights":"BLOCKED","auth_schema":"kuiper.runtime-origin.p256.v1","challenge":challenge,"dependency_epoch":len(self.history),"stale_operations":sorted(self.stale)}
                if execute:result["compound_receipt"]=receipt
                return status,self.sign(result)
            def call(digest):
                return runtime.vedic({"instruction":body["instruction"],"inputs":body["inputs"],"context":context,"plan_sha256":digest,"selection_keys":keys,"event_prefix":self.history},self.events)
            proof,err=call(None)
            self.refresh()
            if err:return reply(503,err)
            plan=proof["plan"]
            require(plan["schema"]=="vedic.compound-plan.v1" and plan["instruction"]==body["instruction"] and plan["inputs"]==body["inputs"] and plan["plan_sha256"]==sha(bcanon({k:v for k,v in plan.items() if k!="plan_sha256"})),"PLAN_BINDING")
            require(plan["manifest_sha256"]==MANIFEST and len(plan["steps"])<=8 and all(x["operation"]=="orient" and x["keys"]==keys for x in plan["steps"]),"PLAN_SCOPE")
            require(plan["state"] in ("PLAN_PROPOSED","PARTIAL_PLAN","ABSTAIN"),"PLAN_STATE")
            if not execute:
                if plan["state"]!="ABSTAIN":
                    require(len(self.previews)<4096 or plan["plan_sha256"] in self.previews,"PREVIEW_LIMIT")
                    self.previews.add(plan["plan_sha256"])
                return reply(200,plan["state"],plan)
            if plan["plan_sha256"]!=body["plan_sha256"]:return reply(409,"PLAN_MISMATCH",plan)
            if plan["state"]=="ABSTAIN":return reply(200,"ABSTAIN",plan)
            if plan["plan_sha256"] not in self.previews:return reply(409,"PLAN_NOT_PREVIEWED",plan)
            if "orient" in self.stale:return reply(409,"STALE_DEPENDENCY",plan)
            epoch=self.ledger.begin("orient")
            proof,err=call(plan["plan_sha256"]);self.refresh()
            if "orient" in self.stale:return reply(409,"STALE_DEPENDENCY",plan)
            if err:return reply(503,err,plan)
            require(proof["plan"]==plan,"WORKER_PLAN")
            receipt=proof["compound_receipt"]
            require(receipt["schema"]=="tacit-b.compound-execution.v1" and receipt["plan"]==plan and receipt["context"]==context and receipt["rights"]=="BLOCKED","COMPOUND_BINDING")
            require(receipt["receipt_sha256"]==sha(bcanon({k:v for k,v in receipt.items() if k!="receipt_sha256"})),"COMPOUND_SEAL")
            require(receipt["state"]==("PARTIAL_EXECUTED" if plan["comparison"] else "EXECUTED_INTERNAL") and len(receipt["steps"])==len(plan["steps"]),"COMPOUND_STATE")
            if plan["comparison"]:
                comp=receipt["comparison"]
                require(comp["value"] is None and comp["state"]=="REFUSED_NOT_ADMITTED" and comp["depends_on"]==plan["comparison"]["depends_on"],"COMPARISON_ADMISSION")
            else:require(receipt["comparison"] is None,"COMPARISON_SCOPE")
            for step,result in zip(plan["steps"],receipt["steps"]):
                bound=result["bound_receipt"];q=bound["request"];v2=bound["pattern_receipt"]
                require(result["id"]==step["id"] and result["from_point"]==step["from_point"] and result["to_point"]==step["to_point"] and result["units"]==step["outputs"] and q["inputs"]==step["inputs"] and q["keys"]==keys,"STEP_BINDING")
                require(bound["context"]==context and bound["rights"]=="BLOCKED" and bound["receipt_sha256"]==sha(bcanon({k:v for k,v in bound.items() if k!="receipt_sha256"})) and v2["result"]["output"]==result["values"] and v2["result"]["state"]=="EXECUTED_INTERNAL","STEP_RECEIPT")
                self.ledger.record_runtime(q,v2,epoch)
            self.refresh()
            if "orient" in self.stale:return reply(409,"STALE_DEPENDENCY",plan)
            self.ledger.assert_current("orient",epoch)
            rid=receipt["receipt_sha256"]
            require(len(self.issued)<4096 or rid in self.issued,"RECEIPT_LIMIT")
            self.issued[rid]="orient"
            return reply(200,receipt["state"],plan,receipt)
