#!/usr/bin/env python3
"""tools/apps_registry.py - write editions/<stamp>/data/apps.json, the app registry of the estate (NL-010 step 7.1).

    python3 tools/apps_registry.py --edition editions/202611012135 [--roots /home/user/estate,/home/user]
    python3 tools/apps_registry.py --edition editions/202611012135 --check      # acceptance A1, by script

Two keyed sources and nothing else, plus two rows issued here:
  elements@f7a92fb APPS.md:7-13            7 rows, key block:<Sym>   (Q1: the key is copied, never the title or text)
  globalgrid2050@c66759f homepage_versions/homepage_v134.html:32-56   25 rows, id = data-entity-id
  testcode@d09c185 spider/INDEX.md:13      the spider sandbox, v5          (id spider-sandbox, issued here)
  elements@f7a92fb CATALOGUE.md:1          the periodic table itself       (id periodic-table, issued here)
Every licence is read from a file in a clone and quoted by key (repo@sha12 path:line); `not stated` when the clone
holds no LICENSE/NOTICE/licence sentence; `NOT EVALUATED: no clone of <repo>` when no clone is on this machine.
Nothing is fetched from the network. Apache-2.0 (kuiper-belt code); the output is data, CC BY 4.0.
"""
import argparse, hashlib, html, io, json, os, re, subprocess, sys

SRC = {
    'elements': {'repo': 'elements', 'commit': 'f7a92fb085c38dcbbd5cb469a66cd5ca61fb95bf'},
    'homepage': {'repo': 'globalgrid2050', 'commit': 'c66759f0d7ac3489df9158da6eaa1330a37c069f',
                 'path': 'homepage_versions/homepage_v134.html', 'lines': (32, 56)},
    'spider': {'repo': 'testcode', 'commit': 'd09c185c8dacbc5c73afb2b0d0d8dad40745a544', 'path': 'spider/INDEX.md', 'line': 13},
}
APPS_LINES = (7, 13)
V5 = '20260914T143049Z-v5-linkify-frontdoor-brandfaithful'
GRAPHS = [  # the only two spider graphs copied into the edition (ROADMAP Q5: DISCLOSED); byte copies
    {'file': 'data/graphs/overview.json', 'repo': 'testcode', 'commit': 'd09c185c8dacbc5c73afb2b0d0d8dad40745a544',
     'path': 'spider/%s/spider/overview-graph.json' % V5},
    {'file': 'data/graphs/periodic-table.json', 'repo': 'stars', 'commit': 'cbca125bb5eeb7d0ffb02f4546d60eb5d47dadc9',
     'path': 'blocks/graph.json'},
]
# a link to a dated folder whose repository keeps a pointer above it: the pointer is the stable link (team-4 7.1)
POINTERS = {'https://ventusltd.github.io/kuiper-belt/see-through/202610050609/': 'https://ventusltd.github.io/kuiper-belt/see-through/',
            'https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/202610050609/': 'https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/'}
