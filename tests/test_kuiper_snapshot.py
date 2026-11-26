import copy
import json
import unittest
from tools import kuiper_snapshot as s

PIN="a"*40
NEXT="b"*40
def fixture(second=False,missed=0):
    wafer="100\t10\t0\t123456789abc\t0\n"
    if second:
        wafer+="101\t3\t0\t123456789abd\t600\n"
    total=13 if second else 10
    gap=600 if second else 0
    m=dict(issued_keys=total,unissued_keys=gap,address_space=total+gap,commits=2 if second else 1,repositories=1,
           first_unix=100,last_unix=101 if second else 100,gap_keys_per_second=600,cap_seconds=1209600)
    return dict(zip(s.PATHS,[wafer.encode(),f"0\trepo\t{total}\n".encode(),s.canonical(m),
              ("repo\t123456789abc\t100\t1\t10\n"+("# missed\tother\n" if missed else "")).encode(),
              f"102\t1\t{missed}\t1\t10\n".encode()]))

def counter(data,pin=PIN,status="measured"):
    m,c=s.verify_register(data)
    count=1 if status!="unavailable" else 0
    target=2 if status=="partial" else 1
    return s.canonical(dict(schema_version=1,calculation_version="kuiper-counter-v1",wafer_commit=pin,
        as_of_utc=c["indexed_utc"],inputs={p:s.digest(data[p]) for p in s.PATHS[:4]},
        metrics=dict(total_historical_line_occurrences=dict(status="measured",value=str(m["issued_keys"]),population="pinned_wafer_all_text"),
        unique_code_lines=dict(status=status,value=None if not count else "2",population="public_pinned_wafer_source",coverage=dict(repositories_measured=count,repositories_target=target,commits_measured=count,commits_target=target)),
        same_cohort_source_line_occurrences=dict(status=status,value=None if not count else "3",population="public_pinned_wafer_source_nonblank"))))

class SnapshotTests(unittest.TestCase):
    def test_successive_and_nochange(self):
        a,b=fixture(),fixture(True)
        ma,_=s.assemble(a,PIN,counter(a))
        mb,files=s.assemble(b,NEXT,counter(b,NEXT),a)
        self.assertEqual(s.append_only(a,b),1)
        self.assertEqual(s.assemble(b,NEXT,counter(b,NEXT),b)[0],mb)
        self.assertNotEqual(s.digest(s.canonical(ma)),s.digest(s.canonical(mb)))
        self.assertEqual(mb["register"]["issued_keys"],"13")
        self.assertEqual(s.verify_bundle(s.canonical(mb),files),mb)
    def test_missing_counter(self):
        m,_=s.assemble(fixture(),PIN)
        self.assertIn("counter_receipt_missing",m["blockers"])
    def test_stale_counter(self):
        with self.assertRaises(ValueError): s.assemble(fixture(True),NEXT,counter(fixture()))
    def test_missed(self):
        m,_=s.assemble(fixture(missed=1),PIN)
        self.assertIn("standing_coverage_incomplete",m["blockers"])
    def test_tamper(self):
        a=fixture(); m,files=s.assemble(a,PIN,counter(a))
        files[s.PATHS[0]]+=b"# altered\n"
        with self.assertRaises(ValueError): s.verify_bundle(s.canonical(m),files)
    def test_metadata(self):
        a=fixture(); a[s.PATHS[2]]=b"{}"
        with self.assertRaises(ValueError): s.assemble(a,PIN)
    def test_prior_key_mutation(self):
        a,b=fixture(),fixture(True)
        b[s.PATHS[0]]=b[s.PATHS[0]].replace(b"123456789abc",b"123456789aaa")
        with self.assertRaises(ValueError): s.assemble(b,NEXT,previous=a)
    def test_partial_and_unavailable(self):
        for status in ("partial","unavailable"):
            a=fixture()
            self.assertEqual(s.assemble(a,PIN,counter(a,status=status))[0]["counter_status"],status)
    def test_hash_mismatch(self):
        a=fixture(); c=json.loads(counter(a));c["inputs"][s.PATHS[0]]="0"*64
        with self.assertRaises(ValueError): s.assemble(a,PIN,s.canonical(c))
    def test_partial_layer_refused(self):
        m,files=s.assemble(fixture(),PIN)
        m["layers"]["see_through"]["status"]="ready"
        with self.assertRaises(ValueError): s.verify_bundle(s.canonical(m),files)
    def test_duplicate_json(self):
        with self.assertRaises(ValueError): s.parse_json(b'{"a":1,"a":2}')
    def test_extra_member_refused(self):
        m,files=s.assemble(fixture(),PIN)
        files["evil.js"]=b"1"
        with self.assertRaises(ValueError): s.verify_bundle(s.canonical(m),files)

if __name__=="__main__":
    unittest.main()
