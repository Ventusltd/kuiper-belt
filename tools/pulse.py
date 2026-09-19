#!/usr/bin/env python3
r"""tools/pulse.py - send an iteration's new lines through the whole estate and see what comes back.

THE QUESTION THIS ANSWERS. An iteration adds lines. Some of them are genuinely new work. Some of them
are a thing this estate already had, written again by somebody who did not know it was there. The
stone "reuse before rebuild" was written about a whole night lost that way. A count settles it.

HOW A LINE IS KEYED. A line is stripped, its runs of whitespace collapsed to one space, and the
result hashed. Two lines have the same key when they say the same thing with the same spelling;
indentation and trailing spaces do not change it. Blank lines, and lines with less than MIN_REAL
characters left after the punctuation is taken out, are not keyed at all: `}`, `</div>` and `import os`
are shared by everything and would drown the answer. A key is a fact about text, not about authorship.

THE INDEX. `python tools/pulse.py --index` walks every local clone, reads the blobs of its HEAD tree
through `git cat-file --batch`, and writes, on the E: drive and nowhere else:

    E:\kuiper-iterations\INDEX\keys.u64      every distinct line key in the estate, sorted
    E:\kuiper-iterations\INDEX\where.u32     for each key, the row of places.tsv it was first seen in
    E:\kuiper-iterations\INDEX\places.tsv    repository, path  -- or PRIVATE and the path withheld

WHAT MAY BE SAID OUT LOUD. A repository this account cannot prove is public is treated as private:
it is counted, it is never named, and its paths are not written down, in the index or in the output.
That is the safe direction to fail in, so `gh` being absent or offline makes the answer quieter, never
louder. Every line of PULSE.md is passed through the same digest guard the publisher uses.

    python tools/pulse.py --index            build or refresh the estate's line index (minutes, free)
    python tools/pulse.py NNNN               pulse iteration NNNN, write PULSE.md beside it
    python tools/pulse.py --selftest         a known line of a known public repository must be found
"""
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import time
from array import array

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.join(HERE, '..')
CLONES = os.path.join(KB, '..')
ROOT = r'E:\kuiper-iterations'
INDEX = os.path.join(ROOT, 'INDEX')
MIN_REAL = 24                     # characters of substance a line needs before it is worth keying
PER_REPO_SECONDS = 6              # what one clone may cost a scope question before it is cut short
FARADAY_FROM = 16                 # ORDERS block I: the experiments carry on from fifteen

sys.path.insert(0, HERE)
from check_proof import leaks

WS = re.compile(r'\s+')
PUNCT = re.compile(r'[^0-9A-Za-z]+')


def key(line):
    """The key of a line, or None if the line is too slight to be evidence of anything."""
    t = WS.sub(' ', line.strip())
    if len(PUNCT.sub('', t)) < MIN_REAL:
        return None
    return int.from_bytes(hashlib.blake2b(t.encode('utf-8', 'replace'), digest_size=8).digest(), 'big')


def git(d, *a, **kw):
    return subprocess.run(['git'] + list(a), cwd=d, capture_output=True, timeout=kw.get('timeout', 600))


def public_repos():
    """Which clones can be proved public, keyed by owner/name AND by bare name, both lower case.

    A FOLDER NAME IS NOT A REPOSITORY NAME. The first version of this asked GitHub for a list and
    matched it against the directory on disk, exactly. GitHub answers `kuiper-belt`; the folder is
    `Kuiper-belt`; nothing matched, and this repository was indexed as private along with every
    other one whose capitals differ. Nothing leaked, because unproved means private and private
    means unnamed, but the estate went quiet about work that is public and citable, which is the
    whole point of the exercise. The name a clone answers to is the one in its own origin remote.
    """
    cache = os.path.join(INDEX, 'visibility.tsv')
    seen = {}
    if os.path.exists(cache) and time.time() - os.path.getmtime(cache) < 86400:
        for line in io.open(cache, encoding='utf-8'):
            if '\t' in line:
                full, vis = line.rstrip('\n').split('\t')[:2]
                seen[full.lower()] = vis.strip() == 'public'
                seen[full.split('/')[-1].lower()] = vis.strip() == 'public'
        return seen
    out = {}
    r = subprocess.run(['gh', 'repo', 'list', '--limit', '500', '--json', 'nameWithOwner,visibility'],
                       capture_output=True, text=True, timeout=180)
    if r.returncode == 0:
        for e in json.loads(r.stdout or '[]'):
            out[e['nameWithOwner']] = e['visibility'].lower() == 'public'
    os.makedirs(INDEX, exist_ok=True)
    io.open(cache, 'w', encoding='utf-8', newline='\n').write(
        '\n'.join('%s\t%s' % (n, 'public' if ok else 'private') for n, ok in sorted(out.items())) + '\n')
    for n, ok in out.items():
        seen[n.lower()] = ok
        seen[n.split('/')[-1].lower()] = ok
    print('visibility: %d repositories, %d of them public' % (len(out), sum(1 for v in out.values() if v)))
    return seen


