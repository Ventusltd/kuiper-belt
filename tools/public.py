#!/usr/bin/env python3
r"""tools/public.py - say, for every repository on the wafer, who owns it and whether it is public.

THE MANUAL STEP THIS REMOVES. The page wants to offer a link to a piece of work on GitHub. A link is
only honest for a repository that is provably public: for anything else the address itself leaks a
private name to anybody who reads the page source, and the link goes to a 404 for everyone but its
owner. Until now the answer lived in the Python and was asked once, by hand, while a card was built.
This writes it down as data the page can read, so the rule "no link unless it is provably public"
is applied to every repository at once and can be checked by anybody.

PROVABLY PUBLIC MEANS GITHUB SAID SO. The owner comes from the clone's own origin remote and the
visibility from `gh repo list`. Anything the pair cannot answer for is written as not public, with
no owner, and the page draws no link. Silence is the safe answer and the only one that cannot leak.

    python tools/public.py              write cosmos/public.tsv
    python tools/public.py --selftest   a repository that cannot be proved public must come out "no"
"""
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.join(HERE, '..')
COSMOS = os.path.join(KB, 'cosmos')
sys.path.insert(0, HERE)
from pulse import public_repos, repo_name_of

OUT = os.path.join(COSMOS, 'public.tsv')


def rows(names, pub):
    """(name, owner, public) for each repository, in the order it was given."""
    out = []
    for name in names:
        d = os.path.join(KB, '..', name)
        owner, yes = '', False
        if os.path.isdir(os.path.join(d, '.git')):
            full = repo_name_of(d, name) or ''
            if pub.get(full.lower(), pub.get(full.split('/')[-1].lower(), False)) and '/' in full:
                owner, yes = full.split('/')[0], True
        out.append((name, owner, 'yes' if yes else 'no'))
    return out


def build():
    names = [l.split('\t')[1] for l in io.open(os.path.join(COSMOS, 'repos.tsv'), encoding='utf-8')
             if l.strip() and not l.startswith('#')]
    r = rows(names, public_repos())
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(
        '# name\towner\tpublic\n' + '\n'.join('\t'.join(x) for x in r) + '\n')
    n = sum(1 for x in r if x[2] == 'yes')
    print('%d repositories, %d provably public, %d not' % (len(r), n, len(r) - n))
    print('  written to %s' % OUT)
    print('  a repository that is not provably public gets no owner and no link on any page')
    return 0


def selftest():
    """A name nothing can answer for must come out "no", with no owner to leak."""
    pub = {'ventusltd/kuiper-belt': True}
    got = rows(['a-name-that-is-not-a-clone-here'], pub)
    ok1 = got == [('a-name-that-is-not-a-clone-here', '', 'no')]
    print('%s  a repository that cannot be proved public is written as not public, with no owner: %s'
          % ('pass' if ok1 else 'FAIL', got))
    real = public_repos()
    ok2 = any(v for v in real.values())
    print('%s  GitHub answered about %d names' % ('pass' if ok2 else 'FAIL', len(real)))
    # and the file on disk, if it exists, may never carry an owner for a repository marked not public
    ok3 = True
    if os.path.exists(OUT):
        for l in io.open(OUT, encoding='utf-8'):
            if l.startswith('#') or not l.strip():
                continue
            name, owner, yes = (l.rstrip('\n').split('\t') + ['', ''])[:3]
            if yes != 'yes' and owner:
                print('    FAIL: %s is not public and yet carries an owner' % name)
                ok3 = False
    print('%s  nothing that is not public carries an owner in the file' % ('pass' if ok3 else 'FAIL'))
    print('SELFTEST %s' % ('PASS' if ok1 and ok2 and ok3 else 'FAIL'))
    return 0 if ok1 and ok2 and ok3 else 1


def main(argv):
    if argv and argv[0] == '--selftest':
        return selftest()
    return build()


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
