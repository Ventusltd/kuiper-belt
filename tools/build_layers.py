#!/usr/bin/env python3
"""Build and check the Kuiper layer registry of one edition (NL-010 roadmap step 3, Opus team 3).

    python3 tools/build_layers.py --edition 202611012135          # write data/editions.json, then measure layers.json
    python3 tools/build_layers.py --edition 202611012135 --check  # change nothing; exit 1 on any difference or refusal

What it writes (and nothing else):
  editions/<stamp>/data/editions.json  schema kuiper.editions.v1, one record per edition, built from editions/README.md
                                       (the "- **Kuiper Edition N** (`stamp`, published date)" lines), the edition's own
                                       README.md title and the pointer editions/index.html (location.replace target).
  editions/<stamp>/data/layers.json    schema kuiper.layers.v1; for every record whose source names a file it writes
                                       source.bytes, source.features and source.sha256 measured from that file.

What it refuses (exit 1, the reason printed, nothing written), as galaxies-wafers' builder "refuses to write a key the
numbered database does not contain" (galaxies-wafers@fff6fc6 README.md:18):
  - a colour that is not one of PALETTE.md's hexes (kuiper-belt PALETTE.md:9-14, :19);
  - a key outside SPACE (cosmos/wafer-meta.json "address_space"), for a keys.json body placed on the wafer or for any
    geometry key of a code-feature-collection.v1 file;
  - a record whose `requires` is not within the `requires` of the module it names (team-2/STEPS.md 3.1);
  - a record whose key is not `layer:<id>`, an id twice, an `order` that does not name every record exactly once,
    an empty licence, a format the registry does not admit.

Licence: Apache-2.0 (kuiper-belt code). The files it writes are CC BY 4.0 (kuiper-belt data, README.md:156-157).
"""
import argparse
import glob
import hashlib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMATS = {"edition-keys.v1", "code-feature-collection.v1", "kuiper.editions.v1", "engine"}


