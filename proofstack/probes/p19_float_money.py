"""P19 - float-based money arithmetic (rounding drift). Target module:
total(amounts: list[str]) -> int|Decimal|str|float ; tax_lines(amounts, rate_bps) -> list (dollars).

Golden ledger: 100,000 seeded cent amounts. Exact reference = Decimal with the declared rounding mode
(params.rounding, default ROUND_HALF_UP). Red: total off by >= 1 cent, any per-line tax mismatch, or float results.
"""
import decimal
import random
from decimal import Decimal

from proofstack.probes._kit import run_cli, verdict


def dec(x) -> Decimal:
    return Decimal(str(x))                                    # str(float) exposes binary drift


def detect(mod, p):
    mode = getattr(decimal, p.get("rounding", "ROUND_HALF_UP"))
    n, rate = p.get("n", 100_000), p.get("rate_bps", 825)
    rng = random.Random(p.get("seed", 20261013))
    cents = [rng.randint(1, 99_999) for _ in range(n)]
    amounts = [f"{c // 100}.{c % 100:02d}" for c in cents]
    total, lines = mod.total(amounts), mod.tax_lines(amounts, rate)
    drift = abs(dec(total) - Decimal(sum(cents)) / 100)
    exact = [(Decimal(c) * rate / 10_000).quantize(Decimal(1), rounding=mode) for c in cents]
    mismatches = sum(1 for g, e in zip(lines, exact) if dec(g) * 100 != e)
    float_type = isinstance(total, float) or any(isinstance(g, float) for g in lines[:100])
    found = drift >= Decimal("0.01") or mismatches > 0 or float_type
    return verdict("P19", found, ["CORR"],
                   {"transactions": n, "total_drift": str(drift), "tax_line_mismatches": mismatches},
                   {"float_result": float_type, "rounding": p.get("rounding", "ROUND_HALF_UP")},
                   drift >= Decimal("0.01"), mismatches > 0, float_type)


if __name__ == "__main__":
    run_cli("P19", detect)
