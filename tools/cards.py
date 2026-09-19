#!/usr/bin/env python3
r"""tools/cards.py - give one public file's lines their Kuiper keys, so a tap can show the code.

THE PROBLEM THIS SOLVES, NARROWLY. A Kuiper key names a repository, a commit and an ordinal: the
343,358th line of that commit. It does not name a PATH. tools/key.py finds the path with git, and a
browser has no git. Until the public tree data exists, the honest way to show code on a tap is to
work the answer out here, for one file at a time, and publish the answer.

WHAT A CARD IS. For the newest commit that touched a path, the file's lines are numbered from the
commit's own first key plus the number of lines in every blob before it in `git ls-tree -r` order,
which is exactly the walk tools/key.py does to go the other way. The card holds those keys, the
path, the commit and the text, and the self test proves the text equals what key.py gets from git.

WHAT IS NOT IN A CARD. Anything from a repository that cannot be proved public: no fetch, no path,
no text. Any single line that trips the digest guard is written as "[withheld]" and counted, never
dropped in silence. Nothing is summarised, aggregated or rewritten: a card is the file or it is
nothing.

    python tools/cards.py globalgrid2050 solar-bess-topology-v5/cable-geometry-visualiser-v5.html
    python tools/cards.py --selftest      keys from a built card must match tools/key.py from git
"""
import io
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.join(HERE, '..')
COSMOS = os.path.join(KB, 'cosmos')
CARDS = os.path.join(COSMOS, 'cards')
sys.path.insert(0, HERE)
from check_proof import leaks
import key as keytool
from pulse import public_repos, repo_name_of


# THE ONE RULE THAT MAKES THE ADDRESS OF A LINE ON GITHUB. The page has the same rule and the self
# test proves the two agree, so if the ids ever change the links can be made again from the fields
# alone. An owner written into the page by hand would point a reader at a page that does not exist
# the first time a carried file comes from somewhere else.
def link_of(owner, repo, commit, path, line=None):
    return 'https://github.com/%s/%s/blob/%s/%s%s' % (owner, repo, commit, path,
                                                      '' if line is None else '#L%d' % line)


def clone(repo):
    return os.path.join(KB, '..', repo)


def newest_commit(d, path):
    r = subprocess.run(['git', 'log', '-1', '--format=%H%x09%at', '--', path],
                       cwd=d, capture_output=True, text=True, timeout=300)
    if r.returncode or not r.stdout.strip():
        return None, None
    sha, at = r.stdout.strip().split('\t')
    return sha, int(at)


