#!/usr/bin/env python3
"""The drift of an edition from the live heads (NL-010 roadmap step 8, Opus team 8). Apache-2.0 (kuiper-belt code).

For every body of editions/<stamp>/keys.json, is the line the edition quotes still at the head of its repository?

  SAME        the head's file at `path` holds `line_text` at `line`
  MOVED       the head's file holds `line_text` at another line: the first occurrence, head_line, delta = head_line - line
  GONE        the head has a file at `path` and no line of it equals `line_text`
  FILE_GONE   the head has no file (no blob) at `path`
  UNVERIFIED  nothing is claimed, and the row says why: no clone, no head, a recorded head the clone does not hold,
              an empty `line_text`, a key not on the wafer, a repository not in cosmos/repos.tsv

Inputs, and nothing else: cosmos/repos.tsv, editions/<stamp>/keys.json, and the git objects (never a working tree) of
the clones under the estate directory (default: the directory that holds this repository, /home/user/estate).
The head of a repository is `refs/remotes/origin/HEAD` of its clone, its default branch as the clone last saw it on
the host; it is observed when the remote ref was written (the clone's FETCH_HEAD when it names that sha, else the
ref's reflog), with its offset. A checked-out branch is not the head (`--ref HEAD` measures one anyway, for a
comparison).

Text rule, as tools/edition_keys.py wrote `line_text` (:250): body.split(b'\\n')[i].decode('utf-8', 'replace')
.rstrip('\\r'); equality is byte-for-byte of that string. The tool writes no line text into drift.json.

Refusals: a repository without a clone or a head makes every one of its rows UNVERIFIED, never SAME, and prints
`REFUSED: ...` (README.md:40 "A check that examines nothing refuses. It does not pass"; tools/key.py:49 "Never
trusted blind"). `--heads` with no heads exits 2 and writes nothing. A head observed more than CAP_SECONDS before the
cut exits 3 and writes nothing: a stale drift is worse than none.

  python3 tools/drift.py                       observe the heads, classify, write editions/<stamp>/data/drift.json
  python3 tools/drift.py --heads FILE          re-run against recorded heads (a drift.json, or {repo: {sha, ...}})
  python3 tools/drift.py --check               P1 determinism, P2 refusal, P3 ground truth by git show, P5 the law
"""
import argparse
import collections
import datetime
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCHEMA = 'kuiper.drift.v1'
EDITION = '202611012135'
CAP_SECONDS = 14 * 86400          # the wafer's own cap, tools/wafer_keys.py:34 `CAP_SECONDS = 14 * 86400`
CAP_KEY = 'kuiper-belt@018b46a tools/wafer_keys.py:34'
CLASSES = ['SAME', 'MOVED', 'GONE', 'FILE_GONE', 'UNVERIFIED']


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def git(d, args, text=True):
    r = subprocess.run(['git'] + args, cwd=d, capture_output=True)
    out = r.stdout.decode('utf-8', 'replace') if text else r.stdout
    return r.returncode, out


def repo_names(root):
    names = []
    for l in io.open(os.path.join(root, 'cosmos', 'repos.tsv'), encoding='utf-8'):
        if l.strip() and not l.startswith('#'):
            names.append(l.rstrip('\n').split('\t')[1])
    return names


def tsv_name(names, repo):
    for n in names:
        if n == repo:
            return n
    for n in names:
        if n.lower() == repo.lower():
            return n
    return None


def find_clone(estate, name):
    d = os.path.join(estate, name)
    if os.path.isdir(os.path.join(d, '.git')):
        return d
    if os.path.isdir(estate):
        for n in sorted(os.listdir(estate)):
            if n.lower() == name.lower() and os.path.isdir(os.path.join(estate, n, '.git')):
                return os.path.join(estate, n)
    return None


def iso(ts, offset_seconds=0):
    tz = datetime.timezone(datetime.timedelta(seconds=offset_seconds))
    return datetime.datetime.fromtimestamp(int(ts), tz).isoformat()


def parse_iso(s):
    return datetime.datetime.fromisoformat(s)


