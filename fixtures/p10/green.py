import random
import time
import urllib.request


def call_service(url, *, budget_s=4.0, attempt_timeout_s=1.0, attempts=3, base_s=0.1, cap_s=0.5):
    deadline, last = time.monotonic() + budget_s, None     # one overall deadline for the whole call
    for k in range(attempts):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            break
        try:
            with urllib.request.urlopen(url, timeout=min(attempt_timeout_s, remaining)) as r:
                return r.read()
        except Exception as e:
            last = e
            pause = random.uniform(0, min(cap_s, base_s * 2 ** k))              # exponential, full jitter
            time.sleep(min(pause, max(0.0, deadline - time.monotonic())))
    raise last or TimeoutError("retry budget exhausted")
