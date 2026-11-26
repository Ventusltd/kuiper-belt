"""E1 authenticated local origin, bounded session and selective stale receipt status.
Trust anchor is provisioned independently by the launcher, not by this HTTP server.
"""
import json,os,re,stat,subprocess,tempfile,threading
from pathlib import Path
from kuiper_runtime import bcanon,sha,require,fields,strict_body,MANIFEST,OPS,offline,exact_file

A1_SHA="1233591210b19b006bb5970ecc85bdf0e5951cc3bef92e5e670871a4da0ca9e3"
B1_SHA="a5540a0978117750fd54739e423dbd4e7c0150ce1eba81d5139609ed2db7ee97"
def hex64(v):return type(v) is str and re.fullmatch("[0-9a-f]{64}",v) is not None
def command(*args):
    return subprocess.check_output(["openssl",*args],timeout=5,stderr=subprocess.DEVNULL,env={"PATH":os.environ["PATH"],"HOME":"/nonexistent"})
class Origin:
    def __init__(self,key,stage,events):
        offline()
        self.key=key.resolve()
        st=key.lstat()
        require(stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and not st.st_mode&0o077,"PRIVATE_KEY_MODE")
        require(not key.is_symlink(),"KEY_SYMLINK")
        self.spki=command("pkey","-in",str(self.key),"-pubout","-outform","DER")
        require(len(self.spki)==44 and self.spki[:12].hex()=="302a300506032b6570032100","ED25519_ONLY")
        self.key_id=sha(self.spki)
        self.events=events
        self.lock=threading.Lock();self.challenges=set();self.issued={};self.history=[];self.stale=set()
        a=json.loads(exact_file(stage/"a1-property-impact.json",A1_SHA))
        # The large A1 artifact has a deeper producer schema than untrusted wire JSON;
        # authenticated bytes may be decoded without the wire-size/depth limits.
        self.a=a
        b=json.loads(exact_file(stage/"b1-patterns.json",B1_SHA))
        self.b=b
        require(a["base_manifest_sha256"]==MANIFEST and a["authority"]=="EVIDENCE_ONLY" and a["redistribution"]=="BLOCKED","A1_AUTHORITY")
        require(b["redistribution"]=="BLOCKED","B1_AUTHORITY")
        self.sources={}
        for op,r in [("orient",b["results"][0]),*[(op,b["refusals"][op]) for op in OPS if op!="orient"]]:
            p=r["pattern"];require(p["operation"]==op and p["manifest_sha256"]==MANIFEST,"B1_PATTERN")
            for row in p["sources"]:
                source=row["source"];key=bcanon(source)
                self.sources.setdefault(key,set()).add(op)
        require(len(self.sources)==8,"SOURCE_COHORT")
        # Cross-check the original A1 producer impacts with the final B1 source joins.
        for r in a["reverse_impacts"]:
            require(set(r["affected_patterns"])<=set(OPS),"A1_IMPACT")
        self.refresh()
    def refresh(self):
        # Local operator only, atomic replacement, append-only while process lives.
        # No HTTP mutation route. A corrupt/rolled-back snapshot fails closed.
        st=self.events.lstat()
        require(stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and not st.st_mode&0o077 and 0<st.st_size<=32000,"EVENT_FILE")
        current=strict_body(self.events.read_bytes())
        fields(current,("schema","events"));require(current["schema"]=="kuiper.local-source-events.v1","EVENT_SCHEMA")
        rows=current["events"];require(type(rows) is list and len(rows)<=128 and rows[:len(self.history)]==self.history,"EVENT_ROLLBACK")
        stale=set()
        for e in rows:
            require(type(e) is dict and e.get("kind") in ("source","presentation"),"EVENT_KIND")
            key=bcanon(e["source"]);require(key in self.sources,"EVENT_OCCURRENCE")
            if e["kind"]=="source":
                fields(e,("kind","source","new_blob"))
                require(type(e["new_blob"]) is str and re.fullmatch("[0-9a-f]{40}",e["new_blob"]) and e["new_blob"]!=e["source"]["blob"],"EVENT_BLOB")
                stale.update(self.sources[key])
            else:
                fields(e,("kind","source","field"))
                require(e["field"] in ("display_colour","classification_description"),"EVENT_PRESENTATION")
        self.history=rows;self.stale=stale
    def sign(self,payload):
        raw=bcanon(payload)
        with tempfile.TemporaryDirectory(prefix="kuiper-origin-") as tmp:
            path=Path(tmp)/"payload";path.write_bytes(raw)
            sig=command("pkeyutl","-sign","-inkey",str(self.key),"-rawin","-in",str(path))
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
                    status,result=execute(args,False)
                    result.update(state="STALE_DEPENDENCY",receipt=None)
                    status=409
                else:
                    status,result=execute(args,True)
                    self.refresh()
                    if op in self.stale:
                        status=409;result={k:v for k,v in result.items() if k not in ("receipt","output","pattern_request","pattern_receipt","archive_sha256")}
                        result.update(state="STALE_DEPENDENCY",receipt=None)
                    elif status==200 and result["state"]=="EXECUTED_INTERNAL":
                        rid=result["pattern_receipt"]["receipt_sha256"]
                        require(len(self.issued)<4096 or rid in self.issued,"RECEIPT_LIMIT")
                        self.issued[rid]=op
            return status,self.sign({**result,"auth_schema":"kuiper.runtime-origin.v1","challenge":challenge,"dependency_epoch":len(self.history),"stale_operations":sorted(self.stale)})