def observe(d, ref):
    """-> {sha, ref, observed_at, observed_by} or {sha: None, why}"""
    rc, sha = git(d, ['rev-parse', '-q', '--verify', ref + '^{commit}'])
    sha = sha.strip()
    if rc or len(sha) != 40:
        return {'sha': None, 'ref': ref, 'why': 'no head: %s does not resolve in the clone' % ref}
    full = ref
    rc, sym = git(d, ['symbolic-ref', '-q', ref if ref.startswith('refs/') else 'refs/remotes/' + ref])
    if ref == 'origin/HEAD' or ref == 'refs/remotes/origin/HEAD':
        full = sym.strip() if not rc and sym.strip() else 'refs/remotes/origin/HEAD'
    gitdir = os.path.join(d, '.git')
    fh = os.path.join(gitdir, 'FETCH_HEAD')
    if os.path.exists(fh) and full.startswith('refs/remotes/'):
        with open(fh, 'rb') as f:
            if sha.encode() in f.read():
                return {'sha': sha, 'ref': full, 'observed_at': iso(os.path.getmtime(fh)),
                        'observed_by': 'FETCH_HEAD names the sha (its mtime)'}
    log = os.path.join(gitdir, 'logs', *full.split('/'))
    if os.path.exists(log):
        last = None
        with open(log, 'rb') as f:
            for l in f:
                if l.strip():
                    last = l
        if last:
            meta = last.split(b'\t')[0].split()
            if len(meta) >= 4 and meta[1].decode() == sha:
                tz = meta[-1].decode()
                off = (1 if tz[0] == '+' else -1) * (int(tz[1:3]) * 3600 + int(tz[3:5]) * 60)
                return {'sha': sha, 'ref': full, 'observed_at': iso(int(meta[-2]), off),
                        'observed_by': 'reflog of %s' % full}
    if not full.startswith('refs/remotes/'):
        return {'sha': sha, 'ref': full, 'observed_at': None,
                'observed_by': 'a local ref, not a fetch: no observation of the host'}
    return {'sha': sha, 'ref': full, 'observed_at': None, 'observed_by': 'no FETCH_HEAD or reflog names the sha'}


class Batch:
    """one `git cat-file --batch` per clone, fed one request at a time"""

    def __init__(self, d):
        self.p = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=d, stdin=subprocess.PIPE,
                                  stdout=subprocess.PIPE, bufsize=1 << 20)

    def get(self, spec):
        self.p.stdin.write(spec.encode('utf-8', 'surrogateescape') + b'\n')
        self.p.stdin.flush()
        hdr = self.p.stdout.readline()
        f = hdr.split()
        if len(f) < 3 or f[-1] == b'missing' or f[1] == b'missing':
            return None, None
        size = int(f[2])
        body = self.p.stdout.read(size)
        self.p.stdout.read(1)
        return f[1].decode(), body

    def close(self):
        try:
            self.p.stdin.close()
        except Exception:
            pass
        self.p.wait()


def line_at(lines, i):
    return lines[i].decode('utf-8', 'replace').rstrip('\r')


def lines_of(body):                                   # key.py / edition_keys.py:43-46, byte for byte
    if b'\x00' in body[:8000]:
        return -1
    return body.count(b'\n') + (1 if body and not body.endswith(b'\n') else 0)


def lines_before(d, head, path):
    """lines of the blobs before `path` in `git ls-tree -r <head>` (edition_keys.py:136-160, :207-213): the
    lines_before the wafer's key law uses, at the head; streamed, nothing held."""
    rc, out = git(d, ['ls-tree', '-r', '-z', head], text=False)
    if rc:
        return None
    shas = []
    for entry in out.split(b'\x00'):
        if not entry:
            continue
        meta, _, p = entry.partition(b'\t')
        f = meta.split()
        if len(f) < 3 or f[1] != b'blob':
            continue
        p = p.decode('utf-8', 'surrogateescape')
        if p == path:
            break
        shas.append(f[2].decode())
    else:
        return None
    cache, total = {}, 0
    b = Batch(d)
    try:
        for s in shas:
            if s not in cache:
                _, body = b.get(s)
                cache[s] = lines_of(body) if body is not None else 0
            if cache[s] > 0:
                total += cache[s]
    finally:
        b.close()
    return total


def load_heads(path):
    with open(path, encoding='utf-8') as f:
        j = json.load(f)
    h = j.get('heads') if isinstance(j, dict) and 'heads' in j else j
    out = {}
    for repo, v in (h or {}).items():
        if isinstance(v, str):
            v = {'sha': v}
        if v and v.get('sha'):
            out[repo] = {k: v.get(k) for k in ('sha', 'ref', 'observed_at', 'observed_by')}
    return out