def sha256(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def palette():
    text = open(os.path.join(ROOT, "PALETTE.md"), encoding="utf-8").read()
    hexes = set()
    for line in text.splitlines():
        if line.startswith("|") and "`#" in line and "near-black" not in line:
            hexes.update(h.lower() for h in re.findall(r"`(#[0-9a-fA-F]{6})`", line))
    return hexes


def space():
    meta = json.load(open(os.path.join(ROOT, "cosmos", "wafer-meta.json"), encoding="utf-8"))
    return int(meta["address_space"])


def module_requires(edition_dir, module):
    """The `requires` the module file itself declares (the list the loader checks, ROADMAP 4.4)."""
    if not module:
        return None, "no module named"
    path = os.path.join(edition_dir, "modules", module)
    if not module.endswith(".js"):
        cands = sorted(glob.glob(os.path.join(edition_dir, "modules", "*-" + module + ".js")))
        if not cands:
            return None, "module " + module + " not yet cut"
        path = cands[-1]
    if not os.path.exists(path):
        return None, "module file " + module + " not yet cut"
    src = open(path, encoding="utf-8").read()
    m = re.search(r"REQUIRES\s*=\s*\[([^\]]*)\]", src) or re.search(r"requires\s*:\s*\[([^\]]*)\]", src)
    if not m:
        return None, "module " + os.path.basename(path) + " declares no requires"
    return set(re.findall(r"['\"]([A-Za-z0-9_-]+)['\"]", m.group(1))), os.path.basename(path)


def build_editions(edition, edition_dir):
    readme = os.path.join(ROOT, "editions", "README.md")
    rows = []
    pat = re.compile(r"^- \*\*Kuiper Edition (\d+)\*\* \(`(\d{12})`, published (\d{4}-\d\d-\d\d)\)")
    for n, line in enumerate(open(readme, encoding="utf-8"), 1):
        m = pat.match(line)
        if m:
            rows.append({"number": int(m.group(1)), "stamp": m.group(2), "published": m.group(3),
                         "status": "published", "evidence": "editions/README.md:%d" % n})
    own = os.path.join(edition_dir, "README.md")
    first = open(own, encoding="utf-8").readline()
    m = re.match(r"^# Kuiper Edition (\d+) \((\d{12})\)", first)
    if m and m.group(2) == edition and not any(r["stamp"] == edition for r in rows):
        rows.append({"number": int(m.group(1)), "stamp": edition, "published": None,
                     "status": "under construction", "evidence": "editions/%s/README.md:1" % edition})
    ptr = open(os.path.join(ROOT, "editions", "index.html"), encoding="utf-8").read()
    pm = re.search(r"location\.replace\('(\d{12})/'", ptr)
    pointer = pm.group(1) if pm else None
    rows.sort(key=lambda r: r["number"])
    for r in rows:
        s = r["stamp"]
        r["key"] = "edition:" + s
        r["cut_utc"] = "%s-%s-%sT%s:%s:00Z" % (s[0:4], s[4:6], s[6:8], s[8:10], s[10:12])
        r["path"] = "../" + s + "/"
        r["pointer"] = s == pointer
    return {"schema": "kuiper.editions.v1", "edition": edition,
            "licence": "CC BY 4.0 (kuiper-belt data, README.md:156-157)",
            "built_by": "tools/build_layers.py",
            "sources": ["editions/README.md", "editions/%s/README.md:1" % edition, "editions/index.html (location.replace)"],
            "pointer": pointer, "editions": rows}


def features_of(fmt, data, path, SPACE, refuse):
    if fmt == "kuiper.editions.v1":
        return len(data["editions"])
    if fmt == "kuiper.elements.v1":
        return len(data.get("elements", []))
    if fmt == "edition-keys.v1":
        bodies = data.get("bodies", data) if isinstance(data, dict) else data
        for b in bodies:
            if b.get("on_wafer") and b.get("verified"):
                k = b.get("key")
                if not isinstance(k, int) or not (0 <= k < SPACE):
                    refuse("%s: key %r of %s outside SPACE %d" % (path, k, b.get("id"), SPACE))
        return len(bodies)
    if fmt == "code-feature-collection.v1":
        fs = data.get("features", [])
        for f in fs:
            g = f.get("geometry") or {}
            keys = [g["key"]] if "key" in g else list(g.get("keys", []))
            for k in keys:
                if not isinstance(k, int) or not (0 <= k < SPACE):
                    refuse("%s: geometry key %r outside SPACE %d" % (path, k, SPACE))
        return len(fs)
    return 0


def measure(f, r, edir, etext, editions, SPACE, refuse):
    """bytes, features and sha256 of one source file of record r (None when the record names no file)."""
    if not f:
        return None
    if f == "data/editions.json":
        raw, data = etext.encode("utf-8"), editions
    else:
        p = os.path.join(edir, f)
        if not os.path.exists(p):
            refuse("%s: source file %s does not exist" % (r["id"], f))
            return None
        raw = open(p, "rb").read()
        data = json.loads(raw.decode("utf-8"))
    return {"bytes": len(raw), "features": features_of(r["format"], data, f, SPACE, refuse),
            "sha256": hashlib.sha256(raw).hexdigest()}


def dump(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--edition", required=True)
    ap.add_argument("--check", action="store_true", help="write nothing; exit 1 if any file would change")
    a = ap.parse_args()
    edir = os.path.join(ROOT, "editions", a.edition)
    lpath = os.path.join(edir, "data", "layers.json")
    epath = os.path.join(edir, "data", "editions.json")
    reasons = []
    refuse = reasons.append
    PAL, SPACE = palette(), space()

    editions = build_editions(a.edition, edir)
    etext = dump(editions)
    L = json.load(open(lpath, encoding="utf-8"))
    if L.get("schema") != "kuiper.layers.v1":
        refuse("layers.json schema %r is not kuiper.layers.v1" % L.get("schema"))
    ids = [r["id"] for r in L["layers"]]
    if len(set(ids)) != len(ids):
        refuse("an id appears twice: %s" % ids)
    if sorted(L["order"]) != sorted(ids) or len(set(L["order"])) != len(L["order"]):
        refuse("order %s does not name every record exactly once %s" % (L["order"], ids))

    pending = {}
    for r in L["layers"]:
        rid = r["id"]
        if r.get("key") != "layer:" + rid:
            refuse("%s: key %r is not layer:%s" % (rid, r.get("key"), rid))
        if str(r.get("colour", "")).lower() not in PAL:
            refuse("%s: colour %s is not in PALETTE.md %s" % (rid, r.get("colour"), sorted(PAL)))
        if not r.get("licence"):
            refuse("%s: empty licence" % rid)
        if r.get("format") not in FORMATS:
            if str(r.get("licence", "")).upper().startswith("UNSETTLED"):
                print("note  %-11s format %s not admitted; the record is REFUSED at run time for its licence first" % (rid, r.get("format")))
            else:
                refuse("%s: format %r not admitted" % (rid, r.get("format")))
        for f in ("label", "group", "meaning", "draws", "source", "requires", "module"):
            if f not in r:
                refuse("%s: field %s missing" % (rid, f))
        mreq, mname = module_requires(edir, r.get("module"))
        if mreq is None:
            print("note  %-11s requires not checked: %s" % (rid, mname))
        else:
            extra = set(r.get("requires", [])) - mreq
            if extra:
                refuse("%s: requires %s not within module %s requires" % (rid, sorted(extra), mname))
        src = r.get("source", {})
        for key, part in (("", src), ("fallback", src.get("fallback") or {})):
            m = measure(part.get("file"), r, edir, etext, editions, SPACE, refuse)
            if m:
                pending[(rid, key)] = m

    if reasons:
        for x in reasons:
            print("REFUSED " + x)
        print("RESULT: REFUSED (%d)" % len(reasons))
        return 1
    changed = []
    for r in L["layers"]:
        for key in ("", "fallback"):
            if (r["id"], key) not in pending:
                continue
            tgt = r["source"] if not key else r["source"]["fallback"]
            for k, v in pending[(r["id"], key)].items():
                if tgt.get(k) != v:
                    changed.append("%s.source%s.%s %r -> %r" % (r["id"], "." + key if key else "", k, tgt.get(k), v))
                    tgt[k] = v
    ltext = dump(L)
    old_e = open(epath, encoding="utf-8").read() if os.path.exists(epath) else None
    old_l = open(lpath, encoding="utf-8").read()
    if old_e != etext:
        changed.append("data/editions.json")
    if old_l != ltext and not changed:
        changed.append("data/layers.json (format)")
    for r in L["layers"]:
        s = r["source"]
        print("layer %-11s %-26s %-8s %s" % (r["id"], s.get("file") or s.get("engine") or "-",
                                            s.get("features", ""), (s.get("sha256") or "")[:12]))
    if a.check:
        for c in changed:
            print("DIFF  " + c)
        print("RESULT: " + ("PASS" if not changed else "FAIL (%d differences)" % len(changed)))
        return 0 if not changed else 1
    os.makedirs(os.path.dirname(epath), exist_ok=True)
    with open(epath, "w", encoding="utf-8") as fh:
        fh.write(etext)
    with open(lpath, "w", encoding="utf-8") as fh:
        fh.write(ltext)
    for c in changed:
        print("wrote " + c)
    print("RESULT: PASS (written)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
