"""
Clean Web Fixture (fixtures/clean_web)
Hardened correctly: zero high/medium findings.
"""

from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse

app = FastAPI(title="CleanWeb - Fully Hardened")


@app.get("/", response_class=HTMLResponse)
def index():
    html = """<!DOCTYPE html>
<html>
<head>
    <title>CleanWeb Hardened</title>
</head>
<body>
    <h1>Hardened Secure Web Service</h1>
    <div id="output"></div>
    <form action="/submit" method="POST">
        <input type="hidden" name="csrf_token" value="secure_token_123" />
        <input type="text" name="comment" />
        <button type="submit">Submit</button>
    </form>
    <script>
        // Safe DOM manipulation using textContent
        if (location.hash) {
            document.getElementById("output").textContent = location.hash.substring(1);
        }
    </script>
</body>
</html>
"""
    resp = Response(content=html, media_type="text/html")
    # All security headers properly set
    resp.headers["Content-Security-Policy"] = "default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
    resp.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Secure cookie
    resp.set_cookie(
        key="session_id",
        value="secure_token_val",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return resp
