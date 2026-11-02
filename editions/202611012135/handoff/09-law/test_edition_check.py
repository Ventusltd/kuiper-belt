#!/usr/bin/env python3
"""test_edition_check.py: the negative tests of tools/edition_check.py (editions/LAW.md 9.3; NL-010 roadmap step 9).
Apache-2.0 (kuiper-belt code), kuiper-belt README.md:156-157. Written by Opus team 9 (builder).

ROADMAP step 9, the Opus team 9 brief: "Write tools/edition_check.py with E1-E9 and a negative test for each".
Every test below builds a small synthetic repository (two edition folders, a pointer, a hook table, two modules, a
loader reference, a drift layer and a stub tools/drift.py), checks that the untouched copy prints `RESULT: PASS` with
E1-E9 each PASS (also under --strict), then breaks exactly one thing the law forbids and asserts:
  - the check that guards it prints FAIL (or NOT EVALUATED where the law says so),
  - the failure names what was broken (the words the law asks for, e.g. `refused: sha256 mismatch`),
  - no other check changes its verdict (the expected set of failing checks is written per test),
  - `RESULT: FAIL` and exit code 1.
The fixture is synthetic so the suite runs on a GitHub runner with no estate clones and no browser; `--real` adds
mutations of a copy of this repository's own newest Edition 5 folder (E1-E4 only; E9 is skipped there with
--estate pointing nowhere).

  python3 editions/<stamp>/handoff/09-law/test_edition_check.py            the synthetic suite
  python3 editions/<stamp>/handoff/09-law/test_edition_check.py --real     plus the copy of the real folder
  EDITION_CHECK=/path/to/edition_check.py ...                              test another copy of the tool
"""
import hashlib, io, json, os, re, shutil, subprocess, sys, tempfile, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
REAL = '--real' in sys.argv
if REAL:
    sys.argv.remove('--real')


def find_root():
    d = HERE
    for _ in range(8):
        if os.path.isfile(os.path.join(d, 'tools', 'edition_check.py')):
            return d
        d = os.path.dirname(d)
    return None


ROOT = find_root()
TOOL = os.environ.get('EDITION_CHECK') or (ROOT and os.path.join(ROOT, 'tools', 'edition_check.py'))

OLD, NEW, THIRD = '202601010000', '202601020000', '202601030000'
G_REF, G_HELLO, G_GREET = '202601020000', '202601020001', '202601020002'
BEGIN = '// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · begin (fixture)'
END = '// ======================================== KUIPER HOOK TABLE AND LOADER kuiper.hooks.v1 · end'
BLOCK = BEGIN + "\nconst KY_NAMES = Object.freeze(['keyPlace', 'address', 'card', 'redraw']);\n" + END
CODES = ['E%d' % i for i in range(1, 10)]


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with io.open(p, 'wb') as f:
        f.write(s.encode('utf-8') if isinstance(s, str) else s)


def read(p):
    with io.open(p, 'r', encoding='utf-8') as f:
        return f.read()


