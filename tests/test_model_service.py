"""
Tests for ProofStack Model Integration, Evidence Grounding,
Security Boundaries, Fallback Provenance, and Ledger Auditing.
"""
import http.server
import json
import os
import sys
import threading
import time
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import models
from backend.database import Base
from backend.model_service import ModelService
from backend.ledger_service import LedgerService
from proofstack.llm.client import (
    ModelAuthError,
    ModelClient,
    ModelConfigError,
    ModelError,
    ModelProviderError,
    ModelRateLimitError,
    ModelTimeoutError,
)
from minischema import validate


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Seed minimal project, task, and run
    proj = models.Project(
        id="proj-model-test",
        name="Model Integration Test Project",
        repository_path="./repo",
        allowed_paths=["src/**", "app/**"],
    )
    db.add(proj)

    task = models.Task(
        id="task-model-test",
        project_id="proj-model-test",
        name="Optimize invoice cache",
        target_file="app/invoices.py",
        target_symbol="get_invoice",
        baseline_commit="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
        benchmark_command=["python", "-m", "pytest"],
        workload_seed=42,
        samples=10,
        tau_noise=0.05,
        noise_max_rel_mad=0.10,
        max_hypotheses=3,
        max_repair_cycles=3,
        max_diff_lines=30,
        max_files_changed=1,
        protected_paths=["tests/**", "alembic/**", ".env*"],
        test_command=["pytest"],
    )
    db.add(task)

    run = models.Run(
        id="run-model-test",
        task_id="task-model-test",
        status=models.RunStatus.AUDITING,
        requested_baseline="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
    )
    db.add(run)

    # Seed baseline and findings
    baseline = models.Baseline(
        id="base-model-test",
        run_id="run-model-test",
        source_revision="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
        benchmark_config={"command": ["test"]},
        seed=42,
        sample_count=10,
        median_ns=1_000_000.0,
        rel_mad=0.03,
        stability_assessment="STABLE",
    )
    db.add(baseline)

    finding_p03 = models.Finding(
        id="find-p03",
        run_id="run-model-test",
        probe_id="P03",
        target_revision="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
        found=True,
        status="EXPLOIT_PROVEN",
        families=["SEC"],
        evidence={"detail": "cross-tenant leak"},
    )
    db.add(finding_p03)

    db.commit()
    yield db
    db.close()


def test_model_service_status_unconfigured(test_db):
    """Verifies that an unconfigured client cleanly reports fallback mode without leaking secrets."""
    client = ModelClient(api_key="", base_url="http://127.0.0.1:9999/v1")
    svc = ModelService(test_db, client=client)
    status = svc.get_status()

    assert status["configured"] is False
    assert status["live_inference_available"] is False
    assert status["provenance_mode"] == "deterministic_fallback"
    assert status["status"] == "FALLBACK_ONLY"
    assert status["key_preview"] is None


def test_model_service_status_configured(test_db):
    """Verifies that a configured client displays a redacted preview and reports live readiness."""
    client = ModelClient(api_key="neb_secret_key_12345", base_url="http://127.0.0.1:9999/v1")
    svc = ModelService(test_db, client=client)
    status = svc.get_status()

    assert status["configured"] is True
    assert status["live_inference_available"] is True
    assert status["provenance_mode"] == "live_inference"
    assert status["key_preview"] == "neb_****"
    assert "secret_key_12345" not in json.dumps(status)


