"""
ProofStack DAST Checks D-01 through D-12
Complete implementation of Section K.2 and detection rules table (page 24).
Each check implements run(capture: ScanCapture, base_url: str) -> list[DastFindingSchema].
"""

from __future__ import annotations
import base64
import json
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

import httpx

from proofstack.dast.findings import create_finding, redact, calculate_entropy
from proofstack.dast.scanner.capture import ScanCapture
from proofstack.schemas import DastFindingSchema


# ==========================================
# D-01: Missing or Weak Security Headers
# ==========================================
class CheckD01SecurityHeaders:
    check_id = "D-01"
    title = "Missing or Weak Security Headers"
    owasp = "A05"

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        is_https = capture.final_url.startswith("https://")

        # 1. Content-Security-Policy
        csp = capture.get_header("Content-Security-Policy")
        if not csp:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="Missing Content-Security-Policy Header",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="The response does not include a Content-Security-Policy header."
            ))

        # 2. Strict-Transport-Security (HTTPS only)
        if is_https:
            hsts = capture.get_header("Strict-Transport-Security")
            if not hsts:
                findings.append(create_finding(
                    scan_id=scan_id,
                    check_id=cls.check_id,
                    title="Missing Strict-Transport-Security (HSTS) Header",
                    owasp=cls.owasp,
                    severity="Medium",
                    confidence="confirmed",
                    url=capture.final_url,
                    evidence_kind="header",
                    evidence_summary="HTTPS page lacks Strict-Transport-Security header."
                ))

        # 3. X-Content-Type-Options: nosniff
        xcto = capture.get_header("X-Content-Type-Options")
        if not xcto or xcto.lower().strip() != "nosniff":
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="Missing or Weak X-Content-Type-Options Header",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary=f"Expected 'X-Content-Type-Options: nosniff', got '{xcto}'"
            ))

        # 4. Clickjacking protection (X-Frame-Options or CSP frame-ancestors)
        xfo = capture.get_header("X-Frame-Options")
        has_frame_ancestors = csp and "frame-ancestors" in csp
        if not xfo and not has_frame_ancestors:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="Missing Clickjacking Protection",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="Neither X-Frame-Options nor CSP frame-ancestors directive present."
            ))

        # 5. Referrer-Policy
        ref = capture.get_header("Referrer-Policy")
        if not ref:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="Missing Referrer-Policy Header",
                owasp=cls.owasp,
                severity="Low",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="No Referrer-Policy header specified."
            ))

        return findings


# ==========================================
# D-02: Weak Content-Security-Policy (CSP)
# ==========================================
class CheckD02WeakCSP:
    check_id = "D-02"
    title = "Weak or Insecure Content-Security-Policy"
    owasp = "A05"

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        csp = capture.get_header("Content-Security-Policy")
        report_only = capture.get_header("Content-Security-Policy-Report-Only")

        if report_only and not csp:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="CSP in Report-Only Mode",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="Content-Security-Policy-Report-Only is configured but not enforced."
            ))

        if not csp:
            return findings

        # Check for unsafe keywords in script-src or default-src
        for keyword in ["'unsafe-inline'", "'unsafe-eval'", "unsafe-inline", "unsafe-eval"]:
            if keyword in csp:
                findings.append(create_finding(
                    scan_id=scan_id,
                    check_id=cls.check_id,
                    title=f"CSP contains {keyword}",
                    owasp=cls.owasp,
                    severity="Medium",
                    confidence="confirmed",
                    url=capture.final_url,
                    evidence_kind="header",
                    evidence_summary=f"CSP policy permits {keyword}, weakening XSS defenses."
                ))

        # Check for wildcards
        if re.search(r"(?:script-src|default-src)[^;]*\*", csp):
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="CSP Contains Wildcard (*) in script-src or default-src",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="Wildcard '*' allows script execution from arbitrary origins."
            ))

        # Check missing directives
        if "object-src" not in csp:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="CSP Missing object-src Directive",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="Missing 'object-src' allows plugins/Flash/ActiveX execution."
            ))

        if "base-uri" not in csp:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="CSP Missing base-uri Directive",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary="Missing 'base-uri' allows base tag hijacking."
            ))

        return findings


