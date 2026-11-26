"""Kuiper sparse computation: read A's exact evidence, select existing keys.
No registry, identity allocation, execution permission or redistribution. Python stdlib.
Run: python tools/kuiper_select.py bonds.zip --module Vg
      python tools/kuiper_select.py bonds.zip --meaning GG2050-VEDIC-000001
      python tools/kuiper_select.py bonds.zip --self-test
"""
import argparse, hashlib, json, subprocess, zipfile
from pathlib import Path

ZIP_SHA="649209e8723af1efd4c73f85ebd90b524a2312907d8a5e24759c8bf72ad1f72a"
JSON_SHA="821abf96d3e4c2f42e61d578dcefdfbda366c145b067f9cc9206fdaa91b6cf2d"
LAW_BLOB="c506a252f27fa8b80e849eb63bbb6699eaf674f0"
LAW=Path(__file__).resolve().parents[1]/"learn-the-kuiper/202610050609/kuiper-law.js"
FIELDS=("repo","commit","path","blob","first","last")

def require(ok, why):
    if not ok: raise ValueError(why)

def sha(raw): return hashlib.sha256(raw).hexdigest()
def canonical(v): return json.dumps(v,sort_keys=True,separators=(",",":"),allow_nan=False).encode()
def occ(s): return tuple(s[k] for k in FIELDS)

def load(path):
    raw=path.read_bytes()
    require(sha(raw)==ZIP_SHA,"ZIP_PIN")
    with zipfile.ZipFile(path) as z:
        matches=[x for x in z.infolist() if x.filename=="bonds.json" or x.filename.endswith("/bonds.json")]
        require(len(matches)==1 and matches[0].file_size<=2_000_000,"MEMBER")
        data=z.read(matches[0])
    require(sha(data)==JSON_SHA,"MANIFEST_PIN")
    return json.loads(data)

class Space:
    def __init__(self,manifest):
        require(manifest["schema"]=="vedic.tacit-a.typed-bond-manifest.v1","SCHEMA")
        require(manifest["admission"]=="UNCHANGED" and manifest["redistribution"]=="BLOCKED","AUTHORITY")
        self.by_key={}; self.by_meaning={}; self.by_occ={}; self.properties={}
        for row in manifest["source_entries"]:
            k=row["kuiper"]["key"]; s=occ(row["source"]); m=row["meaning_id"]
            require(type(k) is int and 0<=k<row["kuiper"]["wafer_address_space"],"KEY_RANGE")
            require(row["kuiper"]["state"]=="PINNED_PRODUCER_RECEIPT_MATCH_NOT_WAFER_REPLAY","KEY_EVIDENCE")
            require(k not in self.by_key and s not in self.by_occ and m not in self.by_meaning,"DUPLICATE_IDENTITY")
            require(row["module_classification"]["state"]=="PRODUCER_DECLARED_MODULE_CLASSIFICATION_ONLY","MODULE_SCOPE")
            self.by_key[k]=row; self.by_occ[s]=k; self.by_meaning[m]=k
            self.properties[k]={}
        for p in manifest["properties"]:
            k=self.by_occ.get(occ(p["source_occurrence"])); require(k is not None,"DANGLING_PROPERTY")
            name=p["property"]; require(name not in self.properties[k],"DUPLICATE_PROPERTY")
            require(p["state"] in ("OBSERVED","DERIVED","UNKNOWN"),"PROPERTY_STATE")
            require(p["state"]!="UNKNOWN" or p["value"] is None,"UNKNOWN_VALUE")
            self.properties[k][name]=p
        require(len(self.by_key)==8 and sum(map(len,self.properties.values()))==32,"COHORT")
        require(all(len(p)==4 for p in self.properties.values()),"INCOMPLETE_PROPERTY_SET")
        self.bonds=manifest["typed_bonds"]
        require(len(self.bonds)==5 and all(b["type"]=="candidate_typed_data_bond" for b in self.bonds),"BOND_SCOPE")

    def select(self,*,module=None,meaning=None,property_name=None,state=None,key_min=None,key_max=None):
        require(any(x is not None for x in (module,meaning,property_name,key_min,key_max)),"EMPTY_QUERY")
        require(state is None or property_name is not None,"STATE_WITHOUT_PROPERTY")
        require(state is None or state in ("OBSERVED","DERIVED","UNKNOWN"),"INVALID_STATE")
        require(key_min is None or key_max is None or key_min<=key_max,"INVERTED_RANGE")
        if meaning is not None: require(meaning in self.by_meaning,"UNKNOWN_MEANING")
        if module is not None: require(module in {r["module_classification"]["symbol"] for r in self.by_key.values()},"UNKNOWN_MODULE")
        if property_name is not None: require(any(property_name in x for x in self.properties.values()),"UNKNOWN_PROPERTY")
        return tuple(sorted(k for k,r in self.by_key.items()
          if (module is None or r["module_classification"]["symbol"]==module)
          and (meaning is None or r["meaning_id"]==meaning)
          and (key_min is None or k>=key_min) and (key_max is None or k<=key_max)
          and (property_name is None or (property_name in self.properties[k] and
            (state is None or self.properties[k][property_name]["state"]==state)))))

    def project(self,keys):
        # Reuse the original JS law. No duplicate production placement formula.
        raw=LAW.read_bytes()
        blob=hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()
        require(blob==LAW_BLOB,"LAW_PIN")
        require(all(k in self.by_key for k in keys),"UNBOUND_KEY")
        script="const law=require(process.argv[1]);let ks=JSON.parse(process.argv[2]);console.log(JSON.stringify(ks.map(k=>law.place(k))));"
        return json.loads(subprocess.check_output(["node","-e",script,str(LAW),json.dumps(list(keys))],timeout=20))

    def receipt(self,query):
        keys=self.select(**query)
        return {"schema":"kuiper.sparse-selection.v1","manifest_sha256":JSON_SHA,"law_blob":LAW_BLOB,
          "query":query,"keys":keys,"positions":self.project(keys),"candidate_bonds":len(self.bonds),
          "authority":"SELECTION_ONLY_NO_EXECUTION","redistribution":"BLOCKED"}

