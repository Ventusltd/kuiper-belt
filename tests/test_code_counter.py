import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/"tools"))
import code_counter as c

def run(repo,*a):
    return subprocess.check_output(["git","-C",str(repo),*a],stderr=subprocess.DEVNULL).decode().strip()

def commit(repo):
    run(repo,"add",".")
    run(repo,"-c","user.name=fixture","-c","user.email=fixture@example.invalid","commit","-m","fixture")
    oid=run(repo,"rev-parse","HEAD")
    t=int(run(repo,"show","-s","--format=%ct",oid))
    total=sum(c.historical_lines(p.read_bytes()) for p in repo.rglob("*") if p.is_file() and ".git" not in p.parts)
    return (t,oid[:12],total)

class CounterTests(unittest.TestCase):
    def test_exact_lines(self):
        self.assertEqual(list(c.source_lines(b"x\r\nx\n x\nx \n \t\nlast")), [b"x",b"x",b" x",b"x ",b"last"])
        self.assertEqual(list(c.source_lines(b"\x00hello")),[])
        self.assertEqual(list(c.source_lines(b"\xff")),[])
        self.assertEqual(list(c.source_lines(b"end\r")),[b"end\r"])
        self.assertEqual(list(c.source_lines(b"")),[])
    def test_classification(self):
        self.assertTrue(c.eligible(b"src/code.py",b"100644"))
        for p in (b"vendor/code.py",b"docs/code.py",b"src/code.min.js",b"src/code.json"):
            self.assertFalse(c.eligible(p,b"100644"))
        self.assertFalse(c.eligible(b"code.py",b"120000"))
    def test_exact_decimal(self):
        self.assertEqual(c.integer("9007199254740993"),9007199254740993)
        for x in ("01","-1","1e3","1.2",1,None):
            with self.assertRaises(ValueError): c.integer(x)
    def test_historical_line_law(self):
        self.assertEqual(c.historical_lines(b"a\nb"),2)
        self.assertEqual(c.historical_lines(b"a\n"),1)
        self.assertEqual(c.historical_lines(b"\0abc\n"),0)
    def test_git_repeated_and_path_sensitive(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)
            r=root/"one";r.mkdir();run(r,"init","-q")
            (r/"a.txt").write_bytes(b"same\n")
            one=commit(r)
            (r/"a.py").write_bytes(b"same\n")
            (r/"b.py").write_bytes(b"same\r\n other\n")
            two=commit(r)
            s=root/"two";s.mkdir();run(s,"init","-q")
            (s/"c.py").write_bytes(b"same\nnew")
            three=commit(s)
            db=c.open_db(root/"db")
            try:
                self.assertEqual(c.measure(r,[one,two],db)[0],3)
                self.assertEqual(c.measure(s,[three],db)[0],2)
                self.assertEqual(db.execute("SELECT count(*) FROM lines").fetchone()[0],3)
                self.assertEqual(c.measure(r,[one,two],db)[0],3)
                self.assertEqual(db.execute("SELECT count(*) FROM lines").fetchone()[0],3)
                (s/"c.py").write_bytes(b"new-value\n")
                four=commit(s)
                with self.assertRaises(ValueError):
                    c.measure(s,[four,(four[0],four[1],999)],db)
                self.assertEqual(db.execute("SELECT count(*) FROM lines").fetchone()[0],3)
                with self.assertRaises(subprocess.CalledProcessError):
                    c.measure(s,[(four[0],"000000000000",1)],db)
                with self.assertRaises(ValueError):
                    c.measure(s,[(four[0]+1,four[1],four[2])],db)
            finally:
                db.close()
    def test_pinned_fixture(self):
        with tempfile.TemporaryDirectory() as t:
            r=Path(t);run(r,"init","-q");(r/"cosmos").mkdir()
            meta=dict(issued_keys=9007199254740993,unissued_keys=0,address_space=9007199254740993,
                      commits=1,repositories=1,first_unix=10,last_unix=10,gap_keys_per_second=600,cap_seconds=1209600)
            files={"wafer.tsv":"10\t9007199254740993\t0\t0123456789ab\t0\n",
                   "repos.tsv":"0\tpublic-fixture\t9007199254740993\n",
                   "wafer-meta.json":json.dumps(meta),
                   "standing.tsv":"public-fixture\t0123456789ab\t10\t1\t2\n"}
            for k,v in files.items(): (r/"cosmos"/k).write_text(v)
            commit(r);pin=run(r,"rev-parse","HEAD")
            a=c.candidate(r,pin,[])
            self.assertEqual(a["metrics"]["total_historical_line_occurrences"]["value"],"9007199254740993")
            self.assertIsNone(a["metrics"]["unique_code_lines"]["value"])
            self.assertEqual(a,c.candidate(r,pin,[]))
            (r/"cosmos"/"wafer.tsv").write_text(files["wafer.tsv"]+files["wafer.tsv"])
            commit(r)
            with self.assertRaises(ValueError): c.baseline(r,run(r,"rev-parse","HEAD"))
            self.assertEqual(a,c.candidate(r,pin,[])) # late commit cannot change pinned receipt

if __name__=="__main__":
    unittest.main()
