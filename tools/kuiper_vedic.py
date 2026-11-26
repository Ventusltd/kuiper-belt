"""Bounded T17 adapter, reusing exact A1 Resolver and B1 compound factory.
Executed in the existing resource-limited loopback-only worker, not a second runtime.
"""
import os,sys,json,stat
from pathlib import Path
from kuiper_runtime import bcanon,sha,require,fields,strict_body,pinned_checkout,validate_stage,manifest_bytes,exact_file,ARCHIVE,MANIFEST,MAX_BODY
A17="c4d6d309940d131d2a1ae6181701086aa7221839"
B17="e0a094c8c672643f0b8a9967dea93c6ef7e4518a"

def read_events(path):
    st=path.lstat()
    require(stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and not st.st_mode&0o077 and 0<st.st_size<=MAX_BODY,"EVENT_FILE")
    x=strict_body(path.read_bytes());fields(x,("schema","events"))
    require(x["schema"]=="kuiper.local-source-events.v1" and type(x["events"]) is list and len(x["events"])<=128,"EVENT_SCHEMA")
    return x["events"]

def worker(stage,bonds,events,wire):
    validate_stage(stage,bonds)
    pinned_checkout(stage/"a17",A17);pinned_checkout(stage/"b17",B17)
    sys.path.insert(0,str(stage/"a17"/"tools"))
    from tacit_a1_semantics import Resolver
    resolver=Resolver(stage/"semantics")
    fields(wire,("instruction","inputs","context","plan_sha256","selection_keys","event_prefix"))
    plan=resolver.resolve(wire["instruction"],wire["inputs"])
    require(plan["plan_sha256"]==sha(bcanon({k:v for k,v in plan.items() if k!="plan_sha256"})),"PLAN_SEAL")
    if wire["plan_sha256"] is None:return {"plan":plan,"compound_receipt":None}
    require(wire["plan_sha256"]==plan["plan_sha256"],"PLAN_RECOMPUTATION")
    require(plan["state"] in ("PLAN_PROPOSED","PARTIAL_PLAN"),"PLAN_ABSTAIN")
    require(plan["manifest_sha256"]==MANIFEST and 1<=len(plan["steps"])<=8,"PLAN_SCOPE")
    require(all(x["operation"]=="orient" and x["keys"]==wire["selection_keys"] for x in plan["steps"]),"PLAN_SELECTION")
    from tacit_a1_properties import Space as A1Space
    from tacit_a1_invalidation import Ledger
    ledger=Ledger(A1Space(stage),stage);history=[]
    def refresh():
        rows=read_events(events)
        require(rows[:len(history)]==history and rows[:len(wire["event_prefix"])]==wire["event_prefix"],"EVENT_ROLLBACK")
        for e in rows[len(history):]:
            ledger.apply(e);history.append(e)
    refresh();epoch=ledger.begin("orient")
    def guard():
        refresh();ledger.assert_current("orient",epoch)
    sys.path[:0]=[str(stage/"factory"/"tools"),str(stage/"b17"/"tools")]
    import package_factory as f
    import typed_package_execution as t
    from tacit_b_patterns import PatternBridge
    from tacit_b_compound import execute_compound
    from kuiper_select import Space
    bridge=PatternBridge(f,t,Space,manifest_bytes(bonds),exact_file(stage/"package.zip",ARCHIVE),
                  f.strict((stage/"build-receipt.json").read_bytes()),None,None,None)
    guard()
    receipt=execute_compound(bridge,resolver,plan,wire["context"],guard)
    guard()
    return {"plan":plan,"compound_receipt":receipt}
