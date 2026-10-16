import types

dep = types.SimpleNamespace(fetch=lambda key: {"id": key})


def process(key):
    try:
        return dep.fetch(key)
    except Exception:
        return None                                          # swallowed: caller sees "no data"


def collect(item, bucket=[]):                                # evaluated once at definition time
    bucket.append(item)
    return bucket
