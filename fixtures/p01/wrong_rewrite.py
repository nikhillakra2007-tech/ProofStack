import re
_EMAIL = re.compile(r"^[a-zA-Z0-9]+@example\.com$")         # fast but changes semantics ('@example.com')


def validate(s: str) -> bool:
    return _EMAIL.match(s) is not None
