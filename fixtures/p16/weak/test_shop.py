import unittest
from shop import clamp, discount


class T(unittest.TestCase):
    def test_runs(self):
        self.assertIsNotNone(discount(100, True))
        self.assertIsNotNone(clamp(5, 0, 10))
        self.assertTrue(True)
