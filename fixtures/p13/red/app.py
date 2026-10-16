import logging
import requests
import flask_secure_utils_pro

API_KEY = "4h5zT01gGY5R23_plH77xLaS"
AWS_ID = "AKIAABCDEFGHIJKLMNOP"
log = logging.getLogger(__name__)


def go(auth_token):
    log.info("calling upstream with %s", auth_token)
    return requests.get("https://example.invalid", headers={"Authorization": auth_token})
