#!/usr/bin/env python3
r"""tools/where.py - where on the Kuiper is a page? Every commit that touched a path, and its keys.

A page in a repository is not a place on the wafer: it is a scatter of places, one run of keys for
every commit that ever touched it. This asks git which commits those were and cosmos/wafer.tsv
where each of them landed, and it invents nothing in between. A commit git knows about that the
wafer has never seen is reported as unmatched, never quietly dropped: the harvest and the clone are
taken at different moments and the difference is a measurement, not an error to be hidden.

THE KEY ARITHMETIC IS THE PAGE'S OWN. Walking cosmos/wafer.tsv in order, a cursor takes the
unissued keys of the silence before a commit and then the commit's own issued keys:

    k += gap_before ; first_key = k ; k += lines ; last_key = k

That is line for line what index.html does when it builds its commit table, so the tool and the
page cannot drift apart without one of them failing the other's self test. That is the whole point.

    python tools/where.py globalgrid2050 conductor_resistances
    python tools/where.py --five                     the five pages Vikram flagged, and write the data
    python tools/where.py <repo> <prefix> --write    write cosmos/tracked.tsv and cosmos/tracked-commits.tsv
    python tools/where.py --apps                     which pieces of work belong to each application

Writes  cosmos/tracked.tsv           one row per tracked path: counts, key range, dates, and its use
        cosmos/tracked-commits.tsv   one row per commit of a tracked path: sha, keys, lines

WHAT MAY BE USED, AND WHAT MAY NOT. The `use` column is not decoration. It carries the decision made
in ORDERS.md blocks M2 to M4 next to the data itself, so nothing can be pulled into the engine by a
later reader who never saw the orders. The two price estimators are tracked and nothing more:
prices are the most sensitive thing in this estate, and a position on a wafer is not a price.
"""
import io
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.join(HERE, '..')
COSMOS = os.path.join(KB, 'cosmos')
CLONES = os.path.join(KB, '..')

# The five pages of block M, with what each may be used for. Order as Vikram listed them.
FIVE = [
    ('globalgrid2050', 'conductor_resistances', 'engine: class 2 plain copper and aluminium only, cited as his page'),
    ('globalgrid2050', 'ac_cables_knowledge', 'link out: real sizing is a job, here are the tools'),
    ('globalgrid2050', 'dc_cables_knowledge', 'link home: DC cable risk, the article and the arc protection repository'),
    ('globalgrid2050', '33kv_uk_dap_price_estimator', 'TRACKED ONLY: never in the engine, prices are out of scope'),
    ('globalgrid2050', 'lv_ac_dc_price_estimator', 'TRACKED ONLY: never in the engine, prices are out of scope'),
]


def rows(path):
    return [l.rstrip('\n').split('\t') for l in io.open(path, encoding='utf-8')
            if l.strip() and not l.startswith('#')]


def wafer():
    """Every commit on the wafer, in the order time issued it, with the keys it was given."""
    out, k = {}, 0
    order = []
    for p in rows(os.path.join(COSMOS, 'wafer.tsv')):
        unix, lines, repo, sha, gap = int(p[0]), int(p[1]), int(p[2]), p[3], int(p[4])
        k += gap
        k0 = k
        k += lines
        out[sha] = {'unix': unix, 'lines': lines, 'repo': repo, 'sha': sha, 'k0': k0, 'k1': k}
        order.append(sha)
    return out, order


def repo_index(name):
    for p in rows(os.path.join(COSMOS, 'repos.tsv')):
        if p[1].lower() == name.lower():
            return int(p[0])
    return None


def touched(repo, prefix):
    """The commits git says touched this path, newest first, as (sha12, unix)."""
    d = os.path.join(CLONES, repo)
    if not os.path.isdir(os.path.join(d, '.git')):
        print('REFUSED: no clone of %s at %s' % (repo, d))
        return None
    r = subprocess.run(['git', 'log', '--format=%H%x09%at', '--', prefix],
                       cwd=d, capture_output=True, text=True, timeout=300)
    if r.returncode:
        print('REFUSED: git log failed in %s: %s' % (d, r.stderr.strip()[:200]))
        return None
    got = []
    for line in r.stdout.splitlines():
        if '\t' in line:
            sha, at = line.split('\t')
            got.append((sha[:12], int(at)))
    return got


