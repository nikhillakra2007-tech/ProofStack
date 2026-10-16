import time

_DB = {1: {"owner": "alice", "total": 120}, 2: {"owner": "bob", "total": 75}}
_CACHE = {}                                                # key includes the principal


def _slow_fetch(oid):
    time.sleep(0.01)
    return _DB.get(oid)


def get_object(principal, object_id):
    key = (principal, object_id)
    if key in _CACHE:
        return _CACHE[key]
    row = _slow_fetch(object_id)
    if row is None or row["owner"] != principal:
        raise PermissionError("forbidden")
    _CACHE[key] = row
    return row
