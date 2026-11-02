#!/usr/bin/env python3
"""drift_test.py: the tester's independent check of tools/drift.py and data/drift.json (Opus team 8, step 8). Apache-2.0.

ROADMAP.md step 8 "Acceptance test", the parts that live off the page (P4's page half is test.cjs):
  P1 determinism   two runs against the recorded heads, under two different PYTHONHASHSEEDs, write byte-identical
                   files, and both equal data/drift.json byte for byte.
  P2 refusal       (a) every repository of keys.json without a clone is UNVERIFIED in data/drift.json, never SAME;
                   (b) a clone removed (an estate of symlinks without it) makes every one of its rows UNVERIFIED,
                   leaves every other row byte-identical, drops the denominator by exactly its verified rows, and the
                   tool prints REFUSED; (c) heads emptied: exit non-zero and nothing written.
  P3 ground truth  re-derived here, not through the tool: every row's head is the clone's refs/remotes/origin/HEAD
                   now; every SAME row's `git show <head>:<path>` holds line_text at `line`; every MOVED row's at
                   `head_line` (its first occurrence, delta = head_line - line, and no longer at `line`); every GONE
                   row's `git grep -F -x` is empty; every FILE_GONE row's `git cat-file -e` fails; every UNVERIFIED
                   row's reason is true, and no row that could be verified is UNVERIFIED. Each row is classified
                   again from `git show` and the class must agree.
  P4 the counts    summary.counts are the class counts of rows; the share and its denominator follow; the README
                   paragraph (handoff/08-drift/README.md) prints the same five counts and share.
  P5 the law       drift.json names no repository outside cosmos/repos.tsv and no key outside keys.json, rows are
                   the bodies one to one in order, and no line text is quoted; and the tool READS nothing else:
                   (i) under strace every file it opens under /home/user is repos.tsv, keys.json, the tool, the heads
                   file, its output, or inside a clone, and it opens no socket; (ii) from a root that holds only
                   cosmos/repos.tsv, editions/<stamp>/keys.json and tools/drift.py it writes the same bytes.

  python3 drift_test.py [--root KB] [--estate DIR] [--scratch DIR] [--json OUT]      exit 0 only when all pass
"""
import argparse
import collections
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CLASSES = ['SAME', 'MOVED', 'GONE', 'FILE_GONE', 'UNVERIFIED']


def sh(args, cwd=None, env=None):
    r = subprocess.run(args, cwd=cwd, capture_output=True, env=env)
    return r.returncode, r.stdout, r.stderr


def sha(b):
    return hashlib.sha256(b).hexdigest()


