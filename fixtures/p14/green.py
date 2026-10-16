import types

dep = types.SimpleNamespace(fetch=lambda key: {"id": key})


class UpstreamError(RuntimeError):
    pass


def process(key):
    try:
        return dep.fetch(key)
    except ConnectionError as e:
        raise UpstreamError(f"fetch failed for {key!r}") from e      # propagate with cause


def collect(item, bucket=None):
    bucket = [] if bucket is None else bucket
    bucket.append(item)
    return bucket
