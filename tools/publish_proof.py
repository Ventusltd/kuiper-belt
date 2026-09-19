#!/usr/bin/env python3
"""tools/publish_proof.py - publish one numbered proof to globalgrid2050.com, at most one per ten minutes unless the timer says otherwise.

    python tools/publish_proof.py <n> "<title>" "<one line for the homepage>" <proof.md> [<folder to publish from>]

With a fifth argument the pages and data are taken from that folder (a tested iteration on the E: drive)
instead of from this repository. The tools always come from this repository.

Copies the wafer page, its data and its tools into a stamped directory of the site worktree, adds
PROOF.md, links it from the homepage nest "Kuiper: proofs", commits and pushes to main.

SAFEGUARDS. Refuses if the last proof is younger than the ordered gap (ten minutes by default, never under five). Refuses if any name of a
repository known not to be public appears in what is about to be published. Refuses if the site
worktree is not at origin/main. Touches nothing on the homepage except its own nest.
"""
import io
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.join(HERE, '..')
SITE = os.path.join(KB, '..', '_wt-estate')
BASE = 'testcode/wafer-development-environment'
NEST = 'Kuiper: proofs'
sys.path.insert(0, HERE)
from check_proof import leaks          # digests, not names: the guard must not spell what it guards


def git(*a):
    return subprocess.run(['git'] + list(a), cwd=SITE, capture_output=True, text=True)


def main():
    n, title, small, md = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    SRC = sys.argv[5] if len(sys.argv) > 5 else KB
    now = datetime.now(timezone.utc)
    stamps = sorted(d[:12] for d in os.listdir(os.path.join(SITE, BASE)) if re.match(r'^\d{12}-proof', d)
                    or d.endswith('-one-wafer'))
    if stamps:
        last = datetime.strptime(stamps[-1], '%Y%m%d%H%M').replace(tzinfo=timezone.utc)
        # THE PACE IS ORDERED, NOT WRITTEN HERE. The timer passes its own gap down; on its own this
        # tool holds to ten minutes. It never goes below five, whoever asks: a guard that can be set
        # to nothing is not a guard.
        gap = max(300, int(os.environ.get('KUIPER_GAP_SECONDS', '600') or 600))
        if (now - last).total_seconds() < gap:
            print('REFUSED: the last proof is %d s old; one per %d minutes' % ((now - last).total_seconds(), gap // 60))
            return 2
    git('fetch', '-q', 'origin')
    if git('rev-list', '--count', 'HEAD..origin/main').stdout.strip() != '0':
        print('REFUSED: the site worktree is behind origin/main')
        return 2

    stamp = now.strftime('%Y%m%d%H%M')
    rel = '%s/%s-proof-%s' % (BASE, stamp, n)
    dst = os.path.join(SITE, rel)
    os.makedirs(os.path.join(dst, 'tools'))
    for f in sorted(os.listdir(SRC)):                                # every page of the version, not a fixed list
        if f.endswith('.html'):
            shutil.copy(os.path.join(SRC, f), dst)
    for extra in ('PALETTE.md', 'CHAINS.md', 'LAWS.md'):
        if os.path.exists(os.path.join(KB, extra)):
            shutil.copy(os.path.join(KB, extra), dst)
    shutil.copytree(os.path.join(SRC, 'cosmos'), os.path.join(dst, 'cosmos'),
                    ignore=shutil.ignore_patterns('commits', 'belt.tsv'))
    for t in ('key.py', 'wafer_keys.py', 'permanence.py'):
        shutil.copy(os.path.join(HERE, t), os.path.join(dst, 'tools'))
    shutil.copy(md, os.path.join(dst, 'PROOF.md'))

    for root, _, files in os.walk(dst):
        for f in files:
            if f.endswith('.py'):
                continue
            body = io.open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
            if leaks(body):
                shutil.rmtree(dst)
                print('REFUSED (L6): a name that is not public appears in %s' % f)
                return 2

    p = os.path.join(SITE, 'index.html')
    s = io.open(p, encoding='utf-8').read()
    link = ('<a class="current" href="https://globalgrid2050.com/%s/">%s-proof-%s<small>%s</small></a>'
            % (rel, stamp, n, small))
    s = s.replace('<summary>Proofs</summary>', '<summary>%s</summary>' % NEST)
    m = re.search(r'<summary>%s</summary><details class="area nest"><summary>[^<]*</summary>' % re.escape(NEST), s)
    if not m:
        shutil.rmtree(dst)
        print('REFUSED: the homepage nest was not found')
        return 2
    s = s[:m.end()] + link + s[m.end():]                     # newest first
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

    git('add', rel, 'index.html')
    msg = ('PROOF %s: %s\n\n%s\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'
           'Claude-Session: https://claude.ai/code/session_01DGQ1FNfMmzNDkgnh5DycbN'
           % (n, title, io.open(md, encoding='utf-8').read().strip()))
    git('commit', '-q', '-m', msg)
    r = git('push', 'origin', 'HEAD:main')
    print((r.stderr or r.stdout).strip().split('\n')[-1])
    print('https://globalgrid2050.com/%s/' % rel)
    return 0


if __name__ == '__main__':
    sys.exit(main())
