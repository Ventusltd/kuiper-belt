#!/usr/bin/env python3
r"""tools/pages.py - for every piece of work, the nearest page a visitor can be put into.

THE IDEA. These sites are served straight from their repositories, so A FILE'S PLACE IN ITS FOLDER
IS ALREADY AN ADDRESS. Nothing has to be guessed and nothing is matched by name: walk up the folders
from the work to the first page that still stands today.

THE LADDER, in this order, every step proved from files:
  1  the work IS a page (an .html file that still stands)      -> that exact page
  2  otherwise walk UP its folders; the first folder holding an
     index.html that stands today                              -> that page
  3  a piece of work touches several files: each file's nearest
     page is found, the one most of them agree on is kept, and
     a tie goes to the deepest
  4  the address comes from the repository's own site: its CNAME file if it has one, otherwise the
     address GitHub says it serves pages at. A repository that is not provably public, or serves no
     pages, gets NO page from this ladder.
Every address written down answered 200 when the table was built, or it is dropped.

WHAT IS WRITTEN. cosmos/pages.tsv: one row per page (id, address, the page's own <title>).
cosmos/work-pages.tsv: one row per piece of work that has a page (commit, page id, how it was found:
itself / folder / votes). Work with no page has no row, and the page says so plainly.

    python tools/pages.py                 build both tables, and say how much of the record lands where
    python tools/pages.py --selftest      the ladder, on a folder made for the purpose
"""
import html
import io
import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.join(HERE, '..')
COSMOS = os.path.join(KB, 'cosmos')
sys.path.insert(0, HERE)
from check_proof import leaks


def nearest(path, standing, served=''):
    """The ladder's first two steps for one file. Returns (page path, how) or (None, None).
    `served` is the folder the site is served from ('' for the top, 'docs' for /docs)."""
    if served and not (path == served or path.startswith(served + '/')):
        return None, None
    if path.lower().endswith(('.html', '.htm')) and path in standing:
        return path, 'itself'
    d = os.path.dirname(path).replace('\\', '/')
    while True:
        cand = (d + '/' if d else '') + 'index.html'
        if cand in standing and (not served or cand.startswith(served + '/')):
            return cand, 'folder'
        if not d or d == served:
            return None, None
        d = os.path.dirname(d)


def choose(pages):
    """Step 3: the page most files agree on; a tie goes to the deepest."""
    votes = Counter(p for p in pages if p)
    if not votes:
        return None
    top = max(votes.values())
    return sorted((p for p, v in votes.items() if v == top), key=lambda p: (-p.count('/'), p))[0]


def address(base, page, served=''):
    rel = page[len(served) + 1:] if served and page.startswith(served + '/') else page
    if rel.endswith('index.html'):
        rel = rel[:-len('index.html')]
    return base.rstrip('/') + '/' + rel


def site_of(clone, full):
    """Where a repository's own site is served, PROVED: its CNAME file, or what GitHub says."""
    served, base = '', None
    try:
        j = json.loads(subprocess.run(['gh', 'api', 'repos/%s/pages' % full], capture_output=True,
                                      text=True, timeout=60).stdout or '{}')
    except Exception:
        j = {}
    if not j.get('html_url'):
        return None, ''
    served = ((j.get('source') or {}).get('path') or '/').strip('/')
    cname = os.path.join(clone, served, 'CNAME') if served else os.path.join(clone, 'CNAME')
    if os.path.exists(cname):
        base = 'https://' + io.open(cname, encoding='utf-8').read().strip() + '/'
    else:
        base = j['html_url']
    return base, served


def title_of(clone, page):
    try:
        raw = io.open(os.path.join(clone, page), encoding='utf-8', errors='replace').read(20000)
    except OSError:
        return ''
    m = re.search(r'(?is)<title[^>]*>(.*?)</title>', raw)
    t = re.sub(r'\s+', ' ', html.unescape(m.group(1))).strip() if m else ''
    return t[:90]


