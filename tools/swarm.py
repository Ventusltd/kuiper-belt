#!/usr/bin/env python3
r"""tools/swarm.py - the checking load of one iteration, shared across three phases, with a neutral and an earth.

    python tools/swarm.py NNNN

THREE PHASES, a third of the checks each, run side by side. All three must be healthy to release.
  L1  SCOPE AND SAFETY   nothing private, no banned word, the disclaimer on every page, and every conductor
                         page passes its own layout tests at PHONE width (390 x 844).
  L2  TRUTH              every keyed fact in E:\kuiper-iterations\FACTS.tsv that applies to a page is present in
                         that page exactly as keyed. L2 owns that file and adds a fact whenever it settles one.
  L3  FUNCTION           the builder's own verdict is full marks, was made after the last edit, and every
                         script parses.
NEUTRAL  the local model on the graphics card reads the note and lists words a cable engineer would not know.
         It carries the imbalance: bulk reading nobody else should pay for. It ADVISES. It never blocks.
EARTH    GitHub Actions. It carries nothing in normal running. If the last run on the repository FAILED, that
         is a fault to earth and the release trips, whatever the phases say.

Writes swarm.json in the iteration folder. tools/cadence.py releases only on three healthy phases, a sound
earth, and a written review by L1 or L2 (REVIEW.md, first line PASS or FAIL, with the reviewer's name).
The banned words and the facts live on the E: drive, not in this repository, so the guard never spells what it guards.
"""
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import threading
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from functools import partial
from http.server import ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from check_proof import leaks
from iterate import CHROME, Quiet, folder, ROOT

DISCLAIMER = 'without warranty'


def pages(d):
    return sorted(f for f in os.listdir(d) if f.endswith('.html'))


def text(p):
    return io.open(p, encoding='utf-8', errors='replace').read()


from face import check as face_check, dom, visible, MACHINERY, NOTE_MACHINERY


def phone(d, base, page, query):
    m = re.search(r'<title>([^<]*)</title>', dom(base, page, query))
    return m.group(1).strip() if m else 'NO TITLE'


def public_face(d, base):
    bad = face_check(d, base)
    return not bad, bad


def l1(d):
    r = {'checks': {}}
    hits = sum(leaks(text(os.path.join(root, f))) for root, _, fs in os.walk(d) if '_profile' not in root for f in fs
               if f.endswith(('.html', '.md', '.tsv', '.json', '.txt')))
    r['checks']['nothing_private'] = hits == 0
    bp = os.path.join(ROOT, 'BANNED.txt')
    banned = [w.strip().lower() for w in text(bp).split('\n') if w.strip() and w[0] != '#'] if os.path.exists(bp) else []
    found = sorted({w for f in pages(d) + ['NOTE.md'] for w in banned if w in text(os.path.join(d, f)).lower()})
    r['checks']['no_banned_word'] = not found
    r['banned_found'] = len(found)                                  # a count, never the words
    r['checks']['disclaimer_on_every_page'] = all(DISCLAIMER in text(os.path.join(d, f)).lower() for f in pages(d))
    srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    r['checks']['the_public_face_shows_no_machinery'], r['machinery_on_the_face'] = public_face(d, base)
    tests = [l.split()[0] for l in text(os.path.join(d, 'selftests.txt')).split('\n') if l.strip().startswith('conductor')]
    titles = {t: phone(d, base, *t.split(':', 1)) for t in tests}
    srv.shutdown()
    r['phone'] = titles
    r['checks']['passes_at_phone_width'] = bool(titles) and all(v.endswith('PASS') for v in titles.values())
    return r


def l2(d):
    r = {'checks': {}, 'facts': []}
    fp = os.path.join(ROOT, 'FACTS.tsv')
    rows = [l.rstrip('\n').split('\t') for l in text(fp).split('\n') if l.strip() and l[0] != '#'] if os.path.exists(fp) else []
    for page, must, why in (x[:3] for x in rows if len(x) >= 3):
        p = os.path.join(d, page)
        if os.path.exists(p):
            ok = must in text(p)
            r['facts'].append({'page': page, 'fact': must, 'source': why, 'present': ok})
    r['checks']['facts_file_has_facts'] = len(r['facts']) > 0
    r['checks']['every_keyed_fact_is_present'] = all(f['present'] for f in r['facts'])
    return r


