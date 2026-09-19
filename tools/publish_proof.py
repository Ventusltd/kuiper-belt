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

AND TWO MORE SHAPES, WHICH END THE COPYING (Vikram, 19 Sept: "we shouldnt keep rebuilding the earlier versions but have
plugins"; GridAtlas's pattern as it stands, IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES). Each application has ONE address
that never changes, globalgrid2050.com/kuiper/ or /systems/, holding index.html (the composer), current.json (the
pointer), releases/, cartridges/ and state/.
  A folder carrying SHELL.json is published ONCE to <address>/releases/<generation>-<name>/; <address>/index.html
    becomes the composer and current.json names the shell and its sha256. A shell is never edited again: a second one
    is refused unless SHELL.json names the one it replaces.
  A folder carrying CARTRIDGE.json publishes THAT ONE FILE to <address>/cartridges/<generation>-<id>.ext, checks the
    hash before and after copying, and rewrites current.json in one step. A release is a change to the pointer.
  python tools/publish_proof.py --rollback <address>   puts the pointer back to what it was before the last release.
Neither shape touches the homepage, ever: the address does not change, so no link has to. A lane may write only its
own address (k: kuiper, s: systems).

SAFEGUARDS. Refuses if the last proof OF THE SAME LANE is younger than the ordered gap (ten minutes by default, never
under five): the lane is the letters that lead the proof's name (k0026, s0004), so one lane can never take or block
another's slot. Refuses if any name of a repository known not to be public appears in what is about to be published.
Refuses if the site worktree is not at origin/main. Touches nothing on the homepage except its own nest, or, for an
application, the folder name inside the links that already lead to that application, and it proves that to itself
before it writes: any other changed byte and nothing is published. ON ANY FAILURE, whatever the cause, it removes the
folder it made and puts the homepage back, so a failed publication never sits in the site pretending to be the last.
"""
import io
import json
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
# The permanent addresses, and which lane may write which. Vikram said yes to these two and to no others.
ADDRESSES = {'k': 'kuiper', 's': 'systems'}
SCHEMA, ARCH = 'globalgrid.current.v1', 'IMMUTABLE_SHELL_PLUS_HASHED_CARTRIDGES'
SLOTS = ('replace-script', 'import-map')
# AFTER A RELEASE THE PUBLISHED BYTES ARE FETCHED BACK AND COMPARED. A push is not a publication: the first shell
# was pushed at 00:01 on 20 Sept and its address was still 404 seven minutes later, because the site's deploy only
# fires for listed paths and the new addresses were not listed. The deploy file records the same fault three times
# over and gives the rule: compare published bytes, not status codes.
LIVE = 'https://globalgrid2050.com'
VERIFY_WAIT = 600                                   # seconds to wait out a deployment before saying it did not arrive
LOG = r'E:\kuiper-iterations\LOG.md'                # where a release that did not arrive is said, loudly, for every lane to read
COMPOSER = os.path.join(HERE, 'composer.html')     # the small page that sits at the permanent address and reads the pointer
sys.path.insert(0, HERE)
from check_proof import leaks          # digests, not names: the guard must not spell what it guards


def clock():
    return datetime.now(timezone.utc)


def sha256_of(path):
    import hashlib
    return hashlib.sha256(io.open(path, 'rb').read()).hexdigest()


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
    cur = os.path.join(SITE, ADDRESSES.get(lane, ''), 'current.json') if lane in ADDRESSES else None
    if cur and os.path.exists(cur):
        g = str(json.load(io.open(cur, encoding='utf-8')).get('generation') or '')
        if re.match(r'^\d{12}$', g):
            out.append(g)
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


class Undo:
    """Everything a pointer publication writes, so that ON ANY FAILURE it can all be taken back: files and folders it
    made are removed, files it changed are put back byte for byte, and only its own address is ever touched."""

    def __init__(self, address):
        self.address, self.made, self.was, self.committed = address, [], {}, False

    def keep(self, path):
        if path not in self.was:
            self.was[path] = io.open(path, 'rb').read() if os.path.exists(path) else None

    def write(self, path, data):
        self.keep(path)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp = path + '.new'
        io.open(tmp, 'wb').write(data)
        os.replace(tmp, path)                                        # in one step, or not at all

    def back(self):
        if self.committed:
            git('reset', '-q', '--soft', 'HEAD~1')
        git('restore', '--staged', '--', self.address)
        for p in reversed(self.made):
            shutil.rmtree(p, ignore_errors=True) if os.path.isdir(p) else (os.path.exists(p) and os.remove(p))
        for p, data in self.was.items():
            if data is None:
                os.path.exists(p) and os.remove(p)
            else:
                io.open(p, 'wb').write(data)


def read_pointer(address):
    p = os.path.join(SITE, address, 'current.json')
    return json.load(io.open(p, encoding='utf-8')) if os.path.exists(p) else None


def dump(cur):
    return (json.dumps(cur, indent=1) + '\n').encode('utf-8')


def no_leaks(top):
    for root, _, files in os.walk(top) if os.path.isdir(top) else [(os.path.dirname(top), [], [os.path.basename(top)])]:
        for f in files:
            if not f.endswith('.py') and leaks(io.open(os.path.join(root, f), encoding='utf-8', errors='replace').read()):
                raise RuntimeError('(L6) a name that is not public appears in %s' % f)


def commit_and_push(undo, n, title, md):
    git('add', '--', undo.address)
    msg = ('RELEASE %s: %s\n\n%s\n\nCo-Authored-By: Claude <noreply@anthropic.com>' % (n, title, io.open(md, encoding='utf-8').read().strip()))
    c = git('commit', '-q', '-m', msg)
    if c.returncode != 0:
        raise RuntimeError('the commit was refused: %s' % (c.stderr or c.stdout).strip().split('\n')[-1])
    undo.committed = True
    r = git('push', 'origin', 'HEAD:main')
    if r.returncode != 0:
        raise RuntimeError('the push was refused: %s' % (r.stderr or r.stdout).strip().split('\n')[-1])
    return (r.stderr or r.stdout).strip().split('\n')[-1]


def verify_live(address, rels, n):
    """Fetch back what was pushed and compare BYTES. Waits out the deployment. Says so loudly if it never arrives.
    It does not undo anything: the release is on main and correct; what is missing is its deployment, and hiding the
    release would hide the fault. Returns True when every file is being served exactly as pushed."""
    if not LIVE:
        return True
    import time
    import urllib.request
    top, t0, last = os.path.join(SITE, address), time.time(), {}
    while True:
        last = {}
        for rel in rels:
            want = io.open(os.path.join(top, rel.replace('/', os.sep)), 'rb').read()
            try:
                got = urllib.request.urlopen(urllib.request.Request('%s/%s/%s?t=%d' % (LIVE, address, rel, time.time()),
                                             headers={'Cache-Control': 'no-cache'}), timeout=20).read()
                last[rel] = 'as pushed' if got == want else 'DIFFERENT BYTES (%d served, %d pushed)' % (len(got), len(want))
            except Exception as e:
                last[rel] = 'not served (%s)' % (getattr(e, 'code', None) or type(e).__name__)
        if all(v == 'as pushed' for v in last.values()):
            print('verified live after %d s: %s' % (time.time() - t0, ', '.join(rels)))
            return True
        if time.time() - t0 > VERIFY_WAIT:
            break
        time.sleep(15)
    line = ('%s  RELEASED BUT NOT LIVE  %s was pushed to main and after %d s %s/%s/ is NOT serving it: %s. The release is '
            'correct and on main; its DEPLOYMENT did not happen. Check the paths list in .github/workflows/deploy-pages.yml '
            'and run the deploy.' % (datetime.now().strftime('%Y-%m-%d %H:%M'), n, time.time() - t0, LIVE, address,
                                     '; '.join('%s %s' % kv for kv in sorted(last.items()))))
    try:
        io.open(LOG, 'ab').write((line + '\n').encode('utf-8'))
    except OSError:
        pass
    print(line.strip())
    return False


def publish_pointer(n, title, md, SRC, lane, now):
    """A shell (once) or a cartridge (one file and the pointer). Never the homepage."""
    if lane not in ADDRESSES:
        print('REFUSED: lane %s has no permanent address; the addresses are %s' % (lane, ', '.join(sorted(ADDRESSES.values()))))
        return 2
    address, gen = ADDRESSES[lane], now.strftime('%Y%m%d%H%M')
    top = os.path.join(SITE, address)
    undo, home_before = Undo(address), io.open(os.path.join(SITE, 'index.html'), 'rb').read()
    try:
        cur = read_pointer(address)
        before = dump(cur) if cur else b'null\n'
        if os.path.exists(os.path.join(SRC, 'SHELL.json')):
            meta = json.load(io.open(os.path.join(SRC, 'SHELL.json'), encoding='utf-8'))
            name = str(meta.get('name') or '')
            if not re.match(r'^[a-z0-9-]{1,40}$', name):
                raise RuntimeError('SHELL.json needs a name of lower case letters, digits and hyphens')
            if cur and meta.get('replaces') != cur['shell']['release_id']:
                raise RuntimeError('%s already has a shell, %s, and a shell is never edited: a new one must name the one it replaces'
                                   % (address, cur['shell']['release_id']))
            rid = '%s-%s' % (gen, name)
            dst = os.path.join(top, 'releases', rid)
            if os.path.exists(dst):
                raise RuntimeError('%s is already there' % rid)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            undo.made.append(dst)
            copy_application(SRC, dst)
            os.remove(os.path.join(dst, 'SHELL.json'))
            shutil.copy(md, os.path.join(dst, 'PROOF.md'))
            no_leaks(dst)
            undo.write(os.path.join(top, 'index.html'), io.open(COMPOSER, 'rb').read())
            cur = {'schema': SCHEMA, 'generation': gen, 'previous_generation': (cur or {}).get('generation'),
                   'architecture': ARCH, 'live_route': '/%s/' % address, 'release_id': rid,
                   'shell': {'release_id': rid, 'index': './releases/%s/index.html' % rid, 'base': './releases/%s/' % rid,
                             'sha256': sha256_of(os.path.join(dst, 'index.html'))},
                   'cartridge_order': [], 'cartridges': [],
                   'last_known_green': {'generation': gen, 'release': n, 'proved': title}}
            what = 'shell %s' % rid
            fetch_back = ['current.json', 'index.html', 'releases/%s/index.html' % rid]
        else:
            meta = json.load(io.open(os.path.join(SRC, 'CARTRIDGE.json'), encoding='utf-8'))
            cid, slot, f = str(meta.get('id') or ''), meta.get('slot'), str(meta.get('file') or '')
            if not cur:
                raise RuntimeError('%s has no shell yet, and a cartridge is a part of a shell' % address)
            if not re.match(r'^[a-z0-9-]{1,40}$', cid) or slot not in SLOTS or not meta.get('replaces'):
                raise RuntimeError('CARTRIDGE.json needs an id, a slot (%s) and what it replaces' % ' or '.join(SLOTS))
            src = os.path.join(SRC, f)
            if os.path.basename(f) != f or not os.path.isfile(src):
                raise RuntimeError('CARTRIDGE.json names a file that is not in the folder: %r' % f)
            digest = sha256_of(src)
            if digest != meta.get('sha256'):
                raise RuntimeError('%s hashes to %s, and CARTRIDGE.json says %s: what was tested is not what is here'
                                   % (f, digest[:12], str(meta.get('sha256'))[:12]))
            rel = 'cartridges/%s-%s%s' % (gen, cid, os.path.splitext(f)[1])
            dst = os.path.join(top, rel.replace('/', os.sep))
            if os.path.exists(dst):
                raise RuntimeError('%s is already there, and a released cartridge is never overwritten' % rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            undo.made.append(dst)
            shutil.copyfile(src, dst)
            if sha256_of(dst) != digest:
                raise RuntimeError('the copy of %s does not hash to the original' % f)
            no_leaks(dst)
            entry = {'id': cid, 'generation': gen, 'type': meta.get('type') or 'script', 'slot': slot,
                     'replaces': meta['replaces'], 'path': './' + rel, 'sha256': digest, 'bytes': os.path.getsize(dst),
                     'release': n, 'job': meta.get('job')}
            cur['cartridges'] = [c for c in cur['cartridges'] if c['id'] != cid] + [entry]
            if cid not in cur['cartridge_order']:
                cur['cartridge_order'].append(cid)
            cur['previous_generation'], cur['generation'] = cur.get('generation'), gen
            cur['last_known_green'] = {'generation': gen, 'release': n, 'proved': title}
            undo.write(os.path.join(top, 'state', '%s-%s-PROOF.md' % (gen, cid)), io.open(md, 'rb').read())
            what = 'cartridge %s' % rel
            fetch_back = ['current.json', rel]
        # what the pointer was, kept so that a rollback is the pointer PUT BACK and not somebody's memory of it
        undo.write(os.path.join(top, 'state', '%s-before.json' % gen), before)
        undo.write(os.path.join(top, 'current.json'), dump(cur))
        if io.open(os.path.join(SITE, 'index.html'), 'rb').read() != home_before:
            raise RuntimeError('the homepage changed, and this shape never touches it')
        last = commit_and_push(undo, n, title, md)
    except Exception as e:
        undo.back()
        print('REFUSED: %s' % e)
        return 2
    print(last)
    verify_live(address, fetch_back, n)
    print('released %s; https://globalgrid2050.com/%s/' % (what, address))
    return 0


def rollback(address):
    """The pointer put back to what it was before the last release. Nothing is deleted: the cartridge that was released
    stays where it is, unpointed at, and the record of the rollback stays beside it."""
    if address not in ADDRESSES.values():
        print('REFUSED: no such address; the addresses are %s' % ', '.join(sorted(ADDRESSES.values())))
        return 2
    top = os.path.join(SITE, address)
    state = os.path.join(top, 'state')
    kept = sorted(f for f in (os.listdir(state) if os.path.isdir(state) else []) if f.endswith('-before.json'))
    if not kept:
        print('REFUSED: %s has nothing to go back to' % address)
        return 2
    was = io.open(os.path.join(state, kept[-1]), 'rb').read()
    if was.strip() == b'null':
        print('REFUSED: before that release %s had no shell at all; there is nothing to go back to' % address)
        return 2
    git('fetch', '-q', 'origin')
    if git('rev-list', '--count', 'HEAD..origin/main').stdout.strip() != '0':
        print('REFUSED: the site worktree is behind origin/main')
        return 2
    undo = Undo(address)
    md = os.path.join(state, kept[-1])
    try:
        json.loads(was.decode('utf-8'))                                  # it must still be a pointer
        undo.write(os.path.join(top, 'current.json'), was)
        used = os.path.join(state, kept[-1][:-len('-before.json')] + '-rolled-back.json')
        undo.write(used, was)
        undo.keep(md)
        os.remove(md)                                                # so the next rollback goes one release further back
        git('add', '--', address)
        c = git('commit', '-q', '-m', 'ROLLBACK %s: the pointer put back to what it was before %s' % (address, kept[-1][:12]))
        if c.returncode != 0:
            raise RuntimeError('the commit was refused')
        undo.committed = True
        r = git('push', 'origin', 'HEAD:main')
        if r.returncode != 0:
            raise RuntimeError('the push was refused: %s' % (r.stderr or r.stdout).strip().split('\n')[-1])
    except Exception as e:
        undo.back()
        print('REFUSED: %s' % e)
        return 2
    verify_live(address, ['current.json'], 'ROLLBACK %s' % address)
    print('rolled back %s to generation %s; https://globalgrid2050.com/%s/' % (address, json.loads(was).get('generation'), address))
    return 0


def main():
    if len(sys.argv) > 2 and sys.argv[1] == '--rollback':
        return rollback(sys.argv[2])
    n, title, small, md = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    SRC = sys.argv[5] if len(sys.argv) > 5 else KB
    lane = lane_of(n)
    now = clock()
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

    if os.path.exists(os.path.join(SRC, 'SHELL.json')) or os.path.exists(os.path.join(SRC, 'CARTRIDGE.json')):
        return publish_pointer(n, title, md, SRC, lane, now)

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