def answers(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'kuiper-pages-check'})
        return urllib.request.urlopen(req, timeout=25).status == 200
    except Exception:
        return False


_FRONT = {}


def alive_front(url):
    if url not in _FRONT:
        _FRONT[url] = answers(url)
    return _FRONT[url]


def build():
    repos = [l.rstrip('\n').split('\t') for l in io.open(os.path.join(COSMOS, 'repos.tsv'), encoding='utf-8')
             if l.strip() and not l.startswith('#')]
    pub = {p[0]: p[1] for p in (l.rstrip('\n').split('\t') for l in io.open(os.path.join(COSMOS, 'public.tsv'), encoding='utf-8')
                                if l.strip() and not l.startswith('#')) if len(p) > 2 and p[2] == 'yes'}
    on_wafer = {}
    for l in io.open(os.path.join(COSMOS, 'wafer.tsv'), encoding='utf-8'):
        if l.startswith('#') or not l.strip():
            continue
        p = l.rstrip('\n').split('\t')
        on_wafer.setdefault(p[2], set()).add(p[3])
    found = {}                                       # sha12 -> (address, clone, page, how)
    fronts, folders = {}, Counter()                  # work that only reaches a front door, and where it sits
    total = sum(len(v) for v in on_wafer.values())
    for idx, name, _lines in repos:
        if name not in pub or idx not in on_wafer:
            continue
        clone = os.path.join(KB, '..', name)
        if not os.path.isdir(os.path.join(clone, '.git')):
            continue
        base, served = site_of(clone, '%s/%s' % (pub[name], name))
        if not base:
            continue
        standing = set(subprocess.run(['git', 'ls-files'], cwd=clone, capture_output=True, text=True,
                                      encoding='utf-8', errors='replace').stdout.split('\n'))
        log = subprocess.run(['git', 'log', '--all', '--name-only', '--format=\x01%H'], cwd=clone,
                             capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
        n_here = 0
        for block in log.split('\x01')[1:]:
            lines = block.split('\n')
            sha = lines[0][:12]
            if sha not in on_wafer[idx]:
                continue
            per = [nearest(f, standing, served) for f in lines[1:] if f.strip()]
            root = (served + '/' if served else '') + 'index.html'
            # A FILE THAT ONLY REACHES THE TOP OF THE SITE HAS FOUND NO PAGE, SO IT CASTS NO VOTE. Left
            # in, the many files that walk all the way up outvote the few that sit beside a real page.
            page = choose([p for p, _h in per if p != root]) or choose([p for p, _h in per])
            if not page:
                continue
            hows = {h for p, h in per if p == page}
            # THE TOP OF A SITE IS A FRONT DOOR, NOT A PAGE OF ONE'S OWN. Walking up through folders
            # that hold no page always ends there, and calling that "found" turned a third into three
            # quarters in a published note.
            if page == root:
                fronts[sha] = address(base, page, served)
                folders.update(os.path.dirname(f).replace('\\', '/') or '(top folder)' for f in lines[1:] if f.strip())
                continue
            how = 'itself' if hows == {'itself'} and sum(1 for p, _ in per if p) == 1 else ('folder' if len({p for p, _ in per if p}) == 1 else 'votes')
            found[sha] = (address(base, page, served), clone, page, how)
            n_here += 1
        print('  %-44s %5d of %5d pieces of work have a page   %s' % (name, n_here, len(on_wafer[idx]), base))
    # every address must answer, or it is dropped
    distinct = sorted({v[0] for v in found.values()})
    print('checking that %d addresses answer...' % len(distinct))
    with ThreadPoolExecutor(max_workers=6) as ex:
        alive = dict(zip(distinct, ex.map(answers, distinct)))
    dead = [a for a, ok in alive.items() if not ok]
    pages, ids, rows = [], {}, []
    for sha, (addr, clone, page, how) in sorted(found.items()):
        if not alive.get(addr):
            continue
        title = title_of(clone, page)
        if leaks(addr) or leaks(title):
            continue
        if addr not in ids:
            ids[addr] = len(pages)
            pages.append((str(len(pages)), addr, title))
        rows.append((sha, str(ids[addr]), how))
    io.open(os.path.join(COSMOS, 'pages.tsv'), 'w', encoding='utf-8', newline='\n').write(
        '# id\taddress\ttitle\n' + '\n'.join('\t'.join(p) for p in pages) + '\n')
    roots = {p[1] for p in pages} & set(fronts.values())
    assert not roots, 'a page of its own may never be a site root: %s' % sorted(roots)[:3]
    io.open(os.path.join(COSMOS, 'work-pages.tsv'), 'w', encoding='utf-8', newline='\n').write(
        '# commit\tpage\thow\n' + '\n'.join('\t'.join(r) for r in rows) + '\n')
    # the front door each of the rest reaches, so the card can say so plainly and still lead somewhere
    io.open(os.path.join(COSMOS, 'work-fronts.tsv'), 'w', encoding='utf-8', newline='\n').write(
        '# commit\tfront_door\n' + '\n'.join('%s\t%s' % kv for kv in sorted(fronts.items()) if alive_front(kv[1])) + '\n')
    io.open(os.path.join(COSMOS, 'missing-pages.tsv'), 'w', encoding='utf-8', newline='\n').write(
        '# folder\tfiles_touched_by_work_that_only_reaches_a_front_door\n'
        + '\n'.join('%s\t%d' % kv for kv in folders.most_common(60)) + '\n')
    hows = Counter(r[2] for r in rows)
    print('\nOF %s PIECES OF WORK ON THE RECORD' % format(total, ','))
    print('  %6s land on a page of their own   (%s the work is that page, %s its folder, %s by the agreement of its files)'
          % (format(len(rows), ','), format(hows['itself'], ','), format(hows['folder'], ','), format(hows['votes'], ',')))
    print('  %6s reach only the FRONT DOOR of their site: an application where one is proved, else the front page'
          % format(len(fronts), ','))
    print('  %6s are in repositories that serve no pages or are not public' % format(total - len(rows) - len(fronts), ','))
    print('  THE TWENTY FOLDERS WHERE A PAGE IS MOST MISSED (files touched by work that only reaches a front door):')
    for f, k in folders.most_common(20):
        print('    %6s  %s' % (format(k, ','), f))
    print('  %d distinct pages; %d addresses did not answer and were dropped' % (len(pages), len(dead)))
    return 0


def selftest():
    standing = {'index.html', 'cable_geometry/index.html', 'cable_geometry/app.js', 'tool/v5/page.html', 'notes/readme.md'}
    checks = [
        ('a page that still stands is its own door', nearest('tool/v5/page.html', standing) == ('tool/v5/page.html', 'itself')),
        ('a program opens the page of its own folder', nearest('cable_geometry/app.js', standing) == ('cable_geometry/index.html', 'folder')),
        ('a file with no page in its folder walks up to the top', nearest('notes/readme.md', standing) == ('index.html', 'folder')),
        ('a page that no longer stands is not a door', nearest('gone/old.html', standing - {'index.html'}) == (None, None)),
        ('most files agree; a tie goes to the deepest', choose(['index.html', 'cable_geometry/index.html']) == 'cable_geometry/index.html'),
        ('an index page is addressed as its folder', address('https://x.com/', 'cable_geometry/index.html') == 'https://x.com/cable_geometry/'),
        ('a site served from /docs ignores what is outside it', nearest('src/a.js', {'docs/index.html', 'index.html'}, 'docs') == (None, None)),
    ]
    for what, ok in checks:
        print('%s  %s' % ('pass' if ok else 'FAIL', what))
    good = all(ok for _, ok in checks)
    print('SELFTEST %s' % ('PASS' if good else 'FAIL'))
    return 0 if good else 1


if __name__ == '__main__':
    sys.exit(selftest() if sys.argv[1:2] == ['--selftest'] else build())
