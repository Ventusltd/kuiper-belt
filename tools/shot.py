#!/usr/bin/env python3
r"""tools/shot.py - photograph every page of an iteration at the sizes a reader holds it at.

THE MANUAL STEP THIS REMOVES. Every layout fault that has reached a review was found by somebody
LOOKING: words off the right edge, a title block sitting on the drawing, a disclaimer cut in half.
The self tests measured what they were pointed at and passed. Nothing in the loop ever looked at the
picture, so the builder learned about it second hand, an hour after it was published.

This takes the picture. It uses the browser that is already here, writes PNGs to the E: drive, and
costs nothing but seconds. It does not judge: judging a picture is for eyes.

    python tools/shot.py NNNN                 every page, phone and desktop
    python tools/shot.py NNNN conductor.html  one page
    python tools/shot.py NNNN --q c=cu6c5     with a query, so a chosen conductor is photographed
    python tools/shot.py --selftest           a photograph is taken and is not blank
    python tools/shot.py --fresh NNNN         refuse any photograph older than the page it shows

The files land in E:\kuiper-iterations\SHOTS\NNNN\ as <page>-<width>.png, newest overwriting oldest,
because the only picture worth keeping is the one of what is there now.
"""
import io
import os
import re
import subprocess
import sys
import threading
from functools import partial
from http.server import ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from iterate import CHROME, Quiet, folder, ROOT

# AND ONE ON A SCREEN LIKE A VISITOR'S. Every photograph used to be taken at a pixel ratio of 1, and a
# real screen has 1.5 or 2: a fault that only exists at 2 (every dot drawn twice its size) went past
# all of them and was found by a reviewer driving a real browser. "@2" is that screen.
SIZES = (('phone', '390,844'), ('desktop', '1366,900'), ('screen2x', '834,792@2'))
SHOTS = os.path.join(ROOT, 'SHOTS')


def serve(d):
    srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, 'http://127.0.0.1:%d/' % srv.server_address[1]


FRAME = ('<!DOCTYPE html><meta charset="utf-8"><body style="margin:0;background:#000">'
         '<iframe src="__URL__" style="width:__W__px;height:__H__px;border:0;display:block"></iframe>')


def shoot(base, page, query, out, size, d=None):
    """A WINDOW WILL NOT GO AS NARROW AS A PHONE, SO THE PAGE GOES IN A FRAME THAT WILL. Asking this
    browser for a 390 wide window gives a 500 wide page and a 390 wide photograph of it: the right
    hand third is simply cropped off the image, which looks exactly like text running off the edge
    and is not. Inside a frame of 390 the page is really laid out at 390, and the photograph shows
    what a reader holds rather than a corner of something wider."""
    size, _, scale = size.partition('@')
    w, h = size.split(',')
    if d and int(w) < 500:
        fr = os.path.join(d, '_shot_frame.html')
        io.open(fr, 'w', encoding='utf-8', newline='\n').write(
            FRAME.replace('__URL__', page + ('?' + query if query else '')).replace('__W__', w).replace('__H__', h))
        try:
            return shoot(base, '_shot_frame.html', '', out, '%d,%d' % (max(int(w), 520), int(h) + 20))
        finally:
            os.remove(fr)
    subprocess.run([CHROME[0], '--headless=new', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
                    '--hide-scrollbars', '--force-device-scale-factor=%s' % (scale or '1'),
                    '--user-data-dir=' + os.path.join(ROOT, '_profile_shot_%d' % os.getpid()),
                    '--window-size=' + size, '--virtual-time-budget=9000',
                    '--screenshot=' + out, base + page + ('?' + query if query else '')],
                   capture_output=True, text=True, timeout=120)
    return os.path.exists(out) and os.path.getsize(out) > 2000


def take(n, only=None, query=''):
    d = folder(int(n))
    into = os.path.join(SHOTS, '%04d' % int(n))
    os.makedirs(into, exist_ok=True)
    srv, base = serve(d)
    made = []
    try:
        for f in sorted(x for x in os.listdir(d) if x.endswith('.html')):
            if only and f != only:
                continue
            for label, size in SIZES:
                tag = ('%s-%s-%s' % (f[:-5], query.replace('=', '-') or 'plain', label)).replace('/', '-')
                out = os.path.join(into, tag + '.png')
                if shoot(base, f, query, out, size, d):
                    made.append(out)
                    print('  %s' % out)
                else:
                    print('  FAILED to photograph %s at %s' % (f, label))
    finally:
        srv.shutdown()
    return made


# WHAT IS NOT EVIDENCE ABOUT A PAGE. verdict.json, swarm.json, REVIEW.md and the note are written
# after the pictures are taken, on purpose; everything else in the folder is the page itself.
AFTERWARDS = ('verdict.json', 'swarm.json', 'REVIEW.md', 'PULSE.md', 'PULSE-L2.md', 'PARENT.txt',
              'NOTE.md', 'PROOF.md', 'CARTRIDGE.json', 'SHELL.json', 'SUPERSEDED.txt', 'composed.json')   # papers about a release, not the page


