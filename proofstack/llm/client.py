"""Nebius Token Factory client (OpenAI-compatible /v1). stdlib only; the SDK's own retries are not used.

Policy: resolve model ids against the live catalog; prefer strict json_schema, fall back to json_object, always
validate locally; retry 429/5xx/timeouts with full jitter (honouring Retry-After); repair invalid JSON at most twice.
"""
from __future__ import annotations

import difflib
import hashlib
import json
import os
import random
import re
import time
import urllib.error
import urllib.request

DEFAULT_BASE = "https://api.tokenfactory.nebius.com/v1"


class ModelError(RuntimeError):
    pass


class ModelConfigError(ModelError):
    pass


class ModelAuthError(ModelError):
    pass


class ModelRateLimitError(ModelError):
    pass


class ModelProviderError(ModelError):
    pass


class ModelTimeoutError(ModelError):
    pass


class ModelValidationError(ModelError):
    pass


def resolve_model(requested: str, catalog: list[str], fallbacks=()) -> tuple[str, str]:
    """-> (resolved_id, how): exact > case-insensitive > unique prefix > first fallback present > error."""
    if requested in catalog:
        return requested, "exact"
    low = {c.lower(): c for c in catalog}
    if requested.lower() in low:
        return low[requested.lower()], "case-insensitive"
    pre = [c for c in catalog if c.lower().startswith(requested.lower())]
    if len(pre) == 1:
        return pre[0], "unique-prefix"
    if len(pre) > 1:
        raise ModelError(f"{requested!r} is ambiguous: {pre}")
    for f in fallbacks:
        if f.lower() in low:
            return low[f.lower()], "fallback"
    near = difflib.get_close_matches(requested, [c for c in catalog if c.lower().startswith("nvidia/")], n=5, cutoff=0.4)
    raise ModelError(f"no eligible model for {requested!r}; closest NVIDIA ids: {near}")


class ModelClient:
    def __init__(self, api_key=None, base_url=None, validate=None, sleep=time.sleep, timeout_s=120):
        self.base = (base_url or os.environ.get("NEBIUS_BASE_URL") or DEFAULT_BASE).rstrip("/")
        self.key = api_key if api_key is not None else os.environ.get("NEBIUS_API_KEY", "")
        self.validate, self.sleep, self.timeout = validate, sleep, timeout_s
        self.format_ix: dict[str, int] = {}                   # model -> index into the response_format ladder

    @property
    def is_configured(self) -> bool:
        return bool(self.key and self.key.strip())

    def _http(self, method, path, body=None):
        if not self.is_configured:
            raise ModelConfigError("NEBIUS_API_KEY is not configured in environment or settings")
        req = urllib.request.Request(f"{self.base}/{path}", method=method,
                                     data=None if body is None else json.dumps(body).encode(),
                                     headers={"Authorization": f"Bearer {self.key}", "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=self.timeout) as r:
            return json.loads(r.read())

    def models(self) -> list[str]:
        return [m["id"] for m in self._http("GET", "models")["data"]]

    def chat_json(self, route: dict, messages: list, schema_name: str, schema: dict, seed=None,
                  max_attempts=3, max_repairs=2):
        """route = {model, temperature, top_p, max_tokens, extra_body?}. Returns (object, call_record)."""
        model, msgs = route["model"], list(messages)
        ladder = [{"type": "json_schema", "json_schema": {"name": schema_name, "strict": True, "schema": schema}},
                  {"type": "json_object"}]
        t0, attempts, repairs, tin, tout = time.monotonic(), 0, 0, 0, 0
        while True:
            fmt = ladder[min(self.format_ix.get(model, 0), 1)]
            body = {"model": model, "messages": msgs, "temperature": route["temperature"], "top_p": route["top_p"],
                    "max_tokens": route["max_tokens"], "response_format": fmt, **({"seed": seed} if seed is not None else {}),
                    **route.get("extra_body", {})}
            try:
                resp = self._http("POST", "chat/completions", body)
            except urllib.error.HTTPError as e:
                detail = e.read().decode("utf-8", "replace")[:300]
                if e.code in (400, 422) and fmt["type"] == "json_schema" and re.search(r"response_format|json_schema|schema", detail):
                    self.format_ix[model] = 1                 # remember: this model needs json_object + local validation
                    continue
                if e.code in (429, 500, 502, 503, 504) and attempts < max_attempts - 1:
                    ra = e.headers.get("Retry-After", "")
                    self.sleep(float(ra) if ra.replace(".", "", 1).isdigit() else random.uniform(0, min(20, 2 ** attempts)))
                    attempts += 1
                    continue
                if e.code in (401, 403):
                    raise ModelAuthError(f"HTTP {e.code}: credentials invalid or unauthorized: {detail}") from e
                if e.code == 429:
                    raise ModelRateLimitError(f"HTTP 429: rate limited by provider: {detail}") from e
                if e.code in (500, 502, 503, 504):
                    raise ModelProviderError(f"HTTP {e.code}: provider server error: {detail}") from e
                raise ModelError(f"HTTP {e.code}: {detail}") from e
            except (urllib.error.URLError, TimeoutError) as e:
                if attempts >= max_attempts - 1:
                    if isinstance(e, TimeoutError) or "timed out" in str(e).lower():
                        raise ModelTimeoutError(f"transport timeout: {e!r}") from e
                    raise ModelError(f"transport failure: {e!r}") from e
                self.sleep(random.uniform(0, min(20, 2 ** attempts)))
                attempts += 1
                continue
            u = resp.get("usage", {})
            tin, tout = tin + u.get("prompt_tokens", 0), tout + u.get("completion_tokens", 0)
            ch = resp["choices"][0]
            text = ch["message"].get("content") or ""
            if ch["message"].get("refusal") or ch.get("finish_reason") == "length":
                raise ModelError(f"refusal or truncation (finish_reason={ch.get('finish_reason')})")
            try:
                obj = json.loads(re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip()))
                errs = self.validate(obj, schema) if self.validate else []
            except json.JSONDecodeError as e:
                obj, errs = None, [f"not valid JSON: {e}"]
            if not errs:
                return obj, {"model_id": model, "tokens_in": tin, "tokens_out": tout, "attempts": attempts + 1,
                             "repairs": repairs, "response_format": fmt["type"], "latency_ms": int((time.monotonic() - t0) * 1000),
                             "response_sha256": hashlib.sha256(text.encode()).hexdigest()}
            if repairs >= max_repairs:
                raise ModelError(f"schema violation after {repairs} repairs: {errs[:3]}")
            repairs += 1
            msgs += [{"role": "assistant", "content": text},
                     {"role": "user", "content": f"Your reply was invalid: {errs[:5]}. Return ONLY corrected JSON for the schema."}]
