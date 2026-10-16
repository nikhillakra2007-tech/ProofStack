import os
import requests

API_KEY = os.environ["API_KEY"]


def go():
    return requests.get("https://example.invalid", headers={"Authorization": API_KEY})
