#!/usr/bin/env python3
"""Read-only candidate counter. Never changes cosmos, never publishes source lines."""
import argparse
import collections
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import shutil
import time
import resource
import subprocess
import tempfile
import urllib.request

VERSION = "kuiper-counter-v1"
POLICY = "source-path-utf8-exact-v1"
INPUTS = ("cosmos/wafer.tsv", "cosmos/repos.tsv", "cosmos/wafer-meta.json", "cosmos/standing.tsv")
HEX40 = re.compile(r"[0-9a-f]{40}")
DEC = re.compile(r"0|[1-9][0-9]*")
SAFE_NAME = re.compile(r"[A-Za-z0-9_.-]+")
EXT = set(".py .pyw .js .mjs .cjs .jsx .ts .tsx .css .scss .html .htm .vue .svelte .c .h .cpp .hpp .cc .cxx .rs .go .java .kt .kts .cs .rb .php .swift .m .mm .sh .bash .ps1 .sql .lua .r .jl .f .f90 .v .sv .vhd .vhdl .sol .ino .cu .cuh .wasmtext .wat .tomlcode".split())
EXCLUDE = set("vendor vendors node_modules third_party third-party external dist build out target coverage generated data datasets docs documentation assets public static __pycache__ .venv venv .git .local cosmos proof proofs snapshots archives archive".split())
MAX_BLOB = 32 * 1024 * 1024

def require(ok, message):
    if not ok:
        raise ValueError(message)

def integer(x):
    require(isinstance(x, str) and DEC.fullmatch(x), "invalid decimal")
    return int(x)

def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args], stderr=subprocess.DEVNULL, timeout=180)

def rows(body, width):
    for line in body.decode("utf-8", "strict").splitlines():
        if line and not line.startswith("#"):
            fields = line.split("\t")
            require(len(fields) == width, "invalid register row")
            yield fields

def utc(timestamp):
    return dt.datetime.fromtimestamp(timestamp, dt.timezone.utc).isoformat().replace("+00:00", "Z")

def sha256(body):
    return hashlib.sha256(body).hexdigest()

