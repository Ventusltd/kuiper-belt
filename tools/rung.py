#!/usr/bin/env python3
r"""tools/rung.py - finish an iteration: test it, photograph it, check the faces, run the gate.

THE MANUAL STEP THIS REMOVES. Handing an iteration over is five commands in one fixed order, and the
order matters: the photographs must be taken AFTER the last edit or they are not evidence, and the
gate must run after the photographs or it judges the wrong ones. Getting that order wrong cost a
reviewer an evening once already. At one rung every ten minutes it is five chances an hour to get it
wrong, so it stops being something to remember.

WHAT IT DOES, IN THIS ORDER, STOPPING AT THE FIRST REFUSAL.

    1  run every self test the iteration declares, headless, and score it
    2  photograph every page at both widths, plus the views worth seeing: each page:query in the
       iteration's own test list, and the middle line of each carried file, which is the card
    3  refuse if any photograph is older than the page it shows
    4  read the rendered pages and refuse anything on a face that a reader has no use for
    5  run the three phase gate and print its verdict

    python tools/rung.py 15                 the whole thing
    python tools/rung.py 15 --no-gate       stop after the faces, while still building
    python tools/rung.py --selftest         a refusal in the middle must stop the rest
"""
import io
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from iterate import folder, ROOT


def run(argv, why):
    print('\n--- %s ---' % why)
    r = subprocess.run([sys.executable] + argv, cwd=os.path.join(HERE, '..'))
    return r.returncode


def views(d):
    """The views worth a photograph: every page on its own, each page:query the iteration declares,
    and the middle line of every carried file, which is the only way to see the card at all."""
    out = []
    p = os.path.join(d, 'selftests.txt')
    for line in io.open(p, encoding='utf-8') if os.path.exists(p) else []:
        q = line.split()[0] if line.split() else ''
        if ':' in q and q.split(':')[0].endswith('.html') and 'selftest=' not in q:
            page, query = q.split(':', 1)
            if (page, query) not in out:
                out.append((page, query))
    lst = os.path.join(d, 'cosmos', 'cards', 'list.tsv')
    for line in io.open(lst, encoding='utf-8') if os.path.exists(lst) else []:
        if line.startswith('#') or not line.strip():
            continue
        c = line.rstrip('\n').split('\t')
        if len(c) > 3:
            out.append(('index.html', 'key=%d' % (int(c[2]) + int(c[3]) // 2)))
    return out


def rung(n, gate=True):
    d = folder(n)
    if not os.path.isdir(d):
        print('REFUSED: no iteration %s' % n)
        return 2
    name = os.path.basename(d)
    if run([os.path.join(HERE, 'iterate.py'), 'test', str(n)], 'every self test it declares'):
        return 1
    v = json.load(io.open(os.path.join(d, 'verdict.json'), encoding='utf-8'))
    if v['score'] != v['out_of']:
        print('\nSTOPPED: %s scored %d of %d. Nothing is photographed until it passes its own tests.'
              % (name, v['score'], v['out_of']))
        return 1
    print('\n--- photographs, after the last edit and not before ---')
    subprocess.run([sys.executable, os.path.join(HERE, 'shot.py'), str(n)],
                   cwd=os.path.join(HERE, '..'), capture_output=True)
    for page, query in views(d):
        subprocess.run([sys.executable, os.path.join(HERE, 'shot.py'), str(n), page, '--q', query],
                       cwd=os.path.join(HERE, '..'), capture_output=True)
    if run([os.path.join(HERE, 'shot.py'), '--fresh', str(n)], 'every photograph is of the page as it is now'):
        return 1
    if run([os.path.join(HERE, 'face.py'), str(n)], 'what each page puts in front of a reader'):
        return 1
    if not gate:
        print('\n%s is tested, photographed and clean on every face. The gate was not run.' % name)
        return 0
    code = run([os.path.join(HERE, 'swarm.py'), str(n)], 'the three phase gate')
    print('\nLOOK AT THE PHOTOGRAPHS BEFORE HANDING IT OVER: %s'
          % os.path.join(ROOT, 'SHOTS', name))
    return code


def selftest():
    """A refusal in the middle must stop everything after it. An iteration that fails its own tests
    must never reach the photographs, or the pictures become evidence for a page that failed."""
    ns = sorted(x for x in os.listdir(ROOT) if re.match(r'^\d{4}$', x))
    if not ns:
        print('SELFTEST FAIL: no iteration to test against')
        return 1
    out = subprocess.run([sys.executable, os.path.join(HERE, 'rung.py'), '999999'],
                         cwd=os.path.join(HERE, '..'), capture_output=True, text=True)
    ok1 = out.returncode == 2 and 'REFUSED' in (out.stdout or '')
    print('%s  an iteration that does not exist is refused' % ('pass' if ok1 else 'FAIL'))
    v = views(folder(int(ns[-1])))
    ok2 = any(q.startswith('key=') for _, q in v)
    print('%s  the card itself is among the views photographed: %s' % ('pass' if ok2 else 'FAIL', v))
    print('SELFTEST %s' % ('PASS' if ok1 and ok2 else 'FAIL'))
    return 0 if ok1 and ok2 else 1


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--selftest':
        return selftest()
    if not argv[0].isdigit():
        print('REFUSED: give an iteration number, or --selftest')
        return 2
    return rung(int(argv[0]), gate='--no-gate' not in argv)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