def repo_name_of(d, folder):
    """What a clone calls itself: owner/name from its origin remote, or the folder if it has none."""
    r = git(d, 'remote', 'get-url', 'origin')
    if r.returncode == 0:
        u = re.sub(r'\.git$', '', r.stdout.decode('utf-8', 'replace').strip())
        m = re.search(r'[:/]([^/:]+)/([^/]+)$', u)
        if m:
            return '%s/%s' % (m.group(1), m.group(2))
    return folder


def build_index():
    os.makedirs(INDEX, exist_ok=True)
    pub = public_repos()
    keys, where, places = array('Q'), array('I'), []
    t0 = time.time()
    for name in sorted(os.listdir(CLONES)):
        d = os.path.join(CLONES, name)
        if not os.path.isdir(os.path.join(d, '.git')):
            continue
        full = repo_name_of(d, name)
        is_pub = pub.get(full.lower(), pub.get(full.split('/')[-1].lower(), False))
        cite = full.split('/')[-1]                   # cite the repository, not the folder it sits in
        r = git(d, 'ls-tree', '-r', '-z', 'HEAD')
        if r.returncode:
            continue
        blobs = []
        for e in r.stdout.decode('utf-8', 'replace').split('\x00'):
            if not e:
                continue
            meta, _, path = e.partition('\t')
            bits = meta.split()
            if len(bits) >= 3 and bits[1] == 'blob':
                blobs.append((bits[2], path))
        if not blobs:
            continue
        # ONE SHA AT A TIME, AND READ THE ANSWER BEFORE ASKING AGAIN. Writing every sha first and
        # reading afterwards deadlocks the moment a repository is big enough to fill the pipe: git
        # stops reading our list because nothing drains its output, and we stop writing because
        # nothing drains our input, and both wait for ever. Small repositories hid it; the first
        # large one stopped dead for ten minutes without a word. Ask, read, ask.
        p = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=d, stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE)
        for sha, path in blobs:
            try:
                p.stdin.write((sha + '\n').encode())
                p.stdin.flush()
            except (BrokenPipeError, OSError):
                break
            head = p.stdout.readline()
            if not head:
                break
            try:
                size = int(head.split()[-1])
            except (ValueError, IndexError):
                break
            body = p.stdout.read(size)
            p.stdout.read(1)
            if b'\x00' in body[:8000]:
                continue
            place = len(places)
            places.append((cite if is_pub else 'PRIVATE', path if is_pub else ''))
            for line in body.decode('utf-8', 'replace').splitlines():
                k = key(line)
                if k is not None:
                    keys.append(k)
                    where.append(place)
        try:
            p.stdin.close()
        except OSError:
            pass
        p.wait()
        print('  %-52s %s  %s lines so far' % (name, 'public ' if is_pub else 'private', f'{len(keys):,}'))
    # SORTING TWENTY FIVE MILLION KEYS THE OBVIOUS WAY WOULD COST MORE MEMORY THAN THE MACHINE HAS.
    # sorted(range(n), key=...) builds a list of n Python integers, about a gigabyte at this size, on a
    # machine that is already half full and running headless browsers. numpy sorts the raw 8 byte keys
    # in place instead, which is 200 megabytes of key and 200 of index, and it is the only arithmetic
    # here that is not a comparison: the keys themselves are made by hashlib, never by a model.
    import numpy as np
    if not len(keys):
        print('REFUSED: no lines were read; nothing to index')
        return 2
    k = np.frombuffer(memoryview(keys), dtype=np.uint64).copy()
    w = np.frombuffer(memoryview(where), dtype=np.uint32).copy()
    o = np.argsort(k, kind='stable')
    k, w = k[o], w[o]
    del o
    first = np.empty(len(k), dtype=bool)
    first[0] = True
    np.not_equal(k[1:], k[:-1], out=first[1:])       # one row per DISTINCT key: the first place it was seen
    ks, ws = k[first], w[first]
    ks.tofile(os.path.join(INDEX, 'keys.u64'))
    ws.tofile(os.path.join(INDEX, 'where.u32'))
    io.open(os.path.join(INDEX, 'places.tsv'), 'w', encoding='utf-8', newline='\n').write(
        '\n'.join('%s\t%s' % pl for pl in places) + '\n')
    print('\n%s distinct line keys from %s kept lines, %d files, %d seconds'
          % (f'{len(ks):,}', f'{len(keys):,}', len(places), round(time.time() - t0)))
    return 0


