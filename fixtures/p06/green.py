from functools import lru_cache


@lru_cache(maxsize=2048)                                   # bounded: LRU eviction
def lookup(key):
    return "payload-" * 30 + str(key)
