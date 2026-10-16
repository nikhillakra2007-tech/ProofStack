"""P02 - N+1 query explosion + SQL-injection trap.

Target: fetch(conn, user_ids, status) -> dict[int, list]. The probe wraps the connection, counts raw
statements, and fires a hostile `status`. Red = query count grows with N, or hostile text reaches SQL.
"""
import sqlite3

from proofstack.probes._kit import run_cli, verdict

MARK = "PS_MARK_7f3a"


class Rec:
    """Connection proxy recording raw (sql, params) exactly as the target issues them."""

    def __init__(self, c):
        self._c, self.calls = c, []

    def execute(self, sql, params=()):
        self.calls.append((sql, tuple(params)))
        return self._c.execute(sql, params)

    def __getattr__(self, name):
        return getattr(self._c, name)


def seed_db(n):
    c = sqlite3.connect(":memory:")
    c.row_factory = sqlite3.Row
    c.execute("CREATE TABLE orders(id INTEGER PRIMARY KEY, user_id INT, status TEXT, total INT)")
    c.executemany("INSERT INTO orders(user_id,status,total) VALUES (?,?,?)",
                  [(u, "open", 10 * k) for u in range(1, n + 1) for k in (1, 2, 3)])
    return c


def query_count(fetch, n):
    rec = Rec(seed_db(n))
    fetch(rec, list(range(1, n + 1)), "open")
    return len(rec.calls)


def detect(fetch, p):
    q10, q100 = query_count(fetch, 10), query_count(fetch, 100)
    rec = Rec(seed_db(20))
    out = fetch(rec, [1, 2, 3], f"x' OR '1'='1' -- {MARK}")
    leaked = sum(len(v) for v in out.values()) if isinstance(out, dict) else len(out or [])
    sink = any(MARK in sql for sql, _ in rec.calls)
    n1 = q100 > q10 or q100 > p.get("max_queries", 3)
    inj = sink or leaked > 0
    fam = (["PERF"] if n1 else []) + (["SEC"] if inj else [])
    return verdict("P02", n1 or inj, fam, {"q10": q10, "q100": q100, "leaked_rows": leaked},
                   {"n_plus_1": n1, "sqli_sink": sink}, n1, inj)


if __name__ == "__main__":
    run_cli("P02", detect)
