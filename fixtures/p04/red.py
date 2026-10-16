def has_duplicates(items):                                 # list membership inside a loop: O(n^2)
    for i, x in enumerate(items):
        if x in items[:i]:
            return True
    return False