def load_index():
    kp = os.path.join(INDEX, 'keys.u64')
    if not os.path.exists(kp):
        return None
    import numpy as np
    ks = np.fromfile(kp, dtype=np.uint64)
    ws = np.fromfile(os.path.join(INDEX, 'where.u32'), dtype=np.uint32)
    pl = [l.rstrip('\n').split('\t') for l in io.open(os.path.join(INDEX, 'places.tsv'), encoding='utf-8')]
    return ks, ws, pl


def find(ks, k):
    import numpy as np
    i = int(np.searchsorted(ks, np.uint64(k)))
    return i if i < len(ks) and int(ks[i]) == k else -1


TEXT = ('.html', '.md', '.py', '.js', '.mjs', '.tsv', '.css', '.txt', '.json', '.yml')


def files_of(d):
    out = {}
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        if os.path.isfile(p) and f.lower().endswith(TEXT) and f not in ('verdict.json', 'swarm.json'):
            out[f] = io.open(p, encoding='utf-8', errors='replace').read().splitlines()
    return out


def parent_of(n):
    p = os.path.join(ROOT, '%04d' % n, 'PARENT.txt')
    if os.path.exists(p):
        t = io.open(p, encoding='utf-8').read().strip()
        if t.isdigit():
            return int(t)
    prev = [int(x) for x in os.listdir(ROOT) if re.match(r'^\d{4}$', x) and int(x) < n]
    return max(prev) if prev else None


