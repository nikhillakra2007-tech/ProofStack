def total(amounts):
    return sum(float(a) for a in amounts)


def tax_lines(amounts, rate_bps):
    return [round(float(a) * rate_bps / 10_000, 2) for a in amounts]
