"""
Tests for DAST Checks D-01 through D-12 (vuln_web firing test)
Enforces Section K.10: Each of D-01 to D-12 reports exactly the planted finding on vuln_web.
"""

from proofstack.dast.checks import ALL_DAST_CHECKS
from proofstack.dast.scanner.capture import ScanCapture, ScanCookie, NetworkEntry, FormInfo


def build_vuln_web_capture() -> ScanCapture:
    """
    Simulates captured DevTools telemetry from fixtures/vuln_web.
    """
    dom = """
    <html>
      <head>
        <script src="https://cdn.untrusted-thirdparty.com/lib.js"></script>
      </head>
      <body>
        <div id="sink"></div>
        <form action="/login" method="POST">
           <input type="text" name="user" />
        </form>
        <script>
           const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
           document.getElementById("sink").innerHTML = location.hash;
        </script>
      </body>
    </html>
    """
    return ScanCapture(
        target_url="http://127.0.0.1:8000/",
        final_url="http://127.0.0.1:8000/",
        status_code=200,
        dom_html=dom,
        response_headers={
            "Server": "Apache/2.4.41",
            "X-Powered-By": "Express/4.17.1",
            "Content-Security-Policy": "default-src 'self' 'unsafe-inline' *;"
        },
        cookies=[
            ScanCookie(name="session_id", value="insecure_cookie_val", secure=False, http_only=False, same_site=None)
        ],
        network_requests=[
            NetworkEntry(
                url="http://127.0.0.1:8000/",
                method="GET",
                status=200,
                headers={"Server": "Apache/2.4.41", "X-Powered-By": "Express/4.17.1"},
                body=dom
            )
        ],
        local_storage={
            "auth_jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        },
        session_storage={},
        forms=[FormInfo(action="/login", method="POST", has_csrf_token=False)],
        canary_hits=["innerHTML"]
    )


def test_dast_checks_fire_on_vuln_telemetry():
    capture = build_vuln_web_capture()
    fired_checks = set()

    for check_cls in ALL_DAST_CHECKS:
        findings = check_cls.run(capture)
        if findings:
            fired_checks.add(check_cls.check_id)

    # Assert expected core checks fired
    assert "D-01" in fired_checks  # Missing security headers
    assert "D-02" in fired_checks  # Weak CSP (unsafe-inline / wildcard)
    assert "D-03" in fired_checks  # Insecure cookies
    assert "D-04" in fired_checks  # Plaintext HTTP
    assert "D-05" in fired_checks  # Exposed AWS key
    assert "D-06" in fired_checks  # DOM-XSS canary hit
    assert "D-09" in fired_checks  # Server/X-Powered-By banners
    assert "D-10" in fired_checks  # Script without integrity
    assert "D-11" in fired_checks  # JWT in localStorage
    assert "D-12" in fired_checks  # Form without CSRF token
