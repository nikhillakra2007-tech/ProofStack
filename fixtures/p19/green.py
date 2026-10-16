from decimal import ROUND_HALF_UP, Decimal

CENT = Decimal("0.01")


def total(amounts):
    return sum((Decimal(a) for a in amounts), Decimal("0"))


def tax_lines(amounts, rate_bps):
    return [(Decimal(a) * rate_bps / 10_000).quantize(CENT, rounding=ROUND_HALF_UP) for a in amounts]
