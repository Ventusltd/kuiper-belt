#!/usr/bin/env python3
"""202611021026-build-see-through-json.py  Opus team 5 (OPUS-5 lead), NL-010 step 5: the 5,800 See Through star keys as
the Kuiper layer `see-through` (data/layers.json record "See Through stars"). CERN-OHL-S-2.0: it evaluates See Through's
star-key rule (see-through/202611020012/descent.js:26, :963, :965); the module that reads its output does not.

Revision of build-see-through-json.py (editions/202611012135/handoff/05-see-through/, unchanged) for Kuiper Edition 11:
the edition, the See Through folder and the root are arguments, so the file is cut from main's bytes, not the branch's.

The law, quoted (see-through/202611020012/descent.js):
  :26   var NRULE = 20000;   // grid.js N: particle i carries key floor((i + 0.5) * SPACE / NRULE)
  :963  key = Math.floor((ki + 0.5) * S.SPACE / NRULE)
  :979  if (c === 0) S.subKey[p] = key;            -> star j < 5800 is the star that lands on substation j
SPACE: See Through 202611020012 re-cuts its sky from ../../cosmos/wafer-meta.json address_space (descent.js:16), the
same number the Kuiper's engine sums from cosmos/wafer.tsv (index.html:224); this script re-sums wafer.tsv and refuses a
disagreement, so a key here is the key See Through gives the same star.
Names: see-through/202611020012/grid-data.js KGGridData.substations.names ((c) OpenStreetMap contributors, ODbL 1.0).

Usage:  python3 202611021026-build-see-through-json.py --root <kuiper-belt tree at main> --edition 202611021017 \
            --see-through see-through/202611020012 --out <edition folder>/data/see-through.json
"""
import argparse, hashlib, json, math, os, re, sys

NRULE, NSUB = 20000, 5800


def sha(b):
    return hashlib.sha256(b).hexdigest()


def star_key(j, space):
    return ((2 * j + 1) * space) // (2 * NRULE)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', required=True)
    ap.add_argument('--edition', required=True)
    ap.add_argument('--see-through', dest='st', required=True)
    ap.add_argument('--commit', default='UNKNOWN')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    if not re.match(r'^\d{12}$', a.edition):
        sys.exit('REFUSED: edition is not twelve digits')
    rd = lambda p: open(os.path.join(a.root, p), 'rb').read()
    meta_b = rd('cosmos/wafer-meta.json'); space = int(json.loads(meta_b)['address_space'])
    wafer_b = rd('cosmos/wafer.tsv'); k = 0
    for line in wafer_b.decode().split('\n'):
        if not line or line[0] == '#':
            continue
        p = line.split('\t'); k += int(p[4]) + int(p[1])
    if k != space:
        sys.exit('REFUSED: cosmos/wafer.tsv sums to %d, wafer-meta.json says %d' % (k, space))
    gd_b = rd(a.st + '/grid-data.js'); gd = gd_b.decode()
    m = re.search(r'\(window\.KGGridData = (\{.*\})\);\s*$', gd, re.S)
    if not m:
        sys.exit('REFUSED: grid-data.js shape not recognised')
    subs = json.loads(m.group(1))['substations']
    if int(subs['n']) != NSUB:
        sys.exit('REFUSED: grid-data.js substations.n %s != %d' % (subs['n'], NSUB))
    names = subs.get('names') or {}
    feats, named, seen = [], 0, set()
    for j in range(NSUB):
        key = star_key(j, space)
        assert key == math.floor((j + 0.5) * space / NRULE), j          # the float64 See Through evaluates agrees
        assert 0 <= key < space and key not in seen, j
        seen.add(key)
        nm = names.get(str(j)) if isinstance(names, dict) else (names[j] if j < len(names) else None)
        props = {'sub': j}
        if nm:
            props['name'] = nm; named += 1
        feats.append({'type': 'Feature', 'geometry': {'type': 'Point', 'key': key}, 'properties': props})
    out = {
        'type': 'CodeFeatureCollection', 'format': 'code-feature-collection.v1', 'substrate': 'kuiper.wafer.v1',
        'layer': {'id': 'see-through', 'key': 'layer:see-through', 'label': 'See Through stars', 'group': 'THE APPS',
                  'colour': '#2ee6e6', 'meaning': 'the instrument',
                  'note': 'The 5,800 stars of See Through that land on the 5,800 substations of its grid: star j carries '
                          'key floor((j + 0.5) * space / 20000). The Kuiper places each key with keyPlace and nothing '
                          'else. A star is a key on the wafer, not a substation; its link opens See Through at that star.'},
        'licence': 'ODbL 1.0 for the substation names ((c) OpenStreetMap contributors); the keys are arithmetic of '
                   'See Through\'s star-key rule (see-through/202611020012/LICENSE.md, CERN-OHL-S v2), linked, not copied into the module',
        'attribution': 'Substation names (c) OpenStreetMap contributors, ODbL 1.0 (' + a.st + '/NOTICE.md)',
        'law': {'nrule': NRULE, 'nsub': NSUB, 'formula': 'key_j = floor((j + 0.5) * space / nrule), j < nsub',
                'source': a.st + '/descent.js:26, :963, :979', 'space': space,
                'space_source': 'cosmos/wafer-meta.json address_space, re-summed from cosmos/wafer.tsv'},
        'see_through': a.st.rstrip('/').split('/')[-1], 'edition': a.edition, 'space': space,
        'provenance': {'kuiper': a.commit, 'sources': [
            {'path': 'cosmos/wafer-meta.json', 'sha256': sha(meta_b)},
            {'path': 'cosmos/wafer.tsv', 'sha256': sha(wafer_b)},
            {'path': a.st + '/grid-data.js', 'sha256': sha(gd_b)}],
            'tool': 'editions/202611012135/handoff/05-see-through/202611021026-build-see-through-json.py'},
        'stats': {'features': NSUB, 'named': named, 'unnamed': NSUB - named,
                  'min_key': feats[0]['geometry']['key'], 'max_key': feats[-1]['geometry']['key']},
        'features': feats}
    b = (json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    with open(a.out, 'wb') as f:
        f.write(b)
    print(json.dumps({'file': a.out, 'bytes': len(b), 'sha256': sha(b), 'features': NSUB, 'named': named,
                      'space': space, 'edition': a.edition}))


if __name__ == '__main__':
    main()
