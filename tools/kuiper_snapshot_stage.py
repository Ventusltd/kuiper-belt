"""Ephemeral CI staging pointer, not a production publisher or web renderer."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import tempfile
from tools import kuiper_snapshot as s

HEX=re.compile(r"[a-f0-9]{64}")

def load_bundle(root, key):
    s.need(isinstance(key,str) and HEX.fullmatch(key),"invalid snapshot key")
    directory=Path(root)/key
    body=(directory/"manifest.json").read_bytes()
    s.need(s.digest(body)==key,"snapshot directory digest mismatch")
    manifest=s.parse_json(body)
    paths=set(manifest["members"])
    s.need(paths in (set(s.PATHS),set(s.PATHS)|{"counter.json"}),"unexpected member paths")
    members={p:(directory/p).read_bytes() for p in paths}
    return s.verify_bundle(body,members),members

def read_pointer(root):
    path=Path(root)/"latest.json"
    if not path.exists():
        return {"current":None,"previous":None}
    p=s.parse_json(path.read_bytes())
    s.need(set(p)=={"current","previous"} and all(v is None or isinstance(v,str) and HEX.fullmatch(v) for v in p.values()),"pointer schema")
    return p

def activate(root,key,expected,rollback=False):
    """Only used on isolated CI directory; CAS and validation precede atomic pointer change."""
    root=Path(root)
    with (root/".staging.lock").open("a") as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        p=read_pointer(root)
        s.need(p["current"]==expected,"stale writer lease")
        manifest,data=load_bundle(root,key)
        s.need(manifest["counter_status"]!="missing" and not manifest["coverage"]["missed"],"candidate incomplete")
        if key==p["current"]:
            return p
        if rollback:
            s.need(key==p["previous"],"rollback target not previous verified snapshot")
        elif p["current"]:
            _,old=load_bundle(root,p["current"])
            s.append_only(old,data)
        result={"current":key,"previous":p["current"]}
        tmp=None
        try:
            with tempfile.NamedTemporaryFile(dir=root,delete=False) as f:
                tmp=f.name
                f.write(s.canonical(result))
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp,root/"latest.json")
        finally:
            if tmp and os.path.exists(tmp):
                os.unlink(tmp)
        return result

def read_with_fallback(root,cached_key=None):
    """Simulates a reader: never serve mixed members; cached key must verify again."""
    try:
        p=read_pointer(root)
        return dict(key=p["current"],stale=False,manifest=load_bundle(root,p["current"])[0])
    except (OSError,ValueError,KeyError,TypeError):
        if cached_key is not None:
            return dict(key=cached_key,stale=True,manifest=load_bundle(root,cached_key)[0])
        raise

def main():
    p=argparse.ArgumentParser()
    p.add_argument("root")
    p.add_argument("baseline")
    p.add_argument("candidate")
    a=p.parse_args()
    root=Path(a.root)
    base=activate(root,a.baseline,None)
    new=activate(root,a.candidate,base["current"])
    s.need(read_with_fallback(root)["key"]==a.candidate,"stage readback")
    s.need(activate(root,a.candidate,a.candidate)==new,"no-change stage")
    s.need(activate(root,a.baseline,a.candidate,rollback=True)["current"]==a.baseline,"rollback")
    s.need(read_with_fallback(root)["key"]==a.baseline,"rollback readback")
    print(json.dumps({"stage":"PASS","baseline":a.baseline,"candidate":a.candidate,"rollback":a.baseline}))
if __name__=="__main__":
    main()
