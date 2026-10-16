import threading

LOCKS = {k: threading.Lock() for k in "ABC"}
BAL = {k: 100 for k in "ABC"}


def transfer(src, dst, amount=1):
    with LOCKS[src]:                                          # lock order = argument order
        with LOCKS[dst]:
            BAL[src] -= amount
            BAL[dst] += amount
