#!/usr/bin/env python3
r"""tools/link.py - the Kuiper's link contract, on this side of the wire.

THE PROBLEM THIS SOLVES. A deep link is an agreement between whoever writes the address and whoever
reads it. When the two live apart and nothing holds them together they drift, and the drift is
invisible: the link still looks like a link. In the grid engine the same shape of agreement, between
two codebases that never imported each other, stopped agreeing and a third of a register reported a
layer as shown while it sat switched off.

So there is ONE table of parameters, written to cosmos/link-contract.json, and two implementations
of the same two functions - one in the page, one here - that are pinned to each other by the
examples in that file. If either side changes its rule, the examples stop matching and a self test
fails before anybody publishes anything.

    python tools/link.py --write                 write cosmos/link-contract.json
    python tools/link.py key=9128980453          the address for that request
    python tools/link.py "?key=123&path=a b"     what that address asks for
    python tools/link.py --selftest              build, parse, and the examples on file
"""
import io
import json
import os
import sys
from urllib.parse import urlsplit, parse_qsl, unquote_plus

HERE = os.path.dirname(os.path.abspath(__file__))
COSMOS = os.path.join(HERE, '..', 'cosmos')
OUT = os.path.join(COSMOS, 'link-contract.json')

# THE PARAMETERS, AS DATA. A new one is a row here, not a new idea anywhere.
PARAMS = [
    ('key', 'whole number', 'one line of one piece of work'),
    ('path', 'text', 'a file or folder whose work is highlighted'),
    ('selftest', 'text', 'ask the page to check itself and say so in its title'),
]
KINDS = {k: kind for k, kind, _ in PARAMS}

# FORM ENCODING, SPELLED OUT. The browser's own URLSearchParams leaves letters, digits and * - . _
# alone, writes a space as +, and percent encodes everything else as upper case UTF-8 bytes. Python's
# quote_plus differs on two characters, and two characters is all it takes for an address built here
# to stop being the address built there.
SAFE = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*-._')


def enc(text):
    out = []
    for ch in str(text):
        if ch in SAFE:
            out.append(ch)
        elif ch == ' ':
            out.append('+')
        else:
            out.extend('%%%02X' % b for b in ch.encode('utf-8'))
    return ''.join(out)


def build(asked, base=''):
    """The address for a request. Refuses a parameter nobody reads: a link that carries something
    unknown looks like it works and does nothing."""
    for k in asked:
        if k not in KINDS:
            raise ValueError('no parameter called %s; the contract has %s' % (k, ', '.join(KINDS)))
    bits = []
    for k, kind, _note in PARAMS:                    # the contract's order, never the caller's
        v = asked.get(k)
        if v is None or v == '':
            continue
        if kind == 'whole number' and not str(v).isdigit():
            raise ValueError('%s is a whole number, not %r' % (k, v))
        bits.append(enc(k) + '=' + enc(v))
    return base + ('?' + '&'.join(bits) if bits else '')


def parse(href):
    """What an address asks for. Every parameter is answered, with None for one that is not there,
    so a caller can never mistake absent for empty."""
    q = urlsplit(str(href)).query
    got = dict(parse_qsl(q, keep_blank_values=True))
    out = {}
    for k, kind, _note in PARAMS:
        raw = got.get(k)
        if raw is None or raw == '':
            out[k] = None
        elif kind == 'whole number':
            out[k] = int(raw) if raw.isdigit() else None
        else:
            out[k] = raw
    return out


EXAMPLES = [
    {'key': 9128980453},
    {'key': 2},
    {'path': 'solar-bess-topology-v5/cable-geometry-visualiser-v5.html'},
    {'path': 'a folder with spaces & an ampersand'},
    {'path': 'café/ångström'},
    {'selftest': 'card'},
    {'key': 9128980453, 'path': 'conductor_resistances', 'selftest': 'phone'},
    {},
]


def table():
    return {
        'schema': 'kuiper-link.v1',
        'what_it_is': 'The parameters a link to this page may carry, and examples of the addresses '
                      'they make. The page and the tools build and read addresses from this table '
                      'and from nothing else.',
        'params': {k: {'kind': kind, 'note': note} for k, kind, note in PARAMS},
        'order': [k for k, _1, _2 in PARAMS],
        'examples': [{'asked': e, 'built': build(e)} for e in EXAMPLES],
    }


def write():
    os.makedirs(COSMOS, exist_ok=True)
    json.dump(table(), io.open(OUT, 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
    print('%d parameters, %d examples written to %s' % (len(PARAMS), len(EXAMPLES), OUT))
    return 0


def selftest():
    bad = 0
    for e in EXAMPLES:
        href = build(e)
        back = parse(href)
        want = {k: e.get(k) for k, _1, _2 in PARAMS}
        want = {k: (None if v is None or v == '' else v) for k, v in want.items()}
        ok = back == want
        print('%s  %-58s %s' % ('pass' if ok else 'FAIL', href or '(no parameters)',
                                '' if ok else 'came back as %r, asked for %r' % (back, want)))
        if not ok:
            bad += 1
    try:
        build({'colour': 'green'})
        print('FAIL  a parameter nobody reads was accepted')
        bad += 1
    except ValueError:
        print('pass  a parameter nobody reads is refused')
    try:
        build({'key': 'twelve'})
        print('FAIL  a key that is not a whole number was accepted')
        bad += 1
    except ValueError:
        print('pass  a key that is not a whole number is refused')
    if os.path.exists(OUT):
        # THE FILE ON DISK IS WHAT THE PAGE READS. If this rule has changed since it was written,
        # the page and this tool are building different addresses and nobody would see it.
        on_file = json.load(io.open(OUT, encoding='utf-8'))
        drift = [x for x in on_file.get('examples', []) if build(x['asked']) != x['built']]
        print('%s  every example on file is still what this rule builds%s'
              % ('pass' if not drift else 'FAIL',
                 '' if not drift else ': ' + ', '.join(x['built'] for x in drift)))
        if drift:
            bad += 1
    print('SELFTEST %s' % ('PASS' if bad == 0 else 'FAIL'))
    return 1 if bad else 0


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--selftest':
        return selftest()
    if argv[0] == '--write':
        return write()
    a = argv[0]
    if a.startswith('?') or a.startswith('http'):
        for k, v in sorted(parse(a).items()):
            print('%-10s %s' % (k, 'not asked for' if v is None else v))
        return 0
    asked = {}
    for bit in argv:
        if '=' not in bit:
            print('REFUSED: give name=value, or an address beginning with ?')
            return 2
        k, v = bit.split('=', 1)
        asked[k] = int(v) if KINDS.get(k) == 'whole number' and v.isdigit() else v
    print(build(asked))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
