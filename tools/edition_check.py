#!/usr/bin/env python3
"""edition_check.py: the release law's checks for Kuiper editions (editions/LAW.md 9.3; NL-010 roadmap step 9).
Apache-2.0 (kuiper-belt code), kuiper-belt README.md:156-157. Written by Opus team 9; E6-E8 are Opus team 4's
(handoff/04-loader/edition_check.py.patch, NL-010 step 4, 4.9), folded in with their logic unchanged.

  python3 tools/edition_check.py                      every editions/<stamp>/ that holds a modules.json
  python3 tools/edition_check.py editions/<stamp>     one folder
      --strict      the release gate: a NOT EVALUATED counts as a FAIL (PR B and the run quoted in PR A use it)
      --pre-cut     with --strict: allow E3 to be NOT EVALUATED only because proof/edition-sha256.txt is not cut yet
                    (the run saved in proof/ci_check.log is taken before the sha256 list that hashes it)
      --root DIR    the repository (default: this tool's)       --estate DIR  the clones E9 reads (default: its parent)

Prints one line per check and `RESULT: PASS` or `RESULT: FAIL` (exit 1). A check that cannot be evaluated prints
NOT EVALUATED with the reason; it is neither a pass nor a fail (LAWS.md:156) unless --strict. K1-K4 stay in
tools/ci_check.py, unchanged (ROADMAP.md R5, Q3).

E1 every <script> block of every editions/*/index.html (src-less, JavaScript), and every modules/*.js of the checked
   folders, pass `node --check` (ci_check.py:68 parses root pages only)
E2 every record of modules.json exists, hashes to its sha256 and has its bytes; every `order` id has a record; a file in
   modules/ absent from the manifest is a FAIL, unless a hand-off folder names it, in which case it is pending
   admission and NOT EVALUATED (FAIL under --strict)
E3 proof/edition-sha256.txt of EVERY edition folder that has one matches every file it lists and lists every file of
   its folder but itself (an earlier folder edited is a FAIL); a checked folder without one is NOT EVALUATED
E4 the pointer editions/index.html names one stamp in exactly three places (meta refresh, link, location.replace),
   never with /belt/, and that folder holds proof/edition-sha256.txt; when the stamp named is Edition 5 or later
   (its folder holds modules.json), location.replace forwards location.search and location.hash
E5 keys.json is byte-identical to the previous edition's (the pointer's stamp when older, else the newest older
   folder with a keys.json) unless README.md says the findings changed
E6 stamp = file name = header = manifest; licence present; requires within the hook table (KY_NAMES) plus the provides
   of records earlier in `order`; references hash as recorded and carry the page's hook-table block   (team 4)
E7 every reads/writes entry has its literal in the file; every fetch( literal is in reads                (team 4)
E8 every admitted module passes `node --check` and holds `KY.register(` exactly once                      (team 4)
E9 data/drift.json, when present, is re-computed byte-identical by `tools/drift.py --heads <itself>`; NOT EVALUATED
   when a clone the recorded heads need is not on this machine (GitHub's runner holds no estate)
"""
import hashlib, io, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
BEGIN = '// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · begin'
END = '// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · end'
HEADER = re.compile(r'^/\* kuiper module ([a-z0-9-]+), generation (\d{12}) \(UTC\),')
REF_HEADER = re.compile(r'^/\* kuiper loader reference, generation (\d{12}) \(UTC\),')
NAMES = re.compile(r'const KY_NAMES = Object\.freeze\(\[([\s\S]*?)\]\)')
SCRIPT = re.compile(r'<script\b([^>]*)>([\s\S]*?)</script>', re.I)
STAMP = re.compile(r'^\d{12}$')
EXTRA = ['cam', 'lit', 'sel', 'redraw', 'draw', 'panels']          # team 4's patch, kept as written
P_META = re.compile(r'<meta http-equiv="refresh" content="0; url=(\d{12})/">')
P_LINK = re.compile(r'<a href="(\d{12})/">')
P_REPL = re.compile(r"location\.replace\('(\d{12})/'([^)]*)\)")


