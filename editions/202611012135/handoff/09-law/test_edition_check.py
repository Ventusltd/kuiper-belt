#!/usr/bin/env python3
"""Negative tests for tools/edition_check.py (Opus team 9, NL-010 step 9). Apache-2.0 (kuiper-belt code).

  python3 editions/202611012135/handoff/09-law/test_edition_check.py [--scratch DIR] [--estate DIR]

Builds a fixture repository from the real one (every editions/<stamp>/ without handoff/, the pointer, cosmos/repos.tsv,
tools/drift.py and tools/edition_check.py), made clean on purpose: only the admitted modules stay in modules/, the
`references` record is dropped (E6 then reads KY_NAMES from the page), and proof/edition-sha256.txt is cut for the
newest folder. The clean fixture must print RESULT: PASS under --strict. Then each case copies the fixture, makes ONE
change, and must make its check FAIL (exit 1, the check's line `En FAIL`, and the named words in it). Two positive
cases prove the pointer patch: moving the pointer to Edition 5 with search forwarding passes E4; without it, fails.
Exit 0 only when every case behaves as written. Writes TEST-RESULTS.json beside this file when --write is given.
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
ED = os.path.dirname(os.path.dirname(HERE))                  # editions/<stamp>
ROOT = os.path.dirname(os.path.dirname(ED))                  # the repository
STAMP = os.path.basename(ED)


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


SCRATCH = arg('--scratch', '/tmp/nl010-opus/team-9/tester')
ESTATE = arg('--estate', os.path.dirname(ROOT))


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def cut_proof(ed):
    rows = []
    for dp, dn, fn in os.walk(ed):
        for f in fn:
            rel = os.path.relpath(os.path.join(dp, f), ed).replace(os.sep, '/')
            if rel != 'proof/edition-sha256.txt':
                rows.append('%s  ./%s' % (sha(os.path.join(ed, rel)), rel))
    os.makedirs(os.path.join(ed, 'proof'), exist_ok=True)
    open(os.path.join(ed, 'proof', 'edition-sha256.txt'), 'w').write('\n'.join(sorted(rows, key=lambda r: r[66:])) + '\n')


def build(base):
    os.makedirs(os.path.join(base, 'editions'))
    os.makedirs(os.path.join(base, 'cosmos'))
    os.makedirs(os.path.join(base, 'tools'))
    for n in os.listdir(os.path.join(ROOT, 'editions')):
        s = os.path.join(ROOT, 'editions', n)
        if os.path.isdir(s):
            shutil.copytree(s, os.path.join(base, 'editions', n), ignore=shutil.ignore_patterns('handoff') if n == STAMP else None)
        else:
            shutil.copy2(s, os.path.join(base, 'editions', n))
    shutil.copy2(os.path.join(ROOT, 'cosmos', 'repos.tsv'), os.path.join(base, 'cosmos', 'repos.tsv'))
    for t in ('drift.py', 'edition_check.py'):
        shutil.copy2(os.path.join(ROOT, 'tools', t), os.path.join(base, 'tools', t))
    ed = os.path.join(base, 'editions', STAMP)
    man = json.load(open(os.path.join(ed, 'modules.json')))
    keep = set(os.path.basename(r['path']) for r in man['modules'])
    for f in os.listdir(os.path.join(ed, 'modules')):
        if f not in keep:
            os.remove(os.path.join(ed, 'modules', f))
    man.pop('references', None)
    json.dump(man, open(os.path.join(ed, 'modules.json'), 'w'), indent=1)
    cut_proof(ed)
    return ed


def run(base, *extra):
    t = time.time()
    r = subprocess.run([sys.executable, os.path.join(base, 'tools', 'edition_check.py'), '--root', base, '--estate', ESTATE] + list(extra),
                       capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr, round(time.time() - t, 1)


def man_edit(ed, fn):
    p = os.path.join(ed, 'modules.json'); m = json.load(open(p)); fn(m); json.dump(m, open(p, 'w'), indent=1)


def first(ed, key):
    return json.load(open(os.path.join(ed, 'modules.json')))['modules'][0][key]


def sub(p, a, b, count=1):
    t = open(p, encoding='utf-8').read()
    assert a in t, (p, a)
    open(p, 'w', encoding='utf-8').write(t.replace(a, b, count))


def resync(ed, path):
    """after a deliberate edit of a module, re-record its sha256 and bytes so only the check under test can fail"""
    q = os.path.join(ed, path)
    man_edit(ed, lambda m: [r.update(sha256=sha(q), bytes=os.path.getsize(q)) for r in m['modules'] if r['path'] == path])


POINTER = os.path.join('editions', 'index.html')


def cases():
    P = lambda b: os.path.join(b, POINTER)
    E = lambda b: os.path.join(b, 'editions', STAMP)
    M = lambda b: os.path.join(E(b), first(E(b), 'path'))
    prev = re.search(r"location\.replace\('(\d{12})/", open(os.path.join(ROOT, POINTER)).read()).group(1)
    return [
        ('E1 a script that does not parse', 'E1', 'SyntaxError', [],
         lambda b: sub(os.path.join(E(b), 'index.html'), '<script type="module">', '<script type="module">\nconst = ;\n')),
        ('E2 one altered byte in a module', 'E2', 'refused: sha256 mismatch', [],
         lambda b: open(M(b), 'ab').write(b' ')),
        ('E2 a module file in no record and no hand-off (stray)', 'E2', 'stray file', [],
         lambda b: open(os.path.join(E(b), 'modules', '202611020000-stray.js'), 'w').write('/* stray */\n')),
        ('E2 order names an id with no record', 'E2', 'no record', [],
         lambda b: man_edit(E(b), lambda m: m['order'].append('ghost'))),
        ('E3 an earlier edition folder edited', 'E3', 'sha256', [],
         lambda b: open(os.path.join(b, 'editions', prev, 'README.md'), 'a').write('edited\n')),
        ('E3 a file added after the cut', 'E3', 'not in proof/edition-sha256.txt', [],
         lambda b: open(os.path.join(E(b), 'data', 'late.json'), 'w').write('{}\n')),
        ('E4 the pointer\'s three stamps disagree', 'E4', 'disagree', [],
         lambda b: sub(P(b), '<a href="%s/">' % prev, '<a href="202611012022/">')),
        ('E4 a fourth place names a stamp', 'E4', 'not 3', [],
         lambda b: sub(P(b), '<title>Kuiper editions</title>', '<title>Kuiper editions 202611012022/</title>')),
        ('E4 pointer moved to Edition 5 forwarding only the hash', 'E4', 'location.search + location.hash', [],
         lambda b: open(P(b), 'w').write(open(P(b)).read().replace(prev, STAMP))),
        ('E5 keys.json changed and README silent', 'E5', 'names no change', [],
         lambda b: open(os.path.join(E(b), 'keys.json'), 'a').write('\n')),
        ('E6 generation differs from the file name and header', 'E6', 'stamp mismatch', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0].update(generation='202611020001'))),
        ('E6 a requires name that is not a hook', 'E6', 'refused: missing hook noSuchHook', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0]['requires'].append('noSuchHook'))),
        ('E6 no licence', 'E6', 'no licence', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0].update(licence=''))),
        ('E7 a writes entry with no literal in the file', 'E7', 'no literal', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0]['writes'].append('#no-such-node-anywhere'))),
        ('E7 a fetch( outside reads', 'E7', 'not in reads', [],
         lambda b: (open(M(b), 'a').write("\n;fetch('data/secret.json');\n"), resync(E(b), first(E(b), 'path')))),
        ('E8 KY.register( twice', 'E8', 'appears 2 times', [],
         lambda b: (open(M(b), 'a').write('\n// KY.register( again\n'), resync(E(b), first(E(b), 'path')))),
        ('E9 drift.json not what the tool re-computes', 'E9', 're-computed', [],
         lambda b: sub(os.path.join(E(b), 'data', 'drift.json'), '"cap_seconds": 1209600', '"cap_seconds": 1209601')),
        ('strict: a pending module counts as FAIL', 'E2', 'pending admission', ['--strict'],
         lambda b: (os.makedirs(os.path.join(E(b), 'handoff', '99-x')),
                    open(os.path.join(E(b), 'modules', '202611020000-pending.js'), 'w').write('/* pending */\n'),
                    open(os.path.join(E(b), 'handoff', '99-x', 'PLAN.md'), 'w').write('modules/202611020000-pending.js\n'))),
    ]


def main():
    os.makedirs(SCRATCH, exist_ok=True)
    work = tempfile.mkdtemp(prefix='edition-check-test-', dir=SCRATCH)
    fixture = os.path.join(work, 'fixture')
    build(fixture)
    results, bad = [], 0
    rc, out, dt = run(fixture, '--strict')
    good = rc == 0 and 'RESULT: PASS' in out and 'NOT EVALUATED' not in out
    results.append({'case': 'clean fixture, --strict', 'expect': 'PASS', 'exit': rc, 'ok': good, 'seconds': dt, 'output': out.strip().split('\n')})
    print('%s clean fixture --strict: exit %d (%ss)' % ('PASS' if good else 'FAIL', rc, dt))
    if not good:
        print(out); bad += 1
    for name, code, words, extra, mutate in cases():
        b = os.path.join(work, re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-'))
        shutil.copytree(fixture, b, symlinks=True)
        mutate(b)
        rc, out, dt = run(b, *extra)
        line = next((l for l in out.split('\n') if l.startswith(code + ' ')), '')
        hit = rc == 1 and 'RESULT: FAIL' in out and (line.startswith(code + ' FAIL') or (extra and words in out)) and words in out
        results.append({'case': name, 'check': code, 'expect': 'FAIL with "%s"' % words, 'exit': rc, 'ok': bool(hit), 'seconds': dt, 'line': line})
        print('%s %s: exit %d; %s (%ss)' % ('PASS' if hit else 'FAIL', name, rc, line[:150], dt))
        if not hit:
            print(out); bad += 1
        shutil.rmtree(b, ignore_errors=True)
    # the pointer patch, positive: Edition 5 named in three places, search and hash forwarded
    b = os.path.join(work, 'pointer-patch')
    shutil.copytree(fixture, b, symlinks=True)
    patch = os.path.join(HERE, 'pointer.patch')
    t = open(os.path.join(b, POINTER)).read()
    prev = re.search(r"location\.replace\('(\d{12})/", t).group(1)
    r = subprocess.run(['patch', '-p1', '--dry-run', '-d', b, '-i', patch], capture_output=True, text=True)
    applied = r.returncode == 0 and subprocess.run(['patch', '-p1', '-d', b, '-i', patch], capture_output=True, text=True).returncode == 0
    if applied:
        open(os.path.join(b, POINTER), 'w').write(open(os.path.join(b, POINTER)).read().replace(prev, STAMP))
    rc, out, dt = run(b, '--strict')
    line = next((l for l in out.split('\n') if l.startswith('E4 ')), '')
    good = applied and rc == 0 and line.startswith('E4 PASS') and 'location.search + location.hash' in line
    results.append({'case': 'pointer.patch applied, pointer moved to Edition 5', 'check': 'E4', 'expect': 'PASS', 'exit': rc, 'ok': good, 'seconds': dt, 'line': line})
    print('%s pointer.patch applied and moved to %s: exit %d; %s (%ss)' % ('PASS' if good else 'FAIL', STAMP, rc, line[:150], dt))
    if not good:
        print(r.stdout + r.stderr + out); bad += 1
    shutil.rmtree(work, ignore_errors=True)
    print('RESULT: %s (%d of %d cases as written)' % ('PASS' if not bad else 'FAIL', len(results) - bad, len(results)))
    if '--write' in sys.argv:
        json.dump({'tool': 'tools/edition_check.py', 'tool_sha256': sha(os.path.join(ROOT, 'tools', 'edition_check.py')),
                   'run_at_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'cases': results,
                   'result': 'PASS' if not bad else 'FAIL'}, open(os.path.join(HERE, 'TEST-RESULTS.json'), 'w'), indent=1)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
