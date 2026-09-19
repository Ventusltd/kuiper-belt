#!/usr/bin/env python3
r"""tools/recheck.py - re-test an iteration that has already been published, at the real phone width,
WITHOUT touching anything it owns.

WHY THIS EXISTS. Headless Chrome on this machine refuses a window narrower than about 500 CSS pixels,
so every test written as 390 x 844 actually ran at 500 until iteration 0010. Five versions were
published on that wrong ruler. Re-running them matters, but re-running them with the ordinary tester
would rewrite their verdict, and the timer publishes on verdicts: a published version could be
republished by an act of checking. So this writes NOTHING into the iteration folder. It serves the
folder read only, loads each page inside a frame of the width named, and reports the page's own verdict.
The frame page is served FROM MEMORY. It used to be written into the folder and removed again a
moment later, and for that moment the folder held a page that is not part of the iteration: another
tool looked in exactly that moment twice in one evening and was wrong about the iteration both times.

    python tools/recheck.py 0002 0003 0004 0005 0006      the published ones
    python tools/recheck.py 0002 --width 390x844          a width of your choosing
    python tools/recheck.py --selftest                    the newest iteration must answer
"""
import io
import json
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

FRAME = """<!DOCTYPE html><meta charset="utf-8"><title>checking</title>
<body style="margin:0;background:#000">
<iframe id="f" src="__URL__" style="width:__W__px;height:__H__px;border:0;display:block"></iframe>
<script>
var f = document.getElementById('f');
function poll(n){
  try { var t = f.contentDocument && f.contentDocument.title;
    if (t && /PASS|FAIL/.test(t)) { document.title = t; return; } } catch (e) { document.title = 'BLOCKED'; return; }
  if (n > 0) setTimeout(function(){ poll(n - 1); }, 250); else document.title = 'NO VERDICT';
}
addEventListener('load', function(){ poll(40); });
</script>"""


class Serve(Quiet):
    """The iteration folder, read only, plus one page that exists only in this process."""
    frame = ''

    def do_GET(self):
        if self.path.split('?')[0] == '/_frame':
            body = self.frame.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return Quiet.do_GET(self)


def run(d, base, page, query, width, height, tmp):
    Serve.frame = FRAME.replace('__URL__', page + ('?' + query if query else '')) \
                       .replace('__W__', width).replace('__H__', height)
    out = subprocess.run([CHROME[0], '--headless=new', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
                          '--user-data-dir=' + os.path.join(ROOT, '_profile_recheck_%d' % os.getpid()),
                          '--window-size=1280,%d' % (int(height) + 40), '--virtual-time-budget=12000',
                          '--dump-dom', base + '_frame'],
                         capture_output=True, text=True, timeout=120, encoding='utf-8', errors='replace').stdout or ''
    m = re.search(r'<title>([^<]*)</title>', out)
    return m.group(1).strip() if m else 'NO TITLE'


def tests_of(d):
    """The page tests this iteration declared, as (page, query). Its own list, not one I invent."""
    p = os.path.join(d, 'selftests.txt')
    out = []
    for line in io.open(p, encoding='utf-8') if os.path.exists(p) else []:
        q = line.split()[0] if line.split() else ''
        if not q:
            continue
        page = 'index.html'
        if ':' in q and q.split(':')[0].endswith('.html'):
            page, q = q.split(':', 1)
        if (page, q) not in out:
            out.append((page, q))
    return out


def recheck(n, width='390', height='844'):
    d = folder(int(n))
    if not os.path.isdir(d):
        print('%s: no such iteration' % n)
        return None
    # the frame page is the ONLY thing written, it goes in a scratch copy of nothing, and it is removed
    tmp = None
    srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(Serve, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    results = {}
    before = sorted(os.listdir(d))
    try:
        for page, q in tests_of(d):
            results['%s?%s' % (page, q)] = run(d, base, page, q, width, height, tmp)
    finally:
        srv.shutdown()
    after = sorted(os.listdir(d))
    if before != after:
        print('REFUSED TO CONTINUE: this changed the iteration folder, which it must never do')
        return None
    bad = {k: v for k, v in results.items() if not v.endswith('PASS')}
    print('%s at %s x %s: %d of %d pass%s' % (os.path.basename(d), width, height,
                                              len(results) - len(bad), len(results),
                                              '' if not bad else '   FAILING: ' + ', '.join(sorted(bad))))
    for k, v in sorted(bad.items()):
        print('    %-44s %s' % (k, v))
    return results


def selftest():
    ns = sorted((x for x in os.listdir(ROOT) if re.match(r'^\d{4}$', x)), reverse=True)
    if not ns:
        print('SELFTEST FAIL: nothing to check')
        return 1
    r = recheck(ns[0])
    ok = bool(r) and all(v not in ('NO TITLE', 'NO VERDICT', 'BLOCKED') for v in r.values())
    print('SELFTEST %s' % ('PASS' if ok else 'FAIL'))
    return 0 if ok else 1


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--selftest':
        return selftest()
    width, height = '390', '844'
    if '--width' in argv:
        width, height = argv[argv.index('--width') + 1].lower().split('x')
    for a in argv:
        if a.isdigit():
            recheck(a, width, height)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
