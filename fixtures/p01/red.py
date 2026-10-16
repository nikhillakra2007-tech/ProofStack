import re
_EMAIL = re.compile(r"^([a-zA-Z0-9]+)*@example\.com$")      # nested quantifier: catastrophic


def validate(s: str) -> bool:
    return _EMAIL.match(s) is not None
