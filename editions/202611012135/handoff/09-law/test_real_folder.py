#!/usr/bin/env python3
"""test_real_folder.py: negative tests of tools/edition_check.py on a copy of the REAL repository (Opus team 9 lead,
NL-010 step 9). Apache-2.0 (kuiper-belt code), kuiper-belt README.md:156-157. The builder's test_edition_check.py runs
the same law on a synthetic repository (for a GitHub runner); this file runs it on the real folders, with the real
tools/drift.py re-run against the estate's clones for E9.

  python3 editions/202611012135/handoff/09-law/test_real_folder.py [--scratch DIR] [--estate DIR] [--write]

Builds a fixture repository from the real one (every editions/<stamp>/ without handoff/, the pointer, cosmos/repos.tsv,
tools/drift.py and tools/edition_check.py), made clean on purpose: only the admitted modules stay in modules/, the
`references` record is dropped (E6 then reads KY_NAMES from the page), and proof/edition-sha256.txt is cut for the
newest folder. The clean fixture must print RESULT: PASS under --strict with nothing NOT EVALUATED. Then each case
copies the fixture, makes ONE change, and must make its check FAIL (exit 1, the check's line `En FAIL`, and the named
words in it). The last case applies handoff/09-law/pointer.patch and moves the pointer to Edition 5: E4 must PASS.
Exit 0 only when every case behaves as written. --write saves TEST-REAL-RESULTS.json beside this file.
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
ED = os.path.dirname(os.path.dirname(HERE))                  # editions/<stamp>
ROOT = os.path.dirname(os.path.dirname(ED))                  # the repository
STAMP = os.path.basename(ED)


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


SCRATCH = arg('--scratch', '/tmp/nl010-opus/team-9/lead')
ESTATE = arg('--estate', os.path.dirname(ROOT))
POINTER = os.path.join('editions', 'index.html')


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


def estate_of_record(work, ed):
    """the estate as drift.json recorded it: a folder of symlinks to every clone, leaving out each repository whose head
    drift.json records as absent (sha null), so a clone made after the cut (pipelinenews at 00:56) does not change the
    replay. The real folder's E9 is still judged against today's estate by tools/edition_check.py itself."""
    D = json.load(open(os.path.join(ed, 'data', 'drift.json')))
    absent = set(r.lower() for r, h in D.get('heads', {}).items() if isinstance(h, dict) and not h.get('sha'))
    est = os.path.join(work, 'estate-of-record')
    os.makedirs(est)
    left = []
    for n in sorted(os.listdir(ESTATE)):
        if os.path.isdir(os.path.join(ESTATE, n, '.git')):
            if n.lower() in absent:
                left.append(n)
            else:
                os.symlink(os.path.join(ESTATE, n), os.path.join(est, n))
    return est, left


def build(base):
    for d in ('editions', 'cosmos', 'tools'):
        os.makedirs(os.path.join(base, d))
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


RUN_ESTATE = [ESTATE]


def run(base, *extra):
    t = time.time()
    r = subprocess.run([sys.executable, os.path.join(base, 'tools', 'edition_check.py'), '--root', base, '--estate', RUN_ESTATE[0]] + list(extra),
                       capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr, round(time.time() - t, 1)


def man_edit(ed, fn):
    p = os.path.join(ed, 'modules.json'); m = json.load(open(p)); fn(m); json.dump(m, open(p, 'w'), indent=1)


def first(ed, key):
    return json.load(open(os.path.join(ed, 'modules.json')))['modules'][0][key]


def sub(p, a, b, count=1):
    t = open(p, encoding='utf-8').read()
    assert a in t, (p, a)
    t = t.replace(a, b, count)
    open(p, 'w', encoding='utf-8').write(t)


def append(p, text, mode='a'):
    with open(p, mode) as f:
        f.write(text)


def resync(ed, path):
    """after a deliberate edit of a module, re-record its sha256 and bytes so only the check under test can fail"""
    q = os.path.join(ed, path)
    man_edit(ed, lambda m: [r.update(sha256=sha(q), bytes=os.path.getsize(q)) for r in m['modules'] if r['path'] == path])


def cases(prev):
    P = lambda b: os.path.join(b, POINTER)
    E = lambda b: os.path.join(b, 'editions', STAMP)
    M = lambda b: os.path.join(E(b), first(E(b), 'path'))
    return [
        ('E1 a script that does not parse', 'E1', 'SyntaxError', [],
         lambda b: sub(os.path.join(E(b), 'index.html'), '<script type="module">', '<script type="module">\nconst = ;\n')),
        ('E2 one altered byte in a module', 'E2', 'refused: sha256 mismatch', [],
         lambda b: append(M(b), b' ', 'ab')),
        ('E2 a module file in no record and no hand-off (stray)', 'E2', 'stray file', [],
         lambda b: append(os.path.join(E(b), 'modules', '202611020000-stray.js'), '/* stray */\n', 'w')),
        ('E2 order names an id with no record', 'E2', 'no record', [],
         lambda b: man_edit(E(b), lambda m: m['order'].append('ghost'))),
        ('E3 an earlier edition folder edited', 'E3', 'sha256', [],
         lambda b: append(os.path.join(b, 'editions', prev, 'README.md'), 'edited\n')),
        ('E3 a file added after the cut', 'E3', 'not in proof/edition-sha256.txt', [],
         lambda b: append(os.path.join(E(b), 'data', 'late.json'), '{}\n', 'w')),
        ('E4 the pointer\'s three stamps disagree', 'E4', 'disagree', [],
         lambda b: sub(P(b), '<a href="%s/">' % prev, '<a href="202611012022/">')),
        ('E4 a fourth place names a stamp', 'E4', 'not 3', [],
         lambda b: sub(P(b), '<title>Kuiper editions</title>', '<title>Kuiper editions 202611012022/</title>')),
        ('E4 pointer moved to Edition 5 forwarding only the hash', 'E4', 'location.search + location.hash', [],
         lambda b: sub(P(b), prev, STAMP, 3)),
        ('E5 keys.json changed and README silent', 'E5', 'names no change', [],
         lambda b: append(os.path.join(E(b), 'keys.json'), '\n')),
        ('E6 generation differs from the file name and header', 'E6', 'stamp mismatch', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0].update(generation='202611020001'))),
        ('E6 a requires name that is not a hook', 'E6', 'refused: missing hook noSuchHook', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0]['requires'].append('noSuchHook'))),
        ('E6 no licence', 'E6', 'no licence', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0].update(licence=''))),
        ('E7 a writes entry with no literal in the file', 'E7', 'no literal', [],
         lambda b: man_edit(E(b), lambda m: m['modules'][0]['writes'].append('#no-such-node-anywhere'))),
        ('E7 a fetch( outside reads', 'E7', 'not in reads', [],
         lambda b: (append(M(b), "\n;fetch('data/secret.json');\n"), resync(E(b), first(E(b), 'path')))),
        ('E8 KY.register( twice', 'E8', 'appears 2 times', [],
         lambda b: (append(M(b), '\n// KY.register( again\n'), resync(E(b), first(E(b), 'path')))),
        ('E9 drift.json not what the tool re-computes', 'E9', 're-computed', [],
         lambda b: sub(os.path.join(E(b), 'data', 'drift.json'), '"cap_seconds": 1209600', '"cap_seconds": 1209601')),
        ('strict: a pending module counts as FAIL', 'E2', 'pending admission', ['--strict'],
         lambda b: (os.makedirs(os.path.join(E(b), 'handoff', '99-x')),
                    append(os.path.join(E(b), 'modules', '202611020000-pending.js'), '/* pending */\n', 'w'),
                    append(os.path.join(E(b), 'handoff', '99-x', 'PLAN.md'), 'modules/202611020000-pending.js\n', 'w'))),
    ]


def main():
    os.makedirs(SCRATCH, exist_ok=True)
    work = tempfile.mkdtemp(prefix='edition-check-real-', dir=SCRATCH)
    fixture = os.path.join(work, 'fixture')
    build(fixture)
    RUN_ESTATE[0], left = estate_of_record(work, os.path.join(fixture, 'editions', STAMP))
    print('estate of record: %s clones linked, left out as recorded absent: %s' % (len(os.listdir(RUN_ESTATE[0])), ', '.join(left) or 'none'))
    prev = re.search(r"location\.replace\('(\d{12})/", open(os.path.join(fixture, POINTER)).read()).group(1)
    results, bad = [], 0
    rc, out, dt = run(fixture, '--strict')
    good = rc == 0 and 'RESULT: PASS' in out and 'NOT EVALUATED' not in out
    results.append({'case': 'clean fixture, --strict', 'expect': 'PASS', 'exit': rc, 'ok': good, 'seconds': dt, 'output': out.strip().split('\n')})
    print('%s clean fixture --strict: exit %d (%ss)' % ('PASS' if good else 'FAIL', rc, dt))
    if not good:
        print(out); bad += 1
    for name, code, words, extra, mutate in cases(prev):
        b = os.path.join(work, re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-'))
        shutil.copytree(fixture, b, symlinks=True)
        mutate(b)
        rc, out, dt = run(b, *extra)
        line = next((l for l in out.split('\n') if l.startswith(code + ' ')), '')
        hit = rc == 1 and 'RESULT: FAIL' in out and words in out and (line.startswith(code + ' FAIL') or bool(extra))
        results.append({'case': name, 'check': code, 'expect': 'FAIL with "%s"' % words, 'exit': rc, 'ok': bool(hit), 'seconds': dt, 'line': line})
        print('%s %s: exit %d; %s (%ss)' % ('PASS' if hit else 'FAIL', name, rc, line[:150], dt))
        if not hit:
            print(out); bad += 1
        shutil.rmtree(b, ignore_errors=True)
    # the pointer patch, positive: Edition 5 named in three places, search and hash forwarded
    b = os.path.join(work, 'pointer-patch')
    shutil.copytree(fixture, b, symlinks=True)
    patch = os.path.join(HERE, 'pointer.patch')
    r = subprocess.run(['patch', '-p1', '-d', b, '-i', patch], capture_output=True, text=True)
    applied = r.returncode == 0
    if applied:
        sub(os.path.join(b, POINTER), prev, STAMP, 3)
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
                   'result': 'PASS' if not bad else 'FAIL'}, open(os.path.join(HERE, 'TEST-REAL-RESULTS.json'), 'w'), indent=1)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
