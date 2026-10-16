import threading
import time
from contextlib import contextmanager


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


POOL, _rows, _seen, _guard = Pool(4), [], {}, threading.Lock()


@contextmanager
def session():
    POOL.acquire()
    try:
        yield
    finally:
        POOL.release()                                       # released on every path


def created():
    return len(_rows)


def handle(key, fail=False):
    with _guard:                                             # DB equivalent: UNIQUE(idempotency_key) + ON CONFLICT
        if key in _seen:
            return _seen[key]
        with session():
            if fail:
                raise RuntimeError("downstream failure")
            time.sleep(0.005)
            _rows.append(key)
        _seen[key] = key
        return key
