#!/usr/bin/env python3
"""tools/publish_proof.py - publish one numbered proof to globalgrid2050.com, at most one per ten minutes unless the timer says otherwise.

    python tools/publish_proof.py <n> "<title>" "<one line for the homepage>" <proof.md> [<folder to publish from>]

With a fifth argument the pages and data are taken from that folder (a tested iteration on the E: drive)
instead of from this repository. The tools always come from this repository.

Copies the wafer page, its data and its tools into a stamped directory of the site worktree, adds
PROOF.md, links it from the homepage nest "Kuiper: proofs", commits and pushes to main.

TWO SHAPES OF FOLDER, ONE PUBLISHER. A Kuiper iteration is pages beside a cosmos folder; it is published exactly as
it always was. A folder WITHOUT a cosmos folder is an application in its own right (the systems lane's Real Systems):
every file a reader's browser would ask for is copied, the papers the release gate reads are left behind, and instead
of a new line in the Kuiper nest the homepage links that already lead to that application are moved on to the new
folder. Until this was written a folder of the second shape was published as its index.html and nothing else, a page
that could not run, and then failed on the missing cosmos folder and left its half made folder on the site.

SAFEGUARDS. Refuses if the last proof OF THE SAME LANE is younger than the ordered gap (ten minutes by default, never
under five): the lane is the letters that lead the proof's name (k0026, s0004), so one lane can never take or block
another's slot. Refuses if any name of a repository known not to be public appears in what is about to be published.
Refuses if the site worktree is not at origin/main. Touches nothing on the homepage except its own nest, or, for an
application, the folder name inside the links that already lead to that application, and it proves that to itself
before it writes: any other changed byte and nothing is published. ON ANY FAILURE, whatever the cause, it removes the
folder it made and puts the homepage back, so a failed publication never sits in the site pretending to be the last.
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
# The site worktree. KUIPER_SITE points the publisher at a throwaway copy, which is how its own test publishes for
# real, commit and push included, without going anywhere near the public site.
SITE = os.environ.get('KUIPER_SITE') or os.path.join(KB, '..', '_wt-estate')
BASE = 'testcode/wafer-development-environment'
NEST = 'Kuiper: proofs'
# The papers the release gate reads. They live in an iteration folder and are never part of what a reader is served.
PAPERS = ('NOTE.md', 'REVIEW.md', 'verdict.json', 'swarm.json', 'SUPERSEDED.txt', 'PROOF.md', 'PARENT.txt', 'selftests.txt')
# What a browser asks a Kuiper folder for, beside its pages: a module the page imports is part of the page.
BESIDE_THE_PAGES = ('.mjs', '.js', '.css')
# The application the systems lane publishes, and how a homepage link to it is recognised: the folder it was first
# published in, or any folder this publisher has moved it to since. ONLY the folder name inside such a link may change.
SYSTEMS_FIRST = '202609180245-real-systems'
SYSTEMS_LINK = re.compile(r'(href="[^"]*?' + re.escape(BASE) + r'/)(' + re.escape(SYSTEMS_FIRST) + r'|\d{12}-proof-s\d+)(/[^"]*")')
sys.path.insert(0, HERE)
from check_proof import leaks          # digests, not names: the guard must not spell what it guards


def git(*a):
    return subprocess.run(['git'] + list(a), cwd=SITE, capture_output=True, text=True)


def lane_of(n):
    """k0026 -> k, s0004 -> s, 7 -> k. The letters that lead the name; the oldest proofs had none and were the Kuiper's."""
    m = re.match(r'^([a-z-]+)', str(n))
    return m.group(1) if m else 'k'


def stamps_of(lane):
    """The stamps of THIS lane's proofs. A folder with no lane letter, or one of the first one-wafer folders, is the Kuiper's."""
    out = []
    for d in os.listdir(os.path.join(SITE, BASE)):
        m = re.match(r'^(\d{12})-proof-([a-z-]*)', d)
        if m and (m.group(2) or 'k') == lane:
            out.append(m.group(1))
        elif lane == 'k' and d.endswith('-one-wafer') and re.match(r'^\d{12}', d):
            out.append(d[:12])
    return sorted(out)


def copy_kuiper(SRC, dst):
    """A Kuiper iteration, exactly as it has always been published, plus any module its pages import."""
    os.makedirs(os.path.join(dst, 'tools'))
    for f in sorted(os.listdir(SRC)):                                # every page of the version, not a fixed list
        if f.endswith('.html') or (f.endswith(BESIDE_THE_PAGES) and f not in PAPERS):
            shutil.copy(os.path.join(SRC, f), dst)
    for extra in ('PALETTE.md', 'CHAINS.md', 'LAWS.md'):
        if os.path.exists(os.path.join(KB, extra)):
            shutil.copy(os.path.join(KB, extra), dst)
    shutil.copytree(os.path.join(SRC, 'cosmos'), os.path.join(dst, 'cosmos'),
                    ignore=shutil.ignore_patterns('commits', 'belt.tsv'))
    for t in ('key.py', 'wafer_keys.py', 'permanence.py'):
        shutil.copy(os.path.join(HERE, t), os.path.join(dst, 'tools'))