def pulse(n):
    idx = load_index()
    if idx is None:
        print('REFUSED: no line index yet. Run  python tools/pulse.py --index  first (it is free and takes minutes).')
        return 2
    ks, ws, places = idx
    d = os.path.join(ROOT, '%04d' % n)
    par = parent_of(n)
    if par is None:
        print('REFUSED: iteration %04d has nothing to be compared with' % n)
        return 2
    now, before = files_of(d), files_of(os.path.join(ROOT, '%04d' % par))
    added, seen = [], set()
    for f, lines in now.items():
        old = set(before.get(f, []))
        for line in lines:
            if line not in old:
                added.append((f, line))
    # AN ITERATION IS NOT ALWAYS A PAGE. Some turns add no line to the folder at all because the work
    # went into a tool, and a pulse that read only the folder would report such a turn as nothing
    # happening. FILES.txt, if it is there, names the repository files that belong to this iteration,
    # one relative path a line. Whole file: a tool written this turn is new in its entirety.
    fl = os.path.join(d, 'FILES.txt')
    if os.path.exists(fl):
        for rel in io.open(fl, encoding='utf-8').read().split():
            fp = os.path.join(KB, rel)
            if os.path.isfile(fp):
                for line in io.open(fp, encoding='utf-8', errors='replace').read().splitlines():
                    added.append((rel, line))
    keyed, echoes, newly = 0, {}, 0
    priv = 0
    for f, line in added:
        k = key(line)
        if k is None:
            continue
        if k in seen:
            continue
        seen.add(k)
        keyed += 1
        i = find(ks, k)
        if i < 0:
            newly += 1
            continue
        repo, path = places[ws[i]]
        if repo == 'PRIVATE':
            priv += 1
        else:
            echoes['%s / %s' % (repo, path)] = echoes.get('%s / %s' % (repo, path), 0) + 1
    found = keyed - newly
    share = (100.0 * newly / keyed) if keyed else 0.0
    verdict = 'CONFIRMED' if share >= 80 else ('NO EFFECT' if share >= 40 else 'REFUTED')
    exp = FARADAY_FROM + n - 1
    top = sorted(echoes.items(), key=lambda kv: -kv[1])[:12]
    L = ['# PULSE %04d' % n, '',
         'The lines this iteration added, keyed by what they say and looked up across the whole estate.',
         'Iteration %04d against %04d, %s.' % (n, par, time.strftime('%Y-%m-%d %H:%M')), '',
         '| | |', '|---|---|',
         '| lines added | %s |' % f'{len(added):,}',
         '| of those, worth keying | %s |' % f'{keyed:,}',
         '| already somewhere in the estate | %s |' % f'{found:,}',
         '| genuinely new | %s (%.0f%%) |' % (f'{newly:,}', share),
         '| echoes in repositories that are not named | %s |' % f'{priv:,}', '']
    if top:
        L += ['## Where the estate had already said it', '',
              'Public repositories and paths only. A repository that cannot be proved public is counted above and not named here.', '',
              '| repository / path | lines |', '|---|---|']
        L += ['| %s | %d |' % (k, v) for k, v in top]
        L += ['']
    # TWO HALVES, TESTED SEPARATELY. L2's review of the first pulse: the hypothesis said the work was
    # new AND consistent, and only "new" was measured. They are different questions with different
    # evidence. New is a count of keys. Consistent is whether every settled fact that applies to a
    # page is still present in that page, word for word, out of FACTS.tsv, which L2 owns.
    facts, fbad, fchecked = os.path.join(ROOT, 'FACTS.tsv'), [], 0
    if os.path.exists(facts):
        for row in io.open(facts, encoding='utf-8'):
            if row.startswith('#') or row.count('\t') < 1:
                continue
            page, want = row.rstrip('\n').split('\t')[:2]
            if page not in now:
                continue
            fchecked += 1
            if not any(want in line for line in now[page]):
                fbad.append('%s no longer contains %s' % (page, want))
    consistent = ('NOT TESTED' if fchecked == 0 else ('CONFIRMED' if not fbad else 'REFUTED'))
    L += ['## Faraday experiment %d' % exp, '',
          '**Hypothesis, first half.** Iteration %04d is new work.' % n, '',
          '**Hypothesis, second half.** It is consistent with what the estate has already settled.', '',
          '**The second half, measured.** %s' % (
              'No settled fact in FACTS.tsv applies to a page this iteration touched, so this half is untested. '
              'That is a gap, not a pass.' if fchecked == 0 else
              ('All %d settled facts that apply are still present, word for word. Verdict CONFIRMED.' % fchecked
               if not fbad else
               '%d of %d settled facts are broken: %s. Verdict REFUTED.' % (len(fbad), fchecked, '; '.join(fbad[:4])))), '',
          '**Method.** Every line added against %04d is stripped, its whitespace collapsed and its content hashed.' % par,
          'Lines with less than %d characters of substance are not keyed, because a brace belongs to everything.' % MIN_REAL,
          'Each key is looked up in an index of every distinct line in every local clone at its HEAD.', '',
          '**Result, first half.** %s of %s keyed lines were already in the estate; %s were not.' % (f'{found:,}', f'{keyed:,}', f'{newly:,}'), '',
          '**Verdict on the first half: %s.** %s' % (verdict,
              'The work is new: four fifths or more of it had never been written here before.' if verdict == 'CONFIRMED'
              else ('Mixed: a substantial part of this was already in the estate, and is worth looking at before the next step.' if verdict == 'NO EFFECT'
                    else 'Most of this already existed somewhere in the estate. Reuse before rebuild: see the table above.')), '',
          '**Verdict on the second half: %s.**' % consistent, '',
          '**How this could be wrong.** A line can say the same thing in different words and be counted as new,',
          'and a line can be copied deliberately, which is reuse and not repetition. The count is of spellings, not of ideas.', '',
          'Provided as is, without warranty of any kind; a chart, not a design.']
    body = '\n'.join(L) + '\n'
    bad = leaks(body)
    if bad:
        print('REFUSED: the digest guard stopped the pulse: %s' % (bad if isinstance(bad, str) else str(bad)[:200]))
        return 2
    io.open(os.path.join(d, 'PULSE.md'), 'w', encoding='utf-8', newline='\n').write(body)
    print('PULSE %04d against %04d: %s added, %s keyed, %s already in the estate, %s new (%.0f%%)  verdict %s'
          % (n, par, f'{len(added):,}', f'{keyed:,}', f'{found:,}', f'{newly:,}', share, verdict))
    print('written to %s' % os.path.join(d, 'PULSE.md'))
    return 0