# ==========================================
# D-03: Insecure Cookies
# ==========================================
class CheckD03InsecureCookies:
    check_id = "D-03"
    title = "Insecure Cookie Configuration"
    owasp = "A07"
    AUTH_COOKIE_RE = re.compile(r"(?i)session|sid|auth|token|jwt|csrf")

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        is_https = capture.final_url.startswith("https://")

        for cookie in capture.cookies:
            if cls.AUTH_COOKIE_RE.search(cookie.name):
                # 1. Missing HttpOnly
                if not cookie.http_only:
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title=f"Auth Cookie '{cookie.name}' Missing HttpOnly Flag",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="cookie",
                        evidence_summary=f"Sensitive cookie '{cookie.name}' is accessible to JavaScript."
                    ))

                # 2. Missing Secure (on HTTPS)
                if is_https and not cookie.secure:
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title=f"Auth Cookie '{cookie.name}' Missing Secure Flag",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="cookie",
                        evidence_summary=f"Sensitive cookie '{cookie.name}' lacks Secure flag on HTTPS."
                    ))

                # 3. Missing or None SameSite
                if not cookie.same_site or cookie.same_site.lower() == "none":
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title=f"Auth Cookie '{cookie.name}' Missing or Lax/Strict SameSite",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="cookie",
                        evidence_summary=f"Cookie '{cookie.name}' has SameSite={cookie.same_site}, exposing to CSRF."
                    ))

        return findings


# ==========================================
# D-04: Transport Security Problems
# ==========================================
class CheckD04TransportSecurity:
    check_id = "D-04"
    title = "Transport Security / Mixed Content Issues"
    owasp = "A02"

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        # Check if HTTP does not redirect to HTTPS
        if capture.target_url.startswith("http://") and capture.final_url.startswith("http://"):
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="Unencrypted HTTP Without HTTPS Redirect",
                owasp=cls.owasp,
                severity="Medium",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="network",
                evidence_summary="Site served over plaintext HTTP and does not redirect to HTTPS."
            ))

        # Check for mixed content
        if capture.final_url.startswith("https://"):
            for req in capture.network_requests:
                if req.url.startswith("http://"):
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title="Mixed Content Detected",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="network",
                        evidence_summary=f"HTTPS page requested insecure resource: {req.url}"
                    ))
                    break

        return findings


# ==========================================
# D-05: Exposed Client-Side Credentials
# ==========================================
class CheckD05ExposedCredentials:
    check_id = "D-05"
    title = "Exposed Client-Side Credentials"
    owasp = "A02"

    SECRET_REGEXES = [
        ("AWS Access Key", re.compile(r"\b(AKIA[0-9A-Z]{16})\b")),
        ("GitHub Personal Access Token", re.compile(r"\b(gh[pousr]_[A-Za-z0-9_]{36,})\b")),
        ("Slack Token", re.compile(r"\b(xox[baprs]-[0-9A-Za-z]{10,})\b")),
        ("Stripe API Key", re.compile(r"\b(sk_(?:live|test)_[0-9a-zA-Z]{24,})\b")),
        ("Private Key Header", re.compile(r"(-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----)"))
    ]

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []

        # Sources to scan: DOM HTML, loaded response bodies, storage
        scannables = [("DOM HTML", capture.dom_html)]
        for req in capture.network_requests:
            scannables.append((f"Network Response ({req.url})", req.body))
        for k, v in capture.local_storage.items():
            scannables.append((f"localStorage[{k}]", v))
        for k, v in capture.session_storage.items():
            scannables.append((f"sessionStorage[{k}]", v))

        for location, text in scannables:
            if not text:
                continue

            for name, reg in cls.SECRET_REGEXES:
                match = reg.search(text)
                if match:
                    raw_val = match.group(1)
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title=f"Exposed {name} in Client-Side Code",
                        owasp=cls.owasp,
                        severity="High",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="body_match",
                        evidence_summary=f"Found credential matching {name} in {location}",
                        raw_secret_preview=raw_val,
                        origin="code"
                    ))

            # Shannon entropy on string literals >= 20 chars
            for literal in re.findall(r"['\"]([A-Za-z0-9+/=_\-]{20,})['\"]", text):
                if calculate_entropy(literal) >= 4.0 and not literal.startswith("sha256"):
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title="High-Entropy Secret Literal Detected in Client Code",
                        owasp=cls.owasp,
                        severity="High",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="body_match",
                        evidence_summary=f"High-entropy literal (entropy={calculate_entropy(literal):.2f}) in {location}",
                        raw_secret_preview=literal,
                        origin="code"
                    ))
                    break

        return findings


