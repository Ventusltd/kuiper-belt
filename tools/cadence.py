#!/usr/bin/env python3
r"""tools/cadence.py - publish the next tested iteration every twenty minutes, with no assistant in the loop.

    python tools/cadence.py --until 2026-09-20T16:30        run until that local time
    python tools/cadence.py --once                          one look, then stop
    python tools/cadence.py --gap 10                        minutes between publications (default 20)
    python tools/cadence.py --root E:\systems-iterations    a second lane, with its own record and timer
    python tools/cadence.py --prefix s                      the published folder is s0014 rather than k0014

THE PACE AND THE DRIVE ARE NOT FACTS ABOUT THIS SCRIPT. Twenty minutes and one drive were written
into it, so a second lane could not have a timer of its own and the pace could not be changed
without editing a script that was already running. Each lane keeps its own published record, its own
held list and its own log, in its own root, so two timers can never overwrite one another's history.

Publishing must not cost an assistant a step. Assistants build iterations in E:\kuiper-iterations and
test them with tools/iterate.py. This script, plain Python on the desktop machine, looks once a minute.
When twenty minutes have passed since the last publication it takes the OLDEST iteration that

    has a verdict with full marks (every self test PASS, data sums, no private digest, scripts parse),
    was tested AFTER its pages were last edited (so a half edited folder is never published),
    and has not been published before,

and hands it to tools/publish_proof.py, which has its own twenty minute rule and its own privacy
guard. IF NOTHING QUALIFIES IT PUBLISHES NOTHING. An empty slot is a true record; a padded one is not.
Every decision is written to E:\kuiper-iterations\LOG.md, once per change, not once per minute.
"""
import io
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = r'E:\kuiper-iterations'
PREFIX = 'k'
SITE = os.path.join(HERE, '..', '..', '_wt-estate')
STATE = os.path.join(ROOT, 'published.json')
LOG = os.path.join(ROOT, 'LOG.md')
GAP = 1200
_last_said = [None]
HELD = {}                                                       # iteration -> why it is being held, shown on the HUD


def say(msg):
    if msg != _last_said[0]:
        _last_said[0] = msg
        line = '%s  %s\n' % (datetime.now().strftime('%Y-%m-%d %H:%M'), msg)
        io.open(LOG, 'a', encoding='utf-8', newline='\n').write(line)
        print(line, end='', flush=True)


def state():
    return json.load(io.open(STATE, encoding='utf-8')) if os.path.exists(STATE) else {'published': {}, 'last': 0}


def candidate(done):
    for d in sorted(x for x in os.listdir(ROOT) if re.match(r'^\d{4}$', x)):
        if d in done or d == '0001':                                # 0001 is the baseline, already public
            continue
        f = os.path.join(ROOT, d)
        if os.path.exists(os.path.join(f, 'SUPERSEDED.txt')):       # a later iteration carries this one's work: not waiting, not a fault
            HELD.pop(d, None)
            continue
        v = os.path.join(f, 'verdict.json')
        if not os.path.exists(v):
            continue
        verdict = json.load(io.open(v, encoding='utf-8'))
        if verdict['score'] != verdict['out_of']:
            continue
        pages = [os.path.join(f, p) for p in os.listdir(f) if p.endswith('.html')]
        if any(os.path.getmtime(p) > os.path.getmtime(v) for p in pages):
            continue                                                # edited after it was tested: test it again first
        newest = max(os.path.getmtime(p) for p in pages)
        # THE RELEASE GATE. Three healthy phases and a sound earth (tools/swarm.py), then a written review by L1 or L2.
        sw = os.path.join(f, 'swarm.json')
        if not os.path.exists(sw) or os.path.getmtime(sw) < newest:
            subprocess.run([sys.executable, os.path.join(HERE, 'swarm.py'), d], capture_output=True, text=True, timeout=600)
        if not os.path.exists(sw):
            HELD[d] = 'the swarm could not run'
            continue
        swarm = json.load(io.open(sw, encoding='utf-8'))
        if not swarm.get('release_ready'):
            bad = [k for k in ('L1', 'L2', 'L3') if not swarm.get(k, {}).get('healthy')] + ([] if swarm.get('E', {}).get('sound', True) else ['EARTH'])
            HELD[d] = 'fault on ' + ' '.join(bad)
            continue
        rv = os.path.join(f, 'REVIEW.md')
        first = io.open(rv, encoding='utf-8').read().strip().split('\n')[0].upper() if os.path.exists(rv) else ''
        if not os.path.exists(rv) or os.path.getmtime(rv) < newest:
            HELD[d] = 'waiting for a written review by L1 or L2'
            continue
        if not first.startswith('PASS'):
            HELD[d] = 'review says: ' + first[:80]
            continue
        HELD.pop(d, None)
        return d, verdict
    return None, None