def read(p, mode='r'):
    with io.open(p, mode, **({} if 'b' in mode else {'encoding': 'utf-8'})) as f:
        return f.read()


def sha(p):
    return hashlib.sha256(read(p, 'rb')).hexdigest()


def node_check(src, suffix):
    fd, name = tempfile.mkstemp(suffix=suffix)
    with io.open(fd, 'w', encoding='utf-8') as f:
        f.write(src)
    try:
        r = subprocess.run(['node', '--check', name], capture_output=True, text=True)
        if r.returncode == 0:
            return None
        err = [l for l in r.stderr.split('\n') if re.match(r'^\w*Error\b', l.strip())]
        return (err[0] if err else r.stderr.strip().split('\n')[0]).strip()[:160]
    finally:
        os.remove(name)


def block_of(text):
    i, j = text.find(BEGIN), text.find(END)
    return text[i:j + len(END)] if i >= 0 and j > i else None


def stamps(root):
    d = os.path.join(root, 'editions')
    return sorted(n for n in os.listdir(d) if STAMP.match(n) and os.path.isdir(os.path.join(d, n)))


def pointer_stamp(root):
    p = os.path.join(root, 'editions', 'index.html')
    m = P_REPL.search(read(p)) if os.path.isfile(p) else None
    return m.group(1) if m else None


class Report:
    def __init__(self):
        self.lines, self.fails, self.skips = [], [], []

    def check(self, code, errs, ok_text, skips=()):
        errs, skips = list(errs), list(skips)
        self.fails += ['%s: %s' % (code, e) for e in errs]
        self.skips += ['%s: %s' % (code, s) for s in skips]
        if errs:
            self.lines.append('%s FAIL: %s' % (code, '; '.join(errs[:8]) + (' ...(%d more)' % (len(errs) - 8) if len(errs) > 8 else '')))
        elif skips and not ok_text:
            self.lines.append('%s NOT EVALUATED: %s' % (code, '; '.join(skips)))
        else:
            self.lines.append('%s PASS: %s%s' % (code, ok_text, (' | NOT EVALUATED: ' + '; '.join(skips)) if skips else ''))


def manifest(ed):
    try:
        return json.loads(read(os.path.join(ed, 'modules.json'))), None
    except Exception as e:
        return {}, 'modules.json: %s' % e


def claimed_by_handoff(ed, fname):
    """the hand-off files (MODULE.sha256, PLAN.md, HANDOFF.md, ...) under handoff/ that name modules/<fname>"""
    hits, hd = [], os.path.join(ed, 'handoff')
    if not os.path.isdir(hd):
        return hits
    for dp, dn, fn in os.walk(hd):
        for f in fn:
            if f.endswith(('.md', '.sha256', '.json', '.txt')):
                try:
                    if fname in read(os.path.join(dp, f)):
                        hits.append(os.path.relpath(os.path.join(dp, f), ed))
                except Exception:
                    pass
    return sorted(hits)


def handoff_sha(ed, fname):
    hd = os.path.join(ed, 'handoff')
    for dp, dn, fn in os.walk(hd) if os.path.isdir(hd) else []:
        if 'MODULE.sha256' in fn:
            for ln in read(os.path.join(dp, 'MODULE.sha256')).splitlines():
                m = re.match(r'^([0-9a-f]{64})\s+\S*?' + re.escape(fname) + r'\s*$', ln.strip())
                if m:
                    return m.group(1), os.path.relpath(dp, ed)
    return None, None


