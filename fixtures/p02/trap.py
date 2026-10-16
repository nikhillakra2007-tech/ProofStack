def fetch(conn, user_ids, status):                         # naive AI batching: flat count, injectable
    ids = ",".join(str(i) for i in user_ids)
    sql = f"SELECT id, user_id, total FROM orders WHERE user_id IN ({ids}) AND status = '{status}'"
    out = {}
    for r in conn.execute(sql).fetchall():
        out.setdefault(r["user_id"], []).append({"id": r["id"], "total": r["total"]})
    return out