def run(args):
    root = os.path.abspath(args.root)
    ed = args.edition
    keys_path = os.path.join(root, 'editions', ed, 'keys.json')
    names = repo_names(root)
    bodies = json.load(open(keys_path, encoding='utf-8'))['bodies']
    cut_at = datetime.datetime.strptime(ed, '%Y%m%d%H%M').replace(tzinfo=datetime.timezone.utc)
    repos = sorted({b['repo'] for b in bodies})
    estate = os.path.abspath(args.estate or os.path.dirname(root))

    # 1. record every head before classifying anything (team-4/STEPS.md step 8: "records every head first")
    recorded = None
    if args.heads:
        recorded = load_heads(args.heads)
        if not recorded:
            print('REFUSED: no heads recorded in %s; drift.json not written' % args.heads)
            return 2, None
    heads, clones = {}, {}
    for repo in repos:
        d = find_clone(estate, repo)
        if recorded is not None:
            if not d:
                heads[repo] = {'sha': None, 'why': 'no clone of %s in the estate' % repo}
                if repo in recorded:
                    heads[repo]['recorded'] = recorded[repo]['sha']
                continue
            if repo not in recorded:
                heads[repo] = {'sha': None, 'why': 'no head recorded for %s' % repo}
                continue
            h = dict(recorded[repo])
            rc, _ = git(d, ['cat-file', '-e', h['sha'] + '^{commit}'])
            if rc:
                heads[repo] = {'sha': None, 'recorded': h['sha'],
                               'why': 'the clone does not hold the recorded head %s' % h['sha'][:12]}
                continue
            heads[repo] = h
            clones[repo] = d
            continue
        if not d:
            heads[repo] = {'sha': None, 'why': 'no clone of %s in the estate' % repo}
            continue
        h = observe(d, args.ref)
        heads[repo] = h
        if h.get('sha'):
            clones[repo] = d
    for repo in repos:
        h = heads[repo]
        if h.get('sha') and h.get('observed_at'):
            age = (cut_at - parse_iso(h['observed_at'])).total_seconds()
            if age > CAP_SECONDS:
                print('REFUSED: head of %s observed %s, older than the cut %s by %.1f h (cap %d h, %s); '
                      'drift.json not written' % (repo, h['observed_at'], cut_at.isoformat(), age / 3600,
                                                  CAP_SECONDS // 3600, CAP_KEY))
                return 3, None

    # 2. classify, in keys.json order
    rows, batches = [], {}
    for b in bodies:
        repo = b['repo']
        h = heads[repo]
        row = collections.OrderedDict()
        row['id'] = b['id']
        row['key'] = b.get('key')
        row['repo'] = repo
        row['path'] = b['path']
        row['line'] = int(b['line'])
        row['edition_commit'] = b['commit']
        row['head'] = h.get('sha')
        why = None
        if not tsv_name(names, repo):
            why = 'repository not in cosmos/repos.tsv'
        elif not h.get('sha'):
            why = h['why']
        elif b.get('on_wafer') is False or b.get('key') is None:
            why = 'key not on the wafer (on_wafer: false)'
        elif not b.get('line_text'):
            why = 'empty line_text'
        elif not h.get('observed_at'):
            why = 'head %s has no observation time (%s)' % (h['sha'][:12], h.get('observed_by'))
        if why:
            row['class'] = 'UNVERIFIED'
            row['reason'] = why
            rows.append(row)
            continue
        d = clones[repo]
        if repo not in batches:
            batches[repo] = Batch(d)
        kind, body = batches[repo].get('%s:%s' % (h['sha'], b['path']))
        if body is None or kind != 'blob':
            row['class'] = 'FILE_GONE'
            row['reason'] = 'no blob at the path in the head' if body is None else 'the path is a %s at the head' % kind
            rows.append(row)
            continue
        text = b['line_text']
        ls = body.split(b'\n')
        i = row['line'] - 1
        if i < len(ls) and line_at(ls, i) == text:
            row['class'] = 'SAME'
            rows.append(row)
            continue
        hits = [j + 1 for j in range(len(ls)) if line_at(ls, j) == text]
        if hits:
            row['class'] = 'MOVED'
            row['head_line'] = hits[0]
            row['delta'] = hits[0] - row['line']
            row['occurrences'] = len(hits)
            row['head_lines_before'] = lines_before(d, h['sha'], b['path'])
        else:
            row['class'] = 'GONE'
        rows.append(row)
    for bt in batches.values():
        bt.close()

    for repo in repos:
        if not heads[repo].get('sha'):
            n = sum(1 for r in rows if r['repo'] == repo)
            print('REFUSED: %s; %d lines UNVERIFIED' % (heads[repo]['why'], n))

    # 3. summary
    count = collections.Counter(r['class'] for r in rows)
    per = collections.OrderedDict()
    for repo in repos:
        c = collections.Counter(r['class'] for r in rows if r['repo'] == repo)
        per[repo] = collections.OrderedDict((k, c[k]) for k in CLASSES if c[k])
    reasons = collections.Counter(r['reason'] for r in rows if r['class'] == 'UNVERIFIED')
    den = len(rows) - count['UNVERIFIED']
    summary = collections.OrderedDict()
    summary['rows'] = len(rows)
    summary['counts'] = collections.OrderedDict((k, count[k]) for k in CLASSES)
    summary['denominator'] = den
    summary['share_same'] = round(count['SAME'] / den, 6) if den else None
    summary['share_text'] = ('%d SAME / %d (rows %d - UNVERIFIED %d)' % (count['SAME'], den, len(rows),
                                                                         count['UNVERIFIED']))
    summary['heads_observed'] = sum(1 for r in repos if heads[r].get('sha'))
    summary['repositories'] = len(repos)
    summary['unverified_reasons'] = collections.OrderedDict(sorted(reasons.items()))
    summary['per_repo'] = per

    out = collections.OrderedDict()
    out['schema'] = SCHEMA
    out['edition'] = ed
    out['cut_at'] = cut_at.isoformat()
    out['tool'] = 'tools/drift.py'
    out['licence'] = 'CC BY 4.0 (kuiper-belt data); quotes no line text'
    out['law'] = ('per body of keys.json: git show <head>:<path>; SAME if line `line` equals line_text, MOVED if '
                  'another line does (first occurrence), GONE if none does, FILE_GONE if no blob, UNVERIFIED with '
                  'its reason when no head, no clone, empty line_text or not on the wafer; share = SAME / (rows - '
                  'UNVERIFIED)')
    out['inputs'] = collections.OrderedDict([
        ('keys.json', collections.OrderedDict([('path', 'editions/%s/keys.json' % ed),
                                               ('sha256', sha256_file(keys_path))])),
        ('repos.tsv', collections.OrderedDict([('path', 'cosmos/repos.tsv'),
                                               ('sha256', sha256_file(os.path.join(root, 'cosmos', 'repos.tsv')))])),
    ])
    out['head_rule'] = ('heads[repo] = the sha of the ref named, read from the clone under the estate, and when '
                        'that ref was observed from the host; recorded once, re-used by --heads')
    out['cap_seconds'] = CAP_SECONDS
    out['cap_key'] = CAP_KEY
    out['heads'] = collections.OrderedDict((r, heads[r]) for r in repos)
    out['rows'] = rows
    out['summary'] = summary
    data = (json.dumps(out, indent=1, ensure_ascii=False) + '\n').encode('utf-8')
    return 0, data


def write(path, data):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'wb') as f:
        f.write(data)
    os.replace(tmp, path)


def main_run(argv):
    args = parse(argv)
    rc, data = run(args)
    if rc:
        return rc
    out = args.out or os.path.join(args.root, 'editions', args.edition, 'data', 'drift.json')
    write(out, data)
    s = json.loads(data)['summary']
    print('drift: %d bodies -> %s; %s; %d of %d heads observed; wrote %s (%d bytes, sha256 %s)' % (
        s['rows'], ' / '.join('%d %s' % (v, k) for k, v in s['counts'].items()), s['share_text'],
        s['heads_observed'], s['repositories'], os.path.relpath(out, args.root) if out.startswith(args.root) else out,
        len(data), hashlib.sha256(data).hexdigest()))
    return 0


# ------------------------------------------------------------------------------------------------ the test file
def check(args):
    """P1 determinism, P2 refusal, P3 ground truth by `git show` (an independent path), P5 the law."""
    root = os.path.abspath(args.root)
    target = args.out or os.path.join(root, 'editions', args.edition, 'data', 'drift.json')
    if not os.path.exists(target):
        print('REFUSED: %s does not exist; nothing to check' % target)
        return 2
    estate = os.path.abspath(args.estate or os.path.dirname(root))
    me = os.path.abspath(__file__)
    tmp = tempfile.mkdtemp(prefix='drift-check-', dir=args.scratch)
    res = []

    def ok(name, cond, detail):
        res.append((name, bool(cond), detail))
        print('%s %-28s %s' % ('PASS' if cond else 'FAIL', name, detail))

    def tool(*extra):
        r = subprocess.run([sys.executable, me, '--root', root, '--edition', args.edition] + list(extra),
                           capture_output=True, text=True)
        return r.returncode, r.stdout + r.stderr

    base = open(target, 'rb').read()
    D = json.loads(base)
    # P1
    a, b = os.path.join(tmp, 'a.json'), os.path.join(tmp, 'b.json')
    ra, _ = tool('--estate', estate, '--heads', target, '--out', a)
    rb, _ = tool('--estate', estate, '--heads', target, '--out', b)
    ba = open(a, 'rb').read() if os.path.exists(a) else b''
    bb = open(b, 'rb').read() if os.path.exists(b) else b''
    ok('P1 determinism', ra == 0 and rb == 0 and ba == bb, 'two runs against the recorded heads: %s / %s bytes, '
       'sha256 %s / %s' % (len(ba), len(bb), hashlib.sha256(ba).hexdigest()[:16], hashlib.sha256(bb).hexdigest()[:16]))
    ok('P1 re-run = the file', bool(ba) and ba == base,
       'the re-run against the file\'s own recorded heads equals %s byte for byte (E9)' % os.path.relpath(target, root))
    # P2a: one clone removed (an estate of symlinks without it)
    victim = args.victim
    if not victim:
        per = collections.Counter(r['repo'] for r in D['rows'] if r['class'] != 'UNVERIFIED')
        victim = per.most_common(1)[0][0]
    est2 = os.path.join(tmp, 'estate-without-' + victim)
    os.makedirs(est2)
    for n in sorted(os.listdir(estate)):
        if n.lower() != victim.lower() and os.path.isdir(os.path.join(estate, n, '.git')):
            os.symlink(os.path.join(estate, n), os.path.join(est2, n))
    c = os.path.join(tmp, 'without.json')
    rc2, out2 = tool('--estate', est2, '--heads', target, '--out', c)
    C = json.loads(open(c, 'rb').read()) if os.path.exists(c) else None
    lost = sum(1 for r in D['rows'] if r['repo'] == victim and r['class'] != 'UNVERIFIED')
    ok('P2 one clone removed', C is not None and all(r['class'] == 'UNVERIFIED' for r in C['rows'] if r['repo'] == victim)
       and C['summary']['denominator'] == D['summary']['denominator'] - lost
       and ('REFUSED: no clone of %s' % victim) in out2,
       '%s removed: its %d rows UNVERIFIED, denominator %s -> %s (drop %d), tool printed REFUSED' % (
           victim, sum(1 for r in D['rows'] if r['repo'] == victim), D['summary']['denominator'],
           C['summary']['denominator'] if C else '?', lost))
    # P2b: heads emptied
    e = os.path.join(tmp, 'empty-heads.json')
    open(e, 'w').write('{"heads": {}}\n')
    o = os.path.join(tmp, 'never.json')
    rc3, out3 = tool('--estate', estate, '--heads', e, '--out', o)
    ok('P2 heads emptied', rc3 != 0 and not os.path.exists(o), 'exit %d, nothing written: %s' % (rc3, out3.strip()))
    # P2c: stale heads
    s = json.loads(base)
    for v in s['heads'].values():
        if v.get('sha'):
            v['observed_at'] = '2026-10-01T00:00:00+00:00'
    sp = os.path.join(tmp, 'stale-heads.json')
    open(sp, 'w').write(json.dumps(s))
    o2 = os.path.join(tmp, 'never2.json')
    rc4, out4 = tool('--estate', estate, '--heads', sp, '--out', o2)
    ok('P2 stale heads refuse', rc4 == 3 and not os.path.exists(o2), 'exit %d, nothing written: %s' % (
        rc4, out4.strip().splitlines()[0] if out4.strip() else ''))
    # P3: ground truth through `git show` and `git grep`, not through the tool's cat-file path
    keys = {k['id']: k for k in json.load(open(os.path.join(root, 'editions', args.edition, 'keys.json'),
                                                encoding='utf-8'))['bodies']}
    bad, n = [], collections.Counter()
    shows = {}
    for r in D['rows']:
        k = keys.get(r['id'])
        cl = r['class']
        if cl == 'UNVERIFIED':
            n[cl] += 1
            if not r.get('reason'):
                bad.append((r['id'], 'UNVERIFIED without a reason'))
            continue
        d = find_clone(estate, r['repo'])
        spec = '%s:%s' % (r['head'], r['path'])
        if spec not in shows:
            p = subprocess.run(['git', 'show', spec], cwd=d, capture_output=True)
            shows[spec] = p.stdout if p.returncode == 0 else None
        body = shows[spec]
        text = k['line_text']
        if cl == 'FILE_GONE':
            n[cl] += 1
            rc, _ = git(d, ['cat-file', '-e', spec])
            if body is not None and rc == 0:
                bad.append((r['id'], 'FILE_GONE but git show finds the path'))
            continue
        if body is None:
            bad.append((r['id'], '%s but git show fails' % cl))
            continue
        ls = body.split(b'\n')
        if cl == 'SAME':
            if not (r['line'] <= len(ls) and line_at(ls, r['line'] - 1) == text):
                bad.append((r['id'], 'SAME but the line differs'))
        elif cl == 'MOVED':
            hl = r['head_line']
            if not (hl <= len(ls) and line_at(ls, hl - 1) == text):
                bad.append((r['id'], 'MOVED but head_line differs'))
            if any(line_at(ls, j) == text for j in range(hl - 1)):
                bad.append((r['id'], 'MOVED but not the first occurrence'))
            if r['line'] <= len(ls) and line_at(ls, r['line'] - 1) == text:
                bad.append((r['id'], 'MOVED but the text is still at line'))
            if r['delta'] != hl - r['line']:
                bad.append((r['id'], 'delta wrong'))
        elif cl == 'GONE':
            pf = os.path.join(tmp, 'pat')
            with open(pf, 'wb') as f:
                f.write(text.encode('utf-8') + b'\n' + text.encode('utf-8') + b'\r\n')
            p = subprocess.run(['git', 'grep', '-F', '-x', '-f', pf, r['head'], '--', r['path']], cwd=d,
                               capture_output=True)
            if p.stdout.strip():
                bad.append((r['id'], 'GONE but git grep -F -x finds it'))
        n[cl] += 1
    # the walk that places a MOVED line's new key, run at the edition's own commit, must give the lines_before that
    # tools/edition_keys.py recorded in keys.json for that body (the same rule, measured independently there)
    walked = 0
    for r in D['rows']:
        if r['class'] == 'MOVED':
            k = keys[r['id']]
            got = lines_before(find_clone(estate, r['repo']), r['edition_commit'], r['path'])
            walked += 1
            if got != k.get('lines_before'):
                bad.append((r['id'], 'lines_before at the edition commit %s, keys.json %s' % (got, k.get('lines_before'))))
    n['lines_before re-walked'] = walked
    ok('P3 ground truth (git show)', not bad, '%s checked; %d disagreements%s' % (
        dict(n), len(bad), (': ' + '; '.join('%s %s' % x for x in bad[:5])) if bad else ''))
    # P5: the law
    names = repo_names(root)
    stray_repo = sorted({r['repo'] for r in D['rows']} | set(D['heads']))
    stray_repo = [x for x in stray_repo if not tsv_name(names, x)]
    stray_key = [r['id'] for r in D['rows'] if r['id'] not in keys or keys[r['id']].get('key') != r['key']
                 or keys[r['id']]['path'] != r['path'] or int(keys[r['id']]['line']) != r['line']
                 or keys[r['id']]['commit'] != r['edition_commit']]
    ok('P5 the law', not stray_repo and not stray_key and len(D['rows']) == len(keys),
       '%d rows = %d bodies; repositories outside cosmos/repos.tsv: %s; keys outside keys.json: %s' % (
           len(D['rows']), len(keys), stray_repo or 'none', stray_key[:5] or 'none'))
    shutil.rmtree(tmp, ignore_errors=True)
    fails = [x for x in res if not x[1]]
    print('RESULT: %s (%d of %d)' % ('PASS' if not fails else 'FAIL', len(res) - len(fails), len(res)))
    return 1 if fails else 0


def parse(argv):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--root', default=ROOT, help='the kuiper-belt checkout (default: this tool\'s repository)')
    ap.add_argument('--edition', default=EDITION)
    ap.add_argument('--estate', default=None, help='the directory of clones (default: the parent of --root)')
    ap.add_argument('--ref', default='origin/HEAD', help='the head ref of each clone (default origin/HEAD)')
    ap.add_argument('--heads', default=None, help='recorded heads: a drift.json or {repo: {sha, observed_at}}')
    ap.add_argument('--out', default=None)
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--victim', default=None, help='--check: the clone P2 removes (default: the largest)')
    ap.add_argument('--scratch', default=None, help='--check: where its temporary files go')
    return ap.parse_args(argv)


if __name__ == '__main__':
    a = parse(sys.argv[1:])
    sys.exit(check(a) if a.check else main_run(sys.argv[1:]))