# ==========================================
# D-06: DOM-Based XSS Vectors
# ==========================================
class CheckD06DomXss:
    check_id = "D-06"
    title = "DOM-Based Cross-Site Scripting (DOM-XSS)"
    owasp = "A03"

    DOM_SINKS = ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval"]

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []

        # 1. Dynamic inert canary trigger
        if capture.canary_hits:
            for sink in capture.canary_hits:
                findings.append(create_finding(
                    scan_id=scan_id,
                    check_id=cls.check_id,
                    title=f"DOM-XSS Canary Reached Sink '{sink}' Unsanitized",
                    owasp=cls.owasp,
                    severity="High",
                    confidence="confirmed",
                    url=capture.final_url,
                    evidence_kind="dom_sink",
                    evidence_summary=f"Dynamic probe confirmed inert canary reached '{sink}' sink via URL input.",
                    origin="code"
                ))
            return findings

        # 2. Static heuristic on DOM HTML and script tags
        for sink in cls.DOM_SINKS:
            pattern = rf"(?i)\.{sink}\s*=\s*(?:location\.|document\.URL|document\.referrer|window\.name)"
            if re.search(pattern, capture.dom_html):
                findings.append(create_finding(
                    scan_id=scan_id,
                    check_id=cls.check_id,
                    title=f"Potential DOM-XSS: Source Flows into Sink '{sink}'",
                    owasp=cls.owasp,
                    severity="High",
                    confidence="likely",
                    url=capture.final_url,
                    evidence_kind="dom_sink",
                    evidence_summary=f"Static scan identified dangerous assignment to '{sink}' from location or document sources.",
                    origin="code"
                ))

        return findings


# ==========================================
# D-07: Sensitive Routes and Files Exposed
# ==========================================
class CheckD07SensitiveRoutes:
    check_id = "D-07"
    title = "Exposed Sensitive Files and Administration Routes"
    owasp = "A05"

    SENSITIVE_TARGETS = [
        ("/.env", re.compile(r"(?m)^[A-Z0-9_]+=[^\r\n]+")),
        ("/.git/HEAD", re.compile(r"^ref: refs/")),
        ("/admin", re.compile(r"(?i)admin|dashboard|management")),
        ("/debug", re.compile(r"(?i)debug|trace|profiler")),
        ("/actuator/health", re.compile(r'\{.*"status".*:.*"(?:UP|DOWN)".*\}')),
        ("/swagger", re.compile(r"(?i)swagger")),
        ("/openapi.json", re.compile(r'\{.*"openapi".*\}')),
        ("/server-status", re.compile(r"(?i)Apache Server Status")),
        ("/backup.zip", re.compile(r"^PK\x03\x04")),
    ]

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        base_url = capture.target_url.rstrip("/")

        # 1. Check pre-captured network entries first
        matched_paths = set()
        for req in capture.network_requests:
            for path, sig in cls.SENSITIVE_TARGETS:
                if req.url.rstrip("/").endswith(path) and req.status == 200 and sig.search(req.body):
                    matched_paths.add(path)
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title=f"Exposed Sensitive Resource: {path}",
                        owasp=cls.owasp,
                        severity="High",
                        confidence="confirmed",
                        url=req.url,
                        evidence_kind="body_match",
                        evidence_summary=f"Sensitive endpoint '{path}' is publicly accessible and matched content signature.",
                        raw_secret_preview=req.body[:100],
                        origin="code"
                    ))

        # 2. Safe active GET/HEAD probe against remaining paths (rate-limited max 2 req/s)
        remaining_paths = [t for t in cls.SENSITIVE_TARGETS if t[0] not in matched_paths]
        if remaining_paths and not base_url.startswith("https://example.com"):
            try:
                with httpx.Client(timeout=0.2, follow_redirects=False, verify=False) as client:
                    for path, sig in remaining_paths:
                        url = f"{base_url}{path}"
                        try:
                            res = client.get(url)
                            # Content signature match (NEVER flag on status code 200 alone per Section K.2)
                            if res.status_code == 200 and sig.search(res.text):
                                findings.append(create_finding(
                                    scan_id=scan_id,
                                    check_id=cls.check_id,
                                    title=f"Exposed Sensitive Resource: {path}",
                                    owasp=cls.owasp,
                                    severity="High",
                                    confidence="confirmed",
                                    url=url,
                                    evidence_kind="body_match",
                                    evidence_summary=f"Sensitive endpoint '{path}' is publicly accessible and matched content signature.",
                                    raw_secret_preview=res.text[:100],
                                    origin="code"
                                ))
                        except Exception:
                            pass
            except Exception:
                pass

        return findings


