import urllib.request


def call_service(url):
    while True:                                            # no timeout, unbounded immediate retries
        try:
            return urllib.request.urlopen(url).read()
        except Exception:
            pass