def build(repo, path):
    d = clone(repo)
    if not os.path.isdir(os.path.join(d, '.git')):
        print('REFUSED: no clone of %s' % repo)
        return 2
    pub = public_repos()
    full = repo_name_of(d, repo)
    if not pub.get(full.lower(), pub.get(full.split('/')[-1].lower(), False)):
        print('REFUSED: %s cannot be proved public, so no card is made and nothing is read' % repo)
        return 2
    cite = full.split('/')[-1]
    owner = full.split('/')[0]

    sha, at = newest_commit(d, path)
    if not sha:
        print('REFUSED: git knows no commit that touched %s' % path)
        return 2

    keytool.load_cache()
    commits, space, total = keytool.load()
    c = next((x for x in commits if x['sha'] == sha[:12] and x['name'].lower() == cite.lower()), None)
    if c is None:
        print('REFUSED: commit %s of %s is not on this wafer (harvested at a different moment)' % (sha[:12], cite))
        return 2

    # the walk that key.py does, stopped at our path: every blob before it, in git's own order
    tree = subprocess.run(['git', 'ls-tree', '-r', sha], cwd=d, capture_output=True).stdout
    before, body, found = 0, None, False
    for entry in tree.split(b'\n'):
        if not entry:
            continue
        meta, _, p = entry.partition(b'\t')
        bits = meta.split()
        if len(bits) < 3 or bits[1] != b'blob':
            continue
        bsha = bits[2].decode()
        here = p.decode('utf-8', 'replace')
        # EXACTLY THE WALK key.py DOES, INCLUDING WHAT IT SKIPS. A blob git calls binary counts as
        # no lines there, so it must count as no lines here, or every key after it is off by the
        # size of that file. The two walks have to agree line for line or the card is fiction.
        n_lines, _cached = keytool.blob_lines(d, bsha)
        if here == path:
            body = subprocess.run(['git', 'cat-file', 'blob', bsha], cwd=d, capture_output=True).stdout
            if keytool.lines_of(body) != n_lines:
                print('REFUSED: the cache says %d lines for that blob and git says %d'
                      % (n_lines, keytool.lines_of(body)))
                return 2
            found = True
            break
        if n_lines > 0:
            before += n_lines
    if not found:
        print('REFUSED: %s is not in commit %s' % (path, sha[:12]))
        return 2

    if keytool.lines_of(body) <= 0:
        print('REFUSED: %s is binary in that commit, so it has no lines' % path)
        return 2
    text = [l.decode('utf-8', 'replace').rstrip('\r') for l in body.split(b'\n')]
    if text and text[-1] == '' and body.endswith(b'\n'):
        text.pop()                                   # a trailing newline ends the last line, not a new one

    first = c['k0'] + before
    withheld = 0
    out = []
    for i, line in enumerate(text):
        if leaks(line):
            out.append('[withheld]')
            withheld += 1
        else:
            out.append(line)

    at_head = os.path.exists(os.path.join(d, path))
    card = {'schema': 'kuiper-card.v1', 'repository': cite, 'path': path, 'commit': sha,
            'commit_unix': at, 'first_key': first, 'lines': len(out),
            'still_in_the_repository': at_head,
            'gone_note': None if at_head else 'This file was later removed.',
            'owner': owner, 'github': link_of(owner, cite, sha, path),
            'withheld_lines': withheld, 'text': out}
    os.makedirs(CARDS, exist_ok=True)
    slug = re.sub(r'[^a-z0-9]+', '-', path.lower()).strip('-')[:60]
    p = os.path.join(CARDS, slug + '.json')
    json.dump(card, io.open(p, 'w', encoding='utf-8', newline='\n'), indent=1)
    # A SMALL LIST, SO THE PAGE FETCHES A CARD ONLY WHEN A TAP LANDS IN ONE. Loading every carried
    # file up front would cost a reader a megabyte to look at one line.
    rows = ['# path\trepository\tfirst_key\tlines\tfile\tcommit\tstill_here\towner\tcommit_unix']
    for f in sorted(x for x in os.listdir(CARDS) if x.endswith('.json')):
        j = json.load(io.open(os.path.join(CARDS, f), encoding='utf-8'))
        rows.append('\t'.join(str(x) for x in [j['path'], j['repository'], j['first_key'], j['lines'],
                                               f, j['commit'], 'yes' if j['still_in_the_repository'] else 'no',
                                               j.get('owner', ''), j.get('commit_unix', 0)]))
    io.open(os.path.join(CARDS, 'list.tsv'), 'w', encoding='utf-8', newline='\n').write('\n'.join(rows) + '\n')
    print('%s / %s' % (cite, path))
    print('  commit %s of %s' % (sha[:12], __import__('datetime').datetime.utcfromtimestamp(at).strftime('%Y-%m-%d')))
    print('  %s lines, keys %s to %s%s' % (format(len(out), ','), format(first, ','), format(first + len(out) - 1, ','),
                                           '' if not withheld else ', %d withheld' % withheld))
    print('  %s' % ('still in the repository' if at_head else 'This file was later removed.'))
    print('  written to %s' % p)
    return 0


def selftest():
    """A card is only worth anything if its text is the text git gives for the same key."""
    if not os.path.isdir(CARDS):
        print('SELFTEST FAIL: no cards built yet')
        return 1
    files = sorted(f for f in os.listdir(CARDS) if f.endswith('.json'))
    if not files:
        print('SELFTEST FAIL: no cards built yet')
        return 1
    bad = 0
    for f in files[:2]:
        card = json.load(io.open(os.path.join(CARDS, f), encoding='utf-8'))
        # the address a reader is sent to must be the rule applied to the fields, and nothing else
        want = link_of(card.get('owner'), card['repository'], card['commit'], card['path'])
        ok = card.get('github') == want and bool(card.get('owner'))
        print('%s  the GitHub address is the rule applied to the fields: %s'
              % ('pass' if ok else 'FAIL', card.get('github')))
        if not ok:
            bad += 1
        n = card['lines']
        picks = sorted({0, n // 2, n - 1})
        for i in picks:
            if card['text'][i] == '[withheld]':
                continue
            k = card['first_key'] + i
            out = subprocess.run([sys.executable, os.path.join(HERE, 'key.py'), str(k)],
                                 cwd=KB, capture_output=True, text=True, timeout=180,
                                 encoding='utf-8', errors='replace').stdout or ''
            want = card['text'][i].strip()
            ok = bool(want) and want in out
            print('%s  %s line %d, key %d%s' % ('pass' if ok else 'FAIL', card['path'].split('/')[-1], i + 1, k,
                                                '' if ok else '\n     git said: ' + out.strip()[-160:]))
            if not ok:
                bad += 1
    print('SELFTEST %s' % ('PASS' if bad == 0 else 'FAIL'))
    return 1 if bad else 0


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--selftest':
        return selftest()
    if len(argv) < 2:
        print('REFUSED: give a repository and a path')
        return 2
    return build(argv[0], argv[1])


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