def baseline(repo, pin):
    require(HEX40.fullmatch(pin), "wafer commit must be full SHA")
    require(git(repo, "rev-parse", pin + "^{commit}").decode().strip() == pin, "pin mismatch")
    raw = {p: git(repo, "show", pin + ":" + p) for p in INPUTS}
    meta = json.loads(raw[INPUTS[2]])
    repo_rows = {}
    names = set()
    for i, name, count in rows(raw[INPUTS[1]], 3):
        i = integer(i)
        require(i not in repo_rows and name.lower() not in names and SAFE_NAME.fullmatch(name), "bad repo identity")
        repo_rows[i] = (name, integer(count))
        names.add(name.lower())
    require(set(repo_rows) == set(range(len(repo_rows))), "repo indices not contiguous")
    commits = collections.defaultdict(list)
    sums = collections.Counter()
    seen = set()
    prev = None
    first = None
    issued = gap = 0
    for t, n, i, prefix, g in rows(raw[INPUTS[0]], 5):
        t, n, i, g = map(integer, (t, n, i, g))
        require(i in repo_rows and n > 0 and re.fullmatch(r"[0-9a-f]{12}", prefix), "bad wafer row")
        require((i, prefix) not in seen, "duplicate commit identity")
        require(prev is None or t >= prev, "wafer order violation")
        expected_gap = 0 if prev is None else 600 * min(t - prev, 1209600)
        require(g == expected_gap, "wafer gap law mismatch")
        first = t if first is None else first
        prev = t
        seen.add((i, prefix))
        sums[i] += n
        issued += n
        gap += g
        commits[i].append((t, prefix, n))
    require(seen and all(sums[i] == total for i, (_, total) in repo_rows.items()), "per-repository mismatch")
    expected = dict(issued_keys=issued, unissued_keys=gap, address_space=issued+gap,
                    commits=len(seen), repositories=len(repo_rows), first_unix=first,
                    last_unix=prev, gap_keys_per_second=600, cap_seconds=1209600)
    require(all(type(meta.get(k)) is int and meta[k] == v for k, v in expected.items()), "meta mismatch")
    standing_names = set()
    standing_files = standing_lines = 0
    for name, head, t, f, n in rows(raw[INPUTS[3]], 5):
        require(name.lower() not in standing_names and re.fullmatch(r"[0-9a-f]{12}", head), "bad standing identity")
        integer(t)
        standing_names.add(name.lower())
        standing_files += integer(f)
        standing_lines += integer(n)
    require(standing_names, "empty standing register")
    named = {i for i, (name, _) in repo_rows.items() if not name.startswith("unnamed-")}
    redacted = set(repo_rows) - named
    coverage = dict(repositories_measured=0, repositories_target=len(named),
                    commits_measured=0, commits_target=sum(len(commits[i]) for i in named),
                    redacted_repository_rows=len(redacted),
                    redacted_commit_rows=sum(len(commits[i]) for i in redacted))
    result = dict(schema_version=1, calculation_version=VERSION, classification_policy=POLICY,
                  wafer_commit=pin, as_of_utc=utc(prev), inputs={p: sha256(b) for p,b in raw.items()},
                  wafer=dict(repositories=len(repo_rows), commits=len(seen),
                             unissued_positions=str(gap), address_space=str(issued+gap)),
                  metrics={
                      "total_historical_line_occurrences": dict(status="measured", value=str(issued), population="pinned_wafer_all_text"),
                      "unique_code_lines": dict(status="unavailable", value=None, population="public_pinned_wafer_source", coverage=coverage),
                      "same_cohort_source_line_occurrences": dict(status="unavailable", value=None, population="public_pinned_wafer_source_nonblank"),
                      "current_standing_text_lines": dict(status="measured", value=str(standing_lines), population="pinned_standing_all_text", repositories=len(standing_names), files=standing_files)
                  })
    return result, repo_rows, commits, named

def eligible(path, mode):
    if mode not in (b"100644", b"100755"):
        return False
    try:
        text = path.decode("utf-8", "strict").lower()
    except UnicodeDecodeError:
        # Refuse ambiguous path classification rather than silently lose a source path.
        raise ValueError("non-UTF8 tracked path")
    parts = text.split("/")
    name = parts[-1]
    if any(p in EXCLUDE for p in parts[:-1]):
        return False
    if any(marker in name for marker in (".min.", ".bundle.", ".generated.", ".gen.", ".g.")):
        return False
    return Path(name).suffix in EXT or name in {"makefile", "dockerfile"}

def source_lines(body):
    # NUL anywhere, non-UTF8 and LFS pointer are outside source policy.
    if b"\0" in body or body.startswith(b"version https://git-lfs.github.com/spec/v1\n"):
        return
    try:
        body.decode("utf-8", "strict")
    except UnicodeDecodeError:
        return
    segments = body.split(b"\n")
    for i, line in enumerate(segments):
        if i < len(segments)-1 and line.endswith(b"\r"):
            line = line[:-1]
        if line.decode("utf-8").strip():
            yield line

def historical_lines(body):
    # Matches wafer_topup and key.py; do not change key law.
    return 0 if b"\0" in body[:8000] else body.count(b"\n") + int(bool(body) and not body.endswith(b"\n"))

