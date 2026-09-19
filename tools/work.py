#!/usr/bin/env python3
r"""tools/work.py - for every piece of public work: the code files it changed, and where in each.

THE ORDER (Vikram, by way of the Supervisor, 20 Sept): "The pop up card doesn't show code from GitHub,
this is already built in wafer iterations". A tap on the Kuiper lands on a PIECE OF WORK, a commit. So
the small, honest first stage is one table: commit -> the code files that piece of work CHANGED, each
with the first line it changed. The card then reads that file from the public repository at that exact
commit, the wafer's way, and shows the lines around the change. True wording on the card: "This piece
of work changed N files. Showing <file>."

WHAT IS IN IT. Only repositories GitHub says are public. Only files that are code or pages a person
reads (the same rule the carried cards keep: code, never data). A path that trips the digest guard is
left out. The full commit id is kept because the raw file address needs it.

WHAT IS WRITTEN. cosmos/kuiper-work.mjs, one module: a table keyed by the twelve letter commit id the
record uses, loaded only when a dot is first tapped. One file, so it can be released as ONE part.

    python tools/work.py                 build it, and say how big it is and how much of the record it reaches
    python tools/work.py --selftest      the first changed line of a known change is found
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
sys.path.insert(0, HERE)
from check_proof import leaks

CODE = ('.js', '.mjs', '.ts', '.html', '.htm', '.css', '.py', '.md', '.yml', '.yaml', '.sh', '.ps1', '.glsl', '.sql', '.toml')
MOST = 8                                       # files named per piece of work; the count of all of them is kept
HUNK = re.compile(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@')


def changes(clone):
    """{full sha: [(path, first changed line)]} for code files, from ONE git log over the repository.
    Only the headers of each change are kept; the changed text itself is read and thrown away."""
    p = subprocess.Popen(['git', 'log', '--all', '--no-color', '--no-renames', '-U0', '--format=%x01%H', '--'] + ['*' + e for e in CODE],
                         cwd=clone, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    out, sha, path = {}, None, None
    for raw in p.stdout:
        if raw[:1] == b'\x01':
            sha, path = raw[1:].strip().decode('ascii', 'replace'), None
            out.setdefault(sha, [])
        elif raw.startswith(b'+++ '):
            t = raw[4:].strip().decode('utf-8', 'replace')
            path = t[2:] if t.startswith('b/') else None         # /dev/null: the file was removed
        elif raw.startswith(b'@@') and sha and path:
            m = HUNK.match(raw.decode('ascii', 'replace'))
            if m and (m.group(2) is None or int(m.group(2)) > 0):  # a change that leaves lines behind
                if not any(x[0] == path for x in out[sha]):
                    out[sha].append((path, int(m.group(1))))
    p.wait()
    return out


def build():
    pub = {p[0]: p[1] for p in (l.rstrip('\n').split('\t') for l in io.open(os.path.join(COSMOS, 'public.tsv'), encoding='utf-8')
                                if l.strip() and not l.startswith('#')) if len(p) > 2 and p[2] == 'yes'}
    repos = {l.split('\t')[0]: l.split('\t')[1] for l in io.open(os.path.join(COSMOS, 'repos.tsv'), encoding='utf-8')
             if l.strip() and not l.startswith('#')}
    on_record = {}
    for l in io.open(os.path.join(COSMOS, 'wafer.tsv'), encoding='utf-8'):
        if l.strip() and not l.startswith('#'):
            p = l.rstrip('\n').split('\t')
            on_record.setdefault(p[2], set()).add(p[3])
    table, total, reached, public_total = {}, 0, 0, 0
    for idx, name in repos.items():
        n_here = len(on_record.get(idx, ()))
        total += n_here
        clone = os.path.join(KB, '..', name)
        if name not in pub or not os.path.isdir(os.path.join(clone, '.git')):
            continue
        public_total += n_here
        got = 0
        for sha, files in changes(clone).items():
            if sha[:12] not in on_record.get(idx, ()) or not files:
                continue
            files = [(p, ln) for p, ln in files if not leaks(p)]
            if not files:
                continue
            table[sha[:12]] = [sha, len(files)] + [[p, ln] for p, ln in files[:MOST]]
            got += 1
        reached += got
        print('  %-52s %5d of %5d pieces of work changed code' % (name, got, n_here))
    body = ('// kuiper-work.mjs - for every piece of public work, the code files it changed and the first line changed in\n'
            '// each. Built by tools/work.py from git, public repositories only, code never data. Loaded when a dot is tapped.\n'
            '// twelve letter commit id -> [full commit id, how many code files changed, [path, first changed line], ...]\n'
            'export const WORK = ' + json.dumps(table, separators=(',', ':'), ensure_ascii=False) + ';\n')
    out = os.path.join(COSMOS, 'kuiper-work.mjs')
    io.open(out, 'w', encoding='utf-8', newline='\n').write(body)
    import gzip
    print('\nOF %s PIECES OF WORK ON THE RECORD (%s in public repositories)' % (format(total, ','), format(public_total, ',')))
    print('  %6s changed code a card can show' % format(reached, ','))
    print('  %6s in public repositories changed only data, pictures or nothing a card shows' % format(public_total - reached, ','))
    print('  written: %s, %.2f MB (%.2f MB as a browser receives it)' % (out, len(body.encode('utf-8')) / 1e6, len(gzip.compress(body.encode('utf-8'))) / 1e6))
    return 0


def selftest():
    h = HUNK.match('@@ -10,2 +12,3 @@ function x(){')
    ok1 = bool(h) and int(h.group(1)) == 12
    h2 = HUNK.match('@@ -5 +5 @@')
    ok2 = bool(h2) and int(h2.group(1)) == 5 and h2.group(2) is None
    h3 = HUNK.match('@@ -7,3 +6,0 @@')
    ok3 = bool(h3) and int(h3.group(2)) == 0                      # a pure removal leaves no line to show
    got = changes(KB)
    ok4 = any(files for files in got.values())
    for what, ok in (('the first changed line is read from a change header', ok1), ('a one line change has no count and is still read', ok2),
                     ('a pure removal is recognised, and offers no line', ok3), ('this repository\'s own work is found', ok4)):
        print('%s  %s' % ('pass' if ok else 'FAIL', what))
    good = ok1 and ok2 and ok3 and ok4
    print('SELFTEST %s' % ('PASS' if good else 'FAIL'))
    return 0 if good else 1


if __name__ == '__main__':
    sys.exit(selftest() if sys.argv[1:2] == ['--selftest'] else build())
