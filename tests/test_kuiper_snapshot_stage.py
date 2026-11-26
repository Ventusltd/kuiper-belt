import pathlib
import tempfile
import unittest
from tools import kuiper_snapshot as s
from tools import kuiper_snapshot_stage as st
from test_kuiper_snapshot import fixture,counter,PIN,NEXT

def bundle(root,data,pin,receipt=True):
    m,files=s.assemble(data,pin,counter(data,pin) if receipt else None)
    body=s.canonical(m); key=s.digest(body); d=root/key
    d.mkdir()
    for path,b in files.items():
        p=d/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
    (d/"manifest.json").write_bytes(body)
    return key

class StageTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=pathlib.Path(self.tmp.name)
        self.a=bundle(self.root,fixture(),PIN)
        self.b=bundle(self.root,fixture(True),NEXT)
        st.activate(self.root,self.a,None)
    def test_successive_no_change_rollback(self):
        p=st.activate(self.root,self.b,self.a)
        self.assertEqual(st.activate(self.root,self.b,self.b),p)
        self.assertEqual(st.read_with_fallback(self.root)["key"],self.b)
        self.assertEqual(st.activate(self.root,self.a,self.b,rollback=True)["current"],self.a)
    def test_stale_writer(self):
        st.activate(self.root,self.b,self.a)
        with self.assertRaises(ValueError): st.activate(self.root,self.a,self.a)
        self.assertEqual(st.read_pointer(self.root)["current"],self.b)
    def test_failed_publish_retains_pointer(self):
        (self.root/self.b/"counter.json").write_bytes(b"{}")
        with self.assertRaises(ValueError): st.activate(self.root,self.b,self.a)
        self.assertEqual(st.read_pointer(self.root)["current"],self.a)
    def test_corrupt_cache_falls_back(self):
        st.activate(self.root,self.b,self.a)
        (self.root/self.b/"manifest.json").write_bytes(b"{}")
        read=st.read_with_fallback(self.root,self.a)
        self.assertTrue(read["stale"]);self.assertEqual(read["key"],self.a)
    def test_missing_counter_rejected(self):
        c=bundle(self.root,fixture(True),"c"*40,False)
        with self.assertRaises(ValueError): st.activate(self.root,c,self.a)
    def test_reverse_requires_explicit_rollback(self):
        st.activate(self.root,self.b,self.a)
        with self.assertRaises(ValueError): st.activate(self.root,self.a,self.b)
    def test_invalid_pointer_fallback(self):
        (self.root/"latest.json").write_bytes(b"broken")
        self.assertEqual(st.read_with_fallback(self.root,self.a)["key"],self.a)
    def test_missing_member_retains_pointer(self):
        (self.root/self.b/s.PATHS[0]).unlink()
        with self.assertRaises(OSError): st.activate(self.root,self.b,self.a)
        self.assertEqual(st.read_pointer(self.root)["current"],self.a)
