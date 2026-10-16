"""Deterministic demo fixture service for hackathon walkthroughs.

Loads and resets cleanly labeled, isolated demo fixture records adhering strictly to
backend constraints, schemas, and cryptographic ledger verification.
"""
import json
import uuid
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend import models
from backend.ledger_service import LedgerService
from backend.report_service import ReportService

DEMO_PROJECT_ID = "demo-project-invoice"
DEMO_TASK_ID = "demo-task-idor"
DEMO_RUN_ID = "demo-run-idor-2026"


def is_demo_seeded(db: Session) -> bool:
    """Check if the demo run is currently seeded."""
    return db.query(models.Run).filter(models.Run.id == DEMO_RUN_ID).first() is not None


def seed_demo_fixture(db: Session, force: bool = False) -> dict:
    """Seed or re-seed the deterministic demo fixture.
    
    Safe:
    - Never overwrites user projects or runs.
    - Deterministic and idempotent.
    - All records explicitly tagged with provenance='DEMO_FIXTURE'.
    """
    existing_run = db.query(models.Run).filter(models.Run.id == DEMO_RUN_ID).first()
    if existing_run and not force:
        return {
            "status": "already_seeded",
            "project_id": DEMO_PROJECT_ID,
            "task_id": DEMO_TASK_ID,
            "run_id": DEMO_RUN_ID,
            "verdict": "REJECTED",
            "provenance": "DEMO_FIXTURE",
            "entry_count": db.query(models.LedgerEntry).filter(models.LedgerEntry.run_id == DEMO_RUN_ID).count(),
            "message": "Demo fixture already present in database."
        }

    if existing_run and force:
        reset_demo_fixture(db)

    # 1. Project
    project = db.query(models.Project).filter(models.Project.id == DEMO_PROJECT_ID).first()
    if not project:
        project = models.Project(
            id=DEMO_PROJECT_ID,
            name="Invoice Service Security Showcase",
            description="Demonstrates Zero-Compromise verification: an AI-proposed caching optimization is 42,000x faster but leaks tenant data via IDOR. Blocked deterministically.",
            repository_path="./examples/invoice-service",
            default_branch="main",
            version=0,
        )
        db.add(project)
        db.commit()

    # 2. Task
    task = db.query(models.Task).filter(models.Task.id == DEMO_TASK_ID).first()
    if not task:
        task = models.Task(
            id=DEMO_TASK_ID,
            project_id=DEMO_PROJECT_ID,
            name="invoice-cache-idor",
            mode="optimize",
            target_file="app/invoices.py",
            target_symbol="get_object",
            target_kind="function",
            baseline_commit="3f9c2ab",
            candidate_commit="c59ca2c",
            benchmark_command=["python", "-m", "bench.invoice_read"],
            workload_seed=20261013,
            warmups=3,
            samples=20,
            tau_noise=0.05,
            regression_budget=0.05,
            noise_max_rel_mad=0.1,
            test_command=["python", "-m", "pytest", "-q", "tests/"],
            protected_paths=["tests/**", "bench/**", ".proofstack/**"],
            baseline_failures_allowed=[],
            wall_clock_per_experiment_s=60,

            memory_mb=1024,
            max_processes=128,
            max_hypotheses=3,
            max_repair_cycles=3,
            max_model_tokens=60000,
            max_total_runtime_s=1800,
            max_diff_lines=40,
            max_files_changed=2,
            sandbox_backend="nebius",
            require_backend="nebius",
            sandbox_image="0b8f6c1e-5d2a-4c7e-9a31-6f0d2b7c8e14",
            provision_timeout_s=20,
            waivers=[],
            version=0,
        )
        db.add(task)
        db.commit()

    # 3. Run
    run = models.Run(
        id=DEMO_RUN_ID,
        task_id=DEMO_TASK_ID,
        status=models.RunStatus.COMPLETED,
        requested_baseline="3f9c2ab",
        requested_candidate="c59ca2c",
        current_stage="COMPLETED",
        execution_backend="nebius-sandboxes",
        started_at=datetime.fromisoformat("2026-10-13T11:31:15.456344+00:00"),
        completed_at=datetime.fromisoformat("2026-10-13T11:31:15.459759+00:00"),
        final_verdict=models.Verdict.REJECTED,
        verdict_reason="SEC:P03 FAIL - IDOR vulnerability reproduced in candidate; cache lacks tenant isolation",
        policy_version="1.0",
        task_config_snapshot={
            "mode": "optimize",
            "target": "app/invoices.py::get_object",
            "provenance": "DEMO_FIXTURE",
            "model_diagnosis": "nvidia/nemotron-3-super-120b-a12b",
            "model_patch": "nvidia/nemotron-3.5-lightning",
        },
        sandbox_operation_ids=["op-nebius-sandboxes-8819a"],
        environment_fingerprint={
            "os": "Linux 6.8.0-nebius",
            "python": "3.12.3",
            "sandbox": "nebius-sandboxes",
            "networking": "disabled",
            "isolation": "cgroups-v2-strict",
        },
        run_config={
            "is_demo_fixture": True,
            "fixture_name": "invoice-cache-idor",
            "provenance": "DEMO_FIXTURE",
            "scenario": "IDOR Exploitation on Naive AI In-Memory Caching",
        },
        ledger_head_hash="319915dbf8ea2782e8994091c8a9f4662ded5f373ca7610856bd87dbe6893d22",
        version=5,
    )
    db.add(run)
    db.commit()

    # 4. Baseline & Samples
    samples_ns = [
        10209791, 10337732, 10148507, 10269600, 12099500,
        10228910, 10161340, 10194791, 10243844, 10208820,
        10218534, 10204161, 10143685, 10211030, 10148479,
        10223457, 10180819, 10170596, 10273001, 10307381
    ]
    baseline = models.Baseline(
        id=str(uuid.uuid4()),
        run_id=DEMO_RUN_ID,
        source_revision="3f9c2ab",
        benchmark_config={"command": ["python", "-m", "bench.invoice_read"], "seed": 20261013},
        seed=20261013,
        python_version="3.12.3",
        runtime_version="CPython",
        execution_backend="nebius-sandboxes",
        sample_count=20,
        median_ns=10210410.0,
        rel_mad=0.00531797839,
        stability_assessment="STABLE",
    )
    db.add(baseline)
    for idx, val in enumerate(samples_ns):
        db.add(models.BaselineSample(
            id=str(uuid.uuid4()),
            baseline_id=baseline.id,
            sample_index=idx,
            measurement_name="wall_time",
            value_ns=float(val),
            unit="ns",
        ))
    db.commit()

    # 5. Hypotheses
    hyps_data = [
        ("H1", "REDOS", "Regex catastrophic backtracking on user input causes quadratic time.", "FALSIFIED", "CWE-1333"),
        ("H2", "N_PLUS_1", "Database queries inside a loop cause N+1 overhead and latency spikes.", "FALSIFIED", "CWE-400"),
        ("H3", "IDOR_CACHE", "Cache key lacks principal, enabling cross-tenant data leakage.", "SUPPORTED", "CWE-639"),
    ]
    for hid, cat, stmt, status, cwe in hyps_data:
        db.add(models.Hypothesis(
            id=str(uuid.uuid4()),
            run_id=DEMO_RUN_ID,
            hypothesis_id=hid,
            category=cat,
            taxonomy={"cwe": cwe, "perf": None},
            statement=stmt,
            evidence_refs=[{"kind": "ast", "ref": "app/invoices.py", "excerpt": stmt[:60]}],
            falsifiable_prediction=f"If {cat} is true, execution time scales superlinearly with input",
            validation_status=status,
        ))

    # 6. Experiments
    exps_data = [
        ("E1", ["H1"], "probe", ["proofstack-run", "redos"], {"growth_ratio": 1.05}, 1.5, "COMPLETED"),
        ("E2", ["H2"], "probe", ["proofstack-run", "n_plus_1"], {"queries": 1}, 2.1, "COMPLETED"),
        ("E3", ["H3"], "probe", ["proofstack-run", "idor_cache"], {"exploit_proven": True, "leaked_rows": 2}, 3.8, "COMPLETED"),
    ]
    for eid, hids, etype, cmd, obs, dur, res in exps_data:
        db.add(models.Experiment(
            id=str(uuid.uuid4()),
            run_id=DEMO_RUN_ID,
            experiment_id=eid,
            hypothesis_ids=hids,
            experiment_type=etype,
            command=cmd,
            parameters={"seed": 20261013},
            predicted_outcomes={hids[0]: "high"},
            actual_observations=obs,
            execution_backend="nebius-sandboxes",
            duration_s=dur,
            result_status=res,
        ))

    # 7. Patches
    diff_patch = (
        "--- a/app/invoices.py\n"
        "+++ b/app/invoices.py\n"
        "@@ -1,6 +1,7 @@\n"
        " import time\n"
        " \n"
        " _DB = {1: {\"owner\": \"alice\", \"total\": 120}, 2: {\"owner\": \"bob\", \"total\": 75}}\n"
        "+_CACHE = {}                                                # AI \"optimisation\": cache keyed by object only\n"
        " \n"
        " \n"
        " def _slow_fetch(oid):\n"
        "@@ -9,7 +10,10 @@\n"
        " \n"
        " \n"
        " def get_object(principal, object_id):\n"
        "+    if object_id in _CACHE:\n"
        "+        return _CACHE[object_id]\n"
        "     row = _slow_fetch(object_id)\n"
        "     if row is None or row[\"owner\"] != principal:\n"
        "         raise PermissionError(\"forbidden\")\n"
        "+    _CACHE[object_id] = row\n"
        "     return row\n"
    )
    db.add(models.Patch(
        id=str(uuid.uuid4()),
        run_id=DEMO_RUN_ID,
        cycle_number=1,
        parent_revision="3f9c2ab",
        diff_text=diff_patch,
        diff_sha256="eec4426a6c78041c7b86d5912de2cf467144b09c76f97f6fba307b346eeab265",
        changed_files=["app/invoices.py"],
        line_count=22,
        validation_status="VALID",
        protected_path_results={"passed": True, "violations": []},
        application_outcome="APPLIED",
    ))

    # 8. Findings
    findings_data = [
        ("P01", False, "NOT_REPRODUCED", ["SEC", "PERF"], {"target": "app/invoices.py"}),
        ("P02", False, "NOT_REPRODUCED", ["PERF", "SEC"], {"target": "app/invoices.py"}),
        ("P03", True, "EXPLOIT_PROVEN", ["SEC"], {
            "leaks": [
                {"attacker": "bob", "object": 1, "victim": "alice"},
                {"attacker": "alice", "object": 2, "victim": "bob"}
            ],
            "canary": "CANARY_TENANT_ISOLATION_BREACH"
        }),
    ]
    for pid, found, status, fams, metrics in findings_data:
        db.add(models.Finding(
            id=str(uuid.uuid4()),
            run_id=DEMO_RUN_ID,
            probe_id=pid,
            target_revision="c59ca2c",
            found=found,
            status=status,
            families=fams,
            metrics=metrics,
            evidence={"summary": f"{pid} DAST audit probe result", "fingerprint": "f703a5ccfeb8e629"},
            fingerprint="f703a5ccfeb8e629",
        ))


    # 9. Verification Gates
    gates_data = [
        ("G0_integrity", "INTEGRITY", models.GateStatus.PASS, True, None, 0, {"diff_size_ok": True, "protected_paths_ok": True}),
        ("G1_supply_chain", "SEC", models.GateStatus.PASS, True, "P13", 1, {"no_new_imports": True, "no_secrets": True}),
        ("G2_pre_gates", "SEC", models.GateStatus.PASS, True, "P09", 2, {"probes": ["P09", "P10", "P11", "P12"]}),
        ("G3_correctness", "CORR", models.GateStatus.PASS, True, "P16", 3, {"unit_tests": "pass", "differential": "pass"}),
        ("G4_security", "SEC", models.GateStatus.FAIL, True, "P03", 4, {"exploit_proven": True, "leaks": 2, "probe_id": "P03"}, "IDOR vulnerability reproduced: cross-tenant invoice leakage"),
        ("G5_concurrency", "CONC", models.GateStatus.NOT_APPLICABLE, False, "P05", 5, {"reason": "single-threaded sync target"}),
        ("G6_complexity", "PERF", models.GateStatus.PASS, True, "P04", 6, {"growth_ratio": 1.0}),
        ("G7_performance", "PERF", models.GateStatus.PASS, True, None, 7, {"speedup": 42543.3771, "ci_low": 39951.45, "ci_high": 42935.02}),
    ]
    for item in gates_data:
        gid, fam, status, req, pid, order, ev = item[:7]
        reason = item[7] if len(item) > 7 else None
        db.add(models.Gate(
            id=str(uuid.uuid4()),
            run_id=DEMO_RUN_ID,
            gate_id=gid,
            family=fam,
            probe_id=pid,
            execution_order=order,
            status=status,
            required=req,
            evidence=ev,
            metrics={"order": order},
            failure_reason=reason,
        ))

    # 10. Canonical Decision
    decision = models.Decision(
        id=str(uuid.uuid4()),
        run_id=DEMO_RUN_ID,
        verdict=models.Verdict.REJECTED,
        policy_version="1.0",
        profile_version="1.0",
        reasons=["SEC:P03 FAIL - IDOR vulnerability reproduced in candidate; cross-tenant invoice leakage"],
        family_summary={"PERF": "PASS", "SEC": "FAIL", "CORR": "PASS", "CONC": "NOT_APPLICABLE", "INTEGRITY": "PASS"},
        gate_results=[
            {"gate_id": "G0_integrity", "family": "INTEGRITY", "status": "PASS"},
            {"gate_id": "G1_supply_chain", "family": "SEC", "status": "PASS"},
            {"gate_id": "G2_pre_gates", "family": "SEC", "status": "PASS"},
            {"gate_id": "G3_correctness", "family": "CORR", "status": "PASS"},
            {"gate_id": "G4_security", "family": "SEC", "status": "FAIL", "probe_id": "P03"},
            {"gate_id": "G5_concurrency", "family": "CONC", "status": "NOT_APPLICABLE"},
            {"gate_id": "G6_complexity", "family": "PERF", "status": "PASS"},
            {"gate_id": "G7_performance", "family": "PERF", "status": "PASS", "speedup": 42543.38},
        ],
        waiver_ids=[],
        budget_usage={"wall_time_s": 8.4, "tokens_used": 2451},
        evidence_manifest_hash="319915dbf8ea2782e8994091c8a9f4662ded5f373ca7610856bd87dbe6893d22",
    )
    db.add(decision)
    db.commit()

    # 11. Ledger Entries from examples/demo_idor_run.ledger.jsonl
    ledger_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "examples", "demo_idor_run.ledger.jsonl")
    if os.path.exists(ledger_path):
        with open(ledger_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                entry = json.loads(line)
                seq = entry.get("seq", 0)
                event_type = entry.get("entry_type", "EVENT")
                ehash = entry.get("hash", "")
                phash = entry.get("previous_hash", "")
                ts_str = entry.get("timestamp", datetime.now(timezone.utc).isoformat())
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                db.add(models.LedgerEntry(
                    id=str(uuid.uuid4()),
                    run_id=DEMO_RUN_ID,
                    sequence_number=seq,
                    event_type=event_type,
                    timestamp=ts,
                    entry_hash=ehash,
                    previous_hash=phash,
                    payload=entry,
                ))
        db.commit()

    # 12. Pre-generate deterministic Report
    report_service = ReportService(db)
    report_service.generate(DEMO_RUN_ID, "markdown", "1.0")
    report_service.generate(DEMO_RUN_ID, "json", "1.0")

    return {
        "status": "seeded",
        "project_id": DEMO_PROJECT_ID,
        "task_id": DEMO_TASK_ID,
        "run_id": DEMO_RUN_ID,
        "verdict": "REJECTED",
        "provenance": "DEMO_FIXTURE",
        "entry_count": db.query(models.LedgerEntry).filter(models.LedgerEntry.run_id == DEMO_RUN_ID).count(),
        "message": "Deterministic demo fixture seeded successfully."
    }


def reset_demo_fixture(db: Session) -> dict:
    """Reset the demo fixture cleanly without touching any user data."""
    # Find demo run
    run = db.query(models.Run).filter(models.Run.id == DEMO_RUN_ID).first()
    if run:
        db.delete(run)
        db.commit()

    task = db.query(models.Task).filter(models.Task.id == DEMO_TASK_ID).first()
    if task:
        db.delete(task)
        db.commit()

    project = db.query(models.Project).filter(models.Project.id == DEMO_PROJECT_ID).first()
    if project:
        db.delete(project)
        db.commit()

    return {"status": "reset", "message": "Demo fixture removed cleanly"}
