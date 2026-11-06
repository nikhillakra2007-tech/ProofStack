"""Vendored gate-schema copies must match the canonical schemas/gates.v1.json.

Vercel builds only see files inside each app's root directory, so web/ and
frontend/ vendor a copy of the canonical schema. This test keeps the copies
from drifting: change schemas/gates.v1.json, then re-copy it into both trees.
"""

import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]


def test_web_vendored_gates_schema_matches_canonical():
    canonical = (ROOT / "schemas" / "gates.v1.json").read_bytes()
    vendored = (ROOT / "web" / "src" / "lib" / "gates.v1.json").read_bytes()
    assert vendored == canonical, (
        "web/src/lib/gates.v1.json is out of sync with schemas/gates.v1.json - "
        "copy the canonical file into web/src/lib/"
    )


def test_frontend_vendored_gates_schema_matches_canonical():
    canonical = (ROOT / "schemas" / "gates.v1.json").read_bytes()
    vendored = (ROOT / "frontend" / "src" / "lib" / "gates.v1.json").read_bytes()
    assert vendored == canonical, (
        "frontend/src/lib/gates.v1.json is out of sync with schemas/gates.v1.json - "
        "copy the canonical file into frontend/src/lib/"
    )
