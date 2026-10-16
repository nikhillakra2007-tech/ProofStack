import urllib.request


def fetch_url(url):                                        # link-preview / webhook fetcher, no validation
    return urllib.request.urlopen(url, timeout=2).read()
