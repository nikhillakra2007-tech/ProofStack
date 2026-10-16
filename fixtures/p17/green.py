import threading

LOCKS = {k: threading.Lock() for k in "ABC"}
BAL = {k: 100 for k in "ABC"}


def transfer(src, dst, amount=1):
    first, second = sorted((src, dst))                        # one global order: lowest key first
    with LOCKS[first]:
        with LOCKS[second]:
            BAL[src] -= amount
            BAL[dst] += amount
