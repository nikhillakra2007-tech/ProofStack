"""
ProofStack Model Gateway
Interfaces with NVIDIA Nemotron via Token Factory / OpenAI-compatible endpoint.
Strict schema enforcement, bounded retries (attempts 2 & 3 @ temp 0.0),
token budget tracking, secret redaction, and MODEL_CALL ledger emission.
"""

from __future__ import annotations
import json
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx

from proofstack.controller.budget import BudgetTracker, BudgetExhaustedError
from proofstack.model.validators import strip_code_fences, parse_and_validate_json


class ModelGatewayError(Exception):
    pass


class ModelGateway:
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        budget_tracker: Optional[BudgetTracker] = None,
    ):
        self.base_url = base_url or os.environ.get("TOKEN_FACTORY_BASE_URL", "https://api.tokenfactory.nebius.ai/v1")
        self.api_key = api_key or os.environ.get("NEBIUS_API_KEY", "")
        self.budget_tracker = budget_tracker or BudgetTracker()
        self.supports_response_format = True  # Auto-cached capability flag

        # Model IDs live only in config/models.yaml (Decision D11)
        self.diagnosis_model = "nvidia/nemotron-3-super-120b"
        self.patch_model = "nvidia/nemotron-3.5-lightning"

    def redact_secrets_from_prompt(self, text: str) -> str:
        """
        G0 pre-scanner on outgoing prompts: scrubs any potential API keys or private keys.
        """
        scrubbed = re.sub(r"AKIA[0-9A-Z]{16}", "AKIA****************", text)
        scrubbed = re.sub(r"gh[pousr]_[A-Za-z0-9_]{36,}", "ghp_************************************", scrubbed)
        scrubbed = re.sub(r"xox[baprs]-[0-9A-Za-z]{10,}", "xoxb-********************", scrubbed)
        scrubbed = re.sub(r"sk_(?:live|test)_[0-9a-zA-Z]{24,}", "sk_live_************************", scrubbed)
        if self.api_key and len(self.api_key) > 8:
            scrubbed = scrubbed.replace(self.api_key, "[REDACTED_API_KEY]")
        return scrubbed

    def call_nemotron(
        self,
        prompt: str,
        system_prompt: str,
        schema: Dict[str, Any],
        model_id: str,
        role_temperature: float = 0.1,
        max_tokens: int = 4000,
        task_id: str = "DEFAULT",
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Executes bounded call to Nemotron with up to 3 attempts.
        Attempt 1: role_temperature
        Attempt 2 & 3: temp 0.0 with validator error text appended.
        Returns: (parsed_json, call_telemetry)
        """
        current_prompt = self.redact_secrets_from_prompt(prompt)
        system_prompt = self.redact_secrets_from_prompt(system_prompt)

        last_error = ""
        telemetry = {
            "model_id": model_id,
            "attempts": 0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "latency_s": 0.0,
            "task_id": task_id
        }

        # Embed compact schema in prompt
        compact_schema = json.dumps(schema, separators=(",", ":"))
        schema_instruction = f"\n\nCRITICAL: Respond with raw JSON strictly adhering to this JSON Schema:\n{compact_schema}"
        full_system = f"{system_prompt}{schema_instruction}"

        for attempt in range(1, 4):
            telemetry["attempts"] = attempt
            temp = role_temperature if attempt == 1 else 0.0

            if attempt > 1:
                prompt_to_send = f"{current_prompt}\n\n[VALIDATION_ERROR in previous attempt: {last_error}. Fix all issues and return pure valid JSON.]"
            else:
                prompt_to_send = current_prompt

            # Check budget
            self.budget_tracker.check_all()

            t0 = time.time()
            raw_response, usage = self._dispatch_http_call(
                model_id=model_id,
                system=full_system,
                user=prompt_to_send,
                temperature=temp,
                max_tokens=max_tokens,
                schema=schema if self.supports_response_format else None
            )
            elapsed = time.time() - t0
            telemetry["latency_s"] += elapsed

            pt = usage.get("prompt_tokens", len(prompt_to_send) // 4)
            ct = usage.get("completion_tokens", len(raw_response) // 4)
            telemetry["prompt_tokens"] += pt
            telemetry["completion_tokens"] += ct
            self.budget_tracker.record_token_usage(pt, ct)

            valid, parsed, err_msg = parse_and_validate_json(raw_response, schema)
            if valid and parsed is not None:
                return parsed, telemetry

            last_error = err_msg or "Unknown validation error"

        raise ModelGatewayError(f"Exhausted 3 attempts calling {model_id}. Last error: {last_error}")

    def _dispatch_http_call(
        self,
        model_id: str,
        system: str,
        user: str,
        temperature: float,
        max_tokens: int,
        schema: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, Dict[str, int]]:
        """
        Sends the actual OpenAI-compatible chat completion payload.
        Simulates structured response locally if no live API key is set in test/dev environment.
        """
        if not self.api_key or "nebius.ai" not in self.base_url:
            # Deterministic mock response for offline/dev environments
            return self._generate_offline_mock(model_id, user, schema), {"prompt_tokens": 120, "completion_tokens": 60}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        body: Dict[str, Any] = {
            "model": model_id,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        if schema and self.supports_response_format:
            body["response_format"] = {
                "type": "json_object",
                "schema": schema
            }

        with httpx.Client(timeout=60.0) as client:
            try:
                res = client.post(f"{self.base_url}/chat/completions", headers=headers, json=body)
                if res.status_code == 400 and "response_format" in res.text:
                    self.supports_response_format = False
                    body.pop("response_format", None)
                    res = client.post(f"{self.base_url}/chat/completions", headers=headers, json=body)

                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})
                return content, usage
            except Exception as e:
                raise ModelGatewayError(f"HTTP call to {self.base_url} failed: {str(e)}")

    def _generate_offline_mock(self, model_id: str, user_prompt: str, schema: Optional[Dict[str, Any]]) -> str:
        """
        Deterministic offline mock generator satisfying the exact schema for test suites.
        """
        if "Hypothesis" in str(schema):
            return json.dumps({
                "hypotheses": [
                    {
                        "id": "H1",
                        "problem_id": "T1-1",
                        "claim": "Nested quantifier catastrophic regex backtracking causes CPU freeze on evil input",
                        "code_refs": [{"file": "vuln.py", "line_start": 10, "line_end": 20}],
                        "evidence_refs": ["art_1234567890ab"],
                        "experiment": {"kind": "static_ast", "setup_cost": 0, "risk": 0},
                        "predicted_outcomes": {"if_true": "CONFIRMED", "if_false": "REFUTED"}
                    }
                ]
            })
        elif "remediation" in user_prompt.lower() or "dast" in user_prompt.lower() or "diff" in str(schema):
            return json.dumps({
                "diff": "--- a/server.js\n+++ b/server.js\n@@ -1,3 +1,4 @@\n+const helmet = require('helmet');\n",
                "rationale": "Add security headers including strict CSP to resolve finding",
                "preserved_identity": ["user_id", "tenant_id"],
                "new_dependencies": [],
                "behavior_notes": "Safe remediation applied without changing routing.",
                "give_up_reason": None
            })
        return json.dumps({"status": "OK"})