def look(repo, prefix, W, quiet=False):
    ri = repo_index(repo)
    git = touched(repo, prefix)
    if git is None or ri is None:
        if ri is None:
            print('REFUSED: no repository called %s on this wafer' % repo)
        return None
    on, off = [], []
    for sha, at in git:
        c = W.get(sha)
        (on if (c and c['repo'] == ri) else off).append(c if c else {'sha': sha, 'unix': at})
    on.sort(key=lambda c: c['k0'])
    rec = {'repo': repo, 'path': prefix, 'in_git': len(git), 'on_wafer': len(on), 'unmatched': len(off),
           'lines': sum(c['lines'] for c in on), 'commits': on,
           'k0': on[0]['k0'] if on else 0, 'k1': on[-1]['k1'] if on else 0,
           'first_unix': min((c['unix'] for c in on), default=0),
           'last_unix': max((c['unix'] for c in on), default=0)}
    if not quiet:
        print('\n%s / %s' % (repo, prefix))
        print('  %d commits in git, %d of them on the wafer, %d not harvested yet' % (rec['in_git'], rec['on_wafer'], rec['unmatched']))
        print('  %s lines, first key %s, last key %s' % (f"{rec['lines']:,}", f"{rec['k0']:,}", f"{rec['k1']:,}"))
        for c in on[:4] + ([{'sha': '...', 'unix': 0, 'lines': 0, 'k0': 0, 'k1': 0}] if len(on) > 8 else []) + on[-4:] if len(on) > 8 else on:
            if c['sha'] == '...':
                print('       ...')
            else:
                print('    %s  %s  %6d lines  keys %s .. %s'
                      % (c['sha'], __import__('datetime').datetime.utcfromtimestamp(c['unix']).strftime('%Y-%m-%d'),
                         c['lines'], f"{c['k0']:,}", f"{c['k1']:,}"))
    return rec


def write(recs, uses):
    import datetime
    day = lambda u: datetime.datetime.utcfromtimestamp(u).strftime('%Y-%m-%d') if u else '-'
    t = ['# repo\tpath\tuse\tcommits_in_git\tcommits_on_the_wafer\tlines_in_those_commits\tfirst_key\tlast_key\tfirst_date\tlast_date']
    c = ['# path\tsha12\tunix\tlines\tfirst_key\tlast_key']
    for r in recs:
        t.append('\t'.join(str(x) for x in [r['repo'], r['path'], uses.get(r['path'], 'tracked'), r['in_git'],
                                            r['on_wafer'], r['lines'], r['k0'], r['k1'],
                                            day(r['first_unix']), day(r['last_unix'])]))
        for x in r['commits']:
            c.append('\t'.join(str(v) for v in [r['path'], x['sha'], x['unix'], x['lines'], x['k0'], x['k1']]))
    io.open(os.path.join(COSMOS, 'tracked.tsv'), 'w', encoding='utf-8', newline='\n').write('\n'.join(t) + '\n')
    io.open(os.path.join(COSMOS, 'tracked-commits.tsv'), 'w', encoding='utf-8', newline='\n').write('\n'.join(c) + '\n')
    print('\ncosmos/tracked.tsv: %d paths' % len(recs))
    print('cosmos/tracked-commits.tsv: %d commits' % (len(c) - 1))


APPS = r'E:\kuiper-iterations\APPS\apps.tsv'


