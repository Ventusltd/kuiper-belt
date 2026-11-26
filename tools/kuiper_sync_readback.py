"""Read-only public byte observations. Differences are reported, never auto-promoted."""
import datetime
import hashlib
import json
import pathlib
import sys
import urllib.request

PIN="f7a4cb9e3a764a72b7133bb275bb5387ea083be2"
RAW="https://raw.githubusercontent.com/Ventusltd/"
URLS={
 "pages":("https://ventusltd.github.io/kuiper-belt/cosmos/wafer-meta.json",RAW+"kuiper-belt/"+PIN+"/cosmos/wafer-meta.json"),
 "domain_pointer":("https://globalgrid2050.com/kuiper/current.json",RAW+"globalgrid2050/5556e09813b4f0c7cf70f0ee97260f7ebb99cc85/kuiper/current.json"),
 "domain_frozen_wafer":("https://globalgrid2050.com/kuiper/releases/202609192301-kuiper-shell/cosmos/wafer-meta.json",RAW+"globalgrid2050/5556e09813b4f0c7cf70f0ee97260f7ebb99cc85/kuiper/releases/202609192301-kuiper-shell/cosmos/wafer-meta.json")
}
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":"Kuiper-C-readback","Cache-Control":"no-cache"})
    with urllib.request.urlopen(req,timeout=30) as r:
        b=r.read(2000000)
        return {"url":r.geturl(),"sha256":hashlib.sha256(b).hexdigest(),"bytes":len(b),
                "cors":r.headers.get("Access-Control-Allow-Origin"),"value":json.loads(b)}
def main():
    report={"observed_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"results":{}}
    for name,(live,pin) in URLS.items():
        try:
            a,b=get(live),get(pin)
            fields=("generation","release_id","issued_keys","address_space","last_unix")
            report["results"][name]={"served":{k:v for k,v in a.items() if k!="value"},
               "pin":{k:v for k,v in b.items() if k!="value"},
               "served_values":{k:a["value"][k] for k in fields if k in a["value"]},
               "pinned_values":{k:b["value"][k] for k in fields if k in b["value"]},
               "status":"MATCH_PIN" if a["sha256"]==b["sha256"] else "DIFFERENT_FROM_PIN"}
        except Exception as e:
            report["results"][name]={"status":"OPEN","error_type":type(e).__name__}
    out=json.dumps(report,indent=2)
    pathlib.Path(sys.argv[1]).write_text(out+"\n")
    print(out)
if __name__=="__main__":
    main()