def run(argv):
    args = [a for a in argv[1:]]
    opt = {'--root': os.path.dirname(HERE), '--estate': None}
    flags, pos = set(), []
    i = 0
    while i < len(args):
        a = args[i]
        if a in opt:
            opt[a] = os.path.abspath(args[i + 1]); i += 2; continue
        if a.startswith('--'):
            flags.add(a); i += 1; continue
        pos.append(a); i += 1
    root = os.path.abspath(opt['--root'])
    estate = opt['--estate'] or os.path.dirname(root)
    strict, precut = '--strict' in flags, '--pre-cut' in flags
    all_st = stamps(root)
    if pos:
        eds = [os.path.abspath(p if os.path.isabs(p) else os.path.join(os.getcwd(), p)).rstrip('/') for p in pos]
        if any(not os.path.isdir(e) for e in eds):
            eds = [os.path.join(root, p.rstrip('/')) for p in pos]
    else:
        eds = [os.path.join(root, 'editions', s) for s in all_st if os.path.isfile(os.path.join(root, 'editions', s, 'modules.json'))]
    R = Report()
    if not eds:
        print('edition_check: no edition folder with a modules.json; nothing to check')
        print('RESULT: FAIL')
        return 1
    for e in eds:
        if not os.path.isdir(e):
            print('edition_check: %s is not a folder' % e); print('RESULT: FAIL'); return 1
    names = ', '.join('editions/' + os.path.basename(e) for e in eds)
    M = {e: manifest(e) for e in eds}

    # ------------------------------------------------------------------ E1 node --check, every page and module
    errs, n_pages, n_blocks, n_mods = [], 0, 0, 0
    for s in all_st:
        p = os.path.join(root, 'editions', s, 'index.html')
        if not os.path.isfile(p):
            continue
        n_pages += 1
        for k, m in enumerate(SCRIPT.finditer(read(p))):
            attrs, body = m.group(1), m.group(2)
            if 'src=' in attrs or not body.strip():
                continue
            t = re.search(r'type\s*=\s*["\']?([^"\'\s>]+)', attrs)
            t = t.group(1).lower() if t else ''
            if t and t not in ('module', 'text/javascript', 'application/javascript'):
                continue
            n_blocks += 1
            err = node_check(body, '.mjs' if t == 'module' else '.js')
            if err:
                errs.append('editions/%s/index.html script %d: %s' % (s, k + 1, err))
    for e in eds:
        md = os.path.join(e, 'modules')
        for f in sorted(os.listdir(md)) if os.path.isdir(md) else []:
            if f.endswith('.js'):
                n_mods += 1
                err = node_check(read(os.path.join(md, f)), '.js')
                if err:
                    errs.append('editions/%s/modules/%s: %s' % (os.path.basename(e), f, err))
    R.check('E1', errs, '%d script blocks in %d editions/*/index.html and %d modules/*.js parse (node --check)' % (n_blocks, n_pages, n_mods))

    # ------------------------------------------------------------------ E2 manifest: exists, hashes, no stray file
    errs, skips, ok = [], [], []
    for e in eds:
        s = os.path.basename(e)
        man, merr = M[e]
        if merr:
            errs.append('editions/%s/%s' % (s, merr)); continue
        recs = [r for r in man.get('modules', []) if isinstance(r, dict)]
        refs = [r for r in man.get('references', []) if isinstance(r, dict)]
        if man.get('schema') != 'kuiper.modules.v1':
            errs.append('%s: modules.json schema %r' % (s, man.get('schema')))
        if man.get('edition') != s:
            errs.append('%s: modules.json edition %r, folder %s' % (s, man.get('edition'), s))
        listed = set()
        ids = [r.get('id') for r in recs]
        for d in set(i for i in ids if ids.count(i) > 1):
            errs.append('%s: id %s has %d records' % (s, d, ids.count(d)))
        for r in recs:
            rel = os.path.normpath(str(r.get('path', '')))
            listed.add(rel)
            if rel.startswith('..') or os.path.isabs(rel) or not rel.startswith('modules' + os.sep):
                errs.append('%s: %s: path %r is not inside modules/' % (s, r.get('id'), r.get('path'))); continue
            p = os.path.join(e, rel)
            if not os.path.isfile(p):
                errs.append('%s: %s: %s missing' % (s, r.get('id'), r.get('path'))); continue
            h = sha(p)
            if h != r.get('sha256'):
                errs.append('%s: %s refused: sha256 mismatch (file %s, manifest %s)' % (s, r.get('id'), h[:12], str(r.get('sha256'))[:12]))
            if os.path.getsize(p) != r.get('bytes'):
                errs.append('%s: %s: bytes %d, manifest %s' % (s, r.get('id'), os.path.getsize(p), r.get('bytes')))
        for r in refs:
            listed.add(os.path.normpath(str(r.get('file', ''))))
        for i in man.get('order', []):
            if i not in ids:
                errs.append('%s: order names %s, no record' % (s, i))
        md = os.path.join(e, 'modules')
        files = sorted(f for f in os.listdir(md) if not f.startswith('.')) if os.path.isdir(md) else []
        pend = []
        for f in files:
            if os.path.normpath('modules/' + f) in listed:
                continue
            hits = claimed_by_handoff(e, f)
            if not hits:
                errs.append('%s: modules/%s is in no manifest record and no hand-off names it (stray file)' % (s, f)); continue
            hs, hdir = handoff_sha(e, f)
            now = sha(os.path.join(md, f))
            state = ('= %s/MODULE.sha256' % hdir) if hs == now else (('file %s, %s/MODULE.sha256 %s' % (now[:12], hdir, hs[:12])) if hs else 'no MODULE.sha256 yet; named in %s' % hits[0])
            pend.append('modules/%s (%s)' % (f, state))
        if pend:
            skips.append('%s: %d file(s) pending admission, not in modules.json: %s' % (s, len(pend), ', '.join(pend)))
        ok.append('%s: %d records hash as recorded, %d reference(s), %d of %d files in modules/ admitted' % (s, len(recs), len(refs), len(files) - len(pend), len(files)))
    R.check('E2', errs, '; '.join(ok), skips)

    # ------------------------------------------------------------------ E3 proof/edition-sha256.txt, every folder
    errs, skips, ok = [], [], []
    checked = set(os.path.basename(e) for e in eds)
    for s in all_st:
        ed = os.path.join(root, 'editions', s)
        sp = os.path.join(ed, 'proof', 'edition-sha256.txt')
        if not os.path.isfile(sp):
            if s in checked:
                skips.append('editions/%s: no proof/edition-sha256.txt yet (the integrator cuts it last)' % s)
            continue
        seen, bad = set(), 0
        for ln in read(sp).splitlines():
            if not ln.strip() or ln.lstrip().startswith('#'):
                continue
            mm = re.match(r'^([0-9a-f]{64})\s+\*?(?:\./)?(.+?)\s*$', ln)
            if not mm:
                errs.append('editions/%s: unreadable line %r' % (s, ln[:60])); continue
            rel = mm.group(2)
            seen.add(rel)
            q = os.path.join(ed, rel)
            if not os.path.isfile(q):
                errs.append('editions/%s: %s listed, missing' % (s, rel)); bad += 1
            elif sha(q) != mm.group(1):
                errs.append('editions/%s: %s sha256 %s, listed %s' % (s, rel, sha(q)[:12], mm.group(1)[:12])); bad += 1
        for dp, dn, fn in os.walk(ed):
            for f in fn:
                rel = os.path.relpath(os.path.join(dp, f), ed).replace(os.sep, '/')
                if rel != 'proof/edition-sha256.txt' and rel not in seen:
                    errs.append('editions/%s: %s not in proof/edition-sha256.txt' % (s, rel))
        ok.append('%s %d' % (s, len(seen)))
    R.check('E3', errs, ('every listed file matches and every file is listed (%s)' % ', '.join(ok)) if ok else '', skips)

    # ------------------------------------------------------------------ E4 the pointer in three places
    errs, skips = [], []
    pp = os.path.join(root, 'editions', 'index.html')
    text_ok = ''
    if not os.path.isfile(pp):
        errs.append('no editions/index.html')
    else:
        t = read(pp)
        allst = re.findall(r'\d{12}', t)
        a, b, c = P_META.findall(t), P_LINK.findall(t), P_REPL.findall(t)
        if len(a) != 1 or len(b) != 1 or len(c) != 1:
            errs.append('pointer places: meta refresh %d, link %d, location.replace %d (each must be 1)' % (len(a), len(b), len(c)))
        elif len(allst) != 3:
            errs.append('the pointer holds %d twelve-digit stamps, not 3: %s' % (len(allst), allst))
        elif len(set([a[0], b[0], c[0][0]])) != 1:
            errs.append('pointer stamps disagree: meta %s, link %s, replace %s' % (a[0], b[0], c[0][0]))
        else:
            st, tail = a[0], c[0][1]
            if '/belt/' in t:
                errs.append('the pointer names /belt/')
            if not os.path.isfile(os.path.join(root, 'editions', st, 'proof', 'edition-sha256.txt')):
                errs.append('editions/%s/proof/edition-sha256.txt missing' % st)
            fw_hash, fw_search = 'location.hash' in tail, 'location.search' in tail
            ed5 = os.path.isfile(os.path.join(root, 'editions', st, 'modules.json'))
            if ed5 and not (fw_hash and fw_search):
                errs.append('editions/%s is Edition 5 or later and the pointer forwards %s (LAW.md 9.2: location.search + location.hash)'
                            % (st, ' + '.join(x for x, y in (('location.search', fw_search), ('location.hash', fw_hash)) if y) or 'nothing'))
            text_ok = 'the pointer names %s in its three places, folder and proof exist; forwards %s%s' % (
                st, ' + '.join(x for x, y in (('location.search', fw_search), ('location.hash', fw_hash)) if y) or 'nothing',
                '' if fw_search else ' (search not forwarded: allowed only while the pointer names a pre-Edition-5 folder; handoff/09-law/pointer.patch)')
    R.check('E4', errs, text_ok, skips)

    # ------------------------------------------------------------------ E5 keys.json unchanged unless said
    errs, skips, ok = [], [], []
    ps = pointer_stamp(root)
    for e in eds:
        s = os.path.basename(e)
        older = [x for x in all_st if x < s and os.path.isfile(os.path.join(root, 'editions', x, 'keys.json'))]
        prev = ps if ps and ps < s and ps in older else (older[-1] if older else None)
        kp = os.path.join(e, 'keys.json')
        if not prev:
            skips.append('%s: no previous edition with a keys.json' % s); continue
        if not os.path.isfile(kp):
            errs.append('%s: no keys.json' % s); continue
        a, b = sha(kp), sha(os.path.join(root, 'editions', prev, 'keys.json'))
        rp = os.path.join(e, 'README.md')
        said = os.path.isfile(rp) and re.search(r'findings? (have )?changed|keys\.json (has )?changed', read(rp), re.I)
        if a == b:
            ok.append('%s keys.json byte-identical to editions/%s (%s...)' % (s, prev, a[:8]))
        elif said:
            ok.append('%s keys.json differs from editions/%s and README.md says the findings changed' % (s, prev))
        else:
            errs.append('%s: keys.json %s differs from editions/%s %s and README.md names no change to the findings' % (s, a[:12], prev, b[:12]))
    R.check('E5', errs, '; '.join(ok), skips)

    # ------------------------------------------------------------------ E6 stamp = header = manifest (team 4)
    errs, ok = [], []
    for e in eds:
        s = os.path.basename(e)
        man = M[e][0]
        recs = [r for r in man.get('modules', []) if isinstance(r, dict)]
        refs = [r for r in man.get('references', []) if isinstance(r, dict)]
        order = man.get('order', [])
        pi = os.path.join(e, 'index.html')
        page = read(pi) if os.path.isfile(pi) else ''
        pblock = block_of(page)
        src_names = NAMES.search(pblock or '')
        names_from = 'index.html'
        for r in refs:
            q = os.path.join(e, r.get('file', ''))
            if not os.path.isfile(q):
                errs.append('%s: reference %s missing' % (s, r.get('file'))); continue
            if sha(q) != r.get('sha256'):
                errs.append('%s: reference %s sha256 %s, manifest %s' % (s, r.get('file'), sha(q)[:12], str(r.get('sha256'))[:12]))
            t = read(q); h = REF_HEADER.match(t); fd = re.match(r'^(\d{12})-', os.path.basename(q))
            if not h or h.group(1) != r.get('generation') or (fd and fd.group(1) != r.get('generation')):
                errs.append('%s: reference %s: stamp file %s, header %s, manifest %s' % (s, r.get('file'), fd and fd.group(1), h and h.group(1), r.get('generation')))
            rb = block_of(t)
            if pblock is not None and rb != pblock:
                errs.append('%s: reference %s: hook-table block differs from index.html' % (s, r.get('file')))
            if src_names is None and rb:
                src_names = NAMES.search(rb); names_from = r.get('file')
        if pblock is None and order:
            errs.append('%s: index.html has no hook table but order is not empty' % s)
        hooks = re.findall(r"'([^']+)'", src_names.group(1)) if src_names else []
        if not hooks and recs:
            errs.append('%s: no KY_NAMES literal found in index.html or a loader reference' % s)
        admissible = set(hooks) | set(EXTRA)
        by_id = {r.get('id'): r for r in recs}
        seq = [by_id[i] for i in order if i in by_id] + [r for r in recs if r.get('id') not in order]
        for r in seq:
            rid, gen, path = r.get('id'), str(r.get('generation', '')), str(r.get('path', ''))
            if not STAMP.match(gen):
                errs.append('%s: %s: generation %r is not twelve digits' % (s, rid, gen))
            fd = re.match(r'^(\d{12})-', os.path.basename(path))
            if fd and fd.group(1) != gen:
                errs.append('%s: %s refused: stamp mismatch: generation %s, file name %s' % (s, rid, gen, fd.group(1)))
            q = os.path.join(e, path)
            if os.path.isfile(q):
                h = HEADER.match(read(q).split('\n', 1)[0])
                if not h:
                    errs.append('%s: %s: no header line `/* kuiper module <name>, generation <stamp> (UTC), <licence>`' % (s, rid))
                elif h.group(2) != gen:
                    errs.append('%s: %s refused: stamp mismatch: generation %s, header %s' % (s, rid, gen, h.group(2)))
                elif h.group(1) != rid:
                    errs.append('%s: %s: header names %s' % (s, rid, h.group(1)))
            if not str(r.get('licence', '')).strip():
                errs.append('%s: %s: no licence' % (s, rid))
            for n in r.get('requires', []):
                if n not in admissible:
                    errs.append('%s: %s refused: missing hook %s' % (s, rid, n))
            if rid in order:
                admissible |= set([rid] + list(r.get('provides', [])))
        ok.append('%s: %d records, stamp = file name = header = manifest, licences present, requires within %d hooks from %s + provides; %d reference(s)'
                  % (s, len(recs), len(hooks), names_from, len(refs)))
    R.check('E6', errs, '; '.join(ok))

    # ------------------------------------------------------------------ E7 reads/writes literal (team 4)
    errs, n = [], 0
    for e in eds:
        s = os.path.basename(e)
        for r in [r for r in M[e][0].get('modules', []) if isinstance(r, dict)]:
            q = os.path.join(e, r.get('path', ''))
            if not os.path.isfile(q):
                continue
            n += 1
            t = read(q); rid = r.get('id')
            for w in r.get('writes', []):
                if w == 'window.KY.modules.%s' % rid:
                    good = re.search(r"""id\s*:\s*['"]%s['"]""" % re.escape(rid), t) or re.search(r"""['"]%s['"]""" % re.escape(rid), t)
                else:
                    lit = w[1:] if w.startswith('#') else (w[7:] if w.startswith('window.') else w)
                    good = lit in t or (lit.startswith('ky-') and re.search(r"""['"]ky-['"]\s*\+""", t) and re.search(r"""['"]%s['"]""" % re.escape(lit[3:]), t))
                if not good:
                    errs.append('%s: %s: writes %s, no literal in the file' % (s, rid, w))
            for rd in r.get('reads', []):
                if rd not in t:
                    errs.append('%s: %s: reads %s, no literal in the file' % (s, rid, rd))
            for f in re.findall(r"""fetch\(\s*['"`]([^'"`]+)['"`]""", t):
                if f not in r.get('reads', []):
                    errs.append('%s: %s: fetch(%s) not in reads' % (s, rid, f))
    R.check('E7', errs, '%d admitted modules: every reads/writes entry has its literal; no fetch outside reads' % n)

    # ------------------------------------------------------------------ E8 parse, register once (team 4)
    errs, n = [], 0
    for e in eds:
        s = os.path.basename(e)
        for r in [r for r in M[e][0].get('modules', []) if isinstance(r, dict)]:
            q = os.path.join(e, r.get('path', ''))
            if not os.path.isfile(q):
                continue
            n += 1
            t = read(q); err = node_check(t, '.js')
            if err:
                errs.append('%s: %s: node --check: %s' % (s, r.get('id'), err))
            k = t.count('KY.register(')
            if k != 1:
                errs.append('%s: %s: KY.register( appears %d times' % (s, r.get('id'), k))
    R.check('E8', errs, '%d admitted modules parse and register exactly once' % n)

    # ------------------------------------------------------------------ E9 the drift re-computed byte-identical
    errs, skips, ok = [], [], []
    tool = os.path.join(root, 'tools', 'drift.py')
    for e in eds:
        s = os.path.basename(e)
        dp = os.path.join(e, 'data', 'drift.json')
        if not os.path.isfile(dp):
            skips.append('%s: no data/drift.json in this folder' % s); continue
        if not os.path.isfile(tool):
            errs.append('%s: data/drift.json present, tools/drift.py missing' % s); continue
        try:
            D = json.loads(read(dp))
        except Exception as x:
            errs.append('%s: data/drift.json unreadable: %s' % (s, x)); continue
        need = sorted(r for r, h in (D.get('heads') or {}).items() if isinstance(h, dict) and h.get('sha'))
        have = set(n.lower() for n in os.listdir(estate) if os.path.isdir(os.path.join(estate, n, '.git'))) if os.path.isdir(estate) else set()
        missing = [r for r in need if r.lower() not in have]
        if missing:
            skips.append('%s: %d of %d clones the recorded heads need are not under %s (%s%s): drift not re-computed here'
                         % (s, len(missing), len(need), estate, ', '.join(missing[:4]), ' ...' if len(missing) > 4 else ''))
            continue
        tmpd = tempfile.mkdtemp(prefix='edition-check-e9-')
        out = os.path.join(tmpd, 'drift.json')
        try:
            r = subprocess.run([sys.executable, tool, '--root', root, '--edition', s, '--estate', estate, '--heads', dp, '--out', out],
                               capture_output=True, text=True)
            got = read(out, 'rb') if os.path.isfile(out) else b''
            want = read(dp, 'rb')
            if r.returncode != 0 or not got:
                errs.append('%s: tools/drift.py --heads exited %d, wrote %d bytes: %s' % (s, r.returncode, len(got), (r.stdout + r.stderr).strip().split('\n')[-1][:120]))
            elif got != want:
                errs.append('%s: data/drift.json sha256 %s, re-computed %s (%d vs %d bytes)'
                            % (s, hashlib.sha256(want).hexdigest()[:12], hashlib.sha256(got).hexdigest()[:12], len(want), len(got)))
            else:
                ok.append('%s: tools/drift.py --heads data/drift.json re-computes it byte-identical (%d bytes, sha256 %s...)'
                          % (s, len(got), hashlib.sha256(got).hexdigest()[:12]))
        finally:
            shutil.rmtree(tmpd, ignore_errors=True)
    R.check('E9', errs, '; '.join(ok), skips)

    # ------------------------------------------------------------------ the verdict
    print('edition_check: %s (repository %s)%s' % (names, os.path.basename(root), ' --strict' if strict else ''))
    for ln in R.lines:
        print(ln)
    blocking = list(R.fails)
    if R.skips:
        print('NOT EVALUATED:')
        for sk in R.skips:
            allowed = precut and sk.startswith('E3: ') and 'no proof/edition-sha256.txt yet' in sk
            print('  - %s%s' % (sk, ' (allowed by --pre-cut)' if strict and allowed else ''))
            if strict and not allowed:
                blocking.append('NOT EVALUATED under --strict: ' + sk)
    res = 'FAIL' if blocking else 'PASS'
    print('RESULT: %s' % res)
    return 1 if blocking else 0


if __name__ == '__main__':
    sys.exit(run(sys.argv))