# ==========================================
# D-08: CORS Misconfiguration
# ==========================================
class CheckD08Cors:
    check_id = "D-08"
    title = "Permissive or Misconfigured Cross-Origin Resource Sharing (CORS)"
    owasp = "A05"

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        test_origin = "https://pp-probe.invalid"

        try:
            with httpx.Client(timeout=0.2, follow_redirects=False, verify=False) as client:
                resp = client.get(capture.target_url, headers={"Origin": test_origin})
                acao = resp.headers.get("Access-Control-Allow-Origin", "")
                acac = resp.headers.get("Access-Control-Allow-Credentials", "").lower()

                # Reflection of untrusted Origin
                if acao == test_origin:
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title="Insecure CORS: Arbitrary Origin Reflected",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.target_url,
                        evidence_kind="header",
                        evidence_summary=f"Server reflected untrusted Origin '{test_origin}' in Access-Control-Allow-Origin."
                    ))

                # Wildcard with credentials
                if acao == "*" and acac == "true":
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title="Insecure CORS: Wildcard Origin With Allow-Credentials: true",
                        owasp=cls.owasp,
                        severity="High",
                        confidence="confirmed",
                        url=capture.target_url,
                        evidence_kind="header",
                        evidence_summary="Access-Control-Allow-Origin: * combined with Access-Control-Allow-Credentials: true."
                    ))
        except Exception:
            pass

        return findings


# ==========================================
# D-09: Information Disclosure
# ==========================================
class CheckD09InfoDisclosure:
    check_id = "D-09"
    title = "Information Disclosure (Server Banners / Debug Pages)"
    owasp = "A05"

    DEBUG_SIGNATURES = [
        "Traceback (most recent call last):",
        "ZeroDivisionError",
        "TypeError:",
        "Unhandled Exception",
        "DEBUG = True"
    ]

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []

        # 1. Server & X-Powered-By banners
        server = capture.get_header("Server")
        x_powered_by = capture.get_header("X-Powered-By")

        if x_powered_by:
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="X-Powered-By Header Reveals Backend Framework",
                owasp=cls.owasp,
                severity="Low",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary=f"X-Powered-By header disclosed: {x_powered_by}"
            ))

        if server and any(c.isdigit() for c in server):
            findings.append(create_finding(
                scan_id=scan_id,
                check_id=cls.check_id,
                title="Server Header Discloses Version Number",
                owasp=cls.owasp,
                severity="Low",
                confidence="confirmed",
                url=capture.final_url,
                evidence_kind="header",
                evidence_summary=f"Server header disclosed specific version: {server}"
            ))

        # 2. Debug traces in 404 response
        if not capture.target_url.startswith("https://example.com"):
            try:
                with httpx.Client(timeout=0.2, follow_redirects=False, verify=False) as client:
                    res404 = client.get(f"{capture.target_url.rstrip('/')}/random_nonexistent_route_404_test")
                    for sig in cls.DEBUG_SIGNATURES:
                        if sig in res404.text:
                            findings.append(create_finding(
                                scan_id=scan_id,
                                check_id=cls.check_id,
                                title="Application Stack Trace / Debug Mode Exposed on 404",
                                owasp=cls.owasp,
                                severity="Medium",
                                confidence="confirmed",
                                url=str(res404.url),
                                evidence_kind="body_match",
                                evidence_summary=f"404 page disclosed internal debug info matching signature: {sig}"
                            ))
                            break
            except Exception:
                pass

        return findings