def selftest():
    """A line that is certainly in a public repository must be found, or the index is not an index."""
    idx = load_index()
    if idx is None:
        print('FAIL: no index to test')
        return 1
    ks, ws, places = idx
    # THE PROBE MUST BE A PUBLIC LINE. The first version of this test read a file of this very
    # repository, which `gh` reports as private: it would have passed while proving only that private
    # work is indexed, which is the one thing the output may never say. So the probe is chosen from a
    # repository that can be PROVED public, and the test is not just that the line is found but that
    # the index is willing to name where it is.
    pub = public_repos()
    bad, probed = 0, 0
    for name in sorted(os.listdir(CLONES)):
        d = os.path.join(CLONES, name)
        if probed >= 2 or not os.path.isdir(os.path.join(d, '.git')):
            continue
        full = repo_name_of(d, name)
        if not pub.get(full.lower(), pub.get(full.split('/')[-1].lower(), False)):
            continue
        cand = [f for f in sorted(os.listdir(d)) if f.lower().endswith(('.md', '.py', '.html')) and os.path.isfile(os.path.join(d, f))]
        if not cand:
            continue
        lines = [l for l in io.open(os.path.join(d, cand[0]), encoding='utf-8', errors='replace').read().splitlines()
                 if key(l) is not None]
        if not lines:
            continue
        probed += 1
        line = max(lines, key=len)
        i = find(ks, key(line))
        where_named = places[ws[i]][0] if i >= 0 else '-'
        ok = i >= 0 and where_named != 'PRIVATE'
        print('%s  %s / %s  %s' % ('pass' if ok else 'FAIL', name, cand[0],
                                   ('found, and named as %s' % where_named) if i >= 0
                                   else 'NOT FOUND in the estate index'))
        if not ok:
            bad += 1
    if probed == 0:
        print('FAIL: no public clone could be probed at all')
        bad += 1
    # and the opposite: a line that cannot be in the estate must not be found
    made_up = 'this exact sentence was invented by the pulse self test on %s and exists nowhere else' % time.time()
    if find(ks, key(made_up)) >= 0:
        print('FAIL: a line invented one moment ago was found in the estate index')
        bad += 1
    else:
        print('pass  a line invented one moment ago is not found')
    print('SELFTEST %s' % ('PASS' if bad == 0 else 'FAIL'))
    return 1 if bad else 0


# ONLY THE WORDS THAT MEAN NOTHING ANYWHERE. The first list here also threw out code, data, line and
# page, which are the words this estate is actually about: "key to code card tap a line" came back as
# the single word "card". A stopword list is for grammar, not for subject matter. Rarity does the rest
# of the work: a word in every repository ends up weighted near nothing without being banned.
STOP = set('''a an the and but for with that this from what when which who whom whose have has had
was were are is be been being it its into onto over under they them their there here your yours you
our ours all any can could should would will shall not no nor too very of to in on at by as if then
than so such own same just also about after before again'''.split())


def scope_words(text):
    """The words in a piece of scope that are worth asking the estate about."""
    out = []
    for w in re.findall(r'[A-Za-z][A-Za-z0-9_-]{2,}', text.lower()):
        if w not in STOP and w not in out:
            out.append(w)
    return out[:10]                                   # ten is plenty; each one costs a pass over a clone


