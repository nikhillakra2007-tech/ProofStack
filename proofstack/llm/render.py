"""Prompt rendering: {{name}} substitution with fenced untrusted content (data, never instructions)."""
import hashlib
import re

PH = re.compile(r"\{\{(\w+)\}\}")


def fence(text: str, label: str = "untrusted") -> str:
    tag = f"{label}-{hashlib.sha256(text.encode()).hexdigest()[:8]}"
    return f"<{tag}>\n{text}\n</{tag}>"                      # tag derived from the content: cannot be closed by it


def render(template: str, **values) -> str:
    missing = set(PH.findall(template)) - values.keys()
    if missing:
        raise KeyError(f"missing prompt variables: {sorted(missing)}")
    return PH.sub(lambda m: str(values[m.group(1)]), template)