@pytest.mark.asyncio
async def test_deterministic_fallback_hypothesis_generation(test_db):
    """Verifies deterministic fallback hypothesis generation when credentials are unset."""
    client = ModelClient(api_key="", base_url="http://127.0.0.1:9999/v1")
    svc = ModelService(test_db, client=client)

    result = await svc.generate_hypotheses_for_run("run-model-test")

    assert result["run_id"] == "run-model-test"
    assert result["provenance"] == "deterministic_fallback"
    assert result["provider"] == "local_rules"
    assert result["validation_status"] == "VALIDATED"
    assert len(result["hypotheses"]) >= 1

    # Check evidence grounding: P03 IDOR was found, so IDOR_CACHE must be hypothesized
    categories = [h["category"] for h in result["hypotheses"]]
    assert "IDOR_CACHE" in categories

    # Verify persisted in database
    hyps_db = test_db.query(models.Hypothesis).filter(models.Hypothesis.run_id == "run-model-test").all()
    assert len(hyps_db) == len(result["hypotheses"])
    for h in hyps_db:
        assert h.model_metadata["provenance"] == "deterministic_fallback"
        assert h.model_metadata["provider"] == "local_rules"

    # Verify ledger entry
    entries = test_db.query(models.LedgerEntry).filter(models.LedgerEntry.run_id == "run-model-test").all()
    events = [e.event_type for e in entries]
    assert "MODEL_CALL" in events
    assert "HYPOTHESES" in events

    # Verify ledger integrity
    ledger_svc = LedgerService(test_db)
    valid, head = ledger_svc.verify_chain("run-model-test")
    assert valid is True


@pytest.mark.asyncio
async def test_live_inference_mock_hypothesis_generation(test_db):
    """Verifies end-to-end live model inference with a mock HTTP server returning valid structured JSON."""
    mock_response = {
        "task_id": "task-model-test",
        "hypotheses": [
            {
                "hypothesis_id": "H1",
                "root_cause_category": "IDOR_CACHE",
                "taxonomy": {"cwe": "CWE-639"},
                "statement": "Missing principal in invoice cache key permits Bob to read Alice invoices.",
                "evidence_refs": [{"kind": "probe", "ref": "P03::app/invoices.py", "excerpt": "cross-tenant leak"}],
                "falsifiable_prediction": "Scoping cache key by tenant_id blocks unauthorized retrieval.",
            }
        ],
        "experiments": [
            {
                "experiment_id": "E1",
                "kind": "probe",
                "command": ["proofstack-run", "p03_idor_cache"],
                "est_runtime_s": 1.0,
                "predictions": {"H1": "exploit_blocked"},
            }
        ],
    }

    class MockHandler(http.server.BaseHTTPRequestHandler):
        def do_POST(self):
            content_length = int(self.headers["Content-Length"])
            body = json.loads(self.rfile.read(content_length))
            assert self.headers["Authorization"].startswith("Bearer neb_")

            resp_payload = {
                "choices": [
                    {
                        "message": {"content": json.dumps(mock_response)},
                        "finish_reason": "stop",
                    }
                ],
                "usage": {"prompt_tokens": 250, "completion_tokens": 120},
            }
            resp_bytes = json.dumps(resp_payload).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp_bytes)))
            self.end_headers()
            self.wfile.write(resp_bytes)

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), MockHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    try:
        mock_url = f"http://127.0.0.1:{server.server_port}/v1"
        client = ModelClient("neb_valid_key", mock_url, validate=validate, sleep=lambda s: None)
        svc = ModelService(test_db, client=client)

        result = await svc.generate_hypotheses_for_run("run-model-test")

        assert result["provenance"] == "live_inference"
        assert result["provider"] == "nebius"
        assert result["validation_status"] == "VALIDATED"
        assert result["call_record"]["tokens_in"] == 250
        assert result["call_record"]["tokens_out"] == 120
        assert result["call_record"]["response_sha256"] != ""
        assert len(result["hypotheses"]) == 1
        assert result["hypotheses"][0]["category"] == "IDOR_CACHE"

        # Check DB persistence
        h_db = test_db.query(models.Hypothesis).filter(models.Hypothesis.run_id == "run-model-test").first()
        assert h_db.model_metadata["provenance"] == "live_inference"
        assert h_db.model_metadata["tokens_in"] == 250
    finally:
        server.shutdown()


