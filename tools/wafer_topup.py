#!/usr/bin/env python3
r"""tools/wafer_topup.py - the wafer grows by itself: every public commit since the rim, appended.

    python tools/wafer_topup.py [--dry-run]

wafer_keys.py issued the first 37,929,255,811 keys from a measurement frozen on 19 Sept 2026. This
tool is run by .github/workflows/engine.yml after every harvest and adds what has been written
since, by the same rule and the same law:

    issued keys      one per line in every file in every commit (binary blobs, NUL in the first
                     8,000 bytes, have no lines; a last line with no newline still counts)
    unissued keys    GAP_KEYS_PER_SECOND x seconds since the commit before, capped at CAP_SECONDS,
                     imported from wafer_keys.py so the constants cannot drift apart

It asks GitHub which repositories of the account are PUBLIC, keeps a shallow bare mirror of each
(in the runner's temp on GitHub, in .local/ here), and takes every commit on every branch with a
commit time after wafer-meta.json last_unix and no later than the moment the run began. Commits
with no lines are left out, as wafer_keys.py leaves them out. The rest are appended to
cosmos/wafer.tsv in time order, new repositories are appended to cosmos/repos.tsv with the next
index, and cosmos/wafer-meta.json is rewritten from the rows themselves.

APPEND ONLY. Nothing already issued moves: every new commit lands beyond the rim. The price is
that a commit pushed after a later run, bearing an older time, stays outside the wafer; it would
need an address that is already taken. Re-running wafer_keys.py rebuilds from belt.tsv and the
commit shards, which this tool does not extend, so it would drop everything appended here.

SAFEGUARDS. Run twice with nothing new, it writes nothing. It refuses and writes nothing if more
than a fifth of the repositories cannot be read, if one that cannot be read was pushed since the
rim (its commits would be lost for good), if the sums would not agree as ci_check.py K2 requires,
or if a name that is not public would be written.
"""
import io
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
COSMOS = os.path.join(ROOT, 'cosmos')
sys.path.insert(0, HERE)
from check_proof import leaks
from wafer_keys import GAP_KEYS_PER_SECOND, CAP_SECONDS, rows

LAW = 'r = sqrt(key), theta = 2 pi frac(key x 2654435769 / 2^32)'
OWNER = 'Ventusltd'
MARGIN = 86400                    # mirrors reach a day behind the rim, so no boundary is missed


def public_repos():
    """Every PUBLIC repository of the account, empty-looking ones included: GitHub reports a size
    of 0 for a small new repository, so harvest.py's size filter would drop real commits here."""
    out, page = [], 1
    while True:
        req = urllib.request.Request('https://api.github.com/users/%s/repos?type=owner&per_page=100&page=%d'
                                     % (OWNER, page), headers={'Accept': 'application/vnd.github+json',
                                                               'User-Agent': 'kuiper-topup'})
        if os.environ.get('GITHUB_TOKEN'):
            req.add_header('Authorization', 'Bearer ' + os.environ['GITHUB_TOKEN'])
        got = json.load(urllib.request.urlopen(req, timeout=60))
        if not got:
            break
        out += [r for r in got if not r.get('private') and r.get('visibility', 'public') == 'public']
        page += 1
    return sorted(out, key=lambda r: r['name'].lower())


def git(d, *args):
    r = subprocess.run(['git'] + list(args), cwd=d, capture_output=True, timeout=1800)
    if r.returncode:
        raise RuntimeError(r.stderr.decode('utf-8', 'replace').strip()[:300])
    return r.stdout.decode('utf-8', 'replace')