def newest_edit(d):
    """When the page a reader would get was last changed."""
    t, what = 0, None
    for root, dirs, files in os.walk(d):
        for f in files:
            # AND NOTHING THAT BEGINS WITH AN UNDERSCORE. Tools leave scratch files in a folder while
            # they work; the folder changed, the page a reader gets did not, and on its first run at
            # the gate this condemned fourteen true photographs because of one of them.
            if f in AFTERWARDS or f.startswith('_'):
                continue
            p = os.path.join(root, f)
            m = os.path.getmtime(p)
            if m > t:
                t, what = m, os.path.relpath(p, d)
    return t, what


def fresh(n, d=None, out=None):
    """0 when every photograph is younger than the page it shows."""
    import datetime
    d = d or folder(n)
    out = out or os.path.join(SHOTS, os.path.basename(d))
    if not os.path.isdir(out):
        print('REFUSED: no photographs of %s at all' % os.path.basename(d))
        return 1
    pics = sorted(f for f in os.listdir(out) if f.endswith('.png'))
    if not pics:
        print('REFUSED: no photographs of %s at all' % os.path.basename(d))
        return 1
    edit, what = newest_edit(d)
    when = lambda t: datetime.datetime.fromtimestamp(t).strftime('%H:%M:%S')
    stale = [(f, os.path.getmtime(os.path.join(out, f))) for f in pics
             if os.path.getmtime(os.path.join(out, f)) < edit]
    if stale:
        print('REFUSED: %d of %d photographs were taken before %s was last changed at %s'
              % (len(stale), len(pics), what, when(edit)))
        for f, t in sorted(stale)[:12]:
            print('    %-52s taken %s' % (f, when(t)))
        print('  a photograph older than the page is not evidence about the page: take them again')
        return 1
    print('%s: all %d photographs were taken after the last edit (%s at %s)'
          % (os.path.basename(d), len(pics), what, when(edit)))
    return 0


def selftest():
    ns = sorted((x for x in os.listdir(ROOT) if x.isdigit() and len(x) == 4), reverse=True)
    for n in ns:
        if os.path.exists(os.path.join(ROOT, n, 'conductor.html')):
            made = take(int(n), only='conductor.html', query='c=cu6c5')
            ok = len(made) == len(SIZES)
            print('SELFTEST %s' % ('PASS' if ok else 'FAIL'))
            return 0 if ok else 1
    print('SELFTEST FAIL: nothing to photograph')
    return 1


def freshtest():
    """Touch the page and require the refusal, in a folder of its own. The first version of this
    proved itself against the newest real iteration and touched its page to do it, which is a check
    that damages the thing it is checking."""
    import shutil
    import tempfile
    import time
    base = tempfile.mkdtemp(prefix='fresh-')
    d, out = os.path.join(base, '0000'), os.path.join(base, 'SHOTS')
    os.makedirs(d)
    os.makedirs(out)
    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n').write('<!DOCTYPE html><title>a</title>')
    time.sleep(0.05)
    io.open(os.path.join(out, 'index-plain-phone.png'), 'wb').write(b'not really a photograph')
    ok1 = fresh(0, d, out) == 0
    print('%s  a photograph taken after the last edit is accepted' % ('pass' if ok1 else 'FAIL'))
    time.sleep(0.05)
    os.utime(os.path.join(d, 'index.html'), None)          # the page changes, the picture does not
    ok2 = fresh(0, d, out) == 1
    print('%s  a photograph older than the page is refused' % ('pass' if ok2 else 'FAIL'))
    io.open(os.path.join(d, '_scratch.html'), 'w', encoding='utf-8', newline='\n').write('x')
    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n').write('<!DOCTYPE html><title>a</title>')
    time.sleep(0.05)
    io.open(os.path.join(out, 'index-plain-phone.png'), 'wb').write(b'not really a photograph')
    os.utime(os.path.join(d, '_scratch.html'), None)       # a tool's scratch file, newer than everything
    ok3 = fresh(0, d, out) == 0
    print("%s  a tool's scratch file does not condemn a true photograph" % ('pass' if ok3 else 'FAIL'))
    shutil.rmtree(base, ignore_errors=True)
    print('SELFTEST %s' % ('PASS' if ok1 and ok2 and ok3 else 'FAIL'))
    return 0 if ok1 and ok2 and ok3 else 1


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--fresh':
        if len(argv) < 2 or not argv[1].isdigit():
            print('REFUSED: give an iteration number')
            return 2
        return fresh(int(argv[1]))
    if argv[0] == '--selftest':
        return selftest() or freshtest()
    if not argv[0].isdigit():
        print('REFUSED: give an iteration number or --selftest')
        return 2
    query = ''
    if '--q' in argv:
        query = argv[argv.index('--q') + 1]
    only = next((a for a in argv[1:] if a.endswith('.html')), None)
    made = take(int(argv[0]), only, query)
    print('%d photographs' % len(made))
    return 0 if made else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