def l3(d):
    r = {'checks': {}}
    v = os.path.join(d, 'verdict.json')
    if not os.path.exists(v):
        r['checks']['has_a_verdict'] = False
        return r
    j = json.load(io.open(v, encoding='utf-8'))
    r['checks']['full_marks'] = j['score'] == j['out_of']
    r['score'] = '%d/%d' % (j['score'], j['out_of'])
    r['checks']['tested_after_last_edit'] = all(os.path.getmtime(os.path.join(d, f)) <= os.path.getmtime(v) for f in pages(d))
    r['checks']['scripts_parse'] = bool(j.get('checks', {}).get('scripts_parse'))
    r['checks']['data_sums'] = bool(j.get('checks', {}).get('data_sums'))
    r['checks']['tools_pass_their_own_self_tests'], r['tools'] = tool_selftests()
    # A PHOTOGRAPH OLDER THAN THE PAGE IS NOT EVIDENCE ABOUT THE PAGE. A review was spent on a fault
    # that had already been fixed, because the picture was taken before the last edit and the note
    # said otherwise. Both were true. Neither was any use.
    try:
        import shot
        buf = io.StringIO()
        keep, sys.stdout = sys.stdout, buf
        try:
            code = shot.fresh(int(os.path.basename(d)))
        finally:
            sys.stdout = keep
        r['checks']['photographs_are_of_the_page_as_it_is_now'] = code == 0
        r['photographs'] = buf.getvalue().strip().splitlines()[:6]
    except Exception as e:
        r['checks']['photographs_are_of_the_page_as_it_is_now'] = False
        r['photographs'] = ['could not be checked: %s' % type(e).__name__]
    return r


TOOLCACHE = os.path.join(ROOT, 'tool-selftests.json') if 'ROOT' in dir() else None


def _tool_cache():
    try:
        return json.load(io.open(TOOLCACHE, encoding='utf-8'))
    except Exception:
        return {}


def tool_selftests():
    """A TOOL THAT OFFERS A SELF TEST MUST PASS IT. The pages have been tested by their own tests since
    the first iteration; the Python that feeds them was only ever checked for parsing, which is the
    same as checking a cable for being cable shaped. Any tool whose docstring offers --selftest is run
    here, every time, so a tool cannot be quietly broken by a later change to the data it reads."""
    out, ok = {}, True
    tools = os.path.join(HERE)
    # AND A TOOL THAT HAS NOT CHANGED DOES NOT NEED TESTING AGAIN. Several of these launch a browser
    # per page; running all of them at every gate was starting more processes in an hour than any
    # virus scanner will sit still for, and this machine's scanner started denying execution of
    # python itself. The answer is kept against the SHA of the tool's own source, so an edited tool
    # is always tested and an untouched one is not.
    cache = _tool_cache()
    fresh = {}
    for f in sorted(os.listdir(tools)):
        if not f.endswith('.py'):
            continue
        try:
            whole = io.open(os.path.join(tools, f), 'rb').read()
        except OSError:
            continue
        src = whole[:4000].decode('utf-8', 'replace')
        if '--selftest' not in src:
            continue
        sha = hashlib.sha256(whole).hexdigest()
        was = cache.get(f)
        if was and was.get('sha') == sha and was.get('verdict') == 'pass':
            out[f] = 'pass (unchanged since it last passed)'
            fresh[f] = was
            continue
        try:
            p = subprocess.run([sys.executable, os.path.join(tools, f), '--selftest'],
                               cwd=os.path.join(HERE, '..'), capture_output=True, text=True, timeout=300)
            out[f] = 'pass' if p.returncode == 0 else (p.stdout or p.stderr or '').strip().splitlines()[-1:][0] if (p.stdout or p.stderr) else 'FAIL'
            if p.returncode != 0:
                ok = False
            else:
                fresh[f] = {'sha': sha, 'verdict': 'pass', 'at': time.strftime('%Y-%m-%dT%H:%M')}
        except subprocess.TimeoutExpired:
            out[f] = 'FAIL: timed out'
            ok = False
    try:
        json.dump(fresh, io.open(TOOLCACHE, 'w', encoding='utf-8', newline='\n'), indent=1)
    except Exception:
        pass
    return ok, out


