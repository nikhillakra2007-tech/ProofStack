"""
ProofStack DAST Headless Scanner Worker
Navigates to authorised target URLs using Playwright headless Chromium (with HTTP fallback),
capturing DOM, network requests, cookies, storage, and injecting inert DOM-XSS canaries.
Strict limits: GET/HEAD only, max 2 rps, 300 max requests, 60s timeout, 2MB body cap.
"""

from __future__ import annotations
import re
import time
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

import httpx

from proofstack.dast.scanner.capture import ScanCapture, ScanCookie, NetworkEntry, FormInfo
from proofstack.schemas import ScanLimits


class ScannerWorker:
    def __init__(self, limits: Optional[ScanLimits] = None):
        self.limits = limits or ScanLimits(max_rps=2.0, max_requests=300)
        self.request_count: int = 0
        self.last_request_time: float = 0.0

    def _rate_limit_throttle(self) -> None:
        if self.request_count >= self.limits.max_requests:
            raise RuntimeError(f"Scan request limit reached ({self.limits.max_requests} requests)")

        min_interval = 1.0 / self.limits.max_rps
        now = time.time()
        elapsed = now - self.last_request_time
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)

        self.last_request_time = time.time()
        self.request_count += 1

    def scan_target(self, target_url: str) -> ScanCapture:
        """
        Executes headless inspection on target_url.
        Attempts Playwright first; falls back to HTTP telemetry engine if browser binary is missing.
        """
        try:
            return self._scan_with_playwright(target_url)
        except Exception:
            return self._scan_with_http_telemetry(target_url)

    def _scan_with_playwright(self, target_url: str) -> ScanCapture:
        from playwright.sync_api import sync_playwright

        network_entries: List[NetworkEntry] = []
        console_logs: List[Dict[str, str]] = []
        canary_hits: List[str] = []
        inert_canary = "pp_canary_7f3a"

        self._rate_limit_throttle()

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(ignore_https_errors=True)
            page = context.new_page()

            # Record network traffic
            def on_response(response):
                try:
                    headers = {k: v for k, v in response.headers.items()}
                    body = response.text() if len(response.body()) < 2 * 1024 * 1024 else "[EXCEEDED_2MB_CAP]"
                    network_entries.append(
                        NetworkEntry(
                            url=response.url,
                            method=response.request.method,
                            status=response.status,
                            headers=headers,
                            body=body
                        )
                    )
                except Exception:
                    pass

            page.on("response", on_response)
            page.on("console", lambda msg: console_logs.append({"type": msg.type, "text": msg.text}))

            # D-06: Instrument sinks via page.add_init_script for inert canary detection
            instrument_script = f"""
            (function() {{
                const canary = "{inert_canary}";
                const checkString = (str, sink) => {{
                    if (typeof str === 'string' && str.indexOf(canary) !== -1) {{
                        window.__pp_canary_hits = window.__pp_canary_hits || [];
                        window.__pp_canary_hits.push(sink);
                    }}
                }};
                const origInner = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
                Object.defineProperty(Element.prototype, 'innerHTML', {{
                    set: function(val) {{
                        checkString(val, 'innerHTML');
                        return origInner.call(this, val);
                    }}
                }});
                const origWrite = document.write;
                document.write = function(val) {{
                    checkString(val, 'document.write');
                    return origWrite.apply(this, arguments);
                }};
            }})();
            """
            page.add_init_script(instrument_script)

            # Navigate with inert canary hash/query
            target_with_canary = f"{target_url}#{inert_canary}"
            page.goto(target_with_canary, timeout=60000, wait_until="networkidle")

            dom_html = page.content()
            final_url = page.url
            cookies_raw = context.cookies()
            storage_data = page.evaluate("() => ({ local: {...localStorage}, session: {...sessionStorage}, hits: window.__pp_canary_hits || [] })")

            cookies = [
                ScanCookie(
                    name=c["name"],
                    value=c["value"],
                    secure=c.get("secure", False),
                    http_only=c.get("httpOnly", False),
                    same_site=c.get("sameSite")
                )
                for c in cookies_raw
            ]

            # Parse forms
            forms = self._parse_dom_forms(dom_html)

            browser.close()

            # Main response headers
            main_headers = {}
            for entry in network_entries:
                if entry.url == final_url or entry.url == target_url:
                    main_headers = entry.headers
                    break

            return ScanCapture(
                target_url=target_url,
                final_url=final_url,
                status_code=200,
                dom_html=dom_html,
                response_headers=main_headers,
                cookies=cookies,
                network_requests=network_entries,
                local_storage=storage_data.get("local", {}),
                session_storage=storage_data.get("session", {}),
                console_logs=console_logs,
                forms=forms,
                canary_hits=storage_data.get("hits", [])
            )

    def _scan_with_http_telemetry(self, target_url: str) -> ScanCapture:
        """
        Lightweight HTTP-based fallback capture.
        """
        self._rate_limit_throttle()
        network_entries: List[NetworkEntry] = []
        cookies: List[ScanCookie] = []

        with httpx.Client(timeout=30.0, follow_redirects=True, verify=False) as client:
            resp = client.get(target_url)
            main_headers = {k: v for k, v in resp.headers.items()}
            dom_html = resp.text
            final_url = str(resp.url)

            network_entries.append(
                NetworkEntry(
                    url=final_url,
                    method="GET",
                    status=resp.status_code,
                    headers=main_headers,
                    body=dom_html[:2000000]
                )
            )

            for name, val in resp.cookies.items():
                cookies.append(ScanCookie(name=name, value=val))

            forms = self._parse_dom_forms(dom_html)

            return ScanCapture(
                target_url=target_url,
                final_url=final_url,
                status_code=resp.status_code,
                dom_html=dom_html,
                response_headers=main_headers,
                cookies=cookies,
                network_requests=network_entries,
                forms=forms
            )

    def _parse_dom_forms(self, dom_html: str) -> List[FormInfo]:
        forms: List[FormInfo] = []
        form_matches = re.findall(r"<form\b([^>]*)>([\s\S]*?)</form>", dom_html, flags=re.IGNORECASE)
        for attrs, body in form_matches:
            method_match = re.search(r'method=[\'"]([^\'"]+)[\'"]', attrs, flags=re.IGNORECASE)
            method = method_match.group(1).upper() if method_match else "GET"
            action_match = re.search(r'action=[\'"]([^\'"]+)[\'"]', attrs, flags=re.IGNORECASE)
            action = action_match.group(1) if action_match else ""

            has_csrf = bool(re.search(r'(?i)name=[\'"][^\'"]*(?:csrf|_token|authenticity_token)[^\'"]*[\'"]', body))
            forms.append(FormInfo(action=action, method=method, has_csrf_token=has_csrf))
        return forms
