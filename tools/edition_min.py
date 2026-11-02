#!/usr/bin/env python3
"""keys-min.json: only the fields the edition page draws, taken from keys.json, which stays as the evidence.

keys.json (1.7 MB) carries 36 fields per record and one record whose line_text is a 1.24 MB one-line file;
the page reads 14 fields, and from Edition 5 the card law reads line_text and quote_check too. This writes them, in a fixed order, minified, LF-terminated, with the sha256 of
the keys.json it came from, so the proof can tie the two together.

usage: python3 tools/edition_min.py editions/<stamp>          writes editions/<stamp>/keys-min.json
       python3 tools/edition_min.py editions/<stamp> --check  verifies an existing keys-min.json against keys.json
"""
import hashlib, json, os, sys

FIELDS = ('id', 'key', 'on_wafer', 'verified', 'class', 'title', 'repo', 'path', 'line',
          'quote', 'destination', 'commit', 'pattern', 'worker', 'finding',
          # EDITION 5 (integrator, Opus team 10): the card law (ROADMAP step 2, L11) makes line_text the header of
          # every card, verbatim, so it is kept whole; quote_check is read by the card's "register quote" row.
          'line_text', 'quote_check')

def build(folder):
    raw = open(os.path.join(folder, 'keys.json'), 'rb').read()
    j = json.loads(raw)
    summary = dict(j.get('summary') or {})
    summary.update(source='keys.json', source_sha256=hashlib.sha256(raw).hexdigest(), fields=list(FIELDS))
    bodies = [{k: b[k] for k in FIELDS if k in b} for b in j['bodies']]
    return {'summary': summary, 'bodies': bodies}

def text(obj):
    return json.dumps(obj, separators=(',', ':'), ensure_ascii=False) + '\n'

def main(argv):
    folder = argv[1]
    dst = os.path.join(folder, 'keys-min.json')
    want = text(build(folder))
    if '--check' in argv:
        have = open(dst, 'rb').read().decode('utf-8')
        ok = have == want
        print('keys-min.json %s (%d bytes)' % ('matches keys.json' if ok else 'DIFFERS from keys.json', len(have.encode())))
        return 0 if ok else 1
    with open(dst, 'w', encoding='utf-8', newline='\n') as f:
        f.write(want)
    print('wrote %s: %d records, %d fields each, %d bytes (keys.json %d bytes)' % (
        dst, len(json.loads(want)['bodies']), len(FIELDS), len(want.encode()), os.path.getsize(os.path.join(folder, 'keys.json'))))
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv))
