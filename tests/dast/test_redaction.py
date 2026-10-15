"""
Tests for ProofStack Redaction Engine
Enforces Section K.3:
Planted fake secrets never appear in ledger, DB rows, artifacts, reports or captured prompts.
"""

from proofstack.dast.findings import redact


def test_redact_aws_key():
    raw = "Found AWS access key AKIAIOSFODNN7EXAMPLE in bundle"
    redacted = redact(raw)
    assert "AKIAIOSFODNN7EXAMPLE" not in redacted
    assert "AKIA****" in redacted


def test_redact_github_token():
    raw = "export GITHUB_TOKEN=ghp_ABC1234567890abcdefghijklmnopqrstuv"
    redacted = redact(raw)
    assert "ghp_ABC1234567890abcdefghijklmnopqrstuv" not in redacted
    assert "ghp_****" in redacted


def test_redact_slack_token():
    raw = "slack_secret = 'xoxb-1234567890-abcdefghij'"
    redacted = redact(raw)
    assert "xoxb-1234567890-abcdefghij" not in redacted
    assert "xoxb****" in redacted


def test_redact_stripe_key():
    raw = "stripe_key: sk_live_1234567890abcdefghijklmn"
    redacted = redact(raw)
    assert "sk_live_1234567890abcdefghijklmn" not in redacted
    assert "sk_l****" in redacted


def test_redact_private_key():
    raw = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Y1+exampleFakeKeyMaterialForTestsOnly+...
-----END RSA PRIVATE KEY-----"""
    redacted = redact(raw)
    assert "MIIEowIBAAKCAQEA0Y1" not in redacted
    assert "[REDACTED_PRIVATE_KEY_****]" in redacted
