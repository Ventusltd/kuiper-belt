# Opus team 3: delete from an index.html exactly what moved into modules/202611012141-layers.js, by content, so the
# cut can be re-made against any base (the Edition 4 copy, or the integrator's base with team 4's patch applied).
#   python3 delete-moved.py <in index.html> <out index.html>     (prints what it removed; exits non-zero if an anchor is missing)
# Apache-2.0 (kuiper-belt code).
import sys
src = open(sys.argv[1]).read().split('\n')
out = []; i = 0; n = len(src); log = []
def starts(l, p): return l.lstrip().startswith(p) if p.startswith(' ') is False else l.startswith(p)
def cut_until(start_pred, stop_pred, inclusive_stop, name):
    pass
def find(pred, frm=0):
    for j in range(frm, n):
        if pred(src[j]): return j
    raise SystemExit('not found: %s' % pred)
drop = set()
def rng(a, b, name): drop.update(range(a, b + 1)); log.append('%s: lines %d-%d' % (name, a + 1, b + 1))
# CSS of the Edition 3 LINES panel
a = find(lambda l: l.startswith('  #lines{left:0;right:0'))
b = find(lambda l: l.startswith('  #lineslist .ln.focus b'), a); rng(a, b, 'css #lines/#linesctl/#lineslist')
# Edition 2 block: loadEdition .. edFly (esc stays: it is a hook)
a = find(lambda l: l.startswith('// ============================================================ KUIPER EDITION 2'))
b = find(lambda l: l.startswith('function esc(v)'), a) - 1; rng(a, b, 'edition 2 lines layer')
# keep the page's selection variables: the page's Escape and Android-back handlers still assign edSel (harness, run 9)
keep = find(lambda l: l.startswith('let ED = [], edPlaced = [], edSel = -1'), a); drop.discard(keep); log.append('kept line %d (let ED, edPlaced, edSel, edMeta)' % (keep + 1))
a = find(lambda l: l.startswith('function edNext(step)'), b)
b = find(lambda l: l.startswith('// ============================================================ EDITION 3'), a) - 1
while src[b].strip() == '': b -= 1
rng(a, b, 'edNext/pointerup/e-E')
a = find(lambda l: l.startswith('const linesPanel = document.createElement'))
b = find(lambda l: l.startswith('document.body.appendChild(linesPanel);'), a); rng(a, b, 'LINES panel')
a = find(lambda l: l.strip() == "if (openPanel === 'lines') fillLines();"); rng(a, a, 'fillLines on open')
a = find(lambda l: l.startswith('// the lines layer: on/off'))
b = find(lambda l: 'edSel = i; const b = edPlaced[edSel]; edCard(edSel); edFly(b); }; }' in l, a); rng(a, b, 'ly* switches, fillLines, wraps')
for j, l in enumerate(src):
    if j in drop: continue
    if 'home(); dirty = true; loadEdition();' in l: l = l.replace(' loadEdition();', ''); log.append('token loadEdition(); line %d' % (j + 1))
    if l.startswith('const PANELS = {') and 'lines: linesPanel, ' in l: l = l.replace('lines: linesPanel, ', ''); log.append('token lines: linesPanel line %d' % (j + 1))
    out.append(l)
open(sys.argv[2], 'w').write('\n'.join(out))
print('\n'.join(log), file=sys.stderr)
