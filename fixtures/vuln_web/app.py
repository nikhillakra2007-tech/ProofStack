"""
Vulnerable Web Fixture (fixtures/vuln_web)
Deliberately contains planted instances of D-01 to D-12 using FAKE secrets only.
"""

from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse, PlainTextResponse

app = FastAPI(title="VulnWeb - Planted Security Defects")


@app.get("/", response_class=HTMLResponse)
def index():
    # Planted defects:
    # D-01: Missing CSP, HSTS, X-Content-Type-Options, X-Frame-Options
    # D-05: FAKE planted secrets (AKIAIOSFODNN7EXAMPLE)
    # D-06: DOM-XSS sink innerHTML reading location.hash
    # D-10: Script from external origin without integrity
    # D-11: Mock JWT stored in localStorage
    # D-12: POST form without CSRF token
    html = """<!DOCTYPE html>
<html>
<head>
    <title>VulnWeb Target</title>
    <!-- D-10: Risky 3rd-party script without integrity -->
    <script src="https://cdn.example-untrusted.com/lib.js"></script>
</head>
<body>
    <h1>Welcome to Insecure Web Service</h1>
    <div id="output"></div>

    <!-- D-12: POST form without CSRF token -->
    <form action="/submit" method="POST">
        <input type="text" name="comment" />
        <button type="submit">Submit</button>
    </form>

    <script>
        // D-05: Exposed client-side credential
        const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
        const GITHUB_PAT = "ghp_FAKEtokenForTestingProofStackOnly12345";

        // D-11: JWT token stored in localStorage
        localStorage.setItem("auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

        // D-06: DOM sink innerHTML fed from hash
        if (location.hash) {
            document.getElementById("output").innerHTML = location.hash.substring(1);
        }
    </script>
</body>
</html>
"""
    resp = Response(content=html, media_type="text/html")
    # D-03: Insecure cookie missing HttpOnly, Secure, SameSite
    resp.set_cookie(key="session_id", value="fake_session_12345", httponly=False, secure=False)
    # D-09: Version disclosure header
    resp.headers["Server"] = "Apache/2.4.41 (Ubuntu)"
    resp.headers["X-Powered-By"] = "Express/4.17.1"
    return resp


# D-07: Sensitive routes exposed with content signatures
@app.get("/.env", response_class=PlainTextResponse)
def get_env():
    return "DB_PASSWORD=fake_test_password\nAWS_SECRET_KEY=fake_secret_key\n"


@app.get("/.git/HEAD", response_class=PlainTextResponse)
def get_git_head():
    return "ref: refs/heads/main\n"
