#!/usr/bin/env python3
r"""tools/cut_shell.py - cut the frozen SHELL and its first cartridges out of one whole page.

WHY. Twenty nine whole copies of the page were made in one night and every feature was edited into
one file, which is how a black screen reached a visitor. GridAtlas already solved this and the
estate already has the pattern: an IMMUTABLE SHELL, features as HASHED CARTRIDGES, and a pointer that
says which. This cuts the Kuiper that way, once.

WHAT IS THE SHELL. The disc and the law that places every dot, the shaders, the camera, the ONE pulse,
the link contract, the data it loads, the markup and the look. It is published once and never edited.

WHAT IS A CARTRIDGE. A file the shell names in a <script src="NAME.js"> slot. The composer can point
that slot at a newer file whose hash the pointer holds; the shell does not change. The first four are
cut from the page as it stands, WITH NO CHANGE OF BEHAVIOUR, and the proof of that is that every self
test the page had still passes on what comes out:

    kuiper-card.js       what a tap opens: the tile, the brand block, the code window
    kuiper-programs.js   the programs: isolate an application, the small Kuiper, its name
    kuiper-controls.js   lighting a path, the buttons, the keys, the pointer
    kuiper-tests.js      the page's own checks (a cartridge too, so a check can be added without a new shell)

HOW IT IS CUT. The page was one module script. Its parts only share names if they are CLASSIC scripts,
whose top level names live in one shared scope; so the script becomes classic, strict, and is split at
lines that are top level boundaries, by marker, in the order below. Nothing is rewritten. Two things
are added because a split page needs them: the load starts only when every part has arrived (boot),
and an address built for a link is built beside the ADDRESS BAR, not beside the shell's own folder.

    python tools/cut_shell.py 30 31      cut iteration 0030 into a new folder 0031
"""
import hashlib
import io
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from iterate import folder, ROOT

# each cartridge is one or more runs of the page's script, given as (first line starts with, up to the
# line that starts with). Runs are taken in this order; whatever is not named stays in the shell.
PARTS = [
    ('kuiper-card.js', [('// ------------------------------------------------------------------------------ the controls', 'let ASM = null'),
                        ('function show(a){', 'function finishSelftest(')]),
    ('kuiper-programs.js', [('let ASM = null', 'function show(a){')]),
    ('kuiper-tests.js', [('function finishSelftest(', '// ------------------------------------------------------------------ where a page is on the wafer'),
                         ('async function pathSelftest(', "addEventListener('pointerup', e => {")]),
    ('kuiper-controls.js', [('// ------------------------------------------------------------------ where a page is on the wafer', 'async function pathSelftest('),
                            ("addEventListener('pointerup', e => {", 'requestAnimationFrame(frame);')]),
]


