def has_duplicates(items):                                 # hash set: O(n)
    seen = set()
    for x in items:
        if x in seen:
            return True
        seen.add(x)
    return False