def sha(p):
    with io.open(p, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


def module_src(mid, gen, requires, body):
    return ('/* kuiper module %s, generation %s (UTC), Apache-2.0 (kuiper-belt) */\n'
            '(function () {\n  \'use strict\';\n'
            '  window.KY.register({ id: \'%s\', requires: %s, install: function (ky) {\n%s\n  } });\n})();\n'
            % (mid, gen, mid, json.dumps(requires), body))


HELLO = module_src('hello', G_HELLO, ['keyPlace', 'redraw'],
                   "    var d = document.createElement('div'); d.id = 'ky-hello'; document.body.appendChild(d); ky.redraw();")
GREET = module_src('greet', G_GREET, ['hello', 'card'],
                   "    var s = document.createElement('style'); s.id = 'ky-greet-style'; document.head.appendChild(s);")
REF = ('/* kuiper loader reference, generation %s (UTC), Apache-2.0 (kuiper-belt) */\n'
       '// fixture: the reviewable copy of the hook-table block of index.html\n%s\n' % (G_REF, BLOCK))
PAGE_NEW = ('<!doctype html>\n<html><head><meta charset="utf-8"><title>Fixture Edition 5</title></head>\n<body>\n'
            '<canvas id="c"></canvas>\n<script type="application/json" id="cfg">{"not": "javascript"}</script>\n'
            '<script>\nconst cx = 1;\n%s\nwindow.KY = Object.freeze({ names: KY_NAMES });\n</script>\n</body></html>\n' % BLOCK)
PAGE_OLD = ('<!doctype html>\n<html><head><meta charset="utf-8"><title>Fixture Edition 4</title></head>\n<body>\n'
            '<script>\nfunction edCard(i) { return i + 1; }\n</script>\n</body></html>\n')
KEYS = '{"bodies": [{"key": 1, "line_text": "const a = 1;", "verified": true}]}\n'


def pointer(stamp, tail=" + location.search + location.hash", extra=''):
    return ('<!doctype html>\n<html><head><meta charset="utf-8">\n'
            '<meta http-equiv="refresh" content="0; url=%s/">\n<title>Kuiper editions</title></head>\n<body>\n'
            '<p><a href="%s/">the current edition</a></p>%s\n'
            "<script>location.replace('%s/'%s)</script>\n</body></html>\n" % (stamp, stamp, extra, stamp, tail))


# the stub drift: re-computes data/drift.json from the clones it is pointed at, deterministically (the real tool is
# tools/drift.py, team 8; E9 only compares bytes, so the stub proves the comparison, not the drift)
DRIFT_STUB = r'''import json, os, sys
a = sys.argv[1:]; o = {a[i]: a[i + 1] for i in range(0, len(a) - 1, 2)}
heads = json.load(open(o['--heads']))['heads']
count = {r: len([n for n in os.listdir(os.path.join(o['--estate'], r)) if n != '.git']) for r in sorted(heads)}
json.dump({'edition': o['--edition'], 'heads': heads, 'files': count}, open(o['--out'], 'w'), indent=1, sort_keys=True)
open(o['--out'], 'a').write('\n')
'''


def cut_proof(ed):
    rows = []
    for dp, dn, fn in os.walk(ed):
        for f in fn:
            rel = os.path.relpath(os.path.join(dp, f), ed).replace(os.sep, '/')
            if rel != 'proof/edition-sha256.txt':
                rows.append('%s  %s' % (sha(os.path.join(dp, f)), rel))
    write(os.path.join(ed, 'proof', 'edition-sha256.txt'), '\n'.join(sorted(rows, key=lambda r: r[66:])) + '\n')


class Fixture:
    """a synthetic repository under a temporary folder: <tmp>/repo (the root) and <tmp>/estate (the clones E9 reads)"""
    template = None

    @classmethod
    def build_template(cls):
        t = tempfile.mkdtemp(prefix='edition-check-fixture-')
        root, estate = os.path.join(t, 'repo'), os.path.join(t, 'estate')
        old, new = os.path.join(root, 'editions', OLD), os.path.join(root, 'editions', NEW)
        write(os.path.join(old, 'index.html'), PAGE_OLD)
        write(os.path.join(old, 'keys.json'), KEYS)
        write(os.path.join(old, 'README.md'), '# Fixture Edition 4\n')
        cut_proof(old)
        write(os.path.join(new, 'index.html'), PAGE_NEW)
        write(os.path.join(new, 'keys.json'), KEYS)
        write(os.path.join(new, 'README.md'), '# Fixture Edition 5\n\nWhat changed from Edition 4: two modules.\n')
        write(os.path.join(new, 'modules', G_HELLO + '-hello.js'), HELLO)
        write(os.path.join(new, 'modules', G_GREET + '-greet.js'), GREET)
        write(os.path.join(new, 'modules', G_REF + '-loader.js'), REF)
        write(os.path.join(new, 'handoff', '09-law', 'PLAN.md'), '# fixture hand-off\n')
        for r, n in (('repoa', 2), ('repob', 3)):
            os.makedirs(os.path.join(estate, r, '.git'))
            for k in range(n):
                write(os.path.join(estate, r, 'f%d.txt' % k), 'x%d\n' % k)
        write(os.path.join(root, 'tools', 'drift.py'), DRIFT_STUB)
        heads = {'repoa': {'sha': 'a' * 40}, 'repob': {'sha': 'b' * 40}}
        write(os.path.join(new, 'data', 'drift.json'), json.dumps({'heads': heads}))
        out = os.path.join(t, 'drift.out')
        subprocess.run([sys.executable, os.path.join(root, 'tools', 'drift.py'), '--root', root, '--edition', NEW,
                        '--estate', estate, '--heads', os.path.join(new, 'data', 'drift.json'), '--out', out], check=True)
        shutil.move(out, os.path.join(new, 'data', 'drift.json'))
        man = {'schema': 'kuiper.modules.v1', 'edition': NEW, 'hooks': 'kuiper.hooks.v1', 'order': ['hello', 'greet'],
               'modules': [
                   {'id': 'hello', 'generation': G_HELLO, 'path': 'modules/%s-hello.js' % G_HELLO, 'requires': ['keyPlace', 'redraw'],
                    'provides': ['hello'], 'reads': [], 'writes': ['window.KY.modules.hello', '#ky-hello'], 'licence': 'Apache-2.0', 'team': '04'},
                   {'id': 'greet', 'generation': G_GREET, 'path': 'modules/%s-greet.js' % G_GREET, 'requires': ['hello', 'card'],
                    'provides': ['greet'], 'reads': [], 'writes': ['window.KY.modules.greet', '#ky-greet-style'], 'licence': 'Apache-2.0', 'team': '09'}],
               'references': [{'file': 'modules/%s-loader.js' % G_REF, 'generation': G_REF, 'licence': 'Apache-2.0', 'team': '04'}]}
        write(os.path.join(new, 'modules.json'), json.dumps(man, indent=1))
        write(os.path.join(root, 'editions', 'index.html'), pointer(NEW))
        f = cls.__new__(cls); f.tmp, f.root, f.estate = t, root, estate
        f.rehash()
        cls.template = t

    def __init__(self):
        if Fixture.template is None:
            Fixture.build_template()
        self.tmp = tempfile.mkdtemp(prefix='edition-check-case-')
        shutil.rmtree(self.tmp)
        shutil.copytree(Fixture.template, self.tmp, symlinks=True)
        self.root, self.estate = os.path.join(self.tmp, 'repo'), os.path.join(self.tmp, 'estate')

    def ed(self, stamp=NEW):
        return os.path.join(self.root, 'editions', stamp)

    def p(self, rel, stamp=NEW):
        return os.path.join(self.ed(stamp), rel)

    def manifest(self):
        return json.loads(read(self.p('modules.json')))

    def set_manifest(self, man, rehash=True):
        write(self.p('modules.json'), json.dumps(man, indent=1))
        if rehash:
            self.recut()

    def rehash(self):
        """record every module's and reference's sha256 and bytes in modules.json, then re-cut the new folder's proof"""
        man = self.manifest()
        for r in man['modules']:
            q = self.p(r['path'])
            if os.path.isfile(q):
                r['sha256'], r['bytes'] = sha(q), os.path.getsize(q)
        for r in man.get('references', []):
            q = self.p(r['file'])
            if os.path.isfile(q):
                r['sha256'], r['bytes'] = sha(q), os.path.getsize(q)
        write(self.p('modules.json'), json.dumps(man, indent=1))
        self.recut()

    def recut(self, stamp=NEW):
        cut_proof(self.ed(stamp))

    def edit(self, rel, old, new, stamp=NEW, count=1):
        t = read(self.p(rel, stamp))
        assert old in t, (rel, old)
        write(self.p(rel, stamp), t.replace(old, new, count))

    def run(self, *flags, folder=True):
        args = [sys.executable, TOOL, '--root', self.root, '--estate', self.estate] + list(flags)
        if folder:
            args.append(self.ed())
        r = subprocess.run(args, capture_output=True, text=True, cwd=self.tmp)
        return Result(r)

    def close(self):
        shutil.rmtree(self.tmp, ignore_errors=True)


class Result:
    LINE = re.compile(r'^(E\d) (PASS|FAIL|NOT EVALUATED)(?::\s?(.*))?$')

    def __init__(self, r):
        self.code, self.out = r.returncode, r.stdout + r.stderr
        self.status, self.text, self.skips = {}, {}, []
        for ln in r.stdout.splitlines():
            m = self.LINE.match(ln)
            if m:
                self.status[m.group(1)], self.text[m.group(1)] = m.group(2), m.group(3) or ''
            elif ln.startswith('  - E'):
                self.skips.append(ln[4:])
        m = re.search(r'^RESULT: (PASS|FAIL)$', r.stdout, re.M)
        self.result = m.group(1) if m else None

    def failing(self):
        return set(c for c, s in self.status.items() if s == 'FAIL')


@unittest.skipIf(not TOOL or not os.path.isfile(TOOL), 'tools/edition_check.py not found (set EDITION_CHECK)')
class Base(unittest.TestCase):
    def setUp(self):
        self.f = Fixture()

    def tearDown(self):
        self.f.close()

    def assertFails(self, r, expected, words=(), code=None):
        """the checks in `expected` FAIL, every other check of E1-E9 does not, RESULT: FAIL, exit 1, and `words` appear in
        the FAIL line of `code` (default: the first of expected)"""
        msg = '\n' + r.out
        self.assertEqual(sorted(r.status), CODES, 'every check prints one line' + msg)
        self.assertEqual(r.failing(), set(expected), 'failing checks' + msg)
        self.assertEqual(r.result, 'FAIL', msg)
        self.assertEqual(r.code, 1, msg)
        c = code or sorted(expected)[0]
        for w in words:
            self.assertIn(w, r.text[c], '%s FAIL line names %r%s' % (c, w, msg))

    def assertPasses(self, r):
        msg = '\n' + r.out
        self.assertEqual(sorted(r.status), CODES, msg)
        self.assertEqual(r.failing(), set(), msg)
        self.assertEqual(r.result, 'PASS', msg)
        self.assertEqual(r.code, 0, msg)


class T0Baseline(Base):
    def test_untouched_fixture_passes_every_check(self):
        r = self.f.run()
        self.assertPasses(r)
        self.assertEqual(set(r.status.values()), {'PASS'}, r.out)
        self.assertEqual(r.skips, [], r.out)

    def test_untouched_fixture_passes_strict(self):
        self.assertPasses(self.f.run('--strict'))

    def test_default_selection_finds_the_folder_with_modules_json(self):
        r = self.f.run(folder=False)
        self.assertPasses(r)
        self.assertIn('editions/' + NEW, r.out)
        self.assertNotIn('editions/%s,' % OLD, r.out)


class T1Parse(Base):
    """E1 every <script> block of every editions/*/index.html and every modules/*.js pass node --check"""

    def test_module_syntax_error(self):
        self.f.edit('modules/%s-greet.js' % G_GREET, "document.head.appendChild(s);", "document.head.appendChild(s;")
        self.f.rehash()
        self.assertFails(self.f.run(), {'E1', 'E8'}, ['modules/%s-greet.js' % G_GREET, 'SyntaxError'])

    def test_older_edition_page_script_syntax_error(self):
        # every editions/*/index.html, not only the folder checked (ci_check.py:68 parses root pages only)
        self.f.edit('index.html', 'return i + 1;', 'return i + ;', stamp=OLD)
        self.f.recut(OLD)
        self.assertFails(self.f.run(), {'E1'}, ['editions/%s/index.html script' % OLD])

    def test_unreferenced_js_in_modules_is_parsed(self):
        self.f.edit('modules/%s-loader.js' % G_REF, "'redraw']);", "'redraw'];")
        self.f.rehash()
        self.assertFails(self.f.run(), {'E1'}, ['modules/%s-loader.js' % G_REF], code='E1')

    def test_json_script_block_is_not_parsed_as_javascript(self):
        r = self.f.run()
        self.assertPasses(r)
        self.assertIn('1 script blocks in 2 editions/*/index.html', r.text['E1'])


class T2Manifest(Base):
    """E2 every record exists, hashes as recorded and has its bytes; every order id has a record; no stray file"""

    def test_one_altered_byte_is_refused_sha256_mismatch(self):
        p = self.f.p('modules/%s-hello.js' % G_HELLO)
        b = bytearray(open(p, 'rb').read()); i = b.index(b'ky-hello'); b[i + 3] = ord('H')
        write(p, bytes(b)); self.f.recut()           # same length; the proof re-cut so only the manifest can see it
        self.assertFails(self.f.run(), {'E2'}, ['hello refused: sha256 mismatch'])

    def test_bytes_disagree(self):
        man = self.f.manifest(); man['modules'][0]['bytes'] += 1
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E2'}, ['hello: bytes'])

    def test_record_whose_file_is_missing(self):
        os.remove(self.f.p('modules/%s-greet.js' % G_GREET)); self.f.recut()
        self.assertFails(self.f.run(), {'E2'}, ['greet: modules/%s-greet.js missing' % G_GREET])

    def test_path_outside_modules(self):
        man = self.f.manifest(); man['modules'][1]['path'] = '../%s/keys.json' % OLD
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E2'}, ['is not inside modules/'])

    def test_stray_file_named_by_nobody(self):
        write(self.f.p('modules/202601020003-stray.js'), '/* stray */\nvar s = 1;\n'); self.f.recut()
        self.assertFails(self.f.run(), {'E2'}, ['modules/202601020003-stray.js', 'stray file'])

    def test_order_names_an_id_with_no_record(self):
        man = self.f.manifest(); man['order'].append('ghost')
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E2'}, ['order names ghost, no record'])

    def test_duplicate_id(self):
        man = self.f.manifest(); dup = dict(man['modules'][1]); man['modules'].append(dup)
        self.f.set_manifest(man)
        r = self.f.run()
        self.assertIn('E2', r.failing(), r.out)
        self.assertIn('id greet has 2 records', r.text['E2'], r.out)

    def test_wrong_schema_and_edition(self):
        man = self.f.manifest(); man['schema'] = 'kuiper.modules.v0'; man['edition'] = OLD
        self.f.set_manifest(man)
        r = self.f.run()
        self.assertIn('E2', r.failing(), r.out)
        self.assertIn("modules.json schema 'kuiper.modules.v0'", r.text['E2'], r.out)
        self.assertIn("modules.json edition '%s'" % OLD, r.text['E2'], r.out)

    def test_unreadable_manifest(self):
        write(self.f.p('modules.json'), '{"schema": '); self.f.recut()
        r = self.f.run()
        self.assertIn('E2', r.failing(), r.out)
        self.assertIn('modules.json:', r.text['E2'], r.out)
        self.assertEqual(r.result, 'FAIL', r.out)

    def test_file_named_by_a_handoff_is_pending_not_evaluated_and_strict_fails(self):
        write(self.f.p('modules/202601020004-pending.js'), '/* pending */\nvar p = 1;\n')
        write(self.f.p('handoff/09-law/MODULE.sha256'), '%s  modules/202601020004-pending.js\n' % sha(self.f.p('modules/202601020004-pending.js')))
        self.f.recut()
        r = self.f.run()
        self.assertPasses(r)
        self.assertTrue(any(s.startswith('E2: ') and '202601020004-pending.js' in s for s in r.skips), r.out)
        r = self.f.run('--strict')
        self.assertEqual(r.result, 'FAIL', r.out)
        self.assertEqual(r.code, 1, r.out)
        self.assertIn('NOT EVALUATED', r.out)


class T3Proof(Base):
    """E3 proof/edition-sha256.txt of every folder matches every file and lists every file but itself"""

    def test_earlier_folder_edited(self):
        self.f.edit('README.md', 'Edition 4', 'Edition 4 (edited)', stamp=OLD)
        self.assertFails(self.f.run(), {'E3'}, ['editions/%s: README.md sha256' % OLD])

    def test_file_added_and_not_listed(self):
        write(self.f.p('data/extra.json'), '{}\n')
        self.assertFails(self.f.run(), {'E3'}, ['data/extra.json not in proof/edition-sha256.txt'])

    def test_listed_file_missing(self):
        os.remove(self.f.p('README.md', OLD))
        self.assertFails(self.f.run(), {'E3'}, ['README.md listed, missing'])

    def test_unreadable_line(self):
        with open(self.f.p('proof/edition-sha256.txt'), 'a') as fh:
            fh.write('not a sha line\n')
        self.assertFails(self.f.run(), {'E3'}, ['unreadable line'])

    def test_no_proof_yet_is_not_evaluated_strict_fails_pre_cut_allows(self):
        os.remove(self.f.p('proof/edition-sha256.txt'))
        # the pointer must name a folder with a proof (E4): point it at the older folder while this one is uncut
        write(os.path.join(self.f.root, 'editions', 'index.html'), pointer(OLD, ' + location.hash'))
        r = self.f.run()
        self.assertPasses(r)
        self.assertTrue(any(s.startswith('E3: ') and 'no proof/edition-sha256.txt yet' in s for s in r.skips), r.out)
        r = self.f.run('--strict')
        self.assertEqual((r.result, r.code), ('FAIL', 1), r.out)
        self.assertIn('NOT EVALUATED under --strict', r.out) if 'NOT EVALUATED under' in r.out else None
        r = self.f.run('--strict', '--pre-cut')
        self.assertPasses(r)
        self.assertIn('(allowed by --pre-cut)', r.out)

    def test_pre_cut_allows_nothing_else(self):
        os.remove(self.f.p('proof/edition-sha256.txt'))
        write(os.path.join(self.f.root, 'editions', 'index.html'), pointer(OLD, ' + location.hash'))
        os.makedirs(os.path.join(self.f.estate, 'gone'))     # not a clone: harmless
        shutil.rmtree(os.path.join(self.f.estate, 'repob'))  # E9 now NOT EVALUATED, which --pre-cut must not excuse
        r = self.f.run('--strict', '--pre-cut')
        self.assertEqual((r.result, r.code), ('FAIL', 1), r.out)


class T4Pointer(Base):
    """E4 the pointer names one stamp in exactly three places, never /belt/, a folder with a proof, and from Edition 5
    forwards location.search + location.hash"""

    def ptr(self, text):
        write(os.path.join(self.f.root, 'editions', 'index.html'), text)

    def test_stamps_disagree(self):
        self.ptr(pointer(NEW).replace('<a href="%s/">' % NEW, '<a href="%s/">' % OLD))
        self.assertFails(self.f.run(), {'E4'}, ['pointer stamps disagree'])

    def test_a_fourth_stamp(self):
        self.ptr(pointer(NEW, extra='\n<!-- previous: %s -->' % OLD))
        self.assertFails(self.f.run(), {'E4'}, ['twelve-digit stamps, not 3'])

    def test_a_place_missing(self):
        self.ptr(re.sub(r'<meta http-equiv="refresh"[^>]*>\n', '', pointer(NEW)))
        self.assertFails(self.f.run(), {'E4'}, ['meta refresh 0, link 1, location.replace 1'])

    def test_belt_in_the_pointer(self):
        self.ptr(pointer(NEW).replace('<title>', '<link rel="prev" href="/belt/"><title>'))
        self.assertFails(self.f.run(), {'E4'}, ['/belt/'])

    def test_names_a_folder_without_proof(self):
        write(os.path.join(self.f.ed(THIRD), 'index.html'), PAGE_OLD)
        self.ptr(pointer(THIRD, ' + location.hash'))
        self.assertFails(self.f.run(), {'E4'}, ['editions/%s/proof/edition-sha256.txt missing' % THIRD])

    def test_names_a_folder_that_does_not_exist(self):
        self.ptr(pointer('202612312359'))
        self.assertFails(self.f.run(), {'E4'}, ['proof/edition-sha256.txt missing'])

    def test_edition5_pointer_forwarding_hash_only(self):
        self.ptr(pointer(NEW, ' + location.hash'))
        self.assertFails(self.f.run(), {'E4'}, ['Edition 5 or later', 'forwards location.hash'])

    def test_edition5_pointer_forwarding_nothing(self):
        self.ptr(pointer(NEW, ''))
        self.assertFails(self.f.run(), {'E4'}, ['forwards nothing'])

    def test_control_edition4_pointer_may_forward_hash_only(self):
        self.ptr(pointer(OLD, ' + location.hash'))
        r = self.f.run()
        self.assertPasses(r)
        self.assertIn('search not forwarded', r.text['E4'])

    def test_no_pointer(self):
        os.remove(os.path.join(self.f.root, 'editions', 'index.html'))
        self.assertFails(self.f.run(), {'E4'}, ['no editions/index.html'])


class T5Keys(Base):
    """E5 keys.json byte-identical to the previous edition's unless README.md says the findings changed"""

    def test_keys_changed_silently(self):
        self.f.edit('keys.json', '"const a = 1;"', '"const a = 2;"'); self.f.recut()
        self.assertFails(self.f.run(), {'E5'}, ['differs from editions/%s' % OLD, 'names no change to the findings'])

    def test_one_byte_appended(self):
        with open(self.f.p('keys.json'), 'a') as fh:
            fh.write(' ')
        self.f.recut()
        self.assertFails(self.f.run(), {'E5'}, ['keys.json'])

    def test_keys_missing(self):
        os.remove(self.f.p('keys.json')); self.f.recut()
        self.assertFails(self.f.run(), {'E5'}, ['no keys.json'])

    def test_control_change_named_in_readme_passes(self):
        self.f.edit('keys.json', '"const a = 1;"', '"const a = 2;"')
        self.f.edit('README.md', 'two modules.', 'two modules; the findings changed (one line re-verified).')
        self.f.recut()
        r = self.f.run()
        self.assertPasses(r)
        self.assertIn('README.md says the findings changed', r.text['E5'])


class T6Stamps(Base):
    """E6 stamp = file name = header = manifest; licence present; requires within the hook table plus earlier provides;
    references hash as recorded and carry the page's hook-table block (Opus team 4's check)"""

    def test_manifest_generation_differs_from_file_name(self):
        man = self.f.manifest(); man['modules'][0]['generation'] = '202601020009'
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E6'}, ['hello refused: stamp mismatch'])

    def test_header_stamp_differs(self):
        self.f.edit('modules/%s-hello.js' % G_HELLO, 'generation %s (UTC)' % G_HELLO, 'generation 202601020009 (UTC)')
        self.f.rehash()
        self.assertFails(self.f.run(), {'E6'}, ['hello refused: stamp mismatch: generation %s, header 202601020009' % G_HELLO])

    def test_header_line_missing(self):
        self.f.edit('modules/%s-hello.js' % G_HELLO, '/* kuiper module hello,', '/* a module hello,')
        self.f.rehash()
        self.assertFails(self.f.run(), {'E6'}, ['hello: no header line'])

    def test_header_names_another_module(self):
        self.f.edit('modules/%s-hello.js' % G_HELLO, '/* kuiper module hello,', '/* kuiper module hallo,')
        self.f.rehash()
        self.assertFails(self.f.run(), {'E6'}, ['hello: header names hallo'])

    def test_requires_a_hook_that_does_not_exist(self):
        man = self.f.manifest(); man['modules'][0]['requires'].append('noSuchHook')
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E6'}, ['hello refused: missing hook noSuchHook'])

    def test_requires_a_module_later_in_order(self):
        man = self.f.manifest(); man['order'] = ['greet', 'hello']
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E6'}, ['greet refused: missing hook hello'])

    def test_no_licence(self):
        man = self.f.manifest(); man['modules'][1]['licence'] = ' '
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E6'}, ['greet: no licence'])

    def test_generation_not_twelve_digits(self):
        man = self.f.manifest(); man['modules'][1]['generation'] = '2026010200'
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E6'}, ['generation', 'is not twelve digits'])

    def test_reference_sha256_differs(self):
        self.f.edit('modules/%s-loader.js' % G_REF, '// fixture:', '// fixture (edited):'); self.f.recut()
        self.assertFails(self.f.run(), {'E6'}, ['reference modules/%s-loader.js sha256' % G_REF])

    def test_reference_block_differs_from_the_page(self):
        self.f.edit('modules/%s-loader.js' % G_REF, "'redraw']);", "'redraw', 'extra']);")
        self.f.rehash()
        self.assertFails(self.f.run(), {'E6'}, ['hook-table block differs from index.html'])

    def test_page_lost_its_hook_table(self):
        self.f.edit('index.html', BLOCK, "const KY_NAMES = Object.freeze(['keyPlace']);")
        self.f.recut()
        self.assertFails(self.f.run(), {'E6'}, ['index.html has no hook table but order is not empty'])


class T7Literals(Base):
    """E7 every reads/writes entry has its literal in the file; every fetch( literal is in reads (Opus team 4's check)"""

    def test_writes_without_literal(self):
        man = self.f.manifest(); man['modules'][0]['writes'].append('#ky-nowhere')
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E7'}, ['hello: writes #ky-nowhere, no literal in the file'])

    def test_reads_without_literal(self):
        man = self.f.manifest(); man['modules'][1]['reads'].append('data/never.json')
        self.f.set_manifest(man)
        self.assertFails(self.f.run(), {'E7'}, ['greet: reads data/never.json, no literal in the file'])

    def test_fetch_outside_reads(self):
        self.f.edit('modules/%s-greet.js' % G_GREET, "document.head.appendChild(s);",
                    "document.head.appendChild(s); fetch('data/secret.json');")
        self.f.rehash()
        self.assertFails(self.f.run(), {'E7'}, ['greet: fetch(data/secret.json) not in reads'])

    def test_control_fetch_inside_reads(self):
        self.f.edit('modules/%s-greet.js' % G_GREET, "document.head.appendChild(s);",
                    "document.head.appendChild(s); fetch('data/drift.json');")
        man = self.f.manifest(); man['modules'][1]['reads'] = ['data/drift.json']
        self.f.set_manifest(man, rehash=False); self.f.rehash()
        self.assertPasses(self.f.run())


class T8Register(Base):
    """E8 every admitted module passes node --check and holds KY.register( exactly once (Opus team 4's check)"""

    def test_registers_twice(self):
        self.f.edit('modules/%s-hello.js' % G_HELLO, 'ky.redraw();', "ky.redraw(); window.KY.register({ id: 'hello-2' });")
        self.f.rehash()
        self.assertFails(self.f.run(), {'E8'}, ['hello: KY.register( appears 2 times'])

    def test_never_registers(self):
        self.f.edit('modules/%s-greet.js' % G_GREET, 'window.KY.register(', 'window.KY.enrol(')
        self.f.rehash()
        self.assertFails(self.f.run(), {'E8'}, ['greet: KY.register( appears 0 times'])


class T9Drift(Base):
    """E9 data/drift.json, when present, is re-computed byte-identical by tools/drift.py --heads <itself>"""

    def test_drift_edited_by_hand(self):
        self.f.edit('data/drift.json', '"repob": 3', '"repob": 4'); self.f.recut()
        self.assertFails(self.f.run(), {'E9'}, ['data/drift.json sha256', 're-computed'])

    def test_the_clones_moved_since(self):
        write(os.path.join(self.f.estate, 'repoa', 'f9.txt'), 'new\n')
        self.assertFails(self.f.run(), {'E9'}, ['re-computed'])

    def test_one_trailing_byte(self):
        with open(self.f.p('data/drift.json'), 'a') as fh:
            fh.write('\n')
        self.f.recut()
        self.assertFails(self.f.run(), {'E9'}, ['re-computed'])

    def test_drift_tool_missing(self):
        os.remove(os.path.join(self.f.root, 'tools', 'drift.py'))
        self.assertFails(self.f.run(), {'E9'}, ['tools/drift.py missing'])

    def test_drift_tool_crashes(self):
        write(os.path.join(self.f.root, 'tools', 'drift.py'), 'raise SystemExit("heads unreadable")\n')
        self.assertFails(self.f.run(), {'E9'}, ['tools/drift.py --heads exited 1'])

    def test_drift_unreadable(self):
        write(self.f.p('data/drift.json'), '{"heads": '); self.f.recut()
        self.assertFails(self.f.run(), {'E9'}, ['data/drift.json unreadable'])

    def test_clone_missing_is_not_evaluated_and_strict_fails(self):
        shutil.rmtree(os.path.join(self.f.estate, 'repob'))
        r = self.f.run()
        self.assertPasses(r)
        self.assertEqual(r.status['E9'], 'NOT EVALUATED', r.out)
        self.assertIn('repob', r.text['E9'])
        r = self.f.run('--strict')
        self.assertEqual((r.result, r.code), ('FAIL', 1), r.out)
        self.assertIn('NOT EVALUATED under --strict', r.out) if 'under --strict' in r.out else None


@unittest.skipIf(not REAL, 'pass --real to mutate a copy of this repository\'s Edition 5 folder')
@unittest.skipIf(not ROOT, 'repository root not found')
class TRealCopy(unittest.TestCase):
    """the same negative cases on a copy of this repository's newest folder that holds modules.json (E1-E4); the
    copy's own baseline verdict is recorded first, so a check already failing on the folder as it stands is reported,
    not hidden"""

    @classmethod
    def setUpClass(cls):
        eds = os.path.join(ROOT, 'editions')
        cands = sorted(n for n in os.listdir(eds) if re.match(r'^\d{12}$', n) and os.path.isfile(os.path.join(eds, n, 'modules.json')))
        if not cands:
            raise unittest.SkipTest('no Edition 5 folder')
        cls.stamp = cands[-1]
        cls.tmp = tempfile.mkdtemp(prefix='edition-check-real-')
        cls.root = os.path.join(cls.tmp, 'repo')
        os.makedirs(os.path.join(cls.root, 'tools'))
        shutil.copy2(TOOL, os.path.join(cls.root, 'tools', 'edition_check.py'))
        shutil.copytree(eds, os.path.join(cls.root, 'editions'))
        cls.base = cls.run_copy()
        cls.man = json.loads(read(os.path.join(cls.root, 'editions', cls.stamp, 'modules.json')))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    @classmethod
    def run_copy(cls):
        r = subprocess.run([sys.executable, os.path.join(cls.root, 'tools', 'edition_check.py'), '--root', cls.root,
                            '--estate', os.path.join(cls.tmp, 'no-estate'), os.path.join(cls.root, 'editions', cls.stamp)],
                           capture_output=True, text=True)
        return Result(r)

    def mutate(self, rel, fn):
        p = os.path.join(self.root, 'editions', rel)
        keep = open(p, 'rb').read()
        try:
            write(p, fn(keep))
            return self.run_copy()
        finally:
            write(p, keep)

    def test_baseline_printed(self):
        sys.stderr.write('\n[real copy of editions/%s] baseline: %s; RESULT %s\n' % (
            self.stamp, ', '.join('%s %s' % (c, self.base.status.get(c)) for c in CODES), self.base.result))
        self.assertEqual(sorted(self.base.status), CODES, self.base.out)

    def test_E1_module_syntax(self):
        rec = self.man['modules'][0]
        r = self.mutate('%s/%s' % (self.stamp, rec['path']), lambda b: b + b'\n(;\n')
        self.assertEqual(r.status['E1'], 'FAIL', r.out)
        self.assertIn(os.path.basename(rec['path']), r.text['E1'])

    def test_E2_altered_byte(self):
        rec = self.man['modules'][-1]
        def flip(b):
            b = bytearray(b); i = b.rfind(b'e'); b[i] = ord('E'); return bytes(b)
        r = self.mutate('%s/%s' % (self.stamp, rec['path']), flip)
        self.assertEqual(r.status['E2'], 'FAIL', r.out)
        self.assertIn('%s refused: sha256 mismatch' % rec['id'], r.text['E2'])

    def test_E3_earlier_folder_edited(self):
        olds = [s for s in sorted(os.listdir(os.path.join(self.root, 'editions')))
                if re.match(r'^\d{12}$', s) and s < self.stamp and os.path.isfile(os.path.join(self.root, 'editions', s, 'proof', 'edition-sha256.txt'))]
        self.assertTrue(olds)
        r = self.mutate('%s/index.html' % olds[-1], lambda b: b + b'\n')
        self.assertEqual(r.status['E3'], 'FAIL', r.out)
        self.assertIn('editions/%s: index.html sha256' % olds[-1], r.text['E3'])

    def test_E4_stamps_disagree(self):
        def bend(b):
            t = b.decode('utf-8'); m = re.search(r'<a href="(\d{12})/">', t)
            return t.replace(m.group(0), '<a href="%s/">' % ('199901010000')).encode('utf-8')
        r = self.mutate('index.html', bend)
        self.assertEqual(r.status['E4'], 'FAIL', r.out)


if __name__ == '__main__':
    unittest.main(verbosity=2)