def decode(raw):                       # the edition's own rule, tools/edition_keys.py:250
    return raw.decode('utf-8', 'replace').rstrip('\r')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default=os.path.abspath(os.path.join(HERE, '..', '..', '..', '..')))
    ap.add_argument('--edition', default=os.path.basename(os.path.abspath(os.path.join(HERE, '..', '..'))))
    ap.add_argument('--estate', default=None)
    ap.add_argument('--scratch', default='/tmp/nl010-opus/team-8/tester')
    ap.add_argument('--json', default=None, help='write the results as JSON here')
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    estate = os.path.abspath(a.estate or os.path.dirname(root))
    ed = a.edition
    tool = os.path.join(root, 'tools', 'drift.py')
    target = os.path.join(root, 'editions', ed, 'data', 'drift.json')
    keys_path = os.path.join(root, 'editions', ed, 'keys.json')
    tsv_path = os.path.join(root, 'cosmos', 'repos.tsv')
    os.makedirs(a.scratch, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='drift-test-', dir=a.scratch)
    results = []

    def ok(name, cond, detail):
        results.append({'test': name, 'pass': bool(cond), 'detail': detail})
        print('%s %-34s %s' % ('PASS' if cond else 'FAIL', name, detail), flush=True)

    for p in (tool, target, keys_path, tsv_path):
        if not os.path.exists(p):
            print('REFUSED: %s does not exist; nothing tested' % p)
            return 2
    base = open(target, 'rb').read()
    D = json.loads(base)
    bodies = json.load(open(keys_path, encoding='utf-8'))['bodies']
    tsv = [l.rstrip('\n').split('\t')[1] for l in open(tsv_path, encoding='utf-8') if l.strip() and not l.startswith('#')]

    def clone(repo):
        d = os.path.join(estate, repo)
        return d if os.path.isdir(os.path.join(d, '.git')) else None

    def run_tool(extra, env_extra=None, prefix=None, r=root):
        env = dict(os.environ)
        env.update(env_extra or {})
        return sh((prefix or []) + [sys.executable, os.path.join(r, 'tools', 'drift.py'), '--root', r,
                                    '--edition', ed] + extra, env=env)

    # ---------------------------------------------------------------- P1 determinism
    outs = []
    for seed in ('1', '4242'):
        o = os.path.join(tmp, 'p1-seed%s.json' % seed)
        rc, so, se = run_tool(['--estate', estate, '--heads', target, '--out', o], {'PYTHONHASHSEED': seed})
        outs.append((rc, open(o, 'rb').read() if os.path.exists(o) else b''))
    (r1, b1), (r2, b2) = outs
    ok('P1 two runs byte-identical', r1 == 0 and r2 == 0 and b1 and b1 == b2,
       'PYTHONHASHSEED 1 / 4242: exit %d / %d, %d / %d bytes, sha256 %s / %s' % (
           r1, r2, len(b1), len(b2), sha(b1)[:16], sha(b2)[:16]))
    ok('P1 re-run equals data/drift.json', b1 == base,
       'data/drift.json %d bytes sha256 %s; re-run %s' % (len(base), sha(base), 'identical' if b1 == base else
                                                           'DIFFERS at byte %s' % next((i for i in range(min(len(b1), len(base))) if b1[i] != base[i]), min(len(b1), len(base)))))

    # ---------------------------------------------------------------- P2 refusal
    repos = sorted({b['repo'] for b in bodies})
    absent = [r for r in repos if not clone(r)]
    bad_abs = [r['id'] for r in D['rows'] if r['repo'] in absent and r['class'] != 'UNVERIFIED']
    ok('P2a no clone -> UNVERIFIED', not bad_abs and all(D['heads'][r].get('sha') is None for r in absent),
       'repositories of keys.json without a clone in %s: %s; their %d rows all UNVERIFIED, head null%s' % (
           estate, absent or 'none', sum(1 for r in D['rows'] if r['repo'] in absent),
           (' (NOT: %s)' % bad_abs[:3]) if bad_abs else ''))
    per = collections.Counter(r['repo'] for r in D['rows'] if r['class'] != 'UNVERIFIED')
    for victim in [per.most_common(1)[0][0], 'data-grid-gb' if 'data-grid-gb' in per else per.most_common(2)[1][0]]:
        est2 = os.path.join(tmp, 'estate-without-' + victim)
        os.makedirs(est2)
        for n in sorted(os.listdir(estate)):
            if n != victim and os.path.isdir(os.path.join(estate, n, '.git')):
                os.symlink(os.path.join(estate, n), os.path.join(est2, n))
        o = os.path.join(tmp, 'p2-without-%s.json' % victim)
        rc, so, se = run_tool(['--estate', est2, '--heads', target, '--out', o])
        W = json.load(open(o)) if os.path.exists(o) else None
        lost = per[victim]
        allun = W is not None and all(r['class'] == 'UNVERIFIED' and r.get('reason') for r in W['rows'] if r['repo'] == victim)
        others = W is not None and all(x == y for x, y in zip(D['rows'], W['rows']) if x['repo'] != victim) \
            and len(W['rows']) == len(D['rows'])
        den = W and W['summary']['denominator']
        ok('P2b clone %s removed' % victim, rc == 0 and allun and others and den == D['summary']['denominator'] - lost
           and ('REFUSED: no clone of %s' % victim).encode() in so,
           'exit %d; its %d rows UNVERIFIED: %s; other rows unchanged: %s; denominator %d -> %s (drop %d expected); '
           'printed "%s"' % (rc, sum(1 for r in D['rows'] if r['repo'] == victim), allun, others,
                             D['summary']['denominator'], den, lost,
                             next((l for l in so.decode().splitlines() if victim in l and 'REFUSED' in l), 'no REFUSED line')))
    for label, body in (('{"heads": {}}', '{"heads": {}}\n'), ('{}', '{}\n')):
        e = os.path.join(tmp, 'empty-heads.json')
        open(e, 'w').write(body)
        o = os.path.join(tmp, 'never.json')
        rc, so, se = run_tool(['--estate', estate, '--heads', e, '--out', o])
        ok('P2c heads emptied %s' % label, rc != 0 and not os.path.exists(o) and not os.path.exists(o + '.tmp'),
           'exit %d, file written: %s; "%s"' % (rc, os.path.exists(o), (so + se).decode().strip().splitlines()[-1:]))

    # ---------------------------------------------------------------- P3 ground truth, independently
    keyed = {b['id']: b for b in bodies}
    shows, bad, n = {}, [], collections.Counter()
    heads_now = {}
    for repo in repos:
        d = clone(repo)
        if d:
            rc, out, _ = sh(['git', 'rev-parse', '-q', '--verify', 'refs/remotes/origin/HEAD^{commit}'], cwd=d)
            heads_now[repo] = out.decode().strip() if rc == 0 else None
    for repo, h in D['heads'].items():
        if h.get('sha') and heads_now.get(repo) != h['sha']:
            bad.append((repo, 'head %s in drift.json, clone origin/HEAD now %s' % (h['sha'][:12], (heads_now.get(repo) or '-')[:12])))

    def show(d, spec):
        if spec not in shows:
            rc, out, _ = sh(['git', 'show', spec], cwd=d)
            shows[spec] = out if rc == 0 else None
        return shows[spec]

    for r in D['rows']:
        k = keyed.get(r['id'])
        if k is None:
            bad.append((r['id'], 'not in keys.json'))
            continue
        cl, d, text = r['class'], clone(r['repo']), k.get('line_text')
        n[cl] += 1
        verifiable = bool(d and heads_now.get(r['repo']) and text and k.get('on_wafer') is not False
                          and k.get('key') is not None and r['repo'] in tsv)
        if cl == 'UNVERIFIED':
            why = r.get('reason') or ''
            if verifiable:
                bad.append((r['id'], 'UNVERIFIED (%s) but clone, head, text and key all exist' % why))
            elif why.startswith('no clone') and d:
                bad.append((r['id'], 'reason "no clone" but %s has a clone' % r['repo']))
            elif why == 'empty line_text' and text:
                bad.append((r['id'], 'reason "empty line_text" but keys.json has text'))
            elif why.startswith('key not on the wafer') and k.get('on_wafer') is not False and k.get('key') is not None:
                bad.append((r['id'], 'reason "not on the wafer" but keys.json says on_wafer'))
            elif not why:
                bad.append((r['id'], 'UNVERIFIED without a reason'))
            if r.get('head') and not d:
                bad.append((r['id'], 'a head without a clone'))
            continue
        if not verifiable:
            bad.append((r['id'], '%s claimed for an unverifiable row' % cl))
            continue
        spec = '%s:%s' % (r['head'], r['path'])
        body = show(d, spec)
        rc_e, _, _ = sh(['git', 'cat-file', '-e', spec], cwd=d) if body is None or cl == 'FILE_GONE' else (0, b'', b'')
        if body is None:
            mine = 'FILE_GONE' if rc_e != 0 else '?'
        else:
            ls = [decode(x) for x in body.split(b'\n')]
            hits = [i + 1 for i, x in enumerate(ls) if x == text]
            mine = 'SAME' if r['line'] <= len(ls) and ls[r['line'] - 1] == text else ('MOVED' if hits else 'GONE')
        if mine != cl:
            bad.append((r['id'], 'tool says %s, git show says %s' % (cl, mine)))
            continue
        if cl == 'MOVED':
            if r.get('head_line') != hits[0] or r.get('delta') != hits[0] - r['line'] or r.get('occurrences') != len(hits):
                bad.append((r['id'], 'MOVED head_line/delta/occurrences %s/%s/%s, git show %s/%s/%s' % (
                    r.get('head_line'), r.get('delta'), r.get('occurrences'), hits[0], hits[0] - r['line'], len(hits))))
        if cl == 'GONE':
            pf = os.path.join(tmp, 'pat')
            open(pf, 'wb').write(text.encode('utf-8') + b'\n' + text.encode('utf-8') + b'\r\n')
            rc, out, _ = sh(['git', 'grep', '-F', '-x', '-f', pf, r['head'], '--', r['path']], cwd=d)
            if out.strip():
                bad.append((r['id'], 'GONE but git grep -F -x finds %s' % out[:80]))
        if cl == 'FILE_GONE' and rc_e == 0:
            bad.append((r['id'], 'FILE_GONE but git cat-file -e finds the path'))
    ok('P3 ground truth by git show', not bad and sum(n.values()) == len(bodies),
       '%s re-derived from %d `git show` blobs at the heads (each head = the clone\'s origin/HEAD now); %d disagreements%s' % (
           dict(n), len(shows), len(bad), (': ' + '; '.join('%s %s' % x for x in bad[:4])) if bad else ''))

    # ---------------------------------------------------------------- P4 the five counts (data half)
    c = collections.Counter(r['class'] for r in D['rows'])
    s = D['summary']
    den = len(D['rows']) - c['UNVERIFIED']
    st = '%d SAME / %d (rows %d - UNVERIFIED %d)' % (c['SAME'], den, len(D['rows']), c['UNVERIFIED'])
    ok('P4 summary = rows', all(s['counts'][k] == c[k] for k in CLASSES) and s['rows'] == len(D['rows'])
       and s['denominator'] == den and s['share_text'] == st and set(c) <= set(CLASSES),
       ' / '.join('%d %s' % (c[k], k) for k in CLASSES) + '; ' + st)
    readme = os.path.join(HERE, 'README.md')
    if os.path.exists(readme):
        t = open(readme, encoding='utf-8').read()
        want = '%d SAME, %d MOVED, %d GONE, %d FILE_GONE, %d UNVERIFIED' % tuple(c[k] for k in CLASSES)
        sh_txt = '%d SAME / %d (rows %d − UNVERIFIED %d)' % (c['SAME'], den, len(D['rows']), c['UNVERIFIED'])
        ok('P4 README paragraph = drift.json', want in t and sh_txt in t, '"%s" %s; "%s" %s' % (
            want, 'present' if want in t else 'ABSENT', sh_txt, 'present' if sh_txt in t else 'ABSENT'))

    # ---------------------------------------------------------------- P5 the law
    stray_repo = sorted(x for x in ({r['repo'] for r in D['rows']} | set(D['heads'])) if x not in tsv)
    order = [b['id'] for b in bodies] == [r['id'] for r in D['rows']]
    stray_key = [r['id'] for r in D['rows'] if r['id'] not in keyed or keyed[r['id']].get('key') != r['key']
                 or keyed[r['id']]['path'] != r['path'] or int(keyed[r['id']]['line']) != r['line']
                 or keyed[r['id']]['commit'] != r['edition_commit'] or keyed[r['id']]['repo'] != r['repo']]
    texts = {b.get('line_text') for b in bodies if b.get('line_text') and len(b['line_text']) >= 12} | \
            {b.get('quote') for b in bodies if b.get('quote') and len(b['quote']) >= 12}
    strings = set()

    def walk(x):
        if isinstance(x, dict):
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
        elif isinstance(x, str):
            strings.add(x)
    walk(D)
    quoted = sorted(strings & texts)
    textkeys = [k for r in D['rows'] for k in r if k in ('line_text', 'quote', 'text')]
    ok('P5 drift.json inside the law', not stray_repo and not stray_key and order and len(D['rows']) == len(bodies)
       and not quoted and not textkeys,
       '%d rows = %d bodies in keys.json order: %s; repositories outside repos.tsv: %s; keys outside keys.json: %s; '
       'line texts quoted: %d' % (len(D['rows']), len(bodies), order, stray_repo or 'none', stray_key[:3] or 'none',
                                  len(quoted) + len(textkeys)))

    # (i) what the tool opens, under strace (observe mode, the mode that cuts an edition, and --heads mode)
    allowed_files = {os.path.realpath(p) for p in (tsv_path, keys_path, tool, target)}
    clone_dirs = [os.path.realpath(os.path.join(estate, x)) for x in os.listdir(estate)
                  if os.path.isdir(os.path.join(estate, x, '.git'))]
    if shutil.which('strace'):
        for mode, extra in (('observe', []), ('--heads', ['--heads', target])):
            o = os.path.join(tmp, 'p5-%s.json' % mode.strip('-'))
            tr = os.path.join(tmp, 'p5-%s.strace' % mode.strip('-'))
            rc, so, se = run_tool(['--estate', estate, '--out', o] + extra,
                                  prefix=['strace', '-f', '-qq', '-e', 'trace=open,openat,openat2,connect,socket',
                                          '-o', tr])
            here_home, sockets, sysfiles = set(), [], set()
            for line in open(tr, errors='replace'):
                if re.search(r'\b(socket|connect)\(', line) and ' = -1' not in line:
                    if 'AF_UNIX' not in line or 'connect(' in line:
                        sockets.append(line.strip()[:120])
                m = re.search(r'open(?:at2?)?\((?:[^,]*, )?"([^"]*)"', line)
                if not m or ' = -1 ' in line:
                    continue
                p = m.group(1)
                if not p.startswith('/'):
                    continue                     # relative opens are resolved by git inside its clone (cwd)
                rp = os.path.realpath(p)
                if rp.startswith('/home/user'):
                    here_home.add(rp)
                else:
                    sysfiles.add(rp.split('/')[1])
            out_real = os.path.realpath(o)
            stray = sorted(p for p in here_home if p not in allowed_files and not p.startswith(out_real)
                           and not any(p == cd or p.startswith(cd + '/') for cd in clone_dirs)
                           and not p.startswith(os.path.realpath(tmp)))
            in_clones = sorted({cd for cd in clone_dirs if any(p.startswith(cd + '/') for p in here_home)})
            ok('P5 reads (%s, strace)' % mode, rc == 0 and not stray and not sockets,
               'exit %d; opened under /home/user: %d files = repos.tsv, keys.json, tools/drift.py%s + %d clones; '
               'outside it only system dirs %s; sockets: %d; stray: %s' % (
                   rc, len(here_home), ', data/drift.json (the recorded heads)' if extra else '', len(in_clones),
                   sorted(sysfiles), len(sockets), stray[:5] or 'none'))
            if mode == 'observe' and os.path.exists(o):
                ob = open(o, 'rb').read()
                print('INFO observe-now vs data/drift.json: %s (the clones %s been fetched since the cut)' % (
                    'byte-identical' if ob == base else 'differ', 'have not' if ob == base else 'may have'), flush=True)
    else:
        ok('P5 reads (strace)', False, 'strace not installed: the read trace was not measured')

    # (ii) a root that holds only the three inputs writes the same bytes
    mini = os.path.join(tmp, 'mini-root')
    for rel in ('cosmos/repos.tsv', 'editions/%s/keys.json' % ed, 'tools/drift.py'):
        os.makedirs(os.path.dirname(os.path.join(mini, rel)), exist_ok=True)
        shutil.copyfile(os.path.join(root, rel), os.path.join(mini, rel))
    hp = os.path.join(tmp, 'recorded-heads.json')
    shutil.copyfile(target, hp)
    o = os.path.join(tmp, 'p5-mini.json')
    rc, so, se = run_tool(['--estate', estate, '--heads', hp, '--out', o], r=mini)
    mb = open(o, 'rb').read() if os.path.exists(o) else b''
    ok('P5 minimal root, same bytes', rc == 0 and mb == base,
       'root = repos.tsv + keys.json + tools/drift.py only (%s): exit %d, %d bytes, %s data/drift.json' % (
           mini, rc, len(mb), 'identical to' if mb == base else 'DIFFERENT from'))

    shutil.rmtree(tmp, ignore_errors=True)
    fails = [x for x in results if not x['pass']]
    summary = {'drift_json_sha256': sha(base), 'tool_sha256': sha(open(tool, 'rb').read()),
               'keys_json_sha256': sha(open(keys_path, 'rb').read()), 'counts': dict(c), 'results': results,
               'result': 'FAIL' if fails else 'PASS'}
    if a.json:
        with open(a.json, 'w') as f:
            json.dump(summary, f, indent=1)
    print('RESULT: %s (%d of %d)' % (summary['result'], len(results) - len(fails), len(results)))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
