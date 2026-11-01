#!/usr/bin/env python3
"""tools/element_keys.py - give every element of the periodic table its key on the wafer, by the wafer's own law.

    python3 tools/element_keys.py --elements <elements clone> --roots /home/user/estate,/home/user[,<more>] \\
        --out editions/202611012135/data/elements.json [--check 3]

The key of an element is the key of line 1 of the first file the register lists for it (`files[0]`), at the
register's recorded commit (NL-010 ROADMAP step 7, 7.3; team-4/STEPS.md 7.3). It is computed exactly as
tools/edition_keys.py computes a verified line's key, with that tool's own functions (imported, not copied):

    commit -> wafer row      the row of cosmos/wafer.tsv whose sha12 is commit[:12] (same repository preferred)
    row    -> k0             cumulative gap_before + lines over the whole wafer, in order (key.py load())
    path   -> lines_before   walking `git ls-tree -r <commit>` in git's own order, summing lines_of() per blob
    key    =  k0 + lines_before + (1 - 1)

The walk is always finished and must land where the wafer row says the commit ends; the file's own blob is read for
real and must hold at least one text line. Otherwise the element is `placed: false` with the reason (`why`), and it is
not placed. An element whose register lists no files is counted and named, never placed (the seventh law,
editions/202611012027/README.md:34-35). `--check N` resolves N keyed elements back the other way, as
tools/key.py resolve() does (key -> wafer row by k0 -> walk -> path, line), and refuses on any disagreement.

What is copied from the catalogue: only `block:<Sym>` (as `sym`), the catalogue `number`, and the register's file
address (repo, commit, path). Never a title, a description or a category word: the elements repository states no
licence (ROADMAP "Open questions" Q1: copy only keys until the owner answers; handoff/07-apps/PLAN.md).
A clone is any directory, bare or not, that holds the commit; `--roots` lists directories whose children are clones.
"""
import argparse
import bisect
import hashlib
import io
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import edition_keys as EK                                   # noqa: E402  the walk, the cache, the wafer: one law

COSMOS = os.path.join(HERE, '..', 'cosmos')


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def git(d, *args):
    r = subprocess.run(['git'] + list(args), cwd=d, capture_output=True)
    return r.stdout.decode('utf-8', 'replace').strip() if r.returncode == 0 else None


def holders(roots, name):
    """every directory under the roots named like the repository (exact, then case-insensitive), bare or not"""
    out = []
    for root in roots:
        if not os.path.isdir(root):
            continue
        for n in sorted(os.listdir(root)):
            if n == name or n.lower() == name.lower():
                d = os.path.join(root, n)
                if os.path.isdir(os.path.join(d, '.git')) or os.path.isfile(os.path.join(d, 'HEAD')):
                    out.append(d)
    return out


def clone_with(roots, name, commit):
    for d in holders(roots, name):
        if subprocess.run(['git', 'cat-file', '-e', commit + '^{commit}'], cwd=d,
                          stderr=subprocess.DEVNULL).returncode == 0:
            return d, None
    h = holders(roots, name)
    return None, ('a clone of %s exists (%s) but does not hold commit %s' % (name, ', '.join(h), commit[:12])
                  if h else 'no clone of %s under %s' % (name, ', '.join(roots)))