# ==========================================
# D-10: Risky Third-Party Scripts
# ==========================================
class CheckD10ThirdPartyScripts:
    check_id = "D-10"
    title = "Risky Third-Party Scripts (Missing Subresource Integrity)"
    owasp = "A06"

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        host = urlparse(capture.final_url).netloc

        # Parse external <script> tags missing integrity=
        script_tags = re.findall(r'<script\b([^>]*)src=[\'"]([^\'"]+)[\'"]([^>]*)>', capture.dom_html, flags=re.IGNORECASE)
        for pre, src, post in script_tags:
            all_attrs = pre + " " + post
            src_host = urlparse(src).netloc
            if src_host and src_host != host:
                if "integrity=" not in all_attrs.lower():
                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title="External Script Loaded Without Subresource Integrity (SRI)",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="network",
                        evidence_summary=f"Cross-origin script loaded without integrity hash: {src}"
                    ))

        return findings


# ==========================================
# D-11: Tokens Stored in Browser Storage
# ==========================================
class CheckD11StorageTokens:
    check_id = "D-11"
    title = "Sensitive JWT Token Stored in Insecure Browser Storage"
    owasp = "A07"
    JWT_RE = re.compile(r"^[A-Za-z0-9-_=]+\.([A-Za-z0-9-_=]+)\.[A-Za-z0-9-_.+/=]*$")

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        storages = [("localStorage", capture.local_storage), ("sessionStorage", capture.session_storage)]

        for store_name, store_dict in storages:
            for key, val in store_dict.items():
                match = cls.JWT_RE.match(val.strip())
                if match:
                    claims = []
                    try:
                        # Decode payload claims (record key and claim names ONLY per Section K.2, never values!)
                        payload_b64 = match.group(1)
                        # Add padding if missing
                        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
                        claims_dict = json.loads(base64.urlsafe_b64decode(payload_b64))
                        claims = list(claims_dict.keys())
                    except Exception:
                        pass

                    findings.append(create_finding(
                        scan_id=scan_id,
                        check_id=cls.check_id,
                        title=f"JWT Token Stored in {store_name}",
                        owasp=cls.owasp,
                        severity="Medium",
                        confidence="confirmed",
                        url=capture.final_url,
                        evidence_kind="storage",
                        evidence_summary=f"Decoded JWT in {store_name} under key '{key}' with claims: {claims}. Must move to HttpOnly cookie.",
                        origin="code"
                    ))

        return findings


# ==========================================
# D-12: Forms Without Basic Protection
# ==========================================
class CheckD12Forms:
    check_id = "D-12"
    title = "POST Form Lacking Anti-CSRF Token Protection"
    owasp = "A01"

    @classmethod
    def run(cls, capture: ScanCapture, scan_id: str = "sc_000000000000") -> List[DastFindingSchema]:
        findings = []
        for form in capture.forms:
            if form.method == "POST" and not form.has_csrf_token:
                findings.append(create_finding(
                    scan_id=scan_id,
                    check_id=cls.check_id,
                    title="POST Form Lacks CSRF Token Protection",
                    owasp=cls.owasp,
                    severity="Info",
                    confidence="advice",
                    url=capture.final_url,
                    evidence_kind="body_match",
                    evidence_summary=f"Form targeting '{form.action}' uses POST but has no anti-CSRF token input."
                ))
        return findings


# Registry of all 12 checks
ALL_DAST_CHECKS = [
    CheckD01SecurityHeaders,
    CheckD02WeakCSP,
    CheckD03InsecureCookies,
    CheckD04TransportSecurity,
    CheckD05ExposedCredentials,
    CheckD06DomXss,
    CheckD07SensitiveRoutes,
    CheckD08Cors,
    CheckD09InfoDisclosure,
    CheckD10ThirdPartyScripts,
    CheckD11StorageTokens,
    CheckD12Forms,
]
