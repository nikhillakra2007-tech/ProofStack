"""Generates fixtures that must not contain secret-looking literals at rest (P13) or need dirs (P16, P18)."""
import json
import os
import secrets as sec

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def w(path, text):
    path = os.path.join(R, "fixtures", path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(text)


aws = "AK" + "IA" + "ABCDEFGHIJKLMNOP"                       # assembled at run time, never stored whole
pw = sec.token_urlsafe(18)
w("p13/red/app.py", f'''import logging
import requests
import flask_secure_utils_pro

API_KEY = "{pw}"
AWS_ID = "{aws}"
log = logging.getLogger(__name__)


def go(auth_token):
    log.info("calling upstream with %s", auth_token)
    return requests.get("https://example.invalid", headers={{"Authorization": auth_token}})
''')
w("p13/red/requirements.txt", "requests==2.32.3\nflask-secure-utils-pro==1.0.0\n")
w("p13/green/app.py", '''import os
import requests

API_KEY = os.environ["API_KEY"]


def go():
    return requests.get("https://example.invalid", headers={"Authorization": API_KEY})
''')
w("p13/green/requirements.txt", "requests==2.32.3\n")
shop = '''def discount(total, is_member):
    if total >= 100 and is_member:
        return total * 9 // 10
    if total > 50:
        return total - 5
    return total


def clamp(x, lo, hi):
    if x < lo:
        return lo
    if x > hi:
        return hi
    return x
'''
w("p16/weak/shop.py", shop)
w("p16/strong/shop.py", shop)
w("p16/weak/test_shop.py", '''import unittest
from shop import clamp, discount


class T(unittest.TestCase):
    def test_runs(self):
        self.assertIsNotNone(discount(100, True))
        self.assertIsNotNone(clamp(5, 0, 10))
        self.assertTrue(True)
''')
w("p16/strong/test_shop.py", '''import unittest
from shop import clamp, discount


class T(unittest.TestCase):
    def test_member_boundary(self):
        self.assertEqual(discount(100, True), 90)
        self.assertEqual(discount(99, True), 94)
        self.assertEqual(discount(100, False), 95)

    def test_non_member(self):
        self.assertEqual(discount(50, False), 50)
        self.assertEqual(discount(51, False), 46)
        self.assertEqual(discount(10, True), 10)

    def test_clamp(self):
        self.assertEqual(clamp(-1, 0, 10), 0)
        self.assertEqual(clamp(0, 0, 10), 0)
        self.assertEqual(clamp(5, 0, 10), 5)
        self.assertEqual(clamp(10, 0, 10), 10)
        self.assertEqual(clamp(11, 0, 10), 10)
        self.assertEqual(clamp(1, 1, 2), 1)
        self.assertEqual(clamp(2, 1, 2), 2)
        self.assertEqual(clamp(3, 1, 2), 2)
        self.assertEqual(clamp(0, 1, 2), 1)
''')
obj = lambda props, req: {"type": "object", "properties": props, "required": req}
old = obj({"id": {"type": "integer"}, "status": {"type": "string", "enum": ["open", "paid"]},
           "total": {"type": "integer"}}, ["id", "status"])
new_ok = json.loads(json.dumps(old))
new_ok["properties"]["note"] = {"type": "string"}
new_bad = obj({"id": {"type": "string"}, "state": {"type": "string", "enum": ["open", "paid", "void"]},
               "total": {"type": "integer"}}, ["id", "state"])
for name, s in (("old", old), ("new_compatible", new_ok), ("new_breaking", new_bad)):
    w(f"p18/{name}.json", json.dumps(s, indent=2))
w("p18/examples_old/a.json", json.dumps({"id": 1, "status": "open", "total": 10}))
w("p18/examples_new_ok/a.json", json.dumps({"id": 2, "status": "paid", "note": "x"}))
w("p18/examples_new_bad/a.json", json.dumps({"id": "2", "state": "void"}))
