def discount(total, is_member):
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