def look():
    st = state()
    wait = GAP - (time.time() - st['last'])
    d, verdict = candidate(st['published'])                         # looked at every minute, so the swarm runs and the HUD knows why a thing is held
    if wait > 0:
        json.dump(HELD, io.open(os.path.join(ROOT, 'held.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
        return
    json.dump(HELD, io.open(os.path.join(ROOT, 'held.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    if not d:
        say('slot open, nothing released: ' + ('; '.join('%s %s' % kv for kv in sorted(HELD.items())) or 'nothing tested and waiting'))
        return
    f = os.path.join(ROOT, d)
    note = io.open(os.path.join(f, 'NOTE.md'), encoding='utf-8').read().strip()
    first = note.split('\n')[0][:110]
    proof = os.path.join(f, 'PROOF.md')
    tests = '\n'.join('- `%s`: %s' % (k, t['title']) for k, t in verdict['selftests'].items())
    io.open(proof, 'w', encoding='utf-8', newline='\n').write(
        '# Iteration %s\n\n%s\n\n## Tested unattended before publishing\n\nScore %d of %d, %s.\n\n%s\n\n'
        'Built and tested locally, published by a Python timer with no assistant in the loop.\n'
        'Provided as is, without warranty of any kind; a chart, not a design.\n'
        % (d, note, verdict['score'], verdict['out_of'], verdict['tested'], tests))
    subprocess.run(['git', 'fetch', '-q', 'origin'], cwd=SITE)
    subprocess.run(['git', 'merge', '-q', '--ff-only', 'origin/main'], cwd=SITE, capture_output=True)
    r = subprocess.run([sys.executable, os.path.join(HERE, 'publish_proof.py'), PREFIX + d, first, first, proof, f],
                       env=dict(os.environ, KUIPER_GAP_SECONDS=str(GAP)),     # one pace, set in one place
                       capture_output=True, text=True)
    out = (r.stdout + r.stderr).strip().split('\n')
    if r.returncode == 0:
        st['published'][d] = {'at': datetime.now().strftime('%Y-%m-%dT%H:%M'), 'url': out[-1]}
        st['last'] = time.time()
        json.dump(st, io.open(STATE, 'w', encoding='utf-8', newline='\n'), indent=1)
        say('PUBLISHED %s  %s' % (d, out[-1]))
    else:
        say('NOT published %s: %s' % (d, out[-1][:160]))


def main():
    global ROOT, STATE, LOG, GAP, PREFIX
    a = sys.argv[1:]
    if '--root' in a:
        ROOT = os.path.abspath(a[a.index('--root') + 1])
        STATE = os.path.join(ROOT, 'published.json')
        LOG = os.path.join(ROOT, 'LOG.md')
    if '--gap' in a:
        # minutes, because that is the unit the person setting the pace is thinking in
        GAP = max(1, int(float(a[a.index('--gap') + 1]) * 60))
    if '--prefix' in a:
        PREFIX = a[a.index('--prefix') + 1]
        if not re.match(r'^[a-z0-9-]{1,8}$', PREFIX):
            print('REFUSED: a prefix is one to eight lower case letters, digits or hyphens')
            return 2
    os.makedirs(ROOT, exist_ok=True)
    if '--once' in a:
        look()
        return 0
    until = datetime.fromisoformat(a[a.index('--until') + 1]) if '--until' in a else None
    say('cadence started in %s, one publication per %d minutes at most, published as %s0000%s'
        % (ROOT, GAP // 60, PREFIX, ', until ' + until.isoformat() if until else ''))
    while not until or datetime.now() < until:
        try:
            look()
        except Exception as e:
            say('cadence error, carrying on: %r' % (e,))
        time.sleep(60)
    say('cadence stopped at its set time')
    return 0


if __name__ == '__main__':
    sys.exit(main())
