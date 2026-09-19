#!/usr/bin/env python3
r"""tools/face.py - read a page the way a reader gets it, and say what it puts in front of them.

THE MANUAL STEP THIS REMOVES. Until now the only way to know what a page actually showed was to open
it, look, and hope to notice. Three faults reached review that way in one afternoon: a footer that
explained the placement law, a readout of keys per pixel written by the script after load, and a
note that told the story of the page instead of describing the product. This runs the page in a
headless browser, takes the text the reader ends up holding, and reports.

WHY THE RENDERED PAGE AND NOT THE SOURCE. The first version of this check read the HTML on disk and
passed a page that was showing address arithmetic to a cable engineer, because those lines are
written by the script after load and appear nowhere in the file. A check that reads the source is
checking a different document from the one the reader is holding.

THE RULE IT ENFORCES. A published page carries three things: what can be found out here, what to do
with it, and what it is not. No laws, no maths, no account of how it was built. A published NOTE.md
is a data sheet for the same reader, so it may not name a file, a tool or a path either.

    python tools/face.py NNNN            every page of an iteration, and its NOTE.md
    python tools/face.py NNNN --show     also print the whole visible text of each page
    python tools/face.py --selftest      a page with machinery planted in it must be caught
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

# Words a page may not put in front of a reader. Every one of them is true and every one of them is
# still written down in the repository; none of them answers a question a project developer has.
MACHINERY = ('golden angle', 'one law', 'sqrt', 'unresolved', 'computed from the law',
             'keys to a pixel', 'one wafer', 'running totals', 'the belt', '&radic;', '\u221a',
             # A COUNT OF LINES IN EVERY COMMIT IS NOT THE SIZE OF ANYTHING A READER CAN OPEN.
             # Billions read as the size of the code, and the code is not that size. And
             # "wherever in time they fall" is the address arithmetic wearing a coat.
             'billion lines', 'wherever in time', 'wherever they fall',
             # A READER HAS NO COMMAND LINE AND OWNS NONE OF THIS. An instruction to run a
             # program, and a count of lines in every commit there has ever been, are the two
             # ways this page has told a stranger to go away.
             'python ', 'key.py', 'ever issued')
# A published note is a data sheet. These are the marks of a note that is talking about the workshop.
NOTE_MACHINERY = ('.py', '.tsv', '.json', 'swarm', 'self test', 'selftest', 'index', 'tools/', 'e:\\', 'repository')
DISCLAIMER = 'without warranty'


def dom(base, page, query='', size='390,844'):
    """The page AFTER it has run: what a reader's browser actually ends up holding.

    ONE BROWSER PROFILE PER PROCESS. Two headless browsers sharing a profile directory do not queue,
    they interfere: the second returns nothing at all, which reads exactly like a page with no
    warranty line on it. The gate runs its own face check while, in another process, the checker is
    running its own self test, so the collision was guaranteed the moment both existed.
    """
    # AND ONE RETRY, BECAUSE AN EMPTY ANSWER IS NOT A VERDICT. Under the gate, several browsers run at
    # once and one occasionally comes back with nothing at all. Read as text, nothing contains no
    # warranty line, so the checker reported two clean pages as faulty. A check that cries wolf is a
    # check that gets ignored: ask twice, and if it is still empty say THAT, not something about the page.
    for _try in range(2):
        out = subprocess.run([CHROME[0], '--headless=new', '--enable-unsafe-swiftshader',
                              '--user-data-dir=' + os.path.join(ROOT, '_profile_face_%d' % os.getpid()),
                              '--window-size=' + size, '--virtual-time-budget=9000', '--dump-dom',
                              base + page + ('?' + query if query else '')],
                             capture_output=True, text=True, timeout=90, encoding='utf-8', errors='replace').stdout or ''
        if len(out) > 200:
            return out
    return out


def visible(page):
    """The words a reader sees: the markup with its script and style taken out.

    The code may say Math.sqrt as often as it likes. THE FACE may not.
    """
    s = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', page)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', s).lower()


def pages(d):
    return sorted(f for f in os.listdir(d) if f.endswith('.html'))


def serve(d):
    srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, 'http://127.0.0.1:%d/' % srv.server_address[1]


def check(d, base=None, show=False):
    """Returns {what was wrong: why}, empty when the faces are clean."""
    own = None
    if base is None:
        own, base = serve(d)
    bad = {}
    try:
        for f in pages(d):
            raw = dom(base, f)
            if len(raw) < 200:
                bad[f] = ['the browser returned nothing, so this page was not checked']
                continue
            v = visible(raw)
            seen = sorted(w for w in MACHINERY if w in v)
            if seen:
                bad[f] = seen
            if DISCLAIMER not in v:
                bad.setdefault(f, []).append('no warranty line on the rendered page')
            if show:
                print('\n--- %s, as a reader gets it ---\n%s' % (f, v[:1200]))
        note = os.path.join(d, 'NOTE.md')
        if os.path.exists(note):
            t = io.open(note, encoding='utf-8', errors='replace').read().lower()
            seen = sorted(w for w in NOTE_MACHINERY if w in t)
            if seen:
                bad['NOTE.md'] = seen
    finally:
        if own:
            own.shutdown()
    return bad


def selftest():
    """Plant each kind of fault in a page and require it to be caught. A checker nobody has tried to
    fool is a checker nobody knows the strength of."""
    import shutil
    import tempfile
    src = None
    for n in sorted((x for x in os.listdir(ROOT) if re.match(r'^\d{4}$', x)), reverse=True):
        if os.path.exists(os.path.join(ROOT, n, 'index.html')):
            src = os.path.join(ROOT, n)
            break
    if not src:
        print('SELFTEST FAIL: no iteration to test against')
        return 1
    d = tempfile.mkdtemp(prefix='face-')
    bad = 0
    try:
        for f in os.listdir(src):
            p = os.path.join(src, f)
            if os.path.isfile(p):
                shutil.copy(p, d)
            elif f == 'cosmos':
                shutil.copytree(p, os.path.join(d, f))
        clean = check(d)
        print('%s  the iteration as built: %s' % ('pass' if not clean else 'FAIL', clean or 'no machinery on any face'))
        if clean:
            bad += 1
        # planted in the markup
        p = os.path.join(d, 'index.html')
        s = io.open(p, encoding='utf-8').read()
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s.replace('<body>', '<body><p>one law at every zoom</p>', 1))
        got = check(d)
        print('%s  machinery written in the markup is caught: %s' % ('pass' if 'index.html' in got else 'FAIL', got.get('index.html')))
        if 'index.html' not in got:
            bad += 1
        # planted by the script, which is the one the old check could not see
        io.open(p, 'w', encoding='utf-8', newline='\n').write(
            s.replace('<body>', '<body><p id="planted"></p><script>addEventListener("load",function(){'
                                'document.getElementById("planted").textContent="up to 431 thousand keys to a pixel";});</script>', 1))
        got = check(d)
        ok = 'index.html' in got and 'keys to a pixel' in got['index.html']
        print('%s  machinery written by the script AFTER load is caught: %s' % ('pass' if ok else 'FAIL', got.get('index.html')))
        if not ok:
            bad += 1
        # THE WORDING A REVIEW FOUND ON THE FACE: a size nobody can open, and arithmetic in a coat.
        io.open(p, 'w', encoding='utf-8', newline='\n').write(
            s.replace('<body>', '<body><p>35.56 billion lines in 5,054 commits, wherever in time they fall</p>', 1))
        got = check(d)
        ok = 'index.html' in got and 'billion lines' in got['index.html']
        print('%s  a size nobody can open is caught: %s' % ('pass' if ok else 'FAIL', got.get('index.html')))
        if not ok:
            bad += 1
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
        # THE CARD A REVIEW FOUND BEHIND ALMOST EVERY TAP: arithmetic and a command to run.
        io.open(p, 'w', encoding='utf-8', newline='\n').write(
            s.replace('<body>', '<body><p>line 36,197,660,271 of 37,929,255,811 ever issued; the text itself: python tools/key.py 51517722470</p>', 1))
        got = check(d)
        ok = 'index.html' in got and 'key.py' in got['index.html']
        print('%s  an instruction to run a program is caught: %s' % ('pass' if ok else 'FAIL', got.get('index.html')))
        if not ok:
            bad += 1
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
        # a note that talks about the workshop
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
        io.open(os.path.join(d, 'NOTE.md'), 'w', encoding='utf-8', newline='\n').write(
            'Added tools/thing.py and a self test for it.\n')
        got = check(d)
        print('%s  a note that names a tool is caught: %s' % ('pass' if 'NOTE.md' in got else 'FAIL', got.get('NOTE.md')))
        if 'NOTE.md' not in got:
            bad += 1
    finally:
        shutil.rmtree(d, ignore_errors=True)
    print('SELFTEST %s' % ('PASS' if bad == 0 else 'FAIL'))
    return 1 if bad else 0


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--selftest':
        return selftest()
    if not argv[0].isdigit():
        print('REFUSED: give an iteration number or --selftest')
        return 2
    d = folder(int(argv[0]))
    bad = check(d, show='--show' in argv)
    if not bad:
        print('%s: every face carries only what a reader needs.' % os.path.basename(d))
        return 0
    for f, why in sorted(bad.items()):
        print('%-28s %s' % (f, ', '.join(why)))
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
