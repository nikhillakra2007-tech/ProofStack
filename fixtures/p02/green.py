def fetch(conn, user_ids, status):                         # one parameterised query; only '?' is formatted
    out = {u: [] for u in user_ids}
    marks = ",".join("?" * len(user_ids))
    sql = f"SELECT id, user_id, total FROM orders WHERE user_id IN ({marks}) AND status = ?"
    for r in conn.execute(sql, (*user_ids, status)):
        out[r["user_id"]].append({"id": r["id"], "total": r["total"]})
    return out
