#!/usr/bin/env python3
"""build-see-through-json.py  Opus team 5, NL-010 step 5.6: the 5,800 See Through star keys as a Kuiper layer.

Writes editions/<stamp>/data/see-through.json, a code-feature-collection.v1 (galaxies-wafers@fff6fc6 README.md:11-18;
team-2/STEPS.md 3.2): geometry carries keys, never coordinates; the Kuiper places each key with keyPlace and nothing else.

The law, quoted (kuiper-belt see-through/202610050609/descent.js):
  :19   var NRULE = 20000;   // grid.js N: particle i carries key floor((i + 0.5) * SPACE / NRULE)
  :963  key = Math.floor((ki + 0.5) * S.SPACE / NRULE)
  :965  if (c === 0) S.subKey[p] = key;            -> star j < 5800 is the star that lands on substation j
The SPACE remap (ROADMAP step 5.6): See Through freezes SPACE 59,637,070,538 (kuiper-law.js:36); the wafer today is
cosmos/wafer-meta.json:4 address_space. This layer is cut with the WAFER's address_space, so the sky and the wafer agree;
the old star key of substation j under the frozen sky is recomputed by the remap formula in law.remap (not stored).
Names: see-through/202610050609/grid-data.js KGGridData.substations.names (OpenStreetMap contributors, ODbL 1.0).
Integer arithmetic: floor((2j+1) * SPACE / 40000) == floor((j+0.5)*SPACE/20000) exactly; the script also checks that
the float64 expression See Through evaluates gives the same integer for every j (asserted below).

Usage, from the kuiper-belt root:  python3 editions/202611012135/handoff/05-see-through/build-see-through-json.py
(CERN-OHL-S v2, as the module: it quotes and evaluates See Through's star-key rule above, ROADMAP 9.8. Names are ODbL 1.0 data.)
"""
import hashlib, json, os, re, subprocess, sys

EDITION = '202611012135'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
ST = 'see-through/202610050609'
NRULE, NSUB, FROZEN = 20000, 5800, 59637070538          # descent.js:19, :20; kuiper-law.js:36


def rd(p):
    with open(os.path.join(ROOT, p), 'rb') as f:
        return f.read()


def sha(b):
    return hashlib.sha256(b).hexdigest()


def git_head():
    try:
        return subprocess.check_output(['git', '-C', ROOT, 'rev-parse', 'HEAD'], text=True).strip()
    except Exception:
        return 'UNKNOWN'


def star_key(j, space):
    return ((2 * j + 1) * space) // (2 * NRULE)


def main():
    meta_b = rd('cosmos/wafer-meta.json'); meta = json.loads(meta_b)
    space = int(meta['address_space'])
    # re-sum, never trust one number: lines + gap_before over cosmos/wafer.tsv (index.html:203-208)
    wafer_b = rd('cosmos/wafer.tsv'); k = 0
    for line in wafer_b.decode().split('\n'):
        if not line or line[0] == '#':
            continue
        p = line.split('\t'); k += int(p[4]) + int(p[1])
    if k != space:
        sys.exit('REFUSED: cosmos/wafer.tsv sums to %d, wafer-meta.json says %d' % (k, space))
    gd_b = rd(ST + '/grid-data.js'); gd = gd_b.decode()
    m = re.search(r'\(window\.KGGridData = (\{.*\})\);\s*$', gd, re.S)
    if not m:
        sys.exit('REFUSED: grid-data.js shape not recognised')
    G = json.loads(m.group(1)); subs = G['substations']
    if int(subs['n']) != NSUB:
        sys.exit('REFUSED: grid-data.js substations.n %s != %d' % (subs['n'], NSUB))
    names = subs.get('names') or {}
    feats, named = [], 0
    for j in range(NSUB):
        key = star_key(j, space)
        assert key == int(((j + 0.5) * space) // NRULE) == int(__import__('math').floor((j + 0.5) * space / NRULE)), j
        assert 0 <= key < space
        nm = names.get(str(j)) if isinstance(names, dict) else (names[j] if j < len(names) else None)
        nm = nm or ''
        named += 1 if nm else 0
        props = {'sub': j}
        if nm:
            props['name'] = nm                     # 1,340 substations have no name in the public file; nameOf says so
        feats.append({'type': 'Feature', 'geometry': {'type': 'Point', 'key': key}, 'properties': props})
    out = {
        'type': 'CodeFeatureCollection', 'format': 'code-feature-collection.v1', 'substrate': 'kuiper.wafer.v1',
        'layer': {'id': 'see-through', 'key': 'layer:see-through', 'label': 'See Through stars', 'group': 'THE APPS',
                  'colour': '#2ee6e6', 'meaning': 'the instrument',
                  'note': 'The 5,800 stars of See Through that land on the 5,800 UK substations: star j carries key '
                          'floor((j + 0.5) * SPACE / 20000), placed here by keyPlace, the same law See Through uses. '
                          'A star is a line of code, not a substation; tap one to fall to its substation in See Through.'},
        'licence': 'Data CC BY 4.0 (kuiper-belt); substation names (c) OpenStreetMap contributors, ODbL 1.0; '
                   'See Through is CERN-OHL-S v2 (see-through/202610050609/LICENSE.md:3-6) and is linked, not copied',
        'attribution': 'Substation names (c) OpenStreetMap contributors, ODbL 1.0 (see-through/202610050609/NOTICE.md:22-25; grid-data.js:7)',
        'law': {'nrule': NRULE, 'nsub': NSUB, 'formula': 'key_j = floor((j + 0.5) * space / nrule), j < nsub',
                'source': 'kuiper-belt see-through/202610050609/descent.js:19, :963, :965',
                'space': space, 'space_source': 'cosmos/wafer-meta.json:4 address_space',
                'space_frozen': FROZEN, 'space_frozen_source': 'see-through/202610050609/kuiper-law.js:36',
                'remap': 'j = floor(key * nrule / space_old); valid when floor((j + 0.5) * space_old / nrule) == key; '
                         'then key_new = floor((j + 0.5) * space_new / nrule)'},
        'see_through': '202610050609', 'edition': EDITION, 'space': space,
        'provenance': {'kuiper_belt': git_head(), 'sources': [
            {'path': 'cosmos/wafer-meta.json', 'sha256': sha(meta_b)},
            {'path': 'cosmos/wafer.tsv', 'sha256': sha(wafer_b)},
            {'path': ST + '/grid-data.js', 'sha256': sha(gd_b)}],
            'tool': 'editions/' + EDITION + '/handoff/05-see-through/build-see-through-json.py'},
        'stats': {'features': NSUB, 'named': named, 'unnamed': NSUB - named,
                  'min_key': feats[0]['geometry']['key'], 'max_key': feats[-1]['geometry']['key']},
        'features': feats}
    dst = os.path.join(ROOT, 'editions', EDITION, 'data', 'see-through.json')
    b = (json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    with open(dst, 'wb') as f:
        f.write(b)
    print(json.dumps({'file': os.path.relpath(dst, ROOT), 'bytes': len(b), 'sha256': sha(b), 'features': NSUB,
                      'named': named, 'space': space, 'min_key': out['stats']['min_key'], 'max_key': out['stats']['max_key']}))


if __name__ == '__main__':
    main()
