#!/usr/bin/env python3
"""tools/edition_keys.py - give every verified line of an edition its key on the wafer, by the wafer's own law.

    python3 tools/edition_keys.py --bodies <bodies.json> --roots /home/user/estate,/home/user --out <keys.json>

For each body (repo, commit, path, line):

    commit -> wafer row      the row of cosmos/wafer.tsv whose sha12 is commit[:12]
    row    -> k0             cumulative gap_before + lines over the whole wafer, in order (key.py load())
    path   -> lines_before   walking `git ls-tree -r <commit>` in git's own order, summing lines_of()
                             for every blob entry (symlinks included, as key.py does; submodules skipped)
    key    =  k0 + lines_before + (line - 1)

The walk is always finished, and the commit's measured total must equal the wafer row's `lines`. If it
does not, the body is `verified: false` with both numbers; nothing is invented. The body's own blob is
always read for real, its count compared, and `line <= its count` confirmed; that line's text is kept so
it can be compared with the body's quote.

data/blob-lines-history.tsv is used as a cache exactly as key.py uses it (sha -> lines), when present.
Every blob not in it is counted from git's own bytes with one streaming `git cat-file --batch` per repo.
Bodies in the same commit share one walk.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
COSMOS = os.path.join(HERE, '..', 'cosmos')
CACHE_PATH = os.path.join(HERE, '..', 'data', 'blob-lines-history.tsv')


def rows(path):
    return [l.rstrip('\n').split('\t') for l in io.open(path, encoding='utf-8')
            if l.strip() and not l.startswith('#')]


def lines_of(body):                                   # key.py, byte for byte
    if b'\x00' in body[:8000]:
        return -1
    return body.count(b'\n') + (1 if body and not body.endswith(b'\n') else 0)


CACHE = {}           # from blob-lines-history.tsv, as key.py
MEASURED = {}        # (repo dir, sha) -> lines, counted here from git's bytes


def load_cache():
    if os.path.exists(CACHE_PATH):
        for l in io.open(CACHE_PATH, encoding='utf-8'):
            p = l.rstrip('\n').split('\t')
            if len(p) == 2:
                CACHE[p[0]] = int(p[1])
        return True
    return False


def load_wafer():
    """key.py load(), plus an index sha12 -> rows."""
    names = {int(p[0]): p[1] for p in rows(os.path.join(COSMOS, 'repos.tsv'))}
    by_sha, k = {}, 0
    for i, p in enumerate(rows(os.path.join(COSMOS, 'wafer.tsv'))):
        k += int(p[4])
        c = {'row': i, 'unix': int(p[0]), 'lines': int(p[1]), 'repo_index': int(p[2]),
             'name': names[int(p[2])], 'sha': p[3], 'k0': k}
        k += c['lines']
        by_sha.setdefault(p[3], []).append(c)
    return by_sha, k


def norm(s):
    """for comparing an edition's quote with git's line: quote marks dropped, whitespace collapsed"""
    return re.sub(r'\s+', ' ', re.sub('["\'`]', '', s)).strip()


def quote_check(q, text):
    if q == text:
        return 'exact'
    if q.strip() == text.strip():
        return 'exact after trimming whitespace'
    a, b = norm(q), norm(text)
    if a and a == b:
        return 'equal after dropping quote marks and collapsing whitespace'
    if a and a in b:
        return 'quote is a fragment of the line (after normalising)'
    return None


def find_clone(roots, name):
    for root in roots:
        d = os.path.join(root, name)
        if os.path.isdir(os.path.join(d, '.git')):
            return d
    for root in roots:                                 # case-insensitive fallback (Kuiper-belt)
        if os.path.isdir(root):
            for n in sorted(os.listdir(root)):
                if n.lower() == name.lower() and os.path.isdir(os.path.join(root, n, '.git')):
                    return os.path.join(root, n)
    return None


def batch_read(d, shas, sink):
    """Stream `git cat-file --batch` over shas; call sink(sha, body) for each, in order."""
    if not shas:
        return
    p = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=d, stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE, bufsize=1 << 20)

    def feed():
        try:
            for s in shas:
                p.stdin.write(s.encode() + b'\n')
            p.stdin.close()
        except BrokenPipeError:
            pass
    t = threading.Thread(target=feed, daemon=True)
    t.start()
    out = p.stdout
    for s in shas:
        hdr = out.readline().split()
        if len(hdr) < 3 or hdr[1] == b'missing':
            raise RuntimeError('cat-file could not read %s in %s: %r' % (s, d, hdr))
        size = int(hdr[2])
        body = out.read(size)
        out.read(1)
        sink(s, body)
    t.join()
    p.wait()


def walk_commit(d, commit):
    """git ls-tree -r <commit> in git's own order -> [(path, sha, lines)] using cache/measurement."""
    r = subprocess.run(['git', 'ls-tree', '-r', '-z', commit], cwd=d, capture_output=True)
    if r.returncode:
        return None, r.stderr.decode('utf-8', 'replace').strip()
    entries = []
    for entry in r.stdout.split(b'\x00'):
        if not entry:
            continue
        meta, _, path = entry.partition(b'\t')
        f = meta.split()
        if len(f) < 3 or f[1] != b'blob':
            continue
        entries.append((path.decode('utf-8', 'surrogateescape'), f[2].decode()))
    need, seen = [], set()
    for _, s in entries:
        if s not in CACHE and (d, s) not in MEASURED and s not in seen:
            seen.add(s)
            need.append(s)

    def sink(s, body):
        MEASURED[(d, s)] = lines_of(body)
    batch_read(d, need, sink)
    return [(p, s, CACHE[s] if s in CACHE else MEASURED[(d, s)]) for p, s in entries], None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bodies', required=True)
    ap.add_argument('--roots', required=True, help='comma separated directories holding the clones')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    t0 = time.time()
    roots = [r for r in a.roots.split(',') if r]
    cache_present = load_cache()
    by_sha, space = load_wafer()
    bodies = json.load(io.open(a.bodies, encoding='utf-8'))

    walks = {}                                         # (dir, commit) -> (index, total, error)
    out = []
    for b in bodies:
        rec = dict(b)
        rec.update({'key': None, 'k0': None, 'lines_before': None, 'commit_lines_measured': None,
                    'commit_lines_wafer': None, 'on_wafer': False, 'verified': False,
                    'repo_on_wafer': None, 'wafer_row': None, 'blob_lines': None,
                    'blob_at_path': None, 'blob_matches_body': None, 'line_text': None,
                    'quote_matches': None, 'quote_check': None, 'reason': None})
        cands = by_sha.get(b['commit'][:12], [])
        if not cands:
            rec['reason'] = 'commit not on the wafer'
            out.append(rec)
            continue
        same = [c for c in cands if c['name'] == b['repo']] or \
               [c for c in cands if c['name'].lower() == b['repo'].lower()] or cands
        c = same[0]
        if len(cands) > 1:
            rec['wafer_rows_same_sha12'] = [{'row': x['row'], 'repo': x['name']} for x in cands]
        rec.update({'on_wafer': True, 'repo_on_wafer': c['name'], 'k0': c['k0'],
                    'commit_lines_wafer': c['lines'], 'wafer_row': c['row']})
        if c['name'] != b['repo']:
            rec['repo_name_differs'] = {'body': b['repo'], 'wafer': c['name']}
        d = find_clone(roots, b['repo']) or find_clone(roots, c['name'])
        if not d:
            rec['reason'] = 'no local clone for %s under %s' % (b['repo'], ','.join(roots))
            out.append(rec)
            continue
        wk = (d, b['commit'])
        if wk not in walks:
            t1 = time.time()
            ents, err = walk_commit(d, b['commit'])
            if ents is None:
                walks[wk] = (None, None, err)
            else:
                idx, cum = {}, 0
                for p, s, n in ents:
                    if p not in idx:
                        idx[p] = (cum, s, n)
                    if n > 0:
                        cum += n
                walks[wk] = (idx, cum, None)
            print('  walked %-34s %s %9.1fs %s' % (os.path.basename(d), b['commit'][:12],
                  time.time() - t1, 'files=%d lines=%s' % (len(ents), format(walks[wk][1], ','))
                  if ents is not None else err), file=sys.stderr)
        idx, total, err = walks[wk]
        if idx is None:
            rec['reason'] = 'git ls-tree failed: %s' % err
            out.append(rec)
            continue
        rec['commit_lines_measured'] = total
        if b['path'] not in idx:
            rec['reason'] = 'path not in the commit tree'
            out.append(rec)
            continue
        before, sha, n = idx[b['path']]
        rec['lines_before'] = before
        rec['blob_at_path'] = sha
        if 'blob' in b:
            rec['blob_matches_body'] = (sha == b['blob'])
        # the body's own blob, always read for real
        got = {}
        batch_read(d, [sha], lambda s, body: got.__setitem__(s, body))
        body = got[sha]
        real = lines_of(body)
        rec['blob_lines'] = real
        problems = []
        if real != n:
            problems.append('the walk says %d lines for blob %s and git says %d' % (n, sha[:12], real))
        line = int(b['line'])
        if real <= 0:
            problems.append('blob %s holds no text lines (%d); a key cannot land in it' % (sha[:12], real))
        elif not 1 <= line <= real:
            problems.append('line %d is outside 1..%d' % (line, real))
        else:
            rec['key'] = c['k0'] + before + (line - 1)
            text = body.split(b'\n')[line - 1].decode('utf-8', 'replace').rstrip('\r')
            rec['line_text'] = text
            q = (b.get('quote') or '').split('\n')[0].rstrip('\r')
            if q:
                how = quote_check(q, text)
                rec['quote_matches'] = how is not None
                rec['quote_check'] = how
                if how is None:                      # where in the blob is the quote, then?
                    ls = body.split(b'\n')
                    hits = [i + 1 for i, l in enumerate(ls)
                            if quote_check(q, l.decode('utf-8', 'replace').rstrip('\r'))]
                    if hits:
                        near = min(hits, key=lambda h: (abs(h - line), h))
                        rec['quote_check'] = ('quote first line not at line %d; found at line %d'
                                              % (line, near))
                        rec['quote_line'] = near
                        rec['quote_key'] = c['k0'] + before + (near - 1)
                    else:
                        rec['quote_check'] = 'quote first line not found in the blob'
        if total != c['lines']:
            problems.append('the walk measured %d lines in the commit, the wafer row says %d'
                            % (total, c['lines']))
        if rec['blob_matches_body'] is False:
            problems.append('blob at path is %s, the body says %s' % (sha[:12], b['blob'][:12]))
        if problems:
            rec['reason'] = '; '.join(problems)
        else:
            rec['verified'] = True
        out.append(rec)

    summary = {'bodies': len(out),
               'on_wafer': sum(r['on_wafer'] for r in out),
               'verified': sum(r['verified'] for r in out),
               'keyed': sum(r['key'] is not None for r in out),
               'quote_matches': sum(r['quote_matches'] is True for r in out),
               'quote_not_at_line': [{'id': r.get('id'), 'repo': r['repo'], 'path': r['path'],
                                      'line': r['line'], 'key': r['key'],
                                      'quote_line': r.get('quote_line'),
                                      'quote_key': r.get('quote_key'), 'check': r['quote_check']}
                                     for r in out if r['quote_matches'] is False],
               'not_on_wafer': [{'id': r.get('id'), 'repo': r['repo'], 'commit': r['commit'],
                                 'reason': r['reason']} for r in out if not r['on_wafer']],
               'not_verified': [{'id': r.get('id'), 'repo': r['repo'], 'commit': r['commit'],
                                 'path': r['path'], 'line': r['line'], 'reason': r['reason']}
                                for r in out if r['on_wafer'] and not r['verified']],
               'commits_walked': len(walks),
               'cache': ('data/blob-lines-history.tsv, %d blobs' % len(CACHE)) if cache_present
               else 'data/blob-lines-history.tsv absent: every blob counted from git',
               'wafer_address_space': space,
               'law': 'key = k0(row) + lines before path in `git ls-tree -r <commit>` + (line - 1); '
                      'k0 = sum over wafer rows before it of (gap_before + lines) + its own gap_before',
               'seconds': round(time.time() - t0, 1),
               'command': ' '.join(['python3', 'tools/edition_keys.py'] + sys.argv[1:])}
    with io.open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'summary': summary, 'bodies': out}, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print(json.dumps({k: v for k, v in summary.items() if k not in ('not_verified',)}, indent=1))
    if summary['not_verified']:
        print('not verified:', file=sys.stderr)
        for r in summary['not_verified']:
            print('  %s %s %s:%s  %s' % (r['repo'], r['commit'][:12], r['path'], r['line'],
                                         r['reason']), file=sys.stderr)
    return 0 if summary['verified'] == summary['on_wafer'] else 1


if __name__ == '__main__':
    sys.exit(main())