def apps_mode():
    """cosmos/app-commits.tsv: app, commit. Git says which commits touched an application's folders;
    only those this record holds are written, and both counts are said."""
    import subprocess
    on_record = set()
    for l in io.open(os.path.join(COSMOS, 'wafer.tsv'), encoding='utf-8'):
        if l.strip() and not l.startswith('#'):
            on_record.add(l.split('\t')[3])
    rows, said = [], []
    for l in io.open(APPS, encoding='utf-8'):
        p = l.rstrip('\n').split('\t')
        if len(p) < 5 or p[0] == 'app':
            continue
        app, repo, folders = p[0], p[2].split('/')[-1], [x for x in p[3].split(';') if x.strip()]
        # the clone of the main site is a worktree under another name; every other clone is named as its repository
        d = next((c for c in (os.path.join(KB, '..', repo), os.path.join(KB, '..', '_wt-estate'))
                  if os.path.isdir(os.path.join(c, '.git')) or os.path.isfile(os.path.join(c, '.git'))), None)
        if not d:
            said.append('%-16s no clone of %s here' % (app, repo))
            continue
        out = subprocess.run(['git', 'log', '--all', '--format=%H', '--'] + (folders or ['.']), cwd=d,
                             capture_output=True, text=True, encoding='utf-8', errors='replace').stdout.split()
        shas = sorted({h[:12] for h in out})
        held = [h for h in shas if h in on_record]
        rows += ['%s\t%s' % (app, h) for h in held]
        said.append('%-16s %5d pieces of work by git, %5d of them on this record' % (app, len(shas), len(held)))
    io.open(os.path.join(COSMOS, 'app-commits.tsv'), 'w', encoding='utf-8', newline='\n').write(
        '# app\tcommit\n' + '\n'.join(rows) + '\n')
    # ONE PROGRAM FOR EVERY APPLICATION, AS DATA. Which work it selects, where its pulse starts and
    # how long the front takes to cross the record, what a dot looks like off and on, and what is
    # offered at the end. The page runs these and knows none of them by name; a later program - a
    # shape to gather into, a different front - is a new entry here and no new code there.
    import json
    progs = []
    for l in io.open(APPS, encoding='utf-8'):
        p = l.rstrip('\n').split('\t')
        if len(p) < 5 or p[0] == 'app' or not any(r.startswith(p[0] + '\t') for r in rows):
            continue
        progs.append({'name': p[0], 'button': p[1], 'select': {'app': p[0]},
                      'pulse': {'origin': 'centre', 'seconds': 1.5},
                      'off': {'dim': 0.10},
                      # on: the colour, and how LOUD: the size of a spark in pixels, its brightness, and how
                      # many sparks one piece of work may throw. Louder or quieter is an edit here.
                      'on': {'colour': [0.13, 0.93, 0.47], 'size': 10, 'bright': 0.85, 'sparks': 10,
                             # after the dark falls: a smaller Kuiper of the application's own work, held, then its name
                             'sequence': [{'shape': 'cluster', 'hold_ms': 1500}, {'shape': 'text', 'hold_ms': 900}]},
                      'end': {'tile': p[4]}})
    json.dump({'schema': 'kuiper-program.v1',
               'what_it_is': 'What is shown when a button is pressed: the work selected, how the pulse '
                             'travels, how a dot looks off and on, and what is offered at the end.',
               'programs': progs},
              io.open(os.path.join(COSMOS, 'programs.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    said.append('written: cosmos/programs.json, %d programs' % len(progs))
    print('\n'.join(said))
    print('written: cosmos/app-commits.tsv, %d rows' % len(rows))
    return 0


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--apps':
        return apps_mode()
    W, _ = wafer()
    if argv[0] == '--five':
        recs = [r for r in (look(rp, pf, W) for rp, pf, _u in FIVE) if r]
        write(recs, {pf: u for _r, pf, u in FIVE})
        return 0 if len(recs) == len(FIVE) else 2
    repo, prefixes = argv[0], [a for a in argv[1:] if not a.startswith('--')]
    if not prefixes:
        print('REFUSED: give at least one path prefix')
        return 2
    recs = [r for r in (look(repo, p, W) for p in prefixes) if r]
    if '--write' in argv:
        write(recs, {})
    return 0 if len(recs) == len(prefixes) else 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