class BlobReader:
    def __init__(self, repo):
        self.p = subprocess.Popen(["git", "-C", str(repo), "cat-file", "--batch"],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    def __enter__(self):
        return self
    def __exit__(self, *_):
        self.p.stdin.close()
        self.p.terminate()
        self.p.stdout.close()
        self.p.wait(timeout=10)
    def read(self, oid):
        self.p.stdin.write(oid.encode("ascii")+b"\n")
        self.p.stdin.flush()
        fields = self.p.stdout.readline().split()
        require(len(fields) == 3 and fields[0] == oid.encode() and fields[1] == b"blob", "missing or invalid blob")
        size = integer(fields[2].decode())
        require(size <= MAX_BLOB, "blob exceeds candidate resource bound")
        body = self.p.stdout.read(size)
        require(len(body) == size and self.p.stdout.read(1) == b"\n", "truncated blob")
        require(hashlib.sha1(b"blob "+str(size).encode()+b"\0"+body).hexdigest() == oid, "blob identity mismatch")
        return body

def open_db(path):
    db = sqlite3.connect(path)
    db.execute("PRAGMA temp_store=FILE")
    db.execute("PRAGMA cache_size=-32768")
    db.execute("CREATE TABLE lines (value BLOB PRIMARY KEY) WITHOUT ROWID")
    return db

def measure(repo, commits, db):
    """Commit-prefix and full-tree reconciliation; one transaction per complete repo."""
    counts = {}
    source_counts = {}
    occurrences = 0
    identities = []
    with db:
        with BlobReader(repo) as reader:
            for t, prefix, expected in commits:
                full = git(repo, "rev-parse", "--verify", prefix+"^{commit}").decode().strip()
                require(HEX40.fullmatch(full) and full.startswith(prefix), "unresolved commit")
                require(int(git(repo, "show", "-s", "--format=%ct", full)) == t, "commit timestamp mismatch")
                total = 0
                for entry in git(repo, "ls-tree", "-r", "-z", full).split(b"\0"):
                    if not entry:
                        continue
                    header, path = entry.split(b"\t", 1)
                    mode, kind, oid = header.split()
                    if kind != b"blob":
                        continue
                    oid = oid.decode("ascii")
                    require(HEX40.fullmatch(oid), "unsupported object format")
                    code = eligible(path, mode)
                    if oid not in counts or (code and oid not in source_counts):
                        body = reader.read(oid)
                        counts[oid] = historical_lines(body)
                        if code:
                            count = 0
                            for line in source_lines(body):
                                db.execute("INSERT OR IGNORE INTO lines VALUES (?)", (line,))
                                count += 1
                            source_counts[oid] = count
                    total += counts[oid]
                    if code:
                        occurrences += source_counts[oid]
                require(total == expected, "commit line count disagrees with wafer")
                identities.append(full)
    return occurrences, identities

def public_inventory():
    out = {}
    page = 1
    while True:
        req = urllib.request.Request("https://api.github.com/users/Ventusltd/repos?type=owner&per_page=100&page="+str(page),
                                     headers={"User-Agent":"kuiper-read-only-counter","Accept":"application/vnd.github+json"})
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            req.add_header("Authorization", "Bearer " + token)
        with urllib.request.urlopen(req, timeout=30) as response:
            items = json.load(response)
        require(isinstance(items,list), "public inventory malformed")
        if not items:
            return out
        for info in items:
            name = info.get("name","")
            if (SAFE_NAME.fullmatch(name) and info.get("private") is False
                and info.get("visibility") == "public" and info.get("full_name","").lower() == ("Ventusltd/"+name).lower()):
                out[name.lower()] = info.get("size")
        page += 1

def public_clone(name, target, inventory):
    require(SAFE_NAME.fullmatch(name) and not name.startswith("unnamed-"), "unapproved repository")
    size = inventory.get(name.lower())
    require(type(size) is int and 0 <= size <= 250000, "public identity or clone size bound not satisfied")
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0", GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL="/dev/null")
    for k in list(env):
        if k in {"GITHUB_TOKEN", "GH_TOKEN", "GIT_ASKPASS", "SSH_ASKPASS"}:
            del env[k]
        if k.startswith("GIT_CONFIG_") and k not in ("GIT_CONFIG_NOSYSTEM","GIT_CONFIG_GLOBAL"):
            del env[k]
    subprocess.run(["git","-c","credential.helper=","clone","--quiet","--bare","--no-single-branch","--no-tags",
                    "https://github.com/Ventusltd/"+name+".git", str(target)],
                   env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)

def candidate(repo, pin, requested, max_repo_occurrences=None):
    result, repos, commits, named = baseline(repo, pin)
    metric = result["metrics"]["unique_code_lines"]
    coverage = metric["coverage"]
    require(max_repo_occurrences is None or (not requested and max_repo_occurrences > 0), "choose either explicit repos or a positive historical occurrence bound")
    if max_repo_occurrences is not None:
        requested = [repos[i][0] for i in sorted(named) if repos[i][1] <= max_repo_occurrences and commits[i]]
    wanted = set(requested)
    require(len(wanted) == len(requested), "duplicate requested repository")
    selected = [i for i in sorted(named) if repos[i][0] in wanted]
    require(len(selected) == len(wanted), "requested repo outside pinned named register")
    coverage["repositories_requested"] = len(selected)
    coverage["commits_requested"] = sum(len(commits[i]) for i in selected)
    failures = []
    full_ids = []
    occurrences = 0
    inventory = public_inventory() if selected else {}
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix="kuiper-counter-") as tmp:
        db = open_db(Path(tmp)/"private-local-lines.sqlite")
        try:
            for i in selected:
                name = repos[i][0]
                target = Path(tmp)/("repo-"+str(i))
                try:
                    public_clone(name, target, inventory)
                    n, ids = measure(target, commits[i], db)
                except (OSError, ValueError, subprocess.SubprocessError, sqlite3.Error):
                    # Do not log source content, clone credentials or exception bodies.
                    failures.append(name)
                    print("repo index",i,"acquisition or reconciliation unavailable",flush=True)
                    continue
                finally:
                    if target.exists():
                        shutil.rmtree(target)
                print("repo index",i,"reconciled commits",len(ids),flush=True)
                occurrences += n
                full_ids.extend((i, oid) for oid in ids)
                coverage["repositories_measured"] += 1
                coverage["commits_measured"] += len(ids)
            unique = db.execute("SELECT count(*) FROM lines").fetchone()[0]
        finally:
            db.close()
    coverage["repositories_failed"] = len(failures)
    print("candidate runtime seconds",round(time.monotonic()-started,3),"parent peak RSS KiB",resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,flush=True)
    result["source_receipt"] = dict(requested_repositories=[repos[i][0] for i in selected],
                                   failed_repositories=failures,
                                   resolved_commit_inventory_sha256=sha256(json.dumps(full_ids,separators=(",",":")).encode()),
                                   resource_bound_bytes=MAX_BLOB,
                                   repo_size_bound_kib=250000,
                                   historical_occurrence_bound=max_repo_occurrences,
                                   coverage_note="Target is named wafer rows, not all estate history; redacted rows and late commits excluded.")
    if coverage["commits_measured"]:
        require(unique <= occurrences <= int(result["metrics"]["total_historical_line_occurrences"]["value"]), "source count invariant")
        # 'measured' means every named row reconciled; never claims redacted or unindexed history.
        status = "measured" if coverage["commits_measured"] == coverage["commits_target"] and coverage["repositories_measured"] == coverage["repositories_target"] else "partial"
        metric.update(status=status, value=str(unique))
        result["metrics"]["same_cohort_source_line_occurrences"].update(status=status,value=str(occurrences))
    return result

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", default=".")
    p.add_argument("--wafer-commit", required=True)
    p.add_argument("--include", action="append", default=[])
    p.add_argument("--max-repo-occurrences", type=int)
    p.add_argument("--output", required=True)
    a = p.parse_args()
    result = candidate(a.repo, a.wafer_commit, a.include, a.max_repo_occurrences)
    body = (json.dumps(result, indent=2, sort_keys=True)+"\n").encode()
    Path(a.output).write_bytes(body)
    print("counter SHA256",sha256(body))
    print(body.decode())
    # A requested acquisition yielding no complete repository is a failed pilot.
    return int(bool(a.include or a.max_repo_occurrences) and not result["metrics"]["unique_code_lines"]["coverage"]["repositories_measured"])

if __name__ == "__main__":
    raise SystemExit(main())
