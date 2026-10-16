_CACHE = {}                                                # module-level, never evicted


def lookup(key):
    if key not in _CACHE:
        _CACHE[key] = "payload-" * 30 + str(key)
    return _CACHE[key]
