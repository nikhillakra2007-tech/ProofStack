"""ProofStack FastAPI backend server."""
import uuid
import json
import os
import asyncio
import hashlib
import hmac
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from backend.config import settings
from backend.database import get_db, engine
from backend import models
from backend.schemas import (
    ProjectCreate, ProjectResponse, ProjectUpdate,
    TaskCreate, TaskResponse, TaskUpdate,
    RunCreate, RunResponse, RunDetailResponse, RunUpdate,
    BaselineResponse, HypothesisResponse, ExperimentResponse,
    PatchResponse, GateResponse, FindingResponse,
    LedgerEntryResponse, ArtifactResponse, RunEventResponse,
    LedgerVerifyResponse, ErrorResponse, RunStatusEnum, VerdictEnum,
    ReportCreate, ReportResponse, DecisionResponse, DemoSeedResponse,
    ModelStatusResponse, ModelAnalyzeRequest, ModelAnalyzeResponse,
    ModelPatchRequest, ModelPatchResponse,
)
from backend.ledger_service import LedgerService
from backend.event_bus import event_bus

app = FastAPI(
    title="ProofStack API",
    version="0.1.0",
    description="Evidence-driven Python performance investigation and controlled code-remediation",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

PUBLIC_PATHS = {"/api/health", "/api/ready", "/docs", "/openapi.json", "/redoc"}


async def verify_api_key(request: Request, api_key: Optional[str] = Security(API_KEY_HEADER)):
    if request.url.path in PUBLIC_PATHS:
        return None
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    expected = settings.secret_key
    if settings.proofstack_env == "production" and (not expected or expected == "change-me-in-production"):
        raise HTTPException(status_code=500, detail="Server secret not configured for production")
    if not expected:
        raise HTTPException(status_code=500, detail="Server secret not configured")
    if not hmac.compare_digest(api_key, expected):
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/ready")
def ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "up"
    except Exception:
        db_status = "down"
    return {"ready": db_status == "up", "database": db_status}


# ---- Projects ----

@app.get("/api/projects", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()


@app.post("/api/projects", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    project = models.Project(id=str(uuid.uuid4()), **data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.patch("/api/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    updates = data.model_dump(exclude_unset=True)
    expected_version = updates.pop("expected_version", None)
    if expected_version is not None and expected_version != project.version:
        raise HTTPException(status_code=409, detail=f"Stale write: expected version {project.version}")
    for key, value in updates.items():
        setattr(project, key, value)
    project.version = (project.version or 0) + 1
    db.commit()
    db.refresh(project)
    return project


# ---- Tasks ----

@app.get("/api/tasks", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key), project_id: Optional[str] = None):
    query = db.query(models.Task)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    return query.order_by(models.Task.created_at.desc()).all()


@app.post("/api/tasks", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    task = models.Task(id=str(uuid.uuid4()), **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, data: TaskUpdate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updates = data.model_dump(exclude_unset=True)
    expected_version = updates.pop("expected_version", None)
    if expected_version is not None and expected_version != task.version:
        raise HTTPException(status_code=409, detail=f"Stale write: expected version {task.version}")
    for key, value in updates.items():
        if hasattr(task, key):
            setattr(task, key, value)
    task.version = (task.version or 0) + 1
    db.commit()
    db.refresh(task)
    return task


@app.post("/api/tasks/{task_id}/validate")
def validate_task(task_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    from proofstack.schemas import validate_task_intake
    task_data = {
        "schema_version": task.schema_version,
        "task_id": task.id,
        "mode": task.mode,
        "repository": {"path": "local", "baseline_commit": task.baseline_commit,
                        "candidate_commit": task.candidate_commit},
        "target": {"file": task.target_file, "symbol": task.target_symbol, "kind": task.target_kind},
        "benchmark": {"command": task.benchmark_command, "workload_seed": task.workload_seed,
                       "warmups": task.warmups, "samples": task.samples, "tau_noise": task.tau_noise,
                       "regression_budget": task.regression_budget, "noise_max_rel_mad": task.noise_max_rel_mad},
        "correctness": {"test_command": task.test_command, "protected_paths": task.protected_paths,
                         "baseline_failures_allowed": task.baseline_failures_allowed if isinstance(task.baseline_failures_allowed, list) else []},

        "budgets": {"wall_clock_per_experiment_s": task.wall_clock_per_experiment_s,
                     "memory_mb": task.memory_mb, "max_processes": task.max_processes,
                     "max_hypotheses": task.max_hypotheses, "max_repair_cycles": task.max_repair_cycles,
                     "max_model_tokens": task.max_model_tokens, "max_total_runtime_s": task.max_total_runtime_s,
                     "max_diff_lines": task.max_diff_lines, "max_files_changed": task.max_files_changed},
        "sandbox": {"backend": task.sandbox_backend, "require_backend": task.require_backend,
                     "image": task.sandbox_image or "", "provision_timeout_s": task.provision_timeout_s},
        "waivers": task.waivers,
    }
    errors = validate_task_intake(task_data)
    if errors:
        return {"valid": False, "errors": errors}
    return {"valid": True, "errors": []}


# ---- Runs ----

@app.get("/api/runs", response_model=list[RunResponse])
def list_runs(
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
    task_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    query = db.query(models.Run)
    if task_id:
        query = query.filter(models.Run.task_id == task_id)
    if status:
        query = query.filter(models.Run.status == status)
    total = query.count()
    runs = query.order_by(models.Run.updated_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return runs


@app.post("/api/runs", response_model=RunResponse, status_code=201)
def create_run(data: RunCreate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    run = models.Run(
        id=str(uuid.uuid4()),
        task_id=data.task_id,
        status=models.RunStatus.CREATED,
        requested_baseline=data.requested_baseline,
        requested_candidate=data.requested_candidate,
        run_config=data.run_config,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@app.get("/api/runs/{run_id}", response_model=RunDetailResponse)
def get_run(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@app.patch("/api/runs/{run_id}", response_model=RunResponse)
def update_run(run_id: str, data: RunUpdate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    updates = data.model_dump(exclude_unset=True)
    expected_version = updates.pop("expected_version", None)
    if expected_version is not None and expected_version != run.version:
        raise HTTPException(status_code=409, detail=f"Stale write: expected version {run.version}")
    for key, value in updates.items():
        if hasattr(run, key):
            setattr(run, key, value)
    run.version = (run.version or 0) + 1
    db.commit()
    db.refresh(run)
    return run


@app.post("/api/runs/{run_id}/start")
async def start_run(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.status not in (models.RunStatus.CREATED, models.RunStatus.FAILED):
        raise HTTPException(status_code=409, detail=f"Cannot start run in status {run.status}")
    run.status = models.RunStatus.VALIDATING
    run.started_at = datetime.now(timezone.utc)
    run.updated_at = datetime.now(timezone.utc)
    run.version = (run.version or 0) + 1
    db.commit()

    async def _run_in_background(target_run_id: str):
        from backend.orchestrator import Orchestrator
        from backend.database import SessionLocal
        bg_db = SessionLocal()
        try:
            orchestrator = Orchestrator(bg_db)
            await orchestrator.execute(target_run_id)
        finally:
            bg_db.close()

    asyncio.create_task(_run_in_background(run.id))
    return {"run_id": run.id, "status": run.status.value, "message": "Run started"}



@app.post("/api/runs/{run_id}/cancel")
def cancel_run(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.status in (models.RunStatus.COMPLETED, models.RunStatus.FAILED, models.RunStatus.CANCELLED):
        raise HTTPException(status_code=409, detail=f"Run already in terminal state {run.status}")
    run.status = models.RunStatus.CANCELLED
    run.cancellation_info = {"cancelled_at": datetime.now(timezone.utc).isoformat(), "reason": "user_requested"}
    run.completed_at = datetime.now(timezone.utc)
    run.version = (run.version or 0) + 1
    db.commit()
    event_bus.publish(run_id, "run.cancelled", {"run_id": run_id, "ts": datetime.now(timezone.utc).isoformat()})
    return {"run_id": run_id, "status": "CANCELLED"}


@app.get("/api/runs/{run_id}/status", response_model=RunResponse)
def get_run_status(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@app.get("/api/runs/{run_id}/timeline", response_model=list[RunEventResponse])
def get_run_timeline(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    events = db.query(models.RunEvent).filter(models.RunEvent.run_id == run_id).order_by(models.RunEvent.sequence_number).all()
    return events


# ---- Evidence endpoints ----

@app.get("/api/runs/{run_id}/baseline", response_model=list[BaselineResponse])
def get_baseline(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Baseline).filter(models.Baseline.run_id == run_id).all()


@app.get("/api/runs/{run_id}/hypotheses", response_model=list[HypothesisResponse])
def get_hypotheses(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Hypothesis).filter(models.Hypothesis.run_id == run_id).all()


@app.get("/api/runs/{run_id}/experiments", response_model=list[ExperimentResponse])
def get_experiments(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Experiment).filter(models.Experiment.run_id == run_id).all()


@app.get("/api/runs/{run_id}/patches", response_model=list[PatchResponse])
def get_patches(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Patch).filter(models.Patch.run_id == run_id).all()


@app.get("/api/runs/{run_id}/gates", response_model=list[GateResponse])
def get_gates(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Gate).filter(models.Gate.run_id == run_id).order_by(models.Gate.execution_order).all()


@app.get("/api/runs/{run_id}/findings", response_model=list[FindingResponse])
def get_findings(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Finding).filter(models.Finding.run_id == run_id).all()


@app.get("/api/runs/{run_id}/ledger", response_model=list[LedgerEntryResponse])
def get_ledger(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    entries = db.query(models.LedgerEntry).filter(models.LedgerEntry.run_id == run_id).order_by(models.LedgerEntry.sequence_number).all()
    return [
        LedgerEntryResponse(
            sequence_number=e.sequence_number,
            event_type=e.event_type,
            timestamp=e.timestamp,
            entry_hash=e.entry_hash,
            previous_hash=e.previous_hash,
            payload=e.payload,
        )
        for e in entries
    ]


@app.post("/api/runs/{run_id}/ledger/verify", response_model=LedgerVerifyResponse)
def verify_ledger(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    entries = db.query(models.LedgerEntry).filter(models.LedgerEntry.run_id == run_id).order_by(models.LedgerEntry.sequence_number).all()
    if not entries:
        return LedgerVerifyResponse(valid=False, reason="No ledger entries", entry_count=0)
    from proofstack.core.ledger import entry_hash, GENESIS
    prev = GENESIS
    for i, e in enumerate(entries):
        if e.sequence_number != i:
            return LedgerVerifyResponse(valid=False, reason=f"Sequence gap at {i}", entry_count=len(entries))
        if e.previous_hash != prev:
            return LedgerVerifyResponse(valid=False, reason=f"Broken link at {i}", entry_count=len(entries))
        payload = {k: v for k, v in e.payload.items() if k != "hash"}
        computed = entry_hash(payload)
        if computed != e.entry_hash:
            return LedgerVerifyResponse(valid=False, reason=f"Tampered entry {i}", entry_count=len(entries))
        prev = e.entry_hash
    return LedgerVerifyResponse(valid=True, head_hash=prev, entry_count=len(entries))


@app.get("/api/runs/{run_id}/artifacts", response_model=list[ArtifactResponse])
def list_artifacts(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    return db.query(models.Artifact).filter(models.Artifact.run_id == run_id).all()


@app.get("/api/runs/{run_id}/artifacts/{artifact_id}")
def get_artifact(run_id: str, artifact_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    artifact = db.query(models.Artifact).filter(
        models.Artifact.id == artifact_id,
        models.Artifact.run_id == run_id,
    ).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    path = os.path.realpath(os.path.join(settings.artifact_dir, artifact.storage_key))
    artifact_root = os.path.realpath(settings.artifact_dir)
    try:
        common = os.path.commonpath([artifact_root, path])
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")
    if common != artifact_root:
        raise HTTPException(status_code=403, detail="Access denied")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Artifact file not found on disk")
    return FileResponse(path, media_type=artifact.media_type or "application/octet-stream",
                         filename=artifact.original_filename or os.path.basename(path))


# ---- SSE Events ----

@app.get("/api/runs/{run_id}/events")
async def stream_events(run_id: str, request: Request, api_key: str = Depends(verify_api_key)):
    run_id = run_id

    async def event_generator():
        yield ": connected\n\n"
        last_seq = -1
        while True:
            if await request.is_disconnected():
                break
            async for event in event_bus.subscribe(run_id, after_seq=last_seq):
                if await request.is_disconnected():
                    break
                if "seq" in event:
                    last_seq = event["seq"]
                yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                              headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ---- Report endpoints ----

@app.post("/api/runs/{run_id}/reports", response_model=ReportResponse, status_code=201)
def create_report(run_id: str, data: ReportCreate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.status not in (models.RunStatus.COMPLETED, models.RunStatus.FAILED, models.RunStatus.CANCELLED):
        raise HTTPException(status_code=409, detail=f"Cannot generate report for run in status {run.status}")

    from backend.report_service import ReportService
    report_service = ReportService(db)
    report = report_service.generate(run_id, data.report_format, data.schema_version)
    return report


@app.get("/api/runs/{run_id}/reports", response_model=list[ReportResponse])
def list_reports(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return db.query(models.Report).filter(models.Report.run_id == run_id).all()


@app.get("/api/runs/{run_id}/reports/{report_id}", response_model=ReportResponse)
def get_report(run_id: str, report_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.run_id == run_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ---- Decision endpoint ----

@app.get("/api/runs/{run_id}/decision", response_model=DecisionResponse)
def get_run_decision(run_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    decision = db.query(models.Decision).filter(models.Decision.run_id == run_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found for this run")
    return decision


# ---- Demo Fixtures (Isolated, Deterministic Walkthrough) ----

@app.post("/api/demo/seed", response_model=DemoSeedResponse)
def seed_demo(force: bool = False, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    from backend.demo_service import seed_demo_fixture
    result = seed_demo_fixture(db, force=force)
    return result


@app.post("/api/demo/reset")
def reset_demo(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    from backend.demo_service import reset_demo_fixture
    result = reset_demo_fixture(db)
    return result


@app.get("/api/demo/status")
def demo_status(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    from backend.demo_service import is_demo_seeded, DEMO_RUN_ID, DEMO_PROJECT_ID, DEMO_TASK_ID
    seeded = is_demo_seeded(db)
    return {
        "seeded": seeded,
        "demo_run_id": DEMO_RUN_ID if seeded else None,
        "demo_project_id": DEMO_PROJECT_ID if seeded else None,
        "demo_task_id": DEMO_TASK_ID if seeded else None,
    }


# ---- Model / AI Engineering Intelligence ----

@app.get("/api/model/status", response_model=ModelStatusResponse)
def get_model_status(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    from backend.model_service import ModelService
    svc = ModelService(db)
    return svc.get_status()


@app.post("/api/runs/{run_id}/analyze", response_model=ModelAnalyzeResponse)
async def analyze_run(
    run_id: str,
    data: Optional[ModelAnalyzeRequest] = None,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    force_fallback = data.force_fallback if data else False
    from backend.model_service import ModelService
    svc = ModelService(db)
    try:
        result = await svc.generate_hypotheses_for_run(run_id, force_fallback=force_fallback)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model analysis failed: {str(exc)}")


@app.post("/api/runs/{run_id}/propose-patch", response_model=ModelPatchResponse)
async def propose_patch(
    run_id: str,
    data: Optional[ModelPatchRequest] = None,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    hyp_id = data.hypothesis_id if data else None
    force_fallback = data.force_fallback if data else False
    from backend.model_service import ModelService
    svc = ModelService(db)
    try:
        result = await svc.propose_patch_for_run(run_id, hypothesis_id=hyp_id, force_fallback=force_fallback)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Patch proposal failed: {str(exc)}")

