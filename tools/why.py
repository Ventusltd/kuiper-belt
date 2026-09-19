#!/usr/bin/env python3
r"""tools/why.py - run one self test and say WHICH named check failed, at any width.

THE MANUAL STEP THIS REMOVES. tools/iterate.py scores a page PASS or FAIL from its title, which is
all a score needs and nothing a builder can work with. Every time a test failed the next twenty
minutes went the same way: hand build a server, hand build an iframe wrapper to reach a true phone
width, hand write a scrap of JavaScript to reach window.__selftest, read it, throw it away. Four
times in one evening. The page already records every check by name in window.__selftest; this
fetches that object and prints it, failures first.

HOW IT REACHES A VALUE INSIDE THE PAGE. --dump-dom returns markup, and the test object is not in
the markup. So the page is loaded in an iframe from the SAME origin, where the wrapper can read
its window, and the wrapper writes the object into its own body for --dump-dom to carry out. The
wrapper is served from memory: nothing is written into an iteration folder, ever.

AND IT IS THE HONEST WAY TO REACH 390 px. Headless Chrome will not open a window narrower than
about 500 CSS px, so every "390 x 844" run that is not inside an iframe is really a 500 px page.
The wrapper gives the page the width it is asked for and the browser the width it insists on.

    python tools/why.py 13 "selftest=card"                 at the width the browser gives
    python tools/why.py 13 "selftest=card" 390x844         at a true phone width
    python tools/why.py 13 "selftest=phone" 390x844
    python tools/why.py --selftest
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

WRAP = """<!DOCTYPE html><meta charset="utf-8"><title>why</title><body style="margin:0;background:#000">
<iframe id="f" src="__URL__" style="width:__W__px;height:__H__px;border:0;display:block"></iframe>
<pre id="out">waiting</pre>
<script>
var f = document.getElementById('f'), out = document.getElementById('out'), n = 0;
function poll(){
  n++;
  var w = null;
  try { w = f.contentWindow; } catch (e) { out.textContent = 'BLOCKED ' + e; return; }
  var t = null;
  try { t = w.__selftest; } catch (e) { out.textContent = 'BLOCKED ' + e; return; }
  if (t) { try { out.textContent = JSON.stringify(t, null, 1); } catch (e) { out.textContent = 'UNREADABLE ' + e; }
           document.title = 'why done'; return; }
  if (n > __N__) { var ti = ''; try { ti = w.document.title; } catch (e) {}
    out.textContent = 'THE PAGE NEVER SET window.__selftest. Its title was: ' + ti; document.title = 'why done'; return; }
  setTimeout(poll, 250);
}
addEventListener('load', poll);
</script>"""


class Serve(Quiet):
    """The iteration folder, plus one page held in memory that is never written to disk."""
    wrapper = ''

    def do_GET(self):
        if self.path.split('?')[0] == '/_why.html':
            body = self.wrapper.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return Quiet.do_GET(self)


def run(d, query, size, page='index.html', seconds=90):
    """Returns (the test object or None, whatever the wrapper had to say)."""
    w, h = (size.split('x') + ['844'])[:2]
    wrap = WRAP.replace('__URL__', '/' + page + ('?' + query if query else '')) \
               .replace('__W__', str(int(w))).replace('__H__', str(int(h)))                .replace('__N__', str(max(8, int(seconds * 4 * 0.7))))
    handler = type('S', (Serve,), {'wrapper': wrap})
    srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(handler, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/_why.html' % srv.server_address[1]
    # the window must be wide enough for the frame itself, or the browser's own floor crops it
    win = '%d,%d' % (max(int(w) + 40, 560), max(int(h) + 120, 900))
    try:
        out = subprocess.run([CHROME[0], '--headless=new', '--enable-unsafe-swiftshader',
                              '--user-data-dir=' + os.path.join(ROOT, '_profile_why_%d' % os.getpid()),
                              '--window-size=' + win, '--virtual-time-budget=%d' % (seconds * 1000),
                              '--dump-dom', url],
                             capture_output=True, text=True, timeout=seconds + 30,
                             encoding='utf-8', errors='replace').stdout or ''
    finally:
        srv.shutdown()
    m = re.search(r'(?s)<pre id="out">(.*?)</pre>', out)
    text = m.group(1) if m else ''
    text = (text.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&amp;', '&'))
    try:
        return json.loads(text), text
    except Exception:
        return None, text.strip()[:600] or 'the browser returned nothing at all'


def report(t):
    """Failures first, because that is the only part anybody reads."""
    bad = [k for k, v in t.items() if re.match(r'^T\d+_', k) and v is False]
    good = [k for k, v in t.items() if re.match(r'^T\d+_', k) and v is True]
    print('VERDICT %s   %d of %d named checks passed'
          % ('PASS' if t.get('PASS') else 'FAIL', len(good), len(good) + len(bad)))
    for k in bad:
        print('  FAIL  ' + k.replace('_', ' '))
    for k in good:
        print('  pass  ' + k.replace('_', ' '))
    for k, v in t.items():
        if not re.match(r'^(T\d+_|PASS$)', k):
            print('  %-46s %s' % (k, json.dumps(v)[:200]))
    return 0 if t.get('PASS') else 1


def selftest():
    """A page that sets no test object must be reported as such, not as a pass."""
    import tempfile
    d = tempfile.mkdtemp(prefix='why-')
    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n').write(
        '<!DOCTYPE html><meta charset="utf-8"><title>nothing</title><body>no test here</body>')
    t, text = run(d, '', '390x844', seconds=12)
    ok1 = t is None and 'NEVER SET window.__selftest' in text
    print('%s  a page with no self test is reported as having none' % ('pass' if ok1 else 'FAIL'))
    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n').write(
        '<!DOCTYPE html><meta charset="utf-8"><title>t</title><body><script>'
        'window.__selftest={T1_the_width_is_the_width_that_was_asked_for:innerWidth===390,'
        'width:innerWidth,PASS:innerWidth===390};</script>')
    t, text = run(d, '', '390x844', seconds=12)
    ok2 = bool(t) and t.get('width') == 390
    print('%s  the object is carried out of the page, and 390 really is 390: %s'
          % ('pass' if ok2 else 'FAIL', t if t else text))
    import shutil
    shutil.rmtree(d, ignore_errors=True)
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
    d = folder(int(argv[0]))
    query = argv[1] if len(argv) > 1 else 'selftest=phone'
    page = 'index.html'
    if ':' in query and not query.startswith('selftest='):
        page, query = query.split(':', 1)
    size = argv[2] if len(argv) > 2 else '1366x900'
    print('%s  %s  %s at %s' % (os.path.basename(d), page, query, size))
    t, text = run(d, query, size, page=page)
    if t is None:
        print('NO TEST OBJECT: ' + text)
        return 2
    return report(t)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