def copy_application(SRC, dst):
    """An application: everything in the folder except the gate's papers, and no folder whose name begins with _ or a dot."""
    os.makedirs(dst)
    for f in sorted(os.listdir(SRC)):
        p = os.path.join(SRC, f)
        if os.path.isfile(p) and f not in PAPERS and not f.startswith('.'):
            shutil.copy(p, dst)
        elif os.path.isdir(p) and not f.startswith(('_', '.')):
            shutil.copytree(p, os.path.join(dst, f))
    if not os.path.exists(os.path.join(dst, 'index.html')):
        raise RuntimeError('the folder has no index.html, so there is nothing for a reader to open')


def move_the_links(s, folder):
    """The homepage, with every link to the application moved on to FOLDER, and nothing else touched. Proved, not
    assumed: with the folder names blanked out, the page before and the page after must be the same page."""
    moved, count = SYSTEMS_LINK.subn(lambda m: m.group(1) + folder + m.group(3), s)
    if not count:
        raise RuntimeError('no homepage link leads to the application, so a reader could never reach what was published')
    blank = lambda t: SYSTEMS_LINK.sub(lambda m: m.group(1) + '*' + m.group(3), t)
    if blank(moved) != blank(s):
        raise RuntimeError('moving the links changed something besides a folder name; the homepage is left alone')
    return moved, count


def main():
    n, title, small, md = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    SRC = sys.argv[5] if len(sys.argv) > 5 else KB
    lane = lane_of(n)
    now = datetime.now(timezone.utc)
    stamps = stamps_of(lane)
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
    folder = '%s-proof-%s' % (stamp, n)
    rel = '%s/%s' % (BASE, folder)
    dst = os.path.join(SITE, rel)
    if os.path.exists(dst):
        print('REFUSED: %s is already there' % rel)
        return 2
    p = os.path.join(SITE, 'index.html')
    home = io.open(p, encoding='utf-8').read()
    home_bytes = io.open(p, 'rb').read()                          # put back byte for byte, line endings and all
    committed = False
    try:
        application = not os.path.isdir(os.path.join(SRC, 'cosmos'))
        (copy_application if application else copy_kuiper)(SRC, dst)
        shutil.copy(md, os.path.join(dst, 'PROOF.md'))

        for root, _, files in os.walk(dst):
            for f in files:
                if f.endswith('.py'):
                    continue
                body = io.open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
                if leaks(body):
                    raise RuntimeError('(L6) a name that is not public appears in %s' % f)

        if application:
            s, count = move_the_links(home, folder)
        else:
            link = ('<a class="current" href="https://globalgrid2050.com/%s/">%s-proof-%s<small>%s</small></a>'
                    % (rel, stamp, n, small))
            s = home.replace('<summary>Proofs</summary>', '<summary>%s</summary>' % NEST)
            m = re.search(r'<summary>%s</summary><details class="area nest"><summary>[^<]*</summary>' % re.escape(NEST), s)
            if not m:
                raise RuntimeError('the homepage nest was not found')
            s = s[:m.end()] + link + s[m.end():]                     # newest first
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

        git('add', rel, 'index.html')
        msg = ('PROOF %s: %s\n\n%s\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'
               'Claude-Session: https://claude.ai/code/session_01DGQ1FNfMmzNDkgnh5DycbN'
               % (n, title, io.open(md, encoding='utf-8').read().strip()))
        c = git('commit', '-q', '-m', msg)
        if c.returncode != 0:
            raise RuntimeError('the commit was refused: %s' % (c.stderr or c.stdout).strip().split('\n')[-1])
        committed = True
        r = git('push', 'origin', 'HEAD:main')
        if r.returncode != 0:
            raise RuntimeError('the push was refused: %s' % (r.stderr or r.stdout).strip().split('\n')[-1])
    except Exception as e:
        # ON ANY FAILURE THE SITE IS PUT BACK AS IT WAS. Only this publication's own two paths are touched: the
        # worktree is shared, and somebody else's uncommitted work in it is not ours to throw away.
        if committed:
            git('reset', '-q', '--soft', 'HEAD~1')
        git('restore', '--staged', '--', rel, 'index.html')
        shutil.rmtree(dst, ignore_errors=True)
        io.open(p, 'wb').write(home_bytes)
        print('REFUSED: %s' % e)
        return 2
    print((r.stderr or r.stdout).strip().split('\n')[-1])
    print('https://globalgrid2050.com/%s/' % rel)
    return 0


if __name__ == '__main__':
    sys.exit(main())