def load_rows():
    """key.py load() order, as a list, for the reverse check"""
    names = {int(p[0]): p[1] for p in EK.rows(os.path.join(COSMOS, 'repos.tsv'))}
    out, k = [], 0
    for p in EK.rows(os.path.join(COSMOS, 'wafer.tsv')):
        k += int(p[4])
        out.append({'name': names[int(p[2])], 'sha': p[3], 'lines': int(p[1]), 'k0': k})
        k += int(p[1])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--elements', required=True, help='the elements clone (reads catalogue/elements.json)')
    ap.add_argument('--roots', required=True, help='comma separated directories holding the clones')
    ap.add_argument('--out', required=True)
    ap.add_argument('--edition', default='202611012135')
    ap.add_argument('--check', type=int, default=3, help='resolve this many keys back (key.py direction)')
    a = ap.parse_args()
    t0 = time.time()
    roots = [r for r in a.roots.split(',') if r]
    src = os.path.join(a.elements, 'catalogue', 'elements.json')
    head = git(a.elements, 'rev-parse', 'HEAD')
    tracked = git(a.elements, 'ls-files', '--error-unmatch', 'catalogue/elements.json') is not None
    E = json.load(io.open(src, encoding='utf-8'))
    cache_present = EK.load_cache()
    by_sha, space = EK.load_wafer()

    walks = {}
    out = []
    for e in E:
        rec = {'sym': e['key'], 'number': e.get('number'), 'key': None, 'placed': False, 'repo': None,
               'commit': None, 'path': None, 'line': None, 'line_text': None, 'k0': None, 'wafer_row': None,
               'lines_before': None, 'commit_lines_measured': None, 'commit_lines_wafer': None, 'blob': None,
               'files_listed': len(e.get('files') or []), 'github': None, 'why': None}
        if not e.get('files'):
            rec['why'] = 'the register lists no files for this element: counted and named, not placed'
            out.append(rec)
            continue
        f = e['files'][0]
        name = f['repo'].split('/')[-1]
        rec.update({'repo': name, 'commit': f['commit'], 'path': f['path'], 'line': 1,
                    'github': 'https://github.com/%s/blob/%s/%s' % (f['repo'], f['commit'], f['path'])})
        cands = by_sha.get(f['commit'][:12], [])
        if not cands:
            rec['why'] = 'commit not on the wafer'
            out.append(rec)
            continue
        same = [c for c in cands if c['name'] == name] or \
               [c for c in cands if c['name'].lower() == name.lower()] or cands
        c = same[0]
        rec.update({'k0': c['k0'], 'wafer_row': c['row'], 'commit_lines_wafer': c['lines']})
        if c['name'] != name:
            rec['repo_on_wafer'] = c['name']
        d, why = clone_with(roots, name, f['commit'])
        if not d:
            rec['why'] = 'on the wafer (row %d) but not walked: %s' % (c['row'], why)
            out.append(rec)
            continue
        wk = (d, f['commit'])
        if wk not in walks:
            t1 = time.time()
            ents, err = EK.walk_commit(d, f['commit'])
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
            print('  walked %-34s %s %8.1fs %s' % (name, f['commit'][:12], time.time() - t1,
                  'lines=%s' % format(walks[wk][1], ',') if ents is not None else err), file=sys.stderr)
        idx, total, err = walks[wk]
        if idx is None:
            rec['why'] = 'git ls-tree failed: %s' % err
            out.append(rec)
            continue
        rec['commit_lines_measured'] = total
        if f['path'] not in idx:
            rec['why'] = 'path not in the commit tree'
            out.append(rec)
            continue
        before, sha, n = idx[f['path']]
        rec.update({'lines_before': before, 'blob': sha})
        got = {}
        EK.batch_read(d, [sha], lambda s, body: got.__setitem__(s, body))
        real = EK.lines_of(got[sha])
        problems = []
        if real != n:
            problems.append('the walk says %d lines for blob %s and git says %d' % (n, sha[:12], real))
        if real <= 0:
            problems.append('blob %s holds no text lines (%d); a key cannot land in it' % (sha[:12], real))
        else:
            rec['line_text'] = got[sha].split(b'\n')[0].decode('utf-8', 'replace').rstrip('\r')
        if total != c['lines']:
            problems.append('the walk measured %d lines in the commit, the wafer row says %d' % (total, c['lines']))
        if problems:
            rec['why'] = '; '.join(problems)
        else:
            rec['key'] = c['k0'] + before
            rec['placed'] = True
        out.append(rec)

    # the other direction, as tools/key.py resolve(): key -> row by k0 -> walk -> path and line
    rows = load_rows()
    k0s = [r['k0'] for r in rows]
    keyed = [r for r in out if r['placed']]
    step = max(1, len(keyed) // max(1, a.check)) if a.check else 0
    checks = []
    for r in (keyed[::step][:a.check] if a.check else []):
        k = r['key']
        row = rows[max(0, bisect.bisect_right(k0s, k) - 1)]
        m = k - row['k0']
        res = {'sym': r['sym'], 'key': k, 'row_repo': row['name'], 'row_sha12': row['sha'],
               'line_in_commit': m + 1}
        d, _ = clone_with(roots, r['repo'], r['commit'])
        seen, landed = 0, None
        for p, s, n in EK.walk_commit(d, r['commit'])[0]:
            if n <= 0:
                continue
            if m < seen + n:
                landed = (p, m - seen + 1)
                break
            seen += n
        res['landed'] = landed
        res['ok'] = (row['sha'] == r['commit'][:12] and landed == (r['path'], 1)
                     and row['k0'] <= k < row['k0'] + row['lines'])
        checks.append(res)
        print('  check %s %s -> %s / %s / %s:%s %s' % (r['sym'], format(k, ','), row['name'], row['sha'],
              landed and landed[0], landed and landed[1], 'OK' if res['ok'] else 'REFUSED'), file=sys.stderr)

    from collections import Counter
    unplaced = [r for r in out if not r['placed']]
    no_files = [r for r in unplaced if r['files_listed'] == 0]
    kinds = {e['key']: e.get('kind') for e in E}
    counts = {
        'total': len(out),
        'with_files': len(out) - len(no_files),
        'placeable': sum(r['k0'] is not None for r in out),
        'placed': sum(r['placed'] for r in out),
        'named': len(unplaced),
        'no_files': len(no_files),
        'by_kind_unplaced': dict(Counter(kinds[r['sym']] for r in unplaced)),
        'distinct_commits_walked': len(walks),
    }
    readout = '%d elements placed, %d counted, not placed' % (counts['placed'], counts['named'])
    doc = {
        'schema': 'kuiper.elements.v1',
        'edition': a.edition,
        'built_by': 'tools/element_keys.py',
        'source': {'repo': 'elements', 'commit': head or 'UNKNOWN', 'path': 'catalogue/elements.json',
                   'tracked': tracked, 'sha256': sha256_file(src)},
        'licence_note': 'keys only (Q1): elements@%s states no licence (no LICENSE or NOTICE file), so only '
                        '`block:<Sym>`, the catalogue number and the register\'s file address (repo, commit, path) are '
                        'carried; never a title, a description or a category word. line_text is line 1 of that file '
                        'at that commit, licensed by its own repository, as keys.json carries line_text.'
                        % ((head or 'UNKNOWN')[:7]),
        'register_note': 'the catalogue is pinned to the register of 2026-09-15 (244 blocks, elements CATALOGUE.md:3); '
                         'the live register holds 606 (stars@cbca125 blocks/blocks.json:2)',
        'law': 'key = k0(wafer row of files[0].commit) + lines before files[0].path in `git ls-tree -r <commit>` + '
               '(1 - 1), by tools/edition_keys.py walk_commit(); placed only when the walk lands on the wafer '
               'row\'s lines and the file holds a text line',
        'wafer': {'wafer_tsv_sha256': sha256_file(os.path.join(COSMOS, 'wafer.tsv')),
                  'repos_tsv_sha256': sha256_file(os.path.join(COSMOS, 'repos.tsv')),
                  'address_space': space,
                  'cache': ('data/blob-lines-history.tsv, %d blobs' % len(EK.CACHE)) if cache_present
                  else 'data/blob-lines-history.tsv absent: every blob counted from git'},
        'counts': counts,
        'readout': readout,
        'checks': checks,
        'checks_ok': all(c['ok'] for c in checks) if checks else None,
        'command': ' '.join(['python3', 'tools/element_keys.py'] + sys.argv[1:]),
        'built_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'seconds': round(time.time() - t0, 1),
        'elements': out,
    }
    with io.open(a.out, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(doc, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(json.dumps(counts, indent=1))
    print(readout)
    for r in unplaced:
        print('  not placed: %-9s %s' % (r['sym'], r['why']), file=sys.stderr)
    return 0 if doc['checks_ok'] is not False else 2


if __name__ == '__main__':
    sys.exit(main())
