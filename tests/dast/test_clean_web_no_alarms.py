"""
Tests for DAST Clean Web Target
Enforces Section K.10: Zero high/medium findings on clean_web.
"""

from proofstack.dast.checks import ALL_DAST_CHECKS
from proofstack.dast.scanner.capture import ScanCapture, ScanCookie, NetworkEntry, FormInfo


def build_clean_web_capture() -> ScanCapture:
    """
    Simulates captured telemetry from fixtures/clean_web.
    """
    dom = """
    <!DOCTYPE html>
    <html>
      <head><title>Clean Web</title></head>
      <body>
        <div id="output">Clean Content</div>
        <form action="/login" method="POST">
           <input type="hidden" name="csrf_token" value="secure_token_123" />
           <input type="text" name="user" />
        </form>
      </body>
    </html>
    """
    return ScanCapture(
        target_url="https://example.com/",
        final_url="https://example.com/",
        status_code=200,
        dom_html=dom,
        response_headers={
            "Content-Security-Policy": "default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
            "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        cookies=[
            ScanCookie(name="session_id", value="secure_cookie_val", secure=True, http_only=True, same_site="Strict")
        ],
        network_requests=[
            NetworkEntry(
                url="https://example.com/",
                method="GET",
                status=200,
                headers={
                    "Content-Security-Policy": "default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
                    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "DENY",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                body=dom
            )
        ],
        local_storage={},
        session_storage={},
        forms=[FormInfo(action="/login", method="POST", has_csrf_token=True)],
        canary_hits=[]
    )


def test_clean_web_zero_high_medium_findings():
    capture = build_clean_web_capture()
    findings = []

    for check_cls in ALL_DAST_CHECKS:
        findings.extend(check_cls.run(capture))

    high_medium_findings = [f for f in findings if f.severity in ("High", "Critical", "Medium")]
    assert len(high_medium_findings) == 0, f"Expected 0 high/medium findings on clean web, got: {high_medium_findings}"
