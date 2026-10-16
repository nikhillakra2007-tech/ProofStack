import time

_DB = {1: {"owner": "alice", "total": 120}, 2: {"owner": "bob", "total": 75}}


def _slow_fetch(oid):
    time.sleep(0.01)
    return _DB.get(oid)


def get_object(principal, object_id):
    row = _slow_fetch(object_id)
    if row is None or row["owner"] != principal:
        raise PermissionError("forbidden")
    return row
