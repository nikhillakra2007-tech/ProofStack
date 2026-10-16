import unittest
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