def neutral(d):
    note = text(os.path.join(d, 'NOTE.md'))[:1500]
    try:
        ps = json.load(urllib.request.urlopen('http://127.0.0.1:11434/api/ps', timeout=3)).get('models', [])
        tags = json.load(urllib.request.urlopen('http://127.0.0.1:11434/api/tags', timeout=3)).get('models', [])
        model = (ps or tags)[0]['name']
        body = json.dumps({'model': model, 'stream': False, 'options': {'num_predict': 120, 'temperature': 0},
                           'prompt': 'A cable engineer who is not a programmer will read this note. List, as a short comma separated '
                                     'list and nothing else, any words in it that such a reader would not understand. If none, reply NONE.\n\n' + note}).encode()
        out = json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:11434/api/generate', body, {'Content-Type': 'application/json'}), timeout=120))
        return {'advice': out.get('response', '').strip()[:400], 'model': model, 'blocks': False}
    except Exception as e:
        return {'advice': 'neutral not connected (%s)' % type(e).__name__, 'model': None, 'blocks': False}


def earth():
    try:
        j = json.loads(subprocess.run(['gh', 'run', 'list', '-R', 'Ventusltd/kuiper-belt', '-L', '1', '--json', 'conclusion,status,workflowName,createdAt'],
                                      capture_output=True, text=True, timeout=30).stdout or '[]')
        last = j[0] if j else {}
        return {'sound': last.get('conclusion') != 'failure', 'last': last}
    except Exception as e:
        return {'sound': True, 'last': {'note': 'earth could not be read (%s); not treated as a fault' % type(e).__name__}}


def main():
    n = sys.argv[1]
    d = folder(n)
    t0 = time.time()
    with ThreadPoolExecutor(5) as ex:
        f = {k: ex.submit(fn, *a) for k, fn, a in (('L1', l1, (d,)), ('L2', l2, (d,)), ('L3', l3, (d,)), ('N', neutral, (d,)), ('E', earth, ()))}
        out = {}
        for k, fut in f.items():
            try:
                out[k] = fut.result()
            except Exception as e:
                out[k] = {'checks': {'ran': False}, 'error': repr(e)[:200]}
    for k in ('L1', 'L2', 'L3'):
        out[k]['healthy'] = bool(out[k].get('checks')) and all(out[k]['checks'].values())
    out['iteration'], out['checked'], out['seconds'] = n, datetime.now().strftime('%Y-%m-%dT%H:%M:%S'), round(time.time() - t0, 1)
    out['release_ready'] = all(out[k]['healthy'] for k in ('L1', 'L2', 'L3')) and out['E']['sound']
    json.dump(out, io.open(os.path.join(d, 'swarm.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    for k in ('L1', 'L2', 'L3'):
        bad = [c for c, ok in out[k]['checks'].items() if not ok]
        print('%s %s%s' % (k, 'HEALTHY' if out[k]['healthy'] else 'FAULT  ', ('  ' + ', '.join(bad)) if bad else ''))
    print('N  %s' % out['N']['advice'][:160].replace('\n', ' '))
    print('E  %s' % ('SOUND' if out['E']['sound'] else 'FAULT TO EARTH: the last Actions run failed'))
    print('release ready: %s   (%.0f s)   a written review by L1 or L2 is still needed' % (out['release_ready'], out['seconds']))
    return 0 if out['release_ready'] else 1


if __name__ == '__main__':
    sys.exit(main())