@pytest.mark.asyncio
async def test_live_inference_failure_graceful_fallback(test_db):
    """Verifies that when the live provider returns an HTTP 500 or timeout, the engine falls back gracefully."""
    class FailingHandler(http.server.BaseHTTPRequestHandler):
        def do_POST(self):
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'{"error": "Internal Provider Failure"}')

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FailingHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    try:
        mock_url = f"http://127.0.0.1:{server.server_port}/v1"
        client = ModelClient("neb_valid_key", mock_url, validate=validate, sleep=lambda s: None)
        svc = ModelService(test_db, client=client)

        result = await svc.generate_hypotheses_for_run("run-model-test")

        # Must fall back gracefully to deterministic analysis without crashing
        assert result["provenance"] == "deterministic_fallback"
        assert result["provider"] == "local_rules"
        assert "failure" in result["fallback_reason"].lower()
        assert result["validation_status"] == "VALIDATED"
        assert len(result["hypotheses"]) >= 1
    finally:
        server.shutdown()


@pytest.mark.asyncio
async def test_patch_proposal_security_boundary_enforcement(test_db):
    """Verifies that patch proposals undergo strict security validation."""
    client = ModelClient(api_key="", base_url="http://127.0.0.1:9999/v1")
    svc = ModelService(test_db, client=client)

    result = await svc.propose_patch_for_run("run-model-test")

    assert result["validation_status"] == "VALID"
    assert result["provenance"] == "deterministic_fallback"
    assert result["touches"] == ["app/invoices.py"]
    assert len(result["violations"]) == 0

    # Check database record
    patch = test_db.query(models.Patch).filter(models.Patch.id == result["patch_id"]).first()
    assert patch is not None
    assert patch.application_outcome == "PROPOSED"
    assert patch.review_status == "AWAITING_VERIFICATION"


def test_patch_security_rules_reject_protected_paths(test_db):
    """Verifies that attempting to touch protected paths (tests/**, .env) is rejected."""
    task = test_db.query(models.Task).filter(models.Task.id == "task-model-test").first()
    svc = ModelService(test_db, client=ModelClient(api_key="k", base_url="http://x"))

    # Malicious patch trying to modify test file to disable assertions
    errors, violations = svc._enforce_patch_security_rules(
        task,
        "--- a/tests/test_api.py\n+++ b/tests/test_api.py\n@@ -1 +1 @@\n-# test\n",
        ["tests/test_api.py"],
    )
    assert len(violations) > 0
    assert any("protected path" in v for v in violations)

    # Malicious patch trying path traversal
    errors2, violations2 = svc._enforce_patch_security_rules(
        task,
        "--- a/../../etc/passwd\n+++ b/../../etc/passwd\n",
        ["../../etc/passwd"],
    )
    assert len(violations2) > 0
    assert any("traversal" in v for v in violations2)


def test_ledger_chain_and_tamper_detection_with_model_events(test_db):
    """Verifies that model events are cryptographically chained and tampering is detected."""
    ledger_svc = LedgerService(test_db)
    ledger_svc.append("run-model-test", "MODEL_CALL", {
        "operation": "hypothesis_generation",
        "provider": "nebius",
        "model_id": "nvidia/nemotron-3-super-120b",
        "latency_ms": 420,
    })

    valid, head = ledger_svc.verify_chain("run-model-test")
    assert valid is True

    # Mutate a disposable copy of an event payload
    entry = test_db.query(models.LedgerEntry).filter(
        models.LedgerEntry.run_id == "run-model-test",
        models.LedgerEntry.event_type == "MODEL_CALL",
    ).first()
    assert entry is not None

    orig_payload = dict(entry.payload)
    entry.payload = {**orig_payload, "tampered_attribute": "malicious"}
    test_db.commit()

    tampered_valid, reason = ledger_svc.verify_chain("run-model-test")
    assert tampered_valid is False
    assert "tampered" in reason.lower()

    # Restore payload
    entry.payload = orig_payload
    test_db.commit()
    restored_valid, _ = ledger_svc.verify_chain("run-model-test")
    assert restored_valid is True