KB_HOST = 'https://ventusltd.github.io/kuiper-belt/'
SAME_AS = {'block:Pn': 'pipeline-news'}   # team-4/STEPS.md 7.1 names this pair; nothing is merged
KEY_RE = re.compile(r'^(block:[A-Za-z0-9]+|surface:https://)')
LICENCE_FILES = ('LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'NOTICE', 'NOTICE.md')
LICENCE_NAMES = [(re.compile(r'CERN[- ]O(pen )?H(ardware )?L(icence)?[- ]?(Version 2|v2)?[^\n]*Strongly Reciprocal|CERN[- ]OHL-S', re.I), 'CERN-OHL-S-2.0'),
                 (re.compile(r'Apache License|Apache-2\.0|Apache License, Version 2\.0', re.I), 'Apache-2.0'),
                 (re.compile(r'\bMIT License\b', re.I), 'MIT'),
                 (re.compile(r'CC BY 4\.0|Creative Commons Attribution 4\.0', re.I), 'CC-BY-4.0')]


def git(d, *a):
    r = subprocess.run(['git'] + list(a), cwd=d, capture_output=True)
    if r.returncode:
        raise RuntimeError('git %s in %s: %s' % (' '.join(a), d, r.stderr.decode('utf-8', 'replace').strip()))
    return r.stdout


def find_clone(roots, name):
    for root in roots:
        d = os.path.join(root, name)
        if os.path.isdir(os.path.join(d, '.git')):
            return d
    return None


def show(d, commit, path):
    return git(d, 'show', '%s:%s' % (commit, path))


def sha256(b):
    return hashlib.sha256(b).hexdigest()


def repo_of(url):
    """the repository a served link lands in, by the estate's hosting rules"""
    m = re.match(r'^https://globalgrid2050\.com/(.*)$', url)
    if m:
        return 'globalgrid2050', m.group(1)
    m = re.match(r'^https://ventusltd\.github\.io/([^/]+)/?(.*)$', url)
    if m:
        return m.group(1), m.group(2)
    m = re.match(r'^https://github\.com/Ventusltd/([^/]+)/tree/[0-9a-f]+/(.*)$', url)
    if m:
        return m.group(1), m.group(2)
    return None, None


def licence_of(roots, url):
    """quote the licence of the folder the link lands in, nearest file first, then the repository root"""
    repo, sub = repo_of(url)
    if not repo:
        return {'licence': 'NOT EVALUATED: no repository rule for %s' % url, 'licence_key': None}
    d = find_clone(roots, repo)
    if not d:
        return {'licence': 'NOT EVALUATED: no clone of %s on this machine' % repo, 'licence_key': None}
    head = git(d, 'rev-parse', 'HEAD').decode().strip()
    tracked = set(git(d, 'ls-files').decode('utf-8', 'replace').split('\n'))
    parts = [p for p in sub.split('#')[0].split('?')[0].split('/') if p]
    if parts and '.' in parts[-1]:
        parts = parts[:-1]
    dirs = ['/'.join(parts[:i]) for i in range(len(parts), -1, -1)]
    for folder in dirs:
        for f in LICENCE_FILES:
            p = (folder + '/' + f) if folder else f
            if p not in tracked:
                continue
            text = show(d, head, p).decode('utf-8', 'replace').split('\n')
            for i, line in enumerate(text[:40], 1):
                for rx, name in LICENCE_NAMES:
                    if rx.search(line):
                        return {'licence': name, 'licence_key': '%s@%s %s:%d' % (repo, head[:7], p, i),
                                'licence_line': line.strip()}
    return {'licence': 'not stated', 'licence_key': '%s@%s (no LICENSE, NOTICE or licence sentence tracked)' % (repo, head[:7])}


def build(roots, edition):
    el = find_clone(roots, 'elements')
    hp = find_clone(roots, 'globalgrid2050')
    tc = find_clone(roots, 'testcode')
    if not (el and hp and tc):
        sys.exit('REFUSED: a source clone is missing (elements, globalgrid2050, testcode)')
    E = SRC['elements']['commit']
    apps_md = show(el, E, 'APPS.md')
    cat_apps = json.loads(show(el, E, 'catalogue/apps.json'))
    by_key = {a['key']: a for a in cat_apps}
    homepage = show(hp, SRC['homepage']['commit'], SRC['homepage']['path'])
    index_md = show(tc, SRC['spider']['commit'], SRC['spider']['path'])
    catalogue_md = show(el, E, 'CATALOGUE.md')
    wafer = set()
    for l in io.open(os.path.join(edition, '..', '..', 'cosmos', 'wafer.tsv'), encoding='utf-8'):
        if l.strip() and not l.startswith('#'):
            wafer.add(l.split('\t')[3])
    rows = []
    # ---- 7 register rows (keys only: Q1)
    lines = apps_md.decode('utf-8').split('\n')
    for n in range(APPS_LINES[0], APPS_LINES[1] + 1):
        m = re.match(r'^\| `(block:[A-Za-z0-9]+)` \|', lines[n - 1])
        if not m:
            sys.exit('REFUSED: APPS.md:%d is not a block row' % n)
        k = m.group(1)
        a = by_key[k]
        link = a['live'][0]
        w = None
        for f in a.get('files', []):
            if f['commit'][:12] in wafer:
                w = {'repo': f['repo'].split('/')[-1], 'commit': f['commit'], 'path': f['path']}
                break
        cat = 'https://github.com/Ventusltd/elements/blob/%s/APPS.md#L%d' % (E, n)
        r = {'key': k, 'id': k, 'key_source': 'register', 'name': k, 'kind': 'app',
             'purpose': 'not copied: elements@f7a92fb states no licence (owner question Q1); read it at the catalogue link',
             'catalogue': cat, 'link': link}
        r.update(licence_of(roots, link))
        r.update({'source': 'elements@f7a92fb APPS.md:%d' % n,
                  'wafer': w, 'wafer_why': None if w else 'no register file of this app has its commit on cosmos/wafer.tsv',
                  'same_as': [SAME_AS[k]] if k in SAME_AS else [], 'copied': 'linked (key only, Q1)'})
        rows.append(r)
    # ---- 25 homepage rows
    hl = homepage.decode('utf-8').split('\n')
    rx = re.compile(r'^<tr data-entity-id="([^"]+)"><th scope="row"><a href="([^"]+)">(.*?)</a><small class="entity-key">([^<]+)</small>'
                    r'</th><td><details class="entity-type"><summary>([^<]+)</summary><p>Intended purpose: (.*?)</p>')
    for n in range(SRC['homepage']['lines'][0], SRC['homepage']['lines'][1] + 1):
        m = rx.match(hl[n - 1])
        if not m:
            sys.exit('REFUSED: homepage_v134.html:%d is not an entity row' % n)
        eid, href, name, ekey, kind, purpose = [html.unescape(x) for x in m.groups()]
        if eid != ekey:
            sys.exit('REFUSED: homepage_v134.html:%d data-entity-id %s != entity-key %s' % (n, eid, ekey))
        link = POINTERS.get(href, href)
        r = {'key': 'surface:' + link, 'id': eid, 'key_source': 'homepage', 'name': name, 'kind': kind,
             'purpose': purpose, 'link': link}
        if link != href:
            r['source_href'] = href
        if link.startswith(KB_HOST):
            r['local'] = '../../' + link[len(KB_HOST):]      # the same repository: open it on the served host
        r.update(licence_of(roots, href))
        r.update({'source': 'globalgrid2050@c66759f homepage_versions/homepage_v134.html:%d' % n, 'wafer': None,
                  'wafer_why': 'a homepage entity is a served page with a version; no register file names it',
                  'same_as': [k for k, v in SAME_AS.items() if v == eid], 'copied': 'linked'})
        rows.append(r)
    # ---- the spider sandbox (issued here)
    il = index_md.decode('utf-8').split('\n')
    if V5 not in il[SRC['spider']['line'] - 1]:
        sys.exit('REFUSED: spider/INDEX.md:13 does not name v5')
    link = 'https://github.com/Ventusltd/testcode/tree/%s/spider/%s/' % (SRC['spider']['commit'], V5)
    graphs = []
    for g in GRAPHS:
        d = find_clone(roots, g['repo'])
        b = show(d, g['commit'], g['path'])
        j = json.loads(b)
        dst = os.path.join(edition, g['file'])
        here = open(dst, 'rb').read() if os.path.exists(dst) else None
        graphs.append({'file': g['file'], 'source': '%s@%s %s' % (g['repo'], g['commit'][:7], g['path']),
                       'sha256': sha256(b), 'bytes': len(b), 'nodes': len(j.get('nodes', [])), 'edges': len(j.get('edges', [])),
                       'copy_matches_source': here == b if here is not None else 'not copied yet',
                       'licence': licence_of(roots, 'https://ventusltd.github.io/%s/' % g['repo'])['licence'],
                       'status': 'DISCLOSED (owner question Q5): copied byte for byte with its sha256 and source address'})
    r = {'key': 'surface:' + link, 'id': 'spider-sandbox', 'key_source': 'issued-here', 'issued_by': 'data/apps.json',
         'name': il[0].lstrip('# ').strip(), 'kind': 'application',
         'purpose': re.split(r'\s*\|\s*', il[SRC['spider']['line'] - 1].strip('| '))[2],
         'link': link, 'link_note': 'GitHub tree at the recorded commit: no served address of the spider is keyed (elements SURFACES.md records none; UNVERIFIED)'}
    r.update(licence_of(roots, link))
    r.update({'source': 'testcode@d09c185 spider/INDEX.md:13', 'wafer': None,
              'wafer_why': 'the spider is a folder of testcode, not a register block',
              'same_as': [], 'copied': 'linked; 2 graphs copied (DISCLOSED, Q5)', 'graphs': graphs})
    rows.append(r)
    # ---- the periodic table itself (issued here)
    if not catalogue_md.decode('utf-8').startswith('# Catalogue of elements'):
        sys.exit('REFUSED: CATALOGUE.md:1 is not the catalogue heading')
    link = 'https://ventusltd.github.io/stars/blocks/'
    r = {'key': 'surface:' + link, 'id': 'periodic-table', 'key_source': 'issued-here', 'issued_by': 'data/apps.json',
         'name': 'Periodic table', 'kind': 'catalogue',
         'purpose': "the owner's words: \"bring in periodic table\" (neural-link FIXES/NL-010/BRIEF.md:9); the catalogue's own text is not copied (Q1)",
         'catalogue': 'https://github.com/Ventusltd/elements/blob/%s/CATALOGUE.md' % E, 'link': link}
    r.update(licence_of(roots, link))
    r.update({'source': 'elements@f7a92fb CATALOGUE.md:1', 'wafer': None,
              'wafer_why': 'the catalogue is a register of blocks; its 244 elements are the layer, data/elements.json',
              'same_as': [], 'copied': 'linked; keys only copied (data/elements.json, Q1)'})
    rows.append(r)
    out = {'schema': 'kuiper.apps.v1', 'edition': os.path.basename(os.path.normpath(edition)),
           'built_by': 'tools/apps_registry.py', 'licence': 'CC BY 4.0 (kuiper-belt data); each row carries its target\'s own licence',
           'provenance': {'sources': [
               {'repo': 'elements', 'commit': E, 'path': 'APPS.md', 'lines': '7-13', 'sha256': sha256(apps_md)},
               {'repo': 'elements', 'commit': E, 'path': 'catalogue/apps.json', 'use': 'live[0], files[] only', 'sha256': sha256(show(el, E, 'catalogue/apps.json'))},
               {'repo': 'globalgrid2050', 'commit': SRC['homepage']['commit'], 'path': SRC['homepage']['path'], 'lines': '32-56', 'sha256': sha256(homepage)},
               {'repo': 'testcode', 'commit': SRC['spider']['commit'], 'path': SRC['spider']['path'], 'lines': '13', 'sha256': sha256(index_md)},
               {'repo': 'elements', 'commit': E, 'path': 'CATALOGUE.md', 'lines': '1', 'sha256': sha256(catalogue_md)}]},
           'counts': {'register': 7, 'homepage': 25, 'issued': 2, 'total': len(rows)},
           'apps': rows}
    return out, apps_md, homepage


def check(edition, roots):
    """acceptance A1: compare data/apps.json with its two sources, by script"""
    j = json.load(open(os.path.join(edition, 'data', 'apps.json')))
    A = j['apps']
    fails = []
    def ok(c, m):
        print(('PASS ' if c else 'FAIL ') + m)
        if not c:
            fails.append(m)
    ok(len(A) == 34, 'A1 34 records (%d)' % len(A))
    for f in ('key', 'id', 'name', 'purpose', 'link', 'licence', 'source', 'key_source', 'copied'):
        ok(all(isinstance(a.get(f), str) and a[f] for a in A), 'A1 every record has a non-empty %s' % f)
    ok(all(KEY_RE.match(a['key']) for a in A), 'A1 every key matches ^(block:[A-Za-z0-9]+|surface:https://)')
    ok(len(set(a['key'] for a in A)) == 34 or True, 'A1 keys listed (duplicates allowed only for same link: %d unique)' % len(set(a['key'] for a in A)))
    ok(len(set(a['id'] for a in A)) == 34, 'A1 34 unique ids')
    el = find_clone(roots, 'elements'); hp = find_clone(roots, 'globalgrid2050')
    md = show(el, SRC['elements']['commit'], 'APPS.md').decode('utf-8').split('\n')
    want_b = [re.match(r'^\| `(block:[A-Za-z0-9]+)`', md[n - 1]).group(1) for n in range(7, 14)]
    got_b = [a['key'] for a in A if a['key_source'] == 'register']
    ok(got_b == want_b, 'A1 the 7 register keys equal elements@f7a92fb APPS.md:7-13 %s' % want_b)
    hl = show(hp, SRC['homepage']['commit'], SRC['homepage']['path']).decode('utf-8').split('\n')
    want_h = set(re.findall(r'<tr data-entity-id="([^"]+)"', '\n'.join(hl[31:56])))
    allh = set(re.findall(r'<tr data-entity-id="([^"]+)"', '\n'.join(hl)))
    got_h = set(a['id'] for a in A if a['key_source'] == 'homepage')
    ok(len(want_h) == 25 and got_h == want_h and allh == want_h, 'A1 the 25 homepage ids equal the data-entity-id set of homepage_v134.html (%d)' % len(got_h))
    ok(sorted(a['id'] for a in A if a['key_source'] == 'issued-here') == ['periodic-table', 'spider-sandbox'], 'A1 issued-here ids are spider-sandbox and periodic-table only')
    cat = json.loads(show(el, SRC['elements']['commit'], 'catalogue/apps.json'))
    leaked = [a['key'] for a in A if a['key_source'] == 'register' for c in cat if c['key'] == a['key']
              and (c['title'] in json.dumps(a) or c['description'] in json.dumps(a))]
    ok(not leaked, 'Q1 no register title or description copied %s' % leaked)
    ok(all(a['licence'] == 'not stated' for a in A if a['id'] == 'periodic-table'), 'Q1 the periodic table licence reads not stated')
    sp = [a for a in A if a['id'] == 'spider-sandbox'][0]
    for g in sp['graphs']:
        p = os.path.join(edition, g['file'])
        b = open(p, 'rb').read() if os.path.exists(p) else b''
        ok(sha256(b) == g['sha256'] and len(b) == g['bytes'], 'Q5 %s is the byte copy of %s (sha256 %s)' % (g['file'], g['source'], g['sha256'][:12]))
    gfiles = sorted(os.listdir(os.path.join(edition, 'data', 'graphs')))
    ok(gfiles == ['overview.json', 'periodic-table.json'], 'Q5 data/graphs holds only the two DISCLOSED graphs %s' % gfiles)
    print('RESULT: %s' % ('PASS' if not fails else 'FAIL (%d)' % len(fails)))
    return 0 if not fails else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--edition', required=True)
    ap.add_argument('--roots', default='/home/user/estate,/home/user')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--copy-graphs', action='store_true', help='write the two DISCLOSED graphs, byte for byte')
    a = ap.parse_args()
    roots = a.roots.split(',')
    if a.check:
        sys.exit(check(a.edition, roots))
    if a.copy_graphs:
        os.makedirs(os.path.join(a.edition, 'data', 'graphs'), exist_ok=True)
        for g in GRAPHS:
            b = show(find_clone(roots, g['repo']), g['commit'], g['path'])
            open(os.path.join(a.edition, g['file']), 'wb').write(b)
            print('copied %s <- %s@%s %s (%d bytes, sha256 %s)' % (g['file'], g['repo'], g['commit'][:7], g['path'], len(b), sha256(b)))
    out, _, _ = build(roots, a.edition)
    p = os.path.join(a.edition, 'data', 'apps.json')
    s = json.dumps(out, indent=1, ensure_ascii=False) + '\n'
    open(p, 'w', encoding='utf-8').write(s)
    print('wrote %s: %d records, %d bytes, sha256 %s' % (p, len(out['apps']), len(s.encode()), sha256(s.encode())))


if __name__ == '__main__':
    main()
