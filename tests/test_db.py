"""Database tests: schema, constraints, ledger, events."""
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend import models
from backend.ledger_service import LedgerService


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_create_project(db):
    p = models.Project(id=str(uuid.uuid4()), name="Test", repository_path="/tmp/repo")
    db.add(p)
    db.commit()
    assert p.id is not None
    assert p.name == "Test"


def test_project_task_relationship(db):
    p = models.Project(id=str(uuid.uuid4()), name="Test", repository_path="/tmp/repo")
    db.add(p)
    db.commit()
    t = models.Task(
        id=str(uuid.uuid4()), project_id=p.id, name="Task1",
        target_file="app.py", target_symbol="foo",
        baseline_commit="abc1234",
        benchmark_command=["python", "-m", "pyperf"],
        workload_seed=42, test_command=["pytest"],
        protected_paths=["tests/"],
    )
    db.add(t)
    db.commit()
    assert t.project_id == p.id
    assert p.tasks[0].id == t.id


def test_run_creation(db):
    p = models.Project(id=str(uuid.uuid4()), name="Test", repository_path="/tmp/repo")
    db.add(p)
    db.commit()
    t = models.Task(
        id=str(uuid.uuid4()), project_id=p.id, name="Task1",
        target_file="app.py", target_symbol="foo",
        baseline_commit="abc1234",
        benchmark_command=["python", "-m", "pyperf"],
        workload_seed=42, test_command=["pytest"],
        protected_paths=["tests/"],
    )
    db.add(t)
    db.commit()
    r = models.Run(
        id=str(uuid.uuid4()), task_id=t.id,
        requested_baseline="abc1234",
    )
    db.add(r)
    db.commit()
    assert r.status == models.RunStatus.CREATED


def test_ledger_append_and_verify(db):
    run_id = str(uuid.uuid4())
    ledger = LedgerService(db)
    e1 = ledger.append(run_id, "RUN_STARTED", {"run_id": run_id})
    e2 = ledger.append(run_id, "BASELINE", {"run_id": run_id, "median_ns": 1000000})
    assert e1.sequence_number == 0
    assert e2.sequence_number == 1
    assert e2.previous_hash == e1.entry_hash
    ok, head = ledger.verify_chain(run_id)
    assert ok is True
    assert head is not None


def test_ledger_tamper_detection(db):
    run_id = str(uuid.uuid4())
    ledger = LedgerService(db)
    e1 = ledger.append(run_id, "RUN_STARTED", {"run_id": run_id})
    e2 = ledger.append(run_id, "BASELINE", {"run_id": run_id, "median_ns": 1000000})
    e2.payload = {**e2.payload, "median_ns": 9999999}
    db.commit()
    ok, reason = ledger.verify_chain(run_id)
    assert ok is False
    assert "tampered" in reason


def test_baseline_samples(db):
    run_id = str(uuid.uuid4())
    b = models.Baseline(
        id=str(uuid.uuid4()), run_id=run_id,
        source_revision="abc1234", benchmark_config={}, seed=42,
    )
    db.add(b)
    db.commit()
    for i in range(10):
        s = models.BaselineSample(
            id=str(uuid.uuid4()), baseline_id=b.id,
            sample_index=i, measurement_name="wall_time",
            value_ns=1000000 + i * 1000,
        )
        db.add(s)
    db.commit()
    assert len(b.samples) == 10


def test_unique_event_sequence(db):
    run_id = str(uuid.uuid4())
    from datetime import datetime, timezone
    e1 = models.RunEvent(
        id=str(uuid.uuid4()), run_id=run_id, sequence_number=0,
        event_type="run.started", timestamp=datetime.now(timezone.utc), payload={},
    )
    db.add(e1)
    db.commit()
    with pytest.raises(Exception):
        e2 = models.RunEvent(
            id=str(uuid.uuid4()), run_id=run_id, sequence_number=0,
            event_type="run.started", timestamp=datetime.now(timezone.utc), payload={},
        )
        db.add(e2)
        db.commit()


def test_artifact_path_traversal_protection(db):
    run_id = str(uuid.uuid4())
    a = models.Artifact(
        id=str(uuid.uuid4()), run_id=run_id,
        artifact_type="report", storage_key="../../etc/passwd",
        size_bytes=100,
    )
    db.add(a)
    db.commit()
    assert a.storage_key == "../../etc/passwd"
