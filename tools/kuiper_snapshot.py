#!/usr/bin/env python3
"""Candidate-only data handoff; no network writes, no harvest, no publisher."""
import argparse
import collections
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import subprocess

PATHS = ("cosmos/wafer.tsv", "cosmos/repos.tsv", "cosmos/wafer-meta.json",
         "cosmos/standing.tsv", "cosmos/pulse.tsv")
PIN = re.compile(r"[0-9a-f]{40}")
DEC = re.compile(r"0|[1-9][0-9]*")

def need(ok, why):
    if not ok:
        raise ValueError(why)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def canonical(obj):
    return (json.dumps(obj, sort_keys=True, separators=(",", ":")) + "\n").encode()

def parse_json(body):
    def pairs(items):
        d = {}
        for k, v in items:
            need(k not in d, "duplicate JSON key")
            d[k] = v
        return d
    return json.loads(body, object_pairs_hook=pairs)

def integer(value):
    need(isinstance(value, str) and DEC.fullmatch(value), "invalid exact decimal")
    return int(value)

def utc(t):
    return dt.datetime.fromtimestamp(t, dt.timezone.utc).isoformat().replace("+00:00", "Z")

def rows(body, width):
    result = []
    for line in body.decode("utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        need(len(parts) == width, "register width")
        result.append(parts)
    need(result, "empty register")
    return result

def read_pin(repo, pin):
    need(PIN.fullmatch(pin), "full immutable commit required")
    def git(*args):
        return subprocess.check_output(["git", "-C", str(repo), *args], timeout=120)
    need(git("rev-parse", pin+"^{commit}").decode().strip() == pin, "wrong commit")
    return {p: git("show", pin+":"+p) for p in PATHS}

def verify_register(data):
    need(set(data) == set(PATHS), "member set")
    repo_rows = rows(data[PATHS[1]], 3)
    names, counts = [], []
    for i, name, count in repo_rows:
        need(integer(i) == len(names) and name and name.lower() not in names, "repo identity")
        names.append(name.lower())
        counts.append(integer(count))
    wafer = rows(data[PATHS[0]], 5)
    sums = collections.Counter()
    seen = set()
    prev, silent = None, 0
    for t, n, i, sha, g in wafer:
        t, n, i, g = map(integer, (t,n,i,g))
        need(i < len(names) and n > 0 and re.fullmatch(r"[0-9a-f]{12}", sha), "wafer identity")
        need((i,sha) not in seen, "duplicate wafer identity")
        need(prev is None or t >= prev, "wafer order")
        need(g == (0 if prev is None else 600 * min(t-prev,1209600)), "gap law")
        seen.add((i,sha))
        sums[i] += n
        silent += g
        prev = t
    need(all(sums[i] == count for i,count in enumerate(counts)), "per-repo total")
    issued = sum(counts)
    m = parse_json(data[PATHS[2]])
    expected = dict(issued_keys=issued, unissued_keys=silent, address_space=issued+silent,
                    commits=len(wafer), repositories=len(names), first_unix=integer(wafer[0][0]),
                    last_unix=prev, gap_keys_per_second=600, cap_seconds=1209600)
    need(all(type(m.get(k)) is int and m[k] == v for k,v in expected.items()), "wafer metadata")
    standing = rows(data[PATHS[3]],5)
    standing_names = set()
    files = lines = 0
    for name, sha, t, f, n in standing:
        need(name and name.lower() not in standing_names and re.fullmatch(r"[0-9a-f]{12}",sha), "standing identity")
        standing_names.add(name.lower())
        integer(t)
        files += integer(f)
        lines += integer(n)
    pulse = [list(map(integer,r)) for r in rows(data[PATHS[4]],5)]
    need(all(a[0] <= b[0] for a,b in zip(pulse,pulse[1:])), "pulse order")
    t, measured, missed, f, n = pulse[-1]
    need((measured,f,n) == (len(standing),files,lines), "standing/pulse mismatch")
    disclosed = sum(l.startswith("# missed\t") for l in data[PATHS[3]].decode().splitlines())
    need(disclosed == missed, "missed count mismatch")
    return expected, dict(measured=measured,missed=missed,files=files,lines=str(lines),
                          measured_utc=utc(t), indexed_utc=utc(prev))

def append_only(previous, current):
    old = rows(previous[PATHS[0]],5)
    new = rows(current[PATHS[0]],5)
    need(new[:len(old)] == old, "permanent wafer rows changed")
    a = rows(previous[PATHS[1]],3)
    b = rows(current[PATHS[1]],3)
    need([r[:2] for r in b[:len(a)]] == [r[:2] for r in a], "repo indices changed")
    return len(new)-len(old)

def counter_gate(body, data, pin, meta, coverage):
    c = parse_json(body)
    need(not c.get("fixture_only") and c.get("schema_version")==1 and
         c.get("calculation_version")=="kuiper-counter-v1", "counter schema/fixture")
    need(c.get("wafer_commit")==pin and c.get("as_of_utc")==coverage["indexed_utc"], "counter pin/cutoff")
    need(c.get("inputs")=={p:digest(data[p]) for p in PATHS[:4]}, "counter input hashes")
    metrics = c["metrics"]
    total = metrics["total_historical_line_occurrences"]
    need(total.get("status")=="measured" and total.get("population")=="pinned_wafer_all_text" and
         integer(total["value"])==meta["issued_keys"], "counter total")
    u = metrics["unique_code_lines"]
    s = metrics["same_cohort_source_line_occurrences"]
    status = u["status"]
    need(status in ("measured","partial","unavailable") and s["status"]==status, "unique status")
    need(u["population"]=="public_pinned_wafer_source" and s["population"]=="public_pinned_wafer_source_nonblank", "unique population")
    cov = u["coverage"]
    for noun in ("repositories","commits"):
        x,y = cov[noun+"_measured"],cov[noun+"_target"]
        need(type(x) is int and type(y) is int and 0<=x<=y, "unique coverage")
        if status=="measured":
            need(x==y and y>0, "incomplete measured count")
        if status=="unavailable":
            need(x==0, "unavailable coverage")
    if status=="partial":
        need(cov["repositories_measured"]>0 and cov["commits_measured"]>0 and
             (cov["repositories_measured"]<cov["repositories_target"] or cov["commits_measured"]<cov["commits_target"]), "partial coverage")
    if status=="unavailable":
        need(u["value"] is None and s["value"] is None, "unavailable must be null")
    else:
        need(integer(u["value"])<=integer(s["value"])<=meta["issued_keys"], "unique bounds")
    return status

def assemble(data, pin, counter=None, previous=None):
    need(PIN.fullmatch(pin), "invalid source pin")
    m, coverage = verify_register(data)
    if previous is not None:
        verify_register(previous)
        append_only(previous,data)
    status = "missing"
    members = dict(data)
    if counter is not None:
        status = counter_gate(counter,data,pin,m,coverage)
        members["counter.json"] = counter
    result = dict(schema="kuiper-data-snapshot-v1", wafer_commit=pin,
                  members={p:{"sha256":digest(b),"bytes":len(b)} for p,b in sorted(members.items())},
                  register={k:str(m[k]) for k in ("issued_keys","unissued_keys","address_space","commits","repositories")},
                  coverage=coverage, counter_status=status,
                  layers={"see_through":{"status":"unavailable","reason":"no generation-bound layer receipt"}},
                  publication_status="candidate_only", blockers=["owner_policy_and_B_release_not_admitted"])
    if status=="missing":
        result["blockers"].append("counter_receipt_missing")
    if coverage["missed"]:
        result["blockers"].append("standing_coverage_incomplete")
    # No age computed into immutable manifest; consumers compute age at read time.
    return result,members

def verify_bundle(manifest_bytes, members):
    obj = parse_json(manifest_bytes)
    counter = members.get("counter.json")
    expected,_ = assemble({p:members[p] for p in PATHS},obj["wafer_commit"],counter)
    need(set(members)==set(expected["members"]), "extra or missing payload")
    need(canonical(expected)==manifest_bytes,"manifest or member mismatch")
    return expected

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo",default=".")
    p.add_argument("--pin",required=True)
    p.add_argument("--previous")
    p.add_argument("--counter")
    p.add_argument("--out",required=True)
    a=p.parse_args()
    data=read_pin(a.repo,a.pin)
    prev=read_pin(a.repo,a.previous) if a.previous else None
    receipt=Path(a.counter).read_bytes() if a.counter else None
    manifest,members=assemble(data,a.pin,receipt,prev)
    body=canonical(manifest)
    verify_bundle(body,members)
    target=Path(a.out)/digest(body)
    target.mkdir(parents=True,exist_ok=True)
    for path,b in members.items():
        dest=target/path
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(b)
    (target/"manifest.json").write_bytes(body)
    print(json.dumps({"snapshot_sha256":digest(body),"manifest":manifest},indent=2))

if __name__=="__main__":
    main()