def self_test(m):
    import copy,math
    s=Space(m); checks=[]
    def check(n,ok): require(ok,n); checks.append(n)
    def reject(n,f):
        try: f()
        except ValueError: checks.append(n)
        else: raise AssertionError(n)
    vg=s.select(module="Vg"); vn=s.select(module="Vn"); vd=s.select(module="Vd")
    check("module cardinalities",[len(vg),len(vn),len(vd)]==[2,2,4])
    check("module disjoint union",len(set(vg)|set(vn)|set(vd))==8)
    ids=["GG2050-VEDIC-000001","GG2050-VEDIC-000005"]
    check("VEDIC and machine selection parity",tuple(sorted(k for i in ids for k in s.select(meaning=i)))==vg)
    check("property intersection",s.select(module="Vd",property_name="runtime_effects",state="UNKNOWN")==vd)
    check("unknown is not observed",s.select(property_name="runtime_effects",state="OBSERVED")==())
    check("range exact",s.select(key_min=vg[0],key_max=vg[0])==(vg[0],))
    check("range outside cohort",s.select(key_min=0,key_max=1)==())
    for p in s.project(tuple(sorted(s.by_key))):
        k=p["key"]
        check("high-key MOD "+str(k),p["m"]==(k*2654435769)%2**32)
        check("radius "+str(k),abs(p["r"]-math.sqrt(k+0.5))<1e-9)
    check("deterministic receipt",canonical(s.receipt({"module":"Vg"}))==canonical(s.receipt({"module":"Vg"})))
    for n,q in [("empty",{}),("bad module",{"module":"fake"}),("bad meaning",{"meaning":"fake"}),("bad property",{"property_name":"fake"}),("bad state",{"module":"Vg","state":"OBSERVED"}),("inverted range",{"key_min":2,"key_max":1})]:
        reject(n,lambda q=q:s.select(**q))
    for n,mut in [
        ("duplicate",lambda x:x["source_entries"].append(x["source_entries"][0])),
        ("rights",lambda x:x.update(redistribution="CLEARED")),
        ("dangling property",lambda x:x["properties"][0]["source_occurrence"].update(first=0)),
        ("false known effect",lambda x:next(p for p in x["properties"] if p["state"]=="UNKNOWN").update(value=True)),
        ("runtime bond promotion",lambda x:x["typed_bonds"][0].update(type="runtime_verified"))]:
        z=copy.deepcopy(m);mut(z);reject(n,lambda z=z:Space(z))
    reject("unbound key",lambda:s.project([0]))
    return {"checks":checks,"count":len(checks),"cohort":8,"properties":32,"conditional_bonds":5,"selection_only":True,"rights":"BLOCKED",
      "receipt_sha256":sha(canonical(s.receipt({"module":"Vg"})))}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("manifest_zip",type=Path)
    p.add_argument("--self-test",action="store_true");p.add_argument("--module");p.add_argument("--meaning")
    p.add_argument("--property",dest="property_name");p.add_argument("--state")
    p.add_argument("--key-min",type=int);p.add_argument("--key-max",type=int)
    a=p.parse_args();m=load(a.manifest_zip)
    if a.self_test: result=self_test(m)
    else: result=Space(m).receipt({k:v for k,v in vars(a).items() if k not in ("manifest_zip","self_test") and v is not None})
    print(json.dumps(result,sort_keys=True,indent=2))
if __name__=="__main__":main()
