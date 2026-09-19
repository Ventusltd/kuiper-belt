#!/usr/bin/env python3
r"""tools/compose.py - put a release together EXACTLY AS IT IS PUBLISHED, locally, and test it THERE.

THE FAULT THIS EXISTS FOR. The first feature part went live and the dots never gathered. In its own
folder the part sat beside the module it imports, and every check passed. Published, the part lives in
/kuiper/cartridges/ and the module in /kuiper/releases/<shell>/; a script asks for a module relative to
ITS OWN address, so it asked for a file that is not there, and its catch swallowed the answer. The gate
and the reviewer had both tested the FOLDER, where everything sits side by side. A page must be tested
in the shape it is served in.

WHAT IT BUILDS. A throwaway site: kuiper/index.html is the composer, kuiper/current.json the pointer,
kuiper/releases/<generation>-kuiper-shell/ the newest shell on the drive, kuiper/cartridges/ every
part released since that shell whose review has not failed it, in order, and last of all the part this
iteration releases. Hashes are real. Then the page's own checks are run THROUGH THE COMPOSER.

    python tools/compose.py 36                 compose iteration 36 as published and run its checks there
    python tools/compose.py 36 --keep          and leave the throwaway site where it can be driven by hand
"""
import hashlib
import io
import json
import os
import re
import shutil
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from iterate import folder, ROOT
import why

SERVED = ('.html', '.js', '.mjs', '.css')
CHECKS = (('selftest=isolate', '390x844'), ('selftest=isolate', '1366x900'), ('selftest=card', '390x844'), ('selftest=buttons', '1366x900'))


def sha(p):
    return hashlib.sha256(io.open(p, 'rb').read()).hexdigest()


def passed(d):
    """Released before this one, as far as anybody can know: the timer takes the oldest first, so every earlier
    part is on the live address by the time this one is, UNLESS its review failed it."""
    r = os.path.join(d, 'REVIEW.md')
    return not (os.path.exists(r) and io.open(r, encoding='utf-8', errors='replace').read(12).upper().startswith('FAIL'))


def build(n, out):
    """The site as it would stand the moment iteration n is released."""
    nums = sorted(int(x) for x in os.listdir(ROOT) if re.match(r'^\d{4}$', x) and int(x) <= n)
    shells = [x for x in nums if os.path.exists(os.path.join(folder(x), 'SHELL.json'))]
    if not shells:
        raise SystemExit('REFUSED: no shell on the drive at or before %04d' % n)
    sh = shells[-1]
    top = os.path.join(out, 'kuiper')
    rid = '%04d00000000-kuiper-shell' % sh
    rel = os.path.join(top, 'releases', rid)
    os.makedirs(rel)
    for f in os.listdir(folder(sh)):
        p = os.path.join(folder(sh), f)
        if f == 'cosmos':
            shutil.copytree(p, os.path.join(rel, f))
        elif os.path.isfile(p) and f.endswith(SERVED):
            shutil.copy(p, rel)
    os.makedirs(os.path.join(top, 'cartridges'))
    shutil.copy(os.path.join(HERE, 'composer.html'), os.path.join(top, 'index.html'))
    order, carts = [], {}
    # A PART AND THE CHECKS WRITTEN FOR IT ARE TWO RELEASES OF ONE CHANGE: each is one file, so they go out a few
    # minutes apart, and either alone is judged by the other's old half. CARTRIDGE.json may name its pair ("with"),
    # and the pair is composed together, which is the state the live address is in once both have landed.
    mine = os.path.join(folder(n), 'CARTRIDGE.json')
    pair = set(json.load(io.open(mine, encoding='utf-8')).get('with', [])) if os.path.exists(mine) else set()
    nums = sorted(set(nums) | {p for p in pair if os.path.isdir(folder(p))})
    for x in [y for y in nums if y > sh]:
        d = folder(x)
        meta_p = os.path.join(d, 'CARTRIDGE.json')
        if not os.path.exists(meta_p) or not (x == n or x in pair or passed(d)):
            continue                                   # only what has PASSED is on the live address, plus this one
        m = json.load(io.open(meta_p, encoding='utf-8'))
        src = os.path.join(d, m['file'])
        name = '%04d00000000-%s%s' % (x, m['id'], os.path.splitext(m['file'])[1])
        shutil.copyfile(src, os.path.join(top, 'cartridges', name))
        carts[m['id']] = {'id': m['id'], 'generation': '%04d00000000' % x, 'type': 'script', 'slot': m['slot'], 'replaces': m['replaces'],
                          'path': './cartridges/' + name, 'sha256': sha(src), 'release': 'k%04d' % x}
        if m['id'] not in order:
            order.append(m['id'])
    cur = {'schema': 'globalgrid.current.v1', 'generation': '%04d00000000' % n, 'previous_generation': None,
           'architecture': 'IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES', 'live_route': '/kuiper/', 'release_id': rid,
           'shell': {'release_id': rid, 'index': './releases/%s/index.html' % rid, 'base': './releases/%s/' % rid,
                     'sha256': sha(os.path.join(rel, 'index.html'))},
           'cartridge_order': order, 'cartridges': [carts[i] for i in order]}
    json.dump(cur, io.open(os.path.join(top, 'current.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    return sh, order


def main(argv):
    if not argv or not argv[0].isdigit():
        print(__doc__)
        return 2
    n = int(argv[0])
    out = tempfile.mkdtemp(prefix='kuiper-composed-')
    sh, order = build(n, out)
    print('%04d composed as published: shell %04d, parts %s' % (n, sh, ', '.join(order) or 'none'))
    results, good = {}, True
    for q, size in CHECKS:
        obj, text = why.run(out, q, size, page='kuiper/index.html', seconds=120)
        ok = bool(obj) and obj.get('PASS') is True
        good = good and ok
        bad = [k for k, v in (obj or {}).items() if v is False]
        results['%s at %s' % (q, size)] = 'PASS' if ok else ('FAIL: ' + (', '.join(bad)[:300] or str(text)[:200]))
        print('  %-4s %s at %s%s' % ('pass' if ok else 'FAIL', q, size, '' if ok else '   ' + results['%s at %s' % (q, size)][6:]))
    json.dump({'composed_as_published': good, 'shell': '%04d' % sh, 'parts': order, 'checks': results},
              io.open(os.path.join(folder(n), 'composed.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    if '--keep' in argv:
        print('the throwaway site is kept at ' + out)
    else:
        shutil.rmtree(out, ignore_errors=True)
    print('COMPOSED %s' % ('PASS' if good else 'FAIL'))
    return 0 if good else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
