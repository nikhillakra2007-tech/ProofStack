import threading
import time


class Pool:
    def __init__(self, size):
        self.size, self.in_use = size, 0
        self._sem, self._lock = threading.Semaphore(size), threading.Lock()

    def acquire(self, timeout=0.2):
        if not self._sem.acquire(timeout=timeout):
            raise TimeoutError("pool exhausted")
        with self._lock:
            self.in_use += 1

    def release(self):
        with self._lock:
            self.in_use -= 1
        self._sem.release()


POOL, _rows = Pool(4), []


def created():
    return len(_rows)


def handle(key, fail=False):
    POOL.acquire()
    if fail:
        raise RuntimeError("downstream failure")             # connection never released
    time.sleep(0.005)
    _rows.append(key)                                        # side effect repeated on every retry
    POOL.release()
    return key