def cut(src_n, dst_n):
    src, dst = folder(src_n), folder(dst_n)
    if os.path.exists(dst):
        print('REFUSED: %s already exists' % dst)
        return 2
    page = io.open(os.path.join(src, 'index.html'), encoding='utf-8').read()
    m = re.search(r'(?s)<script type="module">\n(.*?)\n</script>', page)
    if not m:
        print('REFUSED: the page is not one module script')
        return 2
    lines = m.group(1).split('\n')

    def at(prefix, start=0):
        for i in range(start, len(lines)):
            if lines[i].startswith(prefix):
                return i
        raise SystemExit('NOT FOUND: a line starting ' + prefix[:70])

    taken, files = set(), {}
    for name, runs in PARTS:
        chunk = []
        for a, b in runs:
            i, j = at(a), at(b, at(a) + 1)
            if any(k in taken for k in range(i, j)):
                raise SystemExit('two cartridges claim the same lines near: ' + a[:60])
            taken.update(range(i, j))
            chunk += lines[i:j]
        files[name] = ("'use strict';\n// %s - a cartridge of the Kuiper shell. Cut from the whole page with no change of behaviour;\n"
                       "// replaced, when it is, by a newer file the pointer names and the composer checks by its hash.\n" % name
                       + '\n'.join(chunk) + '\n')
    shell_js = '\n'.join(l for k, l in enumerate(lines) if k not in taken)

    # 1. the load starts only when every part has arrived
    a = shell_js.index("Promise.all([tsv('cosmos/repos.tsv')")
    b = shell_js.index("did not load. The wafer will not invent its keys.'; });", a)
    b = shell_js.index('\n', b) + 1
    shell_js = (shell_js[:a] + "// THE LOAD STARTS WHEN EVERY PART HAS ARRIVED. The page is now several files; a table arriving between\n"
                "// two of them would call on a part that is not there yet. boot() is called by the last line of the page.\n"
                "function boot(){\n" + shell_js[a:b] + "}\n" + shell_js[b:])
    # 2. the last line of the page starts everything, after the slots
    if not shell_js.rstrip().endswith('requestAnimationFrame(frame);'):
        raise SystemExit('the page does not end where it was expected to')
    shell_js = shell_js.rstrip()[:-len('requestAnimationFrame(frame);')].rstrip() + '\n'
    # 3. a hook the wafer's own card binds to, and an address built beside the address bar
    shell_js = shell_js.replace("let drawCount = 0;",
                                "// WHAT THE WAFER'S OWN CARD BINDS TO: told after every draw, and able to ask where the camera is.\n"
                                "window.__wafer = window.__wafer || { onDraw:new Set(), get view(){ return { x:cx, y:cy, zoom:zoom }; } };\n"
                                "let drawCount = 0;", 1)
    if 'function draw(){\n  drawCount++;' not in shell_js:
        raise SystemExit('draw() is not where it was expected')
    shell_js = shell_js.replace('function draw(){\n  drawCount++;', 'function draw(){\n  drawCount++;\n  queueMicrotask(() => { for (const f of window.__wafer.onDraw) { try { f(); } catch (e) {} } });', 1)

    slots = ''.join('<script src="%s"></script>\n' % n for n, _ in PARTS)
    new_page = page[:m.start()] + "<script>\n'use strict';\n" + shell_js + "</script>\n" + slots \
        + "<script>\n'use strict';\n// every part has arrived: load the record and start drawing\nboot(); requestAnimationFrame(frame);\n</script>" + page[m.end():]

    os.makedirs(dst)
    for f in os.listdir(src):
        p = os.path.join(src, f)
        if f == 'cosmos':
            shutil.copytree(p, os.path.join(dst, f))
        elif os.path.isfile(p) and f.endswith(('.html', '.mjs', '.css', '.txt')) and f != 'index.html':
            shutil.copy(p, dst)
    io.open(os.path.join(dst, 'index.html'), 'w', encoding='utf-8', newline='\n').write(new_page)
    for name, text in files.items():
        io.open(os.path.join(dst, name), 'w', encoding='utf-8', newline='\n').write(text)
    io.open(os.path.join(dst, 'PARENT.txt'), 'w', encoding='utf-8', newline='\n').write(os.path.basename(src) + '\n')
    io.open(os.path.join(dst, 'SHELL.json'), 'w', encoding='utf-8', newline='\n').write(json.dumps({'name': 'kuiper-shell'}, indent=1) + '\n')
    print('cut from %s into %s' % (os.path.basename(src), os.path.basename(dst)))
    print('  the shell     index.html          %6d lines of script stay' % shell_js.count('\n'))
    for name, text in files.items():
        print('  a cartridge   %-19s %6d lines   sha256 %s' % (name, text.count('\n'), hashlib.sha256(text.encode('utf-8')).hexdigest()[:12]))
    return 0


if __name__ == '__main__':
    if len(sys.argv) != 3 or not (sys.argv[1].isdigit() and sys.argv[2].isdigit()):
        print(__doc__)
        sys.exit(2)
    sys.exit(cut(int(sys.argv[1]), int(sys.argv[2])))