def mirror(name, cache, since):
    """A bare mirror of every branch, shallow from `since`. None if nothing was written since."""
    d = os.path.join(cache, name + '.git')
    date = datetime.fromtimestamp(since, timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    try:
        if os.path.isdir(d):
            git(d, 'fetch', '-q', '--prune', '--shallow-since=' + date, 'origin', '+refs/heads/*:refs/heads/*')
        else:
            git(cache, 'clone', '-q', '--bare', '--no-single-branch', '--shallow-since=' + date,
                'https://github.com/%s/%s.git' % (OWNER, name), d)
    except RuntimeError as e:
        if 'no commits selected' in str(e) or 'processing shallow info' in str(e):
            return None                                         # nothing since: nothing to add
        raise
    return d


def count_blobs(d, shas, cache):
    """Stream one git cat-file --batch pass; cache[sha] = lines, or 0 for a binary blob."""
    if not shas:
        return
    p = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=d, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    def feed():
        p.stdin.write(('\n'.join(shas) + '\n').encode())
        p.stdin.close()
    threading.Thread(target=feed, daemon=True).start()
    for _ in shas:
        hdr = p.stdout.readline().split()
        if len(hdr) < 3 or hdr[1] == b'missing':
            raise RuntimeError('cat-file could not read %s' % (hdr[0].decode() if hdr else '?'))
        size, left, head, n, last = int(hdr[2]), int(hdr[2]), b'', 0, b'\n'
        while left:
            chunk = p.stdout.read(min(left, 1 << 20))
            if not chunk:
                raise RuntimeError('cat-file ended early')
            if len(head) < 8000:
                head += chunk[:8000 - len(head)]
            n += chunk.count(b'\n')
            last, left = chunk[-1:], left - len(chunk)
        p.stdout.read(1)                                        # the newline after each object
        binary = b'\x00' in head
        cache[hdr[0].decode()] = 0 if binary else n + (1 if size and last != b'\n' else 0)
    p.wait()


def new_commits(d, after, until, cache):
    """(unix, lines, sha) for every commit on any branch with after < commit time <= until."""
    out = []
    for line in git(d, 'log', '--branches', '--format=%H %ct').split('\n'):
        if not line.strip():
            continue
        sha, ct = line.split()
        if not after < int(ct) <= until:
            continue
        blobs = []
        for t in git(d, 'ls-tree', '-r', sha).split('\n'):
            p = t.split(None, 3)
            if len(p) == 4 and p[1] == 'blob':
                blobs.append(p[2])
        count_blobs(d, sorted(set(b for b in blobs if b not in cache)), cache)
        out.append((int(ct), sum(cache[b] for b in blobs), sha))
    return out


def main():
    dry = '--dry-run' in sys.argv[1:]
    started = int(time.time())
    wafer = rows(os.path.join(COSMOS, 'wafer.tsv'))
    repos = rows(os.path.join(COSMOS, 'repos.tsv'))
    meta = json.load(io.open(os.path.join(COSMOS, 'wafer-meta.json'), encoding='utf-8'))
    rim = meta['last_unix']
    if int(wafer[-1][0]) != rim:
        print('REFUSED: wafer.tsv ends at %s, wafer-meta.json says %d' % (wafer[-1][0], rim))
        return 2
    index = {n.lower(): int(i) for i, n, _ in repos}
    seen = set((int(r[2]), r[3]) for r in wafer)

    cache_dir = os.path.join(os.environ['RUNNER_TEMP'], 'topup') if os.environ.get('RUNNER_TEMP') \
        else os.path.join(ROOT, '.local', 'topup-mirrors')
    os.makedirs(cache_dir, exist_ok=True)
    listed = public_repos()
    found, missed, blob_lines = [], [], {}
    for r in listed:
        name, pushed = r['name'], started
        try:
            pushed = int(datetime.strptime(r.get('pushed_at') or '1970-01-01T00:00:00Z',
                                           '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc).timestamp())
            d = mirror(name, cache_dir, rim - MARGIN) if pushed > rim else None
            got = new_commits(d, rim, started, blob_lines) if d else []
        except Exception as e:
            print('  missed %-40s %s' % (name, str(e)[:120]), file=sys.stderr)
            missed.append((name, pushed))
            continue
        if len(blob_lines) > 2_000_000:
            blob_lines.clear()                                  # a blob is the same in every repository
        got = [c for c in got if c[1] > 0]
        if got:
            print('  %-44s %5d commits %16s keys' % (name, len(got), format(sum(c[1] for c in got), ',')),
                  file=sys.stderr, flush=True)
        found.append((name, got))

    print('%d public repositories, %d read, %d missed' % (len(listed), len(found), len(missed)))
    if not found or len(missed) * 5 > len(listed):
        print('REFUSED: too many missed to call this a measurement; nothing written')
        return 1
    late = [n for n, p in missed if p > rim]
    if late:
        print('REFUSED: %d unread repositories were pushed since the rim; nothing written' % len(late))
        return 1

    names = [n for _, n, _ in repos]
    totals = [int(l) for _, _, l in repos]
    add = []
    for name, got in found:
        if not got:
            continue
        i = index.get(name.lower())
        if i is None:
            i = index[name.lower()] = len(names)
            names.append(name)
            totals.append(0)
        for unix, n, sha in got:
            if (i, sha[:12]) not in seen:
                add.append((unix, n, i, sha[:12]))
                totals[i] += n
    if not add:
        print('nothing new since %s: nothing written' % datetime.fromtimestamp(rim, timezone.utc).isoformat())
        return 0

    add.sort(key=lambda c: (c[0], c[2], c[3]))              # time, then the same tiebreak as wafer_keys
    prev, lines = rim, []
    for unix, n, i, sha in add:
        gap = GAP_KEYS_PER_SECOND * min(max(unix - prev, 0), CAP_SECONDS)
        lines.append('%d\t%d\t%d\t%s\t%d' % (unix, n, i, sha, gap))
        prev = unix
    allrows = wafer + [l.split('\t') for l in lines]
    issued = sum(int(r[1]) for r in allrows)
    unissued = sum(int(r[4]) for r in allrows)
    new_meta = {'issued_keys': issued, 'unissued_keys': unissued, 'address_space': issued + unissued,
                'silence_share': round(unissued / (issued + unissued), 4), 'commits': len(allrows),
                'repositories': len(names), 'first_unix': int(allrows[0][0]), 'last_unix': int(allrows[-1][0]),
                'gap_keys_per_second': GAP_KEYS_PER_SECOND, 'cap_seconds': CAP_SECONDS, 'law': LAW}
    if not (issued == sum(totals) == meta['issued_keys'] + sum(c[1] for c in add)
            and unissued == meta['unissued_keys'] + sum(int(l.split('\t')[4]) for l in lines)):
        print('REFUSED: the sums would not agree (K2); nothing written')
        return 2
    repos_text = '# repo_index\tname\tlines\n' + ''.join('%d\t%s\t%d\n' % (i, n, l)
                                                         for i, (n, l) in enumerate(zip(names, totals)))
    if leaks(repos_text) or leaks('\n'.join(lines)):
        print('REFUSED (L6): a name that is not public is in the result; nothing written')
        return 2

    print('added %d commits, %s keys, %d new repositories; issued keys now %s'
          % (len(add), format(sum(c[1] for c in add), ','), len(names) - len(repos), format(issued, ',')))
    if dry:
        print('dry run: nothing written')
        return 0
    with io.open(os.path.join(COSMOS, 'wafer.tsv'), 'a', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines) + '\n')
    with io.open(os.path.join(COSMOS, 'repos.tsv'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(repos_text)
    with io.open(os.path.join(COSMOS, 'wafer-meta.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(new_meta, f, indent=1)
    print(json.dumps(new_meta, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
