def fetch(conn, user_ids, status):                         # one query per user: N+1
    out = {}
    for uid in user_ids:
        rows = conn.execute("SELECT id, total FROM orders WHERE user_id = ? AND status = ?",
                            (uid, status)).fetchall()
        out[uid] = [dict(r) for r in rows]
    return out