def scope(text):
    """WHAT THE ESTATE ALREADY SAYS ABOUT A PIECE OF SCOPE, before a line of it is built.

    A word that appears in every repository tells you nothing; a word that appears in two tells you
    where to look. So each word is weighted by how rare it is across the estate, a file scores the
    sum of the weights of the DISTINCT scope words it carries, and the ranking is by that score. The
    searching is done by `git grep`, which is free and already knows every clone: no second index.
    Private repositories are searched and counted, and never named, path and line withheld.
    """
    words = scope_words(text)
    if not words:
        print('REFUSED: no word in that scope is specific enough to ask about')
        return 2
    pub = public_repos()
    hits = {}                                         # (repo, path) -> {word: count}
    example = {}                                      # (repo, path) -> (word, lineno, text)
    carried = {w: set() for w in words}
    priv_files, repos, cut = set(), 0, []
    args = []
    for w in words:
        args += ['-e', w]
    for name in sorted(os.listdir(CLONES)):
        d = os.path.join(CLONES, name)
        if not os.path.isdir(os.path.join(d, '.git')):
            continue
        full = repo_name_of(d, name)
        is_pub = pub.get(full.lower(), pub.get(full.split('/')[-1].lower(), False))
        cite = full.split('/')[-1] if is_pub else 'PRIVATE'
        repos += 1
        # A BUDGET PER REPOSITORY, AND SAY WHEN IT RAN OUT. Unbounded, this took over ten minutes:
        # a handful of data repositories hold millions of lines of harvested rows and git grep reads
        # every one of them to find a word that means nothing there anyway. So each clone gets a few
        # seconds and twenty matches a file, the search is kept to the kinds of file a person writes,
        # and any repository cut short is COUNTED AND NAMED in the report. A bounded answer that says
        # where it stopped is worth more than an exhaustive one nobody waits for.
        p = subprocess.Popen(['git', 'grep', '-I', '-n', '-i', '-w', '-m', '20'] + args
                             + ['--'] + ['*' + e for e in TEXT],
                             cwd=d, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        # THE CLOCK HAS TO RUN WHETHER OR NOT ANYTHING COMES BACK. Checking the time inside the loop
        # over the output only works while output arrives: a repository of millions of harvested rows
        # that matches nothing produces NOTHING for minutes, the read blocks, and the budget is never
        # looked at. That is why the first bounded version still took nine minutes while reporting
        # that only seven repositories had been cut short. A timer kills it from outside instead.
        import threading
        late = []
        t = threading.Timer(PER_REPO_SECONDS, lambda: (late.append(1), p.kill()))
        t.daemon = True
        t.start()
        read = 0
        for raw in p.stdout:
            read += 1
            if read > 40000:                          # a common word in a big repository is not evidence
                late.append(1)
                p.kill()
                break
            try:
                path, lineno, body = raw.decode('utf-8', 'replace').rstrip('\n').split(':', 2)
            except ValueError:
                continue
            low = body.lower()
            got = [w for w in words if re.search(r'(?<![a-z0-9])%s(?![a-z0-9])' % re.escape(w), low)]
            if not got:
                continue
            if not is_pub:
                priv_files.add((name, path))
                for w in got:
                    carried[w].add(cite + '/' + name)
                continue
            k = (cite, path)
            h = hits.setdefault(k, {})
            for w in got:
                h[w] = h.get(w, 0) + 1
                carried[w].add(cite)
            if k not in example or len(body.strip()) < len(example[k][2]):
                example[k] = (got[0], lineno, body.strip()[:160])
        t.cancel()
        p.stdout.close()
        p.wait()
        if late:
            cut.append(cite if is_pub else 'a repository that is not named')
    import math
    idf = {w: math.log(1 + repos/max(1, len(carried[w]))) for w in words}
    ranked = sorted(hits.items(), key=lambda kv: (-sum(idf[w] for w in kv[1]), -sum(kv[1].values()), kv[0]))
    L = ['# SCOPE: %s' % text.strip(), '',
         'What the estate already says about this, asked before anything is built.',
         '%s, %d repositories searched, %d public files speak to it, %d in repositories that are not named.'
         % (time.strftime('%Y-%m-%d %H:%M'), repos, len(hits), len(priv_files)),
         ('%d were cut short at %d seconds and are not fully searched: %s.'
          % (len(cut), PER_REPO_SECONDS, ', '.join(sorted(set(cut)))) if cut else 'None was cut short.'), '',
         '## The words, and how rare each one is', '', '| word | repositories carrying it | weight |', '|---|---|---|']
    L += ['| %s | %d | %.2f |' % (w, len(carried[w]), idf[w]) for w in sorted(words, key=lambda w: -idf[w])]
    L += ['', '## Where to look first', '', '| repository / path | scope words it carries | line |', '|---|---|---|']
    for (repo, path), h in ranked[:20]:
        w, ln, body = example.get((repo, path), ('', '', ''))
        L.append('| %s / %s | %s | `%s:%s` %s |' % (repo, path, ' '.join(sorted(h)), path.split('/')[-1], ln, body))
    L += ['', 'Private repositories are counted above and never named, and their paths and lines are not written down.',
          '', 'Provided as is, without warranty of any kind; a chart, not a design.']
    body = '\n'.join(L) + '\n'
    if leaks(body):
        print('REFUSED: the digest guard stopped this scope report')
        return 2
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:48] or 'scope'
    out = os.path.join(ROOT, 'SCOPE-%s.md' % slug)
    io.open(out, 'w', encoding='utf-8', newline='\n').write(body)
    print('\n'.join(L[:8]))
    for (repo, path), h in ranked[:12]:
        print('  %-58s %s' % ((repo + '/' + path)[-58:], ' '.join(sorted(h))))
    print('\n%d public files, %d in repositories not named. Written to %s' % (len(hits), len(priv_files), out))
    return 0


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == '--scope':
        return scope(' '.join(argv[1:]))
    if argv[0] == '--index':
        return build_index()
    if argv[0] == '--selftest':
        return selftest()
    if argv[0].isdigit():
        return pulse(int(argv[0]))
    print('REFUSED: give an iteration number, --index or --selftest')
    return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
